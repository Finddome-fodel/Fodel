/**
 * Newsletter sign-up (footer and homepage form). Public, so it runs the same
 * spam checks as every other public form (honeypot + time trap, from
 * src/lib/form-handler.ts) and answers the same thing whether the address is
 * new, pending or already confirmed — the form must not reveal who is on the
 * list. Writes go through the service role: RLS allows no public insert.
 *
 * Works without JavaScript: a plain form post is redirected to the "check
 * your inbox" page; the enhanced form asks for JSON.
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { spamReason } from '~/lib/form-handler';
import { deliver } from '~/lib/email/send';
import { lifecycleEmails } from '~/lib/email/lifecycle';
import { asNewsletterLocale, newsletterLink } from '~/lib/newsletter';
import { logEvent } from '~/lib/activity';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** A pending address is not re-mailed more often than this. */
const RESEND_AFTER_MS = 10 * 60_000;

export const POST: APIRoute = async ({ request, redirect }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const form = await request.formData().catch(() => null);
  const locale = asNewsletterLocale(form?.get('locale'));
  const done = (status: number, body: Record<string, unknown>) =>
    wantsJson
      ? new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
      : redirect(`/newsletter/${body.ok ? 'sent' : 'error'}?l=${locale}`, 303);

  if (!form) return done(400, { ok: false, error: 'bad-request' });
  // A bot gets the same answer as a person, and nothing is stored or sent.
  if (spamReason(form)) return done(200, { ok: true });

  const email = String(form.get('email') ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 160) return done(422, { ok: false, error: 'email' });
  const source = String(form.get('source') ?? '').slice(0, 40) || null;

  const admin = createSupabaseAdminClient();
  const { data: existing, error: readError } = await admin
    .from('newsletter_subscribers').select('id, status, requested_at').eq('email', email).maybeSingle();
  if (readError) {
    console.error('[newsletter] table unavailable (migration 0019?)', readError.message);
    return done(503, { ok: false, error: 'unavailable' });
  }

  let id = existing?.id as string | undefined;
  if (existing?.status === 'confirmed') return done(200, { ok: true });
  if (existing?.status === 'pending' && Date.now() - new Date(existing.requested_at).getTime() < RESEND_AFTER_MS) {
    return done(200, { ok: true });
  }

  if (existing) {
    await admin.from('newsletter_subscribers')
      .update({ status: 'pending', locale, source, requested_at: new Date().toISOString(), unsubscribed_at: null })
      .eq('id', existing.id);
  } else {
    const { data, error } = await admin.from('newsletter_subscribers').insert({ email, locale, source, status: 'pending' }).select('id').single();
    if (error || !data) {
      console.error('[newsletter] insert failed', error?.message);
      return done(500, { ok: false, error: 'failed' });
    }
    id = data.id;
  }

  await deliver(email, lifecycleEmails.newsletterConfirm(locale, {
    confirmUrl: newsletterLink('confirm', id!, locale),
    unsubscribeUrl: newsletterLink('unsubscribe', id!, locale),
  }));
  await logEvent({ kind: 'newsletter.requested', subjectType: 'newsletter', subjectId: id, locale, source: source ?? 'web' }).catch(() => {});
  return done(200, { ok: true });
};
