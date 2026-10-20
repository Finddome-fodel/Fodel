/**
 * End-to-end tests (launch round). See .env.test.example for the setup.
 *
 *   npx playwright test                       public, read-only tests (no database)
 *   E2E_ALLOW_WRITES=1 npx playwright test    + the seller/admin lifecycle, against
 *                                             a local or "fodel-test" Supabase only
 *
 * Projects: the three engines on desktop, and an iPhone 15 and a Pixel 7.
 * WebKit is the one that matters most here: FODEL's buyers and sellers are on
 * iPhones and Macs.
 */
import { defineConfig, devices } from '@playwright/test';
import { loadTestEnv, serverEnv, writesAllowed } from './tests/e2e/support/env';

loadTestEnv();
const PORT = Number(process.env.E2E_PORT ?? 4400);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  globalSetup: './tests/e2e/support/global-setup.ts',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        // Without a test database the site talks to an empty, read-only stand-in.
        ...(writesAllowed()
          ? []
          : [{ command: 'node tests/e2e/support/empty-database.mjs 54399', url: 'http://127.0.0.1:54399/health', reuseExistingServer: true, timeout: 20_000 }]),
        {
          command: `npx astro dev --port ${PORT}`,
          url: `${baseURL}/hu/rolunk/`,
          reuseExistingServer: true,
          timeout: 300_000,
          env: serverEnv(),
        },
      ],
});
