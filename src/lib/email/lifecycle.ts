/**
 * Emails of a live listing's life after publication — expiry reminders,
 * expiry, renewal, the monthly "still for sale?" check — plus the newsletter
 * confirmation. Same shell, helpers and tone as templates.ts; the copy lives
 * here rather than in copy/{hu,nl}.ts because it is one self-contained round
 * (the invoicing emails follow the same pattern).
 *
 * Owners read Hungarian or Dutch (profiles.locale → localeOf). The newsletter
 * also speaks English and German, because the EN/DE pages collect sign-ups.
 */
import { shell, textShell, h1, p, lead, small, button, facts, textLink, esc, type EmailLocale, type ShellLocale } from './layout';
import type { BuiltEmail } from './templates';
import { COMPANY } from '~/config/company';

const sign = { hu: 'Üdvözlettel,\nFODEL Ingatlan', nl: 'Met vriendelijke groet,\nFODEL Vastgoed' };
const questions = {
  hu: `Kérdése van? Válaszoljon erre a levélre, vagy hívjon minket: ${COMPANY.phones[0].display}.`,
  nl: `Vragen? Beantwoord deze e-mail of bel ons: ${COMPANY.phones[0].display}.`,
};
const signOff = (l: EmailLocale) => small(questions[l]) + p(sign[l]);
const textSign = (l: EmailLocale) => `${questions[l]}\n\n${sign[l]}`;
const cta = (label: string, href: string) => `${label}:\n${href}`;

/* ── Expiry reminder (14 and 3 days by default) ─────────────────────────── */

export type ExpiryArgs = { ref: string; title: string; url: string; expiresOn: string; days: number; renewUrl: string; price: string };

const EXPIRY = {
  hu: {
    subject: (d: number) => `Hirdetése ${d} nap múlva lejár — FODEL`,
    preheader: 'Egy kattintással meghosszabbíthatja további 6 hónapra.',
    heading: 'Hamarosan lejár a hirdetése',
    intro: (t: string, d: number, on: string) => `A(z) „${t}” hirdetése ${d} nap múlva lejár (${on}), ezután lekerül az oldalról.`,
    body: (price: string) => `Ha az ingatlan még eladó, hosszabbítsa meg további 6 hónapra (${price}). Fizethet bankkártyával vagy átutalással; a hosszabbítás a lejárat napjától számít, így egy napot sem veszít.`,
    cta: 'Hirdetés meghosszabbítása',
    view: 'Hirdetés megtekintése',
    labels: { ref: 'Azonosító', ends: 'Lejárat' },
    sold: 'Ha időközben eladta, nincs teendője — ebben az esetben kérjük, jelezze nekünk egy válasz-levélben.',
  },
  nl: {
    subject: (d: number) => `Uw advertentie verloopt over ${d} dagen — FODEL`,
    preheader: 'Met één klik verlengt u met 6 maanden.',
    heading: 'Uw advertentie verloopt binnenkort',
    intro: (t: string, d: number, on: string) => `Uw advertentie „${t}” verloopt over ${d} dagen, op ${on}. Daarna verdwijnt ze van de site.`,
    body: (price: string) => `Is de woning nog te koop? Verleng dan met 6 maanden (${price}). U betaalt per kaart of overboeking; de verlenging gaat in op de vervaldatum, u verliest dus geen dag.`,
    cta: 'Advertentie verlengen',
    view: 'Advertentie bekijken',
    labels: { ref: 'Referentie', ends: 'Vervaldatum' },
    sold: 'Is de woning inmiddels verkocht? Laat het ons weten door deze e-mail te beantwoorden.',
  },
};

function expiryReminder(locale: EmailLocale, a: ExpiryArgs): BuiltEmail {
  const c = EXPIRY[locale];
  return {
    subject: c.subject(a.days),
    html: shell({
      locale,
      preheader: c.preheader,
      body: h1(c.heading) + lead(c.intro(a.title, a.days, a.expiresOn)) + facts([[c.labels.ref, `#${a.ref}`], [c.labels.ends, a.expiresOn]]) +
        p(c.body(a.price)) + button(c.cta, a.renewUrl) + textLink(c.view, a.url) + small(c.sold) + signOff(locale),
    }),
    text: textShell({
      locale,
      body: `${c.heading}\n\n${c.intro(a.title, a.days, a.expiresOn)}\n\n${c.labels.ref}: #${a.ref}\n${c.labels.ends}: ${a.expiresOn}\n\n${c.body(a.price)}\n\n${cta(c.cta, a.renewUrl)}\n\n${cta(c.view, a.url)}\n\n${c.sold}\n\n${textSign(locale)}`,
    }),
  };
}

/* ── On expiry ─────────────────────────────────────────────────────────── */

export type ExpiredArgs = { ref: string; title: string; renewUrl: string; price: string };

