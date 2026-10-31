/**
 * The free upload link, offline: the site's real rules and sign-up code
 * (src/lib/portal/upload-link.ts, upload-signup.ts) against an in-memory
 * database and a stand-in for Supabase Auth. It proves what must hold:
 *
 *   - the link is made once, stays the same, and only its live secret opens it;
 *   - turning it off or replacing it closes the old copies at once;
 *   - leaving name, e-mail and phone makes one seller account and one free draft
 *     owned by it, with no e-mail sent and no role chosen by the visitor;
 *   - an address that already has an account or an open invitation is never
 *     given a second account, and a half-made account is never left behind.
 *
 *   npm run test:upload
 *
 * The page and the route are thin wrappers over these functions; the
 * table, its RLS and its grants are tested in scripts/test-listing-migration.mjs.
 */
import assert from 'node:assert/strict';
import { register } from 'node:module';

globalThis.__ENV = {};
register('./lib/stripe-test-hooks.mjs', import.meta.url);

const { createFakeDb } = await import('./lib/fake-supabase.mjs');
const { world } = await import('./lib/stubs/world.ts');
const link = await import('../src/lib/portal/upload-link.ts');
const { startFreeUpload } = await import('../src/lib/portal/upload-signup.ts');
console.error = () => {};

let nextRef = 1000;
function fresh({ profiles = [], invites = [], refError = false, profileError = false } = {}) {
  world.sent.length = 0;
  world.db = createFakeDb(
    { profiles, invites, properties: [], property_translations: [], free_upload_link: [], activity_events: [] },
    { rpc: { next_property_ref: () => (refError ? { data: null, error: { message: 'no ref' } } : { data: String(++nextRef), error: null }) } }
  );
  const users = [];
  const deleted = [];
  const client = world.db.client;
  const admin = {
    from: (name) => {
      const query = client.from(name);
      if (profileError && name === 'profiles') query.insert = () => ({ then: (resolve) => resolve({ data: null, error: { message: 'boom' } }) });
      return query;
    },
    rpc: client.rpc,
    auth: {
      admin: {
        createUser: async ({ email, password, email_confirm }) => {
          if (users.some((u) => u.email === email)) return { data: { user: null }, error: { message: 'A user with this email address has already been registered' } };
          const user = { id: `user-${users.length + 1}`, email, password, email_confirm };
          users.push(user);
          return { data: { user }, error: null };
        },
        deleteUser: async (id) => { deleted.push(id); const at = users.findIndex((u) => u.id === id); if (at >= 0) users.splice(at, 1); world.db.tables.profiles = world.db.table('profiles').filter((p) => p.id !== id); return { error: null }; },
      },
    },
  };
  return { admin, users, deleted };
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const input = { name: 'Kovács Anna', email: 'Anna@Example.hu', phone: '+36301234567', locale: 'hu' };

/* ── The rules ─────────────────────────────────────────────────────────── */

test('a token is long, URL-safe and different every time', () => {
  const a = link.newUploadToken();
  assert.match(a, /^[A-Za-z0-9_-]{32}$/);
  assert.notEqual(a, link.newUploadToken());
  assert.equal(link.looksLikeUploadToken(a), true);
  for (const bad of ['', 'short', 'new', 'a'.repeat(21) + '/', undefined, null, 42, 'a b'.repeat(10)]) assert.equal(link.looksLikeUploadToken(bad), false, String(bad));
});

test('the link address is the origin, the fixed path and the secret', () => {
  assert.equal(link.uploadLinkUrl('https://www.finddome.com', 'abc'), 'https://www.finddome.com/portal/upload/abc');
  assert.equal(link.uploadLinkUrl('https://www.finddome.com/', 'abc'), 'https://www.finddome.com/portal/upload/abc');
});

test('secrets are compared whatever their length', () => {
  assert.equal(link.sameToken('abc', 'abc'), true);
  assert.equal(link.sameToken('abc', 'abd'), false);
  assert.equal(link.sameToken('abc', 'abcd'), false);
});

test('a missing table is recognised, other errors are not mistaken for it', () => {
  assert.equal(link.isMissingUploadLinkSchema({ code: '42P01', message: 'x' }), true);
  assert.equal(link.isMissingUploadLinkSchema({ code: 'PGRST205', message: 'x' }), true);
  assert.equal(link.isMissingUploadLinkSchema({ message: 'Could not find the table public.free_upload_link in the schema cache' }), true);
  assert.equal(link.isMissingUploadLinkSchema({ code: '23505', message: 'duplicate key' }), false);
  assert.equal(link.isMissingUploadLinkSchema(null), false);
});

test('the form needs a name, an address, a real phone number and the consent', () => {
  const ok = link.validateUploadSignup({ name: '  Kovács   Anna ', email: ' Anna@Example.hu ', phone: '06 30 123 4567', consent: 'yes' }, 'hu');
  assert.deepEqual(ok, { ok: true, values: { name: 'Kovács Anna', email: 'anna@example.hu', phone: '+36301234567' } });

  const none = link.validateUploadSignup({}, 'hu');
  assert.deepEqual(none.ok === false && Object.keys(none.errors).sort(), ['consent', 'email', 'name', 'phone']);

  assert.deepEqual(link.validateUploadSignup({ name: 'A', email: 'not-an-address', phone: '+36301234567', consent: 'yes' }, 'hu').errors, { email: true });
  assert.deepEqual(link.validateUploadSignup({ name: 'A', email: 'a@b.hu', phone: '123', consent: 'yes' }, 'hu').errors, { phone: true });
  assert.deepEqual(link.validateUploadSignup({ name: 'A', email: 'a@b.hu', phone: '+36301234567', consent: 'no' }, 'hu').errors, { consent: true });
  assert.deepEqual(link.validateUploadSignup({ name: 'x'.repeat(121), email: 'a@b.hu', phone: '+36301234567', consent: 'yes' }, 'hu').errors, { name: true });
});

test('a foreign number is read with its own prefix; a bare Dutch number follows the page language', () => {
  assert.equal(link.validateUploadSignup({ name: 'A', email: 'a@b.nl', phone: '+31 6 12345678', consent: 'yes' }, 'hu').values.phone, '+31612345678');
  assert.equal(link.validateUploadSignup({ name: 'A', email: 'a@b.nl', phone: '06 12345678', consent: 'yes' }, 'nl').values.phone, '+31612345678');
});

/* ── The stored link ───────────────────────────────────────────────────── */

test('the link is made the first time it is asked for and is the same afterwards', async () => {
  fresh();
  const client = world.db.client;
  assert.equal((await link.readUploadLink(client)).row, null);
  const first = (await link.ensureUploadLink(client)).row;
  assert.equal(first.enabled, true);
  assert.equal(link.looksLikeUploadToken(first.token), true);
  const again = (await link.ensureUploadLink(client)).row;
  assert.equal(again.token, first.token);
  assert.equal(world.db.table('free_upload_link').length, 1);
});

test('only the live secret opens the link', async () => {
  fresh();
  const client = world.db.client;
  const { row } = await link.ensureUploadLink(client);
  assert.equal(await link.checkUploadToken(client, row.token), 'ok');
  assert.equal(await link.checkUploadToken(client, link.newUploadToken()), 'invalid');
  assert.equal(await link.checkUploadToken(client, 'new'), 'invalid');
  assert.equal(await link.checkUploadToken(client, undefined), 'invalid');
});

test('before the link exists nothing opens', async () => {
  fresh();
  assert.equal(await link.checkUploadToken(world.db.client, link.newUploadToken()), 'invalid');
});

test('turning it off closes the link without changing it; turning it on opens the same one', async () => {
  fresh();
  const client = world.db.client;
  const { row } = await link.ensureUploadLink(client);
  await link.setUploadLinkEnabled(client, false);
  assert.equal(await link.checkUploadToken(client, row.token), 'off');
  await link.setUploadLinkEnabled(client, true);
  assert.equal(await link.checkUploadToken(client, row.token), 'ok');
});

test('a new link retires the old one at once and switches the link back on', async () => {
  fresh();
  const client = world.db.client;
  const old = (await link.ensureUploadLink(client)).row.token;
  await link.setUploadLinkEnabled(client, false);
  await link.rotateUploadLink(client);
  const next = (await link.readUploadLink(client)).row;
  assert.notEqual(next.token, old);
  assert.equal(next.enabled, true);
  assert.ok(next.rotated_at);
  assert.equal(await link.checkUploadToken(client, old), 'invalid');
  assert.equal(await link.checkUploadToken(client, next.token), 'ok');
});

test('an unread or missing table is "unavailable", never a crash or an open door', async () => {
  const broken = (error) => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error }) }) }) }) });
  const token = link.newUploadToken();
  assert.equal(await link.checkUploadToken(broken({ code: '42P01', message: 'x' }), token), 'unavailable');
  assert.equal(await link.checkUploadToken(broken({ code: '08006', message: 'connection' }), token), 'unavailable');
  assert.deepEqual(await link.readUploadLink(broken({ code: '42P01', message: 'x' })), { row: null, missingSchema: true });
  await assert.rejects(link.rotateUploadLink(broken({ code: '42P01', message: 'x' })), /missing-schema/);
});

