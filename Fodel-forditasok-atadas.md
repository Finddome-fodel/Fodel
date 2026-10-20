# FODEL: angol, német és francia nyelv, átadás

Rövid, gyakorlati összefoglaló. Semmi nincs commitolva vagy pusholva. Az éles adatbázishoz és a `.env`-hez nem nyúltam, migrációt nem futtattam, űrlapot éles szerver ellen nem küldtem be.

## Mit kell Önnek megcsinálni

1. **Migráció kézzel:** `supabase/migrations/0020_translations.sql`. Újrafuttatható. Két dolgot tesz: a hírlevél-feliratkozók nyelvi korlátját kiegészíti a `fr` értékkel (enélkül a francia oldalról a feliratkozás hibára futna), és az ingatlan-szótárnak (kategória, jellemző, állapot, fűtés, falazat, blogkategória) megadja az angol, német, francia nevét, a kategóriáknak pedig az URL-szavát. Admin által begépelt szöveget nem ír felül. A kód ugyanezt a szöveget tartalmazza (`src/data/taxonomy-i18n.ts`, `src/i18n/ui.ts`), ezért a migráció nélkül is helyesen olvasható az oldal. A 0015, 0017, 0018 és 0019 migrációknak a korábbi átadás szerint le kell futniuk.
2. **Jogi oldalak jóváhagyása.** Az angol, német és francia adatvédelmi, ÁSZF, süti, impresszum és akadálymentesítési szöveg a magyar és holland eredetiből készült hűséges fordítás, de **ügyvéddel át kell nézetni**, mielőtt élesben marad. Minden ilyen oldal tetején ott van a tájékoztató mondat (angolul: „This is a translation for convenience. In case of differences, the Dutch (for Dutch law matters) or Hungarian original prevails.”, németül és franciául ugyanez a tartalom).
3. **Visszatérítési szabály és értékbecslési tájékoztató.** Ezt az admin hu és nl nyelven tárolja. Az en/de/fr oldalon a holland szöveg jelenik meg, „holland nyelvű” jelöléssel. Nem fordítottam le magam, mert jóváhagyott szöveget nem fordítunk.
4. **Meghívólevelek en/de/fr nyelven.** A beépített meghívó csak magyarul és hollandul van, az en/de/fr meghívót csak admin által jóváhagyott sablonból lehet küldeni (Beállítások → Meghívólevelek), placeholder szöveggel soha.
5. **KvK-szám:** továbbra is hiányzik a `src/config/company.ts`-ből (a `verify:ssg` ezt `--allow-missing-kvk` nélkül akadályként jelzi).
6. Ha elégedett, mondja, és commitolok kisebb csomagokban, majd pusholok.

## Ügyfél-döntések, amelyeket Gáborral és Évával le kell zárni

- **Francia márkanév:** `FODEL IMMOBILIER` (a német `FODEL IMMOBILIEN`, az angol `FODEL REAL ESTATES`). Ha a francia vevőknek más kell, a `BRAND.fr` módosul az `src/i18n/ui.ts`-ben.
- **x-default** továbbra is a holland oldal. Az angol nyelvű böngészők (en-GB, en-US) az angol oldalra mennek, minden más ismeretlen nyelv a hollandra.
- **Eladói portál:** az angol profilú eladó angol, a német és francia profilú eladó **holland** felületet kap (a vezetett beállítás, számlázás, fotófeltöltés, bejelentkezés viszont mind az 5 nyelven megvan). Az admin felület végig magyar maradt.
- **Eladói szöveg a hirdetésen:** az eladó leírása és címe nincs gépi fordítással lefordítva. Ha az eladó fizetett angol, német vagy francia fordításért, az jelenik meg. Ha nincs, a holland szöveg látszik „Description in Dutch” jellegű jelöléssel (a három nyelven a saját szavaival), ha az sincs, a magyar. A blogcikkeknél ugyanez, az ilyen helyettesítő oldalak a kanonikus címkével az eredetire mutatnak, hreflang nélkül.
- **Tényadatok** (árak, telefonszámok, nyitva tartás, jutalék) mindenhol a `company.ts`-ből és a csomagkatalógusból jönnek, a nyelvi szövegekből semmit nem találtam ki.
- **Számlák** (PDF) továbbra is kétnyelvűek (magyar és holland), a számlát kísérő e-mail viszont már az ügyfél nyelvén megy.

