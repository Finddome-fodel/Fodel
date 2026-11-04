-- 0055 — The three listing packages as values of properties.package (FINDDOME, November 2026).
--
-- EZT KÜLÖN FUTTASD, MÁS NE LEGYEN MELLETTE. Run by hand in the Supabase SQL editor, AFTER 0054, as a run of its
-- own: Postgres cannot use a new enum value in the transaction that adds it, so nothing else may be in this run.
-- Safe to run twice (`if not exists`); it takes a second and changes no row.
--
-- properties.package is the enum listing_package ('cheap-6m', 'normal-12m' since 0001). Basic, Europe and World are
-- added next to them: the two old values stay, because live listings and unpaid orders still carry them (they keep
-- working until they expire). New sales use only the new three.
--
-- Until this has run the app keeps selling nothing new: the price list shows the new prices, but an order for a new
-- package is refused with „Futtassa le a 0055-ös migrációt.” and everything else works exactly as before.
--
-- Verification (expect the five values, old two first):
--   select unnest(enum_range(null::listing_package))::text;
alter type listing_package add value if not exists 'basic';
alter type listing_package add value if not exists 'europe';
alter type listing_package add value if not exists 'world';
