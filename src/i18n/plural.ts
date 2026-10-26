/**
 * A number with its noun, in the grammar of the page language.
 *
 * French, English, German and Spanish need one form for 1 and one for the
 * rest. Polish, Slovak, Romanian, Czech, Slovenian, Latvian and Lithuanian do
 * not: the noun changes with the number
 * (pl "2 języki", "5 języków"; sk "2 jazyky", "5 jazykov"; ro "2 limbi",
 * "20 de limbi"), so a plain `${n} ${word}` would be wrong. Intl.PluralRules
 * picks the form:
 *   one   after 1
 *   few   pl, sk, cs: after 2–4 (pl also 22–24, 32–34 …); ro: after 0 and 2–19;
 *         sl: after 3–4; lt: after 2–9 (not 12–19); lv: after 2–9, 22–29 …
 *   two   sl only: after 2 (and 102 …)
 *   many  everything else; for Romanian include the "de" ("de limbi"); for
 *         Latvian it is the genitive plural after 0, 10–20, 30 … ("10 īpašumu")
 */
import type { Locale } from '~/i18n/ui';
import { intlTag } from '~/lib/format';

export { pluralForm, type PluralForm } from './plural-form.ts';
import { pluralForm } from './plural-form.ts';

export function nOf(locale: Locale, n: number, one: string, few: string, many: string = few, two: string = few): string {
  const form = pluralForm(intlTag(locale), n);
  return `${n} ${form === 'one' ? one : form === 'two' ? two : form === 'few' ? few : many}`;
}
