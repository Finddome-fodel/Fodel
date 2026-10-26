const fs=require('fs');const t=require('./table.json');
const target=+process.argv[2]||2600;let b=[],size=0,n=1;const out=[];
const flush=()=>{if(!b.length)return;fs.writeFileSync(`${__dirname}/src/s${String(n).padStart(2,'0')}.txt`,b.join('\n'));out.push(n+':'+size);n++;b=[];size=0};
fs.mkdirSync(__dirname+'/src',{recursive:true});
for(const e of t){const en=e.en, fr=e.fr;let s=`@${e.i} [${e.ctx[0].split('/').pop()}]\n`;
 if(en!==undefined&&en!==null) s+=`EN: ${en}\n`; if(fr!==undefined&&(en==null||/\$\{|«|nOf/.test(fr)&&fr!==en)) s+=`FR: ${fr}\n`; if(e.pl) s+=`PL: ${e.pl}\n`;
 b.push(s);size+=(en??fr).length;if(size>target)flush()}
flush();console.log(out.join(' '));
