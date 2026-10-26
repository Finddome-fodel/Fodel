/**
 * Long-form pages, Latvian (formal "jūs"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'lv' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `no ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_LV = {
  services: {
    metaTitle: 'Pakalpojumi: pārdošanas organizēšana, līgumi, fotografēšana',
    metaDescription: `Divvalodu pirkuma līgums ${from('hu')}, pārstāvība ar pilnvaru, reģistrācija zemesgrāmatā, energosertifikāts, īpašuma fotografēšana un drona kadri.`,
    eyebrow: 'Pakalpojumi',
    title: 'Ko darām papildus',
    titleEm: 'sludinājumam',
    intro:
      'Sludinājums ir tikai pirmais solis. Ar tālāk minētajiem pakalpojumiem mēs jūsu vietā parūpēsimies par visu pirkuma procesu atbilstoši abu valstu noteikumiem.',
    sections: [
      {
        type: 'steps',
        title: 'Kā notiek pārdošana',
        items: [
          { n: '01', t: 'Saziņa', b: 'Konsultācijas pa tālruni un e-pastu, saziņa ar abām pusēm, arī ar tulku palīdzību.' },
          { n: '02', t: 'Pircēju pārbaude', b: 'Pārbaudām izcelsmi, pirkšanas nodomu un finansiālo stāvokli.' },
          { n: '03', t: 'Apskate', b: 'Vienojamies par laikiem un dodamies kopā ar jums, kopā ar kolēģi, kurš runā jūsu valodā.' },
          { n: '04', t: 'Sarunas', b: 'Atbalsts abās valodās reālistiskā cenu diapazonā.' },
          { n: '05', t: 'Līgums', b: 'Divvalodu pirkuma līgums, sagatavots kopā ar juristu.' },
          { n: '06', t: 'Darījuma noslēgšana', b: 'Zemesgrāmata, komunālie pakalpojumi un vajadzības gadījumā pārstāvība ar pilnvaru.' },
        ],
      },
      {
        type: 'table',
        title: 'Divvalodu pirkuma līgums',
        intro: 'Orientējošas cenas katrai valodu kombinācijai. Galīgā cena ir atkarīga no līguma apjoma.',
        rows: [
          ['Ungāru valoda', from('hu')],
          ['Vācu–ungāru', from('de-hu')],
          ['Angļu–ungāru', from('en-hu')],
          ['Nīderlandiešu–ungāru', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Papildu pakalpojumi',
        intro: 'Šiem pakalpojumiem sagatavojam individuālu piedāvājumu:',
        items: [
          'Energosertifikāta pieprasīšana: saskaņā ar ES noteikumiem obligāts sludinājumā',
          'Profesionāla īpašuma fotografēšana',
          'Drona kadri: īpaši iedarbīgi lieliem zemes gabaliem un skatiem',
          `Video ar sludinājumu (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Pārstāvība ar pilnvaru',
        body: 'Lai parakstītu, jums nav jābrauc uz Ungāriju: ar pilnvaru mēs jūs pārstāvam parakstīšanā, zemesgrāmatā un komunālo pakalpojumu pārņemšanā.',
      },
      {
        type: 'prose',
        title: 'Kad jāmaksā komisijas maksa',
        paragraphs: [
          `Komisijas maksu iekasējam tikai tad, ja pircēju ir atradis FODEL, ir noslēgts rakstisks pirkuma līgums un ir samaksāta rokasnauda. Likme ir ${COMMISSION.percent}% neto, vismaz ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}% Nīderlandes PVN. Maksā pārdevējs, nevis pircējs.`,
        ],
      },
      {
        type: 'cta',
        title: 'Jautājumi par procesu',
        body: '{hours} Piesakiet bezmaksas atzvanu vai rakstiet mums.',
        primary: { label: 'Sazinieties ar mums', to: 'contact' },
        secondary: { label: 'Biežāk uzdotie jautājumi', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Lauksaimniecības īpašumi: līdz ${AGRI_HECTARE_LIMIT} hektāriem Ungārijā`,
    metaDescription: `ES pilsonis ar lauksaimniecības kvalifikāciju Ungārijā var iegādāties līdz ${AGRI_HECTARE_LIMIT} hektāriem zemes. FODEL nokārto visu procedūru.`,
    eyebrow: 'Lauksaimniecības īpašumi',
    title: 'Lauksaimniecības zeme un',
    titleEm: 'lauku īpašumi',
    intro:
      'Ungārijas zemes tirgum ir savi noteikumi. Kas zina nosacījumus, tas var iegūt vīnogulājus, aramzemi, saimniecības un mežus.',
    sections: [
      {
        type: 'prose',
        title: `${AGRI_HECTARE_LIMIT} hektāru ierobežojums`,
        paragraphs: [
          `ES pilsonis ar lauksaimniecības kvalifikāciju Ungārijā var iegūt kopumā līdz ${AGRI_HECTARE_LIMIT} hektāriem zemes. Šo procedūru mēs nokārtojam pilnībā.`,
          'Procesam iestādēs ir vairāki posmi, un tas sākas ar jūsu kvalifikācijas atzīšanu. Mūsu komanda jūs pavada visā procesā un sagatavo dokumentus abās valodās.',
        ],
      },
      {
        type: 'list',
        title: 'Ko iegādājas mūsu klienti',
        items: [
          'Vīnogulāji ar strādājošu vīna pagrabu vai bez tā',
          'Aramzeme, kas atbilst ES atbalsta saņemšanai',
          'Saimniecības ar palīgēkām, piemērotas lopkopībai',
          'Meži un jauktas izmantošanas īpašumi',
          'Lielāki vienlaidu zemes gabali kā ieguldījums',
        ],
      },
      {
        type: 'steps',
        title: 'Process',
        items: [
          { n: '01', t: 'Konsultācija', b: 'Pārrunājam jūsu ieceres un pieejamo budžetu.' },
          { n: '02', t: 'Kvalifikācijas atzīšana', b: 'Mēs nokārtojam jūsu lauksaimniecības kvalifikācijas atzīšanu Ungārijā.' },
          { n: '03', t: 'Meklēšana', b: 'Kopā ar partneriem meklējam zemi, kas atbilst nosacījumiem.' },
          { n: '04', t: 'Atļaujas', b: 'Zemes iegūšanai nepieciešamo atļauju pieprasīšana.' },
          { n: '05', t: 'Pirkums', b: 'Divvalodu līgums, ierakstīšana zemesgrāmatā, atbalsta tiesību nodošana.' },
        ],
      },
      {
        type: 'callout',
        title: 'Svarīgi',
        body: 'Lauksaimniecības zemes iegūšanas noteikumi laiku pa laikam mainās un ir atkarīgi no jūsu konkrētās situācijas. Šeit rakstītais ir tikai informatīvs. Konkrēta plāna gadījumā vienmēr konsultējieties ar mums un specializētu juristu.',
      },
      {
        type: 'cta',
        title: 'Meklējat lauksaimniecības īpašumu?',
        body: 'Pastāstiet, ko vēlaties, – meklējam arī ārpus mūsu piedāvātajiem īpašumiem.',
        primary: { label: 'Bezmaksas īpašuma meklēšana', to: 'searchRequest' },
        secondary: { label: 'Mūsu īpašumi', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Pirkšana Ungārijā: process soli pa solim',
    metaDescription:
      'Kā ārvalstu pircējam notiek pirkums Ungārijā: līgums, rokasnauda, zemesgrāmata, komunālie pakalpojumi un sagaidāmās izmaksas.',
    eyebrow: 'Pircējiem',
    title: 'Pirkšana',
    titleEm: 'Ungārijā',
    intro:
      'Ungārijas pirkuma process ir diezgan paredzams, ja zināt soļus. Šis ceļvedis jūs caur tiem izvedīs.',
    sections: [
      {
        type: 'steps',
        title: 'Process',
        items: [
          { n: '01', t: 'Izvēle', b: 'Jūs izvēlaties no mūsu īpašumiem vai iesniedzat bezmaksas meklēšanas pieprasījumu.' },
          { n: '02', t: 'Apskate', b: 'Mēs noorganizējam braucienu un apskati ar tulku.' },
          { n: '03', t: 'Piedāvājums', b: 'Palīdzam jums izteikt reālistisku piedāvājumu un vest sarunas.' },
          { n: '04', t: 'Līgums un rokasnauda', b: 'Divvalodu pirkuma līgums, parasti ar 10% rokasnaudu.' },
          { n: '05', t: 'Pirkuma cena', b: 'Atlikusī pirkuma cena ar bankas pārskaitījumu, kā noteikts līgumā.' },
          { n: '06', t: 'Nodošana', b: 'Ierakstīšana zemesgrāmatā, komunālie pakalpojumi, atslēgu nodošana.' },
        ],
      },
      {
        type: 'list',
        title: 'Izmaksas papildus pirkuma cenai',
        items: [
          'Īpašuma nodošanas nodoklis: likme ir atkarīga no īpašuma veida un jūsu situācijas',
          'Jurista honorārs par līguma sagatavošanu un kontrasignēšanu',
          `Divvalodu līguma tulkojums: ${from('hu')}, atkarībā no valodu kombinācijas`,
          'Zemesgrāmatas nodevas',
          'Iespējamā komisijas maksa FODEL: to maksā pārdevējs, nevis jūs',
        ],
      },
      {
        type: 'prose',
        title: 'Jums nav jābūt klāt',
        paragraphs: [
          'Ar pilnvaru mēs jūs pārstāvam parakstīšanā, zemesgrāmatā un komunālo pakalpojumu pārņemšanā. Tādējādi pirkums var notikt arī tad, ja nevarat vai nevēlaties ceļot.',
        ],
      },
      {
        type: 'callout',
        title: 'Energosertifikāts',
        body: 'Ungārijā ir obligāts energosertifikāts, kas saskaņā ar ES noteikumiem jānorāda arī sludinājumā. Mūsu sludinājumos klasi atradīsiet pie īpašībām; “gaida” nozīmē, ka sertifikāts vēl tiek sagatavots.',
      },
      {
        type: 'cta',
        title: 'Sāksim?',
        body: 'Apskatiet īpašumus vai pastāstiet, ko meklējat. Tas jums neko nemaksā.',
        primary: { label: 'Mūsu īpašumi', to: 'properties' },
        secondary: { label: 'Bezmaksas īpašuma meklēšana', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Pārcelšanās uz Ungāriju: kāpēc nīderlandieši sper šo soli',
    metaDescription:
      'Četri iemesli, kāpēc Nīderlandes un Beļģijas pircēji pārceļas uz Ungāriju: cenas un kvalitātes attiecība, plašums, zemākas dzīves izmaksas un atrašanās vieta.',
    eyebrow: 'Konteksts',
    title: 'Pārcelšanās uz',
    titleEm: 'Ungāriju',
    intro:
      'Daudzi nīderlandieši un beļģi izvēlas Ungāriju. Simtiem sarunu ar mūsu klientiem atkal un atkal izskan tie paši četri iemesli.',
    sections: [
      {
        type: 'prose',
        title: 'Cenas un kvalitātes attiecība',
        paragraphs: [
          'Ungārijas lauku īpašumi ir vieni no izdevīgākajiem Eiropā. Nīderlandē 125 m² apbūves gabals viegli maksā 88 000\u00a0€, bet garāža ap 100 000\u00a0€. Par tādu pašu naudu Ungārijas laukos varat nopirkt plašu ģimenes māju, bieži ar prāvu zemes gabalu.',
        ],
      },
      {
        type: 'prose',
        title: 'Plašums',
        paragraphs: [
          'Nīderlandē ar aptuveni 17 miljoniem iedzīvotāju iedzīvotāju blīvums ir 482 cilvēki uz km², un ievērojamu valsts daļu aizņem ūdens. Vietas trūkums nav abstrakta problēma, bet ikdienas pieredze un visbiežāk minētais iemesls.',
        ],
      },
      {
        type: 'prose',
        title: 'Dzīves dārdzība',
        paragraphs: [
          'Liela daļa mūsu pircēju ir pensijā vai drīz tajā dosies. Viņiem zemākas dzīves izmaksas, nekustamā īpašuma nodokļa neesamība un pieejama veselības aprūpe kopā nodrošina dzīves līmeni, ko tā pati pensija Nīderlandē nesniegtu.',
        ],
      },
      {
        type: 'prose',
        title: 'Atrašanās vieta',
        paragraphs: [
          'Kopš 1953. gada plūdu katastrofas Nīderlande ir uzbūvējusi milzīgu pretplūdu aizsardzības sistēmu. Bažas par jūras līmeņa celšanos ietekmē daudzus lēmumus: Ungārija atrodas kontinenta vidū, virs jūras līmeņa.',
        ],
      },
      {
        type: 'cta',
        title: 'Laiks izpētīt',
        body: 'Apskatiet mūsu īpašumus vai ļaujiet mums atrast to, kas jums padomā.',
        primary: { label: 'Mūsu īpašumi', to: 'properties' },
        secondary: { label: 'Pirkšana Ungārijā', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotografēšanas ceļvedis sludinājumu iesniedzējiem',
    metaDescription:
      'Labas fotogrāfijas ir svarīgākais instruments ātrai pārdošanai. FODEL fotografēšanas ceļvedis: gaisma, orientācija, izšķirtspēja un biežākās kļūdas.',
    eyebrow: 'Pārdevējiem',
    title: 'Fotografēšanas',
    titleEm: 'ceļvedis',
    intro:
      'Ārvalstu interesenti vispirms redz fotogrāfijas, bieži tikai fotogrāfijas. Šie noteikumi dod vairāk nekā jebkurš sludinājuma teksts.',
    sections: photoGuideSections(L, {
      topTitle: 'Seši svarīgākie noteikumi',
      calloutTitle: 'Vēlaties to uzticēt citiem?',
      calloutBody: (lines) =>
        `Piesaistiet profesionāli. To varat izvēlēties ar vienu klikšķi, iesniedzot sludinājumu: ${lines.join('; ')}. Abi ir izvēles pakalpojumi; kāds no mūsu komandas ar jums sazināsies, lai vienotos par laiku.`,
      ctaTitle: 'Gatavi publicēt savu īpašumu?',
      primary: 'Iesniegt sludinājumu',
      secondary: 'Cenas',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
