/**
 * The money path, offline: the site's real Stripe webhook and checkout routes
 * run against an in-memory database, a Stripe stand-in and a recording mailer
 * (scripts/lib/stripe-test-hooks.mjs). It proves what must never go wrong:
 * a payment publishes the listing exactly once however often Stripe repeats
 * itself, an unpaid or refused payment publishes nothing, money for a listing
 * that was sent back is flagged instead of published, and an owner who comes
 * back after a day can still pay.
 *
 *   npm run test:stripe
 */
import assert from 'node:assert/strict';
import { register } from 'node:module';
import Stripe from 'stripe';

globalThis.__ENV = {
  STRIPE_ENABLED: 'true',
  STRIPE_WEBHOOK_SECRET: 'whsec_offline_test',
  STRIPE_SECRET_KEY: 'sk_test_offline',
  PAYMENT_GATES_PUBLISHING: 'true',
};
register('./lib/stripe-test-hooks.mjs', import.meta.url);

const { createFakeDb } = await import('./lib/fake-supabase.mjs');
const { world } = await import('./lib/stubs/world.ts');
const webhook = await import('../src/pages/api/stripe/webhook.ts');
const checkout = await import('../src/pages/api/stripe/checkout.ts');
const translations = await import('../src/pages/api/portal/properties/[id]/translations.ts');
const ordersLib = await import('../src/lib/orders.ts');
const catalogLib = await import('../src/lib/listing-packages.ts');
const rules = await import('../src/lib/listing-rules.ts');
const runtime = await import('../src/lib/runtime-config.ts');

const signer = new Stripe('sk_test_offline');
console.error = () => {}; // runtime-config reports its (expected) fallback to the checked-in defaults
console.warn = () => {};

let eventSeq = 0;
function stripeEvent(type, object, id = `evt_${++eventSeq}`) {
  const payload = JSON.stringify({ id, object: 'event', api_version: '2024-06-20', created: Math.floor(Date.now() / 1000), type, data: { object } });
  const header = signer.webhooks.generateTestHeaderString({ payload, secret: globalThis.__ENV.STRIPE_WEBHOOK_SECRET });
  return new Request('http://site.test/api/stripe/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': header } });
}
const deliverEvent = (type, object, id) => webhook.POST({ request: stripeEvent(type, object, id) });

const LINES = [{ kind: 'package', id: 'normal-12m', label: 'Standard hirdetés', quantity: 1, unitCents: 12900 }];

function freshWorld(overrides = {}) {
  world.sent.length = 0; world.drafts.length = 0; world.stripeCalls.length = 0;
  for (const key of Object.keys(world.sessions)) delete world.sessions[key];
  world.db = createFakeDb({
    properties: [{ id: 'p1', ref: '1001', status: 'awaiting_payment', owner_id: 'u1', category: 'house', package: 'normal-12m', price_eur: 150000, floor_m2: 90, plot_m2: 400, ...overrides.property }],
    profiles: [{ id: 'u1', email: 'owner@example.test', locale: 'nl', role: 'owner' }, { id: 'u2', email: 'other@example.test', locale: 'hu', role: 'owner' }, { id: 'a1', email: 'admin@example.test', locale: 'hu', role: 'admin' }],
    property_translations: overrides.translations ?? [{ property_id: 'p1', locale: 'hu', title: 'Teszt ház', description: 'Szép ház 120 m².', body: '' }],
    translation_jobs: [],
    payments: [{ id: 'o1', property_id: 'p1', owner_id: 'u1', status: 'pending', amount_cents: 12900, discount_cents: 0, line_items: LINES, stripe_session_id: 'cs_1', ...overrides.payment }],
    activity_events: [],
    ...(overrides.services ? { site_settings: [{ id: 1, services: overrides.services }] } : {}),
  });
  runtime.clearRuntimeConfigCache();
  return world.db;
}
const row = (table, id) => world.db.table(table).find((r) => r.id === id);
const events = (kind) => world.db.table('activity_events').filter((e) => e.kind === kind);
const paidSession = (extra = {}) => ({ id: 'cs_1', payment_status: 'paid', metadata: { orderId: 'o1', propertyId: 'p1' }, customer_details: { name: 'Jan Jansen', email: 'owner@example.test' }, ...extra });

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/* ── The webhook ─────────────────────────────────────────────────────── */

test('a paid checkout publishes the listing, settles the order, e-mails once and drafts one invoice', async () => {
  freshWorld();
  const res = await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(res.status, 200);
  assert.equal(row('payments', 'o1').status, 'paid');
  assert.ok(row('payments', 'o1').paid_at);
  assert.equal(row('properties', 'p1').status, 'published');
  assert.ok(row('properties', 'p1').expires_at);
  assert.equal(events('listing.published').length, 1);
  assert.equal(world.sent.filter((m) => m.to === 'owner@example.test').length, 2, 'one "published" mail and one receipt');
  assert.deepEqual(world.drafts, ['o1']);
});

