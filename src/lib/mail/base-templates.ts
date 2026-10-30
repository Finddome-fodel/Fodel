/**
 * The starting points for a new mail template, in FINDDOME's own look.
 *
 *   property  — a listing presented to one person: greeting, the main photo,
 *               title, description, three facts, the "view listing" button,
 *               who FINDDOME is, how to reach us. The reply to an enquiry.
 *   general   — a letter with a heading, a few paragraphs and one button:
 *               news to owners, a newsletter, an announcement.
 *
 * Written once per language (hu, nl, en, de — the languages FINDDOME's buyers
 * and sellers actually write in); any other language starts from English and
 * is translated in the editor. Every piece of copy sits in a simple-editor
 * marker, so nothing here needs HTML to change. Everything about the listing
 * — title, place, description, floor area, rooms, price, link and the main
 * photo — is a merge field, filled at send time from the listing the email is
 * about. That is what lets one template answer enquiries about every listing
 * (the automatic reply), and a price change reach the email by itself.
 *
 * The HTML follows the same rules as the lifecycle mails (src/lib/email/layout.ts):
 * tables, inline styles, the wordmark set in text, sans fallbacks only, no pure
 * white or black. Company facts (phone, address, KvK) are copied in from the
 * live settings when the template is created — the saved template is a fixed
 * document, so a later edit of the settings does not rewrite sent history.
 */
import type { Company } from '~/lib/runtime-config';
import { TEMPLATE_PLACEHOLDER_PREFIX } from './editable';

export type BaseKind = 'property' | 'general';
export const BASE_LOCALES = ['hu', 'nl', 'en', 'de'] as const;
export type BaseLocale = (typeof BASE_LOCALES)[number];
export const baseLocaleOf = (locale: string): BaseLocale =>
  (BASE_LOCALES as readonly string[]).includes(locale) ? (locale as BaseLocale) : 'en';

/* ── Palette (src/styles/tokens.css, as in src/email/layout.ts) ─────────── */
const INK = '#102a43';
const CREAM = '#f4f4f2';
const LINEN = '#ecedef';
const PAPER = '#fdfdfc';
const TAUPE = '#475457';
const BORDER = '#d0d4d6';
const SOFT = '#9aa5b1';
const DISPLAY = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SANS = "'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const P = TEMPLATE_PLACEHOLDER_PREFIX;

type Copy = {
  propertySubject: string;
  generalSubject: string;
  preheader: string;
  eyebrow: string;
  greeting: string;
  intro: string;
  locationEyebrow: string;
  stat1Label: string;
  stat2Label: string;
  stat3Label: string;
  cta: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutText: string;
  contactEyebrow: string;
  contactTitle: string;
  contactText: string;
  callButton: string;
  mailButton: string;
  disclaimer: string;
  generalPreheader: string;
  generalEyebrow: string;
  generalTitle: string;
  generalBody: string;
  generalGreeting: string;
  generalCta: string;
  generalDisclaimer: string;
  registration: string;
};

