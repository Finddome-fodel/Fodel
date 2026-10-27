import type { APIRoute } from 'astro';
import { processAndUploadImage, deleteImage, MediaUploadError, LOW_RESOLUTION_EDGE } from '~/lib/media';
import { OWNER_EDITABLE } from '~/lib/portal/properties';
import { logEvent } from '~/lib/activity';
import { getCompany } from '~/lib/runtime-config';
import { listingCatalog, packageOf } from '~/lib/listing-packages';

export const prerender = false;

export const POST: APIRoute = async ({ request, params, locals }) => {
  const { id } = params;
  const { supabase, profile, user } = locals;
  const json = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  const { data: property } = await supabase
    .from('properties')
    .select('id, owner_id, status, package')
    .eq('id', id)
    .maybeSingle();
  if (!property) return json(404, { ok: false, error: 'not-found' });
  const isAdmin = profile?.role === 'admin';
  if (!isAdmin && property.owner_id !== user?.id) {
    return json(403, { ok: false, error: 'forbidden' });
  }
  // A submitted or live listing's photos change only through review — a
  // re-upload must not slip past the human approval (brief §7).
  if (!isAdmin && !OWNER_EDITABLE.includes(property.status)) {
    return json(409, { ok: false, error: 'not-editable' });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json(400, { ok: false, error: 'no-file' });

  const { count } = await supabase
    .from('property_media')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', id);
  const replaceId=String(form.get('replace')||'');
  const {data:replaced,error:replaceError}=replaceId?await supabase.from('property_media').select('id,storage_path').eq('id',replaceId).eq('property_id',id).maybeSingle():{data:null,error:null};
  if(replaceId && (replaceError||!replaced))return json(404,{ok:false,error:'not-found'});
  // The package's own cap (null = unlimited); the database trigger keeps a hard ceiling underneath.
  const maxImages=packageOf(listingCatalog((await getCompany()).services),property.package).maxImages;
  if(!replaceId && maxImages!==null && (count??0)>=maxImages)return json(409,{ok:false,error:'photo-limit',max:maxImages});

  try {
    const uploaded = await processAndUploadImage(supabase, id!, file);
    if(replaced){
      const {error}=await supabase.from('property_media').update({storage_path:uploaded.url,width:uploaded.width,height:uploaded.height}).eq('id',replaced.id).eq('property_id',id);
      if(error){await deleteImage(supabase,uploaded.url).catch(()=>{});return json(500,{ok:false,error:'save-failed'});}
      await deleteImage(supabase,replaced.storage_path).catch(()=>{});
      return json(200,{ok:true,id:replaced.id});
    }
    const isFirst = (count ?? 0) === 0;

    const { data, error } = await supabase
      .from('property_media')
      .insert({
        property_id: id,
        storage_path: uploaded.url,
        width: uploaded.width,
        height: uploaded.height,
        alt: {},
        sort_order: count ?? 0,
        is_hero: isFirst,
      })
      .select('id')
      .single();
    if (error) {await deleteImage(supabase,uploaded.url).catch(()=>{});return json(error.message.includes('photo-limit')?409:500,{ok:false,error:error.message.includes('photo-limit')?'photo-limit':'save-failed'});}

    await logEvent({
      kind: 'media.uploaded',
      actorId: user?.id ?? null,
      actorEmail: profile?.email ?? null,
      subjectType: 'property_media',
      subjectId: data.id,
      propertyId: id ?? null,
      source: 'portal',
    }).catch(() => {});

    // Not a rejection: a small photo is still a photo. But the seller should
    // know it will look soft on a large screen while they can still replace it.
    const lowResolution = Math.max(uploaded.originalWidth, uploaded.originalHeight) < LOW_RESOLUTION_EDGE;
    return json(200, { ok: true, id: data.id, warning: lowResolution ? 'low-resolution' : undefined });
  } catch (e) {
    if (e instanceof MediaUploadError) return json(422, { ok: false, error: e.code });
    return json(500, { ok: false, error: 'unexpected' });
  }
};

/** Gallery order and cover change in one database transaction. */
export const PATCH:APIRoute=async({params,request,locals})=>{
 const {supabase,profile,user}=locals;
 if(!user)return Response.json({error:'unauthorized'},{status:401});
 const {data:p}=await supabase.from('properties').select('owner_id,status').eq('id',params.id).maybeSingle();
 if(!p || (profile?.role!=='admin' && (p.owner_id!==user.id || !OWNER_EDITABLE.includes(p.status))))return Response.json({error:'forbidden'},{status:403});
 const body=await request.json().catch(()=>({}));
 if(!Array.isArray(body.ids)||body.ids.length>100||body.ids.some((v:unknown)=>typeof v!=='string'||!/^[-0-9a-f]{36}$/i.test(v)))return Response.json({error:'invalid-gallery'},{status:422});
 const {error}=await supabase.rpc('reorder_property_media',{p_id:params.id,p_ids:body.ids,p_cover:body.cover||null});
 return error?Response.json({error:'save-failed'},{status:422}):Response.json({ok:true});
};
