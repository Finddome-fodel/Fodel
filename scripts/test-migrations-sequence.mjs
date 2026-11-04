/**
 * The November migrations are run by hand, in order, in the Supabase SQL Editor. This keeps that order honest:
 *
 *   - the numbers from 0046 on are unique and gapless (no two files share a number, none is skipped);
 *   - a file that adds an enum value contains nothing else (Postgres cannot use a new enum value in the
 *     transaction that adds it, so it is always a run of its own);
 *   - every file from 0046 on is run by the PGlite harness (scripts/test-listing-migration.mjs), which applies
 *     each one twice: the second run must change nothing;
 *   - every table or view a file creates in `public` has RLS and explicit grants in the same file (CLAUDE.md).
 *
 * The real 0001 → latest chain cannot run in PGlite (it needs Supabase's auth, vault and pg_cron), so the
 * harness builds the same schema state and replays the November files on top of it.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url).pathname;
const dir = root + 'supabase/migrations/';
const files = fs.readdirSync(dir).filter((f) => /^\d{4}_.+\.sql$/.test(f)).sort();
const november = files.filter((f) => Number(f.slice(0, 4)) >= 46);
const harness = fs.readFileSync(root + 'scripts/test-listing-migration.mjs', 'utf8');

let failed = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log('✓ ' + name);
  } catch (error) {
    failed++;
    console.error('✗ ' + name + '\n  ' + String(error.message).split('\n').join('\n  '));
  }
};

check('November migrations are numbered 0046 upward, each number once, none skipped', () => {
  const numbers = november.map((f) => Number(f.slice(0, 4)));
  assert.ok(numbers.length > 0, 'no November migrations found');
  assert.equal(numbers[0], 46, 'the sequence starts at 0046');
  assert.deepEqual([...new Set(numbers)], numbers, 'two files share a number: ' + november.join(', '));
  numbers.forEach((n, i) => assert.equal(n, 46 + i, `gap or reorder before ${november[i]}`));
});

const code = (sql) => sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '').trim();

check('a migration that adds an enum value contains nothing else', () => {
  for (const file of november) {
    const body = code(fs.readFileSync(dir + file, 'utf8'));
    const statements = body.split(';').map((s) => s.trim()).filter(Boolean);
    const adds = statements.filter((s) => /^alter\s+type\s+[\w."]+\s+add\s+value/i.test(s));
    if (adds.length === 0) {
      // A guarded `do $$ … add value … $$` block counts as adding a value too.
      assert.ok(!/add\s+value/i.test(body), `${file}: add value hidden in another statement`);
      continue;
    }
    assert.equal(adds.length, statements.length, `${file}: an enum value must be added in a file of its own, with nothing else`);
  }
});

check('every November migration is replayed twice by the PGlite harness', () => {
  for (const file of november) assert.ok(harness.includes(file), `${file} is not run by scripts/test-listing-migration.mjs`);
});

check('a table or view created in public has RLS and explicit grants in the same file', () => {
  for (const file of november) {
    const body = code(fs.readFileSync(dir + file, 'utf8'));
    for (const match of body.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s*\(/gi)) {
      const table = match[1];
      assert.match(body, new RegExp(`alter\\s+table\\s+(?:public\\.)?${table}\\s+enable\\s+row\\s+level\\s+security`, 'i'), `${file}: ${table} has no RLS`);
      assert.match(body, new RegExp(`grant\\s+[a-z, ]+\\s+on\\s+(?:table\\s+)?(?:public\\.)?${table}\\s+to\\s+[a-z_, ]*service_role`, 'i'), `${file}: ${table} has no grant to service_role`);
    }
  }
});

check('every migration is idempotent in form: no bare create table / create index / add column', () => {
  for (const file of november) {
    const body = code(fs.readFileSync(dir + file, 'utf8'));
    for (const m of body.matchAll(/\bcreate\s+(?:unique\s+)?(table|index)\s+(?!if\s+not\s+exists)/gi)) {
      assert.fail(`${file}: "create ${m[1]}" without "if not exists"`);
    }
    for (const m of body.matchAll(/\badd\s+column\s+(?!if\s+not\s+exists)/gi)) {
      assert.fail(`${file}: "add column" without "if not exists"`);
    }
  }
});

if (failed) {
  console.error(`\n${failed} migration sequence check(s) failed.`);
  process.exit(1);
}
console.log(`\n${november.length} November migrations, ${november[0].slice(0, 4)} to ${november.at(-1).slice(0, 4)}: in order, replayed twice, one run each for enum values.`);
