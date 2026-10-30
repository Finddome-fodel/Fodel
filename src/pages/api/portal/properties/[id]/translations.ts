/**
 * Translations of one listing: what the owner may do (buy more languages from a
 * live listing; a free-link owner asks for them) and what only an admin may do
 * (translate anything for free, approve or decline a request, retry, cancel).
 * The role is enforced here, not in the page.
 *
 * GET   progress for the panel that is polling; it also starts a run if jobs are
 *       waiting and nobody is working on them (the net under the webhook's kick).
 * POST  { action: 'order' | 'request' | 'run' | 'approve' | 'decline' | 'retry' | 'cancel', … }
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { isStripeEnabled } from '~/lib/stripe';
import { portalLang } from '~/lib/portal/auth-copy';
import { logEvent } from '~/lib/activity';
import { isAiEnabled } from '~/lib/ai/client';
import {
  ALL_LOCALES, OWNER_TARGETS, estimateCostMicroEur, isTargetLocale, listingChars, listingText, pickSource, summarizeJobs,
} from '~/lib/ai/translate-core';
import { translationModel } from '~/lib/ai/translate';
import {
  approveRequests, cancelJob, declineRequests, enqueueTranslations, isMissingTranslationSchema, jobsForProperty, kickTranslation,
  latestPerLocale, retryJob, SKIP_REASON_HU, type SkipReason,
} from '~/lib/ai/translation-jobs';
import { openTranslationOrder, translationCheckoutUrl } from '~/lib/ai/translation-checkout';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function load(locals: App.Locals, id: string | undefined): Promise<
  | { response: Response; property?: undefined; isAdmin?: undefined; isOwner?: undefined; user?: undefined; profile?: undefined }
  | { response: null; property: any; isAdmin: boolean; isOwner: boolean; user: any; profile: any }
> {
  const { supabase, profile, user } = locals;
  if (!user || !id) return { response: json(401, { ok: false, error: 'unauthenticated' }) };
  const { data: property } = await supabase.from('properties').select('id, ref, status, owner_id, free_listing').eq('id', id).maybeSingle();
  if (!property) return { response: json(404, { ok: false, error: 'not-found' }) };
  const isAdmin = profile?.role === 'admin';
  const isOwner = property.owner_id === user.id;
  if (!isAdmin && !isOwner) return { response: json(403, { ok: false, error: 'forbidden' }) };
  return { response: null, property, isAdmin, isOwner, user, profile };
}

const clean = (value: unknown): string[] => (Array.isArray(value) ? [...new Set(value.map(String))] : []);

export const GET: APIRoute = async ({ params, locals, request }) => {
  const got = await load(locals, params.id);
  if (got.response) return got.response;
  const admin = createSupabaseAdminClient();
  const jobs = latestPerLocale(await jobsForProperty(admin, got.property.id));
  const summary = summarizeJobs(jobs);
  // Work is waiting and nothing is running: start it. Cheap and harmless if a run is already going.
  if (isAiEnabled() && jobs.some((job) => job.status === 'queued') && !jobs.some((job) => job.status === 'running')) {
    await kickTranslation(new URL(request.url).origin);
  }
  return json(200, {
    ok: true,
    aiEnabled: isAiEnabled(),
    summary,
    // The owner sees a reason in plain words only for a failure; the admin sees everything.
    jobs: jobs.map((job) => ({ id: job.id, locale: job.locale, status: job.status, origin: job.origin, error: got.isAdmin ? job.last_error : job.status === 'failed' ? 'processing' : null })),
  });
};

export const POST: APIRoute = async ({ params, locals, request }) => {
  const got = await load(locals, params.id);
  if (got.response) return got.response;
  const { property, isAdmin, user, profile } = got;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? '');
  const admin = createSupabaseAdminClient();
  const origin = new URL(request.url).origin;

  // Before migration 0043 every action says so instead of failing in the middle.
  const probe = await admin.from('translation_jobs').select('id').limit(1);
  if (probe.error && isMissingTranslationSchema(probe.error)) return json(503, { ok: false, error: 'schema-missing', message: 'A fordítási rendszer még nincs bekapcsolva: futtassa le a 0043-as migrációt.' });

  const { data: rows } = await admin.from('property_translations').select('locale, title, description, body, machine').eq('property_id', property.id);
  const have = new Set((rows ?? []).map((row: { locale: string }) => row.locale));
  const source = pickSource(rows ?? []);
  const sourceChars = source ? listingChars(listingText(source)) : 0;

  /* ── an admin translates, for free ─────────────────────────────────── */
  if (action === 'run') {
    if (!isAdmin) return json(403, { ok: false, error: 'forbidden' });
    if (!isAiEnabled()) return json(409, { ok: false, error: 'ai-disabled', message: 'Az AI fordítás nincs bekapcsolva (AI_ENABLED és OPENAI_API_KEY).' });
    // "missing" = every language that has no text at all yet.
    const wanted = body.locales === 'missing' ? ALL_LOCALES.filter((code) => !have.has(code)) : clean(body.locales).filter(isTargetLocale);
    if (wanted.length === 0) return json(422, { ok: false, error: 'nothing-to-translate', message: 'Nincs lefordítandó nyelv.' });
    const result = await enqueueTranslations(admin, {
      propertyId: property.id, locales: wanted, origin: 'admin', status: 'queued',
      requestedBy: user.id, approvedBy: user.id, overwrite: body.overwrite === true,
    });
    if (result.created.length > 0) {
      await logEvent({
        kind: 'ai.translation_started', actorId: user.id, actorEmail: profile?.email ?? null, subjectType: 'property', subjectId: property.id,
        propertyId: property.id, source: 'portal', payload: { locales: result.created, overwrite: body.overwrite === true },
      }).catch(() => {});
      await kickTranslation(origin);
    }
    return json(200, {
      ok: true, created: result.created,
      skipped: result.skipped.map((s) => ({ locale: s.locale, reason: s.reason, message: SKIP_REASON_HU[s.reason as SkipReason] })),
      estimateMicroEur: result.created.length * estimateCostMicroEur(sourceChars, translationModel()),
    });
  }

  /* ── an admin decides on a request, retries or cancels ─────────────── */
  if (['approve', 'decline', 'retry', 'cancel'].includes(action)) {
    if (!isAdmin) return json(403, { ok: false, error: 'forbidden' });
    // Only jobs of THIS listing: an id from anywhere else changes nothing.
    const mine = new Set((await jobsForProperty(admin, property.id)).map((job) => job.id));
    const ids = clean(body.jobIds ?? (body.jobId ? [body.jobId] : [])).filter((id) => mine.has(id));
    if (ids.length === 0) return json(422, { ok: false, error: 'no-jobs' });
    let changed = 0;
    if (action === 'approve') changed = await approveRequests(admin, ids, user.id);
    if (action === 'decline') changed = await declineRequests(admin, ids, user.id);
    if (action === 'retry') for (const id of ids) changed += (await retryJob(admin, id)) ? 1 : 0;
    if (action === 'cancel') for (const id of ids) changed += (await cancelJob(admin, id)) ? 1 : 0;
    if (changed > 0) {
      await logEvent({
        kind: `ai.translation_${action}`, actorId: user.id, actorEmail: profile?.email ?? null, subjectType: 'property', subjectId: property.id,
        propertyId: property.id, source: 'portal', payload: { jobs: ids, changed },
      }).catch(() => {});
      if (action === 'approve' || action === 'retry') await kickTranslation(origin);
    }
    return json(200, { ok: true, changed });
  }

  /* ── a free-link owner asks ────────────────────────────────────────── */
  if (action === 'request') {
    if (!property.free_listing) return json(409, { ok: false, error: 'not-free' });
    if (got.isOwner === false && !isAdmin) return json(403, { ok: false, error: 'forbidden' });
    const wanted = clean(body.locales).filter((code) => OWNER_TARGETS.includes(code) && !have.has(code));
    if (wanted.length === 0) return json(422, { ok: false, error: 'nothing-to-order' });
    const result = await enqueueTranslations(admin, { propertyId: property.id, locales: wanted, origin: 'free', status: 'requested', requestedBy: user.id });
    if (result.created.length > 0) {
      await logEvent({
        kind: 'ai.translation_requested', actorId: user.id, actorEmail: profile?.email ?? null, subjectType: 'property', subjectId: property.id,
        propertyId: property.id, source: 'portal', payload: { locales: result.created },
      }).catch(() => {});
    }
    return json(200, { ok: true, created: result.created });
  }

  /* ── a paying owner buys more languages for a live listing ─────────── */
  if (action === 'order') {
    if (property.free_listing) return json(409, { ok: false, error: 'free-listing' });
    if (property.status !== 'published') return json(409, { ok: false, error: 'not-live' });
    if (!source) return json(409, { ok: false, error: 'no-source' });
    if (!isStripeEnabled()) return json(503, { ok: false, error: 'card-unavailable' });
    // Languages the listing already has, or that are already being made, are not sold again.
    const { data: live } = await admin.from('translation_jobs').select('locale').eq('property_id', property.id).in('status', ['requested', 'queued', 'running']);
    const busy = new Set((live ?? []).map((job: { locale: string }) => job.locale));
    const wanted = clean(body.locales).filter((code) => OWNER_TARGETS.includes(code) && !have.has(code) && !busy.has(code));
    if (wanted.length === 0) return json(422, { ok: false, error: 'nothing-to-order' });
    const order = await openTranslationOrder(admin, property, wanted, portalLang(profile?.locale));
    const url = await translationCheckoutUrl(admin, order, property, origin);
    await logEvent({
      kind: 'ai.translation_ordered', actorId: user.id, actorEmail: profile?.email ?? null, subjectType: 'payment', subjectId: order.id,
      propertyId: property.id, source: 'portal', payload: { locales: wanted, amountCents: order.amount_cents },
    }).catch(() => {});
    return json(200, { ok: true, url, amountCents: order.amount_cents, locales: wanted });
  }

  return json(400, { ok: false, error: 'unknown-action' });
};
