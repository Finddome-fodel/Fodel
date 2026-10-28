-- 0036: three Hungarian seller guides for the blog (SEO articles), plus the
-- "Eladói útmutató" blog category they are filed under.
--
-- Run by hand in the Supabase SQL editor (Supabase → SQL Editor → New query →
-- paste this whole file → Run), any time after 0014. Safe to run twice: the
-- category and every post are skipped if they already exist (same key / same
-- locale + slug), so an edit made in the admin is never overwritten.
--
-- The posts go live as soon as this runs (published, published_at = 28 Oct 2026).
-- To review them first, change `true` to `false` in the `published` column
-- below, run, then publish each one in the admin portal (/portal/content/blog).
-- No cover image: the article page and cards work without one, and a cover can
-- be added in the admin editor at any time.
--
-- Public URLs once live:
--   /hu/blog/haz-eladasa-kulfoldi-vevonek/
--   /hu/blog/mennyit-er-a-hazam-ingatlan-ertekbecsles/
--   /hu/blog/ingatlan-eladas-adoja-es-koltsegei-2026/

/* ── Blog category: Eladói útmutató ─────────────────────────────────────── */
-- The post's `category` column stores the label in its own language (see the
-- admin editor), so the posts below carry 'Eladói útmutató'. Other languages'
-- labels come from src/data/taxonomy-i18n.ts.
insert into taxonomy_terms (group_key, key, labels, sort_order) values
  ('blog_category', 'sellers', '{"hu":"Eladói útmutató","nl":"Verkopersgids","en":"Seller’s guide","de":"Verkäuferratgeber","fr":"Guide du vendeur"}', 25)
on conflict (group_key, key) do nothing;

/* ── Posts ──────────────────────────────────────────────────────────────── */

