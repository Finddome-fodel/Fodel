/**
 * Contact details in a translated text. A free listing may not carry the owner's phone number, e-mail
 * address or web address, so an AI translation that contains one is refused (translate-core.ts,
 * `checkTranslation`, code 'contact'). Deliberately conservative: a price, an area, a year or a
 * postcode is never a phone number.
 *
 * Pure, relative imports only: scripts/test-rules.mjs loads this file directly in Node.
 */

const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(\.[\p{L}\p{N}-]+)+/u;
const URL_LIKE = /\b(https?:\/\/|www\.)\S+|\b[a-z0-9-]{2,}\.(com|net|org|hu|nl|de|eu|info|biz|ro|sk|at|co\.uk)\b(\/\S*)?/i;
// An international or national trunk prefix, then digits that may be grouped by spaces, dots, dashes or brackets: at least nine digits in all.
const PHONE = /(?:^|[^\d\p{L}])((?:\+|00)\s?\d[\d\s().-]{7,}\d|0[1-9][\d\s().-]{7,}\d)(?![\d])/u;

/** The first contact detail found in `text`, or null. */
export function contactIn(text: string): string | null {
  const email = EMAIL.exec(text);
  if (email) return email[0];
  const url = URL_LIKE.exec(text);
  if (url) return url[0];
  const phone = PHONE.exec(text);
  if (phone && phone[1].replace(/\D/g, '').length >= 9) return phone[1].trim();
  return null;
}
