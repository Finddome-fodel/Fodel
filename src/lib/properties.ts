/**
 * Property queries and locale resolution.
 *
 * Until Stage 1, this file read six Markdown files through Astro's content
 * collections. It now queries Supabase instead — but every exported function
 * keeps its exact old name and shape, so every page and component that
 * consumes a `Property` (PropertyCard, PropertiesPage, PropertyDetailPage,
 * HomePage, SoldPage, seo.ts) needed zero changes. Only this file and the two
 * property detail routes know the data now comes from a database.
 *
 * A listing's Hungarian text always exists; other locales exist only if the
 * seller paid €25 for that translation. When a locale is missing we fall back
 * to Hungarian rather than hiding the listing — a Dutch buyer seeing the
 * Hungarian description is far better than not seeing the property at all.
 *
 * Queries use the anon Supabase client, so Row-Level Security — not this
 * file — is what actually stops an unpublished listing from ever being
 * returned. See src/lib/supabase.ts.
 */

import { getSupabase } from '~/lib/supabase';
import { resolveImage } from '~/lib/property-images';
import type { Locale } from '~/i18n/ui';
import { LOCALES, propertyPath } from '~/i18n/ui';
import { getTaxonomy, type Taxonomy, type TaxonomyTerm } from '~/lib/runtime-config';
import type { ImageMetadata } from 'astro';
import { PROPERTY_GROUPS, currentFeatures, groupOf, subtypeOf } from '~/lib/listing-catalogue';
import { approximateCentre, isExpired } from '~/lib/listing-rules';
import { readDetails, fieldRules, COUNT_FIELDS, type ListingDetails } from '~/lib/listing-details';

type LocalisedText = { hu: string } & Partial<Record<Exclude<Locale, 'hu'>, string>>;

export type Property = {
  id: string;
  data: {
    ref: string;
    category: string;
    propertyGroup?: string;
    propertySubtype?: string;
    categoryLabels: Partial<Record<Locale, string>> & { hu: string; nl: string };
    categorySlugs: Partial<Record<Locale, string>>;
    categorySchema: string;
    status: 'active' | 'reserved' | 'sold';
    title: LocalisedText;
    subtitle?: LocalisedText;
    description: LocalisedText;
    body: LocalisedText;
    price: { eur: number; huf: number; asOf: Date; negotiable: boolean };
    location: {
      settlement: string;
      county: string;
      region: string;
      lat: number;
      lng: number;
      precision: 'exact' | 'approximate';
      country: string;
    };
    areas: { floorM2?: number; buildingM2?: number; plotM2: number };
    /** Rooms (not counting half rooms), half rooms and bathrooms of a home; undefined when none of them is given. */
    rooms?: { rooms?: number; halfRooms?: number; bathrooms?: number };
    /** Rooms, floors, cellar, utilities, parking, surroundings, extra buildings (migrations 0025, 0041); only what applies to this kind of property. */
    details: ListingDetails;
    /** Present only when the owner chose to show the address in the listing. */
    address?: { street: string; postalCode?: string };
    building: {
      yearBuilt?: number;
      renovatedIn?: number;
      condition?: LocalisedText;
      /** Every heating ticked (migration 0041); empty when not given or not known. */
      heating: LocalisedText[];
      epcClass: string;
      /** Every wall material ticked (migration 0041); empty when not given or not known. */
      walls: { key: string; labels: TaxonomyTerm['labels'] }[];
    };
    features: string[];
    media: {
      // A local demo photo (Stage 1's seed data) resolves to a real
      // ImageMetadata object; a photo uploaded through the portal (Stage 3)
      // is a plain Supabase Storage URL. <Image> accepts either — see
      // astro.config.mjs's `image.remotePatterns` and the `inferSize` prop
      // on the <Image> calls in PropertyCard and PropertyDetailPage.
      hero: ImageMetadata | string;
      heroAlt: LocalisedText;
      gallery: { src: ImageMetadata | string; alt: LocalisedText; label?: LocalisedText }[];
      videoUrl?: string;
    };
    listing: {
      package: 'cheap-6m' | 'normal-12m';
      featured: boolean;
      topicFeatured?: boolean;
      homepageFeatured: boolean;
      publishedAt: Date;
      expiresAt: Date;
      languages: Locale[];
    };
    seller: { contactVisible: boolean; name?: string; phone?: string; speaks: string[] };
    tag?: LocalisedText;
  };
};

