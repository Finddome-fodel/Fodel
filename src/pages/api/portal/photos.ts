import type { APIRoute } from 'astro';
import { parseDecisions } from '~/lib/portal/photo-moderation';
import { reviewPhotos } from '~/lib/portal/photo-review';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The admin's decisions on photos added to a live listing (§4c part 2):
 * `{ propertyId, decisions: [{ id, action: 'approve' | 'reject', reason?, note? }] }`.
 * Admin-only twice over: the middleware (ADMIN_ONLY_PREFIXES) and the check
 * below; RLS lets only an admin clear `pending` anyway (0054).
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, profile, user } = locals;
  if (!user || profile?.role !== 'admin') return json(403, { ok: false, error: 'forbidden' });
  const body = await request.json().catch(() => ({}));
  const propertyId = typeof body.propertyId === 'string' ? body.propertyId : '';
  if (!UUID.test(propertyId)) return json(400, { ok: false, error: 'invalid-listing' });
  const parsed = parseDecisions(body.decisions);
  if (!parsed.ok) return json(422, { ok: false, error: parsed.error });
  const result = await reviewPhotos(supabase, { id: user.id, email: profile?.email ?? null }, propertyId, parsed.decisions);
  if (!result.ok) return json(result.status, { ok: false, error: result.error });
  return json(200, result);
};
