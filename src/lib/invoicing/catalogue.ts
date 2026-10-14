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

/** A stored order line, carried onto an invoice in both languages. */
export function invoiceLineFromOrder(line: OrderLine, items: CatalogueItem[]): InvoiceLine {
  const item = items.find((i) => i.id === line.id);
  return {
    description: item?.hu ?? line.label,
    descriptionNl: item?.nl,
    quantity: line.quantity,
    unit: item?.unitHu ?? 'db',
    unitNl: item?.unitNl ?? 'stuk',
    unitCents: line.unitCents, // gross; repriced by the caller for zero-rated invoices
    catalogId: item?.id ?? line.id,
    listCents: line.unitCents,
  };
}