const COPY: Record<BaseLocale, Copy> = {
  hu: {
    propertySubject: '{{property_title}} – az ingatlan részletei',
    generalSubject: 'Hírek a FINDDOME-tól',
    preheader: 'Megkaptuk érdeklődését – íme az ingatlan legfontosabb adatai.',
    eyebrow: 'Megkaptuk érdeklődését',
    greeting: 'Kedves {{first_name}}!',
    intro: 'Köszönjük érdeklődését a következő ingatlan iránt: „{{property_title}}”. Megkaptuk üzenetét, kollégánk hamarosan személyesen is felveszi Önnel a kapcsolatot. Addig is összegyűjtöttük az ingatlan legfontosabb adatait.',
    locationEyebrow: '{{property_location}}',
    stat1Label: 'Alapterület',
    stat2Label: 'Szobák',
    stat3Label: 'Irányár',
    cta: 'Hirdetés megtekintése',
    aboutEyebrow: 'Miért a FINDDOME?',
    aboutTitle: 'Holland–magyar ingatlanközvetítés',
    aboutText: 'Magyarországi ingatlanokat mutatunk be holland és nyugat-európai vevőknek. Válaszolunk a kérdéseire, megszervezzük a megtekintést, és a vásárlás minden lépésében Ön mellett állunk – problémamentesen és diszkréten.',
    contactEyebrow: 'Beszéljünk',
    contactTitle: 'Kérdése van az ingatlannal kapcsolatban?',
    contactText: 'Nem kell megvárnia, amíg jelentkezünk: telefonon vagy e-mailben közvetlenül is elér minket.',
    callButton: 'Hívjon minket',
    mailButton: 'Írjon nekünk',
    disclaimer: 'Ezt az e-mailt azért kapja, mert a FINDDOME weboldalán érdeklődött egy ingatlan iránt. Az ingatlan adatai tájékoztató jellegűek; az aktuális elérhetőségről és a feltételekről egyeztetünk Önnel.',
    generalPreheader: `${P} egy mondat, ami a postafiók listájában a tárgy mellett látszik]`,
    generalEyebrow: 'FINDDOME hírek',
    generalTitle: `${P} a levél címe]`,
    generalBody: `${P} a levél szövege. Üres sorral kezdhet új bekezdést.]`,
    generalGreeting: 'Kedves Olvasónk!',
    generalCta: 'Tovább a FINDDOME oldalára',
    generalDisclaimer: 'Ezt az e-mailt azért kapja, mert kapcsolatban áll a FINDDOME-mal.',
    registration: 'KvK',
  },
  nl: {
    propertySubject: '{{property_title}} – de gevraagde details',
    generalSubject: 'Nieuws van FINDDOME',
    preheader: 'Wij hebben uw interesse ontvangen – hier zijn de details van de woning.',
    eyebrow: 'Interesse ontvangen',
    greeting: 'Beste {{first_name}},',
    intro: 'Dank u voor uw interesse in „{{property_title}}”. Wij hebben uw bericht ontvangen en een collega neemt binnenkort persoonlijk contact met u op. Alvast de belangrijkste gegevens op een rij.',
    locationEyebrow: '{{property_location}}',
    stat1Label: 'Woonoppervlak',
    stat2Label: 'Kamers',
    stat3Label: 'Vraagprijs',
    cta: 'Bekijk de advertentie',
    aboutEyebrow: 'Waarom FINDDOME?',
    aboutTitle: 'Nederlands-Hongaarse vastgoedbemiddeling',
    aboutText: 'Wij brengen Hongaarse woningen onder de aandacht van kopers in Nederland en de rest van Europa. Wij beantwoorden uw vragen, plannen de bezichtiging en begeleiden u bij elke stap van de aankoop – probleemloos en discreet.',
    contactEyebrow: 'Contact',
    contactTitle: 'Heeft u een vraag over deze woning?',
    contactText: 'U hoeft niet te wachten tot wij contact opnemen: u bereikt ons ook direct per telefoon of e-mail.',
    callButton: 'Bel ons',
    mailButton: 'Mail ons',
    disclaimer: 'U ontvangt deze e-mail omdat u via de FINDDOME-website interesse in een woning heeft getoond. De gegevens van de woning zijn indicatief; actuele beschikbaarheid en voorwaarden in overleg.',
    generalPreheader: `${P} één zin die in de inbox naast het onderwerp verschijnt]`,
    generalEyebrow: 'Nieuws van FINDDOME',
    generalTitle: `${P} de titel van de brief]`,
    generalBody: `${P} de tekst van de brief. Een lege regel begint een nieuwe alinea.]`,
    generalGreeting: 'Beste lezer,',
    generalCta: 'Naar FINDDOME',
    generalDisclaimer: 'U ontvangt deze e-mail omdat u contact heeft met FINDDOME.',
    registration: 'KvK',
  },
  en: {
    propertySubject: '{{property_title}} – the details you asked for',
    generalSubject: 'News from FINDDOME',
    preheader: 'We have received your enquiry – here are the details of the property.',
    eyebrow: 'Enquiry received',
    greeting: 'Dear {{first_name}},',
    intro: 'Thank you for your interest in “{{property_title}}”. We have received your message and a colleague will be in touch with you personally soon. In the meantime, here are the key facts.',
    locationEyebrow: '{{property_location}}',
    stat1Label: 'Floor area',
    stat2Label: 'Rooms',
    stat3Label: 'Asking price',
    cta: 'View the listing',
    aboutEyebrow: 'Why FINDDOME?',
    aboutTitle: 'Dutch–Hungarian property agency',
    aboutText: 'We present properties in Hungary to buyers in the Netherlands and across Europe. We answer your questions, arrange viewings and guide you through every step of the purchase – hassle-free and discreet.',
    contactEyebrow: 'Get in touch',
    contactTitle: 'A question about this property?',
    contactText: 'No need to wait for us to get in touch: you can reach us directly by phone or email.',
    callButton: 'Call us',
    mailButton: 'Email us',
    disclaimer: 'You are receiving this email because you enquired about a property on the FINDDOME website. Property details are indicative; current availability and terms are subject to confirmation.',
    generalPreheader: `${P} one sentence shown next to the subject in the inbox]`,
    generalEyebrow: 'News from FINDDOME',
    generalTitle: `${P} the headline of the letter]`,
    generalBody: `${P} the text of the letter. A blank line starts a new paragraph.]`,
    generalGreeting: 'Dear reader,',
    generalCta: 'Visit FINDDOME',
    generalDisclaimer: 'You are receiving this email because you are in contact with FINDDOME.',
    registration: 'Chamber of Commerce (KvK)',
  },
  de: {
    propertySubject: '{{property_title}} – die gewünschten Details',
    generalSubject: 'Neuigkeiten von FINDDOME',
    preheader: 'Wir haben Ihre Anfrage erhalten – hier sind die Details der Immobilie.',
    eyebrow: 'Anfrage erhalten',
    greeting: 'Guten Tag {{full_name}},',
    intro: 'Vielen Dank für Ihr Interesse an „{{property_title}}“. Wir haben Ihre Nachricht erhalten, und ein Mitarbeiter meldet sich in Kürze persönlich bei Ihnen. Vorab finden Sie hier die wichtigsten Angaben.',
    locationEyebrow: '{{property_location}}',
    stat1Label: 'Wohnfläche',
    stat2Label: 'Zimmer',
    stat3Label: 'Kaufpreis',
    cta: 'Inserat ansehen',
    aboutEyebrow: 'Warum FINDDOME?',
    aboutTitle: 'Niederländisch-ungarische Immobilienvermittlung',
    aboutText: 'Wir bringen Immobilien in Ungarn mit Käufern aus den Niederlanden und ganz Europa zusammen. Wir beantworten Ihre Fragen, organisieren Besichtigungen und begleiten Sie bei jedem Schritt des Kaufs – unkompliziert und diskret.',
    contactEyebrow: 'Kontakt',
    contactTitle: 'Eine Frage zu dieser Immobilie?',
    contactText: 'Sie müssen nicht warten, bis wir uns melden: Sie erreichen uns direkt per Telefon oder E-Mail.',
    callButton: 'Rufen Sie uns an',
    mailButton: 'E-Mail schreiben',
    disclaimer: 'Sie erhalten diese E-Mail, weil Sie über die FINDDOME-Website eine Immobilie angefragt haben. Die Angaben zur Immobilie sind unverbindlich; Verfügbarkeit und Konditionen nach Absprache.',
    generalPreheader: `${P} ein Satz, der im Posteingang neben dem Betreff erscheint]`,
    generalEyebrow: 'Neuigkeiten von FINDDOME',
    generalTitle: `${P} die Überschrift des Briefs]`,
    generalBody: `${P} der Text des Briefs. Eine Leerzeile beginnt einen neuen Absatz.]`,
    generalGreeting: 'Liebe Leserin, lieber Leser,',
    generalCta: 'Zu FINDDOME',
    generalDisclaimer: 'Sie erhalten diese E-Mail, weil Sie mit FINDDOME in Kontakt stehen.',
    registration: 'Handelsregister (KvK)',
  },
};

