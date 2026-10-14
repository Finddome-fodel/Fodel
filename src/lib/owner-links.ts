/**
 * Links in the lifecycle emails that act on a listing without signing in.
 * Each one is an HMAC over (purpose, listing id, expiry) — see
 * src/lib/valuation/action-token.ts — so it works for exactly one action on
 * exactly one listing until its date, and nothing is stored to make it work.
 * Pages: src/pages/listing/[action].astro.
 */
import { SITE_URL } from '~/config/site.mjs';
import { signAction, type ActionPurpose } from '~/lib/valuation/action-token';

export type OwnerAction = 'still-available' | 'price' | 'sold' | 'renew';

export function ownerLink(action: OwnerAction, propertyId: string, locale: 'hu' | 'nl', validDays: number): string {
  const token = signAction(action as ActionPurpose, propertyId, validDays);
  return `${SITE_URL}/listing/${action}?p=${propertyId}&t=${token}&l=${locale}`;
}

/** A renewal link outlives the listing's expiry: an owner may renew weeks after it lapsed. */
export const RENEW_LINK_DAYS = 60;
