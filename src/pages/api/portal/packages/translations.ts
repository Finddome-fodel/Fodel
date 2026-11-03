/**
 * Csomagok → Fordítási csomagok: names, prices, badges, pitch texts and (optionally) hand-made language lists of
 * the three translation packages. Saves only `translationPackages.packages`; the single-language prices of the
 * other tab and everything else in site_settings.services stay as they are. New prices apply to new orders only.
 */
import type { APIRoute } from 'astro';
import { TRANSLATION_PACKAGE_IDS } from '~/lib/translation-packages';
import { saveTranslationSettings } from '~/lib/portal/translation-packages-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const back = (query: string) => redirect(`/portal/packages/translations?${query}`);
  const form = await request.formData();
  const text = (key: string) => String(form.get(key) ?? '').trim();
  const recommended = text('recommended');

  const packages = TRANSLATION_PACKAGE_IDS.map((id) => {
    const k = (field: string) => `${id}_${field}`;
    const price = text(k('price'));
    return {
      id,
      ...(price === '' ? {} : { priceEur: Number(price) }),
      names: { hu: text(k('name_hu')), en: text(k('name_en')), nl: text(k('name_nl')) },
      badge: { hu: text(k('badge_hu')), en: text(k('badge_en')), nl: text(k('badge_nl')) },
      pitch: { hu: text(k('pitch_hu')), en: text(k('pitch_en')), nl: text(k('pitch_nl')) },
      active: form.get(k('active')) === 'yes',
      recommended: recommended === id,
      // A hand-made list replaces the rule only when its switch is on; English is added whatever is ticked.
      ...(form.get(k('override')) === 'yes' ? { locales: form.getAll(k('locale')).map(String) } : {}),
    };
  });

  const result = await saveTranslationSettings(locals, { packages }, 'translations');
  if (!result.ok) return back('error=' + encodeURIComponent(result.error));
  return back('saved=1');
};