/* ── Leaving the details ───────────────────────────────────────────────── */

test('a new person gets a seller account, is signed in and gets one free draft in their name', async () => {
  const { admin, users } = fresh();
  const signedIn = [];
  const result = await startFreeUpload(admin, input, async (email, password) => { signedIn.push({ email, password }); return true; });

  assert.equal(result.ok, true);
  assert.equal(users.length, 1);
  assert.equal(users[0].email, 'anna@example.hu');
  assert.equal(users[0].email_confirm, true);
  assert.ok(users[0].password.length >= 24, 'a password nobody ever sees');
  assert.deepEqual(signedIn, [{ email: 'anna@example.hu', password: users[0].password }]);

  const profile = world.db.table('profiles');
  assert.deepEqual(profile.map((p) => [p.id, p.role, p.full_name, p.email, p.phone, p.locale]), [['user-1', 'owner', 'Kovács Anna', 'anna@example.hu', '+36301234567', 'hu']]);

  const property = world.db.table('properties');
  assert.equal(property.length, 1);
  assert.equal(result.draftId, property[0].id);
  assert.equal(property[0].owner_id, 'user-1');
  assert.equal(property[0].status, 'draft');
  assert.equal(property[0].free_listing, true);
  assert.equal(property[0].seller_name, 'Kovács Anna');
  assert.equal(property[0].seller_phone, '+36301234567');

  assert.deepEqual(world.sent, [], 'no e-mail of any kind');
  assert.deepEqual(world.db.table('activity_events').map((e) => [e.kind, e.source]), [['upload_link.signup', 'upload_link']]);
  assert.equal(world.db.table('invites').length, 0, 'no invitation is made');
});

