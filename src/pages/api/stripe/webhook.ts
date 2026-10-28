/**
 * Stripe's callback — where a card payment actually publishes a listing.
 *
 * Stripe calls this directly, not through the browser, so it carries no user
 * session. The signature check against STRIPE_WEBHOOK_SECRET is what proves
 * the request genuinely came from Stripe, and it stands in for authentication
 * here. Everything after that check runs with the service-role client, because
 * there is no user to run as.
 *
 * Idempotency is not optional. Stripe retries any webhook it doesn't receive a
 * 2xx for — for up to three days — and it can legitimately deliver the same
 * event twice even on success. So every handler below has to be safe to run
 * again: `publishProperty` returns early if the listing is already live, and
 * the order update is a no-op the second time because the row is no longer
 * `pending`.
 *
 * A note on the response contract: this returns 200 even for events it does
 * nothing with. A non-2xx tells Stripe "retry me", so returning an error for
 * an event we simply don't handle would earn an escalating retry storm and,
 * eventually, a disabled endpoint.
 */
import type { APIRoute } from 'astro';
import { isStripeEnabled, getStripe } from '~/lib/stripe';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { publishProperty, listingTitle, renewProperty, isRenewalOrder } from '~/lib/portal/publish';
import { deliver, localeOf, templates } from '~/lib/email/send';
import { linesForEmail, formatCents, type OrderLine } from '~/lib/orders';
import { intlTag } from '~/lib/format';
import { localeFrom } from '~/i18n/ui';
import { officeInbox } from '~/lib/email/routing';
import { SITE_URL } from '~/config/site.mjs';
import { createDraftFromPayment } from '~/lib/invoicing/store';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isStripeEnabled()) return new Response(null, { status: 404 });

  const signature = request.headers.get('stripe-signature');
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response('missing signature config', { status: 400 });

  const rawBody = await request.text();
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    return new Response(`signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // A delayed method (SEPA debit, bank redirect) completes the session first
  // with payment_status 'unpaid', and the money arrives later as
  // async_payment_succeeded. Both run the same settling code below, which
  // only acts once the session is 'paid'.
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as {
      id: string;
      metadata?: { orderId?: string; propertyId?: string; kind?: string; valuationId?: string } | null;
      payment_status?: string;
      customer_details?: StripeCustomerDetails | null;
    };

    // `completed` fires for delayed payment methods before the money is
    // actually there; only `paid` means settled.
    if (session.payment_status && session.payment_status !== 'paid') {
      return new Response(null, { status: 200 });
    }

    // A valuation package has no listing to publish: its own, much shorter path.
    if (session.metadata?.kind === 'valuation') {
      await settleValuationPayment(admin, session.id, session.customer_details);
      return new Response(null, { status: 200 });
    }

    const { data: order } = await admin
      .from('payments')
      .select('id, property_id, owner_id, amount_cents, discount_cents, line_items, status')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (!order) {
      // Nothing to reconcile against — log rather than 500, or Stripe retries
      // an event that can never succeed.
      console.error(`[stripe] no order found for session ${session.id}`);
      return new Response(null, { status: 200 });
    }

    await keepStripeBilling(admin, order.id, session.customer_details);

    // Settling and publishing are separate steps, so a retried delivery can
    // finish a publish that failed the first time without paying twice.
    const alreadySettled = ['paid', 'manual', 'refunded'].includes(order.status);
    const paidAt = new Date();
    if (!alreadySettled) {
      await admin
        .from('payments')
        .update({ status: 'paid', paid_at: paidAt.toISOString() })
        .eq('id', order.id);
    }

    // A renewal (the 'renewal-6m' order from a reminder email) extends the
    // listing and, if it had expired, puts it back online. It never publishes
    // a listing that was not live before.
    if (isRenewalOrder(order.line_items as OrderLine[]) && order.property_id) {
      // A retry after a successful renewal must not add another six months:
      // the renewal is logged under the order's own key, checked first.
      const { data: done } = await admin.from('activity_events').select('id').eq('dedupe_key', `order-${order.id}:renewed`).maybeSingle();
      if (done) return new Response(null, { status: 200 });
      const renewed = await renewProperty(admin, order.property_id, { months: 6, source: 'stripe-webhook', dedupeKey: `order-${order.id}`, notifyOwner: !alreadySettled });
      if (!renewed.ok && renewed.error !== 'not-renewable') {
        console.error(`[stripe] renewal paid but not applied for ${order.property_id}`, renewed.error);
        return new Response('renewal failed', { status: 500 });
      }
      if (!renewed.ok) await admin.from('payments').update({ refund_required: true }).eq('id', order.id).then(() => {}, () => {});
      if (!alreadySettled) {
        await sendReceipt(admin, order, paidAt);
        await createDraftFromPayment(admin, order.id, {}).catch((e) => console.warn('[invoice] draft not created', e?.message));
      }
      return new Response(null, { status: 200 });
    }

    // Money never publishes on its own (brief §7). Only a listing an admin
    // approved and that is waiting for exactly this payment goes live. A
    // checkout opened earlier and completed after the listing was sent back
    // or rejected is recorded as paid and flagged for a refund decision.
    const { data: property } = order.property_id
      ? await admin.from('properties').select('status').eq('id', order.property_id).maybeSingle()
      : { data: null };

    if (property?.status === 'awaiting_payment') {
      const result = await publishProperty(admin, order.property_id, { dedupeKey: event.id });
      if (!result.ok) {
        // The money is in and recorded; publication failed. A 500 makes
        // Stripe retry, and the retry skips straight to this publish.
        console.error(`[stripe] payment recorded but publish failed for ${order.property_id}`, result.error);
        return new Response('publish failed', { status: 500 });
      }
    } else if (!alreadySettled && property?.status !== 'published') {
      console.warn(`[stripe] payment for ${order.property_id} arrived while the listing is ${property?.status ?? 'missing'} — not published, flagged for refund review`);
      await admin.from('payments').update({ refund_required: true }).eq('id', order.id).then(() => {}, () => {});
    }

    if (!alreadySettled) {
      await sendReceipt(admin, order, paidAt);
      // The invoice is prepared (buyer, VAT treatment, lines); an admin issues it.
      await createDraftFromPayment(admin, order.id, {}).catch((e) => console.warn('[invoice] draft not created', e?.message));
    }
    return new Response(null, { status: 200 });
  }

  // A delayed payment was refused, or a valuation's session ran out: that order
  // is closed and nothing is published. A listing's session simply expiring
  // (the owner left the card page open and walked away) is NOT the end of the
  // order: it stays open and the next click on "pay" gets a fresh session.
  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as { id: string; metadata?: { kind?: string } | null };
    if (event.type === 'checkout.session.async_payment_failed') console.warn(`[stripe] delayed payment failed for session ${session.id}`);
    if (event.type === 'checkout.session.expired' && session.metadata?.kind !== 'valuation') return new Response(null, { status: 200 });
    await admin
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('stripe_session_id', session.id)
      .eq('status', 'pending');
    return new Response(null, { status: 200 });
  }

  return new Response(null, { status: 200 });
};

async function sendReceipt(
  admin: any,
  order: {
    property_id: string;
    owner_id: string | null;
    amount_cents: number;
    discount_cents?: number;
    line_items: OrderLine[];
  },
  paidAt: Date
): Promise<void> {
  if (!order.owner_id) return;

  const { data: owner } = await admin
    .from('profiles')
    .select('email, locale')
    .eq('id', order.owner_id)
    .maybeSingle();
  if (!owner?.email) return;

  const { data: property } = await admin
    .from('properties')
    .select('ref')
    .eq('id', order.property_id)
    .maybeSingle();
  if (!property) return;

  const locale = localeOf(owner);
  const title = await listingTitle(admin, order.property_id, locale, property.ref);

  await deliver(
    owner.email,
    templates.paymentReceipt(locale, {
      ref: property.ref,
      title,
      items: linesForEmail(order.line_items ?? [], locale),
      discount: order.discount_cents ? `−${formatCents(order.discount_cents, locale)}` : undefined,
      total: formatCents(order.amount_cents, locale),
      paidAt: paidAt.toLocaleDateString(intlTag(locale), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })
  );
}

/**
 * Marks a valuation-package payment paid, tells the customer and the office.
 * Safe to run twice: the receipt and the office note only go out on the first
 * transition from pending, so a retried delivery sends nothing new.
 */
async function settleValuationPayment(admin: any, sessionId: string, details?: StripeCustomerDetails | null): Promise<void> {
  const { data: order } = await admin
    .from('payments')
    .select('id, valuation_id, amount_cents, line_items, status, contact_email, billing_name, locale')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();
  if (!order) {
    console.error(`[stripe] no valuation order found for session ${sessionId}`);
    return;
  }
  await keepStripeBilling(admin, order.id, details);
  if (['paid', 'manual', 'refunded'].includes(order.status)) return;

  const paidAt = new Date();
  await admin.from('payments').update({ status: 'paid', paid_at: paidAt.toISOString() }).eq('id', order.id);

  await createDraftFromPayment(admin, order.id, {}).catch((e) => console.warn('[invoice] draft not created', e?.message));

  const lines = (order.line_items ?? []) as OrderLine[];
  const label = lines.map((line) => line.label).join(', ') || 'Értékbecslés';
  const locale = localeFrom(order.locale);

  if (order.contact_email) {
    await deliver(
      order.contact_email,
      templates.valuationPaid(locale, {
        service: label,
        items: linesForEmail(lines, locale),
        total: formatCents(order.amount_cents, locale),
        paidAt: paidAt.toLocaleDateString(intlTag(locale), { year: 'numeric', month: 'long', day: 'numeric' }),
      })
    );
  }
  await deliver(
    officeInbox(),
    templates.adminServiceRequested('hu', {
      service: `Kártyás fizetés érkezett — ${label} (${formatCents(order.amount_cents)})`,
      name: order.billing_name ?? '',
      email: order.contact_email ?? '',
      phone: '',
      source: 'valuation',
      note: '',
      url: `${SITE_URL}/portal/valuations/${order.valuation_id}`,
    })
  );
}

/* ── The buyer's details, as Checkout collected them ───────────────────────── */

type StripeCustomerDetails = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: { line1?: string | null; line2?: string | null; postal_code?: string | null; city?: string | null; country?: string | null } | null;
  tax_ids?: { type?: string; value?: string }[] | null;
};

/**
 * Copies what Stripe collected onto the order, so the invoice is complete
 * without anyone retyping it. Anything already on the order (from the billing
 * form in the portal) wins; Stripe only fills the gaps. Best-effort: a failure
 * here (the column arrives with migration 0018) must never fail the payment.
 */
async function keepStripeBilling(admin: any, orderId: string, details?: StripeCustomerDetails | null): Promise<void> {
  if (!details) return;
  try {
    const { data: row } = await admin.from('payments').select('billing').eq('id', orderId).maybeSingle();
    const have = (row?.billing ?? {}) as Record<string, string>;
    const tax = details.tax_ids?.find((t) => t.value)?.value ?? '';
    const street = [details.address?.line1, details.address?.line2].filter(Boolean).join(' ');
    const fromStripe: Record<string, string> = {
      type: tax ? 'company' : 'person',
      name: details.name ?? '',
      street,
      postalCode: details.address?.postal_code ?? '',
      city: details.address?.city ?? '',
      countryCode: (details.address?.country ?? '').toUpperCase(),
      email: details.email ?? '',
      phone: details.phone ?? '',
      taxNumber: tax,
    };
    const merged: Record<string, string> = { ...fromStripe };
    for (const [k, v] of Object.entries(have)) if (v) merged[k] = v;
    await admin
      .from('payments')
      .update({ billing: merged, ...(merged.name ? { billing_name: merged.name } : {}) })
      .eq('id', orderId);
  } catch (error) {
    console.error('[stripe] could not keep billing details', error);
  }
}
