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
  if(code==='cnr')return ({hu:'montenegrói',nl:'Montenegrijns',en:'Montenegrin',de:'Montenegrinisch',fr:'monténégrin',es:'montenegrino',pl:'czarnogórski',ro:'muntenegreană',sk:'čiernohorčina', it: 'montenegrino', pt: 'montenegrino', el: 'μαυροβουνιακά', cs: 'černohorština', sl: 'črnogorščina', sv: 'montenegrinska', da: 'montenegrinsk', no: 'montenegrinsk', fi: 'montenegro', et: 'montenegro', lv: 'melnkalniešu', lt: 'juodkalniečių'} as Record<string,string>)[locale]||'Montenegrin';
  try { return new Intl.DisplayNames([locale], { type: 'language' }).of(code) || code; } catch { return code; }
}

export const FEATURE_ALIASES: Record<string, string> = { balcony: 'terrace', garage: 'parking', carport: 'parking', vineyard: 'orchard', 'storage-building': 'storage', 'barn-hall': 'warehouse-space', 'original-beams': 'historic-elements' };
export const canonicalFeature = (key: string) => FEATURE_ALIASES[key] || key;

/** The country is the authority: these are suggestions, never a forced Hungarian scale. */
export function energyOptions(country: string): string[] {
  const common = ['unknown', 'not-applicable'];
  if (country === 'HU') return ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', ...common];
  if (country === 'NL') return ['A+++++', 'A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', ...common];
  if (country === 'IT') return ['A4', 'A3', 'A2', 'A1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', ...common];
  if (['AT','PT'].includes(country)) return ['A++', 'A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G', ...common];
  if (country === 'IE') return ['A1','A2','A3','B1','B2','B3','C1','C2','C3','D1','D2','E1','E2','F','G',...common];
  if (['FR','ES','GB','CH','DK','SE','FI'].includes(country)) return ['A','B','C','D','E','F','G',...common];
  if(country==='DE')return ['A+','A','B','C','D','E','F','G','H',...common];
  if(country==='HR')return ['A+','A','B','C','D','E','F','G',...common];
  return common;
}
