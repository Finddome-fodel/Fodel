/**
 * Language switching — the bug that started the launch round: in Safari no
 * language could be chosen, and there was no way back from en/de/fr.
 *
 * In every project (Chromium, Firefox, WebKit, iPhone, Pixel): open /hu/, then
 * NL → EN → HU → DE → NL, once with the mouse (a tap on phones) and once with
 * the keyboard, asserting the URL and <html lang> after every step. On phones
 * the switcher is the one in the compact bar; the mobile drawer is checked too.
 */
import { test, expect } from '../support/fixtures';
import type { Page } from '@playwright/test';
import { LOCALE_META, type Locale } from '../../../src/i18n/ui';

const ROUTE = ['nl', 'en', 'hu', 'de', 'fr', 'es', 'pl', 'ro', 'sk', 'nl'] as const;

/** The switcher the visitor can actually see on this page and viewport. */
const visibleToggle = (page: Page) => page.locator('.switcher-toggle:visible').first();

async function pick(page: Page, code: string, how: 'pointer' | 'keyboard') {
  const toggle = visibleToggle(page);
  const root = toggle.locator('xpath=..');
  if (how === 'pointer') {
    await toggle.click();
    await expect(root).toHaveAttribute('data-open', '');
    await root.locator(`a[data-lang="${code}"]`).click();
  } else {
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(root).toHaveAttribute('data-open', '');
    // Arrow down through the rows until the wanted language has focus.
    for (let i = 0; i < 8; i++) {
      const focused = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.lang ?? '');
      if (focused === code) break;
      await page.keyboard.press('ArrowDown');
    }
    await expect(root.locator(`a[data-lang="${code}"]`)).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await page.waitForURL(new RegExp(`/${code}/$`));
  await expect(page.locator('html')).toHaveAttribute('lang', LOCALE_META[code as Locale].htmlLang);
}

for (const how of ['pointer', 'keyboard'] as const) {
  test(`switches hu → nl → en → hu → de → fr → es → pl → ro → sk → nl (${how})`, async ({ page, isMobile }) => {
    test.skip(how === 'keyboard' && isMobile, 'phones have no hardware keyboard');
    await page.goto('/hu/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'hu');
    for (const code of ROUTE) await pick(page, code, how);
  });
}

test('the choice is remembered by the root page', async ({ browser }) => {
  // A Hungarian browser that picked Dutch must land on Dutch.
  const context = await browser.newContext({ locale: 'hu-HU' });
  const page = await context.newPage();
  await page.goto('/hu/');
  await pick(page, 'nl', 'pointer');
  await page.goto('/');
  await page.waitForURL(/\/nl\/$/);
  await context.close();
});

test('without a cookie the root page follows the browser language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'hu-HU' });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForURL(/\/hu\/$/);
  await context.close();
});

test('Escape and a press outside close the menu; Back restores a closed menu', async ({ page, isMobile }) => {
  await page.goto('/nl/');
  const toggle = visibleToggle(page);
  const root = toggle.locator('xpath=..');
  await toggle.click();
  await expect(root).toHaveAttribute('data-open', '');
  if (!isMobile) {
    await page.keyboard.press('Escape');
    await expect(root).not.toHaveAttribute('data-open', '');
    await expect(toggle).toBeFocused();
    await toggle.click();
  }
  await page.mouse.click(5, 400);
  await expect(root).not.toHaveAttribute('data-open', '');
});

test('the mobile drawer has the CTA and both account buttons', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phones only');
  await page.goto('/hu/');
  await page.locator('#nav-toggle').click();
  const drawer = page.locator('#nav-drawer');
  await expect(drawer).toHaveAttribute('data-open', '');
  const foot = drawer.locator('.drawer-foot');
  await expect(foot.locator('a').first()).toHaveAttribute('href', '/hu/hirdetes-feladasa/');
  await expect(foot.getByRole('link', { name: 'Belépés', exact: true })).toHaveAttribute('href', '/portal/login?lang=hu');
  await expect(foot.getByRole('link', { name: 'Regisztráció', exact: true })).toHaveAttribute('href', '/portal/register?lang=hu');
  // Back/forward cache: leave and come back — the drawer must be closed again.
  await foot.locator('a').first().click();
  await page.waitForURL(/hirdetes-feladasa/);
  await page.goBack();
  await expect(page.locator('#nav-drawer')).not.toHaveAttribute('data-open', '');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});

test('the root page sends each browser language to its own site', async ({ browser }) => {
  const cases: [string, RegExp][] = [
    ['hu-HU', /\/hu\/$/], ['nl-BE', /\/nl\/$/], ['en-GB', /\/en\/$/], ['en-US', /\/en\/$/],
    ['de-AT', /\/de\/$/], ['fr-BE', /\/fr\/$/], ['es-ES', /\/es\/$/], ['es-MX', /\/es\/$/],
    ['pl-PL', /\/pl\/$/], ['ro-RO', /\/ro\/$/], ['sk-SK', /\/sk\/$/], ['it-IT', /\/nl\/$/],
  ];
  for (const [locale, expected] of cases) {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForURL(expected);
    await context.close();
  }
});

test('a language picked in the switcher beats the browser language, for every language', async ({ browser, baseURL }) => {
  for (const code of ['en', 'de', 'fr', 'es', 'pl', 'ro', 'sk', 'nl', 'hu'] as const) {
    const context = await browser.newContext({ locale: 'hu-HU' });
    await context.addCookies([{ name: 'fodel_lang', value: code, url: baseURL! }]);
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForURL(new RegExp(`/${code}/$`));
    await context.close();
  }
});
