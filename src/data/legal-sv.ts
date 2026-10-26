/**
 * Legal pages, Swedish (informal-standard "du"). A faithful translation of the Dutch pages
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

const L = 'sv' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 juli 2026';
const notice =
  'Detta är en översättning för din bekvämlighet. Vid avvikelser gäller det nederländska (i frågor enligt nederländsk rätt) eller det ungerska originalet.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_SV = {
  imprint: {
    metaTitle: 'Företagsinformation: uppgifter om bolaget',
    metaDescription: `Uppgifter om ${COMPANY.names.legal}: säte, momsregistreringsnummer, KvK-nummer och kontaktuppgifter.`,
    eyebrow: 'Företagsinformation',
    title: 'Uppgifter om',
    titleEm: 'företaget',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Uppgifter om tjänsteleverantören',
        rows: [
          ['Företagsnamn', COMPANY.names.legal],
          ['Säte', addressLine(COMPANY.address, L)],
          ['Momsregistreringsnummer', COMPANY.registration.vat],
          ['KvK-nummer (nederländska handelskammaren)', kvk],
          ['Företrädare', COMPANY.principal],
          ['E-post', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Grundat', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bankkonton',
        rows: [
          ['Nederländerna', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Ungern', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Tvister',
        body: 'Vid en konsumenttvist kan du också använda EU:s plattform för tvistlösning online: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Så hanterar vi personuppgifter',
    metaDescription:
      'Hur FODEL hanterar dina personuppgifter: vilka uppgifter vi behandlar, hur länge vi sparar dem och vilka rättigheter du har enligt GDPR.',
    eyebrow: 'Integritet',
    title: 'Så hanterar vi',
    titleEm: 'personuppgifter',
    intro:
      'Den här informationen beskriver hur vi hanterar de personuppgifter du lämnar via webbplatsen, i enlighet med GDPR.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Personuppgiftsansvarig',
        rows: [
          ['Ansvarig', COMPANY.names.legal],
          ['Adress', addressLine(COMPANY.address, L)],
          ['E-post', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Vilka uppgifter vi behandlar',
        intro: 'Endast de uppgifter du själv anger i våra formulär:',
        items: [
          'Namn, e-postadress och telefonnummer: så att vi kan besvara din förfrågan',
          'Ämnet och innehållet i ditt meddelande',
          'För en annons: uppgifter om fastigheten och dina faktureringsuppgifter',
          'För en sökförfrågan: dina sökkriterier',
          'För intern administration: när och vilket formulär du fyllde i och när du loggade in på portalen, utan att IP-adressen sparas',
        ],
      },
      {
        type: 'table',
        title: 'Rättslig grund och lagringstid',
        rows: [
          ['Kontakt och begäran om återuppringning', 'Samtycke (art. 6.1 a GDPR): 12 månader'],
          ['Annonsbeställning', 'Fullgörande av avtal (art. 6.1 b): 7 år, lagstadgad bokföringsskyldighet'],
          ['Sökförfrågan', 'Samtycke: tills ärendet är klart, högst 24 månader'],
          ['Intern aktivitetslogg', 'Berättigat intresse (art. 6.1 f): ordnad administration och upptäckt av missbruk: högst 24 månader'],
        ],
      },
      {
        type: 'list',
        title: 'Vilka vi delar uppgifter med',
        intro: 'Vi säljer inte dina uppgifter och delar dem inte i marknadsföringssyfte. Våra personuppgiftsbiträden är:',
        items: [
          'Vår e-postleverantör, med behandling inom EU',
          'Webbhotellet för den här webbplatsen',
          'Vid köp, och endast på din begäran: motparten och den inblandade advokaten',
        ],
      },
      {
        type: 'callout',
        title: 'Om annonser',
        body: 'Som annonsör kan du ge oss tillåtelse att visa ditt namn och telefonnummer i annonsen, så att intresserade kan kontakta dig direkt. Du kan när som helst återkalla tillåtelsen; då tar vi bort uppgifterna från annonsen.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Nyhetsbrev',
        body: 'Om du prenumererar på vårt nyhetsbrev behandlar vi din e-postadress, valt språk och tidpunkten för anmälan och bekräftelse, enbart för att skicka nyhetsbrevet, med stöd av ditt samtycke. Anmälan sker i två steg: vi skickar ingenting förrän du har klickat på knappen i bekräftelsemejlet. I varje mejl kan du avsluta prenumerationen med ett klick, och vi slutar direkt. Vi använder tjänsten Resend för utskicket.',
      },
      {
        type: 'list',
        title: 'Dina rättigheter',
        items: [
          'Tillgång till de uppgifter vi behandlar om dig',
          'Rättelse och radering',
          'Begränsning av eller invändning mot behandlingen',
          'Dataportabilitet',
          'Att när som helst återkalla ditt samtycke',
          'Att lämna klagomål till den nederländska dataskyddsmyndigheten (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt om integritet',
        paragraphs: [`Frågor eller begäranden kan du skicka till ${COMPANY.email.primary}. Vi svarar senast inom 30 dagar.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Information om cookies',
    metaDescription: `Vilka cookies ${SITE_HOST} använder och hur du ändrar ditt val.`,
    eyebrow: 'Cookies',
    title: 'Information om',
    titleEm: 'cookies',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'För närvarande använder webbplatsen endast tekniskt nödvändig lagring. Vi kör inga reklam- eller spårningsskript och delar ingenting med sociala medier.',
        ],
      },
      {
        type: 'table',
        title: 'Vad vi lagrar',
        rows: [
          [
            'fodel:consent',
            'Ditt val om cookies (godkänt eller avvisat). Sparas i din webbläsare och når inte oss. Lagringstid: 12 månader.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistik',
        paragraphs: [
          'Om vi någon gång för besöksstatistik slår vi bara på den med ditt föregående, uttryckliga samtycke. Att avböja begränsar inte din användning av webbplatsen på något sätt.',
        ],
      },
      {
        type: 'prose',
        title: 'Ändra ditt val',
        paragraphs: [
          'Du kan när som helst ändra ditt val genom att rensa sparade webbläsardata för den här webbplatsen; då visas cookiemeddelandet igen.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Allmänna villkor',
    metaDescription:
      'Villkoren för FODEL:s annons- och förmedlingstjänst: priser, provision, återkallelse och ansvar.',
    eyebrow: 'Villkor',
    title: 'Allmänna',
    titleEm: 'villkor',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Observera',
        body: 'Den här sidan är en sammanfattning. De fullständiga, bindande villkoren finns som PDF; vid avvikelser gäller PDF:en.',
      },
      {
        type: 'prose',
        title: '1. Tjänsten',
        paragraphs: [
          'FODEL annonserar ungerska fastigheter på sina egna flerspråkiga webbplatser och hjälper, enligt separat avtal, till med att genomföra försäljningen.',
          'Annonstjänsten innebär ingen ensamrätt: säljaren får även erbjuda och sälja fastigheten via andra kanaler.',
        ],
      },
      {
        type: 'list',
        title: '2. Lägga in en annons',
        ordered: true,
        items: [
          'Säljaren fyller i registreringsformuläret.',
          'FODEL skickar en betalningsbegäran för det valda paketet.',
          'Säljaren betalar via banköverföring.',
          'När betalningen har kommit in får säljaren rätt att ladda upp foton.',
          'FODEL sköter översättningen och publicerar annonsen.',
        ],
      },
      {
        type: 'table',
        title: '3. Priser',
        intro: `Alla priser inkluderar ${LISTING_VAT_PERCENT}\u00a0% nederländsk moms. Se sidan Priser för en fullständig översikt.`,
        rows: [
          [`Basannons (${cheap.months} månader)`, eur(cheap.priceEur, L)],
          [`Standardannons (${normal.months} månader)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Översättning', `${eur(extra('translation').priceEur, L)} per språk`],
          [
            'Framhävning',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} per månad (minst ${minMonths} månader)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Provision',
        paragraphs: [
          'Provision ska betalas endast när allt följande gäller: ett skriftligt köpeavtal, en köpare som presenterats av FODEL och en handpenning som har betalats.',
          `Provisionen är ${COMMISSION.percent}\u00a0% netto, minst ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nederländsk moms.`,
          'Om den intresserade kontaktar säljaren direkt och vår hjälp med genomförandet inte behövs, ska inget betalas utöver annonsavgiften.',
        ],
      },
      {
        type: 'prose',
        title: '5. Återkalla annonsen',
        paragraphs: [
          'Säljaren kan återkalla annonsen före slutdatumet. Redan betalda annonsavgifter återbetalas i så fall inte.',
        ],
      },
      {
        type: 'prose',
        title: '6. Ansvar',
        paragraphs: [
          'Säljaren ansvarar för att uppgifterna om fastigheten är korrekta. FODEL återger de lämnade uppgifterna och ansvarar inte för deras riktighet.',
          'Översättningarna på webbplatsen är informativa; vid tvist gäller den ungerska versionen.',
        ],
      },
      {
        type: 'prose',
        title: '7. Ångerrätt',
        paragraphs: [
          'En säljare som är konsument har lagstadgad ångerrätt vid distansavtal. Om säljaren uttryckligen begär omedelbart fullgörande minskar ångerrätten i proportion till den tjänst som redan har utförts.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Redogörelse för tillgänglighet',
    metaDescription: `Tillgänglighetsnivån för ${SITE_HOST}, standarden vi följer och hur du ger oss återkoppling.`,
    eyebrow: 'Tillgänglighet',
    title: 'Redogörelse för',
    titleEm: 'tillgänglighet',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Vi vill att webbplatsen ska kunna användas av alla, även besökare som använder skärmläsare, tangentbord eller förstoring.',
          'Vi bygger webbplatsen enligt WCAG 2.2 nivå AA. En stor del av våra besökare är pensionärer, så textstorlek, kontrast och tangentbordsstyrning prioriteras.',
        ],
      },
      {
        type: 'list',
        title: 'Vad som finns på plats',
        items: [
          'All text har ett kontrastförhållande på minst 4,5:1',
          'Full tangentbordsstyrning med synlig fokusmarkering',
          'En länk ”hoppa till innehållet” högst upp på varje sida',
          'Meningsfulla alternativtexter för alla bilder',
          'Formulärfält med kopplade etiketter och felmeddelanden i text',
          'Hänsyn till systeminställningen ”minska rörelse”',
          'Webbplatsen går att läsa och använda utan JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Kända begränsningar',
        paragraphs: ['Vi kan inte påverka tillgängligheten hos innehåll från tredje part, till exempel en karttjänst.'],
      },
      {
        type: 'prose',
        title: 'Återkoppling',
        paragraphs: [
          `Om du stöter på ett hinder, meddela oss på ${COMPANY.email.primary} eller per telefon. Vi åtgärdar anmälningar så snabbt vi kan.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
