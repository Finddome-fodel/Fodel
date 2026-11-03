import type { APIRoute } from 'astro';
import { deleteImage } from '~/lib/media';
import { isLocale } from '~/i18n/ui';
import { photoAccess, nextCover } from '~/lib/portal/photo-moderation';

export const prerender = false;

/**
 * An owner may change photos freely while the listing is theirs to edit
 * (draft or changes requested) — the same rule as every other field. On a
 * live listing (§4c, migration 0053) they may remove photos, reorder them and
 * pick an approved cover; a photo still waiting for review can be recaptioned
 * or removed, an approved one is not rewritten unseen. A submitted listing's
 * photos change only through review (brief §7). RLS and the 0053 triggers
 * enforce the same rules independently.
 */
async function authorize(locals: App.Locals, propertyId: string) {
  const { supabase, profile, user } = locals;
  const { data: property } = await supabase
    .from('properties')
    .select('id, owner_id, status')
    .eq('id', propertyId)
    .maybeSingle();
  if (!property) return { ok: false as const, status: 404 };
  const isAdmin = profile?.role === 'admin';
  if (!isAdmin && property.owner_id !== user?.id) {
    return { ok: false as const, status: 403 };
  }
  const access = photoAccess(property.status, { isAdmin, isOwner: property.owner_id === user?.id });
  if (access === 'none') return { ok: false as const, status: 409, error: 'not-editable' };
  return { ok: true as const, supabase, live: access === 'live' };
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id, mediaId } = params;
  const auth = await authorize(locals, id!);
  if (!auth.ok) return json(auth.status, { ok: false, error: 'error' in auth ? auth.error : undefined });

  const { data: media } = await auth.supabase
    .from('property_media')
    .select('storage_path, is_hero, pending')
    .eq('id', mediaId)
    .eq('property_id', id)
    .maybeSingle();
  if (!media) return json(404, { ok: false, error: 'not-found' });
  // A live listing keeps at least one photo on the site (0053 enforces it too).
  if (auth.live && !media.pending) {
    const { count } = await auth.supabase
      .from('property_media')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', id)
      .eq('pending', false)
      .neq('id', mediaId);
    if ((count ?? 0) === 0) return json(409, { ok: false, error: 'last-photo' });
  }
  const { error } = await auth.supabase.from('property_media').delete().eq('id', mediaId).eq('property_id', id);
  if (error) return json(error.message.includes('last-photo') ? 409 : 500, { ok: false, error: error.message.includes('last-photo') ? 'last-photo' : 'save-failed' });
  await deleteImage(auth.supabase, media.storage_path);

  // Deleting the cover photo must not leave a listing with none. Promote the
  // next one by sort order, or the public page falls back to `media[0]`
  // anyway and the portal's "cover" badge silently disagrees with what the
  // website shows.
  // A photo still waiting for review is never the cover, so it is skipped.
  if (media.is_hero) {
    const { data: rest } = await auth.supabase
      .from('property_media')
      .select('id, pending, is_hero, sort_order')
      .eq('property_id', id);
    const next = nextCover(rest ?? []);
    if (next) {
      await auth.supabase.from('property_media').update({ is_hero: true }).eq('id', next);
    }
  }

  return json(200, { ok: true });
};

/**
 * Updates one photo: which is the cover, and its description.
 *
 * The description matters more than it looks. Until 1.1 every uploaded photo
 * was stored with `alt: {}` — no description at all — which fails the site's
 * own accessibility preflight (`npm run verify:ssg` asserts alt text on every
 * image) and throws away image-search traffic on a site whose product is
 * photographs of houses.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id, mediaId } = params;
  const auth = await authorize(locals, id!);
  if (!auth.ok) return json(auth.status, { ok: false, error: 'error' in auth ? auth.error : undefined });

  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};

  const { data: photo } = await auth.supabase
    .from('property_media')
    .select('id, pending')
    .eq('id', mediaId)
    .eq('property_id', id)
    .maybeSingle();
  if (!photo) return json(404, { ok: false, error: 'not-found' });
  // On a live listing an approved caption is on the site; changing it would skip the review.
  if (auth.live && typeof body.alt === 'string' && !photo.pending) return json(409, { ok: false, error: 'approved-photo-locked' });
  if (body.isHero && photo.pending) return json(422, { ok: false, error: 'pending-cover' });

  if (typeof body.alt === 'string') {
    const alt = body.alt.trim().slice(0, 160);
    // Stored per locale, same shape the public site reads through `text()`.
    // Hungarian is the language the owner writes in; the other locales fall
    // back to it exactly as titles and descriptions do.
    // A Dutch-speaking seller's caption (from the guided setup) is kept as
    // Dutch and, until the office translates it, also stands in for the
    // Hungarian one — an image with no description at all is the worse
    // outcome for the accessibility check.
    patch.alt = !alt ? {} : typeof body.locale === 'string' && isLocale(body.locale) && body.locale !== 'hu' ? { hu: alt, [body.locale]: alt } : { hu: alt };
  }

  if (Object.keys(patch).length > 0) {
    const { error } = await auth.supabase.from('property_media').update(patch).eq('id', mediaId).eq('property_id', id);
    if (error) return json(500, { ok: false, error: error.message });
  }

  if (body.isHero) {
    const {data:gallery,error:readError}=await auth.supabase.from('property_media').select('id').eq('property_id',id).order('sort_order');
    if(readError)return json(500,{ok:false,error:'save-failed'});
    const {error}=await auth.supabase.rpc('reorder_property_media',{p_id:id,p_ids:(gallery||[]).map(m=>m.id),p_cover:mediaId});
    if(error)return json(422,{ok:false,error:'save-failed'});
  }

  return json(200, { ok: true });
};
