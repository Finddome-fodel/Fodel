/**
 * Module hooks for running site sources under plain Node (≥ 22.18, which
 * strips types): resolves the `~/…` alias from tsconfig.json to src/, adds the
 * `.ts` extension Astro/Vite let the sources leave out, and loads JSON
 * imports that carry no import attribute. Registered by scripts that import
 * many site modules (scripts/check-i18n-keys.mjs).
 */
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = new URL('../../src/', import.meta.url);

function withExtension(url) {
  const file = fileURLToPath(url);
  if (existsSync(file) && statSync(file).isFile()) return url;
  for (const suffix of ['.ts', '.mjs', '.js', '/index.ts']) {
    if (existsSync(file + suffix)) return pathToFileURL(file + suffix).href;
  }
  return url;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('~/')) return { url: withExtension(new URL(specifier.slice(2), SRC).href), shortCircuit: true };
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    return { url: withExtension(new URL(specifier, context.parentURL).href), shortCircuit: true };
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith('.json')) return next(url, { ...context, importAttributes: { type: 'json' } });
  return next(url, context);
}
