/**
 * Two small look-ups the editor uses. Both are best-effort: when the service
 * is down the editor says so and the admin carries on by hand — an invoice is
 * never blocked by someone else's website.
 */
import { vatPrefix } from './model';

const fetchJson = async (url: string, ms = 6000): Promise<any> => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

/** HUF per EUR on a date (ECB reference rate, via Frankfurter). Weekends resolve to the previous working day. */
export async function eurHufRate(date: string): Promise<{ rate: number; date: string; source: string } | null> {
  try {
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : 'latest';
    const data = await fetchJson(`https://api.frankfurter.dev/v1/${iso}?base=EUR&symbols=HUF`);
    const rate = Number(data?.rates?.HUF);
    return Number.isFinite(rate) && rate > 0 ? { rate: Math.round(rate * 100) / 100, date: String(data.date ?? iso), source: 'ECB' } : null;
  } catch {
    return null;
  }
}

export type ViesResult =
  | { ok: true; valid: boolean; name?: string; address?: string }
  | { ok: false; reason: string };

/** Asks the EU's VIES service whether a VAT id exists — required evidence for a 0% reverse-charge invoice. */
export async function checkVies(countryCode: string, vatId: string): Promise<ViesResult> {
  const prefix = vatPrefix(countryCode);
  const number = vatId.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(new RegExp(`^${prefix}`), '');
  if (!number) return { ok: false, reason: 'empty' };
  try {
    const data = await fetchJson(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${prefix}/vat/${encodeURIComponent(number)}`, 8000);
    if (typeof data?.isValid !== 'boolean') return { ok: false, reason: 'unavailable' };
    const clean = (v: unknown) => (typeof v === 'string' && v.trim() && v.trim() !== '---' ? v.trim().replace(/\s*\n\s*/g, ', ') : undefined);
    return { ok: true, valid: data.isValid, name: clean(data.name), address: clean(data.address) };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