const EXPIRED = {
  hu: {
    subject: 'Hirdetése lejárt — egy kattintással újra online lehet',
    preheader: 'Hosszabbítás után azonnal újra megjelenik.',
    heading: 'Lejárt a hirdetése',
    intro: (t: string) => `A(z) „${t}” hirdetés lejárt, és lekerült az oldalról. Az adatai és a fényképei megmaradtak.`,
    body: (price: string) => `Ha az ingatlan még eladó, hosszabbítsa meg 6 hónapra (${price}): a fizetés után a hirdetés azonnal újra megjelenik, ugyanazon a címen.`,
    cta: 'Hosszabbítás és újra online',
  },
  nl: {
    subject: 'Uw advertentie is verlopen — met één klik weer online',
    preheader: 'Na verlenging staat ze direct weer online.',
    heading: 'Uw advertentie is verlopen',
    intro: (t: string) => `De advertentie „${t}” is verlopen en staat niet meer op de site. Uw gegevens en foto's blijven bewaard.`,
    body: (price: string) => `Is de woning nog te koop? Verleng dan met 6 maanden (${price}): na betaling staat de advertentie direct weer online, op hetzelfde adres.`,
    cta: 'Verlengen en weer online',
  },
};

function listingExpired(locale: EmailLocale, a: ExpiredArgs): BuiltEmail {
  const c = EXPIRED[locale];
  return {
    subject: c.subject,
    html: shell({ locale, preheader: c.preheader, body: h1(c.heading) + lead(c.intro(a.title)) + p(c.body(a.price)) + button(c.cta, a.renewUrl) + signOff(locale) }),
    text: textShell({ locale, body: `${c.heading}\n\n${c.intro(a.title)}\n\n${c.body(a.price)}\n\n${cta(c.cta, a.renewUrl)}\n\n${textSign(locale)}` }),
  };
}

/* ── Renewed ───────────────────────────────────────────────────────────── */

const RENEWED = {
  hu: {
    subject: 'Hirdetését meghosszabbítottuk — FODEL',
    preheader: 'Az új lejárati dátum a levélben.',
    heading: 'Meghosszabbítva',
    intro: (t: string, on: string) => `A(z) „${t}” hirdetés új lejárata: ${on}. Köszönjük!`,
    cta: 'Hirdetés megtekintése',
  },
  nl: {
    subject: 'Uw advertentie is verlengd — FODEL',
    preheader: 'De nieuwe vervaldatum staat in deze e-mail.',
    heading: 'Verlengd',
    intro: (t: string, on: string) => `De advertentie „${t}” blijft online tot ${on}. Dank u wel!`,
    cta: 'Advertentie bekijken',
  },
};

function renewed(locale: EmailLocale, a: { ref: string; title: string; url: string; expiresOn: string }): BuiltEmail {
  const c = RENEWED[locale];
  return {
    subject: c.subject,
    html: shell({ locale, preheader: c.preheader, body: h1(c.heading) + lead(c.intro(a.title, a.expiresOn)) + button(c.cta, a.url) + signOff(locale) }),
    text: textShell({ locale, body: `${c.heading}\n\n${c.intro(a.title, a.expiresOn)}\n\n${cta(c.cta, a.url)}\n\n${textSign(locale)}` }),
  };
}

/* ── Renewal by bank transfer: the details, kept in the inbox ──────────── */

export type TransferArgs = { ref: string; title: string; amount: string; account: string; reference: string; payUrl: string };

const TRANSFER = {
  hu: {
    subject: (r: string) => `Hosszabbítás átutalással — #${r}`,
    preheader: 'Az átutalás adatai; a jóváírás után meghosszabbítjuk a hirdetést.',
    heading: 'Hosszabbítás átutalással',
    intro: (t: string) => `Köszönjük! A(z) „${t}” hirdetés hosszabbítását a díj beérkezése után rögzítjük.`,
    labels: { amount: 'Összeg', account: 'Bankszámla', reference: 'Közlemény' },
    note: 'Ha mégis bankkártyával fizetne, a lenti gombbal bármikor megteheti.',
    cta: 'Fizetési lehetőségek',
  },
  nl: {
    subject: (r: string) => `Verlenging per overboeking — #${r}`,
    preheader: 'De betaalgegevens; na ontvangst verlengen wij de advertentie.',
    heading: 'Verlenging per overboeking',
    intro: (t: string) => `Dank u! Wij verlengen de advertentie „${t}” zodra de betaling binnen is.`,
    labels: { amount: 'Bedrag', account: 'Rekening', reference: 'Omschrijving' },
    note: 'Toch liever per kaart betalen? Dat kan altijd via de knop hieronder.',
    cta: 'Betaalmogelijkheden',
  },
};

