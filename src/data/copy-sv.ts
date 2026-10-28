/**
 * Page copy, Swedish (informal-standard "du").
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
const L = 'sv' as const;

export const SV = {
  home: {
    meta: {
      title: 'FINDDOME Real Estates | Köp bostad i Ungern direkt av ägaren',
      description:
        'Hus, gårdar och lantegendomar i Ungern, ofta direkt av ägaren. Vägledning på ditt eget språk och tvåspråkiga köpeavtal.',
    },
    hero: {
      eyebrow: `Sedan 2013 · ${foundedInLabel(L)}`,
      title: ['Bostäder', 'i Ungern', 'direkt av ägaren'],
      emphasis: 1,
      body: 'Många av våra annonser anger ägaren. Du kan förhandla direkt med hen eller överlåta hela processen åt oss.',
      primary: 'Bläddra bland objekt',
      secondary: 'Kostnadsfri objektsökning',
      featuredLabel: 'Utvalda',
    },
    audiences: [
      {
        eyebrow: 'För köpare',
        title: 'Bostäder direkt\nav ägaren',
        body: 'Äkta ungerska hus, gårdar, lantegendomar och vingårdar. Kontakta ägaren direkt eller låt FINDDOME sköta hela processen.',
        cta: 'Bläddra bland objekt',
        to: 'properties',
      },
      {
        eyebrow: 'För säljare',
        title: 'Din ungerska bostad\ni Västeuropa',
        body: `Annonsera på ${REACH_LANGUAGES} språk i ${REACH_COUNTRIES} länder, utan exklusivavtal. Provision bara om vi hittar köparen.`,
        cta: 'Läs mer',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Urval', title: 'Utvalda objekt' },
    quote: '”Nederländare tror ofta inte sina ögon när de ser vad man kan köpa i Ungern, och för hur lite.”',
    quoteSource: `${BRAND.sv.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Så fungerar det', title: 'Så fungerar FINDDOME' },
    cta: {
      eyebrow: 'Kontakta oss',
      title: 'Vi ringer gärna',
      titleEm: 'upp dig',
      body: `{hoursShort} · Att bli uppringd kostar dig ingenting.`,
    },
    referral: {
      eyebrow: 'Värvningsprogram',
      title: 'Tipsa om en annonsör,',
      titleEm: 'få 10\u00a0%',
      body: 'Om någon lägger in en annons hos FINDDOME efter ditt tips får hen 10\u00a0% rabatt på sitt paket, och vi tillgodoräknar dig 10\u00a0% på din nästa annons. Annonserar du redan hos oss? Din egen värvningskod hittar du under Inställningar i portalen.',
      steps: [
        'Tipsa en bekant via formuläret nedan, eller dela din egen länk från portalen',
        'Någon i vårt team kontaktar hen',
        'Om hen lägger in en annons sparar hen 10\u00a0% och du får 10\u00a0% tillgodo',
      ],
      formTitle: 'Tipsa en bekant',
      fields: {
        referrerName: 'Ditt namn',
        referrerEmail: 'Din e-postadress',
        referredName: 'Namn på den du tipsar om',
        referredEmail: 'E-postadress till den du tipsar om',
      },
      submit: 'Skicka tips',
      successTitle: 'Tack för rekommendationen!',
      successBody:
        'Vi har tagit emot den. En kollega kontaktar den du rekommenderade, och vi håller dig uppdaterad via e-post.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Annonseras i ${REACH_COUNTRIES} länder`,
      body: `Vi annonserar på ${REACH_LANGUAGES} språk i Nederländerna, Belgien, Tyskland, England och andra EU-länder, utan exklusivavtal med säljaren.`,
    },
    {
      num: '02',
      title: 'Direktkontakt',
      body: 'Många annonser visar ägarens namn och nummer vid sidan av våra uppgifter. Om ni gör upp sinsemellan betalar ingen provision.',
    },
    {
      num: '03',
      title: 'Hela processen skött åt dig',
      body: 'Tvåspråkigt köpeavtal, ombud med fullmakt, inskrivning i fastighetsregistret och överföring av el och vatten.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Grundat' },
    { value: String(REACH_COUNTRIES), label: 'Länder' },
    { value: String(REACH_LANGUAGES), label: 'Språk' },
    { value: `${COMMISSION.percent}%`, label: 'Provision' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'För säljare | Din ungerska bostad i Västeuropa',
      description: `Annonsera din ungerska bostad på ${REACH_LANGUAGES} språk i ${REACH_COUNTRIES} länder, från ${eur(69, L)} och utan exklusivitet. Provision bara om FINDDOME hittar köparen: ${COMMISSION.percent}\u00a0% + ${COMMISSION.vatPercent}\u00a0% moms.`,
    },
    hero: {
      eyebrow: 'För säljare',
      title: 'Din bostad',
      titleEm: 'i Västeuropa',
      body: `Med FINDDOME-modellen visas din bostad på ${REACH_LANGUAGES} språk i ${REACH_COUNTRIES} länder, utan exklusivavtal. Vi arbetar bara med seriösa köpare.`,
      cta: 'Lägg in annons',
      secondary: 'Se priser',
    },
    benefits: {
      eyebrow: 'Fördelarna',
      title: 'Vad en utländsk köpare tillför',
      points: [
        'Köpare med egna medel: ingen väntan på bolån eller bidrag.',
        'Betalning i ett svep via banköverföring, snabbt och säkert.',
        'Seriösa avsikter: en enda visning kostar dem två dagar och 200–300\u00a0€.',
        'Realistisk prissättning: inget orimligt prutande.',
        'FINDDOME bedömer varje köpare personligen innan någon tid bokas.',
      ],
    },
    personas: {
      eyebrow: 'Köparna',
      title: 'Vilka våra köpare är',
      items: [
        {
          title: 'Pensionärer',
          body: 'Söker lägre levnadskostnader, skattefördelar och prisvärd sjukvård i Ungern.',
        },
        {
          title: 'Familjer',
          body: 'Söker utrymme, natur och liv på landet. Ofta en gård, ett hemman eller ett fritidshus.',
        },
        {
          title: 'Investerare',
          body: 'Söker kommersiella fastigheter, vingårdar och jordbruksmark.',
        },
        {
          title: 'Livsstilsflyttare',
          body: 'Lämnar höga levnadskostnader och trängsel bakom sig, på jakt efter ett genuint europeiskt sätt att leva.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Steg för steg', title: 'FINDDOME-modellen' },
    commission: {
      eyebrow: 'Priser',
      title: 'Provision endast\nvid genomförd försäljning',
      body: `Om köparen kontaktar dig direkt och du inte behöver vår hjälp betalar du ingenting utöver annonsavgiften. Om FINDDOME förmedlar försäljningen: ${COMMISSION.percent}\u00a0% netto (minst ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}\u00a0% nederländsk moms.`,
      cta: 'Se priser',
    },
  },

  buyers: {
    meta: {
      title: 'För köpare | Köpa fastighet i Ungern',
      description:
        'Så köper du en fastighet i Ungern på ett säkert sätt: tvåspråkigt avtal, ombud med fullmakt och inskrivning i fastighetsregistret. Dessutom en kostnadsfri söktjänst.',
    },
    hero: {
      eyebrow: 'För köpare',
      title: 'Köpa i Ungern,',
      titleEm: 'utan överraskningar',
      body: 'Många av våra annonser anger ägaren. Du kan förhandla direkt eller överlåta hela processen åt oss.',
      cta: 'Bläddra bland objekt',
      secondary: 'Kostnadsfri objektsökning',
    },
    services: {
      eyebrow: 'Det här sköter vi',
      title: 'Fullt stöd',
      points: [
        'Kommunikation mellan dig och säljaren, även via tolk.',
        'Visningar, med en kollega som talar ditt språk.',
        'Stöd i prisförhandlingen och när det tvåspråkiga avtalet upprättas.',
        'Ombud med fullmakt: du behöver inte resa till Ungern för att skriva under.',
        'Inskrivning i fastighetsregistret och överföring av el och vatten.',
      ],
    },
    reasons: {
      eyebrow: 'Varför Ungern',
      title: 'Vad västeuropeiska köpare söker',
    },
  },

  about: {
    meta: {
      title: 'Om oss | En bro mellan två världar',
      description:
        'Sedan 2013 för vi samman ungerska säljare och västeuropeiska köpare. Diskret, transparent och utan exklusivitetsavtal.',
    },
    hero: {
      eyebrow: 'Om oss',
      title: 'En bro mellan',
      titleEm: 'två världar',
      body: 'Sedan 2013 hjälper vi ungerska säljare att hitta rätt utländsk köpare: diskret, effektivt och utan exklusivitetsavtal.',
    },
    origin: {
      eyebrow: 'Början · Almere-Buiten, 2013',
      quote:
        '”När vi bodde i Almere-Buiten såg vi hur mycket nederländare längtar efter ett genuint europeiskt sätt att leva, medan de finaste fastigheterna i Ungern väntar obemärkt på en ägare.”',
    },
    values: {
      eyebrow: 'Det vi står för',
      title: 'Det vi bygger på',
      items: [
        {
          num: '01',
          title: 'Diskretion',
          body: 'Vi hanterar säljares och köpares uppgifter med största möjliga omsorg. Personuppgifter visas bara med samtycke.',
        },
        {
          num: '02',
          title: 'Transparens',
          body: 'Inga dolda kostnader. Våra priser och vår provision finns publicerade på den här webbplatsen, och vi håller dig informerad i varje steg.',
        },
        {
          num: '03',
          title: 'Tvåspråkig expertis',
          body: 'Vi känner båda marknaderna inifrån. Vårt team talar nederländska, tyska, engelska, franska och ungerska.',
        },
      ],
    },
    approach: {
      eyebrow: 'Vårt arbetssätt',
      title: 'Vi är inget stort kontor.',
      titleEm: 'Det är vår styrka.',
      points: [
        'Varje kund får personlig kontakt: inget callcenter, ingen anonym disk.',
        'Vi känner båda kulturerna inifrån och bedömer fastigheter med både nederländska och ungerska ögon.',
        'Att föra samman fastighet och köpare är vårt ansvar, inte en slump.',
        'Vi arbetar utan exklusivitet eftersom vi hellre övertygar med resultat.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Bron vi',
      titleEm: 'har byggt',
      paragraphs: [
        'FINDDOME grundades av ungrare bosatta i Nederländerna. Vi började i Almere-Buiten 2013, där vi märkte hur många nederländare och belgare som ville köpa ett genuint ungerskt hus men inte visste var de skulle börja.',
        `I dag annonserar vi i ${REACH_COUNTRIES} länder och på ${REACH_LANGUAGES} språk och följer varje affär från början till slut: tvåspråkigt köpeavtal, ombud med fullmakt och inskrivning i fastighetsregistret. Vårt kontor ligger i Haag.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Vi ringer gärna upp dig',
      description: `Ring oss på vardagar mellan ${COMPANY.hours.weekdays.from} och ${COMPANY.hours.weekdays.to}, eller be om att bli uppringd. Samtalet kostar dig ingenting.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Vi ringer gärna', titleEm: 'upp dig' },
    formTitle: 'Be om återuppringning',
    submit: 'Begär återuppringning',
    subjects: [
      'Fråga om en fastighet',
      'Annonsera en fastighet',
      'Begär priser',
      'Förfrågan om återuppringning',
      'Annat',
    ],
    note: `Återuppringningen kostar dig ingenting: vi betalar samtalet. Vi ringer tillbaka fram till ${COMPANY.hours.callback.to}, även på helger.`,
  },
} satisfies CopyShape;
