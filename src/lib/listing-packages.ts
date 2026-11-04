/**
 * The listing packages and extras, as the admin last set them.
 *
 * The quote asks for "Basic és Prémium hirdetési csomag; csomagonként eltérő
 * képszám, videó és adattartalom; … telefonszám megjelenítése a választott
 * csomag szerint; csomagok és díjak admin oldali kezelése". Everything an
 * admin can change about a package lives here, edited in the Csomagok menu
 * (/portal/packages, src/lib/portal/package-admin.ts) and stored in
 * site_settings.services.listingPackages / .listingExtras (plain JSON, no
 * migration).
 *
 * Anything not set falls back to LISTING_PACKAGES / LISTING_EXTRAS in
 * src/config/company.ts — the published fodel.hu tariff — so nothing here
 * invents a number. The two package ids are fixed: listings and orders refer
 * to them.
 *
 * Prices are tiered by the property's forint price (src/lib/price-tiers.ts);
 * `priceEurFor(item, priceHuf)` is the one place a price is read.
 *
 * Orders stay denormalised (src/lib/orders.ts): a price change here affects
 * new orders only, never one already written.
 */
import { LISTING_PACKAGES, LISTING_EXTRAS } from '~/config/company';
import { listingRules, type PackageId } from '~/lib/listing-rules';
import { localizer, type L10n, type Locale } from '~/i18n/ui';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';
import { tierPhrase } from '~/lib/tier-phrase';
import { legacyTiers, priceEurFor, readTiers, tierFor, tierRange, TIER_PRICE_MAX, type PriceTier, type Tiered } from '~/lib/price-tiers';

export { priceEurFor, tierFor, tierRange, type PriceTier, type Tiered } from '~/lib/price-tiers';

/**
 * Whether a package lets the owner show their own video (a YouTube/Vimeo link).
 * Since November 2026 the owner's own link is free wherever video is offered;
 * the paid `video` extra is FINDDOME filming the property (Hungary only).
 * A stored 'extra' from before reads as 'included'.
 */
export type VideoMode = 'included' | 'none';
export const VIDEO_MODES: readonly VideoMode[] = ['included', 'none'];
const readVideoMode = (value: unknown, fallback: VideoMode): VideoMode =>
  value === 'extra' || value === 'included' ? 'included' : value === 'none' ? 'none' : fallback;

export type ListingPackage = {
  id: PackageId;
  /** hu and nl are editable in the admin; en, de and fr are the checked-in names from company.ts. */
  names: L10n;
  /** Price by property price; at least one tier, the last one open-ended. */
  tiers: PriceTier[];
  /** The "from" price, `tiers[0].priceEur`, for headlines that only need the lowest price. */
  priceEur: number;
  /**
   * @deprecated Two-tier view kept for old readers: the last tier's price when there is more than one tier.
   * Use `priceEurFor(pkg, priceHuf)` or `tiers`.
   */
  priceEurAbove: number | null;
  /** @deprecated The first bound when there is more than one tier. Use `tiers`. */
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
  /** Price by property price, per unit; at least one tier. */
  tiers: PriceTier[];
  /** The "from" price, `tiers[0].priceEur`. */
  priceEur: number;
  unit: 'language' | 'month' | 'once';
  minMonths?: number;
  /**
   * No longer sold (homepage highlight, later photo upload — November 2026).
   * Kept so old orders and invoices still name the line; every selling surface
   * filters it out through `sellingExtras()`, and new orders refuse it.
   */
  retired?: boolean;
  /** Sold only for properties in these countries (ISO codes); absent = everywhere. */
  countries?: readonly string[];
};

export type ListingCatalog = { packages: ListingPackage[]; extras: ListingExtra[] };

export type StoredListingPackage = Partial<Omit<ListingPackage, 'id' | 'names' | 'video' | 'tiers'>> & {
  names?: Partial<Record<'hu' | 'nl', string>>;
  video?: VideoMode | 'extra';
  tiers?: unknown;
};
export type StoredServices = {
  listingPackages?: Partial<Record<PackageId, StoredListingPackage>>;
  listingExtras?: Partial<Record<ExtraId, { priceEur?: number; tiers?: unknown }>>;
  packagePhone?: unknown;
} | null | undefined;

export const PRICE_MAX = TIER_PRICE_MAX;
export const IMAGES_MAX = 200;

const num = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = Number(value);
  return value !== null && value !== '' && Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : fallback;
};
const bool = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

