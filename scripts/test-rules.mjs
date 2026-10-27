/**
 * Unit checks for the pure rules behind the quote-completion round:
 * expiry date maths, the cron's decisions, overdue invoices, signed action
 * tokens, the adobe filter, the phone visibility rule, the approximate
 * location offset and the map's price pill.
 *
 *   npm run test:rules
 *
 * Imports the TypeScript sources directly (Node ≥ 22.18 strips types), so the
 * functions tested here are the ones the site runs — no copies.
 */
import assert from 'node:assert/strict';
import {
  addMonths, renewedExpiry, isExpired, daysLeft, expiryAction, refreshAction, isUnresponsive,
  listingRules, LISTING_RULES_DEFAULT, showSellerPhone, passesAdobeFilter, approximateCentre, compactEur,
} from '../src/lib/listing-rules.ts';
import { isOverdue } from '../src/lib/invoicing/model.ts';
import { signWith, verifyWith } from '../src/lib/valuation/action-token.ts';
import { cronAuthorised } from '../src/lib/cron-auth.ts';
import {
  validateField, normalizePhone, normalizePostcode, normalizeNumber, parseLocaleNumber,
  defaultPhoneCountry, countryOfNumber, formatPhoneAsYouType,
} from '../src/lib/validation.ts';
import { errorMessage } from '../src/lib/validation-server.ts';
import { LOCALES, ROUTES, UI, path, localizer, localeFrom, isLocale } from '../src/i18n/ui.ts';
import { eur, huf, area, grouped, placeLabel } from '../src/lib/format.ts';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { withRetry, withTimeout, isRetryable, retryDelay } from '../src/lib/email/retry.ts';

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}\n    ${error.message}`);
    process.exitCode = 1;
  }
};
const d = (iso) => new Date(iso);
const DAY = 86_400_000;
const rules = LISTING_RULES_DEFAULT;

console.log('Expiry date maths');
test('6 months from 31 Aug clamps to 28 Feb', () => assert.equal(addMonths(d('2026-08-31T10:00:00Z'), 6).toISOString(), '2027-02-28T10:00:00.000Z'));
test('12 months keeps the day', () => assert.equal(addMonths(d('2026-10-14T09:00:00Z'), 12).toISOString(), '2027-10-14T09:00:00.000Z'));
test('leap day + 12 months → 28 Feb', () => assert.equal(addMonths(d('2028-02-29T00:00:00Z'), 12).toISOString(), '2029-02-28T00:00:00.000Z'));
test('early renewal adds to the current expiry', () =>
  assert.equal(renewedExpiry(d('2026-11-01T00:00:00Z'), d('2026-10-14T00:00:00Z'), 6).toISOString(), '2027-05-01T00:00:00.000Z'));
test('late renewal counts from today', () =>
  assert.equal(renewedExpiry(d('2026-09-01T00:00:00Z'), d('2026-10-14T00:00:00Z'), 6).toISOString(), '2027-04-14T00:00:00.000Z'));
test('isExpired at and after the instant, not before', () => {
  const now = d('2026-10-14T12:00:00Z');
  assert.equal(isExpired('2026-10-14T12:00:00Z', now), true);
  assert.equal(isExpired('2026-10-14T12:00:01Z', now), false);
  assert.equal(isExpired(null, now), false);
});
test('daysLeft rounds up', () => assert.equal(daysLeft('2026-10-16T13:00:00Z', d('2026-10-14T12:00:00Z')), 3));

console.log('Cron: expiry');
const now = d('2026-10-14T07:00:00Z');
const inDays = (n) => new Date(now.getTime() + n * DAY).toISOString();
test('nothing 20 days out', () => assert.equal(expiryAction({ expires_at: inDays(20) }, rules, now), null));
test('first reminder at 14 days', () => assert.equal(expiryAction({ expires_at: inDays(14) }, rules, now), 'first-reminder'));
test('first reminder never twice', () => assert.equal(expiryAction({ expires_at: inDays(10), expiry_first_reminder_sent_at: inDays(-4) }, rules, now), null));
test('last reminder at 3 days', () => assert.equal(expiryAction({ expires_at: inDays(3), expiry_first_reminder_sent_at: inDays(-11) }, rules, now), 'last-reminder'));
test('last reminder never twice', () => assert.equal(expiryAction({ expires_at: inDays(2), expiry_first_reminder_sent_at: 'x', expiry_last_reminder_sent_at: 'x' }, rules, now), null));
test('expire once past', () => assert.equal(expiryAction({ expires_at: inDays(-0.01) }, rules, now), 'expire'));
test('settings: first/last swapped are put in order', () => assert.deepEqual(listingRules({ expiry: { firstReminderDays: 3, lastReminderDays: 14 } }).expiry, { firstReminderDays: 14, lastReminderDays: 3 }));
test('settings: nonsense falls back to defaults', () => assert.deepEqual(listingRules({ ownerRefresh: { intervalDays: -5, enabled: 'yes' } }).ownerRefresh, rules.ownerRefresh));

console.log('Cron: monthly owner refresh');
test('first request 30 days after publication', () => assert.equal(refreshAction({ published_at: inDays(-30) }, rules, now), 'request'));
test('no request at 29 days', () => assert.equal(refreshAction({ published_at: inDays(-29) }, rules, now), null));
test('reminder after 7 days unanswered', () => assert.equal(refreshAction({ published_at: inDays(-40), refresh_requested_at: inDays(-7) }, rules, now), 'reminder'));
test('reminder only once', () => assert.equal(refreshAction({ published_at: inDays(-40), refresh_requested_at: inDays(-8), refresh_reminder_sent_at: inDays(-1) }, rules, now), null));
test('a second run the same day sends nothing new', () => assert.equal(refreshAction({ published_at: inDays(-40), refresh_requested_at: now.toISOString() }, rules, now), null));
test('answered: next request 30 days after the answer', () => {
  const row = { published_at: inDays(-90), refresh_requested_at: inDays(-40), confirmed_at: inDays(-35) };
  assert.equal(refreshAction(row, rules, now), 'request');
  assert.equal(refreshAction({ ...row, confirmed_at: inDays(-20) }, rules, now), null);
});
test('flag "Nem válaszolt" after 14 days, never before', () => {
  assert.equal(isUnresponsive({ refresh_requested_at: inDays(-14) }, rules, now), true);
  assert.equal(isUnresponsive({ refresh_requested_at: inDays(-13) }, rules, now), false);
  assert.equal(isUnresponsive({ refresh_requested_at: inDays(-20), confirmed_at: inDays(-19) }, rules, now), false);
});
test('master switch off: nothing is sent', () => assert.equal(refreshAction({ published_at: inDays(-90) }, listingRules({ ownerRefresh: { enabled: false } }), now), null));

console.log('Overdue invoices');
test('issued, past due → overdue', () => assert.equal(isOverdue({ status: 'issued', kind: 'invoice', dueDate: '2026-10-13' }, '2026-10-14'), true));
test('sent, past due → overdue', () => assert.equal(isOverdue({ status: 'sent', kind: 'invoice', dueDate: '2026-10-01' }, '2026-10-14'), true));
test('due today is not overdue', () => assert.equal(isOverdue({ status: 'sent', kind: 'invoice', dueDate: '2026-10-14' }, '2026-10-14'), false));
test('paid, void, draft are never overdue', () => {
  for (const status of ['paid', 'void', 'draft']) assert.equal(isOverdue({ status, kind: 'invoice', dueDate: '2020-01-01' }, '2026-10-14'), false);
});
test('credit notes are never overdue', () => assert.equal(isOverdue({ status: 'issued', kind: 'credit_note', dueDate: '2020-01-01' }, '2026-10-14'), false));
test('no due date → not overdue', () => assert.equal(isOverdue({ status: 'issued', kind: 'invoice', dueDate: null }, '2026-10-14'), false));

console.log('Signed action tokens');
const key = 'test-secret';
const id = '6b3f1c2e-0000-4000-8000-000000000001';
const nowSec = 1_800_000_000;
const token = signWith(key, 'sold', id, nowSec + 3600);
test('valid token verifies', () => assert.equal(verifyWith(key, 'sold', id, token, nowSec), true));
test('expired token is refused', () => assert.equal(verifyWith(key, 'sold', id, token, nowSec + 3601), false));
test('token for another action is refused', () => assert.equal(verifyWith(key, 'still-available', id, token, nowSec), false));
test('token for another listing is refused', () => assert.equal(verifyWith(key, 'sold', id.replace(/1$/, '2'), token, nowSec), false));
test('tampered expiry is refused', () => {
  const [, mac] = token.split('.');
  assert.equal(verifyWith(key, 'sold', id, `${(nowSec + 999999).toString(36)}.${mac}`, nowSec), false);
});
test('other secret is refused; garbage is refused', () => {
  assert.equal(verifyWith('other', 'sold', id, token, nowSec), false);
  assert.equal(verifyWith(key, 'sold', id, 'nonsense', nowSec), false);
  assert.equal(verifyWith(key, 'sold', id, '', nowSec), false);
});
test('cron: only the exact bearer secret', () => {
  assert.equal(cronAuthorised('Bearer s3cret', 's3cret'), true);
  assert.equal(cronAuthorised('Bearer s3cret ', 's3cret'), false);
  assert.equal(cronAuthorised(null, 's3cret'), false);
  assert.equal(cronAuthorised('Bearer ', ''), false);
  assert.equal(cronAuthorised('Bearer undefined', undefined), false);
});

console.log('Adobe filter');
test('off: everything passes', () => assert.equal(passesAdobeFilter('valyog', false), true));
test('on: adobe removed', () => assert.equal(passesAdobeFilter('valyog', true), false));
test('on: unknown and unset stay', () => {
  assert.equal(passesAdobeFilter('nem-tudom', true), true);
  assert.equal(passesAdobeFilter(null, true), true);
  assert.equal(passesAdobeFilter(undefined, true), true);
});
test('on: other materials stay', () => assert.equal(passesAdobeFilter('tegla', true), true));

console.log('Phone visibility');
const listing = (pkg, contactVisible, phone = '+36 30 123 4567') => ({ package: pkg, contactVisible, phone });
test('Kiemelt + consent → shown', () => assert.equal(showSellerPhone(listing('normal-12m', true), rules), true));
test('Kiemelt without consent → hidden', () => assert.equal(showSellerPhone(listing('normal-12m', false), rules), false));
test('Standard + consent → hidden by default', () => assert.equal(showSellerPhone(listing('cheap-6m', true), rules), false));
test('Standard allowed in settings + consent → shown', () => assert.equal(showSellerPhone(listing('cheap-6m', true), listingRules({ packagePhone: { 'cheap-6m': true } })), true));
test('no phone number → hidden', () => assert.equal(showSellerPhone(listing('normal-12m', true, '  '), rules), false));

console.log('Approximate location and price pill');
test('offset is deterministic and 250–650 m away', () => {
  const a = approximateCentre(id, 46.79, 17.49);
  assert.deepEqual(a, approximateCentre(id, 46.79, 17.49));
  const metres = Math.hypot((a.lat - 46.79) * 111_320, (a.lng - 17.49) * 111_320 * Math.cos((46.79 * Math.PI) / 180));
  assert.ok(metres >= 240 && metres <= 660, `${metres.toFixed(0)} m`);
});
test('different listings get different offsets', () => assert.notDeepEqual(approximateCentre(id, 46.79, 17.49), approximateCentre(id.replace(/1$/, '7'), 46.79, 17.49)));
test('compact prices', () => {
  assert.equal(compactEur(178_000), '€178k');
  assert.equal(compactEur(999_600), '€1M');
  assert.equal(compactEur(1_250_000), '€1.25M');
  assert.equal(compactEur(12_000_000), '€12M');
  assert.equal(compactEur(950), '€950');
});

console.log('Phone numbers');
test('Hungarian national number → E.164', () => assert.equal(normalizePhone('06 30 123 4567', 'HU').e164, '+36301234567'));
test('Dutch mobile with the picker on NL', () => assert.equal(normalizePhone('06 12345678', 'NL').e164, '+31612345678'));
test('an international prefix wins over the picked country', () => {
  const r = normalizePhone('+31 6 12345678', 'HU');
  assert.equal(r.e164, '+31612345678');
  assert.equal(r.country, 'NL');
});
test('00 prefix is read as +', () => assert.equal(normalizePhone('0036 30 123 4567', 'NL').e164, '+36301234567'));
test('too short is rejected', () => assert.equal(normalizePhone('12345', 'HU').ok, false));
test('letters are rejected', () => assert.equal(normalizePhone('abc', 'HU').ok, false));
test('required and optional', () => {
  assert.equal(validateField({ rule: 'phone', required: true }, '', 'HU')?.code, 'required');
  assert.equal(validateField({ rule: 'phone' }, '', 'HU'), null);
});
test('the error names the country and gives an example', () => {
  const e = validateField({ rule: 'phone' }, '123', 'NL');
  assert.match(errorMessage(e, 'hu'), /holland/);
  assert.match(errorMessage(e, 'nl'), /\+31/);
});
test('default country follows the language', () => {
  assert.equal(defaultPhoneCountry('hu'), 'HU');
  assert.equal(defaultPhoneCountry('nl'), 'NL');
  assert.equal(defaultPhoneCountry('en'), 'GB');
  assert.equal(defaultPhoneCountry('de'), 'DE');
  assert.equal(defaultPhoneCountry('fr'), 'FR');
  assert.equal(defaultPhoneCountry('es'), 'ES');
  assert.equal(defaultPhoneCountry('pl'), 'PL');
  assert.equal(defaultPhoneCountry('ro'), 'RO');
  assert.equal(defaultPhoneCountry('sk'), 'SK');
  assert.equal(defaultPhoneCountry('it'), 'IT');
  assert.equal(defaultPhoneCountry('pt'), 'PT');
  assert.equal(defaultPhoneCountry('el'), 'GR');
  assert.equal(defaultPhoneCountry('cs'), 'CZ');
  assert.equal(defaultPhoneCountry('sl'), 'SI');
  assert.equal(defaultPhoneCountry('sv'), 'SE');
  assert.equal(defaultPhoneCountry('da'), 'DK');
  assert.equal(defaultPhoneCountry('no'), 'NO');
  assert.equal(defaultPhoneCountry('fi'), 'FI');
  assert.equal(defaultPhoneCountry('et'), 'EE');
  assert.equal(defaultPhoneCountry('lv'), 'LV');
  assert.equal(defaultPhoneCountry('lt'), 'LT');
  assert.equal(countryOfNumber('+4915112345678'), 'DE');
});
test('as-you-type formatting', () => assert.equal(formatPhoneAsYouType('+31612345678', 'NL'), '+31 6 12345678'));

console.log('Postcodes, numbers and the rest');
test('Hungarian postcode is four digits', () => {
  assert.equal(validateField({ rule: 'postcode' }, '1051', 'HU'), null);
  assert.equal(validateField({ rule: 'postcode' }, '10511', 'HU')?.code, 'postcode');
});
test('Dutch postcode is normalised', () => assert.equal(normalizePostcode('1234ab', 'NL'), '1234 AB'));
test('Dutch postcode needs letters', () => assert.equal(validateField({ rule: 'postcode' }, '1234', 'NL')?.code, 'postcode'));
test('price written the way people write it', () => {
  assert.equal(parseLocaleNumber('64.000.000'), 64000000);
  assert.equal(parseLocaleNumber('1 200 000'), 1200000);
  assert.equal(parseLocaleNumber('12,5'), 12.5);
  assert.equal(parseLocaleNumber('12 abc'), null);
});
test('normalizeNumber gives the machine form', () => {
  assert.equal(normalizeNumber('250.000'), '250000');
  assert.equal(normalizeNumber('250 000'), '250000');
  assert.equal(normalizeNumber('47.1625'), '47.1625');
  assert.equal(normalizeNumber('x'), 'x');
});
test('number limits', () => {
  assert.equal(validateField({ rule: 'number', min: 1000 }, '999', 'HU')?.code, 'min');
  assert.equal(validateField({ rule: 'number', max: 10 }, '11', 'HU')?.code, 'max');
});
test('email and url', () => {
  assert.equal(validateField({ rule: 'email' }, 'a@b.hu'), null);
  assert.equal(validateField({ rule: 'email' }, 'a@b')?.code, 'email');
  assert.equal(validateField({ rule: 'url' }, 'https://finddome.com'), null);
  assert.equal(validateField({ rule: 'url' }, 'fodel')?.code, 'url');
});

console.log('All languages');
const ERROR_CASES = [
  { code: 'required' }, { code: 'email' }, { code: 'phone', country: 'NL', example: '+31 6 12345678' },
  { code: 'postcode', country: 'NL', example: '1234 AB' }, { code: 'number' }, { code: 'min', limit: 5 },
  { code: 'max', limit: 5 }, { code: 'url' }, { code: 'too-long', limit: 10 }, { code: 'min-length', limit: 3 }, { code: 'consent' },
];
test('every validation message exists in every language and says something different', () => {
  for (const e of ERROR_CASES) {
    const seen = new Set();
    for (const l of LOCALES) {
      const text = errorMessage(e, l);
      assert.ok(typeof text === 'string' && text.length > 3, `${e.code} in ${l}`);
      assert.ok(!/undefined|\[object|NaN/.test(text), `${e.code} in ${l}: ${text}`);
      seen.add(text);
    }
    // Swedish and Norwegian both write “Minst 5.”; that is correct in both.
    const shared = e.code === 'min' ? 1 : 0;
    assert.equal(seen.size, LOCALES.length - shared, `${e.code} is identical in two languages`);
  }
});
test('routes: same pages, own slugs, unique inside a language', () => {
  const keys = Object.keys(ROUTES.hu).sort();
  for (const l of LOCALES) {
    assert.deepEqual(Object.keys(ROUTES[l]).sort(), keys, `route keys of ${l}`);
    const slugs = keys.filter((k) => k !== 'detail').map((k) => path(l, k));
    assert.equal(new Set(slugs).size, slugs.length, `duplicate slug in ${l}`);
    for (const p of slugs) assert.ok(p.startsWith(`/${l}/`), `${p} outside /${l}/`);
  }
});
test('locale helpers', () => {
  assert.equal(isLocale('fr'), true);
  for (const l of ['es', 'pl', 'ro', 'sk', 'it', 'pt', 'el', 'cs', 'sl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt']) assert.equal(isLocale(l), true);
  assert.equal(isLocale('xx'), false);
  assert.equal(localeFrom('de-AT', 'nl'), 'nl');
  assert.equal(localeFrom('de', 'nl'), 'de');
  const nine = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u'];
  assert.equal(localizer('fr')(...nine), 'e');
  assert.equal(localizer('es')(...nine), 'f');
  assert.equal(localizer('pl')(...nine), 'g');
  assert.equal(localizer('ro')(...nine), 'h');
  assert.equal(localizer('sk')(...nine), 'i');
  assert.equal(localizer('it')(...nine), 'j');
  assert.equal(localizer('no')(...nine), 'q');
  assert.equal(localizer('lt')(...nine), 'u');
});
test('money and area in the house style of each language', () => {
  assert.equal(eur(178000, 'hu'), '€\u00a0178\u00a0000');
  assert.equal(eur(178000, 'nl'), '€\u00a0178.000');
  assert.equal(eur(178000, 'en'), '€178,000');
  assert.equal(eur(178000, 'de'), '178.000\u00a0€');
  assert.equal(eur(178000, 'fr'), '178\u202f000\u00a0€');
  assert.equal(huf(64000000, 'fr'), '64\u202f000\u202f000\u00a0Ft');
  assert.equal(grouped(1200, 'en'), '1,200');
  assert.match(area(120, 'de'), /^120\u00a0m²$/);
  assert.match(area(15000, 'en'), /^1\.50\u00a0ha$/);
  assert.match(area(15000, 'fr'), /^1,50\u00a0ha$/);
  assert.equal(eur(178000, 'es'), '178.000\u00a0€');
  assert.equal(eur(178000, 'pl'), '178\u00a0000\u00a0€');
  assert.equal(eur(178000, 'ro'), '178.000\u00a0€');
  assert.equal(eur(178000, 'sk'), '178\u00a0000\u00a0€');
  for (const l of ['it', 'el', 'sl', 'da']) assert.equal(eur(178000, l), '178.000\u00a0€');
  for (const l of ['pt', 'cs', 'sv', 'no', 'fi', 'et', 'lv', 'lt']) assert.equal(eur(178000, l), '178\u00a0000\u00a0€');
  for (const l of ['es', 'pl', 'ro', 'sk', 'it', 'pt', 'el', 'cs', 'sl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt']) assert.match(area(15000, l), /^1,50\u00a0ha$/);
});
test('result counts use each language’s plural forms', () => {
  const counts = (l) => [1, 2, 5, 21, 22, 101].map((n) => UI[l].filters.results(n));
  assert.deepEqual(counts('es'), ['1 inmueble', '2 inmuebles', '5 inmuebles', '21 inmuebles', '22 inmuebles', '101 inmuebles']);
  assert.deepEqual(counts('pl'), ['1 nieruchomość', '2 nieruchomości', '5 nieruchomości', '21 nieruchomości', '22 nieruchomości', '101 nieruchomości']);
  assert.deepEqual(counts('ro'), ['1 proprietate', '2 proprietăți', '5 proprietăți', '21 de proprietăți', '22 de proprietăți', '101 proprietăți']);
  assert.deepEqual(counts('sk'), ['1 nehnuteľnosť', '2 nehnuteľnosti', '5 nehnuteľností', '21 nehnuteľností', '22 nehnuteľností', '101 nehnuteľností']);
  assert.deepEqual(counts('cs'), ['1 nemovitost', '2 nemovitosti', '5 nemovitostí', '21 nemovitostí', '22 nemovitostí', '101 nemovitostí']);
  // Slovenian has a dual: 2, 102 … (and 1, 101 take the singular).
  assert.deepEqual(counts('sl'), ['1 nepremičnina', '2 nepremičnini', '5 nepremičnin', '21 nepremičnin', '22 nepremičnin', '101 nepremičnina']);
  assert.deepEqual(counts('lt'), ['1 objektas', '2 objektai', '5 objektai', '21 objektas', '22 objektai', '101 objektas']);
  // Latvian: genitive plural after 0 and 10–20 (“10 īpašumu”), singular after 21.
  assert.deepEqual([1, 2, 10, 11, 21, 22].map((n) => UI.lv.filters.results(n)), ['1 īpašums', '2 īpašumi', '10 īpašumu', '11 īpašumu', '21 īpašums', '22 īpašumi']);
  assert.deepEqual(counts('it'), ['1 immobile', '2 immobili', '5 immobili', '21 immobili', '22 immobili', '101 immobili']);
  assert.deepEqual(counts('fi'), ['1 kohde', '2 kohdetta', '5 kohdetta', '21 kohdetta', '22 kohdetta', '101 kohdetta']);
});

console.log('Email retries');
const NO_WAIT = async () => {};
const waits = [];
test('429 and 5xx are retried, a 422 is not', () => {
  assert.equal(isRetryable({ statusCode: 429 }), true);
  assert.equal(isRetryable({ statusCode: 503 }), true);
  assert.equal(isRetryable({ statusCode: 422 }), false);
  assert.equal(isRetryable(new Error('network')), true);
});
await (async () => {
  const first = await withRetry(async () => null, NO_WAIT);
  test('delivered first time', () => assert.deepEqual(first, { sent: true, attempts: 1 }));
  let n = 0;
  const r = await withRetry(async () => (++n < 3 ? { statusCode: 503 } : null), async (ms) => { waits.push(ms); });
  test('two failures then success: 3 attempts, doubling waits', () => {
    assert.deepEqual(r, { sent: true, attempts: 3 });
    assert.deepEqual(waits, [400, 800]);
  });
  let m = 0;
  const bad = await withRetry(async () => { m++; return { statusCode: 422 }; }, NO_WAIT);
  test('a bad payload is tried once', () => assert.deepEqual([bad.sent, bad.attempts, m], [false, 1, 1]));
  let k = 0;
  const down = await withRetry(async () => { k++; throw new Error('down'); }, NO_WAIT);
  test('gives up after three attempts', () => assert.deepEqual([down.sent, down.attempts, k], [false, 3, 3]));
  test('a rate-limit rejection waits at least a second', () => {
    assert.deepEqual([1, 2, 3].map((attempt) => retryDelay({ statusCode: 429 }, attempt)), [1000, 1000, 1600]);
    assert.deepEqual([1, 2].map((attempt) => retryDelay({ statusCode: 503 }, attempt)), [400, 800]);
  });
  const quick = await withTimeout(Promise.resolve('ok'), 50);
  test('a provider call that answers in time passes through', () => assert.equal(quick, 'ok'));
  const slow = await withTimeout(new Promise(() => {}), 20).catch((error) => error);
  test('a call that never answers times out with a 408', () => assert.equal(slow.statusCode, 408));
  test('a timed-out send is not retried (it may already have gone out)', () => assert.equal(isRetryable(slow), false));
})();

// The wizard's thank-you panel is found by its own hook. [data-done] is also set on the step links
// (setup.astro marks the finished ones), and the first of them once matched instead of the panel, so a
// submit that had worked ended in "could not submit".
(() => {
  const source = readFileSync(new URL('../src/pages/portal/properties/[id]/setup.astro', import.meta.url), 'utf8');
  test('setup wizard: the thank-you panel has a hook no step link shares', () => {
    assert.ok(source.includes('data-thanks hidden'));
    assert.ok(source.includes("querySelector<HTMLElement>('[data-thanks]')"));
    assert.ok(!source.includes("querySelector<HTMLElement>('[data-done]')"));
  });
})();

// The modules below import through the site's `~/` alias and without file
// extensions, which Node does not resolve by itself. This hook teaches it both.
const SRC = fileURLToPath(new URL('../src/', import.meta.url));
registerHooks({
  resolve(specifier, context, nextResolve) {
    let target = specifier.startsWith('~/') ? SRC + specifier.slice(2) : specifier;
    const relative = target.startsWith('.') && context.parentURL?.startsWith('file:');
    if (relative) target = fileURLToPath(new URL(target, context.parentURL));
    if (target.startsWith('/') && !/\.[a-z]+$/.test(target)) {
      for (const ext of ['.ts', '/index.ts']) if (existsSync(target + ext)) return nextResolve(pathToFileURL(target + ext).href, context);
    }
    return nextResolve(target.startsWith('/') ? pathToFileURL(target).href : specifier, context);
  },
  // Vite lets a module import JSON bare; Node wants the `type: 'json'` attribute.
  load(url, context, nextLoad) {
    return url.endsWith('.json') ? nextLoad(url, { ...context, importAttributes: { type: 'json' } }) : nextLoad(url, context);
  },
});
const { searchRequestReceived } = await import('../src/lib/email/search-request.ts');
const { listingCatalog } = await import('../src/lib/listing-packages.ts');
const { placeholderProblem } = await import('../src/lib/portal/placeholder.ts');
const { isDeliverableAddress } = await import('../src/lib/email/deliverable.ts');
const { submissionReceived } = await import('../src/lib/email/templates.ts');
const { fillShortHours, HOURS_TOKEN } = await import('../src/config/company.ts');

console.log('Grok test findings');
test('a place label never puts Budapest in Pest county', () => {
  assert.equal(placeLabel('Budapest', 'Pest'), 'Budapest');
  assert.equal(placeLabel('Budapest XI. kerület', 'Pest'), 'Budapest XI. kerület');
  assert.equal(placeLabel('Pécs', 'Baranya'), 'Pécs, Baranya');
  assert.equal(placeLabel('Győr', 'győr'), 'Győr');
  assert.equal(placeLabel('Szeged', null), 'Szeged');
});
test('the search-request confirmation renders in every language and repeats the request', () => {
  const asked = { name: 'Anna', propertyType: 'Farmhouse', region: 'Baranya', budgetMin: '50000', budgetMax: '90000', requirements: 'Quiet, a well' };
  for (const l of LOCALES) {
    const mail = searchRequestReceived(l, asked);
    for (const part of [mail.subject, mail.html, mail.text]) {
      assert.ok(part && !/undefined|NaN|\[object/.test(part), `${l}: bad output`);
    }
    assert.ok(mail.subject.includes('FODEL'), `${l}: subject`);
    assert.ok(mail.html.includes('Baranya') && mail.text.includes('Quiet, a well'), `${l}: request not repeated`);
    assert.ok(mail.text.includes('€ 50 000 – € 90 000'), `${l}: budget`);
  }
});
test('a website visitor is not told they have an account or a listing', () => {
  const lastLine = (text) => text.trim().split('\n').at(-1);
  for (const l of LOCALES) {
    const visitor = lastLine(searchRequestReceived(l, { name: 'Anna' }).text);
    const owner = lastLine(submissionReceived(l, { ref: '1', title: 'x' }).text);
    assert.ok(visitor.length > 20 && visitor !== owner, `${l}: visitor footer`);
  }
});
await (async () => {
  const missing = [];
  for (const l of LOCALES) {
    const msg = (await import(`../src/lib/validation-copy/${l}.ts`)).copy.selfReferral;
    if (typeof msg !== 'string' || msg.length < 8) missing.push(l);
  }
  test('a person cannot refer themselves, in any language', () => assert.deepEqual(missing, []));
})();
test('the photo cap follows the saved package setting', () => {
  const caps = (services) => listingCatalog(services).packages.map((p) => p.maxImages);
  assert.deepEqual(caps(undefined), [20, 20]);
  const only = (patch) => ({ listingPackages: { 'cheap-6m': patch } });
  assert.equal(listingCatalog(only({ maxImages: 35 })).packages[0].maxImages, 35);
  assert.equal(listingCatalog(only({ maxImages: null })).packages[0].maxImages, null);
  assert.equal(listingCatalog(only({ maxImages: 0 })).packages[0].maxImages, 20, 'out of range → default');
  assert.equal(listingCatalog(only({ maxImages: 9999 })).packages[0].maxImages, 20, 'out of range → default');
  assert.equal(listingCatalog(only({ maxImages: 200 })).packages[0].maxImages, 200);
});
test('a €1 / 1 m² draft cannot be approved', () => {
  assert.ok(placeholderProblem({ price_eur: 1, floor_m2: 120 }));
  assert.ok(placeholderProblem({ price_eur: null }));
  assert.ok(placeholderProblem({ price_eur: 95000, floor_m2: 1 }));
  assert.ok(placeholderProblem({ price_eur: 95000, plot_m2: 1 }));
  assert.equal(placeholderProblem({ price_eur: 95000, floor_m2: 120, building_m2: null, plot_m2: 800 }), null);
  assert.equal(placeholderProblem({ price_eur: 95000, floor_m2: 120, plot_m2: null }), null, 'an empty plot is fine');
  assert.notEqual(placeholderProblem({ price_eur: 1 }, 'owner'), placeholderProblem({ price_eur: 1 }, 'admin'), 'worded for the reader');
});
test('reserved test domains never receive admin alerts', () => {
  for (const bad of ['workflow-admin@fodel-test.local', 'a@b.test', 'a@x.example', 'a@example.com', 'a@host.invalid', '', null, 'nodomain']) {
    assert.equal(isDeliverableAddress(bad), false, String(bad));
  }
  for (const good of ['info@fodel.com', 'marton.orosz16@gmail.com', 'fodel@admin.com']) assert.equal(isDeliverableAddress(good), true, good);
});
test('the opening-hours token is filled from live settings, once', () => {
  const hours = { weekdays: { from: '09:00', to: '19:00' } };
  const out = fillShortHours(`${HOURS_TOKEN} · free`, hours, 'hu');
  assert.ok(out.includes('19:00') && !out.includes(HOURS_TOKEN), out);
  assert.equal(fillShortHours('no token', hours, 'hu'), 'no token');
});
test('PUBLIC_SITE_URL sets the origin; junk falls back to finddome.com', () => {
  const origin = (value) =>
    execFileSync(process.execPath, ['--input-type=module', '-e', "import('./src/config/site.mjs').then((m) => console.log(m.SITE_URL))"], {
      env: { ...process.env, PUBLIC_SITE_URL: value }, encoding: 'utf8',
    }).trim();
  assert.equal(origin('https://fodel.vercel.app/'), 'https://fodel.vercel.app');
  assert.equal(origin('https://fodel.vercel.app/hu/x?y=1'), 'https://fodel.vercel.app');
  assert.equal(origin('not a url'), 'https://finddome.com');
  assert.equal(origin('javascript:alert(1)'), 'https://finddome.com');
  assert.equal(origin(''), 'https://finddome.com');
});

console.log(process.exitCode ? '\nFAILED' : `\nAll ${passed} checks passed.`);
