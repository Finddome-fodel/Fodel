-- 0026: Italian, Portuguese, Greek, Czech, Slovenian, Swedish, Danish, Norwegian, Finnish, Estonian, Latvian and Lithuanian
--
-- Run by hand in the Supabase SQL editor, after 0025, BEFORE deploying the
-- branch that adds /it, /pt, /el, /cs, /sl, /sv, /da, /no, /fi, /et, /lv and /lt.
-- Safe to run twice.
--
-- 1. The locale_code enum (0001) learns the twelve new codes, so translations,
--    email templates, valuations, blog posts and activity rows can be stored
--    in those languages.
-- 2. Newsletter sign-ups may be in any of the 21 languages (0023 allowed nine).
-- 3. The property vocabulary gets labels in the twelve languages, and the
--    property categories their URL words.
--
-- Full-text search needs no change: the search function (0022) and the
-- generated search_vector column (0004) use 'simple' for any language without
-- a named dictionary. (Postgres ships dictionaries for several of these languages;
-- switching a language to its own is an optional later change to both.)
--
-- As in 0020 and 0023, nothing overwrites wording an admin has typed: existing
-- labels and slugs win (the new values sit on the left of the || merge). The
-- site carries the same wording in src/data/taxonomy-i18n.ts, src/i18n/ui.ts
-- (CATEGORY_FALLBACK) and src/data/listing/groups.json.

/* ── 1. Languages ────────────────────────────────────────────────────────── */

-- ALTER TYPE … ADD VALUE cannot be used in the same transaction that adds it;
-- the statements below do not use the new values, so this runs as one script.
alter type locale_code add value if not exists 'it';
alter type locale_code add value if not exists 'pt';
alter type locale_code add value if not exists 'el';
alter type locale_code add value if not exists 'cs';
alter type locale_code add value if not exists 'sl';
alter type locale_code add value if not exists 'sv';
alter type locale_code add value if not exists 'da';
alter type locale_code add value if not exists 'no';
alter type locale_code add value if not exists 'fi';
alter type locale_code add value if not exists 'et';
alter type locale_code add value if not exists 'lv';
alter type locale_code add value if not exists 'lt';

/* ── 2. Newsletter language ──────────────────────────────────────────────── */

do $$
declare
  c record;
begin
  if to_regclass('public.newsletter_subscribers') is not null then
    for c in
      select conname from pg_constraint
      where conrelid = 'public.newsletter_subscribers'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) ilike '%locale%'
    loop
      execute format('alter table public.newsletter_subscribers drop constraint %I', c.conname);
    end loop;
    alter table public.newsletter_subscribers
      add constraint newsletter_subscribers_locale_check
      check (locale in ('hu', 'nl', 'en', 'de', 'fr', 'es', 'pl', 'ro', 'sk', 'it', 'pt', 'el', 'cs', 'sl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt'));
  end if;
end $$;

/* ── 3. Vocabulary labels ────────────────────────────────────────────────── */

