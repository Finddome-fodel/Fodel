-- 0045 — "Jóváhagyás ingyen": an admin publishes a paid listing free of charge
-- (FINDDOME, November 2026).
--
-- Run by hand in the Supabase SQL editor, after 0044. Safe to run twice; changes
-- no existing row. Until it has run the review page simply does not offer the
-- free approval and the server refuses it with a clear message — everything
-- else keeps working exactly as before.
--
-- What it adds:
--   properties.free_approved_at / free_approved_by
--       who let this listing through free of charge, and when. Only an admin or
--       the server may set them: an owner's own update keeps the old values
--       (trigger below). The admin's optional internal note is NOT stored here —
--       a published listing's row is publicly readable — but in the admin-only
--       activity log (activity_events, kind 'listing.approve_free').
--   payments.waived_at / waived_by
--       set on an open díjbekérő that a free approval made void. The order itself
--       becomes 'cancelled', so every total, export and reminder already treats it
--       as "nothing owed"; these two columns say why it was cancelled.

alter table public.properties add column if not exists free_approved_at timestamptz;
alter table public.properties add column if not exists free_approved_by uuid references public.profiles (id) on delete set null;

alter table public.payments add column if not exists waived_at timestamptz;
alter table public.payments add column if not exists waived_by uuid references public.profiles (id) on delete set null;

-- The owner may edit their draft, but must never be able to mark it as approved
-- for free. A separate, small trigger so protect_property_admin_columns() (0019)
-- stays exactly as it is.
create or replace function public.protect_property_free_approval() returns trigger as $$
begin
  if auth.uid() is null or is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.free_approved_at := null;
    new.free_approved_by := null;
    return new;
  end if;
  new.free_approved_at := old.free_approved_at;
  new.free_approved_by := old.free_approved_by;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists properties_protect_free_approval on public.properties;
create trigger properties_protect_free_approval
  before insert or update on public.properties
  for each row execute function public.protect_property_free_approval();
