/**
 * Saving one step of the guided listing setup
 * (src/pages/portal/properties/[id]/setup.astro).
 *
 * Called from the existing update endpoint (api/portal/properties/[id]/
 * update.ts) when the posted form names a `step`. Each step writes only its
 * own fields, so autosave on blur and "Continue" never touch another step's
 * answers. Everything goes through the signed-in person's own session client:
 * Row-Level Security still decides that an owner may edit only their own
 * draft. Photos and billing details keep their own endpoints, and submitting
 * is the existing status action.
 *
 * Data lives where the 1.x intake already put it — `properties.package`,
 * `properties.requested_extras` (migration 0015), the listing's translation
 * row and the seller columns — so the admin's review screen, suggestSelection()
 * and the order builder keep the existing workflow. European intake fields and private notes use migration 0022.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { localeFrom } from '~/i18n/ui';
import type { PortalLang } from '~/lib/portal/auth-copy';
import { getCompany, getTaxonomy } from '~/lib/runtime-config';
import { listingCatalog, packageOf } from '~/lib/listing-packages';
import { TRANSLATION_LANGUAGES, isOnsiteServiceId } from '~/config/company';
import { readRequestedExtras } from '~/lib/portal/requested-extras';
import { createServiceRequest } from '~/lib/portal/service-requests';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { type FieldError } from '~/lib/validation';
import { getProperty } from '~/lib/portal/properties';
import { listingInput, ListingInputError, contactLanguages } from '~/lib/portal/listing-input';
import { HEARD_FROM_KEYS } from '~/lib/listing-details';

export const SETUP_STEPS = ['package', 'property', 'description'] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

export type StepResult = { ok: true } | { ok: false; error: string; errors?: Record<string, FieldError> };

type Existing = { id: string; owner_id: string | null; status: string; package: string };

/** The longest description the setup accepts — the same ceiling the 1.x form had. */
export const DESCRIPTION_MAX = 6000;

const str = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

export async function saveSetupStep(
  supabase: SupabaseClient,
  existing: Existing,
  step: SetupStep,
  form: FormData,
  ctx: { isAdmin: boolean; locale: PortalLang }
): Promise<StepResult> {
  if (step === 'package') return savePackage(supabase, existing, form);
  if (step === 'property') return saveProperty(supabase, existing, form);
  return saveDescription(supabase, existing, form, ctx.locale);
}

/* ── 1. Package, extras, on-site service ───────────────────────────────── */

async function savePackage(supabase: SupabaseClient, existing: Existing, form: FormData): Promise<StepResult> {
  const company = await getCompany();
  const catalog = listingCatalog(company.services);
  const chosen = catalog.packages.find((p) => p.id === str(form, 'package'));
  if (!chosen) return { ok: false, error: 'invalid', errors: { package: { code: 'required' } } };

  const translations = form
    .getAll('translations')
    .map(String)
    .filter((code, i, all) => (TRANSLATION_LANGUAGES as readonly string[]).includes(code) && all.indexOf(code) === i);
  const service = isOnsiteServiceId(str(form, 'service')) ? (str(form, 'service') as never) : null;

  const { error } = await supabase.from('properties').update({ package: chosen.id }).eq('id', existing.id);
  if (error) return { ok: false, error: 'save-failed' };

  // A request, never an order: the admin confirms every line at approval, and
  // prices always come from the catalogue (src/lib/orders.ts).
  const requested = readRequestedExtras({
    source: 'listing_editor',
    at: new Date().toISOString(),
    package: chosen.id,
    translations,
    categoryHighlight: form.get('categoryHighlight') === 'yes',
    homepageHighlight: form.get('homepageHighlight') === 'yes',
    topicHighlight: form.get('topicHighlight') === 'yes',
    // Only a package that sells video as an extra takes the request.
    video: chosen.video === 'extra' && form.get('video') === 'yes',
    service,
  });
  const { error: extrasError } = await supabase.from('properties').update({ requested_extras: requested }).eq('id', existing.id);
  if(extrasError)return {ok:false,error:'save-failed'};

  const {error:topicError}=await supabase.from('properties').update({topic_highlight_requested:form.get('topicHighlight')==='yes'}).eq('id',existing.id);
  if(topicError)return {ok:false,error:'save-failed'};
  const {error:promotionError}=await supabase.rpc('sync_listing_promotion_requests',{p_id:existing.id});
  if(promotionError)return {ok:false,error:'save-failed'};
  await syncService(supabase, existing, service);
  return { ok: true };
}

