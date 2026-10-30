/**
 * Words for the owner-facing translation screens (the setup wizard and the live
 * listing's panel), in the three languages of the portal. Anything an owner
 * reads must say the same true thing: the translation is made by AI, right
 * after payment, and nobody claims a person checked it.
 */
export type PortalCopyLang = 'hu' | 'nl' | 'en';

export type TranslationCopy = {
  legend: string;
  /** Under the legend, paid listing. */
  intro: string;
  /** Under the legend, free-link listing: nothing is charged and the office decides. */
  introFree: string;
  recommended: string;
  more: (n: number) => string;
  all: (n: number) => string;
  clear: string;
  have: string;
  summaryNone: string;
  /** "3 languages · € 75" */
  summary: (n: number, total: string) => string;
  summaryFree: (n: number) => string;
  perLanguage: (price: string) => string;
  /** The live listing's panel. */
  panelTitle: string;
  panelLead: string;
  panelLeadFree: string;
  pay: string;
  request: string;
  paying: string;
  requested: string;
  thanksPaid: string;
  progress: (done: number, total: number) => string;
  working: string;
  waitingForOffice: string;
  failed: string;
  ready: string;
  nothingToAdd: string;
  cardUnavailable: string;
  errorGeneric: string;
  aiOffNote: string;
  statusLabels: Record<string, string>;
};

