-- 0056 — Pricing 2026: the term and value band of a package, and the daily EUR/HUF rate (FINDDOME, November 2026).
--
-- Run by hand in the Supabase SQL editor, AFTER 0055 has run on its own. Safe to run twice; one transaction; takes
-- a second. It changes no existing row and no price: old listings keep their package and simply have no term/band
-- recorded (the app reads their term from the older package, as before).
--
-- What it adds:
--   properties.package_months         how many months the listing's package was bought for (1-24). Set by a paid order
--                                     (the server) or an admin; the expiry date is derived from it at publication.
--   properties.price_tier_index       the value band the package was priced in (0 = lowest). Frozen at the order, so a
--   properties.price_tier_huf_bounds  later change of the listing price or of the matrix never re-tiers an upgrade or
--                                     a renewal. The bounds are a snapshot of the band edges at that time.
--   a trigger                         a seller's session cannot set or change these three, whatever it sends (same
--                                     shape as 0053's package guard): the server and admins can.
--   exchange_rate_snapshots           one row per ECB reference day: {"HUF": 385.12, "GBP": ...}, written daily by
--                                     /api/cron/fx. Public reference data: anyone can read it, only the server writes.
--
-- The site works before this is run: forint hints fall back to a live ECB fetch, and an order for a package records
-- its term and band in the order line (payments.line_items) as it always did.
--
-- Verification (also: select services -> 'pricingLive' from site_settings where id = 1;   -- true):
--   select column_name from information_schema.columns where table_name = 'properties' and column_name in ('package_months','price_tier_index','price_tier_huf_bounds');   -- 3 rows
--   select to_regclass('public.exchange_rate_snapshots');                                                                                                             -- exchange_rate_snapshots
--   select has_table_privilege('anon', 'public.exchange_rate_snapshots', 'select');                                                                                   -- true
begin;

-- 0055 must have run in its own run first: the new package values have to exist before anything can use them.
do $$
begin
  if not exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'listing_package' and e.enumlabel = 'world') then
    raise exception 'Futtassa le előbb a 0055-ös migrációt (külön futtatásban), utána ezt.';
  end if;
end $$;

alter table public.properties add column if not exists package_months smallint;
alter table public.properties add column if not exists price_tier_index smallint;
alter table public.properties add column if not exists price_tier_huf_bounds jsonb;

alter table public.properties drop constraint if exists properties_package_months_check;
alter table public.properties add constraint properties_package_months_check check (package_months is null or package_months between 1 and 24);
alter table public.properties drop constraint if exists properties_price_tier_index_check;
alter table public.properties add constraint properties_price_tier_index_check check (price_tier_index is null or price_tier_index between 0 and 20);

/* ── A seller cannot set the term or the band ──────────────────────────── */
-- The server (no auth.uid()) and admins are free to write; a seller's insert starts empty and an update keeps the stored values.

create or replace function public.protect_property_pricing() returns trigger as $$
begin
  if auth.uid() is null or is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.package_months := null;
    new.price_tier_index := null;
    new.price_tier_huf_bounds := null;
    return new;
  end if;
  new.package_months := old.package_months;
  new.price_tier_index := old.price_tier_index;
  new.price_tier_huf_bounds := old.price_tier_huf_bounds;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists properties_protect_pricing on public.properties;
create trigger properties_protect_pricing
  before insert or update on public.properties
  for each row execute function public.protect_property_pricing();

/* ── The daily rate ────────────────────────────────────────────────────── */

create table if not exists public.exchange_rate_snapshots (
  rate_date date primary key,
  source text not null default 'ECB',
  rates jsonb not null,
  fetched_at timestamptz not null default now(),
  constraint exchange_rate_snapshots_has_huf check ((rates ->> 'HUF') is not null and (rates ->> 'HUF')::numeric > 0)
);

alter table public.exchange_rate_snapshots enable row level security;

drop policy if exists exchange_rate_snapshots_read on public.exchange_rate_snapshots;
create policy exchange_rate_snapshots_read on public.exchange_rate_snapshots
  for select to anon, authenticated using (true);

-- Public reference data: everybody reads, only the server writes (no insert/update/delete for anon or authenticated).
grant select on public.exchange_rate_snapshots to anon;
grant select on public.exchange_rate_snapshots to authenticated;
grant select, insert, update, delete on public.exchange_rate_snapshots to service_role;

/* ── Switch the new packages on ────────────────────────────────────────── */
-- The app sells Basic, Europe and World only once this has run (site_settings.services.pricingLive); until then it
-- sells the two older packages exactly as before, so a deploy ahead of the migrations is safe.
do $$
begin
  if to_regclass('public.site_settings') is not null
     and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'services') then
    update public.site_settings
       set services = coalesce(services, '{}'::jsonb) || '{"pricingLive": true}'::jsonb
     where id = 1 and coalesce(services -> 'pricingLive', 'false'::jsonb) <> 'true'::jsonb;
  end if;
end $$;

notify pgrst, 'reload schema';

commit;
