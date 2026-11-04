/**
 * The contact detector for free listings (spec §5.2, §5.4): table-driven.
 *
 *   npm run test:contacts
 *
 * Each row is the text and the kinds that must be found, in order ([] = none).
 * Loads the real src/lib/contact-detect.ts through Vite (the same module the
 * browser bundle uses), so client and server cannot drift apart.
 */
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';

const CASES = [
  // Hungarian phone numbers, every common way of writing them.
  ['Hívjon: 06 30 123 4567', ['phone']],
  ['+36-20/123-45-67', ['phone']],
  ['0036 1 234 5678', ['phone']],
  ['06301234567', ['phone']],
  ['Tel.: +36 30 123 4567', ['phone']],
  ['+36 (30) 123-4567', ['phone']],
  ['(06 30) 123 4567', ['phone']],
  ['06-70-123-4567 bármikor', ['phone']],
  ['06/1/234-5678', ['phone']],
  ['06 1 234 5678', ['phone']],
  ['+36 1 234 5678', ['phone']],
  ['plusz 36 30 123 4567', ['phone']],
  ['30 123 4567', ['phone']],
  ['301234567', ['phone']],
  ['Hívjon a 06.30.123.45.67 számon', ['phone']],
  ['Telefon: ０６３０１２３４５６７', ['phone']], // full-width digits
  ['06\u200B30\u200B123\u200B4567', ['phone']], // zero-width characters in between
  ['٠٦٣٠١٢٣٤٥٦٧', ['phone']], // Arabic-Indic digits
  ['36301234567', ['phone']], // country code without the +
  // Foreign numbers.
  ['+49 151 23456789', ['phone']],
  ['+31 6 12345678', ['phone']],
  ['0031 6 12345678', ['phone']],
  ['+43 664 1234567', ['phone']],
  ['+44 7911 123456', ['phone']],
  // Two numbers in one text.
  ['Hívjon: 06 30 123 4567 vagy 06 20 765 4321', ['phone', 'phone']],

  // E-mail addresses, plain and disguised.
  ['info@pelda.hu', ['email']],
  ['Írjon: Kovacs.Janos@Gmail.com!', ['email']],
  ['kovacs.janos kukac gmail pont com', ['email']],
  ['kovacs (at) freemail.hu', ['email']],
  ['kovacs [at] freemail [dot] hu', ['email']],
  ['kovacs at freemail dot hu', ['email']],
  ['kovacs ＠ citromail.hu', ['email']],
  ['kovacs @ freemail . hu', ['email']],
  ['janos-kukac-gmail.com', ['email']],
  ['kovacs.janos gmail pont com', ['email']],
  ['írjon a kovacsjanos gmail.com címre', ['email']],
  ['e-mail: nagy.eva(kukac)t-online.de', ['email']],

  // Websites, messengers and handles.
  ['www.ingatlanom.hu', ['url']],
  ['Bővebben: https://ingatlanom.hu/haz-1', ['url']],
  ['Lásd: ingatlanom.hu.', ['url']],
  ['wa.me/36301234567', ['url', 'phone']],
  ['t.me/kovacsjanos', ['url']],
  ['facebook.com/kovacs.haz', ['url']],
  ['instagram.com/kovacs_ingatlan', ['url']],
  ['Viber: @kovacsjanos', ['handle']],
  ['skype: kovacs.janos', ['handle']],
  ['Kövessen: @kovacs_ingatlan', ['handle']],
  ['WhatsApp: +36 30 123 4567', ['phone']],

  // Not contact details: prices, areas, years, dates, registry numbers, postcodes.
  ['Ár: 45 000 000 Ft', []],
  ['45.000.000 HUF', []],
  ['45,000,000 Ft', []],
  ['Irányár 150000000', []],
  ['Vételár: 89 900 000,- Ft', []],
  ['Ára 129 000 €', []],
  ['200000000 Ft-os irányár', []],
  ['Telek: 1 200 m2', []],
  ['Telek 12500 m²', []],
  ['Épült 1998-ban, felújítva 2015–2016', []],
  ['Felújítások: 1998 2004 2015', []],
  ['hrsz.: 0123/45', []],
  ['Helyrajzi szám: 012345/6', []],
  ['8200 Veszprém', []],
  ['2026.11.03.', []],
  ['2026-11-03 és 2026-12-01 között', []],
  ['3 szoba, 2 fürdő, 120 nm', []],
  ['A ház 1,5 ha területen fekszik, 3 km-re a Balatontól.', []],
  ['Rezsi havi 35 000 Ft.', []],
  ['Fűtés: 24 kW gázkazán, 120 l bojler.', []],
  ['A telek 6 hektár, 18 aranykorona.', []],
  ['Csendes környék.De a város közel van.', []],
  ['We live at home. It is quiet.', []],
  ['The view at sunset.The garden is large.', []],
  ['Nagyon szép ház, gyönyörű kilátással a Balatonra.', []],
  ['Az ingatlan 2 szintes, 4 szobás.', []],
  ['Kérjük, az érdeklődést a FINDDOME felületén jelezze.', []],
  ['nulla hat harminc egy kettő három', []], // known limitation: spelled-out digits
  ['', []],
];

