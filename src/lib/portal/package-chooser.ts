/**
 * The package chooser (Basic / Europe / World × 1, 3, 6 months): everything the page shows, worked out on the server
 * from the catalogue, so the markup works with JavaScript off and the script only switches between numbers that are
 * already there.
 *
 * Prices come from `priceFor()` only (integer cents); the forint hint is information (`formatHufHint`) and nothing here
 * is ever used to compute what is charged. The browser gets the same cents table and picks the band with the same
 * `tierIndexFor`, so a price typed in the next step moves the numbers exactly as checkout will.
 */
import type { ListingCatalog } from '../listing-packages.ts';
import { sellingPackages } from '../listing-packages.ts';
import { priceFor, tierIndexFor, tierLabel, isPackageKey, type PackageKey } from '../listing-pricing.ts';
import { eurPrice, huf as hufText } from '../format.ts';
import { formatHufHint, fxFootnote, type FxRate } from '../fx.ts';
import { packageLocales, packageById } from '../translation-packages.ts';

export type ChooserLang = 'hu' | 'nl' | 'en';

export type ChooserCopy = {
  legend: string;
  intro: string;
  termLegend: string;
  months: (n: number) => string;
  recommended: string;
  languages: (n: number) => string;
  showLanguages: string;
  original: string;
  fineTitle: string;
  fineLead: string;
  excludedBadge: string;
  lockedTip: string;
  priceUnchanged: string;
  /** "A kiválasztott csomag: World, 6 hónap" – the summary line under the cards. */
  summary: (name: string, months: number) => string;
  /** "Az ár az ingatlan értékétől függ: 25–100 millió Ft (az Ön ingatlana: 48 000 000 Ft)." */
  bandWithPrice: (band: string, price: string) => string;
  bandNoPrice: string;
  categoryTermNote: string;
};

export const CHOOSER_COPY: Record<ChooserLang, ChooserCopy> = {
  hu: {
    legend: 'Hirdetési csomag',
    intro: 'Válassza ki, hány hónapig és hány nyelven jelenjen meg a hirdetése. Az eredeti nyelven, angolul és németül minden csomagban megjelenik.',
    termLegend: 'Időtartam',
    months: (n) => `${n} hónap`,
    recommended: 'Ajánlott',
    languages: (n) => `${n} nyelv`,
    showLanguages: 'Nyelvek',
    original: 'Eredeti nyelv',
    fineTitle: 'Finomhangolás',
    fineLead: 'Kapcsolja ki azokat a nyelveket, amelyeken nem szeretné megjeleníteni a hirdetését. Az angol mindig bekapcsolva marad.',
    excludedBadge: 'Kizárva',
    lockedTip: 'Az angol kötelező, ez a tartalék nyelv.',
    priceUnchanged: 'A csomag ára nem változik, ha egyes nyelveket kikapcsol.',
    summary: (name, months) => `A kiválasztott csomag: ${name}, ${months} hónap`,
    bandWithPrice: (band, price) => `Az ár az ingatlan értékétől függ: ${band} (az Ön ingatlana: ${price}).`,
    bandNoPrice: 'Az ár az ingatlan értékétől függ. Az ingatlan árát a következő lépésben adja meg; addig a legalacsonyabb értékhatár árait látja.',
    categoryTermNote: 'A kategóriában való kiemelés legalább 3 hónapos csomaggal rendelhető.',
  },
  nl: {
    legend: 'Advertentiepakket',
    intro: 'Kies hoeveel maanden en in hoeveel talen uw advertentie verschijnt. In de oorspronkelijke taal, in het Engels en in het Duits staat hij altijd.',
    termLegend: 'Looptijd',
    months: (n) => (n === 1 ? '1 maand' : `${n} maanden`),
    recommended: 'Aanbevolen',
    languages: (n) => `${n} talen`,
    showLanguages: 'Talen',
    original: 'Oorspronkelijke taal',
    fineTitle: 'Fijn afstellen',
    fineLead: 'Zet de talen uit waarin u uw advertentie niet wilt tonen. Engels blijft altijd aan.',
    excludedBadge: 'Uitgesloten',
    lockedTip: 'Engels is verplicht, het is de terugvaltaal.',
    priceUnchanged: 'De prijs van het pakket blijft gelijk als u talen uitzet.',
    summary: (name, months) => `Gekozen pakket: ${name}, ${months === 1 ? '1 maand' : `${months} maanden`}`,
    bandWithPrice: (band, price) => `De prijs hangt af van de waarde van het pand: ${band} (uw pand: ${price}).`,
    bandNoPrice: 'De prijs hangt af van de waarde van het pand. U vult de vraagprijs in de volgende stap in; tot dan ziet u de prijzen van de laagste waardeklasse.',
    categoryTermNote: 'Uitlichting in de categorie kan bij een pakket van minstens 3 maanden.',
  },
  en: {
    legend: 'Listing package',
    intro: 'Choose how many months and in how many languages your listing appears. It is always shown in its original language, in English and in German.',
    termLegend: 'Duration',
    months: (n) => (n === 1 ? '1 month' : `${n} months`),
    recommended: 'Recommended',
    languages: (n) => (n === 1 ? '1 language' : `${n} languages`),
    showLanguages: 'Languages',
    original: 'Original language',
    fineTitle: 'Fine-tune',
    fineLead: 'Switch off any language you do not want your listing to appear in. English always stays on.',
    excludedBadge: 'Excluded',
    lockedTip: 'English is required, it is the fallback language.',
    priceUnchanged: 'The package price stays the same if you switch some languages off.',
    summary: (name, months) => `Selected package: ${name}, ${months === 1 ? '1 month' : `${months} months`}`,
    bandWithPrice: (band, price) => `The price depends on the value of the property: ${band} (your property: ${price}).`,
    bandNoPrice: 'The price depends on the value of the property. You enter the property price in the next step; until then you see the prices of the lowest value band.',
    categoryTermNote: 'A highlight in the category can be ordered with a package of at least 3 months.',
  },
};

