/**
 * The daily EUR/HUF rate: the ECB readers, the refresh job, the read chain, the stale notice and the forint hint.
 * The real modules through Vite; fake ECB responses and a fake database, no network.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';

const root = new URL('../', import.meta.url).pathname;
const server = await createServer({ configFile: false, cacheDir: `${tmpdir()}/fodel-fx-${process.pid}`, resolve: { alias: { '~': root + 'src' } }, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true } });
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };
const NB = ' ';

const xml = (date, extra = '') => `<?xml version="1.0"?><gesmes:Envelope><Cube><Cube time='${date}'><Cube currency='USD' rate='1.0812'/><Cube currency='HUF' rate='385.12'/><Cube currency='GBP' rate='0.8731'/>${extra}</Cube></Cube></gesmes:Envelope>`;
const reply = (body, ok = true) => async () => ({ ok, text: async () => body, json: async () => JSON.parse(body) });

/** A tiny fake of the one table this job touches. */
function fakeDb(initial = []) {
  const rows = new Map(initial.map((row) => [row.rate_date, row]));
  let missing = false;
  const api = {
    rows, setMissing: (v) => (missing = v), writes: 0,
    client: {
      from: () => {
        const q = { filters: {}, order: null, limit: null };
        const chain = {
          select: () => chain,
          eq: (k, v) => { q.filters[k] = v; return chain; },
          order: (k, o) => { q.order = o; return chain; },
          limit: (n) => { q.limit = n; return chain; },
          async maybeSingle() {
            if (missing) return { data: null, error: { code: '42P01', message: 'relation "exchange_rate_snapshots" does not exist' } };
            let list = [...rows.values()];
            if (q.filters.rate_date) list = list.filter((row) => row.rate_date === q.filters.rate_date);
            if (q.order) list.sort((a, b) => b.rate_date.localeCompare(a.rate_date));
            return { data: list[0] ?? null, error: null };
          },
          then(resolve) {
            if (missing) return resolve({ data: null, error: { code: '42P01', message: 'exchange_rate_snapshots' } });
            const list = [...rows.values()].sort((a, b) => b.rate_date.localeCompare(a.rate_date)).slice(0, q.limit ?? 99);
            return resolve({ data: list, error: null });
          },
          async upsert(row) {
            if (missing) return { error: { code: '42P01', message: 'exchange_rate_snapshots' } };
            api.writes++;
            rows.set(row.rate_date, row);
            return { error: null };
          },
        };
        return chain;
      },
    },
  };
  return api;
}

