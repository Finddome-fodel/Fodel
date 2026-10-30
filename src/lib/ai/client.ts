/**
 * OpenAI client — a thin wrapper, not a framework. Two established patterns
 * this follows exactly: `isStripeEnabled()` for the on/off switch, and
 * send.ts's "no key → log what it would have done and carry on" for
 * degradation. Every caller must check `isAiEnabled()` before calling
 * `callOpenAiJson` — this file does not silently no-op, it throws, because a
 * caller that forgot the check is a bug worth surfacing, not swallowing.
 */

export function isAiEnabled(): boolean {
  return String(import.meta.env.AI_ENABLED) === 'true' && Boolean(import.meta.env.OPENAI_API_KEY);
}

export class AiError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const MODEL = 'gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 25_000;

/** Tests and local runs point this at a stub server; production uses OpenAI. */
function baseUrl(): string {
  return String(import.meta.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
}

export type AiUsage = { model: string; tokensIn: number; tokensOut: number };

/**
 * One strict-JSON-schema call, one retry, a hard timeout and a token cap.
 * Vercel's function timeout is why this must never be called from inside a
 * public form's POST handler — the caller (an admin action, never the
 * public submission endpoint) is what makes a 25s worst case acceptable.
 */
export async function callOpenAiJson<T>(opts: Parameters<typeof callOpenAiJsonWithUsage>[0]): Promise<T> {
  return (await callOpenAiJsonWithUsage<T>(opts)).data;
}

/** Same call, also returning the model and the token counts OpenAI reports (for the cost record). */
export async function callOpenAiJsonWithUsage<T>(opts: {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  schemaName: string;
  /** Images / files sent with the text (OpenAI content parts). The text in `user` always goes first. */
  userParts?: Record<string, unknown>[];
  maxTokens?: number;
  timeoutMs?: number;
  /** Heavier calls (images, PDFs) set false: a second 40s attempt would outlive the function. */
  retry?: boolean;
  /** Defaults to gpt-4o-mini. */
  model?: string;
}): Promise<{ data: T; usage: AiUsage }> {
  if (!isAiEnabled()) throw new AiError('ai-disabled');
  const key = import.meta.env.OPENAI_API_KEY;

  const model = opts.model || MODEL;
  // The GPT-5 and o-series models take max_completion_tokens; older ones max_tokens.
  const tokenKey = /^(gpt-5|o\d)/.test(model) ? 'max_completion_tokens' : 'max_tokens';

  const attempt = async (): Promise<{ data: T; usage: AiUsage }> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    try {
      const res = await fetch(`${baseUrl()}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: opts.system },
            { role: 'user', content: opts.userParts?.length ? [{ type: 'text', text: opts.user }, ...opts.userParts] : opts.user },
          ],
          [tokenKey]: opts.maxTokens ?? 900,
          response_format: {
            type: 'json_schema',
            json_schema: { name: opts.schemaName, schema: opts.schema, strict: true },
          },
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new AiError(`openai-${res.status}`, await res.text().catch(() => ''));
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string') throw new AiError('openai-empty-response');
      if (data.choices?.[0]?.finish_reason === 'length') throw new AiError('openai-truncated');
      return {
        data: JSON.parse(content) as T,
        usage: { model: String(data.model || model), tokensIn: Number(data.usage?.prompt_tokens) || 0, tokensOut: Number(data.usage?.completion_tokens) || 0 },
      };
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await attempt();
  } catch (firstError) {
    if (opts.retry === false) throw firstError;
    try {
      return await attempt();
    } catch {
      throw firstError;
    }
  }
}
