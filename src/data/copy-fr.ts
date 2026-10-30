/**
 * Contenu des pages, français (vouvoiement).
 *
 * Pour les acheteurs et vendeurs de France, de Belgique et de Suisse
 * romande, écrit à partir des mêmes faits que les textes hongrois et
 * néerlandais : les chiffres viennent de src/config/company.ts, jamais de ce
 * fichier. Vérifié par le compilateur face au texte hongrois : une clé
 * manquante fait échouer le build.
 *
 * Typographie : espace insécable ( ) avant « : », espace fine insécable
 * ( ) avant « ; », « ! » et « ? », et à l’intérieur des guillemets « ».
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'fr' as const;
const pct = (n: number) => `${n} %`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`;
};

export const FR = {
  home: {
    meta: {
      title: 'FINDDOME Immobilier | Acheter un bien en Hongrie, directement auprès du propriétaire',
      description:
        'Maisons, fermes et domaines en Hongrie, souvent directement auprès du propriétaire. Accompagnement dans votre langue et contrats de vente bilingues.',
    },
    hero: {
      eyebrow: `Depuis 2013 · ${foundedInLabel(L)}`,
      title: ['Annoncez', 'votre bien', 'en Europe'],
      emphasis: 1,
      body: 'Déposez votre annonce en quelques étapes. Nous la relisons et, après paiement en ligne, elle est publiée sur notre site en 21 langues, sans contrat d’exclusivité. Les acheteurs vous contactent directement ou passent par nous.',
      primary: 'Voir les biens',
      secondary: 'Recherche gratuite',
      featuredLabel: 'À la une',
    },
    audiences: [
      {
        eyebrow: 'Pour les acheteurs',
        title: 'Des biens en direct\ndu propriétaire',
        body: 'Maisons, fermes, domaines et vignobles hongrois authentiques. Contactez directement le propriétaire ou laissez FINDDOME gérer toute la procédure.',
        cta: 'Voir les biens',
        to: 'properties',
      },
      {
        eyebrow: 'Pour les vendeurs',
        title: 'Votre bien hongrois\nen Europe de l’Ouest',
        body: `Publiez votre annonce en ${REACH_LANGUAGES} langues dans ${REACH_COUNTRIES} pays, sans contrat d’exclusivité. Une commission n’est due que si nous amenons l’acheteur.`,
        cta: 'En savoir plus',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Sélection', title: 'Biens à la une' },
    quote:
      '« Les Néerlandais n’en croient souvent pas leurs yeux quand ils découvrent ce que l’on peut acheter en Hongrie, et à quel prix. »',
    quoteSource: `${BRAND.fr.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Comment ça marche', title: 'Comment fonctionne FINDDOME' },
    cta: {
      eyebrow: 'Nous contacter',
      title: 'Nous vous',
      titleEm: 'rappelons volontiers',
      body: `{hoursShort} · Le rappel est gratuit.`,
    },
    referral: {
      eyebrow: 'Programme de parrainage',
      title: 'Recommandez un annonceur,',
      titleEm: `recevez ${pct(10)}`,
      body: `Si une personne publie une annonce chez FINDDOME sur votre recommandation, elle bénéficie de ${pct(10)} de remise sur son forfait et nous créditons ${pct(10)} sur votre prochaine annonce. Vous annoncez déjà chez nous ? Votre code de parrainage se trouve dans le portail, sous « Instellingen » (Paramètres).`,
      steps: [
        'Recommandez une connaissance avec le formulaire ci-dessous, ou partagez votre lien personnel du portail',
        'Un collaborateur la contacte',
        `Si elle publie une annonce, elle économise ${pct(10)} et nous vous créditons ${pct(10)}`,
      ],
      formTitle: 'Recommander une connaissance',
      fields: {
        referrerName: 'Votre nom',
        referrerEmail: 'Votre adresse e-mail',
        referredName: 'Nom de la personne recommandée',
        referredEmail: 'Adresse e-mail de la personne recommandée',
      },
      submit: 'Envoyer la recommandation',
      successTitle: 'Merci pour votre recommandation !',
      successBody:
        'Nous l’avons bien reçue. Un collaborateur contactera la personne recommandée et nous vous tiendrons informé par e-mail.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Annonces dans ${REACH_COUNTRIES} pays`,
      body: `Nous diffusons les annonces en ${REACH_LANGUAGES} langues aux Pays-Bas, en Belgique, en Allemagne, en Angleterre et dans d’autres pays de l’UE, sans contrat d’exclusivité avec le vendeur.`,
    },
    {
      num: '02',
      title: 'Contact direct',
      body: 'De nombreuses annonces indiquent, à côté de nos coordonnées, le nom et le numéro du propriétaire. Si vous vous arrangez entre vous, personne ne paie de commission.',
    },
    {
      num: '03',
      title: 'Démarches complètes',
      body: 'Contrat de vente bilingue, représentation par procuration, inscription au registre foncier et transfert des contrats d’eau, de gaz et d’électricité.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Fondation' },
    { value: String(REACH_COUNTRIES), label: 'Pays' },
    { value: String(REACH_LANGUAGES), label: 'Langues' },
    { value: pct(COMMISSION.percent), label: 'Commission' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Vendeurs | Votre bien hongrois en Europe de l’Ouest',
      description: `Publiez votre bien hongrois en ${REACH_LANGUAGES} langues dans ${REACH_COUNTRIES} pays, dès ${eur(69, L)} et sans exclusivité. Commission uniquement si FINDDOME amène l’acheteur : ${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} de TVA néerlandaise.`,
    },
    hero: {
      eyebrow: 'Pour les vendeurs',
      title: 'Votre bien',
      titleEm: 'en Europe de l’Ouest',
      body: `Avec le modèle FINDDOME, votre bien est publié en ${REACH_LANGUAGES} langues dans ${REACH_COUNTRIES} pays, sans contrat d’exclusivité. Nous ne travaillons qu’avec des acheteurs sérieux.`,
      cta: 'Déposer une annonce',
      secondary: 'Voir les tarifs',
    },
    benefits: {
      eyebrow: 'Les avantages',
      title: 'Ce qu’apporte un acheteur étranger',
      points: [
        'Des acheteurs qui paient sur fonds propres : pas d’attente d’un prêt ni d’une aide publique.',
        'Paiement en une fois par virement bancaire, rapide et sûr.',
        `Une vraie intention d’achat : une visite leur coûte deux jours et ${eur(200, L)} à ${eur(300, L)}.`,
        'Des prix réalistes : pas de marchandage excessif.',
        'FINDDOME évalue personnellement chaque acheteur avant tout rendez-vous.',
      ],
    },
    personas: {
      eyebrow: 'Les acheteurs',
      title: 'Qui achète par FINDDOME',
      items: [
        {
          title: 'Retraités',
          body: 'Recherchent des charges moins élevées, des avantages fiscaux et des soins accessibles en Hongrie.',
        },
        {
          title: 'Familles',
          body: 'Recherchent de l’espace, de la nature et la vie à la campagne. Souvent une ferme, un corps de ferme ou une maison de vacances.',
        },
        {
          title: 'Investisseurs',
          body: 'Recherchent des locaux commerciaux, des vignobles et des terres agricoles.',
        },
        {
          title: 'Expatriés en quête d’un autre mode de vie',
          body: 'Quittent les coûts de logement élevés et l’agitation, et recherchent un mode de vie européen authentique.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Étape par étape', title: 'Le modèle FINDDOME' },
    commission: {
      eyebrow: 'Tarifs',
      title: 'Une commission uniquement\nen cas de vente conclue',
      body: `Si l’acheteur vous contacte directement et que vous n’avez pas besoin de notre aide, vous ne payez rien en plus des frais d’annonce. Si FINDDOME intervient dans la vente : ${pct(COMMISSION.percent)} net (min. ${eur(COMMISSION.minimumEur, L)}) + ${pct(COMMISSION.vatPercent)} de TVA néerlandaise.`,
      cta: 'Voir les tarifs',
    },
  },

  buyers: {
    meta: {
      title: 'Acheteurs | Acheter un bien en Hongrie',
      description:
        'Acheter un bien en Hongrie en toute sécurité : contrat bilingue, représentation par procuration, inscription au registre foncier. Et un service de recherche gratuit.',
    },
    hero: {
      eyebrow: 'Pour les acheteurs',
      title: 'Acheter en Hongrie,',
      titleEm: 'sans mauvaise surprise',
      body: 'Pour beaucoup de nos biens, le propriétaire est indiqué. Vous négociez directement ou nous confiez toute la procédure.',
      cta: 'Voir les biens',
      secondary: 'Recherche gratuite',
    },
    services: {
      eyebrow: 'Ce dont nous nous occupons',
      title: 'Un accompagnement complet',
      points: [
        'La communication entre vous et le vendeur, interprètes compris.',
        'Les visites, avec un collaborateur qui parle votre langue.',
        'Une aide pour la négociation du prix et la rédaction du contrat bilingue.',
        'Représentation par procuration : vous n’avez pas besoin de vous rendre en Hongrie pour signer.',
        'Inscription au registre foncier et transfert des contrats d’eau, de gaz et d’électricité.',
      ],
    },
    reasons: {
      eyebrow: 'Pourquoi la Hongrie',
      title: 'Ce que recherchent les acheteurs d’Europe de l’Ouest',
    },
  },

  about: {
    meta: {
      title: 'À propos | Un pont entre deux mondes',
      description:
        'Depuis 2013, nous mettons en relation des vendeurs hongrois et des acheteurs d’Europe de l’Ouest. Avec discrétion, transparence et sans contrat d’exclusivité.',
    },
    hero: {
      eyebrow: 'À propos',
      title: 'Un pont entre',
      titleEm: 'deux mondes',
      body: 'Depuis 2013, nous aidons les vendeurs hongrois à trouver le bon acheteur étranger : avec discrétion, efficacité et sans contrat d’exclusivité.',
    },
    origin: {
      eyebrow: 'Les débuts · Almere-Buiten, 2013',
      quote:
        '« En vivant à Almere-Buiten, nous avons vu à quel point les Néerlandais aspirent à un mode de vie européen authentique, alors qu’en Hongrie les plus beaux biens attendent un propriétaire sans que personne les remarque. »',
    },
    values: {
      eyebrow: 'Nos principes',
      title: 'Ce sur quoi nous nous appuyons',
      items: [
        {
          num: '01',
          title: 'Discrétion',
          body: 'Nous traitons les données des vendeurs et des acheteurs avec le plus grand soin. Les données personnelles ne sont publiées qu’avec leur consentement.',
        },
        {
          num: '02',
          title: 'Transparence',
          body: 'Pas de frais cachés. Nos tarifs et notre commission sont publiés sur ce site, et nous vous informons à chaque étape.',
        },
        {
          num: '03',
          title: 'Bilinguisme',
          body: 'Nous connaissons les deux marchés de l’intérieur. Notre équipe parle néerlandais, allemand, anglais, français et hongrois.',
        },
      ],
    },
    approach: {
      eyebrow: 'Notre approche',
      title: 'Nous ne sommes pas un grand bureau.',
      titleEm: 'C’est notre force.',
      points: [
        'Chaque client a un interlocuteur personnel : pas de centre d’appels, pas de guichet anonyme.',
        'Nous connaissons les deux cultures de l’intérieur et jugeons un bien avec un regard néerlandais comme hongrois.',
        'Mettre en relation un bien et un acheteur est notre responsabilité, pas une affaire de hasard.',
        'Nous travaillons sans exclusivité, car nous préférons convaincre par les résultats.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Le pont que nous',
      titleEm: 'avons construit',
      paragraphs: [
        'FINDDOME a été fondée par des Hongrois installés aux Pays-Bas. Nous avons commencé en 2013 à Almere-Buiten, où nous avons constaté que de nombreux Néerlandais et Belges voulaient acheter une maison hongroise authentique sans savoir par où commencer.',
        `Aujourd’hui, nous publions des annonces dans ${REACH_COUNTRIES} pays et en ${REACH_LANGUAGES} langues, et nous accompagnons chaque transaction du début à la fin : contrat de vente bilingue, représentation par procuration et inscription au registre foncier. Notre bureau est à La Haye.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Contact | Nous vous rappelons volontiers',
      description: `Appelez-nous en semaine entre ${hour(COMPANY.hours.weekdays.from)} et ${hour(COMPANY.hours.weekdays.to)}, ou demandez à être rappelé. L’appel ne vous coûte rien.`,
    },
    hero: { eyebrow: 'Contact', title: 'Nous vous', titleEm: 'rappelons volontiers' },
    formTitle: 'Demander à être rappelé',
    submit: 'Demander un rappel',
    subjects: [
      'Question sur un bien',
      'Publier une annonce',
      'Demande de tarifs',
      'Demande de rappel',
      'Autre',
    ],
    note: `Le rappel ne vous coûte rien : nous prenons l’appel à notre charge. Nous rappelons jusqu’à ${hour(COMPANY.hours.callback.to)}, week-end compris.`,
  },
} satisfies CopyShape;
