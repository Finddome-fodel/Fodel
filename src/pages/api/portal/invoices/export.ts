/** Monthly CSV for the bookkeeper: ?month=2026-08 (default: all). Semicolons and a BOM, so Excel opens it with the right columns and accents. */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { VAT_TREATMENTS, hufFromCents } from '~/lib/invoicing/model';

export const prerender = false;

const cell = (v: unknown): string => {
  const s = String(v ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const money = (cents: number): string => (cents / 100).toFixed(2).replace('.', ',');

export const GET: APIRoute = async ({ url, locals }) => {
  if (locals.profile?.role !== 'admin') return new Response('Forbidden', { status: 403 });
  const month = url.searchParams.get('month') ?? '';
  // Deliberate exception: the bookkeeper's export runs in issue order, the
  // order the numbered series is kept in.
  let q = createSupabaseAdminClient().from('invoices').select('*').not('finalised_at', 'is', null).order('issued_at');
  if (/^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
    q = q.gte('issued_at', `${month}-01`).lt('issued_at', next);
  }
  const { data, error } = await q;
  if (error) return new Response(error.message, { status: 500 });

  const head = ['Sorszám', 'Típus', 'Állapot', 'Kelt', 'Teljesítés', 'Fizetési határidő', 'Vevő', 'Ország', 'Adószám', 'ÁFA kezelés', 'ÁFA kulcs %', 'Nettó EUR', 'ÁFA EUR', 'Bruttó EUR', 'Árfolyam', 'Bruttó HUF', 'Kifizetve'];
  const rows = (data ?? []).map((r: any) => {
    const sign = r.kind === 'credit_note' ? -1 : 1;
    return [
      r.number, r.kind === 'invoice' ? 'Számla' : r.kind === 'proforma' ? 'Díjbekérő' : 'Jóváíró számla', r.status,
      String(r.issued_at).slice(0, 10), r.supply_date ?? '', r.due_date ?? '',
      r.buyer?.name ?? r.billing_name ?? '', r.buyer?.countryCode ?? '', r.buyer?.taxNumber ?? '',
      VAT_TREATMENTS[r.vat_treatment as keyof typeof VAT_TREATMENTS]?.short ?? '', r.vat_rate,
      money(r.net_cents * sign), money(r.vat_cents * sign), money(r.gross_cents * sign),
      r.fx_rate ?? '', r.fx_rate ? hufFromCents(r.gross_cents * sign, Number(r.fx_rate)) : '',
      r.paid_at ? String(r.paid_at).slice(0, 10) : '',
    ];
  });
  const csv = '﻿' + [head, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="szamlak-${month || 'osszes'}.csv"`,
    },
  });
};
