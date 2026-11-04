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
import { isPackageKey, priceFor, tierIndexFor, type ListingPricing, type PackageKey } from '~/lib/listing-pricing';

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
