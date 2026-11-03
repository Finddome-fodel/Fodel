/**
 * Listing orders — what an approved listing costs, itemised.
 *
 * FODEL 1.1's payment model is approve-then-charge: an admin reviews a
 * submitted listing, confirms the package and ticks any extras, and the system
 * turns that into an order the owner pays before publication.
 *
 * Two rules run through this file:
 *
 * 1. **A price is never taken from the client.** Everything resolves against
 *    the admin-edited catalogue (src/lib/listing-packages.ts) by id. The browser sends "the
 *    12-month package and two translations", never "€179".
 *
 * 2. **A stored order is denormalised on purpose.** The label and unit price
 *    are written into `payments.line_items` at the moment the order is made,
 *    not looked up again later. An order is a financial record: it has to
 *    still read correctly in three years, after the tariff on fodel.hu has
 *    changed twice. Re-deriving a 2026 total from the 2029 price list would
 *    quietly rewrite history.
 */
import { pluralForm } from '~/i18n/plural';
import { ONSITE_SERVICES } from '~/config/company';
import type { Locale } from '~/i18n/ui';
import { eurCents, intlTag } from '~/lib/format';
import type { RequestedExtras } from '~/lib/portal/requested-extras';
import { ALL_LOCALES, OWNER_TARGETS } from '~/lib/ai/translate-core';
import { cleanExclusions, translationLines, type TranslationLine } from '~/lib/translation-packages';
import { extraSoldIn, listingCatalog, packageOf, type ListingCatalog } from '~/lib/listing-packages';
import { flatTiers, tierFor, tierRange, type PriceTier } from '~/lib/price-tiers';
import { tierPhrase } from '~/lib/tier-phrase';

/**
 * Everything that can be a line after the package: the listing extras plus
 * the two on-site services (brief 3 §F). Until the advance-payment decision
 * is made, an on-site service is charged the existing way — on the listing's
 * order at approval — so it lives in the same catalogue.
 */
/**
 * Prices come from the admin-edited catalogue (src/lib/listing-packages.ts);
 * every function below takes it, defaulting to the published tariff.
 */
type OrderExtra = { id: string; tiers: PriceTier[]; priceEur: number; unit?: string; minMonths?: number; retired?: boolean; countries?: readonly string[] };
const orderExtras = (cat: ListingCatalog): readonly OrderExtra[] => [
  ...cat.extras,
  ...ONSITE_SERVICES.map((service) => ({ id: service.id, tiers: flatTiers(service.priceEur), priceEur: service.priceEur, unit: 'once' })),
];

/** The on-site services exclude each other: one visit per listing. */
const EXCLUSIVE = new Set<string>(ONSITE_SERVICES.map((service) => service.id));

export type OrderLocale = Locale;

/** One line of a stored order, exactly as it lives in `payments.line_items`. */
export type OrderLine = {
  /** `service` is a standalone purchase (a valuation package), not part of a listing order. */
  kind: 'package' | 'extra' | 'service';
  id: string;
  quantity: number;
  unitCents: number;
  label: string;
  /** Translation lines only: the languages bought, so paying is enough to know what to translate. */
  locales?: string[];
  /**
   * The price tier the line was charged at, for audit — only when the item has
   * more than one tier (§9.2). `toHuf` null is the open last tier.
   */
  tier?: { index: number; fromHuf: number; toHuf: number | null };
  /** A translation package line: which package it buys, so paying is enough to know what to apply. */
  packageId?: string;
};

/** What the admin's review form sends: ids and counts, never money. */
export type OrderSelection = {
  packageId: string;
  /**
   * The listing's forint price when the order is made; it picks the price tier
   * of the package and of every extra (src/lib/price-tiers.ts). Decided from
   * the listing on the server, never typed in. Missing: the first tier.
   */
  priceHuf?: number | null;
  /**
   * @deprecated The single-threshold flag from before tiers (a form open
   * during the deploy may still post it). Ignored when `priceHuf` is set;
   * otherwise `true` means "the tier just above the first bound".
   */
  aboveThreshold?: boolean;
  /**
   * The property's country (ISO). When given, an extra sold only elsewhere
   * (the Hungary-only video) is refused.
   */
  country?: string | null;
  extras: { id: string; quantity: number; /** Translation: the languages. The quantity is then their count. */ locales?: string[] }[];
  /**
   * The translation choice: a package (Go costs nothing), single languages on top, and what the buyer switched
   * off (the price does not change). A `translation` extra that names its languages is read as single languages.
   */
  translation?: {
    packageId: string;
    extraLocales?: string[];
    excludedLocales?: string[];
    /** The language the listing was written in (default hu). */
    sourceLocale?: string;
    /** The package the listing already has: moving up costs the difference, staying costs nothing. */
    currentPackageId?: string | null;
  };
};

