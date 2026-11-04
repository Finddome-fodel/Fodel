/**
 * The daily EUR/HUF rate, as far as the browser and the tests need it: pure, no network, no database.
 *
 * The euro is the official currency of every fee. A forint amount next to it is an INFORMATIVE hint only
 * („kb. 3 400 Ft”), worked out from the ECB's rate of the day and rounded to the nearest 100 Ft. It is never a
 * payable amount and nothing here is ever used to compute what is charged: prices come from `priceFor()` in integer
 * cents, and test-fx.mjs proves with a grep that no charge code reads a rate.
 */
import { huf, separators } from './format.ts';
import type { Locale } from '../i18n/ui.ts';

export type FxRate = {
  /** Forints for one euro. */
  rate: number;
  /** The ECB reference date, YYYY-MM-DD. */
  date: string;
  source: string;
  fetchedAt: string;
};

/** Older than this and the admin sees an amber „Elavult árfolyam” notice. The old rate is still used meanwhile. */
export const FX_STALE_DAYS = 4;

const DAY = 86_400_000;

export const fxAgeDays = (fx: Pick<FxRate, 'date'>, now: Date = new Date()): number => Math.floor((now.getTime() - Date.parse(fx.date)) / DAY);
export const fxStale = (fx: Pick<FxRate, 'date'>, now: Date = new Date()): boolean => fxAgeDays(fx, now) > FX_STALE_DAYS;

/** The forint hint for a euro amount in cents: nearest 100 Ft, never below 100 for a real amount. */
export function hufHintAmount(cents: number, rate: number): number {
  if (!Number.isFinite(cents) || !Number.isFinite(rate) || cents <= 0 || rate <= 0) return 0;
  const exact = (cents / 100) * rate;
  return Math.max(100, Math.round(exact / 100) * 100);
}

/** „kb.” in every language. */
const APPROX: Record<Locale, string> = {
  hu: 'kb.', nl: 'ca.', en: 'approx.', de: 'ca.', fr: 'env.', es: 'aprox.', pl: 'ok.', ro: 'aprox.', sk: 'cca', it: 'circa', pt: 'cerca de',
  el: 'περ.', cs: 'cca', sl: 'ok.', sv: 'ca', da: 'ca.', no: 'ca.', fi: 'n.', et: 'u', lv: 'apm.', lt: 'apie', sr: 'oko', uk: 'бл.',
  tr: 'yakl.', he: 'כ־', ar: 'نحو', ru: '≈', zh: '约',
};

/** „kb. 3 400 Ft”, ready to put under a euro price. Empty when there is no rate: the euro price stands alone. */
export function formatHufHint(cents: number, fx: Pick<FxRate, 'rate'> | null | undefined, locale: Locale = 'hu'): string {
  if (!fx) return '';
  const amount = hufHintAmount(cents, fx.rate);
  return amount > 0 ? `${APPROX[locale] ?? APPROX.en} ${huf(amount, locale)}` : '';
}

const dateText = (date: string): string => date.replaceAll('-', '.') + '.';
const rateText = (rate: number, locale: Locale): string => rate.toFixed(2).replace('.', separators(locale).decimal);

