/**
 * Finds contact details in free text (spec §5.2): e-mail addresses (also
 * written as „kukac … pont …”), phone numbers, websites and messenger handles.
 *
 * Used for FREE listings only (properties.free_listing): their buyers reach
 * the seller through FINDDOME, so the text may not route around it. Paid
 * listings are never checked.
 *
 * Deterministic and pure (no AI, no Node APIs): the setup form runs the same
 * function in the browser as the server does before saving, so what the owner
 * sees highlighted is exactly what the server refuses.
 *
 * Built to miss rather than to nag. Prices („45 000 000 Ft”), areas, years,
 * dates, postcodes and land-registry numbers are not phone numbers, and a
 * number needs a phone prefix (+, 00, 06) or nine digits to count at all.
 * Known limitation: numbers written out in words („nulla hat harminc…”) are
 * not detected.
 */
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

export type ContactKind = 'email' | 'phone' | 'url' | 'handle';
/** `match` is the snippet as written; `index` is its position in the original text. */
export type ContactHit = { kind: ContactKind; match: string; index: number };
/** The validation code a hit is reported with (validation-copy `contact`). */
export type ContactCode = 'contact-email' | 'contact-phone' | 'contact-link';

export const contactCode = (kind: ContactKind): ContactCode =>
  kind === 'email' ? 'contact-email' : kind === 'phone' ? 'contact-phone' : 'contact-link';

/* ── Normalisation ─────────────────────────────────────────────────────── */

const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF\u00AD]/;
const ARABIC_DIGIT = /[\u0660-\u0669\u06F0-\u06F9]/;

/**
 * A copy of the text that is easier to search: NFKC (full-width ＠ and ０–９
 * become @ and 0–9), zero-width characters dropped, Arabic-Indic digits mapped
 * to ASCII. `at[i]` is the original index of normalised character i, so a
 * match can be cut out of the text the owner actually typed.
 */
function normalise(text: string): { text: string; at: number[] } {
  let out = '';
  const at: number[] = [];
  for (let i = 0; i < text.length; ) {
    const code = text.codePointAt(i)!;
    const ch = String.fromCodePoint(code);
    const width = ch.length;
    if (!ZERO_WIDTH.test(ch)) {
      let mapped: string;
      if (ARABIC_DIGIT.test(ch)) mapped = String((code >= 0x06f0 ? code - 0x06f0 : code - 0x0660));
      else mapped = ch.normalize('NFKC');
      for (let k = 0; k < mapped.length; k++) { out += mapped[k]; at.push(i); }
    }
    i += width;
  }
  return { text: out, at };
}

/* ── Patterns ──────────────────────────────────────────────────────────── */

const L = 'a-z0-9áéíóöőúüű'; // a "letter" for word edges (JS \b does not know accents)
const notWord = `(?<![${L}])`;
const endWord = `(?![${L}])`;

/** Top-level domains an obfuscated address may end in. Excludes words such as „it”, „is”, „no”. */
const TLDS = ['hu', 'com', 'net', 'org', 'eu', 'info', 'de', 'nl', 'at', 'sk', 'ro', 'be', 'fr', 'es', 'pl', 'cz', 'ch', 'se', 'dk', 'fi', 'pt', 'gr', 'si', 'hr', 'rs', 'ua', 'uk', 'ru', 'cn', 'io', 'biz'];
const MAIL_HOSTS = 'gmail|googlemail|freemail|citromail|hotmail|outlook|yahoo|icloud|t-online|gmx|vipmail|indamail'; // no plain words („live”, „web”)

const LOCAL = "[a-z0-9][a-z0-9._%+'-]*";
const AT_SIGN = '\\s*@\\s*';
const AT_WORD = `\\s*[([{]\\s*(?:at|kukac)\\s*[)\\]}]\\s*|\\s+(?:kukac|at)\\s+|\\s*-\\s*kukac\\s*-\\s*`;
const DOT_TIGHT = '\\.';
const DOT_LOOSE = `\\s*\\.\\s*|\\s*[([{]\\s*(?:dot|pont)\\s*[)\\]}]\\s*|\\s+(?:dot|pont)\\s+`;
const LABEL = '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?';

