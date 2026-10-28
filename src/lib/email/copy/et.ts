/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Estonian never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const ET = {
  common: {
    greeting: (name: string) => `Tere, ${name}!`,
    greetingNoName: 'Lugupeetud kuulutaja!',
    signOff: 'Lugupidamisega\nFINDDOME Kinnisvara',
    questions: 'Kui teil on küsimusi, vastake lihtsalt sellele kirjale.',
    linkFallback: 'Kui nupp ei tööta, kopeerige see aadress brauserisse:',
  },

  registrationConfirm: {
    subject: 'Määrake oma parool | FINDDOME',
    preheader: 'Üks klõps ja saate oma kuulutuse koostada.',
    heading: 'Määrake oma parool',
    intro: 'Täname registreerumast. Teie konto on peaaegu valmis, puudu on ainult parool.',
    cta: 'Määra parool',
    next: 'Seejärel saate kohe kuulutusega jätkata: pakett, andmed, fotod. Vaatame selle üle alles pärast esitamist.',
    expiry: 'Link kehtib 7 päeva. Kui te ise ei registreerunud, võite selle kirja tähelepanuta jätta: kontot ei looda.',
  },

  accountExists: {
    subject: 'Teil on juba FINDDOME’i konto',
    preheader: 'Logige sisse või määrake uus parool.',
    heading: 'Sellel aadressil on juba konto',
    body: 'Keegi püüdis äsja selle e-posti aadressiga FINDDOME’i veebisaidil registreeruda. Sellele aadressile on juba konto olemas, seega uut me ei loonud.',
    cta: 'Logi sisse',
    reset: 'Unustasite parooli? Taotlege uus',
    ignore: 'Kui see ei olnud teie, ei pea te midagi tegema: teie konto jääb muutmata.',
  },

  invite: {
    subject: 'Kutse FINDDOME’i portaali',
    preheader: 'Määrake parool ja logige sisse kuulutajate portaali.',
    heading: 'Teid on kutsutud FINDDOME’i portaali',
    body: (role: string) =>
      `FINDDOME kutsub teid portaali ${role}, kus haldate kinnisvarakuulutusi.`,
    roleAdmin: 'administraatorina',
    roleOwner: 'kuulutajana',
    cta: 'Võta kutse vastu',
    expiry: 'Link kehtib 7 päeva ja seda saab kasutada ühe korra.',
  },

  welcome: {
    subject: 'Tere tulemast FINDDOME’i portaali',
    preheader: 'Teie konto on aktiivne. Nii lisate oma esimese kuulutuse.',
    heading: (name: string) => `Tere tulemast, ${name}`,
    body: 'Teie konto on aktiivne. Portaalis panete kuulutuse kokku, laadite üles fotod ja jälgite ülevaatust.',
    stepsTitle: 'Mida vajate',
    steps: [
      'Fotod kinnisvarast: vähemalt üks, kuid mida rohkem, seda parem',
      'Põhiandmed: pind, krundi suurus, küsitav hind',
      'Paar lauset sellest, mis teeb kinnisvara eriliseks',
    ],
    cta: 'Mine portaali',
  },

  submissionReceived: {
    subject: (ref: string) => `Oleme teie kuulutuse kätte saanud (#${ref})`,
    preheader: 'Vaatame selle üle ja anname teile e-posti teel teada.',
    heading: 'Teie kuulutus on kätte saadud',
    body: (title: string, ref: string) =>
      `Oleme teie kuulutuse „${title}“ (#${ref}) kätte saanud. Keegi meie meeskonnast vaatab selle üle ja niipea kui otsus on tehtud, saate e-kirja.`,
    timing: 'Ülevaatus võtab tavaliselt kõige rohkem kaks tööpäeva.',
    note: 'Ülevaatuse ajal ei saa te kuulutust muuta. Kui palume muudatust, avaneb see kohe uuesti.',
  },

  changesRequested: {
    subject: (ref: string) => `Vaja on muudatust (#${ref})`,
    preheader: 'Üks väike muudatus ja kuulutuse saab avaldada.',
    heading: 'Palume teil teha muudatuse',
    body: (title: string, ref: string) =>
      `Meie meeskonnal on teie kuulutuse „${title}“ (#${ref}) kohta järgmine märkus:`,
    after: 'Kuulutust saab jälle muuta. Tehke muudatus ja esitage see uuesti; protsess jätkub siis tavapäraselt.',
    cta: 'Muuda kuulutust',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Kinnitatud (#${ref}): jäänud on vaid makse`,
    preheader: 'Teie kuulutus on kinnitatud ja avaldatakse kohe, kui makse laekub.',
    heading: 'Teie kuulutus on kinnitatud',
    body: (title: string, ref: string) =>
      `Head uudised: vaatasime teie kuulutuse „${title}“ (#${ref}) üle ja kinnitasime selle. Jäänud on vaid makse. Niipea kui see laekub, avaldatakse kuulutus kohe.`,
    orderTitle: 'Kuulutuse hind',
    discountLabel: 'Soovitusallahindlus (10%)',
    totalLabel: 'Tasuda',
    ctaCard: 'Maksa kaardiga',
    cardNote: 'Makse toimub Stripe’i turvalises keskkonnas. FINDDOME ei näe ega salvesta teie kaardiandmeid.',
    bankTitle: 'Või pangaülekandega',
    bankNote: (ref: string) =>
      `Märkige ülekandele viitenumber: ${ref}. Niipea kui makse laekub, avaldab keegi meie meeskonnast kuulutuse.`,
    vatNote: 'Kõik summad sisaldavad Hollandi 21% käibemaksu.',
  },

  approvedPublished: {
    subject: (ref: string) => `Kinnitatud ja avaldatud (#${ref})`,
    preheader: 'Teie kuulutus on juba avaldatud; palun tasuge kuulutuse tasu 14 päeva jooksul.',
    heading: 'Teie kuulutus on nüüd avaldatud',
    body: (title: string, ref: string) => `Kinnitasime kuulutuse „${title}“ (#${ref}) ja avaldasime selle kohe.`,
    viewCta: 'Vaata kuulutust',
    orderTitle: 'Kuulutuse hind',
    discountLabel: 'Soovitusallahindlus (10%)',
    totalLabel: 'Tasuda',
    dueLabel: 'Tasuda hiljemalt',
    ctaCard: 'Maksa kaardiga',
    cardNote: 'Makse toimub Stripe’i turvalises keskkonnas. FINDDOME ei näe ega salvesta teie kaardiandmeid.',
    bankTitle: 'Pangaülekanne',
    bankNote: (ref: string) => `Märkige ülekandele viitenumber: ${ref}.`,
    vatNote: 'Kõik summad sisaldavad Hollandi 21% käibemaksu.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Makse kinnitus (#${ref})`,
    preheader: 'Täname, oleme teie makse kätte saanud.',
    heading: 'Täname, teie makse on laekunud',
    body: (title: string, ref: string) =>
      `Oleme kuulutuse „${title}“ (#${ref}) eest makse kätte saanud. Kuulutus on avaldatud ja nähtav saidil ${SITE_HOST}.`,
    orderTitle: 'Jaotus',
    discountLabel: 'Soovitusallahindlus (10%)',
    totalLabel: 'Makstud summa',
    vatNote: 'Summa sisaldab Hollandi 21% käibemaksu. Arve saadame teile eraldi e-kirjaga.',
    paidAtLabel: 'Makse kuupäev',
  },

  published: {
    subject: (ref: string) => `Teie kuulutus on avaldatud (#${ref})`,
    preheader: `Kuulutus on nüüd nähtav saidil ${SITE_HOST}.`,
    heading: 'Teie kuulutus on avaldatud',
    body: (title: string, ref: string) =>
      `Teie kuulutus „${title}“ (#${ref}) on saidil ${SITE_HOST} ja jõuab ostjateni kaheksas riigis.`,
    cta: 'Vaata kuulutust',
    next: 'Niipea kui keegi huvi tunneb, saadame teile kohe tema andmed e-postiga. Portaalis näete alati oma kuulutuse olekut.',
  },

  newEnquiry: {
    subject: (ref: string) => `Uus päring (#${ref})`,
    preheader: 'Keegi tunneb huvi teie kinnisvara vastu.',
    heading: 'Uus vastus teie kuulutusele',
    body: (title: string, ref: string) =>
      `Keegi vastas teie kuulutusele „${title}“ (#${ref}):`,
    labels: { name: 'Nimi', email: 'E-post', phone: 'Telefon' },
    messageTitle: 'Sõnum',
    advice: 'Võtke võimaluse korral ühendust kahe päeva jooksul: kiire vastus on müügi toimumisel kaugelt kõige olulisem tegur.',
  },

  passwordReset: {
    subject: 'Lähtestage parool | FINDDOME’i portaal',
    preheader: 'Link kehtib ühe tunni.',
    heading: 'Lähtestage oma parool',
    body: 'Saime taotluse lähtestada teie FINDDOME’i portaali konto parool. Uue parooli määramiseks klõpsake allolevat nuppu.',
    cta: 'Määra uus parool',
    expiry: 'Link kehtib ühe tunni ja seda saab kasutada ühe korra.',
    ignore: 'Kui te seda ei taotlenud, eirake seda e-kirja. Teie parool jääb samaks ja midagi ei juhtu.',
  },

  referralRegistered: {
    subject: 'Oleme teie soovituse kätte saanud | FINDDOME',
    preheader: 'Keegi meie meeskonnast võtab peagi ühendust teie soovitatud isikuga.',
    heading: 'Täname soovituse eest',
    body: (referredName: string) =>
      `Oleme saanud isiku ${referredName} andmed. Keegi meie meeskonnast võtab temaga ühendust ja kui kuulutus on avaldatud, kanname teile järgmise kuulutuse hinnast 10% soodustust.`,
    note: 'Soodustus kantakse käsitsi, pärast seda kui kuulutaja on maksnud. Anname teile teada kohe, kui see on võimalik.',
  },

  valuationReceived: {
    heading: 'Oleme teie hindamissoovi kätte saanud',
    body: 'Keegi meie meeskonnast kontrollib kinnisvara andmeid ja andmebaasi ning saadab teile seejärel e-postiga ligikaudse turupõhise hinnangu.',
  },

  valuationReady: {
    subject: 'Teie hinnang on valmis | FINDDOME',
    preheader: 'Oleme teie kinnisvarale teinud ligikaudse hinnangu.',
    heading: 'Teie hinnang on valmis',
    body: (range: string) =>
      `Esitatud andmete ja võrreldava kinnisvara põhjal on meie ligikaudne hinnang: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `See hinnang on ligikaudne, ei ole hindamisaruanne ega asenda ametlikku hindamist. Võrreldavaid kinnisvaraobjekte: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'See hinnang on ligikaudne, ei ole hindamisaruanne ega asenda ametlikku hindamist.',
    cta: 'Avalda kuulutus kohe',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Esitatud andmete põhjal on ligikaudne turuväärtus: ${range}.`,
    mid: 'Keskmine',
    basis: 'Andmebaas',
    rateDate: 'Vahetuskursi kuupäev',
    source: 'Allikas',
    factorsHeading: 'Tegurid',
    dirPlus: 'Tõstab väärtust',
    dirMinus: 'Langetab väärtust',
    dirUnsure: 'Ebakindel',
    visit: 'Kutsuge Gábor kohale',
    judicial: 'Tellige ametlik hindamine',
  },

  valuationDeclined: {
    subject: 'Teie hindamissoov | FINDDOME',
    preheader: 'Keegi meie meeskonnast võtab teiega isiklikult ühendust.',
    heading: 'Täname teid päringu eest',
    body: 'Esitatud andmete põhjal on meil praegu usaldusväärse hinnangu jaoks liiga vähe võrreldavat kinnisvara. Keegi meie meeskonnast võtab teiega isiklikult ühendust.',
  },

  valuationNeedsInfo: {
    subject: 'Hindamine: vajame veel mõnda andmet',
    preheader: 'Hinnangu jaoks vajame veidi rohkem teavet.',
    heading: 'Vajame veel mõnda andmet',
    body: 'Täname hindamissoovi eest. Hinnangu jaoks palub keegi meie meeskonnast teilt järgmist:',
    after: 'Vastake sellele e-kirjale puuduvate andmetega. Niipea kui need on meil olemas, teeme hinnangu.',
  },

  rejected: {
    subject: (ref: string) => `Teie kuulutust ei saa avaldada (#${ref})`,
    preheader: 'Ülevaatuse tulemus ja selgitus.',
    heading: 'Me ei saa kuulutust avaldada',
    body: (title: string, ref: string) =>
      `Kahjuks ei kinnitanud meie meeskond pärast ülevaatust teie kuulutust „${title}“ (#${ref}). Selgitus:`,
    refund: 'Kui olete kuulutuse eest juba maksnud, võtame raha tagastamise asjus teiega eraldi ühendust.',
    after: 'Kui teil on küsimusi või arvate, et tegemist on arusaamatusega, vastake lihtsalt sellele e-kirjale.',
  },

  invoiceIssued: {
    subject: (number: string) => `Arve ${number}`,
    preheader: 'Arve on valmis; saate seda lingi kaudu vaadata või alla laadida.',
    heading: 'Teie arve on valmis',
    body: (title: string, ref: string, number: string) =>
      `Arve ${number} teie kuulutuse „${title}“ (#${ref}) eest on valmis.`,
    cta: 'Vaata arvet',
  },

  creditNoteIssued: {
    subject: (number: string) => `Kreeditarve ${number}`,
    preheader: 'Oleme teie varasemale arvele väljastanud kreeditarve.',
    heading: 'Kreeditarve on valmis',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Oleme väljastanud kreeditarve ${number} arvele ${correctsNumber} teie kuulutuse „${title}“ (#${ref}) eest.`,
    cta: 'Vaata kreeditarvet',
  },

  serviceRequested: {
    subject: 'Oleme teie päringu kätte saanud | FINDDOME',
    preheader: 'Keegi meie meeskonnast võtab teiega aja kokkuleppimiseks ühendust.',
    heading: 'Oleme teie päringu kätte saanud',
    body: (service: string, price: string) => `Täname, oleme teie päringu kirja pannud: ${service} (${price}).`,
    next: 'Keegi meie meeskonnast võtab teiega aja kokkuleppimiseks ühendust.',
    payment: 'Makse kohta anname teada, kui aja kokku lepime. Praegu te midagi ei maksa.',
    cancel: 'Kas mõtlesite ümber? Vastake lihtsalt sellele e-kirjale.',
  },

  valuationPaid: {
    subject: 'Makse kinnitus | FINDDOME’i hindamine',
    preheader: 'Täname, teie makse on laekunud.',
    heading: 'Täname, teie makse on laekunud',
    body: (service: string) => `Oleme saanud makse teenuse „${service}“ eest.`,
    orderTitle: 'Kirje',
    totalLabel: 'Makstud summa',
    paidAtLabel: 'Makstud',
    next: 'Keegi meie meeskonnast võtab peagi teiega edasiste sammude osas ühendust.',
    invoice: 'Vajate arvet? Vastake lihtsalt sellele e-kirjale.',
  },

  judicialRequested: {
    subject: 'Ametliku hindamise taotlus | FINDDOME',
    preheader: 'Keegi meie meeskonnast võtab teiega võimaluste osas ühendust.',
    heading: 'Oleme teie päringu kätte saanud',
    body: 'Täname, panime kirja, et soovite eksperdi ametlikku (kohtu määratud) hindamist. See ei ole sama mis meie veebisaidi ligikaudne turupõhine hinnang: selle teeb volitatud ekspert hinnapakkumise alusel.',
    next: 'Keegi meie meeskonnast võtab teiega võimaluste ja hinnapakkumise osas ühendust.',
  },
} satisfies PublicEmailCopy;
