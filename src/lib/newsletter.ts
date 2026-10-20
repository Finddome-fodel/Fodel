/**
 * Newsletter sign-up: double opt-in, stored in `newsletter_subscribers`
 * (migration 0019), optionally mirrored to a Resend Audience.
 *
 * The flow: the public form inserts a `pending` row and emails a signed
 * confirmation link; only the click makes it `confirmed` and stamps
 * `consent_at` (the moment of consent) with the locale it was given in. Every
 * email carries a one-click unsubscribe link that never expires.
 *
 * RESEND_AUDIENCE_ID is optional: without it the database is the list, and
 * the admin exports it from Hírlevél. With it, a confirmed address is also
 * added to that Resend Audience and an unsubscribe is mirrored there.
 */
import { Resend } from 'resend';
import { SITE_URL } from '~/config/site.mjs';
import { signAction } from '~/lib/valuation/action-token';
import { LOCALES, localeFrom, type Locale } from '~/i18n/ui';

/** The sign-up forms exist in all five site languages, and so does the confirmation email. */
export type NewsletterLocale = Locale;
export const NEWSLETTER_LOCALES: NewsletterLocale[] = [...LOCALES];
export const asNewsletterLocale = (value: unknown): NewsletterLocale => localeFrom(value);

const CONFIRM_DAYS = 14;
const UNSUBSCRIBE_DAYS = 3650;

export function newsletterLink(action: 'confirm' | 'unsubscribe', id: string, locale: NewsletterLocale): string {
  const token = signAction(action === 'confirm' ? 'newsletter-confirm' : 'newsletter-unsubscribe', id, action === 'confirm' ? CONFIRM_DAYS : UNSUBSCRIBE_DAYS);
  return `${SITE_URL}/newsletter/${action}?s=${id}&t=${token}&l=${locale}`;
}

/** Best-effort mirror to Resend; the database stays the source of truth. */
export async function syncAudience(email: string, unsubscribed: boolean): Promise<string | null> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const audienceId = import.meta.env.RESEND_AUDIENCE_ID || process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return null;
  try {
    const resend = new Resend(apiKey);
    if (unsubscribed) {
      await resend.contacts.update({ audienceId, email, unsubscribed: true });
      return null;
    }
    const { data, error } = await resend.contacts.create({ audienceId, email, unsubscribed: false });
    if (error) console.warn('[newsletter] Resend audience sync failed', error.message);
    return data?.id ?? null;
  } catch (error) {
    console.warn('[newsletter] Resend audience sync failed', error);
    return null;
  }
}
