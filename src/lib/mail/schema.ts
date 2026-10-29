/**
 * Is migration 0038 in the database yet?
 *
 * The code can reach production before anyone has pasted 0038 into the
 * Supabase SQL editor. Until then every /portal/email page shows one friendly
 * "run the migration" page (src/pages/portal/email/setup.astro) instead of a
 * 404 or an error, every /api/portal/email action sends the admin there, and
 * the public forms keep sending their built-in acknowledgement
 * (src/lib/mail/automation.ts falls back on any error).
 *
 * Once the tables are seen they stay: the answer is remembered for the life
 * of the server instance, so a migrated site pays for the check once.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

type Client = SupabaseClient<any, any, any>;

/** PostgREST's / Postgres's "no such table / function", as supabase-js reports it. */
export function isMissingMailSchema(error: { code?: string | null; message?: string | null } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && ['42P01', 'PGRST205', 'PGRST202', '42883'].includes(error.code)) return true;
  return /mail_[a-z_]+/.test(error.message ?? '') && /does not exist|schema cache|could not find/i.test(error.message ?? '');
}

let confirmed = false;

export async function mailSchemaReady(client: Client): Promise<boolean> {
  if (confirmed) return true;
  const { error } = await client.from('mail_templates').select('id').limit(1);
  if (!error) {
    confirmed = true;
    return true;
  }
  // Any other failure (network, permissions) is not "the migration is missing":
  // the page goes on and shows its own error rather than misdirecting the admin.
  return !isMissingMailSchema(error);
}

export const SETUP_PATH = '/portal/email/setup';
