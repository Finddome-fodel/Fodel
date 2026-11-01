/**
 * "Jóváhagyás ingyen", offline: the site's real status, webhook, checkout and
 * order routes run against an in-memory database, a Stripe stand-in and a
 * recording mailer (scripts/lib/stripe-test-hooks.mjs). It proves what must hold:
 *
 *   - a submitted listing goes live at once, with no order and one e-mail that
 *     says it was approved free of charge;
 *   - a listing waiting for payment has its díjbekérő voided and its card page
 *     closed, and the e-mail says the díjbekérő need not be paid;
 *   - a card payment that is already through stops it, and nothing changes;
 *   - a double click, a second tab or a second admin does it once, e-mails once;
 *   - only an admin can do it; a free-link or an admin's own listing is refused;
 *   - a late card payment on a waived order publishes nothing and is flagged for refund;
 *   - before migration 0045 it refuses cleanly and the ordinary approval still works.
 *
 *   npm run test:free-approval
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
const status = await import('../src/pages/api/portal/properties/[id]/status.ts');
const webhook = await import('../src/pages/api/stripe/webhook.ts');
const checkout = await import('../src/pages/api/stripe/checkout.ts');
const orderAction = await import('../src/pages/api/portal/payments/[id]/action.ts');
const { paymentStatusLabel } = await import('../src/lib/portal/labels.ts');
const { feeSource } = await import('../src/lib/portal/fee-source.ts');
const { cleanNote, isListingFeeOrder, FREE_APPROVAL_NOTE_MAX } = await import('../src/lib/portal/free-approval.ts');
console.error = () => {};
console.warn = () => {};

const LINES = [{ kind: 'package', id: 'normal-12m', label: 'Standard hirdetés', quantity: 1, unitCents: 12900 }];
const translations = [{ property_id: 'p1', locale: 'hu', title: 'Családi ház Somogyban', description: 'Szép ház.' }];

function fresh({ property = {}, payments = [], sessions = {}, missingColumns, owner = {} } = {}) {
  world.sent.length = 0; world.drafts.length = 0; world.stripeCalls.length = 0;
  for (const key of Object.keys(world.sessions)) delete world.sessions[key];
  Object.assign(world.sessions, sessions);
  world.db = createFakeDb({
    properties: [{
      id: 'p1', ref: '1001', status: 'submitted', owner_id: 'u1', category: 'house', package: 'normal-12m', price_eur: 150000, price_huf: 60000000,
      original_price: 60000000, floor_m2: 90, plot_m2: 400, country: 'HU', location_confirmed: true, lat: 46.4, lng: 17.8, free_listing: false,
      property_group: 'house', property_subtype: 'house-villa', property_translations: translations,
      ...(missingColumns ? {} : { free_approved_at: null, free_approved_by: null }), ...property,
    }],
    property_translations: translations,
    property_media: [{ id: 'm1', property_id: 'p1' }],
    profiles: [
      { id: 'u1', email: 'owner@example.test', locale: 'hu', role: 'owner', full_name: 'Eladó', ...owner },
      { id: 'a1', email: 'admin@example.test', locale: 'hu', role: 'admin', full_name: 'Admin' },
      { id: 'a2', email: 'admin2@example.test', locale: 'hu', role: 'admin', full_name: 'Másik admin' },
    ],
    payments,
    referrals: [],
    translation_jobs: [],
    activity_events: [],
  }, { missingColumns });
}
const order = (extra = {}) => ({ id: 'o1', property_id: 'p1', owner_id: 'u1', status: 'pending', amount_cents: 12900, discount_cents: 0, currency: 'eur', line_items: LINES, stripe_session_id: 'cs_1', waived_at: null, waived_by: null, ...extra });
const openSession = (extra = {}) => ({ cs_1: { id: 'cs_1', status: 'open', payment_status: 'unpaid', ...extra } });

const act = (userId, action, body = {}) => {
  const role = userId.startsWith('a') ? 'admin' : 'owner';
  return status.POST({
    params: { id: 'p1' },
    request: new Request('http://site.test/api/portal/properties/p1/status', { method: 'POST', body: JSON.stringify({ action, ...body }), headers: { 'content-type': 'application/json' } }),
    locals: { supabase: world.db.client, user: { id: userId }, profile: { role, locale: 'hu', email: `${userId}@example.test` } },
  });
};
const free = (body = {}, userId = 'a1') => act(userId, 'approve_free', body);
const prop = () => world.db.table('properties')[0];
const pay = (id = 'o1') => world.db.table('payments').find((row) => row.id === id);
const events = (kind) => world.db.table('activity_events').filter((e) => e.kind === kind);
const mailsTo = (to = 'owner@example.test') => world.sent.filter((m) => m.to === to);

const signer = new Stripe('sk_test_offline');
let seq = 0;
const deliverEvent = (type, object) => {
  const payload = JSON.stringify({ id: `evt_${++seq}`, object: 'event', api_version: '2024-06-20', created: Math.floor(Date.now() / 1000), type, data: { object } });
  const header = signer.webhooks.generateTestHeaderString({ payload, secret: globalThis.__ENV.STRIPE_WEBHOOK_SECRET });
  return webhook.POST({ request: new Request('http://site.test/api/stripe/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': header } }) });
};
const paidSession = () => ({ id: 'cs_1', payment_status: 'paid', metadata: { orderId: 'o1', propertyId: 'p1' }, customer_details: { name: 'Eladó', email: 'owner@example.test' } });

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/* ── From review ─────────────────────────────────────────────────────── */

