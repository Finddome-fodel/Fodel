/**
 * The system emails' editable wording (migration 0040, /portal/email/system).
 *
 * The built-in wording lives in code (copy/<locale>.ts, lifecycle.ts) and is
 * the source of truth. An admin's edit is a sparse overlay on top of it: one
 * row per email and language, holding only the fields that were changed. Every
 * email builder looks its copy up through `applyTexts`, so a field with no
 * overlay is byte-for-byte the built-in text, a language nobody touched never
 * differs from the code, and "restore the default" is deleting the overlay.
 *
 * What an overlay can change is plain text: a string, a list of strings (one
 * per line) or a sentence with placeholders — `{{title}}`, `{{ref}}` — where
 * the built-in copy is a function of the listing's data. The email's layout
 * (button, link, tables) is never part of it.
 *
 * The builders are synchronous and called from dozens of places, so the
 * overlays are held in memory and refreshed from the database in the
 * middleware (`primeSystemTexts`, at most every 30 s per server instance). If
 * the table is missing or the database is down the cache stays as it was and
 * the built-in wording is used: a mail is never held up by an edit.
 */

export type TextOverlay = Record<string, string>;
export type TextFields = Record<string, unknown>;

const REFRESH_MS = 30_000;
const FETCH_TIMEOUT_MS = 2_500;

let overlays = new Map<string, TextOverlay>();
let version = 0;
let loadedAt = 0;
let loading: Promise<void> | null = null;
/** The editor's preview: unsaved fields applied to exactly one email and language. */
let draft: { key: string; locale: string; fields: TextOverlay } | null = null;

const slot = (key: string, locale: string) => `${key}:${locale}`;

/**
 * Which placeholders a text field can carry, in the order the built-in wording
 * receives its arguments — `key.field` → names. A field that is a function of
 * the listing's data is only editable when it is listed here; the test in
 * scripts/test-rules.mjs fails when a function field is neither listed nor
 * deliberately left out, so a new field cannot silently become uneditable.
 */
export const PARAMS: Record<string, string[]> = {
  'welcome.heading': ['name'],
  'submissionReceived.subject': ['ref'],
  'submissionReceived.body': ['title', 'ref'],
  'adminNewSubmission.subject': ['ref'],
  'changesRequested.subject': ['ref'],
  'changesRequested.body': ['title', 'ref'],
  'approvedAwaitingPayment.subject': ['ref'],
  'approvedAwaitingPayment.body': ['title', 'ref'],
  'approvedAwaitingPayment.bankNote': ['ref'],
  'approvedPublished.subject': ['ref'],
  'approvedPublished.body': ['title', 'ref'],
  'approvedPublished.bankNote': ['ref'],
  'paymentReceipt.subject': ['ref'],
  'paymentReceipt.body': ['title', 'ref'],
  'published.subject': ['ref'],
  'published.body': ['title', 'ref'],
  'newEnquiry.subject': ['ref'],
  'newEnquiry.body': ['title', 'ref'],
  'referralRegistered.body': ['referredName'],
  'valuationReady.body': ['range'],
  'valuationReady.disclaimerWithCount': ['count'],
  'valuationReady.introWithBasis': ['range'],
  'rejected.subject': ['ref'],
  'rejected.body': ['title', 'ref'],
  'invoiceIssued.subject': ['number'],
  'invoiceIssued.body': ['title', 'ref', 'number'],
  'creditNoteIssued.subject': ['number'],
  'creditNoteIssued.body': ['title', 'ref', 'number', 'correctsNumber'],
  'serviceRequested.body': ['service', 'price'],
  'valuationPaid.body': ['service'],
  'adminServiceRequested.subject': ['service'],
  'referralAdminNotice.subject': ['referrerName'],
  'expiry.subject': ['days'],
  'expiry.intro': ['title', 'days', 'date'],
  'expiry.body': ['price'],
  'expired.intro': ['title'],
  'expired.body': ['price'],
  'renewed.intro': ['title', 'date'],
  'transfer.subject': ['ref'],
  'transfer.intro': ['title'],
  'refresh.intro': ['title', 'price'],
  'refresh.valid': ['date'],
};

/** Function fields that stay as built — they branch on more than text (refresh.subject adds "Reminder:" on the second mail). */
export const FIXED_FUNCTIONS = new Set(['refresh.subject', 'common.greeting', 'invite.body']);

