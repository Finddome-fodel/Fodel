/**
 * Translation packages on the server, offline: the site's real payment, publishing, language and settings
 * code runs against an in-memory database. It proves what must hold:
 *
 *   - a paid package or single language becomes the listing's entitlement exactly once, however often Stripe
 *     repeats itself, never shrinks it, and carries the languages the buyer switched off;
 *   - every listing that goes live is queued for English and German (Go), except what was switched off;
 *   - an owner or an admin can switch languages off and on; English can never be switched off, not by the
 *     browser and not by a forged request; a switched-off language's waiting jobs are cancelled;
 *   - before migration 0053 nothing of this runs, and payment and publishing work exactly as before;
 *   - the admin's two settings tabs each write only their own keys of site_settings.services.
 *
 *   npm run test:translation:packages
 */
import assert from 'node:assert/strict';
import { register } from 'node:module';
import Stripe from 'stripe';

globalThis.__ENV = {
  STRIPE_ENABLED: 'true',
  STRIPE_WEBHOOK_SECRET: 'whsec_offline_test',
  STRIPE_SECRET_KEY: 'sk_test_offline',
  PAYMENT_GATES_PUBLISHING: 'true',
  AI_ENABLED: 'true',
  OPENAI_API_KEY: 'sk-offline-test',
};
register('./lib/stripe-test-hooks.mjs', import.meta.url);

const { createFakeDb } = await import('./lib/fake-supabase.mjs');
const { world } = await import('./lib/stubs/world.ts');
const webhook = await import('../src/pages/api/stripe/webhook.ts');
const languages = await import('../src/pages/api/portal/properties/[id]/languages.ts');
const goFill = await import('../src/pages/api/portal/translations/go-fill.ts');
const tabTranslations = await import('../src/pages/api/portal/packages/translations.ts');
const tabLanguages = await import('../src/pages/api/portal/packages/languages.ts');
const entitlement = await import('../src/lib/ai/translation-entitlement.ts');
const packages = await import('../src/lib/translation-packages.ts');
const catalog = await import('../src/lib/listing-packages.ts');
const orders = await import('../src/lib/orders.ts');
const signer = new Stripe('sk_test_offline');
console.error = () => {};
console.warn = () => {};

const cfg = catalog.listingCatalog().translation;
const GO = ['de', 'en'];

let eventSeq = 0;
function stripeEvent(type, object, id = `evt_${++eventSeq}`) {
  const payload = JSON.stringify({ id, object: 'event', api_version: '2024-06-20', created: Math.floor(Date.now() / 1000), type, data: { object } });
  const header = signer.webhooks.generateTestHeaderString({ payload, secret: globalThis.__ENV.STRIPE_WEBHOOK_SECRET });
  return new Request('http://site.test/api/stripe/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': header } });
}
const pay = (id) => webhook.POST({ request: stripeEvent('checkout.session.completed', { id: 'cs_1', payment_status: 'paid', metadata: { orderId: 'o1', propertyId: 'p1' }, customer_details: { name: 'A', email: 'owner@example.test' } }, id) });

const pkgLine = { kind: 'package', id: 'normal-12m', label: 'Standard hirdetés', quantity: 1, unitCents: 12900 };
const europeLine = (locales) => ({ kind: 'extra', id: 'translation-package', packageId: 'europe', label: 'Fordítási csomag: Európa', quantity: 1, unitCents: 1200, locales });
const singleLine = (locales) => ({ kind: 'extra', id: 'translation', label: 'Fordítás', quantity: locales.length, unitCents: 100, locales });
const EUROPE = packages.packageLocales(packages.packageById(cfg, 'europe'), (await import('../src/lib/ai/translate-core.ts')).ALL_LOCALES).filter((code) => code !== 'hu');

