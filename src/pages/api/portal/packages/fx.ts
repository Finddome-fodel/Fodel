/**
 * Csomagok → Árfolyam: „Frissítés most”. Runs the same fetch as the daily cron (ECB, its mirror only if the ECB
 * fails) and stores the day. Admin only; there is nothing to edit by hand - the rate is never typed in.
 */
import type { APIRoute } from 'astro';
import { backToTab, forbidden } from '~/lib/portal/package-admin';
import { refreshRates } from '~/lib/fx-store';
import { logEvent } from '~/lib/activity';
import { clearRuntimeConfigCache } from '~/lib/runtime-config';

export const prerender = false;

const MESSAGE = {
  'rates-unavailable': 'Az EKB árfolyamfájlja most nem érhető el. Próbálja meg később; addig az utolsó mentett árfolyam marad érvényben.',
  'schema-missing': 'Futtassa le a 0056-os migrációt.',
  'write-failed': 'Az árfolyamot nem sikerült elmenteni. Próbálja meg újra.',
} as const;

export const POST: APIRoute = async ({ locals }) => {
  if (locals.profile?.role !== 'admin') return forbidden();
  const result = await refreshRates();
  const actor = { actorId: locals.user?.id ?? null, actorEmail: locals.profile?.email ?? null, source: 'portal' as const };
  if (!result.ok) {
    await logEvent({ kind: 'fx.failed', ...actor, payload: { error: result.error, detail: result.detail ?? null, manual: true } }).catch(() => {});
    return backToTab('fx', 'error=' + encodeURIComponent(MESSAGE[result.error]));
  }
  clearRuntimeConfigCache();
  await logEvent({ kind: 'fx.updated', ...actor, payload: { date: result.snapshot.date, huf: result.snapshot.rates.HUF, source: result.snapshot.source, fresh: result.fresh, manual: true } }).catch(() => {});
  return backToTab('fx', 'saved=1');
};
