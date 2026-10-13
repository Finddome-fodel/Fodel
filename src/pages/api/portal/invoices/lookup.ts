/** Editor look-ups: customers to bill, VIES, and the EUR/HUF rate. Admin only (middleware). */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { searchCustomers } from '~/lib/invoicing/store';
import { checkVies, eurHufRate } from '~/lib/invoicing/lookups';
import { checkTaxId } from '~/lib/invoicing/model';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export const GET: APIRoute = async ({ url, locals }) => {
  if (locals.profile?.role !== 'admin') return json({ ok: false }, 403);
  const type = url.searchParams.get('type');

  if (type === 'customers') {
    const results = await searchCustomers(createSupabaseAdminClient(), url.searchParams.get('q') ?? '');
    return json({ ok: true, results });
  }
  if (type === 'fx') {
    const found = await eurHufRate(url.searchParams.get('date') ?? '');
    return json(found ? { ok: true, ...found } : { ok: false });
  }
  if (type === 'vies') {
    const cc = (url.searchParams.get('cc') ?? '').toUpperCase();
    const check = checkTaxId(cc, url.searchParams.get('id') ?? '');
    if (check.state !== 'valid') return json({ ok: false, reason: 'format' });
    return json({ ...(await checkVies(cc, check.value)), vatId: check.value });
  }
  return json({ ok: false }, 400);
};