function renewalTransfer(locale: EmailLocale, a: TransferArgs): BuiltEmail {
  const c = TRANSFER[locale];
  const rows: [string, string][] = [[c.labels.amount, a.amount], [c.labels.account, a.account], [c.labels.reference, a.reference]];
  return {
    subject: c.subject(a.ref),
    html: shell({ locale, preheader: c.preheader, body: h1(c.heading) + lead(c.intro(a.title)) + facts(rows) + small(c.note) + button(c.cta, a.payUrl) + signOff(locale) }),
    text: textShell({ locale, body: `${c.heading}\n\n${c.intro(a.title)}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${c.note}\n${cta(c.cta, a.payUrl)}\n\n${textSign(locale)}` }),
  };
}

/* ── Monthly "is it still for sale?" ───────────────────────────────────── */

export type RefreshArgs = { ref: string; title: string; url: string; price: string; stillUrl: string; priceUrl: string; soldUrl: string; validUntil: string; reminder?: boolean };

const REFRESH = {
  hu: {
    subject: (t: string, r: boolean) => `${r ? 'Emlékeztető: ' : ''}Még eladó? — ${t}`,
    preheader: 'Egy kattintás, belépés nélkül.',
    heading: 'Még eladó az ingatlan?',
    intro: (t: string, price: string) => `Havonta egyszer rákérdezünk, hogy a(z) „${t}” hirdetés (${price}) még friss-e. A vevők a naprakész hirdetésekben bíznak meg.`,
    reminder: 'Egy hete írtunk ugyanerről, de még nem kaptunk választ.',
    still: 'Igen, még eladó',
    price: 'Változott az ár',
    sold: 'Eladtam',
    how: 'Egy kattintás elég, belépni nem kell. Az új árat azonnal frissítjük a hirdetésben.',
    valid: (d: string) => `A linkek ${d}-ig érvényesek.`,
  },
  nl: {
    subject: (t: string, r: boolean) => `${r ? 'Herinnering: ' : ''}Nog te koop? — ${t}`,
    preheader: 'Eén klik, zonder in te loggen.',
    heading: 'Is de woning nog te koop?',
    intro: (t: string, price: string) => `Eens per maand vragen wij of de advertentie „${t}” (${price}) nog actueel is. Kopers vertrouwen op advertenties die kloppen.`,
    reminder: 'Wij vroegen u dit een week geleden al, maar ontvingen nog geen antwoord.',
    still: 'Ja, nog te koop',
    price: 'De prijs is gewijzigd',
    sold: 'Verkocht',
    how: 'Eén klik volstaat, inloggen is niet nodig. Een nieuwe prijs passen wij direct aan.',
    valid: (d: string) => `De links zijn geldig tot ${d}.`,
  },
};

function ownerRefresh(locale: EmailLocale, a: RefreshArgs): BuiltEmail {
  const c = REFRESH[locale];
  return {
    subject: c.subject(a.title, Boolean(a.reminder)),
    html: shell({
      locale,
      preheader: c.preheader,
      body: h1(c.heading) + (a.reminder ? p(c.reminder) : '') + lead(c.intro(a.title, a.price)) +
        button(c.still, a.stillUrl) + textLink(c.price, a.priceUrl) + textLink(c.sold, a.soldUrl) +
        small(`${c.how} ${c.valid(a.validUntil)}`) + signOff(locale),
    }),
    text: textShell({
      locale,
      body: `${c.heading}\n\n${a.reminder ? `${c.reminder}\n\n` : ''}${c.intro(a.title, a.price)}\n\n${cta(c.still, a.stillUrl)}\n\n${cta(c.price, a.priceUrl)}\n\n${cta(c.sold, a.soldUrl)}\n\n${c.how} ${c.valid(a.validUntil)}\n\n${textSign(locale)}`,
    }),
  };
}

/* ── Office notice: the owner changed the price or sold (Hungarian) ────── */

function adminOwnerUpdate(a: { kind: 'price' | 'sold'; ref: string; title: string; owner: string; oldPrice?: string; newPrice?: string; editUrl: string }): BuiltEmail {
  const subject = a.kind === 'price' ? `Árváltozás a tulajdonostól — #${a.ref}` : `Eladva jelölte a tulajdonos — #${a.ref}`;
  const intro = a.kind === 'price'
    ? `${a.owner} a havi visszaigazoló linken új árat adott meg. Az ár azonnal frissült a hirdetésben (újbóli elbírálás nélkül).`
    : `${a.owner} a havi visszaigazoló linken eladottnak jelölte a hirdetést. Átkerült az eladott ingatlanok közé.`;
  const rows: [string, string][] = [['Hirdetés', `${a.title} (#${a.ref})`]];
  if (a.kind === 'price') rows.push(['Régi ár', a.oldPrice ?? '—'], ['Új ár', a.newPrice ?? '—']);
  return {
    subject,
    html: shell({ locale: 'hu', preheader: intro, body: h1(a.kind === 'price' ? 'Árváltozás' : 'Eladva') + lead(intro) + facts(rows) + button('Megnyitás a portálon', a.editUrl) }),
    text: textShell({ locale: 'hu', body: `${intro}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMegnyitás: ${a.editUrl}` }),
  };
}

