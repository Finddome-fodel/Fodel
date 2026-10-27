import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, pl. ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'hu-HU',
  adjective: {
    HU: 'magyar', NL: 'holland', BE: 'belga', DE: 'német', AT: 'osztrák', GB: 'brit', FR: 'francia', CH: 'svájci',
    SK: 'szlovák', RO: 'román', HR: 'horvát', SI: 'szlovén', LU: 'luxemburgi', DK: 'dán', ES: 'spanyol', IT: 'olasz',
    PL: 'lengyel', CZ: 'cseh',
  },
  required: 'Kérjük, töltse ki ezt a mezőt.',
  email: 'Adjon meg egy érvényes e-mail-címet, pl. nev@example.com.',
  phone: (adjective, example) => `Adjon meg egy érvényes ${adjective ? `${adjective} ` : ''}telefonszámot${eg(example)}.`,
  postcode: (example) => `Adjon meg egy érvényes irányítószámot${eg(example)}.`,
  number: 'Csak számot adjon meg, pl. 120.',
  min: (limit) => `Legalább ${limit} legyen.`,
  max: (limit) => `Legfeljebb ${limit} lehet.`,
  url: 'Adjon meg egy teljes webcímet, pl. https://www.youtube.com/…',
  tooLong: (limit) => `Legfeljebb ${limit} karakter lehet.`,
  minLength: (limit) => `Legalább ${limit} karakter legyen.`,
  consent: 'A folytatáshoz kérjük, fogadja el az adatkezelési tájékoztatót.',
  selfReferral: 'Saját magát nem ajánlhatja: adjon meg egy másik e-mail-címet.',
  summary: (count) => (count === 1 ? 'Egy mezőt még javítani kell:' : `${count} mezőt még javítani kell:`),
};
