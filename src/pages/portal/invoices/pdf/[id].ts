/**
 * The invoice PDF. Reachable by an admin, by the invoice's own owner, or by
 * anyone holding the invoice's view token (the link in the email).
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { getRow, loadDoc, pdfName } from '~/lib/invoicing/store';
import { renderInvoicePdf } from '~/lib/invoicing/pdf';

export const prerender = false;

export const GET: APIRoute = async ({ params, url, locals }) => {
  const { profile, user } = locals;
  const admin = createSupabaseAdminClient();
  const row = await getRow(admin, String(params.id));
  if (!row) return new Response('Nem található.', { status: 404 });

  const token = url.searchParams.get('t');
  const allowed =
    profile?.role === 'admin' ||
    (Boolean(user) && row.owner_id === user!.id && Boolean(row.finalised_at)) ||
    (Boolean(token) && token === row.view_token && Boolean(row.finalised_at));
  if (!allowed) return new Response('Nem található.', { status: 404 });

  const pdf = await renderInvoicePdf(await loadDoc(admin, row));
  const name = row.number ? pdfName(row.number) : 'piszkozat.pdf';
  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `${url.searchParams.has('download') ? 'attachment' : 'inline'}; filename="${name}"`,
      'cache-control': 'private, no-store',
    },
  });
};
