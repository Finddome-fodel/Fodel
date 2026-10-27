import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, f.eks. ${example}` : '');
const chars = (n: number) => `${n} tegn`;

export const copy: ValidationCopy = {
  numberTag: 'da-DK',
  adjective: {
    HU: 'ungarsk', NL: 'hollandsk', BE: 'belgisk', DE: 'tysk',
    AT: 'østrigsk', GB: 'britisk', FR: 'fransk', CH: 'schweizisk',
    SK: 'slovakisk', RO: 'rumænsk', HR: 'kroatisk', SI: 'slovensk',
    LU: 'luxembourgsk', DK: 'dansk', ES: 'spansk', IT: 'italiensk',
    PL: 'polsk', CZ: 'tjekkisk', PT: 'portugisisk', GR: 'græsk',
    SE: 'svensk', NO: 'norsk', FI: 'finsk', EE: 'estisk',
    LV: 'lettisk', LT: 'litauisk',
  },
  required: 'Udfyld dette felt.',
  email: 'Angiv en gyldig e-mailadresse, f.eks. navn@eksempel.dk.',
  phone: (adjective, example) => `Angiv et gyldigt ${adjective ? `${adjective} ` : ''}telefonnummer${eg(example)}.`,
  postcode: (example) => `Angiv et gyldigt postnummer${eg(example)}.`,
  number: 'Angiv kun et tal, f.eks. 120.',
  min: (limit) => `Mindst ${limit}.`,
  max: (limit) => `Højst ${limit}.`,
  url: 'Angiv en fuld webadresse, f.eks. https://www.youtube.com/…',
  tooLong: (limit) => `Højst ${chars(limit)}.`,
  minLength: (limit) => `Mindst ${chars(limit)}.`,
  consent: 'Accepter privatlivspolitikken for at fortsætte.',
  selfReferral: 'Du kan ikke anbefale dig selv: angiv en anden e-mailadresse.',
  summary: (count) =>
    count === 1
      ? 'Et felt skal kontrolleres:'
      : `${count} felter skal kontrolleres:`,
};