## Oldalak címei nyelvenként

| Oldal | HU | NL | EN | DE | FR |
|---|---|---|---|---|---|
| Ingatlanok | /hu/ingatlanok/ | /nl/woningen/ | /en/properties/ | /de/immobilien/ | /fr/biens/ |
| Eladóknak | /hu/eladoknak/ | /nl/adverteren/ | /en/sell/ | /de/verkaufen/ | /fr/vendre/ |
| Vevőknek | /hu/vevoknek/ | /nl/kopers/ | /en/buy/ | /de/kaufen/ | /fr/acheter/ |
| Rólunk | /hu/rolunk/ | /nl/over-ons/ | /en/about-us/ | /de/ueber-uns/ | /fr/a-propos/ |
| Kapcsolat | /hu/kapcsolat/ | /nl/contact/ | /en/contact/ | /de/kontakt/ | /fr/contact/ |
| Blog | /hu/blog/ | /nl/nieuws/ | /en/blog/ | /de/blog/ | /fr/blog/ |
| Árlista | /hu/arlista/ | /nl/tarieven/ | /en/prices/ | /de/preise/ | /fr/tarifs/ |
| Hirdetés feladása | /hu/hirdetes-feladasa/ | /nl/advertentie-plaatsen/ | /en/place-an-ad/ | /de/inserat-aufgeben/ | /fr/deposer-une-annonce/ |
| Kerestetés | /hu/kerestetes/ | /nl/zoekdienst/ | /en/property-search/ | /de/suchauftrag/ | /fr/recherche-de-bien/ |
| Értékbecslés | /hu/ertekbecsles/ | /nl/waardebepaling/ | /en/valuation/ | /de/bewertung/ | /fr/estimation/ |
| Szolgáltatások | /hu/szolgaltatasok/ | /nl/diensten/ | /en/services/ | /de/leistungen/ | /fr/services/ |
| Agráringatlan | /hu/agraringatlan/ | /nl/agrarisch-vastgoed/ | /en/agricultural-property/ | /de/agrarimmobilien/ | /fr/immobilier-agricole/ |
| GYIK | /hu/gyik/ | /nl/veelgestelde-vragen/ | /en/faq/ | /de/haeufige-fragen/ | /fr/questions-frequentes/ |
| Fotózási útmutató | /hu/fotozasi-utmutato/ | /nl/fotografiegids/ | /en/photo-guide/ | /de/fotoratgeber/ | /fr/guide-photo/ |
| Vásárlás Magyarországon | /hu/vasarlas-magyarorszagon/ | /nl/kopen-in-hongarije/ | /en/buying-in-hungary/ | /de/kaufen-in-ungarn/ | /fr/acheter-en-hongrie/ |
| Költözés | /hu/holland-koltozes/ | /nl/emigreren/ | /en/moving-to-hungary/ | /de/auswandern-nach-ungarn/ | /fr/s-installer-en-hongrie/ |
| Eladva | /hu/eladva/ | /nl/verkocht/ | /en/sold/ | /de/verkauft/ | /fr/vendus/ |
| Térkép | /hu/terkep/ | /nl/kaart/ | /en/map/ | /de/karte/ | /fr/carte/ |
| Top 10 | /hu/top-10/ | /nl/top-10/ | /en/top-10/ | /de/top-10/ | /fr/top-10/ |
| Adatvédelem | /hu/adatvedelem/ | /nl/privacy/ | /en/privacy/ | /de/datenschutz/ | /fr/confidentialite/ |
| ÁSZF | /hu/aszf/ | /nl/voorwaarden/ | /en/terms/ | /de/agb/ | /fr/conditions/ |
| Sütik | /hu/cookie-tajekoztato/ | /nl/cookies/ | /en/cookies/ | /de/cookies/ | /fr/cookies/ |
| Impresszum | /hu/impresszum/ | /nl/colofon/ | /en/imprint/ | /de/impressum/ | /fr/mentions-legales/ |
| Akadálymentesség | /hu/akadalymentesites/ | /nl/toegankelijkheid/ | /en/accessibility/ | /de/barrierefreiheit/ | /fr/accessibilite/ |
| Köszönő oldal | /hu/koszonjuk/ | /nl/bedankt/ | /en/thank-you/ | /de/danke/ | /fr/merci/ |

