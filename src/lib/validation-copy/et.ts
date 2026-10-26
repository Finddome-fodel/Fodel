import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, nt ${example}` : '');
// Estonian: 1 tähemärk, otherwise partitive (2 tähemärki).
const chars = (n: number) => `${n} ${n === 1 ? 'tähemärk' : 'tähemärki'}`;

export const copy: ValidationCopy = {
  numberTag: 'et-EE',
  adjective: {
    HU: 'Ungari', NL: 'Hollandi', BE: 'Belgia', DE: 'Saksa',
    AT: 'Austria', GB: 'Suurbritannia', FR: 'Prantsuse', CH: 'Šveitsi',
    SK: 'Slovaki', RO: 'Rumeenia', HR: 'Horvaatia', SI: 'Sloveenia',
    LU: 'Luksemburgi', DK: 'Taani', ES: 'Hispaania', IT: 'Itaalia',
    PL: 'Poola', CZ: 'Tšehhi', PT: 'Portugali', GR: 'Kreeka',
    SE: 'Rootsi', NO: 'Norra', FI: 'Soome', EE: 'Eesti',
    LV: 'Läti', LT: 'Leedu',
  },
  required: 'Palun täitke see väli.',
  email: 'Sisestage kehtiv e-posti aadress, nt nimi@naide.ee.',
  phone: (adjective, example) => `Sisestage kehtiv ${adjective ? `${adjective} ` : ''}telefoninumber${eg(example)}.`,
  postcode: (example) => `Sisestage kehtiv sihtnumber${eg(example)}.`,
  number: 'Sisestage ainult arv, nt 120.',
  min: (limit) => `Vähemalt ${limit}.`,
  max: (limit) => `Kuni ${limit}.`,
  url: 'Sisestage täielik veebiaadress, nt https://www.youtube.com/…',
  tooLong: (limit) => `Kuni ${chars(limit)}.`,
  minLength: (limit) => `Vähemalt ${chars(limit)}.`,
  consent: 'Jätkamiseks nõustuge privaatsuspoliitikaga.',
  summary: (count) =>
    count === 1
      ? 'Üks väli vajab kontrollimist:'
      : `${count} välja vajavad kontrollimist:`,
};
