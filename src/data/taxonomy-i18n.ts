/**
 * English, German, French, Spanish, Polish, Romanian, Slovak and the twelve
 * newest languages' labels for the property vocabulary.
 *
 * The taxonomy lives in the database (taxonomy_terms) with Hungarian and Dutch
 * labels, and admins can edit every language in Beállítások → Kategóriák.
 * This file is the checked-in fallback for the seven newer languages: it fills
 * in whatever a term has no label for, so the site reads correctly before
 * migrations 0020 and 0023 have run and for any term an admin adds later without
 * translating it. A label an admin typed always wins.
 *
 * Counties, regions and settlements are place names and keep their Hungarian
 * spelling in every language ("Zala"); the filter label next to them says
 * "County", "Komitat" or "Comitat".
 *
 * Keep supabase/migrations/0020_translations.sql and 0023 in step with this file.
 */

import type { Locale } from '~/i18n/ui';

type Triple = Record<'en' | 'de' | 'fr' | 'es' | 'pl' | 'ro' | 'sk' | 'it' | 'pt' | 'el' | 'cs' | 'sl' | 'sv' | 'da' | 'no' | 'fi' | 'et' | 'lv' | 'lt', string>;
type Labels = Record<string, Triple>;

const t = (
  en: string, de: string, fr: string, es: string, pl: string, ro: string, sk: string,
  it: string, pt: string, el: string, cs: string, sl: string, sv: string, da: string, no: string, fi: string, et: string, lv: string, lt: string,
): Triple => ({
  en, de, fr, es, pl, ro, sk, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt,
});

