/**
 * The status machine.
 *
 *   draft ──submit──▶ submitted ──approve──▶ published ──▶ sold | archived
 *                         │                 │
 *                         │                 └─request_changes──▶ changes_requested
 *                         └──request_changes──▶ changes_requested ──▶ (owner edits, submits again)
 *
 *   legacy only: awaiting_payment ──[Stripe / manual / publish_unpaid]──▶ published
 *
 *   submitted | changes_requested | awaiting_payment ──reject──▶ rejected (terminal)
 *
 * 2.1 (brief §7): a listing whose owner was invited with a free listing
 * (`free_listing`, set only by the server) is approved without an order —
 * but it is still approved by a person. Nothing — payment, a free invite or
 * a re-upload — publishes a listing without an admin pressing approve.
 *
 * FODEL 1.3 changed the approval link again: approval still writes the exact
 * same pending order and due date, but publication no longer waits for money.
 * PAYMENT_GATES_PUBLISHING=true restores the 1.2 gate after a rebuild. Existing
 * awaiting_payment rows stay under their original contract and are never
 * bulk-published by a migration.
 *
 * Every transition is re-checked here even though RLS also constrains who may
 * UPDATE a row at all. RLS cannot express "only when moving from exactly this
 * status to exactly that one", so that half of the rule lives here — and the
 * half that matters most for security (who owns what) stays in the database.
 */
import type { Locale } from '~/i18n/ui';
import {validSubtype, groupOf, subtypeOf} from '~/lib/listing-catalogue';
import { detailGaps } from '~/lib/listing-details';
import type { APIRoute } from 'astro';
import { approvedWording } from '~/lib/approved-text';
import { deliver, localeOf, templates, adminRecipients } from '~/lib/email/send';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { getCompany } from '~/lib/runtime-config';
import { publishProperty, listingTitle, publicUrl, renewProperty } from '~/lib/portal/publish';
import { enqueuePaidTranslations } from '~/lib/ai/translation-orders';
import { placeholderProblem } from '~/lib/portal/placeholder';
import { deleteImage } from '~/lib/media';
import { logEvent } from '~/lib/activity';
import {
  buildOrderLines,
  orderTotalCents,
  linesForEmail,
  formatCents,
  suggestSelection,
  referralDiscountCents,
  OrderError,
  type OrderSelection,
} from '~/lib/orders';
import { SITE_URL } from '~/config/site.mjs';
import { eur, formatDate } from '~/lib/format';
import { paymentGatesPublishing } from '~/config/flags';
import { listingCatalog, packageOf, isAboveThreshold } from '~/lib/listing-packages';
import { addMonths } from '~/lib/listing-rules';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Runs work that follows a saved change: a failure is logged, never thrown. */
async function safely<T>(what: string, task: () => Promise<T>): Promise<T | null> {
  try {
    return await task();
  } catch (e) {
    console.error(`[status] ${what} failed after the change was saved`, e);
    return null;
  }
}

type OwnerContact = { email: string; locale: Locale; full_name: string | null; role: string | null };