/** The compatibility fields every package carries next to `tiers`. */
function withAliases<T extends { tiers: PriceTier[] }>(item: T) {
  const many = item.tiers.length > 1;
  return {
    ...item,
    priceEur: item.tiers[0].priceEur,
    priceEurAbove: many ? item.tiers[item.tiers.length - 1].priceEur : null,
    thresholdHuf: many ? item.tiers[0].upToHuf : null,
  };
}

function defaults(): ListingPackage[] {
  return LISTING_PACKAGES.map((pkg) => withAliases({
    id: pkg.id,
    names: { ...pkg.names },
    tiers: legacyTiers(pkg.priceEur, 'priceEurAbove' in pkg ? pkg.priceEurAbove : null, 'thresholdHuf' in pkg ? pkg.thresholdHuf : null),
    months: pkg.months,
    maxImages: 20,
    // The owner's own video link is free in both packages (November 2026).
    video: 'included' as VideoMode,
    phone: false,
    editedImages: pkg.editedImages,
    editedText: pkg.editedText,
    recommended: pkg.id === 'normal-12m',
  }));
}

/**
 * A package's tiers from stored JSON. New saves write `tiers`; older ones have
 * the flat `priceEur` plus the single `priceEurAbove` / `thresholdHuf`, which
 * still work and become tiers here (§9.1 backward compatibility).
 */
function packageTiers(stored: StoredListingPackage, base: ListingPackage): PriceTier[] {
  const tiers = readTiers(stored.tiers);
  if (tiers) return tiers;
  const price = num(stored.priceEur, base.priceEur, 0, PRICE_MAX);
  const above = 'priceEurAbove' in stored ? (stored.priceEurAbove == null ? null : num(stored.priceEurAbove, base.priceEurAbove ?? 0, 0, PRICE_MAX)) : base.priceEurAbove;
  const threshold = 'thresholdHuf' in stored ? (stored.thresholdHuf == null ? null : num(stored.thresholdHuf, base.thresholdHuf ?? 0, 1, 100_000_000_000)) : base.thresholdHuf;
  return legacyTiers(price, above, threshold);
}

/** Stored settings (any shape, possibly missing) → a complete, sane catalogue. */
export function listingCatalog(services?: StoredServices): ListingCatalog {
  const phone = listingRules(services as any).packagePhone;
  const packages = defaults().map((base): ListingPackage => {
    const s = services?.listingPackages?.[base.id] ?? {};
    return withAliases({
      id: base.id,
      names: { ...base.names, hu: s.names?.hu?.trim() || base.names.hu, nl: s.names?.nl?.trim() || base.names.nl },
      tiers: packageTiers(s, base),
      months: num(s.months, base.months, 1, 36),
      // Saved per package: a number is the cap, null is unlimited, absent keeps the default.
      maxImages: 'maxImages' in s ? (s.maxImages === null ? null : num(s.maxImages, base.maxImages ?? 20, 1, IMAGES_MAX)) : base.maxImages,
      video: readVideoMode(s.video, base.video),
      phone: phone[base.id],
      editedImages: bool(s.editedImages, base.editedImages),
      editedText: bool(s.editedText, base.editedText),
      recommended: bool(s.recommended, base.recommended),
    });
  });
  // Exactly one card is recommended.
  if (packages.filter((p) => p.recommended).length !== 1) {
    packages.forEach((p, i) => (p.recommended = i === packages.length - 1));
  }
  const extras = LISTING_EXTRAS.map((extra): ListingExtra => {
    const stored = services?.listingExtras?.[extra.id];
    const tiers = readTiers(stored?.tiers) ?? [{ upToHuf: null, priceEur: num(stored?.priceEur, extra.priceEur, 0, PRICE_MAX) }];
    return {
      id: extra.id,
      tiers,
      priceEur: tiers[0].priceEur,
      unit: extra.unit,
      ...('minMonths' in extra ? { minMonths: extra.minMonths } : {}),
      ...('retired' in extra && extra.retired ? { retired: true } : {}),
      ...('countries' in extra ? { countries: extra.countries } : {}),
    };
  });
  return { packages, extras };
}

/**
 * What site_settings.services stores for the packages, from a normalised
 * catalogue: `tiers` plus the flat `priceEur` / `priceEurAbove` /
 * `thresholdHuf` mirror, so a build from before the tiers (a rollback) still
 * reads sensible prices from the same row. With three or more tiers that
 * mirror can only keep the first bound and the last price.
 */
export function storedPackages(catalog: ListingCatalog): Record<string, StoredListingPackage> {
  return Object.fromEntries(
    catalog.packages.map(({ id, phone: _phone, ...pkg }) => [id, { ...pkg, names: { hu: pkg.names.hu, nl: pkg.names.nl }, tiers: pkg.tiers.map((tier) => ({ ...tier })) }])
  );
}

