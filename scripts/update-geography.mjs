/** Refresh the checked-in GeoNames ADM1 snapshot. Keeps the exact 19 Hungarian counties + Budapest. */
import fs from 'node:fs/promises';
const target=new URL('../src/data/listing/regions.json',import.meta.url);
const current=JSON.parse(await fs.readFile(target,'utf8'));
const response=await fetch(current.source,{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`GeoNames download failed: ${response.status}`);
const countries=Object.fromEntries(Object.keys(current.countries).map(c=>[c,[]]));
for(const line of (await response.text()).split('\n')){
 const [id,name,,geonameId]=line.split('\t');
 const code=id?.split('.')[0];
 if(code in countries && id && name && geonameId)countries[code].push({id,name,geonameId});
}
for(const code of Object.keys(countries))if(current.countries[code].length>0&&!countries[code].length)throw new Error(`Incomplete source for ${code}; snapshot unchanged`);
countries.HU=current.countries.HU;
await fs.writeFile(target,JSON.stringify({...current,countries,retrievedAt:new Date().toISOString().slice(0,10)},null,2)+'\n');
console.log('Updated Europe administrative areas from GeoNames (CC BY 4.0). Hungarian counties retained.');
