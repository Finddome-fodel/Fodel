/**
 * Buying translations for a live listing: a small order of its own (a package
 * line and/or lines of single languages, each naming its languages), paid by card with the same
 * Stripe Checkout the rest of the site uses. The webhook recognises it by its
 * lines (translation-orders.ts) and queues exactly those languages once the
 * payment settles. The price comes from the catalogue, never from the browser.
 */
import type { Locale } from '~/i18n/ui';
import { buildOrderLines, orderTotalCents, OrderError, type OrderLine } from '~/lib/orders';
import { getStripe } from '~/lib/stripe';
import { getCompany } from '~/lib/runtime-config';
import { listingCatalog, sellingPackages } from '~/lib/listing-packages';
import { isPackageKey, tierIndexFor } from '~/lib/listing-pricing';
import { upgradeTerm } from '~/lib/portal/package-terms';
import { TRANSLATION_LINE_IDS, grantedLocales } from '~/lib/translation-packages';
import { ALL_LOCALES } from './translate-core';
import { loadEntitlement } from './translation-entitlement';
import { isTranslationOrder } from './translation-orders';

/** What a person asks to buy: ids only. The price is the catalogue's. */
export type TranslationChoice = { packageId: string; extraLocales: string[]; excludedLocales: string[] };

export type TranslationOrder = { id: string; amount_cents: number; line_items: OrderLine[]; stripe_session_id: string | null };

/**
 * Replaces whatever translation order was still open with one for exactly these
 * languages: a person who changes their mind never leaves two debts or two live
 * payment links behind. The listing's own first order is never touched.
 */
export async function openTranslationOrder(
  admin: any,
  property: { id: string; owner_id: string | null; price_huf?: number | null; package?: string | null; package_months?: number | null; price_tier_index?: number | null; expires_at?: string | null },
  choice: TranslationChoice,
  locale: Locale
): Promise<TranslationOrder> {
  const { data: open } = await admin
    .from('payments')
    .select('id, line_items, stripe_session_id')
    .eq('property_id', property.id)
    .eq('status', 'pending');
  for (const earlier of (open ?? []).filter((row: any) => isTranslationOrder(row.line_items))) {
    if (earlier.stripe_session_id) await getStripe().checkout.sessions.expire(earlier.stripe_session_id).catch(() => {});
    await admin.from('payments').update({ status: 'cancelled' }).eq('id', earlier.id).eq('status', 'pending');
  }

  const catalog = listingCatalog((await getCompany()).services);
  if (catalog.pricingLive) return insertOrder(admin, property, upgradeLines(property, choice, catalog, locale, await loadEntitlement(admin, property.id).catch(() => null)), locale);

  // What the listing already holds: a bigger package costs the difference, and a language it has or bought is not sold twice.
  const held = await loadEntitlement(admin, property.id).catch(() => null);
  const alreadyHeld = new Set(held ? [...grantedLocales(held.listing, catalog.translation, ALL_LOCALES), ...held.rows.filter((row) => row.title.trim() || row.description.trim()).map((row) => row.locale)] : []);
  // buildOrderLines wants a package; only the translation lines are kept and charged.
  const lines = buildOrderLines({
    packageId: catalog.packages.find((p) => p.legacy)!.id,
    priceHuf: property.price_huf ?? null,
    extras: [],
    translation: {
      packageId: choice.packageId,
      extraLocales: choice.extraLocales.filter((code) => !alreadyHeld.has(code)),
      excludedLocales: choice.excludedLocales,
      sourceLocale: held?.listing.sourceLocale ?? 'hu',
      currentPackageId: held?.listing.translationPackage ?? null,
    },
  }, locale, catalog).filter((line) => TRANSLATION_LINE_IDS.includes(line.id));
  if (lines.length === 0) throw new Error('nothing-to-order');
  return insertOrder(admin, property, lines, locale);
}

/** An upgrade to a bigger package: the difference for the same term, inside the band the listing was bought in (Q6). */
function upgradeLines(
  property: { price_huf?: number | null; package?: string | null; package_months?: number | null; price_tier_index?: number | null; expires_at?: string | null },
  choice: TranslationChoice, catalog: ReturnType<typeof listingCatalog>, locale: Locale, held: Awaited<ReturnType<typeof loadEntitlement>>
): OrderLine[] {
  const from = property.package && isPackageKey(property.package) ? property.package : 'basic';
  const months = upgradeTerm(property, catalog.pricing.durations);
  const tierIndex = typeof property.price_tier_index === 'number' ? property.price_tier_index : tierIndexFor(catalog.pricing, property.price_huf);
  if (!isPackageKey(choice.packageId) || !sellingPackages(catalog).some((pkg) => pkg.id === choice.packageId)) throw new OrderError('unknown-package');
  const lines = buildOrderLines({
    packageId: choice.packageId, upgradeFrom: from, months, tierIndex, priceHuf: property.price_huf ?? null, extras: [],
    translation: { packageId: choice.packageId, excludedLocales: choice.excludedLocales, sourceLocale: held?.listing.sourceLocale ?? 'hu' },
  }, locale, catalog);
  if (lines.length === 0 || lines[0].unitCents <= 0) throw new Error('nothing-to-order');
  return lines;
}

async function insertOrder(admin: any, property: { id: string; owner_id: string | null }, lines: OrderLine[], locale: Locale): Promise<TranslationOrder> {
  const base = {
    property_id: property.id,
    owner_id: property.owner_id,
    amount_cents: orderTotalCents(lines),
    currency: 'eur',
    status: 'pending',
    line_items: lines,
    due_at: new Date(Date.now() + 14 * 86_400_000).toISOString(),
  };
  const { data, error } = await admin.from('payments').insert({ ...base, kind: 'listing', locale }).select('id, amount_cents, line_items, stripe_session_id').single();
  if (error || !data) throw new Error(error?.message ?? 'translation-order-failed');
  return data;
}

export async function translationCheckoutUrl(admin: any, order: TranslationOrder, property: { id: string; ref: string }, origin: string): Promise<string> {
  const stripe = getStripe();
  const back = `${origin}/portal/properties/${property.id}`;
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      adaptive_pricing: { enabled: false },
      line_items: order.line_items.map((line) => ({
        price_data: { currency: 'eur', unit_amount: line.unitCents, product_data: { name: line.label } },
        quantity: line.quantity,
      })),
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      success_url: `${back}?translations=paid#translations-panel`,
      cancel_url: `${back}?translations=cancelled#translations-panel`,
      client_reference_id: order.id,
      // The webhook trusts the stored order, not this.
      metadata: { orderId: order.id, propertyId: property.id, ref: property.ref, kind: 'translation' },
    },
    { idempotencyKey: `translation-${order.id}` }
  );
  await admin.from('payments').update({ stripe_session_id: session.id }).eq('id', order.id);
  if (!session.url) throw new Error('stripe-no-url');
  return session.url;
}
