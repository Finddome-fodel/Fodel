/**
 * Renders one system email on sample data with the editor's unsaved fields
 * applied — the editor's live preview. Nothing is stored and nothing is sent.
 */
import type { APIRoute } from 'astro';
import { isLocale } from '~/i18n/ui';
import { findMessage, localesOf, overlayFrom, previewMessage } from '~/lib/email/system-messages';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, locals }) => {
  if (locals.profile?.role !== 'admin') return json(403, { ok: false });
  let body: { key?: unknown; locale?: unknown; fields?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false });
  }
  const message = findMessage(String(body.key ?? ''));
  const locale = String(body.locale ?? '');
  if (!message || message.href || !isLocale(locale) || !localesOf(message).includes(locale)) return json(404, { ok: false });

  // A half-typed field (empty, or an unknown {{placeholder}}) is not an error while typing:
  // the preview keeps showing the last good wording for that field, so it never flickers to a hole.
  const fields: Record<string, string> = {};
  for (const [field, value] of Object.entries((body.fields ?? {}) as Record<string, unknown>)) {
    if (typeof value !== 'string') continue;
    const one = overlayFrom(message, locale, { [field]: value });
    if (one.ok && one.overlay[field] !== undefined) fields[field] = one.overlay[field];
  }
  const email = await previewMessage(message, locale, fields);
  if (!email) return json(404, { ok: false });
  return json(200, { ok: true, subject: email.subject, html: email.html });
};
