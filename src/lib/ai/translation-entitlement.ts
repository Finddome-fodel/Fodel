/**
 * What a listing is entitled to, and making it so: applying a paid package or single languages, an admin's grant,
 * switching languages off and on, and queueing the languages a package includes (Basic for every listing).
 *
 * The rules themselves (which languages a package covers, what is left after an exclusion) are the pure ones in
 * src/lib/translation-packages.ts; what is published where is src/lib/listing-languages.ts. This file only
 * reads and writes `properties` (translation_package, extra_locales, excluded_locales, migration 0053) with the
 * service client, and queues jobs. Every function does nothing, quietly, before migration 0053.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { logEvent } from '~/lib/activity';
import { ALL_LOCALES, pickSource } from './translate-core';
import {
  cleanExclusions, entitledLocales, grantedLocales, packageById, packageLocales, type ListingLanguages, type TranslationPackageId, type TranslationPricing,
} from '~/lib/translation-packages';

type Client = SupabaseClient<any, any, any>;

/** The languages a listing can be translated into: every language of the site (the original is taken off per listing). */
const TARGETS: readonly string[] = ALL_LOCALES;

/** Package ranks: a purchase never moves a listing to a smaller package. */
const RANK: Record<string, number> = { basic: 0, europe: 1, world: 2 };

export type Entitlement = { listing: ListingLanguages; rows: { locale: string; title: string; description: string; machine: boolean }[] };

/** The listing's current entitlement, or null before migration 0053 (or for an unknown listing). */
export async function loadEntitlement(client: Client, propertyId: string): Promise<Entitlement | null> {
  const { data: row, error } = await client.from('properties').select('*').eq('id', propertyId).maybeSingle();
  if (error || !row || !('translation_package' in row)) return null;
  const { data: rows } = await client.from('property_translations').select('locale, title, description, body, machine, translated_from, manual_override').eq('property_id', propertyId);
  const list = (rows ?? []) as any[];
  const source = pickSource(list);
  const written = list.filter((r) => !r.machine && !r.translated_from && !r.manual_override && (r.title?.trim() || r.description?.trim())).map((r) => r.locale as string);
  return {
    listing: {
      translationPackage: row.translation_package ?? 'basic',
      extraLocales: row.extra_locales ?? [],
      excludedLocales: row.excluded_locales ?? [],
      writtenLocales: written,
      sourceLocale: source?.locale ?? 'hu',
    },
    rows: list.map((r) => ({ locale: r.locale, title: r.title ?? '', description: r.description ?? '', machine: Boolean(r.machine) })),
  };
}

const hasText = (rows: Entitlement['rows'], locale: string): boolean =>
  rows.some((row) => row.locale === locale && (row.title.trim() || row.description.trim()));

/**
 * What an order bought: the package (if any), the single languages, the languages the package line covers, and the
 * languages the buyer switched off WHEN THEY ORDERED (`excludedAtOrder`, written on the frozen line). `orderId` makes
 * applying it one-shot. An older order without the field switched nothing off.
 */
export type Purchase = { packageId: TranslationPackageId | null; singles: string[]; packageLocalesPaid?: string[]; excludedAtOrder?: string[]; orderId?: string };

/**
 * A settled payment becomes entitlement: the package (never a smaller one than the listing already has), the
 * single languages, and the languages the buyer switched off when they ordered (the order line's own snapshot, so a
 * package an admin changed in between never excludes a language the buyer never saw).
 *
 * The package and the single languages only ever grow, so applying them again is harmless. Switching languages OFF is
 * not: a Stripe retry, a second "Fizetve" click or the publish path calling again must not switch off a language the
 * owner has since switched back on. So the exclusion step runs once per order: the first caller claims the order in
 * the activity log (`translation.entitlement_applied`, unique per order) and only that caller excludes.
 */
