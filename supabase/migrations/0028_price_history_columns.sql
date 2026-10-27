-- 0028 — property_price_history: reconcile the two shapes the table has been
-- created with, so saving a listing with a price works again.
--
-- 0019 created the table with old_eur / new_eur / old_huf / new_huf / changed_at
-- (new_eur and new_huf NOT NULL). 0022 meant to replace that shape with amount /
-- currency / eur / rate / rate_date / calculated_at, but it only says "create
-- table if not exists", so on a database that already had the 0019 table it did
-- nothing. save_listing_editor (0022, 0025) then inserts into columns that are
-- not there, the RPC rolls back, and the wizard reports "save-failed" whenever a
-- price is entered.
--
-- Idempotent: safe to run on a database with either shape, and to run twice.
-- Run it by hand in the Supabase SQL editor — deploys do not run migrations.

begin;

create table if not exists property_price_history (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  source text not null default 'owner-refresh'
);

-- Current shape (written by save_listing_editor).
alter table property_price_history add column if not exists amount numeric;
alter table property_price_history add column if not exists currency text;
alter table property_price_history add column if not exists eur numeric;
alter table property_price_history add column if not exists rate numeric;
alter table property_price_history add column if not exists rate_date date;
alter table property_price_history add column if not exists calculated_at timestamptz default now();

-- Legacy shape (still written by the owner "new price" link in listing/[action].astro).
alter table property_price_history add column if not exists old_eur integer;
alter table property_price_history add column if not exists new_eur integer;
alter table property_price_history add column if not exists old_huf integer;
alter table property_price_history add column if not exists new_huf integer;
alter table property_price_history add column if not exists changed_at timestamptz default now();

-- Neither writer fills the other's columns, so nothing but the key may be required.
alter table property_price_history alter column amount drop not null;
alter table property_price_history alter column currency drop not null;
alter table property_price_history alter column eur drop not null;
alter table property_price_history alter column rate drop not null;
alter table property_price_history alter column rate_date drop not null;
alter table property_price_history alter column new_eur drop not null;
alter table property_price_history alter column new_huf drop not null;
alter table property_price_history alter column calculated_at set default now();
alter table property_price_history alter column changed_at set default now();
alter table property_price_history alter column source set default 'owner-refresh';

create index if not exists property_price_history_property_idx
  on property_price_history (property_id, coalesce(calculated_at, changed_at) desc);

-- Access, as 0019 + 0022 intended (re-stated because 0022's table never ran).
alter table property_price_history enable row level security;
revoke all on property_price_history from anon;
grant select, insert on property_price_history to authenticated;
drop policy if exists property_price_history_admin_all on property_price_history;
create policy property_price_history_admin_all on property_price_history for all using (is_admin());
drop policy if exists property_price_history_insert on property_price_history;
create policy property_price_history_insert on property_price_history for insert to authenticated
  with check (is_admin() or exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid() and p.status in ('draft', 'changes_requested')));
drop policy if exists property_price_history_read on property_price_history;
create policy property_price_history_read on property_price_history for select to authenticated
  using (is_admin() or exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid()));

commit;
