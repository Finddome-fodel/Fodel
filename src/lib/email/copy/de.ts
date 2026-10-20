/**
 * Deutsche E-Mail-Texte (Sie-Form). Gegen die ungarische Datei typgeprüft
 * (`satisfies PublicEmailCopy`): Fehlt hier eine Vorlage, kompiliert diese
 * Datei nicht, und niemand erhält eine ungarische oder niederländische E-Mail.
 * Die Hinweise an das Büro (admin*) bleiben ungarisch und stehen nicht hier.
 *
 * Ton: sachlich, kurze Sätze, keine Ausrufezeichen. Viele Verkäufer sind
 * im Ruhestand; Klarheit geht vor Wärme, beides vor Werbesprache.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const DE = {
  common: {
    greeting: (name: string) => `Guten Tag ${name},`,
    greetingNoName: 'Guten Tag,',
    signOff: 'Mit freundlichen Grüßen\nFODEL Immobilien',
    questions: 'Haben Sie eine Frage? Antworten Sie einfach auf diese E-Mail.',
    linkFallback: 'Funktioniert die Schaltfläche nicht? Kopieren Sie diese Adresse in Ihren Browser:',
  },

  registrationConfirm: {
    subject: 'Legen Sie Ihr Passwort fest | FODEL',
    preheader: 'Ein Klick, und Sie können Ihr Inserat zusammenstellen.',
    heading: 'Legen Sie Ihr Passwort fest',
    intro: 'Vielen Dank für Ihre Registrierung. Ihr Konto ist fast fertig, es fehlt nur noch das Passwort.',
    cta: 'Passwort festlegen',
    next: 'Danach machen Sie direkt mit Ihrem Inserat weiter: Paket, Angaben, Fotos. Wir sehen es uns erst an, wenn Sie es eingereicht haben.',
    expiry: 'Der Link ist 7 Tage gültig. Haben Sie sich nicht selbst registriert, können Sie diese E-Mail ignorieren: Es wird kein Konto angelegt.',
  },

  accountExists: {
    subject: 'Sie haben bereits ein FODEL-Konto',
    preheader: 'Melden Sie sich an oder legen Sie ein neues Passwort fest.',
    heading: 'Zu dieser Adresse gibt es bereits ein Konto',
    body: 'Jemand hat gerade versucht, sich mit dieser E-Mail-Adresse auf der Website von FODEL zu registrieren. Zu dieser Adresse gibt es bereits ein Konto, daher haben wir kein neues angelegt.',
    cta: 'Anmelden',
    reset: 'Passwort vergessen? Neues Passwort anfordern',
    ignore: 'Waren Sie das nicht? Dann müssen Sie nichts tun: Ihr Konto bleibt, wie es ist.',
  },

  invite: {
    subject: 'Einladung zum FODEL-Portal',
    preheader: 'Legen Sie Ihr Passwort fest und melden Sie sich im Inserentenportal an.',
    heading: 'Sie sind zum FODEL-Portal eingeladen',
    body: (role: string) =>
      `FODEL lädt Sie ein, ${role} am Portal teilzunehmen, in dem Sie Immobilieninserate verwalten.`,
    roleAdmin: 'als Administrator',
    roleOwner: 'als Inserent',
    cta: 'Einladung annehmen',
    expiry: 'Der Link ist 7 Tage gültig und kann nur einmal verwendet werden.',
  },

  welcome: {
    subject: 'Willkommen im FODEL-Portal',
    preheader: 'Ihr Konto ist aktiv. So geben Sie Ihr erstes Inserat auf.',
    heading: (name: string) => `Willkommen, ${name}`,
    body: 'Ihr Konto ist aktiv. Im Portal stellen Sie Ihr Inserat zusammen, laden Fotos hoch und verfolgen die Prüfung.',
    stepsTitle: 'Was Sie brauchen',
    steps: [
      'Fotos der Immobilie: mindestens eines, je mehr, desto besser',
      'Die Grunddaten: Wohnfläche, Grundstücksgröße, Angebotspreis',
      'Ein paar Sätze dazu, was die Immobilie besonders macht',
    ],
    cta: 'Zum Portal',
  },

  submissionReceived: {
    subject: (ref: string) => `Wir haben Ihr Inserat erhalten (#${ref})`,
    preheader: 'Wir prüfen es und informieren Sie per E-Mail.',
    heading: 'Ihr Inserat ist eingegangen',
    body: (title: string, ref: string) =>
      `Wir haben Ihr Inserat „${title}“ (#${ref}) erhalten. Ein Mitarbeiter prüft es, und sobald eine Entscheidung vorliegt, erfahren Sie es per E-Mail.`,
    timing: 'Die Prüfung dauert in der Regel nicht länger als zwei Werktage.',
    note: 'Während der Prüfung können Sie das Inserat nicht bearbeiten. Bitten wir um eine Änderung, wird es sofort wieder freigegeben.',
  },

  changesRequested: {
    subject: (ref: string) => `Änderung erforderlich (#${ref})`,
    preheader: 'Eine kleine Änderung, und das Inserat kann online gehen.',
    heading: 'Wir bitten Sie um eine Änderung',
    body: (title: string, ref: string) =>
      `Zu Ihrem Inserat „${title}“ (#${ref}) hat unser Mitarbeiter folgende Anmerkung:`,
    after: 'Das Inserat lässt sich wieder bearbeiten. Nehmen Sie die Änderung vor und reichen Sie es erneut ein. Danach läuft das Verfahren einfach weiter.',
    cta: 'Inserat bearbeiten',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Freigegeben (#${ref}): nur die Zahlung fehlt noch`,
    preheader: 'Ihr Inserat ist freigegeben und geht online, sobald die Zahlung eingegangen ist.',
    heading: 'Ihr Inserat wurde freigegeben',
    body: (title: string, ref: string) =>
      `Gute Nachrichten: Wir haben Ihr Inserat „${title}“ (#${ref}) geprüft und freigegeben. Es fehlt nur noch die Zahlung. Sobald sie eingegangen ist, geht das Inserat sofort online.`,
    orderTitle: 'Kosten des Inserats',
    discountLabel: 'Empfehlungsrabatt (10 %)',
    totalLabel: 'Zu zahlen',
    ctaCard: 'Mit Karte zahlen',
    cardNote: 'Die Zahlung läuft über die gesicherte Umgebung von Stripe. FODEL sieht und speichert Ihre Kartendaten nicht.',
    bankTitle: 'Oder per Banküberweisung',
    bankNote: (ref: string) =>
      `Geben Sie bei der Überweisung die Referenznummer an: ${ref}. Sobald die Überweisung eingegangen ist, schaltet unser Mitarbeiter das Inserat online.`,
    vatNote: 'Alle genannten Beträge enthalten 21 % niederländische USt.',
  },

  approvedPublished: {
    subject: (ref: string) => `Freigegeben und online (#${ref})`,
    preheader: 'Ihr Inserat ist bereits online; bitte zahlen Sie die Inseratskosten innerhalb von 14 Tagen.',
    heading: 'Ihr Inserat ist jetzt online',
    body: (title: string, ref: string) => `Wir haben das Inserat „${title}“ (#${ref}) freigegeben und sofort veröffentlicht.`,
    viewCta: 'Inserat ansehen',
    orderTitle: 'Kosten des Inserats',
    discountLabel: 'Empfehlungsrabatt (10 %)',
    totalLabel: 'Zu zahlen',
    dueLabel: 'Zahlbar bis',
    ctaCard: 'Mit Karte zahlen',
    cardNote: 'Die Zahlung läuft über die gesicherte Umgebung von Stripe. FODEL sieht und speichert Ihre Kartendaten nicht.',
    bankTitle: 'Banküberweisung',
    bankNote: (ref: string) => `Geben Sie bei der Überweisung die Referenznummer an: ${ref}.`,
    vatNote: 'Alle genannten Beträge enthalten 21 % niederländische USt.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Zahlungsbestätigung (#${ref})`,
    preheader: 'Vielen Dank, wir haben Ihre Zahlung erhalten.',
    heading: 'Vielen Dank, Ihre Zahlung ist eingegangen',
    body: (title: string, ref: string) =>
      `Wir haben die Zahlung für das Inserat „${title}“ (#${ref}) erhalten. Das Inserat ist online und auf ${SITE_HOST} sichtbar.`,
    orderTitle: 'Aufstellung',
    discountLabel: 'Empfehlungsrabatt (10 %)',
    totalLabel: 'Gezahlter Betrag',
    vatNote: 'Der Betrag enthält 21 % niederländische USt. Die Rechnung erhalten Sie in einer separaten E-Mail.',
    paidAtLabel: 'Zahlungsdatum',
  },

  published: {
    subject: (ref: string) => `Ihr Inserat ist online (#${ref})`,
    preheader: `Das Inserat ist jetzt auf ${SITE_HOST} sichtbar.`,
    heading: 'Ihr Inserat ist online',
    body: (title: string, ref: string) =>
      `Ihr Inserat „${title}“ (#${ref}) steht auf ${SITE_HOST} und erreicht Käufer in acht Ländern.`,
    cta: 'Inserat ansehen',
    next: 'Sobald sich jemand interessiert, schicken wir Ihnen sofort eine E-Mail mit dessen Angaben. Den Status Ihres Inserats sehen Sie jederzeit im Portal.',
  },

  newEnquiry: {
    subject: (ref: string) => `Neue Anfrage (#${ref})`,
    preheader: 'Jemand interessiert sich für Ihre Immobilie.',
    heading: 'Neue Reaktion auf Ihr Inserat',
    body: (title: string, ref: string) =>
      `Auf Ihr Inserat „${title}“ (#${ref}) hat jemand reagiert:`,
    labels: { name: 'Name', email: 'E-Mail', phone: 'Telefon' },
    messageTitle: 'Die Nachricht',
    advice: 'Melden Sie sich möglichst innerhalb von zwei Tagen: Eine schnelle Antwort ist mit Abstand der wichtigste Faktor dafür, ob es zu einem Verkauf kommt.',
  },

  passwordReset: {
    subject: 'Passwort zurücksetzen | FODEL-Portal',
    preheader: 'Der Link ist eine Stunde gültig.',
    heading: 'Passwort zurücksetzen',
    body: 'Wir haben eine Anfrage erhalten, das Passwort Ihres FODEL-Portalkontos zurückzusetzen. Klicken Sie auf die Schaltfläche unten, um ein neues festzulegen.',
    cta: 'Neues Passwort festlegen',
    expiry: 'Der Link ist eine Stunde gültig und kann nur einmal verwendet werden.',
    ignore: 'Haben Sie das nicht selbst angefordert? Ignorieren Sie diese E-Mail. Ihr Passwort bleibt unverändert, und es passiert nichts.',
  },

  referralRegistered: {
    subject: 'Ihre Empfehlung ist eingegangen | FODEL',
    preheader: 'Unser Mitarbeiter meldet sich in Kürze bei der von Ihnen empfohlenen Person.',
    heading: 'Vielen Dank für die Empfehlung',
    body: (referredName: string) =>
      `Wir haben die Angaben von ${referredName} erhalten. Unser Mitarbeiter nimmt Kontakt auf, und sobald das Inserat zustande kommt, schreiben wir Ihnen 10 % der Kosten Ihres nächsten Inserats gut.`,
    note: 'Die Gutschrift erfolgt manuell, nachdem der Inserent bezahlt hat. Unser Mitarbeiter gibt Ihnen Bescheid, sobald es so weit ist.',
  },

  valuationReceived: {
    heading: 'Wir haben Ihre Bewertungsanfrage erhalten',
    body: 'Unser Mitarbeiter prüft die Angaben zur Immobilie und die Datengrundlage und schickt Ihnen anschließend die unverbindliche, marktbasierte Wertbestimmung per E-Mail.',
  },

  valuationReady: {
    subject: 'Ihre Bewertung liegt vor | FODEL',
    preheader: 'Wir haben eine unverbindliche Einschätzung für Ihre Immobilie erstellt.',
    heading: 'Ihre Bewertung liegt vor',
    body: (range: string) =>
      `Auf Grundlage der angegebenen Daten und vergleichbarer Immobilien lautet unsere unverbindliche Einschätzung: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Diese Einschätzung ist unverbindlich, kein Gutachten und ersetzt keine amtliche Bewertung. Sie beruht auf ${n} vergleichbaren Immobilien.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Diese Einschätzung ist unverbindlich, kein Gutachten und ersetzt keine amtliche Bewertung.',
    cta: 'Jetzt inserieren',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Auf Grundlage der angegebenen Daten beträgt der unverbindliche, marktbasierte Wert: ${range}.`,
    mid: 'Mittelwert',
    basis: 'Datengrundlage',
    rateDate: 'Datum des Wechselkurses',
    source: 'Quelle',
    factorsHeading: 'Faktoren',
    dirPlus: 'Wertsteigernd',
    dirMinus: 'Wertmindernd',
    dirUnsure: 'Unsicher',
    visit: 'Besuch von Gábor anfragen',
    judicial: 'Amtliches Gutachten anfordern',
  },

  valuationDeclined: {
    subject: 'Ihre Bewertungsanfrage | FODEL',
    preheader: 'Unser Mitarbeiter meldet sich persönlich bei Ihnen.',
    heading: 'Vielen Dank für Ihre Anfrage',
    body: 'Auf Grundlage der angegebenen Daten liegen uns derzeit zu wenige vergleichbare Immobilien für eine verlässliche Einschätzung vor. Unser Mitarbeiter meldet sich persönlich bei Ihnen.',
  },

  valuationNeedsInfo: {
    subject: 'Bewertung: Wir brauchen noch einige Angaben',
    preheader: 'Für die Einschätzung benötigen wir noch etwas mehr Information.',
    heading: 'Wir brauchen noch einige Angaben',
    body: 'Vielen Dank für Ihre Bewertungsanfrage. Für die Einschätzung bittet Sie unser Mitarbeiter um Folgendes:',
    after: 'Antworten Sie auf diese E-Mail mit den fehlenden Angaben. Sobald wir sie haben, erstellen wir die Einschätzung.',
  },

  rejected: {
    subject: (ref: string) => `Ihr Inserat kann nicht veröffentlicht werden (#${ref})`,
    preheader: 'Das Ergebnis der Prüfung und die Begründung.',
    heading: 'Wir können das Inserat nicht veröffentlichen',
    body: (title: string, ref: string) =>
      `Es tut uns leid: Unser Mitarbeiter hat Ihr Inserat „${title}“ (#${ref}) nach der Prüfung nicht freigegeben. Die Begründung:`,
    refund: 'Haben Sie für das Inserat bereits bezahlt? Dann melden wir uns wegen der Erstattung gesondert bei Ihnen.',
    after: 'Haben Sie eine Frage oder glauben Sie, dass ein Missverständnis vorliegt? Antworten Sie einfach auf diese E-Mail.',
  },

  invoiceIssued: {
    subject: (number: string) => `Rechnung ${number}`,
    preheader: 'Die Rechnung liegt bereit; Sie können sie über den Link ansehen oder herunterladen.',
    heading: 'Ihre Rechnung liegt bereit',
    body: (title: string, ref: string, number: string) =>
      `Die Rechnung ${number} zu Ihrem Inserat „${title}“ (#${ref}) liegt bereit.`,
    cta: 'Rechnung ansehen',
  },

  creditNoteIssued: {
    subject: (number: string) => `Gutschrift ${number}`,
    preheader: 'Wir haben eine Gutschrift zu Ihrer früheren Rechnung erstellt.',
    heading: 'Gutschrift liegt bereit',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Zur Rechnung ${correctsNumber} Ihres Inserats „${title}“ (#${ref}) haben wir die Gutschrift ${number} erstellt.`,
    cta: 'Gutschrift ansehen',
  },

  serviceRequested: {
    subject: 'Wir haben Ihre Anfrage erhalten | FODEL',
    preheader: 'Unser Mitarbeiter meldet sich, um einen Termin zu vereinbaren.',
    heading: 'Wir haben Ihre Anfrage erhalten',
    body: (service: string, price: string) => `Vielen Dank, wir haben Ihre Anfrage notiert: ${service} (${price}).`,
    next: 'Unser Mitarbeiter meldet sich, um einen Termin zu vereinbaren.',
    payment: 'Über die Zahlung informieren wir Sie bei der Terminvereinbarung. Jetzt müssen Sie nichts zahlen.',
    cancel: 'Sie haben es sich anders überlegt? Antworten Sie einfach auf diese E-Mail.',
  },

  valuationPaid: {
    subject: 'Zahlungsbestätigung | FODEL-Bewertung',
    preheader: 'Vielen Dank, Ihre Zahlung ist eingegangen.',
    heading: 'Vielen Dank, Ihre Zahlung ist eingegangen',
    body: (service: string) => `Wir haben die Zahlung für „${service}“ erhalten.`,
    orderTitle: 'Position',
    totalLabel: 'Gezahlter Betrag',
    paidAtLabel: 'Gezahlt am',
    next: 'Unser Mitarbeiter meldet sich in Kürze zu den nächsten Schritten.',
    invoice: 'Brauchen Sie eine Rechnung? Antworten Sie einfach auf diese E-Mail.',
  },

  judicialRequested: {
    subject: 'Anfrage amtliches Gutachten | FODEL',
    preheader: 'Unser Mitarbeiter meldet sich zu den Möglichkeiten.',
    heading: 'Wir haben Ihre Anfrage erhalten',
    body: 'Vielen Dank, wir haben notiert, dass Sie ein amtliches (gerichtliches) Gutachten durch einen Sachverständigen wünschen. Das ist etwas anderes als die unverbindliche, marktbasierte Wertbestimmung auf unserer Website: Es wird von einem befugten Sachverständigen auf Grundlage eines Angebots erstellt.',
    next: 'Unser Mitarbeiter meldet sich zu den Möglichkeiten und zum Angebot.',
  },
} satisfies PublicEmailCopy;