export const TRANSLATION_COPY: Record<PortalCopyLang, TranslationCopy> = {
  hu: {
    legend: 'Fordítás más nyelvekre',
    intro: 'Válassza ki, milyen nyelveken jelenjen meg a hirdetése. A fordítást a rendszer automatikusan, mesterséges intelligenciával készíti el, közvetlenül a fizetés után.',
    introFree: 'Válassza ki, milyen nyelveken szeretné megjelentetni a hirdetését. A kérését munkatársunk jóváhagyja, a fordítás utána automatikusan elkészül. Ez Önnek nem jár költséggel.',
    recommended: 'Javasolt',
    more: (n) => `További nyelvek (${n})`,
    all: (n) => `Mind a ${n}`,
    clear: 'Törlés',
    have: 'már megvan',
    summaryNone: 'Nincs kiválasztott nyelv',
    summary: (n, total) => `${n} nyelv · ${total}`,
    summaryFree: (n) => `${n} nyelv kiválasztva`,
    perLanguage: (p) => `${p} / nyelv`,
    panelTitle: 'Fordítás hozzáadása',
    panelLead: 'Hirdetése újabb nyelveken is megjelenhet. A fizetés után a fordítás automatikusan, mesterséges intelligenciával elkészül és megjelenik a hirdetésen.',
    panelLeadFree: 'Kérhet fordítást újabb nyelvekre. A kérést munkatársunk hagyja jóvá, utána a fordítás automatikusan elkészül.',
    pay: 'Fizetés bankkártyával',
    request: 'Kérés elküldése',
    paying: 'Átirányítás a fizetéshez…',
    requested: 'Kérését megkaptuk. Munkatársunk hamarosan jóváhagyja.',
    thanksPaid: 'Köszönjük, a fizetés megérkezett. A fordítás elindult.',
    progress: (done, total) => `${done} / ${total} nyelv kész`,
    working: 'A fordítás folyamatban van. Ez néhány percet vesz igénybe, az oldalt nem kell nyitva tartania.',
    waitingForOffice: 'Jóváhagyásra vár',
    failed: 'Egy nyelvnél elakadtunk. Munkatársunk foglalkozik vele, Önnek nincs teendője.',
    ready: 'Minden kért nyelv elkészült.',
    nothingToAdd: 'Ehhez a hirdetéshez már minden elérhető nyelv megvan.',
    cardUnavailable: 'A kártyás fizetés most nem érhető el. Kérjük, írjon nekünk.',
    errorGeneric: 'Nem sikerült. Kérjük, próbálja újra.',
    aiOffNote: 'Az automatikus fordítás jelenleg nincs bekapcsolva, a kérését ettől még rögzítjük.',
    statusLabels: { requested: 'Jóváhagyásra vár', queued: 'Sorban áll', running: 'Készül', done: 'Kész', failed: 'Elakadt', declined: 'Elutasítva', cancelled: 'Visszavonva' },
  },
  nl: {
    legend: 'Vertaling naar andere talen',
    intro: 'Kies in welke talen uw advertentie verschijnt. De vertaling wordt automatisch met AI gemaakt, direct na de betaling.',
    introFree: 'Kies in welke talen u uw advertentie wilt tonen. Een medewerker keurt uw verzoek goed, daarna wordt de vertaling automatisch gemaakt. Hier zijn voor u geen kosten aan verbonden.',
    recommended: 'Aanbevolen',
    more: (n) => `Meer talen (${n})`,
    all: (n) => `Alle ${n}`,
    clear: 'Wissen',
    have: 'al aanwezig',
    summaryNone: 'Geen taal gekozen',
    summary: (n, total) => `${n} ${n === 1 ? 'taal' : 'talen'} · ${total}`,
    summaryFree: (n) => `${n} ${n === 1 ? 'taal' : 'talen'} gekozen`,
    perLanguage: (p) => `${p} per taal`,
    panelTitle: 'Vertaling toevoegen',
    panelLead: 'Uw advertentie kan ook in andere talen verschijnen. Na betaling wordt de vertaling automatisch met AI gemaakt en op de advertentie geplaatst.',
    panelLeadFree: 'U kunt vertalingen in andere talen aanvragen. Een medewerker keurt het verzoek goed, daarna wordt de vertaling automatisch gemaakt.',
    pay: 'Betalen met bankkaart',
    request: 'Verzoek versturen',
    paying: 'Doorsturen naar de betaling…',
    requested: 'We hebben uw verzoek ontvangen. Een medewerker keurt het binnenkort goed.',
    thanksPaid: 'Bedankt, uw betaling is ontvangen. De vertaling is gestart.',
    progress: (done, total) => `${done} van ${total} ${total === 1 ? 'taal' : 'talen'} klaar`,
    working: 'De vertaling wordt gemaakt. Dat duurt een paar minuten, u hoeft deze pagina niet open te houden.',
    waitingForOffice: 'Wacht op goedkeuring',
    failed: 'Bij één taal liep het vast. Een medewerker pakt het op, u hoeft niets te doen.',
    ready: 'Alle gevraagde talen zijn klaar.',
    nothingToAdd: 'Deze advertentie heeft al alle beschikbare talen.',
    cardUnavailable: 'Betalen met kaart is nu niet beschikbaar. Stuur ons gerust een bericht.',
    errorGeneric: 'Dat is niet gelukt. Probeer het opnieuw.',
    aiOffNote: 'De automatische vertaling staat nu uit. Uw verzoek wordt wel vastgelegd.',
    statusLabels: { requested: 'Wacht op goedkeuring', queued: 'In de wachtrij', running: 'Wordt gemaakt', done: 'Klaar', failed: 'Vastgelopen', declined: 'Afgewezen', cancelled: 'Ingetrokken' },
  },
  en: {
    legend: 'Translation into other languages',
    intro: 'Choose the languages your listing should appear in. The translation is made automatically with AI, right after payment.',
    introFree: 'Choose the languages you would like your listing to appear in. A member of our team approves your request, then the translation is made automatically. There is no charge to you.',
    recommended: 'Recommended',
    more: (n) => `More languages (${n})`,
    all: (n) => `All ${n}`,
    clear: 'Clear',
    have: 'already there',
    summaryNone: 'No language chosen',
    summary: (n, total) => `${n} ${n === 1 ? 'language' : 'languages'} · ${total}`,
    summaryFree: (n) => `${n} ${n === 1 ? 'language' : 'languages'} chosen`,
    perLanguage: (p) => `${p} per language`,
    panelTitle: 'Add a translation',
    panelLead: 'Your listing can appear in more languages. After payment the translation is made automatically with AI and added to the listing.',
    panelLeadFree: 'You can ask for translations into more languages. A member of our team approves the request, then the translation is made automatically.',
    pay: 'Pay by card',
    request: 'Send request',
    paying: 'Taking you to payment…',
    requested: 'We have your request. A member of our team will approve it shortly.',
    thanksPaid: 'Thank you, your payment has arrived. The translation has started.',
    progress: (done, total) => `${done} of ${total} ${total === 1 ? 'language' : 'languages'} ready`,
    working: 'The translation is being made. It takes a few minutes and you do not need to keep this page open.',
    waitingForOffice: 'Waiting for approval',
    failed: 'One language got stuck. A member of our team is looking into it, there is nothing you need to do.',
    ready: 'Every language you asked for is ready.',
    nothingToAdd: 'This listing already has every available language.',
    cardUnavailable: 'Card payment is not available right now. Please write to us.',
    errorGeneric: 'That did not work. Please try again.',
    aiOffNote: 'Automatic translation is switched off at the moment. Your request is still recorded.',
    statusLabels: { requested: 'Waiting for approval', queued: 'Queued', running: 'Being made', done: 'Ready', failed: 'Stuck', declined: 'Declined', cancelled: 'Withdrawn' },
  },
};
