/**
 * Paying for a renewal — the existing 'renewal-6m' catalogue extra, as its own
 * small order. Card when STRIPE_ENABLED (the webhook settles it and calls
 * renewProperty), otherwise bank transfer: the order waits as `pending` and an
 * admin's "mark paid" on the Fizetések page renews the listing.
 *
 * One open renewal order per listing: a second click reuses it rather than
 * creating a second debt.
 */
import { buildOrderLines, orderTotalCents, type OrderLine } from '~/lib/orders';
import { getStripe } from '~/lib/stripe';
import { LISTING_EXTRAS } from '~/config/company';

/** The 6-month renewal's price, from the published tariff (src/config/company.ts). */
export const RENEWAL_PRICE_CENTS = (LISTING_EXTRAS.find((extra) => extra.id === 'renewal-6m')?.priceEur ?? 0) * 100;

export type RenewalOrder = { id: string; amount_cents: number; line_items: OrderLine[]; stripe_session_id: string | null };

export async function openRenewalOrder(
  admin: any,
  property: { id: string; owner_id: string | null },
  locale: 'hu' | 'nl',
  contactEmail?: string | null
): Promise<RenewalOrder> {
  const { data: open } = await admin
    .from('payments')
    .select('id, amount_cents, line_items, stripe_session_id')
    .eq('property_id', property.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  const existing = (open ?? []).find((row: any) => (row.line_items ?? []).some((line: OrderLine) => line.id === 'renewal-6m'));
  if (existing) return existing;

  // The package line is required by buildOrderLines' shape but not charged:
  // only the renewal extra goes on the order.
  const lines = buildOrderLines({ packageId: 'cheap-6m', extras: [{ id: 'renewal-6m', quantity: 1 }] }, locale).filter((line) => line.id === 'renewal-6m');
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
