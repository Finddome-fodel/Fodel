/**
 * Legal pages, Estonian (formal "teie"). A faithful translation of the Dutch pages
 * (src/data/pages-legal.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. It needs the client's and a lawyer's sign-off before
 * launch, like the Hungarian and Dutch originals. Every sentence that leans on
 * Dutch or Hungarian law (GDPR roles, Dutch VAT, the Dutch regulator, the
 * right of withdrawal, the ODR platform) is listed in Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'et' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. juuli 2026';
const notice =
  'See on tõlge teie mugavuseks. Erinevuste korral kehtib hollandikeelne (Hollandi õiguse küsimustes) või ungarikeelne originaal.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_ET = {
  imprint: {
    metaTitle: 'Ettevõtte andmed: rekvisiidid',
    metaDescription: `Ettevõtte ${COMPANY.names.legal} andmed: registrijärgne aadress, käibemaksukohustuslase number, KvK number ja kontaktandmed.`,
    eyebrow: 'Ettevõtte andmed',
    title: 'Ettevõtte',
    titleEm: 'rekvisiidid',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Teenuseosutaja andmed',
        rows: [
          ['Ärinimi', COMPANY.names.legal],
          ['Registrijärgne aadress', addressLine(COMPANY.address, L)],
          ['Käibemaksukohustuslase number', COMPANY.registration.vat],
          ['KvK number (Hollandi kaubanduskoda)', kvk],
          ['Esindaja', COMPANY.principal],
          ['E-post', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Asutatud', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Pangakontod',
        rows: [
          ['Holland', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Ungaris', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Vaidlused',
        body: 'Tarbijavaidluse korral võite kasutada ka Euroopa vaidluste veebipõhise lahendamise platvormi: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Isikuandmete kaitse',
    metaDescription:
      'Kuidas FODEL teie isikuandmeid töötleb: milliseid andmeid töötleme, kui kaua neid säilitame ja millised õigused teil on isikuandmete kaitse üldmääruse alusel.',
    eyebrow: 'Privaatsus',
    title: 'Isikuandmete',
    titleEm: 'kaitse',
    intro:
      'Selles teates kirjeldame, kuidas töötleme kooskõlas isikuandmete kaitse üldmäärusega isikuandmeid, mida te meile selle veebisaidi kaudu esitate.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Vastutav töötleja',
        rows: [
          ['Vastutav töötleja', COMPANY.names.legal],
          ['Aadress', addressLine(COMPANY.address, L)],
          ['E-post', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Milliseid andmeid me töötleme',
        intro: 'Ainult andmed, mille te ise meie vormidesse sisestate:',
        items: [
          'Nimi, e-posti aadress ja telefoninumber: et saaksime teie päringule vastata',
          'Teie sõnumi teema ja sisu',
          'Kuulutuse puhul: kinnisvara andmed ja teie arveldusandmed',
          'Otsingupäringu puhul: teie otsingukriteeriumid',
          'Sisemiseks halduseks: millal ja millise vormi täitsite ning millal portaali sisse logisite, ilma IP-aadressi salvestamata',
        ],
      },
      {
        type: 'table',
        title: 'Õiguslik alus ja säilitamise aeg',
        rows: [
          ['Kontakt ja tagasihelistamise taotlus', 'Nõusolek (isikuandmete kaitse üldmääruse art 6 lg 1 p a): 12 kuud'],
          ['Kuulutuse tellimus', 'Lepingu täitmine (art 6 lg 1 p b): 7 aastat, seadusjärgne maksualane säilitamine'],
          ['Otsingupäring', 'Nõusolek: kuni lõpetamiseni, kõige kauem 24 kuud'],
          ['Sisemine tegevuslogi', 'Õigustatud huvi (art 6 lg 1 p f): korrektne haldus ja kuritarvituste avastamine: kõige kauem 24 kuud'],
        ],
      },
      {
        type: 'list',
        title: 'Kellega me andmeid jagame',
        intro: 'Me ei müü teie andmeid ega jaga neid turunduslikel eesmärkidel. Meie volitatud töötlejad on:',
        items: [
          'Meie e-posti teenuse pakkuja, kes töötleb andmeid ELis',
          'Selle veebisaidi majutusteenuse pakkuja',
          'Ostu korral ja ainult teie soovil: teine pool ja kaasatud advokaat',
        ],
      },
      {
        type: 'callout',
        title: 'Kuulutustest',
        body: 'Kuulutuse esitajana võite anda meile loa näidata kuulutuses teie nime ja telefoninumbrit, et huvilised saaksid teiega otse ühendust võtta. Loa saate igal ajal tagasi võtta; siis eemaldame andmed kuulutusest.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Uudiskiri',
        body: 'Kui tellite meie uudiskirja, töötleme teie e-posti aadressi, valitud keelt ning tellimise ja kinnitamise aega üksnes uudiskirja saatmiseks teie nõusoleku alusel. Tellimine toimub kahes etapis: me ei saada midagi enne, kui olete kinnituskirjas nuppu klõpsanud. Igas kirjas saate tellimusest ühe klõpsuga loobuda ja me lõpetame kohe. Saatmiseks kasutame teenust Resend.',
      },
      {
        type: 'list',
        title: 'Teie õigused',
        items: [
          'Juurdepääs andmetele, mida me teie kohta töötleme',
          'Parandamine ja kustutamine',
          'Töötlemise piiramine või sellele vastuväite esitamine',
          'Andmete ülekandmine',
          'Nõusoleku tagasivõtmine igal ajal',
          'Kaebuse esitamine Hollandi andmekaitseasutusele (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt privaatsusküsimustes',
        paragraphs: [`Küsimused või taotlused võite saata aadressile ${COMPANY.email.primary}. Vastame hiljemalt 30 päeva jooksul.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Teave küpsiste kohta',
    metaDescription: `Milliseid küpsiseid ${SITE_HOST} kasutab ja kuidas oma valikut muuta.`,
    eyebrow: 'Küpsised',
    title: 'Teave',
    titleEm: 'küpsiste kohta',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Praegu kasutab see veebisait ainult tehniliselt vajalikku salvestust. Me ei kasuta reklaami- ega jälgimisskripte ega jaga midagi sotsiaalmeediaga.',
        ],
      },
      {
        type: 'table',
        title: 'Mida me salvestame',
        rows: [
          [
            'fodel:consent',
            'Teie valik küpsiste kohta (nõustutud või keeldutud). Säilitatakse teie brauseris ega jõua meieni. Säilitamise aeg: 12 kuud.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistika',
        paragraphs: [
          'Kui me kunagi peame külastajate statistikat, lülitame selle sisse ainult teie eelneval selgesõnalisel nõusolekul. Keeldumine ei piira kuidagi saidi kasutamist.',
        ],
      },
      {
        type: 'prose',
        title: 'Valiku muutmine',
        paragraphs: [
          'Valikut saate igal ajal muuta, kustutades selle saidi salvestatud brauseriandmed; seejärel ilmub küpsiste teade uuesti.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Teenuse tingimused',
    metaDescription:
      'FODELi kuulutus- ja vahendusteenuse tingimused: hinnad, vahendustasu, tagasivõtmine ja vastutus.',
    eyebrow: 'Tingimused',
    title: 'Teenuse',
    titleEm: 'tingimused',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Pange tähele',
        body: 'See leht on kokkuvõte. Täielikud siduvad tingimused on saadaval PDF-ina; erinevuste korral kehtib PDF.',
      },
      {
        type: 'prose',
        title: '1. Teenus',
        paragraphs: [
          'FODEL reklaamib Ungari kinnisvara oma mitmekeelsetel veebisaitidel ning aitab eraldi kokkuleppe alusel müüki lõpule viia.',
          'Kuulutusteenus ei ole ainuõiguslik: müüja võib kinnisvara pakkuda ja müüa ka teiste kanalite kaudu.',
        ],
      },
      {
        type: 'list',
        title: '2. Kuulutuse esitamine',
        ordered: true,
        items: [
          'Müüja täidab registreerimisvormi.',
          'FODEL saadab valitud paketi kohta maksenõude.',
          'Müüja maksab pangaülekandega.',
          'Pärast makse laekumist saab müüja õiguse fotosid üles laadida.',
          'FODEL korraldab tõlke ja avaldab kuulutuse.',
        ],
      },
      {
        type: 'table',
        title: '3. Hinnad',
        intro: `Kõik hinnad sisaldavad ${LISTING_VAT_PERCENT}% Hollandi käibemaksu. Täieliku ülevaate leiate lehelt Hinnad.`,
        rows: [
          [`Soodne kuulutus (${cheap.months} kuud)`, eur(cheap.priceEur, L)],
          [`Tavakuulutus (${normal.months} kuud)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Tõlge', `${eur(extra('translation').priceEur, L)} keele kohta`],
          [
            'Esiletõstmine',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} kuus (vähemalt ${minMonths} kuud)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Vahendustasu',
        paragraphs: [
          'Vahendustasu tuleb tasuda ainult siis, kui kõik järgmised tingimused on täidetud: kirjalik müügileping, FODELi leitud ostja ja tasutud käsiraha.',
          `Vahendustasu on ${COMMISSION.percent}% netosummast, vähemalt ${eur(COMMISSION.minimumEur, L)}, millele lisandub ${COMMISSION.vatPercent}% Hollandi käibemaks.`,
          'Kui huviline võtab müüjaga otse ühendust ja meie abi tehingu lõpetamisel pole vaja, ei tule peale kuulutuse tasu midagi maksta.',
        ],
      },
      {
        type: 'prose',
        title: '5. Kuulutuse tagasivõtmine',
        paragraphs: [
          'Müüja võib kuulutuse enne aegumiskuupäeva tagasi võtta. Juba tasutud kuulutustasusid sel juhul ei tagastata.',
        ],
      },
      {
        type: 'prose',
        title: '6. Vastutus',
        paragraphs: [
          'Müüja vastutab kinnisvara andmete õigsuse eest. FODEL edastab esitatud andmed ega vastuta nende õigsuse eest.',
          'Selle veebisaidi tõlked on informatiivsed; vaidluse korral kehtib ungarikeelne versioon.',
        ],
      },
      {
        type: 'prose',
        title: '7. Taganemisõigus',
        paragraphs: [
          'Tarbijast müüjal on sidevahendi abil sõlmitud lepingute puhul seadusjärgne taganemisõigus. Kui müüja palub sõnaselgelt kohest täitmist, väheneb taganemisõigus proportsionaalselt juba osutatud teenusega.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Ligipääsetavuse teatis',
    metaDescription: `${SITE_HOST} ligipääsetavuse tase, standard, mida järgime, ja kuidas meile tagasisidet anda.`,
    eyebrow: 'Ligipääsetavus',
    title: 'Ligipääsetavuse',
    titleEm: 'teatis',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Soovime, et seda veebisaiti saaksid kasutada kõik, sealhulgas ekraanilugeja, klaviatuuri või suurenduse kasutajad.',
          'Ehitame saidi WCAG 2.2 AA-taseme järgi. Märkimisväärne osa meie külastajatest on pensionärid, seega on esikohal teksti suurus, kontrastsus ja klaviatuuriga kasutamine.',
        ],
      },
      {
        type: 'list',
        title: 'Mis on juba olemas',
        items: [
          'Kogu teksti kontrastsuhe on vähemalt 4,5 : 1',
          'Täielik klaviatuuriga kasutamine nähtava fookusetähisega',
          'Link „liigu sisu juurde“ iga lehe ülaosas',
          'Sisukad asendustekstid kõigil piltidel',
          'Vormiväljad seotud siltide ja tekstiliste veateadetega',
          'Süsteemiseade „vähenda liikumist“ arvestamine',
          'Saiti saab lugeda ja kasutada ka ilma JavaScriptita',
        ],
      },
      {
        type: 'prose',
        title: 'Teadaolevad piirangud',
        paragraphs: ['Me ei saa mõjutada kolmandate osapoolte sisu, näiteks kaarditeenuse, ligipääsetavust.'],
      },
      {
        type: 'prose',
        title: 'Tagasiside',
        paragraphs: [
          `Kui puutute kokku takistusega, andke meile teada aadressil ${COMPANY.email.primary} või telefoni teel. Lahendame teated nii kiiresti kui võimalik.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
