/**
 * The Csomagok admin menu (/portal/packages, spec §9.0): what FINDDOME sells
 * and for how much, moved out of Beállítások into its own menu.
 *
 * One tab per sub-route, listed once in PACKAGE_TABS, so a later PR adds one
 * entry here (and its page and endpoint) and the tab bar, the guard and the
 * redirect all follow. Every tab saves through saveServicesPatch(), which
 * merges only that tab's keys into site_settings.services — saving the
 * rounding step can never reset a package price.
 *
 * The data model is unchanged by the move: listingPackages / listingExtras /
 * packagePhone / priceRounding (and, from the translation PR,
 * translationPackages) stay plain JSON in site_settings.services.
 */
import { clearRuntimeConfigCache } from '~/lib/runtime-config';
import { requestRebuild } from '~/lib/rebuild';
import { logEvent } from '~/lib/activity';
import { friendlyError } from '~/lib/portal/labels';

export type PackageTabId = 'listing' | 'translations' | 'extras' | 'languages' | 'fx' | 'tiers' | 'rounding';

export type PackageTab = {
  id: PackageTabId;
  /** The tab label (Hungarian, like the rest of the admin). */
  label: string;
  /** The tab's own page; the first tab is the menu's landing page. */
  href: string;
  /** Its save endpoint. */
  api: string;
  /** Whether a save must rebuild the prerendered public pages (prices are baked into them). */
  rebuild: boolean;
};

export const PACKAGE_TABS: readonly PackageTab[] = [
  { id: 'listing', label: 'Hirdetési csomagok (árak)', href: '/portal/packages', api: '/api/portal/packages/listing', rebuild: true },
  { id: 'translations', label: 'Csomagok tartalma', href: '/portal/packages/translations', api: '/api/portal/packages/translations', rebuild: true },
  { id: 'extras', label: 'Kiegészítők', href: '/portal/packages/extras', api: '/api/portal/packages/extras', rebuild: true },
  { id: 'languages', label: 'Egyedi nyelvek', href: '/portal/packages/languages', api: '/api/portal/packages/languages', rebuild: true },
  // Today's EUR/HUF rate for the informational forint hints; a "Frissítés most" runs the daily fetch by hand.
  { id: 'fx', label: 'Árfolyam', href: '/portal/packages/fx', api: '/api/portal/packages/fx', rebuild: false },
  { id: 'tiers', label: 'Ársávok (kiegészítők)', href: '/portal/packages/tiers', api: '/api/portal/packages/tiers', rebuild: true },
  // The rounding step only changes prices saved from now on; no public page shows it.
  { id: 'rounding', label: 'Kerekítés', href: '/portal/packages/rounding', api: '/api/portal/packages/rounding', rebuild: false },
];

export function packageTab(id: PackageTabId): PackageTab {
  return PACKAGE_TABS.find((tab) => tab.id === id)!;
}

/** The answer every package endpoint gives a non-admin (the middleware already stops most of them). */
export const forbidden = () => new Response('Ehhez nincs jogosultsága.', { status: 403 });

/** A save the admin has to correct: shown on the tab as the error notice, nothing is written. */
export class PackageSaveError extends Error {}

/** Keys of site_settings.services; `undefined` removes the key. */
export type ServicesPatch = Record<string, unknown>;

type Locals = App.Locals;

/** Back to the tab, after a POST: 303 so a reload never re-posts. */
export function backToTab(tab: PackageTabId, query: string): Response {
  return new Response(null, { status: 303, headers: { location: `${packageTab(tab).href}?${query}` } });
}

/**
 * Read site_settings.services, merge `patch` over it, write it back, then
 * clear the config cache, rebuild the public pages (if this tab feeds them)
 * and log `settings.packages` with the tab. Answers with the redirect back to
 * the tab: `?saved=1` or `?error=…`.
 *
 * `patch` may be a function of the current services, for a tab that has to
 * normalise against what is stored (e.g. tiers next to stored package
 * names). Throw PackageSaveError from it to refuse the save with a message.
 */
export async function saveServicesPatch(
  locals: Locals,
  patch: ServicesPatch | ((current: Record<string, unknown>) => ServicesPatch | Promise<ServicesPatch>),
  tab: PackageTabId = 'listing',
  options: { payload?: Record<string, unknown> } = {}
): Promise<Response> {
  if (locals.profile?.role !== 'admin') return forbidden();
  const { data: existing, error: readError } = await locals.supabase.from('site_settings').select('services').eq('id', 1).maybeSingle();
  if (readError) return backToTab(tab, 'error=' + encodeURIComponent(friendlyError(readError.message)));
  const current = (existing?.services && typeof existing.services === 'object' ? existing.services : {}) as Record<string, unknown>;

  let changes: ServicesPatch;
  try {
    changes = typeof patch === 'function' ? await patch(current) : patch;
  } catch (error) {
    if (error instanceof PackageSaveError) return backToTab(tab, 'error=' + encodeURIComponent(error.message));
    throw error;
  }

  const services: Record<string, unknown> = { ...current };
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) delete services[key];
    else services[key] = value;
  }
  const { error } = await locals.supabase.from('site_settings').update({ services }).eq('id', 1);
  if (error) return backToTab(tab, 'error=' + encodeURIComponent(friendlyError(error.message)));

  clearRuntimeConfigCache();
  if (packageTab(tab).rebuild) await requestRebuild();
  await logEvent({
    kind: 'settings.packages',
    actorId: locals.user?.id ?? null,
    actorEmail: locals.profile?.email ?? null,
    subjectType: 'site_settings',
    subjectId: null,
    source: 'portal',
    payload: {
      tab,
      keys: Object.keys(changes),
      // What changed, so a bad price can be put back from the log.
      before: Object.fromEntries(Object.keys(changes).map((key) => [key, current[key] ?? null])),
      after: Object.fromEntries(Object.keys(changes).map((key) => [key, changes[key] ?? null])),
      ...(options.payload ?? {}),
    },
  }).catch(() => {});

  return backToTab(tab, 'saved=1');
}
