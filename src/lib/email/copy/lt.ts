/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Lithuanian never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const LT = {
  common: {
    greeting: (name: string) => `Laba diena, ${name},`,
    greetingNoName: 'Gerbiamas skelbėjau,',
    signOff: 'Pagarbiai\nFODEL Nekilnojamasis turtas',
    questions: 'Jei turite klausimų, tiesiog atsakykite į šį laišką.',
    linkFallback: 'Jei mygtukas neveikia, nukopijuokite šį adresą į naršyklę:',
  },

  registrationConfirm: {
    subject: 'Nustatykite slaptažodį | FODEL',
    preheader: 'Vienas paspaudimas – ir galite parengti savo skelbimą.',
    heading: 'Nustatykite slaptažodį',
    intro: 'Dėkojame, kad užsiregistravote. Jūsų paskyra beveik paruošta – trūksta tik slaptažodžio.',
    cta: 'Nustatyti slaptažodį',
    next: 'Tada galite iškart tęsti skelbimo rengimą: paketas, duomenys, nuotraukos. Peržiūrime jį tik tada, kai jį pateikiate.',
    expiry: 'Nuoroda galioja 7 dienas. Jei registravotės ne jūs, šį laišką galite ignoruoti: paskyra nebus sukurta.',
  },

  accountExists: {
    subject: 'Jau turite FODEL paskyrą',
    preheader: 'Prisijunkite arba nustatykite naują slaptažodį.',
    heading: 'Šiuo adresu paskyra jau yra',
    body: 'Kažkas ką tik bandė užsiregistruoti FODEL svetainėje šiuo el. pašto adresu. Jam paskyra jau yra, todėl naujos nesukūrėme.',
    cta: 'Prisijungti',
    reset: 'Pamiršote slaptažodį? Paprašykite naujo',
    ignore: 'Jei tai buvote ne jūs, nieko daryti nereikia: jūsų paskyra nepakito.',
  },

  invite: {
    subject: 'Kvietimas į FODEL portalą',
    preheader: 'Nustatykite slaptažodį ir prisijunkite prie skelbėjų portalo.',
    heading: 'Esate pakviesti į FODEL portalą',
    body: (role: string) =>
      `FODEL kviečia jus prisijungti prie portalo ${role}, kuriame tvarkote nekilnojamojo turto skelbimus.`,
    roleAdmin: 'kaip administratorius',
    roleOwner: 'kaip skelbėjas',
    cta: 'Priimti kvietimą',
    expiry: 'Nuoroda galioja 7 dienas ir gali būti panaudota vieną kartą.',
  },

  welcome: {
    subject: 'Sveiki atvykę į FODEL portalą',
    preheader: 'Jūsų paskyra aktyvi. Štai kaip pateikti pirmąjį skelbimą.',
    heading: (name: string) => `Sveiki, ${name}`,
    body: 'Jūsų paskyra aktyvi. Portale sudarote skelbimą, įkeliate nuotraukas ir stebite peržiūrą.',
    stepsTitle: 'Ko jums reikės',
    steps: [
      'Objekto nuotraukos: bent viena, bet kuo daugiau, tuo geriau',
      'Pagrindiniai duomenys: plotas, sklypo dydis, prašoma kaina',
      'Keli sakiniai apie tai, kuo objektas ypatingas',
    ],
    cta: 'Eiti į portalą',
  },

  submissionReceived: {
    subject: (ref: string) => `Gavome jūsų skelbimą (#${ref})`,
    preheader: 'Peržiūrėsime jį ir pranešime jums el. paštu.',
    heading: 'Jūsų skelbimas gautas',
    body: (title: string, ref: string) =>
      `Gavome jūsų skelbimą „${title}“ (#${ref}). Vienas iš mūsų komandos narių jį peržiūrės, o kai tik bus priimtas sprendimas, gausite el. laišką.`,
    timing: 'Peržiūra paprastai trunka ne ilgiau kaip dvi darbo dienas.',
    note: 'Peržiūros metu skelbimo redaguoti negalite. Jei paprašysime pakeitimo, jis iškart vėl atsidarys.',
  },

  changesRequested: {
    subject: (ref: string) => `Reikia pakeitimo (#${ref})`,
    preheader: 'Vienas nedidelis pakeitimas ir skelbimą galima paskelbti.',
    heading: 'Prašome atlikti pakeitimą',
    body: (title: string, ref: string) =>
      `Mūsų komanda turi tokią pastabą dėl jūsų skelbimo „${title}“ (#${ref}):`,
    after: 'Skelbimą vėl galima redaguoti. Atlikite pakeitimą ir pateikite jį iš naujo; procesas tiesiog tęsis.',
    cta: 'Redaguoti skelbimą',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Patvirtinta (#${ref}): liko tik apmokėti`,
    preheader: 'Jūsų skelbimas patvirtintas ir bus paskelbtas, kai tik gausime mokėjimą.',
    heading: 'Jūsų skelbimas patvirtintas',
    body: (title: string, ref: string) =>
      `Geros naujienos: peržiūrėjome ir patvirtinome jūsų skelbimą „${title}“ (#${ref}). Liko tik apmokėti. Kai tik gausime mokėjimą, skelbimas iškart bus paskelbtas.`,
    orderTitle: 'Skelbimo kaina',
    discountLabel: 'Rekomendacijos nuolaida (10\u00a0%)',
    totalLabel: 'Mokėti',
    ctaCard: 'Mokėti kortele',
    cardNote: 'Mokėjimas atliekamas saugioje „Stripe“ aplinkoje. FODEL nemato ir nesaugo jūsų kortelės duomenų.',
    bankTitle: 'Arba banko pavedimu',
    bankNote: (ref: string) =>
      `Pavedime nurodykite nuorodos numerį: ${ref}. Kai tik mokėjimas bus gautas, vienas iš mūsų komandos narių paskelbs skelbimą.`,
    vatNote: 'Visos sumos nurodytos su 21\u00a0% Nyderlandų PVM.',
  },

  approvedPublished: {
    subject: (ref: string) => `Patvirtinta ir paskelbta (#${ref})`,
    preheader: 'Jūsų skelbimas jau paskelbtas; skelbimo mokestį sumokėkite per 14 dienų.',
    heading: 'Jūsų skelbimas dabar paskelbtas',
    body: (title: string, ref: string) => `Patvirtinome skelbimą „${title}“ (#${ref}) ir iškart jį paskelbėme.`,
    viewCta: 'Peržiūrėti skelbimą',
    orderTitle: 'Skelbimo kaina',
    discountLabel: 'Rekomendacijos nuolaida (10\u00a0%)',
    totalLabel: 'Mokėti',
    dueLabel: 'Sumokėti iki',
    ctaCard: 'Mokėti kortele',
    cardNote: 'Mokėjimas atliekamas saugioje „Stripe“ aplinkoje. FODEL nemato ir nesaugo jūsų kortelės duomenų.',
    bankTitle: 'Banko pavedimas',
    bankNote: (ref: string) => `Pavedime nurodykite nuorodos numerį: ${ref}.`,
    vatNote: 'Visos sumos nurodytos su 21\u00a0% Nyderlandų PVM.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Mokėjimo patvirtinimas (#${ref})`,
    preheader: 'Dėkojame, gavome jūsų mokėjimą.',
    heading: 'Dėkojame, jūsų mokėjimas gautas',
    body: (title: string, ref: string) =>
      `Gavome mokėjimą už skelbimą „${title}“ (#${ref}). Skelbimas paskelbtas ir matomas ${SITE_HOST}.`,
    orderTitle: 'Išklotinė',
    discountLabel: 'Rekomendacijos nuolaida (10\u00a0%)',
    totalLabel: 'Sumokėta suma',
    vatNote: 'Į sumą įskaičiuotas 21\u00a0% Nyderlandų PVM. Sąskaitą faktūrą gausite atskiru laišku.',
    paidAtLabel: 'Mokėjimo data',
  },

  published: {
    subject: (ref: string) => `Jūsų skelbimas paskelbtas (#${ref})`,
    preheader: `Skelbimas dabar matomas ${SITE_HOST}.`,
    heading: 'Jūsų skelbimas paskelbtas',
    body: (title: string, ref: string) =>
      `Jūsų skelbimas „${title}“ (#${ref}) yra ${SITE_HOST} ir pasiekia pirkėjus aštuoniose šalyse.`,
    cta: 'Peržiūrėti skelbimą',
    next: 'Kai tik kas nors susidomi, iškart el. paštu atsiunčiame jums jo duomenis. Portale visada matote savo skelbimo būseną.',
  },

  newEnquiry: {
    subject: (ref: string) => `Nauja užklausa (#${ref})`,
    preheader: 'Kažkas domisi jūsų objektu.',
    heading: 'Naujas atsiliepimas į jūsų skelbimą',
    body: (title: string, ref: string) =>
      `Kažkas atsiliepė į jūsų skelbimą „${title}“ (#${ref}):`,
    labels: { name: 'Vardas', email: 'El. paštas', phone: 'Telefonas' },
    messageTitle: 'Žinutė',
    advice: 'Jei galite, susisiekite per dvi dienas: greitas atsakymas yra pats svarbiausias veiksnys, ar pardavimas įvyks.',
  },

  passwordReset: {
    subject: 'Atkurkite slaptažodį | FODEL portalas',
    preheader: 'Nuoroda galioja vieną valandą.',
    heading: 'Atkurkite slaptažodį',
    body: 'Gavome prašymą atkurti jūsų FODEL portalo paskyros slaptažodį. Spustelėkite toliau esantį mygtuką ir nustatykite naują.',
    cta: 'Nustatyti naują slaptažodį',
    expiry: 'Nuoroda galioja vieną valandą ir gali būti panaudota vieną kartą.',
    ignore: 'Jei to neprašėte, nekreipkite dėmesio į šį laišką. Jūsų slaptažodis nepasikeis ir nieko neįvyks.',
  },

  referralRegistered: {
    subject: 'Gavome jūsų rekomendaciją | FODEL',
    preheader: 'Netrukus vienas iš mūsų komandos narių susisieks su jūsų rekomenduotu asmeniu.',
    heading: 'Dėkojame už rekomendaciją',
    body: (referredName: string) =>
      `Gavome asmens ${referredName} duomenis. Vienas iš mūsų komandos narių su juo susisieks, o kai skelbimas bus pateiktas, suteiksime jums 10\u00a0% nuolaidą kitam skelbimui.`,
    note: 'Nuolaida pritaikoma rankiniu būdu, skelbėjui sumokėjus. Pranešime jums, kai tik tai bus galima.',
  },

  valuationReceived: {
    heading: 'Gavome jūsų vertinimo užklausą',
    body: 'Vienas iš mūsų komandos narių patikrina objekto duomenis ir duomenų bazę, tada el. paštu atsiunčia orientacinį rinka pagrįstą įvertinimą.',
  },

  valuationReady: {
    subject: 'Jūsų įvertinimas paruoštas | FODEL',
    preheader: 'Parengėme orientacinį jūsų objekto įvertinimą.',
    heading: 'Jūsų įvertinimas paruoštas',
    body: (range: string) =>
      `Remiantis pateiktais duomenimis ir panašiais objektais, mūsų orientacinis įvertinimas: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Šis įvertinimas yra orientacinis, tai nėra vertinimo ataskaita ir jis nepakeičia oficialaus vertinimo. Panašių objektų skaičius: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Šis įvertinimas yra orientacinis, tai nėra vertinimo ataskaita ir jis nepakeičia oficialaus vertinimo.',
    cta: 'Skelbti dabar',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Remiantis pateiktais duomenimis, orientacinė rinkos vertė: ${range}.`,
    mid: 'Vidutinė vertė',
    basis: 'Duomenų bazė',
    rateDate: 'Valiutos kurso data',
    source: 'Šaltinis',
    factorsHeading: 'Veiksniai',
    dirPlus: 'Didina vertę',
    dirMinus: 'Mažina vertę',
    dirUnsure: 'Neaišku',
    visit: 'Pakviesti Gáborą apsilankyti',
    judicial: 'Užsakyti oficialų vertinimą',
  },

  valuationDeclined: {
    subject: 'Jūsų vertinimo užklausa | FODEL',
    preheader: 'Vienas iš mūsų komandos narių susisieks su jumis asmeniškai.',
    heading: 'Dėkojame už jūsų užklausą',
    body: 'Remiantis pateiktais duomenimis, šiuo metu turime per mažai panašių objektų patikimam įvertinimui. Vienas iš mūsų komandos narių susisieks su jumis asmeniškai.',
  },

  valuationNeedsInfo: {
    subject: 'Vertinimas: mums reikia dar kelių duomenų',
    preheader: 'Įvertinimui mums reikia šiek tiek daugiau informacijos.',
    heading: 'Mums reikia dar kelių duomenų',
    body: 'Dėkojame už vertinimo užklausą. Įvertinimui vienas iš mūsų komandos narių prašo jūsų:',
    after: 'Atsakykite į šį laišką pateikdami trūkstamus duomenis. Kai tik juos gausime, parengsime įvertinimą.',
  },

  rejected: {
    subject: (ref: string) => `Jūsų skelbimo negalima paskelbti (#${ref})`,
    preheader: 'Peržiūros rezultatas ir paaiškinimas.',
    heading: 'Negalime paskelbti skelbimo',
    body: (title: string, ref: string) =>
      `Atsiprašome: po peržiūros mūsų komanda nepatvirtino jūsų skelbimo „${title}“ (#${ref}). Paaiškinimas:`,
    refund: 'Jei už skelbimą jau sumokėjote, dėl pinigų grąžinimo susisieksime su jumis atskirai.',
    after: 'Jei turite klausimų ar manote, kad įvyko nesusipratimas, tiesiog atsakykite į šį laišką.',
  },

  invoiceIssued: {
    subject: (number: string) => `Sąskaita faktūra ${number}`,
    preheader: 'Sąskaita faktūra paruošta; ją galite peržiūrėti arba atsisiųsti per nuorodą.',
    heading: 'Jūsų sąskaita faktūra paruošta',
    body: (title: string, ref: string, number: string) =>
      `Sąskaita faktūra ${number} už jūsų skelbimą „${title}“ (#${ref}) paruošta.`,
    cta: 'Peržiūrėti sąskaitą',
  },

  creditNoteIssued: {
    subject: (number: string) => `Kreditinė sąskaita ${number}`,
    preheader: 'Išrašėme kreditinę sąskaitą jūsų ankstesnei sąskaitai.',
    heading: 'Kreditinė sąskaita paruošta',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Išrašėme kreditinę sąskaitą ${number} sąskaitai ${correctsNumber} už jūsų skelbimą „${title}“ (#${ref}).`,
    cta: 'Peržiūrėti kreditinę sąskaitą',
  },

  serviceRequested: {
    subject: 'Gavome jūsų užklausą | FODEL',
    preheader: 'Vienas iš mūsų komandos narių susisieks su jumis dėl datos.',
    heading: 'Gavome jūsų užklausą',
    body: (service: string, price: string) => `Dėkojame, užregistravome jūsų užklausą: ${service} (${price}).`,
    next: 'Vienas iš mūsų komandos narių susisieks su jumis dėl datos.',
    payment: 'Apie mokėjimą pranešime, kai susitarsime dėl datos. Dabar nieko nemokate.',
    cancel: 'Persigalvojote? Tiesiog atsakykite į šį laišką.',
  },

  valuationPaid: {
    subject: 'Mokėjimo patvirtinimas | FODEL vertinimas',
    preheader: 'Dėkojame, jūsų mokėjimas gautas.',
    heading: 'Dėkojame, jūsų mokėjimas gautas',
    body: (service: string) => `Gavome mokėjimą už „${service}“.`,
    orderTitle: 'Prekė',
    totalLabel: 'Sumokėta suma',
    paidAtLabel: 'Sumokėta',
    next: 'Netrukus vienas iš mūsų komandos narių susisieks su jumis dėl tolesnių veiksmų.',
    invoice: 'Reikia sąskaitos faktūros? Tiesiog atsakykite į šį laišką.',
  },

  judicialRequested: {
    subject: 'Oficialaus vertinimo užklausa | FODEL',
    preheader: 'Vienas iš mūsų komandos narių susisieks su jumis dėl galimybių.',
    heading: 'Gavome jūsų užklausą',
    body: 'Dėkojame, pažymėjome, kad norite oficialaus (teismo paskirto) eksperto vertinimo. Tai nėra tas pats, kas orientacinis rinka pagrįstas įvertinimas mūsų svetainėje: jį atlieka įgaliotas ekspertas pagal kainos pasiūlymą.',
    next: 'Vienas iš mūsų komandos narių susisieks su jumis dėl galimybių ir kainos pasiūlymo.',
  },
} satisfies PublicEmailCopy;
