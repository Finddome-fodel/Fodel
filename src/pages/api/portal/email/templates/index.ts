/**
 * Creates a mail template and opens it in the editor. Only a name is required
 * up front; the body starts from one of three places:
 *   - a FINDDOME base layout (property / general) in the chosen language,
 *   - a listing: the property layout, filled in from that listing,
 *   - an existing template: its text and settings, with the listing-specific
 *     parts marked "to fill in" so one listing's text cannot leak into the next.
 * New templates start inactive, so nothing half-filled can be sent by accident.
 */
import type { APIRoute } from 'astro';
import { SITE_URL } from '~/config/site.mjs';
import { isLocale } from '~/i18n/ui';
import { getCompany } from '~/lib/runtime-config';
import { friendlyError } from '~/lib/portal/labels';
import { baseTemplate, type BaseKind } from '~/lib/mail/base-templates';
import { markPropertySpecificParts } from '~/lib/mail/editable';
import { prefillFromListing } from '~/lib/mail/prefill';
import { mailSchemaReady, SETUP_PATH } from '~/lib/mail/schema';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const { supabase } = locals;
  if (!(await mailSchemaReady(supabase))) return redirect(SETUP_PATH);
  const form = await request.formData();
  const fail = (message: string) => redirect(`/portal/email/templates/new?error=${encodeURIComponent(message)}`);

  const name = String(form.get('name') ?? '').trim();
  if (!name) return fail('A sablon nevét meg kell adni.');
  if (name.length > 120) return fail('A név legfeljebb 120 karakter lehet.');
  const kind: BaseKind = form.get('kind') === 'general' ? 'general' : 'property';
  const requestedLocale = String(form.get('locale') ?? 'hu');
  const locale = isLocale(requestedLocale) ? requestedLocale : 'hu';
  const sourceTemplateId = String(form.get('sourceTemplateId') ?? '').trim() || null;
  const linkedPropertyId = kind === 'property' ? String(form.get('linkedPropertyId') ?? '').trim() || null : null;

  let subject: string;
  let bodyHtml: string;
  let signatureId: string | null = null;
  let templateLocale: string = locale;

  if (sourceTemplateId) {
    const { data: source } = await supabase.from('mail_templates').select('subject, body_html, signature_id, locale').eq('id', sourceTemplateId).maybeSingle();
    if (!source) return fail('A kiinduló sablon nem található.');
    subject = source.subject;
    bodyHtml = markPropertySpecificParts(source.body_html, SITE_URL);
    signatureId = source.signature_id;
    templateLocale = source.locale;
  } else {
    const base = baseTemplate(kind, locale, await getCompany(), SITE_URL);
    subject = base.subject;
    bodyHtml = base.html;
    // A language without its own base copy starts from English; the template is still marked as the chosen language.
    templateLocale = locale;
  }

  const { data: created, error } = await supabase
    .from('mail_templates')
    .insert({
      name,
      subject,
      body_html: bodyHtml,
      locale: templateLocale,
      signature_id: signatureId,
      linked_property_id: linkedPropertyId,
      active: false,
      created_by: locals.user!.id,
    })
    .select('id')
    .single();
  if (error || !created) return fail(friendlyError(error?.message));

  // The listing's facts and photo. Best effort: without them the placeholders stay, marked to fill in.
  if (linkedPropertyId) {
    try {
      const filled = await prefillFromListing(supabase, bodyHtml, linkedPropertyId, templateLocale, `templates/${created.id}`);
      if (filled !== bodyHtml) await supabase.from('mail_templates').update({ body_html: filled }).eq('id', created.id);
    } catch (prefillError) {
      console.error('[mail] prefill from listing failed', prefillError);
    }
  }

  return redirect(`/portal/email/templates/${created.id}?created=1`);
};
