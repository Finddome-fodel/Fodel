/**
 * Sitemap for property detail pages.
 *
 * @astrojs/sitemap builds its sitemap from routes it can see at build time —
 * which works for every static page, but property detail pages no longer
 * have a fixed list: they're looked up from Supabase per request (see
 * src/pages/hu/[slug].astro). This is a second, hand-written sitemap that
 * queries the same data live and lists every property currently live, so
 * search engines still find each listing without waiting for a rebuild.
 * Declared to crawlers via a second `Sitemap:` line in public/robots.txt —
 * a page is allowed to point to more than one sitemap file.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { activeProperties, publishedLocalesOf, translationConfig, url as propertyUrl } from '~/lib/properties';
import { LOCALES, LOCALE_META } from '~/i18n/ui';
import { SITE_URL as SITE } from '~/config/site.mjs';

export const GET: APIRoute = async () => {
  const properties = await activeProperties();
  const languages = await translationConfig();

  const urls = properties.map((p) => {
    // Only the languages the listing is published in (src/lib/listing-languages.ts); before migration 0052 every language, as it always was.
    const locales = p.data.listing.languagePolicy.gated ? publishedLocalesOf(p, languages) : [...LOCALES];
    const links = locales.map(
      (l) => `<xhtml:link rel="alternate" hreflang="${LOCALE_META[l].hreflang}" href="${SITE}${propertyUrl(p, l)}" />`
    ).join('');
    // Hungarian is the canonical entry when it is published, matching the rest of the site's hreflang graph
    // (see src/lib/page.ts alternatesFor); otherwise the first language the listing is published in.
    const canonical = locales.includes('hu') ? 'hu' : locales[0] ?? 'en';
    return `<url><loc>${SITE}${propertyUrl(p, canonical)}</loc><lastmod>${p.data.listing.publishedAt
      .toISOString()
      .slice(0, 10)}</lastmod>${links}</url>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
    },
  });
};
