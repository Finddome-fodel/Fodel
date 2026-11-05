/**
 * Autosave for the listing forms: the rules in src/lib/portal/autosave.ts, run against fake timers and a fake
 * server. What matters: nothing a person typed is dropped, one save runs at a time, a failed save is tried again,
 * a refused one is not, and the backup goes only when the server holds exactly the values on screen.
 */
import assert from 'node:assert/strict';
import { createAutosave, parseBackup, backupVerdict, DEFAULT_RETRY_MS } from '../src/lib/portal/autosave.ts';

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/** Fake clock: timers fire only when `tick` moves time. */
function rig({ initial = 'a', send } = {}) {
  let now = 1000;
  let next = 1;
  const timers = new Map();
  const log = { sent: [], states: [], backups: [] };
  const form = { value: initial };
  const store = { raw: null, get: () => store.raw, set: (v) => { store.raw = v; log.backups.push(v); }, remove: () => { store.raw = null; } };
  const api = createAutosave({
    read: () => form.value,
    send: async (snapshot) => { log.sent.push(snapshot); return send ? send(snapshot, log.sent.length) : { ok: true }; },
    onState: (s) => log.states.push(s),
    store,
    base: 'v1',
    timers: { set: (fn, ms) => { const id = next++; timers.set(id, { fn, at: now + ms }); return id; }, clear: (id) => timers.delete(id), now: () => now },
  });
  const tick = async (ms) => {
    const until = now + ms;
    for (;;) {
      const due = [...timers.entries()].filter(([, t]) => t.at <= until).sort((x, y) => x[1].at - y[1].at)[0];
      if (!due) break;
      now = due[1].at;
      timers.delete(due[0]);
      due[1].fn();
      await settle();
    }
    now = until;
  };
  const settle = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
  return { api, form, store, log, tick, settle, pending: () => timers.size, last: () => log.states.at(-1) };
}

test('typing is saved 1.5 s after the last key, once, with the newest values', async () => {
  const r = rig();
  for (const v of ['ab', 'abc', 'abcd']) { r.form.value = v; r.api.touch('input'); await r.tick(500); }
  assert.deepEqual(r.log.sent, [], 'still typing: nothing sent yet');
  assert.equal(r.last().kind, 'dirty');
  await r.tick(1100);
  assert.deepEqual(r.log.sent, ['abcd']);
  assert.equal(r.last().kind, 'saved');
  assert.equal(r.store.raw, null, 'the backup goes when the server confirmed the same values');
});

test('leaving a field saves after 400 ms, not 1.5 s', async () => {
  const r = rig();
  r.form.value = 'b'; r.api.touch('change');
  await r.tick(399); assert.equal(r.log.sent.length, 0);
  await r.tick(2); assert.deepEqual(r.log.sent, ['b']);
});

test('every change is backed up at once, before anything is sent', async () => {
  const r = rig();
  r.form.value = 'typed'; r.api.touch('input');
  const backup = parseBackup(r.store.raw);
  assert.equal(backup.snapshot, 'typed');
  assert.equal(backup.base, 'v1');
  assert.equal(r.log.sent.length, 0);
});

test('one save at a time: a change made while saving is saved right after, newest values, no lost keystroke', async () => {
  let release;
  const r = rig({ send: (s, n) => (n === 1 ? new Promise((res) => { release = () => res({ ok: true }); }) : { ok: true }) });
  r.form.value = 'one'; r.api.touch('change'); await r.tick(400);
  assert.deepEqual(r.log.sent, ['one']);
  r.form.value = 'one two'; r.api.touch('input'); await r.tick(5000);
  assert.deepEqual(r.log.sent, ['one'], 'the first save has not come back: no second request in parallel');
  release(); await r.settle();
  assert.deepEqual(r.log.sent, ['one', 'one two']);
  assert.equal(r.last().kind, 'saved');
  assert.equal(r.store.raw, null);
});

test('a values-did-not-change touch sends nothing and keeps no backup', async () => {
  const r = rig();
  r.form.value = 'x'; r.api.touch('input');
  r.form.value = 'a'; r.api.touch('input');
  assert.equal(r.store.raw, null);
  await r.tick(3000);
  assert.deepEqual(r.log.sent, []);
  assert.equal(r.last().kind, 'saved');
});

test('a failed connection is retried by itself with growing pauses, and the backup stays meanwhile', async () => {
  const r = rig({ send: (s, n) => (n < 4 ? { ok: false, retry: true } : { ok: true }) });
  r.form.value = 'b'; r.api.touch('change'); await r.tick(400);
  assert.equal(r.log.sent.length, 1);
  assert.deepEqual(r.last(), { kind: 'retrying', attempt: 1, inMs: DEFAULT_RETRY_MS[0] });
  assert.equal(parseBackup(r.store.raw).snapshot, 'b', 'the typed text is still in the browser');
  await r.tick(DEFAULT_RETRY_MS[0]); assert.equal(r.log.sent.length, 2);
  assert.deepEqual(r.last(), { kind: 'retrying', attempt: 2, inMs: DEFAULT_RETRY_MS[1] });
  await r.tick(DEFAULT_RETRY_MS[1]); assert.equal(r.log.sent.length, 3);
  await r.tick(DEFAULT_RETRY_MS[2]); assert.equal(r.log.sent.length, 4);
  assert.equal(r.last().kind, 'saved');
  assert.equal(r.store.raw, null);
});

test('the pause stops growing at the last value, and retrying never gives up', async () => {
  const r = rig({ send: () => ({ ok: false, retry: true }) });
  r.form.value = 'b'; r.api.touch('change'); await r.tick(400);
  for (let i = 0; i < 8; i++) await r.tick(60000);
  assert.ok(r.log.sent.length >= 8);
  assert.equal(r.last().inMs, DEFAULT_RETRY_MS.at(-1));
  assert.equal(r.api.unsaved(), true);
});

