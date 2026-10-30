/**
 * The translation job runner, offline: the site's real queue code
 * (src/lib/ai/translation-jobs.ts) and OpenAI client run against an in-memory
 * database and a local stand-in for the OpenAI API. It proves what must never go
 * wrong: a language is translated once however many workers run, a person's text
 * is never written over, a bad or failing answer is never saved, a wrong key stops
 * the run, and the daily spending guard holds.
 *
 *   npm run test:translation
 *
 * The claim and the save mirror the SQL in migration 0043; the SQL itself is
 * tested against PostgreSQL in scripts/test-listing-migration.mjs.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import { register } from 'node:module';

globalThis.__ENV = { AI_ENABLED: 'true', OPENAI_API_KEY: 'sk-offline-test' };
register('./lib/stripe-test-hooks.mjs', import.meta.url);

const { createFakeDb } = await import('./lib/fake-supabase.mjs');
const { world } = await import('./lib/stubs/world.ts');
const jobsLib = await import('../src/lib/ai/translation-jobs.ts');
console.error = () => {};
console.warn = () => {};

/* ── OpenAI stand-in ─────────────────────────────────────────────────── */
const stub = { mode: 'ok', calls: [], delay: 0 };
const server = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (chunk) => (raw += chunk));
  req.on('end', async () => {
    const body = JSON.parse(raw);
    stub.calls.push(body);
    if (stub.delay) await new Promise((r) => setTimeout(r, stub.delay));
    const send = (status, payload) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(payload)); };
    if (stub.mode === '401') return send(401, { error: { message: 'bad key sk-offline-test' } });
    if (stub.mode === '429quota') return send(429, { error: { code: 'insufficient_quota' } });
    if (stub.mode === '500') return send(500, { error: { message: 'boom' } });
    const system = body.messages[0].content;
    const language = /into ([^.]+)\./.exec(system)?.[1] ?? '?';
    const input = JSON.parse(body.messages[1].content).translate;
    const out = (text) => (text ? `[${language}] ${text}` : '');
    const answer = stub.mode === 'bad-numbers'
      ? { title: out(input.title), description: out(input.description).replace('120', '130'), body: out(input.body) }
      : { title: out(input.title), description: out(input.description), body: out(input.body) };
    send(200, { model: body.model, choices: [{ message: { content: JSON.stringify(answer) }, finish_reason: 'stop' }], usage: { prompt_tokens: 900, completion_tokens: 700 } });
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
globalThis.__ENV.OPENAI_BASE_URL = `http://127.0.0.1:${server.address().port}/v1`;

