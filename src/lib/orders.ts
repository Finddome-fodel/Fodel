/**
 * Listing orders — what an approved listing costs, itemised.
 *
 * FODEL 1.1's payment model is approve-then-charge: an admin reviews a
 * submitted listing, confirms the package and ticks any extras, and the system
 * turns that into an order the owner pays before publication.
 *
 * Two rules run through this file:
 *
 * 1. **A price is never taken from the client.** Everything resolves against
 *    the admin-edited catalogue (src/lib/listing-packages.ts) by id. The browser sends "the
 *    12-month package and two translations", never "€179".
 *
 * 2. **A stored order is denormalised on purpose.** The label and unit price
 *    are written into `payments.line_items` at the moment the order is made,
 *    not looked up again later. An order is a financial record: it has to
 *    still read correctly in three years, after the tariff on fodel.hu has
 *    changed twice. Re-deriving a 2026 total from the 2029 price list would
 *    quietly rewrite history.
 */
import { ONSITE_SERVICES } from '~/config/company';
import type { Locale } from '~/i18n/ui';
import { eurCents } from '~/lib/format';
import type { RequestedExtras } from '~/lib/portal/requested-extras';
import { listingCatalog, packageOf, isAboveThreshold as tierApplies, type ListingCatalog } from '~/lib/listing-packages';

/**
 * Everything that can be a line after the package: the listing extras plus
 * the two on-site services (brief 3 §F). Until the advance-payment decision
 * is made, an on-site service is charged the existing way — on the listing's
 * order at approval — so it lives in the same catalogue.
 */
/**
 * Prices come from the admin-edited catalogue (src/lib/listing-packages.ts);
 * every function below takes it, defaulting to the published tariff.
 */
const orderExtras = (cat: ListingCatalog): readonly { id: string; priceEur: number; unit?: string; minMonths?: number }[] => [
  ...cat.extras,
  ...ONSITE_SERVICES.map((service) => ({ id: service.id, priceEur: service.priceEur, unit: 'once' })),
];

/** The on-site services exclude each other: one visit per listing. */
const EXCLUSIVE = new Set<string>(ONSITE_SERVICES.map((service) => service.id));

export type OrderLocale = Locale;

/** One line of a stored order, exactly as it lives in `payments.line_items`. */
export type OrderLine = {
  /** `service` is a standalone purchase (a valuation package), not part of a listing order. */
  kind: 'package' | 'extra' | 'service';
  id: string;
  quantity: number;
  unitCents: number;
  label: string;
};

/** What the admin's review form sends: ids and counts, never money. */
export type OrderSelection = {
  packageId: string;
  /** The €179 tier applies above 150M HUF — decided from the listing, not typed in. */
  aboveThreshold?: boolean;
  extras: { id: string; quantity: number }[];
};

/* ── Labels ──────────────────────────────────────────────────────────────── */
// The public price list (src/components/pages/PriceListPage.astro) writes its
// own marketing copy for these. These are the invoice wordings — shorter,
// literal, and safe to sit on a payment record for years.


const EXTRA_LABEL: Record<string, Record<OrderLocale, string>> = {
  translation: { hu: 'Fordítás', nl: 'Vertaling', en: 'Translation', de: 'Übersetzung', fr: 'Traduction' },
  'category-highlight': { hu: 'Kiemelés a kategóriában', nl: 'Uitgelicht in de categorie', en: 'Highlighting in the category', de: 'Hervorhebung in der Kategorie', fr: 'Mise en avant dans la catégorie' },
  'homepage-highlight': { hu: 'Kiemelés a főoldalon', nl: 'Uitgelicht op de homepage', en: 'Highlighting on the homepage', de: 'Hervorhebung auf der Startseite', fr: 'Mise en avant sur la page d’accueil' },
  video: { hu: 'Videós bemutató', nl: 'Videopresentatie', en: 'Video presentation', de: 'Videopräsentation', fr: 'Présentation vidéo' },
  'retro-images': { hu: 'Fotóretusálás', nl: 'Fotobewerking', en: 'Photo editing', de: 'Bildbearbeitung', fr: 'Retouche photo' },
  'renewal-6m': { hu: 'Hosszabbítás — 6 hónap', nl: 'Verlenging — 6 maanden', en: 'Renewal, 6 months', de: 'Verlängerung, 6 Monate', fr: 'Prolongation, 6 mois' },
  ...Object.fromEntries(ONSITE_SERVICES.map((service) => [service.id, service.names])),
};

