/** Browser checks use only the explicitly enabled localhost in-memory fixture. */
import {test,expect} from '@playwright/test';
const id='10000000-0000-4000-8000-000000000001';
const path=`/portal/properties/${id}`;
const fixture='http://127.0.0.1:54401';
const setSession=async(page:any,role:'admin'|'owner')=>{
 const id=role==='admin'?'00000000-0000-4000-8000-000000000002':'00000000-0000-4000-8000-000000000001';
 const now=Math.floor(Date.now()/1000),part=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const email=`${role}@fodel-test.local`;
 const session={access_token:`${part({alg:'HS256',typ:'JWT'})}.${part({sub:id,email,aud:'authenticated',role:'authenticated',iat:now,exp:now+86400})}.test-fixture-signature`,refresh_token:'local-test-fixture',expires_in:86400,expires_at:now+86400,token_type:'bearer',user:{id,email,role:'authenticated',aud:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()}};
 await page.context().clearCookies();
 await page.context().addCookies([{name:'sb-127-auth-token',value:'base64-'+part(session),url:'http://127.0.0.1:4402',httpOnly:true,sameSite:'Lax'}]);
};
test.describe('European listing editor',()=>{
 test.skip(process.env.E2E_EDITOR_FIXTURE!=='1','Requires the isolated local editor fixture');
 test.beforeEach(async({page,baseURL})=>{
  expect(new URL(baseURL!).hostname).toBe('127.0.0.1');
  const health=await page.request.get(`${fixture}/health`);expect((await health.json()).fixture).toBe('fodel-editor-local');
  await page.request.post(`${fixture}/__reset`);
  await setSession(page,'admin');
 });
 test('nine groups, dependent subtypes, and relevant fields',async({page})=>{
  await page.goto(path);
  await expect(page.locator('#f-property_group option')).toHaveCount(9);
  await page.locator('#f-property_group').selectOption('land');
  await expect(page.locator('#f-property_subtype option')).toHaveCount(7);
  await page.locator('#f-property_subtype').selectOption('residential-plot');
  await expect(page.locator('#f-bedrooms')).toBeHidden();await expect(page.locator('#f-floor_m2')).toBeHidden();await expect(page.locator('#f-year_built')).toBeHidden();await expect(page.locator('#f-plot_m2')).toBeVisible();
  await page.locator('#f-property_group').selectOption('house');await page.locator('#f-property_subtype').selectOption('apartment');
  await expect(page.locator('#f-floor_m2')).toBeVisible();await expect(page.locator('#f-plot_m2')).toBeHidden();
 });
 test('the full admin navigation remains available',async({page},testInfo)=>{
  await page.goto('/portal/dashboard');
  const nav=page.locator('nav[aria-label="Portál navigáció"]');
  for(const href of ['/portal/inbox','/portal/enquiries','/portal/valuations','/portal/services','/portal/properties','/portal/database','/portal/users','/portal/content/blog','/portal/email','/portal/payments','/portal/invoices','/portal/settings']){
   await expect(nav.locator(`a[href="${href}"]`)).toBeAttached();
  }
  await expect(nav.locator('a[href="/portal/top10"]')).toHaveCount(0);
  await expect(page.locator('.pt-brand .tag')).toHaveText('Admin');
  await expect(page.getByRole('complementary',{name:'Helyi tesztelőnézet'})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('admin-navigation-preserved.png'),fullPage:false});
 });
 test('country-aware regions and manual coordinates',async({page})=>{
  await page.goto(path);await expect(page.locator('#listing-regions option')).toHaveCount(20);
  await page.locator('#f-country').selectOption('CH');await expect(page.locator('[data-region-label]')).toHaveText('Kanton');await expect(page.locator('#listing-regions option')).toHaveCount(26);
  await expect(page.locator('#f-county')).toHaveValue('');await expect(page.locator('#f-lat')).toHaveValue('');
  await page.locator('#f-lat').fill('46,123456');await page.locator('#f-lng').fill('8.123456');await page.locator('#f-lng').press('Tab');
  await expect(page.locator('[name="location_confirmed"]')).toHaveValue('yes');
  await expect(page.locator('#f-region')).not.toHaveAttribute('required','');
 });
 test('hectare conversion is reversible and precise',async({page})=>{
  await page.goto(path);
  await expect(page.locator('#f-plot_m2')).toHaveValue('4.25');
  const unit=page.locator('[name="plot_m2_unit"]');await unit.selectOption('m2');await expect(page.locator('#f-plot_m2')).toHaveValue('42500');
  await unit.selectOption('ha');await expect(page.locator('#f-plot_m2')).toHaveValue('4.25');
  await page.locator('#f-plot_m2').fill('0,0001');await unit.selectOption('m2');await expect(page.locator('#f-plot_m2')).toHaveValue('1');
 });
 test('unknown energy/build year and four text fields',async({page})=>{
  await page.goto(path);await expect(page.locator('#f-epc_class')).toBeHidden();
  await page.locator('#f-epc_status').selectOption('rated');await expect(page.locator('#f-epc_class')).toBeVisible();
  await page.locator('[name="year_built_unknown"]').check();await expect(page.locator('#f-year_built')).toBeDisabled();
  await expect(page.locator('[name="subtitle_hu"], [name="tag_hu"], [name="condition_hu"], [name="heating_hu"]')).toHaveCount(0);
  for(const name of ['title_hu','description_hu','body_hu','internal_note'])await expect(page.locator(`[name="${name}"]`)).toBeAttached();
 });
 test('only three promotions, with a quote request for the subtype',async({page})=>{
  await page.goto(path);await expect(page.locator('#curation .promotion')).toHaveCount(3);
  await expect(page.locator('[name="homepage_order"],[name="bargain"]')).toHaveCount(0);
  await expect(page.getByText('Top 10',{exact:false})).toHaveCount(0);
  await expect(page.locator('[name="topic_highlight_requested"]')).toBeAttached();
 });
 test('contact languages are searchable and retain selected values',async({page})=>{
  await page.goto(path);await page.locator('[data-language-search]').fill('olasz');
  await expect(page.getByRole('checkbox',{name:'olasz',exact:true})).toBeVisible();
  await expect(page.getByRole('checkbox',{name:'német',exact:true})).toBeVisible();
  await expect(page.getByRole('checkbox',{name:'albán',exact:true})).toBeHidden();
 });
 test('photo reordering retains the independently selected cover',async({page})=>{
  await page.goto(path);
  const first=page.locator('[data-media-grid] [data-media-id]').first();const hero=await first.getAttribute('data-media-id');
  await first.locator('[data-photo-move="1"]').click();
  await expect(page.locator('[data-media-grid] [data-media-id]').nth(1)).toHaveAttribute('data-media-id',hero!);
  await expect(page.locator(`[data-media-id="${hero}"]`)).toHaveAttribute('data-hero','true');
  await expect(page.locator('[data-replace-photo]')).toHaveCount(3);
  await expect(page.locator('.photo-meter')).toContainText('/ 20');
 });
 test('full save persists the private note and converts hectares once',async({page})=>{
  await page.goto(path);await page.locator('#f-internal_note').fill('LOCAL PRIVATE NOTE QA');
  await page.locator('#save-btn').click();await expect(page).toHaveURL(/saved=1/);
  await expect(page.locator('#f-internal_note')).toHaveValue('LOCAL PRIVATE NOTE QA');await expect(page.locator('#f-plot_m2')).toHaveValue('4.25');
  await expect(page.locator('#f-original_price')).toHaveValue('90000000');
 });
 test('owner setup uses the same property rules and preserves optional services',async({page})=>{
  await setSession(page,'owner');
  await page.goto(`${path}/setup#property`);await expect(page.locator('#f-property_group')).toBeVisible();
  await page.locator('#f-property_group').selectOption('agricultural');await page.locator('#f-property_subtype').selectOption('arable');
  await expect(page.locator('#f-floor_m2')).toBeHidden();
  await page.goto(`${path}/setup#description`);for(const name of ['title','description','body','internal_note'])await expect(page.locator(`[name="${name}"]`)).toBeVisible();
  await page.goto(`${path}/setup#review`);await expect(page.locator('[data-summary="property"]')).not.toHaveText('');
  await page.goto(`${path}/setup#package`);await expect(page.locator('[name="topicHighlight"]')).toBeVisible();await expect(page.locator('[name="service"]')).toHaveCount(3);
 });
 test('owner can ask for a Dutch-speaking agent; it is kept and listed in the review summary',async({page})=>{
  await setSession(page,'owner');
  await page.goto(`${path}/setup#package`);
  const box=page.locator('[name="dutchAgent"]');
  // The fixture keeps state across browser projects, so flip whatever it holds and expect the flip to stick.
  const before=await box.isChecked();
  // The price is agreed personally: the card shows words, and the photography premium is stated beside it.
  await expect(page.locator('.dutch .price')).toHaveText(/Egyedi ár/);await expect(page.locator('.dutch .photo')).toHaveText(/prémium/);
  const saved=page.waitForResponse((r)=>r.url().includes('/update')&&r.request().method()==='POST');
  await page.locator('label.card:has([name="dutchAgent"])').click();await expect(box).toBeChecked({checked:!before});await saved;
  await page.reload();await expect(page.locator('[name="dutchAgent"]')).toBeChecked({checked:!before});
  if(!before){await page.goto(`${path}/setup#review`);await expect(page.locator('[data-summary="package"]')).toContainText('Holland nyelvű ingatlanos');}
 });
 test('an approved listing leads with a highlighted Fizetés step and the pay box on top',async({page})=>{
  await page.request.patch(`${fixture}/rest/v1/properties?id=eq.${id}`,{data:{status:'awaiting_payment'}});
  await setSession(page,'owner');
  await page.goto(path);
  const first=page.locator('.ed-rail a').first();
  await expect(first).toHaveText(/Fizetés/);await expect(first).toHaveClass(/rail-pay/);
  await expect(page.locator('#pay-btn')).toBeVisible();
  // The pay box comes before the (read-only) form, not after it.
  const payTop=(await page.locator('#pay').boundingBox())!.y,formTop=(await page.locator('#editor-form').boundingBox())!.y;
  expect(payTop).toBeLessThan(formTop);
  await first.click();await expect(page).toHaveURL(/#pay$/);
 });
 test('a home asks for the old form\'s facts; land does not',async({page})=>{
  await page.goto(path);
  await page.locator('#f-property_group').selectOption('house');await page.locator('#f-property_subtype').selectOption('apartment');
  for(const name of ['rooms','half_rooms','floors','kitchens','toilets','bedrooms','bathrooms','cellar_m2','setting','street','postal_code'])await expect(page.locator(`#f-${name}`),name).toBeVisible();
  await expect(page.locator('[name="utilities"]').first()).toBeVisible();await expect(page.locator('[name="parking"]').first()).toBeVisible();
  await expect(page.locator('label[for="f-street"] .req')).toHaveText(/kötelező\)/);await expect(page.locator('label[for="f-street"] .req')).not.toHaveText(/nem/);
  await expect(page.locator('label[for="f-rooms"] .req')).not.toHaveText(/nem/);await expect(page.locator('#f-rooms')).not.toHaveAttribute('required','');
  await page.locator('#f-property_group').selectOption('land');await page.locator('#f-property_subtype').selectOption('residential-plot');
  for(const name of ['rooms','kitchens','toilets','cellar_m2'])await expect(page.locator(`#f-${name}`),name).toBeHidden();
  await expect(page.locator('[name="utilities"]').first()).toBeHidden();await expect(page.locator('[name="parking"]').first()).toBeHidden();
  await expect(page.locator('#f-extra_buildings')).toBeVisible();await expect(page.locator('label[for="f-street"] .req')).toHaveText(/nem kötelező/);
 });
 test('the new facts save, and the address stays private until it is shown',async({page,request})=>{
  await page.goto(path);
  await page.locator('#f-property_group').selectOption('house');await page.locator('#f-property_subtype').selectOption('apartment');
  const fill:Record<string,string>={rooms:'4',half_rooms:'1',floors:'2',kitchens:'1',toilets:'2',cellar_m2:'35'};
  for(const [name,value] of Object.entries(fill))await page.locator(`#f-${name}`).fill(value);
  await page.locator('#f-setting').selectOption('city');await page.locator('#f-street').fill('Kossuth u. 12.');await page.locator('#f-postal_code').fill('8254');
  await page.locator('[name="utilities"][value="water"]').check();await page.locator('[name="parking"][value="garage"]').check();
  await page.locator('#f-heard_from').selectOption('search');
  await page.locator('#save-btn').click();await expect(page).toHaveURL(/saved=1/);
  const rows=async(table:string)=>(await (await request.get(`${fixture}/rest/v1/${table}`)).json())[0];
  let row=await rows('properties'),secret=await rows('property_private');
  expect(row.details).toMatchObject({rooms:4,half_rooms:1,floors:2,kitchens:1,toilets:2,cellar_m2:35,setting:'city',utilities:['water','electricity'],parking:['garage','garden']});
  expect(row.public_address).toBeNull();expect(row.public_postal_code).toBeNull();
  expect(secret).toMatchObject({street:'Kossuth u. 12.',postal_code:'8254',heard_from:'search'});
  await expect(page.locator('#f-rooms')).toHaveValue('4');await expect(page.locator('#f-street')).toHaveValue('Kossuth u. 12.');await expect(page.locator('[name="address_public"]')).not.toBeChecked();
  await page.locator('[name="address_public"]').check();await expect(page.locator('#f-precision')).toHaveValue('exact');
  await page.locator('[name="address_public"]').uncheck();await expect(page.locator('#f-precision')).toHaveValue('approximate');
  await page.locator('[name="address_public"]').check();await page.locator('#save-btn').click();await expect(page).toHaveURL(/saved=1/);
  row=await rows('properties');expect(row.public_address).toBe('Kossuth u. 12.');expect(row.public_postal_code).toBe('8254');expect(row.precision).toBe('exact');
  await page.locator('[name="address_public"]').uncheck();await page.locator('#f-precision').selectOption('approximate');await page.locator('#save-btn').click();await expect(page).toHaveURL(/saved=1/);
  row=await rows('properties');expect(row.public_address).toBeNull();expect(row.precision).toBe('approximate');
 });
 test('the review step names what a home still needs and lands on the first empty field',async({page})=>{
  await setSession(page,'owner');
  await page.goto(`${path}/setup#review`);
  const item=page.locator('[data-missing] a',{hasText:'az ingatlan adatai'});await expect(item).toBeVisible();
  await expect(item).toContainText('a szintek száma');await expect(item).toContainText('a fűtés');await expect(item).not.toContainText('a cím');
  await item.click();
  await expect(page).toHaveURL(/#property$/);await expect(page.locator('#f-floors')).toBeFocused();await expect(page.locator('#f-floors')).toHaveClass(/su-flash/);
  for(const [name,value] of Object.entries({rooms:'3',floors:'1',kitchens:'1',toilets:'1'}))await page.locator(`#f-${name}`).fill(value);
  await page.locator('#f-heating_key').selectOption('none');
  await page.goto(`${path}/setup#review`);await expect(page.locator('[data-missing] a',{hasText:'az ingatlan adatai'})).toHaveCount(0);
 });
 test('responsive layout, with no client exceptions',async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(path);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),{message:`horizontal overflow at ${width}px`,timeout:3000}).toBeLessThanOrEqual(0);
   if(width===390||width===1440)await page.screenshot({path:testInfo.outputPath(`editor-${width}.png`),fullPage:false});
  }
  expect(errors).toEqual([]);
 });
});
