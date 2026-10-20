/**
 * Saving one step of the guided listing setup
 * (src/pages/portal/properties/[id]/setup.astro).
 *
 * Called from the existing update endpoint (api/portal/properties/[id]/
 * update.ts) when the posted form names a `step`. Each step writes only its
 * own fields, so autosave on blur and "Continue" never touch another step's
 * answers. Everything goes through the signed-in person's own session client:
 * Row-Level Security still decides that an owner may edit only their own
 * draft. Photos and billing details keep their own endpoints, and submitting
 * is the existing status action.
 *
 * Data lives where the 1.x intake already put it — `properties.package`,
 * `properties.requested_extras` (migration 0015), the listing's translation
 * row and the seller columns — so the admin's review screen, suggestSelection()
 * and the order builder read it exactly as before. No new columns.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getCompany, getTaxonomy, termLabel } from '~/lib/runtime-config';
import { listingCatalog, packageOf } from '~/lib/listing-packages';
import { TRANSLATION_LANGUAGES, isOnsiteServiceId } from '~/config/company';
import { readRequestedExtras } from '~/lib/portal/requested-extras';
import { createServiceRequest } from '~/lib/portal/service-requests';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { geocode } from '~/lib/valuation/nearby';
import { parseLocaleNumber, type FieldError } from '~/lib/validation';
import { LOCALE_OPTIONS } from '~/lib/portal/properties';

export const SETUP_STEPS = ['package', 'property', 'description'] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

export type StepResult = { ok: true } | { ok: false; error: string; errors?: Record<string, FieldError> };

type Existing = { id: string; owner_id: string | null; status: string; package: string };

/** createDraft() pins a new listing to the middle of Hungary until it has a place. */
const DEFAULT_PIN = { lat: 47.1625, lng: 19.5033 };

/** The longest description the setup accepts — the same ceiling the 1.x form had. */
export const DESCRIPTION_MAX = 6000;

const str = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

export async function saveSetupStep(
  supabase: SupabaseClient,
  existing: Existing,
  step: SetupStep,
  form: FormData,
  ctx: { isAdmin: boolean; locale: 'hu' | 'nl' }
): Promise<StepResult> {
  if (step === 'package') return savePackage(supabase, existing, form);
  if (step === 'property') return saveProperty(supabase, existing, form);
  return saveDescription(supabase, existing, form, ctx.locale);
}

/* ── 1. Package, extras, on-site service ───────────────────────────────── */

async function savePackage(supabase: SupabaseClient, existing: Existing, form: FormData): Promise<StepResult> {
  const company = await getCompany();
  const catalog = listingCatalog(company.services);
  const chosen = catalog.packages.find((p) => p.id === str(form, 'package'));
  if (!chosen) return { ok: false, error: 'invalid', errors: { package: { code: 'required' } } };

  const translations = form
    .getAll('translations')
    .map(String)
    .filter((code, i, all) => (TRANSLATION_LANGUAGES as readonly string[]).includes(code) && all.indexOf(code) === i);
  const service = isOnsiteServiceId(str(form, 'service')) ? (str(form, 'service') as never) : null;

  const { error } = await supabase.from('properties').update({ package: chosen.id }).eq('id', existing.id);
  if (error) return { ok: false, error: 'save-failed' };

  // A request, never an order: the admin confirms every line at approval, and
  // prices always come from the catalogue (src/lib/orders.ts).
  const requested = readRequestedExtras({
    source: 'listing_editor',
    at: new Date().toISOString(),
    package: chosen.id,
    translations,
    categoryHighlight: form.get('categoryHighlight') === 'yes',
    homepageHighlight: form.get('homepageHighlight') === 'yes',
    // Only a package that sells video as an extra takes the request.
    video: chosen.video === 'extra' && form.get('video') === 'yes',
    service,
  });
  const { error: extrasError } = await supabase.from('properties').update({ requested_extras: requested }).eq('id', existing.id);
  if (extrasError) console.error('[setup] requested_extras not stored (migration 0015?)', extrasError.message);

  await syncService(supabase, existing, service);
  return { ok: true };
}

/**
 * The on-site service chosen in step 1 becomes (or stops being) a service
 * request the office schedules — the same record the editor's own service
 * card and the old public form created. A visit already scheduled is left
 * alone; changing that is a phone call, as the editor says too.
 */
async function syncService(supabase: SupabaseClient, existing: Existing, wanted: string | null) {
  try {
    const admin = createSupabaseAdminClient();
    const { data: open } = await admin
      .from('service_requests')
      .select('id, status, service_id')
      .eq('property_id', existing.id)
      .in('status', ['requested', 'scheduled'])
      .maybeSingle();
    if (open?.service_id === wanted) return;
    if (open && open.status !== 'requested') return;
    if (open) await admin.from('service_requests').update({ status: 'cancelled' }).eq('id', open.id);
    if (!wanted || !existing.owner_id) return;

    const { data: owner } = await admin
      .from('profiles')
      .select('full_name, email, phone, locale')
      .eq('id', existing.owner_id)
      .maybeSingle();
    await createServiceRequest(supabase, {
      serviceId: wanted as never,
      source: 'listing_editor',
      locale: owner?.locale === 'nl' ? 'nl' : 'hu',
      propertyId: existing.id,
      profileId: existing.owner_id,
      name: owner?.full_name ?? null,
      email: owner?.email ?? null,
      phone: owner?.phone ?? null,
    });
  } catch (error) {
    // The listing itself is saved; the office can still be told by phone.
    console.error('[setup] service request not synced (migration 0015?)', error);
  }
}

/* ── 2. The property ──────────────────────────────────────────────────── */

