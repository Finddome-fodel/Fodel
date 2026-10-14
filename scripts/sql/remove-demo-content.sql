-- FODEL — remove demo content from the LIVE database.
--
-- How to use (Supabase → SQL Editor):
--   1. Run PART 1 alone. Read every row it lists. Anything real? Stop here.
--   2. Run PART 2 as it is: it deletes inside a transaction and ends in
--      ROLLBACK, so nothing is kept — the counts show what WOULD go.
--   3. Only after checking: change the last line from ROLLBACK to COMMIT and
--      run PART 2 again.
--   4. Storage files: PART 3 lists the photo folders of the deleted listings
--      and blog posts. Delete those folders in Supabase → Storage
--      (property-media / blog-media). SQL cannot remove the files themselves.
--
-- Candidates: listings whose Hungarian title starts with "Demo" (the
-- seed:demo script, refs 9500–9599, matched exactly), the six listings seeded by
-- 0002_seed_properties.sql (refs 6412, 6518, 6733, 6845, 6902, 7118), and blog
-- posts titled "Demó…"/"Demo…" (slug demo-…).

/* ════ PART 1 — look first ════════════════════════════════════════════════ */

select p.id, p.ref, p.status, p.settlement, p.created_at, t.title,
       (select count(*) from property_media m where m.property_id = p.id) as photos,
       (select count(*) from payments pay where pay.property_id = p.id) as payments,
       (select count(*) from enquiries e where e.property_id = p.id) as enquiries
from properties p
left join property_translations t on t.property_id = p.id and t.locale = 'hu'
where p.ref in ('6412', '6518', '6733', '6845', '6902', '7118')
   or p.ref ~ '^95[0-9]{2}$'
   or t.title ilike 'demo%'
   or t.title ilike 'demó%'
order by p.ref;

select id, locale, slug, title, published, created_at
from blog_posts
where title ilike 'demó%' or title ilike 'demo%' or slug like 'demo-%'
order by created_at;

/* ════ PART 2 — delete (ends in ROLLBACK; switch to COMMIT after checking) ═ */

begin;

create temporary table demo_properties on commit drop as
  select p.id
  from properties p
  left join property_translations t on t.property_id = p.id and t.locale = 'hu'
  where p.ref in ('6412', '6518', '6733', '6845', '6902', '7118')
     or p.ref ~ '^95[0-9]{2}$'
     or t.title ilike 'demo%'
     or t.title ilike 'demó%';

create temporary table demo_posts on commit drop as
  select id from blog_posts
  where title ilike 'demó%' or title ilike 'demo%' or slug like 'demo-%';

-- Translations, media rows and review notes cascade with the listing;
-- enquiries, payments, activity and valuations keep their history with the
-- listing link set to null (see the foreign keys in 0001–0017).
delete from property_media where property_id in (select id from demo_properties);
delete from properties where id in (select id from demo_properties);
delete from blog_posts where id in (select id from demo_posts);

select (select count(*) from demo_properties) as listings_deleted,
       (select count(*) from demo_posts) as posts_deleted;

-- Storage object rows (the files' database entries) for the same folders.
-- Supabase removes the files themselves only through Storage; see PART 3.
select bucket_id, name from storage.objects
where (bucket_id = 'property-media' and (storage.foldername(name))[1] in (select id::text from demo_properties))
   or (bucket_id = 'blog-media' and (storage.foldername(name))[1] in (select id::text from demo_posts));

rollback; -- ← change to COMMIT only after checking PART 1 and the counts above

/* ════ PART 3 — the photo folders to delete in Storage (run after COMMIT) ═ */
-- After the COMMIT the listings are gone, so this lists folders that no
-- longer belong to any listing or post — i.e. exactly the leftovers.

select distinct bucket_id, (storage.foldername(name))[1] as folder
from storage.objects o
where (bucket_id = 'property-media' and not exists (select 1 from properties p where p.id::text = (storage.foldername(o.name))[1]))
   or (bucket_id = 'blog-media' and not exists (select 1 from blog_posts b where b.id::text = (storage.foldername(o.name))[1]))
order by 1, 2;
