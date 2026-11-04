/**
 * What state is a listing's text in, in one language? The admin overview, the side-by-side editor,
 * the publish check and the daily digest all ask this one function, so they can never disagree.
 *
 * The facts come from the `translation_matrix` view (migration 0052); the source fingerprint is made
 * here, because "the source changed since" compares fingerprints made by translate-core.ts.
 *
 * Pure, relative imports only: scripts/test-rules.mjs loads this file directly in Node.
 */
import { failCodeHu } from './translate-core.ts';

export type TranslationStatus = 'source' | 'ok' | 'review' | 'stale' | 'pending' | 'failed' | 'excluded' | 'missing';

/** One row of the translation_matrix view. */
export type MatrixFact = {
  property_id: string;
  locale: string;
  excluded: boolean;
  has_text: boolean;
  machine: boolean | null;
  manual_override: boolean | null;
  needs_review: boolean | null;
  translated_from: string | null;
  source_hash: string | null;
  validated_at: string | null;
  check_warnings: string[] | null;
  job_id: string | null;
  job_status: string | null;
  job_origin: string | null;
  fail_code: string | null;
  last_error: string | null;
  attempts: number | null;
  job_finished_at: string | null;
};

/** A language the matrix has no row for: nothing written, nothing queued, nothing excluded. */
export const blankFact = (propertyId: string, locale: string): MatrixFact => ({
  property_id: propertyId, locale, excluded: false, has_text: false, machine: null, manual_override: null, needs_review: null,
  translated_from: null, source_hash: null, validated_at: null, check_warnings: null, job_id: null, job_status: null, job_origin: null,
  fail_code: null, last_error: null, attempts: null, job_finished_at: null,
});

export type StatusContext = {
  /** The language the listing was written in. */
  sourceLocale: string;
  /** Fingerprint of the source text right now (translate-core.ts sourceHash). */
  sourceHash: string;
  /** Today's AI budget is spent: queued jobs wait until tomorrow. */
  capped?: boolean;
};

export type StatusInfo = {
  status: TranslationStatus;
  /** The word an admin reads. */
  label: string;
  /** One line of why, for a tooltip or under the field. */
  reason: string;
  /** A person edited the text (a machine re-translation would replace it). */
  manual: boolean;
};

export const STATUS_HU: Record<TranslationStatus, string> = {
  source: 'Eredeti',
  ok: 'Kész',
  review: 'Ellenőrizendő',
  stale: 'Elavult',
  pending: 'Folyamatban',
  failed: 'Hibás',
  excluded: 'Kizárva',
  missing: 'Nincs',
};

/** The order a list is sorted by: what needs a person first. */
export const STATUS_ORDER: TranslationStatus[] = ['failed', 'stale', 'review', 'pending', 'missing', 'excluded', 'ok', 'source'];

/** Both of these mean a visitor sees the text in that language. */
export const isLive = (status: TranslationStatus): boolean => status === 'ok' || status === 'review' || status === 'source';

