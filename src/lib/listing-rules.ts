/**
 * The business rules of a live listing, as pure functions: when it expires,
 * when its owner is reminded, when the monthly "still available?" email is
 * due, whether the seller's phone is shown, where an approximate location is
 * drawn, and what "exclude adobe houses" keeps.
 *
 * No database, no Astro imports — scripts/test-rules.mjs runs these directly,
 * and the cron, the public pages and the admin all call the same functions.
 *
 * Every number here is a default the admin can change in Beállítások →
 * Szolgáltatások (site_settings.services). None of them is a client decision
 * yet; the handover lists each one.
 */

export type PackageId = 'cheap-6m' | 'normal-12m';

export type ListingRules = {
  /** Phone number on the public page, per package. Default: Standard no, Kiemelt yes. */
  packagePhone: Record<PackageId, boolean>;
  /** Days before expiry for the two reminders. */
  expiry: { firstReminderDays: number; lastReminderDays: number };
  /** The monthly "is it still available?" email. */
  ownerRefresh: { enabled: boolean; intervalDays: number; reminderAfterDays: number; flagAfterDays: number; linkDays: number };
};

export const LISTING_RULES_DEFAULT: ListingRules = {
  packagePhone: { 'cheap-6m': false, 'normal-12m': true },
  expiry: { firstReminderDays: 14, lastReminderDays: 3 },
  ownerRefresh: { enabled: true, intervalDays: 30, reminderAfterDays: 7, flagAfterDays: 14, linkDays: 30 },
};

const int = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

/** Stored settings (any shape, possibly missing) → complete, sane rules. */
export function listingRules(stored?: Partial<{ packagePhone: unknown; expiry: unknown; ownerRefresh: unknown }> | null): ListingRules {
  const d = LISTING_RULES_DEFAULT;
  const phone = (stored?.packagePhone ?? {}) as Partial<Record<PackageId, unknown>>;
  const expiry = (stored?.expiry ?? {}) as Partial<Record<keyof ListingRules['expiry'], unknown>>;
  const refresh = (stored?.ownerRefresh ?? {}) as Partial<Record<keyof ListingRules['ownerRefresh'], unknown>>;
  const first = int(expiry.firstReminderDays, d.expiry.firstReminderDays, 1, 90);
  const last = int(expiry.lastReminderDays, d.expiry.lastReminderDays, 1, 90);
  return {
    packagePhone: {
      'cheap-6m': typeof phone['cheap-6m'] === 'boolean' ? phone['cheap-6m'] : d.packagePhone['cheap-6m'],
      'normal-12m': typeof phone['normal-12m'] === 'boolean' ? phone['normal-12m'] : d.packagePhone['normal-12m'],
    },
    // The first reminder is always the earlier one, whatever order they were typed in.
    expiry: { firstReminderDays: Math.max(first, last), lastReminderDays: Math.min(first, last) },
    ownerRefresh: {
      enabled: typeof refresh.enabled === 'boolean' ? refresh.enabled : d.ownerRefresh.enabled,
      intervalDays: int(refresh.intervalDays, d.ownerRefresh.intervalDays, 7, 365),
      reminderAfterDays: int(refresh.reminderAfterDays, d.ownerRefresh.reminderAfterDays, 1, 60),
      flagAfterDays: int(refresh.flagAfterDays, d.ownerRefresh.flagAfterDays, 1, 90),
      linkDays: int(refresh.linkDays, d.ownerRefresh.linkDays, 1, 90),
    },
  };
}

/* ── Dates ─────────────────────────────────────────────────────────────── */

const DAY = 86_400_000;

/**
 * Calendar months, clamped to the last day of the target month: 31 January
 * plus one month is 28/29 February, never 3 March (which is what a bare
 * Date#setMonth does).
 */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}

/**
 * A renewal adds its months to whatever is left: renewing early never loses
 * days, renewing after expiry starts from today.
 */
export function renewedExpiry(currentExpiry: Date | null, now: Date, months: number): Date {
  const base = currentExpiry && currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
  return addMonths(base, months);
}

export function isExpired(expiresAt: string | Date | null | undefined, now: Date = new Date()): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= now.getTime();
}

/** Whole days left, rounded up: 2.1 days left reads "3 days". Negative once expired. */
export function daysLeft(expiresAt: string | Date, now: Date = new Date()): number {
  return Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / DAY);
}

export type ExpiryAction = 'first-reminder' | 'last-reminder' | 'expire' | null;

/**
 * What the daily cron owes one published listing today. Exactly one action
 * per run; the *_sent_at columns are what stop a second run repeating it.
 */
