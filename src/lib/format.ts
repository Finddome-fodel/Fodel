/**
 * Number, currency, area and date formatting, one house style per language.
 *
 *   hu  € 178 000      2 000 €-style sums keep the no-break space   1,5 ha
 *   nl  € 178.000      dot for thousands, comma for decimals       1,5 ha
 *   en  €178,000       comma for thousands, point for decimals     1.5 ha
 *   de  178.000 €      dot for thousands, comma for decimals       1,5 ha
 *   fr  178 000 €      narrow no-break space for thousands         1,5 ha
 *
 * ICU's own grouping differs from these in places (hu-HU leaves four digits
 * ungrouped, fr-FR uses U+202F but nl-NL's "€ 1.200,00" carries cents we do not
 * want), so the whole part is grouped by hand and only dates go through Intl.
 * The prototype formatted prices inline and stored the forint figure as a
 * string; here HUF is a real number, so the page can say when it was checked.
 */

import type { Locale } from '~/i18n/ui';

const NBSP = '\u00a0';
const NARROW_NBSP = '\u202f';

const LOCALE_TAG: Record<Locale, string> = {
  hu: 'hu-HU',
  nl: 'nl-NL',
  en: 'en-GB',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  pl: 'pl-PL',
  ro: 'ro-RO',
  sk: 'sk-SK',
};

/** The BCP 47 tag Intl wants for each page language. */
export const intlTag = (locale: Locale): string => LOCALE_TAG[locale];

type NumberStyle = {
  group: string;
  decimal: string;
  /** Where the euro sign sits, and whether a space separates it from the digits. */
  euro: 'prefix-spaced' | 'prefix-tight' | 'suffix';
};

const STYLE: Record<Locale, NumberStyle> = {
  hu: { group: NBSP, decimal: ',', euro: 'prefix-spaced' },
  nl: { group: '.', decimal: ',', euro: 'prefix-spaced' },
  en: { group: ',', decimal: '.', euro: 'prefix-tight' },
  de: { group: '.', decimal: ',', euro: 'suffix' },
  fr: { group: NARROW_NBSP, decimal: ',', euro: 'suffix' },
  es: { group: '.', decimal: ',', euro: 'suffix' },
  pl: { group: NBSP, decimal: ',', euro: 'suffix' },
  ro: { group: '.', decimal: ',', euro: 'suffix' },
  sk: { group: NBSP, decimal: ',', euro: 'suffix' },
};

/** Decimal separator and thousands separator for a language, for client scripts and tests. */
export const separators = (locale: Locale) => ({ group: STYLE[locale].group, decimal: STYLE[locale].decimal });

/**
 * Thousands the way each language writes them, also for four digits:
 * "1 200 000" (hu, no-break space), "1.200.000" (nl, de), "1,200,000" (en),
 * "1 200 000" (fr, narrow no-break space; pl, sk, no-break space),
 * "1.200.000" (es, ro). Up to two decimals, trailing
 * zeros dropped.
 */
export function grouped(amount: number, locale: Locale): string {
  const { group, decimal } = STYLE[locale];
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, fraction] = fixed.split('.');
  const sign = amount < 0 && Number(fixed) !== 0 ? '-' : '';
  const digits = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const decimals = fraction.replace(/0+$/, '');
  return sign + digits + (decimals ? decimal + decimals : '');
}

/** € 178 000 (hu), € 178.000 (nl), €178,000 (en), 178.000 € (de), 178 000 € (fr). */
export function eur(amount: number, locale: Locale = 'nl'): string {
  const body = grouped(amount, locale);
  switch (STYLE[locale].euro) {
    case 'prefix-spaced':
      return `€${NBSP}${body}`;
    case 'prefix-tight':
      return `€${body}`;
    case 'suffix':
      return `${body}${NBSP}€`;
  }
}

/** The same, from cents ("€ 1.200" or "€ 1.234,50"), for orders and package prices. */
export function eurCents(cents: number, locale: Locale = 'nl'): string {
  return eur(Math.round(cents) / 100, locale);
}

export function huf(amount: number, locale: Locale): string {
  return `${grouped(amount, locale)}${NBSP}Ft`;
}

/** Plots switch to hectares above 1 ha, matching the prototype's threshold. */
export function area(m2: number, locale: Locale): string {
  if (m2 >= 10000) {
    const ha = (m2 / 10000).toFixed(2).replace('.', STYLE[locale].decimal);
    return `${ha}${NBSP}ha`;
  }
  return `${grouped(m2, locale)}${NBSP}m²`;
}

export function floorArea(m2: number, locale: Locale = 'nl'): string {
  return `${grouped(m2, locale)}${NBSP}m²`;
}

/**
 * Hungarian buyers think in hold, Dutch buyers in hectares, and neither
 * thinks in the other's unit. FODEL's old site carried a converter for
 * exactly this reason.
 */
export function areaWithAlternates(m2: number, locale: Locale): string {
  const parts = [area(m2, locale)];
  if (m2 >= 10000) {
    const hold = (m2 / 5754.6).toFixed(1).replace('.', STYLE[locale].decimal);
    if (locale === 'hu') parts.push(`${hold}${NBSP}hold`);
    else parts.push(`${grouped(m2, locale)}${NBSP}m²`);
  }
  return parts.join(' · ');
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Hungarian EPC classes render as-is; `pending`/`exempt` need a word. */
export function epcLabel(
  epc: string,
  labels: { epcMissing: string }
): { value: string; isPending: boolean } {
  if (epc === 'pending' || epc==='unknown') return { value: labels.epcMissing, isPending: true };
  if (epc === 'exempt' || epc==='not-applicable') return { value: '—', isPending: true };
  return { value: epc, isPending: false };
}
