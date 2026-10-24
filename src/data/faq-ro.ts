/**
 * Întrebări frecvente, română (adresare cu „dumneavoastră”). Pentru
 * cumpărători, după modelul versiunii neerlandeze: toate cifrele provin din
 * src/config/company.ts, nimic nu este adăugat aici.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';

const L = 'ro' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);
const pct = (n: number) => `${n}%`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
};

export const FAQ_RO = [
  {
    id: 'direct-de-la-proprietar',
    question: 'Ce înseamnă „direct de la proprietar”?',
    answer: [
      'Pentru o mare parte dintre proprietățile noastre, publicăm, alături de datele noastre de contact, numele și numărul de telefon ale proprietarului. Astfel, îl puteți contacta direct pe vânzător.',
      'Dacă îl contactați direct și vă ocupați singur de achiziție, nimeni nu plătește comision, nici dumneavoastră, nici vânzătorul. În acest caz, suntem plătiți doar pentru anunț.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'comision',
    question: 'Cât costă intermedierea dumneavoastră?',
    answer: [
      `Comisionul nostru este de ${pct(COMMISSION.percent)} net, cel puțin ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} TVA neerlandez. Îl plătește vânzătorul maghiar, nu dumneavoastră.`,
      'Se facturează numai dacă sunt îndeplinite toate cele trei condiții: există un contract de vânzare-cumpărare scris, cumpărătorul a fost adus de FODEL și avansul a fost plătit.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'cumparare-ca-cetatean-ue',
    question: 'Pot cumpăra o proprietate în Ungaria în calitate de cetățean UE?',
    answer: [
      'Da. Ca cetățean UE, cumpărați case și terenuri în Ungaria în condiții aproape identice cu cele ale unui cetățean maghiar. Aproape 100% din proprietățile din Ungaria se află pe teren deținut în proprietate deplină. Dreptul de superficie pe termen lung, precum erfpacht-ul neerlandez, este rar acolo.',
      `Pentru terenurile agricole se aplică reguli speciale. Un cetățean UE cu calificare în agricultură poate dobândi în Ungaria până la ${nOf('ro', AGRI_HECTARE_LIMIT, 'hectar', 'hectare', 'de hectare')}; ne ocupăm în întregime de această procedură.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'deplasare-pentru-semnare',
    question: 'Trebuie să vin în Ungaria pentru semnare?',
    answer: [
      'Nu. Vă putem reprezenta în Ungaria pe baza unei procuri, așa că nu trebuie să vă deplasați pentru semnare.',
      'Ne ocupăm și de înscrierea în cartea funciară maghiară și de transferul contractelor de apă, gaz și electricitate.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'contract-bilingv',
    question: 'În ce limbă se întocmește contractul de vânzare-cumpărare?',
    answer: [
      'Comandăm contracte de vânzare-cumpărare bilingve, ca să înțelegeți ce semnați.',
      `Prețuri orientative: în maghiară de la ${price('hu')}, germană–maghiară și engleză–maghiară de la ${price('de-hu')}, neerlandeză–maghiară de la ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'de-ce-se-ocupa-fodel',
    question: 'De ce se ocupă FODEL la o achiziție?',
    answer: [
      '- Comunicarea prin telefon și e-mail, precum și legătura dintre cele două părți',
      '- Întâlniri personale și vizionări la fața locului',
      '- Un membru al echipei noastre care vă însoțește la fața locului',
      '- Sprijin la negocierea prețului',
      '- Pregătirea contractului multilingv',
      '- Toate formalitățile achiziției',
      '- Înscrierea noului proprietar și transferul contractelor de apă, gaz și electricitate',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'de-ce-ungaria',
    question: 'De ce aleg cumpărătorii din Europa de Vest Ungaria?',
    answer: [
      '- Locuințele și costul vieții sunt considerabil mai mici',
      '- În general, Ungaria nu percepe impozit pe proprietate',
      '- Mai mult soare și o climă mai plăcută',
      '- Țara se află deasupra nivelului mării, în centrul continentului',
      '- Ungaria este stat membru al UE',
      '- Aproape toate proprietățile se află pe teren deținut în proprietate deplină',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'certificat-energetic',
    question: 'Are o proprietate din Ungaria certificat energetic?',
    answer: [
      'Da. În Ungaria este obligatoriu certificatul de performanță energetică (energiatanúsítvány), care trebuie menționat în anunț. În anunțurile noastre, clasa energetică apare printre caracteristici; „În curs” înseamnă că certificatul este încă în pregătire.',
      'La cererea vânzătorului, ne putem ocupa de obținerea certificatului.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'serviciul-de-cautare',
    question: 'Ce este serviciul de căutare și cât costă?',
    answer: [
      'Serviciul de căutare este gratuit. Ne spuneți ce căutați (tipul proprietății, regiunea, bugetul și dorințele) și căutăm în locul dumneavoastră, inclusiv dincolo de proprietățile prezentate pe acest site.',
      'Colegii noștri vorbitori de maghiară vă ajută la negociere și se asigură că contractul este întocmit corect. Veți primi un e-mail de îndată ce apare o proprietate potrivită.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'ce-regiuni',
    question: 'În ce regiuni oferiți proprietăți?',
    answer: [
      'Suntem prezenți mai ales în Transdanubia, în județele Baranya, Tolna, Zala, Somogy și Veszprém, precum și în jurul lacului Balaton și pe Podișul Balatonului.',
      'Avem proprietăți și în Marea Câmpie Ungară și în zone bine conectate la aeroportul din Budapesta.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bariera-lingvistica',
    question: 'Nu vorbesc maghiara. Este o problemă?',
    answer: [
      'Nu. Fiecare anunț indică limbile pe care le vorbește proprietarul, ca să știți acest lucru dinainte.',
      'Echipa noastră vorbește neerlandeză, germană, engleză, franceză și maghiară și vă însoțește la vizionare.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'cand-ne-puteti-contacta',
    question: 'Când vă pot contacta?',
    answer: [
      `În zilele lucrătoare, între ${hour(COMPANY.hours.weekdays.from)} și ${hour(COMPANY.hours.weekdays.to)}. Dacă ne cereți să vă sunăm înapoi, revenim cu un apel până la ${hour(COMPANY.hours.callback.to)}, inclusiv în weekend.`,
      'Apelul nu vă costă nimic: costul convorbirii îl suportăm noi.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
