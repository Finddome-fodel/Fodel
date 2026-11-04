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
import { isLandOnly, hasLivingArea, hasPlot, labelIn, livingAreaRule, canonicalSubtype, type Labels } from '~/lib/listing-catalogue';

export type ListingDetails = {
  rooms?: number;
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
/**
 * Parking answers that are no longer offered (November 2026 list). "Kerti épületben" reads as
 * "Garázsban"; "Saját parkolóban" says nothing about where, so it is dropped and the owner picks
 * again the next time the listing is edited (parking is compulsory, so the submit gate asks).
 */
const PARKING_ALIASES: Record<string, string> = { 'garden-building': 'garage' };

/**
 * The counted facts kept in `details`, in the order a buyer reads them. Bathrooms have their own column.
 * Half rooms (`half_rooms`) were dropped in November 2026: an old value is no longer read, so it is
 * not shown anywhere and disappears from the row the next time the listing is saved.
 */
export const COUNT_FIELDS = ['rooms', 'floors', 'kitchens', 'toilets'] as const;
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
/** Rooms, floors, bathrooms, kitchens and toilets belong to anything with a living unit. */
export const hasLayout = hasLivingArea;

export type FieldRule = 'required' | 'optional' | 'hidden';
export const LISTING_FIELDS = ['street', 'settings', 'floor_m2', 'building_m2', 'plot_m2', 'year_built', 'renovated_in', 'condition', 'energy', 'heating', 'walls', 'cellar_m2', 'rooms', 'floors', 'bathrooms', 'kitchens', 'toilets', 'utilities', 'parking', 'extra_buildings'] as const;
export type ListingField = (typeof LISTING_FIELDS)[number];

/**
 * Which facts a kind of property has, and which of them must be filled in before it can be
 * submitted. The one place these rules live: the form shows and labels fields from it, the
 * server keeps hidden fields as saved, the submit gate and the review screen check it, and
 * the public page shows only what applies.
 */
export function fieldRules(group: string, rawSubtype: string): Record<ListingField, FieldRule> {
  const subtype = canonicalSubtype(rawSubtype);
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
    // The living area (net usable floor area of the home), required where there is a home; see livingAreaRule (Q15).
    floor_m2: livingAreaRule(group, subtype),
    // Everything under a roof on the property, outbuildings included. A flat is measured by its living area.
    // Optional for every type since November 2026 (client request): shown for buildings, never required.
    building_m2: is(building && !flat, false),
    plot_m2: is(plot, group === 'land' || group === 'agricultural' || !(loose || PLOT_OPTIONAL.includes(subtype))),
    year_built: is(building, !loose),
    renovated_in: is(building, false),
    condition: is(building, !loose),
    energy: is(building, false),
    heating: is(building, !loose),
    walls: is(building, !loose && subtype !== 'garage-parking'),
    cellar_m2: is(hasCellar(group, subtype), false),
    rooms: layout,
    floors: layout,
    bathrooms: layout,
    kitchens: layout,
    toilets: layout,
    utilities: is(building && hasUtilities(group), false),
    parking: is(hasParking(group, subtype), !loose),
    extra_buildings: is(hasExtraBuildings(group, subtype), false),
  };
}
export const shows = (group: string, subtype: string, field: ListingField) => fieldRules(group, subtype)[field] !== 'hidden';

/** Parking choices that fit the kind of property: a carport, a garden or "around the house" only where there is one. */
export function parkingFits(key: string, group: string, subtype: string): boolean {
  if (['carport', 'garden', 'around-house'].includes(key)) return hasLayout(group, subtype) && hasPlot(group, subtype) && !FLAT_SUBTYPES.includes(subtype);
  if (key === 'underground' || key === 'enclosed') return !['agricultural', 'mansion'].includes(group);
  return true;
}

/* ── Reading what is stored ─────────────────────────────────────────────── */

const count = (v: unknown, max = 100000): number | undefined => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= max ? n : undefined;
};
const pick = (v: unknown, allowed: string[], aliases: Record<string, string> = {}): string[] =>
  Array.isArray(v) ? [...new Set(v.map(String).map((k) => aliases[k] ?? k).filter((k) => allowed.includes(k)))] : [];
