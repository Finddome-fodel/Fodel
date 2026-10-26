/**
 * Legal pages, Danish (informal-standard "du"). A faithful translation of the Dutch pages
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

const L = 'da' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. juli 2026';
const notice =
  'Dette er en oversættelse af praktiske hensyn. Ved uoverensstemmelser har den hollandske (i spørgsmål efter hollandsk ret) eller den ungarske original forrang.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_DA = {
  imprint: {
    metaTitle: 'Kolofon: virksomhedsoplysninger',
    metaDescription: `Oplysninger om ${COMPANY.names.legal}: hjemstedsadresse, momsnummer, KvK-nummer og kontaktoplysninger.`,
    eyebrow: 'Kolofon',
    title: 'Oplysninger om',
    titleEm: 'virksomheden',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Oplysninger om tjenesteyderen',
        rows: [
          ['Virksomhedsnavn', COMPANY.names.legal],
          ['Hjemstedsadresse', addressLine(COMPANY.address, L)],
          ['Momsnummer', COMPANY.registration.vat],
          ['KvK-nummer (det hollandske handelskammer)', kvk],
          ['Repræsentant', COMPANY.principal],
          ['E-mail', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Grundlagt', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bankkonti',
        rows: [
          ['Nederlandene', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Ungarn', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Tvister',
        body: 'Ved en forbrugertvist kan du også bruge EU’s platform for onlinetvistbilæggelse: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Information om persondata',
    metaDescription:
      'Sådan behandler FODEL dine personoplysninger: hvilke oplysninger vi behandler, hvor længe vi opbevarer dem, og hvilke rettigheder du har efter GDPR.',
    eyebrow: 'Privatliv',
    title: 'Information om',
    titleEm: 'persondata',
    intro:
      'Denne information beskriver, hvordan vi behandler de personoplysninger, du giver os via dette websted, i overensstemmelse med GDPR.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Dataansvarlig',
        rows: [
          ['Dataansvarlig', COMPANY.names.legal],
          ['Adresse', addressLine(COMPANY.address, L)],
          ['E-mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Hvilke oplysninger vi behandler',
        intro: 'Kun de oplysninger, du selv indtaster i vores formularer:',
        items: [
          'Navn, e-mailadresse og telefonnummer: så vi kan besvare din henvendelse',
          'Emnet og indholdet af din besked',
          'Ved en annonce: oplysninger om ejendommen og dine faktureringsoplysninger',
          'Ved en søgeanmodning: dine søgekriterier',
          'Til intern administration: hvornår og hvilken formular du udfyldte, og hvornår du loggede ind på portalen, uden at IP-adressen gemmes',
        ],
      },
      {
        type: 'table',
        title: 'Retsgrundlag og opbevaringsperiode',
        rows: [
          ['Kontakt og anmodning om opringning', 'Samtykke (art. 6, stk. 1, litra a, i GDPR): 12 måneder'],
          ['Annoncebestilling', 'Opfyldelse af en kontrakt (art. 6, stk. 1, litra b): 7 år, lovpligtig opbevaring efter skattereglerne'],
          ['Søgeanmodning', 'Samtykke: indtil sagen er afsluttet, højst 24 måneder'],
          ['Intern aktivitetslog', 'Legitim interesse (art. 6, stk. 1, litra f): ordentlig administration og opdagelse af misbrug: højst 24 måneder'],
        ],
      },
      {
        type: 'list',
        title: 'Hvem vi deler oplysninger med',
        intro: 'Vi sælger ikke dine oplysninger og deler dem ikke til markedsføringsformål. Vores databehandlere er:',
        items: [
          'Vores e-mailudbyder med behandling inden for EU',
          'Hostingudbyderen af dette websted',
          'Ved køb, og kun efter din anmodning: modparten og den involverede advokat',
        ],
      },
      {
        type: 'callout',
        title: 'Om annoncer',
        body: 'Som annoncør kan du give os tilladelse til at vise dit navn og telefonnummer i annoncen, så interesserede kan kontakte dig direkte. Du kan til enhver tid trække tilladelsen tilbage; så fjerner vi oplysningerne fra annoncen.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Nyhedsbrev',
        body: 'Hvis du tilmelder dig vores nyhedsbrev, behandler vi din e-mailadresse, det valgte sprog og tidspunktet for tilmelding og bekræftelse, udelukkende for at sende dig nyhedsbrevet, på grundlag af dit samtykke. Tilmeldingen sker i to trin: vi sender intet, før du har klikket på knappen i bekræftelsesmailen. I hver mail kan du afmelde dig med ét klik, og vi stopper med det samme. Vi bruger tjenesten Resend til udsendelsen.',
      },
      {
        type: 'list',
        title: 'Dine rettigheder',
        items: [
          'Indsigt i de oplysninger, vi behandler om dig',
          'Berigtigelse og sletning',
          'Begrænsning af eller indsigelse mod behandlingen',
          'Dataportabilitet',
          'At trække dit samtykke tilbage når som helst',
          'At klage til den hollandske databeskyttelsesmyndighed (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt om databeskyttelse',
        paragraphs: [`Spørgsmål eller anmodninger kan du sende til ${COMPANY.email.primary}. Vi svarer senest inden for 30 dage.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Information om cookies',
    metaDescription: `Hvilke cookies ${SITE_HOST} bruger, og hvordan du ændrer dit valg.`,
    eyebrow: 'Cookies',
    title: 'Information om',
    titleEm: 'cookies',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'I øjeblikket bruger webstedet kun teknisk nødvendig lagring. Vi kører ingen reklame- eller sporingsscripts og deler intet med sociale medier.',
        ],
      },
      {
        type: 'table',
        title: 'Hvad vi gemmer',
        rows: [
          [
            'fodel:consent',
            'Dit valg om cookies (accepteret eller afvist). Gemmes i din browser og når ikke frem til os. Opbevaring: 12 måneder.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistik',
        paragraphs: [
          'Hvis vi nogensinde fører besøgsstatistik, slår vi den kun til med dit forudgående, udtrykkelige samtykke. Et afslag begrænser ikke din brug af webstedet på nogen måde.',
        ],
      },
      {
        type: 'prose',
        title: 'Ændre dit valg',
        paragraphs: [
          'Du kan til enhver tid ændre dit valg ved at slette de gemte browserdata for dette websted; så vises cookiemeddelelsen igen.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Generelle betingelser',
    metaDescription:
      'Betingelserne for FODEL’s annonce- og formidlingsservice: priser, salær, tilbagetrækning og ansvar.',
    eyebrow: 'Betingelser',
    title: 'Generelle',
    titleEm: 'betingelser',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Bemærk',
        body: 'Denne side er et resumé. De fulde, bindende betingelser findes som PDF; ved uoverensstemmelser har PDF’en forrang.',
      },
      {
        type: 'prose',
        title: '1. Tjenesten',
        paragraphs: [
          'FODEL annoncerer ungarske ejendomme på sine egne flersprogede websteder og bistår efter særskilt aftale med at gennemføre salget.',
          'Annonceservicen indebærer ingen eneret: sælger kan også udbyde og sælge ejendommen via andre kanaler.',
        ],
      },
      {
        type: 'list',
        title: '2. Indrykning af en annonce',
        ordered: true,
        items: [
          'Sælger udfylder tilmeldingsformularen.',
          'FODEL sender en betalingsanmodning for den valgte pakke.',
          'Sælger betaler via bankoverførsel.',
          'Når betalingen er modtaget, får sælger ret til at uploade fotos.',
          'FODEL står for oversættelsen og offentliggør annoncen.',
        ],
      },
      {
        type: 'table',
        title: '3. Priser',
        intro: `Alle priser er inklusive ${LISTING_VAT_PERCENT}\u00a0% hollandsk moms. Se siden Priser for det fulde overblik.`,
        rows: [
          [`Basisannonce (${cheap.months} måneder)`, eur(cheap.priceEur, L)],
          [`Standardannonce (${normal.months} måneder)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Oversættelse', `${eur(extra('translation').priceEur, L)} pr. sprog`],
          [
            'Fremhævning',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} pr. måned (min. ${minMonths} måneder)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Salær',
        paragraphs: [
          'Salær forfalder kun, når alt følgende er opfyldt: en skriftlig købsaftale, en køber formidlet af FODEL og et betalt depositum.',
          `Salæret er ${COMMISSION.percent}\u00a0% netto, dog mindst ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% hollandsk moms.`,
          'Hvis den interesserede kontakter sælger direkte, og vores hjælp til gennemførelsen ikke er nødvendig, skal der ikke betales andet end annoncegebyret.',
        ],
      },
      {
        type: 'prose',
        title: '5. Tilbagetrækning af annoncen',
        paragraphs: [
          'Sælger kan trække annoncen tilbage før udløbsdatoen. Allerede betalte annoncegebyrer refunderes i så fald ikke.',
        ],
      },
      {
        type: 'prose',
        title: '6. Ansvar',
        paragraphs: [
          'Sælger er ansvarlig for, at oplysningerne om ejendommen er korrekte. FODEL gengiver de leverede oplysninger og påtager sig intet ansvar for deres rigtighed.',
          'Oversættelserne på webstedet er vejledende; ved tvist har den ungarske version forrang.',
        ],
      },
      {
        type: 'prose',
        title: '7. Fortrydelsesret',
        paragraphs: [
          'En sælger, der er forbruger, har lovbestemt fortrydelsesret ved fjernsalgsaftaler. Hvis sælger udtrykkeligt anmoder om øjeblikkelig levering, reduceres fortrydelsesretten forholdsmæssigt i forhold til den allerede leverede ydelse.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Erklæring om tilgængelighed',
    metaDescription: `Tilgængelighedsniveauet for ${SITE_HOST}, den standard vi følger, og hvordan du giver os feedback.`,
    eyebrow: 'Tilgængelighed',
    title: 'Erklæring om',
    titleEm: 'tilgængelighed',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Vi ønsker, at webstedet kan bruges af alle, også besøgende, der bruger skærmlæser, tastatur eller forstørrelse.',
          'Vi bygger webstedet efter WCAG 2.2 niveau AA. En betydelig del af vores besøgende er pensionister, så tekststørrelse, kontrast og tastaturbetjening har høj prioritet.',
        ],
      },
      {
        type: 'list',
        title: 'Hvad der er på plads',
        items: [
          'Al tekst har et kontrastforhold på mindst 4,5:1',
          'Fuld tastaturbetjening med synlig fokusmarkering',
          'Et link “spring til indhold” øverst på hver side',
          'Meningsfulde alternative tekster til alle billeder',
          'Formularfelter med tilknyttede etiketter og fejlmeddelelser i tekst',
          'Respekt for systemindstillingen “reducer bevægelse”',
          'Webstedet kan læses og bruges uden JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Kendte begrænsninger',
        paragraphs: ['Vi har ingen indflydelse på tilgængeligheden af indhold fra tredjeparter, f.eks. en korttjeneste.'],
      },
      {
        type: 'prose',
        title: 'Feedback',
        paragraphs: [
          `Hvis du støder på en barriere, så giv os besked på ${COMPANY.email.primary} eller pr. telefon. Vi løser henvendelser så hurtigt som muligt.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
