/**
 * The public forms, checked in the browser without ever reaching a database:
 * validation (summary, focus, messages by country), the international phone
 * field, and the registration form's "check your mailbox" panel. The fixtures
 * answer every POST to /api/ themselves, so nothing is ever submitted.
 */
import { test, expect } from '../support/fixtures';
import type { Page } from '@playwright/test';

import { LOCALES, path as routePath, type Locale } from '../../../src/i18n/ui';

const REGISTER = { hu: '/hu/hirdetes-feladasa/', nl: '/nl/advertentie-plaatsen/' };

/** The phone field's starting country and the example it shows, per language. */
const PHONE: Record<Locale, { country: string; prefix: string }> = {
  hu: { country: 'HU', prefix: '+36' }, nl: { country: 'NL', prefix: '+31' }, en: { country: 'GB', prefix: '+44' },
  de: { country: 'DE', prefix: '+49' }, fr: { country: 'FR', prefix: '+33' }, es: { country: 'ES', prefix: '+34' },
  pl: { country: 'PL', prefix: '+48' }, ro: { country: 'RO', prefix: '+40' }, sk: { country: 'SK', prefix: '+421' },
};

const form = (page: Page) => page.locator('#listing-order');

async function fillRegister(page: Page, o: { name?: string; email?: string; phone?: string; consent?: boolean }) {
  const f = form(page);
  // Consent first: an error that appears when the phone field loses focus moves the page under the pointer.
  if (o.consent) await f.locator('#listing-order-consent').check();
  if (o.name !== undefined) await f.locator('#f-name').fill(o.name);
  if (o.email !== undefined) await f.locator('#f-email').fill(o.email);
  if (o.phone !== undefined) await f.locator('#f-phone').fill(o.phone);
}

