/**
 * What an owner asked for when placing the ad — package, extras and an
 * optional on-site service — kept with their draft (`properties.requested_extras`,
 * migration 0015).
 *
 * Before brief 3 only the package survived the trip from the public form into
 * the draft; highlight, video and translations reached FODEL in the
 * notification email and nowhere else, so the review screen priced listings
 * without them (brief 3 item 14). This is a *request*, never an order: the
 * review screen pre-ticks from it and the admin confirms every line. No price
 * is ever read from here — prices come from the catalogue in company.ts.
 */
import { isOnsiteServiceId, TRANSLATION_LANGUAGES, type OnsiteServiceId } from '~/config/company';
import { ALL_LOCALES } from '~/lib/ai/translate-core';

export type RequestedExtras = {
  source?: 'submit_form' | 'listing_editor';
  /** ISO timestamp of the request. */
  at?: string;
  package?: string;
  /** Language codes the owner wants FODEL to translate into (nl, de, en, fr). */
  translations?: string[];
  /** The translation package the owner chose: go, europe or world. Go is free and automatic. */
  translationPackage?: string;
  /** Languages the owner switched off. Never English, whatever is sent. */
  excludedLocales?: string[];
  categoryHighlight?: boolean;
  homepageHighlight?: boolean;
  topicHighlight?: boolean;
  /** Wants a Dutch-speaking agent; the price is always agreed personally, so none is stored. */
  dutchAgent?: boolean;
  video?: boolean;
  service?: OnsiteServiceId | null;
};

// Only languages the site really has: a language added to the list ahead of the site is not a wish anyone can make yet.
const LANGS: readonly string[] = TRANSLATION_LANGUAGES.filter((code) => ALL_LOCALES.includes(code));
const PACKAGES: readonly string[] = ['go', 'europe', 'world'];

/** A list of language codes from a form value or a stored array: known ones only, no repeats, and never English. */
const excludable = (value: unknown): string[] =>
  (Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\s,]+/) : [])
    .map((code) => String(code).trim().toLowerCase())
    .filter((code, index, all) => code !== 'en' && LANGS.includes(code) && all.indexOf(code) === index);

/**
 * From the submit form's posted values. Everything is whitelisted: unknown
 * languages, highlight values or services are dropped rather than stored.
 */
export function extrasFromForm(values: Record<string, string>): RequestedExtras {
  const translations = (values.translations ?? '')
    .split(/[\s,]+/)
    .map((code) => code.trim().toLowerCase())
    .filter((code, index, all) => LANGS.includes(code) && all.indexOf(code) === index);
  const highlight = values.highlight ?? 'none';
  return {
    source: 'submit_form',
    at: new Date().toISOString(),
    package: values.package === 'normal-12m' || values.package === 'cheap-6m' ? values.package : undefined,
    translations,
    translationPackage: PACKAGES.includes(values.translation_package) ? values.translation_package : undefined,
    excludedLocales: excludable(values.translation_excluded),
    categoryHighlight: highlight === 'category' || highlight === 'both',
    homepageHighlight: highlight === 'homepage' || highlight === 'both',
    video: values.video === 'yes',
    service: isOnsiteServiceId(values.service) ? values.service : null,
  };
}

/** Reads a stored value defensively — rows from before 0015 have `{}` or nothing. */
export function readRequestedExtras(value: unknown): RequestedExtras {
  if (!value || typeof value !== 'object') return {};
  const raw = value as Record<string, unknown>;
  return {
    source: raw.source === 'listing_editor' ? 'listing_editor' : raw.source === 'submit_form' ? 'submit_form' : undefined,
    at: typeof raw.at === 'string' ? raw.at : undefined,
    package: typeof raw.package === 'string' ? raw.package : undefined,
    translations: Array.isArray(raw.translations) ? raw.translations.filter((code): code is string => typeof code === 'string' && LANGS.includes(code)) : [],
    translationPackage: typeof raw.translationPackage === 'string' && PACKAGES.includes(raw.translationPackage) ? raw.translationPackage : undefined,
    excludedLocales: excludable(raw.excludedLocales),
    categoryHighlight: raw.categoryHighlight === true,
    homepageHighlight: raw.homepageHighlight === true,
    topicHighlight: raw.topicHighlight === true,
    dutchAgent: raw.dutchAgent === true,
    video: raw.video === true,
    service: isOnsiteServiceId(raw.service) ? raw.service : null,
  };
}

/** True when the owner asked for anything beyond the package. */
export function hasRequests(extras: RequestedExtras): boolean {
  return Boolean(
    (extras.translations?.length ?? 0) > 0 || (extras.translationPackage !== undefined && extras.translationPackage !== 'go') || extras.categoryHighlight || extras.homepageHighlight || extras.topicHighlight || extras.dutchAgent || extras.video || extras.service
  );
}

/** Hungarian summary lines for the admin (review screen, service list). */
export function describeRequestedExtras(extras: RequestedExtras): string[] {
  const lines: string[] = [];
  const LANG_HU: Record<string, string> = { nl: 'holland', de: 'német', en: 'angol', fr: 'francia', es: 'spanyol', pl: 'lengyel', ro: 'román', sk: 'szlovák', it: 'olasz', pt: 'portugál', el: 'görög', cs: 'cseh', sl: 'szlovén', sv: 'svéd', da: 'dán', no: 'norvég', fi: 'finn', et: 'észt', lv: 'lett', lt: 'litván', sr: 'szerb', uk: 'ukrán', tr: 'török', he: 'héber', ar: 'arab', ru: 'orosz', zh: 'kínai' };
  const PACKAGE_HU: Record<string, string> = { europe: 'Európa csomag', world: 'World csomag' };
  if (extras.translationPackage && PACKAGE_HU[extras.translationPackage]) lines.push(`Fordítási csomag: ${PACKAGE_HU[extras.translationPackage]}`);
  if (extras.translations?.length) lines.push(`Fordítás: ${extras.translations.map((code) => LANG_HU[code] ?? code).join(', ')}`);
  if (extras.excludedLocales?.length) lines.push(`Kizárt nyelvek: ${extras.excludedLocales.map((code) => LANG_HU[code] ?? code).join(', ')}`);
  if (extras.categoryHighlight) lines.push('Kiemelés a kategóriában');
  if (extras.homepageHighlight) lines.push('Kiemelés a főoldalon');
  if (extras.topicHighlight) lines.push('Témakörön belüli kiemelés: altípus, egyedi áregyeztetéssel');
  if (extras.dutchAgent) lines.push('Holland nyelvű ingatlanos: egyedi áron, személyes egyeztetéssel');
  if (extras.video) lines.push('Videós bemutató (saját videó elhelyezése)');
  return lines;
}
