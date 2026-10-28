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
  hu: { title: 'FINDDOME Ingatlan — Hírek és cikkek', description: 'Elemzések a magyar ingatlanpiacról és a nyugat-európai vevőkről.' },
  nl: { title: 'FINDDOME Vastgoed — Nieuws en achtergrond', description: 'Analyses over de Hongaarse vastgoedmarkt en West-Europese kopers.' },
  en: { title: 'FINDDOME Real Estates: news and articles', description: 'Analysis of the Hungarian property market and Western European buyers.' },
  de: { title: 'FINDDOME Immobilien: Neuigkeiten und Artikel', description: 'Analysen zum ungarischen Immobilienmarkt und zu Käufern aus Westeuropa.' },
  fr: { title: 'FINDDOME Immobilier : actualités et articles', description: 'Analyses du marché immobilier hongrois et des acheteurs d’Europe de l’Ouest.' },
  es: { title: 'FINDDOME Inmobiliaria: noticias y artículos', description: 'Análisis del mercado inmobiliario húngaro y de los compradores de Europa Occidental.' },
  pl: { title: 'FINDDOME Nieruchomości: aktualności i artykuły', description: 'Analizy węgierskiego rynku nieruchomości i kupujących z Europy Zachodniej.' },
  ro: { title: 'FINDDOME Imobiliare: noutăți și articole', description: 'Analize ale pieței imobiliare din Ungaria și ale cumpărătorilor din Europa de Vest.' },
  sk: { title: 'FINDDOME Nehnuteľnosti: novinky a články', description: 'Analýzy maďarského realitného trhu a kupujúcich zo západnej Európy.' },
  it: { title: 'FINDDOME Immobiliare: notizie e articoli', description: 'Analisi del mercato immobiliare ungherese e degli acquirenti dell’Europa occidentale.' },
  pt: { title: 'FINDDOME Imobiliária: notícias e artigos', description: 'Análise do mercado imobiliário húngaro e dos compradores da Europa Ocidental.' },
  el: { title: 'FINDDOME Ακίνητα: νέα και άρθρα', description: 'Ανάλυση της ουγγρικής αγοράς ακινήτων και των αγοραστών από τη Δυτική Ευρώπη.' },
  cs: { title: 'FINDDOME Nemovitosti: novinky a články', description: 'Analýzy maďarského realitního trhu a kupujících ze západní Evropy.' },
  sl: { title: 'FINDDOME Nepremičnine: novice in članki', description: 'Analize madžarskega nepremičninskega trga in kupcev iz zahodne Evrope.' },
  sv: { title: 'FINDDOME Fastigheter: nyheter och artiklar', description: 'Analyser av den ungerska fastighetsmarknaden och köpare från Västeuropa.' },
  da: { title: 'FINDDOME Ejendomme: nyheder og artikler', description: 'Analyser af det ungarske ejendomsmarked og vesteuropæiske købere.' },
  no: { title: 'FINDDOME Eiendom: nyheter og artikler', description: 'Analyser av det ungarske eiendomsmarkedet og vesteuropeiske kjøpere.' },
  fi: { title: 'FINDDOME Kiinteistöt: uutiset ja artikkelit', description: 'Analyysejä Unkarin kiinteistömarkkinoista ja länsieurooppalaisista ostajista.' },
  et: { title: 'FINDDOME Kinnisvara: uudised ja artiklid', description: 'Analüüsid Ungari kinnisvaraturu ja Lääne-Euroopa ostjate kohta.' },
  lv: { title: 'FINDDOME Nekustamais īpašums: jaunumi un raksti', description: 'Ungārijas nekustamo īpašumu tirgus un Rietumeiropas pircēju analīze.' },
  lt: { title: 'FINDDOME Nekilnojamasis turtas: naujienos ir straipsniai', description: 'Vengrijos nekilnojamojo turto rinkos ir Vakarų Europos pirkėjų analizė.' },
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