const server = await createServer({ configFile: false, cacheDir: `${tmpdir()}/fodel-contacts-${process.pid}`, resolve: { alias: { '~': new URL('../src', import.meta.url).pathname } }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
try {
  const { findContacts, contactErrors, contactCode } = await server.ssrLoadModule('/src/lib/contact-detect.ts');
  const failures = [];
  for (const [text, kinds] of CASES) {
    const hits = findContacts(text);
    const got = hits.map((h) => h.kind);
    if (JSON.stringify(got) !== JSON.stringify(kinds)) failures.push(`${JSON.stringify(text)}: expected [${kinds}] got [${got}] ${JSON.stringify(hits.map((h) => h.match))}`);
    for (const hit of hits) {
      if (text.slice(hit.index, hit.index + hit.match.length) !== hit.match) failures.push(`${JSON.stringify(text)}: match/index out of step ${JSON.stringify(hit)}`);
    }
  }
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`✓ ${CASES.length} table cases`);

  // The snippet is cut from the original text, not the normalised copy.
  assert.equal(findContacts('Hívjon: 06 30 123 4567.')[0].match, '06 30 123 4567');
  assert.equal(findContacts('x ０６３０１２３４５６７ y')[0].match, '０６３０１２３４５６７');
  assert.equal(findContacts('Írjon: info@pelda.hu.')[0].match, 'info@pelda.hu');
  assert.equal(findContacts('Lásd: www.ingatlanom.hu, köszönöm')[0].match, 'www.ingatlanom.hu');
  console.log('✓ the reported snippet is what the owner typed, without the sentence punctuation');

  assert.equal(contactCode('email'), 'contact-email');
  assert.equal(contactCode('phone'), 'contact-phone');
  assert.equal(contactCode('url'), 'contact-link');
  assert.equal(contactCode('handle'), 'contact-link');
  assert.deepEqual(contactErrors({ title: 'Szép ház', description: 'Hívjon: 06 30 123 4567', body: 'info@pelda.hu' }), {
    description: { code: 'contact-phone', match: '06 30 123 4567' },
    body: { code: 'contact-email', match: 'info@pelda.hu' },
  });
  assert.deepEqual(contactErrors({ title: null, body: undefined }), {});
  console.log('✓ contactErrors: one error per field, with the validation code and the snippet');

  // The server guard: paid listings are never checked; owners are refused; admins only with the box ticked.
  const { guardContacts } = await server.ssrLoadModule('/src/lib/portal/contact-guard.ts');
  const ctx = { propertyId: '00000000-0000-0000-0000-000000000000', source: 'test' };
  const fields = { title: 'Szép ház', body: 'Hívjon: 06 30 123 4567' };
  const form = (override) => { const f = new FormData(); if (override) f.set('contact_override', 'yes'); return f; };
  assert.deepEqual(await guardContacts(form(), fields, { ...ctx, free: false, isAdmin: false }), { ok: true });
  assert.deepEqual(await guardContacts(form(), { title: 'Szép ház' }, { ...ctx, free: true, isAdmin: false }), { ok: true });
  assert.deepEqual(await guardContacts(form(true), fields, { ...ctx, free: true, isAdmin: false }), { ok: false, errors: { body: { code: 'contact-phone', match: '06 30 123 4567' } } });
  assert.equal((await guardContacts(form(), fields, { ...ctx, free: true, isAdmin: true })).ok, false);
  assert.deepEqual(await guardContacts(form(true), fields, { ...ctx, free: true, isAdmin: true }), { ok: true });
  console.log('✓ guardContacts: paid never checked, owners refused (even with a forged box), admins only when ticked');
} finally {
  await server.close();
}