/* ── Row shapes as they come back from Supabase ──────────────────────────── */

type TranslationRow = {
  locale: string;
  title: string;
  subtitle: string | null;
  description: string;
  body: string;
  condition: string | null;
  heating: string | null;
  tag: string | null;
};

type MediaRow = {
  storage_path: string;
  alt: Record<string, string>;
  label: Record<string, string> | null;
  sort_order: number;
  is_hero: boolean;
};

type PropertyRow = {
  property_group?: string;
  property_subtype?: string;
  topic_featured?: boolean;
  public_location_safe?: boolean;
  building_m2?: number | null;
  condition_key?: string;
  heating_key?: string;
  id: string;
  ref: string;
  category: string;
  status: 'published' | 'sold';
  reserved: boolean;
  settlement: string;
  county: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  precision: 'exact' | 'approximate';
  price_eur: number;
  price_huf: number;
  price_asof: string;
  price_negotiable: boolean;
  floor_m2: number | null;
  plot_m2: number;
  bedrooms: number | null;
  bathrooms: number | null;
  year_built: number | null;
  renovated_in: number | null;
  epc_class: string;
  wall_key?: string | null;
  details?: unknown;
  public_address?: string | null;
  public_postal_code?: string | null;
  features: string[];
  video_url: string | null;
  seller_contact_visible: boolean;
  seller_name: string | null;
  seller_phone: string | null;
  seller_speaks: string[];
  package: 'cheap-6m' | 'normal-12m';
  featured: boolean;
  homepage_featured: boolean;
  homepage_order: number;
  editors_pick: boolean;
  editors_pick_order: number;
  bargain: boolean;
  bargain_since: string | null;
  published_at: string | null;
  expires_at: string | null;
  property_translations: TranslationRow[];
  property_media: MediaRow[];
};

/** A demo photo is a bare filename resolved locally; a real upload is a full Storage URL. */
function resolveMedia(storagePath: string): ImageMetadata | string {
  return storagePath.startsWith('http') ? storagePath : resolveImage(storagePath);
}

/** Build a `{hu, nl, ...}` object from translation rows. `hu` is assumed present. */
function localisedField(
  rows: TranslationRow[],
  field: 'title' | 'subtitle' | 'description' | 'body' | 'condition' | 'heating' | 'tag'
): LocalisedText | undefined {
  const byLocale = Object.fromEntries(rows.map((r) => [r.locale, r[field]]));
  const hu = byLocale.hu;
  if(!Object.values(byLocale).some(Boolean))return undefined;
  const out: LocalisedText = { hu:hu||'' };
  for (const locale of ['nl', 'de', 'en', 'fr', 'es', 'pl', 'ro', 'sk', 'it', 'pt', 'el', 'cs', 'sl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt'] as const) {
    const value = byLocale[locale];
    if (value) out[locale] = value;
  }
  return out;
}

