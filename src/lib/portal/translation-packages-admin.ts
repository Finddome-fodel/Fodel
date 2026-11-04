/**
 * Saving the translation settings (site_settings.services.translationPackages), one tab at a time.
 *
 * The two admin tabs (Fordítási csomagok, Egyedi nyelvek) each own some keys of that object and nothing else:
 * this reads what is stored, replaces only the keys the tab owns, and writes back the rest of `services`
 * untouched (the listing packages, the extras, the phone switches). Every value is normalised through
 * translationPricing(), the function every reader uses, so what is stored is exactly what checkout will price.
 */
import { LOCALES } from '~/i18n/ui';
import { TRANSLATION_PACKAGES } from '~/config/company';
import { translationPricing, type TranslationPricing } from '~/lib/translation-packages';
import { clearRuntimeConfigCache } from '~/lib/runtime-config';
import { requestRebuild } from '~/lib/rebuild';
import { logEvent } from '~/lib/activity';
import { friendlyError } from '~/lib/portal/labels';

export type SaveResult = { ok: true; pricing: TranslationPricing } | { ok: false; error: string };

/** The keys of `translationPackages` a tab may write. */
export type TabKeys = 'packages' | 'singleEur' | 'worldOnly';

export async function saveTranslationSettings(locals: App.Locals, patch: Partial<Record<TabKeys, unknown>>, kind: string): Promise<SaveResult> {
  const { supabase, user, profile } = locals;
  const { data: existing, error: readError } = await supabase.from('site_settings').select('services').eq('id', 1).maybeSingle();
  if (readError) return { ok: false, error: friendlyError(readError.message) };
  const services = (existing?.services && typeof existing.services === 'object' ? existing.services : {}) as Record<string, unknown>;
  const stored = (services.translationPackages && typeof services.translationPackages === 'object' ? services.translationPackages : {}) as Record<string, unknown>;

  const merged = { ...stored, ...patch };
  const clean = translationPricing(merged, TRANSLATION_PACKAGES, LOCALES);
  // Only the keys this tab owns are replaced by their normalised form; the rest stays exactly as stored.
  const next: Record<string, unknown> = { ...stored };
  if ('packages' in patch) next.packages = clean.packages.map(({ rule: _rule, ...rest }) => rest);
  if ('singleEur' in patch) next.singleEur = clean.singleEur;
  if ('worldOnly' in patch) next.worldOnly = clean.worldOnly;

  const { error } = await supabase.from('site_settings').update({ services: { ...services, translationPackages: next } }).eq('id', 1);
  if (error) return { ok: false, error: friendlyError(error.message) };
  clearRuntimeConfigCache();
  await requestRebuild();
  await logEvent({
    kind: 'settings.translation_packages', actorId: user?.id ?? null, actorEmail: profile?.email ?? null,
    subjectType: 'site_settings', subjectId: null, source: 'portal',
    payload: { tab: kind, prices: clean.packages.map((pkg) => ({ id: pkg.id, priceEur: pkg.priceEur })), singleEur: clean.singleEur, worldOnly: clean.worldOnly },
  }).catch(() => {});
  return { ok: true, pricing: clean };
}
