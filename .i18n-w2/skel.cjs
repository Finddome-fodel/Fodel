const ts=require('typescript'),fs=require('fs');
function skel(code){const sf=ts.createSourceFile('a.ts',code,ts.ScriptTarget.Latest,true);let out=code;const ls=[];const rec=n=>{if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){ls.push([n.getStart(sf),n.end,'S']);return}if(ts.isTemplateExpression(n)){ls.push([n.getStart(sf),n.end,'T']);return}n.forEachChild(rec)};rec(sf);for(let k=ls.length-1;k>=0;k--)out=out.slice(0,ls[k][0])+ls[k][2]+out.slice(ls[k][1]);return out.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'').split('\n').map(s=>s.trim()).filter(Boolean).join('\n')}
const [a,b]=process.argv.slice(2);
const ra=a.includes('@')?a.split('@'):[a];const rb=b.includes('@')?b.split('@'):[b];
const get=(r)=>{let t=fs.readFileSync(r[0],'utf8');if(r[1]){const [s,e]=r[1].split('-').map(Number);t=t.split('\n').slice(s-1,e).join('\n')}return t};
fs.writeFileSync('/tmp/sa',skel(get(ra)));fs.writeFileSync('/tmp/sb',skel(get(rb)));
