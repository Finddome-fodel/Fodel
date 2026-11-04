/**
 * In which languages is a listing published, and what does its page do in the others? One answer for the
 * listing route (render, fallback or redirect), the hreflang alternates, the sitemap, the language switcher,
 * the search lists and llms.txt, so they can never disagree. Pure: relative imports only, loaded directly by
 * scripts/test-rules.mjs.
 *
 * A language is PUBLISHED when the listing was written in it, or it is part of what was bought (package plus
 * single languages) and not switched off, and it has text. English is mandatory: it is the fallback text of
 * every other language, so its page always exists (with the original's text until the English one is ready).
 * Before migration 0053 (`gated` false) nothing changes: every language is served, as it always was.
 */
import { entitledLocales, grantedLocales, NON_EXCLUDABLE_LOCALES, type TranslationPricing } from './translation-packages.ts';

export { NON_EXCLUDABLE_LOCALES };

export type ListingPolicy = {
  /** The row has the columns of migration 0053: the rules apply. */
  gated: boolean;
  /** The language the listing was written in. */
  sourceLocale: string;
  /** Languages that have a text row. */
  languagesWithText: readonly string[];
  /** Languages a person wrote the text in (not translated): theirs to publish, no purchase needed. */
  writtenLocales?: readonly string[];
  translationPackage?: string | null;
  extraLocales?: readonly string[] | null;
  excludedLocales?: readonly string[] | null;
};

export type UnpurchasedMode = 'redirect' | 'fallback';

/** Languages whose page shows the listing's own text in that language. */
export function publishedLocales(policy: ListingPolicy, cfg: TranslationPricing, targets: readonly string[]): string[] {
  if (!policy.gated) return targets.filter((code) => code === policy.sourceLocale || policy.languagesWithText.includes(code));
  const entitled = new Set(entitledLocales({ ...policy, excludedLocales: policy.excludedLocales ?? [] }, cfg, targets));
  return targets.filter((code) => code === policy.sourceLocale || (entitled.has(code) && policy.languagesWithText.includes(code)));
}

export type Serving =
  /** The page, with the listing's text in this language. */
  | { serve: 'render' }
  /** The page, with the English (or original) text; not indexed, not in hreflang. */
  | { serve: 'fallback' }
  /** No page here: send the visitor to the English one. `permanent` is false while the language is still being made. */
  | { serve: 'redirect'; permanent: boolean };

export function servingOf(policy: ListingPolicy, locale: string, cfg: TranslationPricing, targets: readonly string[], mode: UnpurchasedMode = 'redirect'): Serving {
  if (!policy.gated) return { serve: 'render' };
  if (publishedLocales(policy, cfg, targets).includes(locale)) return { serve: 'render' };
  // The original and English always have a page: English is the fallback text of every other language.
  if (locale === policy.sourceLocale || NON_EXCLUDABLE_LOCALES.includes(locale)) return { serve: 'fallback' };
  const excluded = (policy.excludedLocales ?? []).includes(locale);
  const granted = grantedLocales({ ...policy, excludedLocales: [] }, cfg, targets).includes(locale);
  if (excluded) return { serve: 'redirect', permanent: true };
  // Bought, but the text is not there yet (still being made, or it failed): temporary, it will come.
  if (granted) return { serve: 'redirect', permanent: false };
  return mode === 'fallback' ? { serve: 'fallback' } : { serve: 'redirect', permanent: true };
}

/** Where the language switcher may point on this listing: the published languages plus the always-present ones. */
export function switcherLocales(policy: ListingPolicy, cfg: TranslationPricing, targets: readonly string[]): string[] {
  const keep = new Set([...publishedLocales(policy, cfg, targets), policy.sourceLocale, ...NON_EXCLUDABLE_LOCALES]);
  return targets.filter((code) => keep.has(code));
}

/** Whether a listing may appear in a locale's lists (search, home, top 10). A page that redirects is not listed. */
export function listedIn(policy: ListingPolicy, locale: string, cfg: TranslationPricing, targets: readonly string[], mode: UnpurchasedMode = 'redirect'): boolean {
  return servingOf(policy, locale, cfg, targets, mode).serve !== 'redirect';
}

/**
 * Which language's text a page shows, in order: its own, then English (every listing has it: Go includes it),
 * German, Dutch, and Hungarian last. A Hungarian or Dutch page tries only its own language, then Hungarian.
 */
export function textOrder<T extends string>(locale: T): (T | 'en' | 'de' | 'nl' | 'hu')[] {
  if (locale === 'hu' || locale === 'nl') return [...new Set<T | 'hu'>([locale, 'hu'])] as (T | 'en' | 'de' | 'nl' | 'hu')[];
  return [...new Set<T | 'en' | 'de' | 'nl' | 'hu'>([locale, 'en', 'de', 'nl', 'hu'])];
}
