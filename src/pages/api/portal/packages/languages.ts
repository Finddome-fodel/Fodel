/**
 * Csomagok → Egyedi nyelvek: placeholder until the translation
 * packages land (CC-3 in claude-code-translations.md). Replace the body with
 * a patch of this tab's keys, saved through saveServicesPatch(locals, patch, 'languages').
 */
import type { APIRoute } from 'astro';
import { backToTab, forbidden } from '~/lib/portal/package-admin';

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  if (locals.profile?.role !== 'admin') return forbidden();
  return backToTab('languages', 'error=' + encodeURIComponent('Ez a fül még nem menthető.'));
};
