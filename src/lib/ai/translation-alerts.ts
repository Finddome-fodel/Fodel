/**
 * E-mails to the admins about the translation system: an alert the moment it stops (the day's AI
 * budget is spent, or the key or balance is wrong), and a short daily digest of what needs a person.
 * Both are sent in Hungarian (the office's language), only when there is something to say, and at
 * most once per day each (the activity log's dedupe key is the lock).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { SITE_URL } from '~/config/site.mjs';
import { logEvent } from '~/lib/activity';
import { deliver, adminRecipients } from '~/lib/email/send';
import { button, facts, h1, p, shell } from '~/lib/email/layout';
import { HU_NAME, failCodeHu, formatCostHu } from './translate-core';
import { loadMatrix, loadSources } from './translation-overview';
import { translationStatus } from './translation-status';

type Client = SupabaseClient<any, any, any>;
type Built = { subject: string; html: string; text: string };

const day = (now: Date) => now.toISOString().slice(0, 10);
const link = (path: string) => `${SITE_URL}${path}`;

/* ── The alert: the system has stopped ─────────────────────────────────── */

export type StopKind = 'cap' | 'stopped';

export function buildStopAlert(kind: StopKind, d: { spentMicroEur: number; capMicroEur: number; remaining: number }): Built {
  const title = kind === 'cap' ? 'Elfogyott a napi AI-keret' : 'Az AI fordítás leállt';
  const lead = kind === 'cap'
    ? `A mai fordítási keretet (${formatCostHu(d.capMicroEur)}) elköltöttük. A sorban álló fordítások holnap maguktól elkészülnek; ha most kell, a keretet a Vercelben a TRANSLATION_DAILY_CAP_EUR értékkel emelheti.`
    : 'Az OpenAI elutasította a kérést: a kulcs érvénytelen, vagy elfogyott az egyenleg. Amíg ez nem javul, egyetlen fordítás sem készül el, a sorban állók várnak, semmi nem veszett el.';
  const rows: [string, string][] = [['Ma elköltve', formatCostHu(d.spentMicroEur)], ['Még sorban áll', `${d.remaining} fordítás`]];
  return {
    subject: `${title} – FINDDOME fordítások`,
    html: shell({ locale: 'hu', preheader: lead.slice(0, 110), body: h1(title) + p(lead) + facts(rows) + button('Fordítások megnyitása', link('/portal/translations')) }),
    text: `${title}\n\n${lead}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${link('/portal/translations')}`,
  };
}

/** Tells the admins once per day and kind. The log row is the lock: a second run finds it and stays quiet. */
export async function notifyTranslationStopped(
  client: Client, kind: StopKind, details: { spentMicroEur: number; capMicroEur: number; remaining: number }, now = new Date()
): Promise<boolean> {
  try {
    await logEvent({ kind: 'ai.translation_alert', source: 'cron', dedupeKey: `translation-alert-${kind}-${day(now)}`, payload: { kind, ...details } });
  } catch {
    return false;
  }
  const email = buildStopAlert(kind, details);
  const recipients = await adminRecipients(client);
  const results = await Promise.all(recipients.map((to) => deliver(to, email)));
  return results.some(Boolean);
}

/* ── The daily digest ──────────────────────────────────────────────────── */

export type DigestData = {
  failed: { ref: string; propertyId: string; locale: string; reason: string }[];
  stale: { ref: string; propertyId: string; locale: string }[];
  spentMicroEur: number;
  capMicroEur: number;
};

/** The digest is worth sending only when something needs a person, or the budget is nearly gone. */
export function digestIsWorthSending(d: DigestData): boolean {
  return d.failed.length > 0 || d.stale.length > 0 || d.spentMicroEur >= d.capMicroEur * 0.8;
}

