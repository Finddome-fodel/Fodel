-- 0057 — Agricultural types: „Mezőgazdasági üzem, birtok” becomes three types (FINDDOME, November 2026).
--
-- Run by hand in the Supabase SQL editor. Safe to run twice; one transaction; takes a second or two. It moves every listing
-- still on the old key `agricultural-estate` to one of the three new keys and flags each of them „Típus ellenőrzése” for an
-- admin to confirm with one click. It changes no status, no slug, no URL and no price: the group is still `agricultural`,
-- and category URLs are per group.
--
--   agricultural-business   Mezőgazdasági üzem   (a working farm business with production buildings)
--   rural-estate            Birtok               (a larger rural property with land and a residence)
--   manor-farmstead         Majorság             (a historic farmstead complex with residential and farm buildings)
--
-- The rule (Q13), over the Hungarian title and description: „üzem”, „telep”, or „gazdaság” (not the one inside
-- „mezőgazdasági”) -> Mezőgazdasági üzem; „major” -> Majorság; everything else -> Birtok. Each decision is written to
-- details -> 'subtype_review' = {from, to, reason, at} (the flag the admin list shows) and to one activity row, so the
-- change can be put back: see "Rolling back" below.
--
-- 1. taxonomy_terms.subtype_keys: wherever the old key is listed, the three new ones are added (no duplicates). The old
--    key stays in the arrays until the release has settled, so a row that still carries it keeps its features.
-- 2. The remap and the flag, once per listing.
--
-- The app works before this runs: the old key reads as „Birtok” everywhere (an alias), it is no longer offered in any
-- picker, and an old ?subtype=agricultural-estate link redirects to the estate.
--
-- Verification (all after the run):
--   select property_subtype, count(*) from properties where property_group = 'agricultural' group by 1 order by 1;      -- no 'agricultural-estate'
--   select count(*) from properties where property_subtype = 'agricultural-estate';                                   -- 0
--   select id, ref, details -> 'subtype_review' from properties where details ? 'subtype_review';                      -- one row per moved listing
--   select count(*) from activity_events where kind = 'listing.subtype_remapped';                                      -- same number
--
-- Rolling back (puts every listing that has not been confirmed or changed since back on the old key):
--   update properties set property_subtype = details -> 'subtype_review' ->> 'from', details = details - 'subtype_review'
--     where details ? 'subtype_review';
--   -- A listing an admin already confirmed lost its flag: its old key is in the activity row:
--   --   select property_id, payload ->> 'from' from activity_events where kind = 'listing.subtype_remapped';
begin;

-- 1. The dictionary ----------------------------------------------------------------------------------------------------
update taxonomy_terms
   set subtype_keys = subtype_keys || array(
         select k from unnest(array['agricultural-business', 'rural-estate', 'manor-farmstead']) as k where k <> all (subtype_keys)
       )
 where 'agricultural-estate' = any (subtype_keys)
   and not (subtype_keys @> array['agricultural-business', 'rural-estate', 'manor-farmstead']);

-- 2. The remap, with the reason and the flag ---------------------------------------------------------------------------
with source as (
  select p.id,
         lower(coalesce(t.title, '') || ' ' || coalesce(t.description, '')) as txt
    from properties p
    left join lateral (
      select title, description from property_translations
       where property_id = p.id
       order by (locale = 'hu') desc, machine, locale
       limit 1
    ) t on true
   where p.property_subtype = 'agricultural-estate'
), decided as (
  select id,
         case
           when txt ~ '(üzem|telep|(?<!mező)gazdaság)' then 'agricultural-business'
           when txt ~ 'major' then 'manor-farmstead'
           else 'rural-estate'
         end as new_key,
         case
           when txt ~ 'üzem' then 'üzem'
           when txt ~ 'telep' then 'telep'
           when txt ~ '(?<!mező)gazdaság' then 'gazdaság'
           when txt ~ 'major' then 'major'
           else 'default'
         end as reason
    from source
), moved as (
  update properties p
     set property_subtype = d.new_key,
         details = jsonb_set(coalesce(p.details, '{}'::jsonb), '{subtype_review}',
                             jsonb_build_object('from', 'agricultural-estate', 'to', d.new_key, 'reason', d.reason, 'at', now()), true)
    from decided d
   where p.id = d.id
  returning p.id, d.new_key, d.reason
)
insert into activity_events (kind, subject_type, subject_id, property_id, source, payload, dedupe_key)
select 'listing.subtype_remapped', 'property', m.id::text, m.id, 'migration-0057',
       jsonb_build_object('from', 'agricultural-estate', 'to', m.new_key, 'reason', m.reason),
       'subtype-remap-' || m.id::text
  from moved m
on conflict do nothing;

commit;
