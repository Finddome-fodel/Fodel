import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, piemēram, ${example}` : '');
// Latvian: 1 and 21 rakstzīme, 2–9 rakstzīmes, 0 and 10–20 rakstzīmju.
const form = (n: number) => new Intl.PluralRules('lv-LV').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'rakstzīme' : form(n) === 'zero' ? 'rakstzīmju' : 'rakstzīmes'}`;

export const copy: ValidationCopy = {
  numberTag: 'lv-LV',
  adjective: {
    HU: 'Ungārijas', NL: 'Nīderlandes', BE: 'Beļģijas', DE: 'Vācijas',
    AT: 'Austrijas', GB: 'Lielbritānijas', FR: 'Francijas', CH: 'Šveices',
    SK: 'Slovākijas', RO: 'Rumānijas', HR: 'Horvātijas', SI: 'Slovēnijas',
    LU: 'Luksemburgas', DK: 'Dānijas', ES: 'Spānijas', IT: 'Itālijas',
    PL: 'Polijas', CZ: 'Čehijas', PT: 'Portugāles', GR: 'Grieķijas',
    SE: 'Zviedrijas', NO: 'Norvēģijas', FI: 'Somijas', EE: 'Igaunijas',
    LV: 'Latvijas', LT: 'Lietuvas',
  },
  required: 'Lūdzu, aizpildiet šo lauku.',
  email: 'Lūdzu, ievadiet derīgu e-pasta adresi, piemēram, vards@piemers.lv.',
  phone: (adjective, example) => `Lūdzu, ievadiet derīgu ${adjective ? `${adjective} ` : ''}tālruņa numuru${eg(example)}.`,
  postcode: (example) => `Lūdzu, ievadiet derīgu pasta indeksu${eg(example)}.`,
  number: 'Lūdzu, ievadiet tikai skaitli, piemēram, 120.',
  min: (limit) => `Vismaz ${limit}.`,
  max: (limit) => `Ne vairāk kā ${limit}.`,
  url: 'Lūdzu, ievadiet pilnu tīmekļa adresi, piemēram, https://www.youtube.com/…',
  tooLong: (limit) => `Ne vairāk kā ${chars(limit)}.`,
  minLength: (limit) => `Vismaz ${chars(limit)}.`,
  consent: 'Lai turpinātu, lūdzu, piekrītiet privātuma politikai.',
  summary: (count) =>
    count === 1
      ? 'Jāpārbauda viens lauks:'
      : `Jāpārbauda ${count} ${form(count) === 'one' ? 'lauks' : form(count) === 'zero' ? 'lauku' : 'lauki'}:`,
};
