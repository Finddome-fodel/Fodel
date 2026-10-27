import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, t.ex. ${example}` : '');
const chars = (n: number) => `${n} tecken`;

export const copy: ValidationCopy = {
  numberTag: 'sv-SE',
  adjective: {
    HU: 'ungerskt', NL: 'nederländskt', BE: 'belgiskt', DE: 'tyskt',
    AT: 'österrikiskt', GB: 'brittiskt', FR: 'franskt', CH: 'schweiziskt',
    SK: 'slovakiskt', RO: 'rumänskt', HR: 'kroatiskt', SI: 'slovenskt',
    LU: 'luxemburgskt', DK: 'danskt', ES: 'spanskt', IT: 'italienskt',
    PL: 'polskt', CZ: 'tjeckiskt', PT: 'portugisiskt', GR: 'grekiskt',
    SE: 'svenskt', NO: 'norskt', FI: 'finskt', EE: 'estniskt',
    LV: 'lettiskt', LT: 'litauiskt',
  },
  required: 'Fyll i det här fältet.',
  email: 'Ange en giltig e-postadress, t.ex. namn@exempel.se.',
  phone: (adjective, example) => `Ange ett giltigt ${adjective ? `${adjective} ` : ''}telefonnummer${eg(example)}.`,
  postcode: (example) => `Ange ett giltigt postnummer${eg(example)}.`,
  number: 'Ange endast ett tal, t.ex. 120.',
  min: (limit) => `Minst ${limit}.`,
  max: (limit) => `Högst ${limit}.`,
  url: 'Ange en fullständig webbadress, t.ex. https://www.youtube.com/…',
  tooLong: (limit) => `Högst ${chars(limit)}.`,
  minLength: (limit) => `Minst ${chars(limit)}.`,
  consent: 'Godkänn integritetspolicyn för att fortsätta.',
  selfReferral: 'Du kan inte rekommendera dig själv: ange en annan e-postadress.',
  summary: (count) =>
    count === 1
      ? 'Ett fält behöver kontrolleras:'
      : `${count} fält behöver kontrolleras:`,
};
