/**
 * The listing price matrix (November 2026): Basic, Europe and World, 1/3/6 months, by the value of the property.
 *
 * Pure and dependency-free (relative imports only), so the server, the setup wizard in the browser, the admin editor
 * and the node tests run the very same code. `priceFor()` is THE place a listing price is computed; everything that
 * shows or charges one asks it. Every price is an integer number of euro cents: 8,90 € is 890, never 8.9, so an
 * `unitCents` can never be 890.0000000000001. No forint price is ever stored or used to compute one.
 *
 * The configuration lives in `site_settings.services.listingPricing` (plain JSON, edited in Csomagok). Anything
 * missing or invalid falls back to the defaults below; `validatePricing()` is what an admin save goes through and it
 * refuses (with a Hungarian message) instead of quietly repairing.
 *
 * The languages of a package are NOT here: they are rules in `translationPackages` (src/lib/translation-packages.ts),
 * one source of truth for what a package publishes the listing in.
 */
import { valueTierIndex } from './price-tiers.ts';

export type PackageKey = 'basic' | 'europe' | 'world';
export const PACKAGE_KEYS: readonly PackageKey[] = ['basic', 'europe', 'world'];
export const isPackageKey = (value: unknown): value is PackageKey => typeof value === 'string' && (PACKAGE_KEYS as readonly string[]).includes(value);

/** What a package includes besides languages (Q4: identical by default; editable per package). */
export type PackageFeatures = { maxImages: number | null; phone: boolean; editedImages: boolean; editedText: boolean; video: 'included' | 'none' };

export type PackageSetting = {
  /** Shown to buyers; hu and en are editable in the admin, the other languages use the same brand word. */
  names: { hu: string; en: string };
  features: PackageFeatures;
  recommended: boolean;
  enabled: boolean;
};

/** A value band: `upToHuf` is an inclusive upper bound, `null` for the open last band. */
export type ValueTier = { upToHuf: number | null };

export type ListingPricing = {
  version: 2;
  currency: 'EUR';
  /** Ascending, inclusive upper bounds; the last is open-ended (Q1: 24 999 999 and 100 000 000). */
  valueTiers: ValueTier[];
  /** Months a package can be bought for. */
  durations: number[];
  packages: Record<PackageKey, PackageSetting>;
  /** prices[package][valueTierIndex][months] = cents */
  prices: Record<PackageKey, Record<number, Record<number, number>>>;
  /** Q5: the old per-language sale. Off; the code stays so it can come back without a deploy. */
  singleLanguages: { enabled: boolean; europeanCents: number; worldOnlyCents: number };
};

export const PRICE_CENTS_MAX = 1_000_000; // 10 000 €
export const DURATION_MAX = 24;
export const TIER_COUNT_MAX = 6;
export const TIER_BOUND_LIMIT = 100_000_000_000;

/* ── Defaults: Gábor's table of 4 Nov 2026 ───────────────────────────────── */

export const DEFAULT_VALUE_TIERS: ValueTier[] = [{ upToHuf: 24_999_999 }, { upToHuf: 100_000_000 }, { upToHuf: null }];
export const DEFAULT_DURATIONS: number[] = [1, 3, 6];

/** cents[package][tier] = [1 month, 3 months, 6 months] */
export const DEFAULT_PRICE_TABLE: Record<PackageKey, number[][]> = {
  basic: [[890, 1890, 2990], [1090, 2490, 3890], [1390, 2990, 4690]],
  europe: [[1290, 2790, 4390], [1690, 3800, 5990], [2090, 4600, 7190]],
  world: [[1690, 3800, 5990], [2190, 4990, 7690], [2790, 6290, 9590]],
};

const FEATURES: PackageFeatures = { maxImages: 20, phone: true, editedImages: false, editedText: false, video: 'included' };

export const DEFAULT_PACKAGES: Record<PackageKey, PackageSetting> = {
  basic: { names: { hu: 'Basic', en: 'Basic' }, features: { ...FEATURES }, recommended: false, enabled: true },
  europe: { names: { hu: 'Europe', en: 'Europe' }, features: { ...FEATURES }, recommended: true, enabled: true },
  world: { names: { hu: 'World', en: 'World' }, features: { ...FEATURES }, recommended: false, enabled: true },
};

