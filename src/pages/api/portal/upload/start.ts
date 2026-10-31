/**
 * The free upload link's form: checks the link, makes the account, signs the
 * visitor in and sends them into the listing wizard. Public by necessity (the
 * link itself is the key; see src/middleware.ts), so everything is checked here.
 *
 * Answers JSON to the page's script and a redirect to a plain form post.
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { checkUploadToken, validateUploadSignup } from '~/lib/portal/upload-link';
import { startFreeUpload } from '~/lib/portal/upload-signup';

export const prerender = false;

/** Crude in-process limit, the same pattern as the sign-in route: a link that is shared widely must not be a way to mass-produce accounts. */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 20;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  attempts.set(ip, hits);
  return hits.length > MAX_ATTEMPTS;
}

export const POST: APIRoute = async ({ request, clientAddress, locals, redirect }) => {
  const form = await request.formData();
  const token = String(form.get('token') ?? '');
  const lang = String(form.get('lang') ?? 'hu');
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');

  const json = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  const fail = (error: string, extra: Record<string, unknown> = {}) =>
    wantsJson ? json(error === 'rate-limited' ? 429 : 422, { ok: false, error, ...extra }) : redirect(`/portal/upload/${encodeURIComponent(token)}?error=${error}&lang=${encodeURIComponent(lang)}`);

  // Someone already signed in (an admin trying the link) must not be swapped into a new account.
  if (locals.user) return wantsJson ? json(200, { ok: true, redirect: '/portal/dashboard' }) : redirect('/portal/dashboard');

  // A filled hidden field is a bot; answer as if it worked and make nothing.
  if (String(form.get('company') ?? '').length > 0) return wantsJson ? json(200, { ok: true, redirect: '/portal/login' }) : redirect('/portal/login');

  if (clientAddress && rateLimited(clientAddress)) return fail('rate-limited');

  const admin = createSupabaseAdminClient();
  const state = await checkUploadToken(admin, token);
  if (state !== 'ok') return fail(state === 'off' ? 'off' : state === 'unavailable' ? 'unavailable' : 'invalid');

  const checked = validateUploadSignup(
    { name: form.get('name'), email: form.get('email'), phone: form.get('phone'), phoneCountry: form.get('phoneCountry'), consent: form.get('consent') },
    lang
  );
  if (!checked.ok) return fail('fields', { fields: checked.errors });

  const result = await startFreeUpload(admin, { ...checked.values, locale: lang }, async (email, password) => {
    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    return !error;
  });
  if (!result.ok) return fail(result.error);

  const to = result.draftId ? `/portal/properties/${result.draftId}/setup` : '/portal/dashboard';
  return wantsJson ? json(200, { ok: true, redirect: to }) : redirect(to);
};
