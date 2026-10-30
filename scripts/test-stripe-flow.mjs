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
  });
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
