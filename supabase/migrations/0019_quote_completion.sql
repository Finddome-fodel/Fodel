-- FODEL — quote completion (2026-10-14): wall material + "exclude adobe"
-- search, listing expiry and renewal, the monthly owner refresh, newsletter
-- sign-up, and a price history.
--
-- How to run this: Supabase → SQL Editor → New query → paste this whole file →
-- Run. It adds no enum values, so unlike 0005 and 0014 it is ONE step. Safe to
-- run twice: every statement is `if not exists`, `on conflict do nothing`, or
-- drops and recreates its own object.
--
-- Expiry uses the existing `archived` status, so no new enum value is needed:
-- the daily cron moves a published listing past its `expires_at` to
-- `archived` and stamps `expired_at`; a paid renewal moves it back.

/* ── Wall material: a taxonomy group, like condition and heating (0011) ──── */

alter table taxonomy_terms drop constraint if exists taxonomy_terms_group_key_check;
alter table taxonomy_terms add constraint taxonomy_terms_group_key_check check (group_key in (
  'category', 'feature', 'condition', 'heating', 'county', 'region', 'blog_category', 'wall'
));

-- Keys are the ones the valuation's "Falazat" question already stores
-- (src/data/valuation-questions.ts), plus "egyeb" and "nem-tudom".
insert into taxonomy_terms (group_key, key, labels, sort_order) values
  ('wall', 'tegla',     '{"hu":"Tégla","nl":"Baksteen","en":"Brick","de":"Ziegel"}', 10),
  ('wall', 'valyog',    '{"hu":"Vályog","nl":"Leem (adobe)","en":"Adobe (mud brick)","de":"Lehm (Adobe)"}', 20),
  ('wall', 'vegyes',    '{"hu":"Vegyes","nl":"Gemengd","en":"Mixed","de":"Gemischt"}', 30),
  ('wall', 'panel',     '{"hu":"Beton / panel","nl":"Beton / paneel","en":"Concrete / panel","de":"Beton / Platte"}', 40),
  ('wall', 'fa',        '{"hu":"Fa / könnyűszerkezet","nl":"Hout / lichte bouw","en":"Timber / light frame","de":"Holz / Leichtbau"}', 50),
  ('wall', 'ko',        '{"hu":"Kő","nl":"Steen","en":"Stone","de":"Stein"}', 60),
  ('wall', 'egyeb',     '{"hu":"Egyéb","nl":"Anders","en":"Other","de":"Sonstiges"}', 70),
  ('wall', 'nem-tudom', '{"hu":"Nem ismert","nl":"Onbekend","en":"Unknown","de":"Unbekannt"}', 80)
on conflict (group_key, key) do nothing;

alter table properties add column if not exists wall_group text not null default 'wall';
alter table properties add column if not exists wall_key text;
alter table properties drop constraint if exists properties_wall_group_check;
alter table properties add constraint properties_wall_group_check check (wall_group = 'wall');
alter table properties drop constraint if exists properties_wall_fk;
alter table properties add constraint properties_wall_fk foreign key (wall_group, wall_key)
  references taxonomy_terms (group_key, key) on update restrict on delete restrict;

/* ── Expiry, renewal and the monthly refresh ───────────────────────────── */
-- Every *_sent_at is claimed BEFORE the email goes out (a conditional update
-- that only succeeds while the column is still null), so a cron that runs
-- twice — or two runs that overlap — can never send the same email twice.

alter table properties add column if not exists expired_at timestamptz;
alter table properties add column if not exists expiry_first_reminder_sent_at timestamptz;
alter table properties add column if not exists expiry_last_reminder_sent_at timestamptz;
alter table properties add column if not exists expiry_notice_sent_at timestamptz;

alter table properties add column if not exists confirmed_at timestamptz;
alter table properties add column if not exists refresh_requested_at timestamptz;
alter table properties add column if not exists refresh_reminder_sent_at timestamptz;
alter table properties add column if not exists sold_at timestamptz;

create index if not exists properties_expires_idx on properties (expires_at) where status = 'published';

