/**
 * Wall material (falazat) — the fallback for the `wall` taxonomy group that
 * migration 0019 seeds. Same keys as the valuation's "Falazat" question
 * (src/data/valuation-questions.ts), so a valuation answer and a listing mean
 * the same thing. Used until 0019 has run, and if the vocabulary can't be read.
 * English, German and French labels: src/data/taxonomy-i18n.ts.
 */
export const WALL_MATERIALS: { key: string; labels: { hu: string; nl: string } }[] = [
  { key: 'tegla', labels: { hu: 'Tégla', nl: 'Baksteen' } },
  { key: 'valyog', labels: { hu: 'Vályog', nl: 'Leem (adobe)' } },
  { key: 'vegyes', labels: { hu: 'Vegyes', nl: 'Gemengd' } },
  { key: 'panel', labels: { hu: 'Beton / panel', nl: 'Beton / paneel' } },
  { key: 'fa', labels: { hu: 'Fa / könnyűszerkezet', nl: 'Hout / lichte bouw' } },
  { key: 'ko', labels: { hu: 'Kő', nl: 'Steen' } },
  { key: 'egyeb', labels: { hu: 'Egyéb', nl: 'Anders' } },
  { key: 'nem-tudom', labels: { hu: 'Nem ismert', nl: 'Onbekend' } },
];
