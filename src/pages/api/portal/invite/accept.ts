/**
 * Turns a valid invite into a real account.
 *
 * Creates the Supabase Auth user (the admin client is required — no ordinary
 * session may create another user), creates their profile row with the role
 * the invite specified, marks the invite used, then signs them in through the
 * normal session-aware client so the browser leaves with a real session cookie.
 *
 * FODEL 1.1 adds one branch: an invite may carry a `payload` from the public
 * ad-submission form. When it does, the answers that person already typed on
 * the website become a pre-filled draft listing, and they land inside it
 * rather than on an empty dashboard. Asking someone to retype the settlement,
 * price and description they just submitted is the fastest way to lose them
 * between the form and the portal.
 *
 * Launch round: every self-registration now gets a draft at once and lands in
 * the guided setup (properties/[id]/setup.astro), where the package, the
 * property, the photos and the billing details are asked for one step at a
 * time. An invite carrying the old, full form still pre-fills its draft
 * through applyIntake exactly as before. An admin's invite with no listing
 * behind it still lands on the dashboard.
 */
import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { deliver, templates } from '~/lib/email/send';
import { createDraft, applyIntake, type ListingIntake } from '~/lib/portal/properties';
import { SITE_URL } from '~/config/site.mjs';
import { logEvent } from '~/lib/activity';
import { isInviteLocale, type InviteLocale } from '~/lib/portal/invites';
import { isSelfRegistration } from '~/lib/portal/registration';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const form = await request.formData();
  const token = String(form.get('token') ?? '');
  const fullName = String(form.get('full_name') ?? '').trim();
  const password = String(form.get('password') ?? '');

  // An error code, worded by the page in the invitee's language.
  const fail = (code: 'missing' | 'invalid' | 'failed') => redirect(`/portal/invite/${token}?error=${code}`);

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const admin = createSupabaseAdminClient();

  const { data: invite } = await admin
    .from('invites')
    .select('id, email, role, expires_at, accepted_at, payload, grants_free_listing')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  const payload = (invite?.payload ?? {}) as Partial<ListingIntake> & { locale?: string };
  // The invitee's own language, as the admin (or the public form) recorded it.
  const locale: InviteLocale = isInviteLocale(payload.locale) ? payload.locale : 'hu';

  if (!fullName || password.length < 8) return fail('missing');

  if (!invite || invite.accepted_at || new Date(invite.expires_at) < new Date()) {
    return fail('invalid');
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    console.error('[invite] createUser failed', createError);
    return fail('failed');
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    role: invite.role,
    full_name: fullName,
    email: invite.email,
    phone: payload.phone ?? null,
    locale,
  });
  if (profileError) {
    console.error('[invite] profile insert failed', profileError);
    return fail('failed');
  }

  await admin.from('invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id);

  // The registration is complete, so no reminder may go out for it — nor for
  // an earlier, abandoned attempt under the same address (brief §4). A no-op
  // while reminders are switched off; the table exists from migration 0014.
  await admin
    .from('registration_reminders')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('email', invite.email.toLowerCase())
    .is('sent_at', null)
    .is('cancelled_at', null)
    .then(() => {}, () => {});

  await logEvent({
    kind: 'auth.registered',
    actorId: created.user.id,
    actorEmail: invite.email,
    subjectType: 'profile',
    subjectId: created.user.id,
    locale,
    source: 'invite',
  }).catch(() => {});

  // Establish a real session (sets cookies via the request/response pair), as
  // opposed to the admin client above, which never touches cookies.
  const { error: signInError } = await locals.supabase.auth.signInWithPassword({
    email: invite.email,
    password,
  });
  if (signInError) {
    return redirect('/portal/login');
  }

  // The welcome email, in the invitee's own language.
  await deliver(
    invite.email,
    templates.welcome(locale, { name: fullName, portalUrl: `${SITE_URL}/portal/dashboard` })
  );

  // A self-service registration carries the listing they described on the
  // public form; an admin's free-listing invite is an entitlement for one.
  // Either way the draft is built now, through the admin client, because it
  // is written before the freshly-created session has propagated — and
  // because only the server may set `free_listing`.
  const selfRegistered = isSelfRegistration(invite.payload);
  if (selfRegistered || invite.grants_free_listing) {
    try {
      const draftId = await createDraft(admin, created.user.id);
      if (payload.settlement || payload.description || payload.requestedExtras) await applyIntake(admin, draftId, payload as ListingIntake);
      if (invite.grants_free_listing) {
        await admin.from('properties').update({ free_listing: true }).eq('id', draftId);
      }

      const referralId = (payload as { referralId?: string | null }).referralId;
      if (referralId) {
        await admin.from('referrals').update({ referred_property_id: draftId }).eq('id', referralId);
      }

      // An on-site service asked for on the form now belongs to this listing
      // and this account (brief 3 §F). A no-op before migration 0015.
      const serviceRequestId = (payload as { serviceRequestId?: string | null }).serviceRequestId;
      if (serviceRequestId) {
        await admin
          .from('service_requests')
          .update({ property_id: draftId, profile_id: created.user.id })
          .eq('id', serviceRequestId)
          .then(() => {}, () => {});
      }

      // Their seller-facing contact number on the listing, from registration.
      if (payload.phone) {
        await admin.from('properties').update({ seller_phone: String(payload.phone).slice(0, 40), seller_name: fullName.slice(0, 120) }).eq('id', draftId);
      }

      return redirect(`/portal/properties/${draftId}/setup`);
    } catch (error) {
      // A failed pre-fill must never cost someone their account — they are
      // signed in and can start a listing by hand.
      console.error('[invite] failed to pre-fill draft from intake payload', error);
    }
  }

  return redirect('/portal/dashboard');
};
