import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, npr. ${example}` : '');
// Slovenian has four count forms: 1 znak, 2 znaka, 3–4 znaki, 5+ znakov.
const form = (n: number) => new Intl.PluralRules('sl-SI').select(n);
const chars = (n: number) =>
  `${n} ${{ one: 'znak', two: 'znaka', few: 'znaki' }[form(n) as 'one' | 'two' | 'few'] ?? 'znakov'}`;

export const copy: ValidationCopy = {
  numberTag: 'sl-SI',
  adjective: {
    HU: 'madžarsko', NL: 'nizozemsko', BE: 'belgijsko', DE: 'nemško',
    AT: 'avstrijsko', GB: 'britansko', FR: 'francosko', CH: 'švicarsko',
    SK: 'slovaško', RO: 'romunsko', HR: 'hrvaško', SI: 'slovensko',
    LU: 'luksemburško', DK: 'dansko', ES: 'špansko', IT: 'italijansko',
    PL: 'poljsko', CZ: 'češko', PT: 'portugalsko', GR: 'grško',
    SE: 'švedsko', NO: 'norveško', FI: 'finsko', EE: 'estonsko',
    LV: 'latvijsko', LT: 'litovsko',
  },
  required: 'Izpolnite to polje.',
  email: 'Vnesite veljaven e-poštni naslov, npr. ime@primer.si.',
  phone: (adjective, example) => `Vnesite veljavno ${adjective ? `${adjective} ` : ''}telefonsko številko${eg(example)}.`,
  postcode: (example) => `Vnesite veljavno poštno številko${eg(example)}.`,
  number: 'Vnesite samo število, npr. 120.',
  min: (limit) => `Vsaj ${limit}.`,
  max: (limit) => `Največ ${limit}.`,
  url: 'Vnesite celoten spletni naslov, npr. https://www.youtube.com/…',
  tooLong: (limit) => `Največ ${chars(limit)}.`,
  minLength: (limit) => `Vsaj ${chars(limit)}.`,
  consent: 'Za nadaljevanje sprejmite obvestilo o zasebnosti.',
  selfReferral: 'Ne morete priporočiti samega sebe: vpišite drug e-poštni naslov.',
  summary: (count) =>
    count === 1
      ? 'Eno polje je treba preveriti:'
      : `${count} ${{ two: 'polji', few: 'polja' }[form(count) as 'two' | 'few'] ?? 'polj'} je treba preveriti:`,
};