test('a submitted listing is approved free: live at once, no order, one e-mail that says so', async () => {
  fresh();
  const res = await free({ note: '  Régi partner  ', packageId: 'normal-12m' });
  assert.equal(res.status, 200);
  const out = await res.json();
  assert.equal(out.ok, true);
  assert.equal(out.totalCents, 0);
  assert.deepEqual(out.waivedOrderIds, []);
  assert.equal(out.emailDelivered, true);
  assert.equal(prop().status, 'published');
  assert.ok(prop().expires_at, 'it runs for its package like any live listing');
  assert.ok(prop().free_approved_at);
  assert.equal(prop().free_approved_by, 'a1');
  assert.equal(prop().approved_by, 'a1');
  assert.equal(world.db.table('payments').length, 0, 'no díjbekérő is made');
  assert.equal(world.stripeCalls.length, 0, 'Stripe is never asked for anything');
  const mails = mailsTo();
  assert.equal(mails.length, 1, 'exactly one mail: not the generic "published" one as well');
  assert.match(mails[0].subject, /díjmentesen jóváhagytuk \(#1001\)/);
  assert.match(mails[0].text, /Családi ház Somogyban/);
  assert.doesNotMatch(mails[0].text, /díjbekérő/, 'nobody is told about a díjbekérő they never got');
  const [event] = events('listing.approve_free');
  assert.equal(event.actor_id, 'a1');
  assert.equal(event.payload.note, 'Régi partner', 'the internal note is kept, trimmed, in the admin-only log');
  assert.equal(event.payload.from, 'submitted');
  assert.equal(events('listing.published').length, 1);
});

test('the package the admin picked at review is the one it runs with; an unknown one is ignored', async () => {
  fresh({ property: { package: 'normal-12m' } });
  await free({ packageId: 'no-such-package' });
  assert.equal(prop().package, 'normal-12m');
});

test('the owner reads the e-mail in their own language', async () => {
  fresh({ owner: { locale: 'nl' } });
  await free();
  const [mail] = mailsTo();
  assert.doesNotMatch(mail.subject, /díjmentesen/);
  assert.match(mail.subject, /#1001/);
});

/* ── From "Fizetésre vár" ─────────────────────────────────────────────── */

test('awaiting payment: the díjbekérő is voided, the card page closed, the e-mail says it need not be paid', async () => {
  fresh({ property: { status: 'awaiting_payment', approved_at: '2026-10-30T10:00:00Z', approved_by: 'a2' }, payments: [order()], sessions: openSession() });
  const res = await free({ note: 'A vezetőség döntése' });
  assert.equal(res.status, 200);
  const out = await res.json();
  assert.deepEqual(out.waivedOrderIds, ['o1']);
  assert.equal(prop().status, 'published');
  assert.equal(prop().approved_by, 'a2', 'who reviewed it stays on record');
  assert.equal(pay().status, 'cancelled');
  assert.ok(pay().waived_at);
  assert.equal(pay().waived_by, 'a1');
  assert.equal(world.sessions.cs_1.status, 'expired', 'the open card page can no longer take money');
  assert.equal(paymentStatusLabel(pay()), 'Elengedve (ingyenes)');
  const mails = mailsTo();
  assert.equal(mails.length, 1);
  assert.match(mails[0].text, /díjbekérőt ezzel érvénytelenítettük/);
  assert.equal(events('listing.approve_free')[0].payload.waivedCents, 12900);
});

test('a card payment already through stops it: nothing is waived, nothing changes', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order()], sessions: openSession({ status: 'complete', payment_status: 'paid' }) });
  const res = await free();
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'payment-in-progress');
  assert.equal(prop().status, 'awaiting_payment');
  assert.equal(prop().free_approved_at, null, 'the claim is undone');
  assert.equal(pay().status, 'pending');
  assert.equal(world.sent.length, 0);
  assert.equal(events('listing.approve_free').length, 0);
});

