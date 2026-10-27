-- 0029 — public search: "Kiemeltek elöl" really puts featured listings first, and
-- the list shows every published listing the homepage counts.
--
-- 1. 0022 ordered by `case when p_category is not null then p.featured …`, so
--    with no category filter (the default list) featured listings were not
--    ranked ahead. The default sort is 'featured'; that is now what decides it.
-- 2. 0022 used an inner `join lateral` on a non-empty description, which hid a
--    published listing that has no description yet while the homepage still
--    counted it ("10 aktív", 3 in the list). It is a left join now; the text
--    search simply has nothing to match for such a listing.
--
-- `create or replace`, same signature as 0022: safe to run twice. Run it by hand
-- in the Supabase SQL editor — deploys do not run migrations.

begin;

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
  p_offset integer default 0
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
    and (p_exclude_adobe is not true or p.wall_key is distinct from 'valyog')
    and (p_category is null or p.category = p_category or p.property_group = p_category)
    and (p_subtype is null or p.property_subtype=p_subtype)
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
    case when coalesce(p_sort,'featured') = 'featured' then p.featured else false end desc,
    case when coalesce(p_sort,'featured') = 'featured' and p_subtype is not null then p.topic_featured else false end desc,
    p.published_at desc
  limit least(greatest(p_limit,1),100) offset greatest(p_offset,0);
$$;

notify pgrst,'reload schema';

commit;