/* ── The database, with the two SQL functions mirrored ────────────────── */
const LIVE = ['requested', 'queued', 'running'];
const rpc = {
  claim_translation_jobs: ({ p_limit }, tables) => {
    const rows = tables.translation_jobs ?? [];
    const now = Date.now();
    const age = (job) => now - (job.claimed_at ? Date.parse(job.claimed_at) : 0);
    rows.filter((j) => j.status === 'running' && age(j) > 6 * 60_000 && j.attempts >= 3).forEach((j) => Object.assign(j, { status: 'failed', last_error: j.last_error ?? 'A feldolgozás megszakadt.' }));
    const take = rows
      .filter((j) => (j.status === 'queued' && (!j.claimed_at || age(j) > 20_000)) || (j.status === 'running' && age(j) > 6 * 60_000))
      .filter((j) => j.attempts < 3)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .slice(0, p_limit);
    take.forEach((j) => Object.assign(j, { status: 'running', claimed_at: new Date().toISOString(), attempts: j.attempts + 1 }));
    return { data: take.map((j) => ({ ...j })), error: null };
  },
  save_machine_translation: (a, tables) => {
    const rows = tables.property_translations;
    const existing = rows.find((r) => r.property_id === a.p_property && r.locale === a.p_locale);
    if (existing && !existing.machine && !a.p_overwrite) return { data: false, error: null };
    const next = { property_id: a.p_property, locale: a.p_locale, title: a.p_title, description: a.p_description, body: a.p_body ?? '', machine: true, translated_from: a.p_from, source_hash: a.p_hash };
    if (existing) Object.assign(existing, next); else rows.push(next);
    return { data: true, error: null };
  },
};
let seq = 0;
function fresh({ translations, jobs = [] } = {}) {
  stub.mode = 'ok'; stub.calls.length = 0; stub.delay = 0;
  delete globalThis.__ENV.TRANSLATION_DAILY_CAP_EUR;
  world.db = createFakeDb({
    properties: [{ id: 'p1', ref: '1001', status: 'published', owner_id: 'u1' }],
    property_translations: translations ?? [{ property_id: 'p1', locale: 'hu', title: 'Eladó ház', description: 'Szép ház 120 m² lakóterülettel.', body: 'Három szoba és nagy kert.' }],
    translation_jobs: jobs.map((j) => ({ id: `j${++seq}`, property_id: 'p1', source_locale: 'hu', origin: 'admin', status: 'queued', attempts: 0, overwrite: false, created_at: new Date(2026, 9, 30, 12, 0, seq).toISOString(), ...j })),
    activity_events: [],
  }, { rpc });
  return world.db;
}
const jobRows = () => world.db.table('translation_jobs');
const trRow = (locale) => world.db.table('property_translations').find((r) => r.locale === locale);
const run = (opts = {}) => jobsLib.processTranslationJobs(world.db.client, { budgetMs: 1500, ...opts });
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('queued languages are translated, saved as machine rows and costed from the real usage', async () => {
  fresh({ jobs: [{ locale: 'de' }, { locale: 'fr' }] });
  const result = await run();
  assert.equal(result.done, 2);
  assert.equal(stub.calls.length, 2);
  assert.match(trRow('de').title, /^\[German\] Eladó ház$/);
  assert.equal(trRow('de').machine, true);
  assert.equal(trRow('de').translated_from, 'hu');
  assert.ok(trRow('de').source_hash);
  assert.ok(jobRows().every((j) => j.status === 'done' && j.tokens_in === 900 && j.tokens_out === 700 && j.cost_micro_eur > 0 && j.model === 'gpt-4o-mini'));
  assert.equal(world.db.table('activity_events').filter((e) => e.kind === 'ai.translation_done').length, 2);
});

test('two workers at once translate each language exactly once', async () => {
  fresh({ jobs: [{ locale: 'de' }, { locale: 'fr' }, { locale: 'es' }, { locale: 'it' }, { locale: 'pl' }] });
  stub.delay = 30;
  await Promise.all([run(), run(), run()]);
  assert.equal(stub.calls.length, 5);
  assert.ok(jobRows().every((j) => j.status === 'done' && j.attempts === 1));
});

test('text a person wrote in the meantime is never written over', async () => {
  fresh({
    translations: [{ property_id: 'p1', locale: 'hu', title: 'Ház', description: 'Szép.' }, { property_id: 'p1', locale: 'de', title: 'Mein Haus', description: 'Schön.', machine: false }],
    jobs: [{ locale: 'de' }],
  });
  const result = await run();
  assert.equal(stub.calls.length, 0, 'not even asked');
  assert.equal(jobRows()[0].status, 'cancelled');
  assert.match(jobRows()[0].last_error, /kézzel írt/);
  assert.equal(trRow('de').title, 'Mein Haus');
  assert.equal(result.done, 0);
});

test('an admin who chose to overwrite replaces the person\'s text', async () => {
  fresh({
    translations: [{ property_id: 'p1', locale: 'hu', title: 'Ház', description: 'Szép.' }, { property_id: 'p1', locale: 'de', title: 'Mein Haus', description: 'Schön.', machine: false }],
    jobs: [{ locale: 'de', overwrite: true }],
  });
  await run();
  assert.equal(trRow('de').title, '[German] Ház');
  assert.equal(trRow('de').machine, true);
});

