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
      ? x({ hu: 'Korlátlan számú kép', nl: 'Onbeperkt aantal foto’s', en: 'Unlimited number of photos', de: 'Unbegrenzte Anzahl Fotos', fr: 'Nombre de photos illimité', es: 'Número ilimitado de fotos', pl: 'Nieograniczona liczba zdjęć', ro: 'Număr nelimitat de fotografii', sk: 'Neobmedzený počet fotografií', it: 'Numero illimitato di foto', pt: 'Número ilimitado de fotografias', el: 'Απεριόριστος αριθμός φωτογραφιών', cs: 'Neomezený počet fotografií', sl: 'Neomejeno število fotografij', sv: 'Obegränsat antal bilder', da: 'Ubegrænset antal billeder', no: 'Ubegrenset antall bilder', fi: 'Rajaton määrä kuvia', et: 'Piiramatu arv fotosid', lv: 'Neierobežots fotoattēlu skaits', lt: 'Neribotas nuotraukų skaičius', sr: 'Neograničen broj fotografija', uk: 'Необмежена кількість фото', tr: 'Sınırsız sayıda fotoğraf', he: 'Unlimited number of photos', ar: 'Unlimited number of photos', ru: 'Неограниченное количество фото', zh: 'Unlimited number of photos' })
      : x({ hu: `Legfeljebb ${pkg.maxImages} kép`, nl: `Maximaal ${pkg.maxImages} foto’s`, en: `Up to ${pkg.maxImages} photos`, de: `Bis zu ${pkg.maxImages} Fotos`, fr: `Jusqu’à ${pkg.maxImages} photos`, es: `Hasta ${pkg.maxImages} fotos`, pl: `Maksymalnie ${nOf('pl', pkg.maxImages, 'zdjęcie', 'zdjęcia', 'zdjęć')}`, ro: `Până la ${nOf('ro', pkg.maxImages, 'fotografie', 'fotografii', 'de fotografii')}`, sk: `Najviac ${nOf('sk', pkg.maxImages, 'fotografia', 'fotografie', 'fotografií')}`, it: `Fino a ${pkg.maxImages} foto`, pt: `Até ${pkg.maxImages} fotografias`, el: `Έως ${pkg.maxImages} φωτογραφίες`, cs: `Až ${nOf('cs', pkg.maxImages, 'fotografie', 'fotografie', 'fotografií')}`, sl: `Do ${nOf('sl', pkg.maxImages, 'fotografije', 'fotografij', 'fotografij', 'fotografij')}`, sv: `Upp till ${pkg.maxImages} bilder`, da: `Op til ${pkg.maxImages} billeder`, no: `Opptil ${pkg.maxImages} bilder`, fi: `Enintään ${pkg.maxImages} kuvaa`, et: `Kuni ${pkg.maxImages} fotot`, lv: `Līdz ${nOf('lv', pkg.maxImages, 'fotoattēlam', 'fotoattēliem')}`, lt: `Iki ${nOf('lt', pkg.maxImages, 'nuotraukos', 'nuotraukų')}`, sr: `Najviše ${nOf('sr', pkg.maxImages, 'fotografija', 'fotografije', 'fotografija')}`, uk: `До ${pkg.maxImages} фото`, tr: `En fazla ${pkg.maxImages} fotoğraf`, he: `Up to ${pkg.maxImages} photos`, ar: `Up to ${pkg.maxImages} photos`, ru: `До ${pkg.maxImages} фото`, zh: `Up to ${pkg.maxImages} photos` }),
    pkg.editedImages
      ? x({ hu: 'A képeket szakszerűen feldolgozzuk', nl: 'Foto’s worden professioneel bewerkt', en: 'Photos are professionally edited', de: 'Fotos werden professionell bearbeitet', fr: 'Les photos sont retouchées par des professionnels', es: 'Fotos retocadas por profesionales', pl: 'Zdjęcia retuszowane przez profesjonalistów', ro: 'Fotografiile sunt retușate de profesioniști', sk: 'Fotografie upravujú profesionáli', it: 'Le foto vengono elaborate professionalmente', pt: 'As fotografias são editadas profissionalmente', el: 'Οι φωτογραφίες επεξεργάζονται επαγγελματικά', cs: 'Fotografie jsou profesionálně upraveny', sl: 'Fotografije so strokovno obdelane', sv: 'Bilderna redigeras professionellt', da: 'Billederne redigeres professionelt', no: 'Bildene redigeres profesjonelt', fi: 'Kuvat käsitellään ammattimaisesti', et: 'Fotod töödeldakse professionaalselt', lv: 'Fotoattēli tiek profesionāli apstrādāti', lt: 'Nuotraukos profesionaliai apdorojamos', sr: 'Fotografije se profesionalno obrađuju', uk: 'Фото професійно обробляються', tr: 'Fotoğraflar profesyonelce düzenlenir', he: 'Photos are professionally edited', ar: 'Photos are professionally edited', ru: 'Фото профессионально обрабатываются', zh: 'Photos are professionally edited' })
      : x({ hu: 'A képek az eredeti állapotban jelennek meg', nl: 'Foto’s worden ongewijzigd geplaatst', en: 'Photos appear as supplied', de: 'Fotos erscheinen unverändert', fr: 'Les photos sont publiées telles quelles', es: 'Las fotos se publican tal como se entregan', pl: 'Zdjęcia publikujemy w otrzymanej postaci', ro: 'Fotografiile sunt publicate așa cum au fost trimise', sk: 'Fotografie zverejňujeme tak, ako ich dodáte', it: 'Le foto vengono pubblicate così come fornite', pt: 'As fotografias são publicadas tal como enviadas', el: 'Οι φωτογραφίες δημοσιεύονται όπως τις στείλατε', cs: 'Fotografie se zveřejní tak, jak je dodáte', sl: 'Fotografije so objavljene takšne, kot jih pošljete', sv: 'Bilderna publiceras som de har skickats in', da: 'Billederne vises, som de er leveret', no: 'Bildene vises slik de er levert', fi: 'Kuvat julkaistaan sellaisinaan', et: 'Fotod avaldatakse sellisena, nagu need saadeti', lv: 'Fotoattēli tiek publicēti tādi, kādi iesniegti', lt: 'Nuotraukos skelbiamos tokios, kokias pateikėte', sr: 'Fotografije se objavljuju u dostavljenom obliku', uk: 'Фото публікуються в наданому вигляді', tr: 'Fotoğraflar gönderildiği gibi yayınlanır', he: 'Photos appear as supplied', ar: 'Photos appear as supplied', ru: 'Фото публикуются в предоставленном виде', zh: 'Photos appear as supplied' }),
    pkg.editedText
      ? x({ hu: 'A szöveget szakszerűen megszerkesztjük', nl: 'Tekst wordt professioneel geredigeerd', en: 'The text is professionally edited', de: 'Der Text wird professionell redigiert', fr: 'Le texte est rédigé et relu par des professionnels', es: 'El texto lo redactan y revisan profesionales', pl: 'Tekst redagują i sprawdzają profesjonaliści', ro: 'Textul este redactat și revizuit de profesioniști', sk: 'Text píšu a kontrolujú profesionáli', it: 'Il testo viene revisionato professionalmente', pt: 'O texto é revisto profissionalmente', el: 'Το κείμενο επιμελείται επαγγελματικά', cs: 'Text je profesionálně upraven', sl: 'Besedilo je strokovno urejeno', sv: 'Texten redigeras professionellt', da: 'Teksten redigeres professionelt', no: 'Teksten redigeres profesjonelt', fi: 'Teksti viimeistellään ammattimaisesti', et: 'Teksti toimetatakse professionaalselt', lv: 'Teksts tiek profesionāli rediģēts', lt: 'Tekstas profesionaliai redaguojamas', sr: 'Tekst se profesionalno uređuje', uk: 'Текст професійно редагується', tr: 'Metin profesyonelce düzenlenir', he: 'The text is professionally edited', ar: 'The text is professionally edited', ru: 'Текст профессионально редактируется', zh: 'The text is professionally edited' })
      : x({ hu: 'A szöveg a beküldött formában jelenik meg', nl: 'Tekst wordt geplaatst zoals aangeleverd', en: 'The text appears as supplied', de: 'Der Text erscheint wie eingereicht', fr: 'Le texte est publié tel que fourni', es: 'El texto se publica tal como se entrega', pl: 'Tekst publikujemy w otrzymanej postaci', ro: 'Textul este publicat așa cum a fost trimis', sk: 'Text zverejňujeme tak, ako ho dodáte', it: 'Il testo viene pubblicato così come fornito', pt: 'O texto é publicado tal como enviado', el: 'Το κείμενο δημοσιεύεται όπως το στείλατε', cs: 'Text se zveřejní tak, jak ho dodáte', sl: 'Besedilo je objavljeno takšno, kot ga pošljete', sv: 'Texten publiceras som den har skickats in', da: 'Teksten vises, som den er leveret', no: 'Teksten vises slik den er levert', fi: 'Teksti julkaistaan sellaisenaan', et: 'Tekst avaldatakse sellisena, nagu see saadeti', lv: 'Teksts tiek publicēts tāds, kāds iesniegts', lt: 'Tekstas skelbiamas toks, kokį pateikėte', sr: 'Tekst se objavljuje u dostavljenom obliku', uk: 'Текст публікується в наданому вигляді', tr: 'Metin gönderildiği gibi yayınlanır', he: 'The text appears as supplied', ar: 'The text appears as supplied', ru: 'Текст публикуется в предоставленном виде', zh: 'The text appears as supplied' }),
    // Since November 2026 a link to the owner's own video is free in every package that shows video;
    // the filmed shoot is a separate, Hungary-only extra (§4b).
    pkg.video === 'included'
      ? x({ hu: 'Saját videója linkje díjmentesen megadható', nl: 'Een link naar uw eigen video plaatst u gratis', en: 'Add a link to your own video free of charge', de: 'Link zu Ihrem eigenen Video kostenlos', fr: 'Lien vers votre propre vidéo gratuit', es: 'Enlace a su propio vídeo sin coste', pl: 'Link do własnego filmu bezpłatnie', ro: 'Link către propriul videoclip, gratuit', sk: 'Odkaz na vlastné video zadarmo', it: 'Link al Suo video gratuito', pt: 'Ligação para o seu próprio vídeo sem custos', el: 'Σύνδεσμος προς το δικό σας βίντεο δωρεάν', cs: 'Odkaz na vlastní video zdarma', sl: 'Povezava do lastnega videa brezplačno', sv: 'Länk till din egen video utan kostnad', da: 'Link til din egen video gratis', no: 'Lenke til din egen video gratis', fi: 'Linkki omaan videoosi maksutta', et: 'Link teie enda videole tasuta', lv: 'Saite uz jūsu video bez maksas', lt: 'Nuoroda į jūsų vaizdo įrašą nemokamai', sr: 'Besplatno dodajte link ka svom videu', uk: 'Безкоштовно додайте посилання на власне відео', tr: 'Kendi videonuzun bağlantısını ücretsiz ekleyin', he: 'Add a link to your own video free of charge', ar: 'Add a link to your own video free of charge', ru: 'Бесплатно добавьте ссылку на собственное видео', zh: 'Add a link to your own video free of charge' })
      : null,
    pkg.phone
      ? x({ hu: 'Az Ön telefonszáma megjelenhet a hirdetésben', nl: 'Uw telefoonnummer kan bij de advertentie staan', en: 'Your phone number can appear with the listing', de: 'Ihre Telefonnummer kann beim Inserat stehen', fr: 'Votre numéro de téléphone peut figurer dans l’annonce', es: 'Su número de teléfono puede aparecer en el anuncio', pl: 'Państwa numer telefonu może być widoczny w ogłoszeniu', ro: 'Numărul dumneavoastră de telefon poate apărea în anunț', sk: 'Vaše telefónne číslo môže byť uvedené v inzeráte', it: 'Il Suo numero di telefono può comparire nell’annuncio', pt: 'O seu número de telefone pode aparecer no anúncio', el: 'Ο αριθμός τηλεφώνου σας μπορεί να εμφανίζεται στην αγγελία', cs: 'Vaše telefonní číslo může být uvedeno u inzerátu', sl: 'Vaša telefonska številka je lahko navedena v oglasu', sv: 'Ditt telefonnummer kan visas i annonsen', da: 'Dit telefonnummer kan vises i annoncen', no: 'Telefonnummeret ditt kan vises i annonsen', fi: 'Puhelinnumerosi voi näkyä ilmoituksessa', et: 'Teie telefoninumber võib olla kuulutuses nähtav', lv: 'Jūsu tālruņa numurs var būt redzams sludinājumā', lt: 'Jūsų telefono numeris gali būti rodomas skelbime', sr: 'Vaš broj telefona može biti prikazan uz oglas', uk: 'Ваш номер телефону може відображатися в оголошенні', tr: 'Telefon numaranız ilanda gösterilebilir', he: 'Your phone number can appear with the listing', ar: 'Your phone number can appear with the listing', ru: 'Ваш номер телефона может отображаться в объявлении', zh: 'Your phone number can appear with the listing' })
      : x({ hu: 'Az érdeklődők a FINDDOME-en keresztül érik el', nl: 'Geïnteresseerden bereiken u via FINDDOME', en: 'Interested buyers reach you through FINDDOME', de: 'Interessenten erreichen Sie über FINDDOME', fr: 'Les personnes intéressées vous joignent par FINDDOME', es: 'Los interesados contactan con usted a través de FINDDOME', pl: 'Zainteresowani kontaktują się z Państwem za pośrednictwem FINDDOME', ro: 'Persoanele interesate vă contactează prin FINDDOME', sk: 'Záujemcovia vás kontaktujú cez FINDDOME', it: 'Gli acquirenti interessati La contattano tramite FINDDOME', pt: 'Os compradores interessados contactam-no através da FINDDOME', el: 'Οι ενδιαφερόμενοι αγοραστές επικοινωνούν μαζί σας μέσω της FINDDOME', cs: 'Zájemci vás kontaktují prostřednictvím FINDDOME', sl: 'Zainteresirani kupci vas kontaktirajo prek FINDDOME', sv: 'Intresserade köpare når dig via FINDDOME', da: 'Interesserede købere kontakter dig via FINDDOME', no: 'Interesserte kjøpere når deg via FINDDOME', fi: 'Kiinnostuneet ostajat tavoittavat sinut FINDDOMEn kautta', et: 'Huvitatud ostjad võtavad teiega ühendust FINDDOME’i kaudu', lv: 'Ieinteresētie pircēji ar jums sazinās ar FINDDOME starpniecību', lt: 'Susidomėję pirkėjai su jumis susisiekia per FINDDOME', sr: 'Zainteresovani kupci vas kontaktiraju preko FINDDOME-a', uk: 'Зацікавлені покупці зв’язуються з вами через FINDDOME', tr: 'İlgilenen alıcılar size FINDDOME üzerinden ulaşır', he: 'Interested buyers reach you through FINDDOME', ar: 'Interested buyers reach you through FINDDOME', ru: 'Заинтересованные покупатели связываются с вами через FINDDOME', zh: 'Interested buyers reach you through FINDDOME' }),
    ...(opts.withExtras
      ? [
          x({
            hu: `Igény szerint idegen nyelvű fordítás (${translation} €/nyelv)`,
            nl: `Vertaling op verzoek (€ ${translation} per taal)`,
            en: `Translation on request (${eurText(locale, translation)} per language)`,
            de: `Übersetzung auf Wunsch (${eurText(locale, translation)} pro Sprache)`,
            fr: `Traduction sur demande (${eurText(locale, translation)} par langue)`,
            es: `Traducción bajo petición (${eurText(locale, translation)} por idioma)`,
            pl: `Tłumaczenie na życzenie (${eurText(locale, translation)} za język)`,
            ro: `Traducere la cerere (${eurText(locale, translation)} per limbă)`,
            sk: `Preklad na požiadanie (${eurText(locale, translation)} za jazyk)`,
            it: `Traduzione su richiesta (${eurText(locale, translation)} per lingua)`,
            pt: `Tradução a pedido (${eurText(locale, translation)} por língua)`,
            el: `Μετάφραση κατόπιν αιτήματος (${eurText(locale, translation)} ανά γλώσσα)`,
            cs: `Překlad na vyžádání (${eurText(locale, translation)} za jazyk)`,
            sl: `Prevod na zahtevo (${eurText(locale, translation)} na jezik)`,
            sv: `Översättning på begäran (${eurText(locale, translation)} per språk)`,
            da: `Oversættelse efter ønske (${eurText(locale, translation)} pr. sprog)`,
            no: `Oversettelse på forespørsel (${eurText(locale, translation)} per språk)`,
            fi: `Käännös pyynnöstä (${eurText(locale, translation)} kieltä kohden)`,
            et: `Tõlge soovi korral (${eurText(locale, translation)} keele kohta)`,
            lv: `Tulkojums pēc pieprasījuma (${eurText(locale, translation)} par valodu)`,
            lt: `Vertimas pagal užsakymą (${eurText(locale, translation)} už kalbą)`,
            sr: `Prevod na zahtev (${eurText(locale, translation)} po jeziku)`,
            uk: `Переклад на замовлення (${eurText(locale, translation)} за мову)`,
            tr: `İsteğe bağlı çeviri (dil başına ${eurText(locale, translation)})`,
            he: `Translation on request (${eurText(locale, translation)} per language)`,
            ar: `Translation on request (${eurText(locale, translation)} per language)`,
            ru: `Перевод по запросу (${eurText(locale, translation)} за язык)`,
            zh: `Translation on request (${eurText(locale, translation)} per language)`,
          }),
          ...(videoShoot && videoShoot.countries?.includes('HU')
            ? [
                x({
                  hu: `Magyarországon ingatlan videó készítése, drónos felvétel, profi vágással (${eurText(locale, videoShoot.priceEur)})`,
                  nl: `Vastgoedvideo opgenomen in Hongarije, met drone-opnames en professionele montage (${eurText(locale, videoShoot.priceEur)})`,
                  en: `Property video filmed in Hungary, with drone footage and professional editing (${eurText(locale, videoShoot.priceEur)})`,
                  de: `Immobilienvideo, in Ungarn gedreht, mit Drohnenaufnahmen und professionellem Schnitt (${eurText(locale, videoShoot.priceEur)})`,
                  fr: `Vidéo du bien tournée en Hongrie, avec prises de vue par drone et montage professionnel (${eurText(locale, videoShoot.priceEur)})`,
                  es: `Vídeo del inmueble grabado en Hungría, con tomas de dron y edición profesional (${eurText(locale, videoShoot.priceEur)})`,
                  pl: `Film o nieruchomości nagrany na Węgrzech, z ujęciami z drona i profesjonalnym montażem (${eurText(locale, videoShoot.priceEur)})`,
                  ro: `Videoclip al proprietății filmat în Ungaria, cu imagini din dronă și montaj profesionist (${eurText(locale, videoShoot.priceEur)})`,
                  sk: `Video nehnuteľnosti natočené v Maďarsku, so zábermi z dronu a profesionálnym strihom (${eurText(locale, videoShoot.priceEur)})`,
                  it: `Video dell’immobile girato in Ungheria, con riprese da drone e montaggio professionale (${eurText(locale, videoShoot.priceEur)})`,
                  pt: `Vídeo do imóvel filmado na Hungria, com imagens de drone e edição profissional (${eurText(locale, videoShoot.priceEur)})`,
                  el: `Βίντεο ακινήτου στην Ουγγαρία, με λήψεις από drone και επαγγελματικό μοντάζ (${eurText(locale, videoShoot.priceEur)})`,
                  cs: `Video nemovitosti natočené v Maďarsku, se záběry z dronu a profesionálním střihem (${eurText(locale, videoShoot.priceEur)})`,
                  sl: `Video nepremičnine, posnet na Madžarskem, s posnetki iz drona in profesionalno montažo (${eurText(locale, videoShoot.priceEur)})`,
                  sv: `Fastighetsvideo inspelad i Ungern, med drönarbilder och professionell redigering (${eurText(locale, videoShoot.priceEur)})`,
                  da: `Ejendomsvideo optaget i Ungarn, med droneoptagelser og professionel redigering (${eurText(locale, videoShoot.priceEur)})`,
                  no: `Eiendomsvideo filmet i Ungarn, med droneopptak og profesjonell redigering (${eurText(locale, videoShoot.priceEur)})`,
                  fi: `Kiinteistövideo Unkarissa, droonikuvauksella ja ammattimaisella editoinnilla (${eurText(locale, videoShoot.priceEur)})`,
                  et: `Kinnisvaravideo Ungaris, droonivõtete ja professionaalse montaažiga (${eurText(locale, videoShoot.priceEur)})`,
                  lv: `Īpašuma video, filmēts Ungārijā, ar drona kadriem un profesionālu montāžu (${eurText(locale, videoShoot.priceEur)})`,
                  lt: `Turto vaizdo įrašas Vengrijoje, su drono kadrais ir profesionaliu montažu (${eurText(locale, videoShoot.priceEur)})`,
                  sr: `Video nekretnine snimljen u Mađarskoj, sa snimcima dronom i profesionalnom montažom (${eurText(locale, videoShoot.priceEur)})`,
                  uk: `Відео нерухомості, зняте в Угорщині, зі зйомкою з дрона та професійним монтажем (${eurText(locale, videoShoot.priceEur)})`,
                  tr: `Macaristan’da çekilen, drone görüntüleri içeren ve profesyonelce kurgulanan mülk videosu (${eurText(locale, videoShoot.priceEur)})`,
                  he: `Property video filmed in Hungary, with drone footage and professional editing (${eurText(locale, videoShoot.priceEur)})`,
                  ar: `Property video filmed in Hungary, with drone footage and professional editing (${eurText(locale, videoShoot.priceEur)})`,
                  ru: `Видео недвижимости, снятое в Венгрии, со съёмкой с дрона и профессиональным монтажом (${eurText(locale, videoShoot.priceEur)})`,
                  zh: `Property video filmed in Hungary, with drone footage and professional editing (${eurText(locale, videoShoot.priceEur)})`,
                }),
              ]
            : []),
          x({ hu: 'Kiemelés külön kérhető', nl: 'Uitlichten op verzoek', en: 'Highlighting on request', de: 'Hervorhebung auf Wunsch', fr: 'Mise en avant sur demande', es: 'Destacado bajo petición', pl: 'Wyróżnienie na życzenie', ro: 'Evidențiere la cerere', sk: 'Zvýraznenie na požiadanie', it: 'Messa in evidenza su richiesta', pt: 'Destaque a pedido', el: 'Προβολή κατόπιν αιτήματος', cs: 'Zvýraznění na vyžádání', sl: 'Izpostavitev na zahtevo', sv: 'Framhävning på begäran', da: 'Fremhævning efter ønske', no: 'Fremheving på forespørsel', fi: 'Korostus pyynnöstä', et: 'Esiletõstmine soovi korral', lv: 'Izcelšana pēc pieprasījuma', lt: 'Paryškinimas pagal užsakymą', sr: 'Isticanje na zahtev', uk: 'Виділення на замовлення', tr: 'İsteğe bağlı öne çıkarma', he: 'Highlighting on request', ar: 'Highlighting on request', ru: 'Выделение по запросу', zh: 'Highlighting on request' }),
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
    duration: x({
      hu: `${months} hónap`,
      nl: `${months} ${months === 1 ? 'maand' : 'maanden'}`,
      en: `${months} ${months === 1 ? 'month' : 'months'}`,
      de: `${months} ${months === 1 ? 'Monat' : 'Monate'}`,
      fr: `${months} mois`,
      es: `${nOf('es', months, 'mes', 'meses')}`,
      pl: `${nOf('pl', months, 'miesiąc', 'miesiące', 'miesięcy')}`,
      ro: `${nOf('ro', months, 'lună', 'luni', 'de luni')}`,
      sk: `${nOf('sk', months, 'mesiac', 'mesiace', 'mesiacov')}`,
      it: `${months} ${months === 1 ? 'mese' : 'mesi'}`,
      pt: `${months} ${months === 1 ? 'mês' : 'meses'}`,
      el: `${months} ${months === 1 ? 'μήνας' : 'μήνες'}`,
      cs: `${nOf('cs', months, 'měsíc', 'měsíce', 'měsíců')}`,
      sl: `${nOf('sl', months, 'mesec', 'meseci', 'mesecev', 'meseca')}`,
      sv: `${months} ${months === 1 ? 'månad' : 'månader'}`,
      da: `${months} ${months === 1 ? 'måned' : 'måneder'}`,
      no: `${months} ${months === 1 ? 'måned' : 'måneder'}`,
      fi: `${months} ${months === 1 ? 'kuukausi' : 'kuukautta'}`,
      et: `${months} ${months === 1 ? 'kuu' : 'kuud'}`,
      lv: `${nOf('lv', months, 'mēnesis', 'mēneši', 'mēnešu')}`,
      lt: `${nOf('lt', months, 'mėnuo', 'mėnesiai', 'mėnesių')}`,
      sr: `${nOf('sr', months, 'mesec', 'meseca', 'meseci')}`,
      uk: `${nOf('uk', months, 'місяць', 'місяці', 'місяців')}`,
      tr: `${months} ay`,
      he: `${months} ${months === 1 ? 'month' : 'months'}`,
      ar: `${months} ${months === 1 ? 'month' : 'months'}`,
      ru: `${nOf('ru', months, 'месяц', 'месяца', 'месяцев')}`,
      zh: `${months} ${months === 1 ? 'month' : 'months'}`,
    }),
    featured: pkg.recommended,
    features,
  };
}

/** The lowest package price and the price range, for headlines and meta descriptions. */
export function priceFacts(catalog: ListingCatalog) {
  const prices = catalog.packages.map((p) => p.priceEur);
  return { from: Math.min(...prices) };
}
