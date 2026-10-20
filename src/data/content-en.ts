/**
 * Long-form pages, English (British): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'en' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `from ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_EN = {
  services: {
    metaTitle: 'Services: handling the sale, contracts, photography',
    metaDescription: `Bilingual sale contract ${from('hu')}, representation under power of attorney, land registry registration, energy certificate, property photography and drone footage.`,
    eyebrow: 'Services',
    title: 'What we do beyond',
    titleEm: 'the listing',
    intro:
      'The listing is only the first step. With the services below we take the whole purchase process off your hands, following the rules of both countries.',
    sections: [
      {
        type: 'steps',
        title: 'How the sale is handled',
        items: [
          { n: '01', t: 'Contact', b: 'Phone and email consultation, communication with both parties, including interpreters.' },
          { n: '02', t: 'Buyer screening', b: 'We check background, intent to buy and financial standing.' },
          { n: '03', t: 'Viewing', b: 'We arrange the appointments and come along, with a colleague who speaks your language.' },
          { n: '04', t: 'Negotiation', b: 'Support in both languages, within a realistic price range.' },
          { n: '05', t: 'Contract', b: 'A bilingual sale and purchase agreement, drawn up with a lawyer.' },
          { n: '06', t: 'Completion', b: 'Land registry, utilities and, where needed, representation under power of attorney.' },
        ],
      },
      {
        type: 'table',
        title: 'Bilingual sale and purchase agreement',
        intro: 'Indicative prices per language combination. The final price depends on the length of the contract.',
        rows: [
          ['Hungarian', from('hu')],
          ['German–Hungarian', from('de-hu')],
          ['English–Hungarian', from('en-hu')],
          ['Dutch–Hungarian', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Additional services',
        intro: 'For these we prepare a tailored quote:',
        items: [
          'Applying for the energy performance certificate: required in the listing under EU rules',
          'Professional property photography',
          'Drone footage: especially effective for large plots and views',
          `Video with the listing (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Representation under power of attorney',
        body: 'You do not need to travel to Hungary to sign: under a power of attorney we represent you at the signing, at the land registry and when the utilities are transferred.',
      },
      {
        type: 'prose',
        title: 'When commission is due',
        paragraphs: [
          `We charge commission only when FODEL has introduced the buyer, a written sale and purchase agreement exists and the deposit has been paid. The rate is ${COMMISSION.percent}% net with a minimum of ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}% Dutch VAT. The seller pays, not the buyer.`,
        ],
      },
      {
        type: 'cta',
        title: 'Questions about the process',
        body: '{hours} Ask for a free callback, or write to us.',
        primary: { label: 'Get in touch', to: 'contact' },
        secondary: { label: 'Frequently asked questions', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Agricultural property: up to ${AGRI_HECTARE_LIMIT} hectares in Hungary`,
    metaDescription: `An EU citizen with an agricultural qualification may acquire up to ${AGRI_HECTARE_LIMIT} hectares of land in Hungary. FODEL handles the whole procedure.`,
    eyebrow: 'Agricultural property',
    title: 'Farmland and',
    titleEm: 'country estates',
    intro:
      'The Hungarian land market has its own rules. Anyone who knows the conditions gains access to vineyards, arable land, farms and woodland.',
    sections: [
      {
        type: 'prose',
        title: `The ${AGRI_HECTARE_LIMIT}-hectare limit`,
        paragraphs: [
          `An EU citizen with an agricultural qualification may acquire a total of ${AGRI_HECTARE_LIMIT} hectares of land in Hungary. We handle that procedure in full.`,
          'The process has several steps with the authorities and begins with recognition of your qualification. Our team guides you through the whole process and prepares the documents in both languages.',
        ],
      },
      {
        type: 'list',
        title: 'What our clients acquire',
        items: [
          'Vineyards, with or without a working cellar',
          'Arable land, eligible for EU support',
          'Farms with outbuildings, suitable for livestock',
          'Woodland and mixed-use estates',
          'Larger contiguous plots as an investment',
        ],
      },
      {
        type: 'steps',
        title: 'The process',
        items: [
          { n: '01', t: 'Consultation', b: 'We discuss your plans and the budget available.' },
          { n: '02', t: 'Recognition of qualification', b: 'We arrange recognition of your agricultural qualification in Hungary.' },
          { n: '03', t: 'Search', b: 'With our partners we look for land that meets the conditions.' },
          { n: '04', t: 'Permits', b: 'Applying for the permissions required to acquire land.' },
          { n: '05', t: 'Purchase', b: 'Bilingual contract, land registry registration, transfer of subsidy claims.' },
        ],
      },
      {
        type: 'callout',
        title: 'Important',
        body: 'The rules for acquiring agricultural land change from time to time and depend on your particular circumstances. What is written here is for information only. For a concrete plan, always consult us and a specialist lawyer.',
      },
      {
        type: 'cta',
        title: 'Looking for agricultural property',
        body: 'Tell us what you want; we also search beyond the properties we advertise.',
        primary: { label: 'Free property search', to: 'searchRequest' },
        secondary: { label: 'Our properties', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Buying in Hungary: the process step by step',
    metaDescription:
      'How a purchase in Hungary works for a foreign buyer: contract, deposit, land registry, utilities and the costs to expect.',
    eyebrow: 'For buyers',
    title: 'Buying in',
    titleEm: 'Hungary',
    intro:
      'The Hungarian purchase process is quite predictable once you know the steps. This guide walks you through them.',
    sections: [
      {
        type: 'steps',
        title: 'The process',
        items: [
          { n: '01', t: 'Selection', b: 'You choose from our properties, or place a free search request.' },
          { n: '02', t: 'Viewing', b: 'We organise the trip and the viewing, with an interpreter.' },
          { n: '03', t: 'Offer', b: 'We help you make a realistic offer and negotiate.' },
          { n: '04', t: 'Contract and deposit', b: 'A bilingual sale and purchase agreement, usually with a 10% deposit.' },
          { n: '05', t: 'Purchase price', b: 'The remaining purchase price by bank transfer, as set out in the contract.' },
          { n: '06', t: 'Handover', b: 'Land registry registration, utilities, handover of the keys.' },
        ],
      },
      {
        type: 'list',
        title: 'Costs on top of the purchase price',
        items: [
          'Transfer tax: the rate depends on the type of property and your situation',
          'Lawyer’s fees for drawing up and countersigning the deed',
          `Translation of the bilingual contract: ${from('hu')}, depending on the language combination`,
          'Land registry fees',
          'Any commission to FODEL: the seller pays this, not you',
        ],
      },
      {
        type: 'prose',
        title: 'You do not need to be there',
        paragraphs: [
          'Under a power of attorney we represent you at the signing, at the land registry and when the utilities are transferred. The purchase can therefore go ahead even if you cannot or do not want to travel.',
        ],
      },
      {
        type: 'callout',
        title: 'Energy certificate',
        body: 'Hungary requires an energy performance certificate, which under EU rules must also appear in the listing. In our listings you will find the rating under the features; “pending” means the certificate is still being prepared.',
      },
      {
        type: 'cta',
        title: 'Shall we begin',
        body: 'Browse the properties, or tell us what you are looking for. It costs you nothing.',
        primary: { label: 'Our properties', to: 'properties' },
        secondary: { label: 'Free property search', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Moving to Hungary: why people from the Netherlands take the step',
    metaDescription:
      'The four reasons why Dutch and Belgian buyers move to Hungary: value for money, space, lower living costs and location.',
    eyebrow: 'Background',
    title: 'Moving to',
    titleEm: 'Hungary',
    intro:
      'Many Dutch and Belgian people choose Hungary. In hundreds of conversations with our clients, the same four reasons come up again and again.',
    sections: [
      {
        type: 'prose',
        title: 'Value for money',
        paragraphs: [
          'Rural Hungarian property is among the best value in Europe. A 125 m² building plot in the Netherlands quickly costs €88,000 and a garage around €100,000. For the same money in the Hungarian countryside you can buy a spacious family home, often with a good amount of land.',
        ],
      },
      {
        type: 'prose',
        title: 'Space',
        paragraphs: [
          'The Netherlands has a population density of 482 people per km² with around 17 million inhabitants, and a considerable part of the country is water. The lack of space is not an abstract problem but an everyday experience, and the reason mentioned most often.',
        ],
      },
      {
        type: 'prose',
        title: 'Cost of living',
        paragraphs: [
          'A large share of our buyers are retired or nearly so. For them, the lower cost of living, the absence of a property tax and affordable healthcare together add up to a standard of living that the same pension would not provide in the Netherlands.',
        ],
      },
      {
        type: 'prose',
        title: 'Location',
        paragraphs: [
          'Since the flood disaster of 1953 the Netherlands has built an enormous system of flood defences. Concern about rising sea levels plays a part in many decisions: Hungary lies in the middle of the continent, above sea level.',
        ],
      },
      {
        type: 'cta',
        title: 'Time to explore',
        body: 'Browse our properties, or let us search for what you have in mind.',
        primary: { label: 'Our properties', to: 'properties' },
        secondary: { label: 'Buying in Hungary', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Photo guide for advertisers',
    metaDescription:
      'Good photos are the most important tool for a quick sale. The FODEL photo guide: light, orientation, resolution and the most common mistakes.',
    eyebrow: 'For sellers',
    title: 'Photo',
    titleEm: 'guide',
    intro:
      'Foreign prospects see the photos first, often only the photos. These rules do more than any listing text.',
    sections: photoGuideSections(L, {
      topTitle: 'The six most important rules',
      calloutTitle: 'Prefer to outsource it',
      calloutBody: (lines) =>
        `Bring in a professional. You can choose this with one click when you place your listing: ${lines.join('; ')}. Both are optional; one of our team will contact you to arrange a date.`,
      ctaTitle: 'Ready to list your property',
      primary: 'Place a listing',
      secondary: 'Prices',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
