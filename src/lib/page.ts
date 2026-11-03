/**
 * hreflang helpers.
 *
 * Every page declares the equivalent URL in each locale. Reciprocity is not
 * optional — a one-way hreflang is ignored by Google — so pages build their
 * alternates from the same route key rather than hand-writing URLs.
 */

import { LOCALES, path, propertyPath, type Locale, type RouteKey } from '~/i18n/ui';
import { LISTING_TRANSLATION_LOCALES } from '~/lib/ai/translate-core';

/** Alternates for a page that exists at the same route key in every locale. */
export function alternatesFor(key: RouteKey, ...rest: string[]): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, path(l, key, ...rest)])) as Record<
    Locale,
    string
  >;
}

/**
 * hreflang alternates for a property detail page: the languages listing text
 * is translated into. A listing page in one of the seven later site languages
 * (sr, uk, tr, he, ar, ru, zh) shows the listing's English text under a
 * translated frame, so it is a stand-in, not an alternate: it is left out
 * here and marked noindex (see `listingPageIndexable`).
 */
export function propertyAlternates(
  categorySlugs: Partial<Record<Locale, string>>,
  ref: string
): Partial<Record<Locale, string>> {
  return Object.fromEntries(
    LISTING_TRANSLATION_LOCALES.map((l) => [l, propertyPath(l, categorySlugs[l] ?? '', ref)])
  ) as Partial<Record<Locale, string>>;
}

/** Where the language menu sends a visitor from a property page: every language, stand-ins included. */
export function propertySwitcher(
  categorySlugs: Partial<Record<Locale, string>>,
  ref: string
): Record<Locale, string> {
  return Object.fromEntries(
    LOCALES.map((l) => [l, propertyPath(l, categorySlugs[l] ?? '', ref)])
  ) as Record<Locale, string>;
}

/** Whether a property page in this language is a real translation search engines should index. */
export const listingPageIndexable = (locale: Locale): boolean =>
  (LISTING_TRANSLATION_LOCALES as readonly string[]).includes(locale);

/** Alternates for the locale home pages. */
export function homeAlternates(): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, `/${l}/`])) as Record<Locale, string>;
}

/** Breadcrumb trail builder — feeds both the visible trail and BreadcrumbList. */
export function crumbs(
  locale: Locale,
  items: { name: string; url: string }[]
): { name: string; url: string }[] {
  return [{ name: 'FINDDOME', url: `/${locale}/` }, ...items];
}
