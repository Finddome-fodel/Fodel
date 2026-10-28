/**
 * FAQ, Czech (formal "vykání"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'cs' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_CS = [
  {
    id: 'direct-from-the-owner',
    question: 'Co znamená „přímo od majitele“?',
    answer: [
      'U velké části naší nabídky zveřejňujeme vedle našich údajů i jméno a telefon majitele. Prodávajícího můžete kontaktovat přímo.',
      'Pokud ho kontaktujete přímo a koupi si domluvíte mezi sebou, nikdo neplatí provizi: ani vy, ani prodávající. My jsme pak placeni jen za inzerát.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Kolik stojí vaše zprostředkování?',
    answer: [
      `Naše provize činí ${COMMISSION.percent}\u00a0% netto, nejméně ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nizozemské DPH. Platí ji maďarský prodávající, nikoli vy.`,
      'Fakturujeme jen tehdy, když jsou splněny všechny tři podmínky: existuje písemná kupní smlouva, kupujícího přivedla FINDDOME a byla zaplacena záloha.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Mohu jako občan EU koupit nemovitost v Maďarsku?',
    answer: [
      'Ano. Jako občan EU kupujete v Maďarsku domy a pozemky prakticky za stejných podmínek jako Maďar. Téměř 100\u00a0% maďarských nemovitostí stojí na pozemcích v plném vlastnictví. Právo stavby, jako je nizozemský erfpacht, je vzácné.',
      `Pro zemědělskou půdu platí zvláštní pravidla. Občan EU se zemědělskou kvalifikací může v Maďarsku nabýt až ${AGRI_HECTARE_LIMIT} hektarů; toto řízení zajistíme celé.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Musím kvůli podpisu cestovat do Maďarska?',
    answer: [
      'Ne. Na základě plné moci vás můžeme v Maďarsku zastoupit, takže k podpisu nemusíte přijíždět.',
      'Postaráme se také o zápis do maďarského katastru a převod energií.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'V jakém jazyce se kupní smlouva sepisuje?',
    answer: [
      'Necháváme vypracovat dvojjazyčné smlouvy, takže čtete, co podepisujete.',
      `Orientační ceny: maďarsky od ${price('hu')}, německy–maďarsky a anglicky–maďarsky od ${price('de-hu')}, nizozemsky–maďarsky od ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Co přesně FINDDOME při koupi zajistí?',
    answer: [
      '- Konzultace po telefonu a e-mailem a komunikace mezi oběma stranami',
      '- Osobní schůzky a prohlídky na místě',
      '- Kolega, který mluví vaším jazykem a cestuje s vámi',
      '- Podpora při vyjednávání o ceně',
      '- Vypracování vícejazyčné smlouvy',
      '- Vyřízení celé koupě',
      '- Zápis nového vlastníka a převod energií',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Proč si kupující ze západní Evropy vybírají Maďarsko?',
    answer: [
      '- Ceny nemovitostí i životní náklady jsou výrazně nižší',
      '- Daň z nemovitostí se v Maďarsku obvykle nevybírá',
      '- Více slunce a mírnější podnebí',
      '- Země leží nad hladinou moře, uprostřed kontinentu',
      '- Maďarsko je členským státem EU',
      '- Téměř všechny nemovitosti stojí na pozemcích v plném vlastnictví',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Má maďarská nemovitost průkaz energetické náročnosti?',
    answer: [
      'Ano. Maďarsko vyžaduje průkaz energetické náročnosti (energiatanúsítvány), který musí být uveden v inzerátu. V našich inzerátech je třída uvedena mezi vlastnostmi; „připravuje se“ znamená, že průkaz se teprve zpracovává.',
      'Pokud si to prodávající přeje, můžeme mu průkaz nechat vypracovat.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Co je vyhledávací služba a kolik stojí?',
    answer: [
      'Vyhledávací služba je zdarma. Řeknete nám, co hledáte (typ, oblast, rozpočet a přání), a my hledáme za vás, i mimo nemovitosti na tomto webu.',
      'Naši maďarsky mluvící kolegové pomáhají s vyjednáváním a dbají na to, aby smlouva byla právně správně sepsána. Jakmile se objeví něco vhodného, dostanete e-mail.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Které oblasti pokrýváte?',
    answer: [
      'Těžištěm je Zadunají s župami Baranya, Tolna, Zala, Somogy a Veszprém a také Balaton a Balatonská vrchovina.',
      'Máme i nemovitosti v nížině a v oblastech s dobrým spojením na budapešťské letiště.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Nemluvím maďarsky. Je to problém?',
    answer: [
      'Ne. U každého inzerátu je uvedeno, jakými jazyky majitel mluví, takže to víte předem.',
      'Náš tým mluví nizozemsky, německy, anglicky, francouzsky a maďarsky a doprovodí vás na prohlídku.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Kdy vás zastihnu?',
    answer: [
      `V pracovní dny mezi ${COMPANY.hours.weekdays.from} a ${COMPANY.hours.weekdays.to}. Pokud požádáte o zavolání zpět, voláme do ${COMPANY.hours.callback.to}, i o víkendech.`,
      'Zavolání zpět vás nic nestojí. Hovor platíme my.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
