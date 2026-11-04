/** Policy switch for restoring the pre-1.3 pay-before-publish workflow.
 * Like STRIPE_ENABLED this is read at build time and needs a redeploy. */
export function paymentGatesPublishing(): boolean {
  return String(import.meta.env.PAYMENT_GATES_PUBLISHING) === 'true';
}

/**
 * Whether a listing page says that its text was translated automatically.
 * The AI-written rows are always marked in the database (property_translations.machine);
 * this is the one switch for showing it. Off by default. Read at build time like the flag above.
 */
export function showMachineTranslationNote(): boolean {
  return String(import.meta.env.SHOW_MACHINE_TRANSLATION_NOTE) === 'true';
}

/**
 * What a listing page does in a language the listing was not bought in (or that was switched off):
 *   'redirect'  there is no page: a 301 to the English one, no hreflang, no sitemap entry (the default)
 *   'fallback'  the page exists with English text, marked noindex, left out of hreflang and the sitemap
 * A language that was switched off on purpose always redirects. Set UNPURCHASED_LISTING_LOCALES=fallback in
 * Vercel (then redeploy) to choose the second behaviour. Read at build time like the flags above.
 */
export function unpurchasedListingLocales(): 'redirect' | 'fallback' {
  return String(import.meta.env.UNPURCHASED_LISTING_LOCALES) === 'fallback' ? 'fallback' : 'redirect';
}

/**
 * Whether the address a visitor shares carries `utm_source=<channel>&utm_medium=share&utm_campaign=listing`. On by default;
 * `SHARE_UTM=off` switches it off. It is only ever added to the shared address, never to the canonical or og:url.
 */
export function shareUtm(): boolean {
  return String(import.meta.env.SHARE_UTM ?? 'on').toLowerCase() !== 'off';
}
