/**
 * The note shown when seller- or editor-written text appears in a language
 * other than the reader's. Every page language except Hungarian and Dutch
 * shows the English text
 * first where there is one, then the Dutch, then the Hungarian (see resolveText in
 * src/lib/properties.ts and localizedPosts in src/lib/blog.ts). FODEL never
 * translates such text on the fly; it says which language it is in.
 *
 * Hungarian and Dutch readers get no note: a Dutch page showing Hungarian text
 * is the behaviour the site has always had.
 */
import type { Locale } from '~/i18n/ui';

type Named = 'nl' | 'hu';
type Noted = 'en' | 'de' | 'fr' | 'es' | 'pl' | 'ro' | 'sk' | 'it' | 'pt' | 'el' | 'cs' | 'sl' | 'sv' | 'da' | 'no' | 'fi' | 'et' | 'lv' | 'lt';
/**
 * The seven languages added in November 2026. Their pages fall back to the
 * English text first (resolveText), so they also name English.
 */
type Later = 'sr' | 'uk' | 'tr' | 'he' | 'ar' | 'ru' | 'zh';
const LATER: readonly Locale[] = ['sr', 'uk', 'tr', 'he', 'ar', 'ru', 'zh'];

const LATER_LANGUAGE_IN: Record<Later, Record<Named | 'en', string>> = {
  sr: { nl: 'holandskom', hu: 'mađarskom', en: 'engleskom' },
  uk: { nl: 'нідерландською', hu: 'угорською', en: 'англійською' },
  tr: { nl: 'Felemenkçe', hu: 'Macarca', en: 'İngilizce' },
  he: { nl: 'הולנדית', hu: 'הונגרית', en: 'אנגלית' },
  ar: { nl: 'الهولندية', hu: 'المجرية', en: 'الإنجليزية' },
  ru: { nl: 'нидерландском', hu: 'венгерском', en: 'английском' },
  zh: { nl: '荷兰语', hu: '匈牙利语', en: '英语' },
};

function laterNote(locale: Later, language: string, kind: Kind): string {
  const description = kind === 'description';
  switch (locale) {
    case 'sr':
      return description ? `Opis na ${language} jeziku` : `Članak na ${language} jeziku`;
    case 'uk':
      return description ? `Опис ${language} мовою` : `Стаття ${language} мовою`;
    case 'tr':
      return description ? `${language} açıklama` : `${language} makale`;
    case 'he':
      return description ? `תיאור ב${language}` : `מאמר ב${language}`;
    case 'ar':
      return description ? `الوصف باللغة ${language}` : `المقال باللغة ${language}`;
    case 'ru':
      return description ? `Описание на ${language} языке` : `Статья на ${language} языке`;
    case 'zh':
      return description ? `描述语言：${language}` : `文章语言：${language}`;
  }
}

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
  if (LATER.includes(locale)) {
    if (from !== 'nl' && from !== 'hu' && from !== 'en') return null;
    return laterNote(locale as Later, LATER_LANGUAGE_IN[locale as Later][from], kind);
  }
  if (from !== 'nl' && from !== 'hu') return null;
  const language = LANGUAGE_IN[locale as Noted][from];
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
    default:
      return null;
  }
}

/** "Automatically translated", for a listing text the AI wrote. Shown only when showMachineTranslationNote() is on. Never claims a person checked it. */
const MACHINE_NOTE: Record<Locale, string> = {
  hu: 'Automatikus fordítás', nl: 'Automatisch vertaald', en: 'Automatically translated', de: 'Automatisch übersetzt', fr: 'Traduction automatique',
  es: 'Traducción automática', pl: 'Tłumaczenie automatyczne', ro: 'Traducere automată', sk: 'Automatický preklad', it: 'Traduzione automatica',
  pt: 'Tradução automática', el: 'Αυτόματη μετάφραση', cs: 'Automatický překlad', sl: 'Samodejni prevod', sv: 'Automatiskt översatt',
  da: 'Automatisk oversat', no: 'Automatisk oversatt', fi: 'Automaattinen käännös', et: 'Automaattne tõlge', lv: 'Automātisks tulkojums', lt: 'Automatinis vertimas',
  sr: 'Automatski prevod',
  uk: 'Автоматичний переклад',
  tr: 'Otomatik çeviri',
  he: 'תרגום אוטומטי',
  ar: 'ترجمة آلية',
  ru: 'Автоматический перевод',
  zh: '自动翻译',
};
export const machineNote = (locale: Locale): string => MACHINE_NOTE[locale];
