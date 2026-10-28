/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Danish never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const DA = {
  common: {
    greeting: (name: string) => `Kære ${name},`,
    greetingNoName: 'Kære annoncør,',
    signOff: 'Med venlig hilsen\nFINDDOME Ejendomme',
    questions: 'Har du et spørgsmål, kan du bare svare på denne e-mail.',
    linkFallback: 'Hvis knappen ikke virker, så kopiér denne adresse ind i din browser:',
  },

  registrationConfirm: {
    subject: 'Vælg din adgangskode | FINDDOME',
    preheader: 'Ét klik, så kan du sammensætte din annonce.',
    heading: 'Vælg din adgangskode',
    intro: 'Tak for din tilmelding. Din konto er næsten klar; kun adgangskoden mangler.',
    cta: 'Vælg adgangskode',
    next: 'Derefter kan du gå direkte videre med din annonce: pakke, oplysninger, fotos. Vi ser først på den, når du har indsendt den.',
    expiry: 'Linket er gyldigt i 7 dage. Hvis det ikke var dig, der tilmeldte dig, kan du se bort fra denne e-mail: der oprettes ingen konto.',
  },

  accountExists: {
    subject: 'Du har allerede en FINDDOME-konto',
    preheader: 'Log ind, eller vælg en ny adgangskode.',
    heading: 'Denne adresse har allerede en konto',
    body: 'Nogen har netop forsøgt at tilmelde sig på FINDDOME’s websted med denne e-mailadresse. Der findes allerede en konto til den, så vi har ikke oprettet en ny.',
    cta: 'Log ind',
    reset: 'Glemt din adgangskode? Bestil en ny',
    ignore: 'Hvis det ikke var dig, skal du ikke gøre noget: din konto er uændret.',
  },

  invite: {
    subject: 'Invitation til FINDDOME-portalen',
    preheader: 'Vælg din adgangskode, og log ind på annoncørportalen.',
    heading: 'Du er inviteret til FINDDOME-portalen',
    body: (role: string) =>
      `FINDDOME inviterer dig til portalen ${role}, hvor du administrerer boligannoncer.`,
    roleAdmin: 'som administrator',
    roleOwner: 'som annoncør',
    cta: 'Accepter invitationen',
    expiry: 'Linket er gyldigt i 7 dage og kan bruges én gang.',
  },

  welcome: {
    subject: 'Velkommen til FINDDOME-portalen',
    preheader: 'Din konto er aktiv. Sådan indrykker du din første annonce.',
    heading: (name: string) => `Velkommen, ${name}`,
    body: 'Din konto er aktiv. I portalen sammensætter du annoncen, uploader billeder og følger gennemgangen.',
    stepsTitle: 'Det skal du bruge',
    steps: [
      'Billeder af ejendommen: mindst ét, men jo flere, jo bedre',
      'De grundlæggende oplysninger: boligareal, grundstørrelse, udbudspris',
      'Et par sætninger om, hvad der gør ejendommen speciel',
    ],
    cta: 'Gå til portalen',
  },

  submissionReceived: {
    subject: (ref: string) => `Vi har modtaget din annonce (#${ref})`,
    preheader: 'Vi gennemgår den og giver dig besked på e-mail.',
    heading: 'Din annonce er modtaget',
    body: (title: string, ref: string) =>
      `Vi har modtaget din annonce ”${title}” (#${ref}). En fra vores team gennemgår den, og så snart der er en afgørelse, hører du fra os på e-mail.`,
    timing: 'Gennemgangen tager normalt højst to arbejdsdage.',
    note: 'Under gennemgangen kan du ikke redigere annoncen. Hvis vi beder om en ændring, åbnes den straks igen.',
  },

  changesRequested: {
    subject: (ref: string) => `Ændring nødvendig (#${ref})`,
    preheader: 'Én lille ændring, så kan annoncen gå online.',
    heading: 'Vi beder dig foretage en ændring',
    body: (title: string, ref: string) =>
      `Vores team har følgende kommentar til din annonce ”${title}” (#${ref}):`,
    after: 'Annoncen kan redigeres igen. Foretag ændringen, og indsend den igen; så fortsætter processen bare.',
    cta: 'Rediger annonce',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Godkendt (#${ref}): kun betalingen mangler`,
    preheader: 'Din annonce er godkendt og går online, så snart betalingen er modtaget.',
    heading: 'Din annonce er godkendt',
    body: (title: string, ref: string) =>
      `Gode nyheder: vi har gennemgået og godkendt din annonce ”${title}” (#${ref}). Kun betalingen mangler. Så snart den er modtaget, går annoncen straks online.`,
    orderTitle: 'Pris for annoncen',
    discountLabel: 'Henvisningsrabat (10\u00a0%)',
    totalLabel: 'At betale',
    ctaCard: 'Betal med kort',
    cardNote: 'Betalingen sker i Stripes sikre miljø. FINDDOME ser ikke og gemmer ikke dine kortoplysninger.',
    bankTitle: 'Eller via bankoverførsel',
    bankNote: (ref: string) =>
      `Angiv referencenummeret ved overførslen: ${ref}. Så snart den er modtaget, lægger en fra vores team annoncen online.`,
    vatNote: 'Alle beløb er inklusive 21\u00a0% hollandsk moms.',
  },

  approvedPublished: {
    subject: (ref: string) => `Godkendt og online (#${ref})`,
    preheader: 'Din annonce er allerede online; betal venligst annoncegebyret inden for 14 dage.',
    heading: 'Din annonce er nu online',
    body: (title: string, ref: string) => `Vi har godkendt annoncen ”${title}” (#${ref}) og offentliggjort den med det samme.`,
    viewCta: 'Se annoncen',
    orderTitle: 'Pris for annoncen',
    discountLabel: 'Henvisningsrabat (10\u00a0%)',
    totalLabel: 'At betale',
    dueLabel: 'Betales senest',
    ctaCard: 'Betal med kort',
    cardNote: 'Betalingen sker i Stripes sikre miljø. FINDDOME ser ikke og gemmer ikke dine kortoplysninger.',
    bankTitle: 'Bankoverførsel',
    bankNote: (ref: string) => `Angiv referencenummeret ved overførslen: ${ref}.`,
    vatNote: 'Alle beløb er inklusive 21\u00a0% hollandsk moms.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Betalingsbekræftelse (#${ref})`,
    preheader: 'Tak, vi har modtaget din betaling.',
    heading: 'Tak, din betaling er modtaget',
    body: (title: string, ref: string) =>
      `Vi har modtaget betalingen for annoncen ”${title}” (#${ref}). Annoncen er online og synlig på ${SITE_HOST}.`,
    orderTitle: 'Specifikation',
    discountLabel: 'Henvisningsrabat (10\u00a0%)',
    totalLabel: 'Betalt beløb',
    vatNote: 'Beløbet er inklusive 21\u00a0% hollandsk moms. Fakturaen modtager du i en separat e-mail.',
    paidAtLabel: 'Betalingsdato',
  },

  published: {
    subject: (ref: string) => `Din annonce er online (#${ref})`,
    preheader: `Annoncen er nu synlig på ${SITE_HOST}.`,
    heading: 'Din annonce er online',
    body: (title: string, ref: string) =>
      `Din annonce ”${title}” (#${ref}) er på ${SITE_HOST} og når købere i otte lande.`,
    cta: 'Se annoncen',
    next: 'Så snart nogen viser interesse, sender vi dig straks vedkommendes oplysninger på e-mail. I portalen kan du altid se status for din annonce.',
  },

  newEnquiry: {
    subject: (ref: string) => `Ny henvendelse (#${ref})`,
    preheader: 'Nogen er interesseret i din ejendom.',
    heading: 'Ny henvendelse på din annonce',
    body: (title: string, ref: string) =>
      `Nogen har henvendt sig om din annonce ”${title}” (#${ref}):`,
    labels: { name: 'Navn', email: 'E-mail', phone: 'Telefon' },
    messageTitle: 'Besked',
    advice: 'Tag gerne kontakt inden for to dage: et hurtigt svar er langt den vigtigste faktor for, om der bliver et salg.',
  },

  passwordReset: {
    subject: 'Nulstil din adgangskode | FINDDOME-portalen',
    preheader: 'Linket er gyldigt i én time.',
    heading: 'Nulstil din adgangskode',
    body: 'Vi har modtaget en anmodning om at nulstille adgangskoden til din konto på FINDDOME-portalen. Klik på knappen nedenfor for at vælge en ny.',
    cta: 'Vælg en ny adgangskode',
    expiry: 'Linket er gyldigt i én time og kan bruges én gang.',
    ignore: 'Hvis du ikke har bedt om dette, kan du se bort fra denne e-mail. Din adgangskode forbliver uændret, og der sker ingenting.',
  },

  referralRegistered: {
    subject: 'Vi har modtaget din anbefaling | FINDDOME',
    preheader: 'En fra vores team kontakter snart den person, du har anbefalet.',
    heading: 'Tak for anbefalingen',
    body: (referredName: string) =>
      `Vi har modtaget oplysningerne om ${referredName}. En fra vores team kontakter vedkommende, og når annoncen er indrykket, krediterer vi dig 10\u00a0% af prisen for din næste annonce.`,
    note: 'Krediteringen sker manuelt, når annoncøren har betalt. Vi giver dig besked, så snart det kan lade sig gøre.',
  },

  valuationReceived: {
    heading: 'Vi har modtaget din anmodning om vurdering',
    body: 'En fra vores team kontrollerer oplysningerne om ejendommen og datagrundlaget og sender dig derefter den vejledende, markedsbaserede vurdering på e-mail.',
  },

  valuationReady: {
    subject: 'Din vurdering er klar | FINDDOME',
    preheader: 'Vi har lavet et vejledende skøn over din ejendom.',
    heading: 'Din vurdering er klar',
    body: (range: string) =>
      `Ud fra de oplyste data og sammenlignelige ejendomme er vores vejledende skøn: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Skønnet er vejledende, ikke en vurderingsrapport, og erstatter ikke en officiel vurdering. Antal sammenlignelige ejendomme: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Skønnet er vejledende, ikke en vurderingsrapport, og erstatter ikke en officiel vurdering.',
    cta: 'Annoncér nu',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Ud fra de oplyste data er den vejledende markedsværdi: ${range}.`,
    mid: 'Midtpunkt',
    basis: 'Datagrundlag',
    rateDate: 'Valutakursdato',
    source: 'Kilde',
    factorsHeading: 'Faktorer',
    dirPlus: 'Hæver værdien',
    dirMinus: 'Sænker værdien',
    dirUnsure: 'Usikkert',
    visit: 'Bed om et besøg af Gábor',
    judicial: 'Bestil en officiel vurdering',
  },

  valuationDeclined: {
    subject: 'Din anmodning om vurdering | FINDDOME',
    preheader: 'En fra vores team kontakter dig personligt.',
    heading: 'Tak for din henvendelse',
    body: 'Ud fra de oplyste data har vi i øjeblikket for få sammenlignelige ejendomme til et pålideligt skøn. En fra vores team kontakter dig personligt.',
  },

  valuationNeedsInfo: {
    subject: 'Vurdering: vi har brug for nogle flere oplysninger',
    preheader: 'Vi har brug for lidt flere oplysninger til skønnet.',
    heading: 'Vi har brug for nogle flere oplysninger',
    body: 'Tak for din anmodning om vurdering. Til skønnet beder en fra vores team dig om følgende:',
    after: 'Svar på denne e-mail med de manglende oplysninger. Så snart vi har dem, laver vi skønnet.',
  },

  rejected: {
    subject: (ref: string) => `Din annonce kan ikke indrykkes (#${ref})`,
    preheader: 'Resultatet af gennemgangen og begrundelsen.',
    heading: 'Vi kan ikke indrykke annoncen',
    body: (title: string, ref: string) =>
      `Vi beklager: efter gennemgang har vores team ikke godkendt din annonce ”${title}” (#${ref}). Begrundelsen:`,
    refund: 'Hvis du allerede har betalt for annoncen, kontakter vi dig separat om tilbagebetalingen.',
    after: 'Har du et spørgsmål, eller tror du, der er sket en misforståelse, kan du blot svare på denne e-mail.',
  },

  invoiceIssued: {
    subject: (number: string) => `Faktura ${number}`,
    preheader: 'Fakturaen er klar; du kan se eller downloade den via linket.',
    heading: 'Din faktura er klar',
    body: (title: string, ref: string, number: string) =>
      `Faktura ${number} for din annonce ”${title}” (#${ref}) er klar.`,
    cta: 'Se faktura',
  },

  creditNoteIssued: {
    subject: (number: string) => `Kreditnota ${number}`,
    preheader: 'Vi har udstedt en kreditnota for din tidligere faktura.',
    heading: 'Kreditnotaen er klar',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Vi har udstedt kreditnota ${number} for faktura ${correctsNumber} for din annonce ”${title}” (#${ref}).`,
    cta: 'Se kreditnota',
  },

  serviceRequested: {
    subject: 'Vi har modtaget din anmodning | FINDDOME',
    preheader: 'En fra vores team kontakter dig for at aftale en dato.',
    heading: 'Vi har modtaget din anmodning',
    body: (service: string, price: string) => `Tak, vi har noteret din anmodning: ${service} (${price}).`,
    next: 'En fra vores team kontakter dig for at aftale en dato.',
    payment: 'Vi fortæller dig om betalingen, når vi aftaler datoen. Du betaler ikke noget nu.',
    cancel: 'Har du fortrudt? Svar blot på denne e-mail.',
  },

  valuationPaid: {
    subject: 'Betalingsbekræftelse | FINDDOME-vurdering',
    preheader: 'Tak, din betaling er modtaget.',
    heading: 'Tak, din betaling er modtaget',
    body: (service: string) => `Vi har modtaget betalingen for ”${service}”.`,
    orderTitle: 'Post',
    totalLabel: 'Betalt beløb',
    paidAtLabel: 'Betalt den',
    next: 'En fra vores team kontakter dig snart om de næste skridt.',
    invoice: 'Har du brug for en faktura? Svar blot på denne e-mail.',
  },

  judicialRequested: {
    subject: 'Anmodning om officiel vurdering | FINDDOME',
    preheader: 'En fra vores team kontakter dig om mulighederne.',
    heading: 'Vi har modtaget din anmodning',
    body: 'Tak, vi har noteret, at du ønsker en officiel (retsudpeget) vurdering ved en sagkyndig. Det er ikke det samme som den vejledende, markedsbaserede vurdering på vores websted: den udføres af en autoriseret sagkyndig på grundlag af et tilbud.',
    next: 'En fra vores team kontakter dig om mulighederne og tilbuddet.',
  },
} satisfies PublicEmailCopy;
