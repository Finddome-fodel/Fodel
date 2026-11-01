/**
 * "Jóváhagyás ingyen" — an admin lets a paid listing through free of charge.
 *
 * Not the same thing as a free listing (`free_listing`, from the free upload
 * link or an invite): that is decided before the owner uploads and covers the
 * listing for good. A free approval is one admin's decision, made at review
 * time, for this one publication. Renewals later are charged as usual.
 *
 * What makes it safe is the order in which things happen (status.ts,
 * action `approve_free`):
 *
 *   1. the listing is claimed with a conditional update, so a double click or a
 *      second admin finds it already claimed and nothing happens twice;
 *   2. every open díjbekérő of the listing is checked with Stripe: one being paid
 *      right now stops the whole thing (the money wins, nothing is waived);
 *      an open card page is expired, so it can no longer take money;
 *   3. the order is cancelled conditionally (only while still pending) and marked
 *      as waived — every total, export and reminder already reads 'cancelled'
 *      as "nothing owed";
 *   4. only then is the listing published.
 *
 * If anything after the claim fails, the claim and the waiver are undone and
 * the listing is exactly where it was. A payment that still slips through
 * (a card page opened in the very same second) is recorded by the webhook and
 * flagged for a refund instead of being silently kept (webhook.ts).
 */
import type { OrderLine } from '~/lib/orders';
import { isRenewalOrder } from '~/lib/portal/publish';
import { isTranslationOrder } from '~/lib/ai/translation-orders';
import { getStripe, isStripeEnabled } from '~/lib/stripe';

/** The internal note is for the office, not a document: a generous cap is enough. */
export const FREE_APPROVAL_NOTE_MAX = 1000;

/** The trimmed note, or null for an empty one. Never longer than the cap. */
export function cleanNote(value: unknown): string | null {
  const text = typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';
  return text ? text.slice(0, FREE_APPROVAL_NOTE_MAX) : null;
}

/** A listing's own publication fee — not a renewal, not translations bought for a live listing. */
export function isListingFeeOrder(lines: Pick<OrderLine, 'id' | 'kind'>[] | null | undefined): boolean {
  const list = lines ?? [];
  if (isRenewalOrder(list) || isTranslationOrder(list)) return false;
  // An order from before itemised lines has none; on a listing it can only have been the listing fee.
  return list.length === 0 || list.some((line) => line.kind === 'package');
}

/** Whether a database error means migration 0045 has not been run yet. */
export function isMissingFreeApprovalSchema(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false;
  return error.code === '42703' || error.code === 'PGRST204' || /free_approved_at|waived_at|waived_by|column .* does not exist|could not find the .* column/i.test(String(error.message ?? ''));
}

export type OpenOrder = { id: string; amount_cents: number; currency: string | null; stripe_session_id: string | null; line_items: OrderLine[] | null };

/** Every unpaid listing-fee order of one listing (normally one, never more than a stale one or two). */
export async function openListingOrders(admin: any, propertyId: string): Promise<{ orders: OpenOrder[]; error: string | null }> {
  const { data, error } = await admin
    .from('payments')
    .select('id, amount_cents, currency, stripe_session_id, line_items')
    .eq('property_id', propertyId)
    .eq('status', 'pending');
  if (error) return { orders: [], error: error.message };
  return { orders: (data ?? []).filter((order: OpenOrder) => isListingFeeOrder(order.line_items)), error: null };
}

export type Refusal = { status: number; error: string; message: string };

const PAYING: Refusal = {
  status: 409,
  error: 'payment-in-progress',
  message: 'A hirdető épp most fizet (vagy már kifizette) bankkártyával. A díjat ezért nem engedtük el: várja meg, amíg a fizetés beérkezik.',
};

/**
 * Makes sure no card page of this order can take money any more.
 * Paid, or a delayed payment on its way: refused. Open: expired. Gone or
 * expired already: fine. Stripe unreachable: refused, because "probably not
 * paying" is not good enough to waive a fee on.
 */
export async function closeCheckout(sessionId: string | null): Promise<Refusal | null> {
  if (!sessionId || !isStripeEnabled()) return null;
  const stripe = getStripe();
  const read = async () => stripe.checkout.sessions.retrieve(sessionId);
  let session: { status?: string | null; payment_status?: string | null };
  try {
    session = await read();
  } catch (error) {
    // A session Stripe no longer knows cannot take money.
    if (/no such checkout/i.test(String((error as Error)?.message))) return null;
    return { status: 503, error: 'stripe-unreachable', message: 'A Stripe most nem érhető el, ezért nem tudtuk ellenőrizni, hogy fizet-e éppen a hirdető. Próbálja újra néhány perc múlva.' };
  }
  if (session.payment_status === 'paid' || session.status === 'complete') return PAYING;
  if (session.status !== 'open') return null;
  try {
    await stripe.checkout.sessions.expire(sessionId);
    return null;
  } catch {
    // Expiring fails when the session completed in the meantime: look once more.
    const again = await read().catch(() => null);
    if (!again) return { status: 503, error: 'stripe-unreachable', message: 'A Stripe most nem érhető el. Próbálja újra néhány perc múlva.' };
    if (again.payment_status === 'paid' || again.status === 'complete') return PAYING;
    return again.status === 'open' ? { status: 503, error: 'stripe-unreachable', message: 'A nyitott bankkártyás fizetési oldalt nem sikerült lezárni. Próbálja újra néhány perc múlva.' } : null;
  }
}

/**
 * Cancels the orders as waived, each only while it is still pending. Returns
 * the ids actually waived, or a refusal when one of them was paid in between.
 */
export async function waiveOrders(admin: any, orders: OpenOrder[], actorId: string, at: string): Promise<{ waived: string[]; refusal: Refusal | null }> {
  const waived: string[] = [];
  for (const order of orders) {
    const { data, error } = await admin
      .from('payments')
      .update({ status: 'cancelled', waived_at: at, waived_by: actorId })
      .eq('id', order.id)
      .eq('status', 'pending')
      .select('id');
    if (error) return { waived, refusal: { status: 500, error: 'waive-failed', message: error.message } };
    if (data?.length) {
      waived.push(order.id);
      continue;
    }
    const { data: now } = await admin.from('payments').select('status').eq('id', order.id).maybeSingle();
    if (now && ['paid', 'manual'].includes(now.status)) return { waived, refusal: { ...PAYING, error: 'already-paid', message: 'Ezt a díjbekérőt időközben kifizették, ezért a díjat már nem lehet elengedni.' } };
    // Cancelled by someone else in the meantime: nothing is owed on it either way.
  }
  return { waived, refusal: null };
}

/** Puts waived orders back to pending — used only when the free approval could not finish. */
export async function restoreOrders(admin: any, ids: string[], at: string): Promise<void> {
  for (const id of ids) {
    await admin
      .from('payments')
      .update({ status: 'pending', waived_at: null, waived_by: null })
      .eq('id', id)
      .eq('status', 'cancelled')
      .eq('waived_at', at)
      .then(() => {}, () => {});
  }
}

/**
 * A referral discount or credit that was spent on a waived order is given
 * back: nobody paid that order, so the discount was never used.
 */
export async function releaseReferrals(admin: any, orderIds: string[]): Promise<void> {
  if (!orderIds.length) return;
  await admin.from('referrals').update({ status: 'pending', discount_applied_to: null }).in('discount_applied_to', orderIds).eq('status', 'applied').then(() => {}, () => {});
  await admin.from('referrals').update({ status: 'applied', credited_to: null }).in('credited_to', orderIds).eq('status', 'credited').then(() => {}, () => {});
}
