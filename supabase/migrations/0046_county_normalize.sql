-- 0046_county_normalize.sql
-- One canonical spelling per county (FINDDOME November 2026, item 1a).
--
-- The listing form now offers a real <select> of the 19 counties + Budapest
-- (src/lib/counties.ts, src/data/listing/regions.json). Listings saved through
-- the old free-text field may carry "Pest vármegye", "Csongrád" or
-- "Budapest XIII. kerület"; this brings them to the canonical names so the
-- public county filter (exact match in search_properties) finds them.
--
-- Data only, no schema change. Idempotent: running it twice changes nothing
-- the second time. Safe to run while the site is live.

begin;

-- 1. Trim stray whitespace.
update properties set county = btrim(regexp_replace(county, '\s+', ' ', 'g'))
 where county is not null and county <> btrim(regexp_replace(county, '\s+', ' ', 'g'));

-- 2. Drop the "vármegye" / "megye" suffix (Hungarian listings only).
update properties set county = btrim(regexp_replace(county, '[\s,]+(vármegye|varmegye|megye)\.?$', '', 'i'))
 where country = 'HU' and county ~* '[\s,]+(vármegye|varmegye|megye)\.?$';

-- 3. Old official names and districts.
update properties set county = 'Csongrád-Csanád'
 where country = 'HU' and lower(county) in ('csongrád', 'csongrad');
update properties set county = 'Budapest'
 where country = 'HU' and county ~* '^budapest' and county <> 'Budapest';

-- 4. Case differences ("pest" -> "Pest", "BARANYA" -> "Baranya").
update properties p set county = c.name
  from (values ('Bács-Kiskun'),('Baranya'),('Békés'),('Borsod-Abaúj-Zemplén'),('Csongrád-Csanád'),('Fejér'),
               ('Győr-Moson-Sopron'),('Hajdú-Bihar'),('Heves'),('Jász-Nagykun-Szolnok'),('Komárom-Esztergom'),
               ('Nógrád'),('Pest'),('Somogy'),('Szabolcs-Szatmár-Bereg'),('Tolna'),('Vas'),('Veszprém'),('Zala'),('Budapest')) as c(name)
 where p.country = 'HU' and lower(p.county) = lower(c.name) and p.county <> c.name;

commit;

-- 5. Report: Hungarian listings whose county is still not on the list.
--    Fix these by hand in the listing editor (the county is now a dropdown there).
--    An empty result means everything is canonical.
select id, ref, status, county
  from properties
 where country = 'HU'
   and county not in ('Bács-Kiskun','Baranya','Békés','Borsod-Abaúj-Zemplén','Csongrád-Csanád','Fejér',
                      'Győr-Moson-Sopron','Hajdú-Bihar','Heves','Jász-Nagykun-Szolnok','Komárom-Esztergom',
                      'Nógrád','Pest','Somogy','Szabolcs-Szatmár-Bereg','Tolna','Vas','Veszprém','Zala','Budapest')
 order by status, ref;