/** The stored extras: `tiers` plus the flat `priceEur` (the first tier) for older readers. */
export function storedExtras(catalog: ListingCatalog): Record<string, { priceEur: number; tiers: PriceTier[] }> {
  return Object.fromEntries(catalog.extras.map((extra) => [extra.id, { priceEur: extra.tiers[0].priceEur, tiers: extra.tiers.map((tier) => ({ ...tier })) }]));
}

/** The per-package phone switch, stored next to the packages (listing-rules reads it). */
export function storedPackagePhone(catalog: ListingCatalog): Record<string, boolean> {
  return Object.fromEntries(catalog.packages.map((pkg) => [pkg.id, pkg.phone]));
}

export function packageOf(catalog: ListingCatalog, id: string | null | undefined): ListingPackage {
  return catalog.packages.find((p) => p.id === id) ?? catalog.packages[0];
}

export function extraOf(catalog: ListingCatalog, id: string): ListingExtra | undefined {
  return catalog.extras.find((e) => e.id === id);
}

/** An extra's unit price for a property priced `priceHuf` (no price yet: the first tier). */
export function extraPrice(catalog: ListingCatalog, id: ExtraId, priceHuf?: number | null): number {
  const extra = extraOf(catalog, id);
  return extra ? priceEurFor(extra, priceHuf) : 0;
}

/** Whether an extra may be sold for a property in `country` (unknown country: only extras sold everywhere). */
export function extraSoldIn(extra: Pick<ListingExtra, 'retired' | 'countries'>, country?: string | null): boolean {
  if (extra.retired) return false;
  if (!extra.countries) return true;
  return Boolean(country) && extra.countries.includes(String(country).toUpperCase());
}

/**
 * The extras a selling surface may offer: never a retired one, and a
 * country-limited one only where it applies. Pass `country: undefined` on
 * pages that list the whole tariff (the price list), where the country note
 * goes into the label instead.
 */
export function sellingExtras(catalog: ListingCatalog, opts: { country?: string | null; anyCountry?: boolean } = {}): ListingExtra[] {
  return catalog.extras.filter((extra) => !extra.retired && (opts.anyCountry || extraSoldIn(extra, opts.country)));
}

/**
 * @deprecated Two-tier wording. Use `tierFor(pkg.tiers, priceHuf).index > 0`.
 * Whether the listing's own forint price puts it above the first tier.
 */
export function isAboveThreshold(pkg: Tiered, priceHuf: number): boolean {
  return tierFor(pkg.tiers, priceHuf).index > 0;
}

/* ── Public wording ────────────────────────────────────────────────────── */

/** "69 €" in Hungarian, "€ 69" in Dutch, then each language's own house style. */
export const eurText = (locale: Locale, n: number) =>
  locale === 'hu' ? `${n}\u00a0€` : locale === 'nl' ? `€\u00a0${n}` : eur(n, locale);

/**
 * What a package card says — price, duration and the feature list, all
 * derived from the settings so the cards can never disagree with checkout.
 */
