/**
 * The invoice model: types, the arithmetic, the Dutch VAT rules and the
 * bilingual wording. Pure functions only — no database, no framework — so the
 * server (PDF, API), the invoice screen and the live preview in the editor all
 * compute exactly the same numbers from the same code.
 *
 * FODEL is a Dutch company selling advertising to (mostly Hungarian) owners.
 * What the Dutch rules ask of the invoice, and where it lives here:
 *  - a unique, sequential number                    → finalise_invoice() in 0018
 *  - issue date and supply date                     → InvoiceDoc.issuedAt / supplyDate
 *  - the supplier's and the customer's name and address
 *  - the supplier's BTW-id and KvK number
 *  - the customer's BTW-id when the VAT is reverse-charged → suggestVat()
 *  - net amount per rate, the rate, the VAT amount   → computeTotals()
 *  - the legal reason when no VAT is charged         → VAT_NOTES
 * Which treatment applies to a given customer is a tax judgement; suggestVat()
 * only proposes the usual one, and the editor lets the admin override it.
 */

export type DocKind = 'invoice' | 'proforma' | 'credit_note';
export type DocStatus = 'draft' | 'issued' | 'sent' | 'paid' | 'void';
export type VatTreatment = 'nl_standard' | 'reverse_charge' | 'outside_scope' | 'custom';
export type PriceMode = 'gross' | 'net';
export type PaymentMethod = 'transfer' | 'card' | 'cash';

/** The Dutch standard rate, in percent. */
export const NL_VAT_RATE = 21;

export type Party = {
  type: 'person' | 'company';
  /** The invoiced name: the person, or the company. */
  name: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  email?: string;
  phone?: string;
  /** Hungarian adószám or any other tax / VAT id, as the customer gave it. */
  taxNumber?: string;
};

export type Issuer = {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  vatId: string;
  kvk: string | null;
  iban: string;
  bic: string;
  /** Hungarian forint account, shown when the amount is also stated in HUF. */
  huAccount: string;
};

export type InvoiceLine = {
  description: string;
  descriptionNl?: string;
  quantity: number;
  unit?: string;
  unitNl?: string;
  /** In cents, per `priceMode`. May be fractional (€ 9.503 × 6 = € 57.02). */
  unitCents: number;
  /** Set when the line came from the price list; such a line is re-priced if the VAT treatment changes. */
  catalogId?: string;
  /** The price list's gross (VAT-inclusive) price, in cents. */
  listCents?: number;
  /** True once someone typed over the price: it is never re-priced again. */
  edited?: boolean;
};

export type InvoiceDoc = {
  id?: string;
  number: string | null;
  kind: DocKind;
  status: DocStatus;
  issuer: Issuer;
  buyer: Party;
  issuedAt: string; // YYYY-MM-DD
  supplyDate: string;
  dueDate: string;
  paymentMethod: PaymentMethod;
  vatTreatment: VatTreatment;
  vatRate: number;
  priceMode: PriceMode;
  lines: InvoiceLine[];
  /** HUF per EUR; when set the forint amount is printed too. */
  fxRate: number | null;
  reference: string;
  /** The number of the document this one corrects or settles, for display. */
  referenceNumber?: string | null;
  notes: string;
  /** The language of the covering email; the document itself is always bilingual. */
  locale: 'hu' | 'nl';
  /** True when the money has already arrived: no payment instructions are printed. */
  settled: boolean;
};

/* ── Arithmetic ──────────────────────────────────────────────────────────── */

export const lineValueCents = (line: InvoiceLine): number => Math.round(line.quantity * line.unitCents);

export type Totals = {
  rows: { netCents: number; vatCents: number; grossCents: number }[];
  netCents: number;
  vatCents: number;
  grossCents: number;
};

/**
 * Net, VAT and gross for a set of lines.
 *
 * Totals are decided first and the per-line figures are made to add up to
 * them (the last line absorbs a cent of rounding), so the table can never
 * disagree with its own bottom line.
 */
