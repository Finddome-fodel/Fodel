/**
 * Saves the editor's field values. Never changes `status` — that is a
 * separate, deliberate action (see status.ts, Stage 4) so "I edited some
 * text" and "I am submitting this for review" can never be conflated.
 *
 * This is server-side re-validation on top of RLS, per the plan's security
 * section: RLS already refuses the UPDATE outright if the caller doesn't own
 * the row or the row isn't in an editable status, but re-checking here first
 * means the seller gets a clear message instead of a silent no-op.
 *
 * Launch round: the guided setup (properties/[id]/setup.astro) saves here
 * too, one step at a time — a form carrying `step` updates only that step's
 * fields and answers in JSON, so "Continue" and autosave-on-blur can never
 * blank a field from another step. Without `step` this is the full editor's
 * save, unchanged.
 */
import type { APIRoute } from 'astro';
import { portalLang } from '~/lib/portal/auth-copy';
import { LOCALE_OPTIONS } from '~/lib/portal/properties';
import { getProperty } from '~/lib/portal/properties';
import { listingInput, ListingInputError, contactLanguages } from '~/lib/portal/listing-input';
import { HEARD_FROM_KEYS } from '~/lib/listing-details';
import { logEvent } from '~/lib/activity';
import { normalizePhone, isPhoneCountry } from '~/lib/validation';
import { friendlyError } from '~/lib/portal/labels';
import { getTaxonomy, getCompany } from '~/lib/runtime-config';
import { listingCatalog, packageOf } from '~/lib/listing-packages';
import { syncDutchAgent } from '~/lib/portal/dutch-agent';
import { saveSetupStep, SETUP_STEPS, type SetupStep } from '~/lib/portal/setup';

export const prerender = false;

/** The seller's number in E.164 when it reads as one in the picked country; otherwise as typed. */
function sellerPhone(form: FormData): string | null {
  const raw = String(form.get('seller_phone') ?? '').trim();
  if (!raw) return null;
  const picked = String(form.get('seller_phoneCountry') ?? '');
  const phone = normalizePhone(raw, isPhoneCountry(picked) ? picked : 'HU');
  return phone.ok ? phone.e164 : raw.slice(0, 40);
}

const str = (form: FormData, key: string): string => String(form.get(key) ?? '').trim();

export const POST: APIRoute = async ({ request, params, locals, redirect }) => {
  const { id } = params;
  const { supabase, profile, user } = locals;
  const form = await request.formData();

  const back = (query: string) => redirect(`/portal/properties/${id}?${query}`);
  const step = String(form.get('step') ?? '');

  const { data: existing, error: fetchError } = await supabase
    .from('properties')
    .select('id, owner_id, status, package')
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) return back('error=not-found');

  const isAdmin = profile?.role === 'admin';
  const isOwner = existing.owner_id === user?.id;
  if (!isAdmin && !isOwner) return back('error=forbidden');
  if (!isAdmin && !['draft', 'changes_requested'].includes(existing.status)) {
    if (step) return Response.json({ ok: false, error: 'not-editable' }, { status: 409 });
    return back('error=' + encodeURIComponent('ez a hirdetés jelenleg nem szerkeszthető'));
  }

  // One step of the guided setup: only that step's fields, answered in JSON.
  if (step) {
    if (!(SETUP_STEPS as readonly string[]).includes(step)) return Response.json({ ok: false, error: 'unknown-step' }, { status: 400 });
    const result = await saveSetupStep(supabase, existing, step as SetupStep, form, { isAdmin, locale: portalLang(profile?.locale) });
    if (result.ok) {
      await logEvent({
        kind: 'listing.edited',
        actorId: user?.id ?? null,
        actorEmail: profile?.email ?? null,
        subjectType: 'property',
        subjectId: id,
        propertyId: id ?? null,
        source: 'setup',
        payload: { step },
      }).catch(() => {});
    }
    return Response.json(result, { status: result.ok ? 200 : 422 });
  }

  const current = await getProperty(supabase,id!);
  if (!current) return back('error=not-found');
  const taxonomy = await getTaxonomy();
  let values: Awaited<ReturnType<typeof listingInput>>;
  try { values = await listingInput(form,current,taxonomy); }
  catch(error) {
    const message = error instanceof ListingInputError && error.message === 'rates-unavailable'
      ? 'Az árfolyam most nem érhető el. Próbálja újra később; a korábbi adatok változatlanul megmaradtak.'
      : error instanceof ListingInputError ? 'Ellenőrizze ezeket a mezőket: ' + Object.keys(error.errors).join(', ') : 'Nem sikerült menteni.';
    return back('error=' + encodeURIComponent(message));
  }
  const patch: Record<string,unknown> = {...values.patch,
    requested_extras:{...current.requested_extras,categoryHighlight:form.get('request_category')==='yes',homepageHighlight:form.get('request_homepage')==='yes',topicHighlight:form.get('topic_highlight_requested')==='yes',dutchAgent:form.get('dutch_agent_requested')==='yes'},
    seller_contact_visible:form.get('seller_contact_visible')==='yes',seller_name:str(form,'seller_name').slice(0,160)||null,
    seller_phone:sellerPhone(form),seller_speaks:contactLanguages(form),
    ...(existing.status==='published'?{reserved:form.get('reserved')==='yes'}:{}),
    topic_highlight_requested:form.get('topic_highlight_requested')==='yes',
    ...(isAdmin?{featured:form.get('featured')==='yes',homepage_featured:form.get('homepage_featured')==='yes',topic_featured:form.get('topic_featured')==='yes'}:{}),
  };
  if(!isAdmin && values.patch.video_url && packageOf(listingCatalog((await getCompany()).services),existing.package).video==='none') return back('error='+encodeURIComponent('A választott csomag nem tartalmaz videót.'));
  const translations=[];
  for(const {value:locale} of LOCALE_OPTIONS){
    const title=str(form,`title_${locale}`),description=str(form,`description_${locale}`);
    if(locale==='hu'&&(!title||!description))return back('error='+encodeURIComponent('A magyar cím és rövid leírás kötelező.'));
    // Existing translations and legacy optional copy survive an empty/unoffered locale.
    if(title||description)translations.push({locale,title:title.slice(0,160)||description.slice(0,60),description:description.slice(0,6000),body:str(form,`body_${locale}`).slice(0,30000)});
  }
  const {error:updateError}=await supabase.rpc('save_listing_editor',{
    p_id:id,p_patch:patch,p_private:{...values.privateData,internal_note:str(form,'internal_note').slice(0,10000),...(form.has('heard_from')?{heard_from:HEARD_FROM_KEYS.includes(str(form,'heard_from'))?str(form,'heard_from'):''}:{})},p_translations:translations,
  });
  if(updateError){console.error('[update] save_listing_editor failed',id,updateError.message);}
  if(updateError)return back('error='+encodeURIComponent(friendlyError(updateError.message)));
  if(!(await syncDutchAgent(supabase,{id:id!,owner_id:existing.owner_id,status:existing.status},form.get('dutch_agent_requested')==='yes')))return back('error='+encodeURIComponent('Nem sikerült menteni.'));

  await logEvent({
    kind: 'listing.edited',
    actorId: user?.id ?? null,
    actorEmail: profile?.email ?? null,
    subjectType: 'property',
    subjectId: id,
    propertyId: id ?? null,
    source: 'portal',
  }).catch(() => {});

  return back('saved=1');
};