export const FEATURE_LABELS: Labels = {
  'panoramic-view': t('Panoramic view', 'Panoramablick', 'Vue panoramique', 'Vistas panorámicas', 'Widok panoramiczny', 'Priveliște panoramică', 'Panoramatický výhľad', 'Vista panoramica', 'Vista panorâmica', 'Πανοραμική θέα', 'Panoramatický výhled', 'Panoramski razgled', 'Panoramautsikt', 'Panoramaudsigt', 'Panoramautsikt', 'Panoraamanäkymä', 'Panoraamvaade', 'Panorāmas skats', 'Panoraminis vaizdas'),
  waterfront: t('Waterfront', 'Direkt am Wasser', 'Au bord de l’eau', 'Junto al agua', 'Nad samą wodą', 'La malul apei', 'Priamo pri vode', 'Sull’acqua', 'À beira da água', 'Δίπλα στο νερό', 'U vody', 'Ob vodi', 'Vid vattnet', 'Ved vandet', 'Ved vannet', 'Rannalla', 'Vee ääres', 'Pie ūdens', 'Prie vandens'),
  'private-jetty': t('Private jetty', 'Eigener Steg', 'Ponton privé', 'Embarcadero privado', 'Prywatny pomost', 'Ponton privat', 'Súkromné mólo', 'Pontile privato', 'Cais privativo', 'Ιδιωτική προβλήτα', 'Vlastní molo', 'Zasebni pomol', 'Egen brygga', 'Egen bådebro', 'Egen brygge', 'Oma laituri', 'Oma kai', 'Privāta laivu piestātne', 'Privati prieplauka'),
  boathouse: t('Boathouse', 'Bootshaus', 'Abri à bateaux', 'Cobertizo para barcos', 'Hangar na łodzie', 'Adăpost pentru bărci', 'Lodenica', 'Rimessa per barche', 'Casa de barcos', 'Υπόστεγο σκαφών', 'Loděnice', 'Čolnarna', 'Båthus', 'Bådehus', 'Naust', 'Venevaja', 'Paadikuur', 'Laivu māja', 'Valčių namelis'),
  hillside: t('On a hilltop', 'Auf einem Hügel', 'Sur une colline', 'En lo alto de una colina', 'Na wzgórzu', 'Pe un deal', 'Na kopci', 'In collina', 'No topo de uma colina', 'Σε λόφο', 'Na kopci', 'Na vrhu hriba', 'På en höjd', 'På en bakketop', 'På en høyde', 'Kukkulan laella', 'Mäe otsas', 'Kalna virsotnē', 'Ant kalvos'),
  'forest-adjacent': t('Near the forest', 'In Waldnähe', 'Près de la forêt', 'Cerca del bosque', 'W pobliżu lasu', 'Aproape de pădure', 'Pri lese', 'Vicino al bosco', 'Perto da floresta', 'Κοντά στο δάσος', 'U lesa', 'Blizu gozda', 'Nära skogen', 'Nær skoven', 'Nær skogen', 'Metsän lähellä', 'Metsa lähedal', 'Pie meža', 'Prie miško'),
  vineyard: t('Vineyard', 'Weinberg', 'Vignoble', 'Viñedo', 'Winnica', 'Viță-de-vie', 'Vinica', 'Vigneto', 'Vinha', 'Αμπελώνας', 'Vinice', 'Vinograd', 'Vingård', 'Vinmark', 'Vinmark', 'Viinitarha', 'Viinamägi', 'Vīnogulāji', 'Vynuogynas'),
  winery: t('Working winery', 'Betriebenes Weingut', 'Domaine viticole en activité', 'Bodega en funcionamiento', 'Działająca winnica z winiarnią', 'Cramă în funcțiune', 'Fungujúce vinárstvo', 'Cantina in attività', 'Adega em funcionamento', 'Οινοποιείο σε λειτουργία', 'Fungující vinařství', 'Delujoča vinska klet', 'Vingård i drift', 'Vingård i drift', 'Vingård i drift', 'Toimiva viinitila', 'Tegutsev veinitalu', 'Strādājoša vīna darītava', 'Veikianti vyno darykla'),
  cellar: t('Wine cellar', 'Weinkeller', 'Cave à vin', 'Bodega', 'Piwnica na wino', 'Pivniță de vin', 'Vínna pivnica', 'Cantina', 'Adega', 'Κελάρι κρασιού', 'Vinný sklep', 'Vinska klet', 'Vinkällare', 'Vinkælder', 'Vinkjeller', 'Viinikellari', 'Veinikelder', 'Vīna pagrabs', 'Vyno rūsys'),
  orchard: t('Orchard', 'Obstgarten', 'Verger', 'Huerto frutal', 'Sad', 'Livadă', 'Ovocný sad', 'Frutteto', 'Pomar', 'Οπωρώνας', 'Ovocný sad', 'Sadovnjak', 'Fruktträdgård', 'Frugthave', 'Frukthage', 'Hedelmätarha', 'Viljapuuaed', 'Augļu dārzs', 'Vaismedžių sodas'),
  well: t('Private well', 'Eigener Brunnen', 'Puits privé', 'Pozo propio', 'Własna studnia', 'Fântână proprie', 'Vlastná studňa', 'Pozzo privato', 'Poço próprio', 'Ιδιωτικό πηγάδι', 'Vlastní studna', 'Lasten vodnjak', 'Egen brunn', 'Egen brønd', 'Egen brønn', 'Oma kaivo', 'Oma kaev', 'Sava aka', 'Nuosavas šulinys'),
  outbuildings: t('Outbuildings', 'Nebengebäude', 'Dépendances', 'Anexos', 'Budynki gospodarcze', 'Anexe', 'Hospodárske budovy', 'Annessi', 'Anexos', 'Βοηθητικά κτίσματα', 'Hospodářské budovy', 'Pomožni objekti', 'Uthus', 'Udhuse', 'Uthus', 'Ulkorakennukset', 'Kõrvalhooned', 'Saimniecības ēkas', 'Ūkiniai pastatai'),
  stables: t('Stables', 'Pferdestall', 'Écuries', 'Cuadras', 'Stajnie', 'Grajduri', 'Stajne', 'Scuderie', 'Cavalariças', 'Στάβλοι αλόγων', 'Stáje', 'Konjski hlevi', 'Stall', 'Stalde', 'Stall', 'Talli', 'Tallid', 'Zirgu staļļi', 'Arklidės'),
  guesthouse: t('Guest house', 'Gästehaus', 'Maison d’hôtes', 'Casa de invitados', 'Dom gościnny', 'Casă de oaspeți', 'Dom pre hostí', 'Dépendance per ospiti', 'Casa de hóspedes', 'Ξενώνας', 'Dům pro hosty', 'Hiša za goste', 'Gästhus', 'Gæstehus', 'Gjestehus', 'Vierasmaja', 'Külalistemaja', 'Viesu māja', 'Svečių namas'),
  park: t('Park', 'Park', 'Parc', 'Parque', 'Park', 'Parc', 'Park', 'Parco', 'Parque', 'Πάρκο', 'Park', 'Park', 'Park', 'Park', 'Park', 'Puisto', 'Park', 'Parks', 'Parkas'),
  terrace: t('Terrace', 'Terrasse', 'Terrasse', 'Terraza', 'Taras', 'Terasă', 'Terasa', 'Terrazza', 'Terraço', 'Βεράντα', 'Terasa', 'Terasa', 'Terrass', 'Terrasse', 'Terrasse', 'Terassi', 'Terrass', 'Terase', 'Terasa'),
  'original-beams': t('Original beams', 'Originale Holzbalken', 'Poutres d’origine', 'Vigas originales', 'Oryginalne belki', 'Grinzi originale', 'Pôvodné trámy', 'Travi originali', 'Vigas originais', 'Αυθεντικά δοκάρια', 'Původní trámy', 'Izvirni tramovi', 'Originalbjälkar', 'Originale bjælker', 'Originale bjelker', 'Alkuperäiset palkit', 'Algupärased talad', 'Oriģinālās sijas', 'Originalios sijos'),
  renovated: t('Renovated', 'Renoviert', 'Rénové', 'Reformado', 'Po remoncie', 'Renovat', 'Zrekonštruovaný', 'Ristrutturato', 'Renovado', 'Ανακαινισμένο', 'Po rekonstrukci', 'Prenovljeno', 'Renoverad', 'Renoveret', 'Renovert', 'Remontoitu', 'Renoveeritud', 'Renovēts', 'Renovuotas'),
  parking: t('Parking on the plot', 'Parkplatz auf dem Grundstück', 'Stationnement sur le terrain', 'Aparcamiento en la parcela', 'Parking na działce', 'Parcare pe teren', 'Parkovanie na pozemku', 'Parcheggio nel lotto', 'Estacionamento no terreno', 'Στάθμευση εντός οικοπέδου', 'Parkování na pozemku', 'Parkiranje na parceli', 'Parkering på tomten', 'Parkering på grunden', 'Parkering på tomten', 'Pysäköinti tontilla', 'Parkimine krundil', 'Autostāvvieta zemesgabalā', 'Automobilių stovėjimo vieta sklype'),
  garage: t('Garage', 'Garage', 'Garage', 'Garaje', 'Garaż', 'Garaj', 'Garáž', 'Garage', 'Garagem', 'Γκαράζ', 'Garáž', 'Garaža', 'Garage', 'Garage', 'Garasje', 'Autotalli', 'Garaaž', 'Garāža', 'Garažas'),
  pool: t('Pool', 'Pool', 'Piscine', 'Piscina', 'Basen', 'Piscină', 'Bazén', 'Piscina', 'Piscina', 'Πισίνα', 'Bazén', 'Bazen', 'Pool', 'Pool', 'Basseng', 'Uima-allas', 'Bassein', 'Baseins', 'Baseinas'),
  balcony: t('Balcony', 'Balkon', 'Balcon', 'Balcón', 'Balkon', 'Balcon', 'Balkón', 'Balcone', 'Varanda', 'Μπαλκόνι', 'Balkon', 'Balkon', 'Balkong', 'Altan', 'Balkong', 'Parveke', 'Rõdu', 'Balkons', 'Balkonas'),
  carport: t('Carport', 'Carport', 'Abri pour voiture', 'Cochera', 'Wiata garażowa', 'Copertină auto', 'Prístrešok na auto', 'Posto auto coperto', 'Telheiro para carro', 'Στέγαστρο αυτοκινήτου', 'Přístřešek pro auto', 'Nadstrešek za avto', 'Carport', 'Carport', 'Carport', 'Autokatos', 'Autovarjualune', 'Nojume automašīnai', 'Stoginė automobiliui'),
  'storage-building': t('Storage building', 'Lagergebäude', 'Bâtiment de stockage', 'Almacén', 'Budynek magazynowy', 'Clădire de depozitare', 'Skladová budova', 'Deposito', 'Armazém', 'Αποθήκη', 'Skladovací budova', 'Skladiščni objekt', 'Förrådsbyggnad', 'Lagerbygning', 'Lagerbygning', 'Varastorakennus', 'Laohoone', 'Noliktavas ēka', 'Sandėlis'),
  'barn-hall': t('Barn or hall', 'Scheune oder Halle', 'Grange ou hangar', 'Granero o nave', 'Stodoła lub hala', 'Șură sau hală', 'Stodola alebo hala', 'Fienile o capannone', 'Celeiro ou pavilhão', 'Αχυρώνας ή υπόστεγο', 'Stodola nebo hala', 'Skedenj ali hala', 'Lada eller hall', 'Lade eller hal', 'Låve eller hall', 'Lato tai halli', 'Küün või angaar', 'Šķūnis vai angārs', 'Daržinė arba angaras'),
  'animal-housing': t('Animal housing', 'Tierstall', 'Bâtiment pour animaux', 'Alojamiento para animales', 'Budynek inwentarski', 'Adăpost pentru animale', 'Maštaľ', 'Ricovero per animali', 'Abrigo para animais', 'Χώρος σταβλισμού ζώων', 'Ustájení pro zvířata', 'Prostor za živali', 'Djurstall', 'Dyrestald', 'Dyrehus', 'Eläinsuoja', 'Loomapidamishoone', 'Kūts', 'Tvartas'),
  gazebo: t('Gazebo', 'Gartenpavillon', 'Pavillon de jardin', 'Cenador', 'Altana', 'Foișor', 'Záhradný altánok', 'Gazebo', 'Caramanchão', 'Κιόσκι', 'Altán', 'Senčnica', 'Lusthus', 'Lysthus', 'Lysthus', 'Huvimaja', 'Lehtla', 'Lapene', 'Pavėsinė'),
  'outdoor-oven': t('Outdoor oven', 'Außenofen', 'Four extérieur', 'Horno exterior', 'Piec zewnętrzny', 'Cuptor exterior', 'Vonkajšia pec', 'Forno all’aperto', 'Forno exterior', 'Υπαίθριος φούρνος', 'Venkovní pec', 'Zunanja krušna peč', 'Utomhusugn', 'Udendørs ovn', 'Utendørs ovn', 'Ulkouuni', 'Õueahi', 'Āra krāsns', 'Lauko krosnis'),
};

