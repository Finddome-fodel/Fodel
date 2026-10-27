/**
 * Self-registration: the public "Hirdetés feladása" form and /portal/register.
 *
 * Launch round. Registration now comes first and the listing details after,
 * inside the portal (see properties/[id]/setup.astro). What the public form
 * sends is only a name, an address, a phone number and the consents; this
 * module decides what happens to them.
 *
 * Account-enumeration safe by construction: the page shows the same "check
 * your inbox" panel whatever happens here, and only the email that is sent
 * differs —
 *
 *   new address           → a fresh owner invite and the "set a password" email
 *   invite already open   → the same invite with a new token (the old link
 *                           stops working) and a fresh email; this is what the
 *                           panel's "Resend" button and the admin's
 *                           "Újraküldés" both do
 *   account already there → a short "you already have an account" email with
 *                           sign-in and reset links, and nothing else
 *
 * Still an *invite* rather than an account created on the spot: the token in
 * the email proves the person controls the mailbox (see the 1.1 note in
 * api/listing-order.ts). Nothing publishes without FODEL approving it.
 */
import crypto from 'node:crypto';
import { localeFrom, type Locale } from '~/i18n/ui';
import type { SupabaseClient } from '@supabase/supabase-js';
import { deliver, templates } from '~/lib/email/send';
import { buildInvite, isInviteLocale } from '~/lib/portal/invites';

export const REGISTRATION_DAYS = 7;

/** What a self-registration invite carries from the form to the account. */
export type RegistrationPayload = {
  source: 'register';
  locale: Locale;
  name: string;
  /** E.164. */
  phone: string | null;
  referralId: string | null;
};

/**
 * True for an invite somebody made for themselves on the public site: the
 * launch-round shape (`source: 'register'`) or the older one that carried the
 * whole listing (`settlement`, `description`, `requestedExtras`…).
 */
export function isSelfRegistration(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return p.source === 'register' || 'settlement' in p || 'requestedExtras' in p;
}

const newToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenHash: crypto.createHash('sha256').update(token).digest('hex') };
};

const expiry = () => new Date(Date.now() + REGISTRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

type InviteRow = { id: string; email: string; role: string; payload: Record<string, unknown> | null };

/**
 * Gives an unaccepted invite a new token and a new seven days, and sends the
 * "set a password" email again. Only a hash is stored, so the old raw token
 * no longer exists anywhere to be re-sent — a new one is the mechanism, and
 * it also retires a link that may have been forwarded on.
 */
export async function rotateRegistration(admin: SupabaseClient, invite: InviteRow, origin: string): Promise<boolean> {
  const { token, tokenHash } = newToken();
  const { error } = await admin
    .from('invites')
    .update({ token_hash: tokenHash, expires_at: expiry() })
    .eq('id', invite.id)
    .is('accepted_at', null);
  if (error) {
    console.error('[registration] could not rotate invite', error.message);
    return false;
  }
  const payload = invite.payload ?? {};
  const acceptUrl = `${origin}/portal/invite/${token}`;
  // An invite an admin sent goes out again in the admin's wording; only a
  // self-registration gets the "set your password" registration email.
  if (!isSelfRegistration(payload)) {
    const locale = isInviteLocale(payload.locale) ? payload.locale : 'hu';
    const message = await buildInvite(admin, locale, invite.role === 'admin' ? 'admin' : 'owner', acceptUrl);
    if (message) await deliver(invite.email, message);
    return Boolean(message);
  }
  const locale = localeFrom(payload.locale, 'hu');
  const name = typeof payload.name === 'string' && payload.name ? payload.name : invite.email;
  await deliver(invite.email, templates.registrationConfirm(locale, { name, acceptUrl }));
  return true;
}

export type RegistrationOutcome = 'created' | 'rotated' | 'account-exists' | 'skipped';

export async function register(
  admin: SupabaseClient,
  input: { name: string; email: string; phone: string | null; locale: Locale; referralCode?: string; origin: string }
): Promise<RegistrationOutcome> {
  const email = input.email.trim().toLowerCase();

  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name, locale')
    .eq('email', email)
    .maybeSingle();
  if (profile) {
    const locale = localeFrom(profile.locale, input.locale);
    await deliver(
      email,
      templates.accountExists(locale, {
        name: profile.full_name || input.name,
        loginUrl: `${input.origin}/portal/login?lang=${locale}`,
        forgotUrl: `${input.origin}/portal/forgot?lang=${locale}`,
      })
    );
    return 'account-exists';
  }

  // The newest unaccepted invite for this address, expired or not: re-using
  // the row keeps one line per person in the admin inbox. An admin-role invite
  // is never turned into a self-registration.
  const { data: pending } = await admin
    .from('invites')
    .select('id, email, role, payload')
    .eq('email', email)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (pending) {
    if (pending.role !== 'owner') {
      console.warn('[registration] pending non-owner invite for this address; nothing sent');
      return 'skipped';
    }
    // The name and phone typed this time win: they are the freshest.
    const payload = { ...(pending.payload ?? {}), name: input.name, phone: input.phone ?? (pending.payload as any)?.phone ?? null, locale: input.locale };
    if (!isSelfRegistration(payload)) (payload as Record<string, unknown>).source = 'register';
    await admin.from('invites').update({ payload }).eq('id', pending.id);
    return (await rotateRegistration(admin, { ...pending, payload }, input.origin)) ? 'rotated' : 'skipped';
  }

  // A code from ?ref= on the submit page. Resolved against a real seller's
  // code — never trusted as-is — so a typo'd or made-up code simply mints no
  // referral, silently. Unchanged from 1.1.
  let referralId: string | null = null;
  const referralCode = input.referralCode?.trim().toUpperCase();
  if (referralCode) {
    const { data: referrer } = await admin
      .from('profiles')
      .select('id, full_name, email')
      .eq('referral_code', referralCode)
      .maybeSingle();
    // Using your own link for your own registration earns no credit.
    if (referrer && referrer.email?.trim().toLowerCase() !== email) {
      const { data: referral } = await admin
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referrer_name: referrer.full_name,
          referrer_email: referrer.email,
          referred_name: input.name,
          referred_email: email,
          status: 'pending',
        })
        .select('id')
        .single();
      referralId = referral?.id ?? null;
    }
  }

  const payload: RegistrationPayload = {
    source: 'register',
    locale: input.locale,
    name: input.name,
    phone: input.phone,
    referralId,
  };
  const { token, tokenHash } = newToken();
  const { error } = await admin.from('invites').insert({
    email,
    token_hash: tokenHash,
    role: 'owner',
    expires_at: expiry(),
    payload,
  });
  if (error) throw new Error(error.message);

  await deliver(
    email,
    templates.registrationConfirm(input.locale, { name: input.name, acceptUrl: `${input.origin}/portal/invite/${token}` })
  );
  return 'created';
}
