/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Slovenian never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const SL = {
  common: {
    greeting: (name: string) => `Spoštovani ${name},`,
    greetingNoName: 'Spoštovani oglaševalec,',
    signOff: 'Lep pozdrav,\nFINDDOME Nepremičnine',
    questions: 'Če imate vprašanje, preprosto odgovorite na to sporočilo.',
    linkFallback: 'Če gumb ne deluje, kopirajte ta naslov v brskalnik:',
  },

  registrationConfirm: {
    subject: 'Nastavite geslo | FINDDOME',
    preheader: 'En klik in lahko pripravite svoj oglas.',
    heading: 'Nastavite geslo',
    intro: 'Hvala za registracijo. Vaš račun je skoraj pripravljen; manjka le še geslo.',
    cta: 'Nastavi geslo',
    next: 'Nato lahko takoj nadaljujete z oglasom: paket, podatki, fotografije. Pregledamo ga šele, ko ga oddate.',
    expiry: 'Povezava velja 7 dni. Če se niste registrirali vi, lahko to sporočilo prezrete: račun ne bo ustvarjen.',
  },

  accountExists: {
    subject: 'Pri FINDDOME že imate račun',
    preheader: 'Prijavite se ali nastavite novo geslo.',
    heading: 'Ta naslov že ima račun',
    body: 'Nekdo se je pravkar poskušal registrirati na spletni strani FINDDOME s tem e-poštnim naslovom. Ker zanj račun že obstaja, novega nismo ustvarili.',
    cta: 'Prijava',
    reset: 'Ste pozabili geslo? Zahtevajte novo',
    ignore: 'Če to niste bili vi, vam ni treba storiti ničesar: vaš račun ostane nespremenjen.',
  },

  invite: {
    subject: 'Povabilo na portal FINDDOME',
    preheader: 'Nastavite geslo in se prijavite v portal za oglaševalce.',
    heading: 'Povabljeni ste na portal FINDDOME',
    body: (role: string) =>
      `FINDDOME vas vabi, da se pridružite portalu ${role}, kjer upravljate oglase za nepremičnine.`,
    roleAdmin: 'kot skrbnik',
    roleOwner: 'kot oglaševalec',
    cta: 'Sprejmi povabilo',
    expiry: 'Povezava velja 7 dni in jo je mogoče uporabiti enkrat.',
  },

  welcome: {
    subject: 'Dobrodošli na portalu FINDDOME',
    preheader: 'Vaš račun je aktiven. Tako objavite svoj prvi oglas.',
    heading: (name: string) => `Dobrodošli, ${name}`,
    body: 'Vaš račun je aktiven. Na portalu sestavite oglas, naložite fotografije in spremljate pregled.',
    stepsTitle: 'Kaj boste potrebovali',
    steps: [
      'Fotografije nepremičnine: vsaj ena, a več ko jih je, bolje je',
      'Osnovni podatki: površina, velikost zemljišča, izklicna cena',
      'Nekaj stavkov o tem, kaj naredi nepremičnino posebno',
    ],
    cta: 'Na portal',
  },

  submissionReceived: {
    subject: (ref: string) => `Vaš oglas smo prejeli (#${ref})`,
    preheader: 'Pregledali ga bomo in vas obvestili po e-pošti.',
    heading: 'Vaš oglas je prejet',
    body: (title: string, ref: string) =>
      `Vaš oglas »${title}« (#${ref}) smo prejeli. Član naše ekipe ga bo pregledal in, ko bo odločitev sprejeta, boste prejeli e-poštno sporočilo.`,
    timing: 'Pregled običajno ne traja več kot dva delovna dneva.',
    note: 'Med pregledom oglasa ne morete urejati. Če vas prosimo za spremembo, se takoj znova odpre.',
  },

  changesRequested: {
    subject: (ref: string) => `Potrebna je sprememba (#${ref})`,
    preheader: 'Ena majhna sprememba in oglas je lahko objavljen.',
    heading: 'Prosimo vas za spremembo',
    body: (title: string, ref: string) =>
      `Naša ekipa ima k vašemu oglasu »${title}« (#${ref}) naslednjo pripombo:`,
    after: 'Oglas je znova mogoče urejati. Opravite spremembo in ga znova oddajte; postopek se nato preprosto nadaljuje.',
    cta: 'Uredi oglas',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Odobreno (#${ref}): manjka le še plačilo`,
    preheader: 'Vaš oglas je odobren in bo objavljen, ko prispe plačilo.',
    heading: 'Vaš oglas je odobren',
    body: (title: string, ref: string) =>
      `Dobra novica: vaš oglas »${title}« (#${ref}) smo pregledali in odobrili. Manjka le še plačilo. Ko prispe, bo oglas takoj objavljen.`,
    orderTitle: 'Cena oglasa',
    discountLabel: 'Popust za priporočilo (10\u00a0%)',
    totalLabel: 'Za plačilo',
    ctaCard: 'Plačaj s kartico',
    cardNote: 'Plačilo poteka v varnem okolju Stripe. FINDDOME vaših podatkov o kartici ne vidi in ne shranjuje.',
    bankTitle: 'Ali z bančnim nakazilom',
    bankNote: (ref: string) =>
      `Pri nakazilu navedite referenčno številko: ${ref}. Ko plačilo prispe, član naše ekipe objavi oglas.`,
    vatNote: 'Vsi zneski vključujejo 21-odstotni nizozemski DDV.',
  },

  approvedPublished: {
    subject: (ref: string) => `Odobreno in objavljeno (#${ref})`,
    preheader: 'Vaš oglas je že objavljen; ceno oglasa plačajte v 14 dneh.',
    heading: 'Vaš oglas je zdaj objavljen',
    body: (title: string, ref: string) => `Oglas »${title}« (#${ref}) smo odobrili in ga takoj objavili.`,
    viewCta: 'Ogled oglasa',
    orderTitle: 'Cena oglasa',
    discountLabel: 'Popust za priporočilo (10\u00a0%)',
    totalLabel: 'Za plačilo',
    dueLabel: 'Plačati do',
    ctaCard: 'Plačaj s kartico',
    cardNote: 'Plačilo poteka v varnem okolju Stripe. FINDDOME vaših podatkov o kartici ne vidi in ne shranjuje.',
    bankTitle: 'Bančno nakazilo',
    bankNote: (ref: string) => `Pri nakazilu navedite referenčno številko: ${ref}.`,
    vatNote: 'Vsi zneski vključujejo 21-odstotni nizozemski DDV.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Potrdilo o plačilu (#${ref})`,
    preheader: 'Hvala, vaše plačilo smo prejeli.',
    heading: 'Hvala, vaše plačilo je prispelo',
    body: (title: string, ref: string) =>
      `Prejeli smo plačilo za oglas »${title}« (#${ref}). Oglas je objavljen in viden na ${SITE_HOST}.`,
    orderTitle: 'Razčlenitev',
    discountLabel: 'Popust za priporočilo (10\u00a0%)',
    totalLabel: 'Plačani znesek',
    vatNote: 'Znesek vključuje 21-odstotni nizozemski DDV. Račun boste prejeli v ločenem sporočilu.',
    paidAtLabel: 'Datum plačila',
  },

  published: {
    subject: (ref: string) => `Vaš oglas je objavljen (#${ref})`,
    preheader: `Oglas je zdaj viden na ${SITE_HOST}.`,
    heading: 'Vaš oglas je objavljen',
    body: (title: string, ref: string) =>
      `Vaš oglas »${title}« (#${ref}) je na ${SITE_HOST} in doseže kupce v osmih državah.`,
    cta: 'Ogled oglasa',
    next: 'Ko nekdo pokaže zanimanje, vam njegove podatke takoj pošljemo po e-pošti. Stanje oglasa lahko vedno vidite na portalu.',
  },

  newEnquiry: {
    subject: (ref: string) => `Novo povpraševanje (#${ref})`,
    preheader: 'Nekdo se zanima za vašo nepremičnino.',
    heading: 'Nov odziv na vaš oglas',
    body: (title: string, ref: string) =>
      `Nekdo se je odzval na vaš oglas »${title}« (#${ref}):`,
    labels: { name: 'Ime', email: 'E-pošta', phone: 'Telefon' },
    messageTitle: 'Sporočilo',
    advice: 'Če lahko, se oglasite v dveh dneh: hiter odgovor je daleč najpomembnejši dejavnik, ali bo do prodaje prišlo.',
  },

  passwordReset: {
    subject: 'Ponastavitev gesla | Portal FINDDOME',
    preheader: 'Povezava velja eno uro.',
    heading: 'Ponastavite geslo',
    body: 'Prejeli smo zahtevo za ponastavitev gesla vašega računa na portalu FINDDOME. Za nastavitev novega kliknite spodnji gumb.',
    cta: 'Nastavi novo geslo',
    expiry: 'Povezava velja eno uro in jo je mogoče uporabiti enkrat.',
    ignore: 'Če tega niste zahtevali, sporočilo prezrite. Vaše geslo ostane nespremenjeno in nič se ne zgodi.',
  },

  referralRegistered: {
    subject: 'Vaše priporočilo smo prejeli | FINDDOME',
    preheader: 'Član naše ekipe bo kmalu stopil v stik z osebo, ki ste jo priporočili.',
    heading: 'Hvala za priporočilo',
    body: (referredName: string) =>
      `Podatke osebe ${referredName} smo prejeli. Član naše ekipe jo bo kontaktiral in, ko bo oglas objavljen, vam bomo priznali 10-odstotni popust pri ceni vašega naslednjega oglasa.`,
    note: 'Dobropis se uveljavi ročno, potem ko oglaševalec plača. Obvestili vas bomo, ko bo to mogoče.',
  },

  valuationReceived: {
    heading: 'Vašo zahtevo za oceno smo prejeli',
    body: 'Član naše ekipe preveri podatke o nepremičnini in podatkovno osnovo ter vam nato po e-pošti pošlje okvirno tržno oceno.',
  },

  valuationReady: {
    subject: 'Vaša ocena je pripravljena | FINDDOME',
    preheader: 'Za vašo nepremičnino smo pripravili okvirno oceno.',
    heading: 'Vaša ocena je pripravljena',
    body: (range: string) =>
      `Na podlagi navedenih podatkov in primerljivih nepremičnin je naša okvirna ocena: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Ta ocena je okvirna, ni cenilno poročilo in ne nadomešča uradne cenitve. Število primerljivih nepremičnin: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Ta ocena je okvirna, ni cenilno poročilo in ne nadomešča uradne cenitve.',
    cta: 'Objavite oglas zdaj',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Na podlagi navedenih podatkov je okvirna tržna vrednost: ${range}.`,
    mid: 'Srednja vrednost',
    basis: 'Podatkovna osnova',
    rateDate: 'Datum menjalnega tečaja',
    source: 'Vir',
    factorsHeading: 'Dejavniki',
    dirPlus: 'Zvišuje vrednost',
    dirMinus: 'Znižuje vrednost',
    dirUnsure: 'Negotovo',
    visit: 'Zaprosite za obisk Gábora',
    judicial: 'Zaprosite za uradno cenitev',
  },

  valuationDeclined: {
    subject: 'Vaša zahteva za oceno | FINDDOME',
    preheader: 'Član naše ekipe vas bo osebno kontaktiral.',
    heading: 'Hvala za vašo zahtevo',
    body: 'Na podlagi navedenih podatkov imamo trenutno premalo primerljivih nepremičnin za zanesljivo oceno. Član naše ekipe vas bo osebno kontaktiral.',
  },

  valuationNeedsInfo: {
    subject: 'Ocena: potrebujemo še nekaj podatkov',
    preheader: 'Za oceno potrebujemo še nekaj informacij.',
    heading: 'Potrebujemo še nekaj podatkov',
    body: 'Hvala za vašo zahtevo za oceno. Za oceno vas član naše ekipe prosi za naslednje:',
    after: 'Odgovorite na to sporočilo z manjkajočimi podatki. Ko jih prejmemo, bomo pripravili oceno.',
  },

  rejected: {
    subject: (ref: string) => `Vašega oglasa ni mogoče objaviti (#${ref})`,
    preheader: 'Izid pregleda in obrazložitev.',
    heading: 'Oglasa ne moremo objaviti',
    body: (title: string, ref: string) =>
      `Žal nam je: po pregledu naša ekipa vašega oglasa »${title}« (#${ref}) ni odobrila. Obrazložitev:`,
    refund: 'Če ste oglas že plačali, vas bomo glede vračila kontaktirali posebej.',
    after: 'Če imate vprašanje ali menite, da je prišlo do nesporazuma, preprosto odgovorite na to sporočilo.',
  },

  invoiceIssued: {
    subject: (number: string) => `Račun ${number}`,
    preheader: 'Račun je pripravljen; prek povezave si ga lahko ogledate ali prenesete.',
    heading: 'Vaš račun je pripravljen',
    body: (title: string, ref: string, number: string) =>
      `Račun ${number} za vaš oglas »${title}« (#${ref}) je pripravljen.`,
    cta: 'Ogled računa',
  },

  creditNoteIssued: {
    subject: (number: string) => `Dobropis ${number}`,
    preheader: 'Za vaš prejšnji račun smo izdali dobropis.',
    heading: 'Dobropis je pripravljen',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Izdali smo dobropis ${number} k računu ${correctsNumber} za vaš oglas »${title}« (#${ref}).`,
    cta: 'Ogled dobropisa',
  },

  serviceRequested: {
    subject: 'Vašo zahtevo smo prejeli | FINDDOME',
    preheader: 'Član naše ekipe vas bo kontaktiral za dogovor o terminu.',
    heading: 'Vašo zahtevo smo prejeli',
    body: (service: string, price: string) => `Hvala, vašo zahtevo smo zabeležili: ${service} (${price}).`,
    next: 'Član naše ekipe vas bo kontaktiral za dogovor o terminu.',
    payment: 'O plačilu vas bomo obvestili, ko se dogovorimo za termin. Zdaj ne plačate ničesar.',
    cancel: 'Ste si premislili? Preprosto odgovorite na to sporočilo.',
  },

  valuationPaid: {
    subject: 'Potrdilo o plačilu | Ocena FINDDOME',
    preheader: 'Hvala, vaše plačilo je prispelo.',
    heading: 'Hvala, vaše plačilo je prispelo',
    body: (service: string) => `Prejeli smo plačilo za »${service}«.`,
    orderTitle: 'Postavka',
    totalLabel: 'Plačani znesek',
    paidAtLabel: 'Plačano dne',
    next: 'Član naše ekipe vas bo kmalu kontaktiral glede naslednjih korakov.',
    invoice: 'Potrebujete račun? Preprosto odgovorite na to sporočilo.',
  },

  judicialRequested: {
    subject: 'Zahteva za uradno cenitev | FINDDOME',
    preheader: 'Član naše ekipe vas bo kontaktiral glede možnosti.',
    heading: 'Vašo zahtevo smo prejeli',
    body: 'Hvala, zabeležili smo, da želite uradno (sodno) cenitev izvedenca. To ni enako kot okvirna tržna ocena na naši spletni strani: izvede jo pooblaščeni cenilec na podlagi ponudbe.',
    next: 'Član naše ekipe vas bo kontaktiral glede možnosti in ponudbe.',
  },
} satisfies PublicEmailCopy;