const TOKEN = /\{\{\s*([a-zA-Z]+)\s*\}\}/g;

/** Every `{{name}}` in a text. */
export function tokensIn(text: string): string[] {
  return [...text.matchAll(TOKEN)].map((match) => match[1]!);
}

/** Replaces `{{name}}` with the matching value; a name the email does not have is left visible rather than lost. */
export function fillTokens(text: string, names: string[], values: unknown[]): string {
  return text.replace(TOKEN, (whole, name: string) => {
    const at = names.indexOf(name);
    return at === -1 ? whole : String(values[at] ?? '');
  });
}

/** Lines of a "list" field. */
export function toLines(text: string): string[] {
  return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

const merged = new Map<string, { at: number; value: unknown }>();

/**
 * `base` with the overlay for (key, locale) applied. Identity when there is
 * none — the common case costs one map lookup.
 */
export function applyTexts<T extends object>(key: string, locale: string, base: T): T {
  const overlay = draft && draft.key === key && draft.locale === locale ? draft.fields : overlays.get(slot(key, locale));
  if (!overlay || Object.keys(overlay).length === 0) return base;

  const cacheKey = slot(key, locale);
  const cached = merged.get(cacheKey);
  if (!draft && cached && cached.at === version) return cached.value as T;

  const next = { ...base } as Record<string, unknown>;
  for (const [field, text] of Object.entries(overlay)) {
    const original = (base as Record<string, unknown>)[field];
    if (typeof text !== 'string') continue;
    if (typeof original === 'string') next[field] = text;
    else if (Array.isArray(original)) next[field] = toLines(text);
    else if (typeof original === 'function') {
      const names = PARAMS[`${key}.${field}`] ?? [];
      next[field] = (...args: unknown[]) => fillTokens(text, names, args);
    }
  }
  if (!draft) merged.set(cacheKey, { at: version, value: next });
  return next as T;
}

/** Runs `build` (synchronous) as if `fields` were saved for (key, locale). Used by the editor's live preview. */
export function withDraft<R>(key: string, locale: string, fields: TextOverlay, build: () => R): R {
  draft = { key, locale, fields };
  try {
    return build();
  } finally {
    draft = null;
  }
}

export function savedOverlay(key: string, locale: string): TextOverlay {
  return overlays.get(slot(key, locale)) ?? {};
}

/** Which languages of an email have an edit. */
export function editedLocales(key: string): string[] {
  const out: string[] = [];
  for (const [id, overlay] of overlays) {
    const [k, locale] = id.split(':');
    if (k === key && Object.keys(overlay).length) out.push(locale!);
  }
  return out;
}

export function setSystemTexts(rows: { key: string; locale: string; fields: unknown }[]) {
  const next = new Map<string, TextOverlay>();
  for (const row of rows) {
    if (!row.fields || typeof row.fields !== 'object') continue;
    const overlay: TextOverlay = {};
    for (const [field, text] of Object.entries(row.fields as Record<string, unknown>)) {
      if (typeof text === 'string') overlay[field] = text;
    }
    if (Object.keys(overlay).length) next.set(slot(row.key, row.locale), overlay);
  }
  overlays = next;
  version += 1;
  loadedAt = Date.now();
}

/** After a save: the next request reloads, and this instance does not wait for the interval. */
export function invalidateSystemTexts() {
  loadedAt = 0;
}

/**
 * Loads the overlays when the copy in memory is older than 30 s. Never throws
 * and never waits longer than a couple of seconds: on any failure the previous
 * copy (empty on a fresh instance) stays in use.
 */
export async function primeSystemTexts(): Promise<void> {
  if (Date.now() - loadedAt < REFRESH_MS) return;
  if (loading) return loading;
  loading = (async () => {
    try {
      const { createSupabaseAdminClient } = await import('~/lib/supabase-server');
      const query = createSupabaseAdminClient().from('mail_system_texts').select('key, locale, fields');
      const result = await Promise.race([
        query,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS)),
      ]);
      if (result && !('error' in result && result.error)) setSystemTexts((result as { data: any[] | null }).data ?? []);
      else loadedAt = Date.now(); // missing table or a slow database: keep what we have, ask again in 30 s
    } catch {
      loadedAt = Date.now();
    } finally {
      loading = null;
    }
  })();
  return loading;
}
