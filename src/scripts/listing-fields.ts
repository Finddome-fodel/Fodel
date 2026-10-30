import { PROPERTY_GROUPS, labelIn, energyScale } from '~/lib/listing-catalogue';
import { fieldRules, parkingFits, type ListingField } from '~/lib/listing-details';
import { COUNTRIES } from '~/config/countries';
import { regionsFor, regionLabel } from '~/config/countries';
import { parseLocaleNumber } from '~/lib/validation';
import type { RateSnapshot } from '~/lib/exchange-rates';

const coordinate = (s:string) => s.trim() ? Number(s.replace(/\s/g,'').replace(',','.')) : NaN;
const roots=[...document.querySelectorAll<HTMLElement>('[data-listing-fields]')];
const forms=[...new Set(roots.map(r=>r.closest('form')).filter((f):f is HTMLFormElement=>Boolean(f)))];
let rateRequest: Promise<RateSnapshot> | undefined;
const rates=()=>rateRequest??=fetch('/api/portal/exchange-rates').then(async r=>{if(!r.ok)throw new Error('rates');return r.json();}).catch(e=>{rateRequest=undefined;throw e;});
for(const form of forms){
  const locale=roots.find(r=>r.closest('form')===form)?.dataset.lang||'hu';
  const x=(hu:string,nl:string,en:string)=>locale==='hu'?hu:locale==='nl'?nl:en;
  const control=(n:string)=>form.elements.namedItem(n) as HTMLInputElement|HTMLSelectElement|null;
  const get=(n:string)=>control(n)?.value||'';
  const areaValue=(n:string)=>parseLocaleNumber(get(n));
  const group=()=>get('property_group')||roots.find(r=>r.closest('form')===form)?.dataset.group||'house';
  const subtype=()=>get('property_subtype')||roots.find(r=>r.closest('form')===form)?.dataset.subtype||'';
  const set=(n:string,v:string)=>{const c=control(n);if(c)c.value=v;};
  const root=roots.find(r=>r.closest('form')===form);
  const words={required:root?.dataset.wordRequired||'',optional:root?.dataset.wordOptional||''};
  // The same rules the server and the submit check use (src/lib/listing-details.ts): which facts this type has,
  // and which are required. A hidden fact keeps its value; the server ignores it for this type.
  const refresh=()=>{
    const rules=fieldRules(group(),subtype());
    for(const wrapper of form.querySelectorAll<HTMLElement>('[data-field]')){
      const rule=rules[wrapper.dataset.field as ListingField];
      if(!rule)continue;
      wrapper.hidden=rule==='hidden';
      const tag=wrapper.querySelector<HTMLElement>('.req');
      if(tag&&words.required)tag.textContent=rule==='required'?words.required:words.optional;
    }
    // Street has no wrapper of its own; it is always shown and required only for a home.
    const street=control('street')?.closest('.fld')?.querySelector<HTMLElement>('.req');
    if(street&&words.required)street.textContent=rules.street==='required'?words.required:words.optional;
    for(const block of form.querySelectorAll<HTMLElement>('[data-field-block]'))block.hidden=![...block.querySelectorAll<HTMLElement>('[data-field]')].some(el=>!el.hidden);
    // Garden parking only where there is a garden; a ticked option stays visible so it can be unticked.
    for(const option of form.querySelectorAll<HTMLElement>('[data-parking-option]'))
      option.hidden=!option.querySelector<HTMLInputElement>('input')?.checked&&!parkingFits(option.dataset.parkingOption!,group(),subtype());
    for(const wrapper of form.querySelectorAll<HTMLElement>('[data-feature-groups]')){
      const selected=wrapper.querySelector<HTMLInputElement>('input')?.checked;
      const groups=(wrapper.dataset.featureGroups||'').split(',').filter(Boolean);
      const subtypes=(wrapper.dataset.featureSubtypes||'').split(',').filter(Boolean);
      wrapper.hidden=!selected && ((groups.length>0&&!groups.includes(group()))||(subtypes.length>0&&!subtypes.includes(subtype())));
    }
    for(const section of form.querySelectorAll<HTMLElement>('[data-feature-section]'))section.hidden=![...section.querySelectorAll<HTMLElement>('[data-feature-groups]')].some(el=>!el.hidden);
  };
  control('property_group')?.addEventListener('change',()=>{
    const select=control('property_subtype') as HTMLSelectElement;
    select.replaceChildren(new Option(x('Válasszon altípust','Kies een subtype','Choose a subtype'),''),...(PROPERTY_GROUPS.find(g=>g.key===group())?.subtypes||[]).map(s=>new Option(labelIn(s.labels,locale),s.key)));
    for(const root of roots.filter(r=>r.closest('form')===form)){root.dataset.group=group();root.dataset.subtype='';}
    refresh();
  });
  control('property_subtype')?.addEventListener('change',refresh);
  refresh();
  for(const unit of form.querySelectorAll<HTMLSelectElement>('[data-area-unit]')){
    const name=unit.dataset.areaUnit!;
    const input=control(name)!;
    let previous='m2';
    const equivalent=()=>{
      const raw=get(name).trim();
      const n=unit.value==='ha'&&/^\d+[.,]\d+$/.test(raw)?Number(raw.replace(',','.')):areaValue(name),out=unit.closest('.lf-area')?.querySelector<HTMLElement>('[data-area-equivalent]');
      if(out)out.textContent=n!=null&&n>0?`= ${(unit.value==='ha'?n*10000:n/10000).toLocaleString(locale,{maximumFractionDigits:6})} ${unit.value==='ha'?'m²':'ha'}`:'';
    };
    unit.addEventListener('change',()=>{
      const raw=get(name).trim();
      const n=previous==='ha'&&/^\d+[.,]\d+$/.test(raw)?Number(raw.replace(',','.')):areaValue(name);
      if(n!=null)input.value=String(Number((previous==='ha'?n*10000:n/10000).toPrecision(12)));
      previous=unit.value;equivalent();
    });
    input.addEventListener('input',equivalent);equivalent();
    // Hectares are the natural starting unit for agricultural land.
    if(group()==='agricultural'&&name==='plot_m2') {unit.value='ha';unit.dispatchEvent(new Event('change'));}
  }
  // A public address must be pinned exactly, so ticking it chooses the exact location (the server enforces the same).
  const showAddress=control('address_public') as HTMLInputElement|null;
  // Unticking hands the choice back to what the owner had picked before.
  let before:string|null=null;
  const syncAddress=()=>{
    const precision=control('precision') as HTMLSelectElement|null;
    if(!precision)return;
    if(showAddress?.checked){before??=precision.value;precision.value='exact';}
    else if(before!==null){precision.value=before;before=null;}
  };
  showAddress?.addEventListener('change',syncAddress);
  const unknown=control('year_built_unknown') as HTMLInputElement|null;
  const syncYear=()=>{const year=control('year_built');if(year)year.disabled=Boolean(unknown?.checked);};
  unknown?.addEventListener('change',syncYear);syncYear();
  let priceSequence=0;
  async function showPrice(){
    const seq=++priceSequence;
    const amount=parseLocaleNumber(get('original_price'));
    const out=form.querySelector<HTMLOutputElement>('[data-price-conversion]');
    const note=form.querySelector<HTMLElement>('[data-rate-note]');
    if(!out||!amount||amount<=0)return;
    out.textContent=x('Átszámítás…','Omrekenen…','Converting…');
    try{
      const snapshot=await rates();if(seq!==priceSequence)return;
      const rate=snapshot.rates[get('original_currency')];if(!rate)throw new Error('rates');
      const eur=Math.round(amount/rate*100)/100;
      form.dataset.priceHuf=String(Math.round(eur*snapshot.rates.HUF));
      out.textContent=`≈ ${new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(eur)}`;
      if(note)note.textContent=`${snapshot.source} · ${snapshot.date} · 1 EUR = ${rate} ${get('original_currency')}`;
      form.dispatchEvent(new CustomEvent('listing:price'));
    }catch{if(seq===priceSequence)out.textContent=x('Az árfolyam most nem érhető el. Próbálja újra a mentést később; korábbi árfolyamát megőrizzük.','De wisselkoers is nu niet beschikbaar. Probeer later opnieuw; de vorige koers blijft bewaard.','Exchange rates are unavailable. Try saving again later; the existing rate is preserved.');}
  }
  control('original_price')?.addEventListener('change',()=>void showPrice());
  control('original_currency')?.addEventListener('change',()=>void showPrice());
  // The first estimate is needed for the package tier; stored prices remain unchanged until the amount/currency changes.
  if(control('original_price')&&!form.dataset.priceHuf)form.dataset.priceHuf=roots.find(r=>r.closest('form')===form)?.dataset.initialPriceHuf||'0';
  // Energy: the class is asked only when there is a certificate.
  const syncEnergy=()=>{
    const rating=form.querySelector<HTMLElement>('[data-energy-rating]');
    const yes=form.querySelector<HTMLInputElement>('input[name="epc_has"][value="yes"]');
    if(rating)rating.hidden=!yes?.checked;
  };
  for(const radio of form.querySelectorAll<HTMLInputElement>('input[name="epc_has"]'))radio.addEventListener('change',syncEnergy);
  syncEnergy();
  // "No heating" / "Not known" replace the other choices, and ticking anything else clears them.
  for(const grid of form.querySelectorAll<HTMLElement>('[data-exclusive]')){
    const exclusive=(grid.dataset.exclusive||'').split(',').filter(Boolean);
    grid.addEventListener('change',event=>{
      const box=event.target as HTMLInputElement;
      if(!box.checked)return;
      for(const other of grid.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
        if(other!==box&&(exclusive.includes(box.value)||exclusive.includes(other.value)))other.checked=false;
    });
  }
  // The rating follows the property's country: a list on its official scale, or free text where we have none.
  function refreshEnergy(code:string){
    const select=form.querySelector<HTMLSelectElement>('[data-energy-select]'),text=form.querySelector<HTMLInputElement>('[data-energy-text]');
    if(!select||!text)return;
    const scale=energyScale(code),current=select.disabled?text.value:select.value;
    select.hidden=select.disabled=!scale;text.hidden=text.disabled=Boolean(scale);
    if(scale){
      select.replaceChildren(new Option(x('Nem adom meg','Niet opgeven','Not stated'),''),...scale.map(v=>new Option(v,v,false,v===current)));
    } else text.value=current;
    const hint=form.querySelector<HTMLElement>('[data-energy-hint]'),name=COUNTRIES[code]?.labels[locale as 'hu'|'nl'|'en']??code;
    if(hint)hint.textContent=scale?`${x('A tanúsítványon szereplő osztály','De klasse op het certificaat','The class shown on the certificate')} (${name}: ${scale[0]}–${scale[scale.length-1]}).`:x('Írja be úgy, ahogy a tanúsítványon szerepel.','Neem de waarde over zoals die op het certificaat staat.','Enter it exactly as it appears on the certificate.');
  }
  const locationRoot=form.querySelector<HTMLElement>('[data-location-map]');
  if(!locationRoot)continue;
  const status=form.querySelector<HTMLElement>('[data-location-status]')!;
  const country=control('country')!;
  let places: [string,string,string,number][]=[];
  let loadedPlaces=false;
  async function localPlaces(){
    if(!loadedPlaces){loadedPlaces=true;try{const r=await fetch('/data/telepulesek.json');places=await r.json();}catch{loadedPlaces=false;}}
    const list=form.querySelector<HTMLDataListElement>('#listing-settlements');
    if(list)list.replaceChildren(...(country.value==='HU'?places.filter(p=>p[3]!==0).map(p=>new Option(p[1])):[]));
  }
  control('settlement')?.addEventListener('focus',()=>{if(country.value==='HU')void localPlaces();});
  control('settlement')?.addEventListener('change',()=>{
    if(country.value!=='HU')return;
    const match=places.find(p=>p[3]!==0&&p[1].localeCompare(get('settlement'),'hu',{sensitivity:'base'})===0);
    const county=places.find(p=>p[3]===0&&p[0]===match?.[2])?.[1].replace(/ vármegye$/,'');
    if(county)set('county',county);
  });
  function refreshCountry(clear=false){
    const datalist=form.querySelector<HTMLDataListElement>('#listing-regions');
    datalist?.replaceChildren(...regionsFor(country.value).map(r=>new Option(r.name)));
    const label=form.querySelector<HTMLElement>('[data-region-label]');if(label)label.textContent=regionLabel(country.value,locale);
    refreshEnergy(country.value);
    if(clear){set('county','');set('region','');set('settlement','');set('lat','');set('lng','');set('location_confirmed','');marker?.remove();void localPlaces();}
  }
  country.addEventListener('change',()=>{reverseSequence++;refreshCountry(true);});
  let map: import('maplibre-gl').Map|undefined,marker:import('maplibre-gl').Marker|undefined;
  let reverseSequence=0;
  const coords=():[number,number]|null=>{const lat=coordinate(get('lat')),lng=coordinate(get('lng'));return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?[lng,lat]:null;};
  type Hit={lat:number;lng:number;country:string;settlement:string;county:string;label:string};
  // Place fields the owner typed are theirs: a pin click may only fill what is empty or what an earlier lookup filled.
  const filled=new Set<string>();
  for(const name of ['settlement','county'])control(name)?.addEventListener('input',()=>filled.delete(name));
  const writable=(name:string)=>!get(name).trim()||filled.has(name);
  function applyPlace(hit:Hit,move:boolean,keepTyped=false){
    if(hit.country!==country.value){set('country',hit.country);refreshCountry();set('region','');}
    const fill=(name:string,value:string)=>{if(value&&(!keepTyped||writable(name))){set(name,value);filled.add(name);}};
    fill('settlement',hit.settlement);
    fill('county',hit.county.replace(/ (vármegye|County)$/,''));
    if(move){set('lat',String(hit.lat));set('lng',String(hit.lng));}
    control('lng')?.dispatchEvent(new Event('change',{bubbles:true}));
  }
  // The geocoder answers one request a second per person; wait our turn instead of drawing a 429.
  let lastLookup=0;
  async function lookup(url:string){
    const wait=lastLookup+1100-Date.now();if(wait>0)await new Promise(r=>setTimeout(r,wait));
    lastLookup=Date.now();return fetch(url);
  }
  async function reverse(){
    const point=coords();if(!point)return;const seq=++reverseSequence;
    const oldSettlement=get('settlement');
    try{
      const response=await lookup(`/api/portal/geocode?lat=${point[1]}&lng=${point[0]}&country=${country.value}`);
      if(!response.ok)throw new Error('lookup');const json=await response.json();if(seq!==reverseSequence||get('settlement')!==oldSettlement)return;
      const hit:Hit|undefined=json.results?.[0];
      // A pin dropped outside the chosen country must not quietly rewrite the country, county and settlement the owner picked.
      if(hit&&hit.country!==country.value){status.textContent=x(`A jelölő másik országban van (${hit.label}). Az országot és a helyadatokat nem módosítottuk; helyezze át a jelölőt, vagy válassza ki az országot.`,`De pin staat in een ander land (${hit.label}). Land en locatiegegevens zijn niet gewijzigd; verplaats de pin of kies het land.`,`The pin is in another country (${hit.label}). We left the country and location details unchanged; move the pin or choose the country.`);return;}
      if(hit){
        const kept=get('settlement').trim()&&!writable('settlement')&&hit.settlement&&hit.settlement.localeCompare(get('settlement').trim(),locale,{sensitivity:'base'})!==0;
        applyPlace(hit,false,true);
        status.textContent=kept?x(`A jelölő ${hit.label} közelében van; az Ön által megadott települést megtartottuk. Ellenőrizze, hogy a jelölő a jó helyen áll-e.`,`De pin staat bij ${hit.label}; de door u ingevulde plaats is behouden. Controleer of de pin goed staat.`,`The pin is near ${hit.label}; the locality you entered was kept. Check that the pin is in the right place.`)
          :x('A helyadatokat kitöltöttük. Kérjük, ellenőrizze őket.','Locatiegegevens ingevuld. Controleer ze alstublieft.','Location details filled in. Please check them.');
      }
      else if(get('settlement').trim())status.textContent=x('A beírt települést és megyét megtartottuk, csak a koordináták változtak.','De ingevulde plaats en provincie zijn behouden; alleen de coördinaten zijn gewijzigd.','The locality and county you entered were kept; only the coordinates changed.');
      else status.textContent=x('A koordináták megmaradnak. A települést kézzel is megadhatja.','De coördinaten blijven bewaard. U kunt de plaats handmatig invullen.','Coordinates are retained. Enter the locality manually if needed.');
    }catch{status.textContent=x('A helykereső most nem érhető el. A koordinátákat és a helyadatokat kézzel is megadhatja.','Plaats zoeken is nu niet beschikbaar. Vul de coördinaten en locatie handmatig in.','Place lookup is unavailable. You can still enter coordinates and location details manually.');}
  }
  async function syncPin(lookup:boolean){
    // The pin a new draft starts with is a placeholder for the form's required fields, not a location: show nothing until it is chosen.
    const point=coords();if(!point||!map||get('location_confirmed')!=='yes')return;
    if(!marker){const {Marker}=await import('maplibre-gl');marker=new Marker({color:'#102A43',draggable:true}).setLngLat(point).addTo(map);marker.on('dragend',()=>{const p=marker!.getLngLat();set('lat',p.lat.toFixed(6));set('lng',p.lng.toFixed(6));control('lng')?.dispatchEvent(new Event('change',{bubbles:true}));void reverse();});}
    else marker.setLngLat(point).addTo(map);
    map.easeTo({center:point,zoom:Math.max(map.getZoom(),11)});if(lookup)void reverse();
  }
  for(const name of ['lat','lng'])control(name)?.addEventListener('change',()=>{if(coords())set('location_confirmed','yes');void syncPin(false);});
  const observer=new IntersectionObserver(async entries=>{
    if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();
    try{
      const [gl,worker]=await Promise.all([import('maplibre-gl'),import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url')]);
      gl.setWorkerUrl(worker.default);locationRoot.replaceChildren();
      const point=coords(),chosen=Boolean(point)&&get('location_confirmed')==='yes';
      // Not chosen yet: the whole country (or Europe), so a click lands where the owner means rather than on a default town.
      map=new gl.Map({container:locationRoot,style:'https://tiles.openfreemap.org/styles/liberty',center:chosen?point!:country.value==='HU'&&point?point:[15,50],zoom:chosen?11:country.value==='HU'&&point?6:3});
      map.addControl(new gl.NavigationControl(),'top-right');
      let mapFailed=false;map.on('error',(e:any)=>{if(e?.sourceId)return;if(!mapFailed){mapFailed=true;status.textContent=x('A térkép nem tölthető be. A koordinátamezők továbbra is használhatók.','De kaart kon niet laden. De coördinatenvelden blijven beschikbaar.','The map could not load. Coordinate fields remain available.');}});
      map.on('click',e=>{set('lat',e.lngLat.lat.toFixed(6));set('lng',e.lngLat.lng.toFixed(6));control('lng')?.dispatchEvent(new Event('change',{bubbles:true}));void reverse();});
      void syncPin(false);
      new ResizeObserver(()=>map?.resize()).observe(locationRoot);
    }catch{locationRoot.textContent=x('A térkép nem tölthető be. Adja meg a koordinátákat az alábbi mezőkben.','De kaart kon niet laden. Vul hieronder de coördinaten in.','The map could not load. Enter coordinates below.');}
  });observer.observe(locationRoot);
  const searchButton=form.querySelector<HTMLButtonElement>('[data-place-search]')!;
  const query=form.querySelector<HTMLInputElement>('[data-place-query]')!;
  const results=form.querySelector<HTMLElement>('[data-place-results]')!;
  async function search(){
    const q=query.value.trim()||get('settlement');if(q.length<2){query.focus();return;}
    searchButton.disabled=true;results.replaceChildren();status.textContent=x('Hely keresése…','Plaats zoeken…','Finding a place…');
    try{
      const searchCountry=country.value;
      const r=await lookup(`/api/portal/geocode?q=${encodeURIComponent(q)}&country=${searchCountry}`);if(!r.ok)throw new Error('lookup');const json=await r.json();if(country.value!==searchCountry)return;
      const hits:Hit[]=json.results||[];
      // One match is the answer: no list to pick from, no extra click.
      if(hits.length===1){applyPlace(hits[0],true);status.textContent=x('A helyet megjelöltük. A jelölőt húzással pontosíthatja.','Locatie gemarkeerd. Versleep de pin om te verfijnen.','Location marked. Drag the pin to refine it.');return;}
      for(const hit of hits){const button=document.createElement('button');button.type='button';button.textContent=hit.label;button.addEventListener('click',()=>{applyPlace(hit,true);results.replaceChildren();status.textContent=x('A helyet megjelöltük. A jelölőt húzással pontosíthatja.','Locatie gemarkeerd. Versleep de pin om te verfijnen.','Location marked. Drag the pin to refine it.');});results.append(button);}
      status.textContent=results.children.length?x('Válassza ki a megfelelő helyet.','Kies de juiste locatie.','Choose the matching location.'):x('Nincs találat. A térképen vagy koordinátákkal is megadhatja.','Geen resultaten. Gebruik de kaart of coördinaten.','No results. Use the map or enter coordinates.');
    }catch{status.textContent=x('A helykereső most nem érhető el. A kézi megadás továbbra is működik.','Plaats zoeken is niet beschikbaar. Handmatige invoer blijft mogelijk.','Place search is unavailable. Manual entry still works.');}finally{searchButton.disabled=false;}
  }
  searchButton.addEventListener('click',()=>void search());query.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();void search();}});
}
