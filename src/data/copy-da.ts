/**
 * Page copy, Danish (informal-standard "du").
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
const L = 'da' as const;

export const DA = {
  home: {
    meta: {
      title: 'FINDDOME Real Estates | Køb ejendom i Ungarn direkte fra ejeren',
      description:
        'Huse, gårde og landejendomme i Ungarn, ofte direkte fra ejeren. Vejledning på dit eget sprog og tosprogede købsaftaler.',
    },
    hero: {
      eyebrow: `Siden 2013 · ${foundedInLabel(L)}`,
      title: ['Annoncér', 'din ejendom', 'i Europa'],
      emphasis: 1,
      body: 'Upload din annonce i få trin. Vi gennemgår den, og efter onlinebetaling bliver den vist på vores hjemmeside på 21 sprog, uden eksklusivaftale. Interesserede kontakter dig direkte eller via os.',
      primary: 'Se ejendomme',
      secondary: 'Gratis ejendomssøgning',
      featuredLabel: 'Udvalgte',
    },
    audiences: [
      {
        eyebrow: 'For købere',
        title: 'Ejendomme direkte\nfra ejeren',
        body: 'Autentiske ungarske huse, gårde, landejendomme og vinmarker. Kontakt ejeren direkte, eller lad FINDDOME klare hele forløbet.',
        cta: 'Se ejendomme',
        to: 'properties',
      },
      {
        eyebrow: 'For sælgere',
        title: 'Din ungarske ejendom\ni Vesteuropa',
        body: `Annoncér på ${REACH_LANGUAGES} sprog i ${REACH_COUNTRIES} lande uden eneretsaftale. Provision kun, hvis vi skaffer køberen.`,
        cta: 'Læs mere',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Udvælgelse', title: 'Udvalgte ejendomme' },
    quote: '”Hollændere kan ofte ikke tro deres egne øjne, når de ser, hvad man kan købe i Ungarn, og til hvilken pris.”',
    quoteSource: `${BRAND.da.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Sådan fungerer det', title: 'Sådan fungerer FINDDOME' },
    cta: {
      eyebrow: 'Kontakt os',
      title: 'Vi ringer gerne',
      titleEm: 'dig op',
      body: `{hoursShort} · Det koster dig ingenting at blive ringet op.`,
    },
    referral: {
      eyebrow: 'Henvisningsprogram',
      title: 'Anbefal en annoncør,',
      titleEm: 'få 10\u00a0%',
      body: 'Hvis nogen opretter en annonce hos FINDDOME efter din anbefaling, får vedkommende 10\u00a0% rabat på sin pakke, og vi godskriver dig 10\u00a0% på din næste annonce. Annoncerer du allerede hos os? Din egen henvisningskode finder du under Indstillinger i portalen.',
      steps: [
        'Anbefal en bekendt via formularen nedenfor, eller del dit eget link fra portalen',
        'En fra vores team kontakter vedkommende',
        'Hvis vedkommende opretter en annonce, sparer de 10\u00a0%, og vi godskriver dig 10\u00a0%',
      ],
      formTitle: 'Anbefal en bekendt',
      fields: {
        referrerName: 'Dit navn',
        referrerEmail: 'Din e-mailadresse',
        referredName: 'Navn på den, du anbefaler',
        referredEmail: 'E-mailadresse på den, du anbefaler',
      },
      submit: 'Send anbefaling',
      successTitle: 'Tak for anbefalingen!',
      successBody:
        'Vi har modtaget den. En kollega kontakter den anbefalede person, og vi holder dig opdateret på e-mail.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Annonceret i ${REACH_COUNTRIES} lande`,
      body: `Vi annoncerer på ${REACH_LANGUAGES} sprog i Holland, Belgien, Tyskland, England og andre EU-lande uden eneretsaftale med sælger.`,
    },
    {
      num: '02',
      title: 'Direkte kontakt',
      body: 'Mange annoncer viser ejerens navn og nummer ved siden af vores oplysninger. Hvis I aftaler det indbyrdes, betaler ingen provision.',
    },
    {
      num: '03',
      title: 'Hele forløbet klaret for dig',
      body: 'Tosproget købsaftale, repræsentation ved fuldmagt, tinglysning og overdragelse af forsyninger.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Grundlagt' },
    { value: String(REACH_COUNTRIES), label: 'Lande' },
    { value: String(REACH_LANGUAGES), label: 'Sprog' },
    { value: `${COMMISSION.percent}%`, label: 'Provision' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'For sælgere | Din ungarske ejendom i Vesteuropa',
      description: `Annoncér din ungarske ejendom på ${REACH_LANGUAGES} sprog i ${REACH_COUNTRIES} lande, fra ${eur(69, L)} og uden eneret. Provision kun, hvis FINDDOME skaffer køberen: ${COMMISSION.percent}\u00a0% + ${COMMISSION.vatPercent}\u00a0% moms.`,
    },
    hero: {
      eyebrow: 'For sælgere',
      title: 'Din ejendom',
      titleEm: 'i Vesteuropa',
      body: `Med FINDDOME-modellen vises din ejendom på ${REACH_LANGUAGES} sprog i ${REACH_COUNTRIES} lande uden eneretsaftale. Vi arbejder kun med seriøse købere.`,
      cta: 'Opret annonce',
      secondary: 'Se priser',
    },
    benefits: {
      eyebrow: 'Fordelene',
      title: 'Hvad en udenlandsk køber bidrager med',
      points: [
        'Købere med egne midler: ingen ventetid på lån eller tilskud.',
        'Betaling i ét hug via bankoverførsel, hurtigt og sikkert.',
        'Seriøse hensigter: en enkelt fremvisning koster dem to dage og 200–300\u00a0€.',
        'Realistisk prissætning: ingen urimelig prutning.',
        'FINDDOME vurderer hver køber personligt, før der aftales et møde.',
      ],
    },
    personas: {
      eyebrow: 'Køberne',
      title: 'Hvem vores købere er',
      items: [
        {
          title: 'Pensionister',
          body: 'Søger lavere leveomkostninger, skattefordele og overkommelig sundhedspleje i Ungarn.',
        },
        {
          title: 'Familier',
          body: 'Søger plads, natur og livet på landet. Ofte et landbrug, en gård eller et sommerhus.',
        },
        {
          title: 'Investorer',
          body: 'Søger erhvervsejendomme, vingårde og landbrugsjord.',
        },
        {
          title: 'Livsstilsudvandrere',
          body: 'Forlader høje leveomkostninger og trængsel til fordel for en autentisk europæisk livsstil.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Trin for trin', title: 'FINDDOME-modellen' },
    commission: {
      eyebrow: 'Priser',
      title: 'Salær kun\nved gennemført salg',
      body: `Hvis køberen kontakter dig direkte, og du ikke har brug for vores hjælp, betaler du intet ud over annoncegebyret. Hvis FINDDOME formidler salget: ${COMMISSION.percent}\u00a0% netto (min. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}\u00a0% hollandsk moms.`,
      cta: 'Se priser',
    },
  },

  buyers: {
    meta: {
      title: 'For købere | Køb af ejendom i Ungarn',
      description:
        'Sådan køber du sikkert ejendom i Ungarn: tosproget aftale, repræsentation ved fuldmagt og tinglysning. Plus en gratis søgeservice.',
    },
    hero: {
      eyebrow: 'For købere',
      title: 'Køb i Ungarn,',
      titleEm: 'uden overraskelser',
      body: 'Mange af vores annoncer oplyser ejeren. Du kan forhandle direkte eller overlade hele forløbet til os.',
      cta: 'Se ejendomme',
      secondary: 'Gratis ejendomssøgning',
    },
    services: {
      eyebrow: 'Det klarer vi',
      title: 'Fuld støtte',
      points: [
        'Kommunikation mellem dig og sælger, også via tolk.',
        'Fremvisninger med en kollega, der taler dit sprog.',
        'Støtte i prisforhandlingen og ved udarbejdelsen af den tosprogede aftale.',
        'Repræsentation ved fuldmagt: du behøver ikke rejse til Ungarn for at skrive under.',
        'Tinglysning og overdragelse af forsyninger.',
      ],
    },
    reasons: {
      eyebrow: 'Hvorfor Ungarn',
      title: 'Hvad vesteuropæiske købere søger',
    },
  },

  about: {
    meta: {
      title: 'Om os | En bro mellem to verdener',
      description:
        'Siden 2013 har vi bragt ungarske sælgere og vesteuropæiske købere sammen. Diskret, gennemsigtigt og uden eksklusivaftale.',
    },
    hero: {
      eyebrow: 'Om os',
      title: 'En bro mellem',
      titleEm: 'to verdener',
      body: 'Siden 2013 har vi hjulpet ungarske sælgere med at finde den rette udenlandske køber: diskret, effektivt og uden eksklusivaftale.',
    },
    origin: {
      eyebrow: 'Begyndelsen · Almere-Buiten, 2013',
      quote:
        '“Da vi boede i Almere-Buiten, så vi, hvor meget hollændere længes efter en autentisk europæisk livsstil, mens de smukkeste ejendomme i Ungarn venter upåagtet på en ejer.”',
    },
    values: {
      eyebrow: 'Det, vi står for',
      title: 'Det, vi bygger på',
      items: [
        {
          num: '01',
          title: 'Diskretion',
          body: 'Vi behandler sælgeres og køberes oplysninger med størst mulig omhu. Personoplysninger vises kun med samtykke.',
        },
        {
          num: '02',
          title: 'Gennemsigtighed',
          body: 'Ingen skjulte omkostninger. Vores priser og salær er offentliggjort på dette websted, og vi holder dig orienteret undervejs.',
        },
        {
          num: '03',
          title: 'Tosproget ekspertise',
          body: 'Vi kender begge markeder indefra. Vores team taler hollandsk, tysk, engelsk, fransk og ungarsk.',
        },
      ],
    },
    approach: {
      eyebrow: 'Vores tilgang',
      title: 'Vi er ikke et stort kontor.',
      titleEm: 'Det er vores styrke.',
      points: [
        'Hver kunde får personlig kontakt: intet callcenter, ingen anonym skranke.',
        'Vi kender begge kulturer indefra og vurderer ejendomme med både hollandske og ungarske øjne.',
        'At bringe ejendom og køber sammen er vores ansvar, ikke et tilfælde.',
        'Vi arbejder uden eksklusivitet, fordi vi hellere vil overbevise med resultater.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Broen, vi',
      titleEm: 'har bygget',
      paragraphs: [
        'FINDDOME blev grundlagt af ungarere bosat i Nederlandene. Vi begyndte i Almere-Buiten i 2013, hvor vi lagde mærke til, hvor mange hollændere og belgiere der ønskede at købe et autentisk ungarsk hus, men ikke vidste, hvor de skulle begynde.',
        `I dag annoncerer vi i ${REACH_COUNTRIES} lande og på ${REACH_LANGUAGES} sprog og følger hver handel fra start til slut: tosproget købsaftale, repræsentation ved fuldmagt og tinglysning. Vores kontor ligger i Haag.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Vi ringer gerne tilbage',
      description: `Ring til os på hverdage mellem ${COMPANY.hours.weekdays.from} og ${COMPANY.hours.weekdays.to}, eller bed om at blive ringet op. Opkaldet koster dig ingenting.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Vi ringer gerne', titleEm: 'dig op' },
    formTitle: 'Bed om at blive ringet op',
    submit: 'Bed om at blive ringet op',
    subjects: [
      'Spørgsmål om en ejendom',
      'Annoncere en ejendom',
      'Anmod om priser',
      'Anmodning om opkald',
      'Andet',
    ],
    note: `Opkaldet koster dig ingenting: vi betaler for samtalen. Vi ringer tilbage indtil kl. ${COMPANY.hours.callback.to}, også i weekenden.`,
  },
} satisfies CopyShape;
