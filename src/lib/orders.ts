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
import { pluralForm } from '~/i18n/plural';
import { ONSITE_SERVICES } from '~/config/company';
import type { Locale } from '~/i18n/ui';
import { eurCents, intlTag } from '~/lib/format';
import type { RequestedExtras } from '~/lib/portal/requested-extras';
import { OWNER_TARGETS } from '~/lib/ai/translate-core';
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
  /** Translation lines only: the languages bought, so paying is enough to know what to translate. */
  locales?: string[];
};

/** What the admin's review form sends: ids and counts, never money. */
export type OrderSelection = {
  packageId: string;
  /** The €179 tier applies above 150M HUF — decided from the listing, not typed in. */
  aboveThreshold?: boolean;
  extras: { id: string; quantity: number; /** Translation: the languages. The quantity is then their count. */ locales?: string[] }[];
};

/* ── Labels ──────────────────────────────────────────────────────────────── */
// The public price list (src/components/pages/PriceListPage.astro) writes its
// own marketing copy for these. These are the invoice wordings — shorter,
// literal, and safe to sit on a payment record for years.


const EXTRA_LABEL: Record<string, Record<OrderLocale, string>> = {
  translation: { hu: 'Fordítás', nl: 'Vertaling', en: 'Translation', de: 'Übersetzung', fr: 'Traduction', es: 'Traducción', pl: 'Tłumaczenie', ro: 'Traducere', sk: 'Preklad', it: 'Traduzione', pt: 'Tradução', el: 'Μετάφραση', cs: 'Překlad', sl: 'Prevod', sv: 'Översättning', da: 'Oversættelse', no: 'Oversettelse', fi: 'Käännös', et: 'Tõlge', lv: 'Tulkojums', lt: 'Vertimas' },
  'category-highlight': { hu: 'Kiemelés a kategóriában', nl: 'Uitgelicht in de categorie', en: 'Highlighting in the category', de: 'Hervorhebung in der Kategorie', fr: 'Mise en avant dans la catégorie', es: 'Destacado en la categoría', pl: 'Wyróżnienie w kategorii', ro: 'Evidențiere în categorie', sk: 'Zvýraznenie v kategórii', it: 'Messa in evidenza nella categoria', pt: 'Destaque na categoria', el: 'Προβολή στην κατηγορία', cs: 'Zvýraznění v kategorii', sl: 'Izpostavitev v kategoriji', sv: 'Framhävning i kategorin', da: 'Fremhævning i kategorien', no: 'Fremheving i kategorien', fi: 'Korostus kategoriassa', et: 'Esiletõstmine kategoorias', lv: 'Izcelšana kategorijā', lt: 'Išskyrimas kategorijoje' },
  'homepage-highlight': { hu: 'Kiemelés a főoldalon', nl: 'Uitgelicht op de homepage', en: 'Highlighting on the homepage', de: 'Hervorhebung auf der Startseite', fr: 'Mise en avant sur la page d’accueil', es: 'Destacado en la página de inicio', pl: 'Wyróżnienie na stronie głównej', ro: 'Evidențiere pe prima pagină', sk: 'Zvýraznenie na úvodnej stránke', it: 'Messa in evidenza in homepage', pt: 'Destaque na página inicial', el: 'Προβολή στην αρχική σελίδα', cs: 'Zvýraznění na úvodní stránce', sl: 'Izpostavitev na domači strani', sv: 'Framhävning på startsidan', da: 'Fremhævning på forsiden', no: 'Fremheving på forsiden', fi: 'Korostus etusivulla', et: 'Esiletõstmine avalehel', lv: 'Izcelšana sākumlapā', lt: 'Išskyrimas pagrindiniame puslapyje' },
  video: { hu: 'Videós bemutató', nl: 'Videopresentatie', en: 'Video presentation', de: 'Videopräsentation', fr: 'Présentation vidéo', es: 'Presentación en vídeo', pl: 'Prezentacja wideo', ro: 'Prezentare video', sk: 'Videoprezentácia', it: 'Presentazione video', pt: 'Apresentação em vídeo', el: 'Παρουσίαση με βίντεο', cs: 'Videoprezentace', sl: 'Video predstavitev', sv: 'Videopresentation', da: 'Videopræsentation', no: 'Videopresentasjon', fi: 'Videoesittely', et: 'Videotutvustus', lv: 'Video prezentācija', lt: 'Vaizdo pristatymas' },
  'retro-images': { hu: 'Fotóretusálás', nl: 'Fotobewerking', en: 'Photo editing', de: 'Bildbearbeitung', fr: 'Retouche photo', es: 'Retoque fotográfico', pl: 'Retusz zdjęć', ro: 'Retușare foto', sk: 'Úprava fotografií', it: 'Elaborazione delle foto', pt: 'Edição de fotografias', el: 'Επεξεργασία φωτογραφιών', cs: 'Úprava fotografií', sl: 'Obdelava fotografij', sv: 'Bildredigering', da: 'Billedredigering', no: 'Bilderedigering', fi: 'Kuvankäsittely', et: 'Fotode töötlemine', lv: 'Fotoattēlu apstrāde', lt: 'Nuotraukų apdorojimas' },
  'renewal-6m': { hu: 'Hosszabbítás — 6 hónap', nl: 'Verlenging — 6 maanden', en: 'Renewal, 6 months', de: 'Verlängerung, 6 Monate', fr: 'Prolongation, 6 mois', es: 'Prórroga, 6 meses', pl: 'Przedłużenie, 6 miesięcy', ro: 'Prelungire, 6 luni', sk: 'Predĺženie, 6 mesiacov', it: 'Rinnovo, 6 mesi', pt: 'Renovação, 6 meses', el: 'Ανανέωση, 6 μήνες', cs: 'Obnovení, 6 měsíců', sl: 'Podaljšanje, 6 mesecev', sv: 'Förnyelse, 6 månader', da: 'Fornyelse, 6 måneder', no: 'Fornyelse, 6 måneder', fi: 'Uusiminen, 6 kuukautta', et: 'Uuendamine, 6 kuud', lv: 'Atjaunošana, 6 mēneši', lt: 'Atnaujinimas, 6 mėnesiai' },
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
  es: { one: '', many: '' },
  pl: { one: '', many: '' },
  ro: { one: '', many: '' },
  sk: { one: '', many: '' },
  it: { one: '', many: '' },
  pt: { one: '', many: '' },
  el: { one: '', many: '' },
  cs: { one: '', many: '' },
  sl: { one: '', many: '' },
  sv: { one: '', many: '' },
  da: { one: '', many: '' },
  no: { one: '', many: '' },
  fi: { one: '', many: '' },
  et: { one: '', many: '' },
  lv: { one: '', many: '' },
  lt: { one: '', many: '' },
};
/** `few` is the Slavic/Romanian 2–4 (or 2–19) form; `Intl.PluralRules` picks it. */
const EXTRA_UNIT: Record<string, Record<OrderLocale, { one: string; two?: string; few?: string; many: string }>> = {
  translation: {
    hu: { one: 'nyelv', many: 'nyelv' },
    nl: { one: 'taal', many: 'talen' },
    en: { one: 'language', many: 'languages' },
    de: { one: 'Sprache', many: 'Sprachen' },
    fr: { one: 'langue', many: 'langues' },
    es: { one: 'idioma', many: 'idiomas' },
    pl: { one: 'język', few: 'języki', many: 'języków' },
    ro: { one: 'limbă', few: 'limbi', many: 'de limbi' },
    sk: { one: 'jazyk', few: 'jazyky', many: 'jazykov' },
    it: { one: 'lingua', many: 'lingue' },
    pt: { one: 'língua', many: 'línguas' },
    el: { one: 'γλώσσα', many: 'γλώσσες' },
    cs: { one: 'jazyk', few: 'jazyky', many: 'jazyků' },
    sl: { one: 'jezik', two: 'jezika', few: 'jeziki', many: 'jezikov' },
    sv: { one: 'språk', many: 'språk' },
    da: { one: 'sprog', many: 'sprog' },
    no: { one: 'språk', many: 'språk' },
    fi: { one: 'kieli', many: 'kieltä' },
    et: { one: 'keel', many: 'keelt' },
    lv: { one: 'valoda', few: 'valodas', many: 'valodu' },
    lt: { one: 'kalba', few: 'kalbos', many: 'kalbų' },
  },
  'category-highlight': {
    hu: { one: 'hónap', many: 'hónap' },
    nl: { one: 'maand', many: 'maanden' },
    en: { one: 'month', many: 'months' },
    de: { one: 'Monat', many: 'Monate' },
    fr: { one: 'mois', many: 'mois' },
    es: { one: 'mes', many: 'meses' },
    pl: { one: 'miesiąc', few: 'miesiące', many: 'miesięcy' },
    ro: { one: 'lună', few: 'luni', many: 'de luni' },
    sk: { one: 'mesiac', few: 'mesiace', many: 'mesiacov' },
    it: { one: 'mese', many: 'mesi' },
    pt: { one: 'mês', many: 'meses' },
    el: { one: 'μήνας', many: 'μήνες' },
    cs: { one: 'měsíc', few: 'měsíce', many: 'měsíců' },
    sl: { one: 'mesec', two: 'meseca', few: 'meseci', many: 'mesecev' },
    sv: { one: 'månad', many: 'månader' },
    da: { one: 'måned', many: 'måneder' },
    no: { one: 'måned', many: 'måneder' },
    fi: { one: 'kuukausi', many: 'kuukautta' },
    et: { one: 'kuu', many: 'kuud' },
    lv: { one: 'mēnesis', few: 'mēneši', many: 'mēnešu' },
    lt: { one: 'mėnuo', few: 'mėnesiai', many: 'mėnesių' },
  },
  'homepage-highlight': {
    hu: { one: 'hónap', many: 'hónap' },
    nl: { one: 'maand', many: 'maanden' },
    en: { one: 'month', many: 'months' },
    de: { one: 'Monat', many: 'Monate' },
    fr: { one: 'mois', many: 'mois' },
    es: { one: 'mes', many: 'meses' },
    pl: { one: 'miesiąc', few: 'miesiące', many: 'miesięcy' },
    ro: { one: 'lună', few: 'luni', many: 'de luni' },
    sk: { one: 'mesiac', few: 'mesiace', many: 'mesiacov' },
    it: { one: 'mese', many: 'mesi' },
    pt: { one: 'mês', many: 'meses' },
    el: { one: 'μήνας', many: 'μήνες' },
    cs: { one: 'měsíc', few: 'měsíce', many: 'měsíců' },
    sl: { one: 'mesec', two: 'meseca', few: 'meseci', many: 'mesecev' },
    sv: { one: 'månad', many: 'månader' },
    da: { one: 'måned', many: 'måneder' },
    no: { one: 'måned', many: 'måneder' },
    fi: { one: 'kuukausi', many: 'kuukautta' },
    et: { one: 'kuu', many: 'kuud' },
    lv: { one: 'mēnesis', few: 'mēneši', many: 'mēnešu' },
    lt: { one: 'mėnuo', few: 'mėnesiai', many: 'mėnesių' },
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
  if (locale && locale !== 'hu' && locale !== 'nl') return eurCents(cents, locale);
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
  code: 'unknown-package' | 'unknown-extra' | 'bad-quantity' | 'exclusive' | 'bad-locale';
  constructor(code: 'unknown-package' | 'unknown-extra' | 'bad-quantity' | 'exclusive' | 'bad-locale') {
    super(code);
    this.code = code;
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

    // A translation line that names its languages is priced by their count and
    // remembers them: that list, read back from the stored order, is what the
    // AI translates after payment (never anything in a later request).
    let locales: string[] | undefined;
    if (extra.id === 'translation' && chosen.locales !== undefined) {
      locales = [...new Set(chosen.locales)];
      if (locales.length === 0 || locales.some((code) => !(OWNER_TARGETS as readonly string[]).includes(code))) throw new OrderError('bad-locale');
    }
    const quantity = locales ? locales.length : Math.floor(chosen.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 60) {
      throw new OrderError('bad-quantity');
    }

    const units = EXTRA_UNIT[extra.id]?.[locale];
    const base = EXTRA_LABEL[extra.id]?.[locale] ?? extra.id;
    const form = pluralForm(intlTag(locale), quantity);
    const unit =
      form === 'one' ? units?.one : form === 'two' ? (units?.two ?? units?.few ?? units?.many) : form === 'few' ? (units?.few ?? units?.many) : units?.many;

    lines.push({
      kind: 'extra',
      id: extra.id,
      quantity,
      unitCents: extra.priceEur * 100,
      label: quantity > 1 && unit ? `${base}${locale === 'hu' || locale === 'nl' ? ' — ' : ': '}${quantity} ${unit}` : base,
      ...(locales ? { locales } : {}),
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
 * chose, the languages they asked to have translated, the video
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
  // The languages the owner asked to have translated. A language the listing
  // already has text in (written by the owner, or translated before) is not
  // sold again; the AI translates only what is missing.
  const languages = [...new Set(requested.translations ?? [])].filter((locale) => locale !== 'hu' && !property.locales.includes(locale));
  const extras: { id: string; quantity: number; locales?: string[] }[] = [];

  if (languages.length > 0) extras.push({ id: 'translation', quantity: languages.length, locales: languages });
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