/**
 * The unit a quantity is counted in.
 *
 * Two forms, because the two places this appears need different grammar:
 * `one` for a rate ("€ 25 / taal"), `many` for a count ("Vertaling — 2 talen").
 * Dutch pluralises after a numeral and Hungarian does not — "2 nyelv" is
 * correct and "2 nyelvek" is wrong — so this cannot be one string with an "s"
 * bolted on.
 */
const NO_UNIT: Record<OrderLocale, { one: string; many: string }> = {
  hu: { one: '', many: '' },
  nl: { one: '', many: '' },
  en: { one: '', many: '' },
  de: { one: '', many: '' },
  fr: { one: '', many: '' },
};
const EXTRA_UNIT: Record<string, Record<OrderLocale, { one: string; many: string }>> = {
  translation: {
    hu: { one: 'nyelv', many: 'nyelv' },
    nl: { one: 'taal', many: 'talen' },
    en: { one: 'language', many: 'languages' },
    de: { one: 'Sprache', many: 'Sprachen' },
    fr: { one: 'langue', many: 'langues' },
  },
  'category-highlight': {
    hu: { one: 'hónap', many: 'hónap' },
    nl: { one: 'maand', many: 'maanden' },
    en: { one: 'month', many: 'months' },
    de: { one: 'Monat', many: 'Monate' },
    fr: { one: 'mois', many: 'mois' },
  },
  'homepage-highlight': {
    hu: { one: 'hónap', many: 'hónap' },
    nl: { one: 'maand', many: 'maanden' },
    en: { one: 'month', many: 'months' },
    de: { one: 'Monat', many: 'Monate' },
    fr: { one: 'mois', many: 'mois' },
  },
  video: NO_UNIT,
  'retro-images': NO_UNIT,
  'renewal-6m': NO_UNIT,
  'onsite-media': NO_UNIT,
  'onsite-visit': NO_UNIT,
};

/* ── Formatting ──────────────────────────────────────────────────────────── */

const NBSP = ' ';

/**
 * "€ 1.234" from cents, for the Hungarian and Dutch screens that have always
 * used it. Pass the recipient's language to get that language's own style
 * ("€1,234" in English, "1.234 €" in German, "1 234 €" in French).
 */
