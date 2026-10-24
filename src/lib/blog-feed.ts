/**
 * The RSS feed of a language's blog. One function for all five feed routes
 * (src/pages/<lang>/<blog>/rss.xml.ts): the same list the blog index shows,
 * so a stand-in Dutch article reaches an English reader's feed with the
 * same note.
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { localizedPosts, postPathIn } from '~/lib/blog';
import { sourceNote } from '~/i18n/fallback';
import { SITE_URL } from '~/config/site.mjs';
import type { Locale } from '~/i18n/ui';

const FEED: Record<Locale, { title: string; description: string }> = {
  hu: { title: 'FODEL Ingatlan — Hírek és cikkek', description: 'Elemzések a magyar ingatlanpiacról és a nyugat-európai vevőkről.' },
  nl: { title: 'FODEL Vastgoed — Nieuws en achtergrond', description: 'Analyses over de Hongaarse vastgoedmarkt en West-Europese kopers.' },
  en: { title: 'FODEL Real Estates: news and articles', description: 'Analysis of the Hungarian property market and Western European buyers.' },
  de: { title: 'FODEL Immobilien: Neuigkeiten und Artikel', description: 'Analysen zum ungarischen Immobilienmarkt und zu Käufern aus Westeuropa.' },
  fr: { title: 'FODEL Immobilier : actualités et articles', description: 'Analyses du marché immobilier hongrois et des acheteurs d’Europe de l’Ouest.' },
  es: { title: 'FODEL Inmobiliaria: noticias y artículos', description: 'Análisis del mercado inmobiliario húngaro y de los compradores de Europa Occidental.' },
  pl: { title: 'FODEL Nieruchomości: aktualności i artykuły', description: 'Analizy węgierskiego rynku nieruchomości i kupujących z Europy Zachodniej.' },
  ro: { title: 'FODEL Imobiliare: noutăți și articole', description: 'Analize ale pieței imobiliare din Ungaria și ale cumpărătorilor din Europa de Vest.' },
  sk: { title: 'FODEL Nehnuteľnosti: novinky a články', description: 'Analýzy maďarského realitného trhu a kupujúcich zo západnej Európy.' },
};

export async function blogFeed(locale: Locale, context: APIContext) {
  const posts = await localizedPosts(locale);
  return rss({
    ...FEED[locale],
    site: context.site ?? SITE_URL,
    customData: `<language>${locale}</language>`,
    items: posts.map(({ post, from }) => {
      const note = sourceNote(locale, from, 'article');
      return {
        title: post.title,
        description: note ? `${note}. ${post.excerpt}` : post.excerpt,
        pubDate: post.published_at ?? post.updated_at,
        link: postPathIn(locale, post.slug),
      };
    }),
  });
}