function tableToPrices(table: Record<PackageKey, number[][]>, durations: readonly number[]): ListingPricing['prices'] {
  const out = {} as ListingPricing['prices'];
  for (const key of PACKAGE_KEYS) {
    out[key] = {};
    table[key].forEach((row, tier) => {
      out[key][tier] = {};
      durations.forEach((months, i) => { out[key][tier][months] = row[i]; });
    });
  }
  return out;
}

export function defaultPricing(): ListingPricing {
  return {
    version: 2,
    currency: 'EUR',
    valueTiers: DEFAULT_VALUE_TIERS.map((tier) => ({ ...tier })),
    durations: [...DEFAULT_DURATIONS],
    packages: { basic: structuredClone(DEFAULT_PACKAGES.basic), europe: structuredClone(DEFAULT_PACKAGES.europe), world: structuredClone(DEFAULT_PACKAGES.world) },
    prices: tableToPrices(DEFAULT_PRICE_TABLE, DEFAULT_DURATIONS),
    singleLanguages: { enabled: false, europeanCents: 100, worldOnlyCents: 500 },
  };
}

/* ── Reading what is stored ──────────────────────────────────────────────── */

const isRecord = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const cleanText = (value: unknown, fallback: string, max = 40): string => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback);
const intIn = (value: unknown, min: number, max: number): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

function readTiers(raw: unknown): ValueTier[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > TIER_COUNT_MAX) return null;
  const tiers: ValueTier[] = [];
  for (let i = 0; i < raw.length; i++) {
    const last = i === raw.length - 1;
    const bound = (raw[i] as any)?.upToHuf;
    if (last) {
      if (bound !== null && bound !== undefined) return null;
      tiers.push({ upToHuf: null });
    } else {
      const n = intIn(bound, 1, TIER_BOUND_LIMIT);
      if (n === null || (i > 0 && n <= (tiers[i - 1].upToHuf as number))) return null;
      tiers.push({ upToHuf: n });
    }
  }
  return tiers;
}

function readDurations(raw: unknown): number[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 8) return null;
  const list = raw.map((value) => intIn(value, 1, DURATION_MAX));
  if (list.some((n) => n === null) || new Set(list).size !== list.length) return null;
  return (list as number[]).sort((a, b) => a - b);
}

/**
 * Stored settings (any shape, possibly missing) -> a complete configuration. Never throws: a part that is missing
 * or invalid falls back to the default for that part, so a broken save can never take the price list down. (An admin
 * save is checked strictly by `validatePricing`; this is the read path.)
 */
