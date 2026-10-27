/**
 * Page copy, Slovenian (formal "vikanje").
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
const L = 'sl' as const;

export const SL = {
  home: {
    meta: {
      title: 'FODEL Real Estates | Kupite nepremičnino na Madžarskem neposredno od lastnika',
      description:
        'Hiše, kmetije in podeželska posestva na Madžarskem, pogosto neposredno od lastnika. Svetovanje v vašem jeziku in dvojezične prodajne pogodbe.',
    },
    hero: {
      eyebrow: `Od leta 2013 · ${foundedInLabel(L)}`,
      title: ['Nepremičnine', 'na Madžarskem', 'neposredno od lastnika'],
      emphasis: 1,
      body: 'Pri številnih naših oglasih je naveden lastnik. Z njim se lahko dogovarjate neposredno ali pa celoten postopek prepustite nam.',
      primary: 'Prebrskaj nepremičnine',
      secondary: 'Brezplačno iskanje nepremičnine',
      featuredLabel: 'Izpostavljeno',
    },
    audiences: [
      {
        eyebrow: 'Za kupce',
        title: 'Nepremičnine neposredno\nod lastnika',
        body: 'Pristne madžarske hiše, kmetije, podeželska posestva in vinogradi. Obrnite se neposredno na lastnika ali pa celoten postopek prepustite družbi FODEL.',
        cta: 'Prebrskaj nepremičnine',
        to: 'properties',
      },
      {
        eyebrow: 'Za prodajalce',
        title: 'Vaša madžarska nepremičnina\nv Zahodni Evropi',
        body: `Oglašujte v ${REACH_LANGUAGES} jezikih v ${REACH_COUNTRIES} državah, brez pogodbe o izključnosti. Provizija le, če kupca pripeljemo mi.`,
        cta: 'Več o tem',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Izbira', title: 'Izpostavljene nepremičnine' },
    quote: '»Nizozemci pogosto ne verjamejo lastnim očem, ko vidijo, kaj vse je mogoče kupiti na Madžarskem in za koliko.«',
    quoteSource: `${BRAND.sl.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Kako deluje', title: 'Kako deluje FODEL' },
    cta: {
      eyebrow: 'Pišite nam',
      title: 'Z veseljem',
      titleEm: 'vas pokličemo',
      body: `{hoursShort} · Povratni klic vas nič ne stane.`,
    },
    referral: {
      eyebrow: 'Program priporočil',
      title: 'Priporočite oglaševalca,',
      titleEm: 'prejmite 10\u00a0%',
      body: 'Če nekdo na vaše priporočilo odda oglas pri FODEL, prejme 10\u00a0% popusta na svoj paket, vam pa 10\u00a0% dobropišemo za naslednji oglas. Že oglašujete pri nas? Svojo priporočilno kodo najdete na portalu pod Nastavitve.',
      steps: [
        'Priporočite znanca z obrazcem spodaj ali delite svojo povezavo s portala',
        'Nekdo iz naše ekipe stopi v stik z njim',
        'Če odda oglas, prihrani 10\u00a0%, vam pa dobropišemo 10\u00a0%',
      ],
      formTitle: 'Priporočite znanca',
      fields: {
        referrerName: 'Vaše ime',
        referrerEmail: 'Vaš e-poštni naslov',
        referredName: 'Ime priporočene osebe',
        referredEmail: 'E-poštni naslov priporočene osebe',
      },
      submit: 'Pošlji priporočilo',
      successTitle: 'Hvala za priporočilo!',
      successBody:
        'Prejeli smo ga. Sodelavec bo poklical priporočeno osebo, vas pa bomo obvestili po e-pošti.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Objava v ${REACH_COUNTRIES} državah`,
      body: `Oglašujemo v ${REACH_LANGUAGES} jezikih na Nizozemskem, v Belgiji, Nemčiji, Angliji in drugih državah EU, brez pogodbe o izključnosti s prodajalcem.`,
    },
    {
      num: '02',
      title: 'Neposreden stik',
      body: 'Pri številnih oglasih sta poleg naših podatkov navedena ime in številka lastnika. Če se dogovorite med seboj, nihče ne plača provizije.',
    },
    {
      num: '03',
      title: 'Celoten postopek uredimo za vas',
      body: 'Dvojezična prodajna pogodba, zastopanje s pooblastilom, vpis v zemljiško knjigo in prenos komunalnih priključkov.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Ustanovljeno' },
    { value: String(REACH_COUNTRIES), label: 'Države' },
    { value: String(REACH_LANGUAGES), label: 'Jeziki' },
    { value: `${COMMISSION.percent}%`, label: 'Provizija' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Za prodajalce | Vaša madžarska nepremičnina v Zahodni Evropi',
      description: `Oglašujte svojo madžarsko nepremičnino v ${REACH_LANGUAGES} jezikih v ${REACH_COUNTRIES} državah, od ${eur(69, L)} in brez izključnosti. Provizija le, če kupca pripelje FODEL: ${COMMISSION.percent}\u00a0% + ${COMMISSION.vatPercent}\u00a0% DDV.`,
    },
    hero: {
      eyebrow: 'Za prodajalce',
      title: 'Vaša nepremičnina',
      titleEm: 'v Zahodni Evropi',
      body: `Z modelom FODEL se vaša nepremičnina pojavi v ${REACH_LANGUAGES} jezikih v ${REACH_COUNTRIES} državah, brez pogodbe o izključnosti. Sodelujemo le z resnimi kupci.`,
      cta: 'Oddaj oglas',
      secondary: 'Oglejte si cene',
    },
    benefits: {
      eyebrow: 'Prednosti',
      title: 'Kaj prinese tuji kupec',
      points: [
        'Kupci z lastnimi sredstvi: brez čakanja na posojilo ali subvencijo.',
        'Plačilo v enkratnem znesku z bančnim nakazilom, hitro in varno.',
        'Resen namen: en sam ogled jih stane dva dni in 200–300\u00a0€.',
        'Realne cene: brez nerazumnega barantanja.',
        'FODEL vsakega kupca osebno preveri, preden se dogovori kakršen koli termin.',
      ],
    },
    personas: {
      eyebrow: 'Kupci',
      title: 'Kdo so naši kupci',
      items: [
        {
          title: 'Upokojenci',
          body: 'Na Madžarskem iščejo nižje življenjske stroške, davčne ugodnosti in dostopno zdravstvo.',
        },
        {
          title: 'Družine',
          body: 'Iščejo prostor, naravo in življenje na podeželju. Pogosto kmetijo, domačijo ali počitniško hišo.',
        },
        {
          title: 'Vlagatelji',
          body: 'Iščejo poslovne nepremičnine, vinograde in kmetijska zemljišča.',
        },
        {
          title: 'Iskalci novega načina življenja',
          body: 'Za seboj puščajo visoke življenjske stroške in gnečo ter iščejo pristen evropski način življenja.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Korak za korakom', title: 'Model FODEL' },
    commission: {
      eyebrow: 'Cenik',
      title: 'Provizija le\nob uspešni prodaji',
      body: `Če vas kupec kontaktira neposredno in naše pomoči ne potrebujete, poleg cene oglasa ne plačate ničesar. Če prodajo posreduje FODEL: ${COMMISSION.percent}\u00a0% neto (najmanj ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}\u00a0% nizozemskega DDV.`,
      cta: 'Oglejte si cene',
    },
  },

  buyers: {
    meta: {
      title: 'Za kupce | Nakup nepremičnine na Madžarskem',
      description:
        'Kako varno kupiti nepremičnino na Madžarskem: dvojezična pogodba, zastopanje s pooblastilom in vpis v zemljiško knjigo. Poleg tega brezplačna storitev iskanja.',
    },
    hero: {
      eyebrow: 'Za kupce',
      title: 'Nakup na Madžarskem,',
      titleEm: 'brez presenečenj',
      body: 'Številni naši oglasi navajajo lastnika. Pogajate se lahko neposredno ali pa celoten postopek prepustite nam.',
      cta: 'Prebrskaj nepremičnine',
      secondary: 'Brezplačno iskanje nepremičnine',
    },
    services: {
      eyebrow: 'Kaj uredimo',
      title: 'Celovita podpora',
      points: [
        'Komunikacija med vami in prodajalcem, vključno s tolmači.',
        'Ogledi s sodelavcem, ki govori vaš jezik.',
        'Podpora pri pogajanjih o ceni in pripravi dvojezične pogodbe.',
        'Zastopanje s pooblastilom: za podpis vam ni treba potovati na Madžarsko.',
        'Vpis v zemljiško knjigo in prenos komunalnih priključkov.',
      ],
    },
    reasons: {
      eyebrow: 'Zakaj Madžarska',
      title: 'Kaj iščejo kupci iz zahodne Evrope',
    },
  },

  about: {
    meta: {
      title: 'O nas | Most med dvema svetovoma',
      description:
        'Od leta 2013 povezujemo madžarske prodajalce s kupci iz zahodne Evrope. Diskretno, pregledno in brez ekskluzivne pogodbe.',
    },
    hero: {
      eyebrow: 'O nas',
      title: 'Most med',
      titleEm: 'dvema svetovoma',
      body: 'Od leta 2013 madžarskim prodajalcem pomagamo najti pravega tujega kupca: diskretno, učinkovito in brez ekskluzivne pogodbe.',
    },
    origin: {
      eyebrow: 'Začetki · Almere-Buiten, 2013',
      quote:
        '„Ko smo živeli v Almere-Buitnu, smo videli, kako zelo Nizozemci hrepenijo po pristnem evropskem načinu življenja, medtem ko na Madžarskem najlepše nepremičnine neopažene čakajo na lastnika.“',
    },
    values: {
      eyebrow: 'Za kaj se zavzemamo',
      title: 'Na čem gradimo',
      items: [
        {
          num: '01',
          title: 'Diskretnost',
          body: 'S podatki prodajalcev in kupcev ravnamo z največjo možno skrbnostjo. Osebni podatki so prikazani le s privolitvijo.',
        },
        {
          num: '02',
          title: 'Preglednost',
          body: 'Brez skritih stroškov. Naše cene in provizija so objavljene na tej spletni strani, o vsakem koraku pa vas obveščamo.',
        },
        {
          num: '03',
          title: 'Dvojezično strokovno znanje',
          body: 'Oba trga poznamo od znotraj. Naša ekipa govori nizozemsko, nemško, angleško, francosko in madžarsko.',
        },
      ],
    },
    approach: {
      eyebrow: 'Naš pristop',
      title: 'Nismo velika pisarna.',
      titleEm: 'V tem je naša moč.',
      points: [
        'Vsaka stranka ima oseben stik: brez klicnega centra, brez anonimnega okenca.',
        'Obe kulturi poznamo od znotraj in nepremičnine presojamo enako z nizozemskimi kot z madžarskimi očmi.',
        'Povezati nepremičnino in kupca je naša odgovornost, ne stvar naključja.',
        'Delamo brez ekskluzivnosti, ker raje prepričamo z rezultati.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Most, ki smo ga',
      titleEm: 'zgradili',
      paragraphs: [
        'FODEL so ustanovili Madžari, ki živijo na Nizozemskem. Začeli smo leta 2013 v Almere-Buitnu, kjer smo opazili, koliko Nizozemcev in Belgijcev želi kupiti pristno madžarsko hišo, a ne ve, kje začeti.',
        `Danes oglašujemo v ${REACH_COUNTRIES} državah in ${REACH_LANGUAGES} jezikih ter vodimo vsak posel od začetka do konca: dvojezična prodajna pogodba, zastopanje s pooblastilom in vpis v zemljiško knjigo. Naša pisarna je v Haagu.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Stik | Z veseljem vas pokličemo nazaj',
      description: `Pokličite nas ob delavnikih med ${COMPANY.hours.weekdays.from} in ${COMPANY.hours.weekdays.to} ali prosite za povratni klic. Klic vas nič ne stane.`,
    },
    hero: { eyebrow: 'Stik', title: 'Z veseljem', titleEm: 'vas pokličemo' },
    formTitle: 'Prosite za povratni klic',
    submit: 'Zahtevajte povratni klic',
    subjects: [
      'Vprašanje o nepremičnini',
      'Oglaševanje nepremičnine',
      'Zahtevajte cene',
      'Prošnja za povratni klic',
      'Drugo',
    ],
    note: `Povratni klic vas nič ne stane: klic plačamo mi. Kličemo nazaj do ${COMPANY.hours.callback.to}, tudi ob koncih tedna.`,
  },
} satisfies CopyShape;