export function computeTotals(lines: InvoiceLine[], vatRate: number, mode: PriceMode): Totals {
  const values = lines.map(lineValueCents);
  const sum = values.reduce((a, b) => a + b, 0);
  const rate = vatRate / 100;
  let netCents: number;
  let vatCents: number;
  let grossCents: number;
  let rows: Totals['rows'];

  if (mode === 'gross') {
    grossCents = sum;
    netCents = Math.round(grossCents / (1 + rate));
    vatCents = grossCents - netCents;
    rows = values.map((gross) => {
      const net = Math.round(gross / (1 + rate));
      return { netCents: net, vatCents: gross - net, grossCents: gross };
    });
    fix(rows, 'netCents', netCents);
    rows.forEach((r) => (r.vatCents = r.grossCents - r.netCents));
  } else {
    netCents = sum;
    vatCents = Math.round(netCents * rate);
    grossCents = netCents + vatCents;
    rows = values.map((net) => {
      const vat = Math.round(net * rate);
      return { netCents: net, vatCents: vat, grossCents: net + vat };
    });
    fix(rows, 'vatCents', vatCents);
    rows.forEach((r) => (r.grossCents = r.netCents + r.vatCents));
  }
  return { rows, netCents, vatCents, grossCents };
}

function fix(rows: Totals['rows'], key: 'netCents' | 'vatCents', target: number) {
  if (!rows.length) return;
  const diff = target - rows.reduce((a, r) => a + r[key], 0);
  if (diff) rows[rows.length - 1][key] += diff;
}

/** Forint amount for a euro total, rounded to whole forints. */
export const hufFromCents = (cents: number, rate: number): number => Math.round((cents / 100) * rate);

/**
 * What a price-list entry costs on this invoice. The published prices contain
 * 21% Dutch VAT. A zero-rated invoice charges the net amount (€ 69 → € 57.02,
 * as on FODEL's own sample); a net-priced one shows the net and adds VAT on
 * top; a gross-priced one scales the net to the chosen rate.
 */
export function listPriceCents(listGrossCents: number, vatRate: number, mode: PriceMode): number {
  const net = listGrossCents / (1 + NL_VAT_RATE / 100);
  if (mode === 'net' || vatRate === 0) return net;
  return net * (1 + vatRate / 100);
}

/* ── Formatting ──────────────────────────────────────────────────────────── */

const NBSP = ' ';

/** "€ 1,234.50": the sample invoice's own convention (dot decimals, euro sign first). */
export function eur(cents: number): string {
  const v = (cents < 0 ? -cents : cents) / 100;
  const [i, d] = v.toFixed(2).split('.');
  return `${cents < 0 ? '−' : ''}€${NBSP}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${d}`;
}

/** "20.735 Ft" — Hungarian grouping with dots. */
export const huf = (amount: number): string => `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${NBSP}Ft`;

