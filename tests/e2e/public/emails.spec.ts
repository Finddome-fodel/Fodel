/**
 * Every email template, in all nine languages, through the preview route:
 * it renders, has a subject, no leftover "undefined"/"NaN", a plain-text part,
 * and every link points at the production origin (never localhost).
 */
import { test, expect } from '@playwright/test';
import { LOCALES } from '../../../src/i18n/ui';

const ORIGIN = 'https://finddome.com';

test('every template renders in all nine languages with clean text and production links', async ({ request }) => {
  test.setTimeout(600_000);
  const index = await (await request.get('/dev/emails')).text();
  const names = [...new Set([...index.matchAll(/[?&]t=([\w.-]+)/g)].map((m) => m[1]))];
  expect(names.length, 'templates listed on /dev/emails').toBeGreaterThan(15);

  const problems: string[] = [];
  for (const name of names) {
    for (const locale of LOCALES) {
      const html = await request.get(`/dev/emails?t=${name}&locale=${locale}`);
      const text = await request.get(`/dev/emails?t=${name}&locale=${locale}&format=text`);
      // Admin invitations exist only in hu and nl: the other seven need an approved template first.
      if (html.status() === 404 && name === 'inviteAdminAfterApproval' && !['hu', 'nl'].includes(locale)) continue;
      if (html.status() !== 200) { problems.push(`${name}/${locale}: html ${html.status()}`); continue; }
      if (text.status() !== 200) problems.push(`${name}/${locale}: text ${text.status()}`);
      const markup = await html.text();
      const plain = await text.text();
      if (!plain.trim()) problems.push(`${name}/${locale}: empty plain-text part`);
      for (const [kind, body] of [['html', markup], ['text', plain]] as const) {
        if (/undefined|NaN|\[object/.test(body)) problems.push(`${name}/${locale}: "${(body.match(/.{0,30}(undefined|NaN|\[object).{0,20}/) ?? [''])[0]}" in ${kind}`);
        if (/localhost|127\.0\.0\.1/.test(body)) problems.push(`${name}/${locale}: local address in ${kind}`);
      }
      for (const href of markup.matchAll(/href="(https?:[^"]+)"/g)) {
        const url = href[1].replace(/&amp;/g, '&');
        const host = new URL(url).origin;
        if (![ORIGIN, 'https://www.finddome.com', 'https://example.com'].includes(host) && url.includes('fodel') && host !== ORIGIN) problems.push(`${name}/${locale}: link to ${host}`);
      }
    }
  }
  expect(problems).toEqual([]);
});

test('the same email differs from language to language (no copy left behind)', async ({ request }) => {
  test.setTimeout(240_000);
  const problems: string[] = [];
  for (const name of ['registrationConfirm', 'submissionReceived', 'published', 'paymentReceipt', 'passwordReset', 'valuationReceived', 'newsletterConfirm']) {
    const subjects = new Map<string, string>();
    for (const locale of LOCALES) {
      const plain = await (await request.get(`/dev/emails?t=${name}&locale=${locale}&format=text`)).text();
      const subject = plain.split('\n', 1)[0];
      if (subjects.has(subject)) problems.push(`${name}: subject of ${locale} equals that of ${subjects.get(subject)}`);
      subjects.set(subject, locale);
    }
  }
  expect(problems).toEqual([]);
});