/** The simple-editor label of every marked spot. Hungarian: the admin reads it, not the recipient. */
const LABEL = {
  preheader: 'Rejtett előnézeti szöveg (a postafiók listájában a tárgy mellett látszik)',
  eyebrow: 'Felső felirat',
  greeting: 'Megszólítás',
  intro: 'Bevezető szöveg',
  location_eyebrow: 'Helyszín-felirat (a fotó alatt)',
  hero_title: 'Főcím',
  description: 'Leírás',
  stat1_label: '1. adat felirata',
  stat1_value: '1. adat értéke',
  stat2_label: '2. adat felirata',
  stat2_value: '2. adat értéke',
  stat3_label: '3. adat felirata',
  stat3_value: '3. adat értéke (irányár)',
  cta_text: 'Gomb szövege',
  cta_url: 'Gomb linkje',
  about_eyebrow: '„Miért mi” felirat',
  about_title: '„Miért mi” cím',
  about_text: '„Miért mi” szöveg',
  contact_eyebrow: 'Kapcsolat felirat',
  contact_title: 'Kapcsolat cím',
  contact_text: 'Kapcsolat szöveg',
  call_button: 'Telefon gomb szövege',
  mail_button: 'E-mail gomb szövege',
  disclaimer: 'Lábléc: tájékoztató szöveg',
  title: 'A levél címe',
  body: 'A levél szövege',
  main_photo: 'Fő fotó',
} as const;

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const edit = (key: keyof typeof LABEL, text: string) =>
  `<span data-editable="${key}" data-editable-label="${esc(LABEL[key])}">${esc(text)}</span>`;

