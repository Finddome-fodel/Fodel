/**
 * Sample data for every email: one builder per template, with arguments that
 * exercise its longest branch. The /dev/emails preview and the system-email
 * editor (/portal/email/system) both render from here, so what an admin
 * previews is the real template filled with a believable listing.
 */
import { templates } from '~/lib/email/templates';
import type { BuiltEmail } from '~/lib/email/templates';
import { SITE_URL } from '~/config/site.mjs';
import { buildInvite } from '~/lib/portal/invites';
import { HU_OWNER_INVITE } from '~/data/invite-letter';
import { lifecycleEmails } from '~/lib/email/lifecycle';
import { localizer, path, type Locale } from '~/i18n/ui';

const SAMPLE_REF = '7213';
const SAMPLE_TITLE = 'Felújított parasztház a Balaton-felvidéken';
const SAMPLE_TOKEN = 'a'.repeat(64);
const sampleUrl = (l: Locale) => `${SITE_URL}/${l}/${l === 'hu' ? 'haz-elado' : 'house-for-sale'}-${SAMPLE_REF}/`;

/** One sample sentence per language: `say(l)(hu, nl, en, de, fr)`. */
/**
 * Sample values (dates, amounts, remarks) written for the first nine languages;
 * the newer languages show the English sample text, which is enough for a
 * preview of the layout.
 */
