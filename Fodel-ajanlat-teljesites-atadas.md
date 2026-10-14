# FODEL — az árajánlat hiányzó tételeinek átadása

Dátum: 2026. október 14.

A kód helyben kész, **helyi commitokban, push nélkül**. A `0019_quote_completion.sql` migrációt nem futtattuk az éles adatbázison: azt kézzel kell lefuttatni. A dev szerver az éles adatbázishoz csatlakozik, ezért nyilvános űrlapot nem küldtünk be, és semmit nem írtunk az adatbázisba.

---

## 1. Mi készült el, és hol lehet megnézni

### Térkép

Az éles `/hu/terkep/` oldalon azért volt „A térkép jelenleg nem elérhető” felirat, mert a `PMTILES_URL` nincs beállítva. A kód ilyenkor eddig semmit nem rajzolt ki.

- Ha a `PMTILES_URL` üres, a térkép most az **OpenFreeMap** ingyenes alaptérképét használja (nem kell hozzá kulcs), a kötelező OSM/OpenMapTiles forrásmegjelöléssel. Ha később beállítják a saját PMTiles-fájlt, automatikusan az lesz az alaptérkép.
- Közben kiderült egy rejtett hiba: a térképkönyvtár nem találta a saját háttérfolyamatát, így PMTiles-szal is üres maradt volna a térkép. Ezt is javítottuk.
- A hirdetéseket a térképen kerek „ár-pirulák” jelölik, kategória-ikonnal (pl. „€178k”). A csoportosítás és a „Keresés ezen a területen” gomb megmaradt.
- **Pontosság:** minden hirdetés pontos (tű) vagy közelítő (kb. 1 km-es puha kör, tű nélkül). A kör középpontja minden hirdetésnél máshová, de mindig ugyanoda tolódik el, így a cím nem következtethető ki. A valódi koordináta közelítő hirdetésnél nem kerül ki a nyilvános oldalra, a térkép adatfolyamába és a Google-nek szóló adatokba sem.
- A pontosságot a hirdetésszerkesztőben és a nyilvános hirdetésfeladáson lehet választani. Alapérték: közelítő.
- A térképoldal fejléce eddig a menü alá csúszott. Ezt is javítottuk.

