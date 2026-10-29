# Teendők Marcinak: E-mail automatizáció + Supabase GRANT

Richárd (Ricso000) 2026-10-29-én adta át. Ha egy pont elkészült, jelöld `[x]`-szel. Ha minden kész, a fájl és a `CLAUDE.md` „Nyitott átadás” szakasza törölhető.

## Mi jött be?

**E-mail automatizáció** menüpont az adminban (`/portal/email`, Tartalom és pénz → Hírlevél alatt). A Kovács Balázs-projekt azonos menüpontjának Fodel-változata, FINDDOME-arculattal:

- Sablonok, szerkesztővel:
  - szövegek, gombok linkjei és képek kód nélkül;
  - sárgán jelölt kitöltendő részek;
  - HTML-forrás nézet beszúrható mezőkkel (`{{first_name}}`, `{{property_price}}` …);
  - élő előnézet, tesztlevél.
- FINDDOME alapsablonok hu/nl/en/de nyelven: „Ingatlan-bemutató” és „Általános levél”.
- **Automatikus válasz** érdeklődésre és kerestetésre. Ha van aktív sablon a látogató nyelvén, az megy ki a beépített visszaigazolás helyett (`src/lib/mail/automation.ts`, bekötve a `src/lib/form-handler.ts`-be).
- **Tömeges és ütemezett küldés**:
  - címzettek: tulajdonosok / érdeklődők / hírlevél / kerestetők;
  - előellenőrzés, budapesti idő szerinti időzítés, folytatható és duplikációmentes küldés.
- Kiküldött napló megnyitás- és kattintáskövetéssel (Resend webhook), aláírás, letiltott címek, 21 nyelvű leiratkozás.

Kód: `src/lib/mail/`, `src/pages/portal/email/`, `src/pages/api/portal/email/`, `src/pages/api/cron/mail.ts`, `src/pages/api/webhooks/resend.ts`, `src/pages/mail/unsubscribe.astro`.

## Teendők

- [ ] **1. Migrációk futtatása, ebben a sorrendben** (Supabase → SQL Editor):
  - [ ] `supabase/migrations/0038_email_automation.sql`: az e-mail automatizáció táblái. Az admin oldal ezek nélkül hibaüzenetet ír ki.
  - [ ] `supabase/migrations/0039_api_grants_catchup.sql`: **minden más migráció után** fusson. 2026-10-30-tól a Supabase nem ad automatikus Data API-jogot az új táblákhoz, ez pótolja a régiekét. A szándékosan REVOKE-olt táblák (`invoice_counters`, `property_private`, `property_price_history`, `property_promotion_requests`) és a `mail_*` táblák `anon` joga ki van zárva belőle.
  - Ha a `pg_cron` / `pg_net` nem engedélyezhető a projekten, a 0038 utolsó blokkja („The minute dispatcher”) kihagyható. Ilyenkor a napi cron és a „Folytatás most” gomb küldi ki a leveleket.
- [ ] **2. Percre pontos időzítés** (a 0038 után, SQL Editorban, a valódi értékekkel):
  ```sql
  select vault.create_secret('https://<éles domain>/api/cron/mail', 'mail_cron_url');
  select vault.create_secret('<a Vercel CRON_SECRET értéke>', 'cron_secret');
  ```
- [ ] **3. Resend webhook**: Resend → Webhooks → új endpoint: `https://<éles domain>/api/webhooks/resend`. Események: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`. A signing secretet (`whsec_…`) a Vercelben **`RESEND_WEBHOOK_SECRET`** néven kell beállítani (Production). Enélkül a küldés működik, csak a követés nem.
- [ ] **4. Követés bekapcsolása**: Resend → Domains → finddome.com → Open tracking + Click tracking.
- [ ] **5. Deploy**, a migrációk után. A `vercel.json`-ba bekerült egy második napi cron (`/api/cron/mail`, 07:30) biztonsági hálónak.
- [ ] **6. Kipróbálás élesen**:
  - [ ] `/portal/email` → „Alapsablonok létrehozása”, egy sablon kitöltése (sárga részek, fő fotó), mentés, tesztlevél saját címre.
  - [ ] A sablonnál „Automatikus válasz ingatlan-érdeklődésre” és Aktív → érdeklődés küldése egy hirdetésről az adott nyelven → a sablonlevél jön, a beépített visszaigazolás nem.
  - [ ] Tömeges küldés néhány saját címre → a „Kiküldött” fülön látszik a megnyitás és a kattintás, a levél alján működik a leiratkozó link.
- [ ] **7. Ismert, régebbi hiba (nem ehhez tartozik, de érdemes javítani)**: az Astro `checkOrigin` letiltja a levelezőprogramok egykattintásos leiratkozó POST kérését (nincs Origin fejléc). Emiatt a hírlevél RFC 8058 leiratkozása (`/newsletter/unsubscribe` POST) 403-at kap. Az új `/mail/unsubscribe` ezt megerősítő oldallal kerüli meg.

## Szabály mostantól (a `CLAUDE.md`-ben is benne van)

Minden új `public` táblához ugyanabban a migrációban kell RLS + policy + `grant … to authenticated, service_role`. `anon` csak publikus adathoz kerülhet.
