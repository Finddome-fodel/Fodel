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


-- 7. Search lists only what is published in the visitor's language (fix 3.3) ----------------------------------------------
--
-- The rule "this listing appears in this language's lists" (src/lib/listing-languages.ts `listedIn`) used to run in the app
-- AFTER the database had cut the page, so a page could come back short and the total was only corrected for the page in hand.
-- It is now part of the query: three optional parameters, the app passes the language and the packages that cover it (the
-- packages are admin-editable, so the app works out the list); `total_count` is then counted over the filtered set.
--
--   p_listed_locale    the visitor's language, or null for no filter (what every older caller sends)
--   p_listed_packages  the package ids whose languages include it (from Csomagok → Csomagok tartalma)
--   p_listed_fallback  true when UNPURCHASED_LISTING_LOCALES=fallback: such listings stay listed, noindex, with fallback text
--
-- A listing is listed in a language when it is written in it (its original), or it is English (always), or the language is
-- bought (its package covers it, or it is a single language) and not switched off, and the listing has a text row for it.
-- (In fallback mode only a switched-off language, or a bought one that has no text yet, is left out.)
-- The old 20-argument signature is dropped first: with defaults on the new one a call would otherwise be ambiguous.
-- Also: a search for the new type "Birtok" (rural-estate) still finds a listing that has not been moved off the old key yet
-- (0057), so searching works before and after that run.
drop function if exists search_european_properties(
  text, text, text, text, text, text, text, numeric, numeric, numeric, numeric, numeric, numeric, integer, numeric[], text, boolean, text, integer, integer
);

create or replace function search_european_properties(
  p_locale text default 'hu',
  p_query text default null,
  p_category text default null,
  p_country text default null,
  p_region text default null,
  p_county text default null,
  p_settlement text default null,
  p_price_min numeric default null,
  p_price_max numeric default null,
  p_floor_min numeric default null,
  p_floor_max numeric default null,
  p_plot_min numeric default null,
  p_plot_max numeric default null,
  p_bedrooms_min integer default null,
  p_bbox numeric[] default null,
  p_subtype text default null,
  p_exclude_adobe boolean default null,
  p_sort text default 'featured',
  p_limit integer default 24,
  p_offset integer default 0,
  p_listed_locale text default null,
  p_listed_packages text[] default null,
  p_listed_fallback boolean default false
) returns table (id uuid, total_count bigint)
language sql stable as $$
  select p.id, count(*) over() as total_count
  from properties p
  left join lateral (
    select tr.* from property_translations tr
    where tr.property_id = p.id and nullif(btrim(tr.description),'') is not null
    order by (tr.locale = coalesce(p_locale,'hu')::locale_code) desc, (tr.locale='nl') desc, (tr.locale='hu') desc
    limit 1
  ) t on true
  where p.status = 'published'
    and (p.expires_at is null or p.expires_at > now())
    and (p_exclude_adobe is not true or (p.wall_key is distinct from 'valyog' and not coalesce(p.details->'walls', '[]'::jsonb) ? 'valyog'))
    and (p_category is null or p.category = p_category or p.property_group = p_category)
    and (p_subtype is null or p.property_subtype = p_subtype or (p_subtype = 'rural-estate' and p.property_subtype = 'agricultural-estate'))
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
    and (p_bedrooms_min is null or coalesce(case when jsonb_typeof(p.details->'rooms') = 'number' then (p.details->>'rooms')::numeric end, p.bedrooms) >= p_bedrooms_min)
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
    -- Listed in the visitor's language (mirrors listedIn() in src/lib/listing-languages.ts).
    and (
      p_listed_locale is null
      or p_listed_locale = 'en'
      -- its original language: Hungarian when a person wrote it, otherwise the first language a person wrote
      or p_listed_locale = coalesce(
           (select o.locale::text from property_translations o
             where o.property_id = p.id and not o.machine and (btrim(coalesce(o.title, '')) <> '' or btrim(coalesce(o.description, '')) <> '')
             order by (o.locale = 'hu') desc, o.locale limit 1),
           'hu')
      or (
        -- bought: the package covers it, or it is a single language
        (coalesce(p.translation_package, 'basic') = any (coalesce(p_listed_packages, '{}'::text[])) or p_listed_locale = any (coalesce(p.extra_locales, '{}')::text[]))
        and not (p_listed_locale = any (coalesce(p.excluded_locales, '{}')::text[]))
        and exists (
          select 1 from property_translations x
           where x.property_id = p.id and x.locale::text = p_listed_locale
             and (x.title <> 'Új hirdetés' or btrim(coalesce(x.description, '')) <> '' or btrim(coalesce(x.body, '')) <> '')
        )
      )
      or (
        -- fallback mode keeps a language nobody bought; it still drops a switched-off one and a bought one with no text yet
        coalesce(p_listed_fallback, false)
        and not (p_listed_locale = any (coalesce(p.excluded_locales, '{}')::text[]))
        and not (
          (coalesce(p.translation_package, 'basic') = any (coalesce(p_listed_packages, '{}'::text[])) or p_listed_locale = any (coalesce(p.extra_locales, '{}')::text[]))
        )
      )
    )
  order by
    case when p_sort = 'price-asc' then p.price_eur end asc nulls last,
    case when p_sort = 'price-desc' then p.price_eur end desc nulls last,
    case when p_sort = 'area-desc' then p.floor_m2 end desc nulls last,
    case when coalesce(p_sort,'featured') = 'featured' then p.featured else false end desc,
    case when coalesce(p_sort,'featured') = 'featured' and p_subtype is not null then p.topic_featured else false end desc,
    p.published_at desc
  limit least(greatest(p_limit,1),100) offset greatest(p_offset,0);
$$;

grant execute on function search_european_properties(
  text, text, text, text, text, text, text, numeric, numeric, numeric, numeric, numeric, numeric, integer, numeric[], text, boolean, text, integer, integer, text, text[], boolean
) to anon, authenticated, service_role;

notify pgrst, 'reload schema';

commit;
