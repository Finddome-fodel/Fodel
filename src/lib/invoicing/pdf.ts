/**
 * The invoice as a PDF — what is attached to the email to the customer and to
 * the bookkeeper. pdfmake runs in the serverless function; there is no browser
 * to print from. The layout follows sheet.ts (and FODEL's own sample invoice):
 * the same boxes, the same nine columns, Hungarian first with the Dutch
 * beneath. Roboto ships with pdfmake and covers ő and ű.
 */
// @ts-expect-error — pdfmake 0.2 ships no types and is CommonJS
import PdfPrinter from 'pdfmake/src/printer.js';
// @ts-expect-error — base64 font files keyed by name
import * as vfsModule from 'pdfmake/build/vfs_fonts.js';
import {
  KIND_LABEL, METHOD_LABEL, VAT_NOTES, computeTotals, countryName, dateHu, eur, huf, hufFromCents, partyLine,
  type InvoiceDoc,
} from './model';

const vfs: Record<string, string> = ((vfsModule as any).default ?? vfsModule) as Record<string, string>;
const font = (name: string) => Buffer.from(vfs[name], 'base64');

const INK = '#0f1f2c';
const LINE = '#1a2733';
const FILL = '#f3f4f2';
const MUTED = '#55636f';

const bi = (hu: string, nl: string, o: { size?: number; bold?: boolean; align?: string } = {}) => ({
  stack: [
    { text: hu, bold: o.bold ?? true, fontSize: o.size ?? 9.5 },
    { text: `(${nl})`, fontSize: (o.size ?? 9.5) - 3, color: MUTED },
  ],
  alignment: o.align ?? 'left',
});

const kv = (hu: string, nl: string, value?: string | null) =>
  value
    ? [
        { stack: [{ text: hu, fontSize: 9 }, { text: `(${nl})`, fontSize: 6.5, color: MUTED }] },
        { text: value, fontSize: 9, margin: [0, 1, 0, 0] },
      ]
    : null;

const noBorders = { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 };

