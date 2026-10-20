/**
 * Field validation shared by the browser and the server.
 *
 * One module, imported by FormShell's script (inline, on blur and on submit)
 * and by src/lib/form-handler.ts (on every POST), so a rule can never differ
 * between the two: what the page accepts is exactly what the endpoint
 * accepts, and the error wording is the same sentence in both places.
 *
 * Errors are specific and in the visitor's language — "Adjon meg egy érvényes
 * holland telefonszámot, pl. +31 6 12345678", never "Invalid". Phone numbers
 * use libphonenumber-js with the small (`min`) metadata, and are stored in
 * E.164 (+31612345678) so the office, the CRM and WhatsApp all read the same
 * string.
 *
 * Pure and dependency-light on purpose: no DOM, no Astro, no database.
 * Unit-tested in scripts/test-rules.mjs.
 */
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/min';
import examples from 'libphonenumber-js/mobile/examples';

export type FormLocale = 'hu' | 'nl';

export type ErrorCode =
  | 'required'
  | 'email'
  | 'phone'
  | 'postcode'
  | 'number'
  | 'min'
  | 'max'
  | 'url'
  | 'too-long'
  | 'min-length'
  | 'consent';

export type FieldError = { code: ErrorCode; country?: string; example?: string; limit?: number };

/* ── Phone ─────────────────────────────────────────────────────────────── */

/** Shown first in the country picker: where FODEL's sellers and buyers live. */
export const COMMON_PHONE_COUNTRIES = ['HU', 'NL', 'BE', 'DE', 'AT', 'GB', 'FR', 'CH', 'SK', 'RO', 'HR', 'SI'] as const;

export function defaultPhoneCountry(locale: string): CountryCode {
  return locale === 'nl' ? 'NL' : 'HU';
}

export function isPhoneCountry(value: unknown): value is CountryCode {
  return typeof value === 'string' && (getCountries() as string[]).includes(value);
}

export function dialCode(country: CountryCode): string {
  return `+${getCountryCallingCode(country)}`;
}

/**
 * The example a placeholder and an error message show. The library's own
 * mobile example for every country, except Hungary, where a 30-prefix
 * number is the one people recognise as a mobile.
 */
export function phoneExample(country: CountryCode): string {
  if (country === 'HU') return '+36 30 123 4567';
  return getExampleNumber(country, examples)?.formatInternational() ?? dialCode(country);
}

export type PhoneResult = { ok: true; e164: string; country: CountryCode | undefined; display: string } | { ok: false };

/**
 * A number as someone typed it → E.164. A leading + or 00 wins over the
 * picked country (a Dutch number typed in full while "HU" is selected is
 * still a Dutch number); otherwise the picked country supplies the prefix.
 */
export function normalizePhone(raw: string, country: CountryCode): PhoneResult {
  const text = (raw ?? '').trim().replace(/^00/, '+');
  if (!text) return { ok: false };
  const parsed = text.startsWith('+') ? parsePhoneNumberFromString(text) : parsePhoneNumberFromString(text, country);
  if (!parsed || !parsed.isValid()) return { ok: false };
  return { ok: true, e164: parsed.number, country: parsed.country, display: parsed.formatInternational() };
}

/** Formats a partial number for display while it is being typed. */
export function formatPhoneAsYouType(raw: string, country: CountryCode): string {
  const text = raw.replace(/^00/, '+');
  return text.startsWith('+') ? new AsYouType().input(text) : new AsYouType(country).input(text);
}

/** Which country a number typed with its own prefix belongs to, if any. */
export function countryOfNumber(raw: string): CountryCode | undefined {
  const text = raw.trim().replace(/^00/, '+');
  if (!text.startsWith('+')) return undefined;
  const typer = new AsYouType();
  typer.input(text);
  return typer.getCountry();
}

/* ── Postcodes ─────────────────────────────────────────────────────────── */

/**
 * The format of a postcode per country, with the example shown in the hint.
 * Only countries whose format is simple and certain are checked; anywhere
 * else any non-empty postcode is accepted rather than wrongly refused.
 */
