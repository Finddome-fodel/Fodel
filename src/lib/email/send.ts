/**
 * Resend wrapper for the portal's lifecycle emails.
 *
 * Same log-instead-of-fail contract as src/lib/form-handler.ts uses for the
 * public forms: with no RESEND_API_KEY the portal is still fully testable
 * offline, it just narrates what it would have sent.
 *
 * A lifecycle email is a courtesy, never the source of truth — by the time one
 * is sent, the status change that triggered it has already been committed. So
 * a send failure must never fail the request that caused it. What 1.1 adds
 * over 1.0 is that a *transient* failure now gets two more chances before we
 * accept the loss, because the most common Resend failure is a momentary 429
 * or 5xx, and one retry a second later almost always succeeds.
 *
 * What this deliberately is NOT: a durable queue with a dead-letter table. If
 * the process dies mid-retry the email is gone. Building persistence properly
 * (an outbox table, a worker, replay, idempotency keys) is its own project,
 * and a half-built queue is worse than an honest lack of one — it looks like a
 * guarantee it cannot keep. Flagged in the 1.1 plan as known and unbuilt.
 */
import { localeFrom } from '~/i18n/ui';
import { Resend } from 'resend';
import type { BuiltEmail } from './templates';
import type { EmailLocale } from './layout';
import { senderAddress, officeInbox, replyToAddress } from './routing';
import { withRetry } from './retry';

export type { EmailLocale } from './layout';
export { templates } from './templates';

/**
 * `EMAIL_TRANSPORT=capture` (end-to-end tests only): every message is written
 * as one JSON file to `.e2e/outbox/` and nothing is sent. The Playwright suite
 * reads invite and reset links from there, so a full registration can run
 * without a mailbox and without ever reaching Resend. Unset means the normal
 * Resend path below; production never sets it.
 */
const CAPTURE_DIR = '.e2e/outbox';

async function capture(message: Record<string, unknown>): Promise<boolean> {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  await mkdir(CAPTURE_DIR, { recursive: true });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  await writeFile(join(CAPTURE_DIR, name), JSON.stringify(message, null, 2));
  return true;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative. Always pass it — see the note in layout.ts. */
  text?: string;
  replyTo?: string;
  /** Files to attach — the invoice PDF. */
  attachments?: { filename: string; content: Buffer }[];
  /** Defaults to the portal sender; the public forms pass `senderAddress('website')`. */
  from?: string;
}): Promise<boolean> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = opts.from ?? senderAddress('portal');

  if (import.meta.env.EMAIL_TRANSPORT === 'capture') {
    return capture({
      from,
      to: opts.to,
      replyTo: opts.replyTo ?? replyToAddress(),
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: (opts.attachments ?? []).map((a) => a.filename),
      at: new Date().toISOString(),
    });
  }

  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY unset — would send "${opts.subject}" to ${opts.to}`);
    return false;
  }

  const resend = new Resend(apiKey);

  const result = await withRetry(async () => {
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo ?? replyToAddress(),
      ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
    });
    return error;
  });
  if (!result.sent) {
    console.error(
      `[email] giving up on "${opts.subject}" to ${opts.to} after ${result.attempts} attempt(s)`,
      result.error
    );
  }
  return result.sent;
}

/** Sends a template's output. The one call site shape every trigger should use. */
export async function deliver(to: string, email: BuiltEmail, replyTo?: string): Promise<void> {
  const sent = await sendEmail({ to, subject: email.subject, html: email.html, text: email.text, replyTo });
  // Callers fire-and-forget, so this line is the only trace of a mail that never left
  // (provider rejection, missing key). sendEmail has already logged the reason.
  if (!sent) console.error('[email] not delivered', email.subject, to);
}

/**
 * Which language to write to someone in.
 *
 * `profiles.locale` is the recipient's own stated language and is always
 * populated (the column is `not null default 'hu'`). It can be any of the five
 * site languages; anything else falls back to Hungarian, which is FODEL's
 * default and the language of the office.
 */
export function localeOf(profile: { locale?: string | null } | null | undefined): EmailLocale {
  return localeFrom(profile?.locale);
}

/**
 * Every admin's address, for the "new submission" alert.
 *
 * Uses the admin (service-role) client because the person triggering it is an
 * *owner* — RLS would correctly stop them reading the admin roster, and the
 * alternative (a single hardcoded inbox) silently breaks the moment FODEL adds
 * a second reviewer. Falls back to the office inbox (src/lib/email/routing.ts)
 * if no admin profile exists yet.
 */
export async function adminRecipients(adminClient: {
  from: (table: string) => any;
}): Promise<string[]> {
  const fallback = officeInbox();
  try {
    const { data } = await adminClient.from('profiles').select('email').eq('role', 'admin');
    const emails = (data ?? []).map((row: { email: string }) => row.email).filter(Boolean);
    return emails.length ? emails : [fallback];
  } catch {
    return [fallback];
  }
}
