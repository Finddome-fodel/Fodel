/**
 * Sharing a listing (master §10b), on a real listing page served by the one-listing stand-in
 * (tests/e2e/support/public-listing-database.mjs). Run with `npm run test:e2e:listing`; without the stand-in the
 * specs skip themselves, because the empty test database has no listing page to share.
 *
 * The listing has a pending photo FIRST in order, a World package, and texts in hu, en, de, ar and he (no Dutch).
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, expectNoHorizontalOverflow } from '../support/fixtures';
import { listingFixture } from '../support/env';
import { ROUTES } from '../../../src/i18n/ui';

test.skip(!listingFixture(), 'needs E2E_LISTING_FIXTURE=1 (a published listing)');

// The site's addresses end in a slash (trailingSlash: 'always').
const slug = (locale: keyof typeof ROUTES) => `/${locale}/${ROUTES[locale].detail('farm', '1234')}/`;
const HU = slug('hu');
// The price as the page writes it: a euro sign, a no-break space, thousands with no-break spaces.
const PRICE = '€\u00a0225\u00a0000';
const EN = slug('en');
const AR = slug('ar');
const NL = slug('nl');

const metaContent = (html: string, attr: 'property' | 'name', key: string): string[] =>
  [...html.matchAll(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`, 'g'))].map((m) => m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"'));

test.describe('the share row', () => {
  test('four buttons with the right links, named for readers, in a labelled group', async ({ page }, info) => {
    test.skip(info.project.name.startsWith('mobile'), 'the desktop row');
    await page.goto(HU);
    const group = page.getByRole('group', { name: 'Megosztás' });
    await expect(group).toBeVisible();
    const origin = new URL(page.url()).origin;

    const facebook = group.getByRole('link', { name: /Megosztás Facebookon \(új ablakban nyílik meg\)/ });
    const whatsapp = group.getByRole('link', { name: /Megosztás WhatsAppon \(új ablakban nyílik meg\)/ });
    const email = group.getByRole('link', { name: 'Megosztás e-mailben' });
    const copy = group.getByRole('button', { name: 'Link másolása' });
    for (const control of [facebook, whatsapp, email, copy]) await expect(control).toBeVisible();

    // The shared address is the page the visitor is on (the site's canonical address), with the UTM tail.
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe(`https://finddome.com${HU}`);
    const sharing = (channel: string) => `${canonical}?utm_source=${channel}&utm_medium=share&utm_campaign=listing`;

    expect(await facebook.getAttribute('href')).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharing('facebook'))}`);
    expect(await facebook.getAttribute('target')).toBe('_blank');
    expect(await facebook.getAttribute('rel')).toBe('noopener noreferrer');

    const wa = new URL((await whatsapp.getAttribute('href'))!);
    expect(wa.origin + wa.pathname).toBe('https://wa.me/');
    expect(wa.searchParams.get('text')).toBe(`Birtok a Balaton-felvidék csendjében – ${PRICE} – FINDDOME ${sharing('whatsapp')}`);
    expect(await whatsapp.getAttribute('rel')).toBe('noopener noreferrer');

    const mail = (await email.getAttribute('href'))!;
    expect(mail.startsWith('mailto:?subject=')).toBe(true);
    expect(mail).not.toContain('+');
    expect(mail).toContain('%0D%0A');
    expect(await email.getAttribute('target')).toBeNull();
    expect(origin).toBeTruthy();
  });

  test('copy link writes the address and says so, politely, for two seconds', async ({ page, context, browserName }, info) => {
    test.skip(info.project.name.startsWith('mobile') || browserName === 'firefox', 'clipboard permissions are Chromium and WebKit');
    if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(HU);
    const group = page.getByRole('group', { name: 'Megosztás' });
    const toast = group.getByRole('status');
    await expect(toast).toBeEmpty();
    await group.getByRole('button', { name: 'Link másolása' }).click();
    await expect(toast).toHaveText('Link kimásolva');
    if (browserName === 'chromium') {
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`https://finddome.com${HU}?utm_source=copy&utm_medium=share&utm_campaign=listing`);
    }
    await expect(toast).toBeEmpty({ timeout: 5000 });
  });

  test('without JavaScript the three links work and nothing dead is shown', async ({ browser }, info) => {
    test.skip(info.project.name.startsWith('mobile'), 'the desktop row');
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(HU);
    const group = page.getByRole('group', { name: 'Megosztás' });
    await expect(group.getByRole('link')).toHaveCount(3);
    await expect(group.getByRole('button')).toHaveCount(0);
    for (const link of await group.getByRole('link').all()) await expect(link).toBeVisible();
    await context.close();
  });

  test('the keyboard reaches every button in order, each with a visible ring and a 44 px target', async ({ page }, info) => {
    test.skip(info.project.name.startsWith('mobile') || info.project.name === 'webkit', 'Tab skips links in desktop Safari by default');
    await page.goto(HU);
    const group = page.getByRole('group', { name: 'Megosztás' });
    await group.getByRole('link').first().focus();
    const names: string[] = [];
    for (let i = 0; i < 4; i++) {
      const focused = page.locator(':focus');
      names.push(((await focused.getAttribute('aria-label')) ?? (await focused.innerText())).trim().split('\n')[0]);
      const box = await focused.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(await focused.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
      await page.keyboard.press('Tab');
    }
    expect(names[0]).toMatch(/Facebook/);
    expect(names[1]).toMatch(/WhatsApp/);
    expect(names[2]).toMatch(/E-mail/i);
    expect(names[3]).toBe('Link másolása');
  });

  test('a language the listing is not published in goes to English, and the English page shares its own address', async ({ page }) => {
    const response = await page.goto(NL);
    expect(new URL(page.url()).pathname).toBe(EN);
    expect(response!.status()).toBe(200);
    const facebook = await page.locator('a[href^="https://www.facebook.com/sharer"]').getAttribute('href');
    expect(decodeURIComponent(facebook!)).toContain(`https://finddome.com${EN}?utm_source=facebook`);
    expect(decodeURIComponent(facebook!)).not.toContain('/nl/');
  });
});

test.describe('the share row on a phone', () => {
  test.beforeEach(({}, info) => test.skip(!info.project.name.startsWith('mobile'), 'phones only'));

  test('one Share button opens the phone sheet with {title, text, url}; closing the sheet is not an error', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__shared = [];
      navigator.share = (data) => {
        (window as any).__shared.push(data);
        return Promise.reject(new DOMException('closed', 'AbortError'));
      };
    });
    await page.goto(HU);
    const group = page.getByRole('group', { name: 'Megosztás' });
    const native = group.getByRole('button', { name: 'Megosztás' });
    await expect(native).toBeVisible();
    await expect(group.locator('a')).toHaveCount(3);
    await expect(group.locator('a[href^="https://www.facebook.com/sharer"]')).toBeHidden();
    await native.click();
    const shared = await page.evaluate(() => (window as any).__shared);
    expect(shared).toEqual([
      {
        title: 'Birtok a Balaton-felvidék csendjében',
        text: `Birtok a Balaton-felvidék csendjében – ${PRICE} – FINDDOME`,
        url: `https://finddome.com${HU}?utm_source=native&utm_medium=share&utm_campaign=listing`,
      },
    ]);
    // Closed on purpose: the one button stays.
    await expect(native).toBeVisible();
    await expect(group.getByRole('link', { name: /Facebook/ })).toBeHidden();
  });

  test('if the sheet refuses (anything but AbortError), the buttons appear in its place', async ({ page }) => {
    await page.addInitScript(() => {
      navigator.share = () => Promise.reject(new DOMException('no', 'NotAllowedError'));
    });
    await page.goto(HU);
    const group = page.getByRole('group', { name: 'Megosztás' });
    await group.getByRole('button', { name: 'Megosztás' }).click();
    await expect(group.getByRole('link', { name: /Facebook/ })).toBeVisible();
    await expect(group.getByRole('link', { name: /WhatsApp/ })).toBeVisible();
    await expect(group.getByRole('link', { name: 'Megosztás e-mailben' })).toBeVisible();
  });

  test('with no share sheet at all, the icon buttons are shown at 44 px, and the row keeps its height', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    });
    await page.goto(HU);
    const group = page.getByRole('group', { name: 'Megosztás' });
    await expect(group.getByRole('link', { name: /Facebook/ })).toBeVisible();
    const before = (await group.boundingBox())!.height;
    for (const control of await group.locator('.share-btn:visible').all()) {
      const box = (await control.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.waitForTimeout(300);
    expect((await group.boundingBox())!.height).toBe(before);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('right-to-left', () => {
  test('/ar: the row follows the page direction, nothing scrolls sideways, and an accessibility scan is clean', async ({ page }) => {
    await page.goto(AR);
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
    const group = page.getByRole('group', { name: 'مشاركة' });
    await expect(group).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // First in reading order is on the right: the label sits to the right of the first button.
    const label = (await group.locator('.share-label').boundingBox())!;
    const first = (await group.locator('.share-btn:visible').first().boundingBox())!;
    expect(label.x).toBeGreaterThan(first.x);

    // The address stays in one piece inside right-to-left text.
    const whatsapp = new URL((await group.locator('a[href^="https://wa.me/"]').getAttribute('href'))!);
    expect(whatsapp.searchParams.get('text')).toContain('⁦https://finddome.com' + AR);

    const results = await new AxeBuilder({ page }).include('[data-share]').analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test('/he renders the row too', async ({ page }) => {
    await page.goto(slug('he'));
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
    await expect(page.getByRole('group', { name: 'שיתוף' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('the tags a share preview reads', () => {
  for (const [locale, path, ogLocale, alternates] of [
    ['hu', HU, 'hu_HU', ['en_GB', 'de_DE', 'he_IL', 'ar_AR']],
    ['en', EN, 'en_GB', ['hu_HU', 'de_DE', 'he_IL', 'ar_AR']],
    ['ar', AR, 'ar_AR', ['hu_HU', 'en_GB', 'de_DE', 'he_IL']],
  ] as const) {
    test(`${locale}: one image (1200×630, absolute), the canonical address, the right locale and only the published alternates`, async ({ request }) => {
      const html = await (await request.get(path, { headers: { 'user-agent': 'facebookexternalhit/1.1' } })).text();
      const one = (attr: 'property' | 'name', key: string) => {
        const found = metaContent(html, attr, key);
        expect(found, `${key} appears once`).toHaveLength(1);
        return found[0];
      };
      const image = one('property', 'og:image');
      expect(image).toMatch(/^https:\/\//);
      expect(one('property', 'og:image:width')).toBe('1200');
      expect(one('property', 'og:image:height')).toBe('630');
      expect(one('name', 'twitter:image')).toBe(image);
      // The first photo in the data is still waiting for review: the cover is the first approved one.
      expect(image).toContain('tanya');
      expect(image).not.toContain('hero');
      expect(one('property', 'og:image:alt')).not.toMatch(/PENDING|NEM JÓVÁHAGYOTT/);
      expect(one('name', 'twitter:image:alt')).toBe(one('property', 'og:image:alt'));

      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];
      expect(canonical).toBe(`https://finddome.com${path}`);
      expect(one('property', 'og:url')).toBe(canonical);
      expect(canonical).not.toContain('utm_');
      expect(one('property', 'og:locale')).toBe(ogLocale);
      expect([...metaContent(html, 'property', 'og:locale:alternate')].sort()).toEqual([...alternates].sort());
      expect(one('name', 'twitter:card')).toBe('summary_large_image');
      expect(one('property', 'og:description').length).toBeLessThanOrEqual(200);
      expect(one('property', 'og:description')).toMatch(/225/);
    });
  }

  test('no third-party script is loaded by the listing page', async ({ page }) => {
    const hosts = new Set<string>();
    page.on('request', (request) => {
      if (request.resourceType() === 'script') hosts.add(new URL(request.url()).host);
    });
    await page.goto(HU);
    const own = new URL(page.url()).host;
    expect([...hosts].filter((host) => host !== own)).toEqual([]);
  });
});
