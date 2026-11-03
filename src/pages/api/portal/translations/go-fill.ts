/**
 * "Go nyelvek pótlása (EN, DE)": every live listing comes with English and German (the Go package). Listings that
 * went live before the packages existed, or whose first run failed, may lack them; this queues what is missing,
 * oldest first, and stops when today's AI budget (TRANSLATION_DAILY_CAP_EUR, counting what is already waiting)
 * would be used up. Pressing it again tomorrow continues. Admin only (the middleware guards this prefix).
 * The queue itself is worked on by the translate cron, which keeps handing itself on while there is work and budget.
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { getCompany } from '~/lib/runtime-config';
import { listingCatalog } from '~/lib/listing-packages';
import { ensurePackageTranslations } from '~/lib/ai/translation-entitlement';
import { dailyCapMicroEur, kickTranslation, spentTodayMicroEur } from '~/lib/ai/translation-jobs';
import { logEvent } from '~/lib/activity';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export const POST: APIRoute = async ({ locals, request }) => {
  if (locals.profile?.role !== 'admin') return json(403, { ok: false, error: 'forbidden' });
  const admin = createSupabaseAdminClient();
  const cfg = listingCatalog((await getCompany()).services).translation;

  const waiting = async (): Promise<number> => {
    const { data } = await admin.from('translation_jobs').select('estimated_cost_micro_eur').in('status', ['queued', 'running']);
    return (data ?? []).reduce((sum: number, job: { estimated_cost_micro_eur: number | null }) => sum + Number(job.estimated_cost_micro_eur ?? 0), 0);
  };
  const { data: live, error } = await admin.from('properties').select('id').eq('status', 'published').order('published_at', { ascending: true }).limit(1000);
  if (error) return json(500, { ok: false, error: 'read-failed', message: 'A hirdetések most nem olvashatók.' });

  const cap = dailyCapMicroEur();
  const spent = await spentTodayMicroEur(admin).catch(() => 0);
  let queuedCost = await waiting();
  let listings = 0;
  let languages = 0;
  let deferred = 0;
  for (const row of live ?? []) {
    if (spent + queuedCost >= cap) { deferred += 1; continue; }
    const created = await ensurePackageTranslations(admin, row.id, cfg);
    if (created.length === 0) continue;
    listings += 1;
    languages += created.length;
    queuedCost = await waiting();
  }
  // Listings that need nothing are not counted as deferred: only the ones the budget stopped.
  if (languages > 0) await kickTranslation(new URL(request.url).origin);
  await logEvent({
    kind: 'translation.go_fill', actorId: locals.user?.id ?? null, actorEmail: locals.profile?.email ?? null, subjectType: 'property', subjectId: null,
    source: 'portal', payload: { listings, languages, deferredChecked: deferred },
  }).catch(() => {});
  return json(200, { ok: true, listings, languages, budgetStopped: deferred > 0 && spent + queuedCost >= cap });
};
