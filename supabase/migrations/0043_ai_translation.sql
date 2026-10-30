-- 0043 — AI translation of listings (FINDDOME, October 2026).
--
-- Run by hand in the Supabase SQL editor, after 0042. Safe to run twice; one
-- transaction; changes no existing listing and no existing translation.
--
-- What it adds:
--   translation_jobs    one row per listing + target language: asked for, approved,
--                       queued, running, done or failed. The server (never an owner's
--                       browser) writes them; the owner may read their own listing's.
--   property_translations gets four columns that say a row was produced by the AI:
--     machine           true while the text is exactly what the AI wrote
--     translated_from   the language it was translated from
--     translated_at     when
--     source_hash       fingerprint of the source text at that moment, so the editor
--                       can say "the Hungarian text has changed since" later
--   claim_translation_jobs(n)   hands out queued jobs to one worker at a time
--                       (`for update skip locked`), like claim_mail_send_recipients.
--   save_listing_editor         restated from 0042 with ONE change: saving a translation
--                       whose text actually changed clears the machine flag (a person
--                       now owns that text); saving it unchanged leaves the flag alone.
--
-- Nothing here is public: no anon grant on translation_jobs. The AI itself stays off
-- until AI_ENABLED=true and OPENAI_API_KEY are set in Vercel.
begin;

/* ── Which translation rows came from the AI ───────────────────────────── */

alter table property_translations add column if not exists machine boolean not null default false;
alter table property_translations add column if not exists translated_from locale_code;
alter table property_translations add column if not exists translated_at timestamptz;
alter table property_translations add column if not exists source_hash text;

/* ── Jobs ───────────────────────────────────────────────────────────────── */
-- origin  upload_paid        paid with the listing's first order, runs after payment
--         after_publish_paid bought later from the live listing
--         admin              an admin translated it for free
--         free               a free-link owner asked; an admin approves first
-- status  requested -> queued -> running -> done | failed
--         declined (admin said no), cancelled (withdrawn before it ran)

create table if not exists translation_jobs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  locale locale_code not null,
  source_locale locale_code,
  origin text not null check (origin in ('upload_paid', 'after_publish_paid', 'admin', 'free')),
  status text not null default 'queued'
    check (status in ('requested', 'queued', 'running', 'done', 'failed', 'declined', 'cancelled')),
  payment_id uuid references payments (id) on delete set null,
  requested_by uuid references profiles (id) on delete set null,
  approved_by uuid references profiles (id) on delete set null,
  -- An admin chose to replace a person's text in this language.
  overwrite boolean not null default false,
  source_hash text,
  attempts integer not null default 0,
  last_error text,
  model text,
  tokens_in integer,
  tokens_out integer,
  -- Millionths of a euro: a translation costs a fraction of a cent.
  estimated_cost_micro_eur integer,
  cost_micro_eur integer,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

-- A listing + language can have only one live job: a double click, a retried
-- webhook and two workers all collide here instead of translating twice.
create unique index if not exists translation_jobs_one_live_per_locale
  on translation_jobs (property_id, locale) where status in ('requested', 'queued', 'running');
create index if not exists translation_jobs_queue_idx on translation_jobs (status, created_at)
  where status in ('queued', 'running');
create index if not exists translation_jobs_property_idx on translation_jobs (property_id);
create index if not exists translation_jobs_requested_idx on translation_jobs (created_at)
  where status = 'requested';
create index if not exists translation_jobs_finished_idx on translation_jobs (finished_at)
  where finished_at is not null;

drop trigger if exists translation_jobs_updated_at on translation_jobs;
create trigger translation_jobs_updated_at before update on translation_jobs
  for each row execute function set_updated_at();

-- The atomic claim. A job stuck in 'running' for 6 minutes belonged to a worker
-- the platform killed mid-call and is handed out again, up to 3 attempts in all;
-- one that has used its attempts is closed as failed instead of looping forever.
create or replace function claim_translation_jobs(p_limit integer default 4)
returns setof translation_jobs
language plpgsql
as $$
begin
  update translation_jobs
  set status = 'failed', finished_at = now(), last_error = coalesce(last_error, 'A feldolgozás megszakadt.')
  where status = 'running' and claimed_at < now() - interval '6 minutes' and attempts >= 3;

  return query
  update translation_jobs
  set status = 'running',
      claimed_at = now(),
      started_at = coalesce(started_at, now()),
      attempts = attempts + 1
  where id in (
    select id from translation_jobs
    where (status = 'queued' or (status = 'running' and claimed_at < now() - interval '6 minutes'))
      and attempts < 3
    order by created_at
    limit greatest(p_limit, 0)
    for update skip locked
  )
  returning *;
