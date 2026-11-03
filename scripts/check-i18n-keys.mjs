/**
 * Every French string has a counterpart in every other site language, with the
 * same placeholders and HTML — and a coverage report for the later languages.
 *
 *   npm run check:i18n              keys, placeholders, HTML; coverage report
 *   npm run check:i18n -- --strict  …and fail on any later-language string still in English
 *
 * Imports the translation sources directly (Node ≥ 22.18 strips types; the
 * hooks in scripts/lib/src-alias-hooks.mjs resolve `~/`; on an older Node run
 * `npx tsx scripts/check-i18n-keys.mjs`). It walks every export of the modules
 * below, finds each object that is keyed by language (it has both `fr` and
 * `hu` or `en` keys, as UI, COPY, CONTENT, LEGAL, FAQ and the small L10n
 * records do), and checks every path under `fr` against each language in
 * TARGETS:
 *
 *   - strings and lists exist and are non-empty; functions exist with the same arity;
 *   - placeholders match: {name}, {{name}}, %s / %d / %1$s and the like;
 *   - HTML tags match (the same tags, the same number of times; attributes free);
 *   - functions, called with marker arguments, put every argument French puts
 *     into its text into theirs too — so `${name}` cannot be dropped or typed
 *     as literal text in a translation.
 *
 * The per-language email and validation copies, which are separate modules,
 * are compared module to module.
 *
 * Coverage: for the later languages (sr, uk, tr, he, ar, ru, zh) a string or
 * function result identical to English is counted as not yet translated.
 * Strings that are rightly the same in a language (brand names, units, codes)
 * go in scripts/i18n-same-as-en.json under that language.
 */
import fs from 'node:fs';
import { register } from 'node:module';

// The site's sources use the `~/` alias and extensionless imports.
register('./lib/src-alias-hooks.mjs', import.meta.url);
const { UI } = await import('../src/i18n/ui.ts');
const { COPY } = await import('../src/data/copy.ts');
const { CONTENT } = await import('../src/data/pages-content.ts');
const { LEGAL } = await import('../src/data/pages-legal.ts');
const { FAQ } = await import('../src/data/faq.ts');

const EARLIER = ['es', 'pl', 'ro', 'sk', 'it', 'pt', 'el', 'cs', 'sl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt'];
const LATER = ['sr', 'uk', 'tr', 'he', 'ar', 'ru', 'zh'];
const TARGETS = [...EARLIER, ...LATER];
const STRICT = process.argv.includes('--strict');
const SAME_AS_EN = JSON.parse(fs.readFileSync(new URL('./i18n-same-as-en.json', import.meta.url), 'utf8'));
const sameOk = Object.fromEntries(LATER.map((l) => [l, new Set([...(SAME_AS_EN['*'] ?? []), ...(SAME_AS_EN[l] ?? [])])]));

const problems = [];
let checked = 0;
/** Per later language: strings compared with English, and those still identical to it. */
const coverage = Object.fromEntries(LATER.map((l) => [l, { total: 0, same: [] }]));

// ── Placeholders and markup ──────────────────────────────────────────────────

const PLACEHOLDER = /\{\{\s*[\w.]+\s*\}\}|\{[A-Za-z_][\w.]*\}|%(?:\d+\$)?[sdif]/g;
const TAG = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?\/?>/g;
const tally = (list) => list.reduce((map, item) => map.set(item, (map.get(item) ?? 0) + 1), new Map());
const same = (a, b) => a.size === b.size && [...a].every(([k, n]) => b.get(k) === n);
const show = (map) => [...map].map(([k, n]) => (n > 1 ? `${k}×${n}` : k)).join(' ') || 'none';
const placeholders = (text) => tally(text.match(PLACEHOLDER) ?? []);
const tags = (text) => tally([...text.matchAll(TAG)].map((m) => (m[0].startsWith('</') ? '/' : '') + m[1].toLowerCase()));