export const CONDITION_LABELS: Labels = {
  new: t('Like new', 'Neuwertig', 'Comme neuf', 'Como nuevo', 'Jak nowy', 'Ca nou', 'Ako nový', 'Come nuovo', 'Como novo', 'Σαν καινούργιο', 'Jako nový', 'Kot novo', 'Som ny', 'Som ny', 'Som ny', 'Kuin uusi', 'Nagu uus', 'Kā jauns', 'Kaip naujas'),
  renovated: t('Renovated', 'Renoviert', 'Rénové', 'Reformado', 'Po remoncie', 'Renovat', 'Zrekonštruovaný', 'Ristrutturato', 'Renovado', 'Ανακαινισμένο', 'Po rekonstrukci', 'Prenovljeno', 'Renoverad', 'Renoveret', 'Renovert', 'Remontoitu', 'Renoveeritud', 'Renovēts', 'Renovuotas'),
  good: t('Good condition', 'Guter Zustand', 'Bon état', 'Buen estado', 'Dobry stan', 'Stare bună', 'Dobrý stav', 'In buono stato', 'Em bom estado', 'Σε καλή κατάσταση', 'V dobrém stavu', 'V dobrem stanju', 'Gott skick', 'God stand', 'God stand', 'Hyvä kunto', 'Heas seisukorras', 'Labā stāvoklī', 'Geros būklės'),
  'needs-renovation': t('Needs renovation', 'Renovierungsbedürftig', 'À rénover', 'Para reformar', 'Do remontu', 'Necesită renovare', 'Na rekonštrukciu', 'Da ristrutturare', 'Para renovar', 'Χρειάζεται ανακαίνιση', 'K rekonstrukci', 'Potrebno prenove', 'Renoveringsbehov', 'Trænger til renovering', 'Oppussingsbehov', 'Remontin tarpeessa', 'Vajab renoveerimist', 'Nepieciešama renovācija', 'Reikia renovuoti'),
};

