/**
 * Publishing with a bought language that is failed or missing, offline: the site's real status route runs
 * against an in-memory database. It proves what must hold:
 *
 *   - approving is refused, with the list, while a bought language is failed, missing or out of date,
 *     until the admin says they know (acknowledgeLanguages);
 *   - a language still being made is only news: it never blocks;
 *   - a listing with nothing bought, a language that is fine, or one that was excluded is not held back;
 *   - before migration 0052 (no overview) nothing is held back at all.
 *
 *   npm run test:language-gate
 */
import assert from 'node:assert/strict';
import { register } from 'node:module';

globalThis.__ENV = {};
register('./lib/stripe-test-hooks.mjs', import.meta.url);

const { createFakeDb } = await import('./lib/fake-supabase.mjs');
const { world } = await import('./lib/stubs/world.ts');
const status = await import('../src/pages/api/portal/properties/[id]/status.ts');
const overview = await import('../src/lib/ai/translation-overview.ts');
const core = await import('../src/lib/ai/translate-core.ts');
console.error = () => {};
console.warn = () => {};

const hu = { property_id: 'p1', locale: 'hu', title: 'Családi ház Somogyban', description: 'Szép ház.', body: '', machine: false };
const HASH = core.sourceHash(core.listingText(hu));
const fact = (locale, over = {}) => ({ property_id: 'p1', locale, excluded: false, has_text: false, machine: null, manual_override: null, needs_review: null, translated_from: null, source_hash: null, validated_at: null, check_warnings: null, job_id: null, job_status: null, job_origin: null, fail_code: null, last_error: null, attempts: null, job_finished_at: null, ...over });
const job = (locale, origin, st) => ({ id: `j-${locale}`, property_id: 'p1', locale, origin, status: st });

function fresh({ jobs = [], matrix = [], matrixMissing = false } = {}) {
  world.sent.length = 0;
  world.db = createFakeDb({
    properties: [{
      id: 'p1', ref: '1001', status: 'submitted', owner_id: 'u1', category: 'house', package: 'normal-12m', price_eur: 150000, price_huf: 60000000,
      original_price: 60000000, floor_m2: 90, plot_m2: 400, country: 'HU', location_confirmed: true, lat: 46.4, lng: 17.8, free_listing: true,
      property_group: 'house', property_subtype: 'house-villa', property_translations: [hu],
    }],
    property_translations: [hu],
    property_media: [{ id: 'm1', property_id: 'p1' }],
    profiles: [
      { id: 'u1', email: 'owner@example.test', locale: 'hu', role: 'owner', full_name: 'Eladó' },
      { id: 'a1', email: 'admin@example.test', locale: 'hu', role: 'admin', full_name: 'Admin' },
    ],
    translation_jobs: jobs,
    ...(matrixMissing ? {} : { translation_matrix: matrix }),
    payments: [],
    activity_events: [],
  });
}
const approve = (body = {}) => status.POST({
  params: { id: 'p1' },
  request: new Request('http://site.test/api/portal/properties/p1/status', { method: 'POST', body: JSON.stringify({ action: 'approve', ...body }), headers: { 'content-type': 'application/json' } }),
  locals: { supabase: world.db.client, user: { id: 'a1' }, profile: { role: 'admin', locale: 'hu', email: 'admin@example.test' } },
});
const prop = () => world.db.table('properties')[0];

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('a bought language that failed holds the approval until the admin says they know', async () => {
  fresh({ jobs: [job('pl', 'upload_paid', 'failed')], matrix: [fact('pl', { job_status: 'failed', job_origin: 'upload_paid', fail_code: 'too-long' })] });
  const refused = await approve();
  assert.equal(refused.status, 409);
  const body = await refused.json();
  assert.equal(body.error, 'languages-incomplete');
  assert.deepEqual(body.problems.map((p) => [p.locale, p.status]), [['pl', 'failed']]);
  assert.match(body.message, /lengyel/);
  assert.equal(prop().status, 'submitted', 'nothing changed');
  const ok = await approve({ acknowledgeLanguages: true });
  assert.equal(ok.status, 200);
  assert.equal(prop().status, 'published');
});

test('a bought language whose source changed since, or that has no text at all, also asks', async () => {
  fresh({ jobs: [job('de', 'after_publish_paid', 'done'), job('fr', 'package', 'cancelled'), job('es', 'upload_paid', 'done')], matrix: [fact('de', { has_text: true, machine: true, translated_from: 'hu', source_hash: 'OLD', job_status: 'done', job_origin: 'after_publish_paid' })] });
  const body = await (await approve()).json();
  assert.deepEqual(body.problems.map((p) => [p.locale, p.status]).sort(), [['de', 'stale'], ['es', 'missing']], 'a cancelled order is not a bought language');
});

test('a language still being made is news, not a stop', async () => {
  fresh({ jobs: [job('pl', 'upload_paid', 'queued')], matrix: [fact('pl', { job_status: 'queued', job_origin: 'upload_paid' })] });
  assert.equal((await approve()).status, 200);
  const found = await overview.publishLanguageProblems(world.db.client, 'p1');
  assert.deepEqual([found.blocking.length, found.waiting.map((p) => p.locale)], [0, ['pl']], 'it is listed as waiting, never as blocking');
});

test('nothing bought, a language that is fine, an excluded one: no stop', async () => {
  fresh({ jobs: [job('it', 'admin', 'failed'), job('nl', 'free', 'requested')], matrix: [fact('it', { job_status: 'failed', job_origin: 'admin' })] });
  assert.equal((await approve()).status, 200, 'admin and free requests are not purchases');
  fresh({ jobs: [job('pl', 'upload_paid', 'done'), job('sk', 'upload_paid', 'done')], matrix: [fact('pl', { has_text: true, machine: true, translated_from: 'hu', source_hash: HASH, job_status: 'done', job_origin: 'upload_paid' }), fact('sk', { excluded: true, has_text: true, machine: true, translated_from: 'hu', source_hash: HASH })] });
  assert.equal((await approve()).status, 200);
});

test('a "needs review" language is published text, so it does not stop an approval', async () => {
  fresh({ jobs: [job('pl', 'upload_paid', 'done')], matrix: [fact('pl', { has_text: true, machine: true, needs_review: true, translated_from: 'hu', source_hash: HASH, job_status: 'done', job_origin: 'upload_paid' })] });
  assert.equal((await approve()).status, 200);
});

test('before migration 0052 there is no overview and nothing is held back', async () => {
  fresh({ jobs: [job('pl', 'upload_paid', 'failed')], matrixMissing: true });
  const real = world.db.client;
  // What PostgREST answers for a view that does not exist yet.
  const dead = new Proxy({}, { get: (_, p) => (p === 'then' ? (resolve) => resolve({ data: null, error: { code: 'PGRST205', message: "Could not find the table 'public.translation_matrix' in the schema cache" } }) : () => dead) });
  world.db.client = { rpc: real.rpc, from: (table) => (table === 'translation_matrix' ? dead : real.from(table)) };
  assert.equal((await approve()).status, 200);
  world.db.client = real;
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (error) { failed++; console.log(`  ✗ ${name}\n      ${String(error.message).split('\n').slice(0, 6).join('\n      ')}`); }
}
console.log(failed ? `\n${failed} of ${tests.length} failed` : `\nAll ${tests.length} language-gate checks passed.`);
process.exit(failed ? 1 : 0);
