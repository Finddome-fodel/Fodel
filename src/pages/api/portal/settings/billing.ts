/**
 * Saves a customer's billing details. They live on the account (profiles.billing,
 * reused for every order and invoice) and, when an order is given, are also
 * copied onto that order so the invoice for it is complete without anyone
 * retyping anything. Signed-in owners can only touch their own account and
 * their own open orders.
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { sanitiseParty, billingComplete } from '~/lib/invoicing/model';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user } = locals;
  if (!user) return json(401, { ok: false });
  const body = await request.json().catch(() => ({}));
  const billing = sanitiseParty(body.billing);
  if (!billingComplete(billing)) return json(422, { ok: false, error: 'incomplete', message: 'A név, az ország, a város és az utca megadása kötelező.' });

  const { error } = await supabase.from('profiles').update({ billing }).eq('id', user.id);
  if (error) return json(500, { ok: false, error: 'save-failed', message: 'A mentés nem sikerült. Lehet, hogy a rendszer frissítése még nem fejeződött be.' });

  if (typeof body.paymentId === 'string') {
    const admin = createSupabaseAdminClient();
    const { data: order } = await admin.from('payments').select('id, owner_id, status').eq('id', body.paymentId).maybeSingle();
    if (order && order.owner_id === user.id && order.status === 'pending') {
      await admin
        .from('payments')
        .update({
          billing,
          billing_name: billing.name,
          billing_address: [billing.street, [billing.postalCode, billing.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
        })
        .eq('id', order.id);
    }
  }
  return json(200, { ok: true, billing });
};
