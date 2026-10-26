-- 0027: the company e-mail address is info@fodel.com everywhere
--
-- Run by hand in the Supabase SQL editor, any time after 0024. Safe to run twice.
-- Needs no deploy order: the site falls back to the same address in src/config/company.ts.
--
-- The address shown in the footer, on the contact page and in e-mails comes from
-- site_settings.emails, not from code. Both the primary line and the Hungarian
-- line become info@fodel.com. The list of old inboxes ("all") stays as it is.

update site_settings
   set emails = jsonb_set(jsonb_set(emails, '{primary}', '"info@fodel.com"'), '{hu}', '"info@fodel.com"')
 where id = 1;
