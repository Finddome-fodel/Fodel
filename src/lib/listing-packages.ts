/**
 * The listing packages and extras, as the admin last set them.
 *
 * The quote asks for "Basic és Prémium hirdetési csomag; csomagonként eltérő
 * képszám, videó és adattartalom; … telefonszám megjelenítése a választott
 * csomag szerint; csomagok és díjak admin oldali kezelése". Everything an
 * admin can change about a package lives here, edited in Beállítások →
 * Szolgáltatások and stored in site_settings.services.listingPackages /
 * .listingExtras (plain JSON, no migration).
 *
 * Anything not set falls back to LISTING_PACKAGES / LISTING_EXTRAS in
 * src/config/company.ts — the published fodel.hu tariff — so nothing here
 * invents a number. The two package ids are fixed: listings and orders refer
 * to them.
 *
 * Orders stay denormalised (src/lib/orders.ts): a price change here affects
 * new orders only, never one already written.
 */
import { LISTING_PACKAGES, LISTING_EXTRAS } from '~/config/company';
import { listingRules, type PackageId } from '~/lib/listing-rules';
import { localizer, type L10n, type Locale } from '~/i18n/ui';
import { eur } from '~/lib/format';

/** How a package treats the owner's video: free with it, paid extra, or not offered. */
export type VideoMode = 'included' | 'extra' | 'none';
export const VIDEO_MODES: readonly VideoMode[] = ['included', 'extra', 'none'];

export type ListingPackage = {
  id: PackageId;
  /** hu and nl are editable in the admin; en, de and fr are the checked-in names from company.ts. */
  names: L10n;
  priceEur: number;
  /** The higher tier above `thresholdHuf`; null = one price for every listing. */
  priceEurAbove: number | null;
  thresholdHuf: number | null;
  months: number;
  /** null = unlimited. */
  maxImages: number | null;
  video: VideoMode;
  /** The seller's phone on the public page (also needs the seller's consent). */
  phone: boolean;
  editedImages: boolean;
  editedText: boolean;
  /** The card marked "Ajánlott" and preselected on the submit form. */
  recommended: boolean;
};

export type ExtraId = (typeof LISTING_EXTRAS)[number]['id'];

export type ListingExtra = {
  id: ExtraId;
  priceEur: number;
  unit: 'language' | 'month' | 'once';
  minMonths?: number;
};

export type ListingCatalog = { packages: ListingPackage[]; extras: ListingExtra[] };

export type StoredListingPackage = Partial<Omit<ListingPackage, 'id' | 'names'>> & { names?: Partial<Record<'hu' | 'nl', string>> };
export type StoredServices = {
  listingPackages?: Partial<Record<PackageId, StoredListingPackage>>;
  listingExtras?: Partial<Record<ExtraId, { priceEur?: number }>>;
  packagePhone?: unknown;
} | null | undefined;

export const PRICE_MAX = 10_000;
export const IMAGES_MAX = 200;

const num = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = Number(value);
  return value !== null && value !== '' && Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : fallback;
};
const bool = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

function defaults(): ListingPackage[] {
  return LISTING_PACKAGES.map((pkg) => ({
    id: pkg.id,
    names: { ...pkg.names },
    priceEur: pkg.priceEur,
    priceEurAbove: 'priceEurAbove' in pkg ? pkg.priceEurAbove : null,
    thresholdHuf: 'thresholdHuf' in pkg ? pkg.thresholdHuf : null,
    months: pkg.months,
    maxImages: 20,
    // Today both packages charge the €36 video extra — the published tariff.
    video: 'extra',
    phone: false,
    editedImages: pkg.editedImages,
    editedText: pkg.editedText,
    recommended: pkg.id === 'normal-12m',
  }));
}