export function expiryAction(
  row: { expires_at: string | null; expiry_first_reminder_sent_at?: string | null; expiry_last_reminder_sent_at?: string | null },
  rules: ListingRules,
  now: Date = new Date()
): ExpiryAction {
  if (!row.expires_at) return null;
  const left = (new Date(row.expires_at).getTime() - now.getTime()) / DAY;
  if (left <= 0) return 'expire';
  if (left <= rules.expiry.lastReminderDays) return row.expiry_last_reminder_sent_at ? null : 'last-reminder';
  if (left <= rules.expiry.firstReminderDays) return row.expiry_first_reminder_sent_at ? null : 'first-reminder';
  return null;
}

/* ── Monthly owner refresh ─────────────────────────────────────────────── */

export type RefreshRow = {
  published_at?: string | null;
  confirmed_at?: string | null;
  refresh_requested_at?: string | null;
  refresh_reminder_sent_at?: string | null;
};

const t = (iso?: string | null) => (iso ? new Date(iso).getTime() : 0);

/** The owner answered the latest request (still available, or a new price). */
export function answeredLatest(row: RefreshRow): boolean {
  return Boolean(row.refresh_requested_at) && t(row.confirmed_at) >= t(row.refresh_requested_at);
}

export type RefreshAction = 'request' | 'reminder' | null;

export function refreshAction(row: RefreshRow, rules: ListingRules, now: Date = new Date()): RefreshAction {
  if (!rules.ownerRefresh.enabled) return null;
  const n = now.getTime();
  const r = rules.ownerRefresh;
  const pending = Boolean(row.refresh_requested_at) && !answeredLatest(row);

  if (pending) {
    const since = n - t(row.refresh_requested_at);
    if (!row.refresh_reminder_sent_at && since >= r.reminderAfterDays * DAY && since < r.flagAfterDays * DAY) return 'reminder';
    // An unanswered request is never replaced by a new one: the listing stays
    // flagged until the owner answers or an admin acts.
    return null;
  }
  // Last contact: the latest answer, else the last request, else publication.
  const last = Math.max(t(row.confirmed_at), t(row.refresh_requested_at), t(row.published_at));
  return last && n - last >= r.intervalDays * DAY ? 'request' : null;
}

/** "Nem válaszolt": asked, not answered, for longer than the flag threshold. Never unpublishes anything. */
export function isUnresponsive(row: RefreshRow, rules: ListingRules, now: Date = new Date()): boolean {
  if (!row.refresh_requested_at || answeredLatest(row)) return false;
  return now.getTime() - t(row.refresh_requested_at) >= rules.ownerRefresh.flagAfterDays * DAY;
}

/* ── Public contact ────────────────────────────────────────────────────── */

/** The phone is shown only when the package allows it AND the seller agreed to publish it. */
export function showSellerPhone(
  listing: { package: string; contactVisible: boolean; phone?: string | null },
  rules: ListingRules
): boolean {
  const allowed = rules.packagePhone[listing.package as PackageId] ?? false;
  return allowed && listing.contactVisible && Boolean(listing.phone?.trim());
}

/* ── Search ────────────────────────────────────────────────────────────── */

export const ADOBE_WALL_KEY = 'valyog';

/** "Exclude adobe houses" removes only listings known to be adobe (any of their walls); unknown or unset stays in. */
export function passesAdobeFilter(walls: string | readonly string[] | null | undefined, excludeAdobe: boolean): boolean {
  const keys = Array.isArray(walls) ? walls : walls ? [walls] : [];
  return !excludeAdobe || !keys.includes(ADOBE_WALL_KEY);
}

/* ── Approximate location ──────────────────────────────────────────────── */

/** Radius of the soft circle drawn for an approximate listing, in metres. */
export const APPROX_RADIUS_M = 900;

/**
 * Where an approximate listing is drawn: the real point moved 250–650 m in a
 * direction derived from the listing's id. Deterministic, so reloading the
 * page (or comparing two pages) never averages out to the real address, and
 * the true point always stays inside the drawn circle.
 */
export function approximateCentre(id: string, lat: number, lng: number): { lat: number; lng: number } {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const angle = ((h & 0xffff) / 0x10000) * 2 * Math.PI;
  const distance = 250 + ((h >>> 16) / 0x10000) * 400;
  const dLat = (distance * Math.cos(angle)) / 111_320;
  const dLng = (distance * Math.sin(angle)) / (111_320 * Math.cos((lat * Math.PI) / 180));
  const round = (n: number) => Math.round(n * 1e5) / 1e5;
  return { lat: round(lat + dLat), lng: round(lng + dLng) };
}

/* ── Compact price for map markers ─────────────────────────────────────── */

/** €178k, €1.25M, €950 — the marker pill. */
export function compactEur(amount: number): string {
  if (amount >= 999_500) return `€${Number((amount / 1_000_000).toFixed(amount >= 9_995_000 ? 0 : 2))}M`;
  if (amount >= 1_000) return `€${Math.round(amount / 1_000)}k`;
  return `€${Math.round(amount)}`;
}
