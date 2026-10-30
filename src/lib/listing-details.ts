/**
 * The property facts beyond price and place: rooms, floors, cellar, setting,
 * heating, walls, utilities, parking, the extra buildings, and the street address.
 *
 * Stored as `properties.details` (one jsonb object, migration 0025), so a new
 * fact never needs a new column. The street address is private
 * (`property_private`); it becomes public only when the owner ticks "show the
 * address in the ad", and then it is copied to `public_address` /
 * `public_postal_code`. Everything here is plain data and pure functions: the
 * form, the form parser, the editor, the review screen, the public page and the
 * submit gate all ask `fieldRules()` which facts a kind of property has and which
 * of them are compulsory, so the rules live in exactly one place.
 */
import data from '../data/listing/details.json';
import { isLandOnly, hasLivingArea, hasPlot, labelIn, type Labels } from '~/lib/listing-catalogue';

export type ListingDetails = {
  rooms?: number;
  half_rooms?: number;
  floors?: number;
  kitchens?: number;
  toilets?: number;
  cellar_m2?: number;
  /** Multi-select since migration 0041 (was the single `setting`). */
  settings: string[];
  /** Heating and wall material, several at once (migration 0041). `heating_key` / `wall_key` mirror the first. */
  heating: string[];
  walls: string[];
  utilities: string[];
  parking: string[];
  extra_buildings?: string;
};

export const SETTINGS = data.settings;
export const UTILITIES = data.utilities;
export const PARKING = data.parking;
export type DetailLabelKey = keyof typeof data.labels;

export const SETTING_KEYS: string[] = SETTINGS.map((s) => s.key);
export const UTILITY_KEYS: string[] = UTILITIES.map((s) => s.key);
export const PARKING_KEYS: string[] = PARKING.map((s) => s.key);

/** The counted facts kept in `details`, in the order a buyer reads them. Bathrooms have their own column. */
export const COUNT_FIELDS = ['rooms', 'half_rooms', 'floors', 'kitchens', 'toilets'] as const;
export type CountField = (typeof COUNT_FIELDS)[number];

/** "No heating" and "Not known" are answers on their own; ticking one clears the others, and the other way round. */
export const HEATING_EXCLUSIVE = ['none', 'unknown'];
export const WALL_EXCLUSIVE = ['nem-tudom'];
/** "Mixed" made sense when only one answer was possible; with several ticks it says nothing. Shown only where already chosen. */
export const HEATING_RETIRED = ['mixed'];
export const WALL_RETIRED = ['vegyes'];
/** Keeps either the real answers or a single exclusive one, never both. */
export function exclusiveChoice(keys: string[], exclusive: string[]): string[] {
  const unique = [...new Set(keys)];
  const real = unique.filter((k) => !exclusive.includes(k));
  return real.length ? real : unique.slice(0, 1);
}

export const detailLabel = (key: DetailLabelKey, locale: string) => labelIn(data.labels[key] as Labels, locale);
const optionLabel = (list: { key: string; labels: Labels }[], key: string, locale: string) => {
  const hit = list.find((o) => o.key === key);
  return hit ? labelIn(hit.labels, locale) : '';
};
export const settingLabel = (key: string, locale: string) => optionLabel(SETTINGS as never, key, locale);
export const utilityLabel = (key: string, locale: string) => optionLabel(UTILITIES as never, key, locale);
export const parkingLabel = (key: string, locale: string) => optionLabel(PARKING as never, key, locale);

