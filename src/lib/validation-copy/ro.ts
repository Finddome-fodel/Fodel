import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, de ex. ${example}` : '');
// Romanian: 1 caracter, 2–19 caractere, 20+ de caractere (Intl calls 2–19 "few").
const form = (n: number) => new Intl.PluralRules('ro-RO').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'caracter' : form(n) === 'few' ? 'caractere' : 'de caractere'}`;

export const copy: ValidationCopy = {
  numberTag: 'ro-RO',
  // Neuter singular, after "număr de telefon".
  adjective: {
    HU: 'maghiar', NL: 'olandez', BE: 'belgian', DE: 'german', AT: 'austriac', GB: 'britanic', FR: 'francez',
    CH: 'elvețian', SK: 'slovac', RO: 'românesc', HR: 'croat', SI: 'sloven', LU: 'luxemburghez', DK: 'danez',
    ES: 'spaniol', IT: 'italian', PL: 'polonez', CZ: 'ceh',
  },
  required: 'Vă rugăm să completați acest câmp.',
  email: 'Introduceți o adresă de e-mail validă, de ex. nume@exemplu.ro.',
  phone: (adjective, example) => `Introduceți un număr de telefon ${adjective ? `${adjective} ` : ''}valid${eg(example)}.`,
  postcode: (example) => `Introduceți un cod poștal valid${eg(example)}.`,
  number: 'Introduceți doar un număr, de ex. 120.',
  min: (limit) => `Cel puțin ${limit}.`,
  max: (limit) => `Cel mult ${limit}.`,
  url: 'Introduceți o adresă web completă, de ex. https://www.youtube.com/…',
  tooLong: (limit) => `Cel mult ${chars(limit)}.`,
  minLength: (limit) => `Cel puțin ${chars(limit)}.`,
  consent: 'Pentru a continua, vă rugăm să acceptați politica de confidențialitate.',
  selfReferral: 'Nu vă puteți recomanda pe dvs. înșivă: introduceți altă adresă de e-mail.',
  summary: (count) =>
    count === 1
      ? 'Un câmp trebuie verificat:'
      : `${count} ${form(count) === 'few' ? '' : 'de '}câmpuri trebuie verificate:`,
};
