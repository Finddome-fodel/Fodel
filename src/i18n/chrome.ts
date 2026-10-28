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
    /** Shown over the map when its style cannot be loaded at all. */
    unavailable: string;
  };
  photoTips: { heading: string; guide: string; why: string };
  onsite: { heading: string; intro: string; none: string; noneBody: string; once: string };
  /** The Dutch-speaking agent request: a checkbox card, its price wording, and the photography premium note. */
  dutchAgent: { title: string; body: string; price: string; photoNote: string };
  /** Shown instead of listings while the catalogue has none at all (not the same as "no match for these filters"). */
  emptyCatalogue: { title: string; hint: string };
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
      unavailable: 'A térkép most nem tölthető be. Kérjük, próbálja meg később.',
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
    dutchAgent: {
      title: 'Holland nyelvű ingatlanos',
      body:
        'Szeretne személyes segítséget egy holland nyelven beszélő ingatlanostól? Munkatársunk felveszi Önnel a kapcsolatot, megbeszélik az igényeit, és közösen egyeztetik az árat.',
      price: 'Egyedi ár',
      photoNote:
        'A professzionális fotózás egyedi, prémium áron kérhető, a szokásos magyar áron felül.',
    },
    emptyCatalogue: {
      title: 'Hamarosan új ingatlanok érkeznek.',
      hint:
        'Kérjen ingyenes kerestetést, és elsőként értesítjük, ha megfelelő ingatlan érkezik.',
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
      unavailable: 'De kaart kan nu niet worden geladen. Probeer het later opnieuw.',
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
    dutchAgent: {
      title: 'Nederlandstalige makelaar',
      body:
        'Wilt u persoonlijke hulp van een Nederlandstalige makelaar? Wij nemen contact met u op om uw wensen te bespreken en samen een prijs af te spreken.',
      price: 'Prijs op maat',
      photoNote:
        'Professionele fotografie is mogelijk tegen een premiumprijs op maat, bovenop de gewone Hongaarse prijs.',
    },
    emptyCatalogue: {
      title: 'Binnenkort verschijnen hier nieuwe woningen.',
      hint:
        'Plaats een gratis zoekopdracht en wij laten u als eerste weten wanneer er iets passends binnenkomt.',
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
      unavailable: 'The map could not be loaded. Please try again later.',
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
    dutchAgent: {
      title: 'Dutch-speaking real-estate agent',
      body:
        'Would you like personal help from an agent who speaks Dutch? We will contact you to discuss what you need and agree a price together.',
      price: 'Custom price',
      photoNote:
        'Professional photography is available at a custom premium price, on top of the standard Hungarian price.',
    },
    emptyCatalogue: {
      title: 'New homes will appear here soon.',
      hint:
        'Place a free search request and we will let you know first when something suitable comes in.',
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
      unavailable: 'Die Karte konnte nicht geladen werden. Bitte versuchen Sie es später erneut.',
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
    dutchAgent: {
      title: 'Niederländischsprachiger Immobilienmakler',
      body:
        'Möchten Sie persönliche Unterstützung von einem niederländischsprachigen Makler? Wir melden uns bei Ihnen, besprechen Ihre Wünsche und vereinbaren gemeinsam einen Preis.',
      price: 'Individueller Preis',
      photoNote:
        'Professionelle Fotografie ist zu einem individuellen Premiumpreis möglich, zusätzlich zum üblichen ungarischen Preis.',
    },
    emptyCatalogue: {
      title: 'Bald erscheinen hier neue Immobilien.',
      hint:
        'Geben Sie einen kostenlosen Suchauftrag auf, und wir melden uns als Erstes bei Ihnen, sobald etwas Passendes eingeht.',
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
      unavailable: 'La carte n’a pas pu être chargée. Veuillez réessayer plus tard.',
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
    dutchAgent: {
      title: 'Agent immobilier néerlandophone',
      body:
        'Souhaitez-vous l’aide personnelle d’un agent néerlandophone ? Nous vous contactons pour discuter de vos besoins et convenir ensemble d’un prix.',
      price: 'Prix sur mesure',
      photoNote:
        'La photographie professionnelle est possible à un tarif premium sur mesure, en plus du prix hongrois habituel.',
    },
    emptyCatalogue: {
      title: 'De nouveaux biens apparaîtront bientôt ici.',
      hint:
        'Déposez une recherche gratuite et nous vous prévenons en premier dès qu’un bien correspondant arrive.',
    },
  },
  es: {
    valuationNav: 'Valoración',
    legal: {
      imprint: 'Aviso legal',
      privacy: 'Privacidad',
      terms: 'Condiciones',
      cookies: 'Cookies',
      accessibility: 'Accesibilidad',
    },
    vatLabel: 'NIF-IVA',
    backToTop: 'Volver arriba',
    updatedLabel: 'Última actualización',
    founded: (year) => `Fundada en ${year} en La Haya (Países Bajos).`,
    newsTitle: 'Las novedades, antes que nadie',
    newsBody: 'Un boletín mensual con los nuevos inmuebles y la actualidad del mercado húngaro.',
    cookie: {
      title: 'Cookies',
      body: 'Este sitio solo utiliza las cookies estrictamente necesarias para su funcionamiento. Solo medimos estadísticas con su consentimiento expreso.',
      accept: 'Aceptar',
      reject: 'Rechazar',
      more: 'Más información',
    },
    newsletter: {
      label: 'Correo electrónico',
      placeholder: 'Su correo electrónico',
      submit: 'Suscribirse',
      note: 'Como máximo, uno o dos correos al mes. Primero le enviamos un correo de confirmación, y puede darse de baja en cualquier momento.',
      privacy: 'Privacidad',
      ok: 'Casi listo. Le hemos enviado un correo de confirmación: haga clic en el botón que contiene.',
      error: 'No se ha podido completar la suscripción. Compruebe la dirección y vuelva a intentarlo.',
      email: 'Introduzca una dirección de correo electrónico válida.',
      sending: 'Enviando…',
    },
    search: { placeholder: 'Localidad, condado o número de referencia', placeholderShort: 'Localidad o referencia' },
    whatsapp: 'Escríbanos por WhatsApp',
    playVideo: 'Reproducir el vídeo',
    card: { bedsShort: 'dorm.', bargain: 'Buena oportunidad' },
    post: { minutes: 'min de lectura', caseStudy: 'Caso práctico' },
    map: {
      pin: 'Ubicación del inmueble en el mapa',
      browse: 'Mapa de inmuebles',
      windowsHelp: 'Use Ctrl + rueda del ratón para hacer zoom',
      macHelp: 'Use ⌘ + rueda del ratón para hacer zoom',
      mobileHelp: 'Use dos dedos para mover el mapa',
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      unavailable: 'No se ha podido cargar el mapa. Inténtelo de nuevo más tarde.',
    },
    photoTips: { heading: 'Antes de hacer las fotos', guide: 'La guía fotográfica completa', why: 'Por qué es importante' },
    onsite: {
      heading: 'Encargar las fotos a un profesional',
      intro:
        'Opcional. Si elige esta opción, un miembro de nuestro equipo se pondrá en contacto con usted para concertar una cita y explicarle cómo pagar. Por ahora no paga nada.',
      none: 'No, gracias',
      noneBody: 'Haré las fotos yo mismo.',
      once: 'pago único',
    },
    dutchAgent: {
      title: 'Agente inmobiliario de habla neerlandesa',
      body:
        '¿Desea la ayuda personal de un agente que hable neerlandés? Nos pondremos en contacto con usted para hablar de lo que necesita y acordar un precio.',
      price: 'Precio a medida',
      photoNote:
        'La fotografía profesional está disponible a un precio premium a medida, además del precio húngaro habitual.',
    },
    emptyCatalogue: {
      title: 'Pronto aparecerán aquí nuevos inmuebles.',
      hint:
        'Haga una solicitud de búsqueda gratuita y le avisaremos los primeros cuando llegue algo adecuado.',
    },
  },
  pl: {
    valuationNav: 'Wycena',
    legal: {
      imprint: 'Nota prawna',
      privacy: 'Prywatność',
      terms: 'Regulamin',
      cookies: 'Pliki cookie',
      accessibility: 'Dostępność',
    },
    vatLabel: 'Nr VAT',
    backToTop: 'Do góry',
    updatedLabel: 'Ostatnia aktualizacja',
    founded: (year) => `Założona w ${year} roku w Hadze w Holandii.`,
    newsTitle: 'Nowości jako pierwsi',
    newsBody: 'Comiesięczny newsletter z nowymi nieruchomościami i wiadomościami z węgierskiego rynku.',
    cookie: {
      title: 'Pliki cookie',
      body: 'Ta strona używa wyłącznie plików cookie niezbędnych do jej działania. Statystyki zbieramy tylko za Państwa wyraźną zgodą.',
      accept: 'Akceptuję',
      reject: 'Odrzucam',
      more: 'Dowiedz się więcej',
    },
    newsletter: {
      label: 'Adres e-mail',
      placeholder: 'Państwa adres e-mail',
      submit: 'Zapisz się',
      note: 'Najwyżej jeden lub dwa e-maile w miesiącu. Najpierw wysyłamy wiadomość z potwierdzeniem, a z subskrypcji można zrezygnować w każdej chwili.',
      privacy: 'Prywatność',
      ok: 'Prawie gotowe. Wysłaliśmy Państwu e-mail z potwierdzeniem – prosimy kliknąć znajdujący się w nim przycisk.',
      error: 'Zapis się nie powiódł. Prosimy sprawdzić adres i spróbować ponownie.',
      email: 'Prosimy podać prawidłowy adres e-mail.',
      sending: 'Wysyłanie…',
    },
    search: { placeholder: 'Miejscowość, komitat lub numer referencyjny', placeholderShort: 'Miejscowość lub numer referencyjny' },
    whatsapp: 'Napisz do nas na WhatsAppie',
    playVideo: 'Odtwórz film',
    card: { bedsShort: 'syp.', bargain: 'Okazja' },
    post: { minutes: 'min czytania', caseStudy: 'Studium przypadku' },
    map: {
      pin: 'Położenie nieruchomości na mapie',
      browse: 'Mapa nieruchomości',
      windowsHelp: 'Użyj Ctrl + kółka myszy, aby powiększyć',
      macHelp: 'Użyj ⌘ + kółka myszy, aby powiększyć',
      mobileHelp: 'Użyj dwóch palców, aby przesunąć mapę',
      zoomIn: 'Powiększ',
      zoomOut: 'Pomniejsz',
      unavailable: 'Nie udało się załadować mapy. Spróbuj ponownie później.',
    },
    photoTips: { heading: 'Zanim zrobią Państwo zdjęcia', guide: 'Pełny poradnik fotograficzny', why: 'Dlaczego to ważne' },
    onsite: {
      heading: 'Zdjęcia wykonane przez profesjonalistę',
      intro:
        'Opcjonalnie. Jeśli Państwo wybiorą tę opcję, nasz pracownik skontaktuje się, aby ustalić termin i wyjaśnić sposób płatności. Na razie nic nie trzeba płacić.',
      none: 'Nie, dziękuję',
      noneBody: 'Zdjęcia zrobię samodzielnie.',
      once: 'opłata jednorazowa',
    },
    dutchAgent: {
      title: 'Niderlandzkojęzyczny pośrednik nieruchomości',
      body:
        'Czy zależy Państwu na osobistej pomocy pośrednika mówiącego po niderlandzku? Skontaktujemy się z Państwem, aby omówić potrzeby i wspólnie ustalić cenę.',
      price: 'Cena indywidualna',
      photoNote:
        'Profesjonalna fotografia jest dostępna w indywidualnej cenie premium, oprócz zwykłej ceny węgierskiej.',
    },
    emptyCatalogue: {
      title: 'Wkrótce pojawią się tu nowe nieruchomości.',
      hint:
        'Proszę złożyć bezpłatne zlecenie poszukiwania, a jako pierwsi poinformujemy Państwa, gdy pojawi się coś odpowiedniego.',
    },
  },
  ro: {
    valuationNav: 'Evaluare',
    legal: {
      imprint: 'Informații legale',
      privacy: 'Confidențialitate',
      terms: 'Condiții',
      cookies: 'Cookie-uri',
      accessibility: 'Accesibilitate',
    },
    vatLabel: 'Cod TVA',
    backToTop: 'Înapoi sus',
    updatedLabel: 'Ultima actualizare',
    founded: (year) => `Fondată în ${year} la Haga, în Țările de Jos.`,
    newsTitle: 'Noutățile, în avanpremieră',
    newsBody: 'Un newsletter lunar cu proprietățile noi și noutăți de pe piața maghiară.',
    cookie: {
      title: 'Cookie-uri',
      body: 'Acest site folosește doar cookie-urile strict necesare funcționării sale. Măsurăm statistici doar cu acordul dumneavoastră explicit.',
      accept: 'Accept',
      reject: 'Refuz',
      more: 'Aflați mai multe',
    },
    newsletter: {
      label: 'Adresă de e-mail',
      placeholder: 'Adresa dumneavoastră de e-mail',
      submit: 'Abonați-vă',
      note: 'Cel mult unul sau două e-mailuri pe lună. Mai întâi vă trimitem un e-mail de confirmare și vă puteți dezabona oricând.',
      privacy: 'Confidențialitate',
      ok: 'Aproape gata. V-am trimis un e-mail de confirmare: faceți clic pe butonul din mesaj.',
      error: 'Abonarea nu a reușit. Verificați adresa și încercați din nou.',
      email: 'Vă rugăm să introduceți o adresă de e-mail validă.',
      sending: 'Se trimite…',
    },
    search: { placeholder: 'Localitate, județ sau număr de referință', placeholderShort: 'Localitate sau referință' },
    whatsapp: 'Scrieți-ne pe WhatsApp',
    playVideo: 'Redați videoclipul',
    card: { bedsShort: 'dorm.', bargain: 'Ofertă avantajoasă' },
    post: { minutes: 'min de lectură', caseStudy: 'Studiu de caz' },
    map: {
      pin: 'Amplasarea proprietății pe hartă',
      browse: 'Harta proprietăților',
      windowsHelp: 'Folosiți Ctrl + rotița mouse-ului pentru zoom',
      macHelp: 'Folosiți ⌘ + rotița mouse-ului pentru zoom',
      mobileHelp: 'Folosiți două degete pentru a muta harta',
      zoomIn: 'Mărire',
      zoomOut: 'Micșorare',
      unavailable: 'Harta nu a putut fi încărcată. Încercați din nou mai târziu.',
    },
    photoTips: { heading: 'Înainte de a face fotografiile', guide: 'Ghidul foto complet', why: 'De ce contează' },
    onsite: {
      heading: 'Încredințați fotografiile unui profesionist',
      intro:
        'Opțional. Dacă alegeți această variantă, un coleg vă va contacta pentru a stabili o programare și a vă explica modalitatea de plată. Deocamdată nu plătiți nimic.',
      none: 'Nu, mulțumesc',
      noneBody: 'Fac singur fotografiile.',
      once: 'plată unică',
    },
    dutchAgent: {
      title: 'Agent imobiliar vorbitor de neerlandeză',
      body:
        'Doriți ajutorul personal al unui agent care vorbește olandeză? Vă contactăm pentru a discuta ce aveți nevoie și pentru a stabili împreună un preț.',
      price: 'Preț personalizat',
      photoNote:
        'Fotografia profesională este disponibilă la un preț premium personalizat, în plus față de prețul maghiar obișnuit.',
    },
    emptyCatalogue: {
      title: 'În curând vor apărea aici proprietăți noi.',
      hint:
        'Trimiteți o cerere gratuită de căutare și vă anunțăm primii când apare ceva potrivit.',
    },
  },
  sk: {
    valuationNav: 'Odhad ceny',
    legal: {
      imprint: 'Právne informácie',
      privacy: 'Ochrana súkromia',
      terms: 'Podmienky',
      cookies: 'Cookies',
      accessibility: 'Prístupnosť',
    },
    vatLabel: 'IČ DPH',
    backToTop: 'Späť hore',
    updatedLabel: 'Posledná aktualizácia',
    founded: (year) => `Založená v roku ${year} v Haagu v Holandsku.`,
    newsTitle: 'Novinky ako prví',
    newsBody: 'Mesačný newsletter s novými nehnuteľnosťami a správami z maďarského trhu.',
    cookie: {
      title: 'Cookies',
      body: 'Táto stránka používa iba cookies nevyhnutne potrebné na jej fungovanie. Štatistiky meriame len s vaším výslovným súhlasom.',
      accept: 'Prijať',
      reject: 'Odmietnuť',
      more: 'Viac informácií',
    },
    newsletter: {
      label: 'E-mailová adresa',
      placeholder: 'Vaša e-mailová adresa',
      submit: 'Prihlásiť sa na odber',
      note: 'Najviac jeden či dva e-maily mesačne. Najprv vám pošleme potvrdzovací e-mail a odhlásiť sa môžete kedykoľvek.',
      privacy: 'Ochrana súkromia',
      ok: 'Takmer hotovo. Poslali sme vám potvrdzovací e-mail: kliknite na tlačidlo v ňom.',
      error: 'Prihlásenie sa nepodarilo. Skontrolujte adresu a skúste to znova.',
      email: 'Zadajte platnú e-mailovú adresu.',
      sending: 'Odosiela sa…',
    },
    search: { placeholder: 'Obec, župa alebo referenčné číslo', placeholderShort: 'Obec alebo referenčné číslo' },
    whatsapp: 'Napíšte nám cez WhatsApp',
    playVideo: 'Prehrať video',
    card: { bedsShort: 'spál.', bargain: 'Výhodná ponuka' },
    post: { minutes: 'min čítania', caseStudy: 'Prípadová štúdia' },
    map: {
      pin: 'Poloha nehnuteľnosti na mape',
      browse: 'Mapa nehnuteľností',
      windowsHelp: 'Na priblíženie použite Ctrl + koliesko myši',
      macHelp: 'Na priblíženie použite ⌘ + koliesko myši',
      mobileHelp: 'Na posun mapy použite dva prsty',
      zoomIn: 'Priblížiť',
      zoomOut: 'Oddialiť',
      unavailable: 'Mapu sa nepodarilo načítať. Skúste to prosím neskôr.',
    },
    photoTips: { heading: 'Skôr než začnete fotiť', guide: 'Kompletný fotografický návod', why: 'Prečo na tom záleží' },
    onsite: {
      heading: 'Zveriť fotografie profesionálovi',
      intro:
        'Voliteľné. Ak si zvolíte túto možnosť, náš kolega vás bude kontaktovať, aby dohodol termín a vysvetlil, ako zaplatiť. Zatiaľ nič neplatíte.',
      none: 'Nie, ďakujem',
      noneBody: 'Fotografie urobím sám.',
      once: 'jednorazový poplatok',
    },
    dutchAgent: {
      title: 'Holandsky hovoriaci realitný maklér',
      body:
        'Chcete osobnú pomoc od makléra, ktorý hovorí po holandsky? Ozveme sa vám, prediskutujeme vaše potreby a spoločne dohodneme cenu.',
      price: 'Cena na mieru',
      photoNote:
        'Profesionálne fotografovanie je možné za individuálnu prémiovú cenu, nad bežnú maďarskú cenu.',
    },
    emptyCatalogue: {
      title: 'Čoskoro sa tu objavia nové nehnuteľnosti.',
      hint:
        'Zadajte bezplatné zadanie na hľadanie a ako prví vám dáme vedieť, keď pribudne niečo vhodné.',
    },
  },
  it: {
    valuationNav: 'Valutazione',
    legal: {
      imprint: 'Note legali',
      privacy: 'Privacy',
      terms: 'Condizioni',
      cookies: 'Cookie',
      accessibility: 'Accessibilità',
    },
    vatLabel: 'Partita IVA',
    backToTop: 'Torna su',
    updatedLabel: 'Ultimo aggiornamento',
    founded: (year) => `Fondata nel ${year} all’Aia, nei Paesi Bassi.`,
    newsTitle: 'Veda per primo i nuovi annunci',
    newsBody: 'Una newsletter mensile con i nuovi annunci e le novità dal mercato ungherese.',
    cookie: {
      title: 'Cookie',
      body: 'Questo sito utilizza solo i cookie strettamente necessari al suo funzionamento. Le statistiche vengono rilevate solo con il Suo consenso esplicito.',
      accept: 'Accetta',
      reject: 'Rifiuta',
      more: 'Dettagli',
    },
    newsletter: {
      label: 'Indirizzo e-mail',
      placeholder: 'Il Suo indirizzo e-mail',
      submit: 'Iscriviti',
      note: 'Al massimo una o due e-mail al mese. Prima Le inviamo una conferma, e può annullare l’iscrizione in qualsiasi momento.',
      privacy: 'Privacy',
      ok: 'Quasi fatto. Le abbiamo inviato un’e-mail di conferma: clicchi sul pulsante al suo interno.',
      error: 'Non è stato possibile. Controlli l’indirizzo e riprovi.',
      email: 'Inserisca un indirizzo e-mail valido.',
      sending: 'Invio in corso…',
    },
    search: { placeholder: 'Comune, contea o numero di riferimento', placeholderShort: 'Comune o riferimento' },
    whatsapp: 'Ci scriva su WhatsApp',
    playVideo: 'Riproduci video',
    card: { bedsShort: 'cam.', bargain: 'Occasione' },
    post: { minutes: 'min di lettura', caseStudy: 'Caso di studio' },
    map: {
      pin: 'Posizione dell’immobile sulla mappa',
      browse: 'Mappa degli immobili',
      windowsHelp: 'Usi Ctrl + rotellina per ingrandire la mappa',
      macHelp: 'Usi ⌘ + scorrimento per ingrandire la mappa',
      mobileHelp: 'Usi due dita per spostare la mappa',
      zoomIn: 'Ingrandisci',
      zoomOut: 'Riduci',
      unavailable: 'Impossibile caricare la mappa. Riprovi più tardi.',
    },
    photoTips: { heading: 'Prima di scattare le foto', guide: 'La guida fotografica completa', why: 'Perché è importante' },
    onsite: {
      heading: 'Preferisco affidarlo a un professionista',
      intro:
        'Facoltativo. Se sceglie questa opzione, un membro del nostro team La contatterà per fissare una data e spiegarLe come pagare. Ora non paga nulla.',
      none: 'No, grazie',
      noneBody: 'Le foto le scatto io.',
      once: 'tariffa una tantum',
    },
    dutchAgent: {
      title: 'Agente immobiliare di lingua olandese',
      body:
        'Desidera l’aiuto personale di un agente che parla olandese? La contatteremo per capire le sue esigenze e concordare insieme un prezzo.',
      price: 'Prezzo su misura',
      photoNote:
        'La fotografia professionale è disponibile a un prezzo premium su misura, in aggiunta al normale prezzo ungherese.',
    },
    emptyCatalogue: {
      title: 'A breve qui compariranno nuovi immobili.',
      hint:
        'Invii una richiesta di ricerca gratuita e Le comunicheremo per primi quando arriverà qualcosa di adatto.',
    },
  },
  pt: {
    valuationNav: 'Avaliação',
    legal: {
      imprint: 'Informação legal',
      privacy: 'Privacidade',
      terms: 'Termos',
      cookies: 'Cookies',
      accessibility: 'Acessibilidade',
    },
    vatLabel: 'Número de IVA',
    backToTop: 'Voltar ao topo',
    updatedLabel: 'Última atualização',
    founded: (year) => `Fundada em ${year} na Haia, nos Países Baixos.`,
    newsTitle: 'Seja o primeiro a ver os novos anúncios',
    newsBody: 'Uma newsletter mensal com novos anúncios e notícias do mercado húngaro.',
    cookie: {
      title: 'Cookies',
      body: 'Este site utiliza apenas os cookies estritamente necessários ao seu funcionamento. Só recolhemos estatísticas com o seu consentimento expresso.',
      accept: 'Aceitar',
      reject: 'Rejeitar',
      more: 'Detalhes',
    },
    newsletter: {
      label: 'Endereço de e-mail',
      placeholder: 'O seu endereço de e-mail',
      submit: 'Subscrever',
      note: 'No máximo um ou dois e-mails por mês. Primeiro enviamos uma confirmação, e pode cancelar a subscrição a qualquer momento.',
      privacy: 'Privacidade',
      ok: 'Quase concluído. Enviámos-lhe um e-mail de confirmação; clique no botão que contém.',
      error: 'Não foi possível. Verifique o endereço e tente novamente.',
      email: 'Introduza um endereço de e-mail válido.',
      sending: 'A enviar…',
    },
    search: { placeholder: 'Localidade, condado ou número de referência', placeholderShort: 'Localidade ou referência' },
    whatsapp: 'Escreva-nos no WhatsApp',
    playVideo: 'Reproduzir vídeo',
    card: { bedsShort: 'quartos', bargain: 'Oportunidade' },
    post: { minutes: 'min de leitura', caseStudy: 'Estudo de caso' },
    map: {
      pin: 'Localização do imóvel no mapa',
      browse: 'Mapa dos imóveis',
      windowsHelp: 'Use Ctrl + roda do rato para ampliar o mapa',
      macHelp: 'Use ⌘ + deslizar para ampliar o mapa',
      mobileHelp: 'Use dois dedos para mover o mapa',
      zoomIn: 'Ampliar',
      zoomOut: 'Reduzir',
      unavailable: 'Não foi possível carregar o mapa. Tente novamente mais tarde.',
    },
    photoTips: { heading: 'Antes de tirar as fotografias', guide: 'O guia de fotografia completo', why: 'Porque é importante' },
    onsite: {
      heading: 'Prefiro confiar a um profissional',
      intro:
        'Opcional. Se escolher esta opção, um membro da nossa equipa entrará em contacto consigo para marcar uma data e explicar como pagar. Não paga nada agora.',
      none: 'Não, obrigado',
      noneBody: 'Eu tiro as fotografias.',
      once: 'taxa única',
    },
    dutchAgent: {
      title: 'Agente imobiliário de língua neerlandesa',
      body:
        'Gostaria de ajuda pessoal de um agente que fale neerlandês? Entraremos em contacto consigo para falar das suas necessidades e acordar um preço.',
      price: 'Preço personalizado',
      photoNote:
        'A fotografia profissional está disponível a um preço premium personalizado, acrescido do preço húngaro habitual.',
    },
    emptyCatalogue: {
      title: 'Em breve surgirão aqui novos imóveis.',
      hint:
        'Faça um pedido de pesquisa gratuito e avisamos primeiro quando surgir algo adequado.',
    },
  },
  el: {
    valuationNav: 'Εκτίμηση',
    legal: {
      imprint: 'Νομικές πληροφορίες',
      privacy: 'Απόρρητο',
      terms: 'Όροι',
      cookies: 'Cookies',
      accessibility: 'Προσβασιμότητα',
    },
    vatLabel: 'ΑΦΜ',
    backToTop: 'Επιστροφή στην αρχή',
    updatedLabel: 'Τελευταία ενημέρωση',
    founded: (year) => `Ιδρύθηκε το ${year} στη Χάγη της Ολλανδίας.`,
    newsTitle: 'Δείτε πρώτοι τις νέες αγγελίες',
    newsBody: 'Μηνιαίο ενημερωτικό δελτίο με νέες αγγελίες και νέα από την ουγγρική αγορά.',
    cookie: {
      title: 'Cookies',
      body: 'Ο ιστότοπος χρησιμοποιεί μόνο τα cookies που είναι απολύτως απαραίτητα για τη λειτουργία του. Στατιστικά στοιχεία συλλέγουμε μόνο με τη ρητή συγκατάθεσή σας.',
      accept: 'Αποδοχή',
      reject: 'Απόρριψη',
      more: 'Λεπτομέρειες',
    },
    newsletter: {
      label: 'Διεύθυνση email',
      placeholder: 'Η διεύθυνση email σας',
      submit: 'Εγγραφή',
      note: 'Το πολύ ένα ή δύο email τον μήνα. Πρώτα σας στέλνουμε επιβεβαίωση και μπορείτε να διαγραφείτε οποιαδήποτε στιγμή.',
      privacy: 'Απόρρητο',
      ok: 'Σχεδόν τελειώσατε. Σας στείλαμε email επιβεβαίωσης· πατήστε το κουμπί που περιέχει.',
      error: 'Δεν ήταν δυνατό. Ελέγξτε τη διεύθυνση και δοκιμάστε ξανά.',
      email: 'Εισαγάγετε μια έγκυρη διεύθυνση email.',
      sending: 'Αποστολή…',
    },
    search: { placeholder: 'Οικισμός, νομός ή κωδικός αναφοράς', placeholderShort: 'Οικισμός ή κωδικός' },
    whatsapp: 'Γράψτε μας στο WhatsApp',
    playVideo: 'Αναπαραγωγή βίντεο',
    card: { bedsShort: 'υπν.', bargain: 'Ευκαιρία' },
    post: { minutes: 'λεπτά ανάγνωσης', caseStudy: 'Μελέτη περίπτωσης' },
    map: {
      pin: 'Θέση του ακινήτου στον χάρτη',
      browse: 'Χάρτης ακινήτων',
      windowsHelp: 'Χρησιμοποιήστε Ctrl + κύλιση για μεγέθυνση του χάρτη',
      macHelp: 'Χρησιμοποιήστε ⌘ + κύλιση για μεγέθυνση του χάρτη',
      mobileHelp: 'Χρησιμοποιήστε δύο δάχτυλα για να μετακινήσετε τον χάρτη',
      zoomIn: 'Μεγέθυνση',
      zoomOut: 'Σμίκρυνση',
      unavailable: 'Δεν ήταν δυνατή η φόρτωση του χάρτη. Δοκιμάστε ξανά αργότερα.',
    },
    photoTips: { heading: 'Πριν τραβήξετε φωτογραφίες', guide: 'Ο πλήρης οδηγός φωτογράφισης', why: 'Γιατί έχει σημασία' },
    onsite: {
      heading: 'Προτιμώ να το αναθέσω σε επαγγελματία',
      intro:
        'Προαιρετικό. Αν το επιλέξετε, ένα μέλος της ομάδας μας θα επικοινωνήσει μαζί σας για να κανονίσετε ημερομηνία και να σας εξηγήσει τον τρόπο πληρωμής. Τώρα δεν πληρώνετε τίποτα.',
      none: 'Όχι, ευχαριστώ',
      noneBody: 'Τις φωτογραφίες θα τις τραβήξω εγώ.',
      once: 'εφάπαξ χρέωση',
    },
    dutchAgent: {
      title: 'Ολλανδόφωνος μεσίτης ακινήτων',
      body:
        'Θέλετε προσωπική βοήθεια από μεσίτη που μιλά ολλανδικά; Θα επικοινωνήσουμε μαζί σας για να συζητήσουμε τις ανάγκες σας και να συμφωνήσουμε μαζί μια τιμή.',
      price: 'Εξατομικευμένη τιμή',
      photoNote:
        'Η επαγγελματική φωτογράφιση είναι διαθέσιμη σε εξατομικευμένη τιμή premium, επιπλέον της συνήθους ουγγρικής τιμής.',
    },
    emptyCatalogue: {
      title: 'Σύντομα θα εμφανιστούν εδώ νέα ακίνητα.',
      hint:
        'Υποβάλετε δωρεάν αίτημα αναζήτησης και θα σας ενημερώσουμε πρώτοι όταν προκύψει κάτι κατάλληλο.',
    },
  },
  cs: {
    valuationNav: 'Odhad ceny',
    legal: {
      imprint: 'Právní informace',
      privacy: 'Ochrana osobních údajů',
      terms: 'Podmínky',
      cookies: 'Cookies',
      accessibility: 'Přístupnost',
    },
    vatLabel: 'DIČ',
    backToTop: 'Zpět nahoru',
    updatedLabel: 'Naposledy aktualizováno',
    founded: (year) => `Založeno v roce ${year} v Haagu v Nizozemsku.`,
    newsTitle: 'Nové nabídky uvidíte jako první',
    newsBody: 'Měsíční newsletter s novými nabídkami a zprávami z maďarského trhu.',
    cookie: {
      title: 'Cookies',
      body: 'Tento web používá pouze cookies nezbytně nutné pro jeho fungování. Statistiky měříme jen s vaším výslovným souhlasem.',
      accept: 'Přijmout',
      reject: 'Odmítnout',
      more: 'Podrobnosti',
    },
    newsletter: {
      label: 'E-mailová adresa',
      placeholder: 'Vaše e-mailová adresa',
      submit: 'Přihlásit k odběru',
      note: 'Nejvýše jeden nebo dva e-maily měsíčně. Nejprve vám pošleme potvrzení a odběr můžete kdykoli zrušit.',
      privacy: 'Ochrana osobních údajů',
      ok: 'Skoro hotovo. Poslali jsme vám potvrzovací e-mail; klikněte na tlačítko v něm.',
      error: 'Nepodařilo se. Zkontrolujte adresu a zkuste to znovu.',
      email: 'Zadejte platnou e-mailovou adresu.',
      sending: 'Odesílání…',
    },
    search: { placeholder: 'Obec, župa nebo referenční číslo', placeholderShort: 'Obec nebo reference' },
    whatsapp: 'Napište nám na WhatsApp',
    playVideo: 'Přehrát video',
    card: { bedsShort: 'lož.', bargain: 'Výhodná nabídka' },
    post: { minutes: 'min čtení', caseStudy: 'Případová studie' },
    map: {
      pin: 'Poloha nemovitosti na mapě',
      browse: 'Mapa nemovitostí',
      windowsHelp: 'Mapu přiblížíte pomocí Ctrl + kolečka myši',
      macHelp: 'Mapu přiblížíte pomocí ⌘ + posouvání',
      mobileHelp: 'Mapu posunete dvěma prsty',
      zoomIn: 'Přiblížit',
      zoomOut: 'Oddálit',
      unavailable: 'Mapu se nepodařilo načíst. Zkuste to prosím později.',
    },
    photoTips: { heading: 'Než začnete fotit', guide: 'Kompletní návod k fotografování', why: 'Proč na tom záleží' },
    onsite: {
      heading: 'Raději to svěřím profesionálovi',
      intro:
        'Nepovinné. Pokud tuto možnost zvolíte, ozve se vám člen našeho týmu, domluví s vámi termín a vysvětlí, jak zaplatit. Nyní nic neplatíte.',
      none: 'Ne, děkuji',
      noneBody: 'Fotografie si pořídím sám.',
      once: 'jednorázový poplatek',
    },
    dutchAgent: {
      title: 'Nizozemsky mluvící realitní makléř',
      body:
        'Chcete osobní pomoc makléře, který mluví nizozemsky? Ozveme se vám, probereme, co potřebujete, a společně se dohodneme na ceně.',
      price: 'Cena na míru',
      photoNote:
        'Profesionální fotografování je k dispozici za individuální prémiovou cenu, nad rámec běžné maďarské ceny.',
    },
    emptyCatalogue: {
      title: 'Brzy se zde objeví nové nemovitosti.',
      hint:
        'Zadejte bezplatnou poptávku a my vás jako první upozorníme, až přibude něco vhodného.',
    },
  },
  sl: {
    valuationNav: 'Ocena vrednosti',
    legal: {
      imprint: 'Pravno obvestilo',
      privacy: 'Zasebnost',
      terms: 'Pogoji',
      cookies: 'Piškotki',
      accessibility: 'Dostopnost',
    },
    vatLabel: 'ID za DDV',
    backToTop: 'Na vrh',
    updatedLabel: 'Zadnja posodobitev',
    founded: (year) => `Ustanovljeno leta ${year} v Haagu na Nizozemskem.`,
    newsTitle: 'Nove ponudbe si oglejte prvi',
    newsBody: 'Mesečne novice z novimi ponudbami in novicami z madžarskega trga.',
    cookie: {
      title: 'Piškotki',
      body: 'To spletno mesto uporablja le piškotke, ki so nujno potrebni za njegovo delovanje. Statistiko merimo le z vašo izrecno privolitvijo.',
      accept: 'Sprejmi',
      reject: 'Zavrni',
      more: 'Podrobnosti',
    },
    newsletter: {
      label: 'E-poštni naslov',
      placeholder: 'Vaš e-poštni naslov',
      submit: 'Naroči se',
      note: 'Največ eno ali dve sporočili na mesec. Najprej vam pošljemo potrditev, naročnino pa lahko kadar koli prekličete.',
      privacy: 'Zasebnost',
      ok: 'Skoraj končano. Poslali smo vam potrditveno sporočilo; kliknite gumb v njem.',
      error: 'Ni uspelo. Preverite naslov in poskusite znova.',
      email: 'Vnesite veljaven e-poštni naslov.',
      sending: 'Pošiljanje …',
    },
    search: { placeholder: 'Kraj, županija ali referenčna številka', placeholderShort: 'Kraj ali referenca' },
    whatsapp: 'Pišite nam na WhatsApp',
    playVideo: 'Predvajaj video',
    card: { bedsShort: 'spal.', bargain: 'Ugodna ponudba' },
    post: { minutes: 'min branja', caseStudy: 'Študija primera' },
    map: {
      pin: 'Lokacija nepremičnine na zemljevidu',
      browse: 'Zemljevid nepremičnin',
      windowsHelp: 'Za povečavo zemljevida uporabite Ctrl + kolešček',
      macHelp: 'Za povečavo zemljevida uporabite ⌘ + drsenje',
      mobileHelp: 'Zemljevid premikajte z dvema prstoma',
      zoomIn: 'Povečaj',
      zoomOut: 'Pomanjšaj',
      unavailable: 'Zemljevida ni bilo mogoče naložiti. Poskusite znova pozneje.',
    },
    photoTips: { heading: 'Preden začnete fotografirati', guide: 'Celotna navodila za fotografiranje', why: 'Zakaj je to pomembno' },
    onsite: {
      heading: 'Raje bi to prepustil strokovnjaku',
      intro:
        'Neobvezno. Če izberete to možnost, vas bo kontaktiral član naše ekipe, se z vami dogovoril za termin in pojasnil, kako plačati. Zdaj ne plačate ničesar.',
      none: 'Ne, hvala',
      noneBody: 'Fotografije bom posnel sam.',
      once: 'enkratno plačilo',
    },
    dutchAgent: {
      title: 'Nizozemsko govoreči nepremičninski posrednik',
      body:
        'Želite osebno pomoč posrednika, ki govori nizozemsko? Obrnili se bomo na vas, se pogovorili o vaših željah in skupaj dogovorili ceno.',
      price: 'Cena po dogovoru',
      photoNote:
        'Profesionalno fotografiranje je na voljo po individualni premium ceni, poleg običajne madžarske cene.',
    },
    emptyCatalogue: {
      title: 'Kmalu se bodo tukaj pojavile nove nepremičnine.',
      hint:
        'Oddajte brezplačno povpraševanje in prvi vas bomo obvestili, ko bo na voljo kaj primernega.',
    },
  },
  sv: {
    valuationNav: 'Värdering',
    legal: {
      imprint: 'Juridisk information',
      privacy: 'Integritet',
      terms: 'Villkor',
      cookies: 'Kakor',
      accessibility: 'Tillgänglighet',
    },
    vatLabel: 'Momsregistreringsnummer',
    backToTop: 'Till toppen',
    updatedLabel: 'Senast uppdaterad',
    founded: (year) => `Grundat ${year} i Haag, Nederländerna.`,
    newsTitle: 'Se nya annonser först',
    newsBody: 'Ett månatligt nyhetsbrev med nya annonser och nyheter från den ungerska marknaden.',
    cookie: {
      title: 'Kakor',
      body: 'Den här webbplatsen använder bara kakor som är absolut nödvändiga för att den ska fungera. Vi mäter statistik endast med ditt uttryckliga samtycke.',
      accept: 'Godkänn',
      reject: 'Avvisa',
      more: 'Detaljer',
    },
    newsletter: {
      label: 'E-postadress',
      placeholder: 'Din e-postadress',
      submit: 'Prenumerera',
      note: 'Högst ett eller två mejl i månaden. Vi skickar först en bekräftelse, och du kan avsluta prenumerationen när som helst.',
      privacy: 'Integritet',
      ok: 'Nästan klart. Vi har skickat ett bekräftelsemejl till dig; klicka på knappen i det.',
      error: 'Det gick inte. Kontrollera adressen och försök igen.',
      email: 'Ange en giltig e-postadress.',
      sending: 'Skickar…',
    },
    search: { placeholder: 'Ort, län eller referensnummer', placeholderShort: 'Ort eller referens' },
    whatsapp: 'Skriv till oss på WhatsApp',
    playVideo: 'Spela upp video',
    card: { bedsShort: 'sovr.', bargain: 'Fynd' },
    post: { minutes: 'min läsning', caseStudy: 'Fallstudie' },
    map: {
      pin: 'Fastighetens läge på kartan',
      browse: 'Karta över fastigheter',
      windowsHelp: 'Använd Ctrl + scroll för att zooma kartan',
      macHelp: 'Använd ⌘ + scroll för att zooma kartan',
      mobileHelp: 'Använd två fingrar för att flytta kartan',
      zoomIn: 'Zooma in',
      zoomOut: 'Zooma ut',
      unavailable: 'Kartan kunde inte laddas. Försök igen senare.',
    },
    photoTips: { heading: 'Innan du fotograferar', guide: 'Den fullständiga fotoguiden', why: 'Varför det spelar roll' },
    onsite: {
      heading: 'Jag vill hellre överlåta det åt en proffsfotograf',
      intro:
        'Valfritt. Om du väljer detta kontaktar någon i vårt team dig för att boka en tid och förklara hur du betalar. Du betalar ingenting nu.',
      none: 'Nej tack',
      noneBody: 'Jag tar bilderna själv.',
      once: 'engångsavgift',
    },
    dutchAgent: {
      title: 'Nederländskspråkig fastighetsmäklare',
      body:
        'Vill du ha personlig hjälp av en mäklare som talar nederländska? Vi kontaktar dig för att tala om vad du behöver och komma överens om ett pris.',
      price: 'Pris enligt överenskommelse',
      photoNote:
        'Professionell fotografering finns till ett individuellt premiumpris, utöver det vanliga ungerska priset.',
    },
    emptyCatalogue: {
      title: 'Nya bostäder dyker snart upp här.',
      hint:
        'Lämna en kostnadsfri sökförfrågan så meddelar vi dig först när något passande kommer in.',
    },
  },
  da: {
    valuationNav: 'Vurdering',
    legal: {
      imprint: 'Juridisk information',
      privacy: 'Privatliv',
      terms: 'Vilkår',
      cookies: 'Cookies',
      accessibility: 'Tilgængelighed',
    },
    vatLabel: 'Momsnummer',
    backToTop: 'Til toppen',
    updatedLabel: 'Senest opdateret',
    founded: (year) => `Grundlagt i ${year} i Haag, Nederlandene.`,
    newsTitle: 'Se nye annoncer først',
    newsBody: 'Et månedligt nyhedsbrev med nye annoncer og nyheder fra det ungarske marked.',
    cookie: {
      title: 'Cookies',
      body: 'Dette websted bruger kun cookies, der er strengt nødvendige for, at det fungerer. Vi måler kun statistik med dit udtrykkelige samtykke.',
      accept: 'Accepter',
      reject: 'Afvis',
      more: 'Detaljer',
    },
    newsletter: {
      label: 'E-mailadresse',
      placeholder: 'Din e-mailadresse',
      submit: 'Tilmeld',
      note: 'Højst en eller to e-mails om måneden. Vi sender først en bekræftelse, og du kan til enhver tid afmelde dig.',
      privacy: 'Privatliv',
      ok: 'Næsten færdig. Vi har sendt dig en bekræftelsesmail; klik på knappen i den.',
      error: 'Det lykkedes ikke. Kontrollér adressen, og prøv igen.',
      email: 'Angiv en gyldig e-mailadresse.',
      sending: 'Sender…',
    },
    search: { placeholder: 'By, amt eller referencenummer', placeholderShort: 'By eller reference' },
    whatsapp: 'Skriv til os på WhatsApp',
    playVideo: 'Afspil video',
    card: { bedsShort: 'sov.', bargain: 'Godt køb' },
    post: { minutes: 'min. læsning', caseStudy: 'Casestudie' },
    map: {
      pin: 'Ejendommens placering på kortet',
      browse: 'Kort over ejendomme',
      windowsHelp: 'Brug Ctrl + scroll for at zoome på kortet',
      macHelp: 'Brug ⌘ + scroll for at zoome på kortet',
      mobileHelp: 'Brug to fingre til at flytte kortet',
      zoomIn: 'Zoom ind',
      zoomOut: 'Zoom ud',
      unavailable: 'Kortet kunne ikke indlæses. Prøv igen senere.',
    },
    photoTips: { heading: 'Før du tager billeder', guide: 'Den komplette fotoguide', why: 'Hvorfor det er vigtigt' },
    onsite: {
      heading: 'Jeg vil hellere overlade det til en professionel',
      intro:
        'Valgfrit. Hvis du vælger dette, kontakter en fra vores team dig for at aftale en dato og forklare, hvordan du betaler. Du betaler ikke noget nu.',
      none: 'Nej tak',
      noneBody: 'Jeg tager selv billederne.',
      once: 'engangsgebyr',
    },
    dutchAgent: {
      title: 'Hollandsktalende ejendomsmægler',
      body:
        'Vil du have personlig hjælp fra en mægler, der taler hollandsk? Vi kontakter dig for at tale om dine behov og aftale en pris sammen.',
      price: 'Pris efter aftale',
      photoNote:
        'Professionel fotografering kan fås til en individuel premiumpris, oven i den almindelige ungarske pris.',
    },
    emptyCatalogue: {
      title: 'Nye boliger dukker snart op her.',
      hint:
        'Opret en gratis søgeopgave, så giver vi dig besked først, når der kommer noget passende.',
    },
  },
  no: {
    valuationNav: 'Verdivurdering',
    legal: {
      imprint: 'Juridisk informasjon',
      privacy: 'Personvern',
      terms: 'Vilkår',
      cookies: 'Informasjonskapsler',
      accessibility: 'Tilgjengelighet',
    },
    vatLabel: 'MVA-nummer',
    backToTop: 'Til toppen',
    updatedLabel: 'Sist oppdatert',
    founded: (year) => `Grunnlagt i ${year} i Haag, Nederland.`,
    newsTitle: 'Se nye annonser først',
    newsBody: 'Et månedlig nyhetsbrev med nye annonser og nyheter fra det ungarske markedet.',
    cookie: {
      title: 'Informasjonskapsler',
      body: 'Dette nettstedet bruker bare informasjonskapsler som er strengt nødvendige for at det skal fungere. Vi måler statistikk bare med ditt uttrykkelige samtykke.',
      accept: 'Godta',
      reject: 'Avvis',
      more: 'Detaljer',
    },
    newsletter: {
      label: 'E-postadresse',
      placeholder: 'Din e-postadresse',
      submit: 'Abonner',
      note: 'Høyst én eller to e-poster i måneden. Vi sender først en bekreftelse, og du kan melde deg av når som helst.',
      privacy: 'Personvern',
      ok: 'Nesten ferdig. Vi har sendt deg en bekreftelse på e-post; klikk på knappen i den.',
      error: 'Det gikk ikke. Kontroller adressen og prøv igjen.',
      email: 'Skriv inn en gyldig e-postadresse.',
      sending: 'Sender…',
    },
    search: { placeholder: 'Sted, fylke eller referansenummer', placeholderShort: 'Sted eller referanse' },
    whatsapp: 'Skriv til oss på WhatsApp',
    playVideo: 'Spill av video',
    card: { bedsShort: 'sov.', bargain: 'Godt kjøp' },
    post: { minutes: 'min lesetid', caseStudy: 'Casestudie' },
    map: {
      pin: 'Eiendommens beliggenhet på kartet',
      browse: 'Kart over eiendommer',
      windowsHelp: 'Bruk Ctrl + rulling for å zoome kartet',
      macHelp: 'Bruk ⌘ + rulling for å zoome kartet',
      mobileHelp: 'Bruk to fingre for å flytte kartet',
      zoomIn: 'Zoom inn',
      zoomOut: 'Zoom ut',
      unavailable: 'Kartet kunne ikke lastes. Prøv igjen senere.',
    },
    photoTips: { heading: 'Før du tar bilder', guide: 'Den komplette fotoguiden', why: 'Hvorfor det er viktig' },
    onsite: {
      heading: 'Jeg vil heller overlate det til en profesjonell',
      intro:
        'Valgfritt. Hvis du velger dette, tar noen fra teamet vårt kontakt med deg for å avtale en dato og forklare hvordan du betaler. Du betaler ingenting nå.',
      none: 'Nei takk',
      noneBody: 'Jeg tar bildene selv.',
      once: 'engangsgebyr',
    },
    dutchAgent: {
      title: 'Nederlandsktalende eiendomsmegler',
      body:
        'Vil du ha personlig hjelp fra en megler som snakker nederlandsk? Vi kontakter deg for å snakke om hva du trenger og bli enige om en pris.',
      price: 'Pris etter avtale',
      photoNote:
        'Profesjonell fotografering er tilgjengelig til en individuell premiumpris, i tillegg til den vanlige ungarske prisen.',
    },
    emptyCatalogue: {
      title: 'Nye boliger dukker snart opp her.',
      hint:
        'Legg inn en gratis søkeforespørsel, så gir vi deg beskjed først når det kommer noe passende.',
    },
  },
  fi: {
    valuationNav: 'Arvio',
    legal: {
      imprint: 'Oikeudelliset tiedot',
      privacy: 'Tietosuoja',
      terms: 'Ehdot',
      cookies: 'Evästeet',
      accessibility: 'Saavutettavuus',
    },
    vatLabel: 'ALV-tunniste',
    backToTop: 'Takaisin ylös',
    updatedLabel: 'Päivitetty viimeksi',
    founded: (year) => `Perustettu vuonna ${year} Haagissa, Alankomaissa.`,
    newsTitle: 'Näe uudet ilmoitukset ensimmäisenä',
    newsBody: 'Kuukausittainen uutiskirje, jossa on uusia ilmoituksia ja uutisia Unkarin markkinoilta.',
    cookie: {
      title: 'Evästeet',
      body: 'Tämä sivusto käyttää vain evästeitä, jotka ovat ehdottoman välttämättömiä sen toiminnalle. Keräämme tilastoja vain nimenomaisella suostumuksellasi.',
      accept: 'Hyväksy',
      reject: 'Hylkää',
      more: 'Lisätiedot',
    },
    newsletter: {
      label: 'Sähköpostiosoite',
      placeholder: 'Sähköpostiosoitteesi',
      submit: 'Tilaa',
      note: 'Enintään yksi tai kaksi viestiä kuukaudessa. Lähetämme ensin vahvistuksen, ja voit perua tilauksen milloin tahansa.',
      privacy: 'Tietosuoja',
      ok: 'Melkein valmista. Lähetimme sinulle vahvistusviestin; napsauta siinä olevaa painiketta.',
      error: 'Se ei onnistunut. Tarkista osoite ja yritä uudelleen.',
      email: 'Anna kelvollinen sähköpostiosoite.',
      sending: 'Lähetetään…',
    },
    search: { placeholder: 'Paikkakunta, lääni tai viitenumero', placeholderShort: 'Paikkakunta tai viite' },
    whatsapp: 'Lähetä meille viesti WhatsAppissa',
    playVideo: 'Toista video',
    card: { bedsShort: 'mh', bargain: 'Löytö' },
    post: { minutes: 'min lukuaika', caseStudy: 'Tapaustutkimus' },
    map: {
      pin: 'Kiinteistön sijainti kartalla',
      browse: 'Kiinteistöt kartalla',
      windowsHelp: 'Lähennä karttaa painamalla Ctrl ja vierittämällä',
      macHelp: 'Lähennä karttaa painamalla ⌘ ja vierittämällä',
      mobileHelp: 'Siirrä karttaa kahdella sormella',
      zoomIn: 'Lähennä',
      zoomOut: 'Loitonna',
      unavailable: 'Karttaa ei voitu ladata. Yritä myöhemmin uudelleen.',
    },
    photoTips: { heading: 'Ennen kuin kuvaat', guide: 'Koko valokuvausopas', why: 'Miksi tällä on väliä' },
    onsite: {
      heading: 'Annan mieluummin ammattilaisen hoitaa sen',
      intro:
        'Valinnainen. Jos valitset tämän, tiimimme jäsen ottaa sinuun yhteyttä sopiakseen ajankohdan ja kertoakseen, miten maksu tapahtuu. Et maksa nyt mitään.',
      none: 'Ei kiitos',
      noneBody: 'Otan kuvat itse.',
      once: 'kertamaksu',
    },
    dutchAgent: {
      title: 'Hollanninkielinen kiinteistönvälittäjä',
      body:
        'Haluatko henkilökohtaista apua hollantia puhuvalta välittäjältä? Otamme sinuun yhteyttä, keskustelemme tarpeistasi ja sovimme hinnasta yhdessä.',
      price: 'Hinta sopimuksen mukaan',
      photoNote:
        'Ammattivalokuvaus on saatavilla yksilöllisellä premium-hinnalla tavallisen unkarilaisen hinnan lisäksi.',
    },
    emptyCatalogue: {
      title: 'Uusia kohteita ilmestyy tänne pian.',
      hint:
        'Jätä maksuton hakutoive, niin kerromme sinulle ensimmäisenä, kun sopiva kohde tulee myyntiin.',
    },
  },
  et: {
    valuationNav: 'Hindamine',
    legal: {
      imprint: 'Õiguslik teave',
      privacy: 'Privaatsus',
      terms: 'Tingimused',
      cookies: 'Küpsised',
      accessibility: 'Ligipääsetavus',
    },
    vatLabel: 'KMKR number',
    backToTop: 'Tagasi üles',
    updatedLabel: 'Viimati uuendatud',
    founded: (year) => `Asutatud ${year}. aastal Haagis, Madalmaades.`,
    newsTitle: 'Nähke uusi kuulutusi esimesena',
    newsBody: 'Igakuine uudiskiri uute kuulutuste ja Ungari turu uudistega.',
    cookie: {
      title: 'Küpsised',
      body: 'See veebisait kasutab ainult küpsiseid, mis on selle toimimiseks hädavajalikud. Statistikat kogume ainult teie selgesõnalisel nõusolekul.',
      accept: 'Nõustun',
      reject: 'Keeldun',
      more: 'Üksikasjad',
    },
    newsletter: {
      label: 'E-posti aadress',
      placeholder: 'Teie e-posti aadress',
      submit: 'Telli',
      note: 'Kõige rohkem üks või kaks kirja kuus. Esmalt saadame kinnituse ja tellimusest saate loobuda igal ajal.',
      privacy: 'Privaatsus',
      ok: 'Peaaegu valmis. Saatsime teile kinnituskirja; klõpsake selles oleval nupul.',
      error: 'See ei õnnestunud. Kontrollige aadressi ja proovige uuesti.',
      email: 'Sisestage kehtiv e-posti aadress.',
      sending: 'Saatmine…',
    },
    search: { placeholder: 'Asula, maakond või viitenumber', placeholderShort: 'Asula või viide' },
    whatsapp: 'Kirjutage meile WhatsAppis',
    playVideo: 'Esita video',
    card: { bedsShort: 'mtb', bargain: 'Soodne pakkumine' },
    post: { minutes: 'min lugemist', caseStudy: 'Juhtumiuuring' },
    map: {
      pin: 'Kinnisvara asukoht kaardil',
      browse: 'Kinnisvara kaart',
      windowsHelp: 'Kaardi suumimiseks kasutage Ctrl + kerimist',
      macHelp: 'Kaardi suumimiseks kasutage ⌘ + kerimist',
      mobileHelp: 'Kaardi liigutamiseks kasutage kahte sõrme',
      zoomIn: 'Suurenda',
      zoomOut: 'Vähenda',
      unavailable: 'Kaarti ei õnnestunud laadida. Proovige hiljem uuesti.',
    },
    photoTips: { heading: 'Enne pildistamist', guide: 'Täielik fotojuhend', why: 'Miks see on oluline' },
    onsite: {
      heading: 'Eelistan selle professionaalile usaldada',
      intro:
        'Valikuline. Kui selle valite, võtab meie meeskonna liige teiega ühendust, et leppida kokku aeg ja selgitada, kuidas maksta. Praegu te midagi ei maksa.',
      none: 'Ei, aitäh',
      noneBody: 'Pildistan ise.',
      once: 'ühekordne tasu',
    },
    dutchAgent: {
      title: 'Hollandi keelt kõnelev kinnisvaramaakler',
      body:
        'Kas soovite isiklikku abi hollandi keelt kõnelevalt maaklerilt? Võtame teiega ühendust, arutame teie vajadusi ja lepime koos kokku hinna.',
      price: 'Hind kokkuleppel',
      photoNote:
        'Professionaalne fotograafia on saadaval individuaalse premium-hinnaga, tavalise Ungari hinna lisaks.',
    },
    emptyCatalogue: {
      title: 'Siia lisandub peagi uusi kinnisvara.',
      hint:
        'Esitage tasuta otsingupäring ja anname teile esimesena teada, kui ilmub midagi sobivat.',
    },
  },
  lv: {
    valuationNav: 'Novērtējums',
    legal: {
      imprint: 'Juridiskā informācija',
      privacy: 'Privātums',
      terms: 'Noteikumi',
      cookies: 'Sīkdatnes',
      accessibility: 'Piekļūstamība',
    },
    vatLabel: 'PVN numurs',
    backToTop: 'Uz augšu',
    updatedLabel: 'Pēdējoreiz atjaunināts',
    founded: (year) => `Dibināts ${year}. gadā Hāgā, Nīderlandē.`,
    newsTitle: 'Uzziniet par jauniem sludinājumiem pirmie',
    newsBody: 'Ikmēneša jaunumu vēstule ar jauniem sludinājumiem un ziņām no Ungārijas tirgus.',
    cookie: {
      title: 'Sīkdatnes',
      body: 'Šī vietne izmanto tikai sīkdatnes, kas ir absolūti nepieciešamas tās darbībai. Statistiku apkopojam tikai ar jūsu skaidru piekrišanu.',
      accept: 'Piekrītu',
      reject: 'Noraidīt',
      more: 'Sīkāk',
    },
    newsletter: {
      label: 'E-pasta adrese',
      placeholder: 'Jūsu e-pasta adrese',
      submit: 'Pierakstīties',
      note: 'Ne vairāk kā viena vai divas vēstules mēnesī. Vispirms nosūtām apstiprinājumu, un no jaunumiem varat atteikties jebkurā laikā.',
      privacy: 'Privātums',
      ok: 'Gandrīz gatavs. Mēs jums nosūtījām apstiprinājuma e-pastu; noklikšķiniet uz tajā esošās pogas.',
      error: 'Neizdevās. Pārbaudiet adresi un mēģiniet vēlreiz.',
      email: 'Ievadiet derīgu e-pasta adresi.',
      sending: 'Sūta…',
    },
    search: { placeholder: 'Apdzīvotā vieta, mede vai atsauces numurs', placeholderShort: 'Vieta vai atsauce' },
    whatsapp: 'Rakstiet mums WhatsApp',
    playVideo: 'Atskaņot video',
    card: { bedsShort: 'guļ.', bargain: 'Izdevīgs piedāvājums' },
    post: { minutes: 'min lasīšanai', caseStudy: 'Gadījuma izpēte' },
    map: {
      pin: 'Īpašuma atrašanās vieta kartē',
      browse: 'Īpašumu karte',
      windowsHelp: 'Lai tuvinātu karti, izmantojiet Ctrl + ritināšanu',
      macHelp: 'Lai tuvinātu karti, izmantojiet ⌘ + ritināšanu',
      mobileHelp: 'Lai pārvietotu karti, izmantojiet divus pirkstus',
      zoomIn: 'Tuvināt',
      zoomOut: 'Tālināt',
      unavailable: 'Karti neizdevās ielādēt. Lūdzu, mēģiniet vēlāk vēlreiz.',
    },
    photoTips: { heading: 'Pirms fotografēšanas', guide: 'Pilnais fotografēšanas ceļvedis', why: 'Kāpēc tas ir svarīgi' },
    onsite: {
      heading: 'Labprātāk uzticēšu to profesionālim',
      intro:
        'Pēc izvēles. Ja izvēlēsieties šo iespēju, mūsu komandas loceklis ar jums sazināsies, lai vienotos par datumu un paskaidrotu, kā samaksāt. Tagad jūs neko nemaksājat.',
      none: 'Nē, paldies',
      noneBody: 'Fotografēšu pats.',
      once: 'vienreizēja maksa',
    },
    dutchAgent: {
      title: 'Holandiešu valodā runājošs nekustamā īpašuma aģents',
      body:
        'Vai vēlaties personīgu palīdzību no aģenta, kas runā holandiešu valodā? Sazināsimies ar jums, pārrunāsim jūsu vajadzības un kopīgi vienosimies par cenu.',
      price: 'Cena pēc vienošanās',
      photoNote:
        'Profesionāla fotografēšana ir pieejama par individuālu premium cenu papildus parastajai Ungārijas cenai.',
    },
    emptyCatalogue: {
      title: 'Drīzumā šeit parādīsies jauni īpašumi.',
      hint:
        'Iesniedziet bezmaksas meklēšanas pieprasījumu, un mēs jūs informēsim pirmos, kad parādīsies kaut kas piemērots.',
    },
  },
  lt: {
    valuationNav: 'Vertinimas',
    legal: {
      imprint: 'Teisinė informacija',
      privacy: 'Privatumas',
      terms: 'Sąlygos',
      cookies: 'Slapukai',
      accessibility: 'Prieinamumas',
    },
    vatLabel: 'PVM mokėtojo kodas',
    backToTop: 'Į viršų',
    updatedLabel: 'Paskutinį kartą atnaujinta',
    founded: (year) => `Įkurta ${year} m. Hagoje, Nyderlanduose.`,
    newsTitle: 'Naujus skelbimus pamatykite pirmieji',
    newsBody: 'Mėnesinis naujienlaiškis su naujais skelbimais ir Vengrijos rinkos naujienomis.',
    cookie: {
      title: 'Slapukai',
      body: 'Ši svetainė naudoja tik slapukus, kurie būtini jos veikimui. Statistiką renkame tik gavę jūsų aiškų sutikimą.',
      accept: 'Sutinku',
      reject: 'Atmesti',
      more: 'Išsamiau',
    },
    newsletter: {
      label: 'El. pašto adresas',
      placeholder: 'Jūsų el. pašto adresas',
      submit: 'Prenumeruoti',
      note: 'Ne daugiau kaip vienas ar du laiškai per mėnesį. Pirmiausia išsiunčiame patvirtinimą, o prenumeratos galite atsisakyti bet kada.',
      privacy: 'Privatumas',
      ok: 'Beveik baigta. Išsiuntėme jums patvirtinimo laišką; spustelėkite jame esantį mygtuką.',
      error: 'Nepavyko. Patikrinkite adresą ir bandykite dar kartą.',
      email: 'Įveskite galiojantį el. pašto adresą.',
      sending: 'Siunčiama…',
    },
    search: { placeholder: 'Gyvenvietė, apskritis arba nuorodos numeris', placeholderShort: 'Vieta arba nuoroda' },
    whatsapp: 'Rašykite mums per WhatsApp',
    playVideo: 'Paleisti vaizdo įrašą',
    card: { bedsShort: 'mieg.', bargain: 'Geras pasiūlymas' },
    post: { minutes: 'min skaitymo', caseStudy: 'Atvejo analizė' },
    map: {
      pin: 'Turto vieta žemėlapyje',
      browse: 'Turto žemėlapis',
      windowsHelp: 'Norėdami keisti mastelį, naudokite Ctrl + slinkimą',
      macHelp: 'Norėdami keisti mastelį, naudokite ⌘ + slinkimą',
      mobileHelp: 'Žemėlapį perkelkite dviem pirštais',
      zoomIn: 'Priartinti',
      zoomOut: 'Nutolinti',
      unavailable: 'Nepavyko įkelti žemėlapio. Bandykite vėliau dar kartą.',
    },
    photoTips: { heading: 'Prieš fotografuodami', guide: 'Visas fotografavimo vadovas', why: 'Kodėl tai svarbu' },
    onsite: {
      heading: 'Mieliau patikėsiu tai profesionalui',
      intro:
        'Neprivaloma. Jei tai pasirinksite, mūsų komandos narys susisieks su jumis, kad suderintų datą ir paaiškintų, kaip sumokėti. Dabar nieko nemokate.',
      none: 'Ne, ačiū',
      noneBody: 'Fotografuosiu pats.',
      once: 'vienkartinis mokestis',
    },
    dutchAgent: {
      title: 'Olandiškai kalbantis nekilnojamojo turto agentas',
      body:
        'Ar norite asmeninės pagalbos iš olandiškai kalbančio agento? Susisieksime su jumis, aptarsime jūsų poreikius ir kartu susitarsime dėl kainos.',
      price: 'Kaina pagal susitarimą',
      photoNote:
        'Profesionali fotografija galima už individualią premium kainą, papildomai prie įprastos Vengrijos kainos.',
    },
    emptyCatalogue: {
      title: 'Netrukus čia atsiras naujo turto.',
      hint:
        'Pateikite nemokamą paieškos užklausą, ir mes pirmieji informuosime, kai atsiras kas nors tinkama.',
    },
  },
};
