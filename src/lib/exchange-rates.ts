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
/**
 * How a converted euro price is rounded (decided by Marci, 2026-11-03): to the nearest €100 by default,
 * adjustable in Csomagok → Kerekítés (site_settings.services.priceRounding). A price the owner typed in euro
 * is never rounded.
 */
export type PriceRounding = { step: number };
export const PRICE_ROUNDING_DEFAULT: PriceRounding = { step: 100 };
/** The steps the admin can choose from; 1 means "whole euros, no rounding beyond that". */
export const PRICE_ROUNDING_STEPS = [1, 10, 50, 100, 500, 1000] as const;

/** Any stored value (possibly missing or malformed) → a usable rounding rule. */
export function readPriceRounding(value: unknown): PriceRounding {
  const step = Number((value as { step?: unknown } | null | undefined)?.step);
  return Number.isInteger(step) && step >= 1 && step <= 100_000 ? { step } : PRICE_ROUNDING_DEFAULT;
}

/**
 * Round a converted euro amount half up to the nearest `step` (587 896,40 → 587 900; 587 850 → 587 900;
 * 587 849,99 → 587 800). Never rounds a positive price down to zero: the smallest result is one step.
 * Works in cents first so binary floating point cannot tip a value that sits exactly on the half.
 */
export function roundEur(eur: number, rounding: PriceRounding = PRICE_ROUNDING_DEFAULT): number {
  if (!Number.isFinite(eur)) return eur;
  const step = readPriceRounding(rounding).step;
  const cents = Math.round(eur * 100);
  const stepCents = step * 100;
  const rounded = Math.floor((cents + stepCents / 2) / stepCents) * step;
  return eur > 0 ? Math.max(step, rounded) : rounded;
}

export function convertPrice(amount: number, currency: string, snapshot: RateSnapshot, rounding: PriceRounding = PRICE_ROUNDING_DEFAULT) {
  const rate = snapshot.rates[currency];
  if (!(PRICE_CURRENCIES as readonly string[]).includes(currency) || !Number.isFinite(amount) || amount <= 0 || !rate) throw new Error('invalid-price');
  const exact = Math.round(amount / rate * 100) / 100;
  // Only a converted price is rounded; an amount the owner typed in euro is kept to the cent.
  const eur = currency === 'EUR' ? exact : roundEur(exact, rounding);
  // A forint price is already whole forints: going through euro cents and back lost one (99 000 000 became 98 999 999).
  // Other currencies go through the exact euro amount, so rounding the display price never moves a listing between
  // package price tiers (src/lib/listing-packages.ts tierFor works on price_huf).
  const huf = currency === 'HUF' ? Math.round(amount) : Math.round(exact * snapshot.rates.HUF);
  if (!Number.isFinite(eur) || !Number.isFinite(huf) || eur <= 0 || huf <= 0 || eur > 1e12 || huf > 1e15) throw new Error('invalid-price');
  return { eur, huf, rate };
}