end;
$$;
revoke all on function claim_translation_jobs(integer) from public, anon, authenticated;
grant execute on function claim_translation_jobs(integer) to service_role;

/* ── Access: admins everything, an owner may read their own listing's jobs ── */

alter table translation_jobs enable row level security;
drop policy if exists translation_jobs_admin on translation_jobs;
create policy translation_jobs_admin on translation_jobs
  for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists translation_jobs_owner_read on translation_jobs;
create policy translation_jobs_owner_read on translation_jobs
  for select to authenticated using (
    exists (select 1 from properties p where p.id = translation_jobs.property_id and p.owner_id = auth.uid())
  );
grant select, insert, update, delete on public.translation_jobs to authenticated;
grant select, insert, update, delete on public.translation_jobs to service_role;

/* ── The editor's save: a person's edit takes the text back from the AI ──── */
-- Same body as 0042. The one difference is the translations loop at the end.

create or replace function save_listing_editor(p_id uuid,p_patch jsonb,p_private jsonb default null,p_translations jsonb default null)
returns void language plpgsql security invoker set search_path=public as $$
declare current_row properties; n properties; point double precision[]; tr jsonb; allowed_patch jsonb;
begin
 select * into current_row from properties where id=p_id for update;
 if not found or not(is_admin() or (current_row.owner_id=auth.uid() and current_row.status in ('draft','changes_requested'))) then raise exception 'not-editable'; end if;
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into allowed_patch from jsonb_each(p_patch)
 where key=any(array['requested_extras','location_confirmed','category','property_group','property_subtype','country','settlement','county','region','precision','price_eur','price_huf','price_asof','price_negotiable','original_price','original_currency','exchange_rate','exchange_source','price_calculated_at','floor_m2','building_m2','plot_m2','bedrooms','bathrooms','year_built','year_built_unknown','renovated_in','epc_class','condition_key','heating_key','wall_key','features','video_url','seller_contact_visible','seller_name','seller_phone','seller_speaks','reserved','topic_highlight_requested','details','public_address','public_postal_code']);
 if is_admin() then allowed_patch=allowed_patch || (p_patch - array(select key from jsonb_each(p_patch) where key not in ('featured','homepage_featured','topic_featured','public_contact','public_contact_name','public_contact_phone'))); end if;
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
  details=n.details,public_address=n.public_address,public_postal_code=n.public_postal_code,
  public_contact=n.public_contact,public_contact_name=n.public_contact_name,public_contact_phone=n.public_contact_phone where id=p_id;
 if p_patch ? 'requested_extras' or p_patch ? 'topic_highlight_requested' then perform sync_listing_promotion_requests(p_id);end if;
 if p_patch ? 'original_price' and (current_row.original_price is distinct from n.original_price or current_row.original_currency is distinct from n.original_currency or current_row.price_asof is distinct from n.price_asof) then
  insert into property_price_history(property_id,amount,currency,eur,rate,rate_date,source,calculated_at) values(p_id,n.original_price,n.original_currency,n.price_eur,n.exchange_rate,n.price_asof,n.exchange_source,n.price_calculated_at);
 end if;
 for tr in select value from jsonb_array_elements(coalesce(p_translations,'[]'::jsonb)) loop
  insert into property_translations(property_id,locale,title,description,body) values(p_id,(tr->>'locale')::locale_code,tr->>'title',tr->>'description',coalesce(tr->>'body',''))
  on conflict(property_id,locale) do update set title=excluded.title,description=excluded.description,body=excluded.body,
   -- The editor posts every language it shows, AI rows included. Only a real change hands the text to a person.
   machine=case when property_translations.title is distinct from excluded.title or property_translations.description is distinct from excluded.description or property_translations.body is distinct from excluded.body then false else property_translations.machine end,
   translated_from=case when property_translations.title is distinct from excluded.title or property_translations.description is distinct from excluded.description or property_translations.body is distinct from excluded.body then null else property_translations.translated_from end,
   translated_at=case when property_translations.title is distinct from excluded.title or property_translations.description is distinct from excluded.description or property_translations.body is distinct from excluded.body then null else property_translations.translated_at end,
   source_hash=case when property_translations.title is distinct from excluded.title or property_translations.description is distinct from excluded.description or property_translations.body is distinct from excluded.body then null else property_translations.source_hash end;
 end loop;
end;
$$;

revoke all on function save_listing_editor(uuid,jsonb,jsonb,jsonb) from public,anon;
grant execute on function save_listing_editor(uuid,jsonb,jsonb,jsonb) to authenticated;

notify pgrst, 'reload schema';

commit;
