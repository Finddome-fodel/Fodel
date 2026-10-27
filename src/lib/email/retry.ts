/**
 * The retry policy for sending mail, kept free of any SDK so it can be tested
 * on its own (scripts/test-rules.mjs): up to three attempts, doubling the wait
 * between them, and no retry at all for a rejection a second try cannot fix.
 * A rate-limit rejection waits at least a second: Resend allows 2 requests a
 * second and one form sends three or four mails back to back.
 */
export const MAX_ATTEMPTS = 3;
export const RETRY_BASE_MS = 400;
export const RATE_LIMIT_WAIT_MS = 1000;

/** Resend rejects outright on a bad payload; retrying that just wastes time. */
export function isRetryable(error: unknown): boolean {
  const status = (error as { statusCode?: number; status?: number } | null)?.statusCode
    ?? (error as { status?: number } | null)?.status;
  if (typeof status !== 'number') return true; // network-level failure, worth another go
  return status === 429 || status >= 500;
}

/** How long to wait after the `attempt`-th failure (1-based). */
export function retryDelay(error: unknown, attempt: number): number {
  const status = (error as { statusCode?: number; status?: number } | null)?.statusCode
    ?? (error as { status?: number } | null)?.status;
  const backoff = RETRY_BASE_MS * 2 ** (attempt - 1);
  return status === 429 ? Math.max(backoff, RATE_LIMIT_WAIT_MS) : backoff;
}

/**
 * A provider call that hangs must not hold up the request that triggered the
 * mail (a submit used to wait on every recipient before answering). The
 * timeout carries a 408 so `isRetryable` does not try again: the mail may well
 * have gone out, and a second send would deliver it twice.
 */
export const SEND_TIMEOUT_MS = 5000;

export function withTimeout<T>(work: Promise<T>, ms: number = SEND_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const expiry = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error(`no answer from the mail provider after ${ms} ms`), { statusCode: 408 })), ms);
  });
  return Promise.race([work, expiry]).finally(() => clearTimeout(timer));
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
    await sleep(retryDelay(last, n));
  }
  return { sent: false, attempts: MAX_ATTEMPTS, error: last };
}