test('a transfer recorded a moment earlier stops it, and the claim is undone', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order({ stripe_session_id: null })] });
  // The order is read as open, then settled by "Átutalás beérkezett" before the waiver lands.
  const realFrom = world.db.client.from;
  let reads = 0;
  world.db.client.from = (name) => {
    const query = realFrom(name);
    if (name === 'payments') {
      const update = query.update.bind(query);
      query.update = (patch) => {
        if (patch.status === 'cancelled' && reads++ === 0) pay().status = 'manual';
        return update(patch);
      };
    }
    return query;
  };
  const res = await free();
  world.db.client.from = realFrom;
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'already-paid');
  assert.equal(pay().status, 'manual');
  assert.equal(prop().status, 'awaiting_payment');
  assert.equal(prop().free_approved_at, null);
  assert.equal(world.sent.length, 0);
});

test('Stripe unreachable: refused, because "probably not paying" is not enough', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order()], sessions: openSession() });
  world.stripeDown = true;
  const res = await free();
  world.stripeDown = false;
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error, 'stripe-unreachable');
  assert.equal(pay().status, 'pending');
  assert.equal(prop().status, 'awaiting_payment');
  assert.equal(prop().free_approved_at, null);
  assert.equal(world.sent.length, 0);
});

test('a session Stripe no longer knows is no obstacle', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order({ stripe_session_id: 'cs_gone' })] });
  const res = await free();
  assert.equal(res.status, 200);
  assert.equal(pay().status, 'cancelled');
});

test('renewal and translation orders of the listing are left alone', async () => {
  fresh({
    property: { status: 'awaiting_payment' },
    payments: [order(), order({ id: 'o2', stripe_session_id: null, line_items: [{ kind: 'extra', id: 'renewal-6m', label: 'Hosszabbítás', quantity: 1, unitCents: 5000 }] })],
    sessions: openSession(),
  });
  await free();
  assert.equal(pay('o1').status, 'cancelled');
  assert.equal(pay('o2').status, 'pending');
});

test('a referral credit spent on the waived order is given back', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order({ discount_cents: 1290 })], sessions: openSession() });
  world.db.table('referrals').push(
    { id: 'r1', status: 'credited', credited_to: 'o1', referrer_id: 'u1' },
    { id: 'r2', status: 'applied', discount_applied_to: 'o1', referred_property_id: 'p1' },
  );
  await free();
  const [credit, discount] = world.db.table('referrals');
  assert.equal(credit.status, 'applied');
  assert.equal(credit.credited_to, null);
  assert.equal(discount.status, 'pending');
  assert.equal(discount.discount_applied_to, null);
});

/* ── Twice, by anyone, or by the wrong person ──────────────────────────── */

test('a double click, a second tab, a second admin: done once, e-mailed once', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order()], sessions: openSession() });
  const [a, b] = await Promise.all([free(), free({}, 'a2')]);
  const outs = [await a.json(), await b.json()];
  assert.ok(outs.every((o) => o.ok), JSON.stringify(outs));
  assert.equal(outs.filter((o) => o.already).length, 1);
  const third = await (await free()).json();
  assert.equal(third.already, true);
  assert.equal(mailsTo().length, 1);
  assert.equal(events('listing.approve_free').length, 1);
  assert.equal(events('listing.published').length, 1);
  assert.equal(prop().status, 'published');
});

