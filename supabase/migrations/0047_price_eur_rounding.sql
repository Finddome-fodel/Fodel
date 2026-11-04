-- 0047_price_eur_rounding.sql — OPTIONAL one-off backfill (FINDDOME November 2026, item 8).
--
-- New and edited listings already store the converted euro price rounded half
-- up to the nearest €100 (roundEur in src/lib/exchange-rates.ts, step set on
-- Csomagok → Kerekítés). This aligns listings saved before the deploy, so the
-- site does not show „587.896 €” next to „587.900 €”.
--
-- Only prices that were NOT entered in euro are touched; an owner's euro price
-- is never changed. The exact amount stays recoverable from
-- original_price / exchange_rate. Placeholder prices (1 = "no price yet",
-- src/lib/portal/placeholder.ts) are left alone, and a positive price never
-- becomes 0 (same rule as roundEur).
--
-- Step €100 (decided). If Kerekítés was changed before you run this, replace
-- the three 100s with that step. Idempotent: a rounded price stays the same.
-- Run it after the deploy (otherwise an edit made in between is unrounded).
-- Safe to skip entirely.

begin;

update properties
   set price_eur = greatest(100, round(price_eur / 100.0) * 100)
 where original_currency is distinct from 'EUR'
   and price_eur > 1
   and price_eur <> greatest(100, round(price_eur / 100.0) * 100);

commit;
