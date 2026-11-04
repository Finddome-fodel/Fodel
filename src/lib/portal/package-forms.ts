/**
 * Reading the Csomagok tabs' forms into site_settings.services patches. Each tab writes only its own keys:
 * the price matrix never touches a package name, the extras never a package price, the rounding step nothing else.
 *
 * Money is read with readMoney() (never Number(): „1.500” is not 1.5), prices are integer cents, and a value that
 * cannot be saved is refused with a Hungarian message by throwing PackageSaveError, so nothing is written.
 */
import { listingCatalog, storedExtras, PRICE_MAX, type ListingCatalog, type StoredServices } from '~/lib/listing-packages';
import { validateTiers, TIER_BOUND_MAX, type PriceTier } from '~/lib/price-tiers';
import { readMoney, readMoneyAll } from '~/lib/portal/num';
import { PackageSaveError, type ServicesPatch } from '~/lib/portal/package-admin';
import { PRICE_ROUNDING_STEPS } from '~/lib/exchange-rates';
import { LOCALES } from '~/i18n/ui';
import { TRANSLATION_PACKAGES } from '~/config/company';
import { ALL_LOCALES } from '~/lib/ai/translate-core';
import { MANDATORY_LOCALES, packageLocales, translationPricing, TRANSLATION_PACKAGE_IDS } from '~/lib/translation-packages';
import { PACKAGE_KEYS, PRICE_CENTS_MAX, readPricing, validatePricing, type ListingPricing, type PackageKey } from '~/lib/listing-pricing';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const checked = (form: FormData, key: string) => form.get(key) === 'yes' || form.get(key) === 'on';

/** What the admin sees as the name of a package: always Hungarian. */
const packageName = (pricing: ListingPricing, key: PackageKey) => pricing.packages[key].names.hu;

/**
 * Hirdetési csomagok (árak): the bounds of the value bands, the durations and every price of the matrix.
 * Rows (value bands) and columns (durations) arrive in order; cell `cell_<package>_<row>_<col>` is a MoneyInput in cents.
 * What does not live on this form (names, content, languages, which package is recommended) stays as stored.
 */
export function pricingPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const stored = readPricing(current.listingPricing);
  const bounds = readMoneyAll(form, 'bound', { min: 1, max: TIER_BOUND_MAX });
  const durations = form.getAll('duration').map((value) => Number(String(value).trim()));
  if (durations.length === 0 || durations.some((d) => !Number.isInteger(d))) throw new PackageSaveError('Az időtartamokat egész hónapban adja meg.');
  const rowCount = Math.max(bounds.length + 1, 1);
  const valueTiers = Array.from({ length: rowCount }, (_, row) => {
    if (row === rowCount - 1) return { upToHuf: null };
    const bound = bounds[row];
    if (!bound || !bound.ok || bound.value === null) throw new PackageSaveError(`${row + 1}. ingatlanérték-sáv: ${bound && !bound.ok ? bound.message : 'adja meg a felső határt forintban.'}`);
    return { upToHuf: bound.value };
  });
  const prices: ListingPricing['prices'] = {} as ListingPricing['prices'];
  for (const key of PACKAGE_KEYS) {
    prices[key] = {};
    for (let row = 0; row < rowCount; row++) {
      prices[key][row] = {};
      durations.forEach((months, col) => {
        const name = `cell_${key}_${row}_${col}`;
        const cell = readMoney(form, name, { cents: true, min: 1, max: PRICE_CENTS_MAX });
        // A disabled package may have empty cells; validatePricing decides whether that is allowed.
        if (cell.ok && cell.value !== null) prices[key][row][months] = cell.value;
        else if (!cell.ok && stored.packages[key].enabled) {
          throw new PackageSaveError(`${packageName(stored, key)}, ${months} hónap, ${row + 1}. sáv: ${cell.message}`);
        }
      });
    }
  }
  const checkedPricing = validatePricing({ ...stored, valueTiers, durations, prices });
  if (!checkedPricing.ok) throw new PackageSaveError(checkedPricing.message);
  return { listingPricing: checkedPricing.pricing };
}

const VIDEO_VALUES = ['included', 'none'] as const;

/**
 * Csomagok tartalma: per package the names, whether it is on sale, which one is recommended, the content
 * (images, phone, editing, video) and the languages. Languages are rules until an admin picks a list: a list equal
 * to the package's rule is stored as no list at all, so a language added to the site later still joins by itself.
 */
