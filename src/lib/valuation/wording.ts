/**
 * The few sentences around a valuation result that are built in code rather
 * than taken from a template: the source line, the money in the reader's
 * currency and the pay-now button. Shared by the public form, the follow-up
 * request and the admin's approval, so all three say the same thing.
 */
import { localizer, LOCALES, type Locale } from '~/i18n/ui';
import { intlTag } from '~/lib/format';
import { priceLabel, type ValuationPackage } from '~/lib/valuation/packages';
import { nOf } from '~/i18n/plural';

export interface ValuationBaseline {
  kind?: string;
  count?: number;
  year?: number | null;
  level?: string;
  url?: string;
  retrievedAt?: string;
}

/** Forint for Hungarian readers; euro, converted at the published rate, for everyone else. */
export function valuationAmount(locale: Locale, huf: number, rate: number | null | undefined): string {
  if (locale !== 'hu' && rate) {
    return new Intl.NumberFormat(intlTag(locale), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(huf / rate);
  }
  return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(huf);
}

/** Whether the euro figure and its exchange-rate date are shown. */
export const showsEuro = (locale: Locale) => locale !== 'hu';

/** "Where does this range come from", in one line. */
export function valuationBasis(locale: Locale, baseline: ValuationBaseline | null | undefined): string | undefined {
  if (!baseline) return undefined;
  const x = localizer(locale);
  const n = baseline.count ?? 0;
  if (baseline.kind === 'ksh') {
    const county = baseline.level === 'county';
    const level = county
      ? x({ hu: 'vármegye', nl: 'provincie', en: 'county', de: 'Komitat', fr: 'comitat', es: 'condado', pl: 'komitat', ro: 'județ', sk: 'župa', it: 'contea', pt: 'condado', el: 'νομός', cs: 'župa', sl: 'županija', sv: 'län', da: 'amt', no: 'fylke', fi: 'lääni', et: 'maakond', lv: 'mede', lt: 'apskritis', sr: 'županija', uk: 'медьє', tr: 'il', he: 'מחוז', ar: 'county', ru: 'медье', zh: 'county' })
      : x({ hu: 'település', nl: 'plaats', en: 'settlement', de: 'Ort', fr: 'localité', es: 'localidad', pl: 'miejscowość', ro: 'localitate', sk: 'obec', it: 'comune', pt: 'localidade', el: 'οικισμός', cs: 'obec', sl: 'kraj', sv: 'ort', da: 'by', no: 'sted', fi: 'paikkakunta', et: 'asula', lv: 'apdzīvotā vieta', lt: 'gyvenvietė', sr: 'naselje', uk: 'населений пункт', tr: 'yerleşim yeri', he: 'יישוב', ar: 'settlement', ru: 'населённый пункт', zh: 'settlement' });
    const records = x({ hu: `${n} adat`, nl: `${n} gegevens`, en: `${n} records`, de: `${n} Datensätze`, fr: `${n} données`, es: `${nOf('es', n, 'dato', 'datos')}`, pl: `${nOf('pl', n, 'rekord', 'rekordy', 'rekordów')}`, ro: `${nOf('ro', n, 'înregistrare', 'înregistrări', 'de înregistrări')}`, sk: `${nOf('sk', n, 'záznam', 'záznamy', 'záznamov')}`, it: `${n} ${n === 1 ? 'dato' : 'dati'}`, pt: `${n} ${n === 1 ? 'registo' : 'registos'}`, el: `${n} ${n === 1 ? 'εγγραφή' : 'εγγραφές'}`, cs: `${nOf('cs', n, 'záznam', 'záznamy', 'záznamů')}`, sl: `${nOf('sl', n, 'zapis', 'zapisi', 'zapisov', 'zapisa')}`, sv: `${n} ${n === 1 ? 'post' : 'poster'}`, da: `${n} ${n === 1 ? 'datapunkt' : 'datapunkter'}`, no: `${n} ${n === 1 ? 'datapunkt' : 'datapunkter'}`, fi: `${n} ${n === 1 ? 'tietue' : 'tietuetta'}`, et: `${n} ${n === 1 ? 'kirje' : 'kirjet'}`, lv: `${nOf('lv', n, 'ieraksts', 'ieraksti', 'ierakstu')}`, lt: `${nOf('lt', n, 'įrašas', 'įrašai', 'įrašų')}`, sr: `${nOf('sr', n, 'podatak', 'podatka', 'podataka')}`, uk: `${nOf('uk', n, 'запис', 'записи', 'записів')}`, tr: `${n} kayıt`, he: `${nOf('he', n, 'רשומה', 'רשומות', 'רשומות', 'רשומות')}`, ar: `${n} records`, ru: `${nOf('ru', n, 'запись', 'записи', 'записей')}`, zh: `${n} records` });
    return `KSH Ingatlanadattár, ${baseline.year} (${level}, ${records})`;
  }
  if (baseline.kind === 'comps') {
    return x({
      hu: `${n} hasonló FINDDOME-hirdetés`,
      nl: `${n} vergelijkbare FINDDOME-advertenties`,
      en: `${n} comparable FINDDOME listings`,
      de: `${n} vergleichbare FINDDOME-Inserate`,
      fr: `${n} annonces FINDDOME comparables`,
      es: `${nOf('es', n, 'anuncio FINDDOME comparable', 'anuncios FINDDOME comparables')}`,
      pl: `${nOf('pl', n, 'porównywalne ogłoszenie FINDDOME', 'porównywalne ogłoszenia FINDDOME', 'porównywalnych ogłoszeń FINDDOME')}`,
      ro: `${nOf('ro', n, 'anunț FINDDOME comparabil', 'anunțuri FINDDOME comparabile', 'de anunțuri FINDDOME comparabile')}`,
      sk: `${nOf('sk', n, 'porovnateľný inzerát FINDDOME', 'porovnateľné inzeráty FINDDOME', 'porovnateľných inzerátov FINDDOME')}`,
      it: `${n} ${n === 1 ? 'annuncio FINDDOME comparabile' : 'annunci FINDDOME comparabili'}`,
      pt: `${n} ${n === 1 ? 'anúncio FINDDOME comparável' : 'anúncios FINDDOME comparáveis'}`,
      el: `${n} ${n === 1 ? 'συγκρίσιμη αγγελία FINDDOME' : 'συγκρίσιμες αγγελίες FINDDOME'}`,
      cs: `${nOf('cs', n, 'srovnatelný inzerát FINDDOME', 'srovnatelné inzeráty FINDDOME', 'srovnatelných inzerátů FINDDOME')}`,
      sl: `${nOf('sl', n, 'primerljiv oglas FINDDOME', 'primerljivi oglasi FINDDOME', 'primerljivih oglasov FINDDOME', 'primerljiva oglasa FINDDOME')}`,
      sv: `${n} ${n === 1 ? 'jämförbar FINDDOME-annons' : 'jämförbara FINDDOME-annonser'}`,
      da: `${n} ${n === 1 ? 'sammenlignelig FINDDOME-annonce' : 'sammenlignelige FINDDOME-annoncer'}`,
      no: `${n} ${n === 1 ? 'sammenlignbar FINDDOME-annonse' : 'sammenlignbare FINDDOME-annonser'}`,
      fi: `${n} ${n === 1 ? 'vertailukelpoinen FINDDOME-ilmoitus' : 'vertailukelpoista FINDDOME-ilmoitusta'}`,
      et: `${n} ${n === 1 ? 'võrreldav FINDDOME’i kuulutus' : 'võrreldavat FINDDOME’i kuulutust'}`,
      lv: `${nOf('lv', n, 'salīdzināms FINDDOME sludinājums', 'salīdzināmi FINDDOME sludinājumi', 'salīdzināmu FINDDOME sludinājumu')}`,
      lt: `${nOf('lt', n, 'palyginamas FINDDOME skelbimas', 'palyginami FINDDOME skelbimai', 'palyginamų FINDDOME skelbimų')}`,
      sr: `${nOf('sr', n, 'sličan FINDDOME oglas', 'slična FINDDOME oglasa', 'sličnih FINDDOME oglasa')}`,
      uk: `${nOf('uk', n, 'схоже оголошення FINDDOME', 'схожі оголошення FINDDOME', 'схожих оголошень FINDDOME')}`,
      tr: `${n} benzer FINDDOME ilanı`,
      he: `מודעות FINDDOME דומות: ${n}`,
      ar: `${n} comparable FINDDOME listings`,
      ru: `${nOf('ru', n, 'похожее объявление FINDDOME', 'похожих объявления FINDDOME', 'похожих объявлений FINDDOME')}`,
      zh: `${n} comparable FINDDOME listings`,
    });
  }
  return undefined;
}

/** "2024, retrieved 12 March 2026" */
export function valuationSourceDate(locale: Locale, baseline: ValuationBaseline): string {
  const word = localizer(locale)({ hu: 'letöltve', nl: 'opgehaald', en: 'retrieved', de: 'abgerufen', fr: 'consulté le', es: 'consultado el', pl: 'stan na', ro: 'consultat la', sk: 'stav k', it: 'consultato', pt: 'consultado', el: 'ανάκτηση', cs: 'staženo', sl: 'pridobljeno', sv: 'hämtad', da: 'hentet', no: 'hentet', fi: 'haettu', et: 'allalaaditud', lv: 'iegūts', lt: 'gauta', sr: 'preuzeto', uk: 'дані отримано', tr: 'erişim tarihi', he: 'נשלף בתאריך', ar: 'retrieved', ru: 'данные получены', zh: 'retrieved' });
  return `${baseline.year}, ${word} ${baseline.retrievedAt ?? '—'}`;
}

/** The card-payment button that follows a valuation request. */
export function payNowLabel(locale: Locale, pkg: ValuationPackage): string {
  const price = priceLabel(pkg, locale);
  return localizer(locale)({
    hu: `Fizetés most — ${price} (bankkártya)`,
    nl: `Nu betalen — ${price} (kaart)`,
    en: `Pay now — ${price} (card)`,
    de: `Jetzt bezahlen — ${price} (Karte)`,
    fr: `Payer maintenant — ${price} (carte)`,
    es: `Pagar ahora — ${price} (tarjeta)`,
    pl: `Zapłać teraz — ${price} (karta)`,
    ro: `Plătiți acum — ${price} (card)`,
    sk: `Zaplatiť teraz — ${price} (karta)`,
    it: `Paghi ora — ${price} (carta)`,
    pt: `Pagar agora — ${price} (cartão)`,
    el: `Πληρωμή τώρα — ${price} (κάρτα)`,
    cs: `Zaplatit nyní — ${price} (kartou)`,
    sl: `Plačajte zdaj — ${price} (s kartico)`,
    sv: `Betala nu — ${price} (kort)`,
    da: `Betal nu — ${price} (kort)`,
    no: `Betal nå — ${price} (kort)`,
    fi: `Maksa nyt — ${price} (kortti)`,
    et: `Maksa kohe — ${price} (kaart)`,
    lv: `Maksāt tagad — ${price} (karte)`,
    lt: `Mokėti dabar — ${price} (kortele)`,
    sr: `Platite sada — ${price} (kartica)`,
    uk: `Оплатити зараз — ${price} (картка)`,
    tr: `Şimdi öde — ${price} (kart)`,
    he: `תשלום עכשיו — ${price} (כרטיס אשראי)`,
    ar: `Pay now — ${price} (card)`,
    ru: `Оплатить сейчас — ${price} (карта)`,
    zh: `Pay now — ${price} (card)`,
  });
}

/** The package price in every language, for the office's service request. */
export function priceLabels(pkg: ValuationPackage): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, priceLabel(pkg, locale)])) as Record<Locale, string>;
}
