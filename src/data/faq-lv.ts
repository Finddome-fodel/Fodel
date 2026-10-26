/**
 * FAQ, Latvian (formal "jūs"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'lv' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_LV = [
  {
    id: 'direct-from-the-owner',
    question: 'Ko nozīmē „tieši no īpašnieka“?',
    answer: [
      'Lielai daļai mūsu piedāvājuma līdzās mūsu kontaktiem publicējam īpašnieka vārdu un tālruņa numuru. Ar pārdevēju varat sazināties tieši.',
      'Ja sazināties tieši un vienojaties par pirkumu paši, neviens nemaksā komisiju: ne jūs, ne pārdevējs. Tad mēs saņemam samaksu tikai par sludinājumu.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Cik maksā jūsu starpniecība?',
    answer: [
      `Mūsu komisija ir ${COMMISSION.percent}% neto, vismaz ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}% Nīderlandes PVN. To maksā Ungārijas pārdevējs, nevis jūs.`,
      'Rēķinu izrakstām tikai tad, ja izpildīti visi trīs nosacījumi: ir rakstisks pirkuma līgums, pircēju ir atradis FODEL un ir samaksāta rokasnauda.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Vai kā ES pilsonis varu iegādāties īpašumu Ungārijā?',
    answer: [
      'Jā. Kā ES pilsonis jūs Ungārijā pērkat mājas un zemes gabalus praktiski ar tādiem pašiem nosacījumiem kā ungārs. Gandrīz 100% Ungārijas īpašumu atrodas uz zemes pilnā īpašumā. Apbūves tiesības, piemēram, Nīderlandes erfpacht, ir retas.',
      `Lauksaimniecības zemei ir atsevišķi noteikumi. ES pilsonis ar lauksaimniecības kvalifikāciju Ungārijā var iegādāties līdz ${AGRI_HECTARE_LIMIT} hektāriem; mēs pilnībā nokārtojam šo procedūru.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Vai man jābrauc uz Ungāriju, lai parakstītu?',
    answer: [
      'Nē. Mēs varam jūs pārstāvēt Ungārijā ar pilnvaru, tāpēc jums nav jāierodas uz parakstīšanu.',
      'Parūpējamies arī par reģistrāciju Ungārijas zemesgrāmatā un komunālo pakalpojumu pārņemšanu.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'Kādā valodā tiek sagatavots pirkuma līgums?',
    answer: [
      'Mēs nodrošinām divvalodu līgumus, lai jūs izlasītu to, ko parakstāt.',
      `Orientējošas cenas: ungāru valodā no ${price('hu')}, vācu–ungāru un angļu–ungāru no ${price('de-hu')}, nīderlandiešu–ungāru no ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Ko tieši FODEL nokārto, kad pērkat?',
    answer: [
      '- Konsultācijas pa tālruni un e-pastu un saziņa starp abām pusēm',
      '- Personīgas tikšanās un apskates uz vietas',
      '- Kolēģis, kurš runā jūsu valodā un dodas kopā ar jums',
      '- Atbalsts cenu sarunās',
      '- Daudzvalodu līguma sagatavošana',
      '- Visa pirkuma nokārtošana',
      '- Jaunā īpašnieka reģistrācija un komunālo pakalpojumu pārņemšana',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Kāpēc Rietumeiropas pircēji izvēlas Ungāriju?',
    answer: [
      '- Īpašumu cenas un dzīves izmaksas ir ievērojami zemākas',
      '- Nekustamā īpašuma nodoklis Ungārijā parasti netiek iekasēts',
      '- Vairāk saules un maigāks klimats',
      '- Valsts atrodas virs jūras līmeņa, kontinenta vidū',
      '- Ungārija ir ES dalībvalsts',
      '- Gandrīz visi īpašumi atrodas uz zemes pilnā īpašumā',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Vai Ungārijas īpašumam ir energosertifikāts?',
    answer: [
      'Jā. Ungārijā ir obligāts energosertifikāts (energiatanúsítvány), un tas jānorāda sludinājumā. Mūsu sludinājumos klase ir redzama pie īpašībām; „tiek gatavots“ nozīmē, ka sertifikāts vēl tiek sagatavots.',
      'Ja pārdevējs vēlas, mēs varam viņam nokārtot sertifikāta sagatavošanu.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Kas ir meklēšanas pakalpojums un cik tas maksā?',
    answer: [
      'Meklēšanas pakalpojums ir bezmaksas. Jūs pastāstāt, ko meklējat (veidu, apvidu, budžetu un vēlmes), un mēs meklējam jūsu vietā, arī ārpus šajā vietnē piedāvātajiem īpašumiem.',
      'Mūsu ungāru valodā runājošie kolēģi palīdz sarunās un rūpējas, lai līgums būtu juridiski pareizi sagatavots. Tiklīdz parādās kas piemērots, jūs saņemat e-pastu.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Kādus reģionus aptverat?',
    answer: [
      'Galvenā uzmanība ir Aizdonavai ar Baraņas, Tolnas, Zalas, Šomodas un Vesprēmas medi, kā arī Balatonam un Balatona augstienei.',
      'Mums ir īpašumi arī līdzenumā un apvidos ar labu satiksmi līdz Budapeštas lidostai.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Es nerunāju ungāriski. Vai tā ir problēma?',
    answer: [
      'Nē. Katrā sludinājumā norādīts, kādās valodās runā īpašnieks, tāpēc jūs to zināt jau iepriekš.',
      'Mūsu komanda runā nīderlandiešu, vācu, angļu, franču un ungāru valodā un dodas kopā ar jums uz apskati.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Kad ar jums var sazināties?',
    answer: [
      `Darba dienās no ${COMPANY.hours.weekdays.from} līdz ${COMPANY.hours.weekdays.to}. Ja piesakāt atzvanu, zvanām līdz ${COMPANY.hours.callback.to}, arī brīvdienās.`,
      'Atzvans jums neko nemaksā. Par zvanu maksājam mēs.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
