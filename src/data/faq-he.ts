/**
 * FAQ, Hebrew (plural address). Buyer-facing, translated from the English set (src/data/faq-en.ts):
 * same ids, same order; every figure comes from src/config/company.ts.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'he' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_HE = [
  {
    id: 'direct-from-the-owner',
    question: 'מה פירוש „ישירות מהבעלים”?',
    answer: [
      'בחלק גדול מהנכסים שלנו אנחנו מפרסמים את שם הבעלים ואת מספר הטלפון שלו לצד הפרטים שלנו. אפשר לפנות למוכר ישירות.',
      'אם פניתם ישירות וסיכמתם את הרכישה ביניכם, אף אחד לא משלם עמלה: לא אתם ולא המוכר. במקרה כזה אנחנו מקבלים תשלום רק על המודעה.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'כמה עולה שירות התיווך שלכם?',
    answer: [
      `העמלה שלנו היא ${COMMISSION.percent}% נטו, ולכל הפחות ${eur(COMMISSION.minimumEur, L)}, בתוספת מע״מ הולנדי ${COMMISSION.vatPercent}%. המוכר ההונגרי משלם אותה, לא אתם.`,
      'אנחנו מוציאים חשבונית רק כאשר שלושת התנאים מתקיימים: יש חוזה מכר בכתב, הקונה הגיע דרך FINDDOME והמקדמה שולמה.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'האם אזרחי האיחוד האירופי יכולים לקנות נכס בהונגריה?',
    answer: [
      'כן. כאזרחי האיחוד האירופי אתם קונים בתים ומגרשים בהונגריה כמעט באותם תנאים כמו אזרח הונגרי. כמעט 100% מהנכסים בהונגריה עומדים על קרקע בבעלות מלאה. הסדרי חכירה, כמו ה-erfpacht ההולנדי, נדירים.',
      `על קרקע חקלאית חלים כללים נפרדים. אזרח האיחוד האירופי בעל הכשרה חקלאית רשאי לרכוש בהונגריה עד ${AGRI_HECTARE_LIMIT} הקטאר; את ההליך הזה אנחנו מנהלים במלואו.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'האם עליי לנסוע להונגריה כדי לחתום?',
    answer: [
      'לא. אנחנו יכולים לייצג אתכם בהונגריה באמצעות ייפוי כוח, כך שאין צורך להגיע לחתימה.',
      'אנחנו מטפלים גם ברישום בלשכת רישום המקרקעין ההונגרית ובהעברת חשבונות השירותים.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'באיזו שפה נערך חוזה המכר?',
    answer: [
      'אנחנו דואגים לחוזים דו-לשוניים, כדי שתבינו על מה אתם חותמים.',
      `מחירים משוערים: בהונגרית החל מ-${price('hu')}, גרמנית–הונגרית ואנגלית–הונגרית החל מ-${price('de-hu')}, הולנדית–הונגרית החל מ-${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'במה בדיוק FINDDOME מטפלת ברכישה?',
    answer: [
      '- ייעוץ בטלפון ובמייל ותקשורת בין שני הצדדים',
      '- פגישות אישיות וסיורים בנכס',
      '- איש צוות שמדבר את השפה שלכם ומלווה אתכם',
      '- תמיכה במשא ומתן על המחיר',
      '- הכנת החוזה הרב-לשוני',
      '- ניהול הרכישה כולה',
      '- רישום הבעלים החדשים והעברת חשבונות השירותים',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'למה קונים ממערב אירופה בוחרים בהונגריה?',
    answer: [
      '- מחירי הנכסים ויוקר המחיה נמוכים בהרבה',
      '- בהונגריה בדרך כלל לא גובים מס רכוש',
      '- יותר שמש ואקלים מתון יותר',
      '- המדינה שוכנת מעל פני הים, במרכז היבשת',
      '- הונגריה היא מדינה חברה באיחוד האירופי',
      '- כמעט כל הנכסים עומדים על קרקע בבעלות מלאה',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'האם לנכס בהונגריה יש תעודת דירוג אנרגטי?',
    answer: [
      'כן. בהונגריה נדרשת תעודת דירוג אנרגטי (energiatanúsítvány), והיא חייבת להופיע במודעה. במודעות שלנו הדירוג מופיע בין המאפיינים; „בתהליך” פירושו שהתעודה עדיין בהכנה.',
      'אם המוכר מעוניין, נוכל לדאוג להכנת התעודה עבורו.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'מהו שירות החיפוש וכמה הוא עולה?',
    answer: [
      'שירות החיפוש הוא בחינם. ספרו לנו מה אתם מחפשים (סוג, אזור, תקציב ומשאלות), ואנחנו נחפש עבורכם, גם מעבר לנכסים שבאתר זה.',
      'אנשי הצוות דוברי ההונגרית שלנו עוזרים במשא ומתן ומוודאים שהחוזה ינוסח כדין. תקבלו מייל ברגע שיימצא משהו מתאים.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'באילו אזורים אתם פועלים?',
    answer: [
      'המיקוד הוא עבר הדנובה (טרנסדנוביה), עם המחוזות באראניה, טולנה, זאלה, שומוג׳ ווספרם, וכן אגם בלטון ורמת בלטון.',
      'יש לנו נכסים גם במישור ובאזורים עם גישה נוחה לנמל התעופה של בודפשט.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'אין לי הונגרית. זו בעיה?',
    answer: [
      'לא. בכל מודעה מצוין אילו שפות הבעלים מדברים, כך שתדעו זאת מראש.',
      'הצוות שלנו מדבר הולנדית, גרמנית, אנגלית, צרפתית והונגרית, ומצטרף אליכם לסיור בנכס.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'מתי אפשר להשיג אתכם?',
    answer: [
      `בימי חול בין ${COMPANY.hours.weekdays.from} ל-${COMPANY.hours.weekdays.to}. אם תבקשו שיחה חוזרת, נתקשר עד ${COMPANY.hours.callback.to}, גם בסופי שבוע.`,
      'שיחה חוזרת לא עולה לכם דבר. אנחנו משלמים על השיחה.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
