import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, p. ex. ${example}` : '');
// European Portuguese: 1 caractere, 0 and 2+ caracteres.
const form = (n: number) => new Intl.PluralRules('pt-PT').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'caractere' : 'caracteres'}`;

export const copy: ValidationCopy = {
  numberTag: 'pt-PT',
  adjective: {
    HU: 'húngaro', NL: 'neerlandês', BE: 'belga', DE: 'alemão',
    AT: 'austríaco', GB: 'britânico', FR: 'francês', CH: 'suíço',
    SK: 'eslovaco', RO: 'romeno', HR: 'croata', SI: 'esloveno',
    LU: 'luxemburguês', DK: 'dinamarquês', ES: 'espanhol', IT: 'italiano',
    PL: 'polaco', CZ: 'checo', PT: 'português', GR: 'grego',
    SE: 'sueco', NO: 'norueguês', FI: 'finlandês', EE: 'estónio',
    LV: 'letão', LT: 'lituano',
  },
  required: 'Preencha este campo.',
  email: 'Introduza um endereço de e-mail válido, p. ex. nome@exemplo.pt.',
  phone: (adjective, example) => `Introduza um número de telefone ${adjective ? `${adjective} ` : ''}válido${eg(example)}.`,
  postcode: (example) => `Introduza um código postal válido${eg(example)}.`,
  number: 'Introduza apenas um número, p. ex. 120.',
  min: (limit) => `Pelo menos ${limit}.`,
  max: (limit) => `No máximo ${limit}.`,
  url: 'Introduza um endereço web completo, p. ex. https://www.youtube.com/…',
  tooLong: (limit) => `No máximo ${chars(limit)}.`,
  minLength: (limit) => `Pelo menos ${chars(limit)}.`,
  consent: 'Para continuar, aceite a política de privacidade.',
  summary: (count) =>
    count === 1
      ? 'Um campo precisa de ser verificado:'
      : `${count} campos precisam de ser verificados:`,
};