const hu = { property_id: 'p1', locale: 'hu', title: 'Teszt ház', description: 'Szép ház 120 m².', body: '' };
function fresh({ property = {}, lines = [pkgLine], translations = [hu], jobs = [], gated = true, order = {} } = {}) {
  world.sent.length = 0; world.drafts.length = 0;
  world.db = createFakeDb({
    properties: [{
      id: 'p1', ref: '1001', status: 'awaiting_payment', owner_id: 'u1', category: 'house', package: 'normal-12m', price_eur: 150000, floor_m2: 90, plot_m2: 400,
      ...(gated ? { translation_package: 'go', extra_locales: [], excluded_locales: [] } : {}), ...property,
    }],
    profiles: [
      { id: 'u1', email: 'owner@example.test', locale: 'hu', role: 'owner' },
      { id: 'u2', email: 'other@example.test', locale: 'hu', role: 'owner' },
      { id: 'a1', email: 'admin@example.test', locale: 'hu', role: 'admin' },
    ],
    property_translations: translations,
    translation_jobs: jobs,
    payments: [{ id: 'o1', property_id: 'p1', owner_id: 'u1', status: 'pending', amount_cents: 12900, discount_cents: 0, line_items: lines, stripe_session_id: 'cs_1', ...order }],
    site_settings: [{ id: 1, services: { listingPackages: { 'normal-12m': { priceEur: 150 } }, packagePhone: { 'normal-12m': true }, other: 'kept' } }],
    activity_events: [],
  });
}
const prop = () => world.db.table('properties')[0];
const jobs = () => world.db.table('translation_jobs');
const jobLocales = (filter = () => true) => [...new Set(jobs().filter(filter).map((j) => j.locale))].sort();
const events = (kind) => world.db.table('activity_events').filter((e) => e.kind === kind);
const ownerLocals = (id = 'u1') => ({ supabase: world.db.client, user: { id }, profile: { role: 'owner', email: 'owner@example.test', locale: 'hu' } });
const adminLocals = () => ({ supabase: world.db.client, user: { id: 'a1' }, profile: { role: 'admin', email: 'admin@example.test', locale: 'hu' } });
const post = (locals, excluded, id = 'p1') =>
  languages.POST({ params: { id }, locals, request: new Request(`http://site.test/api/portal/properties/${id}/languages`, { method: 'POST', body: JSON.stringify({ excluded }), headers: { 'content-type': 'application/json' } }) });

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/* ── Payment ─────────────────────────────────────────────────────────── */

test('a paid Európa package becomes the listing\'s entitlement and queues its languages, exactly once', async () => {
  fresh({ lines: [pkgLine, europeLine(EUROPE)] });
  const res = await pay('evt_a');
  assert.equal(res.status, 200);
  assert.equal(prop().status, 'published');
  assert.equal(prop().translation_package, 'europe');
  assert.deepEqual(prop().extra_locales, []);
  assert.deepEqual(prop().excluded_locales, []);
  assert.deepEqual(jobLocales(), [...EUROPE].sort(), 'every Európa language is queued, the original never');
  assert.equal(jobs().length, EUROPE.length, 'one job per language: the Go ones and the paid ones are the same jobs');
  const before = JSON.stringify({ p: prop(), n: jobs().length });
  await pay('evt_b'); // Stripe repeats itself under a new id
  await pay('evt_a'); // and under the same one
  assert.equal(jobs().length, EUROPE.length, 'a retried webhook orders nothing twice');
  assert.equal(JSON.stringify({ p: prop(), n: jobs().length }), before, 'and changes nothing');
});

test('single languages bought on top of Go are stored as extra languages', async () => {
  fresh({ lines: [pkgLine, singleLine(['fr', 'es'])] });
  await pay('evt_c');
  assert.equal(prop().translation_package, 'go');
  assert.deepEqual(prop().extra_locales.sort(), ['es', 'fr']);
  assert.deepEqual(jobLocales(), ['de', 'en', 'es', 'fr']);
  const origins = Object.fromEntries(jobs().map((j) => [j.locale, j.origin]));
  assert.equal(Object.keys(origins).length, 4);
  assert.equal(jobs().filter((j) => j.locale === 'fr').length, 1, 'one job per language, however many code paths ask');
});

