import type { ValidationCopy } from './types.ts';

// "p. ex." keeps its no-break space; the French rule for ":" is a no-break space before it.
const eg = (example?: string) => (example ? `, p. ex. ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'fr-FR',
  // Masculine, after "numéro de téléphone".
  adjective: {
    HU: 'hongrois', NL: 'néerlandais', BE: 'belge', DE: 'allemand', AT: 'autrichien', GB: 'britannique', FR: 'français',
    CH: 'suisse', SK: 'slovaque', RO: 'roumain', HR: 'croate', SI: 'slovène', LU: 'luxembourgeois', DK: 'danois',
    ES: 'espagnol', IT: 'italien', PL: 'polonais', CZ: 'tchèque',
  },
  required: 'Veuillez remplir ce champ.',
  email: 'Saisissez une adresse e-mail valide, p. ex. nom@exemple.fr.',
  phone: (adjective, example) => `Saisissez un numéro de téléphone ${adjective ? `${adjective} ` : ''}valide${eg(example)}.`,
  postcode: (example) => `Saisissez un code postal valide${eg(example)}.`,
  number: 'Saisissez uniquement un nombre, p. ex. 120.',
  min: (limit) => `Au moins ${limit}.`,
  max: (limit) => `${limit} au maximum.`,
  url: 'Saisissez une adresse web complète, p. ex. https://www.youtube.com/…',
  tooLong: (limit) => `${limit} caractères au maximum.`,
  minLength: (limit) => `Au moins ${limit} caractères.`,
  consent: 'Veuillez accepter la politique de confidentialité pour continuer.',
  selfReferral: 'Vous ne pouvez pas vous recommander vous-même : indiquez une autre adresse e-mail.',
  summary: (count) => (count === 1 ? 'Un champ reste à vérifier :' : `${count} champs restent à vérifier :`),
};
