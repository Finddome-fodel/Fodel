/**
 * Bulk and scheduled sends.
 *
 * A job freezes its recipients into mail_send_recipients when it is created.
 * processJob() then works through them in batches it *claims* atomically
 * (claim_mail_send_recipients, `for update skip locked`), so two runs on the
 * same job — the minute cron and an admin's "send now" — never send to the
 * same person, and a run that is cut off part-way leaves the rest PENDING for
 * the next one. Every call has a time budget and returns well inside the
 * function limit; whatever is left is picked up by the next call.
 *
 * Who calls it: creating a job with "now" (first batch inline), the job page's
 * "Folytatás most", the scheduled-jobs page on load, /api/cron/mail (every
 * minute via Supabase pg_cron, daily via Vercel as a safety net).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { logEvent } from '~/lib/activity';
import type { BulkFilters } from './audience';
import { sendTemplateEmail, type Recipient } from './send';
import { isMissingMailSchema } from './schema';

type Client = SupabaseClient<any, any, any>;

export type JobStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'CANCELLED';

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  DRAFT: 'Piszkozat',
  SCHEDULED: 'Ütemezve',
  RUNNING: 'Küldés folyamatban',
  COMPLETED: 'Kész',
  PARTIAL: 'Részben sikerült',
  FAILED: 'Sikertelen',
  CANCELLED: 'Lemondva',
};

export const JOB_STATUS_PILL: Record<JobStatus, string> = {
  DRAFT: 'pill-draft',
  SCHEDULED: 'pill-queued',
  RUNNING: 'pill-pending',
  COMPLETED: 'pill-ok',
  PARTIAL: 'pill-warn',
  FAILED: 'pill-bad',
  CANCELLED: 'pill-cancelled',
};

export const RECIPIENT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Sorban áll',
  PROCESSING: 'Küldés alatt',
  SENT: 'Elküldve',
  FAILED: 'Sikertelen',
  SKIPPED_SUPPRESSED: 'Letiltott cím — kihagyva',
  CANCELLED: 'Nem ment ki (leállítva)',
};

/** One run's time budget. Short enough for any Vercel plan's function limit; the cron runs every minute. */
const DEFAULT_BUDGET_MS = Number(process.env.MAIL_JOB_BUDGET_MS) || 8_000;
const BATCH_SIZE = 10;

/* ── Scheduling in Budapest time ─────────────────────────────────────────── */

const ZONE = 'Europe/Budapest';

/**
 * `<input type="datetime-local">` gives a naive "2026-11-03T14:30" — the
 * admin's wall clock in Budapest. The server runs in UTC, so reading it as
 * local time would be one or two hours off depending on the season.
 */
export function budapestLocalToUtcIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const naiveAsUtc = new Date(`${local}:00Z`);
  if (Number.isNaN(naiveAsUtc.getTime())) return null;
  const wall = new Intl.DateTimeFormat('sv-SE', {
    timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(naiveAsUtc);
  const offsetMs = new Date(`${wall.replace(' ', 'T')}Z`).getTime() - naiveAsUtc.getTime();
  return new Date(naiveAsUtc.getTime() - offsetMs).toISOString();
}

export function resolveScheduledAt(mode: string, local: string, now = new Date()): string {
  if (mode === 'SPECIFIC' && local) {
    const resolved = budapestLocalToUtcIso(local);
    if (resolved) return resolved;
  }
  return now.toISOString();
}

export function budapestDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('hu-HU', { timeZone: ZONE, dateStyle: 'medium', timeStyle: 'short' });
}

/* ── Create ──────────────────────────────────────────────────────────────── */