export type ChooserPrice = { cents: number; eur: string; huf: string };
export type ChooserPackage = {
  id: PackageKey;
  name: string;
  recommended: boolean;
  /** Every language the package publishes the listing in, the original first, in the order of the site. */
  languages: string[];
  /** Per term: the price in the band that applies to this property now. */
  prices: Record<number, ChooserPrice>;
};

export type ChooserModel = {
  durations: number[];
  months: number;
  packageId: PackageKey;
  tierIndex: number;
  hasPrice: boolean;
  bandText: string;
  footnote: string;
  packages: ChooserPackage[];
  /** What the script needs to follow a price typed in the next step: cents only, never a forint figure. */
  client: {
    bounds: (number | null)[];
    durations: number[];
    prices: Record<string, Record<number, Record<number, number>>>;
    bandLabels: string[];
    rate: number | null;
    lang: ChooserLang;
    sourceLocale: string;
    languages: Record<string, string[]>;
    names: Record<string, string>;
    packageNames: Record<string, string>;
    /** Sentences with markers the script fills in (functions never travel to the browser). */
    copy: { summaries: Record<number, string>; lines: Record<number, string>; bandWithPrice: string; bandNoPrice: string; excluded: string; original: string; locked: string };
  };
};

/**
 * What the owner may switch off, from a posted list: only languages the chosen package really publishes, never English
 * and never the original (a forged request is trimmed, not trusted; the review and the order refuse the rest again).
 */
export function chosenExclusions(asked: readonly string[], packageId: string, catalog: Pick<ListingCatalog, 'translation'>, sourceLocale: string, targets: readonly string[]): string[] {
  const covered = new Set(packageLocales(packageById(catalog.translation, packageId), targets));
  return [...new Set(asked.map((code) => String(code).trim().toLowerCase()))].filter((code) => covered.has(code) && code !== 'en' && code !== sourceLocale);
}

const lastOf = <T>(list: T[]): T => list[list.length - 1];

/**
 * The chooser's view of the catalogue for one property. Null before the pricing migrations (`pricingLive`): the page
 * then shows the two older packages exactly as it always did.
 */
