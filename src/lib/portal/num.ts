/**
 * Numbers in the admin portal: always „1.000.000” — dot grouping, comma
 * decimals („1.234,50”), whatever the browser's language (spec §7). The
 * public site keeps each language's own typography (src/lib/format.ts).
 *
 * Pure and dependency-free, so the browser scripts (MoneyInput) and the
 * server share exactly one implementation.
 */
import { parseLocaleNumber } from '~/lib/parse-number';

const GROUP = '.';
const DECIMAL = ',';
const NBSP = '\u00a0';

/** Digits of a non-negative integer, grouped with dots. */
function groupDigits(digits: string): string {
  return digits.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, GROUP);
}

/**
 * „1.000.000”. Whole numbers only (rounded); for amounts with cents use
 * `fmtDecimal`. Not a number → „–”.
 */
export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '–';
  const rounded = Math.round(n);
  return (rounded < 0 ? '-' : '') + groupDigits(String(Math.abs(rounded)));
}

/** „1.234,5” / „1.234,56”: up to `digits` decimals, trailing zeros dropped (`fixed` keeps them). */
export function fmtDecimal(n: number | null | undefined, opts: { digits?: number; fixed?: boolean } = {}): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '–';
  const digits = opts.digits ?? 2;
  const [whole, fraction = ''] = Math.abs(n).toFixed(digits).split('.');
  const shown = opts.fixed ? fraction : fraction.replace(/0+$/, '');
  const sign = n < 0 && Number(Math.abs(n).toFixed(digits)) !== 0 ? '-' : '';
  return sign + groupDigits(whole) + (shown ? DECIMAL + shown : '');
}

/** „150.000.000 Ft”. */
export function fmtHuf(n: number | null | undefined): string {
  return `${fmtInt(n)}${NBSP}Ft`;
}

/**
 * „1.000 €”, the Hungarian order (the portal is Hungarian). `cents: true`
 * reads `n` as euro cents and always shows two decimals („129,00 €”); a whole
 * euro amount shows none.
 */
export function fmtEur(n: number | null | undefined, opts: { cents?: boolean } = {}): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return `–${NBSP}€`;
  if (opts.cents) return `${fmtDecimal(n / 100, { digits: 2, fixed: true })}${NBSP}€`;
  return `${Number.isInteger(n) ? fmtInt(n) : fmtDecimal(n, { digits: 2, fixed: true })}${NBSP}€`;
}

/** Just the digits (and one decimal comma when cents are allowed) of what someone typed or pasted. */
export function moneyDigits(raw: string, allowCents = false): string {
  const text = String(raw ?? '');
  if (!allowCents) return text.replace(/\D/g, '');
  // The last comma (or a dot followed by 1–2 digits at the very end) is the decimal mark.
  const decimal = text.match(/[,](\d{0,2})\D*$/) ?? text.match(/[.](\d{1,2})\D*$/);
  if (!decimal) return text.replace(/\D/g, '');
  const whole = text.slice(0, decimal.index).replace(/\D/g, '');
  return `${whole}${DECIMAL}${decimal[1]}`;
}

/** What the visible money field shows for `digits` (from moneyDigits): „1.500.000”, „1.234,5”. */
export function formatMoneyText(digits: string, allowCents = false): string {
  if (!digits) return '';
  if (allowCents && digits.includes(DECIMAL)) {
    const [whole, fraction] = digits.split(DECIMAL);
    return `${groupDigits(whole || '0')}${DECIMAL}${fraction}`;
  }
  return groupDigits(digits);
}

/**
 * The raw value the hidden field posts: an integer string, or cents with
 * `allowCents` („1.234,5” → „123450”). Empty → ''.
 */
export function rawMoney(digits: string, allowCents = false): string {
  if (!digits) return '';
  if (!allowCents) return String(Number(digits.replace(/\D/g, '')));
  const [whole, fraction = ''] = digits.split(DECIMAL);
  return String(Number(whole || '0') * 100 + Number((fraction + '00').slice(0, 2)));
}

export type MoneyIssue = 'required' | 'integer' | 'invalid' | 'min' | 'max';

export const MONEY_MESSAGES: Record<MoneyIssue, string> = {
  required: 'Kérjük, adja meg az összeget.',
  integer: 'Kérjük, egész számot adjon meg.',
  invalid: 'Ezt nem tudjuk számként értelmezni.',
  min: 'Az összeg túl kicsi.',
  max: 'Az összeg túl nagy.',
};

