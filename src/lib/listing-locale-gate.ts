/**
 * The one rule behind every listing page in every language (F1): a language the listing is not published in (not bought,
 * switched off, or not translated yet) has no page of its own, so the visitor is sent to the English one: permanently
 * when it will not come back, temporarily while a language is still being translated. One helper, called by all 28
 * `src/pages/<locale>/[slug].astro`, so the routes cannot drift apart; a test fails if one forgets it.
 *
 * The rule itself (what is published where) lives in src/lib/listing-languages.ts; this only asks it for the verdict.
 */
import { englishUrl, servingFor, translationConfig } from '~/lib/properties';
import type { Locale } from '~/i18n/ui';

type Listing = Parameters<typeof servingFor>[0];

/** Where to send the visitor instead of this page, or null when the listing is published in this language. */
export async function localeGate(property: Listing, locale: Locale): Promise<{ to: string; status: 301 | 302 } | null> {
  const serving = servingFor(property, locale, await translationConfig());
  return serving.serve === 'redirect' ? { to: englishUrl(property), status: serving.permanent ? 301 : 302 } : null;
}
