/**
 * The suite's `test`: every page records console errors (asserted where a
 * spec asks), and — unless writes are explicitly allowed against a test
 * database — no form can ever be submitted: every non-GET request from a page
 * to /api/ is intercepted and answered by the test itself.
 */
import { test as base, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { writesAllowed, OUTBOX } from './env';

/** Noise that is not the site's fault (third-party tiles, the dead local database). */
const IGNORED = [/openfreemap|tiles\.|maplibre/i, /Failed to load resource/i, /favicon/i, /ERR_CONNECTION_REFUSED/i];

type Fixtures = { consoleErrors: string[]; blockedPosts: string[] };

export const test = base.extend<Fixtures>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !IGNORED.some((re) => re.test(msg.text()))) errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));
    await use(errors);
  },
  blockedPosts: [
    async ({ page }, use) => {
      const blocked: string[] = [];
      if (!writesAllowed()) {
        await page.route('**/api/**', async (route) => {
          if (route.request().method() === 'GET') return route.continue();
          blocked.push(route.request().url());
          // Answer like a successful endpoint, so the UI's own success path can be checked.
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true }) });
        });
      }
      await use(blocked);
    },
    { auto: true },
  ],
});

export { expect };

/** The page has no sideways scroll at the current viewport. */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
}

/** The newest captured email to `to` (EMAIL_TRANSPORT=capture), waiting for it to arrive. */
export async function latestEmail(to: string, timeoutMs = 15_000): Promise<{ subject: string; html: string; text?: string; from: string }> {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    if (fs.existsSync(OUTBOX)) {
      const files = fs.readdirSync(OUTBOX).filter((f) => f.endsWith('.json')).sort().reverse();
      for (const file of files) {
        const message = JSON.parse(fs.readFileSync(path.join(OUTBOX, file), 'utf8'));
        if (String(message.to).toLowerCase() === to.toLowerCase()) return message;
      }
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`No captured email to ${to}`);
}

/** The first link in an email that matches `pattern`. */
export function linkIn(html: string, pattern: RegExp): string {
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  const link = links.find((href) => pattern.test(href));
  if (!link) throw new Error(`No link matching ${pattern}`);
  return link;
}
