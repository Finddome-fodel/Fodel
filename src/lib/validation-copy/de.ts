import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, z. B. ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'de-DE',
  // Feminine accusative ("eine gültige ungarische Telefonnummer").
  adjective: {
    HU: 'ungarische', NL: 'niederländische', BE: 'belgische', DE: 'deutsche', AT: 'österreichische', GB: 'britische',
    FR: 'französische', CH: 'Schweizer', SK: 'slowakische', RO: 'rumänische', HR: 'kroatische', SI: 'slowenische',
    LU: 'luxemburgische', DK: 'dänische', ES: 'spanische', IT: 'italienische', PL: 'polnische', CZ: 'tschechische',
  },
  required: 'Bitte füllen Sie dieses Feld aus.',
  email: 'Geben Sie eine gültige E-Mail-Adresse an, z. B. name@beispiel.de.',
  phone: (adjective, example) => `Geben Sie eine gültige ${adjective ? `${adjective} ` : ''}Telefonnummer an${eg(example)}.`,
  postcode: (example) => `Geben Sie eine gültige Postleitzahl an${eg(example)}.`,
  number: 'Geben Sie nur eine Zahl an, z. B. 120.',
  min: (limit) => `Mindestens ${limit}.`,
  max: (limit) => `Höchstens ${limit}.`,
  url: 'Geben Sie eine vollständige Webadresse an, z. B. https://www.youtube.com/…',
  tooLong: (limit) => `Höchstens ${limit} Zeichen.`,
  minLength: (limit) => `Mindestens ${limit} Zeichen.`,
  consent: 'Bitte akzeptieren Sie die Datenschutzerklärung, um fortzufahren.',
  selfReferral: 'Sie können sich nicht selbst empfehlen: Bitte geben Sie eine andere E-Mail-Adresse an.',
  summary: (count) => (count === 1 ? 'Bitte noch ein Feld prüfen:' : `Bitte noch ${count} Felder prüfen:`),
};