-- Ház eladása külföldi vevőnek: lépésről lépésre útmutató (2026)  (fő kulcsszó: ház eladása külföldi vevőnek)
insert into blog_posts (locale, kind, slug, title, excerpt, body_md, category, author, reading_minutes, seo_title, seo_description, featured, published, published_at)
values (
  'hu',
  'article',
  'haz-eladasa-kulfoldi-vevonek',
  'Ház eladása külföldi vevőnek: lépésről lépésre útmutató (2026)',
  'Hogyan adja el házát holland, belga vagy német vevőnek? Engedélyek, iratok, hirdetés, kétnyelvű szerződés és fizetés – egy helyen, lépésről lépésre.',
  $md$A **ház eladása külföldi vevőnek** sok magyar tulajdonos számára ma már nem kivételes lehetőség, hanem tudatos stratégia. Holland, belga és német vásárlók évek óta keresnek vidéki családi házat, tanyát, nyaralót vagy szőlőbirtokot Magyarországon, és gyakran olyan ingatlanok iránt is érdeklődnek, amelyekre a hazai piacon hónapokig nem akad komoly vevő. Ebben az útmutatóban végigvesszük, hogyan zajlik az ingatlan eladása külföldinek: kik a vevők, kell-e engedély, mire figyeljen a hirdetésnél, a szerződésnél és a fizetésnél.

## Miért érdemes külföldi vevőt keresni?

A nyugat-európai vásárlók más szemmel nézik a magyar ingatlanokat, mint a hazai vevők. Ami itthon hátránynak számít – például egy csendes, kis település vagy egy nagy, gondozást igénylő kert –, az egy holland családnak gyakran épp a legfőbb vonzerő.

- **Készpénzes vásárlás.** A külföldi vevők jelentős része saját megtakarításból, egy összegben fizet, így nem kell banki hitelbírálatra vagy támogatási ügyintézésre várni.
- **Komoly szándék.** Egy magyarországi megtekintés a vevőnek utazással, szállással együtt általában több napot és jelentős költséget jelent. Aki ezt vállalja, valóban vásárolni szeretne.
- **Más prioritások.** Teret, természetet, nyugalmat és autentikus vidéki életet keresnek – ezért a vidéki házak, tanyák és birtokok iránt különösen nyitottak.

Arról, hogy kik a tipikus vásárlók, és miért választják Magyarországot, az [Eladóknak](/hu/eladoknak/) oldalon írunk részletesen.

## Kik vásárolhatnak ingatlant Magyarországon, és kell-e engedély?

Ez az egyik leggyakoribb kérdés, amikor valaki ingatlan eladásán gondolkodik külföldi állampolgárnak. A jelenlegi szabályok szerint:

- **EU-, EGT- és svájci állampolgárok** a mező- és erdőgazdasági földnek nem minősülő ingatlant (például lakást, családi házat, építési telket, nyaralót) a magyar állampolgárokkal azonos módon, **kormányhivatali engedély nélkül** szerezhetik meg. A holland, belga és német vevők tehát ebbe a körbe tartoznak.
- **Más országok állampolgárainak** az ingatlan fekvése szerint illetékes kormányhivatal engedélye szükséges, ami meghosszabbíthatja a folyamatot.
- **Termőföld és bizonyos tanyák** esetében külön, jóval szigorúbb földforgalmi szabályok érvényesek – ilyenkor a vevő személye, a terület nagysága és a földhasználat is számít, és az eljárásban hatósági jóváhagyásra, illetve elővásárlási jogokra is számítani kell.

Ha az ingatlanhoz nagyobb mezőgazdasági terület tartozik, már a hirdetés előtt érdemes ügyvéddel tisztázni, hogy a teljes ingatlan vagy csak egy része adható el külföldi vevőnek. Ez nem jogi tanács: a konkrét esetet mindig egy ingatlanjogban jártas ügyvéd tudja megítélni.

## A ház eladása külföldi vevőnek lépésről lépésre

### 1. Készítse elő az iratokat

Mielőtt meghirdeti az ingatlant, gyűjtse össze azokat a dokumentumokat, amelyeket a vevő és az ügyvéd is kérni fog:

- friss tulajdoni lap (ellenőrizze rajta a terheket, például jelzálogot, haszonélvezeti jogot);
- energetikai tanúsítvány – a jelenlegi szabályok szerint az eladásra kínált épület energetikai besorolását már a hirdetésben fel kell tüntetni;
- alaprajz, építési vagy használatbavételi dokumentumok, ha vannak;
- közüzemi szerződések és az utolsó számlák, hogy a vevő lássa a rezsiköltségeket.

### 2. Határozzon meg reális irányárat

A külföldi vevők általában alaposan összehasonlítják a kínálatot, és egy túlárazott ingatlant egyszerűen kihagynak. A reális irányár ezért a gyors eladás egyik kulcsa. Ha bizonytalan, kérjen [értékmeghatározást](/hu/ertekbecsles/), és olvassa el a témáról szóló cikkünket: [Mennyit ér a házam?](/hu/blog/mennyit-er-a-hazam-ingatlan-ertekbecsles/)

### 3. Készítsen olyan hirdetést, amely külföldön is működik

Egy nyugat-európai vevő gyakran csak a fotók és a leírás alapján dönti el, hogy több száz kilométert utazik-e. Ezért a hirdetésnél különösen fontos:

- **Sok, jó minőségű fotó** természetes fényben, rendezett helyiségekkel, a kertről és a környékről is. Gyakorlati tippeket a [fotózási útmutatónkban](/hu/fotozasi-utmutato/) talál.
- **Pontos adatok:** alapterület, telekméret, szobák száma, fűtés, a felújítások éve, közművek.
- **A környék bemutatása:** a legközelebbi bolt, orvos, iskola, vasútállomás vagy autópálya távolsága. Ezeket a külföldi vevő nem ismeri, de fontosak neki.
- **Idegen nyelvű szöveg.** A vevő anyanyelvén megírt leírás bizalmat épít és több megkeresést hoz.

### 4. Hirdessen ott, ahol a külföldi vevők keresnek

A hazai ingatlanportálokat a holland vagy belga vásárlók ritkán böngészik. A FINDDOME kifejezetten arra épül, hogy magyar ingatlanokat mutasson be nyugat-európai vevőknek, több nyelven, kizárólagossági szerződés nélkül. A [hirdetés feladása](/hu/hirdetes-feladasa/) online történik, a csomagok és díjak az [árlistán](/hu/arlista/) találhatók.

### 5. Megtekintés és tárgyalás

A külföldi vevő jellemzően előre egyeztetett időpontban, egy-két napos út keretében néz meg több ingatlant. Készüljön fel arra, hogy a kérdései részletesek lesznek: fűtési költség, a tető és a nyílászárók állapota, a víz- és szennyvízelvezetés megoldása. Ha nem beszéli a vevő nyelvét, egy tolmácsoló munkatárs sokat segít a félreértések elkerülésében.

Az árról a külföldi vevők is tárgyalnak, de egy reálisan beárazott ingatlan esetében az alku általában mérsékelt. A megállapodás feltételeit – vételár, foglaló vagy előleg, birtokbaadás időpontja, ingóságok sorsa – írásban rögzítsék.

### 6. Kétnyelvű adásvételi szerződés

Magyarországon az ingatlan-adásvételi szerződést a földhivatali bejegyzéshez ügyvédnek kell ellenjegyeznie (vagy közjegyzői okiratba kell foglalni). Külföldi vevőnél bevett gyakorlat a **kétnyelvű szerződés**, hogy a vevő pontosan értse, mit ír alá. Az ügyvéd ellenőrzi a felek személyazonosságát, a tulajdoni lapot, és benyújtja a szerződést a földhivatalhoz.

A vevőnek nem feltétlenül kell személyesen jelen lennie az aláírásnál: **meghatalmazás** alapján egy képviselő is eljárhat helyette. Ez sok külföldi vásárlónak megkönnyíti a döntést.

### 7. Fizetés és birtokbaadás

A vételár jellemzően banki átutalással érkezik, sokszor ügyvédi letéten keresztül, ami mindkét félnek biztonságot ad: az eladó tudja, hogy a pénz rendelkezésre áll, a vevő pedig azt, hogy csak a feltételek teljesülése után kerül kifizetésre. Euróban érkező vételárnál előre egyeztessék, hogy melyik devizában és milyen árfolyamon rögzítik az árat.

A birtokbaadáskor rögzítsék a mérőóra-állásokat, adják át a kulcsokat és az energetikai tanúsítványt, majd intézzék el a közművek átírását.

## Gyakori hibák, amelyeket érdemes elkerülni

- **Túl magas kezdőár.** A külföldi vevők sok ingatlant összehasonlítanak; a túlárazott hirdetés hónapokig ott maradhat.
- **Kevés vagy rossz minőségű fotó.** Fotók nélkül a vevő el sem indul megnézni a házat.
- **Hiányos iratok.** Ha a tulajdoni lapon tisztázatlan teher szerepel, vagy hiányzik az energetikai tanúsítvány, az késlelteti, akár meg is hiúsíthatja az üzletet.
- **Szóbeli megállapodások.** Minden lényeges feltételt foglaljanak írásba, lehetőleg mindkét fél nyelvén.

## Mennyibe kerül, és mi az adózás?

Az eladónak a hirdetési díjjal, az energetikai tanúsítvánnyal, adott esetben ügyvédi és közvetítői díjjal kell számolnia, valamint – ha az ingatlant öt évnél rövidebb ideje szerezte – személyi jövedelemadóval. A FINDDOME-nál jutalék csak akkor merül fel, ha mi hozzuk a vevőt és mi közvetítünk; ha a vevő közvetlenül Önnel állapodik meg, a hirdetési díjon felül nincs további díj. A részleteket [Ingatlan eladás adója és költségei 2026-ban](/hu/blog/ingatlan-eladas-adoja-es-koltsegei-2026/) című cikkünk foglalja össze.

## Gyakori kérdések

### Eladhatom a házamat holland állampolgárnak engedély nélkül?

A jelenlegi szabályok szerint igen: EU-állampolgárként a holland vevő a termőföldnek nem minősülő ingatlant (például családi házat vagy lakást) kormányhivatali engedély nélkül vásárolhatja meg. Termőföld vagy nagyobb mezőgazdasági terület esetén külön szabályok érvényesek.

### Kell-e a vevőnek Magyarországra utaznia az aláíráshoz?

Nem feltétlenül. Meghatalmazás alapján egy képviselő is aláírhatja helyette a szerződést, és eljárhat a földhivatali ügyintézésben.

### Milyen nyelven készül az adásvételi szerződés?

Külföldi vevőnél jellemzően kétnyelvű szerződés készül, például magyar–holland vagy magyar–angol nyelven, hogy mindkét fél pontosan értse a feltételeket.

### Mennyi idő alatt lehet eladni egy házat külföldi vevőnek?

Ez elsősorban az ártól, az ingatlan állapotától és a hirdetés minőségétől függ. Egy reálisan árazott, jól bemutatott ingatlan esetében a komoly érdeklődők gyorsabban jelentkeznek, a szerződéskötés és a földhivatali bejegyzés pedig hetek alatt lezajlhat.

## Adja el házát nyugat-európai vevőnek

Ha szeretné, hogy ingatlanát holland, belga és német vásárlók is lássák, [adja fel hirdetését](/hu/hirdetes-feladasa/) a FINDDOME-on. Kérdése van? [Írjon nekünk](/hu/kapcsolat/), vagy nézze meg a [gyakori kérdéseket](/hu/gyik/).$md$,
  'Eladói útmutató',
  'FINDDOME',
  6,
  'Ház eladása külföldi vevőnek: útmutató 2026',
  'Ház eladása külföldi vevőnek lépésről lépésre: kell-e engedély, hogyan készüljön a hirdetés, a kétnyelvű szerződés és a fizetés. Útmutató eladóknak.',
  true,
  true,
  '2026-10-28 09:00:00+01'
)
on conflict (locale, slug) do nothing;

