import { parseLocaleNumber, type FieldError } from '~/lib/validation';
import { COUNTRIES } from '~/config/countries';
import { validSubtype, canonicalFeature, CONTACT_LANGUAGES, hasLivingArea, isLandOnly, hasPlot, groupOf, PROPERTY_GROUPS } from '~/lib/listing-catalogue';
import { convertPrice, exchangeRates, PRICE_CURRENCIES } from '~/lib/exchange-rates';
import { readDetails, SETTING_KEYS, UTILITY_KEYS, PARKING_KEYS, COUNT_FIELDS, hasLayout, hasUtilities, hasParking, hasCellar, hasExtraBuildings, type ListingDetails } from '~/lib/listing-details';
import { extractYouTubeId } from '~/lib/video';
import type { Taxonomy } from '~/lib/runtime-config';
import type { PortalProperty } from '~/lib/portal/properties';
export const formString=(form:FormData,key:string)=>String(form.get(key)??'').trim();
export class ListingInputError extends Error {
  constructor(public errors:Record<string,FieldError>, message='invalid'){super(message);}
}
/** Coordinates are decimal degrees, never grouped currency numbers. */
export function parseCoordinate(raw:string,limit:number):number|null {
  const value=raw.trim().replace(/\s/g,'').replace(',','.');
  if(!/^-?\d+(?:\.\d+)?$/.test(value))return null;
  const n=Number(value);return Number.isFinite(n)&&Math.abs(n)<=limit?n:null;
}
export function parseArea(raw:string,unit:string):number|null {
  if(!raw.trim())return null;
  if(unit!=='m2'&&unit!=='ha')throw new Error('invalid-unit');
  // A decimal comma is unambiguous, including hectare fractions smaller than .01.
  const decimal=unit==='ha'&&/^\d+[.,]\d+$/.test(raw.trim()) || /^\d+,\d+$/.test(raw.trim()) || /^\d+\.\d{4,}$/.test(raw.trim());
  const n=decimal?Number(raw.trim().replace(',','.')):parseLocaleNumber(raw);
  if(n===null||!Number.isFinite(n)||n<=0)throw new Error('invalid-area');
  const result=n*(unit==='ha'?10000:1);
  if(!Number.isFinite(result)||result>1e12)throw new Error('invalid-area');
  return Math.round(result*1e6)/1e6;
}
export async function listingInput(form:FormData,current:PortalProperty,taxonomy:Taxonomy,options:{allowIncomplete?:boolean}={}){
  const get=(key:string)=>formString(form,key);
  const errors:Record<string,FieldError>={};
  const group=get('property_group'),subtype=get('property_subtype');
  if(!PROPERTY_GROUPS.some(g=>g.key===group))errors.property_group={code:'required'};
  if(!validSubtype(group,subtype)&&!(options.allowIncomplete&&!subtype))errors.property_subtype={code:'required'};
  const country=get('country');if(!(country in COUNTRIES))errors.country={code:'required'};
  const lat=parseCoordinate(get('lat'),90),lng=parseCoordinate(get('lng'),180);
  if(lat===null&&(!options.allowIncomplete||get('lat')))errors.lat={code:'number'};
  if(lng===null&&(!options.allowIncomplete||get('lng')))errors.lng={code:'number'};
  const settlement=get('settlement').slice(0,120);
  if(!options.allowIncomplete&&form.get('location_confirmed')!=='yes')errors.lat={code:'required'};
  // A pin alone identifies rural land. Settlement and administrative areas are optional.
  const areas:Record<string,number|null>={};
  for(const name of ['floor_m2','building_m2','plot_m2']){
    const relevant=name==='floor_m2'?hasLivingArea(group,subtype):name==='plot_m2'?hasPlot(group,subtype):!isLandOnly(group,subtype);
    if(!relevant){areas[name]=current[name as 'floor_m2']??null;continue;}
    try{areas[name]=parseArea(get(name),get(`${name}_unit`)||'m2');}catch{errors[name]={code:'number'};}
  }
  const integer=(key:string,min:number,max:number)=>{
    if(!get(key))return null;const n=Number(get(key));
    if(!Number.isSafeInteger(n))errors[key]={code:'number'};
    else if(n<min)errors[key]={code:'min',limit:min};else if(n>max)errors[key]={code:'max',limit:max};return n;
  };
  const building=!isLandOnly(group,subtype),living=hasLivingArea(group,subtype);
  const yearUnknown=building?form.get('year_built_unknown')==='yes':Boolean(current.year_built_unknown);
  const year=building?(yearUnknown?null:integer('year_built',1,new Date().getFullYear()+5)):current.year_built;
  const renovated=building?integer('renovated_in',1,new Date().getFullYear()+5):current.renovated_in;
  const bedrooms=living?integer('bedrooms',0,10000):current.bedrooms,bathrooms=living?integer('bathrooms',0,10000):current.bathrooms;
  // The facts the old upload form asked for. Each kind of property only touches what applies to it;
  // anything that does not apply keeps what is already saved, so switching type never wipes data.
  // A form without the marker (an older client, a partial form) leaves every one of them as saved.
  const details:ListingDetails=readDetails(current.details);
  if(form.get('details_present')==='yes'){
    if(hasLayout(group,subtype))for(const key of COUNT_FIELDS){const n=integer(key,0,1000);if(n===null)delete details[key];else details[key]=n;}
    if(hasCellar(group,subtype)){
      try{const m2=parseArea(get('cellar_m2'),'m2');if(m2===null)delete details.cellar_m2;else details.cellar_m2=m2;}catch{errors.cellar_m2={code:'number'};}
    }
    const setting=get('setting');
    if(setting&&!SETTING_KEYS.includes(setting))errors.setting={code:'required'};else if(setting)details.setting=setting;else delete details.setting;
    const choose=(name:string,allowed:string[])=>[...new Set(form.getAll(name).map(String).filter(k=>allowed.includes(k)))];
    if(hasUtilities(group))details.utilities=choose('utilities',UTILITY_KEYS);
    if(hasParking(group,subtype))details.parking=choose('parking',PARKING_KEYS);
    if(hasExtraBuildings(group,subtype)){const note=get('extra_buildings').slice(0,500);if(note)details.extra_buildings=note;else delete details.extra_buildings;}
  }
  // The street address is private. Ticking "show the address" copies it to the public row, and a public
  // address must be pinned exactly, or the page would print one place and map another.
  // A form that carries no address fields at all leaves the saved address exactly as it is.
  const addressInForm=form.has('street');
  const street=addressInForm?get('street').slice(0,200):current.street??'',postalCode=addressInForm?get('postal_code').slice(0,20):current.postal_code??'';
  const showAddress=addressInForm?form.get('address_public')==='yes'&&Boolean(street):Boolean(current.public_address);
  const pick=(group:'condition'|'heating'|'wall',key:string)=>{
    const v=get(key);if(!v)return null;
    if(!taxonomy[group].some(t=>t.key===v&&(t.enabled||current[key as 'condition_key']===v)))errors[key]={code:'required'};
    return v;
  };
  const condition=building?pick('condition','condition_key'):current.condition_key,heating=building?pick('heating','heating_key'):current.heating_key,wall=building?pick('wall','wall_key'):current.wall_key;
  const amount=parseLocaleNumber(get('original_price')),currency=get('original_currency');
  if((!amount||amount<=0)&&!(options.allowIncomplete&&!get('original_price')))errors.original_price={code:'min',limit:0.01};
  if(!(PRICE_CURRENCIES as readonly string[]).includes(currency))errors.original_currency={code:'required'};
  const video=get('video_url');if(video&&!extractYouTubeId(video))errors.video_url={code:'url'};
  const features=[...new Set(form.getAll('features').map(String).map(canonicalFeature))];
  if(features.some(k=>!taxonomy.feature.some(t=>t.key===k&&(t.enabled||current.features.map(canonicalFeature).includes(k)))))errors.features={code:'required'};
  if(Object.keys(errors).length)throw new ListingInputError(errors);
  let price:Record<string,unknown>={};
  // Do not change a saved price/rate/date merely because somebody edited the description.
  if(amount&&(Number(current.original_price)!==amount||current.original_currency!==currency||!current.exchange_rate)){
    try{
      const snapshot=await exchangeRates(),converted=convertPrice(amount!,currency,snapshot);
      price={original_price:amount,original_currency:currency,price_eur:converted.eur,price_huf:converted.huf,exchange_rate:converted.rate,exchange_source:snapshot.source,price_asof:snapshot.date,price_calculated_at:new Date().toISOString()};
    }catch{throw new ListingInputError({original_price:{code:'number'}},'rates-unavailable');}
  }
  // Preserve the category/URL of a listing while it stays in the same main group.
  const category=groupOf(current.category)===group?current.category:(subtype==='apartment'?'apartment':subtype==='farm'?'farm':group);
  return {
    patch:{location_confirmed:form.get('location_confirmed')==='yes'&&lat!==null&&lng!==null,category,property_group:group,property_subtype:subtype||null,country,settlement,county:get('county').slice(0,120),region:get('region').slice(0,120),precision:showAddress||get('precision')==='exact'?'exact':'approximate',details,public_address:showAddress?street:null,public_postal_code:showAddress&&postalCode?postalCode:null,...price,...areas,
      year_built:year,year_built_unknown:yearUnknown,renovated_in:renovated,condition_key:condition,heating_key:heating,wall_key:wall,epc_class:['unknown','not-applicable'].includes(get('epc_status'))?get('epc_status'):get('epc_class').slice(0,40)||'unknown',bedrooms,bathrooms,features,video_url:video||null,price_negotiable:form.get('price_negotiable')==='yes'},
    privateData:{lat:lat!==null&&lng!==null?lat:current.lat,lng:lat!==null&&lng!==null?lng:current.lng,street,postal_code:postalCode},
  };
}
export function contactLanguages(form:FormData):string[]{return [...new Set(form.getAll('seller_speaks').map(String).filter(c=>CONTACT_LANGUAGES.includes(c)))];}
