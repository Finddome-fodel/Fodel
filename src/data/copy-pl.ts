/**
 * Treść stron, polski (forma „Państwo”).
 *
 * Dla kupujących i sprzedających z Polski, napisana na podstawie tych samych
 * faktów co teksty węgierskie i niderlandzkie: liczby pochodzą z
 * src/config/company.ts, nigdy z tego pliku. Kompilator porównuje go z tekstem
 * węgierskim: brakujący klucz przerywa build.
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'pl' as const;
const pct = (n: number) => `${n}%`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
};

export const PL = {
  home: {
    meta: {
      title: 'FINDDOME Nieruchomości | Kup nieruchomość na Węgrzech bezpośrednio od właściciela',
      description:
        'Domy, gospodarstwa i dwory na Węgrzech, często bezpośrednio od właściciela. Osobista opieka i dwujęzyczne umowy kupna-sprzedaży.',
    },
    hero: {
      eyebrow: `Od 2013 roku · ${foundedInLabel(L)}`,
      title: ['Nieruchomości', 'na Węgrzech', 'bezpośrednio od właściciela'],
      emphasis: 1,
      body: 'Przy dużej części naszych nieruchomości podajemy właściciela. Mogą Państwo negocjować bezpośrednio z nim albo powierzyć nam cały proces.',
      primary: 'Zobacz nieruchomości',
      secondary: 'Bezpłatne poszukiwanie',
      featuredLabel: 'Wyróżnione',
    },
    audiences: [
      {
        eyebrow: 'Dla kupujących',
        title: 'Nieruchomości bezpośrednio\nod właściciela',
        body: 'Autentyczne węgierskie domy, gospodarstwa, dwory i winnice. Proszę skontaktować się bezpośrednio z właścicielem albo powierzyć cały proces FINDDOME.',
        cta: 'Zobacz nieruchomości',
        to: 'properties',
      },
      {
        eyebrow: 'Dla sprzedających',
        title: 'Państwa węgierska nieruchomość\nw Europie Zachodniej',
        body: `Ogłoszenie w ${REACH_LANGUAGES} językach i ${REACH_COUNTRIES} krajach, bez umowy na wyłączność. Prowizję płacą Państwo tylko wtedy, gdy to my znajdziemy kupującego.`,
        cta: 'Dowiedz się więcej',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Wybór', title: 'Wyróżnione nieruchomości' },
    quote:
      '„Holendrzy często nie wierzą własnym oczom, gdy widzą, co można kupić na Węgrzech i za jaką cenę”.',
    quoteSource: `${BRAND.pl.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Jak to działa', title: 'Jak działa FINDDOME' },
    cta: {
      eyebrow: 'Kontakt',
      title: 'Chętnie',
      titleEm: 'oddzwonimy',
      body: `{hoursShort} · Oddzwonienie jest bezpłatne.`,
    },
    referral: {
      eyebrow: 'Program poleceń',
      title: 'Polecając ogłoszeniodawcę,',
      titleEm: `zyskują Państwo ${pct(10)}`,
      body: `Jeśli ktoś z Państwa polecenia zamieści ogłoszenie w FINDDOME, otrzyma ${pct(10)} rabatu na swój pakiet, a my zaliczymy Państwu ${pct(10)} na kolejne ogłoszenie. Już się Państwo u nas ogłaszają? Kod polecający znajdą Państwo w portalu, w zakładce „Instellingen” (Ustawienia).`,
      steps: [
        'Proszę polecić znajomego przez poniższy formularz lub udostępnić swój osobisty link z portalu',
        'Nasz pracownik skontaktuje się z tą osobą',
        `Jeśli zamieści ogłoszenie, zaoszczędzi ${pct(10)}, a my zaliczymy Państwu ${pct(10)}`,
      ],
      formTitle: 'Polecić znajomego',
      fields: {
        referrerName: 'Imię i nazwisko',
        referrerEmail: 'Adres e-mail',
        referredName: 'Imię i nazwisko polecanej osoby',
        referredEmail: 'Adres e-mail polecanej osoby',
      },
      submit: 'Wyślij polecenie',
      successTitle: 'Dziękujemy za polecenie!',
      successBody:
        'Otrzymaliśmy je. Nasz pracownik skontaktuje się z poleconą osobą, a Ciebie poinformujemy e-mailem.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Ogłoszenia w ${REACH_COUNTRIES} krajach`,
      body: `Publikujemy ogłoszenia w ${REACH_LANGUAGES} językach w Holandii, Belgii, Niemczech, Anglii i innych krajach UE, bez umowy na wyłączność ze sprzedającym.`,
    },
    {
      num: '02',
      title: 'Bezpośredni kontakt',
      body: 'Wiele ogłoszeń podaje obok naszych danych kontaktowych imię i nazwisko oraz numer telefonu właściciela. Jeśli dojdą Państwo do porozumienia między sobą, nikt nie płaci prowizji.',
    },
    {
      num: '03',
      title: 'Pełna obsługa',
      body: 'Dwujęzyczna umowa kupna-sprzedaży, reprezentacja na podstawie pełnomocnictwa, wpis do księgi wieczystej oraz przepisanie umów na wodę, gaz i prąd.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Rok założenia' },
    { value: String(REACH_COUNTRIES), label: 'Kraje' },
    { value: String(REACH_LANGUAGES), label: 'Języki' },
    { value: pct(COMMISSION.percent), label: 'Prowizja' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Sprzedający | Państwa węgierska nieruchomość w Europie Zachodniej',
      description: `Ogłoszenie Państwa węgierskiej nieruchomości w ${REACH_LANGUAGES} językach i ${REACH_COUNTRIES} krajach, od ${eur(69, L)} i bez wyłączności. Prowizja tylko wtedy, gdy kupującego znajdzie FINDDOME: ${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} niderlandzkiego VAT.`,
    },
    hero: {
      eyebrow: 'Dla sprzedających',
      title: 'Państwa nieruchomość',
      titleEm: 'w Europie Zachodniej',
      body: `W modelu FINDDOME Państwa nieruchomość ukazuje się w ${REACH_LANGUAGES} językach i ${REACH_COUNTRIES} krajach, bez umowy na wyłączność. Współpracujemy wyłącznie z poważnymi kupującymi.`,
      cta: 'Dodaj ogłoszenie',
      secondary: 'Zobacz cennik',
    },
    benefits: {
      eyebrow: 'Korzyści',
      title: 'Co daje kupujący z zagranicy',
      points: [
        'Kupujący płacą ze środków własnych: bez czekania na kredyt czy dotację.',
        'Płatność jednorazowa przelewem bankowym, szybko i bezpiecznie.',
        `Rzeczywisty zamiar zakupu: oględziny kosztują ich dwa dni i od ${eur(200, L)} do ${eur(300, L)}.`,
        'Realistyczne ceny: bez przesadnego targowania się.',
        'FINDDOME osobiście weryfikuje każdego kupującego przed umówieniem spotkania.',
      ],
    },
    personas: {
      eyebrow: 'Kupujący',
      title: 'Kto kupuje przez FINDDOME',
      items: [
        {
          title: 'Emeryci',
          body: 'Szukają niższych kosztów utrzymania, korzyści podatkowych i przystępnej opieki zdrowotnej na Węgrzech.',
        },
        {
          title: 'Rodziny',
          body: 'Szukają przestrzeni, przyrody i życia na wsi. Często gospodarstwa, zagrody lub domu wakacyjnego.',
        },
        {
          title: 'Inwestorzy',
          body: 'Szukają lokali użytkowych, winnic i gruntów rolnych.',
        },
        {
          title: 'Ekspaci szukający innego stylu życia',
          body: 'Uciekają od wysokich kosztów mieszkaniowych i pośpiechu, szukając autentycznego europejskiego stylu życia.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Krok po kroku', title: 'Model FINDDOME' },
    commission: {
      eyebrow: 'Cennik',
      title: 'Prowizja wyłącznie\npo sfinalizowanej sprzedaży',
      body: `Jeśli kupujący skontaktuje się z Państwem bezpośrednio i nie potrzebują Państwo naszej pomocy, płacą Państwo jedynie opłatę za ogłoszenie. Jeśli FINDDOME pośredniczy w sprzedaży: ${pct(COMMISSION.percent)} netto (min. ${eur(COMMISSION.minimumEur, L)}) + ${pct(COMMISSION.vatPercent)} niderlandzkiego VAT.`,
      cta: 'Zobacz cennik',
    },
  },

  buyers: {
    meta: {
      title: 'Kupujący | Kup nieruchomość na Węgrzech',
      description:
        'Bezpieczny zakup nieruchomości na Węgrzech: dwujęzyczna umowa, reprezentacja na podstawie pełnomocnictwa, wpis do księgi wieczystej. Do tego bezpłatna usługa poszukiwania.',
    },
    hero: {
      eyebrow: 'Dla kupujących',
      title: 'Zakup na Węgrzech',
      titleEm: 'bez przykrych niespodzianek',
      body: 'Przy wielu naszych nieruchomościach podajemy właściciela. Mogą Państwo negocjować bezpośrednio albo powierzyć nam cały proces.',
      cta: 'Zobacz nieruchomości',
      secondary: 'Bezpłatne poszukiwanie',
    },
    services: {
      eyebrow: 'Czym się zajmujemy',
      title: 'Kompleksowa opieka',
      points: [
        'Komunikacja między Państwem a sprzedającym, łącznie z tłumaczami.',
        'Oględziny w towarzystwie naszego pracownika.',
        'Pomoc w negocjacjach cenowych i przy sporządzaniu dwujęzycznej umowy.',
        'Reprezentacja na podstawie pełnomocnictwa: nie muszą Państwo przyjeżdżać na Węgry, aby podpisać umowę.',
        'Wpis do księgi wieczystej oraz przepisanie umów na wodę, gaz i prąd.',
      ],
    },
    reasons: {
      eyebrow: 'Dlaczego Węgry',
      title: 'Czego szukają kupujący z Europy Zachodniej',
    },
  },

  about: {
    meta: {
      title: 'O nas | Most między dwoma światami',
      description:
        'Od 2013 roku łączymy węgierskich sprzedających z kupującymi z Europy Zachodniej. Dyskretnie, przejrzyście i bez umowy na wyłączność.',
    },
    hero: {
      eyebrow: 'O nas',
      title: 'Most między',
      titleEm: 'dwoma światami',
      body: 'Od 2013 roku pomagamy węgierskim sprzedającym znaleźć odpowiedniego kupującego z zagranicy: dyskretnie, skutecznie i bez umowy na wyłączność.',
    },
    origin: {
      eyebrow: 'Początki · Almere-Buiten, 2013',
      quote:
        '„Mieszkając w Almere-Buiten, widzieliśmy, jak bardzo Holendrzy tęsknią za autentycznym europejskim stylem życia, podczas gdy na Węgrzech najpiękniejsze nieruchomości czekają na właściciela, niezauważone przez nikogo”.',
    },
    values: {
      eyebrow: 'Nasze zasady',
      title: 'Na czym się opieramy',
      items: [
        {
          num: '01',
          title: 'Dyskrecja',
          body: 'Dane sprzedających i kupujących traktujemy z najwyższą starannością. Dane osobowe publikujemy wyłącznie za zgodą.',
        },
        {
          num: '02',
          title: 'Przejrzystość',
          body: 'Bez ukrytych kosztów. Nasz cennik i prowizja są opublikowane na tej stronie, a o każdym kroku informujemy Państwa na bieżąco.',
        },
        {
          num: '03',
          title: 'Dwujęzyczność',
          body: 'Znamy oba rynki od podszewki. Nasz zespół mówi po niderlandzku, niemiecku, angielsku, francusku i węgiersku.',
        },
      ],
    },
    approach: {
      eyebrow: 'Nasze podejście',
      title: 'Nie jesteśmy wielkim biurem.',
      titleEm: 'To nasza siła.',
      points: [
        'Każdy klient ma swojego opiekuna: bez call center i bez anonimowego okienka.',
        'Znamy obie kultury od środka i oceniamy nieruchomość zarówno okiem Holendra, jak i Węgra.',
        'Połączenie nieruchomości z kupującym to nasza odpowiedzialność, a nie kwestia przypadku.',
        'Pracujemy bez wyłączności, bo wolimy przekonywać wynikami.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Most, który',
      titleEm: 'zbudowaliśmy',
      paragraphs: [
        'FINDDOME założyli Węgrzy mieszkający w Holandii. Zaczęliśmy w 2013 roku w Almere-Buiten, gdzie zauważyliśmy, że wielu Holendrów i Belgów chce kupić autentyczny węgierski dom, ale nie wie, od czego zacząć.',
        `Dziś publikujemy ogłoszenia w ${REACH_COUNTRIES} krajach i ${REACH_LANGUAGES} językach i prowadzimy każdą transakcję od początku do końca: dwujęzyczna umowa kupna-sprzedaży, reprezentacja na podstawie pełnomocnictwa i wpis do księgi wieczystej. Nasze biuro mieści się w Hadze.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Chętnie oddzwonimy',
      description: `Prosimy dzwonić w dni robocze od ${hour(COMPANY.hours.weekdays.from)} do ${hour(COMPANY.hours.weekdays.to)} lub poprosić o oddzwonienie. Rozmowa nic Państwa nie kosztuje.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Chętnie', titleEm: 'oddzwonimy' },
    formTitle: 'Poproś o oddzwonienie',
    submit: 'Poproś o oddzwonienie',
    subjects: [
      'Pytanie o nieruchomość',
      'Zamieszczenie ogłoszenia',
      'Zapytanie o cennik',
      'Prośba o oddzwonienie',
      'Inne',
    ],
    note: `Oddzwonienie nic Państwa nie kosztuje: koszt rozmowy pokrywamy my. Oddzwaniamy do godz. ${hour(COMPANY.hours.callback.to)}, także w weekendy.`,
  },
} satisfies CopyShape;
