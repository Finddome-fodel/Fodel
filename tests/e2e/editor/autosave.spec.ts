/**
 * Autosave in the listing editor and the guided setup: a draft saves itself, says so calmly, keeps what was typed
 * when the connection is gone, and restores it on the next visit. Runs against the isolated local editor fixture
 * (in-memory; the save goes through the real endpoint and the fixture's save_listing_editor).
 * E2E_EDITOR_URL is the fixture's address (default: the editor specs' port).
 */
import { test, expect, type Page } from '@playwright/test';

const fixture = process.env.E2E_EDITOR_URL ?? 'http://127.0.0.1:54401';
const ID = '10000000-0000-4000-8000-000000000001';
const OWNER = '00000000-0000-4000-8000-000000000001';

async function signIn(page: Page, baseURL: string) {
  const now = Math.floor(Date.now() / 1000);
  const part = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
  const email = 'owner@fodel-test.local';
  const user = { id: OWNER, email, role: 'authenticated', aud: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString() };
  const session = {
    access_token: `${part({ alg: 'HS256', typ: 'JWT' })}.${part({ sub: OWNER, email, aud: 'authenticated', role: 'authenticated', iat: now, exp: now + 86400 })}.test-fixture-signature`,
    refresh_token: 'local-test-fixture', token_type: 'bearer', expires_in: 86400, expires_at: now + 86400, user,
  };
  await page.context().clearCookies();
  await page.context().addCookies([{ name: 'sb-127-auth-token', value: 'base64-' + part(session), url: baseURL, httpOnly: true, sameSite: 'Lax' }]);
}

