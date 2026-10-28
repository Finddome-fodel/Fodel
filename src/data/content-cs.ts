/**
 * Long-form pages, Czech (formal "vykání"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'cs' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `od ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_CS = {
  services: {
    metaTitle: 'Služby: zajištění prodeje, smlouvy, fotografie',
    metaDescription: `Dvojjazyčná kupní smlouva ${from('hu')}, zastoupení na základě plné moci, zápis do katastru nemovitostí, průkaz energetické náročnosti, fotografie nemovitosti a záběry z dronu.`,
    eyebrow: 'Služby',
    title: 'Co děláme nad rámec',
    titleEm: 'inzerátu',
    intro:
      'Inzerát je jen prvním krokem. Díky níže uvedeným službám za vás zajistíme celý proces koupě v souladu s pravidly obou zemí.',
    sections: [
      {
        type: 'steps',
        title: 'Jak probíhá prodej',
        items: [
          { n: '01', t: 'Kontakt', b: 'Konzultace po telefonu a e-mailem, komunikace s oběma stranami včetně tlumočníků.' },
          { n: '02', t: 'Prověření kupujících', b: 'Prověřujeme pozadí, kupní záměr a finanční situaci.' },
          { n: '03', t: 'Prohlídka', b: 'Domluvíme termíny a půjdeme s vámi, spolu s kolegou, který mluví vaším jazykem.' },
          { n: '04', t: 'Vyjednávání', b: 'Podpora v obou jazycích v rámci realistického cenového rozpětí.' },
          { n: '05', t: 'Smlouva', b: 'Dvojjazyčná kupní smlouva vypracovaná s advokátem.' },
          { n: '06', t: 'Dokončení', b: 'Katastr nemovitostí, energie a v případě potřeby zastoupení na základě plné moci.' },
        ],
      },
      {
        type: 'table',
        title: 'Dvojjazyčná kupní smlouva',
        intro: 'Orientační ceny podle jazykové kombinace. Konečná cena závisí na délce smlouvy.',
        rows: [
          ['Maďarština', from('hu')],
          ['Němčina–maďarština', from('de-hu')],
          ['Angličtina–maďarština', from('en-hu')],
          ['Nizozemština–maďarština', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Doplňkové služby',
        intro: 'Na tyto služby připravíme individuální nabídku:',
        items: [
          'Vyřízení průkazu energetické náročnosti: podle pravidel EU povinný v inzerátu',
          'Profesionální fotografie nemovitosti',
          'Záběry z dronu: obzvlášť účinné u velkých pozemků a výhledů',
          `Video k inzerátu (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Zastoupení na základě plné moci',
        body: 'Kvůli podpisu nemusíte cestovat do Maďarska: na základě plné moci vás zastoupíme při podpisu, na katastru i při převodu energií.',
      },
      {
        type: 'prose',
        title: 'Kdy je splatná provize',
        paragraphs: [
          `Provizi účtujeme jen tehdy, když kupujícího přivedla FINDDOME, existuje písemná kupní smlouva a byla zaplacena záloha. Sazba činí ${COMMISSION.percent}\u00a0% netto, nejméně však ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nizozemské DPH. Platí prodávající, nikoli kupující.`,
        ],
      },
      {
        type: 'cta',
        title: 'Otázky k průběhu',
        body: '{hours} Požádejte o bezplatné zavolání zpět, nebo nám napište.',
        primary: { label: 'Kontaktujte nás', to: 'contact' },
        secondary: { label: 'Časté dotazy', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Zemědělské nemovitosti: až ${AGRI_HECTARE_LIMIT} hektarů v Maďarsku`,
    metaDescription: `Občan EU se zemědělskou kvalifikací může v Maďarsku nabýt až ${AGRI_HECTARE_LIMIT} hektarů půdy. FINDDOME zajistí celé řízení.`,
    eyebrow: 'Zemědělské nemovitosti',
    title: 'Zemědělská půda a',
    titleEm: 'venkovská sídla',
    intro:
      'Maďarský trh s půdou má svá vlastní pravidla. Kdo zná podmínky, získá přístup k vinicím, orné půdě, statkům i lesům.',
    sections: [
      {
        type: 'prose',
        title: `Limit ${AGRI_HECTARE_LIMIT} hektarů`,
        paragraphs: [
          `Občan EU se zemědělskou kvalifikací může v Maďarsku nabýt celkem až ${AGRI_HECTARE_LIMIT} hektarů půdy. Celý tento postup zajistíme za vás.`,
          'Řízení má u úřadů několik kroků a začíná uznáním vaší kvalifikace. Náš tým vás celým procesem provede a připraví dokumenty v obou jazycích.',
        ],
      },
      {
        type: 'list',
        title: 'Co naši klienti kupují',
        items: [
          'Vinice s fungujícím sklepem i bez něj',
          'Orná půda způsobilá pro dotace EU',
          'Statky s hospodářskými budovami vhodné pro chov zvířat',
          'Lesy a smíšeně využívané pozemky',
          'Větší souvislé pozemky jako investice',
        ],
      },
      {
        type: 'steps',
        title: 'Postup',
        items: [
          { n: '01', t: 'Konzultace', b: 'Probereme vaše plány a dostupný rozpočet.' },
          { n: '02', t: 'Uznání kvalifikace', b: 'Zajistíme uznání vaší zemědělské kvalifikace v Maďarsku.' },
          { n: '03', t: 'Hledání', b: 'S našimi partnery hledáme pozemky, které splňují podmínky.' },
          { n: '04', t: 'Povolení', b: 'Žádost o povolení potřebná k nabytí půdy.' },
          { n: '05', t: 'Koupě', b: 'Dvojjazyčná smlouva, zápis do katastru nemovitostí, převod nároků na dotace.' },
        ],
      },
      {
        type: 'callout',
        title: 'Důležité',
        body: 'Pravidla pro nabývání zemědělské půdy se čas od času mění a závisejí na vaší konkrétní situaci. Zde uvedené informace mají pouze informativní charakter. S konkrétním záměrem se vždy obraťte na nás a na specializovaného advokáta.',
      },
      {
        type: 'cta',
        title: 'Hledáte zemědělskou nemovitost?',
        body: 'Řekněte nám, co hledáte – hledáme i mimo nemovitosti, které inzerujeme.',
        primary: { label: 'Bezplatné vyhledání nemovitosti', to: 'searchRequest' },
        secondary: { label: 'Naše nemovitosti', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Koupě v Maďarsku: postup krok za krokem',
    metaDescription:
      'Jak probíhá koupě v Maďarsku pro zahraničního kupujícího: smlouva, záloha, katastr, energie a náklady, se kterými je třeba počítat.',
    eyebrow: 'Pro kupující',
    title: 'Koupě v',
    titleEm: 'Maďarsku',
    intro:
      'Maďarský postup koupě je docela předvídatelný, jakmile znáte jednotlivé kroky. Tento průvodce vás jimi provede.',
    sections: [
      {
        type: 'steps',
        title: 'Postup',
        items: [
          { n: '01', t: 'Výběr', b: 'Vyberete si z našich nemovitostí, nebo zadáte bezplatnou poptávku.' },
          { n: '02', t: 'Prohlídka', b: 'Zorganizujeme cestu a prohlídku s tlumočníkem.' },
          { n: '03', t: 'Nabídka', b: 'Pomůžeme vám podat realistickou nabídku a vyjednávat.' },
          { n: '04', t: 'Smlouva a záloha', b: 'Dvojjazyčná kupní smlouva, obvykle se zálohou 10\u00a0%.' },
          { n: '05', t: 'Kupní cena', b: 'Zbytek kupní ceny bankovním převodem podle smlouvy.' },
          { n: '06', t: 'Předání', b: 'Zápis do katastru, energie, předání klíčů.' },
        ],
      },
      {
        type: 'list',
        title: 'Náklady nad rámec kupní ceny',
        items: [
          'Daň z nabytí: sazba závisí na druhu nemovitosti a vaší situaci',
          'Odměna advokáta za sepsání a autorizaci smlouvy',
          `Překlad dvojjazyčné smlouvy: ${from('hu')} podle jazykové kombinace`,
          'Poplatky katastru nemovitostí',
          'Případnou provizi FINDDOME platí prodávající, ne vy',
        ],
      },
      {
        type: 'prose',
        title: 'Nemusíte být osobně přítomni',
        paragraphs: [
          'Na základě plné moci vás zastoupíme při podpisu, na katastru i při převodu energií. Koupě tak může proběhnout, i když nemůžete nebo nechcete cestovat.',
        ],
      },
      {
        type: 'callout',
        title: 'Průkaz energetické náročnosti',
        body: 'V Maďarsku je povinný průkaz energetické náročnosti (PENB), který podle pravidel EU musí být uveden i v inzerátu. V našich inzerátech najdete třídu mezi vlastnostmi; „vyřizuje se“ znamená, že se průkaz teprve připravuje.',
      },
      {
        type: 'cta',
        title: 'Začneme?',
        body: 'Prohlédněte si nemovitosti, nebo nám řekněte, co hledáte. Nic vás to nestojí.',
        primary: { label: 'Naše nemovitosti', to: 'properties' },
        secondary: { label: 'Bezplatné vyhledání nemovitosti', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Stěhování do Maďarska: proč se Nizozemci rozhodnou',
    metaDescription:
      'Čtyři důvody, proč se nizozemští a belgičtí kupující stěhují do Maďarska: poměr ceny a kvality, prostor, nižší životní náklady a poloha.',
    eyebrow: 'Souvislosti',
    title: 'Stěhování do',
    titleEm: 'Maďarska',
    intro:
      'Mnoho Nizozemců a Belgičanů si vybírá Maďarsko. Ve stovkách rozhovorů s našimi klienty se stále opakují tytéž čtyři důvody.',
    sections: [
      {
        type: 'prose',
        title: 'Poměr ceny a kvality',
        paragraphs: [
          'Venkovské nemovitosti v Maďarsku patří k cenově nejvýhodnějším v Evropě. V Nizozemsku stojí stavební pozemek o rozloze 125 m² klidně 88 000\u00a0€ a garáž kolem 100 000\u00a0€. Za stejné peníze si na maďarském venkově koupíte prostorný rodinný dům, často se slušným kusem pozemku.',
        ],
      },
      {
        type: 'prose',
        title: 'Prostor',
        paragraphs: [
          'Nizozemsko má hustotu zalidnění 482 obyvatel na km² při zhruba 17 milionech obyvatel a značnou část země tvoří voda. Nedostatek místa není abstraktní problém, ale každodenní zkušenost a nejčastěji uváděný důvod.',
        ],
      },
      {
        type: 'prose',
        title: 'Životní náklady',
        paragraphs: [
          'Velká část našich kupujících je v důchodu nebo krátce před ním. Nižší životní náklady, absence daně z nemovitostí a dostupná zdravotní péče jim společně zajišťují životní úroveň, kterou by jim stejný důchod v Nizozemsku neposkytl.',
        ],
      },
      {
        type: 'prose',
        title: 'Poloha',
        paragraphs: [
          'Od povodňové katastrofy v roce 1953 vybudovalo Nizozemsko obrovský systém protipovodňové ochrany. Obavy ze stoupající hladiny moří hrají roli v mnoha rozhodnutích: Maďarsko leží uprostřed kontinentu, nad úrovní moře.',
        ],
      },
      {
        type: 'cta',
        title: 'Čas objevovat',
        body: 'Prohlédněte si naše nemovitosti, nebo nechte nás najít to, co máte na mysli.',
        primary: { label: 'Naše nemovitosti', to: 'properties' },
        secondary: { label: 'Koupě v Maďarsku', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotografický průvodce pro inzerenty',
    metaDescription:
      'Dobré fotografie jsou nejdůležitějším nástrojem pro rychlý prodej. Fotografický průvodce FINDDOME: světlo, orientace, rozlišení a nejčastější chyby.',
    eyebrow: 'Pro prodávající',
    title: 'Fotografický',
    titleEm: 'fotografováním',
    intro:
      'Zahraniční zájemci vidí nejdříve fotografie, často jen fotografie. Tato pravidla udělají víc než jakýkoli text inzerátu.',
    sections: photoGuideSections(L, {
      topTitle: 'Šest nejdůležitějších pravidel',
      calloutTitle: 'Raději to svěříte jiným?',
      calloutBody: (lines) =>
        `Přizvěte profesionála. Můžete si to zvolit jedním kliknutím při zadávání inzerátu: ${lines.join('; ')}. Obojí je volitelné; někdo z našeho týmu vás kontaktuje a domluví termín.`,
      ctaTitle: 'Připraveni inzerovat svou nemovitost?',
      primary: 'Zadat inzerát',
      secondary: 'Ceník',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
