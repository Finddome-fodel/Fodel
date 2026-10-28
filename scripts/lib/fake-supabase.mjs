/**
 * A small in-memory stand-in for the Supabase client: just enough of the
 * query builder (select/insert/update/delete, eq/in/is/neq/lt/gte filters,
 * order/limit, single/maybeSingle) for the payment routes to run against it.
 * Row-level security is NOT modelled; the routes' own checks are what is under test.
 * activity_events.dedupe_key is unique, like the real table.
 */
let seq = 0;

export function createFakeDb(seed = {}) {
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
    select() { if (this.op !== 'select') this.returning = true; return this; }
    insert(rows) { this.op = 'insert'; this.rows = Array.isArray(rows) ? rows : [rows]; return this; }
    update(patch) { this.op = 'update'; this.patch = patch; return this; }
    delete() { this.op = 'delete'; return this; }
    eq(col, value) { this.tests.push((row) => row[col] === value); return this; }
    neq(col, value) { this.tests.push((row) => row[col] !== value); return this; }
    in(col, values) { this.tests.push((row) => values.includes(row[col])); return this; }
    is(col, value) { this.tests.push((row) => (row[col] ?? null) === value); return this; }
    lt(col, value) { this.tests.push((row) => row[col] < value); return this; }
    gte(col, value) { this.tests.push((row) => row[col] >= value); return this; }
    order(col, { ascending = true } = {}) { this.sort.push([col, ascending]); return this; }
    limit(n) { this.limitTo = n; return this; }
    range() { return this; }
    single() { this.wantOne = 'single'; return this; }
    maybeSingle() { this.wantOne = 'maybe'; return this; }
    then(resolve, reject) { return Promise.resolve(this.run()).then(resolve, reject); }

    run() {
      const rows = table(this.name);
      if (this.op === 'insert') {
        const added = [];
        for (const input of this.rows) {
          const row = { id: `${this.name}-${++seq}`, ...input };
          if (this.name === 'activity_events' && row.dedupe_key && rows.some((r) => r.dedupe_key === row.dedupe_key)) {
            return { data: null, error: { message: 'duplicate key value violates unique constraint "activity_events_dedupe_key"' } };
          }
          rows.push(row);
          added.push(row);
        }
        return this.finish(this.returning ? added : null);
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
      if (!this.wantOne) return { data, error: null };
      const list = data ?? [];
      if (this.wantOne === 'single' && list.length !== 1) return { data: null, error: { message: 'expected one row' } };
      return { data: list[0] ?? null, error: null };
    }
  }

  return { tables, table, client: { from: (name) => new Query(name), rpc: async () => ({ data: null, error: null }) } };
}
