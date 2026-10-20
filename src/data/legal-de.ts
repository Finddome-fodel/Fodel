/**
 * Rechtliche Seiten, Deutsch (Sie-Form). Eine sinngetreue Übersetzung der
 * niederländischen Seiten (src/data/pages-legal.ts): gleiche Abschnitte,
 * gleiche Zahlen, gleiche Bedeutung.
 *
 * ⚠️ Übersetzung zur Orientierung. Sie braucht vor dem Start die Freigabe des
 * Auftraggebers und eines Juristen, wie die ungarischen und niederländischen
 * Originale. Alle Sätze, die auf niederländisches oder ungarisches Recht
 * verweisen (DSGVO-Rollen, niederländische USt., die niederländische Behörde,
 * Widerrufsrecht, OS-Plattform), stehen in Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'de' as const;
const pct = (n: number) => `${n} %`;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. Juli 2026';
const notice =
  'Dies ist eine Übersetzung zur Orientierung. Bei Abweichungen gilt das niederländische (in Fragen des niederländischen Rechts) oder das ungarische Original.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_DE = {
  imprint: {
    metaTitle: 'Impressum: Unternehmensangaben',
    metaDescription: `Unternehmensangaben von ${COMPANY.names.legal}: Anschrift, Umsatzsteuer-Identifikationsnummer, KvK-Nummer und Kontaktdaten.`,
    eyebrow: 'Impressum',
    title: 'Unternehmensangaben',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Angaben zum Diensteanbieter',
        rows: [
          ['Firma', COMPANY.names.legal],
          ['Anschrift', addressLine(COMPANY.address, L)],
          ['USt-IdNr.', COMPANY.registration.vat],
          ['KvK-Nummer (niederländisches Handelsregister)', kvk],
          ['Vertreten durch', COMPANY.principal],
          ['E-Mail', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Gegründet', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bankverbindungen',
        rows: [
          ['Niederlande', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Ungarn', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Streitbeilegung',
        body: 'Bei einem Verbraucherstreit können Sie auch die europäische OS-Plattform nutzen: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Datenschutzerklärung',
    metaDescription:
      'Wie FODEL mit Ihren personenbezogenen Daten umgeht: welche Daten wir verarbeiten, wie lange wir sie speichern und welche Rechte Sie nach der DSGVO haben.',
    eyebrow: 'Datenschutz',
    title: 'Erklärung zum',
    titleEm: 'Datenschutz',
    intro:
      'Diese Erklärung beschreibt, wie wir mit den personenbezogenen Daten umgehen, die Sie uns über diese Website mitteilen, gemäß der DSGVO.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Verantwortlicher',
        rows: [
          ['Verantwortlicher', COMPANY.names.legal],
          ['Anschrift', addressLine(COMPANY.address, L)],
          ['E-Mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Welche Daten wir verarbeiten',
        intro: 'Ausschließlich die Daten, die Sie selbst in unsere Formulare eingeben:',
        items: [
          'Name, E-Mail-Adresse und Telefonnummer: um Ihre Anfrage beantworten zu können',
          'Betreff und Inhalt Ihrer Nachricht',
          'Bei einem Inserat: die Angaben zur Immobilie und Ihre Rechnungsdaten',
          'Bei einem Suchauftrag: Ihre Suchkriterien',
          'Für die interne Verwaltung: wann und welches Formular Sie ausgefüllt haben und wann Sie sich im Portal angemeldet haben, ohne eine IP-Adresse zu speichern',
        ],
      },
      {
        type: 'table',
        title: 'Rechtsgrundlage und Speicherdauer',
        rows: [
          ['Kontakt und Rückrufwunsch', 'Einwilligung (Art. 6 Abs. 1 lit. a DSGVO): 12 Monate'],
          ['Inseratsauftrag', 'Vertragserfüllung (Art. 6 Abs. 1 lit. b): 7 Jahre, steuerliche Aufbewahrungspflicht'],
          ['Suchauftrag', 'Einwilligung: bis zum Abschluss, höchstens 24 Monate'],
          ['Interne Aktivitätsprotokolle', 'Berechtigtes Interesse (Art. 6 Abs. 1 lit. f): ordnungsgemäße Verwaltung und Erkennung von Missbrauch: höchstens 24 Monate'],
        ],
      },
      {
        type: 'list',
        title: 'Mit wem wir Daten teilen',
        intro: 'Wir verkaufen Ihre Daten nicht und geben sie nicht zu Werbezwecken weiter. Unsere Auftragsverarbeiter sind:',
        items: [
          'Unser E-Mail-Anbieter, mit Verarbeitung innerhalb der EU',
          'Der Hosting-Anbieter dieser Website',
          'Bei einem Kauf und ausschließlich auf Ihren Wunsch: die Gegenpartei und der beteiligte Rechtsanwalt',
        ],
      },
      {
        type: 'callout',
        title: 'Zu den Inseraten',
        body: 'Als Inserent können Sie uns erlauben, Ihren Namen und Ihre Telefonnummer beim Inserat anzuzeigen, damit Interessenten Sie direkt ansprechen können. Diese Einwilligung können Sie jederzeit widerrufen; wir entfernen die Angaben dann aus dem Inserat.',
      },
      // ENTWURF: wartet auf die rechtliche Prüfung (Newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Newsletter',
        body: 'Wenn Sie unseren Newsletter abonnieren, verarbeiten wir Ihre E-Mail-Adresse, die gewählte Sprache und den Zeitpunkt von Anmeldung und Bestätigung, ausschließlich um Ihnen den Newsletter zu senden, auf Grundlage Ihrer Einwilligung. Die Anmeldung erfolgt in zwei Schritten: Wir senden erst etwas, nachdem Sie auf den Button in der Bestätigungs-E-Mail geklickt haben. In jeder E-Mail können Sie sich mit einem Klick abmelden, dann hören wir sofort auf. Für den Versand nutzen wir den Dienst Resend.',
      },
      {
        type: 'list',
        title: 'Ihre Rechte',
        items: [
          'Auskunft über die Daten, die wir von Ihnen verarbeiten',
          'Berichtigung und Löschung',
          'Einschränkung der Verarbeitung oder Widerspruch dagegen',
          'Datenübertragbarkeit',
          'Widerruf Ihrer Einwilligung jederzeit',
          'Beschwerde bei der niederländischen Datenschutzbehörde (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt zum Datenschutz',
        paragraphs: [`Fragen oder Anliegen können Sie an ${COMPANY.email.primary} senden. Wir antworten spätestens innerhalb von 30 Tagen.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Cookie-Hinweise',
    metaDescription: `Welche Cookies ${SITE_HOST} verwendet und wie Sie Ihre Auswahl ändern.`,
    eyebrow: 'Cookies',
    title: 'Hinweise zu',
    titleEm: 'Cookies',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Diese Website verwendet derzeit ausschließlich technisch notwendigen Speicher. Wir setzen keine Werbe- oder Tracking-Skripte ein und geben nichts an soziale Plattformen weiter.',
        ],
      },
      {
        type: 'table',
        title: 'Was wir speichern',
        rows: [
          [
            'fodel:consent',
            'Ihre Auswahl zu Cookies (akzeptiert oder abgelehnt). Wird in Ihrem Browser gespeichert und erreicht uns nicht. Speicherdauer: 12 Monate.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistiken',
        paragraphs: [
          'Sollten wir künftig Besucherstatistiken erfassen, aktivieren wir sie ausschließlich mit Ihrer vorherigen, ausdrücklichen Einwilligung. Eine Ablehnung schränkt die Nutzung der Website in keiner Weise ein.',
        ],
      },
      {
        type: 'prose',
        title: 'Auswahl ändern',
        paragraphs: [
          'Sie können Ihre Auswahl jederzeit ändern, indem Sie die gespeicherten Browserdaten für diese Website löschen; danach erscheint der Cookie-Hinweis erneut.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Allgemeine Geschäftsbedingungen',
    metaDescription:
      'Die Bedingungen des Inserats- und Vermittlungsdienstes von FODEL: Preise, Provision, Widerruf und Haftung.',
    eyebrow: 'AGB',
    title: 'Allgemeine',
    titleEm: 'Geschäftsbedingungen',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Bitte beachten',
        body: 'Diese Seite ist eine Zusammenfassung. Die vollständigen, maßgeblichen Bedingungen liegen als PDF vor; bei Abweichungen geht das PDF vor.',
      },
      {
        type: 'prose',
        title: '1. Die Leistung',
        paragraphs: [
          'FODEL inseriert ungarische Immobilien auf eigenen mehrsprachigen Websites und wirkt aufgrund einer gesonderten Vereinbarung an der Abwicklung des Verkaufs mit.',
          'Der Inseratsdienst ist nicht exklusiv: Der Verkäufer darf die Immobilie auch über andere Kanäle anbieten und verkaufen.',
        ],
      },
      {
        type: 'list',
        title: '2. Ein Inserat aufgeben',
        ordered: true,
        items: [
          'Der Verkäufer füllt das Anmeldeformular aus.',
          'FODEL sendet eine Zahlungsaufforderung für das gewählte Paket.',
          'Der Verkäufer zahlt per Banküberweisung.',
          'Nach Zahlungseingang erhält der Verkäufer die Berechtigung, Fotos hochzuladen.',
          'FODEL übernimmt die Übersetzung und veröffentlicht das Inserat.',
        ],
      },
      {
        type: 'table',
        title: '3. Preise',
        intro: `Alle Preise enthalten ${pct(LISTING_VAT_PERCENT)} niederländische USt. Die vollständige Übersicht finden Sie auf der Seite Preise.`,
        rows: [
          [`Günstiges Inserat (${cheap.months} Monate)`, eur(cheap.priceEur, L)],
          [`Normales Inserat (${normal.months} Monate)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Übersetzung', `${eur(extra('translation').priceEur, L)} pro Sprache`],
          [
            'Hervorhebung',
            `${extra('category-highlight').priceEur}–${eur(extra('homepage-highlight').priceEur, L)} pro Monat (mind. ${minMonths} Monate)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Provision',
        paragraphs: [
          'Provision fällt nur an, wenn alle folgenden Voraussetzungen erfüllt sind: ein schriftlicher Kaufvertrag, ein von FODEL vermittelter Käufer und eine geleistete Anzahlung.',
          `Die Provision beträgt ${pct(COMMISSION.percent)} netto, mindestens ${eur(COMMISSION.minimumEur, L)}, zuzüglich ${pct(COMMISSION.vatPercent)} niederländische USt.`,
          'Wendet sich der Interessent direkt an den Verkäufer und ist unsere Hilfe bei der Abwicklung nicht nötig, ist über die Inseratskosten hinaus nichts zu zahlen.',
        ],
      },
      {
        type: 'prose',
        title: '5. Inserat zurückziehen',
        paragraphs: [
          'Der Verkäufer kann das Inserat vor Ablauf der Laufzeit zurückziehen. Bereits gezahlte Inseratskosten werden in diesem Fall nicht erstattet.',
        ],
      },
      {
        type: 'prose',
        title: '6. Haftung',
        paragraphs: [
          'Der Verkäufer ist für die Richtigkeit der Angaben zur Immobilie verantwortlich. FODEL gibt die übermittelten Angaben wieder und übernimmt keine Haftung für deren Richtigkeit.',
          'Übersetzungen auf dieser Website dienen der Information; bei einem Streit gilt die ungarische Fassung.',
        ],
      },
      {
        type: 'prose',
        title: '7. Widerrufsrecht',
        paragraphs: [
          'Ein Verkäufer, der Verbraucher ist, hat bei Fernabsatzverträgen das gesetzliche Widerrufsrecht. Verlangt der Verkäufer ausdrücklich die sofortige Ausführung, verringert sich das Widerrufsrecht entsprechend der bereits erbrachten Leistung.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Erklärung zur Barrierefreiheit',
    metaDescription: `Der Stand der Barrierefreiheit von ${SITE_HOST}, der angewandte Standard und wie Sie uns Rückmeldung geben können.`,
    eyebrow: 'Barrierefreiheit',
    title: 'Erklärung zur',
    titleEm: 'Barrierefreiheit',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Wir möchten, dass diese Website für alle nutzbar ist, auch für Besucher, die einen Screenreader, die Tastatur oder eine Vergrößerung verwenden.',
          'Wir entwickeln die Website nach WCAG 2.2, Stufe AA. Ein erheblicher Teil unserer Besucher ist im Ruhestand; Schriftgröße, Kontrast und Tastaturbedienung haben deshalb Vorrang.',
        ],
      },
      {
        type: 'list',
        title: 'Was umgesetzt ist',
        items: [
          'Aller Text hat ein Kontrastverhältnis von mindestens 4,5:1',
          'Vollständige Tastaturbedienung mit sichtbarer Fokusanzeige',
          'Ein Link „Zum Inhalt springen“ am Anfang jeder Seite',
          'Aussagekräftige Alternativtexte für alle Bilder',
          'Formularfelder mit verknüpften Beschriftungen und Fehlermeldungen als Text',
          'Beachtung der Systemeinstellung „Bewegung reduzieren“',
          'Die Website ist auch ohne JavaScript lesbar und nutzbar',
        ],
      },
      {
        type: 'prose',
        title: 'Bekannte Einschränkungen',
        paragraphs: ['Auf die Barrierefreiheit von Inhalten Dritter, etwa eines Kartendienstes, haben wir keinen Einfluss.'],
      },
      {
        type: 'prose',
        title: 'Rückmeldung',
        paragraphs: [
          `Stoßen Sie auf eine Hürde? Teilen Sie es uns unter ${COMPANY.email.primary} oder telefonisch mit. Wir beheben Meldungen so schnell wie möglich.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
