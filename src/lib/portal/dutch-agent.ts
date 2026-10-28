/**
 * "I would like a Dutch-speaking agent" — a request an owner ticks on their
 * listing (migration 0035, `properties.dutch_agent_requested`).
 *
 * Deliberately not a priced on-site service (see service-requests.ts): the fee
 * is always agreed personally, so nothing here touches an order or an invoice.
 * What this does is keep the flag, and tell the office once — the first time it
 * is asked for — because the setup wizard autosaves and an owner may tick and
 * untick while deciding.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { SITE_URL } from '~/config/site.mjs';
import { deliver, templates } from '~/lib/email/send';
import { officeInbox } from '~/lib/email/routing';
import { createSupabaseAdminClient } from '~/lib/supabase-server';

export const DUTCH_AGENT_LABEL_HU = 'Holland nyelvű ingatlanos';

type Listing = { id: string; owner_id: string | null; status: string };

/**
 * Stores the owner's choice. Returns false only when a change could not be
 * saved; before 0035 has run an unchanged "no" is simply a no-op.
 */
export async function syncDutchAgent(supabase: SupabaseClient, listing: Listing, wanted: boolean): Promise<boolean> {
  const { data: current, error: readError } = await supabase
    .from('properties')
    .select('dutch_agent_requested, dutch_agent_requested_at')
    .eq('id', listing.id)
    .maybeSingle();
  if (readError) return !wanted;
  if (Boolean(current?.dutch_agent_requested) === wanted) return true;

  const firstTime = wanted && !current?.dutch_agent_requested_at;
  const patch: Record<string, unknown> = { dutch_agent_requested: wanted };
  if (firstTime) patch.dutch_agent_requested_at = new Date().toISOString();
  const { error } = await supabase.from('properties').update(patch).eq('id', listing.id);
  if (error) return false;

  if (firstTime) await notifyOffice(listing);
  return true;
}

async function notifyOffice(listing: Listing) {
  try {
    const admin = createSupabaseAdminClient();
    const [{ data: owner }, { data: property }] = await Promise.all([
      listing.owner_id
        ? admin.from('profiles').select('full_name, email, phone').eq('id', listing.owner_id).maybeSingle()
        : Promise.resolve({ data: null }),
      admin.from('properties').select('ref').eq('id', listing.id).maybeSingle(),
    ]);
    const ref = property?.ref ? ` (#${property.ref})` : '';
    await deliver(
      officeInbox(),
      templates.adminServiceRequested('hu', {
        service: `${DUTCH_AGENT_LABEL_HU}${ref}: egyedi ár`,
        name: owner?.full_name ?? '',
        email: owner?.email ?? '',
        phone: owner?.phone ?? '',
        source: 'listing_editor',
        note: '',
        url: `${SITE_URL}${listing.status === 'draft' ? '/portal/properties/' : '/portal/review/'}${listing.id}`,
      }),
      owner?.email ?? undefined
    );
  } catch (error) {
    // The flag is saved and shows on the admin screens; the e-mail is a courtesy.
    console.error('[dutch-agent] office not notified', error);
  }
}
