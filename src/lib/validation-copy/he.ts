import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, לדוגמה ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'he-IL',
  // Masculine, after the noun ("מספר טלפון הונגרי תקין").
  adjective: {
    HU: 'הונגרי', NL: 'הולנדי', BE: 'בלגי', DE: 'גרמני', AT: 'אוסטרי', GB: 'בריטי', FR: 'צרפתי', CH: 'שווייצרי',
    SK: 'סלובקי', RO: 'רומני', HR: 'קרואטי', SI: 'סלובני', LU: 'לוקסמבורגי', DK: 'דני', ES: 'ספרדי', IT: 'איטלקי',
    PL: 'פולני', CZ: 'צ׳כי',
  },
  required: 'נא למלא שדה זה.',
  email: 'נא להזין כתובת מייל תקינה, לדוגמה name@example.com.',
  phone: (adjective, example) => `נא להזין מספר טלפון ${adjective ? `${adjective} ` : ''}תקין${eg(example)}.`,
  postcode: (example) => `נא להזין מיקוד תקין${eg(example)}.`,
  number: 'נא להזין מספר בלבד, לדוגמה 120.',
  min: (limit) => `לפחות ${limit}.`,
  max: (limit) => `לא יותר מ־${limit}.`,
  url: 'נא להזין כתובת אינטרנט מלאה, לדוגמה https://www.youtube.com/…',
  tooLong: (limit) => `לא יותר מ־${limit} תווים.`,
  minLength: (limit) => `לפחות ${limit} תווים.`,
  consent: 'כדי להמשיך, נא לאשר את הודעת הפרטיות.',
  selfReferral: 'אי אפשר להמליץ על עצמכם: נא להזין כתובת מייל אחרת.',
  choose: 'נא לבחור מהרשימה.',
  contact: (kind, match) => (kind === 'email' ? `הטקסט לא יכול להכיל כתובת מייל (״${match}״). קונים פונים אליכם דרך FINDDOME.` : kind === 'phone' ? `הטקסט לא יכול להכיל מספר טלפון (״${match}״). קונים פונים אליכם דרך FINDDOME.` : `הטקסט לא יכול להכיל אתר אינטרנט, רשת חברתית או פרטי קשר בתוכנת מסרים (״${match}״).`),
  summary: (count) => (count === 1 ? 'שדה אחד עדיין דורש בדיקה:' : `${count} שדות עדיין דורשים בדיקה:`),
};
