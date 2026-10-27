import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, ad es. ${example}` : '');
// Italian: 1 carattere, 2+ caratteri.
const form = (n: number) => new Intl.PluralRules('it-IT').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'carattere' : 'caratteri'}`;

export const copy: ValidationCopy = {
  numberTag: 'it-IT',
  adjective: {
    HU: 'ungherese', NL: 'olandese', BE: 'belga', DE: 'tedesco',
    AT: 'austriaco', GB: 'britannico', FR: 'francese', CH: 'svizzero',
    SK: 'slovacco', RO: 'rumeno', HR: 'croato', SI: 'sloveno',
    LU: 'lussemburghese', DK: 'danese', ES: 'spagnolo', IT: 'italiano',
    PL: 'polacco', CZ: 'ceco', PT: 'portoghese', GR: 'greco',
    SE: 'svedese', NO: 'norvegese', FI: 'finlandese', EE: 'estone',
    LV: 'lettone', LT: 'lituano',
  },
  required: 'Compili questo campo.',
  email: 'Inserisca un indirizzo e-mail valido, ad es. nome@esempio.it.',
  phone: (adjective, example) => `Inserisca un numero di telefono ${adjective ? `${adjective} ` : ''}valido${eg(example)}.`,
  postcode: (example) => `Inserisca un CAP valido${eg(example)}.`,
  number: 'Inserisca solo un numero, ad es. 120.',
  min: (limit) => `Almeno ${limit}.`,
  max: (limit) => `Al massimo ${limit}.`,
  url: 'Inserisca un indirizzo web completo, ad es. https://www.youtube.com/…',
  tooLong: (limit) => `Al massimo ${chars(limit)}.`,
  minLength: (limit) => `Almeno ${chars(limit)}.`,
  consent: 'Per continuare, accetti l’informativa sulla privacy.',
  selfReferral: 'Non può raccomandare sé stesso: inserisca un altro indirizzo e-mail.',
  summary: (count) =>
    count === 1
      ? 'Un campo da controllare:'
      : `${count} campi da controllare:`,
};
