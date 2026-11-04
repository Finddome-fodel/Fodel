/**
 * Csomagok → Egyedi nyelvek. Merges only its own keys into site_settings.services (saveServicesPatch); a value that
 * cannot be saved is refused with a Hungarian message and nothing is written.
 */
import type { APIRoute } from 'astro';
import { forbidden, saveServicesPatch } from '~/lib/portal/package-admin';
import { singlesPatch } from '~/lib/portal/package-forms';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (locals.profile?.role !== 'admin') return forbidden();
  const form = await request.formData();
  return saveServicesPatch(locals, (current) => singlesPatch(form, current), 'languages');
};
