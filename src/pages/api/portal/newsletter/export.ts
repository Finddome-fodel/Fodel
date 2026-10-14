/** XLSX of the newsletter list, with the filters on screen. Admin only (middleware + check). */
import type { APIRoute } from 'astro';
import { buildWorkbook, type Cell } from '~/lib/xlsx';
import { logEvent } from '~/lib/activity';
import { loadSubscribers, newsletterFilters, NEWSLETTER_STATUS_LABEL, NEWSLETTER_LOCALE_LABEL } from '~/lib/portal/newsletter';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const { supabase, profile, user } = locals;
  if (profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });

  const filters = newsletterFilters(url.searchParams);
  const { rows, error } = await loadSubscribers(supabase, filters);
  if (error) return new Response('A hírlevél-lista nem olvasható (a 0019-es migráció lefutott?).', { status: 500 });

  const text = (v: string | null | undefined): Cell => ({ t: 'text', v });
  const date = (v: string | null): Cell => ({ t: 'date', v });
  const file = buildWorkbook([{
    name: 'Hírlevél',
    columns: [
      { header: 'E-mail', width: 34 },
      { header: 'Állapot', width: 20 },
      { header: 'Nyelv', width: 10 },
      { header: 'Feliratkozás helye', width: 16 },
      { header: 'Kérte', width: 17 },
      { header: 'Hozzájárulás (megerősítés)', width: 17 },
      { header: 'Leiratkozott', width: 17 },
    ],
    rows: rows.map((row: any): Cell[] => [
      text(row.email),
      text(NEWSLETTER_STATUS_LABEL[row.status] ?? row.status),
      text(NEWSLETTER_LOCALE_LABEL[row.locale] ?? row.locale),
      text(row.source),
      date(row.requested_at),
      date(row.consent_at),
      date(row.unsubscribed_at),
    ]),
  }]);

  await logEvent({
    kind: 'newsletter.exported', actorId: user?.id ?? null, actorEmail: profile?.email ?? null,
    subjectType: 'newsletter', source: 'portal', payload: { rowCount: rows.length, filters },
  }).catch(() => {});

  return new Response(new Uint8Array(file), {
    status: 200,
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="hirlevel-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      'cache-control': 'no-store',
    },
  });
};
