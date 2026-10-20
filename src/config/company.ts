/**
 * FODEL — single source of truth for every company fact on the site.
 *
 * Nothing here is invented. Every value is either published by FODEL on
 * fodel.nl / fodel.hu (scraped 27 July 2026) or explicitly marked as
 * outstanding. If a value is not verified, it is `null` — never a guess.
 *
 * Preflight (`npm run verify:ssg`) fails the build while `registration.kvk`
 * is null, because Dutch law requires the KvK number on the website.
 */

import type { Locale } from '~/i18n/ui';

export const COMPANY = {
  /** Legal / trading names, per market. All verbatim from their own sites. */
  names: {
    legal: 'FODEL VASTGOED',
    hu: 'FODEL INGATLAN',
    nl: 'FODEL Vastgoed',
    de: 'FODEL Immobilien',
    en: 'FODEL Real Estates',
    fr: 'FODEL',
  },

  founded: 2013,

  /** Client-directed 1.3 wording. This conflicts with the published company
   * extract and brand document; keeping it in one field makes correction safe. */
  foundedIn: 'Den Haag',

  principal: 'Födelmesi Gábor',

  address: {
    street: 'Seinpostduin 168',
    postalCode: '2586 EC',
    city: 'Den Haag',
    country: 'Nederland',
    countryCode: 'NL',
    /** Rendered on one line where space is tight. */
    oneLine: 'Seinpostduin 168, 2586 EC Den Haag, Nederland',
  },

  registration: {
    /**
     * OUTSTANDING — not published on any FODEL property. Required on Dutch
     * business websites. Ask Gábor; until it is set the build refuses to pass
     * preflight. Set it here, nowhere else.
     */
    kvk: null as string | null,

    /**
     * Published on fodel.hu/kapcsolat. Before launch, confirm this is the
     * publishable BTW-id and not the legacy sole-trader BTW-nummer — the old
     * format embeds a BSN and must not appear on a public page.
     */
    vat: 'NL002505231B62',
    vatVerified: false,
  },

  phones: [
    {
      label: { hu: 'Holland szám', nl: 'Nederlands nummer', en: 'Dutch number', de: 'Niederländische Nummer', fr: 'Numéro néerlandais' },
      /** Dutch mobile 06 44005550. The old build mis-grouped this as +31-644-005-550. */
      display: '+31 6 4400 5550',
      href: 'tel:+31644005550',
      note: {
        hu: 'Magyarul beszélő munkatársunk ezen a számon is elérhető',
        nl: 'Ook bereikbaar voor Hongaarstalige klanten',
        en: 'Also open to Hungarian-speaking callers',
        de: 'Auch für ungarischsprachige Kunden erreichbar',
        fr: 'Joignable aussi pour les clients hongrophones',
      },
    },
    {
      label: { hu: 'Magyar szám', nl: 'Hongaars nummer', en: 'Hungarian number', de: 'Ungarische Nummer', fr: 'Numéro hongrois' },
      display: '+36 70 225 5255',
      href: 'tel:+36702255255',
      note: { hu: 'Ingatlanos munkatárs', nl: 'Makelaar', en: 'Estate agent', de: 'Makler', fr: 'Agent immobilier' },
    },
    {
      label: { hu: 'Magyar információs vonal', nl: 'Hongaarse infolijn', en: 'Hungarian information line', de: 'Ungarische Infoleitung', fr: 'Ligne d’information hongroise' },
      display: '+36 70 231 0031',
      href: 'tel:+36702310031',
      note: { hu: 'Általános információ', nl: 'Algemene informatie', en: 'General information', de: 'Allgemeine Informationen', fr: 'Informations générales' },
    },
  ],

  /**
   * fodel.eu is the company domain from 2026-09-29 (client decision). The old
   * addresses stay listed until Gábor and Éva decide whether they are kept,
   * forwarded or retired — the live values come from site_settings.emails.
   */
  email: {
    primary: 'info@fodel.eu',
    hu: 'info@fodel.eu',
    all: ['info@fodel.eu', 'info@fodel.nl', 'info@fodel.hu', 'info@ingatlan.nl'],
  },

  /**
   * fodel.hu/kapcsolat: weekdays 09:00–18:00, with the free callback running
   * to 21:00 including weekends. The old build advertised 08:00–18:00 and
   * threw the extended callback window away entirely.
   */
  hours: {
    weekdays: { from: '09:00', to: '18:00' },
    callback: { to: '21:00', includesWeekends: true },
  },

  banks: {
    nl: { iban: 'NL35 RABO 0360284973', bic: 'RABONL2U' },
    hu: { account: '11600006-30000006-12407762' },
  },

  /** FODEL's own figure on fodel.hu. The old build said 9. */
  reach: {
    countries: 8,
    languages: 5,
  },

  /** Live domains per fodel.hu. fodel.be, agroinform.nl and eladod.com are unverified. */
  network: ['fodel.nl', 'fodel.hu', 'immofodel.de', 'fodel.at', 'fodel.ch', 'fodel.uk', 'fodel.us'],

  social: {
    youtube: 'https://www.youtube.com/@FODEL.REAL.ESTATE',
    facebookNl: 'https://www.facebook.com/Infofodel.nl',
    facebookHu: 'https://www.facebook.com/fodel.hu',
  },
} as const;

