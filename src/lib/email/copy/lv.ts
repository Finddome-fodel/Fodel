/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Latvian never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const LV = {
  common: {
    greeting: (name: string) => `Labdien, ${name}!`,
    greetingNoName: 'Cienījamais sludinātāj!',
    signOff: 'Ar cieņu\nFODEL Nekustamais īpašums',
    questions: 'Ja jums ir jautājums, vienkārši atbildiet uz šo e-pastu.',
    linkFallback: 'Ja poga nedarbojas, iekopējiet šo adresi pārlūkā:',
  },

  registrationConfirm: {
    subject: 'Iestatiet paroli | FODEL',
    preheader: 'Viens klikšķis, un varat sagatavot savu sludinājumu.',
    heading: 'Iestatiet paroli',
    intro: 'Paldies par reģistrāciju. Jūsu konts ir gandrīz gatavs, trūkst tikai paroles.',
    cta: 'Iestatīt paroli',
    next: 'Pēc tam varat uzreiz turpināt ar sludinājumu: pakete, dati, fotoattēli. Mēs to izskatām tikai pēc tam, kad esat to iesniedzis.',
    expiry: 'Saite ir derīga 7 dienas. Ja nereģistrējāties jūs, varat šo e-pastu ignorēt: konts netiks izveidots.',
  },

  accountExists: {
    subject: 'Jums jau ir FODEL konts',
    preheader: 'Piesakieties vai iestatiet jaunu paroli.',
    heading: 'Šai adresei jau ir konts',
    body: 'Kāds tikko mēģināja reģistrēties FODEL vietnē ar šo e-pasta adresi. Tai jau ir konts, tāpēc jaunu mēs neizveidojām.',
    cta: 'Pieteikties',
    reset: 'Aizmirsāt paroli? Pieprasiet jaunu',
    ignore: 'Ja tas nebijāt jūs, nekas nav jādara: jūsu konts paliek nemainīts.',
  },

  invite: {
    subject: 'Ielūgums uz FODEL portālu',
    preheader: 'Iestatiet paroli un piesakieties sludinātāju portālā.',
    heading: 'Jūs esat uzaicināts uz FODEL portālu',
    body: (role: string) =>
      `FODEL aicina jūs pievienoties portālam ${role}, kur pārvaldāt īpašumu sludinājumus.`,
    roleAdmin: 'kā administrators',
    roleOwner: 'kā sludinātājs',
    cta: 'Pieņemt ielūgumu',
    expiry: 'Saite ir derīga 7 dienas, un to var izmantot vienu reizi.',
  },

  welcome: {
    subject: 'Laipni lūdzam FODEL portālā',
    preheader: 'Jūsu konts ir aktīvs. Lūk, kā ievietot pirmo sludinājumu.',
    heading: (name: string) => `Laipni lūdzam, ${name}`,
    body: 'Jūsu konts ir aktīvs. Portālā jūs sagatavojat sludinājumu, augšupielādējat fotoattēlus un sekojat pārbaudei.',
    stepsTitle: 'Kas jums būs vajadzīgs',
    steps: [
      'Īpašuma fotoattēli: vismaz viens, bet jo vairāk, jo labāk',
      'Pamatdati: platība, zemes gabala lielums, prasītā cena',
      'Daži teikumi par to, kas padara īpašumu īpašu',
    ],
    cta: 'Doties uz portālu',
  },

  submissionReceived: {
    subject: (ref: string) => `Esam saņēmuši jūsu sludinājumu (#${ref})`,
    preheader: 'Mēs to pārbaudīsim un paziņosim jums pa e-pastu.',
    heading: 'Jūsu sludinājums ir saņemts',
    body: (title: string, ref: string) =>
      `Esam saņēmuši jūsu sludinājumu “${title}” (#${ref}). Kāds no mūsu komandas to pārbaudīs, un, tiklīdz būs lēmums, jūs saņemsiet e-pastu.`,
    timing: 'Pārbaude parasti aizņem ne vairāk kā divas darba dienas.',
    note: 'Pārbaudes laikā sludinājumu nevar labot. Ja lūgsim izmaiņas, tas uzreiz tiks atvērts no jauna.',
  },

  changesRequested: {
    subject: (ref: string) => `Nepieciešamas izmaiņas (#${ref})`,
    preheader: 'Viena neliela izmaiņa, un sludinājumu var publicēt.',
    heading: 'Lūdzam jūs veikt izmaiņas',
    body: (title: string, ref: string) =>
      `Mūsu komandai ir šāds komentārs par jūsu sludinājumu “${title}” (#${ref}):`,
    after: 'Sludinājumu atkal var labot. Veiciet izmaiņas un iesniedziet to vēlreiz; process turpināsies kā parasti.',
    cta: 'Labot sludinājumu',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Apstiprināts (#${ref}): atlicis tikai maksājums`,
    preheader: 'Jūsu sludinājums ir apstiprināts un tiks publicēts, tiklīdz saņemsim maksājumu.',
    heading: 'Jūsu sludinājums ir apstiprināts',
    body: (title: string, ref: string) =>
      `Labas ziņas: esam pārbaudījuši un apstiprinājuši jūsu sludinājumu “${title}” (#${ref}). Atlicis tikai maksājums. Tiklīdz to saņemsim, sludinājums uzreiz tiks publicēts.`,
    orderTitle: 'Sludinājuma cena',
    discountLabel: 'Ieteikuma atlaide (10%)',
    totalLabel: 'Jāmaksā',
    ctaCard: 'Maksāt ar karti',
    cardNote: 'Maksājums notiek Stripe drošajā vidē. FODEL neredz un neglabā jūsu kartes datus.',
    bankTitle: 'Vai ar bankas pārskaitījumu',
    bankNote: (ref: string) =>
      `Pārskaitījumā norādiet atsauces numuru: ${ref}. Tiklīdz maksājums būs saņemts, kāds no mūsu komandas publicēs sludinājumu.`,
    vatNote: 'Visās summās ir iekļauts Nīderlandes PVN 21%.',
  },

  approvedPublished: {
    subject: (ref: string) => `Apstiprināts un publicēts (#${ref})`,
    preheader: 'Jūsu sludinājums jau ir publicēts; lūdzu, samaksājiet sludinājuma maksu 14 dienu laikā.',
    heading: 'Jūsu sludinājums tagad ir publicēts',
    body: (title: string, ref: string) => `Esam apstiprinājuši sludinājumu “${title}” (#${ref}) un uzreiz to publicējuši.`,
    viewCta: 'Skatīt sludinājumu',
    orderTitle: 'Sludinājuma cena',
    discountLabel: 'Ieteikuma atlaide (10%)',
    totalLabel: 'Jāmaksā',
    dueLabel: 'Samaksāt līdz',
    ctaCard: 'Maksāt ar karti',
    cardNote: 'Maksājums notiek Stripe drošajā vidē. FODEL neredz un neglabā jūsu kartes datus.',
    bankTitle: 'Bankas pārskaitījums',
    bankNote: (ref: string) => `Pārskaitījumā norādiet atsauces numuru: ${ref}.`,
    vatNote: 'Visās summās ir iekļauts Nīderlandes PVN 21%.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Maksājuma apstiprinājums (#${ref})`,
    preheader: 'Paldies, esam saņēmuši jūsu maksājumu.',
    heading: 'Paldies, jūsu maksājums ir saņemts',
    body: (title: string, ref: string) =>
      `Esam saņēmuši maksājumu par sludinājumu “${title}” (#${ref}). Sludinājums ir publicēts un redzams vietnē ${SITE_HOST}.`,
    orderTitle: 'Sadalījums',
    discountLabel: 'Ieteikuma atlaide (10%)',
    totalLabel: 'Samaksātā summa',
    vatNote: 'Summā ir iekļauts Nīderlandes PVN 21%. Rēķinu saņemsiet atsevišķā e-pastā.',
    paidAtLabel: 'Maksājuma datums',
  },

  published: {
    subject: (ref: string) => `Jūsu sludinājums ir publicēts (#${ref})`,
    preheader: `Sludinājums tagad ir redzams vietnē ${SITE_HOST}.`,
    heading: 'Jūsu sludinājums ir publicēts',
    body: (title: string, ref: string) =>
      `Jūsu sludinājums “${title}” (#${ref}) ir vietnē ${SITE_HOST} un sasniedz pircējus astoņās valstīs.`,
    cta: 'Skatīt sludinājumu',
    next: 'Tiklīdz kāds izrāda interesi, uzreiz nosūtām jums viņa datus pa e-pastu. Portālā vienmēr varat redzēt sava sludinājuma statusu.',
  },

  newEnquiry: {
    subject: (ref: string) => `Jauns pieprasījums (#${ref})`,
    preheader: 'Kāds interesējas par jūsu īpašumu.',
    heading: 'Jauna atbilde uz jūsu sludinājumu',
    body: (title: string, ref: string) =>
      `Kāds ir atbildējis uz jūsu sludinājumu “${title}” (#${ref}):`,
    labels: { name: 'Vārds', email: 'E-pasts', phone: 'Tālrunis' },
    messageTitle: 'Ziņojums',
    advice: 'Ja iespējams, sazinieties divu dienu laikā: ātra atbilde ir daudz svarīgākais faktors, lai darījums notiktu.',
  },

  passwordReset: {
    subject: 'Atiestatiet paroli | FODEL portāls',
    preheader: 'Saite ir derīga vienu stundu.',
    heading: 'Atiestatiet paroli',
    body: 'Esam saņēmuši pieprasījumu atiestatīt jūsu FODEL portāla konta paroli. Noklikšķiniet uz pogas zemāk, lai iestatītu jaunu.',
    cta: 'Iestatīt jaunu paroli',
    expiry: 'Saite ir derīga vienu stundu, un to var izmantot vienu reizi.',
    ignore: 'Ja to nepieprasījāt jūs, ignorējiet šo e-pastu. Jūsu parole paliek nemainīta, un nekas nenotiek.',
  },

  referralRegistered: {
    subject: 'Esam saņēmuši jūsu ieteikumu | FODEL',
    preheader: 'Kāds no mūsu komandas drīz sazināsies ar jūsu ieteikto personu.',
    heading: 'Paldies par ieteikumu',
    body: (referredName: string) =>
      `Esam saņēmuši personas ${referredName} datus. Kāds no mūsu komandas ar viņu sazināsies, un, kad sludinājums būs ievietots, mēs jums piešķirsim 10% atlaidi nākamā sludinājuma cenai.`,
    note: 'Atlaide tiek piemērota manuāli pēc tam, kad sludinātājs ir samaksājis. Mēs jums paziņosim, tiklīdz tas būs iespējams.',
  },

  valuationReceived: {
    heading: 'Esam saņēmuši jūsu novērtējuma pieprasījumu',
    body: 'Kāds no mūsu komandas pārbauda īpašuma datus un datu bāzi un pēc tam nosūta jums pa e-pastu orientējošu, tirgū balstītu novērtējumu.',
  },

  valuationReady: {
    subject: 'Jūsu novērtējums ir gatavs | FODEL',
    preheader: 'Esam sagatavojuši orientējošu jūsu īpašuma novērtējumu.',
    heading: 'Jūsu novērtējums ir gatavs',
    body: (range: string) =>
      `Pamatojoties uz sniegtajiem datiem un salīdzināmiem īpašumiem, mūsu orientējošais novērtējums ir: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Šis novērtējums ir orientējošs, tas nav vērtēšanas ziņojums un neaizstāj oficiālu novērtējumu. Salīdzināmo īpašumu skaits: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Šis novērtējums ir orientējošs, tas nav vērtēšanas ziņojums un neaizstāj oficiālu novērtējumu.',
    cta: 'Ievietot sludinājumu tagad',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Pamatojoties uz sniegtajiem datiem, orientējošā tirgus vērtība ir: ${range}.`,
    mid: 'Vidējā vērtība',
    basis: 'Datu bāze',
    rateDate: 'Valūtas kursa datums',
    source: 'Avots',
    factorsHeading: 'Faktori',
    dirPlus: 'Palielina vērtību',
    dirMinus: 'Samazina vērtību',
    dirUnsure: 'Nav skaidrs',
    visit: 'Pieteikt Gábora apmeklējumu',
    judicial: 'Pieprasīt oficiālu novērtējumu',
  },

  valuationDeclined: {
    subject: 'Jūsu novērtējuma pieprasījums | FODEL',
    preheader: 'Kāds no mūsu komandas sazināsies ar jums personīgi.',
    heading: 'Paldies par jūsu pieprasījumu',
    body: 'Pamatojoties uz sniegtajiem datiem, mums pašlaik ir pārāk maz salīdzināmu īpašumu uzticamam novērtējumam. Kāds no mūsu komandas sazināsies ar jums personīgi.',
  },

  valuationNeedsInfo: {
    subject: 'Novērtējums: mums vajag vēl dažus datus',
    preheader: 'Novērtējumam mums vajag vēl nedaudz informācijas.',
    heading: 'Mums vajag vēl dažus datus',
    body: 'Paldies par jūsu novērtējuma pieprasījumu. Novērtējumam kāds no mūsu komandas lūdz jums šo:',
    after: 'Atbildiet uz šo e-pastu, norādot trūkstošos datus. Tiklīdz tos saņemsim, sagatavosim novērtējumu.',
  },

  rejected: {
    subject: (ref: string) => `Jūsu sludinājumu nevar publicēt (#${ref})`,
    preheader: 'Pārbaudes rezultāts un paskaidrojums.',
    heading: 'Mēs nevaram publicēt sludinājumu',
    body: (title: string, ref: string) =>
      `Mums žēl: pēc pārbaudes mūsu komanda nav apstiprinājusi jūsu sludinājumu “${title}” (#${ref}). Paskaidrojums:`,
    refund: 'Ja jau esat samaksājis par sludinājumu, mēs ar jums atsevišķi sazināsimies par naudas atmaksu.',
    after: 'Ja jums ir jautājums vai šķiet, ka radies pārpratums, vienkārši atbildiet uz šo e-pastu.',
  },

  invoiceIssued: {
    subject: (number: string) => `Rēķins ${number}`,
    preheader: 'Rēķins ir gatavs; to var apskatīt vai lejupielādēt, izmantojot saiti.',
    heading: 'Jūsu rēķins ir gatavs',
    body: (title: string, ref: string, number: string) =>
      `Rēķins ${number} par jūsu sludinājumu “${title}” (#${ref}) ir gatavs.`,
    cta: 'Skatīt rēķinu',
  },

  creditNoteIssued: {
    subject: (number: string) => `Kredītrēķins ${number}`,
    preheader: 'Esam izrakstījuši kredītrēķinu par jūsu iepriekšējo rēķinu.',
    heading: 'Kredītrēķins ir gatavs',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Esam izrakstījuši kredītrēķinu ${number} par rēķinu ${correctsNumber} par jūsu sludinājumu “${title}” (#${ref}).`,
    cta: 'Skatīt kredītrēķinu',
  },

  serviceRequested: {
    subject: 'Esam saņēmuši jūsu pieprasījumu | FODEL',
    preheader: 'Kāds no mūsu komandas sazināsies ar jums, lai vienotos par datumu.',
    heading: 'Esam saņēmuši jūsu pieprasījumu',
    body: (service: string, price: string) => `Paldies, esam reģistrējuši jūsu pieprasījumu: ${service} (${price}).`,
    next: 'Kāds no mūsu komandas sazināsies ar jums, lai vienotos par datumu.',
    payment: 'Par maksājumu informēsim, kad vienosimies par datumu. Tagad jūs neko nemaksājat.',
    cancel: 'Pārdomājāt? Vienkārši atbildiet uz šo e-pastu.',
  },

  valuationPaid: {
    subject: 'Maksājuma apstiprinājums | FODEL novērtējums',
    preheader: 'Paldies, jūsu maksājums ir saņemts.',
    heading: 'Paldies, jūsu maksājums ir saņemts',
    body: (service: string) => `Esam saņēmuši maksājumu par “${service}”.`,
    orderTitle: 'Pozīcija',
    totalLabel: 'Samaksātā summa',
    paidAtLabel: 'Samaksāts',
    next: 'Kāds no mūsu komandas drīz sazināsies ar jums par nākamajiem soļiem.',
    invoice: 'Vajag rēķinu? Vienkārši atbildiet uz šo e-pastu.',
  },

  judicialRequested: {
    subject: 'Oficiāla novērtējuma pieprasījums | FODEL',
    preheader: 'Kāds no mūsu komandas sazināsies ar jums par iespējām.',
    heading: 'Esam saņēmuši jūsu pieprasījumu',
    body: 'Paldies, esam atzīmējuši, ka vēlaties oficiālu (tiesas noteiktu) eksperta novērtējumu. Tas nav tas pats, kas orientējošais, tirgū balstītais novērtējums mūsu vietnē: to veic sertificēts eksperts, pamatojoties uz cenu piedāvājumu.',
    next: 'Kāds no mūsu komandas sazināsies ar jums par iespējām un cenu piedāvājumu.',
  },
} satisfies PublicEmailCopy;
