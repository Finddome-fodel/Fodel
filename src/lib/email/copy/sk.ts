/**
 * Texty e-mailov v slovenčine (vykanie; v osobnej korešpondencii s veľkým
 * začiatočným písmenom: Vy, Váš, Vám). Kompilátor ich kontroluje voči
 * maďarskému súboru (`satisfies PublicEmailCopy`): ak šablóna chýba, tento
 * súbor sa neskompiluje a nikto nedostane e-mail po maďarsky ani po
 * holandsky. Upozornenia pre kanceláriu (admin*) zostávajú v maďarčine a nie
 * sú tu.
 *
 * Tón: vecný, krátke vety, bez výkričníkov. Mnohí predávajúci sú dôchodcovia:
 * zrozumiteľnosť pred srdečnosťou, obe pred reklamným tónom. Úvodzovky „…“,
 * bez medzery pred „:“ a „?“.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';
import { nOf } from '~/i18n/plural';

export const SK = {
  common: {
    greeting: (name: string) => `Dobrý deň, ${name},`,
    greetingNoName: 'Dobrý deň,',
    signOff: 'S pozdravom\nFINDDOME Nehnuteľnosti',
    questions: 'Máte otázky? Stačí odpovedať na tento e-mail.',
    linkFallback: 'Tlačidlo nefunguje? Skopírujte túto adresu do prehliadača:',
  },

  registrationConfirm: {
    subject: 'Nastavte si heslo | FINDDOME',
    preheader: 'Jedno kliknutie a môžete si pripraviť inzerát.',
    heading: 'Nastavte si heslo',
    intro: 'Ďakujeme za registráciu. Váš účet je takmer pripravený, chýba už len heslo.',
    cta: 'Nastaviť heslo',
    next: 'Potom budete rovno pokračovať inzerátom: balík, údaje, fotografie. Pozrieme sa naň až vtedy, keď nám ho odošlete.',
    expiry: 'Odkaz platí 7 dní. Ak ste sa neregistrovali Vy, tento e-mail ignorujte: žiadny účet sa nevytvorí.',
  },

  accountExists: {
    subject: 'Vo FINDDOME už máte účet',
    preheader: 'Prihláste sa alebo si nastavte nové heslo.',
    heading: 'K tejto adrese už účet existuje',
    body: 'Niekto sa práve pokúsil zaregistrovať na stránke FINDDOME s touto e-mailovou adresou. Keďže k nej už účet existuje, nový sme nevytvorili.',
    cta: 'Prihlásiť sa',
    reset: 'Zabudli ste heslo? Vyžiadajte si nové',
    ignore: 'Neboli ste to Vy? Nemusíte nič robiť: Váš účet zostáva bez zmeny.',
  },

  invite: {
    subject: 'Pozvánka do portálu FINDDOME',
    preheader: 'Nastavte si heslo a prihláste sa do sekcie pre inzerentov.',
    heading: 'Pozývame Vás do portálu FINDDOME',
    body: (role: string) =>
      `FINDDOME Vás pozýva do portálu ${role}; v ňom sa spravujú inzeráty nehnuteľností.`,
    roleAdmin: 'ako administrátora',
    roleOwner: 'ako inzerenta',
    cta: 'Prijať pozvánku',
    expiry: 'Odkaz platí 7 dní a dá sa použiť iba raz.',
  },

  welcome: {
    subject: 'Vitajte v portáli FINDDOME',
    preheader: 'Váš účet je aktívny. Takto pridáte prvý inzerát.',
    heading: (name: string) => `Vitajte, ${name}`,
    body: 'Váš účet je aktívny. V portáli si pripravíte inzerát, nahráte fotografie a môžete sledovať jeho kontrolu.',
    stepsTitle: 'Čo budete potrebovať',
    steps: [
      'Fotografie nehnuteľnosti: aspoň jednu, ale čím viac, tým lepšie',
      'Základné údaje: obytná plocha, výmera pozemku, požadovaná cena',
      'Niekoľko viet o tom, čím je nehnuteľnosť výnimočná',
    ],
    cta: 'Prejsť do portálu',
  },

  submissionReceived: {
    subject: (ref: string) => `Dostali sme Váš inzerát (#${ref})`,
    preheader: 'Skontrolujeme ho a odpovieme Vám e-mailom.',
    heading: 'Váš inzerát k nám dorazil',
    body: (title: string, ref: string) =>
      `Dostali sme Váš inzerát „${title}“ (#${ref}). Náš kolega ho skontroluje a o rozhodnutí Vás budeme informovať e-mailom.`,
    timing: 'Kontrola zvyčajne netrvá dlhšie ako dva pracovné dni.',
    note: 'Počas kontroly nemôžete inzerát upravovať. Ak Vás požiadame o zmenu, úpravy sa hneď znova odomknú.',
  },

  changesRequested: {
    subject: (ref: string) => `Potrebná zmena (#${ref})`,
    preheader: 'Jedna drobná zmena a inzerát môže ísť online.',
    heading: 'Prosíme Vás o zmenu',
    body: (title: string, ref: string) =>
      `K Vášmu inzerátu „${title}“ (#${ref}) má náš kolega túto poznámku:`,
    after: 'Inzerát je opäť možné upravovať. Urobte zmenu a odošlite ho znova; ďalej už všetko pôjde ako obvykle.',
    cta: 'Upraviť inzerát',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Schválené (#${ref}): zostáva už len platba`,
    preheader: 'Váš inzerát je schválený a zverejníme ho hneď po prijatí platby.',
    heading: 'Váš inzerát je schválený',
    body: (title: string, ref: string) =>
      `Dobrá správa: Váš inzerát „${title}“ (#${ref}) sme skontrolovali a schválili. Zostáva už len platba. Hneď ako dorazí, inzerát zverejníme.`,
    orderTitle: 'Cena inzerátu',
    discountLabel: 'Zľava za odporúčanie (10 %)',
    totalLabel: 'Na úhradu',
    ctaCard: 'Zaplatiť kartou',
    cardNote: 'Platba prebieha v zabezpečenom prostredí Stripe. FINDDOME údaje o Vašej karte nevidí ani neuchováva.',
    bankTitle: 'Alebo bankovým prevodom',
    bankNote: (ref: string) =>
      `Pri prevode uveďte referenciu: ${ref}. Hneď ako prevod dorazí, náš kolega inzerát zverejní.`,
    vatNote: 'Všetky uvedené sumy zahŕňajú 21 % holandskú DPH.',
  },

  approvedPublished: {
    subject: (ref: string) => `Schválené a zverejnené (#${ref})`,
    preheader: 'Váš inzerát je už online; poplatok uhraďte do 14 dní.',
    heading: 'Váš inzerát je online',
    body: (title: string, ref: string) => `Inzerát „${title}“ (#${ref}) sme schválili a hneď zverejnili.`,
    viewCta: 'Zobraziť inzerát',
    orderTitle: 'Cena inzerátu',
    discountLabel: 'Zľava za odporúčanie (10 %)',
    totalLabel: 'Na úhradu',
    dueLabel: 'Splatné do',
    ctaCard: 'Zaplatiť kartou',
    cardNote: 'Platba prebieha v zabezpečenom prostredí Stripe. FINDDOME údaje o Vašej karte nevidí ani neuchováva.',
    bankTitle: 'Bankový prevod',
    bankNote: (ref: string) => `Pri prevode uveďte referenciu: ${ref}.`,
    vatNote: 'Všetky uvedené sumy zahŕňajú 21 % holandskú DPH.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Potvrdenie platby (#${ref})`,
    preheader: 'Ďakujeme, Vaša platba k nám dorazila.',
    heading: 'Ďakujeme, Vaša platba dorazila',
    body: (title: string, ref: string) =>
      `Prijali sme platbu za inzerát „${title}“ (#${ref}). Inzerát je online a viditeľný na ${SITE_HOST}.`,
    orderTitle: 'Podrobnosti',
    discountLabel: 'Zľava za odporúčanie (10 %)',
    totalLabel: 'Zaplatená suma',
    vatNote: 'Suma zahŕňa 21 % holandskú DPH. Faktúru dostanete v samostatnom e-maile.',
    paidAtLabel: 'Dátum platby',
  },

  published: {
    subject: (ref: string) => `Váš inzerát je online (#${ref})`,
    preheader: `Inzerát je teraz viditeľný na ${SITE_HOST}.`,
    heading: 'Váš inzerát je online',
    body: (title: string, ref: string) =>
      `Váš inzerát „${title}“ (#${ref}) je na ${SITE_HOST} a oslovuje kupujúcich v ôsmich krajinách.`,
    cta: 'Zobraziť inzerát',
    next: 'Hneď ako niekto prejaví záujem, pošleme Vám e-mail s jeho kontaktnými údajmi. Stav inzerátu si môžete kedykoľvek pozrieť v portáli.',
  },

  newEnquiry: {
    subject: (ref: string) => `Nový dopyt (#${ref})`,
    preheader: 'Niekto má záujem o Vašu nehnuteľnosť.',
    heading: 'Nová reakcia na Váš inzerát',
    body: (title: string, ref: string) =>
      `Niekto reagoval na Váš inzerát „${title}“ (#${ref}):`,
    labels: { name: 'Meno', email: 'E-mail', phone: 'Telefón' },
    messageTitle: 'Správa',
    advice: 'Ozvite sa tejto osobe najlepšie do dvoch dní: rýchla odpoveď je zďaleka najdôležitejší faktor, od ktorého závisí, či sa predaj podarí.',
  },

  passwordReset: {
    subject: 'Obnovenie hesla | Portál FINDDOME',
    preheader: 'Odkaz platí jednu hodinu.',
    heading: 'Obnovenie hesla',
    body: 'Dostali sme žiadosť o obnovenie hesla k Vášmu účtu v portáli FINDDOME. Nové heslo si nastavíte kliknutím na tlačidlo nižšie.',
    cta: 'Nastaviť nové heslo',
    expiry: 'Odkaz platí jednu hodinu a dá sa použiť iba raz.',
    ignore: 'Túto žiadosť ste neposlali Vy? Tento e-mail ignorujte. Vaše heslo zostane bez zmeny a nič sa nestane.',
  },

  referralRegistered: {
    subject: 'Dostali sme Vaše odporúčanie | FINDDOME',
    preheader: 'Náš kolega čoskoro osloví odporučenú osobu.',
    heading: 'Ďakujeme za odporúčanie',
    body: (referredName: string) =>
      `Dostali sme kontaktné údaje odporučenej osoby (${referredName}). Náš kolega ju osloví a hneď ako podá inzerát, odpočítame 10 % z ceny Vášho ďalšieho inzerátu.`,
    note: 'Zľavu uplatňujeme ručne, po tom, ako odporučená osoba inzerát zaplatí. Náš kolega Vám dá vedieť, hneď ako to bude možné.',
  },

  valuationReceived: {
    heading: 'Dostali sme Vašu žiadosť o odhad ceny',
    body: 'Náš kolega skontroluje údaje o nehnuteľnosti a našu databázu a potom Vám e-mailom pošle orientačný odhad založený na trhu.',
  },

  valuationReady: {
    subject: 'Váš odhad ceny je hotový | FINDDOME',
    preheader: 'Pripravili sme orientačný odhad ceny Vašej nehnuteľnosti.',
    heading: 'Váš odhad ceny je hotový',
    body: (range: string) =>
      `Na základe poskytnutých údajov a porovnateľných nehnuteľností je náš orientačný odhad: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Tento odhad je orientačný: nie je to znalecký posudok a nenahrádza ho. Vychádza z ${nOf('sk', n, 'porovnateľnej nehnuteľnosti', 'porovnateľných nehnuteľností')}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Tento odhad je orientačný: nie je to znalecký posudok a nenahrádza ho.',
    cta: 'Podať inzerát',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Na základe poskytnutých údajov je orientačná trhová hodnota: ${range}.`,
    mid: 'Stredná hodnota',
    basis: 'Databáza',
    rateDate: 'Dátum výmenného kurzu',
    source: 'Zdroj',
    factorsHeading: 'Faktory',
    dirPlus: 'Zvyšuje hodnotu',
    dirMinus: 'Znižuje hodnotu',
    dirUnsure: 'Neisté',
    visit: 'Objednať návštevu Gábora',
    judicial: 'Objednať znalecký posudok',
  },

  valuationDeclined: {
    subject: 'Vaša žiadosť o odhad ceny | FINDDOME',
    preheader: 'Náš kolega sa Vám ozve osobne.',
    heading: 'Ďakujeme za Vašu žiadosť',
    body: 'Na základe poskytnutých údajov máme momentálne príliš málo porovnateľných nehnuteľností na spoľahlivý odhad. Náš kolega sa Vám ozve osobne.',
  },

  valuationNeedsInfo: {
    subject: 'Odhad ceny: chýba nám niekoľko údajov',
    preheader: 'Na odhad potrebujeme o niečo viac informácií.',
    heading: 'Chýba nám niekoľko údajov',
    body: 'Ďakujeme za žiadosť o odhad ceny. Aby sme ho mohli pripraviť, náš kolega Vás prosí o tieto informácie:',
    after: 'Odpovedzte na tento e-mail a doplňte chýbajúce údaje. Hneď ako ich dostaneme, odhad pripravíme.',
  },

  rejected: {
    subject: (ref: string) => `Váš inzerát nemožno zverejniť (#${ref})`,
    preheader: 'Výsledok kontroly a zdôvodnenie.',
    heading: 'Inzerát nemôžeme zverejniť',
    body: (title: string, ref: string) =>
      `Je nám ľúto, ale náš kolega po kontrole Váš inzerát „${title}“ (#${ref}) neschválil. Zdôvodnenie:`,
    refund: 'Inzerát ste už zaplatili? O vrátení peňazí Vás budeme kontaktovať samostatne.',
    after: 'Máte otázky alebo máte dojem, že ide o nedorozumenie? Stačí odpovedať na tento e-mail.',
  },

  invoiceIssued: {
    subject: (number: string) => `Faktúra ${number}`,
    preheader: 'Faktúra je pripravená; cez odkaz si ju môžete pozrieť alebo stiahnuť.',
    heading: 'Vaša faktúra je pripravená',
    body: (title: string, ref: string, number: string) =>
      `Faktúra ${number} k Vášmu inzerátu „${title}“ (#${ref}) je pripravená.`,
    cta: 'Zobraziť faktúru',
  },

  creditNoteIssued: {
    subject: (number: string) => `Dobropis ${number}`,
    preheader: 'K Vašej predchádzajúcej faktúre sme vystavili dobropis.',
    heading: 'Dobropis je pripravený',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `K faktúre ${correctsNumber} za Váš inzerát „${title}“ (#${ref}) sme vystavili dobropis ${number}.`,
    cta: 'Zobraziť dobropis',
  },

  serviceRequested: {
    subject: 'Dostali sme Vašu objednávku | FINDDOME',
    preheader: 'Náš kolega Vás bude kontaktovať, aby dohodol termín.',
    heading: 'Dostali sme Vašu objednávku',
    body: (service: string, price: string) => `Ďakujeme, Vašu objednávku sme zaznamenali: ${service} (${price}).`,
    next: 'Náš kolega Vás bude kontaktovať, aby dohodol termín.',
    payment: 'O platbe Vás budeme informovať pri dohadovaní termínu. Zatiaľ nič neplatíte.',
    cancel: 'Rozmysleli ste si to? Stačí odpovedať na tento e-mail.',
  },

  valuationPaid: {
    subject: 'Potvrdenie platby | Odhad ceny FINDDOME',
    preheader: 'Ďakujeme, Vaša platba dorazila.',
    heading: 'Ďakujeme, Vaša platba dorazila',
    body: (service: string) => `Prijali sme platbu za službu „${service}“.`,
    orderTitle: 'Položka',
    totalLabel: 'Zaplatená suma',
    paidAtLabel: 'Zaplatené dňa',
    next: 'Náš kolega Vás čoskoro bude kontaktovať ohľadom ďalších krokov.',
    invoice: 'Potrebujete faktúru? Stačí odpovedať na tento e-mail.',
  },

  judicialRequested: {
    subject: 'Objednávka znaleckého posudku | FINDDOME',
    preheader: 'Náš kolega Vás bude kontaktovať ohľadom možností.',
    heading: 'Dostali sme Vašu objednávku',
    body: 'Ďakujeme, zaznamenali sme, že máte záujem o znalecký posudok (aj na súdne účely) vypracovaný znalcom. Líši sa od orientačného odhadu založeného na trhu, ktorý ponúkame na našej stránke: vypracúva ho oprávnený znalec na základe cenovej ponuky.',
    next: 'Náš kolega Vás bude kontaktovať ohľadom možností a cenovej ponuky.',
  },
} satisfies PublicEmailCopy;