function button(label: string, href: string, opts: { key: keyof typeof LABEL; linkKey?: keyof typeof LABEL; ghost?: boolean }): string {
  const bg = opts.ghost ? PAPER : INK;
  const fg = opts.ghost ? INK : CREAM;
  const border = opts.ghost ? `border:1.5px solid ${INK};` : '';
  const link = opts.linkKey ? ` data-editable-link="${opts.linkKey}" data-editable-label="${esc(LABEL[opts.linkKey])}"` : '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="cta" style="display:inline-table;margin:0 6px 10px 0;">
  <tr><td align="center" bgcolor="${bg}" style="background-color:${bg};border-radius:999px;">
    <a${link} href="${esc(href)}" style="display:inline-block;${border}padding:${opts.ghost ? '13.5px 28.5px' : '15px 30px'};font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${fg};text-decoration:none;border-radius:999px;">${edit(opts.key, label)}&nbsp;&rarr;</a>
  </td></tr>
</table>`;
}

const eyebrowStyle = `font-family:${SANS};font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:${TAUPE};`;

function head(title: string, locale: string): string {
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<title>${esc(title)}</title>
<style>
html,body{margin:0!important;padding:0!important;width:100%!important;background:${CREAM}}
table,td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}
img{border:0;outline:none;text-decoration:none;display:block;max-width:100%;height:auto}
@media only screen and (max-width:700px){.shell{width:100%!important}.px{padding-left:24px!important;padding-right:24px!important}.title{font-size:30px!important}.stat{display:block!important;width:100%!important;border-right:0!important;border-bottom:1px solid ${BORDER}!important;padding:12px 0!important}.cta{display:table!important;width:100%!important}.cta a{display:block!important}.stack{display:block!important;width:100%!important;text-align:left!important}}
</style>
</head>
<body style="margin:0;padding:0;background:${CREAM};">`;
}

function wordmark(company: Company, locale: BaseLocale, siteUrl: string): string {
  const sub = (company.names?.[locale] ?? 'FINDDOME').replace(/finddome/i, '').trim() || 'Real Estates';
  return `<a href="${siteUrl}/${locale}/" style="text-decoration:none;">
  <span style="display:block;font-family:${DISPLAY};font-size:19px;font-weight:500;letter-spacing:0.34em;text-transform:uppercase;color:${INK};">FINDDOME</span>
  <span style="display:block;width:34px;height:1px;background-color:${INK};font-size:0;line-height:0;margin:9px 0 8px;">&nbsp;</span>
  <span style="display:block;font-family:${SANS};font-size:9.5px;letter-spacing:0.30em;text-transform:uppercase;color:${TAUPE};">${esc(sub)}</span>
</a>`;
}