export function readPricing(stored: unknown): ListingPricing {
  const base = defaultPricing();
  const s = isRecord(stored) ? stored : {};
  const valueTiers = readTiers(s.valueTiers) ?? base.valueTiers;
  const durations = readDurations(s.durations) ?? base.durations;
  const defaultTiers = JSON.stringify(base.valueTiers);
  const defaultDurations = JSON.stringify(base.durations);
  const sameShape = JSON.stringify(valueTiers) === defaultTiers && JSON.stringify(durations) === defaultDurations;

  const packages = {} as ListingPricing['packages'];
  const prices = {} as ListingPricing['prices'];
  for (const key of PACKAGE_KEYS) {
    const given = isRecord(s.packages) && isRecord(s.packages[key]) ? s.packages[key] : {};
    const defaults = base.packages[key];
    const f = isRecord(given.features) ? given.features : {};
    packages[key] = {
      names: { hu: cleanText(given.names?.hu, defaults.names.hu), en: cleanText(given.names?.en, defaults.names.en) },
      features: {
        maxImages: f.maxImages === null ? null : (intIn(f.maxImages, 1, 200) ?? defaults.features.maxImages),
        phone: typeof f.phone === 'boolean' ? f.phone : defaults.features.phone,
        editedImages: typeof f.editedImages === 'boolean' ? f.editedImages : defaults.features.editedImages,
        editedText: typeof f.editedText === 'boolean' ? f.editedText : defaults.features.editedText,
        video: f.video === 'none' ? 'none' : 'included',
      },
      recommended: typeof given.recommended === 'boolean' ? given.recommended : defaults.recommended,
      enabled: typeof given.enabled === 'boolean' ? given.enabled : defaults.enabled,
    };
    prices[key] = {};
    valueTiers.forEach((_tier, tier) => {
      prices[key][tier] = {};
      durations.forEach((months) => {
        const stored = s.prices?.[key]?.[tier]?.[months];
        const fallback = sameShape ? base.prices[key][tier][months] : null;
        const cents = intIn(stored, 1, PRICE_CENTS_MAX) ?? fallback;
        // A cell with no price is simply not for sale (priceFor returns null); it never turns into a made-up number.
        if (cents !== null) prices[key][tier][months] = cents;
      });
    });
  }
  // Exactly one recommended package among the enabled ones (the first flagged one wins; Europe when none).
  const enabled = PACKAGE_KEYS.filter((key) => packages[key].enabled);
  const flagged = enabled.filter((key) => packages[key].recommended);
  const pick = flagged[0] ?? (enabled.includes('europe') ? 'europe' : enabled[0]);
  PACKAGE_KEYS.forEach((key) => { packages[key].recommended = key === pick; });

  const sl = isRecord(s.singleLanguages) ? s.singleLanguages : {};
  return {
    version: 2,
    currency: 'EUR',
    valueTiers,
    durations,
    packages,
    prices,
    singleLanguages: {
      enabled: sl.enabled === true,
      europeanCents: intIn(sl.europeanCents, 0, PRICE_CENTS_MAX) ?? base.singleLanguages.europeanCents,
      worldOnlyCents: intIn(sl.worldOnlyCents, 0, PRICE_CENTS_MAX) ?? base.singleLanguages.worldOnlyCents,
    },
  };
}

/* ── The one price function ──────────────────────────────────────────────── */

export type PriceResult = { cents: number; tierIndex: number; months: number };

/** Index of the value band a property price falls in (Q1). A missing or zero price is the first band: the "from" price. */
export const tierIndexFor = (pricing: Pick<ListingPricing, 'valueTiers'>, priceHuf: number | null | undefined): number =>
  valueTierIndex(pricing.valueTiers.map((tier) => tier.upToHuf), priceHuf);

/**
 * What `packageId` costs for `months` months for a property priced `priceHuf` forints: integer cents, the band it
 * was found in. `null` when that package, duration or band has no price (not sold). `tierIndex` may be given to price
 * inside a band that was frozen into an order (an upgrade or a renewal never re-tiers).
 */
export function priceFor(input: { packageId: string; months: number; priceHuf?: number | null; tierIndex?: number; pricing: ListingPricing }): PriceResult | null {
  const { packageId, months, pricing } = input;
  if (!isPackageKey(packageId)) return null;
  const tierIndex = input.tierIndex ?? tierIndexFor(pricing, input.priceHuf);
  const cents = pricing.prices[packageId]?.[tierIndex]?.[months];
  return typeof cents === 'number' && Number.isInteger(cents) && cents > 0 ? { cents, tierIndex, months } : null;
}

/** The lowest price a package is sold at ("from" price), in cents, or null when it has no price at all. */
export function fromCents(pricing: ListingPricing, packageId: PackageKey): number | null {
  const cells = Object.values(pricing.prices[packageId] ?? {}).flatMap((row) => Object.values(row));
  return cells.length ? Math.min(...cells) : null;
}

/** Upgrade price: the difference between two packages inside the band and duration originally bought (never negative). */
export function upgradeCents(input: { from: string; to: string; months: number; tierIndex: number; pricing: ListingPricing }): number | null {
  const a = priceFor({ packageId: input.from, months: input.months, tierIndex: input.tierIndex, pricing: input.pricing });
  const b = priceFor({ packageId: input.to, months: input.months, tierIndex: input.tierIndex, pricing: input.pricing });
  if (!a || !b) return null;
  return Math.max(0, b.cents - a.cents);
}

/** The referral discount: a whole-cent amount, half up. */
export const percentOfCents = (cents: number, percent: number): number => Math.floor((cents * percent * 2 + 100) / 200);

/* ── Wording ─────────────────────────────────────────────────────────────── */

const MILLION = 1_000_000;
const millions = (huf: number): string => String(huf / MILLION).replace('.', ',');

