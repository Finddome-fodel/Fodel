# FODEL: indulás előtti átadás

Rövid, gyakorlati összefoglaló a „launch readiness” körről. Semmi nincs commitolva vagy pusholva, az éles adatbázishoz és a `.env`-hez nem nyúltam.

## Mit kell Önnek megcsinálni indulás előtt

1. **Migrációk.** Ebben a körben **nincs 0020-as migráció**: minden új funkció meglévő oszlopokat használ. Viszont a varázsló és a számlázás a korábbi migrációkra épül. Ha a **0015, 0017, 0018, 0019** még nem futott le az éles adatbázison, futtassa le őket sorrendben, mielőtt a kódot kitelepíti (különösen: `requested_extras` a 0015-ből, `wall_key` a 0019-ből, `billing` a 0018-ból).
2. **Resend**: lásd lent, domain-ellenőrzés és kulcs.
3. **Stripe**: lásd lent, kulcsok, webhook, események.
4. **KvK-szám**: továbbra is hiányzik a `src/config/company.ts`-ből. A `verify:ssg` ezt indulási akadályként jelzi. Holland jog szerint ki kell tenni.
5. Ha elégedett, mondja, és commitolok kisebb, logikus csomagokban, majd pusholok.

## Mi változott, területenként

**Safari és böngészők.** A nyelvválasztó Safariban nem működött (az `focusout` eseménynél Safari nem ad `relatedTarget`-et, így a menü azonnal bezáródott kattintáskor). Újraírva: külső kattintásra és Esc-re zár, billentyűzettel is használható, a választott nyelvet cookie-ban megjegyzi, a kezdőoldal (`/`) ezt követi. Továbbá: a süti-sáv Safariban elszállt (`requestIdleCallback` nincs Safariban), ez javítva. A térkép betöltési hibái nem dobnak oldalhibát. A portál fiókja és párbeszédablakai nem maradnak nyitva, ha a böngésző „vissza” gombbal gyorsítótárból hozza az oldalt. Hover-hatások csak egérrel (nem érintőképernyőn), iOS-en az űrlapmezők 16 px-esek (nincs ráközelítés), `-webkit-backdrop-filter`, biztonsági sávok (`env(safe-area-inset-*)`), `dvh` egységek.

**Navigáció.** Új „Belépés / Regisztráció” gomb (ikon + szöveg, kis képernyőn és 1400 px alatt csak ikon, a teljes felirat megmarad hozzáférhető névként) és feltűnő „Hirdetés feladása” gomb (lassú fényív és kétszeri halo, mozgáscsökkentésnél statikus). A mobil menüben mindkettő megvan. Nem használ osztott színt, körvonalat, színátmenetes szöveget vagy dőlt hatást.

**Új eladói folyamat.**
1. Az **ingyenes regisztráció** a „Hirdetés feladása” oldalon vagy a `/portal/register` oldalon: név, e-mail, telefon (nemzetközi mező), hozzájárulás. A `?ref=` ajánlókód átmegy.
2. Megjelenik a „Nézze meg a postafiókját” panel: kinek ment a levél, mi a feladó és a tárgy, 7 napig él a link, spam-mappa tipp, **újraküldés** gomb (60 mp visszaszámlálás), „rossz cím? módosítás”.
3. A levélben **egyetlen gomb**: jelszó beállítása. A link 7 napig érvényes, lejárt vagy már felhasznált linknél új linket lehet kérni. Ha az e-mailhez már van fiók, a rendszer ezt nem árulja el az oldalon, hanem „már van fiókja” levelet küld (belépés / elfelejtett jelszó linkkel).
4. Jelszó beállítása (egy mező, mutat/elrejt, élő szabály: legalább 8 karakter), utána **vezetett beállítás** hat lépésben: Csomag, Ingatlan adatai, Leírás, Fotók, Számlázás, Összegzés. Minden lépés külön mentődik, bármikor lehet kilépni és később folytatni (az irányítópulton „Folytassa a hirdetés összeállítását” kártya). Az eladó nyelvén (hu vagy nl) jelenik meg.
5. A beküldés után a meglévő út következik változatlanul: admin átnézi, jóváhagyja, díjbekérő és e-mail, fizetés (kártya vagy átutalás), megjelenés.
6. A régi, nagy adatcsomagos meghívók továbbra is működnek (előtöltik a beállítást).

