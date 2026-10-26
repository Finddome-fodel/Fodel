/**
 * The note shown when seller- or editor-written text appears in a language
 * other than the reader's. Every page language except Hungarian and Dutch
 * shows the Dutch
 * text, or the Hungarian when there is no Dutch (see resolveText in
 * src/lib/properties.ts and localizedPosts in src/lib/blog.ts). FODEL never
 * translates such text on the fly; it says which language it is in.
 *
 * Hungarian and Dutch readers get no note: a Dutch page showing Hungarian text
 * is the behaviour the site has always had.
 */
import type { Locale } from '~/i18n/ui';

type Named = 'nl' | 'hu';
type Noted = 'en' | 'de' | 'fr' | 'es' | 'pl' | 'ro' | 'sk' | 'it' | 'pt' | 'el' | 'cs' | 'sl' | 'sv' | 'da' | 'no' | 'fi' | 'et' | 'lv' | 'lt';

const LANGUAGE_IN: Record<Noted, Record<Named, string>> = {
  en: { nl: 'Dutch', hu: 'Hungarian' },
  de: { nl: 'Niederländisch', hu: 'Ungarisch' },
  fr: { nl: 'néerlandais', hu: 'hongrois' },
  es: { nl: 'neerlandés', hu: 'húngaro' },
  pl: { nl: 'niderlandzkim', hu: 'węgierskim' },
  ro: { nl: 'neerlandeză', hu: 'maghiară' },
  sk: { nl: 'holandčine', hu: 'maďarčine' },
  it: { nl: 'olandese', hu: 'ungherese' },
  pt: { nl: 'neerlandês', hu: 'húngaro' },
  el: { nl: 'ολλανδικά', hu: 'ουγγρικά' },
  cs: { nl: 'nizozemštině', hu: 'maďarštině' },
  sl: { nl: 'nizozemščini', hu: 'madžarščini' },
  sv: { nl: 'nederländska', hu: 'ungerska' },
  da: { nl: 'hollandsk', hu: 'ungarsk' },
  no: { nl: 'nederlandsk', hu: 'ungarsk' },
  fi: { nl: 'hollanniksi', hu: 'unkariksi' },
  et: { nl: 'hollandi keeles', hu: 'ungari keeles' },
  lv: { nl: 'holandiešu valodā', hu: 'ungāru valodā' },
  lt: { nl: 'olandų kalba', hu: 'vengrų kalba' },
};

type Kind = 'description' | 'article';

export function sourceNote(locale: Locale, from: Locale, kind: Kind): string | null {
  if (locale === from || locale === 'hu' || locale === 'nl') return null;
  if (from !== 'nl' && from !== 'hu') return null;
  const language = LANGUAGE_IN[locale][from];
  switch (locale) {
    case 'en':
      return kind === 'description' ? `Description in ${language}` : `Article in ${language}`;
    case 'de':
      return kind === 'description' ? `Beschreibung auf ${language}` : `Artikel auf ${language}`;
    case 'fr':
      return kind === 'description' ? `Description en ${language}` : `Article en ${language}`;
    case 'es':
      return kind === 'description' ? `Descripción en ${language}` : `Artículo en ${language}`;
    case 'pl':
      return kind === 'description' ? `Opis w języku ${language}` : `Artykuł w języku ${language}`;
    case 'ro':
      return kind === 'description' ? `Descriere în limba ${language}` : `Articol în limba ${language}`;
    case 'sk':
      return kind === 'description' ? `Popis v ${language}` : `Článok v ${language}`;
    case 'it':
      return kind === 'description' ? `Descrizione in ${language}` : `Articolo in ${language}`;
    case 'pt':
      return kind === 'description' ? `Descrição em ${language}` : `Artigo em ${language}`;
    case 'el':
      return kind === 'description' ? `Περιγραφή στα ${language}` : `Άρθρο στα ${language}`;
    case 'cs':
      return kind === 'description' ? `Popis v ${language}` : `Článek v ${language}`;
    case 'sl':
      return kind === 'description' ? `Opis v ${language}` : `Članek v ${language}`;
    case 'sv':
      return kind === 'description' ? `Beskrivning på ${language}` : `Artikel på ${language}`;
    case 'da':
      return kind === 'description' ? `Beskrivelse på ${language}` : `Artikel på ${language}`;
    case 'no':
      return kind === 'description' ? `Beskrivelse på ${language}` : `Artikkel på ${language}`;
    case 'fi':
      return kind === 'description' ? `Kuvaus ${language}` : `Artikkeli ${language}`;
    case 'et':
      return kind === 'description' ? `Kirjeldus ${language}` : `Artikkel ${language}`;
    case 'lv':
      return kind === 'description' ? `Apraksts ${language}` : `Raksts ${language}`;
    case 'lt':
      return kind === 'description' ? `Aprašymas ${language}` : `Straipsnis ${language}`;
  }
}
