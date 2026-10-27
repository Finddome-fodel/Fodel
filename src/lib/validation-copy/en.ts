import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, e.g. ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'en-GB',
  adjective: {
    HU: 'Hungarian', NL: 'Dutch', BE: 'Belgian', DE: 'German', AT: 'Austrian', GB: 'UK', FR: 'French', CH: 'Swiss',
    SK: 'Slovak', RO: 'Romanian', HR: 'Croatian', SI: 'Slovenian', LU: 'Luxembourg', DK: 'Danish', ES: 'Spanish', IT: 'Italian',
    PL: 'Polish', CZ: 'Czech',
  },
  required: 'Please fill in this field.',
  email: 'Enter a valid email address, e.g. name@example.com.',
  phone: (adjective, example) => `Enter a valid ${adjective ? `${adjective} ` : ''}phone number${eg(example)}.`,
  postcode: (example) => `Enter a valid postcode${eg(example)}.`,
  number: 'Enter a number only, e.g. 120.',
  min: (limit) => `At least ${limit}.`,
  max: (limit) => `No more than ${limit}.`,
  url: 'Enter a full web address, e.g. https://www.youtube.com/…',
  tooLong: (limit) => `No more than ${limit} characters.`,
  minLength: (limit) => `At least ${limit} characters.`,
  consent: 'Please accept the privacy notice to continue.',
  selfReferral: 'You cannot refer yourself: enter a different email address.',
  summary: (count) => (count === 1 ? 'One field still needs checking:' : `${count} fields still need checking:`),
};
