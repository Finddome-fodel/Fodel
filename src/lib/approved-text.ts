/**
 * Wording an admin approves per language (the refund policy, the valuation
 * accuracy notice). It is stored for Hungarian and Dutch only. English,
 * German and French pages show the approved Dutch wording, marked as Dutch,
 * rather than nothing: a rule that applies to everyone must be readable by
 * everyone, and FODEL does not translate approved wording on its own.
 */
import type { Locale } from '~/i18n/ui';

export type ApprovedWording = Partial<Record<'hu' | 'nl', string>> | undefined;

export function approvedWording(stored: ApprovedWording, locale: Locale): { text: string; lang: 'hu' | 'nl' } | null {
  const own = locale === 'hu' || locale === 'nl' ? stored?.[locale]?.trim() : undefined;
  if (own) return { text: own, lang: locale as 'hu' | 'nl' };
  if (locale === 'hu') return null;
  const dutch = stored?.nl?.trim();
  return dutch ? { text: dutch, lang: 'nl' } : null;
}