export const HEATING_LABELS: Labels = {
  gas: t('Gas heating', 'Gasheizung', 'Chauffage au gaz', 'Calefacción de gas', 'Ogrzewanie gazowe', 'Încălzire pe gaz', 'Plynové kúrenie', 'Riscaldamento a gas', 'Aquecimento a gás', 'Θέρμανση με αέριο', 'Plynové vytápění', 'Plinsko ogrevanje', 'Gasuppvärmning', 'Gasvarme', 'Gassoppvarming', 'Kaasulämmitys', 'Gaasiküte', 'Gāzes apkure', 'Dujinis šildymas'),
  electric: t('Electric heating', 'Elektroheizung', 'Chauffage électrique', 'Calefacción eléctrica', 'Ogrzewanie elektryczne', 'Încălzire electrică', 'Elektrické kúrenie', 'Riscaldamento elettrico', 'Aquecimento elétrico', 'Ηλεκτρική θέρμανση', 'Elektrické vytápění', 'Električno ogrevanje', 'Elvärme', 'Elvarme', 'Elektrisk oppvarming', 'Sähkölämmitys', 'Elektriküte', 'Elektriskā apkure', 'Elektrinis šildymas'),
  wood: t('Wood heating', 'Holzheizung', 'Chauffage au bois', 'Calefacción de leña', 'Ogrzewanie drewnem', 'Încălzire cu lemne', 'Kúrenie drevom', 'Riscaldamento a legna', 'Aquecimento a lenha', 'Θέρμανση με ξύλα', 'Vytápění dřevem', 'Ogrevanje na drva', 'Vedeldning', 'Brændefyring', 'Vedfyring', 'Puulämmitys', 'Puiduküte', 'Malkas apkure', 'Šildymas malkomis'),
  'heat-pump': t('Heat pump', 'Wärmepumpe', 'Pompe à chaleur', 'Bomba de calor', 'Pompa ciepła', 'Pompă de căldură', 'Tepelné čerpadlo', 'Pompa di calore', 'Bomba de calor', 'Αντλία θερμότητας', 'Tepelné čerpadlo', 'Toplotna črpalka', 'Värmepump', 'Varmepumpe', 'Varmepumpe', 'Lämpöpumppu', 'Soojuspump', 'Siltumsūknis', 'Šilumos siurblys'),
};

