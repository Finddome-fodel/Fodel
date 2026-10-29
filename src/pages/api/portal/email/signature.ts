/** Saves the default signature (one per site, appended under every template email that does not pick another). */
import type { APIRoute } from 'astro';
import { friendlyError } from '~/lib/portal/labels';
import { mailSchemaReady, SETUP_PATH } from '~/lib/mail/schema';

export const prerender = false;

const URL_FIELDS = ['websiteUrl', 'facebookUrl', 'instagramUrl', 'linkedinUrl'] as const;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (locals.profile?.role !== 'admin') return new Response('Ehhez nincs jogosultsága.', { status: 403 });
  const { supabase } = locals;
  if (!(await mailSchemaReady(supabase))) return redirect(SETUP_PATH);
  const form = await request.formData();
  const fail = (message: string) => redirect(`/portal/email/signature?error=${encodeURIComponent(message)}`);
  const text = (key: string, max = 160) => {
    const value = String(form.get(key) ?? '').trim().slice(0, max);
    return value || null;
  };

  const name = text('name', 120);
  if (!name) return fail('A név megadása kötelező.');
  for (const key of URL_FIELDS) {
    const value = text(key, 300);
    if (value && !/^https:\/\/\S+$/.test(value)) return fail('A linkek https:// kezdetű teljes címek legyenek.');
  }
  const email = text('email');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Az e-mail-cím formátuma nem megfelelő.');

  const payload = {
    name,
    title: text('title'),
    phone: text('phone', 40),
    email,
    website_url: text('websiteUrl', 300),
    facebook_url: text('facebookUrl', 300),
    instagram_url: text('instagramUrl', 300),
    linkedin_url: text('linkedinUrl', 300),
    is_default: true,
  };
  const { data: existing } = await supabase.from('mail_signatures').select('id').eq('is_default', true).maybeSingle();
  const { error } = existing
    ? await supabase.from('mail_signatures').update(payload).eq('id', existing.id)
    : await supabase.from('mail_signatures').insert(payload);
  if (error) return fail(friendlyError(error.message));
  return redirect('/portal/email/signature?saved=1');
};
