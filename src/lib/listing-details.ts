/**
 * The property facts the old FODEL upload form asked for and the European
 * intake did not: rooms, floors, cellar, utilities, parking, the setting, the
 * extra buildings, and the street address.
 *
 * Stored as `properties.details` (one jsonb object, migration 0025), so a new
 * fact never needs a new column. The street address is private
 * (`property_private`); it becomes public only when the owner ticks "show the
 * address in the ad", and then it is copied to `public_address` /
 * `public_postal_code`. Everything here is plain data and pure functions: the
 * form parser, the editor, the public page and the submit gate all read it.
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
  setting?: string;
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

/** The seven counted facts, in the order a buyer reads them. */
export const COUNT_FIELDS = ['rooms', 'half_rooms', 'floors', 'kitchens', 'toilets'] as const;
export type CountField = (typeof COUNT_FIELDS)[number];

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

/** Land and "other" already carry their own access features (electricity, water, sewer, gas, telecom). */
export const hasUtilities = (group: string) => !['land', 'other'].includes(group);
/** Parking and a cellar need a building. */
export const hasParking = (group: string, subtype: string) => !isLandOnly(group, subtype);
export const hasCellar = hasParking;
/** Extra buildings need a plot to stand on. */
export const hasExtraBuildings = hasPlot;
/** Rooms, floors, kitchens, toilets belong to homes. */
export const hasLayout = hasLivingArea;

/* ── Reading what is stored ─────────────────────────────────────────────── */

const count = (v: unknown, max = 100000): number | undefined => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= max ? n : undefined;
};
const pick = (v: unknown, allowed: string[]): string[] =>
  Array.isArray(v) ? [...new Set(v.map(String).filter((k) => allowed.includes(k)))] : [];

/** Tolerant of anything the column may hold: null, `{}` on old rows, hand-edited JSON. */
export function readDetails(raw: unknown): ListingDetails {
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const cellar = typeof o.cellar_m2 === 'number' && o.cellar_m2 > 0 ? o.cellar_m2 : undefined;
  return {
    ...Object.fromEntries(COUNT_FIELDS.map((k) => [k, count(o[k])]).filter(([, v]) => v !== undefined)),
    ...(cellar ? { cellar_m2: cellar } : {}),
    ...(typeof o.setting === 'string' && SETTING_KEYS.includes(o.setting) ? { setting: o.setting } : {}),
    utilities: pick(o.utilities, UTILITY_KEYS),
    parking: pick(o.parking, PARKING_KEYS),
    ...(typeof o.extra_buildings === 'string' && o.extra_buildings.trim() ? { extra_buildings: o.extra_buildings.trim() } : {}),
  };
}

/* ── The submit gate ────────────────────────────────────────────────────── */

export type DetailGap = 'street' | 'setting' | 'floor_m2' | 'floors' | 'rooms' | 'kitchens' | 'toilets' | 'bedrooms' | 'bathrooms' | 'heating';

type GapInput = {
  property_group?: string | null;
  category?: string | null;
  property_subtype?: string | null;
  floor_m2?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  heating_key?: string | null;
  details?: unknown;
};

/**
 * What the old form made compulsory for a home and the intake left optional
 * (the editor marks exactly these as required).
 * Only homes are held to it: a plot of land has no kitchens, and a European
 * listing in another country may not have a street number to give. Rooms are
 * counted from 0 so a studio can say "0 bedrooms"; an empty box is a gap.
 * Heating is asked of every property with a building, not only homes: "No heating" is an answer
 * of its own, so a blank is a gap.
 */
export function detailGaps(p: GapInput, group: string, subtype: string, street: string | null | undefined): DetailGap[] {
  const heatingGap: DetailGap[] = !isLandOnly(group, subtype) && !p.heating_key ? ['heating'] : [];
  if (!hasLayout(group, subtype)) return heatingGap;
  const d = readDetails(p.details);
  const gaps: DetailGap[] = [];
  if (!street?.trim()) gaps.push('street');
  if (!d.setting) gaps.push('setting');
  if (!(Number(p.floor_m2) > 0)) gaps.push('floor_m2');
  for (const k of ['floors', 'rooms', 'kitchens', 'toilets'] as const) if (d[k] === undefined) gaps.push(k);
  if (p.bedrooms == null) gaps.push('bedrooms');
  if (p.bathrooms == null) gaps.push('bathrooms');
  return [...gaps, ...heatingGap];
}
