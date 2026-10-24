import type { APIRoute } from 'astro';
import { COUNTRIES } from '~/config/countries';
export const prerender = false;
const recent = new Map<string, number>();
/** Explicit user searches and pin moves only; no per-keystroke network requests. */
export const GET: APIRoute = async ({url,locals}) => {
  if (!locals.user) return Response.json({error:'unauthorized'},{status:401});
  const now=Date.now();
  if (now-(recent.get(locals.user.id)||0)<1000) return Response.json({error:'rate-limited'},{status:429});
  recent.set(locals.user.id,now);
  for (const [id,at] of recent) if(now-at>60000) recent.delete(id);
  const query=(url.searchParams.get('q')||'').trim().slice(0,200);
  const reverse=url.searchParams.has('lat');
  const lat=Number(url.searchParams.get('lat')),lng=Number(url.searchParams.get('lng'));
  const country=(url.searchParams.get('country')||'HU').toUpperCase();
  if (!(country in COUNTRIES) || (reverse && (!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)) || (!reverse && query.length<2)) return Response.json({error:'invalid'},{status:422});
  const base=process.env.GEOCODER_URL || 'https://photon.komoot.io';
  const target=new URL(reverse ? 'reverse' : 'api',base.replace(/\/?$/,'/'));
  target.searchParams.set('limit','5');
  if(reverse){target.searchParams.set('lat',String(lat));target.searchParams.set('lon',String(lng));}
  else {target.searchParams.set('q',query);target.searchParams.set('countrycode',country.toLowerCase());}
  try {
    const response=await fetch(target,{signal:AbortSignal.timeout(8000),headers:{'User-Agent':'FODEL/2.0 (+https://fodel.eu; info@fodel.eu)'}});
    if(!response.ok)throw new Error('unavailable');
    const json=await response.json();
    const results=(json.features||[]).filter((f:any)=>f.geometry?.type==='Point'&&Array.isArray(f.geometry.coordinates)&&Number.isFinite(f.geometry.coordinates[0])&&Number.isFinite(f.geometry.coordinates[1])&&Math.abs(f.geometry.coordinates[0])<=180&&Math.abs(f.geometry.coordinates[1])<=90).map((f:any)=>{
      const p=f.properties||{};
      return {lat:f.geometry.coordinates[1],lng:f.geometry.coordinates[0],country:String(p.countrycode||'').toUpperCase(),settlement:p.city||p.town||p.village||p.name||'',county:p.state||p.county||'',label:[p.name,p.city,p.state,p.country].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(', ')};
    }).filter((hit:any)=>hit.country in COUNTRIES && (reverse || hit.country===country));
    return Response.json({results},{headers:{'Cache-Control':'private, max-age=300'}});
  }catch{return Response.json({error:'unavailable'},{status:503});}
};