Megnézni: [/hu/terkep/](http://localhost:4321/hu/terkep/), [/nl/kaart/](http://localhost:4321/nl/kaart/), bármelyik hirdetés oldalának alja.

### Vályogházak kizárása a keresésben

- Új mező a hirdetésen: **falazat** (tégla, vályog, vegyes, beton/panel, fa, kő, egyéb, nem ismert), magyar, holland, angol és német felirattal. A kulcsok ugyanazok, mint az értékbecslés „Falazat” kérdésében.
- Látszik a szerkesztőben, a hirdetésfeladáson (nem kötelező) és a hirdetés oldalán.
- Új kapcsoló: **„Vályogházak nélkül”** a hirdetéslista szűrőjében és a főoldali keresőben. Csak a vályogként megjelölt hirdetéseket veszi ki, a „nem ismert” bent marad.
- A szótárban (Beállítások → Szótár) a Falazat csoport feliratai szerkeszthetők.

### Lejárat és hosszabbítás

- A lejárt hirdetés minden nyilvános helyről eltűnik: lista, térkép, sitemap, Top 10, főoldal, hirdetésoldal. Az eladott archívumban az eladott hirdetések maradnak.
- **Napi ütemezett feladat** (`/api/cron/daily`, a `vercel.json`-ban, naponta 07:00 UTC-kor, azaz reggel 8–9 óra körül magyar idő szerint):
  - a lejárt hirdetést „Archiválva” állapotba teszi, és küld egy levelet;
  - a lejárat előtt két emlékeztetőt küld (alapból 14 és 3 nappal előtte);
  - minden levélben ott a hosszabbítás linkje.
- A hosszabbítás a meglévő „Hosszabbítás — 6 hónap” (25 €) tétel. Bankkártyával fizethető, ha a Stripe be van kapcsolva; egyébként átutalással. Átutalásnál a rendelés a Fizetések között vár, és a „Fizetve” jelölés hosszabbít.
- A hosszabbítás a lejárat napjától számít; ha a hirdetés már lejárt, a mai naptól, és a hirdetés azonnal visszakerül az oldalra.
- Minden levél csak egyszer megy ki: ha a feladat egy nap kétszer fut, másodszor nem küld semmit.
- Admin:
  - az Áttekintésen új kártya: **Hamarosan lejár (30 napon belül)**, listával;
  - az Ingatlanok oldalon új szűrő: „Hamarosan lejár”;
  - a hirdetésszerkesztőben **Meghosszabbítás** gomb (1/3/6/12 hónap), díj nélkül, naplózva.

### Havi visszaigazolás a hirdetőtől

- Havonta egy levél minden élő hirdetés tulajdonosának. Három gomb, belépés nélkül:
  - **„Még eladó”** — rögzíti a visszaigazolást;
  - **„Változott az ár”** — kis űrlap; az új ár azonnal megjelenik, elbírálás nélkül. Bekerül a naplóba és az ártörténetbe, az adminok e-mailt kapnak;
  - **„Eladtam”** — egy megerősítő gomb után az eladott ingatlanok közé kerül, az adminok e-mailt kapnak.
- A linkek 30 napig érvényesek, és csak az adott hirdetésre és az adott lépésre jók. Az „Eladtam” és az árváltozás külön gombnyomást kér, hogy egy levelezőprogram automatikus linkellenőrzése ne jelölhesse el eladottnak a házat.
- Válasz nélkül 7 nap múlva egy emlékeztető megy. 14 nap után a hirdetés **„Nem válaszolt”** jelölést kap az Áttekintésen és az Ingatlanok szűrőben. Automatikus levétel nincs, az admin dönt.
- Be/ki kapcsolható (alapból bekapcsolva), az időzítések állíthatók: Beállítások → Szolgáltatások.

### Hírlevél

- Kompakt feliratkozó űrlap minden nyilvános oldal láblécében, egy sáv a főoldalon (a blog után), és az angol/német oldalakon is. Nyelvek: HU, NL, EN, DE.
- Kétlépcsős: megerősítő e-mail aláírt linkkel. Tároljuk a megerősítés időpontját és a nyelvet. Minden levélben van egy kattintásos leiratkozás.
- Admin: új menüpont, **Hírlevél** — lista, szűrés állapot és nyelv szerint, Excel-export, törlés.
- Ha a `RESEND_AUDIENCE_ID` be van állítva, a megerősített címek a Resend közönségbe is bekerülnek.
- Az adatvédelmi tájékoztatóba bekerült egy rövid bekezdés a hírlevélről. **Tervezet, jogásznak át kell néznie.**

### Telefonszám csomag szerint

- Beállítások → Szolgáltatások → Hirdetési csomagok: csomagonként be lehet állítani, hogy a hirdető telefonszáma megjelenhet-e. Alapból: Standard **nem**, Kiemelt **igen**.
- A hirdetés oldalán a hirdető neve és száma csak akkor látszik, ha a csomag engedi **és** a hirdető hozzájárult. Egyébként a visszahívás-űrlap a kapcsolat útja.

### Lejárt számlák

- A „Lejárt” állapotot a rendszer számolja: kiállított vagy elküldött, ki nem fizetett számla a határidő után. Az adatbázis állapotlistája nem változott.
- A számlalistában és a számla oldalán ez már eddig is megvolt (pirula + „Lejárt” fül). Most a szabály egy helyen van és tesztelt.
- Új: az Áttekintésen **Lejárt számlák** csempe, a lejárt és a nyitott összeggel.

### Takarítás

- **Demótartalom:** nem töröltünk semmit. A `scripts/sql/remove-demo-content.sql` először listáz, utána töröl, de `ROLLBACK`-kel zárul (lásd a 2. pontot).
- A főoldali ajánló űrlapon látszó „Company” feliratot (a spamcsapda mezőé) eltávolítottuk; a mezőt most inline stílus rejti, így akkor sem látszik, ha a stíluslap késve jön meg.
- **Nyitvatartás:** egy beállításból jön (Beállítások → Cégadatok). A jelentés mindenhol ugyanaz: hétköznap 09:00–18:00 között hívhatnak minket, visszahívást 21:00-ig kérhetnek, hétvégén is. Ez szerepel a láblécben, a kapcsolat oldalon, a GYIK-ban, az űrlapok köszönő szövegében és a visszaigazoló levélben. Az értékek a mostaniak.
- A nyelvválasztóból kikerült a „Hamarosan” olasz és spanyol sor.
- A gyökérben lévő `610` fájl törölve.

---

## 2. Mit kell lefuttatni / beállítani

1. **Migráció:** Supabase → SQL Editor → a teljes `supabase/migrations/0019_quote_completion.sql` → Run.
   - Egy lépés (nincs új enum-érték), kétszer is futtatható.
   - A kód nélküle is működik:
     - a falazat nem mentődik, a vályogszűrő nem vesz ki semmit;
     - a napi feladat nem küld levelet;
     - a hírlevél-űrlap hibát jelez, az admin oldal kiírja, hogy futtatni kell a migrációt.
2. **Vercel → Settings → Environment Variables (Production):**
   - `CRON_SECRET` = hosszú véletlen szöveg (pl. `openssl rand -hex 32`). Enélkül a napi feladat nem fut.
   - `RESEND_AUDIENCE_ID` — nem kötelező.
   - Utána új deploy. A Vercel Cron a `vercel.json` alapján magától indul (Settings → Cron Jobs).
3. **Demótartalom törlése** (Supabase SQL Editor, `scripts/sql/remove-demo-content.sql`):
   - 1. RÉSZ: listázza a jelölteket — nézd át;
   - 2. RÉSZ: törlés `ROLLBACK`-kel, a számok mutatják, mi menne;
   - ha minden stimmel, az utolsó sorban írd át a `ROLLBACK`-et `COMMIT`-ra, és futtasd újra;
   - 3. RÉSZ: kilistázza a megmaradt fotómappákat, ezeket a Supabase → Storage felületen kell törölni.
   - Jelöltek: „Demo” kezdetű hirdetések (9500–9599), a 0002-es hat mintahirdetés (6412, 6518, 6733, 6845, 6902, 7118), és a „Demó” blogcikkek.
4. Ha a meglévő hirdetések közül a pontosként jelölteket is közelítőre akarják állítani: `update properties set precision = 'approximate' where precision = 'exact';` — ezt szándékosan nem tettük a migrációba, mert lehet, hogy valaki tudatosan választotta a pontosat.

---

## 3. Mit ellenőriztünk

| Ellenőrzés | Eredmény |
|---|---|
| `npx astro check` | 0 hiba, 0 figyelmeztetés |
| `npm run verify:dev` (build + SSG + kontraszt) | sikeres; 2 ismert figyelmeztetés (KvK hiányzik, francia oldal hreflang) |
| JS-keret | a térkép háttérfolyamata külön soron: 130 kB tömörítve, csak térképes oldalon |
| PGlite, 0001→0019, a 0019 kétszer | sikeres. Ellenőrizve: lejárt hirdetés kiesik a keresésből, a vályogszűrő csak a vályogot veszi ki, tulajdonos nem írhatja a lejárati/visszaigazolási mezőket, névtelenül nem lehet hírlevél-sort beszúrni |
| Demó-SQL PGlite-ban | `ROLLBACK`-kel semmit nem töröl; `COMMIT`-tal a hat mintahirdetés eltűnik |
| `npm run test:rules` | 48 ellenőrzés: dátumszámítás, lejárati/visszaigazolási döntések, lejárt számla, aláírt linkek, vályogszűrő, telefonszabály, eltolás |
| Szélesség 375 / 768 / 1280 / 1600 px, HU és NL | főoldal, lista, térkép, feladás, kapcsolat, GYIK, hirdetés, ár/eladva/hosszabbítás oldal, hírlevél oldalak, EN/DE oldalak: sehol nincs vízszintes túlcsordulás |
| Levélminták | [/dev/emails](http://localhost:4321/dev/emails) — `expiryReminder`, `expiryReminderLast`, `listingExpired`, `listingRenewed`, `renewalTransfer`, `ownerRefresh`, `ownerRefreshReminder`, `adminOwnerPriceChange`, `adminOwnerSold`, `newsletterConfirm` (+ `En`, `De`) |

**Nem tudtuk ellenőrizni** (éles írás vagy belépés kellene hozzá): egy valódi napi futás és a levelek kézbesítése, Stripe-os és átutalásos hosszabbítás végig, a „Még eladó” link (megnyitáskor ír az adatbázisba), hírlevél-feliratkozás és a Resend közönség, és a belépés utáni admin képernyők (Áttekintés kártyái, Hírlevél, szerkesztő lejárati blokkja) képernyőképen. Ezek a 0019 után egy próbahirdetéssel kipróbálhatók.

---

## 4. Alapértelmezések, amiket az ügyfélnek meg kell erősítenie

Mindegyik átállítható: Beállítások → Szolgáltatások (a nyitvatartás: Cégadatok).

| Szabály | Alapérték |
|---|---|
| Lejárat előtti emlékeztetők | 14 és 3 nappal előtte, plusz egy levél lejáratkor |
| Hosszabbítás | 6 hónap, 25 € (a meglévő árlistatétel); a lejárattól számít |
| Havi visszaigazolás | bekapcsolva; 30 naponta; emlékeztető 7 nap után; „Nem válaszolt” 14 nap után; linkek 30 napig érvényesek |
| Árváltozás a linken | azonnal él, elbírálás nélkül; a másik pénznem a hirdetés eddigi HUF/EUR arányával számolódik |
| Telefonszám a hirdetésben | Standard: nem, Kiemelt: igen (plusz a hirdető hozzájárulása) |
| Térképes pontosság | új hirdetésnél közelítő; a kör kb. 1 km, a középpont 250–650 m-rel eltolva |
| Térkép alaptérkép | OpenFreeMap, amíg nincs saját PMTiles |
| Hírlevél | kétlépcsős; „havonta legfeljebb egy-két levél” ígéret a feliratkozásnál |
| Nyitvatartás | hétköznap 09:00–18:00, visszahívás 21:00-ig, hétvégén is |

**Nyitott kérdések**

- **Nyitvatartás:** tényleg van hétvégi visszahívás 21:00-ig? Ha nincs, a Cégadatokban egy pipa kikapcsolja, és mindenhol egyszerre változik.
- **Hírlevél:** ki írja és küldi a hírlevelet, milyen gyakran? Az adatvédelmi bekezdést jogásznak kell jóváhagynia.
- A napi feladat futásonként legfeljebb 80 levelet küld; a maradék másnap megy ki. Kis állománynál ez bőven elég.
