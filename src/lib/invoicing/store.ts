/**
 * Everything that reads or writes an invoice row. Takes the service-role
 * client: invoices are financial records and only admin code paths change
 * them. The rules that matter live in the database (0018): numbers are
 * allocated by finalise_invoice() in one transaction, and a finalised row can
 * only change its delivery / payment tracking.
 */
import { COMPANY } from '~/config/company';
import { getCompany } from '~/lib/runtime-config';
import { sendEmail } from '~/lib/email/send';
import { logEvent } from '~/lib/activity';
import { invoiceToBookkeeper, invoiceToCustomer } from './emails';
import { invoiceCatalogue, invoiceLineFromOrder } from './catalogue';
import {
  addDays, computeTotals, emptyParty, listPriceCents, rateFor, suggestVat, today,
  type DocKind, type InvoiceDoc, type InvoiceLine, type Issuer, type Party, type PaymentMethod, type PriceMode, type VatTreatment,
} from './model';
import { renderInvoicePdf } from './pdf';
import { buildIssuer, loadInvoiceSettings } from './settings';

export type InvoiceRow = Record<string, any>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string): boolean => UUID.test(v);

/** True once migration 0018 has been run. */
export async function isMigrated(client: any): Promise<boolean> {
  const { error } = await client.from('invoices').select('status, buyer').limit(1);
  return !error;
}

/**
 * Why the invoice screens think migration 0018 has not run: the database's own
 * answer, and which Supabase project this deployment is talking to. When the
 * migration was run in a different project than the one this site uses, the
 * project address here is what gives it away.
 */
export async function migrationDiagnosis(client: any): Promise<string> {
  const { error } = await client.from('invoices').select('status, buyer').limit(1);
  let host = '?';
  try {
    host = new URL(import.meta.env.SUPABASE_URL).hostname;
  } catch {}
  // An error can quote a configuration value back (a malformed key did exactly
  // that). Anything key-shaped is hidden and the text kept short.
  const answer = error ? `${error.code ?? ''} ${error.message}`.trim().replace(/eyJ[\w.-]+/g, '[kulcs]').replace(/sb_[\w-]{10,}/g, '[kulcs]').slice(0, 220) : 'rendben';
  return `Supabase-projekt: ${host}. Az adatbázis válasza: ${answer}.`;
}

/* ── Row ⇄ document ──────────────────────────────────────────────────────── */

function normaliseLines(raw: any, legacyDiscountCents = 0): InvoiceLine[] {
  const lines: InvoiceLine[] = (Array.isArray(raw) ? raw : []).map((l: any) => ({
    description: String(l.description ?? l.label ?? ''),
    descriptionNl: l.descriptionNl ? String(l.descriptionNl) : undefined,
    quantity: Number(l.quantity) || 1,
    unit: l.unit ?? undefined,
    unitNl: l.unitNl ?? undefined,
    unitCents: Number(l.unitCents) || 0,
    catalogId: l.catalogId ?? undefined,
    listCents: l.listCents ?? undefined,
    edited: l.edited ?? undefined,
  }));
  // Invoices issued by the first version carried the referral discount as a column.
  if (legacyDiscountCents > 0) {
    lines.push({ description: 'Ajánlói kedvezmény (10%)', descriptionNl: 'Verwijzingskorting (10%)', quantity: 1, unitCents: -legacyDiscountCents });
  }
  return lines;
}

