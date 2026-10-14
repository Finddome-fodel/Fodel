/**
 * Contact hours, worded once. Every public mention — footer, contact page,
 * FAQ, form confirmations, the acknowledgement email — reads the same
 * setting (site_settings.hours, Beállítások → Cégadatok), so "office hours"
 * and "callbacks until …" can no longer disagree from page to page.
 *
 * Meaning, as the site states it everywhere: the office answers the phone on
 * weekdays between `from` and `to`; a requested callback can come until
 * `callback.to`, on weekends too when `includesWeekends` is set.
 */
export type Hours = {
  weekdays: { from: string; to: string };
  callback: { to: string; includesWeekends: boolean };
};

type L = 'hu' | 'nl' | 'en' | 'de';

export function officeHours(h: Hours, locale: L): string {
  const range = `${h.weekdays.from}–${h.weekdays.to}`;
  return { hu: `Hétfő–péntek · ${range}`, nl: `Maandag–vrijdag · ${range}`, en: `Monday–Friday · ${range}`, de: `Montag–Freitag · ${range}` }[locale];
}

export function callbackHours(h: Hours, locale: L): string {
  const to = h.callback.to;
  const weekend = h.callback.includesWeekends;
  return {
    hu: weekend ? `Visszahívás ${to}-ig, hétvégén is.` : `Visszahívás munkanapokon ${to}-ig.`,
    nl: weekend ? `Terugbellen tot ${to} uur, ook in het weekend.` : `Terugbellen op werkdagen tot ${to} uur.`,
    en: weekend ? `Callbacks until ${to}, weekends included.` : `Callbacks on weekdays until ${to}.`,
    de: weekend ? `Rückruf bis ${to} Uhr, auch am Wochenende.` : `Rückruf werktags bis ${to} Uhr.`,
  }[locale];
}

/** One sentence for running text: when to call, and how late a callback can come. */
export function hoursSentence(h: Hours, locale: L): string {
  const { from, to } = h.weekdays;
  const cb = h.callback.to;
  const weekend = h.callback.includesWeekends;
  return {
    hu: `Munkanapokon ${from} és ${to} között hívhat minket; visszahívást ${cb}-ig kérhet${weekend ? ', hétvégén is' : ''}.`,
    nl: `Bel ons op werkdagen tussen ${from} en ${to}; terugbellen kan tot ${cb} uur${weekend ? ', ook in het weekend' : ''}.`,
    en: `Call us on weekdays between ${from} and ${to}; callbacks run until ${cb}${weekend ? ', weekends included' : ''}.`,
    de: `Rufen Sie uns werktags zwischen ${from} und ${to} an; Rückrufe bis ${cb} Uhr${weekend ? ', auch am Wochenende' : ''}.`,
  }[locale];
}

/** Fills `{hours}` in a stored copy string with the sentence above. */
export function fillHours(text: string, h: Hours, locale: L): string {
  return text.includes('{hours}') ? text.replace('{hours}', hoursSentence(h, locale)) : text;
}
