-- 0050: Serbian (Latin), Ukrainian, Turkish, Hebrew, Arabic, Russian and Simplified Chinese
--
-- RUN 1 OF 2. Run by hand in the Supabase SQL editor, ON ITS OWN (nothing else
-- in the same run), after 0049 and BEFORE deploying the branch that adds /sr,
-- /uk, /tr, /he, /ar, /ru and /zh. Then run 0050_locales_7_newsletter.sql as a
-- second, separate run. Safe to run twice.
--
-- The locale_code enum (0001, widened in 0023 and 0026) learns the seven new
-- codes, so blog posts, email templates, valuations, activity rows and (later)
-- listing translations can be stored in those languages. The site queries
-- blog posts by page language, so /ar/blog/ on a database without 'ar' would
-- log "invalid input value for enum" (and show no posts) until this has run.
--
-- ALTER TYPE … ADD VALUE: a new value cannot be used in the transaction that
-- adds it, and the SQL editor runs a whole script as one transaction. Nothing
-- below uses the new values, but keeping this step on its own means the
-- second file can rely on them.
--
-- The codes are the site's URL prefixes: 'sr' is Serbian in Latin script
-- (hreflang sr-Latn) and 'zh' is Simplified Chinese (hreflang zh-Hans).
--
-- Not needed: vocabulary labels and category URL words for the new languages
-- live in the code (src/data/taxonomy-i18n.ts, CATEGORY_FALLBACK in
-- src/i18n/ui.ts) and fill every language the database rows lack, so no
-- taxonomy update is required. Full-text search needs no change either: the
-- search function (0022) and search_vector (0004) use 'simple' for any
-- language without a named dictionary.

alter type locale_code add value if not exists 'sr';
alter type locale_code add value if not exists 'uk';
alter type locale_code add value if not exists 'tr';
alter type locale_code add value if not exists 'he';
alter type locale_code add value if not exists 'ar';
alter type locale_code add value if not exists 'ru';
alter type locale_code add value if not exists 'zh';