const EMAIL = new RegExp(
  `${notWord}(${LOCAL})(${AT_SIGN}|${AT_WORD})(${LABEL}(?:(?:${DOT_LOOSE})${LABEL})*)(?:${DOT_LOOSE})([a-z]{2,})${endWord}`,
  'gi',
);
/** „kovacs.janos gmail pont com”, „gmail.com”: a known mail host counts even without an @. */
const MAIL_HOST = new RegExp(
  `${notWord}(?:${LOCAL}[\\s,]+)?(?:${MAIL_HOSTS})(?:\\s*(?:\\.|pont|dot|[([{]\\s*(?:dot|pont)\\s*[)\\]}])\\s*|\\s+)(?:hu|com|de|nl|co\\.uk)${endWord}`,
  'gi',
);
const URL_SCHEME = /\b(?:https?:\/\/|www\.)[^\s<>"'„”“]+/gi;
const URL_SHORT = new RegExp(`${notWord}(?:wa\\.me|t\\.me|m\\.me|bit\\.ly|linktr\\.ee|(?:facebook|fb|instagram|tiktok|linkedin|youtube|twitter|x)\\.com|youtu\\.be)/[^\\s<>"'„”“]*`, 'gi');
/** A bare domain such as „ingatlanom.hu”. Lower-case, a common TLD, and three letters before it, so „csendes.De” stays a sentence. */
const BARE_DOMAIN = new RegExp(`${notWord}(?:[a-z0-9-]+\\.)*[a-z0-9-]{3,}\\.(?:hu|com|net|org|eu|info)(?![${L}-])(?!\\.[a-z0-9])(?:/[^\\s<>"'„”“]*)?`, 'g');
const MESSENGER = 'viber|whatsapp|whats app|telegram|skype|signal|messenger|instagram|insta|facebook|tiktok';
const HANDLE_AFTER_APP = new RegExp(`${notWord}(?:${MESSENGER})[a-záéíóöőúüű]{0,4}\\s*(?::|-|–)?\\s*@[a-z0-9._]{3,}|${notWord}(?:${MESSENGER})[a-záéíóöőúüű]{0,4}\\s*:\\s*[a-z][a-z0-9._-]{2,}`, 'gi');
const HANDLE_AT = /(?<![\w.@])@[a-z0-9_](?:[a-z0-9_.]*[a-z0-9_])?/gi;

/** A run of digits with phone separators, an optional + / „plusz” in front. */
const PHONE_RUN = /(?:(?:\+|plusz\s+)\s*)?\(?\d(?:[ \t\u00A0\u202F\-–/.()]{0,3}\d)+\)?/gi;

/* Guards: a number followed by a unit or currency, or preceded by a price word, a land-registry or postcode marker. */
const UNIT_AFTER = new RegExp(`^[\\s\\u00A0\\u202F]{0,2}(?:,-\\s*)?(?:ft|huf|forint|€|eur|euró|euro|m2|m²|m\\^2|nm|négyzetméter|négyzetmeter|ha|hektár|hektar|km|m|cm|mm|%|kw|kwh|l|liter|db|fm|mft|m\\s?ft|e\\s?ft|ezer|millió|millio|mio|négyszögöl|nöl|ak|aranykorona)${endWord}`, 'i');
const UNIT_SYMBOL_AFTER = /^[\s\u00A0\u202F]{0,2}(?:€|%|m²|\$|£)/;
const PRICE_BEFORE = new RegExp(`${notWord}(?:ár|ára|áron|irányár|vételár|kikiáltási ár|bérleti díj|díj|rezsi|költség|millió|millio|ezer|m\\s?ft|e\\s?ft|ft|huf|eur|price|asking|prijs|vraagprijs|preis|kaufpreis)${endWord}[^\\d]{0,15}$`, 'i');
const REGISTRY_BEFORE = new RegExp(`${notWord}(?:hrsz|helyrajzi\\s+szám(?:a|ú)?|irsz|irányítószám|isz)${endWord}[^\\d]{0,6}$`, 'i');
const DATE_INSIDE = /(?:^|\D)(?:18|19|20)\d\d\s?[.\-/]\s?(?:0?[1-9]|1[0-2])\s?[.\-/]\s?(?:0?[1-9]|[12]\d|3[01])(?:\D|$)/;

function isYearList(tokens: string[]): boolean {
  return tokens.every((t) => t.length === 4 && +t >= 1800 && +t <= 2099);
}

/** „45 000 000”, „45.000.000”, „45,000,000”: grouped money, not a phone number. */
function isGroupedMoney(raw: string): boolean {
  return /^\(?\d{1,3}(?:[ \u00A0\u202F.,]\d{3})+\)?$/.test(raw.trim());
}

function phoneOf(raw: string, before: string, after: string): boolean {
  const digits = raw.replace(/\D/g, '');
  const plus = /^\s*(?:\+|plusz)/i.test(raw);
  const zeroZero = !plus && digits.startsWith('00');
  const sixty = !plus && !zeroZero && digits.startsWith('06');
  const strong = plus || zeroZero || sixty;
  if (digits.length < 7 || digits.length > 15) return false;
  // Units and currencies win even over a prefix: „06 000 Ft” is a price.
  if (UNIT_AFTER.test(after) || UNIT_SYMBOL_AFTER.test(after)) return false;
  if (REGISTRY_BEFORE.test(before)) return false;
  const tokens = raw.replace(/^\s*(?:\+|plusz)\s*/i, '').split(/[^\d]+/).filter(Boolean);
  if (!strong) {
    if (digits.length < 9) return false;
    if (PRICE_BEFORE.test(before)) return false;
    if (isGroupedMoney(raw)) return false;
    if (isYearList(tokens)) return false;
    if (DATE_INSIDE.test(raw)) return false;
    if (/00000/.test(digits)) return false; // 200000000: a round amount, not a line
  } else if (zeroZero && isYearList(tokens)) return false;
  const international = plus ? '+' + digits : zeroZero ? '+' + digits.slice(2) : null;
  if (international) return parsePhoneNumberFromString(international)?.isValid() === true;
  if (parsePhoneNumberFromString(digits, 'HU')?.isValid()) return true;
  // „36301234567”, „31612345678”: a country code without the +.
  return digits.length >= 10 && parsePhoneNumberFromString('+' + digits)?.isValid() === true;
}

/* ── Search ────────────────────────────────────────────────────────────── */

type Span = { kind: ContactKind; start: number; end: number };

function each(re: RegExp, text: string, fn: (m: RegExpExecArray) => void) {
  re.lastIndex = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    fn(m);
    if (m[0] === '') re.lastIndex++;
  }
}

