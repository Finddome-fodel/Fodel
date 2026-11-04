import type { APIRoute } from 'astro';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/**
 * The owner closes a "these photos were not published" notice (0054:
 * property_media_rejections). RLS lets only the listing's owner (or an
 * admin) touch it, and a trigger lets the owner change nothing but
 * `dismissed_at`.
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const { supabase, user } = locals;
  if (!user) return json(401, { ok: false, error: 'unauthorized' });
  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.filter((v: unknown) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)).slice(0, 50) : [];
  if (!ids.length) return json(400, { ok: false, error: 'no-notice' });
  const { error } = await supabase
    .from('property_media_rejections')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('property_id', params.id)
    .in('id', ids)
    .is('dismissed_at', null);
  if (error) return json(500, { ok: false, error: 'save-failed' });
  return json(200, { ok: true });
};