/* ── Commercial terms ─────────────────────────────────────────────────────
   fodel.hu/arlista and fodel.hu/gyik. All prices include 21% Dutch VAT.
   ------------------------------------------------------------------------ */

/**
 * ⚠️ UNVERIFIED. Every published price, email and (from FODEL 1.2) invoice
 * assumes Dutch VAT at this rate. B2C advertising / electronically-supplied
 * services sold to Hungarian private individuals are generally taxable
 * where the CUSTOMER is (Hungary, 27%, via the EU's One-Stop-Shop scheme),
 * not at the seller's home rate — if that applies here, this number and
 * every invoice built from it are wrong. One email to FODEL's accountant
 * resolves this; nothing in the invoicing code can.
 */
export const LISTING_VAT_PERCENT = 21;

export const LISTING_PACKAGES = [
  {
    id: 'cheap-6m',
    names: { hu: 'Standard hirdetés', nl: 'Standaard advertentie', en: 'Standard listing', de: 'Standard-Inserat', fr: 'Annonce standard' },
    priceEur: 69,
    months: 6,
    maxImages: 20,
    editedImages: false,
    editedText: false,
  },
  {
    id: 'normal-12m',
    names: { hu: 'Kiemelt hirdetés', nl: 'Uitgelichte advertentie', en: 'Featured listing', de: 'Hervorgehobenes Inserat', fr: 'Annonce mise en avant' },
    priceEur: 129,
    priceEurAbove: 179,
    /** The €179 tier applies above 150M HUF. */
    thresholdHuf: 150_000_000,
    months: 12,
    maxImages: null,
    editedImages: true,
    editedText: true,
  },
] as const;

export const LISTING_EXTRAS = [
  { id: 'translation', priceEur: 25, unit: 'language' },
  { id: 'category-highlight', priceEur: 15, unit: 'month', minMonths: 3 },
  { id: 'homepage-highlight', priceEur: 25, unit: 'month', minMonths: 3 },
  { id: 'video', priceEur: 36, unit: 'once' },
  { id: 'retro-images', priceEur: 30, unit: 'once' },
  { id: 'renewal-6m', priceEur: 25, unit: 'once' },
] as const;

/**
 * On-site services (client decision 2026-09-29, brief 3 §F). Prices are the
 * client's own figures, with the same VAT assumption as every price above —
 * see LISTING_VAT_PERCENT's warning. Whether they are gross, which regions are
 * covered and whether travel is extra are still open questions.
 *
 * The two are mutually exclusive: a listing or valuation carries at most one.
 * `onsite-visit` is also the "personal valuation by Gábor" offered on the
 * valuation result — one catalogue item, never two prices (brief 3 §D.5).
 *
 * Not to be confused with the €36 `video` extra above, which is FODEL placing
 * a video the owner supplies (a YouTube/Vimeo link) on the listing; these two
 * send someone to the property to shoot it.
 */
export const ONSITE_SERVICES = [
  {
    id: 'onsite-media',
    priceEur: 150,
    names: {
      hu: 'Helyszíni profi fotózás, videó és drónfelvétel',
      nl: 'Professionele foto’s, video en dronebeelden ter plaatse',
      en: 'Professional photos, video and drone footage on site',
      de: 'Professionelle Fotos, Video und Drohnenaufnahmen vor Ort',
      fr: 'Photos professionnelles, vidéo et images de drone sur place',
    },
    includes: {
      hu: ['Profi fotók az ingatlanról', 'Videós bemutató', 'Drónfelvétel'],
      nl: ['Professionele foto’s van de woning', 'Videopresentatie', 'Dronebeelden'],
      en: ['Professional photos of the property', 'Video presentation', 'Drone footage'],
      de: ['Professionelle Fotos der Immobilie', 'Videopräsentation', 'Drohnenaufnahmen'],
      fr: ['Photos professionnelles du bien', 'Présentation vidéo', 'Images de drone'],
    },
  },
  {
    id: 'onsite-visit',
    priceEur: 200,
    names: {
      hu: 'Gábor helyszíni látogatása: profi fotózás és videó, részletes személyes értékbecslés',
      nl: 'Bezoek van Gábor ter plaatse: professionele foto’s en video, uitgebreide persoonlijke waardebepaling',
      en: 'A visit from Gábor on site: professional photos and video, and a detailed personal valuation',
      de: 'Besuch von Gábor vor Ort: professionelle Fotos und Video sowie eine ausführliche persönliche Bewertung',
      fr: 'Visite de Gábor sur place\u00a0: photos et vidéo professionnelles, estimation personnelle détaillée',
    },
    includes: {
      hu: ['Profi fotók az ingatlanról', 'Videós bemutató', 'Részletes, személyes értékbecslés'],
      nl: ['Professionele foto’s van de woning', 'Videopresentatie', 'Uitgebreide persoonlijke waardebepaling'],
      en: ['Professional photos of the property', 'Video presentation', 'Detailed personal valuation'],
      de: ['Professionelle Fotos der Immobilie', 'Videopräsentation', 'Ausführliche persönliche Bewertung'],
      fr: ['Photos professionnelles du bien', 'Présentation vidéo', 'Estimation personnelle détaillée'],
    },
  },
] as const;