export const BLOG_CATEGORY_LABELS: Labels = {
  market: t('Market analysis', 'Marktanalyse', 'Analyse du marché', 'Análisis de mercado', 'Analiza rynku', 'Analiză de piață', 'Analýza trhu', 'Analisi di mercato', 'Análise de mercado', 'Ανάλυση αγοράς', 'Analýza trhu', 'Analiza trga', 'Marknadsanalys', 'Markedsanalyse', 'Markedsanalyse', 'Markkina-analyysi', 'Turuanalüüs', 'Tirgus analīze', 'Rinkos analizė'),
  buyers: t('Buyer’s guide', 'Käuferratgeber', 'Guide de l’acheteur', 'Guía del comprador', 'Poradnik kupującego', 'Ghidul cumpărătorului', 'Sprievodca pre kupujúcich', 'Guida per l’acquirente', 'Guia do comprador', 'Οδηγός αγοραστή', 'Průvodce pro kupující', 'Vodnik za kupce', 'Köparguide', 'Købervejledning', 'Kjøperguide', 'Ostajan opas', 'Ostja teejuht', 'Pircēja ceļvedis', 'Pirkėjo gidas'),
  news: t('News', 'Neuigkeiten', 'Actualités', 'Noticias', 'Aktualności', 'Noutăți', 'Novinky', 'Notizie', 'Notícias', 'Νέα', 'Novinky', 'Novice', 'Nyheter', 'Nyheder', 'Nyheter', 'Uutiset', 'Uudised', 'Jaunumi', 'Naujienos'),
  sellers: t('Seller’s guide', 'Verkäuferratgeber', 'Guide du vendeur', 'Guía del vendedor', 'Poradnik sprzedającego', 'Ghidul vânzătorului', 'Sprievodca pre predávajúcich', 'Guida per il venditore', 'Guia do vendedor', 'Οδηγός πωλητή', 'Průvodce pro prodávající', 'Vodnik za prodajalce', 'Säljarguide', 'Sælgervejledning', 'Selgerguide', 'Myyjän opas', 'Müüja teejuht', 'Pārdevēja ceļvedis', 'Pardavėjo gidas'),
  'case-study': t('Case study', 'Fallstudie', 'Étude de cas', 'Caso práctico', 'Studium przypadku', 'Studiu de caz', 'Prípadová štúdia', 'Caso di studio', 'Estudo de caso', 'Μελέτη περίπτωσης', 'Případová studie', 'Študija primera', 'Fallstudie', 'Casestudie', 'Casestudie', 'Tapaustutkimus', 'Juhtumiuuring', 'Gadījuma izpēte', 'Atvejo analizė'),
};

