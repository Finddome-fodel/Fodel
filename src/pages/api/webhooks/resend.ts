/**
 * Resend's webhook: delivered / opened / clicked / bounced / complained for
 * the template emails in mail_messages (src/lib/mail/tracking.ts).
 *
 * Set up in Resend → Webhooks → endpoint https://<site>/api/webhooks/resend,
 * those five events; its signing secret goes in RESEND_WEBHOOK_SECRET. Without
 * the secret every call is refused — an unsigned endpoint would let anyone
 * mark an address as bounced and stop all mail to it.
 *
 * Idempotent: each delivery's svix-id is stored once; Resend's retries of the
 * same event are acknowledged and skipped. A bounce or spam complaint puts the
 * address on the suppression list, for any of our emails — the lifecycle
 * mails are not stored here but their bounces still mean the address is dead.
 */
import type { APIRoute } from 'astro';
import { SITE_HOST } from '~/config/site.mjs';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import { classifyLink, mapEventType, verifySvix, type ResendEvent } from '~/lib/mail/tracking';
import { suppress } from '~/lib/mail/suppression';

export const prerender = false;

const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET ?? import.meta.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return new Response('RESEND_WEBHOOK_SECRET is not configured', { status: 503 });

  const raw = await request.text();
  const svixId = request.headers.get('svix-id');
  const valid = verifySvix(raw, { id: svixId, timestamp: request.headers.get('svix-timestamp'), signature: request.headers.get('svix-signature') }, secret);
  if (!valid) return new Response('Invalid signature', { status: 401 });

  let event: ResendEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: inserted, error: insertError } = await admin
    .from('mail_webhook_events')
    .insert({ external_id: svixId, type: event.type, payload: event })
    .select('id')
    .single();
  // Already seen (unique external_id): Resend retried a delivery we processed.
  if (insertError?.code === '23505') return ok();
  // Anything else (database unreachable, migration 0038 not run yet): answer
  // with an error so Resend keeps the event and delivers it again later,
  // instead of it being acknowledged and lost.
  if (insertError || !inserted) {
    console.error('[mail] webhook event not stored', svixId, insertError?.message);
    return new Response('Event could not be stored, please retry', { status: 503 });
  }

  try {
    const type = mapEventType(event.type);
    if (type && event.data?.email_id) {
      const { data: message } = await admin.from('mail_messages').select('id, to_email, status').eq('resend_id', event.data.email_id).maybeSingle();

      if (message) {
        const click = type === 'CLICKED' ? event.data.click?.link ?? null : null;
        await admin.from('mail_events').insert({
          message_id: message.id,
          type,
          url: click,
          link_type: click ? classifyLink(click, SITE_HOST) : null,
          occurred_at: event.created_at ?? new Date().toISOString(),
        });
        // Status only moves forward: an "opened" never overwrites "bounced".
        if (type === 'DELIVERED' && message.status === 'SENT') await admin.from('mail_messages').update({ status: 'DELIVERED' }).eq('id', message.id);
        if (type === 'BOUNCED' || type === 'COMPLAINED') await admin.from('mail_messages').update({ status: type }).eq('id', message.id);
      }

      // Only a hard bounce means a dead address. A soft one (mailbox full,
      // server busy) or one the receiving server could not classify
      // ("Undetermined") is recorded on the message but does not block the
      // address for good; a real hard bounce on the next send will.
      const permanent = type === 'COMPLAINED' || (type === 'BOUNCED' && (event.data.bounce?.type ?? 'Permanent').toLowerCase() === 'permanent');
      if (permanent) {
        for (const address of message ? [message.to_email] : event.data.to ?? []) {
          await suppress(admin, { email: address, reason: type === 'COMPLAINED' ? 'COMPLAINED' : 'BOUNCED', note: type === 'COMPLAINED' ? 'Resend: a címzett spamnek jelölte' : 'Resend: végleges visszapattanás' });
        }
      }
    }
    await admin.from('mail_webhook_events').update({ status: 'PROCESSED', processed_at: new Date().toISOString() }).eq('id', inserted.id);
  } catch (error) {
    await admin
      .from('mail_webhook_events')
      .update({ status: 'FAILED', error: error instanceof Error ? error.message : String(error), processed_at: new Date().toISOString() })
      .eq('id', inserted.id);
  }
  return ok();
};
