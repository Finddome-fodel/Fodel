/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Norwegian Bokmål never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const NO = {
  common: {
    greeting: (name: string) => `Hei ${name},`,
    greetingNoName: 'Kjære annonsør,',
    signOff: 'Med vennlig hilsen\nFINDDOME Eiendom',
    questions: 'Har du spørsmål, kan du bare svare på denne e-posten.',
    linkFallback: 'Hvis knappen ikke fungerer, kopierer du denne adressen inn i nettleseren:',
  },

  registrationConfirm: {
    subject: 'Velg passordet ditt | FINDDOME',
    preheader: 'Ett klikk, så kan du sette sammen annonsen din.',
    heading: 'Velg passordet ditt',
    intro: 'Takk for registreringen. Kontoen din er nesten klar; bare passordet mangler.',
    cta: 'Velg passord',
    next: 'Deretter kan du gå rett videre med annonsen: pakke, opplysninger, bilder. Vi ser på den først når du har sendt den inn.',
    expiry: 'Lenken er gyldig i 7 dager. Hvis det ikke var du som registrerte deg, kan du se bort fra denne e-posten: ingen konto blir opprettet.',
  },

  accountExists: {
    subject: 'Du har allerede en FINDDOME-konto',
    preheader: 'Logg inn, eller velg et nytt passord.',
    heading: 'Denne adressen har allerede en konto',
    body: 'Noen prøvde nettopp å registrere seg på FINDDOMEs nettsted med denne e-postadressen. Det finnes allerede en konto for den, så vi har ikke opprettet en ny.',
    cta: 'Logg inn',
    reset: 'Glemt passordet? Be om et nytt',
    ignore: 'Hvis det ikke var deg, trenger du ikke gjøre noe: kontoen din er uendret.',
  },

  invite: {
    subject: 'Invitasjon til FINDDOME-portalen',
    preheader: 'Velg passordet ditt og logg inn i annonsørportalen.',
    heading: 'Du er invitert til FINDDOME-portalen',
    body: (role: string) =>
      `FINDDOME inviterer deg til portalen ${role}, der du administrerer eiendomsannonser.`,
    roleAdmin: 'som administrator',
    roleOwner: 'som annonsør',
    cta: 'Godta invitasjonen',
    expiry: 'Lenken er gyldig i 7 dager og kan brukes én gang.',
  },

  welcome: {
    subject: 'Velkommen til FINDDOME-portalen',
    preheader: 'Kontoen din er aktiv. Slik legger du inn din første annonse.',
    heading: (name: string) => `Velkommen, ${name}`,
    body: 'Kontoen din er aktiv. I portalen setter du sammen annonsen, laster opp bilder og følger gjennomgangen.',
    stepsTitle: 'Dette trenger du',
    steps: [
      'Bilder av eiendommen: minst ett, men jo flere, jo bedre',
      'Grunnopplysningene: boareal, tomtestørrelse, prisantydning',
      'Noen setninger om hva som gjør eiendommen spesiell',
    ],
    cta: 'Gå til portalen',
  },

  submissionReceived: {
    subject: (ref: string) => `Vi har mottatt annonsen din (#${ref})`,
    preheader: 'Vi går gjennom den og gir deg beskjed på e-post.',
    heading: 'Annonsen din er mottatt',
    body: (title: string, ref: string) =>
      `Vi har mottatt annonsen din «${title}» (#${ref}). Noen i teamet vårt går gjennom den, og så snart det foreligger en avgjørelse, hører du fra oss på e-post.`,
    timing: 'Gjennomgangen tar vanligvis ikke mer enn to virkedager.',
    note: 'Under gjennomgangen kan du ikke redigere annonsen. Hvis vi ber om en endring, åpnes den straks igjen.',
  },

  changesRequested: {
    subject: (ref: string) => `Endring nødvendig (#${ref})`,
    preheader: 'Én liten endring, så kan annonsen publiseres.',
    heading: 'Vi ber deg gjøre en endring',
    body: (title: string, ref: string) =>
      `Teamet vårt har følgende kommentar til annonsen din «${title}» (#${ref}):`,
    after: 'Annonsen kan redigeres igjen. Gjør endringen og send den inn på nytt; så fortsetter prosessen som vanlig.',
    cta: 'Rediger annonse',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Godkjent (#${ref}): bare betalingen gjenstår`,
    preheader: 'Annonsen din er godkjent og publiseres så snart betalingen er mottatt.',
    heading: 'Annonsen din er godkjent',
    body: (title: string, ref: string) =>
      `Gode nyheter: vi har gått gjennom og godkjent annonsen din «${title}» (#${ref}). Bare betalingen gjenstår. Så snart den er mottatt, publiseres annonsen umiddelbart.`,
    orderTitle: 'Pris for annonsen',
    discountLabel: 'Vervingsrabatt (10\u00a0%)',
    totalLabel: 'Å betale',
    ctaCard: 'Betal med kort',
    cardNote: 'Betalingen skjer i Stripes sikre miljø. FINDDOME ser ikke og lagrer ikke kortopplysningene dine.',
    bankTitle: 'Eller med bankoverføring',
    bankNote: (ref: string) =>
      `Oppgi referansenummeret ved overføringen: ${ref}. Så snart den er mottatt, publiserer noen i teamet vårt annonsen.`,
    vatNote: 'Alle beløp inkluderer 21\u00a0% nederlandsk mva.',
  },

  approvedPublished: {
    subject: (ref: string) => `Godkjent og publisert (#${ref})`,
    preheader: 'Annonsen din er allerede publisert; betal annonseprisen innen 14 dager.',
    heading: 'Annonsen din er nå publisert',
    body: (title: string, ref: string) => `Vi har godkjent annonsen «${title}» (#${ref}) og publisert den med en gang.`,
    viewCta: 'Se annonsen',
    orderTitle: 'Pris for annonsen',
    discountLabel: 'Vervingsrabatt (10\u00a0%)',
    totalLabel: 'Å betale',
    dueLabel: 'Betales innen',
    ctaCard: 'Betal med kort',
    cardNote: 'Betalingen skjer i Stripes sikre miljø. FINDDOME ser ikke og lagrer ikke kortopplysningene dine.',
    bankTitle: 'Bankoverføring',
    bankNote: (ref: string) => `Oppgi referansenummeret ved overføringen: ${ref}.`,
    vatNote: 'Alle beløp inkluderer 21\u00a0% nederlandsk mva.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Betalingsbekreftelse (#${ref})`,
    preheader: 'Takk, vi har mottatt betalingen din.',
    heading: 'Takk, betalingen din har kommet',
    body: (title: string, ref: string) =>
      `Vi har mottatt betalingen for annonsen «${title}» (#${ref}). Annonsen er publisert og synlig på ${SITE_HOST}.`,
    orderTitle: 'Spesifikasjon',
    discountLabel: 'Vervingsrabatt (10\u00a0%)',
    totalLabel: 'Betalt beløp',
    vatNote: 'Beløpet inkluderer 21\u00a0% nederlandsk mva. Fakturaen får du i en egen e-post.',
    paidAtLabel: 'Betalingsdato',
  },

  published: {
    subject: (ref: string) => `Annonsen din er publisert (#${ref})`,
    preheader: `Annonsen er nå synlig på ${SITE_HOST}.`,
    heading: 'Annonsen din er publisert',
    body: (title: string, ref: string) =>
      `Annonsen din «${title}» (#${ref}) ligger på ${SITE_HOST} og når kjøpere i åtte land.`,
    cta: 'Se annonsen',
    next: 'Så snart noen viser interesse, sender vi deg opplysningene deres på e-post med en gang. I portalen ser du alltid statusen til annonsen din.',
  },

  newEnquiry: {
    subject: (ref: string) => `Ny henvendelse (#${ref})`,
    preheader: 'Noen er interessert i eiendommen din.',
    heading: 'Ny henvendelse på annonsen din',
    body: (title: string, ref: string) =>
      `Noen har svart på annonsen din «${title}» (#${ref}):`,
    labels: { name: 'Navn', email: 'E-post', phone: 'Telefon' },
    messageTitle: 'Melding',
    advice: 'Ta gjerne kontakt innen to dager: et raskt svar er den desidert viktigste faktoren for om det blir et salg.',
  },

  passwordReset: {
    subject: 'Tilbakestill passordet | FINDDOME-portalen',
    preheader: 'Lenken er gyldig i én time.',
    heading: 'Tilbakestill passordet ditt',
    body: 'Vi har mottatt en forespørsel om å tilbakestille passordet til kontoen din i FINDDOME-portalen. Klikk på knappen nedenfor for å velge et nytt.',
    cta: 'Velg et nytt passord',
    expiry: 'Lenken er gyldig i én time og kan brukes én gang.',
    ignore: 'Hvis du ikke har bedt om dette, kan du se bort fra denne e-posten. Passordet ditt forblir uendret, og ingenting skjer.',
  },

  referralRegistered: {
    subject: 'Vi har mottatt anbefalingen din | FINDDOME',
    preheader: 'Noen i teamet vårt tar snart kontakt med personen du anbefalte.',
    heading: 'Takk for anbefalingen',
    body: (referredName: string) =>
      `Vi har mottatt opplysningene om ${referredName}. Noen i teamet vårt tar kontakt, og når annonsen er lagt inn, krediterer vi deg 10\u00a0% av prisen for din neste annonse.`,
    note: 'Krediteringen gjøres manuelt etter at annonsøren har betalt. Vi gir deg beskjed så snart det kan gjøres.',
  },

  valuationReceived: {
    heading: 'Vi har mottatt forespørselen din om verdivurdering',
    body: 'Noen i teamet vårt kontrollerer opplysningene om eiendommen og datagrunnlaget og sender deg deretter den veiledende, markedsbaserte verdivurderingen på e-post.',
  },

  valuationReady: {
    subject: 'Verdivurderingen din er klar | FINDDOME',
    preheader: 'Vi har laget et veiledende anslag for eiendommen din.',
    heading: 'Verdivurderingen din er klar',
    body: (range: string) =>
      `Basert på opplysningene som er gitt og sammenlignbare eiendommer, er vårt veiledende anslag: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Anslaget er veiledende, ikke en takstrapport, og erstatter ikke en offisiell verdivurdering. Antall sammenlignbare eiendommer: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Anslaget er veiledende, ikke en takstrapport, og erstatter ikke en offisiell verdivurdering.',
    cta: 'Annonser nå',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Basert på opplysningene som er gitt, er den veiledende markedsverdien: ${range}.`,
    mid: 'Midtpunkt',
    basis: 'Datagrunnlag',
    rateDate: 'Valutakursdato',
    source: 'Kilde',
    factorsHeading: 'Faktorer',
    dirPlus: 'Øker verdien',
    dirMinus: 'Senker verdien',
    dirUnsure: 'Usikkert',
    visit: 'Be om besøk av Gábor',
    judicial: 'Be om en offisiell verdivurdering',
  },

  valuationDeclined: {
    subject: 'Forespørselen din om verdivurdering | FINDDOME',
    preheader: 'Noen i teamet vårt tar personlig kontakt med deg.',
    heading: 'Takk for forespørselen din',
    body: 'Basert på opplysningene som er gitt, har vi for øyeblikket for få sammenlignbare eiendommer til et pålitelig anslag. Noen i teamet vårt tar personlig kontakt med deg.',
  },

  valuationNeedsInfo: {
    subject: 'Verdivurdering: vi trenger noen flere opplysninger',
    preheader: 'Vi trenger litt mer informasjon til anslaget.',
    heading: 'Vi trenger noen flere opplysninger',
    body: 'Takk for forespørselen din om verdivurdering. Til anslaget ber noen i teamet vårt deg om følgende:',
    after: 'Svar på denne e-posten med opplysningene som mangler. Så snart vi har dem, lager vi anslaget.',
  },

  rejected: {
    subject: (ref: string) => `Annonsen din kan ikke publiseres (#${ref})`,
    preheader: 'Resultatet av gjennomgangen og begrunnelsen.',
    heading: 'Vi kan ikke publisere annonsen',
    body: (title: string, ref: string) =>
      `Vi beklager: etter gjennomgang har teamet vårt ikke godkjent annonsen din «${title}» (#${ref}). Begrunnelsen:`,
    refund: 'Hvis du allerede har betalt for annonsen, kontakter vi deg separat om tilbakebetalingen.',
    after: 'Har du et spørsmål, eller tror du det har oppstått en misforståelse, kan du bare svare på denne e-posten.',
  },

  invoiceIssued: {
    subject: (number: string) => `Faktura ${number}`,
    preheader: 'Fakturaen er klar; du kan se eller laste den ned via lenken.',
    heading: 'Fakturaen din er klar',
    body: (title: string, ref: string, number: string) =>
      `Faktura ${number} for annonsen din «${title}» (#${ref}) er klar.`,
    cta: 'Se faktura',
  },

  creditNoteIssued: {
    subject: (number: string) => `Kreditnota ${number}`,
    preheader: 'Vi har utstedt en kreditnota for den tidligere fakturaen din.',
    heading: 'Kreditnotaen er klar',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Vi har utstedt kreditnota ${number} mot faktura ${correctsNumber} for annonsen din «${title}» (#${ref}).`,
    cta: 'Se kreditnota',
  },

  serviceRequested: {
    subject: 'Vi har mottatt forespørselen din | FINDDOME',
    preheader: 'Noen i teamet vårt kontakter deg for å avtale en dato.',
    heading: 'Vi har mottatt forespørselen din',
    body: (service: string, price: string) => `Takk, vi har notert forespørselen din: ${service} (${price}).`,
    next: 'Noen i teamet vårt kontakter deg for å avtale en dato.',
    payment: 'Vi forteller deg om betalingen når vi avtaler datoen. Du betaler ingenting nå.',
    cancel: 'Ombestemt deg? Bare svar på denne e-posten.',
  },

  valuationPaid: {
    subject: 'Betalingsbekreftelse | FINDDOME-verdivurdering',
    preheader: 'Takk, betalingen din har kommet.',
    heading: 'Takk, betalingen din har kommet',
    body: (service: string) => `Vi har mottatt betalingen for «${service}».`,
    orderTitle: 'Post',
    totalLabel: 'Betalt beløp',
    paidAtLabel: 'Betalt den',
    next: 'Noen i teamet vårt kontakter deg snart om de neste stegene.',
    invoice: 'Trenger du en faktura? Bare svar på denne e-posten.',
  },

  judicialRequested: {
    subject: 'Forespørsel om offisiell verdivurdering | FINDDOME',
    preheader: 'Noen i teamet vårt kontakter deg om mulighetene.',
    heading: 'Vi har mottatt forespørselen din',
    body: 'Takk, vi har notert at du ønsker en offisiell (rettsoppnevnt) verdivurdering av en sakkyndig. Dette er ikke det samme som den veiledende, markedsbaserte verdivurderingen på nettstedet vårt: den utføres av en autorisert sakkyndig, på grunnlag av et tilbud.',
    next: 'Noen i teamet vårt kontakter deg om mulighetene og tilbudet.',
  },
} satisfies PublicEmailCopy;
