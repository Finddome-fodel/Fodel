/**
 * The daily job (Vercel Cron, vercel.json → "crons"): listing expiry, the two
 * expiry reminders, and the monthly "still for sale?" email with its one
 * reminder. Vercel calls it with `Authorization: Bearer <CRON_SECRET>`;
 * anything else is refused, and with no CRON_SECRET set nothing runs at all.
 *
 * Idempotent by construction. Every email is *claimed* first with a
 * conditional update that only succeeds while its *_sent_at column is still
 * empty; only the run that won the claim sends. A second run on the same day
 * — or two overlapping runs — finds nothing left to claim and sends nothing.
 *
 * Nothing here unpublishes a listing for silence: an owner who does not answer
 * the monthly email is only flagged ("Nem válaszolt"); the admin decides.
 * Expiry is different — the owner paid for a period and it ended.
 */
import { intlTag } from '~/lib/format';
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { getCompany } from '~/lib/runtime-config';
import { listingRules, expiryAction, refreshAction, daysLeft, type ListingRules } from '~/lib/listing-rules';
import { listingTitle, publicUrl } from '~/lib/portal/publish';
import { deliver, localeOf } from '~/lib/email/send';
import { cronAuthorised } from '~/lib/cron-auth';
import { lifecycleEmails } from '~/lib/email/lifecycle';
import { ownerLink, RENEW_LINK_DAYS } from '~/lib/owner-links';
import { logEvent } from '~/lib/activity';
import { eur } from '~/lib/format';
import { formatCents } from '~/lib/orders';
import { renewalPriceCents } from '~/lib/portal/renewal';

export const prerender = false;

