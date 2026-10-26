/**
 * Runtime vocabulary and company facts.
 *
 * Listings are deliberately uncached in properties.ts because stale workflow
 * state is dangerous. These roughly sixty rows change a few times a year and
 * already sit behind routes with `s-maxage=300`, so a short process-local TTL
 * removes repeated reads without making an approval appear stale. A failed
 * configuration read always falls back to the checked-in 1.2 facts: a database
 * blip must not turn every public page into a 500.
 */
import { COMPANY } from '~/config/company';
import { CATEGORY_FALLBACK, LOCALES, type Locale } from '~/i18n/ui';
import { FEATURES, COUNTIES } from '~/data/features';
import { overlayLabels } from '~/data/taxonomy-i18n';
import { getSupabase } from '~/lib/supabase';
import { PROPERTY_GROUPS, FEATURE_DEFINITIONS, DETAIL_OPTIONS } from '~/lib/listing-catalogue';
import { WALL_MATERIALS } from '~/data/wall-materials';
import type { ListingRules } from '~/lib/listing-rules';
import type { StoredListingPackage } from '~/lib/listing-packages';

export type TaxonomyGroup =
  | 'category'
  | 'feature'
  | 'condition'
  | 'heating'
  | 'county'
  | 'region'
  | 'blog_category'
  | 'wall';

export type TaxonomyTerm = {
  id?: string;
  groupKey: TaxonomyGroup;
  key: string;
  labels: Partial<Record<Locale, string>> & { hu: string; nl: string };
  slugs: Partial<Record<Locale, string>>;
  schemaType?: string;
  sortOrder: number;
  enabled: boolean;
  propertyGroups?: string[];
  subtypeKeys?: string[];
  sectionKey?: string;
};

export type Taxonomy = Record<TaxonomyGroup, TaxonomyTerm[]>;

/**
 * Switches an admin sets in /portal/settings/services (migration 0014).
 *
 * Every default is the conservative one, and it is what applies whenever the
 * column is missing (code deployed before 0014 ran) or the database cannot be
 * read: a service that may not be staffed is not advertised, and nothing is
 * sent automatically.
 */
export type Services = {
  /** The homepage and footer entry points to the valuation form. */
  valuationEntry: boolean;
  /** Whether the launch valuation is confirmed free of charge. Gates the word "free". */
  valuationFreeConfirmed: boolean;
  /** Approved wording of the accuracy notice under the valuation form, per language. */
  valuationNotice?: Partial<Record<'hu' | 'nl', string>>;
  /** Approved refund wording; empty until the business rules are signed off. */
  refundPolicy?: Partial<Record<'hu' | 'nl', string>>;
  instantValuation?: boolean;
  valuationBandPercent?: number | null;
  valuationMinCount?: number | null;
  eurHufRate?: number | null;
  eurHufRateDate?: string | null;
  /** Admin-edited names and prices of the three valuation packages; see src/lib/valuation/packages.ts. */
  valuationPackages?: Partial<Record<'indicative' | 'expert_visit' | 'judicial', StoredValuationPackage>>;
  /** Phone visibility per package, expiry reminders, monthly owner refresh — see src/lib/listing-rules.ts. */
  packagePhone?: Partial<ListingRules['packagePhone']>;
  expiry?: Partial<ListingRules['expiry']>;
  ownerRefresh?: Partial<ListingRules['ownerRefresh']>;
  /** Listing package content and prices, and the extras' prices — see src/lib/listing-packages.ts. */
  listingPackages?: Partial<Record<'cheap-6m' | 'normal-12m', StoredListingPackage>>;
  listingExtras?: Partial<Record<string, { priceEur?: number }>>;
};

export type StoredValuationPackage = {
  names?: Partial<Record<'hu' | 'nl', string>>;
  /** Whole euros; null means "on request". */
  priceEur?: number | null;
  enabled?: boolean;
};

export type Automation = {
  /** Reminder emails after an abandoned registration. Prepared, not yet allowed on. */
  registrationReminder: boolean;
  /** Automatic invite/approval of new sellers. Never covers listing approval. */
  inviteAutomation: boolean;
};

export const SERVICES_DEFAULT: Services = { valuationEntry: false, valuationFreeConfirmed: false, instantValuation: false };
export const AUTOMATION_DEFAULT: Automation = { registrationReminder: false, inviteAutomation: false };

export type Company = Omit<typeof COMPANY, 'phones'> & {
  // `note` is optional here even though every static COMPANY.phones entry has
  // one: site_settings.phones is admin-editable from 1.3 on, and an admin
  // adding a phone through /portal/settings/company has no reason to be
  // forced into typing supplementary note text for it.
  phones: ReadonlyArray<Omit<(typeof COMPANY.phones)[number], 'note'> & { public: boolean; note?: Record<string, string> }>;
  /** International format without spaces (+36…), or null — null hides every WhatsApp button. */
  whatsapp: string | null;
  services: Services;
  automation: Automation;
};

/**
 * English, German and French labels a term is missing, from the checked-in
 * vocabulary (src/data/taxonomy-i18n.ts). Whatever the database has wins.
 */
