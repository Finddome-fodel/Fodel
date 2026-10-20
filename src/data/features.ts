/**
 * Property feature vocabulary.
 *
 * Keys are stored in the content files; labels are resolved per locale so the
 * same listing reads correctly in every market. The list is drawn from what
 * FODEL say Dutch and Belgian buyers actually look for (FAQ Q19 and Q21):
 * hillside views, forest edge, waterfront, land for livestock, parking.
 */

import type { Locale } from '~/i18n/ui';
import { FEATURE_LABELS } from '~/data/taxonomy-i18n';

/** Hungarian and Dutch, the languages the vocabulary was written in. English, German and French: taxonomy-i18n.ts. */
export const FEATURES: Record<string, { hu: string; nl: string }> = {
  'panoramic-view': { hu: 'Panorámás kilátás', nl: 'Panoramisch uitzicht' },
  waterfront: { hu: 'Közvetlen vízpart', nl: 'Direct aan het water' },
  'private-jetty': { hu: 'Saját stég', nl: 'Eigen steiger' },
  boathouse: { hu: 'Csónakház', nl: 'Botenhuis' },
  hillside: { hu: 'Dombtetőn', nl: 'Op een heuvel' },
  'forest-adjacent': { hu: 'Erdő közelében', nl: 'Nabij het bos' },
  vineyard: { hu: 'Szőlőskert', nl: 'Wijngaard' },
  winery: { hu: 'Működő pincészet', nl: 'Werkend wijngoed' },
  cellar: { hu: 'Borospince', nl: 'Wijnkelder' },
  orchard: { hu: 'Gyümölcsös', nl: 'Boomgaard' },
  well: { hu: 'Saját kút', nl: 'Eigen put' },
  outbuildings: { hu: 'Gazdasági épületek', nl: 'Bijgebouwen' },
  stables: { hu: 'Lovarda, istálló', nl: 'Paardenstal' },
  guesthouse: { hu: 'Vendégház', nl: 'Gastenverblijf' },
  park: { hu: 'Park', nl: 'Park' },
  terrace: { hu: 'Terasz', nl: 'Terras' },
  'original-beams': { hu: 'Eredeti gerendázat', nl: 'Oorspronkelijke balken' },
  renovated: { hu: 'Felújított', nl: 'Gerenoveerd' },
  parking: { hu: 'Parkolás a telken', nl: 'Parkeren op eigen terrein' },
  garage: { hu: 'Garázs', nl: 'Garage' },
  pool: { hu: 'Medence', nl: 'Zwembad' },
  balcony: { hu: 'Erkély', nl: 'Balkon' },
  carport: { hu: 'Fedett beálló', nl: 'Carport' },
  'storage-building': { hu: 'Tárolóépület', nl: 'Opslaggebouw' },
  'barn-hall': { hu: 'Csarnok', nl: 'Schuur of hal' },
  'animal-housing': { hu: 'Állattartásra alkalmas épület', nl: 'Dierenverblijf' },
  gazebo: { hu: 'Szaletli', nl: 'Prieel' },
  'outdoor-oven': { hu: 'Kerti sütőde / kemence', nl: 'Buitenoven' },
};

export function featureLabel(key: string, locale: Locale): string {
  const base = FEATURES[key];
  if (!base) return key;
  return locale === 'hu' || locale === 'nl' ? base[locale] : FEATURE_LABELS[key]?.[locale] ?? base.nl;
}

/** Hungarian counties FODEL actively market, for region landing pages. */
export const COUNTIES = [
  'Baranya',
  'Tolna',
  'Zala',
  'Somogy',
  'Veszprém',
  'Bács-Kiskun',
  'Pest',
] as const;
