/**
 * The package chooser: what the page shows is the matrix, in the band of the property, for every term, with the forint
 * hint as information only; a price typed later moves the band exactly as checkout will; what an owner may switch off
 * is trimmed to what the package really publishes.
 *
 *   npm run test:chooser
 */
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';

const server = await createServer({ configFile: false, cacheDir: `${tmpdir()}/fodel-chooser-${process.pid}`, resolve: { alias: { '~': new URL('../src', import.meta.url).pathname } }, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true } });
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };

try {
  const C = await server.ssrLoadModule('/src/lib/portal/package-chooser.ts');
  const L = await server.ssrLoadModule('/src/lib/listing-packages.ts');
  const P = await server.ssrLoadModule('/src/lib/listing-pricing.ts');
  const { LOCALES } = await server.ssrLoadModule('/src/i18n/ui.ts');
  const live = L.listingCatalog({ pricingLive: true });
  const fx = { rate: 385.12, date: '2026-11-04', source: 'ECB', fetchedAt: '2026-11-04T15:30:00Z' };
  const model = (over = {}) => C.chooserModel({ catalog: live, lang: 'hu', priceHuf: 48_000_000, fx, sourceLocale: 'hu', targets: LOCALES, names: (code) => code, ...over });

  await test('before the pricing migrations there is no chooser: the older cards stay', () => {
    assert.equal(C.chooserModel({ catalog: L.listingCatalog({}), lang: 'hu', priceHuf: 1, fx, sourceLocale: 'hu', targets: LOCALES, names: (c) => c }), null);
  });

  await test('three packages, every term, the euro price from the matrix in the property\'s band (48 M Ft is the middle band)', () => {
    const m = model();
    assert.deepEqual(m.packages.map((p) => p.id), ['basic', 'europe', 'world']);
    assert.deepEqual(m.durations, [1, 3, 6]);
    assert.equal(m.tierIndex, 1);
    const cents = Object.fromEntries(m.packages.map((p) => [p.id, [1, 3, 6].map((n) => p.prices[n].cents)]));
    assert.deepEqual(cents, { basic: [1090, 2490, 3890], europe: [1690, 3800, 5990], world: [2190, 4990, 7690] });
    assert.equal(m.packages[2].prices[6].eur, '76,90 €', 'World, 6 months: 76,90 €');
    assert.match(m.packages[2].prices[6].huf, /^kb\. 29 600 Ft$/, '76,90 × 385,12 = 29 616 → kb. 29 600 Ft');
  });

  await test('the forint hint is information: no rate, no hint, and the euro price still stands', () => {
    const m = model({ fx: null });
    assert.equal(m.packages[0].prices[1].huf, '');
    assert.equal(m.packages[0].prices[1].eur, '10,90 €');
    assert.equal(m.footnote, '');
    assert.match(model().footnote, /1 € = 385,12 Ft/);
  });

  await test('the band decides the price at 24 999 999, 25 000 000, 100 000 000 and 100 000 001', () => {
    const at = (huf) => model({ priceHuf: huf }).packages[0].prices[1].cents;
    assert.equal(at(24_999_999), 890);
    assert.equal(at(25_000_000), 1090);
    assert.equal(at(100_000_000), 1090);
    assert.equal(at(100_000_001), 1390);
  });

  await test('a draft without a price shows the lowest band and says so; with one it names the band and the price', () => {
    const none = model({ priceHuf: null });
    assert.equal(none.hasPrice, false);
    assert.equal(none.packages[0].prices[1].cents, 890);
    assert.match(none.bandText, /következő lépésben adja meg/);
    const priced = model();
    assert.equal(priced.bandText, 'Az ár az ingatlan értékétől függ: 25–100 millió Ft (az Ön ingatlana: 48 000 000 Ft).');
    assert.match(model({ lang: 'en' }).bandText, /^The price depends on the value of the property: .* \(your property: 48/);
  });

  await test('the script\'s table is the server\'s: the same cents, the same band for the same price', () => {
    const m = model();
    const tiers = m.client.bounds.map((upToHuf) => ({ upToHuf }));
    for (const huf of [0, 1, 24_999_999, 25_000_000, 48_000_000, 100_000_000, 100_000_001, 900_000_000]) {
      const index = P.tierIndexFor({ valueTiers: tiers }, huf || null);
      for (const pkg of ['basic', 'europe', 'world']) for (const months of [1, 3, 6]) {
        assert.equal(m.client.prices[pkg][index][months], P.priceFor({ packageId: pkg, months, priceHuf: huf || null, pricing: live.pricing }).cents, `${pkg} ${months} ${huf}`);
      }
    }
    assert.equal(JSON.stringify(m.client).includes('385'), true, 'the rate travels for the hint');
    assert.equal(/priceHuf|price_huf/.test(JSON.stringify(m.client.prices)), false);
  });

  await test('the longest term and the recommended package are the default; an owner\'s earlier choice is kept; nonsense falls back', () => {
    const first = model();
    assert.equal(first.months, 6);
    assert.equal(first.packageId, 'europe', 'Európa is recommended');
    const again = model({ packageId: 'world', months: 3 });
    assert.equal(again.packageId, 'world');
    assert.equal(again.months, 3);
    const junk = model({ packageId: 'cheap-6m', months: 4 });
    assert.equal(junk.packageId, 'europe');
    assert.equal(junk.months, 6);
  });

  await test('languages: Basic hu en de, Europe without the five World-only, World all 28; the original first; the page can be in any original language', () => {
    const m = model();
    assert.deepEqual(m.packages[0].languages, ['hu', 'en', 'de'], 'Basic: the original (Hungarian), English, German');
    assert.equal(m.packages[1].languages.includes('sr') && m.packages[1].languages.includes('uk'), true);
    assert.equal(['tr', 'he', 'ar', 'zh', 'ru'].some((c) => m.packages[1].languages.includes(c)), false);
    assert.equal(m.packages[2].languages.length, 28);
    const german = model({ sourceLocale: 'de' });
    assert.deepEqual(german.packages[0].languages, ['de', 'hu', 'en'], 'a German owner: German is the original; Basic adds Hungarian and English');
  });

  await test('a package an admin switched off is not offered; a term without a price is not shown', () => {
    const off = L.listingCatalog({ pricingLive: true, listingPricing: { packages: { world: { enabled: false } } } });
    assert.deepEqual(C.chooserModel({ catalog: off, lang: 'hu', priceHuf: 1, fx, sourceLocale: 'hu', targets: LOCALES, names: (c) => c }).packages.map((p) => p.id), ['basic', 'europe']);
  });

  await test('what the owner may switch off is trimmed: only the package\'s languages, never English, never the original', () => {
    const clean = (asked, pkg = 'europe', source = 'hu') => C.chosenExclusions(asked, pkg, live, source, LOCALES);
    assert.deepEqual(clean(['fr', 'es']), ['fr', 'es']);
    assert.deepEqual(clean(['en', 'hu', 'fr']), ['fr'], 'English and the original are dropped');
    assert.deepEqual(clean(['ar', 'zh']), [], 'Europe does not publish them: nothing to switch off');
    assert.deepEqual(clean(['ar'], 'world'), ['ar']);
    assert.deepEqual(clean(['fr', 'fr', ' FR ', 'x1']), ['fr'], 'no repeats, only known codes');
    assert.deepEqual(clean(['de'], 'europe', 'de'), [], 'a German owner cannot switch German off');
    assert.deepEqual(clean(['hu'], 'europe', 'de'), ['hu']);
  });

  await test('the labels exist in all three portal languages and name the term', () => {
    for (const lang of ['hu', 'nl', 'en']) {
      const copy = C.CHOOSER_COPY[lang];
      for (const key of Object.keys(C.CHOOSER_COPY.hu)) assert.ok(copy[key], `${lang}.${key}`);
      assert.match(copy.months(3), /3/);
      assert.match(copy.summary('World', 6), /World/);
    }
  });

  await test('an upgrade quote is the difference for the bought term inside the bought band, and the biggest package has none', async () => {
    const T = await server.ssrLoadModule('/src/lib/portal/package-terms.ts');
    const row = { package: 'basic', package_months: 3, price_tier_index: 1, price_huf: 900_000_000 };
    assert.deepEqual(T.upgradeQuotes(live, row).map((q) => [q.packageId, q.cents]), [['europe', 3800 - 2490], ['world', 4990 - 2490]], 'the stored band, not the price now (900 M Ft would be the top band)');
    assert.deepEqual(T.upgradeQuotes(live, { ...row, package: 'europe' }).map((q) => [q.packageId, q.cents]), [['world', 4990 - 3800]]);
    assert.deepEqual(T.upgradeQuotes(live, { ...row, package: 'world' }), []);
    assert.deepEqual(T.upgradeQuotes(L.listingCatalog({}), row), [], 'before the migrations nothing is sold');
    // An older-package listing has no stored term or band: the closest term to the time left, the band of its price.
    const old = T.upgradeQuotes(live, { package: 'normal-12m', price_huf: 48_000_000, expires_at: new Date(Date.now() + 170 * 86400000).toISOString() });
    assert.deepEqual(old.map((q) => [q.packageId, q.months, q.cents]), [['europe', 6, 5990 - 3890], ['world', 6, 7690 - 3890]]);
  });

  console.log(`\n${passed} package chooser checks passed.`);
} catch (error) {
  console.error('✗ ' + (error.stack || error));
  process.exitCode = 1;
} finally {
  await server.close();
}
