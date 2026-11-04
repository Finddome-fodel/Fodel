/**
 * The admin portal shows numbers as „1.000.000” (spec §7), through
 * src/lib/portal/num.ts (fmtInt, fmtDecimal, fmtHuf, fmtEur). Hungarian
 * Intl number formatting („1 000 000”) must not creep back in:
 *
 *   npm run check:portal-numbers   (part of `npm run verify`)
 *
 * Dates are fine (`toLocaleString('hu-HU', { year: … })`, DateTimeFormat).
 * Owner-facing screens that follow the owner's language pick the tag from a
 * map, which this check deliberately leaves alone.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOTS = ['src/pages/portal', 'src/components/portal', 'src/lib/portal'];
const HU = String.raw`['"\`]hu(?:-HU)?['"\`]`;
const RULES = [
  { re: new RegExp(String.raw`new\s+Intl\.NumberFormat\(\s*${HU}`, 'g'), why: 'Intl.NumberFormat with hu' },
  { re: new RegExp(String.raw`\.toLocaleString\(\s*${HU}\s*\)`, 'g'), why: 'toLocaleString(hu) without date options' },
  { re: new RegExp(String.raw`\.toLocaleString\(\s*${HU}\s*,\s*\{(?![^}]*\b(?:year|month|day|hour|minute|weekday)\b)[^}]*\}`, 'g'), why: 'toLocaleString(hu, number options)' },
];

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (/\.(astro|ts|tsx|js|mjs)$/.test(entry.name)) yield path;
  }
}

const problems = [];
for (const root of ROOTS) {
  for await (const file of files(root)) {
    const text = await readFile(file, 'utf8');
    for (const { re, why } of RULES) {
      for (const m of text.matchAll(re)) {
        const line = text.slice(0, m.index).split('\n').length;
        problems.push(`${relative(process.cwd(), file)}:${line}  ${why}: ${m[0]}`);
      }
    }
  }
}

if (problems.length) {
  console.error(`Portal numbers must use src/lib/portal/num.ts (fmtInt, fmtDecimal, fmtHuf, fmtEur):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('✓ portal numbers: no Hungarian Intl number formatting (1.000.000 via num.ts)');
