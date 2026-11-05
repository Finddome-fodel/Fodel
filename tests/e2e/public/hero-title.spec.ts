/**
 * A listing whose title is a whole sentence: the photograph holds it (smaller, three lines at most, never climbing out
 * of the picture over the breadcrumb), the breadcrumb stays on one line, and the full title is still the heading below.
 * Runs with the one-listing stand-in and its long title: FX_LONG_TITLE=1 on the stand-in, E2E_LISTING_FIXTURE=1.
 */
import { test, expect, type Page } from '@playwright/test';

test.skip(process.env.E2E_LISTING_FIXTURE !== '1' || process.env.FX_LONG_TITLE !== '1', 'Needs the one-listing stand-in with FX_LONG_TITLE=1');

const PAGES = [
  { path: '/hu/farm-elado-1234/', rtl: false },
  { path: '/en/farm-for-sale-1234/', rtl: false },
  { path: '/ar/farm-for-sale-1234/', rtl: true },
];
const WIDTHS = [1440, 1210, 1024, 820, 390];

async function geometry(page: Page) {
  return page.evaluate(() => {
    const box = (selector: string) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height, width: r.width };
    };
    const name = document.querySelector<HTMLElement>('.hero-name');
    const crumb = document.querySelector<HTMLElement>('.crumb-here');
    return {
      hero: box('.property-detail-hero'),
      crumbs: box('.crumbs'),
      name: name ? { ...box('.hero-name')!, display: getComputedStyle(name).display, lineHeight: parseFloat(getComputedStyle(name).lineHeight), fontSize: parseFloat(getComputedStyle(name).fontSize), fit: name.dataset.fit } : null,
      kicker: box('.hero-kicker'),
      crumbOverflowing: crumb ? crumb.scrollWidth > crumb.clientWidth : false,
      crumbLineHeight: crumb ? parseFloat(getComputedStyle(crumb).lineHeight) : 0,
      pageScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelector('h1')?.textContent?.trim() ?? '',
    };
  });
}

for (const { path, rtl } of PAGES) {
  for (const width of WIDTHS) {
    test(`${path} at ${width}px: the title stays inside the photograph, below the breadcrumb`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 1000 ? 900 : 800 });
      await page.goto(path);
      await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
      const g = await geometry(page);
      expect(g.hero).not.toBeNull();
      // The whole title is the heading under the picture: nothing is cut from what a person reads.
      expect(g.h1.length).toBeGreaterThan(90);
      expect(g.pageScroll).toBeLessThanOrEqual(0);
      // The breadcrumb is one pill: a single line high (with its padding), whatever the title length.
      expect(g.crumbs!.height).toBeLessThan(g.crumbLineHeight + 24);
      expect(g.crumbs!.right).toBeLessThanOrEqual(g.hero!.right + 1);
      expect(g.crumbs!.left).toBeGreaterThanOrEqual(g.hero!.left - 1);
      if (g.name && g.name.display !== 'none') {
        // Inside the photograph, never above its top edge, and not under the breadcrumb.
        expect(g.name.top).toBeGreaterThanOrEqual(g.hero!.top);
        expect(g.name.bottom).toBeLessThanOrEqual(g.hero!.bottom);
        expect(g.kicker!.top).toBeGreaterThanOrEqual(g.crumbs!.bottom + 8);
        // At most three lines, and long titles are set smaller than the 88px of a short one.
        expect(g.name.height).toBeLessThanOrEqual(3 * g.name.lineHeight + 0.2 * g.name.fontSize);
        expect(['l', 'xl']).toContain(g.name.fit);
        const size = await page.locator('.hero-name').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
        expect(size).toBeLessThanOrEqual(44);
        if (rtl) expect(g.name.right).toBeLessThanOrEqual(g.hero!.right + 1);
      }
    });
  }
}
