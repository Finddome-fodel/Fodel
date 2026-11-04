-- 0053 — Translation packages: Go / Európa / World, single languages, and switching a language off (FINDDOME, November 2026).
--
-- Run by hand in the Supabase SQL editor, after 0052. Safe to run twice; one transaction. It changes no listing
-- text, no price and no translation: it only records, for every listing, what languages it is entitled to.
--
-- What it adds to `properties`:
--   translation_package   'go' (free: the original language, English and German), 'europe' or 'world'. Set only by
--                         a paid order (the server) or an admin, never by a seller.
--   extra_locales         single languages bought on top of the package. Same rule: server or admin only.
--   excluded_locales      languages switched off for this listing (0052 added the column; repeated here so this
--                         file stands on its own). A seller may change it at any time through the app.
--   a check               English can never be excluded: it is the fallback text of every other language.
--   a trigger             a seller's session cannot set or change translation_package or extra_locales, whatever
--                         it sends (an insert gets 'go' and none; an update keeps the stored values).
--
-- The backfill gives every existing listing 'go' plus the languages it already has: every language with a text row
-- (other than the original, English and German, which Go covers) and every language of a paid translation job that
-- was not cancelled or declined. Nobody loses a language they already have. It only fills listings that still have
-- no extra languages, so a listing an admin has already edited is left alone, and running it again changes nothing
-- unless a listing gained text in a new language in between (which is published today anyway).
--
-- The site works before this is run: it keeps serving every language as it always did until the columns exist.
-- After running: select translation_package, count(*) from properties group by 1; shows every listing on 'go' (or
-- the package it paid for later). No new table, so no new grants.
begin;

alter table properties add column if not exists translation_package text not null default 'go';
alter table properties drop constraint if exists properties_translation_package_check;
alter table properties add constraint properties_translation_package_check check (translation_package in ('go', 'europe', 'world'));

alter table properties add column if not exists extra_locales locale_code[] not null default '{}';
alter table properties add column if not exists excluded_locales locale_code[] not null default '{}';

alter table properties drop constraint if exists properties_excluded_locales_no_en;
alter table properties add constraint properties_excluded_locales_no_en check (not ('en' = any (excluded_locales)));

/* ── A seller cannot grant themselves languages ────────────────────────── */
-- Same shape as 0045's free-approval guard: the server (no auth.uid()) and admins are free to write.

create or replace function public.protect_property_translation_package() returns trigger as $$
begin
  if auth.uid() is null or is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.translation_package := 'go';
    new.extra_locales := '{}';
    return new;
  end if;
  new.translation_package := old.translation_package;
  new.extra_locales := old.extra_locales;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists properties_protect_translation_package on public.properties;
create trigger properties_protect_translation_package
  before insert or update on public.properties
  for each row execute function public.protect_property_translation_package();

/* ── Nobody loses a language they already have ─────────────────────────── */

update properties p
set extra_locales = coalesce((
  select array_agg(distinct l.locale order by l.locale)
  from (
    -- Languages with a text of their own...
    select t.locale
    from property_translations t
    where t.property_id = p.id
      and (btrim(coalesce(t.title, '')) <> '' or btrim(coalesce(t.description, '')) <> '')
    union
    -- ...and languages somebody paid for.
    select j.locale
    from translation_jobs j
    where j.property_id = p.id
      and j.origin in ('upload_paid', 'after_publish_paid', 'package')
      and j.status not in ('cancelled', 'declined')
  ) l
  where l.locale not in ('en', 'de')
    -- the original language: Hungarian when a person wrote it, otherwise the first language a person wrote
    and l.locale <> coalesce(
      (select 'hu'::locale_code from property_translations h where h.property_id = p.id and h.locale = 'hu' and not h.machine and (btrim(coalesce(h.title, '')) <> '' or btrim(coalesce(h.description, '')) <> '')),
      (select o.locale from property_translations o where o.property_id = p.id and not o.machine and (btrim(coalesce(o.title, '')) <> '' or btrim(coalesce(o.description, '')) <> '') order by o.locale limit 1),
      'hu'::locale_code
    )
), '{}')
where p.extra_locales = '{}' and p.translation_package = 'go';

notify pgrst, 'reload schema';

commit;
