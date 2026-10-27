import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, esim. ${example}` : '');
// Finnish: 1 merkki, otherwise partitive (2 merkkiä).
const chars = (n: number) => `${n} ${n === 1 ? 'merkki' : 'merkkiä'}`;

export const copy: ValidationCopy = {
  numberTag: 'fi-FI',
  adjective: {
    HU: 'unkarilainen', NL: 'hollantilainen', BE: 'belgialainen', DE: 'saksalainen',
    AT: 'itävaltalainen', GB: 'brittiläinen', FR: 'ranskalainen', CH: 'sveitsiläinen',
    SK: 'slovakialainen', RO: 'romanialainen', HR: 'kroatialainen', SI: 'slovenialainen',
    LU: 'luxemburgilainen', DK: 'tanskalainen', ES: 'espanjalainen', IT: 'italialainen',
    PL: 'puolalainen', CZ: 'tšekkiläinen', PT: 'portugalilainen', GR: 'kreikkalainen',
    SE: 'ruotsalainen', NO: 'norjalainen', FI: 'suomalainen', EE: 'virolainen',
    LV: 'latvialainen', LT: 'liettualainen',
  },
  required: 'Täytä tämä kenttä.',
  email: 'Anna kelvollinen sähköpostiosoite, esim. nimi@esimerkki.fi.',
  phone: (adjective, example) => `Anna kelvollinen ${adjective ? `${adjective} ` : ''}puhelinnumero${eg(example)}.`,
  postcode: (example) => `Anna kelvollinen postinumero${eg(example)}.`,
  number: 'Anna vain numero, esim. 120.',
  min: (limit) => `Vähintään ${limit}.`,
  max: (limit) => `Enintään ${limit}.`,
  url: 'Anna täydellinen verkkosoite, esim. https://www.youtube.com/…',
  tooLong: (limit) => `Enintään ${chars(limit)}.`,
  minLength: (limit) => `Vähintään ${chars(limit)}.`,
  consent: 'Hyväksy tietosuojaseloste jatkaaksesi.',
  selfReferral: 'Et voi suositella itseäsi: anna toinen sähköpostiosoite.',
  summary: (count) =>
    count === 1
      ? 'Yksi kenttä on tarkistettava:'
      : `${count} kenttää on tarkistettava:`,
};
