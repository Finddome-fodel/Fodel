/**
 * The few sentences around a valuation result that are built in code rather
 * than taken from a template: the source line, the money in the reader's
 * currency and the pay-now button. Shared by the public form, the follow-up
 * request and the admin's approval, so all three say the same thing.
 */
import { localizer, LOCALES, type Locale } from '~/i18n/ui';
import { intlTag } from '~/lib/format';
import { priceLabel, type ValuationPackage } from '~/lib/valuation/packages';

export interface ValuationBaseline {
  kind?: string;
  count?: number;
  year?: number | null;
  level?: string;
  url?: string;
  retrievedAt?: string;
}

/** Forint for Hungarian readers; euro, converted at the published rate, for everyone else. */
export function valuationAmount(locale: Locale, huf: number, rate: number | null | undefined): string {
  if (locale !== 'hu' && rate) {
    return new Intl.NumberFormat(intlTag(locale), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(huf / rate);
  }
  return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(huf);
}

/** Whether the euro figure and its exchange-rate date are shown. */
export const showsEuro = (locale: Locale) => locale !== 'hu';

/** "Where does this range come from", in one line. */
export function valuationBasis(locale: Locale, baseline: ValuationBaseline | null | undefined): string | undefined {
  if (!baseline) return undefined;
  const x = localizer(locale);
  const n = baseline.count ?? 0;
  if (baseline.kind === 'ksh') {
    const county = baseline.level === 'county';
    const level = county
      ? x('vármegye', 'provincie', 'county', 'Komitat', 'comitat')
      : x('település', 'plaats', 'settlement', 'Ort', 'localité');
    const records = x(`${n} adat`, `${n} gegevens`, `${n} records`, `${n} Datensätze`, `${n} données`);
    return `KSH Ingatlanadattár, ${baseline.year} (${level}, ${records})`;
  }
  if (baseline.kind === 'comps') {
    return x(
      `${n} hasonló FODEL-hirdetés`,
      `${n} vergelijkbare FODEL-advertenties`,
      `${n} comparable FODEL listings`,
      `${n} vergleichbare FODEL-Inserate`,
      `${n} annonces FODEL comparables`
    );
  }
  return undefined;
}

/** "2024, retrieved 12 March 2026" */
export function valuationSourceDate(locale: Locale, baseline: ValuationBaseline): string {
  const word = localizer(locale)('letöltve', 'opgehaald', 'retrieved', 'abgerufen', 'consulté le');
  return `${baseline.year}, ${word} ${baseline.retrievedAt ?? '—'}`;
}

/** The card-payment button that follows a valuation request. */
export function payNowLabel(locale: Locale, pkg: ValuationPackage): string {
  const price = priceLabel(pkg, locale);
  return localizer(locale)(
    `Fizetés most — ${price} (bankkártya)`,
    `Nu betalen — ${price} (kaart)`,
    `Pay now — ${price} (card)`,
    `Jetzt bezahlen — ${price} (Karte)`,
    `Payer maintenant — ${price} (carte)`
  );
}

/** The package price in every language, for the office's service request. */
export function priceLabels(pkg: ValuationPackage): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, priceLabel(pkg, locale)])) as Record<Locale, string>;
}