A hirdetések címe: `/{nyelv}/{kategória-szó}-{elado|te-koop|for-sale|zu-verkaufen|a-vendre}-{azonosító}/`. A kategória-szavak a 0020 migrációban és az `src/i18n/ui.ts`-ben vannak. A meglévő magyar és holland címek **nem változtak**. A gyökéroldal (`/`) a nyelvválasztó cookie-t, majd a böngésző nyelveit követi.

## Mi készült el

- **Szerkezet:** 5 nyelv egy típusból (`src/i18n/ui.ts`), hreflang kölcsönösen mind az 5 nyelvre, x-default, sitemap, robots, `llms.txt`, `og:locale`, `<html lang>` (angolnál `en-GB`), 404, nyelvválasztó 5 névvel (billentyűzettel és Safariban is).
- **Szótár:** `src/i18n/GLOSSARY.md` (egy fogalom, egy szó nyelvenként). Ez készült el először.
- **Szövegek:** minden oldal, űrlap, hibaüzenet, süti-sáv, lábléc, GYIK, fotós útmutató, értékbecslő kérdések, jellemzők, falazat, jogi oldalak, blog, hirdetéskártyák, térkép. Nyelvenkénti számformátum: angol `€178,000`, német `178.000 €` és „…”, francia `178 000 €` (keskeny nem törhető szóközzel) és « … » nem törhető szóközzel, `m²` nem törhető szóközzel.
- **E-mailek:** mind az 5 nyelven (regisztráció, jóváhagyás, fizetés, számla, hosszabbítás, hírlevél, értékbecslés, ajánlás, kerestető, érdeklődés visszaigazolás). A címzett nyelve: profil nyelve, ennek híján az űrlap nyelve, ennek híján az az oldal, ahonnan jött. Az admin értesítések mindig magyarok.
- **Űrlapok:** az ellenőrzés szabályai közösek, a hibaüzenet nyelvenként külön fájlban van, és csak az oldal saját nyelve töltődik be. A telefonmező országnevei az oldal nyelvén jelennek meg, a kiinduló ország: en → GB, de → DE, fr → FR.
- **Portál bejelentkezés és regisztráció** (belépés, regisztráció, elfelejtett jelszó, jelszócsere, meghívó): mind az 5 nyelven.
- **Javítások menet közben:** a francia árlista szerződéstáblájában az „à partir de 300 €” és a hosszú német oldalcímek (pl. „Geschäftsbedingungen”) 320 px-en vízszintes görgetést okoztak, ezek javítva (`PriceListPage.astro`, `PageHeader.astro`).

## Új tesztek és futtatásuk

A klónban (nem OneDrive-on) futtattam, a helyi `.env` érintetlen maradt.

```
npm run check                  # astro check, 0 hiba
npm run build
npm run test:rules             # 74 ellenőrzés, ebből az 5 nyelvű szabályok újak
npm run verify:ssg             # hreflang, lang, kanonikus, sitemap, JS-keret, jogi megjegyzés
npm run verify:contrast
npx playwright test            # chromium, webkit, mobile-safari, mobile-chrome
E2E_PORT=4401 npx playwright test --project=chromium
```