test('retryNow (the connection came back) tries at once and resets the pauses', async () => {
  const r = rig({ send: (s, n) => (n === 1 ? { ok: false, retry: true } : { ok: true }) });
  r.form.value = 'b'; r.api.touch('change'); await r.tick(400);
  assert.equal(r.last().kind, 'retrying');
  r.api.retryNow(); await r.settle();
  assert.equal(r.log.sent.length, 2);
  assert.equal(r.last().kind, 'saved');
});

test('a refusal on purpose is shown and not repeated; the next change tries again', async () => {
  const r = rig({ send: (s, n) => (n === 1 ? { ok: false, retry: false, message: 'Túl hosszú cím.' } : { ok: true }) });
  r.form.value = 'b'; r.api.touch('change'); await r.tick(400);
  assert.deepEqual(r.last(), { kind: 'rejected', message: 'Túl hosszú cím.' });
  await r.tick(120000);
  assert.equal(r.log.sent.length, 1, 'no loop of the same refused values');
  assert.equal(parseBackup(r.store.raw).snapshot, 'b', 'a refused text is still kept in the browser');
  r.form.value = 'bc'; r.api.touch('input'); await r.tick(1500);
  assert.deepEqual(r.log.sent, ['b', 'bc']);
  assert.equal(r.last().kind, 'saved');
});

test('a send that throws counts as a connection failure, not a crash', async () => {
  const r = rig({ send: () => { throw new Error('network'); } });
  r.form.value = 'b'; r.api.touch('change'); await r.tick(400);
  assert.equal(r.last().kind, 'retrying');
});

test('flush (the tab is hidden, "Continue" is pressed) saves now and says whether the server holds everything', async () => {
  const r = rig();
  r.form.value = 'b'; r.api.touch('input');
  assert.equal(await r.api.flush(), true);
  assert.deepEqual(r.log.sent, ['b']);
  assert.equal(r.pending(), 0, 'the typing timer is gone, no second save follows');
  const down = rig({ send: () => ({ ok: false, retry: true }) });
  down.form.value = 'b'; down.api.touch('input');
  assert.equal(await down.api.flush(), false);
  assert.equal(down.api.unsaved(), true, 'the page must warn before it is closed');
});

test('flush waits for a save in flight and then saves what was typed meanwhile', async () => {
  let release;
  const r = rig({ send: (s, n) => (n === 1 ? new Promise((res) => { release = () => res({ ok: true }); }) : { ok: true }) });
  r.form.value = 'one'; r.api.touch('change'); await r.tick(400);
  r.form.value = 'two'; r.api.touch('input');
  const flushed = r.api.flush();
  release();
  assert.equal(await flushed, true);
  assert.deepEqual(r.log.sent, ['one', 'two']);
});

test('busy() is true only while a request is on its way; settled() waits for exactly that', async () => {
  let release;
  const r = rig({ send: () => new Promise((res) => { release = () => res({ ok: true }); }) });
  assert.equal(r.api.busy(), false);
  await r.api.settled();
  r.form.value = 'b'; r.api.touch('change'); await r.tick(400);
  assert.equal(r.api.busy(), true);
  let done = false;
  void r.api.settled().then(() => { done = true; });
  await r.settle();
  assert.equal(done, false);
  release(); await r.settle();
  assert.equal(done, true);
  assert.equal(r.api.busy(), false);
});

test('values the page filled in from the server are adopted: they never count as unsaved and need no save', async () => {
  const r = rig();
  r.form.value = 'a+translation'; // the AI translation arrived in a field
  assert.equal(r.api.unsaved(), true);
  r.api.adopt(() => 'a+translation');
  assert.equal(r.api.unsaved(), false);
  await r.tick(5000);
  assert.deepEqual(r.log.sent, []);
  assert.equal(r.last().kind, 'saved');
});

test('nothing to save: flush resolves true without a request', async () => {
  const r = rig();
  assert.equal(await r.api.flush(), true);
  assert.deepEqual(r.log.sent, []);
});

test('a blocked or full storage never stops the server save', async () => {
  const r = rig();
  r.store.set = () => { throw new Error('QuotaExceededError'); };
  r.form.value = 'b'; r.api.touch('change'); await r.tick(400);
  assert.deepEqual(r.log.sent, ['b']);
  assert.equal(r.last().kind, 'saved');
});

test('backups: a damaged one is ignored; equal, same-base and foreign-base ones are told apart', () => {
  assert.equal(parseBackup('{oops'), null);
  assert.equal(parseBackup(JSON.stringify({ at: 'x' })), null);
  const backup = { at: 1, snapshot: 'typed', base: 'v1' };
  assert.equal(backupVerdict(null, 'a', 'v1'), 'none');
  assert.equal(backupVerdict({ ...backup, snapshot: 'a' }, 'a', 'v1'), 'same');
  assert.equal(backupVerdict(backup, 'a', 'v1'), 'restore', 'the server still has what the typing started from');
  assert.equal(backupVerdict(backup, 'a', 'v2'), 'ask', 'changed elsewhere since: the person decides');
  assert.equal(backupVerdict({ ...backup, base: null }, 'a', 'v1'), 'ask', 'no base known: never overwrite silently');
});

test('after dispose nothing runs', async () => {
  const r = rig();
  r.form.value = 'b'; r.api.touch('input'); r.api.dispose();
  await r.tick(5000);
  assert.deepEqual(r.log.sent, []);
});

for (const [name, fn] of tests) {
  await fn();
  passed++;
  console.log(`✓ ${name}`);
}
console.log(`All ${passed} autosave checks passed.`);