test('the language of the page becomes the seller\'s language', async () => {
  const { admin } = fresh();
  await startFreeUpload(admin, { ...input, locale: 'nl' }, async () => true);
  assert.equal(world.db.table('profiles')[0].locale, 'nl');
});

test('an address that already has an account is refused and nothing is made', async () => {
  const { admin, users } = fresh({ profiles: [{ id: 'old', email: 'anna@example.hu', role: 'owner' }] });
  const result = await startFreeUpload(admin, input, async () => true);
  assert.deepEqual(result, { ok: false, error: 'exists' });
  assert.equal(users.length, 0);
  assert.equal(world.db.table('properties').length, 0);
});

test('an address the auth system already knows (no profile) is treated as taken', async () => {
  const { admin, users } = fresh();
  users.push({ id: 'ghost', email: 'anna@example.hu' });
  assert.deepEqual(await startFreeUpload(admin, input, async () => true), { ok: false, error: 'exists' });
  assert.equal(world.db.table('properties').length, 0);
});

test('someone with an open invitation is sent back to it; an expired one does not block', async () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const past = new Date(Date.now() - 86_400_000).toISOString();
  let setup = fresh({ invites: [{ id: 'i1', email: 'anna@example.hu', accepted_at: null, expires_at: future }] });
  assert.deepEqual(await startFreeUpload(setup.admin, input, async () => true), { ok: false, error: 'invited' });
  assert.equal(setup.users.length, 0);

  setup = fresh({ invites: [{ id: 'i2', email: 'anna@example.hu', accepted_at: null, expires_at: past }, { id: 'i3', email: 'anna@example.hu', accepted_at: past, expires_at: future }] });
  assert.equal((await startFreeUpload(setup.admin, input, async () => true)).ok, true);
});

test('if the profile cannot be written the new login is removed, so the person can simply try again', async () => {
  const { admin, users, deleted } = fresh({ profileError: true });
  assert.deepEqual(await startFreeUpload(admin, input, async () => true), { ok: false, error: 'failed' });
  assert.deepEqual(deleted, ['user-1']);
  assert.equal(users.length, 0);
  assert.equal(world.db.table('properties').length, 0);
});

test('if signing in fails the account is removed rather than left with a password nobody knows', async () => {
  const { admin, users, deleted } = fresh();
  assert.deepEqual(await startFreeUpload(admin, input, async () => false), { ok: false, error: 'failed' });
  assert.deepEqual(deleted, ['user-1']);
  assert.equal(users.length, 0);
  assert.equal(world.db.table('profiles').length, 0);
  assert.equal(world.db.table('properties').length, 0);
});

test('if only the draft fails the person keeps their account and is signed in (they start a listing by hand)', async () => {
  const { admin, users } = fresh({ refError: true });
  const result = await startFreeUpload(admin, input, async () => true);
  assert.deepEqual(result, { ok: true, draftId: null });
  assert.equal(users.length, 1);
  assert.equal(world.db.table('properties').length, 0);
});

test('the same address twice makes one account', async () => {
  const { admin, users } = fresh();
  const [a, b] = [await startFreeUpload(admin, input, async () => true), null];
  assert.equal(a.ok, true);
  // The profile now exists, as it would in the database.
  const again = await startFreeUpload(admin, { ...input, email: 'ANNA@example.hu' }, async () => true);
  assert.deepEqual(again, { ok: false, error: 'exists' });
  assert.equal(users.length, 1);
  void b;
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (error) { failed++; console.log(`  ✗ ${name}\n      ${String(error.message).split('\n').slice(0, 6).join('\n      ')}`); }
}
console.log(failed ? `\n${failed} of ${tests.length} failed` : `\nAll ${tests.length} upload link checks passed.`);
process.exit(failed ? 1 : 0);
