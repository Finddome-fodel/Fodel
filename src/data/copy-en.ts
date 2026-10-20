/**
 * Page copy, English (British).
 *
 * Written for buyers and sellers in the UK, Ireland and the rest of the
 * English-speaking market, from the same facts as the Hungarian and Dutch
 * copy: the figures come from src/config/company.ts, never from this file.
 * Type-checked against the Hungarian copy, so a missing key fails the build.
 */

import { COMPANY, COMMISSION, formatHours, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'en' as const;

export const EN = {
  home: {
    meta: {
      title: 'FODEL Real Estates | Buy property in Hungary direct from the owner',
      description:
        'Houses, farms and country estates in Hungary, often direct from the owner. Guidance in your own language and bilingual sale contracts.',
    },
    hero: {
      eyebrow: `Since 2013 · ${foundedInLabel(L)}`,
      title: ['Property', 'in Hungary', 'direct from the owner'],
      emphasis: 1,
      body: 'Many of our listings name the owner. You can negotiate directly with them, or leave the whole process to us.',
      primary: 'Browse properties',
      secondary: 'Free property search',
      featuredLabel: 'Featured',
    },
    audiences: [
      {
        eyebrow: 'For buyers',
        title: 'Property direct\nfrom the owner',
        body: 'Authentic Hungarian houses, farms, country estates and vineyards. Contact the owner directly, or let FODEL handle the whole process.',
        cta: 'Browse properties',
        to: 'properties',
      },
      {
        eyebrow: 'For sellers',
        title: 'Your Hungarian property\nin Western Europe',
        body: `Advertise in ${REACH_LANGUAGES} languages in ${REACH_COUNTRIES} countries, with no exclusivity contract. Commission only when we bring the buyer.`,
        cta: 'Learn more',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Selection', title: 'Featured properties' },
    quote: '“People from the Netherlands often can’t believe their eyes when they see what you can buy in Hungary, and for how much.”',
    quoteSource: `${BRAND.en.name} · ${SITE_HOST}`,
    how: { eyebrow: 'How it works', title: 'How FODEL works' },
    cta: {
      eyebrow: 'Get in touch',
      title: 'We will gladly',
      titleEm: 'call you back',
      body: `${formatHours(L)} · A callback costs you nothing.`,
    },
    referral: {
      eyebrow: 'Referral programme',
      title: 'Recommend an advertiser,',
      titleEm: 'receive 10%',
      body: 'If someone places a listing with FODEL on your recommendation, they get 10% off their package and we credit 10% against your next listing. Already advertising with us? You will find your own referral code under Settings in the portal.',
      steps: [
        'Recommend an acquaintance with the form below, or share your own link from the portal',
        'One of our team gets in touch with them',
        'If they place a listing, they save 10% and we credit you 10%',
      ],
      formTitle: 'Recommend an acquaintance',
      fields: {
        referrerName: 'Your name',
        referrerEmail: 'Your email address',
        referredName: 'Name of the person you recommend',
        referredEmail: 'Email address of the person you recommend',
      },
      submit: 'Send recommendation',
    },
  },

  steps: [
    {
      num: '01',
      title: `Listed in ${REACH_COUNTRIES} countries`,
      body: `We advertise in ${REACH_LANGUAGES} languages in the Netherlands, Belgium, Germany, England and other EU countries, with no exclusivity contract with the seller.`,
    },
    {
      num: '02',
      title: 'Direct contact',
      body: 'Many listings show the owner’s name and number alongside our details. If you arrange it between yourselves, nobody pays commission.',
    },
    {
      num: '03',
      title: 'The whole process handled',
      body: 'A bilingual sale and purchase agreement, representation under power of attorney, registration at the land registry and the transfer of utilities.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Founded' },
    { value: String(REACH_COUNTRIES), label: 'Countries' },
    { value: String(REACH_LANGUAGES), label: 'Languages' },
    { value: `${COMMISSION.percent}%`, label: 'Commission' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'For sellers | Your Hungarian property in Western Europe',
      description: `Advertise your Hungarian property in ${REACH_LANGUAGES} languages in ${REACH_COUNTRIES} countries, from ${eur(69, L)} and with no exclusivity. Commission only if FODEL brings the buyer: ${COMMISSION.percent}% + ${COMMISSION.vatPercent}% VAT.`,
    },
    hero: {
      eyebrow: 'For sellers',
      title: 'Your property',
      titleEm: 'in Western Europe',
      body: `With the FODEL model your property appears in ${REACH_LANGUAGES} languages in ${REACH_COUNTRIES} countries, with no exclusivity contract. We work only with serious buyers.`,
      cta: 'Place a listing',
      secondary: 'View prices',
    },
    benefits: {
      eyebrow: 'The benefits',
      title: 'What a foreign buyer brings',
      points: [
        'Buyers with their own funds: no waiting for a mortgage or a subsidy.',
        'Payment in one go by bank transfer, quick and safe.',
        'Serious intent: a single viewing costs them two days and €200–300.',
        'Realistic pricing: no unreasonable haggling.',
        'FODEL assesses each buyer personally before any appointment is made.',
      ],
    },
    personas: {
      eyebrow: 'The buyers',
      title: 'Who our buyers are',
      items: [
        {
          title: 'Retirees',
          body: 'Looking for lower living costs, tax advantages and affordable healthcare in Hungary.',
        },
        {
          title: 'Families',
          body: 'Looking for space, nature and country living. Often a farm, farmstead or holiday home.',
        },
        {
          title: 'Investors',
          body: 'Looking for commercial property, vineyards and agricultural land.',
        },
        {
          title: 'Lifestyle emigrants',
          body: 'Leaving high living costs and crowds behind, in search of an authentic European way of life.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Step by step', title: 'The FODEL model' },
    commission: {
      eyebrow: 'Prices',
      title: 'Commission only on\na successful sale',
      body: `If the buyer contacts you directly and you do not need our help, you pay nothing on top of the listing fee. If FODEL does broker the sale: ${COMMISSION.percent}% net (min. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}% Dutch VAT.`,
      cta: 'View prices',
    },
  },

  buyers: {
    meta: {
      title: 'For buyers | Buying a property in Hungary',
      description:
        'How to buy a property in Hungary safely: a bilingual contract, representation under power of attorney and registration at the land registry. Plus a free search service.',
    },
    hero: {
      eyebrow: 'For buyers',
      title: 'Buying in Hungary,',
      titleEm: 'without surprises',
      body: 'Many of our listings name the owner. You can negotiate directly, or leave the whole process to us.',
      cta: 'Browse properties',
      secondary: 'Free property search',
    },
    services: {
      eyebrow: 'What we handle',
      title: 'Full support',
      points: [
        'Communication between you and the seller, including interpreters.',
        'Viewings, with a colleague who speaks your language.',
        'Support with the price negotiation and with drawing up the bilingual contract.',
        'Representation under power of attorney: you do not need to travel to Hungary to sign.',
        'Registration at the land registry and the transfer of utilities.',
      ],
    },
    reasons: {
      eyebrow: 'Why Hungary',
      title: 'What Western European buyers look for',
    },
  },

  about: {
    meta: {
      title: 'About us | A bridge between two worlds',
      description:
        'Since 2013 we have brought Hungarian sellers and Western European buyers together. Discreet, transparent and with no exclusivity contract.',
    },
    hero: {
      eyebrow: 'About us',
      title: 'A bridge between',
      titleEm: 'two worlds',
      body: 'Since 2013 we have helped Hungarian sellers find the right foreign buyer: discreetly, effectively and without an exclusivity contract.',
    },
    origin: {
      eyebrow: 'The beginning · Almere-Buiten, 2013',
      quote:
        '“Living in Almere-Buiten, we saw how much Dutch people long for an authentic European way of life, while in Hungary the finest properties wait unnoticed for an owner.”',
    },
    values: {
      eyebrow: 'What we stand for',
      title: 'What we build on',
      items: [
        {
          num: '01',
          title: 'Discretion',
          body: 'We handle sellers’ and buyers’ details with the greatest possible care. Personal details appear only with consent.',
        },
        {
          num: '02',
          title: 'Transparency',
          body: 'No hidden costs. Our prices and commission are published on this site, and we keep you informed at every step.',
        },
        {
          num: '03',
          title: 'Bilingual expertise',
          body: 'We know both markets from the inside. Our team speaks Dutch, German, English, French and Hungarian.',
        },
      ],
    },
    approach: {
      eyebrow: 'Our approach',
      title: 'We are not a big office.',
      titleEm: 'That is our strength.',
      points: [
        'Every client gets personal contact: no call centre, no anonymous counter.',
        'We know both cultures from the inside and judge property through Dutch and Hungarian eyes alike.',
        'Bringing property and buyer together is our responsibility, not a matter of chance.',
        'We work without exclusivity because we would rather convince with results.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'The bridge we',
      titleEm: 'have built',
      paragraphs: [
        'FODEL was founded by Hungarians living in the Netherlands. We started in Almere-Buiten in 2013, where we noticed how many Dutch and Belgian people wanted to buy an authentic Hungarian home but did not know where to begin.',
        `Today we advertise in ${REACH_COUNTRIES} countries and ${REACH_LANGUAGES} languages, and guide every transaction from start to finish: a bilingual sale contract, representation under power of attorney and registration at the land registry. Our office is in The Hague.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Contact | We will gladly call you back',
      description: `Call us on weekdays between ${COMPANY.hours.weekdays.from} and ${COMPANY.hours.weekdays.to}, or ask for a callback. The call costs you nothing.`,
    },
    hero: { eyebrow: 'Contact', title: 'We will gladly', titleEm: 'call you back' },
    formTitle: 'Ask for a callback',
    subjects: [
      'Question about a property',
      'Advertising a property',
      'Request prices',
      'Callback request',
      'Other',
    ],
    note: `A callback costs you nothing: we pay for the call. We call back until ${COMPANY.hours.callback.to}, weekends included.`,
  },
} satisfies CopyShape;