test('a machine translation is never the source for another one', async () => {
  fresh({ translations: [{ property_id: 'p1', locale: 'de', title: 'Haus', description: 'Schön.', machine: true }], jobs: [{ locale: 'fr' }] });
  await run();
  assert.equal(jobRows()[0].status, 'failed');
  assert.match(jobRows()[0].last_error, /forrásszöveg/);
  assert.equal(stub.calls.length, 0);
});

test('an answer that changes a number is not saved; it is retried, then fails with a readable reason', async () => {
  fresh({ jobs: [{ locale: 'de' }] });
  stub.mode = 'bad-numbers';
  await run();
  assert.equal(jobRows()[0].status, 'queued');
  assert.equal(jobRows()[0].attempts, 1);
  assert.match(jobRows()[0].last_error, /Számeltérés/);
  assert.equal(trRow('de'), undefined, 'nothing half-written');
  for (let i = 0; i < 2; i++) { jobRows()[0].claimed_at = new Date(Date.now() - 60_000).toISOString(); await run(); }
  assert.equal(jobRows()[0].status, 'failed');
  assert.equal(jobRows()[0].attempts, 3);
  assert.equal(trRow('de'), undefined);
  assert.equal(world.db.table('activity_events').filter((e) => e.kind === 'ai.translation_failed').length, 1);
});

test('a failed job waits before its next attempt instead of hammering the API', async () => {
  fresh({ jobs: [{ locale: 'de' }] });
  stub.mode = '500';
  await run();
  const calls = stub.calls.length;
  await run();
  assert.equal(stub.calls.length, calls, 'still inside the wait');
  assert.equal(jobRows()[0].status, 'queued');
});

test('a wrong key stops the whole run, fails the job at once and leaks nothing', async () => {
  fresh({ jobs: [{ locale: 'de' }, { locale: 'fr' }, { locale: 'es' }, { locale: 'it' }] });
  stub.mode = '401';
  const result = await run({ concurrency: 1 });
  assert.equal(result.stopped, true);
  assert.equal(jobRows().filter((j) => j.status === 'failed').length, 1);
  assert.equal(jobRows().filter((j) => j.status === 'queued').length, 3, 'the rest wait for a working key');
  assert.ok(!JSON.stringify(jobRows()).includes('sk-offline-test'));
  assert.equal(result.remaining, 3);
});

test('an empty OpenAI balance also stops the run', async () => {
  fresh({ jobs: [{ locale: 'de' }, { locale: 'fr' }] });
  stub.mode = '429quota';
  const result = await run({ concurrency: 1 });
  assert.equal(result.stopped, true);
  assert.match(jobRows().find((j) => j.status === 'failed').last_error, /egyenleg/);
});

test('the daily spending guard stops the run before anything is asked', async () => {
  fresh({ jobs: [{ locale: 'de' }] });
  globalThis.__ENV.TRANSLATION_DAILY_CAP_EUR = '1';
  world.db.table('translation_jobs').push({ id: 'old', property_id: 'p1', locale: 'nl', status: 'done', cost_micro_eur: 1_000_000, finished_at: new Date().toISOString(), attempts: 1, created_at: '2026-10-30T00:00:00Z' });
  const result = await run();
  assert.equal(result.capped, true);
  assert.equal(stub.calls.length, 0);
  assert.equal(jobRows().find((j) => j.locale === 'de').status, 'queued');
});

test('with AI switched off nothing is touched and the queue is reported', async () => {
  fresh({ jobs: [{ locale: 'de' }] });
  globalThis.__ENV.AI_ENABLED = 'false';
  const result = await run();
  globalThis.__ENV.AI_ENABLED = 'true';
  assert.equal(result.disabled, true);
  assert.equal(result.remaining, 1);
  assert.equal(jobRows()[0].status, 'queued');
  assert.equal(jobRows()[0].attempts, 0);
});

test('a run that was cut off leaves its job for the next worker, which takes it over after six minutes', async () => {
  fresh({ jobs: [{ locale: 'de', status: 'running', attempts: 1, claimed_at: new Date(Date.now() - 7 * 60_000).toISOString() }] });
  const result = await run();
  assert.equal(result.done, 1);
  assert.equal(jobRows()[0].attempts, 2);
});