/* ── Labels ──────────────────────────────────────────────────────────────── */
// The public price list (src/components/pages/PriceListPage.astro) writes its
// own marketing copy for these. These are the invoice wordings — shorter,
// literal, and safe to sit on a payment record for years.


const EXTRA_LABEL: Record<string, Record<OrderLocale, string>> = {
  translation: { hu: 'Fordítás', nl: 'Vertaling', en: 'Translation', de: 'Übersetzung', fr: 'Traduction', es: 'Traducción', pl: 'Tłumaczenie', ro: 'Traducere', sk: 'Preklad', it: 'Traduzione', pt: 'Tradução', el: 'Μετάφραση', cs: 'Překlad', sl: 'Prevod', sv: 'Översättning', da: 'Oversættelse', no: 'Oversettelse', fi: 'Käännös', et: 'Tõlge', lv: 'Tulkojums', lt: 'Vertimas', sr: 'Prevod', uk: 'Переклад', tr: 'Çeviri', he: 'תרגום', ar: 'ترجمة', ru: 'Перевод', zh: '翻译' },
  'category-highlight': { hu: 'Kiemelés a kategóriában', nl: 'Uitgelicht in de categorie', en: 'Highlighting in the category', de: 'Hervorhebung in der Kategorie', fr: 'Mise en avant dans la catégorie', es: 'Destacado en la categoría', pl: 'Wyróżnienie w kategorii', ro: 'Evidențiere în categorie', sk: 'Zvýraznenie v kategórii', it: 'Messa in evidenza nella categoria', pt: 'Destaque na categoria', el: 'Προβολή στην κατηγορία', cs: 'Zvýraznění v kategorii', sl: 'Izpostavitev v kategoriji', sv: 'Framhävning i kategorin', da: 'Fremhævning i kategorien', no: 'Fremheving i kategorien', fi: 'Korostus kategoriassa', et: 'Esiletõstmine kategoorias', lv: 'Izcelšana kategorijā', lt: 'Išskyrimas kategorijoje', sr: 'Isticanje u kategoriji', uk: 'Виділення в категорії', tr: 'Kategoride öne çıkarma', he: 'הבלטה בקטגוריה', ar: 'إبراز في الفئة', ru: 'Выделение в категории', zh: '分类页突出展示' },
  'homepage-highlight': { hu: 'Kiemelés a főoldalon', nl: 'Uitgelicht op de homepage', en: 'Highlighting on the homepage', de: 'Hervorhebung auf der Startseite', fr: 'Mise en avant sur la page d’accueil', es: 'Destacado en la página de inicio', pl: 'Wyróżnienie na stronie głównej', ro: 'Evidențiere pe prima pagină', sk: 'Zvýraznenie na úvodnej stránke', it: 'Messa in evidenza in homepage', pt: 'Destaque na página inicial', el: 'Προβολή στην αρχική σελίδα', cs: 'Zvýraznění na úvodní stránce', sl: 'Izpostavitev na domači strani', sv: 'Framhävning på startsidan', da: 'Fremhævning på forsiden', no: 'Fremheving på forsiden', fi: 'Korostus etusivulla', et: 'Esiletõstmine avalehel', lv: 'Izcelšana sākumlapā', lt: 'Išskyrimas pagrindiniame puslapyje', sr: 'Isticanje na početnoj stranici', uk: 'Виділення на головній сторінці', tr: 'Ana sayfada öne çıkarma', he: 'הבלטה בדף הבית', ar: 'إبراز في الصفحة الرئيسية', ru: 'Выделение на главной странице', zh: '首页突出展示' },
  // Since November 2026 `video` is FINDDOME filming the property (spec §4b). An old order keeps the label it was written with.
  video: { hu: 'Magyarországon ingatlan videó készítése, drónos felvétel, profi vágással', nl: 'Vastgoedvideo opgenomen in Hongarije, met drone-opnames en professionele montage', en: 'Property video filmed in Hungary, with drone footage and professional editing', de: 'Immobilienvideo, in Ungarn gedreht, mit Drohnenaufnahmen und professionellem Schnitt', fr: 'Vidéo du bien tournée en Hongrie, avec prises de vue par drone et montage professionnel', es: 'Vídeo del inmueble grabado en Hungría, con tomas de dron y edición profesional', pl: 'Film o nieruchomości nagrany na Węgrzech, z ujęciami z drona i profesjonalnym montażem', ro: 'Videoclip al proprietății filmat în Ungaria, cu imagini din dronă și montaj profesionist', sk: 'Video nehnuteľnosti natočené v Maďarsku, so zábermi z dronu a profesionálnym strihom', it: 'Video dell’immobile girato in Ungheria, con riprese da drone e montaggio professionale', pt: 'Vídeo do imóvel filmado na Hungria, com imagens de drone e edição profissional', el: 'Βίντεο ακινήτου στην Ουγγαρία, με λήψεις από drone και επαγγελματικό μοντάζ', cs: 'Video nemovitosti natočené v Maďarsku, se záběry z dronu a profesionálním střihem', sl: 'Video nepremičnine, posnet na Madžarskem, s posnetki iz drona in profesionalno montažo', sv: 'Fastighetsvideo inspelad i Ungern, med drönarbilder och professionell redigering', da: 'Ejendomsvideo optaget i Ungarn, med droneoptagelser og professionel redigering', no: 'Eiendomsvideo filmet i Ungarn, med droneopptak og profesjonell redigering', fi: 'Kiinteistövideo Unkarissa, droonikuvauksella ja ammattimaisella editoinnilla', et: 'Kinnisvaravideo Ungaris, droonivõtete ja professionaalse montaažiga', lv: 'Īpašuma video, filmēts Ungārijā, ar drona kadriem un profesionālu montāžu', lt: 'Turto vaizdo įrašas Vengrijoje, su drono kadrais ir profesionaliu montažu', sr: 'Video nekretnine snimljen u Mađarskoj, sa snimcima dronom i profesionalnom montažom', uk: 'Відео нерухомості, зняте в Угорщині, зі зйомкою з дрона та професійним монтажем', tr: 'Macaristan’da çekilen, drone görüntüleri içeren ve profesyonelce kurgulanan mülk videosu', he: 'סרטון נכס שצולם בהונגריה, כולל צילומי רחפן ועריכה מקצועית', ar: 'فيديو للعقار مصوَّر في المجر، مع لقطات بطائرة مسيّرة ومونتاج احترافي', ru: 'Видео недвижимости, снятое в Венгрии, со съёмкой с дрона и профессиональным монтажом', zh: '在匈牙利拍摄的房产视频，含无人机航拍和专业剪辑' },
  // Retired November 2026 (later photo upload is free now). Bought as „Utólagos képfeltöltés”; the old „Fotóretusálás” wording was wrong.
  'retro-images': { hu: 'Utólagos képfeltöltés', nl: 'Foto’s later toevoegen', en: 'Adding photos later', de: 'Fotos nachträglich hinzufügen', fr: 'Ajout ultérieur de photos', es: 'Añadir fotos más tarde', pl: 'Późniejsze dodanie zdjęć', ro: 'Adăugarea ulterioară de fotografii', sk: 'Dodatočné pridanie fotografií', it: 'Aggiunta successiva di foto', pt: 'Adicionar fotografias mais tarde', el: 'Προσθήκη φωτογραφιών αργότερα', cs: 'Dodatečné přidání fotografií', sl: 'Naknadno dodajanje fotografij', sv: 'Lägga till bilder i efterhand', da: 'Tilføjelse af billeder senere', no: 'Legge til bilder senere', fi: 'Kuvien lisääminen myöhemmin', et: 'Fotode hilisem lisamine', lv: 'Fotoattēlu pievienošana vēlāk', lt: 'Nuotraukų pridėjimas vėliau', sr: 'Naknadno dodavanje fotografija', uk: 'Додавання фото пізніше', tr: 'Sonradan fotoğraf ekleme', he: 'הוספת תמונות בהמשך', ar: 'إضافة صور لاحقًا', ru: 'Добавление фото позже', zh: '后续添加照片' },
  'renewal-6m': { hu: 'Hosszabbítás — 6 hónap', nl: 'Verlenging — 6 maanden', en: 'Renewal, 6 months', de: 'Verlängerung, 6 Monate', fr: 'Prolongation, 6 mois', es: 'Prórroga, 6 meses', pl: 'Przedłużenie, 6 miesięcy', ro: 'Prelungire, 6 luni', sk: 'Predĺženie, 6 mesiacov', it: 'Rinnovo, 6 mesi', pt: 'Renovação, 6 meses', el: 'Ανανέωση, 6 μήνες', cs: 'Obnovení, 6 měsíců', sl: 'Podaljšanje, 6 mesecev', sv: 'Förnyelse, 6 månader', da: 'Fornyelse, 6 måneder', no: 'Fornyelse, 6 måneder', fi: 'Uusiminen, 6 kuukautta', et: 'Uuendamine, 6 kuud', lv: 'Atjaunošana, 6 mēneši', lt: 'Atnaujinimas, 6 mėnesiai', sr: 'Obnova, 6 meseci', uk: 'Поновлення, 6 місяців', tr: 'Yenileme, 6 ay', he: 'חידוש, 6 חודשים', ar: 'تجديد، 6 أشهر', ru: 'Продление, 6 месяцев', zh: '续期，6 个月' },
  ...Object.fromEntries(ONSITE_SERVICES.map((service) => [service.id, service.names])),
};

