import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { friendlyError } from '~/lib/portal/labels';
import { sanitiseSettings } from '~/lib/invoicing/settings';

export const prerender = false;

const back = (q: string) => `/portal/settings/invoicing?${q}`;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const form = await request.formData();
  const settings = sanitiseSettings({
    bookkeeperEmail: form.get('bookkeeperEmail'),
    autoBookkeeperCopy: form.get('autoBookkeeperCopy') === 'yes',
    paymentTermsDays: form.get('paymentTermsDays'),
    defaultNotes: form.get('defaultNotes'),
    issuerName: form.get('issuerName'),
    issuerPhone: form.get('issuerPhone'),
    issuerEmail: form.get('issuerEmail'),
  });
  if (settings.bookkeeperEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.bookkeeperEmail)) {
    return redirect(back('error=' + encodeURIComponent('A könyvelő e-mail-címe nem érvényes.')));
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('invoice_settings').upsert({ id: 1, data: settings, updated_at: new Date().toISOString() });
  if (error) return redirect(back('error=' + encodeURIComponent(friendlyError(error.message))));

  // Raising a counter lets the numbering continue from the old system. It can
  // only go up: lowering one would re-issue a number that already exists.
  for (const [key, value] of form.entries()) {
    if (!key.startsWith('next:')) continue;
    const series = key.slice(5);
    const next = Math.floor(Number(value));
    if (!series || !Number.isFinite(next) || next < 1) continue;
    const { data: current } = await admin.from('invoice_counters').select('n').eq('series', series).maybeSingle();
    if (next - 1 > (current?.n ?? 0)) await admin.from('invoice_counters').upsert({ series, n: next - 1 });
  }
  return redirect(back('saved=1'));
};
