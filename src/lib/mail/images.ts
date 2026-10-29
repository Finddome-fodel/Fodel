/**
 * Images for template emails, in the public `mail-media` bucket.
 *
 * Always JPEG, at most 1200 px wide: Outlook on Windows does not show WebP
 * (which is what the listing photos are stored as), and a 6 MB phone photo in
 * an email is a slow download for every recipient. Done with the same sharp
 * the listing uploads use.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'mail-media';
const MAX_WIDTH = 1200;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/** Listing photo → email-safe JPEG bytes. Throws on anything sharp cannot read. */
async function toMailJpeg(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(buffer, { failOn: 'error' })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .flatten({ background: '#fdfdfc' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

export async function storeMailImage(client: SupabaseClient<any, any, any>, folder: string, input: ArrayBuffer | Buffer, name: string): Promise<string> {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  if (buffer.byteLength > MAX_INPUT_BYTES) throw new Error('A kép legfeljebb 15 MB lehet.');
  let output: Buffer;
  try {
    output = await toMailJpeg(buffer);
  } catch {
    throw new Error('A fájl nem olvasható képként.');
  }
  const path = `${folder}/${name}-${Date.now()}.jpg`;
  const { error } = await client.storage.from(BUCKET).upload(path, output, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(`Képfeltöltési hiba: ${error.message}`);
  return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** A listing's first photo, copied into mail-media as JPEG; null when it has none or it cannot be fetched. */
export async function listingCoverForMail(client: SupabaseClient<any, any, any>, propertyId: string, folder: string): Promise<string | null> {
  const { data: media } = await client
    .from('property_media')
    .select('storage_path, is_hero, sort_order')
    .eq('property_id', propertyId)
    .order('is_hero', { ascending: false })
    .order('sort_order')
    .limit(1)
    .maybeSingle();
  const source = media?.storage_path;
  // Seeded demo listings point at bundled assets, not a fetchable URL.
  if (!source || !/^https?:\/\//.test(source)) return null;
  try {
    const response = await fetch(source);
    if (!response.ok) return null;
    return await storeMailImage(client, folder, await response.arrayBuffer(), 'main_photo');
  } catch {
    return null;
  }
}

/**
 * {{property_photo_url}}: the listing's main photo as an email-safe JPEG, made
 * once per photo and kept in mail-media under listings/<listing>/<photo>.jpg —
 * the second enquiry about the same listing (or the 200th recipient of a bulk
 * send) gets the stored copy without fetching or converting anything. A new
 * main photo has a new id, so the email follows it by itself.
 *
 * Never throws: null means "no usable photo", and the caller puts the brand
 * image in its place. A bucket that does not exist yet (migration 0038 not
 * run) is just another null.
 */
export async function listingPhotoForMail(client: SupabaseClient<any, any, any>, propertyId: string): Promise<string | null> {
  try {
    const { data: media } = await client
      .from('property_media')
      .select('id, storage_path, is_hero, sort_order')
      .eq('property_id', propertyId)
      .order('is_hero', { ascending: false })
      .order('sort_order')
      .limit(1)
      .maybeSingle();
    const source = media?.storage_path;
    if (!media || !source || !/^https?:\/\//.test(source)) return null;

    const folder = `listings/${propertyId}`;
    const file = `${media.id}.jpg`;
    const path = `${folder}/${file}`;
    const publicUrl = client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

    const { data: existing, error: listError } = await client.storage.from(BUCKET).list(folder, { search: file, limit: 1 });
    if (listError) return null;
    if ((existing ?? []).some((entry) => entry.name === file)) return publicUrl;

    const response = await fetch(source, { signal: AbortSignal.timeout(6_000) });
    if (!response.ok) return null;
    const input = Buffer.from(await response.arrayBuffer());
    if (input.byteLength > MAX_INPUT_BYTES) return null;
    const output = await toMailJpeg(input);
    const { error } = await client.storage.from(BUCKET).upload(path, output, { contentType: 'image/jpeg', upsert: false });
    // Two sends converting the same photo at once: the loser's "already exists" is fine.
    if (error && !/exists|duplicate/i.test(error.message)) return null;
    return publicUrl;
  } catch (error) {
    console.error('[mail] listing photo for email failed', propertyId, error);
    return null;
  }
}
