/**
 * Pagini detaliate, română (adresare cu „dumneavoastră”): servicii,
 * proprietăți agricole, ghid de cumpărare, mutarea în Ungaria, ghid foto.
 * Cifrele provin din src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';
import type { ContentKey } from '~/data/pages-content';

const L = 'ro' as const;
const pct = (n: number) => `${n}%`;
const des = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `de la ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;
const ha = nOf(L, AGRI_HECTARE_LIMIT, 'hectar', 'hectare', 'de hectare');

export const CONTENT_RO = {
  services: {
    metaTitle: 'Servicii: formalități, contract, fotografie',
    metaDescription: `Contract de vânzare-cumpărare bilingv ${des('hu')}, reprezentare prin procură, înscriere în cartea funciară, certificat de performanță energetică, fotografie imobiliară și filmări cu drona.`,
    eyebrow: 'Servicii',
    title: 'Ce facem dincolo',
    titleEm: 'de anunț',
    intro:
      'Anunțul este doar primul pas. Prin serviciile de mai jos, vă scutim de grijile întregului proces de vânzare-cumpărare, conform regulilor ambelor țări.',
    sections: [
      {
        type: 'steps',
        title: 'Cum decurge vânzarea',
        items: [
          { n: '01', t: 'Contact', b: 'Comunicare prin telefon și e-mail cu ambele părți, inclusiv interpreți.' },
          { n: '02', t: 'Verificarea cumpărătorului', b: 'Verificăm istoricul, intenția de cumpărare și solvabilitatea.' },
          { n: '03', t: 'Vizionare', b: 'Stabilim întâlnirile, iar un membru al echipei noastre vă însoțește.' },
          { n: '04', t: 'Negociere', b: 'Sprijin în ambele limbi, într-o marjă de preț realistă.' },
          { n: '05', t: 'Contract', b: 'Contract de vânzare-cumpărare bilingv, întocmit împreună cu un avocat.' },
          { n: '06', t: 'Finalizare', b: 'Cartea funciară, contractele de apă, gaz și electricitate și, dacă este nevoie, reprezentare prin procură.' },
        ],
      },
      {
        type: 'table',
        title: 'Contract de vânzare-cumpărare bilingv',
        intro: 'Prețuri orientative pe combinații de limbi. Prețul final depinde de amploarea contractului.',
        rows: [
          ['Maghiară', des('hu')],
          ['Germană–maghiară', des('de-hu')],
          ['Engleză–maghiară', des('en-hu')],
          ['Neerlandeză–maghiară', des('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Servicii suplimentare',
        intro: 'Pentru acestea întocmim o ofertă personalizată:',
        items: [
          'Obținerea certificatului de performanță energetică: obligatoriu în anunț conform normelor UE',
          'Fotografie imobiliară profesională',
          'Filmări cu drona: deosebit de eficiente pentru terenuri mari și priveliști',
          `Videoclip pentru anunț (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Reprezentare prin procură',
        body: 'Nu trebuie să veniți în Ungaria pentru semnare: pe baza unei procuri, vă reprezentăm la semnare, la cartea funciară și la transferul contractelor de apă, gaz și electricitate.',
      },
      {
        type: 'prose',
        title: 'Când se datorează comision',
        paragraphs: [
          `Percepem comision doar dacă FODEL a adus cumpărătorul, există un contract de vânzare-cumpărare scris și avansul a fost plătit. Comisionul este de ${pct(COMMISSION.percent)} net, cel puțin ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} TVA neerlandez. Îl plătește vânzătorul, nu cumpărătorul.`,
        ],
      },
      {
        type: 'cta',
        title: 'Întrebări despre procedură',
        body: '{hours} Cereți gratuit să vă sunăm sau scrieți-ne.',
        primary: { label: 'Contactați-ne', to: 'contact' },
        secondary: { label: 'Întrebări frecvente', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Proprietăți agricole: până la ${ha} în Ungaria`,
    metaDescription: `Un cetățean UE cu calificare în agricultură poate dobândi în Ungaria până la ${ha} de teren. FODEL se ocupă de întreaga procedură.`,
    eyebrow: 'Proprietăți agricole',
    title: 'Terenuri agricole și',
    titleEm: 'domenii',
    intro:
      'Piața funciară din Ungaria are propriile reguli. Cine cunoaște condițiile are acces la podgorii, terenuri arabile, ferme și păduri.',
    sections: [
      {
        type: 'prose',
        title: `Limita de ${ha}`,
        paragraphs: [
          `Un cetățean UE cu calificare în agricultură poate dobândi în Ungaria în total ${ha} de teren. Ne ocupăm în întregime de această procedură.`,
          'Procedura cuprinde mai mulți pași în fața autorităților și începe cu recunoașterea calificării dumneavoastră. Echipa noastră vă însoțește pe tot parcursul procesului și pregătește documentele necesare în ambele limbi.',
        ],
      },
      {
        type: 'list',
        title: 'Ce cumpără clienții noștri',
        items: [
          'Podgorii, cu sau fără cramă în funcțiune',
          'Terenuri arabile eligibile pentru subvenții UE',
          'Ferme cu anexe, potrivite pentru creșterea animalelor',
          'Păduri și domenii cu utilizare mixtă',
          'Parcele mari, dintr-o singură bucată, ca investiție',
        ],
      },
      {
        type: 'steps',
        title: 'Cum decurge',
        items: [
          { n: '01', t: 'Discuție', b: 'Discutăm despre planurile dumneavoastră și despre bugetul disponibil.' },
          { n: '02', t: 'Recunoașterea calificării', b: 'Ne ocupăm de recunoașterea calificării dumneavoastră agricole în Ungaria.' },
          { n: '03', t: 'Căutare', b: 'Împreună cu partenerii noștri, căutăm terenuri care îndeplinesc condițiile.' },
          { n: '04', t: 'Autorizații', b: 'Solicitarea autorizațiilor necesare pentru dobândirea terenului.' },
          { n: '05', t: 'Cumpărare', b: 'Contract bilingv, înscriere în cartea funciară, transferul cererilor de subvenție.' },
        ],
      },
      {
        type: 'callout',
        title: 'Important',
        body: 'Regulile privind dobândirea terenurilor agricole se schimbă din când în când și depind de situația dumneavoastră concretă. Informațiile de aici au caracter orientativ. Pentru un proiect concret, consultați întotdeauna echipa noastră și un jurist specializat.',
      },
      {
        type: 'cta',
        title: 'Căutați o proprietate agricolă',
        body: 'Spuneți-ne ce vă doriți; căutăm și dincolo de proprietățile din anunțuri.',
        primary: { label: 'Căutare gratuită', to: 'searchRequest' },
        secondary: { label: 'Proprietățile noastre', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Cumpărare în Ungaria: procedura pas cu pas',
    metaDescription:
      'Cum decurge cumpărarea unei proprietăți în Ungaria pentru un cumpărător străin: contract, avans, cartea funciară, contractele de apă, gaz și electricitate și costurile de luat în calcul.',
    eyebrow: 'Pentru cumpărători',
    title: 'Cumpărare în',
    titleEm: 'Ungaria',
    intro:
      'Procedura de cumpărare din Ungaria este cât se poate de previzibilă odată ce îi cunoașteți etapele. Acest ghid vă poartă prin fiecare dintre ele.',
    sections: [
      {
        type: 'steps',
        title: 'Cum decurge',
        items: [
          { n: '01', t: 'Selecție', b: 'Alegeți dintre proprietățile noastre sau trimiteți o cerere de căutare gratuită.' },
          { n: '02', t: 'Vizionare', b: 'Organizăm călătoria și vizionarea, cu interpret.' },
          { n: '03', t: 'Ofertă', b: 'Vă ajutăm să faceți o ofertă realistă și să negociați.' },
          { n: '04', t: 'Contract și avans', b: `Contract de vânzare-cumpărare bilingv, de regulă cu un avans de ${pct(10)}.` },
          { n: '05', t: 'Prețul de cumpărare', b: 'Restul prețului prin transfer bancar, conform contractului.' },
          { n: '06', t: 'Predarea cheilor', b: 'Înscriere în cartea funciară, contracte de utilități, predarea cheilor.' },
        ],
      },
      {
        type: 'list',
        title: 'Costuri pe lângă prețul de cumpărare',
        items: [
          'Taxa de transfer al proprietății: cota depinde de tipul proprietății și de situația dumneavoastră',
          'Onorariul avocatului pentru redactarea și contrasemnarea actului',
          `Traducerea contractului bilingv: ${des('hu')}, în funcție de combinația de limbi`,
          'Taxe de carte funciară',
          'Eventualul comision FODEL: îl plătește vânzătorul, nu dumneavoastră',
        ],
      },
      {
        type: 'prose',
        title: 'Nu trebuie să fiți prezent',
        paragraphs: [
          'Pe baza unei procuri, vă reprezentăm la semnare, la cartea funciară și la transferul contractelor de apă, gaz și electricitate. Astfel, achiziția poate avea loc chiar dacă nu puteți sau nu doriți să călătoriți.',
        ],
      },
      {
        type: 'callout',
        title: 'Certificat de performanță energetică',
        body: 'În Ungaria este obligatoriu certificatul de performanță energetică, care, conform normelor UE, trebuie menționat și în anunț. În anunțurile noastre găsiți clasa energetică printre caracteristici; „În curs” înseamnă că certificatul este încă în pregătire.',
      },
      {
        type: 'cta',
        title: 'Să începem',
        body: 'Răsfoiți proprietățile noastre sau spuneți-ne ce căutați. Nu vă costă nimic.',
        primary: { label: 'Proprietățile noastre', to: 'properties' },
        secondary: { label: 'Căutare gratuită', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Mutarea în Ungaria: de ce fac neerlandezii acest pas',
    metaDescription:
      'Cele patru motive pentru care neerlandezii și belgienii se mută în Ungaria: raportul calitate-preț, spațiul, costul mai mic al vieții și poziția geografică.',
    eyebrow: 'Context',
    title: 'Mutarea în',
    titleEm: 'Ungaria',
    intro:
      'Mulți neerlandezi și belgieni aleg Ungaria. În sute de discuții cu clienții noștri, revin mereu aceleași patru motive.',
    sections: [
      {
        type: 'prose',
        title: 'Raportul calitate-preț',
        paragraphs: [
          `Proprietățile rurale din Ungaria au unul dintre cele mai bune rapoarte calitate-preț din Europa. În Țările de Jos, un teren de construcție de 125 m² costă lejer ${eur(88000, L)}, iar un garaj în jur de ${eur(100000, L)}. Cu aceeași sumă, în mediul rural maghiar cumpărați o casă familială spațioasă, adesea cu un teren generos.`,
        ],
      },
      {
        type: 'prose',
        title: 'Spațiu',
        paragraphs: [
          'Țările de Jos au 482 de locuitori pe km² la o populație de circa 17 milioane, iar o parte importantă a țării este acoperită de apă. Lipsa de spațiu nu este o problemă abstractă, ci o experiență de zi cu zi, și motivul invocat cel mai des.',
        ],
      },
      {
        type: 'prose',
        title: 'Costul vieții',
        paragraphs: [
          'O mare parte dintre cumpărătorii noștri sunt pensionari sau aproape de pensie. Pentru ei, costul mai mic al vieții, lipsa impozitului pe proprietate și îngrijirea medicală accesibilă oferă împreună un nivel de trai pe care aceeași pensie nu l-ar permite în Țările de Jos.',
        ],
      },
      {
        type: 'prose',
        title: 'Poziția geografică',
        paragraphs: [
          'De la inundațiile din 1953, Țările de Jos au construit un sistem uriaș de apărare împotriva apei. Îngrijorarea legată de creșterea nivelului mării cântărește în multe decizii: Ungaria se află în inima continentului, deasupra nivelului mării.',
        ],
      },
      {
        type: 'cta',
        title: 'Descoperiți Ungaria',
        body: 'Răsfoiți proprietățile noastre sau lăsați-ne să căutăm ceea ce aveți în minte.',
        primary: { label: 'Proprietățile noastre', to: 'properties' },
        secondary: { label: 'Cumpărare în Ungaria', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Ghid foto pentru cei care publică anunțuri',
    metaDescription:
      'Fotografiile bune sunt cel mai bun mijloc pentru o vânzare rapidă. Ghidul foto FODEL: lumină, încadrare, rezoluție și cele mai frecvente greșeli.',
    eyebrow: 'Pentru vânzători',
    title: 'Ghidul',
    titleEm: 'foto',
    intro:
      'Cumpărătorii străini văd mai întâi fotografiile, adesea doar fotografiile. Aceste reguli contează mai mult decât orice text de anunț.',
    sections: photoGuideSections(L, {
      topTitle: 'Cele șase reguli esențiale',
      calloutTitle: 'Preferați să delegați?',
      calloutBody: (lines) =>
        `Apelați la un profesionist. Îl puteți alege cu un clic când publicați anunțul: ${lines.join('; ')}. Ambele opțiuni sunt facultative; un membru al echipei noastre vă va contacta pentru a stabili o întâlnire.`,
      ctaTitle: 'Gata să publicați anunțul',
      primary: 'Publicați un anunț',
      secondary: 'Tarife',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
