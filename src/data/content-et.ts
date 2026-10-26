/**
 * Long-form pages, Estonian (formal "teie"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'et' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `alates ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_ET = {
  services: {
    metaTitle: 'Teenused: müügi korraldamine, lepingud, fotograafia',
    metaDescription: `Kakskeelne müügileping ${from('hu')}, esindamine volikirja alusel, kinnistusraamatusse kandmine, energiamärgis, kinnisvara fotograafia ja droonivideo.`,
    eyebrow: 'Teenused',
    title: 'Mida teeme lisaks',
    titleEm: 'kuulutusele',
    intro:
      'Kuulutus on alles esimene samm. Allpool toodud teenustega korraldame teie eest kogu ostuprotsessi vastavalt mõlema riigi reeglitele.',
    sections: [
      {
        type: 'steps',
        title: 'Kuidas müük toimub',
        items: [
          { n: '01', t: 'Kontakt', b: 'Nõustamine telefoni ja e-posti teel, suhtlus mõlema poolega, vajaduse korral tõlgi abil.' },
          { n: '02', t: 'Ostjate taustakontroll', b: 'Kontrollime tausta, ostukavatsust ja finantsseisu.' },
          { n: '03', t: 'Kinnisvara vaatamine', b: 'Lepime ajad kokku ja tuleme kaasa koos kolleegiga, kes räägib teie keelt.' },
          { n: '04', t: 'Läbirääkimised', b: 'Tugi mõlemas keeles realistliku hinnavahemiku piires.' },
          { n: '05', t: 'Leping', b: 'Kakskeelne müügileping, koostatud koos juristiga.' },
          { n: '06', t: 'Tehingu lõpuleviimine', b: 'Kinnistusraamat, kommunaalteenused ja vajaduse korral esindamine volikirja alusel.' },
        ],
      },
      {
        type: 'table',
        title: 'Kakskeelne müügileping',
        intro: 'Hinnangulised hinnad keelekombinatsiooni kaupa. Lõplik hind sõltub lepingu pikkusest.',
        rows: [
          ['Ungari keel', from('hu')],
          ['Saksa–ungari', from('de-hu')],
          ['Inglise–ungari', from('en-hu')],
          ['Hollandi–ungari', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Lisateenused',
        intro: 'Nende kohta koostame individuaalse pakkumise:',
        items: [
          'Energiamärgise taotlemine: ELi reeglite järgi kuulutuses kohustuslik',
          'Professionaalne kinnisvarafotograafia',
          'Droonivideo: eriti mõjus suurte kruntide ja vaadete puhul',
          `Video kuulutusega (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Esindamine volikirja alusel',
        body: 'Allkirjastamiseks ei pea te Ungarisse sõitma: volikirja alusel esindame teid allkirjastamisel, kinnistusraamatus ja kommunaalteenuste üleandmisel.',
      },
      {
        type: 'prose',
        title: 'Millal tuleb maksta vahendustasu',
        paragraphs: [
          `Vahendustasu võtame ainult siis, kui ostja on leidnud FODEL, olemas on kirjalik müügileping ja käsiraha on tasutud. Tasu on ${COMMISSION.percent}% netosummast, vähemalt ${eur(COMMISSION.minimumEur, L)}, millele lisandub ${COMMISSION.vatPercent}% Hollandi käibemaks. Tasu maksab müüja, mitte ostja.`,
        ],
      },
      {
        type: 'cta',
        title: 'Küsimused protsessi kohta',
        body: '{hours} Paluge tasuta tagasihelistamist või kirjutage meile.',
        primary: { label: 'Võtke ühendust', to: 'contact' },
        secondary: { label: 'Korduma kippuvad küsimused', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Põllumajanduskinnisvara: kuni ${AGRI_HECTARE_LIMIT} hektarit Ungaris`,
    metaDescription: `Põllumajandusliku kvalifikatsiooniga ELi kodanik võib Ungaris omandada kuni ${AGRI_HECTARE_LIMIT} hektarit maad. FODEL korraldab kogu menetluse.`,
    eyebrow: 'Põllumajanduskinnisvara',
    title: 'Põllumaa ja',
    titleEm: 'maamõisad',
    intro:
      'Ungari maaturul on oma reeglid. Kes tingimusi tunneb, pääseb ligi viinamägedele, põllumaale, taludele ja metsale.',
    sections: [
      {
        type: 'prose',
        title: `${AGRI_HECTARE_LIMIT} hektari piirang`,
        paragraphs: [
          `Põllumajandusliku kvalifikatsiooniga ELi kodanik võib Ungaris omandada kokku kuni ${AGRI_HECTARE_LIMIT} hektarit maad. Korraldame selle menetluse täielikult.`,
          'Menetlus koosneb ametiasutustes mitmest etapist ja algab teie kvalifikatsiooni tunnustamisega. Meie meeskond juhendab teid kogu protsessi vältel ja koostab dokumendid mõlemas keeles.',
        ],
      },
      {
        type: 'list',
        title: 'Mida meie kliendid omandavad',
        items: [
          'Viinamäed töötava veinikeldriga või ilma',
          'ELi toetusteks kõlblik põllumaa',
          'Kõrvalhoonetega talud, mis sobivad loomapidamiseks',
          'Metsad ja segakasutusega valdused',
          'Suuremad terviklikud maatükid investeeringuna',
        ],
      },
      {
        type: 'steps',
        title: 'Protsess',
        items: [
          { n: '01', t: 'Konsultatsioon', b: 'Arutame teie plaane ja olemasolevat eelarvet.' },
          { n: '02', t: 'Kvalifikatsiooni tunnustamine', b: 'Korraldame teie põllumajandusliku kvalifikatsiooni tunnustamise Ungaris.' },
          { n: '03', t: 'Otsing', b: 'Koos partneritega otsime tingimustele vastavat maad.' },
          { n: '04', t: 'Load', b: 'Maa omandamiseks vajalike lubade taotlemine.' },
          { n: '05', t: 'Ost', b: 'Kakskeelne leping, kinnistusraamatusse kandmine, toetusõiguste üleandmine.' },
        ],
      },
      {
        type: 'callout',
        title: 'Oluline',
        body: 'Põllumajandusmaa omandamise reeglid muutuvad aeg-ajalt ja sõltuvad teie olukorrast. Siin kirjutatu on üksnes informatiivne. Konkreetse plaani korral pidage alati nõu meie ja vastava valdkonna advokaadiga.',
      },
      {
        type: 'cta',
        title: 'Otsite põllumajanduslikku kinnisvara?',
        body: 'Öelge, mida soovite – otsime ka väljaspool meie kuulutatud kinnisvara.',
        primary: { label: 'Tasuta kinnisvaraotsing', to: 'searchRequest' },
        secondary: { label: 'Meie kinnisvara', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Ostmine Ungaris: protsess samm-sammult',
    metaDescription:
      'Kuidas toimub ost Ungaris välismaisele ostjale: leping, käsiraha, kinnistusraamat, kommunaalteenused ja oodatavad kulud.',
    eyebrow: 'Ostjatele',
    title: 'Ostmine',
    titleEm: 'Ungaris',
    intro:
      'Ungari ostuprotsess on üsna etteaimatav, kui sammud on teada. See juhend viib teid neist läbi.',
    sections: [
      {
        type: 'steps',
        title: 'Protsess',
        items: [
          { n: '01', t: 'Valik', b: 'Valite meie kinnisvara hulgast või esitate tasuta otsingusoovi.' },
          { n: '02', t: 'Kinnisvara vaatamine', b: 'Korraldame reisi ja ülevaatuse koos tõlgiga.' },
          { n: '03', t: 'Pakkumine', b: 'Aitame teil teha realistliku pakkumise ja läbirääkimisi pidada.' },
          { n: '04', t: 'Leping ja käsiraha', b: 'Kakskeelne ostu-müügileping, tavaliselt 10% käsirahaga.' },
          { n: '05', t: 'Ostuhind', b: 'Ülejäänud ostuhind pangaülekandega vastavalt lepingule.' },
          { n: '06', t: 'Üleandmine', b: 'Kinnistusraamatusse kandmine, kommunaalteenused, võtmete üleandmine.' },
        ],
      },
      {
        type: 'list',
        title: 'Kulud lisaks ostuhinnale',
        items: [
          'Võõrandamismaks: määr sõltub kinnisvara liigist ja teie olukorrast',
          'Advokaaditasu lepingu koostamise ja kaasallkirjastamise eest',
          `Kakskeelse lepingu tõlge: ${from('hu')}, olenevalt keelepaarist`,
          'Kinnistamistasud',
          'Võimalik vahendustasu FODELile: selle maksab müüja, mitte teie',
        ],
      },
      {
        type: 'prose',
        title: 'Te ei pea kohal olema',
        paragraphs: [
          'Volikirja alusel esindame teid allkirjastamisel, kinnistusametis ja kommunaalteenuste üleandmisel. Ost saab seega toimuda ka siis, kui te ei saa või ei soovi reisida.',
        ],
      },
      {
        type: 'callout',
        title: 'Energiamärgis',
        body: 'Ungaris on nõutav energiamärgis, mis peab ELi reeglite kohaselt olema ka kuulutuses. Meie kuulutustes leiate energiaklassi omaduste alt; „ootel“ tähendab, et märgist alles koostatakse.',
      },
      {
        type: 'cta',
        title: 'Kas alustame?',
        body: 'Sirvige kinnisvara või öelge, mida otsite. See ei maksa teile midagi.',
        primary: { label: 'Meie kinnisvara', to: 'properties' },
        secondary: { label: 'Tasuta kinnisvaraotsing', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Kolimine Ungarisse: miks hollandlased selle sammu astuvad',
    metaDescription:
      'Neli põhjust, miks Hollandi ja Belgia ostjad Ungarisse kolivad: hinna ja kvaliteedi suhe, ruum, madalamad elamiskulud ja asukoht.',
    eyebrow: 'Taust',
    title: 'Kolimine',
    titleEm: 'Ungarisse',
    intro:
      'Paljud hollandlased ja belglased valivad Ungari. Sadades vestlustes meie klientidega korduvad ikka ja jälle samad neli põhjust.',
    sections: [
      {
        type: 'prose',
        title: 'Hinna ja kvaliteedi suhe',
        paragraphs: [
          'Ungari maakinnisvara on Euroopas üks soodsamaid. Hollandis maksab 125 m² ehituskrunt kergesti 88 000\u00a0€ ja garaaž umbes 100 000\u00a0€. Sama raha eest ostate Ungari maapiirkonnas avara pereelamu, sageli koos rohke maaga.',
        ],
      },
      {
        type: 'prose',
        title: 'Ruum',
        paragraphs: [
          'Hollandi rahvastikutihedus on umbes 17 miljoni elaniku juures 482 inimest km² kohta ning märkimisväärne osa riigist on vesi. Ruumipuudus ei ole abstraktne probleem, vaid igapäevane kogemus ja kõige sagedamini nimetatud põhjus.',
        ],
      },
      {
        type: 'prose',
        title: 'Elamiskulud',
        paragraphs: [
          'Suur osa meie ostjatest on pensionil või peagi pensionile jäämas. Nende jaoks annavad madalamad elamiskulud, kinnisvaramaksu puudumine ja taskukohane tervishoid kokku elatustaseme, mida sama pension Hollandis ei võimaldaks.',
        ],
      },
      {
        type: 'prose',
        title: 'Asukoht',
        paragraphs: [
          'Pärast 1953. aasta üleujutuskatastroofi on Holland ehitanud tohutu üleujutustõkete süsteemi. Mure meretaseme tõusu pärast mängib rolli paljudes otsustes: Ungari asub mandri keskel, merepinnast kõrgemal.',
        ],
      },
      {
        type: 'cta',
        title: 'Aeg avastada',
        body: 'Sirvige meie kinnisvara või laske meil otsida seda, mida silmas peate.',
        primary: { label: 'Meie kinnisvara', to: 'properties' },
        secondary: { label: 'Ostmine Ungaris', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotojuhend kuulutajatele',
    metaDescription:
      'Head fotod on kiire müügi kõige tähtsam tööriist. FODELi fotojuhend: valgus, suund, eraldusvõime ja levinumad vead.',
    eyebrow: 'Müüjatele',
    title: 'Juhend',
    titleEm: 'juhend',
    intro:
      'Välismaised huvilised näevad kõigepealt fotosid, sageli ainult fotosid. Need reeglid teevad rohkem kui ükski kuulutuse tekst.',
    sections: photoGuideSections(L, {
      topTitle: 'Kuus kõige tähtsamat reeglit',
      calloutTitle: 'Eelistate selle tellida?',
      calloutBody: (lines) =>
        `Kaasake professionaal. Saate selle valida ühe klõpsuga kuulutuse esitamisel: ${lines.join('; ')}. Mõlemad on vabatahtlikud; meie meeskonnaliige võtab teiega aja kokkuleppimiseks ühendust.`,
      ctaTitle: 'Valmis oma kinnisvara kuulutama?',
      primary: 'Lisa kuulutus',
      secondary: 'Hinnad',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
