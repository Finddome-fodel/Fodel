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
  validateField, normalizePhone, normalizePostcode, normalizeNumber, parseLocaleNumber, errorMessage,
  defaultPhoneCountry, countryOfNumber, formatPhoneAsYouType,
} from '../src/lib/validation.ts';
import { withRetry, isRetryable } from '../src/lib/email/retry.ts';

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
  assert.equal(validateField({ rule: 'url' }, 'https://fodel.eu'), null);
  assert.equal(validateField({ rule: 'url' }, 'fodel')?.code, 'url');
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
})();

console.log(process.exitCode ? '\nFAILED' : `\nAll ${passed} checks passed.`);
