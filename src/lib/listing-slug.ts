/**
 * URL words for listings in every language, pure (relative imports only, so the rules tests load it directly).
 *
 * A listing's address is `<category word>-<for sale>-<ref>`. The category word comes from the language's own
 * taxonomy, so in Russian, Ukrainian, Serbian-Cyrillic, Hebrew, Arabic or Chinese it can be written in a script
 * that makes an unreadable address. Latin words (with or without accents) are left exactly as they are, so no
 * existing address changes. Anything else is made ASCII: Cyrillic is transliterated, and a word that is empty
 * or shorter than three letters afterwards (Hebrew, Arabic, Chinese) is replaced by the English one, then by
 * the listing's own reference (fd-1234).
 */

const RUSSIAN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};
const UKRAINIAN: Record<string, string> = { ...RUSSIAN, г: 'h', ґ: 'g', е: 'e', є: 'ye', и: 'y', і: 'i', ї: 'yi', й: 'y', ы: 'y', э: 'e', ё: 'yo' };
const SERBIAN: Record<string, string> = { ...RUSSIAN, ђ: 'dj', е: 'e', ж: 'z', ј: 'j', љ: 'lj', њ: 'nj', ћ: 'c', х: 'h', ц: 'c', ч: 'c', џ: 'dz', ш: 's', и: 'i' };

/** Cyrillic to ASCII, by the language's own habits (Ukrainian г is h, Serbian ш is s). Everything else is kept. */
export function transliterate(text: string, locale = 'ru'): string {
  const table = locale === 'uk' ? UKRAINIAN : locale === 'sr' ? SERBIAN : RUSSIAN;
  let out = '';
  for (const char of text.toLowerCase()) out += char in table ? table[char] : char;
  return out;
}

const LATIN_ONLY = /^[\p{Script=Latin}\p{N}\p{M}\s\-_.]*$/u;

/** URL-safe lowercase ASCII word from any text; '' when nothing Latin is left. */
export function asciiSlug(value: string, locale = 'ru'): string {
  return transliterate(value, locale)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * The category word for one language's listing address. A Latin word is returned untouched. Otherwise: the
 * transliterated word if it is at least three characters, else the English word, else the category key
 * (always Latin, e.g. "farm").
 */
export function categoryWord(word: string | undefined, locale: string, english: string | undefined, key: string): string {
  const given = (word ?? '').trim();
  if (given && LATIN_ONLY.test(given)) return given;
  const own = asciiSlug(given, locale);
  if (own.length >= 3) return own;
  const en = asciiSlug(english ?? '', 'en');
  return en.length >= 3 ? en : asciiSlug(key, 'en') || key;
}

/** The whole map of a listing's category words, every language made safe for a URL. */
export function safeCategorySlugs<T extends Record<string, string | undefined>>(slugs: T, key: string): T {
  const result: Record<string, string | undefined> = { ...slugs };
  for (const locale of Object.keys(slugs)) result[locale] = categoryWord(slugs[locale], locale, slugs.en, key);
  return result as T;
}

/**
 * A slug for a free-form title (not used for listing addresses today): the title's own slug, else the English
 * title's, else the listing reference.
 */
export function titleSlug(title: string, locale: string, englishTitle: string | undefined, ref: string): string {
  for (const [candidate, from] of [[title, locale], [englishTitle ?? '', 'en']] as const) {
    const slug = asciiSlug(candidate, from);
    if (slug.length >= 3) return slug;
  }
  return `fd-${asciiSlug(ref, 'en') || ref}`;
}