-- feature
update taxonomy_terms t set labels = jsonb_build_object('it', v.it, 'pt', v.pt, 'el', v.el, 'cs', v.cs, 'sl', v.sl, 'sv', v.sv, 'da', v.da, 'no', v.no, 'fi', v.fi, 'et', v.et, 'lv', v.lv, 'lt', v.lt) || t.labels
from (values
    ('panoramic-view', 'Vista panoramica', 'Vista panorâmica', 'Πανοραμική θέα', 'Panoramatický výhled', 'Panoramski razgled', 'Panoramautsikt', 'Panoramaudsigt', 'Panoramautsikt', 'Panoraamanäkymä', 'Panoraamvaade', 'Panorāmas skats', 'Panoraminis vaizdas'),
    ('waterfront', 'Sull’acqua', 'À beira da água', 'Δίπλα στο νερό', 'U vody', 'Ob vodi', 'Vid vattnet', 'Ved vandet', 'Ved vannet', 'Rannalla', 'Vee ääres', 'Pie ūdens', 'Prie vandens'),
    ('private-jetty', 'Pontile privato', 'Cais privativo', 'Ιδιωτική προβλήτα', 'Vlastní molo', 'Zasebni pomol', 'Egen brygga', 'Egen bådebro', 'Egen brygge', 'Oma laituri', 'Oma kai', 'Privāta laivu piestātne', 'Privati prieplauka'),
    ('boathouse', 'Rimessa per barche', 'Casa de barcos', 'Υπόστεγο σκαφών', 'Loděnice', 'Čolnarna', 'Båthus', 'Bådehus', 'Naust', 'Venevaja', 'Paadikuur', 'Laivu māja', 'Valčių namelis'),
    ('hillside', 'In collina', 'No topo de uma colina', 'Σε λόφο', 'Na kopci', 'Na vrhu hriba', 'På en höjd', 'På en bakketop', 'På en høyde', 'Kukkulan laella', 'Mäe otsas', 'Kalna virsotnē', 'Ant kalvos'),
    ('forest-adjacent', 'Vicino al bosco', 'Perto da floresta', 'Κοντά στο δάσος', 'U lesa', 'Blizu gozda', 'Nära skogen', 'Nær skoven', 'Nær skogen', 'Metsän lähellä', 'Metsa lähedal', 'Pie meža', 'Prie miško'),
    ('vineyard', 'Vigneto', 'Vinha', 'Αμπελώνας', 'Vinice', 'Vinograd', 'Vingård', 'Vinmark', 'Vinmark', 'Viinitarha', 'Viinamägi', 'Vīnogulāji', 'Vynuogynas'),
    ('winery', 'Cantina in attività', 'Adega em funcionamento', 'Οινοποιείο σε λειτουργία', 'Fungující vinařství', 'Delujoča vinska klet', 'Vingård i drift', 'Vingård i drift', 'Vingård i drift', 'Toimiva viinitila', 'Tegutsev veinitalu', 'Strādājoša vīna darītava', 'Veikianti vyno darykla'),
    ('cellar', 'Cantina', 'Adega', 'Κελάρι κρασιού', 'Vinný sklep', 'Vinska klet', 'Vinkällare', 'Vinkælder', 'Vinkjeller', 'Viinikellari', 'Veinikelder', 'Vīna pagrabs', 'Vyno rūsys'),
    ('orchard', 'Frutteto', 'Pomar', 'Οπωρώνας', 'Ovocný sad', 'Sadovnjak', 'Fruktträdgård', 'Frugthave', 'Frukthage', 'Hedelmätarha', 'Viljapuuaed', 'Augļu dārzs', 'Vaismedžių sodas'),
    ('well', 'Pozzo privato', 'Poço próprio', 'Ιδιωτικό πηγάδι', 'Vlastní studna', 'Lasten vodnjak', 'Egen brunn', 'Egen brønd', 'Egen brønn', 'Oma kaivo', 'Oma kaev', 'Sava aka', 'Nuosavas šulinys'),
    ('outbuildings', 'Annessi', 'Anexos', 'Βοηθητικά κτίσματα', 'Hospodářské budovy', 'Pomožni objekti', 'Uthus', 'Udhuse', 'Uthus', 'Ulkorakennukset', 'Kõrvalhooned', 'Saimniecības ēkas', 'Ūkiniai pastatai'),
    ('stables', 'Scuderie', 'Cavalariças', 'Στάβλοι αλόγων', 'Stáje', 'Konjski hlevi', 'Stall', 'Stalde', 'Stall', 'Talli', 'Tallid', 'Zirgu staļļi', 'Arklidės'),
    ('guesthouse', 'Dépendance per ospiti', 'Casa de hóspedes', 'Ξενώνας', 'Dům pro hosty', 'Hiša za goste', 'Gästhus', 'Gæstehus', 'Gjestehus', 'Vierasmaja', 'Külalistemaja', 'Viesu māja', 'Svečių namas'),
    ('park', 'Parco', 'Parque', 'Πάρκο', 'Park', 'Park', 'Park', 'Park', 'Park', 'Puisto', 'Park', 'Parks', 'Parkas'),
    ('terrace', 'Terrazza', 'Terraço', 'Βεράντα', 'Terasa', 'Terasa', 'Terrass', 'Terrasse', 'Terrasse', 'Terassi', 'Terrass', 'Terase', 'Terasa'),
    ('original-beams', 'Travi originali', 'Vigas originais', 'Αυθεντικά δοκάρια', 'Původní trámy', 'Izvirni tramovi', 'Originalbjälkar', 'Originale bjælker', 'Originale bjelker', 'Alkuperäiset palkit', 'Algupärased talad', 'Oriģinālās sijas', 'Originalios sijos'),
    ('renovated', 'Ristrutturato', 'Renovado', 'Ανακαινισμένο', 'Po rekonstrukci', 'Prenovljeno', 'Renoverad', 'Renoveret', 'Renovert', 'Remontoitu', 'Renoveeritud', 'Renovēts', 'Renovuotas'),
    ('parking', 'Parcheggio nel lotto', 'Estacionamento no terreno', 'Στάθμευση εντός οικοπέδου', 'Parkování na pozemku', 'Parkiranje na parceli', 'Parkering på tomten', 'Parkering på grunden', 'Parkering på tomten', 'Pysäköinti tontilla', 'Parkimine krundil', 'Autostāvvieta zemesgabalā', 'Automobilių stovėjimo vieta sklype'),
    ('garage', 'Garage', 'Garagem', 'Γκαράζ', 'Garáž', 'Garaža', 'Garage', 'Garage', 'Garasje', 'Autotalli', 'Garaaž', 'Garāža', 'Garažas'),
    ('pool', 'Piscina', 'Piscina', 'Πισίνα', 'Bazén', 'Bazen', 'Pool', 'Pool', 'Basseng', 'Uima-allas', 'Bassein', 'Baseins', 'Baseinas'),
    ('balcony', 'Balcone', 'Varanda', 'Μπαλκόνι', 'Balkon', 'Balkon', 'Balkong', 'Altan', 'Balkong', 'Parveke', 'Rõdu', 'Balkons', 'Balkonas'),
    ('carport', 'Posto auto coperto', 'Telheiro para carro', 'Στέγαστρο αυτοκινήτου', 'Přístřešek pro auto', 'Nadstrešek za avto', 'Carport', 'Carport', 'Carport', 'Autokatos', 'Autovarjualune', 'Nojume automašīnai', 'Stoginė automobiliui'),
    ('storage-building', 'Deposito', 'Armazém', 'Αποθήκη', 'Skladovací budova', 'Skladiščni objekt', 'Förrådsbyggnad', 'Lagerbygning', 'Lagerbygning', 'Varastorakennus', 'Laohoone', 'Noliktavas ēka', 'Sandėlis'),
    ('barn-hall', 'Fienile o capannone', 'Celeiro ou pavilhão', 'Αχυρώνας ή υπόστεγο', 'Stodola nebo hala', 'Skedenj ali hala', 'Lada eller hall', 'Lade eller hal', 'Låve eller hall', 'Lato tai halli', 'Küün või angaar', 'Šķūnis vai angārs', 'Daržinė arba angaras'),
    ('animal-housing', 'Ricovero per animali', 'Abrigo para animais', 'Χώρος σταβλισμού ζώων', 'Ustájení pro zvířata', 'Prostor za živali', 'Djurstall', 'Dyrestald', 'Dyrehus', 'Eläinsuoja', 'Loomapidamishoone', 'Kūts', 'Tvartas'),
    ('gazebo', 'Gazebo', 'Caramanchão', 'Κιόσκι', 'Altán', 'Senčnica', 'Lusthus', 'Lysthus', 'Lysthus', 'Huvimaja', 'Lehtla', 'Lapene', 'Pavėsinė'),
    ('outdoor-oven', 'Forno all’aperto', 'Forno exterior', 'Υπαίθριος φούρνος', 'Venkovní pec', 'Zunanja krušna peč', 'Utomhusugn', 'Udendørs ovn', 'Utendørs ovn', 'Ulkouuni', 'Õueahi', 'Āra krāsns', 'Lauko krosnis')
) as v(key, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt)
where t.group_key = 'feature' and t.key = v.key;

