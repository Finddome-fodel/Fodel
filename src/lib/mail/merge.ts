/**
 * Merge fields — the `{{first_name}}` tokens a mail template is written with.
 *
 * Pure string functions, no database and no secrets, so the template editor's
 * live preview imports this same module in the browser: what the admin sees
 * filled with sample data is rendered by exactly the code that renders the
 * real send.
 *
 * An unknown token (`{{proprty_title}}`) is left in the output untouched rather
 * than silently blanked. That is what makes "a broken placeholder never goes
 * out" enforceable: findUnresolvedMergeFields() finds it before sending and the
 * send is refused.
 */
import { SITE_URL } from '~/config/site.mjs';

export const MERGE_FIELD_KEYS = [
  'first_name',
  'full_name',
  'email',
  'property_title',
  'property_url',
  'property_price',
  'property_location',
  'property_ref',
  'property_description',
  'property_area',
  'property_rooms',
  /** @deprecated the old name of {{property_rooms}}; still filled so older templates keep working. */
  'property_bedrooms',
  'property_photo_url',
  'old_price',
  'new_price',
  'agent_name',
  'agent_phone',
  'agent_email',
] as const;

export type MergeFieldKey = (typeof MERGE_FIELD_KEYS)[number];
export type MergeFields = Partial<Record<MergeFieldKey, string | null>>;

/** What each token means, for the editor's insert buttons. */
export const MERGE_FIELD_LABEL: Record<MergeFieldKey, string> = {
  first_name: 'Keresztnév',
  full_name: 'Teljes név',
  email: 'Címzett e-mail-címe',
  property_title: 'Ingatlan címe',
  property_url: 'Hirdetés linkje (a sablon nyelvén)',
  property_price: 'Irányár (EUR)',
  property_location: 'Település, megye',
  property_ref: 'Hirdetés azonosító',
  property_description: 'Ingatlan leírása (rövid kivonat, a sablon nyelvén)',
  property_area: 'Alapterület',
  property_rooms: 'Szobák száma (félszobák nélkül)',
  property_bedrooms: 'Szobák száma (régi mezőkód)',
  property_photo_url: 'Ingatlan fő fotója (kép címe)',
  old_price: 'Előző ár (árcsökkenés)',
  new_price: 'Új ár (árcsökkenés)',
  agent_name: 'Aláíró neve',
  agent_phone: 'Aláíró telefonszáma',
  agent_email: 'Aláíró e-mail-címe',
};

const MERGE_TOKEN_RE = /{{\s*(\w+)\s*}}/g;

function isKnownMergeFieldKey(key: string): key is MergeFieldKey {
  return (MERGE_FIELD_KEYS as readonly string[]).includes(key);
}

/** Every distinct `{{...}}` token name in the content. */
export function extractMergeFieldTokens(content: string): string[] {
  const found = new Set<string>();
  for (const match of content.matchAll(MERGE_TOKEN_RE)) found.add(match[1]);
  return [...found];
}

/** Misspelt or unknown tokens — a send containing one is refused. */
export function findUnresolvedMergeFields(content: string): string[] {
  return extractMergeFieldTokens(content).filter((key) => !isKnownMergeFieldKey(key));
}

/**
 * Listing facts not every listing has (a plot has no rooms, a fresh listing
 * may have no description yet). With a listing attached they may be empty —
 * buildMergeFields() already put a neutral "—" or the brand photo in their
 * place — so they never block a send on their own. Without any listing they
 * are as missing as {{property_title}}.
 */
const SOFT_PROPERTY_FIELDS: readonly MergeFieldKey[] = ['property_description', 'property_area', 'property_rooms', 'property_bedrooms', 'property_photo_url'];

/**
 * Known tokens with no value for this recipient — `{{property_title}}` in a
 * template sent with no listing attached. Also refused: "Dear , the  you asked
 * about" is worse than not sending.
 */
export function findMissingRequiredFields(content: string, fields: MergeFields): string[] {
  const hasListing = Boolean(fields.property_title);
  return extractMergeFieldTokens(content).filter(
    (key) => isKnownMergeFieldKey(key) && !fields[key] && !(hasListing && SOFT_PROPERTY_FIELDS.includes(key))
  );
}

/**
 * A listing with no mailable photo: the picture row leaves the e-mail instead
 * of showing a broken image or an unrelated stock photo. Removes the table row
 * that holds an `<img src="{{property_photo_url}}">` (the starters' layout), or
 * the bare image when it is not in a row of its own.
 */