test('the languages the buyer switched off are never translated and are stored as switched off', async () => {
  fresh({ lines: [pkgLine, europeLine(EUROPE.filter((code) => code !== 'de' && code !== 'pl'))] });
  await pay('evt_d');
  assert.deepEqual(prop().excluded_locales.sort(), ['de', 'pl']);
  assert.equal(jobLocales().includes('de'), false, 'German was switched off, so even Go does not make it');
  assert.equal(jobLocales().includes('pl'), false);
  assert.equal(jobLocales().includes('en'), true, 'English is always made');
  assert.equal(jobLocales().includes('fr'), true);
});

test('a purchase never shrinks what the listing already holds', async () => {
  fresh({ property: { translation_package: 'world' } });
  await entitlement.applyPurchase(world.db.client, 'p1', { packageId: 'europe', singles: [], packageLocalesPaid: EUROPE }, cfg);
  assert.equal(prop().translation_package, 'world', 'a smaller package never replaces a bigger one');
  fresh({ property: { extra_locales: ['fr'] } });
  await entitlement.applyPurchase(world.db.client, 'p1', { packageId: null, singles: ['es'] }, cfg);
  assert.deepEqual(prop().extra_locales.sort(), ['es', 'fr'], 'a new single joins the ones already held');
  await entitlement.applyPurchase(world.db.client, 'p1', { packageId: null, singles: ['es'] }, cfg);
  assert.deepEqual(prop().extra_locales.sort(), ['es', 'fr'], 'applying the same order again changes nothing');
});

test('a single language the package now includes is not kept as a single; a bought single is switched back on', async () => {
  fresh({ property: { translation_package: 'go', extra_locales: ['fr'], excluded_locales: ['es'] } });
  await entitlement.applyPurchase(world.db.client, 'p1', { packageId: 'europe', singles: ['es'], packageLocalesPaid: EUROPE }, cfg);
  assert.equal(prop().translation_package, 'europe');
  assert.deepEqual(prop().extra_locales, [], 'fr and es are in Európa');
  assert.deepEqual(prop().excluded_locales, [], 'es was bought on purpose, so it is on');
});

test('an order the owner never paid, or one that was waived, entitles nothing', async () => {
  fresh({ lines: [pkgLine, europeLine(EUROPE)], order: { waived_at: new Date().toISOString(), status: 'cancelled' } });
  const res = await pay('evt_w');
  assert.equal(res.status, 200);
  assert.equal(prop().translation_package, 'go');
  assert.equal(jobs().length, 0);
  fresh({ lines: [pkgLine, europeLine(EUROPE)] });
  assert.equal(prop().translation_package, 'go', 'nothing happens until the payment settles');
  assert.equal(jobs().length, 0);
});

test('every listing that goes live is queued for English and German', async () => {
  fresh();
  await pay('evt_e');
  assert.deepEqual(jobLocales(), GO);
  assert.equal(jobs().every((j) => j.origin === 'package' && j.status === 'queued'), true);
  assert.equal(prop().translation_package, 'go');
});

test('a listing written in English is queued for German only; one written in German for English only', async () => {
  fresh({ translations: [{ ...hu, locale: 'en' }] });
  await pay('evt_f');
  assert.deepEqual(jobLocales(), ['de']);
  fresh({ translations: [{ ...hu, locale: 'de' }] });
  await pay('evt_g');
  assert.deepEqual(jobLocales(), ['en']);
});

test('a language that already has a text is not queued again', async () => {
  fresh({ translations: [hu, { property_id: 'p1', locale: 'en', title: 'House', description: 'Nice house 120 m².', body: '', machine: true, translated_from: 'hu' }] });
  await pay('evt_h');
  assert.deepEqual(jobLocales(), ['de']);
});

