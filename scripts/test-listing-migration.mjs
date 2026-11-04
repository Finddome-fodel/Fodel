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
// 0029 / 0030 replace functions in place; 0031 and 0032 are one-off data clean-ups.
for(const file of ['0029_featured_sort_and_visibility','0030_photo_limit_ceiling','0031_clear_placeholder_plot','0032_category_follows_subtype']){const text=fs.readFileSync(root+`/supabase/migrations/${file}.sql`,'utf8');try{await db.exec(text);await db.exec(text);}catch(e){console.error(`MIGRATION ${file} FAILED`,e.message,e.detail);process.exit(1);}console.log(`✓ ${file} executes and is repeatable`);}
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
// 0031: only the exact 1 m² placeholder on a not-yet-public listing is cleared.
await db.exec(`reset role;set test.uid='';set test.admin='true';update properties set status='draft',plot_m2=1 where id='${id}'`);
await db.exec(fs.readFileSync(root+'/supabase/migrations/0031_clear_placeholder_plot.sql','utf8'));
assert.equal((await get(`select plot_m2 from properties where id='${id}'`))[0].plot_m2,null);
await db.exec(`update properties set status='published',plot_m2=1 where id='${id}'`);
await db.exec(fs.readFileSync(root+'/supabase/migrations/0031_clear_placeholder_plot.sql','utf8'));
assert.equal(Number((await get(`select plot_m2 from properties where id='${id}'`))[0].plot_m2),1);
console.log('✓ 0031 clears the placeholder plot area on drafts only');
// 0032: an unpublished apartment filed as a house is corrected, a live one keeps its address.
const m32=fs.readFileSync(root+'/supabase/migrations/0032_category_follows_subtype.sql','utf8');
await db.exec(`update properties set status='draft',category='house',property_subtype='apartment',original_currency='HUF',original_price=99000000,price_huf=98999999 where id='${id}'`);
await db.exec(m32);
assert.equal((await get(`select category from properties where id='${id}'`))[0].category,'apartment');
assert.equal(Number((await get(`select price_huf from properties where id='${id}'`))[0].price_huf),99000000);
await db.exec(`update properties set status='published',category='house',price_huf=98999999 where id='${id}'`);
await db.exec(m32);
assert.equal((await get(`select category from properties where id='${id}'`))[0].category,'house');
assert.equal(Number((await get(`select price_huf from properties where id='${id}'`))[0].price_huf),98999999);
console.log('✓ 0032 corrects the category and forint price of unpublished listings only');
// 0035: the Dutch-agent request is a plain flag on the listing; the owner may set it on their own draft.
const sql35=fs.readFileSync(root+'/supabase/migrations/0035_dutch_agent_request.sql','utf8');
try{await db.exec(sql35);}catch(e){console.error('MIGRATION 0035 FAILED',e.message,e.detail);process.exit(1);}
await db.exec(sql35);
row=(await get(`select dutch_agent_requested,dutch_agent_requested_at from properties where id='${id}'`))[0];
assert.equal(row.dutch_agent_requested,false);assert.equal(row.dutch_agent_requested_at,null);
await db.exec(`reset role;set test.uid='';set test.admin='true';update properties set status='draft' where id='${id}'`);
await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';update properties set dutch_agent_requested=true,dutch_agent_requested_at=now() where id='${id}';`);
await db.exec(`set test.uid='${other}';update properties set dutch_agent_requested=false where id='${id}';`);
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
assert.equal((await get(`select dutch_agent_requested from properties where id='${id}'`))[0].dutch_agent_requested,true);
console.log('✓ 0035 executes, is repeatable, and the owner can set the Dutch-agent request');
// 0041: the listing-field wishlist. Old-shape details, retired parking features and old energy answers are
// moved over; an admin's own dictionary edits survive; the rooms filter counts rooms; running it twice changes nothing.
await db.exec(`create table if not exists mail_templates(id uuid primary key default gen_random_uuid(),locale text not null default 'hu',subject text not null,body_html text not null);
 insert into mail_templates(locale,subject,body_html) values ('hu','{{property_bedrooms}} szoba','<span data-editable="stat2_label">Hálószobák</span>{{property_bedrooms}}'),('en','x','<span data-editable="stat2_label">Bedrooms of note</span>');
 update taxonomy_terms set property_groups=array['agricultural','land','house'] where group_key='feature' and key='steep-land';
 update properties set status='published',expires_at=null,property_group='house',property_subtype='house-villa',bedrooms=3,heating_key='gas',wall_key='valyog',epc_class='pending',features=array['parking','garage','terrace'],details='{"setting":"village","rooms":5}' where id='${id}';`);
