/** The setup wizard clears a coordinate message as soon as the map, the geocoder or typing fills the fields. */
import {test,expect} from '@playwright/test';
const id='10000000-0000-4000-8000-000000000001';
const fixture='http://127.0.0.1:54401';
const setSession=async(page:any)=>{
 const user='00000000-0000-4000-8000-000000000001';
 const now=Math.floor(Date.now()/1000),part=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const email='owner@fodel-test.local';
 const session={access_token:`${part({alg:'HS256',typ:'JWT'})}.${part({sub:user,email,aud:'authenticated',role:'authenticated',iat:now,exp:now+86400})}.test-fixture-signature`,refresh_token:'local-test-fixture',expires_in:86400,expires_at:now+86400,token_type:'bearer',user:{id:user,email,role:'authenticated',aud:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()}};
 await page.context().clearCookies();
 await page.context().addCookies([{name:'sb-127-auth-token',value:'base64-'+part(session),url:'http://127.0.0.1:4402',httpOnly:true,sameSite:'Lax'}]);
};
test.describe('Setup wizard: coordinate message',()=>{
 test.skip(process.env.E2E_EDITOR_FIXTURE!=='1','Requires the isolated local editor fixture');
 test.beforeEach(async({page,baseURL})=>{
  expect(new URL(baseURL!).hostname).toBe('127.0.0.1');
  expect((await (await page.request.get(`${fixture}/health`)).json()).fixture).toBe('fodel-editor-local');
  await page.request.post(`${fixture}/__reset`);
  await setSession(page);
  await page.goto(`/portal/properties/${id}/setup#property`);
  // Both coordinates empty, then "Next": the wizard marks them as required.
  await page.locator('#f-lat').fill('');await page.locator('#f-lng').fill('');
  await page.locator('[data-next]').click();
  await expect(page.locator('#f-lat')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#f-lng')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#f-lat').locator('xpath=ancestor::*[contains(@class,"field")][1]').locator('.error')).toBeVisible();
 });
 test('values set from code (map click, geocoder, dragged pin) clear both messages',async({page})=>{
  // What the map does: set both values, announce once on longitude.
  await page.evaluate(()=>{
   const lat=document.querySelector<HTMLInputElement>('[name="lat"]')!,lng=document.querySelector<HTMLInputElement>('[name="lng"]')!;
   lat.value='46.851234';lng.value='17.561234';lng.dispatchEvent(new Event('change',{bubbles:true}));
  });
  for(const name of ['lat','lng']){
   await expect(page.locator(`#f-${name}`)).not.toHaveAttribute('aria-invalid','true');
   await expect(page.locator(`#f-${name}`).locator('xpath=ancestor::*[contains(@class,"field")][1]').locator('.error')).toBeHidden();
  }
 });
 test('typing clears the message, and a bad value shows it again',async({page})=>{
  await page.locator('#f-lat').fill('46,851234');await page.locator('#f-lng').fill('17,561234');
  await expect(page.locator('#f-lat')).not.toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#f-lng')).not.toHaveAttribute('aria-invalid','true');
  await page.locator('#f-lat').fill('');await page.locator('#f-lat').press('Tab');
  await page.locator('[data-next]').click();
  await expect(page.locator('#f-lat')).toHaveAttribute('aria-invalid','true');
 });
});