function markup(fr, other, where) {
  const pf = placeholders(fr), po = placeholders(other);
  if (!same(pf, po)) problems.push(`${where}: placeholders ${show(po)}, French has ${show(pf)}`);
  const tf = tags(fr), to = tags(other);
  if (!same(tf, to)) problems.push(`${where}: HTML tags ${show(to)}, French has ${show(tf)}`);
}

// Marker arguments: a function's text must carry every argument French's does.
const MARKS = Array.from({ length: 6 }, (_, i) => `\u27E6${i}\u27E7`);
function call(fn) {
  try {
    const out = fn(...MARKS.slice(0, Math.max(fn.length, 1)));
    return typeof out === 'string' ? out : null;
  } catch {
    return null;
  }
}

function count(lang, other, en, where) {
  if (!LATER.includes(lang) || typeof en !== 'string' || !en.trim()) return;
  const bare = en.replace(new RegExp(MARKS.join('|'), 'g'), '').replace(/[\s\d.,:;!?()[\]{}"'’“”«»%+\-–—/·•|&@#*=<>€$£¥₺₴₽₪﷼²³]/g, '');
  coverage[lang].total++;
  // Nothing translatable (numbers, punctuation, units) or allowed to stay as it is.
  if (!bare || /^[A-Z0-9]{1,4}$/.test(bare) || sameOk[lang].has(en.trim())) return;
  if (other === en) coverage[lang].same.push(where);
}

/** Compare one French value with its translation, recursively; `en` rides along for coverage. */
function compare(fr, other, en, where, lang) {
  if (typeof fr === 'string') {
    checked++;
    if (typeof other !== 'string') return problems.push(`${where}: missing`);
    if (fr.trim() && !other.trim()) return problems.push(`${where}: empty`);
    markup(fr, other, where);
    count(lang, other, en, where);
    return;
  }
  if (typeof fr === 'function') {
    checked++;
    if (typeof other !== 'function') return problems.push(`${where}: missing function`);
    if (other.length !== fr.length) problems.push(`${where}: takes ${other.length} arguments, French takes ${fr.length}`);
    const outFr = call(fr), outOther = call(other);
    if (outFr !== null && outOther !== null) {
      const lost = MARKS.filter((m) => outFr.includes(m) && !outOther.includes(m));
      if (lost.length) problems.push(`${where}: drops argument${lost.length > 1 ? 's' : ''} ${lost.map((m) => MARKS.indexOf(m) + 1).join(', ')} that French puts in its text`);
      markup(outFr.replace(/\u27E6\d\u27E7/g, ''), outOther.replace(/\u27E6\d\u27E7/g, ''), where);
      if (typeof en === 'function') count(lang, outOther, call(en), where);
    }
    return;
  }
  if (Array.isArray(fr)) {
    if (!Array.isArray(other)) return problems.push(`${where}: missing list`);
    if (fr.length && !other.length) return problems.push(`${where}: empty list`);
    // Lists are compared item by item when they line up; prose may legitimately
    // be split into a different number of paragraphs, so only the shorter run is walked.
    for (let i = 0; i < Math.min(fr.length, other.length); i++) compare(fr[i], other[i], Array.isArray(en) ? en[i] : undefined, `${where}[${i}]`, lang);
    return;
  }
  if (fr && typeof fr === 'object') {
    if (!other || typeof other !== 'object') return problems.push(`${where}: missing`);
    for (const key of Object.keys(fr)) compare(fr[key], other[key], en && typeof en === 'object' ? en[key] : undefined, `${where}.${key}`, lang);
  }
}

const byLanguage = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) && 'fr' in value && ('hu' in value || 'en' in value);

/** Find every language-keyed object inside a module's exports. */
function walk(value, where, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (byLanguage(value)) {
    for (const l of TARGETS) compare(value.fr, value[l], value.en, `${where}.${l}`, l);
    return;
  }
  for (const [key, child] of Object.entries(value)) walk(child, `${where}.${key}`, seen);
}

const MODULES = [
  '../src/i18n/ui.ts',
  '../src/i18n/chrome.ts',
  '../src/i18n/fallback.ts',
  '../src/data/copy.ts',
  '../src/data/pages-content.ts',
  '../src/data/pages-legal.ts',
  '../src/data/faq.ts',
  '../src/data/photo-tips.ts',
  '../src/data/valuation-questions.ts',
  '../src/data/valuation-ui.ts',
  '../src/data/taxonomy-i18n.ts',
  '../src/data/features.ts',
  '../src/data/wall-materials.ts',
  '../src/config/company.ts',
  '../src/lib/listing-catalogue.ts',
];
const skipped = [];
for (const spec of MODULES) {
  try {
    const mod = await import(spec);
    for (const [name, value] of Object.entries(mod)) walk(value, `${spec.replace('../src/', '')}:${name}`);
  } catch (error) {
    skipped.push(`${spec}: ${error.message.split('\n')[0]}`);
  }
}

// The JSON catalogues of listing groups, options and features.
for (const name of ['groups', 'options', 'features']) {
  walk(JSON.parse(fs.readFileSync(new URL(`../src/data/listing/${name}.json`, import.meta.url), 'utf8')), `listing/${name}.json`);
}

// Module-per-language copies: email and validation wording.
for (const dir of ['../src/lib/email/copy', '../src/lib/validation-copy']) {
  let fr, en;
  try {
    fr = await import(`${dir}/fr.ts`);
    en = await import(`${dir}/en.ts`);
  } catch (error) {
    skipped.push(`${dir}/fr.ts: ${error.message.split('\n')[0]}`);
    continue;
  }
  const enValues = Object.values(en);
  for (const l of TARGETS) {
    try {
      const other = await import(`${dir}/${l}.ts`);
      const frValues = Object.values(fr);
      const otherValues = Object.values(other);
      if (frValues.length !== otherValues.length) problems.push(`${dir}/${l}.ts exports ${otherValues.length} values, fr exports ${frValues.length}`);
      for (let i = 0; i < Math.min(frValues.length, otherValues.length); i++) compare(frValues[i], otherValues[i], enValues[i], `${dir.replace('../src/', '')}/${l}.ts#${i}`, l);
    } catch (error) {
      problems.push(`${dir}/${l}.ts: ${error.message.split('\n')[0]}`);
    }
  }
}

// The big records must have every language at the top.
for (const [name, record] of Object.entries({ UI, COPY, CONTENT, LEGAL, FAQ })) {
  for (const l of TARGETS) if (!record[l]) problems.push(`${name}.${l} is missing`);
}

// ── Report ───────────────────────────────────────────────────────────────────

for (const line of skipped) console.log(`  ! skipped ${line}`);
console.log('\n  Translated (strings and function texts no longer identical to English):');
let untranslated = 0;
for (const l of LATER) {
  const { total, same: left } = coverage[l];
  untranslated += left.length;
  const pct = total ? (((total - left.length) / total) * 100).toFixed(1) : '100.0';
  console.log(`    ${l}  ${String(total - left.length).padStart(5)} / ${String(total).padEnd(5)} ${pct.padStart(5)} %${left.length ? `   (${left.length} still English)` : ''}`);
}
if (process.argv.includes('--list')) for (const l of LATER) for (const where of coverage[l].same) console.log(`    · ${where}`);
if (STRICT && untranslated) problems.push(`${untranslated} later-language strings are still in English (run with --list to see them; allow deliberate ones in scripts/i18n-same-as-en.json)`);

if (problems.length) {
  for (const line of problems) console.log(`  ✗ ${line}`);
  console.log(`\n${problems.length} problems in ${checked} French strings checked against ${TARGETS.join(', ')}.`);
  process.exit(1);
}
console.log(`\n  ✓ ${checked} French strings and functions present, non-empty and with matching placeholders and HTML in ${TARGETS.join(', ')}.`);
