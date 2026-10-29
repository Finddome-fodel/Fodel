-- 0040: Rendszerlevelek — the wording of the system emails, editable by admins.
--
-- Run by hand in the Supabase SQL editor, any time after 0039. Safe to run twice.
-- The site works without it: until this table exists every system email goes out
-- with its built-in wording, exactly as before (src/lib/email/system-texts.ts).
--
-- One row per system email and language, holding only the fields an admin has
-- changed: {"subject": "…", "cta": "…"}. A field that is not in the row keeps its
-- built-in wording, so deleting the row (or one field) is "restore the default",
-- and a language nobody touched never differs from the code. Placeholders such as
-- {{title}} or {{ref}} stand for the listing's title or reference.
--
-- Named mail_system_texts next to the other mail_* tables (0038). Admin-only: RLS
-- through is_admin(), no anon grants.

create table if not exists mail_system_texts (
  key text not null,
  locale text not null,
  fields jsonb not null default '{}'::jsonb,
  updated_by uuid references profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (key, locale),
  check (jsonb_typeof(fields) = 'object')
);

drop trigger if exists mail_system_texts_updated_at on mail_system_texts;
create trigger mail_system_texts_updated_at before update on mail_system_texts
  for each row execute function set_updated_at();

alter table mail_system_texts enable row level security;
drop policy if exists mail_system_texts_admin on mail_system_texts;
create policy mail_system_texts_admin on mail_system_texts
  for all to authenticated using (is_admin()) with check (is_admin());

grant select, insert, update, delete on public.mail_system_texts to authenticated;
grant select, insert, update, delete on public.mail_system_texts to service_role;