export type OnsiteServiceId = (typeof ONSITE_SERVICES)[number]['id'];

export function isOnsiteServiceId(value: unknown): value is OnsiteServiceId {
  return ONSITE_SERVICES.some((service) => service.id === value);
}

/** Recommended translation order, from FAQ Q7. */
export const TRANSLATION_LANGUAGES = ['nl', 'de', 'en', 'fr'] as const;

export const COMMISSION = {
  percent: 4,
  minimumEur: 2000,
  vatPercent: 21,
  /** All three must hold before anything is invoiced (fodel.hu). */
  conditions: ['written-contract', 'fodel-introduced-buyer', 'deposit-paid'],
} as const;

/** Bilingual sale contracts — fodel.hu/szolgaltatas. */
export const CONTRACT_PRICES = [
  { id: 'hu', fromEur: 150 },
  { id: 'de-hu', fromEur: 300 },
  { id: 'en-hu', fromEur: 300 },
  { id: 'nl-hu', fromEur: 400 },
] as const;

/** Additional services offered alongside a listing. */
export const EXTRA_SERVICES = ['epc', 'photography', 'drone', 'bilingual-contract'] as const;

/** EU citizens holding an agricultural qualification may buy up to this in Hungary. */
export const AGRI_HECTARE_LIMIT = 300;

/* ── Derived helpers ──────────────────────────────────────────────────── */

export function formatHours(locale: Locale): string {
  const { from, to } = COMPANY.hours.weekdays;
  const days: Record<Locale, string> = {
    hu: 'Hétfő–Péntek',
    nl: 'Maandag–vrijdag',
    en: 'Monday–Friday',
    de: 'Montag–Freitag',
    fr: 'Lundi–vendredi',
  };
  return `${days[locale]} · ${from}–${to}`;
}

/**
 * The founding city, localised for display. Hungarian, English and French use
 * their own names for the city ("Hága", "The Hague", "La Haye"); Dutch, German
 * and the legal/imprint spelling stay "Den Haag". Reads `foundedIn` rather
 * than hardcoding the city so the correction stays a one-field change (see the
 * field's own comment for the 1.3 background).
 */
const CITY_NAMES: Record<string, Record<Locale, string>> = {
  'Den Haag': { hu: 'Hága', nl: 'Den Haag', en: 'The Hague', de: 'Den Haag', fr: 'La Haye' },
};
const COUNTRY_NAMES: Record<Locale, string> = {
  hu: 'Hollandia',
  nl: 'Nederland',
  en: 'the Netherlands',
  de: 'Niederlande',
  fr: 'Pays-Bas',
};
export function foundedInLabel(locale: Locale): string {
  const city = CITY_NAMES[COMPANY.foundedIn]?.[locale] ?? COMPANY.foundedIn;
  // Display-only (eyebrows): no-break spaces keep the city on one line.
  return `${city.replace(/ /g, '\u00a0')}, ${COUNTRY_NAMES[locale].replace(/ /g, '\u00a0')}`;
}

/** The country of an address in the page's language ("Niederlande", "Pays-Bas", "The Netherlands"). */
export function countryName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale === 'en' ? 'en-GB' : locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** "Seinpostduin 168, 2586 EC Den Haag, Niederlande": street and city stay local, the country follows the language. */
export function addressLine(
  address: { street: string; postalCode: string; city: string; countryCode?: string },
  locale: Locale
): string {
  const place = `${address.street}, ${address.postalCode} ${address.city}`;
  return address.countryCode ? `${place}, ${countryName(address.countryCode, locale)}` : place;
}

/** A phone line's label in the page's language; lines an admin typed only in hu/nl fall back to Dutch, then Hungarian. */
export function phoneText(texts: Partial<Record<string, string>> | undefined, locale: Locale): string {
  return texts?.[locale] ?? texts?.nl ?? texts?.hu ?? '';
}

/** True once every legally-required identifier is present. */
export function isLegallyComplete(): boolean {
  return Boolean(COMPANY.registration.kvk);
}
