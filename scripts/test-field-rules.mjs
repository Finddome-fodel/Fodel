/**
 * Which facts every kind of property has, and which are required (Q15, Gábor's three sentences):
 *   - Lakóterület (nettó hasznos alapterület) is REQUIRED where there is a home;
 *   - Teljes épületterület is never required;
 *   - the two are separate facts: neither is copied into, derived from or checked against the other.
 * The whole matrix is snapshotted to scripts/fixtures/field-rules.json, so any change to a rule shows up in review.
 *   npm run test:field-rules            checks    npm run test:field-rules -- --update    rewrites the snapshot
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';

const server = await createServer({ configFile: false, cacheDir: `${tmpdir()}/fodel-fieldrules-${process.pid}`, resolve: { alias: { '~': new URL('../src', import.meta.url).pathname } }, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true } });
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };
try {
  const D = await server.ssrLoadModule('/src/lib/listing-details.ts');
  const C = await server.ssrLoadModule('/src/lib/listing-catalogue.ts');
  const { listingInput } = await server.ssrLoadModule('/src/lib/portal/listing-input.ts');
  const { getTaxonomy } = await server.ssrLoadModule('/src/lib/runtime-config.ts');

  const matrix = {};
  for (const group of C.PROPERTY_GROUPS) for (const sub of group.subtypes) {
    const r = D.fieldRules(group.key, sub.key);
    matrix[`${group.key}/${sub.key}`] = { floor_m2: r.floor_m2, building_m2: r.building_m2, plot_m2: r.plot_m2, rooms: r.rooms, kind: C.livingAreaKind(group.key, sub.key) };
  }
  const file = new URL('./fixtures/field-rules.json', import.meta.url).pathname;
  if (process.argv.includes('--update')) fs.writeFileSync(file, JSON.stringify(matrix, null, 2) + '\n');

  await test('the whole field-rule matrix equals the snapshot (every subtype: living area, building area, plot, rooms)', () => {
    assert.deepEqual(matrix, JSON.parse(fs.readFileSync(file, 'utf8')), 'a rule changed: review it, then run with --update');
  });

  await test('the total building area is optional or hidden for every type, never required', () => {
    for (const [key, rule] of Object.entries(matrix)) assert.notEqual(rule.building_m2, 'required', key);
  });

  await test('the living area (Q15): required where there is a home, optional on the farm businesses, hidden on land, a net usable area for buildings', () => {
    const f = (g, s) => matrix[`${g}/${s}`].floor_m2;
    for (const [g, s] of [['house', 'house-villa'], ['house', 'apartment'], ['house', 'residential-building'], ['holiday', 'holiday-house'], ['holiday', 'holiday-apartment'], ['mansion', 'castle-manor'], ['agricultural', 'farm'], ['agricultural', 'rural-estate'], ['agricultural', 'manor-farmstead'], ['investment', 'rented-home'], ['investment', 'investment-building']]) assert.equal(f(g, s), 'required', `${g}/${s}`);
    for (const s of ['agricultural-business', 'livestock', 'fish-farm', 'agricultural-other']) assert.equal(f('agricultural', s), 'optional', s);
    for (const s of ['arable', 'orchard-vineyard', 'forest-pasture']) assert.equal(f('agricultural', s), 'hidden', s);
    for (const sub of C.PROPERTY_GROUPS.find((g) => g.key === 'land').subtypes) assert.equal(f('land', sub.key), 'hidden', `land/${sub.key}`);
    for (const g of ['commercial', 'industrial']) for (const sub of C.PROPERTY_GROUPS.find((x) => x.key === g).subtypes) { assert.equal(f(g, sub.key), 'required', `${g}/${sub.key}`); assert.equal(matrix[`${g}/${sub.key}`].kind, 'net'); }
    assert.equal(matrix['agricultural/farm'].kind, 'living');
    assert.equal(matrix['agricultural/agricultural-business'].kind, 'optional-home');
  });

  await test('the old key reads as the estate everywhere; it is not offered; the three new ones are, in the agreed order', () => {
    assert.equal(C.validSubtype('agricultural', 'agricultural-estate'), true, 'old drafts and URLs still validate');
    assert.equal(C.subtypeOf('farm', 'agricultural-estate'), 'rural-estate');
    assert.deepEqual(D.fieldRules('agricultural', 'agricultural-estate'), D.fieldRules('agricultural', 'rural-estate'));
    const keys = C.PROPERTY_GROUPS.find((g) => g.key === 'agricultural').subtypes.map((s) => s.key);
    assert.equal(keys.includes('agricultural-estate'), false, 'it disappears from every picker');
    assert.deepEqual(keys.slice(0, 5), ['farm', 'manor-farmstead', 'rural-estate', 'agricultural-business', 'livestock']);
    for (const key of ['agricultural-business', 'rural-estate', 'manor-farmstead']) {
      const sub = C.PROPERTY_GROUPS.find((g) => g.key === 'agricultural').subtypes.find((s) => s.key === key);
      assert.equal(Object.keys(sub.labels).length, 28, `${key}: a label in every language`);
      assert.ok(Object.values(sub.labels).every((v) => v.trim().length > 1), key);
      assert.ok(sub.hint.hu && sub.hint.nl && sub.hint.en, `${key}: hints in the portal languages`);
    }
    assert.deepEqual(C.subtypeSearchKeys('agricultural-estate'), ['rural-estate', 'agricultural-business', 'agricultural-estate'], 'an old saved search is widened, not lost');
    assert.deepEqual(C.subtypeSearchKeys('farm'), ['farm']);
  });

  await test('the submit gate asks a Birtok for the living area only; the total building area saves empty, alone or smaller (no cross-check)', async () => {
    const taxonomy = await getTaxonomy();
    const current = { id: '10000000-0000-4000-8000-000000000001', category: 'farm', property_group: 'agricultural', property_subtype: 'rural-estate', original_price: 90_000_000, original_currency: 'HUF', price_eur: 225000, price_huf: 90_000_000, exchange_rate: 400, plot_m2: 20000, features: [] };
    const form = (extra = {}) => {
      const f = new FormData();
      for (const [k, v] of Object.entries({ property_group: 'agricultural', property_subtype: 'rural-estate', country: 'HU', county: 'Veszprém', lat: '46.85', lng: '17.56', location_confirmed: 'yes', original_price: '90 000 000', original_currency: 'HUF', plot_m2: '20000', plot_m2_unit: 'm2', floor_m2_unit: 'm2', building_m2_unit: 'm2', ...extra })) f.set(k, v);
      return f;
    };
    const gaps = (facts) => D.detailGaps({ ...facts, details: {} }, 'agricultural', 'rural-estate', '').filter((g) => g === 'floor_m2' || g === 'building_m2');
    assert.deepEqual(gaps({ plot_m2: 20000 }), ['floor_m2'], 'no living area: the submit gate asks for it, and only for it');
    assert.deepEqual(gaps({ plot_m2: 20000, floor_m2: 180 }), [], 'a living area alone is enough: the total building area is never asked for');
    const saved = await listingInput(form({ floor_m2: '180', building_m2: '' }), current, taxonomy);
    assert.equal(saved.patch.floor_m2, 180);
    assert.equal(saved.patch.building_m2, null, 'empty means null, never 0');
    const both = await listingInput(form({ floor_m2: '180', building_m2: '420' }), current, taxonomy);
    assert.equal(both.patch.floor_m2, 180);
    assert.equal(both.patch.building_m2, 420, 'the two are separate facts: neither is copied into or checked against the other');
    const bigger = await listingInput(form({ floor_m2: '180', building_m2: '90' }), current, taxonomy);
    assert.equal(bigger.patch.building_m2, 90, 'no cross-validation (Q14)');
    // The old key saves as the estate's rules do.
    assert.deepEqual(D.detailGaps({ plot_m2: 20000, details: {} }, 'agricultural', 'agricultural-estate', '').includes('floor_m2'), true);
  });

  await test('the labels and the gap texts say „nettó hasznos alapterület” in the portal languages', () => {
    assert.match(D.GAP_LABELS.hu.floor_m2, /nettó hasznos alapterület/);
    assert.match(D.GAP_LABELS.nl.floor_m2, /netto gebruiksoppervlakte/);
    assert.match(D.GAP_LABELS.en.floor_m2, /net usable area/);
    assert.equal(D.gapError('floor_m2', 'hu'), 'Adja meg a nettó hasznos alapterületet.');
  });

  console.log(`\n${passed} field-rule checks passed.`);
} catch (error) {
  console.error('✗ ' + (error.stack || error));
  process.exitCode = 1;
} finally {
  await server.close();
}
