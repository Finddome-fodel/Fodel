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

export async function storeMailImage(client: SupabaseClient<any, any, any>, folder: string, input: ArrayBuffer | Buffer, name: string): Promise<string> {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  if (buffer.byteLength > MAX_INPUT_BYTES) throw new Error('A kép legfeljebb 15 MB lehet.');
  const sharp = (await import('sharp')).default;
  let output: Buffer;
  try {
    output = await sharp(buffer, { failOn: 'error' })
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .flatten({ background: '#fdfdfc' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
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
