-- 0048_extras_cleanup.sql — homepage highlight retired as a paid extra
-- (FINDDOME November 2026, item 4a).
--
-- The code no longer sells „Főoldali kiemelés” (the extra is marked retired in
-- src/config/company.ts; old orders keep their label and price). This stops the
-- database from creating new homepage requests and clears the stale wish from
-- unpaid listings:
--
--   1. requests that were only *requested* (not quoted, ordered or active) are
--      cancelled; anything paid or running is left exactly as it is;
--   2. sync_listing_promotion_requests() handles category and topic only
--      (same body as 0022 otherwise);
--   3. the homepageHighlight key is removed from properties.requested_extras.
--
-- Editorial homepage selection (properties.homepage_featured / homepage_order)
-- is untouched: admins still pick the listings on the homepage.
--
-- Idempotent; one transaction. Run before or after the deploy (the deployed
-- code never asks for a homepage request any more).
--
-- Not in this migration: free later photo upload with moderation (spec §4c
-- part 2, property_media.pending). Deferred — see the PR description.

begin;

-- 1. Open requests only.
update property_promotion_requests
   set status = 'cancelled'
 where kind = 'homepage' and status = 'requested';

-- 2. Category and topic only. Body as in 0022 otherwise.
create or replace function sync_listing_promotion_requests(p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare p properties;k text;wanted boolean;
begin
 select * into p from properties where id=p_id;
 if not found or not(is_admin() or(p.owner_id=auth.uid() and p.status in ('draft','changes_requested')))then raise exception 'not-editable';end if;
 foreach k in array array['category','topic'] loop
  wanted=case k when 'category' then coalesce((p.requested_extras->>'categoryHighlight')::boolean,false) else p.topic_highlight_requested end;
  if wanted then
   insert into property_promotion_requests(property_id,kind)values(p_id,k) on conflict(property_id,kind) do update set status=case when property_promotion_requests.status='cancelled' then 'requested' else property_promotion_requests.status end;
  else update property_promotion_requests set status='cancelled' where property_id=p_id and kind=k and status='requested';end if;
 end loop;
end;
$$;

-- 3. The retired wish.
update properties
   set requested_extras = requested_extras - 'homepageHighlight'
 where requested_extras ? 'homepageHighlight';

commit;

-- Check (expect 0 and 0):
--   select count(*) from property_promotion_requests where kind='homepage' and status='requested';
--   select count(*) from properties where requested_extras ? 'homepageHighlight';
