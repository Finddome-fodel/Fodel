/**
 * Creates a bulk send. The recipient list is recomputed here from the filters
 * the form carries — never taken from the browser as a list — then checked
 * against the suppression list and frozen into the job. "Now" sends the first
 * batch before answering; the rest (and every scheduled job) goes from the
 * cron, or from "Folytatás most" on the job page.
 */
import type { APIRoute } from 'astro';
import { friendlyError } from '~/lib/portal/labels';
import { filtersFrom, filterEntries, findRecipients, preflight } from '~/lib/mail/audience';
import { createJob, processJob, resolveScheduledAt } from '~/lib/mail/jobs';
import { unfinishedParts } from '~/lib/mail/editable';
import { logEvent } from '~/lib/activity';
import { mailSchemaReady, SETUP_PATH } from '~/lib/mail/schema';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const { supabase } = locals;
  if (!(await mailSchemaReady(supabase))) return redirect(SETUP_PATH);
  const form = await request.formData();
  const filters = filtersFrom((key) => {
    const value = form.get(`filter_${key}`);
    return typeof value === 'string' ? value : null;
  });
  const backQuery = new URLSearchParams(filterEntries(filters));
  const fail = (message: string) => {
    backQuery.set('error', message);
    return redirect(`/portal/email/bulk?${backQuery}`);
  };

  const templateId = String(form.get('templateId') ?? '').trim();
  if (!templateId) return fail('Válasszon sablont.');
  const { data: template } = await supabase.from('mail_templates').select('id, name, active, body_html').eq('id', templateId).maybeSingle();
  if (!template?.active) return fail('A kiválasztott sablon nincs aktiválva.');
  const unfinished = unfinishedParts(template.body_html);
  if (unfinished.length) return fail(`A sablonban még kitöltendő részek vannak: ${unfinished.join(', ')}`);

  const mode = form.get('scheduleMode') === 'SPECIFIC' ? 'SPECIFIC' : 'NOW';
  const local = String(form.get('scheduledAt') ?? '').trim();
  if (mode === 'SPECIFIC' && !local) return fail('Adja meg a küldés időpontját.');
  const scheduledAt = resolveScheduledAt(mode, local);
  if (mode === 'SPECIFIC' && new Date(scheduledAt).getTime() < Date.now() - 60_000) return fail('Az időpont már elmúlt.');

  const check = await preflight(supabase, await findRecipients(supabase, filters));
  if (check.sendable.length === 0) return fail('A jelenlegi szűréssel nincs kinek küldeni.');

  let jobId: string;
  try {
    jobId = await createJob(supabase, {
      createdBy: locals.user!.id,
      templateId,
      name: String(form.get('name') ?? '').trim().slice(0, 120) || null,
      scheduledAt,
      filters,
      recipients: check.sendable,
    });
  } catch (error) {
    return fail(friendlyError(error instanceof Error ? error.message : String(error)));
  }

  await logEvent({
    kind: 'mail.job_created', actorId: locals.user?.id ?? null, actorEmail: locals.profile?.email ?? null,
    subjectType: 'mail_job', subjectId: jobId, source: 'portal',
    payload: { template: template.name, recipients: check.sendable.length, scheduledAt, audience: filters.audience },
  }).catch(() => {});

  if (mode === 'NOW') {
    try {
      await processJob(supabase, jobId);
    } catch (error) {
      // The job is saved; the cron or "Folytatás most" picks up where this stopped.
      console.error('[mail] first batch failed', error);
    }
  }
  return redirect(`/portal/email/jobs/${jobId}?created=1`);
};