test('before migration 0053 payment and publishing work exactly as they did and nothing of the packages runs', async () => {
  fresh({ gated: false, lines: [pkgLine, singleLine(['fr', 'nl'])] });
  const res = await pay('evt_i');
  assert.equal(res.status, 200);
  assert.equal(prop().status, 'published');
  assert.equal('translation_package' in prop(), false, 'no column invented');
  assert.deepEqual(jobLocales(), ['fr', 'nl'], 'only what was paid for, as before');
  assert.equal(await entitlement.loadEntitlement(world.db.client, 'p1'), null);
  assert.deepEqual(await entitlement.ensurePackageTranslations(world.db.client, 'p1', cfg), []);
  const res2 = await post(adminLocals(), ['fr']);
  assert.equal(res2.status, 422);
  assert.equal((await res2.json()).error, 'schema-missing');
});

/* ── Switching languages off and on ──────────────────────────────────── */

const live = (over = {}) => ({ status: 'published', translation_package: 'world', extra_locales: [], excluded_locales: [], ...over });
const text = (locale) => ({ property_id: 'p1', locale, title: `T ${locale}`, description: `D ${locale}`, body: '', machine: true, translated_from: 'hu' });

test('the owner switches a language off: it is stored, its waiting job is cancelled, its text is kept, and the event is logged', async () => {
  fresh({ property: live(), translations: [hu, text('es'), text('fr')], jobs: [{ id: 'j1', property_id: 'p1', locale: 'pl', status: 'queued', origin: 'upload_paid' }, { id: 'j2', property_id: 'p1', locale: 'fr', status: 'done', origin: 'upload_paid' }] });
  const res = await post(ownerLocals(), ['es', 'pl']);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.excluded.sort(), ['es', 'pl']);
  assert.deepEqual(prop().excluded_locales.sort(), ['es', 'pl']);
  assert.equal(jobs().find((j) => j.id === 'j1').status, 'cancelled');
  assert.equal(jobs().find((j) => j.id === 'j1').last_error, 'Kizárva a hirdető kérésére.');
  assert.equal(jobs().find((j) => j.id === 'j2').status, 'done', 'finished work is left alone');
  assert.equal(world.db.table('property_translations').some((r) => r.locale === 'es'), true, 'the text is kept');
  assert.equal(events('translation.exclude').length, 1);
});

test('German can be switched off on a Go listing, by the owner and by an admin', async () => {
  fresh({ property: live({ translation_package: 'go' }), translations: [hu, text('de'), text('en')] });
  assert.equal((await post(ownerLocals(), ['de'])).status, 200);
  assert.deepEqual(prop().excluded_locales, ['de']);
  fresh({ property: live({ translation_package: 'go' }), translations: [hu, text('de'), text('en')] });
  assert.equal((await post(adminLocals(), ['de'])).status, 200);
  assert.deepEqual(prop().excluded_locales, ['de']);
});

test('English can never be switched off: a forged request is refused with exclude-en and nothing changes', async () => {
  fresh({ property: live({ excluded_locales: ['fr'] }), translations: [hu, text('en')] });
  for (const who of [ownerLocals(), adminLocals()]) {
    const res = await post(who, ['fr', 'en']);
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.error, 'exclude-en');
    assert.match(body.message, /Az angol nyelv nem zárható ki/);
  }
  assert.deepEqual(prop().excluded_locales, ['fr'], 'untouched');
  assert.equal(events('translation.exclude').length, 0);
});

test('the original language cannot be switched off either, and a language the listing does not have is ignored', async () => {
  fresh({ property: live({ translation_package: 'go' }), translations: [hu, text('en'), text('de')] });
  const res = await post(ownerLocals(), ['hu']);
  assert.equal(res.status, 422);
  assert.equal((await res.json()).error, 'is-source');
  const res2 = await post(ownerLocals(), ['fr']);
  assert.equal(res2.status, 200);
  assert.deepEqual((await res2.json()).excluded, [], 'Go has no French to switch off');
});