/**
 * The band in words, computed from the bounds and never typed: „25 millió Ft alatt”, „25–100 millió Ft”,
 * „100 millió Ft felett” (Hungarian) and the English equivalents; any other language gets the numbers, which read the
 * same everywhere: `< 25 000 000 Ft`.
 */
export function tierLabel(valueTiers: readonly ValueTier[], index: number, locale: string = 'hu', format: (huf: number) => string = (n) => `${n} Ft`): string {
  const upTo = valueTiers[index]?.upToHuf ?? null;
  const previous = index > 0 ? valueTiers[index - 1].upToHuf : null;
  // A bound just below a round million is how "under 25 million" is stored (24 999 999).
  const roundAbove = (bound: number) => ((bound + 1) % MILLION === 0 ? bound + 1 : null);
  const startsAt = previous === null ? null : (roundAbove(previous) ?? previous + 1);
  const endsAt = upTo === null ? null : upTo;
  const hu = locale === 'hu';
  const en = locale === 'en';
  if (hu || en) {
    const unit = hu ? 'millió Ft' : 'million HUF';
    const m = (n: number) => (n % MILLION === 0 ? millions(n) : null);
    if (index === 0 && endsAt !== null) {
      const limit = roundAbove(endsAt);
      if (limit !== null) return hu ? `${millions(limit)} ${unit} alatt` : `under ${millions(limit)} ${unit}`;
      return hu ? `legfeljebb ${format(endsAt)}` : `up to ${format(endsAt)}`;
    }
    if (endsAt === null && startsAt !== null) {
      const from = previous!;
      return m(from) ? (hu ? `${m(from)} ${unit} felett` : `over ${m(from)} ${unit}`) : (hu ? `${format(from)} felett` : `over ${format(from)}`);
    }
    if (startsAt !== null && endsAt !== null && m(startsAt) && m(endsAt)) return `${m(startsAt)}–${m(endsAt)} ${unit}`;
  }
  if (index === 0 && endsAt !== null) return `< ${format((roundAbove(endsAt) ?? endsAt + 1))}`;
  if (endsAt === null && previous !== null) return `> ${format(previous)}`;
  return `${format(startsAt ?? 0)} – ${format(endsAt ?? 0)}`;
}

/* ── What an admin save must satisfy ─────────────────────────────────────── */

export class PricingError extends Error {}

/**
 * The strict check an admin save goes through (master §8.2): tiers ascending, durations unique integers 1–24, at least
 * one package enabled, and every enabled package × band × duration priced above 0 and at most 10 000 €. Returns the
 * clean configuration or the first problem in Hungarian; nothing is repaired silently.
 */
export function validatePricing(raw: unknown): { ok: true; pricing: ListingPricing } | { ok: false; message: string } {
  const s = isRecord(raw) ? raw : {};
  const valueTiers = readTiers(s.valueTiers);
  if (!valueTiers) return { ok: false, message: 'Az ingatlanérték-sávok felső határa legyen növekvő, pozitív egész forintösszeg; az utolsó sávnak nincs felső határa (legfeljebb 6 sáv).' };
  const durations = readDurations(s.durations);
  if (!durations) return { ok: false, message: 'Az időtartamok 1 és 24 hónap közötti, különböző egész számok legyenek.' };
  const pricing = readPricing({ ...s, valueTiers, durations });
  const enabled = PACKAGE_KEYS.filter((key) => pricing.packages[key].enabled);
  if (enabled.length === 0) return { ok: false, message: 'Legalább egy csomagnak bekapcsolva kell maradnia.' };
  for (const key of enabled) {
    for (let tier = 0; tier < valueTiers.length; tier++) {
      for (const months of durations) {
        const given = (s.prices as any)?.[key]?.[tier]?.[months];
        const cents = intIn(given, 1, PRICE_CENTS_MAX);
        if (cents === null) {
          const name = pricing.packages[key].names.hu;
          return { ok: false, message: `${name}, ${months} hónap, ${tierLabel(valueTiers, tier)}: az ár legyen 0-nál nagyobb és legfeljebb 10 000 €.` };
        }
      }
    }
  }
  return { ok: true, pricing };
}
