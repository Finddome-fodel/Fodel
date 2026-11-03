/**
 * Server side of the photo moderation (spec §4c part 2, migration 0053):
 * telling the office that a live listing has new photos, and carrying out
 * an admin's batch of approve / reject decisions.
 *
 * Every query runs through the caller's own session, so RLS and the 0053
 * triggers decide as well; only the admin roster is read with the service
 * role (the owner may not see it).
 */
import { SITE_URL } from '~/config/site.mjs';
import { logEvent } from '~/lib/activity';
import { deleteImage } from '~/lib/media';
import { adminRecipients, deliver, localeOf, templates } from '~/lib/email/send';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { listingTitle } from '~/lib/portal/publish';
import { groupRejections, nextCover, reasonText, type PhotoDecision } from '~/lib/portal/photo-moderation';

/** Runs work that follows a saved change: a failure is logged, never thrown. */
async function safely<T>(what: string, task: () => Promise<T>): Promise<T | null> {
  try {
    return await task();
  } catch (e) {
    console.error(`[photo-review] ${what} failed after the change was saved`, e);
    return null;
  }
}

/** First pending photo of a batch → one e-mail to the office (later uploads in the same batch stay quiet; the queue shows the count). */
export async function notifyPhotosPending(
  supabase: any,
  property: { id: string; ref: string },
  owner: { email?: string | null; full_name?: string | null } | null
): Promise<void> {
  await safely('admin notice', async () => {
    const admin = createSupabaseAdminClient();
    const recipients = await adminRecipients(admin);
    const title = await listingTitle(supabase, property.id, 'hu', property.ref);
    const who = [owner?.full_name, owner?.email ? `(${owner.email})` : ''].filter(Boolean).join(' ');
    const email = templates.adminPhotosPending('hu', {
      ref: property.ref,
      title,
      owner: who,
      url: `${SITE_URL}/portal/photos#listing-${property.id}`,
    });
    await Promise.all(recipients.map((to) => deliver(to, email, owner?.email ?? undefined)));
  });
}

export type ReviewResult =
  | { ok: true; approved: number; rejected: number; emailed: boolean }
  | { ok: false; status: number; error: string };

/**
 * Applies one admin batch for one listing. Only photos that are still
 * pending are touched: a decision for a photo the owner removed meanwhile,
 * or another admin already decided, is skipped, never an error.
 */
export async function reviewPhotos(
  supabase: any,
  actor: { id: string; email: string | null },
  propertyId: string,
  decisions: PhotoDecision[]
): Promise<ReviewResult> {
  const { data: property } = await supabase
    .from('properties')
    .select('id, ref, owner_id, status')
    .eq('id', propertyId)
    .maybeSingle();
  if (!property) return { ok: false, status: 404, error: 'not-found' };

  const ids = decisions.map((d) => d.id);
  const { data: rows, error: readError } = await supabase
    .from('property_media')
    .select('id, storage_path, pending')
    .eq('property_id', propertyId)
    .in('id', ids);
  if (readError) return { ok: false, status: 500, error: 'read-failed' };
  const waiting = new Map<string, { storage_path: string }>(
    (rows ?? []).filter((r: { pending: boolean }) => r.pending).map((r: { id: string; storage_path: string }) => [r.id, r])
  );
  const live = decisions.filter((d) => waiting.has(d.id));
  const approveIds = live.filter((d) => d.action === 'approve').map((d) => d.id);
  const rejects = live.filter((d) => d.action === 'reject');
  const now = new Date().toISOString();

  if (approveIds.length) {
    const { error } = await supabase
      .from('property_media')
      .update({ pending: false, reviewed_at: now, reviewed_by: actor.id })
      .eq('property_id', propertyId)
      .eq('pending', true)
      .in('id', approveIds);
    if (error) return { ok: false, status: 500, error: 'save-failed' };
  }

  if (rejects.length) {
    const { error } = await supabase
      .from('property_media')
      .delete()
      .eq('property_id', propertyId)
      .eq('pending', true)
      .in('id', rejects.map((d) => d.id));
    if (error) return { ok: false, status: 500, error: 'save-failed' };
    for (const d of rejects) await deleteImage(supabase, waiting.get(d.id)!.storage_path).catch(() => {});
    const grouped = groupRejections(rejects);
    const { error: noteError } = await supabase.from('property_media_rejections').insert(
      grouped.map((g) => ({
        property_id: propertyId,
        photo_count: g.count,
        reason_code: g.code,
        reason: reasonText(g.code, g.note),
        note: g.note ?? null,
        decided_by: actor.id,
      }))
    );
    if (noteError) console.error('[photo-review] rejection notice not saved', noteError.message);
  }

  // A gallery whose cover is gone (or never was) gets the first approved photo.
  await safely('cover', async () => {
    const { data: gallery } = await supabase
      .from('property_media')
      .select('id, pending, is_hero, sort_order')
      .eq('property_id', propertyId);
    const cover = nextCover(gallery ?? []);
    if (!cover) return;
    const order = [...(gallery ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order).map((m: any) => m.id);
    await supabase.rpc('reorder_property_media', { p_id: propertyId, p_ids: order, p_cover: cover });
  });

  let emailed = false;
  if (live.length) {
    await safely('log', () =>
      logEvent({
        kind: 'media.reviewed',
        actorId: actor.id,
        actorEmail: actor.email,
        subjectType: 'property',
        subjectId: propertyId,
        propertyId,
        source: 'portal',
        payload: { ref: property.ref, approved: approveIds.length, rejected: rejects.length },
      })
    );
    emailed =
      (await safely('owner e-mail', async () => {
        if (!property.owner_id) return false;
        const { data: owner } = await supabase
          .from('profiles')
          .select('email, locale')
          .eq('id', property.owner_id)
          .maybeSingle();
        if (!owner?.email) return false;
        const locale = localeOf(owner);
        const title = await listingTitle(supabase, propertyId, locale, property.ref);
        const email = templates.photosReviewed(locale, {
          ref: property.ref,
          title,
          approved: approveIds.length,
          rejected: groupRejections(rejects),
          url: `${SITE_URL}/portal/properties/${propertyId}#photos`,
        });
        return deliver(owner.email, email);
      })) === true;
  }

  return { ok: true, approved: approveIds.length, rejected: rejects.length, emailed };
}
