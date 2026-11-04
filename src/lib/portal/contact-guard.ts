/**
 * Free listings may not carry contact details in their text (spec §5.2–5.3).
 * The server's half of the rule; the setup form shows the same findings live
 * (src/lib/contact-detect.ts is shared).
 *
 * - Paid listings: never checked.
 * - Owners of free listings: refused, field by field, with the snippet.
 * - Admins: warned the same way, unless they tick „Tudatosan benne hagyom”
 *   (`contact_override=yes`), which is then recorded as `listing.contact_override`.
 */
import { contactErrors } from '~/lib/contact-detect';
import type { FieldError } from '~/lib/validation';
import { logEvent } from '~/lib/activity';

export type ContactActor = { id: string | null; email: string | null };

export type ContactVerdict =
  | { ok: true }
  | { ok: false; errors: Record<string, FieldError> };

export const CONTACT_OVERRIDE_FIELD = 'contact_override';

export async function guardContacts(
  form: FormData,
  fields: Record<string, string | null | undefined>,
  ctx: { free: boolean | null | undefined; isAdmin: boolean; propertyId: string; actor?: ContactActor; source: string },
): Promise<ContactVerdict> {
  if (!ctx.free) return { ok: true };
  const errors = contactErrors(fields);
  const names = Object.keys(errors);
  if (!names.length) return { ok: true };
  if (ctx.isAdmin && form.get(CONTACT_OVERRIDE_FIELD) === 'yes') {
    await logEvent({
      kind: 'listing.contact_override',
      actorId: ctx.actor?.id ?? null,
      actorEmail: ctx.actor?.email ?? null,
      subjectType: 'property',
      subjectId: ctx.propertyId,
      propertyId: ctx.propertyId,
      source: ctx.source,
      payload: { fields: names, found: names.map((name) => ({ field: name, code: errors[name].code, match: errors[name].match })) },
    }).catch(() => {});
    return { ok: true };
  }
  return { ok: false, errors };
}
