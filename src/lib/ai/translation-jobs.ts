/**
 * Translation jobs: asking for them, running them, and the admin's decisions.
 *
 * One row per listing + language (translation_jobs, migration 0043). The same
 * shape as the mail queue (src/lib/mail/jobs.ts): rows are *claimed* atomically
 * (`for update skip locked`), so the cron, a "Folytatás most" click and the
 * self-kick below can all run at once without translating anything twice; a
 * run that is cut off leaves its rows to the next one; every run has a time
 * budget; and the daily cron is only a safety net.
 *
 * Money and text safety, in the order they matter:
 *  - nothing here charges anyone. Paid jobs are created only from a payment
 *    that is already settled, with the languages read from the stored order.
 *  - a person's text is never replaced unless an admin said so for that job:
 *    checked when the job is created, again when it runs, and finally by the
 *    database itself (save_machine_translation).
 *  - a failed or bad answer is never saved: translate.ts checks it first.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { logEvent } from '~/lib/activity';
import { isAiEnabled } from './client';
import { translateListing, translationModel } from './translate';
import {
  TranslationCheckError, classifyFailure, estimateCostMicroEur, failCodeOf, isTargetLocale, listingChars, listingText, pickSource,
  retryFeedback, sourceHash, type ListingText,
} from './translate-core';
import { notifyTranslationStopped } from './translation-alerts';

type Client = SupabaseClient<any, any, any>;

export type JobOrigin = 'upload_paid' | 'after_publish_paid' | 'admin' | 'free' | 'package';

/** Fixed number of attempts per job (also enforced in claim_translation_jobs). */
export const MAX_ATTEMPTS = 3;
const CONCURRENCY = 3;
const DEFAULT_BUDGET_MS = Number(process.env.TRANSLATION_BUDGET_MS) || 100_000;

/** Millionths of a euro. Beyond this a day's jobs wait until tomorrow. */
export function dailyCapMicroEur(): number {
  const euros = Number(import.meta.env.TRANSLATION_DAILY_CAP_EUR);
  return Math.round((Number.isFinite(euros) && euros > 0 ? euros : 5) * 1_000_000);
}

/** PostgREST / Postgres "no such table or function": migration 0043 has not been run yet. */
export function isMissingTranslationSchema(error: { code?: string | null; message?: string | null } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && ['42P01', 'PGRST205', 'PGRST202', '42883'].includes(error.code)) return true;
  return /translation_jobs|claim_translation_jobs|save_machine_translation|machine/.test(error.message ?? '') && /does not exist|schema cache|could not find/i.test(error.message ?? '');
}

/** A column from migration 0051 is missing: write the same change without it. */
function isMissingColumn(error: { code?: string | null; message?: string | null } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && ['42703', 'PGRST204'].includes(error.code)) return true;
  return /column/i.test(error.message ?? '') && /does not exist|schema cache|could not find/i.test(error.message ?? '');
}

/** The columns 0051 added to translation_jobs. Before it has been run, only the older ones are written. */
const EXTRA_JOB_COLUMNS = ['fail_code', 'partial_output', 'feedback'];