-- condition
update taxonomy_terms t set labels = jsonb_build_object('it', v.it, 'pt', v.pt, 'el', v.el, 'cs', v.cs, 'sl', v.sl, 'sv', v.sv, 'da', v.da, 'no', v.no, 'fi', v.fi, 'et', v.et, 'lv', v.lv, 'lt', v.lt) || t.labels
from (values
    ('new', 'Come nuovo', 'Como novo', 'Σαν καινούργιο', 'Jako nový', 'Kot novo', 'Som ny', 'Som ny', 'Som ny', 'Kuin uusi', 'Nagu uus', 'Kā jauns', 'Kaip naujas'),
    ('renovated', 'Ristrutturato', 'Renovado', 'Ανακαινισμένο', 'Po rekonstrukci', 'Prenovljeno', 'Renoverad', 'Renoveret', 'Renovert', 'Remontoitu', 'Renoveeritud', 'Renovēts', 'Renovuotas'),
    ('good', 'In buono stato', 'Em bom estado', 'Σε καλή κατάσταση', 'V dobrém stavu', 'V dobrem stanju', 'Gott skick', 'God stand', 'God stand', 'Hyvä kunto', 'Heas seisukorras', 'Labā stāvoklī', 'Geros būklės'),
    ('needs-renovation', 'Da ristrutturare', 'Para renovar', 'Χρειάζεται ανακαίνιση', 'K rekonstrukci', 'Potrebno prenove', 'Renoveringsbehov', 'Trænger til renovering', 'Oppussingsbehov', 'Remontin tarpeessa', 'Vajab renoveerimist', 'Nepieciešama renovācija', 'Reikia renovuoti')
) as v(key, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt)
where t.group_key = 'condition' and t.key = v.key;