test('only an admin: a seller is refused, even on their own listing', async () => {
  fresh();
  const res = await free({}, 'u1');
  assert.equal(res.status, 403);
  assert.equal(prop().status, 'submitted');
  assert.equal(prop().free_approved_at, null);
});

test('a free-link listing and an admin\'s own listing are free already: refused, the normal button is for them', async () => {
  fresh({ property: { free_listing: true } });
  let res = await free();
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'already-free');
  fresh({ property: { owner_id: 'a2' } });
  res = await free();
  assert.equal(res.status, 409);
  assert.equal(prop().status, 'submitted');
});

test('a draft, a listing sent back or a rejected one cannot be approved free', async () => {
  for (const state of ['draft', 'changes_requested', 'rejected', 'archived']) {
    fresh({ property: { status: state } });
    const res = await free();
    assert.equal(res.status, 409, state);
    assert.equal(prop().status, state);
  }
});

test('a listing let through free once, sent back and resubmitted, is a new decision', async () => {
  fresh({ property: { status: 'submitted', free_approved_at: '2026-09-01T10:00:00.000Z', free_approved_by: 'a2' } });
  const res = await free();
  const out = await res.json();
  assert.equal(out.already, undefined);
  assert.equal(prop().status, 'published');
  assert.equal(prop().free_approved_by, 'a1');
  assert.equal(mailsTo().length, 1);
});

test('the paid approval of such a listing clears the old free mark', async () => {
  fresh({ property: { status: 'submitted', free_approved_at: '2026-09-01T10:00:00.000Z', free_approved_by: 'a2' } });
  const res = await act('a1', 'approve', { order: { packageId: 'normal-12m' } });
  assert.equal(res.status, 200);
  assert.equal(prop().status, 'awaiting_payment');
  assert.equal(prop().free_approved_at, null);
  assert.equal(feeSource(prop()), null);
});

/* ── Without the payment gate: live first, paid later ─────────────────── */

test('a live listing with an open fee: the fee is let go, the listing is untouched', async () => {
  fresh({ property: { status: 'published', expires_at: '2027-10-01T00:00:00Z' }, payments: [order()], sessions: openSession() });
  const res = await free();
  assert.equal(res.status, 200);
  assert.equal(pay().status, 'cancelled');
  assert.equal(prop().expires_at, '2027-10-01T00:00:00Z');
  assert.equal(events('listing.published').length, 0, 'not published a second time');
  assert.match(mailsTo()[0].text, /érvénytelenítettük/);
});

test('a live listing with nothing open has nothing to let go', async () => {
  fresh({ property: { status: 'published' } });
  const res = await free();
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'nothing-to-waive');
  assert.equal(world.sent.length, 0);
});

/* ── Money arriving afterwards ────────────────────────────────────────── */

test('a card payment landing on a waived order is recorded and flagged, and publishes nothing', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order()], sessions: openSession() });
  await free();
  world.sent.length = 0;
  const before = events('listing.published').length;
  const res = await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(res.status, 200);
  assert.equal(pay().status, 'paid');
  assert.equal(pay().refund_required, true);
  assert.equal(events('listing.published').length, before, 'no second publish');
  assert.equal(world.sent.length, 0, 'no receipt for money that will be returned');
  assert.equal(world.drafts.length, 0, 'no invoice draft');
  assert.equal(events('payment.paid_after_waiver').length, 1);
  // Stripe repeats itself: nothing more happens.
  await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(events('payment.paid_after_waiver').length, 1);
});

test('a card page opened while the fee was being waived is closed again at once', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order({ stripe_session_id: null })] });
  const realFrom = world.db.client.from;
  // The waiver lands between the checkout reading the order and storing its session.
  world.db.client.from = (name) => {
    const query = realFrom(name);
    if (name === 'payments') {
      const update = query.update.bind(query);
      query.update = (patch) => {
        if ('stripe_session_id' in patch) Object.assign(pay(), { status: 'cancelled', waived_at: new Date().toISOString() });
        return update(patch);
      };
    }
    return query;
  };
  const res = await checkout.POST({
    request: new Request('http://site.test/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ propertyId: 'p1' }), headers: { 'content-type': 'application/json' } }),
    locals: { supabase: world.db.client, user: { id: 'u1' }, profile: { role: 'owner' } },
  });
  world.db.client.from = realFrom;
  assert.equal(res.status, 409);
  const created = world.stripeCalls.find((c) => c.create);
  assert.ok(created, 'a session had been made');
  assert.ok(world.stripeCalls.some((c) => c.expire), 'and was expired again');
  assert.equal(pay().stripe_session_id, null);
});

