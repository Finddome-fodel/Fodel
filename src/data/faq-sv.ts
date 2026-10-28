/**
 * FAQ, Swedish (informal-standard "du"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'sv' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_SV = [
  {
    id: 'direct-from-the-owner',
    question: 'Vad betyder ”direkt av ägaren”?',
    answer: [
      'För en stor del av vårt utbud publicerar vi ägarens namn och telefonnummer bredvid våra egna uppgifter. Du kan kontakta säljaren direkt.',
      'Om du kontaktar säljaren direkt och ni gör upp köpet själva betalar ingen provision: varken du eller säljaren. Vi får då bara betalt för annonsen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Vad kostar er förmedling?',
    answer: [
      `Vår provision är ${COMMISSION.percent}\u00a0% netto, minst ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nederländsk moms. Den betalas av den ungerska säljaren, inte av dig.`,
      'Vi fakturerar bara när alla tre villkor är uppfyllda: det finns ett skriftligt köpeavtal, köparen har presenterats av FINDDOME och handpenningen har betalats.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Kan jag som EU-medborgare köpa en fastighet i Ungern?',
    answer: [
      'Ja. Som EU-medborgare köper du hus och tomter i Ungern på i princip samma villkor som en ungrare. Nästan 100\u00a0% av de ungerska fastigheterna står på mark med full äganderätt. Tomträtt som den nederländska erfpacht är ovanlig.',
      `För jordbruksmark gäller särskilda regler. En EU-medborgare med jordbruksutbildning får förvärva upp till ${AGRI_HECTARE_LIMIT} hektar i Ungern; vi sköter hela det förfarandet.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Måste jag resa till Ungern för att skriva under?',
    answer: [
      'Nej. Vi kan företräda dig i Ungern med fullmakt, så du behöver inte komma dit för undertecknandet.',
      'Vi sköter även inskrivningen i det ungerska fastighetsregistret och överföringen av el och vatten.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'På vilket språk upprättas köpeavtalet?',
    answer: [
      'Vi låter upprätta tvåspråkiga avtal, så att du kan läsa det du skriver under.',
      `Vägledande priser: ungerska från ${price('hu')}, tyska–ungerska och engelska–ungerska från ${price('de-hu')}, nederländska–ungerska från ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Vad exakt ordnar FINDDOME när du köper?',
    answer: [
      '- Rådgivning per telefon och e-post samt kommunikation mellan parterna',
      '- Personliga möten och visningar på plats',
      '- En kollega som talar ditt språk och reser med dig',
      '- Stöd i prisförhandlingen',
      '- Upprättande av det flerspråkiga avtalet',
      '- Hantering av hela köpet',
      '- Inskrivning av den nya ägaren och överföring av el och vatten',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Varför väljer köpare från Västeuropa Ungern?',
    answer: [
      '- Fastighetspriser och levnadskostnader är betydligt lägre',
      '- Fastighetsskatt tas i regel inte ut i Ungern',
      '- Mer sol och ett mildare klimat',
      '- Landet ligger över havsytan, mitt på kontinenten',
      '- Ungern är medlem i EU',
      '- Nästan alla fastigheter står på mark med full äganderätt',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Har en ungersk fastighet en energideklaration?',
    answer: [
      'Ja. Ungern kräver en energideklaration (energiatanúsítvány), och den ska anges i annonsen. I våra annonser visas klassningen bland egenskaperna; ”pågår” betyder att deklarationen fortfarande tas fram.',
      'Om säljaren önskar kan vi ordna energideklarationen åt hen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Vad är söktjänsten och vad kostar den?',
    answer: [
      'Söktjänsten är kostnadsfri. Du berättar vad du letar efter (typ, område, budget och önskemål) och vi söker åt dig, även utanför fastigheterna på den här webbplatsen.',
      'Våra ungerskspråkiga kollegor hjälper till i förhandlingen och ser till att avtalet upprättas juridiskt korrekt. Du får ett e-postmeddelande så snart något passande dyker upp.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Vilka områden täcker ni?',
    answer: [
      'Fokus ligger på Transdanubien med länen Baranya, Tolna, Zala, Somogy och Veszprém, samt Balatonsjön och Balatonhöglandet.',
      'Vi har även fastigheter på slätten och i områden med goda förbindelser till Budapests flygplats.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Jag talar inte ungerska. Är det ett problem?',
    answer: [
      'Nej. I varje annons står det vilka språk ägaren talar, så du vet det i förväg.',
      'Vårt team talar nederländska, tyska, engelska, franska och ungerska och följer med på visningen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'När kan jag nå er?',
    answer: [
      `Vardagar mellan ${COMPANY.hours.weekdays.from} och ${COMPANY.hours.weekdays.to}. Om du ber om återuppringning ringer vi fram till ${COMPANY.hours.callback.to}, även på helger.`,
      'Återuppringningen kostar dig ingenting. Vi betalar samtalet.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
