-- 0041 — the client's listing-field wishlist (FINDDOME, October 2026).
--
-- Run by hand in the Supabase SQL editor, any time after 0040. Safe to run twice: every
-- step only touches rows still in the old shape, and nothing is deleted. The site works
-- before and after it (the code reads both shapes); running it first is still the
-- recommended order, because only from then on does the search's "rooms" filter count
-- rooms and the admin dictionary show the new feature placement.
--
-- 1. Listing details (properties.details, 0025):
--    · "setting" (one surroundings answer) becomes "settings" (a list).
--    · Heating and wall material become lists, seeded from heating_key / wall_key.
--      The two columns stay and keep carrying the first answer for older readers.
-- 2. Features:
--    · "Garázs vagy parkoló", "Zárt parkoló" and the older garage / carport keys
--      move into the parking list (details.parking): own / enclosed / garage.
--    · Industrial "Raktárhelyiség" becomes "Raktárterület" (storage-area); a manor's
--      "Parkosított kert" becomes "Díszkert vagy park" (ornamental-park).
-- 3. Energy certificate: "not applicable" / "exempt" become "none" (no certificate),
--    "pending" becomes "unknown" (not stated).
-- 4. Dictionary (taxonomy_terms): feature placement follows src/data/listing/features.json,
--    but only where an admin has not changed it since 0022; the two parking features are
--    switched off (their ticks live on as parking options); three new features.
-- 5. Search: the "rooms" filter counts rooms (details.rooms; the old bedroom count until a
--    listing is re-saved), and "no adobe" looks at every wall material.
-- 6. Saved e-mail templates: {{property_bedrooms}} becomes {{property_rooms}}, and the
--    starter's untouched "Hálószobák" stat label becomes "Szobák" (nl/en/de likewise).
--
-- properties.bedrooms is kept as it is (no longer asked or shown). Valuations keep
-- their own bedrooms answer; they are a different form.

begin;

-- 1. Details -------------------------------------------------------------------------

update properties
   set details = (details - 'setting')
       || jsonb_build_object('settings', case when nullif(btrim(details->>'setting'), '') is null then '[]'::jsonb else jsonb_build_array(details->>'setting') end)
 where details ? 'setting';

update properties
   set details = coalesce(details, '{}'::jsonb) || jsonb_build_object('heating', jsonb_build_array(heating_key))
 where nullif(btrim(heating_key), '') is not null
   and not coalesce(details, '{}'::jsonb) ? 'heating';

update properties
   set details = coalesce(details, '{}'::jsonb) || jsonb_build_object('walls', jsonb_build_array(wall_key))
 where nullif(btrim(wall_key), '') is not null
   and not coalesce(details, '{}'::jsonb) ? 'walls';

-- 2. Features ------------------------------------------------------------------------

with folded as (
  select p.id,
         array(select f from unnest(p.features) f where f not in ('parking', 'garage', 'carport', 'enclosed-parking')) as features,
         (select coalesce(jsonb_agg(distinct v), '[]'::jsonb) from (
            select jsonb_array_elements_text(case when jsonb_typeof(p.details->'parking') = 'array' then p.details->'parking' else '[]'::jsonb end) v
            union
            select case f when 'parking' then 'own' when 'carport' then 'own' when 'garage' then 'garage' when 'enclosed-parking' then 'enclosed' end
              from unnest(p.features) f where f in ('parking', 'garage', 'carport', 'enclosed-parking')
         ) s) as parking
    from properties p
   where p.features && array['parking', 'garage', 'carport', 'enclosed-parking']
)
update properties p
   set features = folded.features,
       details = coalesce(p.details, '{}'::jsonb) || jsonb_build_object('parking', folded.parking)
  from folded
 where p.id = folded.id;

update properties
   set features = array(select distinct case when f = 'warehouse-space' then 'storage-area' else f end from unnest(features) f)
 where coalesce(property_group, category) = 'industrial'
   and 'warehouse-space' = any(features);