/** "Where did you hear about us?" (private, asked once in the setup). Portal wording only: hu, nl, en. */
export const HEARD_FROM = [
  { key: 'search', labels: { hu: 'Internetes keresés', nl: 'Zoekmachine', en: 'Internet search' } },
  { key: 'social', labels: { hu: 'Facebook, Instagram vagy más közösségi oldal', nl: 'Facebook, Instagram of andere social media', en: 'Facebook, Instagram or other social media' } },
  { key: 'youtube', labels: { hu: 'YouTube', nl: 'YouTube', en: 'YouTube' } },
  { key: 'recommendation', labels: { hu: 'Ismerős ajánlása', nl: 'Aanbeveling van een bekende', en: 'Recommended by someone I know' } },
  { key: 'returning', labels: { hu: 'Korábban már hirdettem a FINDDOME-nél', nl: 'Ik heb eerder bij FINDDOME geadverteerd', en: 'I have advertised with FINDDOME before' } },
  { key: 'press', labels: { hu: 'Sajtó, hírlevél vagy hirdetés', nl: 'Pers, nieuwsbrief of advertentie', en: 'Press, newsletter or an advert' } },
  { key: 'other', labels: { hu: 'Egyéb', nl: 'Anders', en: 'Other' } },
] as const;
export const HEARD_FROM_KEYS: string[] = HEARD_FROM.map((o) => o.key);

/* ── Which facts make sense for which kind of property ─────────────────── */

/** Flats: no plot, no building of their own to measure, no garden. */
export const FLAT_SUBTYPES = ['apartment', 'penthouse', 'holiday-apartment'];
/** A cellar area means nothing where the property is itself a garage or a cellar. */
const NO_CELLAR = ['garage-parking', 'storage-cellar', 'wine-cellar'];
/** Catch-all or bundled types: show the building facts, but do not insist on them. */
const LOOSE = (subtype: string) => subtype.endsWith('-other') || ['other-property', 'special-purpose', 'portfolio', 'development-project'].includes(subtype);
/** Types that may well have no plot of their own (a unit in a larger building, a stake in a portfolio). */
const PLOT_OPTIONAL = ['restaurant', 'workshop', 'rented-commercial', 'income-property'];

/** Land and "other" already carry their own access features (electricity, water, sewer, gas, telecom). */
export const hasUtilities = (group: string) => !['land', 'other'].includes(group);
/** Parking and a cellar need a building. */
export const hasParking = (group: string, subtype: string) => !isLandOnly(group, subtype);
export const hasCellar = (group: string, subtype: string) => !isLandOnly(group, subtype) && !NO_CELLAR.includes(subtype);
/** Extra buildings need a plot to stand on. */
export const hasExtraBuildings = hasPlot;
/** Rooms, half rooms, floors, bathrooms, kitchens and toilets belong to anything with a living unit. */
export const hasLayout = hasLivingArea;

export type FieldRule = 'required' | 'optional' | 'hidden';
export const LISTING_FIELDS = ['street', 'settings', 'floor_m2', 'building_m2', 'plot_m2', 'year_built', 'renovated_in', 'condition', 'energy', 'heating', 'walls', 'cellar_m2', 'rooms', 'half_rooms', 'floors', 'bathrooms', 'kitchens', 'toilets', 'utilities', 'parking', 'extra_buildings'] as const;
export type ListingField = (typeof LISTING_FIELDS)[number];

/**
 * Which facts a kind of property has, and which of them must be filled in before it can be
 * submitted. The one place these rules live: the form shows and labels fields from it, the
 * server keeps hidden fields as saved, the submit gate and the review screen check it, and
 * the public page shows only what applies.
 */
export function fieldRules(group: string, subtype: string): Record<ListingField, FieldRule> {
  const home = hasLayout(group, subtype);
  const building = !isLandOnly(group, subtype);
  const plot = hasPlot(group, subtype);
  const flat = FLAT_SUBTYPES.includes(subtype);
  const loose = LOOSE(subtype);
  const is = (shown: boolean, required: boolean): FieldRule => (!shown ? 'hidden' : required ? 'required' : 'optional');
  const layout = is(home, true);
  return {
    street: is(true, home),
    settings: is(true, home),
    floor_m2: is(home, true),
    // Everything under a roof on the property, outbuildings included. A flat is measured by its living area.
    building_m2: is(building && !flat, !loose),
    plot_m2: is(plot, group === 'land' || group === 'agricultural' || !(loose || PLOT_OPTIONAL.includes(subtype))),
    year_built: is(building, !loose),
    renovated_in: is(building, false),
    condition: is(building, false),
    energy: is(building, false),
    heating: is(building, false),
    walls: is(building, !loose && subtype !== 'garage-parking'),
    cellar_m2: is(hasCellar(group, subtype), false),
    rooms: layout,
    half_rooms: layout,
    floors: layout,
    bathrooms: layout,
    kitchens: layout,
    toilets: layout,
    utilities: is(building && hasUtilities(group), false),
    parking: is(hasParking(group, subtype), false),
    extra_buildings: is(hasExtraBuildings(group, subtype), false),
  };
}
export const shows = (group: string, subtype: string, field: ListingField) => fieldRules(group, subtype)[field] !== 'hidden';