try {
  const FX = await server.ssrLoadModule('/src/lib/fx.ts');
  const E = await server.ssrLoadModule('/src/lib/exchange-rates.ts');
  const S = await server.ssrLoadModule('/src/lib/fx-store.ts');

  await test('the forint hint is the nearest 100 Ft, never zero for a real amount, and „kb.” reads like the client wrote it', () => {
    assert.equal(FX.hufHintAmount(890, 385.12), 3400, '8,90 € = 3 427,57 Ft');
    assert.equal(FX.hufHintAmount(9590, 385.12), 36900);
    assert.equal(FX.hufHintAmount(1, 385.12), 100, 'a cent is 3,85 Ft: never shown as zero, the first 100');
    assert.equal(FX.hufHintAmount(0, 385.12), 0);
    assert.equal(FX.hufHintAmount(890, 0), 0);
    assert.equal(FX.hufHintAmount(Number.NaN, 385), 0);
    assert.equal(FX.formatHufHint(890, { rate: 385.12 }, 'hu'), `kb. 3${NB}400${NB}Ft`);
    assert.equal(FX.formatHufHint(890, null, 'hu'), '', 'no rate: no forint at all, the euro price stands alone');
    for (const locale of ['hu', 'nl', 'en', 'de', 'fr', 'es', 'pl', 'ro', 'sk', 'it', 'pt', 'el', 'cs', 'sl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt', 'sr', 'uk', 'tr', 'he', 'ar', 'ru', 'zh']) {
      assert.match(FX.formatHufHint(890, { rate: 385.12 }, locale), /3.400.Ft|3,400.Ft|3\.400.Ft/, locale);
    }
  });

  await test('the footnote names the rate, the date, the ECB, and says you pay in euro - in all 28 languages', () => {
    assert.equal(FX.fxFootnote({ rate: 385.12, date: '2026-11-04' }, 'hu'), 'Tájékoztató jellegű forintár az EKB aznapi EUR/HUF árfolyamán (1 € = 385,12 Ft, 2026.11.04.). Fizetés euróban.');
    assert.equal(FX.fxFootnote({ rate: 385.12, date: '2026-11-04' }, 'en'), 'Indicative forint amount at the ECB EUR/HUF rate of 2026-11-04 (1 € = 385.12 Ft). You pay in euro.');
    for (const locale of Object.keys(JSON.parse(fs.readFileSync(root + 'package.json', 'utf8')) && { hu: 1, nl: 1, en: 1, de: 1, fr: 1, es: 1, pl: 1, ro: 1, sk: 1, it: 1, pt: 1, el: 1, cs: 1, sl: 1, sv: 1, da: 1, no: 1, fi: 1, et: 1, lv: 1, lt: 1, sr: 1, uk: 1, tr: 1, he: 1, ar: 1, ru: 1, zh: 1 })) {
      const text = FX.fxFootnote({ rate: 385.12, date: '2026-11-04' }, locale);
      assert.ok(text.includes('385') && text.includes('2026'), `${locale}: ${text}`);
    }
  });

  await test('stale after four days: the old rate is still used, the admin is told', () => {
    const now = new Date('2026-11-10T12:00:00Z');
    assert.equal(FX.fxStale({ date: '2026-11-06' }, now), false, 'four days old is fine (a long weekend)');
    assert.equal(FX.fxStale({ date: '2026-11-05' }, now), true);
    assert.equal(FX.fxAgeDays({ date: '2026-11-10' }, now), 0);
  });

  await test('ECB file: a normal day, a Friday read on Sunday, a holiday gap; malformed and old files are refused', () => {
    const tue = E.parseEcbRates(xml('2026-11-03'), new Date('2026-11-04T09:00:00Z'));
    assert.equal(tue.rates.HUF, 385.12);
    assert.equal(tue.source, 'ECB');
    assert.equal(E.parseEcbRates(xml('2026-11-06'), new Date('2026-11-08T09:00:00Z')).date, '2026-11-06', 'the weekend: Friday\'s file is the latest');
    assert.equal(E.parseEcbRates(xml('2026-12-24'), new Date('2026-12-28T09:00:00Z')).date, '2026-12-24', 'a holiday gap of a few days');
    assert.throws(() => E.parseEcbRates('<html>maintenance</html>'), /rates-unavailable/);
    assert.throws(() => E.parseEcbRates(xml('2026-10-01'), new Date('2026-11-04T09:00:00Z')), /rates-unavailable/, 'older than a week');
    assert.throws(() => E.parseEcbRates(xml('2027-01-01'), new Date('2026-11-04T09:00:00Z')), /rates-unavailable/, 'from the future');
    assert.throws(() => E.parseEcbRates(`<Cube time='2026-11-03'><Cube currency='USD' rate='1.08'/></Cube>`, new Date('2026-11-04T09:00:00Z')), /rates-unavailable/, 'no forint');
    assert.throws(() => E.parseEcbRates(`<Cube time='2026-11-03'><Cube currency='HUF' rate='abc'/><Cube currency='GBP' rate='0.8'/></Cube>`, new Date('2026-11-04T09:00:00Z')), /rates-unavailable/);
  });

  await test('Frankfurter (the ECB mirror) is read with the same checks', () => {
    const ok = FX.parseFrankfurter({ date: '2026-11-03', rates: { HUF: 385.12, GBP: 0.87, XXX: 'no' } }, new Date('2026-11-04T09:00:00Z'));
    assert.deepEqual(ok, { date: '2026-11-03', rates: { EUR: 1, HUF: 385.12, GBP: 0.87 } });
    assert.throws(() => FX.parseFrankfurter({ date: '2026-11-03', rates: { GBP: 0.87 } }), /rates-unavailable/);
    assert.throws(() => FX.parseFrankfurter(null), /rates-unavailable/);
    assert.throws(() => FX.parseFrankfurter({ date: '2020-01-01', rates: { HUF: 300 } }, new Date('2026-11-04T09:00:00Z')), /rates-unavailable/);
  });

  const today = new Date().toISOString().slice(0, 10);

  await test('the daily refresh stores the day once; running it again changes nothing; the table is public reference data', async () => {
    const db = fakeDb();
    const fetchImpl = reply(xml(today));
    const first = await S.refreshRates({ client: db.client, fetchImpl });
    assert.equal(first.ok, true);
    assert.equal(first.fresh, true);
    assert.equal(db.rows.size, 1);
    assert.equal(db.rows.get(today).rates.HUF, 385.12);
    const second = await S.refreshRates({ client: db.client, fetchImpl });
    assert.equal(second.ok, true);
    assert.equal(second.fresh, false, 'the same day is the same row');
    assert.equal(db.rows.size, 1);
  });

  await test('the ECB down: its mirror is used; both down: an honest failure, never a made-up rate', async () => {
    const db = fakeDb();
    const mirror = async (url) => (String(url).includes('frankfurter') ? { ok: true, json: async () => ({ date: today, rates: { HUF: 386.5, GBP: 0.87 } }) } : { ok: false, text: async () => '' });
    const viaMirror = await S.refreshRates({ client: db.client, fetchImpl: mirror });
    assert.equal(viaMirror.ok, true);
    assert.equal(db.rows.get(today).rates.HUF, 386.5);
    assert.match(db.rows.get(today).source, /Frankfurter/);
    const empty = fakeDb();
    const down = await S.refreshRates({ client: empty.client, fetchImpl: async () => { throw new Error('network'); } });
    assert.deepEqual(down, { ok: false, error: 'rates-unavailable' });
    assert.equal(empty.rows.size, 0, 'nothing is invented');
  });

  await test('before migration 0056 the refresh says so instead of failing', async () => {
    const db = fakeDb();
    db.setMissing(true);
    const result = await S.refreshRates({ client: db.client, fetchImpl: reply(xml(today)) });
    assert.deepEqual(result, { ok: false, error: 'schema-missing' });
  });

  await test('read chain: the stored day, else a live ECB fetch, else nothing', async () => {
    const stored = fakeDb([{ rate_date: today, source: 'ECB', rates: { HUF: 390 }, fetched_at: new Date().toISOString() }]);
    const a = await S.currentRate({ client: stored.client, fetchImpl: async () => { throw new Error('must not be called'); } });
    assert.equal(a.rate, 390);
    const none = fakeDb();
    const b = await S.currentRate({ client: none.client, fetchImpl: reply(xml(today)) });
    assert.equal(b.rate, 385.12, 'no stored day: the live file');
    const c = await S.currentRate({ client: none.client, fetchImpl: async () => { throw new Error('offline'); } });
    assert.equal(c, null, 'nothing at all: no forint is shown');
    const noTable = fakeDb();
    noTable.setMissing(true);
    const d = await S.currentRate({ client: noTable.client, fetchImpl: reply(xml(today)) });
    assert.equal(d.rate, 385.12, 'before 0056 the live file keeps the hints working');
  });

  await test('the cron answers 401 without the secret and without a wrong one', async () => {
    const route = await server.ssrLoadModule('/src/pages/api/cron/fx.ts');
    process.env.CRON_SECRET = 'test-secret';
    const call = (auth) => route.GET({ request: new Request('http://site.test/api/cron/fx', { headers: auth ? { authorization: auth } : {} }) });
    assert.equal((await call(null)).status, 401);
    assert.equal((await call('Bearer wrong')).status, 401);
    assert.equal((await call('test-secret')).status, 401, 'the Bearer prefix is required');
  });

  await test('the cron is on the schedule, after the ECB publishes (15:30 UTC)', () => {
    const crons = JSON.parse(fs.readFileSync(root + 'vercel.json', 'utf8')).crons;
    assert.deepEqual(crons.find((c) => c.path === '/api/cron/fx'), { path: '/api/cron/fx', schedule: '30 15 * * *' });
  });

  await test('no code that decides what is charged reads a rate: forint hints are display only', () => {
    const charge = [
      'src/lib/orders.ts', 'src/lib/listing-pricing.ts', 'src/lib/portal/renewal.ts', 'src/lib/ai/translation-checkout.ts', 'src/lib/portal/publish.ts',
      'src/lib/ai/translation-orders.ts', 'src/lib/invoicing/catalogue.ts',
      ...fs.readdirSync(root + 'src/pages/api/stripe').filter((f) => f.endsWith('.ts')).map((f) => 'src/pages/api/stripe/' + f),
    ];
    for (const file of charge) {
      const text = fs.readFileSync(root + file, 'utf8');
      assert.doesNotMatch(text, /from ['"]~\/lib\/(fx|fx-store|exchange-rates)['"]|from ['"]\.\/(fx|fx-store|exchange-rates)(\.ts)?['"]/, `${file} must not import the forint rate`);
      assert.doesNotMatch(text, /\b(hufHintAmount|formatHufHint|currentRate|exchangeRates)\b/, `${file} must not use the forint rate`);
      assert.doesNotMatch(text, /(price_huf|priceHuf)\s*\/\s*\w*rate|rate\s*\*\s*\w*cents/i, `${file} must not convert forints to euros`);
    }
    // And the price function itself takes only a package, a term and a band.
    assert.doesNotMatch(fs.readFileSync(root + 'src/lib/listing-pricing.ts', 'utf8'), /\brate\b/i);
  });

  console.log(`\n${passed} FX checks passed.`);
} catch (error) {
  console.error('✗ ' + (error.stack || error));
  process.exitCode = 1;
} finally {
  await server.close();
}
