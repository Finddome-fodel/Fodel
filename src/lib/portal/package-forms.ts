/**
 * Reading the Csomagok tabs' forms into site_settings.services patches.
 * Every patch is normalised through listingCatalog() — the same function
 * every reader uses — so what is stored is exactly what the price list,
 * the wizard, approval and checkout will use. Each tab writes only its own
 * part: the listing tab never touches a price, the tiers tab never a name.
 */
import { listingCatalog, storedExtras, storedPackagePhone, storedPackages, VIDEO_MODES, PRICE_MAX, type ListingCatalog, type StoredServices, type VideoMode } from '~/lib/listing-packages';
import { legacyTiers, validateTiers, TIER_BOUND_MAX, type PriceTier } from '~/lib/price-tiers';
import { readMoney, readMoneyAll } from '~/lib/portal/num';
import { PackageSaveError, type ServicesPatch } from '~/lib/portal/package-admin';
import { PRICE_ROUNDING_STEPS } from '~/lib/exchange-rates';

export const NAME_MAX = 80;

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

/** The packages exactly as stored now, with `change` applied to each, normalised. */
function withPackages(current: Record<string, unknown>, change: (pkg: ListingCatalog['packages'][number]) => Partial<ListingCatalog['packages'][number]>): ServicesPatch {
  const catalog = listingCatalog(current as StoredServices);
  const next: ListingCatalog = { ...catalog, packages: catalog.packages.map((pkg) => ({ ...pkg, ...change(pkg) })) };
  // Round-trip through the reader so every clamp and default applies.
  const clean = listingCatalog({ listingPackages: storedPackages(next), listingExtras: storedExtras(next), packagePhone: storedPackagePhone(next) } as StoredServices);
  return { listingPackages: storedPackages(clean), packagePhone: storedPackagePhone(clean) };
}

/**
 * Hirdetési csomagok: names, duration, content and the recommended card.
 * Prices are not on this form (they are edited on Ársávok) and stay as stored.
 */
export function listingPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const recommended = text(form, 'recommended');
  const catalog = listingCatalog(current as StoredServices);
  if (!catalog.packages.some((pkg) => pkg.id === recommended)) throw new PackageSaveError('Jelölje meg, melyik csomag az ajánlott.');
  return withPackages(current, (pkg) => {
    const k = (field: string) => `${pkg.id}_${field}`;
    const hu = text(form, k('name_hu')).slice(0, NAME_MAX);
    const nl = text(form, k('name_nl')).slice(0, NAME_MAX);
    if (!hu || !nl) throw new PackageSaveError('Minden csomagnak legyen magyar és holland neve.');
    const months = Number(text(form, k('months')));
    if (!Number.isInteger(months) || months < 1 || months > 36) throw new PackageSaveError('Az időtartam 1 és 36 hónap között legyen.');
    const video = text(form, k('video')) as VideoMode;
    return {
      names: { ...pkg.names, hu, nl },
      months,
      video: VIDEO_MODES.includes(video) ? video : pkg.video,
      phone: form.get(k('phone')) === 'yes',
      editedImages: form.get(k('edited_images')) === 'yes',
      editedText: form.get(k('edited_text')) === 'yes',
      recommended: recommended === pkg.id,
    };
  });
}

/**
 * Kiegészítők: the price of every extra that has a single price. An extra
 * with tiers is edited on Ársávok (its card links there) and a retired one
 * is not editable; both stay as stored.
 */
export function extrasPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const catalog = listingCatalog(current as StoredServices);
  const extras = catalog.extras.map((extra) => {
    if (extra.retired || extra.tiers.length > 1 || !form.has(`extra_${extra.id}`)) return extra;
    const price = readMoney(form, `extra_${extra.id}`, { min: 0, max: PRICE_MAX, required: true });
    if (!price.ok) throw new PackageSaveError(`${extraName(extra.id)}: ${price.message}`);
    return { ...extra, tiers: [{ upToHuf: null, priceEur: price.value! }], priceEur: price.value! };
  });
  return { listingExtras: storedExtras(listingCatalog({ ...current, listingExtras: storedExtras({ ...catalog, extras }) } as StoredServices)) };
}

/** Hungarian names of the extras, for the admin. */
export const EXTRA_ADMIN: Record<string, { label: string; unit: string; note?: string }> = {
  translation: { label: 'Fordítás', unit: '€ / nyelv' },
  'category-highlight': { label: 'Kiemelés a kategóriában', unit: '€ / hó', note: 'Legalább 3 hónapra.' },
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

/** Ársávok: the tiers of every package and every extra still sold. */
export function tiersPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const catalog = listingCatalog(current as StoredServices);
  const packages = catalog.packages.map((pkg) => {
    const key = tierKey('pkg', pkg.id);
    return form.has(`${key}_price`) ? { ...pkg, tiers: readTierRows(form, key, pkg.names.hu) } : pkg;
  });
  const extras = catalog.extras.map((extra) => {
    const key = tierKey('extra', extra.id);
    return !extra.retired && form.has(`${key}_price`) ? { ...extra, tiers: readTierRows(form, key, extraName(extra.id)) } : extra;
  });
  const next = listingCatalog({ ...current, listingPackages: storedPackages({ packages, extras }), listingExtras: storedExtras({ packages, extras }) } as StoredServices);
  return { listingPackages: storedPackages(next), listingExtras: storedExtras(next) };
}

/** Kerekítés: the euro step converted prices round to. */
export function roundingPatch(form: FormData): ServicesPatch {
  const step = Number(text(form, 'step'));
  if (!(PRICE_ROUNDING_STEPS as readonly number[]).includes(step)) throw new PackageSaveError('Válasszon a felkínált kerekítési lépések közül.');
  return { priceRounding: { step } };
}

/**
 * The form of the old Beállítások → Hirdetési csomagok page, for a browser
 * tab that was open across the deploy: it posted names, content, the
 * package prices (one optional higher price above a threshold in millions)
 * and every extra's flat price. Saved the way it always was.
 */
export function legacyPatch(form: FormData, current: Record<string, unknown>): ServicesPatch {
  const listing = listingPatch(form, current);
  const merged = { ...current, ...listing };
  const priced = withPackages(merged, (pkg) => {
    const k = (field: string) => `${pkg.id}_${field}`;
    if (!form.has(k('price'))) return {};
    const price = readMoney(form, k('price'), { min: 0, max: PRICE_MAX, required: true });
    if (!price.ok) throw new PackageSaveError(`${pkg.names.hu}: ${price.message}`);
    const tiered = form.get(k('tiered')) === 'yes';
    const above = tiered ? readMoney(form, k('price_above'), { min: 0, max: PRICE_MAX }) : null;
    const millions = tiered ? readMoney(form, k('threshold_m'), { min: 1, max: 100_000 }) : null;
    const tiers = legacyTiers(
      price.value!,
      above && above.ok ? above.value : null,
      millions && millions.ok && millions.value !== null ? millions.value * 1_000_000 : null
    );
    return { tiers };
  });
  const extras = extrasPatch(form, { ...merged, ...priced });
  return { ...priced, ...extras };
}
