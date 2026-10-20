/**
 * Number, currency and area formatting.
 *
 * The prototype formatted prices inline with `toLocaleString('de-DE')` and
 * stored the forint figure as a hardcoded string ('64 000 000 Ft') that would
 * silently go stale. Here HUF is a real number carried with the date it was
 * set, so the page can say when it was last checked.
 */

import type { Locale } from '~/i18n/ui';

const NBSP = ' ';

const LOCALE_TAG: Record<Locale, string> = { hu: 'hu-HU', nl: 'nl-NL' };

/**
 * Thousands the way each language writes them: a no-break space in Hungarian
 * ("1 200 000", also for four digits, which ICU's hu-HU leaves ungrouped),
 * a dot in Dutch ("1.200.000").
 */
export function grouped(amount: number, locale: Locale): string {
  const whole = Math.trunc(Math.abs(amount)).toString();
  const sign = amount < 0 ? '-' : '';
  const sep = locale === 'hu' ? NBSP : '.';
  return sign + whole.replace(/\B(?=(\d{3})+(?!\d))/g, sep) + (amount % 1 ? String(Math.abs(amount) % 1).slice(1).replace('.', ',') : '');
}

/** € 178 000 (hu) or € 178.000 (nl). */
export function eur(amount: number, locale: Locale = 'nl'): string {
  return `€${NBSP}${grouped(amount, locale)}`;
}

export function huf(amount: number, locale: Locale): string {
  return `${grouped(amount, locale)}${NBSP}Ft`;
}

/** Plots switch to hectares above 1 ha, matching the prototype's threshold. */
export function area(m2: number, locale: Locale): string {
  if (m2 >= 10000) {
    const ha = (m2 / 10000).toFixed(2).replace('.', locale === 'hu' ? ',' : ',');
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
    const hold = (m2 / 5754.6).toFixed(1).replace('.', ',');
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
  if (epc === 'pending') return { value: labels.epcMissing, isPending: true };
  if (epc === 'exempt') return { value: '—', isPending: true };
  return { value: epc, isPending: false };
}
