/**
 * Hungarian email copy.
 *
 * This file is the shape. nl.ts, en.ts, de.ts and fr.ts must match it and are
 * type-checked against it (`satisfies typeof HU` / `PublicEmailCopy`), so adding
 * a template here without translating it there is a compile error rather than
 * a Hungarian email arriving in a Dutch, English, German or French inbox.
 *
 * Tone follows FODEL's own published writing: formal "Ön", plain sentences,
 * no exclamation marks, and never more words than the message needs. Their
 * sellers are frequently pensioners — clarity outranks warmth, and both
 * outrank marketing voice.
 */
import { SITE_HOST } from '~/config/site.mjs';

export const HU = {
  common: {
    greeting: (name: string) => `Kedves ${name}!`,
    greetingNoName: 'Tisztelt Hirdetőnk!',
    signOff: 'Üdvözlettel,\nFINDDOME Ingatlan',
    questions: 'Ha bármi kérdése van, egyszerűen válaszoljon erre az e-mailre.',
    linkFallback: 'Ha a gomb nem működik, másolja be ezt a címet a böngészőjébe:',
  },

  registrationConfirm: {
    subject: 'Állítsa be a jelszavát | FINDDOME',
    preheader: 'Egy kattintás, és már állíthatja össze a hirdetését.',
    heading: 'Állítsa be a jelszavát',
    intro: 'Köszönjük a regisztrációt. A fiókja szinte kész, már csak egy jelszó hiányzik.',
    cta: 'Jelszó beállítása',
    next: 'Utána rögtön a hirdetés összeállításával folytathatja: csomag, adatok, fotók. Munkatársunk csak a beküldés után nézi át.',
    expiry: 'A link 7 napig érvényes. Ha nem Ön regisztrált, hagyja figyelmen kívül ezt a levelet: fiók nem jön létre.',
  },

  accountExists: {
    subject: 'Már van FINDDOME-fiókja',
    preheader: 'Jelentkezzen be, vagy állítson be új jelszót.',
    heading: 'Ehhez a címhez már tartozik fiók',
    body: 'Valaki most regisztrálni próbált ezzel az e-mail-címmel a FINDDOME oldalán. A címhez már tartozik fiók, ezért újat nem hoztunk létre.',
    cta: 'Bejelentkezés',
    reset: 'Elfelejtette a jelszavát? Új jelszó kérése',
    ignore: 'Ha nem Ön próbált regisztrálni, nincs teendője: a fiókja változatlan.',
  },

  invite: {
    subject: 'Meghívó a FINDDOME portálra',
    preheader: 'Állítsa be jelszavát, és lépjen be a hirdetői felületre.',
    heading: 'Meghívást kapott a FINDDOME portálra',
    body: (role: string) =>
      `A FINDDOME meghívta Önt, hogy ${role} csatlakozzon a portálhoz, ahol az ingatlanhirdetéseket kezelheti.`,
    roleAdmin: 'adminisztrátorként',
    roleOwner: 'hirdetőként',
    cta: 'Meghívó elfogadása',
    expiry: 'A link 7 napig érvényes, és csak egyszer használható fel.',
  },

  welcome: {
    subject: 'Üdvözöljük a FINDDOME portálon',
    preheader: 'A fiókja aktív. Így adhatja fel az első hirdetését.',
    heading: (name: string) => `Üdvözöljük, ${name}`,
    body: 'A fiókja aktív. A portálon összeállíthatja hirdetését, fényképeket tölthet fel, és nyomon követheti, hol tart az elbírálás.',
    stepsTitle: 'Amire szüksége lesz',
    steps: [
      'Fényképek az ingatlanról: legalább egy, de minél több, annál jobb',
      'Az ingatlan alapadatai: alapterület, telekméret, irányár',
      'Néhány mondat arról, mitől különleges az ingatlan',
    ],
    cta: 'Ugrás a portálra',
  },

  submissionReceived: {
    subject: (ref: string) => `Hirdetését megkaptuk (#${ref})`,
    preheader: 'Munkatársunk átnézi, és e-mailben jelentkezünk.',
    heading: 'Hirdetését elbírálásra megkaptuk',
    body: (title: string, ref: string) =>
      `A(z) „${title}” (#${ref}) hirdetését megkaptuk. Munkatársunk átnézi, és amint döntés született, e-mailben értesítjük.`,
    timing: 'Az elbírálás általában két munkanapon belül megtörténik.',
    note: 'Amíg az elbírálás tart, a hirdetés nem szerkeszthető. Ha javítást kérünk, azonnal újra megnyílik.',
  },

  adminNewSubmission: {
    subject: (ref: string) => `Elbírálásra vár (#${ref})`,
    preheader: 'Új hirdetés érkezett a portálra.',
    heading: 'Új hirdetés vár elbírálásra',
    cta: 'Elbírálás megnyitása',
    labels: {
      ref: 'Azonosító',
      title: 'Cím',
      owner: 'Hirdető',
      email: 'E-mail',
      location: 'Helyszín',
      price: 'Irányár',
      photos: 'Fényképek',
      languages: 'Nyelvek',
    },
  },

  changesRequested: {
    subject: (ref: string) => `Javítás szükséges (#${ref})`,
    preheader: 'Egy apró javítás kell, mielőtt élesíthetjük a hirdetést.',
    heading: 'Kérjük, javítsa hirdetését',
    body: (title: string, ref: string) =>
      `A(z) „${title}” (#${ref}) hirdetésével kapcsolatban munkatársunk az alábbi megjegyzést fűzte:`,
    after: 'A hirdetés újra szerkeszthető. Kérjük, végezze el a javítást, majd küldje be ismét. A folyamat innen ugyanúgy folytatódik.',
    cta: 'Hirdetés javítása',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Jóváhagyva (#${ref}): már csak a díj rendezése van hátra`,
    preheader: 'A hirdetést jóváhagytuk. A díj beérkezése után azonnal élesedik.',
    heading: 'Hirdetését jóváhagytuk',
    body: (title: string, ref: string) =>
      `Jó hír: a(z) „${title}” (#${ref}) hirdetését átnéztük és jóváhagytuk. Már csak a hirdetési díj rendezése van hátra. A fizetés beérkezése után a hirdetés azonnal megjelenik.`,
    orderTitle: 'A hirdetés díja',
    discountLabel: 'Ajánlói kedvezmény (10%)',
    totalLabel: 'Fizetendő',
    ctaCard: 'Fizetés bankkártyával',
    cardNote: 'A fizetés a Stripe biztonságos felületén történik. A kártyaadatokat a FINDDOME nem látja és nem tárolja.',
    bankTitle: 'Vagy banki átutalással',
    bankNote: (ref: string) =>
      `Átutaláskor kérjük, a közleménybe írja be a hirdetés azonosítóját: ${ref}. Az átutalás beérkezése után munkatársunk élesíti a hirdetést.`,
    vatNote: 'A feltüntetett árak a 21% holland áfát tartalmazzák.',
  },

  approvedPublished: {
    subject: (ref: string) => `Jóváhagyva és élesítve (#${ref})`,
    preheader: 'Hirdetése már látható; a hirdetési díjat 14 napon belül rendezheti.',
    heading: 'Hirdetése már élő',
    body: (title: string, ref: string) => `A(z) „${title}” (#${ref}) hirdetését jóváhagytuk és azonnal közzétettük.`,
    viewCta: 'Hirdetés megtekintése',
    orderTitle: 'A hirdetés díja',
    discountLabel: 'Ajánlói kedvezmény (10%)',
    totalLabel: 'Fizetendő',
    dueLabel: 'Fizetési határidő',
    ctaCard: 'Fizetés bankkártyával',
    cardNote: 'A fizetés a Stripe biztonságos felületén történik. A kártyaadatokat a FINDDOME nem látja és nem tárolja.',
    bankTitle: 'Banki átutalás',
    bankNote: (ref: string) => `Átutaláskor kérjük, a közleménybe írja be a hirdetés azonosítóját: ${ref}.`,
    vatNote: 'A feltüntetett árak a 21% holland áfát tartalmazzák.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Fizetési visszaigazolás (#${ref})`,
    preheader: 'Köszönjük, a fizetés megérkezett.',
    heading: 'Köszönjük, a fizetés megérkezett',
    body: (title: string, ref: string) =>
      `A(z) „${title}” (#${ref}) hirdetés díját megkaptuk. A hirdetés élesítve, és mostantól látható a ${SITE_HOST} oldalon.`,
    orderTitle: 'Tételek',
    discountLabel: 'Ajánlói kedvezmény (10%)',
    totalLabel: 'Fizetett összeg',
    vatNote: 'Az összeg a 21% holland áfát tartalmazza. A számlát külön e-mailben küldjük.',
    paidAtLabel: 'Fizetés dátuma',
  },

  published: {
    subject: (ref: string) => `Hirdetése élesedett (#${ref})`,
    preheader: `A hirdetés mostantól látható a ${SITE_HOST} oldalon.`,
    heading: 'Hirdetése mostantól élő',
    body: (title: string, ref: string) =>
      `A(z) „${title}” (#${ref}) hirdetése megjelent a ${SITE_HOST} oldalon, és nyolc ország vásárlói számára elérhető.`,
    cta: 'Hirdetés megtekintése',
    next: 'Ha valaki érdeklődik, azonnal e-mailt küldünk Önnek az érdeklődő adataival. A hirdetés állapotát bármikor megnézheti a portálon.',
  },

  newEnquiry: {
    subject: (ref: string) => `Új érdeklődő (#${ref})`,
    preheader: 'Valaki érdeklődik az ingatlana iránt.',
    heading: 'Új érdeklődő a hirdetésére',
    body: (title: string, ref: string) =>
      `A(z) „${title}” (#${ref}) hirdetésére új érdeklődő jelentkezett:`,
    labels: { name: 'Név', email: 'E-mail', phone: 'Telefon' },
    messageTitle: 'Üzenete',
    advice: 'Javasoljuk, hogy két napon belül vegye fel a kapcsolatot az érdeklődővel: a gyors válasz a legfontosabb tényező abban, hogy létrejön-e az adásvétel.',
  },

  passwordReset: {
    subject: 'Jelszó visszaállítása | FINDDOME portál',
    preheader: 'A link egy óráig érvényes.',
    heading: 'Jelszó visszaállítása',
    body: 'Jelszó-visszaállítási kérelmet kaptunk a FINDDOME portál fiókjához. Az alábbi gombra kattintva állíthat be újat.',
    cta: 'Új jelszó beállítása',
    expiry: 'A link egy óráig érvényes, és csak egyszer használható fel.',
    ignore: 'Ha nem Ön kérte a visszaállítást, hagyja figyelmen kívül ezt a levelet. A jelszava változatlan marad, és nem történik semmi.',
  },

  referralRegistered: {
    subject: 'Ajánlását megkaptuk | FINDDOME',
    preheader: 'Munkatársunk hamarosan felveszi a kapcsolatot az Ön által ajánlott személlyel.',
    heading: 'Köszönjük az ajánlást',
    body: (referredName: string) =>
      `Megkaptuk ${referredName} adatait. Munkatársunk felveszi vele a kapcsolatot, és ha a hirdetésfeladás létrejön, az Ön következő hirdetésének díjából 10% kedvezményt írunk jóvá.`,
    note: 'A jóváírás a hirdető fizetése után, kézzel történik. Munkatársunk értesíti Önt, amint elérhető.',
  },

  valuationReceived: {
    heading: 'Értékmeghatározási kérését megkaptuk',
    body: 'Munkatársunk ellenőrzi az ingatlan adatait és az adatalapot, majd e-mailben küldi a tájékoztató, piaci alapú értékmeghatározást.',
  },

  valuationReady: {
    subject: 'Elkészült az értékbecslése | FINDDOME',
    preheader: 'Tájékoztató jellegű becslést készítettünk az Ön ingatlanára.',
    heading: 'Elkészült az értékbecslése',
    body: (range: string) =>
      `A megadott adatok és a hasonló ingatlanok alapján tájékoztató jellegű becslésünk: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Ez a becslés tájékoztató jellegű, nem értékbecslői szakvélemény, és nem helyettesíti a hivatalos ingatlanértékelést. Az összeg ${n} hasonló ingatlan adatai alapján készült.`,
    /** When an admin priced it by hand — there is no comparable count to cite. */
    disclaimer:
      'Ez a becslés tájékoztató jellegű, nem értékbecslői szakvélemény, és nem helyettesíti a hivatalos ingatlanértékelést.',
    cta: 'Hirdesse meg most',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `A megadott adatok alapján a tájékoztató, piaci alapú értékmeghatározás: ${range}.`,
    mid: 'Középérték',
    basis: 'Adatalap',
    rateDate: 'Árfolyam dátuma',
    source: 'Forrás',
    factorsHeading: 'Értéket befolyásoló szempontok',
    dirPlus: 'Értéknövelő',
    dirMinus: 'Értékcsökkentő',
    dirUnsure: 'Bizonytalan',
    visit: 'Gábor helyszíni látogatása',
    judicial: 'Igazságügyi értékbecslés kérése',
  },

  valuationDeclined: {
    subject: 'Az Ön értékbecslési igénye | FINDDOME',
    preheader: 'Munkatársunk személyesen felveszi Önnel a kapcsolatot.',
    heading: 'Köszönjük a megkeresést',
    body: 'A megadott adatok alapján jelenleg nem áll elég összehasonlítható ingatlan a rendelkezésünkre egy megbízható becsléshez. Munkatársunk személyesen felveszi Önnel a kapcsolatot.',
  },

  valuationNeedsInfo: {
    subject: 'Értékbecslés: néhány adatot még kérnénk',
    preheader: 'A becsléshez további információra van szükségünk.',
    heading: 'Néhány adatot még kérnénk',
    body: 'Köszönjük értékbecslési kérését. A becslés elkészítéséhez munkatársunk az alábbiakat kérné Öntől:',
    after: 'Kérjük, válaszoljon erre az e-mailre a hiányzó adatokkal. A becslést az adatok beérkezése után készítjük el.',
  },

  rejected: {
    subject: (ref: string) => `Hirdetését nem tudjuk közzétenni (#${ref})`,
    preheader: 'Az elbírálás eredménye és az indoklás.',
    heading: 'A hirdetést nem tudjuk közzétenni',
    body: (title: string, ref: string) =>
      `Sajnáljuk, a(z) „${title}” (#${ref}) hirdetést munkatársunk az elbírálás után nem hagyta jóvá. Az indoklás:`,
    refund: 'Ha a hirdetésért már fizetett, a visszatérítésről külön felvesszük Önnel a kapcsolatot.',
    after: 'Ha kérdése van, vagy úgy gondolja, hogy félreértés történt, egyszerűen válaszoljon erre az e-mailre.',
  },

  invoiceIssued: {
    subject: (number: string) => `Számla ${number}`,
    preheader: 'A számlát elkészítettük, megtekintheti vagy letöltheti a linken.',
    heading: 'Elkészült a számlája',
    body: (title: string, ref: string, number: string) =>
      `A(z) „${title}” (#${ref}) hirdetéshez kapcsolódó ${number} számú számlát elkészítettük.`,
    cta: 'Számla megtekintése',
  },

  creditNoteIssued: {
    subject: (number: string) => `Jóváíró számla ${number}`,
    preheader: 'Jóváíró számlát állítottunk ki a korábbi számlájához.',
    heading: 'Jóváíró számla készült',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `A(z) „${title}” (#${ref}) hirdetéshez kiállított ${correctsNumber} számú számlához ${number} számú jóváíró számlát készítettünk.`,
    cta: 'Jóváíró számla megtekintése',
  },

  serviceRequested: {
    subject: 'Megkaptuk szolgáltatásigényét | FINDDOME',
    preheader: 'Munkatársunk felveszi Önnel a kapcsolatot az időpont egyeztetéséhez.',
    heading: 'Megkaptuk az igényét',
    body: (service: string, price: string) => `Köszönjük, rögzítettük az igényét: ${service} (${price}).`,
    next: 'Munkatársunk felveszi Önnel a kapcsolatot az időpont egyeztetéséhez.',
    payment: 'A díj rendezéséről az egyeztetéskor tájékoztatjuk. Most nem kell fizetnie semmit.',
    cancel: 'Ha meggondolta magát, egyszerűen válaszoljon erre az e-mailre.',
  },

  valuationPaid: {
    subject: 'Fizetési visszaigazolás | FINDDOME értékbecslés',
    preheader: 'Köszönjük, a fizetés megérkezett.',
    heading: 'Köszönjük, a fizetés megérkezett',
    body: (service: string) => `Megkaptuk a(z) „${service}” díját.`,
    orderTitle: 'Tétel',
    totalLabel: 'Fizetett összeg',
    paidAtLabel: 'Fizetés dátuma',
    next: 'Munkatársunk hamarosan felveszi Önnel a kapcsolatot a további lépésekről.',
    invoice: 'Ha számlára van szüksége, egyszerűen válaszoljon erre az e-mailre.',
  },

  judicialRequested: {
    subject: 'Hivatalos értékbecslési igény | FINDDOME',
    preheader: 'Munkatársunk felveszi Önnel a kapcsolatot a lehetőségekről.',
    heading: 'Megkaptuk kérését',
    body: 'Köszönjük, rögzítettük, hogy hivatalos (igazságügyi) szakértői értékbecslést szeretne. Ez nem azonos az oldalunkon kérhető tájékoztató, piaci alapú értékmeghatározással: erre jogosult szakértő végzi, egyedi árajánlat alapján.',
    next: 'Munkatársunk felveszi Önnel a kapcsolatot a lehetőségekről és az árajánlatról.',
  },

  adminServiceRequested: {
    subject: (service: string) => `Új szolgáltatásigény: ${service}`,
    preheader: 'Egyeztessen időpontot az ügyféllel.',
    heading: 'Új szolgáltatásigény érkezett',
    labels: {
      service: 'Szolgáltatás',
      name: 'Név',
      email: 'E-mail',
      phone: 'Telefon',
      where: 'Honnan',
      note: 'Megjegyzés',
    },
    sources: {
      submit_form: 'Hirdetésfeladási űrlap',
      listing_editor: 'Hirdetésszerkesztő',
      valuation: 'Értékbecslés',
      admin: 'Admin',
    } as Record<string, string>,
    cta: 'Megnyitás a portálon',
  },

  referralAdminNotice: {
    subject: (referrerName: string) => `Új ajánlás: ${referrerName}`,
    preheader: 'Új ajánlói lead érkezett a honlapról.',
    heading: 'Új ajánlás érkezett',
    labels: {
      referrerName: 'Ajánló neve',
      referrerEmail: 'Ajánló e-mail',
      referredName: 'Ajánlott neve',
      referredEmail: 'Ajánlott e-mail',
    },
    advice: 'Vegye fel a kapcsolatot az ajánlott személlyel, és ha hirdetést ad fel, jegyezze fel az ajánlót a jóváíráshoz.',
  },
};
// Deliberately not `as const`: this object's *shape* is the contract that
// nl.ts is checked against. Literal types would make that check demand
// identical strings in both languages, which is the opposite of the point.

/** The admin notices go to the office, which reads Hungarian in every case. */
export const ADMIN_EMAIL_KEYS = ['adminNewSubmission', 'adminServiceRequested', 'referralAdminNotice'] as const;

/** What a recipient-facing language must provide: everything except the office notices. */
export type PublicEmailCopy = Omit<typeof HU, (typeof ADMIN_EMAIL_KEYS)[number]>;
