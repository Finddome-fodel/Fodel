/**
 * Buying translations for a live listing: a small order of its own (one
 * `translation` line that names its languages), paid by card with the same
 * Stripe Checkout the rest of the site uses. The webhook recognises it by its
 * lines (translation-orders.ts) and queues exactly those languages once the
 * payment settles. The price comes from the catalogue, never from the browser.
 */
import type { Locale } from '~/i18n/ui';
import { buildOrderLines, orderTotalCents, type OrderLine } from '~/lib/orders';
import { getStripe } from '~/lib/stripe';
import { getCompany } from '~/lib/runtime-config';
import { listingCatalog } from '~/lib/listing-packages';
import { isTranslationOrder } from './translation-orders';

export type TranslationOrder = { id: string; amount_cents: number; line_items: OrderLine[]; stripe_session_id: string | null };

/**
 * Replaces whatever translation order was still open with one for exactly these
 * languages: a person who changes their mind never leaves two debts or two live
 * payment links behind. The listing's own first order is never touched.
 */
export async function openTranslationOrder(
  admin: any,
  property: { id: string; owner_id: string | null },
  locales: string[],
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
  // buildOrderLines wants a package; only the translation line is kept and charged.
  const lines = buildOrderLines({ packageId: catalog.packages[0].id, extras: [{ id: 'translation', quantity: locales.length, locales }] }, locale, catalog).filter((line) => line.id === 'translation');
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
