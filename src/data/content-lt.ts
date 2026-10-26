/**
 * Long-form pages, Lithuanian (formal "jūs"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'lt' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `nuo ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_LT = {
  services: {
    metaTitle: 'Paslaugos: pardavimo organizavimas, sutartys, fotografavimas',
    metaDescription: `Dvikalbė pirkimo–pardavimo sutartis ${from('hu')}, atstovavimas pagal įgaliojimą, įregistravimas registre, energinio naudingumo sertifikatas, turto fotografavimas ir filmavimas dronu.`,
    eyebrow: 'Paslaugos',
    title: 'Ką darome be',
    titleEm: 'skelbimo',
    intro:
      'Skelbimas yra tik pirmas žingsnis. Toliau nurodytomis paslaugomis už jus pasirūpinsime visu pirkimo procesu pagal abiejų šalių taisykles.',
    sections: [
      {
        type: 'steps',
        title: 'Kaip vyksta pardavimas',
        items: [
          { n: '01', t: 'Kontaktas', b: 'Konsultacijos telefonu ir el. paštu, bendravimas su abiem šalimis, prireikus ir per vertėjus.' },
          { n: '02', t: 'Pirkėjų patikra', b: 'Patikriname asmenį, ketinimą pirkti ir finansinę padėtį.' },
          { n: '03', t: 'Apžiūra', b: 'Suderiname laiką ir vykstame kartu su jumis, kartu su kolega, kalbančiu jūsų kalba.' },
          { n: '04', t: 'Derybos', b: 'Pagalba abiem kalbomis, realistiško kainų intervalo ribose.' },
          { n: '05', t: 'Sutartis', b: 'Dvikalbė pirkimo–pardavimo sutartis, parengta kartu su advokatu.' },
          { n: '06', t: 'Sandorio užbaigimas', b: 'Registras, komunalinės paslaugos ir prireikus atstovavimas pagal įgaliojimą.' },
        ],
      },
      {
        type: 'table',
        title: 'Dvikalbė pirkimo–pardavimo sutartis',
        intro: 'Orientacinės kainos pagal kalbų derinį. Galutinė kaina priklauso nuo sutarties apimties.',
        rows: [
          ['Vengrų kalba', from('hu')],
          ['Vokiečių–vengrų', from('de-hu')],
          ['Anglų–vengrų', from('en-hu')],
          ['Nyderlandų–vengrų', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Papildomos paslaugos',
        intro: 'Joms parengiame individualų pasiūlymą:',
        items: [
          'Energinio naudingumo sertifikato užsakymas: pagal ES taisykles privalomas skelbime',
          'Profesionalus turto fotografavimas',
          'Filmavimas dronu: ypač veiksmingas dideliems sklypams ir vaizdams',
          `Vaizdo įrašas su skelbimu (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Atstovavimas pagal įgaliojimą',
        body: 'Pasirašyti nereikia vykti į Vengriją: pagal įgaliojimą atstovaujame jums pasirašant, registre ir perimant komunalines paslaugas.',
      },
      {
        type: 'prose',
        title: 'Kada mokamas komisinis atlygis',
        paragraphs: [
          `Komisinį atlygį imame tik tada, kai pirkėją surado FODEL, yra sudaryta rašytinė pirkimo–pardavimo sutartis ir sumokėtas avansas. Tarifas – ${COMMISSION.percent}\u00a0% be mokesčių, ne mažiau kaip ${eur(COMMISSION.minimumEur, L)}, plius ${COMMISSION.vatPercent}\u00a0% Nyderlandų PVM. Moka pardavėjas, ne pirkėjas.`,
        ],
      },
      {
        type: 'cta',
        title: 'Klausimai apie procesą',
        body: '{hours} Užsisakykite nemokamą perskambinimą arba parašykite mums.',
        primary: { label: 'Susisiekite su mumis', to: 'contact' },
        secondary: { label: 'Dažniausiai užduodami klausimai', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Žemės ūkio turtas: iki ${AGRI_HECTARE_LIMIT} hektarų Vengrijoje`,
    metaDescription: `Žemės ūkio kvalifikaciją turintis ES pilietis Vengrijoje gali įsigyti iki ${AGRI_HECTARE_LIMIT} hektarų žemės. FODEL pasirūpina visa procedūra.`,
    eyebrow: 'Žemės ūkio turtas',
    title: 'Žemės ūkio paskirties žemė ir',
    titleEm: 'kaimo valdos',
    intro:
      'Vengrijos žemės rinka turi savo taisykles. Kas žino sąlygas, gali įsigyti vynuogynų, ariamosios žemės, ūkių ir miškų.',
    sections: [
      {
        type: 'prose',
        title: `${AGRI_HECTARE_LIMIT} hektarų riba`,
        paragraphs: [
          `ES pilietis, turintis žemės ūkio kvalifikaciją, Vengrijoje iš viso gali įsigyti iki ${AGRI_HECTARE_LIMIT} hektarų žemės. Visą šią procedūrą atliekame už jus.`,
          'Procedūra institucijose turi kelis etapus ir prasideda nuo jūsų kvalifikacijos pripažinimo. Mūsų komanda lydi jus viso proceso metu ir parengia dokumentus abiem kalbomis.',
        ],
      },
      {
        type: 'list',
        title: 'Ką įsigyja mūsų klientai',
        items: [
          'Vynuogynai su veikiančiu vyno rūsiu arba be jo',
          'Ariamoji žemė, tinkama ES paramai',
          'Ūkiai su ūkiniais pastatais, tinkami gyvulininkystei',
          'Miškai ir mišrios paskirties valdos',
          'Didesni vientisi sklypai kaip investicija',
        ],
      },
      {
        type: 'steps',
        title: 'Procesas',
        items: [
          { n: '01', t: 'Konsultacija', b: 'Aptariame jūsų planus ir turimą biudžetą.' },
          { n: '02', t: 'Kvalifikacijos pripažinimas', b: 'Pasirūpiname, kad jūsų žemės ūkio kvalifikacija būtų pripažinta Vengrijoje.' },
          { n: '03', t: 'Paieška', b: 'Kartu su partneriais ieškome sąlygas atitinkančios žemės.' },
          { n: '04', t: 'Leidimai', b: 'Žemei įsigyti reikalingų leidimų gavimas.' },
          { n: '05', t: 'Pirkimas', b: 'Dvikalbė sutartis, įregistravimas nekilnojamojo turto registre, paramos teisių perleidimas.' },
        ],
      },
      {
        type: 'callout',
        title: 'Svarbu',
        body: 'Žemės ūkio paskirties žemės įsigijimo taisyklės retkarčiais keičiasi ir priklauso nuo jūsų konkrečios situacijos. Čia pateikta informacija yra tik informacinio pobūdžio. Turėdami konkretų planą, visada pasitarkite su mumis ir specializuotu teisininku.',
      },
      {
        type: 'cta',
        title: 'Ieškote žemės ūkio paskirties nekilnojamojo turto?',
        body: 'Pasakykite, ko norite, – ieškome ir už mūsų skelbiamų objektų ribų.',
        primary: { label: 'Nemokama objekto paieška', to: 'searchRequest' },
        secondary: { label: 'Mūsų objektai', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Pirkimas Vengrijoje: procesas žingsnis po žingsnio',
    metaDescription:
      'Kaip užsienio pirkėjui vyksta pirkimas Vengrijoje: sutartis, rankpinigiai, nekilnojamojo turto registras, komunalinės paslaugos ir numatomos išlaidos.',
    eyebrow: 'Pirkėjams',
    title: 'Pirkimas',
    titleEm: 'Vengrijoje',
    intro:
      'Vengriškas pirkimo procesas gana nuspėjamas, kai žinote žingsnius. Šis vadovas jus per juos praves.',
    sections: [
      {
        type: 'steps',
        title: 'Procesas',
        items: [
          { n: '01', t: 'Pasirinkimas', b: 'Renkatės iš mūsų objektų arba pateikiate nemokamą paieškos užklausą.' },
          { n: '02', t: 'Apžiūra', b: 'Suorganizuojame kelionę ir apžiūrą su vertėju.' },
          { n: '03', t: 'Pasiūlymas', b: 'Padedame pateikti realų pasiūlymą ir derėtis.' },
          { n: '04', t: 'Sutartis ir rankpinigiai', b: 'Dvikalbė pirkimo–pardavimo sutartis, paprastai su 10\u00a0% rankpinigiais.' },
          { n: '05', t: 'Pirkimo kaina', b: 'Likusi pirkimo kainos dalis banko pavedimu, kaip numatyta sutartyje.' },
          { n: '06', t: 'Perdavimas', b: 'Įregistravimas, komunalinės paslaugos, raktų perdavimas.' },
        ],
      },
      {
        type: 'list',
        title: 'Išlaidos be pirkimo kainos',
        items: [
          'Perleidimo mokestis: tarifas priklauso nuo turto rūšies ir jūsų situacijos',
          'Advokato atlyginimas už sutarties parengimą ir kontrasignavimą',
          `Dvikalbės sutarties vertimas: ${from('hu')}, priklausomai nuo kalbų poros`,
          'Registro mokesčiai',
          'Galimas komisinis atlyginimas FODEL: jį moka pardavėjas, o ne jūs',
        ],
      },
      {
        type: 'prose',
        title: 'Jums nebūtina dalyvauti',
        paragraphs: [
          'Pagal įgaliojimą atstovaujame jums pasirašant sutartį, registruojant turtą ir perimant komunalines paslaugas. Todėl pirkimas gali vykti, net jei negalite ar nenorite keliauti.',
        ],
      },
      {
        type: 'callout',
        title: 'Energinio naudingumo sertifikatas',
        body: 'Vengrijoje privalomas energinio naudingumo sertifikatas, kuris pagal ES taisykles turi būti nurodytas ir skelbime. Mūsų skelbimuose klasę rasite tarp savybių; „rengiamas“ reiškia, kad sertifikatas dar rengiamas.',
      },
      {
        type: 'cta',
        title: 'Pradedame?',
        body: 'Peržiūrėkite objektus arba pasakykite, ko ieškote. Jums tai nieko nekainuoja.',
        primary: { label: 'Mūsų objektai', to: 'properties' },
        secondary: { label: 'Nemokama objekto paieška', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Persikėlimas į Vengriją: kodėl olandai ryžtasi šiam žingsniui',
    metaDescription:
      'Keturios priežastys, kodėl Nyderlandų ir Belgijos pirkėjai persikelia į Vengriją: kainos ir kokybės santykis, erdvė, mažesnės pragyvenimo išlaidos ir vieta.',
    eyebrow: 'Kontekstas',
    title: 'Persikėlimas į',
    titleEm: 'Vengriją',
    intro:
      'Daug olandų ir belgų renkasi Vengriją. Šimtuose pokalbių su mūsų klientais vis kartojasi tos pačios keturios priežastys.',
    sections: [
      {
        type: 'prose',
        title: 'Kainos ir kokybės santykis',
        paragraphs: [
          'Vengrijos kaimo nekilnojamasis turtas – vienas palankiausių Europoje. Nyderlanduose 125 m² statybos sklypas lengvai kainuoja 88 000\u00a0€, o garažas – apie 100 000\u00a0€. Už tuos pačius pinigus Vengrijos kaime nusipirksite erdvų šeimos namą, dažnai su nemažu žemės sklypu.',
        ],
      },
      {
        type: 'prose',
        title: 'Erdvė',
        paragraphs: [
          'Nyderlanduose, kuriuose gyvena apie 17 milijonų žmonių, gyventojų tankumas siekia 482 žmones viename km², o nemaža šalies dalis – vanduo. Vietos stoka – ne abstrakti problema, o kasdienė patirtis ir dažniausiai minima priežastis.',
        ],
      },
      {
        type: 'prose',
        title: 'Pragyvenimo išlaidos',
        paragraphs: [
          'Didelė dalis mūsų pirkėjų – pensininkai arba netrukus jais tapsiantys žmonės. Jiems mažesnės pragyvenimo išlaidos, nekilnojamojo turto mokesčio nebuvimas ir prieinama sveikatos priežiūra kartu užtikrina gyvenimo lygį, kurio ta pati pensija Nyderlanduose nesuteiktų.',
        ],
      },
      {
        type: 'prose',
        title: 'Vieta',
        paragraphs: [
          'Po 1953 m. potvynio katastrofos Nyderlandai pastatė milžinišką apsaugos nuo potvynių sistemą. Nerimas dėl kylančio jūros lygio lemia daugelį sprendimų: Vengrija yra žemyno viduryje, aukščiau jūros lygio.',
        ],
      },
      {
        type: 'cta',
        title: 'Metas atrasti',
        body: 'Peržiūrėkite mūsų objektus arba leiskite mums surasti tai, ką turite omenyje.',
        primary: { label: 'Mūsų objektai', to: 'properties' },
        secondary: { label: 'Pirkimas Vengrijoje', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotografavimo vadovas skelbėjams',
    metaDescription:
      'Geros nuotraukos – svarbiausia greito pardavimo priemonė. FODEL fotografavimo vadovas: šviesa, orientacija, raiška ir dažniausios klaidos.',
    eyebrow: 'Pardavėjams',
    title: 'Fotografavimo',
    titleEm: 'vadovas',
    intro:
      'Užsienio pirkėjai pirmiausia pamato nuotraukas, dažnai tik nuotraukas. Šios taisyklės duoda daugiau nei bet koks skelbimo tekstas.',
    sections: photoGuideSections(L, {
      topTitle: 'Šešios svarbiausios taisyklės',
      calloutTitle: 'Norite tai patikėti kitiems?',
      calloutBody: (lines) =>
        `Pasikvieskite profesionalą. Tai galite pasirinkti vienu spustelėjimu teikdami skelbimą: ${lines.join('; ')}. Abi paslaugos neprivalomos; mūsų komandos narys susisieks su jumis ir suderins datą.`,
      ctaTitle: 'Pasiruošę paskelbti savo objektą?',
      primary: 'Pateikti skelbimą',
      secondary: 'Kainos',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
