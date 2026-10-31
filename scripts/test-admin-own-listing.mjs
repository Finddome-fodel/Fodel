/**
 * An admin's own listing, offline: the site's real status route runs against an
 * in-memory database and a recording mailer. It proves what must hold:
 *
 *   - an admin who writes a listing for themselves is not asked to pay and is
 *     not e-mailed about their own submission;
 *   - approving it ("Közzététel") publishes it at once with no order at all;
 *   - a customer's listing is untouched by this: they still get their receipt
 *     and their order, and a seller still cannot approve anything.
 *
 *   npm run test:own-listing
 */
import assert from 'node:assert/strict';
import { register } from 'node:module';

globalThis.__ENV = { PAYMENT_GATES_PUBLISHING: 'true' };
register('./lib/stripe-test-hooks.mjs', import.meta.url);

const { createFakeDb } = await import('./lib/fake-supabase.mjs');
const { world } = await import('./lib/stubs/world.ts');
const status = await import('../src/pages/api/portal/properties/[id]/status.ts');
console.error = () => {};
console.warn = () => {};

const translations = [{ locale: 'hu', title: 'Családi ház Somogyban', description: 'Szép ház.' }];
function fresh(property = {}) {
  world.sent.length = 0;
  world.db = createFakeDb({
    properties: [{
      id: 'p1', ref: '1001', status: 'draft', owner_id: 'a1', category: 'house', package: 'normal-12m', price_eur: 150000, price_huf: 60000000,
      original_price: 60000000, floor_m2: 90, plot_m2: 400, country: 'HU', location_confirmed: true, lat: 46.4, lng: 17.8,
      property_group: 'house', property_subtype: 'house-villa', property_translations: translations, ...property,
    }],
    property_media: [{ id: 'm1', property_id: 'p1' }],
    profiles: [
      { id: 'u1', email: 'owner@example.test', locale: 'hu', role: 'owner', full_name: 'Eladó' },
      { id: 'a1', email: 'admin@example.test', locale: 'hu', role: 'admin', full_name: 'Admin' },
    ],
    payments: [],
    activity_events: [],
  });
}
const act = (userId, action, body = {}) => {
  const role = userId === 'a1' ? 'admin' : 'owner';
  return status.POST({
    params: { id: 'p1' },
    request: new Request('http://site.test/api/portal/properties/p1/status', { method: 'POST', body: JSON.stringify({ action, ...body }), headers: { 'content-type': 'application/json' } }),
    locals: { supabase: world.db.client, user: { id: userId }, profile: { role, locale: 'hu', email: `${role}@example.test` } },
  });
};
const prop = () => world.db.table('properties')[0];
const events = (kind) => world.db.table('activity_events').filter((e) => e.kind === kind);

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('an admin submitting their own listing is not e-mailed about it', async () => {
  fresh();
  const res = await act('a1', 'submit');
  assert.equal(res.status, 200);
  assert.equal(prop().status, 'submitted');
  assert.deepEqual(world.sent, []);
  assert.equal(events('listing.submit').length, 1, 'still in the activity log');
});

test('a customer submitting still gets their receipt', async () => {
  fresh({ owner_id: 'u1', free_listing: false });
  const res = await act('u1', 'submit');
  assert.equal(res.status, 422, 'a seller is held to the required facts, as before');
  fresh({ owner_id: 'a1' });
  prop().owner_id = 'u1';
  const adminForOwner = await act('a1', 'submit');
  assert.equal(adminForOwner.status, 200);
  assert.ok(world.sent.some((m) => m.to === 'owner@example.test'), 'the customer is told it was received');
});

test('approving an admin\'s own listing publishes it at once, with no order and no mail', async () => {
  fresh({ status: 'submitted' });
  const res = await act('a1', 'approve');
  assert.equal(res.status, 200);
  const out = await res.json();
  assert.equal(out.free, true);
  assert.equal(out.totalCents, 0);
  assert.equal(prop().status, 'published');
  assert.ok(prop().expires_at);
  assert.equal(world.db.table('payments').length, 0, 'no payment request is ever made');
  assert.deepEqual(world.sent, [], 'nobody is e-mailed that their own listing is live');
  assert.deepEqual(events('listing.approve').map((e) => e.payload.adminOwned), [true]);
});

test('a free-link seller\'s listing is still approved free, and the seller is told', async () => {
  fresh({ status: 'submitted', owner_id: 'u1', free_listing: true });
  const res = await act('a1', 'approve');
  assert.equal(res.status, 200);
  assert.equal(prop().status, 'published');
  assert.equal(world.db.table('payments').length, 0);
  assert.ok(world.sent.some((m) => m.to === 'owner@example.test'), 'the seller hears it is live');
});

test('a customer\'s ordinary listing still gets an order when approved', async () => {
  fresh({ status: 'submitted', owner_id: 'u1', free_listing: false });
  const res = await act('a1', 'approve', { order: { packageId: 'normal-12m' } });
  assert.equal(res.status, 200);
  assert.equal(world.db.table('payments').length, 1, 'the owner is asked to pay');
  assert.ok(world.sent.some((m) => m.to === 'owner@example.test'));
});

test('a seller can never approve, not even their own listing', async () => {
  fresh({ status: 'submitted', owner_id: 'u1' });
  const res = await act('u1', 'approve');
  assert.equal(res.status, 403);
  assert.equal(prop().status, 'submitted');
});

test('an admin\'s own listing that is not submitted yet cannot be approved', async () => {
  fresh({ status: 'draft' });
  const res = await act('a1', 'approve');
  assert.equal(res.status, 409);
  assert.equal(prop().status, 'draft');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (error) { failed++; console.log(`  ✗ ${name}\n      ${String(error.message).split('\n').slice(0, 6).join('\n      ')}`); }
}
console.log(failed ? `\n${failed} of ${tests.length} failed` : `\nAll ${tests.length} own-listing checks passed.`);
process.exit(failed ? 1 : 0);
