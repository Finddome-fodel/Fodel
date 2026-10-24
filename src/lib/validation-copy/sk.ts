import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, napr. ${example}` : '');
// Slovak: 1 znak, 2–4 znaky, 5+ znakov.
const form = (n: number) => new Intl.PluralRules('sk-SK').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'znak' : form(n) === 'few' ? 'znaky' : 'znakov'}`;

export const copy: ValidationCopy = {
  numberTag: 'sk-SK',
  // Neuter, before "telefónne číslo" ("platné maďarské telefónne číslo").
  adjective: {
    HU: 'maďarské', NL: 'holandské', BE: 'belgické', DE: 'nemecké', AT: 'rakúske', GB: 'britské', FR: 'francúzske',
    CH: 'švajčiarske', SK: 'slovenské', RO: 'rumunské', HR: 'chorvátske', SI: 'slovinské', LU: 'luxemburské', DK: 'dánske',
    ES: 'španielske', IT: 'talianske', PL: 'poľské', CZ: 'české',
  },
  required: 'Vyplňte, prosím, toto pole.',
  email: 'Zadajte platnú e-mailovú adresu, napr. meno@priklad.sk.',
  phone: (adjective, example) => `Zadajte platné ${adjective ? `${adjective} ` : ''}telefónne číslo${eg(example)}.`,
  postcode: (example) => `Zadajte platné PSČ${eg(example)}.`,
  number: 'Zadajte iba číslo, napr. 120.',
  min: (limit) => `Aspoň ${limit}.`,
  max: (limit) => `Najviac ${limit}.`,
  url: 'Zadajte úplnú webovú adresu, napr. https://www.youtube.com/…',
  tooLong: (limit) => `Najviac ${chars(limit)}.`,
  minLength: (limit) => `Aspoň ${chars(limit)}.`,
  consent: 'Ak chcete pokračovať, prijmite zásady ochrany osobných údajov.',
  summary: (count) =>
    count === 1
      ? 'Jedno pole treba skontrolovať:'
      : `${count} ${form(count) === 'few' ? 'polia' : 'polí'} treba skontrolovať:`,
};
