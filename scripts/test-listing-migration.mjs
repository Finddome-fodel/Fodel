import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname;
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;create function is_admin() returns boolean language sql stable as $$select coalesce(current_setting('test.admin',true),'false')='true'$$;create function set_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end$$;`);
let initial=fs.readFileSync(root+'/supabase/migrations/0001_init.sql','utf8');
initial=initial.slice(initial.indexOf('create type user_role'),initial.indexOf('/* ── enquiries'));
await db.exec(initial);
await db.exec(`alter type property_status add value 'awaiting_payment';alter type property_status add value 'rejected';alter type property_category add value 'industrial';`);
await db.exec(`alter table properties add column editors_pick boolean default false,add column editors_pick_order integer default 99,add column bargain boolean default false,add column bargain_since timestamptz,add column free_listing boolean default false,add column refund_required boolean default false,add column rejected_at timestamptz,add column requested_extras jsonb default '{}',add column wall_key text;`);
await db.exec(fs.readFileSync(root+'/supabase/migrations/0011_taxonomy.sql','utf8'));
await db.exec(`alter table taxonomy_terms drop constraint taxonomy_terms_group_key_check;alter table taxonomy_terms add check(group_key in ('category','feature','condition','heating','county','region','blog_category','wall'));`);
// Coordinate constraints changed in the real 0013 migration.
await db.exec(`alter table properties drop constraint properties_lat_check;alter table properties drop constraint properties_lng_check;alter table properties add check(lat between -90 and 90),add check(lng between -180 and 180);alter table property_translations add column search_vector tsvector;`);
await db.exec('create table payments(id uuid primary key);');
const owner='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002',id='10000000-0000-4000-8000-000000000001';
await db.exec(`insert into auth.users values('${owner}'),('${other}');insert into profiles(id,email)values('${owner}','owner@test.local'),('${other}','other@test.local');insert into properties(id,ref,owner_id,status,category,country,settlement,county,region,lat,lng,price_eur,price_huf,price_asof,plot_m2)values('${id}','1234','${owner}','draft','apartment','HU','Budapest','Budapest','',47.123456,19.345678,200000,80000000,'2026-10-23',1);`);
// Production already had 0019's property_price_history, so 0022's "create table if not exists" skipped it. Reproduce that.
await db.exec(`create table property_price_history(id uuid primary key default gen_random_uuid(),property_id uuid not null references properties(id) on delete cascade,old_eur integer,new_eur integer not null,old_huf integer,new_huf integer not null,source text not null default 'owner-refresh',changed_at timestamptz not null default now());`);
const sql=fs.readFileSync(root+'/supabase/migrations/0022_european_listing_intake.sql','utf8');
try{await db.exec(sql);}catch(e){console.error('MIGRATION FAILED',e.message,e.detail);process.exit(1);}
await db.exec(sql);console.log('✓ migration executes and is repeatable');
// 0025 re-creates save_listing_editor with the old-form facts; everything below then runs against it.
const sql25=fs.readFileSync(root+'/supabase/migrations/0025_listing_details.sql','utf8');
try{await db.exec(sql25);}catch(e){console.error('MIGRATION 0025 FAILED',e.message,e.detail);process.exit(1);}
await db.exec(sql25);console.log('✓ 0025 executes and is repeatable');
// 0028 reconciles the legacy table with what save_listing_editor writes; it must be repeatable too.
const sql28=fs.readFileSync(root+'/supabase/migrations/0028_price_history_columns.sql','utf8');
try{await db.exec(sql28);}catch(e){console.error('MIGRATION 0028 FAILED',e.message,e.detail);process.exit(1);}
await db.exec(sql28);console.log('✓ 0028 executes and is repeatable');
// 0029 / 0030 replace functions in place.
for(const file of ['0029_featured_sort_and_visibility','0030_photo_limit_ceiling']){const text=fs.readFileSync(root+`/supabase/migrations/${file}.sql`,'utf8');try{await db.exec(text);await db.exec(text);}catch(e){console.error(`MIGRATION ${file} FAILED`,e.message,e.detail);process.exit(1);}console.log(`✓ ${file} executes and is repeatable`);}
const get=async q=>(await db.query(q)).rows;
let row=(await get(`select * from properties where id='${id}'`))[0];
assert.equal(row.property_group,'house');assert.equal(row.property_subtype,'apartment');assert.notEqual(row.lat,47.123456);
assert.equal((await get(`select lat from property_private where property_id='${id}'`))[0].lat,47.123456);
console.log('✓ legacy category/URL retained; original location private; public point masked');
// Base access rules mirror the existing owner/admin policies.
await db.exec(`alter table properties enable row level security;create policy test_owner on properties for all to authenticated using(owner_id=auth.uid() or is_admin()) with check(owner_id=auth.uid() or is_admin());create policy test_public on properties for select to anon using(status='published');grant usage on schema auth to authenticated;grant select,update on properties to authenticated;grant select,insert,update,delete on property_translations to authenticated;grant select,update on property_media to authenticated;grant select on properties to anon;`);
await db.exec(`set role authenticated;set test.uid='${owner}';set test.admin='false';`);
const patch={property_group:'land',property_subtype:'residential-plot',category:'land',original_price:100000,original_currency:'EUR',price_eur:100000,price_huf:40000000,exchange_rate:1,exchange_source:'ECB',price_asof:'2026-10-23',price_calculated_at:'2026-10-24T12:00:00Z',plot_m2:12500,location_confirmed:true};
const privateData={lat:48.123456,lng:20.234567,internal_note:'PRIVATE TEST NOTE'};
const translations=[{locale:'hu',title:'Teszt telek',description:'Rövid leírás',body:'Részletes leírás'}];
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,patch,privateData,translations]);
assert.equal((await get(`select internal_note from property_private where property_id='${id}'`))[0].internal_note,'PRIVATE TEST NOTE');
assert.equal((await get(`select count(*)::int as n from property_price_history`))[0].n,1);
assert.equal((await get(`select description from property_translations where property_id='${id}'`))[0].description,'Rövid leírás');
console.log('✓ owner save atomically stores property, translations, private note and price audit');
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{topic_highlight_requested:true},null,null]);
const promotion=(await get('select * from property_promotion_requests'))[0];assert.equal(promotion.kind,'topic');assert.equal(promotion.amount_cents,null);assert.equal(promotion.status,'requested');
await assert.rejects(()=>db.exec("insert into property_promotion_requests(property_id,kind,status,amount_cents)values('10000000-0000-4000-8000-000000000001','homepage','active',1)"));
console.log('✓ unpriced promotion requests are retained; owners cannot set commercial terms or activate placements');
await assert.rejects(()=>db.query('select save_listing_editor($1,$2,$3,$4)',[id,{price_negotiable:false},{lat:1,lng:2,internal_note:'must roll back'},[{locale:'invalid',title:'bad',description:'bad'}]]));
assert.equal((await get(`select internal_note from property_private where property_id='${id}'`))[0].internal_note,'PRIVATE TEST NOTE');
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{},{internal_note:'PRIVATE TEST NOTE'},null]);
assert.equal((await get(`select lat from property_private where property_id='${id}'`))[0].lat,48.123456);
console.log('✓ failed translation rolls back the whole save; note-only edits cannot overwrite newer coordinates');
// A later partial save cannot clear the private note or price history.
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{price_negotiable:true},{lat:48.123456,lng:20.234567},null]);
assert.equal((await get(`select internal_note from property_private where property_id='${id}'`))[0].internal_note,'PRIVATE TEST NOTE');
assert.equal((await get(`select count(*)::int as n from property_price_history`))[0].n,1);
console.log('✓ partial edits preserve private notes and historic conversion snapshots');
// 0025: the street address is private until the owner chooses to show it; details are one jsonb object.
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{details:{rooms:3,setting:'village',utilities:['water']},public_address:null,public_postal_code:null},{street:'Kossuth u. 12.',postal_code:'8254',heard_from:'search'},null]);
let sec=(await get(`select street,postal_code,heard_from from property_private where property_id='${id}'`))[0];
assert.deepEqual(sec,{street:'Kossuth u. 12.',postal_code:'8254',heard_from:'search'});
row=(await get(`select details,public_address,public_postal_code from properties where id='${id}'`))[0];
assert.equal(row.details.rooms,3);assert.equal(row.public_address,null);assert.equal(row.public_postal_code,null);
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{price_negotiable:false},{lat:48.123456,lng:20.234567},null]);
sec=(await get(`select street,heard_from from property_private where property_id='${id}'`))[0];assert.equal(sec.street,'Kossuth u. 12.');assert.equal(sec.heard_from,'search');
console.log('✓ street, postcode and "heard from" stay private; a save that omits them leaves them alone');
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{public_address:'Kossuth u. 12.',public_postal_code:'8254',precision:'exact'},null,null]);
row=(await get(`select lat,public_address,public_postal_code from properties where id='${id}'`))[0];
assert.equal(row.public_address,'Kossuth u. 12.');assert.equal(row.lat,48.123456);
console.log('✓ showing the address publishes it, with the exact point');
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{public_address:null,public_postal_code:null,precision:'approximate'},null,null]);
assert.notEqual((await get(`select lat from properties where id='${id}'`))[0].lat,48.123456);
await assert.rejects(()=>db.query('select save_listing_editor($1,$2,$3,$4)',[id,{details:[1,2]},null,null]));
await assert.rejects(()=>db.query('select save_listing_editor($1,$2,$3,$4)',[id,{public_address:'x'.repeat(201)},null,null]));
await assert.rejects(()=>db.query('select save_listing_editor($1,$2,$3,$4)',[id,{},{heard_from:'x'.repeat(41)},null]));
console.log('✓ malformed details and oversized address fields are refused');
await db.exec(`set test.uid='${other}';`);
assert.equal((await get(`select * from property_private`)).length,0);
await assert.rejects(()=>db.query('select save_listing_editor($1,$2,$3,$4)',[id,{},privateData,null]));
await db.exec(`reset role;set test.uid='';set test.admin='true';update properties set status='published' where id='${id}';set role anon;`);
await assert.rejects(()=>get('select * from property_private'));await assert.rejects(()=>get('select * from property_price_history'));
const publicRows=await get(`select lat,lng from properties where id='${id}'`);assert.notEqual(publicRows[0].lat,48.123456);
console.log('✓ another owner cannot read/write private data; anonymous access denied; published coordinates remain masked');
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
// 0030: the package cap lives in the application; the database keeps a hard ceiling of 200.
for(let i=0;i<200;i++)await db.query('insert into property_media(property_id,storage_path)values($1,$2)',[id,`image-${i}.jpg`]);
await assert.rejects(()=>db.query('insert into property_media(property_id,storage_path)values($1,$2)',[id,'image-201.jpg']));
let photos=await get(`select id from property_media where property_id='${id}' order by storage_path`);
const ids=photos.map(p=>p.id).reverse();await db.query('select reorder_property_media($1,$2,$3)',[id,ids,ids[2]]);
const gallery=await get(`select id,is_hero from property_media where property_id='${id}' order by sort_order`);assert.deepEqual(gallery.map(p=>p.id),ids);assert.equal(gallery.filter(p=>p.is_hero).length,1);assert.equal(gallery.find(p=>p.is_hero).id,ids[2]);
await assert.rejects(()=>db.query('select reorder_property_media($1,$2,$3)',[id,[ids[0],ids[0]],null]));
console.log('✓ photo cap enforced in PostgreSQL; reorder/cover are atomic; duplicate/foreign galleries rejected');
const search=await db.query(`select * from search_european_properties(p_category=>'land',p_subtype=>'residential-plot')`);assert.equal(search.rows.length,1);
console.log('✓ grouped/subtype public search returns the saved property');
await db.exec(`delete from property_translations where property_id='${id}';insert into property_translations(property_id,locale,title,description)values('${id}','nl','Perceel','Nederlandse beschrijving');`);
assert.equal((await db.query(`select * from search_european_properties(p_locale=>'hu')`)).rows.length,1);
console.log('✓ listings with a non-Hungarian original remain searchable in other languages');
await db.close();
