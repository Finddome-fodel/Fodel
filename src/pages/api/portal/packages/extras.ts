/**
 * Csomagok → Kiegészítők: the single price of every extra still sold.
 * Merges only its own keys into site_settings.services (saveServicesPatch).
 */
import type { APIRoute } from 'astro';
import { forbidden, saveServicesPatch } from '~/lib/portal/package-admin';
import { extrasPatch } from '~/lib/portal/package-forms';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (locals.profile?.role !== 'admin') return forbidden();
  const form = await request.formData();
  return saveServicesPatch(locals, (current) => extrasPatch(form, current), 'extras');
};
