/**
 * Who a buyer is shown as the contact on a listing.
 *
 *   owner    the seller's own name and phone, under the rule the site has always
 *            used: the seller agreed AND the package includes a public phone number
 *   staff    a named FINDDOME colleague (name and phone chosen by an admin)
 *   company  nobody personal; the enquiry form and the standard FINDDOME contact
 *            details are the way in
 *
 * Only an admin can choose `staff` or `company` (migration 0042). The seller's own
 * name, phone and consent are kept whatever is chosen, so the choice is reversible.
 */
import { showSellerPhone, type ListingRules } from './listing-rules.ts';
import { normalizePhone } from './validation.ts';

export const CONTACT_MODES = ['owner', 'staff', 'company'] as const;
export type ContactMode = (typeof CONTACT_MODES)[number];

export function contactModeOf(value: unknown): ContactMode {
  return (CONTACT_MODES as readonly unknown[]).includes(value) ? (value as ContactMode) : 'owner';
}

export type PublicContact = { kind: 'owner' | 'staff'; name?: string; phone: string };

export type ContactInput = {
  mode: ContactMode;
  package: string;
  ownerVisible: boolean;
  ownerName?: string | null;
  ownerPhone?: string | null;
  staffName?: string | null;
  staffPhone?: string | null;
};

export function publicContact(input: ContactInput, rules: ListingRules): PublicContact | null {
  if (input.mode === 'company') return null;
  if (input.mode === 'staff') {
    const phone = input.staffPhone?.trim();
    return phone ? { kind: 'staff', name: input.staffName?.trim() || undefined, phone } : null;
  }
  const shown = showSellerPhone({ package: input.package, contactVisible: input.ownerVisible, phone: input.ownerPhone }, rules);
  return shown ? { kind: 'owner', name: input.ownerName?.trim() || undefined, phone: input.ownerPhone!.trim() } : null;
}

/**
 * The admin's choice from a posted form, as the columns to save. Empty when the form
 * does not carry the choice (the owner's form never does), so nothing is ever cleared
 * by accident. A colleague without a readable phone number falls back to the default.
 */
export function contactDisplayPatch(form: FormData): Record<string, string | null> {
  if (!form.has('public_contact')) return {};
  const mode = contactModeOf(form.get('public_contact'));
  if (mode !== 'staff') return { public_contact: mode, public_contact_name: null, public_contact_phone: null };
  const name = String(form.get('public_contact_name') ?? '').trim().slice(0, 160);
  const raw = String(form.get('public_contact_phone') ?? '').trim();
  const parsed = raw ? normalizePhone(raw, 'HU') : null;
  const phone = parsed?.ok ? parsed.e164 : raw.slice(0, 40);
  return { public_contact: 'staff', public_contact_name: name || null, public_contact_phone: phone || null };
}
