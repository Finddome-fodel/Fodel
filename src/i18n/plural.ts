/**
 * A number with its noun, in the grammar of the page language.
 *
 * French, English, German and Spanish need one form for 1 and one for the
 * rest. Polish, Slovak and Romanian do not: the noun changes with the number
 * (pl "2 języki", "5 języków"; sk "2 jazyky", "5 jazykov"; ro "2 limbi",
 * "20 de limbi"), so a plain `${n} ${word}` would be wrong. Intl.PluralRules
 * picks the form:
 *   one   after 1
 *   few   pl, sk: after 2–4 (pl also 22–24, 32–34 …); ro: after 0 and 2–19
 *   many  everything else; for Romanian include the "de" ("de limbi")
 */
import type { Locale } from '~/i18n/ui';
import { intlTag } from '~/lib/format';

export function nOf(locale: Locale, n: number, one: string, few: string, many: string = few): string {
  const form = new Intl.PluralRules(intlTag(locale)).select(n);
  return `${n} ${form === 'one' ? one : form === 'few' ? few : many}`;
}
