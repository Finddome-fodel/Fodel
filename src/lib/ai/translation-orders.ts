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

/** The languages bought on an order, in order, without repeats. */
export function translationLocalesOf(lines: Pick<OrderLine, 'id' | 'locales'>[] | null | undefined): string[] {
  const all = (lines ?? []).filter((line) => line.id === 'translation').flatMap((line) => line.locales ?? []);
  return [...new Set(all)];
}

/** An order made only of translations: bought later, from a live listing. It never publishes anything. */
export function isTranslationOrder(lines: Pick<OrderLine, 'id' | 'kind'>[] | null | undefined): boolean {
  const list = lines ?? [];
  return list.length > 0 && list.every((line) => line.id === 'translation');
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
    const result = await enqueueTranslations(client, {
      propertyId: order.property_id,
      locales,
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
