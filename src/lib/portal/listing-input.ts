import { parseLocaleNumber, type FieldError } from '~/lib/validation';
import { COUNTRIES } from '~/config/countries';
import { validSubtype, canonicalFeature, currentFeatures, CONTACT_LANGUAGES, categoryFor, PROPERTY_GROUPS, readEnergy, energyScale } from '~/lib/listing-catalogue';
import { convertPrice, exchangeRates, PRICE_CURRENCIES } from '~/lib/exchange-rates';
import { readDetails, fieldRules, parkingFits, exclusiveChoice, HEATING_EXCLUSIVE, WALL_EXCLUSIVE, SETTING_KEYS, UTILITY_KEYS, PARKING_KEYS, COUNT_FIELDS, type ListingDetails } from '~/lib/listing-details';
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
  // Which facts this kind of property has (src/lib/listing-details.ts). A fact that does not apply keeps
  // what is already saved, so switching the type back and forth never wipes anything.
  const rules=fieldRules(group,subtype);
  const shown=(k:keyof typeof rules)=>rules[k]!=='hidden';
  const areas:Record<string,number|null>={};
  for(const name of ['floor_m2','building_m2','plot_m2'] as const){
    if(!shown(name)){areas[name]=current[name]??null;continue;}
    try{areas[name]=parseArea(get(name),get(`${name}_unit`)||'m2');}catch{errors[name]={code:'number'};}
  }
  const integer=(key:string,min:number,max:number)=>{
    if(!get(key))return null;const n=Number(get(key));
    if(!Number.isSafeInteger(n))errors[key]={code:'number'};
    else if(n<min)errors[key]={code:'min',limit:min};else if(n>max)errors[key]={code:'max',limit:max};return n;
  };
  const building=shown('year_built');
  const yearUnknown=building?form.get('year_built_unknown')==='yes':Boolean(current.year_built_unknown);
  const year=building?(yearUnknown?null:integer('year_built',1,new Date().getFullYear()+5)):current.year_built;
  const renovated=building?integer('renovated_in',1,new Date().getFullYear()+5):current.renovated_in;
  // A building cannot have been renovated before it was built.
  if(year!==null&&renovated!==null&&!errors.year_built&&!errors.renovated_in&&renovated<year)errors.renovated_in={code:'min',limit:year};
  // Bathrooms keep their column. Bedrooms are no longer asked (the client's 2026 brief): the column is left as it is.
  const bathrooms=shown('bathrooms')?integer('bathrooms',0,10000):current.bathrooms;
  const details:ListingDetails=readDetails(current.details,current);
  // Parking that used to be ticked as a feature ("Garázs vagy parkoló", "Zárt parkoló") now lives in the parking list.
  const folded=currentFeatures(form.getAll('features').map(String),group);
  // A form without the marker (an older client, a partial form) leaves every detail as saved.
  const detailsInForm=form.get('details_present')==='yes';
  const term=(g:'heating'|'wall',key:string)=>taxonomy[g].some(t=>t.key===key&&(t.enabled||(g==='heating'?details.heating:details.walls).includes(key)));
  if(detailsInForm){
    if(shown('rooms'))for(const key of COUNT_FIELDS){const n=integer(key,0,1000);if(n===null)delete details[key];else details[key]=n;}
    if(shown('cellar_m2')){
      try{const m2=parseArea(get('cellar_m2'),'m2');if(m2===null)delete details.cellar_m2;else details.cellar_m2=m2;}catch{errors.cellar_m2={code:'number'};}
    }
    const choose=(name:string,allowed:string[])=>[...new Set(form.getAll(name).map(String).filter(k=>allowed.includes(k)))];
    const settings=form.getAll('settings').map(String);
    if(settings.some(k=>!SETTING_KEYS.includes(k)))errors.settings={code:'required'};else details.settings=choose('settings',SETTING_KEYS);
    if(shown('heating')){
      const keys=form.getAll('heating').map(String);
      if(keys.some(k=>!term('heating',k)))errors.heating={code:'required'};else details.heating=exclusiveChoice(keys,HEATING_EXCLUSIVE);
    }
    if(shown('walls')){
      const keys=form.getAll('walls').map(String);
      if(keys.some(k=>!term('wall',k)))errors.walls={code:'required'};else details.walls=exclusiveChoice(keys,WALL_EXCLUSIVE);
    }
    if(shown('utilities'))details.utilities=choose('utilities',UTILITY_KEYS);
    // A choice that does not fit the type is dropped, unless it was already saved (the form keeps showing it, ticked, so it can be unticked).
    if(shown('parking'))details.parking=[...new Set([...choose('parking',PARKING_KEYS).filter(k=>parkingFits(k,group,subtype)||details.parking.includes(k)),...folded.parking])];
    if(shown('extra_buildings')){const note=get('extra_buildings').slice(0,500);if(note)details.extra_buildings=note;else delete details.extra_buildings;}
  } else if(folded.parking.length)details.parking=[...new Set([...details.parking,...folded.parking])];
  // The columns older readers use (search, exports) carry the first answer.
  const heatingKey=details.heating[0]??null,wallKey=details.walls[0]??null;
  // Energy: "is there a certificate?" first; the class is optional and follows the country's scale.
  const energyInForm=form.get('energy_present')==='yes';
  let epc=current.epc_class||'unknown';
  if(building&&energyInForm){
    const has=get('epc_has'),rating=get('epc_class').slice(0,40);
    const scale=energyScale(country);
    if(has==='no')epc='none';
    else if(has==='yes'){
      // A class outside the country's scale is accepted only if it is the one already saved (a hand-typed older value).
      if(rating&&scale&&!scale.includes(rating)&&rating!==readEnergy(current.epc_class).rating)errors.epc_class={code:'required'};
      epc=rating||'certified';
    } else epc='unknown';
  }
  // The street address is private. Ticking "show the address" copies it to the public row, and a public
  // address must be pinned exactly, or the page would print one place and map another.
  // A form that carries no address fields at all leaves the saved address exactly as it is.
  const addressInForm=form.has('street');
  const street=addressInForm?get('street').slice(0,200):current.street??'',postalCode=addressInForm?get('postal_code').slice(0,20):current.postal_code??'';
  const showAddress=addressInForm?form.get('address_public')==='yes'&&Boolean(street):Boolean(current.public_address);
  const pick=(group:'condition',key:string)=>{
    const v=get(key);if(!v)return null;
    if(!taxonomy[group].some(t=>t.key===v&&(t.enabled||current[key as 'condition_key']===v)))errors[key]={code:'required'};
    return v;
  };
  const condition=building?pick('condition','condition_key'):current.condition_key;
  const amount=parseLocaleNumber(get('original_price')),currency=get('original_currency');
  if((!amount||amount<=0)&&!(options.allowIncomplete&&!get('original_price')))errors.original_price={code:'min',limit:0.01};
  if(!(PRICE_CURRENCIES as readonly string[]).includes(currency))errors.original_currency={code:'required'};
  const video=get('video_url');if(video&&!extractYouTubeId(video))errors.video_url={code:'url'};
  const features=folded.features;
  const saved=currentFeatures(current.features,group).features;
  if(features.some(k=>!taxonomy.feature.some(t=>t.key===k&&(t.enabled||saved.includes(k)||current.features.map(canonicalFeature).includes(k)))))errors.features={code:'required'};
  if(Object.keys(errors).length)throw new ListingInputError(errors);
  let price:Record<string,unknown>={};
  // Do not change a saved price/rate/date merely because somebody edited the description.
  if(amount&&(Number(current.original_price)!==amount||current.original_currency!==currency||!current.exchange_rate)){
    try{
      const snapshot=await exchangeRates(),converted=convertPrice(amount!,currency,snapshot);
      price={original_price:amount,original_currency:currency,price_eur:converted.eur,price_huf:converted.huf,exchange_rate:converted.rate,exchange_source:snapshot.source,price_asof:snapshot.date,price_calculated_at:new Date().toISOString()};
    }catch{throw new ListingInputError({original_price:{code:'number'}},'rates-unavailable');}
  }
  // The category follows the subtype; only a live or sold listing keeps its published URL.
  const category=categoryFor(current,group,subtype);
  return {
    patch:{location_confirmed:form.get('location_confirmed')==='yes'&&lat!==null&&lng!==null,category,property_group:group,property_subtype:subtype||null,country,settlement,county:get('county').slice(0,120),region:get('region').slice(0,120),precision:showAddress||get('precision')==='exact'?'exact':'approximate',details,public_address:showAddress?street:null,public_postal_code:showAddress&&postalCode?postalCode:null,...price,...areas,
      year_built:year,year_built_unknown:yearUnknown,renovated_in:renovated,condition_key:condition,heating_key:heatingKey,wall_key:wallKey,epc_class:epc,bathrooms,features,video_url:video||null,price_negotiable:form.get('price_negotiable')==='yes'},
    privateData:{lat:lat!==null&&lng!==null?lat:current.lat,lng:lat!==null&&lng!==null?lng:current.lng,street,postal_code:postalCode},
  };
}
export function contactLanguages(form:FormData):string[]{return [...new Set(form.getAll('seller_speaks').map(String).filter(c=>CONTACT_LANGUAGES.includes(c)))];}
