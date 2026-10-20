/**
 * FAQ, français (vouvoiement). Pour les acheteurs, sur le modèle de la version
 * néerlandaise : tous les chiffres viennent de src/config/company.ts, rien
 * n’est nouveau ici.
 *
 * Typographie : espace insécable avant « : », « ; », « ? » et dans « » ; le
 * français utilise ici   partout pour rester sûr à l’affichage.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'fr' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);
const pct = (n: number) => `${n} %`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`;
};

export const FAQ_FR = [
  {
    id: 'directement-du-proprietaire',
    question: 'Que signifie « directement auprès du propriétaire » ?',
    answer: [
      'Pour une grande partie de nos biens, nous publions, à côté de nos propres coordonnées, le nom et le numéro de téléphone du propriétaire. Vous pouvez donc contacter directement le vendeur.',
      'Si vous le contactez directement et réglez vous-même l’achat, personne ne paie de commission, ni vous ni le vendeur. Nous ne sommes alors rémunérés que pour l’annonce.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Combien coûte votre intermédiation ?',
    answer: [
      `Notre commission est de ${pct(COMMISSION.percent)} net, avec un minimum de ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} de TVA néerlandaise. Elle est payée par le vendeur hongrois, pas par vous.`,
      'Elle n’est facturée que si les trois conditions sont réunies : il existe un contrat de vente écrit, l’acheteur a été amené par FODEL et l’acompte a été versé.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'acheter-en-tant-que-citoyen-ue',
    question: 'Puis-je, en tant que citoyen de l’UE, acheter un bien en Hongrie ?',
    answer: [
      'Oui. En tant que citoyen de l’UE, vous achetez des maisons et des terrains en Hongrie à des conditions à peu près identiques à celles d’un Hongrois. Près de 100 % de l’immobilier hongrois repose sur un terrain en pleine propriété. Le bail emphytéotique, comme l’erfpacht néerlandais, y est rare.',
      `Des règles particulières s’appliquent aux terres agricoles. Un citoyen de l’UE titulaire d’une qualification agricole peut acquérir jusqu’à ${AGRI_HECTARE_LIMIT} hectares en Hongrie ; nous prenons cette procédure entièrement en charge.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'se-deplacer-pour-signer',
    question: 'Dois-je me rendre en Hongrie pour signer ?',
    answer: [
      'Non. Nous pouvons vous représenter en Hongrie par procuration, de sorte que vous n’avez pas besoin de venir pour la signature.',
      'Nous nous occupons aussi de l’inscription au registre foncier hongrois et du transfert des contrats d’eau, de gaz et d’électricité.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'contrat-bilingue',
    question: 'Dans quelle langue le contrat de vente est-il rédigé ?',
    answer: [
      'Nous faisons rédiger des contrats de vente bilingues, afin que vous compreniez ce que vous signez.',
      `Prix indicatifs : hongrois à partir de ${price('hu')}, allemand–hongrois et anglais–hongrois à partir de ${price('de-hu')}, néerlandais–hongrois à partir de ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'ce-que-fodel-prend-en-charge',
    question: 'Que prend en charge FODEL lors d’un achat ?',
    answer: [
      '- Échanges par téléphone et par e-mail, et communication entre les deux parties',
      '- Rendez-vous personnels et visites sur place',
      '- Un collaborateur qui parle votre langue et vous accompagne sur place',
      '- Un appui pour la négociation du prix',
      '- La préparation du contrat multilingue',
      '- Toutes les démarches de l’achat',
      '- L’inscription du nouveau propriétaire et le transfert des contrats d’eau, de gaz et d’électricité',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'pourquoi-la-hongrie',
    question: 'Pourquoi les acheteurs d’Europe de l’Ouest choisissent-ils la Hongrie ?',
    answer: [
      '- L’immobilier et le coût de la vie sont nettement moins élevés',
      '- La Hongrie ne prélève en général pas de taxe foncière',
      '- Plus de soleil et un climat plus agréable',
      '- Le pays se trouve au-dessus du niveau de la mer, au centre du continent',
      '- La Hongrie est un État membre de l’UE',
      '- Presque tous les biens reposent sur un terrain en pleine propriété',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'certificat-energetique',
    question: 'Un bien hongrois a-t-il un certificat énergétique ?',
    answer: [
      'Oui. La Hongrie impose un certificat de performance énergétique (energiatanúsítvány), qui doit figurer dans l’annonce. Dans nos annonces, la classe énergétique apparaît parmi les caractéristiques ; « En cours » signifie que le certificat est encore en préparation.',
      'Nous pouvons, si le vendeur le souhaite, faire établir le certificat pour lui.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'service-de-recherche',
    question: 'Qu’est-ce que le service de recherche, et combien coûte-t-il ?',
    answer: [
      'Le service de recherche est gratuit. Vous nous indiquez ce que vous cherchez (type de bien, région, budget et souhaits) et nous cherchons pour vous, y compris en dehors des biens présentés sur ce site.',
      'Nos collègues hongrophones vous aident pour la négociation et veillent à ce que le contrat soit rédigé dans les règles. Vous recevez un e-mail dès qu’un bien convenable se présente.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'quelles-regions',
    question: 'Dans quelles régions proposez-vous des biens ?',
    answer: [
      'Nous sommes surtout présents en Transdanubie, dans les comitats de Baranya, Tolna, Zala, Somogy et Veszprém, ainsi qu’autour du lac Balaton et sur les hauteurs du Balaton.',
      'Nous avons aussi des biens dans la plaine et dans des zones bien reliées à l’aéroport de Budapest.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'barriere-de-la-langue',
    question: 'Je ne parle pas hongrois. Est-ce un problème ?',
    answer: [
      'Non. Chaque annonce indique les langues que parle le propriétaire, pour que vous le sachiez à l’avance.',
      'Notre équipe parle néerlandais, allemand, anglais, français et hongrois, et vous accompagne à la visite.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'nous-joindre',
    question: 'Quand puis-je vous joindre ?',
    answer: [
      `En semaine, entre ${hour(COMPANY.hours.weekdays.from)} et ${hour(COMPANY.hours.weekdays.to)}. Si vous demandez à être rappelé, nous rappelons jusqu’à ${hour(COMPANY.hours.callback.to)}, week-end compris.`,
      'Le rappel ne vous coûte rien : nous prenons l’appel à notre charge.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