function mapRow(row: PropertyRow, taxonomy: Taxonomy): Property {
  const translations = row.property_translations.filter(t=>t.title!=='Új hirdetés'||t.description?.trim()||t.body?.trim());
  const media = [...row.property_media].sort((a, b) => a.sort_order - b.sort_order);
  const hero = media.find((m) => m.is_hero) ?? media[0];
  const gallery = media.filter((m) => m !== hero);

  const languages = translations
    .map((t) => t.locale)
    .filter((l): l is Locale => (LOCALES as readonly string[]).includes(l));

  const category: TaxonomyTerm | undefined = taxonomy.category.find((term) => term.key === row.category);
  // An approximate listing never carries its real point into a page, the map
  // feed or structured data: everything public gets the offset centre.
  const point = row.precision === 'exact' || row.public_location_safe ? { lat: row.lat, lng: row.lng } : approximateCentre(row.id, row.lat, row.lng);
  const group=row.property_group||groupOf(row.category),subtype=subtypeOf(row.category,row.property_subtype);
  // The page shows the facts this kind of property has (src/lib/listing-details.ts), nothing left over from another type.
  const rules=fieldRules(group,subtype),shown=(k:keyof typeof rules)=>rules[k]!=='hidden';
  const building=shown('year_built');
  const stored = readDetails(row.details, row);
  // Parking once ticked as a feature ("Garázs vagy parkoló") is shown with the parking options.
  const folded = currentFeatures(row.features, group);
  const details: ListingDetails = {
    ...(shown('rooms') ? Object.fromEntries(COUNT_FIELDS.filter((k) => stored[k] !== undefined).map((k) => [k, stored[k]])) : {}),
    ...(shown('cellar_m2') && stored.cellar_m2 ? { cellar_m2: stored.cellar_m2 } : {}),
    settings: stored.settings,
    heating: shown('heating') ? stored.heating : [],
    walls: shown('walls') ? stored.walls : [],
    utilities: shown('utilities') ? stored.utilities : [],
    parking: shown('parking') ? [...new Set([...stored.parking, ...folded.parking])] : [],
    ...(shown('extra_buildings') && stored.extra_buildings ? { extra_buildings: stored.extra_buildings } : {}),
  };
  const term = (list: TaxonomyTerm[], key: string) => list.find((t) => t.key === key);
  // "Not known" says nothing to a buyer; "no heating" does.
  const heating = details.heating.filter((k) => k !== 'unknown').map((k) => term(taxonomy.heating, k)?.labels as LocalisedText).filter(Boolean);
  const walls = details.walls.filter((k) => k !== 'nem-tudom').map((k) => term(taxonomy.wall, k)).filter((t): t is TaxonomyTerm => Boolean(t)).map((t) => ({ key: t.key, labels: t.labels }));
  const fallbackLabels = { hu: row.category, nl: row.category };
  return {
    id: row.id,
    data: {
      ref: row.ref,
      category: row.category,
      propertyGroup: row.property_group || groupOf(row.category),
      propertySubtype: row.property_subtype,
      categoryLabels: (PROPERTY_GROUPS.find(g=>g.key===group)?.labels ?? category?.labels ?? fallbackLabels) as Property['data']['categoryLabels'],
      categorySlugs: category?.slugs ?? { hu: row.category, nl: row.category },
      categorySchema: category?.schemaType ?? 'Place',
      status: row.status === 'sold' ? 'sold' : row.reserved ? 'reserved' : 'active',
      title: localisedField(translations, 'title')!,
      subtitle: localisedField(translations, 'subtitle'),
      description: localisedField(translations, 'description')!,
      body: localisedField(translations, 'body') ?? { hu: '' },
      price: {
        eur: row.price_eur,
        huf: row.price_huf,
        asOf: new Date(row.price_asof),
        negotiable: row.price_negotiable,
      },
      location: {
        settlement: row.settlement,
        county: row.county,
        region: row.region,
        lat: point.lat,
        lng: point.lng,
        precision: row.precision,
        country: row.country,
      },
      areas: { floorM2: shown('floor_m2')?(row.floor_m2 ?? undefined):undefined, buildingM2:shown('building_m2')?(row.building_m2??undefined):undefined, plotM2:shown('plot_m2')?row.plot_m2:0 },
      rooms:
        shown('rooms') && (details.rooms !== undefined || row.bathrooms != null)
          ? { ...(details.rooms !== undefined ? { rooms: details.rooms } : {}), ...(details.half_rooms ? { halfRooms: details.half_rooms } : {}), ...(row.bathrooms != null ? { bathrooms: row.bathrooms } : {}) }
          : undefined,
      details,
      address: row.public_address ? { street: row.public_address, postalCode: row.public_postal_code ?? undefined } : undefined,
      building: {
        yearBuilt: building?(row.year_built ?? undefined):undefined,
        renovatedIn: building?(row.renovated_in ?? undefined):undefined,
        condition: building ? (taxonomy.condition.find(t=>t.key===row.condition_key)?.labels as LocalisedText || localisedField(translations, 'condition')) : undefined,
        heating: building ? (heating.length ? heating : [localisedField(translations, 'heating')].filter((h): h is LocalisedText => Boolean(h))) : [],
        epcClass: shown('energy') ? row.epc_class : 'unknown',
        walls,
      },
      features: folded.features,
      media: {
        hero: resolveMedia(hero.storage_path),
        heroAlt: (hero.alt as LocalisedText) ?? { hu: '' },
        gallery: gallery.map((m) => ({
          src: resolveMedia(m.storage_path),
          alt: (m.alt as LocalisedText) ?? { hu: '' },
          label: (m.label as LocalisedText) ?? undefined,
        })),
        videoUrl: row.video_url ?? undefined,
      },
      listing: {
        package: row.package,
        featured: row.featured,
        topicFeatured: row.topic_featured,
        homepageFeatured: row.homepage_featured,
        publishedAt: new Date(row.published_at ?? row.price_asof),
        expiresAt: new Date(row.expires_at ?? row.price_asof),
        languages,
      },
      seller: {
        contactVisible: row.seller_contact_visible,
        name: row.seller_name ?? undefined,
        phone: row.seller_phone ?? undefined,
        speaks: row.seller_speaks,
      },
      tag: localisedField(translations, 'tag'),
    },
  };
}

