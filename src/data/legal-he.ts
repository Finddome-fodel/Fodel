/**
 * Legal pages, Hebrew (plural address). A faithful translation of the English
 * legal pages (src/data/legal-en.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. The notice on every page states that the Hungarian
 * or English version prevails (the Dutch original on matters of Dutch law).
 * It needs the client's and a lawyer's sign-off before launch, like the other
 * translations; see Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { legacyTiers } from '~/lib/price-tiers';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'he' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 ביולי 2026';
const notice =
  'זהו תרגום לנוחיותכם. במקרה של סתירה, הנוסח ההונגרי או האנגלי הוא המחייב (בעניינים של הדין ההולנדי – המקור ההולנדי).';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
/** Every tier price of a package, e.g. "€ 129 / € 179" (the tier is set by the listing's forint price). */
const tierPrices = (pkg: typeof normal) =>
  legacyTiers(pkg.priceEur, pkg.priceEurAbove, pkg.thresholdHuf).map((tier) => eur(tier.priceEur, L)).join(' / ');
// Only the category highlight is sold since November 2026; the homepage is an editorial choice.
const minMonths = (extra('category-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_HE = {
  imprint: {
    metaTitle: 'פרטי החברה',
    metaDescription: `פרטי החברה ${COMPANY.names.legal}: כתובת רשומה, מספר מע״מ, מספר KvK ופרטי התקשרות.`,
    eyebrow: 'פרטים משפטיים',
    title: 'פרטי',
    titleEm: 'החברה',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'פרטי נותן השירות',
        rows: [
          ['שם החברה', COMPANY.names.legal],
          ['כתובת רשומה', addressLine(COMPANY.address, L)],
          ['מספר מע״מ', COMPANY.registration.vat],
          ['מספר KvK (לשכת המסחר ההולנדית)', kvk],
          ['נציג', COMPANY.principal],
          ['דוא״ל', COMPANY.email.primary],
          ['טלפון', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['שנת הקמה', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'חשבונות בנק',
        rows: [
          ['הולנד', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['הונגריה', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'מחלוקות',
        body: 'במחלוקת צרכנית תוכלו לפנות גם לפלטפורמת ה-ODR האירופית: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'מדיניות פרטיות',
    metaDescription:
      'כיצד FODEL מטפלת במידע האישי שלכם: אילו נתונים אנו מעבדים, כמה זמן אנו שומרים אותם ואילו זכויות עומדות לכם לפי ה-GDPR.',
    eyebrow: 'פרטיות',
    title: 'מדיניות',
    titleEm: 'פרטיות',
    intro:
      'מדיניות זו מתארת כיצד אנו מטפלים, בהתאם ל-GDPR, במידע האישי שאתם מוסרים לנו דרך אתר זה.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'בעל השליטה במידע',
        rows: [
          ['בעל השליטה', COMPANY.names.legal],
          ['כתובת', addressLine(COMPANY.address, L)],
          ['דוא״ל', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'אילו נתונים אנו מעבדים',
        intro: 'רק את הנתונים שאתם עצמכם מזינים בטפסים שלנו:',
        items: [
          'שם, כתובת דוא״ל ומספר טלפון: כדי שנוכל להשיב לפנייתכם',
          'נושא ההודעה ותוכנה',
          'למודעה: פרטי הנכס ופרטי החיוב שלכם',
          'לבקשת חיפוש: קריטריוני החיפוש שלכם',
          'לרישום פנימי: מתי ואיזה טופס מילאתם ומתי נכנסתם לפורטל, ללא שמירת כתובת IP',
        ],
      },
      {
        type: 'table',
        title: 'בסיס חוקי ותקופת שמירה',
        rows: [
          ['פנייה ובקשה לשיחה חוזרת', 'הסכמה (סעיף 6(1)(a) ל-GDPR): 12 חודשים'],
          ['הזמנת מודעה', 'ביצוע חוזה (סעיף 6(1)(b)): 7 שנים, תקופת שמירה חוקית לצורכי מס'],
          ['בקשת חיפוש', 'הסכמה: עד להשלמה, לכל היותר 24 חודשים'],
          ['יומן פעילות פנימי', 'אינטרס לגיטימי (סעיף 6(1)(f)): ניהול רישום תקין ואיתור שימוש לרעה: לכל היותר 24 חודשים'],
        ],
      },
      {
        type: 'list',
        title: 'עם מי אנו משתפים נתונים',
        intro: 'איננו מוכרים את הנתונים שלכם ואיננו משתפים אותם למטרות שיווק. מעבדי המידע שלנו הם:',
        items: [
          'ספק הדוא״ל שלנו, עם עיבוד בתוך האיחוד האירופי',
          'ספק האחסון של אתר זה',
          'ברכישה, ורק לבקשתכם: הצד השני לעסקה ועורך הדין המעורב',
        ],
      },
      {
        type: 'callout',
        title: 'לגבי מודעות',
        body: 'כמפרסמים תוכלו להרשות לנו להציג את שמכם ואת מספר הטלפון שלכם במודעה, כדי שמתעניינים יוכלו לפנות אליכם ישירות. תוכלו לבטל הרשאה זו בכל עת; במקרה כזה נסיר את הפרטים מהמודעה.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'ניוזלטר',
        body: 'אם תירשמו לניוזלטר שלנו, נעבד על בסיס הסכמתכם את כתובת הדוא״ל שלכם, את השפה שבחרתם ואת מועד ההרשמה והאישור, אך ורק לצורך שליחת הניוזלטר. ההרשמה מתבצעת בשני שלבים: לא נשלח דבר עד שתלחצו על הכפתור בהודעת האישור. בכל הודעה תוכלו לבטל את המינוי בלחיצה אחת, ואנו מפסיקים מיד. לשליחה אנו משתמשים בשירות Resend.',
      },
      {
        type: 'list',
        title: 'הזכויות שלכם',
        items: [
          'עיון בנתונים שאנו מעבדים עליכם',
          'תיקון ומחיקה',
          'הגבלת העיבוד או התנגדות לו',
          'ניידות נתונים',
          'ביטול הסכמתכם בכל עת',
          'הגשת תלונה לרשות ההולנדית להגנת מידע (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'פניות בנושא פרטיות',
        paragraphs: [`שאלות ובקשות אפשר לשלוח אל ${COMPANY.email.primary}. אנו משיבים תוך 30 יום לכל המאוחר.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'מדיניות עוגיות',
    metaDescription: `באילו עוגיות משתמש ${SITE_HOST} וכיצד לשנות את בחירתכם.`,
    eyebrow: 'עוגיות',
    title: 'מדיניות',
    titleEm: 'עוגיות',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'כרגע אתר זה משתמש רק באחסון הנחוץ מבחינה טכנית. איננו מפעילים סקריפטים של פרסום או מעקב, ואיננו משתפים דבר עם רשתות חברתיות.',
        ],
      },
      {
        type: 'table',
        title: 'מה אנו שומרים',
        rows: [
          [
            'fodel:consent',
            'הבחירה שלכם לגבי עוגיות (אושר או נדחה). נשמרת בדפדפן שלכם ואינה מגיעה אלינו. תקופת שמירה: 12 חודשים.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'סטטיסטיקה',
        paragraphs: [
          'אם אי פעם נאסוף סטטיסטיקת מבקרים, נפעיל אותה רק בהסכמתכם המפורשת והמוקדמת. סירוב אינו מגביל בשום אופן את השימוש באתר.',
        ],
      },
      {
        type: 'prose',
        title: 'שינוי הבחירה',
        paragraphs: [
          'תוכלו לשנות את בחירתכם בכל עת על ידי מחיקת נתוני הדפדפן השמורים עבור אתר זה; לאחר מכן הודעת העוגיות תופיע שוב.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'תנאים כלליים',
    metaDescription:
      'התנאים של שירות הפרסום והתיווך של FODEL: מחירים, עמלה, הסרת מודעה ואחריות.',
    eyebrow: 'תנאים',
    title: 'תנאים',
    titleEm: 'כלליים',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'שימו לב',
        body: 'עמוד זה הוא תקציר. התנאים המלאים והמחייבים זמינים כקובץ PDF; במקרה של סתירה, קובץ ה-PDF הוא המחייב.',
      },
      {
        type: 'prose',
        title: '1. השירות',
        paragraphs: [
          'FODEL מפרסמת נכסי נדל״ן בהונגריה באתרים רב-לשוניים משלה, ועל פי הסכם נפרד מסייעת בהשלמת המכירה.',
          'שירות הפרסום אינו בלעדי: המוכר רשאי להציע ולמכור את הנכס גם בערוצים אחרים.',
        ],
      },
      {
        type: 'list',
        title: '2. פרסום מודעה',
        ordered: true,
        items: [
          'המוכר ממלא את טופס ההרשמה.',
          'FODEL שולחת דרישת תשלום עבור החבילה שנבחרה.',
          'המוכר משלם בהעברה בנקאית.',
          'עם קבלת התשלום, המוכר מקבל הרשאה להעלות תמונות.',
          'FODEL מטפלת בתרגום ומפרסמת את המודעה.',
        ],
      },
      {
        type: 'table',
        title: '3. מחירים',
        intro: `כל המחירים כוללים מע״מ הולנדי בשיעור ${LISTING_VAT_PERCENT}%. הסקירה המלאה מופיעה בעמוד המחירים.`,
        rows: [
          [`מודעה חסכונית (${cheap.months} חודשים)`, eur(cheap.priceEur, L)],
          [`מודעה רגילה (${normal.months} חודשים)`, `${tierPrices(normal)}`],
          ['תרגום', `${eur(extra('translation').priceEur, L)} לשפה`],
          [
            'הדגשה',
            `${eur(extra('category-highlight').priceEur, L)} לחודש (מינימום ${minMonths} חודשים)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. עמלה',
        paragraphs: [
          'עמלה משולמת רק כאשר מתקיימים כל התנאים הבאים: חוזה מכר בכתב, קונה שהובא על ידי FODEL ומקדמה ששולמה.',
          `העמלה היא ${COMMISSION.percent}% נטו, ולכל הפחות ${eur(COMMISSION.minimumEur, L)}, בתוספת מע״מ הולנדי בשיעור ${COMMISSION.vatPercent}%.`,
          'אם המתעניין פונה ישירות למוכר ואין צורך בעזרתנו בהשלמת העסקה, לא משולם דבר מעבר לדמי המודעה.',
        ],
      },
      {
        type: 'prose',
        title: '5. הסרת המודעה',
        paragraphs: [
          'המוכר רשאי להסיר את המודעה לפני מועד תפוגתה. במקרה כזה דמי מודעה ששולמו אינם מוחזרים.',
        ],
      },
      {
        type: 'prose',
        title: '6. אחריות',
        paragraphs: [
          'המוכר אחראי לנכונות הפרטים על הנכס. FODEL מציגה את הפרטים שנמסרו לה ואינה נושאת באחריות לנכונותם.',
          'התרגומים באתר זה הם למידע בלבד; במחלוקת, הנוסח ההונגרי הוא המחייב.',
        ],
      },
      {
        type: 'prose',
        title: '7. זכות ביטול',
        paragraphs: [
          'למוכר שהוא צרכן עומדת זכות הביטול הקבועה בחוק לגבי חוזים מרחוק. אם המוכר מבקש במפורש ביצוע מיידי, זכות הביטול מצטמצמת באופן יחסי לשירות שכבר ניתן.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'הצהרת נגישות',
    metaDescription: `רמת הנגישות של ${SITE_HOST}, התקן שאנו פועלים לפיו וכיצד לשלוח לנו משוב.`,
    eyebrow: 'נגישות',
    title: 'הצהרת',
    titleEm: 'נגישות',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'אנו רוצים שכל אחד יוכל להשתמש באתר זה, כולל מבקרים המשתמשים בקורא מסך, במקלדת או בהגדלה.',
          'אנו בונים את האתר לפי WCAG 2.2 ברמה AA. חלק ניכר מהמבקרים שלנו הם גמלאים, ולכן גודל הטקסט, הניגודיות והפעלה במקלדת נמצאים בעדיפות עליונה.',
        ],
      },
      {
        type: 'list',
        title: 'מה כבר קיים',
        items: [
          'לכל הטקסט יחס ניגודיות של 4.5:1 לפחות',
          'הפעלה מלאה במקלדת עם סימון מיקוד גלוי',
          'קישור “דילוג לתוכן” בראש כל עמוד',
          'טקסטים חלופיים בעלי משמעות לכל התמונות',
          'שדות טופס עם תוויות מקושרות והודעות שגיאה בטקסט',
          'כיבוד הגדרת המערכת “הפחתת תנועה”',
          'האתר קריא ושמיש גם ללא JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'מגבלות ידועות',
        paragraphs: ['אין לנו השפעה על הנגישות של תוכן צד שלישי, כגון שירות מפות.'],
      },
      {
        type: 'prose',
        title: 'משוב',
        paragraphs: [
          `אם נתקלתם במחסום, הודיעו לנו בכתובת ${COMPANY.email.primary} או בטלפון. אנו מטפלים בפניות מהר ככל האפשר.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
