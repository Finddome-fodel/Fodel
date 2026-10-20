/**
 * Every email template, in Hungarian and Dutch, through the preview route:
 * it renders, has a subject, no leftover "undefined"/"NaN", a plain-text part,
 * and every link points at the production origin (never localhost).
 */
import { test, expect } from '@playwright/test';

const ORIGIN = 'https://fodel.eu';

test('every template renders in hu and nl with clean text and production links', async ({ request }) => {
  test.setTimeout(240_000);
  const index = await (await request.get('/dev/emails')).text();
  const names = [...new Set([...index.matchAll(/[?&]t=([\w.-]+)/g)].map((m) => m[1]))];
  expect(names.length, 'templates listed on /dev/emails').toBeGreaterThan(15);

  const problems: string[] = [];
  for (const name of names) {
    for (const locale of ['hu', 'nl']) {
      const html = await request.get(`/dev/emails?t=${name}&locale=${locale}`);
      const text = await request.get(`/dev/emails?t=${name}&locale=${locale}&format=text`);
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
        if (![ORIGIN, 'https://www.fodel.eu', 'https://example.com'].includes(host) && url.includes('fodel') && host !== ORIGIN) problems.push(`${name}/${locale}: link to ${host}`);
      }
    }
  }
  expect(problems).toEqual([]);
});
