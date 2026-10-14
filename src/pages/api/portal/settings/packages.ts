/**
 * Saves the listing packages and extras' prices
 * (site_settings.services.listingPackages / .listingExtras / .packagePhone).
 *
 * Everything goes through listingCatalog(), which clamps every number, so
 * what is stored is exactly what the public pages and checkout will use.
 * New prices apply to new orders only — a stored order keeps its own lines.
 */
import type { APIRoute } from 'astro';
import { friendlyError } from '~/lib/portal/labels';
import { logEvent } from '~/lib/activity';
import { listingCatalog, VIDEO_MODES, type StoredListingPackage, type VideoMode } from '~/lib/listing-packages';

export const prerender = false;

const NAME_MAX = 80;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const back = (query: string) => redirect(`/portal/settings/packages?${query}`);

  const form = await request.formData();
  const text = (key: string) => String(form.get(key) ?? '').trim();
  const numOrNull = (key: string) => (text(key) === '' ? null : Number(text(key)));
  const recommended = text('recommended');

  const { data: existing, error: readError } = await locals.supabase.from('site_settings').select('services').eq('id', 1).maybeSingle();
  if (readError) return back('error=' + encodeURIComponent(friendlyError(readError.message)));
  const current = listingCatalog(existing?.services);

  const listingPackages: Record<string, StoredListingPackage> = {};
  const packagePhone: Record<string, boolean> = {};
  for (const pkg of current.packages) {
    const k = (field: string) => `${pkg.id}_${field}`;
    const tiered = form.get(k('tiered')) === 'yes';
    const unlimited = form.get(k('unlimited')) === 'yes';
    const video = text(k('video')) as VideoMode;
    const thresholdM = numOrNull(k('threshold_m'));
    listingPackages[pkg.id] = {
      names: { hu: text(k('name_hu')).slice(0, NAME_MAX), nl: text(k('name_nl')).slice(0, NAME_MAX) },
      priceEur: numOrNull(k('price')) ?? pkg.priceEur,
      priceEurAbove: tiered ? numOrNull(k('price_above')) : null,
      thresholdHuf: tiered && thresholdM !== null ? thresholdM * 1_000_000 : null,
      months: numOrNull(k('months')) ?? pkg.months,
      maxImages: unlimited ? null : numOrNull(k('max_images')) ?? pkg.maxImages ?? 20,
      video: VIDEO_MODES.includes(video) ? video : pkg.video,
      editedImages: form.get(k('edited_images')) === 'yes',
      editedText: form.get(k('edited_text')) === 'yes',
      recommended: recommended === pkg.id,
    };
    packagePhone[pkg.id] = form.get(k('phone')) === 'yes';
  }
  const listingExtras: Record<string, { priceEur: number }> = {};
  for (const extra of current.extras) {
    const price = numOrNull(`extra_${extra.id}`);
    listingExtras[extra.id] = { priceEur: price ?? extra.priceEur };
  }

  // Normalise through the same function every reader uses, then store that.
  const clean = listingCatalog({ listingPackages, listingExtras, packagePhone } as any);
  const stored = {
    listingPackages: Object.fromEntries(clean.packages.map(({ id, phone: _phone, ...rest }) => [id, rest])),
    listingExtras: Object.fromEntries(clean.extras.map((extra) => [extra.id, { priceEur: extra.priceEur }])),
    packagePhone: Object.fromEntries(clean.packages.map((pkg) => [pkg.id, pkg.phone])),
  };

  const services = { ...(existing?.services ?? {}), ...stored };
  const { error } = await locals.supabase.from('site_settings').update({ services }).eq('id', 1);
  if (error) return back('error=' + encodeURIComponent(friendlyError(error.message)));

  await logEvent({
    kind: 'settings.packages',
    actorId: locals.user?.id ?? null,
    actorEmail: locals.profile?.email ?? null,
    subjectType: 'site_settings',
    subjectId: null,
    source: 'portal',
    payload: { prices: clean.packages.map((pkg) => ({ id: pkg.id, priceEur: pkg.priceEur, priceEurAbove: pkg.priceEurAbove })) },
  }).catch(() => {});

  return back('saved=1');
};
