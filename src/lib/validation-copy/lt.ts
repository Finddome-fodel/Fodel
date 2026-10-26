import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, pvz., ${example}` : '');
// Lithuanian: 1 and 21 simbolis, 2–9 simboliai, 10–20 simbolių.
const form = (n: number) => new Intl.PluralRules('lt-LT').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'simbolis' : form(n) === 'few' ? 'simboliai' : 'simbolių'}`;

export const copy: ValidationCopy = {
  numberTag: 'lt-LT',
  adjective: {
    HU: 'Vengrijos', NL: 'Nyderlandų', BE: 'Belgijos', DE: 'Vokietijos',
    AT: 'Austrijos', GB: 'Jungtinės Karalystės', FR: 'Prancūzijos', CH: 'Šveicarijos',
    SK: 'Slovakijos', RO: 'Rumunijos', HR: 'Kroatijos', SI: 'Slovėnijos',
    LU: 'Liuksemburgo', DK: 'Danijos', ES: 'Ispanijos', IT: 'Italijos',
    PL: 'Lenkijos', CZ: 'Čekijos', PT: 'Portugalijos', GR: 'Graikijos',
    SE: 'Švedijos', NO: 'Norvegijos', FI: 'Suomijos', EE: 'Estijos',
    LV: 'Latvijos', LT: 'Lietuvos',
  },
  required: 'Užpildykite šį laukelį.',
  email: 'Įveskite galiojantį el. pašto adresą, pvz., vardas@pavyzdys.lt.',
  phone: (adjective, example) => `Įveskite galiojantį ${adjective ? `${adjective} ` : ''}telefono numerį${eg(example)}.`,
  postcode: (example) => `Įveskite galiojantį pašto kodą${eg(example)}.`,
  number: 'Įveskite tik skaičių, pvz., 120.',
  min: (limit) => `Mažiausiai ${limit}.`,
  max: (limit) => `Daugiausiai ${limit}.`,
  url: 'Įveskite visą interneto adresą, pvz., https://www.youtube.com/…',
  tooLong: (limit) => `Daugiausiai ${chars(limit)}.`,
  minLength: (limit) => `Mažiausiai ${chars(limit)}.`,
  consent: 'Norėdami tęsti, sutikite su privatumo pranešimu.',
  summary: (count) =>
    count === 1
      ? 'Reikia patikrinti vieną laukelį:'
      : `Reikia patikrinti ${count} ${form(count) === 'one' ? 'laukelį' : form(count) === 'few' ? 'laukelius' : 'laukelių'}:`,
};