async function ownerContact(supabase: any, ownerId: string | null): Promise<OwnerContact | null> {
  if (!ownerId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('email, locale, full_name, role')
    .eq('id', ownerId)
    .maybeSingle();
  if (!data?.email) return null;
  return { email: data.email, locale: localeOf(data), full_name: data.full_name, role: data.role ?? null };
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  const { supabase, profile, user } = locals;
  const isAdmin = profile?.role === 'admin';

  const { data: property } = await supabase
    .from('properties')
    .select(
      'id, ref, category, status, owner_id, package, price_huf, price_eur, settlement, county, floor_m2, building_m2, plot_m2, video_url, homepage_featured, featured, free_listing, country, lat, lng, location_confirmed, original_price, property_group, property_subtype, property_translations(locale,title,description)'
    )
    .eq('id', id)
    .maybeSingle();
  if (!property) return json(404, { ok: false, error: 'not-found' });

  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? '');
  const isOwner = property.owner_id === user?.id;

  /* ── submit ─────────────────────────────────────────────────────────── */

  if (action === 'submit') {
    if (!isOwner && !isAdmin) return json(403, { ok: false });
    if (!['draft', 'changes_requested'].includes(property.status)) {
      return json(409, { ok: false, error: 'not-editable' });
    }

    const { count: mediaCount } = await supabase
      .from('property_media')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', id);
    if (!mediaCount) return json(422, { ok: false, error: 'no-photos' });
    if(!property.country || !property.location_confirmed || !validSubtype(property.property_group,property.property_subtype) || !(property.original_price>0) || !property.property_translations.some((t:{title:string;description:string})=>t.title?.trim()&&t.description?.trim())) return json(422,{ok:false,error:'incomplete-listing'});

    // Same rule the admin's approval applies, so nobody can submit what cannot be approved.
    const placeholder = placeholderProblem(property, isAdmin ? 'admin' : 'owner');
    if (placeholder) return json(422, { ok: false, error: 'placeholder', message: placeholder });

    // The facts this type of property requires (src/lib/listing-details.ts fieldRules): the same rules the form
    // marks and the wizard checks. An admin may submit on an owner's behalf with less.
    if (!isAdmin) {
      const [{ data: facts, error: factsError }, { data: priv }] = await Promise.all([
        supabase.from('properties').select('floor_m2, building_m2, plot_m2, year_built, year_built_unknown, bathrooms, heating_key, wall_key, details').eq('id', id).maybeSingle(),
        supabase.from('property_private').select('street').eq('property_id', id).maybeSingle(),
      ]);
      if (!factsError && facts) {
        const group = property.property_group || groupOf(property.category);
        const gaps = detailGaps(facts, group, subtypeOf(property.category, property.property_subtype), priv?.street);
        if (gaps.length) return json(422, { ok: false, error: 'incomplete-details', fields: gaps });
      }
    }

    const { error } = await supabase
      .from('properties')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });

    // The status is saved. From here on nothing may turn this into an error
    // response: a mail that fails, or takes so long the function is cut off,
    // used to make the wizard report "could not submit" for a submission that
    // had gone through (and a second click then met a 409). The mails go out
    // together so one slow recipient cannot hold the others up.
    const owner = await safely('owner lookup', () => ownerContact(supabase, property.owner_id));
    // An admin's own listing: nobody needs a receipt or an alert about what they just did themselves.
    const adminOwned = owner?.role === 'admin';
    await Promise.all([
      owner && !adminOwned
        ? safely('submission receipt', async () => {
            const title = await listingTitle(supabase, property.id, owner.locale, property.ref);
            return deliver(owner.email, templates.submissionReceived(owner.locale, { ref: property.ref, title }));
          })
        : null,
      // Closes a real 1.0 gap: the owner was told "we received it" and nobody at
      // FODEL was told anything at all, so a submission was only ever noticed by
      // an admin who happened to open the dashboard.
      adminOwned ? null : safely('admin alert', () => notifyAdmins(supabase, property, owner ?? null, mediaCount ?? 0)),
      logEvent({
        kind: 'listing.submit',
        actorId: user!.id,
        actorEmail: profile?.email ?? null,
        subjectType: 'property',
        subjectId: id,
        propertyId: id,
        source: 'portal',
      }).catch(() => {}),
    ]);

    return json(200, { ok: true });
  }

  /* ── approve → awaiting_payment ─────────────────────────────────────── */

  if (action === 'approve') {
    if (!isAdmin) return json(403, { ok: false });
    if (property.status !== 'submitted') return json(409, { ok: false, error: 'not-submitted' });

    // Refuse before anything is sent or charged: a placeholder price or area is not an approvable listing.
    const placeholder = placeholderProblem(property);
    if (placeholder) return json(422, { ok: false, error: 'placeholder', message: placeholder });

    const owner = await ownerContact(supabase, property.owner_id);
    const locale = owner?.locale ?? 'hu';

    // An admin-granted free listing: approved and published with no order at
    // all, whatever PAYMENT_GATES_PUBLISHING says — there is nothing to pay.
    // The same goes for a listing an admin owns themselves: nobody sends
    // themselves a payment request.
    const adminOwned = owner?.role === 'admin';
    if (property.free_listing || adminOwned) {
      const requested = String(body.order?.packageId ?? property.package);
      const packageId = listingCatalog().packages.some((pkg) => pkg.id === requested) ? requested : property.package;
      const { error } = await supabase
        .from('properties')
        .update({ package: packageId, approved_at: new Date().toISOString(), approved_by: user!.id })
        .eq('id', id);
      if (error) return json(500, { ok: false, error: error.message });

      const published = await publishProperty(supabase, id!, { notifyOwner: !adminOwned });
      if (!published.ok) return json(500, { ok: false, error: published.error });

      await logEvent({
        kind: 'listing.approve',
        actorId: user!.id,
        actorEmail: profile?.email ?? null,
        subjectType: 'property',
        subjectId: id,
        propertyId: id,
        source: 'portal',
        payload: { free: true, totalCents: 0, ...(adminOwned ? { adminOwned: true } : {}) },
      }).catch(() => {});

      return json(200, { ok: true, totalCents: 0, free: true });
    }

    // The admin's confirmed order, or — if the review screen sent nothing —
    // what the listing itself implies. Either way the prices come from the
    // admin's package settings, never from the request body.
    const listing = listingCatalog((await getCompany()).services);
    const selection: OrderSelection = body.order
      ? {
          packageId: String(body.order.packageId ?? property.package),
          aboveThreshold: Boolean(body.order.aboveThreshold),
          extras: Array.isArray(body.order.extras)
            ? body.order.extras.map((e: any) => ({
                id: String(e.id),
                quantity: Number(e.quantity ?? 1),
                ...(Array.isArray(e.locales) ? { locales: e.locales.map(String) } : {}),
              }))
            : [],
        }
      : suggestSelection({
          package: property.package,
          price_huf: property.price_huf,
          video_url: property.video_url,
          homepage_featured: property.homepage_featured,
          featured: property.featured,
          // The Supabase row nests these under the join's own name; the
          // `as any` that used to stand here hid the mismatch and would have
          // thrown the first time an admin approved without the review
          // screen's order panel.
          locales: (property.property_translations ?? []).map((t: { locale: string }) => t.locale),
        }, listing);
    // The higher tier is decided from the listing's own price, never the browser.
    selection.aboveThreshold = isAboveThreshold(packageOf(listing, selection.packageId), property.price_huf);
    // A language the listing already has text in is never sold: the AI would not touch it, and the owner would pay for nothing.
    const haveText = new Set((property.property_translations ?? []).filter((t: { title: string; description: string }) => t.title?.trim() || t.description?.trim()).map((t: { locale: string }) => t.locale));
    selection.extras = selection.extras.flatMap((extra) => {
      if (extra.id !== 'translation' || !extra.locales) return [extra];
      const rest = extra.locales.filter((code) => !haveText.has(code));
      return rest.length ? [{ ...extra, locales: rest, quantity: rest.length }] : [];
    });

    let lines;
    try {
      lines = buildOrderLines(selection, locale, listing);
    } catch (e) {
      if (e instanceof OrderError) return json(422, { ok: false, error: e.code });
      throw e;
    }

    // Referral discount — never a negative OrderLine (Stripe 400s a Checkout
    // session on a negative unit_amount). Its own column instead, resolved
    // from a real referrals row the admin ticked, never trusted as an amount
    // from the request body.
    const admin = createSupabaseAdminClient();
    const referralDiscountId: string | null =
      typeof body.order?.referralDiscountId === 'string' ? body.order.referralDiscountId : null;
    const referralCreditId: string | null =
      typeof body.order?.referralCreditId === 'string' ? body.order.referralCreditId : null;

    let discountCents = 0;
    let appliedReferral: { id: string; kind: 'discount' | 'credit' } | null = null;
    let creditedReferral: { id: string } | null = null;

    if (referralDiscountId) {
      const { data: referral } = await admin
        .from('referrals')
        .select('id')
        .eq('id', referralDiscountId)
        .eq('referred_property_id', id)
        .eq('status', 'pending')
        .maybeSingle();
      if (referral) {
        discountCents += referralDiscountCents(lines);
        appliedReferral = { id: referral.id, kind: 'discount' };
      }
    }
    if (referralCreditId) {
      const { data: referral } = await admin
        .from('referrals')
        .select('id')
        .eq('id', referralCreditId)
        .eq('referrer_id', property.owner_id)
        .eq('status', 'applied')
        .maybeSingle();
      if (referral) {
        discountCents += referralDiscountCents(lines);
        creditedReferral = { id: referral.id };
      }
    }

    const totalCents = Math.max(0, orderTotalCents(lines) - discountCents);

    // Billing details, if the owner typed them on the original ad-submission
    // form — carried on their invite's payload since Stage C, read here for
    // the first time so Stage E's invoicing has something to print. Missing
    // entirely for anyone who registered another way; an admin fills them in
    // on the payment detail screen before issuing an invoice either way.
    let billingName: string | null = null;
    let billingAddress: string | null = null;
    if (owner?.email) {
      const { data: invite } = await admin
        .from('invites')
        .select('payload')
        .eq('email', owner.email)
        .not('payload->>billingName', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const payload = invite?.payload as { billingName?: string; billingAddress?: string } | undefined;
      billingName = payload?.billingName ?? null;
      billingAddress = payload?.billingAddress ?? null;
    }

    // Supersede any earlier unpaid order for this listing — an admin who
    // approves, changes their mind about the extras, and approves again must
    // not leave two live payment links pointing at different amounts.
    await admin
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('property_id', id)
      .eq('status', 'pending');

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 14);

    const { data: insertedOrder, error: orderError } = await admin
      .from('payments')
      .insert({
        property_id: id,
        owner_id: property.owner_id,
        amount_cents: totalCents,
        discount_cents: discountCents,
        billing_name: billingName,
        billing_address: billingAddress,
        due_at: dueAt.toISOString(),
        currency: 'eur',
        status: 'pending',
        line_items: lines,
      })
      .select('id')
      .single();
    if (orderError) return json(500, { ok: false, error: orderError.message });

    if (appliedReferral) {
      await admin
        .from('referrals')
        .update({ status: 'applied', discount_applied_to: insertedOrder.id })
        .eq('id', appliedReferral.id);
    }
    if (creditedReferral) {
      await admin
        .from('referrals')
        .update({ status: 'credited', credited_to: insertedOrder.id })
        .eq('id', creditedReferral.id);
    }

    const gated = paymentGatesPublishing();
    const { error } = await supabase
      .from('properties')
      .update({
        status: 'awaiting_payment',
        package: selection.packageId,
        approved_at: new Date().toISOString(),
        approved_by: user!.id,
      })
      .eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });

    if (!gated) {
      const published = await publishProperty(supabase, id!, { notifyOwner: false });
      if (!published.ok) return json(500, { ok: false, error: published.error });
    }

    // The approval is saved: a mail that cannot be built or sent is reported, never thrown.
    // null = nobody to mail (the listing has no owner account).
    const emailDelivered = owner
      ? ((await safely('approval mail', async () => {
          const title = await listingTitle(supabase, property.id, locale, property.ref);
          const sharedEmail = {
            ref: property.ref,
            title,
            items: linesForEmail(lines, locale),
            discount: discountCents > 0 ? `−${formatCents(discountCents, locale)}` : undefined,
            total: formatCents(totalCents, locale),
            // The email links to the listing's own page, which is where the pay
            // button lives. A Stripe session is created at the moment they click
            // it — never here, because a session minted now would have expired by
            // the time a seller who reads email on Sunday gets to it.
            payUrl: `${SITE_URL}/portal/properties/${property.id}#pay`,
          };
          const email = gated
            ? templates.approvedAwaitingPayment(locale, sharedEmail)
            : templates.approvedPublished(locale, {
                ...sharedEmail,
                viewUrl: await publicUrl(property, locale),
                dueDate: formatDate(dueAt, locale),
              });
          return deliver(owner.email, email);
        })) ?? false)
      : null;
    if (emailDelivered === false) {
      await logEvent({
        kind: 'email.failed',
        actorId: user!.id,
        actorEmail: profile?.email ?? null,
        subjectType: 'property',
        subjectId: id,
        propertyId: id,
        source: 'portal',
        payload: { template: 'approved', to: owner?.email },
      }).catch(() => {});
    }

    await logEvent({
      kind: 'listing.approve',
      actorId: user!.id,
      actorEmail: profile?.email ?? null,
      subjectType: 'property',
      subjectId: id,
      propertyId: id,
      source: 'portal',
      payload: { totalCents, discountCents },
    }).catch(() => {});

    return json(200, { ok: true, totalCents, emailDelivered });
  }

  /* ── publish manually (bank transfer received) ──────────────────────── */
  // Not a convenience: bank transfer is FODEL's published, primary payment
  // method. Card payment is the addition, so the transfer path has to be a
  // first-class action rather than something an admin works around.

  if (action === 'publish_manually') {
    if (!isAdmin) return json(403, { ok: false });
    if (property.status !== 'awaiting_payment') {
      return json(409, { ok: false, error: 'not-awaiting-payment' });
    }

    const admin = createSupabaseAdminClient();
    const { data: order } = await admin
      .from('payments')
      .select('id, property_id, owner_id, line_items')
      .eq('property_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (order) {
      await admin
        .from('payments')
        .update({ status: 'manual', paid_at: new Date().toISOString() })
        .eq('id', order.id);
      await logEvent({
        kind: 'payment.manual',
        actorId: user!.id,
        actorEmail: profile?.email ?? null,
        subjectType: 'payment',
        subjectId: order.id,
        propertyId: id,
        source: 'portal',
      }).catch(() => {});
    }

    // listing.published is logged exclusively inside publishProperty() —
    // never here too. It is the one function both this action and the
    // Stripe webhook call, and logging in both would double-count the event.
    const result = await publishProperty(supabase, id!);
    if (!result.ok) return json(500, { ok: false, error: result.error });
    // The transfer is confirmed and the listing is online: the translations that were paid for start.
    if (order) await enqueuePaidTranslations(admin, order, new URL(request.url).origin);
    return json(200, { ok: true });
  }

  /* Temporary backlog tool: publish an old awaiting-payment listing without
     falsely recording its still-pending order as paid. Remove after backlog. */
  if (action === 'publish_unpaid') {
    if (!isAdmin) return json(403, { ok: false });
    if (property.status !== 'awaiting_payment') return json(409, { ok: false, error: 'not-awaiting-payment' });
    const result = await publishProperty(supabase, id!);
    return result.ok ? json(200, { ok: true }) : json(500, { ok: false, error: result.error });
  }

  /* ── request changes ────────────────────────────────────────────────── */

  /* ── move_to_draft (admin, silent) ──────────────────────────────────────
     The inbox board lets an admin pull a listing back to a draft. No email:
     nothing the owner needs to act on has changed. */

  if (action === 'move_to_draft') {
    if (!isAdmin) return json(403, { ok: false });
    if (!['submitted', 'changes_requested'].includes(property.status)) {
      return json(409, { ok: false, error: 'not-movable' });
    }
    const { error } = await supabase.from('properties').update({ status: 'draft' }).eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });
    await logEvent({
      kind: 'listing.move_to_draft',
      actorId: user!.id,
      actorEmail: profile?.email ?? null,
      subjectType: 'property',
      subjectId: id,
      propertyId: id,
      source: 'portal',
    }).catch(() => {});
    return json(200, { ok: true });
  }

  if (action === 'request_changes') {
    if (!isAdmin) return json(403, { ok: false });
    if (!['submitted', 'awaiting_payment', 'published'].includes(property.status)) {
      return json(409, { ok: false, error: 'not-reviewable' });
    }
    const note = String(body.note ?? '').trim();
    if (!note) return json(422, { ok: false, error: 'note-required' });

    const { error } = await supabase
      .from('properties')
      .update({ status: 'changes_requested', published_at: null })
      .eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });

    await supabase.from('review_notes').insert({ property_id: id, author_id: user!.id, note });

    // Sending a listing back after approval invalidates its order: the price
    // may change once the listing does.
    if (['awaiting_payment', 'published'].includes(property.status)) {
      const admin = createSupabaseAdminClient();
      await admin
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('property_id', id)
        .eq('status', 'pending');
    }

    const owner = await ownerContact(supabase, property.owner_id);
    if (owner) {
      const title = await listingTitle(supabase, property.id, owner.locale, property.ref);
      await deliver(
        owner.email,
        templates.changesRequested(owner.locale, {
          ref: property.ref,
          title,
          note,
          editUrl: `${SITE_URL}/portal/properties/${property.id}`,
        })
      );
    }

    await logEvent({
      kind: 'listing.request_changes',
      actorId: user!.id,
      actorEmail: profile?.email ?? null,
      subjectType: 'property',
      subjectId: id,
      propertyId: id,
      source: 'portal',
      payload: { note },
    }).catch(() => {});

    return json(200, { ok: true });
  }

  /* ── reject ─────────────────────────────────────────────────────────── */
  // Terminal. The admin states why, and records whether money has to go
  // back — a decision for a person, so it is flagged on the listing and on
  // any settled order, never executed: there is no final refund rule and no
  // refund integration (brief §7). Unpaid orders are simply cancelled.

  if (action === 'reject') {
    if (!isAdmin) return json(403, { ok: false });
    if (!['submitted', 'changes_requested', 'awaiting_payment'].includes(property.status)) {
      return json(409, { ok: false, error: 'not-reviewable' });
    }
    const note = String(body.note ?? '').trim();
    if (!note) return json(422, { ok: false, error: 'note-required' });
    const refundRequired = Boolean(body.refundRequired);

    const { error } = await supabase
      .from('properties')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        refund_required: refundRequired,
        published_at: null,
      })
      .eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });

    await supabase.from('review_notes').insert({ property_id: id, author_id: user!.id, note, kind: 'rejection' });

    const admin = createSupabaseAdminClient();
    await admin.from('payments').update({ status: 'cancelled' }).eq('property_id', id).eq('status', 'pending');
    if (refundRequired) {
      await admin
        .from('payments')
        .update({ refund_required: true })
        .eq('property_id', id)
        .in('status', ['paid', 'manual']);
    }

    const owner = await ownerContact(supabase, property.owner_id);
    if (owner) {
      const title = await listingTitle(supabase, property.id, owner.locale, property.ref);
      const refundPolicy = refundRequired ? approvedWording((await getCompany()).services.refundPolicy, owner.locale)?.text : undefined;
      await deliver(owner.email, templates.rejected(owner.locale, { ref: property.ref, title, note, refundRequired, refundPolicy }));
    }

    await logEvent({
      kind: 'listing.reject',
      actorId: user!.id,
      actorEmail: profile?.email ?? null,
      subjectType: 'property',
      subjectId: id,
      propertyId: id,
      source: 'portal',
      payload: { note, refundRequired },
    }).catch(() => {});

    return json(200, { ok: true });
  }

  /* ── sold / archive ─────────────────────────────────────────────────── */

  if (action === 'mark_sold') {
    if (!isAdmin && !isOwner) return json(403, { ok: false });
    if (property.status !== 'published') return json(409, { ok: false, error: 'not-published' });
    const { error } = await supabase.from('properties').update({ status: 'sold' }).eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });
    // When it was sold, for the archive (migration 0019; ignored before it).
    await supabase.from('properties').update({ sold_at: new Date().toISOString() }).eq('id', id).then(() => {}, () => {});
    await logEvent({
      kind: 'listing.mark_sold',
      actorId: user!.id,
      actorEmail: profile?.email ?? null,
      subjectType: 'property',
      subjectId: id,
      propertyId: id,
      source: 'portal',
    }).catch(() => {});
    return json(200, { ok: true });
  }

  /* ── extend (admin): a manual renewal, logged ─────────────────────────── */
  // Same function as a paid renewal: counts from the current expiry while
  // live, from today once expired, and republishes an expired listing.
  if (action === 'extend') {
    if (!isAdmin) return json(403, { ok: false });
    const months = Number(body.months ?? 6);
    if (![1, 3, 6, 12].includes(months)) return json(422, { ok: false, error: 'bad-months' });
    const result = await renewProperty(createSupabaseAdminClient(), id!, {
      months, source: 'admin', actorId: user!.id, actorEmail: profile?.email ?? null, notifyOwner: body.notify === true,
    });
    return result.ok ? json(200, { ok: true, expiresAt: result.expiresAt }) : json(409, { ok: false, error: result.error });
  }

  /* ── reactivate (admin): back online after an archive or a sale ─────── */
  // The opposite of archive. A listing whose period is still running keeps
  // its expiry date; one without a future date gets a fresh period of its
  // package's length, so the daily job does not take it straight down again.
  if (action === 'reactivate') {
    if (!isAdmin) return json(403, { ok: false });
    if (!['archived', 'sold'].includes(property.status)) return json(409, { ok: false, error: 'not-inactive' });
    const { data: row } = await supabase.from('properties').select('*').eq('id', id).maybeSingle();
    const now = new Date();
    const running = row?.expires_at && new Date(row.expires_at) > now;
    const months = packageOf(listingCatalog((await getCompany()).services), property.package).months;
    const base = {
      status: 'published',
      ...(running ? {} : { expires_at: addMonths(now, months).toISOString() }),
      ...(row?.published_at ? {} : { published_at: now.toISOString() }),
    };
    // 0019 columns: clear the expiry/sale markers and re-arm the reminders.
    const lifecycle = { expired_at: null, sold_at: null, expiry_first_reminder_sent_at: null, expiry_last_reminder_sent_at: null, expiry_notice_sent_at: null };
    const { error } = await supabase.from('properties').update({ ...base, ...(row && 'expired_at' in row ? lifecycle : {}) }).eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });
    await logEvent({
      kind: 'listing.reactivate',
      actorId: user!.id,
      actorEmail: profile?.email ?? null,
      subjectType: 'property',
      subjectId: id,
      propertyId: id,
      source: 'portal',
      payload: { from: property.status, expiresAt: running ? row!.expires_at : base.expires_at },
    }).catch(() => {});
    return json(200, { ok: true });
  }

  if (action === 'archive') {
    if (!isAdmin) return json(403, { ok: false });
    const { error } = await supabase.from('properties').update({ status: 'archived' }).eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });
    await logEvent({
      kind: 'listing.archive',
      actorId: user!.id,
      actorEmail: profile?.email ?? null,
      subjectType: 'property',
      subjectId: id,
      propertyId: id,
      source: 'portal',
    }).catch(() => {});
    return json(200, { ok: true });
  }

  /* ── delete ─────────────────────────────────────────────────────────── */
  // Admin-only, any status. RLS backs this up (properties_admin_all has no
  // status restriction; the owner's own delete policy is narrower — draft
  // only — and isn't exercised from this admin action). Every FK from
  // properties is either ON DELETE CASCADE (property_translations,
  // property_media, review_notes — inherently scoped to this listing) or
  // ON DELETE SET NULL (enquiries, payments, activity_events, valuations,
  // invites.referred_property_id — historical records outlive the listing
  // they were about), so this is a genuine, schema-sanctioned hard delete,
  // not a workaround.

  if (action === 'delete') {
    if (!isAdmin) return json(403, { ok: false });

    // The DB row cascades on its own; the actual files in storage do not —
    // deleting the row without this would leave every photo orphaned in
    // the bucket forever.
    const { data: media } = await supabase.from('property_media').select('storage_path').eq('property_id', id);
    for (const m of media ?? []) {
      await deleteImage(supabase, m.storage_path).catch(() => {});
    }

    // Logged before the delete: activity_events.property_id is SET NULL,
    // not CASCADE, so every earlier event about this listing survives —
    // but only this event's own payload still carries the ref once the
    // property itself is gone.
    await logEvent({
      kind: 'listing.delete',
      actorId: user!.id,
      actorEmail: profile?.email ?? null,
      subjectType: 'property',
      subjectId: id,
      propertyId: id,
      source: 'portal',
      payload: { ref: property.ref, category: property.category },
    }).catch(() => {});

    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) return json(500, { ok: false, error: error.message });

    return json(200, { ok: true });
  }

  return json(400, { ok: false, error: 'unknown-action' });
};

