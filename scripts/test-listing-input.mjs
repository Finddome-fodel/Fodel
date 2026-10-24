/** Tests the actual server input module through Vite's existing TS/alias loader. No network or database. */
import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({configFile:false,cacheDir:`/private/tmp/fodel-listing-unit-${process.pid}`,resolve:{alias:{'~':new URL('../src',import.meta.url).pathname}},server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
let passed=0;
const test=async(name,fn)=>{await fn();passed++;console.log(`✓ ${name}`);};
try{
 const {parseCoordinate,parseArea,listingInput}=await server.ssrLoadModule('/src/lib/portal/listing-input.ts');
 const {PROPERTY_GROUPS,validSubtype,hasLivingArea,isLandOnly}=await server.ssrLoadModule('/src/lib/listing-catalogue.ts');
 const {resolveText}=await server.ssrLoadModule('/src/lib/properties.ts');
 const {parseEcbRates,convertPrice}=await server.ssrLoadModule('/src/lib/exchange-rates.ts');
 const {getTaxonomy}=await server.ssrLoadModule('/src/lib/runtime-config.ts');
 const {COUNTRIES,regionsFor}=await server.ssrLoadModule('/src/config/countries.ts');
 await test('a foreign-language original retains its true source language',()=>{assert.deepEqual(resolveText({hu:'',nl:'Originele beschrijving'},'hu'),{text:'Originele beschrijving',from:'nl'});});
 await test('exactly nine groups; subtype keys unique and grouped',()=>{
  assert.equal(PROPERTY_GROUPS.length,9);const keys=PROPERTY_GROUPS.flatMap(g=>g.subtypes.map(s=>s.key));assert.equal(new Set(keys).size,keys.length);
  assert(validSubtype('house','apartment'));assert(!validSubtype('land','apartment'));assert(isLandOnly('agricultural','arable'));assert(!hasLivingArea('industrial','warehouse'));
 });
 await test('European coverage includes non-EU countries; Hungary has all 19 counties and Budapest',()=>{for(const c of ['HU','GB','CH','NO','IS','RS','UA','AL','XK','VA','TR','GE'])assert(COUNTRIES[c]);assert.equal(regionsFor('HU').length,20);assert(regionsFor('HU').some(r=>r.name==='Budapest'));assert.equal(regionsFor('CH').length,26);});
 await test('decimal coordinates, negative longitude, bounds and invalid input',()=>{assert.equal(parseCoordinate('47.123',90),47.123);assert.equal(parseCoordinate('-3,125678',180),-3.125678);assert.equal(parseCoordinate('',90),null);assert.equal(parseCoordinate('91',90),null);assert.equal(parseCoordinate('Infinity',90),null);});
 await test('hectares retain fractions and convert once to square metres',()=>{assert.equal(parseArea('1.234','ha'),12340);assert.equal(parseArea('0,0001','ha'),1);assert.equal(parseArea('42 500','m2'),42500);assert.equal(parseArea('','m2'),null);assert.throws(()=>parseArea('-1','ha'));assert.throws(()=>parseArea('2','acres'));});
 const xml=`<Cube time='2026-10-23'><Cube currency='HUF' rate='400'/><Cube currency='GBP' rate='0.8'/><Cube currency='CHF' rate='0.95'/></Cube>`;
 const snapshot=parseEcbRates(xml,new Date('2026-10-24T12:00:00Z'));
 await test('ECB conversion uses currency per euro, preserving audit source/date',()=>{assert.equal(convertPrice(80000,'GBP',snapshot).eur,100000);assert.equal(convertPrice(40000000,'HUF',snapshot).eur,100000);assert.equal(convertPrice(100000,'EUR',snapshot).eur,100000);assert.equal(snapshot.date,'2026-10-23');assert.equal(snapshot.source,'ECB');assert.throws(()=>convertPrice(-1,'EUR',snapshot));assert.throws(()=>parseEcbRates(xml,new Date('2026-11-20T12:00:00Z')));});
 // The cached fallback is populated without consulting any live project.
 const logError=console.error;console.error=()=>{};let taxonomy;try{taxonomy=await getTaxonomy();}finally{console.error=logError;}
 const current={id:'10000000-0000-4000-8000-000000000001',category:'apartment',property_group:'house',property_subtype:'apartment',original_price:40000000,original_currency:'HUF',price_eur:100000,price_huf:40000000,exchange_rate:400,floor_m2:80,building_m2:90,plot_m2:null,year_built:1980,renovated_in:null,bedrooms:2,bathrooms:1,condition_key:'good',heating_key:'gas',wall_key:'tegla',features:['terrace']};
 const form=()=>{const f=new FormData();for(const[k,v]of Object.entries({property_group:'house',property_subtype:'apartment',country:'HU',lat:'47.123',lng:'19.123456',location_confirmed:'yes',original_price:'40 000 000',original_currency:'HUF',floor_m2:'80',floor_m2_unit:'m2',building_m2:'90',building_m2_unit:'m2',epc_status:'unknown',condition_key:'good',heating_key:'gas',wall_key:'tegla'}))f.set(k,v);return f;};
 const originalFetch=globalThis.fetch;globalThis.fetch=()=>{throw new Error('No network permitted in this test');};
 try{
  await test('unchanged asking price saves without fetching a new exchange rate',async()=>{const result=await listingInput(form(),current,taxonomy);assert(!('price_eur'in result.patch));assert.equal(result.patch.category,'apartment');assert.equal(result.privateData.lat,47.123);assert.equal(result.patch.plot_m2,null);});
  await test('land does not require or validate hidden residential fields',async()=>{const f=form();f.set('property_group','land');f.set('property_subtype','residential-plot');f.set('bedrooms','bad value');f.set('year_built','bad value');f.set('plot_m2','1.234');f.set('plot_m2_unit','ha');const result=await listingInput(f,current,taxonomy);assert.equal(result.patch.plot_m2,12340);assert.equal(result.patch.bedrooms,2);assert.equal(result.patch.category,'land');});
  await test('partial autosave preserves a draft before price and coordinates are complete',async()=>{const f=form();f.set('original_price','');f.set('lat','');f.set('lng','');f.set('location_confirmed','');f.set('property_subtype','');const result=await listingInput(f,current,taxonomy,{allowIncomplete:true});assert.equal(result.patch.location_confirmed,false);assert(!('price_eur' in result.patch));assert.equal(result.patch.property_subtype,null);});
  await test('invalid subtype and unconfirmed location are rejected before saving',async()=>{const f=form();f.set('property_subtype','warehouse');await assert.rejects(()=>listingInput(f,current,taxonomy));f.set('property_subtype','apartment');f.set('location_confirmed','');await assert.rejects(()=>listingInput(f,current,taxonomy));});
 }finally{globalThis.fetch=originalFetch;}
 console.log(`\n${passed} listing input checks passed.`);
}finally{await server.close();}
