/**
 * Who FODEL's email comes from, where replies go, and which inbox receives
 * the website's forms — the one place these addresses are decided.
 *
 * Deployment configuration (environment variables), not an admin setting, on
 * purpose: a sender address only delivers once its domain is verified at the
 * mail provider, so changing it is a DNS task, not a form field. Whether FODEL
 * ends up with one shared address or shared plus personal ones is still an
 * open business decision (brief §9) — whichever it is, it changes here and in
 * the environment, nowhere else.
 *
 *   FODEL_FROM      sender, e.g. "FODEL <info@finddome.com>" (a domain verified in Resend)
 *   FODEL_INBOX     where form submissions and admin fallbacks are delivered
 *   FODEL_REPLY_TO  where a customer's reply lands; defaults to FODEL_INBOX
 */
import { COMPANY } from '~/config/company';

/** `portal` is lifecycle mail (accounts, listings); `website` is a form's own notification. */
// The sender must be on a domain verified in Resend (finddome.com today). Replies and form mail go to
// the company inbox, info@fodel.com, whatever the sender is: see replyToAddress() and officeInbox().
//
// One display name for everything: a visitor who gets a "FODEL Website" thanks and then a
// "FODEL Portál" mail from the same domain sees two senders, which spam filters read the
// same way. `kind` stays in the signature for the call sites that already pass it.
export function senderAddress(_kind: 'portal' | 'website' = 'portal'): string {
  return import.meta.env.FODEL_FROM || 'FODEL <info@finddome.com>';
}

export function officeInbox(): string {
  return import.meta.env.FODEL_INBOX || COMPANY.email.primary;
}

/**
 * Every customer email says "just reply to this email". Without an explicit
 * reply-to that reply goes to the sender address, which is often not a
 * mailbox anyone reads — so it defaults to the office inbox.
 */
export function replyToAddress(): string {
  return import.meta.env.FODEL_REPLY_TO || officeInbox();
}