update properties
   set features = array(select distinct case when f = 'park' then 'ornamental-park' else f end from unnest(features) f)
 where coalesce(property_group, category) = 'mansion'
   and 'park' = any(features);

-- 3. Energy certificate ----------------------------------------------------------------

update properties set epc_class = 'none' where epc_class in ('not-applicable', 'exempt');
update properties set epc_class = 'unknown' where epc_class in ('pending', '');

-- 4. Dictionary --------------------------------------------------------------------------

-- Each column moves only if it still holds what 0022 put there.
with placement(key, old_groups, old_subtypes, old_section, new_groups, new_subtypes, new_section) as (values
    ('flat-land', array['house','holiday','mansion','agricultural','land']::text[], array[]::text[], 'outdoor', array['house','holiday','mansion','agricultural','land']::text[], array['house-villa','terraced','residential-building','residential-other','holiday-house','waterfront-home','chalet','holiday-complex','holiday-other','castle-manor','historic-villa','historic-building','listed-building','historic-other','arable','farm','orchard-vineyard','forest-pasture','livestock','agricultural-estate','fish-farm','agricultural-other','residential-plot','commercial-plot','tourism-land','development-land','agricultural-land','land-other']::text[], 'terrain'),
    ('sloping-land', array['house','holiday','mansion','agricultural','land']::text[], array[]::text[], 'outdoor', array['house','holiday','mansion','agricultural','land']::text[], array['house-villa','terraced','residential-building','residential-other','holiday-house','waterfront-home','chalet','holiday-complex','holiday-other','castle-manor','historic-villa','historic-building','listed-building','historic-other','arable','farm','orchard-vineyard','forest-pasture','livestock','agricultural-estate','fish-farm','agricultural-other','residential-plot','commercial-plot','tourism-land','development-land','agricultural-land','land-other']::text[], 'terrain'),
    ('forest-adjacent', array['house','holiday','mansion']::text[], array[]::text[], 'outdoor', array['house','holiday','mansion']::text[], array['house-villa','terraced','residential-building','residential-other','holiday-house','waterfront-home','chalet','holiday-complex','holiday-other','castle-manor','historic-villa','historic-building','listed-building','historic-other']::text[], 'outdoor'),
    ('kennel', array['house','holiday','mansion','agricultural']::text[], array[]::text[], 'outdoor', array['house','holiday','mansion','agricultural']::text[], array['house-villa','terraced','residential-building','residential-other','holiday-house','waterfront-home','chalet','holiday-complex','holiday-other','castle-manor','historic-villa','historic-building','listed-building','historic-other','arable','farm','orchard-vineyard','forest-pasture','livestock','agricultural-estate','fish-farm','agricultural-other']::text[], 'outdoor'),
    ('park', array['house','holiday','mansion']::text[], array[]::text[], 'outdoor', array['house','holiday']::text[], array['house-villa','terraced','residential-building','residential-other','holiday-house','waterfront-home','chalet','holiday-complex','holiday-other']::text[], 'outdoor'),
    ('steep-land', array['land']::text[], array[]::text[], 'access', array['agricultural','land']::text[], array[]::text[], 'terrain'),
    ('grassland', array['land']::text[], array[]::text[], 'access', array['land']::text[], array[]::text[], 'terrain'),
    ('outbuildings', array['agricultural','mansion']::text[], array['farm','agricultural-estate','livestock','agricultural-other','castle-manor','historic-villa','historic-building','listed-building','historic-other']::text[], 'facilities', array['agricultural','mansion']::text[], array[]::text[], 'facilities'),
    ('animal-housing', array['agricultural']::text[], array['farm','agricultural-estate','livestock','agricultural-other','castle-manor','historic-villa','historic-building','listed-building','historic-other']::text[], 'facilities', array['agricultural']::text[], array[]::text[], 'facilities'),
    ('stables', array['agricultural']::text[], array['farm','agricultural-estate','livestock','agricultural-other','castle-manor','historic-villa','historic-building','listed-building','historic-other']::text[], 'facilities', array['agricultural','mansion']::text[], array[]::text[], 'facilities'),
    ('riding-arena', array['agricultural']::text[], array['farm','agricultural-estate','livestock','agricultural-other','castle-manor','historic-villa','historic-building','listed-building','historic-other']::text[], 'facilities', array['agricultural','mansion']::text[], array[]::text[], 'facilities'),
    ('machinery-storage', array['agricultural']::text[], array['farm','agricultural-estate','livestock','agricultural-other','castle-manor','historic-villa','historic-building','listed-building','historic-other']::text[], 'facilities', array['agricultural']::text[], array[]::text[], 'facilities'),
    ('feed-storage', array['agricultural']::text[], array['farm','agricultural-estate','livestock','agricultural-other','castle-manor','historic-villa','historic-building','listed-building','historic-other']::text[], 'facilities', array['agricultural']::text[], array[]::text[], 'facilities'),
    ('guesthouse', array['agricultural','mansion']::text[], array['farm','agricultural-estate','livestock','agricultural-other','castle-manor','historic-villa','historic-building','listed-building','historic-other']::text[], 'facilities', array['agricultural','mansion']::text[], array[]::text[], 'facilities'),
    ('warehouse-space', array['commercial','industrial']::text[], array[]::text[], 'facilities', array['commercial']::text[], array[]::text[], 'facilities')
)
update taxonomy_terms t
   set property_groups = case when t.property_groups = placement.old_groups then placement.new_groups else t.property_groups end,
       subtype_keys    = case when t.subtype_keys = placement.old_subtypes then placement.new_subtypes else t.subtype_keys end,
       section_key     = case when t.section_key = placement.old_section then placement.new_section else t.section_key end
  from placement
 where t.group_key = 'feature' and t.key = placement.key
   and (t.property_groups is distinct from placement.new_groups and t.property_groups = placement.old_groups
     or t.subtype_keys is distinct from placement.new_subtypes and t.subtype_keys = placement.old_subtypes
     or t.section_key is distinct from placement.new_section and t.section_key = placement.old_section);

