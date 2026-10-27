import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, np. ${example}` : '');
// Polish has three count forms: 1 znak, 2–4 znaki, 5+ znaków (but 22 znaki).
const form = (n: number) => new Intl.PluralRules('pl-PL').select(n);
const chars = (n: number) => `${n} ${{ one: 'znak', few: 'znaki' }[form(n) as 'one' | 'few'] ?? 'znaków'}`;

export const copy: ValidationCopy = {
  numberTag: 'pl-PL',
  // Masculine, before "numer telefonu" ("prawidłowy węgierski numer telefonu").
  adjective: {
    HU: 'węgierski', NL: 'niderlandzki', BE: 'belgijski', DE: 'niemiecki', AT: 'austriacki', GB: 'brytyjski', FR: 'francuski',
    CH: 'szwajcarski', SK: 'słowacki', RO: 'rumuński', HR: 'chorwacki', SI: 'słoweński', LU: 'luksemburski', DK: 'duński',
    ES: 'hiszpański', IT: 'włoski', PL: 'polski', CZ: 'czeski',
  },
  required: 'Prosimy wypełnić to pole.',
  email: 'Prosimy podać prawidłowy adres e-mail, np. nazwa@przyklad.pl.',
  phone: (adjective, example) => `Prosimy podać prawidłowy ${adjective ? `${adjective} ` : ''}numer telefonu${eg(example)}.`,
  postcode: (example) => `Prosimy podać prawidłowy kod pocztowy${eg(example)}.`,
  number: 'Prosimy wpisać tylko liczbę, np. 120.',
  min: (limit) => `Co najmniej ${limit}.`,
  max: (limit) => `Maksymalnie ${limit}.`,
  url: 'Prosimy podać pełny adres strony, np. https://www.youtube.com/…',
  tooLong: (limit) => `Maksymalnie ${chars(limit)}.`,
  minLength: (limit) => `Co najmniej ${chars(limit)}.`,
  consent: 'Aby kontynuować, prosimy zaakceptować politykę prywatności.',
  selfReferral: 'Nie można polecić samego siebie: podaj inny adres e-mail.',
  summary: (count) =>
    count === 1
      ? 'Jedno pole wymaga poprawy:'
      : form(count) === 'few'
        ? `${count} pola wymagają poprawy:`
        : `${count} pól wymaga poprawy:`,
};
