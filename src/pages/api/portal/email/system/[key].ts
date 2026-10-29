/**
 * Saves or restores the wording of one system email in one language
 * (mail_system_texts, migration 0040). JSON in, JSON out — the editor saves
 * without leaving the page.
 *
 *   { locale, fields: { subject: "…", … } }   save: only fields that differ
 *                                             from the built-in wording are kept
 *   { locale, action: "reset" }               back to the built-in wording
 */
import type { APIRoute } from 'astro';
import { isLocale } from '~/i18n/ui';
import { logEvent } from '~/lib/activity';
import { friendlyError } from '~/lib/portal/labels';
import { isMissingMailSchema } from '~/lib/mail/schema';
import { findMessage, localesOf, overlayFrom } from '~/lib/email/system-messages';
import { invalidateSystemTexts } from '~/lib/email/system-texts';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { supabase, profile, user } = locals;
  if (profile?.role !== 'admin') return json(403, { ok: false, error: 'Ehhez nincs jogosultsága.' });

  const message = findMessage(params.key ?? '');
  if (!message || message.href) return json(404, { ok: false, error: 'Ismeretlen levél.' });

  let body: { locale?: unknown; fields?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Hibás kérés.' });
  }
  const locale = String(body.locale ?? '');
  if (!isLocale(locale) || !localesOf(message).includes(locale)) return json(400, { ok: false, error: 'Ismeretlen nyelv.' });

  const fail = (error: { code?: string | null; message?: string | null }) =>
    isMissingMailSchema(error)
      ? json(409, { ok: false, setup: true, error: 'A szerkesztéshez előbb le kell futtatni a 0040_system_mail_texts.sql migrációt a Supabase-ben.' })
      : json(500, { ok: false, error: friendlyError(error.message ?? '') });

  let overlay: Record<string, string> = {};
  if (body.action !== 'reset') {
    if (!body.fields || typeof body.fields !== 'object') return json(400, { ok: false, error: 'Hibás kérés.' });
    const result = overlayFrom(message, locale, body.fields as Record<string, unknown>);
    if (!result.ok) return json(422, { ok: false, error: result.error, field: result.field });
    overlay = result.overlay;
  }

  if (Object.keys(overlay).length === 0) {
    const { error } = await supabase.from('mail_system_texts').delete().eq('key', message.key).eq('locale', locale);
    if (error) return fail(error);
  } else {
    const { error } = await supabase
      .from('mail_system_texts')
      .upsert({ key: message.key, locale, fields: overlay, updated_by: user?.id ?? null }, { onConflict: 'key,locale' });
    if (error) return fail(error);
  }

  invalidateSystemTexts();
  await logEvent({
    kind: Object.keys(overlay).length ? 'mail.system_text_saved' : 'mail.system_text_reset',
    actorId: user?.id ?? null, actorEmail: profile?.email ?? null,
    subjectType: 'mail_system_text', subjectId: `${message.key}:${locale}`, locale, source: 'portal',
    payload: { fields: Object.keys(overlay) },
  }).catch(() => {});

  return json(200, { ok: true, edited: Object.keys(overlay).length > 0, fields: Object.keys(overlay) });
};