/** Stored settings (any shape, possibly missing) → a complete, sane catalogue. */
export function listingCatalog(services?: StoredServices): ListingCatalog {
  const phone = listingRules(services as any).packagePhone;
  const packages = defaults().map((base): ListingPackage => {
    const s = services?.listingPackages?.[base.id] ?? {};
    return {
      id: base.id,
      names: { ...base.names, hu: s.names?.hu?.trim() || base.names.hu, nl: s.names?.nl?.trim() || base.names.nl },
      priceEur: num(s.priceEur, base.priceEur, 0, PRICE_MAX),
      priceEurAbove: 'priceEurAbove' in s ? (s.priceEurAbove == null ? null : num(s.priceEurAbove, base.priceEurAbove ?? 0, 0, PRICE_MAX)) : base.priceEurAbove,
      thresholdHuf: 'thresholdHuf' in s ? (s.thresholdHuf == null ? null : num(s.thresholdHuf, base.thresholdHuf ?? 0, 1, 100_000_000_000)) : base.thresholdHuf,
      months: num(s.months, base.months, 1, 36),
      maxImages: 20,
      video: VIDEO_MODES.includes(s.video as VideoMode) ? (s.video as VideoMode) : base.video,
      phone: phone[base.id],
      editedImages: bool(s.editedImages, base.editedImages),
      editedText: bool(s.editedText, base.editedText),
      recommended: bool(s.recommended, base.recommended),
    };
  });
  // Exactly one card is recommended.
  if (packages.filter((p) => p.recommended).length !== 1) {
    packages.forEach((p, i) => (p.recommended = i === packages.length - 1));
  }
  const extras = LISTING_EXTRAS.map((extra): ListingExtra => ({
    id: extra.id,
    priceEur: num(services?.listingExtras?.[extra.id]?.priceEur, extra.priceEur, 0, PRICE_MAX),
    unit: extra.unit,
    ...('minMonths' in extra ? { minMonths: extra.minMonths } : {}),
  }));
  return { packages, extras };
}

export function packageOf(catalog: ListingCatalog, id: string | null | undefined): ListingPackage {
  return catalog.packages.find((p) => p.id === id) ?? catalog.packages[0];
}

export function extraPrice(catalog: ListingCatalog, id: ExtraId): number {
  return catalog.extras.find((e) => e.id === id)?.priceEur ?? 0;
}

/** Whether the listing's own forint price puts it in the higher tier. */
export function isAboveThreshold(pkg: ListingPackage, priceHuf: number): boolean {
  return pkg.priceEurAbove !== null && pkg.thresholdHuf !== null && priceHuf > pkg.thresholdHuf;
}

/* ── Public wording ────────────────────────────────────────────────────── */

/** "69 €" in Hungarian, "€ 69" in Dutch, then each language's own house style. */
export const eurText = (locale: Locale, n: number) =>
  locale === 'hu' ? `${n}\u00a0€` : locale === 'nl' ? `€\u00a0${n}` : eur(n, locale);
const million = (huf: number) => Math.round(huf / 1_000_000).toLocaleString('hu-HU');

/**
 * What a package card says — price, duration and the feature list, all
 * derived from the settings so the cards can never disagree with checkout.
 */
