/**
 * Price tiers by property price (spec §9.1–9.3).
 *
 * Every package and every extra has `tiers`: ascending, inclusive upper bounds
 * in forints, the last one open-ended. A price that equals a bound belongs to
 * the lower tier, which is what the old single threshold did
 * (`priceHuf > thresholdHuf`), so 150.000.000 Ft still costs the lower price.
 *
 * Bounds are forints because every listing has an exact `price_huf`; prices are
 * whole euros, the billing currency. Gaps and overlaps cannot exist: a tier
 * starts one forint above the previous bound.
 *
 * Pure and dependency-free, so the setup wizard and the admin editor run the
 * very same code in the browser as checkout does on the server.
 */

export type PriceTier = { upToHuf: number | null; priceEur: number };
export type Tiered = { tiers: PriceTier[] };

export const TIERS_MAX = 10;
export const TIER_PRICE_MAX = 10_000;
export const TIER_BOUND_MAX = 100_000_000_000;

/** A flat price as a one-tier list. */
export const flatTiers = (priceEur: number): PriceTier[] => [{ upToHuf: null, priceEur }];

/**
 * The tier a property price falls in. `priceHuf` that is missing, zero or not a
 * number (a draft without a price yet) gets the first tier — the "from" price.
 */
export function tierFor(tiers: readonly PriceTier[], priceHuf: number | null | undefined): { tier: PriceTier; index: number; fromHuf: number } {
  const list = tiers.length ? tiers : flatTiers(0);
  const huf = typeof priceHuf === 'number' && Number.isFinite(priceHuf) && priceHuf > 0 ? priceHuf : 0;
  let fromHuf = 0;
  for (let index = 0; index < list.length; index++) {
    const tier = list[index];
    if (tier.upToHuf === null || index === list.length - 1 || huf <= tier.upToHuf) return { tier, index, fromHuf };
    fromHuf = tier.upToHuf + 1;
  }
  /* c8 ignore next — unreachable: the loop always returns on the last tier */
  return { tier: list[list.length - 1], index: list.length - 1, fromHuf };
}

/** The single price function: what `item` costs for a property priced `priceHuf` forints. */
export function priceEurFor(item: Tiered, priceHuf: number | null | undefined): number {
  return tierFor(item.tiers, priceHuf).tier.priceEur;
}

/** The forint range of tier `index`: `{ fromHuf, toHuf }`, `toHuf` null for the open last tier. */
export function tierRange(tiers: readonly PriceTier[], index: number): { fromHuf: number; toHuf: number | null } {
  const fromHuf = index === 0 ? 0 : (tiers[index - 1]?.upToHuf ?? 0) + 1;
  return { fromHuf, toHuf: index === tiers.length - 1 ? null : (tiers[index]?.upToHuf ?? null) };
}

/** Old stored shape → tiers: one threshold and a higher price become two tiers, anything else one. */
export function legacyTiers(priceEur: number, priceEurAbove: number | null | undefined, thresholdHuf: number | null | undefined): PriceTier[] {
  return typeof thresholdHuf === 'number' && thresholdHuf > 0 && typeof priceEurAbove === 'number'
    ? [{ upToHuf: thresholdHuf, priceEur }, { upToHuf: null, priceEur: priceEurAbove }]
    : flatTiers(priceEur);
}

export type TierIssue = { row: number; field: 'upToHuf' | 'priceEur' | 'list'; message: string };

const intIn = (value: unknown, min: number, max: number): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[\s.\u00a0\u202f]/g, '').replace(',', '.'));
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

/**
 * Checks a tier list as the editor posts it (§9.3). Errors stop the save and
 * name the row (0-based) they belong to, in Hungarian; warnings do not.
 */
export function validateTiers(raw: unknown): { ok: boolean; tiers: PriceTier[]; errors: TierIssue[]; warnings: TierIssue[] } {
  const errors: TierIssue[] = [];
  const warnings: TierIssue[] = [];
  const rows = Array.isArray(raw) ? raw : [];
  if (rows.length < 1) errors.push({ row: 0, field: 'list', message: 'Legalább egy ársáv szükséges.' });
  if (rows.length > TIERS_MAX) errors.push({ row: TIERS_MAX, field: 'list', message: `Legfeljebb ${TIERS_MAX} ársáv adható meg.` });
  const tiers: PriceTier[] = [];
  rows.slice(0, TIERS_MAX).forEach((row, index) => {
    const value = (row ?? {}) as Record<string, unknown>;
    const last = index === Math.min(rows.length, TIERS_MAX) - 1;
    const price = intIn(value.priceEur, 0, TIER_PRICE_MAX);
    if (price === null) errors.push({ row: index, field: 'priceEur', message: `Az ár 0 és ${String(TIER_PRICE_MAX).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} € közötti egész szám legyen.` });
    let bound: number | null = null;
    const rawBound = value.upToHuf;
    const filled = rawBound !== null && rawBound !== undefined && String(rawBound).trim() !== '';
    if (last) {
      if (filled) errors.push({ row: index, field: 'upToHuf', message: 'Az utolsó sávnak nincs felső határa.' });
    } else {
      bound = intIn(rawBound, 1, TIER_BOUND_MAX);
      if (bound === null) errors.push({ row: index, field: 'upToHuf', message: 'Adjon meg egy pozitív, egész forintösszeget felső határnak.' });
      else {
        const previous = tiers[index - 1]?.upToHuf;
        if (typeof previous === 'number' && bound <= previous) errors.push({ row: index, field: 'upToHuf', message: 'A felső határ legyen nagyobb az előző sávénál.' });
      }
    }
    tiers.push({ upToHuf: bound, priceEur: price ?? 0 });
    const before = tiers[index - 1];
    if (before && price !== null && price < before.priceEur) warnings.push({ row: index, field: 'priceEur', message: 'A magasabb sáv olcsóbb – biztos?' });
  });
  return { ok: errors.length === 0, tiers: errors.length ? [] : tiers, errors, warnings };
}

/** Stored tiers of any shape → valid tiers, or null so the caller falls back to its default. */
export function readTiers(raw: unknown): PriceTier[] | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  const checked = validateTiers(raw);
  return checked.ok ? checked.tiers : null;
}