/* ── Newsletter double opt-in ──────────────────────────────────────────── */

const NEWSLETTER: Record<ShellLocale, { subject: string; preheader: string; heading: string; intro: string; cta: string; ignore: string; unsubscribe: string; why: string }> = {
  hu: {
    subject: 'Erősítse meg a feliratkozást — FODEL hírlevél',
    preheader: 'Egy kattintás, és küldjük az új ingatlanokat.',
    heading: 'Még egy kattintás',
    intro: 'Köszönjük, hogy feliratkozott a FODEL hírlevelére. Kérjük, erősítse meg, hogy valóban Ön kérte — csak ezután küldünk levelet.',
    cta: 'Feliratkozás megerősítése',
    ignore: 'Ha nem Ön iratkozott fel, hagyja figyelmen kívül ezt a levelet: megerősítés nélkül nem küldünk semmit.',
    unsubscribe: 'Leiratkozás',
    why: 'Ezt a levelet azért kapja, mert ezzel a címmel feliratkoztak a FODEL hírlevelére.',
  },
  nl: {
    subject: 'Bevestig uw inschrijving — FODEL nieuwsbrief',
    preheader: 'Eén klik, en u ontvangt het nieuwe aanbod.',
    heading: 'Nog één klik',
    intro: 'Bedankt voor uw inschrijving op de FODEL-nieuwsbrief. Bevestig dat u dit zelf heeft aangevraagd — pas daarna sturen wij u iets.',
    cta: 'Inschrijving bevestigen',
    ignore: 'Heeft u zich niet ingeschreven? Negeer deze e-mail dan: zonder bevestiging sturen wij niets.',
    unsubscribe: 'Uitschrijven',
    why: 'U ontvangt deze e-mail omdat dit adres is ingeschreven voor de FODEL-nieuwsbrief.',
  },
  en: {
    subject: 'Confirm your subscription — FODEL newsletter',
    preheader: 'One click, and we will send you new listings.',
    heading: 'One more click',
    intro: 'Thank you for subscribing to the FODEL newsletter. Please confirm it was you — we send nothing until you do.',
    cta: 'Confirm subscription',
    ignore: 'If you did not subscribe, simply ignore this email: without confirmation we send nothing.',
    unsubscribe: 'Unsubscribe',
    why: 'You are receiving this email because this address was subscribed to the FODEL newsletter.',
  },
  de: {
    subject: 'Bitte bestätigen Sie Ihr Abonnement — FODEL-Newsletter',
    preheader: 'Ein Klick, und wir senden Ihnen neue Angebote.',
    heading: 'Noch ein Klick',
    intro: 'Vielen Dank für Ihre Anmeldung zum FODEL-Newsletter. Bitte bestätigen Sie, dass Sie es waren — vorher senden wir nichts.',
    cta: 'Anmeldung bestätigen',
    ignore: 'Wenn Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail einfach: ohne Bestätigung senden wir nichts.',
    unsubscribe: 'Abmelden',
    why: 'Sie erhalten diese E-Mail, weil diese Adresse für den FODEL-Newsletter angemeldet wurde.',
  },
};

/** The footer line every newsletter email carries: why, plus a one-click unsubscribe link. */
export function newsletterFooter(locale: ShellLocale, unsubscribeUrl: string): { html: string; text: string } {
  const c = NEWSLETTER[locale];
  return {
    html: `${esc(c.why)} <a href="${esc(unsubscribeUrl)}" style="color:inherit;text-decoration:underline;">${esc(c.unsubscribe)}</a>`,
    text: `${c.why}\n${c.unsubscribe}: ${unsubscribeUrl}`,
  };
}

function newsletterConfirm(locale: ShellLocale, a: { confirmUrl: string; unsubscribeUrl: string }): BuiltEmail {
  const c = NEWSLETTER[locale];
  const footer = newsletterFooter(locale, a.unsubscribeUrl);
  return {
    subject: c.subject,
    html: shell({ locale, preheader: c.preheader, body: h1(c.heading) + lead(c.intro) + button(c.cta, a.confirmUrl) + small(c.ignore), whyHtml: footer.html }),
    text: textShell({ locale, body: `${c.heading}\n\n${c.intro}\n\n${cta(c.cta, a.confirmUrl)}\n\n${c.ignore}`, why: footer.text }),
  };
}

export const lifecycleEmails = { expiryReminder, listingExpired, renewed, renewalTransfer, ownerRefresh, adminOwnerUpdate, newsletterConfirm };