function trimEnd(text: string, start: number, end: number): number {
  // A sentence-ending full stop, comma or bracket is not part of an address.
  while (end > start && /[.,;:!?)\]}»”'"]/.test(text[end - 1])) end--;
  return end;
}

function spansIn(text: string): Span[] {
  const spans: Span[] = [];

  each(EMAIL, text, (m) => {
    const [whole, local, at, , tld] = m;
    // „info@pelda.hu” is an address whatever the ending; a spelled-out one („kukac”, „pont”, spaces)
    // must end in a real mail domain, so „lives at home. It” stays a sentence.
    const tight = at.includes('@') && /^[a-z0-9.-]+$/i.test(whole.slice(local.length + at.length));
    if (!tight && !TLDS.includes(tld.toLowerCase())) return;
    spans.push({ kind: 'email', start: m.index!, end: m.index! + whole.length });
  });
  each(MAIL_HOST, text, (m) => spans.push({ kind: 'email', start: m.index!, end: m.index! + m[0].length }));
  each(URL_SCHEME, text, (m) => spans.push({ kind: 'url', start: m.index!, end: trimEnd(text, m.index!, m.index! + m[0].length) }));
  each(URL_SHORT, text, (m) => spans.push({ kind: 'url', start: m.index!, end: trimEnd(text, m.index!, m.index! + m[0].length) }));
  each(BARE_DOMAIN, text, (m) => spans.push({ kind: 'url', start: m.index!, end: trimEnd(text, m.index!, m.index! + m[0].length) }));
  each(HANDLE_AFTER_APP, text, (m) => spans.push({ kind: 'handle', start: m.index!, end: trimEnd(text, m.index!, m.index! + m[0].length) }));
  each(HANDLE_AT, text, (m) => spans.push({ kind: 'handle', start: m.index!, end: trimEnd(text, m.index!, m.index! + m[0].length) }));
  each(PHONE_RUN, text, (m) => {
    let start = m.index!;
    let raw = m[0];
    // An unbalanced bracket at either end belongs to the sentence, not the number.
    if (raw.startsWith('(') && !raw.includes(')')) { raw = raw.slice(1); start++; }
    if (raw.endsWith(')') && !raw.includes('(')) raw = raw.slice(0, -1);
    const end = start + raw.length;
    if (phoneOf(raw, text.slice(Math.max(0, start - 40), start), text.slice(end, end + 16))) spans.push({ kind: 'phone', start, end });
  });
  return spans;
}

/** Drops what an e-mail address already covers (its domain is not also a website) and repeats of one kind. */
function settle(spans: Span[]): Span[] {
  const emails = spans.filter((s) => s.kind === 'email');
  const overlaps = (a: Span, b: Span) => a.start < b.end && b.start < a.end;
  const kept: Span[] = [];
  for (const span of spans.sort((a, b) => a.start - b.start || b.end - a.end)) {
    if (span.kind !== 'email' && emails.some((e) => overlaps(e, span))) continue;
    if (kept.some((k) => k.kind === span.kind && overlaps(k, span))) continue;
    // A handle inside a URL („instagram.com/@nev”) is the same channel.
    if (span.kind === 'handle' && kept.some((k) => k.kind === 'url' && overlaps(k, span))) continue;
    kept.push(span);
  }
  return kept;
}

/** Every contact detail in the text, in order of appearance. */
export function findContacts(text: string): ContactHit[] {
  if (!text) return [];
  const n = normalise(text);
  return settle(spansIn(n.text)).map((span) => {
    const start = n.at[span.start];
    const last = n.at[span.end - 1];
    const end = last + (text.codePointAt(last)! > 0xffff ? 2 : 1);
    return { kind: span.kind, match: text.slice(start, end), index: start };
  });
}

/** The first hit of each field as a validation error, e.g. `{ description: { code: 'contact-phone', match: '06 30 123 4567' } }`. */
export function contactErrors(fields: Record<string, string | null | undefined>): Record<string, { code: ContactCode; match: string }> {
  const errors: Record<string, { code: ContactCode; match: string }> = {};
  for (const [name, value] of Object.entries(fields)) {
    const hit = findContacts(value ?? '')[0];
    if (hit) errors[name] = { code: contactCode(hit.kind), match: hit.match.length > 60 ? hit.match.slice(0, 57) + '…' : hit.match };
  }
  return errors;
}