Új vagy bővített Playwright-fájlok (`tests/e2e/public/`): `pages.spec.ts` (minden oldal minden nyelven, 8 szélességen, konzolhiba és oldalra görgetés nélkül), `language.spec.ts` (váltás hu → nl → en → hu → de → fr → nl egérrel és billentyűzettel, gyökéroldal-átirányítás böngészőnyelv és cookie szerint), `forms.spec.ts` (űrlap-hibaüzenetek, telefon-alapország nyelvenként), `emails.spec.ts` (minden sablon × 5 nyelv), `nav.spec.ts`, és az új `translations.spec.ts` (hreflang kölcsönösség, nem maradt holland vagy magyar szöveg az en/de/fr oldalakon, jogi megjegyzés, 404 nyelve, árformátum). `/dev/emails?t=…&locale=en|de|fr` is működik.

## A 15 legfeltűnőbb szöveg nyelvenként

| # | Hol | EN | DE | FR |
|---|---|---|---|---|
| 1 | Menü: ingatlanok | Properties | Immobilien | Biens |
| 2 | Menü: eladóknak | For sellers | Für Verkäufer | Vendeurs |
| 3 | Menü: vevőknek | For buyers | Für Käufer | Acheteurs |
| 4 | Főoldal címe | Property in Hungary direct from the owner | Immobilien in Ungarn direkt vom Eigentümer | Immobilier en Hongrie directement du propriétaire |
| 5 | Elsődleges gomb | Browse properties | Immobilien ansehen | Voir les biens |
| 6 | Másodlagos gomb | Free property search | Kostenloser Suchauftrag | Recherche gratuite |
| 7 | Fejléc gomb | Place a listing | Inserat aufgeben | Déposer une annonce |
| 8 | Fiók | Sign in / Register | Anmelden / Registrieren | Connexion / Inscription |
| 9 | Visszahívás | Free callback | Kostenloser Rückruf | Rappel gratuit |
| 10 | Eladói oldal címe | Your property in Western Europe | Ihre Immobilie in Westeuropa | Votre bien en Europe de l’Ouest |
| 11 | Süti: elfogad / elutasít | Accept / Reject | Akzeptieren / Ablehnen | Accepter / Refuser |
| 12 | Üzenet küldése | Send message | Nachricht senden | Envoyer le message |
| 13 | Árlista gomb | View prices | Preise ansehen | Voir les tarifs |
| 14 | Szlogen | Buy property in Hungary direct from the owner | Immobilien in Ungarn direkt vom Eigentümer kaufen | Acheter un bien en Hongrie, directement auprès du propriétaire |
| 15 | Küldési hiba | Sending failed. Please try again, or call us. | Das Senden ist fehlgeschlagen. Bitte versuchen Sie es erneut oder rufen Sie uns an. | L’envoi a échoué. Veuillez réessayer ou nous appeler. |

**Miért így:**
- **Angol:** brit helyesírás és „you”. „Properties” a lista neve (a „listings” a feladott hirdetésé, innen a „Place a listing”). Rövid mondatok, nincs töltelékszöveg.
- **Német:** végig „Sie”. „Immobilien” és „Inserat” (a németajkú ingatlanportálok szava, nem „Anzeige” vagy „Annonce”). „Suchauftrag” az ingatlanos szakmai szó a kerestetésre.
- **Francia:** végig „vous”. „Biens” (a szakmai szó), „Déposer une annonce” (a francia hirdetőportálok kifejezése). Az írásjelek előtt nem törhető szóköz, a francia idézőjel « … ».
- A fejlécben a „Anmelden / Registrieren” és a „Connexion / Inscription” szándékosan két szó, nem mondat.

## Ismert korlátok

- Az eladói felület (vezetett beállítás, fotófeltöltés, számlázás, áttekintő) angolul teljes, németül és franciául holland.
- A számlák PDF-je kétnyelvű (hu/nl) maradt.
- A blog en/de/fr nyelven a valódi többnyelvű mechanizmust használja (`group_id`). Amíg nincs lefordított cikk, a helyettesítő oldal a holland vagy magyar eredetit mutatja, jelöléssel.
- A hirdetésoldalak vizuális ellenőrzése üres tesztadatbázison, egy kitalált teszthirdetéssel történt. Éles hirdetésen érdemes egyszer végignézni a német és francia oldalt.