/**
 * The language a visitor reads seller-written text in, and where it came from.
 *
 * Sellers write Hungarian, and pay for a Dutch version (and, as an extra, for
 * more languages). FODEL never translates seller text on the fly. So:
 *   hu, nl      the visitor's language, then Hungarian;
 *   en, de, fr, es, pl, ro, sk, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt
 *               a translation the seller paid for, then English (the common
 *               second language — an English reader should not get Dutch
 *               while English exists), then the Dutch text, then Hungarian.
 *               `from` tells the page when it is not the visitor's own
 *               language, so it can say so.
 */
export function resolveText(field: LocalisedText | undefined, locale: Locale): { text: string; from: Locale } {
  if (!field) return { text: '', from: locale };
  const order: Locale[] = locale === 'hu' || locale === 'nl' ? [locale, 'hu'] : locale === 'en' ? [locale, 'nl', 'hu'] : [locale, 'en', 'nl', 'hu'];
  for (const candidate of order) {
    const value = field[candidate];
    if (value) return { text: value, from: candidate };
  }
  const original=LOCALES.find(candidate=>field[candidate]);
  return original?{text:field[original]!,from:original}:{text:'',from:locale};
}

/** Resolve a localised field, falling back as described above. */
export function text(field: LocalisedText | undefined, locale: Locale): string {
  return resolveText(field, locale).text;
}

/** True when the seller paid for this locale, so we can mark machine fallbacks. */
export function hasTranslation(p: Property, locale: Locale): boolean {
  return p.data.listing.languages.includes(locale);
}

/**
 * Every property visible to the public: published (for sale) or sold (for
 * the archive). RLS enforces this same filter independently — this `.in()`
 * is what makes the SQL efficient, not what makes it safe.
 *
 * Deliberately uncached: Netlify keeps serverless functions warm across
 * separate visitor requests, so any cache here without a TTL would silently
 * serve stale listings between CDN revalidations — undermining the one thing
 * the approval workflow (Stage 4) depends on: approve a listing and it
 * appears live. The route-level `s-maxage` header is where caching belongs.
 */
async function fetchAll(): Promise<Property[]> {
  const taxonomy = await getTaxonomy();
  const { data, error } = await getSupabase()
    .from('properties')
    .select('*, property_translations(*), property_media(*)')
    .in('status', ['published', 'sold']);
  if (error) throw new Error(`Failed to load properties from Supabase: ${error.message}`);
  return ((data ?? []) as PropertyRow[])
    .filter((row) => isPubliclyListed(row))
    .map((row) => mapRow(row, taxonomy))
    .sort(sortByFeaturedThenDate);
}