test.describe('registration form', () => {
  test('an empty submit shows the summary, focuses the first problem and sends nothing', async ({ page, blockedPosts }) => {
    await page.goto(REGISTER.hu);
    await form(page).locator('button[type="submit"]').click();
    const summary = page.locator('#listing-order-summary');
    await expect(summary).toBeVisible();
    await expect(summary.locator('li')).not.toHaveCount(0);
    await expect(form(page).locator('#f-name')).toBeFocused();
    await expect(form(page).locator('#f-name')).toHaveAttribute('aria-invalid', 'true');
    expect(blockedPosts).toHaveLength(0);
  });

  test('an e-mail error appears on blur and clears when fixed', async ({ page }) => {
    await page.goto(REGISTER.hu);
    const email = form(page).locator('#f-email');
    await email.fill('nem-email');
    await email.blur();
    await expect(form(page).locator('#f-email-error')).toBeVisible();
    await email.fill('nev@example.com');
    await expect(form(page).locator('#f-email-error')).toBeHidden();
  });

  test('a Dutch number is judged as Dutch, in the visitor\'s language', async ({ page, blockedPosts }) => {
    await page.goto(REGISTER.nl);
    await fillRegister(page, { name: 'Jan de Vries', email: 'jan@example.nl', phone: '123', consent: true });
    await form(page).locator('button[type="submit"]').click();
    const error = form(page).locator('#f-phone-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('+31');
    await expect(form(page).locator('#f-phone')).toBeFocused();
    expect(blockedPosts).toHaveLength(0);
  });

  test('a Hungarian number is rejected with a Hungarian example', async ({ page }) => {
    await page.goto(REGISTER.hu);
    await fillRegister(page, { name: 'Kiss Anna', email: 'anna@example.hu', phone: '12', consent: true });
    await form(page).locator('button[type="submit"]').click();
    await expect(form(page).locator('#f-phone-error')).toContainText('+36');
  });

  test('a valid registration shows the mailbox panel, a resend countdown and a way back', async ({ page }) => {
    await page.goto(REGISTER.hu);
    await fillRegister(page, { name: 'Kiss Anna', email: 'anna@example.hu', phone: '06 30 123 4567', consent: true });
    const request = page.waitForRequest((r) => r.url().includes('/api/listing-order') && r.method() === 'POST');
    await form(page).locator('button[type="submit"]').click();
    const body = (await request).postData() ?? '';
    // Multipart or urlencoded, the country picked beside the number travels with it.
    expect(body).toContain('phoneCountry');
    const panel = page.locator('#listing-order-success');
    await expect(panel).toBeVisible();
    await expect(panel.locator('[data-sent-to]')).toHaveText('anna@example.hu');
    const resend = panel.locator('[data-resend]');
    await expect(resend).toBeDisabled();
    await expect(resend).toContainText(/\d/);
    await panel.locator('[data-change]').click();
    await expect(form(page)).toBeVisible();
    await expect(form(page).locator('#f-name')).toHaveValue('Kiss Anna');
    await expect(form(page).locator('#f-email')).toHaveValue('anna@example.hu');
  });
});

test.describe('international phone field', () => {
  test('defaults follow the page and the hint shows an example', async ({ page }) => {
    await page.goto(REGISTER.nl);
    await expect(form(page).locator('select[name="phoneCountry"]')).toHaveValue('NL');
    await expect(form(page).locator('#f-phone-hint')).toContainText('+31');
    await page.goto(REGISTER.hu);
    await expect(form(page).locator('select[name="phoneCountry"]')).toHaveValue('HU');
  });

  test('typing a +prefix moves the picker, and the number is formatted', async ({ page }) => {
    await page.goto(REGISTER.hu);
    const phone = form(page).locator('#f-phone');
    await phone.click();
    await phone.pressSequentially('+31612345678');
    await expect(form(page).locator('select[name="phoneCountry"]')).toHaveValue('NL');
    await expect(phone).toHaveValue(/^\+31 6 ?1234 ?5678$|^\+31 6 12345678$/);
  });

  test('the country list opens, filters and picks', async ({ page }) => {
    await page.goto(REGISTER.hu);
    await form(page).locator('.pf-trigger').click();
    const search = page.locator('.pf-search');
    await expect(search).toBeVisible();
    await search.fill('Hollandia');
    await page.keyboard.press('Enter');
    await expect(form(page).locator('select[name="phoneCountry"]')).toHaveValue('NL');
  });
});

test.describe('other forms', () => {
  test('the contact form validates e-mail and phone before anything is sent', async ({ page, blockedPosts }) => {
    await page.goto('/hu/kapcsolat/');
    const contact = page.locator('form.form').first();
    await contact.locator('#f-name').fill('Kiss Anna');
    await contact.locator('#f-email').fill('rossz');
    await contact.locator('#f-phone').fill('1');
    await contact.locator('button[type="submit"]').click();
    await expect(contact.locator('#f-email-error')).toBeVisible();
    await expect(contact.locator('#f-phone-error')).toBeVisible();
    expect(blockedPosts).toHaveLength(0);
  });

  test('the search request accepts a price written with dots', async ({ page }) => {
    await page.goto('/hu/kerestetes/');
    const f = page.locator('form.form').first();
    const budget = f.locator('#f-budgetMin');
    await budget.fill('250.000');
    await budget.blur();
    await expect(f.locator('#f-budgetMin-error')).toBeHidden();
    await budget.fill('sok');
    await budget.blur();
    await expect(f.locator('#f-budgetMin-error')).toBeVisible();
  });
});

test.describe('forms in every language', () => {
  for (const locale of LOCALES) {
    test(`${locale}: the registration form speaks ${locale}, starts on its country and judges a short number`, async ({ page, blockedPosts }) => {
      await page.goto(routePath(locale, 'submitAd'));
      await expect(form(page).locator('select[name="phoneCountry"]')).toHaveValue(PHONE[locale].country);
      await expect(form(page).locator('#f-phone-hint')).toContainText(PHONE[locale].prefix);

      // An empty submit: a summary in the page's language, nothing sent.
      await form(page).locator('button[type="submit"]').click();
      const summary = page.locator('#listing-order-summary');
      await expect(summary).toBeVisible();
      const emptyText = (await summary.innerText()).trim();
      expect(emptyText.length).toBeGreaterThan(10);

      await fillRegister(page, { name: 'Test Person', email: 'test@example.com', phone: '12', consent: true });
      await form(page).locator('button[type="submit"]').click();
      const error = form(page).locator('#f-phone-error');
      await expect(error).toBeVisible();
      await expect(error).toContainText(PHONE[locale].prefix);
      expect(blockedPosts).toHaveLength(0);
    });
  }

  test('the same mistake reads differently in each language', async ({ browser, baseURL }) => {
    const seen = new Map<string, string>();
    for (const locale of LOCALES) {
      const context = await browser.newContext({ baseURL: baseURL! });
      const page = await context.newPage();
      await page.goto(routePath(locale, 'contact'));
      const contact = page.locator('form.form').first();
      await contact.locator('#f-email').fill('not-an-email');
      await contact.locator('#f-email').blur();
      await expect(contact.locator('#f-email-error')).toBeVisible();
      const message = (await contact.locator('#f-email-error').innerText()).trim();
      expect(message.length).toBeGreaterThan(5);
      expect(seen.has(message), `"${message}" repeats in ${locale}`).toBe(false);
      seen.set(message, locale);
      await context.close();
    }
  });
});
