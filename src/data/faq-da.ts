/**
 * FAQ, Danish (informal-standard "du"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'da' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_DA = [
  {
    id: 'direct-from-the-owner',
    question: 'Hvad betyder “direkte fra ejeren”?',
    answer: [
      'For en stor del af vores udbud offentliggør vi ejerens navn og telefonnummer ved siden af vores egne oplysninger. Du kan kontakte sælger direkte.',
      'Hvis du kontakter sælger direkte, og I selv aftaler købet, betaler ingen salær: hverken du eller sælger. Vi får så kun betaling for annoncen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Hvad koster jeres formidling?',
    answer: [
      `Vores salær er ${COMMISSION.percent}\u00a0% netto, dog mindst ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% hollandsk moms. Det betales af den ungarske sælger, ikke af dig.`,
      'Vi fakturerer kun, når alle tre betingelser er opfyldt: der foreligger en skriftlig købsaftale, køberen er formidlet af FODEL, og depositummet er betalt.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Kan jeg som EU-borger købe ejendom i Ungarn?',
    answer: [
      'Ja. Som EU-borger køber du huse og grunde i Ungarn på stort set samme vilkår som en ungarer. Næsten 100\u00a0% af de ungarske ejendomme står på selvejet grund. Lejet grund som den hollandske erfpacht er sjælden.',
      `For landbrugsjord gælder særlige regler. En EU-borger med landbrugsuddannelse kan erhverve op til ${AGRI_HECTARE_LIMIT} hektar i Ungarn; vi håndterer hele den procedure.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Skal jeg rejse til Ungarn for at skrive under?',
    answer: [
      'Nej. Vi kan repræsentere dig i Ungarn ved fuldmagt, så du behøver ikke komme derned for at skrive under.',
      'Vi tager os også af tinglysningen i Ungarn og overdragelsen af forsyningerne.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'På hvilket sprog udarbejdes købsaftalen?',
    answer: [
      'Vi får udarbejdet tosprogede aftaler, så du kan læse det, du skriver under på.',
      `Vejledende priser: ungarsk fra ${price('hu')}, tysk–ungarsk og engelsk–ungarsk fra ${price('de-hu')}, hollandsk–ungarsk fra ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Hvad præcis ordner FODEL, når du køber?',
    answer: [
      '- Rådgivning pr. telefon og e-mail samt kommunikation mellem parterne',
      '- Personlige aftaler og fremvisninger på stedet',
      '- En kollega, der taler dit sprog og rejser med dig',
      '- Støtte i prisforhandlingen',
      '- Udarbejdelse af den flersprogede aftale',
      '- Håndtering af hele købet',
      '- Tinglysning af den nye ejer og overdragelse af forsyninger',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Hvorfor vælger købere fra Vesteuropa Ungarn?',
    answer: [
      '- Ejendomspriser og leveomkostninger er betydeligt lavere',
      '- Ejendomsskat opkræves som regel ikke i Ungarn',
      '- Mere sol og et mildere klima',
      '- Landet ligger over havets overflade, midt på kontinentet',
      '- Ungarn er medlem af EU',
      '- Næsten alle ejendomme står på selvejet grund',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Har en ungarsk ejendom et energimærke?',
    answer: [
      'Ja. Ungarn kræver et energimærke (energiatanúsítvány), og det skal fremgå af annoncen. I vores annoncer vises mærket under egenskaberne; “undervejs” betyder, at energimærket stadig er under udarbejdelse.',
      'Hvis sælger ønsker det, kan vi få energimærket udarbejdet.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Hvad er søgeservicen, og hvad koster den?',
    answer: [
      'Søgeservicen er gratis. Du fortæller os, hvad du leder efter (type, område, budget og ønsker), og vi søger for dig, også ud over ejendommene på dette websted.',
      'Vores ungarsktalende kolleger hjælper med forhandlingen og sørger for, at aftalen udarbejdes juridisk korrekt. Du får en e-mail, så snart der dukker noget passende op.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Hvilke områder dækker I?',
    answer: [
      'Fokus er Transdanubien med amterne Baranya, Tolna, Zala, Somogy og Veszprém samt Balatonsøen og Balaton-højlandet.',
      'Vi har også ejendomme på sletten og i områder med gode forbindelser til lufthavnen i Budapest.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Jeg taler ikke ungarsk. Er det et problem?',
    answer: [
      'Nej. Hver annonce oplyser, hvilke sprog ejeren taler, så du ved det på forhånd.',
      'Vores team taler hollandsk, tysk, engelsk, fransk og ungarsk og tager med til fremvisningen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Hvornår kan jeg kontakte jer?',
    answer: [
      `På hverdage mellem ${COMPANY.hours.weekdays.from} og ${COMPANY.hours.weekdays.to}. Hvis du beder om at blive ringet op, ringer vi indtil kl. ${COMPANY.hours.callback.to}, også i weekenden.`,
      'Opkaldet koster dig ingenting. Vi betaler for samtalen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
