/**
 * The three-dot menu on Felhasználók opens next to its button, however the row around it moves. A row that lifts on
 * hover (a transform) once became the reference point of the fixed popover, which then opened off the screen.
 * Runs against the isolated local fixture only (see listing.spec.ts).
 */
import { test, expect } from '@playwright/test';

const fixture = 'http://127.0.0.1:54401';
const ADMIN = '00000000-0000-4000-8000-000000000002';

test.describe('Felhasználók: the actions menu', () => {
  test.skip(process.env.E2E_EDITOR_FIXTURE !== '1', 'Requires the isolated local editor fixture');

  test.beforeEach(async ({ page, baseURL }) => {
    expect(new URL(baseURL!).hostname).toBe('127.0.0.1');
    expect((await (await page.request.get(`${fixture}/health`)).json()).fixture).toBe('fodel-editor-local');
    const now = Math.floor(Date.now() / 1000);
    const part = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
    const user = { id: ADMIN, email: 'admin@fodel-test.local', role: 'authenticated', aud: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString() };
    const session = {
      access_token: `${part({ alg: 'HS256', typ: 'JWT' })}.${part({ sub: ADMIN, email: user.email, aud: 'authenticated', role: 'authenticated', iat: now, exp: now + 86400 })}.test-fixture-signature`,
      refresh_token: 'local-test-fixture', token_type: 'bearer', expires_in: 86400, expires_at: now + 86400, user,
    };
    await page.context().clearCookies();
    await page.context().addCookies([{ name: 'sb-127-auth-token', value: 'base64-' + part(session), url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
  });

  test('the menu opens right under its button, inside the screen, and offers both actions', async ({ page }) => {
    await page.goto('/portal/users');
    const button = page.getByRole('button', { name: /Műveletek: Teszt Eladó/ });
    // Hovering is what lifts the row; it is always the case when somebody clicks.
    await button.hover();
    await button.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem')).toHaveText([/Kinevezés adminná/, /Fiók letiltása/]);

    // Measure once the popover has finished its short fade-in (it starts a hair smaller).
    await menu.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
    const at = (await button.boundingBox())!;
    const pop = (await menu.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(pop.x).toBeGreaterThanOrEqual(0);
    expect(pop.x + pop.width).toBeLessThanOrEqual(viewport.width);
    expect(pop.y).toBeGreaterThanOrEqual(0);
    expect(pop.y + pop.height).toBeLessThanOrEqual(viewport.height);
    // Right edges line up, and it is just below the button (or just above it when there is no room below).
    expect(Math.abs(pop.x + pop.width - (at.x + at.width))).toBeLessThanOrEqual(2);
    const gapBelow = pop.y - (at.y + at.height);
    const gapAbove = at.y - (pop.y + pop.height);
    expect(Math.min(Math.abs(gapBelow - 6), Math.abs(gapAbove - 6))).toBeLessThanOrEqual(2);
  });

  test('choosing an action asks first, and Escape closes the menu', async ({ page }) => {
    await page.goto('/portal/users');
    const button = page.getByRole('button', { name: /Műveletek: Második Eladó/ });
    await button.click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await button.click();
    await page.getByRole('menuitem', { name: /Fiók letiltása/ }).click();
    await expect(page.getByRole('dialog')).toContainText('Letiltja ezt a fiókot?');
  });
});