export function rowToDoc(row: InvoiceRow, issuerFallback: Issuer): InvoiceDoc {
  const legacy = !row.buyer;
  const buyer: Party = legacy
    ? { ...emptyParty(), name: row.billing_name ?? '', street: row.billing_address ?? '', countryCode: '' }
    : { ...emptyParty(), ...row.buyer };
  const rate = Number(row.vat_rate ?? 21);
  const issued = String(row.issued_at ?? new Date().toISOString()).slice(0, 10);
  return {
    id: row.id,
    number: row.number ?? null,
    kind: row.kind,
    status: row.status ?? 'issued',
    issuer: row.issuer ?? issuerFallback,
    buyer,
    issuedAt: issued,
    supplyDate: String(row.supply_date ?? issued).slice(0, 10),
    dueDate: String(row.due_date ?? row.supply_date ?? issued).slice(0, 10),
    paymentMethod: (row.payment_method ?? 'transfer') as PaymentMethod,
    vatTreatment: (row.vat_treatment ?? 'nl_standard') as VatTreatment,
    vatRate: rate,
    priceMode: (row.price_mode ?? 'gross') as PriceMode,
    lines: normaliseLines(row.line_items, legacy ? Number(row.discount_cents ?? 0) : 0),
    fxRate: row.fx_rate ? Number(row.fx_rate) : null,
    reference: row.reference ?? '',
    referenceNumber: row.reference_number ?? null,
    notes: row.notes ?? '',
    locale: row.locale === 'nl' ? 'nl' : 'hu',
    settled: Boolean(row.paid_at) || row.status === 'paid',
  };
}

