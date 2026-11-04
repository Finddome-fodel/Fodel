import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, напр. ${example}` : '');
// Ukrainian count forms: 1 символ, 2–4 символи, 5+ символів (but 21 символ, 22 символи).
const form = (n: number) => new Intl.PluralRules('uk').select(n);
const pick = (n: number, one: string, few: string, many: string) => (form(n) === 'one' ? one : form(n) === 'few' ? few : many);
const chars = (n: number) => `${n} ${pick(n, 'символ', 'символи', 'символів')}`;

export const copy: ValidationCopy = {
  numberTag: 'uk-UA',
  // Masculine ("дійсний угорський номер телефону").
  adjective: {
    HU: 'угорський', NL: 'нідерландський', BE: 'бельгійський', DE: 'німецький', AT: 'австрійський', GB: 'британський', FR: 'французький', CH: 'швейцарський',
    SK: 'словацький', RO: 'румунський', HR: 'хорватський', SI: 'словенський', LU: 'люксембурзький', DK: 'данський', ES: 'іспанський', IT: 'італійський',
    PL: 'польський', CZ: 'чеський',
  },
  required: 'Заповніть це поле.',
  email: 'Введіть дійсну адресу електронної пошти, напр. name@example.com.',
  phone: (adjective, example) => `Введіть дійсний ${adjective ? `${adjective} ` : ''}номер телефону${eg(example)}.`,
  postcode: (example) => `Введіть дійсний поштовий індекс${eg(example)}.`,
  number: 'Введіть лише число, напр. 120.',
  min: (limit) => `Щонайменше ${limit}.`,
  max: (limit) => `Не більше ніж ${limit}.`,
  url: 'Введіть повну веб-адресу, напр. https://www.youtube.com/…',
  tooLong: (limit) => `Не більше ніж ${chars(limit)}.`,
  minLength: (limit) => `Щонайменше ${chars(limit)}.`,
  consent: 'Щоб продовжити, прийміть повідомлення про конфіденційність.',
  selfReferral: 'Ви не можете рекомендувати самого себе: введіть іншу адресу електронної пошти.',
  choose: 'Виберіть зі списку.',
  contact: (kind, match) => (kind === 'email' ? `Текст не повинен містити адресу електронної пошти («${match}»). Покупці зв’язуються з вами через FINDDOME.` : kind === 'phone' ? `Текст не повинен містити номер телефону («${match}»). Покупці зв’язуються з вами через FINDDOME.` : `Текст не повинен містити вебсайт, соцмережі чи контакти месенджерів («${match}»).`),
  summary: (count) => (count === 1 ? 'Потрібно перевірити ще одне поле:' : `Потрібно перевірити ще ${count} ${pick(count, 'поле', 'поля', 'полів')}:`),
};