test('the same event delivered twice changes nothing the second time', async () => {
  freshWorld();
  await deliverEvent('checkout.session.completed', paidSession(), 'evt_same');
  const expires = row('properties', 'p1').expires_at;
  const mails = world.sent.length;
  const res = await deliverEvent('checkout.session.completed', paidSession(), 'evt_same');
  assert.equal(res.status, 200);
  assert.equal(row('properties', 'p1').expires_at, expires);
  assert.equal(events('listing.published').length, 1);
  assert.equal(world.sent.length, mails, 'no second mail');
  assert.equal(world.drafts.length, 1, 'no second invoice draft');
});

test('a retry under a new event id (Stripe resends) still publishes and bills once', async () => {
  freshWorld();
  await deliverEvent('checkout.session.completed', paidSession());
  const mails = world.sent.length;
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(events('listing.published').length, 1);
  assert.equal(world.sent.length, mails);
  assert.equal(world.drafts.length, 1);
});

test('a delayed method: "completed but unpaid" does nothing, the later success publishes', async () => {
  freshWorld();
  await deliverEvent('checkout.session.completed', paidSession({ payment_status: 'unpaid' }));
  assert.equal(row('payments', 'o1').status, 'pending');
  assert.equal(row('properties', 'p1').status, 'awaiting_payment');
  await deliverEvent('checkout.session.async_payment_succeeded', paidSession());
  assert.equal(row('payments', 'o1').status, 'paid');
  assert.equal(row('properties', 'p1').status, 'published');
});

test('a delayed payment that fails closes the order and publishes nothing', async () => {
  freshWorld();
  await deliverEvent('checkout.session.async_payment_failed', { id: 'cs_1' });
  assert.equal(row('payments', 'o1').status, 'cancelled');
  assert.equal(row('properties', 'p1').status, 'awaiting_payment');
});

test('an expired session leaves the order open so the owner can pay again', async () => {
  freshWorld();
  const res = await deliverEvent('checkout.session.expired', { id: 'cs_1', metadata: { orderId: 'o1' } });
  assert.equal(res.status, 200);
  assert.equal(row('payments', 'o1').status, 'pending');
  assert.equal(row('properties', 'p1').status, 'awaiting_payment');
});

test('an expired valuation session still closes its order', async () => {
  freshWorld({ payment: { property_id: null, stripe_session_id: 'cs_v' } });
  await deliverEvent('checkout.session.expired', { id: 'cs_v', metadata: { kind: 'valuation' } });
  assert.equal(row('payments', 'o1').status, 'cancelled');
});

test('money for a listing that was sent back is recorded and flagged for a refund decision, not published', async () => {
  freshWorld({ property: { status: 'changes_requested' } });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(row('payments', 'o1').status, 'paid');
  assert.equal(row('payments', 'o1').refund_required, true);
  assert.equal(row('properties', 'p1').status, 'changes_requested');
  assert.equal(events('listing.published').length, 0);
});

test('a session nobody knows is answered 200 (so Stripe does not retry for days) and changes nothing', async () => {
  freshWorld();
  const res = await deliverEvent('checkout.session.completed', paidSession({ id: 'cs_unknown' }));
  assert.equal(res.status, 200);
  assert.equal(row('payments', 'o1').status, 'pending');
  assert.equal(row('properties', 'p1').status, 'awaiting_payment');
});

test('an event type the site does not use is answered 200', async () => {
  freshWorld();
  const res = await deliverEvent('charge.refunded', { id: 'ch_1' });
  assert.equal(res.status, 200);
});

test('a renewal paid twice extends the listing once', async () => {
  const renewal = [{ kind: 'extra', id: 'renewal-6m', label: 'Hosszabbítás', quantity: 1, unitCents: 2500 }];
  const expiry = new Date(Date.now() + 10 * 86400000).toISOString();
  freshWorld({ property: { status: 'published', expires_at: expiry, published_at: '2026-01-01T00:00:00Z' }, payment: { line_items: renewal, amount_cents: 2500 } });
  await deliverEvent('checkout.session.completed', paidSession());
  const extended = row('properties', 'p1').expires_at;
  assert.ok(new Date(extended) > new Date(expiry));
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(row('properties', 'p1').expires_at, extended, 'second delivery must not add another six months');
});

/* ── Paid translations ───────────────────────────────────────────────── */

const WITH_TRANSLATIONS = [...LINES, { kind: 'extra', id: 'translation', label: 'Fordítás: 2 nyelv', quantity: 2, unitCents: 2500, locales: ['de', 'fr'] }];
const jobs = () => world.db.table('translation_jobs');

