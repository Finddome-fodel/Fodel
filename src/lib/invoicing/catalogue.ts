/**
 * What can be put on an invoice with one click: the listing packages, the
 * extras, the on-site services and the paid valuation packages, with their
 * Hungarian and Dutch names. Prices are the published ones (gross, VAT
 * included); model.listPriceCents() turns them into the right figure for the
 * invoice at hand.
 */
import { listingCatalog } from '~/lib/listing-packages';
import { catalogue as orderCatalogue, type OrderLine } from '~/lib/orders';
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
};

export function invoiceCatalogue(services?: Services): CatalogueItem[] {
  const listing = listingCatalog(services);
  const hu = orderCatalogue('hu', listing);
  const nl = orderCatalogue('nl', listing);
  const items: CatalogueItem[] = [];

  hu.packages.forEach((pkg, i) => {
    const months = pkg.months;
    const above = pkg.thresholdHuf ? Math.round(pkg.thresholdHuf / 1_000_000) : 0;
    items.push({
      id: pkg.id, group: 'Hirdetési csomagok', hu: `${pkg.label} — ${months} hónap`, nl: `${nl.packages[i].label} — ${months} maanden`,
      unitHu: 'db', unitNl: 'stuk', grossCents: pkg.priceEur * 100,
    });
    if (pkg.priceEurAbove) {
      items.push({
        id: `${pkg.id}:above`, group: 'Hirdetési csomagok', hu: `${pkg.label} — ${months} hónap (${above} M Ft felett)`, nl: `${nl.packages[i].label} — ${months} maanden (boven HUF ${above} mln)`,
        unitHu: 'db', unitNl: 'stuk', grossCents: pkg.priceEurAbove * 100,
      });
    }
  });

  hu.extras.forEach((extra, i) => {
    const onsite = extra.id.startsWith('onsite-');
    items.push({
      id: extra.id,
      group: onsite ? 'Helyszíni szolgáltatások' : 'Extrák',
      hu: extra.label,
      nl: nl.extras[i].label,
      unitHu: extra.unit || 'db',
      unitNl: nl.extras[i].unit || 'stuk',
      grossCents: extra.priceEur * 100,
    });
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
 * Every listing comes with English and German (Go). Go costs nothing, so it has no order line; the invoice says so
 * in one line without a price, unless a bigger package was bought, which already names its languages.
 */
export function goIncludedLine(lines: OrderLine[]): InvoiceLine | null {
  if (!lines.some((line) => line.kind === 'package') || lines.some((line) => line.id === 'translation-package')) return null;
  return {
    description: 'Fordítás: Go (angol, német) – benne van', descriptionNl: 'Vertaling: Go (Engels, Duits) – inbegrepen',
    quantity: 1, unit: 'db', unitNl: 'stuk', unitCents: 0, catalogId: 'translation-go', listCents: 0,
  };
}

/** A stored order line, carried onto an invoice in both languages. */
export function invoiceLineFromOrder(line: OrderLine, items: CatalogueItem[]): InvoiceLine {
  const item = items.find((i) => i.id === line.id);
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
