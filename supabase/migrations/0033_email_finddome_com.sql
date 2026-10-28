-- 0033: the company e-mail address is info@finddome.com everywhere
--
-- Run by hand in the Supabase SQL editor, any time after 0027. Safe to run twice.
-- Needs no deploy order: the site falls back to the same address in src/config/company.ts.
--
-- The address shown in the footer, on the contact page, in the legal pages and in
-- e-mails comes from site_settings.emails, not from code. Both the primary line and
-- the Hungarian line become info@finddome.com (the mailbox the client reads, on the
-- domain Resend sends from). The list of old inboxes ("all") stays as it is.
--
-- Only values that are still one of the addresses earlier migrations seeded are
-- replaced; an address an admin typed in Beállítások → Cégadatok is never overwritten.

update site_settings
   set emails = jsonb_set(emails, '{primary}', '"info@finddome.com"')
 where id = 1
   and emails->>'primary' in ('info@fodel.com', 'info@fodel.eu', 'info@fodel.nl', 'info@fodel.hu');

update site_settings
   set emails = jsonb_set(emails, '{hu}', '"info@finddome.com"')
 where id = 1
   and emails->>'hu' in ('info@fodel.com', 'info@fodel.eu', 'info@fodel.nl', 'info@fodel.hu');
