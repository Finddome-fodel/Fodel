/**
 * The daily EUR/HUF rate (ECB). Vercel calls this at 15:30 UTC, after the ECB has published (about 16:00 CET), with
 * `Authorization: Bearer CRON_SECRET`, exactly like the other crons. Idempotent: the same day is one row.
 *
 * The same refresh runs as a catch-up at the start of /api/cron/daily when the newest stored day is older than a
 * business day, so one missed run heals itself.
 */
import type { APIRoute } from 'astro';
import { cronAuthorised } from '~/lib/cron-auth';
import { refreshRates } from '~/lib/fx-store';
import { logEvent } from '~/lib/activity';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const GET: APIRoute = async ({ request }) => {
  if (!cronAuthorised(request.headers.get('authorization'), process.env.CRON_SECRET ?? import.meta.env.CRON_SECRET)) return json(401, { ok: false });
  const result = await refreshRates();
  if (result.ok) {
    await logEvent({ kind: 'fx.updated', source: 'cron', payload: { date: result.snapshot.date, huf: result.snapshot.rates.HUF, source: result.snapshot.source, fresh: result.fresh } }).catch(() => {});
    return json(200, { ok: true, date: result.snapshot.date, huf: result.snapshot.rates.HUF, fresh: result.fresh });
  }
  await logEvent({ kind: 'fx.failed', source: 'cron', payload: { error: result.error, detail: result.detail ?? null } }).catch(() => {});
  return json(result.error === 'rates-unavailable' ? 502 : 500, { ok: false, error: result.error });
};