test('another owner cannot touch the listing; a visitor gets nothing', async () => {
  fresh({ property: live() });
  assert.equal((await post(ownerLocals('u2'), ['fr'])).status, 403);
  assert.equal((await post({ supabase: world.db.client, user: null, profile: null }, ['fr'])).status, 401);
  assert.equal((await post(adminLocals(), ['fr'], 'nope')).status, 404);
  assert.deepEqual(prop().excluded_locales, []);
});

test('switching a language back on republishes the text it kept with no new job; one with no text is queued, free', async () => {
  fresh({ property: live({ excluded_locales: ['es', 'pl'] }), translations: [hu, text('es')] });
  const res = await post(ownerLocals(), []);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(prop().excluded_locales, []);
  assert.deepEqual(body.queued, ['pl'], 'Spanish still has its text; Polish needs one');
  assert.equal(jobs().filter((j) => j.locale === 'es').length, 0);
  assert.equal(jobs().find((j) => j.locale === 'pl').origin, 'package');
  assert.equal(jobs().find((j) => j.locale === 'pl').payment_id ?? null, null, 'no charge: it is within the package');
  // The same list again changes nothing.
  const again = await post(ownerLocals(), []);
  assert.equal((await again.json()).queued.length, 0);
  assert.equal(jobs().length, 1);
});

test('switching languages off never changes what was paid', async () => {
  fresh({ property: live(), translations: [hu, text('es')] });
  await post(ownerLocals(), ['es', 'fr', 'de']);
  assert.equal(prop().translation_package, 'world');
  assert.equal(world.db.table('payments')[0].amount_cents, 12900);
});

test('the wizard\'s exclusions hold from approval: Go\'s German stays off, and nothing is queued for it at publish', async () => {
  fresh({ property: { requested_extras: { excludedLocales: ['de'] } } });
  const asked = await entitlement.requestedExclusions(world.db.client, 'p1');
  assert.deepEqual(asked, ['de']);
  assert.equal(await entitlement.applyRequestedExclusions(world.db.client, 'p1', asked, cfg), true);
  assert.deepEqual(prop().excluded_locales, ['de']);
  assert.equal(await entitlement.applyRequestedExclusions(world.db.client, 'p1', asked, cfg), false, 'idempotent');
  await pay('evt_x');
  assert.deepEqual(jobLocales(), ['en']);
  // A wish for a package not yet paid is not applied by this: the package line carries it.
  fresh();
  assert.equal(await entitlement.applyRequestedExclusions(world.db.client, 'p1', ['pl'], cfg), false);
});

/* ── Admin: free grants, Go fill, settings ───────────────────────────── */

test('a language an admin decides to publish for nothing is granted, and a switched-off one is lifted only on purpose', async () => {
  fresh({ property: live({ translation_package: 'go', excluded_locales: ['pl'] }) });
  assert.deepEqual(await entitlement.grantLocales(world.db.client, 'p1', ['fr'], cfg), ['fr']);
  assert.deepEqual(prop().extra_locales, ['fr']);
  assert.deepEqual(await entitlement.grantLocales(world.db.client, 'p1', ['fr'], cfg), [], 'idempotent');
  // pl is switched off: a job that merely finished (lift: false) leaves it off ...
  await entitlement.grantLocales(world.db.client, 'p1', ['pl'], cfg, { lift: false });
  assert.deepEqual(prop().excluded_locales, ['pl']);
  // ... an admin who grants it on purpose takes it off the list.
  await entitlement.grantLocales(world.db.client, 'p1', ['pl'], cfg);
  assert.deepEqual(prop().excluded_locales, []);
  assert.deepEqual(prop().extra_locales.sort(), ['fr', 'pl']);
});

