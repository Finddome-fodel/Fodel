/**
 * Pagini juridice, română (adresare cu „dumneavoastră”). Traducere fidelă a
 * paginilor neerlandeze (src/data/pages-legal.ts): aceleași secțiuni, aceleași
 * cifre, același sens.
 *
 * ⚠️ Traducere de curtoazie. Trebuie validată de client împreună cu un jurist
 * înainte de lansare, la fel ca originalele maghiare și neerlandeze. Frazele
 * care se bazează pe dreptul neerlandez sau maghiar (roluri GDPR, TVA
 * neerlandez, autoritatea neerlandeză, dreptul de retragere, platforma SOL)
 * sunt enumerate în Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';
import type { LegalKey } from '~/data/pages-legal';

const L = 'ro' as const;
const pct = (n: number) => `${n}%`;
const months = (n: number) => nOf(L, n, 'lună', 'luni', 'de luni');
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 iulie 2026';
const notice =
  'Această versiune este o traducere pusă la dispoziție pentru comoditate. În caz de neconcordanță, prevalează originalul neerlandez (pentru aspectele care țin de dreptul neerlandez) sau cel maghiar.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_RO = {
  imprint: {
    metaTitle: 'Informații legale: datele companiei',
    metaDescription: `Datele companiei ${COMPANY.names.legal}: sediu, cod de TVA, număr KvK și date de contact.`,
    eyebrow: 'Informații legale',
    title: 'Datele',
    titleEm: 'companiei',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Informații despre furnizorul serviciului',
        rows: [
          ['Denumire', COMPANY.names.legal],
          ['Sediu', addressLine(COMPANY.address, L)],
          ['Cod de TVA', COMPANY.registration.vat],
          ['Număr KvK (registrul comerțului din Țările de Jos)', kvk],
          ['Reprezentant', COMPANY.principal],
          ['E-mail', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Anul înființării', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Conturi bancare',
        rows: [
          ['Țările de Jos', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Ungaria', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Litigii',
        body: 'În cazul unui litigiu de consum, puteți apela și la platforma europeană de soluționare online a litigiilor: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Politica de confidențialitate',
    metaDescription:
      'Cum prelucrează FODEL datele dumneavoastră cu caracter personal: ce date prelucrăm, cât timp le păstrăm și ce drepturi aveți conform GDPR.',
    eyebrow: 'Confidențialitate',
    title: 'Politica de',
    titleEm: 'confidențialitate',
    intro:
      'Această politică descrie modul în care prelucrăm datele cu caracter personal pe care ni le transmiteți prin acest site, în conformitate cu GDPR.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Operatorul de date',
        rows: [
          ['Operator', COMPANY.names.legal],
          ['Adresă', addressLine(COMPANY.address, L)],
          ['E-mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Datele pe care le prelucrăm',
        intro: 'Doar datele pe care le introduceți chiar dumneavoastră în formularele noastre:',
        items: [
          'Numele, adresa de e-mail și numărul de telefon: pentru a vă putea răspunde la solicitare',
          'Subiectul și conținutul mesajului dumneavoastră',
          'Pentru un anunț: datele proprietății și datele dumneavoastră de facturare',
          'Pentru o cerere de căutare: criteriile dumneavoastră de căutare',
          'Pentru administrarea internă: când și ce formular ați completat și când v-ați autentificat în portal, fără înregistrarea adresei IP',
        ],
      },
      {
        type: 'table',
        title: 'Temei juridic și durata păstrării',
        rows: [
          ['Contact și solicitare de apel', 'Consimțământ (art. 6 alin. (1) lit. (a) GDPR): 12 luni'],
          ['Comandarea unui anunț', 'Executarea unui contract (art. 6 alin. (1) lit. (b)): 7 ani, termenul legal de păstrare fiscală'],
          ['Cerere de căutare', 'Consimțământ: până la finalizare, cel mult 24 de luni'],
          ['Jurnal intern de activitate', 'Interes legitim (art. 6 alin. (1) lit. (f)): administrare ordonată și depistarea abuzurilor: cel mult 24 de luni'],
        ],
      },
      {
        type: 'list',
        title: 'Cu cine partajăm datele',
        intro: 'Nu vindem datele dumneavoastră și nu le partajăm în scopuri de marketing. Persoanele împuternicite de noi sunt:',
        items: [
          'Furnizorul nostru de e-mail, cu prelucrare în UE',
          'Furnizorul de găzduire al acestui site',
          'În cazul unei achiziții și numai la cererea dumneavoastră: cealaltă parte și avocatul implicat',
        ],
      },
      {
        type: 'callout',
        title: 'Despre anunțuri',
        body: 'Ca persoană care publică un anunț, ne puteți permite să afișăm numele și numărul dumneavoastră de telefon alături de anunț, pentru ca persoanele interesate să vă poată contacta direct. Puteți retrage oricând această permisiune; în acest caz, eliminăm datele respective din anunț.',
      },
      // PROIECT: în așteptarea verificării juridice (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Newsletter',
        body: 'Dacă vă abonați la newsletterul nostru, prelucrăm adresa dumneavoastră de e-mail, limba aleasă și momentul abonării și al confirmării, exclusiv pentru a vă trimite newsletterul, pe baza consimțământului dumneavoastră. Abonarea are loc în doi pași: nu trimitem nimic până când nu faceți clic pe butonul din e-mailul de confirmare. În fiecare e-mail vă puteți dezabona cu un singur clic, iar noi oprim imediat trimiterea. Pentru trimitere folosim serviciul Resend.',
      },
      {
        type: 'list',
        title: 'Drepturile dumneavoastră',
        items: [
          'Accesul la datele pe care le prelucrăm despre dumneavoastră',
          'Rectificarea și ștergerea',
          'Restricționarea prelucrării sau opoziția față de aceasta',
          'Portabilitatea datelor',
          'Retragerea consimțământului în orice moment',
          'Depunerea unei plângeri la autoritatea neerlandeză pentru protecția datelor (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Contact privind confidențialitatea',
        paragraphs: [`Ne puteți trimite întrebările sau solicitările la ${COMPANY.email.primary}. Răspundem în cel mult 30 de zile.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Politica privind cookie-urile',
    metaDescription: `Cookie-urile folosite de ${SITE_HOST} și cum vă puteți modifica alegerea.`,
    eyebrow: 'Cookie-uri',
    title: 'Politica privind',
    titleEm: 'cookie-urile',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Deocamdată, acest site folosește doar stocarea de date strict necesară din punct de vedere tehnic. Nu rulăm scripturi publicitare sau de urmărire și nu partajăm nimic cu rețelele de socializare.',
        ],
      },
      {
        type: 'table',
        title: 'Ce stocăm',
        rows: [
          [
            'fodel:consent',
            'Alegerea dumneavoastră privind cookie-urile (acceptate sau refuzate). Se păstrează în browserul dumneavoastră și nu ajunge la noi. Durata păstrării: 12 luni.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistici',
        paragraphs: [
          'Dacă vom măsura vreodată traficul, îl vom activa numai cu consimțământul dumneavoastră prealabil și explicit. Refuzul nu limitează în niciun fel utilizarea site-ului.',
        ],
      },
      {
        type: 'prose',
        title: 'Modificarea alegerii',
        paragraphs: [
          'Vă puteți modifica oricând alegerea ștergând datele stocate de browser pentru acest site; bannerul de cookie-uri va apărea din nou.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Termeni și condiții',
    metaDescription:
      'Condițiile serviciului de anunțuri și intermediere FODEL: tarife, comision, retragere și răspundere.',
    eyebrow: 'Condiții',
    title: 'Termeni și',
    titleEm: 'condiții',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'De reținut',
        body: 'Această pagină este un rezumat. Condițiile complete și aplicabile sunt disponibile în format PDF; în caz de neconcordanță, prevalează PDF-ul.',
      },
      {
        type: 'prose',
        title: '1. Serviciul',
        paragraphs: [
          'FODEL publică anunțuri cu proprietăți din Ungaria pe propriile site-uri multilingve și, pe baza unui acord separat, participă la derularea vânzării.',
          'Serviciul de anunțuri nu este exclusiv: vânzătorul poate oferi și vinde proprietatea și prin alte canale.',
        ],
      },
      {
        type: 'list',
        title: '2. Publicarea unui anunț',
        ordered: true,
        items: [
          'Vânzătorul completează formularul de înregistrare.',
          'FODEL trimite o solicitare de plată pentru pachetul ales.',
          'Vânzătorul plătește prin transfer bancar.',
          'După primirea plății, vânzătorul poate încărca fotografii.',
          'FODEL se ocupă de traducere și publică anunțul.',
        ],
      },
      {
        type: 'table',
        title: '3. Tarife',
        intro: `Toate prețurile includ ${pct(LISTING_VAT_PERCENT)} TVA neerlandez. Prezentarea completă o găsiți pe pagina Tarife.`,
        rows: [
          [`Anunț economic (${months(cheap.months)})`, eur(cheap.priceEur, L)],
          [`Anunț standard (${months(normal.months)})`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Traducere', `${eur(extra('translation').priceEur, L)} pe limbă`],
          [
            'Promovare',
            `${extra('category-highlight').priceEur}–${eur(extra('homepage-highlight').priceEur, L)} pe lună (min. ${months(minMonths)})`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Comision',
        paragraphs: [
          'Comisionul se datorează numai dacă sunt îndeplinite toate condițiile următoare: un contract de vânzare-cumpărare scris, un cumpărător adus de FODEL și un avans plătit.',
          `Comisionul este de ${pct(COMMISSION.percent)} net, cel puțin ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} TVA neerlandez.`,
          'Dacă persoana interesată se adresează direct vânzătorului și ajutorul nostru la derulare nu este necesar, nu se datorează nimic în afară de taxa pentru anunț.',
        ],
      },
      {
        type: 'prose',
        title: '5. Retragerea anunțului',
        paragraphs: [
          'Vânzătorul poate retrage anunțul înainte de data expirării. În acest caz, taxa pentru anunț deja plătită nu se rambursează.',
        ],
      },
      {
        type: 'prose',
        title: '6. Răspundere',
        paragraphs: [
          'Vânzătorul răspunde de corectitudinea informațiilor despre proprietate. FODEL reproduce informațiile primite și nu își asumă răspunderea pentru corectitudinea lor.',
          'Traducerile de pe acest site au caracter informativ; în caz de litigiu, prevalează versiunea maghiară.',
        ],
      },
      {
        type: 'prose',
        title: '7. Dreptul de retragere',
        paragraphs: [
          'Un vânzător care este consumator beneficiază de dreptul legal de retragere pentru contractele încheiate la distanță. Dacă solicită în mod expres executarea imediată, dreptul de retragere se reduce proporțional cu serviciul deja prestat.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Declarație de accesibilitate',
    metaDescription: `Nivelul de accesibilitate al site-ului ${SITE_HOST}, standardul aplicat și cum ne puteți transmite observațiile dumneavoastră.`,
    eyebrow: 'Accesibilitate',
    title: 'Declarație de',
    titleEm: 'accesibilitate',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Ne dorim ca acest site să poată fi folosit de toată lumea, inclusiv de vizitatorii care folosesc un cititor de ecran, tastatura sau mărirea ecranului.',
          'Dezvoltăm site-ul conform standardului WCAG 2.2, nivelul AA. O parte importantă a vizitatorilor noștri sunt pensionari, de aceea dimensiunea textului, contrastul și navigarea cu tastatura au prioritate.',
        ],
      },
      {
        type: 'list',
        title: 'Ce am implementat',
        items: [
          'Tot textul are un raport de contrast de cel puțin 4,5:1',
          'Navigare completă cu tastatura și indicator de focalizare vizibil',
          'Un link „Salt la conținut” în partea de sus a fiecărei pagini',
          'Texte alternative relevante pentru toate imaginile',
          'Câmpuri de formular cu etichete asociate și mesaje de eroare în text',
          'Respectarea setării de sistem „Reducere mișcare”',
          'Site-ul rămâne lizibil și utilizabil fără JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Limitări cunoscute',
        paragraphs: ['Nu avem nicio influență asupra accesibilității conținutului terților, cum ar fi un serviciu de hărți.'],
      },
      {
        type: 'prose',
        title: 'Observațiile dumneavoastră',
        paragraphs: [
          `Ați întâmpinat un obstacol? Spuneți-ne la ${COMPANY.email.primary} sau telefonic. Rezolvăm sesizările cât mai repede posibil.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