function withOverlay(group: TaxonomyGroup, key: string, labels: TaxonomyTerm['labels']): TaxonomyTerm['labels'] {
  return { ...overlayLabels(group, key), ...Object.fromEntries(Object.entries(labels ?? {}).filter(([, v]) => v)) } as TaxonomyTerm['labels'];
}

/** Category URL slugs in every language, from the checked-in vocabulary. */
function categorySlugs(key: string): TaxonomyTerm['slugs'] {
  const entry = CATEGORY_FALLBACK[key as keyof typeof CATEGORY_FALLBACK];
  if (!entry) return {};
  return Object.fromEntries(LOCALES.map((locale) => [locale, entry[locale].slug]));
}

const groups: TaxonomyGroup[] = [
  'category', 'feature', 'condition', 'heating', 'county', 'region', 'blog_category', 'wall',
];

function emptyTaxonomy(): Taxonomy {
  return Object.fromEntries(groups.map((group) => [group, []])) as unknown as Taxonomy;
}

export const TAXONOMY_FALLBACK: Taxonomy = (() => {
  const taxonomy = emptyTaxonomy();
  taxonomy.category = Object.entries(CATEGORY_FALLBACK).map(([key, value], index) => ({
    groupKey: 'category',
    key,
    labels: Object.fromEntries(
      LOCALES.map((locale) => [locale, value[locale].label])
    ) as TaxonomyTerm['labels'],
    slugs: categorySlugs(key),
    schemaType: value.schema,
    sortOrder: (index + 1) * 10,
    enabled: true,
  }));
  taxonomy.feature = Object.entries(FEATURES).map(([key, labels], index) => ({
    groupKey: 'feature', key, labels: withOverlay('feature', key, labels), slugs: {}, sortOrder: (index + 1) * 10, enabled: true,
  }));
  taxonomy.county = COUNTIES.map((label, index) => ({
    groupKey: 'county',
    key: label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
    labels: { hu: label, nl: label },
    slugs: {}, sortOrder: (index + 1) * 10, enabled: true,
  }));
  taxonomy.wall = wallFallback();
  return taxonomy;
})();

function wallFallback(): TaxonomyTerm[] {
  return WALL_MATERIALS.map((term, index) => ({
    groupKey: 'wall', key: term.key, labels: withOverlay('wall', term.key, term.labels), slugs: {}, sortOrder: (index + 1) * 10, enabled: true,
  }));
}

export const COMPANY_FALLBACK: Company = {
  ...COMPANY,
  phones: COMPANY.phones.map((phone, index) => ({ ...phone, public: index !== 2 })),
  whatsapp: null,
  services: SERVICES_DEFAULT,
  automation: AUTOMATION_DEFAULT,
};

type Cache<T> = { value?: T; expiresAt: number; pending?: Promise<T> };
const taxonomyCache: Cache<Taxonomy> = { expiresAt: 0 };
const companyCache: Cache<Company> = { expiresAt: 0 };
const TTL_MS = 60_000;

async function cached<T>(cache: Cache<T>, load: () => Promise<T>, fallback: T): Promise<T> {
  if (cache.value && cache.expiresAt > Date.now()) return cache.value;
  if (cache.pending) return cache.pending;
  cache.pending = load()
    .then((value) => {
      cache.value = value;
      cache.expiresAt = Date.now() + TTL_MS;
      return value;
    })
    .catch((error) => {
      console.error('[runtime-config] database read failed; using checked-in fallback', error);
      cache.value = fallback;
      cache.expiresAt = Date.now() + TTL_MS;
      return fallback;
    })
    .finally(() => { cache.pending = undefined; });
  return cache.pending;
}

export async function getTaxonomy(): Promise<Taxonomy> {
  return cached(taxonomyCache, async () => {
    const { data, error } = await getSupabase()
      .from('taxonomy_terms')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    const taxonomy = emptyTaxonomy();
    for (const row of data ?? []) {
      const groupKey = row.group_key as TaxonomyGroup;
      if (!taxonomy[groupKey]) continue;
      taxonomy[groupKey].push({
        id: row.id,
        groupKey,
        key: row.key,
        labels: groupKey === 'category' ? withCategoryLabels(row.key, row.labels) : withOverlay(groupKey, row.key, row.labels),
        slugs: groupKey === 'category' ? { ...categorySlugs(row.key), ...(row.slugs ?? {}) } : row.slugs ?? {},
        schemaType: row.schema_type ?? undefined,
        sortOrder: row.sort_order,
        enabled: row.enabled,
        propertyGroups: row.property_groups ?? FEATURE_DEFINITIONS.find(f=>f.key===row.key)?.propertyGroups,
        subtypeKeys: row.subtype_keys ?? FEATURE_DEFINITIONS.find(f=>f.key===row.key)?.subtypeKeys ?? [],
        sectionKey: row.section_key ?? FEATURE_DEFINITIONS.find(f=>f.key===row.key)?.section,
      });
    }
    // Before migration 0019 the database has no wall terms: keep the vocabulary.
    if (taxonomy.wall.length === 0) taxonomy.wall = wallFallback();
    return completeListingTaxonomy(taxonomy);
  }, completeListingTaxonomy(TAXONOMY_FALLBACK));
}

