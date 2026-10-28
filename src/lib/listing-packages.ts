/**
 * The listing packages and extras, as the admin last set them.
 *
 * The quote asks for "Basic és Prémium hirdetési csomag; csomagonként eltérő
 * képszám, videó és adattartalom; … telefonszám megjelenítése a választott
 * csomag szerint; csomagok és díjak admin oldali kezelése". Everything an
 * admin can change about a package lives here, edited in Beállítások →
 * Szolgáltatások and stored in site_settings.services.listingPackages /
 * .listingExtras (plain JSON, no migration).
 *
 * Anything not set falls back to LISTING_PACKAGES / LISTING_EXTRAS in
 * src/config/company.ts — the published fodel.hu tariff — so nothing here
 * invents a number. The two package ids are fixed: listings and orders refer
 * to them.
 *
 * Orders stay denormalised (src/lib/orders.ts): a price change here affects
 * new orders only, never one already written.
 */
import { LISTING_PACKAGES, LISTING_EXTRAS } from '~/config/company';
import { listingRules, type PackageId } from '~/lib/listing-rules';
import { localizer, type L10n, type Locale } from '~/i18n/ui';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';

/** How a package treats the owner's video: free with it, paid extra, or not offered. */
export type VideoMode = 'included' | 'extra' | 'none';
export const VIDEO_MODES: readonly VideoMode[] = ['included', 'extra', 'none'];

export type ListingPackage = {
  id: PackageId;
  /** hu and nl are editable in the admin; en, de and fr are the checked-in names from company.ts. */
  names: L10n;
  priceEur: number;
  /** The higher tier above `thresholdHuf`; null = one price for every listing. */
  priceEurAbove: number | null;
  thresholdHuf: number | null;
  months: number;
  /** null = unlimited. */
  maxImages: number | null;
  video: VideoMode;
  /** The seller's phone on the public page (also needs the seller's consent). */
  phone: boolean;
  editedImages: boolean;
  editedText: boolean;
  /** The card marked "Ajánlott" and preselected on the submit form. */
  recommended: boolean;
};

export type ExtraId = (typeof LISTING_EXTRAS)[number]['id'];

export type ListingExtra = {
  id: ExtraId;
  priceEur: number;
  unit: 'language' | 'month' | 'once';
  minMonths?: number;
};

export type ListingCatalog = { packages: ListingPackage[]; extras: ListingExtra[] };

export type StoredListingPackage = Partial<Omit<ListingPackage, 'id' | 'names'>> & { names?: Partial<Record<'hu' | 'nl', string>> };
export type StoredServices = {
  listingPackages?: Partial<Record<PackageId, StoredListingPackage>>;
  listingExtras?: Partial<Record<ExtraId, { priceEur?: number }>>;
  packagePhone?: unknown;
} | null | undefined;

export const PRICE_MAX = 10_000;
export const IMAGES_MAX = 200;

const num = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = Number(value);
  return value !== null && value !== '' && Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : fallback;
};
const bool = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

function defaults(): ListingPackage[] {
  return LISTING_PACKAGES.map((pkg) => ({
    id: pkg.id,
    names: { ...pkg.names },
    priceEur: pkg.priceEur,
    priceEurAbove: 'priceEurAbove' in pkg ? pkg.priceEurAbove : null,
    thresholdHuf: 'thresholdHuf' in pkg ? pkg.thresholdHuf : null,
    months: pkg.months,
    maxImages: 20,
    // Today both packages charge the €36 video extra — the published tariff.
    video: 'extra',
    phone: false,
    editedImages: pkg.editedImages,
    editedText: pkg.editedText,
    recommended: pkg.id === 'normal-12m',
  }));
}

