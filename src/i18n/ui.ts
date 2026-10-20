/**
 * FODEL vocabulary.
 *
 * Nav labels, category names and taglines are FODEL's own words for hu and nl,
 * taken from their live sites (scraped 27 July 2026). English, German and French
 * were written for this site from src/i18n/GLOSSARY.md, one term per concept.
 */

export const LOCALES = ['hu', 'nl', 'en', 'de', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

/** Every market FODEL sells in. Kept as an alias: all five now have a full site. */
export const PLANNED_LOCALES = LOCALES;
export type PlannedLocale = Locale;

/** A value written out once per language. The compiler refuses a missing one. */
export type L10n<T = string> = Record<Locale, T>;

/** Pick the visitor's language from a complete set of translations. */
export function pick<T>(locale: Locale, values: L10n<T>): T {
  return values[locale];
}

/**
 * A positional picker for short inline strings:
 *
 *   const x = localizer(locale);
 *   x('Ingatlanok', 'Ons aanbod', 'Properties', 'Immobilien', 'Biens')
 *
 * The order is always hu, nl, en, de, fr, and all five arguments are required,
 * so a sixth language or a forgotten translation is a compile error, never a
 * silent fall-through to Dutch. Longer texts belong in a data file instead.
 */
export function localizer(locale: Locale) {
  const index = LOCALES.indexOf(locale);
  return (hu: string, nl: string, en: string, de: string, fr: string): string => [hu, nl, en, de, fr][index];
}

export const LOCALE_META = {
  hu: { htmlLang: 'hu', ogLocale: 'hu_HU', hreflang: 'hu', label: 'Magyar', short: 'HU', flag: 'hu' },
  nl: { htmlLang: 'nl', ogLocale: 'nl_NL', hreflang: 'nl', label: 'Nederlands', short: 'NL', flag: 'nl' },
  en: { htmlLang: 'en-GB', ogLocale: 'en_GB', hreflang: 'en', label: 'English', short: 'EN', flag: 'gb' },
  de: { htmlLang: 'de', ogLocale: 'de_DE', hreflang: 'de', label: 'Deutsch', short: 'DE', flag: 'de' },
  fr: { htmlLang: 'fr', ogLocale: 'fr_FR', hreflang: 'fr', label: 'Français', short: 'FR', flag: 'fr' },
} as const satisfies Record<Locale, { htmlLang: string; ogLocale: string; hreflang: string; label: string; short: string; flag: string }>;

export type SwitcherLocale = Locale;

/**
 * What the nav's language menu offers. All five languages are complete sites;
 * the order is the order of the menu. ROUTES and UI are typed per Locale, and
 * scripts/verify-ssg.mjs enforces hreflang reciprocity, so a language with no
 * page behind it cannot be emitted by accident.
 */
export const SWITCHER_LOCALES = LOCALES.map((code) => ({ code })) as ReadonlyArray<{ code: Locale }>;

/** The language a visitor gets when nothing else tells us (root page, x-default). */
export const FALLBACK_LOCALE: Locale = 'nl';

/** Verbatim per market. These are the lines FODEL leads with today. */
export const BRAND = {
  hu: {
    name: 'FODEL INGATLAN',
    tagline: 'Magyar ingatlanok hirdetése Hollandiában és az Unió többi országában',
    positioning: 'FODEL Ingatlan – Holland-magyar ingatlanközvetítő iroda',
    signature: 'Problémamentes, diszkrét ingatlanközvetítés',
  },
  nl: {
    name: 'FODEL VASTGOED',
    tagline: 'Onroerend goed kopen direct van de eigenaar',
    positioning: 'FODEL Vastgoed – Makelaar in Hongarije',
    signature: 'Probleemloze, discrete vastgoedbemiddeling',
  },
  en: {
    name: 'FODEL REAL ESTATES',
    tagline: 'Buy property in Hungary direct from the owner',
    positioning: 'FODEL Real Estates – Estate agent in Hungary',
    signature: 'Hassle-free, discreet property sales',
  },
  de: {
    name: 'FODEL IMMOBILIEN',
    tagline: 'Immobilien in Ungarn direkt vom Eigentümer kaufen',
    positioning: 'FODEL Immobilien – niederländische Agentur für Immobilien in Ungarn',
    signature: 'Problemlose, diskrete Immobilienvermittlung',
  },
  fr: {
    name: 'FODEL IMMOBILIER',
    tagline: 'Acheter un bien en Hongrie, directement auprès du propriétaire',
    positioning: 'FODEL – Agence immobilière en Hongrie',
    signature: 'Une intermédiation immobilière discrète et sans souci',
  },
} as const;

/* ── Property categories ───────────────────────────────────────────────────
   Keys are stable slugs used in content files and URLs. Labels are FODEL's
   own category names in each market, taken from their live navigation.
   ------------------------------------------------------------------------ */

export const CATEGORY_FALLBACK = {
  house: {
    hu: { label: 'Eladó ház', slug: 'haz' },
    nl: { label: 'Huis', slug: 'huis' },
    en: { label: 'House', slug: 'house' },
    de: { label: 'Haus', slug: 'haus' },
    fr: { label: 'Maison', slug: 'maison' },
    schema: 'SingleFamilyResidence',
  },
  holiday: {
    hu: { label: 'Eladó nyaraló', slug: 'nyaralo' },
    nl: { label: 'Vakantiehuis', slug: 'vakantiehuis' },
    en: { label: 'Holiday home', slug: 'holiday-home' },
    de: { label: 'Ferienhaus', slug: 'ferienhaus' },
    fr: { label: 'Maison de vacances', slug: 'maison-de-vacances' },
    schema: 'House',
  },
  farm: {
    hu: { label: 'Eladó tanya', slug: 'tanya' },
    nl: { label: 'Boerderij', slug: 'boerderij' },
    en: { label: 'Farm', slug: 'farm' },
    de: { label: 'Bauernhof', slug: 'bauernhof' },
    fr: { label: 'Ferme', slug: 'ferme' },
    schema: 'House',
  },
  land: {
    hu: { label: 'Eladó telek', slug: 'telek' },
    nl: { label: 'Perceel', slug: 'perceel' },
    en: { label: 'Land', slug: 'land' },
    de: { label: 'Grundstück', slug: 'grundstueck' },
    fr: { label: 'Terrain', slug: 'terrain' },
    schema: 'LandForm',
  },
  commercial: {
    hu: { label: 'Üzleti ingatlan', slug: 'uzleti-ingatlan' },
    nl: { label: 'Bedrijfsaanbod', slug: 'bedrijfsaanbod' },
    en: { label: 'Commercial property', slug: 'commercial-property' },
    de: { label: 'Gewerbeimmobilie', slug: 'gewerbeimmobilie' },
    fr: { label: 'Immobilier commercial', slug: 'immobilier-commercial' },
    schema: 'Place',
  },
  agricultural: {
    hu: { label: 'Agráringatlan', slug: 'agraringatlan' },
    nl: { label: 'Agrarisch onroerend goed', slug: 'agrarisch-onroerend-goed' },
    en: { label: 'Agricultural property', slug: 'agricultural-property' },
    de: { label: 'Agrarimmobilie', slug: 'agrarimmobilie' },
    fr: { label: 'Immobilier agricole', slug: 'immobilier-agricole' },
    schema: 'Place',
  },
  mansion: {
    hu: { label: 'Kúria, kastély', slug: 'kuria-kastely' },
    nl: { label: 'Landhuis, herenhuis', slug: 'landhuis' },
    en: { label: 'Country house, manor', slug: 'manor-house' },
    de: { label: 'Landhaus, Herrenhaus', slug: 'landhaus' },
    fr: { label: 'Manoir, maison de maître', slug: 'manoir' },
    schema: 'House',
  },
  apartment: {
    hu: { label: 'Eladó lakás', slug: 'lakas' },
    nl: { label: 'Appartement', slug: 'appartement' },
    en: { label: 'Flat', slug: 'flat' },
    de: { label: 'Wohnung', slug: 'wohnung' },
    fr: { label: 'Appartement', slug: 'appartement' },
    schema: 'Apartment',
  },
  industrial: {
    hu: { label: 'Ipari ingatlan', slug: 'ipari-ingatlan' },
    nl: { label: 'Bedrijfspand', slug: 'bedrijfspand' },
    en: { label: 'Industrial property', slug: 'industrial-property' },
    de: { label: 'Industrieimmobilie', slug: 'industrieimmobilie' },
    fr: { label: 'Immobilier industriel', slug: 'immobilier-industriel' },
    schema: 'Place',
  },
} as const;

/* ── Route slugs ──────────────────────────────────────────────────────────
   Localised per market so each language ranks on its own keywords.
   ------------------------------------------------------------------------ */

export const ROUTES = {
  hu: {
    home: '',
    properties: 'ingatlanok',
    sellers: 'eladoknak',
    buyers: 'vevoknek',
    about: 'rolunk',
    contact: 'kapcsolat',
    blog: 'blog',
    priceList: 'arlista',
    submitAd: 'hirdetes-feladasa',
    searchRequest: 'kerestetes',
    valuation: 'ertekbecsles',
    services: 'szolgaltatasok',
    agricultural: 'agraringatlan',
    faq: 'gyik',
    photoGuide: 'fotozasi-utmutato',
    buyingGuide: 'vasarlas-magyarorszagon',
    emigration: 'holland-koltozes',
    sold: 'eladva',
    map: 'terkep',
    top10: 'top-10',
    privacy: 'adatvedelem',
    terms: 'aszf',
    cookies: 'cookie-tajekoztato',
    imprint: 'impresszum',
    accessibility: 'akadalymentesites',
    thanks: 'koszonjuk',
    /** Detail pattern mirrors fodel.nl's own `woonhuis-te-koop-1550`. */
    detail: (categorySlug: string, ref: string) => `${categorySlug}-elado-${ref}`,
  },
  nl: {
    home: '',
    properties: 'woningen',
    sellers: 'adverteren',
    buyers: 'kopers',
    about: 'over-ons',
    contact: 'contact',
    blog: 'nieuws',
    priceList: 'tarieven',
    submitAd: 'advertentie-plaatsen',
    searchRequest: 'zoekdienst',
    valuation: 'waardebepaling',
    services: 'diensten',
    agricultural: 'agrarisch-vastgoed',
    faq: 'veelgestelde-vragen',
    photoGuide: 'fotografiegids',
    buyingGuide: 'kopen-in-hongarije',
    emigration: 'emigreren',
    sold: 'verkocht',
    map: 'kaart',
    top10: 'top-10',
    privacy: 'privacy',
    terms: 'voorwaarden',
    cookies: 'cookies',
    imprint: 'colofon',
    accessibility: 'toegankelijkheid',
    thanks: 'bedankt',
    detail: (categorySlug: string, ref: string) => `${categorySlug}-te-koop-${ref}`,
  },
  en: {
    home: '',
    properties: 'properties',
    sellers: 'sell',
    buyers: 'buy',
    about: 'about-us',
    contact: 'contact',
    blog: 'blog',
    priceList: 'prices',
    submitAd: 'place-an-ad',
    searchRequest: 'property-search',
    valuation: 'valuation',
    services: 'services',
    agricultural: 'agricultural-property',
    faq: 'faq',
    photoGuide: 'photo-guide',
    buyingGuide: 'buying-in-hungary',
    emigration: 'moving-to-hungary',
    sold: 'sold',
    map: 'map',
    top10: 'top-10',
    privacy: 'privacy',
    terms: 'terms',
    cookies: 'cookies',
    imprint: 'imprint',
    accessibility: 'accessibility',
    thanks: 'thank-you',
    detail: (categorySlug: string, ref: string) => `${categorySlug}-for-sale-${ref}`,
  },
  de: {
    home: '',
    properties: 'immobilien',
    sellers: 'verkaufen',
    buyers: 'kaufen',
    about: 'ueber-uns',
    contact: 'kontakt',
    blog: 'blog',
    priceList: 'preise',
    submitAd: 'inserat-aufgeben',
    searchRequest: 'suchauftrag',
    valuation: 'bewertung',
    services: 'leistungen',
    agricultural: 'agrarimmobilien',
    faq: 'haeufige-fragen',
    photoGuide: 'fotoratgeber',
    buyingGuide: 'kaufen-in-ungarn',
    emigration: 'auswandern-nach-ungarn',
    sold: 'verkauft',
    map: 'karte',
    top10: 'top-10',
    privacy: 'datenschutz',
    terms: 'agb',
    cookies: 'cookies',
    imprint: 'impressum',
    accessibility: 'barrierefreiheit',
    thanks: 'danke',
    detail: (categorySlug: string, ref: string) => `${categorySlug}-zu-verkaufen-${ref}`,
  },
  fr: {
    home: '',
    properties: 'biens',
    sellers: 'vendre',
    buyers: 'acheter',
    about: 'a-propos',
    contact: 'contact',
    blog: 'blog',
    priceList: 'tarifs',
    submitAd: 'deposer-une-annonce',
    searchRequest: 'recherche-de-bien',
    valuation: 'estimation',
    services: 'services',
    agricultural: 'immobilier-agricole',
    faq: 'questions-frequentes',
    photoGuide: 'guide-photo',
    buyingGuide: 'acheter-en-hongrie',
    emigration: 's-installer-en-hongrie',
    sold: 'vendus',
    map: 'carte',
    top10: 'top-10',
    privacy: 'confidentialite',
    terms: 'conditions',
    cookies: 'cookies',
    imprint: 'mentions-legales',
    accessibility: 'accessibilite',
    thanks: 'merci',
    detail: (categorySlug: string, ref: string) => `${categorySlug}-a-vendre-${ref}`,
  },
} as const;

export type RouteKey = Exclude<keyof (typeof ROUTES)['hu'], 'detail'>;

/* ── UI strings ───────────────────────────────────────────────────────── */

const UI_HU_NL = {
  hu: {
    skipToContent: 'Ugrás a tartalomra',
    menu: 'Menü',
    close: 'Bezárás',
    language: 'Nyelv',
    comingSoon: 'Hamarosan',

    nav: {
      home: 'Kezdőlap',
      properties: 'Ingatlanok',
      sellers: 'Eladóknak',
      buyers: 'Vevőknek',
      about: 'Rólunk',
      blog: 'Blog',
      contact: 'Kapcsolat',
    },

    cta: {
      contact: 'Kapcsolat',
      login: 'Bejelentkezés',
      /** The nav's account control: one pill, two words, a quiet slash between. */
      accountLogin: 'Belépés',
      accountRegister: 'Regisztráció',
      callback: 'Ingyenes visszahívás',
      allProperties: 'Összes ingatlan',
      viewProperty: 'Megtekintés',
      learnMore: 'Tudjon meg többet',
      browseProperties: 'Ingatlanok böngészése',
      advertise: 'Hirdessen nálunk',
      priceList: 'Árlista megtekintése',
      submitAd: 'Hirdetés feladása',
      searchRequest: 'Ingyenes kerestetés',
      freeConsult: 'Ingyenes konzultáció',
      send: 'Üzenet küldése',
      readMore: 'Tovább olvasom',
      getInTouch: 'Vegye fel velünk a kapcsolatot',
    },

    property: {
      reference: 'Azonosító',
      price: 'Irányár',
      beds: 'Szobák',
      baths: 'Fürdők',
      area: 'Alapterület',
      land: 'Telek',
      epc: 'Energetikai besorolás',
      epcMissing: 'Folyamatban',
      yearBuilt: 'Építés éve',
      condition: 'Állapot',
      heating: 'Fűtés',
      features: 'Jellemzők',
      description: 'Leírás',
      location: 'Elhelyezkedés',
      similar: 'Hasonló ingatlanok',
      similarInRegion: 'A régióban',
      gallery: 'Galéria',
      video: 'Videó',
      prevImage: 'Előző kép',
      nextImage: 'Következő kép',
      sold: 'Eladva',
      reserved: 'Foglalt',
      ownerContact: 'A tulajdonos elérhetősége',
      ownerContactNote:
        'Ennél az ingatlannál a tulajdonos neve és elérhetősége is megjelenik. Közvetlenül felveheti vele a kapcsolatot, jutalék nélkül.',
      enquire: 'Visszahívás',
      enquireTitle: 'Hívjuk vissza 24 órán belül',
      priceOnRequest: 'Ár egyeztetés alapján',
    },

    filters: {
      title: 'Ingatlanok szűrése',
      /** Bold intro line above the homepage search card, separate from it. */
      heroHeading: 'Találja meg az Önnek való ingatlant',
      type: 'Típus',
      region: 'Régió',
      price: 'Ár',
      area: 'Alapterület',
      land: 'Telek',
      beds: 'Szobák',
      all: 'Mind',
      any: 'Mindegy',
      sort: 'Rendezés',
      sortFeatured: 'Kiemeltek elöl',
      sortPriceAsc: 'Ár szerint növekvő',
      sortPriceDesc: 'Ár szerint csökkenő',
      sortAreaDesc: 'Alapterület szerint',
      search: 'Keresés',
      reset: 'Szűrők törlése',
      results: (n: number) => (n === 1 ? '1 ingatlan' : `${n} ingatlan`),
      noResults: 'Nincs a szűrésnek megfelelő ingatlan.',
      noResultsHint: 'Próbálja tágabb feltételekkel, vagy kérjen ingyenes kerestetést.',
      county: 'Megye',
      country: 'Ország',
      settlement: 'Település',
      areaFrom: 'Alapterület ettől',
      areaTo: 'Alapterület eddig',
      landFrom: 'Telek ettől',
      landTo: 'Telek eddig',
      entireCountry: 'Egész ország',
      bargain: 'Alkalmi vételek',
      excludeAdobe: 'Vályogházak nélkül',
      viewMap: 'Megtekintés térképen',
      viewList: 'Vissza a listához',
      /** Shown on the map page when a bounding box came from "search this area". */
      areaFiltered: 'A térkép kijelölt területére szűrve',
    },

    form: {
      name: 'Név',
      email: 'E-mail cím',
      phone: 'Telefon',
      subject: 'Tárgy',
      message: 'Üzenet',
      messagePlaceholder: 'Írja le kérdését vagy igényét…',
      required: 'kötelező',
      optional: 'nem kötelező',
      consent:
        'Hozzájárulok, hogy a FODEL a megadott adataimat a megkeresésem megválaszolása céljából kezelje.',
      consentLink: 'Adatvédelmi tájékoztató',
      submit: 'Üzenet küldése',
      sending: 'Küldés…',
      sendError: 'Nem sikerült elküldeni. Kérjük, próbálja újra, vagy hívjon minket.',
      successTitle: 'Köszönjük!',
      successBody:
        'Üzenetét megkaptuk. Munkatársunk hamarosan felveszi Önnel a kapcsolatot. {hours}',
      errorTitle: 'Nem sikerült elküldeni',
      errorBody: 'Kérjük, próbálja újra, vagy hívjon minket a +36 70 225 5255 számon.',
      errorRequired: 'Kérjük, töltse ki ezt a mezőt.',
      errorEmail: 'Kérjük, adjon meg érvényes e-mail címet.',
      errorConsent: 'A folytatáshoz kérjük, fogadja el az adatkezelési tájékoztatót.',
    },

    footer: {
      navigation: 'Navigáció',
      categories: 'Kategóriák',
      contact: 'Elérhetőség',
      legal: 'Jogi információk',
      companyDetails: 'Cégadatok',
      hours: 'Nyitvatartás',
      callbackNote: 'A visszahívást mi fizetjük. Önnek semmibe nem kerül.',
      /** Portal entry point. Until 1.1 nothing on the public site linked to
       *  /portal at all, so an owner could not find their own login page. */
      portalLogin: 'Hirdetői belépés',
    },

    a11y: {
      breadcrumb: 'Morzsamenü',
      mainNav: 'Fő navigáció',
      langSwitch: 'Nyelvváltás',
      imageOf: (n: number, total: number) => `${n}. kép (${total} közül)`,
    },
  },

  nl: {
    skipToContent: 'Naar de inhoud',
    menu: 'Menu',
    close: 'Sluiten',
    language: 'Taal',
    comingSoon: 'Binnenkort',

    nav: {
      home: 'Home',
      properties: 'Vastgoed',
      sellers: 'Adverteren',
      buyers: 'Voor kopers',
      about: 'Over ons',
      blog: 'Nieuws',
      contact: 'Contact',
    },

    cta: {
      contact: 'Contact',
      login: 'Inloggen',
      accountLogin: 'Inloggen',
      accountRegister: 'Registreren',
      callback: 'Gratis terugbellen',
      allProperties: 'Alle woningen',
      viewProperty: 'Bekijken',
      learnMore: 'Meer informatie',
      browseProperties: 'Woningen bekijken',
      advertise: 'Adverteer bij ons',
      priceList: 'Tarieven bekijken',
      submitAd: 'Advertentie plaatsen',
      searchRequest: 'Gratis zoekopdracht',
      freeConsult: 'Gratis advies',
      send: 'Bericht versturen',
      readMore: 'Verder lezen',
      getInTouch: 'Neem contact met ons op',
    },

    property: {
      reference: 'Referentie',
      price: 'Vraagprijs',
      beds: 'Slaapkamers',
      baths: 'Badkamers',
      area: 'Woonoppervlak',
      land: 'Perceel',
      epc: 'Energielabel',
      epcMissing: 'In aanvraag',
      yearBuilt: 'Bouwjaar',
      condition: 'Staat',
      heating: 'Verwarming',
      features: 'Kenmerken',
      description: 'Omschrijving',
      location: 'Ligging',
      similar: 'Vergelijkbaar aanbod',
      similarInRegion: 'In de regio',
      gallery: 'Galerij',
      video: 'Video',
      prevImage: 'Vorige foto',
      nextImage: 'Volgende foto',
      sold: 'Verkocht',
      reserved: 'Onder optie',
      ownerContact: 'Contact met de eigenaar',
      ownerContactNote:
        'Bij deze woning tonen wij ook de naam en het telefoonnummer van de eigenaar. U kunt rechtstreeks contact opnemen, zonder courtage.',
      enquire: 'Terugbellen',
      enquireTitle: 'Wij bellen u binnen 24 uur terug',
      priceOnRequest: 'Prijs op aanvraag',
    },

    filters: {
      title: 'Woningen filteren',
      /** Bold intro line above the homepage search card, separate from it. */
      heroHeading: 'Vind de woning die bij u past',
      type: 'Type',
      region: 'Regio',
      price: 'Prijs',
      area: 'Woonoppervlak',
      land: 'Perceel',
      beds: 'Slaapkamers',
      all: 'Alle',
      any: 'Maakt niet uit',
      sort: 'Sorteren',
      sortFeatured: 'Aanbevolen eerst',
      sortPriceAsc: 'Prijs oplopend',
      sortPriceDesc: 'Prijs aflopend',
      sortAreaDesc: 'Oppervlakte',
      search: 'Zoeken',
      reset: 'Filters wissen',
      results: (n: number) => (n === 1 ? '1 woning' : `${n} woningen`),
      noResults: 'Geen woningen gevonden met deze filters.',
      noResultsHint: 'Probeer ruimere criteria, of plaats een gratis zoekopdracht.',
      county: 'Comitaat',
      country: 'Land',
      settlement: 'Plaats',
      areaFrom: 'Woonoppervlak vanaf',
      areaTo: 'Woonoppervlak tot',
      landFrom: 'Perceel vanaf',
      landTo: 'Perceel tot',
      entireCountry: 'Heel Hongarije',
      bargain: 'Buitenkansen',
      excludeAdobe: 'Zonder leemhuizen',
      viewMap: 'Op de kaart bekijken',
      viewList: 'Terug naar de lijst',
      areaFiltered: 'Gefilterd op het gekozen kaartgebied',
    },

    form: {
      name: 'Naam',
      email: 'E-mailadres',
      phone: 'Telefoon',
      subject: 'Onderwerp',
      message: 'Bericht',
      messagePlaceholder: 'Beschrijf uw vraag of wens…',
      required: 'verplicht',
      optional: 'optioneel',
      consent:
        'Ik ga ermee akkoord dat FODEL mijn gegevens gebruikt om mijn vraag te beantwoorden.',
      consentLink: 'Privacyverklaring',
      submit: 'Bericht versturen',
      sending: 'Versturen…',
      sendError: 'Versturen is niet gelukt. Probeer het opnieuw, of bel ons.',
      successTitle: 'Dank u wel!',
      successBody:
        'Wij hebben uw bericht ontvangen. Een medewerker neemt spoedig contact met u op. {hours}',
      errorTitle: 'Versturen mislukt',
      errorBody: 'Probeer het opnieuw, of bel ons op +31 6 4400 5550.',
      errorRequired: 'Vul dit veld in.',
      errorEmail: 'Vul een geldig e-mailadres in.',
      errorConsent: 'Ga akkoord met de privacyverklaring om verder te gaan.',
    },

    footer: {
      navigation: 'Navigatie',
      categories: 'Categorieën',
      contact: 'Contact',
      legal: 'Juridisch',
      companyDetails: 'Bedrijfsgegevens',
      hours: 'Openingstijden',
      callbackNote: 'Wij bellen u terug. Dat kost u niets.',
      portalLogin: 'Inloggen voor adverteerders',
    },

    a11y: {
      breadcrumb: 'Kruimelpad',
      mainNav: 'Hoofdnavigatie',
      langSwitch: 'Taal wijzigen',
      imageOf: (n: number, total: number) => `Foto ${n} van ${total}`,
    },
  },
};

export type UiStrings = (typeof UI_HU_NL)['hu'];

const EN: UiStrings = {
  skipToContent: 'Skip to content',
  menu: 'Menu',
  close: 'Close',
  language: 'Language',
  comingSoon: 'Coming soon',

  nav: {
    home: 'Home',
    properties: 'Properties',
    sellers: 'For sellers',
    buyers: 'For buyers',
    about: 'About us',
    blog: 'Blog',
    contact: 'Contact',
  },

  cta: {
    contact: 'Contact',
    login: 'Sign in',
    accountLogin: 'Sign in',
    accountRegister: 'Register',
    callback: 'Free callback',
    allProperties: 'All properties',
    viewProperty: 'View',
    learnMore: 'Learn more',
    browseProperties: 'Browse properties',
    advertise: 'Advertise with us',
    priceList: 'View prices',
    submitAd: 'Place a listing',
    searchRequest: 'Free property search',
    freeConsult: 'Free advice',
    send: 'Send message',
    readMore: 'Read on',
    getInTouch: 'Get in touch',
  },

  property: {
    reference: 'Reference',
    price: 'Asking price',
    beds: 'Bedrooms',
    baths: 'Bathrooms',
    area: 'Floor area',
    land: 'Plot',
    epc: 'Energy rating',
    epcMissing: 'Pending',
    yearBuilt: 'Year built',
    condition: 'Condition',
    heating: 'Heating',
    features: 'Features',
    description: 'Description',
    location: 'Location',
    similar: 'Similar properties',
    similarInRegion: 'In the region',
    gallery: 'Gallery',
    video: 'Video',
    prevImage: 'Previous photo',
    nextImage: 'Next photo',
    sold: 'Sold',
    reserved: 'Under offer',
    ownerContact: 'Contact the owner',
    ownerContactNote:
      'For this property we also show the owner’s name and phone number. You can contact them directly, with no commission to pay.',
    enquire: 'Callback',
    enquireTitle: 'We will call you back within 24 hours',
    priceOnRequest: 'Price on request',
  },

  filters: {
    title: 'Filter properties',
    heroHeading: 'Find the property that suits you',
    type: 'Type',
    region: 'Region',
    price: 'Price',
    area: 'Floor area',
    land: 'Plot',
    beds: 'Bedrooms',
    all: 'All',
    any: 'Any',
    sort: 'Sort by',
    sortFeatured: 'Featured first',
    sortPriceAsc: 'Price, low to high',
    sortPriceDesc: 'Price, high to low',
    sortAreaDesc: 'Floor area',
    search: 'Search',
    reset: 'Clear filters',
    results: (n: number) => (n === 1 ? '1 property' : `${n} properties`),
    noResults: 'No properties match these filters.',
    noResultsHint: 'Try wider criteria, or place a free search request.',
    county: 'County',
    country: 'Country',
    settlement: 'Town or village',
    areaFrom: 'Floor area from',
    areaTo: 'Floor area up to',
    landFrom: 'Plot from',
    landTo: 'Plot up to',
    entireCountry: 'All of Hungary',
    bargain: 'Bargains',
    excludeAdobe: 'No adobe houses',
    viewMap: 'View on the map',
    viewList: 'Back to the list',
    areaFiltered: 'Filtered to the selected map area',
  },

  form: {
    name: 'Name',
    email: 'Email address',
    phone: 'Phone',
    subject: 'Subject',
    message: 'Message',
    messagePlaceholder: 'Tell us what you would like to know…',
    required: 'required',
    optional: 'optional',
    consent: 'I agree that FODEL may use my details to answer my enquiry.',
    consentLink: 'Privacy notice',
    submit: 'Send message',
    sending: 'Sending…',
    sendError: 'Sending failed. Please try again, or call us.',
    successTitle: 'Thank you',
    successBody: 'We have received your message and will be in touch shortly. {hours}',
    errorTitle: 'Could not send',
    errorBody: 'Please try again, or call us on +31 6 4400 5550.',
    errorRequired: 'Please fill in this field.',
    errorEmail: 'Please enter a valid email address.',
    errorConsent: 'Please accept the privacy notice to continue.',
  },

  footer: {
    navigation: 'Navigation',
    categories: 'Categories',
    contact: 'Contact',
    legal: 'Legal',
    companyDetails: 'Company details',
    hours: 'Opening hours',
    callbackNote: 'We call you back, and the call costs you nothing.',
    portalLogin: 'Advertiser sign-in',
  },

  a11y: {
    breadcrumb: 'Breadcrumb',
    mainNav: 'Main navigation',
    langSwitch: 'Change language',
    imageOf: (n: number, total: number) => `Photo ${n} of ${total}`,
  },
};

const DE: UiStrings = {
  skipToContent: 'Zum Inhalt springen',
  menu: 'Menü',
  close: 'Schließen',
  language: 'Sprache',
  comingSoon: 'Demnächst',

  nav: {
    home: 'Startseite',
    properties: 'Immobilien',
    sellers: 'Für Verkäufer',
    buyers: 'Für Käufer',
    about: 'Über uns',
    blog: 'Blog',
    contact: 'Kontakt',
  },

  cta: {
    contact: 'Kontakt',
    login: 'Anmelden',
    accountLogin: 'Anmelden',
    accountRegister: 'Registrieren',
    callback: 'Kostenloser Rückruf',
    allProperties: 'Alle Immobilien',
    viewProperty: 'Ansehen',
    learnMore: 'Mehr erfahren',
    browseProperties: 'Immobilien ansehen',
    advertise: 'Bei uns inserieren',
    priceList: 'Preise ansehen',
    submitAd: 'Inserat aufgeben',
    searchRequest: 'Kostenloser Suchauftrag',
    freeConsult: 'Kostenlose Beratung',
    send: 'Nachricht senden',
    readMore: 'Weiterlesen',
    getInTouch: 'Kontakt aufnehmen',
  },

  property: {
    reference: 'Referenz',
    price: 'Angebotspreis',
    beds: 'Schlafzimmer',
    baths: 'Badezimmer',
    area: 'Wohnfläche',
    land: 'Grundstück',
    epc: 'Energieklasse',
    epcMissing: 'In Bearbeitung',
    yearBuilt: 'Baujahr',
    condition: 'Zustand',
    heating: 'Heizung',
    features: 'Ausstattung',
    description: 'Beschreibung',
    location: 'Lage',
    similar: 'Ähnliche Immobilien',
    similarInRegion: 'In der Region',
    gallery: 'Galerie',
    video: 'Video',
    prevImage: 'Voriges Foto',
    nextImage: 'Nächstes Foto',
    sold: 'Verkauft',
    reserved: 'Reserviert',
    ownerContact: 'Kontakt zum Eigentümer',
    ownerContactNote:
      'Bei dieser Immobilie nennen wir auch Namen und Telefonnummer des Eigentümers. Sie können ihn direkt kontaktieren, ohne Provision.',
    enquire: 'Rückruf',
    enquireTitle: 'Wir rufen Sie innerhalb von 24 Stunden zurück',
    priceOnRequest: 'Preis auf Anfrage',
  },

  filters: {
    title: 'Immobilien filtern',
    heroHeading: 'Finden Sie die Immobilie, die zu Ihnen passt',
    type: 'Typ',
    region: 'Region',
    price: 'Preis',
    area: 'Wohnfläche',
    land: 'Grundstück',
    beds: 'Schlafzimmer',
    all: 'Alle',
    any: 'Egal',
    sort: 'Sortieren',
    sortFeatured: 'Empfohlene zuerst',
    sortPriceAsc: 'Preis aufsteigend',
    sortPriceDesc: 'Preis absteigend',
    sortAreaDesc: 'Wohnfläche',
    search: 'Suchen',
    reset: 'Filter zurücksetzen',
    results: (n: number) => (n === 1 ? '1 Immobilie' : `${n} Immobilien`),
    noResults: 'Keine Immobilien für diese Filter gefunden.',
    noResultsHint: 'Wählen Sie weitere Kriterien oder geben Sie einen kostenlosen Suchauftrag auf.',
    county: 'Komitat',
    country: 'Land',
    settlement: 'Ort',
    areaFrom: 'Wohnfläche ab',
    areaTo: 'Wohnfläche bis',
    landFrom: 'Grundstück ab',
    landTo: 'Grundstück bis',
    entireCountry: 'Ganz Ungarn',
    bargain: 'Gelegenheiten',
    excludeAdobe: 'Ohne Lehmhäuser',
    viewMap: 'Auf der Karte ansehen',
    viewList: 'Zurück zur Liste',
    areaFiltered: 'Auf den gewählten Kartenausschnitt gefiltert',
  },

  form: {
    name: 'Name',
    email: 'E-Mail-Adresse',
    phone: 'Telefon',
    subject: 'Betreff',
    message: 'Nachricht',
    messagePlaceholder: 'Beschreiben Sie Ihre Frage oder Ihren Wunsch…',
    required: 'Pflichtfeld',
    optional: 'optional',
    consent: 'Ich bin damit einverstanden, dass FODEL meine Angaben zur Beantwortung meiner Anfrage verwendet.',
    consentLink: 'Datenschutzerklärung',
    submit: 'Nachricht senden',
    sending: 'Wird gesendet…',
    sendError: 'Das Senden ist fehlgeschlagen. Bitte versuchen Sie es erneut oder rufen Sie uns an.',
    successTitle: 'Vielen Dank',
    successBody: 'Wir haben Ihre Nachricht erhalten und melden uns in Kürze bei Ihnen. {hours}',
    errorTitle: 'Senden fehlgeschlagen',
    errorBody: 'Bitte versuchen Sie es erneut oder rufen Sie uns an: +31 6 4400 5550.',
    errorRequired: 'Bitte füllen Sie dieses Feld aus.',
    errorEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    errorConsent: 'Bitte akzeptieren Sie die Datenschutzerklärung, um fortzufahren.',
  },

  footer: {
    navigation: 'Navigation',
    categories: 'Kategorien',
    contact: 'Kontakt',
    legal: 'Rechtliches',
    companyDetails: 'Unternehmensangaben',
    hours: 'Öffnungszeiten',
    callbackNote: 'Wir rufen Sie zurück. Das Gespräch kostet Sie nichts.',
    portalLogin: 'Anmeldung für Inserenten',
  },

  a11y: {
    breadcrumb: 'Brotkrumennavigation',
    mainNav: 'Hauptnavigation',
    langSwitch: 'Sprache wechseln',
    imageOf: (n: number, total: number) => `Foto ${n} von ${total}`,
  },
};

/* French: a no-break space ( ) before ":" and inside « », a narrow one
   ( ) before ";", "!" and "?". Written as escapes so they stay visible. */
const FR: UiStrings = {
  skipToContent: 'Aller au contenu',
  menu: 'Menu',
  close: 'Fermer',
  language: 'Langue',
  comingSoon: 'Bientôt',

  nav: {
    home: 'Accueil',
    properties: 'Biens',
    sellers: 'Vendeurs',
    buyers: 'Acheteurs',
    about: 'À propos',
    blog: 'Blog',
    contact: 'Contact',
  },

  cta: {
    contact: 'Contact',
    login: 'Se connecter',
    accountLogin: 'Connexion',
    accountRegister: 'Inscription',
    callback: 'Rappel gratuit',
    allProperties: 'Tous les biens',
    viewProperty: 'Voir le bien',
    learnMore: 'En savoir plus',
    browseProperties: 'Voir les biens',
    advertise: 'Publier chez nous',
    priceList: 'Voir les tarifs',
    submitAd: 'Déposer une annonce',
    searchRequest: 'Recherche gratuite',
    freeConsult: 'Conseil gratuit',
    send: 'Envoyer le message',
    readMore: 'Lire la suite',
    getInTouch: 'Nous contacter',
  },

  property: {
    reference: 'Référence',
    price: 'Prix demandé',
    beds: 'Chambres',
    baths: 'Salles de bains',
    area: 'Surface habitable',
    land: 'Terrain',
    epc: 'Classe énergétique',
    epcMissing: 'En cours',
    yearBuilt: 'Année de construction',
    condition: 'État',
    heating: 'Chauffage',
    features: 'Caractéristiques',
    description: 'Description',
    location: 'Situation',
    similar: 'Biens similaires',
    similarInRegion: 'Dans la région',
    gallery: 'Galerie',
    video: 'Vidéo',
    prevImage: 'Photo précédente',
    nextImage: 'Photo suivante',
    sold: 'Vendu',
    reserved: 'Sous offre',
    ownerContact: 'Contact du propriétaire',
    ownerContactNote:
      'Pour ce bien, nous indiquons aussi le nom et le numéro de téléphone du propriétaire. Vous pouvez le contacter directement, sans commission.',
    enquire: 'Rappel',
    enquireTitle: 'Nous vous rappelons sous 24 heures',
    priceOnRequest: 'Prix sur demande',
  },

  filters: {
    title: 'Filtrer les biens',
    heroHeading: 'Trouvez le bien qui vous convient',
    type: 'Type',
    region: 'Région',
    price: 'Prix',
    area: 'Surface habitable',
    land: 'Terrain',
    beds: 'Chambres',
    all: 'Tous',
    any: 'Indifférent',
    sort: 'Trier',
    sortFeatured: 'Sélection en premier',
    sortPriceAsc: 'Prix croissant',
    sortPriceDesc: 'Prix décroissant',
    sortAreaDesc: 'Surface',
    search: 'Rechercher',
    reset: 'Effacer les filtres',
    results: (n: number) => (n === 1 ? '1 bien' : `${n} biens`),
    noResults: 'Aucun bien ne correspond à ces filtres.',
    noResultsHint: 'Élargissez vos critères ou déposez une demande de recherche gratuite.',
    county: 'Comitat',
    country: 'Pays',
    settlement: 'Localité',
    areaFrom: 'Surface à partir de',
    areaTo: 'Surface jusqu’à',
    landFrom: 'Terrain à partir de',
    landTo: 'Terrain jusqu’à',
    entireCountry: 'Toute la Hongrie',
    bargain: 'Bonnes affaires',
    excludeAdobe: 'Sans maisons en adobe',
    viewMap: 'Voir sur la carte',
    viewList: 'Retour à la liste',
    areaFiltered: 'Filtré sur la zone choisie de la carte',
  },

  form: {
    name: 'Nom',
    email: 'Adresse e-mail',
    phone: 'Téléphone',
    subject: 'Objet',
    message: 'Message',
    messagePlaceholder: 'Décrivez votre question ou votre souhait…',
    required: 'obligatoire',
    optional: 'facultatif',
    consent: 'J’accepte que FODEL utilise mes données pour répondre à ma demande.',
    consentLink: 'Politique de confidentialité',
    submit: 'Envoyer le message',
    sending: 'Envoi en cours…',
    sendError: 'L’envoi a échoué. Veuillez réessayer ou nous appeler.',
    successTitle: 'Merci',
    successBody: 'Nous avons bien reçu votre message et vous répondrons très prochainement. {hours}',
    errorTitle: 'Échec de l’envoi',
    errorBody: 'Veuillez réessayer ou nous appeler au +31 6 4400 5550.',
    errorRequired: 'Veuillez remplir ce champ.',
    errorEmail: 'Veuillez saisir une adresse e-mail valide.',
    errorConsent: 'Veuillez accepter la politique de confidentialité pour continuer.',
  },

  footer: {
    navigation: 'Navigation',
    categories: 'Catégories',
    contact: 'Contact',
    legal: 'Informations légales',
    companyDetails: 'Données de l’entreprise',
    hours: 'Horaires',
    callbackNote: 'Nous vous rappelons, et l’appel ne vous coûte rien.',
    portalLogin: 'Connexion annonceurs',
  },

  a11y: {
    breadcrumb: 'Fil d’Ariane',
    mainNav: 'Navigation principale',
    langSwitch: 'Changer de langue',
    imageOf: (n: number, total: number) => `Photo ${n} sur ${total}`,
  },
};

export const UI: Record<Locale, UiStrings> = { hu: UI_HU_NL.hu, nl: UI_HU_NL.nl, en: EN, de: DE, fr: FR };

/* ── Helpers ──────────────────────────────────────────────────────────── */

export function t(locale: Locale) {
  return UI[locale];
}

/** Build an absolute, locale-prefixed path. `path('hu', 'properties')` → `/hu/ingatlanok/` */
export function path(locale: Locale, key: RouteKey, ...rest: string[]): string {
  const slug = ROUTES[locale][key];
  const segments = [locale, slug, ...rest].filter(Boolean);
  return `/${segments.join('/')}/`.replace(/\/{2,}/g, '/');
}

/** Detail URL for a property, in FODEL's existing `type-te-koop-ref` shape. */
export function propertyPath(locale: Locale, categorySlug: string, ref: string): string {
  return `/${locale}/${ROUTES[locale].detail(categorySlug, ref)}/`;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * A language from whatever a form, a profile or a cookie holds. Anything that
 * is not one of the five falls back (Hungarian by default: FODEL's own language).
 */
export function localeFrom(value: unknown, fallback: Locale = 'hu'): Locale {
  return typeof value === 'string' && isLocale(value) ? value : fallback;
}

/** The language a path belongs to ("/de/kontakt/" → "de"), if it starts with one. */
export function localeOfPath(pathname: string): Locale | undefined {
  const first = pathname.split('/')[1];
  return first && isLocale(first) ? first : undefined;
}
