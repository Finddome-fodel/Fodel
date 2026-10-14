/**
 * Wall material (falazat) — the fallback for the `wall` taxonomy group that
 * migration 0019 seeds. Same keys as the valuation's "Falazat" question
 * (src/data/valuation-questions.ts), so a valuation answer and a listing mean
 * the same thing. Used until 0019 has run, and if the vocabulary can't be read.
 */
export const WALL_MATERIALS: { key: string; labels: { hu: string; nl: string; en: string; de: string } }[] = [
  { key: 'tegla', labels: { hu: 'Tégla', nl: 'Baksteen', en: 'Brick', de: 'Ziegel' } },
  { key: 'valyog', labels: { hu: 'Vályog', nl: 'Leem (adobe)', en: 'Adobe (mud brick)', de: 'Lehm (Adobe)' } },
  { key: 'vegyes', labels: { hu: 'Vegyes', nl: 'Gemengd', en: 'Mixed', de: 'Gemischt' } },
  { key: 'panel', labels: { hu: 'Beton / panel', nl: 'Beton / paneel', en: 'Concrete / panel', de: 'Beton / Platte' } },
  { key: 'fa', labels: { hu: 'Fa / könnyűszerkezet', nl: 'Hout / lichte bouw', en: 'Timber / light frame', de: 'Holz / Leichtbau' } },
  { key: 'ko', labels: { hu: 'Kő', nl: 'Steen', en: 'Stone', de: 'Stein' } },
  { key: 'egyeb', labels: { hu: 'Egyéb', nl: 'Anders', en: 'Other', de: 'Sonstiges' } },
  { key: 'nem-tudom', labels: { hu: 'Nem ismert', nl: 'Onbekend', en: 'Unknown', de: 'Unbekannt' } },
];
