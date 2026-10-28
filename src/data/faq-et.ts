/**
 * FAQ, Estonian (formal "teie"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'et' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_ET = [
  {
    id: 'direct-from-the-owner',
    question: 'Mida tähendab „otse omanikult“?',
    answer: [
      'Suure osa meie pakkumise puhul avaldame oma andmete kõrval ka omaniku nime ja telefoninumbri. Võite müüjaga otse ühendust võtta.',
      'Kui võtate otse ühendust ja lepite ostu omavahel kokku, ei maksa keegi vahendustasu: ei teie ega müüja. Siis saame tasu ainult kuulutuse eest.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Kui palju teie vahendus maksab?',
    answer: [
      `Meie vahendustasu on ${COMMISSION.percent}% netosummast, vähemalt ${eur(COMMISSION.minimumEur, L)}, millele lisandub ${COMMISSION.vatPercent}% Hollandi käibemaks. Selle maksab Ungari müüja, mitte teie.`,
      'Arve esitame ainult siis, kui kõik kolm tingimust on täidetud: olemas on kirjalik müügileping, ostja on leidnud FINDDOME ja käsiraha on tasutud.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Kas ma saan ELi kodanikuna osta Ungaris kinnisvara?',
    answer: [
      'Jah. ELi kodanikuna ostate Ungaris maju ja krunte praktiliselt samadel tingimustel kui ungarlane. Peaaegu 100% Ungari kinnisvarast asub täisomandis maal. Hoonestusõigus, nagu Hollandi erfpacht, on haruldane.',
      `Põllumajandusmaale kehtivad eraldi reeglid. Põllumajandusliku kvalifikatsiooniga ELi kodanik võib Ungaris omandada kuni ${AGRI_HECTARE_LIMIT} hektarit; korraldame selle menetluse täielikult.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Kas ma pean allkirjastamiseks Ungarisse sõitma?',
    answer: [
      'Ei. Saame teid Ungaris volikirja alusel esindada, nii et allkirjastamiseks ei pea te kohale tulema.',
      'Hoolitseme ka Ungari kinnistusraamatusse kandmise ja kommunaalteenuste üleandmise eest.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'Mis keeles müügileping koostatakse?',
    answer: [
      'Laseme koostada kakskeelsed lepingud, nii et loete, mida allkirjastate.',
      `Hinnangulised hinnad: ungari keel alates ${price('hu')}, saksa–ungari ja inglise–ungari alates ${price('de-hu')}, hollandi–ungari alates ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Mida FINDDOME ostu puhul täpselt korraldab?',
    answer: [
      '- Nõustamine telefoni ja e-posti teel ning suhtlus poolte vahel',
      '- Isiklikud kohtumised ja vaatamised kohapeal',
      '- Kolleeg, kes räägib teie keelt ja reisib koos teiega',
      '- Tugi hinnaläbirääkimistel',
      '- Mitmekeelse lepingu koostamine',
      '- Kogu ostu korraldamine',
      '- Uue omaniku registreerimine ja kommunaalteenuste üleandmine',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Miks valivad Lääne-Euroopa ostjad Ungari?',
    answer: [
      '- Kinnisvarahinnad ja elamiskulud on tunduvalt madalamad',
      '- Kinnisvaramaksu Ungaris üldjuhul ei võeta',
      '- Rohkem päikest ja pehmem kliima',
      '- Riik asub merepinnast kõrgemal, mandri keskel',
      '- Ungari on ELi liikmesriik',
      '- Peaaegu kogu kinnisvara asub täisomandis maal',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Kas Ungari kinnisvaral on energiamärgis?',
    answer: [
      'Jah. Ungaris on nõutav energiamärgis (energiatanúsítvány) ja see tuleb kuulutuses ära märkida. Meie kuulutustes on klass näidatud omaduste juures; „koostamisel“ tähendab, et märgist alles koostatakse.',
      'Kui müüja soovib, saame lasta märgise tema eest koostada.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Mis on otsinguteenus ja kui palju see maksab?',
    answer: [
      'Otsinguteenus on tasuta. Ütlete meile, mida otsite (tüüp, piirkond, eelarve ja soovid), ja meie otsime teie eest, ka väljaspool selle saidi objekte.',
      'Meie ungari keelt kõnelevad kolleegid aitavad läbirääkimistel ja hoolitsevad selle eest, et leping koostatakse õiguslikult korrektselt. Saate e-kirja kohe, kui midagi sobivat ilmub.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Milliseid piirkondi katate?',
    answer: [
      'Põhirõhk on Taga-Doonaumaal: Baranya, Tolna, Zala, Somogy ja Veszprémi maakond, lisaks Balatoni järv ja Balatoni mägismaa.',
      'Meil on objekte ka tasandikul ja piirkondades, kust on head ühendused Budapesti lennujaamaga.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Ma ei räägi ungari keelt. Kas see on probleem?',
    answer: [
      'Ei. Igas kuulutuses on märgitud, milliseid keeli omanik räägib, nii et teate seda ette.',
      'Meie meeskond räägib hollandi, saksa, inglise, prantsuse ja ungari keelt ning tuleb vaatamisele kaasa.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Millal teid kätte saab?',
    answer: [
      `Tööpäeviti kell ${COMPANY.hours.weekdays.from}–${COMPANY.hours.weekdays.to}. Kui palute tagasihelistamist, helistame kuni kella ${COMPANY.hours.callback.to}, ka nädalavahetustel.`,
      'Tagasihelistamine ei maksa teile midagi. Kõne eest maksame meie.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