test('paying an order with translations publishes the listing and queues exactly those languages, once', async () => {
  freshWorld({ payment: { line_items: WITH_TRANSLATIONS, amount_cents: 17900 } });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(row('properties', 'p1').status, 'published');
  assert.deepEqual(jobs().map((j) => j.locale).sort(), ['de', 'fr']);
  assert.ok(jobs().every((j) => j.status === 'queued' && j.origin === 'upload_paid' && j.payment_id === 'o1' && j.source_locale === 'hu' && j.estimated_cost_micro_eur > 0));
});

test('a repeated delivery of the same payment queues nothing more', async () => {
  freshWorld({ payment: { line_items: WITH_TRANSLATIONS, amount_cents: 17900 } });
  await deliverEvent('checkout.session.completed', paidSession());
  await deliverEvent('checkout.session.completed', paidSession());
  await deliverEvent('checkout.session.completed', paidSession(), 'evt_again');
  assert.equal(jobs().length, 2);
});

test('even when the jobs are already done, a late repeat does not order them again', async () => {
  freshWorld({ payment: { line_items: WITH_TRANSLATIONS, amount_cents: 17900 } });
  await deliverEvent('checkout.session.completed', paidSession());
  jobs().forEach((j) => { j.status = 'done'; });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(jobs().length, 2);
  assert.ok(jobs().every((j) => j.status === 'done'));
});

test('a language the listing already has in a person\'s words is not translated over it', async () => {
  freshWorld({
    payment: { line_items: WITH_TRANSLATIONS, amount_cents: 17900 },
    translations: [{ property_id: 'p1', locale: 'hu', title: 'Ház', description: 'Szép.' }, { property_id: 'p1', locale: 'de', title: 'Haus', description: 'Schön.' }],
  });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.deepEqual(jobs().map((j) => j.locale), ['fr']);
});

test('money for a listing that was sent back queues no translations', async () => {
  freshWorld({ property: { status: 'changes_requested' }, payment: { line_items: WITH_TRANSLATIONS, amount_cents: 17900 } });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(jobs().length, 0);
});

test('translations bought later from a live listing queue only their languages and publish nothing', async () => {
  const later = [{ kind: 'extra', id: 'translation', label: 'Fordítás', quantity: 1, unitCents: 2500, locales: ['es'] }];
  const expiry = new Date(Date.now() + 90 * 86400000).toISOString();
  freshWorld({ property: { status: 'published', expires_at: expiry, published_at: '2026-01-01T00:00:00Z' }, payment: { line_items: later, amount_cents: 2500 } });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(row('payments', 'o1').status, 'paid');
  assert.deepEqual(jobs().map((j) => [j.locale, j.origin]), [['es', 'after_publish_paid']]);
  assert.equal(row('properties', 'p1').expires_at, expiry, 'a translation order never touches the expiry');
  assert.equal(events('listing.published').length, 0);
});

test('an order from before translations named their languages queues nothing (the office handles it by hand)', async () => {
  const old = [...LINES, { kind: 'extra', id: 'translation', label: 'Fordítás', quantity: 2, unitCents: 2500 }];
  freshWorld({ payment: { line_items: old, amount_cents: 17900 } });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(row('properties', 'p1').status, 'published');
  assert.equal(jobs().length, 0);
});

test('an unsigned or wrongly signed request is refused', async () => {
  freshWorld();
  const payload = JSON.stringify({ id: 'evt_x', object: 'event', type: 'checkout.session.completed', data: { object: paidSession() } });
  const bad = signer.webhooks.generateTestHeaderString({ payload, secret: 'whsec_somebody_else' });
  assert.equal((await webhook.POST({ request: new Request('http://site.test/x', { method: 'POST', body: payload }) })).status, 400);
  assert.equal((await webhook.POST({ request: new Request('http://site.test/x', { method: 'POST', body: payload, headers: { 'stripe-signature': bad } }) })).status, 400);
  assert.equal(row('payments', 'o1').status, 'pending');
});

/* ── The checkout ────────────────────────────────────────────────────── */

const pay = (user, body = { propertyId: 'p1' }, role = 'owner') =>
  checkout.POST({
    request: new Request('http://site.test/api/stripe/checkout', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }),
    locals: { supabase: world.db.client, user, profile: user ? { role } : null },
  });
const body = async (res) => res.json();

test('checkout needs a signed-in owner or admin of that listing', async () => {
  freshWorld({ payment: { stripe_session_id: null } });
  assert.equal((await pay(null)).status, 401);
  assert.equal((await pay({ id: 'u2' })).status, 403);
  assert.equal((await pay({ id: 'a1' }, { propertyId: 'p1' }, 'admin')).status, 200);
});

