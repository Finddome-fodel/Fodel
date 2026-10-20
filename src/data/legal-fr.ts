/**
 * Pages juridiques, français (vouvoiement). Traduction fidèle des pages
 * néerlandaises (src/data/pages-legal.ts) : mêmes sections, mêmes chiffres,
 * même sens.
 *
 * ⚠️ Traduction de courtoisie. Elle doit être validée par le client et par un
 * juriste avant le lancement, comme les originaux hongrois et néerlandais.
 * Toutes les phrases qui s’appuient sur le droit néerlandais ou hongrois (rôles
 * RGPD, TVA néerlandaise, autorité néerlandaise, droit de rétractation,
 * plateforme de RLL) sont listées dans Fodel-forditasok-atadas.md.
 *
 * Typographie : espace insécable avant « : » et « ; », et dans « 12 mois », « 4 % ».
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'fr' as const;
const pct = (n: number) => `${n} %`;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 juillet 2026';
const notice =
  'Cette version est une traduction fournie à titre de commodité. En cas de divergence, l’original néerlandais (pour les questions relevant du droit néerlandais) ou hongrois prévaut.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_FR = {
  imprint: {
    metaTitle: 'Mentions légales : données de l’entreprise',
    metaDescription: `Données de l’entreprise ${COMPANY.names.legal} : siège, numéro de TVA, numéro KvK et coordonnées.`,
    eyebrow: 'Mentions légales',
    title: 'Données de',
    titleEm: 'l’entreprise',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Informations sur le prestataire',
        rows: [
          ['Raison sociale', COMPANY.names.legal],
          ['Siège', addressLine(COMPANY.address, L)],
          ['N° de TVA', COMPANY.registration.vat],
          ['Numéro KvK (registre néerlandais du commerce)', kvk],
          ['Représentant', COMPANY.principal],
          ['E-mail', COMPANY.email.primary],
          ['Téléphone', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Fondée en', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Comptes bancaires',
        rows: [
          ['Pays-Bas', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Hongrie', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Litiges',
        body: 'En cas de litige de consommation, vous pouvez aussi recourir à la plateforme européenne de règlement en ligne des litiges : ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Politique de confidentialité',
    metaDescription:
      'Comment FODEL traite vos données personnelles : quelles données nous traitons, combien de temps nous les conservons et quels droits vous avez selon le RGPD.',
    eyebrow: 'Confidentialité',
    title: 'Politique de',
    titleEm: 'confidentialité',
    intro:
      'Cette politique décrit comment nous traitons les données personnelles que vous nous communiquez par ce site, conformément au RGPD.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Responsable du traitement',
        rows: [
          ['Responsable', COMPANY.names.legal],
          ['Adresse', addressLine(COMPANY.address, L)],
          ['E-mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Les données que nous traitons',
        intro: 'Uniquement les données que vous saisissez vous-même dans nos formulaires :',
        items: [
          'Nom, adresse e-mail et numéro de téléphone : pour pouvoir répondre à votre demande',
          'L’objet et le contenu de votre message',
          'Pour une annonce : les données du bien et vos données de facturation',
          'Pour une demande de recherche : vos critères de recherche',
          'Pour la gestion interne : quand et quel formulaire vous avez rempli, et quand vous vous êtes connecté au portail, sans enregistrer d’adresse IP',
        ],
      },
      {
        type: 'table',
        title: 'Base juridique et durée de conservation',
        rows: [
          ['Contact et demande de rappel', 'Consentement (art. 6, § 1, point a, du RGPD) : 12 mois'],
          ['Commande d’annonce', 'Exécution d’un contrat (art. 6, § 1, point b) : 7 ans, durée légale de conservation fiscale'],
          ['Demande de recherche', 'Consentement : jusqu’à l’aboutissement, 24 mois au maximum'],
          ['Journal d’activité interne', 'Intérêt légitime (art. 6, § 1, point f) : gestion ordonnée et détection des abus : 24 mois au maximum'],
        ],
      },
      {
        type: 'list',
        title: 'Avec qui nous partageons les données',
        intro: 'Nous ne vendons pas vos données et ne les partageons pas à des fins de marketing. Nos sous-traitants sont :',
        items: [
          'Notre prestataire d’e-mail, avec un traitement au sein de l’UE',
          'L’hébergeur de ce site',
          'En cas d’achat, et uniquement à votre demande : l’autre partie et l’avocat concerné',
        ],
      },
      {
        type: 'callout',
        title: 'À propos des annonces',
        body: 'En tant qu’annonceur, vous pouvez nous autoriser à afficher votre nom et votre numéro de téléphone avec l’annonce, afin que les personnes intéressées puissent vous contacter directement. Vous pouvez retirer cette autorisation à tout moment ; nous supprimons alors ces données de l’annonce.',
      },
      // PROJET : en attente de validation juridique (lettre d’information, 2026-10).
      {
        type: 'callout',
        title: 'Lettre d’information',
        body: 'Si vous vous abonnez à notre lettre d’information, nous traitons votre adresse e-mail, la langue choisie et l’heure de l’inscription et de la confirmation, uniquement pour vous envoyer la lettre, sur la base de votre consentement. L’inscription se fait en deux étapes : nous n’envoyons rien tant que vous n’avez pas cliqué sur le bouton du courriel de confirmation. Dans chaque courriel, vous pouvez vous désabonner en un clic, et nous cessons aussitôt. Pour l’envoi, nous utilisons le service Resend.',
      },
      {
        type: 'list',
        title: 'Vos droits',
        items: [
          'Accès aux données que nous traitons à votre sujet',
          'Rectification et effacement',
          'Limitation du traitement ou opposition à celui-ci',
          'Portabilité des données',
          'Retrait de votre consentement à tout moment',
          'Dépôt d’une réclamation auprès de l’autorité néerlandaise de protection des données (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Contact pour la confidentialité',
        paragraphs: [`Vous pouvez envoyer vos questions ou demandes à ${COMPANY.email.primary}. Nous répondons au plus tard dans un délai de 30 jours.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Politique de cookies',
    metaDescription: `Les cookies que ${SITE_HOST} utilise et comment modifier votre choix.`,
    eyebrow: 'Cookies',
    title: 'Politique de',
    titleEm: 'cookies',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Ce site n’utilise pour le moment que des données de stockage techniquement nécessaires. Nous n’exécutons aucun script publicitaire ou de suivi et ne partageons rien avec les réseaux sociaux.',
        ],
      },
      {
        type: 'table',
        title: 'Ce que nous enregistrons',
        rows: [
          [
            'fodel:consent',
            'Votre choix concernant les cookies (accepté ou refusé). Conservé dans votre navigateur, il ne nous parvient pas. Durée de conservation : 12 mois.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistiques',
        paragraphs: [
          'Si nous devions un jour mesurer la fréquentation, nous ne l’activerions qu’avec votre consentement préalable et explicite. Un refus ne limite en rien l’utilisation du site.',
        ],
      },
      {
        type: 'prose',
        title: 'Modifier votre choix',
        paragraphs: [
          'Vous pouvez à tout moment modifier votre choix en effaçant les données enregistrées par votre navigateur pour ce site ; le bandeau de cookies réapparaît alors.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Conditions générales',
    metaDescription:
      'Les conditions du service d’annonces et d’intermédiation de FODEL : tarifs, commission, rétractation et responsabilité.',
    eyebrow: 'Conditions',
    title: 'Conditions',
    titleEm: 'générales',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'À noter',
        body: 'Cette page est un résumé. Les conditions complètes et applicables sont disponibles en PDF ; en cas de divergence, le PDF prévaut.',
      },
      {
        type: 'prose',
        title: '1. Le service',
        paragraphs: [
          'FODEL publie des annonces de biens hongrois sur ses propres sites multilingues et, sur la base d’un accord distinct, participe au déroulement de la vente.',
          'Le service d’annonces n’est pas exclusif : le vendeur peut aussi proposer et vendre le bien par d’autres canaux.',
        ],
      },
      {
        type: 'list',
        title: '2. Déposer une annonce',
        ordered: true,
        items: [
          'Le vendeur remplit le formulaire d’inscription.',
          'FODEL envoie une demande de paiement pour le forfait choisi.',
          'Le vendeur paie par virement bancaire.',
          'Dès réception, le vendeur obtient le droit de téléverser des photos.',
          'FODEL se charge de la traduction et publie l’annonce.',
        ],
      },
      {
        type: 'table',
        title: '3. Tarifs',
        intro: `Tous les prix incluent ${pct(LISTING_VAT_PERCENT)} de TVA néerlandaise. Voir la page Tarifs pour l’aperçu complet.`,
        rows: [
          [`Annonce économique (${cheap.months} mois)`, eur(cheap.priceEur, L)],
          [`Annonce normale (${normal.months} mois)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Traduction', `${eur(extra('translation').priceEur, L)} par langue`],
          [
            'Mise en avant',
            `${extra('category-highlight').priceEur} à ${eur(extra('homepage-highlight').priceEur, L)} par mois (min. ${minMonths} mois)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Commission',
        paragraphs: [
          'Une commission n’est due que si toutes les conditions suivantes sont réunies : un contrat de vente écrit, un acheteur amené par FODEL et un acompte versé.',
          `La commission est de ${pct(COMMISSION.percent)} net, avec un minimum de ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} de TVA néerlandaise.`,
          'Si la personne intéressée s’adresse directement au vendeur et que notre aide pour le déroulement n’est pas nécessaire, rien n’est dû en dehors des frais d’annonce.',
        ],
      },
      {
        type: 'prose',
        title: '5. Retirer l’annonce',
        paragraphs: [
          'Le vendeur peut retirer l’annonce avant sa date d’expiration. Les frais d’annonce déjà payés ne sont alors pas remboursés.',
        ],
      },
      {
        type: 'prose',
        title: '6. Responsabilité',
        paragraphs: [
          'Le vendeur est responsable de l’exactitude des informations sur le bien. FODEL reproduit les informations fournies et décline toute responsabilité quant à leur exactitude.',
          'Les traductions de ce site sont données à titre d’information ; en cas de litige, la version hongroise prévaut.',
        ],
      },
      {
        type: 'prose',
        title: '7. Droit de rétractation',
        paragraphs: [
          'Un vendeur qui est consommateur dispose du droit légal de rétractation pour les contrats conclus à distance. S’il demande expressément une exécution immédiate, le droit de rétractation est réduit au prorata du service déjà fourni.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Déclaration d’accessibilité',
    metaDescription: `Le niveau d’accessibilité de ${SITE_HOST}, la norme appliquée et comment nous transmettre vos remarques.`,
    eyebrow: 'Accessibilité',
    title: 'Déclaration',
    titleEm: 'd’accessibilité',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Nous voulons que ce site soit utilisable par tous, y compris par les visiteurs qui utilisent un lecteur d’écran, le clavier ou un agrandissement.',
          'Nous développons le site selon la norme WCAG 2.2, niveau AA. Une part importante de nos visiteurs est retraitée ; la taille du texte, le contraste et la navigation au clavier passent donc en priorité.',
        ],
      },
      {
        type: 'list',
        title: 'Ce qui est en place',
        items: [
          'Tout le texte présente un rapport de contraste d’au moins 4,5:1',
          'Navigation complète au clavier avec indicateur de focus visible',
          'Un lien « Aller au contenu » en haut de chaque page',
          'Des textes alternatifs pertinents pour toutes les images',
          'Des champs de formulaire avec étiquettes associées et messages d’erreur en texte',
          'Respect du réglage système « Réduire les animations »',
          'Le site reste lisible et utilisable sans JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Limites connues',
        paragraphs: ['Nous n’avons aucune prise sur l’accessibilité des contenus de tiers, comme un service de cartographie.'],
      },
      {
        type: 'prose',
        title: 'Vos remarques',
        paragraphs: [
          `Vous rencontrez un obstacle ? Dites-le-nous à ${COMPANY.email.primary} ou par téléphone. Nous traitons les signalements aussi vite que possible.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