/* ── Asking, approving, declining ─────────────────────────────────────── */

test('enqueueing skips the source language, unknown codes, human text and live jobs, and reports why', async () => {
  fresh({
    translations: [{ property_id: 'p1', locale: 'hu', title: 'Ház', description: 'Szép.' }, { property_id: 'p1', locale: 'de', title: 'Haus', description: 'Schön.' }],
    jobs: [{ locale: 'fr' }],
  });
  const result = await jobsLib.enqueueTranslations(world.db.client, { propertyId: 'p1', locales: ['hu', 'de', 'fr', 'es', 'xx', 'es'], origin: 'admin' });
  assert.deepEqual(result.created, ['es']);
  assert.deepEqual(Object.fromEntries(result.skipped.map((s) => [s.locale, s.reason])), { xx: 'invalid', hu: 'is-source', de: 'has-text', fr: 'already-live' });
});

test('a free-link owner\'s wish list becomes requests that do not run until an admin approves them', async () => {
  fresh();
  const client = world.db.client;
  await jobsLib.syncFreeRequests(client, 'p1', ['de', 'fr', 'lt'], 'u1');
  assert.deepEqual(jobRows().map((j) => [j.locale, j.status, j.origin]), [['de', 'requested', 'free'], ['fr', 'requested', 'free'], ['lt', 'requested', 'free']]);
  const idle = await run();
  assert.equal(stub.calls.length, 0, 'nothing runs by itself');
  assert.equal(idle.processed, 0);
  // The owner changes their mind: fr goes, es arrives, de stays and is not doubled.
  await jobsLib.syncFreeRequests(client, 'p1', ['de', 'lt', 'es'], 'u1');
  assert.deepEqual(jobRows().filter((j) => j.status === 'requested').map((j) => j.locale).sort(), ['de', 'es', 'lt']);
  assert.equal(jobRows().find((j) => j.locale === 'fr').status, 'cancelled');
  // The admin approves two and declines one.
  const id = (l) => jobRows().find((j) => j.locale === l && j.status === 'requested').id;
  assert.equal(await jobsLib.approveRequests(client, [id('de'), id('lt')], 'a1'), 2);
  assert.equal(await jobsLib.declineRequests(client, [id('es')], 'a1'), 1);
  const result = await run();
  assert.equal(result.done, 2);
  assert.deepEqual(['de', 'lt'].map((l) => trRow(l)?.machine), [true, true]);
  assert.equal(trRow('es'), undefined);
  assert.equal(await jobsLib.approveRequests(client, ['nope'], 'a1'), 0);
});

test('approving something that is no longer a request changes nothing', async () => {
  fresh({ jobs: [{ locale: 'de', status: 'done' }, { locale: 'fr', status: 'failed' }] });
  assert.equal(await jobsLib.approveRequests(world.db.client, jobRows().map((j) => j.id), 'a1'), 0);
  assert.deepEqual(jobRows().map((j) => j.status), ['done', 'failed']);
});

test('a failed job can be run again; one already running again cannot be doubled', async () => {
  fresh({ jobs: [{ locale: 'de', status: 'failed', attempts: 3, last_error: 'x' }] });
  assert.equal(await jobsLib.retryJob(world.db.client, jobRows()[0].id), true);
  assert.deepEqual([jobRows()[0].status, jobRows()[0].attempts, jobRows()[0].last_error], ['queued', 0, null]);
  assert.equal(await jobsLib.retryJob(world.db.client, jobRows()[0].id), false, 'it is not failed any more');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (error) { failed++; console.log(`  ✗ ${name}\n      ${String(error.message).split('\n').slice(0, 5).join('\n      ')}`); }
}
server.close();
console.log(failed ? `\n${failed} of ${tests.length} failed` : `\nAll ${tests.length} translation runner checks passed.`);
process.exit(failed ? 1 : 0);
