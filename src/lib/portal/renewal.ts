/**
 * Paying for a renewal — the existing 'renewal-6m' catalogue extra, as its own
 * small order. Card when STRIPE_ENABLED (the webhook settles it and calls
 * renewProperty), otherwise bank transfer: the order waits as `pending` and an
 * admin's "mark paid" on the Fizetések page renews the listing.
 *
 * One open renewal order per listing: a second click reuses it rather than
 * creating a second debt.
 */
import type { Locale } from '~/i18n/ui';
import { buildOrderLines, orderTotalCents, type OrderLine } from '~/lib/orders';
import { getStripe } from '~/lib/stripe';
import { getCompany } from '~/lib/runtime-config';
import { listingCatalog, extraPrice, type ListingCatalog } from '~/lib/listing-packages';
import { renewalQuote } from '~/lib/portal/package-terms';

/** The term the reminder e-mails and the renewal page quote first: six months when offered, else the longest. */
export const defaultRenewalMonths = (catalog: ListingCatalog): number => (catalog.pricing.durations.includes(6) ? 6 : Math.max(...catalog.pricing.durations));

type Renewable = { price_huf?: number | null; package?: string | null };

function priceIn(catalog: ListingCatalog, property: Renewable, months?: number): number {
  if (catalog.pricingLive) {
    const quote = renewalQuote(catalog, property, months ?? defaultRenewalMonths(catalog));
    if (quote) return quote.cents;
  }
  // Before the pricing migrations (or if the term is not sold): the flat six-month renewal, as it always was.
  return extraPrice(catalog, 'renewal-6m', property.price_huf) * 100;
}

/**
 * What renewing the listing costs, in cents: `months` more of its own package at today's matrix price in the band its
 * price is in now (Q8). Before the pricing migrations, the old flat six months.
 */
export async function renewalPriceCents(property: Renewable, months?: number): Promise<number> {
  return priceIn(listingCatalog((await getCompany()).services), property, months);
}

/** One catalogue read for many listings (the daily cron): `listing → cents` for the default term. */
export async function renewalPricer(): Promise<(property: Renewable) => number> {
  const catalog = listingCatalog((await getCompany()).services);
  return (property) => priceIn(catalog, property);
}

/** The terms a renewal can be bought for, with today's price for this listing: the renewal page's choices. */
export async function renewalOptions(property: Renewable): Promise<{ months: number; cents: number }[]> {
  const catalog = listingCatalog((await getCompany()).services);
  if (!catalog.pricingLive) return [];
  return catalog.pricing.durations
    .map((months) => { const quote = renewalQuote(catalog, property, months); return quote ? { months, cents: quote.cents } : null; })
    .filter((option): option is { months: number; cents: number } => option !== null);
}

export type RenewalOrder = { id: string; amount_cents: number; line_items: OrderLine[]; stripe_session_id: string | null };

export async function openRenewalOrder(
  admin: any,
  property: { id: string; owner_id: string | null; price_huf?: number | null; package?: string | null },
  locale: Locale,
  contactEmail?: string | null,
  months?: number
): Promise<RenewalOrder> {
  const { data: open } = await admin
    .from('payments')
    .select('id, amount_cents, line_items, stripe_session_id')
    .eq('property_id', property.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  const catalog = listingCatalog((await getCompany()).services);
  const quote = catalog.pricingLive ? renewalQuote(catalog, property, months && catalog.pricing.durations.includes(months) ? months : defaultRenewalMonths(catalog)) : null;
  // One open renewal per listing, but a different term is a different order: the old one is closed, never charged twice.
  const isRenewal = (line: OrderLine) => line.id === 'renewal-6m' || line.renewal === true;
  const openRenewals = (open ?? []).filter((row: any) => (row.line_items ?? []).some(isRenewal));
  const existing = openRenewals.find((row: any) => !quote || (row.line_items ?? []).some((line: OrderLine) => line.renewal === true && line.months === quote.months));
  if (existing) return existing;
  for (const stale of openRenewals) {
    if (stale.stripe_session_id) await getStripe().checkout.sessions.expire(stale.stripe_session_id).catch(() => {});
    await admin.from('payments').update({ status: 'cancelled' }).eq('id', stale.id).eq('status', 'pending');
  }

  // The package line is required by buildOrderLines' shape but not charged:
  // only the renewal extra goes on the order.
  const lines = quote
    ? buildOrderLines({ packageId: quote.packageId, months: quote.months, tierIndex: quote.tierIndex, priceHuf: property.price_huf ?? null, renewal: true, extras: [] }, locale, catalog)
    : buildOrderLines({ packageId: catalog.packages.find((p) => p.legacy)!.id, priceHuf: property.price_huf ?? null, extras: [{ id: 'renewal-6m', quantity: 1 }] }, locale, catalog).filter((line) => line.id === 'renewal-6m');
  const base = {
    property_id: property.id,
    owner_id: property.owner_id,
    amount_cents: orderTotalCents(lines),
    currency: 'eur',
    status: 'pending',
    line_items: lines,
    due_at: new Date(Date.now() + 14 * 86_400_000).toISOString(),
  };
  let { data, error } = await admin.from('payments').insert({ ...base, kind: 'listing', locale, contact_email: contactEmail ?? null }).select('id, amount_cents, line_items, stripe_session_id').single();
  // Before 0017 the payments table has no kind/locale/contact_email.
  if (error && /kind|locale|contact_email|column/i.test(error.message)) {
    ({ data, error } = await admin.from('payments').insert(base).select('id, amount_cents, line_items, stripe_session_id').single());
  }
  if (error || !data) throw new Error(error?.message ?? 'renewal-order-failed');
  return data;
}

/** A Stripe Checkout URL for the order; an open session is reused. */
export async function renewalCheckoutUrl(admin: any, order: RenewalOrder, property: { id: string; ref: string }, returnUrl: string): Promise<string> {
  const stripe = getStripe();
  if (order.stripe_session_id) {
    const open = await stripe.checkout.sessions.retrieve(order.stripe_session_id).catch(() => null);
    if (open?.status === 'open' && open.url) return open.url;
  }
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: order.line_items.map((line) => ({
        price_data: { currency: 'eur', unit_amount: line.unitCents, product_data: { name: line.label } },
        quantity: line.quantity,
      })),
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      success_url: `${returnUrl}&paid=1`,
      cancel_url: returnUrl,
      client_reference_id: order.id,
      // The webhook trusts this, not the browser.
      metadata: { orderId: order.id, propertyId: property.id, ref: property.ref, kind: 'renewal' },
    },
    { idempotencyKey: `renewal-${order.id}-${Math.floor(Date.now() / 3_600_000)}` }
  );
  await admin.from('payments').update({ stripe_session_id: session.id }).eq('id', order.id);
  if (!session.url) throw new Error('stripe-no-url');
  return session.url;
}
