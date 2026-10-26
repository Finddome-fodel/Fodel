// usage: node tsv2tr.cjs NN file.tsv  (cols: id it pt el cs sl sv da no fi et lv lt)
const fs=require('fs');const [nn,f]=process.argv.slice(2);
const L=['it','pt','el','cs','sl','sv','da','no','fi','et','lv','lt'];
const t=Object.fromEntries(require('./table.json').map(r=>[r.i,r]));
let a='',b='',bad=0;
const ph=s=>(s.match(/\$\{[^}]*\}|\{[a-zA-Z_]+\}|%[sd]/g)||[]).sort().join('|');
for(const line of fs.readFileSync(f,'utf8').split('\n')){ if(!line.trim())continue;
 const c=line.split('\t'); if(c.length!==13){console.error('COLS',c.length,line.slice(0,60));bad++;continue}
 const id=+c[0]; const src=t[id]; if(!src){console.error('NOID',id);bad++;continue}
 const en=src.en??src.fr; a+='@'+id+'\n'; b+='@'+id+'\n';
 L.forEach((l,k)=>{const v=c[k+1]; if(v!=='='&&ph(v)!==ph(en)){console.error('PH',id,l,v.slice(0,80));bad++}
  (k<6?(x=>a+=x):(x=>b+=x))(l+': '+v+'\n')});
}
fs.writeFileSync(`tr/t${nn}a.txt`,a);fs.writeFileSync(`tr/t${nn}b.txt`,b);
console.log('ids',(a.match(/^@/gm)||[]).length,'bad',bad);