/* ── helpers ─────────────────────────────────────────────────────────────── */

async function notifyAdmins(
  supabase: any,
  property: {
    id: string;
    ref: string;
    category: string;
    settlement: string;
    county: string;
    price_eur: number;
    property_translations: { locale: string }[];
  },
  owner: OwnerContact | null,
  photoCount: number
): Promise<void> {
  // The service-role client, because the *owner* triggered this: RLS would
  // (correctly) stop them from reading the admin roster.
  const admin = createSupabaseAdminClient();
  const recipients = await adminRecipients(admin);

  // FODEL's office works in Hungarian — this is the one email whose language
  // follows the reader rather than the subject.
  const title = await listingTitle(supabase, property.id, 'hu', property.ref);
  const languages = property.property_translations
    .map((t) => t.locale.toUpperCase())
    .sort()
    .join(', ');

  const email = templates.adminNewSubmission('hu', {
    ref: property.ref,
    title,
    ownerName: owner?.full_name ?? '—',
    ownerEmail: owner?.email ?? '—',
    location: `${property.settlement}, ${property.county}`,
    price: eur(property.price_eur),
    photoCount,
    languages: languages || 'HU',
    reviewUrl: `${SITE_URL}/portal/review/${property.id}`,
  });

  // replyTo the owner: an admin can answer a question about the listing
  // without leaving their inbox.
  // Together rather than one after another: each send may retry with a wait,
  // and the submitter is waiting on this response.
  await Promise.all(recipients.map((recipient) => deliver(recipient, email, owner?.email)));
}