/** Stored settings (any shape, possibly missing) → a complete, sane catalogue. */
export function listingCatalog(services?: StoredServices): ListingCatalog {
  const phone = listingRules(services as any).packagePhone;
  const packages = defaults().map((base): ListingPackage => {
    const s = services?.listingPackages?.[base.id] ?? {};
    return {
      id: base.id,
      names: { ...base.names, hu: s.names?.hu?.trim() || base.names.hu, nl: s.names?.nl?.trim() || base.names.nl },
      priceEur: num(s.priceEur, base.priceEur, 0, PRICE_MAX),
      priceEurAbove: 'priceEurAbove' in s ? (s.priceEurAbove == null ? null : num(s.priceEurAbove, base.priceEurAbove ?? 0, 0, PRICE_MAX)) : base.priceEurAbove,
      thresholdHuf: 'thresholdHuf' in s ? (s.thresholdHuf == null ? null : num(s.thresholdHuf, base.thresholdHuf ?? 0, 1, 100_000_000_000)) : base.thresholdHuf,
      months: num(s.months, base.months, 1, 36),
      // Saved per package: a number is the cap, null is unlimited, absent keeps the default.
      maxImages: 'maxImages' in s ? (s.maxImages === null ? null : num(s.maxImages, base.maxImages ?? 20, 1, IMAGES_MAX)) : base.maxImages,
      video: VIDEO_MODES.includes(s.video as VideoMode) ? (s.video as VideoMode) : base.video,
      phone: phone[base.id],
      editedImages: bool(s.editedImages, base.editedImages),
      editedText: bool(s.editedText, base.editedText),
      recommended: bool(s.recommended, base.recommended),
    };
  });
  // Exactly one card is recommended.
  if (packages.filter((p) => p.recommended).length !== 1) {
    packages.forEach((p, i) => (p.recommended = i === packages.length - 1));
  }
  const extras = LISTING_EXTRAS.map((extra): ListingExtra => ({
    id: extra.id,
    priceEur: num(services?.listingExtras?.[extra.id]?.priceEur, extra.priceEur, 0, PRICE_MAX),
    unit: extra.unit,
    ...('minMonths' in extra ? { minMonths: extra.minMonths } : {}),
  }));
  return { packages, extras };
}

export function packageOf(catalog: ListingCatalog, id: string | null | undefined): ListingPackage {
  return catalog.packages.find((p) => p.id === id) ?? catalog.packages[0];
}

export function extraPrice(catalog: ListingCatalog, id: ExtraId): number {
  return catalog.extras.find((e) => e.id === id)?.priceEur ?? 0;
}

/** Whether the listing's own forint price puts it in the higher tier. */
export function isAboveThreshold(pkg: ListingPackage, priceHuf: number): boolean {
  return pkg.priceEurAbove !== null && pkg.thresholdHuf !== null && priceHuf > pkg.thresholdHuf;
}

/* ── Public wording ────────────────────────────────────────────────────── */

/** "69 €" in Hungarian, "€ 69" in Dutch, then each language's own house style. */
export const eurText = (locale: Locale, n: number) =>
  locale === 'hu' ? `${n}\u00a0€` : locale === 'nl' ? `€\u00a0${n}` : eur(n, locale);
const million = (huf: number) => Math.round(huf / 1_000_000).toLocaleString('hu-HU');

/**
 * What a package card says — price, duration and the feature list, all
 * derived from the settings so the cards can never disagree with checkout.
 */