**Űrlapok.** Nemzetközi telefonmező mindenhol, ahol telefon kell (regisztráció, kapcsolat, visszahívás, érdeklődés, kerestető, értékbecslés, profil, számlázás, hirdetésszerkesztő): ország-választó zászlóval és hívószámmal, kereshető lista, a példa országonként változik, gépelés közben formáz, a `+31...` bemásolás átállítja az országot. Eltárolt formátum: E.164. Irányítószám, adószám, ár, terület, URL ellenőrzése országhoz illeszkedően, ugyanazokkal a szabályokkal a böngészőben és a szerveren. Hibaösszegző az űrlap tetején, az első hibás mezőre ugrik a fókusz, a hibák saját nyelven jelennek meg („Adjon meg egy érvényes holland telefonszámot, pl. +31 6 12345678.”). Minden mezőn kiírva: „(kötelező)” vagy „(nem kötelező)”. Javítottam egy hibát is: a kerestetőben begépelt „250.000” keret korábban 250-ként mentődött volna.

**Admin: mindenhol legújabb elöl.** Beérkező, hirdetések, érdeklődések, felhasználók, számlák, fizetések, hírlevél, blog és az adatbázis-nézet legújabb elöl; azonos időpontnál azonosító szerinti sorrend. Az „x perce / órája” mellé a pontos időpont súgóként. A Beérkező oldalon új oszlop: „Regisztrált, még nem állított be jelszót” (újraküldés, törlés). Szándékos kivételek (rangsor, kategóriák sorrendje stb.) egysoros megjegyzéssel jelölve a kódban.

**Nyelvi csiszolás.** Magyarban „Ön”, hollandban „u”, németben „Sie”, franciában „vous”, angolban brit írás. A gondolatjeles (—) szerkezetek nagy része vesszőre, kettőspontra vagy új mondatra cserélve (oldalcímek, szövegek, e-mail tárgyak). Magyar ezreselválasztó szóköz (`€ 178 000`, `2 000 €`), hollandban pont. Tényeket, árakat, ígéreteket nem változtattam. A jogi oldalaknál (`pages-legal.ts`) csak két oldalcímet igazítottam, a szöveghez nem nyúltam.

**Tesztek és Stripe.** Playwright teszt-keret (lásd lent). Ezt a kört ellenőrizve találtam egy lappangó hibát: az Astro az `STRIPE_ENABLED=true` értéket logikai `true`-ként adja át, a kód pedig `=== 'true'`-t várt, ezért a kártyás fizetés (és az `AI_ENABLED`, `PAYMENT_GATES_PUBLISHING`) **akkor sem kapcsolt volna be, ha a változó helyesen be van állítva**. Mindhárom `String(...)` összehasonlítást kapott. Ha az éles oldalon eddig nem jelent meg a kártyás gomb, ez lehetett az oka.

## A 12 leglátványosabb szövegváltozás (előtte → utána)

| # | Előtte | Utána |
|---|---|---|
| 1 | Eladóknak — Hirdesse ingatlanát Nyugat-Európában | Eladóknak \| Hirdesse ingatlanát Nyugat-Európában |
| 2 | Magyar **I**ngatlanok Nyugat-Európában (főcím) | Magyar ingatlanok Nyugat-Európában |
| 3 | A visszahívást mi fizetjük — Önnek semmibe nem kerül. | A visszahívást mi fizetjük. Önnek semmibe nem kerül. |
| 4 | …nyelven, 8 országban — kizárólagossági szerződés nélkül. | …nyelven, 8 országban, kizárólagossági szerződés nélkül. |
| 5 | Ha hirdet, ő 10%-ot spórol, Ön 10%-ot jóváírunk | Ha hirdet, ő 10% kedvezményt kap, Ön pedig 10% jóváírást |
| 6 | Találja meg álmai ingatlanát | Találja meg az Önnek való ingatlant |
| 7 | Kérjük töltse ki ezt a mezőt. | Kérjük, töltse ki ezt a mezőt. |
| 8 | FODEL közvetítésnél: 4% nettó (min. 2.000 €) | FODEL közvetítése esetén: 4% nettó (min. 2 000 €) |
| 9 | Hirdetését megkaptuk — #7213 (e-mail tárgy) | Hirdetését megkaptuk (#7213) |
| 10 | Állítsa be a jelszavát — FODEL | Állítsa be a jelszavát \| FODEL |
| 11 | Automatikus hirdetéscím: Balatonfüred — Családi ház | Családi ház, Balatonfüred |
| 12 | NL: Gefilterde zoekopdracht / Provincie / Wij stuurden u een bevestigingsmail — klik… | Woningen filteren / Comitaat / Wij hebben u een bevestigingsmail gestuurd. Klik… |

