/**
 * Who a bulk send goes to. FINDDOME has no single contacts table, so a
 * recipient comes from one of four places, picked per send:
 *
 *   owner           registered owners (portal accounts), optionally only those
 *                   with a listing in a given state
 *   enquiry         people who asked about a listing — optionally one listing,
 *                   only recent ones, handled or not
 *   newsletter      confirmed newsletter subscribers only (double opt-in)
 *   search_request  people who used the free search service
 *
 * The list is always recomputed on the server from the submitted filters —
 * never accepted as a list of ids from the browser — so what is sent is what
 * the filters actually select at the moment of sending. The same address
 * from two rows is one recipient.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { localeFrom } from '~/i18n/ui';
import type { Audience, Recipient } from './send';
import { isValidEmailAddress, normalizeEmailAddress, suppressionMap, type SuppressionReason } from './suppression';

type Client = SupabaseClient<any, any, any>;

export const AUDIENCE_LABEL: Record<Audience, string> = {
  owner: 'Tulajdonosok (hirdetők)',
  enquiry: 'Érdeklődők',
  newsletter: 'Hírlevél-feliratkozók',
  search_request: 'Kerestetők',
};

export const LISTING_STATUS_LABEL: Record<string, string> = {
  published: 'van élő hirdetése',
  awaiting_payment: 'fizetésre vár',
  draft: 'piszkozata van',
  submitted: 'jóváhagyásra vár',
  sold: 'eladva',
  archived: 'archivált / lejárt',
};

export type BulkFilters = {
  audience: Audience;
  locale?: string;
  search?: string;
  /** owner: has at least one listing in this status. */
  listingStatus?: string;
  /** enquiry: about this listing only. */
  propertyId?: string;
  /** enquiry, search_request: created in the last N days. */
  sinceDays?: number;
  /** enquiry: 'yes' handled / 'no' not yet. */
  handled?: string;
  /** Every recipient gets this listing as the template's {{property_*}} context (an enquirer otherwise gets their own). */
  propertyContextId?: string;
};

const AUDIENCES: Audience[] = ['owner', 'enquiry', 'newsletter', 'search_request'];

export function filtersFrom(get: (key: string) => string | null | undefined): BulkFilters {
  const raw = (key: string) => (get(key) ?? '').trim();
  const audience = (AUDIENCES as string[]).includes(raw('audience')) ? (raw('audience') as Audience) : 'owner';
  const days = Number(raw('sinceDays'));
  return {
    audience,
    locale: raw('locale') || undefined,
    search: raw('search') || undefined,
    listingStatus: raw('listingStatus') || undefined,
    propertyId: raw('propertyId') || undefined,
    sinceDays: Number.isFinite(days) && days > 0 ? Math.round(days) : undefined,
    handled: raw('handled') === 'yes' || raw('handled') === 'no' ? raw('handled') : undefined,
    propertyContextId: raw('propertyContextId') || undefined,
  };
}

/** The filters as query-string pairs, for links and hidden fields. */
export function filterEntries(filters: BulkFilters): [string, string][] {
  return Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => [key, String(value)]);
}

const sinceIso = (days?: number) => (days ? new Date(Date.now() - days * 86_400_000).toISOString() : null);
const term = (search?: string) => (search ? search.replace(/[%,()]/g, '').trim() : '');

export async function findRecipients(client: Client, filters: BulkFilters): Promise<Recipient[]> {
  const rows: Recipient[] = [];
  const q = term(filters.search);

  if (filters.audience === 'owner') {
    let query = client.from('profiles').select('id, email, full_name, locale').eq('role', 'owner').limit(5000);
    if (filters.locale) query = query.eq('locale', filters.locale);
    if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    const { data: owners } = await query;
    let list = owners ?? [];
    if (filters.listingStatus) {
      const { data: listings } = await client.from('properties').select('owner_id').eq('status', filters.listingStatus).not('owner_id', 'is', null).limit(10000);
      const ids = new Set((listings ?? []).map((row: any) => row.owner_id));
      list = list.filter((owner: any) => ids.has(owner.id));
    }
    for (const owner of list as any[]) {
      rows.push({ email: owner.email, name: owner.full_name, locale: owner.locale, audience: 'owner', audienceId: owner.id });
    }
  }

  if (filters.audience === 'enquiry') {
    let query = client.from('enquiries').select('id, name, email, locale, property_id, handled, created_at').order('created_at', { ascending: false }).limit(5000);
    if (filters.locale) query = query.eq('locale', filters.locale);
    if (filters.propertyId) query = query.eq('property_id', filters.propertyId);
    if (filters.handled) query = query.eq('handled', filters.handled === 'yes');
    const since = sinceIso(filters.sinceDays);
    if (since) query = query.gte('created_at', since);
    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    const { data } = await query;
    for (const row of (data ?? []) as any[]) {
      rows.push({ email: row.email, name: row.name, locale: row.locale, audience: 'enquiry', audienceId: row.id, propertyId: row.property_id });
    }
  }

  if (filters.audience === 'newsletter') {
    let query = client.from('newsletter_subscribers').select('id, email, locale').eq('status', 'confirmed').limit(10000);
    if (filters.locale) query = query.eq('locale', filters.locale);
    if (q) query = query.ilike('email', `%${q}%`);
    const { data } = await query;
    for (const row of (data ?? []) as any[]) {
      rows.push({ email: row.email, name: null, locale: row.locale, audience: 'newsletter', audienceId: row.id });
    }
  }

  if (filters.audience === 'search_request') {
    let query = client.from('search_requests').select('id, name, email, locale, created_at').order('created_at', { ascending: false }).limit(5000);
    if (filters.locale) query = query.eq('locale', filters.locale);
    const since = sinceIso(filters.sinceDays);
    if (since) query = query.gte('created_at', since);
    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    const { data } = await query;
    for (const row of (data ?? []) as any[]) {
      rows.push({ email: row.email, name: row.name, locale: row.locale, audience: 'search_request', audienceId: row.id });
    }
  }

  // One address, one email: the newest row wins (each query is newest-first where it has a date).
  const seen = new Set<string>();
  const unique: Recipient[] = [];
  for (const row of rows) {
    const key = normalizeEmailAddress(row.email ?? '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push({
      ...row,
      locale: localeFrom(row.locale),
      propertyId: filters.propertyContextId ?? row.propertyId ?? null,
    });
  }
  return unique;
}

export type Preflight = {
  total: number;
  sendable: Recipient[];
  invalid: number;
  suppressed: Partial<Record<SuppressionReason, number>>;
  byLocale: Record<string, number>;
};

/** "84 selected · 80 sendable · 2 invalid · 1 unsubscribed · 1 bounced" — computed before anything is queued. */
export async function preflight(client: Client, candidates: Recipient[]): Promise<Preflight> {
  const blocked = await suppressionMap(client);
  const result: Preflight = { total: candidates.length, sendable: [], invalid: 0, suppressed: {}, byLocale: {} };
  for (const candidate of candidates) {
    if (!isValidEmailAddress(candidate.email)) {
      result.invalid += 1;
      continue;
    }
    const reason = blocked.get(normalizeEmailAddress(candidate.email));
    if (reason) {
      result.suppressed[reason] = (result.suppressed[reason] ?? 0) + 1;
      continue;
    }
    result.sendable.push(candidate);
    result.byLocale[candidate.locale] = (result.byLocale[candidate.locale] ?? 0) + 1;
  }
  return result;
}
