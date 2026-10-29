/**
 * Email preview — development, or a signed-in admin in production.
 *
 * This is the read-only preview of the built-in wording. Editing the
 * wording of the system emails happens in the portal, at /portal/email/system,
 * which previews the same templates from the same sample data
 * (src/lib/email/samples.ts) — but with an admin's saved edits laid over the
 * built-in copy (src/lib/email/system-texts.ts).
 *
 * In `astro dev` it is open to anyone, same as always. In production it 404s
 * for everyone except a signed-in admin — still renders arbitrary templates
 * with fixture data, never real customer data, so the risk is "a competitor
 * sees our email copy," not a data leak.
 *
 *   /dev/emails                            → index of everything
 *   /dev/emails?t=published&locale=nl      → rendered HTML
 *   /dev/emails?t=published&format=text    → the plain-text alternative
 */
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '~/lib/supabase-server';
import { CASES } from '~/lib/email/samples';
import { LOCALES, type Locale } from '~/i18n/ui';

export const prerender = false;

function index(): string {
  const rows = Object.keys(CASES)
    .map(
      (key) => `<tr>
        <td>${key}</td>
        <td>${LOCALES.map((code) => `<a href="/dev/emails?t=${key}&locale=${code}">${code.toUpperCase()}</a>`).join(' · ')}</td>
        <td>${LOCALES.map((code) => `<a href="/dev/emails?t=${key}&locale=${code}&format=text">${code.toUpperCase()} text</a>`).join(' · ')}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html><meta charset="utf-8"><title>FINDDOME email preview</title>
<style>
  body { font: 15px/1.7 system-ui, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 24px; color: #102a43; }
  h1 { font-size: 22px; margin-bottom: 6px; }
  p { color: #475457; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  td { padding: 9px 12px 9px 0; border-bottom: 1px solid #d0d4d6; }
  td:first-child { font-family: ui-monospace, monospace; font-size: 13px; }
  a { color: #102a43; }
</style>
<h1>Email preview</h1>
<p>Development only. Open one, then use “view source” to copy the raw HTML into
a real client — Outlook on Windows is the renderer that decides whether this
works.</p>
<table>${rows}</table>`;
}

export const GET: APIRoute = async ({ url, request, cookies }) => {
  if (!import.meta.env.DEV) {
    // Not under /portal or /api/portal, so src/middleware.ts never ran for
    // this request — the admin check has to happen here, once, rather than
    // widening that middleware's scope for one dev tool.
    const supabase = createSupabaseServerClient(request, cookies);
    const { data } = await supabase.auth.getUser();
    if (!data.user) return new Response('Not found', { status: 404 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    if (profile?.role !== 'admin') return new Response('Not found', { status: 404 });
  }

  const key = url.searchParams.get('t');
  if (!key) {
    return new Response(index(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  const build = CASES[key];
  if (!build) return new Response(`Unknown template: ${key}`, { status: 404 });

  const asked = url.searchParams.get('locale') ?? '';
  const locale: Locale = (LOCALES as readonly string[]).includes(asked) ? (asked as Locale) : 'hu';
  const email = await build(locale);
  if (!email) return new Response(`No email for ${key} in ${locale}`, { status: 404 });

  if (url.searchParams.get('format') === 'text') {
    return new Response(`Subject: ${email.subject}\n\n${email.text}`, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(email.html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
};