## Amiben az ügyfél döntsön (nem nyúltam hozzá)

- **„Egyedülálló” hirdetési modell** (kezdőlap, GYIK, Eladóknak): szuperlatívusz, jogilag és marketingben ügyfél-döntés. Én meghagytam.
- A GYIK egy régi, idézőjeles szakasza (a régi oldalról átvéve, két gondolatjellel) szó szerint megmaradt.
- Az „Agráringatlan” oldal magyar címében a „300 hektár” beégetett szám, a hollandban konstansból jön. Érdemes egy helyre vinni, ha változik.
- Egy lejárt Stripe-munkamenet (24 óra után) a rendelést „lemondottra” állítja, és onnan az eladó nem tud újra kártyával fizetni; ilyenkor az adminnak új rendelést kell létrehoznia. Ez régi viselkedés, nem módosítottam.
- A varázsló az EUR-összeget a Szolgáltatások beállításban megadott árfolyammal számolja, ennek hiányában 400 Ft/€ **helyőrzővel** (ugyanaz, mint a régi intake). Állítsa be a valós árfolyamot.
- A régió mezőt a varázslóban az admin tölti ki, a koordinátákat a település alapján a Nominatim adja.
- A design-rendszerben nem volt „arany” token, ezért felvettem a `--gold` értéket (`tokens.css`); a `GoldRule` továbbra is az ink színét használja.

## Resend: beüzemelési lista

A kód felkészült: kulcs nélkül naplóz és nem száll el; `EMAIL_TRANSPORT=capture` esetén a leveleket fájlba írja (`.e2e/outbox/`); kulccsal 429 és 5xx hibánál háromszor újra próbál (400 ms, 800 ms), hibás kérést nem ismétel; a feladó, válaszcím és fogadó a `FODEL_FROM`, `FODEL_REPLY_TO`, `FODEL_INBOX` változókból jön. Minden sablon renderel hu és nl nyelven, van szöveges változat, a linkek az éles domainre mutatnak (tesztelve).

1. Resend → Domains → **Add domain `finddome.com`**. A megadott **SPF (TXT)**, **DKIM (3 db CNAME/TXT)** rekordokat vegye fel a DNS-nél. Várja meg a „Verified” állapotot.
2. **DMARC** TXT rekord a `_dmarc.finddome.com` névre, például `v=DMARC1; p=none; rua=mailto:info@finddome.com` (később szigorítható).
3. Resend → API Keys → kulcs („Sending access”). Vercel → Environment Variables: `RESEND_API_KEY`, és ellenőrizze: `FODEL_FROM="FODEL <info@finddome.com>"`, `FODEL_INBOX`, `FODEL_REPLY_TO`.
4. Hírlevélhez: Resend → Audiences → hozzon létre egyet, az azonosítóját tegye `RESEND_AUDIENCE_ID`-ként. Nélküle az adatbázis a lista, ez is működik.
5. **Füstteszt:** a portálon vagy a kapcsolat űrlapon küldjön egyet, és külön egy tesztet a `delivered@resend.dev` címre. A Resend irányítópultján „Delivered” állapotot kell látnia.
6. `EMAIL_TRANSPORT` éles környezetben **maradjon üres**.

## Stripe: beüzemelési lista

A kód felkészült: a Checkout összege mindig a tárolt rendelésből jön, sosem a kérésből; `STRIPE_ENABLED` kikapcsolva a teljes átutalásos út működik, kártyás gomb nélkül; a webhook aláírást ellenőriz és hibás aláírásnál 400-at ad; minden eseményre 200-zal válaszol, hogy a Stripe ne ismételgessen; ismételt kézbesítés nem fizet és nem publikál kétszer. Új: a késleltetett fizetési módok (`async_payment_succeeded` / `failed`) kezelése.

1. Stripe → Developers → API keys: **teszt** kulcsok először. Vercel: `STRIPE_ENABLED=true`, `STRIPE_SECRET_KEY=sk_test_…`. A változás **újratelepítést** igényel (build-időben olvassa).
2. Stripe → Developers → Webhooks → Add endpoint: `https://finddome.com/api/stripe/webhook`. Pontosan ezekre az eseményekre iratkozzon fel:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
3. A „Signing secret” (`whsec_…`) → Vercel: `STRIPE_WEBHOOK_SECRET`.
4. Tesztkártyák: `4242 4242 4242 4242` sikeres; `4000 0025 0000 3155` 3D Secure kérés; `4000 0000 0000 0002` elutasított. Menete: jóváhagyott hirdetésnél „Fizetés kártyával” → fizetés → a hirdetés megjelenik, a számlatervezet létrejön, az eladó kap visszaigazolást.
5. Ha minden rendben, váltson **éles** kulcsokra és új webhook-titokra (az élesnek külön végpontja és titka van), és telepítsen újra.

