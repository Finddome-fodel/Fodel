/**
 * The automatic replies: when someone sends the enquiry form on a listing, or
 * the search-service form, and an admin has marked an active template as that
 * form's automatic reply *in the visitor's language*, the visitor gets that
 * template — the listing's photo, facts and link — instead of the built-in
 * "thanks, we got your message".
 *
 * Never more than one reply: this either sends the template and says so, or
 * says it did not and the form handler sends its built-in acknowledgement as
 * before. A template that cannot be filled for this visitor (a listing field
 * it needs is empty, it still has "[Írja át: …]" parts) falls back the same
 * way, and the reason is logged for the admin.
 */
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { logEvent } from '~/lib/activity';
import { localeFrom } from '~/i18n/ui';
import { sendTemplateEmail, type Audience } from './send';

export type AutomationKind = 'enquiry' | 'search_request';

export const AUTOMATION_LABEL: Record<AutomationKind, string> = {
  enquiry: 'Automatikus válasz ingatlan-érdeklődésre',
  search_request: 'Automatikus válasz kerestetésre',
};

export async function sendAutomationReply(
  kind: AutomationKind,
  visitor: { email: string; name: string | null; locale: string; propertyRef?: string | null }
): Promise<boolean> {
  try {
    const admin = createSupabaseAdminClient();
    const locale = localeFrom(visitor.locale);
    const { data: template } = await admin
      .from('mail_templates')
      .select('id, name')
      .eq('automation', kind)
      .eq('locale', locale)
      .eq('active', true)
      .maybeSingle();
    if (!template) return false;

    let propertyId: string | null = null;
    if (visitor.propertyRef) {
      const { data: property } = await admin.from('properties').select('id').eq('ref', visitor.propertyRef).maybeSingle();
      propertyId = property?.id ?? null;
    }

    const result = await sendTemplateEmail(admin, {
      templateId: template.id,
      recipient: { email: visitor.email, name: visitor.name, locale, audience: kind as Audience, propertyId },
      source: 'AUTOMATION',
    });
    if ('error' in result) {
      await logEvent({
        kind: 'mail.automation_skipped', actorEmail: visitor.email, subjectType: 'mail_template', subjectId: template.id,
        locale, source: kind, payload: { template: template.name, reason: result.error, code: result.code },
      }).catch(() => {});
      return false;
    }
    return true;
  } catch (error) {
    // Missing migration, a network blip: the built-in acknowledgement still goes out.
    console.error(`[mail] automatic ${kind} reply failed`, error);
    return false;
  }
}
