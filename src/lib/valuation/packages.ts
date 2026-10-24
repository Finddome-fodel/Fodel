/**
 * The three valuation packages — free AI estimate, FODEL visit, official /
 * judicial — with names and prices an admin sets in
 * /portal/settings/services (site_settings.services.valuationPackages).
 *
 * The tiers themselves are fixed: they are `valuations.request_kind`, and a
 * request's kind decides what happens next. What an admin controls is what
 * each one is called and what it costs. Anything not set falls back to the
 * wording the public form always carried, and the visit's price falls back to
 * the on-site catalogue, so nothing here invents a number.
 */
import { ONSITE_SERVICES } from '~/config/company';
import type { Services } from '~/lib/runtime-config';
import { eurCents } from '~/lib/format';
import { localizer, type L10n, type Locale } from '~/i18n/ui';

export const PACKAGE_KINDS = ['indicative', 'expert_visit', 'judicial'] as const;
export type PackageKind = (typeof PACKAGE_KINDS)[number];

export type ValuationPackage = {
  kind: PackageKind;
  /** hu and nl are editable in the admin; en, de and fr are the names below. */
  names: L10n;
  /** Whole euros; null = on request (no fixed price). */
  priceEur: number | null;
  enabled: boolean;
  /** Whether the price can be changed — the free estimate is always free. */
  priceLocked: boolean;
};

const visit = ONSITE_SERVICES.find((service) => service.id === 'onsite-visit')!;

const DEFAULTS: Record<PackageKind, Omit<ValuationPackage, 'kind'>> = {
  indicative: {
    names: { hu: 'Tájékoztató, piaci alapú becslés', nl: 'Indicatieve marktwaarde', en: 'Indicative, market-based estimate', de: 'Unverbindliche, marktbasierte Einschätzung', fr: 'Estimation indicative fondée sur le marché', es: 'Estimación orientativa basada en el mercado', pl: 'Orientacyjna wycena oparta na danych rynkowych', ro: 'Estimare orientativă, bazată pe piață', sk: 'Orientačný odhad založený na trhu' },
    priceEur: 0,
    enabled: true,
    priceLocked: true,
  },
  expert_visit: {
    names: { hu: 'Gábor helyszíni látogatása', nl: 'Persoonlijk bezoek van Gábor', en: 'A visit from Gábor', de: 'Besuch von Gábor', fr: 'Visite de Gábor', es: 'Visita de Gábor', pl: 'Wizyta Gábora', ro: 'Vizita lui Gábor', sk: 'Návšteva Gábora' },
    priceEur: visit.priceEur,
    enabled: true,
    priceLocked: false,
  },
  judicial: {
    names: { hu: 'Igazságügyi / hivatalos értékbecslés', nl: 'Officiële / gerechtelijke taxatie', en: 'Official / court-appointed valuation', de: 'Amtliches / gerichtliches Gutachten', fr: 'Expertise officielle / judiciaire', es: 'Tasación oficial / judicial', pl: 'Operat szacunkowy / wycena sądowa', ro: 'Evaluare oficială / judiciară', sk: 'Znalecký posudok / súdny posudok' },
    priceEur: null,
    enabled: true,
    priceLocked: false,
  },
};

export function valuationPackages(services: Pick<Services, 'valuationPackages'> | undefined): ValuationPackage[] {
  return PACKAGE_KINDS.map((kind) => {
    const base = DEFAULTS[kind];
    const stored = services?.valuationPackages?.[kind];
    const price = base.priceLocked ? base.priceEur : stored && 'priceEur' in stored ? stored.priceEur ?? null : base.priceEur;
    return {
      kind,
      names: { ...base.names, hu: stored?.names?.hu?.trim() || base.names.hu, nl: stored?.names?.nl?.trim() || base.names.nl },
      priceEur: typeof price === 'number' && Number.isFinite(price) && price >= 0 ? price : null,
      enabled: kind === 'indicative' ? true : stored?.enabled ?? base.enabled,
      priceLocked: base.priceLocked,
    };
  });
}

export function valuationPackage(services: Pick<Services, 'valuationPackages'> | undefined, kind: string): ValuationPackage | null {
  return valuationPackages(services).find((entry) => entry.kind === kind) ?? null;
}

/** Whether this package can be paid for now: a fixed price above zero. */
export function isPayable(pkg: ValuationPackage | null): pkg is ValuationPackage & { priceEur: number } {
  return Boolean(pkg && pkg.enabled && pkg.priceEur !== null && pkg.priceEur >= 1);
}

/** "€ 200", or the on-request wording in the right language. */
export function priceLabel(pkg: ValuationPackage, locale: Locale): string {
  const x = localizer(locale);
  if (pkg.priceEur === null) return x('árajánlat alapján', 'op offerte', 'on request', 'auf Anfrage', 'sur demande', 'bajo petición', 'na zapytanie', 'la cerere', 'na požiadanie');
  if (pkg.priceEur === 0) return x('díjmentes', 'gratis', 'free', 'kostenlos', 'gratuit', 'gratis', 'bezpłatnie', 'gratuit', 'zadarmo');
  return eurCents(pkg.priceEur * 100, locale === 'hu' ? 'nl' : locale);
}
