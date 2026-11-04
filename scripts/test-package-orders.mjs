/**
 * Orders for the three listing packages (Basic, Europe, World): the real modules, the real matrix, no network.
 * Every price comes from priceFor() in integer cents, the term and the value band are frozen into the line, and an
 * upgrade charges the difference inside the band originally bought.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';

const server = await createServer({ configFile: false, cacheDir: `${tmpdir()}/fodel-pkgorders-${process.pid}`, resolve: { alias: { '~': new URL('../src', import.meta.url).pathname } }, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true } });
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };

try {
  const O = await server.ssrLoadModule('/src/lib/orders.ts');
  const L = await server.ssrLoadModule('/src/lib/listing-packages.ts');
  const P = await server.ssrLoadModule('/src/lib/listing-pricing.ts');
  const { LOCALES } = await server.ssrLoadModule('/src/i18n/ui.ts');
  const cat = L.listingCatalog({ pricingLive: true });
  const build = (selection, locale = 'hu', catalog = cat) => O.buildOrderLines({ extras: [], ...selection }, locale, catalog);
  const pkgLine = (lines) => lines.find((line) => line.kind === 'package');

  await test('the catalog has Basic, Europe, World on sale and the two older packages kept for old listings', () => {
    assert.deepEqual(L.sellingPackages(cat).map((p) => p.id), ['basic', 'europe', 'world']);
    assert.deepEqual(cat.packages.filter((p) => p.legacy).map((p) => p.id), ['cheap-6m', 'normal-12m']);
    assert.equal(L.packageOf(cat, 'cheap-6m').legacy, true, 'an old listing still finds its package');
    assert.equal(L.packageOf(cat, 'europe').recommended, true);
  });

  await test('before migrations 0055 and 0056 nothing changes: the two older packages are on sale and the new ones cannot be ordered', () => {
    const before = L.listingCatalog(undefined);
    assert.equal(before.pricingLive, false);
    assert.deepEqual(L.sellingPackages(before).map((p) => p.id), ['cheap-6m', 'normal-12m']);
    assert.equal(L.sellingPackages(before).filter((p) => p.recommended).map((p) => p.id).join(), 'normal-12m', 'the older Prémium is the recommended card, as it always was');
    assert.throws(() => O.buildOrderLines({ packageId: 'world', months: 6, priceHuf: 1, extras: [] }, 'hu', before), (e) => e.code === 'unknown-package');
    const old = O.buildOrderLines({ packageId: 'normal-12m', priceHuf: 10_000_000, extras: [] }, 'hu', before);
    assert.equal(old[0].unitCents, 12900);
    assert.equal(L.listingCatalog({ pricingLive: true }).pricingLive, true);
  });

  await test('every one of the 27 cells becomes an order line with exactly the table price in integer cents', () => {
    const bands = [10_000_000, 48_000_000, 250_000_000];
    let n = 0;
    bands.forEach((priceHuf, tier) => {
      for (const id of ['basic', 'europe', 'world']) {
        [1, 3, 6].forEach((months, i) => {
          const line = pkgLine(build({ packageId: id, months, priceHuf }));
          assert.equal(line.unitCents, P.DEFAULT_PRICE_TABLE[id][tier][i], `${id} ${months} tier ${tier}`);
          assert.ok(Number.isInteger(line.unitCents));
          assert.equal(line.months, months);
          assert.equal(line.packageId, id);
          n++;
        });
      }
    });
    assert.equal(n, 27);
  });

  await test('the line reads like the brief: World csomag, 6 hónap (25–100 millió Ft) - 76,90 €', () => {
    const line = pkgLine(build({ packageId: 'world', months: 6, priceHuf: 48_000_000 }));
    assert.equal(line.label.replace(/ /g, ' '), 'World csomag, 6 hónap (25–100 millió Ft)');
    assert.equal(line.unitCents, 7690);
    assert.deepEqual(line.tier, { index: 1, fromHuf: 25_000_000, toHuf: 100_000_000 });
  });

  await test('the label exists in all 28 languages and names the term', () => {
    for (const locale of LOCALES) {
      const label = pkgLine(build({ packageId: 'europe', months: 3, priceHuf: 48_000_000 }, locale)).label;
      assert.ok(label.length > 8 && /3/.test(label.replace(/[٣]/g, '3')) || /[٣三]/.test(label), `${locale}: ${label}`);
    }
  });

  await test('the band is frozen: a later matrix change or a different price never moves a built order', () => {
    const before = pkgLine(build({ packageId: 'basic', months: 3, priceHuf: 48_000_000 }));
    const edited = L.listingCatalog({ pricingLive: true, listingPricing: { ...P.defaultPricing(), prices: { ...P.defaultPricing().prices, basic: { 0: { 1: 1, 3: 1, 6: 1 }, 1: { 1: 1, 3: 1, 6: 1 }, 2: { 1: 1, 3: 1, 6: 1 } } } } });
    assert.equal(pkgLine(build({ packageId: 'basic', months: 3, priceHuf: 48_000_000 }, 'hu', edited)).unitCents, 1, 'a new order uses the new price');
    assert.equal(before.unitCents, 2490, 'the old line is a value, not a lookup');
    // A renewal or upgrade passes the band it was first bought in.
    assert.equal(pkgLine(build({ packageId: 'basic', months: 3, priceHuf: 250_000_000, tierIndex: 1 })).unitCents, 2490);
  });

  await test('boundaries decide the band of the order: 24 999 999, 25 000 000, 100 000 000, 100 000 001', () => {
    const cents = (priceHuf) => pkgLine(build({ packageId: 'world', months: 1, priceHuf })).unitCents;
    assert.deepEqual([24_999_999, 25_000_000, 100_000_000, 100_000_001].map(cents), [1690, 2190, 2190, 2790]);
    assert.equal(cents(0), 1690, 'a draft with no price is priced from the first band (it cannot be checked out before it has one)');
  });

  await test('an upgrade charges the difference inside the original band and term, never negative', () => {
    const up = pkgLine(build({ packageId: 'world', upgradeFrom: 'basic', months: 6, tierIndex: 1 }));
    assert.equal(up.unitCents, 7690 - 3890);
    assert.match(up.label, /^Basic → World csomag, 6 hónap/);
    assert.throws(() => build({ packageId: 'basic', upgradeFrom: 'world', months: 6, tierIndex: 1 }), (e) => e.code === 'bad-upgrade');
    assert.throws(() => build({ packageId: 'europe', upgradeFrom: 'europe', months: 6, tierIndex: 1 }), (e) => e.code === 'bad-upgrade');
    assert.throws(() => build({ packageId: 'europe', upgradeFrom: 'cheap-6m', months: 6, tierIndex: 1 }), (e) => e.code === 'bad-upgrade');
  });

  await test('refusals say why: unknown package, term, price, English, original language, single languages, category term', () => {
    const code = (selection, locale) => { try { build(selection, locale); } catch (e) { return e.code; } return null; };
    assert.equal(code({ packageId: 'platinum', months: 1 }), 'unknown-package');
    assert.equal(code({ packageId: 'basic', months: 2 }), 'bad-duration');
    assert.equal(code({ packageId: 'basic' }), 'bad-duration');
    const off = L.listingCatalog({ pricingLive: true, listingPricing: { packages: { world: { enabled: false } } } });
    assert.throws(() => build({ packageId: 'world', months: 1 }, 'hu', off), (e) => e.code === 'unknown-package');
    assert.equal(code({ packageId: 'europe', months: 6, priceHuf: 1, translation: { packageId: 'europe', excludedLocales: ['de', 'en'] } }), 'exclude-en');
    assert.equal(code({ packageId: 'europe', months: 6, priceHuf: 1, translation: { packageId: 'europe', excludedLocales: ['hu'] } }), 'bad-locale');
    assert.equal(code({ packageId: 'europe', months: 6, priceHuf: 1, extras: [{ id: 'translation', quantity: 1, locales: ['fr'] }] }), 'singles-off');
    assert.equal(code({ packageId: 'basic', months: 1, priceHuf: 1, extras: [{ id: 'category-highlight', quantity: 3 }] }), 'extra-term', 'one month cannot carry a three-month highlight');
    assert.equal(code({ packageId: 'basic', months: 3, priceHuf: 1, extras: [{ id: 'category-highlight', quantity: 6 }] }), 'extra-term', 'a highlight is not longer than the package');
    assert.equal(code({ packageId: 'basic', months: 3, priceHuf: 1, extras: [{ id: 'category-highlight', quantity: 3 }] }), null);
    assert.equal(code({ packageId: 'basic', months: 6, priceHuf: 1, extras: [{ id: 'category-highlight', quantity: 3 }] }), null);
  });

  await test('what the buyer switched off is written on the line; the price does not change; the original language is never in it', () => {
    const plain = pkgLine(build({ packageId: 'europe', months: 6, priceHuf: 48_000_000 }));
    const off = pkgLine(build({ packageId: 'europe', months: 6, priceHuf: 48_000_000, translation: { packageId: 'europe', excludedLocales: ['fr', 'es'] } }));
    assert.equal(off.unitCents, plain.unitCents);
    assert.deepEqual(off.excludedLocales, ['fr', 'es']);
    assert.equal(off.locales.includes('fr'), false);
    assert.equal(off.locales.includes('hu'), false, 'the original language is not a translation');
    assert.equal(off.locales.includes('en'), true);
    assert.equal(off.locales.includes('sr') && off.locales.includes('uk'), true, 'Europe includes sr and uk (Q3)');
    assert.equal(off.locales.includes('ar') || off.locales.includes('zh'), false, 'Europe does not include the World-only languages');
    const world = pkgLine(build({ packageId: 'world', months: 6, priceHuf: 1 }));
    assert.equal(world.locales.length, 27);
    const basic = pkgLine(build({ packageId: 'basic', months: 6, priceHuf: 1 }));
    assert.deepEqual(basic.locales, ['en', 'de']);
    // A German owner: German is the original, not a translation.
    const german = pkgLine(build({ packageId: 'basic', months: 6, priceHuf: 1, translation: { packageId: 'basic', sourceLocale: 'de' } }));
    assert.deepEqual(german.locales, ['hu', 'en'], 'Basic is Hungarian, English and German: a German original leaves Hungarian and English to translate');
  });

  await test('the referral discount is 10% of the package line only, in whole cents, half up', () => {
    const lines = build({ packageId: 'europe', months: 3, priceHuf: 10_000_000, extras: [{ id: 'video', quantity: 1 }] });
    assert.equal(O.referralDiscountCents(lines), 279, '10% of 27,90 €');
    assert.equal(O.referralDiscountCents([{ kind: 'package', id: 'x', quantity: 1, unitCents: 1895, label: '' }]), 190, '189.5 rounds up');
    assert.equal(O.referralDiscountCents([{ kind: 'package', id: 'x', quantity: 1, unitCents: 1894, label: '' }]), 189);
    assert.equal(O.referralDiscountCents([{ kind: 'extra', id: 'video', quantity: 1, unitCents: 18000, label: '' }]), 0);
  });

  await test('order totals are exact sums of integer cents', () => {
    const lines = build({ packageId: 'world', months: 6, priceHuf: 250_000_000, extras: [{ id: 'category-highlight', quantity: 3 }] });
    const total = O.orderTotalCents(lines);
    assert.ok(Number.isInteger(total));
    assert.equal(total, lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0));
    assert.equal(pkgLine(lines).unitCents, 9590);
  });

  await test('an old order on an older package still builds exactly as before', () => {
    const lines = O.buildOrderLines({ packageId: 'cheap-6m', extras: [], priceHuf: 10_000_000 }, 'hu', cat);
    assert.equal(lines[0].id, 'cheap-6m');
    assert.equal(lines[0].unitCents, 6900);
  });

  /* ── The Csomagok forms: matrix, content, single languages ─────────── */
  const F = await server.ssrLoadModule('/src/lib/portal/package-forms.ts');
  const A = await server.ssrLoadModule('/src/lib/portal/package-admin.ts');
  const fd = (pairs) => { const f = new FormData(); for (const [k, v] of pairs) f.append(k, String(v)); return f; };
  const matrixForm = (pricing, over = {}) => {
    const pairs = [];
    pricing.valueTiers.slice(0, -1).forEach((t) => pairs.push(['bound', t.upToHuf]));
    pairs.push(['bound__raw', '1']);
    pricing.durations.forEach((d) => pairs.push(['duration', d]));
    for (const key of ['basic', 'europe', 'world']) {
      pricing.valueTiers.forEach((_t, row) => pricing.durations.forEach((months, col) => {
        const name = `cell_${key}_${row}_${col}`;
        pairs.push([name, over[name] ?? pricing.prices[key][row][months]], [`${name}__raw`, over[name] === undefined ? '1' : '0']);
      }));
    }
    return fd(pairs.filter(([k]) => !k.endsWith('__raw') || true));
  };
  const stored = { listingPackages: { 'normal-12m': { names: { hu: 'Kiemelt' } } }, listingExtras: { video: { priceEur: 180 } }, priceRounding: { step: 500 }, packagePhone: { 'cheap-6m': false } };
  const def = P.defaultPricing();

  await test('matrix tab: the form as the page posts it saves exactly the table, and only listingPricing', () => {
    const patch = F.pricingPatch(matrixForm(def), stored);
    assert.deepEqual(Object.keys(patch), ['listingPricing']);
    assert.deepEqual(patch.listingPricing.prices, def.prices);
    assert.deepEqual(patch.listingPricing.valueTiers, def.valueTiers);
    assert.deepEqual(patch.listingPricing.durations, [1, 3, 6]);
    assert.deepEqual(patch.listingPricing.packages, def.packages, 'names and content are not on this tab');
  });

  await test('matrix tab: prices typed the way people type them are read as cents; a mistake saves nothing', () => {
    const cell = 'cell_europe_1_1';
    const typed = (value) => F.pricingPatch(matrixForm(def, { [cell]: value }), stored).listingPricing.prices.europe[1][3];
    assert.equal(typed('38,50'), 3850);
    assert.equal(typed('38,5 €'), 3850);
    assert.equal(typed('38'), 3800);
    assert.equal(typed('1 234,56'), 123456);
    for (const bad of ['', '-1', 'abc', '10 000,01', '0', '12,345€x']) assert.throws(() => F.pricingPatch(matrixForm(def, { [cell]: bad }), stored), A.PackageSaveError, `"${bad}"`);
    assert.throws(() => F.pricingPatch(matrixForm(def, { [cell]: '' }), stored), /Europe, 3 hónap, 25–100 millió Ft: az ár legyen 0-nál nagyobb/);
  });

  await test('matrix tab: bands ascend, the last is open, durations are unique whole months; more bands and months work', () => {
    const pairs = (f) => [...f.entries()];
    const withBounds = (bounds, durations) => {
      const f = matrixForm(def);
      const out = new FormData();
      for (const [k, v] of f.entries()) if (k !== 'bound' && k !== 'duration' && !k.startsWith('cell_')) out.append(k, v);
      bounds.forEach((b) => out.append('bound', b));
      durations.forEach((d) => out.append('duration', d));
      for (const key of ['basic', 'europe', 'world']) for (let row = 0; row <= bounds.length; row++) durations.forEach((_d, col) => { out.append(`cell_${key}_${row}_${col}`, '5'); out.append(`cell_${key}_${row}_${col}__raw`, '0'); });
      return out;
    };
    assert.throws(() => F.pricingPatch(withBounds([100, 50], [1, 3]), stored), A.PackageSaveError);
    assert.throws(() => F.pricingPatch(withBounds([100], [1, 1]), stored), A.PackageSaveError);
    assert.throws(() => F.pricingPatch(withBounds([100], [1, 25]), stored), A.PackageSaveError);
    assert.throws(() => F.pricingPatch(withBounds([100], ['x']), stored), A.PackageSaveError);
    assert.throws(() => F.pricingPatch(withBounds([''], [1]), stored), /1\. ingatlanérték-sáv/);
    const grown = F.pricingPatch(withBounds([10_000_000, 50_000_000, 200_000_000], [2, 12]), stored).listingPricing;
    assert.equal(grown.valueTiers.length, 4);
    assert.deepEqual(grown.durations, [2, 12]);
    assert.equal(P.priceFor({ packageId: 'world', months: 12, priceHuf: 300_000_000, pricing: grown }).cents, 500);
  });

  await test('a saved matrix is what checkout charges (round trip through the catalog)', () => {
    const patch = F.pricingPatch(matrixForm(def, { cell_world_2_2: '99,90' }), stored);
    const cat = L.listingCatalog({ ...patch, pricingLive: true });
    assert.equal(pkgLine(build({ packageId: 'world', months: 6, priceHuf: 250_000_000 }, 'hu', cat)).unitCents, 9990);
    assert.equal(pkgLine(build({ packageId: 'world', months: 6, priceHuf: 48_000_000 }, 'hu', cat)).unitCents, 7690, 'the other cells did not move');
  });

  const content = (over = {}) => {
    const pairs = [['recommended', 'europe']];
    for (const key of ['basic', 'europe', 'world']) {
      pairs.push([`${key}_name_hu`, key[0].toUpperCase() + key.slice(1)], [`${key}_name_en`, key[0].toUpperCase() + key.slice(1)], [`${key}_images`, 20], [`${key}_video`, 'included'], [`${key}_phone`, 'yes'], [`${key}_enabled`, 'yes']);
    }
    return fd(pairs.filter(([k]) => !(k in over && over[k] === null)).map(([k, v]) => [k, over[k] ?? v]).concat(Object.entries(over).filter(([k, v]) => v !== null && !pairs.some(([pk]) => pk === k))));
  };

  await test('content tab: names, content and languages; a language list equal to the rule is stored as no list', () => {
    const patch = F.contentPatch(content({ world_name_hu: 'Világ', world_images: 35, world_edited_text: 'yes' }), stored);
    assert.deepEqual(Object.keys(patch).sort(), ['listingPricing', 'translationPackages']);
    assert.equal(patch.listingPricing.packages.world.names.hu, 'Világ');
    assert.equal(patch.listingPricing.packages.world.features.maxImages, 35);
    assert.equal(patch.listingPricing.packages.world.features.editedText, true);
    assert.equal(patch.listingPricing.packages.europe.recommended, true);
    assert.equal(patch.listingPricing.prices.basic[0][1], 890, 'prices are not on this tab');
    assert.equal(patch.translationPackages.packages.every((pkg) => !('locales' in pkg)), true, 'no language field posted: rules stay');
    const rule = ['hu', 'en', 'de'];
    const same = F.contentPatch(fd([...content().entries(), ['lang_basic__present', '1'], ...rule.map((c) => ['lang_basic', c])]), stored);
    assert.equal('locales' in same.translationPackages.packages.find((p) => p.id === 'basic'), false, 'the rule\'s own list is no list');
    const custom = F.contentPatch(fd([...content().entries(), ['lang_basic__present', '1'], ['lang_basic', 'fr'], ['lang_basic', 'de']]), stored);
    assert.deepEqual(custom.translationPackages.packages.find((p) => p.id === 'basic').locales, ['en', 'de', 'fr'], 'English is always in, in the site\'s language order');
  });

  await test('content tab: refusals - names, image cap, video, no package left on sale, a recommended package that is off', () => {
    assert.throws(() => F.contentPatch(content({ basic_name_en: '' }), stored), /magyar és angol neve/);
    assert.throws(() => F.contentPatch(content({ basic_images: 0 }), stored), /1 és 200/);
    assert.throws(() => F.contentPatch(content({ basic_images: 'x' }), stored), /1 és 200/);
    assert.throws(() => F.contentPatch(content({ basic_video: 'extra' }), stored), /videó/);
    assert.throws(() => F.contentPatch(content({ recommended: 'gold' }), stored), /ajánlott/);
    assert.throws(() => F.contentPatch(content({ basic_enabled: null, europe_enabled: null, world_enabled: null }), stored), /Legalább egy csomag/);
    assert.throws(() => F.contentPatch(content({ europe_enabled: null }), stored), /ajánlott csomag nem lehet kikapcsolva/);
    assert.equal(F.contentPatch(content({ basic_images: 200 }), stored).listingPricing.packages.basic.features.maxImages, 200);
    assert.equal(F.contentPatch(content({ basic_unlimited: 'yes', basic_images: '' }), stored).listingPricing.packages.basic.features.maxImages, null);
  });

  await test('single languages tab: off by default, two prices in cents, the older euro reader stays in step', () => {
    const patch = F.singlesPatch(fd([['european', '1,50'], ['world', '7']]), stored);
    assert.deepEqual(patch.listingPricing.singleLanguages, { enabled: false, europeanCents: 150, worldOnlyCents: 700 });
    assert.deepEqual(patch.translationPackages.singleEur, { european: 1.5, world: 7 });
    assert.equal(F.singlesPatch(fd([['enabled', 'yes'], ['european', '1'], ['world', '5']]), stored).listingPricing.singleLanguages.enabled, true);
    assert.throws(() => F.singlesPatch(fd([['european', '1,5x'], ['world', '5']]), stored), /Európai nyelv/);
    assert.throws(() => F.singlesPatch(fd([['european', '1'], ['world', '-5']]), stored), /Világnyelv/);
  });

  await test('each tab writes only its own keys: the extras, the rounding and the other tab\'s settings are byte-identical', () => {
    const before = JSON.stringify(stored);
    for (const patch of [F.pricingPatch(matrixForm(def), stored), F.contentPatch(content(), stored), F.singlesPatch(fd([['european', '1'], ['world', '5']]), stored)]) {
      const merged = { ...stored, ...patch };
      assert.deepEqual(merged.listingExtras, stored.listingExtras);
      assert.deepEqual(merged.priceRounding, stored.priceRounding);
      assert.deepEqual(merged.listingPackages, stored.listingPackages);
    }
    assert.equal(JSON.stringify(stored), before, 'the stored settings object is never mutated');
  });

  await test('the three endpoints refuse everyone but an admin (403), and save through the shared path', async () => {
    for (const name of ['listing', 'translations', 'languages']) {
      const route = await server.ssrLoadModule(`/src/pages/api/portal/packages/${name}.ts`);
      for (const role of ['owner', undefined]) {
        const response = await route.POST({ request: new Request('http://site.test/x', { method: 'POST', body: new FormData() }), locals: { profile: role ? { role } : null } });
        assert.equal(response.status, 403, `${name} ${role ?? 'anonymous'}`);
      }
    }
    const source = fs.readFileSync(new URL('../src/pages/api/portal/packages/listing.ts', import.meta.url), 'utf8');
    assert.match(source, /saveServicesPatch/);
  });

  await test('an admin save writes the new matrix into the services row and leaves the other keys alone', async () => {
    let written = null;
    const db = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { services: stored }, error: null }) }) }), update: (row) => ({ eq: async () => { written = row; return { error: null }; } }) }) };
    const res = await A.saveServicesPatch({ profile: { role: 'admin', email: 'a@b.c' }, user: { id: 'u' }, supabase: db }, (current) => F.pricingPatch(matrixForm(def, { cell_basic_0_0: '9,90' }), current), 'rounding');
    assert.equal(res.status, 303);
    assert.equal(written.services.listingPricing.prices.basic[0][1], 990);
    assert.deepEqual(written.services.listingExtras, stored.listingExtras);
    assert.deepEqual(written.services.priceRounding, stored.priceRounding);
  });

  await test('3.7 the "Basic included" line: once, on an older-package order only; never on the new packages, an upgrade or a translation-only order', async () => {
    const C = await server.ssrLoadModule('/src/lib/invoicing/catalogue.ts');
    const legacyLines = O.buildOrderLines({ packageId: 'normal-12m', extras: [] }, 'hu', L.listingCatalog({}));
    assert.equal(O.hasLegacyPackageLine(legacyLines), true);
    const line = C.basicIncludedLine(legacyLines);
    assert.match(line.description, /Basic \(angol, német\) – benne van/);
    assert.match(line.descriptionNl, /Basic \(Engels, Duits\)/);
    assert.equal(line.unitCents, 0);
    assert.equal(C.basicIncludedLine(build({ packageId: 'world', months: 6, priceHuf: 48_000_000 })), null, 'a new package names its languages itself');
    assert.equal(C.basicIncludedLine(build({ packageId: 'world', upgradeFrom: 'basic', months: 3, tierIndex: 1 })), null, 'an upgrade');
    assert.equal(C.basicIncludedLine([{ kind: 'extra', id: 'translation-package', quantity: 1, unitCents: 1200, label: 'x', locales: ['fr'] }]), null, 'a translation-only order');
    assert.equal(C.basicIncludedLine([]), null);
    // The order e-mail says it once too, in hu, nl and en; nothing is added to a new-package order.
    for (const [locale, word] of [['hu', /benne van/], ['nl', /inbegrepen/], ['en', /included/]]) {
      const rows = O.linesForEmail(legacyLines, locale);
      assert.equal(rows.filter((r) => word.test(r.label)).length, 1, locale);
    }
    assert.equal(O.linesForEmail(build({ packageId: 'europe', months: 3, priceHuf: 1 }), 'hu').length, 1);
  });

  await test('invoice lines of the new packages read like the order, in Hungarian and Dutch, with the frozen price', async () => {
    const C = await server.ssrLoadModule('/src/lib/invoicing/catalogue.ts');
    const items = C.invoiceCatalogue({ pricingLive: true });
    const lines = build({ packageId: 'world', months: 6, priceHuf: 48_000_000 });
    const out = C.invoiceLineFromOrder(lines[0], items, cat);
    assert.equal(out.description, 'World csomag, 6 hónap (25–100 millió Ft)');
    assert.match(out.descriptionNl, /^World pakket, 6 maanden/);
    assert.equal(out.unitCents, 7690);
    const up = C.invoiceLineFromOrder(build({ packageId: 'world', upgradeFrom: 'basic', months: 3, tierIndex: 1 })[0], items, cat);
    assert.match(up.description, /^Basic → World csomag, 3 hónap/);
    assert.equal(up.unitCents, 4990 - 2490);
  });

  await test('the flat six-month renewal is sold only before the 2026 prices are live (then a renewal is the package price)', async () => {
    const extra = (catalog, id) => catalog.extras.find((e) => e.id === id);
    assert.equal(extra(L.listingCatalog(undefined), 'renewal-6m').retired, undefined);
    assert.equal(extra(L.listingCatalog({ pricingLive: true }), 'renewal-6m').retired, true);
    assert.equal(L.sellingExtras(L.listingCatalog({ pricingLive: true }), { anyCountry: true }).some((e) => e.id === 'renewal-6m'), false);
    assert.equal(L.sellingExtras(L.listingCatalog(undefined), { anyCountry: true }).some((e) => e.id === 'renewal-6m'), true);
    assert.equal(extra(L.listingCatalog({ pricingLive: true }), 'category-highlight').retired, undefined);
  });
  console.log(`\n${passed} package order checks passed.`);
} catch (error) {
  console.error('✗ ' + (error.stack || error));
  process.exitCode = 1;
} finally {
  await server.close();
}
