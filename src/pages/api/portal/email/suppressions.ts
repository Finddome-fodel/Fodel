/** Blocks an address by hand, or lifts a block (`action=remove`). Lifting an unsubscribe is the admin's call and is logged. */
import type { APIRoute } from 'astro';
import { friendlyError } from '~/lib/portal/labels';
import { isValidEmailAddress, normalizeEmailAddress, suppress } from '~/lib/mail/suppression';
import { logEvent } from '~/lib/activity';
import { mailSchemaReady, SETUP_PATH } from '~/lib/mail/schema';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const { supabase } = locals;
  if (!(await mailSchemaReady(supabase))) return redirect(SETUP_PATH);
  const form = await request.formData();
  const back = (query: string) => redirect(`/portal/email/suppressions?${query}`);

  if (form.get('action') === 'remove') {
    const id = String(form.get('id') ?? '');
    const { data: row } = await supabase.from('mail_suppressions').select('email, reason').eq('id', id).maybeSingle();
    const { error } = await supabase.from('mail_suppressions').delete().eq('id', id);
    if (error) return back(`error=${encodeURIComponent(friendlyError(error.message))}`);
    await logEvent({
      kind: 'mail.suppression_removed', actorId: locals.user?.id ?? null, actorEmail: locals.profile?.email ?? null,
      subjectType: 'mail_suppression', subjectId: id, source: 'portal', payload: { reason: row?.reason ?? null },
    }).catch(() => {});
    return back('removed=1');
  }

  const email = normalizeEmailAddress(String(form.get('email') ?? ''));
  if (!isValidEmailAddress(email)) return back(`error=${encodeURIComponent('Érvénytelen e-mail-cím.')}`);
  try {
    await suppress(supabase, { email, reason: 'MANUAL', note: String(form.get('note') ?? '').trim().slice(0, 300) || null, createdBy: locals.user!.id });
  } catch (error) {
    return back(`error=${encodeURIComponent(friendlyError(error instanceof Error ? error.message : String(error)))}`);
  }
  return back('added=1');
};