test('after the waiver the owner cannot open a card page at all', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order()], sessions: openSession() });
  await free();
  const res = await checkout.POST({
    request: new Request('http://site.test/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ propertyId: 'p1' }), headers: { 'content-type': 'application/json' } }),
    locals: { supabase: world.db.client, user: { id: 'u1' }, profile: { role: 'owner' } },
  });
  assert.ok(res.status >= 400);
  assert.equal(world.stripeCalls.filter((c) => c.create).length, 0);
});

test('a waived order cannot be marked paid or re-sent', async () => {
  fresh({ property: { status: 'awaiting_payment' }, payments: [order()], sessions: openSession() });
  await free();
  world.sent.length = 0;
  for (const action of ['mark_paid', 'resend_email']) {
    const res = await orderAction.POST({
      params: { id: 'o1' },
      request: new Request('http://site.test/api/portal/payments/o1/action', { method: 'POST', body: JSON.stringify({ action }), headers: { 'content-type': 'application/json' } }),
      locals: { supabase: world.db.client, user: { id: 'a1' }, profile: { role: 'admin', email: 'admin@example.test' } },
    });
    assert.equal(res.status, 409, action);
  }
  assert.equal(pay().status, 'cancelled');
  assert.equal(world.sent.length, 0);
});

/* ── Before migration 0045 ────────────────────────────────────────────── */

const MISSING = { properties: ['free_approved_at', 'free_approved_by'], payments: ['waived_at', 'waived_by'] };

test('before 0045: a clear refusal, and nothing changes', async () => {
  fresh({ missingColumns: MISSING });
  const res = await free();
  assert.equal(res.status, 503);
  const out = await res.json();
  assert.equal(out.error, 'migration-needed');
  assert.match(out.message, /0045/);
  assert.equal(prop().status, 'submitted');
  assert.equal(world.sent.length, 0);
});

test('before 0045: the ordinary paid approval and the card payment work exactly as before', async () => {
  fresh({ missingColumns: MISSING });
  const res = await act('a1', 'approve', { order: { packageId: 'normal-12m' } });
  assert.equal(res.status, 200);
  assert.equal(prop().status, 'awaiting_payment');
  const created = world.db.table('payments')[0];
  assert.ok(created);
  created.stripe_session_id = 'cs_1';
  const paid = await deliverEvent('checkout.session.completed', paidSession());
  assert.equal(paid.status, 200);
  assert.equal(created.status, 'paid');
  assert.equal(prop().status, 'published');
});

/* ── The small pieces ─────────────────────────────────────────────────── */

test('helpers: the note, the fee order, the label, the badge', () => {
  assert.equal(cleanNote('   '), null);
  assert.equal(cleanNote(42), null);
  assert.equal(cleanNote('x'.repeat(5000)).length, FREE_APPROVAL_NOTE_MAX);
  assert.equal(isListingFeeOrder(LINES), true);
  assert.equal(isListingFeeOrder([]), true);
  assert.equal(isListingFeeOrder([{ kind: 'extra', id: 'renewal-6m' }]), false);
  assert.equal(paymentStatusLabel({ status: 'cancelled' }), 'Visszavonva');
  assert.equal(paymentStatusLabel({ status: 'cancelled', waived_at: '2026-11-01T00:00:00Z' }), 'Elengedve (ingyenes)');
  assert.equal(feeSource({ free_listing: true }), 'free-link');
  assert.equal(feeSource({ free_approved_at: '2026-11-01T00:00:00Z' }), 'free-approval');
  assert.equal(feeSource({}, { adminOwned: true }), 'admin-own');
  assert.equal(feeSource({}), null);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (error) { failed++; console.log(`  ✗ ${name}\n      ${String(error.stack ?? error.message).split('\n').slice(0, 8).join('\n      ')}`); }
}
console.log(failed ? `\n${failed} of ${tests.length} failed` : `\nAll ${tests.length} free-approval checks passed.`);
process.exit(failed ? 1 : 0);
