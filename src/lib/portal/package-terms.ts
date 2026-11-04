/**
 * The term and value band of a listing's package (Basic, Europe, World): written when the order is made, read when
 * the listing goes live, renews or upgrades. Pure; no database.
 *
 * `properties.package_months` / `price_tier_index` / `price_tier_huf_bounds` (migration 0056) hold what the buyer
 * paid for. A listing on one of the two older packages has none of them and keeps the old rule: the length of its
 * package.
 */
import type { OrderLine } from '~/lib/orders';
import type { ListingCatalog } from '~/lib/listing-packages';
import { packageOf } from '~/lib/listing-packages';
import { sellingPackages } from '~/lib/listing-packages';
import { isPackageKey, priceFor, tierIndexFor, upgradeCents, PACKAGE_KEYS, type ListingPricing, type PackageKey } from '~/lib/listing-pricing';

/** The columns an order's package line writes onto the listing, or nothing when the order has no such line. */
export function termColumns(lines: readonly OrderLine[], pricing: ListingPricing): { package_months: number; price_tier_index: number; price_tier_huf_bounds: (number | null)[] } | null {
  const line = lines.find((entry) => entry.kind === 'package' && isPackageKey(entry.id) && entry.months);
  if (!line) return null;
  return {
    package_months: line.months!,
    price_tier_index: line.tier?.index ?? 0,
    price_tier_huf_bounds: pricing.valueTiers.map((tier) => tier.upToHuf),
  };
}

/** How many months a listing runs for: what was bought, else the length of its (older) package. */
export function monthsForListing(row: { package?: string | null; package_months?: number | null }, catalog: ListingCatalog): number {
  if (typeof row.package_months === 'number' && row.package_months >= 1) return row.package_months;
  return packageOf(catalog, row.package).months;
}

export type RenewalQuote = { packageId: PackageKey; months: number; tierIndex: number; cents: number };

/**
 * What renewing a listing costs (Q8): `months` more of the listing's own package at TODAY's matrix price, in the
 * band its price is in NOW (not the one it was first bought in). A listing on one of the two older packages renews
 * as Basic. Null when the package or the term has no price. The new term starts at the old expiry (or now, if it
 * has expired): `renewedExpiry` in listing-rules.ts.
 */
export function renewalQuote(catalog: ListingCatalog, row: { package?: string | null; price_huf?: number | null }, months: number): RenewalQuote | null {
  const packageId: PackageKey = row.package && isPackageKey(row.package) ? row.package : 'basic';
  const tierIndex = tierIndexFor(catalog.pricing, row.price_huf);
  const price = priceFor({ packageId, months, tierIndex, pricing: catalog.pricing });
  return price ? { packageId, months, tierIndex, cents: price.cents } : null;
}

/**
 * The term an upgrade is priced for: what the listing was bought for, else (a listing on one of the older packages) the
 * configured term closest to the months it has left.
 */
export function upgradeTerm(property: { package_months?: number | null; expires_at?: string | null }, durations: readonly number[]): number {
  if (typeof property.package_months === 'number' && durations.includes(property.package_months)) return property.package_months;
  const left = property.expires_at ? Math.max(1, Math.round((Date.parse(property.expires_at) - Date.now()) / (30 * 86_400_000))) : Math.max(...durations);
  return [...durations].sort((a, b) => Math.abs(a - left) - Math.abs(b - left) || b - a)[0];
}

export type UpgradeQuote = { packageId: PackageKey; months: number; tierIndex: number; cents: number };

/**
 * The bigger packages a live listing can move to, and what each costs (Q6): the difference between the two packages for
 * the term and inside the value band originally bought, never negative; the expiry stays. Empty when the listing holds
 * the biggest package, or is on an older package with no band to price inside (it is then priced by its price now).
 */
export function upgradeQuotes(catalog: ListingCatalog, row: { package?: string | null; package_months?: number | null; price_tier_index?: number | null; price_huf?: number | null; expires_at?: string | null }): UpgradeQuote[] {
  if (!catalog.pricingLive) return [];
  const from: PackageKey = row.package && isPackageKey(row.package) ? row.package : 'basic';
  const months = upgradeTerm(row, catalog.pricing.durations);
  const tierIndex = typeof row.price_tier_index === 'number' ? row.price_tier_index : tierIndexFor(catalog.pricing, row.price_huf);
  const selling = new Set(sellingPackages(catalog).map((pkg) => pkg.id));
  return PACKAGE_KEYS.slice(PACKAGE_KEYS.indexOf(from) + 1).filter((key) => selling.has(key)).flatMap((key) => {
    const cents = upgradeCents({ from, to: key, months, tierIndex, pricing: catalog.pricing });
    return cents && cents > 0 ? [{ packageId: key, months, tierIndex, cents }] : [];
  });
}
