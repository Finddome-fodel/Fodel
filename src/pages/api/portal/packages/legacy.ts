/**
 * The old Beállítások → Hirdetési csomagok form (POST /api/portal/settings/packages
 * re-exports this). Only a browser tab opened before the Csomagok menu existed
 * still posts here: it saves the packages and extras the way that page always
 * did, then lands on the new menu.
 */
import type { APIRoute } from 'astro';
import { forbidden, saveServicesPatch } from '~/lib/portal/package-admin';
import { legacyPatch } from '~/lib/portal/package-forms';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (locals.profile?.role !== 'admin') return forbidden();
  const form = await request.formData();
  return saveServicesPatch(locals, (current) => legacyPatch(form, current), 'listing', { payload: { legacy: true } });
};