test('checkout builds the session from the stored order, ignoring anything the browser sends', async () => {
  freshWorld({ payment: { stripe_session_id: null } });
  const res = await pay({ id: 'u1' }, { propertyId: 'p1', amount: 1, price: 1, lines: [{ label: 'free', unitCents: 1, quantity: 1 }] });
  assert.equal(res.status, 200);
  const { create } = world.stripeCalls.find((c) => c.create);
  assert.equal(create.line_items.length, 1);
  assert.equal(create.line_items[0].price_data.unit_amount, 12900);
  assert.equal(create.metadata.orderId, 'o1');
  assert.equal(row('payments', 'o1').stripe_session_id.startsWith('cs_test_'), true);
});

test('checkout is refused unless the listing is awaiting payment', async () => {
  freshWorld({ property: { status: 'draft' }, payment: { stripe_session_id: null } });
  assert.equal((await pay({ id: 'u1' })).status, 409);
});

test('clicking pay twice gives the same open session, not a second one', async () => {
  freshWorld({ payment: { stripe_session_id: null } });
  const first = await body(await pay({ id: 'u1' }));
  const second = await body(await pay({ id: 'u1' }));
  assert.equal(first.url, second.url);
  assert.equal(world.stripeCalls.filter((c) => c.create).length, 1);
});

test('an owner who comes back after the session expired gets a fresh one and can still pay', async () => {
  freshWorld({ payment: { stripe_session_id: null } });
  const first = await body(await pay({ id: 'u1' }));
  const oldId = row('payments', 'o1').stripe_session_id;
  world.sessions[oldId].status = 'expired';
  await deliverEvent('checkout.session.expired', { id: oldId, metadata: { orderId: 'o1' } });
  const again = await pay({ id: 'u1' });
  assert.equal(again.status, 200);
  const next = await body(again);
  assert.notEqual(next.url, first.url);
  assert.notEqual(row('payments', 'o1').stripe_session_id, oldId);
  // …and paying the new session publishes the listing.
  await deliverEvent('checkout.session.completed', paidSession({ id: row('payments', 'o1').stripe_session_id }));
  assert.equal(row('properties', 'p1').status, 'published');
});

test('a session that has already been paid is not reopened', async () => {
  freshWorld({ payment: { stripe_session_id: null } });
  await pay({ id: 'u1' });
  const id = row('payments', 'o1').stripe_session_id;
  world.sessions[id].status = 'complete';
  world.sessions[id].payment_status = 'paid';
  const res = await pay({ id: 'u1' });
  assert.equal(res.status, 409);
  assert.equal((await body(res)).error, 'already-paid');
});

test('a referral discount reaches Stripe as a coupon, not a negative line', async () => {
  freshWorld({ payment: { stripe_session_id: null, discount_cents: 1000, amount_cents: 11900 } });
  await pay({ id: 'u1' });
  const { create } = world.stripeCalls.find((c) => c.create);
  assert.ok(create.line_items.every((l) => l.price_data.unit_amount > 0));
  assert.equal(create.discounts.length, 1);
  assert.equal(world.stripeCalls.find((c) => c.coupon).coupon.amount_off, 1000);
});

/* ── Buying translations for a live listing ──────────────────────────── */

const buy = (user, body, role = 'owner') =>
  translations.POST({
    params: { id: 'p1' },
    request: new Request('http://site.test/api/portal/properties/p1/translations', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }),
    locals: { supabase: world.db.client, user, profile: user ? { role, locale: 'nl', email: 'x@example.test' } : null },
  });
const live = { status: 'published', expires_at: new Date(Date.now() + 90 * 86400000).toISOString(), published_at: '2026-01-01T00:00:00Z' };
const noOrders = { payments: [] };

test('an owner buys languages for their live listing: one order from the catalogue, then Stripe', async () => {
  freshWorld({ property: live });
  world.db.table('payments').length = 0;
  // German is part of Go, so it is free and not on the order; Dutch and French are €1 each.
  const res = await buy({ id: 'u1' }, { action: 'order', locales: ['nl', 'de', 'fr', 'nl', 'hu', 'xx'], amount: 1, price: 1 });
  assert.equal(res.status, 200);
  const out = await body(res);
  assert.deepEqual(out.locales, ['nl', 'fr']);
  assert.equal(out.amountCents, 200);
  const order = world.db.table('payments')[0];
  assert.equal(order.status, 'pending');
  assert.equal(order.amount_cents, 200);
  assert.deepEqual(order.line_items.map((l) => [l.id, l.quantity, l.unitCents, l.locales]), [['translation', 2, 100, ['nl', 'fr']]]);
  const { create } = world.stripeCalls.find((c) => c.create);
  assert.equal(create.line_items[0].price_data.unit_amount, 100);
  assert.equal(create.line_items[0].quantity, 2);
  assert.equal(create.metadata.orderId, order.id);
  assert.equal(jobs().length, 0, 'nothing is translated before the money is in');
  // …and paying it queues exactly those two.
  await deliverEvent('checkout.session.completed', paidSession({ id: order.stripe_session_id, metadata: { orderId: order.id, propertyId: 'p1' } }));
  assert.deepEqual(jobs().map((j) => [j.locale, j.origin]).sort(), [['fr', 'after_publish_paid'], ['nl', 'after_publish_paid']]);
  assert.equal(events('listing.published').length, 0);
});