const sql41=fs.readFileSync(root+'/supabase/migrations/0041_listing_fields_wishlist.sql','utf8');
try{await db.exec(sql41);}catch(e){console.error('MIGRATION 0041 FAILED',e.message,e.detail);process.exit(1);}
const snapshot41=async()=>JSON.stringify([await get(`select features,details,epc_class,heating_key,wall_key from properties order by id`),await get(`select key,enabled,property_groups,subtype_keys,section_key,labels from taxonomy_terms where group_key='feature' order by key`),await get(`select subject,body_html from mail_templates order by locale`)]);
const once=await snapshot41();await db.exec(sql41);assert.equal(await snapshot41(),once,'0041 is repeatable');
row=(await get(`select features,details,epc_class,wall_key from properties where id='${id}'`))[0];
assert.deepEqual(row.features,['terrace']);assert.deepEqual(row.details,{rooms:5,settings:['village'],heating:['gas'],walls:['valyog'],parking:['garage','own']});assert.equal(row.epc_class,'unknown');assert.equal(row.wall_key,'valyog');
const term=async k=>(await get(`select enabled,property_groups,section_key,labels->>'hu' hu from taxonomy_terms where group_key='feature' and key='${k}'`))[0];
assert.deepEqual((await term('steep-land')).property_groups,['agricultural','land','house'],'an admin edit survives');assert.equal((await term('steep-land')).section_key,'terrain');
assert.equal((await term('parking')).enabled,false);assert.equal((await term('storage-area')).hu,'Raktárterület');assert.deepEqual((await term('stables')).property_groups,['agricultural','mansion']);
const mails=await get(`select subject,body_html from mail_templates order by locale`);
assert.equal(mails[0].body_html,'<span data-editable="stat2_label">Bedrooms of note</span>','a label someone rewrote is left alone');assert.equal(mails[1].subject,'{{property_rooms}} szoba');assert.equal(mails[1].body_html,'<span data-editable="stat2_label">Szobák</span>{{property_rooms}}');
const found=async a=>(await get(`select count(*)::int n from search_european_properties(${a})`))[0].n;
assert.equal(await found(`p_bedrooms_min=>5`),1);assert.equal(await found(`p_bedrooms_min=>6`),0,'rooms, not the old bedroom count');assert.equal(await found(`p_exclude_adobe=>true`),0);
console.log('✓ 0041 moves details, parking features and energy answers over, keeps admin edits, and is repeatable');
// 0042: who the buyer is shown as the contact. Existing listings keep the old rule; only an admin can change it.
const sql42=fs.readFileSync(root+'/supabase/migrations/0042_contact_display.sql','utf8');
try{await db.exec(sql42);}catch(e){console.error('MIGRATION 0042 FAILED',e.message,e.detail);process.exit(1);}
await db.exec(sql42);
assert.equal((await get(`select public_contact from properties where id='${id}'`))[0].public_contact,'owner','existing listings start on the old rule');
await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';update properties set public_contact='staff',public_contact_name='X',public_contact_phone='1' where id='${id}';`);
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
assert.deepEqual((await get(`select public_contact,public_contact_name from properties where id='${id}'`))[0],{public_contact:'owner',public_contact_name:null},'an owner cannot choose');
await db.exec(`update properties set public_contact='staff',public_contact_name='Födelmesi Gábor',public_contact_phone='+31644005550' where id='${id}';`);
assert.equal((await get(`select public_contact from properties where id='${id}'`))[0].public_contact,'staff','an admin can');
let refused=false;try{await db.exec(`update properties set public_contact='everyone' where id='${id}'`);}catch{refused=true;}
assert.ok(refused,'an unknown mode is refused');
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';select save_listing_editor('${id}'::uuid,'{"public_contact":"company","public_contact_name":null}'::jsonb);reset role;set test.uid='';set test.admin='true';`).catch(e=>{throw new Error('save_listing_editor as admin failed: '+e.message);});
assert.equal((await get(`select public_contact from properties where id='${id}'`))[0].public_contact,'company','the editor RPC saves the admin choice');
console.log('✓ 0042 is repeatable; existing listings keep the old rule; only an admin can choose the contact');
// 0043: AI translation. Jobs are unique per listing + language while live, claimed one worker at a time,
// readable by the listing's owner and writable by admins only; a real edit takes a translation back from the AI.
await db.exec('create role service_role;');
const sql43=fs.readFileSync(root+'/supabase/migrations/0043_ai_translation.sql','utf8');
try{await db.exec(sql43);}catch(e){console.error('MIGRATION 0043 FAILED',e.message,e.detail);process.exit(1);}
await db.exec(sql43);
console.log('✓ 0043 executes and is repeatable');
await db.exec(`reset role;set test.uid='';set test.admin='true';delete from property_translations where property_id='${id}';insert into property_translations(property_id,locale,title,description,body)values('${id}','hu','Cím','Rövid','Hosszú');`);
await db.exec(`insert into translation_jobs(property_id,locale,source_locale,origin,status)values('${id}','de','hu','admin','queued')`);
await assert.rejects(()=>db.exec(`insert into translation_jobs(property_id,locale,origin,status)values('${id}','de','admin','queued')`));
await assert.rejects(()=>db.exec(`insert into translation_jobs(property_id,locale,origin,status)values('${id}','de','free','requested')`));
await db.exec(`insert into translation_jobs(property_id,locale,origin,status)values('${id}','fr','free','requested')`);
await db.exec(`update translation_jobs set status='failed' where locale='de'`);
await db.exec(`insert into translation_jobs(property_id,locale,origin,status)values('${id}','de','admin','queued')`);
console.log('✓ one live job per listing and language; a finished one does not block a new one');
const claimed=await get('select * from claim_translation_jobs(4)');
assert.deepEqual(claimed.map(j=>j.locale),['de']);assert.equal(claimed[0].status,'running');assert.equal(claimed[0].attempts,1);
assert.equal((await get('select * from claim_translation_jobs(4)')).length,0,'a running job is not handed out twice; a request is not queued');
await db.exec(`update translation_jobs set claimed_at=now()-interval '7 minutes' where locale='de' and status='running'`);
assert.equal((await get('select * from claim_translation_jobs(4)'))[0].attempts,2,'a stuck job is handed out again');
await db.exec(`update translation_jobs set claimed_at=now()-interval '7 minutes',attempts=3 where locale='de' and status='running'`);
assert.equal((await get('select * from claim_translation_jobs(4)')).length,0);
assert.equal((await get(`select status from translation_jobs where locale='de' and status<>'failed' or (locale='de' and last_error is not null) order by created_at desc limit 1`))[0].status,'failed','a job out of attempts is closed as failed');
console.log('✓ the claim is exclusive, recovers stuck jobs and stops after three attempts');
await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';`);
assert.ok((await get('select * from translation_jobs')).length>=2,'the owner reads their own listing\'s jobs');
await assert.rejects(()=>db.exec(`insert into translation_jobs(property_id,locale,origin,status)values('${id}','it','free','requested')`));
await db.exec(`update translation_jobs set status='queued' where locale='fr'`);
assert.equal((await get(`select status from translation_jobs where locale='fr'`))[0].status,'requested','an owner cannot move a job');
await db.exec(`set test.uid='${other}';`);
assert.equal((await get('select * from translation_jobs')).length,0,'another owner sees nothing');
await db.exec(`reset role;set role anon;`);
await assert.rejects(()=>get('select * from translation_jobs'));
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
console.log('✓ translation_jobs: owner reads own, writes nothing; others and anonymous see nothing');
// A person's edit takes the text back from the AI; an unchanged save does not.
await db.exec(`insert into property_translations(property_id,locale,title,description,body,machine,translated_from,translated_at,source_hash)values('${id}','de','Titel','Kurz','Lang',true,'hu',now(),'abc')`);
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';`);
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{},null,[{locale:'de',title:'Titel',description:'Kurz',body:'Lang'}]]);
row=(await get(`select machine,translated_from,source_hash from property_translations where property_id='${id}' and locale='de'`))[0];
assert.deepEqual(row,{machine:true,translated_from:'hu',source_hash:'abc'});
// A browser posts line breaks as CRLF; the same words are not an edit.
await db.exec(`reset role;set test.uid='';set test.admin='true';update property_translations set body=E'Erster Absatz\n\nZweiter Absatz' where property_id='${id}' and locale='de'`);
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';`);
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{},null,[{locale:'de',title:'Titel',description:'Kurz',body:'Erster Absatz\r\n\r\nZweiter Absatz'}]]);
assert.equal((await get(`select machine from property_translations where property_id='${id}' and locale='de'`))[0].machine,true,'CRLF alone is not an edit');
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{},null,[{locale:'de',title:'Titel',description:'Kurz',body:'Lang, geändert'}]]);
row=(await get(`select machine,translated_from,source_hash from property_translations where property_id='${id}' and locale='de'`))[0];
assert.deepEqual(row,{machine:false,translated_from:null,source_hash:null});
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
console.log('✓ saving an AI translation unchanged keeps it marked; editing it hands it to a person');
// The server's own write: new rows and machine rows are written; a person's text is not, unless told to.
const save=(locale,title,overwrite=false)=>db.query(`select save_machine_translation('${id}'::uuid,$1::locale_code,'hu'::locale_code,$2,'Besch','Text','h1',$3) as ok`,[locale,title,overwrite]);
assert.equal((await save('nl','Casa')).rows[0].ok,true,'a new language is written');
assert.equal((await save('nl','Casa 2')).rows[0].ok,true,'an earlier machine translation is replaced');
row=(await get(`select title,machine,translated_from,source_hash from property_translations where property_id='${id}' and locale='nl'`))[0];
assert.deepEqual(row,{title:'Casa 2',machine:true,translated_from:'hu',source_hash:'h1'});
assert.equal((await save('de','AI Titel')).rows[0].ok,false,'a person\'s text is not replaced');
assert.equal((await get(`select title from property_translations where property_id='${id}' and locale='de'`))[0].title,'Titel');
assert.equal((await save('de','AI Titel',true)).rows[0].ok,true,'unless the admin chose to');
assert.equal((await get(`select machine from property_translations where property_id='${id}' and locale='de'`))[0].machine,true);
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';`);
await assert.rejects(()=>save('fr','x'));
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
await db.exec(`update translation_jobs set status='queued',attempts=1,claimed_at=now() where id=(select id from translation_jobs where locale='de' order by created_at desc limit 1)`);
assert.equal((await get('select * from claim_translation_jobs(4)')).length,0,'a job that just failed waits before the next attempt');
await db.exec(`update translation_jobs set claimed_at=now()-interval '30 seconds' where locale='de' and status='queued'`);
assert.equal((await get('select * from claim_translation_jobs(4)')).length,1);
console.log('✓ machine translations are written in one statement and never replace a person\'s text by accident; failed jobs back off');
// 0044: the fixed free upload link. One row; admins only; nobody else, and no anonymous reader, can see the secret.
const sql44=fs.readFileSync(root+'/supabase/migrations/0044_free_upload_link.sql','utf8');
try{await db.exec(sql44);await db.exec(sql44);}catch(e){console.error('MIGRATION 0044 FAILED',e.message,e.detail);process.exit(1);}
await db.exec(`reset role;set test.uid='';set test.admin='true';delete from free_upload_link;insert into free_upload_link(token)values('abcdefghijklmnopqrstuvwxyz012345')`);
await assert.rejects(()=>db.exec(`insert into free_upload_link(id,token)values(2,'abcdefghijklmnopqrstuvwxyz012345')`),'only one row');
await assert.rejects(()=>db.exec(`insert into free_upload_link(id,token)values(1,'short')`),'a token must be long');
assert.equal((await get('select enabled from free_upload_link'))[0].enabled,true,'on by default');
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';`);
assert.equal((await get('select token from free_upload_link')).length,1,'an admin reads it');
await db.exec(`update free_upload_link set enabled=false,rotated_at=now()`);
assert.equal((await get('select enabled from free_upload_link'))[0].enabled,false,'an admin changes it');
await db.exec(`set test.admin='false';set test.uid='${owner}';`);
assert.equal((await get('select * from free_upload_link')).length,0,'a seller sees nothing');
await db.exec(`update free_upload_link set enabled=true`);
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
assert.equal((await get('select enabled from free_upload_link'))[0].enabled,false,'and changes nothing');
await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';`);
await assert.rejects(()=>db.exec(`insert into free_upload_link(id,token)values(1,'abcdefghijklmnopqrstuvwxyz012345') on conflict (id) do update set token=excluded.token`),'a seller cannot replace the secret');
await db.exec(`reset role;set role anon;`);
await assert.rejects(()=>get('select * from free_upload_link'),'anonymous has no access at all');
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
console.log('✓ free_upload_link: repeatable, one row, admins only, never readable by sellers or anonymous');
// 0046: counties get one canonical spelling. Data only; a second run changes nothing; unknown names are left alone.
{
  const sql46=fs.readFileSync(root+'/supabase/migrations/0046_county_normalize.sql','utf8');
  const countyOf=async()=>(await get(`select county from properties where id='${id}'`))[0].county;
  for(const [before,after] of [['Pest vármegye','Pest'],['  Csongrád ','Csongrád-Csanád'],['Budapest XIII. kerület','Budapest'],['BARANYA','Baranya'],['Somewhere Else','Somewhere Else']]){
    await db.exec(`reset role;set test.uid='';set test.admin='true';update properties set country='HU',county='${before}' where id='${id}'`);
    try{await db.exec(sql46);await db.exec(sql46);}catch(e){console.error('MIGRATION 0046 FAILED',e.message,e.detail);process.exit(1);}
    assert.equal(await countyOf(),after,`${before} -> ${after}`);
  }
  console.log('✓ 0046 brings county spellings to the canonical names, leaves unknown ones alone, and is repeatable');
}
// 0047 (optional): converted prices rounded to €100; euro prices, placeholders and repeat runs untouched.
const sql47=fs.readFileSync(root+'/supabase/migrations/0047_price_eur_rounding.sql','utf8');
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
const id47b='10000000-0000-4000-8000-000000000047',id47c='10000000-0000-4000-8000-000000000048';
await db.exec(`update properties set original_currency='HUF',price_eur=587896 where id='${id}';insert into properties(id,ref,owner_id,status,category,country,settlement,county,region,lat,lng,price_eur,price_huf,price_asof,plot_m2,original_currency)values('${id47b}','4701','${owner}','draft','apartment','HU','Pécs','Baranya','',46.07,18.23,587896,235158560,'2026-10-23',1,'EUR'),('${id47c}','4702','${owner}','draft','apartment','HU','Pécs','Baranya','',46.07,18.23,1,1,'2026-10-23',1,null);`);
try{await db.exec(sql47);await db.exec(sql47);}catch(e){console.error('MIGRATION 0047 FAILED',e.message,e.detail);process.exit(1);}
assert.equal(Number((await get(`select price_eur from properties where id='${id}'`))[0].price_eur),587900,'a forint price is rounded');
assert.equal(Number((await get(`select price_eur from properties where id='${id47b}'`))[0].price_eur),587896,'a euro price is never touched');
assert.equal(Number((await get(`select price_eur from properties where id='${id47c}'`))[0].price_eur),1,'the placeholder stays');
console.log('✓ 0047 rounds converted prices to €100, leaves euro prices and placeholders alone, and is repeatable');
// 0048: homepage highlight retired. Open requests cancelled, paid ones kept; the sync never asks for one again.
await db.exec(`delete from property_promotion_requests;update properties set requested_extras='{"homepageHighlight":true,"categoryHighlight":true}'::jsonb where id='${id}';update properties set requested_extras='{"homepageHighlight":false}'::jsonb where id='${id47b}';insert into property_promotion_requests(property_id,kind,status)values('${id}','homepage','requested'),('${id47b}','homepage','active');`);
const sql48=fs.readFileSync(root+'/supabase/migrations/0048_extras_cleanup.sql','utf8');
try{await db.exec(sql48);await db.exec(sql48);}catch(e){console.error('MIGRATION 0048 FAILED',e.message,e.detail);process.exit(1);}
assert.deepEqual((await get(`select property_id,status from property_promotion_requests where kind='homepage' order by property_id`)).map(r=>r.status),['cancelled','active'],'open request cancelled, a paid one kept');
assert.deepEqual((await get(`select requested_extras from properties where id='${id}'`))[0].requested_extras,{categoryHighlight:true},'the retired wish is cleared, the rest kept');
assert.equal((await get(`select count(*)::int n from properties where requested_extras ? 'homepageHighlight'`))[0].n,0);
await db.exec(`update properties set requested_extras='{"homepageHighlight":true,"categoryHighlight":true}'::jsonb where id='${id}';select sync_listing_promotion_requests('${id}'::uuid);`);
assert.deepEqual((await get(`select kind,status from property_promotion_requests where property_id='${id}' and kind in ('category','homepage') order by kind`)),[{kind:'category',status:'requested'},{kind:'homepage',status:'cancelled'}],'a stale wish creates no homepage request; category still works');
console.log('✓ 0048 cancels open homepage requests only, clears the retired wish, the sync skips homepage, and it is repeatable');
// 0049: free listings show FINDDOME's contact only. Owners cannot undo it; admins can; paid listings untouched.
await db.exec(`update properties set free_listing=true,public_contact='owner',seller_contact_visible=true where id='${id}';update properties set free_listing=false,public_contact='owner',seller_contact_visible=true where id='${id47b}';update properties set free_listing=true,public_contact='staff',public_contact_name='Födelmesi Gábor' where id='${id47c}';`);
const sql49=fs.readFileSync(root+'/supabase/migrations/0049_free_listing_contact.sql','utf8');
try{await db.exec(sql49);await db.exec(sql49);}catch(e){console.error('MIGRATION 0049 FAILED',e.message,e.detail);process.exit(1);}
const contact=async x=>(await get(`select public_contact,seller_contact_visible from properties where id='${x}'`))[0];
assert.deepEqual(await contact(id),{public_contact:'company',seller_contact_visible:false},'backfill: a free listing shows FINDDOME');
assert.deepEqual(await contact(id47b),{public_contact:'owner',seller_contact_visible:true},'backfill: a paid listing is untouched');
assert.equal((await contact(id47c)).public_contact,'staff','backfill: an admin\'s staff choice is kept');
assert.deepEqual((await get(`select tgname from pg_trigger where tgrelid='properties'::regclass and tgname in ('properties_protect_contact','zz_properties_free_listing_contact') order by tgname`)).map(r=>r.tgname),['properties_protect_contact','zz_properties_free_listing_contact'],'fires after 0042 (name order)');
await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';update properties set seller_contact_visible=true where id='${id}';update properties set seller_contact_visible=true where id='${id47b}';`);
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
assert.equal((await contact(id)).seller_contact_visible,false,'a forged request cannot show the owner on a free listing');
assert.equal((await contact(id47b)).seller_contact_visible,true,'the owner of a paid listing still chooses');
await db.exec('grant insert on properties to authenticated;');
await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';insert into properties(id,ref,owner_id,status,category,country,settlement,county,region,lat,lng,price_eur,price_huf,price_asof,plot_m2,free_listing,seller_contact_visible)values('10000000-0000-4000-8000-000000000049','4703','${owner}','draft','apartment','HU','Pécs','Baranya','',46.07,18.23,100,40000,'2026-10-23',1,true,true);`);
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
const inserted=await get(`select public_contact,seller_contact_visible,free_listing from properties where id='10000000-0000-4000-8000-000000000049'`);
assert.equal(inserted.length,1);
if(inserted[0].free_listing)assert.deepEqual({public_contact:inserted[0].public_contact,seller_contact_visible:inserted[0].seller_contact_visible},{public_contact:'company',seller_contact_visible:false},'a forged free insert is locked too');
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';update properties set public_contact='staff',public_contact_name='Födelmesi Gábor',public_contact_phone='+31644005550',seller_contact_visible=true where id='${id}';`);
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
assert.deepEqual(await contact(id),{public_contact:'staff',seller_contact_visible:true},'an admin can still choose deliberately');
console.log('✓ 0049 locks free listings to FINDDOME contact (forged requests too), keeps admin choices and paid listings, and is repeatable');
// 0050: the seven later languages. Run 1 (enum) on its own, run 2 (newsletter check) after; both repeatable.
{
  const enumSql=fs.readFileSync(root+'/supabase/migrations/0050_locales_7.sql','utf8');
  const newsSql=fs.readFileSync(root+'/supabase/migrations/0051_locales_7_newsletter.sql','utf8');
  await db.exec(`create table if not exists newsletter_subscribers(id uuid primary key default gen_random_uuid(),email text not null,locale text not null default 'nl' constraint newsletter_locale_old check(locale in ('hu','nl','en')));`);
  try{await db.exec(enumSql);await db.exec(enumSql);await db.exec(newsSql);await db.exec(newsSql);}catch(e){console.error('MIGRATION 0050 FAILED',e.message,e.detail);process.exit(1);}
  const codes=(await get(`select unnest(enum_range(null::locale_code))::text as code`)).map(r=>r.code);
  for(const code of ['sr','uk','tr','he','ar','ru','zh'])assert.ok(codes.includes(code),`locale_code has ${code}`);
  await db.exec(`insert into property_translations(property_id,locale,title,description,body)values('${id}','ar','عقار تجريبي','وصف','') on conflict (property_id,locale) do nothing;`);
  assert.equal((await get(`select count(*)::int as n from property_translations where property_id='${id}' and locale='ar'`))[0].n,1);
  for(const code of ['sr','uk','tr','he','ar','ru','zh','hu','lt'])await db.exec(`insert into newsletter_subscribers(email,locale)values('${code}@test.local','${code}')`);
  await assert.rejects(()=>db.exec(`insert into newsletter_subscribers(email,locale)values('xx@test.local','xx')`));
  const checks=(await get(`select conname from pg_constraint where conrelid='newsletter_subscribers'::regclass and contype='c'`)).map(r=>r.conname);
  assert.deepEqual(checks,['newsletter_subscribers_locale_check'],'the old locale check is replaced, not added to');
  await db.exec(`delete from property_translations where locale='ar';drop table newsletter_subscribers;`);
  console.log('✓ 0050 adds sr, uk, tr, he, ar, ru, zh (enum run on its own), widens the newsletter check to 28 languages, and is repeatable');
}
// 0054: free later photo upload with moderation. Storage is stubbed like Supabase's (bucket + foldername()).
await db.exec(`reset role;set test.uid='';set test.admin='true';create schema if not exists storage;create table if not exists storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);create or replace function storage.foldername(name text) returns text[] language sql immutable as $$select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1]$$;alter table storage.objects enable row level security;create policy test_storage_read on storage.objects for select using(true);grant usage on schema storage to authenticated,anon;grant select,insert,delete on storage.objects to authenticated;alter table property_media enable row level security;grant insert,delete on property_media to authenticated;grant select on property_media to anon;grant select on profiles to authenticated;drop policy if exists test_public_signed_in on properties;create policy test_public_signed_in on properties for select to authenticated using(status in ('published','sold'));`);
const live='10000000-0000-4000-8000-000000000053';
await db.exec(`delete from property_media where property_id='${id}';insert into properties(id,ref,owner_id,status,category,country,settlement,county,region,lat,lng,price_eur,price_huf,price_asof,plot_m2)values('${live}','5300','${owner}','published','apartment','HU','Pécs','Baranya','',46.07,18.23,100000,40000000,'2026-10-23',1);insert into property_media(property_id,storage_path,is_hero,sort_order)values('${live}','${live}/approved-a.webp',true,0),('${live}','${live}/approved-b.webp',false,1);`);
const sql53=fs.readFileSync(root+'/supabase/migrations/0054_photo_moderation.sql','utf8');
try{await db.exec(sql53);await db.exec(sql53);}catch(e){console.error('MIGRATION 0054 FAILED',e.message,e.detail);process.exit(1);}
assert.equal((await get(`select count(*)::int n from property_media where property_id='${live}' and pending`))[0].n,0,'existing photos stay approved');
const asOwner=`set role authenticated;set test.admin='false';set test.uid='${owner}';`,asAdmin=`reset role;set test.uid='${other}';set test.admin='true';`;
// The owner adds a photo to the live listing (file first, as the API does); it cannot sneak in as approved or as the cover.
await db.exec(`${asOwner}insert into storage.objects(bucket_id,name)values('property-media','${live}/new-1.webp');insert into property_media(property_id,storage_path,is_hero,sort_order,pending)values('${live}','${live}/new-1.webp',true,2,false);`);
let fresh=(await get(`select id,pending,is_hero,submitted_at from property_media where storage_path='${live}/new-1.webp'`))[0];
assert.equal(fresh.pending,true,'a photo added to a live listing is pending, whatever the request said');
assert.equal(fresh.is_hero,false,'a pending photo is never the cover');
assert.ok(fresh.submitted_at,'the queue knows when it arrived');
await assert.rejects(()=>db.exec(`update property_media set pending=false where id='${fresh.id}'`),/moderation-admin-only/,'the owner cannot approve their own photo');
await assert.rejects(()=>db.exec(`update property_media set is_hero=true where id='${fresh.id}'`),/pending-cover/);
const all53=(await get(`select id from property_media where property_id='${live}' order by sort_order`)).map(r=>r.id);
await assert.rejects(()=>db.query('select reorder_property_media($1,$2,$3)',[live,all53,fresh.id]),/pending-cover/,'reorder cannot make a pending photo the cover');
await db.query('select reorder_property_media($1,$2,$3)',[live,[...all53].reverse(),all53[1]]);
assert.deepEqual((await get(`select id from property_media where property_id='${live}' order by sort_order`)).map(r=>r.id),[...all53].reverse(),'the owner may reorder a live listing');
assert.equal((await get(`select id from property_media where property_id='${live}' and is_hero`))[0].id,all53[1],'and choose an approved cover');
await db.exec(`update property_media set alt='{"hu":"Új felirat"}' where id='${fresh.id}'`);
await assert.rejects(()=>db.exec(`update property_media set alt='{"hu":"x","en":"x","nl":"x","de":"x","fr":"x"}' where id='${all53[0]}'`),/approved-photo-locked/,'an approved caption on a live listing needs review');
await assert.rejects(()=>db.exec(`update property_media set storage_path='${live}/swap.webp' where id='${all53[0]}'`),/approved-photo-locked/,'an approved photo cannot be swapped unseen');
// The public never sees it; another user neither; the owner does.
await db.exec(`reset role;set role anon;set test.uid='';set test.admin='false';`);
assert.equal((await get(`select count(*)::int n from property_media where property_id='${live}'`))[0].n,2,'anonymous sees only the two approved photos');
await db.exec(`reset role;set role authenticated;set test.admin='false';set test.uid='${other}';`);
assert.equal((await get(`select count(*)::int n from property_media where property_id='${live}'`))[0].n,2,'another user sees only approved photos');
await db.exec(`reset role;${asOwner}`);
assert.equal((await get(`select count(*)::int n from property_media where property_id='${live}'`))[0].n,3,'the owner sees their pending photo');
// Removing: pending ones freely, approved ones until one remains.
await db.exec(`delete from property_media where id='${all53[0]}'`);
await assert.rejects(()=>db.exec(`delete from property_media where id='${all53[1]}'`),/last-photo/,'a live listing keeps one approved photo');
await db.exec(`delete from storage.objects where name='${live}/new-1.webp'`);
assert.equal((await get(`select count(*)::int n from storage.objects where name='${live}/new-1.webp'`))[0].n,0,'the owner may remove their file on a live listing');
await db.exec(`insert into storage.objects(bucket_id,name)values('property-media','${live}/new-1.webp')`);
// Not on someone else's listing, nor on a sold or archived one.
await db.exec(`reset role;set test.admin='true';update properties set status='sold' where id='${live}';`);
await db.exec(`reset role;${asOwner}`);
await assert.rejects(()=>db.exec(`insert into property_media(property_id,storage_path)values('${live}','${live}/sold.webp')`),'no uploads to a sold listing');
await assert.rejects(()=>db.exec(`insert into storage.objects(bucket_id,name)values('property-media','${live}/sold.webp')`),'no files on a sold listing');
await db.exec(`reset role;set test.admin='true';update properties set status='published' where id='${live}';`);
await db.exec(`reset role;set role authenticated;set test.admin='false';set test.uid='${other}';`);
await assert.rejects(()=>db.exec(`insert into property_media(property_id,storage_path)values('${live}','${live}/intruder.webp')`),'not on another owner\'s listing');
await assert.rejects(()=>db.exec(`insert into storage.objects(bucket_id,name)values('property-media','${live}/intruder.webp')`),'no files in another owner\'s folder');
// A draft stays as before: uploads are reviewed with the listing, never pending.
await db.exec(`reset role;${asOwner}update properties set status='draft' where id='${id47b}';insert into property_media(property_id,storage_path)values('${id47b}','${id47b}/draft.webp');`);
assert.equal((await get(`select pending from property_media where storage_path='${id47b}/draft.webp'`))[0].pending,false,'a draft photo is not queued');
// The admin approves one and rejects with a reason; the owner reads the reason and can only dismiss it.
await db.exec(`reset role;${asOwner}insert into property_media(property_id,storage_path)values('${live}','${live}/new-2.webp');`);
await db.exec(`${asAdmin}set role authenticated;update property_media set pending=false,reviewed_at=now(),reviewed_by='${other}' where id='${fresh.id}';delete from property_media where storage_path='${live}/new-2.webp';insert into property_media_rejections(property_id,photo_count,reason,decided_by)values('${live}',1,'Elmosódott kép','${other}');`);
await db.exec(`reset role;set role anon;set test.uid='';set test.admin='false';`);
assert.equal((await get(`select count(*)::int n from property_media where property_id='${live}'`))[0].n,2,'an approved photo goes live');
await assert.rejects(()=>get(`select * from property_media_rejections`),'anonymous never reads rejections');
await db.exec(`reset role;${asOwner}`);
const rej=await get(`select id,reason from property_media_rejections where property_id='${live}'`);
assert.equal(rej[0]?.reason,'Elmosódott kép','the owner reads the reason');
await assert.rejects(()=>db.exec(`insert into property_media_rejections(property_id,reason)values('${live}','fake')`),'the owner cannot write a rejection');
await assert.rejects(()=>db.exec(`update property_media_rejections set reason='edited' where id='${rej[0].id}'`),/rejection-read-only/);
await db.exec(`update property_media_rejections set dismissed_at=now() where id='${rej[0].id}'`);
assert.ok((await get(`select dismissed_at from property_media_rejections where id='${rej[0].id}'`))[0].dismissed_at,'the owner can dismiss the notice');
await db.exec(`reset role;set role authenticated;set test.admin='false';set test.uid='${other}';`);
assert.equal((await get(`select count(*)::int n from property_media_rejections`))[0].n,0,'another user sees no rejections');
// The package limit (0030) counts pending photos too.
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
for(let i=0;i<198;i++)await db.query('insert into property_media(property_id,storage_path,pending)values($1,$2,$3)',[live,`${live}/bulk-${i}.webp`,i%2===0]);
await assert.rejects(()=>db.query('insert into property_media(property_id,storage_path,pending)values($1,$2,true)',[live,`${live}/over.webp`]),/photo-limit/,'pending photos count toward the limit');
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
console.log('✓ 0054 queues live-listing photos as pending (never the cover, never self-approved), hides them from the public, keeps one approved photo, guards storage, keeps reasons owner-read-only, and is repeatable');
// 0052: translation status. Repeatable; a hand edit of an AI text is noted and keeps the source fingerprint; the server's
// write stores the checks' verdict and clears a hand edit only when told to overwrite; only an admin saves a hand-made text;
// the overview view covers every listing x language and is not readable by anonymous visitors.
const sql51=fs.readFileSync(root+'/supabase/migrations/0052_translation_status.sql','utf8');
try{await db.exec(sql51);await db.exec(sql51);}catch(e){console.error('MIGRATION 0052 FAILED',e.message,e.detail);process.exit(1);}
await db.exec(`reset role;set test.uid='';set test.admin='true';delete from translation_jobs;delete from property_translations where property_id='${id}';insert into property_translations(property_id,locale,title,description,body)values('${id}','hu','Cím','Rövid','Hosszú');insert into property_translations(property_id,locale,title,description,body,machine,translated_from,translated_at,source_hash)values('${id}','de','Titel','Kurz','Lang',true,'hu',now(),'H1');`);
const locales=(await get(`select count(*)::int as n from pg_enum where enumtypid='locale_code'::regtype`))[0].n;
assert.equal((await get(`select count(*)::int as n from translation_matrix where property_id='${id}'`))[0].n,locales,'one row per language');
let m=(await get(`select * from translation_matrix where property_id='${id}' and locale='de'`))[0];
assert.deepEqual([m.has_text,m.excluded,m.job_status,m.source_hash],[true,false,null,'H1']);
assert.equal((await get(`select has_text from translation_matrix where property_id='${id}' and locale='fr'`))[0].has_text,false);
await db.exec(`insert into translation_jobs(property_id,locale,origin,status,fail_code,partial_output,feedback)values('${id}','fr','package','failed','too-long','{"title":"x"}','Shorten it')`);
await db.exec(`insert into translation_jobs(property_id,locale,origin,status,created_at)values('${id}','fr','admin','done',now()-interval '1 day')`);
m=(await get(`select job_status,job_origin,fail_code from translation_matrix where property_id='${id}' and locale='fr'`))[0];
assert.deepEqual(m,{job_status:'failed',job_origin:'package',fail_code:'too-long'},'the view shows the newest job');
await assert.rejects(()=>db.exec(`insert into translation_jobs(property_id,locale,origin,status)values('${id}','es','bogus','queued')`),'the origin list is enforced');
await db.exec(`update properties set excluded_locales='{nl}' where id='${id}'`);
assert.equal((await get(`select excluded from translation_matrix where property_id='${id}' and locale='nl'`))[0].excluded,true);
// A person edits an AI text through the editor: noted, fingerprint kept.
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';`);
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{},null,[{locale:'de',title:'Titel',description:'Kurz',body:'Lang, geändert'}]]);
row=(await get(`select machine,manual_override,needs_review,translated_from,source_hash from property_translations where property_id='${id}' and locale='de'`))[0];
assert.deepEqual(row,{machine:false,manual_override:true,needs_review:false,translated_from:'hu',source_hash:'H1'});
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
// A text a person wrote as an original is not marked as an override.
await db.exec(`insert into property_translations(property_id,locale,title,description,machine)values('${id}','nl','Huis','Kort',false)`);
await db.exec(`update property_translations set title='Huis 2' where property_id='${id}' and locale='nl'`);
assert.equal((await get(`select manual_override from property_translations where property_id='${id}' and locale='nl'`))[0].manual_override,false);
// The server's write: the verdict is stored; a hand edit is replaced only on overwrite, and then stops being an override.
const save51=(locale,title,overwrite,review=false)=>db.query(`select save_machine_translation('${id}'::uuid,$1::locale_code,'hu'::locale_code,$2,'Besch','Text','H2',$3,$4,$5) as ok`,[locale,title,overwrite,review,review?['A címet az AI lerövidítette.']:[]]);
assert.equal((await save51('de','AI Titel',false)).rows[0].ok,false,'a hand edit is not replaced');
assert.equal((await save51('de','AI Titel',true,true)).rows[0].ok,true);
row=(await get(`select machine,manual_override,needs_review,check_warnings,source_hash,validated_at is not null as v from property_translations where property_id='${id}' and locale='de'`))[0];
assert.deepEqual(row,{machine:true,manual_override:false,needs_review:true,check_warnings:['A címet az AI lerövidítette.'],source_hash:'H2',v:true});
assert.equal((await db.query(`select save_machine_translation('${id}'::uuid,'en'::locale_code,'hu'::locale_code,'T','B','X','H2',false) as ok`)).rows[0].ok,true,'the older 8-argument call still works');
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';`);
await assert.rejects(()=>save51('en','x2',false),'only the server (service role) may write machine translations');
// A hand-made text: admins only.
const override=(locale,title,hash=null)=>db.query('select save_translation_override($1,$2,$3,$4,$5,$6,$7)',[id,locale,title,'Kurz','Lang',hash,'hu']);
await override('de','Handgemacht','H2');
row=(await get(`select title,machine,manual_override,needs_review,source_hash,translated_from from property_translations where property_id='${id}' and locale='de'`))[0];
assert.deepEqual(row,{title:'Handgemacht',machine:false,manual_override:true,needs_review:false,source_hash:'H2',translated_from:'hu'});
await override('de','Handgemacht 2');
assert.equal((await get(`select source_hash from property_translations where property_id='${id}' and locale='de'`))[0].source_hash,'H2','an earlier fingerprint is kept when none is given');
await assert.rejects(()=>override('de','   '),'a title is required');
await db.exec(`set test.admin='false';set test.uid='${owner}';`);
await assert.rejects(()=>override('de','Nem szabad'),'a seller cannot');
assert.equal((await get(`select count(*)::int as n from translation_matrix where property_id='${id}'`))[0].n,locales,'a seller reads the overview of their own listing');
await db.exec(`reset role;set role anon;`);
await assert.rejects(()=>get('select * from translation_matrix'),'anonymous has no access');
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
console.log('✓ 0052: repeatable; the overview, hand-edit tracking, the verdict, admin-only overrides and access all hold');
// 0053: translation packages. Repeatable; English can never be excluded; a seller cannot grant themselves a package or languages
// (insert or update), the server and admins can; the backfill keeps every language a listing already has.
await db.exec(`reset role;set test.uid='';set test.admin='true';delete from translation_jobs;delete from property_translations where property_id='${id}';insert into property_translations(property_id,locale,title,description,body,machine)values('${id}','hu','Cím','Rövid','Hosszú',false),('${id}','nl','Huis','Kort','',true),('${id}','de','Haus','Kurz','',true),('${id}','en','House','Short','',true),('${id}','fr','Maison','Court','',false);insert into translation_jobs(property_id,locale,origin,status)values('${id}','nl','upload_paid','done');update properties set excluded_locales='{}' where id='${id}';`);
const sql52=fs.readFileSync(root+'/supabase/migrations/0053_translation_packages.sql','utf8');
try{await db.exec(sql52);await db.exec(sql52);}catch(e){console.error('MIGRATION 0053 FAILED',e.message,e.detail);process.exit(1);}
let tp=(await get(`select translation_package,extra_locales::text[] as extra_locales,excluded_locales::text[] as excluded_locales from properties where id='${id}'`))[0];
assert.deepEqual(tp,{translation_package:'basic',extra_locales:['nl','fr'],excluded_locales:[]},'the backfill keeps nl and fr, and leaves out the original (hu), English and German which Basic covers');
await db.exec(`update properties set extra_locales='{}' where id='${id}'`);
await db.exec(`delete from property_translations where property_id='${id}' and locale='hu'`);
await db.exec(sql52);
tp=(await get(`select extra_locales::text[] as extra_locales from properties where id='${id}'`))[0];
assert.deepEqual(tp.extra_locales,['nl'],'with no Hungarian text the first human-written language (fr) is the original, so it is not an extra');
await db.exec(`insert into property_translations(property_id,locale,title,description,body,machine)values('${id}','hu','Cím','Rövid','Hosszú',false)`);
await db.exec(`update properties set extra_locales='{fr}',translation_package='europe' where id='${id}'`);
await db.exec(sql52);
tp=(await get(`select translation_package,extra_locales::text[] as extra_locales from properties where id='${id}'`))[0];
assert.deepEqual(tp,{translation_package:'europe',extra_locales:['fr']},'a listing that already has a package or extras is left alone');
// The checks below change the fixtures (and rewrite the check constraint); they are put back at the end.
await db.exec(`create temp table sv_tr as select * from property_translations where property_id='${id}';create temp table sv_jobs as select * from translation_jobs;create temp table sv_prop as select translation_package,extra_locales,excluded_locales,updated_at from properties where id='${id}';`);
// An earlier version of this file called the first package 'go': those rows become 'basic', and the check allows the new names only.
await db.exec(`alter table properties drop constraint properties_translation_package_check;update properties set translation_package='go',extra_locales='{}' where id='${id}'`);
await db.exec(sql52);
assert.equal((await get(`select translation_package from properties where id='${id}'`))[0].translation_package,'basic',"'go' is converted to 'basic'");
await assert.rejects(()=>db.exec(`update properties set translation_package='go' where id='${id}'`),"'go' is no longer a package");
// Fix 3.6: the backfill touches only the listings that gain languages. A listing with nothing to add keeps its updated_at.
await db.exec(`update properties set extra_locales='{}',translation_package='basic' where id='${id}';delete from property_translations where property_id='${id}' and locale not in ('hu');delete from translation_jobs;`);
await db.exec(`alter table properties disable trigger user;update properties set updated_at='2020-01-01T00:00:00Z' where id='${id}';alter table properties enable trigger user;`);
const stamp=async()=>(await get(`select updated_at::text as at,extra_locales::text[] as extra from properties where id='${id}'`))[0];
await db.exec(sql52);
let after=await stamp();
assert.equal(after.at.startsWith('2020-01-01'),true,'a listing with no language to add keeps its updated_at');
assert.deepEqual(after.extra,[],'and gains nothing');
await db.exec(`insert into property_translations(property_id,locale,title,description,body,machine)values('${id}','nl','Titel','Kort','Lang',true) on conflict do nothing`);
await db.exec(sql52);
after=await stamp();
assert.deepEqual(after.extra,['nl'],'a listing with a Dutch text gains nl');
await db.exec(`alter table properties disable trigger user;update properties set updated_at='2020-01-01T00:00:00Z' where id='${id}';alter table properties enable trigger user;`);
await db.exec(sql52);
assert.equal((await stamp()).at.startsWith('2020-01-01'),true,'a second run changes nothing, not even an updated_at');
await db.exec(`alter table properties drop constraint if exists properties_translation_package_check;alter table properties add constraint properties_translation_package_check check (translation_package in ('basic','europe','world'));`);
await db.exec(`alter table properties disable trigger user;update properties p set translation_package=v.translation_package,extra_locales=v.extra_locales,excluded_locales=v.excluded_locales,updated_at=v.updated_at from sv_prop v where p.id='${id}';alter table properties enable trigger user;`);
await db.exec(`delete from property_translations where property_id='${id}';insert into property_translations select * from sv_tr;delete from translation_jobs;insert into translation_jobs select * from sv_jobs;drop table sv_tr;drop table sv_jobs;drop table sv_prop;`);
await assert.rejects(()=>db.exec(`update properties set translation_package='gold' where id='${id}'`),'only the three packages');
await assert.rejects(()=>db.exec(`update properties set excluded_locales='{nl,en}' where id='${id}'`),'English can never be excluded (direct SQL)');
await db.exec(`update properties set excluded_locales='{de}' where id='${id}'`);
assert.deepEqual((await get(`select excluded_locales::text[] as excluded_locales from properties where id='${id}'`))[0].excluded_locales,['de'],'German can be');
// A seller's own session: the guard keeps the stored package and extras; the exclusions are theirs to change.
await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';`);
await db.exec(`update properties set translation_package='world',extra_locales='{fr,nl}',excluded_locales='{nl}' where id='${id}'`);
tp=(await get(`select translation_package,extra_locales::text[] as extra_locales,excluded_locales::text[] as excluded_locales from properties where id='${id}'`))[0];
assert.deepEqual(tp,{translation_package:'europe',extra_locales:['fr'],excluded_locales:['nl']},'a seller cannot change the package or the single languages');
await db.exec(`update properties set excluded_locales='{}' where id='${id}'`);
assert.deepEqual((await get(`select excluded_locales::text[] as excluded_locales from properties where id='${id}'`))[0].excluded_locales,[],'but can switch a language back on');
await assert.rejects(()=>db.exec(`update properties set excluded_locales='{en}' where id='${id}'`),'and never English');
// An admin session and the server may write all three.
await db.exec(`reset role;set test.uid='${other}';set test.admin='true';set role authenticated;`);
await db.exec(`update properties set translation_package='world',extra_locales='{fr}' where id='${id}'`);
assert.deepEqual((await get(`select translation_package,extra_locales::text[] as extra_locales from properties where id='${id}'`))[0],{translation_package:'world',extra_locales:['fr']});
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
await db.exec(`update properties set translation_package='basic',extra_locales='{}' where id='${id}'`);
// The editor's own save never touches them.
await db.exec(`set role authenticated;set test.admin='true';set test.uid='${other}';`);
await db.exec(`update properties set translation_package='europe',extra_locales='{nl}' where id='${id}'`);
await db.query('select save_listing_editor($1,$2,$3,$4)',[id,{translation_package:'world',extra_locales:['fr'],excluded_locales:['nl']},null,null]);
assert.deepEqual((await get(`select translation_package,extra_locales::text[] as extra_locales,excluded_locales::text[] as excluded_locales from properties where id='${id}'`))[0],{translation_package:'europe',extra_locales:['nl'],excluded_locales:[]},'save_listing_editor ignores these keys, for admins and sellers alike');
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
// A seller creating a listing cannot start on a package either.
await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';`);
const created=await db.query(`insert into properties(ref,owner_id,status,category,country,settlement,county,region,lat,lng,translation_package,extra_locales) values('9999','${owner}','draft','house','HU','X','Y','Z',47,19,'world','{fr}') returning translation_package,extra_locales::text[] as extra_locales`).catch(()=>null);
if(created)assert.deepEqual(created.rows[0],{translation_package:'basic',extra_locales:[]},'an insert by a seller starts on Go');
await db.exec(`reset role;set test.uid='';set test.admin='true';`);
console.log('✓ 0053: repeatable; the backfill keeps every language; English cannot be excluded; sellers cannot grant themselves languages');
// 0055 (own run): the three packages join the enum next to the two old ones; repeatable.
{
  const sql55=fs.readFileSync(root+'/supabase/migrations/0055_listing_package_values.sql','utf8');
  try{await db.exec(sql55);await db.exec(sql55);}catch(e){console.error('MIGRATION 0055 FAILED',e.message,e.detail);process.exit(1);}
  const values=(await get(`select unnest(enum_range(null::listing_package))::text as v`)).map(r=>r.v);
  assert.deepEqual(values,['cheap-6m','normal-12m','basic','europe','world'],'the old values stay, the new ones follow');
  console.log('✓ 0055 adds basic, europe and world next to the two old package values, and is repeatable');
}
// 0056: the term and band of a package, and the daily rate. Sellers cannot set them; anyone can read the rates; only the server writes.
{
  const sql56=fs.readFileSync(root+'/supabase/migrations/0056_pricing_2026.sql','utf8');
  await db.exec(`reset role;set test.uid='';set test.admin='true';create table if not exists site_settings(id int primary key,services jsonb);insert into site_settings values(1,'{"priceRounding":{"step":500}}') on conflict do nothing;`);
  try{await db.exec(sql56);await db.exec(sql56);}catch(e){console.error('MIGRATION 0056 FAILED',e.message,e.detail);process.exit(1);}
  const cols=(await get(`select column_name from information_schema.columns where table_name='properties' and column_name in ('package_months','price_tier_index','price_tier_huf_bounds') order by 1`)).map(r=>r.column_name);
  assert.deepEqual(cols,['package_months','price_tier_huf_bounds','price_tier_index']);
  await db.exec(`update properties set package='basic',package_months=6,price_tier_index=1,price_tier_huf_bounds='[24999999,100000000]' where id='${id}'`);
  await db.exec(`set role authenticated;set test.admin='false';set test.uid='${owner}';update properties set package_months=1,price_tier_index=2,price_tier_huf_bounds='[]' where id='${id}'`);
  await db.exec(`reset role;set test.uid='';set test.admin='true';`);
  assert.deepEqual((await get(`select package_months,price_tier_index,price_tier_huf_bounds::text as b from properties where id='${id}'`))[0],{package_months:6,price_tier_index:1,b:'[24999999, 100000000]'},'a seller cannot change the term or the band');
  await db.exec(`set test.admin='false';set test.uid='${other}';update properties set package_months=2 where id='${id}'`);
  await db.exec(`reset role;set test.uid='';set test.admin='true';`);
  await db.exec(`update properties set package_months=3 where id='${id}'`);
  assert.equal((await get(`select package_months from properties where id='${id}'`))[0].package_months,3,'the server or an admin can');
  await assert.rejects(()=>db.exec(`update properties set package_months=25 where id='${id}'`),'at most 24 months');
  await db.exec(`insert into exchange_rate_snapshots(rate_date,rates)values('2026-11-04','{"HUF":385.12,"GBP":0.87}')`);
  await assert.rejects(()=>db.exec(`insert into exchange_rate_snapshots(rate_date,rates)values('2026-11-05','{"GBP":0.87}')`),'a day without a forint rate is refused');
  await db.exec(`set role anon;`);
  assert.equal((await get(`select (rates->>'HUF')::numeric as huf from exchange_rate_snapshots`))[0].huf,'385.12','anonymous visitors read the rate');
  await assert.rejects(()=>db.exec(`insert into exchange_rate_snapshots(rate_date,rates)values('2026-11-06','{"HUF":1}')`),'anonymous cannot write');
  await db.exec(`reset role;set role authenticated;`);
  await assert.rejects(()=>db.exec(`update exchange_rate_snapshots set rates='{"HUF":1}'`),'a signed-in user cannot write either');
  await db.exec(`reset role;set test.uid='';set test.admin='true';delete from exchange_rate_snapshots;update properties set package='cheap-6m',package_months=null,price_tier_index=null,price_tier_huf_bounds=null where id='${id}'`);
  assert.deepEqual((await get(`select services from site_settings where id=1`))[0].services,{priceRounding:{step:500},pricingLive:true},'0056 switches the new packages on and keeps the other settings');
  await db.exec(`drop table site_settings;`);
  console.log('✓ 0056 records the term and band (sellers cannot set them), keeps the daily rate readable by all and writable by the server only, and is repeatable');
}
// 0057: "Mezőgazdasági üzem, birtok" becomes three types: the dictionary gains the new keys, every listing is moved by keyword, flagged and logged.
{
  const sql57=fs.readFileSync(root+'/supabase/migrations/0057_agricultural_types.sql','utf8');
  await db.exec(`reset role;set test.uid='';set test.admin='true';create table if not exists activity_events(id uuid primary key default gen_random_uuid(),kind text not null,subject_type text,subject_id text,property_id uuid,source text,payload jsonb not null default '{}',dedupe_key text unique);`);
  await db.exec(`alter table properties disable trigger user;`);
  const base=(await get(`select * from properties where id='${id}'`))[0];
  void base;
  const make=async(n,title,description,subtype='agricultural-estate',locale='hu')=>{
    const pid=`30000000-0000-4000-8000-00000000000${n}`;
    await db.exec(`create temp table t57 as select * from properties where id='${id}';update t57 set id='${pid}',ref='57${n}',status='published',category='farm',property_group='agricultural',property_subtype='${subtype}';insert into properties select * from t57;drop table t57;`);
    if(title!==null)await db.exec(`insert into property_translations(property_id,locale,title,description,machine) values('${pid}','${locale}','${title}','${description}',false) on conflict do nothing`);
    return pid;
  };
  const a=await make(1,'Működő sertéstelep','Régi telep, 400 férőhellyel.');
  const b=await make(2,'Majorság a Dunántúlon','Felújított major, lakóházzal.');
  const c=await make(3,'Csodás birtok','Szép birtok erdővel.');
  const d=await make(4,null,null);
  const e=await make(5,'Mezőgazdasági terület','Szántó és birtok, mezőgazdasági művelésre.');
  const f=await make(6,'Gyümölcsüzem','Alma és meggy.');
  const g=await make(7,'Tanya','Egy tanya.','farm');
  await db.exec(`insert into taxonomy_terms(group_key,key,labels,sort_order,property_groups,subtype_keys,section_key) values ('feature','t57-outbuildings','{"hu":"x","en":"x","nl":"x","de":"x","fr":"x"}',1,array['agricultural'],array['farm','agricultural-estate'],'facilities'),('feature','t57-other','{"hu":"y","en":"y","nl":"y","de":"y","fr":"y"}',2,array['agricultural'],array['farm'],'facilities') on conflict do nothing`);
  const snapshot=async()=>JSON.stringify([await get(`select id,property_subtype,details,updated_at from properties order by id`),await get(`select key,subtype_keys from taxonomy_terms where key like 't57%' order by key`),await get(`select kind,property_id,payload from activity_events where kind='listing.subtype_remapped' order by property_id`)]);
  try{await db.exec(sql57);}catch(err){console.error('MIGRATION 0057 FAILED',err.message,err.detail);process.exit(1);}
  const once=await snapshot();
  await db.exec(sql57);
  assert.equal(await snapshot(),once,'a second run changes nothing');
  const sub=async pid=>(await get(`select property_subtype s,details->'subtype_review' r from properties where id='${pid}'`))[0];
  assert.equal((await sub(a)).s,'agricultural-business','„telep” -> Mezőgazdasági üzem');assert.equal((await sub(a)).r.reason,'telep');
  assert.equal((await sub(b)).s,'manor-farmstead','„major” -> Majorság');assert.equal((await sub(b)).r.reason,'major');
  assert.equal((await sub(c)).s,'rural-estate','everything else -> Birtok');assert.equal((await sub(c)).r.reason,'default');
  assert.equal((await sub(d)).s,'rural-estate','no text at all -> Birtok, reason default');assert.equal((await sub(d)).r.reason,'default');
  assert.equal((await sub(e)).s,'rural-estate','„mezőgazdasági” alone is not „gazdaság”: land that mentions it stays a Birtok');
  assert.equal((await sub(f)).s,'agricultural-business','„üzem” inside a word counts');assert.equal((await sub(f)).r.reason,'üzem');
  assert.deepEqual(await sub(g),{s:'farm',r:null},'a Tanya is not touched and not flagged');
  assert.equal((await sub(a)).r.from,'agricultural-estate');assert.ok((await sub(a)).r.at);
  assert.equal((await get(`select count(*)::int n from properties where property_subtype='agricultural-estate'`))[0].n,0,'no listing is left on the old key');
  assert.equal((await get(`select count(*)::int n from properties where details ? 'subtype_review'`))[0].n,6,'every moved listing is flagged for an admin');
  assert.equal((await get(`select count(*)::int n from activity_events where kind='listing.subtype_remapped'`))[0].n,6,'one activity row per listing, once');
  const arrays=Object.fromEntries((await get(`select key,subtype_keys from taxonomy_terms where key like 't57%'`)).map(r=>[r.key,r.subtype_keys]));
  assert.deepEqual(arrays['t57-outbuildings'],['farm','agricultural-estate','agricultural-business','rural-estate','manor-farmstead'],'the old key stays, the three new ones follow, no repeats');
  assert.deepEqual(arrays['t57-other'],['farm'],'a list without the old key is not touched');
  // The rollback in the header puts the unconfirmed ones back.
  await db.exec(`update properties set property_subtype = details -> 'subtype_review' ->> 'from', details = details - 'subtype_review' where details ? 'subtype_review'`);
  assert.equal((await get(`select count(*)::int n from properties where property_subtype='agricultural-estate'`))[0].n,6,'the rollback line works');
  await db.exec(`delete from activity_events;delete from property_translations where property_id::text like '3%';delete from properties where id::text like '3%';delete from taxonomy_terms where key like 't57%';alter table properties enable trigger user;drop table activity_events;`);
  console.log('✓ 0057 moves each old agricultural listing by keyword, flags and logs it, widens the dictionary, and is repeatable');
}
// Fix 3.3: the search lists only what is published in the visitor's language, in SQL: every page is full except the last, the total is exact,
// pages never overlap, and for every listing x language the database agrees with listedIn() (src/lib/listing-languages.ts).
{
  const { listedIn } = await import('../src/lib/listing-languages.ts');
  const { packageLocales } = await import('../src/lib/translation-packages.ts');
  const { LOCALES } = await import('../src/i18n/ui.ts');
  const worldOnly = ['tr', 'he', 'ar', 'zh', 'ru'];
  const cfg = { worldOnly, singleEur: { european: 1, world: 5 }, packages: [
    { id: 'basic', rule: { include: ['hu', 'en', 'de'] }, active: true }, { id: 'europe', rule: { excludeFromAll: worldOnly }, active: true }, { id: 'world', rule: {}, active: true } ] };
  const packagesFor = (locale) => cfg.packages.filter((pkg) => packageLocales(pkg, LOCALES).includes(locale)).map((pkg) => pkg.id);
  await db.exec(`reset role;set test.uid='';set test.admin='true';alter table properties disable trigger user;`);
  const seeds = [];
  const lit = (list) => `array[${list.map((x) => `'${x}'`).join(',')}]::locale_code[]`;
  for (let i = 0; i < 30; i++) {
    const pid = `40000000-0000-4000-8000-0000000000${String(i).padStart(2, '0')}`;
    const source = ['hu', 'hu', 'nl', 'de'][i % 4];
    const pkg = ['basic', 'europe', 'world'][i % 3];
    const extra = [[], ['fr'], ['tr'], []][i % 4];
    const excluded = [[], ['sr'], ['ar'], ['de'], []][i % 5];
    const rows = [[source, false], ['en', true], ...(['uk', 'fr', 'ar', 'tr', 'sr', 'de'].filter((_, k) => (i + k) % 3 !== 0).map((code, k) => [code, (i + k) % 2 === 0]))].filter(([code], k, all) => all.findIndex(([c]) => c === code) === k);
    seeds.push({ pid, source, pkg, extra, excluded, rows });
    await db.exec(`create temp table t40 as select * from properties where id='${id}';update t40 set id='${pid}',ref='40${i}',status='published',category='farm',property_group='agricultural',property_subtype='farm',expires_at=null,translation_package='${pkg}',extra_locales=${lit(extra)},excluded_locales=${lit(excluded)},published_at=now()-interval '${i} hours';insert into properties select * from t40;drop table t40;`);
    for (const [code, machine] of rows) await db.exec(`insert into property_translations(property_id,locale,title,description,machine) values('${pid}','${code}','Cím ${i} ${code}','Leírás ${i} ${code}',${machine}) on conflict do nothing`);
  }
  const call = (locale, extra = '') => db.query(`select id, total_count from search_european_properties(p_category=>'agricultural',p_listed_locale=>$1,p_listed_packages=>$2::text[],p_listed_fallback=>$3,p_sort=>'price-asc'${extra})`, [locale, packagesFor(locale), false]);
  const expected = (locale, mode) => seeds.filter((seed) => listedIn({
    gated: true, sourceLocale: seed.rows.find(([c, m]) => c === 'hu' && !m) ? 'hu' : seed.rows.find(([, m]) => !m)[0],
    languagesWithText: seed.rows.map(([c]) => c), writtenLocales: [], translationPackage: seed.pkg, extraLocales: seed.extra, excludedLocales: seed.excluded,
  }, locale, cfg, LOCALES, mode)).map((seed) => seed.pid).sort();
  for (const mode of ['redirect', 'fallback']) {
    for (const locale of LOCALES) {
      const rows = (await db.query(`select id from search_european_properties(p_category=>'agricultural',p_listed_locale=>$1,p_listed_packages=>$2::text[],p_listed_fallback=>$3,p_limit=>100)`, [locale, packagesFor(locale), mode === 'fallback'])).rows.map((r) => r.id).filter((x) => String(x).startsWith('4')).sort();
      assert.deepEqual(rows, expected(locale, mode), `${mode}: ${locale}: the database lists exactly what listedIn() lists`);
    }
  }
  console.log('✓ 3.3 parity: for every one of 30 listings x 28 languages x both modes the database agrees with listedIn()');
  for (const locale of ['fr', 'ar', 'hu']) {
    const want = expected(locale, 'redirect');
    const seen = [];
    for (let page = 0; page * 7 < want.length + 7; page++) {
      const res = await call(locale, `,p_limit=>7,p_offset=>${page * 7}`);
      const ids = res.rows.map((r) => r.id).filter((x) => String(x).startsWith('4'));
      if (!res.rows.length) break;
      assert.equal(Number(res.rows[0].total_count) >= want.length, true);
      assert.equal(Number(res.rows[0].total_count), (await call(locale, ',p_limit=>100')).rows.length, `${locale}: the total counts the filtered set`);
      if (page * 7 + 7 < Number(res.rows[0].total_count)) assert.equal(res.rows.length, 7, `${locale}: page ${page} is full`);
      seen.push(...ids);
    }
    assert.equal(new Set(seen).size, seen.length, `${locale}: pages do not overlap`);
    assert.deepEqual([...seen].sort(), want, `${locale}: the pages together are the filtered set`);
  }
  console.log('✓ 3.3 pagination: pages are full except the last, totals are exact, pages never overlap');
  assert.equal((await db.query(`select count(*)::int n from search_european_properties(p_category=>'agricultural',p_limit=>100)`)).rows[0].n >= 30, true, 'no filter: every listing, as before');
  await db.exec(`grant select on property_translations to anon;set role anon;`);
  assert.ok((await db.query(`select count(*)::int n from search_european_properties(p_listed_locale=>'fr',p_listed_packages=>array['europe'])`)).rows[0].n >= 0, 'anonymous visitors can still run the search');
  await db.exec(`reset role;set test.uid='';set test.admin='true';delete from property_translations where property_id::text like '4%';delete from properties where id::text like '4%';alter table properties enable trigger user;`);
  console.log('✓ 3.3 the old 20-argument call still resolves, and anon can execute the function');
}
await db.close();
