/**
 * Translation packages: which languages a listing is published in, and what that costs. Pure: no database,
 * no `~/` imports, so scripts/test-rules.mjs loads it directly. The defaults live in src/config/company.ts
 * (TRANSLATION_PACKAGES) and are merged with what an admin saved (site_settings.services.translationPackages)
 * by listingCatalog().
 *
 * Packages are RULES, not lists: Go is the original language plus English and German, Európa is every
 * language except the World-only ones, World is every language. A language added to the site joins Európa
 * or World by itself. English is mandatory in every package and can never be excluded.
 */

export type TranslationPackageId = 'go' | 'europe' | 'world';
export const TRANSLATION_PACKAGE_IDS: readonly TranslationPackageId[] = ['go', 'europe', 'world'];

export type PackageRule = { include?: string[]; excludeFromAll?: string[] };
type Words = { hu: string; en: string; nl: string };

export type TranslationPackage = {
  id: TranslationPackageId;
  priceEur: number;
  rule: PackageRule;
  /** An admin's hand-made list; when set it replaces the rule. English is added anyway. */
  locales?: string[];
  names: Words;
  pitch: Words;
  badge: Words;
  recommended: boolean;
  active: boolean;
};

export type TranslationPricing = {
  packages: TranslationPackage[];
  singleEur: { european: number; world: number };
  worldOnly: string[];
};

/** English is the fallback text of every other language, so it is always there. */
export const MANDATORY_LOCALES: readonly string[] = ['en'];

const PRICE_MAX = 10_000;
const num = (value: unknown, fallback: number, min = 0, max = PRICE_MAX): number => {
  const n = Number(value);
  return value !== null && value !== '' && value !== undefined && Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 100) / 100 : fallback;
};
const text = (value: unknown, fallback: string, max = 600): string => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback);
const words = (value: any, fallback: Words, max = 600): Words => ({ hu: text(value?.hu, fallback.hu, max), en: text(value?.en, fallback.en, max), nl: text(value?.nl, fallback.nl, max) });
/** A badge may be left empty on purpose (no badge); only a missing value falls back to the default. */
const badgeWords = (value: any, fallback: Words): Words => {
  const one = (given: unknown, base: string) => (typeof given === 'string' ? given.trim().slice(0, 40) : base);
  return { hu: one(value?.hu, fallback.hu), en: one(value?.en, fallback.en), nl: one(value?.nl, fallback.nl) };
};
const codes = (value: unknown, known: readonly string[]): string[] => (Array.isArray(value) ? [...new Set(value.map(String))].filter((code) => known.includes(code)) : []);

type Defaults = { singleEur: { european: number; world: number }; worldOnly: readonly string[]; packages: readonly any[] };

/**
 * Stored settings (any shape, possibly missing) -> a complete, sane configuration. Every number is clamped,
 * every language must be one the site has, the three packages always exist in order, Go is always free and
 * on, and exactly one package is recommended.
 */
export function translationPricing(stored: unknown, defaults: Defaults, knownLocales: readonly string[]): TranslationPricing {
  const s = (stored && typeof stored === 'object' ? stored : {}) as any;
  // Not checked against the site's languages: the World-only languages may be added to the site after this was
  // saved, and saving the prices before then must not forget them. Packages and prices only look at languages
  // the site has (packageLocales), so an unknown code here is harmless.
  const worldOnly = Array.isArray(s.worldOnly)
    ? ([...new Set((s.worldOnly as unknown[]).map(String))] as string[]).filter((code) => /^[a-z]{2,3}$/.test(code) && !MANDATORY_LOCALES.includes(code))
    : [...defaults.worldOnly];
  const packages = TRANSLATION_PACKAGE_IDS.map((id): TranslationPackage => {
    const base = defaults.packages.find((pkg) => pkg.id === id)!;
    const given = (Array.isArray(s.packages) ? s.packages.find((pkg: any) => pkg?.id === id) : null) ?? {};
    // The default rule for Európa names the World-only languages; follow the stored list when there is one.
    const rule: PackageRule = id === 'europe' ? { excludeFromAll: worldOnly } : id === 'go' ? { include: codes(given.rule?.include ?? base.rule.include, knownLocales) } : {};
    const own = Array.isArray(given.locales) ? codes(given.locales, knownLocales) : undefined;
    return {
      id,
      priceEur: id === 'go' ? 0 : num(given.priceEur, base.priceEur),
      rule,
      ...(own && own.length > 0 ? { locales: own } : {}),
      names: words(given.names, base.names, 40),
      pitch: words(given.pitch, base.pitch, 900),
      badge: badgeWords(given.badge, base.badge),
      recommended: typeof given.recommended === 'boolean' ? given.recommended : base.recommended,
      active: id === 'go' ? true : typeof given.active === 'boolean' ? given.active : base.active,
    };
  });
  // Exactly one card is recommended (never Go, which is not for sale).
  const recommended = packages.filter((pkg) => pkg.recommended && pkg.id !== 'go');
  packages.forEach((pkg) => { pkg.recommended = recommended.length === 1 ? pkg === recommended[0] : pkg.id === 'europe'; });
  return {
    packages,
    singleEur: { european: num(s.singleEur?.european, defaults.singleEur.european), world: num(s.singleEur?.world, defaults.singleEur.world) },
    worldOnly,
  };
}

