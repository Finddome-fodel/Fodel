import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, npr. ${example}` : '');
// Serbian count forms: 1 znak, 2–4 znaka, 5+ znakova (but 21 znak, 22 znaka).
const form = (n: number) => new Intl.PluralRules('sr-Latn').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'znak' : form(n) === 'few' ? 'znaka' : 'znakova'}`;

export const copy: ValidationCopy = {
  numberTag: 'sr-Latn-RS',
  // Masculine ("ispravan mađarski broj telefona").
  adjective: {
    HU: 'mađarski', NL: 'holandski', BE: 'belgijski', DE: 'nemački', AT: 'austrijski', GB: 'britanski', FR: 'francuski', CH: 'švajcarski',
    SK: 'slovački', RO: 'rumunski', HR: 'hrvatski', SI: 'slovenački', LU: 'luksemburški', DK: 'danski', ES: 'španski', IT: 'italijanski',
    PL: 'poljski', CZ: 'češki',
  },
  required: 'Popunite ovo polje.',
  email: 'Unesite ispravnu imejl adresu, npr. ime@primer.rs.',
  phone: (adjective, example) => `Unesite ispravan ${adjective ? `${adjective} ` : ''}broj telefona${eg(example)}.`,
  postcode: (example) => `Unesite ispravan poštanski broj${eg(example)}.`,
  number: 'Unesite samo broj, npr. 120.',
  min: (limit) => `Najmanje ${limit}.`,
  max: (limit) => `Najviše ${limit}.`,
  url: 'Unesite punu veb adresu, npr. https://www.youtube.com/…',
  tooLong: (limit) => `Najviše ${chars(limit)}.`,
  minLength: (limit) => `Najmanje ${chars(limit)}.`,
  consent: 'Da biste nastavili, prihvatite obaveštenje o privatnosti.',
  selfReferral: 'Ne možete preporučiti sami sebe: unesite drugu imejl adresu.',
  choose: 'Izaberite sa liste.',
  contact: (kind, match) => (kind === 'email' ? `Tekst ne sme da sadrži imejl adresu („${match}”). Kupci vas kontaktiraju preko FINDDOME-a.` : kind === 'phone' ? `Tekst ne sme da sadrži broj telefona („${match}”). Kupci vas kontaktiraju preko FINDDOME-a.` : `Tekst ne sme da sadrži veb-sajt, društvene mreže ili kontakt za razmenu poruka („${match}”).`),
  summary: (count) => (count === 1 ? 'Još jedno polje treba proveriti:' : `Još ${count} polja treba proveriti:`),
};
