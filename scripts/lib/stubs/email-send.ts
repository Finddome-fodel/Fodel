import { localeFrom } from '~/i18n/ui';
import { world } from './world.ts';
export { templates } from '~/lib/email/templates';
export type { EmailLocale } from '~/lib/email/layout';
export async function deliver(to: string, email: { subject: string }): Promise<boolean> {
  world.sent.push({ to, subject: email.subject });
  return true;
}
export const localeOf = (profile: { locale?: string | null } | null | undefined) => localeFrom(profile?.locale) as any;
export async function adminRecipients() { return []; }
