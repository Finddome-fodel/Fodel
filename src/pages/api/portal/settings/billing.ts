/**
 * Saves a customer's billing details. They live on the account (profiles.billing,
 * reused for every order and invoice) and, when an order is given, are also
 * copied onto that order so the invoice for it is complete without anyone
 * retyping anything. Signed-in owners can only touch their own account and
 * their own open orders.
 */
import type { APIRoute } from 'astro';
import { localeFrom } from '~/i18n/ui';
import { portalLang } from '~/lib/portal/auth-copy';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { sanitiseParty, billingComplete } from '~/lib/invoicing/model';
import { validateField, normalizePhone, normalizePostcode, isPhoneCountry, defaultPhoneCountry } from '~/lib/validation';
import { errorMessage } from '~/lib/validation-server';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user } = locals;
  if (!user) return json(401, { ok: false });
  const body = await request.json().catch(() => ({}));
  const billing = sanitiseParty(body.billing);
  // Phone numbers default to the profile's own country; the words are the portal's.
  const profileLocale = localeFrom(locals.profile?.locale, 'hu');
  const locale = portalLang(profileLocale);
  if (!billingComplete(billing)) {
    return json(422, {
      ok: false,
      error: 'incomplete',
      message: {
        hu: 'A név, az ország, a város és az utca megadása kötelező.',
        nl: 'Naam, land, plaats en straat zijn verplicht.',
        en: 'Name, country, town and street are required.',
      }[locale],
    });
  }

  // The same checks the form ran (src/lib/validation.ts): the postcode in its
  // country's format, the phone number stored in E.164.
  const postcodeError = validateField({ rule: 'postcode' }, billing.postalCode, billing.countryCode);
  if (postcodeError) return json(422, { ok: false, error: 'postcode', message: errorMessage(postcodeError, locale) });
  billing.postalCode = normalizePostcode(billing.postalCode, billing.countryCode);
  if (billing.phone) {
    const picked = String(body.billing?.phoneCountry ?? '');
    const phone = normalizePhone(billing.phone, isPhoneCountry(picked) ? picked : defaultPhoneCountry(profileLocale));
    if (!phone.ok) {
      const error = validateField({ rule: 'phone' }, billing.phone, isPhoneCountry(picked) ? picked : defaultPhoneCountry(profileLocale));
      return json(422, { ok: false, error: 'phone', message: error ? errorMessage(error, locale) : '' });
    }
    billing.phone = phone.e164;
  }

  const { error } = await supabase.from('profiles').update({ billing }).eq('id', user.id);
  if (error) {
    return json(500, {
      ok: false,
      error: 'save-failed',
      message: {
        hu: 'A mentés nem sikerült. Lehet, hogy a rendszer frissítése még nem fejeződött be.',
        nl: 'Opslaan is niet gelukt. Probeer het later opnieuw.',
        en: 'Saving did not work. Please try again later.',
      }[locale],
    });
  }

  if (typeof body.paymentId === 'string') {
    const admin = createSupabaseAdminClient();
    const { data: order } = await admin.from('payments').select('id, owner_id, status').eq('id', body.paymentId).maybeSingle();
    if (order && order.owner_id === user.id && order.status === 'pending') {
      await admin
        .from('payments')
        .update({
          billing,
          billing_name: billing.name,
          billing_address: [billing.street, [billing.postalCode, billing.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
        })
        .eq('id', order.id);
    }
  }
  return json(200, { ok: true, billing });
};
