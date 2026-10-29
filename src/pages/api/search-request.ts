import type { APIRoute } from 'astro';
import { localeFrom } from '~/i18n/ui';
import { handleForm } from '~/lib/form-handler';
import { searchRequestReceived } from '~/lib/email/search-request';
import { createSupabaseAdminClient } from '~/lib/supabase-server';

export const prerender = false;

/**
 * Kerestető / Zoekdienst — FODEL's free search service.
 *
 * Their highest-intent lead capture: the visitor states what they want and
 * FODEL hunt for it, including off-market. Free to the user, and absent from
 * the prototype entirely.
 *
 * Had no `onSuccess` at all until now, so — despite `search_requests` existing
 * in the schema since 0001 — every submission was emailed and then discarded;
 * nothing was ever queryable in the portal.
 */
export const POST: APIRoute = (context) =>
  handleForm(context, {
    id: 'search-request',
    automation: 'search_request',
    activityKind: 'search_request.created',
    subject: 'KERESTETŐ / Nieuwe zoekopdracht',
    fields: [
      { name: 'name', label: 'Név / Naam', required: true, maxLength: 120 },
      { name: 'email', label: 'E-mail', type: 'email', required: true, maxLength: 160 },
      { name: 'phone', label: 'Telefon', type: 'tel', maxLength: 40 },
      { name: 'propertyType', label: 'Keresett típus / Gezocht type', required: true, maxLength: 60 },
      { name: 'region', label: 'Régió / Regio', maxLength: 120 },
      { name: 'budgetMin', label: 'Budget-tól (€)', type: 'number', maxLength: 20 },
      { name: 'budgetMax', label: 'Budget-ig (€)', type: 'number', maxLength: 20 },
      { name: 'requirements', label: 'Elvárások / Wensen', maxLength: 4000 },
    ],
    ack: (locale, values) => searchRequestReceived(locale, values),
    onSuccess: async (values, extras) => {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.from('search_requests').insert({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        type: values.propertyType || null,
        region: values.region || null,
        budget_min: values.budgetMin ? Number(values.budgetMin) : null,
        budget_max: values.budgetMax ? Number(values.budgetMax) : null,
        requirements: values.requirements || null,
        locale: localeFrom(extras.Locale, 'hu'),
      });
      if (error) console.error('[form:search-request] not stored', error.message);
    },
  });
