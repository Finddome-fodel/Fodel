/** Local-only fixture for editor QA. In-memory data; no network calls or real credentials. */
import http from 'node:http';
const port=Number(process.argv[2]||54401);
export const OWNER='00000000-0000-4000-8000-000000000001';
export const ADMIN='00000000-0000-4000-8000-000000000002';
export const ID='10000000-0000-4000-8000-000000000001';
const now=new Date().toISOString();
const media=['tanya.jpg','kuria.jpg','vineyard.png'].map((storage_path,i)=>({id:`20000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,property_id:ID,storage_path,alt:{hu:['A birtok épülete','A kert','A környék'][i]},label:null,sort_order:i,is_hero:i===0,width:1600,height:1000}));
const property={id:ID,ref:'1234',owner_id:OWNER,status:'draft',reserved:false,category:'farm',property_group:'agricultural',property_subtype:'farm',country:'HU',settlement:'Kékkút',county:'Veszprém',region:'Balaton-felvidék',lat:46.85,lng:17.56,location_confirmed:true,precision:'approximate',public_location_safe:true,price_eur:225000,price_huf:90000000,price_asof:'2026-10-23',original_price:90000000,original_currency:'HUF',exchange_rate:400,exchange_source:'ECB',price_calculated_at:now,price_negotiable:true,floor_m2:185,building_m2:260,plot_m2:42500,bedrooms:3,bathrooms:2,year_built:1920,renovated_in:2019,year_built_unknown:false,epc_class:'unknown',condition_key:'good',heating_key:'wood',wall_key:'ko',features:['panoramic-view','well','outbuildings'],video_url:null,seller_contact_visible:true,seller_name:'Teszt Eladó',seller_phone:'+36301234567',seller_speaks:['hu','de','en'],package:'normal-12m',featured:false,homepage_featured:false,homepage_order:99,editors_pick:false,editors_pick_order:99,bargain:false,bargain_since:null,topic_featured:false,topic_highlight_requested:false,details:{setting:'village',utilities:['water','electricity'],parking:['garden'],extra_buildings:'Nyárikonyha és műhely.'},public_address:null,public_postal_code:null,published_at:null,expires_at:null,submitted_at:null,approved_at:null,requested_extras:{source:'listing_editor',package:'normal-12m',translations:[],categoryHighlight:false,homepageHighlight:false,topicHighlight:false},created_at:now,property_translations:[{locale:'hu',title:'Birtok a Balaton-felvidék csendjében',description:'Kőfalú otthon, saját kút és tágas gazdasági épületek, négy hektárnyi zöld környezetben.',body:'Gondosan felújított lakóház természetközeli környezetben. A birtok jól megközelíthető, a kertből a környező dombokra nyílik kilátás.'}],property_media:media};
const privateData={property_id:ID,lat:46.851234,lng:17.561234,internal_note:'Privát megjegyzés a helyszíni egyeztetéshez.',street:'Kossuth u. 12.',postal_code:'8254',heard_from:''};
export const sessionFor=(id)=>{
 const email=id===ADMIN?'admin@fodel-test.local':'owner@fodel-test.local';
 const user={id,email,role:'authenticated',aud:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:now};
 const part=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
 const access_token=`${part({alg:'HS256',typ:'JWT'})}.${part({sub:id,email,role:'authenticated',aud:'authenticated',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+86400})}.test-fixture-signature`;
 return {access_token,refresh_token:'local-test-fixture',token_type:'bearer',expires_in:86400,expires_at:Math.floor(Date.now()/1000)+86400,user};
};
const initialProperty=structuredClone(property),initialPrivate=structuredClone(privateData),initialMedia=structuredClone(media);
let profileLocale='hu';
const send=(res,status,body,headers={})=>{res.writeHead(status,{'content-type':'application/json',...headers});res.end(body===undefined?'':JSON.stringify(body));};
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname==='/__reset'&&req.method==='POST'){profileLocale='hu';Object.assign(property,structuredClone(initialProperty));Object.assign(privateData,structuredClone(initialPrivate));media.splice(0,media.length,...structuredClone(initialMedia));property.property_media=media;return send(res,200,{ok:true});}
 if(url.pathname==='/__locale'&&req.method==='POST'){profileLocale=['hu','nl','en'].includes(url.searchParams.get('l'))?url.searchParams.get('l'):'hu';return send(res,200,{locale:profileLocale});}
 if(url.pathname==='/health')return send(res,200,{fixture:'fodel-editor-local'});
 let raw='';for await(const c of req)raw+=c;
 const body=raw?JSON.parse(raw):{};
 let id=OWNER;try{id=JSON.parse(Buffer.from(String(req.headers.authorization||'').split('.')[1]||'','base64url')).sub||OWNER;}catch{}
 if(url.pathname==='/auth/v1/token'){
  if(!['admin@fodel-test.local','owner@fodel-test.local'].includes(body.email))return send(res,400,{error:'invalid_grant',error_description:'Use a documented local test account.'});
  return send(res,200,sessionFor(body.email==='admin@fodel-test.local'?ADMIN:OWNER));
 }
 if(url.pathname==='/auth/v1/user')return send(res,200,sessionFor(id).user);
 if(url.pathname.startsWith('/auth/v1/'))return send(res,400,{error:'local-fixture-only'});
 const table=url.pathname.replace('/rest/v1/','');
 const asObject=String(req.headers.accept||'').includes('vnd.pgrst.object');
 if(table.startsWith('rpc/')){
  if(table==='rpc/save_listing_editor'&&body.p_id===ID){Object.assign(property,body.p_patch);if(body.p_private)Object.assign(privateData,body.p_private);for(const t of body.p_translations||[]){const i=property.property_translations.findIndex(v=>v.locale===t.locale);if(i>=0)Object.assign(property.property_translations[i],t);else property.property_translations.push(t);}return send(res,200,null);}
  if(table==='rpc/reorder_property_media'&&body.p_id===ID){for(const m of media){m.sort_order=body.p_ids.indexOf(m.id);if(body.p_cover)m.is_hero=m.id===body.p_cover;}return send(res,200,null);}
  return send(res,200,[]);
 }
 if(req.method==='PATCH'&&table==='properties'&&url.searchParams.get('id')===`eq.${ID}`){Object.assign(property,body);return send(res,200,null);}
 if(req.method==='POST'&&table==='activity_events')return send(res,201,null);
 if(!['GET','HEAD'].includes(req.method))return send(res,403,{error:'fixture-refuses-this-write'});
 let rows=[];
 if(table==='properties')rows=[property];
 if(table==='payments'&&property.status==='awaiting_payment')rows=[{id:'order-1',property_id:ID,owner_id:OWNER,status:'pending',amount_cents:12900,line_items:[{kind:'package',id:'normal-12m',label:'Standard hirdetés',quantity:1,unitCents:12900}],billing:{}}];
 if(table==='property_private')rows=[privateData];
 if(table==='property_media')rows=media;
 if(table==='profiles')rows=[{id,role:id===ADMIN?'admin':'owner',full_name:'Teszt Eladó',phone:'+36301234567',email:sessionFor(id).user.email,locale:profileLocale,billing:{kind:'person',name:'Teszt Eladó',country:'HU',postalCode:'8254',city:'Kékkút',street:'Teszt utca 1.'}}];
 if(req.method==='HEAD')return send(res,200,undefined,{'content-range':`*/${rows.length}`});
 if(asObject&&!rows.length)return send(res,406,{code:'PGRST116',details:'0 rows',message:'No rows'});
 return send(res,200,asObject?rows[0]:rows,{'content-range':`0-${Math.max(0,rows.length-1)}/${rows.length}`});
}).listen(port,'127.0.0.1',()=>console.log(`Local editor fixture on http://127.0.0.1:${port}`));
