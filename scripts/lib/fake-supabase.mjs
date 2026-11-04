/**
 * A small in-memory stand-in for the Supabase client: just enough of the
 * query builder (select/insert/update/delete, eq/in/is/neq/lt/gte filters,
 * order/limit, single/maybeSingle) for the payment routes to run against it.
 * Row-level security is NOT modelled; the routes' own checks are what is under test.
 * activity_events.dedupe_key is unique, like the real table.
 * `options.missingColumns` ({ table: ['col', …] }) makes a column not exist yet,
 * the way a database looks before a migration has run: naming it errors (42703).
 */
let seq = 0;

export function createFakeDb(seed = {}, options = {}) {
  const tables = {};
  for (const [name, rows] of Object.entries(seed)) tables[name] = rows.map((row) => ({ ...row }));
  const table = (name) => (tables[name] ??= []);

  class Query {
    constructor(name) {
      this.name = name;
      this.op = 'select';
      this.tests = [];
      this.sort = [];
      this.limitTo = null;
      this.wantOne = null;
      this.returning = false;
    }
    touch(cols) {
      const missing = options.missingColumns?.[this.name] ?? [];
      const hit = cols.find((col) => missing.includes(col));
      if (hit && !this.missing) this.missing = hit;
      return this;
    }
    select(_cols, opts) {
      if (typeof _cols === 'string') this.touch(_cols.split(',').map((c) => c.trim().split(/[\s:(]/)[0]));
      if (this.op !== 'select') this.returning = true;
      if (opts?.count) { this.wantCount = true; this.head = Boolean(opts.head); }
      return this;
    }
    insert(rows) { this.op = 'insert'; this.rows = Array.isArray(rows) ? rows : [rows]; this.rows.forEach((row) => this.touch(Object.keys(row))); return this; }
    upsert(rows, opts = {}) { this.op = 'upsert'; this.rows = Array.isArray(rows) ? rows : [rows]; this.conflict = opts.onConflict ?? 'id'; this.ignoreDuplicates = Boolean(opts.ignoreDuplicates); return this; }
    update(patch) { this.op = 'update'; this.patch = patch; return this.touch(Object.keys(patch)); }
    delete() { this.op = 'delete'; return this; }
    eq(col, value) { this.touch([col]); this.tests.push((row) => row[col] === value); return this; }
    neq(col, value) { this.tests.push((row) => row[col] !== value); return this; }
    in(col, values) { this.tests.push((row) => values.includes(row[col])); return this; }
    is(col, value) { this.touch([col]); this.tests.push((row) => (row[col] ?? null) === value); return this; }
    lt(col, value) { this.tests.push((row) => row[col] < value); return this; }
    gte(col, value) { this.tests.push((row) => row[col] >= value); return this; }
    // A filter written as an OR string is not interpreted: tests seed only the rows they want back.
    or() { return this; }
    not(col, op, value) { this.touch([col]); if (op === 'is') this.tests.push((row) => (row[col] ?? null) !== value); return this; }
    order(col, { ascending = true } = {}) { this.sort.push([col, ascending]); return this; }
    limit(n) { this.limitTo = n; return this; }
    range() { return this; }
    single() { this.wantOne = 'single'; return this; }
    maybeSingle() { this.wantOne = 'maybe'; return this; }
    then(resolve, reject) { return Promise.resolve(this.run()).then(resolve, reject); }

    run() {
      if (this.missing) return { data: null, error: { code: '42703', message: `column ${this.name}.${this.missing} does not exist` } };
      const rows = table(this.name);
      if (this.op === 'insert') {
        const added = [];
        for (const input of this.rows) {
          const row = { id: `${this.name}-${++seq}`, ...input };
          if (this.name === 'activity_events' && row.dedupe_key && rows.some((r) => r.dedupe_key === row.dedupe_key)) {
            return { data: null, error: { message: 'duplicate key value violates unique constraint "activity_events_dedupe_key"' } };
          }
          // The partial unique index of migration 0043: one live job per listing and language.
          if (this.name === 'translation_jobs' && ['requested', 'queued', 'running'].includes(row.status ?? 'queued')
            && rows.some((r) => r.property_id === row.property_id && r.locale === row.locale && ['requested', 'queued', 'running'].includes(r.status))) {
            return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint "translation_jobs_one_live_per_locale"' } };
          }
          rows.push(this.name === 'translation_jobs' ? { status: 'queued', attempts: 0, overwrite: false, created_at: new Date().toISOString(), ...row } : row);
          added.push(row);
        }
        return this.finish(this.returning ? added : null);
      }
      if (this.op === 'upsert') {
        for (const input of this.rows) {
          const found = rows.find((r) => r[this.conflict] === input[this.conflict]);
          if (found) { if (!this.ignoreDuplicates) Object.assign(found, input); } else rows.push({ id: `${this.name}-${++seq}`, ...input });
        }
        return this.finish(null);
      }
      let hit = rows.filter((row) => this.tests.every((test) => test(row)));
      if (this.op === 'update') {
        hit.forEach((row) => Object.assign(row, this.patch));
        return this.finish(this.returning ? hit : null);
      }
      if (this.op === 'delete') {
        tables[this.name] = rows.filter((row) => !hit.includes(row));
        return this.finish(null);
      }
      for (const [col, asc] of [...this.sort].reverse()) hit = [...hit].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1));
      if (this.limitTo != null) hit = hit.slice(0, this.limitTo);
      return this.finish(hit);
    }

    finish(data) {
      if (this.wantCount) return { data: this.head ? null : data, error: null, count: (data ?? []).length };
      if (!this.wantOne) return { data, error: null };
      const list = data ?? [];
      if (this.wantOne === 'single' && list.length !== 1) return { data: null, error: { message: 'expected one row' } };
      return { data: list[0] ?? null, error: null };
    }
  }

  return { tables, table, client: { from: (name) => new Query(name), rpc: async (name, args) => (options.rpc?.[name] ? options.rpc[name](args, tables) : { data: null, error: null }) } };
}