/**
 * The one public visibility rule, applied to every listing query on the site
 * (lists, map, sitemap, Top 10, homepage, detail pages): published and not
 * past its expiry, or sold (the sold archive keeps sold listings whatever
 * their date). The daily cron archives an expired listing; this filter is
 * what hides it in the hours between expiry and that run.
 */
export function isPubliclyListed(row: { status: string; expires_at?: string | null }, now: Date = new Date()): boolean {
  if (row.status === 'sold') return true;
  return row.status === 'published' && !isExpired(row.expires_at, now);
}

export async function allProperties(): Promise<Property[]> {
  return fetchAll();
}

export type SearchParams = {
  locale: Locale;
  q?: string;
  category?: string;
  country?: string;
  region?: string;
  county?: string;
  settlement?: string;
  priceMin?: number;
  priceMax?: number;
  floorMin?: number;
  floorMax?: number;
  plotMin?: number;
  plotMax?: number;
  /** At least this many rooms (half rooms not counted). */
  roomsMin?: number;
  subtype?: string;
  /** "Exclude adobe houses": drops only listings whose wall material is adobe. */
  excludeAdobe?: boolean;
  /** [west, south, east, north] from the browse map's "search this area". */
  bbox?: [number, number, number, number];
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'area-desc';
  page?: number;
  perPage?: number;
};

export type SearchResult = { properties: Property[]; total: number; page: number; perPage: number };

/**
 * The Stage 6 server-side query. The `search_properties` Postgres function
 * (originally supabase/migrations/0004_search.sql, recreated with a wider
 * parameter list by 0013_search_country.sql) does the actual filtering,
 * free-text matching and ordering in one round trip and hands back matching
 * ids in order; this fetches the full rows for exactly those ids and
 * re-applies that order (Postgres doesn't guarantee `id = ANY(...)`
 * preserves it) using the same mapRow used everywhere else, so a search
 * result is shaped identically to any other Property.
 */
export async function searchProperties(params: SearchParams): Promise<SearchResult> {
  const perPage = params.perPage ?? 24;
  const page = Math.max(1, params.page ?? 1);

  const args: Record<string, unknown> = {
    // English, German and French readers see the Dutch text, so that is what they search.
    p_locale: params.locale === 'hu' ? 'hu' : 'nl',
    p_query: params.q || null,
    p_category: params.category || null,
    p_country: params.country || null,
    p_region: params.region || null,
    p_county: params.county || null,
    p_settlement: params.settlement || null,
    p_price_min: params.priceMin ?? null,
    p_price_max: params.priceMax ?? null,
    p_floor_min: params.floorMin ?? null,
    p_floor_max: params.floorMax ?? null,
    p_plot_min: params.plotMin ?? null,
    p_plot_max: params.plotMax ?? null,
    // The parameter kept its old name; since migration 0041 it filters on the room count.
    p_bedrooms_min: params.roomsMin ?? null,
    p_bbox: params.bbox ?? null,
    p_subtype: params.subtype || null,
    p_sort: params.sort ?? 'featured',
    p_limit: perPage,
    p_offset: (page - 1) * perPage,
  };
  const { data: matches, error: rpcError } = await getSupabase().rpc('search_european_properties', {
    ...args, p_exclude_adobe: params.excludeAdobe ?? null,
  });
  if (rpcError) throw new Error(`Search failed: ${rpcError.message}`);

  const ids = (matches ?? []).map((m: { id: string }) => m.id);
  const total = matches?.[0]?.total_count ?? 0;
  if (ids.length === 0) return { properties: [], total: Number(total), page, perPage };

  const { data, error } = await getSupabase()
    .from('properties')
    .select('*, property_translations(*), property_media(*)')
    .in('id', ids);
  if (error) throw new Error(`Failed to load search results: ${error.message}`);

  const taxonomy = await getTaxonomy();
  const byId = new Map(((data ?? []) as PropertyRow[]).map((row) => [row.id, mapRow(row, taxonomy)]));
  const live = new Set(((data ?? []) as PropertyRow[]).filter((row) => isPubliclyListed(row)).map((row) => row.id));
  const properties = ids
    .filter((id: string) => live.has(id))
    .map((id: string) => byId.get(id))
    .filter((p: Property | undefined): p is Property => Boolean(p));

  return { properties, total: Number(total), page, perPage };
}

