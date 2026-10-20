/**
 * Sign-in, registration and the password link pages: language, tabs, the
 * Back button, and what a visitor sees with a link that does not exist.
 */
import { test, expect } from '../support/fixtures';

test('login and registration are two tabs of one panel, in the chosen language', async ({ page }) => {
  await page.goto('/portal/login?lang=nl');
  await expect(page.locator('main h1').first()).toContainText('Welkom terug');
  await page.locator('a[href^="/portal/register"]').first().click();
  await expect(page).toHaveURL(/\/portal\/register\?lang=nl/);
  await expect(page.locator('#f-name')).toBeVisible();
  await expect(page.locator('#f-phone')).toBeVisible();
  const active = page.locator('[aria-current="page"]').first();
  await expect(active).toContainText(/Registreren/i);
  await page.goBack();
  await expect(page).toHaveURL(/\/portal\/login/);
});

test('Hungarian is the default language of the account pages', async ({ page }) => {
  await page.goto('/portal/login');
  await expect(page.locator('main h1').first()).toContainText('Üdvözöljük újra');
  await expect(page.locator('#email')).toHaveAttribute('autocomplete', /username|email/);
});

for (const lang of ['hu', 'nl']) {
  test(`an unknown invite link (${lang}) explains itself and offers a way forward`, async ({ page }) => {
    await page.goto(`/portal/invite/not-a-real-token?lang=${lang}`);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('form input[type="email"], a[href^="/portal/register"]').first()).toBeVisible();
  });
}

test('the reset page with a bad token does not pretend to work', async ({ page }) => {
  const response = await page.goto('/portal/reset/not-a-real-token?lang=hu');
  expect(response?.status()).toBeLessThan(500);
  await expect(page.locator('main h1').first()).toBeVisible();
});
