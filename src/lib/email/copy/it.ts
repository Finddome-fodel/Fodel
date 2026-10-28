/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Italian never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const IT = {
  common: {
    greeting: (name: string) => `Gentile ${name},`,
    greetingNoName: 'Gentile inserzionista,',
    signOff: 'Cordiali saluti,\nFINDDOME Immobiliare',
    questions: 'Per qualsiasi domanda, rispondete semplicemente a questa e-mail.',
    linkFallback: 'Se il pulsante non funziona, copiate questo indirizzo nel browser:',
  },

  registrationConfirm: {
    subject: 'Impostate la password | FINDDOME',
    preheader: 'Un clic e potete comporre il vostro annuncio.',
    heading: 'Impostate la password',
    intro: 'Grazie per la registrazione. Il vostro account è quasi pronto; manca solo la password.',
    cta: 'Imposta password',
    next: 'Poi potete proseguire subito con l’annuncio: pacchetto, dati, foto. Lo esaminiamo solo dopo che l’avete inviato.',
    expiry: 'Il link è valido per 7 giorni. Se non vi siete registrati voi, potete ignorare questa e-mail: non verrà creato alcun account.',
  },

  accountExists: {
    subject: 'Avete già un account FINDDOME',
    preheader: 'Accedete oppure impostate una nuova password.',
    heading: 'Questo indirizzo ha già un account',
    body: 'Qualcuno ha appena tentato di registrarsi sul sito FINDDOME con questo indirizzo e-mail. Esiste già un account associato, quindi non ne abbiamo creato uno nuovo.',
    cta: 'Accedi',
    reset: 'Ha dimenticato la password? Ne richieda una nuova',
    ignore: 'Se non è stato Lei, non deve fare nulla: il Suo account resta invariato.',
  },

  invite: {
    subject: 'Invito al portale FINDDOME',
    preheader: 'Imposti la password e acceda al portale inserzionisti.',
    heading: 'È stato invitato al portale FINDDOME',
    body: (role: string) =>
      `FINDDOME La invita a entrare nel portale ${role}, dove si gestiscono gli annunci immobiliari.`,
    roleAdmin: 'come amministratore',
    roleOwner: 'come inserzionista',
    cta: 'Accetta l’invito',
    expiry: 'Il link è valido per 7 giorni e può essere usato una sola volta.',
  },

  welcome: {
    subject: 'Benvenuto nel portale FINDDOME',
    preheader: 'Il Suo account è attivo. Ecco come pubblicare il primo annuncio.',
    heading: (name: string) => `Benvenuto, ${name}`,
    body: 'Il Suo account è attivo. Nel portale compone l’annuncio, carica le foto e ne segue la revisione.',
    stepsTitle: 'Cosa Le serve',
    steps: [
      'Foto dell’immobile: almeno una, ma più sono, meglio è',
      'I dati principali: superficie, dimensione del terreno, prezzo richiesto',
      'Qualche frase su ciò che rende speciale l’immobile',
    ],
    cta: 'Vai al portale',
  },

  submissionReceived: {
    subject: (ref: string) => `Abbiamo ricevuto il Suo annuncio (#${ref})`,
    preheader: 'Lo esamineremo e La informeremo via e-mail.',
    heading: 'Il Suo annuncio è stato ricevuto',
    body: (title: string, ref: string) =>
      `Abbiamo ricevuto il Suo annuncio “${title}” (#${ref}). Un membro del nostro team lo esaminerà e, non appena ci sarà una decisione, riceverà un’e-mail.`,
    timing: 'Di solito la revisione non richiede più di due giorni lavorativi.',
    note: 'Durante la revisione non può modificare l’annuncio. Se Le chiediamo una modifica, si riapre subito.',
  },

  changesRequested: {
    subject: (ref: string) => `Modifica richiesta (#${ref})`,
    preheader: 'Una piccola modifica e l’annuncio può andare online.',
    heading: 'Le chiediamo di apportare una modifica',
    body: (title: string, ref: string) =>
      `Il nostro team ha il seguente commento sul Suo annuncio “${title}” (#${ref}):`,
    after: 'L’annuncio è di nuovo modificabile. Apporti la modifica e lo invii di nuovo; la procedura proseguirà normalmente.',
    cta: 'Modifica annuncio',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Approvato (#${ref}): manca solo il pagamento`,
    preheader: 'Il Suo annuncio è approvato e sarà online non appena arriverà il pagamento.',
    heading: 'Il Suo annuncio è stato approvato',
    body: (title: string, ref: string) =>
      `Buone notizie: abbiamo esaminato e approvato il Suo annuncio “${title}” (#${ref}). Manca solo il pagamento. Non appena arriva, l’annuncio va subito online.`,
    orderTitle: 'Costo dell’annuncio',
    discountLabel: 'Sconto presentazione (10%)',
    totalLabel: 'Da pagare',
    ctaCard: 'Paga con carta',
    cardNote: 'Il pagamento avviene nell’ambiente sicuro di Stripe. FINDDOME non vede né conserva i dati della Sua carta.',
    bankTitle: 'Oppure con bonifico bancario',
    bankNote: (ref: string) =>
      `Indichi nel bonifico il numero di riferimento: ${ref}. Non appena arriva, un membro del nostro team mette online l’annuncio.`,
    vatNote: 'Tutti gli importi includono l’IVA olandese del 21%.',
  },

  approvedPublished: {
    subject: (ref: string) => `Approvato e online (#${ref})`,
    preheader: 'Il Suo annuncio è già online; paghi il costo dell’annuncio entro 14 giorni.',
    heading: 'Il Suo annuncio è ora online',
    body: (title: string, ref: string) => `Abbiamo approvato l’annuncio “${title}” (#${ref}) e l’abbiamo pubblicato subito.`,
    viewCta: 'Vedi l’annuncio',
    orderTitle: 'Costo dell’annuncio',
    discountLabel: 'Sconto presentazione (10%)',
    totalLabel: 'Da pagare',
    dueLabel: 'Da pagare entro',
    ctaCard: 'Paga con carta',
    cardNote: 'Il pagamento avviene nell’ambiente sicuro di Stripe. FINDDOME non vede né conserva i dati della Sua carta.',
    bankTitle: 'Bonifico bancario',
    bankNote: (ref: string) => `Indichi nel bonifico il numero di riferimento: ${ref}.`,
    vatNote: 'Tutti gli importi includono l’IVA olandese del 21%.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Conferma di pagamento (#${ref})`,
    preheader: 'Grazie, abbiamo ricevuto il Suo pagamento.',
    heading: 'Grazie, il Suo pagamento è arrivato',
    body: (title: string, ref: string) =>
      `Abbiamo ricevuto il pagamento per l’annuncio “${title}” (#${ref}). L’annuncio è online e visibile su ${SITE_HOST}.`,
    orderTitle: 'Dettaglio',
    discountLabel: 'Sconto presentazione (10%)',
    totalLabel: 'Importo pagato',
    vatNote: 'L’importo include l’IVA olandese del 21%. Riceverà la fattura con un’e-mail separata.',
    paidAtLabel: 'Data di pagamento',
  },

  published: {
    subject: (ref: string) => `Il Suo annuncio è online (#${ref})`,
    preheader: `L’annuncio è ora visibile su ${SITE_HOST}.`,
    heading: 'Il Suo annuncio è online',
    body: (title: string, ref: string) =>
      `Il Suo annuncio “${title}” (#${ref}) è su ${SITE_HOST} e raggiunge acquirenti in otto Paesi.`,
    cta: 'Vedi l’annuncio',
    next: 'Non appena qualcuno mostra interesse, Le inviamo subito i suoi dati via e-mail. Nel portale può sempre vedere lo stato del Suo annuncio.',
  },

  newEnquiry: {
    subject: (ref: string) => `Nuova richiesta (#${ref})`,
    preheader: 'Qualcuno è interessato al Suo immobile.',
    heading: 'Nuova risposta al Suo annuncio',
    body: (title: string, ref: string) =>
      `Qualcuno ha risposto al Suo annuncio “${title}” (#${ref}):`,
    labels: { name: 'Nome', email: 'E-mail', phone: 'Telefono' },
    messageTitle: 'Il suo messaggio',
    advice: 'Se possibile, si metta in contatto entro due giorni: una risposta rapida è di gran lunga il fattore più importante perché la vendita vada in porto.',
  },

  passwordReset: {
    subject: 'Reimposti la password | Portale FINDDOME',
    preheader: 'Il link è valido per un’ora.',
    heading: 'Reimposti la password',
    body: 'Abbiamo ricevuto una richiesta di reimpostazione della password del Suo account sul portale FINDDOME. Clicchi il pulsante qui sotto per impostarne una nuova.',
    cta: 'Imposta una nuova password',
    expiry: 'Il link è valido per un’ora e può essere usato una sola volta.',
    ignore: 'Se non ha fatto Lei questa richiesta, ignori questa e-mail. La password resta invariata e non succede nulla.',
  },

  referralRegistered: {
    subject: 'Abbiamo ricevuto la Sua segnalazione | FINDDOME',
    preheader: 'Un membro del nostro team contatterà presto la persona che ha segnalato.',
    heading: 'Grazie per la segnalazione',
    body: (referredName: string) =>
      `Abbiamo ricevuto i dati di ${referredName}. Un membro del nostro team lo contatterà e, una volta pubblicato l’annuncio, Le accrediteremo uno sconto del 10% sul costo del Suo prossimo annuncio.`,
    note: 'L’accredito viene applicato manualmente, dopo il pagamento dell’inserzionista. La avviseremo non appena sarà possibile.',
  },

  valuationReceived: {
    heading: 'Abbiamo ricevuto la Sua richiesta di valutazione',
    body: 'Un membro del nostro team verifica i dati dell’immobile e la base dati, poi Le invia via e-mail la valutazione indicativa basata sul mercato.',
  },

  valuationReady: {
    subject: 'La Sua valutazione è pronta | FINDDOME',
    preheader: 'Abbiamo effettuato una stima indicativa del Suo immobile.',
    heading: 'La Sua valutazione è pronta',
    body: (range: string) =>
      `In base ai dati forniti e a immobili comparabili, la nostra stima indicativa è: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Questa stima è indicativa, non è una perizia e non sostituisce una valutazione ufficiale. Si basa su immobili comparabili: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Questa stima è indicativa, non è una perizia e non sostituisce una valutazione ufficiale.',
    cta: 'Pubblichi ora l’annuncio',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `In base ai dati forniti, il valore indicativo di mercato è: ${range}.`,
    mid: 'Valore medio',
    basis: 'Base dati',
    rateDate: 'Data del tasso di cambio',
    source: 'Fonte',
    factorsHeading: 'Fattori',
    dirPlus: 'Aumenta il valore',
    dirMinus: 'Riduce il valore',
    dirUnsure: 'Incerto',
    visit: 'Richieda una visita di Gábor',
    judicial: 'Richieda una valutazione ufficiale',
  },

  valuationDeclined: {
    subject: 'La Sua richiesta di valutazione | FINDDOME',
    preheader: 'Un membro del nostro team La contatterà personalmente.',
    heading: 'Grazie per la Sua richiesta',
    body: 'Sulla base dei dati forniti, al momento abbiamo troppo pochi immobili comparabili per una stima affidabile. Un membro del nostro team La contatterà personalmente.',
  },

  valuationNeedsInfo: {
    subject: 'Valutazione: ci servono ancora alcuni dati',
    preheader: 'Per la stima ci servono ancora alcune informazioni.',
    heading: 'Ci servono ancora alcuni dati',
    body: 'Grazie per la Sua richiesta di valutazione. Per la stima, un membro del nostro team Le chiede quanto segue:',
    after: 'Risponda a questa e-mail con i dati mancanti. Non appena li avremo, effettueremo la stima.',
  },

  rejected: {
    subject: (ref: string) => `Non è possibile pubblicare il Suo annuncio (#${ref})`,
    preheader: 'L’esito della revisione e la motivazione.',
    heading: 'Non possiamo pubblicare l’annuncio',
    body: (title: string, ref: string) =>
      `Ci dispiace: dopo la revisione, il nostro team non ha approvato il Suo annuncio “${title}” (#${ref}). La motivazione:`,
    refund: 'Se ha già pagato l’annuncio, La contatteremo separatamente per il rimborso.',
    after: 'Se ha una domanda o pensa che ci sia stato un malinteso, risponda semplicemente a questa e-mail.',
  },

  invoiceIssued: {
    subject: (number: string) => `Fattura ${number}`,
    preheader: 'La fattura è pronta; può visualizzarla o scaricarla tramite il link.',
    heading: 'La Sua fattura è pronta',
    body: (title: string, ref: string, number: string) =>
      `La fattura ${number} per il Suo annuncio “${title}” (#${ref}) è pronta.`,
    cta: 'Vedi fattura',
  },

  creditNoteIssued: {
    subject: (number: string) => `Nota di credito ${number}`,
    preheader: 'Abbiamo emesso una nota di credito per la Sua fattura precedente.',
    heading: 'Nota di credito pronta',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Abbiamo emesso la nota di credito ${number} relativa alla fattura ${correctsNumber} per il Suo annuncio “${title}” (#${ref}).`,
    cta: 'Vedi nota di credito',
  },

  serviceRequested: {
    subject: 'Abbiamo ricevuto la Sua richiesta | FINDDOME',
    preheader: 'Un membro del nostro team La contatterà per fissare una data.',
    heading: 'Abbiamo ricevuto la Sua richiesta',
    body: (service: string, price: string) => `Grazie, abbiamo registrato la Sua richiesta: ${service} (${price}).`,
    next: 'Un membro del nostro team La contatterà per fissare una data.',
    payment: 'Le daremo indicazioni sul pagamento quando fisseremo la data. Ora non paga nulla.',
    cancel: 'Ha cambiato idea? Risponda semplicemente a questa e-mail.',
  },

  valuationPaid: {
    subject: 'Conferma di pagamento | Valutazione FINDDOME',
    preheader: 'Grazie, il Suo pagamento è arrivato.',
    heading: 'Grazie, il Suo pagamento è arrivato',
    body: (service: string) => `Abbiamo ricevuto il pagamento per “${service}”.`,
    orderTitle: 'Voce',
    totalLabel: 'Importo pagato',
    paidAtLabel: 'Pagato il',
    next: 'Un membro del nostro team La contatterà presto per i passi successivi.',
    invoice: 'Le serve una fattura? Risponda semplicemente a questa e-mail.',
  },

  judicialRequested: {
    subject: 'Richiesta di valutazione ufficiale | FINDDOME',
    preheader: 'Un membro del nostro team La contatterà per illustrarLe le possibilità.',
    heading: 'Abbiamo ricevuto la Sua richiesta',
    body: 'Grazie, abbiamo preso nota che desidera una valutazione ufficiale (giudiziaria) da parte di un perito. Non è la stessa cosa della valutazione indicativa basata sul mercato presente sul nostro sito: la esegue un perito autorizzato, sulla base di un preventivo.',
    next: 'Un membro del nostro team La contatterà per le possibilità e il preventivo.',
  },
} satisfies PublicEmailCopy;