export async function activeProperties(): Promise<Property[]> {
  return (await fetchAll()).filter((p) => p.data.status === 'active');
}

export async function soldProperties(): Promise<Property[]> {
  return (await fetchAll()).filter((p) => p.data.status === 'sold');
}

/** Active homepage placements, ordered by publication date. */
export async function homepageFeatured(limit=3):Promise<Property[]>{
  const active=await activeProperties();
  const featured=active.filter(p=>p.data.listing.homepageFeatured);
  return (featured.length?featured:active).sort((a,b)=>b.data.listing.publishedAt.getTime()-a.data.listing.publishedAt.getTime()).slice(0,limit);
}

/**
 * Related listings, ranked rather than filtered.
 *
 * A strict "same region OR same category" filter left most properties with a
 * single match, which renders as one lonely card in a three-column grid. This
 * scores every other listing and always returns the best `limit`, so the
 * section is either full or absent.
 */
export function similarTo(p: Property, pool: Property[], limit = 3): Property[] {
  const priceOf = (x: Property) => x.data.price.eur;

  return pool
    .filter((c) => c.id !== p.id && c.data.status === 'active')
    .map((c) => {
      let score = 0;
      if (c.data.location.region === p.data.location.region) score += 4;
      if (c.data.location.county === p.data.location.county) score += 2;
      if (c.data.category === p.data.category) score += 3;
      // Balaton and Balaton-felvidék are one market to a buyer.
      if (
        c.data.location.region.startsWith('Balaton') &&
        p.data.location.region.startsWith('Balaton')
      ) {
        score += 2;
      }
      // Closer asking price is a better comparison.
      const ratio = Math.min(priceOf(c), priceOf(p)) / Math.max(priceOf(c), priceOf(p));
      score += ratio * 2;
      return { entry: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}

function sortByFeaturedThenDate(a: Property, b: Property): number {
  const featured = Number(b.data.listing.featured) - Number(a.data.listing.featured);
  if (featured !== 0) return featured;
  return b.data.listing.publishedAt.getTime() - a.data.listing.publishedAt.getTime();
}

export function url(p: Property, locale: Locale): string {
  return propertyPath(locale, p.data.categorySlugs[locale] ?? p.data.category, p.data.ref);
}

/** Distinct regions present in the inventory, for filters and landing pages. */
export function regionsOf(properties: Property[]): string[] {
  return [...new Set(properties.map((p) => p.data.location.region))].sort();
}

export function countiesOf(properties: Property[]): string[] {
  return [...new Set(properties.map((p) => p.data.location.county))].sort();
}

export function categoriesOf(properties: Property[]): string[] {
  return [...new Set(properties.map((p) => p.data.propertyGroup || groupOf(p.data.category)))];
}

export function countriesOf(properties: Property[]): string[] {
  return [...new Set(properties.map((p) => p.data.location.country))].sort();
}

/** URL-safe slug for a region or county name (handles Hungarian diacritics). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Price buckets used by the filter UI, in euro. */
// Every entry carries both keys (undefined where open-ended) so the type is
// uniform — a mix of "some entries have min, some have max" made every
// consumer's `band.min`/`band.max` access a type error once there was more
// than one (formatting-only) reader of this array.
export const PRICE_BANDS = [
  { id: 'to-75', min: undefined, max: 75000 },
  { id: '75-150', min: 75000, max: 150000 },
  { id: '150-250', min: 150000, max: 250000 },
  { id: 'from-250', min: 250000, max: undefined },
] as const;

export function priceBandLabel(band: (typeof PRICE_BANDS)[number]): string {
  const f = (n: number) => `€${(n / 1000).toFixed(0)}k`;
  if (!band.min) return `< ${f(band.max!)}`;
  if (!band.max) return `> ${f(band.min)}`;
  return `${f(band.min)} – ${f(band.max)}`;
}
