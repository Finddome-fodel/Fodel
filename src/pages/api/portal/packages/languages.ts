/**
 * Csomagok → Egyedi nyelvek: what one language costs bought on its own (European / World-only) and which
 * languages are World-only. Saves only `translationPackages.singleEur` and `.worldOnly`; the packages of the other
 * tab stay as they are. New prices apply to new orders only.
 */
import type { APIRoute } from 'astro';
import { saveTranslationSettings } from '~/lib/portal/translation-packages-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const back = (query: string) => redirect(`/portal/packages/languages?${query}`);
  const form = await request.formData();
  const num = (key: string) => (String(form.get(key) ?? '').trim() === '' ? undefined : Number(String(form.get(key)).replace(',', '.')));

  const result = await saveTranslationSettings(locals, {
    singleEur: { european: num('single_european'), world: num('single_world') },
    worldOnly: form.getAll('world_only').map(String),
  }, 'languages');
  if (!result.ok) return back('error=' + encodeURIComponent(result.error));
  return back('saved=1');
};
