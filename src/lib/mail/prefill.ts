/**
 * A new property template linked to a listing starts filled in from it: the
 * description (in the template's language, falling back like the site does),
 * the floor area and the bedrooms replace their "[Írja át: …]" placeholders,
 * and the listing's first photo becomes the main photo. Title, price, place
 * and link stay merge fields, filled at send time — a later price change
 * reaches the email by itself. Anything the listing lacks keeps its
 * placeholder, so the editor shows what is still to do.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { localeFrom } from '~/i18n/ui';
import { floorArea } from '~/lib/format';
import { applyEditableFieldUpdate, applyEditableImageUpdate } from './editable';
import { listingCoverForMail } from './images';

const MAX_DESCRIPTION = 420;

/** Plain text, at most ~420 characters, cut at a sentence end where possible. */
export function descriptionExcerpt(description: string | null | undefined): string | null {
  if (!description) return null;
  const text = description.replace(/<[^>]+>/g, ' ').replace(/[#*_>`]/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (text.length <= MAX_DESCRIPTION) return text;
  const cut = text.slice(0, MAX_DESCRIPTION);
  const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentenceEnd > MAX_DESCRIPTION * 0.5) return cut.slice(0, sentenceEnd + 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).trimEnd()}…`;
}

export async function prefillFromListing(
  client: SupabaseClient<any, any, any>,
  html: string,
  propertyId: string,
  templateLocale: string,
  imageFolder: string
): Promise<string> {
  const locale = localeFrom(templateLocale);
  const { data: property } = await client.from('properties').select('id, floor_m2, bedrooms').eq('id', propertyId).maybeSingle();
  if (!property) return html;
  const order = locale === 'hu' || locale === 'nl' ? [locale, 'hu'] : [locale, 'nl', 'hu'];
  const { data: translations } = await client.from('property_translations').select('locale, description').eq('property_id', propertyId).in('locale', order);
  const description = order.map((code) => (translations ?? []).find((row: any) => row.locale === code)?.description).find(Boolean);

  let result = html;
  const set = (key: string, value: string | null) => {
    if (value) result = applyEditableFieldUpdate(result, key, value);
  };
  set('description', descriptionExcerpt(description));
  set('stat1_value', property.floor_m2 ? floorArea(Number(property.floor_m2), locale) : null);
  set('stat2_value', property.bedrooms != null ? String(property.bedrooms) : null);

  const cover = await listingCoverForMail(client, propertyId, imageFolder);
  if (cover) result = applyEditableImageUpdate(result, 'main_photo', cover);
  return result;
}
