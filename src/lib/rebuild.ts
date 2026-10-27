/**
 * Asks Vercel for a fresh production build after a setting that is baked into the
 * prerendered pages (phone numbers, opening hours, package prices, the footer) has
 * been saved. The ~300 content pages are static on purpose, so without this the
 * new value only reaches them at the next deploy.
 *
 * Opt-in: set VERCEL_DEPLOY_HOOK_URL (Vercel → Settings → Git → Deploy Hooks, branch
 * main). Without it nothing happens and the pages catch up at the next deploy.
 * A failure is logged, never thrown — the setting itself has already been saved.
 * Saves less than a minute apart share one build.
 */
const MIN_GAP_MS = 60_000;
let lastRequest = 0;

export async function requestRebuild(): Promise<void> {
  const hook = import.meta.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook || Date.now() - lastRequest < MIN_GAP_MS) return;
  lastRequest = Date.now();
  try {
    const res = await fetch(hook, { method: 'POST', signal: AbortSignal.timeout(5000) });
    if (!res.ok) console.error('[rebuild] deploy hook answered', res.status);
  } catch (error) {
    console.error('[rebuild] deploy hook failed', error);
  }
}