/** Parking choices that fit the kind of property: a garden or "around the house" only where there is one. */
export function parkingFits(key: string, group: string, subtype: string): boolean {
  if (['garden-building', 'garden', 'around-house'].includes(key)) return hasLayout(group, subtype) && hasPlot(group, subtype) && !FLAT_SUBTYPES.includes(subtype);
  if (key === 'enclosed') return !['agricultural', 'mansion'].includes(group);
  return true;
}

/* ── Reading what is stored ─────────────────────────────────────────────── */

const count = (v: unknown, max = 100000): number | undefined => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= max ? n : undefined;
};
const pick = (v: unknown, allowed: string[]): string[] =>
  Array.isArray(v) ? [...new Set(v.map(String).filter((k) => allowed.includes(k)))] : [];
/** Heating and wall keys come from the admin-editable taxonomy, so only their shape is checked here. */
const termKeys = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.map(String).filter((k) => /^[a-z0-9][a-z0-9-]{0,39}$/.test(k)))] : [];

/**
 * Tolerant of anything the column may hold: null, `{}` on old rows, hand-edited JSON, and the
 * shapes from before migration 0041 (a single `setting`; heating and walls only in their columns).
 */
export function readDetails(raw: unknown, columns: { heating_key?: string | null; wall_key?: string | null } = {}): ListingDetails {
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const cellar = typeof o.cellar_m2 === 'number' && o.cellar_m2 > 0 ? o.cellar_m2 : undefined;
  const settings = Array.isArray(o.settings) ? pick(o.settings, SETTING_KEYS) : typeof o.setting === 'string' && SETTING_KEYS.includes(o.setting) ? [o.setting] : [];
  const heating = Array.isArray(o.heating) ? termKeys(o.heating) : columns.heating_key ? termKeys([columns.heating_key]) : [];
  const walls = Array.isArray(o.walls) ? termKeys(o.walls) : columns.wall_key ? termKeys([columns.wall_key]) : [];
  return {
    ...Object.fromEntries(COUNT_FIELDS.map((k) => [k, count(o[k])]).filter(([, v]) => v !== undefined)),
    ...(cellar ? { cellar_m2: cellar } : {}),
    settings,
    heating,
    walls,
    utilities: pick(o.utilities, UTILITY_KEYS),
    parking: pick(o.parking, PARKING_KEYS),
    ...(typeof o.extra_buildings === 'string' && o.extra_buildings.trim() ? { extra_buildings: o.extra_buildings.trim() } : {}),
  };
}

/* ── The submit gate ────────────────────────────────────────────────────── */

/** The facts that can block a submission, in the order the form asks for them. */
export const GAP_FIELDS = ['street', 'settings', 'floor_m2', 'building_m2', 'plot_m2', 'year_built', 'walls', 'rooms', 'half_rooms', 'floors', 'bathrooms', 'kitchens', 'toilets'] as const;
export type DetailGap = (typeof GAP_FIELDS)[number];

