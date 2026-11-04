-- 0053 — Translation packages: Basic / Europe / World, legacy single languages, and switching a language off
-- (FINDDOME, November 2026).
--
-- Run by hand in the Supabase SQL editor, after 0052. Safe to run twice; one transaction. It changes no listing
-- text, no price and no translation: it only records, for every listing, what languages it is entitled to.
--
-- What it adds to `properties`:
--   translation_package   'basic' (the original language, English and German), 'europe' or 'world'. Set only by
--                         a paid order (the server) or an admin, never by a seller. An older version of this file
--                         called the first one 'go'; those rows are converted to 'basic' here.
--   extra_locales         languages a listing already holds on top of its package (single languages bought before
--                         November 2026 stay; they are no longer sold). Same rule: server or admin only.
--   excluded_locales      languages switched off for this listing (0052 added the column; repeated here so this
--                         file stands on its own). A seller may change it at any time through the app.
--   a check               English can never be excluded: it is the fallback text of every other language.
--   a trigger             a seller's session cannot set or change translation_package or extra_locales, whatever
--                         it sends (an insert gets 'basic' and none; an update keeps the stored values).
--
-- The backfill gives a listing the languages it already has: every language with a text row (other than the
-- original, English and German, which Basic covers) and every language of a paid translation job that was not
-- cancelled or declined. Nobody loses a language they already have. It touches ONLY listings that gain at least one
-- language, so every other row keeps its updated_at and no trigger fires on it; it only fills listings that still
-- have no extra languages, so a listing an admin has already edited is left alone, and running it again changes
-- nothing unless a listing gained text in a new language in between (which is published today anyway).
--
-- The site works before this is run: it keeps serving every language as it always did until the columns exist.
-- After running: select translation_package, count(*) from properties group by 1; shows every listing on 'basic'
-- (or the package it paid for later); select count(*) from properties where translation_package = 'go'; shows 0.
-- No new table, so no new grants.
begin;

alter table properties add column if not exists translation_package text not null default 'basic';
-- The check goes first, so the old name can be converted, then comes back with the new names.
alter table properties drop constraint if exists properties_translation_package_check;
alter table properties alter column translation_package set default 'basic';
update properties set translation_package = 'basic' where translation_package = 'go';
alter table properties add constraint properties_translation_package_check check (translation_package in ('basic', 'europe', 'world'));

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
    new.translation_package := 'basic';
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

with computed as (
  select p.id, array_agg(distinct l.locale order by l.locale) as locales
  from properties p
  cross join lateral (
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
  where p.extra_locales = '{}' and p.translation_package = 'basic'
    and l.locale not in ('en', 'de')
    -- the original language: Hungarian when a person wrote it, otherwise the first language a person wrote
    and l.locale <> coalesce(
      (select 'hu'::locale_code from property_translations h where h.property_id = p.id and h.locale = 'hu' and not h.machine and (btrim(coalesce(h.title, '')) <> '' or btrim(coalesce(h.description, '')) <> '')),
      (select o.locale from property_translations o where o.property_id = p.id and not o.machine and (btrim(coalesce(o.title, '')) <> '' or btrim(coalesce(o.description, '')) <> '') order by o.locale limit 1),
      'hu'::locale_code
    )
  group by p.id
)
update properties p
set extra_locales = c.locales
from computed c
where c.id = p.id and p.extra_locales = '{}' and p.translation_package = 'basic' and cardinality(c.locales) > 0;

notify pgrst, 'reload schema';

commit;
