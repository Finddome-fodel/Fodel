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
 */
export const SITE_URL = 'https://finddome.com';

/** The bare host, for copy that names the website ("látható a finddome.com oldalon"). */
export const SITE_HOST = new URL(SITE_URL).host;

/** Every language the public site exists in, each as a complete site under /<code>/. */
export const LOCALES = ['hu', 'nl', 'en', 'de', 'fr', 'es', 'pl', 'ro', 'sk'];

export const DEFAULT_LOCALE = 'hu';

/** Kept for older imports: the planned set is now the live set. */
export const PLANNED_LOCALES = LOCALES;