/**
 * The on-site service chosen in step 1 becomes (or stops being) a service
 * request the office schedules — the same record the editor's own service
 * card and the old public form created. A visit already scheduled is left
 * alone; changing that is a phone call, as the editor says too.
 */
async function syncService(supabase: SupabaseClient, existing: Existing, wanted: string | null) {
  try {
    const admin = createSupabaseAdminClient();
    const { data: open } = await admin
      .from('service_requests')
      .select('id, status, service_id')
      .eq('property_id', existing.id)
      .in('status', ['requested', 'scheduled'])
      .maybeSingle();
    if (open?.service_id === wanted) return;
    if (open && open.status !== 'requested') return;
    if (open) await admin.from('service_requests').update({ status: 'cancelled' }).eq('id', open.id);
    if (!wanted || !existing.owner_id) return;

    const { data: owner } = await admin
      .from('profiles')
      .select('full_name, email, phone, locale')
      .eq('id', existing.owner_id)
      .maybeSingle();
    await createServiceRequest(supabase, {
      serviceId: wanted as never,
      source: 'listing_editor',
      locale: localeFrom(owner?.locale, 'hu'),
      propertyId: existing.id,
      profileId: existing.owner_id,
      name: owner?.full_name ?? null,
      email: owner?.email ?? null,
      phone: owner?.phone ?? null,
    });
  } catch (error) {
    // The listing itself is saved; the office can still be told by phone.
    console.error('[setup] service request not synced (migration 0015?)', error);
  }
}

/* ── 2. The property ──────────────────────────────────────────────────── */

async function saveProperty(supabase:SupabaseClient,existing:Existing,form:FormData):Promise<StepResult>{
  const current=await getProperty(supabase,existing.id);if(!current)return {ok:false,error:'not-found'};
  try{
    const values=await listingInput(form,current,await getTaxonomy(),{allowIncomplete:form.get('partial')==='yes'});
    const {error}=await supabase.rpc('save_listing_editor',{p_id:existing.id,p_patch:values.patch,p_private:values.privateData});
    return error?{ok:false,error:'save-failed'}:{ok:true};
  }catch(error){return error instanceof ListingInputError?{ok:false,error:error.message,errors:error.errors}:{ok:false,error:'save-failed'};}
}

/* ── 3. Description and contact ────────────────────────────────────────── */

async function saveDescription(supabase:SupabaseClient,existing:Existing,form:FormData,locale:PortalLang):Promise<StepResult>{
  const title=str(form,'title'),description=str(form,'description'),body=str(form,'body');
  const errors:Record<string,FieldError>={};
  const partial=form.get('partial')==='yes';
  if(!title&&!partial)errors.title={code:'required'};else if(title.length>160)errors.title={code:'too-long',limit:160};
  if(!description&&!partial)errors.description={code:'required'};else if(description.length>DESCRIPTION_MAX)errors.description={code:'too-long',limit:DESCRIPTION_MAX};
  if(body.length>30000)errors.body={code:'too-long',limit:30000};
  if(Object.keys(errors).length)return {ok:false,error:'invalid',errors};
  const current=await getProperty(supabase,existing.id);if(!current)return {ok:false,error:'not-found'};
  const pkg=packageOf(listingCatalog((await getCompany()).services),existing.package);
  const translations=[{locale,title,description,body}];
  // The office still prepares paid translations. A non-Hungarian original can be submitted without pretending it is a Hungarian translation.
  const {error}=await supabase.rpc('save_listing_editor',{p_id:existing.id,p_patch:{seller_speaks:contactLanguages(form),seller_contact_visible:pkg.phone&&form.get('contact')==='yes'},p_private:{internal_note:str(form,'internal_note').slice(0,10000),...(form.has('heard_from')?{heard_from:HEARD_FROM_KEYS.includes(str(form,'heard_from'))?str(form,'heard_from'):''}:{})},p_translations:translations});
  return error?{ok:false,error:'save-failed'}:{ok:true};
}
