/**
 * Reading the translation_matrix view (migration 0051) for the admin screens, the publish check and the
 * daily digest. Every function degrades to "not migrated yet" instead of throwing, so the app keeps
 * working before the migration has been run.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { listingText, pickSource, sourceHash } from './translate-core';
import {
  blankFact, expectedFromJobs, languageProblems, translationStatus, type LanguageProblem, type MatrixFact, type StatusContext, type StatusInfo,
} from './translation-status';

type Client = SupabaseClient<any, any, any>;

/** PostgREST answers at most 1000 rows; 28 languages x 30 listings stays below it. */
const CHUNK = 30;

/** The view or a column is missing: migration 0051 has not been run. */
export function isMissingMatrix(error: { code?: string | null; message?: string | null } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && ['42P01', 'PGRST205', '42703', 'PGRST204'].includes(error.code)) return true;
  return /translation_matrix|needs_review|manual_override|excluded_locales/.test(error.message ?? '') && /does not exist|schema cache|could not find/i.test(error.message ?? '');
}

/** The matrix rows that say something (a text, a job, an exclusion). A language with none of these is "missing". */
export async function loadMatrix(client: Client, propertyIds: string[]): Promise<{ migrated: boolean; facts: MatrixFact[] }> {
  const facts: MatrixFact[] = [];
  const ids = [...new Set(propertyIds)];
  for (let i = 0; i < ids.length; i += CHUNK) {
    const { data, error } = await client
      .from('translation_matrix')
      .select('*')
      .in('property_id', ids.slice(i, i + CHUNK))
      .or('has_text.eq.true,job_id.not.is.null,excluded.eq.true')
      .limit(1000);
    if (error) {
      if (isMissingMatrix(error)) return { migrated: false, facts: [] };
      throw new Error(error.message);
    }
    facts.push(...((data ?? []) as MatrixFact[]));
  }
  return { migrated: true, facts };
}

/** Source language and fingerprint for each listing: from the human-written rows only (a machine row is never a source). */
export async function loadSources(client: Client, propertyIds: string[]): Promise<Map<string, { locale: string; hash: string; title: string }>> {
  const out = new Map<string, { locale: string; hash: string; title: string }>();
  const ids = [...new Set(propertyIds)];
  for (let i = 0; i < ids.length; i += 80) {
    const { data } = await client
      .from('property_translations')
      .select('property_id, locale, title, description, body, machine')
      .in('property_id', ids.slice(i, i + 80))
      .eq('machine', false);
    const byProperty = new Map<string, any[]>();
    for (const row of data ?? []) byProperty.set(row.property_id, [...(byProperty.get(row.property_id) ?? []), row]);
    for (const [id, rows] of byProperty) {
      const source = pickSource(rows);
      if (source) out.set(id, { locale: source.locale, hash: sourceHash(listingText(source)), title: String(source.title ?? '') });
    }
  }
  return out;
}

export type LanguageRow = MatrixFact & { info: StatusInfo };

/** Facts for one listing as a map by locale, each with its status. Missing locales are not in the map. */
export async function loadListingLanguages(
  client: Client, propertyId: string, capped = false
): Promise<{ migrated: boolean; ctx: StatusContext | null; byLocale: Map<string, LanguageRow>; facts: MatrixFact[] }> {
  const { migrated, facts } = await loadMatrix(client, [propertyId]);
  const source = (await loadSources(client, [propertyId])).get(propertyId);
  const ctx: StatusContext | null = source ? { sourceLocale: source.locale, sourceHash: source.hash, capped } : null;
  const byLocale = new Map<string, LanguageRow>();
  if (ctx) for (const fact of facts) byLocale.set(fact.locale, { ...fact, info: translationStatus(fact, ctx) });
  return { migrated, ctx, byLocale, facts };
}

/**
 * Before publishing: the bought languages a visitor could not read. Nothing to report before the migration,
 * when no job has a paid origin yet, or when the listing has no source text.
 */
export async function publishLanguageProblems(client: Client, propertyId: string): Promise<{ blocking: LanguageProblem[]; waiting: LanguageProblem[] }> {
  const none = { blocking: [], waiting: [] };
  try {
    const { data: jobs, error } = await client.from('translation_jobs').select('locale, origin, status').eq('property_id', propertyId);
    if (error) return none;
    const expected = expectedFromJobs(jobs ?? []);
    if (expected.length === 0) return none;
    const { migrated, ctx, facts } = await loadListingLanguages(client, propertyId);
    if (!migrated || !ctx) return none;
    // A language with no row at all (nothing written, nothing queued) is missing too.
    const seen = new Set(facts.map((fact) => fact.locale));
    const blank = expected.filter((locale) => !seen.has(locale)).map((locale) => blankFact(propertyId, locale));
    return languageProblems([...facts, ...blank], ctx, expected);
  } catch {
    return none;
  }
}
