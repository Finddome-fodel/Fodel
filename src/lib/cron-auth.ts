import { timingSafeEqual } from 'node:crypto';

/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Constant-time
 * comparison; with no secret configured, nothing is ever authorised.
 */
export function cronAuthorised(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
