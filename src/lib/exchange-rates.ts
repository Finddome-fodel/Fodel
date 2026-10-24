/** Reference rates for listing display; never a settlement/payment exchange rate. */
export const PRICE_CURRENCIES = ['EUR','HUF','GBP','CHF','CZK','PLN','RON','DKK','SEK','NOK','ISK','TRY'] as const;
export type RateSnapshot = { date: string; fetchedAt: string; source: string; rates: Record<string, number> };
let cached: RateSnapshot | undefined;
let pending: Promise<RateSnapshot> | undefined;
export function parseEcbRates(xml: string, now = new Date()): RateSnapshot {
  const date = xml.match(/time=['"]([\d-]+)['"]/)?.[1];
  const rates: Record<string,number> = { EUR: 1 };
  for (const m of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) {
    const rate = Number(m[2]);
    if (Number.isFinite(rate) && rate > 0) rates[m[1]] = rate;
  }
  if (!date || !rates.HUF || !rates.GBP || now.getTime() - Date.parse(date) > 7 * 86400000 || Date.parse(date) > now.getTime() + 86400000) throw new Error('rates-unavailable');
  return { date, fetchedAt: now.toISOString(), source: 'ECB', rates };
}
export async function exchangeRates(): Promise<RateSnapshot> {
  if (cached && Date.now()-Date.parse(cached.fetchedAt) < 3600000) return cached;
  if (pending) return pending;
  pending = (async () => {
    const response = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('rates-unavailable');
    return cached = parseEcbRates(await response.text());
  })().finally(() => { pending = undefined; });
  return pending;
}
export function convertPrice(amount: number, currency: string, snapshot: RateSnapshot) {
  const rate = snapshot.rates[currency];
  if (!(PRICE_CURRENCIES as readonly string[]).includes(currency) || !Number.isFinite(amount) || amount <= 0 || !rate) throw new Error('invalid-price');
  const eur = Math.round(amount / rate * 100) / 100;
  const huf = Math.round(eur * snapshot.rates.HUF);
  if (!Number.isFinite(eur) || !Number.isFinite(huf) || eur <= 0 || huf <= 0 || eur > 1e12 || huf > 1e15) throw new Error('invalid-price');
  return { eur, huf, rate };
}
