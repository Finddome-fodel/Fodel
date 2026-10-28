/**
 * FAQ, Norwegian Bokmål (informal-standard "du"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'no' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_NO = [
  {
    id: 'direct-from-the-owner',
    question: 'Hva betyr «direkte fra eieren»?',
    answer: [
      'For en stor del av utvalget vårt publiserer vi eierens navn og telefonnummer ved siden av våre egne opplysninger. Du kan kontakte selgeren direkte.',
      'Hvis du kontakter selgeren direkte og dere avtaler kjøpet selv, betaler ingen provisjon: verken du eller selgeren. Vi får da bare betalt for annonsen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Hva koster formidlingen deres?',
    answer: [
      `Provisjonen vår er ${COMMISSION.percent}\u00a0% netto, minst ${eur(COMMISSION.minimumEur, L)}, pluss ${COMMISSION.vatPercent}\u00a0% nederlandsk mva. Den betales av den ungarske selgeren, ikke av deg.`,
      'Vi fakturerer bare når alle tre vilkår er oppfylt: det foreligger en skriftlig kjøpekontrakt, kjøperen er formidlet av FINDDOME, og depositumet er betalt.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Kan jeg som EU-borger kjøpe eiendom i Ungarn?',
    answer: [
      'Ja. Som EU-borger kjøper du hus og tomter i Ungarn på praktisk talt samme vilkår som en ungarer. Nesten 100\u00a0% av ungarske eiendommer står på selveid tomt. Festetomt som den nederlandske erfpacht er sjelden.',
      `For landbruksjord gjelder egne regler. En EU-borger med landbruksutdanning kan erverve opptil ${AGRI_HECTARE_LIMIT} hektar i Ungarn; vi håndterer hele den prosessen.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Må jeg reise til Ungarn for å signere?',
    answer: [
      'Nei. Vi kan representere deg i Ungarn med fullmakt, så du trenger ikke komme ned for signeringen.',
      'Vi tar oss også av tinglysingen i Ungarn og overføringen av strøm og vann.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'På hvilket språk utarbeides kjøpekontrakten?',
    answer: [
      'Vi får utarbeidet tospråklige kontrakter, slik at du kan lese det du signerer.',
      `Veiledende priser: ungarsk fra ${price('hu')}, tysk–ungarsk og engelsk–ungarsk fra ${price('de-hu')}, nederlandsk–ungarsk fra ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Hva ordner FINDDOME når du kjøper?',
    answer: [
      '- Rådgivning på telefon og e-post og kommunikasjon mellom partene',
      '- Personlige avtaler og visninger på stedet',
      '- En kollega som snakker ditt språk og reiser med deg',
      '- Støtte i prisforhandlingen',
      '- Utarbeidelse av den flerspråklige kontrakten',
      '- Håndtering av hele kjøpet',
      '- Tinglysing av ny eier og overføring av strøm og vann',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Hvorfor velger kjøpere fra Vest-Europa Ungarn?',
    answer: [
      '- Eiendomspriser og levekostnader er betydelig lavere',
      '- Eiendomsskatt kreves som regel ikke inn i Ungarn',
      '- Mer sol og et mildere klima',
      '- Landet ligger over havet, midt på kontinentet',
      '- Ungarn er medlem av EU',
      '- Nesten alle eiendommer står på selveid tomt',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Har en ungarsk eiendom energiattest?',
    answer: [
      'Ja. Ungarn krever energiattest (energiatanúsítvány), og den skal oppgis i annonsen. I annonsene våre vises energikarakteren under egenskapene; «under arbeid» betyr at attesten fortsatt utarbeides.',
      'Hvis selgeren ønsker det, kan vi få attesten utarbeidet.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Hva er søketjenesten, og hva koster den?',
    answer: [
      'Søketjenesten er gratis. Du forteller oss hva du ser etter (type, område, budsjett og ønsker), og vi leter for deg, også utover eiendommene på dette nettstedet.',
      'Våre ungarsktalende kolleger hjelper med forhandlingen og sørger for at kontrakten utarbeides juridisk korrekt. Du får en e-post så snart noe passende dukker opp.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Hvilke områder dekker dere?',
    answer: [
      'Fokuset er Transdanubia med fylkene Baranya, Tolna, Zala, Somogy og Veszprém, i tillegg til Balatonsjøen og Balaton-høylandet.',
      'Vi har også eiendommer på sletten og i områder med god forbindelse til flyplassen i Budapest.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Jeg snakker ikke ungarsk. Er det et problem?',
    answer: [
      'Nei. Hver annonse oppgir hvilke språk eieren snakker, så du vet det på forhånd.',
      'Teamet vårt snakker nederlandsk, tysk, engelsk, fransk og ungarsk og blir med på visningen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Når kan jeg nå dere?',
    answer: [
      `På hverdager mellom ${COMPANY.hours.weekdays.from} og ${COMPANY.hours.weekdays.to}. Hvis du ber om å bli oppringt, ringer vi fram til kl. ${COMPANY.hours.callback.to}, også i helgene.`,
      'Det koster deg ingenting å bli oppringt. Vi betaler samtalen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