const say = (locale: Locale) => {
  const pick = localizer(locale);
  return (...nine: string[]) => (pick as (...all: string[]) => string)(...nine, ...Array<string>(12).fill(nine[2]));
};
export const TITLES: Record<Locale, string> = {
  hu: SAMPLE_TITLE,
  nl: 'Gerenoveerde boerderij in het Balatonhoogland',
  en: 'Renovated farmhouse in the Balaton Uplands',
  de: 'Renoviertes Bauernhaus im Balaton-Oberland',
  fr: 'Ferme rénovée dans les hauts plateaux du Balaton',
  es: 'Finca reformada en las tierras altas del Balaton',
  pl: 'Odnowione gospodarstwo na Wyżynie Balatońskiej',
  ro: 'Fermă renovată în zona deluroasă a Balatonului',
  sk: 'Zrekonštruovaná farma na Balatonskej vrchovine',
  it: 'Casale ristrutturato sull’altopiano del Balaton',
  pt: 'Casa de campo renovada nas terras altas do Balaton',
  el: 'Ανακαινισμένη αγροικία στα υψίπεδα του Μπάλατον',
  cs: 'Zrekonstruovaný statek na Balatonské vrchovině',
  sl: 'Prenovljena kmečka hiša v Blatenskem višavju',
  sv: 'Renoverad bondgård i Balatonhöglandet',
  da: 'Renoveret stuehus i Balaton-højlandet',
  no: 'Renovert våningshus i Balaton-høylandet',
  fi: 'Remontoitu maalaistalo Balatonin ylängöllä',
  et: 'Renoveeritud talumaja Balatoni kõrgustikul',
  lv: 'Renovēta lauku māja Balatona augstienē',
  lt: 'Renovuota sodyba Balatono aukštumose',
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
  es: [
    { label: 'Anuncio — 12 meses', amount: '129 €' },
    { label: 'Traducción — 2 idiomas', amount: '50 €' },
    { label: 'Presentación en vídeo', amount: '36 €' },
  ],
  pl: [
    { label: 'Ogłoszenie — 12 miesięcy', amount: '129 €' },
    { label: 'Tłumaczenie — 2 języki', amount: '50 €' },
    { label: 'Prezentacja wideo', amount: '36 €' },
  ],
  ro: [
    { label: 'Anunț — 12 luni', amount: '129 €' },
    { label: 'Traducere — 2 limbi', amount: '50 €' },
    { label: 'Prezentare video', amount: '36 €' },
  ],
  sk: [
    { label: 'Inzerát — 12 mesiacov', amount: '129 €' },
    { label: 'Preklad — 2 jazyky', amount: '50 €' },
    { label: 'Videoprezentácia', amount: '36 €' },
  ],
  it: [
    { label: 'Annuncio — 12 mesi', amount: '129 €' },
    { label: 'Traduzione — 2 lingue', amount: '50 €' },
    { label: 'Presentazione video', amount: '36 €' },
  ],
  pt: [
    { label: 'Anúncio — 12 meses', amount: '129 €' },
    { label: 'Tradução — 2 línguas', amount: '50 €' },
    { label: 'Apresentação em vídeo', amount: '36 €' },
  ],
  el: [
    { label: 'Αγγελία — 12 μήνες', amount: '129 €' },
    { label: 'Μετάφραση — 2 γλώσσες', amount: '50 €' },
    { label: 'Παρουσίαση με βίντεο', amount: '36 €' },
  ],
  cs: [
    { label: 'Inzerát — 12 měsíců', amount: '129 €' },
    { label: 'Překlad — 2 jazyky', amount: '50 €' },
    { label: 'Videoprezentace', amount: '36 €' },
  ],
  sl: [
    { label: 'Oglas — 12 mesecev', amount: '129 €' },
    { label: 'Prevod — 2 jezika', amount: '50 €' },
    { label: 'Video predstavitev', amount: '36 €' },
  ],
  sv: [
    { label: 'Annons — 12 månader', amount: '129 €' },
    { label: 'Översättning — 2 språk', amount: '50 €' },
    { label: 'Videopresentation', amount: '36 €' },
  ],
  da: [
    { label: 'Annonce — 12 måneder', amount: '129 €' },
    { label: 'Oversættelse — 2 sprog', amount: '50 €' },
    { label: 'Videopræsentation', amount: '36 €' },
  ],
  no: [
    { label: 'Annonse — 12 måneder', amount: '129 €' },
    { label: 'Oversettelse — 2 språk', amount: '50 €' },
    { label: 'Videopresentasjon', amount: '36 €' },
  ],
  fi: [
    { label: 'Ilmoitus — 12 kuukautta', amount: '129 €' },
    { label: 'Käännös — 2 kieltä', amount: '50 €' },
    { label: 'Videoesittely', amount: '36 €' },
  ],
  et: [
    { label: 'Kuulutus — 12 kuud', amount: '129 €' },
    { label: 'Tõlge — 2 keelt', amount: '50 €' },
    { label: 'Videotutvustus', amount: '36 €' },
  ],
  lv: [
    { label: 'Sludinājums — 12 mēneši', amount: '129 €' },
    { label: 'Tulkojums — 2 valodas', amount: '50 €' },
    { label: 'Video prezentācija', amount: '36 €' },
  ],
  lt: [
    { label: 'Skelbimas — 12 mėnesių', amount: '129 €' },
    { label: 'Vertimas — 2 kalbos', amount: '50 €' },
    { label: 'Vaizdo pristatymas', amount: '36 €' },
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
  subject: '[MINTA] Meghívó a FINDDOME portálra',
  heading: '[MINTA] Meghívó',
  body: 'Ez mintaszöveg. A végleges meghívószöveget Gábor és Éva adja meg a Beállítások → Meghívólevelek oldalon.',
  cta: 'Meghívó elfogadása',
};

/** Every template with sample arguments that exercise its longest branch. */
export const CASES: Record<string, (locale: Locale) => BuiltEmail | null | Promise<BuiltEmail | null>> = {
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
      note: say(l)('A fényképek nagy része sötét, kérjük napos időben készítse el őket újra.\n\nAz alapterület sem stimmel: a leírásban 140 m² szerepel, a mezőben 104 m².', 'Veel foto’s zijn donker. Maak ze alstublieft opnieuw bij zonnig weer.\n\nDe woonoppervlakte klopt ook niet: de omschrijving noemt 140 m², het veld 104 m².', 'Many of the photos are dark. Please retake them in sunny weather.\n\nThe floor area does not match either: the description says 140 m², the field says 104 m².', 'Viele Fotos sind dunkel. Bitte nehmen Sie sie bei sonnigem Wetter neu auf.\n\nAuch die Wohnfläche stimmt nicht: Die Beschreibung nennt 140 m², das Feld 104 m².', 'Beaucoup de photos sont sombres. Veuillez les reprendre par temps ensoleillé.\n\nLa surface habitable ne correspond pas non plus : la description indique 140 m², le champ 104 m².', 'Muchas fotos están oscuras. Vuelva a hacerlas en un día soleado.\n\nLa superficie habitable tampoco coincide: la descripción indica 140 m² y el campo, 104 m².', 'Wiele zdjęć jest ciemnych. Prosimy zrobić je ponownie w słoneczny dzień.\n\nNie zgadza się też powierzchnia użytkowa: w opisie jest 140 m², a w polu 104 m².', 'Multe fotografii sunt întunecate. Vă rugăm să le refaceți pe vreme însorită.\n\nNici suprafața utilă nu corespunde: descrierea indică 140 m², iar câmpul 104 m².', 'Mnohé fotografie sú tmavé. Nafoťte ich, prosím, znova za slnečného počasia.\n\nNezhoduje sa ani obytná plocha: v popise je 140 m², v poli 104 m².'),
      editUrl: `${SITE_URL}/portal/properties/sample`,
    }),
  approvedAwaitingPayment: (l) =>
    templates.approvedAwaitingPayment(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      items: SAMPLE_ORDER[l],
      total: say(l)('215 €', '€ 215', '€215', '215 €', '215 €', '215 €', '215 €', '215 €', '215 €'),
      payUrl: `${SITE_URL}/portal/properties/sample`,
    }),
  approvedPublished: (l) =>
    templates.approvedPublished(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      items: SAMPLE_ORDER[l],
      total: say(l)('215 €', '€ 215', '€215', '215 €', '215 €', '215 €', '215 €', '215 €', '215 €'),
      payUrl: `${SITE_URL}/portal/properties/sample`,
      viewUrl: sampleUrl(l),
      dueDate: '2026-11-12',
    }),
  // The same email with card payment switched off — the state FODEL launches
  // in, and the one most likely to go untested.
  approvedAwaitingPaymentBankOnly: (l) =>
    templates.approvedAwaitingPayment(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      items: SAMPLE_ORDER[l],
      total: say(l)('215 €', '€ 215', '€215', '215 €', '215 €', '215 €', '215 €', '215 €', '215 €'),
      payUrl: null,
    }),
  paymentReceipt: (l) =>
    templates.paymentReceipt(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      items: SAMPLE_ORDER[l],
      total: say(l)('215 €', '€ 215', '€215', '215 €', '215 €', '215 €', '215 €', '215 €', '215 €'),
      paidAt: say(l)('2026. augusztus 26.', '26 augustus 2026', '26 August 2026', '26. August 2026', '26 août 2026', '26 de agosto de 2026', '26 sierpnia 2026', '26 august 2026', '26. augusta 2026'),
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
      discount: say(l)('−13 €', '−€ 13', '−€13', '−13 €', '−13 €', '−13 €', '−13 €', '−13 €', '−13 €'),
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
      note: say(l)('A hirdetett ingatlan nem az Ön tulajdona, és a tulajdonos hozzájárulását nem csatolta.', 'De geadverteerde woning is niet uw eigendom en de toestemming van de eigenaar is niet bijgevoegd.', 'The property advertised is not yours, and the owner’s consent was not attached.', 'Die inserierte Immobilie gehört nicht Ihnen, und die Zustimmung des Eigentümers liegt nicht bei.', 'Le bien annoncé ne vous appartient pas et l’accord du propriétaire n’était pas joint.', 'El inmueble anunciado no es de su propiedad y no se adjuntó el consentimiento del propietario.', 'Ogłaszana nieruchomość nie należy do Państwa, a zgoda właściciela nie została dołączona.', 'Proprietatea anunțată nu vă aparține, iar acordul proprietarului nu a fost atașat.', 'Inzerovaná nehnuteľnosť vám nepatrí a súhlas majiteľa nebol priložený.'),
      refundRequired: true,
    }),
  rejectedNoRefund: (l) =>
    templates.rejected(l, {
      ref: SAMPLE_REF,
      title: TITLES[l],
      note: say(l)('A hirdetett ingatlan nem az Ön tulajdona, és a tulajdonos hozzájárulását nem csatolta.', 'De geadverteerde woning is niet uw eigendom en de toestemming van de eigenaar is niet bijgevoegd.', 'The property advertised is not yours, and the owner’s consent was not attached.', 'Die inserierte Immobilie gehört nicht Ihnen, und die Zustimmung des Eigentümers liegt nicht bei.', 'Le bien annoncé ne vous appartient pas et l’accord du propriétaire n’était pas joint.', 'El inmueble anunciado no es de su propiedad y no se adjuntó el consentimiento del propietario.', 'Ogłaszana nieruchomość nie należy do Państwa, a zgoda właściciela nie została dołączona.', 'Proprietatea anunțată nu vă aparține, iar acordul proprietarului nu a fost atașat.', 'Inzerovaná nehnuteľnosť vám nepatrí a súhlas majiteľa nebol priložený.'),
      refundRequired: false,
    }),
  valuationReady: (l) =>
    templates.valuationReady(l, {
      range: say(l)('42 000 000 – 54 000 000 Ft', '€ 142.000 – € 168.000', '€142,000 – €168,000', '142.000 € – 168.000 €', '142 000 € – 168 000 €', '142.000 € – 168.000 €', '142\u00a0000 € – 168\u00a0000 €', '142.000 € – 168.000 €', '142\u00a0000 € – 168\u00a0000 €'),
      mid: say(l)('48 000 000 Ft', '€ 155.000', '€155,000', '155.000 €', '155 000 €', '155.000 €', '155\u00a0000 €', '155.000 €', '155\u00a0000 €'),
      basis: say(l)('11 hasonló FINDDOME-hirdetés', '11 vergelijkbare FINDDOME-advertenties', '11 comparable FINDDOME listings', '11 vergleichbare FINDDOME-Inserate', '11 annonces FINDDOME comparables', '11 anuncios FINDDOME comparables', '11 porównywalnych ogłoszeń FINDDOME', '11 anunțuri FINDDOME comparabile', '11 porovnateľných inzerátov FINDDOME'),
      factors: [{ text: say(l)('Panorámás kilátás', 'Panoramisch uitzicht', 'Panoramic view', 'Panoramablick', 'Vue panoramique', 'Vistas panorámicas', 'Widok panoramiczny', 'Priveliște panoramică', 'Panoramatický výhľad'), direction: 'plus' }],
      notice: say(l)('Tájékoztató, piaci alapú értékmeghatározás.', 'Indicatieve, marktgebaseerde waardebepaling.', 'Indicative, market-based valuation.', 'Unverbindliche, marktbasierte Wertermittlung.', 'Estimation indicative, fondée sur le marché.', 'Valoración orientativa, basada en el mercado.', 'Orientacyjna wycena oparta na danych rynkowych.', 'Evaluare orientativă, bazată pe piață.', 'Orientačný odhad založený na trhu.'),
      compCount: 11,
      submitAdUrl: `${SITE_URL}${path(l, 'submitAd')}`,
    }),
  valuationReadyKsh: (l) => templates.valuationReady(l, {
    range: say(l)('42 000 000 – 54 000 000 Ft', '€ 105.000 – € 135.000', '€105,000 – €135,000', '105.000 € – 135.000 €', '105 000 € – 135 000 €', '105.000 € – 135.000 €', '105\u00a0000 € – 135\u00a0000 €', '105.000 € – 135.000 €', '105\u00a0000 € – 135\u00a0000 €'),
    mid: say(l)('48 000 000 Ft', '€ 120.000', '€120,000', '120.000 €', '120 000 €', '120.000 €', '120\u00a0000 €', '120.000 €', '120\u00a0000 €'),
    compCount: 0,
    basis: say(l)('KSH Ingatlanadattár, 2024 (település, 18 adat)', 'KSH Ingatlanadattár, 2024 (plaats, 18 gegevens)', 'KSH Ingatlanadattár, 2024 (settlement, 18 records)', 'KSH Ingatlanadattár, 2024 (Ort, 18 Datensätze)', 'KSH Ingatlanadattár, 2024 (localité, 18 données)', 'KSH Ingatlanadattár, 2024 (localidad, 18 datos)', 'KSH Ingatlanadattár, 2024 (miejscowość, 18 rekordów)', 'KSH Ingatlanadattár, 2024 (localitate, 18 înregistrări)', 'KSH Ingatlanadattár, 2024 (obec, 18 záznamov)'),
    sourceUrl: 'https://www.ksh.hu/s/ingatlanadattar/',
    sourceDate: say(l)('2024, letöltve 2026-09-29', '2024, opgehaald 2026-09-29', '2024, retrieved 2026-09-29', '2024, abgerufen 2026-09-29', '2024, consulté le 2026-09-29', '2024, consultado el 2026-09-29', '2024, stan na 2026-09-29', '2024, consultat la 2026-09-29', '2024, stav k 2026-09-29'),
    rateDate: l === 'hu' ? undefined : '2026-09-29',
    factors: [
      { text: say(l)('Felújított tető', 'Vernieuwd dak', 'Renovated roof', 'Erneuertes Dach', 'Toit rénové', 'Tejado renovado', 'Odnowiony dach', 'Acoperiș renovat', 'Obnovená strecha'), direction: 'plus' },
      { text: say(l)('Forgalmas út', 'Drukke weg', 'Busy road', 'Verkehrsreiche Straße', 'Route passante', 'Carretera transitada', 'Ruchliwa droga', 'Drum aglomerat', 'Frekventovaná cesta'), direction: 'minus' },
    ],
    notice: say(l)('Tájékoztató, piaci alapú értékmeghatározás.', 'Indicatieve, marktgebaseerde waardebepaling.', 'Indicative, market-based valuation.', 'Unverbindliche, marktbasierte Wertermittlung.', 'Estimation indicative, fondée sur le marché.', 'Valoración orientativa, basada en el mercado.', 'Orientacyjna wycena oparta na danych rynkowych.', 'Evaluare orientativă, bazată pe piață.', 'Orientačný odhad založený na trhu.'),
    submitAdUrl: `${SITE_URL}${path(l, 'submitAd')}`,
    visitUrl: `${SITE_URL}${path(l, 'valuation')}?service=onsite-visit`,
    judicialUrl: `${SITE_URL}${path(l, 'valuation')}?service=judicial`,
  }),
  valuationReceived: (l) => templates.valuationReceived(l),
  // Priced by hand by an admin: no comparable count to cite.
  valuationReadyManual: (l) =>
    templates.valuationReady(l, {
      range: say(l)('42 000 000 – 54 000 000 Ft', '€ 142.000 – € 168.000', '€142,000 – €168,000', '142.000 € – 168.000 €', '142 000 € – 168 000 €', '142.000 € – 168.000 €', '142\u00a0000 € – 168\u00a0000 €', '142.000 € – 168.000 €', '142\u00a0000 € – 168\u00a0000 €'),
      compCount: 0,
      submitAdUrl: `${SITE_URL}${path(l, 'submitAd')}`,
    }),
  valuationDeclined: (l) => templates.valuationDeclined(l),
  valuationNeedsInfo: (l) =>
    templates.valuationNeedsInfo(l, {
      note: say(l)('Kérjük, küldjön néhány fényképet a ház külsejéről, és írja meg, mikor cserélték a tetőt.', 'Stuur ons alstublieft enkele foto’s van de buitenkant van het huis en laat weten wanneer het dak is vervangen.', 'Please send us a few photos of the outside of the house and tell us when the roof was replaced.', 'Bitte senden Sie uns einige Fotos der Außenansicht des Hauses und teilen Sie uns mit, wann das Dach erneuert wurde.', 'Veuillez nous envoyer quelques photos de l’extérieur de la maison et nous indiquer quand le toit a été remplacé.', 'Envíenos algunas fotos del exterior de la casa e indíquenos cuándo se cambió el tejado.', 'Prosimy przesłać kilka zdjęć domu z zewnątrz i napisać, kiedy wymieniono dach.', 'Vă rugăm să ne trimiteți câteva fotografii cu exteriorul casei și să ne spuneți când a fost înlocuit acoperișul.', 'Pošlite nám, prosím, niekoľko fotografií domu zvonku a napíšte, kedy bola vymenená strecha.'),
    }),
  valuationPaid: (l) =>
    templates.valuationPaid(l, {
      service: say(l)('Gábor helyszíni látogatása', 'Bezoek van Gábor', 'Visit by Gábor', 'Besuch durch Gábor', 'Visite de Gábor', 'Visita de Gábor', 'Wizyta Gábora', 'Vizita lui Gábor', 'Návšteva Gábora'),
      items: [{ label: say(l)('Gábor helyszíni látogatása', 'Bezoek van Gábor', 'Visit by Gábor', 'Besuch durch Gábor', 'Visite de Gábor', 'Visita de Gábor', 'Wizyta Gábora', 'Vizita lui Gábor', 'Návšteva Gábora'), amount: '200 €' }],
      total: '200 €',
      paidAt: '2026-10-29',
    }),
  serviceRequested: (l) => templates.serviceRequested(l, { service: say(l)('Gábor helyszíni látogatása', 'Bezoek van Gábor', 'Visit by Gábor', 'Besuch durch Gábor', 'Visite de Gábor', 'Visita de Gábor', 'Wizyta Gábora', 'Vizita lui Gábor', 'Návšteva Gábora'), price: say(l)('200 €', '€ 200', '€200', '200 €', '200 €', '200 €', '200 €', '200 €', '200 €') }),
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
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), days: 14, price: say(l)('25 €', '€ 25', '€25', '25 €', '25 €', '25 €', '25 €', '25 €', '25 €'),
    expiresOn: say(l)('2026. október 28.', '28 oktober 2026', '28 October 2026', '28. Oktober 2026', '28 octobre 2026', '28 de octubre de 2026', '28 października 2026', '28 octombrie 2026', '28. októbra 2026'),
    renewUrl: `${SITE_URL}/listing/renew?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  expiryReminderLast: (l) => lifecycleEmails.expiryReminder(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), days: 3, price: say(l)('25 €', '€ 25', '€25', '25 €', '25 €', '25 €', '25 €', '25 €', '25 €'),
    expiresOn: say(l)('2026. október 28.', '28 oktober 2026', '28 October 2026', '28. Oktober 2026', '28 octobre 2026', '28 de octubre de 2026', '28 października 2026', '28 octombrie 2026', '28. októbra 2026'),
    renewUrl: `${SITE_URL}/listing/renew?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  listingExpired: (l) => lifecycleEmails.listingExpired(l, {
    ref: SAMPLE_REF, title: TITLES[l], price: say(l)('25 €', '€ 25', '€25', '25 €', '25 €', '25 €', '25 €', '25 €', '25 €'), renewUrl: `${SITE_URL}/listing/renew?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  listingRenewed: (l) => lifecycleEmails.renewed(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), expiresOn: say(l)('2027. április 28.', '28 april 2027', '28 April 2027', '28. April 2027', '28 avril 2027', '28 de abril de 2027', '28 kwietnia 2027', '28 aprilie 2027', '28. apríla 2027'),
  }),
  renewalTransfer: (l) => lifecycleEmails.renewalTransfer(l, {
    ref: SAMPLE_REF, title: TITLES[l], amount: say(l)('25 €', '€ 25', '€25', '25 €', '25 €', '25 €', '25 €', '25 €', '25 €'), account: 'NL35 RABO 0360284973 · BIC RABONL2U',
    reference: `#${SAMPLE_REF} ${say(l)('hosszabbítás', 'verlenging', 'extension', 'Verlängerung', 'prolongation', 'prórroga', 'przedłużenie', 'prelungire', 'predĺženie')}`, payUrl: `${SITE_URL}/listing/renew?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
  }),
  ownerRefresh: (l) => lifecycleEmails.ownerRefresh(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), price: say(l)('178 000 €', '€ 178.000', '€178,000', '178.000 €', '178 000 €', '178.000 €', '178\u00a0000 €', '178.000 €', '178\u00a0000 €'),
    stillUrl: `${SITE_URL}/listing/still-available?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    priceUrl: `${SITE_URL}/listing/price?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    soldUrl: `${SITE_URL}/listing/sold?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    validUntil: say(l)('2026. november 13.', '13 november 2026', '13 November 2026', '13. November 2026', '13 novembre 2026', '13 de noviembre de 2026', '13 listopada 2026', '13 noiembrie 2026', '13. novembra 2026'),
  }),
  ownerRefreshReminder: (l) => lifecycleEmails.ownerRefresh(l, {
    ref: SAMPLE_REF, title: TITLES[l], url: sampleUrl(l), price: say(l)('178 000 €', '€ 178.000', '€178,000', '178.000 €', '178 000 €', '178.000 €', '178\u00a0000 €', '178.000 €', '178\u00a0000 €'), reminder: true,
    stillUrl: `${SITE_URL}/listing/still-available?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    priceUrl: `${SITE_URL}/listing/price?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    soldUrl: `${SITE_URL}/listing/sold?p=sample&t=${SAMPLE_TOKEN}&l=${l}`,
    validUntil: say(l)('2026. november 13.', '13 november 2026', '13 November 2026', '13. November 2026', '13 novembre 2026', '13 de noviembre de 2026', '13 listopada 2026', '13 noiembrie 2026', '13. novembra 2026'),
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
