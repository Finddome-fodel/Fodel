/**
 * The fixed "Ingyenes feltöltő link" (migration 0044).
 *
 * One link for the whole office: an admin copies it from the Ingatlanok page and
 * sends it to anyone. Whoever opens it leaves a name, an e-mail address and a phone
 * number and goes straight into the listing wizard, on a free listing that waits
 * for an admin's approval (`properties.free_listing`, see api/.../status.ts). There
 * is no invite, no role and no set-a-password e-mail.
 *
 * The secret in the address lives in `free_upload_link` (one row). An admin can turn
 * the link off or replace the secret, which retires every copy already sent out.
 *
 * This file is pure apart from the Supabase calls (the client is passed in), so the
 * rules can be tested without a database.
 */
import crypto from 'node:crypto';
import { validateField, normalizePhone, isPhoneCountry, defaultPhoneCountry } from '../validation.ts';

export type UploadLinkRow = { token: string; enabled: boolean };
export type UploadLinkState = 'ok' | 'off' | 'invalid' | 'unavailable';

export const UPLOAD_LINK_PATH = '/portal/upload/';

export const newUploadToken = (): string => crypto.randomBytes(24).toString('base64url');

export const uploadLinkUrl = (origin: string, token: string): string => `${origin.replace(/\/$/, '')}${UPLOAD_LINK_PATH}${token}`;

/** A token as it may appear in an address: what `newUploadToken` makes, nothing else. */
export const looksLikeUploadToken = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{20,64}$/.test(value);

/** The table is missing (migration 0044 not run yet): the page and the button say so instead of failing. */
export function isMissingUploadLinkSchema(error: { code?: string | null; message?: string | null } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && ['42P01', 'PGRST205'].includes(error.code)) return true;
  return /free_upload_link/.test(error.message ?? '') && /does not exist|schema cache|could not find/i.test(error.message ?? '');
}

/** Same comparison for two secrets of any length, without leaking where they differ. */
export function sameToken(a: string, b: string): boolean {
  const left = crypto.createHash('sha256').update(a).digest();
  const right = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

/* ── What the page asks for ─────────────────────────────────────────────── */

export type UploadSignupError = 'name' | 'email' | 'phone' | 'consent';
export type UploadSignup =
  | { ok: true; values: { name: string; email: string; phone: string } }
  | { ok: false; errors: Partial<Record<UploadSignupError, true>> };

/**
 * Name, e-mail and phone: the same rules the site's other forms use
 * (src/lib/validation.ts), run again on the server. The phone is stored as E.164.
 */
export function validateUploadSignup(input: { name?: unknown; email?: unknown; phone?: unknown; phoneCountry?: unknown; consent?: unknown }, locale: string): UploadSignup {
  const name = String(input.name ?? '').replace(/\s+/g, ' ').trim();
  const email = String(input.email ?? '').trim().toLowerCase();
  const phoneRaw = String(input.phone ?? '').trim();
  const picked = String(input.phoneCountry ?? '');
  const country = isPhoneCountry(picked) ? picked : defaultPhoneCountry(locale);

  const errors: Partial<Record<UploadSignupError, true>> = {};
  if (validateField({ rule: 'text', required: true, maxLength: 120 }, name)) errors.name = true;
  if (validateField({ rule: 'email', required: true, maxLength: 160 }, email)) errors.email = true;
  const phone = normalizePhone(phoneRaw, country);
  if (!phone.ok) errors.phone = true;
  if (input.consent !== 'yes') errors.consent = true;
  if (Object.keys(errors).length > 0 || !phone.ok) return { ok: false, errors };
  return { ok: true, values: { name, email, phone: phone.e164 } };
}

/* ── The stored link ────────────────────────────────────────────────────── */

type Client = any;

/** The row, or null when there is none yet. Throws a readable error for anything but "table missing". */
export async function readUploadLink(client: Client): Promise<{ row: (UploadLinkRow & { rotated_at: string | null }) | null; missingSchema: boolean }> {
  const { data, error } = await client.from('free_upload_link').select('token, enabled, rotated_at').eq('id', 1).maybeSingle();
  if (error) {
    if (isMissingUploadLinkSchema(error)) return { row: null, missingSchema: true };
    throw new Error(error.message);
  }
  return { row: data ?? null, missingSchema: false };
}

/** The link as an admin sees it: made the first time it is asked for, then always the same. */
export async function ensureUploadLink(client: Client): Promise<{ row: (UploadLinkRow & { rotated_at: string | null }) | null; missingSchema: boolean }> {
  const first = await readUploadLink(client);
  if (first.row || first.missingSchema) return first;
  // Two admins opening it at once: the loser's insert is ignored and the winner's row is read back.
  const { error } = await client.from('free_upload_link').upsert({ id: 1, token: newUploadToken(), enabled: true }, { onConflict: 'id', ignoreDuplicates: true });
  if (error && !isMissingUploadLinkSchema(error)) throw new Error(error.message);
  return readUploadLink(client);
}

/** A new secret; every copy of the old link stops working. Turns the link on again. */
export async function rotateUploadLink(client: Client): Promise<void> {
  const row = await ensureUploadLink(client);
  if (row.missingSchema) throw new Error('missing-schema');
  const { error } = await client
    .from('free_upload_link')
    .update({ token: newUploadToken(), enabled: true, rotated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw new Error(error.message);
}

export async function setUploadLinkEnabled(client: Client, enabled: boolean): Promise<void> {
  const row = await ensureUploadLink(client);
  if (row.missingSchema) throw new Error('missing-schema');
  const { error } = await client.from('free_upload_link').update({ enabled }).eq('id', 1);
  if (error) throw new Error(error.message);
}

/** Is `token` the live secret? `unavailable` means the table is not there (migration 0044 not run) or could not be read. */
export async function checkUploadToken(client: Client, token: unknown): Promise<UploadLinkState> {
  if (!looksLikeUploadToken(token)) return 'invalid';
  let read: Awaited<ReturnType<typeof readUploadLink>>;
  try {
    read = await readUploadLink(client);
  } catch {
    return 'unavailable';
  }
  if (read.missingSchema) return 'unavailable';
  if (!read.row || !sameToken(read.row.token, token)) return 'invalid';
  return read.row.enabled ? 'ok' : 'off';
}
