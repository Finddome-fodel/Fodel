import type { APIRoute } from 'astro';
import { validateField, normalizePhone, defaultPhoneCountry, isPhoneCountry } from '~/lib/validation';
import { localeFrom } from '~/i18n/ui';
import { portalLang } from '~/lib/portal/auth-copy';
import { errorMessage } from '~/lib/validation-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const { supabase, user } = locals;
  const form = await request.formData();
  const profileLocale = localeFrom(locals.profile?.locale, 'hu');
  const locale = portalLang(profileLocale);
  const full_name = String(form.get('full_name') ?? '').trim() || null;
  let phone = String(form.get('phone') ?? '').trim() || null;

  // Stored in E.164, checked against the country picked beside it.
  if (phone) {
    const picked = String(form.get('phoneCountry') ?? '');
    const country = isPhoneCountry(picked) ? picked : defaultPhoneCountry(profileLocale);
    const normalised = normalizePhone(phone, country);
    if (!normalised.ok) {
      const problem = validateField({ rule: 'phone' }, phone, country);
      return redirect(`/portal/settings?error=${encodeURIComponent(problem ? errorMessage(problem, locale) : '')}`);
    }
    phone = normalised.e164;
  }

  const { error } = await supabase.from('profiles').update({ full_name, phone }).eq('id', user!.id);
  if (error) return redirect(`/portal/settings?error=${encodeURIComponent(error.message)}`);
  return redirect('/portal/settings?saved=profile');
};