export function packageCard(pkg: ListingPackage, catalog: ListingCatalog, locale: Locale, opts: { withExtras?: boolean } = {}) {
  const x = localizer(locale);
  const shoot = extraOf(catalog, 'video');
  const videoShoot = shoot && !shoot.retired ? shoot : null;
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
    // Since November 2026 a link to the owner's own video is free in every package that shows video;
    // the filmed shoot is a separate, Hungary-only extra (§4b).
    pkg.video === 'included'
      ? x('Saját videója linkje díjmentesen megadható', 'Een link naar uw eigen video plaatst u gratis', 'Add a link to your own video free of charge', 'Link zu Ihrem eigenen Video kostenlos', 'Lien vers votre propre vidéo gratuit', 'Enlace a su propio vídeo sin coste', 'Link do własnego filmu bezpłatnie', 'Link către propriul videoclip, gratuit', 'Odkaz na vlastné video zadarmo', 'Link al Suo video gratuito', 'Ligação para o seu próprio vídeo sem custos', 'Σύνδεσμος προς το δικό σας βίντεο δωρεάν', 'Odkaz na vlastní video zdarma', 'Povezava do lastnega videa brezplačno', 'Länk till din egen video utan kostnad', 'Link til din egen video gratis', 'Lenke til din egen video gratis', 'Linkki omaan videoosi maksutta', 'Link teie enda videole tasuta', 'Saite uz jūsu video bez maksas', 'Nuoroda į jūsų vaizdo įrašą nemokamai')
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
          ...(videoShoot && videoShoot.countries?.includes('HU')
            ? [
                x(
                  `Magyarországon ingatlan videó készítése, drónos felvétel, profi vágással (${eurText(locale, videoShoot.priceEur)})`,
                  `Vastgoedvideo opgenomen in Hongarije, met drone-opnames en professionele montage (${eurText(locale, videoShoot.priceEur)})`,
                  `Property video filmed in Hungary, with drone footage and professional editing (${eurText(locale, videoShoot.priceEur)})`,
                  `Immobilienvideo, in Ungarn gedreht, mit Drohnenaufnahmen und professionellem Schnitt (${eurText(locale, videoShoot.priceEur)})`,
                  `Vidéo du bien tournée en Hongrie, avec prises de vue par drone et montage professionnel (${eurText(locale, videoShoot.priceEur)})`,
                  `Vídeo del inmueble grabado en Hungría, con tomas de dron y edición profesional (${eurText(locale, videoShoot.priceEur)})`,
                  `Film o nieruchomości nagrany na Węgrzech, z ujęciami z drona i profesjonalnym montażem (${eurText(locale, videoShoot.priceEur)})`,
                  `Videoclip al proprietății filmat în Ungaria, cu imagini din dronă și montaj profesionist (${eurText(locale, videoShoot.priceEur)})`,
                  `Video nehnuteľnosti natočené v Maďarsku, so zábermi z dronu a profesionálnym strihom (${eurText(locale, videoShoot.priceEur)})`,
                  `Video dell’immobile girato in Ungheria, con riprese da drone e montaggio professionale (${eurText(locale, videoShoot.priceEur)})`,
                  `Vídeo do imóvel filmado na Hungria, com imagens de drone e edição profissional (${eurText(locale, videoShoot.priceEur)})`,
                  `Βίντεο ακινήτου στην Ουγγαρία, με λήψεις από drone και επαγγελματικό μοντάζ (${eurText(locale, videoShoot.priceEur)})`,
                  `Video nemovitosti natočené v Maďarsku, se záběry z dronu a profesionálním střihem (${eurText(locale, videoShoot.priceEur)})`,
                  `Video nepremičnine, posnet na Madžarskem, s posnetki iz drona in profesionalno montažo (${eurText(locale, videoShoot.priceEur)})`,
                  `Fastighetsvideo inspelad i Ungern, med drönarbilder och professionell redigering (${eurText(locale, videoShoot.priceEur)})`,
                  `Ejendomsvideo optaget i Ungarn, med droneoptagelser og professionel redigering (${eurText(locale, videoShoot.priceEur)})`,
                  `Eiendomsvideo filmet i Ungarn, med droneopptak og profesjonell redigering (${eurText(locale, videoShoot.priceEur)})`,
                  `Kiinteistövideo Unkarissa, droonikuvauksella ja ammattimaisella editoinnilla (${eurText(locale, videoShoot.priceEur)})`,
                  `Kinnisvaravideo Ungaris, droonivõtete ja professionaalse montaažiga (${eurText(locale, videoShoot.priceEur)})`,
                  `Īpašuma video, filmēts Ungārijā, ar drona kadriem un profesionālu montāžu (${eurText(locale, videoShoot.priceEur)})`,
                  `Turto vaizdo įrašas Vengrijoje, su drono kadrais ir profesionaliu montažu (${eurText(locale, videoShoot.priceEur)})`
                ),
              ]
            : []),
          x('Kiemelés külön kérhető', 'Uitlichten op verzoek', 'Highlighting on request', 'Hervorhebung auf Wunsch', 'Mise en avant sur demande', 'Destacado bajo petición', 'Wyróżnienie na życzenie', 'Evidențiere la cerere', 'Zvýraznenie na požiadanie', 'Messa in evidenza su richiesta', 'Destaque a pedido', 'Προβολή κατόπιν αιτήματος', 'Zvýraznění na vyžádání', 'Izpostavitev na zahtevo', 'Framhävning på begäran', 'Fremhævning efter ønske', 'Fremheving på forespørsel', 'Korostus pyynnöstä', 'Esiletõstmine soovi korral', 'Izcelšana pēc pieprasījuma', 'Paryškinimas pagal užsakymą'),
        ]
      : []),
  ].filter((line): line is string => Boolean(line));
  const months = pkg.months;
  return {
    id: pkg.id,
    name: pkg.names[locale],
    priceCents: pkg.tiers[0].priceEur * 100,
    price: eurText(locale, pkg.tiers[0].priceEur),
    // Every higher tier gets its own line: "€ 179 · 150 000 000 Ft feletti ingatlan".
    priceTiers: pkg.tiers.slice(1).map((tier, i) => ({ price: eurText(locale, tier.priceEur), note: tierPhrase(pkg.tiers, i + 1, locale) })),
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
