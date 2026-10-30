/**
 * Runs whatever translation jobs are waiting (src/lib/ai/translation-jobs.ts).
 * Who calls it, all with `Authorization: Bearer <CRON_SECRET>`:
 *   - the Stripe webhook and the admin/owner actions that create jobs, right
 *     after creating them (kickTranslation), so a paid translation starts at once;
 *   - this route itself, when its time budget ran out with jobs left;
 *   - Vercel Cron, daily (vercel.json), as a safety net.
 * Overlapping runs are harmless: jobs are claimed atomically.
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { cronAuthorised } from '~/lib/cron-auth';
import { processTranslationJobs, kickTranslation } from '~/lib/ai/translation-jobs';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const run: APIRoute = async ({ request }) => {
  if (!cronAuthorised(request.headers.get('authorization'), process.env.CRON_SECRET ?? import.meta.env.CRON_SECRET)) {
    return json(401, { ok: false });
  }
  try {
    const result = await processTranslationJobs(createSupabaseAdminClient());
    // Out of time with work left: hand the rest to a fresh run, which has a fresh budget.
    if (result.remaining > 0 && result.processed > 0 && !result.capped && !result.stopped && !result.disabled) {
      await kickTranslation(new URL(request.url).origin);
    }
    return json(200, { ok: true, ...result });
  } catch (error) {
    console.error('[cron:translate]', error);
    return json(500, { ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};

export const GET = run;
export const POST = run;
