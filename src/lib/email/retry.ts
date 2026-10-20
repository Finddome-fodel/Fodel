/**
 * The retry policy for sending mail, kept free of any SDK so it can be tested
 * on its own (scripts/test-rules.mjs): up to three attempts, doubling the wait
 * between them, and no retry at all for a rejection a second try cannot fix.
 */
export const MAX_ATTEMPTS = 3;
export const RETRY_BASE_MS = 400;

/** Resend rejects outright on a bad payload; retrying that just wastes time. */
export function isRetryable(error: unknown): boolean {
  const status = (error as { statusCode?: number; status?: number } | null)?.statusCode
    ?? (error as { status?: number } | null)?.status;
  if (typeof status !== 'number') return true; // network-level failure, worth another go
  return status === 429 || status >= 500;
}

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Runs `attempt` until it reports no error. `attempt` returns the provider's
 * error (or throws); `null` means delivered. Resolves to whether it was sent
 * and how many tries it took.
 */
export async function withRetry(
  attempt: () => Promise<unknown>,
  sleep: (ms: number) => Promise<void> = realSleep
): Promise<{ sent: boolean; attempts: number; error?: unknown }> {
  let last: unknown;
  for (let n = 1; n <= MAX_ATTEMPTS; n++) {
    try {
      last = await attempt();
      if (!last) return { sent: true, attempts: n };
    } catch (error) {
      last = error;
    }
    if (!isRetryable(last) || n === MAX_ATTEMPTS) return { sent: false, attempts: n, error: last };
    await sleep(RETRY_BASE_MS * 2 ** (n - 1));
  }
  return { sent: false, attempts: MAX_ATTEMPTS, error: last };
}
