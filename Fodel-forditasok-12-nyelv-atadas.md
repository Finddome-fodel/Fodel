# FODEL: 12 új nyelv (olasz, portugál, görög, cseh, szlovén, svéd, dán, norvég, finn, észt, lett, litván), átadás

Rövid, gyakorlati összefoglaló. A munka a `feat/i18n-12-more-languages` ágon van, pull requestként (#4) a `main` felé, **nincs összefésülve**. Az éles adatbázishoz és a `.env`-hez nem nyúltam, és migrációt sem futtattam.

A 12 új nyelv pontosan úgy épül fel, mint a francia, a spanyol, a lengyel, a román és a szlovák (lásd `Fodel-forditasok-es-pl-ro-sk-atadas.md`): minden, ami franciául megvan, most mind a 12 nyelven is megvan. Az oldal így 21 nyelvű (hu, nl, en, de, fr, es, pl, ro, sk, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt).

## Mit kell Önnek megcsinálni

1. **Migráció kézzel, a telepítés ELŐTT:** `supabase/migrations/0026_more_locales.sql` (újrafuttatható, a 0025 után).
   - A `locale_code` enumot kiegészíti a 12 új nyelvkóddal (`it`, `pt`, `el`, `cs`, `sl`, `sv`, `da`, `no`, `fi`, `et`, `lv`, `lt`). Enélkül az új nyelvű hirdetésfordítás, értékbecslés, e-mail-sablon és blogcikk mentése hibára futna.
   - A hírlevél nyelvi korlátját mind a 21 nyelvre bővíti.
   - Az ingatlan-szótárnak (kategória, jellemző, állapot, fűtés, falazat, blogkategória) megadja a 12 új nyelvű nevet, a kategóriáknak pedig az URL-szót.
   - Admin által begépelt szöveget nem ír felül.
2. **Márkanevek és szlogenek jóváhagyása** (`BRAND` az `src/i18n/ui.ts`-ben). A nevek ugyanazt a mintát követik, mint az es/pl/ro/sk: FODEL IMMOBILIARE, FODEL IMOBILIÁRIA, FODEL ΑΚΙΝΗΤΑ, FODEL NEMOVITOSTI, FODEL NEPREMIČNINE, FODEL FASTIGHETER, FODEL EJENDOMME, FODEL EIENDOM, FODEL KIINTEISTÖT, FODEL KINNISVARA, FODEL NEKUSTAMAIS ĪPAŠUMS, FODEL NEKILNOJAMASIS TURTAS. A szlogeneket és a pozicionáló mondatokat én fogalmaztam, ezek nem az ügyfél által kiadott szövegek.
3. **Jogi oldalak jóváhagyása.** Az adatvédelmi, ÁSZF, süti, impresszum és akadálymentesítési szöveg mind a 12 nyelven a francia/angol változat hű fordítása, a tetején a „ez egy tájékoztató fordítás” megjegyzéssel. Élesítés előtt **ügyvéddel át kell nézetni**.
4. **Meghívólevelek az új nyelveken:** ahogy az en/de/fr/es/pl/ro/sk esetén is, csak admin által jóváhagyott sablonból lehet küldeni (Beállítások → Meghívólevelek).
5. **KvK-szám:** továbbra is hiányzik a `src/config/company.ts`-ből.
6. **Anyanyelvi átnézés.** A szövegeket nem anyanyelvi lektor írta. Élesítés előtt érdemes mindegyik nyelvet egy anyanyelvi olvasóval átfuttatni, különösen a jogi szövegeket, a szlogeneket és az e-maileket.

## Ügyfél-döntések

- **Megszólítás:** olasz „Lei”, portugál (európai) harmadik személy („o seu”, „pode”; „você” nincs), görög „εσείς”, cseh és szlovén vykanie/vikanje, észt „teie”, lett és litván „jūs”. Svédül, dánul, norvégul „du”, finnül „sinä”, az adott nyelv természetes, szokásos formájában.
- **Norvég:** a nyelvkód `no`, az oldal `lang="nb"` (Bokmål), a hreflang `nb`, az Intl-címke `nb-NO`. A böngésző `nb`, `nn` és `no` nyelve is a norvég oldalra visz. A portugál oldal `lang="pt-PT"`.
- **A főoldal aláírássávja** továbbra is az eredeti 5 nyelvet mutatja. Ugyanígy **változatlan maradt** az „5 nyelven hirdetünk” jellegű üzleti állítás (fizetett hirdetésfordítás, `llms.txt`, a schema.org `knowsLanguage`), és a „8 ország”. Az iroda munkatársai nem beszélnek ezeken az új nyelveken, ezért nem állítottam, hogy az ügyfélszolgálat itt is elérhető.
- **x-default** továbbra is a holland oldal.
- **Eladói portál, Stripe pénztár, számla-PDF:** ugyanúgy működik, mint fr/de/es esetén: az eladói portál az új nyelvű felhasználónak a jelenlegi nyelvén (hu/nl/en) jelenik meg, a számla-PDF kétnyelvű marad (hu/nl), a Stripe pénztár a meglévő nyelvén fut. A belépés, a regisztráció és a jelszócsere mind a 21 nyelven megy.
- **Nyelvválasztó:** 21 sor, ezért a menü nagy képernyőn 3 oszlopos (3×7), telefonon görgethető lista.
- **Szám- és ársormat:** olasz, görög, szlovén, dán `178.000 €`; portugál, cseh, svéd, norvég, finn, észt, lett, litván `178 000 €` (nem törhető szóközzel). A százalékjel előtt cseh, szlovén, svéd, dán, norvég, finn és litván nyelven nem törhető szóköz áll (`10 %`).
- **Betűtípus:** a DM Sans és a Jost latin és latin-extended (ő, ű, ė, ų, ļ, ņ, č, š, ž stb.) betűkészlete lefedi az új latin betűs nyelveket. **A görög** betűkhöz a mi betűtípusainkban nincs görög készlet, ezért a böngésző rendszerbetűtípusa (Arial) jelenik meg. Ha ugyanazt a karaktert szeretnék, görög készletű betűtípust kell hozzáadni.
- **Többes számok:** a cseh, szlovén (kettes szám is), lett (0 és 10–20 után külön alak, pl. „10 īpašumu”) és litván alakok helyesek. A segédfüggvény az `src/i18n/plural.ts`-ben van (`nOf`, `pluralForm`).
- **Fejlesztői előnézet:** az `/dev/emails` mintaoldalon a dátumok és összegek az új nyelveken angolul jelennek meg (csak a fejlesztői előnézet, éles e-mailt nem érint).
- **Kliens-JS mérete:** a `verify:ssg` kliens-JS-korlátja (100 kB) a `main`-en is el van találva (kb. 1175 kB); az új nyelvek a katalógus-JSON-ok miatt kb. 45 kB-tal növelték (1220 kB). Ezt ebben a körben nem javítottam.

## Oldalak címei nyelvenként

| Oldal | IT | PT | EL | CS | SL | SV |
|---|---|---|---|---|---|---|
| Főoldal | /it/ | /pt/ | /el/ | /cs/ | /sl/ | /sv/ |
| Ingatlanok | /it/immobili/ | /pt/imoveis/ | /el/akinita/ | /cs/nemovitosti/ | /sl/nepremicnine/ | /sv/fastigheter/ |
| Eladóknak | /it/vendere/ | /pt/vender/ | /el/polisi/ | /cs/prodej/ | /sl/prodaja/ | /sv/salja/ |
| Vevőknek | /it/acquistare/ | /pt/comprar/ | /el/agora/ | /cs/koupe/ | /sl/nakup/ | /sv/kopa/ |
| Rólunk | /it/chi-siamo/ | /pt/sobre-nos/ | /el/schetika-me-emas/ | /cs/o-nas/ | /sl/o-nas/ | /sv/om-oss/ |
| Kapcsolat | /it/contatti/ | /pt/contacto/ | /el/epikoinonia/ | /cs/kontakt/ | /sl/kontakt/ | /sv/kontakt/ |
| Blog | /it/blog/ | /pt/blog/ | /el/blog/ | /cs/blog/ | /sl/blog/ | /sv/blog/ |
| Árlista | /it/prezzi/ | /pt/precos/ | /el/times/ | /cs/cenik/ | /sl/cenik/ | /sv/priser/ |
| Hirdetés feladása | /it/pubblica-annuncio/ | /pt/publicar-anuncio/ | /el/kataxorisi-angelias/ | /cs/podat-inzerat/ | /sl/oddaja-oglasa/ | /sv/lagg-in-annons/ |
| Kerestetés | /it/ricerca-immobili/ | /pt/procura-de-imoveis/ | /el/anazitisi-akinitou/ | /cs/hledani-nemovitosti/ | /sl/iskanje-nepremicnine/ | /sv/fastighetssokning/ |
| Értékbecslés | /it/valutazione/ | /pt/avaliacao/ | /el/ektimisi/ | /cs/odhad-ceny/ | /sl/ocena-vrednosti/ | /sv/vardering/ |
| Szolgáltatások | /it/servizi/ | /pt/servicos/ | /el/ypiresies/ | /cs/sluzby/ | /sl/storitve/ | /sv/tjanster/ |
| Agráringatlan | /it/immobile-agricolo/ | /pt/imovel-agricola/ | /el/agrotiko-akinito/ | /cs/zemedelska-nemovitost/ | /sl/kmetijska-nepremicnina/ | /sv/jordbruksfastighet/ |
| GYIK | /it/domande-frequenti/ | /pt/perguntas-frequentes/ | /el/syches-erotiseis/ | /cs/caste-dotazy/ | /sl/pogosta-vprasanja/ | /sv/vanliga-fragor/ |
| Fotós útmutató | /it/guida-foto/ | /pt/guia-de-fotografia/ | /el/odigos-fotografisis/ | /cs/navod-k-fotografovani/ | /sl/navodila-za-fotografiranje/ | /sv/fotoguide/ |
| Vásárlási útmutató | /it/acquistare-in-ungheria/ | /pt/comprar-na-hungria/ | /el/agora-stin-oungaria/ | /cs/koupe-v-madarsku/ | /sl/nakup-na-madzarskem/ | /sv/kopa-i-ungern/ |
| Kiköltözés | /it/trasferirsi-in-ungheria/ | /pt/mudar-se-para-a-hungria/ | /el/metakomisi-stin-oungaria/ | /cs/stehovani-do-madarska/ | /sl/selitev-na-madzarsko/ | /sv/flytta-till-ungern/ |
| Eladott ingatlanok | /it/venduti/ | /pt/vendidos/ | /el/polithikan/ | /cs/prodano/ | /sl/prodano/ | /sv/salda/ |
| Térkép | /it/mappa/ | /pt/mapa/ | /el/chartis/ | /cs/mapa/ | /sl/zemljevid/ | /sv/karta/ |
| Adatvédelem | /it/privacy/ | /pt/privacidade/ | /el/aporrito/ | /cs/ochrana-osobnich-udaju/ | /sl/zasebnost/ | /sv/integritet/ |
| ÁSZF | /it/condizioni/ | /pt/termos/ | /el/oroi/ | /cs/podminky/ | /sl/pogoji/ | /sv/villkor/ |
| Sütik | /it/cookies/ | /pt/cookies/ | /el/cookies/ | /cs/cookies/ | /sl/cookies/ | /sv/cookies/ |
| Impresszum | /it/note-legali/ | /pt/informacao-legal/ | /el/nomikes-plirofories/ | /cs/pravni-informace/ | /sl/pravno-obvestilo/ | /sv/juridisk-information/ |
| Akadálymentesítés | /it/accessibilita/ | /pt/acessibilidade/ | /el/prosvasimotita/ | /cs/pristupnost/ | /sl/dostopnost/ | /sv/tillganglighet/ |
| Köszönjük | /it/grazie/ | /pt/obrigado/ | /el/efcharistoume/ | /cs/dekujeme/ | /sl/hvala/ | /sv/tack/ |

| Oldal | DA | NO | FI | ET | LV | LT |
|---|---|---|---|---|---|---|
| Főoldal | /da/ | /no/ | /fi/ | /et/ | /lv/ | /lt/ |
| Ingatlanok | /da/ejendomme/ | /no/eiendommer/ | /fi/kiinteistot/ | /et/kinnisvara/ | /lv/ipasumi/ | /lt/nekilnojamasis-turtas/ |
| Eladóknak | /da/salg/ | /no/salg/ | /fi/myynti/ | /et/muuk/ | /lv/pardosana/ | /lt/pardavimas/ |
| Vevőknek | /da/kob/ | /no/kjop/ | /fi/osto/ | /et/ost/ | /lv/pirksana/ | /lt/pirkimas/ |
| Rólunk | /da/om-os/ | /no/om-oss/ | /fi/meista/ | /et/meist/ | /lv/par-mums/ | /lt/apie-mus/ |
| Kapcsolat | /da/kontakt/ | /no/kontakt/ | /fi/yhteystiedot/ | /et/kontakt/ | /lv/kontakti/ | /lt/kontaktai/ |
| Blog | /da/blog/ | /no/blog/ | /fi/blog/ | /et/blog/ | /lv/blog/ | /lt/blog/ |
| Árlista | /da/priser/ | /no/priser/ | /fi/hinnasto/ | /et/hinnakiri/ | /lv/cenas/ | /lt/kainos/ |
| Hirdetés feladása | /da/opret-annonce/ | /no/legg-inn-annonse/ | /fi/jata-ilmoitus/ | /et/lisa-kuulutus/ | /lv/ievietot-sludinajumu/ | /lt/ideti-skelbima/ |
| Kerestetés | /da/ejendomssogning/ | /no/eiendomssok/ | /fi/kiinteistohaku/ | /et/kinnisvaraotsing/ | /lv/ipasuma-meklesana/ | /lt/turto-paieska/ |
| Értékbecslés | /da/vurdering/ | /no/verdivurdering/ | /fi/arviointi/ | /et/hindamine/ | /lv/novertejums/ | /lt/vertinimas/ |
| Szolgáltatások | /da/ydelser/ | /no/tjenester/ | /fi/palvelut/ | /et/teenused/ | /lv/pakalpojumi/ | /lt/paslaugos/ |
| Agráringatlan | /da/landbrugsejendom/ | /no/landbrukseiendom/ | /fi/maatalouskiinteisto/ | /et/pollumajanduslik-kinnisvara/ | /lv/lauksaimniecibas-ipasums/ | /lt/zemes-ukio-turtas/ |
| GYIK | /da/ofte-stillede-sporgsmal/ | /no/ofte-stilte-sporsmal/ | /fi/usein-kysyttya/ | /et/korduma-kippuvad-kusimused/ | /lv/biezak-uzdotie-jautajumi/ | /lt/duk/ |
| Fotós útmutató | /da/fotoguide/ | /no/fotoguide/ | /fi/valokuvausopas/ | /et/fotojuhend/ | /lv/foto-celvedis/ | /lt/fotografavimo-vadovas/ |
| Vásárlási útmutató | /da/kob-i-ungarn/ | /no/kjop-i-ungarn/ | /fi/osto-unkarista/ | /et/ostmine-ungaris/ | /lv/pirksana-ungarija/ | /lt/pirkimas-vengrijoje/ |
| Kiköltözés | /da/flytning-til-ungarn/ | /no/flytte-til-ungarn/ | /fi/muutto-unkariin/ | /et/kolimine-ungarisse/ | /lv/parcelsanas-uz-ungariju/ | /lt/persikelimas-i-vengrija/ |
| Eladott ingatlanok | /da/solgt/ | /no/solgt/ | /fi/myydyt/ | /et/muudud/ | /lv/pardotie/ | /lt/parduota/ |
| Térkép | /da/kort/ | /no/kart/ | /fi/kartta/ | /et/kaart/ | /lv/karte/ | /lt/zemelapis/ |
| Adatvédelem | /da/privatliv/ | /no/personvern/ | /fi/tietosuoja/ | /et/privaatsus/ | /lv/privatums/ | /lt/privatumas/ |
| ÁSZF | /da/vilkar/ | /no/vilkar/ | /fi/ehdot/ | /et/tingimused/ | /lv/noteikumi/ | /lt/salygos/ |
| Sütik | /da/cookies/ | /no/cookies/ | /fi/cookies/ | /et/cookies/ | /lv/cookies/ | /lt/cookies/ |
| Impresszum | /da/juridisk-information/ | /no/juridisk-informasjon/ | /fi/oikeudelliset-tiedot/ | /et/oiguslik-teave/ | /lv/juridiska-informacija/ | /lt/teisine-informacija/ |
| Akadálymentesítés | /da/tilgaengelighed/ | /no/tilgjengelighet/ | /fi/saavutettavuus/ | /et/ligipaasetavus/ | /lv/piekluzamiba/ | /lt/prieinamumas/ |
| Köszönjük | /da/tak/ | /no/takk/ | /fi/kiitos/ | /et/aitah/ | /lv/paldies/ | /lt/aciu/ |

A hirdetések címe: `/{nyelv}/{kategória-szó}-{eladó-szó}-{azonosító}/`, ahol az eladó-szó nyelvenként: in-vendita (it), a-venda (pt), pros-polisi (el), na-prodej (cs), naprodaj (sl), till-salu (sv), til-salg (da), til-salgs (no), myytavana (fi), muua (et), pardosana (lv), parduodama (lt). A meglévő címek egyike sem változott. A görög címek latin betűs átírások; dánul és norvégul az ø o-nak, az å a-nak, az æ ae-nek van írva.

## Tesztek

```
npm run check             # astro check, 0 hiba
npm run build
npm run test:rules        # 75 ellenőrzés
npm run check:i18n        # minden francia kulcs megvan és nem üres mind a 16 másik nyelven
npm run verify:ssg -- --allow-missing-kvk   # 1 ismert hiba: kliens-JS-méret (lásd fent)
npx playwright test tests/e2e/public --project=chromium
```

A `check:i18n` mostantól es/pl/ro/sk mellett az it, pt, el, cs, sl, sv, da, no, fi, et, lv és lt nyelvet is ellenőrzi.

## Mi változott a kódban

- Új nyelvenkénti fájlok: `src/data/{content,copy,faq,legal}-<nyelv>.ts`, `src/lib/email/copy/<nyelv>.ts`, `src/lib/validation-copy/<nyelv>.ts`, valamint az `src/pages/<nyelv>/` oldalak (30 útvonal nyelvenként, saját URL-szavakkal).
- Beillesztve minden meglévő nyelvenkénti helyre: `src/i18n/ui.ts` (UI-szövegek, útvonalak, márkanevek, kategóriák), `chrome.ts`, `fallback.ts`, `plural.ts`, `src/config/*`, `src/lib/format.ts`, a hirdetési katalógus JSON-jai (`groups`, `options`, `features`, `details`), taxonómia, értékbecslő kérdések, fényképes tippek, e-mail- és számlaszövegek, a portál belső nyelvi listái.
- Nyelvválasztó, zászlók (SVG), böngészőnyelv-felismerés a gyökéroldalon, sitemap/hreflang.
- `src/i18n/GLOSSARY.md`: új szakasz a 12 nyelv alapfogalmaival, megszólításával és márkaneveivel.
