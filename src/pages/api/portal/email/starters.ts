/**
 * "Alapsablonok létrehozása": the FINDDOME starting set in one click — the
 * enquiry reply in Hungarian, Dutch, English and German, and a general letter
 * in Hungarian. All inactive; each still has its placeholders to fill in
 * before it can be switched on. A starter whose name already exists is skipped,
 * so a second click adds nothing twice.
 */
import type { APIRoute } from 'astro';
import { SITE_URL } from '~/config/site.mjs';
import { getCompany } from '~/lib/runtime-config';
import { friendlyError } from '~/lib/portal/labels';
import { baseTemplate, type BaseKind } from '~/lib/mail/base-templates';

export const prerender = false;

const STARTERS: { name: string; kind: BaseKind; locale: string }[] = [
  { name: 'Válasz érdeklődésre — magyar', kind: 'property', locale: 'hu' },
  { name: 'Válasz érdeklődésre — holland', kind: 'property', locale: 'nl' },
  { name: 'Válasz érdeklődésre — angol', kind: 'property', locale: 'en' },
  { name: 'Válasz érdeklődésre — német', kind: 'property', locale: 'de' },
  { name: 'Általános levél — magyar', kind: 'general', locale: 'hu' },
];

export const POST: APIRoute = async ({ locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const { supabase } = locals;
  const company = await getCompany();
  const { data: existing } = await supabase.from('mail_templates').select('name');
  const taken = new Set((existing ?? []).map((row: any) => row.name));

  const rows = STARTERS.filter((starter) => !taken.has(starter.name)).map((starter) => {
    const base = baseTemplate(starter.kind, starter.locale, company, SITE_URL);
    return { name: starter.name, subject: base.subject, body_html: base.html, locale: starter.locale, active: false, created_by: locals.user!.id };
  });
  if (rows.length === 0) return redirect('/portal/email?starters=0');
  const { error } = await supabase.from('mail_templates').insert(rows);
  if (error) return redirect('/portal/email?error=' + encodeURIComponent(friendlyError(error.message)));
  return redirect(`/portal/email?starters=${rows.length}`);
};
