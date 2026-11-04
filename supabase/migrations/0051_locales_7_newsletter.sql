-- 0051 (run 2 of 2 of the seven-language change): newsletter sign-ups in the seven new languages
--
-- Run by hand in the Supabase SQL editor AFTER 0050_locales_7.sql has run on
-- its own, and before deploying. Safe to run twice.
--
-- newsletter_subscribers.locale is text with a CHECK (0020, 0023, 0026), not
-- the enum, so it needs its own update: the newsletter form on /sr, /uk, /tr,
-- /he, /ar, /ru and /zh pages subscribes in that page's language, and without
-- this the insert is refused and the visitor sees the form's error message.
--
-- The constraint is found by its definition rather than its name, as in 0026,
-- because earlier runs created it under more than one name.

do $$
declare
  c record;
begin
  if to_regclass('public.newsletter_subscribers') is not null then
    for c in
      select conname from pg_constraint
      where conrelid = 'public.newsletter_subscribers'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) ilike '%locale%'
    loop
      execute format('alter table public.newsletter_subscribers drop constraint %I', c.conname);
    end loop;
    alter table public.newsletter_subscribers
      add constraint newsletter_subscribers_locale_check
      check (locale in ('hu', 'nl', 'en', 'de', 'fr', 'es', 'pl', 'ro', 'sk', 'it', 'pt', 'el', 'cs', 'sl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt',
                        'sr', 'uk', 'tr', 'he', 'ar', 'ru', 'zh'));
  end if;
end $$;
