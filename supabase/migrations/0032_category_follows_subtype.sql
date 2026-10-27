-- 0032 — a listing's category follows its subtype, and a forint price stays exact.
--
-- createDraft files every new listing under category 'house'; an apartment kept it
-- because 'apartment' belongs to the house group, so "Lakás, garzon" was listed and
-- addressed as "Eladó ház" (/hu/haz-elado-…). The application now derives the category
-- from the subtype (listing-catalogue.ts categoryFor); this corrects the listings already
-- in the pipeline. Likewise a price typed in forints went through euro cents and back and
-- lost one (99 000 000 saved as 98 999 999); the application no longer does that, and
-- this restores the stored forint value from what the owner typed.
--
-- Only listings that are not public yet are touched, so no published address changes and
-- no live price moves. Live ones are for the owner of the site to decide (see the PR).
-- Safe to run twice. Run it by hand in the Supabase SQL editor — deploys do not run migrations.

update properties
   set category = case property_subtype when 'apartment' then 'apartment' else 'farm' end
 where property_subtype in ('apartment', 'farm')
   and category = 'house'
   and status in ('draft', 'submitted', 'changes_requested', 'awaiting_payment');

update properties
   set price_huf = round(original_price)
 where original_currency = 'HUF'
   and price_huf is distinct from round(original_price)
   and status in ('draft', 'submitted', 'changes_requested', 'awaiting_payment');
