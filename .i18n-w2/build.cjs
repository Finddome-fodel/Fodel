// Build the master string table from inline units, JSON catalogues and EN template blocks.
const ts = require('typescript'), fs = require('fs'), path = require('path');
const W = __dirname;
const units = require('./units.json');
const BLOCKS = [
  { id: 'content', src: 'src/data/content-en.ts' },
  { id: 'copy', src: 'src/data/copy-en.ts' },
  { id: 'faq', src: 'src/data/faq-en.ts' },
  { id: 'legal', src: 'src/data/legal-en.ts' },
  { id: 'email', src: 'src/lib/email/copy/en.ts' },
  { id: 'ui', src: 'src/i18n/ui.ts', from: '\nconst EN: UiStrings = {', to: '\nconst DE: UiStrings = {' },
];
const table = []; const key = new Map();
function add(en, fr, ctx, extra = {}) {
  const k = (en ?? '') + '\u0000' + (fr ?? '');
  if (key.has(k)) { const e = table[key.get(k)]; if (!e.ctx.includes(ctx)) e.ctx.push(ctx); return e.i; }
  const e = { i: table.length, en, fr, ctx: [ctx], ...extra };
  key.set(k, e.i); table.push(e); return e.i;
}
// 1 inline units
for (const u of units) {
  if (u.kind !== 'call' && !(u.kind === 'obj' && u.same)) continue;
  if (/portal\/labels|portal\/newsletter|requested-extras|content\/blog\/(\[id\]|index)|valuations\/\[id\]|lib\/format|lib\/orders\.ts|i18n\/fallback/.test(u.file) && !(u.file.endsWith('orders.ts') && u.line < 90)) { u.manual = true; continue; }
  for (const s of u.strings) {
    if (!/\p{L}/u.test(s.raw) || (/^[a-z0-9_.\-]+$/.test(s.raw) && s.raw === s.sk)) { s.id = null; continue; }
    const extra = {};
    if (s.pl && /nOf\(|pluralOf|\?/.test(s.pl) && !/nOf\(|\?/.test(s.raw)) extra.pl = s.pl;
    s.id = add(s.en, s.raw, u.file, extra);
  }
}
fs.writeFileSync(path.join(W, 'units.json'), JSON.stringify(units, null, 1));
// 2 JSON
const jsonRefs = [];
for (const n of ['groups', 'options', 'features']) {
  const j = JSON.parse(fs.readFileSync(`src/data/listing/${n}.json`, 'utf8'));
  const w = o => { if (Array.isArray(o)) o.forEach(w); else if (o && typeof o === 'object') { if (typeof o.fr === 'string' && o.sk !== undefined) add(o.en, o.fr, `listing/${n}.json`); else Object.values(o).forEach(w); } };
  w(j);
}
// 3 blocks: literals in EN template regions
const skipped = [];
for (const b of BLOCKS) {
  let text = fs.readFileSync(b.src, 'utf8');
  let start = 0, end = text.length;
  if (b.from) { start = text.indexOf(b.from) + 1; end = text.indexOf(b.to) + 1; }
  const code = text.slice(start, end);
  const sf = ts.createSourceFile('b.ts', code, ts.ScriptTarget.Latest, true);
  const lits = [];
  const rec = (n, inType) => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return;
    if (ts.isTypeNode(n) || ts.isTypeAliasDeclaration(n) || ts.isInterfaceDeclaration(n)) return;
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) {
      const t = n.getText(sf); const raw = t.slice(1, -1);
      const p = n.parent;
      const isKey = ts.isPropertyAssignment(p) && p.name === n;
      const isElemArg = ts.isElementAccessExpression(p);
      const isCmp = ts.isBinaryExpression(p) && /=/.test(p.operatorToken.getText(sf));
      const isCase = ts.isCaseClause(p);
      const callArg = ts.isCallExpression(p) && p.arguments.includes(n) ? p.expression.getText(sf) : null;
      const idLike = /^[a-z0-9_.\-/:]+$/.test(raw) && !/ /.test(raw);
      let skip = isKey || isElemArg || isCmp || isCase || !/\p{L}/u.test(raw);
      if (!skip && callArg && idLike) skip = true;
      if (!skip && idLike && b.id !== 'ui') skip = true;
      if (!skip) lits.push({ start: n.getStart(sf) + start, end: n.end + start, quote: t[0], raw, id: add(raw, undefined, b.id) });
      return;
    }
    n.forEachChild(c => rec(c));
  };
  rec(sf);
  b.lits = lits;
}
fs.writeFileSync(path.join(W, 'blocks.json'), JSON.stringify(BLOCKS, null, 1));
fs.writeFileSync(path.join(W, 'table.json'), JSON.stringify(table, null, 1));
console.log('strings', table.length, 'chars', table.reduce((a, e) => a + (e.en ?? e.fr).length, 0));
console.log('idlike kept:\n' + skipped.join('\n'));
