/**
 * Csomagok → Ársávok: the price tiers of every package and extra (spec §9.3 validation).
 * Merges only its own keys into site_settings.services (saveServicesPatch).
 */
import type { APIRoute } from 'astro';
import { forbidden, saveServicesPatch } from '~/lib/portal/package-admin';
import { tiersPatch } from '~/lib/portal/package-forms';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (locals.profile?.role !== 'admin') return forbidden();
  const form = await request.formData();
  return saveServicesPatch(locals, (current) => tiersPatch(form, current), 'tiers');
};
