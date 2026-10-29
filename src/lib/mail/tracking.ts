/**
 * What happened to a sent template email, from Resend's webhook.
 *
 * Resend signs each delivery the Svix way: HMAC-SHA256 over
 * "<svix-id>.<svix-timestamp>.<raw body>" with the base64 secret after the
 * "whsec_" prefix, sent as one or more "v1,<base64>" in svix-signature.
 * Verified here with node:crypto rather than another dependency.
 *
 * Opens and clicks are only reported when open/click tracking is switched on
 * for the sending domain in Resend (Domains → finddome.com → Tracking).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

type Client = SupabaseClient<any, any, any>;

export type ResendEvent = {
  type: string;
  created_at: string;
  data: { email_id: string; to?: string[]; subject?: string; click?: { link: string }; bounce?: { type?: string } };
};

const TOLERANCE_SEC = 5 * 60;

export function verifySvix(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  nowSec = Math.floor(Date.now() / 1000)
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature || !secret) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSec - ts) > TOLERANCE_SEC) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest();
  return signature.split(' ').some((part) => {
    const [version, value] = part.split(',');
    if (version !== 'v1' || !value) return false;
    const given = Buffer.from(value, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

const EVENT_TYPE: Record<string, 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'COMPLAINED'> = {
  'email.delivered': 'DELIVERED',
  'email.opened': 'OPENED',
  'email.clicked': 'CLICKED',
  'email.bounced': 'BOUNCED',
  'email.complained': 'COMPLAINED',
};

export function mapEventType(resendType: string) {
  return EVENT_TYPE[resendType] ?? null;
}

export type LinkType = 'LISTING' | 'WEBSITE' | 'PHONE' | 'EMAIL' | 'SOCIAL' | 'UNSUBSCRIBE' | 'OTHER';

export const LINK_TYPE_LABEL: Record<LinkType, string> = {
  LISTING: 'hirdetés',
  WEBSITE: 'weboldal',
  PHONE: 'telefon',
  EMAIL: 'e-mail',
  SOCIAL: 'közösségi',
  UNSUBSCRIBE: 'leiratkozás',
  OTHER: 'egyéb link',
};

/** Which kind of link was clicked — a listing page, the site, a social profile. */
export function classifyLink(url: string, siteHost: string): LinkType {
  const lower = url.toLowerCase();
  if (lower.startsWith('tel:')) return 'PHONE';
  if (lower.startsWith('mailto:')) return 'EMAIL';
  if (/facebook\.com|instagram\.com|linkedin\.com|youtube\.com/.test(lower)) return 'SOCIAL';
  try {
    const parsed = new URL(url);
    if (parsed.host.replace(/^www\./, '') === siteHost.replace(/^www\./, '')) {
      if (parsed.pathname.startsWith('/mail/unsubscribe')) return 'UNSUBSCRIBE';
      // Listing detail pages end in the listing's 3–6 digit ref: /hu/parasztház-elado-1042/
      return /-\d{3,6}\/?$/.test(parsed.pathname) ? 'LISTING' : 'WEBSITE';
    }
  } catch {
    // not a URL: falls through to OTHER
  }
  return 'OTHER';
}

/* ── The summary shown next to a sent email ──────────────────────────────── */

export type Engagement = { opens: number; clicks: number; firstOpenAt: string | null; lastOpenAt: string | null; links: { url: string; type: string; count: number }[] };

export async function engagementFor(client: Client, messageIds: string[]): Promise<Map<string, Engagement>> {
  const result = new Map<string, Engagement>();
  if (messageIds.length === 0) return result;
  const { data } = await client
    .from('mail_events')
    .select('message_id, type, url, link_type, occurred_at')
    .in('message_id', messageIds)
    .in('type', ['OPENED', 'CLICKED'])
    .order('occurred_at', { ascending: true });
  for (const event of (data ?? []) as any[]) {
    const entry = result.get(event.message_id) ?? { opens: 0, clicks: 0, firstOpenAt: null, lastOpenAt: null, links: [] };
    if (event.type === 'OPENED') {
      entry.opens += 1;
      entry.firstOpenAt ??= event.occurred_at;
      entry.lastOpenAt = event.occurred_at;
    } else {
      entry.clicks += 1;
      const link = entry.links.find((l) => l.url === event.url);
      if (link) link.count += 1;
      else entry.links.push({ url: event.url, type: event.link_type ?? 'OTHER', count: 1 });
    }
    result.set(event.message_id, entry);
  }
  return result;
}

export function engagementBadge(entry: Engagement | undefined): string | null {
  if (!entry) return null;
  const parts: string[] = [];
  if (entry.opens > 0) parts.push(`Megnyitva ${entry.opens}×`);
  if (entry.clicks > 0) parts.push(`Kattintás ${entry.clicks}×`);
  return parts.length ? parts.join(' · ') : null;
}
