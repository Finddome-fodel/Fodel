/**
 * "Alapsablonok létrehozása": the FINDDOME starting set in one click — the
 * enquiry reply in Hungarian, Dutch, English and German, and a general letter
 * in Hungarian. All start inactive. The enquiry replies are complete as they
 * are — everything about the listing is a merge field, filled from whichever
 * listing the visitor asked about — so the admin only reads them through and
 * switches them on; the general letter still has its "[Írja át: …]" spots.
 * A starter whose name already exists is skipped, so a second click adds
 * nothing twice.
 */
import type { APIRoute } from 'astro';
import { SITE_URL } from '~/config/site.mjs';
import { getCompany } from '~/lib/runtime-config';
import { friendlyError } from '~/lib/portal/labels';
import { baseTemplate, type BaseKind } from '~/lib/mail/base-templates';
import { mailSchemaReady, SETUP_PATH } from '~/lib/mail/schema';

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
  if (!(await mailSchemaReady(supabase))) return redirect(SETUP_PATH);
  const company = await getCompany();
  const { data: existing, error: readError } = await supabase.from('mail_templates').select('name, automation, locale');
  if (readError) return redirect('/portal/email?error=' + encodeURIComponent(friendlyError(readError.message)));
  const taken = new Set((existing ?? []).map((row: any) => row.name));
  // An enquiry reply starter is already set as that language's automatic reply
  // (still inactive: nothing goes out until the admin switches it on) — unless
  // another template holds that slot.
  const replySlots = new Set((existing ?? []).filter((row: any) => row.automation === 'enquiry').map((row: any) => row.locale));

  const rows = STARTERS.filter((starter) => !taken.has(starter.name)).map((starter) => {
    const base = baseTemplate(starter.kind, starter.locale, company, SITE_URL);
    const automation = starter.kind === 'property' && !replySlots.has(starter.locale) ? 'enquiry' : null;
    return { name: starter.name, subject: base.subject, body_html: base.html, locale: starter.locale, active: false, automation, created_by: locals.user!.id };
  });
  if (rows.length === 0) return redirect('/portal/email?starters=0');
  const { error } = await supabase.from('mail_templates').insert(rows);
  if (error) return redirect('/portal/email?error=' + encodeURIComponent(friendlyError(error.message)));
  return redirect(`/portal/email?starters=${rows.length}`);
};