/** How each gap reads inside "To submit, you still need: …" (portal languages). */
export const GAP_LABELS: Record<'hu' | 'nl' | 'en', Record<DetailGap, string>> = {
  hu: { street: 'a cím', settings: 'a környezet', floor_m2: 'a lakóegység területe', building_m2: 'a teljes épületterület', plot_m2: 'a telekterület', year_built: 'az építés éve (vagy a „nem ismert” jelölés)', walls: 'a falazat', rooms: 'a szobák száma', half_rooms: 'a félszobák száma', floors: 'a szintek száma', bathrooms: 'a fürdőszobák száma', kitchens: 'a konyhák száma', toilets: 'a különálló WC-k száma' },
  nl: { street: 'het adres', settings: 'de omgeving', floor_m2: 'de woonoppervlakte', building_m2: 'de totale gebouwoppervlakte', plot_m2: 'de perceeloppervlakte', year_built: 'het bouwjaar (of „onbekend”)', walls: 'het bouwmateriaal', rooms: 'het aantal kamers', half_rooms: 'het aantal halve kamers', floors: 'het aantal woonlagen', bathrooms: 'het aantal badkamers', kitchens: 'het aantal keukens', toilets: 'het aantal aparte toiletten' },
  en: { street: 'the address', settings: 'the surroundings', floor_m2: 'the living area', building_m2: 'the total building area', plot_m2: 'the plot area', year_built: 'the year built (or “not known”)', walls: 'the wall construction', rooms: 'the number of rooms', half_rooms: 'the number of half rooms', floors: 'the number of levels', bathrooms: 'the number of bathrooms', kitchens: 'the number of kitchens', toilets: 'the number of separate toilets' },
};
export const gapLabel = (gap: string, lang: string) => GAP_LABELS[lang === 'nl' || lang === 'en' ? lang : 'hu'][gap as DetailGap] ?? gap;

export type GapInput = {
  floor_m2?: number | null;
  building_m2?: number | null;
  plot_m2?: number | null;
  year_built?: number | null;
  year_built_unknown?: boolean | null;
  bathrooms?: number | null;
  wall_key?: string | null;
  heating_key?: string | null;
  details?: unknown;
};

/**
 * What still has to be filled in before a listing can be submitted, from `fieldRules()`.
 * Counts may be 0 (a studio has no separate kitchen); only an empty box is a gap. The year
 * built is answered by a year or by ticking "not known"; "Nem ismert" is a wall answer too.
 * Heating is optional ("Nincs fűtés" and "Nem ismert" are offered, but nobody is made to choose).
 */
export function detailGaps(p: GapInput, group: string, subtype: string, street: string | null | undefined): DetailGap[] {
  const rules = fieldRules(group, subtype);
  const d = readDetails(p.details, p);
  const area = (v: unknown) => Number(v) > 1;
  const filled: Record<DetailGap, boolean> = {
    street: Boolean(street?.trim()),
    settings: d.settings.length > 0,
    floor_m2: area(p.floor_m2),
    building_m2: area(p.building_m2),
    plot_m2: area(p.plot_m2),
    year_built: Number(p.year_built) > 0 || Boolean(p.year_built_unknown),
    walls: d.walls.length > 0,
    rooms: d.rooms !== undefined,
    half_rooms: d.half_rooms !== undefined,
    floors: d.floors !== undefined,
    bathrooms: p.bathrooms != null,
    kitchens: d.kitchens !== undefined,
    toilets: d.toilets !== undefined,
  };
  return GAP_FIELDS.filter((k) => rules[k] === 'required' && !filled[k]);
}

/** The same check on a form that has not been saved yet (the wizard's last step). */
export function formGaps(form: FormData, fallback: { group: string; subtype: string }): DetailGap[] {
  const text = (n: string) => String(form.get(n) ?? '').trim();
  const num = (n: string) => { const v = text(n).replace(/\s/g, '').replace(',', '.'); return v === '' ? null : Number(v); };
  const group = text('property_group') || fallback.group, subtype = text('property_subtype') || fallback.subtype;
  const details = {
    settings: form.getAll('settings').map(String),
    walls: form.getAll('walls').map(String),
    ...Object.fromEntries(COUNT_FIELDS.map((k) => [k, num(k) ?? undefined])),
  };
  return detailGaps({
    floor_m2: num('floor_m2') ? 2 : null, building_m2: num('building_m2') ? 2 : null, plot_m2: num('plot_m2') ? 2 : null,
    year_built: num('year_built'), year_built_unknown: form.get('year_built_unknown') === 'yes',
    bathrooms: num('bathrooms'), details,
  }, group, subtype, text('street'));
}
