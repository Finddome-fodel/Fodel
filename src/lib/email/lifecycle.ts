/**
 * Emails of a live listing's life after publication — expiry reminders,
 * expiry, renewal, the monthly "still for sale?" check — plus the newsletter
 * confirmation. Same shell, helpers and tone as templates.ts; the copy lives
 * here rather than in copy/<lang>.ts because it is one self-contained round
 * (the invoicing emails follow the same pattern).
 *
 * Every email speaks the recipient's language (profiles.locale → localeOf;
 * a newsletter sign-up, the page's own). All five languages are written out
 * below, side by side, so none can be forgotten.
 */
import { shell, textShell, h1, p, lead, small, button, facts, textLink, esc, type EmailLocale, type ShellLocale } from './layout';
import type { BuiltEmail } from './templates';
import { COMPANY } from '~/config/company';

const sign: Record<EmailLocale, string> = {
  hu: 'Üdvözlettel,\nFODEL Ingatlan',
  nl: 'Met vriendelijke groet,\nFODEL Vastgoed',
  en: 'Kind regards,\nFODEL Real Estates',
  de: 'Mit freundlichen Grüßen\nFODEL Immobilien',
  fr: 'Cordialement,\nFODEL Immobilier',
};
const questions: Record<EmailLocale, string> = {
  hu: `Kérdése van? Válaszoljon erre a levélre, vagy hívjon minket: ${COMPANY.phones[0].display}.`,
  nl: `Vragen? Beantwoord deze e-mail of bel ons: ${COMPANY.phones[0].display}.`,
  en: `Questions? Reply to this email or call us: ${COMPANY.phones[0].display}.`,
  de: `Fragen? Antworten Sie auf diese E-Mail oder rufen Sie uns an: ${COMPANY.phones[0].display}.`,
  fr: `Une question\u202f? Répondez à cet e-mail ou appelez-nous\u00a0: ${COMPANY.phones[0].display}.`,
};
const signOff = (l: EmailLocale) => small(questions[l]) + p(sign[l]);
const textSign = (l: EmailLocale) => `${questions[l]}\n\n${sign[l]}`;
const cta = (label: string, href: string) => `${label}:\n${href}`;

/* ── Expiry reminder (14 and 3 days by default) ─────────────────────────── */

export type ExpiryArgs = { ref: string; title: string; url: string; expiresOn: string; days: number; renewUrl: string; price: string };

