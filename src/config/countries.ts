import type { Locale } from '~/i18n/ui';

export type Country = {
  labels: Record<Locale, string>;
  /** [west, south, east, north], used for friendly editor validation. */
  bounds: [number, number, number, number];
};

export const COUNTRIES: Record<string, Country> = {
  HU: { labels: { hu: 'Magyarország', nl: 'Hongarije', en: 'Hungary', de: 'Ungarn', fr: 'Hongrie' }, bounds: [16, 45.7, 22.9, 48.6] },
  AT: { labels: { hu: 'Ausztria', nl: 'Oostenrijk', en: 'Austria', de: 'Österreich', fr: 'Autriche' }, bounds: [9.5, 46.3, 17.2, 49.1] },
  HR: { labels: { hu: 'Horvátország', nl: 'Kroatië', en: 'Croatia', de: 'Kroatien', fr: 'Croatie' }, bounds: [13.4, 42.3, 19.5, 46.6] },
  RO: { labels: { hu: 'Románia', nl: 'Roemenië', en: 'Romania', de: 'Rumänien', fr: 'Roumanie' }, bounds: [20.2, 43.5, 29.8, 48.3] },
  SK: { labels: { hu: 'Szlovákia', nl: 'Slowakije', en: 'Slovakia', de: 'Slowakei', fr: 'Slovaquie' }, bounds: [16.8, 47.7, 22.6, 49.7] },
  SI: { labels: { hu: 'Szlovénia', nl: 'Slovenië', en: 'Slovenia', de: 'Slowenien', fr: 'Slovénie' }, bounds: [13.3, 45.4, 16.7, 46.9] },
};

export function countryLabel(code: string, locale: Locale): string {
  return COUNTRIES[code]?.labels[locale] ?? code;
}

export function boundsFor(code: string): Country['bounds'] | undefined {
  return COUNTRIES[code]?.bounds;
}