/** Heating and wall keys come from the admin-editable taxonomy, so only their shape is checked here. */
const termKeys = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.map(String).filter((k) => /^[a-z0-9][a-z0-9-]{0,39}$/.test(k)))] : [];

/**
 * Tolerant of anything the column may hold: null, `{}` on old rows, hand-edited JSON, and the
 * shapes from before migration 0041 (a single `setting`; heating and walls only in their columns),
 * and the retired answers of November 2026 (half rooms, two parking choices).
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
    parking: pick(o.parking, PARKING_KEYS, PARKING_ALIASES),
    ...(typeof o.extra_buildings === 'string' && o.extra_buildings.trim() ? { extra_buildings: o.extra_buildings.trim() } : {}),
  };
}

/* ── The submit gate ────────────────────────────────────────────────────── */

/** The facts that can block a submission, in the order the form asks for them. */
export const GAP_FIELDS = ['street', 'settings', 'floor_m2', 'building_m2', 'plot_m2', 'year_built', 'condition', 'walls', 'heating', 'rooms', 'floors', 'bathrooms', 'kitchens', 'toilets', 'parking'] as const;
export type DetailGap = (typeof GAP_FIELDS)[number];

/** How each gap reads inside "To submit, you still need: …" (portal languages). */
export const GAP_LABELS: Record<'hu' | 'nl' | 'en', Record<DetailGap, string>> = {
  hu: { street: 'a cím', settings: 'a környezet', floor_m2: 'a nettó hasznos alapterület', building_m2: 'a teljes épületterület', plot_m2: 'a telekterület', year_built: 'az építés éve (vagy a „nem ismert” jelölés)', condition: 'az állapot', walls: 'a falazat', heating: 'a fűtés', rooms: 'a szobák száma', floors: 'a szintek száma', bathrooms: 'a fürdőszobák száma', kitchens: 'a konyhák száma', toilets: 'a különálló WC-k száma', parking: 'a parkolási lehetőség' },
  nl: { street: 'het adres', settings: 'de omgeving', floor_m2: 'de netto gebruiksoppervlakte', building_m2: 'de totale gebouwoppervlakte', plot_m2: 'de perceeloppervlakte', year_built: 'het bouwjaar (of „onbekend”)', condition: 'de staat', walls: 'het bouwmateriaal', heating: 'de verwarming', rooms: 'het aantal kamers', floors: 'het aantal woonlagen', bathrooms: 'het aantal badkamers', kitchens: 'het aantal keukens', toilets: 'het aantal aparte toiletten', parking: 'de parkeermogelijkheden' },
  en: { street: 'the address', settings: 'the surroundings', floor_m2: 'the net usable area', building_m2: 'the total building area', plot_m2: 'the plot area', year_built: 'the year built (or “not known”)', condition: 'the condition', walls: 'the wall construction', heating: 'the heating', rooms: 'the number of rooms', floors: 'the number of levels', bathrooms: 'the number of bathrooms', kitchens: 'the number of kitchens', toilets: 'the number of separate toilets', parking: 'the parking' },
};
/** The message shown under a compulsory field that was left empty (wizard step and editor). */
export const GAP_ERRORS: Record<'hu' | 'nl' | 'en', Record<DetailGap, string>> = {
  hu: {
    street: 'Adja meg az ingatlan címét.',
    settings: 'Jelölje be, milyen környezetben van az ingatlan.',
    floor_m2: 'Adja meg a nettó hasznos alapterületet.',
    building_m2: 'Adja meg a teljes épületterületet.',
    plot_m2: 'Adja meg a telek területét.',
    year_built: 'Adja meg az építés évét, vagy jelölje be, hogy nem ismert.',
    condition: 'Válassza ki az ingatlan állapotát.',
    walls: 'Jelölje be, miből épültek a falak.',
    heating: 'Jelölje be, milyen fűtés van. Ha nincs, válassza a „Nincs fűtés” lehetőséget.',
    rooms: 'Adja meg a szobák számát.',
    floors: 'Adja meg a szintek számát.',
    bathrooms: 'Adja meg a fürdőszobák számát. Ha nincs, írjon 0-t.',
    kitchens: 'Adja meg a konyhák számát. Ha nincs, írjon 0-t.',
    toilets: 'Adja meg a különálló WC-k számát. Ha nincs, írjon 0-t.',
    parking: 'Jelölje be, hol lehet parkolni.',
  },
  nl: {
    street: 'Vul het adres van de woning in.',
    settings: 'Geef aan in welke omgeving de woning ligt.',
    floor_m2: 'Vul de netto gebruiksoppervlakte in.',
    building_m2: 'Vul de totale gebouwoppervlakte in.',
    plot_m2: 'Vul de perceeloppervlakte in.',
    year_built: 'Vul het bouwjaar in, of vink aan dat het onbekend is.',
    condition: 'Kies de staat van de woning.',
    walls: 'Geef aan waarvan de muren zijn gebouwd.',
    heating: 'Geef aan hoe de woning wordt verwarmd. Geen verwarming? Kies dan „Geen verwarming”.',
    rooms: 'Vul het aantal kamers in.',
    floors: 'Vul het aantal woonlagen in.',
    bathrooms: 'Vul het aantal badkamers in. Geen? Vul 0 in.',
    kitchens: 'Vul het aantal keukens in. Geen? Vul 0 in.',
    toilets: 'Vul het aantal aparte toiletten in. Geen? Vul 0 in.',
    parking: 'Geef aan waar u kunt parkeren.',
  },
  en: {
    street: 'Enter the address of the property.',
    settings: 'Tick the surroundings of the property.',
    floor_m2: 'Enter the net usable area.',
    building_m2: 'Enter the total building area.',
    plot_m2: 'Enter the plot area.',
    year_built: 'Enter the year built, or tick that it is not known.',
    condition: 'Choose the condition of the property.',
    walls: 'Tick what the walls are built of.',
    heating: 'Tick how the property is heated. If there is none, tick “No heating”.',
    rooms: 'Enter the number of rooms.',
    floors: 'Enter the number of levels.',
    bathrooms: 'Enter the number of bathrooms. None? Enter 0.',
    kitchens: 'Enter the number of kitchens. None? Enter 0.',
    toilets: 'Enter the number of separate toilets. None? Enter 0.',
    parking: 'Tick where you can park.',
  },
};
export const gapError = (gap: string, lang: string): string =>
  GAP_ERRORS[lang === 'nl' || lang === 'en' ? lang : 'hu'][gap as DetailGap] ?? GAP_ERRORS.hu[gap as DetailGap] ?? '';
