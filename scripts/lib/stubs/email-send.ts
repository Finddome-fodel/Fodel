import { localeFrom } from '~/i18n/ui';
import { world } from './world.ts';
export { templates } from '~/lib/email/templates';
export type { EmailLocale } from '~/lib/email/layout';
export async function deliver(to: string, email: { subject: string; text?: string }): Promise<boolean> {
  world.sent.push({ to, subject: email.subject, text: email.text });
  return true;
}
export const localeOf = (profile: { locale?: string | null } | null | undefined) => localeFrom(profile?.locale) as any;
export async function adminRecipients() { return []; }
