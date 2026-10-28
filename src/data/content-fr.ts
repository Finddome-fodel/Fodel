/**
 * Pages détaillées, français (vouvoiement) : services, immobilier agricole,
 * guide d’achat, s’installer en Hongrie, guide photo. Les chiffres viennent de
 * src/config/company.ts.
 *
 * Typographie : espace insécable ( ) avant « : » et « ; » et dans les
 * guillemets « », espace insécable aussi dans « 150 € » et « 10 % ».
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'fr' as const;
const pct = (n: number) => `${n} %`;
const des = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `à partir de ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_FR = {
  services: {
    metaTitle: 'Services : démarches, contrat, photographie',
    metaDescription: `Contrat de vente bilingue ${des('hu')}, représentation par procuration, inscription au registre foncier, certificat de performance énergétique, photographie immobilière et prises de vue par drone.`,
    eyebrow: 'Services',
    title: 'Ce que nous faisons au-delà',
    titleEm: 'de l’annonce',
    intro:
      'L’annonce n’est que la première étape. Avec les services ci-dessous, nous vous déchargeons de tout le processus d’achat, selon les règles des deux pays.',
    sections: [
      {
        type: 'steps',
        title: 'Le déroulement de la vente',
        items: [
          { n: '01', t: 'Contact', b: 'Échanges par téléphone et par e-mail, communication avec les deux parties, interprètes compris.' },
          { n: '02', t: 'Vérification de l’acheteur', b: 'Nous vérifions le parcours, l’intention d’achat et la solvabilité.' },
          { n: '03', t: 'Visite', b: 'Nous fixons les rendez-vous et vous accompagnons, avec un collaborateur qui parle votre langue.' },
          { n: '04', t: 'Négociation', b: 'Un appui dans les deux langues, dans une fourchette de prix réaliste.' },
          { n: '05', t: 'Contrat', b: 'Contrat de vente bilingue, rédigé avec un avocat.' },
          { n: '06', t: 'Finalisation', b: 'Registre foncier, contrats d’eau, de gaz et d’électricité et, si besoin, représentation par procuration.' },
        ],
      },
      {
        type: 'table',
        title: 'Contrat de vente bilingue',
        intro: 'Prix indicatifs par combinaison de langues. Le prix définitif dépend de l’ampleur du contrat.',
        rows: [
          ['Hongrois', des('hu')],
          ['Allemand–hongrois', des('de-hu')],
          ['Anglais–hongrois', des('en-hu')],
          ['Néerlandais–hongrois', des('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Services complémentaires',
        intro: 'Pour ceux-ci, nous établissons un devis sur mesure :',
        items: [
          'Obtention du certificat de performance énergétique : obligatoire dans l’annonce selon les règles de l’UE',
          'Photographie immobilière professionnelle',
          'Prises de vue par drone : particulièrement efficaces pour les grands terrains et les vues',
          `Vidéo pour l’annonce (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Représentation par procuration',
        body: 'Vous n’avez pas besoin de vous rendre en Hongrie pour signer : avec une procuration, nous vous représentons à la signature, au registre foncier et lors du transfert des contrats d’eau, de gaz et d’électricité.',
      },
      {
        type: 'prose',
        title: 'Quand une commission est due',
        paragraphs: [
          `Nous ne facturons de commission que si FINDDOME a amené l’acheteur, qu’un contrat de vente écrit existe et que l’acompte a été versé. Le taux est de ${pct(COMMISSION.percent)} net, avec un minimum de ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} de TVA néerlandaise. C’est le vendeur qui paie, pas l’acheteur.`,
        ],
      },
      {
        type: 'cta',
        title: 'Des questions sur la procédure',
        body: '{hours} Demandez gratuitement à être rappelé, ou écrivez-nous.',
        primary: { label: 'Nous contacter', to: 'contact' },
        secondary: { label: 'Questions fréquentes', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Immobilier agricole : jusqu’à ${AGRI_HECTARE_LIMIT} hectares en Hongrie`,
    metaDescription: `Un citoyen de l’UE titulaire d’une qualification agricole peut acquérir jusqu’à ${AGRI_HECTARE_LIMIT} hectares de terres en Hongrie. FINDDOME prend en charge toute la procédure.`,
    eyebrow: 'Immobilier agricole',
    title: 'Terres agricoles et',
    titleEm: 'domaines',
    intro:
      'Le marché foncier hongrois obéit à ses propres règles. Qui en connaît les conditions accède à des vignobles, des terres arables, des fermes et des forêts.',
    sections: [
      {
        type: 'prose',
        title: `La limite de ${AGRI_HECTARE_LIMIT} hectares`,
        paragraphs: [
          `Un citoyen de l’UE titulaire d’une qualification agricole peut acquérir au total ${AGRI_HECTARE_LIMIT} hectares de terres en Hongrie. Nous prenons cette procédure entièrement en charge.`,
          'La procédure comprend plusieurs étapes auprès des autorités et commence par la reconnaissance de votre qualification. Notre équipe vous accompagne tout au long du processus et prépare les documents nécessaires dans les deux langues.',
        ],
      },
      {
        type: 'list',
        title: 'Ce qu’acquièrent nos clients',
        items: [
          'Des vignobles, avec ou sans cave en activité',
          'Des terres arables, éligibles aux aides de l’UE',
          'Des fermes avec dépendances, adaptées à l’élevage',
          'Des forêts et des domaines à usage mixte',
          'De grandes parcelles d’un seul tenant comme investissement',
        ],
      },
      {
        type: 'steps',
        title: 'Le déroulement',
        items: [
          { n: '01', t: 'Entretien', b: 'Nous discutons de vos projets et du budget disponible.' },
          { n: '02', t: 'Reconnaissance de la qualification', b: 'Nous nous occupons de la reconnaissance de votre qualification agricole en Hongrie.' },
          { n: '03', t: 'Recherche', b: 'Avec nos partenaires, nous cherchons des terres qui remplissent les conditions.' },
          { n: '04', t: 'Autorisations', b: 'Demande des autorisations requises pour l’acquisition de terres.' },
          { n: '05', t: 'Achat', b: 'Contrat bilingue, inscription au registre foncier, transfert des demandes d’aides.' },
        ],
      },
      {
        type: 'callout',
        title: 'Important',
        body: 'Les règles d’acquisition de terres agricoles évoluent de temps à autre et dépendent de votre situation particulière. Ce qui est écrit ici est donné à titre d’information. Pour un projet concret, consultez toujours notre équipe et un juriste spécialisé.',
      },
      {
        type: 'cta',
        title: 'Vous cherchez un bien agricole',
        body: 'Indiquez-nous vos souhaits ; nous cherchons aussi au-delà des biens annoncés.',
        primary: { label: 'Recherche gratuite', to: 'searchRequest' },
        secondary: { label: 'Nos biens', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Acheter en Hongrie : la procédure étape par étape',
    metaDescription:
      'Comment se déroule un achat en Hongrie pour un acheteur étranger : contrat, acompte, registre foncier, contrats d’eau, de gaz et d’électricité, et frais à prévoir.',
    eyebrow: 'Pour les acheteurs',
    title: 'Acheter en',
    titleEm: 'Hongrie',
    intro:
      'La procédure d’achat hongroise est tout à fait prévisible dès que l’on en connaît les étapes. Ce guide vous les fait parcourir.',
    sections: [
      {
        type: 'steps',
        title: 'Le déroulement',
        items: [
          { n: '01', t: 'Sélection', b: 'Vous choisissez parmi nos biens ou déposez une demande de recherche gratuite.' },
          { n: '02', t: 'Visite', b: 'Nous organisons le voyage et la visite, avec un interprète.' },
          { n: '03', t: 'Offre', b: 'Nous vous aidons à faire une offre réaliste et à négocier.' },
          { n: '04', t: 'Contrat et acompte', b: `Contrat de vente bilingue, en général avec un acompte de ${pct(10)}.` },
          { n: '05', t: 'Prix d’achat', b: 'Le solde du prix par virement bancaire, selon le contrat.' },
          { n: '06', t: 'Remise des clés', b: 'Inscription au registre foncier, contrats de services, remise des clés.' },
        ],
      },
      {
        type: 'list',
        title: 'Frais en plus du prix d’achat',
        items: [
          'Droits de mutation : le taux dépend du type de bien et de votre situation',
          'Honoraires d’avocat pour la rédaction et la contresignature de l’acte',
          `Traduction du contrat bilingue : ${des('hu')}, selon la combinaison de langues`,
          'Frais de registre foncier',
          'Éventuelle commission de FINDDOME : elle est payée par le vendeur, pas par vous',
        ],
      },
      {
        type: 'prose',
        title: 'Vous n’avez pas besoin d’être sur place',
        paragraphs: [
          'Avec une procuration, nous vous représentons à la signature, au registre foncier et lors du transfert des contrats d’eau, de gaz et d’électricité. L’achat peut donc avoir lieu même si vous ne pouvez pas ou ne voulez pas voyager.',
        ],
      },
      {
        type: 'callout',
        title: 'Certificat de performance énergétique',
        body: 'La Hongrie impose un certificat de performance énergétique, qui doit aussi figurer dans l’annonce selon les règles de l’UE. Dans nos annonces, vous trouverez la classe parmi les caractéristiques ; « En cours » signifie que le certificat est encore en préparation.',
      },
      {
        type: 'cta',
        title: 'Commençons',
        body: 'Parcourez nos biens ou dites-nous ce que vous cherchez. Cela ne vous coûte rien.',
        primary: { label: 'Nos biens', to: 'properties' },
        secondary: { label: 'Recherche gratuite', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'S’installer en Hongrie : pourquoi les Néerlandais franchissent le pas',
    metaDescription:
      'Les quatre raisons pour lesquelles des Néerlandais et des Belges s’installent en Hongrie : rapport qualité-prix, espace, coût de la vie plus bas et situation géographique.',
    eyebrow: 'Contexte',
    title: 'S’installer en',
    titleEm: 'Hongrie',
    intro:
      'Beaucoup de Néerlandais et de Belges choisissent la Hongrie. Dans des centaines d’entretiens avec nos clients, les quatre mêmes raisons reviennent sans cesse.',
    sections: [
      {
        type: 'prose',
        title: 'Rapport qualité-prix',
        paragraphs: [
          'L’immobilier rural hongrois figure parmi les meilleurs rapports qualité-prix d’Europe. Un terrain à bâtir de 125 m² coûte vite 88 000 € aux Pays-Bas, et un garage environ 100 000 €. Pour la même somme, vous achetez dans la campagne hongroise une vaste maison familiale, souvent avec un bon terrain.',
        ],
      },
      {
        type: 'prose',
        title: 'Espace',
        paragraphs: [
          'Les Pays-Bas comptent 482 habitants par km² pour quelque 17 millions d’habitants, et une part importante du pays est constituée d’eau. Le manque d’espace n’est pas un problème abstrait mais une expérience quotidienne, et la raison la plus souvent citée.',
        ],
      },
      {
        type: 'prose',
        title: 'Coût de la vie',
        paragraphs: [
          'Une grande partie de nos acheteurs sont retraités ou presque. Pour eux, le coût de la vie plus bas, l’absence de taxe foncière et des soins abordables offrent ensemble un niveau de vie que la même retraite ne permettrait pas aux Pays-Bas.',
        ],
      },
      {
        type: 'prose',
        title: 'Situation géographique',
        paragraphs: [
          'Depuis les inondations de 1953, les Pays-Bas ont construit un immense système de protection contre l’eau. L’inquiétude liée à la hausse du niveau de la mer pèse dans bien des décisions : la Hongrie se trouve au cœur du continent, au-dessus du niveau de la mer.',
        ],
      },
      {
        type: 'cta',
        title: 'À vous d’explorer',
        body: 'Parcourez nos biens, ou laissez-nous chercher ce que vous avez en tête.',
        primary: { label: 'Nos biens', to: 'properties' },
        secondary: { label: 'Acheter en Hongrie', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Guide photo pour les annonceurs',
    metaDescription:
      'De bonnes photos sont le meilleur moyen de vendre vite. Le guide photo de FINDDOME : lumière, cadrage, résolution et erreurs les plus fréquentes.',
    eyebrow: 'Pour les vendeurs',
    title: 'Le guide',
    titleEm: 'photo',
    intro:
      'Les acheteurs étrangers voient d’abord les photos, souvent uniquement les photos. Ces règles valent plus que n’importe quel texte d’annonce.',
    sections: photoGuideSections(L, {
      topTitle: 'Les six règles essentielles',
      calloutTitle: 'Mieux vaut déléguer',
      calloutBody: (lines) =>
        `Faites appel à un professionnel. Vous le choisissez en un clic lors du dépôt de votre annonce : ${lines.join(' ; ')}. Les deux options sont facultatives ; un collaborateur vous contactera pour fixer un rendez-vous.`,
      ctaTitle: 'Prêt à publier votre annonce',
      primary: 'Déposer une annonce',
      secondary: 'Tarifs',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
