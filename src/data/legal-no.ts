/**
 * Legal pages, Norwegian Bokmål (informal-standard "du"). A faithful translation of the Dutch pages
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

const L = 'no' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. juli 2026';
const notice =
  'Dette er en oversettelse for enkelhets skyld. Ved avvik gjelder den nederlandske (i spørsmål etter nederlandsk rett) eller den ungarske originalen.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_NO = {
  imprint: {
    metaTitle: 'Om oss: firmaopplysninger',
    metaDescription: `Opplysninger om ${COMPANY.names.legal}: forretningsadresse, mva-nummer, KvK-nummer og kontaktopplysninger.`,
    eyebrow: 'Om oss',
    title: 'Opplysninger om',
    titleEm: 'firmaet',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Opplysninger om tjenesteleverandøren',
        rows: [
          ['Foretaksnavn', COMPANY.names.legal],
          ['Forretningsadresse', addressLine(COMPANY.address, L)],
          ['Mva-nummer', COMPANY.registration.vat],
          ['KvK-nummer (det nederlandske handelskammeret)', kvk],
          ['Representant', COMPANY.principal],
          ['E-post', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Grunnlagt', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bankkontoer',
        rows: [
          ['Nederland', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Ungarn', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Tvister',
        body: 'Ved en forbrukertvist kan du også bruke EUs plattform for nettbasert tvisteløsning: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Informasjon om personvern',
    metaDescription:
      'Slik behandler FODEL personopplysningene dine: hvilke opplysninger vi behandler, hvor lenge vi lagrer dem, og hvilke rettigheter du har etter GDPR.',
    eyebrow: 'Personvern',
    title: 'Informasjon om',
    titleEm: 'personvern',
    intro:
      'Denne informasjonen beskriver hvordan vi behandler personopplysningene du gir oss via dette nettstedet, i samsvar med GDPR.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Behandlingsansvarlig',
        rows: [
          ['Behandlingsansvarlig', COMPANY.names.legal],
          ['Adresse', addressLine(COMPANY.address, L)],
          ['E-post', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Hvilke opplysninger vi behandler',
        intro: 'Bare opplysningene du selv fyller inn i skjemaene våre:',
        items: [
          'Navn, e-postadresse og telefonnummer: slik at vi kan svare på henvendelsen din',
          'Emnet og innholdet i meldingen din',
          'For en annonse: opplysninger om eiendommen og faktureringsopplysningene dine',
          'For en søkeforespørsel: søkekriteriene dine',
          'For intern administrasjon: når og hvilket skjema du fylte ut, og når du logget inn på portalen, uten at IP-adressen lagres',
        ],
      },
      {
        type: 'table',
        title: 'Rettslig grunnlag og lagringstid',
        rows: [
          ['Kontakt og forespørsel om oppringing', 'Samtykke (GDPR art. 6 nr. 1 bokstav a): 12 måneder'],
          ['Annonsebestilling', 'Oppfyllelse av avtale (art. 6 nr. 1 bokstav b): 7 år, lovpålagt oppbevaring etter skatteregler'],
          ['Søkeforespørsel', 'Samtykke: til saken er avsluttet, høyst 24 måneder'],
          ['Intern aktivitetslogg', 'Berettiget interesse (art. 6 nr. 1 bokstav f): ryddig administrasjon og avdekking av misbruk: høyst 24 måneder'],
        ],
      },
      {
        type: 'list',
        title: 'Hvem vi deler opplysninger med',
        intro: 'Vi selger ikke opplysningene dine og deler dem ikke for markedsføringsformål. Databehandlerne våre er:',
        items: [
          'E-postleverandøren vår, med behandling innenfor EU',
          'Vertsleverandøren for dette nettstedet',
          'Ved kjøp, og bare etter ditt ønske: motparten og advokaten som er involvert',
        ],
      },
      {
        type: 'callout',
        title: 'Om annonser',
        body: 'Som annonsør kan du gi oss tillatelse til å vise navnet og telefonnummeret ditt i annonsen, slik at interesserte kan kontakte deg direkte. Du kan når som helst trekke tillatelsen tilbake; da fjerner vi opplysningene fra annonsen.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Nyhetsbrev',
        body: 'Hvis du abonnerer på nyhetsbrevet vårt, behandler vi e-postadressen din, valgt språk og tidspunktet for påmelding og bekreftelse, utelukkende for å sende deg nyhetsbrevet, på grunnlag av samtykket ditt. Påmeldingen skjer i to trinn: vi sender ingenting før du har klikket på knappen i bekreftelsesmeldingen. I hver e-post kan du melde deg av med ett klikk, og vi stopper umiddelbart. Vi bruker tjenesten Resend til utsendelsen.',
      },
      {
        type: 'list',
        title: 'Dine rettigheter',
        items: [
          'Innsyn i opplysningene vi behandler om deg',
          'Retting og sletting',
          'Begrensning av eller innsigelse mot behandlingen',
          'Dataportabilitet',
          'Å trekke tilbake samtykket ditt når som helst',
          'Å klage til det nederlandske datatilsynet (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt om personvern',
        paragraphs: [`Spørsmål eller forespørsler kan du sende til ${COMPANY.email.primary}. Vi svarer senest innen 30 dager.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Informasjon om informasjonskapsler',
    metaDescription: `Hvilke informasjonskapsler ${SITE_HOST} bruker, og hvordan du endrer valget ditt.`,
    eyebrow: 'Informasjonskapsler',
    title: 'Informasjon om',
    titleEm: 'informasjonskapsler',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'For øyeblikket bruker nettstedet bare teknisk nødvendig lagring. Vi kjører ingen reklame- eller sporingsskript og deler ingenting med sosiale medier.',
        ],
      },
      {
        type: 'table',
        title: 'Hva vi lagrer',
        rows: [
          [
            'fodel:consent',
            'Valget ditt om informasjonskapsler (godtatt eller avvist). Lagres i nettleseren din og når ikke fram til oss. Lagringstid: 12 måneder.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistikk',
        paragraphs: [
          'Hvis vi noen gang fører besøksstatistikk, slår vi den bare på med ditt forutgående, uttrykkelige samtykke. Å avslå begrenser ikke bruken av nettstedet på noen måte.',
        ],
      },
      {
        type: 'prose',
        title: 'Endre valget ditt',
        paragraphs: [
          'Du kan når som helst endre valget ditt ved å slette lagrede nettleserdata for dette nettstedet; da vises varselet om informasjonskapsler igjen.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Generelle vilkår',
    metaDescription:
      'Vilkårene for FODELs annonse- og formidlingstjeneste: priser, provisjon, tilbaketrekking og ansvar.',
    eyebrow: 'Vilkår',
    title: 'Generelle',
    titleEm: 'vilkår',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Merk',
        body: 'Denne siden er et sammendrag. De fullstendige, bindende vilkårene finnes som PDF; ved avvik gjelder PDF-en.',
      },
      {
        type: 'prose',
        title: '1. Tjenesten',
        paragraphs: [
          'FODEL annonserer ungarske eiendommer på egne flerspråklige nettsteder og bistår, etter egen avtale, med å gjennomføre salget.',
          'Annonsetjenesten innebærer ingen enerett: selgeren kan også tilby og selge eiendommen gjennom andre kanaler.',
        ],
      },
      {
        type: 'list',
        title: '2. Innrykk av annonse',
        ordered: true,
        items: [
          'Selgeren fyller ut registreringsskjemaet.',
          'FODEL sender en betalingsforespørsel for den valgte pakken.',
          'Selgeren betaler med bankoverføring.',
          'Når betalingen er mottatt, får selgeren rett til å laste opp bilder.',
          'FODEL tar seg av oversettelsen og publiserer annonsen.',
        ],
      },
      {
        type: 'table',
        title: '3. Priser',
        intro: `Alle priser inkluderer ${LISTING_VAT_PERCENT}\u00a0% nederlandsk mva. Se siden Priser for full oversikt.`,
        rows: [
          [`Basisannonse (${cheap.months} måneder)`, eur(cheap.priceEur, L)],
          [`Standardannonse (${normal.months} måneder)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Oversettelse', `${eur(extra('translation').priceEur, L)} per språk`],
          [
            'Fremheving',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} per måned (min. ${minMonths} måneder)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Provisjon',
        paragraphs: [
          'Provisjon skal bare betales når alt det følgende er oppfylt: en skriftlig kjøpekontrakt, en kjøper formidlet av FODEL og et innbetalt depositum.',
          `Provisjonen er ${COMMISSION.percent}\u00a0% netto, minst ${eur(COMMISSION.minimumEur, L)}, pluss ${COMMISSION.vatPercent}\u00a0% nederlandsk mva.`,
          'Hvis interessenten kontakter selgeren direkte og hjelpen vår med gjennomføringen ikke trengs, skal ingenting betales utover annonseprisen.',
        ],
      },
      {
        type: 'prose',
        title: '5. Tilbaketrekking av annonsen',
        paragraphs: [
          'Selgeren kan trekke annonsen tilbake før utløpsdatoen. Allerede betalte annonsegebyrer refunderes i så fall ikke.',
        ],
      },
      {
        type: 'prose',
        title: '6. Ansvar',
        paragraphs: [
          'Selgeren er ansvarlig for at opplysningene om eiendommen er korrekte. FODEL gjengir opplysningene som er gitt, og tar intet ansvar for at de er riktige.',
          'Oversettelsene på nettstedet er veiledende; ved tvist gjelder den ungarske versjonen.',
        ],
      },
      {
        type: 'prose',
        title: '7. Angrerett',
        paragraphs: [
          'En selger som er forbruker, har lovfestet angrerett ved fjernsalgsavtaler. Hvis selgeren uttrykkelig ber om umiddelbar oppfyllelse, reduseres angreretten forholdsmessig etter tjenesten som allerede er levert.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Erklæring om tilgjengelighet',
    metaDescription: `Tilgjengelighetsnivået for ${SITE_HOST}, standarden vi følger, og hvordan du gir oss tilbakemelding.`,
    eyebrow: 'Tilgjengelighet',
    title: 'Erklæring om',
    titleEm: 'tilgjengelighet',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Vi ønsker at nettstedet skal kunne brukes av alle, også besøkende som bruker skjermleser, tastatur eller forstørrelse.',
          'Vi bygger nettstedet etter WCAG 2.2 nivå AA. En betydelig del av de besøkende er pensjonister, så tekststørrelse, kontrast og tastaturbetjening prioriteres.',
        ],
      },
      {
        type: 'list',
        title: 'Hva som er på plass',
        items: [
          'All tekst har et kontrastforhold på minst 4,5:1',
          'Full tastaturbetjening med synlig fokusmarkering',
          'En lenke «hopp til innhold» øverst på hver side',
          'Meningsfulle alternative tekster for alle bilder',
          'Skjemafelt med tilknyttede etiketter og feilmeldinger i tekst',
          'Respekt for systeminnstillingen «reduser bevegelse»',
          'Nettstedet kan leses og brukes uten JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Kjente begrensninger',
        paragraphs: ['Vi har ingen innflytelse på tilgjengeligheten til innhold fra tredjeparter, for eksempel en karttjeneste.'],
      },
      {
        type: 'prose',
        title: 'Tilbakemelding',
        paragraphs: [
          `Hvis du støter på en barriere, gi oss beskjed på ${COMPANY.email.primary} eller på telefon. Vi løser henvendelser så raskt vi kan.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
