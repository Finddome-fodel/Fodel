/**
 * The two invoice emails: the customer's, in their own language, and the
 * bookkeeper's copy, always Hungarian and to the point. Both carry the PDF.
 */
import { shell, textShell, h1, lead, small, facts, button } from '~/lib/email/layout';
import type { BuiltEmail } from '~/lib/email/templates';
import { COMPANY } from '~/config/company';
import { localeFrom, type Locale } from '~/i18n/ui';
import { formatDate, eurCents } from '~/lib/format';
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
  en: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'The invoice is attached as a PDF and can also be viewed online.',
    heading: (kind: string) => `${kind} ready`,
    greeting: (name: string) => `Dear ${name},`,
    body: (kind: string, n: string) => `Please find ${kind.toLowerCase()} ${n} attached as a PDF. You can also view it online with the button below.`,
    settled: 'Nothing further is due: the amount has already been received. Thank you.',
    pay: 'Please transfer the amount before the due date, quoting the number.',
    cta: 'View document',
    labels: { number: 'Number', amount: 'Amount due', due: 'Due date', account: 'Account', reference: 'Reference' },
    questions: `Questions? Reply to this email or write to ${COMPANY.email.primary}.`,
    sign: 'Kind regards,\nFODEL',
  },
  de: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Die Rechnung ist als PDF angehängt und auch online einsehbar.',
    heading: (kind: string) => `${kind} liegt bereit`,
    greeting: (name: string) => `Guten Tag ${name},`,
    body: (kind: string, n: string) => `Im Anhang finden Sie die ${kind} ${n} als PDF. Sie können sie auch online über die Schaltfläche unten ansehen.`,
    settled: 'Es ist nichts mehr zu zahlen: Der Betrag ist bereits eingegangen. Vielen Dank.',
    pay: 'Bitte überweisen Sie den Betrag bis zum Fälligkeitsdatum und geben Sie die Nummer an.',
    cta: 'Dokument ansehen',
    labels: { number: 'Nummer', amount: 'Zu zahlen', due: 'Fälligkeitsdatum', account: 'Konto', reference: 'Verwendungszweck' },
    questions: `Fragen? Antworten Sie auf diese E-Mail oder schreiben Sie an ${COMPANY.email.primary}.`,
    sign: 'Mit freundlichen Grüßen\nFODEL',
  },
  fr: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'La facture est jointe au format PDF et consultable en ligne.',
    heading: (kind: string) => `${kind} disponible`,
    greeting: (name: string) => `Bonjour ${name},`,
    body: (kind: string, n: string) => `Vous trouverez en pièce jointe le document ${n} (${kind.toLowerCase()}) au format PDF. Vous pouvez aussi le consulter en ligne avec le bouton ci-dessous.`,
    settled: 'Il n’y a plus rien à payer\u00a0: le montant a déjà été reçu. Merci.',
    pay: 'Merci de virer le montant avant la date d’échéance, en indiquant le numéro.',
    cta: 'Voir le document',
    labels: { number: 'Numéro', amount: 'À payer', due: 'Date d’échéance', account: 'Compte', reference: 'Référence' },
    questions: `Une question\u202f? Répondez à cet e-mail ou écrivez à ${COMPANY.email.primary}.`,
    sign: 'Cordialement,\nFODEL',
  },
  es: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'La factura se adjunta en PDF y también puede consultarse en línea.',
    heading: (kind: string) => `${kind} disponible`,
    greeting: (name: string) => `Hola, ${name}:`,
    body: (kind: string, n: string) => `Adjuntamos el documento ${n} (${kind.toLowerCase()}) en PDF. También puede consultarlo en línea con el botón de abajo.`,
    settled: 'No hay nada pendiente de pago: ya hemos recibido el importe. Gracias.',
    pay: 'Le rogamos que transfiera el importe antes de la fecha de vencimiento, indicando el número.',
    cta: 'Ver el documento',
    labels: { number: 'Número', amount: 'Importe pendiente', due: 'Fecha de vencimiento', account: 'Cuenta', reference: 'Referencia' },
    questions: `¿Alguna pregunta? Responda a este correo o escriba a ${COMPANY.email.primary}.`,
    sign: 'Atentamente,\nFODEL',
  },
  pl: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Faktura jest załączona w formacie PDF i dostępna również online.',
    heading: (kind: string) => `${kind} do pobrania`,
    greeting: (name: string) => `Dzień dobry, ${name},`,
    body: (kind: string, n: string) => `w załączniku przesyłamy dokument ${n} (${kind.toLowerCase()}) w formacie PDF. Można go też wyświetlić online za pomocą przycisku poniżej.`,
    settled: 'Nie ma nic do zapłaty – kwota została już przez nas otrzymana. Dziękujemy.',
    pay: 'Prosimy o przelanie kwoty przed terminem płatności, z podaniem numeru w tytule.',
    cta: 'Zobacz dokument',
    labels: { number: 'Numer', amount: 'Do zapłaty', due: 'Termin płatności', account: 'Rachunek', reference: 'Numer referencyjny' },
    questions: `Mają Państwo pytania? Prosimy odpowiedzieć na tę wiadomość lub napisać na adres ${COMPANY.email.primary}.`,
    sign: 'Z poważaniem\nFODEL',
  },
  ro: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Factura este atașată în format PDF și poate fi consultată și online.',
    heading: (kind: string) => `${kind} disponibilă`,
    greeting: (name: string) => `Bună ziua, ${name},`,
    body: (kind: string, n: string) => `Vă transmitem atașat documentul ${n} (${kind.toLowerCase()}) în format PDF. Îl puteți consulta și online cu butonul de mai jos.`,
    settled: 'Nu mai este nimic de plată: suma a fost deja primită. Vă mulțumim.',
    pay: 'Vă rugăm să virați suma înainte de data scadenței, menționând numărul.',
    cta: 'Vedeți documentul',
    labels: { number: 'Număr', amount: 'De plată', due: 'Data scadenței', account: 'Cont', reference: 'Referință' },
    questions: `Aveți întrebări? Răspundeți la acest e-mail sau scrieți-ne la ${COMPANY.email.primary}.`,
    sign: 'Cu stimă,\nFODEL',
  },
  sk: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Faktúra je priložená vo formáte PDF a dá sa zobraziť aj online.',
    heading: (kind: string) => `${kind} na stiahnutie`,
    greeting: (name: string) => `Dobrý deň, ${name},`,
    body: (kind: string, n: string) => `v prílohe Vám posielame doklad ${n} (${kind.toLowerCase()}) vo formáte PDF. Zobraziť si ho môžete aj online tlačidlom nižšie.`,
    settled: 'Nie je potrebné nič platiť: sumu sme už prijali. Ďakujeme.',
    pay: 'Prosíme, uhraďte sumu do dátumu splatnosti a uveďte číslo dokladu.',
    cta: 'Zobraziť doklad',
    labels: { number: 'Číslo', amount: 'Na úhradu', due: 'Dátum splatnosti', account: 'Účet', reference: 'Referenčné číslo' },
    questions: `Máte otázky? Odpovedzte na tento e-mail alebo napíšte na ${COMPANY.email.primary}.`,
    sign: 'S pozdravom\nFODEL',
  },
  it: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'La fattura è allegata in PDF e può essere consultata anche online.',
    heading: (kind: string) => `${kind} disponibile`,
    greeting: (name: string) => `Gentile ${name},`,
    body: (kind: string, n: string) => `in allegato trova il documento ${n} (${kind.toLowerCase()}) in formato PDF. Può consultarlo anche online con il pulsante qui sotto.`,
    settled: 'Non è dovuto altro: l’importo è già stato ricevuto. Grazie.',
    pay: 'La preghiamo di bonificare l’importo entro la data di scadenza, indicando il numero del documento.',
    cta: 'Visualizza il documento',
    labels: { number: 'Numero', amount: 'Importo dovuto', due: 'Scadenza', account: 'Conto', reference: 'Riferimento' },
    questions: `Domande? Risponda a questa e-mail o scriva a ${COMPANY.email.primary}.`,
    sign: 'Cordiali saluti\nFODEL',
  },
  pt: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'A fatura segue em anexo em PDF e também pode ser consultada online.',
    heading: (kind: string) => `${kind} disponível`,
    greeting: (name: string) => `Bom dia, ${name},`,
    body: (kind: string, n: string) => `Segue em anexo o documento ${n} (${kind.toLowerCase()}) em formato PDF. Também pode consultá-lo online com o botão abaixo.`,
    settled: 'Não há nada a pagar: o montante já foi recebido. Obrigado.',
    pay: 'Transfira o montante até à data de vencimento, indicando o número.',
    cta: 'Ver documento',
    labels: { number: 'Número', amount: 'Montante a pagar', due: 'Data de vencimento', account: 'Conta', reference: 'Referência' },
    questions: `Dúvidas? Responda a este e-mail ou escreva para ${COMPANY.email.primary}.`,
    sign: 'Com os melhores cumprimentos,\nFODEL',
  },
  el: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Το τιμολόγιο επισυνάπτεται σε PDF και μπορείτε να το δείτε και online.',
    heading: (kind: string) => `${kind} διαθέσιμο`,
    greeting: (name: string) => `Γεια σας, ${name},`,
    body: (kind: string, n: string) => `Σας επισυνάπτουμε το έγγραφο ${n} (${kind.toLowerCase()}) σε μορφή PDF. Μπορείτε επίσης να το δείτε online με το παρακάτω κουμπί.`,
    settled: 'Δεν οφείλεται τίποτα άλλο: το ποσό έχει ήδη ληφθεί. Σας ευχαριστούμε.',
    pay: 'Παρακαλούμε μεταφέρετε το ποσό έως την ημερομηνία λήξης, αναφέροντας τον αριθμό.',
    cta: 'Προβολή εγγράφου',
    labels: { number: 'Αριθμός', amount: 'Οφειλόμενο ποσό', due: 'Ημερομηνία λήξης', account: 'Λογαριασμός', reference: 'Κωδικός' },
    questions: `Ερωτήσεις; Απαντήστε σε αυτό το email ή γράψτε στο ${COMPANY.email.primary}.`,
    sign: 'Με εκτίμηση,\nFODEL',
  },
  cs: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Faktura je přiložena ve formátu PDF a můžete si ji prohlédnout i online.',
    heading: (kind: string) => `${kind} ke stažení`,
    greeting: (name: string) => `Dobrý den, ${name},`,
    body: (kind: string, n: string) => `v příloze vám zasíláme doklad ${n} (${kind.toLowerCase()}) ve formátu PDF. Zobrazit si ho můžete i online tlačítkem níže.`,
    settled: 'Nic dalšího nedoplácíte: částka již byla přijata. Děkujeme.',
    pay: 'Částku prosím uhraďte do data splatnosti a uveďte číslo dokladu.',
    cta: 'Zobrazit doklad',
    labels: { number: 'Číslo', amount: 'Částka k úhradě', due: 'Datum splatnosti', account: 'Účet', reference: 'Číslo inzerátu' },
    questions: `Máte otázky? Odpovězte na tento e-mail nebo napište na ${COMPANY.email.primary}.`,
    sign: 'S pozdravem\nFODEL',
  },
  sl: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Račun je priložen v obliki PDF, ogledate pa si ga lahko tudi na spletu.',
    heading: (kind: string) => `${kind} na voljo`,
    greeting: (name: string) => `Pozdravljeni, ${name},`,
    body: (kind: string, n: string) => `v prilogi vam pošiljamo dokument ${n} (${kind.toLowerCase()}) v obliki PDF. Ogledate si ga lahko tudi na spletu z gumbom spodaj.`,
    settled: 'Ničesar več ni treba plačati: znesek smo že prejeli. Hvala.',
    pay: 'Znesek nakažite do datuma zapadlosti in navedite številko.',
    cta: 'Ogled dokumenta',
    labels: { number: 'Številka', amount: 'Znesek za plačilo', due: 'Datum zapadlosti', account: 'Račun', reference: 'Referenca' },
    questions: `Imate vprašanja? Odgovorite na to sporočilo ali pišite na ${COMPANY.email.primary}.`,
    sign: 'Lep pozdrav\nFODEL',
  },
  sv: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Fakturan bifogas som PDF och kan även visas online.',
    heading: (kind: string) => `${kind} klar`,
    greeting: (name: string) => `Hej ${name},`,
    body: (kind: string, n: string) => `Bifogat finns dokument ${n} (${kind.toLowerCase()}) som PDF. Du kan också visa det online med knappen nedan.`,
    settled: 'Inget mer att betala: beloppet har redan kommit in. Tack.',
    pay: 'Överför beloppet före förfallodagen och ange numret.',
    cta: 'Visa dokumentet',
    labels: { number: 'Nummer', amount: 'Belopp att betala', due: 'Förfallodag', account: 'Konto', reference: 'Referens' },
    questions: `Frågor? Svara på det här mejlet eller skriv till ${COMPANY.email.primary}.`,
    sign: 'Vänliga hälsningar\nFODEL',
  },
  da: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Fakturaen er vedhæftet som PDF og kan også ses online.',
    heading: (kind: string) => `${kind} klar`,
    greeting: (name: string) => `Kære ${name}`,
    body: (kind: string, n: string) => `Vedhæftet finder du dokument ${n} (${kind.toLowerCase()}) som PDF. Du kan også se det online med knappen nedenfor.`,
    settled: 'Der er intet yderligere at betale: beløbet er allerede modtaget. Tak.',
    pay: 'Overfør venligst beløbet inden forfaldsdatoen, og angiv nummeret.',
    cta: 'Se dokumentet',
    labels: { number: 'Nummer', amount: 'Beløb til betaling', due: 'Forfaldsdato', account: 'Konto', reference: 'Reference' },
    questions: `Spørgsmål? Svar på denne e-mail, eller skriv til ${COMPANY.email.primary}.`,
    sign: 'Med venlig hilsen\nFODEL',
  },
  no: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Fakturaen er vedlagt som PDF og kan også vises på nett.',
    heading: (kind: string) => `${kind} klar`,
    greeting: (name: string) => `Hei ${name},`,
    body: (kind: string, n: string) => `Vedlagt finner du dokument ${n} (${kind.toLowerCase()}) som PDF. Du kan også se det på nett med knappen nedenfor.`,
    settled: 'Det er ingenting mer å betale: beløpet er allerede mottatt. Takk.',
    pay: 'Overfør beløpet innen forfallsdatoen, og oppgi nummeret.',
    cta: 'Vis dokumentet',
    labels: { number: 'Nummer', amount: 'Beløp å betale', due: 'Forfallsdato', account: 'Konto', reference: 'Referanse' },
    questions: `Spørsmål? Svar på denne e-posten eller skriv til ${COMPANY.email.primary}.`,
    sign: 'Med vennlig hilsen\nFODEL',
  },
  fi: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Lasku on liitteenä PDF-tiedostona, ja voit katsoa sen myös verkossa.',
    heading: (kind: string) => `${kind} valmiina`,
    greeting: (name: string) => `Hei ${name},`,
    body: (kind: string, n: string) => `Liitteenä on asiakirja ${n} (${kind.toLowerCase()}) PDF-muodossa. Voit katsoa sen myös verkossa alla olevalla painikkeella.`,
    settled: 'Maksettavaa ei ole: summa on jo vastaanotettu. Kiitos.',
    pay: 'Maksa summa eräpäivään mennessä ja merkitse viestiksi numero.',
    cta: 'Näytä asiakirja',
    labels: { number: 'Numero', amount: 'Maksettava summa', due: 'Eräpäivä', account: 'Tili', reference: 'Viite' },
    questions: `Kysyttävää? Vastaa tähän viestiin tai kirjoita osoitteeseen ${COMPANY.email.primary}.`,
    sign: 'Ystävällisin terveisin\nFODEL',
  },
  et: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Arve on lisatud PDF-failina ja seda saab vaadata ka veebis.',
    heading: (kind: string) => `${kind} on valmis`,
    greeting: (name: string) => `Tere, ${name}!`,
    body: (kind: string, n: string) => `Manuses on dokument ${n} (${kind.toLowerCase()}) PDF-vormingus. Seda saate vaadata ka veebis alloleva nupuga.`,
    settled: 'Rohkem pole vaja maksta: summa on juba laekunud. Aitäh.',
    pay: 'Palun kandke summa üle maksetähtajaks ja märkige number.',
    cta: 'Vaata dokumenti',
    labels: { number: 'Number', amount: 'Tasumisele kuuluv summa', due: 'Maksetähtaeg', account: 'Konto', reference: 'Viitenumber' },
    questions: `Küsimusi? Vastake sellele kirjale või kirjutage aadressil ${COMPANY.email.primary}.`,
    sign: 'Lugupidamisega\nFODEL',
  },
  lv: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Rēķins ir pievienots PDF formātā, un to var apskatīt arī tiešsaistē.',
    heading: (kind: string) => `${kind} ir gatavs`,
    greeting: (name: string) => `Labdien, ${name}!`,
    body: (kind: string, n: string) => `Pielikumā nosūtām dokumentu ${n} (${kind.toLowerCase()}) PDF formātā. To varat apskatīt arī tiešsaistē, izmantojot pogu zemāk.`,
    settled: 'Nekas vairs nav jāmaksā: summa jau ir saņemta. Paldies.',
    pay: 'Lūdzu, pārskaitiet summu līdz apmaksas termiņam, norādot numuru.',
    cta: 'Skatīt dokumentu',
    labels: { number: 'Numurs', amount: 'Maksājamā summa', due: 'Apmaksas termiņš', account: 'Konts', reference: 'Atsauce' },
    questions: `Jautājumi? Atbildiet uz šo e-pastu vai rakstiet uz ${COMPANY.email.primary}.`,
    sign: 'Ar cieņu\nFODEL',
  },
  lt: {
    subject: (kind: string, n: string) => `${kind} ${n} | FODEL`,
    preheader: 'Sąskaita pridėta PDF formatu, ją taip pat galima peržiūrėti internete.',
    heading: (kind: string) => `${kind} paruošta`,
    greeting: (name: string) => `Laba diena, ${name},`,
    body: (kind: string, n: string) => `prisegame dokumentą ${n} (${kind.toLowerCase()}) PDF formatu. Jį taip pat galite peržiūrėti internete spustelėję toliau esantį mygtuką.`,
    settled: 'Daugiau mokėti nereikia: suma jau gauta. Ačiū.',
    pay: 'Pervekite sumą iki mokėjimo termino ir nurodykite numerį.',
    cta: 'Peržiūrėti dokumentą',
    labels: { number: 'Numeris', amount: 'Mokėtina suma', due: 'Mokėjimo terminas', account: 'Sąskaita', reference: 'Nuoroda' },
    questions: `Turite klausimų? Atsakykite į šį laišką arba rašykite adresu ${COMPANY.email.primary}.`,
    sign: 'Pagarbiai\nFODEL',
  },
};

