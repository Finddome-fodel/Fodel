/**
 * Csomagok → Kerekítés: the euro step HUF prices are rounded to when converted (spec §8).
 * Merges only its own keys into site_settings.services (saveServicesPatch).
 */
import type { APIRoute } from 'astro';
import { forbidden, saveServicesPatch } from '~/lib/portal/package-admin';
import { roundingPatch } from '~/lib/portal/package-forms';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (locals.profile?.role !== 'admin') return forbidden();
  const form = await request.formData();
  return saveServicesPatch(locals, () => roundingPatch(form), 'rounding');
};
