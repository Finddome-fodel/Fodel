/**
 * FAQ, English (British). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'en' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_EN = [
  {
    id: 'direct-from-the-owner',
    question: 'What does “direct from the owner” mean?',
    answer: [
      'For much of our stock we publish the owner’s name and phone number alongside our own details. You can contact the seller directly.',
      'If you contact them directly and arrange the purchase yourselves, nobody pays commission: neither you nor the seller. We are then paid only for the listing.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'What does your brokerage cost?',
    answer: [
      `Our commission is ${COMMISSION.percent}% net with a minimum of ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}% Dutch VAT. It is paid by the Hungarian seller, not by you.`,
      'We invoice only when all three conditions are met: there is a written sale and purchase agreement, the buyer was introduced by FINDDOME, and the deposit has been paid.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Can I buy a property in Hungary as an EU citizen?',
    answer: [
      'Yes. As an EU citizen you buy houses and plots in Hungary on practically the same terms as a Hungarian. Almost 100% of Hungarian property stands on freehold land. Leasehold arrangements such as the Dutch erfpacht are rare.',
      `Separate rules apply to agricultural land. An EU citizen with an agricultural qualification may acquire up to ${AGRI_HECTARE_LIMIT} hectares in Hungary; we handle that procedure in full.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Do I have to travel to Hungary to sign?',
    answer: [
      'No. We can represent you in Hungary under a power of attorney, so you do not need to come over for the signing.',
      'We also take care of registration at the Hungarian land registry and the transfer of utilities.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'In which language is the sale and purchase agreement drawn up?',
    answer: [
      'We have bilingual agreements drawn up, so you read what you sign.',
      `Price guide: Hungarian from ${price('hu')}, German–Hungarian and English–Hungarian from ${price('de-hu')}, Dutch–Hungarian from ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'What exactly does FINDDOME arrange when you buy?',
    answer: [
      '- Consultation by phone and email, and communication between both parties',
      '- Personal appointments and viewings on site',
      '- A colleague who speaks your language and travels with you',
      '- Support with the price negotiation',
      '- Preparation of the multilingual agreement',
      '- Handling the whole purchase',
      '- Registration of the new owner and transfer of utilities',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Why do buyers from Western Europe choose Hungary?',
    answer: [
      '- Property and living costs are considerably lower',
      '- Property tax is generally not charged in Hungary',
      '- More sun and a milder climate',
      '- The country lies above sea level, in the middle of the continent',
      '- Hungary is an EU member state',
      '- Almost all property stands on freehold land',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Does a Hungarian property have an energy certificate?',
    answer: [
      'Yes. Hungary requires an energy performance certificate (energiatanúsítvány), and it must be stated in the listing. In our listings the rating is shown under the features; “pending” means the certificate is still being prepared.',
      'If the seller wishes, we can have the certificate prepared for them.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'What is the search service and what does it cost?',
    answer: [
      'The search service is free. You tell us what you are looking for (type, area, budget and wishes) and we search for you, including beyond the properties on this site.',
      'Our Hungarian-speaking colleagues help with the negotiation and make sure the agreement is drawn up correctly in law. You receive an email as soon as something suitable turns up.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Which areas do you cover?',
    answer: [
      'The focus is Transdanubia, with the counties of Baranya, Tolna, Zala, Somogy and Veszprém, plus Lake Balaton and the Balaton Uplands.',
      'We also have properties on the plain and in areas with good links to Budapest airport.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'I do not speak Hungarian. Is that a problem?',
    answer: [
      'No. Every listing says which languages the owner speaks, so you know in advance.',
      'Our team speaks Dutch, German, English, French and Hungarian, and comes along to the viewing.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'When can I reach you?',
    answer: [
      `On weekdays between ${COMPANY.hours.weekdays.from} and ${COMPANY.hours.weekdays.to}. If you ask for a callback, we call until ${COMPANY.hours.callback.to}, weekends included.`,
      'A callback costs you nothing. We pay for the call.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
