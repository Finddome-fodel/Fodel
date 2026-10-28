/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Swedish never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const SV = {
  common: {
    greeting: (name: string) => `Hej ${name},`,
    greetingNoName: 'Hej annonsör,',
    signOff: 'Med vänliga hälsningar\nFINDDOME Fastigheter',
    questions: 'Har du en fråga kan du bara svara på det här mejlet.',
    linkFallback: 'Om knappen inte fungerar, kopiera den här adressen till webbläsaren:',
  },

  registrationConfirm: {
    subject: 'Välj ditt lösenord | FINDDOME',
    preheader: 'Ett klick, så kan du sätta ihop din annons.',
    heading: 'Välj ditt lösenord',
    intro: 'Tack för din registrering. Ditt konto är nästan klart; bara lösenordet saknas.',
    cta: 'Välj lösenord',
    next: 'Sedan kan du fortsätta direkt med din annons: paket, uppgifter, foton. Vi tittar på den först när du har skickat in den.',
    expiry: 'Länken gäller i 7 dagar. Om det inte var du som registrerade dig kan du bortse från det här mejlet: inget konto skapas.',
  },

  accountExists: {
    subject: 'Du har redan ett FINDDOME-konto',
    preheader: 'Logga in eller välj ett nytt lösenord.',
    heading: 'Den här adressen har redan ett konto',
    body: 'Någon försökte nyss registrera sig på FINDDOME:s webbplats med den här e-postadressen. Det finns redan ett konto för den, så vi har inte skapat något nytt.',
    cta: 'Logga in',
    reset: 'Glömt lösenordet? Begär ett nytt',
    ignore: 'Om det inte var du behöver du inte göra något: ditt konto är oförändrat.',
  },

  invite: {
    subject: 'Inbjudan till FINDDOME-portalen',
    preheader: 'Välj ditt lösenord och logga in i annonsörsportalen.',
    heading: 'Du har bjudits in till FINDDOME-portalen',
    body: (role: string) =>
      `FINDDOME bjuder in dig till portalen ${role}, där du hanterar bostadsannonser.`,
    roleAdmin: 'som administratör',
    roleOwner: 'som annonsör',
    cta: 'Acceptera inbjudan',
    expiry: 'Länken gäller i 7 dagar och kan användas en gång.',
  },

  welcome: {
    subject: 'Välkommen till FINDDOME-portalen',
    preheader: 'Ditt konto är aktivt. Så här lägger du in din första annons.',
    heading: (name: string) => `Välkommen, ${name}`,
    body: 'Ditt konto är aktivt. I portalen sätter du ihop annonsen, laddar upp bilder och följer granskningen.',
    stepsTitle: 'Det här behöver du',
    steps: [
      'Bilder på bostaden: minst en, men ju fler desto bättre',
      'Grunduppgifterna: boarea, tomtstorlek, begärt pris',
      'Några meningar om vad som gör bostaden speciell',
    ],
    cta: 'Till portalen',
  },

  submissionReceived: {
    subject: (ref: string) => `Vi har tagit emot din annons (#${ref})`,
    preheader: 'Vi granskar den och meddelar dig via mejl.',
    heading: 'Din annons har tagits emot',
    body: (title: string, ref: string) =>
      `Vi har tagit emot din annons ”${title}” (#${ref}). Någon i vårt team granskar den och så snart det finns ett beslut får du besked via mejl.`,
    timing: 'Granskningen tar vanligtvis högst två arbetsdagar.',
    note: 'Under granskningen kan du inte redigera annonsen. Om vi ber om en ändring öppnas den direkt igen.',
  },

  changesRequested: {
    subject: (ref: string) => `Ändring behövs (#${ref})`,
    preheader: 'En liten ändring, sedan kan annonsen publiceras.',
    heading: 'Vi ber dig göra en ändring',
    body: (title: string, ref: string) =>
      `Vårt team har följande kommentar om din annons ”${title}” (#${ref}):`,
    after: 'Annonsen kan redigeras igen. Gör ändringen och skicka in den igen; sedan fortsätter processen som vanligt.',
    cta: 'Redigera annons',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Godkänd (#${ref}): bara betalningen återstår`,
    preheader: 'Din annons är godkänd och publiceras så snart betalningen har kommit in.',
    heading: 'Din annons har godkänts',
    body: (title: string, ref: string) =>
      `Goda nyheter: vi har granskat och godkänt din annons ”${title}” (#${ref}). Bara betalningen återstår. Så snart den har kommit in publiceras annonsen direkt.`,
    orderTitle: 'Kostnad för annonsen',
    discountLabel: 'Värvningsrabatt (10\u00a0%)',
    totalLabel: 'Att betala',
    ctaCard: 'Betala med kort',
    cardNote: 'Betalningen sker i Stripes säkra miljö. FINDDOME ser inte och sparar inte dina kortuppgifter.',
    bankTitle: 'Eller via banköverföring',
    bankNote: (ref: string) =>
      `Ange referensnumret vid överföringen: ${ref}. Så snart den har kommit in publicerar någon i vårt team annonsen.`,
    vatNote: 'Alla belopp inkluderar 21\u00a0% nederländsk moms.',
  },

  approvedPublished: {
    subject: (ref: string) => `Godkänd och publicerad (#${ref})`,
    preheader: 'Din annons är redan publicerad; betala annonsavgiften inom 14 dagar.',
    heading: 'Din annons är nu publicerad',
    body: (title: string, ref: string) => `Vi har godkänt annonsen ”${title}” (#${ref}) och publicerat den direkt.`,
    viewCta: 'Visa annonsen',
    orderTitle: 'Kostnad för annonsen',
    discountLabel: 'Värvningsrabatt (10\u00a0%)',
    totalLabel: 'Att betala',
    dueLabel: 'Betala senast',
    ctaCard: 'Betala med kort',
    cardNote: 'Betalningen sker i Stripes säkra miljö. FINDDOME ser inte och sparar inte dina kortuppgifter.',
    bankTitle: 'Banköverföring',
    bankNote: (ref: string) => `Ange referensnumret vid överföringen: ${ref}.`,
    vatNote: 'Alla belopp inkluderar 21\u00a0% nederländsk moms.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Betalningsbekräftelse (#${ref})`,
    preheader: 'Tack, vi har tagit emot din betalning.',
    heading: 'Tack, din betalning har kommit in',
    body: (title: string, ref: string) =>
      `Vi har tagit emot betalningen för annonsen ”${title}” (#${ref}). Annonsen är publicerad och syns på ${SITE_HOST}.`,
    orderTitle: 'Specifikation',
    discountLabel: 'Värvningsrabatt (10\u00a0%)',
    totalLabel: 'Betalt belopp',
    vatNote: 'Beloppet inkluderar 21\u00a0% nederländsk moms. Fakturan får du i ett separat mejl.',
    paidAtLabel: 'Betalningsdatum',
  },

  published: {
    subject: (ref: string) => `Din annons är publicerad (#${ref})`,
    preheader: `Annonsen syns nu på ${SITE_HOST}.`,
    heading: 'Din annons är publicerad',
    body: (title: string, ref: string) =>
      `Din annons ”${title}” (#${ref}) finns på ${SITE_HOST} och når köpare i åtta länder.`,
    cta: 'Visa annonsen',
    next: 'Så snart någon visar intresse mejlar vi dig deras uppgifter direkt. I portalen ser du alltid status för din annons.',
  },

  newEnquiry: {
    subject: (ref: string) => `Ny förfrågan (#${ref})`,
    preheader: 'Någon är intresserad av din bostad.',
    heading: 'Nytt svar på din annons',
    body: (title: string, ref: string) =>
      `Någon har svarat på din annons ”${title}” (#${ref}):`,
    labels: { name: 'Namn', email: 'E-post', phone: 'Telefon' },
    messageTitle: 'Meddelande',
    advice: 'Hör gärna av dig inom två dagar: ett snabbt svar är den överlägset viktigaste faktorn för om det blir en försäljning.',
  },

  passwordReset: {
    subject: 'Återställ ditt lösenord | FINDDOME-portalen',
    preheader: 'Länken gäller i en timme.',
    heading: 'Återställ ditt lösenord',
    body: 'Vi har fått en begäran om att återställa lösenordet till ditt konto i FINDDOME-portalen. Klicka på knappen nedan för att välja ett nytt.',
    cta: 'Välj ett nytt lösenord',
    expiry: 'Länken gäller i en timme och kan användas en gång.',
    ignore: 'Om du inte har bett om detta kan du ignorera mejlet. Ditt lösenord förblir oförändrat och ingenting händer.',
  },

  referralRegistered: {
    subject: 'Vi har tagit emot din rekommendation | FINDDOME',
    preheader: 'Någon i vårt team kontaktar snart personen du rekommenderade.',
    heading: 'Tack för rekommendationen',
    body: (referredName: string) =>
      `Vi har tagit emot uppgifterna om ${referredName}. Någon i vårt team kontaktar personen, och när annonsen har lagts in får du 10\u00a0% rabatt på kostnaden för din nästa annons.`,
    note: 'Rabatten läggs in manuellt, efter att annonsören har betalat. Vi meddelar dig så snart det går.',
  },

  valuationReceived: {
    heading: 'Vi har tagit emot din värderingsförfrågan',
    body: 'Någon i vårt team kontrollerar uppgifterna om bostaden och dataunderlaget och mejlar dig sedan den vägledande, marknadsbaserade värderingen.',
  },

  valuationReady: {
    subject: 'Din värdering är klar | FINDDOME',
    preheader: 'Vi har gjort en vägledande uppskattning av din bostad.',
    heading: 'Din värdering är klar',
    body: (range: string) =>
      `Utifrån de lämnade uppgifterna och jämförbara bostäder är vår vägledande uppskattning: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Uppskattningen är vägledande, ingen värderingsrapport, och ersätter inte en officiell värdering. Antal jämförbara bostäder: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Uppskattningen är vägledande, ingen värderingsrapport, och ersätter inte en officiell värdering.',
    cta: 'Annonsera nu',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Utifrån de lämnade uppgifterna är det vägledande marknadsvärdet: ${range}.`,
    mid: 'Mittvärde',
    basis: 'Dataunderlag',
    rateDate: 'Växelkursdatum',
    source: 'Källa',
    factorsHeading: 'Faktorer',
    dirPlus: 'Höjer värdet',
    dirMinus: 'Sänker värdet',
    dirUnsure: 'Osäkert',
    visit: 'Be om ett besök av Gábor',
    judicial: 'Begär en officiell värdering',
  },

  valuationDeclined: {
    subject: 'Din värderingsförfrågan | FINDDOME',
    preheader: 'Någon i vårt team kontaktar dig personligen.',
    heading: 'Tack för din förfrågan',
    body: 'Utifrån de lämnade uppgifterna har vi för närvarande för få jämförbara bostäder för en tillförlitlig uppskattning. Någon i vårt team kontaktar dig personligen.',
  },

  valuationNeedsInfo: {
    subject: 'Värdering: vi behöver några fler uppgifter',
    preheader: 'Vi behöver lite mer information för uppskattningen.',
    heading: 'Vi behöver några fler uppgifter',
    body: 'Tack för din värderingsförfrågan. För uppskattningen ber någon i vårt team dig om följande:',
    after: 'Svara på det här mejlet med de uppgifter som saknas. Så snart vi har dem gör vi uppskattningen.',
  },

  rejected: {
    subject: (ref: string) => `Din annons kan inte publiceras (#${ref})`,
    preheader: 'Resultatet av granskningen och förklaringen.',
    heading: 'Vi kan inte publicera annonsen',
    body: (title: string, ref: string) =>
      `Vi beklagar: efter granskning har vårt team inte godkänt din annons ”${title}” (#${ref}). Förklaringen:`,
    refund: 'Om du redan har betalat för annonsen kontaktar vi dig separat om återbetalningen.',
    after: 'Har du en fråga eller tror du att det har blivit ett missförstånd kan du bara svara på det här mejlet.',
  },

  invoiceIssued: {
    subject: (number: string) => `Faktura ${number}`,
    preheader: 'Fakturan är klar; du kan visa eller ladda ner den via länken.',
    heading: 'Din faktura är klar',
    body: (title: string, ref: string, number: string) =>
      `Faktura ${number} för din annons ”${title}” (#${ref}) är klar.`,
    cta: 'Visa faktura',
  },

  creditNoteIssued: {
    subject: (number: string) => `Kreditnota ${number}`,
    preheader: 'Vi har utfärdat en kreditnota för din tidigare faktura.',
    heading: 'Kreditnotan är klar',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Vi har utfärdat kreditnota ${number} mot faktura ${correctsNumber} för din annons ”${title}” (#${ref}).`,
    cta: 'Visa kreditnota',
  },

  serviceRequested: {
    subject: 'Vi har tagit emot din förfrågan | FINDDOME',
    preheader: 'Någon i vårt team kontaktar dig för att boka ett datum.',
    heading: 'Vi har tagit emot din förfrågan',
    body: (service: string, price: string) => `Tack, vi har noterat din förfrågan: ${service} (${price}).`,
    next: 'Någon i vårt team kontaktar dig för att boka ett datum.',
    payment: 'Vi berättar om betalningen när vi bokar datumet. Du betalar ingenting nu.',
    cancel: 'Ångrat dig? Svara bara på det här mejlet.',
  },

  valuationPaid: {
    subject: 'Betalningsbekräftelse | FINDDOME-värdering',
    preheader: 'Tack, din betalning har kommit in.',
    heading: 'Tack, din betalning har kommit in',
    body: (service: string) => `Vi har tagit emot betalningen för ”${service}”.`,
    orderTitle: 'Post',
    totalLabel: 'Betalt belopp',
    paidAtLabel: 'Betald den',
    next: 'Någon i vårt team kontaktar dig snart om nästa steg.',
    invoice: 'Behöver du en faktura? Svara bara på det här mejlet.',
  },

  judicialRequested: {
    subject: 'Förfrågan om officiell värdering | FINDDOME',
    preheader: 'Någon i vårt team kontaktar dig om alternativen.',
    heading: 'Vi har tagit emot din förfrågan',
    body: 'Tack, vi har noterat att du vill ha en officiell (domstolsförordnad) värdering av en expert. Det är inte samma sak som den vägledande, marknadsbaserade värderingen på vår webbplats: den utförs av en auktoriserad expert, utifrån en offert.',
    next: 'Någon i vårt team kontaktar dig om alternativen och offerten.',
  },
} satisfies PublicEmailCopy;
