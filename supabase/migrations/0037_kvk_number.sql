-- 0037: the KvK (Dutch Chamber of Commerce) number
--
-- Run by hand in the Supabase SQL editor, any time. Safe to run twice.
-- The imprint, footer and invoices read site_settings.registration, so this has
-- to run as well as the code change (src/config/company.ts); then redeploy.

update site_settings
   set registration = registration || jsonb_build_object('kvk', '57412561')
 where id = 1;