-- Mennyit ér a házam? Így működik az ingatlan értékbecslés  (fő kulcsszó: mennyit ér a házam / ingatlan értékbecslés)
insert into blog_posts (locale, kind, slug, title, excerpt, body_md, category, author, reading_minutes, seo_title, seo_description, featured, published, published_at)
values (
  'hu',
  'article',
  'mennyit-er-a-hazam-ingatlan-ertekbecsles',
  'Mennyit ér a házam? Így működik az ingatlan értékbecslés',
  'Mi alapján számol az ingatlan értékbecslés, mi befolyásolja leginkább a ház piaci értékét, és mikor elég a tájékoztató értékmeghatározás?',
  $md$**Mennyit ér a házam?** Ez az első kérdés, amelyet szinte minden eladó feltesz magának – és a válasz alapjaiban határozza meg, milyen gyorsan és milyen áron kel el az ingatlan. Ha túl magasra lövi az árat, a hirdetés hónapokig ott marad, és a vevők végül alacsonyabb ajánlatot tesznek. Ha túl alacsonyra, pénzt hagy az asztalon. Ebben a cikkben bemutatjuk, hogyan működik az **ingatlan értékbecslés**, mi befolyásolja egy ház piaci értékét, és hogyan juthat el egy reális irányárig.

## Mit jelent az ingatlan piaci értéke?

Az ingatlan piaci értéke az az ár, amelyért egy adott időpontban, szokásos piaci körülmények között, egy jól tájékozott vevő és eladó megállapodna. Ez nem azonos azzal, amennyit Ön az ingatlanba fektetett, és azzal sem, amennyit a szomszéd ház hirdetésében lát. A hirdetési ár csak kínálati ár: azt mutatja, mennyit kér az eladó, nem azt, hogy mennyiért kel el valójában.

Az **ingatlan értékbecslés** célja tehát az, hogy objektív szempontok alapján megbecsülje, mennyit fizetne a piac az Ön házáért.

## Milyen módszerekkel becsülik az ingatlan értékét?

### Piaci összehasonlító módszer

A lakóingatlanoknál ez a leggyakoribb megközelítés. Az értékbecslő hasonló – azonos környékbeli, hasonló méretű, korú és állapotú – ingatlanok adatait veti össze, majd a különbségek alapján korrigál. A négyzetméterár jó kiindulópont, de önmagában félrevezető lehet: egy felújított ház és egy felújításra szoruló ház négyzetméterára ugyanazon az utcán is nagyon eltérhet.

### Költségalapú megközelítés

Ez azt vizsgálja, mennyibe kerülne a telek megvásárlása és az épület újbóli felépítése, csökkentve az épület korával és állapotával járó értékvesztéssel. Különleges ingatlanoknál, például egyedi tanyáknál vagy birtokoknál hasznos kiegészítés lehet, ahol kevés az összehasonlítható adat.

### Hozamalapú megközelítés

Bérbeadásra szánt vagy kereskedelmi ingatlanoknál azt vizsgálják, mekkora jövedelmet termelhet az ingatlan. Egy családi ház eladásánál ritkán ez a fő szempont, de egy panzió vagy vendégház esetében fontos lehet.

## Mi befolyásolja leginkább, mennyit ér a házam?

### Elhelyezkedés

A legfontosabb tényező, és egyben az egyetlen, amin nem lehet változtatni. Számít a település, a környék, a közlekedés, a szolgáltatások elérhetősége és a táj is. Fontos tudni, hogy a vevőkör is számít: egy csendes, eldugott falu a hazai piacon kevésbé keresett lehet, egy nyugat-európai vevő számára viszont épp ez lehet az ingatlan legfőbb vonzereje.

### Méret és elrendezés

A hasznos alapterület, a szobák száma és az elrendezés praktikussága egyaránt számít. A telek nagysága vidéken különösen fontos, a kert, a melléképületek és a gazdasági épületek pedig növelhetik az értéket.

### Műszaki állapot és felújítások

A tető, a falazat, a nyílászárók, a fűtés, az elektromos hálózat és a vizesblokkok állapota alapvetően befolyásolja az árat. Egy friss, szakszerű felújítás növeli az értéket, míg egy nedves fal vagy egy elavult fűtési rendszer a vevő szemében azonnali költséget jelent.

### Energetikai besorolás

Az energetikai tanúsítvány a jelenlegi szabályok szerint az eladásnál kötelező, és a besorolást a hirdetésben is fel kell tüntetni. A jobb besorolás alacsonyabb rezsit jelez, ami sok vevőnek – különösen a nyugat-európaiaknak – fontos szempont.

### Jogi helyzet

A tulajdoni lapon szereplő terhek (jelzálog, haszonélvezeti jog, szolgalom), a rendezetlen ingatlan-nyilvántartási helyzet vagy egy fel nem tüntetett épület mind csökkenthetik a piaci értéket, és lassíthatják az eladást. Ezeket érdemes még a hirdetés előtt rendezni.

## Tájékoztató értékmeghatározás vagy hivatalos értékbecslés?

Fontos különbséget tenni a kettő között:

- **Tájékoztató, piaci alapú értékmeghatározás:** gyorsabb és egyszerűbb, a célja az, hogy reális képet kapjon a várható eladási árról, és ennek alapján meghatározza az irányárat. Ez nem hivatalos szakvélemény.
- **Hivatalos értékbecslés:** egy képesített szakértő készíti, jellemzően helyszíni szemle alapján, és például banki hitelhez, hagyatéki vagy bírósági eljáráshoz, válóperhez vagy vagyonmegosztáshoz kérik.

Egy eladáshoz a legtöbb esetben a tájékoztató értékmeghatározás is elég ahhoz, hogy megalapozott irányárat tudjon meghatározni. Ha az eredményt hivatalos eljárásban szeretné felhasználni, hivatalos értékbecslésre lesz szüksége.

## Hogyan működik az értékmeghatározás a FINDDOME-nál?

A FINDDOME [értékmeghatározás](/hu/ertekbecsles/) oldalán néhány lépésben adhatja meg az ingatlan adatait:

1. **Az ingatlan alapadatai:** típus, település, alapterület – csak ezek kötelezőek.
2. **Épület és műszaki állapot:** építés és felújítás éve, fűtés, energetikai osztály.
3. **Környezet:** a környék területhasználata és épületei.
4. **Extrák és korlátok:** melléképületek, különleges adottságok és ismert korlátozások.
5. **Fotók és elérhetőség:** néhány fénykép és dokumentum (például alaprajz, tulajdoni lap) sokat segít a pontosabb eredményben.

Munkatársunk ellenőrzi az adatokat, és e-mailben küldi el a tájékoztató eredményt. Helyszíni szemle is kérhető – ilyenkor munkatársunk egyezteti Önnel az időpontot –, hivatalos értékbecslésnél pedig előbb árajánlatot küldünk, és árat, határidőt csak annak elfogadása után vállalunk.

## Hogyan készüljön fel, hogy pontosabb eredményt kapjon?

- **Legyen pontos az alapterülettel.** Ha bizonytalan, nézze meg az alaprajzot vagy a tulajdoni lapot.
- **Ne hallgassa el a hibákat.** Egy beázás vagy egy repedés úgyis kiderül a megtekintésen; az értékbecslésnél jobb, ha előre számol vele.
- **Gyűjtse össze a felújítások adatait.** Mit, mikor és milyen mértékben újítottak fel – ez sokat számít.
- **Készítsen jó fotókat.** A [fotózási útmutatónk](/hu/fotozasi-utmutato/) segít abban, hogy a képek a valós állapotot mutassák, előnyös fényben.

## Az értékbecsléstől a jó irányárig

Az értékbecslés eredménye általában egy sáv, nem egyetlen szám. Az irányár meghatározásánál vegye figyelembe, hogy mennyire sürgős az eladás, mekkora alkura számít, és kik a valószínű vevők. Ha az ingatlan nyugat-európai vásárlók számára is vonzó lehet, érdemes őket is elérni: róluk és az eladás menetéről a [Ház eladása külföldi vevőnek](/hu/blog/haz-eladasa-kulfoldi-vevonek/) című cikkünkben írunk. Az eladással járó kiadásokat és az adózást pedig az [Ingatlan eladás adója és költségei 2026-ban](/hu/blog/ingatlan-eladas-adoja-es-koltsegei-2026/) című cikk foglalja össze.

## Gyakori kérdések

### Mennyibe kerül az ingatlan értékbecslés?

Ez a típusától függ: egy tájékoztató értékmeghatározás jellemzően gyorsabb és egyszerűbb, mint egy helyszíni szemlén alapuló hivatalos értékbecslés. A FINDDOME-nál az elérhető lehetőségeket és díjakat az [értékmeghatározás](/hu/ertekbecsles/) oldalon látja; hivatalos értékbecslésnél egyedi árajánlatot küldünk.

### Mennyire pontos egy online értékbecslés?

Annyira, amennyire pontosak és teljesek a megadott adatok. Egy online, tájékoztató értékmeghatározás jó kiindulópont az irányár meghatározásához, de nem helyettesíti a helyszíni szemlén alapuló hivatalos szakvéleményt.

### A hirdetési árak alapján nem tudom én is kiszámolni, mennyit ér a házam?

Részben igen, de a hirdetési ár csak kínálati ár. Sok ingatlan hónapokig hirdetve marad, mert túl van árazva, ezért a hirdetések átlaga gyakran magasabb a ténylegesen elért vételárnál.

### Megéri felújítani eladás előtt?

Kisebb javítások, például festés, apróbb hibák kijavítása és a rendrakás szinte mindig megérik. Egy nagyobb felújítás költsége viszont nem mindig térül meg teljes egészében a vételárban; ezt érdemes az értékbecsléssel együtt mérlegelni.

## Tudja meg, mennyit ér az ingatlana

Kérjen tájékoztató [értékmeghatározást](/hu/ertekbecsles/) néhány perc alatt, és határozza meg magabiztosan az irányárat. Ha már tudja, mennyit kér, [adja fel hirdetését](/hu/hirdetes-feladasa/), és mutassa be ingatlanát nyugat-európai vevőknek is.$md$,
  'Eladói útmutató',
  'FINDDOME',
  5,
  'Mennyit ér a házam? Ingatlan értékbecslés',
  'Mennyit ér a házam? Mutatjuk, hogyan működik az ingatlan értékbecslés, mi emeli és mi csökkenti az árat, és hogyan határozzon meg reális irányárat.',
  false,
  true,
  '2026-10-28 09:10:00+01'
)
on conflict (locale, slug) do nothing;

