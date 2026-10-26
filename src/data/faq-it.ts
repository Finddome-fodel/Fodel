/**
 * FAQ, Italian (formal "Lei"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'it' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_IT = [
  {
    id: 'direct-from-the-owner',
    question: 'Cosa significa “direttamente dal proprietario”?',
    answer: [
      'Per gran parte della nostra offerta pubblichiamo nome e numero di telefono del proprietario accanto ai nostri recapiti. Potete contattare direttamente il venditore.',
      'Se lo contattate direttamente e concludete l’acquisto tra voi, nessuno paga provvigioni: né voi né il venditore. In tal caso veniamo pagati solo per l’annuncio.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Quanto costa la vostra intermediazione?',
    answer: [
      `La nostra provvigione è del ${COMMISSION.percent}% netto con un minimo di ${eur(COMMISSION.minimumEur, L)}, più il ${COMMISSION.vatPercent}% di IVA olandese. La paga il venditore ungherese, non voi.`,
      'Fatturiamo solo quando sono soddisfatte tutte e tre le condizioni: esiste un contratto di compravendita scritto, l’acquirente è stato presentato da FODEL e la caparra è stata versata.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Come cittadino UE posso acquistare un immobile in Ungheria?',
    answer: [
      'Sì. Come cittadini UE acquistate case e terreni in Ungheria praticamente alle stesse condizioni di un ungherese. Quasi il 100% degli immobili ungheresi sorge su terreno in piena proprietà. Forme di diritto di superficie come l’erfpacht olandese sono rare.',
      `Per i terreni agricoli valgono regole a parte. Un cittadino UE con qualifica agricola può acquistare fino a ${AGRI_HECTARE_LIMIT} ettari in Ungheria; gestiamo noi l’intera procedura.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Devo recarmi in Ungheria per firmare?',
    answer: [
      'No. Possiamo rappresentarvi in Ungheria tramite procura, quindi non dovete venire per la firma.',
      'Ci occupiamo anche dell’iscrizione al catasto ungherese e del passaggio delle utenze.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'In quale lingua viene redatto il contratto di compravendita?',
    answer: [
      'Facciamo redigere contratti bilingui, così leggete ciò che firmate.',
      `Prezzi indicativi: ungherese da ${price('hu')}, tedesco–ungherese e inglese–ungherese da ${price('de-hu')}, olandese–ungherese da ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Di cosa si occupa esattamente FODEL quando acquistate?',
    answer: [
      '- Consulenza telefonica e via e-mail e comunicazione tra le due parti',
      '- Appuntamenti personali e visite in loco',
      '- Un collega che parla la vostra lingua e viaggia con voi',
      '- Supporto nella trattativa sul prezzo',
      '- Redazione del contratto multilingue',
      '- Gestione dell’intero acquisto',
      '- Iscrizione del nuovo proprietario e passaggio delle utenze',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Perché gli acquirenti dell’Europa occidentale scelgono l’Ungheria?',
    answer: [
      '- I costi degli immobili e della vita sono decisamente più bassi',
      '- In Ungheria di norma non si paga l’imposta sugli immobili',
      '- Più sole e un clima più mite',
      '- Il Paese si trova sopra il livello del mare, al centro del continente',
      '- L’Ungheria è uno Stato membro dell’UE',
      '- Quasi tutti gli immobili sorgono su terreno in piena proprietà',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Un immobile ungherese ha l’attestato di prestazione energetica?',
    answer: [
      'Sì. L’Ungheria richiede l’attestato di prestazione energetica (energiatanúsítvány), che deve essere indicato nell’annuncio. Nei nostri annunci la classe è riportata tra le caratteristiche; “in corso” significa che l’attestato è ancora in preparazione.',
      'Se il venditore lo desidera, possiamo far preparare l’attestato per lui.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Che cos’è il servizio di ricerca e quanto costa?',
    answer: [
      'Il servizio di ricerca è gratuito. Ci dite cosa cercate (tipologia, zona, budget e desideri) e cerchiamo per voi, anche oltre gli immobili presenti su questo sito.',
      'I nostri colleghi di lingua ungherese aiutano nella trattativa e fanno sì che il contratto sia redatto correttamente dal punto di vista giuridico. Ricevete un’e-mail non appena compare qualcosa di adatto.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Quali zone coprite?',
    answer: [
      'Il fulcro è la Transdanubia, con le contee di Baranya, Tolna, Zala, Somogy e Veszprém, oltre al lago Balaton e agli altopiani del Balaton.',
      'Abbiamo immobili anche in pianura e in zone ben collegate all’aeroporto di Budapest.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Non parlo ungherese. È un problema?',
    answer: [
      'No. Ogni annuncio indica quali lingue parla il proprietario, così lo sapete in anticipo.',
      'Il nostro team parla olandese, tedesco, inglese, francese e ungherese e vi accompagna alla visita.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Quando posso contattarvi?',
    answer: [
      `Nei giorni feriali tra le ${COMPANY.hours.weekdays.from} e le ${COMPANY.hours.weekdays.to}. Se richiedete una richiamata, chiamiamo fino alle ${COMPANY.hours.callback.to}, anche nel fine settimana.`,
      'La richiamata non vi costa nulla. La chiamata è a nostro carico.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
