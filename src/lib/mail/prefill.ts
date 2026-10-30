/**
 * A property template that still has "[Írja át: …]" spots (one started from
 * another template, or written before the listing merge fields existed) and
 * is linked to a listing gets those spots filled from it: the description (in
 * the template's language, falling back like the site does), the floor area,
 * the rooms, and the listing's first photo as the main photo.
 *
 * Only placeholders are filled. The FINDDOME base layout no longer has any
 * here: its description, facts and photo are merge fields
 * ({{property_description}}, {{property_photo_url}} …) filled at send time
 * from whichever listing the email is about — which is what lets one template
 * answer enquiries about every listing. Writing one listing's text into them
 * here would undo exactly that.
 */
import { readDetails } from '~/lib/listing-details';
import type { SupabaseClient } from '@supabase/supabase-js';
import { localeFrom } from '~/i18n/ui';
import { floorArea } from '~/lib/format';
import { applyEditableFieldUpdate, applyEditableImageUpdate, isPlaceholderImage, isPlaceholderText, parseEditableFields, parseEditableImages } from './editable';
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
  const todo = new Set(parseEditableFields(html).filter((field) => isPlaceholderText(field.value)).map((field) => field.key));
  const photoTodo = parseEditableImages(html).some((image) => image.key === 'main_photo' && isPlaceholderImage(image.src));
  if (todo.size === 0 && !photoTodo) return html;

  const { data: property } = await client.from('properties').select('id, floor_m2, details').eq('id', propertyId).maybeSingle();
  if (!property) return html;
  const order = locale === 'hu' || locale === 'nl' ? [locale, 'hu'] : [locale, 'nl', 'hu'];
  const { data: translations } = await client.from('property_translations').select('locale, description').eq('property_id', propertyId).in('locale', order);
  const description = order.map((code) => (translations ?? []).find((row: any) => row.locale === code)?.description).find(Boolean);

  let result = html;
  const set = (key: string, value: string | null) => {
    if (value && todo.has(key)) result = applyEditableFieldUpdate(result, key, value);
  };
  set('description', descriptionExcerpt(description));
  set('stat1_value', property.floor_m2 ? floorArea(Number(property.floor_m2), locale) : null);
  const rooms = readDetails(property.details).rooms;
  set('stat2_value', rooms !== undefined ? String(rooms) : null);

  const cover = photoTodo ? await listingCoverForMail(client, propertyId, imageFolder) : null;
  if (cover) result = applyEditableImageUpdate(result, 'main_photo', cover);
  return result;
}
