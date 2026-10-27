import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, např. ${example}` : '');
// Czech: 1 znak, 2–4 znaky, 5+ znaků.
const form = (n: number) => new Intl.PluralRules('cs-CZ').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'znak' : form(n) === 'few' ? 'znaky' : 'znaků'}`;

export const copy: ValidationCopy = {
  numberTag: 'cs-CZ',
  adjective: {
    HU: 'maďarské', NL: 'nizozemské', BE: 'belgické', DE: 'německé',
    AT: 'rakouské', GB: 'britské', FR: 'francouzské', CH: 'švýcarské',
    SK: 'slovenské', RO: 'rumunské', HR: 'chorvatské', SI: 'slovinské',
    LU: 'lucemburské', DK: 'dánské', ES: 'španělské', IT: 'italské',
    PL: 'polské', CZ: 'české', PT: 'portugalské', GR: 'řecké',
    SE: 'švédské', NO: 'norské', FI: 'finské', EE: 'estonské',
    LV: 'lotyšské', LT: 'litevské',
  },
  required: 'Vyplňte prosím toto pole.',
  email: 'Zadejte platnou e-mailovou adresu, např. jmeno@priklad.cz.',
  phone: (adjective, example) => `Zadejte platné ${adjective ? `${adjective} ` : ''}telefonní číslo${eg(example)}.`,
  postcode: (example) => `Zadejte platné PSČ${eg(example)}.`,
  number: 'Zadejte pouze číslo, např. 120.',
  min: (limit) => `Alespoň ${limit}.`,
  max: (limit) => `Nejvýše ${limit}.`,
  url: 'Zadejte úplnou webovou adresu, např. https://www.youtube.com/…',
  tooLong: (limit) => `Nejvýše ${chars(limit)}.`,
  minLength: (limit) => `Alespoň ${chars(limit)}.`,
  consent: 'Chcete-li pokračovat, přijměte zásady ochrany osobních údajů.',
  selfReferral: 'Nemůžete doporučit sami sebe: zadejte jinou e-mailovou adresu.',
  summary: (count) =>
    count === 1
      ? 'Jedno pole je třeba zkontrolovat:'
      : `${count} ${form(count) === 'few' ? 'pole' : 'polí'} je třeba zkontrolovat:`,
};