-- An owner must not be able to set these through the API. The 0014 trigger is
-- recreated with the new columns added to its protected list; everything it
-- protected before stays protected.
create or replace function protect_property_admin_columns() returns trigger as $$
begin
  if auth.uid() is null or is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.featured := false;
    new.homepage_featured := false;
    new.homepage_order := 99;
    new.editors_pick := false;
    new.editors_pick_order := 99;
    new.bargain := false;
    new.bargain_since := null;
    new.free_listing := false;
    new.refund_required := false;
    new.rejected_at := null;
    new.approved_at := null;
    new.approved_by := null;
    new.published_at := null;
    new.expires_at := null;
    new.expired_at := null;
    new.expiry_first_reminder_sent_at := null;
    new.expiry_last_reminder_sent_at := null;
    new.expiry_notice_sent_at := null;
    new.confirmed_at := null;
    new.refresh_requested_at := null;
    new.refresh_reminder_sent_at := null;
    new.sold_at := null;
    return new;
  end if;

  new.featured := old.featured;
  new.homepage_featured := old.homepage_featured;
  new.homepage_order := old.homepage_order;
  new.editors_pick := old.editors_pick;
  new.editors_pick_order := old.editors_pick_order;
  new.bargain := old.bargain;
  new.bargain_since := old.bargain_since;
  new.free_listing := old.free_listing;
  new.refund_required := old.refund_required;
  new.rejected_at := old.rejected_at;
  new.approved_at := old.approved_at;
  new.approved_by := old.approved_by;
  new.published_at := old.published_at;
  new.expires_at := old.expires_at;
  new.expired_at := old.expired_at;
  new.expiry_first_reminder_sent_at := old.expiry_first_reminder_sent_at;
  new.expiry_last_reminder_sent_at := old.expiry_last_reminder_sent_at;
  new.expiry_notice_sent_at := old.expiry_notice_sent_at;
  new.confirmed_at := old.confirmed_at;
  new.refresh_requested_at := old.refresh_requested_at;
  new.refresh_reminder_sent_at := old.refresh_reminder_sent_at;
  new.sold_at := old.sold_at;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

/* ── Price history ─────────────────────────────────────────────────────── */
-- Written by the server (service role) when an owner changes the price from
-- the monthly refresh link. Admins read it; nobody else.

create table if not exists property_price_history (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  old_eur integer,
  new_eur integer not null,
  old_huf integer,
  new_huf integer not null,
  source text not null default 'owner-refresh',
  changed_at timestamptz not null default now()
);
create index if not exists property_price_history_property_idx on property_price_history (property_id, changed_at desc);

alter table property_price_history enable row level security;
drop policy if exists property_price_history_admin_all on property_price_history;
create policy property_price_history_admin_all on property_price_history for all using (is_admin());

/* ── Public search: exclude adobe, never show an expired listing ───────── */
-- 0013's signature plus one argument. The old one is dropped first so a call
-- by name can never be ambiguous between two overloads.

drop function if exists search_properties(text,text,text,text,text,text,text,integer,integer,numeric,numeric,numeric,numeric,integer,numeric[],boolean,text,integer,integer);
drop function if exists search_properties(text,text,text,text,text,text,text,integer,integer,numeric,numeric,numeric,numeric,integer,numeric[],boolean,boolean,text,integer,integer);

