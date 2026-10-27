import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, π.χ. ${example}` : '');
// Greek: 1 χαρακτήρας, 2+ χαρακτήρες.
const form = (n: number) => new Intl.PluralRules('el-GR').select(n);
const chars = (n: number) => `${n} ${form(n) === 'one' ? 'χαρακτήρας' : 'χαρακτήρες'}`;

export const copy: ValidationCopy = {
  numberTag: 'el-GR',
  adjective: {
    HU: 'ουγγρικό', NL: 'ολλανδικό', BE: 'βελγικό', DE: 'γερμανικό',
    AT: 'αυστριακό', GB: 'βρετανικό', FR: 'γαλλικό', CH: 'ελβετικό',
    SK: 'σλοβακικό', RO: 'ρουμανικό', HR: 'κροατικό', SI: 'σλοβενικό',
    LU: 'λουξεμβουργιανό', DK: 'δανικό', ES: 'ισπανικό', IT: 'ιταλικό',
    PL: 'πολωνικό', CZ: 'τσεχικό', PT: 'πορτογαλικό', GR: 'ελληνικό',
    SE: 'σουηδικό', NO: 'νορβηγικό', FI: 'φινλανδικό', EE: 'εσθονικό',
    LV: 'λετονικό', LT: 'λιθουανικό',
  },
  required: 'Συμπληρώστε αυτό το πεδίο.',
  email: 'Εισαγάγετε μια έγκυρη διεύθυνση email, π.χ. onoma@paradeigma.gr.',
  phone: (adjective, example) => `Εισαγάγετε έναν έγκυρο ${adjective ? `${adjective} ` : ''}αριθμό τηλεφώνου${eg(example)}.`,
  postcode: (example) => `Εισαγάγετε έναν έγκυρο ταχυδρομικό κώδικα${eg(example)}.`,
  number: 'Εισαγάγετε μόνο έναν αριθμό, π.χ. 120.',
  min: (limit) => `Τουλάχιστον ${limit}.`,
  max: (limit) => `Το πολύ ${limit}.`,
  url: 'Εισαγάγετε μια πλήρη διεύθυνση ιστού, π.χ. https://www.youtube.com/…',
  tooLong: (limit) => `Το πολύ ${chars(limit)}.`,
  minLength: (limit) => `Τουλάχιστον ${chars(limit)}.`,
  consent: 'Για να συνεχίσετε, αποδεχτείτε την πολιτική απορρήτου.',
  selfReferral: 'Δεν μπορείτε να προτείνετε τον εαυτό σας: δώστε άλλη διεύθυνση email.',
  summary: (count) =>
    count === 1
      ? 'Ένα πεδίο χρειάζεται έλεγχο:'
      : `${count} πεδία χρειάζονται έλεγχο:`,
};
