/**
 * A stand-in for Supabase that serves exactly one PUBLISHED listing, for the specs that need a real listing page
 * (sharing, the og: tags, the language gate). In-memory, read-only, no network, no real credentials; it cannot reach a
 * real project and accepts no writes. Everything else the site asks for answers "no rows", as the empty stand-in does.
 *
 *   node tests/e2e/support/public-listing-database.mjs [port]   (default 54402)
 *
 * The photos are on purpose in the order that would hurt: the FIRST row is a photo still waiting for review (pending),
 * so a page that used it as the cover or as the share image would be wrong. The listing is in the World package with
 * a text in hu, en, de, ar and he; Dutch is deliberately missing.
 */
import http from 'node:http';

const port = Number(process.argv[2] ?? 54402);
export const ID = '10000000-0000-4000-8000-0000000000aa';
const now = new Date();
const later = new Date(now.getTime() + 180 * 24 * 3600 * 1000).toISOString();

const photo = (n, storage_path, alt, extra = {}) => ({
  id: `20000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  property_id: ID,
  storage_path,
  alt,
  label: null,
  sort_order: n,
  is_hero: false,
  width: 1600,
  height: 1000,
  pending: false,
  ...extra,
});

const media = [
  photo(0, 'hero.png', { hu: 'ÉRKEZETT, NEM JÓVÁHAGYOTT KÉP', en: 'PENDING PHOTO' }, { pending: true, is_hero: true }),
  photo(1, 'tanya.jpg', { hu: 'A birtok épülete', en: 'The house', de: 'Das Haus', ar: 'المنزل', he: 'הבית' }, { is_hero: true }),
  photo(2, 'kuria.jpg', { hu: 'A kert', en: 'The garden' }),
  photo(3, 'vineyard.png', { hu: 'A környék', en: 'The surroundings' }),
];

const translation = (locale, title, description, body) => ({ property_id: ID, locale, title, subtitle: null, description, body, condition: null, heating: null, tag: null });
const translations = [
  translation('hu', 'Birtok a Balaton-felvidék csendjében', 'Kőfalú otthon, saját kút és tágas gazdasági épületek, négy hektárnyi zöld környezetben.', 'Gondosan felújított lakóház természetközeli környezetben.'),
  translation('en', 'Estate in the quiet of the Balaton Uplands', 'A stone house with its own well and spacious outbuildings, set in four hectares of green.', 'A carefully renovated house in natural surroundings.'),
  translation('de', 'Anwesen in der Stille des Balaton-Hochlands', 'Ein Steinhaus mit eigenem Brunnen und großen Nebengebäuden auf vier Hektar Grün.', 'Ein sorgfältig renoviertes Haus in natürlicher Umgebung.'),
  translation('ar', 'عقار هادئ في مرتفعات بحيرة بالاتون', 'منزل حجري مع بئر خاصة ومبانٍ ملحقة واسعة على أربعة هكتارات من الخضرة.', 'منزل مجدد بعناية في بيئة طبيعية.'),
  translation('he', 'אחוזה בשקט של רמות באלטון', 'בית אבן עם באר פרטית ומבני עזר מרווחים על ארבעה דונמים של ירוק.', 'בית שחודש בקפידה בסביבה טבעית.'),
];

const property = {
  id: ID,
  ref: '1234',
  owner_id: '00000000-0000-4000-8000-000000000001',
  status: 'published',
  reserved: false,
  category: 'farm',
  property_group: 'agricultural',
  property_subtype: 'farm',
  country: 'HU',
  settlement: 'Kékkút',
  county: 'Veszprém',
  region: 'Balaton-felvidék',
  lat: 46.85,
  lng: 17.56,
  location_confirmed: true,
  precision: 'approximate',
  public_location_safe: true,
  price_eur: 225000,
  price_huf: 90000000,
  price_asof: '2026-10-23',
  price_negotiable: true,
  floor_m2: 185,
  building_m2: 260,
  plot_m2: 42500,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 1920,
  renovated_in: 2019,
  epc_class: 'unknown',
  condition_key: 'good',
  heating_key: 'wood',
  wall_key: 'ko',
  features: ['panoramic-view', 'well', 'outbuildings'],
  video_url: null,
  seller_contact_visible: false,
  seller_name: null,
  seller_phone: null,
  seller_speaks: [],
  package: 'world',
  featured: false,
  homepage_featured: false,
  homepage_order: 99,
  editors_pick: false,
  editors_pick_order: 99,
  bargain: false,
  bargain_since: null,
  topic_featured: false,
  details: { setting: 'village', utilities: ['water', 'electricity'], parking: ['garden'] },
  public_address: null,
  public_postal_code: null,
  published_at: now.toISOString(),
  expires_at: later,
  created_at: now.toISOString(),
  translation_package: 'world',
  extra_locales: [],
  excluded_locales: [],
  property_translations: translations,
  property_media: media,
};

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
};

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (url.pathname === '/health') return send(res, 200, { fixture: 'fodel-public-listing' });
    if (url.pathname.startsWith('/auth/v1/')) return send(res, 400, { error: 'invalid_grant', error_description: 'No users in this stand-in.' });
    if (url.pathname.startsWith('/storage/v1/')) return send(res, 404, { error: 'not_found' });
    if (!url.pathname.startsWith('/rest/v1/')) return send(res, 404, { error: 'not_found' });
    const table = url.pathname.replace('/rest/v1/', '');
    if (req.method === 'POST' && table.startsWith('rpc/')) return send(res, 200, []);
    if (!['GET', 'HEAD'].includes(req.method ?? '')) return send(res, 403, { code: '42501', message: 'read-only test database' });
    const wantsObject = String(req.headers.accept ?? '').includes('vnd.pgrst.object');
    const rows = table === 'properties' ? [property] : [];
    if (req.method === 'HEAD') return send(res, 200, undefined, { 'content-range': `*/${rows.length}` });
    if (wantsObject) {
      return rows.length
        ? send(res, 200, rows[0], { 'content-range': '0-0/1' })
        : send(res, 406, { code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned' });
    }
    return send(res, 200, rows, { 'content-range': rows.length ? `0-${rows.length - 1}/${rows.length}` : '*/0' });
  })
  .listen(port, '127.0.0.1', () => console.log(`public listing fixture on http://127.0.0.1:${port}`));
