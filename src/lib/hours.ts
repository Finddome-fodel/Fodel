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

import type { Locale } from '~/i18n/ui';

type L = Locale;

/** "21:00" → "21 h" (French writes the hour, with a no-break space before the h). */
const frTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)}\u00a0h` : `${Number(h)}\u00a0h\u00a0${m}`;
};

export function officeHours(h: Hours, locale: L): string {
  const range = `${h.weekdays.from}–${h.weekdays.to}`;
  return {
    hu: `Hétfő–péntek · ${range}`,
    nl: `Maandag–vrijdag · ${range}`,
    en: `Monday–Friday · ${range}`,
    de: `Montag–Freitag · ${range}`,
    fr: `Lundi–vendredi · ${range}`,
    es: `De lunes a viernes · ${range}`,
    pl: `Poniedziałek–piątek · ${range}`,
    ro: `Luni–vineri · ${range}`,
    sk: `Pondelok–piatok · ${range}`,
    it: `Lunedì–venerdì · ${range}`,
    pt: `Segunda a sexta · ${range}`,
    el: `Δευτέρα–Παρασκευή · ${range}`,
    cs: `Pondělí–pátek · ${range}`,
    sl: `Ponedeljek–petek · ${range}`,
    sv: `Måndag–fredag · ${range}`,
    da: `Mandag–fredag · ${range}`,
    no: `Mandag–fredag · ${range}`,
    fi: `Maanantai–perjantai · ${range}`,
    et: `Esmaspäev–reede · ${range}`,
    lv: `Pirmdiena–piektdiena · ${range}`,
    lt: `Pirmadienis–penktadienis · ${range}`,
  }[locale];
}

export function callbackHours(h: Hours, locale: L): string {
  const to = h.callback.to;
  const weekend = h.callback.includesWeekends;
  return {
    hu: weekend ? `Visszahívás ${to}-ig, hétvégén is.` : `Visszahívás munkanapokon ${to}-ig.`,
    nl: weekend ? `Terugbellen tot ${to} uur, ook in het weekend.` : `Terugbellen op werkdagen tot ${to} uur.`,
    en: weekend ? `Callbacks until ${to}, weekends included.` : `Callbacks on weekdays until ${to}.`,
    de: weekend ? `Rückruf bis ${to} Uhr, auch am Wochenende.` : `Rückruf werktags bis ${to} Uhr.`,
    fr: weekend ? `Rappel jusqu’à ${frTime(to)}, week-end compris.` : `Rappel en semaine jusqu’à ${frTime(to)}.`,
    es: weekend ? `Le devolvemos la llamada hasta las ${to}, también los fines de semana.` : `Le devolvemos la llamada en días laborables hasta las ${to}.`,
    pl: weekend ? `Oddzwaniamy do godz. ${to}, także w weekendy.` : `Oddzwaniamy w dni robocze do godz. ${to}.`,
    ro: weekend ? `Vă sunăm înapoi până la ora ${to}, inclusiv în weekend.` : `Vă sunăm înapoi în zilele lucrătoare până la ora ${to}.`,
    sk: weekend ? `Spätné volanie do ${to}, aj cez víkend.` : `Spätné volanie v pracovné dni do ${to}.`,
    it: weekend ? `Richiamate fino alle ${to}, anche nel fine settimana.` : `Richiamate nei giorni feriali fino alle ${to}.`,
    pt: weekend ? `Chamadas de retorno até às ${to}, incluindo fins de semana.` : `Chamadas de retorno nos dias úteis até às ${to}.`,
    el: weekend ? `Επανακλήσεις έως τις ${to}, και τα Σαββατοκύριακα.` : `Επανακλήσεις τις καθημερινές έως τις ${to}.`,
    cs: weekend ? `Zpětné volání do ${to}, i o víkendu.` : `Zpětné volání v pracovní dny do ${to}.`,
    sl: weekend ? `Povratni klici do ${to}, tudi ob koncih tedna.` : `Povratni klici ob delavnikih do ${to}.`,
    sv: weekend ? `Vi ringer upp till kl. ${to}, även på helger.` : `Vi ringer upp vardagar till kl. ${to}.`,
    da: weekend ? `Vi ringer tilbage indtil kl. ${to}, også i weekenden.` : `Vi ringer tilbage på hverdage indtil kl. ${to}.`,
    no: weekend ? `Vi ringer tilbake til kl. ${to}, også i helgene.` : `Vi ringer tilbake på hverdager til kl. ${to}.`,
    fi: weekend ? `Soitamme takaisin klo ${to} asti, myös viikonloppuisin.` : `Soitamme takaisin arkisin klo ${to} asti.`,
    et: weekend ? `Tagasihelistamine kuni kella ${to}-ni, ka nädalavahetusel.` : `Tagasihelistamine tööpäeviti kuni kella ${to}-ni.`,
    lv: weekend ? `Atzvanām līdz plkst. ${to}, arī nedēļas nogalēs.` : `Atzvanām darba dienās līdz plkst. ${to}.`,
    lt: weekend ? `Perskambiname iki ${to}, taip pat savaitgaliais.` : `Darbo dienomis perskambiname iki ${to}.`,
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
    fr: `Appelez-nous en semaine entre ${frTime(from)} et ${frTime(to)}\u00a0; nous rappelons jusqu’à ${frTime(cb)}${weekend ? ', week-end compris' : ''}.`,
    es: `Llámenos en días laborables de ${from} a ${to}; le devolvemos la llamada hasta las ${cb}${weekend ? ', también los fines de semana' : ''}.`,
    pl: `Prosimy dzwonić w dni robocze w godz. ${from}–${to}; oddzwaniamy do godz. ${cb}${weekend ? ', także w weekendy' : ''}.`,
    ro: `Ne puteți suna în zilele lucrătoare între orele ${from} și ${to}; vă sunăm înapoi până la ora ${cb}${weekend ? ', inclusiv în weekend' : ''}.`,
    sk: `Volajte nám v pracovné dni od ${from} do ${to}; spätné volanie je možné do ${cb}${weekend ? ', aj cez víkend' : ''}.`,
    it: `Ci chiami nei giorni feriali tra le ${from} e le ${to}; le richiamate sono possibili fino alle ${cb}${weekend ? ', anche nel fine settimana' : ''}.`,
    pt: `Ligue-nos nos dias úteis entre as ${from} e as ${to}; as chamadas de retorno decorrem até às ${cb}${weekend ? ', incluindo fins de semana' : ''}.`,
    el: `Καλέστε μας τις καθημερινές από τις ${from} έως τις ${to}· οι επανακλήσεις γίνονται έως τις ${cb}${weekend ? ', και τα Σαββατοκύριακα' : ''}.`,
    cs: `Volejte nám v pracovní dny od ${from} do ${to}; zpětné volání je možné do ${cb}${weekend ? ', i o víkendu' : ''}.`,
    sl: `Pokličite nas ob delavnikih med ${from} in ${to}; povratni klici so mogoči do ${cb}${weekend ? ', tudi ob koncih tedna' : ''}.`,
    sv: `Ring oss vardagar mellan kl. ${from} och ${to}; vi ringer upp till kl. ${cb}${weekend ? ', även på helger' : ''}.`,
    da: `Ring til os på hverdage mellem kl. ${from} og ${to}; vi ringer tilbage indtil kl. ${cb}${weekend ? ', også i weekenden' : ''}.`,
    no: `Ring oss på hverdager mellom kl. ${from} og ${to}; vi ringer tilbake til kl. ${cb}${weekend ? ', også i helgene' : ''}.`,
    fi: `Soita meille arkisin klo ${from}–${to}; soitamme takaisin klo ${cb} asti${weekend ? ', myös viikonloppuisin' : ''}.`,
    et: `Helistage meile tööpäeviti kella ${from}–${to}; tagasi helistame kuni kella ${cb}-ni${weekend ? ', ka nädalavahetusel' : ''}.`,
    lv: `Zvaniet mums darba dienās no plkst. ${from} līdz ${to}; atzvanām līdz plkst. ${cb}${weekend ? ', arī nedēļas nogalēs' : ''}.`,
    lt: `Skambinkite mums darbo dienomis nuo ${from} iki ${to}; perskambiname iki ${cb}${weekend ? ', taip pat savaitgaliais' : ''}.`,
  }[locale];
}

/** Fills `{hours}` in a stored copy string with the sentence above. */
export function fillHours(text: string, h: Hours, locale: L): string {
  return text.includes('{hours}') ? text.replace('{hours}', hoursSentence(h, locale)) : text;
}
