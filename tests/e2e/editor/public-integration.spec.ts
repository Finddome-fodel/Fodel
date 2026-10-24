import {test,expect} from '@playwright/test';
import {LOCALES,path as routePath} from '../../../src/i18n/ui';
test.skip(process.env.E2E_EDITOR_FIXTURE!=='1','Uses the isolated local editor fixture');
test('the homepage keeps a loaded hero image without published listings',async({page,request,baseURL},testInfo)=>{
 expect(new URL(baseURL!).hostname).toBe('127.0.0.1');
 const fixture='http://127.0.0.1:54401';
 expect((await (await request.get(`${fixture}/health`)).json()).fixture).toBe('fodel-editor-local');
 await request.post(`${fixture}/__reset`);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const locale of LOCALES){
  await page.goto(routePath(locale,'home'));
  const image=page.locator('[data-hero-fallback] img');
  await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(image).toHaveAttribute('loading','eager');
  expect(await image.getAttribute('alt')).toBeTruthy();
  await expect(page.locator('.hero-card,.hero-dots')).toHaveCount(0);
 }
 await page.goto('/hu/');
 await expect.poll(()=>page.locator('.hero-stage').evaluate(el=>el.getAnimations().every(a=>a.playState==='finished'))).toBe(true);
 await page.screenshot({path:testInfo.outputPath('home-hero-restored.png'),fullPage:false});
 expect(errors).toEqual([]);
});

test('a published property still supplies the hero photograph and link',async({page,request,baseURL})=>{
 expect(new URL(baseURL!).hostname).toBe('127.0.0.1');
 const fixture='http://127.0.0.1:54401';
 expect((await (await request.get(`${fixture}/health`)).json()).fixture).toBe('fodel-editor-local');
 await request.post(`${fixture}/__reset`);
 try{
  await request.patch(`${fixture}/rest/v1/properties?id=eq.10000000-0000-4000-8000-000000000001`,{data:{status:'published',published_at:new Date().toISOString()}});
  await page.goto('/hu/');
  await expect(page.locator('[data-hero-fallback]')).toHaveCount(0);
  const card=page.locator('.hero-card[data-active]');
  await expect(card).toContainText('1234');
  expect(await card.getAttribute('href')).toMatch(/1234/);
  const image=page.locator('.hero-slide[data-active] img');
  await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 }finally{await request.post(`${fixture}/__reset`);}
});

test('public category selectors, photo limits and retired routes across all nine languages',async({request,baseURL})=>{
 expect(new URL(baseURL!).hostname).toBe('127.0.0.1');
 for(const locale of LOCALES){
  const home=await request.get(routePath(locale,'home'));expect(home.status()).toBe(200);const html=await home.text();
  expect(html).not.toMatch(/href="[^\"]*top-10/);
  const selector=html.match(/<select[^>]*id="s-type"[^>]*>([\s\S]*?)<\/select>/)?.[1];expect(selector).toBeTruthy();expect(selector?.match(/<option\b/g)?.length).toBe(10);
  const properties=await request.get(routePath(locale,'properties'));expect(properties.status()).toBe(200);expect(await properties.text()).not.toMatch(/name="bargain"/);
  const prices=await request.get(routePath(locale,'priceList'));expect(prices.status()).toBe(200);const priceHtml=await prices.text();expect(priceHtml).not.toMatch(/Unlimited number of photos|Onbeperkt aantal foto|Korlátlan számú kép|Unbegrenzte Anzahl Fotos|photos illimité/);
  const old=await request.get(`/${locale}/top-10/`,{maxRedirects:0});expect(old.status()).toBe(301);expect(old.headers().location).toBe(routePath(locale,'properties'));
 }
});
test('home and listings remain responsive after category and curation changes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const locale of ['hu','en','de'] as const)for(const key of ['home','properties'] as const){
  await page.goto(routePath(locale,key));for(const width of [320,1440]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(0);}
 }
 expect(errors).toEqual([]);
});

test('changing a category clears the old subtype',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/hu/ingatlanok/?type=house&subtype=apartment');
 await expect(page.locator('[name="subtype"]')).toHaveValue('apartment');
 if(await page.locator('#cookie-reject').isVisible())await page.locator('#cookie-reject').click();
 await page.locator('label.opt').filter({has:page.locator('input[name="type"][value="industrial"]')}).click();
 await expect(page).toHaveURL(/type=industrial/);
 expect(new URL(page.url()).searchParams.has('subtype')).toBe(false);
 await expect(page.locator('[name="subtype"] option')).toHaveCount(7);
});
