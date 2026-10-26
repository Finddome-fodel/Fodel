import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, f.eks. ${example}` : '');
const chars = (n: number) => `${n} tegn`;

export const copy: ValidationCopy = {
  numberTag: 'nb-NO',
  adjective: {
    HU: 'ungarsk', NL: 'nederlandsk', BE: 'belgisk', DE: 'tysk',
    AT: 'østerriksk', GB: 'britisk', FR: 'fransk', CH: 'sveitsisk',
    SK: 'slovakisk', RO: 'rumensk', HR: 'kroatisk', SI: 'slovensk',
    LU: 'luxembourgsk', DK: 'dansk', ES: 'spansk', IT: 'italiensk',
    PL: 'polsk', CZ: 'tsjekkisk', PT: 'portugisisk', GR: 'gresk',
    SE: 'svensk', NO: 'norsk', FI: 'finsk', EE: 'estisk',
    LV: 'latvisk', LT: 'litauisk',
  },
  required: 'Fyll ut dette feltet.',
  email: 'Oppgi en gyldig e-postadresse, f.eks. navn@eksempel.no.',
  phone: (adjective, example) => `Oppgi et gyldig ${adjective ? `${adjective} ` : ''}telefonnummer${eg(example)}.`,
  postcode: (example) => `Oppgi et gyldig postnummer${eg(example)}.`,
  number: 'Oppgi bare et tall, f.eks. 120.',
  min: (limit) => `Minst ${limit}.`,
  max: (limit) => `Høyst ${limit}.`,
  url: 'Oppgi en fullstendig nettadresse, f.eks. https://www.youtube.com/…',
  tooLong: (limit) => `Høyst ${chars(limit)}.`,
  minLength: (limit) => `Minst ${chars(limit)}.`,
  consent: 'Godta personvernerklæringen for å fortsette.',
  summary: (count) =>
    count === 1
      ? 'Ett felt må kontrolleres:'
      : `${count} felt må kontrolleres:`,
};
