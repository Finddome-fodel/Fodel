/**
 * Strony szczegółowe, polski (forma „Państwo”): usługi, nieruchomości rolne,
 * poradnik zakupu, przeprowadzka na Węgry, poradnik fotograficzny. Liczby
 * pochodzą z src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';
import type { ContentKey } from '~/data/pages-content';

const L = 'pl' as const;
const pct = (n: number) => `${n}%`;
const des = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `od ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;
/** "do 300 hektarów": the preposition takes the genitive. */
const ha = nOf(L, AGRI_HECTARE_LIMIT, 'hektara', 'hektarów');

export const CONTENT_PL = {
  services: {
    metaTitle: 'Usługi: formalności, umowa, fotografia',
    metaDescription: `Dwujęzyczna umowa kupna-sprzedaży ${des('hu')}, reprezentacja na podstawie pełnomocnictwa, wpis do księgi wieczystej, świadectwo charakterystyki energetycznej, fotografia nieruchomości i zdjęcia z drona.`,
    eyebrow: 'Usługi',
    title: 'Co robimy poza',
    titleEm: 'ogłoszeniem',
    intro:
      'Ogłoszenie to dopiero pierwszy krok. Dzięki poniższym usługom zdejmujemy z Państwa cały proces kupna-sprzedaży, zgodnie z zasadami obu krajów.',
    sections: [
      {
        type: 'steps',
        title: 'Przebieg sprzedaży',
        items: [
          { n: '01', t: 'Kontakt', b: 'Rozmowy telefoniczne i e-mailowe oraz komunikacja z obiema stronami, łącznie z tłumaczami.' },
          { n: '02', t: 'Weryfikacja kupującego', b: 'Sprawdzamy historię, zamiar zakupu i wypłacalność.' },
          { n: '03', t: 'Oględziny', b: 'Umawiamy terminy, a nasz pracownik towarzyszy Państwu na miejscu.' },
          { n: '04', t: 'Negocjacje', b: 'Wsparcie w obu językach, w realistycznym przedziale cenowym.' },
          { n: '05', t: 'Umowa', b: 'Dwujęzyczna umowa kupna-sprzedaży, sporządzona z udziałem prawnika.' },
          { n: '06', t: 'Finalizacja', b: 'Księga wieczysta, umowy na wodę, gaz i prąd oraz, w razie potrzeby, reprezentacja na podstawie pełnomocnictwa.' },
        ],
      },
      {
        type: 'table',
        title: 'Dwujęzyczna umowa kupna-sprzedaży',
        intro: 'Ceny orientacyjne według kombinacji języków. Ostateczna cena zależy od objętości umowy.',
        rows: [
          ['Węgierski', des('hu')],
          ['Niemiecki–węgierski', des('de-hu')],
          ['Angielski–węgierski', des('en-hu')],
          ['Niderlandzki–węgierski', des('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Usługi dodatkowe',
        intro: 'Na te usługi przygotowujemy indywidualną wycenę:',
        items: [
          'Uzyskanie świadectwa charakterystyki energetycznej: zgodnie z przepisami UE obowiązkowego w ogłoszeniu',
          'Profesjonalna fotografia nieruchomości',
          'Zdjęcia z drona: szczególnie skuteczne przy dużych działkach i ładnych widokach',
          `Film do ogłoszenia (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Reprezentacja na podstawie pełnomocnictwa',
        body: 'Nie muszą Państwo przyjeżdżać na Węgry, aby podpisać umowę: na podstawie pełnomocnictwa reprezentujemy Państwa przy podpisaniu, w księdze wieczystej i przy przepisaniu umów na wodę, gaz i prąd.',
      },
      {
        type: 'prose',
        title: 'Kiedy należy się prowizja',
        paragraphs: [
          `Prowizję naliczamy tylko wtedy, gdy kupującego pozyskał FINDDOME, istnieje pisemna umowa kupna-sprzedaży i wpłacono zadatek. Stawka wynosi ${pct(COMMISSION.percent)} netto, co najmniej ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} niderlandzkiego VAT. Płaci ją sprzedający, nie kupujący.`,
        ],
      },
      {
        type: 'cta',
        title: 'Pytania dotyczące procedury',
        body: '{hours} Prosimy poprosić o bezpłatne oddzwonienie lub napisać do nas.',
        primary: { label: 'Kontakt', to: 'contact' },
        secondary: { label: 'Częste pytania', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Nieruchomości rolne: do ${ha} na Węgrzech`,
    metaDescription: `Obywatel UE z kwalifikacjami rolniczymi może nabyć na Węgrzech do ${ha} ziemi. FINDDOME przeprowadza całą procedurę.`,
    eyebrow: 'Nieruchomości rolne',
    title: 'Grunty rolne i',
    titleEm: 'majątki ziemskie',
    intro:
      'Węgierski rynek ziemi rządzi się własnymi prawami. Kto zna warunki, ten ma dostęp do winnic, gruntów ornych, gospodarstw i lasów.',
    sections: [
      {
        type: 'prose',
        title: `Limit ${nOf(L, AGRI_HECTARE_LIMIT, 'hektara', 'hektarów')}`,
        paragraphs: [
          `Obywatel UE z kwalifikacjami rolniczymi może nabyć na Węgrzech łącznie ${nOf(L, AGRI_HECTARE_LIMIT, 'hektar', 'hektary', 'hektarów')} ziemi. Całą procedurę bierzemy na siebie.`,
          'Procedura obejmuje kilka etapów przed urzędami i zaczyna się od uznania Państwa kwalifikacji. Nasz zespół towarzyszy Państwu przez cały proces i przygotowuje niezbędne dokumenty w obu językach.',
        ],
      },
      {
        type: 'list',
        title: 'Co kupują nasi klienci',
        items: [
          'Winnice, z czynną winiarnią lub bez niej',
          'Grunty orne kwalifikujące się do dopłat unijnych',
          'Gospodarstwa z budynkami gospodarczymi, odpowiednie do hodowli zwierząt',
          'Lasy i majątki o mieszanym przeznaczeniu',
          'Duże, zwarte działki jako inwestycja',
        ],
      },
      {
        type: 'steps',
        title: 'Przebieg',
        items: [
          { n: '01', t: 'Rozmowa', b: 'Omawiamy Państwa plany i dostępny budżet.' },
          { n: '02', t: 'Uznanie kwalifikacji', b: 'Zajmujemy się uznaniem Państwa kwalifikacji rolniczych na Węgrzech.' },
          { n: '03', t: 'Poszukiwanie', b: 'Wraz z partnerami szukamy gruntów spełniających warunki.' },
          { n: '04', t: 'Zezwolenia', b: 'Wniosek o zezwolenia wymagane do nabycia ziemi.' },
          { n: '05', t: 'Zakup', b: 'Dwujęzyczna umowa, wpis do księgi wieczystej, przeniesienie wniosków o dopłaty.' },
        ],
      },
      {
        type: 'callout',
        title: 'Ważne',
        body: 'Zasady nabywania gruntów rolnych co jakiś czas się zmieniają i zależą od Państwa indywidualnej sytuacji. Informacje podane tutaj mają charakter wyłącznie poglądowy. Przy konkretnym projekcie prosimy zawsze skonsultować się z naszym zespołem i wyspecjalizowanym prawnikiem.',
      },
      {
        type: 'cta',
        title: 'Szukają Państwo nieruchomości rolnej',
        body: 'Prosimy przekazać nam swoje oczekiwania; szukamy także poza ogłoszonymi nieruchomościami.',
        primary: { label: 'Bezpłatne poszukiwanie', to: 'searchRequest' },
        secondary: { label: 'Nasze nieruchomości', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Kupno na Węgrzech: procedura krok po kroku',
    metaDescription:
      'Jak przebiega zakup nieruchomości na Węgrzech dla kupującego z zagranicy: umowa, zadatek, księga wieczysta, umowy na wodę, gaz i prąd oraz koszty, z którymi trzeba się liczyć.',
    eyebrow: 'Dla kupujących',
    title: 'Kupno na',
    titleEm: 'Węgrzech',
    intro:
      'Węgierska procedura zakupu jest w pełni przewidywalna, gdy zna się jej etapy. Ten poradnik przeprowadzi Państwa przez każdy z nich.',
    sections: [
      {
        type: 'steps',
        title: 'Przebieg',
        items: [
          { n: '01', t: 'Wybór', b: 'Wybierają Państwo spośród naszych nieruchomości lub składają bezpłatne zlecenie poszukiwania.' },
          { n: '02', t: 'Oględziny', b: 'Organizujemy podróż i oględziny z udziałem tłumacza.' },
          { n: '03', t: 'Oferta', b: 'Pomagamy złożyć realistyczną ofertę i negocjować.' },
          { n: '04', t: 'Umowa i zadatek', b: `Dwujęzyczna umowa kupna-sprzedaży, zwykle z zadatkiem w wysokości ${pct(10)}.` },
          { n: '05', t: 'Cena zakupu', b: 'Pozostała część ceny przelewem bankowym, zgodnie z umową.' },
          { n: '06', t: 'Przekazanie kluczy', b: 'Wpis do księgi wieczystej, umowy na media, przekazanie kluczy.' },
        ],
      },
      {
        type: 'list',
        title: 'Koszty poza ceną zakupu',
        items: [
          'Podatek od nabycia nieruchomości: stawka zależy od rodzaju nieruchomości i Państwa sytuacji',
          'Honorarium prawnika za sporządzenie i kontrasygnatę umowy',
          `Tłumaczenie dwujęzycznej umowy: ${des('hu')}, zależnie od kombinacji języków`,
          'Opłaty za wpis do księgi wieczystej',
          'Ewentualna prowizja FINDDOME: płaci ją sprzedający, nie Państwo',
        ],
      },
      {
        type: 'prose',
        title: 'Nie muszą Państwo być na miejscu',
        paragraphs: [
          'Na podstawie pełnomocnictwa reprezentujemy Państwa przy podpisaniu umowy, w księdze wieczystej i przy przepisaniu umów na wodę, gaz i prąd. Zakup może więc dojść do skutku, nawet jeśli nie mogą lub nie chcą Państwo podróżować.',
        ],
      },
      {
        type: 'callout',
        title: 'Świadectwo charakterystyki energetycznej',
        body: 'Na Węgrzech obowiązuje świadectwo charakterystyki energetycznej, które zgodnie z przepisami UE musi być też podane w ogłoszeniu. W naszych ogłoszeniach klasę znajdą Państwo wśród cech nieruchomości; „W przygotowaniu” oznacza, że świadectwo jest jeszcze sporządzane.',
      },
      {
        type: 'cta',
        title: 'Zaczynajmy',
        body: 'Prosimy przejrzeć nasze nieruchomości lub powiedzieć nam, czego Państwo szukają. To nic nie kosztuje.',
        primary: { label: 'Nasze nieruchomości', to: 'properties' },
        secondary: { label: 'Bezpłatne poszukiwanie', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Przeprowadzka na Węgry: dlaczego Holendrzy się decydują',
    metaDescription:
      'Cztery powody, dla których Holendrzy i Belgowie przeprowadzają się na Węgry: stosunek jakości do ceny, przestrzeń, niższe koszty życia i położenie geograficzne.',
    eyebrow: 'Tło',
    title: 'Przeprowadzka na',
    titleEm: 'Węgry',
    intro:
      'Wielu Holendrów i Belgów wybiera Węgry. W setkach rozmów z naszymi klientami wciąż powtarzają się te same cztery powody.',
    sections: [
      {
        type: 'prose',
        title: 'Stosunek jakości do ceny',
        paragraphs: [
          `Wiejskie nieruchomości na Węgrzech należą do najkorzystniejszych w Europie pod względem stosunku jakości do ceny. W Holandii działka budowlana o powierzchni 125 m² kosztuje nawet ${eur(88000, L)}, a garaż około ${eur(100000, L)}. Za tę samą kwotę na węgierskiej wsi kupią Państwo przestronny dom rodzinny, często z dużą działką.`,
        ],
      },
      {
        type: 'prose',
        title: 'Przestrzeń',
        paragraphs: [
          'W Holandii na km² przypada 482 mieszkańców przy około 17 milionach ludności, a znaczną część kraju stanowi woda. Brak przestrzeni nie jest tam problemem abstrakcyjnym, lecz codziennym doświadczeniem, i to właśnie ten powód pada najczęściej.',
        ],
      },
      {
        type: 'prose',
        title: 'Koszty życia',
        paragraphs: [
          'Wielu naszych kupujących to emeryci lub osoby tuż przed emeryturą. Niższe koszty życia, brak podatku od nieruchomości i przystępna opieka zdrowotna dają im łącznie poziom życia, na jaki ta sama emerytura nie pozwoliłaby w Holandii.',
        ],
      },
      {
        type: 'prose',
        title: 'Położenie geograficzne',
        paragraphs: [
          'Od powodzi w 1953 roku Holandia zbudowała ogromny system ochrony przed wodą. Obawa przed podnoszeniem się poziomu morza wpływa na wiele decyzji: Węgry leżą w samym sercu kontynentu, powyżej poziomu morza.',
        ],
      },
      {
        type: 'cta',
        title: 'Zachęcamy do odkrywania',
        body: 'Prosimy przejrzeć nasze nieruchomości albo pozwolić nam poszukać tego, co mają Państwo na myśli.',
        primary: { label: 'Nasze nieruchomości', to: 'properties' },
        secondary: { label: 'Kupno na Węgrzech', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Poradnik fotograficzny dla ogłoszeniodawców',
    metaDescription:
      'Dobre zdjęcia to najlepszy sposób na szybką sprzedaż. Poradnik fotograficzny FINDDOME: światło, kadrowanie, rozdzielczość i najczęstsze błędy.',
    eyebrow: 'Dla sprzedających',
    title: 'Poradnik',
    titleEm: 'fotograficzny',
    intro:
      'Kupujący z zagranicy najpierw oglądają zdjęcia, często wyłącznie zdjęcia. Te zasady zdziałają więcej niż jakikolwiek tekst ogłoszenia.',
    sections: photoGuideSections(L, {
      topTitle: 'Sześć najważniejszych zasad',
      calloutTitle: 'Wolą Państwo zlecić to fachowcowi?',
      calloutBody: (lines) =>
        `Warto skorzystać z usług profesjonalisty. Można to wybrać jednym kliknięciem podczas dodawania ogłoszenia: ${lines.join('; ')}. Obie opcje są dobrowolne; nasz pracownik skontaktuje się z Państwem, aby umówić termin.`,
      ctaTitle: 'Gotowi do publikacji ogłoszenia?',
      primary: 'Dodaj ogłoszenie',
      secondary: 'Cennik',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
