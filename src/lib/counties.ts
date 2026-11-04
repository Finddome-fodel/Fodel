/**
 * Counties (and their equivalents abroad) — one canonical spelling per area.
 *
 * The canonical list is src/data/listing/regions.json (GeoNames), read through
 * regionsFor(). Everything that writes or compares a county goes through
 * canonicalCounty(): the listing form, the settlement and map autofill, the
 * server check, the public search filter and migration 0046. That is what
 * keeps "Pest", "Pest vármegye" and "pest" from becoming three counties.
 *
 * Pure and dependency-free apart from the JSON, so the browser bundle can
 * import it as well.
 */
import { regionsFor } from '~/config/countries';

/** Case- and diacritic-insensitive comparison key. */
export function countyKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s\u00a0]+/g, ' ')
    .trim();
}

const SUFFIX = /[\s,]+(vármegye|varmegye|megye|county|főváros|fovaros)\.?$/i;

/** Old official names and common variants that are not in GeoNames. Keys are countyKey()s. */
const LEGACY: Record<string, Record<string, string>> = {
  HU: {
    csongrad: 'Csongrád-Csanád',
    'csongrad-csanad': 'Csongrád-Csanád',
    'budapest fovaros': 'Budapest',
    'fovaros': 'Budapest',
    'gyor-moson': 'Győr-Moson-Sopron',
    'szabolcs-szatmar': 'Szabolcs-Szatmár-Bereg',
    'jasz-nagykun': 'Jász-Nagykun-Szolnok',
    'borsod': 'Borsod-Abaúj-Zemplén',
    'komarom': 'Komárom-Esztergom',
    'bacs': 'Bács-Kiskun',
  },
};

/**
 * The canonical county name for `raw` in `country`, or null when the country
 * has a list and nothing on it matches. For a country without a list the
 * trimmed input is returned unchanged ('' stays '').
 */
export function canonicalCounty(country: string, raw: string | null | undefined): string | null {
  const value = String(raw ?? '').replace(/[\s\u00a0]+/g, ' ').trim();
  const list = regionsFor(country);
  if (!list.length) return value;
  if (!value) return null;
  const stripped = value.replace(SUFFIX, '').trim();
  const key = countyKey(stripped);
  const exact = list.find((r) => countyKey(r.name) === key);
  if (exact) return exact.name;
  const legacy = LEGACY[country]?.[key];
  if (legacy) return legacy;
  // "Budapest XIII. kerület", "Budapest, II. ker." — every district is Budapest.
  if (country === 'HU' && /^budapest\b/.test(key)) return 'Budapest';
  return null;
}

/** True when the country has a fixed list (the form shows a select). */
export const hasCountyList = (country: string): boolean => regionsFor(country).length > 0;

/**
 * The select options for a country: Budapest first for Hungary (the most
 * common choice by far), then alphabetical in the reader's language.
 */
export function countyOptions(country: string, locale = 'hu'): string[] {
  const names = regionsFor(country).map((r) => r.name);
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  const sorted = [...names].sort((a, b) => collator.compare(a, b));
  if (country === 'HU' && sorted.includes('Budapest')) return ['Budapest', ...sorted.filter((n) => n !== 'Budapest')];
  return sorted;
}

export type CountyFacet = { name: string; count: number };

/**
 * Every canonical county of `country` with the number of listings in it, for
 * the public search filter. Listing values are normalised first, so legacy
 * spellings still count. Values that match nothing are dropped.
 */
export function countyFacet(country: string, counties: (string | null | undefined)[], locale = 'hu'): CountyFacet[] {
  const counts = new Map<string, number>();
  for (const raw of counties) {
    const name = canonicalCounty(country, raw);
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  if (!hasCountyList(country)) {
    const collator = new Intl.Collator(locale, { sensitivity: 'base' });
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => collator.compare(a.name, b.name));
  }
  return countyOptions(country, locale).map((name) => ({ name, count: counts.get(name) ?? 0 }));
}