export async function renderInvoicePdf(doc: InvoiceDoc): Promise<Buffer> {
  const t = computeTotals(doc.lines, doc.vatRate, doc.priceMode);
  const sign = doc.kind === 'credit_note' ? -1 : 1;
  const k = KIND_LABEL[doc.kind];
  const hasHuf = Boolean(doc.fxRate && doc.fxRate > 0);
  const vatNote = VAT_NOTES[doc.vatTreatment];
  const method = METHOD_LABEL[doc.paymentMethod];

  const issuerRows = [
    kv('Telefon', 'Telefoon', doc.issuer.phone),
    kv('Email', 'Email', doc.issuer.email),
    kv('Adószám', 'BTW nr.', doc.issuer.vatId),
    kv('Cégjegyzékszám', 'KvK nr.', doc.issuer.kvk),
    hasHuf && doc.issuer.huAccount
      ? kv('Bankszámlaszám', 'Rekening nr.', doc.issuer.huAccount)
      : kv('IBAN / BIC', 'IBAN / BIC', [doc.issuer.iban, doc.issuer.bic].filter(Boolean).join(' · ')),
  ].filter(Boolean) as any[];
  const buyerRows = [
    kv('Telefon', 'Telefoon', doc.buyer.phone),
    kv('Email', 'Email', doc.buyer.email),
    kv('Adószám', 'BTW nr.', doc.buyer.taxNumber),
    doc.buyer.countryCode && doc.buyer.countryCode !== 'HU' ? kv('Ország', 'Land', countryName(doc.buyer.countryCode)) : null,
  ].filter(Boolean) as any[];

  // A little breathing room between the rows without a custom layout per row.
  const spaced = (rows: any[]) => rows.map((r) => [{ ...r[0], margin: [0, 0, 0, 4] }, { ...r[1], margin: [0, 1, 0, 4] }]);

  const brand = {
    stack: [
      { text: 'FODEL', font: 'Roboto', fontSize: 19, characterSpacing: 6, alignment: 'center', color: '#102a43', bold: true },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 78, y2: 0, lineWidth: 0.7, lineColor: '#102a43' }], margin: [0, 3, 0, 3] },
      { text: 'INGATLAN', fontSize: 6, characterSpacing: 3.4, alignment: 'center', color: MUTED },
    ],
    width: 90,
  };

  const lineRows = doc.lines.map((l, i) => {
    const r = t.rows[i];
    const unitNet = doc.priceMode === 'gross' ? l.unitCents / (1 + doc.vatRate / 100) : l.unitCents;
    return [
      { stack: [{ text: l.description || '—', bold: true, fontSize: 9.5 }, ...(l.descriptionNl ? [{ text: `(${l.descriptionNl})`, fontSize: 6.5, color: MUTED }] : [])] },
      { text: String(l.quantity), alignment: 'center', fontSize: 9.5 },
      { stack: [{ text: l.unit ?? '', fontSize: 9.5, alignment: 'center' }, ...(l.unitNl ? [{ text: `(${l.unitNl})`, fontSize: 6.5, color: MUTED, alignment: 'center' }] : [])] },
      { text: eur(Math.round(unitNet) * sign), alignment: 'right', fontSize: 9.5 },
      { text: eur(r.netCents * sign), alignment: 'right', bold: true, fontSize: 9.5 },
      { text: `${doc.vatRate}%`, alignment: 'center', fontSize: 9.5 },
      { text: eur(r.vatCents * sign), alignment: 'right', fontSize: 9.5 },
      { text: eur(r.grossCents * sign), alignment: 'right', bold: true, fontSize: 9.5 },
    ];
  });
  // Short invoices keep their totals at the foot of the page, like the sample.
  const fill = Math.max(0, 56 - (doc.lines.length - 1) * 30);

  const th = (hu: string, nl: string) => ({ ...bi(hu, nl, { size: 8.5, align: 'center' }), fillColor: FILL });

  const totalsRow = (hu: string, value: string, o: { bold?: boolean; size?: number; fill?: string; top?: boolean } = {}) => [
    { text: hu, bold: o.bold, fontSize: o.size ? 10 : 9.5, fillColor: o.fill, border: [false, !!o.top, false, false] },
    { text: value, bold: o.bold, fontSize: o.size ?? 9.5, alignment: 'right', fillColor: o.fill, border: [false, !!o.top, false, false] },
  ];
  const totalsBody = [
    totalsRow('Nettó összesen / Netto totaal', eur(t.netCents * sign)),
    totalsRow('Áfa összesen / BTW totaal', eur(t.vatCents * sign)),
    totalsRow('Bruttó összesen / Bruto totaal', eur(t.grossCents * sign), { bold: true, size: 12, top: true }),
    ...(hasHuf
      ? [totalsRow('Forintban fizetendő összesen / Te betalen', huf(hufFromCents(t.grossCents * sign, doc.fxRate!)), { bold: true, size: 12, fill: FILL })]
      : []),
  ];

  const payText = doc.settled
    ? 'A számla pénzügyi teljesítést nem igényel. / U hoeft geen betaling te verrichten.'
    : doc.kind === 'credit_note'
      ? ''
      : 'Kérjük, az összeget a határidőig utalja el, a közleményben a sorszámot feltüntetve. / Gelieve het bedrag vóór de vervaldatum over te maken onder vermelding van het nummer.';

  const definition: any = {
    pageSize: 'A4',
    pageMargins: [28, 28, 28, 28],
    defaultStyle: { font: 'Roboto', fontSize: 9.5, color: INK, lineHeight: 1.15 },
    info: { title: `${k.short} ${doc.number ?? ''}`.trim(), author: doc.issuer.name, creator: 'FODEL' },
    background: () => ({
      canvas: [{ type: 'rect', x: 28, y: 28, w: 539, h: 786, lineWidth: 1.2, lineColor: LINE }],
    }),
    content: [
      {
        table: {
          widths: ['*', 'auto'],
          body: [[
            { text: `${k.hu} / ${k.nl}`, bold: true, fontSize: 13, fillColor: FILL, margin: [4, 6, 0, 6] },
            {
              text: [
                { text: `${doc.kind === 'proforma' ? 'Díjbekérő száma / Proforma nr.' : 'Számla száma / Factuur nr.'}: `, fontSize: 9.5 },
                { text: doc.number ?? 'piszkozat', bold: true, fontSize: 9.5 },
              ],
              fillColor: FILL,
              margin: [0, 8, 4, 6],
            },
          ]],
        },
        layout: { hLineWidth: (i: number) => (i === 1 ? 1.2 : 0), vLineWidth: () => 0, hLineColor: () => LINE },
      },
      {
        table: {
          widths: ['*', '*'],
          body: [[
            {
              margin: [4, 4, 4, 8],
              stack: [
                {
                  columns: [bi('Kibocsátó adatai', 'Gegevens verkoper', { size: 10.5 }), brand],
                  margin: [0, 0, 0, 12],
                },
                { text: doc.issuer.name, bold: true, fontSize: 12.5 },
                { text: `${doc.issuer.street}, ${doc.issuer.postalCode} ${doc.issuer.city}`, fontSize: 9.5, margin: [0, 2, 0, 0] },
                { layout: noBorders, margin: [0, 12, 0, 0], table: { widths: [88, '*'], body: spaced(issuerRows) } },
              ],
            },
            {
              margin: [4, 4, 4, 8],
              stack: [
                { ...bi('Vevő számlázási adatai', 'Gegevens klant', { size: 10.5 }), margin: [0, 0, 0, 12] },
                { text: doc.buyer.name || '—', bold: true, fontSize: 12.5 },
                { text: partyLine(doc.buyer), fontSize: 9.5, margin: [0, 2, 0, 0] },
                { layout: noBorders, margin: [0, 12, 0, 0], table: { widths: [88, '*'], body: spaced(buyerRows) } },
              ],
            },
          ]],
        },
        layout: { hLineWidth: () => 0, vLineWidth: (i: number) => (i === 1 ? 1.2 : 0), vLineColor: () => LINE, paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 8, paddingBottom: () => 0 },
        margin: [0, 0, 0, 0],
      },
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [bi('Számla kelte:', 'Factuur datum', { align: 'center' }), bi('Teljesítés napja:', 'Oplevering datum', { align: 'center' }), bi('Fizetési határidő:', 'Betalingstermijn', { align: 'center' }), bi('Fizetési mód:', 'Betaalmethode', { align: 'center' })].map((c) => ({ ...c, fillColor: FILL, margin: [0, 4, 0, 4] })),
            [dateHu(doc.issuedAt), dateHu(doc.supplyDate), dateHu(doc.dueDate), { stack: [{ text: method.hu, bold: true }, { text: `(${method.nl})`, fontSize: 6.5, color: MUTED }], alignment: 'center' }].map((c: any) =>
              typeof c === 'string' ? { text: c, alignment: 'center', bold: true, margin: [0, 6, 0, 6] } : { ...c, margin: [0, 4, 0, 4] }
            ),
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 2 ? 1.2 : 0.6),
          hLineStyle: (i: number) => (i === 1 ? { dash: { length: 2 } } : null),
          vLineWidth: (i: number) => (i === 0 || i === 4 ? 0 : 1.2),
          hLineColor: () => LINE,
          vLineColor: () => LINE,
        },
      },
      ...(doc.reference || doc.referenceNumber || hasHuf
        ? [{
            table: {
              widths: ['*', '*'],
              body: [[
                { text: doc.reference || doc.referenceNumber ? [{ text: 'Hivatkozás: ', bold: true }, { text: [doc.referenceNumber, doc.reference].filter(Boolean).join(' — ') }] : '', margin: [4, 6, 0, 6] },
                { text: hasHuf ? [{ text: 'Árfolyam / Wisselkoers: ', bold: true }, { text: String(doc.fxRate) }] : '', margin: [4, 6, 0, 6] },
              ]],
            },
            layout: { hLineWidth: () => 0, vLineWidth: (i: number) => (i === 1 ? 1.2 : 0), vLineColor: () => LINE },
          }]
        : []),
      {
        margin: [0, 0, 0, 0],
        table: {
          headerRows: 1,
          widths: [140, 32, 40, 54, 54, 38, 52, 59],
          body: [
            [th('Megnevezés', 'Benaming'), th('Menny.', 'Hoeveel'), th('Menny. egység', 'Eenheid'), th('Nettó egységár', 'Eenheidsprijs'), th('Nettó érték', 'Nettowaarde'), th('Áfakulcs', 'BTW %'), th('Áfa érték', 'BTW bedrag'), th('Bruttó érték', 'Brutowaarde')],
            ...lineRows,
            ...(fill ? [[{ text: '', colSpan: 8, margin: [0, fill / 2, 0, fill / 2] }, '', '', '', '', '', '', '']] : []),
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 ? 1.2 : i === 1 ? 1.2 : 0),
          vLineWidth: (i: number) => (i === 0 || i === 8 ? 0 : 0.6),
          hLineColor: () => LINE,
          vLineColor: () => LINE,
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
      },
      {
        margin: [0, 8, 0, 0],
        columns: [
          { text: '', width: '*' },
          {
            width: 300,
            table: { widths: ['*', 'auto'], body: totalsBody },
            layout: {
              hLineWidth: (i: number) => (i === 2 ? 1 : 0),
              vLineWidth: () => 0,
              hLineColor: () => LINE,
              paddingTop: () => 5,
              paddingBottom: () => 5,
              paddingLeft: () => 8,
              paddingRight: () => 8,
            },
          },
        ],
      },
      ...(vatNote
        ? [{
            margin: [14, 22, 14, 0],
            table: { widths: ['*'], body: [[{ stack: [{ text: vatNote.hu, bold: true, fontSize: 8.5 }, { text: vatNote.nl, fontSize: 8.5, margin: [0, 2, 0, 0] }], fillColor: FILL, margin: [4, 4, 4, 4] }]] },
            layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#c7ccd0', vLineColor: () => '#c7ccd0' },
          }]
        : []),
      ...(doc.notes ? [{ text: doc.notes, fontSize: 9, margin: [14, 14, 14, 0], color: '#2a3844' }] : []),
      ...(payText ? [{ text: payText, bold: true, color: '#14208f', alignment: 'center', fontSize: 9.5, margin: [14, 16, 14, 0] }] : []),
      { text: 'Köszönjük, hogy igénybe vette szolgáltatásunkat! / Wij danken u voor het gebruik maken van onze diensten!', alignment: 'center', fontSize: 9.5, margin: [14, 8, 14, 0] },
      { text: 'Az elektronikus úton küldött számla aláírás és pecsét nélkül is hiteles.\n(De elektronisch verzonden factuur is ook geldig zonder handtekening of stempel.)', alignment: 'center', fontSize: 8.5, color: '#3d4a55', margin: [14, 6, 14, 0] },
    ],
  };

  const printer = new PdfPrinter({
    Roboto: { normal: font('Roboto-Regular.ttf'), bold: font('Roboto-Medium.ttf'), italics: font('Roboto-Italic.ttf'), bolditalics: font('Roboto-MediumItalic.ttf') },
  });
  const pdf = printer.createPdfKitDocument(definition);
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdf.on('data', (c: Buffer) => chunks.push(c));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);
    pdf.end();
  });
}