-- heating
update taxonomy_terms t set labels = jsonb_build_object('it', v.it, 'pt', v.pt, 'el', v.el, 'cs', v.cs, 'sl', v.sl, 'sv', v.sv, 'da', v.da, 'no', v.no, 'fi', v.fi, 'et', v.et, 'lv', v.lv, 'lt', v.lt) || t.labels
from (values
    ('gas', 'Riscaldamento a gas', 'Aquecimento a gás', 'Θέρμανση με αέριο', 'Plynové vytápění', 'Plinsko ogrevanje', 'Gasuppvärmning', 'Gasvarme', 'Gassoppvarming', 'Kaasulämmitys', 'Gaasiküte', 'Gāzes apkure', 'Dujinis šildymas'),
    ('electric', 'Riscaldamento elettrico', 'Aquecimento elétrico', 'Ηλεκτρική θέρμανση', 'Elektrické vytápění', 'Električno ogrevanje', 'Elvärme', 'Elvarme', 'Elektrisk oppvarming', 'Sähkölämmitys', 'Elektriküte', 'Elektriskā apkure', 'Elektrinis šildymas'),
    ('wood', 'Riscaldamento a legna', 'Aquecimento a lenha', 'Θέρμανση με ξύλα', 'Vytápění dřevem', 'Ogrevanje na drva', 'Vedeldning', 'Brændefyring', 'Vedfyring', 'Puulämmitys', 'Puiduküte', 'Malkas apkure', 'Šildymas malkomis'),
    ('heat-pump', 'Pompa di calore', 'Bomba de calor', 'Αντλία θερμότητας', 'Tepelné čerpadlo', 'Toplotna črpalka', 'Värmepump', 'Varmepumpe', 'Varmepumpe', 'Lämpöpumppu', 'Soojuspump', 'Siltumsūknis', 'Šilumos siurblys')
) as v(key, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt)
where t.group_key = 'heating' and t.key = v.key;

-- blog_category
update taxonomy_terms t set labels = jsonb_build_object('it', v.it, 'pt', v.pt, 'el', v.el, 'cs', v.cs, 'sl', v.sl, 'sv', v.sv, 'da', v.da, 'no', v.no, 'fi', v.fi, 'et', v.et, 'lv', v.lv, 'lt', v.lt) || t.labels
from (values
    ('market', 'Analisi di mercato', 'Análise de mercado', 'Ανάλυση αγοράς', 'Analýza trhu', 'Analiza trga', 'Marknadsanalys', 'Markedsanalyse', 'Markedsanalyse', 'Markkina-analyysi', 'Turuanalüüs', 'Tirgus analīze', 'Rinkos analizė'),
    ('buyers', 'Guida per l’acquirente', 'Guia do comprador', 'Οδηγός αγοραστή', 'Průvodce pro kupující', 'Vodnik za kupce', 'Köparguide', 'Købervejledning', 'Kjøperguide', 'Ostajan opas', 'Ostja teejuht', 'Pircēja ceļvedis', 'Pirkėjo gidas'),
    ('news', 'Notizie', 'Notícias', 'Νέα', 'Novinky', 'Novice', 'Nyheter', 'Nyheder', 'Nyheter', 'Uutiset', 'Uudised', 'Jaunumi', 'Naujienos'),
    ('case-study', 'Caso di studio', 'Estudo de caso', 'Μελέτη περίπτωσης', 'Případová studie', 'Študija primera', 'Fallstudie', 'Casestudie', 'Casestudie', 'Tapaustutkimus', 'Juhtumiuuring', 'Gadījuma izpēte', 'Atvejo analizė')
) as v(key, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt)
where t.group_key = 'blog_category' and t.key = v.key;

