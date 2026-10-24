/**
 * Podrobné stránky, slovenčina (vykanie): služby, poľnohospodárske
 * nehnuteľnosti, sprievodca kúpou, sťahovanie do Maďarska, fotografický
 * návod. Čísla pochádzajú zo src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';
import type { ContentKey } from '~/data/pages-content';

const L = 'sk' as const;
const pct = (n: number) => `${n}\u00a0%`;
const des = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `od ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;
/** Nominative/accusative: "až 300 hektárov". */
const ha = nOf(L, AGRI_HECTARE_LIMIT, 'hektár', 'hektáre', 'hektárov');

export const CONTENT_SK = {
  services: {
    metaTitle: 'Služby: úkony, zmluva, fotografia',
    metaDescription: `Dvojjazyčná kúpna zmluva ${des('hu')}, zastúpenie na základe plnej moci, zápis do katastra nehnuteľností, energetický certifikát, fotografovanie nehnuteľností a zábery z dronu.`,
    eyebrow: 'Služby',
    title: 'Čo robíme nad rámec',
    titleEm: 'inzerátu',
    intro:
      'Inzerát je len prvý krok. Vďaka službám uvedeným nižšie vás odbremeníme od celého procesu predaja a kúpy, v súlade s pravidlami oboch krajín.',
    sections: [
      {
        type: 'steps',
        title: 'Priebeh predaja',
        items: [
          { n: '01', t: 'Kontakt', b: 'Telefonická a e-mailová komunikácia s oboma stranami vrátane tlmočníkov.' },
          { n: '02', t: 'Preverenie kupujúceho', b: 'Preveríme jeho minulosť, úmysel kúpiť a platobnú schopnosť.' },
          { n: '03', t: 'Obhliadka', b: 'Dohodneme termíny a náš kolega vás na mieste sprevádza.' },
          { n: '04', t: 'Vyjednávanie', b: 'Podpora v oboch jazykoch, v realistickom cenovom rozpätí.' },
          { n: '05', t: 'Zmluva', b: 'Dvojjazyčná kúpna zmluva vyhotovená s advokátom.' },
          { n: '06', t: 'Dokončenie', b: 'Kataster nehnuteľností, zmluvy na vodu, plyn a elektrinu a v prípade potreby zastúpenie na základe plnej moci.' },
        ],
      },
      {
        type: 'table',
        title: 'Dvojjazyčná kúpna zmluva',
        intro: 'Orientačné ceny podľa jazykovej kombinácie. Konečná cena závisí od rozsahu zmluvy.',
        rows: [
          ['Maďarčina', des('hu')],
          ['Nemčina–maďarčina', des('de-hu')],
          ['Angličtina–maďarčina', des('en-hu')],
          ['Holandčina–maďarčina', des('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Doplnkové služby',
        intro: 'Na tieto služby pripravíme individuálnu cenovú ponuku:',
        items: [
          'Vybavenie energetického certifikátu: podľa pravidiel EÚ povinného v inzeráte',
          'Profesionálne fotografovanie nehnuteľností',
          'Zábery z dronu: obzvlášť účinné pri veľkých pozemkoch a výhľadoch',
          `Video k inzerátu (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Zastúpenie na základe plnej moci',
        body: 'Na podpis nemusíte cestovať do Maďarska: na základe plnej moci vás zastúpime pri podpise, na katastri a pri prepise zmlúv na vodu, plyn a elektrinu.',
      },
      {
        type: 'prose',
        title: 'Kedy sa platí provízia',
        paragraphs: [
          `Províziu účtujeme len vtedy, ak kupujúceho priviedol FODEL, existuje písomná kúpna zmluva a bola zaplatená záloha. Sadzba je ${pct(COMMISSION.percent)} bez DPH, najmenej ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} holandskej DPH. Platí ju predávajúci, nie kupujúci.`,
        ],
      },
      {
        type: 'cta',
        title: 'Otázky k postupu',
        body: '{hours} Požiadajte o bezplatné spätné zavolanie alebo nám napíšte.',
        primary: { label: 'Kontaktujte nás', to: 'contact' },
        secondary: { label: 'Časté otázky', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Poľnohospodárske nehnuteľnosti: až ${ha} v Maďarsku`,
    metaDescription: `Občan EÚ s poľnohospodárskou kvalifikáciou môže v Maďarsku nadobudnúť až ${ha} pôdy. FODEL vybaví celé konanie.`,
    eyebrow: 'Poľnohospodárske nehnuteľnosti',
    title: 'Poľnohospodárska pôda a',
    titleEm: 'statky',
    intro:
      'Maďarský trh s pôdou má vlastné pravidlá. Kto pozná podmienky, získa prístup k viniciam, ornej pôde, farmám a lesom.',
    sections: [
      {
        type: 'prose',
        title: `Limit ${nOf(L, AGRI_HECTARE_LIMIT, 'hektára', 'hektárov')}`,
        paragraphs: [
          `Občan EÚ s poľnohospodárskou kvalifikáciou môže v Maďarsku nadobudnúť spolu ${ha} pôdy. Celé konanie vybavíme za vás.`,
          'Konanie pozostáva z niekoľkých krokov na úradoch a začína sa uznaním vašej kvalifikácie. Náš tím vás sprevádza celým procesom a pripraví potrebné dokumenty v oboch jazykoch.',
        ],
      },
      {
        type: 'list',
        title: 'Čo kupujú naši klienti',
        items: [
          'Vinice, s fungujúcou vinárňou alebo bez nej',
          'Ornú pôdu s nárokom na dotácie EÚ',
          'Farmy s hospodárskymi budovami, vhodné na chov zvierat',
          'Lesy a statky so zmiešaným využitím',
          'Veľké sceľené pozemky ako investíciu',
        ],
      },
      {
        type: 'steps',
        title: 'Priebeh',
        items: [
          { n: '01', t: 'Rozhovor', b: 'Prediskutujeme vaše plány a dostupný rozpočet.' },
          { n: '02', t: 'Uznanie kvalifikácie', b: 'Postaráme sa o uznanie vašej poľnohospodárskej kvalifikácie v Maďarsku.' },
          { n: '03', t: 'Vyhľadávanie', b: 'Spolu s partnermi hľadáme pôdu, ktorá spĺňa podmienky.' },
          { n: '04', t: 'Povolenia', b: 'Žiadosť o povolenia potrebné na nadobudnutie pôdy.' },
          { n: '05', t: 'Kúpa', b: 'Dvojjazyčná zmluva, zápis do katastra, prevod žiadostí o dotácie.' },
        ],
      },
      {
        type: 'callout',
        title: 'Dôležité',
        body: 'Pravidlá nadobúdania poľnohospodárskej pôdy sa z času na čas menia a závisia od vašej konkrétnej situácie. Uvedené informácie majú len informatívny charakter. Pri konkrétnom zámere sa vždy poraďte s naším tímom a so špecializovaným právnikom.',
      },
      {
        type: 'cta',
        title: 'Hľadáte poľnohospodársku nehnuteľnosť',
        body: 'Povedzte nám, čo si želáte; hľadáme aj mimo inzerovaných nehnuteľností.',
        primary: { label: 'Bezplatné vyhľadávanie', to: 'searchRequest' },
        secondary: { label: 'Naše nehnuteľnosti', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Kúpa v Maďarsku: postup krok za krokom',
    metaDescription:
      'Ako prebieha kúpa nehnuteľnosti v Maďarsku pre zahraničného kupujúceho: zmluva, záloha, kataster, zmluvy na vodu, plyn a elektrinu a náklady, s ktorými treba počítať.',
    eyebrow: 'Pre kupujúcich',
    title: 'Kúpa v',
    titleEm: 'Maďarsku',
    intro:
      'Maďarský postup pri kúpe je úplne predvídateľný, keď poznáte jeho kroky. Tento sprievodca vás nimi prevedie.',
    sections: [
      {
        type: 'steps',
        title: 'Priebeh',
        items: [
          { n: '01', t: 'Výber', b: 'Vyberiete si z našich nehnuteľností alebo podáte bezplatnú žiadosť o vyhľadanie.' },
          { n: '02', t: 'Obhliadka', b: 'Zorganizujeme cestu a obhliadku s tlmočníkom.' },
          { n: '03', t: 'Ponuka', b: 'Pomôžeme vám predložiť realistickú ponuku a vyjednávať.' },
          { n: '04', t: 'Zmluva a záloha', b: `Dvojjazyčná kúpna zmluva, spravidla so zálohou ${pct(10)}.` },
          { n: '05', t: 'Kúpna cena', b: 'Zvyšok kúpnej ceny bankovým prevodom podľa zmluvy.' },
          { n: '06', t: 'Odovzdanie kľúčov', b: 'Zápis do katastra, zmluvy na energie, odovzdanie kľúčov.' },
        ],
      },
      {
        type: 'list',
        title: 'Náklady nad rámec kúpnej ceny',
        items: [
          'Daň z nadobudnutia nehnuteľnosti: sadzba závisí od typu nehnuteľnosti a vašej situácie',
          'Odmena advokáta za vyhotovenie a autorizáciu zmluvy',
          `Preklad dvojjazyčnej zmluvy: ${des('hu')}, podľa jazykovej kombinácie`,
          'Poplatky za zápis do katastra',
          'Prípadná provízia FODEL: platí ju predávajúci, nie vy',
        ],
      },
      {
        type: 'prose',
        title: 'Nemusíte byť na mieste',
        paragraphs: [
          'Na základe plnej moci vás zastúpime pri podpise, na katastri a pri prepise zmlúv na vodu, plyn a elektrinu. Kúpa sa tak môže uskutočniť, aj keď nemôžete alebo nechcete cestovať.',
        ],
      },
      {
        type: 'callout',
        title: 'Energetický certifikát',
        body: 'V Maďarsku je energetický certifikát povinný a podľa pravidiel EÚ musí byť uvedený aj v inzeráte. V našich inzerátoch nájdete triedu medzi vlastnosťami; „Pripravuje sa“ znamená, že certifikát sa ešte vyhotovuje.',
      },
      {
        type: 'cta',
        title: 'Začnime',
        body: 'Prezrite si naše nehnuteľnosti alebo nám povedzte, čo hľadáte. Nič vás to nestojí.',
        primary: { label: 'Naše nehnuteľnosti', to: 'properties' },
        secondary: { label: 'Bezplatné vyhľadávanie', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Sťahovanie do Maďarska: prečo sa Holanďania rozhodnú',
    metaDescription:
      'Štyri dôvody, prečo sa Holanďania a Belgičania sťahujú do Maďarska: pomer ceny a kvality, priestor, nižšie životné náklady a zemepisná poloha.',
    eyebrow: 'Súvislosti',
    title: 'Sťahovanie do',
    titleEm: 'Maďarska',
    intro:
      'Mnohí Holanďania a Belgičania si vyberajú Maďarsko. V stovkách rozhovorov s našimi klientmi sa stále opakujú tie isté štyri dôvody.',
    sections: [
      {
        type: 'prose',
        title: 'Pomer ceny a kvality',
        paragraphs: [
          `Vidiecke nehnuteľnosti v Maďarsku patria k tým s najlepším pomerom ceny a kvality v Európe. V Holandsku stojí stavebný pozemok s rozlohou 125 m² pokojne ${eur(88000, L)} a garáž približne ${eur(100000, L)}. Za rovnakú sumu si na maďarskom vidieku kúpite priestranný rodinný dom, často s veľkým pozemkom.`,
        ],
      },
      {
        type: 'prose',
        title: 'Priestor',
        paragraphs: [
          'Holandsko má 482 obyvateľov na km² pri približne 17 miliónoch obyvateľov a významnú časť krajiny tvorí voda. Nedostatok priestoru tam nie je abstraktný problém, ale každodenná skúsenosť, a zároveň najčastejšie uvádzaný dôvod.',
        ],
      },
      {
        type: 'prose',
        title: 'Životné náklady',
        paragraphs: [
          'Veľká časť našich kupujúcich sú dôchodcovia alebo ľudia tesne pred dôchodkom. Nižšie životné náklady, absencia dane z nehnuteľností a dostupná zdravotná starostlivosť im spolu ponúkajú životnú úroveň, akú by im ten istý dôchodok v Holandsku neumožnil.',
        ],
      },
      {
        type: 'prose',
        title: 'Zemepisná poloha',
        paragraphs: [
          'Od povodní v roku 1953 vybudovalo Holandsko obrovský systém ochrany pred vodou. Obavy zo stúpajúcej hladiny mora ovplyvňujú mnohé rozhodnutia: Maďarsko leží v srdci kontinentu, nad úrovňou mora.',
        ],
      },
      {
        type: 'cta',
        title: 'Objavte to sami',
        body: 'Prezrite si naše nehnuteľnosti alebo nás nechajte hľadať to, čo máte na mysli.',
        primary: { label: 'Naše nehnuteľnosti', to: 'properties' },
        secondary: { label: 'Kúpa v Maďarsku', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotografický návod pre inzerentov',
    metaDescription:
      'Dobré fotografie sú najlepším spôsobom, ako rýchlo predať. Fotografický návod FODEL: svetlo, kompozícia, rozlíšenie a najčastejšie chyby.',
    eyebrow: 'Pre predávajúcich',
    title: 'Fotografický',
    titleEm: 'návod',
    intro:
      'Zahraniční kupujúci vidia najprv fotografie, často len fotografie. Tieto pravidlá urobia viac než akýkoľvek text inzerátu.',
    sections: photoGuideSections(L, {
      topTitle: 'Šesť najdôležitejších pravidiel',
      calloutTitle: 'Radšej to prenecháte odborníkovi?',
      calloutBody: (lines) =>
        `Obráťte sa na profesionála. Vyberiete si ho jedným kliknutím pri podávaní inzerátu: ${lines.join('; ')}. Obe možnosti sú dobrovoľné; náš kolega vás bude kontaktovať a dohodne s vami termín.`,
      ctaTitle: 'Pripravení podať inzerát',
      primary: 'Podať inzerát',
      secondary: 'Cenník',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
