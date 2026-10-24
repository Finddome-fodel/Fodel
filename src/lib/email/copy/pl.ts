/**
 * Treść e-maili po polsku (forma „Państwo”, pisana wielką literą). Kompilator
 * sprawdza ją względem pliku węgierskiego (`satisfies PublicEmailCopy`): jeśli
 * brakuje szablonu, ten plik się nie skompiluje i nikt nie dostanie e-maila po
 * węgiersku ani po niderlandzku. Powiadomienia dla biura (admin*) pozostają po
 * węgiersku i nie ma ich tutaj.
 *
 * Ton: rzeczowy, krótkie zdania, bez wykrzykników. Wielu sprzedających to
 * emeryci: jasność przed serdecznością, a obie przed tonem reklamowym.
 * Cudzysłów „…”, bez spacji przed „:” i „?”. Liczebniki z rzeczownikiem
 * odmieniamy przez nOf (1 dzień, 2 dni, 5 dni; 1 miesiąc, 2 miesiące, 5 miesięcy).
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';
import { nOf } from '~/i18n/plural';

export const PL = {
  common: {
    greeting: (name: string) => `Dzień dobry, ${name},`,
    greetingNoName: 'Dzień dobry,',
    signOff: 'Z poważaniem\nFODEL Nieruchomości',
    questions: 'Mają Państwo pytania? Wystarczy odpowiedzieć na tę wiadomość.',
    linkFallback: 'Przycisk nie działa? Prosimy skopiować ten adres do przeglądarki:',
  },

  registrationConfirm: {
    subject: 'Prosimy ustawić hasło | FODEL',
    preheader: 'Jedno kliknięcie i mogą Państwo przygotować ogłoszenie.',
    heading: 'Prosimy ustawić hasło',
    intro: 'Dziękujemy za rejestrację. Konto jest prawie gotowe – brakuje tylko hasła.',
    cta: 'Ustaw hasło',
    next: 'Następnie przejdą Państwo od razu do ogłoszenia: pakiet, informacje, zdjęcia. Zajrzymy do niego dopiero wtedy, gdy nam je Państwo prześlą.',
    expiry: 'Link jest ważny przez 7 dni. Jeśli to nie Państwo się rejestrowali, prosimy zignorować tę wiadomość – konto nie zostanie utworzone.',
  },

  accountExists: {
    subject: 'Mają już Państwo konto w FODEL',
    preheader: 'Prosimy się zalogować lub ustawić nowe hasło.',
    heading: 'Dla tego adresu istnieje już konto',
    body: 'Ktoś przed chwilą próbował zarejestrować się na stronie FODEL przy użyciu tego adresu e-mail. Ponieważ konto z tym adresem już istnieje, nie utworzyliśmy nowego.',
    cta: 'Zaloguj się',
    reset: 'Nie pamiętają Państwo hasła? Poproś o nowe hasło',
    ignore: 'To nie Państwo? Nie trzeba nic robić – konto pozostaje bez zmian.',
  },

  invite: {
    subject: 'Zaproszenie do portalu FODEL',
    preheader: 'Prosimy ustawić hasło i zalogować się do panelu ogłoszeniodawcy.',
    heading: 'Zapraszamy do portalu FODEL',
    body: (role: string) =>
      `FODEL zaprasza Państwa do portalu ${role}, w którym zarządza się ogłoszeniami nieruchomości.`,
    roleAdmin: 'jako administratora',
    roleOwner: 'jako ogłoszeniodawcę',
    cta: 'Przyjmij zaproszenie',
    expiry: 'Link jest ważny przez 7 dni i można go użyć tylko raz.',
  },

  welcome: {
    subject: 'Witamy w portalu FODEL',
    preheader: 'Konto jest aktywne. Oto jak dodać pierwsze ogłoszenie.',
    heading: (name: string) => `Witamy, ${name}`,
    body: 'Konto jest aktywne. W portalu przygotują Państwo ogłoszenie, prześlą zdjęcia i będą mogli śledzić jego weryfikację.',
    stepsTitle: 'Co będzie potrzebne',
    steps: [
      'Zdjęcia nieruchomości: co najmniej jedno, ale im więcej, tym lepiej',
      'Podstawowe dane: powierzchnia użytkowa, powierzchnia działki, cena ofertowa',
      'Kilka zdań o tym, co wyróżnia nieruchomość',
    ],
    cta: 'Przejdź do portalu',
  },

  submissionReceived: {
    subject: (ref: string) => `Otrzymaliśmy Państwa ogłoszenie (#${ref})`,
    preheader: 'Sprawdzimy je i odpowiemy e-mailem.',
    heading: 'Ogłoszenie dotarło',
    body: (title: string, ref: string) =>
      `Otrzymaliśmy Państwa ogłoszenie „${title}” (#${ref}). Nasz pracownik je sprawdzi, a o decyzji poinformujemy Państwa e-mailem.`,
    timing: 'Weryfikacja trwa zwykle nie dłużej niż dwa dni robocze.',
    note: 'W trakcie weryfikacji nie można edytować ogłoszenia. Jeśli poprosimy o zmianę, edycja zostanie od razu odblokowana.',
  },

  changesRequested: {
    subject: (ref: string) => `Potrzebna zmiana (#${ref})`,
    preheader: 'Jedna drobna zmiana i ogłoszenie może zostać opublikowane.',
    heading: 'Prosimy o zmianę',
    body: (title: string, ref: string) =>
      `Do ogłoszenia „${title}” (#${ref}) nasz pracownik ma następującą uwagę:`,
    after: 'Ogłoszenie można znów edytować. Prosimy wprowadzić zmianę i przesłać je ponownie – dalej wszystko potoczy się jak zwykle.',
    cta: 'Edytuj ogłoszenie',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Zatwierdzone (#${ref}) – pozostała tylko płatność`,
    preheader: 'Ogłoszenie jest zatwierdzone i zostanie opublikowane po otrzymaniu płatności.',
    heading: 'Ogłoszenie zostało zatwierdzone',
    body: (title: string, ref: string) =>
      `Dobra wiadomość: sprawdziliśmy i zatwierdziliśmy Państwa ogłoszenie „${title}” (#${ref}). Pozostała tylko płatność. Gdy tylko do nas dotrze, ogłoszenie od razu pojawi się na stronie.`,
    orderTitle: 'Koszt ogłoszenia',
    discountLabel: 'Rabat za polecenie (10%)',
    totalLabel: 'Do zapłaty',
    ctaCard: 'Zapłać kartą',
    cardNote: 'Płatność odbywa się w bezpiecznym środowisku Stripe. FODEL nie widzi ani nie przechowuje danych karty.',
    bankTitle: 'Lub przelewem bankowym',
    bankNote: (ref: string) =>
      `Prosimy podać w tytule przelewu numer referencyjny: ${ref}. Gdy przelew dotrze, nasz pracownik opublikuje ogłoszenie.`,
    vatNote: 'Wszystkie podane kwoty zawierają 21% niderlandzkiego VAT.',
  },

  approvedPublished: {
    subject: (ref: string) => `Zatwierdzone i opublikowane (#${ref})`,
    preheader: 'Ogłoszenie jest już online; opłatę prosimy uiścić w ciągu 14 dni.',
    heading: 'Ogłoszenie jest online',
    body: (title: string, ref: string) => `Zatwierdziliśmy ogłoszenie „${title}” (#${ref}) i od razu je opublikowaliśmy.`,
    viewCta: 'Zobacz ogłoszenie',
    orderTitle: 'Koszt ogłoszenia',
    discountLabel: 'Rabat za polecenie (10%)',
    totalLabel: 'Do zapłaty',
    dueLabel: 'Termin płatności',
    ctaCard: 'Zapłać kartą',
    cardNote: 'Płatność odbywa się w bezpiecznym środowisku Stripe. FODEL nie widzi ani nie przechowuje danych karty.',
    bankTitle: 'Przelew bankowy',
    bankNote: (ref: string) => `Prosimy podać w tytule przelewu numer referencyjny: ${ref}.`,
    vatNote: 'Wszystkie podane kwoty zawierają 21% niderlandzkiego VAT.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Potwierdzenie płatności (#${ref})`,
    preheader: 'Dziękujemy, płatność do nas dotarła.',
    heading: 'Dziękujemy, płatność do nas dotarła',
    body: (title: string, ref: string) =>
      `Otrzymaliśmy płatność za ogłoszenie „${title}” (#${ref}). Ogłoszenie jest online i widoczne na ${SITE_HOST}.`,
    orderTitle: 'Szczegóły',
    discountLabel: 'Rabat za polecenie (10%)',
    totalLabel: 'Zapłacona kwota',
    vatNote: 'Kwota zawiera 21% niderlandzkiego VAT. Fakturę otrzymają Państwo w osobnej wiadomości.',
    paidAtLabel: 'Data płatności',
  },

  published: {
    subject: (ref: string) => `Ogłoszenie jest online (#${ref})`,
    preheader: `Ogłoszenie jest już widoczne na ${SITE_HOST}.`,
    heading: 'Ogłoszenie jest online',
    body: (title: string, ref: string) =>
      `Państwa ogłoszenie „${title}” (#${ref}) jest na ${SITE_HOST} i dociera do kupujących w ośmiu krajach.`,
    cta: 'Zobacz ogłoszenie',
    next: 'Gdy tylko ktoś się zainteresuje, od razu wyślemy Państwu e-mail z jego danymi kontaktowymi. Status ogłoszenia można w każdej chwili sprawdzić w portalu.',
  },

  newEnquiry: {
    subject: (ref: string) => `Nowe zapytanie (#${ref})`,
    preheader: 'Ktoś jest zainteresowany Państwa nieruchomością.',
    heading: 'Nowa odpowiedź na ogłoszenie',
    body: (title: string, ref: string) =>
      `Ktoś odpowiedział na Państwa ogłoszenie „${title}” (#${ref}):`,
    labels: { name: 'Imię i nazwisko', email: 'E-mail', phone: 'Telefon' },
    messageTitle: 'Wiadomość',
    advice: 'Najlepiej skontaktować się z tą osobą w ciągu dwóch dni: szybka odpowiedź to zdecydowanie najważniejszy czynnik, od którego zależy, czy dojdzie do sprzedaży.',
  },

  passwordReset: {
    subject: 'Resetowanie hasła | Portal FODEL',
    preheader: 'Link jest ważny przez godzinę.',
    heading: 'Resetowanie hasła',
    body: 'Otrzymaliśmy prośbę o zresetowanie hasła do Państwa konta w portalu FODEL. Aby ustawić nowe hasło, prosimy kliknąć przycisk poniżej.',
    cta: 'Ustaw nowe hasło',
    expiry: 'Link jest ważny przez godzinę i można go użyć tylko raz.',
    ignore: 'To nie Państwo wysłali tę prośbę? Prosimy zignorować tę wiadomość. Hasło pozostanie bez zmian i nic się nie stanie.',
  },

  referralRegistered: {
    subject: 'Otrzymaliśmy Państwa polecenie | FODEL',
    preheader: 'Nasz pracownik wkrótce skontaktuje się z poleconą osobą.',
    heading: 'Dziękujemy za polecenie',
    body: (referredName: string) =>
      `Otrzymaliśmy dane kontaktowe: ${referredName}. Nasz pracownik skontaktuje się z tą osobą, a gdy tylko doda ogłoszenie, odliczymy 10% od kosztu Państwa następnego ogłoszenia.`,
    note: 'Rabat naliczamy ręcznie, po opłaceniu ogłoszenia przez poleconą osobę. Damy Państwu znać, gdy tylko będzie to możliwe.',
  },

  valuationReceived: {
    heading: 'Otrzymaliśmy prośbę o wycenę',
    body: 'Nasz pracownik sprawdzi dane nieruchomości i naszą bazę danych, a następnie prześle Państwu e-mailem orientacyjną wycenę opartą na danych rynkowych.',
  },

  valuationReady: {
    subject: 'Wycena jest gotowa | FODEL',
    preheader: 'Przygotowaliśmy orientacyjną wycenę Państwa nieruchomości.',
    heading: 'Wycena jest gotowa',
    body: (range: string) =>
      `Na podstawie podanych informacji i porównywalnych nieruchomości nasza orientacyjna wycena wynosi: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Wycena ma charakter orientacyjny: nie jest operatem szacunkowym i go nie zastępuje. Opiera się na ${nOf('pl', n, 'porównywalnej nieruchomości', 'porównywalnych nieruchomościach')}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Wycena ma charakter orientacyjny: nie jest operatem szacunkowym i go nie zastępuje.',
    cta: 'Dodaj ogłoszenie',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Na podstawie podanych informacji orientacyjna wartość rynkowa wynosi: ${range}.`,
    mid: 'Wartość środkowa',
    basis: 'Baza danych',
    rateDate: 'Data kursu wymiany',
    source: 'Źródło',
    factorsHeading: 'Czynniki',
    dirPlus: 'Podnosi wartość',
    dirMinus: 'Obniża wartość',
    dirUnsure: 'Niepewny',
    visit: 'Zamów wizytę Gábora',
    judicial: 'Zamów operat szacunkowy',
  },

  valuationDeclined: {
    subject: 'Państwa prośba o wycenę | FODEL',
    preheader: 'Nasz pracownik skontaktuje się z Państwem osobiście.',
    heading: 'Dziękujemy za zapytanie',
    body: 'Na podstawie podanych informacji mamy obecnie zbyt mało porównywalnych nieruchomości, aby przygotować wiarygodną wycenę. Nasz pracownik skontaktuje się z Państwem osobiście.',
  },

  valuationNeedsInfo: {
    subject: 'Wycena: brakuje nam kilku informacji',
    preheader: 'Do wyceny potrzebujemy nieco więcej informacji.',
    heading: 'Brakuje nam kilku informacji',
    body: 'Dziękujemy za prośbę o wycenę. Aby ją przygotować, nasz pracownik prosi o następujące informacje:',
    after: 'Prosimy odpowiedzieć na tę wiadomość, uzupełniając brakujące informacje. Gdy tylko je otrzymamy, przygotujemy wycenę.',
  },

  rejected: {
    subject: (ref: string) => `Ogłoszenie nie może zostać opublikowane (#${ref})`,
    preheader: 'Wynik weryfikacji i uzasadnienie.',
    heading: 'Nie możemy opublikować ogłoszenia',
    body: (title: string, ref: string) =>
      `Przykro nam: po weryfikacji nasz pracownik nie zatwierdził Państwa ogłoszenia „${title}” (#${ref}). Uzasadnienie:`,
    refund: 'Ogłoszenie zostało już opłacone? W sprawie zwrotu skontaktujemy się z Państwem osobno.',
    after: 'Mają Państwo pytania lub wydaje się, że zaszło nieporozumienie? Wystarczy odpowiedzieć na tę wiadomość.',
  },

  invoiceIssued: {
    subject: (number: string) => `Faktura ${number}`,
    preheader: 'Faktura jest gotowa; można ją wyświetlić lub pobrać za pomocą linku.',
    heading: 'Faktura jest gotowa',
    body: (title: string, ref: string, number: string) =>
      `Faktura ${number} za ogłoszenie „${title}” (#${ref}) jest gotowa.`,
    cta: 'Zobacz fakturę',
  },

  creditNoteIssued: {
    subject: (number: string) => `Faktura korygująca ${number}`,
    preheader: 'Wystawiliśmy fakturę korygującą do poprzedniej faktury.',
    heading: 'Faktura korygująca jest gotowa',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Do faktury ${correctsNumber} za ogłoszenie „${title}” (#${ref}) wystawiliśmy fakturę korygującą ${number}.`,
    cta: 'Zobacz fakturę korygującą',
  },

  serviceRequested: {
    subject: 'Otrzymaliśmy Państwa zamówienie | FODEL',
    preheader: 'Nasz pracownik skontaktuje się z Państwem, aby ustalić termin.',
    heading: 'Otrzymaliśmy Państwa zamówienie',
    body: (service: string, price: string) => `Dziękujemy, przyjęliśmy zamówienie: ${service} (${price}).`,
    next: 'Nasz pracownik skontaktuje się z Państwem, aby ustalić termin.',
    payment: 'Informacje o płatności przekażemy przy ustalaniu terminu. Na razie nic nie trzeba płacić.',
    cancel: 'Zmienili Państwo zdanie? Wystarczy odpowiedzieć na tę wiadomość.',
  },

  valuationPaid: {
    subject: 'Potwierdzenie płatności | Wycena FODEL',
    preheader: 'Dziękujemy, płatność do nas dotarła.',
    heading: 'Dziękujemy, płatność do nas dotarła',
    body: (service: string) => `Otrzymaliśmy płatność za usługę „${service}”.`,
    orderTitle: 'Pozycja',
    totalLabel: 'Zapłacona kwota',
    paidAtLabel: 'Data zapłaty',
    next: 'Nasz pracownik wkrótce skontaktuje się z Państwem w sprawie dalszych kroków.',
    invoice: 'Potrzebują Państwo faktury? Wystarczy odpowiedzieć na tę wiadomość.',
  },

  judicialRequested: {
    subject: 'Zamówienie operatu szacunkowego | FODEL',
    preheader: 'Nasz pracownik skontaktuje się z Państwem, aby omówić możliwości.',
    heading: 'Otrzymaliśmy Państwa zamówienie',
    body: 'Dziękujemy, odnotowaliśmy, że chcą Państwo zamówić operat szacunkowy (na potrzeby sądowe lub urzędowe) sporządzony przez rzeczoznawcę. Różni się on od orientacyjnej wyceny rynkowej dostępnej na naszej stronie: sporządza go uprawniony rzeczoznawca, na podstawie indywidualnej oferty.',
    next: 'Nasz pracownik skontaktuje się z Państwem, aby omówić możliwości i przedstawić ofertę.',
  },
} satisfies PublicEmailCopy;
