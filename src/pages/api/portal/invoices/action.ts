/**
 * Every admin action on an invoice. One endpoint, one JSON body
 * ({ action, … }), because the editor and the invoice screen do many small
 * things and each one should be a single round trip.
 *
 * Whatever the browser sends is sanitised (sanitiseDoc) and the seller's own
 * details are always rebuilt on the server. The number is allocated by the
 * database when the invoice is issued, never here.
 */
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '~/lib/supabase-server';
import {
  createCreditNote, createDraftFromPayment, currentIssuer, deleteDraft, getRow, issue, markPaid, markUnpaid,
  problemsToIssue, proformaToInvoice, sanitiseDoc, saveDraft, sendInvoice, isMigrated,
} from '~/lib/invoicing/store';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, locals }) => {
  const { profile, user } = locals;
  if (profile?.role !== 'admin') return json(403, { ok: false, error: 'forbidden' });
  const admin = createSupabaseAdminClient();
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? '');
  const actor = { id: user?.id ?? null, email: profile?.email ?? null };
  const origin = new URL(request.url).origin;

  if (!(await isMigrated(admin))) {
    return json(409, { ok: false, error: 'not-migrated', message: 'Előbb futtassa le a 0018_invoicing_v2.sql migrációt a Supabase-ben.' });
  }

  try {
    /* ── draft: create or update ─────────────────────────────────────────── */
    if (action === 'save' || action === 'issue') {
      const issuer = await currentIssuer(admin);
      const doc = sanitiseDoc(body.doc, issuer);
      const existing = body.id ? await getRow(admin, String(body.id)) : null;
      if (existing?.finalised_at) return json(409, { ok: false, error: 'finalised', message: 'Ez a számla már ki van állítva.' });

      if (action === 'issue') {
        const problems = problemsToIssue(doc);
        if (problems.length) return json(422, { ok: false, error: 'problems', problems });
      }
      const row = await saveDraft(admin, doc, {
        id: existing?.id ?? null,
        userId: actor.id,
        paymentId: existing?.payment_id ?? body.paymentId ?? null,
        ownerId: existing?.owner_id ?? body.ownerId ?? null,
        propertyId: existing?.property_id ?? null,
        referenceId: existing?.reference_id ?? body.referenceId ?? null,
        paid: Boolean(body.doc?.settled),
      });
      if (action === 'save') return json(200, { ok: true, id: row.id });

      const issued = await issue(admin, row.id, actor);
      const send = body.send
        ? await sendInvoice(admin, issued.id, { client: Boolean(body.send.client), bookkeeper: body.send.bookkeeper === false ? false : 'auto', origin, to: body.send.to }, actor)
        : null;
      return json(200, { ok: true, id: issued.id, number: issued.number, send });
    }

    /* ── from an order ───────────────────────────────────────────────────── */
    if (action === 'from_payment') {
      const row = await createDraftFromPayment(admin, String(body.paymentId ?? ''), actor);
      return json(200, { ok: true, id: row.id });
    }

    const id = String(body.id ?? '');
    if (!id) return json(400, { ok: false, error: 'id-required' });

    if (action === 'send') {
      const result = await sendInvoice(admin, id, { client: body.client !== false, bookkeeper: body.bookkeeper === true ? true : body.bookkeeper === false ? false : 'auto', origin, to: body.to }, actor);
      return json(200, { ok: true, send: result });
    }
    if (action === 'send_bookkeeper') {
      const result = await sendInvoice(admin, id, { client: false, bookkeeper: true, origin }, actor);
      return json(200, { ok: result.bookkeeper === 'sent', send: result, error: result.bookkeeper === 'sent' ? undefined : 'bookkeeper-failed' });
    }
    if (action === 'mark_paid') {
      await markPaid(admin, id, body.date ? String(body.date) : null, body.note ? String(body.note) : undefined);
      return json(200, { ok: true });
    }
    if (action === 'mark_unpaid') {
      await markUnpaid(admin, id);
      return json(200, { ok: true });
    }
    if (action === 'credit') {
      const row = await createCreditNote(admin, id, actor);
      return json(200, { ok: true, id: row.id, number: row.number });
    }
    if (action === 'to_invoice') {
      const row = await proformaToInvoice(admin, id, actor);
      return json(200, { ok: true, id: row.id });
    }
    if (action === 'void_proforma') {
      const row = await getRow(admin, id);
      if (row?.kind !== 'proforma' || !row.finalised_at) return json(409, { ok: false, error: 'not-proforma' });
      const { error } = await admin.from('invoices').update({ status: 'void' }).eq('id', id);
      if (error) throw new Error(error.message);
      return json(200, { ok: true });
    }
    if (action === 'delete_draft') {
      await deleteDraft(admin, id);
      return json(200, { ok: true });
    }
  } catch (error) {
    return json(500, { ok: false, error: 'failed', message: (error as Error).message });
  }
  return json(400, { ok: false, error: 'unknown-action' });
};