/** 2026-08-24 → "2026.08.24." (the Hungarian invoice date style). */
export const dateHu = (iso: string): string => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${y}.${m}.${d}.` : '';
};

export const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * "Lejárt" (overdue) is derived, never stored — the status constraint stays
 * draft / issued / sent / paid / void. An invoice or proforma that was issued
 * or sent, is not paid, and whose due date is before today. Credit notes are
 * never overdue: nobody owes FODEL money on one.
 */
export function isOverdue(doc: { status?: string | null; kind?: string | null; dueDate?: string | null }, onDay: string = today()): boolean {
  const due = doc.dueDate ? String(doc.dueDate).slice(0, 10) : '';
  return Boolean(due) && due < onDay && ['issued', 'sent'].includes(doc.status ?? 'issued') && doc.kind !== 'credit_note';
}
export const addDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/* ── Countries and tax ids ───────────────────────────────────────────────── */

export const COUNTRIES: { code: string; hu: string; nl: string; eu: boolean }[] = [
  { code: 'HU', hu: 'Magyarország', nl: 'Hongarije', eu: true },
  { code: 'NL', hu: 'Hollandia', nl: 'Nederland', eu: true },
  { code: 'DE', hu: 'Németország', nl: 'Duitsland', eu: true },
  { code: 'AT', hu: 'Ausztria', nl: 'Oostenrijk', eu: true },
  { code: 'BE', hu: 'Belgium', nl: 'België', eu: true },
  { code: 'FR', hu: 'Franciaország', nl: 'Frankrijk', eu: true },
  { code: 'IT', hu: 'Olaszország', nl: 'Italië', eu: true },
  { code: 'ES', hu: 'Spanyolország', nl: 'Spanje', eu: true },
  { code: 'PT', hu: 'Portugália', nl: 'Portugal', eu: true },
  { code: 'IE', hu: 'Írország', nl: 'Ierland', eu: true },
  { code: 'LU', hu: 'Luxemburg', nl: 'Luxemburg', eu: true },
  { code: 'DK', hu: 'Dánia', nl: 'Denemarken', eu: true },
  { code: 'SE', hu: 'Svédország', nl: 'Zweden', eu: true },
  { code: 'FI', hu: 'Finnország', nl: 'Finland', eu: true },
  { code: 'PL', hu: 'Lengyelország', nl: 'Polen', eu: true },
  { code: 'CZ', hu: 'Csehország', nl: 'Tsjechië', eu: true },
  { code: 'SK', hu: 'Szlovákia', nl: 'Slowakije', eu: true },
  { code: 'SI', hu: 'Szlovénia', nl: 'Slovenië', eu: true },
  { code: 'HR', hu: 'Horvátország', nl: 'Kroatië', eu: true },
  { code: 'RO', hu: 'Románia', nl: 'Roemenië', eu: true },
  { code: 'BG', hu: 'Bulgária', nl: 'Bulgarije', eu: true },
  { code: 'GR', hu: 'Görögország', nl: 'Griekenland', eu: true },
  { code: 'CY', hu: 'Ciprus', nl: 'Cyprus', eu: true },
  { code: 'MT', hu: 'Málta', nl: 'Malta', eu: true },
  { code: 'EE', hu: 'Észtország', nl: 'Estland', eu: true },
  { code: 'LV', hu: 'Lettország', nl: 'Letland', eu: true },
  { code: 'LT', hu: 'Litvánia', nl: 'Litouwen', eu: true },
  { code: 'CH', hu: 'Svájc', nl: 'Zwitserland', eu: false },
  { code: 'GB', hu: 'Egyesült Királyság', nl: 'Verenigd Koninkrijk', eu: false },
  { code: 'RS', hu: 'Szerbia', nl: 'Servië', eu: false },
  { code: 'UA', hu: 'Ukrajna', nl: 'Oekraïne', eu: false },
  { code: 'US', hu: 'Egyesült Államok', nl: 'Verenigde Staten', eu: false },
  { code: 'CA', hu: 'Kanada', nl: 'Canada', eu: false },
  { code: 'AU', hu: 'Ausztrália', nl: 'Australië', eu: false },
  { code: 'IL', hu: 'Izrael', nl: 'Israël', eu: false },
];

export const countryName = (code: string, lang: 'hu' | 'nl' = 'hu'): string =>
  COUNTRIES.find((c) => c.code === code)?.[lang] ?? code;
export const isEu = (code: string): boolean => COUNTRIES.find((c) => c.code === code)?.eu ?? false;

// Digits after the country prefix, per member state. Greece uses EL, not GR.
const VAT_PATTERN: Record<string, RegExp> = {
  AT: /^U\d{8}$/, BE: /^[01]\d{9}$/, BG: /^\d{9,10}$/, HR: /^\d{11}$/, CY: /^\d{8}[A-Z]$/,
  CZ: /^\d{8,10}$/, DK: /^\d{8}$/, EE: /^\d{9}$/, FI: /^\d{8}$/, FR: /^[A-Z0-9]{2}\d{9}$/,
  DE: /^\d{9}$/, GR: /^\d{9}$/, HU: /^\d{8}$/, IE: /^(\d{7}[A-Z]{1,2}|\d[A-Z0-9+*]\d{5}[A-Z])$/,
  IT: /^\d{11}$/, LV: /^\d{11}$/, LT: /^(\d{9}|\d{12})$/, LU: /^\d{8}$/, MT: /^\d{8}$/,
  NL: /^\d{9}B\d{2}$/, PL: /^\d{10}$/, PT: /^\d{9}$/, RO: /^\d{2,10}$/, SK: /^\d{10}$/,
  SI: /^\d{8}$/, ES: /^[A-Z0-9]\d{7}[A-Z0-9]$/, SE: /^\d{12}$/,
};
export const vatPrefix = (cc: string): string => (cc === 'GR' ? 'EL' : cc);

export type TaxIdCheck =
  | { state: 'empty' }
  | { state: 'valid'; value: string; hint?: string }
  | { state: 'invalid'; hint: string };

/**
 * Reads whatever a customer typed into the tax-number box.
 *
 * Hungarians write the adószám as 12345678-1-23 or just the first eight
 * digits; the EU VAT id is HU + those eight digits. Both are accepted and the
 * canonical EU form is produced, because that is what must appear on a
 * reverse-charge invoice. Only the format is checked here; VIES confirms that
 * the number actually exists (see /api/portal/invoices/lookup).
 */
export function checkTaxId(countryCode: string, raw: string): TaxIdCheck {
  const text = (raw ?? '').trim();
  if (!text) return { state: 'empty' };
  let s = text.toUpperCase().replace(/[\s.\-/]/g, '');
  const prefix = vatPrefix(countryCode);
  const pattern = VAT_PATTERN[countryCode];
  if (!pattern) return { state: 'valid', value: text, hint: 'EU-n kívüli adószám: nem ellenőrizhető automatikusan.' };
  if (s.startsWith(prefix)) s = s.slice(prefix.length);
  if (countryCode === 'HU' && /^\d{11}$/.test(s)) s = s.slice(0, 8); // 12345678-1-23 → 12345678
  if (pattern.test(s)) {
    return {
      state: 'valid',
      value: `${prefix}${s}`,
      hint: countryCode === 'HU' && text.replace(/\D/g, '').length === 11 ? 'Az adószám első 8 számjegye az uniós adószám.' : undefined,
    };
  }
  const example: Record<string, string> = { HU: '12345678 vagy 12345678-1-23', NL: 'NL123456789B01', DE: 'DE123456789', AT: 'ATU12345678' };
  return { state: 'invalid', hint: `Nem tűnik érvényes ${countryName(countryCode)}i adószámnak${example[countryCode] ? ` (pl. ${example[countryCode]})` : ''}.` };
}

/* ── VAT treatment ───────────────────────────────────────────────────────── */

export const VAT_TREATMENTS: Record<VatTreatment, { label: string; short: string }> = {
  nl_standard: { label: 'Holland ÁFA (BTW) 21%', short: '21% BTW' },
  reverse_charge: { label: 'Fordított adózás — EU-s vállalkozás, 0%', short: 'BTW verlegd · 0%' },
  outside_scope: { label: 'EU-n kívüli vevő — nem holland ÁFA, 0%', short: 'Nem EU · 0%' },
  custom: { label: 'Egyedi kulcs', short: 'Egyedi' },
};

export type VatSuggestion = { treatment: VatTreatment; rate: number; reason: string; warning?: string };

/** The usual treatment for this customer. A proposal, never a decision. */
export function suggestVat(buyer: Pick<Party, 'type' | 'countryCode' | 'taxNumber'>): VatSuggestion {
  const cc = buyer.countryCode || 'NL';
  if (cc === 'NL') {
    return { treatment: 'nl_standard', rate: NL_VAT_RATE, reason: 'Holland vevő: 21% BTW.' };
  }
  if (isEu(cc)) {
    const id = checkTaxId(cc, buyer.taxNumber ?? '');
    if (id.state === 'valid') {
      return {
        treatment: 'reverse_charge',
        rate: 0,
        reason: 'Az EU-s vevő érvényes adószámmal rendelkezik: fordított adózás, 0% ÁFA.',
      };
    }
    return {
      treatment: 'nl_standard',
      rate: NL_VAT_RATE,
      reason: 'Adószám nélkül (magánszemély) alapesetben a holland 21% érvényes.',
      warning:
        id.state === 'invalid'
          ? 'Az adószám formátuma hibás, ezért nem alkalmazható a fordított adózás.'
          : 'Ha a könyvelő más szabályt ír elő (pl. OSS, a vevő országának kulcsa), válassza az „Egyedi kulcs” lehetőséget.',
    };
  }
  return { treatment: 'outside_scope', rate: 0, reason: 'EU-n kívüli vevő: a szolgáltatás nem holland ÁFA-köteles.' };
}

export const rateFor = (treatment: VatTreatment, custom: number): number =>
  treatment === 'nl_standard' ? NL_VAT_RATE : treatment === 'custom' ? custom : 0;

/** The legal sentence a zero-rated invoice has to carry, Hungarian and Dutch. */
export const VAT_NOTES: Partial<Record<VatTreatment, { hu: string; nl: string }>> = {
  reverse_charge: {
    hu: 'Fordított adózás: az ÁFA megfizetése a vevő kötelezettsége (2006/112/EK irányelv 44. és 196. cikk).',
    nl: 'BTW verlegd naar de afnemer (art. 44 en 196 Richtlijn 2006/112/EG).',
  },
  outside_scope: {
    hu: 'A szolgáltatás teljesítési helye Hollandián kívül van, ezért holland ÁFA-t nem számítunk fel (2006/112/EK irányelv 44. cikk).',
    nl: 'Dienst niet in Nederland belast: plaats van dienst buiten Nederland (art. 44 Richtlijn 2006/112/EG).',
  },
};

/* ── Documents ───────────────────────────────────────────────────────────── */

export const KIND_LABEL: Record<DocKind, { hu: string; nl: string; short: string }> = {
  invoice: { hu: 'SZÁMLA', nl: 'FACTUUR', short: 'Számla' },
  proforma: { hu: 'DÍJBEKÉRŐ', nl: 'PRO-FORMAFACTUUR', short: 'Díjbekérő' },
  credit_note: { hu: 'JÓVÁÍRÓ SZÁMLA', nl: 'CREDITNOTA', short: 'Jóváíró számla' },
};

export const STATUS_LABEL: Record<DocStatus, string> = {
  draft: 'Piszkozat',
  issued: 'Kiállítva',
  sent: 'Elküldve',
  paid: 'Kifizetve',
  void: 'Érvénytelen',
};

export const METHOD_LABEL: Record<PaymentMethod, { hu: string; nl: string }> = {
  transfer: { hu: 'Átutalás', nl: 'Overschrijving' },
  card: { hu: 'Bankkártya', nl: 'Pinpas / creditcard' },
  cash: { hu: 'Készpénz', nl: 'Contant' },
};

/** Hungarian addresses read "postcode city, street"; everywhere else "street, postcode city, Country". */
export const partyLine = (p: Pick<Party, 'street' | 'postalCode' | 'city' | 'countryCode'>): string => {
  const city = [p.postalCode, p.city].filter(Boolean).join(' ');
  if (!p.countryCode || p.countryCode === 'HU') return [city, p.street].filter(Boolean).join(', ');
  return [p.street, city, countryName(p.countryCode)].filter(Boolean).join(', ');
};

/** Hungarian addresses read "postcode city, street"; this is the invoice order. */
export const addressText = partyLine;

export const emptyParty = (): Party => ({
  type: 'person', name: '', street: '', postalCode: '', city: '', countryCode: 'HU', email: '', phone: '', taxNumber: '',
});

/** A line from a stored order or catalogue entry, in both languages. */
export function blankLine(): InvoiceLine {
  return { description: '', quantity: 1, unit: 'db', unitNl: 'stuk', unitCents: 0 };
}

/** Everything the sheet and the PDF print under the totals. */
export function footerNotes(doc: InvoiceDoc): { hu: string; nl: string }[] {
  const out: { hu: string; nl: string }[] = [];
  const vat = VAT_NOTES[doc.vatTreatment];
  if (vat) out.push(vat);
  return out;
}

/** Display number: drafts have none yet. */
export const displayNumber = (doc: Pick<InvoiceDoc, 'number' | 'status'>): string => doc.number ?? 'Piszkozat';

/** A customer's billing details, made safe to store (profiles.billing / payments.billing). */
export function sanitiseParty(input: any): Party {
  const t = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const cc = t(input?.countryCode, 2).toUpperCase();
  const country = COUNTRIES.some((c) => c.code === cc) ? cc : 'HU';
  const tax = checkTaxId(country, t(input?.taxNumber, 40));
  return {
    type: input?.type === 'company' ? 'company' : 'person',
    name: t(input?.name, 160),
    street: t(input?.street, 160),
    postalCode: t(input?.postalCode, 20),
    city: t(input?.city, 80),
    countryCode: country,
    phone: t(input?.phone, 40),
    taxNumber: tax.state === 'valid' ? tax.value : tax.state === 'invalid' ? t(input?.taxNumber, 40) : '',
  };
}

export const billingComplete = (b: Partial<Party> | null | undefined): boolean =>
  Boolean(b?.name && b.street && b.city && b.countryCode);