test('"Go nyelvek pótlása" queues English and German for live listings that lack them, oldest first, and only for admins', async () => {
  fresh({ property: live({ translation_package: 'go' }) });
  const refused = await goFill.POST({ locals: ownerLocals(), request: new Request('http://site.test/x', { method: 'POST' }) });
  assert.equal(refused.status, 403);
  const res = await goFill.POST({ locals: adminLocals(), request: new Request('http://site.test/x', { method: 'POST' }) });
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.listings, 1);
  assert.equal(body.languages, 2);
  assert.deepEqual(jobLocales(), GO);
  const again = await (await goFill.POST({ locals: adminLocals(), request: new Request('http://site.test/x', { method: 'POST' }) })).json();
  assert.equal(again.languages, 0, 'pressing it again queues nothing twice');
});

test('"Go nyelvek pótlása" stops when today\'s AI budget is used up', async () => {
  globalThis.__ENV.TRANSLATION_DAILY_CAP_EUR = '0.000001';
  try {
    fresh({ property: live({ translation_package: 'go' }), jobs: [{ id: 'j9', property_id: 'p1', locale: 'fr', status: 'queued', origin: 'admin', estimated_cost_micro_eur: 5 }] });
    const body = await (await goFill.POST({ locals: adminLocals(), request: new Request('http://site.test/x', { method: 'POST' }) })).json();
    assert.equal(body.languages, 0);
    assert.equal(body.budgetStopped, true);
  } finally {
    delete globalThis.__ENV.TRANSLATION_DAILY_CAP_EUR;
  }
});

const form = (fields) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) for (const v of [].concat(value)) data.append(key, v);
  return data;
};
const submitTab = (handler, fields, locals = adminLocals()) => handler.POST({ locals, redirect: (url) => new Response(null, { status: 302, headers: { location: url } }), request: new Request('http://site.test/x', { method: 'POST', body: form(fields) }) });
const services = () => world.db.table('site_settings')[0].services;
const TAB_PACKAGES = {
  recommended: 'europe',
  go_name_hu: 'Go', go_name_en: 'Go', go_name_nl: 'Go', go_active: 'yes',
  europe_name_hu: 'Európa', europe_name_en: 'Europe', europe_name_nl: 'Europa', europe_price: '14', europe_active: 'yes',
  world_name_hu: 'World', world_name_en: 'World', world_name_nl: 'World', world_price: '29', world_active: 'yes',
};

test('the packages tab writes only the packages: the prices of the other tab and everything else in the settings stay as they are', async () => {
  fresh();
  world.db.table('site_settings')[0].services.translationPackages = { singleEur: { european: 2, world: 7 }, worldOnly: ['tr', 'ar'] };
  const before = JSON.parse(JSON.stringify(services()));
  const res = await submitTab(tabTranslations, TAB_PACKAGES);
  assert.equal(res.headers.get('location'), '/portal/packages/translations?saved=1');
  const after = services();
  assert.deepEqual(after.translationPackages.singleEur, before.translationPackages.singleEur, 'the other tab\'s keys');
  assert.deepEqual(after.translationPackages.worldOnly, before.translationPackages.worldOnly);
  assert.deepEqual(after.listingPackages, before.listingPackages, 'listing packages untouched');
  assert.deepEqual(after.packagePhone, before.packagePhone);
  assert.equal(after.other, 'kept');
  const saved = catalog.listingCatalog(after).translation;
  assert.equal(packages.packageById(saved, 'europe').priceEur, 14);
  assert.equal(packages.packageById(saved, 'world').priceEur, 29);
  assert.equal(saved.packages.find((p) => p.recommended).id, 'europe');
  assert.equal(events('settings.translation_packages').length, 1);
});