test('languages the listing already has, or is already getting, are not sold again; nothing left means no order', async () => {
  freshWorld({
    property: live,
    translations: [{ property_id: 'p1', locale: 'hu', title: 'Ház', description: 'Szép.' }, { property_id: 'p1', locale: 'de', title: 'Haus', description: 'Schön.' }],
  });
  world.db.table('payments').length = 0;
  jobs().push({ id: 'j1', property_id: 'p1', locale: 'fr', status: 'running' });
  const res = await buy({ id: 'u1' }, { action: 'order', locales: ['de', 'fr'] });
  assert.equal(res.status, 422);
  assert.equal((await body(res)).error, 'nothing-to-order');
  assert.equal(world.db.table('payments').length, 0);
});

test('changing your mind replaces the open translation order and closes its payment link', async () => {
  freshWorld({ property: live });
  world.db.table('payments').length = 0;
  await buy({ id: 'u1' }, { action: 'order', locales: ['nl'] });
  const first = world.db.table('payments')[0];
  await buy({ id: 'u1' }, { action: 'order', locales: ['nl', 'es'] });
  assert.equal(first.status, 'cancelled');
  assert.ok(world.stripeCalls.some((c) => c.expire === first.stripe_session_id));
  assert.deepEqual(world.db.table('payments').filter((p) => p.status === 'pending').map((p) => p.amount_cents), [200]);
});

test('only the owner or an admin can buy; a free-link listing requests instead; a listing that is not live cannot', async () => {
  freshWorld({ property: live });
  assert.equal((await buy(null, { action: 'order', locales: ['de'] })).status, 401);
  assert.equal((await buy({ id: 'u2' }, { action: 'order', locales: ['de'] })).status, 403);
  assert.equal((await buy({ id: 'u1' }, { action: 'run', locales: ['de'] })).status, 403, 'running is for admins');
  assert.equal((await buy({ id: 'u1' }, { action: 'approve', jobIds: ['x'] })).status, 403);
  freshWorld({ property: { ...live, free_listing: true } });
  assert.equal((await buy({ id: 'u1' }, { action: 'order', locales: ['de'] })).status, 409);
  freshWorld({ property: { status: 'draft' } });
  assert.equal((await buy({ id: 'u1' }, { action: 'order', locales: ['de'] })).status, 409);
  assert.equal(world.db.table('payments').filter((p) => p.id !== 'o1').length, 0);
});

test('a free-link owner\'s request waits for an admin; the admin approves one language and declines another', async () => {
  freshWorld({ property: { ...live, free_listing: true } });
  // German is part of Go: it comes with the listing and is not a request.
  const res = await buy({ id: 'u1' }, { action: 'request', locales: ['de', 'nl', 'es', 'hu'] });
  assert.deepEqual((await body(res)).created, ['nl', 'es']);
  assert.ok(jobs().every((j) => j.status === 'requested' && j.origin === 'free'));
  assert.equal(world.db.table('payments').filter((p) => p.id !== 'o1').length, 0, 'free means no order');
  const nl = jobs().find((j) => j.locale === 'nl').id;
  const es = jobs().find((j) => j.locale === 'es').id;
  assert.equal((await buy({ id: 'u1' }, { action: 'approve', jobIds: [nl] })).status, 403, 'the owner cannot approve their own request');
  assert.equal((await body(await buy({ id: 'a1' }, { action: 'approve', jobIds: [nl] }, 'admin'))).changed, 1);
  assert.equal((await body(await buy({ id: 'a1' }, { action: 'decline', jobIds: [es, 'not-mine'] }, 'admin'))).changed, 1);
  assert.deepEqual(jobs().map((j) => [j.locale, j.status]), [['nl', 'queued'], ['es', 'declined']]);
});

test('a paying owner cannot use the free request, and an admin\'s free run needs the AI switched on', async () => {
  freshWorld({ property: live });
  assert.equal((await buy({ id: 'u1' }, { action: 'request', locales: ['de'] })).status, 409);
  const res = await buy({ id: 'a1' }, { action: 'run', locales: ['de'] }, 'admin');
  assert.equal(res.status, 409);
  assert.equal((await body(res)).error, 'ai-disabled');
  assert.equal(jobs().length, 0);
});

