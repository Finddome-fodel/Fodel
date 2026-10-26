/** The plural form a number takes in a language (see plural.ts). Imports nothing, so ui.ts can use it. */
export type PluralForm = 'one' | 'two' | 'few' | 'many';

/** The form a number takes, by Intl tag. Latvian's "zero" is our `many`, its "other" our `few`. */
export function pluralForm(tag: string, n: number): PluralForm {
  const category = new Intl.PluralRules(tag).select(n);
  if (category === 'zero') return 'many';
  if (category === 'other') return tag.startsWith('lv') ? 'few' : 'many';
  return category;
}
