/**
 * Email preview — development, or a signed-in admin in production.
 *
 * FODEL 1.2's architecture review recommended cutting `email_overrides`
 * entirely: a database-backed copy editor re-creates the exact bug
 * `nl.ts satisfies typeof HU` exists to prevent (an override with no
 * translated counterpart, uncaught, in production email), and has no sane
 * deep-merge semantics for `welcome.steps` (an array) or
 * `adminNewSubmission.labels` (a nested map). What FODEL actually need is to
 * *see* the emails and tell a developer what to change — so this stays the
 * one preview surface, gated instead of hard-404'd, rather than duplicated
 * behind a second, database-backed editor.
 *
 * In `astro dev` it is open to anyone, same as always. In production it 404s
 * for everyone except a signed-in admin — still renders arbitrary templates
 * with fixture data, never real customer data, so the risk is "a competitor
 * sees our email copy," not a data leak.
 *
 *   /dev/emails                            → index of everything
 *   /dev/emails?t=published&locale=nl      → rendered HTML
 *   /dev/emails?t=published&format=text    → the plain-text alternative
 */
import type { APIRoute } from 'astro';
import { templates } from '~/lib/email/templates';
import type { BuiltEmail } from '~/lib/email/templates';
import { SITE_URL } from '~/config/site.mjs';
import { createSupabaseServerClient } from '~/lib/supabase-server';
import { buildInvite } from '~/lib/portal/invites';
import { HU_OWNER_INVITE } from '~/data/invite-letter';
import { lifecycleEmails } from '~/lib/email/lifecycle';
import { LOCALES, localizer, path, type Locale } from '~/i18n/ui';

export const prerender = false;

const SAMPLE_REF = '7213';
const SAMPLE_TITLE = 'Felújított parasztház a Balaton-felvidéken';
const SAMPLE_TOKEN = 'a'.repeat(64);
const sampleUrl = (l: Locale) => `${SITE_URL}/${l}/${l === 'hu' ? 'haz-elado' : 'house-for-sale'}-${SAMPLE_REF}/`;

/** One sample sentence per language: `say(l)(hu, nl, en, de, fr)`. */
const say = (locale: Locale) => localizer(locale);
const TITLES: Record<Locale, string> = {
  hu: SAMPLE_TITLE,
  nl: 'Gerenoveerde boerderij in het Balatonhoogland',
  en: 'Renovated farmhouse in the Balaton Uplands',
  de: 'Renoviertes Bauernhaus im Balaton-Oberland',
  fr: 'Ferme rénovée dans les hauts plateaux du Balaton',
};

/**
 * Order lines are stored in the *owner's* language (see buildOrderLines in
 * src/lib/orders.ts), so the fixture has to vary too — a Dutch preview showing
 * Hungarian line items would look like a bug that isn't one, and would hide a
 * real one if it ever appeared.
 */
const SAMPLE_ORDER: Record<Locale, { label: string; amount: string }[]> = {
  hu: [
    { label: 'Hirdetés — 12 hónap', amount: '€ 129' },
    { label: 'Fordítás — 2 nyelv', amount: '€ 50' },
    { label: 'Videós bemutató', amount: '€ 36' },
  ],
  nl: [
    { label: 'Advertentie — 12 maanden', amount: '€ 129' },
    { label: 'Vertaling — 2 talen', amount: '€ 50' },
    { label: 'Videopresentatie', amount: '€ 36' },
  ],
  en: [
    { label: 'Listing — 12 months', amount: '€129' },
    { label: 'Translation — 2 languages', amount: '€50' },
    { label: 'Video presentation', amount: '€36' },
  ],
  de: [
    { label: 'Inserat — 12 Monate', amount: '129 €' },
    { label: 'Übersetzung — 2 Sprachen', amount: '50 €' },
    { label: 'Videopräsentation', amount: '36 €' },
  ],
  fr: [
    { label: 'Annonce — 12 mois', amount: '129 €' },
    { label: 'Traduction — 2 langues', amount: '50 €' },
    { label: 'Présentation vidéo', amount: '36 €' },
  ],
};

