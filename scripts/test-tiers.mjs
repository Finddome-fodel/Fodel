/**
 * Price tiers (spec §9), HUF→EUR rounding (§8), admin money format (§7) and
 * the Csomagok forms (§9.0). Loads the real TS modules through Vite; no
 * network, no database.
 */
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';

const server = await createServer({ configFile: false, cacheDir: `${tmpdir()}/fodel-tiers-unit-${process.pid}`, resolve: { alias: { '~': new URL('../src', import.meta.url).pathname } }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };

try {
  const T = await server.ssrLoadModule('/src/lib/price-tiers.ts');
  const P = await server.ssrLoadModule('/src/lib/listing-packages.ts');
  const O = await server.ssrLoadModule('/src/lib/orders.ts');
  const R = await server.ssrLoadModule('/src/lib/exchange-rates.ts');
  const N = await server.ssrLoadModule('/src/lib/portal/num.ts');
  const F = await server.ssrLoadModule('/src/lib/portal/package-forms.ts');
  const A = await server.ssrLoadModule('/src/lib/portal/package-admin.ts');
  const { tierPhrase } = await server.ssrLoadModule('/src/lib/tier-phrase.ts');

  const two = [{ upToHuf: 150_000_000, priceEur: 129 }, { upToHuf: null, priceEur: 179 }];
  const three = [{ upToHuf: 100_000_000, priceEur: 99 }, { upToHuf: 300_000_000, priceEur: 149 }, { upToHuf: null, priceEur: 229 }];

  /* ── tierFor / priceEurFor ─────────────────────────────────────────── */
  await test('tierFor: 0, at a bound (lower tier), bound + 1, a huge value', () => {
    assert.equal(T.tierFor(two, 0).index, 0);
    assert.equal(T.tierFor(two, 150_000_000).index, 0, 'a price on the bound is the lower tier');
    assert.equal(T.tierFor(two, 150_000_001).index, 1);
    assert.equal(T.tierFor(two, 150_000_001).fromHuf, 150_000_001);
    assert.equal(T.tierFor(two, 99_000_000_000).index, 1);
    assert.equal(T.tierFor(three, 300_000_000).index, 1);
    assert.equal(T.tierFor(three, 300_000_001).index, 2);
  });
  await test('tierFor: no price yet (null, NaN, negative) is the first tier', () => {
    for (const price of [null, undefined, NaN, -5, 0]) assert.equal(T.tierFor(three, price).index, 0, String(price));
    assert.equal(T.priceEurFor({ tiers: three }, null), 99);
  });
  await test('tierRange: computed "from", open last tier', () => {
    assert.deepEqual(T.tierRange(three, 0), { fromHuf: 0, toHuf: 100_000_000 });
    assert.deepEqual(T.tierRange(three, 1), { fromHuf: 100_000_001, toHuf: 300_000_000 });
    assert.deepEqual(T.tierRange(three, 2), { fromHuf: 300_000_001, toHuf: null });
  });
  await test('legacy JSON with a threshold becomes 2 tiers; without one, a flat price', () => {
    assert.deepEqual(T.legacyTiers(129, 179, 150_000_000), two);
    assert.deepEqual(T.legacyTiers(69, null, null), [{ upToHuf: null, priceEur: 69 }]);
    const cat = P.listingCatalog({ listingPackages: { 'normal-12m': { priceEur: 120, priceEurAbove: 170, thresholdHuf: 200_000_000 } } });
    assert.deepEqual(cat.packages.find((p) => p.id === 'normal-12m').tiers, [{ upToHuf: 200_000_000, priceEur: 120 }, { upToHuf: null, priceEur: 170 }]);
  });
  await test('stored tiers win over the legacy fields; aliases follow the tiers', () => {
    const cat = P.listingCatalog({ listingPackages: { 'normal-12m': { tiers: three, priceEur: 1, priceEurAbove: 2, thresholdHuf: 3 } } });
    const pkg = cat.packages.find((p) => p.id === 'normal-12m');
    assert.deepEqual(pkg.tiers, three);
    assert.equal(pkg.priceEur, 99);
    assert.equal(pkg.priceEurAbove, 229);
    assert.equal(pkg.thresholdHuf, 100_000_000);
  });

  /* ── validateTiers ─────────────────────────────────────────────────── */
  await test('validation rejects unsorted, duplicate and closed-last tiers, with the row', () => {
    const unsorted = T.validateTiers([{ upToHuf: 200, priceEur: 1 }, { upToHuf: 100, priceEur: 2 }, { upToHuf: null, priceEur: 3 }]);
    assert.equal(unsorted.ok, false); assert.equal(unsorted.errors[0].row, 1); assert.equal(unsorted.errors[0].field, 'upToHuf');
    const duplicate = T.validateTiers([{ upToHuf: 100, priceEur: 1 }, { upToHuf: 100, priceEur: 2 }, { upToHuf: null, priceEur: 3 }]);
    assert.equal(duplicate.ok, false); assert.equal(duplicate.errors[0].row, 1);
    const closed = T.validateTiers([{ upToHuf: 100, priceEur: 1 }, { upToHuf: 200, priceEur: 2 }]);
    assert.equal(closed.ok, false); assert.equal(closed.errors[0].message, 'Az utolsó sávnak nincs felső határa.');
    assert.equal(T.validateTiers([]).ok, false);
    assert.equal(T.validateTiers(Array.from({ length: 11 }, (_, i) => ({ upToHuf: i === 10 ? null : (i + 1) * 1000, priceEur: 1 }))).ok, false, 'max 10 tiers');
    assert.equal(T.validateTiers([{ upToHuf: null, priceEur: 10_001 }]).ok, false, 'price cap');
    assert.equal(T.validateTiers([{ upToHuf: null, priceEur: 1.5 }]).ok, false, 'whole euros');
    assert.equal(T.validateTiers([{ upToHuf: 0, priceEur: 1 }, { upToHuf: null, priceEur: 1 }]).ok, false, 'bounds are positive');
  });
  await test('validation: a cheaper higher tier is a warning, not an error', () => {
    const result = T.validateTiers([{ upToHuf: 100, priceEur: 50 }, { upToHuf: null, priceEur: 40 }]);
    assert.equal(result.ok, true);
    assert.equal(result.warnings[0].message, 'A magasabb sáv olcsóbb – biztos?');
  });
  await test('readTiers: malformed stored tiers fall back (null)', () => {
    assert.equal(T.readTiers('nope'), null);
    assert.equal(T.readTiers([{ upToHuf: 5, priceEur: 1 }]), null);
    assert.deepEqual(T.readTiers(two), two);
  });

  /* ── Orders ────────────────────────────────────────────────────────── */
  await test('buildOrderLines: 150.000.000 Ft → €129, 150.000.001 Ft → €179 (default config)', () => {
    const at = O.buildOrderLines({ packageId: 'normal-12m', priceHuf: 150_000_000, extras: [] }, 'hu');
    const above = O.buildOrderLines({ packageId: 'normal-12m', priceHuf: 150_000_001, extras: [] }, 'hu');
    assert.equal(at[0].unitCents, 12900);
    assert.equal(above[0].unitCents, 17900);
    assert.deepEqual(above[0].tier, { index: 1, fromHuf: 150_000_001, toHuf: null });
    assert.match(above[0].label, /150/, 'a tiered line names its tier');
  });
  await test('buildOrderLines: extras are tiered by the same price; three tiers work end to end', () => {
    const cat = P.listingCatalog({ listingPackages: { 'normal-12m': { tiers: three } }, listingExtras: { 'category-highlight': { tiers: [{ upToHuf: 100_000_000, priceEur: 15 }, { upToHuf: null, priceEur: 25 }] } } });
    const lines = O.buildOrderLines({ packageId: 'normal-12m', priceHuf: 250_000_000, extras: [{ id: 'category-highlight', quantity: 3 }] }, 'hu', cat);
    assert.equal(lines[0].unitCents, 14900);
    assert.equal(lines[1].unitCents, 2500);
    assert.equal(O.orderTotalCents(lines), 14900 + 3 * 2500);
  });
  await test('retired extras are refused for new orders; video only in Hungary', () => {
    assert.throws(() => O.buildOrderLines({ packageId: 'normal-12m', priceHuf: 1, extras: [{ id: 'homepage-highlight', quantity: 3 }] }, 'hu'), /retired-extra/);
    assert.throws(() => O.buildOrderLines({ packageId: 'normal-12m', priceHuf: 1, extras: [{ id: 'retro-images', quantity: 1 }] }, 'hu'), /retired-extra/);
    assert.throws(() => O.buildOrderLines({ packageId: 'normal-12m', priceHuf: 1, country: 'AT', extras: [{ id: 'video', quantity: 1 }] }, 'hu'), /not-sold-here/);
    const hu = O.buildOrderLines({ packageId: 'normal-12m', priceHuf: 1, country: 'HU', extras: [{ id: 'video', quantity: 1 }] }, 'hu');
    assert.equal(hu[1].unitCents, 18000);
  });
  await test('tierPhrase: first "up to", middle "between", last "above (bound)"', () => {
    assert.match(tierPhrase(two, 1, 'hu'), /150[\s.\u00a0\u202f]000[\s.\u00a0\u202f]000/);
    assert.notEqual(tierPhrase(three, 0, 'en'), tierPhrase(three, 1, 'en'));
    assert.match(tierPhrase(three, 2, 'en'), /300/);
  });
  await test('packageCard: one price line per higher tier', () => {
    const cat = P.listingCatalog({ listingPackages: { 'normal-12m': { tiers: three } } });
    const card = P.packageCard(cat.packages.find((p) => p.id === 'normal-12m'), cat, 'hu');
    assert.equal(card.price, '99\u00a0€');
    assert.equal(card.priceTiers.length, 2);
    assert.equal(card.priceTiers[1].price, '229\u00a0€');
  });

  /* ── Rounding (§8) ─────────────────────────────────────────────────── */
  await test('roundEur: half up to €100 by default', () => {
    assert.equal(R.roundEur(587896.4), 587900);
    assert.equal(R.roundEur(587850), 587900);
    assert.equal(R.roundEur(587849.99), 587800);
    assert.equal(R.roundEur(30), 100, 'a positive price never becomes 0');
  });
  await test('roundEur: other steps; malformed settings fall back to €100', () => {
    assert.equal(R.roundEur(587896.4, { step: 1000 }), 588000);
    assert.equal(R.roundEur(587896.4, { step: 1 }), 587896);
    assert.equal(R.roundEur(587896.5, { step: 1 }), 587897);
    assert.equal(R.roundEur(587896.4, { step: 50 }), 587900);
    assert.equal(R.roundEur(587874.99, { step: 50 }), 587850);
    assert.deepEqual(R.readPriceRounding({ step: 'x' }), { step: 100 });
    assert.deepEqual(R.readPriceRounding(null), { step: 100 });
    assert.deepEqual(R.readPriceRounding({ step: 500 }), { step: 500 });
  });
  await test('convertPrice: HUF is rounded, EUR is kept to the cent', () => {
    const snap = R.parseEcbRates(`<Cube time='2026-11-02'><Cube currency='HUF' rate='400'/><Cube currency='GBP' rate='0.87'/></Cube>`, new Date('2026-11-03T08:00:00Z'));
    assert.equal(R.convertPrice(235_158_560, 'HUF', snap).eur, 587900);
    assert.equal(R.convertPrice(235_158_560, 'HUF', snap, { step: 1000 }).eur, 588000);
    assert.equal(R.convertPrice(587896.4, 'EUR', snap).eur, 587896.4, 'EUR amounts unchanged');
    assert.equal(R.convertPrice(235_158_560, 'HUF', snap).huf, 235_158_560);
  });

  /* ── Money format (§7) ─────────────────────────────────────────────── */
  await test('fmtInt / fmtHuf / fmtEur: dot grouping, comma decimals', () => {
    assert.equal(N.fmtInt(1_000_000), '1.000.000');
    assert.equal(N.fmtInt(999), '999');
    assert.equal(N.fmtInt(-1234567), '-1.234.567');
    assert.equal(N.fmtInt(null), '–');
    assert.equal(N.fmtHuf(150_000_000), '150.000.000\u00a0Ft');
    assert.equal(N.fmtEur(1000), '1.000\u00a0€');
    assert.equal(N.fmtEur(123450, { cents: true }), '1.234,50\u00a0€');
    assert.equal(N.fmtEur(12.5), '12,50\u00a0€');
    assert.equal(N.fmtDecimal(1234.5), '1.234,5');
  });
  await test('typing: digits are grouped; cents keep one comma', () => {
    assert.equal(N.formatMoneyText(N.moneyDigits('1500000')), '1.500.000');
    assert.equal(N.formatMoneyText(N.moneyDigits('1 000 000 Ft')), '1.000.000');
    assert.equal(N.formatMoneyText(N.moneyDigits('€1.000.000')), '1.000.000');
    assert.equal(N.formatMoneyText(N.moneyDigits('1,000,000')), '1.000.000');
    assert.equal(N.formatMoneyText(N.moneyDigits('0012')), '12');
    assert.equal(N.formatMoneyText(N.moneyDigits('1234,5', true), true), '1.234,5');
    assert.equal(N.rawMoney(N.moneyDigits('1.234,5', true), true), '123450');
    assert.equal(N.rawMoney(N.moneyDigits('129', true), true), '12900');
    assert.equal(N.rawMoney(N.moneyDigits('1.500.000')), '1500000');
    assert.equal(N.rawMoney(''), '');
  });
  await test('readMoney: hidden raw value, no-JS text, bounds, decimals refused', () => {
    const fd = (entries) => { const f = new FormData(); for (const [k, v] of entries) f.append(k, v); return f; };
    assert.deepEqual(N.readMoney(fd([['p', '1500000'], ['p__raw', '1']]), 'p'), { ok: true, value: 1_500_000 });
    assert.deepEqual(N.readMoney(fd([['p', '1.500.000']]), 'p'), { ok: true, value: 1_500_000 }, 'no-JS submit of „1.500.000” saves 1500000');
    assert.deepEqual(N.readMoney(fd([['p', '1 500 000 Ft']]), 'p'), { ok: true, value: 1_500_000 });
    assert.deepEqual(N.readMoney(fd([['p', '1.000']]), 'p'), { ok: true, value: 1000 });
    assert.equal(N.readMoney(fd([['p', '1.5']]), 'p').message, 'Kérjük, egész számot adjon meg.');
    assert.equal(N.readMoney(fd([['p', '-3']]), 'p').ok, false);
    assert.equal(N.readMoney(fd([['p', 'abc']]), 'p').ok, false);
    assert.equal(N.readMoney(fd([['p', '20000']]), 'p', { max: 10_000 }).issue, 'max');
    assert.deepEqual(N.readMoney(fd([['p', '']]), 'p'), { ok: true, value: null });
    assert.equal(N.readMoney(fd([['p', '']]), 'p', { required: true }).issue, 'required');
    assert.deepEqual(N.readMoney(fd([['p', '129,50 €']]), 'p', { cents: true }), { ok: true, value: 12950 });
    assert.deepEqual(N.readMoney(fd([['p', '12950'], ['p__raw', '1']]), 'p', { cents: true }), { ok: true, value: 12950 });
    const all = N.readMoneyAll(fd([['b', '100'], ['b', '200'], ['b__raw', '1']]), 'b');
    assert.deepEqual(all.map((r) => r.value), [100, 200]);
  });

  /* ── Csomagok forms (§9.0) ─────────────────────────────────────────── */
  const fd = (obj) => { const f = new FormData(); for (const [k, v] of Object.entries(obj)) for (const value of [].concat(v)) f.append(k, String(value)); return f; };
  const stored = { listingPackages: { 'normal-12m': { tiers: three, names: { hu: 'Prémium', nl: 'Premium' } } }, listingExtras: { translation: { priceEur: 30 } }, priceRounding: { step: 500 }, other: 'kept' };
  const listingForm = {
    recommended: 'cheap-6m',
    'cheap-6m_name_hu': 'Alap', 'cheap-6m_name_nl': 'Basis', 'cheap-6m_months': '6', 'cheap-6m_video': 'none',
    'normal-12m_name_hu': 'Prémium+', 'normal-12m_name_nl': 'Premium+', 'normal-12m_months': '12', 'normal-12m_video': 'included', 'normal-12m_phone': 'yes',
  };
  await test('listing tab: names/content saved, prices untouched, nothing else written', () => {
    const patch = F.listingPatch(fd(listingForm), stored);
    assert.deepEqual(Object.keys(patch).sort(), ['listingPackages', 'packagePhone']);
    assert.equal(patch.listingPackages['cheap-6m'].names.hu, 'Alap');
    assert.equal(patch.listingPackages['cheap-6m'].video, 'none');
    assert.equal(patch.listingPackages['cheap-6m'].recommended, true);
    assert.equal(patch.listingPackages['normal-12m'].recommended, false);
    assert.deepEqual(patch.listingPackages['normal-12m'].tiers, three, 'stored tiers are kept');
    assert.equal(patch.listingPackages['normal-12m'].priceEurAbove, 229, 'legacy mirror for older readers');
    assert.deepEqual(patch.packagePhone, { 'cheap-6m': false, 'normal-12m': true });
    assert.equal(patch.listingPackages['normal-12m'].names.de, undefined, 'only the editable names are stored');
  });
  await test('listing tab: bad input is refused with a Hungarian message', () => {
    assert.throws(() => F.listingPatch(fd({ ...listingForm, 'cheap-6m_name_hu': '' }), stored), A.PackageSaveError);
    assert.throws(() => F.listingPatch(fd({ ...listingForm, 'cheap-6m_months': '0' }), stored), /1 és 36/);
    assert.throws(() => F.listingPatch(fd({ ...listingForm, recommended: 'x' }), stored), /ajánlott/);
  });
  await test('extras tab: single prices saved; tiered and retired extras kept', () => {
    const withTiered = { ...stored, listingExtras: { ...stored.listingExtras, 'category-highlight': { tiers: [{ upToHuf: 100, priceEur: 10 }, { upToHuf: null, priceEur: 20 }] } } };
    const patch = F.extrasPatch(fd({ extra_translation: '35', extra_video: '180', 'extra_renewal-6m': '25', 'extra_category-highlight': '99', 'extra_homepage-highlight': '1' }), withTiered);
    assert.deepEqual(Object.keys(patch), ['listingExtras']);
    assert.deepEqual(patch.listingExtras.translation, withTiered.listingExtras.translation, 'the single-language price is edited on Egyedi nyelvek only: the stored value stays, whatever is posted');
    assert.equal(patch.listingExtras['category-highlight'].tiers.length, 2, 'a tiered extra is edited on Ársávok only');
    assert.equal(patch.listingExtras['homepage-highlight'].priceEur, 25, 'a retired extra is not editable');
    assert.throws(() => F.extrasPatch(fd({ extra_video: '1.5' }), stored), /egész/);
    assert.throws(() => F.extrasPatch(fd({ extra_video: '' }), stored), A.PackageSaveError);
  });
  await test('tiers tab: rows → tiers for packages and extras; errors name the item and row', () => {
    const key = F.tierKey('pkg', 'cheap-6m');
    const ex = F.tierKey('extra', 'translation');
    // With JS: the hidden twins post every row (the last bound empty) plus the raw marker.
    const form = fd({ [`${key}_bound`]: ['100000000', ''], [`${key}_bound__raw`]: '1', [`${key}_price`]: ['69', '89'], [`${key}_price__raw`]: '1', [`${ex}_price`]: '25' });
    const patch = F.tiersPatch(form, stored);
    assert.deepEqual(Object.keys(patch).sort(), ['listingExtras', 'listingPackages']);
    assert.deepEqual(patch.listingPackages['cheap-6m'].tiers, [{ upToHuf: 100_000_000, priceEur: 69 }, { upToHuf: null, priceEur: 89 }]);
    assert.deepEqual(patch.listingPackages['normal-12m'].tiers, three, 'an item not on the form is kept');
    assert.deepEqual(patch.listingExtras.translation, stored.listingExtras.translation, 'the translation price is not a tier of this tab');
    // Without JS: the last row has no bound at all, and the text is formatted.
    const noJs = F.tiersPatch(fd({ [`${key}_bound`]: '100.000.000', [`${key}_price`]: ['69', '89'] }), stored);
    assert.deepEqual(noJs.listingPackages['cheap-6m'].tiers, [{ upToHuf: 100_000_000, priceEur: 69 }, { upToHuf: null, priceEur: 89 }]);
    assert.throws(() => F.tiersPatch(fd({ [`${key}_bound`]: ['200', '100'], [`${key}_price`]: ['1', '2', '3'] }), stored), /2\. sáv: A felső határ legyen nagyobb/);
    assert.throws(() => F.tiersPatch(fd({ [`${key}_bound`]: '', [`${key}_price`]: ['1', '2'] }), stored), /1\. sáv/);
  });
  await test('round trip: what the tiers tab saves is what checkout charges', () => {
    const key = F.tierKey('pkg', 'normal-12m');
    const patch = F.tiersPatch(fd({ [`${key}_bound`]: ['150000000', '300000000'], [`${key}_price`]: ['129', '179', '229'] }), {});
    const cat = P.listingCatalog(patch);
    for (const [huf, eur] of [[150_000_000, 129], [150_000_001, 179], [300_000_000, 179], [300_000_001, 229]]) {
      assert.equal(O.buildOrderLines({ packageId: 'normal-12m', priceHuf: huf, extras: [] }, 'hu', cat)[0].unitCents, eur * 100, String(huf));
    }
  });
  await test('rounding tab: only the offered steps', () => {
    assert.deepEqual(F.roundingPatch(fd({ step: '1000' })), { priceRounding: { step: 1000 } });
    assert.throws(() => F.roundingPatch(fd({ step: '7' })), A.PackageSaveError);
  });
  await test('legacy form (old settings page): prices with a threshold in millions still save', () => {
    const patch = F.legacyPatch(fd({ ...listingForm, 'normal-12m_price': '129', 'normal-12m_tiered': 'yes', 'normal-12m_price_above': '179', 'normal-12m_threshold_m': '150', 'cheap-6m_price': '69', extra_translation: '25' }), stored);
    assert.deepEqual(patch.listingPackages['normal-12m'].tiers, two);
    assert.deepEqual(patch.listingPackages['cheap-6m'].tiers, [{ upToHuf: null, priceEur: 69 }]);
    assert.equal(patch.listingPackages['cheap-6m'].names.hu, 'Alap');
    assert.equal(patch.listingExtras.translation.priceEur, 30, 'the single-language price is not saved from this form');
  });
  await test('PACKAGE_TABS: six tabs, unique routes under /portal/packages, rounding does not rebuild', () => {
    assert.deepEqual(A.PACKAGE_TABS.map((t) => t.id), ['listing', 'translations', 'languages', 'extras', 'tiers', 'rounding']);
    assert.equal(new Set(A.PACKAGE_TABS.map((t) => t.href)).size, 6);
    for (const tab of A.PACKAGE_TABS) { assert.match(tab.href, /^\/portal\/packages/); assert.match(tab.api, /^\/api\/portal\/packages\//); }
    assert.equal(A.packageTab('rounding').rebuild, false);
    assert.equal(A.backToTab('tiers', 'saved=1').headers.get('location'), '/portal/packages/tiers?saved=1');
  });
  await test('saveServicesPatch: merges only its keys, refuses non-admins, reports errors on the tab', async () => {
    let written = null;
    const db = (services) => ({
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { services }, error: null }) }) }),
        update: (row) => ({ eq: async () => { written = row; return { error: null }; } }),
      }),
    });
    const admin = { profile: { role: 'admin', email: 'a@b.c' }, user: { id: 'u' }, supabase: db({ listingPackages: { x: 1 }, priceRounding: { step: 100 }, keep: true }) };
    const res = await A.saveServicesPatch(admin, { priceRounding: { step: 500 }, gone: undefined }, 'rounding');
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/portal/packages/rounding?saved=1');
    assert.deepEqual(written.services, { listingPackages: { x: 1 }, priceRounding: { step: 500 }, keep: true });
    written = null;
    const refused = await A.saveServicesPatch(admin, () => { throw new A.PackageSaveError('Hibás'); }, 'tiers');
    assert.equal(refused.headers.get('location'), '/portal/packages/tiers?error=Hib%C3%A1s');
    assert.equal(written, null, 'nothing written on a refused save');
    const owner = await A.saveServicesPatch({ ...admin, profile: { role: 'owner' } }, {}, 'listing');
    assert.equal(owner.status, 403);
  });

  await test('order notices: retired lines and tier drift on unpaid orders', async () => {
    const N = await server.ssrLoadModule('/src/lib/portal/order-notices.ts');
    const cat = { extras: [{ id: 'homepage-highlight', retired: true }, { id: 'category-highlight' }] };
    const pkg = { kind: 'package', id: 'basic', quantity: 1, unitCents: 12900, label: 'Alap', tier: { index: 0, fromHuf: 0, toHuf: 150_000_000 } };
    const home = { kind: 'extra', id: 'homepage-highlight', quantity: 3, unitCents: 1000, label: 'Kiemelés a főoldalon' };
    const cathl = { kind: 'extra', id: 'category-highlight', quantity: 3, unitCents: 1000, label: 'Kiemelés' };
    assert.equal(N.needsReview('pending'), true);
    for (const s of ['paid', 'manual', 'cancelled', 'refunded', null]) assert.equal(N.needsReview(s), false);
    assert.deepEqual(N.retiredLines([pkg, home, cathl], cat), [home]);
    assert.deepEqual(N.retiredLines([{ ...home, kind: 'package' }], cat), []);
    assert.deepEqual(N.tierDrift([pkg, home], 150_000_000), []); // the bound itself is still the lower band
    assert.deepEqual(N.tierDrift([pkg], 150_000_001).map((d) => d.direction), ['up']);
    assert.deepEqual(N.tierDrift([{ ...pkg, tier: { index: 1, fromHuf: 150_000_001, toHuf: null } }], 90_000_000).map((d) => d.direction), ['down']);
    assert.deepEqual(N.tierDrift([{ ...pkg, tier: { index: 1, fromHuf: 150_000_001, toHuf: null } }], 900_000_000), []);
    for (const price of [0, null, undefined, NaN]) assert.deepEqual(N.tierDrift([pkg], price), []);
  });

  await test('MoneyInput in the browser: setMoney/moneyOf, signed invoice lines, plain fields stay non-negative', async () => {
    const M = await server.ssrLoadModule('/src/scripts/money-input.ts');
    const field = (dataset) => {
      const box = { dataset };
      return { value: '', selectionStart: 0, closest: () => box, parentElement: { querySelector: () => null }, setCustomValidity() {}, setSelectionRange() {} };
    };
    const priceLine = field({ cents: '1', signed: '1' });
    M.setMoney(priceLine, -1290);
    assert.equal(priceLine.value, '-12,90');
    assert.equal(M.moneyOf(priceLine), -1290);
    M.setMoney(priceLine, 123450);
    assert.equal(priceLine.value, '1.234,50');
    assert.equal(M.moneyOf(priceLine), 123450);
    priceLine.value = '−1.000,00';
    assert.equal(M.moneyOf(priceLine), -100000);
    const plain = field({});
    M.setMoney(plain, -1500000);
    assert.equal(plain.value, '1.500.000');
    plain.value = '-1.500.000';
    assert.equal(M.moneyOf(plain), 1500000);
    plain.value = '';
    assert.equal(M.moneyOf(plain), null);
  });

  await test('owner price field: grouped in the owner\'s language, read back by parseLocaleNumber', async () => {
    const N = await server.ssrLoadModule('/src/lib/portal/num.ts');
    const { parseLocaleNumber } = await server.ssrLoadModule('/src/lib/parse-number.ts');
    const cases = [
      ['1500000', 'hu', '1.500.000', 1500000], ['1500000', 'en', '1,500,000', 1500000], ['1500000', 'nl', '1.500.000', 1500000],
      ['1.500.0001', 'hu', '15.000.001', 15000001], ['1500,5', 'hu', '1.500,5', 1500.5], ['1500.50', 'en', '1,500.50', 1500.5],
      ['1500,', 'hu', '1.500,', 1500], ['€ 250 000', 'hu', '250.000', 250000], ['', 'hu', '', null], ['0012', 'hu', '12', 12],
    ];
    for (const [typed, locale, shown, value] of cases) {
      assert.equal(N.groupAmountTyping(typed, locale), shown, `${typed} (${locale})`);
      assert.equal(shown ? parseLocaleNumber(shown) : null, value, `${shown} parses`);
    }
    assert.equal(N.formatAmount(64000000, 'hu'), '64.000.000');
    assert.equal(N.formatAmount(1234.5, 'en'), '1,234.5');
    assert.equal(N.formatAmount(null, 'hu'), '');
    assert.equal(N.formatAmount(1, 'hu'), '1');
  });

  console.log(`\n${passed} tier, rounding, money, Csomagok and order-notice checks passed.`);
} finally {
  await server.close();
}