update taxonomy_terms
   set labels = labels || '{"hu": "Állattartó épületek"}'::jsonb
 where group_key = 'feature' and key = 'animal-housing' and labels->>'hu' in ('Állattartásra alkalmas épület', 'Állattartásra alkalmas ólak');

update taxonomy_terms set enabled = false
 where group_key = 'feature' and key in ('parking', 'enclosed-parking') and enabled;

insert into taxonomy_terms (group_key, key, labels, sort_order, property_groups, subtype_keys, section_key) values
  ('feature', 'ornamental-park', '{"hu": "Díszkert vagy park", "en": "Ornamental garden or park", "nl": "Siertuin of park", "de": "Ziergarten oder Park", "fr": "Jardin d’agrément ou parc", "es": "Jardín ornamental o parque", "pl": "Ogród ozdobny lub park", "ro": "Grădină ornamentală sau parc", "sk": "Okrasná záhrada alebo park", "it": "Giardino ornamentale o parco", "pt": "Jardim ornamental ou parque", "el": "Διακοσμητικός κήπος ή πάρκο", "cs": "Okrasná zahrada nebo park", "sl": "Okrasni vrt ali park", "sv": "Prydnadsträdgård eller park", "da": "Prydhave eller park", "no": "Prydhage eller park", "fi": "Koristepuutarha tai puisto", "et": "Iluaed või park", "lv": "Dekoratīvais dārzs vai parks", "lt": "Dekoratyvinis sodas arba parkas"}'::jsonb, 135, array['mansion']::text[], array[]::text[], 'outdoor'),
  ('feature', 'ancillary-buildings', '{"hu": "Melléképületek", "en": "Ancillary buildings", "nl": "Bijgebouwen", "de": "Nebengebäude", "fr": "Dépendances", "es": "Edificios anexos", "pl": "Budynki pomocnicze", "ro": "Anexe", "sk": "Vedľajšie budovy", "it": "Edifici annessi", "pt": "Anexos", "el": "Βοηθητικά κτίσματα", "cs": "Vedlejší budovy", "sl": "Pomožni objekti", "sv": "Komplementbyggnader", "da": "Udhuse", "no": "Uthus", "fi": "Sivurakennukset", "et": "Kõrvalhooned", "lv": "Palīgēkas", "lt": "Pagalbiniai pastatai"}'::jsonb, 255, array['mansion']::text[], array[]::text[], 'facilities'),
  ('feature', 'storage-area', '{"hu": "Raktárterület", "en": "Warehouse area", "nl": "Magazijnoppervlak", "de": "Lagerfläche", "fr": "Surface d’entreposage", "es": "Superficie de almacén", "pl": "Powierzchnia składowa", "ro": "Suprafață de depozitare", "sk": "Skladová plocha", "it": "Area di magazzino", "pt": "Área de armazém", "el": "Επιφάνεια αποθήκης", "cs": "Skladová plocha", "sl": "Skladiščna površina", "sv": "Lageryta", "da": "Lagerareal", "no": "Lagerareal", "fi": "Varastopinta-ala", "et": "Laopind", "lv": "Noliktavas platība", "lt": "Sandėlio plotas"}'::jsonb, 485, array['industrial']::text[], array[]::text[], 'technical')