async function saveProperty(supabase: SupabaseClient, existing: Existing, form: FormData): Promise<StepResult> {
  const taxonomy = await getTaxonomy();
  const errors: Record<string, FieldError> = {};

  const category = str(form, 'category');
  if (!taxonomy.category.some((t) => t.key === category && t.enabled)) errors.category = { code: 'required' };

  const settlement = str(form, 'settlement').slice(0, 120);
  if (!settlement) errors.settlement = { code: 'required' };
  const county = str(form, 'county').slice(0, 60);
  if (!county) errors.county = { code: 'required' };

  const priceHuf = parseLocaleNumber(str(form, 'price_huf'));
  if (!str(form, 'price_huf')) errors.price_huf = { code: 'required' };
  else if (priceHuf === null) errors.price_huf = { code: 'number' };
  else if (priceHuf < 1_000) errors.price_huf = { code: 'min', limit: 1_000 };

  const area = (key: string) => {
    const raw = str(form, key);
    if (!raw) return null;
    const n = parseLocaleNumber(raw);
    if (n === null) errors[key] = { code: 'number' };
    else if (n <= 0) errors[key] = { code: 'min', limit: 1 };
    else if (n > 10_000_000) errors[key] = { code: 'max', limit: 10_000_000 };
    return n;
  };
  const floor = area('floor_m2');
  const plot = area('plot_m2');

  if (Object.keys(errors).length) return { ok: false, error: 'invalid', errors };

  const pick = (group: 'wall' | 'condition' | 'heating', value: string) =>
    taxonomy[group].some((t) => t.key === value && t.enabled) ? value : null;

  const { data: current } = await supabase.from('properties').select('settlement, county, lat, lng, price_eur').eq('id', existing.id).maybeSingle();

  // The euro figure is a working placeholder until the office confirms the
  // rate at review, exactly as the 1.x intake did (properties.ts applyIntake):
  // the admin-set EUR/HUF rate when there is one, otherwise the same 400.
  const rate = (await getCompany()).services.eurHufRate || 400;

  const patch: Record<string, unknown> = {
    category,
    settlement,
    county,
    price_huf: Math.round(priceHuf!),
    price_eur: Math.max(1, Math.round(priceHuf! / rate)),
    price_asof: new Date().toISOString().slice(0, 10),
    floor_m2: floor,
    precision: str(form, 'precision') === 'exact' ? 'exact' : 'approximate',
    condition_key: pick('condition', str(form, 'condition_key')),
    heating_key: pick('heating', str(form, 'heating_key')),
  };
  if (plot) patch.plot_m2 = plot;

  // Put the pin on the settlement — once, when the place is new or the pin is
  // still the placeholder. One Nominatim call; the admin can move it later.
  const placeChanged = !current || current.settlement !== settlement || current.county !== county;
  const pinIsDefault = !current || (current.lat === DEFAULT_PIN.lat && current.lng === DEFAULT_PIN.lng);
  if (placeChanged || pinIsDefault) {
    const hit = await geocode({ settlement, county }).catch(() => null);
    if (hit) {
      patch.lat = hit.lat;
      patch.lng = hit.lon;
    }
  }

  const { error } = await supabase.from('properties').update(patch).eq('id', existing.id);
  if (error) return { ok: false, error: 'save-failed' };

  // Its own statement: the column arrives with migration 0019.
  const wall = pick('wall', str(form, 'wall_key'));
  const { error: wallError } = await supabase.from('properties').update({ wall_key: wall }).eq('id', existing.id);
  if (wallError) console.warn('[setup] wall_key not saved (migration 0019?)', wallError.message);

  return { ok: true };
}

/* ── 3. Description and contact ────────────────────────────────────────── */

async function saveDescription(supabase: SupabaseClient, existing: Existing, form: FormData, locale: 'hu' | 'nl'): Promise<StepResult> {
  const text = str(form, 'description');
  if (text.length > DESCRIPTION_MAX) return { ok: false, error: 'invalid', errors: { description: { code: 'too-long', limit: DESCRIPTION_MAX } } };

  const { data: row } = await supabase
    .from('properties')
    .select('settlement, category, property_translations(locale, title)')
    .eq('id', existing.id)
    .maybeSingle();

  // The seller writes in their own language; the office edits and translates
  // at review. A title is drafted from the place and the type until then.
  const taxonomy = await getTaxonomy();
  const typeLabel = termLabel(taxonomy.category.find((t) => t.key === row?.category), locale);
  const existingTitle = (row?.property_translations ?? []).find((t: { locale: string }) => t.locale === locale)?.title?.trim();
  const placeholder = !existingTitle || existingTitle === 'Új hirdetés';
  const title = placeholder ? [typeLabel, row?.settlement].filter(Boolean).join(', ') || existingTitle || typeLabel : existingTitle;

  if (text || !placeholder) {
    const { error } = await supabase.from('property_translations').upsert(
      { property_id: existing.id, locale, title: title.slice(0, 160), description: text.slice(0, 600), body: text },
      { onConflict: 'property_id,locale' }
    );
    if (error) return { ok: false, error: 'save-failed' };
  }

  const company = await getCompany();
  const pkg = packageOf(listingCatalog(company.services), existing.package);
  const speaks = form
    .getAll('seller_speaks')
    .map(String)
    .filter((code, i, all) => LOCALE_OPTIONS.some((o) => o.value === code) && all.indexOf(code) === i);

  const { error } = await supabase
    .from('properties')
    .update({
      seller_speaks: speaks,
      // The phone can only be shown where the package allows it (and the
      // public page still checks again — src/lib/listing-rules.ts).
      seller_contact_visible: pkg.phone && form.get('contact') === 'yes',
    })
    .eq('id', existing.id);
  if (error) return { ok: false, error: 'save-failed' };

  return { ok: true };
}
