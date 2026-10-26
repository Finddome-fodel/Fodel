/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in Finnish never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const FI = {
  common: {
    greeting: (name: string) => `Hei ${name},`,
    greetingNoName: 'Hyvä ilmoittaja,',
    signOff: 'Ystävällisin terveisin\nFODEL Kiinteistöt',
    questions: 'Jos sinulla on kysyttävää, vastaa vain tähän viestiin.',
    linkFallback: 'Jos painike ei toimi, kopioi tämä osoite selaimeesi:',
  },

  registrationConfirm: {
    subject: 'Aseta salasanasi | FODEL',
    preheader: 'Yksi napsautus, ja voit koota ilmoituksesi.',
    heading: 'Aseta salasanasi',
    intro: 'Kiitos rekisteröitymisestä. Tilisi on melkein valmis; vain salasana puuttuu.',
    cta: 'Aseta salasana',
    next: 'Sen jälkeen voit jatkaa suoraan ilmoituksesi parissa: paketti, tiedot, kuvat. Tarkastamme sen vasta, kun olet lähettänyt sen.',
    expiry: 'Linkki on voimassa 7 päivää. Jos et itse rekisteröitynyt, voit jättää tämän viestin huomiotta: tiliä ei luoda.',
  },

  accountExists: {
    subject: 'Sinulla on jo FODEL-tili',
    preheader: 'Kirjaudu sisään tai aseta uusi salasana.',
    heading: 'Tällä osoitteella on jo tili',
    body: 'Joku yritti juuri rekisteröityä FODELin sivustolle tällä sähköpostiosoitteella. Osoitteelle on jo tili, joten emme luoneet uutta.',
    cta: 'Kirjaudu sisään',
    reset: 'Unohditko salasanasi? Pyydä uusi',
    ignore: 'Jos se et ollut sinä, sinun ei tarvitse tehdä mitään: tilisi on ennallaan.',
  },

  invite: {
    subject: 'Kutsu FODEL-portaaliin',
    preheader: 'Aseta salasanasi ja kirjaudu ilmoittajaportaaliin.',
    heading: 'Sinut on kutsuttu FODEL-portaaliin',
    body: (role: string) =>
      `FODEL kutsuu sinut portaaliin ${role}, jossa hallinnoit kiinteistöilmoituksia.`,
    roleAdmin: 'ylläpitäjäksi',
    roleOwner: 'ilmoittajaksi',
    cta: 'Hyväksy kutsu',
    expiry: 'Linkki on voimassa 7 päivää, ja sitä voi käyttää kerran.',
  },

  welcome: {
    subject: 'Tervetuloa FODEL-portaaliin',
    preheader: 'Tilisi on aktiivinen. Näin jätät ensimmäisen ilmoituksesi.',
    heading: (name: string) => `Tervetuloa, ${name}`,
    body: 'Tilisi on aktiivinen. Portaalissa kokoat ilmoituksen, lataat kuvat ja seuraat tarkastusta.',
    stepsTitle: 'Mitä tarvitset',
    steps: [
      'Kuvia kiinteistöstä: vähintään yksi, mutta mitä enemmän, sen parempi',
      'Perustiedot: pinta-ala, tontin koko, pyyntihinta',
      'Muutama lause siitä, mikä tekee kiinteistöstä erityisen',
    ],
    cta: 'Siirry portaaliin',
  },

  submissionReceived: {
    subject: (ref: string) => `Olemme vastaanottaneet ilmoituksesi (#${ref})`,
    preheader: 'Tarkistamme sen ja ilmoitamme sinulle sähköpostitse.',
    heading: 'Ilmoituksesi on vastaanotettu',
    body: (title: string, ref: string) =>
      `Olemme vastaanottaneet ilmoituksesi ”${title}” (#${ref}). Joku tiimistämme tarkistaa sen, ja kun päätös on tehty, saat siitä sähköpostin.`,
    timing: 'Tarkastus kestää yleensä enintään kaksi arkipäivää.',
    note: 'Tarkastuksen aikana et voi muokata ilmoitusta. Jos pyydämme muutosta, se avautuu heti uudelleen.',
  },

  changesRequested: {
    subject: (ref: string) => `Muutos tarvitaan (#${ref})`,
    preheader: 'Yksi pieni muutos, niin ilmoitus voidaan julkaista.',
    heading: 'Pyydämme sinua tekemään muutoksen',
    body: (title: string, ref: string) =>
      `Tiimillämme on seuraava huomautus ilmoituksestasi ”${title}” (#${ref}):`,
    after: 'Ilmoitusta voi taas muokata. Tee muutos ja lähetä se uudelleen; prosessi jatkuu sitten normaalisti.',
    cta: 'Muokkaa ilmoitusta',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Hyväksytty (#${ref}): vain maksu puuttuu`,
    preheader: 'Ilmoituksesi on hyväksytty, ja se julkaistaan heti, kun maksu saapuu.',
    heading: 'Ilmoituksesi on hyväksytty',
    body: (title: string, ref: string) =>
      `Hyviä uutisia: olemme tarkistaneet ja hyväksyneet ilmoituksesi ”${title}” (#${ref}). Vain maksu puuttuu. Kun se saapuu, ilmoitus julkaistaan heti.`,
    orderTitle: 'Ilmoituksen hinta',
    discountLabel: 'Suosittelualennus (10\u00a0%)',
    totalLabel: 'Maksettavaa',
    ctaCard: 'Maksa kortilla',
    cardNote: 'Maksu tapahtuu Stripen suojatussa ympäristössä. FODEL ei näe eikä tallenna korttitietojasi.',
    bankTitle: 'Tai tilisiirrolla',
    bankNote: (ref: string) =>
      `Merkitse tilisiirtoon viitenumero: ${ref}. Kun maksu saapuu, joku tiimistämme julkaisee ilmoituksen.`,
    vatNote: 'Kaikki summat sisältävät Alankomaiden 21\u00a0%:n arvonlisäveron.',
  },

  approvedPublished: {
    subject: (ref: string) => `Hyväksytty ja julkaistu (#${ref})`,
    preheader: 'Ilmoituksesi on jo julkaistu; maksathan ilmoitusmaksun 14 päivän kuluessa.',
    heading: 'Ilmoituksesi on nyt julkaistu',
    body: (title: string, ref: string) => `Olemme hyväksyneet ilmoituksen ”${title}” (#${ref}) ja julkaisseet sen heti.`,
    viewCta: 'Näytä ilmoitus',
    orderTitle: 'Ilmoituksen hinta',
    discountLabel: 'Suosittelualennus (10\u00a0%)',
    totalLabel: 'Maksettavaa',
    dueLabel: 'Maksettava viimeistään',
    ctaCard: 'Maksa kortilla',
    cardNote: 'Maksu tapahtuu Stripen suojatussa ympäristössä. FODEL ei näe eikä tallenna korttitietojasi.',
    bankTitle: 'Tilisiirto',
    bankNote: (ref: string) => `Merkitse tilisiirtoon viitenumero: ${ref}.`,
    vatNote: 'Kaikki summat sisältävät Alankomaiden 21\u00a0%:n arvonlisäveron.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Maksuvahvistus (#${ref})`,
    preheader: 'Kiitos, olemme vastaanottaneet maksusi.',
    heading: 'Kiitos, maksusi on saapunut',
    body: (title: string, ref: string) =>
      `Olemme vastaanottaneet maksun ilmoituksesta ”${title}” (#${ref}). Ilmoitus on julkaistu ja näkyy sivustolla ${SITE_HOST}.`,
    orderTitle: 'Erittely',
    discountLabel: 'Suosittelualennus (10\u00a0%)',
    totalLabel: 'Maksettu summa',
    vatNote: 'Summa sisältää Alankomaiden 21\u00a0%:n arvonlisäveron. Saat laskun erillisessä sähköpostissa.',
    paidAtLabel: 'Maksupäivä',
  },

  published: {
    subject: (ref: string) => `Ilmoituksesi on julkaistu (#${ref})`,
    preheader: `Ilmoitus näkyy nyt sivustolla ${SITE_HOST}.`,
    heading: 'Ilmoituksesi on julkaistu',
    body: (title: string, ref: string) =>
      `Ilmoituksesi ”${title}” (#${ref}) on sivustolla ${SITE_HOST} ja tavoittaa ostajia kahdeksassa maassa.`,
    cta: 'Näytä ilmoitus',
    next: 'Heti kun joku kiinnostuu, lähetämme hänen tietonsa sinulle sähköpostitse. Portaalista näet aina ilmoituksesi tilan.',
  },

  newEnquiry: {
    subject: (ref: string) => `Uusi yhteydenotto (#${ref})`,
    preheader: 'Joku on kiinnostunut kiinteistöstäsi.',
    heading: 'Uusi vastaus ilmoitukseesi',
    body: (title: string, ref: string) =>
      `Joku on vastannut ilmoitukseesi ”${title}” (#${ref}):`,
    labels: { name: 'Nimi', email: 'Sähköposti', phone: 'Puhelin' },
    messageTitle: 'Viesti',
    advice: 'Ota yhteyttä kahden päivän kuluessa, jos voit: nopea vastaus on ylivoimaisesti tärkein tekijä kaupan syntymisessä.',
  },

  passwordReset: {
    subject: 'Vaihda salasana | FODEL-portaali',
    preheader: 'Linkki on voimassa tunnin.',
    heading: 'Vaihda salasanasi',
    body: 'Saimme pyynnön vaihtaa FODEL-portaalin tilisi salasanan. Aseta uusi salasana napsauttamalla alla olevaa painiketta.',
    cta: 'Aseta uusi salasana',
    expiry: 'Linkki on voimassa tunnin, ja sitä voi käyttää kerran.',
    ignore: 'Jos et pyytänyt tätä, jätä viesti huomiotta. Salasanasi pysyy ennallaan, eikä mitään tapahdu.',
  },

  referralRegistered: {
    subject: 'Olemme vastaanottaneet suosituksesi | FODEL',
    preheader: 'Joku tiimistämme ottaa pian yhteyttä suosittelemaasi henkilöön.',
    heading: 'Kiitos suosituksesta',
    body: (referredName: string) =>
      `Olemme vastaanottaneet henkilön ${referredName} tiedot. Joku tiimistämme ottaa häneen yhteyttä, ja kun ilmoitus on julkaistu, hyvitämme sinulle 10\u00a0% seuraavan ilmoituksesi hinnasta.`,
    note: 'Hyvitys tehdään käsin, kun ilmoittaja on maksanut. Ilmoitamme sinulle heti, kun se on mahdollista.',
  },

  valuationReceived: {
    heading: 'Olemme vastaanottaneet arviopyyntösi',
    body: 'Joku tiimistämme tarkistaa kiinteistön tiedot ja aineiston ja lähettää sinulle sitten suuntaa-antavan, markkinoihin perustuvan arvion sähköpostitse.',
  },

  valuationReady: {
    subject: 'Arviosi on valmis | FODEL',
    preheader: 'Olemme tehneet kiinteistöstäsi suuntaa-antavan arvion.',
    heading: 'Arviosi on valmis',
    body: (range: string) =>
      `Antamiesi tietojen ja vertailukelpoisten kiinteistöjen perusteella suuntaa-antava arviomme on: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Arvio on suuntaa-antava, se ei ole arviointilausunto eikä korvaa virallista arviota. Vertailukohteita: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Arvio on suuntaa-antava, se ei ole arviointilausunto eikä korvaa virallista arviota.',
    cta: 'Ilmoita nyt',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Antamiesi tietojen perusteella suuntaa-antava markkina-arvo on: ${range}.`,
    mid: 'Keskiarvo',
    basis: 'Aineisto',
    rateDate: 'Valuuttakurssin päivä',
    source: 'Lähde',
    factorsHeading: 'Tekijät',
    dirPlus: 'Nostaa arvoa',
    dirMinus: 'Laskee arvoa',
    dirUnsure: 'Epävarma',
    visit: 'Pyydä Gáborilta käyntiä',
    judicial: 'Pyydä virallinen arvio',
  },

  valuationDeclined: {
    subject: 'Arviopyyntösi | FODEL',
    preheader: 'Joku tiimistämme ottaa sinuun henkilökohtaisesti yhteyttä.',
    heading: 'Kiitos pyynnöstäsi',
    body: 'Antamiesi tietojen perusteella meillä on tällä hetkellä liian vähän vertailukelpoisia kiinteistöjä luotettavaan arvioon. Joku tiimistämme ottaa sinuun henkilökohtaisesti yhteyttä.',
  },

  valuationNeedsInfo: {
    subject: 'Arvio: tarvitsemme vielä muutaman tiedon',
    preheader: 'Tarvitsemme arviota varten vielä hieman lisätietoja.',
    heading: 'Tarvitsemme vielä muutaman tiedon',
    body: 'Kiitos arviopyynnöstäsi. Arviota varten tiimimme pyytää sinulta seuraavaa:',
    after: 'Vastaa tähän viestiin puuttuvilla tiedoilla. Heti kun saamme ne, teemme arvion.',
  },

  rejected: {
    subject: (ref: string) => `Ilmoitustasi ei voida julkaista (#${ref})`,
    preheader: 'Tarkastuksen tulos ja perustelu.',
    heading: 'Emme voi julkaista ilmoitusta',
    body: (title: string, ref: string) =>
      `Valitettavasti tiimimme ei tarkastuksen jälkeen hyväksynyt ilmoitustasi ”${title}” (#${ref}). Perustelu:`,
    refund: 'Jos olet jo maksanut ilmoituksen, otamme sinuun erikseen yhteyttä hyvityksestä.',
    after: 'Jos sinulla on kysyttävää tai uskot, että kyse on väärinkäsityksestä, vastaa vain tähän viestiin.',
  },

  invoiceIssued: {
    subject: (number: string) => `Lasku ${number}`,
    preheader: 'Lasku on valmis; voit katsoa tai ladata sen linkin kautta.',
    heading: 'Laskusi on valmis',
    body: (title: string, ref: string, number: string) =>
      `Lasku ${number} ilmoituksestasi ”${title}” (#${ref}) on valmis.`,
    cta: 'Näytä lasku',
  },

  creditNoteIssued: {
    subject: (number: string) => `Hyvityslasku ${number}`,
    preheader: 'Olemme laatineet hyvityslaskun aiemmasta laskustasi.',
    heading: 'Hyvityslasku on valmis',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Olemme laatineet hyvityslaskun ${number} laskusta ${correctsNumber} ilmoituksestasi ”${title}” (#${ref}).`,
    cta: 'Näytä hyvityslasku',
  },

  serviceRequested: {
    subject: 'Olemme vastaanottaneet pyyntösi | FODEL',
    preheader: 'Joku tiimistämme ottaa sinuun yhteyttä ajankohdan sopimiseksi.',
    heading: 'Olemme vastaanottaneet pyyntösi',
    body: (service: string, price: string) => `Kiitos, olemme kirjanneet pyyntösi: ${service} (${price}).`,
    next: 'Joku tiimistämme ottaa sinuun yhteyttä ajankohdan sopimiseksi.',
    payment: 'Kerromme maksusta, kun sovimme ajankohdan. Et maksa nyt mitään.',
    cancel: 'Muuttuiko mielesi? Vastaa vain tähän viestiin.',
  },

  valuationPaid: {
    subject: 'Maksuvahvistus | FODEL-arvio',
    preheader: 'Kiitos, maksusi on saapunut.',
    heading: 'Kiitos, maksusi on saapunut',
    body: (service: string) => `Olemme vastaanottaneet maksun palvelusta ”${service}”.`,
    orderTitle: 'Tuote',
    totalLabel: 'Maksettu summa',
    paidAtLabel: 'Maksettu',
    next: 'Joku tiimistämme ottaa sinuun pian yhteyttä seuraavista vaiheista.',
    invoice: 'Tarvitsetko laskun? Vastaa vain tähän viestiin.',
  },

  judicialRequested: {
    subject: 'Virallisen arvion pyyntö | FODEL',
    preheader: 'Joku tiimistämme ottaa sinuun yhteyttä vaihtoehdoista.',
    heading: 'Olemme vastaanottaneet pyyntösi',
    body: 'Kiitos, olemme kirjanneet, että haluat asiantuntijan tekemän virallisen (tuomioistuimen määräämän) arvion. Se ei ole sama kuin sivustomme suuntaa-antava, markkinoihin perustuva arvio: sen tekee valtuutettu asiantuntija tarjouksen perusteella.',
    next: 'Joku tiimistämme ottaa sinuun yhteyttä vaihtoehdoista ja tarjouksesta.',
  },
} satisfies PublicEmailCopy;
