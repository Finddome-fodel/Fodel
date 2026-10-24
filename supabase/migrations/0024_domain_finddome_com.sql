-- 0024: company e-mail moves to the finddome.com domain
--
-- Run by hand in the Supabase SQL editor, any time after 0023. Safe to run
-- twice. Needs no deploy order: the site falls back to the same address in
-- src/config/company.ts.
--
-- The public site's domain is finddome.com for now (it was fodel.eu from 0015,
-- and fodel.nl before that). The company address shown in the footer, on the
-- contact page and in emails comes from site_settings.emails, not from code,
-- so it has to be moved here as well.
--
-- Only the primary address is touched, and only while it is still one of the
-- two that earlier migrations seeded (0012: info@fodel.nl, 0015: info@fodel.eu).
-- An address an admin has typed in Beállítások → Cégadatok is never overwritten.
-- The Hungarian line (info@fodel.hu) and the list of old inboxes stay as they are.

update site_settings
   set emails = jsonb_set(emails, '{primary}', '"info@finddome.com"')
 where id = 1
   and emails->>'primary' in ('info@fodel.eu', 'info@fodel.nl');