/** A stand-in Supabase client whose email_templates hold the approved HU owner letter. */
const approvedStub = {
  from: () => ({
    select: () => ({
      eq: async () => ({ data: [{ locale: 'hu', approved: true, ...HU_OWNER_INVITE }], error: null }),
    }),
  }),
};

const SAMPLE_INVITE = {
  subject: '[MINTA] Meghívó a FODEL portálra',
  heading: '[MINTA] Meghívó',
  body: 'Ez mintaszöveg. A végleges meghívószöveget Gábor és Éva adja meg a Beállítások → Meghívólevelek oldalon.',
  cta: 'Meghívó elfogadása',
};

/** Every template with sample arguments that exercise its longest branch. */
const CASES: Record<string, (locale: Locale) => BuiltEmail | null | Promise<BuiltEmail | null>> = {
  registrationConfirm: (l) =>
    templates.registrationConfirm(l, {
      name: 'Kovács Anna',
      acceptUrl: `${SITE_URL}/portal/invite/${SAMPLE_TOKEN}`,
      settlement: 'Csemő',
    }),
  accountExists: (l) =>
    templates.accountExists(l, {
      name: 'Kovács Anna',
      loginUrl: `${SITE_URL}/portal/login?lang=${l}`,
      forgotUrl: `${SITE_URL}/portal/forgot?lang=${l}`,
    }),
  invite: (l) =>
    templates.invite(l, { role: 'owner', acceptUrl: `${SITE_URL}/portal/invite/${SAMPLE_TOKEN}` }),
  welcome: (l) =>
    templates.welcome(l, { name: 'Kovács Anna', portalUrl: `${SITE_URL}/portal/dashboard` }),
  submissionReceived: (l) => templates.submissionReceived(l, { ref: SAMPLE_REF, title: TITLES[l] }),
  adminNewSubmission: (l) =>
    templates.adminNewSubmission(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      ownerName: 'Kovács Anna',
      ownerEmail: 'anna.kovacs@example.com',
      location: 'Csemő, Pest',
      price: '€ 178 000',
      photoCount: 14,
      languages: 'HU, NL, DE',
      reviewUrl: `${SITE_URL}/portal/review/sample`,
    }),
  changesRequested: (l) =>
    templates.changesRequested(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      note: say(l)('A fényképek nagy része sötét, kérjük napos időben készítse el őket újra.\n\nAz alapterület sem stimmel: a leírásban 140 m² szerepel, a mezőben 104 m².', 'Veel foto’s zijn donker. Maak ze alstublieft opnieuw bij zonnig weer.\n\nDe woonoppervlakte klopt ook niet: de omschrijving noemt 140 m², het veld 104 m².', 'Many of the photos are dark. Please retake them in sunny weather.\n\nThe floor area does not match either: the description says 140 m², the field says 104 m².', 'Viele Fotos sind dunkel. Bitte nehmen Sie sie bei sonnigem Wetter neu auf.\n\nAuch die Wohnfläche stimmt nicht: Die Beschreibung nennt 140 m², das Feld 104 m².', 'Beaucoup de photos sont sombres. Veuillez les reprendre par temps ensoleillé.\n\nLa surface habitable ne correspond pas non plus : la description indique 140 m², le champ 104 m².'),
      editUrl: `${SITE_URL}/portal/properties/sample`,
    }),
  approvedAwaitingPayment: (l) =>
    templates.approvedAwaitingPayment(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      items: SAMPLE_ORDER[l],
      total: say(l)('215 €', '€ 215', '€215', '215 €', '215 €'),
      payUrl: `${SITE_URL}/portal/properties/sample`,
    }),
  // The same email with card payment switched off — the state FODEL launches
  // in, and the one most likely to go untested.
  approvedAwaitingPaymentBankOnly: (l) =>
    templates.approvedAwaitingPayment(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      items: SAMPLE_ORDER[l],
      total: say(l)('215 €', '€ 215', '€215', '215 €', '215 €'),
      payUrl: null,
    }),
  paymentReceipt: (l) =>
    templates.paymentReceipt(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      items: SAMPLE_ORDER[l],
      total: say(l)('215 €', '€ 215', '€215', '215 €', '215 €'),
      paidAt: say(l)('2026. augusztus 26.', '26 augustus 2026', '26 August 2026', '26. August 2026', '26 août 2026'),
    }),
  published: (l) => templates.published(l, { ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l) }),
  newEnquiry: (l) =>
    templates.newEnquiry(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      name: 'Jan de Vries',
      email: 'jan.devries@example.nl',
      phone: '+31 6 1234 5678',
      message:
        'Goedendag, wij zijn geïnteresseerd in deze woning. Is het mogelijk om eind september te komen kijken?',
    }),
  passwordReset: (l) =>
    templates.passwordReset(l, {
      name: 'Kovács Anna',
      resetUrl: `${SITE_URL}/portal/reset/${SAMPLE_TOKEN}`,
    }),
  approvedAwaitingPaymentWithDiscount: (l) =>
    templates.approvedAwaitingPayment(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      items: SAMPLE_ORDER[l],
      discount: say(l)('−13 €', '−€ 13', '−€13', '−13 €', '−13 €'),
      total: '€ 202',
      payUrl: `${SITE_URL}/portal/properties/sample`,
    }),
  referralRegistered: (l) => templates.referralRegistered(l, { referredName: 'Jan de Vries' }),
  referralAdminNotice: (l) =>
    templates.referralAdminNotice(l, {
      referrerName: 'Kovács Anna',
      referrerEmail: 'anna.kovacs@example.com',
      referredName: 'Jan de Vries',
      referredEmail: 'jan.devries@example.nl',
    }),
  invoiceIssued: (l) =>
    templates.invoiceIssued(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      number: 'FD-2026-0001',
      viewUrl: `${SITE_URL}/portal/invoices/FD-2026-0001`,
    }),
  rejected: (l) =>
    templates.rejected(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      note: say(l)('A hirdetett ingatlan nem az Ön tulajdona, és a tulajdonos hozzájárulását nem csatolta.', 'De geadverteerde woning is niet uw eigendom en de toestemming van de eigenaar is niet bijgevoegd.', 'The property advertised is not yours, and the owner’s consent was not attached.', 'Die inserierte Immobilie gehört nicht Ihnen, und die Zustimmung des Eigentümers liegt nicht bei.', 'Le bien annoncé ne vous appartient pas et l’accord du propriétaire n’était pas joint.'),
      refundRequired: true,
    }),
  rejectedNoRefund: (l) =>
    templates.rejected(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      note: say(l)('A hirdetett ingatlan nem az Ön tulajdona, és a tulajdonos hozzájárulását nem csatolta.', 'De geadverteerde woning is niet uw eigendom en de toestemming van de eigenaar is niet bijgevoegd.', 'The property advertised is not yours, and the owner’s consent was not attached.', 'Die inserierte Immobilie gehört nicht Ihnen, und die Zustimmung des Eigentümers liegt nicht bei.', 'Le bien annoncé ne vous appartient pas et l’accord du propriétaire n’était pas joint.'),
      refundRequired: false,
    }),
  valuationReady: (l) =>
    templates.valuationReady(l, {
      range: say(l)('42 000 000 – 54 000 000 Ft', '€ 142.000 – € 168.000', '€142,000 – €168,000', '142.000 € – 168.000 €', '142 000 € – 168 000 €'),
      mid: say(l)('48 000 000 Ft', '€ 155.000', '€155,000', '155.000 €', '155 000 €'),
      basis: say(l)('11 hasonló FODEL-hirdetés', '11 vergelijkbare FODEL-advertenties', '11 comparable FODEL listings', '11 vergleichbare FODEL-Inserate', '11 annonces FODEL comparables'),
      factors: [{ text: say(l)('Panorámás kilátás', 'Panoramisch uitzicht', 'Panoramic view', 'Panoramablick', 'Vue panoramique'), direction: 'plus' }],
      notice: say(l)('Tájékoztató, piaci alapú értékmeghatározás.', 'Indicatieve, marktgebaseerde waardebepaling.', 'Indicative, market-based valuation.', 'Unverbindliche, marktbasierte Wertermittlung.', 'Estimation indicative, fondée sur le marché.'),
      compCount: 11,
      submitAdUrl: `${SITE_URL}${path(l, 'submitAd')}`,
    }),
  valuationReadyKsh: (l) => templates.valuationReady(l, {
    range: say(l)('42 000 000 – 54 000 000 Ft', '€ 105.000 – € 135.000', '€105,000 – €135,000', '105.000 € – 135.000 €', '105 000 € – 135 000 €'),
    mid: say(l)('48 000 000 Ft', '€ 120.000', '€120,000', '120.000 €', '120 000 €'),
    compCount: 0,
    basis: say(l)('KSH Ingatlanadattár, 2024 (település, 18 adat)', 'KSH Ingatlanadattár, 2024 (plaats, 18 gegevens)', 'KSH Ingatlanadattár, 2024 (settlement, 18 records)', 'KSH Ingatlanadattár, 2024 (Ort, 18 Datensätze)', 'KSH Ingatlanadattár, 2024 (localité, 18 données)'),
    sourceUrl: 'https://www.ksh.hu/s/ingatlanadattar/',
    sourceDate: say(l)('2024, letöltve 2026-09-29', '2024, opgehaald 2026-09-29', '2024, retrieved 2026-09-29', '2024, abgerufen 2026-09-29', '2024, consulté le 2026-09-29'),
    rateDate: l === 'hu' ? undefined : '2026-09-29',
    factors: [
      { text: say(l)('Felújított tető', 'Vernieuwd dak', 'Renovated roof', 'Erneuertes Dach', 'Toit rénové'), direction: 'plus' },
      { text: say(l)('Forgalmas út', 'Drukke weg', 'Busy road', 'Verkehrsreiche Straße', 'Route passante'), direction: 'minus' },
    ],
    notice: say(l)('Tájékoztató, piaci alapú értékmeghatározás.', 'Indicatieve, marktgebaseerde waardebepaling.', 'Indicative, market-based valuation.', 'Unverbindliche, marktbasierte Wertermittlung.', 'Estimation indicative, fondée sur le marché.'),
    submitAdUrl: `${SITE_URL}${path(l, 'submitAd')}`,
    visitUrl: `${SITE_URL}${path(l, 'valuation')}?service=onsite-visit`,
    judicialUrl: `${SITE_URL}${path(l, 'valuation')}?service=judicial`,
  }),
  valuationReceived: (l) => templates.valuationReceived(l),
  // Priced by hand by an admin: no comparable count to cite.
  valuationReadyManual: (l) =>
    templates.valuationReady(l, {
      range: say(l)('42 000 000 – 54 000 000 Ft', '€ 142.000 – € 168.000', '€142,000 – €168,000', '142.000 € – 168.000 €', '142 000 € – 168 000 €'),
      compCount: 0,
      submitAdUrl: `${SITE_URL}${path(l, 'submitAd')}`,
    }),
  valuationDeclined: (l) => templates.valuationDeclined(l),
  valuationNeedsInfo: (l) =>
    templates.valuationNeedsInfo(l, {
      note: say(l)('Kérjük, küldjön néhány fényképet a ház külsejéről, és írja meg, mikor cserélték a tetőt.', 'Stuur ons alstublieft enkele foto’s van de buitenkant van het huis en laat weten wanneer het dak is vervangen.', 'Please send us a few photos of the outside of the house and tell us when the roof was replaced.', 'Bitte senden Sie uns einige Fotos der Außenansicht des Hauses und teilen Sie uns mit, wann das Dach erneuert wurde.', 'Veuillez nous envoyer quelques photos de l’extérieur de la maison et nous indiquer quand le toit a été remplacé.'),
    }),
  serviceRequested: (l) => templates.serviceRequested(l, { service: say(l)('Gábor helyszíni látogatása', 'Bezoek van Gábor', 'Visit by Gábor', 'Besuch durch Gábor', 'Visite de Gábor'), price: say(l)('200 €', '€ 200', '€200', '200 €', '200 €') }),
  judicialRequested: (l) => templates.judicialRequested(l),
  adminServiceRequested: (l) => templates.adminServiceRequested(l, {
    service: 'Helyszíni fotózás, videó és drónfelvétel', name: 'Kovács Anna',
    email: 'anna.kovacs@example.com', phone: '+36 20 123 4567',
    source: 'valuation', note: 'Időpont egyeztetése szükséges.', url: `${SITE_URL}/portal/services`,
  }),
  // The admin-edited invite text (Beállítások → Meghívólevelek). The body here
  // is a visible sample, not approved copy.
  inviteFromTemplate: (l) => templates.inviteFromTemplate(l, SAMPLE_INVITE, `${SITE_URL}/portal/invite/${SAMPLE_TOKEN}`),
  // Brief 3 §B: the client's Hungarian owner letter, exactly as migration 0015
  // seeds it (approved). Hungarian only — there is no NL client text.
  inviteOwnerApprovedHu: () =>
    templates.inviteFromTemplate('hu', HU_OWNER_INVITE, `${SITE_URL}/portal/invite/${SAMPLE_TOKEN}`),
  // What buildInvite() actually sends once that letter is approved: the owner
  // gets it, an admin still gets the built-in admin wording (the role bug).
  inviteOwnerAfterApproval: () => buildInvite(approvedStub, 'hu', 'owner', `${SITE_URL}/portal/invite/${SAMPLE_TOKEN}`),
  inviteAdminAfterApproval: (l) => buildInvite(approvedStub, l, 'admin', `${SITE_URL}/portal/invite/${SAMPLE_TOKEN}`),
  // Quote completion (0019): expiry, renewal, the monthly owner check, newsletter.
  expiryReminder: (l) => lifecycleEmails.expiryReminder(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), days: 14, price: say(l)('25 €', '€ 25', '€25', '25 €', '25 €'),
    expiresOn: say(l)('2026. október 28.', '28 oktober 2026', '28 October 2026', '28. Oktober 2026', '28 octobre 2026'),
    renewUrl: `${SITE_URL}/listing/renew?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  expiryReminderLast: (l) => lifecycleEmails.expiryReminder(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), days: 3, price: say(l)('25 €', '€ 25', '€25', '25 €', '25 €'),
    expiresOn: say(l)('2026. október 28.', '28 oktober 2026', '28 October 2026', '28. Oktober 2026', '28 octobre 2026'),
    renewUrl: `${SITE_URL}/listing/renew?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  listingExpired: (l) => lifecycleEmails.listingExpired(l, {
    ref: SAMPLE_REF, title: TITLES[l], price: say(l)('25 €', '€ 25', '€25', '25 €', '25 €'), renewUrl: `${SITE_URL}/listing/renew?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  listingRenewed: (l) => lifecycleEmails.renewed(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), expiresOn: say(l)('2027. április 28.', '28 april 2027', '28 April 2027', '28. April 2027', '28 avril 2027'),
  }),
  renewalTransfer: (l) => lifecycleEmails.renewalTransfer(l, {
    ref: SAMPLE_REF, title: TITLES[l], amount: say(l)('25 €', '€ 25', '€25', '25 €', '25 €'), account: 'NL35 RABO 0360284973 · BIC RABONL2U',
    reference: `#${SAMPLE_REF} ${say(l)('hosszabbítás', 'verlenging', 'extension', 'Verlängerung', 'prolongation')}`, payUrl: `${SITE_URL}/listing/renew?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  ownerRefresh: (l) => lifecycleEmails.ownerRefresh(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), price: say(l)('178 000 €', '€ 178.000', '€178,000', '178.000 €', '178 000 €'),
    stillUrl: `${SITE_URL}/listing/still-available?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    priceUrl: `${SITE_URL}/listing/price?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    soldUrl: `${SITE_URL}/listing/sold?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    validUntil: say(l)('2026. november 13.', '13 november 2026', '13 November 2026', '13. November 2026', '13 novembre 2026'),
  }),
  ownerRefreshReminder: (l) => lifecycleEmails.ownerRefresh(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), price: say(l)('178 000 €', '€ 178.000', '€178,000', '178.000 €', '178 000 €'), reminder: true,
    stillUrl: `${SITE_URL}/listing/still-available?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    priceUrl: `${SITE_URL}/listing/price?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    soldUrl: `${SITE_URL}/listing/sold?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    validUntil: say(l)('2026. november 13.', '13 november 2026', '13 November 2026', '13. November 2026', '13 novembre 2026'),
  }),
  // Office notices are Hungarian whatever the preview locale.
  adminOwnerPriceChange: () => lifecycleEmails.adminOwnerUpdate({
    kind: 'price', ref: SAMPLE_REF, title: SAMPLE_TITLE, owner: 'Kovács Anna',
    oldPrice: '€ 178 000 / 71 200 000 Ft', newPrice: '€ 165 000 / 66 000 000 Ft', editUrl: `${SITE_URL}/portal/properties/sample`,
  }),
  adminOwnerSold: () => lifecycleEmails.adminOwnerUpdate({
    kind: 'sold', ref: SAMPLE_REF, title: SAMPLE_TITLE, owner: 'Kovács Anna', editUrl: `${SITE_URL}/portal/properties/sample`,
  }),
  newsletterConfirm: (l) => lifecycleEmails.newsletterConfirm(l, {
    confirmUrl: `${SITE_URL}/newsletter/confirm?s=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    unsubscribeUrl: `${SITE_URL}/newsletter/unsubscribe?s=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  creditNoteIssued: (l) =>
    templates.creditNoteIssued(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      number: 'FD-2026-0002',
      correctsNumber: 'FD-2026-0001',
      viewUrl: `${SITE_URL}/portal/invoices/FD-2026-0002`,
    }),
};

