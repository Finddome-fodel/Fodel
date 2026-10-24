# FODEL: spanyol, lengyel, román és szlovák nyelv, átadás

Rövid, gyakorlati összefoglaló. A munka a `feat/i18n-es-pl-ro-sk` ágon van, pull requestként a `main` felé, **nincs összefésülve**. Az éles adatbázishoz és a `.env`-hez nem nyúltam, és migrációt sem futtattam.

A négy új nyelv pontosan úgy épül fel, mint az angol, a német és a francia (lásd `Fodel-forditasok-atadas.md`). Minden, ami franciául megvan, most spanyolul, lengyelül, románul és szlovákul is megvan.

## Mit kell Önnek megcsinálni

1. **Migráció kézzel, a telepítés ELŐTT:** `supabase/migrations/0023_es_pl_ro_sk.sql` (újrafuttatható, a 0022 után).
   - A `locale_code` enumot kiegészíti az `es`, `pl`, `ro` és `sk` értékkel. Enélkül az új nyelvű hirdetésfordítás, értékbecslés, e-mail-sablon és blogcikk mentése hibára futna.
   - A hírlevél nyelvi korlátját mind a 9 nyelvre bővíti.
   - Az ingatlan-szótárnak (kategória, jellemző, állapot, fűtés, falazat, blogkategória) megadja a 4 új nyelvű nevet, a kategóriáknak pedig az URL-szót.
   - Admin által begépelt szöveget nem ír felül.
2. **Jogi oldalak jóváhagyása.** A spanyol, lengyel, román és szlovák adatvédelmi, ÁSZF, süti, impresszum és akadálymentesítési szöveg a francia változat mintájára készült hű fordítás, a tetején a „ez egy tájékoztató fordítás” megjegyzéssel. Élesítés előtt **ügyvéddel át kell nézetni**.
3. **Meghívólevelek az új nyelveken:** ahogy en/de/fr esetén is, csak admin által jóváhagyott sablonból lehet küldeni (Beállítások → Meghívólevelek).
4. **KvK-szám:** továbbra is hiányzik a `src/config/company.ts`-ből.

## Ügyfél-döntések

- **Márkanevek** (`BRAND` az `src/i18n/ui.ts`-ben): FODEL INMOBILIARIA, FODEL NIERUCHOMOŚCI, FODEL IMOBILIARE, FODEL NEHNUTEĽNOSTI. A szlogeneket és a pozicionáló mondatokat én fogalmaztam, ezek nem az ügyfél által kiadott szövegek.
- **A főoldal aláírássávja** továbbra is az eredeti 5 nyelvet mutatja (hu, nl, de, en, fr). Ugyanígy maradt az „5 nyelven hirdetünk” jellegű üzleti állítás is (fizetett hirdetésfordítás, `llms.txt`, a schema.org `knowsLanguage`), és a „8 ország”. Az iroda munkatársai nem beszélnek spanyolul, lengyelül, románul vagy szlovákul, ezért az új nyelveken nem állítottam, hogy az ügyfélszolgálat ezeken a nyelveken is elérhető. Ha bővül a kínálat, ezeket kell átírni.
- **x-default** továbbra is a holland oldal. A böngésző nyelve szerinti átirányítás az es-*, pl-*, ro-* és sk-* böngészőket az új nyelvre viszi.
- **Eladói portál:** a francia és a német mintájára az új nyelvű eladó **holland** felületet kap. A belépés, a regisztráció és a jelszócsere mind a 9 nyelven megy.
- **Stripe pénztár és számla-PDF:** ugyanúgy működik, mint fr esetén (a PDF kétnyelvű marad, hu/nl).
- **Spanyol számformátum:** `1.200` (ezres pont, négyjegyű számnál is), mert ezt adja az `Intl` és ez a spanyol akadémiai szabály. Ha a négyjegyű számokat pont nélkül szeretnék (`1200`), az egy kis módosítás a `src/lib/format.ts`-ben.

## Oldalak címei nyelvenként

