import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, напр. ${example}` : '');
// Russian count forms: 1 символ, 2–4 символа, 5+ символов (but 21 символ, 22 символа).
const form = (n: number) => new Intl.PluralRules('ru').select(n);
const pick = (n: number, one: string, few: string, many: string) => (form(n) === 'one' ? one : form(n) === 'few' ? few : many);
const chars = (n: number) => `${n} ${pick(n, 'символ', 'символа', 'символов')}`;

export const copy: ValidationCopy = {
  numberTag: 'ru-RU',
  // Masculine ("действительный венгерский номер телефона").
  adjective: {
    HU: 'венгерский', NL: 'нидерландский', BE: 'бельгийский', DE: 'немецкий', AT: 'австрийский', GB: 'британский', FR: 'французский', CH: 'швейцарский',
    SK: 'словацкий', RO: 'румынский', HR: 'хорватский', SI: 'словенский', LU: 'люксембургский', DK: 'датский', ES: 'испанский', IT: 'итальянский',
    PL: 'польский', CZ: 'чешский',
  },
  required: 'Заполните это поле.',
  email: 'Введите действительный адрес электронной почты, напр. name@example.com.',
  phone: (adjective, example) => `Введите действительный ${adjective ? `${adjective} ` : ''}номер телефона${eg(example)}.`,
  postcode: (example) => `Введите действительный почтовый индекс${eg(example)}.`,
  number: 'Введите только число, напр. 120.',
  min: (limit) => `Не менее ${limit}.`,
  max: (limit) => `Не более ${limit}.`,
  url: 'Введите полный веб-адрес, напр. https://www.youtube.com/…',
  tooLong: (limit) => `Не более ${chars(limit)}.`,
  minLength: (limit) => `Не менее ${chars(limit)}.`,
  consent: 'Чтобы продолжить, примите уведомление о конфиденциальности.',
  selfReferral: 'Нельзя рекомендовать самого себя: введите другой адрес электронной почты.',
  choose: 'Выберите из списка.',
  contact: (kind, match) => (kind === 'email' ? `Текст не должен содержать адрес электронной почты («${match}»). Покупатели связываются с вами через FINDDOME.` : kind === 'phone' ? `Текст не должен содержать номер телефона («${match}»). Покупатели связываются с вами через FINDDOME.` : `Текст не должен содержать сайт, соцсети или контакты мессенджеров («${match}»).`),
  summary: (count) => (count === 1 ? 'Нужно проверить ещё одно поле:' : `Нужно проверить ещё ${count} ${pick(count, 'поле', 'поля', 'полей')}:`),
};
