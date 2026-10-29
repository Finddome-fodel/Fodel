/** A bulk send's buttons: cancel (before it starts), continue now, resend the failed ones. */
import type { APIRoute } from 'astro';
import { cancelJob, processJob, retryFailed } from '~/lib/mail/jobs';

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const { supabase } = locals;
  const id = params.id!;
  const action = String((await request.formData()).get('action') ?? '');
  const back = (query = '') => redirect(`/portal/email/jobs/${id}${query ? `?${query}` : ''}`);

  try {
    if (action === 'cancel') {
      const cancelled = await cancelJob(supabase, id);
      return cancelled ? redirect('/portal/email/scheduled?cancelled=1') : back(`error=${encodeURIComponent('Csak még el nem indult küldés mondható le.')}`);
    }
    if (action === 'retry') await retryFailed(supabase, id);
    if (action === 'retry' || action === 'continue') await processJob(supabase, id);
  } catch (error) {
    return back(`error=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`);
  }
  return back();
};
