/**
 * The note shown when seller- or editor-written text appears in a language
 * other than the reader's. Listing text falls back to English first (every listing has it),
 * then German, then Dutch, then Hungarian (see textOrder in src/lib/listing-languages.ts, resolveText in
 * src/lib/properties.ts and localizedPosts in src/lib/blog.ts). FODEL never
 * translates such text on the fly; it says which language it is in.
 *
 * Hungarian and Dutch readers get no note: a Dutch page showing Hungarian text
 * is the behaviour the site has always had.
 */
import type { Locale } from '~/i18n/ui';

/** The seven languages added after the first twenty-one. Once the site's own Locale has them this is the same set. */
export type AddedLocale = 'sr' | 'uk' | 'tr' | 'he' | 'ar' | 'ru' | 'zh';
type Named = 'nl' | 'hu' | 'en' | 'de';
type Noted = Exclude<Locale, 'hu' | 'nl'> | AddedLocale;

/** The name of each fallback language, in the grammatical form the note's sentence needs. */
const LANGUAGE_IN: Record<Noted, Record<Named, string>> = {
  en: { nl: 'Dutch', hu: 'Hungarian', en: 'English', de: 'German' },
  de: { nl: 'Niederländisch', hu: 'Ungarisch', en: 'Englisch', de: 'Deutsch' },
  fr: { nl: 'néerlandais', hu: 'hongrois', en: 'anglais', de: 'allemand' },
  es: { nl: 'neerlandés', hu: 'húngaro', en: 'inglés', de: 'alemán' },
  pl: { nl: 'niderlandzkim', hu: 'węgierskim', en: 'angielskim', de: 'niemieckim' },
  ro: { nl: 'neerlandeză', hu: 'maghiară', en: 'engleză', de: 'germană' },
  sk: { nl: 'holandčine', hu: 'maďarčine', en: 'angličtine', de: 'nemčine' },
  it: { nl: 'olandese', hu: 'ungherese', en: 'inglese', de: 'tedesco' },
  pt: { nl: 'neerlandês', hu: 'húngaro', en: 'inglês', de: 'alemão' },
  el: { nl: 'ολλανδικά', hu: 'ουγγρικά', en: 'αγγλικά', de: 'γερμανικά' },
  cs: { nl: 'nizozemštině', hu: 'maďarštině', en: 'angličtině', de: 'němčině' },
  sl: { nl: 'nizozemščini', hu: 'madžarščini', en: 'angleščini', de: 'nemščini' },
  sv: { nl: 'nederländska', hu: 'ungerska', en: 'engelska', de: 'tyska' },
  da: { nl: 'hollandsk', hu: 'ungarsk', en: 'engelsk', de: 'tysk' },
  no: { nl: 'nederlandsk', hu: 'ungarsk', en: 'engelsk', de: 'tysk' },
  fi: { nl: 'hollanniksi', hu: 'unkariksi', en: 'englanniksi', de: 'saksaksi' },
  et: { nl: 'hollandi keeles', hu: 'ungari keeles', en: 'inglise keeles', de: 'saksa keeles' },
  lv: { nl: 'holandiešu valodā', hu: 'ungāru valodā', en: 'angļu valodā', de: 'vācu valodā' },
  lt: { nl: 'olandų kalba', hu: 'vengrų kalba', en: 'anglų kalba', de: 'vokiečių kalba' },
  sr: { nl: 'holandskom', hu: 'mađarskom', en: 'engleskom', de: 'nemačkom' },
  uk: { nl: 'нідерландською мовою', hu: 'угорською мовою', en: 'англійською мовою', de: 'німецькою мовою' },
  tr: { nl: 'Felemenkçe', hu: 'Macarca', en: 'İngilizce', de: 'Almanca' },
  he: { nl: 'בהולנדית', hu: 'בהונגרית', en: 'באנגלית', de: 'בגרמנית' },
  ar: { nl: 'بالهولندية', hu: 'بالمجرية', en: 'بالإنجليزية', de: 'بالألمانية' },
  ru: { nl: 'нидерландском языке', hu: 'венгерском языке', en: 'английском языке', de: 'немецком языке' },
  zh: { nl: '荷兰文', hu: '匈牙利文', en: '英文', de: '德文' },
};

type Kind = 'description' | 'article';

