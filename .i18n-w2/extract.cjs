// Extract every French unit next to which the 12 new languages must be added.
const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const NEW = ['it','pt','el','cs','sl','sv','da','no','fi','et','lv','lt'];
const OLDL = ['hu','nl','en','de','fr','es','pl','ro','sk'];
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/node_modules|\/pages\/(hu|nl|en|de|fr|es|pl|ro|sk)$/.test(p)) walk(p, out); }
    else if (/\.(ts|astro|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}
const DEDICATED = /(-(en|de|fr|es|pl|ro|sk)\.ts$|\/copy\/(en|de|fr|es|pl|ro|sk|hu|nl)\.ts$|validation-copy\/\w\w\.ts$)/;
const files = walk(path.join(ROOT, 'src')).filter(f => !DEDICATED.test(f));
const units = [];
const odd = [];
function litNodes(node, sf) {
  const acc = [];
  const rec = n => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) { acc.push(n); return; }
    n.forEachChild(rec);
  };
  rec(node);
  return acc;
}
function skeleton(node, sf) {
  // text with literals blanked, used to compare fr vs sk structure
  let t = node.getText(sf); const base = node.getStart(sf);
  const ls = litNodes(node, sf);
  for (let k = ls.length - 1; k >= 0; k--) { const n = ls[k]; t = t.slice(0, n.getStart(sf) - base) + 'L' + t.slice(n.end - base); }
  return t.replace(/\s+/g, '');
}
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  const chunks = [];
  if (file.endsWith('.astro')) {
    const a = src.indexOf('---'); const b = src.indexOf('\n---', a + 3);
    if (a === 0 && b > 0) chunks.push({ code: src.slice(3, b), offset: 3 });
    // template part: also scan {...} expressions by parsing whole template as TSX is hard; scan objects via regex later
    chunks.push({ code: src.slice(b + 4), offset: b + 4, template: true });
  } else chunks.push({ code: src, offset: 0 });
  for (const ch of chunks) {
    const sf = ts.createSourceFile(file + (ch.template ? '.tsx' : ''), ch.code, ts.ScriptTarget.Latest, true, ch.template ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        const callee = node.expression.getText(sf);
        const args = node.arguments;
        const allLit = args.length && args.every(a => ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a) || ts.isTemplateExpression(a));
        let frI = -1, enI = -1;
        if (allLit && args.length === 9 && /^(x|t5|localizer\(\w+\)|say)$/.test(callee)) { frI = 4; enI = 2; }
        else if (allLit && args.length === 7 && callee === 't' && rel.endsWith('taxonomy-i18n.ts')) { frI = 2; enI = 0; }
        else if (args.length === 9 && /^(x|t5)$/.test(callee)) odd.push(`${rel}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line+1} call with non-literal args`);
        if (frI >= 0) {
          const last = args[args.length - 1];
          const multiline = sf.text.slice(args[args.length - 2].end, last.getStart(sf)).includes('\n');
          const ls = last.getStart(sf); const lineStart = sf.text.lastIndexOf('\n', ls) + 1;
          units.push({ file: rel, kind: 'call', insertAt: last.end + ch.offset, multiline, indent: multiline ? sf.text.slice(lineStart, ls) : '',
            strings: [{ raw: args[frI].getText(sf).slice(1, -1), quote: args[frI].getText(sf)[0], en: args[enI].getText(sf).slice(1, -1), sk: args[args.length-1].getText(sf).slice(1,-1), pl: args[args.length-3].getText(sf).slice(1,-1) }] });
        }
      }
      if (ts.isObjectLiteralExpression(node)) {
        const props = node.properties;
        const nm = p => p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : null;
        const names = props.map(nm);
        const frI = names.indexOf('fr'), skI = names.indexOf('sk');
        if (frI >= 0 && skI >= 0 && !names.includes('lt')) {
          const fp = props[frI], sp = props[skI];
          const line = sf.getLineAndCharacterOfPosition(fp.getStart(sf)).line + 1 + (ch.offset ? src.slice(0, ch.offset).split('\n').length - 1 : 0);
          if (!ts.isPropertyAssignment(fp) || !ts.isPropertyAssignment(sp)) { odd.push(`${rel}:${line} non-assignment fr/sk (${ts.SyntaxKind[fp.kind]})`); }
          else {
            const fi = fp.initializer, si = sp.initializer;
            const fl = litNodes(fi, sf);
            const enP = props[names.indexOf('en')]; const enL = enP && ts.isPropertyAssignment(enP) ? litNodes(enP.initializer, sf) : [];
            const plP = props[names.indexOf('pl')]; const plL = plP && ts.isPropertyAssignment(plP) ? litNodes(plP.initializer, sf) : [];
            const sl = litNodes(si, sf);
            const same = skeleton(fi, sf) === skeleton(si, sf);
            const nl = sf.text.slice(props[skI - 1].end, sp.getStart(sf)).includes('\n');
            const lineStart = sf.text.lastIndexOf('\n', sp.getStart(sf)) + 1;
            const u = { file: rel, kind: 'obj', line, insertAt: sp.end + ch.offset, multiline: nl, indent: nl ? sf.text.slice(lineStart, sp.getStart(sf)) : '',
              same, valueKind: ts.SyntaxKind[fi.kind], frValue: fi.getText(sf), skValue: si.getText(sf),
              strings: fl.map((n, k) => ({ raw: n.getText(sf).slice(1, -1), quote: n.getText(sf)[0], en: enL.length === fl.length ? enL[k].getText(sf).slice(1, -1) : undefined, sk: same ? sl[k].getText(sf).slice(1,-1) : undefined, pl: plL.length === fl.length ? plL[k].getText(sf).slice(1,-1) : undefined })) };
            if (!fl.length) { u.kind = 'obj-nolit'; }
            units.push(u);
          }
          return; // don't descend into language values
        }
      }
      node.forEachChild(visit);
    };
    visit(sf);
  }
}
fs.writeFileSync(path.join(__dirname, 'units.json'), JSON.stringify(units, null, 1));
const by = {}; for (const u of units) by[u.kind + (u.same === false ? '-diff' : '')] = (by[u.kind + (u.same === false ? '-diff' : '')] || 0) + 1;
console.log(by);
const strs = new Map();
for (const u of units) for (const s of u.strings || []) if (/\p{L}/u.test(s.raw)) strs.set(s.raw, s);
console.log('unique strings', strs.size, 'chars', [...strs.keys()].join('').length);
console.log(odd.join('\n'));
for (const u of units.filter(u => u.same === false)) console.log('DIFF', u.file, u.line, '| fr:', u.frValue.slice(0, 100).replace(/\n/g,' '), '| sk:', u.skValue.slice(0, 100).replace(/\n/g,' '));
for (const u of units.filter(u => u.kind === 'obj-nolit')) console.log('NOLIT', u.file, u.line, u.frValue.slice(0, 60), '|', u.skValue.slice(0,60));
