/**
 * Long-form pages, Danish (informal-standard "du"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'da' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `fra ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_DA = {
  services: {
    metaTitle: 'Ydelser: håndtering af salget, kontrakter, fotografering',
    metaDescription: `Tosproget købsaftale ${from('hu')}, repræsentation ved fuldmagt, tinglysning, energimærke, ejendomsfotografering og droneoptagelser.`,
    eyebrow: 'Ydelser',
    title: 'Det, vi gør ud over',
    titleEm: 'annoncen',
    intro:
      'Annoncen er kun første skridt. Med ydelserne nedenfor tager vi hele købsprocessen ud af dine hænder i overensstemmelse med reglerne i begge lande.',
    sections: [
      {
        type: 'steps',
        title: 'Sådan foregår salget',
        items: [
          { n: '01', t: 'Kontakt', b: 'Rådgivning pr. telefon og e-mail, kommunikation med begge parter, også via tolk.' },
          { n: '02', t: 'Screening af købere', b: 'Vi tjekker baggrund, købsintention og økonomisk situation.' },
          { n: '03', t: 'Fremvisning', b: 'Vi aftaler tidspunkter og tager med, sammen med en kollega, der taler dit sprog.' },
          { n: '04', t: 'Forhandling', b: 'Støtte på begge sprog inden for et realistisk prisniveau.' },
          { n: '05', t: 'Kontrakt', b: 'En tosproget købsaftale, udarbejdet sammen med en advokat.' },
          { n: '06', t: 'Overtagelse', b: 'Tinglysning, forsyninger og om nødvendigt repræsentation ved fuldmagt.' },
        ],
      },
      {
        type: 'table',
        title: 'Tosproget købsaftale',
        intro: 'Vejledende priser pr. sprogkombination. Den endelige pris afhænger af kontraktens længde.',
        rows: [
          ['Ungarsk', from('hu')],
          ['Tysk–ungarsk', from('de-hu')],
          ['Engelsk–ungarsk', from('en-hu')],
          ['Nederlandsk–ungarsk', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Tillægsydelser',
        intro: 'Her udarbejder vi et skræddersyet tilbud:',
        items: [
          'Bestilling af energimærke: obligatorisk i annoncen efter EU-reglerne',
          'Professionel ejendomsfotografering',
          'Droneoptagelser: særligt effektive ved store grunde og udsigter',
          `Video til annoncen (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Repræsentation ved fuldmagt',
        body: 'Du behøver ikke rejse til Ungarn for at skrive under: med fuldmagt repræsenterer vi dig ved underskrivelsen, ved tinglysningen og ved overdragelsen af forsyningerne.',
      },
      {
        type: 'prose',
        title: 'Hvornår salæret skal betales',
        paragraphs: [
          `Vi opkræver kun salær, når FODEL har formidlet køberen, der foreligger en skriftlig købsaftale, og depositummet er betalt. Satsen er ${COMMISSION.percent}\u00a0% netto, dog mindst ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% hollandsk moms. Det er sælger, der betaler, ikke køber.`,
        ],
      },
      {
        type: 'cta',
        title: 'Spørgsmål om forløbet',
        body: '{hours} Bed om et gratis opkald, eller skriv til os.',
        primary: { label: 'Kontakt os', to: 'contact' },
        secondary: { label: 'Ofte stillede spørgsmål', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Landbrugsejendomme: op til ${AGRI_HECTARE_LIMIT} hektar i Ungarn`,
    metaDescription: `En EU-borger med landbrugsuddannelse kan erhverve op til ${AGRI_HECTARE_LIMIT} hektar jord i Ungarn. FODEL håndterer hele proceduren.`,
    eyebrow: 'Landbrugsejendomme',
    title: 'Landbrugsjord og',
    titleEm: 'landejendomme',
    intro:
      'Det ungarske jordmarked har sine egne regler. Kender du betingelserne, får du adgang til vinmarker, agerjord, gårde og skov.',
    sections: [
      {
        type: 'prose',
        title: `Grænsen på ${AGRI_HECTARE_LIMIT} hektar`,
        paragraphs: [
          `En EU-borger med en landbrugsuddannelse må i alt erhverve ${AGRI_HECTARE_LIMIT} hektar jord i Ungarn. Vi håndterer hele den procedure.`,
          'Processen har flere trin hos myndighederne og begynder med anerkendelse af din uddannelse. Vores team guider dig gennem hele forløbet og udarbejder dokumenterne på begge sprog.',
        ],
      },
      {
        type: 'list',
        title: 'Hvad vores kunder køber',
        items: [
          'Vinmarker med eller uden fungerende vinkælder',
          'Agerjord, der er berettiget til EU-støtte',
          'Gårde med udbygninger, egnet til husdyr',
          'Skov og ejendomme med blandet anvendelse',
          'Større sammenhængende arealer som investering',
        ],
      },
      {
        type: 'steps',
        title: 'Forløbet',
        items: [
          { n: '01', t: 'Rådgivning', b: 'Vi gennemgår dine planer og dit budget.' },
          { n: '02', t: 'Anerkendelse af uddannelse', b: 'Vi sørger for, at din landbrugsuddannelse bliver anerkendt i Ungarn.' },
          { n: '03', t: 'Søgning', b: 'Sammen med vores partnere finder vi jord, der opfylder betingelserne.' },
          { n: '04', t: 'Tilladelser', b: 'Ansøgning om de tilladelser, der kræves for at erhverve jorden.' },
          { n: '05', t: 'Køb', b: 'Tosproget kontrakt, tinglysning, overdragelse af støtterettigheder.' },
        ],
      },
      {
        type: 'callout',
        title: 'Vigtigt',
        body: 'Reglerne for erhvervelse af landbrugsjord ændres fra tid til anden og afhænger af din situation. Det, der står her, er kun til orientering. Ved et konkret projekt bør du altid rådføre dig med os og en specialiseret advokat.',
      },
      {
        type: 'cta',
        title: 'Leder du efter en landbrugsejendom?',
        body: 'Fortæl os, hvad du søger – vi leder også ud over de ejendomme, vi annoncerer.',
        primary: { label: 'Gratis ejendomssøgning', to: 'searchRequest' },
        secondary: { label: 'Vores ejendomme', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Køb i Ungarn: processen trin for trin',
    metaDescription:
      'Sådan foregår et køb i Ungarn for en udenlandsk køber: kontrakt, depositum, tinglysning, forsyninger og de omkostninger, du skal regne med.',
    eyebrow: 'For købere',
    title: 'Køb i',
    titleEm: 'Ungarn',
    intro:
      'Den ungarske købsproces er ret forudsigelig, når du kender trinnene. Denne guide fører dig igennem dem.',
    sections: [
      {
        type: 'steps',
        title: 'Forløbet',
        items: [
          { n: '01', t: 'Udvælgelse', b: 'Du vælger blandt vores ejendomme eller sender en gratis søgeanmodning.' },
          { n: '02', t: 'Fremvisning', b: 'Vi arrangerer rejsen og fremvisningen med tolk.' },
          { n: '03', t: 'Bud', b: 'Vi hjælper dig med at give et realistisk bud og forhandle.' },
          { n: '04', t: 'Kontrakt og depositum', b: 'En tosproget købsaftale, normalt med et depositum på 10\u00a0%.' },
          { n: '05', t: 'Købesum', b: 'Resten af købesummen via bankoverførsel som aftalt i kontrakten.' },
          { n: '06', t: 'Overtagelse', b: 'Tinglysning, forsyninger, overdragelse af nøgler.' },
        ],
      },
      {
        type: 'list',
        title: 'Omkostninger ud over købesummen',
        items: [
          'Overdragelsesafgift: satsen afhænger af ejendomstypen og din situation',
          'Advokatsalær for udarbejdelse og kontrasignering af skødet',
          `Oversættelse af den tosprogede kontrakt: ${from('hu')}, afhængigt af sprogkombinationen`,
          'Tinglysningsafgift',
          'Eventuel provision til FODEL: den betaler sælger, ikke dig',
        ],
      },
      {
        type: 'prose',
        title: 'Du behøver ikke at være til stede',
        paragraphs: [
          'Med fuldmagt repræsenterer vi dig ved underskrivelsen, ved tinglysningen og når forsyningerne overdrages. Købet kan derfor gennemføres, selv om du ikke kan eller vil rejse.',
        ],
      },
      {
        type: 'callout',
        title: 'Energimærke',
        body: 'Ungarn kræver et energimærke, som ifølge EU-reglerne også skal fremgå af annoncen. I vores annoncer finder du mærket under egenskaberne; ”afventer” betyder, at energimærket stadig er under udarbejdelse.',
      },
      {
        type: 'cta',
        title: 'Skal vi gå i gang?',
        body: 'Se ejendommene, eller fortæl os, hvad du leder efter. Det koster dig ingenting.',
        primary: { label: 'Vores ejendomme', to: 'properties' },
        secondary: { label: 'Gratis ejendomssøgning', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Flytte til Ungarn: derfor tager hollændere springet',
    metaDescription:
      'De fire grunde til, at hollandske og belgiske købere flytter til Ungarn: valuta for pengene, plads, lavere leveomkostninger og beliggenhed.',
    eyebrow: 'Baggrund',
    title: 'Flytte til',
    titleEm: 'Ungarn',
    intro:
      'Mange hollændere og belgiere vælger Ungarn. I hundredvis af samtaler med vores kunder dukker de samme fire grunde op igen og igen.',
    sections: [
      {
        type: 'prose',
        title: 'Valuta for pengene',
        paragraphs: [
          'Ungarske landejendomme er blandt de mest prisvenlige i Europa. I Holland koster en byggegrund på 125 m² hurtigt 88.000\u00a0€ og en garage omkring 100.000\u00a0€. For de samme penge køber du på det ungarske landet et rummeligt familiehus, ofte med en god portion jord.',
        ],
      },
      {
        type: 'prose',
        title: 'Plads',
        paragraphs: [
          'Holland har en befolkningstæthed på 482 indbyggere pr. km² med omkring 17 millioner indbyggere, og en betydelig del af landet er vand. Pladsmanglen er ikke et abstrakt problem, men en daglig oplevelse og den grund, der nævnes oftest.',
        ],
      },
      {
        type: 'prose',
        title: 'Leveomkostninger',
        paragraphs: [
          'En stor del af vores købere er pensionister eller tæt på. For dem giver lavere leveomkostninger, ingen ejendomsskat og billig sundhedspleje tilsammen en levestandard, som den samme pension ikke ville give i Holland.',
        ],
      },
      {
        type: 'prose',
        title: 'Beliggenhed',
        paragraphs: [
          'Siden stormflodskatastrofen i 1953 har Holland bygget et enormt system af diger og stormflodssikring. Bekymringen for stigende havniveau spiller ind i mange beslutninger: Ungarn ligger midt på kontinentet, over havets overflade.',
        ],
      },
      {
        type: 'cta',
        title: 'Tid til at udforske',
        body: 'Se vores ejendomme, eller lad os finde det, du har i tankerne.',
        primary: { label: 'Vores ejendomme', to: 'properties' },
        secondary: { label: 'Køb i Ungarn', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotoguide for annoncører',
    metaDescription:
      'Gode billeder er det vigtigste værktøj til et hurtigt salg. FODELs fotoguide: lys, retning, opløsning og de mest almindelige fejl.',
    eyebrow: 'For sælgere',
    title: 'Guide til',
    titleEm: 'fotografering',
    intro:
      'Udenlandske interesserede ser billederne først, ofte kun billederne. Disse regler gør mere end nogen annoncetekst.',
    sections: photoGuideSections(L, {
      topTitle: 'De seks vigtigste regler',
      calloutTitle: 'Vil du hellere overlade det til andre?',
      calloutBody: (lines) =>
        `Få en professionel ind. Du kan vælge det med ét klik, når du opretter din annonce: ${lines.join('; ')}. Begge dele er valgfrie; en fra vores team kontakter dig for at aftale en dato.`,
      ctaTitle: 'Klar til at annoncere din ejendom?',
      primary: 'Opret annonce',
      secondary: 'Priser',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
