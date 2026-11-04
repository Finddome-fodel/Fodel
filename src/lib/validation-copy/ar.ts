import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `، مثل ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'ar-u-nu-latn',
  // Country name in brackets ("رقم هاتف صالحًا (المجر)") to avoid case endings.
  adjective: {
    HU: 'المجر', NL: 'هولندا', BE: 'بلجيكا', DE: 'ألمانيا', AT: 'النمسا', GB: 'المملكة المتحدة', FR: 'فرنسا', CH: 'سويسرا',
    SK: 'سلوفاكيا', RO: 'رومانيا', HR: 'كرواتيا', SI: 'سلوفينيا', LU: 'لوكسمبورغ', DK: 'الدنمارك', ES: 'إسبانيا', IT: 'إيطاليا',
    PL: 'بولندا', CZ: 'التشيك',
  },
  required: 'يُرجى ملء هذا الحقل.',
  email: 'أدخل بريدًا إلكترونيًا صالحًا، مثل name@example.com.',
  phone: (adjective, example) => `أدخل رقم هاتف صالحًا${adjective ? ` (${adjective})` : ''}${eg(example)}.`,
  postcode: (example) => `أدخل رمزًا بريديًا صالحًا${eg(example)}.`,
  number: 'أدخل رقمًا فقط، مثل 120.',
  min: (limit) => `الحد الأدنى: ${limit}.`,
  max: (limit) => `الحد الأقصى: ${limit}.`,
  url: 'أدخل عنوان ويب كاملًا، مثل https://www.youtube.com/…',
  tooLong: (limit) => `الحد الأقصى لعدد الأحرف: ${limit}.`,
  minLength: (limit) => `الحد الأدنى لعدد الأحرف: ${limit}.`,
  consent: 'للمتابعة، يُرجى قبول إشعار الخصوصية.',
  selfReferral: 'لا يمكنك ترشيح نفسك: أدخل بريدًا إلكترونيًا مختلفًا.',
  choose: 'يُرجى الاختيار من القائمة.',
  contact: (kind, match) => (kind === 'email' ? `يجب ألا يحتوي النص على بريد إلكتروني («${match}»). يتواصل معك المشترون عبر FINDDOME.` : kind === 'phone' ? `يجب ألا يحتوي النص على رقم هاتف («${match}»). يتواصل معك المشترون عبر FINDDOME.` : `يجب ألا يحتوي النص على موقع ويب أو حساب تواصل اجتماعي أو جهة اتصال لتطبيق مراسلة («${match}»).`),
  summary: (count) => (count === 1 ? 'لا يزال هناك حقل واحد يحتاج إلى مراجعة:' : `عدد الحقول التي لا تزال تحتاج إلى مراجعة: ${count}`),
};