export function packageCard(pkg: ListingPackage, catalog: ListingCatalog, locale: Locale, opts: { withExtras?: boolean } = {}) {
  const x = localizer(locale);
  const video = extraPrice(catalog, 'video');
  const translation = extraPrice(catalog, 'translation');
  const features = [
    pkg.maxImages === null
      ? x('Korlátlan számú kép', 'Onbeperkt aantal foto’s', 'Unlimited number of photos', 'Unbegrenzte Anzahl Fotos', 'Nombre de photos illimité', 'Número ilimitado de fotos', 'Nieograniczona liczba zdjęć', 'Număr nelimitat de fotografii', 'Neobmedzený počet fotografií', 'Numero illimitato di foto', 'Número ilimitado de fotografias', 'Απεριόριστος αριθμός φωτογραφιών', 'Neomezený počet fotografií', 'Neomejeno število fotografij', 'Obegränsat antal bilder', 'Ubegrænset antal billeder', 'Ubegrenset antall bilder', 'Rajaton määrä kuvia', 'Piiramatu arv fotosid', 'Neierobežots fotoattēlu skaits', 'Neribotas nuotraukų skaičius')
      : x(`Legfeljebb ${pkg.maxImages} kép`, `Maximaal ${pkg.maxImages} foto’s`, `Up to ${pkg.maxImages} photos`, `Bis zu ${pkg.maxImages} Fotos`, `Jusqu’à ${pkg.maxImages} photos`, `Hasta ${pkg.maxImages} fotos`, `Maksymalnie ${nOf('pl', pkg.maxImages, 'zdjęcie', 'zdjęcia', 'zdjęć')}`, `Până la ${nOf('ro', pkg.maxImages, 'fotografie', 'fotografii', 'de fotografii')}`, `Najviac ${nOf('sk', pkg.maxImages, 'fotografia', 'fotografie', 'fotografií')}`, `Fino a ${pkg.maxImages} foto`, `Até ${pkg.maxImages} fotografias`, `Έως ${pkg.maxImages} φωτογραφίες`, `Až ${nOf('cs', pkg.maxImages, 'fotografie', 'fotografie', 'fotografií')}`, `Do ${nOf('sl', pkg.maxImages, 'fotografije', 'fotografij', 'fotografij', 'fotografij')}`, `Upp till ${pkg.maxImages} bilder`, `Op til ${pkg.maxImages} billeder`, `Opptil ${pkg.maxImages} bilder`, `Enintään ${pkg.maxImages} kuvaa`, `Kuni ${pkg.maxImages} fotot`, `Līdz ${nOf('lv', pkg.maxImages, 'fotoattēlam', 'fotoattēliem')}`, `Iki ${nOf('lt', pkg.maxImages, 'nuotraukos', 'nuotraukų')}`),
    pkg.editedImages
      ? x('A képeket szakszerűen feldolgozzuk', 'Foto’s worden professioneel bewerkt', 'Photos are professionally edited', 'Fotos werden professionell bearbeitet', 'Les photos sont retouchées par des professionnels', 'Fotos retocadas por profesionales', 'Zdjęcia retuszowane przez profesjonalistów', 'Fotografiile sunt retușate de profesioniști', 'Fotografie upravujú profesionáli', 'Le foto vengono elaborate professionalmente', 'As fotografias são editadas profissionalmente', 'Οι φωτογραφίες επεξεργάζονται επαγγελματικά', 'Fotografie jsou profesionálně upraveny', 'Fotografije so strokovno obdelane', 'Bilderna redigeras professionellt', 'Billederne redigeres professionelt', 'Bildene redigeres profesjonelt', 'Kuvat käsitellään ammattimaisesti', 'Fotod töödeldakse professionaalselt', 'Fotoattēli tiek profesionāli apstrādāti', 'Nuotraukos profesionaliai apdorojamos')
      : x('A képek az eredeti állapotban jelennek meg', 'Foto’s worden ongewijzigd geplaatst', 'Photos appear as supplied', 'Fotos erscheinen unverändert', 'Les photos sont publiées telles quelles', 'Las fotos se publican tal como se entregan', 'Zdjęcia publikujemy w otrzymanej postaci', 'Fotografiile sunt publicate așa cum au fost trimise', 'Fotografie zverejňujeme tak, ako ich dodáte', 'Le foto vengono pubblicate così come fornite', 'As fotografias são publicadas tal como enviadas', 'Οι φωτογραφίες δημοσιεύονται όπως τις στείλατε', 'Fotografie se zveřejní tak, jak je dodáte', 'Fotografije so objavljene takšne, kot jih pošljete', 'Bilderna publiceras som de har skickats in', 'Billederne vises, som de er leveret', 'Bildene vises slik de er levert', 'Kuvat julkaistaan sellaisinaan', 'Fotod avaldatakse sellisena, nagu need saadeti', 'Fotoattēli tiek publicēti tādi, kādi iesniegti', 'Nuotraukos skelbiamos tokios, kokias pateikėte'),
    pkg.editedText
      ? x('A szöveget szakszerűen megszerkesztjük', 'Tekst wordt professioneel geredigeerd', 'The text is professionally edited', 'Der Text wird professionell redigiert', 'Le texte est rédigé et relu par des professionnels', 'El texto lo redactan y revisan profesionales', 'Tekst redagują i sprawdzają profesjonaliści', 'Textul este redactat și revizuit de profesioniști', 'Text píšu a kontrolujú profesionáli', 'Il testo viene revisionato professionalmente', 'O texto é revisto profissionalmente', 'Το κείμενο επιμελείται επαγγελματικά', 'Text je profesionálně upraven', 'Besedilo je strokovno urejeno', 'Texten redigeras professionellt', 'Teksten redigeres professionelt', 'Teksten redigeres profesjonelt', 'Teksti viimeistellään ammattimaisesti', 'Teksti toimetatakse professionaalselt', 'Teksts tiek profesionāli rediģēts', 'Tekstas profesionaliai redaguojamas')
      : x('A szöveg a beküldött formában jelenik meg', 'Tekst wordt geplaatst zoals aangeleverd', 'The text appears as supplied', 'Der Text erscheint wie eingereicht', 'Le texte est publié tel que fourni', 'El texto se publica tal como se entrega', 'Tekst publikujemy w otrzymanej postaci', 'Textul este publicat așa cum a fost trimis', 'Text zverejňujeme tak, ako ho dodáte', 'Il testo viene pubblicato così come fornito', 'O texto é publicado tal como enviado', 'Το κείμενο δημοσιεύεται όπως το στείλατε', 'Text se zveřejní tak, jak ho dodáte', 'Besedilo je objavljeno takšno, kot ga pošljete', 'Texten publiceras som den har skickats in', 'Teksten vises, som den er leveret', 'Teksten vises slik den er levert', 'Teksti julkaistaan sellaisenaan', 'Tekst avaldatakse sellisena, nagu see saadeti', 'Teksts tiek publicēts tāds, kāds iesniegts', 'Tekstas skelbiamas toks, kokį pateikėte'),
    pkg.video === 'included'
      ? x('Videós bemutató a csomag része', 'Video inbegrepen', 'Video included', 'Video inbegriffen', 'Vidéo incluse', 'Vídeo incluido', 'Film w cenie', 'Videoclip inclus', 'Video v cene', 'Video incluso', 'Vídeo incluído', 'Περιλαμβάνεται βίντεο', 'Video v ceně', 'Video je vključen', 'Video ingår', 'Video inkluderet', 'Video inkludert', 'Video sisältyy', 'Video on hinna sees', 'Video iekļauts', 'Vaizdo įrašas įskaičiuotas')
      : pkg.video === 'extra'
        ? x(
            `Videós bemutató külön kérhető (${eurText(locale, video)})`,
            `Video als extra (${eurText(locale, video)})`,
            `Video available as an extra (${eurText(locale, video)})`,
            `Video als Zusatzleistung (${eurText(locale, video)})`,
            `Vidéo en option (${eurText(locale, video)})`,
            `Vídeo opcional (${eurText(locale, video)})`,
            `Film jako opcja dodatkowa (${eurText(locale, video)})`,
            `Videoclip opțional (${eurText(locale, video)})`,
            `Video za príplatok (${eurText(locale, video)})`,
            `Video disponibile come extra (${eurText(locale, video)})`,
            `Vídeo disponível como extra (${eurText(locale, video)})`,
            `Βίντεο διαθέσιμο ως επιπλέον υπηρεσία (${eurText(locale, video)})`,
            `Video za příplatek (${eurText(locale, video)})`,
            `Video kot dodatna storitev (${eurText(locale, video)})`,
            `Video kan läggas till (${eurText(locale, video)})`,
            `Video kan tilkøbes (${eurText(locale, video)})`,
            `Video kan kjøpes som tillegg (${eurText(locale, video)})`,
            `Video lisäpalveluna (${eurText(locale, video)})`,
            `Video lisateenusena (${eurText(locale, video)})`,
            `Video par papildu samaksu (${eurText(locale, video)})`,
            `Vaizdo įrašas už papildomą mokestį (${eurText(locale, video)})`
          )
        : null,
    pkg.phone
      ? x('Az Ön telefonszáma megjelenhet a hirdetésben', 'Uw telefoonnummer kan bij de advertentie staan', 'Your phone number can appear with the listing', 'Ihre Telefonnummer kann beim Inserat stehen', 'Votre numéro de téléphone peut figurer dans l’annonce', 'Su número de teléfono puede aparecer en el anuncio', 'Państwa numer telefonu może być widoczny w ogłoszeniu', 'Numărul dumneavoastră de telefon poate apărea în anunț', 'Vaše telefónne číslo môže byť uvedené v inzeráte', 'Il Suo numero di telefono può comparire nell’annuncio', 'O seu número de telefone pode aparecer no anúncio', 'Ο αριθμός τηλεφώνου σας μπορεί να εμφανίζεται στην αγγελία', 'Vaše telefonní číslo může být uvedeno u inzerátu', 'Vaša telefonska številka je lahko navedena v oglasu', 'Ditt telefonnummer kan visas i annonsen', 'Dit telefonnummer kan vises i annoncen', 'Telefonnummeret ditt kan vises i annonsen', 'Puhelinnumerosi voi näkyä ilmoituksessa', 'Teie telefoninumber võib olla kuulutuses nähtav', 'Jūsu tālruņa numurs var būt redzams sludinājumā', 'Jūsų telefono numeris gali būti rodomas skelbime')
      : x('Az érdeklődők a FINDDOME-en keresztül érik el', 'Geïnteresseerden bereiken u via FINDDOME', 'Interested buyers reach you through FINDDOME', 'Interessenten erreichen Sie über FINDDOME', 'Les personnes intéressées vous joignent par FINDDOME', 'Los interesados contactan con usted a través de FINDDOME', 'Zainteresowani kontaktują się z Państwem za pośrednictwem FINDDOME', 'Persoanele interesate vă contactează prin FINDDOME', 'Záujemcovia vás kontaktujú cez FINDDOME', 'Gli acquirenti interessati La contattano tramite FINDDOME', 'Os compradores interessados contactam-no através da FINDDOME', 'Οι ενδιαφερόμενοι αγοραστές επικοινωνούν μαζί σας μέσω της FINDDOME', 'Zájemci vás kontaktují prostřednictvím FINDDOME', 'Zainteresirani kupci vas kontaktirajo prek FINDDOME', 'Intresserade köpare når dig via FINDDOME', 'Interesserede købere kontakter dig via FINDDOME', 'Interesserte kjøpere når deg via FINDDOME', 'Kiinnostuneet ostajat tavoittavat sinut FINDDOMEn kautta', 'Huvitatud ostjad võtavad teiega ühendust FINDDOME’i kaudu', 'Ieinteresētie pircēji ar jums sazinās ar FINDDOME starpniecību', 'Susidomėję pirkėjai su jumis susisiekia per FINDDOME'),
    ...(opts.withExtras
      ? [
          x(
            `Igény szerint idegen nyelvű fordítás (${translation} €/nyelv)`,
            `Vertaling op verzoek (€ ${translation} per taal)`,
            `Translation on request (${eurText(locale, translation)} per language)`,
            `Übersetzung auf Wunsch (${eurText(locale, translation)} pro Sprache)`,
            `Traduction sur demande (${eurText(locale, translation)} par langue)`,
            `Traducción bajo petición (${eurText(locale, translation)} por idioma)`,
            `Tłumaczenie na życzenie (${eurText(locale, translation)} za język)`,
            `Traducere la cerere (${eurText(locale, translation)} per limbă)`,
            `Preklad na požiadanie (${eurText(locale, translation)} za jazyk)`,
            `Traduzione su richiesta (${eurText(locale, translation)} per lingua)`,
            `Tradução a pedido (${eurText(locale, translation)} por língua)`,
            `Μετάφραση κατόπιν αιτήματος (${eurText(locale, translation)} ανά γλώσσα)`,
            `Překlad na vyžádání (${eurText(locale, translation)} za jazyk)`,
            `Prevod na zahtevo (${eurText(locale, translation)} na jezik)`,
            `Översättning på begäran (${eurText(locale, translation)} per språk)`,
            `Oversættelse efter ønske (${eurText(locale, translation)} pr. sprog)`,
            `Oversettelse på forespørsel (${eurText(locale, translation)} per språk)`,
            `Käännös pyynnöstä (${eurText(locale, translation)} kieltä kohden)`,
            `Tõlge soovi korral (${eurText(locale, translation)} keele kohta)`,
            `Tulkojums pēc pieprasījuma (${eurText(locale, translation)} par valodu)`,
            `Vertimas pagal užsakymą (${eurText(locale, translation)} už kalbą)`
          ),
          x('Kiemelés külön kérhető', 'Uitlichten op verzoek', 'Highlighting on request', 'Hervorhebung auf Wunsch', 'Mise en avant sur demande', 'Destacado bajo petición', 'Wyróżnienie na życzenie', 'Evidențiere la cerere', 'Zvýraznenie na požiadanie', 'Messa in evidenza su richiesta', 'Destaque a pedido', 'Προβολή κατόπιν αιτήματος', 'Zvýraznění na vyžádání', 'Izpostavitev na zahtevo', 'Framhävning på begäran', 'Fremhævning efter ønske', 'Fremheving på forespørsel', 'Korostus pyynnöstä', 'Esiletõstmine soovi korral', 'Izcelšana pēc pieprasījuma', 'Paryškinimas pagal užsakymą'),
        ]
      : []),
  ].filter((line): line is string => Boolean(line));
  const months = pkg.months;
  return {
    id: pkg.id,
    name: pkg.names[locale],
    priceCents: pkg.priceEur * 100,
    price: eurText(locale, pkg.priceEur),
    ...(pkg.priceEurAbove !== null && pkg.thresholdHuf !== null
      ? {
          priceAlt: eurText(locale, pkg.priceEurAbove),
          priceAltNote: x(
            `${million(pkg.thresholdHuf)} millió Ft feletti ingatlan esetén`,
            `bij een vraagprijs boven ${million(pkg.thresholdHuf)} miljoen HUF`,
            `for a property priced above HUF ${million(pkg.thresholdHuf)} million`,
            `bei Immobilien über ${million(pkg.thresholdHuf)} Mio. HUF`,
            `pour un bien de plus de ${million(pkg.thresholdHuf)} millions de HUF`,
            `para un inmueble de más de ${million(pkg.thresholdHuf)} millones de HUF`,
            `dla nieruchomości o cenie powyżej ${million(pkg.thresholdHuf)} mln HUF`,
            `pentru o proprietate de peste ${million(pkg.thresholdHuf)} mil. HUF`,
            `pre nehnuteľnosť s cenou nad ${million(pkg.thresholdHuf)} mil. HUF`,
            `per un immobile con prezzo superiore a ${million(pkg.thresholdHuf)} milioni di HUF`,
            `para um imóvel com preço superior a ${million(pkg.thresholdHuf)} milhões de HUF`,
            `για ακίνητο με τιμή άνω των ${million(pkg.thresholdHuf)} εκατ. HUF`,
            `u nemovitosti s cenou nad ${million(pkg.thresholdHuf)} mil. HUF`,
            `za nepremičnino s ceno nad ${million(pkg.thresholdHuf)} mio. HUF`,
            `för en fastighet med ett pris över ${million(pkg.thresholdHuf)} miljoner HUF`,
            `for en ejendom med en pris over ${million(pkg.thresholdHuf)} mio. HUF`,
            `for en eiendom med pris over ${million(pkg.thresholdHuf)} mill. HUF`,
            `yli ${million(pkg.thresholdHuf)} miljoonan forintin kiinteistölle`,
            `kinnisvarale, mille hind ületab ${million(pkg.thresholdHuf)} miljonit forintit`,
            `īpašumam, kura cena pārsniedz ${million(pkg.thresholdHuf)} milj. HUF`,
            `turtui, kurio kaina viršija ${million(pkg.thresholdHuf)} mln. HUF`
          ),
        }
      : {}),
    duration: x(
      `${months} hónap`,
      `${months} ${months === 1 ? 'maand' : 'maanden'}`,
      `${months} ${months === 1 ? 'month' : 'months'}`,
      `${months} ${months === 1 ? 'Monat' : 'Monate'}`,
      `${months} mois`,
      `${nOf('es', months, 'mes', 'meses')}`,
      `${nOf('pl', months, 'miesiąc', 'miesiące', 'miesięcy')}`,
      `${nOf('ro', months, 'lună', 'luni', 'de luni')}`,
      `${nOf('sk', months, 'mesiac', 'mesiace', 'mesiacov')}`,
      `${months} ${months === 1 ? 'mese' : 'mesi'}`,
      `${months} ${months === 1 ? 'mês' : 'meses'}`,
      `${months} ${months === 1 ? 'μήνας' : 'μήνες'}`,
      `${nOf('cs', months, 'měsíc', 'měsíce', 'měsíců')}`,
      `${nOf('sl', months, 'mesec', 'meseci', 'mesecev', 'meseca')}`,
      `${months} ${months === 1 ? 'månad' : 'månader'}`,
      `${months} ${months === 1 ? 'måned' : 'måneder'}`,
      `${months} ${months === 1 ? 'måned' : 'måneder'}`,
      `${months} ${months === 1 ? 'kuukausi' : 'kuukautta'}`,
      `${months} ${months === 1 ? 'kuu' : 'kuud'}`,
      `${nOf('lv', months, 'mēnesis', 'mēneši', 'mēnešu')}`,
      `${nOf('lt', months, 'mėnuo', 'mėnesiai', 'mėnesių')}`
    ),
    featured: pkg.recommended,
    features,
  };
}

/** The lowest package price and the price range, for headlines and meta descriptions. */
export function priceFacts(catalog: ListingCatalog) {
  const prices = catalog.packages.map((p) => p.priceEur);
  return { from: Math.min(...prices) };
}
