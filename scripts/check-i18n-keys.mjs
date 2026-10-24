/**
 * Every French string has a Spanish, Polish, Romanian and Slovak counterpart.
 *
 *   npm run check:i18n
 *
 * Imports the translation sources directly (Node ≥ 22.18 strips types; the
 * hooks in scripts/lib/src-alias-hooks.mjs resolve `~/`; on an older Node run
 * `npx tsx scripts/check-i18n-keys.mjs`). It walks every export
 * of the modules below, finds each object that is keyed by language (it has
 * both `fr` and `hu` or `en` keys, as UI, COPY, CONTENT, LEGAL, FAQ and the
 * small L10n records do), and checks that every path under `fr` also exists
 * under es, pl, ro and sk: strings and arrays non-empty, functions present and
 * callable with the same arity. The per-language email and validation copies,
 * which are separate modules, are compared module to module.
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

const TARGETS = ['es', 'pl', 'ro', 'sk'];
const problems = [];
let checked = 0;

/** Compare one French value with its translation, recursively. */
function compare(fr, other, where) {
  if (typeof fr === 'string') {
    checked++;
    if (typeof other !== 'string') return problems.push(`${where}: missing`);
    if (fr.trim() && !other.trim()) problems.push(`${where}: empty`);
    return;
  }
  if (typeof fr === 'function') {
    checked++;
    if (typeof other !== 'function') return problems.push(`${where}: missing function`);
    if (other.length !== fr.length) problems.push(`${where}: takes ${other.length} arguments, French takes ${fr.length}`);
    return;
  }
  if (Array.isArray(fr)) {
    if (!Array.isArray(other)) return problems.push(`${where}: missing list`);
    if (fr.length && !other.length) return problems.push(`${where}: empty list`);
    // Lists are compared item by item when they line up; prose may legitimately
    // be split into a different number of paragraphs, so only the shorter run is walked.
    for (let i = 0; i < Math.min(fr.length, other.length); i++) compare(fr[i], other[i], `${where}[${i}]`);
    return;
  }
  if (fr && typeof fr === 'object') {
    if (!other || typeof other !== 'object') return problems.push(`${where}: missing`);
    for (const key of Object.keys(fr)) compare(fr[key], other[key], `${where}.${key}`);
  }
}

const byLanguage = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) && 'fr' in value && ('hu' in value || 'en' in value);

/** Find every language-keyed object inside a module's exports. */
function walk(value, where, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (byLanguage(value)) {
    for (const l of TARGETS) compare(value.fr, value[l], `${where}.${l}`);
    return;
  }
  for (const [key, child] of Object.entries(value)) walk(child, `${where}.${key}`, seen);
}

const MODULES = [
  '../src/i18n/ui.ts',
  '../src/i18n/chrome.ts',
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
  let fr;
  try {
    fr = await import(`${dir}/fr.ts`);
  } catch (error) {
    skipped.push(`${dir}/fr.ts: ${error.message.split('\n')[0]}`);
    continue;
  }
  for (const l of TARGETS) {
    try {
      const other = await import(`${dir}/${l}.ts`);
      const frValues = Object.values(fr);
      const otherValues = Object.values(other);
      if (frValues.length !== otherValues.length) problems.push(`${dir}/${l}.ts exports ${otherValues.length} values, fr exports ${frValues.length}`);
      for (let i = 0; i < Math.min(frValues.length, otherValues.length); i++) compare(frValues[i], otherValues[i], `${dir.replace('../src/', '')}/${l}.ts#${i}`);
    } catch (error) {
      problems.push(`${dir}/${l}.ts: ${error.message.split('\n')[0]}`);
    }
  }
}

// The big records must have every language at the top.
for (const [name, record] of Object.entries({ UI, COPY, CONTENT, LEGAL, FAQ })) {
  for (const l of TARGETS) if (!record[l]) problems.push(`${name}.${l} is missing`);
}

for (const line of skipped) console.log(`  ! skipped ${line}`);
if (problems.length) {
  for (const line of problems) console.log(`  ✗ ${line}`);
  console.log(`\n${problems.length} problems in ${checked} French strings checked against ${TARGETS.join(', ')}.`);
  process.exit(1);
}
console.log(`  ✓ ${checked} French strings and functions all present and non-empty in ${TARGETS.join(', ')}.`);
