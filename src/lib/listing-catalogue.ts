import groups from '../data/listing/groups.json';
import featureDefinitions from '../data/listing/features.json';
import optionDefinitions from '../data/listing/options.json';

export const PROPERTY_GROUPS = groups;
export const FEATURE_DEFINITIONS = featureDefinitions;
export const DETAIL_OPTIONS = optionDefinitions;
export type GroupKey = string;
export type Labels = Partial<Record<string, string>>;
export const labelIn = (labels: Labels, locale: string) => labels[locale] || labels.en || labels.hu || '';
export const groupOf = (category: string) => category === 'apartment' ? 'house' : category === 'farm' ? 'agricultural' : category;
/**
 * The category (and so the public URL) a listing is filed under. It follows the subtype: an
 * apartment is not a house just because both belong to the house group. A live or sold listing
 * keeps the category its address was published under, as long as it stays in the same group.
 */
export const categoryFor = (current: { category: string; status?: string }, group: string, subtype: string) =>
  ['published', 'sold'].includes(current.status ?? '') && groupOf(current.category) === group
    ? current.category
    : subtype === 'apartment' ? 'apartment' : subtype === 'farm' ? 'farm' : group;
export const subtypeOf = (category: string, subtype?: string | null) => subtype || ({ house: 'house-villa', apartment: 'apartment', farm: 'farm', holiday: 'holiday-house', land: 'residential-plot', commercial: 'commercial-other', industrial: 'industrial-other', agricultural: 'agricultural-other', mansion: 'castle-manor' }[category] ?? '');
export const validSubtype = (group: string, subtype: string) => groups.some(g => g.key === group && g.subtypes.some(s => s.key === subtype));
export const subtypeLabel = (group: string, subtype: string, locale: string) => {
  const s = groups.find(g => g.key === group)?.subtypes.find(s => s.key === subtype);
  return s ? labelIn(s.labels, locale) : '';
};
export const isLandOnly = (group: string, subtype: string) => group === 'land' || (group === 'agricultural' && ['arable', 'forest-pasture', 'orchard-vineyard', 'fish-farm'].includes(subtype));
export const hasLivingArea = (group: string, subtype: string) => ['house', 'holiday', 'mansion'].includes(group) || (group === 'agricultural' && subtype === 'farm') || (group === 'investment' && ['rented-home', 'investment-building'].includes(subtype));
export const hasPlot = (_group: string, subtype: string) => !['apartment', 'penthouse', 'holiday-apartment', 'retail', 'office', 'garage-parking', 'storage-cellar'].includes(subtype);
export const CONTACT_LANGUAGES = 'hu nl en de fr sq hy az eu be bs bg ca hr cs da et fi ka el is ga it lv lt lb mk mt cnr no pl pt ro rm ru sr sk sl es sv tr uk cy yi'.split(' ');
export function languageName(code: string, locale: string): string {
  if(code==='cnr')return ({hu:'montenegrói',nl:'Montenegrijns',en:'Montenegrin',de:'Montenegrinisch',fr:'monténégrin',es:'montenegrino',pl:'czarnogórski',ro:'muntenegreană',sk:'čiernohorčina', it: 'montenegrino', pt: 'montenegrino', el: 'μαυροβουνιακά', cs: 'černohorština', sl: 'črnogorščina', sv: 'montenegrinska', da: 'montenegrinsk', no: 'montenegrinsk', fi: 'montenegro', et: 'montenegro', lv: 'melnkalniešu', lt: 'juodkalniečių', sr: 'crnogorski', uk: 'чорногорська', tr: 'Karadağca', he: 'מונטנגרית', ar: 'الجبل الأسودية', ru: 'черногорский', zh: 'Montenegrin'} as Record<string,string>)[locale]||'Montenegrin';
  try { return new Intl.DisplayNames([locale], { type: 'language' }).of(code) || code; } catch { return code; }
}

export const FEATURE_ALIASES: Record<string, string> = { balcony: 'terrace', vineyard: 'orchard', 'storage-building': 'storage', 'barn-hall': 'warehouse-space', 'original-beams': 'historic-elements' };
export const canonicalFeature = (key: string) => FEATURE_ALIASES[key] || key;

/**
 * Features that became something else (migration 0041). Parking is answered once, in the
 * "Parkolási lehetőség" multi-select (`details.parking`), not twice; an industrial site's
 * storage is "Raktárterület", a shop's is "Raktárhelyiség"; a manor's garden is a
 * "Díszkert vagy park". Applied on every save and when a listing is shown, so a listing
 * that still carries an old key reads correctly before and after the migration runs.
 *
 * "Garázs vagy parkoló" (`parking`) used to become "Saját parkolóban", which was retired in
 * November 2026; it says nothing about where, so it now becomes no parking answer at all and the
 * owner is asked again. A carport is "Fedett kocsibeállóban (kertben)" since then.
 */
export const PARKING_FROM_FEATURE: Record<string, string | null> = { parking: null, garage: 'garage', carport: 'carport', 'enclosed-parking': 'enclosed' };
const GROUP_RENAMES: { from: string; to: string; groups: string[] }[] = [
  { from: 'warehouse-space', to: 'storage-area', groups: ['industrial'] },
  { from: 'park', to: 'ornamental-park', groups: ['mansion'] },
];
export const RETIRED_FEATURES: string[] = Object.keys(PARKING_FROM_FEATURE);
/** The listing's features in today's vocabulary, plus the parking choices the retired ones stood for. */
export function currentFeatures(features: string[], group: string): { features: string[]; parking: string[] } {
  const parking: string[] = [];
  const out: string[] = [];
  for (const raw of features) {
    if (Object.hasOwn(PARKING_FROM_FEATURE, raw)) { const to = PARKING_FROM_FEATURE[raw]; if (to) parking.push(to); continue; }
    const key = canonicalFeature(raw);
    out.push(GROUP_RENAMES.find((r) => r.from === key && r.groups.includes(group))?.to ?? key);
  }
  return { features: [...new Set(out)], parking: [...new Set(parking)] };
}

export { readEnergy, type EnergyAnswer } from './energy.ts';
