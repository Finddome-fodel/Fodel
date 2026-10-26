/**
 * FAQ, Lithuanian (formal "jūs"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'lt' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_LT = [
  {
    id: 'direct-from-the-owner',
    question: 'Ką reiškia „tiesiai iš savininko“?',
    answer: [
      'Daugeliui mūsų objektų greta savo duomenų skelbiame savininko vardą ir telefono numerį. Su pardavėju galite susisiekti tiesiogiai.',
      'Jei susisiekiate tiesiogiai ir dėl pirkimo susitariate patys, niekas nemoka komisinio: nei jūs, nei pardavėjas. Tada mums sumokama tik už skelbimą.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Kiek kainuoja jūsų tarpininkavimas?',
    answer: [
      `Mūsų komisinis yra ${COMMISSION.percent}\u00a0% be mokesčių, ne mažiau kaip ${eur(COMMISSION.minimumEur, L)}, plius ${COMMISSION.vatPercent}\u00a0% Nyderlandų PVM. Jį moka Vengrijos pardavėjas, ne jūs.`,
      'Sąskaitą išrašome tik tada, kai įvykdytos visos trys sąlygos: yra rašytinė pirkimo–pardavimo sutartis, pirkėją surado FODEL ir sumokėtas avansas.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Ar galiu kaip ES pilietis įsigyti turto Vengrijoje?',
    answer: [
      'Taip. Kaip ES pilietis Vengrijoje perkate namus ir sklypus praktiškai tomis pačiomis sąlygomis kaip vengras. Beveik 100\u00a0% Vengrijos nekilnojamojo turto stovi nuosavybės teise valdomoje žemėje. Užstatymo teisė, pavyzdžiui, Nyderlandų erfpacht, pasitaiko retai.',
      `Žemės ūkio paskirties žemei taikomos atskiros taisyklės. Žemės ūkio kvalifikaciją turintis ES pilietis Vengrijoje gali įsigyti iki ${AGRI_HECTARE_LIMIT} hektarų; visą šią procedūrą atliekame mes.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Ar turiu vykti į Vengriją pasirašyti?',
    answer: [
      'Ne. Vengrijoje galime jums atstovauti pagal įgaliojimą, todėl atvykti pasirašyti nereikia.',
      'Taip pat pasirūpiname įregistravimu Vengrijos registre ir komunalinių paslaugų perėmimu.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'Kokia kalba rengiama pirkimo–pardavimo sutartis?',
    answer: [
      'Užsakome dvikalbes sutartis, kad perskaitytumėte, ką pasirašote.',
      `Orientacinės kainos: vengrų kalba nuo ${price('hu')}, vokiečių–vengrų ir anglų–vengrų nuo ${price('de-hu')}, nyderlandų–vengrų nuo ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Kuo tiksliai pasirūpina FODEL, kai perkate?',
    answer: [
      '- Konsultacijos telefonu ir el. paštu bei bendravimas tarp šalių',
      '- Asmeniniai susitikimai ir apžiūros vietoje',
      '- Kolega, kalbantis jūsų kalba ir keliaujantis kartu su jumis',
      '- Pagalba derantis dėl kainos',
      '- Daugiakalbės sutarties parengimas',
      '- Viso pirkimo organizavimas',
      '- Naujojo savininko įregistravimas ir komunalinių paslaugų perėmimas',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Kodėl Vakarų Europos pirkėjai renkasi Vengriją?',
    answer: [
      '- Turto kainos ir pragyvenimo išlaidos gerokai mažesnės',
      '- Nekilnojamojo turto mokestis Vengrijoje paprastai netaikomas',
      '- Daugiau saulės ir švelnesnis klimatas',
      '- Šalis yra aukščiau jūros lygio, žemyno viduryje',
      '- Vengrija yra ES valstybė narė',
      '- Beveik visas turtas stovi nuosavybės teise valdomoje žemėje',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Ar Vengrijos turtas turi energinio naudingumo sertifikatą?',
    answer: [
      'Taip. Vengrijoje privalomas energinio naudingumo sertifikatas (energiatanúsítvány), jis turi būti nurodytas skelbime. Mūsų skelbimuose klasė rodoma prie savybių; „rengiamas“ reiškia, kad sertifikatas dar rengiamas.',
      'Jei pardavėjas pageidauja, galime užsakyti sertifikato parengimą.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Kas yra paieškos paslauga ir kiek ji kainuoja?',
    answer: [
      'Paieškos paslauga nemokama. Pasakote, ko ieškote (tipą, vietovę, biudžetą ir pageidavimus), o mes ieškome už jus, taip pat ir už šioje svetainėje skelbiamų objektų ribų.',
      'Mūsų vengriškai kalbantys kolegos padeda derėtis ir užtikrina, kad sutartis būtų teisiškai tinkamai parengta. Kai tik atsiranda kas nors tinkamo, gaunate el. laišką.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Kokias vietoves aprėpiate?',
    answer: [
      'Daugiausia dėmesio skiriame Užduonojui su Baranjos, Tolnos, Zalos, Šomodžio ir Vesprėmo medėmis, taip pat Balatono ežerui ir Balatono aukštumoms.',
      'Turime objektų ir lygumoje bei vietovėse, iš kurių patogu pasiekti Budapešto oro uostą.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Nekalbu vengriškai. Ar tai problema?',
    answer: [
      'Ne. Kiekviename skelbime nurodyta, kokiomis kalbomis kalba savininkas, todėl žinote iš anksto.',
      'Mūsų komanda kalba nyderlandų, vokiečių, anglų, prancūzų ir vengrų kalbomis ir lydi jus į apžiūrą.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Kada galiu su jumis susisiekti?',
    answer: [
      `Darbo dienomis nuo ${COMPANY.hours.weekdays.from} iki ${COMPANY.hours.weekdays.to}. Jei užsisakote perskambinimą, skambiname iki ${COMPANY.hours.callback.to}, taip pat savaitgaliais.`,
      'Perskambinimas jums nieko nekainuoja. Už skambutį mokame mes.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