| Oldal | ES | PL | RO | SK |
|---|---|---|---|---|
| Főoldal | /es/ | /pl/ | /ro/ | /sk/ |
| Ingatlanok | /es/inmuebles/ | /pl/nieruchomosci/ | /ro/proprietati/ | /sk/nehnutelnosti/ |
| Eladóknak | /es/vender/ | /pl/sprzedaz/ | /ro/vanzare/ | /sk/predaj/ |
| Vevőknek | /es/comprar/ | /pl/kupno/ | /ro/cumparare/ | /sk/kupa/ |
| Rólunk | /es/sobre-nosotros/ | /pl/o-nas/ | /ro/despre-noi/ | /sk/o-nas/ |
| Kapcsolat | /es/contacto/ | /pl/kontakt/ | /ro/contact/ | /sk/kontakt/ |
| Blog | /es/blog/ | /pl/blog/ | /ro/blog/ | /sk/blog/ |
| Árlista | /es/tarifas/ | /pl/cennik/ | /ro/tarife/ | /sk/cennik/ |
| Hirdetés feladása | /es/publicar-anuncio/ | /pl/dodaj-ogloszenie/ | /ro/publica-anunt/ | /sk/podat-inzerat/ |
| Kerestetés | /es/busqueda-de-inmueble/ | /pl/poszukiwanie-nieruchomosci/ | /ro/cautare-proprietate/ | /sk/hladanie-nehnutelnosti/ |
| Értékbecslés | /es/valoracion/ | /pl/wycena/ | /ro/evaluare/ | /sk/odhad-ceny/ |
| Szolgáltatások | /es/servicios/ | /pl/uslugi/ | /ro/servicii/ | /sk/sluzby/ |
| Agráringatlan | /es/inmueble-agricola/ | /pl/nieruchomosc-rolna/ | /ro/proprietate-agricola/ | /sk/polnohospodarska-nehnutelnost/ |
| GYIK | /es/preguntas-frecuentes/ | /pl/czeste-pytania/ | /ro/intrebari-frecvente/ | /sk/caste-otazky/ |
| Fotós útmutató | /es/guia-fotografica/ | /pl/poradnik-fotograficzny/ | /ro/ghid-foto/ | /sk/fotograficky-navod/ |
| Vásárlási útmutató | /es/comprar-en-hungria/ | /pl/kupno-na-wegrzech/ | /ro/cumparare-in-ungaria/ | /sk/kupa-v-madarsku/ |
| Kiköltözés | /es/vivir-en-hungria/ | /pl/przeprowadzka-na-wegry/ | /ro/mutare-in-ungaria/ | /sk/stahovanie-do-madarska/ |
| Eladott ingatlanok | /es/vendidos/ | /pl/sprzedane/ | /ro/vandute/ | /sk/predane/ |
| Térkép | /es/mapa/ | /pl/mapa/ | /ro/harta/ | /sk/mapa/ |
| Adatvédelem | /es/privacidad/ | /pl/prywatnosc/ | /ro/confidentialitate/ | /sk/ochrana-sukromia/ |
| ÁSZF | /es/condiciones/ | /pl/regulamin/ | /ro/conditii/ | /sk/podmienky/ |
| Sütik | /es/cookies/ | /pl/cookies/ | /ro/cookies/ | /sk/cookies/ |
| Impresszum | /es/aviso-legal/ | /pl/nota-prawna/ | /ro/informatii-legale/ | /sk/pravne-informacie/ |
| Akadálymentesítés | /es/accesibilidad/ | /pl/dostepnosc/ | /ro/accesibilitate/ | /sk/pristupnost/ |
| Köszönjük | /es/gracias/ | /pl/dziekujemy/ | /ro/multumim/ | /sk/dakujeme/ |

A hirdetések címe: `/{nyelv}/{kategória-szó}-{en-venta|na-sprzedaz|de-vanzare|na-predaj}-{azonosító}/`. A meglévő címek egyike sem változott.

## Megszólítás és írásmód

- **Spanyol:** végig „usted”. „Inmueble”, „anuncio”, „Publicar anuncio”. Idézőjel « », százalék `10 %` (nem törhető szóközzel), ár `178.000 €`.
- **Lengyel:** végig „Państwo” (a „Pan/Pani” udvarias többes száma). „Nieruchomość”, „ogłoszenie”. Idézőjel „ ”, ár `178 000 €`.
- **Román:** végig „dumneavoastră”, a ș és ț betű vesszővel (nem cedillával). Idézőjel „ ”, ár `178.000 €`, és 20 felett „de” a számok után („20 de camere”).
- **Szlovák:** végig vykanie (Vy). „Nehnuteľnosť”, „inzerát”. Idézőjel „ “, százalék `10 %`, ár `178 000 €`.
- A többes számok nyelvenként helyesek (lengyelül, szlovákul és románul 3 alak). A segédfüggvény a `src/i18n/plural.ts`-ben van.
- A szótár a `src/i18n/GLOSSARY.md`-ben van, mind a 9 oszloppal.

## Tesztek

```
npm run check
npm run build
npm run test:rules        # Node ≥ 22.18; régebbi Node-on: npx tsx scripts/test-rules.mjs
npm run check:i18n        # ÚJ: minden francia kulcs megvan és nem üres es/pl/ro/sk nyelven
npm run verify:ssg
npx playwright test --project=chromium
```

A `check:i18n` (`scripts/check-i18n-keys.mjs`) végigmegy minden nyelvenként tárolt szövegen (UI, COPY, CONTENT, LEGAL, FAQ, e-mailek, űrlap-hibaüzenetek, értékbecslő kérdések, szótár, hirdetés-katalógus), és hibát jelez, ha a franciában meglévő kulcs bármelyik új nyelven hiányzik vagy üres.
