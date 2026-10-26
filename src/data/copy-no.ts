/**
 * Page copy, Norwegian Bokmål (informal-standard "du").
 *
 * Written for buyers and sellers in the UK, Ireland and the rest of the
 * English-speaking market, from the same facts as the Hungarian and Dutch
 * copy: the figures come from src/config/company.ts, never from this file.
 * Type-checked against the Hungarian copy, so a missing key fails the build.
 */

import { COMPANY, COMMISSION, formatHours, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'no' as const;

export const NO = {
  home: {
    meta: {
      title: 'FODEL Real Estates | Kjøp eiendom i Ungarn direkte fra eieren',
      description:
        'Hus, gårder og landeiendommer i Ungarn, ofte direkte fra eieren. Veiledning på ditt eget språk og tospråklige kjøpekontrakter.',
    },
    hero: {
      eyebrow: `Siden 2013 · ${foundedInLabel(L)}`,
      title: ['Eiendommer', 'i Ungarn', 'direkte fra eieren'],
      emphasis: 1,
      body: 'Mange av annonsene våre oppgir eieren. Du kan forhandle direkte med eieren eller overlate hele prosessen til oss.',
      primary: 'Se eiendommer',
      secondary: 'Gratis eiendomssøk',
      featuredLabel: 'Utvalgte',
    },
    audiences: [
      {
        eyebrow: 'For kjøpere',
        title: 'Eiendommer direkte\nfra eieren',
        body: 'Autentiske ungarske hus, gårder, landeiendommer og vinmarker. Kontakt eieren direkte, eller la FODEL ta seg av hele prosessen.',
        cta: 'Se eiendommer',
        to: 'properties',
      },
      {
        eyebrow: 'For selgere',
        title: 'Din ungarske eiendom\ni Vest-Europa',
        body: `Annonser på ${REACH_LANGUAGES} språk i ${REACH_COUNTRIES} land, uten eneavtale. Provisjon bare hvis vi skaffer kjøperen.`,
        cta: 'Les mer',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Utvalg', title: 'Utvalgte eiendommer' },
    quote: '«Nederlendere tror ofte ikke sine egne øyne når de ser hva man kan kjøpe i Ungarn, og til hvilken pris.»',
    quoteSource: `${BRAND.no.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Slik fungerer det', title: 'Slik fungerer FODEL' },
    cta: {
      eyebrow: 'Kontakt oss',
      title: 'Vi ringer gjerne',
      titleEm: 'deg opp',
      body: `${formatHours(L)} · Å bli oppringt koster deg ingenting.`,
    },
    referral: {
      eyebrow: 'Vervingsprogram',
      title: 'Anbefal en annonsør,',
      titleEm: 'få 10\u00a0%',
      body: 'Hvis noen legger inn en annonse hos FODEL etter din anbefaling, får de 10\u00a0% rabatt på pakken, og vi godskriver deg 10\u00a0% på din neste annonse. Annonserer du allerede hos oss? Din egen vervekode finner du under Innstillinger i portalen.',
      steps: [
        'Anbefal en bekjent med skjemaet nedenfor, eller del din egen lenke fra portalen',
        'En fra teamet vårt tar kontakt med vedkommende',
        'Hvis vedkommende legger inn en annonse, sparer de 10\u00a0%, og vi godskriver deg 10\u00a0%',
      ],
      formTitle: 'Anbefal en bekjent',
      fields: {
        referrerName: 'Navnet ditt',
        referrerEmail: 'E-postadressen din',
        referredName: 'Navn på den du anbefaler',
        referredEmail: 'E-postadressen til den du anbefaler',
      },
      submit: 'Send anbefaling',
    },
  },

  steps: [
    {
      num: '01',
      title: `Annonsert i ${REACH_COUNTRIES} land`,
      body: `Vi annonserer på ${REACH_LANGUAGES} språk i Nederland, Belgia, Tyskland, England og andre EU-land, uten eneavtale med selgeren.`,
    },
    {
      num: '02',
      title: 'Direkte kontakt',
      body: 'Mange annonser viser eierens navn og nummer ved siden av våre opplysninger. Hvis dere avtaler det seg imellom, betaler ingen provisjon.',
    },
    {
      num: '03',
      title: 'Hele prosessen ordnet for deg',
      body: 'Tospråklig kjøpekontrakt, representasjon med fullmakt, tinglysing og overføring av strøm og vann.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Grunnlagt' },
    { value: String(REACH_COUNTRIES), label: 'Land' },
    { value: String(REACH_LANGUAGES), label: 'Språk' },
    { value: `${COMMISSION.percent}%`, label: 'Provisjon' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'For selgere | Din ungarske eiendom i Vest-Europa',
      description: `Annonser den ungarske eiendommen din på ${REACH_LANGUAGES} språk i ${REACH_COUNTRIES} land, fra ${eur(69, L)} og uten eneavtale. Provisjon bare hvis FODEL skaffer kjøperen: ${COMMISSION.percent}\u00a0% + ${COMMISSION.vatPercent}\u00a0% mva.`,
    },
    hero: {
      eyebrow: 'For selgere',
      title: 'Din eiendom',
      titleEm: 'i Vest-Europa',
      body: `Med FODEL-modellen vises eiendommen din på ${REACH_LANGUAGES} språk i ${REACH_COUNTRIES} land, uten eneavtale. Vi jobber kun med seriøse kjøpere.`,
      cta: 'Legg inn annonse',
      secondary: 'Se priser',
    },
    benefits: {
      eyebrow: 'Fordelene',
      title: 'Hva en utenlandsk kjøper bidrar med',
      points: [
        'Kjøpere med egne midler: ingen venting på boliglån eller tilskudd.',
        'Betaling i én omgang via bankoverføring, raskt og trygt.',
        'Seriøse hensikter: én visning koster dem to dager og 200–300\u00a0€.',
        'Realistisk prising: ingen urimelig pruting.',
        'FODEL vurderer hver kjøper personlig før det avtales noe møte.',
      ],
    },
    personas: {
      eyebrow: 'Kjøperne',
      title: 'Hvem kjøperne våre er',
      items: [
        {
          title: 'Pensjonister',
          body: 'Søker lavere levekostnader, skattefordeler og rimelig helsehjelp i Ungarn.',
        },
        {
          title: 'Familier',
          body: 'Søker plass, natur og livet på landet. Ofte en gård, et småbruk eller en fritidsbolig.',
        },
        {
          title: 'Investorer',
          body: 'Søker næringseiendom, vingårder og landbruksjord.',
        },
        {
          title: 'Livsstilsutvandrere',
          body: 'Forlater høye levekostnader og trengsel, på jakt etter en autentisk europeisk livsstil.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Steg for steg', title: 'FODEL-modellen' },
    commission: {
      eyebrow: 'Priser',
      title: 'Provisjon bare\nved gjennomført salg',
      body: `Hvis kjøperen kontakter deg direkte og du ikke trenger vår hjelp, betaler du ingenting utover annonseprisen. Hvis FODEL formidler salget: ${COMMISSION.percent}\u00a0% netto (min. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}\u00a0% nederlandsk mva.`,
      cta: 'Se priser',
    },
  },

  buyers: {
    meta: {
      title: 'For kjøpere | Kjøpe eiendom i Ungarn',
      description:
        'Slik kjøper du eiendom i Ungarn på en trygg måte: tospråklig kontrakt, representasjon med fullmakt og tinglysing. I tillegg en gratis søketjeneste.',
    },
    hero: {
      eyebrow: 'For kjøpere',
      title: 'Kjøpe i Ungarn,',
      titleEm: 'uten overraskelser',
      body: 'Mange av annonsene våre oppgir eieren. Du kan forhandle direkte eller overlate hele prosessen til oss.',
      cta: 'Se eiendommer',
      secondary: 'Gratis eiendomssøk',
    },
    services: {
      eyebrow: 'Dette ordner vi',
      title: 'Full støtte',
      points: [
        'Kommunikasjon mellom deg og selger, også via tolk.',
        'Visninger, med en kollega som snakker ditt språk.',
        'Støtte i prisforhandlingen og ved utarbeidelsen av den tospråklige kontrakten.',
        'Representasjon med fullmakt: du trenger ikke reise til Ungarn for å signere.',
        'Tinglysing og overføring av strøm og vann.',
      ],
    },
    reasons: {
      eyebrow: 'Hvorfor Ungarn',
      title: 'Hva vesteuropeiske kjøpere ser etter',
    },
  },

  about: {
    meta: {
      title: 'Om oss | En bro mellom to verdener',
      description:
        'Siden 2013 har vi brakt ungarske selgere og vesteuropeiske kjøpere sammen. Diskret, åpent og uten eksklusivitetsavtale.',
    },
    hero: {
      eyebrow: 'Om oss',
      title: 'En bro mellom',
      titleEm: 'to verdener',
      body: 'Siden 2013 har vi hjulpet ungarske selgere med å finne riktig utenlandsk kjøper: diskret, effektivt og uten eksklusivitetsavtale.',
    },
    origin: {
      eyebrow: 'Begynnelsen · Almere-Buiten, 2013',
      quote:
        '«Da vi bodde i Almere-Buiten, så vi hvor sterkt nederlendere lengter etter en autentisk europeisk livsstil, mens de fineste eiendommene i Ungarn venter upåaktet på en eier.»',
    },
    values: {
      eyebrow: 'Det vi står for',
      title: 'Det vi bygger på',
      items: [
        {
          num: '01',
          title: 'Diskresjon',
          body: 'Vi behandler selgeres og kjøperes opplysninger med størst mulig omhu. Personopplysninger vises bare med samtykke.',
        },
        {
          num: '02',
          title: 'Åpenhet',
          body: 'Ingen skjulte kostnader. Prisene og provisjonen vår er publisert på dette nettstedet, og vi holder deg orientert i hvert steg.',
        },
        {
          num: '03',
          title: 'Tospråklig ekspertise',
          body: 'Vi kjenner begge markedene innenfra. Teamet vårt snakker nederlandsk, tysk, engelsk, fransk og ungarsk.',
        },
      ],
    },
    approach: {
      eyebrow: 'Vår tilnærming',
      title: 'Vi er ikke et stort kontor.',
      titleEm: 'Det er vår styrke.',
      points: [
        'Hver kunde får personlig kontakt: ikke noe kundesenter, ingen anonym skranke.',
        'Vi kjenner begge kulturene innenfra og vurderer eiendommer med både nederlandske og ungarske øyne.',
        'Å bringe eiendom og kjøper sammen er vårt ansvar, ikke en tilfeldighet.',
        'Vi jobber uten eksklusivitet fordi vi heller vil overbevise med resultater.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Broen vi',
      titleEm: 'har bygget',
      paragraphs: [
        'FODEL ble grunnlagt av ungarere bosatt i Nederland. Vi startet i Almere-Buiten i 2013, der vi la merke til hvor mange nederlendere og belgiere som ønsket å kjøpe et autentisk ungarsk hus, men ikke visste hvor de skulle begynne.',
        `I dag annonserer vi i ${REACH_COUNTRIES} land og på ${REACH_LANGUAGES} språk og følger hver handel fra start til slutt: tospråklig kjøpekontrakt, representasjon med fullmakt og tinglysing. Kontoret vårt ligger i Haag.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Vi ringer deg gjerne tilbake',
      description: `Ring oss på hverdager mellom ${COMPANY.hours.weekdays.from} og ${COMPANY.hours.weekdays.to}, eller be om å bli oppringt. Samtalen koster deg ingenting.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Vi ringer gjerne', titleEm: 'deg opp' },
    formTitle: 'Be om å bli oppringt',
    subjects: [
      'Spørsmål om en eiendom',
      'Annonsere en eiendom',
      'Be om priser',
      'Forespørsel om oppringning',
      'Annet',
    ],
    note: `Det koster deg ingenting å bli oppringt: vi betaler samtalen. Vi ringer tilbake fram til kl. ${COMPANY.hours.callback.to}, også i helgene.`,
  },
} satisfies CopyShape;
