/**
 * The one send path for template email — a single manual send, every bulk
 * recipient, and the automatic replies all come through sendTemplateEmail(),
 * so merge fields, the suppression check, the "nothing half-filled goes out"
 * guard and the sent log live in one place.
 *
 * resolveTemplateEmail() does everything short of sending, and the preview
 * calls it too: what the admin previews for a recipient is byte for byte what
 * that recipient would get.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { localeFrom } from '~/i18n/ui';
import { eur, floorArea, placeLabel } from '~/lib/format';
import { getCompany } from '~/lib/runtime-config';
import { listingTitle, publicUrl } from '~/lib/portal/publish';
import { sendEmailTracked } from '~/lib/email/send';
import { senderAddress, replyToAddress } from '~/lib/email/routing';
import {
  buildMergeFields,
  dropMissingPhoto,
  findMissingRequiredFields,
  findUnresolvedMergeFields,
  renderTemplate,
  SAMPLE_MERGE_FIELDS,
  MERGE_FIELD_LABEL,
  type MergeFieldKey,
} from './merge';
import { unfinishedParts } from './editable';
import { isValidEmailAddress, suppressionReason } from './suppression';
import { appendBeforeBodyEnd, unsubscribeFooter, unsubscribeUrl } from './unsubscribe';
import { listingPhotoForMail } from './images';
import { descriptionExcerpt } from './prefill';

type Client = SupabaseClient<any, any, any>;

export type Audience = 'owner' | 'enquiry' | 'newsletter' | 'search_request';
export type Source = 'MANUAL' | 'AUTOMATION' | 'BULK_JOB';

export type Recipient = {
  email: string;
  name: string | null;
  locale: string;
  audience?: Audience | null;
  audienceId?: string | null;
  /** The listing this recipient is about (an enquirer's), ahead of the template's own linked listing. */
  propertyId?: string | null;
};

export type SendBlockCode =
  | 'SUPPRESSED'
  | 'INVALID_EMAIL'
  | 'UNRESOLVED_MERGE_FIELD'
  | 'MISSING_REQUIRED_FIELD'
  | 'UNFINISHED_TEMPLATE'
  | 'TEMPLATE_INACTIVE'
  | 'TEMPLATE_MISSING'
  | 'PROVIDER_ERROR';

type Resolved =
  | { ok: true; template: { id: string; name: string; locale: string }; propertyId: string | null; subject: string; html: string; text: string; headers?: Record<string, string> }
  | { ok: false; error: string; code: SendBlockCode };

/* ── Listing facts, in the template's language ───────────────────────────── */

export type PropertyContext = {
  title: string;
  url: string;
  price: string;
  location: string;
  ref: string;
  oldPrice: string | null;
  description: string | null;
  area: string | null;
  bedrooms: string | null;
  photoUrl: string | null;
};


/** The site's own fallback order for listing text: the language itself, then Dutch, then Hungarian. */
const descriptionOrder = (lang: string) => (lang === 'hu' || lang === 'nl' ? [lang, 'hu'] : [lang, 'nl', 'hu']);

