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

A kód úgy készült, hogy a migrációk **előtt** is biztonságosan élesíthető: amíg a 0038 nem futott, az űrlapok a megszokott, beépített visszaigazolást küldik, a `/portal/email` pedig egy barátságos „Még nincs bekapcsolva” oldalt mutat a teendőkkel. A javasolt sorrend mégis ez:

- [ ] **1. Migrációk futtatása, ebben a sorrendben** (Supabase → a projekt → **SQL Editor** → New query):
  - [ ] `supabase/migrations/0038_email_automation.sql`: a fájl teljes tartalmát másold be, majd **Run**. Az e-mail automatizáció táblái, jogai és a percenkénti ütemező. Ha a `pg_cron` / `pg_net` nem kapcsolható be a projekten, a migráció ettől még lefut (csak egy figyelmeztetést ír); ilyenkor a napi cron és a küldés oldalán a „Folytatás most” gomb küldi ki a leveleket.
  - [ ] `supabase/migrations/0039_api_grants_catchup.sql`: ugyanígy, **a 0038 után**. 2026-10-30-tól a Supabase nem ad automatikus Data API-jogot az új táblákhoz, ez pótolja a régiekét. A szándékosan REVOKE-olt táblák (`invoice_counters`, `property_private`, `property_price_history`, `property_promotion_requests`) és a `mail_*` táblák `anon` joga ki van zárva belőle. Többször is lefuttatható, nem árt.
  - Ellenőrzés: `select jobname, schedule from cron.job;` → egy `dispatch-mail-jobs` sor, `* * * * *` (ha a pg_cron elérhető).
- [ ] **2. Percre pontos időzítés** (nem kötelező, de ajánlott; SQL Editorban, a 0038 után):
  ```sql
  select vault.create_secret('https://www.finddome.com/api/cron/mail', 'mail_cron_url');
  select vault.create_secret('<a Vercel CRON_SECRET értéke>', 'cron_secret');
  ```
  Fontos a **www**: a `finddome.com` átirányít a `www`-re, és az átirányítás közben elveszne a jelszó. A `CRON_SECRET` a Vercelben már megvan (a napi cron is ezt használja): Vercel → Settings → Environment Variables. Vault nélkül az ütemezett küldés a napi 07:30-as cronnal vagy a „Folytatás most” gombbal megy ki.
- [ ] **3. PR #20 merge** → a Vercel automatikusan élesít. A `vercel.json`-ba bekerült egy második napi cron (`/api/cron/mail`, 07:30 UTC) biztonsági hálónak.
- [ ] **4. Resend webhook** (a merge után, mert az endpoint ezzel kerül élesbe): Resend → **Webhooks** → Add endpoint:
  - URL: `https://www.finddome.com/api/webhooks/resend`
  - Események: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`
  - A létrehozás után a **Signing secretet** (`whsec_…`) a Vercelben **`RESEND_WEBHOOK_SECRET`** néven add hozzá (Production), majd **Redeploy** (a környezeti változó csak új deploy után él). Enélkül a küldés működik, csak a megnyitás/kattintás/visszapattanás nem látszik.
- [ ] **5. Követés bekapcsolása**: Resend → Domains → finddome.com → **Open tracking** és **Click tracking**. Ez a domain minden levelére vonatkozik (a rendszerlevelekre is).
- [ ] **6. Kipróbálás élesen** (csak saját címekre):
  - [ ] `/portal/email` → „Alapsablonok létrehozása”. Az érdeklődésre válaszoló sablonok már automatikus válasznak vannak jelölve, de kikapcsolva jönnek létre.
  - [ ] A magyar sablon megnyitása → átnézés → „Teszt küldése” saját címre.
  - [ ] Ugyanott **Aktív** → Mentés → érdeklődés küldése egy magyar hirdetésről saját címmel → a sablonlevél jön, a hirdetés címével, fotójával, adataival. Egy másik nyelven (amelyiknek a sablonja nincs bekapcsolva) a megszokott visszaigazolás jön.
  - [ ] Tömeges küldés: Kiknek? → szűrés úgy, hogy csak saját címek maradjanak (Keresés mező) → küldés → a küldés oldalán „Kész”. A „Kiküldött” fülön a megnyitás és a kattintás pár percen belül megjelenik; a levél alján a leiratkozó link működik, a cím a „Letiltott címek” közé kerül (onnan visszavehető).
  - [ ] Egy ütemezett küldés (pl. holnapra) → „Lemondás” → a lista „Lemondva” állapotot mutat.
- [ ] **7. Ismert, régebbi hiba (nem ehhez tartozik, de érdemes javítani)**: az Astro `checkOrigin` letiltja a levelezőprogramok egykattintásos leiratkozó POST kérését (nincs Origin fejléc). Emiatt a hírlevél RFC 8058 leiratkozása (`/newsletter/unsubscribe` POST) 403-at kap. Az új `/mail/unsubscribe` ezt megerősítő oldallal kerüli meg. Aki a levelezőprogram „Leiratkozás” gombjával e-mailt küld (`mailto`), azt kézzel kell felvenni a „Letiltott címek” közé.

## Jó tudni

- **Duplikáció ellen**: minden tömeges levél egyedi Resend idempotency kulccsal megy ki, így egy újrapróbált köteg nem küld kétszer ugyanannak (24 órán belül).
- **Tempó**: percenként kb. 10–15 levél (a Resend 2 kérés/másodperces korlátja alatt). Egy 300 fős küldés így kb. 20–30 perc.
- **Leállítás**: futó küldésnél a „Küldés leállítása” gomb; akinek még nem ment ki, nem kapja meg (a folyamatban lévő legfeljebb 10 levél még kimegy).
- **Visszapattanás**: csak a végleges (Permanent) visszapattanás és a spamjelölés tiltja le a címet; az átmeneti (pl. tele a postafiók) nem.
- **Webhook a migráció előtt**: ha a Resend webhook már be van állítva, de a 0038 még nem futott, a végpont 503-at ad, és a Resend később újrapróbálja, nem vész el semmi.
- **GDPR**: tömeges levél csak olyanoknak menjen, akikkel üzleti kapcsolat van vagy feliratkoztak; minden tömeges levél alján ott a leiratkozás.

## Szabály mostantól (a `CLAUDE.md`-ben is benne van)

Minden új `public` táblához ugyanabban a migrációban kell RLS + policy + `grant … to authenticated, service_role`. `anon` csak publikus adathoz kerülhet.