export function packageCard(pkg: ListingPackage, catalog: ListingCatalog, locale: Locale, opts: { withExtras?: boolean } = {}) {
  const x = localizer(locale);
  const video = extraPrice(catalog, 'video');
  const translation = extraPrice(catalog, 'translation');
  const features = [
    pkg.maxImages === null
      ? x('Korlátlan számú kép', 'Onbeperkt aantal foto’s', 'Unlimited number of photos', 'Unbegrenzte Anzahl Fotos', 'Nombre de photos illimité')
      : x(`Legfeljebb ${pkg.maxImages} kép`, `Maximaal ${pkg.maxImages} foto’s`, `Up to ${pkg.maxImages} photos`, `Bis zu ${pkg.maxImages} Fotos`, `Jusqu’à ${pkg.maxImages} photos`),
    pkg.editedImages
      ? x('A képeket szakszerűen feldolgozzuk', 'Foto’s worden professioneel bewerkt', 'Photos are professionally edited', 'Fotos werden professionell bearbeitet', 'Les photos sont retouchées par des professionnels')
      : x('A képek az eredeti állapotban jelennek meg', 'Foto’s worden ongewijzigd geplaatst', 'Photos appear as supplied', 'Fotos erscheinen unverändert', 'Les photos sont publiées telles quelles'),
    pkg.editedText
      ? x('A szöveget szakszerűen megszerkesztjük', 'Tekst wordt professioneel geredigeerd', 'The text is professionally edited', 'Der Text wird professionell redigiert', 'Le texte est rédigé et relu par des professionnels')
      : x('A szöveg a beküldött formában jelenik meg', 'Tekst wordt geplaatst zoals aangeleverd', 'The text appears as supplied', 'Der Text erscheint wie eingereicht', 'Le texte est publié tel que fourni'),
    pkg.video === 'included'
      ? x('Videós bemutató a csomag része', 'Video inbegrepen', 'Video included', 'Video inbegriffen', 'Vidéo incluse')
      : pkg.video === 'extra'
        ? x(
            `Videós bemutató külön kérhető (${eurText(locale, video)})`,
            `Video als extra (${eurText(locale, video)})`,
            `Video available as an extra (${eurText(locale, video)})`,
            `Video als Zusatzleistung (${eurText(locale, video)})`,
            `Vidéo en option (${eurText(locale, video)})`
          )
        : null,
    pkg.phone
      ? x('Az Ön telefonszáma megjelenhet a hirdetésben', 'Uw telefoonnummer kan bij de advertentie staan', 'Your phone number can appear with the listing', 'Ihre Telefonnummer kann beim Inserat stehen', 'Votre numéro de téléphone peut figurer dans l’annonce')
      : x('Az érdeklődők a FODEL-en keresztül érik el', 'Geïnteresseerden bereiken u via FODEL', 'Interested buyers reach you through FODEL', 'Interessenten erreichen Sie über FODEL', 'Les personnes intéressées vous joignent par FODEL'),
    ...(opts.withExtras
      ? [
          x(
            `Igény szerint idegen nyelvű fordítás (${translation} €/nyelv)`,
            `Vertaling op verzoek (€ ${translation} per taal)`,
            `Translation on request (${eurText(locale, translation)} per language)`,
            `Übersetzung auf Wunsch (${eurText(locale, translation)} pro Sprache)`,
            `Traduction sur demande (${eurText(locale, translation)} par langue)`
          ),
          x('Kiemelés külön kérhető', 'Uitlichten op verzoek', 'Highlighting on request', 'Hervorhebung auf Wunsch', 'Mise en avant sur demande'),
        ]
      : []),
  ].filter((line): line is string => Boolean(line));
  const months = pkg.months;
  return {
    id: pkg.id,
    name: pkg.names[locale],
    priceCents: pkg.priceEur * 100,
    price: eurText(locale, pkg.priceEur),
    ...(pkg.priceEurAbove !== null && pkg.thresholdHuf !== null
      ? {
          priceAlt: eurText(locale, pkg.priceEurAbove),
          priceAltNote: x(
            `${million(pkg.thresholdHuf)} millió Ft feletti ingatlan esetén`,
            `bij een vraagprijs boven ${million(pkg.thresholdHuf)} miljoen HUF`,
            `for a property priced above HUF ${million(pkg.thresholdHuf)} million`,
            `bei Immobilien über ${million(pkg.thresholdHuf)} Mio. HUF`,
            `pour un bien de plus de ${million(pkg.thresholdHuf)} millions de HUF`
          ),
        }
      : {}),
    duration: x(
      `${months} hónap`,
      `${months} ${months === 1 ? 'maand' : 'maanden'}`,
      `${months} ${months === 1 ? 'month' : 'months'}`,
      `${months} ${months === 1 ? 'Monat' : 'Monate'}`,
      `${months} mois`
    ),
    featured: pkg.recommended,
    features,
  };
}

/** The lowest package price and the price range, for headlines and meta descriptions. */
export function priceFacts(catalog: ListingCatalog) {
  const prices = catalog.packages.map((p) => p.priceEur);
  return { from: Math.min(...prices) };
}
