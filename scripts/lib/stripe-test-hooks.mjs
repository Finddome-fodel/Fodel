/**
 * Module hooks for scripts/test-stripe-flow.mjs: the site's own webhook and
 * checkout routes run unchanged, with only the outside world swapped out —
 * the database (an in-memory fake), Stripe's API, e-mail and the invoice
 * store. `import.meta.env` (which Vite provides, Node does not) is read from
 * globalThis.__ENV instead.
 */
import { resolve as aliasResolve, load as aliasLoad } from './src-alias-hooks.mjs';

const STUBS = {
  '/src/lib/supabase-server.ts': 'supabase-server.ts',
  '/src/lib/supabase.ts': 'supabase.ts',
  '/src/lib/stripe.ts': 'stripe.ts',
  '/src/lib/email/send.ts': 'email-send.ts',
  '/src/lib/invoicing/store.ts': 'invoicing-store.ts',
};

export async function resolve(specifier, context, next) {
  const resolved = await aliasResolve(specifier, context, next);
  if (!context.parentURL?.includes('/scripts/lib/stubs/')) {
    for (const [suffix, stub] of Object.entries(STUBS)) {
      if (resolved.url.endsWith(suffix)) return { url: new URL(`./stubs/${stub}`, import.meta.url).href, shortCircuit: true };
    }
  }
  return resolved;
}

export async function load(url, context, next) {
  const loaded = await aliasLoad(url, context, next);
  if (url.includes('/src/') && loaded.source) {
    let text = String(loaded.source);
    // Node only strips types; it cannot compile `constructor(public code: T)`. Rewrite that one shape.
    text = text.replace(/constructor\(public (\w+)\s*:\s*[^)]*\)\s*\{\s*super\(([^)]*)\);/g, 'constructor($1) { super($2); this.$1 = $1;');
    text = text.replaceAll('import.meta.env', 'globalThis.__ENV');
    return { ...loaded, source: text };
  }
  return loaded;
}
