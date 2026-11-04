/**
 * Warnings on an unpaid order whose lines no longer match today's rules
 * (spec §4a.6 and §9.2). Pure: the payments page shows them, nothing is
 * repriced automatically — `line_items` stay frozen, and a paid order is
 * never looked at.
 *
 * - `retiredLines`: lines for extras that are no longer sold, such as the
 *   homepage highlight („Kivezetett tétel: főoldali kiemelés”).
 * - `tierDrift`: tiered lines whose stored price band no longer contains the
 *   listing's current price (the owner changed the price before paying).
 */
import type { OrderLine } from '../orders.ts';

type CatalogExtras = { extras: readonly { id: string; retired?: boolean }[] };

/** Only unpaid orders are worth a warning: a paid or cancelled one is history. */
export const needsReview = (status: string | null | undefined) => status === 'pending';

export function retiredLines(lines: readonly OrderLine[], cat: CatalogExtras): OrderLine[] {
  const retired = new Set(cat.extras.filter((extra) => extra.retired).map((extra) => extra.id));
  return lines.filter((line) => line.kind === 'extra' && retired.has(line.id));
}

export type TierDrift = { line: OrderLine; fromHuf: number; toHuf: number | null; direction: 'up' | 'down' };

/**
 * Lines charged in a band the listing's price has since left. A listing without
 * a price (0, null) is not judged: the order was made with whatever it had.
 */
export function tierDrift(lines: readonly OrderLine[], priceHuf: number | null | undefined): TierDrift[] {
  const huf = typeof priceHuf === 'number' && Number.isFinite(priceHuf) && priceHuf > 0 ? priceHuf : null;
  if (huf === null) return [];
  const out: TierDrift[] = [];
  for (const line of lines) {
    if (!line.tier) continue;
    const { fromHuf, toHuf } = line.tier;
    if (huf < fromHuf) out.push({ line, fromHuf, toHuf, direction: 'down' });
    else if (toHuf !== null && huf > toHuf) out.push({ line, fromHuf, toHuf, direction: 'up' });
  }
  return out;
}
