/**
 * Serbian (Latin) email copy. Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`). Formal "Vi" throughout, plain sentences.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const SR = {
  common: {
    greeting: (name: string) => `Poštovani/a ${name},`,
    greetingNoName: 'Poštovani oglašivaču,',
    signOff: 'Srdačan pozdrav,\nFINDDOME NEKRETNINE',
    questions: 'Ako imate pitanje, jednostavno odgovorite na ovaj imejl.',
    linkFallback: 'Ako dugme ne radi, kopirajte ovu adresu u pregledač:',
  },

  registrationConfirm: {
    subject: 'Podesite lozinku | FINDDOME',
    preheader: 'Jedan klik i možete da sastavite oglas.',
    heading: 'Podesite lozinku',
    intro: 'Hvala na registraciji. Vaš nalog je skoro spreman; nedostaje samo lozinka.',
    cta: 'Podesi lozinku',
    next: 'Zatim možete odmah da nastavite sa oglasom: paket, podaci, fotografije. Oglas pregledamo tek kada ga pošaljete.',
    expiry: 'Link važi 7 dana. Ako se niste sami registrovali, slobodno zanemarite ovaj imejl: nalog neće biti napravljen.',
  },

  accountExists: {
    subject: 'Već imate FINDDOME nalog',
    preheader: 'Prijavite se ili podesite novu lozinku.',
    heading: 'Za ovu adresu već postoji nalog',
    body: 'Neko je upravo pokušao da se registruje na sajtu FINDDOME sa ovom imejl adresom. Za nju već postoji nalog, pa nismo napravili novi.',
    cta: 'Prijava',
    reset: 'Zaboravili ste lozinku? Zatražite novu',
    ignore: 'Ako to niste bili Vi, ne morate ništa da radite: Vaš nalog je nepromenjen.',
  },

  invite: {
    subject: 'Poziv na FINDDOME portal',
    preheader: 'Podesite lozinku i prijavite se na portal za oglašivače.',
    heading: 'Pozvani ste na FINDDOME portal',
    body: (role: string) =>
      `FINDDOME Vas poziva da se pridružite portalu ${role}, gde upravljate oglasima za nekretnine.`,
    roleAdmin: 'kao administrator',
    roleOwner: 'kao oglašivač',
    cta: 'Prihvati poziv',
    expiry: 'Link važi 7 dana i može se iskoristiti jednom.',
  },

  welcome: {
    subject: 'Dobro došli na FINDDOME portal',
    preheader: 'Vaš nalog je aktivan. Evo kako da postavite prvi oglas.',
    heading: (name: string) => `Dobro došli, ${name}`,
    body: 'Vaš nalog je aktivan. Na portalu sastavljate oglas, otpremate fotografije i pratite njegov pregled.',
    stepsTitle: 'Šta će Vam biti potrebno',
    steps: [
      'Fotografije nekretnine: najmanje jedna, ali što više, to bolje',
      'Osnovni podaci: stambena površina, veličina placa, tražena cena',
      'Nekoliko rečenica o tome po čemu je nekretnina posebna',
    ],
    cta: 'Idi na portal',
  },

  submissionReceived: {
    subject: (ref: string) => `Primili smo Vaš oglas (#${ref})`,
    preheader: 'Pregledaćemo ga i javiti Vam imejlom.',
    heading: 'Vaš oglas je primljen',
    body: (title: string, ref: string) =>
      `Primili smo Vaš oglas „${title}” (#${ref}). Neko iz našeg tima će ga pregledati i, čim bude odluke, javićemo Vam imejlom.`,
    timing: 'Pregled obično ne traje duže od dva radna dana.',
    note: 'Tokom pregleda oglas ne možete da menjate. Ako zatražimo izmenu, odmah se ponovo otvara.',
  },

  changesRequested: {
    subject: (ref: string) => `Potrebna je izmena (#${ref})`,
    preheader: 'Jedna mala izmena i oglas može da bude objavljen.',
    heading: 'Molimo Vas za jednu izmenu',
    body: (title: string, ref: string) =>
      `Naš tim ima sledeću napomenu o Vašem oglasu „${title}” (#${ref}):`,
    after: 'Oglas ponovo može da se menja. Unesite izmenu i ponovo ga pošaljite; postupak se zatim jednostavno nastavlja.',
    cta: 'Izmeni oglas',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Odobreno (#${ref}): preostalo je samo plaćanje`,
    preheader: 'Vaš oglas je odobren i biće objavljen čim plaćanje stigne.',
    heading: 'Vaš oglas je odobren',
    body: (title: string, ref: string) =>
      `Dobre vesti: pregledali smo i odobrili Vaš oglas „${title}” (#${ref}). Potrebno je još samo plaćanje. Čim stigne, oglas se odmah objavljuje.`,
    orderTitle: 'Cena oglasa',
    discountLabel: 'Popust za preporuku (10%)',
    totalLabel: 'Za plaćanje',
    ctaCard: 'Plati karticom',
    cardNote: 'Plaćanje se obavlja u bezbednom okruženju kompanije Stripe. FINDDOME ne vidi i ne čuva podatke Vaše kartice.',
    bankTitle: 'Ili bankovnim prenosom',
    bankNote: (ref: string) =>
      `Molimo Vas da uz uplatu navedete poziv na broj: ${ref}. Čim uplata stigne, neko iz našeg tima objavljuje oglas.`,
    vatNote: 'Svi iznosi uključuju holandski PDV od 21%.',
  },

  approvedPublished: {
    subject: (ref: string) => `Odobreno i objavljeno (#${ref})`,
    preheader: 'Vaš oglas je već objavljen; molimo Vas da naknadu za oglas platite u roku od 14 dana.',
    heading: 'Vaš oglas je sada objavljen',
    body: (title: string, ref: string) => `Odobrili smo oglas „${title}” (#${ref}) i odmah ga objavili.`,
    viewCta: 'Pogledaj oglas',
    orderTitle: 'Cena oglasa',
    discountLabel: 'Popust za preporuku (10%)',
    totalLabel: 'Za plaćanje',
    dueLabel: 'Rok plaćanja',
    ctaCard: 'Plati karticom',
    cardNote: 'Plaćanje se obavlja u bezbednom okruženju kompanije Stripe. FINDDOME ne vidi i ne čuva podatke Vaše kartice.',
    bankTitle: 'Bankovni prenos',
    bankNote: (ref: string) => `Molimo Vas da uz uplatu navedete poziv na broj: ${ref}.`,
    vatNote: 'Svi iznosi uključuju holandski PDV od 21%.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Potvrda plaćanja (#${ref})`,
    preheader: 'Hvala, primili smo Vašu uplatu.',
    heading: 'Hvala, Vaša uplata je stigla',
    body: (title: string, ref: string) =>
      `Primili smo uplatu za oglas „${title}” (#${ref}). Oglas je objavljen i vidljiv na ${SITE_HOST}.`,
    orderTitle: 'Specifikacija',
    discountLabel: 'Popust za preporuku (10%)',
    totalLabel: 'Plaćeni iznos',
    vatNote: 'Iznos uključuje holandski PDV od 21%. Račun ćete dobiti u posebnom imejlu.',
    paidAtLabel: 'Datum plaćanja',
  },

  published: {
    subject: (ref: string) => `Vaš oglas je objavljen (#${ref})`,
    preheader: `Oglas je sada vidljiv na ${SITE_HOST}.`,
    heading: 'Vaš oglas je objavljen',
    body: (title: string, ref: string) =>
      `Vaš oglas „${title}” (#${ref}) nalazi se na ${SITE_HOST} i dopire do kupaca u osam zemalja.`,
    cta: 'Pogledaj oglas',
    next: 'Čim neko pokaže interesovanje, odmah Vam imejlom šaljemo njegove podatke. Status oglasa uvek možete da vidite na portalu.',
  },
  approvedFree: {
    subject: (ref: string) => `Vaš oglas je odobren besplatno (#${ref})`,
    preheader: `Oglas je sada vidljiv na ${SITE_HOST} i ništa ne treba da platite.`,
    heading: 'Vaš oglas je objavljen, besplatno',
    body: (title: string, ref: string) =>
      `Odobrili smo Vaš oglas „${title}” (#${ref}) i sada je vidljiv na ${SITE_HOST}. Ovoga puta ne naplaćujemo naknadu za objavljivanje, tako da ne morate ništa da preduzimate.`,
    waived: 'Zahtev za plaćanje koji smo Vam ranije poslali time je poništen; molimo Vas da ga ne plaćate.',
    cta: 'Pogledaj oglas',
    next: 'Čim neko pokaže interesovanje, odmah Vam imejlom šaljemo njegove podatke. Status oglasa uvek možete da vidite na portalu.',
  },

  newEnquiry: {
    subject: (ref: string) => `Novi upit (#${ref})`,
    preheader: 'Neko je zainteresovan za Vašu nekretninu.',
    heading: 'Novi odgovor na Vaš oglas',
    body: (title: string, ref: string) =>
      `Neko se javio povodom Vašeg oglasa „${title}” (#${ref}):`,
    labels: { name: 'Ime', email: 'Imejl', phone: 'Telefon' },
    messageTitle: 'Poruka',
    advice: 'Molimo Vas da se javite u roku od dva dana ako možete: brz odgovor je daleko najvažniji faktor za uspešnu prodaju.',
  },

  passwordReset: {
    subject: 'Resetovanje lozinke | FINDDOME portal',
    preheader: 'Link važi jedan sat.',
    heading: 'Resetujte lozinku',
    body: 'Primili smo zahtev za resetovanje lozinke Vašeg naloga na FINDDOME portalu. Kliknite na dugme ispod da biste podesili novu.',
    cta: 'Podesi novu lozinku',
    expiry: 'Link važi jedan sat i može se iskoristiti jednom.',
    ignore: 'Ako to niste tražili, zanemarite ovaj imejl. Vaša lozinka ostaje nepromenjena i ništa se ne dešava.',
  },

  referralRegistered: {
    subject: 'Primili smo Vašu preporuku | FINDDOME',
    preheader: 'Neko iz našeg tima će uskoro kontaktirati osobu koju ste preporučili.',
    heading: 'Hvala na preporuci',
    body: (referredName: string) =>
      `Primili smo podatke osobe ${referredName}. Neko iz našeg tima će je kontaktirati, a kada oglas bude postavljen, odobrićemo Vam popust od 10% na cenu sledećeg oglasa.`,
    note: 'Popust se odobrava ručno, nakon što oglašivač plati. Javićemo Vam čim to bude moguće.',
  },

  valuationReceived: {
    heading: 'Primili smo Vaš zahtev za procenu',
    body: 'Neko iz našeg tima proverava podatke o nekretnini i osnovu podataka, a zatim Vam imejlom šalje okvirnu tržišnu procenu.',
  },

  valuationReady: {
    subject: 'Vaša procena je spremna | FINDDOME',
    preheader: 'Napravili smo okvirnu procenu za Vašu nekretninu.',
    heading: 'Vaša procena je spremna',
    body: (range: string) =>
      `Na osnovu datih podataka i uporedivih nekretnina, naša okvirna procena je: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Ova procena je okvirna, nije izveštaj o proceni vrednosti i ne zamenjuje zvaničnu procenu. Zasnovana je na uporedivim nekretninama (broj: ${n}).`,
    disclaimer:
      'Ova procena je okvirna, nije izveštaj o proceni vrednosti i ne zamenjuje zvaničnu procenu.',
    cta: 'Postavite oglas sada',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Na osnovu datih podataka, okvirna tržišna vrednost je: ${range}.`,
    mid: 'Srednja vrednost',
    basis: 'Osnova podataka',
    rateDate: 'Datum kursa',
    source: 'Izvor',
    factorsHeading: 'Faktori',
    dirPlus: 'Povećava vrednost',
    dirMinus: 'Smanjuje vrednost',
    dirUnsure: 'Neizvesno',
    visit: 'Zatražite posetu Gabora',
    judicial: 'Zatražite zvaničnu procenu',
  },

  valuationDeclined: {
    subject: 'Vaš zahtev za procenu | FINDDOME',
    preheader: 'Neko iz našeg tima će Vas lično kontaktirati.',
    heading: 'Hvala na zahtevu',
    body: 'Na osnovu datih podataka trenutno imamo premalo uporedivih nekretnina za pouzdanu procenu. Neko iz našeg tima će Vas lično kontaktirati.',
  },

  valuationNeedsInfo: {
    subject: 'Procena: potrebno nam je još nekoliko podataka',
    preheader: 'Za procenu nam je potrebno još malo informacija.',
    heading: 'Potrebno nam je još nekoliko podataka',
    body: 'Hvala na zahtevu za procenu. Za procenu, neko iz našeg tima Vas moli za sledeće:',
    after: 'Odgovorite na ovaj imejl i pošaljite podatke koji nedostaju. Čim ih dobijemo, napravićemo procenu.',
  },

  rejected: {
    subject: (ref: string) => `Vaš oglas ne može biti postavljen (#${ref})`,
    preheader: 'Ishod pregleda i obrazloženje.',
    heading: 'Ne možemo da postavimo oglas',
    body: (title: string, ref: string) =>
      `Žao nam je: nakon pregleda, naš tim nije odobrio Vaš oglas „${title}” (#${ref}). Obrazloženje:`,
    refund: 'Ako ste već platili oglas, kontaktiraćemo Vas posebno u vezi sa povraćajem novca.',
    after: 'Ako imate pitanje ili mislite da je došlo do nesporazuma, jednostavno odgovorite na ovaj imejl.',
  },

  invoiceIssued: {
    subject: (number: string) => `Račun ${number}`,
    preheader: 'Račun je spreman; možete ga pogledati ili preuzeti preko linka.',
    heading: 'Vaš račun je spreman',
    body: (title: string, ref: string, number: string) =>
      `Račun ${number} za Vaš oglas „${title}” (#${ref}) je spreman.`,
    cta: 'Pogledaj račun',
  },

  creditNoteIssued: {
    subject: (number: string) => `Knjižno odobrenje ${number}`,
    preheader: 'Izdali smo knjižno odobrenje za Vaš raniji račun.',
    heading: 'Knjižno odobrenje je spremno',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Izdali smo knjižno odobrenje ${number} na račun ${correctsNumber} za Vaš oglas „${title}” (#${ref}).`,
    cta: 'Pogledaj knjižno odobrenje',
  },

  serviceRequested: {
    subject: 'Primili smo Vaš zahtev | FINDDOME',
    preheader: 'Neko iz našeg tima će Vas kontaktirati radi dogovora o terminu.',
    heading: 'Primili smo Vaš zahtev',
    body: (service: string, price: string) => `Hvala, zabeležili smo Vaš zahtev: ${service} (${price}).`,
    next: 'Neko iz našeg tima će Vas kontaktirati radi dogovora o terminu.',
    payment: 'O plaćanju ćemo Vas obavestiti kada dogovorimo termin. Sada ništa ne plaćate.',
    cancel: 'Predomislili ste se? Jednostavno odgovorite na ovaj imejl.',
  },

  valuationPaid: {
    subject: 'Potvrda plaćanja | FINDDOME procena',
    preheader: 'Hvala, Vaša uplata je stigla.',
    heading: 'Hvala, Vaša uplata je stigla',
    body: (service: string) => `Primili smo uplatu za „${service}”.`,
    orderTitle: 'Stavka',
    totalLabel: 'Plaćeni iznos',
    paidAtLabel: 'Datum plaćanja',
    next: 'Neko iz našeg tima će Vas uskoro kontaktirati u vezi sa sledećim koracima.',
    invoice: 'Potreban Vam je račun? Jednostavno odgovorite na ovaj imejl.',
  },

  judicialRequested: {
    subject: 'Zahtev za zvaničnu procenu | FINDDOME',
    preheader: 'Neko iz našeg tima će Vas kontaktirati u vezi sa mogućnostima.',
    heading: 'Primili smo Vaš zahtev',
    body: 'Hvala, zabeležili smo da želite zvaničnu procenu (po nalogu suda) od strane veštaka. To nije isto što i okvirna tržišna procena na našem sajtu: sprovodi je ovlašćeni veštak, na osnovu ponude.',
    next: 'Neko iz našeg tima će Vas kontaktirati u vezi sa mogućnostima i ponudom.',
  },
} satisfies PublicEmailCopy;
