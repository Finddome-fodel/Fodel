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
      ? x('vármegye', 'provincie', 'county', 'Komitat', 'comitat', 'condado', 'komitat', 'județ', 'župa', 'contea', 'condado', 'νομός', 'župa', 'županija', 'län', 'amt', 'fylke', 'lääni', 'maakond', 'mede', 'apskritis')
      : x('település', 'plaats', 'settlement', 'Ort', 'localité', 'localidad', 'miejscowość', 'localitate', 'obec', 'comune', 'localidade', 'οικισμός', 'obec', 'kraj', 'ort', 'by', 'sted', 'paikkakunta', 'asula', 'apdzīvotā vieta', 'gyvenvietė');
    const records = x(`${n} adat`, `${n} gegevens`, `${n} records`, `${n} Datensätze`, `${n} données`, `${nOf('es', n, 'dato', 'datos')}`, `${nOf('pl', n, 'rekord', 'rekordy', 'rekordów')}`, `${nOf('ro', n, 'înregistrare', 'înregistrări', 'de înregistrări')}`, `${nOf('sk', n, 'záznam', 'záznamy', 'záznamov')}`, `${n} ${n === 1 ? 'dato' : 'dati'}`, `${n} ${n === 1 ? 'registo' : 'registos'}`, `${n} ${n === 1 ? 'εγγραφή' : 'εγγραφές'}`, `${nOf('cs', n, 'záznam', 'záznamy', 'záznamů')}`, `${nOf('sl', n, 'zapis', 'zapisi', 'zapisov', 'zapisa')}`, `${n} ${n === 1 ? 'post' : 'poster'}`, `${n} ${n === 1 ? 'datapunkt' : 'datapunkter'}`, `${n} ${n === 1 ? 'datapunkt' : 'datapunkter'}`, `${n} ${n === 1 ? 'tietue' : 'tietuetta'}`, `${n} ${n === 1 ? 'kirje' : 'kirjet'}`, `${nOf('lv', n, 'ieraksts', 'ieraksti', 'ierakstu')}`, `${nOf('lt', n, 'įrašas', 'įrašai', 'įrašų')}`);
    return `KSH Ingatlanadattár, ${baseline.year} (${level}, ${records})`;
  }
  if (baseline.kind === 'comps') {
    return x(
      `${n} hasonló FINDDOME-hirdetés`,
      `${n} vergelijkbare FINDDOME-advertenties`,
      `${n} comparable FINDDOME listings`,
      `${n} vergleichbare FINDDOME-Inserate`,
      `${n} annonces FINDDOME comparables`,
      `${nOf('es', n, 'anuncio FINDDOME comparable', 'anuncios FINDDOME comparables')}`,
      `${nOf('pl', n, 'porównywalne ogłoszenie FINDDOME', 'porównywalne ogłoszenia FINDDOME', 'porównywalnych ogłoszeń FINDDOME')}`,
      `${nOf('ro', n, 'anunț FINDDOME comparabil', 'anunțuri FINDDOME comparabile', 'de anunțuri FINDDOME comparabile')}`,
      `${nOf('sk', n, 'porovnateľný inzerát FINDDOME', 'porovnateľné inzeráty FINDDOME', 'porovnateľných inzerátov FINDDOME')}`,
      `${n} ${n === 1 ? 'annuncio FINDDOME comparabile' : 'annunci FINDDOME comparabili'}`,
      `${n} ${n === 1 ? 'anúncio FINDDOME comparável' : 'anúncios FINDDOME comparáveis'}`,
      `${n} ${n === 1 ? 'συγκρίσιμη αγγελία FINDDOME' : 'συγκρίσιμες αγγελίες FINDDOME'}`,
      `${nOf('cs', n, 'srovnatelný inzerát FINDDOME', 'srovnatelné inzeráty FINDDOME', 'srovnatelných inzerátů FINDDOME')}`,
      `${nOf('sl', n, 'primerljiv oglas FINDDOME', 'primerljivi oglasi FINDDOME', 'primerljivih oglasov FINDDOME', 'primerljiva oglasa FINDDOME')}`,
      `${n} ${n === 1 ? 'jämförbar FINDDOME-annons' : 'jämförbara FINDDOME-annonser'}`,
      `${n} ${n === 1 ? 'sammenlignelig FINDDOME-annonce' : 'sammenlignelige FINDDOME-annoncer'}`,
      `${n} ${n === 1 ? 'sammenlignbar FINDDOME-annonse' : 'sammenlignbare FINDDOME-annonser'}`,
      `${n} ${n === 1 ? 'vertailukelpoinen FINDDOME-ilmoitus' : 'vertailukelpoista FINDDOME-ilmoitusta'}`,
      `${n} ${n === 1 ? 'võrreldav FINDDOME’i kuulutus' : 'võrreldavat FINDDOME’i kuulutust'}`,
      `${nOf('lv', n, 'salīdzināms FINDDOME sludinājums', 'salīdzināmi FINDDOME sludinājumi', 'salīdzināmu FINDDOME sludinājumu')}`,
      `${nOf('lt', n, 'palyginamas FINDDOME skelbimas', 'palyginami FINDDOME skelbimai', 'palyginamų FINDDOME skelbimų')}`
    );
  }
  return undefined;
}

/** "2024, retrieved 12 March 2026" */
export function valuationSourceDate(locale: Locale, baseline: ValuationBaseline): string {
  const word = localizer(locale)('letöltve', 'opgehaald', 'retrieved', 'abgerufen', 'consulté le', 'consultado el', 'stan na', 'consultat la', 'stav k', 'consultato', 'consultado', 'ανάκτηση', 'staženo', 'pridobljeno', 'hämtad', 'hentet', 'hentet', 'haettu', 'allalaaditud', 'iegūts', 'gauta');
  return `${baseline.year}, ${word} ${baseline.retrievedAt ?? '—'}`;
}

/** The card-payment button that follows a valuation request. */
export function payNowLabel(locale: Locale, pkg: ValuationPackage): string {
  const price = priceLabel(pkg, locale);
  return localizer(locale)(
    `Fizetés most — ${price} (bankkártya)`,
    `Nu betalen — ${price} (kaart)`,
    `Pay now — ${price} (card)`,
    `Jetzt bezahlen — ${price} (Karte)`,
    `Payer maintenant — ${price} (carte)`,
    `Pagar ahora — ${price} (tarjeta)`,
    `Zapłać teraz — ${price} (karta)`,
    `Plătiți acum — ${price} (card)`,
    `Zaplatiť teraz — ${price} (karta)`,
    `Paghi ora — ${price} (carta)`,
    `Pagar agora — ${price} (cartão)`,
    `Πληρωμή τώρα — ${price} (κάρτα)`,
    `Zaplatit nyní — ${price} (kartou)`,
    `Plačajte zdaj — ${price} (s kartico)`,
    `Betala nu — ${price} (kort)`,
    `Betal nu — ${price} (kort)`,
    `Betal nå — ${price} (kort)`,
    `Maksa nyt — ${price} (kortti)`,
    `Maksa kohe — ${price} (kaart)`,
    `Maksāt tagad — ${price} (karte)`,
    `Mokėti dabar — ${price} (kortele)`
  );
}

/** The package price in every language, for the office's service request. */
export function priceLabels(pkg: ValuationPackage): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, priceLabel(pkg, locale)])) as Record<Locale, string>;
}