export function contentPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const stored = readPricing(current.listingPricing);
  const next = structuredClone(stored);
  const recommended = text(form, 'recommended');
  if (!(PACKAGE_KEYS as readonly string[]).includes(recommended)) throw new PackageSaveError('Jelölje meg, melyik csomag az ajánlott.');
  for (const key of PACKAGE_KEYS) {
    const k = (field: string) => `${key}_${field}`;
    const hu = text(form, k('name_hu')).slice(0, 40);
    const en = text(form, k('name_en')).slice(0, 40);
    if (!hu || !en) throw new PackageSaveError('Minden csomagnak legyen magyar és angol neve.');
    const imagesRaw = text(form, k('images'));
    const unlimited = checked(form, k('unlimited'));
    const images = unlimited ? null : Number(imagesRaw);
    if (!unlimited && !(Number.isInteger(images) && (images as number) >= 1 && (images as number) <= 200)) throw new PackageSaveError(`${hu}: a képek száma 1 és 200 közötti egész szám legyen.`);
    const video = text(form, k('video'));
    if (!(VIDEO_VALUES as readonly string[]).includes(video)) throw new PackageSaveError(`${hu}: válasszon a videó lehetőségei közül.`);
    next.packages[key] = {
      names: { hu, en },
      features: { maxImages: images, phone: checked(form, k('phone')), editedImages: checked(form, k('edited_images')), editedText: checked(form, k('edited_text')), video: video as 'included' | 'none' },
      recommended: key === recommended,
      enabled: checked(form, k('enabled')),
    };
  }
  if (PACKAGE_KEYS.every((key) => !next.packages[key].enabled)) throw new PackageSaveError('Legalább egy csomagnak bekapcsolva kell maradnia.');
  if (!next.packages[recommended as PackageKey].enabled) throw new PackageSaveError('Az ajánlott csomag nem lehet kikapcsolva.');
  // Every enabled package needs a price in every cell, or it could be switched on with nothing to sell.
  const checkedPricing = validatePricing(next);
  if (!checkedPricing.ok) throw new PackageSaveError(checkedPricing.message);

  const translation = translationPricing(current.translationPackages, TRANSLATION_PACKAGES, LOCALES);
  const packages = translation.packages.map((pkg) => {
    const { rule: _rule, ...rest } = pkg;
    if (!form.has(`lang_${pkg.id}__present`)) return rest;
    const picked = new Set(form.getAll(`lang_${pkg.id}`).map(String).filter((code) => (ALL_LOCALES as readonly string[]).includes(code)));
    for (const code of MANDATORY_LOCALES) picked.add(code);
    const byRule = new Set(packageLocales({ ...pkg, locales: undefined }, ALL_LOCALES));
    const same = picked.size === byRule.size && [...picked].every((code) => byRule.has(code));
    const { locales: _old, ...withoutList } = rest;
    return same ? withoutList : { ...withoutList, locales: ALL_LOCALES.filter((code) => picked.has(code)) };
  });
  const storedTranslation = (current.translationPackages && typeof current.translationPackages === 'object' ? current.translationPackages : {}) as Record<string, unknown>;
  return { listingPricing: checkedPricing.pricing, translationPackages: { ...storedTranslation, packages } };
}

/** Egyedi nyelvek: the switch for the old per-language sale and its two prices (cents). Off by default. */
export function singlesPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const stored = readPricing(current.listingPricing);
  const european = readMoney(form, 'european', { cents: true, min: 0, max: PRICE_CENTS_MAX });
  const world = readMoney(form, 'world', { cents: true, min: 0, max: PRICE_CENTS_MAX });
  if (!european.ok) throw new PackageSaveError(`Európai nyelv: ${european.message}`);
  if (!world.ok) throw new PackageSaveError(`Világnyelv: ${world.message}`);
  const singleLanguages = {
    enabled: checked(form, 'enabled'),
    europeanCents: european.value ?? stored.singleLanguages.europeanCents,
    worldOnlyCents: world.value ?? stored.singleLanguages.worldOnlyCents,
  };
  const storedTranslation = (current.translationPackages && typeof current.translationPackages === 'object' ? current.translationPackages : {}) as Record<string, unknown>;
  // The old readers (the legacy order lines) still read euros from translationPackages.singleEur.
  return {
    listingPricing: { ...stored, singleLanguages },
    translationPackages: { ...storedTranslation, singleEur: { european: singleLanguages.europeanCents / 100, world: singleLanguages.worldOnlyCents / 100 } },
  };
}

/**
 * What `listingExtras` is saved as: the derived prices of every extra, except the single-language one. Its price
 * lives in `translationPackages` (Egyedi nyelvek), so the derived value must never be written here as if it were
 * the admin's: the stored value stays exactly as it was, for the old orders that read it.
 */
function extrasStored(next: ListingCatalog, current: Record<string, unknown>): Record<string, { priceEur: number; tiers: PriceTier[] }> {
  const { translation: _derived, ...rest } = storedExtras(next);
  const kept = (current.listingExtras as Record<string, any> | undefined)?.translation;
  return kept === undefined ? rest : { ...rest, translation: kept };
}

