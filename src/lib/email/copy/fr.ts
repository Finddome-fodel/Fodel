/**
 * Textes des e-mails en français (vouvoiement). Vérifiés par le compilateur
 * face au fichier hongrois (`satisfies PublicEmailCopy`) : un modèle manquant
 * ici empêche ce fichier de compiler, et personne ne reçoit un e-mail en
 * hongrois ou en néerlandais. Les notifications au bureau (admin*) restent en
 * hongrois et ne sont pas reprises ici.
 *
 * Ton : sobre, phrases courtes, pas de points d’exclamation. Beaucoup de
 * vendeurs sont retraités : la clarté passe avant la chaleur, et les deux
 * avant le ton publicitaire.
 *
 * Typographie : espace insécable ( ) avant « : » et dans « 10 % » ; espace
 * fine insécable ( ) avant « ? ».
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const FR = {
  common: {
    greeting: (name: string) => `Bonjour ${name},`,
    greetingNoName: 'Bonjour,',
    signOff: 'Cordialement,\nFINDDOME Immobilier',
    questions: 'Une question ? Répondez simplement à cet e-mail.',
    linkFallback: 'Le bouton ne fonctionne pas ? Copiez cette adresse dans votre navigateur :',
  },

  registrationConfirm: {
    subject: 'Définissez votre mot de passe | FINDDOME',
    preheader: 'Un clic, et vous pouvez composer votre annonce.',
    heading: 'Définissez votre mot de passe',
    intro: 'Merci de votre inscription. Votre compte est presque prêt, il ne manque que le mot de passe.',
    cta: 'Définir le mot de passe',
    next: 'Vous poursuivez ensuite directement avec votre annonce : forfait, informations, photos. Nous ne la regardons qu’une fois que vous l’avez soumise.',
    expiry: 'Le lien est valable 7 jours. Si vous ne vous êtes pas inscrit vous-même, ignorez cet e-mail : aucun compte ne sera créé.',
  },

  accountExists: {
    subject: 'Vous avez déjà un compte FINDDOME',
    preheader: 'Connectez-vous, ou définissez un nouveau mot de passe.',
    heading: 'Un compte existe déjà pour cette adresse',
    body: 'Quelqu’un vient d’essayer de s’inscrire sur le site de FINDDOME avec cette adresse e-mail. Un compte existe déjà pour cette adresse, nous n’en avons donc pas créé de nouveau.',
    cta: 'Se connecter',
    reset: 'Mot de passe oublié ? Demander un nouveau mot de passe',
    ignore: 'Ce n’était pas vous ? Vous n’avez rien à faire : votre compte reste inchangé.',
  },

  invite: {
    subject: 'Invitation au portail FINDDOME',
    preheader: 'Définissez votre mot de passe et connectez-vous à l’espace annonceur.',
    heading: 'Vous êtes invité sur le portail FINDDOME',
    body: (role: string) =>
      `FINDDOME vous invite à rejoindre le portail ${role}, où vous gérez des annonces immobilières.`,
    roleAdmin: 'en tant qu’administrateur',
    roleOwner: 'en tant qu’annonceur',
    cta: 'Accepter l’invitation',
    expiry: 'Le lien est valable 7 jours et ne peut être utilisé qu’une fois.',
  },

  welcome: {
    subject: 'Bienvenue sur le portail FINDDOME',
    preheader: 'Votre compte est actif. Voici comment déposer votre première annonce.',
    heading: (name: string) => `Bienvenue, ${name}`,
    body: 'Votre compte est actif. Sur le portail, vous composez votre annonce, téléversez vos photos et suivez son examen.',
    stepsTitle: 'Ce dont vous aurez besoin',
    steps: [
      'Des photos du bien : au moins une, mais plus il y en a, mieux c’est',
      'Les informations de base : surface habitable, surface du terrain, prix demandé',
      'Quelques phrases sur ce qui rend le bien particulier',
    ],
    cta: 'Accéder au portail',
  },

  submissionReceived: {
    subject: (ref: string) => `Nous avons reçu votre annonce (#${ref})`,
    preheader: 'Nous l’examinons et vous répondons par e-mail.',
    heading: 'Votre annonce a bien été reçue',
    body: (title: string, ref: string) =>
      `Nous avons reçu votre annonce « ${title} » (#${ref}). Un collaborateur l’examine et, dès qu’une décision est prise, vous l’apprenez par e-mail.`,
    timing: 'L’examen ne dure en général pas plus de deux jours ouvrés.',
    note: 'Pendant l’examen, vous ne pouvez pas modifier l’annonce. Si nous demandons une modification, elle se rouvre aussitôt.',
  },

  changesRequested: {
    subject: (ref: string) => `Modification nécessaire (#${ref})`,
    preheader: 'Une petite modification, et l’annonce peut être mise en ligne.',
    heading: 'Nous vous demandons une modification',
    body: (title: string, ref: string) =>
      `Au sujet de votre annonce « ${title} » (#${ref}), notre collaborateur a la remarque suivante :`,
    after: 'L’annonce est de nouveau modifiable. Faites la modification et soumettez-la à nouveau. La suite se déroule ensuite normalement.',
    cta: 'Modifier l’annonce',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Validée (#${ref}) : il ne reste que le paiement`,
    preheader: 'Votre annonce est validée et sera mise en ligne dès réception du paiement.',
    heading: 'Votre annonce est validée',
    body: (title: string, ref: string) =>
      `Bonne nouvelle : nous avons examiné et validé votre annonce « ${title} » (#${ref}). Il ne reste que le paiement. Dès qu’il arrive, l’annonce est mise en ligne aussitôt.`,
    orderTitle: 'Coût de l’annonce',
    discountLabel: 'Remise de parrainage (10 %)',
    totalLabel: 'À payer',
    ctaCard: 'Payer par carte',
    cardNote: 'Le paiement s’effectue dans l’environnement sécurisé de Stripe. FINDDOME ne voit ni ne conserve vos données de carte.',
    bankTitle: 'Ou par virement bancaire',
    bankNote: (ref: string) =>
      `Indiquez la référence lors du virement : ${ref}. Dès que le virement arrive, notre collaborateur met l’annonce en ligne.`,
    vatNote: 'Tous les montants indiqués incluent 21 % de TVA néerlandaise.',
  },

  approvedPublished: {
    subject: (ref: string) => `Validée et en ligne (#${ref})`,
    preheader: 'Votre annonce est déjà en ligne ; réglez les frais d’annonce sous 14 jours.',
    heading: 'Votre annonce est en ligne',
    body: (title: string, ref: string) => `Nous avons validé l’annonce « ${title} » (#${ref}) et l’avons publiée aussitôt.`,
    viewCta: 'Voir l’annonce',
    orderTitle: 'Coût de l’annonce',
    discountLabel: 'Remise de parrainage (10 %)',
    totalLabel: 'À payer',
    dueLabel: 'À payer avant le',
    ctaCard: 'Payer par carte',
    cardNote: 'Le paiement s’effectue dans l’environnement sécurisé de Stripe. FINDDOME ne voit ni ne conserve vos données de carte.',
    bankTitle: 'Virement bancaire',
    bankNote: (ref: string) => `Indiquez la référence lors du virement : ${ref}.`,
    vatNote: 'Tous les montants indiqués incluent 21 % de TVA néerlandaise.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Confirmation de paiement (#${ref})`,
    preheader: 'Merci, nous avons bien reçu votre paiement.',
    heading: 'Merci, votre paiement est bien arrivé',
    body: (title: string, ref: string) =>
      `Nous avons reçu le paiement de l’annonce « ${title} » (#${ref}). L’annonce est en ligne et visible sur ${SITE_HOST}.`,
    orderTitle: 'Détail',
    discountLabel: 'Remise de parrainage (10 %)',
    totalLabel: 'Montant payé',
    vatNote: 'Le montant inclut 21 % de TVA néerlandaise. Vous recevrez la facture dans un e-mail distinct.',
    paidAtLabel: 'Date du paiement',
  },

  published: {
    subject: (ref: string) => `Votre annonce est en ligne (#${ref})`,
    preheader: `L’annonce est désormais visible sur ${SITE_HOST}.`,
    heading: 'Votre annonce est en ligne',
    body: (title: string, ref: string) =>
      `Votre annonce « ${title} » (#${ref}) est sur ${SITE_HOST} et touche des acheteurs dans huit pays.`,
    cta: 'Voir l’annonce',
    next: 'Dès que quelqu’un manifeste son intérêt, nous vous envoyons aussitôt un e-mail avec ses coordonnées. Vous pouvez à tout moment consulter l’état de votre annonce sur le portail.',
  },

  newEnquiry: {
    subject: (ref: string) => `Nouvelle demande (#${ref})`,
    preheader: 'Quelqu’un s’intéresse à votre bien.',
    heading: 'Nouvelle réaction à votre annonce',
    body: (title: string, ref: string) =>
      `Quelqu’un a réagi à votre annonce « ${title} » (#${ref}) :`,
    labels: { name: 'Nom', email: 'E-mail', phone: 'Téléphone' },
    messageTitle: 'Son message',
    advice: 'Contactez cette personne de préférence dans les deux jours : répondre vite est de loin le facteur le plus important pour qu’une vente se conclue.',
  },

  passwordReset: {
    subject: 'Réinitialiser votre mot de passe | Portail FINDDOME',
    preheader: 'Le lien est valable une heure.',
    heading: 'Réinitialiser votre mot de passe',
    body: 'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte sur le portail FINDDOME. Cliquez sur le bouton ci-dessous pour en définir un nouveau.',
    cta: 'Définir un nouveau mot de passe',
    expiry: 'Le lien est valable une heure et ne peut être utilisé qu’une fois.',
    ignore: 'Vous n’êtes pas à l’origine de cette demande ? Ignorez cet e-mail. Votre mot de passe reste inchangé et il ne se passe rien.',
  },

  referralRegistered: {
    subject: 'Nous avons reçu votre recommandation | FINDDOME',
    preheader: 'Un collaborateur contactera bientôt la personne que vous avez recommandée.',
    heading: 'Merci pour la recommandation',
    body: (referredName: string) =>
      `Nous avons reçu les coordonnées de ${referredName}. Un collaborateur la contactera et, dès que l’annonce sera déposée, nous déduirons 10 % du coût de votre prochaine annonce.`,
    note: 'Le crédit est appliqué manuellement, après le paiement de l’annonceur. Un collaborateur vous préviendra dès que ce sera possible.',
  },

  valuationReceived: {
    heading: 'Nous avons reçu votre demande d’estimation',
    body: 'Un collaborateur vérifie les informations sur le bien et la base de données, puis vous envoie par e-mail l’estimation indicative, fondée sur le marché.',
  },

  valuationReady: {
    subject: 'Votre estimation est prête | FINDDOME',
    preheader: 'Nous avons établi une estimation indicative de votre bien.',
    heading: 'Votre estimation est prête',
    body: (range: string) =>
      `D’après les informations fournies et des biens comparables, notre estimation indicative est de : ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Cette estimation est indicative, ce n’est pas une expertise, et elle ne remplace pas une estimation officielle. Elle repose sur ${n} biens comparables.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Cette estimation est indicative, ce n’est pas une expertise, et elle ne remplace pas une estimation officielle.',
    cta: 'Déposer une annonce',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `D’après les informations fournies, la valeur indicative, fondée sur le marché, est de\u00a0: ${range}.`,
    mid: 'Valeur médiane',
    basis: 'Base de données',
    rateDate: 'Date du taux de change',
    source: 'Source',
    factorsHeading: 'Facteurs',
    dirPlus: 'Augmente la valeur',
    dirMinus: 'Diminue la valeur',
    dirUnsure: 'Incertain',
    visit: 'Demander la visite de Gábor',
    judicial: 'Demander une expertise officielle',
  },

  valuationDeclined: {
    subject: 'Votre demande d’estimation | FINDDOME',
    preheader: 'Un collaborateur vous contactera personnellement.',
    heading: 'Merci pour votre demande',
    body: 'D’après les informations fournies, nous disposons actuellement de trop peu de biens comparables pour une estimation fiable. Un collaborateur vous contactera personnellement.',
  },

  valuationNeedsInfo: {
    subject: 'Estimation : il nous manque quelques informations',
    preheader: 'Nous avons besoin d’un peu plus d’informations pour l’estimation.',
    heading: 'Il nous manque quelques informations',
    body: 'Merci pour votre demande d’estimation. Pour l’établir, notre collaborateur vous demande ce qui suit :',
    after: 'Répondez à cet e-mail avec les informations manquantes. Dès que nous les aurons reçues, nous établirons l’estimation.',
  },

  rejected: {
    subject: (ref: string) => `Votre annonce ne peut pas être publiée (#${ref})`,
    preheader: 'Le résultat de l’examen et les explications.',
    heading: 'Nous ne pouvons pas publier l’annonce',
    body: (title: string, ref: string) =>
      `Nous sommes désolés : après examen, notre collaborateur n’a pas validé votre annonce « ${title} » (#${ref}). Les explications :`,
    refund: 'Vous avez déjà payé l’annonce ? Nous vous contacterons séparément au sujet du remboursement.',
    after: 'Une question, ou l’impression d’un malentendu ? Répondez simplement à cet e-mail.',
  },

  invoiceIssued: {
    subject: (number: string) => `Facture ${number}`,
    preheader: 'La facture est prête ; vous pouvez la consulter ou la télécharger via le lien.',
    heading: 'Votre facture est prête',
    body: (title: string, ref: string, number: string) =>
      `La facture ${number} relative à votre annonce « ${title} » (#${ref}) est prête.`,
    cta: 'Voir la facture',
  },

  creditNoteIssued: {
    subject: (number: string) => `Avoir ${number}`,
    preheader: 'Nous avons établi un avoir pour votre facture précédente.',
    heading: 'Avoir disponible',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Pour la facture ${correctsNumber} de votre annonce « ${title} » (#${ref}), nous avons établi l’avoir ${number}.`,
    cta: 'Voir l’avoir',
  },

  serviceRequested: {
    subject: 'Nous avons reçu votre demande | FINDDOME',
    preheader: 'Un collaborateur vous contactera pour fixer un rendez-vous.',
    heading: 'Nous avons reçu votre demande',
    body: (service: string, price: string) => `Merci, nous avons noté votre demande : ${service} (${price}).`,
    next: 'Un collaborateur vous contactera pour fixer un rendez-vous.',
    payment: 'Nous vous informerons du paiement lors de la prise de rendez-vous. Vous ne payez rien pour l’instant.',
    cancel: 'Vous avez changé d’avis ? Répondez simplement à cet e-mail.',
  },

  valuationPaid: {
    subject: 'Confirmation de paiement | Estimation FINDDOME',
    preheader: 'Merci, votre paiement est bien arrivé.',
    heading: 'Merci, votre paiement est bien arrivé',
    body: (service: string) => `Nous avons reçu le paiement de « ${service} ».`,
    orderTitle: 'Poste',
    totalLabel: 'Montant payé',
    paidAtLabel: 'Payé le',
    next: 'Un collaborateur vous contactera bientôt au sujet des prochaines étapes.',
    invoice: 'Besoin d’une facture ? Répondez simplement à cet e-mail.',
  },

  judicialRequested: {
    subject: 'Demande d’expertise officielle | FINDDOME',
    preheader: 'Un collaborateur vous contactera au sujet des possibilités.',
    heading: 'Nous avons reçu votre demande',
    body: 'Merci, nous avons noté que vous souhaitez une expertise officielle (judiciaire) par un expert. Elle diffère de l’estimation indicative, fondée sur le marché, proposée sur notre site : elle est réalisée par un expert habilité, sur la base d’un devis.',
    next: 'Un collaborateur vous contactera au sujet des possibilités et du devis.',
  },
} satisfies PublicEmailCopy;
