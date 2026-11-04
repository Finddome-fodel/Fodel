/**
 * The daily EUR/HUF rate, stored: `exchange_rate_snapshots` (migration 0056), written by /api/cron/fx and by the
 * admin's „Frissítés most”, read by everything that shows a forint hint or converts a listing price.
 *
 * Read chain (`currentRate`): the newest stored day; else a live ECB fetch (as before 0056, kept in memory for an
 * hour); else nothing, and no forint is shown (the euro price always is). A snapshot that is a few days old is still
 * used; the admin is told it is stale. Never a made-up number.
 */
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { parseEcbRates, type RateSnapshot } from '~/lib/exchange-rates';
import { parseFrankfurter, type FxRate } from '~/lib/fx';

const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
const FRANKFURTER_URL = 'https://api.frankfurter.app/latest?from=EUR';

type Row = { rate_date: string; source: string; rates: Record<string, number>; fetched_at: string };

/** The table or a column is missing: migration 0056 has not been run. */
export const isMissingFxSchema = (error: { code?: string; message?: string } | null | undefined): boolean =>
  Boolean(error && (error.code === '42P01' || error.code === 'PGRST205' || /exchange_rate_snapshots/.test(error.message ?? '')));

const toSnapshot = (row: Row): RateSnapshot => ({ date: row.rate_date, fetchedAt: row.fetched_at, source: row.source, rates: { EUR: 1, ...row.rates } });

/** The newest stored day, or null (no table yet, no rows). */
export async function latestSnapshot(client: ReturnType<typeof createSupabaseAdminClient> = createSupabaseAdminClient()): Promise<RateSnapshot | null> {
  const { data, error } = await client.from('exchange_rate_snapshots').select('rate_date, source, rates, fetched_at').order('rate_date', { ascending: false }).limit(1).maybeSingle();
  if (error || !data || !(data as Row).rates?.HUF) return null;
  return toSnapshot(data as Row);
}

/** The last `days` stored days, newest first, for the admin's small table. */
export async function recentSnapshots(days = 14, client = createSupabaseAdminClient()): Promise<RateSnapshot[]> {
  const { data, error } = await client.from('exchange_rate_snapshots').select('rate_date, source, rates, fetched_at').order('rate_date', { ascending: false }).limit(days);
  if (error) return [];
  return ((data ?? []) as Row[]).filter((row) => row.rates?.HUF).map(toSnapshot);
}

let live: { at: number; snapshot: RateSnapshot | null } | undefined;

/** The rate for forint hints: stored day, else the ECB live, else null. */
export async function currentRate(options: { client?: ReturnType<typeof createSupabaseAdminClient>; fetchImpl?: typeof fetch } = {}): Promise<FxRate | null> {
  const stored = await latestSnapshot(options.client).catch(() => null);
  const snapshot = stored ?? (await liveSnapshot(options.fetchImpl));
  return snapshot ? { rate: snapshot.rates.HUF, date: snapshot.date, source: snapshot.source, fetchedAt: snapshot.fetchedAt } : null;
}

async function liveSnapshot(fetchImpl?: typeof fetch): Promise<RateSnapshot | null> {
  if (!fetchImpl && live && Date.now() - live.at < 3_600_000) return live.snapshot;
  const snapshot = await fetchEcb(fetchImpl).catch(() => null);
  if (!fetchImpl) live = { at: Date.now(), snapshot };
  return snapshot;
}

async function fetchEcb(fetchImpl: typeof fetch = fetch): Promise<RateSnapshot> {
  const response = await fetchImpl(ECB_URL, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('rates-unavailable');
  return parseEcbRates(await response.text());
}

async function fetchFrankfurter(fetchImpl: typeof fetch = fetch): Promise<RateSnapshot> {
  const response = await fetchImpl(FRANKFURTER_URL, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('rates-unavailable');
  const table = parseFrankfurter(await response.json());
  return { date: table.date, fetchedAt: new Date().toISOString(), source: 'ECB (Frankfurter)', rates: table.rates };
}

export type RefreshResult =
  | { ok: true; snapshot: RateSnapshot; fresh: boolean }
  | { ok: false; error: 'rates-unavailable' | 'schema-missing' | 'write-failed'; detail?: string };

/**
 * Fetch today's rates (the ECB; its mirror only when the ECB fails) and store the day. Idempotent: the same reference
 * date is one row, and running it again changes nothing but the fetch time. Never throws.
 */
export async function refreshRates(options: { fetchImpl?: typeof fetch; client?: ReturnType<typeof createSupabaseAdminClient> } = {}): Promise<RefreshResult> {
  const client = options.client ?? createSupabaseAdminClient();
  let snapshot: RateSnapshot;
  try {
    snapshot = await fetchEcb(options.fetchImpl);
  } catch {
    try {
      snapshot = await fetchFrankfurter(options.fetchImpl);
    } catch {
      return { ok: false, error: 'rates-unavailable' };
    }
  }
  const { data: existing, error: readError } = await client.from('exchange_rate_snapshots').select('rate_date').eq('rate_date', snapshot.date).maybeSingle();
  if (isMissingFxSchema(readError)) return { ok: false, error: 'schema-missing' };
  const { error } = await client.from('exchange_rate_snapshots').upsert(
    { rate_date: snapshot.date, source: snapshot.source, rates: snapshot.rates, fetched_at: snapshot.fetchedAt },
    { onConflict: 'rate_date' }
  );
  if (error) return isMissingFxSchema(error) ? { ok: false, error: 'schema-missing' } : { ok: false, error: 'write-failed', detail: error.message };
  live = { at: Date.now(), snapshot };
  return { ok: true, snapshot, fresh: !existing };
}