export const packageById = (cfg: TranslationPricing, id: string | null | undefined): TranslationPackage =>
  cfg.packages.find((pkg) => pkg.id === id) ?? cfg.packages[0];

/** The languages a package covers, out of the languages a listing can be translated into. English is always in. */
export function packageLocales(pkg: TranslationPackage, targets: readonly string[]): string[] {
  let chosen: string[];
  if (pkg.locales) chosen = targets.filter((code) => pkg.locales!.includes(code));
  else if (pkg.rule.include) chosen = targets.filter((code) => pkg.rule.include!.includes(code));
  else chosen = targets.filter((code) => !(pkg.rule.excludeFromAll ?? []).includes(code));
  for (const code of MANDATORY_LOCALES) if (targets.includes(code) && !chosen.includes(code)) chosen.push(code);
  return targets.filter((code) => chosen.includes(code));
}

export type ListingLanguages = {
  translationPackage?: string | null;
  extraLocales?: readonly string[] | null;
  excludedLocales?: readonly string[] | null;
  /** Languages a person wrote the text in themselves (not translated): theirs to publish, no purchase needed. */
  writtenLocales?: readonly string[] | null;
  sourceLocale: string;
};

/** Everything the listing may be published in, before anything is switched off: package plus single languages, minus the original. */
export function grantedLocales(listing: ListingLanguages, cfg: TranslationPricing, targets: readonly string[]): string[] {
  const inPackage = packageLocales(packageById(cfg, listing.translationPackage), targets);
  const granted = new Set([...inPackage, ...[...(listing.extraLocales ?? []), ...(listing.writtenLocales ?? [])].filter((code) => targets.includes(code))]);
  granted.delete(listing.sourceLocale);
  return targets.filter((code) => granted.has(code));
}

/** What is left after the owner's or an admin's exclusions. */
export function entitledLocales(listing: ListingLanguages, cfg: TranslationPricing, targets: readonly string[]): string[] {
  const off = new Set(listing.excludedLocales ?? []);
  return grantedLocales(listing, cfg, targets).filter((code) => !off.has(code));
}

/** Languages that may be switched off: everything granted except the mandatory ones. */
export const NON_EXCLUDABLE_LOCALES: readonly string[] = MANDATORY_LOCALES;

export type ExclusionProblem = 'exclude-en' | 'is-source';

/**
 * A requested set of exclusions, cleaned: only languages the listing was granted, never the original, never a
 * mandatory one. A forged request naming English is refused, not trimmed.
 */
export function cleanExclusions(
  requested: readonly string[], listing: ListingLanguages, cfg: TranslationPricing, targets: readonly string[]
): { excluded: string[]; problem?: ExclusionProblem } {
  const asked = [...new Set(requested.map(String))];
  if (asked.some((code) => NON_EXCLUDABLE_LOCALES.includes(code))) return { excluded: [], problem: 'exclude-en' };
  if (asked.includes(listing.sourceLocale)) return { excluded: [], problem: 'is-source' };
  const granted = new Set(grantedLocales(listing, cfg, targets));
  return { excluded: targets.filter((code) => asked.includes(code) && granted.has(code)) };
}

/* ── Prices ────────────────────────────────────────────────────────────── */

export const isWorldOnly = (code: string, cfg: TranslationPricing): boolean => cfg.worldOnly.includes(code);

/** One language bought on its own. */
export const singlePriceEur = (code: string, cfg: TranslationPricing): number => (isWorldOnly(code, cfg) ? cfg.singleEur.world : cfg.singleEur.european);