test('a free-link owner can ask for a whole package: Go\'s languages and the ones they switched off are not asked for', async () => {
  freshWorld({ property: { ...live, free_listing: true } });
  const res = await buy({ id: 'u1' }, { action: 'request', packageId: 'europe', locales: [], excluded: ['pl', 'fr'] });
  const created = (await body(res)).created;
  assert.equal(created.includes('de') || created.includes('en'), false, 'Go comes with the listing');
  assert.equal(created.includes('pl') || created.includes('fr'), false, 'switched off');
  assert.equal(created.includes('nl') && created.includes('lt'), true);
  assert.ok(jobs().every((j) => j.status === 'requested' && j.origin === 'free'), 'requests, never run by themselves');
  assert.equal(world.db.table('payments').filter((p) => p.id !== 'o1').length, 0, 'no price, no order');
});

test('an owner buys the Európa package for a live listing: one order from the catalogue; paying it makes the entitlement and queues the languages', async () => {
  freshWorld({ property: { ...live, translation_package: 'basic', extra_locales: [], excluded_locales: [] } });
  world.db.table('payments').length = 0;
  const res = await buy({ id: 'u1' }, { action: 'order', packageId: 'europe', locales: [], excluded: ['pl'], amount: 1, price: 1 });
  assert.equal(res.status, 200);
  const out = await body(res);
  assert.equal(out.amountCents, 1200);
  const order = world.db.table('payments')[0];
  assert.deepEqual(order.line_items.map((l) => [l.id, l.packageId, l.unitCents]), [['translation-package', 'europe', 1200]]);
  assert.equal(order.line_items[0].locales.includes('pl'), false, 'switched off, and the price is the same');
  assert.equal(order.line_items[0].locales.includes('hu'), false);
  const { create } = world.stripeCalls.find((c) => c.create);
  assert.equal(create.line_items[0].price_data.unit_amount, 1200);
  assert.equal(jobs().length, 0, 'nothing is translated before the money is in');
  await deliverEvent('checkout.session.completed', paidSession({ id: order.stripe_session_id, metadata: { orderId: order.id, propertyId: 'p1' } }));
  const property = world.db.table('properties')[0];
  assert.equal(property.translation_package, 'europe');
  assert.deepEqual(property.excluded_locales, ['pl']);
  assert.equal(jobs().some((j) => j.locale === 'pl'), false);
  assert.equal(jobs().some((j) => j.locale === 'fr'), true);
  assert.equal(events('listing.published').length, 0);
});

test('an upgrade costs the difference, a package already held costs nothing, and English can never be switched off in an order', async () => {
  freshWorld({ property: { ...live, translation_package: 'europe', extra_locales: [], excluded_locales: [] } });
  world.db.table('payments').length = 0;
  const up = await buy({ id: 'u1' }, { action: 'order', packageId: 'world', locales: [] });
  assert.equal((await body(up)).amountCents, 1300, 'World €25 minus the Európa €12 already paid');
  assert.match(world.db.table('payments')[0].line_items[0].label, /bővítés|upgrade|uitbreiding/);
  const same = await buy({ id: 'u1' }, { action: 'order', packageId: 'europe', locales: [] });
  assert.equal(same.status, 422, 'nothing to buy');
  assert.equal((await body(same)).error, 'nothing-to-order');
  const forged = await buy({ id: 'u1' }, { action: 'order', packageId: 'world', locales: [], excluded: ['en'] });
  assert.equal(forged.status, 422);
  assert.equal((await body(forged)).error, 'exclude-en');
  freshWorld({ property: { ...live, translation_package: 'basic', extra_locales: [], excluded_locales: [] } });
  world.db.table('payments').length = 0;
  const ghost = await buy({ id: 'u1' }, { action: 'order', packageId: 'platinum', locales: ['nl'] });
  assert.equal((await body(ghost)).amountCents, 100, 'an unknown package is Go; the single language is still a single language');
});


/* ── The live pricing model (Basic / Europe / World, term and band) ───── */

// Gábor's table, typed out here on purpose: a typo in the code cannot also be a typo in the test. [package][band][term 1,3,6] in cents.
const TABLE = {
  basic: [[890, 1890, 2990], [1090, 2490, 3890], [1390, 2990, 4690]],
  europe: [[1290, 2790, 4390], [1690, 3800, 5990], [2090, 4600, 7190]],
  world: [[1690, 3800, 5990], [2190, 4990, 7690], [2790, 6290, 9590]],
};
const TERMS = [1, 3, 6];
const BAND_HUF = [10_000_000, 48_000_000, 250_000_000];
const LIVE = { pricingLive: true };
const liveCat = () => catalogLib.listingCatalog(LIVE);
const withTerm = (pkg, months) => ({ package: pkg, package_months: months, translation_package: 'basic', extra_locales: [], excluded_locales: [] });
const liveOrder = (selection, extra = {}) => {
  const lines = ordersLib.buildOrderLines({ extras: [], ...selection }, 'hu', liveCat());
  return { lines, payment: { stripe_session_id: null, line_items: lines, amount_cents: ordersLib.orderTotalCents(lines), ...extra } };
};

