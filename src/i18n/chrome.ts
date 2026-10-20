/**
 * Small strings of the shared site chrome: footer, cookie banner, newsletter
 * box, search placeholders, map, card labels. One complete entry per language;
 * `L10n<ChromeStrings>` makes the compiler refuse a missing one.
 *
 * Client scripts never import this file. Components read the strings on the
 * server and hand the few the browser needs over as data attributes, so a page
 * only ever carries its own language.
 *
 * French spacing:   before ":" and inside « »,   before "!", "?", ";".
 */
import type { L10n } from '~/i18n/ui';

export interface ChromeStrings {
  valuationNav: string;
  legal: { imprint: string; privacy: string; terms: string; cookies: string; accessibility: string };
  vatLabel: string;
  backToTop: string;
  /** "Last updated", before the date on legal pages. */
  updatedLabel: string;
  founded: (year: number) => string;
  newsTitle: string;
  newsBody: string;
  cookie: { title: string; body: string; accept: string; reject: string; more: string };
  newsletter: {
    label: string;
    placeholder: string;
    submit: string;
    note: string;
    privacy: string;
    ok: string;
    error: string;
    email: string;
    sending: string;
  };
  search: { placeholder: string; placeholderShort: string };
  whatsapp: string;
  playVideo: string;
  card: { bedsShort: string; bargain: string };
  post: { minutes: string; caseStudy: string };
  map: {
    pin: string;
    browse: string;
    windowsHelp: string;
    macHelp: string;
    mobileHelp: string;
    zoomIn: string;
    zoomOut: string;
  };
  photoTips: { heading: string; guide: string; why: string };
  onsite: { heading: string; intro: string; none: string; noneBody: string; once: string };
}

