/**
 * Every public page answers, throws no script errors and never scrolls
 * sideways, in both languages, at the widths the brief names.
 */
import { test, expect, expectNoHorizontalOverflow } from '../support/fixtures';

const PATHS = [
  '/hu/', '/nl/',
  '/hu/hirdetes-feladasa/', '/nl/advertentie-plaatsen/',
  '/hu/kapcsolat/', '/nl/contact/',
  '/hu/kerestetes/', '/nl/zoekdienst/',
  '/hu/ingatlanok/', '/nl/woningen/',
  '/hu/terkep/', '/nl/kaart/',
  '/portal/login?lang=hu', '/portal/login?lang=nl',
  '/portal/register?lang=hu', '/portal/register?lang=nl',
  '/portal/forgot?lang=hu',
  '/portal/invite/not-a-real-token?lang=hu', '/portal/invite/not-a-real-token?lang=nl',
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
  await page.goto('/hu/terkep/');
  await expect(page.locator('canvas.maplibregl-canvas, .maplibregl-map canvas').first()).toBeVisible({ timeout: 20_000 });
  expect(consoleErrors).toEqual([]);
});
