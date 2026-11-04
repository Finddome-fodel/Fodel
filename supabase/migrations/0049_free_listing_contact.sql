-- 0049_free_listing_contact.sql — free listings show FINDDOME's contact only
-- (FINDDOME November 2026, item 5.1).
--
-- A free listing (properties.free_listing: the free upload link and invites
-- with grants_free_listing) never shows the owner's name or phone. Buyers use
-- the enquiry form and FINDDOME's details; the office keeps the seller's name
-- and phone on the record and puts them in touch.
--
--   * Trigger: a signed-in non-admin can never give a free listing another
--     contact mode or switch on seller_contact_visible, whatever is posted.
--     Admins can still choose staff/owner deliberately (Kapcsolattartó).
--     Named zz_… so it fires AFTER properties_protect_contact (0042): Postgres
--     runs same-event triggers in name order.
--   * Backfill: existing free listings that still show the owner become
--     'company'. Admin choices of 'staff' are kept.
--
-- Paid listings are not affected (free_listing = false): the trigger returns
-- them unchanged. Idempotent; one transaction; run BEFORE the deploy.

begin;

create or replace function protect_free_listing_contact() returns trigger
language plpgsql as $$
begin
 if new.free_listing and auth.uid() is not null and not is_admin() then
  new.public_contact := 'company';
  new.public_contact_name := null;
  new.public_contact_phone := null;
  new.seller_contact_visible := false;
 end if;
 return new;
end;
$$;

drop trigger if exists zz_properties_free_listing_contact on properties;
create trigger zz_properties_free_listing_contact
 before insert or update on properties
 for each row execute function protect_free_listing_contact();

update properties
   set public_contact = 'company', public_contact_name = null, public_contact_phone = null,
       seller_contact_visible = false
 where free_listing and public_contact = 'owner';

commit;

-- Check (expect 0):
--   select count(*) from properties where free_listing and public_contact = 'owner';