/**
 * Kiegészítők: the price of every extra that has a single price. An extra
 * with tiers is edited on Ársávok (its card links there) and a retired one
 * is not editable; both stay as stored. The single-language price is not
 * edited here at all (`extrasStored`).
 */
export function extrasPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const catalog = listingCatalog(current as StoredServices);
  const extras = catalog.extras.map((extra) => {
    if (extra.retired || extra.id === 'translation' || extra.tiers.length > 1 || !form.has(`extra_${extra.id}`)) return extra;
    const price = readMoney(form, `extra_${extra.id}`, { min: 0, max: PRICE_MAX, required: true });
    if (!price.ok) throw new PackageSaveError(`${extraName(extra.id)}: ${price.message}`);
    return { ...extra, tiers: [{ upToHuf: null, priceEur: price.value! }], priceEur: price.value! };
  });
  return { listingExtras: extrasStored(listingCatalog({ ...current, listingExtras: storedExtras({ ...catalog, extras }) } as StoredServices), current) };
}

/** Hungarian names of the extras, for the admin. */
export const EXTRA_ADMIN: Record<string, { label: string; unit: string; note?: string }> = {
  translation: { label: 'Fordítás', unit: '€ / nyelv' },
  'category-highlight': { label: 'Kiemelés a kategóriában', unit: '€ / hó', note: 'Legalább 3 hónapra, legfeljebb a csomag időtartamáig; 1 hónapos csomaghoz nem rendelhető.' },
  'homepage-highlight': { label: 'Kiemelés a főoldalon', unit: '€ / hó', note: 'Már nem rendelhető. A főoldali ajánlót a szerkesztőség választja.' },
  video: { label: 'Ingatlanvideó drónnal, profi vágással', unit: '€ egyszeri', note: 'Csak magyarországi ingatlanhoz. A hirdető saját videójának linkje díjmentes.' },
  'retro-images': { label: 'Utólagos képfeltöltés', unit: '€ egyszeri', note: 'Már nem fizetős tétel.' },
  'renewal-6m': { label: 'Hosszabbítás 6 hónappal', unit: '€ egyszeri', note: 'A lejárati levelekben is ez szerepel.' },
};
export const extraName = (id: string) => EXTRA_ADMIN[id]?.label ?? id;

/** The form key of one priced item on the Ársávok tab. */
export const tierKey = (kind: 'pkg' | 'extra', id: string) => `tier_${kind}_${id}`;

/** One item's posted rows → tiers, or the Hungarian error naming the row. */
export function readTierRows(form: FormData, key: string, label: string): PriceTier[] {
  const prices = readMoneyAll(form, `${key}_price`, { min: 0, max: PRICE_MAX });
  const bounds = readMoneyAll(form, `${key}_bound`, { min: 1, max: TIER_BOUND_MAX });
  const rows = prices.map((price, index) => {
    if (!price.ok || price.value === null) throw new PackageSaveError(`${label}, ${index + 1}. sáv: ${price.ok ? 'adja meg a díjat.' : price.message}`);
    const last = index === prices.length - 1;
    const bound = bounds[index];
    if (!last && (!bound || !bound.ok || bound.value === null)) throw new PackageSaveError(`${label}, ${index + 1}. sáv: ${bound && !bound.ok ? bound.message : 'adja meg a felső határt.'}`);
    return { upToHuf: last ? null : (bound as { value: number }).value, priceEur: price.value };
  });
  const checked = validateTiers(rows);
  if (!checked.ok) {
    const first = checked.errors[0];
    throw new PackageSaveError(`${label}${first.field === 'list' ? '' : `, ${first.row + 1}. sáv`}: ${first.message}`);
  }
  return checked.tiers;
}

/**
 * Ársávok: the tiers of the extras still sold. The listing packages are not tiered here any more: their price is
 * the matrix of the first tab (src/lib/listing-pricing.ts).
 */
export function tiersPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const catalog = listingCatalog(current as StoredServices);
  const extras = catalog.extras.map((extra) => {
    const key = tierKey('extra', extra.id);
    return !extra.retired && extra.id !== 'translation' && form.has(`${key}_price`) ? { ...extra, tiers: readTierRows(form, key, extraName(extra.id)) } : extra;
  });
  const next = listingCatalog({ ...current, listingExtras: storedExtras({ ...catalog, extras }) } as StoredServices);
  return { listingExtras: extrasStored(next, current) };
}

/** Kerekítés: the euro step converted prices round to. */
export function roundingPatch(form: FormData): ServicesPatch {
  const step = Number(text(form, 'step'));
  if (!(PRICE_ROUNDING_STEPS as readonly number[]).includes(step)) throw new PackageSaveError('Válasszon a felkínált kerekítési lépések közül.');
  return { priceRounding: { step } };
}
