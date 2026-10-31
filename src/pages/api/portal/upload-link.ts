/**
 * The free upload link, for admins: read it (made the first time it is asked
 * for), turn it off or on, or replace it with a new one. Admin-only twice over:
 * the middleware prefix and the check below; the table's RLS says the same.
 */
import type { APIRoute } from 'astro';
import { ensureUploadLink, rotateUploadLink, setUploadLinkEnabled, uploadLinkUrl } from '~/lib/portal/upload-link';
import { logEvent } from '~/lib/activity';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const NOT_READY = 'Az ingyenes feltöltő link még nincs bekapcsolva. Futtassa le a 0044-es migrációt a Supabase SQL Editorban.';

async function current(locals: App.Locals, request: Request) {
  const { row, missingSchema } = await ensureUploadLink(locals.supabase);
  if (missingSchema || !row) return json(503, { ok: false, error: NOT_READY });
  return json(200, { ok: true, url: uploadLinkUrl(new URL(request.url).origin, row.token), enabled: row.enabled });
}

export const GET: APIRoute = async ({ locals, request }) => {
  if (locals.profile?.role !== 'admin') return json(403, { ok: false, error: 'forbidden' });
  try {
    return await current(locals, request);
  } catch (error) {
    console.error('[upload-link] read failed', error);
    return json(500, { ok: false, error: 'Nem sikerült betölteni a linket.' });
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (locals.profile?.role !== 'admin') return json(403, { ok: false, error: 'forbidden' });
  const body = await request.json().catch(() => ({}));
  const action = (body as { action?: string }).action;
  if (action !== 'rotate' && action !== 'enable' && action !== 'disable') return json(400, { ok: false, error: 'Ismeretlen művelet.' });

  try {
    if (action === 'rotate') await rotateUploadLink(locals.supabase);
    else await setUploadLinkEnabled(locals.supabase, action === 'enable');
  } catch (error) {
    if ((error as Error).message === 'missing-schema') return json(503, { ok: false, error: NOT_READY });
    console.error('[upload-link] change failed', error);
    return json(500, { ok: false, error: 'Nem sikerült a módosítás.' });
  }

  await logEvent({
    kind: `upload_link.${action}`,
    actorId: locals.user!.id,
    actorEmail: locals.profile?.email ?? null,
    subjectType: 'upload_link',
    source: 'portal',
  }).catch(() => {});

  return current(locals, request);
};
