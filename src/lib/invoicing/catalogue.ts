/**
 * What can be put on an invoice with one click: the listing packages, the
 * extras, the on-site services and the paid valuation packages, with their
 * Hungarian and Dutch names. Prices are the published ones (gross, VAT
 * included); model.listPriceCents() turns them into the right figure for the
 * invoice at hand.
 */
import { listingCatalog } from '~/lib/listing-packages';
import { catalogue as orderCatalogue, tierPhrase, type OrderLine } from '~/lib/orders';
import type { PriceTier } from '~/lib/price-tiers';
import { valuationPackages, isPayable } from '~/lib/valuation/packages';
import type { Services } from '~/lib/runtime-config';
import type { InvoiceLine } from './model';

export type CatalogueItem = {
  id: string;
  group: 'Hirdetési csomagok' | 'Extrák' | 'Helyszíni szolgáltatások' | 'Értékbecslés';
  hu: string;
  nl: string;
  unitHu: string;
  unitNl: string;
  /** Gross list price in cents. */
  grossCents: number;
  /** No longer sold (§4): kept so an old order's line still finds its Hungarian and Dutch wording, never offered. */
  retired?: boolean;
};

/** `normal-12m`, `normal-12m:above` (two tiers), `normal-12m:t2` … — the catalogue id of a price tier. */
export function tierItemId(id: string, index: number, count: number): string {
  if (index === 0) return id;
  return count === 2 ? `${id}:above` : `${id}:t${index + 1}`;
}

export function invoiceCatalogue(services?: Services): CatalogueItem[] {
  const listing = listingCatalog(services);
  const hu = orderCatalogue('hu', listing, { includeRetired: true });
  const nl = orderCatalogue('nl', listing, { includeRetired: true });
  const items: CatalogueItem[] = [];

  // One item per price tier (Csomagok → Ársávok). The first tier keeps the plain id; a two-tier
  // item keeps the `:above` id it always had, so draft invoices made before tiers still resolve.
  const tierItems = (base: Omit<CatalogueItem, 'grossCents' | 'id'> & { id: string }, tiers: PriceTier[]) =>
    tiers.map((tier, index): CatalogueItem => ({
      ...base,
      id: tierItemId(base.id, index, tiers.length),
      ...(tiers.length > 1 ? { hu: `${base.hu} (${tierPhrase(tiers, index, 'hu')})`, nl: `${base.nl} (${tierPhrase(tiers, index, 'nl')})` } : {}),
      grossCents: tier.priceEur * 100,
    }));

  hu.packages.forEach((pkg, i) => {
    const months = pkg.months;
    items.push(...tierItems({
      id: pkg.id, group: 'Hirdetési csomagok', hu: `${pkg.label} — ${months} hónap`, nl: `${nl.packages[i].label} — ${months} maanden`,
      unitHu: 'db', unitNl: 'stuk',
    }, pkg.tiers));
  });

  hu.extras.forEach((extra, i) => {
    const onsite = extra.id.startsWith('onsite-');
    items.push(...tierItems({
      id: extra.id,
      group: onsite ? 'Helyszíni szolgáltatások' : 'Extrák',
      hu: extra.label,
      nl: nl.extras[i].label,
      unitHu: extra.unit || 'db',
      unitNl: nl.extras[i].unit || 'stuk',
      ...(extra.retired ? { retired: true } : {}),
    }, extra.tiers));
  });

  for (const pkg of valuationPackages(services).filter((p) => p.enabled && isPayable(p))) {
    items.push({
      id: `valuation-${pkg.kind}`, group: 'Értékbecslés', hu: pkg.names.hu, nl: pkg.names.nl, unitHu: 'db', unitNl: 'stuk',
      grossCents: Math.round((pkg.priceEur ?? 0) * 100),
    });
  }
  return items;
}

export const TRANSLATION_PRICE_NOTE = {
  hu: 'A csomag ára nem változik, ha egyes nyelveket kizár.',
  nl: 'De prijs van het pakket blijft gelijk als talen worden uitgesloten.',
};

/**
 * Every listing comes with English and German (Basic). Basic costs nothing, so it has no order line; the invoice says so
 * in one line without a price, unless a bigger package was bought, which already names its languages.
 */
export function basicIncludedLine(lines: OrderLine[]): InvoiceLine | null {
  if (!lines.some((line) => line.kind === 'package') || lines.some((line) => line.id === 'translation-package')) return null;
  return {
    description: 'Fordítás: Basic (angol, német) – benne van', descriptionNl: 'Vertaling: Basic (Engels, Duits) – inbegrepen',
    quantity: 1, unit: 'db', unitNl: 'stuk', unitCents: 0, catalogId: 'translation-basic', listCents: 0,
  };
}

/** A stored order line, carried onto an invoice in both languages. */
export function invoiceLineFromOrder(line: OrderLine, items: CatalogueItem[]): InvoiceLine {
  // A tiered line names the tier it was charged at; older lines have no tier and match the plain id.
  const tierCount = line.tier ? items.filter((i) => i.id === line.id || i.id.startsWith(`${line.id}:`)).length : 1;
  const item = (line.tier && items.find((i) => i.id === tierItemId(line.id, line.tier!.index, tierCount))) || items.find((i) => i.id === line.id);
  // A translation package keeps its own label (the package, how many languages, how many switched off) and says that
  // switching languages off does not change the price. It is written into the line, so it stays true on the paper.
  const package_ = line.id === 'translation-package';
  return {
    description: package_ ? `${line.label}\n${TRANSLATION_PRICE_NOTE.hu}` : (item?.hu ?? line.label),
    descriptionNl: package_ ? `${line.label}\n${TRANSLATION_PRICE_NOTE.nl}` : item?.nl,
    quantity: line.quantity,
    unit: item?.unitHu ?? 'db',
    unitNl: item?.unitNl ?? 'stuk',
    unitCents: line.unitCents, // gross; repriced by the caller for zero-rated invoices
    catalogId: item?.id ?? line.id,
    listCents: line.unitCents,
  };
}
