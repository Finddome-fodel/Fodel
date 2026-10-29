/**
 * One template's actions, by the form's `action` field:
 *   save       name, subject, body (with any images chosen in the simple
 *              editor), language, signature, linked listing, active, automation
 *   duplicate  a copy under a new name, inactive
 *   delete     gone; refused while a bulk send still uses it
 *   test       the last saved version to any address, with sample data
 */
import type { APIRoute } from 'astro';
import { isLocale } from '~/i18n/ui';
import { friendlyError } from '~/lib/portal/labels';
import { applyEditableImageUpdate, unfinishedParts } from '~/lib/mail/editable';
import { storeMailImage } from '~/lib/mail/images';
import { sendTestEmail } from '~/lib/mail/send';
import { AUTOMATION_LABEL, type AutomationKind } from '~/lib/mail/automation';
import { logEvent } from '~/lib/activity';

export const prerender = false;

const LIMITS = { name: 120, subject: 200, bodyHtml: 400_000 };

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const { supabase } = locals;
  const id = params.id!;
  const form = await request.formData();
  const action = String(form.get('action') ?? 'save');
  const back = (query: string) => redirect(`/portal/email/templates/${id}?${query}`);
  const fail = (message: string) => back(`error=${encodeURIComponent(message)}`);

  const { data: template } = await supabase.from('mail_templates').select('*').eq('id', id).maybeSingle();
  if (!template) return redirect('/portal/email?error=' + encodeURIComponent('A sablon nem található.'));

  if (action === 'delete') {
    const { count } = await supabase.from('mail_send_jobs').select('id', { count: 'exact', head: true }).eq('template_id', id);
    if ((count ?? 0) > 0) return fail('Ezt a sablont már használta egy tömeges küldés, ezért nem törölhető. Kapcsolja ki (Aktív jelölés), így többé nem választható.');
    const { error } = await supabase.from('mail_templates').delete().eq('id', id);
    if (error) return fail(friendlyError(error.message));
    return redirect('/portal/email?deleted=1');
  }

  if (action === 'duplicate') {
    const name = String(form.get('name') ?? '').trim();
    if (!name || name.toLowerCase() === template.name.trim().toLowerCase()) {
      return fail('A másolatnak adjon új, az eredetitől eltérő nevet.');
    }
    const { data: copy, error } = await supabase
      .from('mail_templates')
      .insert({
        name: name.slice(0, LIMITS.name),
        subject: template.subject,
        body_html: template.body_html,
        locale: template.locale,
        signature_id: template.signature_id,
        linked_property_id: template.linked_property_id,
        active: false,
        created_by: locals.user!.id,
      })
      .select('id')
      .single();
    if (error || !copy) return fail(friendlyError(error?.message));
    return redirect(`/portal/email/templates/${copy.id}?copied=1`);
  }

  if (action === 'test') {
    const to = String(form.get('to') ?? '').trim();
    const result = await sendTestEmail({ to, subject: template.subject, bodyHtml: template.body_html });
    return result.ok ? back(`testSent=${encodeURIComponent(to)}`) : fail(result.error);
  }

  /* ── save ── */
  const name = String(form.get('name') ?? '').trim();
  const subject = String(form.get('subject') ?? '').trim();
  let bodyHtml = String(form.get('bodyHtml') ?? '').trim();
  if (!name || !subject || !bodyHtml) return fail('A név, a tárgy és a tartalom nem lehet üres.');
  if (name.length > LIMITS.name || subject.length > LIMITS.subject || bodyHtml.length > LIMITS.bodyHtml) return fail('Túl hosszú név, tárgy vagy tartalom.');

  // Images chosen in the simple editor arrive with the same save, as `image:<key>`.
  for (const [field, value] of form.entries()) {
    if (!field.startsWith('image:') || !(value instanceof File) || value.size === 0) continue;
    const key = field.slice('image:'.length);
    if (!/^[a-zA-Z0-9_]+$/.test(key)) continue;
    try {
      const url = await storeMailImage(supabase, `templates/${id}`, await value.arrayBuffer(), key);
      bodyHtml = applyEditableImageUpdate(bodyHtml, key, url);
    } catch (uploadError) {
      return fail(uploadError instanceof Error ? uploadError.message : 'A képet nem sikerült feltölteni.');
    }
  }

  const requestedLocale = String(form.get('locale') ?? template.locale);
  const locale = isLocale(requestedLocale) ? requestedLocale : template.locale;
  const signatureId = String(form.get('signatureId') ?? '').trim() || null;
  const linkedPropertyId = String(form.get('linkedPropertyId') ?? '').trim() || null;
  const automationRaw = String(form.get('automation') ?? '');
  const automation = (automationRaw in AUTOMATION_LABEL ? automationRaw : null) as AutomationKind | null;
  let active = form.get('active') === 'on';

  // A half-filled template is saved but not switched on — least of all as an automatic reply.
  const unfinished = unfinishedParts(bodyHtml);
  const refusedActivation = active && unfinished.length > 0;
  if (refusedActivation) active = false;

  // One automatic reply per form and language: this one takes the slot.
  if (automation) {
    await supabase.from('mail_templates').update({ automation: null }).eq('automation', automation).eq('locale', locale).neq('id', id);
  }

  const { error } = await supabase
    .from('mail_templates')
    .update({ name, subject, body_html: bodyHtml, locale, signature_id: signatureId, linked_property_id: linkedPropertyId, active, automation })
    .eq('id', id);
  if (error) return fail(friendlyError(error.message));

  if (automation !== template.automation || active !== template.active) {
    await logEvent({
      kind: 'mail.template_settings', actorId: locals.user?.id ?? null, actorEmail: locals.profile?.email ?? null,
      subjectType: 'mail_template', subjectId: id, locale, source: 'portal', payload: { name, active, automation },
    }).catch(() => {});
  }

  if (refusedActivation) {
    return fail(`Mentve, de nem kapcsoltuk be: még kitöltendő — ${unfinished.join(', ')}.`);
  }
  return back('saved=1');
};