function docColumns(doc: InvoiceDoc) {
  const t = computeTotals(doc.lines, doc.vatRate, doc.priceMode);
  const iso = (d: string) => `${d}T12:00:00Z`;
  return {
    kind: doc.kind,
    issuer: doc.issuer,
    buyer: doc.buyer,
    billing_name: doc.buyer.name || null,
    billing_address: [doc.buyer.street, [doc.buyer.postalCode, doc.buyer.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') || null,
    line_items: doc.lines,
    discount_cents: 0,
    gross_cents: t.grossCents,
    net_cents: t.netCents,
    vat_cents: t.vatCents,
    vat_rate: doc.vatRate,
    vat_treatment: doc.vatTreatment,
    price_mode: doc.priceMode,
    payment_method: doc.paymentMethod,
    issued_at: iso(doc.issuedAt),
    supply_date: doc.supplyDate,
    due_date: doc.dueDate,
    fx_rate: doc.fxRate,
    reference: doc.reference || null,
    notes: doc.notes || null,
    locale: doc.locale,
  };
}

/* ── Reading ─────────────────────────────────────────────────────────────── */

export async function getRow(client: any, idOrNumber: string): Promise<InvoiceRow | null> {
  const q = client.from('invoices').select('*');
  const { data } = await (isUuid(idOrNumber) ? q.eq('id', idOrNumber) : q.eq('number', idOrNumber)).maybeSingle();
  return data ?? null;
}

export async function currentIssuer(client: any): Promise<Issuer> {
  const [company, settings] = await Promise.all([getCompany().catch(() => COMPANY), loadInvoiceSettings(client)]);
  return buildIssuer(company as any, settings);
}

/** A row's document, with the number of the invoice or proforma it points to. */
export async function loadDoc(client: any, row: InvoiceRow): Promise<InvoiceDoc> {
  const issuer = await currentIssuer(client);
  const refId = row.corrects_id ?? row.reference_id;
  let referenceNumber: string | null = null;
  if (refId) {
    const { data } = await client.from('invoices').select('number').eq('id', refId).maybeSingle();
    referenceNumber = data?.number ?? null;
  }
  return rowToDoc({ ...row, reference_number: referenceNumber }, issuer);
}

/* ── Problems that stop an invoice being issued ──────────────────────────── */

export function problemsToIssue(doc: InvoiceDoc): string[] {
  const out: string[] = [];
  if (!doc.buyer.name.trim()) out.push('A vevő neve hiányzik.');
  if (!doc.buyer.street.trim() || !doc.buyer.city.trim()) out.push('A vevő címe hiányos (utca és város szükséges).');
  if (!doc.buyer.countryCode) out.push('A vevő országa hiányzik.');
  if (!doc.lines.length) out.push('Legalább egy tétel szükséges.');
  doc.lines.forEach((l, i) => {
    if (!l.description.trim()) out.push(`A(z) ${i + 1}. tétel megnevezése hiányzik.`);
    if (!(l.quantity > 0)) out.push(`A(z) ${i + 1}. tétel mennyisége érvénytelen.`);
  });
  if (doc.vatTreatment === 'reverse_charge' && !doc.buyer.taxNumber?.trim()) out.push('Fordított adózáshoz a vevő adószáma kötelező.');
  if (computeTotals(doc.lines, doc.vatRate, doc.priceMode).grossCents <= 0 && doc.kind !== 'credit_note') out.push('A végösszeg nem lehet nulla vagy negatív.');
  return out;
}

/* ── Writing ─────────────────────────────────────────────────────────────── */

export async function saveDraft(
  admin: any,
  doc: InvoiceDoc,
  opts: { id?: string | null; userId?: string | null; paymentId?: string | null; ownerId?: string | null; propertyId?: string | null; referenceId?: string | null; paid?: boolean }
): Promise<InvoiceRow> {
  const columns: Record<string, any> = {
    ...docColumns(doc),
    status: 'draft',
    paid_at: opts.paid ? new Date().toISOString() : null,
  };
  if (opts.id) {
    const existing = await getRow(admin, opts.id);
    if (!existing) throw new Error('A piszkozat nem található.');
    if (existing.finalised_at) throw new Error('A kiállított számla már nem módosítható.');
    const { data, error } = await admin.from('invoices').update(columns).eq('id', opts.id).select('*').single();
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await admin
    .from('invoices')
    .insert({
      ...columns,
      payment_id: opts.paymentId ?? null,
      owner_id: opts.ownerId ?? null,
      property_id: opts.propertyId ?? null,
      reference_id: opts.referenceId ?? null,
      created_by: opts.userId ?? null,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDraft(admin: any, id: string): Promise<void> {
  const row = await getRow(admin, id);
  if (!row) return;
  if (row.finalised_at) throw new Error('Kiállított számla nem törölhető — jóváíró számlával korrigálható.');
  await admin.from('invoices').delete().eq('id', id);
}

/** Allocates the number and freezes the document. Idempotent. */
export async function issue(admin: any, id: string, actor: { id?: string | null; email?: string | null }): Promise<InvoiceRow> {
  const before = await getRow(admin, id);
  if (!before) throw new Error('A számla nem található.');
  const { data, error } = await admin.rpc('finalise_invoice', { p_id: id });
  if (error) throw new Error(error.message);
  const row = data as InvoiceRow;

  // A proforma is settled by the invoice that references it.
  if (row.reference_id && row.kind === 'invoice') {
    await admin.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', row.reference_id).eq('kind', 'proforma').neq('status', 'void');
  }
  if (!before.finalised_at) {
    await logEvent({
      kind: row.kind === 'credit_note' ? 'invoice.credit_note_issued' : 'invoice.issued',
      actorId: actor.id ?? null,
      actorEmail: actor.email ?? null,
      subjectType: 'invoice',
      subjectId: row.id,
      propertyId: row.property_id ?? null,
      source: 'portal',
      payload: { number: row.number },
    }).catch(() => {});
  }
  return row;
}

export async function markPaid(admin: any, id: string, paidOn?: string | null, note?: string): Promise<void> {
  const row = await getRow(admin, id);
  if (!row?.finalised_at) throw new Error('Csak kiállított számla jelölhető kifizetettnek.');
  const paidAt = paidOn ? `${paidOn}T12:00:00Z` : new Date().toISOString();
  const { error } = await admin.from('invoices').update({ status: 'paid', paid_at: paidAt, paid_note: note?.trim() || null }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markUnpaid(admin: any, id: string): Promise<void> {
  const row = await getRow(admin, id);
  if (!row?.finalised_at) return;
  const status = row.sent_at ? 'sent' : 'issued';
  const { error } = await admin.from('invoices').update({ status, paid_at: null, paid_note: null }).eq('id', id);
  if (error) throw new Error(error.message);
}

/** A credit note for a finalised invoice: the same lines, shown negative, issued at once. */
export async function createCreditNote(admin: any, id: string, actor: { id?: string | null; email?: string | null }): Promise<InvoiceRow> {
  const original = await getRow(admin, id);
  if (!original?.finalised_at || original.kind !== 'invoice') throw new Error('Jóváíró számla csak kiállított számlához készíthető.');
  const { data: existing } = await admin.from('invoices').select('id').eq('corrects_id', id).eq('kind', 'credit_note').limit(1);
  if (existing?.length) throw new Error('Ehhez a számlához már készült jóváíró számla.');

  const issuer = await currentIssuer(admin);
  const doc = rowToDoc(original, issuer);
  const credit: InvoiceDoc = { ...doc, kind: 'credit_note', status: 'draft', number: null, issuedAt: today(), supplyDate: today(), dueDate: today(), reference: `Jóváírás: ${original.number}`, settled: false };
  const { data, error } = await admin
    .from('invoices')
    .insert({
      ...docColumns(credit),
      status: 'draft',
      corrects_id: id,
      payment_id: original.payment_id,
      owner_id: original.owner_id,
      property_id: original.property_id,
      created_by: actor.id ?? null,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  const row = await issue(admin, data.id, actor);
  await admin.from('invoices').update({ status: 'void' }).eq('id', id);
  return row;
}

/** A new invoice draft that settles a proforma (díjbekérő). */
export async function proformaToInvoice(admin: any, id: string, actor: { id?: string | null }): Promise<InvoiceRow> {
  const proforma = await getRow(admin, id);
  if (!proforma?.finalised_at || proforma.kind !== 'proforma') throw new Error('Csak kiállított díjbekérőből készíthető számla.');
  const issuer = await currentIssuer(admin);
  const doc = rowToDoc(proforma, issuer);
  const settings = await loadInvoiceSettings(admin);
  const invoice: InvoiceDoc = {
    ...doc,
    kind: 'invoice', status: 'draft', number: null,
    issuedAt: today(), supplyDate: today(), dueDate: addDays(today(), settings.paymentTermsDays),
    reference: `${proforma.number} számú díjbekérő`, settled: false,
  };
  return saveDraft(admin, invoice, { userId: actor.id, ownerId: proforma.owner_id, propertyId: proforma.property_id, paymentId: proforma.payment_id, referenceId: id });
}

/* ── From an order ───────────────────────────────────────────────────────── */

/** The customer as the system already knows them: order → account → what Stripe collected. */
export async function resolveBuyer(admin: any, payment: InvoiceRow): Promise<{ buyer: Party; locale: 'hu' | 'nl' }> {
  const { data: owner } = payment.owner_id
    ? await admin.from('profiles').select('full_name, email, phone, locale, billing').eq('id', payment.owner_id).maybeSingle()
    : { data: null };
  const pick = (...vals: unknown[]): string => String(vals.find((v) => typeof v === 'string' && v.trim()) ?? '').trim();
  const a = (owner?.billing ?? {}) as Partial<Party>;
  const b = (payment.billing ?? {}) as Partial<Party>;
  const buyer: Party = {
    type: (b.type ?? a.type ?? 'person') as Party['type'],
    name: pick(b.name, a.name, payment.billing_name, owner?.full_name),
    street: pick(b.street, a.street, payment.billing_address),
    postalCode: pick(b.postalCode, a.postalCode),
    city: pick(b.city, a.city),
    countryCode: pick(b.countryCode, a.countryCode) || 'HU',
    email: pick(b.email, owner?.email, payment.contact_email),
    phone: pick(b.phone, a.phone, owner?.phone),
    taxNumber: pick(b.taxNumber, a.taxNumber),
  };
  return { buyer, locale: (owner?.locale ?? payment.locale) === 'nl' ? 'nl' : 'hu' };
}

/** Re-prices every price-list line for the chosen treatment. Typed-over lines stay as they are. */
export function repriceLines(lines: InvoiceLine[], vatRate: number, mode: PriceMode): InvoiceLine[] {
  return lines.map((l) => (l.catalogId && l.listCents != null && !l.edited ? { ...l, unitCents: listPriceCents(l.listCents, vatRate, mode) } : l));
}

/** A draft invoice from an order, with the customer's data and the VAT treatment already filled in. */
export async function createDraftFromPayment(admin: any, paymentId: string, actor: { id?: string | null }): Promise<InvoiceRow> {
  const { data: existing } = await admin.from('invoices').select('id').eq('payment_id', paymentId).eq('status', 'draft').limit(1);
  if (existing?.length) return (await getRow(admin, existing[0].id))!;

  const { data: payment } = await admin.from('payments').select('*').eq('id', paymentId).maybeSingle();
  if (!payment) throw new Error('A megrendelés nem található.');

  const [company, settings, issuer] = await Promise.all([
    getCompany().catch(() => COMPANY),
    loadInvoiceSettings(admin),
    currentIssuer(admin),
  ]);
  const { buyer, locale } = await resolveBuyer(admin, payment);
  const vat = suggestVat(buyer);
  const catalogue = invoiceCatalogue((company as any).services);

  const mode: PriceMode = vat.rate === 0 ? 'net' : 'gross';
  const lines = repriceLines(((payment.line_items ?? []) as any[]).map((l) => invoiceLineFromOrder(l, catalogue)), vat.rate, mode);
  if (payment.discount_cents > 0) {
    // The referral discount scales with the price, like every other line.
    const discount = vat.rate === 0 ? payment.discount_cents / 1.21 : payment.discount_cents;
    lines.push({ description: 'Ajánlói kedvezmény (10%)', descriptionNl: 'Verwijzingskorting (10%)', quantity: 1, unitCents: -discount, edited: true });
  }

  const paid = ['paid', 'manual'].includes(payment.status);
  const paidDay = (payment.paid_at ? String(payment.paid_at) : new Date().toISOString()).slice(0, 10);
  const doc: InvoiceDoc = {
    number: null, kind: 'invoice', status: 'draft', issuer, buyer,
    issuedAt: today(),
    supplyDate: paid ? paidDay : today(),
    dueDate: paid ? today() : addDays(today(), settings.paymentTermsDays),
    paymentMethod: payment.stripe_session_id && paid ? 'card' : 'transfer',
    vatTreatment: vat.treatment, vatRate: vat.rate, priceMode: mode,
    lines, fxRate: null, reference: '', notes: settings.defaultNotes, locale, settled: paid,
  };
  return saveDraft(admin, doc, {
    userId: actor.id, paymentId, ownerId: payment.owner_id, propertyId: payment.property_id, paid,
  });
}

/* ── Sending ─────────────────────────────────────────────────────────────── */

export const pdfName = (number: string): string => `${number.replace(/[\\/]/g, '-')}.pdf`;
export const viewUrl = (origin: string, row: InvoiceRow): string => `${origin}/portal/invoices/${row.id}?t=${row.view_token}`;

export type SendResult = { client: 'sent' | 'skipped' | 'failed'; bookkeeper: 'sent' | 'skipped' | 'failed'; clientTo?: string };

export async function sendInvoice(
  admin: any,
  id: string,
  opts: { client: boolean; bookkeeper: 'auto' | boolean; origin: string; to?: string },
  actor: { id?: string | null; email?: string | null }
): Promise<SendResult> {
  const row = await getRow(admin, id);
  if (!row?.finalised_at) throw new Error('Előbb ki kell állítani a számlát.');
  const [doc, settings] = await Promise.all([loadDoc(admin, row), loadInvoiceSettings(admin)]);
  const pdf = await renderInvoicePdf(doc);
  const attachment = [{ filename: pdfName(row.number), content: pdf }];
  const url = viewUrl(opts.origin, row);
  const result: SendResult = { client: 'skipped', bookkeeper: 'skipped' };
  const patch: Record<string, any> = {};

  const to = (opts.to ?? doc.buyer.email ?? '').trim();
  if (opts.client) {
    if (!to) {
      result.client = 'failed';
    } else {
      const mail = invoiceToCustomer(doc, url);
      const ok = await sendEmail({ to, subject: mail.subject, html: mail.html, text: mail.text, attachments: attachment });
      result.client = ok ? 'sent' : 'failed';
      result.clientTo = to;
      if (ok) {
        patch.sent_at = new Date().toISOString();
        patch.sent_to = to;
        if (row.status === 'issued') patch.status = 'sent';
      }
    }
  }

  const wantBookkeeper = opts.bookkeeper === true || (opts.bookkeeper === 'auto' && settings.autoBookkeeperCopy);
  if (wantBookkeeper && settings.bookkeeperEmail) {
    const mail = invoiceToBookkeeper(doc, url);
    const ok = await sendEmail({ to: settings.bookkeeperEmail, subject: mail.subject, html: mail.html, text: mail.text, attachments: attachment });
    result.bookkeeper = ok ? 'sent' : 'failed';
    if (ok) patch.bookkeeper_sent_at = new Date().toISOString();
  } else if (opts.bookkeeper === true) {
    result.bookkeeper = 'failed';
  }

  if (Object.keys(patch).length) await admin.from('invoices').update(patch).eq('id', id);
  await logEvent({
    kind: 'invoice.sent',
    actorId: actor.id ?? null,
    actorEmail: actor.email ?? null,
    subjectType: 'invoice',
    subjectId: row.id,
    propertyId: row.property_id ?? null,
    source: 'portal',
    payload: { number: row.number, ...result },
  }).catch(() => {});
  return result;
}

/* ── Lists and look-ups ──────────────────────────────────────────────────── */

export type InvoiceListItem = {
  id: string; number: string | null; kind: DocKind; status: string; buyerName: string; buyerCountry: string;
  issuedAt: string; dueDate: string | null; grossCents: number; netCents: number; vatCents: number; vatRate: number;
  fxRate: number | null; sentAt: string | null; bookkeeperSentAt: string | null; paidAt: string | null; overdue: boolean;
};

export function toListItem(row: InvoiceRow): InvoiceListItem {
  const sign = row.kind === 'credit_note' ? -1 : 1;
  const due = row.due_date ? String(row.due_date).slice(0, 10) : null;
  const status = row.status ?? 'issued';
  return {
    id: row.id, number: row.number ?? null, kind: row.kind, status,
    buyerName: row.buyer?.name ?? row.billing_name ?? '—', buyerCountry: row.buyer?.countryCode ?? '',
    issuedAt: String(row.issued_at).slice(0, 10), dueDate: due,
    grossCents: row.gross_cents * sign, netCents: row.net_cents * sign, vatCents: row.vat_cents * sign, vatRate: Number(row.vat_rate),
    fxRate: row.fx_rate ? Number(row.fx_rate) : null, sentAt: row.sent_at ?? null, bookkeeperSentAt: row.bookkeeper_sent_at ?? null, paidAt: row.paid_at ?? null,
    overdue: Boolean(due) && due! < today() && ['issued', 'sent'].includes(status) && row.kind !== 'credit_note',
  };
}

/** People the admin can bill with one click: portal accounts, then earlier invoice customers. */
export async function searchCustomers(admin: any, q: string): Promise<(Party & { source: 'account' | 'invoice'; ownerId?: string; locale?: 'hu' | 'nl' })[]> {
  const term = q.replace(/[,()%*]/g, ' ').trim();
  if (term.length < 2) return [];
  const [accounts, previous] = await Promise.all([
    admin.from('profiles').select('id, full_name, email, phone, locale, billing').or(`full_name.ilike.%${term}%,email.ilike.%${term}%`).limit(6),
    admin.from('invoices').select('buyer').not('buyer', 'is', null).ilike('buyer->>name', `%${term}%`).order('created_at', { ascending: false }).limit(12),
  ]);
  const out: (Party & { source: 'account' | 'invoice'; ownerId?: string; locale?: 'hu' | 'nl' })[] = [];
  for (const p of accounts.data ?? []) {
    const b = (p.billing ?? {}) as Partial<Party>;
    out.push({
      ...emptyParty(), ...b, name: b.name || p.full_name || p.email, email: p.email, phone: b.phone || p.phone || '',
      source: 'account', ownerId: p.id, locale: p.locale === 'nl' ? 'nl' : 'hu',
    });
  }
  const seen = new Set(out.map((o) => `${o.name}|${o.email}`.toLowerCase()));
  for (const r of previous.data ?? []) {
    const b = { ...emptyParty(), ...(r.buyer as Party) };
    const key = `${b.name}|${b.email}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...b, source: 'invoice' });
  }
  return out.slice(0, 10);
}

export { rateFor };

/* ── Untrusted input ─────────────────────────────────────────────────────── */

const str = (v: unknown, max = 200): string => String(v ?? '').trim().slice(0, max);
const isoDate = (v: unknown, fallback: string): string => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? '')) ? String(v) : fallback);
const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback);

/** The editor's document, made safe. The issuer is never taken from the browser. */
export function sanitiseDoc(input: any, issuer: Issuer): InvoiceDoc {
  const b = input?.buyer ?? {};
  const kind = pick<DocKind>(input?.kind, ['invoice', 'proforma', 'credit_note'], 'invoice');
  const treatment = pick<VatTreatment>(input?.vatTreatment, ['nl_standard', 'reverse_charge', 'outside_scope', 'custom'], 'nl_standard');
  const customRate = Math.min(Math.max(Number(input?.vatRate) || 0, 0), 30);
  const num = (v: unknown, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
  const lines: InvoiceLine[] = (Array.isArray(input?.lines) ? input.lines : []).slice(0, 40).map((l: any) => ({
    description: str(l.description, 240),
    descriptionNl: str(l.descriptionNl, 240) || undefined,
    quantity: Math.min(Math.max(num(l.quantity, 1), 0), 100000),
    unit: str(l.unit, 20) || undefined,
    unitNl: str(l.unitNl, 20) || undefined,
    unitCents: Math.round(num(l.unitCents) * 1000) / 1000,
    catalogId: str(l.catalogId, 60) || undefined,
    listCents: l.listCents != null ? num(l.listCents) : undefined,
    edited: l.edited ? true : undefined,
  }));
  const fx = num(input?.fxRate);
  const issued = isoDate(input?.issuedAt, today());
  return {
    number: null, kind, status: 'draft', issuer,
    buyer: {
      type: b.type === 'company' ? 'company' : 'person',
      name: str(b.name), street: str(b.street), postalCode: str(b.postalCode, 20), city: str(b.city, 80),
      countryCode: str(b.countryCode, 2).toUpperCase(), email: str(b.email, 160), phone: str(b.phone, 40), taxNumber: str(b.taxNumber, 40),
    },
    issuedAt: issued,
    supplyDate: isoDate(input?.supplyDate, issued),
    dueDate: isoDate(input?.dueDate, issued),
    paymentMethod: pick<PaymentMethod>(input?.paymentMethod, ['transfer', 'card', 'cash'], 'transfer'),
    vatTreatment: treatment,
    vatRate: rateFor(treatment, customRate),
    priceMode: input?.priceMode === 'net' ? 'net' : 'gross',
    lines,
    fxRate: fx > 0 && fx < 100000 ? Math.round(fx * 10000) / 10000 : null,
    reference: str(input?.reference, 160),
    notes: str(input?.notes, 600),
    locale: input?.locale === 'nl' ? 'nl' : 'hu',
    settled: Boolean(input?.settled),
  };
}