export const CHROME: L10n<ChromeStrings> = {
  hu: {
    valuationNav: 'Értékbecslés',
    legal: { imprint: 'Impresszum', privacy: 'Adatvédelem', terms: 'ÁSZF', cookies: 'Sütik', accessibility: 'Akadálymentesítés' },
    vatLabel: 'Holland adószám',
    backToTop: 'Vissza az oldal tetejére',
    updatedLabel: 'Utolsó frissítés',
    founded: (year) => `Alapítva ${year}-ban, Hága, Hollandia.`,
    newsTitle: 'Új ingatlanok elsőként',
    newsBody: 'Havi hírlevél a friss hirdetésekről és a magyar ingatlanpiacról.',
    cookie: {
      title: 'Sütik',
      body: 'Ez az oldal csak a működéshez feltétlenül szükséges sütiket használja. Statisztikai célú mérést csak az Ön kifejezett hozzájárulásával végzünk.',
      accept: 'Elfogadom',
      reject: 'Elutasítom',
      more: 'Részletek',
    },
    newsletter: {
      label: 'E-mail-cím',
      placeholder: 'Az Ön e-mail-címe',
      submit: 'Feliratkozom',
      note: 'Havonta legfeljebb egy-két levél. Megerősítő e-mailt küldünk, és bármikor leiratkozhat.',
      privacy: 'Adatvédelem',
      ok: 'Majdnem kész! Küldtünk egy megerősítő e-mailt. Kattintson a benne lévő gombra.',
      error: 'Nem sikerült. Ellenőrizze a címet, és próbálja újra.',
      email: 'Kérjük, érvényes e-mail-címet adjon meg.',
      sending: 'Küldés…',
    },
    search: { placeholder: 'Település, megye, vagy hirdetésszám', placeholderShort: 'Település vagy azonosító' },
    whatsapp: 'Írjon nekünk WhatsAppon',
    playVideo: 'Videó lejátszása',
    card: { bedsShort: 'szoba', bargain: 'Alkalmi vétel' },
    post: { minutes: 'perc', caseStudy: 'Esettanulmány' },
    map: {
      pin: 'Az ingatlan helye a térképen',
      browse: 'Ingatlanok térképe',
      windowsHelp: 'A nagyításhoz használja a Ctrl + görgetést',
      macHelp: 'A nagyításhoz használja a ⌘ + görgetést',
      mobileHelp: 'Két ujjal mozgathatja a térképet',
      zoomIn: 'Nagyítás',
      zoomOut: 'Kicsinyítés',
    },
    photoTips: { heading: 'Mielőtt fotózna', guide: 'A teljes fotózási útmutató', why: 'Miért számít?' },
    onsite: {
      heading: 'Szívesebben bízná szakemberre?',
      intro:
        'Nem kötelező. Ha kéri, munkatársunk felveszi Önnel a kapcsolatot az időpont egyeztetéséhez, és ekkor tájékoztatja a díj rendezéséről. Most nem kell fizetnie semmit.',
      none: 'Nem kérem',
      noneBody: 'A fotókat én készítem el.',
      once: 'egyszeri díj',
    },
  },

  nl: {
    valuationNav: 'Waardebepaling',
    legal: { imprint: 'Colofon', privacy: 'Privacy', terms: 'Voorwaarden', cookies: 'Cookies', accessibility: 'Toegankelijkheid' },
    vatLabel: 'BTW-nummer',
    backToTop: 'Terug naar boven',
    updatedLabel: 'Laatst bijgewerkt',
    founded: (year) => `Opgericht in ${year} te Den Haag, Nederland.`,
    newsTitle: 'Nieuw aanbod als eerste',
    newsBody: 'Maandelijkse nieuwsbrief met nieuwe woningen en nieuws over de Hongaarse markt.',
    cookie: {
      title: 'Cookies',
      body: 'Deze site gebruikt alleen cookies die noodzakelijk zijn om te functioneren. Statistieken meten wij uitsluitend met uw uitdrukkelijke toestemming.',
      accept: 'Akkoord',
      reject: 'Weigeren',
      more: 'Meer informatie',
    },
    newsletter: {
      label: 'E-mailadres',
      placeholder: 'Uw e-mailadres',
      submit: 'Inschrijven',
      note: 'Hooguit een of twee e-mails per maand. U ontvangt eerst een bevestigingsmail en kunt zich altijd uitschrijven.',
      privacy: 'Privacy',
      ok: 'Bijna klaar! Wij hebben u een bevestigingsmail gestuurd. Klik op de knop daarin.',
      error: 'Dat lukte niet. Controleer het adres en probeer het opnieuw.',
      email: 'Vul een geldig e-mailadres in.',
      sending: 'Bezig…',
    },
    search: { placeholder: 'Plaats, provincie of referentienummer', placeholderShort: 'Plaats of referentie' },
    whatsapp: 'Stuur ons een WhatsApp-bericht',
    playVideo: 'Video afspelen',
    card: { bedsShort: 'slk.', bargain: 'Buitenkans' },
    post: { minutes: 'min.', caseStudy: 'Casestudy' },
    map: {
      pin: 'Ligging van de woning op de kaart',
      browse: 'Kaart met woningen',
      windowsHelp: 'Gebruik Ctrl + scroll om te zoomen',
      macHelp: 'Gebruik ⌘ + scroll om te zoomen',
      mobileHelp: 'Gebruik twee vingers om de kaart te verplaatsen',
      zoomIn: 'Inzoomen',
      zoomOut: 'Uitzoomen',
    },
    photoTips: { heading: 'Voordat u fotografeert', guide: 'De volledige fotografiegids', why: 'Waarom het ertoe doet' },
    onsite: {
      heading: 'Laat u het liever aan een vakman over?',
      intro:
        'Optioneel. Kiest u hiervoor, dan neemt onze medewerker contact met u op om een afspraak te maken en informeert u dan over de betaling. U betaalt nu niets.',
      none: 'Nee, dank u',
      noneBody: 'Ik maak de foto’s zelf.',
      once: 'eenmalig',
    },
  },

  en: {
    valuationNav: 'Valuation',
    legal: { imprint: 'Imprint', privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies', accessibility: 'Accessibility' },
    vatLabel: 'VAT number',
    backToTop: 'Back to top',
    updatedLabel: 'Last updated',
    founded: (year) => `Founded in ${year} in The Hague, the Netherlands.`,
    newsTitle: 'Be first to see new listings',
    newsBody: 'A monthly newsletter with new listings and news from the Hungarian market.',
    cookie: {
      title: 'Cookies',
      body: 'This site only uses cookies that are strictly necessary for it to work. We measure statistics only with your explicit consent.',
      accept: 'Accept',
      reject: 'Reject',
      more: 'Details',
    },
    newsletter: {
      label: 'Email address',
      placeholder: 'Your email address',
      submit: 'Subscribe',
      note: 'One or two emails a month at most. We send a confirmation first, and you can unsubscribe at any time.',
      privacy: 'Privacy',
      ok: 'Almost done. We have sent you a confirmation email; click the button in it.',
      error: 'That did not work. Check the address and try again.',
      email: 'Please enter a valid email address.',
      sending: 'Sending…',
    },
    search: { placeholder: 'Town, county or reference number', placeholderShort: 'Town or reference' },
    whatsapp: 'Message us on WhatsApp',
    playVideo: 'Play video',
    card: { bedsShort: 'bed', bargain: 'Bargain' },
    post: { minutes: 'min read', caseStudy: 'Case study' },
    map: {
      pin: 'Location of the property on the map',
      browse: 'Map of properties',
      windowsHelp: 'Use Ctrl + scroll to zoom the map',
      macHelp: 'Use ⌘ + scroll to zoom the map',
      mobileHelp: 'Use two fingers to move the map',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
    },
    photoTips: { heading: 'Before you take photos', guide: 'The full photo guide', why: 'Why it matters' },
    onsite: {
      heading: 'Prefer to hand it to a professional',
      intro:
        'Optional. If you choose this, a member of our team will contact you to arrange a date and explain how to pay. You pay nothing now.',
      none: 'No, thank you',
      noneBody: 'I will take the photos myself.',
      once: 'one-off fee',
    },
  },

  de: {
    valuationNav: 'Bewertung',
    legal: { imprint: 'Impressum', privacy: 'Datenschutz', terms: 'AGB', cookies: 'Cookies', accessibility: 'Barrierefreiheit' },
    vatLabel: 'USt-IdNr.',
    backToTop: 'Nach oben',
    updatedLabel: 'Zuletzt aktualisiert',
    founded: (year) => `Gegründet ${year} in Den Haag, Niederlande.`,
    newsTitle: 'Neue Immobilien als Erste sehen',
    newsBody: 'Der monatliche Newsletter mit neuen Immobilien und Neuigkeiten vom ungarischen Markt.',
    cookie: {
      title: 'Cookies',
      body: 'Diese Website verwendet nur Cookies, die für den Betrieb zwingend erforderlich sind. Statistiken erfassen wir ausschließlich mit Ihrer ausdrücklichen Einwilligung.',
      accept: 'Akzeptieren',
      reject: 'Ablehnen',
      more: 'Mehr erfahren',
    },
    newsletter: {
      label: 'E-Mail-Adresse',
      placeholder: 'Ihre E-Mail-Adresse',
      submit: 'Abonnieren',
      note: 'Höchstens ein bis zwei E-Mails im Monat. Zuerst senden wir Ihnen eine Bestätigung, und abmelden können Sie sich jederzeit.',
      privacy: 'Datenschutz',
      ok: 'Fast geschafft. Wir haben Ihnen eine Bestätigungs-E-Mail geschickt. Klicken Sie darin auf den Button.',
      error: 'Das hat nicht geklappt. Prüfen Sie die Adresse und versuchen Sie es erneut.',
      email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      sending: 'Wird gesendet…',
    },
    search: { placeholder: 'Ort, Komitat oder Referenznummer', placeholderShort: 'Ort oder Referenz' },
    whatsapp: 'Schreiben Sie uns per WhatsApp',
    playVideo: 'Video abspielen',
    card: { bedsShort: 'Schlafz.', bargain: 'Gelegenheit' },
    post: { minutes: 'Min. Lesezeit', caseStudy: 'Fallstudie' },
    map: {
      pin: 'Lage der Immobilie auf der Karte',
      browse: 'Karte der Immobilien',
      windowsHelp: 'Zum Zoomen Strg + Scrollen verwenden',
      macHelp: 'Zum Zoomen ⌘ + Scrollen verwenden',
      mobileHelp: 'Die Karte mit zwei Fingern bewegen',
      zoomIn: 'Vergrößern',
      zoomOut: 'Verkleinern',
    },
    photoTips: { heading: 'Bevor Sie fotografieren', guide: 'Der vollständige Foto-Ratgeber', why: 'Warum das wichtig ist' },
    onsite: {
      heading: 'Lieber einem Profi überlassen',
      intro:
        'Optional. Wenn Sie sich dafür entscheiden, meldet sich ein Mitarbeiter bei Ihnen, um einen Termin zu vereinbaren und die Zahlung zu erklären. Jetzt zahlen Sie nichts.',
      none: 'Nein, danke',
      noneBody: 'Ich fotografiere selbst.',
      once: 'einmalig',
    },
  },

  fr: {
    valuationNav: 'Estimation',
    legal: {
      imprint: 'Mentions légales',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      cookies: 'Cookies',
      accessibility: 'Accessibilité',
    },
    vatLabel: 'N° de TVA',
    backToTop: 'Retour en haut',
    updatedLabel: 'Dernière mise à jour',
    founded: (year) => `Fondée en ${year} à La Haye, aux Pays-Bas.`,
    newsTitle: 'Les nouveautés en avant-première',
    newsBody: 'Une lettre d’information mensuelle avec les nouveaux biens et l’actualité du marché hongrois.',
    cookie: {
      title: 'Cookies',
      body: 'Ce site n’utilise que les cookies strictement nécessaires à son fonctionnement. Nous ne mesurons des statistiques qu’avec votre consentement explicite.',
      accept: 'Accepter',
      reject: 'Refuser',
      more: 'En savoir plus',
    },
    newsletter: {
      label: 'Adresse e-mail',
      placeholder: 'Votre adresse e-mail',
      submit: 'S’abonner',
      note: 'Un ou deux e-mails par mois au maximum. Nous envoyons d’abord un e-mail de confirmation, et vous pouvez vous désabonner à tout moment.',
      privacy: 'Confidentialité',
      ok: 'Presque terminé. Nous vous avons envoyé un e-mail de confirmation : cliquez sur le bouton qu’il contient.',
      error: 'L’inscription a échoué. Vérifiez l’adresse et réessayez.',
      email: 'Veuillez saisir une adresse e-mail valide.',
      sending: 'Envoi en cours…',
    },
    search: { placeholder: 'Localité, comitat ou numéro de référence', placeholderShort: 'Localité ou référence' },
    whatsapp: 'Écrivez-nous sur WhatsApp',
    playVideo: 'Lire la vidéo',
    card: { bedsShort: 'ch.', bargain: 'Bonne affaire' },
    post: { minutes: 'min de lecture', caseStudy: 'Étude de cas' },
    map: {
      pin: 'Situation du bien sur la carte',
      browse: 'Carte des biens',
      windowsHelp: 'Utilisez Ctrl + molette pour zoomer',
      macHelp: 'Utilisez ⌘ + molette pour zoomer',
      mobileHelp: 'Utilisez deux doigts pour déplacer la carte',
      zoomIn: 'Zoomer',
      zoomOut: 'Dézoomer',
    },
    photoTips: { heading: 'Avant de prendre vos photos', guide: 'Le guide photo complet', why: 'Pourquoi c’est important' },
    onsite: {
      heading: 'Confier les photos à un professionnel',
      intro:
        'Facultatif. Si vous choisissez cette option, un collaborateur vous contactera pour fixer un rendez-vous et vous expliquer comment régler. Vous ne payez rien pour l’instant.',
      none: 'Non, merci',
      noneBody: 'Je prends les photos moi-même.',
      once: 'paiement unique',
    },
  },
};