-- wall
update taxonomy_terms t set labels = jsonb_build_object('it', v.it, 'pt', v.pt, 'el', v.el, 'cs', v.cs, 'sl', v.sl, 'sv', v.sv, 'da', v.da, 'no', v.no, 'fi', v.fi, 'et', v.et, 'lv', v.lv, 'lt', v.lt) || t.labels
from (values
    ('tegla', 'Mattoni', 'Tijolo', 'Τούβλο', 'Cihla', 'Opeka', 'Tegel', 'Mursten', 'Tegl', 'Tiili', 'Telliskivi', 'Ķieģelis', 'Plytos'),
    ('valyog', 'Adobe (mattoni crudi)', 'Adobe (tijolo de barro)', 'Πλίνθοι (ωμόπλινθοι)', 'Nepálené cihly', 'Nežgana opeka (blato)', 'Lersten (soltorkat tegel)', 'Lersten (soltørret)', 'Leirstein (soltørket)', 'Savitiili (polttamaton)', 'Savitellis (põletamata)', 'Māla ķieģelis (nededzināts)', 'Molio plytos (nedegtos)'),
    ('vegyes', 'Misto', 'Misto', 'Μικτό', 'Smíšené', 'Mešano', 'Blandat', 'Blandet', 'Blandet', 'Sekarakenne', 'Segamaterjal', 'Jaukts', 'Mišrios'),
    ('panel', 'Calcestruzzo / pannelli', 'Betão / painéis', 'Σκυρόδεμα / πάνελ', 'Beton / panel', 'Beton / montažni paneli', 'Betong / element', 'Beton / elementer', 'Betong / element', 'Betoni / elementti', 'Betoon / paneel', 'Betons / paneļi', 'Betonas / plokštės'),
    ('fa', 'Legno / struttura leggera', 'Madeira / estrutura ligeira', 'Ξύλο / ελαφριά κατασκευή', 'Dřevo / lehká konstrukce', 'Les / lahka konstrukcija', 'Trä / lätt stomme', 'Træ / let konstruktion', 'Tre / lett konstruksjon', 'Puu / kevytrakenne', 'Puit / kergkonstruktsioon', 'Koks / viegla konstrukcija', 'Mediena / lengvos konstrukcijos'),
    ('ko', 'Pietra', 'Pedra', 'Πέτρα', 'Kámen', 'Kamen', 'Sten', 'Sten', 'Stein', 'Kivi', 'Kivi', 'Akmens', 'Akmuo'),
    ('egyeb', 'Altro', 'Outro', 'Άλλο', 'Jiné', 'Drugo', 'Annat', 'Andet', 'Annet', 'Muu', 'Muu', 'Cits', 'Kita'),
    ('nem-tudom', 'Sconosciuto', 'Desconhecido', 'Άγνωστο', 'Neznámé', 'Neznano', 'Okänt', 'Ukendt', 'Ukjent', 'Tuntematon', 'Teadmata', 'Nezināms', 'Nežinoma')
) as v(key, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt)
where t.group_key = 'wall' and t.key = v.key;

/* ── 4. Category names and URL words ─────────────────────────────────────── */

