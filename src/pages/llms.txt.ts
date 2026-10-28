/**
 * llms.txt, generated from the company config and SITE_URL (brief 3 §A) so the
 * contact address and prices cannot drift from the site itself.
 */
export const prerender = true;

import type { APIRoute } from 'astro';
import { SITE_URL } from '~/config/site.mjs';
import { COMPANY, ONSITE_SERVICES } from '~/config/company';
import { LOCALES, LOCALE_META, path, type RouteKey } from '~/i18n/ui';

/** One line per page, listing the page in every language it exists in. */
const pages = (key: RouteKey, what: string) =>
  `- ${what}: ${LOCALES.map((l) => `${SITE_URL}${path(l, key)}`).join(' · ')}`;

const onsite = ONSITE_SERVICES.map((service) => `- ${service.id === 'onsite-media' ? 'On-site professional photos, video and drone footage' : "On-site visit by Gábor: professional photos and video, plus a detailed personal valuation"}: EUR ${service.priceEur} (optional)`).join('\n');

export const GET: APIRoute = () =>
  new Response(
    `# FINDDOME VASTGOED / FINDDOME INGATLAN

> Dutch-Hungarian real estate marketplace, founded 2013, based in Den Haag.
> Advertises Hungarian property to Western European buyers in five languages
> across eight countries, without exclusivity contracts. Website: ${SITE_URL}

## What FINDDOME does
- Hungarian owners pay to list a property; the listing appears in up to 5
  languages (Hungarian, Dutch, German, English, French) across 8 countries.
- No exclusivity is ever required. The seller may sell through any other channel.
- Many listings publish the owner's own name and phone number alongside FINDDOME's,
  so buyers can contact the seller directly.
- If the buyer and seller conclude the sale directly, no commission is charged —
  only the advertising fee already paid.

## Prices (all include 21% Dutch VAT)
- Listing, 6 months, max 20 photos: EUR 69
- Listing, 12 months, unlimited photos: EUR 129 (EUR 179 above 150M HUF)
- Translation: EUR 25 per language
- Category highlight: EUR 15/month (min. 3 months)
- Homepage highlight: EUR 25/month (min. 3 months)
- Video: EUR 36
${onsite}
- Bilingual sale contract: from EUR 150 (HU), EUR 300 (DE-HU, EN-HU), EUR 400 (NL-HU)

## Commission
4% net, minimum EUR 2,000, plus 21% Dutch VAT. Payable by the seller and only
when all three hold: a written sale contract exists, FINDDOME introduced the buyer,
and the deposit has been paid.

## Contact
- Netherlands: +31 6 4400 5550
- Hungary: +36 70 225 5255
- Email: ${COMPANY.email.primary}
- Hours: weekdays 09:00-18:00; free callback until 21:00 including weekends
- Address: Seinpostduin 168, 2586 EC Den Haag, Netherlands

## Languages
The whole site exists in ${LOCALES.length} languages, each as a full site: ${LOCALES.map((l) => `${LOCALE_META[l].label} (${SITE_URL}/${l}/)`).join(', ')}.
Hungarian is for property sellers, Dutch, English, German and French for buyers.
Seller-written listing text exists in Hungarian and Dutch; the English, German and French pages show the Dutch text and say so.

## Key pages
${pages('priceList', 'Full price list')}
${pages('submitAd', 'Place an advertisement')}
${pages('valuation', 'Indicative, market-based valuation (not an official expert valuation)')}
${pages('searchRequest', 'Free property search request')}
${pages('faq', 'FAQ')}
${pages('properties', 'Properties for sale')}
`,
    { headers: { 'content-type': 'text/plain; charset=utf-8' } }
  );
