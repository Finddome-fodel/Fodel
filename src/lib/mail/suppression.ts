/**
 * The suppression list: addresses no bulk or automatic template email may go
 * to again — a hard bounce or spam complaint (from the Resend webhook), an
 * unsubscribe click, or an admin's manual block. The lifecycle mails
 * (registration, invoices, listing status) never consult it: they are
 * transactional, and an owner must still get their invoice.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type SuppressionReason = 'BOUNCED' | 'COMPLAINED' | 'UNSUBSCRIBED' | 'MANUAL';

export const SUPPRESSION_REASON_LABEL: Record<SuppressionReason, string> = {
  BOUNCED: 'visszapattant',
  COMPLAINED: 'spamnek jelölte',
  UNSUBSCRIBED: 'leiratkozott',
  MANUAL: 'kézzel letiltva',
};

export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Every suppressed address with its reason, for checking a whole recipient list at once. */
export async function suppressionMap(client: SupabaseClient<any, any, any>): Promise<Map<string, SuppressionReason>> {
  const { data } = await client.from('mail_suppressions').select('email, reason').limit(20000);
  return new Map((data ?? []).map((row: any) => [normalizeEmailAddress(row.email), row.reason as SuppressionReason]));
}

export async function suppressionReason(client: SupabaseClient<any, any, any>, email: string): Promise<SuppressionReason | null> {
  // Stored normalised (see suppress), so an exact match is exact — ilike would read `_` as a wildcard.
  const { data } = await client.from('mail_suppressions').select('reason').eq('email', normalizeEmailAddress(email)).maybeSingle();
  return (data?.reason as SuppressionReason) ?? null;
}

/** Adds an address; an existing entry (and its original reason) is kept. */
export async function suppress(
  client: SupabaseClient<any, any, any>,
  params: { email: string; reason: SuppressionReason; note?: string | null; createdBy?: string | null }
): Promise<void> {
  const email = normalizeEmailAddress(params.email);
  if (await suppressionReason(client, email)) return;
  const { error } = await client
    .from('mail_suppressions')
    .insert({ email, reason: params.reason, note: params.note ?? null, created_by: params.createdBy ?? null });
  // A concurrent insert of the same address loses on the unique index: that is the outcome we wanted anyway.
  if (error && error.code !== '23505') throw new Error(error.message);
}