export type TranslationSelection = {
  packageId: string;
  /** Single languages bought on top of the package. */
  extraLocales: readonly string[];
  excludedLocales: readonly string[];
  sourceLocale: string;
};

export type TranslationLine = {
  kind: 'extra'; id: 'translation-package' | 'translation' | 'translation-world'; quantity: number; unitCents: number; label: string; locales: string[];
  /** The package a 'translation-package' line buys, so paying is enough to know what to apply. */
  packageId?: TranslationPackageId;
};

/** Every order line id that is a translation purchase. */
export const TRANSLATION_LINE_IDS: readonly string[] = ['translation-package', 'translation', 'translation-world'];

const LINE_LABEL: Record<'translation-package' | 'translation' | 'translation-world', Words> = {
  'translation-package': { hu: 'Fordítási csomag', en: 'Translation package', nl: 'Vertaalpakket' },
  translation: { hu: 'Fordítás', en: 'Translation', nl: 'Vertaling' },
  'translation-world': { hu: 'Fordítás (Európán kívüli nyelv)', en: 'Translation (non-European language)', nl: 'Vertaling (niet-Europese taal)' },
};
export const translationLineLabel = (id: keyof typeof LINE_LABEL, locale: string): string => LINE_LABEL[id][locale === 'hu' || locale === 'nl' ? locale : 'en'];

/** The languages a package or single purchase is paid for: singles that the package does not already include. */
export function billableSingles(selection: TranslationSelection, cfg: TranslationPricing, targets: readonly string[]): string[] {
  const inPackage = new Set(packageLocales(packageById(cfg, selection.packageId), targets));
  return [...new Set(selection.extraLocales)].filter((code) => targets.includes(code) && !inPackage.has(code) && code !== selection.sourceLocale);
}

/**
 * The order lines for a translation choice. Go costs nothing and has no line. A package is one line that
 * remembers the languages it covers (minus the ones switched off: the price does not change); singles are one
 * line per price group. Prices come from the configuration, never from the browser.
 */
export function translationLines(
  selection: TranslationSelection, cfg: TranslationPricing, locale: string, targets: readonly string[], opts: { currentPackageId?: string | null } = {}
): TranslationLine[] {
  const lines: TranslationLine[] = [];
  const pkg = packageById(cfg, selection.packageId);
  const off = new Set(selection.excludedLocales);
  // Moving to a bigger package costs the difference; staying on the package already held costs nothing more.
  const priceEur = opts.currentPackageId === undefined ? pkg.priceEur : upgradePriceEur(opts.currentPackageId, pkg.id, cfg);
  if (pkg.priceEur > 0 && priceEur > 0) {
    const covered = packageLocales(pkg, targets).filter((code) => code !== selection.sourceLocale && !off.has(code));
    const lang = locale === 'hu' || locale === 'nl' ? locale : 'en';
    const name = pkg.names[lang];
    // "Fordítási csomag: Európa (22 nyelv, 1 kizárva)": what was bought, and that switching languages off changes no price.
    const switchedOff = packageLocales(pkg, targets).filter((code) => code !== selection.sourceLocale && off.has(code)).length;
    const detail = `${languageCount(covered.length + 1, lang)}${switchedOff ? `, ${switchedOff} ${EXCLUDED_WORD[lang]}` : ''}`;
    lines.push({
      kind: 'extra', id: 'translation-package', quantity: 1, unitCents: Math.round(priceEur * 100), packageId: pkg.id, locales: covered,
      label: `${translationLineLabel('translation-package', locale)}: ${name} (${detail}${opts.currentPackageId && opts.currentPackageId !== 'go' ? `, ${UPGRADE_WORD[lang]}` : ''})`,
    });
  }
  const singles = billableSingles(selection, cfg, targets);
  const european = singles.filter((code) => !isWorldOnly(code, cfg));
  const world = singles.filter((code) => isWorldOnly(code, cfg));
  if (european.length) lines.push({ kind: 'extra', id: 'translation', quantity: european.length, unitCents: Math.round(cfg.singleEur.european * 100), label: translationLineLabel('translation', locale), locales: european });
  if (world.length) lines.push({ kind: 'extra', id: 'translation-world', quantity: world.length, unitCents: Math.round(cfg.singleEur.world * 100), label: translationLineLabel('translation-world', locale), locales: world });
  return lines;
}

