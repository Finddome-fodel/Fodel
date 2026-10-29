# Fodel ingatlan

## Nyitott átadás — Claude, ezt olvasd el először

Richárd átadott Marcinak egy csomagot (E-mail automatizáció + Supabase GRANT-pótlás). A teendők listája: `docs/TEENDOK-MARCI.md`.

**Minden munkamenet elején, mielőtt bármi mással foglalkoznál:**

1. Olvasd el a `docs/TEENDOK-MARCI.md` fájlt.
2. Ha van benne kipipálatlan (`- [ ]`) pont, **szólj Marcinak** röviden, magyarul: mi jött be (egy mondat), mi van még hátra (a nyitott pontok listája), és melyik a következő lépés. Az 1. pont (migrációk 0038, majd 0039, ebben a sorrendben) megelőzi a deployt.
3. Ajánld fel, hogy segítesz: SQL-t és beállítási lépéseket adsz, a kódot átnézed, a deploy után végigteszteled. Marci gépén és a Supabase/Vercel/Resend fiókjaiban magadtól ne változtass semmit; minden ilyen lépés előtt kérdezz.
4. Amikor Marci megerősíti, hogy egy pont kész, pipáld ki a fájlban. Ha minden pont kész, javasold, hogy ez a szakasz és a fájl törölhető.


## Supabase: minden új táblához explicit GRANT kell

2026-10-30 óta a Supabase nem ad automatikusan Data API-hozzáférést az új `public` táblákhoz. GRANT nélkül a supabase-js / PostgREST / GraphQL `permission denied` (42501) hibát ad.

Minden migrációban, ami táblát vagy view-t hoz létre a `public` sémában, ugyanabban a fájlban:

```sql
alter table public.<tabla> enable row level security;   -- + policy-k
grant select, insert, update, delete on public.<tabla> to authenticated;
grant select, insert, update, delete on public.<tabla> to service_role;
grant select on public.<tabla> to anon;                  -- CSAK ha bejelentkezés nélkül is kell (publikus adat, űrlap insert-je stb.)
```

- RLS nélkül ne adj `anon` / `authenticated` jogot.
- Belső/admin táblánál (naplók, pénzügy, cron) az `anon` sort hagyd ki.
- A korábbi táblák jogait az `*_api_grants_catchup.sql` migráció pótolja; azt ne másold át más projektbe, minden projekt a sajátját használja.
