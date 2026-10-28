-- 0034: the brand is FINDDOME (was FODEL) in the stored company names, blog byline and invite letters
--
-- Run by hand in the Supabase SQL editor, any time after 0033. Safe to run twice.
-- Needs no deploy order: the site falls back to the same names in src/config/company.ts,
-- but the footer, e-mails and JSON-LD read site_settings.names, so this has to run too.
--
-- Not touched on purpose: names.legal ("FODEL VASTGOED"). The company still trades
-- legally under that name, and the imprint, terms, privacy controller and invoices use it.

-- Company display names (hu, nl, de, en, fr, …): FODEL → FINDDOME, every key except "legal".
update site_settings
   set names = (
     select coalesce(jsonb_object_agg(
              k,
              case when k = 'legal' then v else to_jsonb(replace(v #>> '{}', 'FODEL', 'FINDDOME')) end
            ), '{}'::jsonb)
       from jsonb_each(names) as n(k, v)
   )
 where id = 1
   and exists (
     select 1 from jsonb_each_text(names) as n(k, v) where k <> 'legal' and v like '%FODEL%'
   );

-- Blog byline.
update blog_posts set author = 'FINDDOME' where author = 'FODEL';

-- Invite letters (Beállítások → Meghívólevelek): the seeded Hungarian owner letter and any edited copy.
update email_templates
   set subject = replace(subject, 'FODEL', 'FINDDOME'),
       heading = replace(heading, 'FODEL', 'FINDDOME'),
       body    = replace(body,    'FODEL', 'FINDDOME'),
       cta     = replace(cta,     'FODEL', 'FINDDOME')
 where subject like '%FODEL%' or heading like '%FODEL%' or body like '%FODEL%' or cta like '%FODEL%';