export type MoneyOptions = {
  min?: number;
  max?: number;
  /** Return cents (and accept „129,50”); otherwise decimals are refused. */
  cents?: boolean;
  required?: boolean;
  /** For a plain string: it came from MoneyInput's hidden field, so it is already in the final unit. */
  raw?: boolean;
};

export type MoneyResult = { ok: true; value: number | null } | { ok: false; issue: MoneyIssue; message: string };

/**
 * Reads a MoneyInput's posted value. With JavaScript the hidden field posts
 * the raw integer (cents with `cents`); without it the visible text arrives
 * („1.500.000”, „1 500 000 Ft”, „129,50 €”) and is parsed the way people
 * write it — never with Number(), which reads „1.500” as 1.5.
 *
 * `cents`: the value is returned in cents. Otherwise a decimal is refused
 * („Kérjük, egész számot adjon meg.”). Bounds are in the returned unit.
 */
export function readMoney(
  input: FormData | string | null | undefined,
  name?: string,
  opts: MoneyOptions = {}
): MoneyResult {
  const raw = (input instanceof FormData ? String(input.get(name ?? '') ?? '') : String(input ?? '')).trim();
  const isRaw = input instanceof FormData ? isRawField(input, name) : Boolean(opts.raw);
  const fail = (issue: MoneyIssue): MoneyResult => ({ ok: false, issue, message: MONEY_MESSAGES[issue] });
  if (!raw) return opts.required ? fail('required') : { ok: true, value: null };
  if (/^-/.test(raw)) return fail('min');
  // The hidden field: digits only, already in the final unit.
  let value: number | null;
  if (/^\d+$/.test(raw) && isRaw) {
    value = Number(raw);
  } else {
    const text = raw.replace(/\s*(Ft|HUF|EUR|€)\s*/gi, '').replace(/^€/, '').trim();
    const parsed = parseLocaleNumber(text);
    if (parsed === null) return fail('invalid');
    if (!opts.cents && !Number.isInteger(parsed)) return fail('integer');
    value = opts.cents ? Math.round(parsed * 100) : parsed;
  }
  if (!Number.isFinite(value)) return fail('invalid');
  if (opts.min !== undefined && value < opts.min) return fail('min');
  if (opts.max !== undefined && value > opts.max) return fail('max');
  return { ok: true, value };
}

/** The MoneyInput marks its hidden field with `<name>__raw=1`, so the server knows the value is already raw. */
function isRawField(form: FormData, name?: string): boolean {
  return form.get(`${name ?? ''}__raw`) === '1';
}

/** Every value posted under `name` (a repeated MoneyInput, e.g. one per tier row), in order. */
export function readMoneyAll(form: FormData, name: string, opts: Omit<MoneyOptions, 'raw'> = {}): MoneyResult[] {
  const raw = isRawField(form, name);
  return form.getAll(name).map((value) => readMoney(String(value), undefined, { ...opts, raw }));
}

/* ── The owner's listing price (spec §7.4): grouped in the owner's portal language ── */

/** hu and nl group with dots and use a decimal comma; en groups with commas and uses a decimal point. */
export function amountSeparators(locale: string): { group: string; decimal: string } {
  return locale === 'en' ? { group: ',', decimal: '.' } : { group: '.', decimal: ',' };
}

/**
 * Regroups what an owner is typing into the price field: „1500000” → „1.500.000”
 * (en: „1,500,000”), keeping up to two decimals after the locale's decimal mark.
 * The server and the client read the result with parseLocaleNumber(), so the
 * stored value stays the raw number.
 */
export function groupAmountTyping(text: string, locale: string): string {
  const { group, decimal } = amountSeparators(locale);
  const clean = text.replace(/[^\d.,]/g, '');
  if (!clean) return '';
  // The decimal mark is the locale's own, and only when at most two digits follow it.
  const at = clean.lastIndexOf(decimal);
  const tail = at >= 0 ? clean.slice(at + 1) : '';
  const hasDecimal = at >= 0 && /^\d{0,2}$/.test(tail);
  const whole = (hasDecimal ? clean.slice(0, at) : clean).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return hasDecimal ? `${grouped || '0'}${decimal}${tail}` : grouped;
}

/** A stored price shown in the owner's grouping („1.500.000”, „1,500,000.5”); none → ''. */
export function formatAmount(value: number | null | undefined, locale: string): string {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) return '';
  const { decimal } = amountSeparators(locale);
  const [whole, fraction = ''] = String(Math.round(value * 100) / 100).split('.');
  return groupAmountTyping(fraction ? `${whole}${decimal}${fraction}` : whole, locale);
}
