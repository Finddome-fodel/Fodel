/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Czech never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const CS = {
  common: {
    greeting: (name: string) => `Dobrý den, ${name},`,
    greetingNoName: 'Vážený inzerente,',
    signOff: 'S pozdravem\nFODEL Nemovitosti',
    questions: 'Máte-li dotaz, stačí odpovědět na tento e-mail.',
    linkFallback: 'Pokud tlačítko nefunguje, zkopírujte tuto adresu do prohlížeče:',
  },

  registrationConfirm: {
    subject: 'Nastavte si heslo | FODEL',
    preheader: 'Jedno kliknutí a můžete sestavit svůj inzerát.',
    heading: 'Nastavte si heslo',
    intro: 'Děkujeme za registraci. Váš účet je téměř připraven; chybí už jen heslo.',
    cta: 'Nastavit heslo',
    next: 'Pak můžete rovnou pokračovat s inzerátem: balíček, údaje, fotografie. Podíváme se na něj až po jeho odeslání.',
    expiry: 'Odkaz platí 7 dní. Pokud jste se neregistrovali vy, můžete tento e-mail ignorovat: žádný účet nebude vytvořen.',
  },

  accountExists: {
    subject: 'U FODEL už máte účet',
    preheader: 'Přihlaste se, nebo si nastavte nové heslo.',
    heading: 'K této adrese už účet existuje',
    body: 'Někdo se právě pokusil zaregistrovat na webu FODEL s touto e-mailovou adresou. Protože k ní už účet existuje, nový jsme nevytvořili.',
    cta: 'Přihlásit se',
    reset: 'Zapomněli jste heslo? Vyžádejte si nové',
    ignore: 'Pokud jste to nebyli vy, nemusíte nic dělat: váš účet zůstává beze změny.',
  },

  invite: {
    subject: 'Pozvánka do portálu FODEL',
    preheader: 'Nastavte si heslo a přihlaste se do portálu inzerentů.',
    heading: 'Byli jste pozváni do portálu FODEL',
    body: (role: string) =>
      `FODEL vás zve do portálu ${role}, kde spravujete inzeráty nemovitostí.`,
    roleAdmin: 'jako administrátor',
    roleOwner: 'jako inzerent',
    cta: 'Přijmout pozvánku',
    expiry: 'Odkaz platí 7 dní a lze jej použít jednou.',
  },

  welcome: {
    subject: 'Vítejte v portálu FODEL',
    preheader: 'Váš účet je aktivní. Takto zadáte svůj první inzerát.',
    heading: (name: string) => `Vítejte, ${name}`,
    body: 'Váš účet je aktivní. V portálu sestavíte inzerát, nahrajete fotografie a sledujete jeho kontrolu.',
    stepsTitle: 'Co budete potřebovat',
    steps: [
      'Fotografie nemovitosti: alespoň jedna, ale čím více, tím lépe',
      'Základní údaje: podlahová plocha, velikost pozemku, požadovaná cena',
      'Pár vět o tom, čím je nemovitost výjimečná',
    ],
    cta: 'Přejít do portálu',
  },

  submissionReceived: {
    subject: (ref: string) => `Váš inzerát jsme obdrželi (#${ref})`,
    preheader: 'Prověříme jej a dáme vám vědět e-mailem.',
    heading: 'Váš inzerát byl přijat',
    body: (title: string, ref: string) =>
      `Váš inzerát „${title}“ (#${ref}) jsme obdrželi. Někdo z našeho týmu jej prověří a jakmile bude rozhodnuto, dostanete e-mail.`,
    timing: 'Kontrola obvykle netrvá déle než dva pracovní dny.',
    note: 'Během kontroly nemůžete inzerát upravovat. Pokud vás požádáme o změnu, ihned se znovu otevře.',
  },

  changesRequested: {
    subject: (ref: string) => `Je potřeba změna (#${ref})`,
    preheader: 'Jedna drobná změna a inzerát může být zveřejněn.',
    heading: 'Žádáme vás o úpravu',
    body: (title: string, ref: string) =>
      `Náš tým má k vašemu inzerátu „${title}“ (#${ref}) následující připomínku:`,
    after: 'Inzerát lze opět upravovat. Proveďte změnu a odešlete jej znovu; proces pak jednoduše pokračuje.',
    cta: 'Upravit inzerát',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Schváleno (#${ref}): zbývá jen platba`,
    preheader: 'Váš inzerát je schválen a bude zveřejněn, jakmile dorazí platba.',
    heading: 'Váš inzerát byl schválen',
    body: (title: string, ref: string) =>
      `Dobrá zpráva: váš inzerát „${title}“ (#${ref}) jsme prověřili a schválili. Zbývá jen platba. Jakmile dorazí, inzerát ihned zveřejníme.`,
    orderTitle: 'Cena inzerátu',
    discountLabel: 'Sleva za doporučení (10\u00a0%)',
    totalLabel: 'K úhradě',
    ctaCard: 'Zaplatit kartou',
    cardNote: 'Platba probíhá v zabezpečeném prostředí Stripe. FODEL údaje o vaší kartě nevidí ani neukládá.',
    bankTitle: 'Nebo bankovním převodem',
    bankNote: (ref: string) =>
      `Při převodu uveďte referenční číslo: ${ref}. Jakmile platba dorazí, někdo z našeho týmu inzerát zveřejní.`,
    vatNote: 'Všechny částky zahrnují 21% nizozemské DPH.',
  },

  approvedPublished: {
    subject: (ref: string) => `Schváleno a zveřejněno (#${ref})`,
    preheader: 'Váš inzerát je již zveřejněn; uhraďte prosím poplatek do 14 dnů.',
    heading: 'Váš inzerát je nyní zveřejněn',
    body: (title: string, ref: string) => `Inzerát „${title}“ (#${ref}) jsme schválili a ihned zveřejnili.`,
    viewCta: 'Zobrazit inzerát',
    orderTitle: 'Cena inzerátu',
    discountLabel: 'Sleva za doporučení (10\u00a0%)',
    totalLabel: 'K úhradě',
    dueLabel: 'Uhradit do',
    ctaCard: 'Zaplatit kartou',
    cardNote: 'Platba probíhá v zabezpečeném prostředí Stripe. FODEL údaje o vaší kartě nevidí ani neukládá.',
    bankTitle: 'Bankovní převod',
    bankNote: (ref: string) => `Při převodu uveďte referenční číslo: ${ref}.`,
    vatNote: 'Všechny částky zahrnují 21% nizozemské DPH.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Potvrzení platby (#${ref})`,
    preheader: 'Děkujeme, vaši platbu jsme obdrželi.',
    heading: 'Děkujeme, vaše platba dorazila',
    body: (title: string, ref: string) =>
      `Obdrželi jsme platbu za inzerát „${title}“ (#${ref}). Inzerát je zveřejněn a viditelný na ${SITE_HOST}.`,
    orderTitle: 'Rozpis',
    discountLabel: 'Sleva za doporučení (10\u00a0%)',
    totalLabel: 'Zaplacená částka',
    vatNote: 'Částka zahrnuje 21% nizozemské DPH. Fakturu obdržíte samostatným e-mailem.',
    paidAtLabel: 'Datum platby',
  },

  published: {
    subject: (ref: string) => `Váš inzerát je zveřejněn (#${ref})`,
    preheader: `Inzerát je nyní viditelný na ${SITE_HOST}.`,
    heading: 'Váš inzerát je zveřejněn',
    body: (title: string, ref: string) =>
      `Váš inzerát „${title}“ (#${ref}) je na ${SITE_HOST} a oslovuje kupující v osmi zemích.`,
    cta: 'Zobrazit inzerát',
    next: 'Jakmile někdo projeví zájem, ihned vám pošleme jeho údaje e-mailem. Stav inzerátu vždy uvidíte v portálu.',
  },

  newEnquiry: {
    subject: (ref: string) => `Nový dotaz (#${ref})`,
    preheader: 'Někdo má zájem o vaši nemovitost.',
    heading: 'Nová reakce na váš inzerát',
    body: (title: string, ref: string) =>
      `Někdo reagoval na váš inzerát „${title}“ (#${ref}):`,
    labels: { name: 'Jméno', email: 'E-mail', phone: 'Telefon' },
    messageTitle: 'Zpráva',
    advice: 'Pokud můžete, ozvěte se do dvou dnů: rychlá odpověď je zdaleka nejdůležitějším faktorem, zda k prodeji dojde.',
  },

  passwordReset: {
    subject: 'Obnovení hesla | Portál FODEL',
    preheader: 'Odkaz platí jednu hodinu.',
    heading: 'Obnovte si heslo',
    body: 'Obdrželi jsme žádost o obnovení hesla k vašemu účtu v portálu FODEL. Nové heslo nastavíte kliknutím na tlačítko níže.',
    cta: 'Nastavit nové heslo',
    expiry: 'Odkaz platí jednu hodinu a lze jej použít jednou.',
    ignore: 'Pokud jste o to nežádali, tento e-mail ignorujte. Vaše heslo zůstane beze změny a nic se nestane.',
  },

  referralRegistered: {
    subject: 'Vaše doporučení jsme obdrželi | FODEL',
    preheader: 'Někdo z našeho týmu brzy kontaktuje osobu, kterou jste doporučili.',
    heading: 'Děkujeme za doporučení',
    body: (referredName: string) =>
      `Údaje osoby ${referredName} jsme obdrželi. Někdo z našeho týmu ji kontaktuje, a jakmile bude inzerát zveřejněn, připíšeme vám slevu 10\u00a0% z ceny vašeho dalšího inzerátu.`,
    note: 'Sleva se připisuje ručně, poté co inzerent zaplatí. Dáme vám vědět, jakmile to bude možné.',
  },

  valuationReceived: {
    heading: 'Vaši žádost o ocenění jsme obdrželi',
    body: 'Někdo z našeho týmu zkontroluje údaje o nemovitosti a datový podklad a poté vám e-mailem pošle orientační tržní ocenění.',
  },

  valuationReady: {
    subject: 'Vaše ocenění je připraveno | FODEL',
    preheader: 'Pro vaši nemovitost jsme připravili orientační odhad.',
    heading: 'Vaše ocenění je připraveno',
    body: (range: string) =>
      `Na základě zadaných údajů a srovnatelných nemovitostí je náš orientační odhad: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Tento odhad je orientační, nejde o znalecký posudek a nenahrazuje oficiální ocenění. Počet srovnatelných nemovitostí: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Tento odhad je orientační, nejde o znalecký posudek a nenahrazuje oficiální ocenění.',
    cta: 'Inzerovat nyní',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Na základě zadaných údajů je orientační tržní hodnota: ${range}.`,
    mid: 'Střední hodnota',
    basis: 'Datový podklad',
    rateDate: 'Datum směnného kurzu',
    source: 'Zdroj',
    factorsHeading: 'Faktory',
    dirPlus: 'Zvyšuje hodnotu',
    dirMinus: 'Snižuje hodnotu',
    dirUnsure: 'Nejisté',
    visit: 'Požádat o návštěvu Gábora',
    judicial: 'Požádat o oficiální ocenění',
  },

  valuationDeclined: {
    subject: 'Vaše žádost o ocenění | FODEL',
    preheader: 'Někdo z našeho týmu vás bude osobně kontaktovat.',
    heading: 'Děkujeme za vaši žádost',
    body: 'Na základě zadaných údajů máme v současnosti příliš málo srovnatelných nemovitostí pro spolehlivý odhad. Někdo z našeho týmu vás bude osobně kontaktovat.',
  },

  valuationNeedsInfo: {
    subject: 'Ocenění: potřebujeme ještě několik údajů',
    preheader: 'Pro odhad potřebujeme ještě několik informací.',
    heading: 'Potřebujeme ještě několik údajů',
    body: 'Děkujeme za vaši žádost o ocenění. Pro odhad vás někdo z našeho týmu žádá o následující:',
    after: 'Odpovězte na tento e-mail a doplňte chybějící údaje. Jakmile je budeme mít, odhad připravíme.',
  },

  rejected: {
    subject: (ref: string) => `Váš inzerát nelze zveřejnit (#${ref})`,
    preheader: 'Výsledek kontroly a odůvodnění.',
    heading: 'Inzerát nemůžeme zveřejnit',
    body: (title: string, ref: string) =>
      `Je nám líto: po kontrole náš tým váš inzerát „${title}“ (#${ref}) neschválil. Odůvodnění:`,
    refund: 'Pokud jste již inzerát zaplatili, budeme vás ohledně vrácení peněz kontaktovat zvlášť.',
    after: 'Máte-li dotaz nebo se domníváte, že došlo k nedorozumění, stačí na tento e-mail odpovědět.',
  },

  invoiceIssued: {
    subject: (number: string) => `Faktura ${number}`,
    preheader: 'Faktura je připravena; můžete si ji prohlédnout nebo stáhnout přes odkaz.',
    heading: 'Vaše faktura je připravena',
    body: (title: string, ref: string, number: string) =>
      `Faktura ${number} za váš inzerát „${title}“ (#${ref}) je připravena.`,
    cta: 'Zobrazit fakturu',
  },

  creditNoteIssued: {
    subject: (number: string) => `Dobropis ${number}`,
    preheader: 'K vaší předchozí faktuře jsme vystavili dobropis.',
    heading: 'Dobropis je připraven',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Vystavili jsme dobropis ${number} k faktuře ${correctsNumber} za váš inzerát „${title}“ (#${ref}).`,
    cta: 'Zobrazit dobropis',
  },

  serviceRequested: {
    subject: 'Vaši žádost jsme obdrželi | FODEL',
    preheader: 'Někdo z našeho týmu vás bude kontaktovat kvůli domluvení termínu.',
    heading: 'Vaši žádost jsme obdrželi',
    body: (service: string, price: string) => `Děkujeme, vaši žádost jsme zaznamenali: ${service} (${price}).`,
    next: 'Někdo z našeho týmu vás bude kontaktovat kvůli domluvení termínu.',
    payment: 'O platbě vás budeme informovat při domlouvání termínu. Nyní nic neplatíte.',
    cancel: 'Rozmysleli jste si to? Stačí odpovědět na tento e-mail.',
  },

  valuationPaid: {
    subject: 'Potvrzení platby | Ocenění FODEL',
    preheader: 'Děkujeme, vaše platba dorazila.',
    heading: 'Děkujeme, vaše platba dorazila',
    body: (service: string) => `Obdrželi jsme platbu za „${service}“.`,
    orderTitle: 'Položka',
    totalLabel: 'Zaplacená částka',
    paidAtLabel: 'Zaplaceno dne',
    next: 'Někdo z našeho týmu vás brzy bude kontaktovat ohledně dalších kroků.',
    invoice: 'Potřebujete fakturu? Stačí odpovědět na tento e-mail.',
  },

  judicialRequested: {
    subject: 'Žádost o oficiální ocenění | FODEL',
    preheader: 'Někdo z našeho týmu vás bude kontaktovat ohledně možností.',
    heading: 'Vaši žádost jsme obdrželi',
    body: 'Děkujeme, zaznamenali jsme, že máte zájem o oficiální (soudní) ocenění znalcem. Nejde o totéž co orientační tržní ocenění na našem webu: provádí jej autorizovaný znalec na základě cenové nabídky.',
    next: 'Někdo z našeho týmu vás bude kontaktovat ohledně možností a cenové nabídky.',
  },
} satisfies PublicEmailCopy;