const EXPIRY = {
  hu: {
    subject: (d: number) => `Hirdetése ${d} nap múlva lejár | FODEL`,
    preheader: 'Egy kattintással meghosszabbíthatja további 6 hónapra.',
    heading: 'Hamarosan lejár a hirdetése',
    intro: (t: string, d: number, on: string) => `A(z) „${t}” hirdetése ${d} nap múlva lejár (${on}), ezután lekerül az oldalról.`,
    body: (price: string) => `Ha az ingatlan még eladó, hosszabbítsa meg további 6 hónapra (${price}). Fizethet bankkártyával vagy átutalással; a hosszabbítás a lejárat napjától számít, így egy napot sem veszít.`,
    cta: 'Hirdetés meghosszabbítása',
    view: 'Hirdetés megtekintése',
    labels: { ref: 'Azonosító', ends: 'Lejárat' },
    sold: 'Ha időközben eladta, nincs teendője. Ebben az esetben kérjük, jelezze nekünk egy válaszlevélben.',
  },
  nl: {
    subject: (d: number) => `Uw advertentie verloopt over ${d} dagen | FODEL`,
    preheader: 'Met één klik verlengt u met 6 maanden.',
    heading: 'Uw advertentie verloopt binnenkort',
    intro: (t: string, d: number, on: string) => `Uw advertentie „${t}” verloopt over ${d} dagen, op ${on}. Daarna verdwijnt ze van de site.`,
    body: (price: string) => `Is de woning nog te koop? Verleng dan met 6 maanden (${price}). U betaalt per kaart of overboeking; de verlenging gaat in op de vervaldatum, u verliest dus geen dag.`,
    cta: 'Advertentie verlengen',
    view: 'Advertentie bekijken',
    labels: { ref: 'Referentie', ends: 'Vervaldatum' },
    sold: 'Is de woning inmiddels verkocht? Laat het ons weten door deze e-mail te beantwoorden.',
  },
  en: {
    subject: (d: number) => `Your listing expires in ${d} days | FODEL`,
    preheader: 'One click extends it by 6 months.',
    heading: 'Your listing expires soon',
    intro: (t: string, d: number, on: string) => `Your listing “${t}” expires in ${d} days, on ${on}. After that it comes off the site.`,
    body: (price: string) => `If the property is still for sale, extend it by 6 months (${price}). You can pay by card or bank transfer; the extension starts on the expiry date, so you lose not a single day.`,
    cta: 'Extend listing',
    view: 'View listing',
    labels: { ref: 'Reference', ends: 'Expiry date' },
    sold: 'If it has sold in the meantime, let us know by replying to this email.',
  },
  de: {
    subject: (d: number) => `Ihr Inserat läuft in ${d} Tagen ab | FODEL`,
    preheader: 'Mit einem Klick verlängern Sie um 6 Monate.',
    heading: 'Ihr Inserat läuft bald ab',
    intro: (t: string, d: number, on: string) => `Ihr Inserat „${t}“ läuft in ${d} Tagen ab, am ${on}. Danach verschwindet es von der Website.`,
    body: (price: string) => `Ist die Immobilie noch zu haben, verlängern Sie um 6 Monate (${price}). Sie zahlen per Karte oder Überweisung; die Verlängerung beginnt am Ablauftag, Sie verlieren also keinen Tag.`,
    cta: 'Inserat verlängern',
    view: 'Inserat ansehen',
    labels: { ref: 'Referenz', ends: 'Ablaufdatum' },
    sold: 'Ist sie inzwischen verkauft? Teilen Sie es uns mit, indem Sie auf diese E-Mail antworten.',
  },
  fr: {
    subject: (d: number) => `Votre annonce expire dans ${d} jours | FODEL`,
    preheader: 'Un clic suffit pour la prolonger de 6 mois.',
    heading: 'Votre annonce expire bientôt',
    intro: (t: string, d: number, on: string) => `Votre annonce «\u00a0${t}\u00a0» expire dans ${d} jours, le ${on}. Elle sera ensuite retirée du site.`,
    body: (price: string) => `Si le bien est toujours à vendre, prolongez l’annonce de 6 mois (${price}). Vous pouvez payer par carte ou par virement\u00a0; la prolongation débute à la date d’expiration, vous ne perdez donc aucun jour.`,
    cta: 'Prolonger l’annonce',
    view: 'Voir l’annonce',
    labels: { ref: 'Référence', ends: 'Date d’expiration' },
    sold: 'Le bien est entre-temps vendu\u202f? Dites-le-nous en répondant à cet e-mail.',
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
    subject: 'Hirdetése lejárt: egy kattintással újra online lehet',
    preheader: 'Hosszabbítás után azonnal újra megjelenik.',
    heading: 'Lejárt a hirdetése',
    intro: (t: string) => `A(z) „${t}” hirdetés lejárt, és lekerült az oldalról. Az adatai és a fényképei megmaradtak.`,
    body: (price: string) => `Ha az ingatlan még eladó, hosszabbítsa meg 6 hónapra (${price}): a fizetés után a hirdetés azonnal újra megjelenik, ugyanazon a címen.`,
    cta: 'Hosszabbítás és újra online',
  },
  nl: {
    subject: 'Uw advertentie is verlopen: met één klik weer online',
    preheader: 'Na verlenging staat ze direct weer online.',
    heading: 'Uw advertentie is verlopen',
    intro: (t: string) => `De advertentie „${t}” is verlopen en staat niet meer op de site. Uw gegevens en foto's blijven bewaard.`,
    body: (price: string) => `Is de woning nog te koop? Verleng dan met 6 maanden (${price}): na betaling staat de advertentie direct weer online, op hetzelfde adres.`,
    cta: 'Verlengen en weer online',
  },
  en: {
    subject: 'Your listing has expired: one click and it is back online',
    preheader: 'After renewal it is back online straight away.',
    heading: 'Your listing has expired',
    intro: (t: string) => `The listing “${t}” has expired and is no longer on the site. Your details and photos have been kept.`,
    body: (price: string) => `If the property is still for sale, extend it by 6 months (${price}): after payment the listing is back online straight away, at the same address.`,
    cta: 'Extend and put back online',
  },
  de: {
    subject: 'Ihr Inserat ist abgelaufen: mit einem Klick wieder online',
    preheader: 'Nach der Verlängerung ist es sofort wieder online.',
    heading: 'Ihr Inserat ist abgelaufen',
    intro: (t: string) => `Das Inserat „${t}“ ist abgelaufen und nicht mehr auf der Website. Ihre Angaben und Fotos bleiben erhalten.`,
    body: (price: string) => `Ist die Immobilie noch zu haben, verlängern Sie um 6 Monate (${price}): Nach der Zahlung ist das Inserat sofort wieder online, unter derselben Adresse.`,
    cta: 'Verlängern und wieder online stellen',
  },
  fr: {
    subject: 'Votre annonce a expiré\u00a0: un clic et elle est de nouveau en ligne',
    preheader: 'Après la prolongation, elle est aussitôt de nouveau en ligne.',
    heading: 'Votre annonce a expiré',
    intro: (t: string) => `L’annonce «\u00a0${t}\u00a0» a expiré et n’est plus sur le site. Vos informations et vos photos sont conservées.`,
    body: (price: string) => `Si le bien est toujours à vendre, prolongez l’annonce de 6 mois (${price})\u00a0: après le paiement, elle est aussitôt de nouveau en ligne, à la même adresse.`,
    cta: 'Prolonger et remettre en ligne',
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
    subject: 'Hirdetését meghosszabbítottuk | FODEL',
    preheader: 'Az új lejárati dátum a levélben.',
    heading: 'Meghosszabbítva',
    intro: (t: string, on: string) => `A(z) „${t}” hirdetés új lejárata: ${on}. Köszönjük!`,
    cta: 'Hirdetés megtekintése',
  },
  nl: {
    subject: 'Uw advertentie is verlengd | FODEL',
    preheader: 'De nieuwe vervaldatum staat in deze e-mail.',
    heading: 'Verlengd',
    intro: (t: string, on: string) => `De advertentie „${t}” blijft online tot ${on}. Dank u wel!`,
    cta: 'Advertentie bekijken',
  },
  en: {
    subject: 'Your listing has been extended | FODEL',
    preheader: 'The new expiry date is in this email.',
    heading: 'Extended',
    intro: (t: string, on: string) => `The listing “${t}” now runs until ${on}. Thank you.`,
    cta: 'View listing',
  },
  de: {
    subject: 'Ihr Inserat wurde verlängert | FODEL',
    preheader: 'Das neue Ablaufdatum steht in dieser E-Mail.',
    heading: 'Verlängert',
    intro: (t: string, on: string) => `Das Inserat „${t}“ läuft nun bis ${on}. Vielen Dank.`,
    cta: 'Inserat ansehen',
  },
  fr: {
    subject: 'Votre annonce a été prolongée | FODEL',
    preheader: 'La nouvelle date d’expiration figure dans cet e-mail.',
    heading: 'Prolongée',
    intro: (t: string, on: string) => `L’annonce «\u00a0${t}\u00a0» reste en ligne jusqu’au ${on}. Merci.`,
    cta: 'Voir l’annonce',
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
    subject: (r: string) => `Hosszabbítás átutalással (#${r})`,
    preheader: 'Az átutalás adatai; a jóváírás után meghosszabbítjuk a hirdetést.',
    heading: 'Hosszabbítás átutalással',
    intro: (t: string) => `Köszönjük! A(z) „${t}” hirdetés hosszabbítását a díj beérkezése után rögzítjük.`,
    labels: { amount: 'Összeg', account: 'Bankszámla', reference: 'Közlemény' },
    note: 'Ha mégis bankkártyával fizetne, a lenti gombbal bármikor megteheti.',
    cta: 'Fizetési lehetőségek',
  },
  nl: {
    subject: (r: string) => `Verlenging per overboeking (#${r})`,
    preheader: 'De betaalgegevens; na ontvangst verlengen wij de advertentie.',
    heading: 'Verlenging per overboeking',
    intro: (t: string) => `Dank u! Wij verlengen de advertentie „${t}” zodra de betaling binnen is.`,
    labels: { amount: 'Bedrag', account: 'Rekening', reference: 'Omschrijving' },
    note: 'Toch liever per kaart betalen? Dat kan altijd via de knop hieronder.',
    cta: 'Betaalmogelijkheden',
  },
  en: {
    subject: (r: string) => `Extension by bank transfer (#${r})`,
    preheader: 'The payment details; once it arrives we extend the listing.',
    heading: 'Extension by bank transfer',
    intro: (t: string) => `Thank you. We extend the listing “${t}” as soon as the payment arrives.`,
    labels: { amount: 'Amount', account: 'Account', reference: 'Reference' },
    note: 'Prefer to pay by card after all? You can always do so with the button below.',
    cta: 'Ways to pay',
  },
  de: {
    subject: (r: string) => `Verlängerung per Überweisung (#${r})`,
    preheader: 'Die Zahlungsdaten; nach Zahlungseingang verlängern wir das Inserat.',
    heading: 'Verlängerung per Überweisung',
    intro: (t: string) => `Vielen Dank. Wir verlängern das Inserat „${t}“, sobald die Zahlung eingegangen ist.`,
    labels: { amount: 'Betrag', account: 'Konto', reference: 'Verwendungszweck' },
    note: 'Lieber doch mit Karte zahlen? Das geht jederzeit über die Schaltfläche unten.',
    cta: 'Zahlungsmöglichkeiten',
  },
  fr: {
    subject: (r: string) => `Prolongation par virement (#${r})`,
    preheader: 'Les coordonnées de paiement\u00a0; à réception, nous prolongeons l’annonce.',
    heading: 'Prolongation par virement',
    intro: (t: string) => `Merci. Nous prolongeons l’annonce «\u00a0${t}\u00a0» dès que le paiement arrive.`,
    labels: { amount: 'Montant', account: 'Compte', reference: 'Référence' },
    note: 'Vous préférez finalement payer par carte\u202f? C’est toujours possible avec le bouton ci-dessous.',
    cta: 'Moyens de paiement',
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
    subject: (t: string, r: boolean) => `${r ? 'Emlékeztető: ' : ''}Még eladó? · ${t}`,
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
    subject: (t: string, r: boolean) => `${r ? 'Herinnering: ' : ''}Nog te koop? · ${t}`,
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
  en: {
    subject: (t: string, r: boolean) => `${r ? 'Reminder: ' : ''}Still for sale? · ${t}`,
    preheader: 'One click, no sign-in.',
    heading: 'Is the property still for sale?',
    intro: (t: string, price: string) => `Once a month we ask whether the listing “${t}” (${price}) is still current. Buyers trust listings that are accurate.`,
    reminder: 'We asked you a week ago, but have not had an answer yet.',
    still: 'Yes, still for sale',
    price: 'The price has changed',
    sold: 'Sold',
    how: 'One click is enough, no need to sign in. We update a new price straight away.',
    valid: (d: string) => `The links are valid until ${d}.`,
  },
  de: {
    subject: (t: string, r: boolean) => `${r ? 'Erinnerung: ' : ''}Noch zu verkaufen? · ${t}`,
    preheader: 'Ein Klick, ohne Anmeldung.',
    heading: 'Ist die Immobilie noch zu verkaufen?',
    intro: (t: string, price: string) => `Einmal im Monat fragen wir, ob das Inserat „${t}“ (${price}) noch aktuell ist. Käufer vertrauen Inseraten, die stimmen.`,
    reminder: 'Wir haben Sie vor einer Woche danach gefragt, aber noch keine Antwort erhalten.',
    still: 'Ja, noch zu verkaufen',
    price: 'Der Preis hat sich geändert',
    sold: 'Verkauft',
    how: 'Ein Klick genügt, eine Anmeldung ist nicht nötig. Einen neuen Preis übernehmen wir sofort.',
    valid: (d: string) => `Die Links sind bis ${d} gültig.`,
  },
  fr: {
    subject: (t: string, r: boolean) => `${r ? 'Rappel\u00a0: ' : ''}Toujours à vendre\u202f? · ${t}`,
    preheader: 'Un clic, sans connexion.',
    heading: 'Le bien est-il toujours à vendre\u202f?',
    intro: (t: string, price: string) => `Une fois par mois, nous demandons si l’annonce «\u00a0${t}\u00a0» (${price}) est toujours d’actualité. Les acheteurs font confiance aux annonces exactes.`,
    reminder: 'Nous vous avons posé la question il y a une semaine, sans réponse pour le moment.',
    still: 'Oui, toujours à vendre',
    price: 'Le prix a changé',
    sold: 'Vendu',
    how: 'Un clic suffit, sans connexion. Un nouveau prix est mis à jour aussitôt.',
    valid: (d: string) => `Les liens sont valables jusqu’au ${d}.`,
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
  const subject = a.kind === 'price' ? `Árváltozás a tulajdonostól (#${a.ref})` : `A tulajdonos eladottnak jelölte (#${a.ref})`;
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
    subject: 'Erősítse meg a feliratkozást | FODEL hírlevél',
    preheader: 'Egy kattintás, és küldjük az új ingatlanokat.',
    heading: 'Még egy kattintás',
    intro: 'Köszönjük, hogy feliratkozott a FODEL hírlevelére. Kérjük, erősítse meg, hogy valóban Ön kérte. Csak ezután küldünk levelet.',
    cta: 'Feliratkozás megerősítése',
    ignore: 'Ha nem Ön iratkozott fel, hagyja figyelmen kívül ezt a levelet: megerősítés nélkül nem küldünk semmit.',
    unsubscribe: 'Leiratkozás',
    why: 'Ezt a levelet azért kapja, mert ezzel a címmel feliratkoztak a FODEL hírlevelére.',
  },
  nl: {
    subject: 'Bevestig uw inschrijving | FODEL nieuwsbrief',
    preheader: 'Eén klik, en u ontvangt het nieuwe aanbod.',
    heading: 'Nog één klik',
    intro: 'Bedankt voor uw inschrijving op de FODEL-nieuwsbrief. Bevestig dat u dit zelf heeft aangevraagd. Pas daarna sturen wij u iets.',
    cta: 'Inschrijving bevestigen',
    ignore: 'Heeft u zich niet ingeschreven? Negeer deze e-mail dan: zonder bevestiging sturen wij niets.',
    unsubscribe: 'Uitschrijven',
    why: 'U ontvangt deze e-mail omdat dit adres is ingeschreven voor de FODEL-nieuwsbrief.',
  },
  en: {
    subject: 'Confirm your subscription | FODEL newsletter',
    preheader: 'One click, and we will send you new listings.',
    heading: 'One more click',
    intro: 'Thank you for subscribing to the FODEL newsletter. Please confirm it was you. We send nothing until you do.',
    cta: 'Confirm subscription',
    ignore: 'If you did not subscribe, simply ignore this email: without confirmation we send nothing.',
    unsubscribe: 'Unsubscribe',
    why: 'You are receiving this email because this address was subscribed to the FODEL newsletter.',
  },
  de: {
    subject: 'Bitte bestätigen Sie Ihr Abonnement | FODEL-Newsletter',
    preheader: 'Ein Klick, und wir senden Ihnen neue Angebote.',
    heading: 'Noch ein Klick',
    intro: 'Vielen Dank für Ihre Anmeldung zum FODEL-Newsletter. Bitte bestätigen Sie, dass Sie es waren. Vorher senden wir nichts.',
    cta: 'Anmeldung bestätigen',
    ignore: 'Wenn Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail einfach: ohne Bestätigung senden wir nichts.',
    unsubscribe: 'Abmelden',
    why: 'Sie erhalten diese E-Mail, weil diese Adresse für den FODEL-Newsletter angemeldet wurde.',
  },
  fr: {
    subject: 'Confirmez votre inscription | Lettre d’information FODEL',
    preheader: 'Un clic, et nous vous envoyons les nouveaux biens.',
    heading: 'Encore un clic',
    intro: 'Merci de vous être inscrit à la lettre d’information de FODEL. Veuillez confirmer que c’est bien vous. Nous n’envoyons rien avant.',
    cta: 'Confirmer l’inscription',
    ignore: 'Si vous ne vous êtes pas inscrit, ignorez simplement cet e-mail\u00a0: sans confirmation, nous n’envoyons rien.',
    unsubscribe: 'Se désabonner',
    why: 'Vous recevez cet e-mail parce que cette adresse a été inscrite à la lettre d’information de FODEL.',
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