const KIND_NAMES = {
  nl: { invoice: 'Factuur', proforma: 'Pro-formafactuur', credit_note: 'Creditnota' },
  en: { invoice: 'Invoice', proforma: 'Pro forma invoice', credit_note: 'Credit note' },
  de: { invoice: 'Rechnung', proforma: 'Proforma-Rechnung', credit_note: 'Gutschrift' },
  fr: { invoice: 'Facture', proforma: 'Facture pro forma', credit_note: 'Avoir' },
  es: { invoice: 'Factura', proforma: 'Factura proforma', credit_note: 'Factura rectificativa' },
  pl: { invoice: 'Faktura', proforma: 'Faktura pro forma', credit_note: 'Faktura korygująca' },
  ro: { invoice: 'Factură', proforma: 'Factură proformă', credit_note: 'Factură de stornare' },
  sk: { invoice: 'Faktúra', proforma: 'Zálohová faktúra', credit_note: 'Dobropis' },
  it: { invoice: 'Fattura', proforma: 'Fattura proforma', credit_note: 'Nota di credito' },
  pt: { invoice: 'Fatura', proforma: 'Fatura pró-forma', credit_note: 'Nota de crédito' },
  el: { invoice: 'Τιμολόγιο', proforma: 'Προτιμολόγιο', credit_note: 'Πιστωτικό τιμολόγιο' },
  cs: { invoice: 'Faktura', proforma: 'Zálohová faktura', credit_note: 'Dobropis' },
  sl: { invoice: 'Račun', proforma: 'Predračun', credit_note: 'Dobropis' },
  sv: { invoice: 'Faktura', proforma: 'Proformafaktura', credit_note: 'Kreditnota' },
  da: { invoice: 'Faktura', proforma: 'Proformafaktura', credit_note: 'Kreditnota' },
  no: { invoice: 'Faktura', proforma: 'Proformafaktura', credit_note: 'Kreditnota' },
  fi: { invoice: 'Lasku', proforma: 'Ennakkolasku', credit_note: 'Hyvityslasku' },
  et: { invoice: 'Arve', proforma: 'Ettemaksuarve', credit_note: 'Kreeditarve' },
  lv: { invoice: 'Rēķins', proforma: 'Avansa rēķins', credit_note: 'Kredītrēķins' },
  lt: { invoice: 'Sąskaita faktūra', proforma: 'Išankstinė sąskaita faktūra', credit_note: 'Kreditinė sąskaita faktūra' },
} as const;
const kindName = (doc: InvoiceDoc, locale: Locale) => (locale === 'hu' ? KIND_LABEL[doc.kind].short : KIND_NAMES[locale][doc.kind]);

export function invoiceToCustomer(doc: InvoiceDoc, viewUrl: string): BuiltEmail {
  const locale: Locale = localeFrom(doc.locale);
  const c = COPY[locale];
  const t = computeTotals(doc.lines, doc.vatRate, doc.priceMode);
  const sign = doc.kind === 'credit_note' ? -1 : 1;
  const kind = kindName(doc, locale);
  const number = doc.number ?? '';
  const hasHuf = Boolean(doc.fxRate);
  const money = (cents: number) => (locale !== 'hu' && locale !== 'nl' ? eurCents(cents, locale) : eur(cents));
  const when = (iso: string) => (locale !== 'hu' && locale !== 'nl' ? formatDate(new Date(iso), locale) : dateHu(iso));
  const amount = hasHuf ? huf(hufFromCents(t.grossCents * sign, doc.fxRate!)) : money(t.grossCents * sign);

  const rows: [string, string][] = [
    [c.labels.number, number],
    [c.labels.amount, hasHuf ? `${amount} (${money(t.grossCents * sign)})` : amount],
  ];
  if (!doc.settled && doc.kind !== 'credit_note') {
    rows.push([c.labels.due, when(doc.dueDate)]);
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
