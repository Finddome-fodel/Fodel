/**
 * Časté otázky, slovenčina (vykanie). Pre kupujúcich, podľa vzoru holandskej
 * verzie: všetky čísla pochádzajú zo src/config/company.ts, nič nové sa tu
 * nepridáva.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';

const L = 'sk' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);
const pct = (n: number) => `${n}\u00a0%`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
};

export const FAQ_SK = [
  {
    id: 'priamo-od-majitela',
    question: 'Čo znamená „priamo od majiteľa“?',
    answer: [
      'Pri veľkej časti našich nehnuteľností uvádzame popri vlastných kontaktných údajoch aj meno a telefónne číslo majiteľa. Predávajúceho tak môžete kontaktovať priamo.',
      'Ak ho kontaktujete priamo a kúpu vybavíte sami, nikto neplatí províziu, ani vy, ani predávajúci. Vtedy dostávame odmenu len za inzerát.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'provizia',
    question: 'Koľko stojí vaše sprostredkovanie?',
    answer: [
      `Naša provízia je ${pct(COMMISSION.percent)} bez DPH, najmenej ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} holandskej DPH. Platí ju maďarský predávajúci, nie vy.`,
      'Účtujeme ju len vtedy, ak sú splnené všetky tri podmienky: existuje písomná kúpna zmluva, kupujúceho priviedol FINDDOME a bola zaplatená záloha.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'kupa-ako-obcan-eu',
    question: 'Môžem si ako občan EÚ kúpiť nehnuteľnosť v Maďarsku?',
    answer: [
      'Áno. Ako občan EÚ kupujete domy a pozemky v Maďarsku za takmer rovnakých podmienok ako Maďar. Takmer 100 % maďarských nehnuteľností stojí na pozemku v plnom vlastníctve. Dlhodobé právo stavby, ako je holandský erfpacht, je tam zriedkavé.',
      `Pre poľnohospodársku pôdu platia osobitné pravidlá. Občan EÚ s poľnohospodárskou kvalifikáciou môže v Maďarsku nadobudnúť až ${nOf('sk', AGRI_HECTARE_LIMIT, 'hektár', 'hektáre', 'hektárov')}; celé konanie vybavíme za vás.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'cesta-na-podpis',
    question: 'Musím na podpis pricestovať do Maďarska?',
    answer: [
      'Nie. Na základe plnej moci vás môžeme v Maďarsku zastupovať, takže na podpis nemusíte pricestovať.',
      'Postaráme sa aj o zápis do maďarského katastra nehnuteľností a o prepis zmlúv na vodu, plyn a elektrinu.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'dvojjazycna-zmluva',
    question: 'V akom jazyku sa kúpna zmluva vyhotovuje?',
    answer: [
      'Dávame vyhotoviť dvojjazyčné kúpne zmluvy, aby ste rozumeli tomu, čo podpisujete.',
      `Orientačné ceny: v maďarčine od ${price('hu')}, nemecko-maďarská a anglicko-maďarská od ${price('de-hu')}, holandsko-maďarská od ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'co-zabezpeci-fodel',
    question: 'O čo sa FINDDOME pri kúpe postará?',
    answer: [
      '- Telefonická a e-mailová komunikácia a sprostredkovanie kontaktu medzi oboma stranami',
      '- Osobné stretnutia a obhliadky na mieste',
      '- Náš kolega, ktorý vás na mieste sprevádza',
      '- Podpora pri vyjednávaní o cene',
      '- Príprava viacjazyčnej zmluvy',
      '- Všetky úkony spojené s kúpou',
      '- Zápis nového vlastníka a prepis zmlúv na vodu, plyn a elektrinu',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'preco-madarsko',
    question: 'Prečo si kupujúci zo západnej Európy vyberajú Maďarsko?',
    answer: [
      '- Nehnuteľnosti a životné náklady sú výrazne nižšie',
      '- Maďarsko spravidla nevyberá daň z nehnuteľností',
      '- Viac slnka a príjemnejšia klíma',
      '- Krajina leží nad úrovňou mora, v strede kontinentu',
      '- Maďarsko je členským štátom EÚ',
      '- Takmer všetky nehnuteľnosti stoja na pozemku v plnom vlastníctve',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energeticky-certifikat',
    question: 'Má maďarská nehnuteľnosť energetický certifikát?',
    answer: [
      'Áno. V Maďarsku je povinný energetický certifikát (energiatanúsítvány), ktorý musí byť uvedený v inzeráte. V našich inzerátoch je energetická trieda uvedená medzi vlastnosťami; „Pripravuje sa“ znamená, že certifikát sa ešte vyhotovuje.',
      'Ak si to predávajúci želá, vyhotovenie certifikátu môžeme zabezpečiť.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'vyhladavacia-sluzba',
    question: 'Čo je vyhľadávacia služba a koľko stojí?',
    answer: [
      'Vyhľadávacia služba je bezplatná. Poviete nám, čo hľadáte (typ nehnuteľnosti, región, rozpočet a požiadavky), a my hľadáme za vás, aj mimo nehnuteľností uvedených na tomto webe.',
      'Naši maďarsky hovoriaci kolegovia vám pomôžu pri vyjednávaní a dohliadnu na to, aby bola zmluva vyhotovená správne. Hneď ako sa objaví vhodná nehnuteľnosť, dostanete e-mail.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'ktore-regiony',
    question: 'V ktorých regiónoch ponúkate nehnuteľnosti?',
    answer: [
      'Pôsobíme najmä v Zadunajsku, v župách Baranya, Tolna, Zala, Somogy a Veszprém, ako aj okolo Balatonu a na Balatonskej vrchovine.',
      'Nehnuteľnosti máme aj na Veľkej maďarskej nížine a v oblastiach s dobrým spojením na letisko v Budapešti.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'jazykova-bariera',
    question: 'Nehovorím po maďarsky. Je to problém?',
    answer: [
      'Nie. V každom inzeráte uvádzame, akými jazykmi hovorí majiteľ, aby ste to vedeli vopred.',
      'Náš tím hovorí po holandsky, nemecky, anglicky, francúzsky a maďarsky a sprevádza vás pri obhliadke.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'kedy-nas-zastihnete',
    question: 'Kedy vás môžem zastihnúť?',
    answer: [
      `V pracovné dni od ${hour(COMPANY.hours.weekdays.from)} do ${hour(COMPANY.hours.weekdays.to)}. Ak požiadate o spätné zavolanie, voláme späť do ${hour(COMPANY.hours.callback.to)}, aj cez víkend.`,
      'Spätné zavolanie vás nič nestojí: hovor platíme my.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