test.describe('Autosave: the listing editor', () => {
  // One in-memory listing is shared by every test here: they run one after another, never side by side.
  test.describe.configure({ mode: 'serial' });
  test.skip(process.env.E2E_EDITOR_FIXTURE !== '1', 'Requires the isolated local editor fixture');

  test.beforeEach(async ({ page, baseURL }) => {
    expect(new URL(baseURL!).hostname).toBe('127.0.0.1');
    expect((await (await page.request.get(`${fixture}/health`)).json()).fixture).toBe('fodel-editor-local');
    await page.request.post(`${fixture}/__reset`);
    await signIn(page, baseURL!);
  });

  const status = (page: Page) => page.locator('[data-autosave-status]');
  const title = (page: Page) => page.locator('[name="title_hu"]');

  test('typing is saved by itself, the line says so, and a reload shows the saved words', async ({ page }) => {
    await page.goto(`/portal/properties/${ID}`);
    await expect(status(page)).toHaveAttribute('data-state', 'saved');
    await expect(status(page)).toContainText('Minden módosítás mentve');
    await title(page).fill('Régi parasztház a Balaton felett');
    await expect(status(page)).toHaveAttribute('data-state', 'dirty');
    await expect(status(page)).toHaveAttribute('data-state', 'saved', { timeout: 8000 });
    await expect(status(page)).toContainText('Utoljára mentve:');
    await page.reload();
    await expect(title(page)).toHaveValue('Régi parasztház a Balaton felett');
    await expect(page.locator('#autosave-notices > *')).toHaveCount(0);
  });

  test('leaving a field saves at once, without waiting for the typing pause', async ({ page }) => {
    await page.goto(`/portal/properties/${ID}`);
    await title(page).fill('Gyors mentés');
    const started = Date.now();
    await title(page).blur();
    await expect(status(page)).toHaveAttribute('data-state', 'saved', { timeout: 4000 });
    expect(Date.now() - started).toBeLessThan(3500);
  });

  test('no connection: the words are kept in the browser, the line says so calmly, and the save is repeated by itself', async ({ page }) => {
    await page.goto(`/portal/properties/${ID}`);
    let offline = true;
    await page.route('**/api/portal/properties/*/update', (route) => (offline ? route.abort('internetdisconnected') : route.continue()));
    await title(page).fill('Ezt még nem látta a szerver');
    await title(page).blur();
    await expect(status(page)).toHaveAttribute('data-state', 'retrying', { timeout: 8000 });
    await expect(status(page)).toContainText('Nincs kapcsolat');
    await expect(status(page)).toContainText('biztonságban');
    await expect(status(page).getByRole('button', { name: 'Újra' })).toBeVisible();
    // The page warns before it is closed: the server does not hold the words yet.
    const warned = await page.evaluate(() => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; });
    expect(warned).toBe(true);
    offline = false;
    await status(page).getByRole('button', { name: 'Újra' }).click();
    await expect(status(page)).toHaveAttribute('data-state', 'saved', { timeout: 8000 });
    await page.reload();
    await expect(title(page)).toHaveValue('Ezt még nem látta a szerver');
  });

  test('closing the page while offline loses nothing: the next visit restores the typed words and saves them', async ({ page }) => {
    await page.goto(`/portal/properties/${ID}`);
    await page.route('**/api/portal/properties/*/update', (route) => route.abort('internetdisconnected'));
    await title(page).fill('Megmaradt a böngészőben');
    await title(page).blur();
    await expect(status(page)).toHaveAttribute('data-state', 'retrying', { timeout: 8000 });
    await page.unroute('**/api/portal/properties/*/update');
    await page.evaluate(() => { window.onbeforeunload = null; });
    page.once('dialog', (dialog) => dialog.accept());
    await page.goto(`/portal/properties/${ID}`, { waitUntil: 'domcontentloaded' });
    await expect(title(page)).toHaveValue('Megmaradt a böngészőben');
    await expect(page.locator('#autosave-notices')).toContainText('Visszaállítottuk');
    await expect(status(page)).toHaveAttribute('data-state', 'saved', { timeout: 8000 });
    await page.reload();
    await expect(title(page)).toHaveValue('Megmaradt a böngészőben');
    await expect(page.locator('#autosave-notices > *')).toHaveCount(0);
  });

  test('a refusal from the server is shown in words and is not repeated', async ({ page }) => {
    await page.goto(`/portal/properties/${ID}`);
    let calls = 0;
    await page.route('**/api/portal/properties/*/update', (route) => { calls += 1; return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ ok: false, message: 'A cím legfeljebb 160 karakter lehet.' }) }); });
    await title(page).fill('Túl hosszú');
    await title(page).blur();
    await expect(status(page)).toHaveAttribute('data-state', 'rejected', { timeout: 6000 });
    await expect(status(page)).toContainText('A cím legfeljebb 160 karakter lehet.');
    await page.waitForTimeout(4000);
    expect(calls).toBe(1);
  });

  test('the Save button still works and does not overtake a save on its way', async ({ page }) => {
    await page.goto(`/portal/properties/${ID}`);
    await title(page).fill('Gombbal mentve');
    await page.getByRole('button', { name: /^Mentés/ }).click();
    await expect(page).toHaveURL(/saved=1/);
    await expect(title(page)).toHaveValue('Gombbal mentve');
  });

  test('the status line is readable at phone width and does not overflow the screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(`/portal/properties/${ID}`);
    await page.route('**/api/portal/properties/*/update', (route) => route.abort('internetdisconnected'));
    await title(page).fill('Telefonon');
    await title(page).blur();
    await expect(status(page)).toHaveAttribute('data-state', 'retrying', { timeout: 8000 });
    const box = (await page.locator('.savebar-in').boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

test.describe('Autosave: the guided setup', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(process.env.E2E_EDITOR_FIXTURE !== '1', 'Requires the isolated local editor fixture');

  test.beforeEach(async ({ page, baseURL }) => {
    await page.request.post(`${fixture}/__reset`);
    await signIn(page, baseURL!);
  });

  test('the description saves while it is typed, and a dropped connection is retried', async ({ page }) => {
    await page.goto(`/portal/properties/${ID}/setup#description`);
    const status = page.locator('[data-autosave-status]');
    const description = page.locator('[data-step-form="description"] textarea[name="description"]');
    await expect(description).toBeVisible();
    let offline = true;
    await page.route('**/api/portal/properties/*/update', (route) => (offline ? route.abort('internetdisconnected') : route.continue()));
    await description.fill('Kőfalú ház, saját kúttal, négy hektár zöld környezetben.');
    await expect(status).toHaveAttribute('data-state', 'retrying', { timeout: 8000 });
    offline = false;
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(status).toHaveAttribute('data-state', 'saved', { timeout: 8000 });
    await page.reload();
    await expect(page.locator('[data-step-form="description"] textarea[name="description"]')).toHaveValue('Kőfalú ház, saját kúttal, négy hektár zöld környezetben.');
  });
});

/**
 * A live listing is never saved in the background: the editor keeps its deliberate Save button, and the server
 * refuses an autosave request outright. Needs the fixture started with FX_STATUS=published (an admin edits it).
 */
test.describe('Autosave: a live listing', () => {
  test.skip(process.env.E2E_EDITOR_FIXTURE !== '1' || process.env.FX_STATUS !== 'published', 'Requires the editor fixture with FX_STATUS=published');

  test('no autosave line, no background save, and the server answers 409 to an autosave request', async ({ page, baseURL }) => {
    const admin = '00000000-0000-4000-8000-000000000002';
    const now = Math.floor(Date.now() / 1000);
    const part = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
    const email = 'admin@fodel-test.local';
    const user = { id: admin, email, role: 'authenticated', aud: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString() };
    const session = {
      access_token: `${part({ alg: 'HS256', typ: 'JWT' })}.${part({ sub: admin, email, aud: 'authenticated', role: 'authenticated', iat: now, exp: now + 86400 })}.test-fixture-signature`,
      refresh_token: 'local-test-fixture', token_type: 'bearer', expires_in: 86400, expires_at: now + 86400, user,
    };
    await page.context().clearCookies();
    await page.context().addCookies([{ name: 'sb-127-auth-token', value: 'base64-' + part(session), url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
    await page.goto(`/portal/properties/${ID}`);
    await expect(page.locator('[data-autosave-status]')).toHaveCount(0);
    await expect(page.locator('#editor-form')).not.toHaveAttribute('data-autosave', 'on');
    let posts = 0;
    page.on('request', (request) => { if (request.method() === 'POST' && request.url().includes('/update')) posts += 1; });
    await page.locator('[name="title_hu"]').fill('Élő hirdetés, csak mentésre változik');
    await expect(page.locator('#savebar-txt')).toHaveText('Nem mentett módosítások');
    await page.waitForTimeout(3000);
    expect(posts).toBe(0);
    const refused = await page.request.post(`/api/portal/properties/${ID}/update`, { multipart: { autosave: 'yes', title_hu: 'x' }, headers: { Accept: 'application/json' } });
    expect(refused.status()).toBe(409);
    expect(await refused.json()).toEqual({ ok: false, error: 'not-autosaved' });
  });
});
