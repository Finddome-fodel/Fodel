/**
 * What happens when someone leaves their details on the free upload link
 * (src/pages/portal/upload/[token].astro → api/portal/upload/start.ts).
 *
 * A real seller account is made on the spot, with a password nobody ever sees: the
 * visitor is signed in at once and lands in the listing wizard on a free listing.
 * No e-mail is sent and no password is asked for. Coming back on another device is
 * the ordinary "Elfelejtett jelszó" flow, which the person starts themselves.
 *
 * The address is not confirmed, which is the point of a one-step link; the listing
 * still goes to an admin before anything is public, and nothing here touches money.
 */
import crypto from 'node:crypto';
import { localeFrom } from '~/i18n/ui';
import { logEvent } from '~/lib/activity';
import { createDraft } from '~/lib/portal/properties';

export type StartFreeUploadResult =
  | { ok: true; draftId: string | null }
  | { ok: false; error: 'exists' | 'invited' | 'failed' };

type Input = { name: string; email: string; phone: string; locale: string };

/** `signIn` puts the session cookie on the visitor's browser; it is passed in so this stays testable. */
export async function startFreeUpload(
  admin: any,
  input: Input,
  signIn: (email: string, password: string) => Promise<boolean>
): Promise<StartFreeUploadResult> {
  const email = input.email.trim().toLowerCase();
  const locale = localeFrom(input.locale, 'hu');

  const { data: existing } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
  if (existing) return { ok: false, error: 'exists' };

  // Someone an admin invited already has a link that sets their password; a second account would break it.
  const { data: invited } = await admin
    .from('invites')
    .select('id')
    .eq('email', email)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle();
  if (invited) return { ok: false, error: 'invited' };

  const password = crypto.randomBytes(24).toString('base64url');
  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError || !created?.user) {
    // The address is known to the auth system without a profile (a half-finished older sign-up): treat as taken.
    if (/already|registered|exists/i.test(createError?.message ?? '')) return { ok: false, error: 'exists' };
    console.error('[upload-link] createUser failed', createError);
    return { ok: false, error: 'failed' };
  }
  const userId = created.user.id as string;

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    role: 'owner',
    full_name: input.name,
    email,
    phone: input.phone,
    locale,
  });
  if (profileError) {
    console.error('[upload-link] profile insert failed', profileError);
    // No half-made account: the person can simply try again.
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return { ok: false, error: 'failed' };
  }

  await logEvent({
    kind: 'upload_link.signup',
    actorId: userId,
    actorEmail: email,
    subjectType: 'profile',
    subjectId: userId,
    locale,
    source: 'upload_link',
  }).catch(() => {});

  if (!(await signIn(email, password))) {
    // Nobody knows this password, so an account left behind could never be used: remove it (the profile goes with it).
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return { ok: false, error: 'failed' };
  }

  // Only the server may mark a listing free (the owner's own writes cannot), and it is made here for them.
  try {
    const draftId = await createDraft(admin, userId);
    await admin
      .from('properties')
      .update({ free_listing: true, seller_name: input.name.slice(0, 120), seller_phone: input.phone.slice(0, 40) })
      .eq('id', draftId);
    return { ok: true, draftId };
  } catch (error) {
    // They are signed in and can start a listing by hand; the account must not be lost over the draft.
    console.error('[upload-link] could not make the draft', error);
    return { ok: true, draftId: null };
  }
}
