/**
 * Sharing a listing (master §10b): the exact links behind the Facebook, WhatsApp and e-mail buttons, the text they carry,
 * the words in all 28 languages, and the guarantees that cannot be seen in a screenshot (no third-party script, no share
 * row on a stand-in page, the UTM never on the canonical). Pure modules: no browser, no network.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';

const root = new URL('../', import.meta.url).pathname;
const server = await createServer({ configFile: false, cacheDir: `${tmpdir()}/fodel-share-${process.pid}`, resolve: { alias: { '~': root + 'src' } }, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true } });
const { isolate, shareUrl, truncate, shareText, facebookUrl, whatsappUrl, mailtoUrl } = await server.ssrLoadModule('/src/lib/share.ts');
const { SHARE_COPY, EMAIL_LABEL } = await server.ssrLoadModule('/src/i18n/share-copy.ts');
const { LOCALES, LOCALE_META } = await server.ssrLoadModule('/src/i18n/ui.ts');
const { eur } = await server.ssrLoadModule('/src/lib/format.ts');
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };
const LRI = '⁦';
const PDI = '⁩';
const NB = '\u00a0';

const URLS = {
  hu: 'https://www.finddome.com/hu/birtok-a-balaton-felvidekeken-1042',
  de: 'https://www.finddome.com/de/anwesen-am-balaton-1042',
  ar: 'https://www.finddome.com/ar/house-1042',
  zh: 'https://www.finddome.com/zh/house-1042',
};
const TITLES = {
  hu: 'Birtok a Balaton-felvidéken & kert #1? „idilli”',
  de: 'Anwesen am Balaton 🏡 – 100 % Ruhe',
  ar: 'عقار هادئ قرب بحيرة بالاتون',
  zh: '巴拉顿湖畔的庄园',
};

try {
  test('the share text is "title – price – FINDDOME", and the price is left out when there is none', () => {
    assert.equal(shareText({ title: 'Birtok a Balaton-felvidéken', price: `€${NB}225${NB}000` }), `Birtok a Balaton-felvidéken – €${NB}225${NB}000 – FINDDOME`);
    assert.equal(shareText({ title: 'Birtok a Balaton-felvidéken', price: null }), 'Birtok a Balaton-felvidéken – FINDDOME');
    assert.equal(shareText({ title: '  Birtok  ' }), 'Birtok – FINDDOME');
    // The same sentence the page prints, from the public formatter.
    assert.equal(shareText({ title: 'Birtok', price: eur(225000, 'hu') }), `Birtok – €${NB}225${NB}000 – FINDDOME`);
  });

  test('a 600-character title is cut at a word, the price and the brand always survive, and the whole text stays within 200 characters', () => {
    const long = Array.from({ length: 120 }, (_, i) => `szó${i}`).join(' ');
    assert.equal(long.length > 600, true);
    const text = shareText({ title: long, price: `€${NB}225${NB}000` });
    assert.equal(text.length <= 200, true, `${text.length}`);
    assert.equal(text.endsWith(` – €${NB}225${NB}000 – FINDDOME`), true);
    const body = text.slice(0, text.indexOf('… – '));
    assert.equal(/szó\d+$/.test(body), true, 'cut at a whole word');
    assert.equal(truncate('rövid szöveg', 200), 'rövid szöveg');
    assert.equal(truncate('x'.repeat(300), 50).length, 51, 'a word longer than the limit is cut hard, never loops');
  });

  test('the address gets the UTM tail when on, and nothing when off', () => {
    const base = URLS.hu;
    assert.equal(shareUrl(base, 'facebook', true), `${base}?utm_source=facebook&utm_medium=share&utm_campaign=listing`);
    assert.equal(shareUrl(base, 'native', true), `${base}?utm_source=native&utm_medium=share&utm_campaign=listing`);
    assert.equal(shareUrl(base, 'copy', false), base);
    assert.equal(shareUrl(`${base}?x=1`, 'email', true), `${base}?x=1&utm_source=email&utm_medium=share&utm_campaign=listing`);
    // Sharing a link that already carries a tail replaces it instead of doubling it.
    assert.equal((shareUrl(shareUrl(base, 'copy', true), 'whatsapp', true).match(/utm_source/g) ?? []).length, 1);
  });

  test('Facebook: the sharer address with the whole address encoded, exact', () => {
    assert.equal(facebookUrl(URLS.hu, true), 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.finddome.com%2Fhu%2Fbirtok-a-balaton-felvidekeken-1042%3Futm_source%3Dfacebook%26utm_medium%3Dshare%26utm_campaign%3Dlisting');
    assert.equal(facebookUrl(URLS.hu, false), 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.finddome.com%2Fhu%2Fbirtok-a-balaton-felvidekeken-1042');
  });

  test('WhatsApp: wa.me with no phone number, the text and the address in one encoded string, exact', () => {
    const text = shareText({ title: 'Birtok', price: `€${NB}225${NB}000` });
    const link = whatsappUrl(text, URLS.hu, { utm: false });
    assert.equal(link, `https://wa.me/?text=${encodeURIComponent(`Birtok – €${NB}225${NB}000 – FINDDOME ${URLS.hu}`)}`);
    assert.equal(/wa\.me\/\d/.test(link), false, 'a share never names a phone number');
    assert.equal(link.startsWith('https://wa.me/?text='), true);
  });

  test('E-mail: mailto with subject and body, CRLF between lines, %20 for spaces and never "+", exact', () => {
    const link = mailtoUrl({ subject: 'Birtok – FINDDOME', intro: SHARE_COPY.hu.mailIntro, text: 'Birtok – FINDDOME', url: URLS.hu, utm: false });
    assert.equal(link, `mailto:?subject=${encodeURIComponent('Birtok – FINDDOME')}&body=${encodeURIComponent(`${SHARE_COPY.hu.mailIntro}\r\nBirtok – FINDDOME\r\n${URLS.hu}`)}`);
    assert.equal(link.includes('%0D%0A'), true);
    assert.equal(link.includes('+'), false);
    assert.equal(link.includes('%20'), true);
    assert.equal(link.startsWith('mailto:?subject='), true);
  });

  for (const code of ['hu', 'de', 'ar', 'zh']) {
    test(`${code}: every link round-trips through decodeURIComponent (spaces, &, #, ?, €, emoji, RTL text)`, () => {
      const rtl = LOCALE_META[code].dir === 'rtl';
      const price = eur(225000, code);
      const text = shareText({ title: TITLES[code], price });
      const url = URLS[code];

      const fb = new URL(facebookUrl(url, true));
      assert.equal(fb.origin + fb.pathname, 'https://www.facebook.com/sharer/sharer.php');
      assert.equal(fb.searchParams.get('u'), shareUrl(url, 'facebook', true));
      // The & and # of the title never leak into the link's own structure.
      assert.equal([...fb.searchParams.keys()].join(), 'u');

      const wa = new URL(whatsappUrl(text, url, { utm: true, rtl }));
      const shared = wa.searchParams.get('text');
      const address = shareUrl(url, 'whatsapp', true);
      assert.equal(shared, `${text} ${rtl ? isolate(address) : address}`);
      assert.equal([...wa.searchParams.keys()].join(), 'text');

      const subject = shareText({ title: TITLES[code] });
      const mail = mailtoUrl({ subject, intro: SHARE_COPY[code].mailIntro, text, url, utm: true, rtl });
      const query = mail.slice('mailto:?'.length);
      const parts = Object.fromEntries(query.split('&').map((pair) => pair.split('=').map(decodeURIComponent)));
      assert.equal(parts.subject, subject);
      assert.equal(parts.body, [SHARE_COPY[code].mailIntro, text, rtl ? isolate(shareUrl(url, 'email', true)) : shareUrl(url, 'email', true)].join('\r\n'));
      assert.equal(query.split('&').length, 2, 'exactly subject and body');
      assert.equal(mail.includes('+'), false);
      assert.equal(/[ \n\r]/.test(mail), false, 'nothing raw in the link');
    });
  }

  test('right-to-left pages wrap the address in isolates so it keeps its order; left-to-right pages do not', () => {
    const rtlLink = decodeURIComponent(whatsappUrl('نص', URLS.ar, { utm: false, rtl: true }));
    assert.equal(rtlLink.includes(`${LRI}${URLS.ar}${PDI}`), true);
    const rtlMail = decodeURIComponent(mailtoUrl({ subject: 's', intro: 'i', text: 't', url: URLS.ar, utm: false, rtl: true }));
    assert.equal(rtlMail.includes(`${LRI}${URLS.ar}${PDI}`), true);
    assert.equal(decodeURIComponent(whatsappUrl('t', URLS.hu, { utm: false })).includes(LRI), false);
    assert.equal(isolate('x'), `${LRI}x${PDI}`);
  });

  test('the address is never truncated, whatever the title', () => {
    const text = shareText({ title: 'a '.repeat(500) });
    const link = decodeURIComponent(whatsappUrl(text, URLS.hu, { utm: true }));
    assert.equal(link.endsWith(shareUrl(URLS.hu, 'whatsapp', true)), true);
  });

  test('the words exist for all 28 languages, none empty, and the e-mail line asks nothing odd of the link', () => {
    assert.equal(LOCALES.length, 28);
    assert.deepEqual(Object.keys(SHARE_COPY).sort(), [...LOCALES].sort());
    for (const code of LOCALES) {
      for (const key of ['share', 'facebook', 'whatsapp', 'email', 'copy', 'copied', 'newWindow', 'mailIntro']) {
        const value = SHARE_COPY[code][key];
        assert.equal(typeof value === 'string' && value.trim().length > 0, true, `${code}.${key}`);
        assert.equal(/[<>{}]|undefined|TODO/.test(value), false, `${code}.${key} has stray markup`);
      }
      assert.equal(SHARE_COPY[code].facebook.includes('Facebook') || code === 'ru' || code === 'uk' || code === 'zh' || code === 'ar' || code === 'he' || code === 'el' || code === 'sr', true, `${code}.facebook names the network`);
    }
    assert.deepEqual(Object.keys(EMAIL_LABEL).sort(), [...LOCALES].sort());
    for (const code of LOCALES) assert.equal(EMAIL_LABEL[code].trim().length > 0 && EMAIL_LABEL[code].length < 20, true, `${code} short e-mail label`);
    // Hungarian is the client's wording, to the letter.
    assert.equal(SHARE_COPY.hu.share, 'Megosztás');
    assert.equal(SHARE_COPY.hu.copy, 'Link másolása');
    assert.equal(SHARE_COPY.hu.copied, 'Link kimásolva');
    assert.equal(SHARE_COPY.hu.newWindow, '(új ablakban nyílik meg)');
  });

  const component = fs.readFileSync(`${root}src/components/ShareButtons.astro`, 'utf8');
  const page = fs.readFileSync(`${root}src/components/pages/PropertyDetailPage.astro`, 'utf8');
  const script = fs.readFileSync(`${root}src/scripts/share.ts`, 'utf8');
  const base = fs.readFileSync(`${root}src/layouts/Base.astro`, 'utf8');

  test('no third-party script, SDK, pixel or iframe, and the script makes no network call', () => {
    for (const source of [component, script]) {
      assert.equal(/connect\.facebook|fbq\(|addthis|sharethis|<iframe|<script[^>]+src=|XMLHttpRequest|\bfetch\(|sendBeacon|gtag\(/i.test(source), false);
    }
    assert.equal(script.length < 3000, true, `the script is small (${script.length} bytes)`);
  });

  test('the three links work without JavaScript: plain anchors, new window except mailto, the link button needs the script', () => {
    assert.equal((component.match(/<a class="share-btn"/g) ?? []).length, 3);
    assert.equal((component.match(/target="_blank" rel="noopener noreferrer"/g) ?? []).length, 2);
    assert.equal(/href=\{links\.email\}>/.test(component), true);
    assert.equal(/data-share-copy-button data-share-js/.test(component), true);
    assert.equal(/<noscript><style is:inline>\.share \[data-share-js\]\{display:none\}/.test(component), true);
  });

  test('the row is a labelled group, every icon is hidden from readers, new-window links say so, the toast is polite', () => {
    assert.equal(/role="group"\s+aria-labelledby=\{headingId\}/.test(component), true);
    assert.equal(/<svg[^>]*aria-hidden="true"/.test(component), true);
    assert.equal((component.match(/<svg/g) ?? []).length, (component.match(/<svg[^>]*aria-hidden="true"/g) ?? []).length);
    assert.equal((component.match(/words\.newWindow/g) ?? []).length, 2);
    assert.equal(/role="status" aria-live="polite"/.test(component), true);
    assert.equal(/min-height: 44px;\s+min-width: 44px/.test(component), true);
  });

  test('logical CSS only: no left/right offsets or margins in the share row', () => {
    const css = component.slice(component.indexOf('<style>'));
    assert.equal(/\b(margin|padding)-(left|right)\b|\b(left|right):/.test(css), false);
  });

  test('the script calls the share sheet straight from the click, and treats only AbortError as "closed it"', () => {
    assert.equal(/addEventListener\('click', \(\) => \{\s+navigator\.share\(/.test(script), true, 'no await before navigator.share');
    assert.equal(/!== 'AbortError'/.test(script), true);
    assert.equal(/execCommand\('copy'\)/.test(script), true);
  });

  test('the page offers the row only on a page that is really in the visitor\'s language, with the page\'s own address', () => {
    assert.equal(/\{!standIn && <ShareButtons locale=\{locale\} url=\{abs\(pageUrl\)\}/.test(page), true);
    assert.equal(/ogLocaleAlternates=\{Object\.keys\(alternates\) as Locale\[\]\}/.test(page), true, 'the alternates are the hreflang set');
    assert.equal(/ogImageAlt=\{gallery\[0\]\.alt/.test(page), true);
    // The UTM is added to what is shared only: neither the canonical nor og:url takes a query.
    assert.equal(/utm_/.test(base), false);
    assert.equal(/<meta property="og:url" content=\{canonical\} \/>/.test(base), true);
  });

  test('every language page uses the one detail component (so every language has the row)', () => {
    for (const code of LOCALES) {
      const route = fs.readFileSync(`${root}src/pages/${code}/[slug].astro`, 'utf8');
      assert.equal(route.includes('PropertyDetailPage'), true, code);
    }
  });

  test('the first photo the public sees is the first approved one: a pending photo is never the cover (and so never og:image)', () => {
    const source = fs.readFileSync(`${root}src/lib/properties.ts`, 'utf8');
    assert.equal(/filter\(\(m\) => m\.pending !== true\)\.sort/.test(source), true);
    assert.equal(/const hero = media\.find\(\(m\) => m\.is_hero\) \?\? media\[0\]/.test(source), true);
    // The default share image exists on disk.
    assert.equal(fs.existsSync(`${root}public/og/finddome-default.jpg`), true);
  });


  test('nothing is hidden off-screen with `left`: in a right-to-left page that opens a huge sideways scroll area (the spam-trap fields did)', () => {
    const offenders = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(file);
        else if (/\.(astro|css|ts)$/.test(entry.name) && /(?<![-\w])left:\s*-\d{4,}px/.test(fs.readFileSync(file, 'utf8'))) offenders.push(file.replace(root, ''));
      }
    };
    walk(`${root}src`);
    assert.deepEqual(offenders, []);
  });

  console.log(`\n${passed} tests passed`);
} finally {
  await server.close();
}
