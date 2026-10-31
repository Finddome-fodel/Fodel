-- 0044 — The fixed "Ingyenes feltöltő link" (FINDDOME, October 2026).
--
-- Run by hand in the Supabase SQL editor, after 0043. Safe to run twice; changes
-- no existing row.
--
-- What it adds:
--   free_upload_link   one row (id = 1): the secret in the shared upload link, and a
--                      switch to turn the link off. An admin copies the same link as
--                      often as they like; "new link" replaces the secret so the old
--                      one stops working.
--
-- The page behind the link is public, so the server (service role) reads the row; an
-- admin reads and changes it from the portal. Nothing here is readable by `anon`.

create table if not exists public.free_upload_link (
  id smallint primary key default 1 check (id = 1),
  token text not null check (length(token) >= 20),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

alter table public.free_upload_link enable row level security;
drop policy if exists free_upload_link_admin on public.free_upload_link;
create policy free_upload_link_admin on public.free_upload_link
  for all to authenticated using (is_admin()) with check (is_admin());

grant select, insert, update, delete on public.free_upload_link to authenticated;
grant select, insert, update, delete on public.free_upload_link to service_role;