/** The invoice wording of an extra, e.g. for an information list on a public page. */
export function extraLabel(id: string, locale: OrderLocale): string {
  return EXTRA_LABEL[id]?.[locale] ?? EXTRA_LABEL[id]?.en ?? id;
}

/**
 * The unit a quantity is counted in.
 *
 * Two forms, because the two places this appears need different grammar:
 * `one` for a rate ("€ 25 / taal"), `many` for a count ("Vertaling — 2 talen").
 * Dutch pluralises after a numeral and Hungarian does not — "2 nyelv" is
 * correct and "2 nyelvek" is wrong — so this cannot be one string with an "s"
 * bolted on.
 */
const NO_UNIT: Record<OrderLocale, { one: string; many: string }> = {
  hu: { one: '', many: '' },
  nl: { one: '', many: '' },
  en: { one: '', many: '' },
  de: { one: '', many: '' },
  fr: { one: '', many: '' },
  es: { one: '', many: '' },
  pl: { one: '', many: '' },
  ro: { one: '', many: '' },
  sk: { one: '', many: '' },
  it: { one: '', many: '' },
  pt: { one: '', many: '' },
  el: { one: '', many: '' },
  cs: { one: '', many: '' },
  sl: { one: '', many: '' },
  sv: { one: '', many: '' },
  da: { one: '', many: '' },
  no: { one: '', many: '' },
  fi: { one: '', many: '' },
  et: { one: '', many: '' },
  lv: { one: '', many: '' },
  lt: { one: '', many: '' },
  sr: { one: '', many: '' },
  uk: { one: '', many: '' },
  tr: { one: '', many: '' },
  he: { one: '', many: '' },
  ar: { one: '', many: '' },
  ru: { one: '', many: '' },
  zh: { one: '', many: '' },
};
/** `few` is the Slavic/Romanian 2–4 (or 2–19) form; `Intl.PluralRules` picks it. */
const EXTRA_UNIT: Record<string, Record<OrderLocale, { one: string; two?: string; few?: string; many: string }>> = {
  translation: {
    hu: { one: 'nyelv', many: 'nyelv' },
    nl: { one: 'taal', many: 'talen' },
    en: { one: 'language', many: 'languages' },
    de: { one: 'Sprache', many: 'Sprachen' },
    fr: { one: 'langue', many: 'langues' },
    es: { one: 'idioma', many: 'idiomas' },
    pl: { one: 'język', few: 'języki', many: 'języków' },
    ro: { one: 'limbă', few: 'limbi', many: 'de limbi' },
    sk: { one: 'jazyk', few: 'jazyky', many: 'jazykov' },
    it: { one: 'lingua', many: 'lingue' },
    pt: { one: 'língua', many: 'línguas' },
    el: { one: 'γλώσσα', many: 'γλώσσες' },
    cs: { one: 'jazyk', few: 'jazyky', many: 'jazyků' },
    sl: { one: 'jezik', two: 'jezika', few: 'jeziki', many: 'jezikov' },
    sv: { one: 'språk', many: 'språk' },
    da: { one: 'sprog', many: 'sprog' },
    no: { one: 'språk', many: 'språk' },
    fi: { one: 'kieli', many: 'kieltä' },
    et: { one: 'keel', many: 'keelt' },
    lv: { one: 'valoda', few: 'valodas', many: 'valodu' },
    lt: { one: 'kalba', few: 'kalbos', many: 'kalbų' },
    sr: { one: 'jezik', few: 'jezika', many: 'jezika' },
    uk: { one: 'мова', few: 'мови', many: 'мов' },
    tr: { one: 'dil', many: 'dil' },
    he: { one: 'שפה', two: 'שפות', many: 'שפות' },
    ar: { one: 'لغة', two: 'لغات', few: 'لغات', many: 'لغة' },
    ru: { one: 'язык', few: 'языка', many: 'языков' },
    zh: { one: '种语言', many: '种语言' },
  },
  'category-highlight': {
    hu: { one: 'hónap', many: 'hónap' },
    nl: { one: 'maand', many: 'maanden' },
    en: { one: 'month', many: 'months' },
    de: { one: 'Monat', many: 'Monate' },
    fr: { one: 'mois', many: 'mois' },
    es: { one: 'mes', many: 'meses' },
    pl: { one: 'miesiąc', few: 'miesiące', many: 'miesięcy' },
    ro: { one: 'lună', few: 'luni', many: 'de luni' },
    sk: { one: 'mesiac', few: 'mesiace', many: 'mesiacov' },
    it: { one: 'mese', many: 'mesi' },
    pt: { one: 'mês', many: 'meses' },
    el: { one: 'μήνας', many: 'μήνες' },
    cs: { one: 'měsíc', few: 'měsíce', many: 'měsíců' },
    sl: { one: 'mesec', two: 'meseca', few: 'meseci', many: 'mesecev' },
    sv: { one: 'månad', many: 'månader' },
    da: { one: 'måned', many: 'måneder' },
    no: { one: 'måned', many: 'måneder' },
    fi: { one: 'kuukausi', many: 'kuukautta' },
    et: { one: 'kuu', many: 'kuud' },
    lv: { one: 'mēnesis', few: 'mēneši', many: 'mēnešu' },
    lt: { one: 'mėnuo', few: 'mėnesiai', many: 'mėnesių' },
    sr: { one: 'mesec', few: 'meseca', many: 'meseci' },
    uk: { one: 'місяць', few: 'місяці', many: 'місяців' },
    tr: { one: 'ay', many: 'ay' },
    he: { one: 'חודש', two: 'חודשים', many: 'חודשים' },
    ar: { one: 'شهر', two: 'أشهر', few: 'أشهر', many: 'شهرًا' },
    ru: { one: 'месяц', few: 'месяца', many: 'месяцев' },
    zh: { one: '个月', many: '个月' },
  },
  'homepage-highlight': {
    hu: { one: 'hónap', many: 'hónap' },
    nl: { one: 'maand', many: 'maanden' },
    en: { one: 'month', many: 'months' },
    de: { one: 'Monat', many: 'Monate' },
    fr: { one: 'mois', many: 'mois' },
    es: { one: 'mes', many: 'meses' },
    pl: { one: 'miesiąc', few: 'miesiące', many: 'miesięcy' },
    ro: { one: 'lună', few: 'luni', many: 'de luni' },
    sk: { one: 'mesiac', few: 'mesiace', many: 'mesiacov' },
    it: { one: 'mese', many: 'mesi' },
    pt: { one: 'mês', many: 'meses' },
    el: { one: 'μήνας', many: 'μήνες' },
    cs: { one: 'měsíc', few: 'měsíce', many: 'měsíců' },
    sl: { one: 'mesec', two: 'meseca', few: 'meseci', many: 'mesecev' },
    sv: { one: 'månad', many: 'månader' },
    da: { one: 'måned', many: 'måneder' },
    no: { one: 'måned', many: 'måneder' },
    fi: { one: 'kuukausi', many: 'kuukautta' },
    et: { one: 'kuu', many: 'kuud' },
    lv: { one: 'mēnesis', few: 'mēneši', many: 'mēnešu' },
    lt: { one: 'mėnuo', few: 'mėnesiai', many: 'mėnesių' },
    sr: { one: 'mesec', few: 'meseca', many: 'meseci' },
    uk: { one: 'місяць', few: 'місяці', many: 'місяців' },
    tr: { one: 'ay', many: 'ay' },
    he: { one: 'חודש', two: 'חודשים', many: 'חודשים' },
    ar: { one: 'شهر', two: 'أشهر', few: 'أشهر', many: 'شهرًا' },
    ru: { one: 'месяц', few: 'месяца', many: 'месяцев' },
    zh: { one: '个月', many: '个月' },
  },
  video: NO_UNIT,
  'retro-images': NO_UNIT,
  'renewal-6m': NO_UNIT,
  'onsite-media': NO_UNIT,
  'onsite-visit': NO_UNIT,
};

