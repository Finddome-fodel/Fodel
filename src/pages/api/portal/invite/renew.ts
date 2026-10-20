/**
 * "Új link kérése" — a fresh "set a password" link for an expired, used or
 * unknown invite link.
 *
 * Public (the person is by definition signed out; see the `/api/portal/invite`
 * prefix in src/middleware.ts). It takes the old token from the link, or an
 * email address typed on the page when the link itself is unknown, and runs
 * the same rotation as the registration form's "Resend" and the admin's
 * "Újraküldés" (src/lib/portal/registration.ts).
 *
 * The answer is identical whatever happened — sent, already has an account,
 * no such address — so the page cannot be used to learn who is registered.
 */
import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { deliver, templates } from '~/lib/email/send';
import { rotateRegistration } from '~/lib/portal/registration';

export const prerender = false;

/** Crude in-process rate limit, the same pattern as the login endpoint. */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  attempts.set(ip, hits);
  return hits.length > MAX_ATTEMPTS;
}

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const form = await request.formData();
  const token = String(form.get('token') ?? '').trim();
  const typedEmail = String(form.get('email') ?? '').trim().toLowerCase();
  const lang = form.get('lang') === 'nl' ? 'nl' : 'hu';
  const origin = new URL(request.url).origin;

  const done = () => redirect(`/portal/invite/${encodeURIComponent(token || 'new')}?renewed=1&lang=${lang}`);

  if (clientAddress && rateLimited(clientAddress)) return done();

  const admin = createSupabaseAdminClient();

  let email = typedEmail;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data } = await admin.from('invites').select('email').eq('token_hash', tokenHash).maybeSingle();
    if (data?.email) email = data.email.toLowerCase();
  }
  if (!email || !email.includes('@')) return done();

  // Already has an account (the link was used): say so, with a way in.
  const { data: profile } = await admin.from('profiles').select('full_name, locale').eq('email', email).maybeSingle();
  if (profile) {
    const locale = profile.locale === 'nl' ? 'nl' : 'hu';
    await deliver(
      email,
      templates.accountExists(locale, {
        name: profile.full_name || email,
        loginUrl: `${origin}/portal/login?lang=${locale}`,
        forgotUrl: `${origin}/portal/forgot?lang=${locale}`,
      })
    );
    return done();
  }

  const { data: invite } = await admin
    .from('invites')
    .select('id, email, role, payload')
    .eq('email', email)
    .is('accepted_at', null)
    .eq('role', 'owner')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (invite) await rotateRegistration(admin, invite, origin);

  return done();
};