export async function createJob(
  client: Client,
  params: { createdBy: string; templateId: string; name: string | null; scheduledAt: string; filters: BulkFilters; recipients: Recipient[] }
): Promise<string> {
  const { data: job, error } = await client
    .from('mail_send_jobs')
    .insert({
      created_by: params.createdBy,
      template_id: params.templateId,
      name: params.name,
      status: 'SCHEDULED',
      scheduled_at: params.scheduledAt,
      filter_snapshot: params.filters,
      total_recipients: params.recipients.length,
    })
    .select('id')
    .single();
  if (error || !job) throw new Error(error?.message ?? 'A küldést nem sikerült létrehozni.');

  const rows = params.recipients.map((r) => ({
    job_id: job.id,
    email: r.email.trim().toLowerCase(),
    name: r.name,
    locale: r.locale,
    audience: r.audience ?? 'owner',
    audience_id: r.audienceId ?? null,
    property_id: r.propertyId ?? null,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error: insertError } = await client.from('mail_send_recipients').insert(rows.slice(i, i + 500));
    if (insertError) {
      // A job with half its recipients would look complete when it is not.
      await client.from('mail_send_jobs').delete().eq('id', job.id);
      throw new Error(insertError.message);
    }
  }
  return job.id;
}

/* ── Process ─────────────────────────────────────────────────────────────── */

/** Final state from the settled counts. */
export function finalStatus(counts: { sent: number; failed: number; skipped: number }): 'COMPLETED' | 'PARTIAL' | 'FAILED' {
  if (counts.failed === 0 && counts.skipped === 0) return 'COMPLETED';
  return counts.sent > 0 ? 'PARTIAL' : 'FAILED';
}

/** Counters are rewritten from live counts, never accumulated, so two concurrent runs cannot lose an update. */
async function syncCounts(client: Client, jobId: string) {
  const count = async (status: string) =>
    (await client.from('mail_send_recipients').select('id', { count: 'exact', head: true }).eq('job_id', jobId).eq('status', status)).count ?? 0;
  const [sent, failed, skipped] = await Promise.all([count('SENT'), count('FAILED'), count('SKIPPED_SUPPRESSED')]);
  await client.from('mail_send_jobs').update({ sent_count: sent, failed_count: failed, skipped_count: skipped }).eq('id', jobId);
  return { sent, failed, skipped };
}

export async function processJob(client: Client, jobId: string, budgetMs = DEFAULT_BUDGET_MS): Promise<{ processed: number; done: boolean }> {
  const startedAt = Date.now();
  const { data: job } = await client.from('mail_send_jobs').select('*').eq('id', jobId).maybeSingle();
  if (!job || ['CANCELLED', 'COMPLETED', 'PARTIAL', 'FAILED', 'DRAFT'].includes(job.status)) return { processed: 0, done: true };
  // A job set for 14:30 is not sent at 14:10 because someone opened its page.
  if (job.scheduled_at && new Date(job.scheduled_at) > new Date()) return { processed: 0, done: false };

  if (job.status === 'SCHEDULED') {
    await client.from('mail_send_jobs').update({ status: 'RUNNING', started_at: job.started_at ?? new Date().toISOString() }).eq('id', jobId).eq('status', 'SCHEDULED');
  }

  let processed = 0;
  while (Date.now() - startedAt < budgetMs) {
    // Re-read every batch: the job may have been cancelled (or, between the read
    // above and the switch to RUNNING, cancelled before it started). The claim
    // itself also hands out nothing unless the job is RUNNING.
    if (!(await isRunning(client, jobId))) break;
    const { data: batch, error } = await client.rpc('claim_mail_send_recipients', { p_job_id: jobId, p_batch_size: BATCH_SIZE });
    if (error) throw new Error(error.message);
    if (!batch || batch.length === 0) break;

    for (const row of batch as any[]) {
      const result = await sendTemplateEmail(client, {
        templateId: job.template_id,
        recipient: { email: row.email, name: row.name, locale: row.locale, audience: row.audience, audienceId: row.audience_id, propertyId: row.property_id },
        source: 'BULK_JOB',
        sentBy: job.created_by,
        jobId,
        // Stable across a run that dies mid-send and is picked up again (Resend
        // then answers with the first send instead of mailing twice); a
        // deliberate "send the failed ones again" gets a fresh key.
        idempotencyKey: `mail-job/${jobId}/${row.id}/${row.retried_at ? Date.parse(row.retried_at) : 0}`,
      });
      processed += 1;
      const update = 'error' in result
        ? { status: result.code === 'SUPPRESSED' ? 'SKIPPED_SUPPRESSED' : 'FAILED', error_message: result.error, sent_at: new Date().toISOString() }
        : { status: 'SENT', message_id: result.messageId || null, error_message: null, sent_at: new Date().toISOString() };
      await client.from('mail_send_recipients').update(update).eq('id', row.id);
    }
    await syncCounts(client, jobId);
    if (batch.length < BATCH_SIZE) break;
  }

  const { count: remaining } = await client
    .from('mail_send_recipients')
    .select('id', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .in('status', ['PENDING', 'PROCESSING']);
  const done = (remaining ?? 0) === 0;
  if (done && (await isRunning(client, jobId))) {
    const counts = await syncCounts(client, jobId);
    const status = finalStatus(counts);
    const { data: closed } = await client
      .from('mail_send_jobs')
      .update({ status, completed_at: new Date().toISOString() })
      .eq('id', jobId)
      .eq('status', 'RUNNING')
      .select('id');
    // Only the run that closed the job logs it.
    if ((closed ?? []).length === 1) {
      await logEvent({
        kind: 'mail.job_completed', actorId: job.created_by, subjectType: 'mail_job', subjectId: jobId, source: 'portal',
        payload: { name: job.name, status, ...counts },
      }).catch(() => {});
    }
  }
  return { processed, done };
}

async function isRunning(client: Client, jobId: string): Promise<boolean> {
  const { data } = await client.from('mail_send_jobs').select('status').eq('id', jobId).maybeSingle();
  return data?.status === 'RUNNING';
}

/** Every due job, within one overall budget — the cron's entry point. */
export async function processDueJobs(client: Client, totalBudgetMs = DEFAULT_BUDGET_MS): Promise<{ jobs: number; processed: number }> {
  const startedAt = Date.now();
  const { data: due, error } = await client
    .from('mail_send_jobs')
    .select('id')
    .in('status', ['SCHEDULED', 'RUNNING'])
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at');
  // Before migration 0038 there is nothing to send; any other failure is real.
  if (error && isMissingMailSchema(error)) return { jobs: 0, processed: 0 };
  if (error) throw new Error(error.message);
  let jobs = 0;
  let processed = 0;
  for (const job of due ?? []) {
    const left = totalBudgetMs - (Date.now() - startedAt);
    if (left < 1_500) break;
    processed += (await processJob(client, job.id, left)).processed;
    jobs += 1;
  }
  return { jobs, processed };
}

/**
 * A failed recipient never just disappears: the admin can send it again. No
 * mail_messages row exists for a failed send, so the retry cannot duplicate.
 */
export async function retryFailed(client: Client, jobId: string): Promise<void> {
  // Only a finished send: a cancelled one stays cancelled.
  const { data: job } = await client.from('mail_send_jobs').select('status').eq('id', jobId).maybeSingle();
  if (!job || !['COMPLETED', 'PARTIAL', 'FAILED'].includes(job.status)) return;
  const { error } = await client
    .from('mail_send_recipients')
    .update({ status: 'PENDING', error_message: null, claimed_at: null, retried_at: new Date().toISOString() })
    .eq('job_id', jobId)
    .eq('status', 'FAILED');
  if (error) throw new Error(error.message);
  await client.from('mail_send_jobs').update({ status: 'RUNNING', completed_at: null }).eq('id', jobId).in('status', ['COMPLETED', 'PARTIAL', 'FAILED']);
}

/**
 * Before it starts, or while it is going out. Stopping a running send lets
 * the batch in hand (at most 10 emails) finish; everyone still waiting is
 * marked CANCELLED and never gets it. What already went out stays counted.
 */
export async function cancelJob(client: Client, jobId: string): Promise<boolean> {
  const { data } = await client
    .from('mail_send_jobs')
    .update({ status: 'CANCELLED', completed_at: new Date().toISOString() })
    .eq('id', jobId)
    .in('status', ['DRAFT', 'SCHEDULED', 'RUNNING'])
    .select('id');
  if ((data ?? []).length !== 1) return false;
  await client.from('mail_send_recipients').update({ status: 'CANCELLED', claimed_at: null }).eq('job_id', jobId).eq('status', 'PENDING');
  // A row a killed run left in PROCESSING would otherwise read "Küldés alatt" forever.
  const stale = new Date(Date.now() - 5 * 60_000).toISOString();
  await client.from('mail_send_recipients').update({ status: 'CANCELLED', claimed_at: null }).eq('job_id', jobId).eq('status', 'PROCESSING').lt('claimed_at', stale);
  await syncCounts(client, jobId);
  return true;
}
