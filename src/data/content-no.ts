/**
 * Long-form pages, Norwegian Bokmål (informal-standard "du"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'no' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `fra ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_NO = {
  services: {
    metaTitle: 'Tjenester: gjennomføring av salget, kontrakter, fotografering',
    metaDescription: `Tospråklig kjøpekontrakt ${from('hu')}, representasjon med fullmakt, tinglysing, energiattest, eiendomsfotografering og droneopptak.`,
    eyebrow: 'Tjenester',
    title: 'Hva vi gjør utover',
    titleEm: 'annonsen',
    intro:
      'Annonsen er bare første steg. Med tjenestene nedenfor tar vi hånd om hele kjøpsprosessen for deg, i tråd med reglene i begge land.',
    sections: [
      {
        type: 'steps',
        title: 'Slik foregår salget',
        items: [
          { n: '01', t: 'Kontakt', b: 'Rådgivning på telefon og e-post, kommunikasjon med begge parter, også via tolk.' },
          { n: '02', t: 'Kontroll av kjøpere', b: 'Vi sjekker bakgrunn, kjøpsintensjon og økonomisk situasjon.' },
          { n: '03', t: 'Visning', b: 'Vi avtaler tidspunkter og blir med, sammen med en kollega som snakker ditt språk.' },
          { n: '04', t: 'Forhandling', b: 'Støtte på begge språk, innenfor et realistisk prisnivå.' },
          { n: '05', t: 'Kontrakt', b: 'En tospråklig kjøpekontrakt, utarbeidet sammen med en advokat.' },
          { n: '06', t: 'Overtakelse', b: 'Tinglysing, strøm og vann og ved behov representasjon med fullmakt.' },
        ],
      },
      {
        type: 'table',
        title: 'Tospråklig kjøpekontrakt',
        intro: 'Veiledende priser per språkkombinasjon. Endelig pris avhenger av kontraktens lengde.',
        rows: [
          ['Ungarsk', from('hu')],
          ['Tysk–ungarsk', from('de-hu')],
          ['Engelsk–ungarsk', from('en-hu')],
          ['Nederlandsk–ungarsk', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Tilleggstjenester',
        intro: 'For disse lager vi et skreddersydd tilbud:',
        items: [
          'Bestilling av energiattest: påkrevd i annonsen etter EU-reglene',
          'Profesjonell eiendomsfotografering',
          'Droneopptak: spesielt effektivt for store tomter og utsikt',
          `Video til annonsen (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Representasjon med fullmakt',
        body: 'Du trenger ikke reise til Ungarn for å signere: med fullmakt representerer vi deg ved signeringen, ved tinglysingen og ved overføringen av strøm og vann.',
      },
      {
        type: 'prose',
        title: 'Når provisjonen forfaller',
        paragraphs: [
          `Vi tar provisjon bare når FODEL har formidlet kjøperen, det foreligger en skriftlig kjøpekontrakt og depositumet er betalt. Satsen er ${COMMISSION.percent}\u00a0% netto, minst ${eur(COMMISSION.minimumEur, L)}, pluss ${COMMISSION.vatPercent}\u00a0% nederlandsk merverdiavgift. Det er selger som betaler, ikke kjøper.`,
        ],
      },
      {
        type: 'cta',
        title: 'Spørsmål om prosessen',
        body: '{hours} Be om å bli oppringt gratis, eller skriv til oss.',
        primary: { label: 'Kontakt oss', to: 'contact' },
        secondary: { label: 'Ofte stilte spørsmål', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Landbrukseiendommer: opptil ${AGRI_HECTARE_LIMIT} hektar i Ungarn`,
    metaDescription: `En EU-borger med landbruksutdanning kan erverve opptil ${AGRI_HECTARE_LIMIT} hektar jord i Ungarn. FODEL håndterer hele prosessen.`,
    eyebrow: 'Landbrukseiendommer',
    title: 'Landbruksjord og',
    titleEm: 'landeiendommer',
    intro:
      'Det ungarske jordmarkedet har egne regler. Kjenner du vilkårene, får du tilgang til vinmarker, dyrket mark, gårder og skog.',
    sections: [
      {
        type: 'prose',
        title: `Grensen på ${AGRI_HECTARE_LIMIT} hektar`,
        paragraphs: [
          `En EU-borger med landbruksutdanning kan til sammen erverve ${AGRI_HECTARE_LIMIT} hektar jord i Ungarn. Vi håndterer hele prosessen.`,
          'Prosessen har flere trinn hos myndighetene og begynner med godkjenning av utdanningen din. Teamet vårt guider deg gjennom hele prosessen og utarbeider dokumentene på begge språk.',
        ],
      },
      {
        type: 'list',
        title: 'Hva kundene våre kjøper',
        items: [
          'Vinmarker med eller uten vinkjeller i drift',
          'Dyrket mark som gir rett til EU-støtte',
          'Gårder med uthus, egnet for husdyr',
          'Skog og eiendommer med blandet bruk',
          'Større sammenhengende arealer som investering',
        ],
      },
      {
        type: 'steps',
        title: 'Prosessen',
        items: [
          { n: '01', t: 'Rådgivning', b: 'Vi går gjennom planene dine og budsjettet ditt.' },
          { n: '02', t: 'Godkjenning av utdanning', b: 'Vi sørger for at landbruksutdanningen din blir godkjent i Ungarn.' },
          { n: '03', t: 'Søk', b: 'Sammen med partnerne våre leter vi etter jord som oppfyller vilkårene.' },
          { n: '04', t: 'Tillatelser', b: 'Søknad om tillatelsene som kreves for å erverve jorden.' },
          { n: '05', t: 'Kjøp', b: 'Tospråklig kontrakt, tinglysing, overføring av tilskuddsrettigheter.' },
        ],
      },
      {
        type: 'callout',
        title: 'Viktig',
        body: 'Reglene for erverv av landbruksjord endres fra tid til annen og avhenger av din situasjon. Det som står her, er kun til informasjon. Ved et konkret prosjekt bør du alltid rådføre deg med oss og en spesialisert advokat.',
      },
      {
        type: 'cta',
        title: 'Ser du etter en landbrukseiendom?',
        body: 'Fortell oss hva du ønsker – vi leter også utover eiendommene vi annonserer.',
        primary: { label: 'Gratis eiendomssøk', to: 'searchRequest' },
        secondary: { label: 'Våre eiendommer', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Kjøpe i Ungarn: prosessen steg for steg',
    metaDescription:
      'Slik foregår et kjøp i Ungarn for en utenlandsk kjøper: kontrakt, depositum, tinglysing, strøm og vann og kostnadene du må regne med.',
    eyebrow: 'For kjøpere',
    title: 'Kjøpe i',
    titleEm: 'Ungarn',
    intro:
      'Den ungarske kjøpsprosessen er ganske forutsigbar når du kjenner trinnene. Denne guiden tar deg gjennom dem.',
    sections: [
      {
        type: 'steps',
        title: 'Prosessen',
        items: [
          { n: '01', t: 'Utvalg', b: 'Du velger blant eiendommene våre eller sender en gratis søkeforespørsel.' },
          { n: '02', t: 'Visning', b: 'Vi organiserer reisen og visningen, med tolk.' },
          { n: '03', t: 'Bud', b: 'Vi hjelper deg å legge inn et realistisk bud og forhandle.' },
          { n: '04', t: 'Kontrakt og depositum', b: 'En tospråklig kjøpekontrakt, vanligvis med 10\u00a0% depositum.' },
          { n: '05', t: 'Kjøpesum', b: 'Resten av kjøpesummen via bankoverføring, slik kontrakten fastsetter.' },
          { n: '06', t: 'Overtakelse', b: 'Tinglysing, strøm og vann, overlevering av nøkler.' },
        ],
      },
      {
        type: 'list',
        title: 'Kostnader i tillegg til kjøpesummen',
        items: [
          'Overdragelsesavgift: satsen avhenger av eiendomstype og situasjonen din',
          'Advokatsalær for utarbeidelse og kontrasignering av skjøtet',
          `Oversettelse av den tospråklige kontrakten: ${from('hu')}, avhengig av språkkombinasjonen`,
          'Tinglysingsgebyr',
          'Eventuell provisjon til FODEL: den betaler selgeren, ikke du',
        ],
      },
      {
        type: 'prose',
        title: 'Du trenger ikke være til stede',
        paragraphs: [
          'Med fullmakt representerer vi deg ved signeringen, ved tinglysingen og når strøm og vann overføres. Kjøpet kan dermed gjennomføres selv om du ikke kan eller vil reise.',
        ],
      },
      {
        type: 'callout',
        title: 'Energiattest',
        body: 'Ungarn krever energiattest, som etter EU-reglene også må stå i annonsen. I annonsene våre finner du energikarakteren under egenskapene; «under arbeid» betyr at attesten fortsatt utarbeides.',
      },
      {
        type: 'cta',
        title: 'Skal vi sette i gang?',
        body: 'Se gjennom eiendommene, eller fortell oss hva du ser etter. Det koster deg ingenting.',
        primary: { label: 'Våre eiendommer', to: 'properties' },
        secondary: { label: 'Gratis eiendomssøk', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Flytte til Ungarn: derfor tar nederlendere steget',
    metaDescription:
      'De fire grunnene til at nederlandske og belgiske kjøpere flytter til Ungarn: valuta for pengene, plass, lavere levekostnader og beliggenhet.',
    eyebrow: 'Bakgrunn',
    title: 'Flytte til',
    titleEm: 'Ungarn',
    intro:
      'Mange nederlendere og belgiere velger Ungarn. I hundrevis av samtaler med kundene våre går de samme fire grunnene igjen.',
    sections: [
      {
        type: 'prose',
        title: 'Valuta for pengene',
        paragraphs: [
          'Ungarske landeiendommer er blant de mest prisgunstige i Europa. I Nederland koster en byggetomt på 125 m² fort 88 000\u00a0€ og en garasje rundt 100 000\u00a0€. For de samme pengene kjøper du på den ungarske landsbygda et romslig familiehus, ofte med god tomt.',
        ],
      },
      {
        type: 'prose',
        title: 'Plass',
        paragraphs: [
          'Nederland har en befolkningstetthet på 482 innbyggere per km² med rundt 17 millioner innbyggere, og en betydelig del av landet er vann. Plassmangelen er ikke et abstrakt problem, men en hverdagsopplevelse, og den grunnen som nevnes oftest.',
        ],
      },
      {
        type: 'prose',
        title: 'Levekostnader',
        paragraphs: [
          'En stor del av kjøperne våre er pensjonister eller nesten. For dem gir lavere levekostnader, ingen eiendomsskatt og rimelig helsehjelp til sammen en levestandard som den samme pensjonen ikke ville gitt i Nederland.',
        ],
      },
      {
        type: 'prose',
        title: 'Beliggenhet',
        paragraphs: [
          'Siden flomkatastrofen i 1953 har Nederland bygget et enormt system av diker og flomvern. Bekymring for stigende havnivå spiller inn i mange beslutninger: Ungarn ligger midt på kontinentet, over havet.',
        ],
      },
      {
        type: 'cta',
        title: 'På tide å utforske',
        body: 'Se gjennom eiendommene våre, eller la oss finne det du har i tankene.',
        primary: { label: 'Våre eiendommer', to: 'properties' },
        secondary: { label: 'Kjøpe i Ungarn', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotoguide for annonsører',
    metaDescription:
      'Gode bilder er det viktigste verktøyet for et raskt salg. FODELs fotoguide: lys, retning, oppløsning og de vanligste feilene.',
    eyebrow: 'For selgere',
    title: 'Guide til',
    titleEm: 'fotografering',
    intro:
      'Utenlandske interessenter ser bildene først, ofte bare bildene. Disse reglene gjør mer enn noen annonsetekst.',
    sections: photoGuideSections(L, {
      topTitle: 'De seks viktigste reglene',
      calloutTitle: 'Vil du heller overlate det til andre?',
      calloutBody: (lines) =>
        `Få inn en profesjonell. Du kan velge dette med ett klikk når du legger inn annonsen: ${lines.join('; ')}. Begge deler er valgfrie; en fra teamet vårt kontakter deg for å avtale tidspunkt.`,
      ctaTitle: 'Klar til å annonsere eiendommen din?',
      primary: 'Legg inn annonse',
      secondary: 'Priser',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