## Tesztkörnyezet

- **Nyilvános tesztek, adatbázis nélkül** (alapértelmezett): a kód egy üres, csak olvasható adatbázis-helyettesítőt indít (`127.0.0.1:54399`), így a teszt az éles adatbázist soha nem éri el. Nem lehet űrlapot beküldeni: az `/api` felé menő nem GET kéréseket a teszt maga válaszolja meg.
- Futtatás **az OneDrive-on kívüli másolatból** (a `node_modules` ott időtúllép): `rsync -a --exclude node_modules --exclude dist --exclude .env ./ ~/fodel-build/`, majd ott `npm install`, `npx playwright install`, `npm run test:e2e` (vagy `npm run test:e2e:webkit`). A másolatban **ne legyen `.env`**, a keret visszautasítja az indulást, ha van.
- **Írásos (életciklus) tesztek**: külön, ingyenes Supabase projekt kell „fodel-test” néven (vagy Docker Desktop + `supabase start`), a 0001–0019 migrációkkal. Másolja át a `.env.test.example`-t `.env.test`-be, töltse ki, és `E2E_ALLOW_WRITES=1`. A keret csak helyi vagy a megnevezett teszt-projektet engedi; az éleshez nem fog írni. A `scripts/verify-rls.mjs` és `verify-workflow.mjs` is csak ezen futtatható.
- Az életciklus-teszt (`tests/e2e/lifecycle/registration.spec.ts`: regisztráció, e-mail, jelszó, varázsló) **meg van írva, de még nem futott le**, mert nincs teszt-adatbázis. Az első futáskor szelektorokat kell majd igazítani. A teljes végig-teszt (fotólimit, admin jóváhagyás, fizetés, cron, megújítás) még nincs megírva.

## Mit ellenőriztem, és mit nem

Ellenőrizve (egy OneDrive-on kívüli másolatban): `astro check` 0 hiba, `npm run build` sikeres, `test:rules` **70/70**, `verify:ssg` sikeres (új: az űrlap-validáló modul külön, gzipelve 38,6 kB, csak mezőhasználatkor tölt be; az egyéb kliens-JS 85 kB a 100 kB-os kereten belül), `verify:contrast` sikeres, Playwright **228 sikeres, 44 kihagyott** (Chromium, WebKit, iPhone 15, Pixel 7; a kihagyottak: az írásos tesztek és a mobilon értelmetlen asztali esetek). Az oldalak 8 szélességben (320–1920 px), magyarul és hollandul, vízszintes túlcsúszás és konzolhiba nélkül.

**Nem ellenőrizhető/nem történt meg:**
- **Firefox** ezen a Macen nem indul (macOS 27 és a Playwright Firefox-build összeférhetetlensége). Linuxon/CI-ben vagy újabb Playwrighttal futtatható.
- A **vezetett beállítás** és a Beérkező új oszlopa **élő adat nélkül nem látható**: kódszinten kész, típusellenőrzött, de böngészőben még senki nem látta.
- Seller életciklus, admin jóváhagyás, tényleges Stripe- és Resend-küldés: nincs hozzájuk teszt-adatbázis és kulcs.
- Lighthouse-mérés nem készült.
- A `formatCents` (rendelési tételek, számlák) még holland számformátumot használ; a ritka 1000 € feletti összegek magyar e-mailben ponttal jelennének meg.

## Új és módosított fájlok (főbbek)

`playwright.config.ts`, `tests/e2e/**`, `.env.test.example`, `src/lib/validation.ts`, `src/lib/email/retry.ts`, `src/lib/portal/{registration,setup,auth-copy}.ts`, `src/components/forms/{PhoneField,RegisterForm,Field,FormShell}.astro`, `src/components/portal/{AuthTabs,PhotoUploader,Ago}.astro`, `src/pages/portal/register`, `src/pages/portal/properties/[id]/setup.astro`, `src/pages/api/portal/invite/renew.ts`, `src/components/{Nav,LanguageSwitcher,CookieConsent,PackageCard}.astro`, `src/components/pages/SubmitAdPage.astro`, `src/lib/{form-handler,format}.ts`, `src/pages/api/stripe/webhook.ts`, `scripts/{test-rules,verify-ssg}.mjs`.
