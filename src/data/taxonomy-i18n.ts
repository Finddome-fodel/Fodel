/**
 * English, German and French labels for the property vocabulary.
 *
 * The taxonomy lives in the database (taxonomy_terms) with Hungarian and Dutch
 * labels, and admins can edit every language in Beállítások → Kategóriák.
 * This file is the checked-in fallback for the three newer languages: it fills
 * in whatever a term has no label for, so the site reads correctly before
 * migration 0020 has run and for any term an admin adds later without
 * translating it. A label an admin typed always wins.
 *
 * Counties, regions and settlements are place names and keep their Hungarian
 * spelling in every language ("Zala"); the filter label next to them says
 * "County", "Komitat" or "Comitat".
 *
 * Keep supabase/migrations/0020_translations.sql in step with this file.
 */

import type { Locale } from '~/i18n/ui';

type Triple = Record<'en' | 'de' | 'fr', string>;
type Labels = Record<string, Triple>;

const t = (en: string, de: string, fr: string): Triple => ({ en, de, fr });

export const FEATURE_LABELS: Labels = {
  'panoramic-view': t('Panoramic view', 'Panoramablick', 'Vue panoramique'),
  waterfront: t('Waterfront', 'Direkt am Wasser', 'Au bord de l’eau'),
  'private-jetty': t('Private jetty', 'Eigener Steg', 'Ponton privé'),
  boathouse: t('Boathouse', 'Bootshaus', 'Abri à bateaux'),
  hillside: t('On a hilltop', 'Auf einem Hügel', 'Sur une colline'),
  'forest-adjacent': t('Near the forest', 'In Waldnähe', 'Près de la forêt'),
  vineyard: t('Vineyard', 'Weinberg', 'Vignoble'),
  winery: t('Working winery', 'Betriebenes Weingut', 'Domaine viticole en activité'),
  cellar: t('Wine cellar', 'Weinkeller', 'Cave à vin'),
  orchard: t('Orchard', 'Obstgarten', 'Verger'),
  well: t('Private well', 'Eigener Brunnen', 'Puits privé'),
  outbuildings: t('Outbuildings', 'Nebengebäude', 'Dépendances'),
  stables: t('Stables', 'Pferdestall', 'Écuries'),
  guesthouse: t('Guest house', 'Gästehaus', 'Maison d’hôtes'),
  park: t('Park', 'Park', 'Parc'),
  terrace: t('Terrace', 'Terrasse', 'Terrasse'),
  'original-beams': t('Original beams', 'Originale Holzbalken', 'Poutres d’origine'),
  renovated: t('Renovated', 'Renoviert', 'Rénové'),
  parking: t('Parking on the plot', 'Parkplatz auf dem Grundstück', 'Stationnement sur le terrain'),
  garage: t('Garage', 'Garage', 'Garage'),
  pool: t('Pool', 'Pool', 'Piscine'),
  balcony: t('Balcony', 'Balkon', 'Balcon'),
  carport: t('Carport', 'Carport', 'Abri pour voiture'),
  'storage-building': t('Storage building', 'Lagergebäude', 'Bâtiment de stockage'),
  'barn-hall': t('Barn or hall', 'Scheune oder Halle', 'Grange ou hangar'),
  'animal-housing': t('Animal housing', 'Tierstall', 'Bâtiment pour animaux'),
  gazebo: t('Gazebo', 'Gartenpavillon', 'Pavillon de jardin'),
  'outdoor-oven': t('Outdoor oven', 'Außenofen', 'Four extérieur'),
};

export const CONDITION_LABELS: Labels = {
  new: t('Like new', 'Neuwertig', 'Comme neuf'),
  renovated: t('Renovated', 'Renoviert', 'Rénové'),
  good: t('Good condition', 'Guter Zustand', 'Bon état'),
  'needs-renovation': t('Needs renovation', 'Renovierungsbedürftig', 'À rénover'),
};

export const HEATING_LABELS: Labels = {
  gas: t('Gas heating', 'Gasheizung', 'Chauffage au gaz'),
  electric: t('Electric heating', 'Elektroheizung', 'Chauffage électrique'),
  wood: t('Wood heating', 'Holzheizung', 'Chauffage au bois'),
  'heat-pump': t('Heat pump', 'Wärmepumpe', 'Pompe à chaleur'),
};

export const BLOG_CATEGORY_LABELS: Labels = {
  market: t('Market analysis', 'Marktanalyse', 'Analyse du marché'),
  buyers: t('Buyer’s guide', 'Käuferratgeber', 'Guide de l’acheteur'),
  news: t('News', 'Neuigkeiten', 'Actualités'),
  'case-study': t('Case study', 'Fallstudie', 'Étude de cas'),
};

export const WALL_LABELS: Labels = {
  tegla: t('Brick', 'Ziegel', 'Brique'),
  valyog: t('Adobe (mud brick)', 'Lehm (Adobe)', 'Adobe (brique crue)'),
  vegyes: t('Mixed', 'Gemischt', 'Mixte'),
  panel: t('Concrete / panel', 'Beton / Platte', 'Béton / panneaux'),
  fa: t('Timber / light frame', 'Holz / Leichtbau', 'Bois / construction légère'),
  ko: t('Stone', 'Stein', 'Pierre'),
  egyeb: t('Other', 'Sonstiges', 'Autre'),
  'nem-tudom': t('Unknown', 'Unbekannt', 'Inconnu'),
};

/** Category labels live next to their slugs in CATEGORY_FALLBACK (src/i18n/ui.ts). */
export const OVERLAY: Record<string, Labels> = {
  feature: FEATURE_LABELS,
  condition: CONDITION_LABELS,
  heating: HEATING_LABELS,
  blog_category: BLOG_CATEGORY_LABELS,
  wall: WALL_LABELS,
};

/** The checked-in en/de/fr label of a term, if there is one. */
export function overlayLabels(group: string, key: string): Partial<Record<Locale, string>> {
  return OVERLAY[group]?.[key] ?? {};
}