export function buildDigest(d: DigestData): Built {
  const rows: [string, string][] = [];
  for (const item of d.failed.slice(0, 12)) rows.push([`#${item.ref} · ${HU_NAME[item.locale] ?? item.locale}`, item.reason]);
  if (d.failed.length > 12) rows.push(['…', `és még ${d.failed.length - 12} hibás fordítás`]);
  const staleLine = d.stale.length ? `${d.stale.length} fordítás elavult 7 napnál régebb óta (a forrásszöveg megváltozott, a régi fordítás még látszik).` : '';
  const nearCap = d.spentMicroEur >= d.capMicroEur * 0.8;
  const spend = `A keret ${nearCap ? 'majdnem elfogyott' : 'rendben van'}: ${formatCostHu(d.spentMicroEur)} a ${formatCostHu(d.capMicroEur)} napi keretből, az elmúlt 24 órában.`;
  const lead = d.failed.length ? `${d.failed.length} fordítás elakadt az elmúlt 24 órában.` : 'Nincs új hiba, de van mit átnézni.';
  const body = h1('Fordítások – napi állapot') + p(lead) + (rows.length ? facts(rows) : '') + (staleLine ? p(staleLine) : '') + p(spend)
    + button('Áttekintés megnyitása', link('/portal/translations'));
  const text = [
    'Fordítások – napi állapot', '', lead, ...rows.map(([k, v]) => `${k}: ${v}`), staleLine, spend, '', link('/portal/translations'),
  ].filter((line, i, all) => line || (i > 0 && all[i - 1])).join('\n');
  return { subject: d.failed.length ? `Fordítások – ${d.failed.length} hibás` : 'Fordítások – napi állapot', html: shell({ locale: 'hu', preheader: lead, body }), text };
}

const DAY_MS = 86_400_000;

/** What went wrong in the last 24 hours, what has been out of date for a week, and what the AI cost. */
export async function gatherDigest(client: Client, capMicroEur: number, now = new Date()): Promise<DigestData | null> {
  const since = new Date(now.getTime() - DAY_MS).toISOString();
  const { data: failedJobs, error } = await client
    .from('translation_jobs')
    .select('property_id, locale, fail_code, last_error, properties(ref)')
    .eq('status', 'failed').gte('finished_at', since).limit(200);
  if (error) return null; // before migration 0043 there is nothing to report
  const ref = (row: any) => String((Array.isArray(row.properties) ? row.properties[0] : row.properties)?.ref ?? '?');
  const failed = (failedJobs ?? []).map((row: any) => ({
    ref: ref(row), propertyId: row.property_id, locale: row.locale, reason: failCodeHu(row.fail_code) || row.last_error || 'A fordítás nem sikerült.',
  }));

  const { data: costRows } = await client.from('translation_jobs').select('cost_micro_eur').gte('finished_at', since).not('cost_micro_eur', 'is', null);
  const spentMicroEur = (costRows ?? []).reduce((sum: number, row: { cost_micro_eur: number }) => sum + (row.cost_micro_eur ?? 0), 0);

  const stale: DigestData['stale'] = [];
  const { data: live } = await client.from('properties').select('id, ref').eq('status', 'published').limit(1000);
  const ids = (live ?? []).map((row: { id: string }) => row.id);
  if (ids.length) {
    const { migrated, facts: matrix } = await loadMatrix(client, ids);
    if (migrated) {
      const sources = await loadSources(client, ids);
      const refs = new Map((live ?? []).map((row: { id: string; ref: string }) => [row.id, row.ref]));
      const weekAgo = now.getTime() - 7 * DAY_MS;
      for (const fact of matrix) {
        const source = sources.get(fact.property_id);
        if (!source || translationStatus(fact, { sourceLocale: source.locale, sourceHash: source.hash }).status !== 'stale') continue;
        if (fact.validated_at && Date.parse(fact.validated_at) > weekAgo) continue;
        stale.push({ ref: String(refs.get(fact.property_id) ?? '?'), propertyId: fact.property_id, locale: fact.locale });
      }
    }
  }
  return { failed, stale, spentMicroEur, capMicroEur };
}

/** Sends the digest if there is anything to say, at most once per day. */
export async function sendTranslationDigest(client: Client, capMicroEur: number, now = new Date()): Promise<{ sent: boolean; reason?: string }> {
  const data = await gatherDigest(client, capMicroEur, now);
  if (!data) return { sent: false, reason: 'not-migrated' };
  if (!digestIsWorthSending(data)) return { sent: false, reason: 'nothing-to-report' };
  try {
    await logEvent({ kind: 'ai.translation_digest', source: 'cron', dedupeKey: `translation-digest-${day(now)}`, payload: { failed: data.failed.length, stale: data.stale.length, spentMicroEur: data.spentMicroEur } });
  } catch {
    return { sent: false, reason: 'already-sent' };
  }
  const email = buildDigest(data);
  const recipients = await adminRecipients(client);
  const results = await Promise.all(recipients.map((to) => deliver(to, email)));
  return { sent: results.some(Boolean) };
}