const EXCLUDED_WORD: Record<'hu' | 'nl' | 'en', string> = { hu: 'kizárva', nl: 'uitgesloten', en: 'excluded' };
const languageCount = (n: number, lang: 'hu' | 'nl' | 'en'): string => (lang === 'hu' ? `${n} nyelv` : lang === 'nl' ? (n === 1 ? '1 taal' : `${n} talen`) : n === 1 ? '1 language' : `${n} languages`);
const UPGRADE_WORD: Record<'hu' | 'nl' | 'en', string> = { hu: 'bővítés', nl: 'uitbreiding', en: 'upgrade' };

export const translationTotalCents = (lines: readonly { quantity: number; unitCents: number }[]): number => lines.reduce((sum, line) => sum + line.quantity * line.unitCents, 0);

/** What a selection costs in euros, for the live total in the picker. */
export function selectionEur(selection: TranslationSelection, cfg: TranslationPricing, targets: readonly string[]): number {
  return translationTotalCents(translationLines(selection, cfg, 'en', targets)) / 100;
}

/**
 * The cheaper way to the same languages, when there is one: Európa once the singles reach its price (or World
 * is no dearer than the package plus the singles), World once the singles reach its price. Null when the
 * current choice is the best.
 */
export function cheaperPackageHint(selection: TranslationSelection, cfg: TranslationPricing, targets: readonly string[]): TranslationPackageId | null {
  const current = selectionEur(selection, cfg, targets);
  const wanted = new Set([...packageLocales(packageById(cfg, selection.packageId), targets), ...billableSingles(selection, cfg, targets)]);
  wanted.delete(selection.sourceLocale);
  let best: { id: TranslationPackageId; price: number } | null = null;
  for (const pkg of cfg.packages) {
    if (!pkg.active || pkg.id === 'go' || pkg.id === selection.packageId) continue;
    const covers = packageLocales(pkg, targets);
    if (![...wanted].every((code) => covers.includes(code))) continue; // it would drop a language they asked for
    // Same languages or more, for less or the same money, and strictly more reach.
    const price = pkg.priceEur;
    const reach = covers.filter((code) => code !== selection.sourceLocale).length;
    if (price <= current && reach > wanted.size && (!best || price < best.price)) best = { id: pkg.id, price };
  }
  return best?.id ?? null;
}

/** Moving to a bigger package costs the difference; singles bought earlier are not credited. Never negative. */
export function upgradePriceEur(fromId: string | null | undefined, toId: string, cfg: TranslationPricing): number {
  const from = packageById(cfg, fromId ?? 'go').priceEur;
  return Math.max(0, Math.round((packageById(cfg, toId).priceEur - from) * 100) / 100);
}

/**
 * The deal stays obvious only while World costs no more than Európa plus every World-only language one by one.
 * An admin editing prices is warned when it stops being so.
 */
export function worldDeal(cfg: TranslationPricing): { ok: boolean; europePlusSingles: number; worldOnlySum: number; world: number; europe: number } {
  const europe = packageById(cfg, 'europe').priceEur;
  const world = packageById(cfg, 'world').priceEur;
  const worldOnlySum = Math.round(cfg.worldOnly.length * cfg.singleEur.world * 100) / 100;
  const europePlusSingles = Math.round((europe + worldOnlySum) * 100) / 100;
  return { ok: world <= europePlusSingles, europePlusSingles, worldOnlySum, world, europe };
}

/** How many languages a package puts a listing in, the original included. */
export const packageLanguageCount = (pkg: TranslationPackage, targets: readonly string[], sourceLocale = 'hu'): number =>
  new Set([...packageLocales(pkg, targets), sourceLocale]).size;

/** The pitch with its numbers filled in; `count` includes the original language. */
export function renderPitch(pkg: TranslationPackage, lang: string, cfg: TranslationPricing, targets: readonly string[], sourceLocale = 'hu'): string {
  const deal = worldDeal(cfg);
  const count = packageLanguageCount(pkg, targets, sourceLocale);
  const eur = (n: number) => String(Math.round(n * 100) % 100 === 0 ? Math.round(n) : n.toFixed(2).replace('.', ','));
  const values: Record<string, string> = {
    count: String(count), europe: eur(deal.europe), world: eur(deal.world), worldOnlySum: eur(deal.worldOnlySum),
    europePlus: eur(deal.europePlusSingles), singleEuropean: eur(cfg.singleEur.european), singleWorld: eur(cfg.singleEur.world),
  };
  const source = pkg.pitch[lang === 'hu' || lang === 'nl' ? lang : 'en'];
  return source.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}