test('the languages tab writes only the single prices and the World-only list', async () => {
  fresh();
  await submitTab(tabTranslations, TAB_PACKAGES);
  const packagesBefore = JSON.stringify(services().translationPackages.packages);
  const listingBefore = JSON.stringify(services().listingPackages);
  const res = await submitTab(tabLanguages, { single_european: '1,5', single_world: '6', world_only: ['tr', 'he', 'ar', 'zh', 'ru'] });
  assert.equal(res.headers.get('location'), '/portal/packages/languages?saved=1');
  assert.equal(JSON.stringify(services().translationPackages.packages), packagesBefore, 'the packages of the other tab');
  assert.equal(JSON.stringify(services().listingPackages), listingBefore);
  const saved = catalog.listingCatalog(services()).translation;
  assert.deepEqual(saved.singleEur, { european: 1.5, world: 6 });
  assert.deepEqual(saved.worldOnly, ['tr', 'he', 'ar', 'zh', 'ru'], 'kept although the site does not have these languages yet');
});

test('a new price applies to new orders only; an order already made keeps its own lines', async () => {
  fresh({ lines: [pkgLine, europeLine(EUROPE)] });
  const frozen = JSON.stringify(world.db.table('payments')[0].line_items);
  await submitTab(tabTranslations, TAB_PACKAGES);
  assert.equal(JSON.stringify(world.db.table('payments')[0].line_items), frozen);
  const fresher = catalog.listingCatalog(services());
  const lines = orders.buildOrderLines({ packageId: 'normal-12m', extras: [], translation: { packageId: 'europe' } }, 'hu', fresher);
  assert.equal(lines.find((l) => l.id === 'translation-package').unitCents, 1400);
});

test('only an admin can save either tab', async () => {
  fresh();
  const before = JSON.stringify(services());
  for (const handler of [tabTranslations, tabLanguages]) {
    const res = await handler.POST({ locals: ownerLocals(), redirect: () => new Response(null, { status: 302 }), request: new Request('http://site.test/x', { method: 'POST', body: form({}) }) });
    assert.equal(res.status, 403);
  }
  assert.equal(JSON.stringify(services()), before);
});

test('a hand-made language list is kept, English is added to it, and an absurd price is ignored', async () => {
  fresh();
  await submitTab(tabTranslations, { ...TAB_PACKAGES, europe_price: '99999999', europe_override: 'yes', europe_locale: ['fr', 'es'] });
  const saved = catalog.listingCatalog(services()).translation;
  const europe = packages.packageById(saved, 'europe');
  assert.equal(europe.priceEur, 12, 'the default stands');
  assert.deepEqual(packages.packageLocales(europe, ['hu', 'nl', 'en', 'de', 'fr', 'es', 'pl']), ['en', 'fr', 'es']);
});

test('a badge an admin clears stays cleared; one never saved keeps its default; Go has none by default', async () => {
  fresh();
  const defaults = catalog.listingCatalog(services()).translation;
  assert.equal(packages.packageById(defaults, 'go').badge.hu, '', 'Go says "Benne van" on its price line already');
  assert.ok(packages.packageById(defaults, 'europe').badge.hu, 'Európa keeps its badge');
  await submitTab(tabTranslations, { ...TAB_PACKAGES, europe_badge_hu: 'Ajánlott', europe_badge_en: '', europe_badge_nl: '' });
  const saved = catalog.listingCatalog(services()).translation;
  assert.equal(packages.packageById(saved, 'europe').badge.hu, 'Ajánlott');
  assert.equal(packages.packageById(saved, 'europe').badge.en, '', 'an empty badge is no badge');
  const bare = packages.translationPricing({ packages: [{ id: 'europe' }] }, defaults.packages ? { singleEur: defaults.singleEur, worldOnly: defaults.worldOnly, packages: defaults.packages } : undefined, ['en']);
  assert.ok(packages.packageById(bare, 'europe').badge.hu, 'a missing badge falls back to the default');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`  ✓ ${name}`); } catch (error) { failed++; console.log(`  ✗ ${name}\n    ${String(error.message).split('\n').slice(0, 14).join('\n    ')}`); }
}
console.log(failed ? `\n${failed} of ${tests.length} failed.` : `\nAll ${tests.length} checks passed.`);
process.exit(failed ? 1 : 0);
