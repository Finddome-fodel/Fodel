import type { Locale } from '~/i18n/ui';
import geography from '../data/listing/regions.json';

export type Country = { labels: Record<Locale, string>; bounds: [number, number, number, number] };
/** Europe, including non-EU and transcontinental countries. Administrative data: GeoNames, CC BY 4.0. */
export const EUROPEAN_COUNTRY_CODES = Object.keys(geography.countries);
export const COUNTRIES: Record<string, Country> = Object.fromEntries(EUROPEAN_COUNTRY_CODES.map(code => [code, {
  labels: Object.fromEntries(['hu','nl','en','de','fr','es','pl','ro','sk','it','pt','el','cs','sl','sv','da','no','fi','et','lv','lt'].map(locale => [locale, new Intl.DisplayNames([locale], {type:'region'}).of(code) || code])) as Record<Locale,string>,
  // Geographic bounding rectangles are not national borders (islands and overseas territories are valid).
  bounds: [-180,-90,180,90] as [number,number,number,number],
}]));
export const countryLabel = (code: string, locale: Locale) => COUNTRIES[code]?.labels[locale] ?? code;
export const boundsFor = (code: string) => COUNTRIES[code]?.bounds;
export const regionsFor = (code: string) => (geography.countries as Record<string, {id:string;name:string}[]>)[code] ?? [];
export const regionLabel = (code: string, locale: string): string => {
  const types: Record<string, [string,string,string]> = { HU:['Megye / Budapest','Provincie / Boedapest','County / Budapest'],CH:['Kanton','Kanton','Canton'], AT:['Tartomány','Deelstaat','Federal state'], DE:['Tartomány','Deelstaat','Federal state'], GB:['Országrész','Landsdeel','Constituent country'], FR:['Régió','Regio','Region'], IT:['Régió','Regio','Region'], ES:['Autonóm közösség','Autonome regio','Autonomous community'] };
  const values = types[code] || ['Közigazgatási terület','Bestuurlijke regio','Administrative area'];
  return values[locale === 'hu' ? 0 : locale === 'nl' ? 1 : 2];
};
