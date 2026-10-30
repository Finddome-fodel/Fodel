/**
 * "Folytatás most": an admin asks for the waiting translations to be worked on
 * right now, instead of waiting for the next kick or the daily cron. Admin only
 * (the middleware guards this prefix); the work itself runs in /api/cron/translate.
 */
import type { APIRoute } from 'astro';
import { kickTranslation } from '~/lib/ai/translation-jobs';
import { isAiEnabled } from '~/lib/ai/client';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  if (locals.profile?.role !== 'admin') return new Response(JSON.stringify({ ok: false }), { status: 403, headers: { 'content-type': 'application/json' } });
  if (!isAiEnabled()) return new Response(JSON.stringify({ ok: false, error: 'ai-disabled', message: 'Az AI fordítás nincs bekapcsolva.' }), { status: 409, headers: { 'content-type': 'application/json' } });
  await kickTranslation(new URL(request.url).origin);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