export async function applyPurchase(client: Client, propertyId: string, purchase: Purchase, cfg: TranslationPricing): Promise<boolean> {
  const current = await loadEntitlement(client, propertyId);
  if (!current) return false;
  const have = current.listing.translationPackage ?? 'basic';
  const nextPackage = purchase.packageId && (RANK[purchase.packageId] ?? 0) > (RANK[have] ?? 0) ? purchase.packageId : have;
  const covered = new Set(packageLocales(packageById(cfg, nextPackage), TARGETS));
  const extras = [...new Set([...(current.listing.extraLocales ?? []), ...purchase.singles])].filter((code) => TARGETS.includes(code) && !covered.has(code));

  let firstTime = true;
  let claimed = false;
  const claimKey = purchase.orderId ? `entitlement-${purchase.orderId}` : null;
  if (claimKey) {
    const { error: claimError } = await client.from('activity_events').insert({
      kind: 'translation.entitlement_applied', subject_type: 'payment', subject_id: purchase.orderId, property_id: propertyId,
      source: 'system', payload: { package: purchase.packageId, excluded: purchase.excludedAtOrder ?? [] }, dedupe_key: claimKey,
    });
    // Only a duplicate key (23505) means this order was applied before: nothing may be switched off a second time.
    // Any other error (the log table is missing, an outage) is not proof of an earlier application, so the order is
    // treated as the first one, without a claim. The package and the languages are (re)stored below either way.
    if (claimError?.code === '23505') firstTime = false;
    else if (!claimError) claimed = true;
  }

  // What the buyer switched off before paying: never English, never the original, only languages the package has.
  const snapshot = firstTime && purchase.packageId
    ? (purchase.excludedAtOrder ?? []).filter((code) => TARGETS.includes(code) && code !== current.listing.sourceLocale && code !== 'en' && covered.has(code))
    : [];
  // A language bought on its own is on, whatever it was before.
  const excluded = [...new Set([...(current.listing.excludedLocales ?? []), ...snapshot])].filter((code) => !purchase.singles.includes(code));
  const { error } = await client
    .from('properties')
    .update({ translation_package: nextPackage, extra_locales: extras, excluded_locales: excluded })
    .eq('id', propertyId);
  if (error && claimKey && claimed) {
    // Not applied: release the claim so the next delivery can try again.
    await client.from('activity_events').delete().eq('dedupe_key', claimKey).then(() => {}, () => {});
  }
  return !error;
}

/** An admin's decision to publish a language for free (translating it for the listing, approving an owner's request). Returns the languages newly granted. */
export async function grantLocales(client: Client, propertyId: string, locales: string[], cfg: TranslationPricing, opts: { lift?: boolean } = {}): Promise<string[]> {
  const current = await loadEntitlement(client, propertyId);
  if (!current) return [];
  const already = new Set(grantedLocales(current.listing, cfg, TARGETS));
  const fresh = [...new Set(locales)].filter((code) => TARGETS.includes(code) && code !== current.listing.sourceLocale && !already.has(code));
  // Granting a language on purpose also takes it off the "switched off" list: the admin wants it live. A language
  // that was switched off stays off when a job simply finishes (opts.lift false): re-including is its own decision.
  const off = (current.listing.excludedLocales ?? []).filter((code) => opts.lift === false || !locales.includes(code));
  if (fresh.length === 0 && off.length === (current.listing.excludedLocales ?? []).length) return [];
  const { error } = await client
    .from('properties')
    .update({ extra_locales: [...new Set([...(current.listing.extraLocales ?? []), ...fresh])], excluded_locales: off })
    .eq('id', propertyId);
  return error ? [] : fresh;
}

export type ExclusionResult =
  | { ok: true; excluded: string[]; added: string[]; removed: string[]; queued: string[] }
  | { ok: false; error: 'exclude-en' | 'is-source' | 'schema-missing' | 'save-failed' };

/**
 * Sets the languages switched off for a listing. Only languages the listing is entitled to can be switched off,
 * never the original and never English (a forged request naming English is refused). Switching a language off
 * cancels its waiting jobs; switching one back on queues it when there is no text yet (no new charge: it is
 * within the entitlement). The text of a switched-off language is kept.
 */
