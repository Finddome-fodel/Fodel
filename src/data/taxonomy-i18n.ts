/**
 * English, German, French, Spanish, Polish, Romanian and Slovak labels for the
 * property vocabulary.
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

type Triple = Record<'en' | 'de' | 'fr' | 'es' | 'pl' | 'ro' | 'sk', string>;
type Labels = Record<string, Triple>;

const t = (en: string, de: string, fr: string, es: string, pl: string, ro: string, sk: string): Triple => ({
  en,
  de,
  fr,
  es,
  pl,
  ro,
  sk,
});

export const FEATURE_LABELS: Labels = {
  'panoramic-view': t('Panoramic view', 'Panoramablick', 'Vue panoramique', 'Vistas panorámicas', 'Widok panoramiczny', 'Priveliște panoramică', 'Panoramatický výhľad'),
  waterfront: t('Waterfront', 'Direkt am Wasser', 'Au bord de l’eau', 'Junto al agua', 'Nad samą wodą', 'La malul apei', 'Priamo pri vode'),
  'private-jetty': t('Private jetty', 'Eigener Steg', 'Ponton privé', 'Embarcadero privado', 'Prywatny pomost', 'Ponton privat', 'Súkromné mólo'),
  boathouse: t('Boathouse', 'Bootshaus', 'Abri à bateaux', 'Cobertizo para barcos', 'Hangar na łodzie', 'Adăpost pentru bărci', 'Lodenica'),
  hillside: t('On a hilltop', 'Auf einem Hügel', 'Sur une colline', 'En lo alto de una colina', 'Na wzgórzu', 'Pe un deal', 'Na kopci'),
  'forest-adjacent': t('Near the forest', 'In Waldnähe', 'Près de la forêt', 'Cerca del bosque', 'W pobliżu lasu', 'Aproape de pădure', 'Pri lese'),
  vineyard: t('Vineyard', 'Weinberg', 'Vignoble', 'Viñedo', 'Winnica', 'Viță-de-vie', 'Vinica'),
  winery: t('Working winery', 'Betriebenes Weingut', 'Domaine viticole en activité', 'Bodega en funcionamiento', 'Działająca winnica z winiarnią', 'Cramă în funcțiune', 'Fungujúce vinárstvo'),
  cellar: t('Wine cellar', 'Weinkeller', 'Cave à vin', 'Bodega', 'Piwnica na wino', 'Pivniță de vin', 'Vínna pivnica'),
  orchard: t('Orchard', 'Obstgarten', 'Verger', 'Huerto frutal', 'Sad', 'Livadă', 'Ovocný sad'),
  well: t('Private well', 'Eigener Brunnen', 'Puits privé', 'Pozo propio', 'Własna studnia', 'Fântână proprie', 'Vlastná studňa'),
  outbuildings: t('Outbuildings', 'Nebengebäude', 'Dépendances', 'Anexos', 'Budynki gospodarcze', 'Anexe', 'Hospodárske budovy'),
  stables: t('Stables', 'Pferdestall', 'Écuries', 'Cuadras', 'Stajnie', 'Grajduri', 'Stajne'),
  guesthouse: t('Guest house', 'Gästehaus', 'Maison d’hôtes', 'Casa de invitados', 'Dom gościnny', 'Casă de oaspeți', 'Dom pre hostí'),
  park: t('Park', 'Park', 'Parc', 'Parque', 'Park', 'Parc', 'Park'),
  terrace: t('Terrace', 'Terrasse', 'Terrasse', 'Terraza', 'Taras', 'Terasă', 'Terasa'),
  'original-beams': t('Original beams', 'Originale Holzbalken', 'Poutres d’origine', 'Vigas originales', 'Oryginalne belki', 'Grinzi originale', 'Pôvodné trámy'),
  renovated: t('Renovated', 'Renoviert', 'Rénové', 'Reformado', 'Po remoncie', 'Renovat', 'Zrekonštruovaný'),
  parking: t('Parking on the plot', 'Parkplatz auf dem Grundstück', 'Stationnement sur le terrain', 'Aparcamiento en la parcela', 'Parking na działce', 'Parcare pe teren', 'Parkovanie na pozemku'),
  garage: t('Garage', 'Garage', 'Garage', 'Garaje', 'Garaż', 'Garaj', 'Garáž'),
  pool: t('Pool', 'Pool', 'Piscine', 'Piscina', 'Basen', 'Piscină', 'Bazén'),
  balcony: t('Balcony', 'Balkon', 'Balcon', 'Balcón', 'Balkon', 'Balcon', 'Balkón'),
  carport: t('Carport', 'Carport', 'Abri pour voiture', 'Cochera', 'Wiata garażowa', 'Copertină auto', 'Prístrešok na auto'),
  'storage-building': t('Storage building', 'Lagergebäude', 'Bâtiment de stockage', 'Almacén', 'Budynek magazynowy', 'Clădire de depozitare', 'Skladová budova'),
  'barn-hall': t('Barn or hall', 'Scheune oder Halle', 'Grange ou hangar', 'Granero o nave', 'Stodoła lub hala', 'Șură sau hală', 'Stodola alebo hala'),
  'animal-housing': t('Animal housing', 'Tierstall', 'Bâtiment pour animaux', 'Alojamiento para animales', 'Budynek inwentarski', 'Adăpost pentru animale', 'Maštaľ'),
  gazebo: t('Gazebo', 'Gartenpavillon', 'Pavillon de jardin', 'Cenador', 'Altana', 'Foișor', 'Záhradný altánok'),
  'outdoor-oven': t('Outdoor oven', 'Außenofen', 'Four extérieur', 'Horno exterior', 'Piec zewnętrzny', 'Cuptor exterior', 'Vonkajšia pec'),
};

export const CONDITION_LABELS: Labels = {
  new: t('Like new', 'Neuwertig', 'Comme neuf', 'Como nuevo', 'Jak nowy', 'Ca nou', 'Ako nový'),
  renovated: t('Renovated', 'Renoviert', 'Rénové', 'Reformado', 'Po remoncie', 'Renovat', 'Zrekonštruovaný'),
  good: t('Good condition', 'Guter Zustand', 'Bon état', 'Buen estado', 'Dobry stan', 'Stare bună', 'Dobrý stav'),
  'needs-renovation': t('Needs renovation', 'Renovierungsbedürftig', 'À rénover', 'Para reformar', 'Do remontu', 'Necesită renovare', 'Na rekonštrukciu'),
};

export const HEATING_LABELS: Labels = {
  gas: t('Gas heating', 'Gasheizung', 'Chauffage au gaz', 'Calefacción de gas', 'Ogrzewanie gazowe', 'Încălzire pe gaz', 'Plynové kúrenie'),
  electric: t('Electric heating', 'Elektroheizung', 'Chauffage électrique', 'Calefacción eléctrica', 'Ogrzewanie elektryczne', 'Încălzire electrică', 'Elektrické kúrenie'),
  wood: t('Wood heating', 'Holzheizung', 'Chauffage au bois', 'Calefacción de leña', 'Ogrzewanie drewnem', 'Încălzire cu lemne', 'Kúrenie drevom'),
  'heat-pump': t('Heat pump', 'Wärmepumpe', 'Pompe à chaleur', 'Bomba de calor', 'Pompa ciepła', 'Pompă de căldură', 'Tepelné čerpadlo'),
};

export const BLOG_CATEGORY_LABELS: Labels = {
  market: t('Market analysis', 'Marktanalyse', 'Analyse du marché', 'Análisis de mercado', 'Analiza rynku', 'Analiză de piață', 'Analýza trhu'),
  buyers: t('Buyer’s guide', 'Käuferratgeber', 'Guide de l’acheteur', 'Guía del comprador', 'Poradnik kupującego', 'Ghidul cumpărătorului', 'Sprievodca pre kupujúcich'),
  news: t('News', 'Neuigkeiten', 'Actualités', 'Noticias', 'Aktualności', 'Noutăți', 'Novinky'),
  'case-study': t('Case study', 'Fallstudie', 'Étude de cas', 'Caso práctico', 'Studium przypadku', 'Studiu de caz', 'Prípadová štúdia'),
};

export const WALL_LABELS: Labels = {
  tegla: t('Brick', 'Ziegel', 'Brique', 'Ladrillo', 'Cegła', 'Cărămidă', 'Tehla'),
  valyog: t('Adobe (mud brick)', 'Lehm (Adobe)', 'Adobe (brique crue)', 'Adobe (ladrillo de barro)', 'Glinobitka (cegła suszona)', 'Chirpici (cărămidă nearsă)', 'Nepálená tehla (váľky)'),
  vegyes: t('Mixed', 'Gemischt', 'Mixte', 'Mixto', 'Mieszany', 'Mixt', 'Zmiešaný'),
  panel: t('Concrete / panel', 'Beton / Platte', 'Béton / panneaux', 'Hormigón / paneles', 'Beton / wielka płyta', 'Beton / panouri', 'Betón / panel'),
  fa: t('Timber / light frame', 'Holz / Leichtbau', 'Bois / construction légère', 'Madera / construcción ligera', 'Drewno / konstrukcja lekka', 'Lemn / structură ușoară', 'Drevo / ľahká konštrukcia'),
  ko: t('Stone', 'Stein', 'Pierre', 'Piedra', 'Kamień', 'Piatră', 'Kameň'),
  egyeb: t('Other', 'Sonstiges', 'Autre', 'Otro', 'Inny', 'Altul', 'Iný'),
  'nem-tudom': t('Unknown', 'Unbekannt', 'Inconnu', 'Desconocido', 'Nieznany', 'Necunoscut', 'Neznámy'),
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
