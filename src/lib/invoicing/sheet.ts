/**
 * The invoice as HTML. One function, two callers: the invoice screen renders
 * it on the server, and the editor re-runs it in the browser on every
 * keystroke so the paper beside the form is always the real document. The
 * PDF (pdf.ts) is laid out to match it.
 *
 * Bilingual on purpose, as FODEL's own invoice is: Hungarian first, Dutch in
 * smaller type beneath, because the customer reads one and the Dutch tax
 * authority and the bookkeeper read the other.
 */
import {
  KIND_LABEL, METHOD_LABEL, VAT_NOTES, computeTotals, countryName, dateHu, eur, huf, hufFromCents, partyLine,
  type InvoiceDoc,
} from './model';

const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const bi = (hu: string, nl: string, cls = ''): string =>
  `<span class="is-bi ${cls}"><b>${esc(hu)}</b><small>(${esc(nl)})</small></span>`;

const row = (hu: string, nl: string, value: string): string =>
  value ? `<div class="is-kv"><dt>${bi(hu, nl)}</dt><dd>${esc(value)}</dd></div>` : '';

export function invoiceSheet(doc: InvoiceDoc): string {
  const t = computeTotals(doc.lines, doc.vatRate, doc.priceMode);
  const sign = doc.kind === 'credit_note' ? -1 : 1;
  const k = KIND_LABEL[doc.kind];
  const hasHuf = doc.fxRate && doc.fxRate > 0;
  const vatNote = VAT_NOTES[doc.vatTreatment];
  const showBuyerVat = Boolean(doc.buyer.taxNumber);
  const number = doc.number ?? 'piszkozat';

  const lineRows = doc.lines.length
    ? doc.lines
        .map((l, i) => {
          const r = t.rows[i];
          const unitShown = doc.priceMode === 'gross' ? l.unitCents / (1 + doc.vatRate / 100) : l.unitCents;
          return `<tr>
            <td class="is-desc"><b>${esc(l.description || '—')}</b>${l.descriptionNl ? `<small>(${esc(l.descriptionNl)})</small>` : ''}</td>
            <td class="is-c">${esc(l.quantity)}</td>
            <td class="is-c">${esc(l.unit ?? '')}${l.unitNl ? `<small>(${esc(l.unitNl)})</small>` : ''}</td>
            <td class="is-r">${eur(Math.round(unitShown) * sign)}</td>
            <td class="is-r is-strong">${eur(r.netCents * sign)}</td>
            <td class="is-c">${doc.vatRate}%</td>
            <td class="is-r">${eur(r.vatCents * sign)}</td>
            <td class="is-r is-strong">${eur(r.grossCents * sign)}</td>
          </tr>`;
        })
        .join('')
    : `<tr><td colspan="8" class="is-empty">Még nincs tétel — adjon hozzá egyet a bal oldalon.</td></tr>`;

  const th = (hu: string, nl: string, cls = '') => `<th class="${cls}">${bi(hu, nl)}</th>`;

  const phones = doc.issuer.phone;
  const settledNote = doc.settled
    ? `<p class="is-blue">A számla pénzügyi teljesítést nem igényel. / U hoeft geen betaling te verrichten.</p>`
    : doc.kind === 'credit_note'
      ? ''
      : `<p class="is-blue">${
          doc.kind === 'proforma'
            ? 'Kérjük, a díjat a fenti határidőig utalja el, a hivatkozásban a sorszámot feltüntetve. / Gelieve het bedrag vóór de vervaldatum over te maken onder vermelding van het nummer.'
            : 'Kérjük, az összeget a határidőig utalja el, a közleményben a számla sorszámát feltüntetve. / Gelieve het bedrag vóór de vervaldatum over te maken onder vermelding van het factuurnummer.'
        }</p>`;

  const bank = hasHuf
    ? row('Bankszámlaszám', 'Rekening nr.', doc.issuer.huAccount) || row('IBAN', 'IBAN', doc.issuer.iban)
    : row('IBAN / BIC', 'IBAN / BIC', [doc.issuer.iban, doc.issuer.bic].filter(Boolean).join(' · '));

  return `<article class="inv-sheet${doc.status === 'draft' ? ' is-draft' : ''}${doc.status === 'void' ? ' is-void' : ''}" data-kind="${doc.kind}">
  <header class="is-top">
    <h2>${esc(k.hu)} / ${esc(k.nl)}</h2>
    <p>${doc.kind === 'proforma' ? 'Díjbekérő száma / Proforma nr.' : 'Számla száma / Factuur nr.'}: <b>${esc(number)}</b></p>
  </header>

  <section class="is-parties">
    <div class="is-party">
      <p class="is-label">${bi('Kibocsátó adatai', 'Gegevens verkoper')}</p>
      <div class="is-brand" aria-label="FODEL"><span class="w">FODEL</span><span class="r"></span><span class="s">Ingatlan</span></div>
      <p class="is-name">${esc(doc.issuer.name)}</p>
      <p class="is-addr">${esc(doc.issuer.street)}, ${esc(doc.issuer.postalCode)} ${esc(doc.issuer.city)}</p>
      <dl>
        ${row('Telefon', 'Telefoon', phones)}
        ${row('Email', 'Email', doc.issuer.email)}
        ${row('Adószám', 'BTW nr.', doc.issuer.vatId)}
        ${row('Cégjegyzékszám', 'KvK nr.', doc.issuer.kvk ?? '')}
        ${bank}
      </dl>
    </div>
    <div class="is-party">
      <p class="is-label">${bi('Vevő számlázási adatai', 'Gegevens klant')}</p>
      <p class="is-name is-buyer">${esc(doc.buyer.name || 'A vevő neve')}</p>
      <p class="is-addr">${esc(partyLine(doc.buyer) || 'A vevő címe')}</p>
      <dl>
        ${row('Telefon', 'Telefoon', doc.buyer.phone ?? '')}
        ${row('Email', 'Email', doc.buyer.email ?? '')}
        ${showBuyerVat ? row('Adószám', 'BTW nr.', doc.buyer.taxNumber ?? '') : ''}
        ${doc.buyer.countryCode && doc.buyer.countryCode !== 'HU' ? row('Ország', 'Land', countryName(doc.buyer.countryCode)) : ''}
      </dl>
    </div>
  </section>

  <section class="is-dates">
    <div>${bi('Számla kelte:', 'Factuur datum', 'is-h')}<p>${esc(dateHu(doc.issuedAt))}</p></div>
    <div>${bi('Teljesítés napja:', 'Oplevering datum', 'is-h')}<p>${esc(dateHu(doc.supplyDate))}</p></div>
    <div>${bi('Fizetési határidő:', 'Betalingstermijn', 'is-h')}<p>${esc(dateHu(doc.dueDate))}</p></div>
    <div>${bi('Fizetési mód:', 'Betaalmethode', 'is-h')}<p>${esc(METHOD_LABEL[doc.paymentMethod].hu)}<small>(${esc(METHOD_LABEL[doc.paymentMethod].nl)})</small></p></div>
  </section>

  ${
    doc.reference || doc.referenceNumber || hasHuf
      ? `<section class="is-ref">
    <div>${doc.reference || doc.referenceNumber ? `${bi('Hivatkozás:', 'Verwijzing', 'is-inline')} <span>${esc([doc.referenceNumber, doc.reference].filter(Boolean).join(' — '))}</span>` : ''}</div>
    <div>${hasHuf ? `${bi('Árfolyam:', 'Wisselkoers', 'is-inline')} <span>${esc(String(doc.fxRate))}</span>` : ''}</div>
  </section>`
      : ''
  }

  <table class="is-lines">
    <thead><tr>
      ${th('Megnevezés', 'Benaming', 'is-left')}${th('Menny.', 'Hoeveel')}${th('Menny. egység', 'Eenheid')}${th('Nettó egységár', 'Eenheidsprijs')}
      ${th('Nettó érték', 'Nettowaarde')}${th('Áfakulcs', 'BTW %')}${th('Áfa érték', 'BTW bedrag')}${th('Bruttó érték', 'Brutowaarde')}
    </tr></thead>
    <tbody>${lineRows}</tbody>
  </table>

  <section class="is-totals">
    <dl>
      <div><dt>Nettó összesen / Netto totaal</dt><dd>${eur(t.netCents * sign)}</dd></div>
      <div><dt>Áfa összesen / BTW totaal</dt><dd>${eur(t.vatCents * sign)}</dd></div>
      <div class="is-grand"><dt>Bruttó összesen / Bruto totaal</dt><dd>${eur(t.grossCents * sign)}</dd></div>
      ${
        hasHuf
          ? `<div class="is-huf"><dt>Forintban fizetendő összesen / Te betalen</dt><dd>${huf(hufFromCents(t.grossCents * sign, doc.fxRate!))}</dd></div>`
          : ''
      }
    </dl>
  </section>

  <footer class="is-foot">
    ${vatNote ? `<p class="is-legal"><b>${esc(vatNote.hu)}</b><br>${esc(vatNote.nl)}</p>` : ''}
    ${doc.notes ? `<p class="is-note">${esc(doc.notes).replace(/\n/g, '<br>')}</p>` : ''}
    ${settledNote}
    <p class="is-thanks">Köszönjük, hogy igénybe vette szolgáltatásunkat! / Wij danken u voor het gebruik maken van onze diensten!</p>
    <p class="is-small">Az elektronikus úton küldött számla aláírás és pecsét nélkül is hiteles.<br>(De elektronisch verzonden factuur is ook geldig zonder handtekening of stempel.)</p>
  </footer>
</article>`;
}