export function chooserModel(input: {
  catalog: ListingCatalog;
  lang: ChooserLang;
  priceHuf: number | null | undefined;
  packageId?: string | null;
  months?: number | null;
  fx: FxRate | null;
  sourceLocale: string;
  targets: readonly string[];
  names: (code: string) => string;
}): ChooserModel | null {
  const { catalog, lang, fx, sourceLocale, targets } = input;
  if (!catalog.pricingLive) return null;
  const pricing = catalog.pricing;
  const selling = sellingPackages(catalog).filter((pkg) => isPackageKey(pkg.id));
  if (selling.length === 0) return null;

  const durations = [...pricing.durations].sort((a, b) => a - b);
  // The longest term unless the owner chose another one: the same default the review screen suggests.
  const months = input.months && durations.includes(input.months) ? input.months : lastOf(durations);
  const wanted = selling.find((pkg) => pkg.id === input.packageId);
  const selected = (wanted ?? selling.find((pkg) => pkg.recommended) ?? selling[0]).id as PackageKey;

  const hasPrice = typeof input.priceHuf === 'number' && input.priceHuf > 0;
  const tierIndex = tierIndexFor(pricing, hasPrice ? input.priceHuf : null);

  const packages = selling.map((pkg): ChooserPackage => {
    const key = pkg.id as PackageKey;
    const covered = packageLocales(packageById(catalog.translation, key), targets).filter((code) => code !== sourceLocale);
    const prices: Record<number, ChooserPrice> = {};
    for (const term of durations) {
      const price = priceFor({ packageId: key, months: term, tierIndex, pricing });
      if (price) prices[term] = { cents: price.cents, eur: eurPrice(price.cents, lang), huf: formatHufHint(price.cents, fx, lang) };
    }
    return {
      id: key,
      name: lang === 'hu' ? pkg.names.hu : pkg.names.en,
      recommended: pkg.recommended,
      languages: [sourceLocale, ...covered],
      prices,
    };
  }).filter((pkg) => Object.keys(pkg.prices).length > 0);
  if (packages.length === 0) return null;

  const copy = CHOOSER_COPY[lang];
  const band = tierLabel(pricing.valueTiers, tierIndex, lang, (n) => hufText(n, 'hu'));
  const bandText = hasPrice ? copy.bandWithPrice(band, hufText(input.priceHuf!, 'hu')) : copy.bandNoPrice;

  return {
    durations,
    months,
    packageId: packages.some((pkg) => pkg.id === selected) ? selected : packages[0].id,
    tierIndex,
    hasPrice,
    bandText,
    footnote: fx ? fxFootnote(fx, lang) : '',
    packages,
    client: {
      bounds: pricing.valueTiers.map((tier) => tier.upToHuf),
      durations,
      prices: Object.fromEntries(packages.map((pkg) => [pkg.id, pricing.prices[pkg.id]])),
      bandLabels: pricing.valueTiers.map((_, index) => tierLabel(pricing.valueTiers, index, lang, (n) => hufText(n, 'hu'))),
      rate: fx ? fx.rate : null,
      lang,
      sourceLocale,
      languages: Object.fromEntries(packages.map((pkg) => [pkg.id, pkg.languages])),
      names: Object.fromEntries([...new Set(packages.flatMap((pkg) => pkg.languages))].map((code) => [code, input.names(code)])),
      packageNames: Object.fromEntries(packages.map((pkg) => [pkg.id, pkg.name])),
      copy: {
        summaries: Object.fromEntries(durations.map((n) => [n, copy.summary('@NAME', n)])),
        lines: Object.fromEntries(durations.map((n) => [n, `@NAME, ${copy.months(n)}`])),
        bandWithPrice: copy.bandWithPrice('@BAND', '@PRICE'),
        bandNoPrice: copy.bandNoPrice,
        excluded: copy.excludedBadge,
        original: copy.original,
        locked: copy.lockedTip,
      },
    },
  };
}

export type UpgradeCopy = {
  title: string;
  lead: string;
  action: string;
  paying: string;
  error: string;
  difference: string;
  expiry: string;
};

/** The owner's "move to a bigger package" panel: what it costs is the difference, the expiry does not move. */
export const UPGRADE_COPY: Record<ChooserLang, UpgradeCopy> = {
  hu: {
    title: 'Váltás nagyobb csomagra',
    lead: 'Több nyelven is megjelenhet a hirdetése. Csak a két csomag árának különbözetét fizeti: az eredetileg megvásárolt időtartam és értékhatár szerint számolunk.',
    action: 'Váltás',
    paying: 'Átirányítjuk a fizetéshez…',
    error: 'A váltást most nem sikerült elindítani. Kérjük, próbálja újra később.',
    difference: 'különbözet',
    expiry: 'A hirdetés lejárata nem változik.',
  },
  nl: {
    title: 'Overstappen op een groter pakket',
    lead: 'Uw advertentie kan in meer talen verschijnen. U betaalt alleen het verschil tussen de twee pakketten, voor de oorspronkelijke looptijd en waardeklasse.',
    action: 'Overstappen',
    paying: 'U wordt doorgestuurd naar de betaling…',
    error: 'Overstappen lukt nu niet. Probeer het later opnieuw.',
    difference: 'verschil',
    expiry: 'De einddatum van de advertentie verandert niet.',
  },
  en: {
    title: 'Move to a bigger package',
    lead: 'Your listing can appear in more languages. You only pay the difference between the two packages, for the term and value band originally bought.',
    action: 'Upgrade',
    paying: 'Taking you to payment…',
    error: 'The upgrade could not be started now. Please try again later.',
    difference: 'difference',
    expiry: 'The listing’s expiry date does not change.',
  },
};