export const POSTCODES: Record<string, { pattern: RegExp; example: string }> = {
  HU: { pattern: /^\d{4}$/, example: '1051' },
  NL: { pattern: /^\d{4}\s?[A-Za-z]{2}$/, example: '1234 AB' },
  BE: { pattern: /^\d{4}$/, example: '1000' },
  AT: { pattern: /^\d{4}$/, example: '1010' },
  CH: { pattern: /^\d{4}$/, example: '8001' },
  DK: { pattern: /^\d{4}$/, example: '1050' },
  LU: { pattern: /^(L-)?\d{4}$/i, example: '1009' },
  SI: { pattern: /^\d{4}$/, example: '1000' },
  DE: { pattern: /^\d{5}$/, example: '10115' },
  FR: { pattern: /^\d{5}$/, example: '75001' },
  ES: { pattern: /^\d{5}$/, example: '28001' },
  IT: { pattern: /^\d{5}$/, example: '00118' },
  HR: { pattern: /^\d{5}$/, example: '10000' },
  FI: { pattern: /^\d{5}$/, example: '00100' },
  SK: { pattern: /^\d{3}\s?\d{2}$/, example: '811 01' },
  CZ: { pattern: /^\d{3}\s?\d{2}$/, example: '110 00' },
  PL: { pattern: /^\d{2}-\d{3}$/, example: '00-950' },
  RO: { pattern: /^\d{6}$/, example: '010011' },
  GB: { pattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/, example: 'SW1A 1AA' },
};

export function postcodeExample(country: string): string | undefined {
  return POSTCODES[country]?.example;
}

/** Tidies a valid postcode into its usual written form ("1234ab" → "1234 AB"). */
export function normalizePostcode(value: string, country: string): string {
  const v = value.trim();
  if (country === 'NL') return v.replace(/^(\d{4})\s?([A-Za-z]{2})$/, (_, d, l) => `${d} ${l.toUpperCase()}`);
  if (country === 'GB') return v.toUpperCase().replace(/^(.+?)\s?(\d[A-Z]{2})$/, '$1 $2');
  return v;
}

/* ── One field ─────────────────────────────────────────────────────────── */

export type FieldRule = 'text' | 'email' | 'phone' | 'postcode' | 'number' | 'url';

export type FieldSpec = {
  rule?: FieldRule;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

/**
 * Parses a number the way people write it in Hungary and the Netherlands:
 * spaces or dots group thousands ("1 200 000", "1.200.000"), a comma or dot
 * followed by one or two digits at the end is a decimal.
 */
export function parseLocaleNumber(value: string): number | null {
  const raw = value.trim();
  if (!raw) return null;
  if (!/^[\d\s.,]+$/.test(raw)) return null;
  const decimal = raw.match(/[.,](\d{1,2})$/);
  const whole = (decimal ? raw.slice(0, decimal.index) : raw).replace(/[\s.,]/g, '');
  if (!/^\d+$/.test(whole)) return null;
  const n = Number(decimal ? `${whole}.${decimal[1]}` : whole);
  return Number.isFinite(n) ? n : null;
}

/** The number as the machine reads it ("250.000" and "250 000" are both 250000); unreadable input comes back unchanged. */
export function normalizeNumber(raw: string): string {
  const value = (raw ?? '').trim();
  const n = /^-?\d+(\.\d+)?$/.test(value) && !/^\d{1,3}\.\d{3}$/.test(value) ? Number(value) : parseLocaleNumber(value);
  return n === null || !Number.isFinite(n) ? value : String(n);
}

/** `country` is the phone picker's country, or the address's country for a postcode. */
export function validateField(spec: FieldSpec, raw: string, country?: string): FieldError | null {
  const value = (raw ?? '').trim();
  if (!value) return spec.required ? { code: 'required' } : null;
  if (spec.maxLength && value.length > spec.maxLength) return { code: 'too-long', limit: spec.maxLength };
  if (spec.minLength && value.length < spec.minLength) return { code: 'min-length', limit: spec.minLength };

  switch (spec.rule) {
    case 'email':
      return EMAIL_RE.test(value) ? null : { code: 'email' };
    case 'phone': {
      const c = isPhoneCountry(country) ? country : 'HU';
      if (normalizePhone(value, c).ok) return null;
      const typed = countryOfNumber(value) ?? c;
      return { code: 'phone', country: typed, example: phoneExample(typed) };
    }
    case 'postcode': {
      const format = country ? POSTCODES[country] : undefined;
      return !format || format.pattern.test(value) ? null : { code: 'postcode', country, example: format.example };
    }
    case 'number': {
      // A plain machine number ("47.1625", "-3") is read as one; anything else
      // the way people write amounts ("64.000.000", "1 200 000", "12,5").
      const n = /^-?\d+(\.\d+)?$/.test(value) && !/^\d{1,3}\.\d{3}$/.test(value) ? Number(value) : parseLocaleNumber(value);
      if (n === null) return { code: 'number' };
      if (spec.min !== undefined && n < spec.min) return { code: 'min', limit: spec.min };
      if (spec.max !== undefined && n > spec.max) return { code: 'max', limit: spec.max };
      return null;
    }
    case 'url':
      try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ? null : { code: 'url' };
      } catch {
        return { code: 'url' };
      }
    default:
      return null;
  }
}

