/**
 * Registration to the setup wizard, against a TEST database only.
 *
 * NOT YET RUN: it needs a separate Supabase project or a local Supabase (see
 * .env.test.example), and the owner has not set one up yet. It skips itself
 * unless E2E_ALLOW_WRITES=1 and tests/e2e/support/env.ts has accepted the
 * database as a test one. When it is first run, expect to adjust selectors.
 *
 * Covered here: register (captured email) → set password → lands in the wizard
 * → an expired/used link and a second registration with the same address.
 */
import { test, expect, latestEmail, linkIn } from '../support/fixtures';
import { writesAllowed } from '../support/env';

test.skip(!writesAllowed(), 'needs a test database (E2E_ALLOW_WRITES=1, see .env.test.example)');

const stamp = Date.now();
const email = `e2e-${stamp}@example.com`;

test('a new seller registers, sets a password and reaches the wizard', async ({ page }) => {
  await page.goto('/hu/hirdetes-feladasa/');
  const form = page.locator('#listing-order');
  await form.locator('#listing-order-consent').check();
  await form.locator('#f-name').fill('E2E Teszt');
  await form.locator('#f-email').fill(email);
  await form.locator('#f-phone').fill('06 30 123 4567');
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#listing-order-success')).toBeVisible();

  const mail = await latestEmail(email);
  expect(mail.subject).toContain('jelszav');
  const link = linkIn(mail.html, /\/portal\/invite\//);
  await page.goto(new URL(link).pathname + new URL(link).search);

  await page.locator('#password').fill('E2e-teszt-jelszo-1');
  await page.locator('form.set-password button[type="submit"]').click();
  await expect(page).toHaveURL(/\/portal\/properties\/[^/]+\/setup/);
  await expect(page.locator('[data-step-n]')).toHaveText('1');
});

test('registering again with the same address sends the "you already have an account" email', async ({ page }) => {
  await page.goto('/hu/hirdetes-feladasa/');
  const form = page.locator('#listing-order');
  await form.locator('#listing-order-consent').check();
  await form.locator('#f-name').fill('E2E Teszt');
  await form.locator('#f-email').fill(email);
  await form.locator('#f-phone').fill('06 30 123 4567');
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#listing-order-success')).toBeVisible();
  const mail = await latestEmail(email);
  expect(mail.html).toMatch(/portal\/(login|forgot)/);
});

test('a link that does not exist offers a new one', async ({ page }) => {
  await page.goto('/portal/invite/0000000000000000000000000000000000000000000000000000000000000000?lang=hu');
  await expect(page.locator('#renew-email')).toBeVisible();
});
