/**
 * Najczęstsze pytania, polski (forma „Państwo”). Dla kupujących, na wzór
 * wersji niderlandzkiej: wszystkie liczby pochodzą z src/config/company.ts,
 * nic nie jest tu dodane.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';

const L = 'pl' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);
const pct = (n: number) => `${n}%`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
};

export const FAQ_PL = [
  {
    id: 'bezposrednio-od-wlasciciela',
    question: 'Co oznacza „bezpośrednio od właściciela”?',
    answer: [
      'Przy dużej części naszych nieruchomości obok własnych danych kontaktowych podajemy imię i nazwisko oraz numer telefonu właściciela. Mogą więc Państwo skontaktować się bezpośrednio ze sprzedającym.',
      'Jeśli skontaktują się Państwo z nim bezpośrednio i sami przeprowadzą zakup, nikt nie płaci prowizji – ani Państwo, ani sprzedający. Wtedy otrzymujemy wynagrodzenie wyłącznie za ogłoszenie.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'prowizja',
    question: 'Ile kosztuje Państwa pośrednictwo?',
    answer: [
      `Nasza prowizja wynosi ${pct(COMMISSION.percent)} netto, co najmniej ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} niderlandzkiego VAT. Płaci ją węgierski sprzedający, a nie Państwo.`,
      'Naliczamy ją tylko wtedy, gdy spełnione są trzy warunki: istnieje pisemna umowa kupna-sprzedaży, kupującego pozyskał FINDDOME i wpłacono zadatek.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'zakup-jako-obywatel-ue',
    question: 'Czy jako obywatel UE mogę kupić nieruchomość na Węgrzech?',
    answer: [
      'Tak. Jako obywatel UE kupują Państwo domy i działki na Węgrzech na niemal takich samych warunkach jak Węgrzy. Prawie 100% węgierskich nieruchomości stoi na gruncie stanowiącym pełną własność. Długoterminowe prawa do gruntu, takie jak niderlandzki erfpacht, należą tam do rzadkości.',
      `Szczególne zasady dotyczą gruntów rolnych. Obywatel UE z kwalifikacjami rolniczymi może nabyć na Węgrzech do ${nOf('pl', AGRI_HECTARE_LIMIT, 'hektara', 'hektarów')}; całą procedurę bierzemy na siebie.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'czy-trzeba-przyjechac',
    question: 'Czy muszę przyjechać na Węgry, aby podpisać umowę?',
    answer: [
      'Nie. Możemy reprezentować Państwa na Węgrzech na podstawie pełnomocnictwa, więc nie muszą Państwo przyjeżdżać na podpisanie umowy.',
      'Zajmujemy się też wpisem do węgierskiej księgi wieczystej oraz przepisaniem umów na wodę, gaz i prąd.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'umowa-dwujezyczna',
    question: 'W jakim języku sporządzana jest umowa kupna-sprzedaży?',
    answer: [
      'Zlecamy sporządzenie dwujęzycznych umów kupna-sprzedaży, aby rozumieli Państwo, co podpisują.',
      `Ceny orientacyjne: po węgiersku od ${price('hu')}, niemiecko-węgierska i angielsko-węgierska od ${price('de-hu')}, niderlandzko-węgierska od ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'czym-zajmuje-sie-fodel',
    question: 'Czym zajmuje się FINDDOME przy zakupie?',
    answer: [
      '- Kontakt telefoniczny i mailowy oraz komunikacja między obiema stronami',
      '- Osobiste spotkania i oględziny na miejscu',
      '- Nasz pracownik, który towarzyszy Państwu na miejscu',
      '- Wsparcie w negocjacjach cenowych',
      '- Przygotowanie wielojęzycznej umowy',
      '- Wszystkie formalności związane z zakupem',
      '- Wpis nowego właściciela oraz przepisanie umów na wodę, gaz i prąd',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'dlaczego-wegry',
    question: 'Dlaczego kupujący z Europy Zachodniej wybierają Węgry?',
    answer: [
      '- Nieruchomości i koszty życia są wyraźnie niższe',
      '- Węgry zwykle nie pobierają podatku od nieruchomości',
      '- Więcej słońca i przyjemniejszy klimat',
      '- Kraj leży powyżej poziomu morza, w środku kontynentu',
      '- Węgry są państwem członkowskim UE',
      '- Niemal wszystkie nieruchomości stoją na gruncie stanowiącym pełną własność',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'swiadectwo-energetyczne',
    question: 'Czy węgierska nieruchomość ma świadectwo energetyczne?',
    answer: [
      'Tak. Na Węgrzech obowiązuje świadectwo charakterystyki energetycznej (energiatanúsítvány), które musi być podane w ogłoszeniu. W naszych ogłoszeniach klasa energetyczna widnieje wśród cech nieruchomości; „W przygotowaniu” oznacza, że świadectwo jest jeszcze sporządzane.',
      'Na życzenie sprzedającego możemy zlecić sporządzenie świadectwa.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'usluga-poszukiwania',
    question: 'Czym jest usługa poszukiwania nieruchomości i ile kosztuje?',
    answer: [
      'Usługa poszukiwania jest bezpłatna. Mówią nam Państwo, czego szukają (rodzaj nieruchomości, region, budżet i oczekiwania), a my szukamy za Państwa – także poza nieruchomościami prezentowanymi na tej stronie.',
      'Nasi węgierskojęzyczni współpracownicy pomagają w negocjacjach i dbają o prawidłowe sporządzenie umowy. Gdy pojawi się odpowiednia nieruchomość, otrzymają Państwo e-mail.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'jakie-regiony',
    question: 'W jakich regionach oferują Państwo nieruchomości?',
    answer: [
      'Działamy przede wszystkim w Zadunaju, w komitatach Baranya, Tolna, Zala, Somogy i Veszprém, a także wokół Balatonu i na Wyżynie Balatońskiej.',
      'Mamy też nieruchomości na Wielkiej Nizinie Węgierskiej i w okolicach dobrze skomunikowanych z lotniskiem w Budapeszcie.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bariera-jezykowa',
    question: 'Nie mówię po węgiersku. Czy to problem?',
    answer: [
      'Nie. W każdym ogłoszeniu podajemy, jakimi językami posługuje się właściciel, więc wiedzą to Państwo z góry.',
      'Nasz zespół mówi po niderlandzku, niemiecku, angielsku, francusku i węgiersku i towarzyszy Państwu podczas oględzin.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'kiedy-mozna-sie-z-nami-skontaktowac',
    question: 'Kiedy można się z Państwem skontaktować?',
    answer: [
      `W dni robocze od ${hour(COMPANY.hours.weekdays.from)} do ${hour(COMPANY.hours.weekdays.to)}. Jeśli poproszą Państwo o oddzwonienie, oddzwaniamy do godz. ${hour(COMPANY.hours.callback.to)}, także w weekendy.`,
      'Oddzwonienie nic Państwa nie kosztuje: koszt rozmowy pokrywamy my.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