/* ── Wording ───────────────────────────────────────────────────────────── */

/** "holland telefonszámot" / "Nederlands telefoonnummer" — the adjective per country. */
const ADJECTIVE: Record<string, Record<FormLocale, string>> = {
  HU: { hu: 'magyar', nl: 'Hongaars' },
  NL: { hu: 'holland', nl: 'Nederlands' },
  BE: { hu: 'belga', nl: 'Belgisch' },
  DE: { hu: 'német', nl: 'Duits' },
  AT: { hu: 'osztrák', nl: 'Oostenrijks' },
  GB: { hu: 'brit', nl: 'Brits' },
  FR: { hu: 'francia', nl: 'Frans' },
  CH: { hu: 'svájci', nl: 'Zwitsers' },
  SK: { hu: 'szlovák', nl: 'Slowaaks' },
  RO: { hu: 'román', nl: 'Roemeens' },
  HR: { hu: 'horvát', nl: 'Kroatisch' },
  SI: { hu: 'szlovén', nl: 'Sloveens' },
  LU: { hu: 'luxemburgi', nl: 'Luxemburgs' },
  DK: { hu: 'dán', nl: 'Deens' },
  ES: { hu: 'spanyol', nl: 'Spaans' },
  IT: { hu: 'olasz', nl: 'Italiaans' },
  PL: { hu: 'lengyel', nl: 'Pools' },
  CZ: { hu: 'cseh', nl: 'Tsjechisch' },
};

const nf = (locale: FormLocale, n: number) => n.toLocaleString(locale === 'hu' ? 'hu-HU' : 'nl-NL');

export function errorMessage(error: FieldError, locale: FormLocale): string {
  const hu = locale === 'hu';
  const adj = error.country ? ADJECTIVE[error.country]?.[locale] : undefined;
  const eg = error.example ? (hu ? `, pl. ${error.example}` : `, bijv. ${error.example}`) : '';
  switch (error.code) {
    case 'required':
      return hu ? 'Kérjük, töltse ki ezt a mezőt.' : 'Vul dit veld in.';
    case 'email':
      return hu ? 'Adjon meg egy érvényes e-mail-címet, pl. nev@example.com.' : 'Vul een geldig e-mailadres in, bijv. naam@voorbeeld.nl.';
    case 'phone':
      return hu
        ? `Adjon meg egy érvényes ${adj ? `${adj} ` : ''}telefonszámot${eg}.`
        : `Vul een geldig ${adj ? `${adj} ` : ''}telefoonnummer in${eg}.`;
    case 'postcode':
      return hu ? `Adjon meg egy érvényes irányítószámot${eg}.` : `Vul een geldige postcode in${eg}.`;
    case 'number':
      return hu ? 'Csak számot adjon meg, pl. 120.' : 'Vul alleen een getal in, bijv. 120.';
    case 'min':
      return hu ? `Legalább ${nf(locale, error.limit ?? 0)} legyen.` : `Minimaal ${nf(locale, error.limit ?? 0)}.`;
    case 'max':
      return hu ? `Legfeljebb ${nf(locale, error.limit ?? 0)} lehet.` : `Maximaal ${nf(locale, error.limit ?? 0)}.`;
    case 'url':
      return hu ? 'Adjon meg egy teljes webcímet, pl. https://www.youtube.com/…' : 'Vul een volledig webadres in, bijv. https://www.youtube.com/…';
    case 'too-long':
      return hu ? `Legfeljebb ${error.limit} karakter lehet.` : `Maximaal ${error.limit} tekens.`;
    case 'min-length':
      return hu ? `Legalább ${error.limit} karakter legyen.` : `Minimaal ${error.limit} tekens.`;
    case 'consent':
      return hu ? 'A folytatáshoz kérjük, fogadja el az adatkezelési tájékoztatót.' : 'Ga akkoord met de privacyverklaring om verder te gaan.';
  }
}

/** The heading of the summary shown above a form that failed to submit. */
export function summaryHeading(count: number, locale: FormLocale): string {
  if (locale === 'hu') return count === 1 ? 'Egy mezőt még javítani kell:' : `${count} mezőt még javítani kell:`;
  return count === 1 ? 'Nog één veld controleren:' : `Nog ${count} velden controleren:`;
}