/* ── Formatting ──────────────────────────────────────────────────────────── */

const NBSP = ' ';

/**
 * "€ 1.234" from cents, for the Hungarian and Dutch screens that have always
 * used it. Pass the recipient's language to get that language's own style
 * ("€1,234" in English, "1.234 €" in German, "1 234 €" in French).
 */
export function formatCents(cents: number, locale?: Locale): string {
  if (locale && locale !== 'hu' && locale !== 'nl') return eurCents(cents, locale);
  return `€${NBSP}${(cents / 100).toLocaleString('de-DE', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ── Building an order ───────────────────────────────────────────────────── */

/**
 * What an admin can put on an order, with today's prices. Drives the review
 * screen's checkboxes; `minMonths` is surfaced so the form can enforce
 * FODEL's own three-month minimum on highlighting rather than reinventing it.
 *
 * Retired extras are left out, and so is an extra not sold in the property's
 * `country` (when one is given). `priceEur` is the "from" price; `tiers`
 * carries the whole list so the screen can price the listing itself.
 */
export function catalogue(locale: OrderLocale, cat: ListingCatalog = listingCatalog(), opts: { country?: string | null; includeRetired?: boolean } = {}) {
  return {
    packages: cat.packages.map((pkg) => ({
      id: pkg.id,
      label: pkg.names[locale],
      priceEur: pkg.priceEur,
      tiers: pkg.tiers,
      months: pkg.months,
      video: pkg.video,
    })),
    extras: orderExtras(cat)
      .filter((extra) => (opts.includeRetired || !extra.retired) && (opts.country === undefined || !extra.countries || extraSoldIn(extra, opts.country)))
      .map((extra) => ({
        id: extra.id,
        label: EXTRA_LABEL[extra.id]?.[locale] ?? extra.id,
        unit: EXTRA_UNIT[extra.id]?.[locale]?.one ?? '',
        priceEur: extra.priceEur,
        tiers: extra.tiers,
        minMonths: 'minMonths' in extra ? extra.minMonths : undefined,
        exclusive: EXCLUSIVE.has(extra.id),
        retired: Boolean(extra.retired),
      })),
  };
}

/* ── Tier wording on an order line: src/lib/tier-phrase.ts (shared with the package cards) ── */
export { tierPhrase };

/** The forint price an order is tiered by; see `OrderSelection.priceHuf`. */
function selectionPriceHuf(selection: OrderSelection, tiers: readonly PriceTier[]): number {
  if (typeof selection.priceHuf === 'number' && Number.isFinite(selection.priceHuf)) return selection.priceHuf;
  // Legacy flag only: one forint above the first bound.
  if (selection.aboveThreshold && tiers.length > 1 && tiers[0].upToHuf !== null) return tiers[0].upToHuf + 1;
  return 0;
}

/** The tier a line is charged at, plus its audit record and label suffix when the item is tiered. */
function priced(tiers: readonly PriceTier[], priceHuf: number, locale: OrderLocale) {
  const { tier, index } = tierFor(tiers, priceHuf);
  if (tiers.length < 2) return { priceEur: tier.priceEur };
  return { priceEur: tier.priceEur, tier: { index, ...tierRange(tiers, index) }, suffix: ` (${tierPhrase(tiers, index, locale)})` };
}

/** `retired-extra`: no longer sold (§4); `not-sold-here`: an extra sold only in other countries (§4b). */
export type OrderErrorCode = 'unknown-package' | 'unknown-extra' | 'retired-extra' | 'not-sold-here' | 'bad-quantity' | 'exclusive' | 'bad-locale' | 'exclude-en';

export class OrderError extends Error {
  code: OrderErrorCode;
  constructor(code: OrderErrorCode) {
    super(code);
    this.code = code;
  }
}

/**
 * Turns a selection of ids into stored order lines.
 *
 * Throws rather than silently skipping an unknown id: an order that quietly
 * drops a line the admin ticked is worse than one that refuses to save.
 */
export function buildOrderLines(selection: OrderSelection, locale: OrderLocale, cat: ListingCatalog = listingCatalog()): OrderLine[] {
  const pkg = cat.packages.find((p) => p.id === selection.packageId);
  if (!pkg) throw new OrderError('unknown-package');

  // One forint price tiers the package and every extra alike.
  const priceHuf = selectionPriceHuf(selection, pkg.tiers);
  const packagePrice = priced(pkg.tiers, priceHuf, locale);

  const lines: OrderLine[] = [
    {
      kind: 'package',
      id: pkg.id,
      quantity: 1,
      unitCents: packagePrice.priceEur * 100,
      label: `${pkg.names[locale]}${packagePrice.suffix ?? ''}`,
      ...(packagePrice.tier ? { tier: packagePrice.tier } : {}),
    },
  ];

  if (selection.extras.filter((chosen) => EXCLUSIVE.has(chosen.id)).length > 1) {
    throw new OrderError('exclusive');
  }

  // Single languages named on a `translation` extra are priced like the ones in the picker: one language at a
  // time, European or World-only, and a language the chosen package already includes costs nothing.
  const legacySingles: string[] = [];

  for (const chosen of selection.extras) {
    const extra = orderExtras(cat).find((e) => e.id === chosen.id);
    if (!extra) throw new OrderError('unknown-extra');
    // A retired extra is never sold again (old orders keep their lines; this only guards new ones).
    if (extra.retired) throw new OrderError('retired-extra');
    if (extra.countries && selection.country !== undefined && !extra.countries.includes(String(selection.country ?? '').toUpperCase())) throw new OrderError('not-sold-here');

    // A translation line that names its languages remembers them: that list, read back from the stored order,
    // is what the AI translates after payment (never anything in a later request).
    if (extra.id === 'translation' && chosen.locales !== undefined) {
      const named = [...new Set(chosen.locales)];
      const source = selection.translation?.sourceLocale ?? 'hu';
      if (named.length === 0 || named.some((code) => code === source || !ALL_LOCALES.includes(code))) throw new OrderError('bad-locale');
      legacySingles.push(...named);
      continue;
    }
    const quantity = Math.floor(chosen.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 60) {
      throw new OrderError('bad-quantity');
    }

    const units = EXTRA_UNIT[extra.id]?.[locale];
    const base = EXTRA_LABEL[extra.id]?.[locale] ?? extra.id;
    const form = pluralForm(intlTag(locale), quantity);
    const unit =
      form === 'one' ? units?.one : form === 'two' ? (units?.two ?? units?.few ?? units?.many) : form === 'few' ? (units?.few ?? units?.many) : units?.many;

    const price = priced(extra.tiers, priceHuf, locale);
    lines.push({
      kind: 'extra',
      id: extra.id,
      quantity,
      unitCents: Math.round(price.priceEur * 100),
      label: `${quantity > 1 && unit ? `${base}${locale === 'hu' || locale === 'nl' ? ' — ' : ': '}${quantity} ${unit}` : base}${price.suffix ?? ''}`,
      ...(price.tier ? { tier: price.tier } : {}),
    });
  }

  if (selection.translation || legacySingles.length > 0) lines.push(...translationOrderLines(selection, legacySingles, locale, cat));

  return lines;
}

/**
 * The translation lines of a selection: the package, then single languages, all priced from the catalogue.
 * Throws rather than quietly changing the choice: English can never be switched off, and a package that is not
 * on sale cannot be bought.
 */
function translationOrderLines(selection: OrderSelection, legacySingles: string[], locale: OrderLocale, cat: ListingCatalog): TranslationLine[] {
  const choice = selection.translation ?? { packageId: 'go' };
  const sourceLocale = choice.sourceLocale ?? 'hu';
  const cfg = cat.translation;
  const pkg = cfg.packages.find((p) => p.id === choice.packageId);
  if (!pkg || (pkg.id !== 'go' && !pkg.active && pkg.id !== choice.currentPackageId)) throw new OrderError('unknown-package');
  const singles = [...new Set([...(choice.extraLocales ?? []), ...legacySingles])];
  if (singles.some((code) => code === sourceLocale || !ALL_LOCALES.includes(code))) throw new OrderError('bad-locale');
  const cleaned = cleanExclusions(choice.excludedLocales ?? [], { translationPackage: pkg.id, extraLocales: singles, sourceLocale }, cfg, ALL_LOCALES);
  if (cleaned.problem === 'exclude-en') throw new OrderError('exclude-en');
  if (cleaned.problem) throw new OrderError('bad-locale');
  const lines = translationLines(
    { packageId: pkg.id, extraLocales: singles, excludedLocales: cleaned.excluded, sourceLocale }, cfg, locale, ALL_LOCALES,
    choice.currentPackageId === undefined ? {} : { currentPackageId: choice.currentPackageId }
  );
  return lines;
}

export function orderTotalCents(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0);
}

/**
 * The referral programme's discount — 10% of the package line only, never
 * the extras. Deliberately NOT an `OrderLine`: Stripe rejects a negative
 * `unit_amount` with a 400 at the moment a seller clicks pay, so this is its
 * own `payments.discount_cents` column, applied at Checkout as a one-off
 * coupon (see src/pages/api/stripe/checkout.ts) and rendered as its own line
 * in the email and any future invoice.
 */
export const REFERRAL_DISCOUNT_PERCENT = 10;

export function referralDiscountCents(lines: OrderLine[]): number {
  const pkg = lines.find((line) => line.kind === 'package');
  if (!pkg) return 0;
  return Math.round((pkg.unitCents * pkg.quantity * REFERRAL_DISCOUNT_PERCENT) / 100);
}

/** Order lines shaped for the email templates' itemised table. */
export function linesForEmail(lines: OrderLine[], locale?: Locale): { label: string; amount: string }[] {
  return lines.map((line) => ({
    label: line.label,
    amount: formatCents(line.unitCents * line.quantity, locale),
  }));
}

/**
 * @deprecated Two-tier wording from before price tiers; use `tierFor(pkg.tiers, priceHuf)`.
 * Whether a listing's forint price is above its package's first tier.
 */
export function isAboveThreshold(priceHuf: number, cat: ListingCatalog = listingCatalog(), packageId?: string): boolean {
  const tiered = packageId ? packageOf(cat, packageId) : cat.packages.find((p) => p.tiers.length > 1);
  return tiered ? tierFor(tiered.tiers, priceHuf).index > 0 : false;
}

/**
 * A default order for a listing that has just been approved.
 *
 * Pre-ticks what the listing itself already tells us — the package the owner
 * chose, the languages they asked to have translated, the video shoot if they
 * asked for one (Hungary only), category highlighting if it is on. The
 * homepage highlight is no longer sold (§4a): a stale request for it is
 * ignored, and the editorial homepage pick costs nothing.
 * The admin adjusts and confirms; this only saves them the typing, it never
 * charges anything on its own.
 */
export type SuggestInput = {
  package: string;
  price_huf: number;
  video_url: string | null;
  homepage_featured: boolean;
  featured: boolean;
  /** Locales the listing actually has text for. Hungarian is not an extra. */
  locales: string[];
  /** What the owner asked for when placing the ad (brief 3 item 14). */
  requested?: RequestedExtras;
  /** ISO country; the video shoot is suggested only where it is sold. */
  country?: string | null;
};

export function suggestSelection(property: SuggestInput, cat: ListingCatalog = listingCatalog()): OrderSelection {
  const requested = property.requested ?? {};
  // The package and single languages the owner asked for. A language the listing already has text in (written by
  // the owner, or translated before) is not sold again; the AI translates only what is missing.
  const packageId = cat.translation.packages.some((p) => p.id === requested.translationPackage && p.active) ? String(requested.translationPackage) : 'go';
  const have = new Set([...property.locales, 'hu']);
  const languages = [...new Set(requested.translations ?? [])].filter((locale) => !have.has(locale));
  const extras: { id: string; quantity: number; locales?: string[] }[] = [];

  // The owner's own video link is free; the paid line is FINDDOME filming it, where that is sold.
  const shoot = cat.extras.find((extra) => extra.id === 'video');
  if (requested.video && shoot && extraSoldIn(shoot, property.country)) extras.push({ id: 'video', quantity: 1 });
  // FODEL's own minimum for highlighting is three months.
  const highlight = cat.extras.find((extra) => extra.id === 'category-highlight');
  if ((property.featured || requested.categoryHighlight) && highlight && !highlight.retired) extras.push({ id: 'category-highlight', quantity: highlight.minMonths ?? 3 });
  if (requested.service) extras.push({ id: requested.service, quantity: 1 });

  return {
    packageId: property.package,
    priceHuf: property.price_huf,
    ...(property.country !== undefined ? { country: property.country } : {}),
    extras,
    translation: {
      packageId,
      extraLocales: languages,
      excludedLocales: [...(requested.excludedLocales ?? [])],
    },
  };
}