export async function loadPropertyContext(client: Client, propertyId: string, locale: string): Promise<PropertyContext | null> {
  const lang = localeFrom(locale);
  const { data: property } = await client
    .from('properties')
    .select('id, ref, category, settlement, county, price_eur, floor_m2, bedrooms')
    .eq('id', propertyId)
    .maybeSingle();
  if (!property) return null;
  const order = descriptionOrder(lang);
  const [{ data: change }, { data: translations }, title, url, photo] = await Promise.all([
    // The last price change, when it was a reduction: what {{old_price}} / {{new_price}} report.
    client
      .from('property_price_history')
      .select('old_eur, new_eur')
      .eq('property_id', propertyId)
      .order('changed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    client.from('property_translations').select('locale, description').eq('property_id', propertyId).in('locale', order),
    listingTitle(client, property.id, lang, property.ref),
    publicUrl(property, lang),
    listingPhotoForMail(client, property.id),
  ]);
  const reduced = change && change.old_eur && change.new_eur === property.price_eur && change.old_eur > change.new_eur;
  const description = order.map((code) => (translations ?? []).find((row: any) => row.locale === code)?.description).find(Boolean);
  return {
    title,
    url,
    price: eur(property.price_eur, lang),
    location: placeLabel(property.settlement, property.county),
    ref: String(property.ref),
    oldPrice: reduced ? eur(change.old_eur, lang) : null,
    description: descriptionExcerpt(description),
    area: property.floor_m2 ? floorArea(Number(property.floor_m2), lang) : null,
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : null,
    photoUrl: photo, // null: no mailable photo, the picture row is left out (dropMissingPhoto)
  };
}

/* ── Signature block ─────────────────────────────────────────────────────── */

type Signature = { name: string; title: string | null; phone: string | null; email: string | null; website_url: string | null; facebook_url: string | null; instagram_url: string | null; linkedin_url: string | null };

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function signatureHtml(signature: Signature): string {
  const line = (value: string | null, href?: string) =>
    value ? `${href ? `<a href="${escapeHtml(href)}" style="color:#102a43;text-decoration:none;">${escapeHtml(value)}</a>` : escapeHtml(value)}<br>` : '';
  const socials = [
    signature.facebook_url && ['Facebook', signature.facebook_url],
    signature.instagram_url && ['Instagram', signature.instagram_url],
    signature.linkedin_url && ['LinkedIn', signature.linkedin_url],
  ].filter(Boolean) as [string, string][];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:28px 44px 30px;border-top:1px solid #ecedef;font-family:'Jost','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#475457;">
  <strong style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#102a43;">${escapeHtml(signature.name)}</strong>${signature.title ? `<br>${escapeHtml(signature.title)}` : ''}<br>
  ${line(signature.phone, signature.phone ? `tel:${signature.phone.replace(/[^+\d]/g, '')}` : undefined)}${line(signature.email, signature.email ? `mailto:${signature.email}` : undefined)}${line(signature.website_url?.replace(/^https?:\/\//, '') ?? null, signature.website_url ?? undefined)}
  ${socials.map(([label, href]) => `<a href="${escapeHtml(href)}" style="color:#102a43;text-decoration:underline;margin-right:12px;">${label}</a>`).join('')}
</td></tr></table>`;
}

/** The base templates leave `<!--signature-->` where it belongs; a hand-written one gets it at the end. */
function placeSignature(html: string, block: string): string {
  if (html.includes('<!--signature-->')) return html.replace('<!--signature-->', `<tr><td>${block}</td></tr>`);
  return appendBeforeBodyEnd(html, block);
}

/* ── Plain-text alternative ──────────────────────────────────────────────── */

export function htmlToText(html: string): string {
  return html
    .replace(/<head[\s\S]*?<\/head>/i, '')
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, '')
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, '').trim();
      return href.startsWith('mailto:') || href.startsWith('tel:') || !text ? text : `${text} (${href})`;
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|table)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rarr;/g, '→')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/* ── Resolve ─────────────────────────────────────────────────────────────── */

const fieldNames = (keys: string[]) => [...new Set(keys)].map((k) => `{{${k}}}${k in MERGE_FIELD_LABEL ? ` (${MERGE_FIELD_LABEL[k as MergeFieldKey]})` : ''}`).join(', ');

export async function resolveTemplateEmail(
  client: Client,
  params: { templateId: string; recipient: Recipient; source: Source; allowInactive?: boolean }
): Promise<Resolved> {
  const { templateId, recipient, source } = params;
  const { data: template } = await client.from('mail_templates').select('*').eq('id', templateId).maybeSingle();
  if (!template) return { ok: false, error: 'A sablon nem található.', code: 'TEMPLATE_MISSING' };
  if (!template.active && !params.allowInactive) return { ok: false, error: 'A sablon nincs aktiválva.', code: 'TEMPLATE_INACTIVE' };

  const email = recipient.email.trim();
  if (!isValidEmailAddress(email)) return { ok: false, error: `Érvénytelen e-mail-cím: ${email}`, code: 'INVALID_EMAIL' };
  const blocked = await suppressionReason(client, email);
  if (blocked) return { ok: false, error: `Ez a cím le van tiltva (${blocked.toLowerCase()}): ${email}`, code: 'SUPPRESSED' };

  const unfinished = unfinishedParts(template.body_html);
  if (unfinished.length > 0) {
    return { ok: false, error: `A sablonban még kitöltendő részek vannak: ${unfinished.join(', ')}`, code: 'UNFINISHED_TEMPLATE' };
  }

  const propertyId: string | null = recipient.propertyId ?? template.linked_property_id ?? null;
  const [property, company, signatureRow] = await Promise.all([
    propertyId ? loadPropertyContext(client, propertyId, template.locale) : Promise.resolve(null),
    getCompany(),
    template.signature_id
      ? client.from('mail_signatures').select('*').eq('id', template.signature_id).maybeSingle().then((r: any) => r.data)
      : client.from('mail_signatures').select('*').eq('is_default', true).maybeSingle().then((r: any) => r.data),
  ]);
  const phone = company.phones.find((p) => p.public) ?? company.phones[0];
  const fields = buildMergeFields({
    recipient: { name: recipient.name, email, locale: recipient.locale },
    property,
    signature: signatureRow,
    company: { name: 'FINDDOME', phone: phone?.display ?? null, email: company.email?.primary ?? 'info@finddome.com' },
  });

  const unresolved = [...findUnresolvedMergeFields(template.subject), ...findUnresolvedMergeFields(template.body_html)];
  if (unresolved.length > 0) {
    return { ok: false, error: `Ismeretlen mező a sablonban: ${fieldNames(unresolved)}`, code: 'UNRESOLVED_MERGE_FIELD' };
  }
  const missing = [...findMissingRequiredFields(template.subject, fields), ...findMissingRequiredFields(template.body_html, fields)];
  if (missing.length > 0) {
    const hint = missing.some((k) => k.startsWith('property_') || k.endsWith('_price')) && !propertyId ? ' — a sablonhoz nincs ingatlan kapcsolva' : '';
    return { ok: false, error: `Hiányzó adat a kitöltéshez: ${fieldNames(missing)}${hint}`, code: 'MISSING_REQUIRED_FIELD' };
  }

  const subject = renderTemplate(template.subject, fields);
  let html = renderTemplate(dropMissingPhoto(template.body_html, fields), fields, { html: true });
  if (signatureRow) html = placeSignature(html, signatureHtml(signatureRow));

  let headers: Record<string, string> | undefined;
  // Unsubscribe applies to mailings only. A single manual send and the automatic
  // reply to someone's own enquiry are answers to that person, not marketing.
  if (source === 'BULK_JOB') {
    html = appendBeforeBodyEnd(html, unsubscribeFooter(email, template.locale));
    headers = { 'List-Unsubscribe': `<${unsubscribeUrl(email, template.locale)}>, <mailto:${replyToAddress().replace(/^.*<|>.*$/g, '')}?subject=unsubscribe>` };
  }

  return {
    ok: true,
    template: { id: template.id, name: template.name, locale: template.locale },
    propertyId,
    subject,
    html,
    text: htmlToText(html),
    headers,
  };
}

/* ── Send ────────────────────────────────────────────────────────────────── */

export type SendResult = { messageId: string } | { error: string; code: SendBlockCode };

export async function sendTemplateEmail(
  client: Client,
  params: { templateId: string; recipient: Recipient; source: Source; sentBy?: string | null; jobId?: string | null; idempotencyKey?: string }
): Promise<SendResult> {
  const resolved = await resolveTemplateEmail(client, params);
  if (!resolved.ok) return { error: resolved.error, code: resolved.code };

  const { recipient } = params;
  const result = await sendEmailTracked({
    from: senderAddress('portal'),
    to: recipient.email.trim(),
    subject: resolved.subject,
    html: resolved.html,
    text: resolved.text,
    headers: resolved.headers,
    idempotencyKey: params.idempotencyKey,
  });
  // Already delivered by an earlier, interrupted run: count it as sent, log nothing new.
  if (result.alreadySent) return { messageId: '' };
  // Nothing is recorded for a send the provider refused, so a retry cannot duplicate it.
  if (!result.sent) return { error: `A levelet a küldőszolgáltatás nem fogadta el: ${result.error ?? 'ismeretlen hiba'}`, code: 'PROVIDER_ERROR' };

  const { data: row, error } = await client
    .from('mail_messages')
    .insert({
      template_id: resolved.template.id,
      job_id: params.jobId ?? null,
      source: params.source,
      to_email: recipient.email.trim().toLowerCase(),
      to_name: recipient.name,
      audience: recipient.audience ?? null,
      audience_id: recipient.audienceId ?? null,
      property_id: resolved.propertyId,
      locale: resolved.template.locale,
      subject: resolved.subject,
      body_html: resolved.html,
      resend_id: result.id,
      sent_by: params.sentBy ?? null,
    })
    .select('id')
    .single();
  // The email has left; failing to log it must not be reported as a failed send
  // (a retry would deliver it twice). The console line is the trace.
  if (error || !row) {
    console.error('[mail] sent but not logged', recipient.email, error?.message);
    return { messageId: '' };
  }
  return { messageId: row.id };
}

/** The editor's "send me a test": sample data, `[TESZT]` in the subject, nothing logged or tracked. */
export async function sendTestEmail(params: { to: string; subject: string; bodyHtml: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidEmailAddress(params.to)) return { ok: false, error: `Érvénytelen e-mail-cím: ${params.to}` };
  const unresolved = [...findUnresolvedMergeFields(params.subject), ...findUnresolvedMergeFields(params.bodyHtml)];
  if (unresolved.length > 0) return { ok: false, error: `Ismeretlen mező a sablonban: ${fieldNames(unresolved)}` };
  const html = renderTemplate(params.bodyHtml, SAMPLE_MERGE_FIELDS, { html: true });
  const result = await sendEmailTracked({
    from: senderAddress('portal'),
    to: params.to.trim(),
    subject: `[TESZT] ${renderTemplate(params.subject, SAMPLE_MERGE_FIELDS)}`,
    html,
    text: htmlToText(html),
  });
  return result.sent ? { ok: true } : { ok: false, error: result.error ?? 'A küldés nem sikerült.' };
}
