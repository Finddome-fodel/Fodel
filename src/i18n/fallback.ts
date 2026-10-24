/**
 * The note shown when seller- or editor-written text appears in a language
 * other than the reader's. English, German, French, Spanish, Polish, Romanian
 * and Slovak pages show the Dutch
 * text, or the Hungarian when there is no Dutch (see resolveText in
 * src/lib/properties.ts and localizedPosts in src/lib/blog.ts). FODEL never
 * translates such text on the fly; it says which language it is in.
 *
 * Hungarian and Dutch readers get no note: a Dutch page showing Hungarian text
 * is the behaviour the site has always had.
 */
import type { Locale } from '~/i18n/ui';

type Named = 'nl' | 'hu';
type Noted = 'en' | 'de' | 'fr' | 'es' | 'pl' | 'ro' | 'sk';

const LANGUAGE_IN: Record<Noted, Record<Named, string>> = {
  en: { nl: 'Dutch', hu: 'Hungarian' },
  de: { nl: 'Niederländisch', hu: 'Ungarisch' },
  fr: { nl: 'néerlandais', hu: 'hongrois' },
  es: { nl: 'neerlandés', hu: 'húngaro' },
  pl: { nl: 'niderlandzkim', hu: 'węgierskim' },
  ro: { nl: 'neerlandeză', hu: 'maghiară' },
  sk: { nl: 'holandčine', hu: 'maďarčine' },
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
  }
}
