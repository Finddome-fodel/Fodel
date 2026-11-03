/**
 * hreflang helpers.
 *
 * Every page declares the equivalent URL in each locale. Reciprocity is not
 * optional — a one-way hreflang is ignored by Google — so pages build their
 * alternates from the same route key rather than hand-writing URLs.
 */

import { LOCALES, path, propertyPath, type Locale, type RouteKey } from '~/i18n/ui';

/** Alternates for a page that exists at the same route key in every locale. */
export function alternatesFor(key: RouteKey, ...rest: string[]): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, path(l, key, ...rest)])) as Record<
    Locale,
    string
  >;
}

/**
 * Where the language menu and the hreflang set point from a property page: the same listing in every
 * language. The page narrows this to the languages the listing is actually published in.
 */
export function propertyAlternates(
  categorySlugs: Partial<Record<Locale, string>>,
  ref: string
): Record<Locale, string> {
  return Object.fromEntries(
    LOCALES.map((l) => [l, propertyPath(l, categorySlugs[l] ?? '', ref)])
  ) as Record<Locale, string>;
}

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
