/** Deletes one newsletter subscriber (the admin's erasure action). Logged; the email itself is not kept in the log. */
import type { APIRoute } from 'astro';
import { logEvent } from '~/lib/activity';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { supabase, profile, user } = locals;
  if (profile?.role !== 'admin') return json(403, { ok: false });
  const { error, count } = await supabase.from('newsletter_subscribers').delete({ count: 'exact' }).eq('id', params.id!);
  if (error) return json(500, { ok: false, error: error.message });
  await logEvent({
    kind: 'newsletter.deleted', actorId: user?.id ?? null, actorEmail: profile?.email ?? null,
    subjectType: 'newsletter', subjectId: params.id, source: 'portal',
  }).catch(() => {});
  return json(200, { ok: true, deleted: count ?? 0 });
};
