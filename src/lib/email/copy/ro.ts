/**
 * Textele e-mailurilor în limba română (adresare cu „dumneavoastră”).
 * Compilatorul le verifică față de fișierul maghiar (`satisfies
 * PublicEmailCopy`): dacă lipsește un șablon, acest fișier nu se compilează și
 * nimeni nu primește un e-mail în maghiară sau neerlandeză. Notificările
 * pentru birou (admin*) rămân în maghiară și nu apar aici.
 *
 * Ton: sobru, fraze scurte, fără semne de exclamare. Mulți vânzători sunt
 * pensionari: claritatea înaintea căldurii, ambele înaintea tonului
 * publicitar. Ghilimele „…”, ș și ț cu virgulă dedesubt, fără spațiu înainte
 * de „:” sau „?”. Numeralele de la 20 în sus cer „de” (20 de zile).
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';
import { nOf } from '~/i18n/plural';

export const RO = {
  common: {
    greeting: (name: string) => `Bună ziua, ${name},`,
    greetingNoName: 'Bună ziua,',
    signOff: 'Cu stimă,\nFINDDOME Imobiliare',
    questions: 'Aveți întrebări? Este suficient să răspundeți la acest e-mail.',
    linkFallback: 'Butonul nu funcționează? Copiați această adresă în browser:',
  },

  registrationConfirm: {
    subject: 'Setați-vă parola | FINDDOME',
    preheader: 'Un clic și vă puteți alcătui anunțul.',
    heading: 'Setați-vă parola',
    intro: 'Vă mulțumim pentru înregistrare. Contul dumneavoastră este aproape gata; mai lipsește doar parola.',
    cta: 'Setați parola',
    next: 'Apoi continuați direct cu anunțul: pachet, informații, fotografii. Ne uităm la el abia după ce ni-l trimiteți.',
    expiry: 'Linkul este valabil 7 zile. Dacă nu v-ați înregistrat dumneavoastră, ignorați acest e-mail: nu va fi creat niciun cont.',
  },

  accountExists: {
    subject: 'Aveți deja un cont FINDDOME',
    preheader: 'Conectați-vă sau setați o parolă nouă.',
    heading: 'Există deja un cont pentru această adresă',
    body: 'Cineva tocmai a încercat să se înregistreze pe site-ul FINDDOME cu această adresă de e-mail. Deoarece există deja un cont pentru ea, nu am creat unul nou.',
    cta: 'Conectați-vă',
    reset: 'Ați uitat parola? Solicitați o parolă nouă',
    ignore: 'Nu ați fost dumneavoastră? Nu trebuie să faceți nimic: contul rămâne neschimbat.',
  },

  invite: {
    subject: 'Invitație în portalul FINDDOME',
    preheader: 'Setați-vă parola și conectați-vă la zona dedicată anunțurilor.',
    heading: 'Sunteți invitat în portalul FINDDOME',
    body: (role: string) =>
      `FINDDOME vă invită să vă alăturați portalului ${role}; acolo se administrează anunțurile imobiliare.`,
    roleAdmin: 'în calitate de administrator',
    roleOwner: 'în calitate de autor de anunțuri',
    cta: 'Acceptați invitația',
    expiry: 'Linkul este valabil 7 zile și poate fi folosit o singură dată.',
  },

  welcome: {
    subject: 'Bine ați venit în portalul FINDDOME',
    preheader: 'Contul dumneavoastră este activ. Iată cum publicați primul anunț.',
    heading: (name: string) => `Bine ați venit, ${name}`,
    body: 'Contul dumneavoastră este activ. În portal vă alcătuiți anunțul, încărcați fotografiile și urmăriți verificarea acestuia.',
    stepsTitle: 'De ce veți avea nevoie',
    steps: [
      'Fotografii ale proprietății: cel puțin una, dar cu cât mai multe, cu atât mai bine',
      'Datele de bază: suprafața utilă, suprafața terenului, prețul cerut',
      'Câteva fraze despre ce face proprietatea deosebită',
    ],
    cta: 'Mergeți la portal',
  },

  submissionReceived: {
    subject: (ref: string) => `Am primit anunțul dumneavoastră (#${ref})`,
    preheader: 'Îl verificăm și vă răspundem prin e-mail.',
    heading: 'Anunțul dumneavoastră a fost primit',
    body: (title: string, ref: string) =>
      `Am primit anunțul dumneavoastră „${title}” (#${ref}). Un coleg îl verifică și, de îndată ce se ia o decizie, vă anunțăm prin e-mail.`,
    timing: 'Verificarea nu durează de obicei mai mult de două zile lucrătoare.',
    note: 'În timpul verificării nu puteți modifica anunțul. Dacă vă cerem o modificare, editarea se deblochează imediat.',
  },

  changesRequested: {
    subject: (ref: string) => `Este necesară o modificare (#${ref})`,
    preheader: 'O mică modificare și anunțul poate fi publicat.',
    heading: 'Vă rugăm să faceți o modificare',
    body: (title: string, ref: string) =>
      `Cu privire la anunțul dumneavoastră „${title}” (#${ref}), colegul nostru are următoarea observație:`,
    after: 'Anunțul poate fi editat din nou. Faceți modificarea și trimiteți-l din nou; apoi totul continuă în mod obișnuit.',
    cta: 'Modificați anunțul',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Aprobat (#${ref}): mai rămâne doar plata`,
    preheader: 'Anunțul dumneavoastră este aprobat și va fi publicat imediat ce primim plata.',
    heading: 'Anunțul dumneavoastră este aprobat',
    body: (title: string, ref: string) =>
      `Vești bune: am verificat și am aprobat anunțul dumneavoastră „${title}” (#${ref}). Mai rămâne doar plata. Imediat ce o primim, anunțul este publicat.`,
    orderTitle: 'Costul anunțului',
    discountLabel: 'Reducere pentru recomandare (10%)',
    totalLabel: 'De plată',
    ctaCard: 'Plătiți cu cardul',
    cardNote: 'Plata se face în mediul securizat Stripe. FINDDOME nu vede și nu păstrează datele cardului dumneavoastră.',
    bankTitle: 'Sau prin transfer bancar',
    bankNote: (ref: string) =>
      `Menționați la transfer referința: ${ref}. Imediat ce sosește transferul, colegul nostru publică anunțul.`,
    vatNote: 'Toate sumele indicate includ TVA olandez de 21%.',
  },

  approvedPublished: {
    subject: (ref: string) => `Aprobat și publicat (#${ref})`,
    preheader: 'Anunțul dumneavoastră este deja online; achitați taxa de publicare în 14 zile.',
    heading: 'Anunțul dumneavoastră este online',
    body: (title: string, ref: string) => `Am aprobat anunțul „${title}” (#${ref}) și l-am publicat imediat.`,
    viewCta: 'Vedeți anunțul',
    orderTitle: 'Costul anunțului',
    discountLabel: 'Reducere pentru recomandare (10%)',
    totalLabel: 'De plată',
    dueLabel: 'De plătit până la',
    ctaCard: 'Plătiți cu cardul',
    cardNote: 'Plata se face în mediul securizat Stripe. FINDDOME nu vede și nu păstrează datele cardului dumneavoastră.',
    bankTitle: 'Transfer bancar',
    bankNote: (ref: string) => `Menționați la transfer referința: ${ref}.`,
    vatNote: 'Toate sumele indicate includ TVA olandez de 21%.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Confirmare de plată (#${ref})`,
    preheader: 'Vă mulțumim, am primit plata.',
    heading: 'Vă mulțumim, plata a sosit',
    body: (title: string, ref: string) =>
      `Am primit plata pentru anunțul „${title}” (#${ref}). Anunțul este online și vizibil pe ${SITE_HOST}.`,
    orderTitle: 'Detalii',
    discountLabel: 'Reducere pentru recomandare (10%)',
    totalLabel: 'Sumă plătită',
    vatNote: 'Suma include TVA olandez de 21%. Factura o veți primi într-un e-mail separat.',
    paidAtLabel: 'Data plății',
  },

  published: {
    subject: (ref: string) => `Anunțul dumneavoastră este online (#${ref})`,
    preheader: `Anunțul este acum vizibil pe ${SITE_HOST}.`,
    heading: 'Anunțul dumneavoastră este online',
    body: (title: string, ref: string) =>
      `Anunțul dumneavoastră „${title}” (#${ref}) este pe ${SITE_HOST} și ajunge la cumpărători din opt țări.`,
    cta: 'Vedeți anunțul',
    next: 'Imediat ce cineva își manifestă interesul, vă trimitem un e-mail cu datele sale de contact. Puteți verifica oricând starea anunțului în portal.',
  },

  newEnquiry: {
    subject: (ref: string) => `Solicitare nouă (#${ref})`,
    preheader: 'Cineva este interesat de proprietatea dumneavoastră.',
    heading: 'Un nou răspuns la anunțul dumneavoastră',
    body: (title: string, ref: string) =>
      `Cineva a răspuns la anunțul dumneavoastră „${title}” (#${ref}):`,
    labels: { name: 'Nume', email: 'E-mail', phone: 'Telefon' },
    messageTitle: 'Mesajul său',
    advice: 'Contactați această persoană, de preferință, în două zile: un răspuns rapid este de departe cel mai important factor pentru ca o vânzare să se încheie.',
  },

  passwordReset: {
    subject: 'Resetarea parolei | Portalul FINDDOME',
    preheader: 'Linkul este valabil o oră.',
    heading: 'Resetarea parolei',
    body: 'Am primit o cerere de resetare a parolei contului dumneavoastră din portalul FINDDOME. Faceți clic pe butonul de mai jos pentru a seta una nouă.',
    cta: 'Setați o parolă nouă',
    expiry: 'Linkul este valabil o oră și poate fi folosit o singură dată.',
    ignore: 'Nu ați trimis dumneavoastră această cerere? Ignorați acest e-mail. Parola rămâne neschimbată și nu se întâmplă nimic.',
  },

  referralRegistered: {
    subject: 'Am primit recomandarea dumneavoastră | FINDDOME',
    preheader: 'Un coleg va contacta în curând persoana recomandată.',
    heading: 'Vă mulțumim pentru recomandare',
    body: (referredName: string) =>
      `Am primit datele de contact ale persoanei recomandate (${referredName}). Un coleg o va contacta și, imediat ce anunțul ei este publicat, vă scădem 10% din costul următorului dumneavoastră anunț.`,
    note: 'Reducerea se aplică manual, după ce persoana recomandată plătește anunțul. Un coleg vă va anunța imediat ce este posibil.',
  },

  valuationReceived: {
    heading: 'Am primit cererea dumneavoastră de evaluare',
    body: 'Un coleg verifică datele proprietății și baza noastră de date, apoi vă trimite prin e-mail evaluarea orientativă, bazată pe piață.',
  },

  valuationReady: {
    subject: 'Evaluarea dumneavoastră este gata | FINDDOME',
    preheader: 'Am întocmit o evaluare orientativă a proprietății dumneavoastră.',
    heading: 'Evaluarea dumneavoastră este gata',
    body: (range: string) =>
      `Pe baza informațiilor furnizate și a proprietăților comparabile, evaluarea noastră orientativă este: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Această evaluare este orientativă: nu este o expertiză și nu înlocuiește o evaluare oficială. Are la bază ${nOf('ro', n, 'proprietate comparabilă', 'proprietăți comparabile', 'de proprietăți comparabile')}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Această evaluare este orientativă: nu este o expertiză și nu înlocuiește o evaluare oficială.',
    cta: 'Publicați un anunț',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Pe baza informațiilor furnizate, valoarea orientativă, bazată pe piață, este: ${range}.`,
    mid: 'Valoare medie',
    basis: 'Baza de date',
    rateDate: 'Data cursului de schimb',
    source: 'Sursă',
    factorsHeading: 'Factori',
    dirPlus: 'Crește valoarea',
    dirMinus: 'Scade valoarea',
    dirUnsure: 'Incert',
    visit: 'Solicitați vizita lui Gábor',
    judicial: 'Solicitați o evaluare oficială',
  },

  valuationDeclined: {
    subject: 'Cererea dumneavoastră de evaluare | FINDDOME',
    preheader: 'Un coleg vă va contacta personal.',
    heading: 'Vă mulțumim pentru cerere',
    body: 'Pe baza informațiilor furnizate, avem în prezent prea puține proprietăți comparabile pentru o evaluare fiabilă. Un coleg vă va contacta personal.',
  },

  valuationNeedsInfo: {
    subject: 'Evaluare: ne lipsesc câteva informații',
    preheader: 'Pentru evaluare avem nevoie de ceva mai multe informații.',
    heading: 'Ne lipsesc câteva informații',
    body: 'Vă mulțumim pentru cererea de evaluare. Pentru a o întocmi, colegul nostru vă roagă următoarele:',
    after: 'Răspundeți la acest e-mail cu informațiile lipsă. Imediat ce le primim, întocmim evaluarea.',
  },

  rejected: {
    subject: (ref: string) => `Anunțul dumneavoastră nu poate fi publicat (#${ref})`,
    preheader: 'Rezultatul verificării și explicațiile.',
    heading: 'Nu putem publica anunțul',
    body: (title: string, ref: string) =>
      `Ne pare rău: după verificare, colegul nostru nu a aprobat anunțul dumneavoastră „${title}” (#${ref}). Explicațiile:`,
    refund: 'Ați plătit deja anunțul? Vă vom contacta separat în privința rambursării.',
    after: 'Aveți întrebări sau credeți că este o neînțelegere? Este suficient să răspundeți la acest e-mail.',
  },

  invoiceIssued: {
    subject: (number: string) => `Factura ${number}`,
    preheader: 'Factura este gata; o puteți vedea sau descărca prin link.',
    heading: 'Factura dumneavoastră este gata',
    body: (title: string, ref: string, number: string) =>
      `Factura ${number} pentru anunțul dumneavoastră „${title}” (#${ref}) este gata.`,
    cta: 'Vedeți factura',
  },

  creditNoteIssued: {
    subject: (number: string) => `Factura de stornare ${number}`,
    preheader: 'Am emis o factură de stornare pentru factura dumneavoastră anterioară.',
    heading: 'Factura de stornare este disponibilă',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Pentru factura ${correctsNumber} aferentă anunțului dumneavoastră „${title}” (#${ref}) am emis factura de stornare ${number}.`,
    cta: 'Vedeți factura de stornare',
  },

  serviceRequested: {
    subject: 'Am primit cererea dumneavoastră | FINDDOME',
    preheader: 'Un coleg vă va contacta pentru a stabili o programare.',
    heading: 'Am primit cererea dumneavoastră',
    body: (service: string, price: string) => `Vă mulțumim, am înregistrat cererea dumneavoastră: ${service} (${price}).`,
    next: 'Un coleg vă va contacta pentru a stabili o programare.',
    payment: 'Vă vom informa despre plată la stabilirea programării. Deocamdată nu plătiți nimic.',
    cancel: 'V-ați răzgândit? Este suficient să răspundeți la acest e-mail.',
  },

  valuationPaid: {
    subject: 'Confirmare de plată | Evaluare FINDDOME',
    preheader: 'Vă mulțumim, plata a sosit.',
    heading: 'Vă mulțumim, plata a sosit',
    body: (service: string) => `Am primit plata pentru „${service}”.`,
    orderTitle: 'Serviciu',
    totalLabel: 'Sumă plătită',
    paidAtLabel: 'Plătit la',
    next: 'Un coleg vă va contacta în curând în privința pașilor următori.',
    invoice: 'Aveți nevoie de o factură? Este suficient să răspundeți la acest e-mail.',
  },

  judicialRequested: {
    subject: 'Cerere de evaluare oficială | FINDDOME',
    preheader: 'Un coleg vă va contacta în privința variantelor posibile.',
    heading: 'Am primit cererea dumneavoastră',
    body: 'Vă mulțumim, am notat că doriți o evaluare oficială (judiciară) efectuată de un expert. Aceasta diferă de evaluarea orientativă, bazată pe piață, oferită pe site-ul nostru: este realizată de un evaluator autorizat, pe baza unei oferte de preț.',
    next: 'Un coleg vă va contacta în privința variantelor posibile și a ofertei de preț.',
  },
} satisfies PublicEmailCopy;
