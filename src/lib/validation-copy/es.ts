import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, p. ej., ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'es-ES',
  // Masculine, after "número de teléfono".
  adjective: {
    HU: 'húngaro', NL: 'neerlandés', BE: 'belga', DE: 'alemán', AT: 'austriaco', GB: 'británico', FR: 'francés',
    CH: 'suizo', SK: 'eslovaco', RO: 'rumano', HR: 'croata', SI: 'esloveno', LU: 'luxemburgués', DK: 'danés',
    ES: 'español', IT: 'italiano', PL: 'polaco', CZ: 'checo',
  },
  required: 'Rellene este campo.',
  email: 'Introduzca una dirección de correo electrónico válida, p. ej., nombre@ejemplo.es.',
  phone: (adjective, example) => `Introduzca un número de teléfono ${adjective ? `${adjective} ` : ''}válido${eg(example)}.`,
  postcode: (example) => `Introduzca un código postal válido${eg(example)}.`,
  number: 'Introduzca solo un número, p. ej., 120.',
  min: (limit) => `Como mínimo, ${limit}.`,
  max: (limit) => `Como máximo, ${limit}.`,
  url: 'Introduzca una dirección web completa, p. ej., https://www.youtube.com/…',
  tooLong: (limit) => `Máximo ${limit} ${limit === 1 ? 'carácter' : 'caracteres'}.`,
  minLength: (limit) => `Al menos ${limit} ${limit === 1 ? 'carácter' : 'caracteres'}.`,
  consent: 'Acepte la política de privacidad para continuar.',
  selfReferral: 'No puede recomendarse a sí mismo: indique otra dirección de correo electrónico.',
  summary: (count) => (count === 1 ? 'Queda un campo por revisar:' : `Quedan ${count} campos por revisar:`),
};
