-- 0031 — clear the 1 m² plot area that every new draft used to be created with.
--
-- createDraft seeded plot_m2 = 1 and the editor showed it as a filled-in value, so
-- owners saved it unnoticed and the placeholder check (portal/placeholder.ts) then
-- refused to approve the listing. The application no longer seeds it; this removes
-- it from drafts already in the pipeline. Only listings that are not public yet are
-- touched, and only the exact placeholder value. Safe to run twice. Run it by hand in
-- the Supabase SQL editor — deploys do not run migrations.

update properties
   set plot_m2 = null
 where plot_m2 = 1
   and status in ('draft', 'submitted', 'changes_requested');
