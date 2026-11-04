/**
 * Today's EUR/HUF rate for the informational forint hints on the (static) price pages.
 *
 * The pages are built ahead of time and must not bake a rate in, so the hints are filled in by a few lines of script
 * from this endpoint. It is cached at the CDN for an hour (stale for a day), so the page costs one read per hour, and
 * without it (or without JavaScript) the euro prices simply stand alone. Nothing here is ever used to charge anything.
 */
import type { APIRoute } from 'astro';
import { currentRate } from '~/lib/fx-store';

export const prerender = false;

export const GET: APIRoute = async () => {
  const fx = await currentRate().catch(() => null);
  return new Response(JSON.stringify(fx ? { rate: fx.rate, date: fx.date } : { rate: null }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      // No rate is not cached for long: it is an outage, not an answer.
      'cache-control': fx ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'public, s-maxage=60',
    },
  });
};
