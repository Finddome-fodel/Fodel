/**
 * Sitemap for blog posts and case studies — same reasoning as
 * sitemap-properties.xml.ts: @astrojs/sitemap only sees build-time routes,
 * and posts are looked up from Supabase per request. Declared via a
 * `Sitemap:` line in robots.txt.
 *
 * Only a post's own pages are listed. hreflang pairs are every live language
 * version of the same article (linked through group_id); most posts have few.
 * A Dutch article shown in English as a stand-in is not a page of its own, so
 * it is neither listed nor declared as an alternate: its canonical is the
 * Dutch original.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { publishedPosts, siblingPosts, postPath, BLOG_LOCALES } from '~/lib/blog';
import { LOCALE_META } from '~/i18n/ui';

import { SITE_URL as SITE } from '~/config/site.mjs';

export const GET: APIRoute = async () => {
  const posts = (await Promise.all(BLOG_LOCALES.map((locale) => publishedPosts(locale)))).flat();

  const urls = await Promise.all(
    posts.map(async (post) => {
      const loc = `${SITE}${postPath(post)}`;
      const siblings = post.group_id ? Object.values(await siblingPosts(post)) : [];
      const links =
        siblings.length > 1
          ? siblings
              .map((version) => `<xhtml:link rel="alternate" hreflang="${LOCALE_META[version!.locale].hreflang}" href="${SITE}${postPath(version!)}" />`)
              .join('')
          : '';
      const lastmod = (post.published_at ?? post.updated_at).toISOString().slice(0, 10);
      return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod>${links}</url>`;
    })
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
    },
  });
};
