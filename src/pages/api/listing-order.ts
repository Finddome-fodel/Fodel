import type { APIRoute } from 'astro';
import { localeFrom } from '~/i18n/ui';
import { handleForm } from '~/lib/form-handler';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { register } from '~/lib/portal/registration';

export const prerender = false;

/**
 * Seller registration — the "Hirdetés feladása" form and /portal/register.
 *
 * Launch round: registration first, listing details after. The public form
 * now asks only for a name, an email address, a phone number and the
 * consents; the package, the property, the photos and the billing details
 * are chosen in the portal's guided setup once the person has set a password
 * (src/pages/portal/properties/[id]/setup.astro). The route keeps its old
 * URL so links and forms already out there do not 404.
 *
 * Every outcome answers the same way — see src/lib/portal/registration.ts
 * for the three cases (new address, open invite, existing account) and why
 * the page must never tell them apart. The office still gets its
 * notification email for every registration, and the person shows up at the
 * top of the admin inbox at once ("Regisztrált — még nem állított be jelszót").
 *
 * What has NOT changed: nothing publishes without FODEL approving it, and
 * payment still comes after approval.
 */
export const POST: APIRoute = (context) =>
  handleForm(context, {
    id: 'listing-order',
    activityKind: 'listing.intake',
    subject: 'ÚJ REGISZTRÁCIÓ / Nieuwe registratie',
    // The "set a password" email below is the acknowledgement, and a better one.
    skipAck: true,
    // A registration that did not reach the database must not show "check
    // your inbox": there would be nothing in it.
    requireSuccess: true,
    fields: [
      { name: 'name', label: 'Név', required: true, maxLength: 120 },
      { name: 'email', label: 'E-mail', type: 'email', required: true, maxLength: 160 },
      { name: 'phone', label: 'Telefon', type: 'tel', required: true, maxLength: 40 },
      { name: 'referralCode', label: 'Ajánló kód', maxLength: 20 },
    ],
    onSuccess: async (values, extras) => {
      await register(createSupabaseAdminClient(), {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        locale: localeFrom(extras.Locale, 'hu'),
        referralCode: values.referralCode,
        origin: new URL(context.request.url).origin,
      });
    },
  });
