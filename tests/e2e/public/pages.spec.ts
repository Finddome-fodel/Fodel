/**
 * Every public page answers, throws no script errors and never scrolls
 * sideways, in all five languages, at the widths the brief names.
 */
import { test, expect, expectNoHorizontalOverflow } from '../support/fixtures';
import { LOCALES, path as routePath, type RouteKey } from '../../../src/i18n/ui';

const KEYS: RouteKey[] = [
  'home', 'submitAd', 'contact', 'searchRequest', 'properties', 'map', 'priceList', 'sellers', 'buyers',
  'about', 'faq', 'valuation', 'services', 'sold', 'blog', 'photoGuide', 'privacy', 'terms',
];
const PATHS = [
  ...LOCALES.flatMap((l) => KEYS.map((key) => routePath(l, key))),
  ...LOCALES.flatMap((l) => [
    `/portal/login?lang=${l}`, `/portal/register?lang=${l}`, `/portal/forgot?lang=${l}`,
    `/portal/invite/not-a-real-token?lang=${l}`,
  ]),
];
const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

for (const path of PATHS) {
  test(`${path}: loads, no script errors, no sideways scroll`, async ({ page, consoleErrors }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(path);
      expect(response?.status(), `${path} @${width}`).toBeLessThan(400);
      await page.waitForLoadState('networkidle').catch(() => {});
      await expectNoHorizontalOverflow(page);
    }
    expect(consoleErrors).toEqual([]);
  });
}

test('the map starts in Safari too (a WebGL canvas appears, no script errors)', async ({ page, consoleErrors }) => {
  await page.goto(routePath('en', 'map'));
  await expect(page.locator('canvas.maplibregl-canvas, .maplibregl-map canvas').first()).toBeVisible({ timeout: 20_000 });
  expect(consoleErrors).toEqual([]);
});
