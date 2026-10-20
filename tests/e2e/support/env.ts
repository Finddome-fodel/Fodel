/**
 * The end-to-end suite's environment, and the guard that keeps it off the
 * live database.
 *
 * The local `.env` points at the LIVE Supabase project. The suite therefore
 * never reads it: settings come from `.env.test` only (copy
 * `.env.test.example`), and the dev server the suite starts is given those
 * values explicitly — process variables beat any `.env` file in Vite.
 *
 * Without `E2E_ALLOW_WRITES=1` the server talks to an empty, read-only
 * stand-in on 127.0.0.1:54399 (support/empty-database.mjs): public pages
 * render as on an empty site, and nothing can be read from or written to any
 * real project. The write tests (tests/e2e/lifecycle) then skip themselves.
 *
 * With `E2E_ALLOW_WRITES=1` the suite refuses to start unless SUPABASE_URL is
 * a local Supabase (`supabase start`) or the project named by
 * E2E_SUPABASE_REF — the separate "fodel-test" project, never production.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
let loaded: Record<string, string> | null = null;

/** `.env.test` as key/value pairs (process variables win). Never `.env`. */
export function loadTestEnv(): Record<string, string> {
  if (loaded) return loaded;
  const file = path.join(ROOT, '.env.test');
  const values: Record<string, string> = {};
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  for (const [key, value] of Object.entries(values)) process.env[key] ??= value;
  loaded = { ...values, ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k in values || k.startsWith('E2E_')) as [string, string][]) };
  return loaded;
}

/** A local Supabase, or exactly the test project's own host. */
export function isTestDatabase(url: string | undefined, ref: string | undefined): boolean {
  if (!url) return false;
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  return Boolean(ref) && host === `${ref}.supabase.co`;
}

export function writesAllowed(): boolean {
  const env = loadTestEnv();
  return env.E2E_ALLOW_WRITES === '1' && isTestDatabase(env.SUPABASE_URL, env.E2E_SUPABASE_REF);
}

/** Throws (stopping the run) when writes are asked for against anything but a test database. */
export function assertSafeToWrite(): void {
  const env = loadTestEnv();
  if (env.E2E_ALLOW_WRITES !== '1') return;
  if (!isTestDatabase(env.SUPABASE_URL, env.E2E_SUPABASE_REF)) {
    throw new Error(
      'E2E_ALLOW_WRITES=1 but SUPABASE_URL is neither localhost nor the project named by E2E_SUPABASE_REF. ' +
        'Refusing to run: the write tests must never touch the live database.'
    );
  }
}

/** What the dev server under test is started with. */
export function serverEnv(): Record<string, string> {
  const env = loadTestEnv();
  const common = {
    EMAIL_TRANSPORT: 'capture',
    RESEND_API_KEY: '',
    RESEND_AUDIENCE_ID: '',
    OPENAI_API_KEY: '',
    AI_ENABLED: 'false',
    CRM_WEBHOOK_URL: '',
    CRON_SECRET: env.CRON_SECRET ?? 'e2e-cron-secret',
    // On with a dummy key by default: signature checking works offline, and no spec ever reaches Stripe.
    STRIPE_ENABLED: env.STRIPE_ENABLED ?? 'true',
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY ?? 'sk_test_e2e_dummy',
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET ?? 'whsec_e2e_dummy',
    FODEL_INBOX: 'office@fodel-test.local',
    FODEL_FROM: 'FODEL Test <portal@fodel-test.local>',
    FODEL_REPLY_TO: 'office@fodel-test.local',
  };
  if (writesAllowed()) {
    return {
      ...common,
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ?? '',
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    };
  }
  return {
    ...common,
    SUPABASE_URL: 'http://127.0.0.1:54399',
    SUPABASE_ANON_KEY: 'e2e-no-database',
    SUPABASE_SERVICE_ROLE_KEY: 'e2e-no-database',
  };
}

export const OUTBOX = path.join(ROOT, '.e2e', 'outbox');
