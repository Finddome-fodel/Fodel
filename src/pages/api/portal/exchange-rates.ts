import type { APIRoute } from 'astro';
import { exchangeRates } from '~/lib/exchange-rates';
export const prerender = false;
export const GET: APIRoute = async ({locals}) => {
  if (!locals.user) return Response.json({error:'unauthorized'},{status:401});
  try { return Response.json(await exchangeRates(), {headers:{'Cache-Control':'private, max-age=300'}}); }
  catch { return Response.json({error:'rates-unavailable'},{status:503}); }
};