export function dropMissingPhoto(html: string, fields: MergeFields): string {
  if (fields.property_photo_url) return html;
  const photo = /<img\b[^>]*\bsrc\s*=\s*["']\s*\{\{\s*property_photo_url\s*\}\}\s*["'][^>]*>/i;
  if (!photo.test(html)) return html;
  const row = /<tr\b[^>]*>(?:(?!<\/?tr\b)[\s\S])*?<img\b[^>]*\bsrc\s*=\s*["']\s*\{\{\s*property_photo_url\s*\}\}\s*["'][^>]*>(?:(?!<\/?tr\b)[\s\S])*?<\/tr>/gi;
  return html.replace(row, '').replace(new RegExp(photo.source, 'gi'), '');
}

/** The sample listing photo the editor's preview and the test send show for {{property_photo_url}}. */
export const SAMPLE_PROPERTY_PHOTO_PATH = '/email/sample-property.jpg';

/** Invented but realistic values: the editor's live preview and the test send both use them. */
export const SAMPLE_MERGE_FIELDS: Record<MergeFieldKey, string> = {
  first_name: 'Anna',
  full_name: 'Anna de Vries',
  email: 'anna.devries@example.com',
  property_title: 'Felújított parasztház nagy kerttel',
  property_url: 'https://finddome.com/hu/',
  property_price: '€ 129.000',
  property_location: 'Szigliget, Veszprém vármegye',
  property_ref: '1042',
  property_description:
    'Gondosan felújított, napfényes parasztház csendes utcában, a Balaton-felvidék szívében. Tágas, termőfás kert, fedett terasz és külön vendégház – nyaralónak és állandó otthonnak egyaránt ideális.',
  property_area: '120 m²',
  property_rooms: '3',
  property_bedrooms: '3',
  property_photo_url: `${SITE_URL}${SAMPLE_PROPERTY_PHOTO_PATH}`,
  old_price: '€ 139.000',
  new_price: '€ 129.000',
  agent_name: 'FINDDOME',
  agent_phone: '+36 30 123 4567',
  agent_email: 'info@finddome.com',
};

/** Escapes a merge value for HTML. Names and titles come from visitors and owners. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Fills the tokens. `html: true` (the body) escapes each value; the subject is
 * plain text and is not escaped.
 */
export function renderTemplate(content: string, fields: MergeFields, opts: { html?: boolean } = {}): string {
  return content.replace(MERGE_TOKEN_RE, (match, key: string) => {
    if (!isKnownMergeFieldKey(key)) return match;
    const value = fields[key] ?? '';
    return opts.html ? escapeHtml(value) : value;
  });
}

/**
 * The first name from a single "name" field, which is all the public forms ask
 * for. Hungarians write the family name first ("Nagy Gábor"), everyone else
 * last — so the recipient's language decides which end is the given name.
 */
export function firstNameOf(fullName: string | null | undefined, locale: string): string | null {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return locale === 'hu' ? parts[parts.length - 1] : parts[0];
}

/**
 * The one place the field set is assembled — single send, bulk send, the
 * personalised preview and the automatic replies all call it. Values arrive
 * already formatted (prices in the template's language); this only maps them.
 */
export function buildMergeFields(params: {
  recipient: { name: string | null; email: string; locale: string };
  property?: {
    title: string;
    url: string;
    price: string;
    location: string;
    ref: string;
    oldPrice?: string | null;
    description?: string | null;
    area?: string | null;
    rooms?: string | null;
    photoUrl?: string | null;
  } | null;
  signature?: { name: string; phone: string | null; email: string | null } | null;
  company: { name: string; phone: string | null; email: string };
}): MergeFields {
  const { recipient, property, signature, company } = params;
  return {
    first_name: firstNameOf(recipient.name, recipient.locale),
    full_name: recipient.name?.trim() || null,
    email: recipient.email,
    property_title: property?.title ?? null,
    property_url: property?.url ?? null,
    property_price: property?.price ?? null,
    property_location: property?.location ?? null,
    property_ref: property?.ref ?? null,
    property_description: property?.description ?? null,
    property_area: property ? property.area || '—' : null,
    property_rooms: property ? property.rooms || '—' : null,
    property_bedrooms: property ? property.rooms || '—' : null,
    property_photo_url: property?.photoUrl ?? null,
    old_price: property?.oldPrice ?? null,
    new_price: property?.oldPrice ? property.price : null,
    agent_name: signature?.name ?? company.name,
    agent_phone: signature?.phone ?? company.phone,
    agent_email: signature?.email ?? company.email,
  };
}
