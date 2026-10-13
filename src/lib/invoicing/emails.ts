/**
 * The two invoice emails: the customer's, in their own language, and the
 * bookkeeper's copy, always Hungarian and to the point. Both carry the PDF.
 */
import { shell, textShell, h1, lead, small, facts, button } from '~/lib/email/layout';
import type { BuiltEmail } from '~/lib/email/templates';
import { COMPANY } from '~/config/company';
import { KIND_LABEL, VAT_TREATMENTS, computeTotals, dateHu, eur, huf, hufFromCents, type InvoiceDoc } from './model';

const COPY = {
  hu: {
    subject: (kind: string, n: string) => `${kind} ${n} — FODEL`,
    preheader: 'A számla PDF-ben csatolva, online is megtekinthető.',
    heading: (kind: string) => `Elkészült a ${kind.toLowerCase()}`,
    greeting: (name: string) => `Kedves ${name}!`,
    body: (kind: string, n: string) => `Mellékelten küldjük a(z) ${n} sorszámú ${kind.toLowerCase()}t PDF-ben. Online is megtekintheti az alábbi gombbal.`,
    settled: 'A számla pénzügyi teljesítést nem igényel, a díj már megérkezett. Köszönjük!',
    pay: 'Kérjük, az összeget a fizetési határidőig utalja el, a közleményben a sorszámot feltüntetve.',
    cta: 'Számla megtekintése',
    labels: { number: 'Sorszám', amount: 'Fizetendő', due: 'Fizetési határidő', account: 'Bankszámla', reference: 'Közlemény' },
    questions: `Kérdése van? Válaszoljon erre a levélre, vagy írjon a ${COMPANY.email.primary} címre.`,
    sign: 'Üdvözlettel,\nFODEL',
  },
  nl: {
    subject: (kind: string, n: string) => `${kind} ${n} — FODEL`,
    preheader: 'De factuur is als PDF bijgevoegd en ook online te bekijken.',
    heading: (kind: string) => `Uw ${kind.toLowerCase()} is klaar`,
    greeting: (name: string) => `Beste ${name},`,
    body: (kind: string, n: string) => `Bijgevoegd vindt u ${kind.toLowerCase()} ${n} als PDF. U kunt de factuur ook online bekijken via de knop hieronder.`,
    settled: 'Er hoeft niets meer betaald te worden: het bedrag is al ontvangen. Hartelijk dank!',
    pay: 'Wilt u het bedrag vóór de vervaldatum overmaken, onder vermelding van het nummer?',
    cta: 'Factuur bekijken',
    labels: { number: 'Nummer', amount: 'Te betalen', due: 'Vervaldatum', account: 'Rekening', reference: 'Omschrijving' },
    questions: `Vragen? Beantwoord deze e-mail of schrijf naar ${COMPANY.email.primary}.`,
    sign: 'Met vriendelijke groet,\nFODEL',
  },
};

const NL_KIND = { invoice: 'Factuur', proforma: 'Pro-formafactuur', credit_note: 'Creditnota' } as const;
const kindName = (doc: InvoiceDoc, locale: 'hu' | 'nl') => (locale === 'hu' ? KIND_LABEL[doc.kind].short : NL_KIND[doc.kind]);

export function invoiceToCustomer(doc: InvoiceDoc, viewUrl: string): BuiltEmail {
  const locale: 'hu' | 'nl' = doc.locale === 'nl' ? 'nl' : 'hu';
  const c = COPY[locale];
  const t = computeTotals(doc.lines, doc.vatRate, doc.priceMode);
  const sign = doc.kind === 'credit_note' ? -1 : 1;
  const kind = kindName(doc, locale);
  const number = doc.number ?? '';
  const hasHuf = Boolean(doc.fxRate);
  const amount = hasHuf ? huf(hufFromCents(t.grossCents * sign, doc.fxRate!)) : eur(t.grossCents * sign);

  const rows: [string, string][] = [
    [c.labels.number, number],
    [c.labels.amount, hasHuf ? `${amount} (${eur(t.grossCents * sign)})` : amount],
  ];
  if (!doc.settled && doc.kind !== 'credit_note') {
    rows.push([c.labels.due, dateHu(doc.dueDate)]);
    rows.push([c.labels.account, hasHuf && doc.issuer.huAccount ? doc.issuer.huAccount : `${doc.issuer.iban}${doc.issuer.bic ? ` · ${doc.issuer.bic}` : ''}`]);
    rows.push([c.labels.reference, number]);
  }
  const lines = [
    c.greeting(doc.buyer.name),
    c.body(kind, number),
    doc.kind === 'credit_note' ? '' : doc.settled ? c.settled : c.pay,
  ].filter(Boolean);

  return {
    subject: c.subject(kind, number),
    html: shell({
      locale,
      preheader: c.preheader,
      body: h1(c.heading(kind)) + lead(lines.join('\n\n')) + facts(rows) + button(c.cta, viewUrl) + small(c.questions) + lead(c.sign),
    }),
    text: textShell({
      locale,
      body: `${c.heading(kind)}\n\n${lines.join('\n\n')}\n\n${rows.map(([a, b]) => `${a}: ${b}`).join('\n')}\n\n${c.cta}: ${viewUrl}\n\n${c.questions}\n\n${c.sign}`,
    }),
  };
}

export function invoiceToBookkeeper(doc: InvoiceDoc, viewUrl: string): BuiltEmail {
  const t = computeTotals(doc.lines, doc.vatRate, doc.priceMode);
  const sign = doc.kind === 'credit_note' ? -1 : 1;
  const kind = KIND_LABEL[doc.kind].short;
  const number = doc.number ?? '';
  const rows: [string, string][] = [
    ['Típus', kind],
    ['Sorszám', number],
    ['Vevő', `${doc.buyer.name}${doc.buyer.taxNumber ? ` · ${doc.buyer.taxNumber}` : ''} (${doc.buyer.countryCode})`],
    ['Nettó', eur(t.netCents * sign)],
    ['ÁFA', `${eur(t.vatCents * sign)} · ${VAT_TREATMENTS[doc.vatTreatment].short}`],
    ['Bruttó', eur(t.grossCents * sign)],
    ...(doc.fxRate ? ([['Forint', `${huf(hufFromCents(t.grossCents * sign, doc.fxRate))} (${doc.fxRate} Ft/€)`]] as [string, string][]) : []),
    ['Kelt / teljesítés', `${dateHu(doc.issuedAt)} / ${dateHu(doc.supplyDate)}`],
    ['Állapot', doc.settled ? 'Kifizetve' : `Fizetendő: ${dateHu(doc.dueDate)}`],
  ];
  const intro = `Új ${kind.toLowerCase()} készült, a PDF mellékelve.`;
  return {
    subject: `${kind} ${number} — ${doc.buyer.name}`,
    html: shell({ locale: 'hu', preheader: `${kind} ${number}`, body: h1(`${kind} ${number}`) + lead(intro) + facts(rows) + button('Megnyitás', viewUrl) }),
    text: textShell({ locale: 'hu', body: `${kind} ${number}\n\n${intro}\n\n${rows.map(([a, b]) => `${a}: ${b}`).join('\n')}\n\nMegnyitás: ${viewUrl}` }),
  };
}