on conflict (group_key, key) do nothing;

-- 5. Search --------------------------------------------------------------------------------

-- Same signature as 0029 (create or replace keeps its grants).
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
    -- Walls are multi-choice now: any adobe wall excludes the listing (unknown or unset stays in).
    and (p_exclude_adobe is not true or (p.wall_key is distinct from 'valyog' and not coalesce(p.details->'walls', '[]'::jsonb) ? 'valyog'))
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
    -- The parameter kept its name so the API does not change; it is the room count (half rooms
    -- not counted). A listing nobody has re-saved yet only has its old bedroom count; a home has
    -- at least as many rooms as bedrooms, so that never lets in a listing that is too small.
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
  order by
    case when p_sort = 'price-asc' then p.price_eur end asc nulls last,
    case when p_sort = 'price-desc' then p.price_eur end desc nulls last,
    case when p_sort = 'area-desc' then p.floor_m2 end desc nulls last,
    case when coalesce(p_sort,'featured') = 'featured' then p.featured else false end desc,
    case when coalesce(p_sort,'featured') = 'featured' and p_subtype is not null then p.topic_featured else false end desc,
    p.published_at desc
  limit least(greatest(p_limit,1),100) offset greatest(p_offset,0);
$$;

-- 6. Saved e-mail templates -------------------------------------------------------------------

update mail_templates
   set body_html = replace(body_html, '{{property_bedrooms}}', '{{property_rooms}}')
 where body_html like '%{{property_bedrooms}}%';
update mail_templates
   set subject = replace(subject, '{{property_bedrooms}}', '{{property_rooms}}')
 where subject like '%{{property_bedrooms}}%';

-- Only the starter's own wording; a label someone rewrote stays as they wrote it.
update mail_templates
   set body_html =
         regexp_replace(regexp_replace(regexp_replace(regexp_replace(body_html,
           '(data-editable="stat2_label"[^>]*>)Hálószobák(</span>)', '\1Szobák\2'),
           '(data-editable="stat2_label"[^>]*>)Slaapkamers(</span>)', '\1Kamers\2'),
           '(data-editable="stat2_label"[^>]*>)Bedrooms(</span>)', '\1Rooms\2'),
           '(data-editable="stat2_label"[^>]*>)Schlafzimmer(</span>)', '\1Zimmer\2')
 where body_html ~ 'data-editable="stat2_label"[^>]*>(Hálószobák|Slaapkamers|Bedrooms|Schlafzimmer)</span>';

notify pgrst, 'reload schema';

commit;