export async function getCompany(): Promise<Company> {
  return cached(companyCache, async () => {
    const { data, error } = await getSupabase().from('site_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return {
      ...COMPANY_FALLBACK,
      names: data.names,
      phones: data.phones,
      email: data.emails,
      address: data.address,
      registration: data.registration,
      hours: data.hours,
      banks: data.banks,
      social: data.social,
      reach: data.reach,
      network: data.network,
      founded: data.founded,
      foundedIn: data.founded_in,
      principal: data.principal,
      whatsapp: typeof data.whatsapp === 'string' && data.whatsapp ? data.whatsapp : null,
      services: { ...SERVICES_DEFAULT, ...(data.services ?? {}) },
      automation: { ...AUTOMATION_DEFAULT, ...(data.automation ?? {}) },
    } as Company;
  }, COMPANY_FALLBACK);
}

/** Category terms: the database labels win, the checked-in ones fill any language it lacks. */
function withCategoryLabels(key: string, labels: TaxonomyTerm['labels']): TaxonomyTerm['labels'] {
  const entry = CATEGORY_FALLBACK[key as keyof typeof CATEGORY_FALLBACK];
  const base = entry ? Object.fromEntries(LOCALES.map((locale) => [locale, entry[locale].label])) : {};
  return { ...base, ...Object.fromEntries(Object.entries(labels ?? {}).filter(([, v]) => v)) } as TaxonomyTerm['labels'];
}

export function categoryBySlug(taxonomy: Taxonomy, locale: Locale, slug: string) {
  return taxonomy.category.find((term) => term.slugs[locale] === slug);
}

/**
 * A term's label in the visitor's language. A language the term has no label
 * for falls back to Dutch, then Hungarian: place names and the like are the
 * same in every language anyway.
 */
export function termLabel(term: TaxonomyTerm | undefined, locale: Locale): string {
  return term?.labels[locale] ?? term?.labels.nl ?? term?.labels.hu ?? term?.key ?? '';
}

/** Add new brief vocabulary without replacing admin edits or disabling old URLs. */
function completeListingTaxonomy(taxonomy: Taxonomy): Taxonomy {
  for (const group of ['feature','condition','heating','wall'] as const) {
    const definitions = group === 'feature' ? FEATURE_DEFINITIONS : DETAIL_OPTIONS[group];
    for (const term of definitions) {
      const found = taxonomy[group].find(t=>t.key===term.key);
      if (found) {
        found.labels = {...term.labels,...found.labels} as TaxonomyTerm['labels'];
        if(group==='feature'){
          const legacy={...FEATURES[term.key],...overlayLabels('feature',term.key)} as Record<string,string>;
          for(const [locale,label] of Object.entries(term.labels))if(!found.labels[locale as Locale]||found.labels[locale as Locale]===legacy[locale])found.labels[locale as Locale]=label;
        }
        if (group==='feature' && !found.propertyGroups?.length) found.propertyGroups=FEATURE_DEFINITIONS.find(f=>f.key===term.key)?.propertyGroups;
        if(group==='feature'&&found.subtypeKeys===undefined)found.subtypeKeys=FEATURE_DEFINITIONS.find(f=>f.key===term.key)?.subtypeKeys;
      } else taxonomy[group].push({groupKey:group,key:term.key,labels:term.labels as TaxonomyTerm['labels'],slugs:{},enabled:true,sortOrder:100,propertyGroups:group==='feature'?FEATURE_DEFINITIONS.find(f=>f.key===term.key)?.propertyGroups:undefined,subtypeKeys:group==='feature'?FEATURE_DEFINITIONS.find(f=>f.key===term.key)?.subtypeKeys:undefined,sectionKey:group==='feature'?FEATURE_DEFINITIONS.find(f=>f.key===term.key)?.section:undefined});
    }
  }
  for (const g of PROPERTY_GROUPS) if(!taxonomy.category.some(t=>t.key===g.key)) taxonomy.category.push({groupKey:'category',key:g.key,labels:g.labels as TaxonomyTerm['labels'],slugs:Object.keys(g.slugs).length?g.slugs:{hu:g.key,nl:g.key,en:g.key,de:g.key,fr:g.key,es:g.key,pl:g.key,ro:g.key,sk:g.key,it:g.key,pt:g.key,el:g.key,cs:g.key,sl:g.key,sv:g.key,da:g.key,no:g.key,fi:g.key,et:g.key,lv:g.key,lt:g.key},schemaType:'Place',enabled:true,sortOrder:100});
  return taxonomy;
}

/** Nine primary categories in public selectors; historic subtype URLs still resolve through categoryBySlug. */
export function listingCategories(taxonomy:Taxonomy):TaxonomyTerm[]{
 return PROPERTY_GROUPS.map(g=>{const term=taxonomy.category.find(t=>t.key===g.key);return term?{...term,labels:g.labels as TaxonomyTerm['labels']}:null;}).filter((t):t is TaxonomyTerm=>Boolean(t?.enabled));
}