create function search_properties(
  p_locale text default 'hu',
  p_query text default null,
  p_category text default null,
  p_country text default null,
  p_region text default null,
  p_county text default null,
  p_settlement text default null,
  p_price_min integer default null,
  p_price_max integer default null,
  p_floor_min numeric default null,
  p_floor_max numeric default null,
  p_plot_min numeric default null,
  p_plot_max numeric default null,
  p_bedrooms_min integer default null,
  p_bbox numeric[] default null,
  p_bargain boolean default null,
  p_exclude_adobe boolean default null,
  p_sort text default 'featured',
  p_limit integer default 24,
  p_offset integer default 0
) returns table (id uuid, total_count bigint)
language sql stable as $$
  select p.id, count(*) over() as total_count
  from properties p
  join lateral (
    select tr.* from property_translations tr
    where tr.property_id = p.id
      and tr.locale in (coalesce(p_locale,'hu')::locale_code, 'hu'::locale_code)
    order by (tr.locale = coalesce(p_locale,'hu')::locale_code) desc
    limit 1
  ) t on true
  where p.status = 'published'
    and (p.expires_at is null or p.expires_at > now())
    and (p_exclude_adobe is not true or p.wall_key is distinct from 'valyog')
    and (p_category is null or p.category = p_category)
    and (p_country is null or p.country = upper(p_country))
    and (p_region is null or p.region = p_region)
    and (p_county is null or p.county = p_county)
    and (p_settlement is null or p.settlement ilike '%' || p_settlement || '%')
    and (p_price_min is null or p.price_eur >= p_price_min)
    and (p_price_max is null or p.price_eur < p_price_max)
    and (p_floor_min is null or p.floor_m2 >= p_floor_min)
    and (p_floor_max is null or p.floor_m2 <= p_floor_max)
    and (p_plot_min is null or p.plot_m2 >= p_plot_min)
    and (p_plot_max is null or p.plot_m2 <= p_plot_max)
    and (p_bedrooms_min is null or p.bedrooms >= p_bedrooms_min)
    and (p_bargain is null or p.bargain = p_bargain)
    and (p_bbox is null or (p.lng between p_bbox[1] and p_bbox[3] and p.lat between p_bbox[2] and p_bbox[4]))
    and (
      p_query is null or btrim(p_query) = '' or
      p.ref ilike '%' || btrim(p_query) || '%' or
      p.settlement ilike '%' || btrim(p_query) || '%' or
      p.county ilike '%' || btrim(p_query) || '%' or
      p.region ilike '%' || btrim(p_query) || '%' or
      t.search_vector @@ websearch_to_tsquery(
        case t.locale
          when 'hu' then 'hungarian'::regconfig
          when 'nl' then 'dutch'::regconfig
          when 'de' then 'german'::regconfig
          when 'en' then 'english'::regconfig
          when 'fr' then 'french'::regconfig
          else 'simple'::regconfig
        end,
        p_query
      )
    )
  order by
    case when p_sort = 'price-asc' then p.price_eur end asc nulls last,
    case when p_sort = 'price-desc' then p.price_eur end desc nulls last,
    case when p_sort = 'area-desc' then p.floor_m2 end desc nulls last,
    case when p_sort = 'bargain' then p.bargain_since end desc nulls last,
    p.featured desc,
    p.editors_pick desc,
    p.published_at desc
  limit p_limit offset p_offset;
$$;

/* ── Newsletter ─────────────────────────────────────────────────────────── */
-- Double opt-in. Rows are written only by the server (service role) behind
-- /api/newsletter: RLS is on and there is deliberately no insert policy for
-- anon or authenticated, so nobody can write here with the public key.
-- Admins read and delete through the portal.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'hu' check (locale in ('hu', 'nl', 'en', 'de')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  source text,
  requested_at timestamptz not null default now(),
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  resend_contact_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists newsletter_subscribers_email_idx on newsletter_subscribers (lower(email));
create index if not exists newsletter_subscribers_status_idx on newsletter_subscribers (status, locale);

drop trigger if exists newsletter_subscribers_updated_at on newsletter_subscribers;
create trigger newsletter_subscribers_updated_at before update on newsletter_subscribers
  for each row execute function set_updated_at();

alter table newsletter_subscribers enable row level security;
drop policy if exists newsletter_subscribers_admin_read on newsletter_subscribers;
create policy newsletter_subscribers_admin_read on newsletter_subscribers for select using (is_admin());
drop policy if exists newsletter_subscribers_admin_delete on newsletter_subscribers;
create policy newsletter_subscribers_admin_delete on newsletter_subscribers for delete using (is_admin());

notify pgrst, 'reload schema';