export async function setExclusions(
  client: Client, propertyId: string, requested: string[], cfg: TranslationPricing, actor: { id: string | null; email: string | null }, kickOrigin?: string
): Promise<ExclusionResult> {
  const current = await loadEntitlement(client, propertyId);
  if (!current) return { ok: false, error: 'schema-missing' };
  const cleaned = cleanExclusions(requested, current.listing, cfg, TARGETS);
  if (cleaned.problem) return { ok: false, error: cleaned.problem };
  const before = new Set(current.listing.excludedLocales ?? []);
  const after = new Set(cleaned.excluded);
  const added = cleaned.excluded.filter((code) => !before.has(code));
  const removed = [...before].filter((code) => !after.has(code));
  if (added.length || removed.length) {
    const { error } = await client.from('properties').update({ excluded_locales: cleaned.excluded }).eq('id', propertyId);
    if (error) return { ok: false, error: 'save-failed' };
  }
  if (added.length) {
    await client
      .from('translation_jobs')
      .update({ status: 'cancelled', last_error: 'Kizárva a hirdető kérésére.', finished_at: new Date().toISOString() })
      .eq('property_id', propertyId)
      .in('locale', added)
      .in('status', ['requested', 'queued']);
  }
  let queued: string[] = [];
  if (removed.length) {
    const entitled = new Set(entitledLocales({ ...current.listing, excludedLocales: cleaned.excluded }, cfg, TARGETS));
    const missing = removed.filter((code) => entitled.has(code) && !hasText(current.rows, code));
    if (missing.length) queued = (await queuePackageJobs(client, propertyId, missing, kickOrigin)) ?? [];
  }
  for (const [kind, list] of [['excluded', added], ['included', removed]] as const) {
    if (list.length === 0) continue;
    await logEvent({
      kind: 'translation.exclude', actorId: actor.id, actorEmail: actor.email, subjectType: 'property', subjectId: propertyId, propertyId,
      source: 'portal', payload: { action: kind, locales: list },
    }).catch(() => {});
  }
  return { ok: true, excluded: cleaned.excluded, added, removed, queued };
}

/** Jobs (origin 'package', no charge: within the entitlement) for languages that have no text yet. Returns the languages queued. */
async function queuePackageJobs(client: Client, propertyId: string, locales: string[], kickOrigin?: string): Promise<string[] | null> {
  try {
    const { enqueueTranslations, kickTranslation } = await import('./translation-jobs');
    const result = await enqueueTranslations(client, { propertyId, locales, origin: 'package', status: 'queued' });
    if (result.created.length > 0 && kickOrigin) await kickTranslation(kickOrigin);
    return result.created;
  } catch (error) {
    console.error(`[translate] package languages not queued for ${propertyId}`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Queues what a listing is entitled to and does not have yet: English and German for every listing (Basic), and
 * whatever else was bought. Called when a listing goes live and from the admin's "Basic nyelvek pótlása". Safe to
 * call twice: a language with text or a live job is skipped. Nothing before migration 0053.
 */
export async function ensurePackageTranslations(client: Client, propertyId: string, cfg: TranslationPricing, kickOrigin?: string): Promise<string[]> {
  const current = await loadEntitlement(client, propertyId);
  if (!current) return [];
  // Nothing to translate from: a listing with no source text yet.
  if (!current.rows.some((row) => !row.machine && (row.title.trim() || row.description.trim()))) return [];
  const missing = entitledLocales(current.listing, cfg, TARGETS).filter((code) => !hasText(current.rows, code));
  if (missing.length === 0) return [];
  return (await queuePackageJobs(client, propertyId, missing, kickOrigin)) ?? [];
}


/**
 * The exclusions an owner chose in the wizard (kept with the draft in `requested_extras.excludedLocales`), stored
 * on the listing when it is approved. Only languages the listing is entitled to now can be switched off here;
 * the ones of a package still to be paid are carried by the package line (applyPurchase). Adds to what is
 * switched off already, never removes. Never throws; quietly nothing before migration 0053.
 */
export async function applyRequestedExclusions(client: Client, propertyId: string, requested: string[], cfg: TranslationPricing): Promise<boolean> {
  if (requested.length === 0) return false;
  const current = await loadEntitlement(client, propertyId);
  if (!current) return false;
  const cleaned = cleanExclusions([...new Set([...(current.listing.excludedLocales ?? []), ...requested])], current.listing, cfg, TARGETS);
  if (cleaned.problem) return false;
  const before = new Set(current.listing.excludedLocales ?? []);
  if (cleaned.excluded.length === before.size && cleaned.excluded.every((code) => before.has(code))) return false;
  const { error } = await client.from('properties').update({ excluded_locales: cleaned.excluded }).eq('id', propertyId);
  return !error;
}

/** The exclusions the owner asked for in the wizard, read defensively (rows before the wizard have none). */
export async function requestedExclusions(client: Client, propertyId: string): Promise<string[]> {
  const { data } = await client.from('properties').select('requested_extras').eq('id', propertyId).maybeSingle();
  const raw = (data as any)?.requested_extras?.excludedLocales;
  return Array.isArray(raw) ? raw.filter((code: unknown): code is string => typeof code === 'string') : [];
}