export function formatCents(cents: number, locale?: Locale): string {
  if (locale === 'en' || locale === 'de' || locale === 'fr') return eurCents(cents, locale);
  return `€${NBSP}${(cents / 100).toLocaleString('de-DE', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ── Building an order ───────────────────────────────────────────────────── */

/**
 * What an admin can put on an order, with today's prices. Drives the review
 * screen's checkboxes; `minMonths` is surfaced so the form can enforce
 * FODEL's own three-month minimum on highlighting rather than reinventing it.
 */
export function catalogue(locale: OrderLocale, cat: ListingCatalog = listingCatalog()) {
  return {
    packages: cat.packages.map((pkg) => ({
      id: pkg.id,
      label: pkg.names[locale],
      priceEur: pkg.priceEur,
      priceEurAbove: pkg.priceEurAbove ?? undefined,
      thresholdHuf: pkg.thresholdHuf ?? undefined,
      months: pkg.months,
      video: pkg.video,
    })),
    extras: orderExtras(cat).map((extra) => ({
      id: extra.id,
      label: EXTRA_LABEL[extra.id]?.[locale] ?? extra.id,
      unit: EXTRA_UNIT[extra.id]?.[locale]?.one ?? '',
      priceEur: extra.priceEur,
      minMonths: 'minMonths' in extra ? extra.minMonths : undefined,
      exclusive: EXCLUSIVE.has(extra.id),
    })),
  };
}

export class OrderError extends Error {
  constructor(public code: 'unknown-package' | 'unknown-extra' | 'bad-quantity' | 'exclusive') {
    super(code);
  }
}

/**
 * Turns a selection of ids into stored order lines.
 *
 * Throws rather than silently skipping an unknown id: an order that quietly
 * drops a line the admin ticked is worse than one that refuses to save.
 */
export function buildOrderLines(selection: OrderSelection, locale: OrderLocale, cat: ListingCatalog = listingCatalog()): OrderLine[] {
  const pkg = cat.packages.find((p) => p.id === selection.packageId);
  if (!pkg) throw new OrderError('unknown-package');

  const packagePriceEur =
    pkg.priceEurAbove !== null && selection.aboveThreshold ? pkg.priceEurAbove : pkg.priceEur;

  const lines: OrderLine[] = [
    {
      kind: 'package',
      id: pkg.id,
      quantity: 1,
      unitCents: packagePriceEur * 100,
      label: pkg.names[locale],
    },
  ];

  if (selection.extras.filter((chosen) => EXCLUSIVE.has(chosen.id)).length > 1) {
    throw new OrderError('exclusive');
  }

  for (const chosen of selection.extras) {
    const extra = orderExtras(cat).find((e) => e.id === chosen.id);
    if (!extra) throw new OrderError('unknown-extra');

    const quantity = Math.floor(chosen.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 60) {
      throw new OrderError('bad-quantity');
    }

    const units = EXTRA_UNIT[extra.id]?.[locale];
    const base = EXTRA_LABEL[extra.id]?.[locale] ?? extra.id;
    const unit = quantity > 1 ? units?.many : units?.one;

    lines.push({
      kind: 'extra',
      id: extra.id,
      quantity,
      unitCents: extra.priceEur * 100,
      label: quantity > 1 && unit ? `${base}${locale === 'hu' || locale === 'nl' ? ' — ' : ': '}${quantity} ${unit}` : base,
    });
  }

  return lines;
}

export function orderTotalCents(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0);
}

/**
 * The referral programme's discount — 10% of the package line only, never
 * the extras. Deliberately NOT an `OrderLine`: Stripe rejects a negative
 * `unit_amount` with a 400 at the moment a seller clicks pay, so this is its
 * own `payments.discount_cents` column, applied at Checkout as a one-off
 * coupon (see src/pages/api/stripe/checkout.ts) and rendered as its own line
 * in the email and any future invoice.
 */
export const REFERRAL_DISCOUNT_PERCENT = 10;

export function referralDiscountCents(lines: OrderLine[]): number {
  const pkg = lines.find((line) => line.kind === 'package');
  if (!pkg) return 0;
  return Math.round((pkg.unitCents * pkg.quantity * REFERRAL_DISCOUNT_PERCENT) / 100);
}

/** Order lines shaped for the email templates' itemised table. */
export function linesForEmail(lines: OrderLine[], locale?: Locale): { label: string; amount: string }[] {
  return lines.map((line) => ({
    label: line.label,
    amount: formatCents(line.unitCents * line.quantity, locale),
  }));
}

/**
 * Whether a listing falls in the higher 12-month tier.
 *
 * Derived from the listing's own forint price against the published threshold,
 * so the admin never has to remember where the line sits — and so two admins
 * reviewing similar listings can't price them differently.
 */
export function isAboveThreshold(priceHuf: number, cat: ListingCatalog = listingCatalog(), packageId?: string): boolean {
  const tiered = packageId ? packageOf(cat, packageId) : cat.packages.find((p) => p.thresholdHuf !== null);
  return tiered ? tierApplies(tiered, priceHuf) : false;
}

/**
 * A default order for a listing that has just been approved.
 *
 * Pre-ticks what the listing itself already tells us — the package the owner
 * chose, one translation per non-Hungarian language they wrote, the video
 * extra if they supplied a URL, homepage highlighting if it is switched on.
 * The admin adjusts and confirms; this only saves them the typing, it never
 * charges anything on its own.
 */
export type SuggestInput = {
  package: string;
  price_huf: number;
  video_url: string | null;
  homepage_featured: boolean;
  featured: boolean;
  /** Locales the listing actually has text for. Hungarian is not an extra. */
  locales: string[];
  /** What the owner asked for when placing the ad (brief 3 item 14). */
  requested?: RequestedExtras;
};

export function suggestSelection(property: SuggestInput, cat: ListingCatalog = listingCatalog()): OrderSelection {
  const requested = property.requested ?? {};
  // Languages written, or asked to be translated — whichever is more; a
  // language counts once even when both apply.
  const languages = new Set([
    ...property.locales.filter((locale) => locale !== 'hu'),
    ...(requested.translations ?? []),
  ]);
  const extras: { id: string; quantity: number }[] = [];

  if (languages.size > 0) extras.push({ id: 'translation', quantity: languages.size });
  // A package with video included charges nothing for it; one without video offers none.
  if ((property.video_url || requested.video) && packageOf(cat, property.package).video === 'extra') extras.push({ id: 'video', quantity: 1 });
  // FODEL's own minimum for highlighting is three months.
  if (property.homepage_featured || requested.homepageHighlight) extras.push({ id: 'homepage-highlight', quantity: 3 });
  if (property.featured || requested.categoryHighlight) extras.push({ id: 'category-highlight', quantity: 3 });
  if (requested.service) extras.push({ id: requested.service, quantity: 1 });

  return {
    packageId: property.package,
    aboveThreshold: isAboveThreshold(property.price_huf, cat, property.package),
    extras,
  };
}
