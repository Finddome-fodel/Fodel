/**
 * Strony prawne, polski (forma „Państwo”). Wierne tłumaczenie stron
 * niderlandzkich (src/data/pages-legal.ts): te same sekcje, te same liczby,
 * ten sam sens.
 *
 * ⚠️ Tłumaczenie grzecznościowe. Przed uruchomieniem musi je zatwierdzić klient
 * wraz z prawnikiem, podobnie jak oryginały węgierskie i niderlandzkie. Zdania
 * oparte na prawie niderlandzkim lub węgierskim (role RODO, niderlandzki VAT,
 * niderlandzki organ nadzorczy, prawo odstąpienia, platforma ODR) są
 * wymienione w Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';
import type { LegalKey } from '~/data/pages-legal';

const L = 'pl' as const;
const pct = (n: number) => `${n}%`;
const months = (n: number) => nOf(L, n, 'miesiąc', 'miesiące', 'miesięcy');
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 lipca 2026';
const notice =
  'Niniejsza wersja jest tłumaczeniem udostępnionym dla wygody. W razie rozbieżności rozstrzyga oryginał niderlandzki (w sprawach podlegających prawu niderlandzkiemu) lub węgierski.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_PL = {
  imprint: {
    metaTitle: 'Nota prawna: dane firmy',
    metaDescription: `Dane firmy ${COMPANY.names.legal}: siedziba, numer VAT, numer KvK i dane kontaktowe.`,
    eyebrow: 'Nota prawna',
    title: 'Dane',
    titleEm: 'firmy',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Informacje o usługodawcy',
        rows: [
          ['Nazwa firmy', COMPANY.names.legal],
          ['Siedziba', addressLine(COMPANY.address, L)],
          ['Numer VAT', COMPANY.registration.vat],
          ['Numer KvK (niderlandzki rejestr handlowy)', kvk],
          ['Przedstawiciel', COMPANY.principal],
          ['E-mail', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Rok założenia', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Rachunki bankowe',
        rows: [
          ['Holandia', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Węgry', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Spory',
        body: 'W przypadku sporu konsumenckiego mogą Państwo skorzystać również z europejskiej platformy internetowego rozstrzygania sporów: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Polityka prywatności',
    metaDescription:
      'Jak FODEL przetwarza Państwa dane osobowe: jakie dane przetwarzamy, jak długo je przechowujemy i jakie prawa przysługują Państwu na mocy RODO.',
    eyebrow: 'Prywatność',
    title: 'Polityka',
    titleEm: 'prywatności',
    intro:
      'Niniejsza polityka opisuje, jak przetwarzamy dane osobowe, które przekazują nam Państwo za pośrednictwem tej strony, zgodnie z RODO.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Administrator danych',
        rows: [
          ['Administrator', COMPANY.names.legal],
          ['Adres', addressLine(COMPANY.address, L)],
          ['E-mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Jakie dane przetwarzamy',
        intro: 'Wyłącznie dane, które sami Państwo wpisują w nasze formularze:',
        items: [
          'Imię i nazwisko, adres e-mail i numer telefonu: abyśmy mogli odpowiedzieć na Państwa zapytanie',
          'Temat i treść Państwa wiadomości',
          'Przy ogłoszeniu: dane nieruchomości i Państwa dane do faktury',
          'Przy zleceniu poszukiwania: Państwa kryteria wyszukiwania',
          'Na potrzeby wewnętrznej administracji: kiedy i jaki formularz Państwo wypełnili oraz kiedy zalogowali się Państwo do portalu, bez zapisywania adresu IP',
        ],
      },
      {
        type: 'table',
        title: 'Podstawa prawna i okres przechowywania',
        rows: [
          ['Kontakt i prośba o oddzwonienie', 'Zgoda (art. 6 ust. 1 lit. a RODO): 12 miesięcy'],
          ['Zamówienie ogłoszenia', 'Wykonanie umowy (art. 6 ust. 1 lit. b): 7 lat, ustawowy okres przechowywania dokumentacji podatkowej'],
          ['Zlecenie poszukiwania', 'Zgoda: do zakończenia, maksymalnie 24 miesiące'],
          ['Wewnętrzny dziennik aktywności', 'Prawnie uzasadniony interes (art. 6 ust. 1 lit. f): prawidłowa administracja i wykrywanie nadużyć: maksymalnie 24 miesiące'],
        ],
      },
      {
        type: 'list',
        title: 'Komu udostępniamy dane',
        intro: 'Nie sprzedajemy Państwa danych i nie udostępniamy ich w celach marketingowych. Nasze podmioty przetwarzające to:',
        items: [
          'Nasz dostawca poczty e-mail, z przetwarzaniem na terenie UE',
          'Dostawca hostingu tej strony',
          'W przypadku zakupu i wyłącznie na Państwa prośbę: druga strona transakcji i właściwy prawnik',
        ],
      },
      {
        type: 'callout',
        title: 'Ogłoszenia',
        body: 'Jako ogłoszeniodawca mogą Państwo zezwolić nam na wyświetlanie przy ogłoszeniu swojego imienia i nazwiska oraz numeru telefonu, aby zainteresowani mogli kontaktować się z Państwem bezpośrednio. Zgodę tę można w każdej chwili wycofać; wówczas usuwamy te dane z ogłoszenia.',
      },
      // PROJEKT: czeka na weryfikację prawną (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Newsletter',
        body: 'Jeśli zapiszą się Państwo do naszego newslettera, przetwarzamy Państwa adres e-mail, wybrany język oraz czas zapisu i potwierdzenia, wyłącznie w celu wysyłki newslettera i na podstawie Państwa zgody. Zapis przebiega w dwóch krokach: niczego nie wysyłamy, dopóki nie klikną Państwo przycisku w e-mailu potwierdzającym. W każdym e-mailu mogą Państwo wypisać się jednym kliknięciem, a my natychmiast wstrzymujemy wysyłkę. Do wysyłki korzystamy z usługi Resend.',
      },
      {
        type: 'list',
        title: 'Państwa prawa',
        items: [
          'Dostęp do danych, które o Państwu przetwarzamy',
          'Sprostowanie i usunięcie danych',
          'Ograniczenie przetwarzania lub sprzeciw wobec niego',
          'Przenoszenie danych',
          'Wycofanie zgody w dowolnym momencie',
          'Wniesienie skargi do niderlandzkiego organu ochrony danych (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt w sprawach prywatności',
        paragraphs: [`Pytania i wnioski prosimy kierować na adres ${COMPANY.email.primary}. Odpowiadamy najpóźniej w ciągu 30 dni.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Polityka cookies',
    metaDescription: `Pliki cookie, z których korzysta ${SITE_HOST}, i sposób zmiany Państwa wyboru.`,
    eyebrow: 'Cookies',
    title: 'Polityka',
    titleEm: 'cookies',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Na razie ta strona korzysta wyłącznie z technicznie niezbędnego przechowywania danych. Nie uruchamiamy skryptów reklamowych ani śledzących i niczego nie udostępniamy serwisom społecznościowym.',
        ],
      },
      {
        type: 'table',
        title: 'Co zapisujemy',
        rows: [
          [
            'fodel:consent',
            'Państwa wybór dotyczący plików cookie (zaakceptowane lub odrzucone). Przechowywany w Państwa przeglądarce, nie trafia do nas. Okres przechowywania: 12 miesięcy.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statystyki',
        paragraphs: [
          'Jeśli kiedyś zaczniemy mierzyć ruch na stronie, włączymy to wyłącznie za Państwa uprzednią, wyraźną zgodą. Odmowa w żaden sposób nie ogranicza korzystania ze strony.',
        ],
      },
      {
        type: 'prose',
        title: 'Zmiana wyboru',
        paragraphs: [
          'Wybór można zmienić w dowolnym momencie, usuwając dane zapisane przez przeglądarkę dla tej strony; baner cookies pojawi się wtedy ponownie.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Regulamin',
    metaDescription:
      'Warunki usługi ogłoszeniowej i pośrednictwa FODEL: cennik, prowizja, odstąpienie od umowy i odpowiedzialność.',
    eyebrow: 'Warunki',
    title: 'Ogólne warunki',
    titleEm: 'świadczenia usług',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Uwaga',
        body: 'Ta strona jest streszczeniem. Pełne i wiążące warunki są dostępne w formacie PDF; w razie rozbieżności rozstrzyga PDF.',
      },
      {
        type: 'prose',
        title: '1. Usługa',
        paragraphs: [
          'FODEL publikuje ogłoszenia węgierskich nieruchomości na własnych wielojęzycznych stronach internetowych i na podstawie odrębnej umowy uczestniczy w przeprowadzeniu sprzedaży.',
          'Usługa ogłoszeniowa nie ma charakteru wyłącznego: sprzedający może oferować i sprzedawać nieruchomość również innymi kanałami.',
        ],
      },
      {
        type: 'list',
        title: '2. Zamieszczenie ogłoszenia',
        ordered: true,
        items: [
          'Sprzedający wypełnia formularz rejestracyjny.',
          'FODEL wysyła wezwanie do zapłaty za wybrany pakiet.',
          'Sprzedający płaci przelewem bankowym.',
          'Po otrzymaniu płatności sprzedający może przesłać zdjęcia.',
          'FODEL zajmuje się tłumaczeniem i publikuje ogłoszenie.',
        ],
      },
      {
        type: 'table',
        title: '3. Cennik',
        intro: `Wszystkie ceny zawierają ${pct(LISTING_VAT_PERCENT)} niderlandzkiego VAT. Pełne zestawienie znajdą Państwo na stronie Cennik.`,
        rows: [
          [`Ogłoszenie ekonomiczne (${months(cheap.months)})`, eur(cheap.priceEur, L)],
          [`Ogłoszenie standardowe (${months(normal.months)})`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Tłumaczenie', `${eur(extra('translation').priceEur, L)} za język`],
          [
            'Wyróżnienie',
            `${extra('category-highlight').priceEur}–${eur(extra('homepage-highlight').priceEur, L)} miesięcznie (min. ${months(minMonths)})`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Prowizja',
        paragraphs: [
          'Prowizja należy się wyłącznie wtedy, gdy spełnione są wszystkie poniższe warunki: pisemna umowa kupna-sprzedaży, kupujący pozyskany przez FODEL i wpłacony zadatek.',
          `Prowizja wynosi ${pct(COMMISSION.percent)} netto, co najmniej ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} niderlandzkiego VAT.`,
          'Jeśli zainteresowany zwróci się bezpośrednio do sprzedającego, a nasza pomoc przy transakcji nie jest potrzebna, poza opłatą za ogłoszenie nic nie jest należne.',
        ],
      },
      {
        type: 'prose',
        title: '5. Wycofanie ogłoszenia',
        paragraphs: [
          'Sprzedający może wycofać ogłoszenie przed upływem jego ważności. Uiszczona opłata za ogłoszenie nie podlega wówczas zwrotowi.',
        ],
      },
      {
        type: 'prose',
        title: '6. Odpowiedzialność',
        paragraphs: [
          'Za prawdziwość informacji o nieruchomości odpowiada sprzedający. FODEL przedstawia przekazane informacje i nie ponosi odpowiedzialności za ich prawdziwość.',
          'Tłumaczenia na tej stronie mają charakter informacyjny; w razie sporu rozstrzyga wersja węgierska.',
        ],
      },
      {
        type: 'prose',
        title: '7. Prawo odstąpienia od umowy',
        paragraphs: [
          'Sprzedającemu będącemu konsumentem przysługuje ustawowe prawo odstąpienia od umowy zawartej na odległość. Jeśli wyraźnie zażąda natychmiastowego wykonania usługi, prawo odstąpienia zostaje ograniczone proporcjonalnie do już wykonanej usługi.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Deklaracja dostępności',
    metaDescription: `Poziom dostępności ${SITE_HOST}, stosowany standard i sposób przekazania nam uwag.`,
    eyebrow: 'Dostępność',
    title: 'Deklaracja',
    titleEm: 'dostępności',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Chcemy, aby z tej strony mógł korzystać każdy, także osoby używające czytnika ekranu, klawiatury lub powiększenia.',
          'Rozwijamy stronę zgodnie ze standardem WCAG 2.2 na poziomie AA. Znaczną część naszych gości stanowią emeryci, dlatego priorytetem są wielkość tekstu, kontrast i obsługa klawiaturą.',
        ],
      },
      {
        type: 'list',
        title: 'Co zostało wdrożone',
        items: [
          'Cały tekst ma współczynnik kontrastu co najmniej 4,5:1',
          'Pełna obsługa klawiaturą z widocznym wskaźnikiem fokusu',
          'Link „Przejdź do treści” na górze każdej strony',
          'Opisowe teksty alternatywne przy wszystkich obrazach',
          'Pola formularzy z powiązanymi etykietami i tekstowymi komunikatami o błędach',
          'Respektowanie ustawienia systemowego „Ogranicz ruch”',
          'Strona jest czytelna i użyteczna bez JavaScriptu',
        ],
      },
      {
        type: 'prose',
        title: 'Znane ograniczenia',
        paragraphs: ['Nie mamy wpływu na dostępność treści stron trzecich, takich jak serwis mapowy.'],
      },
      {
        type: 'prose',
        title: 'Uwagi',
        paragraphs: [
          `Napotkali Państwo przeszkodę? Prosimy dać nam znać pod adresem ${COMPANY.email.primary} lub telefonicznie. Zgłoszenia rozpatrujemy jak najszybciej.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