/** The form control a gap belongs to (most share the gap's name). */
export const gapControl = (gap: string): string => (gap === 'condition' ? 'condition_key' : gap);
export const gapLabel = (gap: string, lang: string) => GAP_LABELS[lang === 'nl' || lang === 'en' ? lang : 'hu'][gap as DetailGap] ?? gap;

export type GapInput = {
  floor_m2?: number | null;
  building_m2?: number | null;
  plot_m2?: number | null;
  year_built?: number | null;
  year_built_unknown?: boolean | null;
  bathrooms?: number | null;
  condition_key?: string | null;
  wall_key?: string | null;
  heating_key?: string | null;
  details?: unknown;
};

/**
 * What still has to be filled in before a listing can be submitted, from `fieldRules()`.
 * Counts may be 0 (a studio has no separate kitchen); only an empty box is a gap. The year
 * built is answered by a year or by ticking "not known"; "Nem ismert" is a wall, heating and
 * condition answer too, and "Nincs fűtés" answers the heating.
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
    condition: Boolean(p.condition_key?.trim()),
    walls: d.walls.length > 0,
    heating: d.heating.length > 0,
    rooms: d.rooms !== undefined,
    floors: d.floors !== undefined,
    bathrooms: p.bathrooms != null,
    kitchens: d.kitchens !== undefined,
    toilets: d.toilets !== undefined,
    parking: d.parking.length > 0,
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
    heating: form.getAll('heating').map(String),
    parking: form.getAll('parking').map(String),
    ...Object.fromEntries(COUNT_FIELDS.map((k) => [k, num(k) ?? undefined])),
  };
  return detailGaps({
    floor_m2: num('floor_m2') ? 2 : null, building_m2: num('building_m2') ? 2 : null, plot_m2: num('plot_m2') ? 2 : null,
    year_built: num('year_built'), year_built_unknown: form.get('year_built_unknown') === 'yes',
    bathrooms: num('bathrooms'), condition_key: text('condition_key'), details,
  }, group, subtype, text('street'));
}
