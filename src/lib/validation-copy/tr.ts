import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, ör. ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'tr-TR',
  // Country name as modifier ("geçerli bir Macaristan telefon numarası").
  adjective: {
    HU: 'Macaristan', NL: 'Hollanda', BE: 'Belçika', DE: 'Almanya', AT: 'Avusturya', GB: 'Birleşik Krallık', FR: 'Fransa', CH: 'İsviçre',
    SK: 'Slovakya', RO: 'Romanya', HR: 'Hırvatistan', SI: 'Slovenya', LU: 'Lüksemburg', DK: 'Danimarka', ES: 'İspanya', IT: 'İtalya',
    PL: 'Polonya', CZ: 'Çekya',
  },
  required: 'Lütfen bu alanı doldurun.',
  email: 'Geçerli bir e-posta adresi girin, ör. ad@ornek.com.',
  phone: (adjective, example) => `Geçerli bir ${adjective ? `${adjective} ` : ''}telefon numarası girin${eg(example)}.`,
  postcode: (example) => `Geçerli bir posta kodu girin${eg(example)}.`,
  number: 'Yalnızca rakam girin, ör. 120.',
  min: (limit) => `En az ${limit}.`,
  max: (limit) => `En fazla ${limit}.`,
  url: 'Tam bir web adresi girin, ör. https://www.youtube.com/…',
  tooLong: (limit) => `En fazla ${limit} karakter.`,
  minLength: (limit) => `En az ${limit} karakter.`,
  consent: 'Devam etmek için lütfen gizlilik bildirimini kabul edin.',
  selfReferral: 'Kendinizi tavsiye edemezsiniz: farklı bir e-posta adresi girin.',
  choose: 'Lütfen listeden seçin.',
  contact: (kind, match) => (kind === 'email' ? `Metin e-posta adresi içeremez (“${match}”). Alıcılar size FINDDOME üzerinden ulaşır.` : kind === 'phone' ? `Metin telefon numarası içeremez (“${match}”). Alıcılar size FINDDOME üzerinden ulaşır.` : `Metin web sitesi, sosyal medya veya mesajlaşma bilgisi içeremez (“${match}”).`),
  summary: (count) => (count === 1 ? 'Bir alanın daha kontrol edilmesi gerekiyor:' : `${count} alanın daha kontrol edilmesi gerekiyor:`),
};
