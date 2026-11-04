/**
 * The listing price matrix (src/lib/listing-pricing.ts): Gábor's 27 prices cell by cell, the value-band boundaries,
 * integer cents everywhere, upgrades, the admin save rules.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as P from '../src/lib/listing-pricing.ts';
import { eurPrice } from '../src/lib/format.ts';

let failed = 0;
const test = (name, fn) => {
  try { fn(); console.log('✓ ' + name); } catch (error) { failed++; console.error('✗ ' + name + '\n  ' + String(error.stack || error).split('\n').slice(0, 6).join('\n  ')); }
};

// Gábor's table (4 Nov 2026), in euros, typed independently of the code under test. Rows: package; columns: 1, 3, 6 months.
const TABLE_EUR = {
  'under-25M': { basic: [8.9, 18.9, 29.9], europe: [12.9, 27.9, 43.9], world: [16.9, 38.0, 59.9] },
  '25-100M': { basic: [10.9, 24.9, 38.9], europe: [16.9, 38.0, 59.9], world: [21.9, 49.9, 76.9] },
  'over-100M': { basic: [13.9, 29.9, 46.9], europe: [20.9, 46.0, 71.9], world: [27.9, 62.9, 95.9] },
};
const BANDS = [['under-25M', 10_000_000], ['25-100M', 48_000_000], ['over-100M', 250_000_000]];
const pricing = P.readPricing(undefined);

test('the 27 default prices are exactly Gábor\'s table, cell by cell, in integer cents', () => {
  let cells = 0;
  BANDS.forEach(([band, huf], tier) => {
    for (const pkg of P.PACKAGE_KEYS) {
      [1, 3, 6].forEach((months, i) => {
        const expected = Math.round(TABLE_EUR[band][pkg][i] * 100);
        const got = P.priceFor({ packageId: pkg, months, priceHuf: huf, pricing });
        assert.ok(got, `${band} ${pkg} ${months}`);
        assert.equal(got.cents, expected, `${band} ${pkg} ${months} months`);
        assert.equal(got.tierIndex, tier);
        assert.ok(Number.isInteger(got.cents), `${band} ${pkg} ${months}: ${got.cents} is not an integer`);
        cells++;
      });
    }
  });
  assert.equal(cells, 27);
});

test('the cents table in the brief matches', () => {
  assert.deepEqual(P.DEFAULT_PRICE_TABLE.basic, [[890, 1890, 2990], [1090, 2490, 3890], [1390, 2990, 4690]]);
  assert.deepEqual(P.DEFAULT_PRICE_TABLE.europe, [[1290, 2790, 4390], [1690, 3800, 5990], [2090, 4600, 7190]]);
  assert.deepEqual(P.DEFAULT_PRICE_TABLE.world, [[1690, 3800, 5990], [2190, 4990, 7690], [2790, 6290, 9590]]);
});

test('value bands: below 25 M, 25 M to 100 M both included, above 100 M (Q1)', () => {
  const at = (huf) => P.tierIndexFor(pricing, huf);
  assert.equal(at(24_999_999), 0);
  assert.equal(at(25_000_000), 1);
  assert.equal(at(100_000_000), 1);
  assert.equal(at(100_000_001), 2);
  assert.equal(at(1), 0);
  assert.equal(at(0), 0, 'no price yet: the "from" band');
  assert.equal(at(null), 0);
  assert.equal(at(undefined), 0);
  assert.equal(at(Number.NaN), 0);
  assert.equal(at(-5), 0);
});

test('the price follows the band: the same package costs more for a more valuable property', () => {
  const at = (huf) => P.priceFor({ packageId: 'world', months: 6, priceHuf: huf, pricing }).cents;
  assert.deepEqual([at(24_999_999), at(25_000_000), at(100_000_000), at(100_000_001)], [5990, 7690, 7690, 9590]);
});

test('priceFor is pure: the same input gives the same answer and the configuration is not touched', () => {
  const frozen = structuredClone(pricing);
  const a = P.priceFor({ packageId: 'europe', months: 3, priceHuf: 48_000_000, pricing });
  const b = P.priceFor({ packageId: 'europe', months: 3, priceHuf: 48_000_000, pricing });
  assert.deepEqual(a, b);
  assert.deepEqual(pricing, frozen);
});

test('an unknown package, an unsold duration or a removed band has no price - never a guess', () => {
  assert.equal(P.priceFor({ packageId: 'cheap-6m', months: 6, priceHuf: 1, pricing }), null);
  assert.equal(P.priceFor({ packageId: 'basic', months: 2, priceHuf: 1, pricing }), null);
  assert.equal(P.priceFor({ packageId: 'basic', months: 6, tierIndex: 7, pricing }), null);
});

test('a frozen band beats the property price: an upgrade or renewal never re-tiers', () => {
  const frozen = P.priceFor({ packageId: 'basic', months: 6, priceHuf: 250_000_000, tierIndex: 0, pricing });
  assert.equal(frozen.cents, 2990);
  assert.equal(frozen.tierIndex, 0);
});

test('upgrade: the difference inside the original band and duration, never negative', () => {
  assert.equal(P.upgradeCents({ from: 'basic', to: 'world', months: 6, tierIndex: 1, pricing }), 7690 - 3890);
  assert.equal(P.upgradeCents({ from: 'europe', to: 'world', months: 1, tierIndex: 0, pricing }), 1690 - 1290);
  assert.equal(P.upgradeCents({ from: 'world', to: 'basic', months: 3, tierIndex: 2, pricing }), 0, 'a downgrade is free of charge, not negative');
  assert.equal(P.upgradeCents({ from: 'basic', to: 'basic', months: 3, tierIndex: 2, pricing }), 0);
  assert.equal(P.upgradeCents({ from: 'basic', to: 'world', months: 2, tierIndex: 0, pricing }), null);
});

test('the referral discount rounds to whole cents, half up', () => {
  assert.equal(P.percentOfCents(890, 10), 89);
  assert.equal(P.percentOfCents(1895, 10), 190, '189.5 -> 190');
  assert.equal(P.percentOfCents(1890, 10), 189);
  assert.equal(P.percentOfCents(5, 10), 1, '0.5 -> 1');
  assert.equal(P.percentOfCents(4, 10), 0);
  for (const cells of Object.values(P.DEFAULT_PRICE_TABLE)) for (const row of cells) for (const cents of row) assert.ok(Number.isInteger(P.percentOfCents(cents, 10)));
});

test('reading stored settings never throws and never invents a price', () => {
  for (const garbage of [null, undefined, 5, 'x', [], { prices: 'no' }, { valueTiers: [{ upToHuf: 'abc' }] }, { durations: [0, 99] }, { packages: { basic: 7 } }]) {
    const read = P.readPricing(garbage);
    assert.equal(read.version, 2);
    assert.deepEqual(read.durations, [1, 3, 6]);
    assert.equal(P.priceFor({ packageId: 'basic', months: 1, priceHuf: 1, pricing: read }).cents, 890);
  }
  // Another shape of bands: cells nobody priced are simply not for sale.
  const wider = P.readPricing({ valueTiers: [{ upToHuf: 10_000_000 }, { upToHuf: null }], durations: [2, 12] });
  assert.equal(P.priceFor({ packageId: 'basic', months: 2, priceHuf: 1, pricing: wider }), null);
});

test('a saved price that is not whole cents or out of range is refused, nothing repaired', () => {
  const ok = P.validatePricing(P.defaultPricing());
  assert.equal(ok.ok, true);
  const price = (mutate) => { const raw = P.defaultPricing(); mutate(raw); return P.validatePricing(raw); };
  assert.equal(price((r) => { r.prices.basic[0][1] = 8.9; }).ok, false, 'euros typed as cents: 8.9 is not whole cents');
  assert.equal(price((r) => { r.prices.basic[0][1] = 0; }).ok, false);
  assert.equal(price((r) => { r.prices.basic[0][1] = 1_000_001; }).ok, false, 'over 10 000 €');
  assert.equal(price((r) => { delete r.prices.europe[2][6]; }).ok, false);
  assert.equal(price((r) => { r.valueTiers = [{ upToHuf: 100 }, { upToHuf: 50 }, { upToHuf: null }]; }).ok, false, 'bounds ascend');
  assert.equal(price((r) => { r.valueTiers = [{ upToHuf: 100 }, { upToHuf: 200 }]; }).ok, false, 'the last band is open');
  assert.equal(price((r) => { r.durations = [1, 1, 6]; }).ok, false, 'durations are unique');
  assert.equal(price((r) => { r.durations = [1, 3, 25]; }).ok, false, 'at most 24 months');
  assert.equal(price((r) => { for (const key of P.PACKAGE_KEYS) r.packages[key].enabled = false; }).ok, false, 'one package at least');
  const named = price((r) => { r.prices.world[2][6] = -1; });
  assert.match(named.message, /World, 6 hónap, 100 millió Ft felett/);
  // A disabled package need not be priced.
  assert.equal(price((r) => { r.packages.world.enabled = false; r.prices.world = {}; }).ok, true);
});

test('exactly one recommended package, Europe by default, never a disabled one', () => {
  const rec = (pr) => P.PACKAGE_KEYS.filter((key) => pr.packages[key].recommended);
  assert.deepEqual(rec(pricing), ['europe']);
  assert.deepEqual(rec(P.readPricing({ packages: { europe: { enabled: false }, world: { recommended: true } } })), ['world']);
  assert.deepEqual(rec(P.readPricing({ packages: { europe: { recommended: true }, world: { recommended: true } } })), ['europe']);
});

test('single languages are off by default (Q5) and stay configurable', () => {
  assert.equal(pricing.singleLanguages.enabled, false);
  assert.equal(P.readPricing({ singleLanguages: { enabled: true, europeanCents: 150 } }).singleLanguages.europeanCents, 150);
});

test('the band in words is computed from the bounds (hu, en, and plain numbers elsewhere)', () => {
  const t = pricing.valueTiers;
  assert.deepEqual([0, 1, 2].map((i) => P.tierLabel(t, i, 'hu')), ['25 millió Ft alatt', '25–100 millió Ft', '100 millió Ft felett']);
  assert.deepEqual([0, 1, 2].map((i) => P.tierLabel(t, i, 'en')), ['under 25 million HUF', '25–100 million HUF', 'over 100 million HUF']);
  assert.deepEqual([0, 1, 2].map((i) => P.tierLabel(t, i, 'de', (n) => n.toLocaleString('de-DE') + ' Ft')), ['< 25.000.000 Ft', '25.000.000 Ft – 100.000.000 Ft', '> 100.000.000 Ft']);
});

test('money is shown from integer cents: 8,90 € in Hungarian and German, €8.90 in English, two decimals always', () => {
  const nb = '\u00a0';
  assert.equal(eurPrice(890, 'hu'), `8,90${nb}€`);
  assert.equal(eurPrice(890, 'de'), `8,90${nb}€`);
  assert.equal(eurPrice(890, 'en'), '€8.90');
  assert.equal(eurPrice(9590, 'hu'), `95,90${nb}€`);
  assert.equal(eurPrice(3800, 'hu'), `38,00${nb}€`, 'a price table shows two decimals throughout');
  assert.equal(eurPrice(123456, 'hu'), `1${nb}234,56${nb}€`);
  const ar = eurPrice(890, 'ar');
  assert.ok(ar.startsWith('\u2066') && ar.endsWith('\u2069') && ar.includes('8') && ar.includes('90'), 'right-to-left pages isolate the figure: ' + ar);
});

test('with the 2026 prices live the old flat renewal price is not offered for editing on Kiegészítők or Ársávok', () => {
  for (const page of ['extras', 'tiers']) {
    const source = fs.readFileSync(new URL(`../src/pages/portal/packages/${page}.astro`, import.meta.url), 'utf8');
    assert.ok(source.includes("catalog.pricingLive && extra.id === 'renewal-6m'"), page);
  }
});

test('the public price list drops the old flat renewal row (in all 28 languages) once the 2026 prices are live', () => {
  const source = fs.readFileSync(new URL('../src/components/pages/PriceListPage.astro', import.meta.url), 'utf8');
  assert.equal((source.match(/price: xp\('renewal-6m'\), renewal: true,/g) ?? []).length, 28);
  assert.ok(source.includes('extra.renewal !== true'));
});

if (failed) { console.error(`\n${failed} pricing check(s) failed.`); process.exit(1); }
console.log('\nPricing checks passed.');