-- Ingatlan eladás adója és költségei 2026-ban: teljes útmutató  (fő kulcsszó: ingatlan eladás adója / ingatlan eladás költségei)
insert into blog_posts (locale, kind, slug, title, excerpt, body_md, category, author, reading_minutes, seo_title, seo_description, featured, published, published_at)
values (
  'hu',
  'article',
  'ingatlan-eladas-adoja-es-koltsegei-2026',
  'Ingatlan eladás adója és költségei 2026-ban: teljes útmutató',
  'Mikor kell szja-t fizetni az ingatlan eladása után, hogyan működik az ötéves szabály, mely költségek vonhatók le, és mi terheli az eladót?',
  $md$Aki eladja a lakását vagy a házát, elsőként a vételárra gondol – pedig az **ingatlan eladás adója és költségei** is jelentősen befolyásolhatják, mennyi pénz marad végül a zsebében. Ebben az útmutatóban összefoglaljuk, mikor kell személyi jövedelemadót fizetni az ingatlan eladása után, hogyan működik az ötéves szabály, mely költségek vonhatók le, és milyen egyéb kiadásokkal számoljon eladóként 2026-ban.

*Fontos: a cikk a 2026-ban érvényes, általános szabályokat mutatja be, tájékoztató jelleggel. Az adózás mindig az egyedi körülményektől függ, ezért konkrét ügyben kérje adótanácsadó, könyvelő vagy ügyvéd segítségét, illetve tájékozódjon a Nemzeti Adó- és Vámhivatal (NAV) honlapján.*

## Kell-e adót fizetni az ingatlan eladása után?

Nem mindig. A jelenlegi szabályok szerint az ingatlan eladásából származó **jövedelem** után kell személyi jövedelemadót (szja) fizetni, nem a teljes vételár után. Ha nem keletkezik adóköteles jövedelem, nincs fizetendő adó.

Nem keletkezik adóköteles jövedelem például, ha:

- az ingatlant a szerzés évét követő **ötödik évben vagy később** adja el;
- az elszámolható költségek elérik vagy meghaladják a bevételt (vagyis nem adja el drágábban, mint amennyibe az ingatlan összesen került);
- az ügylet a törvény szerint adómentes.

## Az ötéves szabály: így csökken az adóköteles jövedelem

A jelenlegi szabályozás szerint az ötéves szabály minden ingatlanra egyformán vonatkozik – lakásra, családi házra, nyaralóra, telekre, üzlethelyiségre is. Az adóköteles jövedelem a bevétel és a költségek különbségéből számított összeg egy meghatározott százaléka, attól függően, hogy mennyi idő telt el a szerzés óta:

| Az eladás ideje | A számított összeg ennyi százaléka adóköteles jövedelem |
| --- | --- |
| a szerzés évében és az azt követő évben | 100% |
| a szerzés évét követő 2. évben | 90% |
| a szerzés évét követő 3. évben | 60% |
| a szerzés évét követő 4. évben | 30% |
| a szerzés évét követő 5. évben és később | 0% |

Egy 2026-os eladásnál ez a gyakorlatban azt jelenti, hogy ha az ingatlant **2021-ben vagy korábban** szerezte, nem keletkezik adóköteles jövedelme. Ha 2022-ben szerezte, a számított összeg 30%-a, ha 2023-ban, 60%-a, ha 2024-ben, 90%-a, ha 2025-ben vagy 2026-ban, 100%-a adóköteles.

### Mikor számít megszerzettnek az ingatlan?

Általános szabályként a szerzés időpontja az a nap, amikor a szerzésről szóló érvényes szerződést benyújtották a földhivatalhoz. Öröklésnél a szerzés időpontja az örökhagyó halálának napja. Új építésű ingatlannál és más különleges esetekben eltérő szabályok is lehetnek, ezért ilyenkor érdemes szakemberrel egyeztetni.

## Hogyan számolják ki az ingatlan eladás adóját?

A számítás három lépésből áll:

1. **Bevétel:** jellemzően az eladási ár (és például a vevő által fizetett esetleges késedelmi kamat).
2. **Levonható költségek:** ezeket a bevételből le kell vonni. A különbség a „számított összeg”, amely nem lehet nullánál kevesebb.
3. **Az időarányos csökkentés:** a számított összeg a fenti táblázat szerinti százaléka lesz az adóköteles jövedelem, amelynek **15%-a** a fizetendő személyi jövedelemadó.

### Mely költségek vonhatók le?

A jelenlegi szabályok szerint többek között:

- az ingatlan **megszerzésére fordított összeg** (a korábbi vételár);
- a megszerzéssel kapcsolatos kiadások, például a vagyonszerzési illeték és az ügyvédi díj;
- az **értéknövelő beruházások** költsége (például bővítés, tetőcsere, szigetelés, nyílászárócsere);
- az eladással kapcsolatos kiadások, például a **hirdetési díj** és az **ingatlanközvetítői díj**.

A költségeket **számlával vagy más okirattal** kell igazolni, és csak olyan kiadás vehető figyelembe, amelyet korábban még nem számoltak el. A puszta állagmegóvás (például egy festés) csak szigorú feltételekkel számolható el. Érdemes tehát minden felújítási számlát megőrizni: évekkel később ezek jelentős adót spórolhatnak meg.

### Egy egyszerű példa

Tegyük fel, hogy valaki 2026-ban ad el egy 2023-ban vásárolt lakást. A vételár és a levonható, számlával igazolt költségek különbsége (a számított összeg) 10 millió forint. Mivel az eladás a szerzés évét követő harmadik évben történik, a számított összeg 60%-a, azaz 6 millió forint az adóköteles jövedelem. Ennek 15%-a, vagyis **900 000 forint** a fizetendő szja. Ha ugyanezt a lakást 2028-ban adná el, már nem keletkezne adóköteles jövedelem.

## Mikor és hogyan kell bevallani?

Ha az eladásból adóköteles jövedelem keletkezik, azt az adásvételi szerződés földhivatali benyújtását követő év **május 20-áig** kell bevallani a személyi jövedelemadó-bevallásban, és az adót is eddig kell megfizetni. Egy 2026-os eladásnál ez a 2027. május 20-i határidőt jelenti. Ha az eladás adómentes, vagy nem keletkezik belőle jövedelem, a jelenlegi szabályok szerint a bevételt nem kell feltüntetni a bevallásban.

A számításhoz a NAV honlapján ingatlanértékesítési kalkulátor is elérhető. Az ingatlan eladásából származó jövedelmet főszabály szerint szociális hozzájárulási adó nem terheli; kivétel lehet, ha valaki üzletszerűen, rendszeresen adásvétellel foglalkozik – ilyenkor feltétlenül kérjen szakmai tanácsot.

## Milyen egyéb költségekkel számoljon eladóként?

Az adón túl az ingatlan eladása más kiadásokkal is jár. Hogy ezek közül melyik terheli az eladót és melyik a vevőt, az részben jogszabályon, részben a felek megállapodásán múlik.

### Energetikai tanúsítvány

A jelenlegi szabályok szerint a legtöbb épület és lakás eladásához energetikai tanúsítvány szükséges, és a besorolást már a hirdetésben fel kell tüntetni. Ezt jellemzően az eladó rendeli meg, még a hirdetés előtt. Ha korábban már készült tanúsítvány, ellenőrizze, hogy még érvényes-e.

### Ügyvédi díj

Az adásvételi szerződést a földhivatali bejegyzéshez ügyvédnek kell ellenjegyeznie (vagy közjegyzői okiratba kell foglalni). Az ügyvédi díj összege és az, hogy ki fizeti, megállapodás kérdése; gyakori, hogy a vevő bízza meg az ügyvédet, de az eladónak is joga van saját jogi képviselőt választani. Külföldi vevőnél kétnyelvű szerződésre is szükség lehet.

### Hirdetési és közvetítői díj

Ha ingatlanközvetítővel dolgozik, a jutalék az egyik legnagyobb kiadási tétel lehet. Érdemes alaposan átolvasni a megbízási szerződést: kizárólagos-e, mikor és milyen feltételekkel jár jutalék. A FINDDOME-nál nincs kizárólagossági szerződés; a hirdetési díjak az [árlistán](/hu/arlista/) olvashatók, jutalék pedig csak akkor merül fel, ha mi hozzuk és közvetítjük a vevőt. Ha a vevő közvetlenül Önnel állapodik meg, a hirdetési díjon felül nincs további díj. A részleteket az [Eladóknak](/hu/eladoknak/) oldalon találja.

### Jelzálog és egyéb terhek törlése

Ha az ingatlanon jelzálog van, az eladás előtt vagy az adásvétel során rendezni kell a tartozást, és a banktól törlési engedélyt kell kérni. Ennek az ügyintézése időbe telik, ezért érdemes időben elkezdeni.

### Közművek, közös költség, apróbb kiadások

Az eladónak rendeznie kell a közüzemi és közös költség tartozásokat, a birtokbaadáskor pedig rögzíteni kell a mérőóra-állásokat. Ide tartozhat még a tulajdoni lap lekérése, az alaprajz pótlása vagy egy kisebb javítás az eladás előtt.

### És a vagyonszerzési illeték?

A vagyonszerzési illetéket nem az eladó, hanem **a vevő** fizeti. Általános mértéke jelenleg a forgalmi érték 4%-a, bizonyos esetekben kedvezménnyel vagy mentességgel. Eladóként azért érdemes ismerni, mert a vevő a teljes költségével számol, amikor ajánlatot tesz.

## Hogyan tervezze meg az eladást adó szempontból?

- **Nézze meg a szerzés évét.** Ha az ötéves határ közel van, érdemes lehet kivárni vele, de ezt mindig vesse össze azzal, hogy mennyit ér a gyorsabb eladás.
- **Gyűjtse össze a számlákat.** A korábbi vételárat, az illetéket, az ügyvédi díjat és a felújítások számláit.
- **Számoljon nettóban.** A vételárból vonja le a várható adót és a költségeket, így látja, mennyi marad valójában.
- **Határozzon meg reális árat.** A reális irányár meghatározásában segít a [Mennyit ér a házam?](/hu/blog/mennyit-er-a-hazam-ingatlan-ertekbecsles/) című cikkünk és a tájékoztató [értékmeghatározás](/hu/ertekbecsles/).

## Gyakori kérdések

### Kell adót fizetni, ha 5 évnél régebben vettem az ingatlant?

A jelenlegi szabályok szerint nem: ha az eladás a szerzés évét követő ötödik évben vagy később történik, nem keletkezik adóköteles jövedelem, és a bevételt sem kell bevallani.

### A teljes vételár után kell adót fizetni?

Nem. Az adó alapja a bevétel és a levonható költségek különbségéből, az eltelt idő szerint csökkentve számított jövedelem. Ennek 15%-a az szja.

### Ki fizeti az illetéket ingatlan eladásakor?

A vagyonszerzési illetéket a vevő fizeti. Általános mértéke a forgalmi érték 4%-a, de bizonyos esetekben kedvezmény vagy mentesség járhat.

### Levonhatom a felújítás költségét?

Az értéknövelő beruházások költsége, például egy bővítés vagy szigetelés, számlával igazolva levonható. Az állagmegóvó munkák csak szigorúbb feltételekkel számolhatók el, ezért érdemes szakemberrel egyeztetni.

### Más az adózás, ha külföldi vevőnek adom el az ingatlant?

Az eladó szja-kötelezettsége szempontjából a vevő állampolgársága általában nem számít: ugyanazok a szabályok vonatkoznak a magyar és a külföldi vevőnek történő eladásra. Az eladás menetéről a [Ház eladása külföldi vevőnek](/hu/blog/haz-eladasa-kulfoldi-vevonek/) című cikkünkben írunk.

## Készüljön fel az eladásra

Ha már tudja, mivel kell számolnia, a következő lépés egy jó hirdetés. [Adja fel hirdetését](/hu/hirdetes-feladasa/) a FINDDOME-on, és mutassa be ingatlanát nyugat-európai vevőknek is. Kérdése van? [Vegye fel velünk a kapcsolatot](/hu/kapcsolat/).$md$,
  'Eladói útmutató',
  'FINDDOME',
  7,
  'Ingatlan eladás adója és költségei 2026',
  'Ingatlan eladás adója 2026-ban: mikor kell 15% szja-t fizetni, hogyan működik az ötéves szabály, mi vonható le, és milyen költségekkel számoljon.',
  false,
  true,
  '2026-10-28 09:20:00+01'
)
on conflict (locale, slug) do nothing;
