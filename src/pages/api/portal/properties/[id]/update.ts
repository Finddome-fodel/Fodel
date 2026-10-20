/**
 * Saves the editor's field values. Never changes `status` — that is a
 * separate, deliberate action (see status.ts, Stage 4) so "I edited some
 * text" and "I am submitting this for review" can never be conflated.
 *
 * This is server-side re-validation on top of RLS, per the plan's security
 * section: RLS already refuses the UPDATE outright if the caller doesn't own
 * the row or the row isn't in an editable status, but re-checking here first
 * means the seller gets a clear message instead of a silent no-op.
 *
 * Launch round: the guided setup (properties/[id]/setup.astro) saves here
 * too, one step at a time — a form carrying `step` updates only that step's
 * fields and answers in JSON, so "Continue" and autosave-on-blur can never
 * blank a field from another step. Without `step` this is the full editor's
 * save, unchanged.
 */
import type { APIRoute } from 'astro';
import { portalLang } from '~/lib/portal/auth-copy';
import { LOCALE_OPTIONS } from '~/lib/portal/properties';
import { extractYouTubeId } from '~/lib/video';
import { logEvent } from '~/lib/activity';
import { normalizePhone, isPhoneCountry } from '~/lib/validation';
import { boundsFor, COUNTRIES } from '~/config/countries';
import { friendlyError } from '~/lib/portal/labels';
import { getCompany } from '~/lib/runtime-config';
import { listingCatalog, packageOf } from '~/lib/listing-packages';
import { saveSetupStep, SETUP_STEPS, type SetupStep } from '~/lib/portal/setup';

export const prerender = false;

/** The seller's number in E.164 when it reads as one in the picked country; otherwise as typed. */
function sellerPhone(form: FormData): string | null {
  const raw = String(form.get('seller_phone') ?? '').trim();
  if (!raw) return null;
  const picked = String(form.get('seller_phoneCountry') ?? '');
  const phone = normalizePhone(raw, isPhoneCountry(picked) ? picked : 'HU');
  return phone.ok ? phone.e164 : raw.slice(0, 40);
}