update taxonomy_terms t
set labels = jsonb_build_object('it', v.label_it, 'pt', v.label_pt, 'el', v.label_el, 'cs', v.label_cs, 'sl', v.label_sl, 'sv', v.label_sv, 'da', v.label_da, 'no', v.label_no, 'fi', v.label_fi, 'et', v.label_et, 'lv', v.label_lv, 'lt', v.label_lt) || t.labels,
    slugs  = jsonb_build_object('it', v.slug_it, 'pt', v.slug_pt, 'el', v.slug_el, 'cs', v.slug_cs, 'sl', v.slug_sl, 'sv', v.slug_sv, 'da', v.slug_da, 'no', v.slug_no, 'fi', v.slug_fi, 'et', v.slug_et, 'lv', v.slug_lv, 'lt', v.slug_lt) || t.slugs
from (values
    ('house', 'Casa', 'Moradia', 'Μονοκατοικία', 'Dům', 'Hiša', 'Hus', 'Hus', 'Hus', 'Talo', 'Maja', 'Māja', 'Namas', 'casa', 'moradia', 'monokatoikia', 'dum', 'hisa', 'hus', 'hus', 'hus', 'talo', 'maja', 'maja', 'namas'),
    ('holiday', 'Casa vacanze', 'Casa de férias', 'Εξοχική κατοικία', 'Rekreační dům', 'Počitniška hiša', 'Fritidshus', 'Feriehus', 'Fritidsbolig', 'Loma-asunto', 'Puhkemaja', 'Brīvdienu māja', 'Poilsio namas', 'casa-vacanze', 'casa-de-ferias', 'exochiki-katoikia', 'rekreacni-dum', 'pocitniska-hisa', 'fritidshus', 'feriehus', 'fritidsbolig', 'loma-asunto', 'puhkemaja', 'brivdienu-maja', 'poilsio-namas'),
    ('farm', 'Fattoria', 'Quinta', 'Αγρόκτημα', 'Statek', 'Kmetija', 'Gård', 'Landbrug', 'Gårdsbruk', 'Maatila', 'Talu', 'Lauku saimniecība', 'Ūkis', 'fattoria', 'quinta', 'agroktima', 'statek', 'kmetija', 'gard', 'landbrug', 'gardsbruk', 'maatila', 'talu', 'lauku-saimnieciba', 'ukis'),
    ('land', 'Terreno', 'Terreno', 'Οικόπεδο', 'Pozemek', 'Zemljišče', 'Tomt', 'Grund', 'Tomt', 'Tontti', 'Maatükk', 'Zemesgabals', 'Sklypas', 'terreno', 'terreno', 'oikopedo', 'pozemek', 'zemljisce', 'tomt', 'grund', 'tomt', 'tontti', 'maatukk', 'zemesgabals', 'sklypas'),
    ('commercial', 'Immobile commerciale', 'Imóvel comercial', 'Επαγγελματικό ακίνητο', 'Komerční nemovitost', 'Poslovna nepremičnina', 'Kommersiell fastighet', 'Erhvervsejendom', 'Næringseiendom', 'Liikekiinteistö', 'Ärikinnisvara', 'Komercīpašums', 'Komercinis turtas', 'immobile-commerciale', 'imovel-comercial', 'epangelmatiko-akinito', 'komercni-nemovitost', 'poslovna-nepremicnina', 'kommersiell-fastighet', 'erhvervsejendom', 'naeringseiendom', 'liikekiinteisto', 'arikinnisvara', 'komercipasums', 'komercinis-turtas'),
    ('agricultural', 'Immobili agricoli', 'Imóveis agrícolas', 'Αγροτικά ακίνητα', 'Zemědělské nemovitosti', 'Kmetijske nepremičnine', 'Jordbruksfastigheter', 'Landbrugsejendomme', 'Landbrukseiendommer', 'Maatalouskiinteistöt', 'Põllumajanduslik kinnisvara', 'Lauksaimniecības īpašumi', 'Žemės ūkio paskirties objektai', 'immobile-agricolo', 'imovel-agricola', 'agrotiko-akinito', 'zemedelska-nemovitost', 'kmetijska-nepremicnina', 'jordbruksfastighet', 'landbrugsejendom', 'landbrukseiendom', 'maatalouskiinteisto', 'pollumajanduslik-kinnisvara', 'lauksaimniecibas-ipasums', 'zemes-ukio-turtas'),
    ('mansion', 'Casale, villa padronale', 'Solar, casa senhorial', 'Αρχοντικό, έπαυλη', 'Zámeček, panské sídlo', 'Dvorec, graščina', 'Herrgård, gods', 'Landsted, herregård', 'Landsted, herregård', 'Maalaistalo, kartano', 'Mõis, maamaja', 'Muiža, lauku māja', 'Dvaras, sodyba', 'villa-padronale', 'solar', 'archontiko', 'panske-sidlo', 'dvorec', 'herrgard', 'herregard', 'herregard', 'kartano', 'mois', 'muiza', 'dvaras'),
    ('apartment', 'Appartamento', 'Apartamento', 'Διαμέρισμα', 'Byt', 'Stanovanje', 'Lägenhet', 'Lejlighed', 'Leilighet', 'Huoneisto', 'Korter', 'Dzīvoklis', 'Butas', 'appartamento', 'apartamento', 'diamerisma', 'byt', 'stanovanje', 'lagenhet', 'lejlighed', 'leilighet', 'huoneisto', 'korter', 'dzivoklis', 'butas'),
    ('industrial', 'Immobile industriale', 'Imóvel industrial', 'Βιομηχανικό ακίνητο', 'Průmyslová nemovitost', 'Industrijska nepremičnina', 'Industrifastighet', 'Industriejendom', 'Industrieiendom', 'Teollisuuskiinteistö', 'Tööstuskinnisvara', 'Rūpnieciskais īpašums', 'Pramoninis turtas', 'immobile-industriale', 'imovel-industrial', 'viomichaniko-akinito', 'prumyslova-nemovitost', 'industrijska-nepremicnina', 'industrifastighet', 'industriejendom', 'industrieiendom', 'teollisuuskiinteisto', 'toostuskinnisvara', 'rupnieciskais-ipasums', 'pramoninis-turtas')
) as v(key, label_it, label_pt, label_el, label_cs, label_sl, label_sv, label_da, label_no, label_fi, label_et, label_lv, label_lt, slug_it, slug_pt, slug_el, slug_cs, slug_sl, slug_sv, slug_da, slug_no, slug_fi, slug_et, slug_lv, slug_lt)
where t.group_key = 'category' and t.key = v.key;

