/**
 * Long-form pages, Finnish (standard "sinä"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'fi' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `alk. ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_FI = {
  services: {
    metaTitle: 'Palvelut: kaupan hoitaminen, sopimukset, valokuvaus',
    metaDescription: `Kaksikielinen kauppakirja ${from('hu')}, edustus valtakirjalla, kiinteistörekisteröinti, energiatodistus, kiinteistövalokuvaus ja drone-kuvaus.`,
    eyebrow: 'Palvelut',
    title: 'Mitä teemme',
    titleEm: 'ilmoituksen lisäksi',
    intro:
      'Ilmoitus on vasta ensimmäinen askel. Alla olevien palvelujen avulla hoidamme puolestasi koko ostoprosessin kummankin maan sääntöjen mukaisesti.',
    sections: [
      {
        type: 'steps',
        title: 'Näin kauppa etenee',
        items: [
          { n: '01', t: 'Yhteydenotto', b: 'Neuvonta puhelimitse ja sähköpostitse, viestintä molempien osapuolten kanssa tulkit mukaan lukien.' },
          { n: '02', t: 'Ostajien taustan tarkistus', b: 'Tarkistamme taustan, ostoaikeen ja taloudellisen tilanteen.' },
          { n: '03', t: 'Esittely', b: 'Sovimme ajat ja tulemme mukaan yhdessä kollegan kanssa, joka puhuu kieltäsi.' },
          { n: '04', t: 'Neuvottelu', b: 'Tuki molemmilla kielillä realistisen hintahaarukan puitteissa.' },
          { n: '05', t: 'Sopimus', b: 'Kaksikielinen kauppakirja, laadittu yhdessä asianajajan kanssa.' },
          { n: '06', t: 'Kaupan päättäminen', b: 'Kiinteistörekisteri, liittymät ja tarvittaessa edustus valtakirjalla.' },
        ],
      },
      {
        type: 'table',
        title: 'Kaksikielinen kauppakirja',
        intro: 'Suuntaa-antavat hinnat kieliyhdistelmittäin. Lopullinen hinta riippuu sopimuksen pituudesta.',
        rows: [
          ['Unkari', from('hu')],
          ['Saksa–unkari', from('de-hu')],
          ['Englanti–unkari', from('en-hu')],
          ['Hollanti–unkari', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Lisäpalvelut',
        intro: 'Näistä laadimme räätälöidyn tarjouksen:',
        items: [
          'Energiatodistuksen hankkiminen: EU-sääntöjen mukaan pakollinen ilmoituksessa',
          'Ammattimainen kiinteistövalokuvaus',
          'Drone-kuvaus: erityisen tehokas suurille tonteille ja näkymille',
          `Video ilmoituksen yhteydessä (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Edustus valtakirjalla',
        body: 'Sinun ei tarvitse matkustaa Unkariin allekirjoittamaan: valtakirjalla edustamme sinua allekirjoituksessa, kiinteistörekisterissä ja liittymien siirrossa.',
      },
      {
        type: 'prose',
        title: 'Milloin palkkio erääntyy',
        paragraphs: [
          `Veloitamme palkkion vain, kun FODEL on tuonut ostajan, kirjallinen kauppakirja on olemassa ja käsiraha on maksettu. Palkkio on ${COMMISSION.percent}\u00a0% netto, vähintään ${eur(COMMISSION.minimumEur, L)}, lisäksi ${COMMISSION.vatPercent}\u00a0% Alankomaiden arvonlisävero. Palkkion maksaa myyjä, ei ostaja.`,
        ],
      },
      {
        type: 'cta',
        title: 'Kysyttävää prosessista?',
        body: '{hours} Pyydä maksuton takaisinsoitto tai kirjoita meille.',
        primary: { label: 'Ota yhteyttä', to: 'contact' },
        secondary: { label: 'Usein kysytyt kysymykset', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Maatilakiinteistöt: enintään ${AGRI_HECTARE_LIMIT} hehtaaria Unkarissa`,
    metaDescription: `Maatalousalan pätevyyden omaava EU-kansalainen voi hankkia Unkarista enintään ${AGRI_HECTARE_LIMIT} hehtaaria maata. FODEL hoitaa koko menettelyn.`,
    eyebrow: 'Maatilakiinteistöt',
    title: 'Viljelymaat ja',
    titleEm: 'maatilat',
    intro:
      'Unkarin maamarkkinoilla on omat sääntönsä. Kun tunnet ehdot, pääset käsiksi viinitarhoihin, peltoihin, maatiloihin ja metsiin.',
    sections: [
      {
        type: 'prose',
        title: `${AGRI_HECTARE_LIMIT} hehtaarin raja`,
        paragraphs: [
          `EU-kansalainen, jolla on maatalousalan pätevyys, voi hankkia Unkarista yhteensä ${AGRI_HECTARE_LIMIT} hehtaaria maata. Hoidamme koko menettelyn.`,
          'Prosessissa on viranomaisten kanssa useita vaiheita, ja se alkaa pätevyytesi tunnustamisesta. Tiimimme opastaa sinut koko prosessin läpi ja laatii asiakirjat molemmilla kielillä.',
        ],
      },
      {
        type: 'list',
        title: 'Mitä asiakkaamme hankkivat',
        items: [
          'Viinitarhoja toimivalla viinikellarilla tai ilman',
          'Peltoa, joka on oikeutettu EU-tukiin',
          'Maatiloja ulkorakennuksineen, sopivia karjanpitoon',
          'Metsiä ja sekakäyttöisiä tiloja',
          'Suurempia yhtenäisiä alueita sijoituksena',
        ],
      },
      {
        type: 'steps',
        title: 'Prosessi',
        items: [
          { n: '01', t: 'Neuvottelu', b: 'Käymme läpi suunnitelmasi ja käytettävissä olevan budjetin.' },
          { n: '02', t: 'Pätevyyden tunnustaminen', b: 'Hoidamme maatalousalan pätevyytesi tunnustamisen Unkarissa.' },
          { n: '03', t: 'Haku', b: 'Etsimme kumppaneidemme kanssa ehdot täyttävää maata.' },
          { n: '04', t: 'Luvat', b: 'Maan hankintaan tarvittavien lupien hakeminen.' },
          { n: '05', t: 'Kauppa', b: 'Kaksikielinen sopimus, kiinteistörekisteriin kirjaaminen, tukioikeuksien siirto.' },
        ],
      },
      {
        type: 'callout',
        title: 'Tärkeää',
        body: 'Maatalousmaan hankintaa koskevat säännöt muuttuvat ajoittain ja riippuvat tilanteestasi. Tässä kerrottu on vain tiedoksi. Käänny konkreettisessa hankkeessa aina meidän ja alaan erikoistuneen asianajajan puoleen.',
      },
      {
        type: 'cta',
        title: 'Etsitkö maatilaa tai maata?',
        body: 'Kerro, mitä etsit – etsimme myös ilmoittamiemme kohteiden ulkopuolelta.',
        primary: { label: 'Maksuton kohdehaku', to: 'searchRequest' },
        secondary: { label: 'Kohteemme', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Ostaminen Unkarista: prosessi vaihe vaiheelta',
    metaDescription:
      'Näin ulkomainen ostaja ostaa Unkarista: sopimus, käsiraha, kiinteistörekisteri, liittymät ja odotettavat kulut.',
    eyebrow: 'Ostajille',
    title: 'Ostaminen',
    titleEm: 'Unkarista',
    intro:
      'Unkarilainen ostoprosessi on varsin ennustettava, kun tunnet vaiheet. Tämä opas käy ne läpi kanssasi.',
    sections: [
      {
        type: 'steps',
        title: 'Prosessi',
        items: [
          { n: '01', t: 'Valinta', b: 'Valitset kohteistamme tai jätät maksuttoman hakupyynnön.' },
          { n: '02', t: 'Esittely', b: 'Järjestämme matkan ja näytön tulkin kanssa.' },
          { n: '03', t: 'Tarjous', b: 'Autamme sinua tekemään realistisen tarjouksen ja neuvottelemaan.' },
          { n: '04', t: 'Sopimus ja käsiraha', b: 'Kaksikielinen kauppakirja, yleensä 10\u00a0%:n käsirahalla.' },
          { n: '05', t: 'Kauppahinta', b: 'Loppu kauppahinnasta pankkisiirtona sopimuksen mukaisesti.' },
          { n: '06', t: 'Luovutus', b: 'Kirjaaminen, liittymät, avainten luovutus.' },
        ],
      },
      {
        type: 'list',
        title: 'Kulut kauppahinnan lisäksi',
        items: [
          'Varainsiirtovero: verokanta riippuu kohteen tyypistä ja tilanteestasi',
          'Asianajajan palkkio kauppakirjan laatimisesta ja varmentamisesta',
          `Kaksikielisen sopimuksen käännös: ${from('hu')}, kieliparista riippuen`,
          'Kirjaamismaksut',
          'Mahdollinen välityspalkkio FODELille: sen maksaa myyjä, et sinä',
        ],
      },
      {
        type: 'prose',
        title: 'Sinun ei tarvitse olla paikalla',
        paragraphs: [
          'Valtakirjalla edustamme sinua allekirjoituksessa, kirjaamisessa ja liittymien siirrossa. Kauppa voi siis edetä, vaikka et voisi tai haluaisi matkustaa.',
        ],
      },
      {
        type: 'callout',
        title: 'Energiatodistus',
        body: 'Unkarissa vaaditaan energiatodistus, joka EU:n sääntöjen mukaan on mainittava myös ilmoituksessa. Ilmoituksissamme luokka löytyy ominaisuuksista; ”tulossa” tarkoittaa, että todistusta laaditaan vielä.',
      },
      {
        type: 'cta',
        title: 'Aloitetaanko?',
        body: 'Selaa kohteita tai kerro, mitä etsit. Se ei maksa sinulle mitään.',
        primary: { label: 'Kohteemme', to: 'properties' },
        secondary: { label: 'Maksuton kohdehaku', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Muutto Unkariin: miksi hollantilaiset tekevät päätöksen',
    metaDescription:
      'Neljä syytä, miksi hollantilaiset ja belgialaiset ostajat muuttavat Unkariin: hinta-laatusuhde, tila, edullisemmat elinkustannukset ja sijainti.',
    eyebrow: 'Taustaa',
    title: 'Muutto',
    titleEm: 'Unkariin',
    intro:
      'Moni hollantilainen ja belgialainen valitsee Unkarin. Sadoissa keskusteluissa asiakkaidemme kanssa toistuvat yhä uudelleen samat neljä syytä.',
    sections: [
      {
        type: 'prose',
        title: 'Hinta-laatusuhde',
        paragraphs: [
          'Unkarin maaseutukiinteistöt ovat Euroopan edullisimpia. Alankomaissa 125 m²:n rakennustontti maksaa helposti 88 000\u00a0€ ja autotalli noin 100 000\u00a0€. Samalla summalla saat Unkarin maaseudulta tilavan omakotitalon, usein reilulla maa-alalla.',
        ],
      },
      {
        type: 'prose',
        title: 'Tilaa',
        paragraphs: [
          'Alankomaiden asukastiheys on 482 asukasta neliökilometrillä noin 17 miljoonalla asukkaalla, ja huomattava osa maasta on vettä. Tilanpuute ei ole abstrakti ongelma vaan arkinen kokemus ja useimmin mainittu syy.',
        ],
      },
      {
        type: 'prose',
        title: 'Elinkustannukset',
        paragraphs: [
          'Suuri osa ostajistamme on eläkkeellä tai jäämässä eläkkeelle. Heille edullisemmat elinkustannukset, kiinteistöveron puuttuminen ja edullinen terveydenhuolto tarkoittavat yhdessä elintasoa, jota sama eläke ei Alankomaissa tarjoaisi.',
        ],
      },
      {
        type: 'prose',
        title: 'Sijainti',
        paragraphs: [
          'Vuoden 1953 tulvakatastrofin jälkeen Alankomaat on rakentanut valtavan tulvasuojelujärjestelmän. Huoli merenpinnan noususta vaikuttaa moniin päätöksiin: Unkari sijaitsee keskellä mannerta, merenpinnan yläpuolella.',
        ],
      },
      {
        type: 'cta',
        title: 'Aika tutustua',
        body: 'Selaa kohteitamme tai anna meidän etsiä sitä, mitä sinulla on mielessä.',
        primary: { label: 'Kohteemme', to: 'properties' },
        secondary: { label: 'Ostaminen Unkarista', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Kuvausopas ilmoittajille',
    metaDescription:
      'Hyvät kuvat ovat tärkein työkalu nopeaan myyntiin. FODELin kuvausopas: valo, suunta, tarkkuus ja yleisimmät virheet.',
    eyebrow: 'Myyjille',
    title: 'Opas',
    titleEm: 'valokuvaukseen',
    intro:
      'Ulkomaiset ostajaehdokkaat näkevät ensin kuvat, usein vain kuvat. Nämä säännöt tekevät enemmän kuin mikään ilmoitusteksti.',
    sections: photoGuideSections(L, {
      topTitle: 'Kuusi tärkeintä sääntöä',
      calloutTitle: 'Haluatko mieluummin ulkoistaa sen?',
      calloutBody: (lines) =>
        `Käytä ammattilaista. Voit valita sen yhdellä napsautuksella, kun jätät ilmoituksen: ${lines.join('; ')}. Molemmat ovat vapaaehtoisia; tiimistämme otetaan sinuun yhteyttä ajan sopimiseksi.`,
      ctaTitle: 'Valmis ilmoittamaan kohteesi?',
      primary: 'Jätä ilmoitus',
      secondary: 'Hinnasto',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