test('every one of the 27 cells reaches Stripe as exactly the table price in euro cents', async () => {
  for (const pkg of Object.keys(TABLE)) for (let band = 0; band < 3; band++) for (let t = 0; t < 3; t++) {
    const { payment } = liveOrder({ packageId: pkg, months: TERMS[t], priceHuf: BAND_HUF[band] });
    freshWorld({ property: withTerm(pkg, TERMS[t]), payment, services: LIVE });
    const res = await pay({ id: 'u1' });
    assert.equal(res.status, 200, `${pkg} ${TERMS[t]} band ${band}`);
    const { create } = world.stripeCalls.find((c) => c.create);
    assert.equal(create.line_items.length, 1);
    assert.equal(create.line_items[0].price_data.unit_amount, TABLE[pkg][band][t], `${pkg}, ${TERMS[t]} months, band ${band}`);
    assert.equal(Number.isInteger(create.line_items[0].price_data.unit_amount), true);
    assert.equal(create.line_items[0].price_data.currency, 'eur');
    assert.equal(create.line_items[0].quantity, 1);
    world.stripeCalls.length = 0;
  }
});

test('a paid Basic, Europe or World order publishes for the bought term, sets the package and entitlement, and a retry changes nothing', async () => {
  for (const pkg of ['basic', 'europe', 'world']) for (const months of TERMS) {
    const { payment } = liveOrder({ packageId: pkg, months, priceHuf: 48_000_000 });
    freshWorld({ property: withTerm(pkg, months), payment: { ...payment, stripe_session_id: 'cs_1' }, services: LIVE });
    const res = await deliverEvent('checkout.session.completed', paidSession(), `evt_${pkg}${months}`);
    assert.equal(res.status, 200);
    const property = row('properties', 'p1');
    assert.equal(property.status, 'published');
    assert.equal(property.package, pkg);
    assert.equal(property.package_months, months);
    assert.equal(property.translation_package, pkg, 'the paid package is the language package');
    const published = new Date(property.published_at);
    assert.equal(new Date(property.expires_at).toISOString(), rules.addMonths(published, months).toISOString(), `${pkg}: ${months} months from publishing, not the older package's length`);
    assert.equal(events('listing.published').length, 1);
    const before = JSON.stringify(property);
    await deliverEvent('checkout.session.completed', paidSession(), `evt_${pkg}${months}`);
    await deliverEvent('checkout.session.completed', paidSession(), `evt_again_${pkg}${months}`);
    assert.equal(JSON.stringify(row('properties', 'p1')), before, 'retries change nothing');
    assert.equal(events('listing.published').length, 1);
  }
});

test('languages the buyer switched off are on the listing before anything is translated, and never translated', async () => {
  const { payment } = liveOrder({ packageId: 'europe', months: 3, priceHuf: 48_000_000, translation: { packageId: 'europe', excludedLocales: ['fr', 'es'] } });
  freshWorld({ property: withTerm('europe', 3), payment: { ...payment, stripe_session_id: 'cs_1' }, services: LIVE });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.deepEqual(row('properties', 'p1').excluded_locales.sort(), ['es', 'fr']);
  const queued = world.db.table('translation_jobs').map((j) => j.locale);
  assert.equal(queued.includes('fr') || queued.includes('es'), false);
  assert.equal(queued.includes('en') && queued.includes('de') && queued.includes('sr'), true, 'the rest of Europe is queued');
  assert.equal(queued.includes('ar') || queued.includes('zh') || queued.includes('hu'), false, 'not the World-only languages, not the original');
});

test('a World listing is entitled to every language except the original', async () => {
  const { payment } = liveOrder({ packageId: 'world', months: 6, priceHuf: 250_000_000 });
  freshWorld({ property: withTerm('world', 6), payment: { ...payment, stripe_session_id: 'cs_1' }, services: LIVE });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(new Set(world.db.table('translation_jobs').map((j) => j.locale)).size, 27);
});

test('an upgrade publishes nothing and renews nothing: it moves the package and the languages, and the expiry stays', async () => {
  const expires = new Date(Date.now() + 60 * 86400000).toISOString();
  const { payment } = liveOrder({ packageId: 'world', upgradeFrom: 'basic', months: 3, tierIndex: 1 });
  freshWorld({ property: { ...live, ...withTerm('basic', 3), expires_at: expires, price_tier_index: 1 }, payment: { ...payment, stripe_session_id: 'cs_1' }, services: LIVE });
  assert.equal(payment.amount_cents, 4990 - 2490, 'the difference inside the band and the term');
  await deliverEvent('checkout.session.completed', paidSession());
  const property = row('properties', 'p1');
  assert.equal(property.package, 'world');
  assert.equal(property.translation_package, 'world');
  assert.equal(property.package_months, 3, 'the term is the one originally bought');
  assert.equal(property.expires_at, expires, 'the expiry date is unchanged');
  assert.equal(events('listing.published').length, 0);
  assert.equal(world.db.table('translation_jobs').some((j) => j.locale === 'ar'), true, 'the new languages are queued');
  await deliverEvent('checkout.session.completed', paidSession(), 'evt_up_2');
  assert.equal(row('properties', 'p1').expires_at, expires);
  assert.equal(world.db.table('translation_jobs').filter((j) => j.locale === 'ar').length, 1, 'once');
});