export const WALL_LABELS: Labels = {
  tegla: t('Brick', 'Ziegel', 'Brique', 'Ladrillo', 'Cegła', 'Cărămidă', 'Tehla', 'Mattoni', 'Tijolo', 'Τούβλο', 'Cihla', 'Opeka', 'Tegel', 'Mursten', 'Tegl', 'Tiili', 'Telliskivi', 'Ķieģelis', 'Plytos'),
  valyog: t('Adobe (mud brick)', 'Lehm (Adobe)', 'Adobe (brique crue)', 'Adobe (ladrillo de barro)', 'Glinobitka (cegła suszona)', 'Chirpici (cărămidă nearsă)', 'Nepálená tehla (váľky)', 'Adobe (mattoni crudi)', 'Adobe (tijolo de barro)', 'Πλίνθοι (ωμόπλινθοι)', 'Nepálené cihly', 'Nežgana opeka (blato)', 'Lersten (soltorkat tegel)', 'Lersten (soltørret)', 'Leirstein (soltørket)', 'Savitiili (polttamaton)', 'Savitellis (põletamata)', 'Māla ķieģelis (nededzināts)', 'Molio plytos (nedegtos)'),
  vegyes: t('Mixed', 'Gemischt', 'Mixte', 'Mixto', 'Mieszany', 'Mixt', 'Zmiešaný', 'Misto', 'Misto', 'Μικτό', 'Smíšené', 'Mešano', 'Blandat', 'Blandet', 'Blandet', 'Sekarakenne', 'Segamaterjal', 'Jaukts', 'Mišrios'),
  panel: t('Concrete / panel', 'Beton / Platte', 'Béton / panneaux', 'Hormigón / paneles', 'Beton / wielka płyta', 'Beton / panouri', 'Betón / panel', 'Calcestruzzo / pannelli', 'Betão / painéis', 'Σκυρόδεμα / πάνελ', 'Beton / panel', 'Beton / montažni paneli', 'Betong / element', 'Beton / elementer', 'Betong / element', 'Betoni / elementti', 'Betoon / paneel', 'Betons / paneļi', 'Betonas / plokštės'),
  fa: t('Timber / light frame', 'Holz / Leichtbau', 'Bois / construction légère', 'Madera / construcción ligera', 'Drewno / konstrukcja lekka', 'Lemn / structură ușoară', 'Drevo / ľahká konštrukcia', 'Legno / struttura leggera', 'Madeira / estrutura ligeira', 'Ξύλο / ελαφριά κατασκευή', 'Dřevo / lehká konstrukce', 'Les / lahka konstrukcija', 'Trä / lätt stomme', 'Træ / let konstruktion', 'Tre / lett konstruksjon', 'Puu / kevytrakenne', 'Puit / kergkonstruktsioon', 'Koks / viegla konstrukcija', 'Mediena / lengvos konstrukcijos'),
  ko: t('Stone', 'Stein', 'Pierre', 'Piedra', 'Kamień', 'Piatră', 'Kameň', 'Pietra', 'Pedra', 'Πέτρα', 'Kámen', 'Kamen', 'Sten', 'Sten', 'Stein', 'Kivi', 'Kivi', 'Akmens', 'Akmuo'),
  egyeb: t('Other', 'Sonstiges', 'Autre', 'Otro', 'Inny', 'Altul', 'Iný', 'Altro', 'Outro', 'Άλλο', 'Jiné', 'Drugo', 'Annat', 'Andet', 'Annet', 'Muu', 'Muu', 'Cits', 'Kita'),
  'nem-tudom': t('Unknown', 'Unbekannt', 'Inconnu', 'Desconocido', 'Nieznany', 'Necunoscut', 'Neznámy', 'Sconosciuto', 'Desconhecido', 'Άγνωστο', 'Neznámé', 'Neznano', 'Okänt', 'Ukendt', 'Ukjent', 'Tuntematon', 'Teadmata', 'Nezināms', 'Nežinoma'),
};

/** Category labels live next to their slugs in CATEGORY_FALLBACK (src/i18n/ui.ts). */
export const OVERLAY: Record<string, Labels> = {
  feature: FEATURE_LABELS,
  condition: CONDITION_LABELS,
  heating: HEATING_LABELS,
  blog_category: BLOG_CATEGORY_LABELS,
  wall: WALL_LABELS,
};

/** The checked-in en/de/fr/es/pl/ro/sk label of a term, if there is one. */
export function overlayLabels(group: string, key: string): Partial<Record<Locale, string>> {
  return OVERLAY[group]?.[key] ?? {};
}
