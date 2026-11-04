/**
 * The languages a listing is published in: switching them off and on.
 *
 * POST { excluded: string[] }   the complete list of languages that are switched off
 *
 * The listing's owner and any admin may do this, at any time, on a draft or a live listing. Only languages the
 * listing is entitled to can be switched off; the original never; English never (a request that names it gets
 * `exclude-en`, it is not trimmed). The package price does not change either way. The text of a language that is
 * switched off is kept, so switching it back on is instant and free.
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { getCompany } from '~/lib/runtime-config';
import { listingCatalog } from '~/lib/listing-packages';
import { setExclusions } from '~/lib/ai/translation-entitlement';
import { friendlyError } from '~/lib/portal/labels';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const MESSAGE: Record<string, string> = {
  'exclude-en': 'Az angol nyelv nem zárható ki – ez a hirdetés alapnyelve a többi nyelvhez.',
  'is-source': 'A hirdetés eredeti nyelve nem zárható ki.',
  'schema-missing': 'Futtassa le a 0053-es migrációt.',
  'save-failed': 'A mentés most nem sikerült. Próbálja újra.',
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { supabase, user, profile } = locals;
  if (!user || !params.id) return json(401, { ok: false, error: 'unauthenticated' });
  // The session client sees only what the person may see: a listing that is not theirs is simply not found.
  const { data: property } = await supabase.from('properties').select('id, owner_id').eq('id', params.id).maybeSingle();
  if (!property) return json(404, { ok: false, error: 'not-found' });
  const isAdmin = profile?.role === 'admin';
  if (!isAdmin && property.owner_id !== user.id) return json(403, { ok: false, error: 'forbidden' });

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.excluded)) return json(422, { ok: false, error: 'bad-request', message: 'Hiányzik a kizárt nyelvek listája.' });

  const cfg = listingCatalog((await getCompany()).services).translation;
  const result = await setExclusions(
    createSupabaseAdminClient(), property.id, body.excluded.map(String), cfg, { id: user.id, email: profile?.email ?? null }, new URL(request.url).origin
  );
  if (!result.ok) return json(result.error === 'save-failed' ? 500 : 422, { ok: false, error: result.error, message: MESSAGE[result.error] ?? friendlyError(result.error) });
  return json(200, { ok: true, excluded: result.excluded, added: result.added, removed: result.removed, queued: result.queued });
};
