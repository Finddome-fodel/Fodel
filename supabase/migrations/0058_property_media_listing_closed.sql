-- 0058_property_media_listing_closed.sql — nobody can browse the photo bucket (F5, FINDDOME November 2026)
--
-- What this does
--   Until now the policy "property_media_objects_read" (0003) let EVERYONE, signed in or not, run a SELECT on the
--   `property-media` bucket. Supabase Storage's list endpoint is built on that SELECT, so anybody could ask for the
--   names of all files, including the photos still waiting for review (0054) and the photos of drafts, and then open
--   them by their public address.
--
--   After this file only the owner of the listing (the folder is the listing's id) and admins may list or read objects
--   through the Storage API. The photos themselves are unchanged: the bucket stays public, so the address of a PUBLISHED
--   photo keeps opening for everybody, with no sign-in (that is how the site shows them), and the site's pages, images
--   and e-mails need no change.
--
--   What this does NOT do: a pending photo's address still opens for anyone who already holds it. Each file is
--   `<listing id>/<random uuid>.webp` (122 random bits), shown only to the owner and the admins, and no longer
--   discoverable by listing. Full privacy (a private bucket and signed addresses) is a larger change, left out on purpose.
--
-- When to run   Any time; independent of the other November files. Takes well under a second.
-- Safe to repeat   Yes: the policy is dropped and created again.
--
-- Check afterwards (as the SQL Editor's postgres role these show the policy, not what anon sees):
--   select policyname, roles, cmd from pg_policies where schemaname='storage' and tablename='objects' and policyname='property_media_objects_read';
--     -- expect one row, roles = {authenticated}, cmd = SELECT
--   In a private browser window, with no sign-in, this must now answer an empty list ( [] ), not file names:
--     POST https://<project>.supabase.co/storage/v1/object/list/property-media   body {"prefix":"","limit":5}   header apikey: <the public anon key>

begin;

drop policy if exists "property_media_objects_read" on storage.objects;
create policy "property_media_objects_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'property-media'
    and (
      is_admin()
      or exists (
        select 1 from properties p
        where p.id::text = (storage.foldername(name))[1]
          and p.owner_id = auth.uid()
      )
    )
  );

commit;
