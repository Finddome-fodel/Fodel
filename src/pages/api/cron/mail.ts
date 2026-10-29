/**
 * Sends whatever bulk mail is due (src/lib/mail/jobs.ts). Two callers, one
 * code path:
 *   - Supabase pg_cron + pg_net, every minute, POST (migration 0038) — what
 *     makes a send scheduled for 14:30 go at 14:30;
 *   - Vercel Cron, daily, GET (vercel.json) — the safety net if the first is
 *     not set up or stops.
 * Both authenticate with `Authorization: Bearer <CRON_SECRET>`. Overlapping
 * runs are harmless: recipients are claimed atomically.
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { cronAuthorised } from '~/lib/cron-auth';
import { processDueJobs } from '~/lib/mail/jobs';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const run: APIRoute = async ({ request }) => {
  if (!cronAuthorised(request.headers.get('authorization'), process.env.CRON_SECRET ?? import.meta.env.CRON_SECRET)) {
    return json(401, { ok: false });
  }
  try {
    const result = await processDueJobs(createSupabaseAdminClient());
    return json(200, { ok: true, ...result });
  } catch (error) {
    console.error('[cron:mail]', error);
    return json(500, { ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};

export const GET = run;
export const POST = run;