/** The footnote under every price that carries a forint hint: what it is, whose rate, and that payment is in euro. */
const FOOTNOTE: Record<Locale, (rate: string, date: string) => string> = {
  hu: (r, d) => `Tájékoztató jellegű forintár az EKB aznapi EUR/HUF árfolyamán (1 € = ${r} Ft, ${d}). Fizetés euróban.`,
  nl: (r, d) => `Indicatief bedrag in forint tegen de EUR/HUF-koers van de ECB (1 € = ${r} Ft, ${d}). U betaalt in euro.`,
  en: (r, d) => `Indicative forint amount at the ECB EUR/HUF rate of ${d} (1 € = ${r} Ft). You pay in euro.`,
  de: (r, d) => `Unverbindlicher Forint-Betrag zum EZB-Kurs EUR/HUF vom ${d} (1 € = ${r} Ft). Die Zahlung erfolgt in Euro.`,
  fr: (r, d) => `Montant indicatif en forints au taux EUR/HUF de la BCE du ${d} (1 € = ${r} Ft). Le paiement se fait en euros.`,
  es: (r, d) => `Importe orientativo en forintos al tipo EUR/HUF del BCE del ${d} (1 € = ${r} Ft). El pago se realiza en euros.`,
  pl: (r, d) => `Kwota w forintach ma charakter orientacyjny, według kursu EUR/HUF EBC z dnia ${d} (1 € = ${r} Ft). Płatność w euro.`,
  ro: (r, d) => `Sumă orientativă în forinți, la cursul EUR/HUF al BCE din ${d} (1 € = ${r} Ft). Plata se face în euro.`,
  sk: (r, d) => `Orientačná suma vo forintoch podľa kurzu EUR/HUF ECB z ${d} (1 € = ${r} Ft). Platí sa v eurách.`,
  it: (r, d) => `Importo indicativo in fiorini al cambio EUR/HUF della BCE del ${d} (1 € = ${r} Ft). Il pagamento avviene in euro.`,
  pt: (r, d) => `Valor indicativo em florins à taxa EUR/HUF do BCE de ${d} (1 € = ${r} Ft). O pagamento é feito em euros.`,
  el: (r, d) => `Ενδεικτικό ποσό σε φιορίνια με τη ισοτιμία EUR/HUF της ΕΚΤ της ${d} (1 € = ${r} Ft). Η πληρωμή γίνεται σε ευρώ.`,
  cs: (r, d) => `Orientační částka ve forintech podle kurzu EUR/HUF ECB ze dne ${d} (1 € = ${r} Ft). Platí se v eurech.`,
  sl: (r, d) => `Okvirni znesek v forintih po tečaju EUR/HUF ECB z dne ${d} (1 € = ${r} Ft). Plačilo je v evrih.`,
  sv: (r, d) => `Vägledande belopp i forint enligt ECB:s EUR/HUF-kurs den ${d} (1 € = ${r} Ft). Du betalar i euro.`,
  da: (r, d) => `Vejledende beløb i forint efter ECB's EUR/HUF-kurs den ${d} (1 € = ${r} Ft). Du betaler i euro.`,
  no: (r, d) => `Veiledende beløp i forint etter ECBs EUR/HUF-kurs ${d} (1 € = ${r} Ft). Du betaler i euro.`,
  fi: (r, d) => `Suuntaa antava forinttimäärä EKP:n EUR/HUF-kurssilla ${d} (1 € = ${r} Ft). Maksat euroina.`,
  et: (r, d) => `Orienteeruv summa forintides EKP EUR/HUF kursi järgi ${d} (1 € = ${r} Ft). Maksate eurodes.`,
  lv: (r, d) => `Orientējošā summa forintos pēc ECB EUR/HUF kursa ${d} (1 € = ${r} Ft). Maksājums eiro.`,
  lt: (r, d) => `Orientacinė suma forintais pagal ECB EUR/HUF kursą ${d} (1 € = ${r} Ft). Mokate eurais.`,
  sr: (r, d) => `Orijentacioni iznos u forintama po kursu EUR/HUF Evropske centralne banke od ${d} (1 € = ${r} Ft). Plaćanje je u evrima.`,
  uk: (r, d) => `Орієнтовна сума у форинтах за курсом EUR/HUF ЄЦБ на ${d} (1 € = ${r} Ft). Оплата в євро.`,
  tr: (r, d) => `Forint tutarı bilgi amaçlıdır; ECB’nin ${d} tarihli EUR/HUF kuruna göre hesaplanmıştır (1 € = ${r} Ft). Ödeme euro ile yapılır.`,
  he: (r, d) => `סכום מצוין בפורינט לצורכי מידע בלבד, לפי שער EUR/HUF של הבנק האירופי המרכזי מיום ${d} (1 € = ${r} Ft). התשלום נעשה ביורו.`,
  ar: (r, d) => `مبلغ بالفورنت للاسترشاد فقط، وفق سعر EUR/HUF للبنك المركزي الأوروبي بتاريخ ${d} (1 € = ${r} Ft). الدفع باليورو.`,
  ru: (r, d) => `Ориентировочная сумма в форинтах по курсу EUR/HUF ЕЦБ на ${d} (1 € = ${r} Ft). Оплата в евро.`,
  zh: (r, d) => `福林金额仅供参考，按欧洲央行 ${d} 的 EUR/HUF 汇率计算（1 € = ${r} Ft）。以欧元支付。`,
};

export function fxFootnote(fx: Pick<FxRate, 'rate' | 'date'>, locale: Locale = 'hu'): string {
  const date = locale === 'hu' ? dateText(fx.date) : fx.date;
  return (FOOTNOTE[locale] ?? FOOTNOTE.en)(rateText(fx.rate, locale), date);
}

/* ── Reading what the ECB and its mirror publish ─────────────────────────── */

export type RateTable = { date: string; rates: Record<string, number> };

/**
 * The ECB mirror Frankfurter (api.frankfurter.app/latest?from=EUR), used only when the ECB itself fails. Same
 * checks as the ECB reader: a date, a positive HUF rate, nothing from the future, nothing older than a week.
 */
export function parseFrankfurter(raw: unknown, now: Date = new Date()): RateTable {
  const body = (raw && typeof raw === 'object' ? raw : {}) as { date?: unknown; rates?: unknown };
  const date = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  const rates: Record<string, number> = { EUR: 1 };
  if (body.rates && typeof body.rates === 'object') {
    for (const [code, value] of Object.entries(body.rates as Record<string, unknown>)) {
      const n = Number(value);
      if (/^[A-Z]{3}$/.test(code) && Number.isFinite(n) && n > 0) rates[code] = n;
    }
  }
  if (!date || !rates.HUF || now.getTime() - Date.parse(date) > 7 * DAY || Date.parse(date) > now.getTime() + DAY) throw new Error('rates-unavailable');
  return { date, rates };
}