function index(): string {
  const rows = Object.keys(CASES)
    .map(
      (key) => `<tr>
        <td>${key}</td>
        <td>${LOCALES.map((code) => `<a href="/dev/emails?t=${key}&locale=${code}">${code.toUpperCase()}</a>`).join(' · ')}</td>
        <td>${LOCALES.map((code) => `<a href="/dev/emails?t=${key}&locale=${code}&format=text">${code.toUpperCase()} text</a>`).join(' · ')}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html><meta charset="utf-8"><title>FODEL email preview</title>
<style>
  body { font: 15px/1.7 system-ui, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 24px; color: #102a43; }
  h1 { font-size: 22px; margin-bottom: 6px; }
  p { color: #475457; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  td { padding: 9px 12px 9px 0; border-bottom: 1px solid #d0d4d6; }
  td:first-child { font-family: ui-monospace, monospace; font-size: 13px; }
  a { color: #102a43; }
</style>
<h1>Email preview</h1>
<p>Development only. Open one, then use “view source” to copy the raw HTML into
a real client — Outlook on Windows is the renderer that decides whether this
works.</p>
<table>${rows}</table>`;
}

export const GET: APIRoute = async ({ url, request, cookies }) => {
  if (!import.meta.env.DEV) {
    // Not under /portal or /api/portal, so src/middleware.ts never ran for
    // this request — the admin check has to happen here, once, rather than
    // widening that middleware's scope for one dev tool.
    const supabase = createSupabaseServerClient(request, cookies);
    const { data } = await supabase.auth.getUser();
    if (!data.user) return new Response('Not found', { status: 404 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    if (profile?.role !== 'admin') return new Response('Not found', { status: 404 });
  }

  const key = url.searchParams.get('t');
  if (!key) {
    return new Response(index(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  const build = CASES[key];
  if (!build) return new Response(`Unknown template: ${key}`, { status: 404 });

  const asked = url.searchParams.get('locale') ?? '';
  const locale: Locale = (LOCALES as readonly string[]).includes(asked) ? (asked as Locale) : 'hu';
  const email = await build(locale);
  if (!email) return new Response(`No email for ${key} in ${locale}`, { status: 404 });

  if (url.searchParams.get('format') === 'text') {
    return new Response(`Subject: ${email.subject}\n\n${email.text}`, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(email.html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
};
