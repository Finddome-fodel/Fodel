/**
 * Shared by astro.config.mjs (which cannot import TypeScript) and by the app.
 * Keep this file plain JS.
 */

/**
 * The canonical origin — the ONE place it is written (brief 3 §A). Every
 * canonical, hreflang, sitemap, RSS, robots/llms line, JSON-LD and email link
 * derives from this. finddome.com from 2026-10-24 (client decision, "for now";
 * it was fodel.eu from 2026-09-29). The old fodel.nl / fodel.hu / eladod.com
 * hosts are redirected at DNS/host level.
 *
 * PUBLIC_SITE_URL overrides it (no trailing slash needed). Until finddome.com's
 * DNS points at Vercel it is a parked page, so every e-mailed link (newsletter
 * confirm/unsubscribe, valuation results, owner links…) was dead; set
 * PUBLIC_SITE_URL=https://fodel.vercel.app on Vercel until the domain is live,
 * then remove it. Read through globalThis so this file stays safe to import
 * from browser code, where there is no `process`.
 */
export const DEFAULT_SITE_URL = 'https://finddome.com';

function resolveSiteUrl() {
  const raw = globalThis.process?.env?.PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    const url = new URL(raw);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.origin;
  } catch {
    // fall through to the default
  }
  return DEFAULT_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();

/** The bare host, for copy that names the website ("látható a finddome.com oldalon"). */
export const SITE_HOST = new URL(SITE_URL).host;

/** Every language the public site exists in, each as a complete site under /<code>/. */
export const LOCALES = ['hu', 'nl', 'en', 'de', 'fr', 'es', 'pl', 'ro', 'sk', 'it', 'pt', 'el', 'cs', 'sl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt'];

export const DEFAULT_LOCALE = 'hu';

/** Kept for older imports: the planned set is now the live set. */
export const PLANNED_LOCALES = LOCALES;