function footer(company: Company, locale: BaseLocale, siteUrl: string, disclaimer: string): string {
  const c = COPY[locale];
  const phone = company.phones.find((p) => p.public) ?? company.phones[0];
  const email = company.email?.primary ?? 'info@finddome.com';
  const host = siteUrl.replace(/^https?:\/\//, '');
  const kvk = company.registration?.kvk ? `${c.registration}: ${esc(company.registration.kvk)}` : '';
  return `<tr><td class="px" style="padding:30px 44px;background-color:${INK};border-radius:0 0 24px 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td class="stack" valign="top" style="padding-right:20px;">
      <div style="font-family:${DISPLAY};font-size:15px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:${CREAM};">FINDDOME</div>
      <div style="font-family:${SANS};font-size:12px;line-height:1.7;color:${SOFT};margin-top:10px;">${esc(company.address?.oneLine ?? '')}${kvk ? `<br>${kvk}` : ''}</div>
    </td>
    <td class="stack" valign="top" align="right" style="font-family:${SANS};font-size:12px;line-height:1.8;color:${SOFT};padding-top:2px;">
      ${phone ? `<a href="${esc(phone.href)}" style="color:${CREAM};text-decoration:none;">${esc(phone.display)}</a><br>` : ''}
      <a href="mailto:${esc(email)}" style="color:${CREAM};text-decoration:underline;text-underline-offset:2px;">${esc(email)}</a><br>
      <a href="${siteUrl}/${locale}/" style="color:${CREAM};text-decoration:underline;text-underline-offset:2px;">${esc(host)}</a>
    </td>
  </tr></table>
  <div style="font-family:${SANS};font-size:10.5px;line-height:1.6;color:${SOFT};margin-top:22px;padding-top:16px;border-top:1px solid rgba(244,244,242,0.14);">${edit('disclaimer', disclaimer)}</div>
</td></tr>`;
}

function propertyTemplate(company: Company, locale: BaseLocale, siteUrl: string): string {
  const c = COPY[locale];
  const phone = company.phones.find((p) => p.public) ?? company.phones[0];
  const email = company.email?.primary ?? 'info@finddome.com';
  const stat = (labelKey: 'stat1_label' | 'stat2_label' | 'stat3_label', valueKey: 'stat1_value' | 'stat2_value' | 'stat3_value', label: string, value: string, last = false) =>
    `<td class="stat" width="33%" valign="top" style="padding:16px 14px 16px ${labelKey === 'stat1_label' ? '0' : '16px'};${last ? '' : `border-right:1px solid ${BORDER};`}">
      <div style="font-family:${SANS};font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;color:${TAUPE};">${edit(labelKey, label)}</div>
      <div style="font-family:${DISPLAY};font-size:21px;font-weight:600;color:${INK};margin-top:6px;">${edit(valueKey, value)}</div>
    </td>`;

  return `${head('{{property_title}} – FINDDOME', locale)}
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;font-size:1px;">${edit('preheader', c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CREAM}"><tr><td align="center" style="padding:28px 12px 44px;">
<table role="presentation" width="640" class="shell" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;background-color:${PAPER};border-radius:24px;">
  <tr><td class="px" style="padding:30px 44px 26px;border-bottom:1px solid ${LINEN};">${wordmark(company, locale, siteUrl)}</td></tr>
  <tr><td class="px" style="padding:40px 44px 30px;">
    <div style="${eyebrowStyle}margin-bottom:16px;">${edit('eyebrow', c.eyebrow)}</div>
    <div style="font-family:${DISPLAY};font-size:24px;line-height:1.25;font-weight:600;color:${INK};margin-bottom:16px;">${edit('greeting', c.greeting)}</div>
    <div style="font-family:${SANS};font-size:16px;line-height:1.75;color:${TAUPE};">${edit('intro', c.intro)}</div>
  </td></tr>
  <tr><td style="padding:0 24px;"><img data-editable-image="main_photo" data-editable-label="${esc(LABEL.main_photo)}" src="{{property_photo_url}}" width="592" alt="{{property_title}}" style="width:592px;border-radius:20px;"></td></tr>
  <tr><td class="px" style="padding:30px 44px 38px;">
    <div style="${eyebrowStyle}margin-bottom:10px;">${edit('location_eyebrow', c.locationEyebrow)}</div>
    <div class="title" style="font-family:${DISPLAY};font-size:34px;line-height:1.12;font-weight:600;color:${INK};">${edit('hero_title', '{{property_title}}')}</div>
    <div style="font-family:${SANS};font-size:15px;line-height:1.75;color:${TAUPE};margin-top:16px;">${edit('description', '{{property_description}}')}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};"><tr>
      ${stat('stat1_label', 'stat1_value', c.stat1Label, '{{property_area}}')}
      ${stat('stat2_label', 'stat2_value', c.stat2Label, '{{property_rooms}}')}
      ${stat('stat3_label', 'stat3_value', c.stat3Label, '{{property_price}}', true)}
    </tr></table>
    <div style="margin-top:28px;">${button(c.cta, '{{property_url}}', { key: 'cta_text' })}</div>
  </td></tr>
  <tr><td class="px" style="padding:38px 44px;background-color:${LINEN};">
    <div style="${eyebrowStyle}margin-bottom:12px;">${edit('about_eyebrow', c.aboutEyebrow)}</div>
    <div style="font-family:${DISPLAY};font-size:26px;line-height:1.2;font-weight:600;color:${INK};">${edit('about_title', c.aboutTitle)}</div>
    <div style="font-family:${SANS};font-size:15px;line-height:1.75;color:${TAUPE};margin-top:14px;">${edit('about_text', c.aboutText)}</div>
  </td></tr>
  <tr><td class="px" align="center" style="padding:42px 44px;text-align:center;">
    <div style="${eyebrowStyle}">${edit('contact_eyebrow', c.contactEyebrow)}</div>
    <div style="font-family:${DISPLAY};font-size:26px;line-height:1.2;font-weight:600;color:${INK};margin-top:12px;">${edit('contact_title', c.contactTitle)}</div>
    <div style="font-family:${SANS};font-size:15px;line-height:1.7;color:${TAUPE};max-width:460px;margin:14px auto 24px;">${edit('contact_text', c.contactText)}</div>
    ${phone ? button(c.callButton, phone.href, { key: 'call_button' }) : ''}${button(c.mailButton, `mailto:${email}`, { key: 'mail_button', ghost: true })}
  </td></tr>
  <!--signature-->
  ${footer(company, locale, siteUrl, c.disclaimer)}
</table>
</td></tr></table>
</body>
</html>
`;
}

function generalTemplate(company: Company, locale: BaseLocale, siteUrl: string): string {
  const c = COPY[locale];
  return `${head('FINDDOME', locale)}
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;font-size:1px;">${edit('preheader', c.generalPreheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CREAM}"><tr><td align="center" style="padding:28px 12px 44px;">
<table role="presentation" width="640" class="shell" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;background-color:${PAPER};border-radius:24px;">
  <tr><td class="px" style="padding:30px 44px 26px;border-bottom:1px solid ${LINEN};">${wordmark(company, locale, siteUrl)}</td></tr>
  <tr><td class="px" style="padding:40px 44px 42px;">
    <div style="${eyebrowStyle}margin-bottom:16px;">${edit('eyebrow', c.generalEyebrow)}</div>
    <div class="title" style="font-family:${DISPLAY};font-size:32px;line-height:1.15;font-weight:600;color:${INK};margin-bottom:22px;">${edit('title', c.generalTitle)}</div>
    <div style="font-family:${DISPLAY};font-size:18px;line-height:1.4;font-weight:600;color:${INK};margin-bottom:14px;">${edit('greeting', c.generalGreeting)}</div>
    <div style="font-family:${SANS};font-size:16px;line-height:1.75;color:${TAUPE};white-space:pre-line;">${edit('body', c.generalBody)}</div>
    <div style="margin-top:30px;">${button(c.generalCta, `${siteUrl}/${locale}/`, { key: 'cta_text', linkKey: 'cta_url' })}</div>
  </td></tr>
  <!--signature-->
  ${footer(company, locale, siteUrl, c.generalDisclaimer)}
</table>
</td></tr></table>
</body>
</html>
`;
}

export function baseTemplate(kind: BaseKind, locale: string, company: Company, siteUrl: string): { subject: string; html: string; locale: BaseLocale } {
  const lang = baseLocaleOf(locale);
  return kind === 'property'
    ? { subject: COPY[lang].propertySubject, html: propertyTemplate(company, lang, siteUrl), locale: lang }
    : { subject: COPY[lang].generalSubject, html: generalTemplate(company, lang, siteUrl), locale: lang };
}