export function translationStatus(fact: MatrixFact, ctx: StatusContext): StatusInfo {
  const manual = Boolean(fact.manual_override);
  const info = (status: TranslationStatus, reason: string, label = STATUS_HU[status]): StatusInfo => ({ status, label, reason, manual });

  if (fact.locale === ctx.sourceLocale) return info('source', 'Az eredeti szöveg: ezen a nyelven készült a hirdetés.');
  if (fact.excluded) return info('excluded', 'A hirdető vagy egy admin kizárta ezt a nyelvet. A szöveg megmarad, de nem jelenik meg.');

  const job = fact.job_status;
  if (job === 'requested') return info('pending', 'Az ingyenes feltöltő kérte, jóváhagyásra vár.', 'Jóváhagyásra vár');
  if (job === 'queued' || job === 'running') {
    return ctx.capped && job === 'queued'
      ? info('pending', 'A napi AI-keret elfogyott, a fordítás holnap készül el.', 'Folyamatban (napi keret elérve)')
      : info('pending', job === 'running' ? 'Éppen készül.' : 'Sorban áll.');
  }

  // Without a fingerprint of the source there is nothing to compare against: never guess "stale".
  const stale = fact.has_text && Boolean(ctx.sourceHash) && Boolean(fact.translated_from) && Boolean(fact.source_hash) && fact.source_hash !== ctx.sourceHash;
  if (job === 'failed' && (!fact.has_text || stale)) {
    const why = failCodeHu(fact.fail_code) || fact.last_error || 'A fordítás nem sikerült.';
    return info('failed', fact.last_error && fact.last_error !== why ? `${why}: ${fact.last_error}` : why, `${STATUS_HU.failed}: ${why}`);
  }
  if (!fact.has_text) return info('missing', 'Ehhez a nyelvhez nincs szöveg.');
  if (stale) return info('stale', 'A forrásszöveg azóta változott. A régi fordítás addig látszik, amíg újra nem fordítják.');
  if (fact.needs_review) return info('review', (fact.check_warnings ?? []).join(' ') || 'Megjelent, de érdemes átnézni.');
  return info('ok', manual ? 'Kézzel javított szöveg.' : fact.machine ? 'AI fordítás, az ellenőrzéseken átment.' : 'Kézzel írt szöveg.');
}

/** Counts per status, for the header of a column ("pl: 41 kész · 2 hibás"). */
export function countStatuses(infos: StatusInfo[]): Record<TranslationStatus, number> {
  const counts: Record<TranslationStatus, number> = { source: 0, ok: 0, review: 0, stale: 0, pending: 0, failed: 0, excluded: 0, missing: 0 };
  for (const info of infos) counts[info.status] += 1;
  return counts;
}

/** "41 kész · 2 hibás": only what is there, in the order a person cares about. */
export function summaryLine(counts: Record<TranslationStatus, number>): string {
  const parts: string[] = [];
  const add = (n: number, word: string) => { if (n > 0) parts.push(`${n} ${word}`); };
  add(counts.ok + counts.source, 'kész');
  add(counts.review, 'ellenőrizendő');
  add(counts.stale, 'elavult');
  add(counts.pending, 'folyamatban');
  add(counts.failed, 'hibás');
  add(counts.excluded, 'kizárva');
  return parts.join(' · ');
}

export type LanguageProblem = { locale: string; status: TranslationStatus; reason: string };

/**
 * Before a listing is published: the languages that were bought (or are part of the package) and are
 * not in a state a visitor can read. A language that is still being made is not a problem, only news;
 * `blocking` problems (failed, missing, stale) need the admin to say they know.
 */
export function languageProblems(
  facts: MatrixFact[], ctx: StatusContext, expected: Iterable<string>
): { blocking: LanguageProblem[]; waiting: LanguageProblem[] } {
  const want = new Set(expected);
  const blocking: LanguageProblem[] = [];
  const waiting: LanguageProblem[] = [];
  for (const fact of facts) {
    if (!want.has(fact.locale)) continue;
    const info = translationStatus(fact, ctx);
    if (['ok', 'review', 'source', 'excluded'].includes(info.status)) continue;
    (info.status === 'pending' ? waiting : blocking).push({ locale: fact.locale, status: info.status, reason: info.reason });
  }
  return { blocking, waiting };
}

/** The languages a listing's jobs say were bought or granted: any job that is not cancelled or declined, from a paid or package origin. */
export function expectedFromJobs(jobs: { locale: string; origin: string; status: string }[]): string[] {
  const paid = ['upload_paid', 'after_publish_paid', 'package'];
  return [...new Set(jobs.filter((job) => paid.includes(job.origin) && !['cancelled', 'declined'].includes(job.status)).map((job) => job.locale))];
}

/** One listing in the overview: what the page draws. */
export type OverviewRow = {
  id: string;
  ref: string;
  title: string;
  settlement: string;
  status: string;
  packageName: string;
  free: boolean;
  cells: Record<string, StatusInfo>;
};