const str = (form: FormData, key: string): string => String(form.get(key) ?? '').trim();
const num = (form: FormData, key: string): number | null => {
  const v = str(form, key);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const POST: APIRoute = async ({ request, params, locals, redirect }) => {
  const { id } = params;
  const { supabase, profile, user } = locals;
  const form = await request.formData();

  const back = (query: string) => redirect(`/portal/properties/${id}?${query}`);
  const step = String(form.get('step') ?? '');

  const { data: existing, error: fetchError } = await supabase
    .from('properties')
    .select('id, owner_id, status, package, bargain, bargain_since')
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) return back('error=not-found');

  const isAdmin = profile?.role === 'admin';
  const isOwner = existing.owner_id === user?.id;
  if (!isAdmin && !isOwner) return back('error=forbidden');
  if (!isAdmin && !['draft', 'changes_requested'].includes(existing.status)) {
    if (step) return Response.json({ ok: false, error: 'not-editable' }, { status: 409 });
    return back('error=' + encodeURIComponent('ez a hirdetés jelenleg nem szerkeszthető'));
  }

  // One step of the guided setup: only that step's fields, answered in JSON.
  if (step) {
    if (!(SETUP_STEPS as readonly string[]).includes(step)) return Response.json({ ok: false, error: 'unknown-step' }, { status: 400 });
    const result = await saveSetupStep(supabase, existing, step as SetupStep, form, { isAdmin, locale: portalLang(profile?.locale) });
    if (result.ok) {
      await logEvent({
        kind: 'listing.edited',
        actorId: user?.id ?? null,
        actorEmail: profile?.email ?? null,
        subjectType: 'property',
        subjectId: id,
        propertyId: id ?? null,
        source: 'setup',
        payload: { step },
      }).catch(() => {});
    }
    return Response.json(result, { status: result.ok ? 200 : 422 });
  }

  const patch = {
    category: str(form, 'category'),
    country: str(form, 'country') || 'HU',
    condition_key: str(form, 'condition_key') || null,
    heating_key: str(form, 'heating_key') || null,
    settlement: str(form, 'settlement'),
    county: str(form, 'county'),
    region: str(form, 'region'),
    lat: num(form, 'lat'),
    lng: num(form, 'lng'),
    precision: str(form, 'precision') || 'approximate',
    price_eur: num(form, 'price_eur') ?? 0,
    price_huf: num(form, 'price_huf') ?? 0,
    price_asof: str(form, 'price_asof') || new Date().toISOString().slice(0, 10),
    price_negotiable: form.get('price_negotiable') === 'yes',
    floor_m2: num(form, 'floor_m2'),
    plot_m2: num(form, 'plot_m2') ?? 0,
    bedrooms: num(form, 'bedrooms'),
    bathrooms: num(form, 'bathrooms'),
    year_built: num(form, 'year_built'),
    renovated_in: num(form, 'renovated_in'),
    epc_class: str(form, 'epc_class') || 'pending',
    features: form.getAll('features').map(String),
    video_url: str(form, 'video_url') || null,
    seller_contact_visible: form.get('seller_contact_visible') === 'yes',
    seller_name: str(form, 'seller_name') || null,
    seller_phone: sellerPhone(form),
    seller_speaks: form.getAll('seller_speaks').map(String),
    ...(form.has('reserved') || existing.status === 'published'
      ? { reserved: form.get('reserved') === 'yes' }
      : {}),
    ...(isAdmin ? {
      featured: form.get('featured') === 'yes',
      homepage_featured: form.get('homepage_featured') === 'yes',
      homepage_order: num(form, 'homepage_order') ?? 99,
      // The Top 10 is curated in one place only — /portal/top10 — so its
      // order can never be set two different ways.
      bargain: form.get('bargain') === 'yes',
      bargain_since: form.get('bargain') === 'yes' ? (existing.bargain_since ?? new Date().toISOString()) : null,
    } : {}),
  };

  if (!patch.settlement || !patch.county || !patch.region || patch.lat == null || patch.lng == null) {
    return back('error=' + encodeURIComponent('minden helyszín mező kitöltése kötelező'));
  }
  if (!(patch.country in COUNTRIES)) return back('error=' + encodeURIComponent('ismeretlen országkód'));
  const bounds = boundsFor(patch.country)!;
  if (patch.lng < bounds[0] || patch.lng > bounds[2] || patch.lat < bounds[1] || patch.lat > bounds[3]) {
    return back('error=' + encodeURIComponent('a koordináta a kiválasztott ország határain kívül esik'));
  }
  if (patch.price_eur <= 0 || patch.price_huf <= 0) {
    return back('error=' + encodeURIComponent('az árnak pozitív számnak kell lennie'));
  }
  if (patch.plot_m2 <= 0) {
    return back('error=' + encodeURIComponent('a telekméretnek pozitív számnak kell lennie'));
  }
  // Reject a video link that won't embed, at the point of typing. The same
  // extractor the public page uses decides — so if it passes here, the player
  // on the listing will work. Otherwise the seller pays €36 for a video
  // placement and finds out weeks later that nothing renders.
  // A package without video (admin setting) takes no video from the owner.
  if (!isAdmin && patch.video_url && packageOf(listingCatalog((await getCompany()).services), existing.package).video === 'none') {
    return back('error=' + encodeURIComponent('a választott csomag nem tartalmaz videót — kérjen nagyobb csomagot munkatársunktól'));
  }
  if (patch.video_url && !extractYouTubeId(patch.video_url)) {
    return back(
      'error=' +
        encodeURIComponent(
          'a videó URL nem ismerhető fel — YouTube-linket adjon meg (pl. https://www.youtube.com/watch?v=… vagy https://youtu.be/…)'
        )
    );
  }

  const { error: updateError } = await supabase.from('properties').update(patch).eq('id', id);
  if (updateError) return back('error=' + encodeURIComponent(friendlyError(updateError.message)));

  // Wall material: its own statement, because the column arrives with
  // migration 0019 and must not cost the owner the rest of the save before it.
  if (form.has('wall_key')) {
    const { error: wallError } = await supabase.from('properties').update({ wall_key: str(form, 'wall_key') || null }).eq('id', id);
    if (wallError) console.warn('[update] wall_key not saved (migration 0019?)', wallError.message);
  }

  for (const { value: locale } of LOCALE_OPTIONS) {
    const title = str(form, `title_${locale}`);
    const description = str(form, `description_${locale}`);

    if (locale === 'hu' && (!title || !description)) {
      return back('error=' + encodeURIComponent('a magyar cím és leírás kitöltése kötelező'));
    }

    if (!title && !description) {
      // Nothing entered for this locale — make sure no stale translation lingers.
      await supabase.from('property_translations').delete().eq('property_id', id).eq('locale', locale);
      continue;
    }

    const row = {
      property_id: id,
      locale,
      title: title || description.slice(0, 60),
      subtitle: str(form, `subtitle_${locale}`) || null,
      description,
      body: str(form, `body_${locale}`),
      condition: str(form, `condition_${locale}`) || null,
      heating: str(form, `heating_${locale}`) || null,
      tag: str(form, `tag_${locale}`) || null,
    };
    const { error: trError } = await supabase
      .from('property_translations')
      .upsert(row, { onConflict: 'property_id,locale' });
    if (trError) return back('error=' + encodeURIComponent(friendlyError(trError.message)));
  }

  await logEvent({
    kind: 'listing.edited',
    actorId: user?.id ?? null,
    actorEmail: profile?.email ?? null,
    subjectType: 'property',
    subjectId: id,
    propertyId: id ?? null,
    source: 'portal',
  }).catch(() => {});

  return back('saved=1');
};
