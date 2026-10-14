import { createHmac, timingSafeEqual } from 'node:crypto';

const secret = () => import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';
export function valuationActionToken(id: string): string {
  if (!secret()) throw new Error('valuation-action-secret-missing');
  return createHmac('sha256', secret()).update(`valuation-result:${id}`).digest('hex');
}
export function validValuationActionToken(id: string, token: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const expected = Buffer.from(valuationActionToken(id), 'hex');
  return timingSafeEqual(expected, Buffer.from(token, 'hex'));
}

/* ── Expiring, purpose-bound links (owner refresh, renewal, newsletter) ──── */
// The same HMAC as above, with the purpose and an expiry inside the signed
// text: a "still available" link cannot be replayed as a "sold" link, and a
// link stops working on its own date without anything stored server-side.
// The pure core takes the secret as an argument so scripts/test-rules.mjs can
// exercise it without Astro's env.

export type ActionPurpose = 'still-available' | 'price' | 'sold' | 'renew' | 'newsletter-confirm' | 'newsletter-unsubscribe';

export function signWith(key: string, purpose: string, id: string, expiresAtSec: number): string {
  if (!key) throw new Error('action-secret-missing');
  const mac = createHmac('sha256', key).update(`${purpose}:${id}:${expiresAtSec}`).digest('hex');
  return `${expiresAtSec.toString(36)}.${mac}`;
}

export function verifyWith(key: string, purpose: string, id: string, token: string, nowSec = Math.floor(Date.now() / 1000)): boolean {
  const match = /^([0-9a-z]{1,10})\.([a-f0-9]{64})$/.exec(token ?? '');
  if (!match || !key) return false;
  const exp = parseInt(match[1], 36);
  if (!Number.isFinite(exp) || exp < nowSec) return false;
  const expected = Buffer.from(signWith(key, purpose, id, exp).split('.')[1], 'hex');
  return timingSafeEqual(expected, Buffer.from(match[2], 'hex'));
}

export function signAction(purpose: ActionPurpose, id: string, validDays: number): string {
  return signWith(secret(), purpose, id, Math.floor(Date.now() / 1000) + Math.round(validDays * 86400));
}

export function verifyAction(purpose: ActionPurpose, id: string, token: string): boolean {
  return verifyWith(secret(), purpose, id, token);
}
