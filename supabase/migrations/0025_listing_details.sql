-- 0025: the property facts the old FODEL upload form asked for
--
-- Run by hand in the Supabase SQL editor, after 0024, BEFORE deploying the code
-- that adds them. Safe to run twice; one transaction.
--
-- Adds rooms, floors, kitchens, toilets, cellar, utilities, parking, the setting
-- and extra buildings (all in one `details` object), the street address, and
-- the private "where did you hear about us?" answer.
-- The street address and postcode are PRIVATE (property_private, owner and
-- admins only). They are copied to the public listing row only while the owner
-- has ticked "show the address in the ad": public_address / public_postal_code
-- are null otherwise, so nothing is public by accident.
--
-- save_listing_editor() is replaced with the same body as in 0022 plus these
-- columns. Nothing else about it changes.
begin;

alter table properties add column if not exists details jsonb not null default '{}'::jsonb;
alter table properties add column if not exists public_address text;
alter table properties add column if not exists public_postal_code text;
alter table properties drop constraint if exists properties_details_object;
alter table properties add constraint properties_details_object check (jsonb_typeof(details)='object');
alter table properties drop constraint if exists properties_public_address_length;
alter table properties add constraint properties_public_address_length check (char_length(public_address)<=200 and char_length(public_postal_code)<=20);

alter table property_private add column if not exists street text not null default '';
alter table property_private add column if not exists postal_code text not null default '';
-- "Where did you hear about us?", asked once in the guided setup. Private; owner and admins only.
alter table property_private add column if not exists heard_from text not null default '';
alter table property_private drop constraint if exists property_private_address_length;
alter table property_private add constraint property_private_address_length check (char_length(street)<=200 and char_length(postal_code)<=20 and char_length(heard_from)<=40);

create or replace function save_listing_editor(p_id uuid,p_patch jsonb,p_private jsonb default null,p_translations jsonb default null)
returns void language plpgsql security invoker set search_path=public as $$
declare current_row properties; n properties; point double precision[]; tr jsonb; allowed_patch jsonb;
begin
 select * into current_row from properties where id=p_id for update;
 if not found or not(is_admin() or (current_row.owner_id=auth.uid() and current_row.status in ('draft','changes_requested'))) then raise exception 'not-editable'; end if;
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into allowed_patch from jsonb_each(p_patch)
 where key=any(array['requested_extras','location_confirmed','category','property_group','property_subtype','country','settlement','county','region','precision','price_eur','price_huf','price_asof','price_negotiable','original_price','original_currency','exchange_rate','exchange_source','price_calculated_at','floor_m2','building_m2','plot_m2','bedrooms','bathrooms','year_built','year_built_unknown','renovated_in','epc_class','condition_key','heating_key','wall_key','features','video_url','seller_contact_visible','seller_name','seller_phone','seller_speaks','reserved','topic_highlight_requested','details','public_address','public_postal_code']);
 if is_admin() then allowed_patch=allowed_patch || (p_patch - array(select key from jsonb_each(p_patch) where key not in ('featured','homepage_featured','topic_featured'))); end if;
 n=jsonb_populate_record(current_row,allowed_patch);
 if p_private is not null then
   insert into property_private(property_id,lat,lng,internal_note,street,postal_code,heard_from) values(p_id,coalesce((p_private->>'lat')::double precision,(select s.lat from property_private s where s.property_id=p_id),current_row.lat),coalesce((p_private->>'lng')::double precision,(select s.lng from property_private s where s.property_id=p_id),current_row.lng),coalesce(p_private->>'internal_note',''),coalesce(p_private->>'street',''),coalesce(p_private->>'postal_code',''),coalesce(p_private->>'heard_from',''))
   on conflict(property_id) do update set lat=excluded.lat,lng=excluded.lng,internal_note=case when p_private ? 'internal_note' then excluded.internal_note else property_private.internal_note end,
     street=case when p_private ? 'street' then excluded.street else property_private.street end,
     postal_code=case when p_private ? 'postal_code' then excluded.postal_code else property_private.postal_code end,
     heard_from=case when p_private ? 'heard_from' then excluded.heard_from else property_private.heard_from end,updated_at=now();
 end if;
 select case when n.precision='exact' then array[s.lat,s.lng] else public_listing_point(p_id,s.lat,s.lng) end into point from property_private s where s.property_id=p_id;
 if point is null then raise exception 'location-required'; end if;
 update properties set requested_extras=n.requested_extras,location_confirmed=n.location_confirmed,category=n.category,property_group=n.property_group,property_subtype=n.property_subtype,country=n.country,settlement=n.settlement,county=n.county,region=n.region,
  lat=point[1],lng=point[2],precision=n.precision,public_location_safe=true,
  price_eur=n.price_eur,price_huf=n.price_huf,price_asof=n.price_asof,price_negotiable=n.price_negotiable,
  original_price=n.original_price,original_currency=n.original_currency,exchange_rate=n.exchange_rate,exchange_source=n.exchange_source,price_calculated_at=n.price_calculated_at,
  floor_m2=n.floor_m2,building_m2=n.building_m2,plot_m2=n.plot_m2,bedrooms=n.bedrooms,bathrooms=n.bathrooms,year_built=n.year_built,year_built_unknown=n.year_built_unknown,
  renovated_in=n.renovated_in,epc_class=n.epc_class,condition_key=n.condition_key,heating_key=n.heating_key,wall_key=n.wall_key,features=n.features,video_url=n.video_url,
  seller_contact_visible=n.seller_contact_visible,seller_name=n.seller_name,seller_phone=n.seller_phone,seller_speaks=n.seller_speaks,reserved=n.reserved,
  featured=n.featured,homepage_featured=n.homepage_featured,topic_featured=n.topic_featured,topic_highlight_requested=n.topic_highlight_requested,
  details=n.details,public_address=n.public_address,public_postal_code=n.public_postal_code where id=p_id;
 if p_patch ? 'requested_extras' or p_patch ? 'topic_highlight_requested' then perform sync_listing_promotion_requests(p_id);end if;
 if p_patch ? 'original_price' and (current_row.original_price is distinct from n.original_price or current_row.original_currency is distinct from n.original_currency or current_row.price_asof is distinct from n.price_asof) then
  insert into property_price_history(property_id,amount,currency,eur,rate,rate_date,source,calculated_at) values(p_id,n.original_price,n.original_currency,n.price_eur,n.exchange_rate,n.price_asof,n.exchange_source,n.price_calculated_at);
 end if;
 for tr in select value from jsonb_array_elements(coalesce(p_translations,'[]'::jsonb)) loop
  insert into property_translations(property_id,locale,title,description,body) values(p_id,(tr->>'locale')::locale_code,tr->>'title',tr->>'description',coalesce(tr->>'body',''))
  on conflict(property_id,locale) do update set title=excluded.title,description=excluded.description,body=excluded.body;
 end loop;
end;
$$;

revoke all on function save_listing_editor(uuid,jsonb,jsonb,jsonb) from public,anon;
grant execute on function save_listing_editor(uuid,jsonb,jsonb,jsonb) to authenticated;

commit;