/** The sentence for each reader language: the text's kind and the language it is in. */
const NOTE: Record<Noted, (kind: Kind, language: string) => string> = {
  en: (kind, l) => (kind === 'description' ? `Description in ${l}` : `Article in ${l}`),
  de: (kind, l) => (kind === 'description' ? `Beschreibung auf ${l}` : `Artikel auf ${l}`),
  fr: (kind, l) => (kind === 'description' ? `Description en ${l}` : `Article en ${l}`),
  es: (kind, l) => (kind === 'description' ? `Descripción en ${l}` : `Artículo en ${l}`),
  pl: (kind, l) => (kind === 'description' ? `Opis w języku ${l}` : `Artykuł w języku ${l}`),
  ro: (kind, l) => (kind === 'description' ? `Descriere în limba ${l}` : `Articol în limba ${l}`),
  sk: (kind, l) => (kind === 'description' ? `Popis v ${l}` : `Článok v ${l}`),
  it: (kind, l) => (kind === 'description' ? `Descrizione in ${l}` : `Articolo in ${l}`),
  pt: (kind, l) => (kind === 'description' ? `Descrição em ${l}` : `Artigo em ${l}`),
  el: (kind, l) => (kind === 'description' ? `Περιγραφή στα ${l}` : `Άρθρο στα ${l}`),
  cs: (kind, l) => (kind === 'description' ? `Popis v ${l}` : `Článek v ${l}`),
  sl: (kind, l) => (kind === 'description' ? `Opis v ${l}` : `Članek v ${l}`),
  sv: (kind, l) => (kind === 'description' ? `Beskrivning på ${l}` : `Artikel på ${l}`),
  da: (kind, l) => (kind === 'description' ? `Beskrivelse på ${l}` : `Artikel på ${l}`),
  no: (kind, l) => (kind === 'description' ? `Beskrivelse på ${l}` : `Artikkel på ${l}`),
  fi: (kind, l) => (kind === 'description' ? `Kuvaus ${l}` : `Artikkeli ${l}`),
  et: (kind, l) => (kind === 'description' ? `Kirjeldus ${l}` : `Artikkel ${l}`),
  lv: (kind, l) => (kind === 'description' ? `Apraksts ${l}` : `Raksts ${l}`),
  lt: (kind, l) => (kind === 'description' ? `Aprašymas ${l}` : `Straipsnis ${l}`),
  sr: (kind, l) => (kind === 'description' ? `Opis na ${l}` : `Članak na ${l}`),
  uk: (kind, l) => (kind === 'description' ? `Опис ${l}` : `Стаття ${l}`),
  tr: (kind, l) => (kind === 'description' ? `${l} açıklama` : `${l} makale`),
  he: (kind, l) => (kind === 'description' ? `תיאור ${l}` : `מאמר ${l}`),
  ar: (kind, l) => (kind === 'description' ? `الوصف ${l}` : `المقال ${l}`),
  ru: (kind, l) => (kind === 'description' ? `Описание на ${l}` : `Статья на ${l}`),
  zh: (kind, l) => (kind === 'description' ? `${l}描述` : `${l}文章`),
};

/**
 * What to say when a page shows text in another language than its own, or null when nothing needs saying: the
 * text is in the page's language, or the page is Hungarian or Dutch (which always showed the original).
 */
export function sourceNote(locale: Locale | AddedLocale, from: Locale | AddedLocale, kind: Kind): string | null {
  if (locale === from || locale === 'hu' || locale === 'nl') return null;
  if (from !== 'nl' && from !== 'hu' && from !== 'en' && from !== 'de') return null;
  return NOTE[locale as Noted](kind, LANGUAGE_IN[locale as Noted][from]);
}

/** "Automatically translated", for a listing text the AI wrote. Shown only when showMachineTranslationNote() is on. Never claims a person checked it. */
const MACHINE_NOTE: Record<Locale | AddedLocale, string> = {
  hu: 'Automatikus fordítás', nl: 'Automatisch vertaald', en: 'Automatically translated', de: 'Automatisch übersetzt', fr: 'Traduction automatique',
  es: 'Traducción automática', pl: 'Tłumaczenie automatyczne', ro: 'Traducere automată', sk: 'Automatický preklad', it: 'Traduzione automatica',
  pt: 'Tradução automática', el: 'Αυτόματη μετάφραση', cs: 'Automatický překlad', sl: 'Samodejni prevod', sv: 'Automatiskt översatt',
  da: 'Automatisk oversat', no: 'Automatisk oversatt', fi: 'Automaattinen käännös', et: 'Automaattne tõlge', lv: 'Automātisks tulkojums', lt: 'Automatinis vertimas',
  sr: 'Automatski prevod', uk: 'Автоматичний переклад', tr: 'Otomatik çeviri', he: 'תרגום אוטומטי', ar: 'ترجمة آلية', ru: 'Автоматический перевод', zh: '自动翻译',
};
export const machineNote = (locale: Locale | AddedLocale): string => MACHINE_NOTE[locale];

/**
 * "This listing is not available in other languages", for the language switcher of a listing page. The first
 * twenty-one languages have it inside the switcher; these seven are looked up here until the switcher's own
 * dictionary has them.
 */
export const LISTING_UNAVAILABLE_NOTE: Record<AddedLocale, string> = {
  sr: 'Oglas nije dostupan na drugim jezicima.',
  uk: 'Це оголошення недоступне іншими мовами.',
  tr: 'Bu ilan başka dillerde mevcut değil.',
  he: 'המודעה אינה זמינה בשפות נוספות.',
  ar: 'هذا الإعلان غير متاح بلغات أخرى.',
  ru: 'Это объявление недоступно на других языках.',
  zh: '此房源暂无其他语言版本。',
};