-- One URL word per category and language, as for the other languages (0011, 0020, 0023).
create unique index if not exists taxonomy_category_it_slug_unique
  on taxonomy_terms ((slugs->>'it')) where group_key = 'category' and slugs ? 'it';
create unique index if not exists taxonomy_category_pt_slug_unique
  on taxonomy_terms ((slugs->>'pt')) where group_key = 'category' and slugs ? 'pt';
create unique index if not exists taxonomy_category_el_slug_unique
  on taxonomy_terms ((slugs->>'el')) where group_key = 'category' and slugs ? 'el';
create unique index if not exists taxonomy_category_cs_slug_unique
  on taxonomy_terms ((slugs->>'cs')) where group_key = 'category' and slugs ? 'cs';
create unique index if not exists taxonomy_category_sl_slug_unique
  on taxonomy_terms ((slugs->>'sl')) where group_key = 'category' and slugs ? 'sl';
create unique index if not exists taxonomy_category_sv_slug_unique
  on taxonomy_terms ((slugs->>'sv')) where group_key = 'category' and slugs ? 'sv';
create unique index if not exists taxonomy_category_da_slug_unique
  on taxonomy_terms ((slugs->>'da')) where group_key = 'category' and slugs ? 'da';
create unique index if not exists taxonomy_category_no_slug_unique
  on taxonomy_terms ((slugs->>'no')) where group_key = 'category' and slugs ? 'no';
create unique index if not exists taxonomy_category_fi_slug_unique
  on taxonomy_terms ((slugs->>'fi')) where group_key = 'category' and slugs ? 'fi';
create unique index if not exists taxonomy_category_et_slug_unique
  on taxonomy_terms ((slugs->>'et')) where group_key = 'category' and slugs ? 'et';
create unique index if not exists taxonomy_category_lv_slug_unique
  on taxonomy_terms ((slugs->>'lv')) where group_key = 'category' and slugs ? 'lv';
create unique index if not exists taxonomy_category_lt_slug_unique
  on taxonomy_terms ((slugs->>'lt')) where group_key = 'category' and slugs ? 'lt';
