/**
 * Legal pages, English (British). A faithful translation of the Dutch pages
 * (src/data/pages-legal.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. It needs the client's and a lawyer's sign-off before
 * launch, like the Hungarian and Dutch originals. Every sentence that leans on
 * Dutch or Hungarian law (GDPR roles, Dutch VAT, the Dutch regulator, the
 * right of withdrawal, the ODR platform) is listed in Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'en' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 July 2026';
const notice =
  'This is a translation for convenience. In case of differences, the Dutch (for Dutch law matters) or Hungarian original prevails.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_EN = {
  imprint: {
    metaTitle: 'Imprint: company details',
    metaDescription: `Company details of ${COMPANY.names.legal}: registered address, VAT number, KvK number and contact details.`,
    eyebrow: 'Imprint',
    title: 'Company details',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Details of the service provider',
        rows: [
          ['Company name', COMPANY.names.legal],
          ['Registered address', addressLine(COMPANY.address, L)],
          ['VAT number', COMPANY.registration.vat],
          ['KvK number (Dutch Chamber of Commerce)', kvk],
          ['Representative', COMPANY.principal],
          ['Email', COMPANY.email.primary],
          ['Phone', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Founded', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bank accounts',
        rows: [
          ['Netherlands', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Hungary', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Disputes',
        body: 'In a consumer dispute you can also use the European ODR platform: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Privacy notice',
    metaDescription:
      'How FODEL handles your personal data: which data we process, how long we keep it and which rights you have under the GDPR.',
    eyebrow: 'Privacy',
    title: 'Privacy',
    titleEm: 'notice',
    intro:
      'This notice describes how we handle the personal data you give us through this website, in line with the GDPR.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Data controller',
        rows: [
          ['Controller', COMPANY.names.legal],
          ['Address', addressLine(COMPANY.address, L)],
          ['Email', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'What data we process',
        intro: 'Only the data you enter yourself in our forms:',
        items: [
          'Name, email address and phone number: so that we can answer your enquiry',
          'The subject and content of your message',
          'For a listing: the details of the property and your invoicing details',
          'For a search request: your search criteria',
          'For internal administration: when and which form you filled in, and when you signed in to the portal, without storing an IP address',
        ],
      },
      {
        type: 'table',
        title: 'Legal basis and retention period',
        rows: [
          ['Contact and callback request', 'Consent (Art. 6(1)(a) GDPR): 12 months'],
          ['Listing order', 'Performance of a contract (Art. 6(1)(b)): 7 years, statutory tax retention'],
          ['Search request', 'Consent: until completed, 24 months at most'],
          ['Internal activity log', 'Legitimate interest (Art. 6(1)(f)): orderly administration and detection of misuse: 24 months at most'],
        ],
      },
      {
        type: 'list',
        title: 'Who we share data with',
        intro: 'We do not sell your data and do not share it for marketing purposes. Our processors are:',
        items: [
          'Our email provider, with processing within the EU',
          'The hosting provider of this website',
          'When you buy, and only at your request: the other party and the lawyer involved',
        ],
      },
      {
        type: 'callout',
        title: 'About listings',
        body: 'As an advertiser you can give us permission to show your name and phone number with the listing, so that interested people can contact you directly. You can withdraw that permission at any time; we then remove the details from the listing.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Newsletter',
        body: 'If you subscribe to our newsletter, we process your email address, the chosen language and the time of subscription and confirmation, solely to send you the newsletter, on the basis of your consent. Subscription takes two steps: we send nothing until you have clicked the button in the confirmation email. In every email you can unsubscribe with one click, and we stop at once. We use the Resend service to send it.',
      },
      {
        type: 'list',
        title: 'Your rights',
        items: [
          'Access to the data we process about you',
          'Rectification and erasure',
          'Restriction of, or objection to, the processing',
          'Data portability',
          'Withdrawing your consent at any time',
          'Lodging a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Contact about privacy',
        paragraphs: [`You can send questions or requests to ${COMPANY.email.primary}. We reply within 30 days at the latest.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Cookie notice',
    metaDescription: `Which cookies ${SITE_HOST} uses and how to change your choice.`,
    eyebrow: 'Cookies',
    title: 'Cookie',
    titleEm: 'notice',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'At the moment this website uses only technically necessary storage. We run no advertising or tracking scripts and share nothing with social platforms.',
        ],
      },
      {
        type: 'table',
        title: 'What we store',
        rows: [
          [
            'fodel:consent',
            'Your choice about cookies (accepted or rejected). Kept in your browser and does not reach us. Retention: 12 months.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistics',
        paragraphs: [
          'If we ever keep visitor statistics, we will switch them on only with your prior, explicit consent. Declining does not limit your use of the site in any way.',
        ],
      },
      {
        type: 'prose',
        title: 'Changing your choice',
        paragraphs: [
          'You can change your choice at any time by clearing the stored browser data for this site; the cookie notice then appears again.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Terms and conditions',
    metaDescription:
      'The terms of FODEL’s advertising and brokerage service: prices, commission, withdrawal and liability.',
    eyebrow: 'Terms',
    title: 'Terms and',
    titleEm: 'conditions',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Please note',
        body: 'This page is a summary. The full, binding terms are available as a PDF; if they differ, the PDF prevails.',
      },
      {
        type: 'prose',
        title: '1. The service',
        paragraphs: [
          'FODEL advertises Hungarian property on its own multilingual websites and, under a separate agreement, assists with completing the sale.',
          'The advertising service carries no exclusivity: the seller may also offer and sell the property through other channels.',
        ],
      },
      {
        type: 'list',
        title: '2. Placing a listing',
        ordered: true,
        items: [
          'The seller fills in the registration form.',
          'FODEL sends a payment request for the chosen package.',
          'The seller pays by bank transfer.',
          'On receipt, the seller is given the right to upload photos.',
          'FODEL handles the translation and publishes the listing.',
        ],
      },
      {
        type: 'table',
        title: '3. Prices',
        intro: `All prices include ${LISTING_VAT_PERCENT}% Dutch VAT. See the Prices page for the full overview.`,
        rows: [
          [`Economy listing (${cheap.months} months)`, eur(cheap.priceEur, L)],
          [`Standard listing (${normal.months} months)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Translation', `${eur(extra('translation').priceEur, L)} per language`],
          [
            'Highlighting',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} per month (min. ${minMonths} months)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Commission',
        paragraphs: [
          'Commission is due only when all of the following apply: a written sale and purchase agreement, a buyer introduced by FODEL, and a deposit that has been paid.',
          `The commission is ${COMMISSION.percent}% net with a minimum of ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}% Dutch VAT.`,
          'If the interested party contacts the seller directly and our help with completion is not needed, nothing is due beyond the listing fee.',
        ],
      },
      {
        type: 'prose',
        title: '5. Withdrawing the listing',
        paragraphs: [
          'The seller can withdraw the listing before the expiry date. Listing fees already paid are not refunded in that case.',
        ],
      },
      {
        type: 'prose',
        title: '6. Liability',
        paragraphs: [
          'The seller is responsible for the accuracy of the details about the property. FODEL reproduces the details supplied and accepts no liability for their accuracy.',
          'Translations on this website are for information; in a dispute the Hungarian version prevails.',
        ],
      },
      {
        type: 'prose',
        title: '7. Right of withdrawal',
        paragraphs: [
          'A seller who is a consumer has the statutory right of withdrawal for distance contracts. If the seller expressly asks for immediate performance, the right of withdrawal reduces in proportion to the service already provided.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Accessibility statement',
    metaDescription: `The accessibility level of ${SITE_HOST}, the standard we follow and how to reach us with feedback.`,
    eyebrow: 'Accessibility',
    title: 'Accessibility',
    titleEm: 'statement',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'We want this website to be usable by everyone, including visitors who use a screen reader, the keyboard or magnification.',
          'We build the site to WCAG 2.2 level AA. A considerable share of our visitors are retired, so text size, contrast and keyboard operation take priority.',
        ],
      },
      {
        type: 'list',
        title: 'What is in place',
        items: [
          'All text has a contrast ratio of at least 4.5:1',
          'Full keyboard operation with visible focus indication',
          'A “skip to content” link at the top of every page',
          'Meaningful alt texts for all images',
          'Form fields with linked labels and error messages in text',
          'Respect for the system setting “reduce motion”',
          'The site is readable and usable without JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Known limitations',
        paragraphs: ['We have no influence over the accessibility of third-party content, such as a map service.'],
      },
      {
        type: 'prose',
        title: 'Feedback',
        paragraphs: [
          `If you run into a barrier, let us know at ${COMPANY.email.primary} or by phone. We resolve reports as quickly as we can.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
