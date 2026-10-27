/**
 * Page copy, Finnish (standard "sinä").
 *
 * Written for buyers and sellers in the UK, Ireland and the rest of the
 * English-speaking market, from the same facts as the Hungarian and Dutch
 * copy: the figures come from src/config/company.ts, never from this file.
 * Type-checked against the Hungarian copy, so a missing key fails the build.
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'fi' as const;

export const FI = {
  home: {
    meta: {
      title: 'FODEL Real Estates | Osta kiinteistö Unkarista suoraan omistajalta',
      description:
        'Taloja, maatiloja ja maaseututiloja Unkarissa, usein suoraan omistajalta. Opastusta omalla kielelläsi ja kaksikieliset kauppakirjat.',
    },
    hero: {
      eyebrow: `Vuodesta 2013 · ${foundedInLabel(L)}`,
      title: ['Kiinteistöjä', 'Unkarissa', 'suoraan omistajalta'],
      emphasis: 1,
      body: 'Monissa ilmoituksissamme on mainittu omistaja. Voit neuvotella suoraan omistajan kanssa tai jättää koko prosessin meille.',
      primary: 'Selaa kohteita',
      secondary: 'Maksuton kohdehaku',
      featuredLabel: 'Nostot',
    },
    audiences: [
      {
        eyebrow: 'Ostajille',
        title: 'Kiinteistöjä suoraan\nomistajalta',
        body: 'Aitoja unkarilaisia taloja, maatiloja, maaseututiloja ja viinitarhoja. Ota yhteyttä suoraan omistajaan tai anna FODELin hoitaa koko prosessi.',
        cta: 'Selaa kohteita',
        to: 'properties',
      },
      {
        eyebrow: 'Myyjille',
        title: 'Unkarilainen kiinteistösi\nLänsi-Eurooppaan',
        body: `Ilmoita ${REACH_LANGUAGES} kielellä ${REACH_COUNTRIES} maassa ilman yksinmyyntisopimusta. Välityspalkkio vain, jos ostaja tulee meidän kauttamme.`,
        cta: 'Lue lisää',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Valinta', title: 'Nostetut kohteet' },
    quote: '”Hollantilaiset eivät usein meinaa uskoa silmiään, kun he näkevät, mitä Unkarista voi ostaa ja millä hinnalla.”',
    quoteSource: `${BRAND.fi.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Näin se toimii', title: 'Näin FODEL toimii' },
    cta: {
      eyebrow: 'Ota yhteyttä',
      title: 'Soitamme mielellämme',
      titleEm: 'sinulle takaisin',
      body: `{hoursShort} · Takaisinsoitto ei maksa sinulle mitään.`,
    },
    referral: {
      eyebrow: 'Suositteluohjelma',
      title: 'Suosittele ilmoittajaa,',
      titleEm: 'saat 10\u00a0%',
      body: 'Jos joku jättää suosituksestasi ilmoituksen FODELiin, hän saa 10\u00a0%:n alennuksen paketistaan ja me hyvitämme sinulle 10\u00a0% seuraavasta ilmoituksestasi. Ilmoitatko jo meillä? Oman suosituskoodisi löydät portaalista kohdasta Asetukset.',
      steps: [
        'Suosittele tuttavaa alla olevalla lomakkeella tai jaa oma linkkisi portaalista',
        'Tiimistämme otetaan häneen yhteyttä',
        'Jos hän jättää ilmoituksen, hän säästää 10\u00a0% ja me hyvitämme sinulle 10\u00a0%',
      ],
      formTitle: 'Suosittele tuttavaa',
      fields: {
        referrerName: 'Nimesi',
        referrerEmail: 'Sähköpostiosoitteesi',
        referredName: 'Suosittelemasi henkilön nimi',
        referredEmail: 'Suosittelemasi henkilön sähköpostiosoite',
      },
      submit: 'Lähetä suositus',
      successTitle: 'Kiitos suosituksesta!',
      successBody:
        'Olemme vastaanottaneet sen. Kollegamme ottaa yhteyttä suosittelemaasi henkilöön, ja pidämme sinut ajan tasalla sähköpostitse.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Ilmoitus ${REACH_COUNTRIES} maassa`,
      body: `Ilmoitamme ${REACH_LANGUAGES} kielellä Alankomaissa, Belgiassa, Saksassa, Englannissa ja muissa EU-maissa ilman yksinmyyntisopimusta myyjän kanssa.`,
    },
    {
      num: '02',
      title: 'Suora yhteys',
      body: 'Monissa ilmoituksissa näkyy yhteystietojemme ohella omistajan nimi ja numero. Jos sovitte asiasta keskenänne, kukaan ei maksa välityspalkkiota.',
    },
    {
      num: '03',
      title: 'Koko prosessi hoidettuna',
      body: 'Kaksikielinen kauppakirja, edustus valtakirjalla, kirjaaminen kiinteistörekisteriin ja liittymien siirto.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Perustettu' },
    { value: String(REACH_COUNTRIES), label: 'Maat' },
    { value: String(REACH_LANGUAGES), label: 'Kielet' },
    { value: `${COMMISSION.percent}%`, label: 'Välityspalkkio' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Myyjille | Unkarilainen kiinteistösi Länsi-Euroopan ostajille',
      description: `Ilmoita unkarilainen kiinteistösi ${REACH_LANGUAGES} kielellä ${REACH_COUNTRIES} maassa alkaen ${eur(69, L)} ja ilman yksinmyyntiä. Välityspalkkio vain, jos ostaja tulee FODELin kautta: ${COMMISSION.percent}\u00a0% + ${COMMISSION.vatPercent}\u00a0% ALV.`,
    },
    hero: {
      eyebrow: 'Myyjille',
      title: 'Kiinteistösi',
      titleEm: 'Länsi-Euroopan ostajille',
      body: `FODEL-mallissa kiinteistösi näkyy ${REACH_LANGUAGES} kielellä ${REACH_COUNTRIES} maassa ilman yksinmyyntisopimusta. Teemme työtä vain vakavasti otettavien ostajien kanssa.`,
      cta: 'Jätä ilmoitus',
      secondary: 'Katso hinnat',
    },
    benefits: {
      eyebrow: 'Edut',
      title: 'Mitä ulkomainen ostaja tuo tullessaan',
      points: [
        'Ostajat omin varoin: ei odottelua asuntolainan tai tuen takia.',
        'Maksu kerralla pankkisiirtona, nopeasti ja turvallisesti.',
        'Vakava aikomus: yksi esittely maksaa heille kaksi päivää ja 200–300\u00a0€.',
        'Realistinen hinnoittelu: ei kohtuutonta tinkimistä.',
        'FODEL arvioi jokaisen ostajan henkilökohtaisesti ennen kuin aikaa sovitaan.',
      ],
    },
    personas: {
      eyebrow: 'Ostajat',
      title: 'Keitä ostajamme ovat',
      items: [
        {
          title: 'Eläkeläiset',
          body: 'Etsivät Unkarista alhaisempia elinkustannuksia, veroetuja ja edullista terveydenhuoltoa.',
        },
        {
          title: 'Perheet',
          body: 'Etsivät tilaa, luontoa ja maalaiselämää. Usein maatilaa, tilaa tai vapaa-ajan asuntoa.',
        },
        {
          title: 'Sijoittajat',
          body: 'Etsivät liikekiinteistöjä, viinitarhoja ja maatalousmaata.',
        },
        {
          title: 'Elämäntapamuuttajat',
          body: 'Jättävät taakseen korkeat elinkustannukset ja ruuhkat ja etsivät aitoa eurooppalaista elämäntapaa.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Vaihe vaiheelta', title: 'FODEL-malli' },
    commission: {
      eyebrow: 'Hinnasto',
      title: 'Palkkio vain\nonnistuneesta kaupasta',
      body: `Jos ostaja ottaa sinuun suoraan yhteyttä etkä tarvitse apuamme, et maksa mitään ilmoitusmaksun lisäksi. Jos FODEL välittää kaupan: ${COMMISSION.percent}\u00a0% netto (väh. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}\u00a0% Alankomaiden ALV.`,
      cta: 'Katso hinnat',
    },
  },

  buyers: {
    meta: {
      title: 'Ostajille | Kiinteistön ostaminen Unkarista',
      description:
        'Näin ostat kiinteistön Unkarista turvallisesti: kaksikielinen sopimus, edustus valtakirjalla ja kiinteistörekisteröinti. Lisäksi maksuton hakupalvelu.',
    },
    hero: {
      eyebrow: 'Ostajille',
      title: 'Osta Unkarista,',
      titleEm: 'ilman yllätyksiä',
      body: 'Monessa ilmoituksessamme kerrotaan omistaja. Voit neuvotella suoraan tai jättää koko prosessin meille.',
      cta: 'Selaa kohteita',
      secondary: 'Maksuton kohdehaku',
    },
    services: {
      eyebrow: 'Mitä hoidamme',
      title: 'Täysi tuki',
      points: [
        'Viestintä sinun ja myyjän välillä tulkit mukaan lukien.',
        'Esittelyt kieltäsi puhuvan kollegan kanssa.',
        'Tukea hintaneuvotteluissa ja kaksikielisen sopimuksen laatimisessa.',
        'Edustus valtakirjalla: sinun ei tarvitse matkustaa Unkariin allekirjoittamaan.',
        'Kiinteistörekisteröinti ja liittymien siirto.',
      ],
    },
    reasons: {
      eyebrow: 'Miksi Unkari',
      title: 'Mitä länsieurooppalaiset ostajat etsivät',
    },
  },

  about: {
    meta: {
      title: 'Meistä | Silta kahden maailman välillä',
      description:
        'Olemme vuodesta 2013 tuoneet yhteen unkarilaisia myyjiä ja länsieurooppalaisia ostajia. Hienotunteisesti, läpinäkyvästi ja ilman yksinoikeussopimusta.',
    },
    hero: {
      eyebrow: 'Meistä',
      title: 'Silta kahden',
      titleEm: 'maailman välillä',
      body: 'Olemme vuodesta 2013 auttaneet unkarilaisia myyjiä löytämään oikean ulkomaisen ostajan: hienotunteisesti, tehokkaasti ja ilman yksinoikeussopimusta.',
    },
    origin: {
      eyebrow: 'Alku · Almere-Buiten, 2013',
      quote:
        '”Almere-Buitenissa asuessamme näimme, kuinka paljon hollantilaiset kaipaavat aitoa eurooppalaista elämäntapaa, kun taas Unkarissa hienoimmat kiinteistöt odottavat huomaamatta omistajaansa.”',
    },
    values: {
      eyebrow: 'Mitä edustamme',
      title: 'Mihin rakennamme',
      items: [
        {
          num: '01',
          title: 'Hienotunteisuus',
          body: 'Käsittelemme myyjien ja ostajien tietoja mahdollisimman huolellisesti. Henkilötiedot näytetään vain suostumuksella.',
        },
        {
          num: '02',
          title: 'Läpinäkyvyys',
          body: 'Ei piilokuluja. Hintamme ja palkkiomme on julkaistu tällä sivustolla, ja pidämme sinut ajan tasalla joka vaiheessa.',
        },
        {
          num: '03',
          title: 'Kaksikielinen asiantuntemus',
          body: 'Tunnemme molemmat markkinat sisältäpäin. Tiimimme puhuu hollantia, saksaa, englantia, ranskaa ja unkaria.',
        },
      ],
    },
    approach: {
      eyebrow: 'Toimintatapamme',
      title: 'Emme ole suuri toimisto.',
      titleEm: 'Se on vahvuutemme.',
      points: [
        'Jokainen asiakas saa henkilökohtaisen yhteyshenkilön: ei puhelinpalvelukeskusta, ei kasvotonta palvelutiskiä.',
        'Tunnemme molemmat kulttuurit sisältäpäin ja arvioimme kiinteistöjä yhtä lailla hollantilaisin kuin unkarilaisin silmin.',
        'Kiinteistön ja ostajan yhteen saattaminen on meidän vastuullamme, ei sattuman kauppaa.',
        'Toimimme ilman yksinoikeutta, koska vakuutamme mieluummin tuloksilla.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Silta, jonka',
      titleEm: 'olemme rakentaneet',
      paragraphs: [
        'FODELin perustivat Alankomaissa asuvat unkarilaiset. Aloitimme Almere-Buitenissa vuonna 2013, jolloin huomasimme, kuinka moni hollantilainen ja belgialainen halusi ostaa aidon unkarilaisen kodin tietämättä, mistä aloittaa.',
        `Nykyään ilmoitamme ${REACH_COUNTRIES} maassa ja ${REACH_LANGUAGES} kielellä ja ohjaamme jokaisen kaupan alusta loppuun: kaksikielinen kauppakirja, edustus valtakirjalla ja kiinteistörekisteröinti. Toimistomme sijaitsee Haagissa.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Yhteystiedot | Soitamme mielellämme takaisin',
      description: `Soita meille arkisin klo ${COMPANY.hours.weekdays.from}–${COMPANY.hours.weekdays.to} tai pyydä takaisinsoittoa. Puhelu ei maksa sinulle mitään.`,
    },
    hero: { eyebrow: 'Yhteydenotto', title: 'Soitamme mielellämme', titleEm: 'sinulle takaisin' },
    formTitle: 'Pyydä takaisinsoittoa',
    submit: 'Pyydä takaisinsoittoa',
    subjects: [
      'Kysymys kohteesta',
      'Kiinteistön ilmoittaminen',
      'Pyydä hinnat',
      'Takaisinsoittopyyntö',
      'Muu',
    ],
    note: `Takaisinsoitto ei maksa sinulle mitään: maksamme puhelun. Soitamme takaisin klo ${COMPANY.hours.callback.to} asti, myös viikonloppuisin.`,
  },
} satisfies CopyShape;
