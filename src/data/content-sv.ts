/**
 * Long-form pages, Swedish (informal-standard "du"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'sv' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `från ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_SV = {
  services: {
    metaTitle: 'Tjänster: försäljning, avtal, fotografering',
    metaDescription: `Tvåspråkigt köpeavtal ${from('hu')}, ombud med fullmakt, inskrivning i fastighetsregistret, energideklaration, fastighetsfotografering och drönarbilder.`,
    eyebrow: 'Tjänster',
    title: 'Vad vi gör utöver',
    titleEm: 'annonsen',
    intro:
      'Annonsen är bara första steget. Med tjänsterna nedan tar vi hand om hela köpprocessen åt dig, enligt reglerna i båda länderna.',
    sections: [
      {
        type: 'steps',
        title: 'Så går försäljningen till',
        items: [
          { n: '01', t: 'Kontakt', b: 'Rådgivning per telefon och e-post, kommunikation med båda parter, även via tolk.' },
          { n: '02', t: 'Kontroll av köpare', b: 'Vi kontrollerar bakgrund, köpavsikt och ekonomisk ställning.' },
          { n: '03', t: 'Visning', b: 'Vi bokar tider och följer med, tillsammans med en kollega som talar ditt språk.' },
          { n: '04', t: 'Förhandling', b: 'Stöd på båda språken, inom ett realistiskt prisintervall.' },
          { n: '05', t: 'Avtal', b: 'Ett tvåspråkigt köpeavtal, upprättat tillsammans med en advokat.' },
          { n: '06', t: 'Tillträde', b: 'Fastighetsregister, el och vatten samt vid behov ombud med fullmakt.' },
        ],
      },
      {
        type: 'table',
        title: 'Tvåspråkigt köpeavtal',
        intro: 'Vägledande priser per språkkombination. Slutpriset beror på avtalets längd.',
        rows: [
          ['Ungerska', from('hu')],
          ['Tyska–ungerska', from('de-hu')],
          ['Engelska–ungerska', from('en-hu')],
          ['Nederländska–ungerska', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Tilläggstjänster',
        intro: 'För dessa tar vi fram en skräddarsydd offert:',
        items: [
          'Beställning av energideklaration: obligatorisk i annonsen enligt EU:s regler',
          'Professionell fastighetsfotografering',
          'Drönarbilder: särskilt effektivt för stora tomter och utsikter',
          `Video till annonsen (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Ombud med fullmakt',
        body: 'Du behöver inte resa till Ungern för att skriva under: med fullmakt företräder vi dig vid undertecknandet, hos fastighetsregistret och vid överföringen av el och vatten.',
      },
      {
        type: 'prose',
        title: 'När provisionen ska betalas',
        paragraphs: [
          `Vi tar ut provision endast när FODEL har presenterat köparen, det finns ett skriftligt köpeavtal och handpenningen har betalats. Provisionen är ${COMMISSION.percent}\u00a0% netto, minst ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nederländsk moms. Det är säljaren som betalar, inte köparen.`,
        ],
      },
      {
        type: 'cta',
        title: 'Frågor om processen',
        body: '{hours} Be om en kostnadsfri återuppringning eller skriv till oss.',
        primary: { label: 'Kontakta oss', to: 'contact' },
        secondary: { label: 'Vanliga frågor', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Jordbruksfastigheter: upp till ${AGRI_HECTARE_LIMIT} hektar i Ungern`,
    metaDescription: `En EU-medborgare med jordbruksutbildning får förvärva upp till ${AGRI_HECTARE_LIMIT} hektar mark i Ungern. FODEL sköter hela förfarandet.`,
    eyebrow: 'Jordbruksfastigheter',
    title: 'Jordbruksmark och',
    titleEm: 'lantegendomar',
    intro:
      'Den ungerska jordmarknaden har egna regler. Den som känner till villkoren får tillgång till vingårdar, åkermark, gårdar och skog.',
    sections: [
      {
        type: 'prose',
        title: `Gränsen på ${AGRI_HECTARE_LIMIT} hektar`,
        paragraphs: [
          `En EU-medborgare med jordbruksutbildning får förvärva sammanlagt ${AGRI_HECTARE_LIMIT} hektar mark i Ungern. Vi sköter hela det förfarandet.`,
          'Processen har flera steg hos myndigheterna och börjar med att din utbildning erkänns. Vårt team guidar dig genom hela processen och tar fram dokumenten på båda språken.',
        ],
      },
      {
        type: 'list',
        title: 'Vad våra kunder köper',
        items: [
          'Vingårdar, med eller utan fungerande vinkällare',
          'Åkermark som är berättigad till EU-stöd',
          'Gårdar med ekonomibyggnader, lämpliga för djurhållning',
          'Skog och gårdar med blandad användning',
          'Större sammanhängande skiften som investering',
        ],
      },
      {
        type: 'steps',
        title: 'Processen',
        items: [
          { n: '01', t: 'Rådgivning', b: 'Vi går igenom dina planer och din budget.' },
          { n: '02', t: 'Erkännande av utbildning', b: 'Vi ser till att din jordbruksutbildning erkänns i Ungern.' },
          { n: '03', t: 'Sökning', b: 'Tillsammans med våra partner söker vi mark som uppfyller villkoren.' },
          { n: '04', t: 'Tillstånd', b: 'Ansökan om de tillstånd som krävs för att förvärva marken.' },
          { n: '05', t: 'Köp', b: 'Tvåspråkigt avtal, inskrivning i fastighetsregistret, överföring av stödrätter.' },
        ],
      },
      {
        type: 'callout',
        title: 'Viktigt',
        body: 'Reglerna för förvärv av jordbruksmark ändras då och då och beror på din situation. Det som står här är endast information. Rådgör alltid med oss och en specialiserad advokat inför ett konkret köp.',
      },
      {
        type: 'cta',
        title: 'Letar du efter en jordbruksfastighet?',
        body: 'Berätta vad du söker – vi letar även bortom de objekt vi annonserar.',
        primary: { label: 'Kostnadsfri objektsökning', to: 'searchRequest' },
        secondary: { label: 'Våra objekt', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Köpa i Ungern: processen steg för steg',
    metaDescription:
      'Så går ett köp i Ungern till för en utländsk köpare: avtal, handpenning, fastighetsregister, el och vatten samt kostnaderna att räkna med.',
    eyebrow: 'För köpare',
    title: 'Köpa i',
    titleEm: 'Ungern',
    intro:
      'Den ungerska köpprocessen är ganska förutsägbar när du väl känner till stegen. Den här guiden tar dig igenom dem.',
    sections: [
      {
        type: 'steps',
        title: 'Processen',
        items: [
          { n: '01', t: 'Urval', b: 'Du väljer bland våra objekt eller skickar en kostnadsfri sökförfrågan.' },
          { n: '02', t: 'Visning', b: 'Vi ordnar resan och visningen, med tolk.' },
          { n: '03', t: 'Bud', b: 'Vi hjälper dig att lägga ett realistiskt bud och förhandla.' },
          { n: '04', t: 'Avtal och handpenning', b: 'Ett tvåspråkigt köpeavtal, vanligen med 10\u00a0% i handpenning.' },
          { n: '05', t: 'Köpeskilling', b: 'Resten av köpeskillingen via banköverföring enligt avtalet.' },
          { n: '06', t: 'Tillträde', b: 'Inskrivning, el och vatten, nyckelöverlämning.' },
        ],
      },
      {
        type: 'list',
        title: 'Kostnader utöver köpeskillingen',
        items: [
          'Överlåtelseskatt: skattesatsen beror på typ av fastighet och din situation',
          'Advokatarvode för upprättande och kontrasignering av köpehandlingen',
          `Översättning av det tvåspråkiga avtalet: ${from('hu')}, beroende på språkkombination`,
          'Inskrivningsavgifter',
          'Eventuell provision till FODEL: den betalar säljaren, inte du',
        ],
      },
      {
        type: 'prose',
        title: 'Du behöver inte vara på plats',
        paragraphs: [
          'Med fullmakt företräder vi dig vid undertecknandet, vid inskrivningen och när el och vatten förs över. Köpet kan alltså genomföras även om du inte kan eller vill resa.',
        ],
      },
      {
        type: 'callout',
        title: 'Energideklaration',
        body: 'Ungern kräver en energideklaration, som enligt EU:s regler också måste anges i annonsen. I våra annonser hittar du energiklassen bland egenskaperna; ”på gång” betyder att deklarationen fortfarande tas fram.',
      },
      {
        type: 'cta',
        title: 'Ska vi sätta igång?',
        body: 'Bläddra bland objekten eller berätta vad du letar efter. Det kostar dig ingenting.',
        primary: { label: 'Våra objekt', to: 'properties' },
        secondary: { label: 'Kostnadsfri objektsökning', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Flytta till Ungern: därför tar nederländare steget',
    metaDescription:
      'De fyra skälen till att nederländska och belgiska köpare flyttar till Ungern: valuta för pengarna, utrymme, lägre levnadskostnader och läge.',
    eyebrow: 'Bakgrund',
    title: 'Flytta till',
    titleEm: 'Ungern',
    intro:
      'Många nederländare och belgare väljer Ungern. I hundratals samtal med våra kunder återkommer samma fyra skäl gång på gång.',
    sections: [
      {
        type: 'prose',
        title: 'Valuta för pengarna',
        paragraphs: [
          'Ungerska fastigheter på landsbygden hör till de mest prisvärda i Europa. I Nederländerna kostar en tomt på 125 m² lätt 88 000\u00a0€ och ett garage runt 100 000\u00a0€. För samma pengar köper du på den ungerska landsbygden ett rymligt familjehus, ofta med en hel del mark.',
        ],
      },
      {
        type: 'prose',
        title: 'Utrymme',
        paragraphs: [
          'Nederländerna har en befolkningstäthet på 482 invånare per km² med omkring 17 miljoner invånare, och en betydande del av landet är vatten. Platsbristen är inget abstrakt problem utan en vardaglig upplevelse, och det skäl som nämns oftast.',
        ],
      },
      {
        type: 'prose',
        title: 'Levnadskostnader',
        paragraphs: [
          'En stor del av våra köpare är pensionärer eller snart pensionärer. För dem ger lägre levnadskostnader, ingen fastighetsskatt och prisvärd sjukvård tillsammans en levnadsstandard som samma pension inte skulle ge i Nederländerna.',
        ],
      },
      {
        type: 'prose',
        title: 'Läge',
        paragraphs: [
          'Sedan översvämningskatastrofen 1953 har Nederländerna byggt ett enormt system av vallar och skydd. Oron för stigande havsnivåer påverkar många beslut: Ungern ligger mitt på kontinenten, över havsytan.',
        ],
      },
      {
        type: 'cta',
        title: 'Dags att upptäcka',
        body: 'Bläddra bland våra objekt eller låt oss leta efter det du har i tankarna.',
        primary: { label: 'Våra objekt', to: 'properties' },
        secondary: { label: 'Köpa i Ungern', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotoguide för annonsörer',
    metaDescription:
      'Bra bilder är det viktigaste verktyget för en snabb försäljning. FODEL:s fotoguide: ljus, orientering, upplösning och de vanligaste misstagen.',
    eyebrow: 'För säljare',
    title: 'Guide till',
    titleEm: 'fotografering',
    intro:
      'Utländska spekulanter ser bilderna först, ofta bara bilderna. De här reglerna gör mer än någon annonstext.',
    sections: photoGuideSections(L, {
      topTitle: 'De sex viktigaste reglerna',
      calloutTitle: 'Hellre lämna över det?',
      calloutBody: (lines) =>
        `Anlita ett proffs. Du kan välja det med ett klick när du lägger in din annons: ${lines.join('; ')}. Båda är valfria; någon i vårt team kontaktar dig för att boka en tid.`,
      ctaTitle: 'Redo att annonsera din bostad?',
      primary: 'Lägg in annons',
      secondary: 'Priser',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