test('a renewal extends from the old expiry for the bought term; after the expiry it starts now; a retry adds nothing', async () => {
  const future = new Date(Date.now() + 20 * 86400000);
  const { payment } = liveOrder({ packageId: 'europe', months: 3, tierIndex: 1, renewal: true });
  freshWorld({ property: { ...live, ...withTerm('europe', 6), expires_at: future.toISOString() }, payment: { ...payment, stripe_session_id: 'cs_1' }, services: LIVE });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(new Date(row('properties', 'p1').expires_at).toISOString(), rules.addMonths(future, 3).toISOString(), 'three months from the old expiry');
  const once = row('properties', 'p1').expires_at;
  await deliverEvent('checkout.session.completed', paidSession(), 'evt_renew_2');
  assert.equal(row('properties', 'p1').expires_at, once, 'a retry adds nothing');
  // Expired a month ago: the new term starts now.
  const past = new Date(Date.now() - 30 * 86400000);
  freshWorld({ property: { status: 'archived', expired_at: past.toISOString(), expires_at: past.toISOString(), published_at: '2026-01-01T00:00:00Z', ...withTerm('europe', 6) }, payment: { ...payment, stripe_session_id: 'cs_1' }, services: LIVE });
  const before = Date.now();
  await deliverEvent('checkout.session.completed', paidSession());
  const renewed = new Date(row('properties', 'p1').expires_at).getTime();
  assert.equal(row('properties', 'p1').status, 'published');
  assert.ok(renewed >= rules.addMonths(new Date(before), 3).getTime() - 5000 && renewed <= rules.addMonths(new Date(), 3).getTime() + 5000, 'three months from now');
});

test('a referral discount equals referralDiscountCents of the package line and reaches Stripe as one coupon', async () => {
  const { lines } = liveOrder({ packageId: 'world', months: 6, priceHuf: 48_000_000 });
  const discount = ordersLib.referralDiscountCents(lines);
  assert.equal(discount, 769, '10% of 76,90 €');
  const { payment } = liveOrder({ packageId: 'world', months: 6, priceHuf: 48_000_000 });
  freshWorld({ property: withTerm('world', 6), payment: { ...payment, discount_cents: discount, amount_cents: 7690 - discount }, services: LIVE });
  await pay({ id: 'u1' });
  const { create } = world.stripeCalls.find((c) => c.create);
  assert.equal(create.line_items[0].price_data.unit_amount, 7690, 'the line keeps its price');
  assert.equal(world.stripeCalls.find((c) => c.coupon).coupon.amount_off, 769);
  assert.equal(create.discounts.length, 1);
});

test('an unpaid pro-forma on an older package stays payable and still publishes for that package\'s length', async () => {
  freshWorld({ services: LIVE });
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(row('properties', 'p1').status, 'published');
  const months = (new Date(row('properties', 'p1').expires_at).getFullYear() - new Date().getFullYear()) * 12 + new Date(row('properties', 'p1').expires_at).getMonth() - new Date().getMonth();
  assert.equal(months, 12, 'normal-12m is twelve months');
});

/* ── The wiring ──────────────────────────────────────────────────────── */

test('the checkout is given the signed-in session; the webhook and the anonymous valuation checkout are not', async () => {
  const { wantsSession } = await import('../src/middleware.ts');
  assert.equal(wantsSession('/api/stripe/checkout'), true, 'without a session the checkout answers 401 to everyone');
  assert.equal(wantsSession('/api/stripe/webhook'), false, 'Stripe has no session');
  assert.equal(wantsSession('/api/stripe/valuation-checkout'), false, 'valuation buyers are anonymous');
  assert.equal(wantsSession('/portal/properties/x'), true);
  assert.equal(wantsSession('/api/portal/payments/x/action'), true);
  assert.equal(wantsSession('/nl/tarieven/'), false);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (error) { failed++; console.log(`  ✗ ${name}\n      ${String(error.message).split('\n').slice(0, 4).join('\n      ')}`); }
}
console.log(failed ? `\n${failed} of ${tests.length} failed` : `\nAll ${tests.length} Stripe flow checks passed.`);
process.exit(failed ? 1 : 0);