/** Updates a running job; if 0051 is not there yet, writes the same change without the new columns. */
async function updateRunningJob(client: Client, jobId: string, patch: Record<string, unknown>): Promise<void> {
  const attempt = (body: Record<string, unknown>) => client.from('translation_jobs').update(body).eq('id', jobId).eq('status', 'running');
  const { error } = await attempt(patch);
  if (error && isMissingColumn(error)) {
    const base = Object.fromEntries(Object.entries(patch).filter(([key]) => !EXTRA_JOB_COLUMNS.includes(key)));
    await attempt(base);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ── Asking for translations ───────────────────────────────────────────── */

export type SkipReason = 'invalid' | 'no-source' | 'is-source' | 'has-text' | 'already-live' | 'already-ordered';

export type EnqueueResult = {
  created: string[];
  skipped: { locale: string; reason: SkipReason }[];
};

export const SKIP_REASON_HU: Record<SkipReason, string> = {
  invalid: 'ismeretlen nyelv',
  'no-source': 'nincs forrásszöveg',
  'is-source': 'ez az eredeti nyelv',
  'has-text': 'már van kézzel írt szöveg',
  'already-live': 'már folyamatban van',
  'already-ordered': 'ehhez a fizetéshez már létrejött',
};

/**
 * Creates one job per language. Safe to call twice with the same arguments:
 * a language that already has a live job, or (for a paid order) already has a
 * job from that same payment, is skipped, never doubled.
 *
 * `status: 'requested'` is the free-link owner's request waiting for an admin;
 * `'queued'` runs as soon as a worker is free.
 */
export async function enqueueTranslations(
  client: Client,
  opts: {
    propertyId: string;
    locales: string[];
    origin: JobOrigin;
    status?: 'requested' | 'queued';
    paymentId?: string | null;
    requestedBy?: string | null;
    approvedBy?: string | null;
    /** An admin chose to replace a person's text in these languages. */
    overwrite?: boolean;
  }
): Promise<EnqueueResult> {
  const result: EnqueueResult = { created: [], skipped: [] };
  const wanted = [...new Set(opts.locales)];
  for (const locale of wanted.filter((code) => !isTargetLocale(code))) result.skipped.push({ locale, reason: 'invalid' });
  const locales = wanted.filter(isTargetLocale);
  if (locales.length === 0) return result;

  const { data: rows, error: rowsError } = await client
    .from('property_translations')
    .select('locale, title, description, body, machine')
    .eq('property_id', opts.propertyId);
  if (rowsError) throw new Error(rowsError.message);
  const source = pickSource(rows ?? []);
  if (!source) {
    for (const locale of locales) result.skipped.push({ locale, reason: 'no-source' });
    return result;
  }
  const text = listingText(source);
  const hash = sourceHash(text);
  const estimate = estimateCostMicroEur(listingChars(text), translationModel());

  let ordered = new Set<string>();
  if (opts.paymentId) {
    const { data: earlier } = await client.from('translation_jobs').select('locale').eq('payment_id', opts.paymentId);
    ordered = new Set((earlier ?? []).map((job: { locale: string }) => job.locale));
  }

  for (const locale of locales) {
    if (locale === source.locale) { result.skipped.push({ locale, reason: 'is-source' }); continue; }
    if (ordered.has(locale)) { result.skipped.push({ locale, reason: 'already-ordered' }); continue; }
    const existing = (rows ?? []).find((row: { locale: string }) => row.locale === locale);
    if (existing && !existing.machine && (listingText(existing).title || listingText(existing).description) && !opts.overwrite) {
      result.skipped.push({ locale, reason: 'has-text' });
      continue;
    }
    const { error } = await client.from('translation_jobs').insert({
      property_id: opts.propertyId,
      locale,
      source_locale: source.locale,
      origin: opts.origin,
      status: opts.status ?? 'queued',
      payment_id: opts.paymentId ?? null,
      requested_by: opts.requestedBy ?? null,
      approved_by: opts.approvedBy ?? null,
      overwrite: Boolean(opts.overwrite),
      source_hash: hash,
      estimated_cost_micro_eur: estimate,
    });
    if (!error) { result.created.push(locale); continue; }
    if (error.code === '23505' || /duplicate key/i.test(error.message)) { result.skipped.push({ locale, reason: 'already-live' }); continue; }
    throw new Error(error.message);
  }
  return result;
}

/* ── An admin decides on a free-link owner's request ───────────────────── */

/** Approving moves the request to the queue; the worker re-checks everything when it runs. */
export async function approveRequests(client: Client, jobIds: string[], adminId: string): Promise<number> {
  if (jobIds.length === 0) return 0;
  const { data, error } = await client
    .from('translation_jobs')
    .update({ status: 'queued', approved_by: adminId, last_error: null })
    .in('id', jobIds)
    .eq('status', 'requested')
    .select('id');
  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

export async function declineRequests(client: Client, jobIds: string[], adminId: string): Promise<number> {
  if (jobIds.length === 0) return 0;
  const { data, error } = await client
    .from('translation_jobs')
    .update({ status: 'declined', approved_by: adminId, finished_at: new Date().toISOString() })
    .in('id', jobIds)
    .eq('status', 'requested')
    .select('id');
  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

/**
 * A free-link owner's wish list, kept in step with the job rows: languages
 * they ticked become `requested` jobs, ones they un-ticked are withdrawn.
 * Anything an admin already approved or that already ran is left alone.
 */
export async function syncFreeRequests(client: Client, propertyId: string, locales: string[], ownerId: string): Promise<void> {
  const wanted = new Set(locales.filter(isTargetLocale));
  const { data: open } = await client
    .from('translation_jobs')
    .select('id, locale')
    .eq('property_id', propertyId)
    .eq('origin', 'free')
    .eq('status', 'requested');
  const have = new Set((open ?? []).map((job: { locale: string }) => job.locale));
  const withdraw = (open ?? []).filter((job: { locale: string }) => !wanted.has(job.locale)).map((job: { id: string }) => job.id);
  if (withdraw.length) {
    await client.from('translation_jobs').update({ status: 'cancelled', finished_at: new Date().toISOString() }).in('id', withdraw).eq('status', 'requested');
  }
  const fresh = [...wanted].filter((locale) => !have.has(locale));
  if (fresh.length) await enqueueTranslations(client, { propertyId, locales: fresh, origin: 'free', status: 'requested', requestedBy: ownerId });
}

export async function cancelJob(client: Client, jobId: string): Promise<boolean> {
  const { data } = await client
    .from('translation_jobs')
    .update({ status: 'cancelled', finished_at: new Date().toISOString() })
    .eq('id', jobId)
    .in('status', ['requested', 'queued'])
    .select('id');
  return (data ?? []).length === 1;
}

/** Run a failed job again (an admin pressed "Újra"). */
export async function retryJob(client: Client, jobId: string): Promise<boolean> {
  // fail_code, partial_output and feedback stay: the new attempt is told what went wrong last time, and
  // the finished job clears them.
  const { data, error } = await client
    .from('translation_jobs')
    .update({ status: 'queued', attempts: 0, last_error: null, claimed_at: null, finished_at: null })
    .eq('id', jobId)
    .eq('status', 'failed')
    .select('id');
  // The unique index: a newer live job for the same language already exists.
  if (error && (error.code === '23505' || /duplicate key/i.test(error.message))) return false;
  if (error) throw new Error(error.message);
  return (data ?? []).length === 1;
}

/* ── Running them ──────────────────────────────────────────────────────── */

export type ProcessResult = {
  processed: number;
  done: number;
  failed: number;
  requeued: number;
  /** Jobs still waiting (queued) when this run ended. */
  remaining: number;
  /** The day's spending guard stopped the run. */
  capped: boolean;
  /** AI_ENABLED is off: nothing was touched. */
  disabled: boolean;
  /** The key or balance is wrong: every job would fail the same way. */
  stopped: boolean;
};

type Outcome = 'done' | 'failed' | 'requeued' | 'cancelled';

export async function spentTodayMicroEur(client: Client): Promise<number> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const { data } = await client.from('translation_jobs').select('cost_micro_eur').gte('finished_at', since.toISOString()).not('cost_micro_eur', 'is', null);
  return (data ?? []).reduce((sum: number, job: { cost_micro_eur: number | null }) => sum + (job.cost_micro_eur ?? 0), 0);
}

async function countQueued(client: Client): Promise<number> {
  const { count } = await client.from('translation_jobs').select('id', { count: 'exact', head: true }).eq('status', 'queued');
  return count ?? 0;
}

export async function processTranslationJobs(
  client: Client,
  opts: { budgetMs?: number; concurrency?: number } = {}
): Promise<ProcessResult> {
  const result: ProcessResult = { processed: 0, done: 0, failed: 0, requeued: 0, remaining: 0, capped: false, disabled: false, stopped: false };
  if (!isAiEnabled()) {
    result.disabled = true;
    result.remaining = await countQueued(client).catch(() => 0);
    return result;
  }
  const started = Date.now();
  const budget = opts.budgetMs ?? DEFAULT_BUDGET_MS;
  const model = translationModel();

  while (Date.now() - started < budget) {
    if ((await spentTodayMicroEur(client)) >= dailyCapMicroEur()) { result.capped = true; break; }
    const { data: claimed, error } = await client.rpc('claim_translation_jobs', { p_limit: opts.concurrency ?? CONCURRENCY });
    if (error) {
      if (isMissingTranslationSchema(error)) break;
      throw new Error(error.message);
    }
    const jobs = (claimed ?? []) as any[];
    if (jobs.length === 0) {
      // Nothing claimable now. Jobs that just failed wait 20 s; if any are
      // waiting and there is time, wait for them instead of leaving them.
      if ((await countQueued(client)) === 0 || Date.now() - started + 30_000 > budget) break;
      await sleep(5_000);
      continue;
    }
    const outcomes = await Promise.all(jobs.map((job) => runJob(client, job, model)));
    for (const outcome of outcomes) {
      result.processed += 1;
      if (outcome.outcome === 'done') result.done += 1;
      else if (outcome.outcome === 'failed') result.failed += 1;
      else if (outcome.outcome === 'requeued') result.requeued += 1;
      if (outcome.stopAll) result.stopped = true;
    }
    if (result.stopped) break;
  }
  result.remaining = await countQueued(client).catch(() => 0);
  // The system has stopped: say so once, instead of leaving it to be noticed in the queue.
  if (result.capped || result.stopped) {
    await notifyTranslationStopped(client, result.stopped ? 'stopped' : 'cap', {
      spentMicroEur: await spentTodayMicroEur(client).catch(() => 0), capMicroEur: dailyCapMicroEur(), remaining: result.remaining,
    }).catch(() => {});
  }
  return result;
}

async function finishJob(client: Client, job: any, patch: Record<string, unknown>) {
  await updateRunningJob(client, job.id, { ...patch, finished_at: new Date().toISOString() });
}

async function runJob(client: Client, job: any, model: string): Promise<{ outcome: Outcome; stopAll: boolean }> {
  try {
    const { data: rows, error: rowsError } = await client
      .from('property_translations')
      .select('locale, title, description, body, machine')
      .eq('property_id', job.property_id);
    if (rowsError) throw new Error(rowsError.message);

    const source = pickSource(rows ?? []);
    if (!source) {
      await finishJob(client, job, { status: 'failed', last_error: 'Nincs lefordítható forrásszöveg.' });
      return { outcome: 'failed', stopAll: false };
    }
    if (source.locale === job.locale) {
      await finishJob(client, job, { status: 'cancelled', last_error: 'A hirdetés már ezen a nyelven készült.' });
      return { outcome: 'cancelled', stopAll: false };
    }
    const existing = (rows ?? []).find((row: { locale: string }) => row.locale === job.locale);
    if (existing && !existing.machine && (listingText(existing).title || listingText(existing).description) && !job.overwrite) {
      await finishJob(client, job, { status: 'cancelled', last_error: 'Ehhez a nyelvhez már van kézzel írt szöveg.' });
      return { outcome: 'cancelled', stopAll: false };
    }

    const text: ListingText = listingText(source);
    // A free listing carries no contact details, in any language.
    const { data: listing } = await client.from('properties').select('free_listing').eq('id', job.property_id).maybeSingle();
    const translated = await translateListing(text, source.locale, job.locale, undefined, model, {
      feedback: typeof job.feedback === 'string' ? job.feedback : null, freeListing: Boolean(listing?.free_listing),
    });
    const saveArgs = {
      p_property: job.property_id,
      p_locale: job.locale,
      p_from: source.locale,
      p_title: translated.title,
      p_description: translated.description,
      p_body: translated.body,
      p_hash: sourceHash(text),
      p_overwrite: Boolean(job.overwrite),
    };
    let { data: saved, error: saveError } = await client.rpc('save_machine_translation', {
      ...saveArgs, p_needs_review: translated.needsReview, p_warnings: translated.warnings,
    });
    // Before migration 0051 the function has the older, shorter signature.
    if (saveError && isMissingTranslationSchema(saveError)) ({ data: saved, error: saveError } = await client.rpc('save_machine_translation', saveArgs));
    if (saveError) throw new Error(saveError.message);

    // The AI was paid for either way, so the cost is recorded even when a person got there first.
    const costs = { model: translated.model, tokens_in: translated.tokensIn, tokens_out: translated.tokensOut, cost_micro_eur: translated.costMicroEur };
    if (!saved) {
      await finishJob(client, job, { status: 'cancelled', last_error: 'Közben kézzel írt szöveg került ehhez a nyelvhez, azt nem írtuk felül.', ...costs });
      return { outcome: 'cancelled', stopAll: false };
    }
    await finishJob(client, job, { status: 'done', last_error: null, fail_code: null, partial_output: null, feedback: null, source_hash: sourceHash(text), ...costs });
    await logEvent({
      kind: 'ai.translation_done', subjectType: 'property', subjectId: job.property_id, propertyId: job.property_id, locale: job.locale,
      source: job.origin, dedupeKey: `translation-job-${job.id}-done`,
      payload: { from: source.locale, origin: job.origin, model: translated.model, tokensIn: translated.tokensIn, tokensOut: translated.tokensOut, costMicroEur: translated.costMicroEur, ...(translated.titleFix ? { titleFix: translated.titleFix } : {}) },
    }).catch(() => {});
    return { outcome: 'done', stopAll: false };
  } catch (error) {
    const failure = classifyFailure(error);
    // Never the raw error: it can carry the API's own text. The class and a short reason are enough.
    console.warn(`[translate] job ${job.id} (${job.locale}) attempt ${job.attempts}: ${(error as { code?: string })?.code ?? (error as Error)?.name ?? 'error'}`);
    const failCode = failCodeOf(error);
    // What the last attempt wrote stays with the job: an admin can fix just the title instead of starting over.
    const partial = error instanceof TranslationCheckError && error.output ? error.output : null;
    if (failure.retry && job.attempts < MAX_ATTEMPTS) {
      // The next attempt is told what was wrong, so it is not the same attempt again.
      await updateRunningJob(client, job.id, {
        status: 'queued', last_error: failure.message, claimed_at: new Date().toISOString(),
        fail_code: failCode, partial_output: partial, feedback: retryFeedback(error),
      });
      return { outcome: 'requeued', stopAll: failure.stopAll };
    }
    await finishJob(client, job, { status: 'failed', last_error: failure.message, fail_code: failCode, partial_output: partial, feedback: retryFeedback(error) });
    await logEvent({
      kind: 'ai.translation_failed', subjectType: 'property', subjectId: job.property_id, propertyId: job.property_id, locale: job.locale,
      source: job.origin, dedupeKey: `translation-job-${job.id}-failed-${job.attempts}`, payload: { origin: job.origin, reason: failure.message, code: failCode },
    }).catch(() => {});
    return { outcome: 'failed', stopAll: failure.stopAll };
  }
}

/* ── Starting a run without waiting for it ─────────────────────────────── */

/**
 * Asks /api/cron/translate to start working, and returns after at most a few
 * seconds. The request itself keeps running on Vercel after the caller hangs
 * up, which is what lets a webhook answer Stripe quickly. Best effort by
 * design: the daily cron, the admin's "Folytatás most" and a page that is
 * showing progress all start the same run if this one never arrives.
 */
export async function kickTranslation(origin: string): Promise<void> {
  const secret = process.env.CRON_SECRET ?? import.meta.env.CRON_SECRET;
  if (!secret || !origin) return;
  try {
    await fetch(`${origin.replace(/\/+$/, '')}/api/cron/translate`, {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(2_500),
    });
  } catch {
    // Timed out on purpose (the run is working) or unreachable (the net catches it).
  }
}

/* ── Reading them ──────────────────────────────────────────────────────── */

export type JobRow = {
  id: string;
  property_id: string;
  locale: string;
  origin: JobOrigin;
  status: string;
  last_error: string | null;
  attempts: number;
  estimated_cost_micro_eur: number | null;
  cost_micro_eur: number | null;
  payment_id: string | null;
  created_at: string;
  finished_at: string | null;
};

const JOB_COLUMNS = 'id, property_id, locale, origin, status, last_error, attempts, estimated_cost_micro_eur, cost_micro_eur, payment_id, created_at, finished_at';

/** The jobs of one listing, newest first; the empty list before migration 0043. */
export async function jobsForProperty(client: Client, propertyId: string): Promise<JobRow[]> {
  const { data, error } = await client.from('translation_jobs').select(JOB_COLUMNS).eq('property_id', propertyId).order('created_at', { ascending: false }).limit(200);
  if (error) {
    if (isMissingTranslationSchema(error)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as JobRow[];
}

/** The latest job per language: what the listing's panel shows. */
export function latestPerLocale(jobs: JobRow[]): JobRow[] {
  const seen = new Set<string>();
  const latest: JobRow[] = [];
  for (const job of jobs) {
    if (seen.has(job.locale)) continue;
    seen.add(job.locale);
    latest.push(job);
  }
  return latest;
}