/** Emails per run, so one run stays well inside the function time limit. The rest go tomorrow. */
const MAX_EMAILS = 80;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const GET: APIRoute = async ({ request }) => {
  if (!cronAuthorised(request.headers.get('authorization'), process.env.CRON_SECRET ?? import.meta.env.CRON_SECRET)) {
    return json(401, { ok: false });
  }

  const admin = createSupabaseAdminClient();
  const RENEWAL_CENTS = await renewalPriceCents();
  const now = new Date();
  const company = await getCompany();
  const rules = listingRules(company.services);

  const { data: rows, error } = await admin.from('properties').select('*').eq('status', 'published').limit(2000);
  if (error) return json(500, { ok: false, error: error.message });
  const listings = (rows ?? []) as any[];

  // Without migration 0019 there is nowhere to record what was sent, so
  // nothing is sent. The public site already hides expired listings.
  if (listings.length > 0 && !('expiry_notice_sent_at' in listings[0])) {
    await logEvent({ kind: 'cron.daily', source: 'cron', payload: { skipped: 'migration-0019-missing' } }).catch(() => {});
    return json(200, { ok: true, skipped: 'migration-0019-missing' });
  }

  const ownerIds = [...new Set(listings.map((row) => row.owner_id).filter(Boolean))];
  const { data: owners } = ownerIds.length
    ? await admin.from('profiles').select('id, email, locale, full_name').in('id', ownerIds)
    : { data: [] as any[] };
  const ownerById = new Map((owners ?? []).map((o: any) => [o.id, o]));

  const counts = { expired: 0, firstReminder: 0, lastReminder: 0, refreshRequest: 0, refreshReminder: 0, emails: 0, deferred: 0 };

  /** Sets `column` to now only if it is still empty; true when this run won. */
  const claim = async (id: string, column: string, extra: Record<string, unknown> = {}) => {
    const { data } = await admin.from('properties').update({ [column]: now.toISOString(), ...extra }).eq('id', id).is(column, null).select('id');
    return (data ?? []).length === 1;
  };
  const budget = () => counts.emails < MAX_EMAILS;

  for (const row of listings) {
    const owner = row.owner_id ? ownerById.get(row.owner_id) : null;
    const locale = localeOf(owner);
    const action = expiryAction(row, rules, now);

    if (action === 'expire') {
      // Off the site first — even when the email budget is spent.
      const { data: archived } = await admin
        .from('properties')
        .update({ status: 'archived', expired_at: now.toISOString() })
        .eq('id', row.id).eq('status', 'published').lte('expires_at', now.toISOString())
        .select('id');
      if ((archived ?? []).length === 1) {
        counts.expired++;
        await logEvent({ kind: 'listing.expired', subjectType: 'property', subjectId: row.id, propertyId: row.id, source: 'cron', payload: { expires_at: row.expires_at } }).catch(() => {});
      }
      if (owner?.email && budget() && (await claim(row.id, 'expiry_notice_sent_at'))) {
        await deliver(owner.email, lifecycleEmails.listingExpired(locale, {
          ref: row.ref,
          title: await listingTitle(admin, row.id, locale, row.ref),
          renewUrl: ownerLink('renew', row.id, locale, RENEW_LINK_DAYS),
          price: formatCents(RENEWAL_CENTS, locale),
        }));
        counts.emails++;
      }
      continue;
    }

    if (action === 'first-reminder' || action === 'last-reminder') {
      if (!owner?.email) continue;
      if (!budget()) { counts.deferred++; continue; }
      const column = action === 'first-reminder' ? 'expiry_first_reminder_sent_at' : 'expiry_last_reminder_sent_at';
      // The last reminder also closes the first, so a listing published with
      // less than 14 days left never gets two emails in one week.
      const extra = action === 'last-reminder' && !row.expiry_first_reminder_sent_at ? { expiry_first_reminder_sent_at: now.toISOString() } : {};
      if (!(await claim(row.id, column, extra))) continue;
      await deliver(owner.email, lifecycleEmails.expiryReminder(locale, {
        ref: row.ref,
        title: await listingTitle(admin, row.id, locale, row.ref),
        url: await publicUrl(row, locale),
        expiresOn: new Date(row.expires_at).toLocaleDateString(intlTag(locale), { year: 'numeric', month: 'long', day: 'numeric' }),
        days: Math.max(1, daysLeft(row.expires_at, now)),
        renewUrl: ownerLink('renew', row.id, locale, RENEW_LINK_DAYS),
        price: formatCents(RENEWAL_CENTS, locale),
      }));
      counts.emails++;
      counts[action === 'first-reminder' ? 'firstReminder' : 'lastReminder']++;
      await logEvent({ kind: 'listing.expiry_reminder', subjectType: 'property', subjectId: row.id, propertyId: row.id, source: 'cron', payload: { which: action, expires_at: row.expires_at } }).catch(() => {});
      continue;
    }

    const refresh = refreshAction(row, rules, now);
    if (!refresh || !owner?.email) continue;
    if (!budget()) { counts.deferred++; continue; }

    let won = false;
    if (refresh === 'request') {
      // Claimed against the value this run read, so two runs can't both ask.
      let q = admin.from('properties').update({ refresh_requested_at: now.toISOString(), refresh_reminder_sent_at: null }).eq('id', row.id);
      q = row.refresh_requested_at ? q.eq('refresh_requested_at', row.refresh_requested_at) : q.is('refresh_requested_at', null);
      const { data } = await q.select('id');
      won = (data ?? []).length === 1;
    } else {
      won = await claim(row.id, 'refresh_reminder_sent_at');
    }
    if (!won) continue;

    await sendRefresh(admin, row, owner, rules, refresh === 'reminder');
    counts.emails++;
    counts[refresh === 'request' ? 'refreshRequest' : 'refreshReminder']++;
    await logEvent({ kind: refresh === 'request' ? 'listing.refresh_requested' : 'listing.refresh_reminded', subjectType: 'property', subjectId: row.id, propertyId: row.id, source: 'cron' }).catch(() => {});
  }

  // Expired on an earlier run whose email budget was spent: the notice is still owed.
  const { data: owed } = await admin
    .from('properties').select('*')
    .eq('status', 'archived').not('expired_at', 'is', null).is('expiry_notice_sent_at', null)
    .limit(MAX_EMAILS);
  for (const row of (owed ?? []) as any[]) {
    if (!budget()) { counts.deferred++; continue; }
    const owner = row.owner_id ? ownerById.get(row.owner_id) ?? (await admin.from('profiles').select('id, email, locale').eq('id', row.owner_id).maybeSingle()).data : null;
    if (!owner?.email || !(await claim(row.id, 'expiry_notice_sent_at'))) continue;
    const locale = localeOf(owner);
    await deliver(owner.email, lifecycleEmails.listingExpired(locale, {
      ref: row.ref,
      title: await listingTitle(admin, row.id, locale, row.ref),
      renewUrl: ownerLink('renew', row.id, locale, RENEW_LINK_DAYS),
      price: formatCents(RENEWAL_CENTS, locale),
    }));
    counts.emails++;
  }

  await logEvent({ kind: 'cron.daily', source: 'cron', payload: { ...counts, at: now.toISOString() } }).catch(() => {});
  return json(200, { ok: true, ...counts });
};

async function sendRefresh(admin: any, row: any, owner: any, rules: ListingRules, reminder: boolean) {
  const locale = localeOf(owner);
  // A reminder's links run out with the original request, not a week later.
  const base = reminder && row.refresh_requested_at ? new Date(row.refresh_requested_at) : new Date();
  const until = new Date(base.getTime() + rules.ownerRefresh.linkDays * 86_400_000);
  const days = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 86_400_000));
  await deliver(owner.email, lifecycleEmails.ownerRefresh(locale, {
    ref: row.ref,
    title: await listingTitle(admin, row.id, locale, row.ref),
    url: await publicUrl(row, locale),
    price: eur(row.price_eur, locale),
    stillUrl: ownerLink('still-available', row.id, locale, days),
    priceUrl: ownerLink('price', row.id, locale, days),
    soldUrl: ownerLink('sold', row.id, locale, days),
    validUntil: until.toLocaleDateString(intlTag(locale), { year: 'numeric', month: 'long', day: 'numeric' }),
    reminder,
  }));
}
