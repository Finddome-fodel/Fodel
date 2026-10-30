/**
 * Translating one listing into one language with OpenAI.
 *
 * Long texts go out as several requests (paragraph-aligned pieces), so no call
 * runs long enough to time out; the pieces are put back together and the whole
 * result is checked once (translate-core.ts `checkTranslation`) before anyone
 * is allowed to save it. This file never touches the database: the job runner
 * (translation-jobs.ts) decides what may be written.
 *
 * Admin and server-side jobs only. Never from a public form's POST handler.
 */
import {
  callOpenAiJsonWithUsage, isAiEnabled, type AiUsage,
} from './client';
import {
  TRANSLATION_SCHEMA, buildSystemPrompt, buildUserMessage, checkTranslation, costMicroEur, listingChars,
  maxTokensFor, modelFromEnv, splitForTranslation, type ListingText,
} from './translate-core';

export type CallJson = (opts: {
  system: string; user: string; schema: Record<string, unknown>; schemaName: string;
  maxTokens: number; timeoutMs: number; retry: boolean; model: string;
}) => Promise<{ data: ListingText; usage: AiUsage }>;

export type TranslationResult = ListingText & { model: string; tokensIn: number; tokensOut: number; costMicroEur: number };

/** One request's worth of text. Above this a listing is split. */
const ONE_CALL_CHARS = 4500;
const PIECE_CHARS = 3500;
const CALL_TIMEOUT_MS = 60_000;
const CONCURRENCY = 3;

export const translationModel = (): string => modelFromEnv(import.meta.env.OPENAI_TRANSLATION_MODEL);

export function isTranslationAvailable(): boolean {
  return isAiEnabled();
}

type Segment = ListingText;

/** How a listing is cut into requests. Small ones are a single request. */
export function planSegments(text: ListingText): Segment[] {
  if (listingChars(text) <= ONE_CALL_CHARS) return [text];
  const description = splitForTranslation(text.description, PIECE_CHARS);
  const body = splitForTranslation(text.body, PIECE_CHARS);
  return [
    { title: text.title, description: description[0] ?? '', body: '' },
    ...description.slice(1).map((piece) => ({ title: '', description: piece, body: '' })),
    ...body.map((piece) => ({ title: '', description: '', body: piece })),
  ];
}

async function pool<T, R>(items: T[], size: number, work: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await work(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
  return results;
}

const callOpenAi: CallJson = (opts) => callOpenAiJsonWithUsage<ListingText>(opts);

export async function translateListing(
  source: ListingText,
  sourceLocale: string,
  targetLocale: string,
  call: CallJson = callOpenAi,
  model: string = translationModel()
): Promise<TranslationResult> {
  const system = buildSystemPrompt(sourceLocale, targetLocale);
  const segments = planSegments(source);
  const usage = { tokensIn: 0, tokensOut: 0 };

  const answers = await pool(segments, CONCURRENCY, async (segment) => {
    const { data, usage: used } = await call({
      system,
      user: buildUserMessage(segment, segments.length > 1 && !segment.title ? { title: source.title } : undefined),
      schema: TRANSLATION_SCHEMA as unknown as Record<string, unknown>,
      schemaName: 'listing_translation',
      maxTokens: maxTokensFor(listingChars(segment)),
      timeoutMs: CALL_TIMEOUT_MS,
      // A second attempt would outlive a short function; the job runner retries instead.
      retry: false,
      model,
    });
    usage.tokensIn += used.tokensIn;
    usage.tokensOut += used.tokensOut;
    const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
    return { title: clean(data?.title), description: clean(data?.description), body: clean(data?.body) };
  });

  const merged: ListingText = {
    title: answers[0]?.title ?? '',
    description: answers.map((answer) => answer.description).filter(Boolean).join('\n\n'),
    body: answers.map((answer) => answer.body).filter(Boolean).join('\n\n'),
  };
  checkTranslation(source, merged);
  return { ...merged, model, ...usage, costMicroEur: costMicroEur(model, usage.tokensIn, usage.tokensOut) };
}
