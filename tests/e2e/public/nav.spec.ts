/**
 * The header: "Belépés / Regisztráció" and the eye-catching "Hirdetés feladása"
 * button, and that nothing collides between the widths where the full desktop
 * bar is shown.
 */
import { test, expect } from '../support/fixtures';

test('the header offers the account links and the listing button', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'the desktop bar; the mobile drawer is covered in language.spec.ts');
  await page.goto('/hu/');
  const account = page.locator('.nav-account:visible').first();
  await expect(account).toHaveAttribute('href', /\/portal\/(login|register)/);
  await expect(account).toHaveAttribute('aria-label', /Belépés/);
  const cta = page.locator('.nav-cta a:visible').first();
  await expect(cta).toHaveAttribute('href', '/hu/hirdetes-feladasa/');
  await expect(cta).toContainText('Hirdetés feladása');
});

test('Dutch header says Inloggen / Registreren', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'desktop bar');
  await page.goto('/nl/');
  await expect(page.locator('.nav-account:visible').first()).toHaveAttribute('aria-label', /Inloggen/);
  await expect(page.locator('.nav-cta a:visible').first()).toHaveAttribute('href', '/nl/advertentie-plaatsen/');
});

for (const lang of ['hu', 'nl'] as const) {
  for (const width of [1081, 1210, 1280, 1366, 1440, 1920]) {
    test(`${lang} header at ${width}px: links, account, button and switcher do not overlap`, async ({ page, isMobile }) => {
      test.skip(!!isMobile, 'desktop bar');
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${lang}/`);
      const boxes = await page.evaluate(() => {
        const pick = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel)).filter((e) => e.offsetParent !== null);
        const rect = (e: Element) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
        const nav = pick('.nav-link').map(rect);
        const others = [...pick('.nav-account'), ...pick('.nav-cta'), ...pick('.switcher')].map(rect);
        const last = nav.reduce((m, r) => Math.max(m, r.r), 0);
        const first = others.reduce((m, r) => Math.min(m, r.l), Infinity);
        return { last, first, scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      expect(boxes.last, 'last link ends before the account/CTA group starts').toBeLessThanOrEqual(boxes.first + 0.5);
      expect(boxes.scroll).toBeLessThanOrEqual(0);
    });
  }
}
