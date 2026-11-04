/**
 * Paid translations: reading the languages off a stored order, and turning a
 * settled payment into jobs.
 *
 * The languages always come from the order's own line items (written when the
 * order was made, from the admin's confirmed selection or the owner's purchase
 * and priced from the catalogue), never from anything sent at payment time.
 * Jobs are created only once the money is in; a retried webhook, an admin
 * pressing "paid" twice and a second delivery all land on the same rows
 * (enqueueTranslations skips a language the same payment already ordered).
 */
import type { EnqueueResult, JobOrigin } from './translation-jobs';
import type { OrderLine } from '../orders';
import { TRANSLATION_LINE_IDS, TRANSLATION_PACKAGE_IDS, type TranslationPackageId } from '../translation-packages.ts';

type Line = Pick<OrderLine, 'id' | 'locales'> & { packageId?: string };

/** The languages bought on an order, in order, without repeats: single languages and the ones a package covers. */
export function translationLocalesOf(lines: Line[] | null | undefined): string[] {
  const all = (lines ?? []).filter((line) => TRANSLATION_LINE_IDS.includes(line.id)).flatMap((line) => line.locales ?? []);
  return [...new Set(all)];
}

/** An order made only of translations: bought later, from a live listing. It never publishes anything. */
export function isTranslationOrder(lines: Pick<OrderLine, 'id' | 'kind'>[] | null | undefined): boolean {
  const list = lines ?? [];
  return list.length > 0 && list.every((line) => TRANSLATION_LINE_IDS.includes(line.id));
}

/**
 * What an order bought, read from its own (frozen) lines: the package, the single languages, and the languages the
 * package line says it covers. Never from anything sent at payment time.
 */
export function translationPurchaseOf(lines: Line[] | null | undefined): { packageId: TranslationPackageId | null; singles: string[]; packageLocalesPaid?: string[] } {
  const list = lines ?? [];
  const packageLine = list.find((line) => line.id === 'translation-package' && (TRANSLATION_PACKAGE_IDS as readonly string[]).includes(String(line.packageId)));
  const singles = [...new Set(list.filter((line) => line.id === 'translation' || line.id === 'translation-world').flatMap((line) => line.locales ?? []))];
  return {
    packageId: packageLine ? (packageLine.packageId as TranslationPackageId) : null,
    singles,
    ...(packageLine ? { packageLocalesPaid: packageLine.locales ?? [] } : {}),
  };
}

/**
 * The package and single languages a settled order bought become the listing's entitlement. Called before the
 * listing is published (so the Go languages the buyer switched off are not translated first) and again with the
 * jobs; applying the same order twice leaves the same result. Never throws; nothing before migration 0053.
 */
export async function applyPaidEntitlement(client: any, order: { id: string; property_id: string | null; line_items: OrderLine[] | null }): Promise<void> {
  if (!order.property_id || translationLocalesOf(order.line_items).length === 0) return;
  try {
    const { applyPurchase } = await import('./translation-entitlement');
    const { getCompany } = await import('../runtime-config');
    const { listingCatalog } = await import('../listing-packages');
    const catalog = listingCatalog((await getCompany()).services);
    await applyPurchase(client, order.property_id, translationPurchaseOf(order.line_items), catalog.translation);
  } catch (error) {
    console.error(`[translate] entitlement not applied for order ${order.id}`, error instanceof Error ? error.message : error);
  }
}

/**
 * Called wherever a payment becomes settled (the Stripe webhook, "mark paid",
 * "publish, paid by transfer") once the listing is live. Returns what was
 * created; never throws into the payment path: a failure is logged and the
 * job can be created again by the same call, because it is idempotent.
 */
export async function enqueuePaidTranslations(
  client: any,
  order: { id: string; property_id: string | null; line_items: OrderLine[] | null; owner_id?: string | null },
  kickOrigin?: string
): Promise<EnqueueResult | null> {
  const locales = translationLocalesOf(order.line_items);
  if (!order.property_id || locales.length === 0) return null;
  const origin: JobOrigin = isTranslationOrder(order.line_items) ? 'after_publish_paid' : 'upload_paid';
  try {
    // Loaded here, not at the top, so the pure helpers above stay importable without a database client.
    const { enqueueTranslations, kickTranslation } = await import('./translation-jobs');
    // The package and the languages become the listing's entitlement first: a text that is made but not entitled is not published.
    await applyPaidEntitlement(client, order);
    // A language that already has a text (an upgrade: English and German are usually there) is not translated, or paid for, twice.
    const { data: rows } = await client.from('property_translations').select('locale, title, description').eq('property_id', order.property_id);
    const have = new Set((rows ?? []).filter((row: any) => String(row.title ?? '').trim() || String(row.description ?? '').trim()).map((row: any) => row.locale));
    const result = await enqueueTranslations(client, {
      propertyId: order.property_id,
      locales: locales.filter((code) => !have.has(code)),
      origin,
      status: 'queued',
      paymentId: order.id,
      requestedBy: order.owner_id ?? null,
    });
    if (result.created.length > 0 && kickOrigin) await kickTranslation(kickOrigin);
    return result;
  } catch (error) {
    console.error(`[translate] paid translations not queued for order ${order.id}`, error instanceof Error ? error.message : error);
    return null;
  }
}
