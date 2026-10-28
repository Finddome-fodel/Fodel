/**
 * Ausführliche Seiten, Deutsch (Sie-Form): Leistungen, Agrarimmobilien,
 * Kaufratgeber, Auswandern nach Ungarn, Foto-Ratgeber. Zahlen kommen aus
 * src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'de' as const;
const pct = (n: number) => `${n} %`;
const ab = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `ab ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_DE = {
  services: {
    metaTitle: 'Leistungen: Abwicklung, Vertrag, Fotografie',
    metaDescription: `Zweisprachiger Kaufvertrag ${ab('hu')}, Vertretung per Vollmacht, Grundbucheintragung, Energieausweis, Immobilienfotografie und Drohnenaufnahmen.`,
    eyebrow: 'Leistungen',
    title: 'Was wir über das',
    titleEm: 'Inserat hinaus tun',
    intro:
      'Das Inserat ist nur der erste Schritt. Mit den folgenden Leistungen nehmen wir Ihnen den gesamten Kaufprozess ab, nach den Regeln beider Länder.',
    sections: [
      {
        type: 'steps',
        title: 'So läuft der Verkauf ab',
        items: [
          { n: '01', t: 'Kontakt', b: 'Beratung per Telefon und E-Mail, Kommunikation mit beiden Parteien, einschließlich Dolmetschern.' },
          { n: '02', t: 'Prüfung des Käufers', b: 'Wir prüfen Hintergrund, Kaufabsicht und finanzielle Lage.' },
          { n: '03', t: 'Besichtigung', b: 'Wir planen die Termine und begleiten Sie mit einem Kollegen, der Ihre Sprache spricht.' },
          { n: '04', t: 'Verhandlung', b: 'Unterstützung in beiden Sprachen, innerhalb einer realistischen Preisspanne.' },
          { n: '05', t: 'Vertrag', b: 'Zweisprachiger Kaufvertrag, gemeinsam mit einem Rechtsanwalt erstellt.' },
          { n: '06', t: 'Abschluss', b: 'Grundbuch, Versorgungsverträge und bei Bedarf Vertretung per Vollmacht.' },
        ],
      },
      {
        type: 'table',
        title: 'Zweisprachiger Kaufvertrag',
        intro: 'Richtpreise je Sprachkombination. Der endgültige Preis hängt vom Umfang ab.',
        rows: [
          ['Ungarisch', ab('hu')],
          ['Deutsch–Ungarisch', ab('de-hu')],
          ['Englisch–Ungarisch', ab('en-hu')],
          ['Niederländisch–Ungarisch', ab('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Zusätzliche Leistungen',
        intro: 'Dafür erstellen wir ein individuelles Angebot:',
        items: [
          'Beantragung des Energieausweises: nach EU-Vorgaben im Inserat verpflichtend',
          'Professionelle Immobilienfotografie',
          'Drohnenaufnahmen: besonders wirkungsvoll bei großen Grundstücken und schöner Aussicht',
          `Video zum Inserat (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Vertretung per Vollmacht',
        body: 'Sie müssen für die Unterzeichnung nicht nach Ungarn reisen: Mit einer Vollmacht vertreten wir Sie bei der Unterzeichnung, beim Grundbuchamt und bei der Ummeldung der Versorgungsverträge.',
      },
      {
        type: 'prose',
        title: 'Wann Provision anfällt',
        paragraphs: [
          `Provision berechnen wir ausschließlich, wenn FINDDOME den Käufer vermittelt hat, ein schriftlicher Kaufvertrag vorliegt und die Anzahlung geleistet ist. Der Satz beträgt ${pct(COMMISSION.percent)} netto, mindestens ${eur(COMMISSION.minimumEur, L)}, zuzüglich ${pct(COMMISSION.vatPercent)} niederländische USt. Zahlen muss der Verkäufer, nicht der Käufer.`,
        ],
      },
      {
        type: 'cta',
        title: 'Fragen zum Ablauf',
        body: '{hours} Bitten Sie kostenlos um einen Rückruf oder schreiben Sie uns.',
        primary: { label: 'Kontakt aufnehmen', to: 'contact' },
        secondary: { label: 'Häufige Fragen', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Agrarimmobilien: bis zu ${AGRI_HECTARE_LIMIT} Hektar in Ungarn`,
    metaDescription: `Ein EU-Bürger mit landwirtschaftlicher Qualifikation darf in Ungarn bis zu ${AGRI_HECTARE_LIMIT} Hektar Land erwerben. FINDDOME übernimmt das gesamte Verfahren.`,
    eyebrow: 'Agrarimmobilien',
    title: 'Ackerland und',
    titleEm: 'Landgüter',
    intro:
      'Der ungarische Bodenmarkt folgt eigenen Regeln. Wer die Voraussetzungen kennt, erhält Zugang zu Weingütern, Äckern, Höfen und Wald.',
    sections: [
      {
        type: 'prose',
        title: `Die Grenze von ${AGRI_HECTARE_LIMIT} Hektar`,
        paragraphs: [
          `Ein EU-Bürger mit landwirtschaftlicher Qualifikation darf in Ungarn insgesamt ${AGRI_HECTARE_LIMIT} Hektar Land erwerben. Dieses Verfahren übernehmen wir vollständig.`,
          'Der Weg besteht aus mehreren Schritten bei den Behörden und beginnt mit der Anerkennung Ihrer Qualifikation. Unser Team begleitet den gesamten Prozess und erstellt die nötigen Unterlagen in beiden Sprachen.',
        ],
      },
      {
        type: 'list',
        title: 'Was unsere Kunden erwerben',
        items: [
          'Weingüter, mit oder ohne betriebsfähigen Keller',
          'Ackerland, förderfähig durch die EU',
          'Höfe mit Nebengebäuden, geeignet für Viehhaltung',
          'Waldflächen und gemischt genutzte Landgüter',
          'Größere zusammenhängende Flächen als Kapitalanlage',
        ],
      },
      {
        type: 'steps',
        title: 'Der Ablauf',
        items: [
          { n: '01', t: 'Beratungsgespräch', b: 'Wir besprechen Ihre Pläne und das verfügbare Budget.' },
          { n: '02', t: 'Anerkennung der Qualifikation', b: 'Wir kümmern uns um die Anerkennung Ihrer landwirtschaftlichen Qualifikation in Ungarn.' },
          { n: '03', t: 'Suche', b: 'Mit unseren Partnern suchen wir Land, das die Voraussetzungen erfüllt.' },
          { n: '04', t: 'Genehmigungen', b: 'Beantragung der erforderlichen Genehmigungen für den Landerwerb.' },
          { n: '05', t: 'Kauf', b: 'Zweisprachiger Vertrag, Grundbucheintragung, Übertragung von Förderanträgen.' },
        ],
      },
      {
        type: 'callout',
        title: 'Wichtig',
        body: 'Die Regeln für den Erwerb von Agrarland ändern sich von Zeit zu Zeit und hängen von Ihrer persönlichen Situation ab. Die Angaben hier dienen nur der Information. Sprechen Sie bei einem konkreten Vorhaben immer mit uns und mit einem spezialisierten Juristen.',
      },
      {
        type: 'cta',
        title: 'Sie suchen eine Agrarimmobilie',
        body: 'Teilen Sie uns Ihre Wünsche mit; wir suchen auch außerhalb der inserierten Angebote.',
        primary: { label: 'Kostenloser Suchauftrag', to: 'searchRequest' },
        secondary: { label: 'Unsere Immobilien', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Kaufen in Ungarn: der Ablauf Schritt für Schritt',
    metaDescription:
      'So läuft ein Kauf in Ungarn für ausländische Käufer ab: Vertrag, Anzahlung, Grundbuch, Versorgungsverträge und die zu erwartenden Kosten.',
    eyebrow: 'Für Käufer',
    title: 'Kaufen in',
    titleEm: 'Ungarn',
    intro:
      'Der ungarische Kaufprozess ist gut planbar, sobald Sie die Schritte kennen. Dieser Ratgeber führt Sie durch sie hindurch.',
    sections: [
      {
        type: 'steps',
        title: 'Der Ablauf',
        items: [
          { n: '01', t: 'Auswahl', b: 'Sie wählen aus unserem Angebot oder geben einen kostenlosen Suchauftrag auf.' },
          { n: '02', t: 'Besichtigung', b: 'Wir organisieren Reise und Besichtigung, mit Dolmetscher.' },
          { n: '03', t: 'Angebot', b: 'Wir helfen Ihnen, ein realistisches Angebot abzugeben und zu verhandeln.' },
          { n: '04', t: 'Vertrag und Anzahlung', b: `Zweisprachiger Kaufvertrag, in der Regel mit ${pct(10)} Anzahlung.` },
          { n: '05', t: 'Kaufpreis', b: 'Der restliche Kaufpreis per Banküberweisung, gemäß Vertrag.' },
          { n: '06', t: 'Übergabe', b: 'Grundbucheintragung, Versorgungsverträge, Schlüsselübergabe.' },
        ],
      },
      {
        type: 'list',
        title: 'Kosten neben dem Kaufpreis',
        items: [
          'Grunderwerbsteuer: Der Satz hängt von der Art des Objekts und Ihrer Situation ab',
          'Anwaltskosten für das Erstellen und Gegenzeichnen der Urkunde',
          `Übersetzung des zweisprachigen Vertrags: ${ab('hu')}, je nach Sprachkombination`,
          'Grundbuchgebühren',
          'Gegebenenfalls Provision für FINDDOME: Die zahlt der Verkäufer, nicht Sie',
        ],
      },
      {
        type: 'prose',
        title: 'Sie müssen nicht vor Ort sein',
        paragraphs: [
          'Mit einer Vollmacht vertreten wir Sie bei der Unterzeichnung, beim Grundbuchamt und bei der Ummeldung der Versorgungsverträge. Der Kauf kann also auch stattfinden, wenn Sie nicht reisen können oder wollen.',
        ],
      },
      {
        type: 'callout',
        title: 'Energieausweis',
        body: 'In Ungarn ist ein Energieausweis Pflicht, der nach EU-Vorgaben auch im Inserat stehen muss. Bei unseren Angeboten finden Sie die Energieklasse unter den Merkmalen; „In Bearbeitung“ bedeutet, dass der Ausweis noch erstellt wird.',
      },
      {
        type: 'cta',
        title: 'Fangen wir an',
        body: 'Sehen Sie sich das Angebot an oder sagen Sie uns, was Sie suchen. Das kostet Sie nichts.',
        primary: { label: 'Unsere Immobilien', to: 'properties' },
        secondary: { label: 'Kostenloser Suchauftrag', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Auswandern nach Ungarn: warum Niederländer den Schritt wagen',
    metaDescription:
      'Die vier Gründe, warum Niederländer und Belgier nach Ungarn ziehen: Preis-Leistungs-Verhältnis, Platz, niedrigere Kosten und Lage.',
    eyebrow: 'Hintergrund',
    title: 'Auswandern nach',
    titleEm: 'Ungarn',
    intro:
      'Viele Niederländer und Belgier entscheiden sich für Ungarn. In Hunderten von Gesprächen mit unseren Kunden kehren immer dieselben vier Gründe wieder.',
    sections: [
      {
        type: 'prose',
        title: 'Preis-Leistungs-Verhältnis',
        paragraphs: [
          'Ländliche Immobilien in Ungarn gehören beim Preis-Leistungs-Verhältnis zu den besten Europas. Ein Baugrundstück von 125 m² kostet in den Niederlanden schnell 88.000 €, eine Garage rund 100.000 €. Für denselben Betrag erhalten Sie auf dem ungarischen Land ein geräumiges Familienhaus, oft mit viel Grund.',
        ],
      },
      {
        type: 'prose',
        title: 'Platz',
        paragraphs: [
          'Die Niederlande haben eine Bevölkerungsdichte von 482 Einwohnern pro km² bei etwa 17 Millionen Einwohnern, und ein erheblicher Teil des Landes besteht aus Wasser. Der Mangel an Platz ist kein abstraktes Problem, sondern eine tägliche Erfahrung und der am häufigsten genannte Grund.',
        ],
      },
      {
        type: 'prose',
        title: 'Lebenshaltungskosten',
        paragraphs: [
          'Ein großer Teil unserer Käufer ist Rentner oder kurz davor. Für sie ergeben die niedrigeren Lebenshaltungskosten, das Fehlen einer Grundsteuer und die bezahlbare medizinische Versorgung zusammen einen Lebensstandard, der mit derselben Rente in den Niederlanden nicht möglich wäre.',
        ],
      },
      {
        type: 'prose',
        title: 'Lage',
        paragraphs: [
          'Seit der Sturmflut von 1953 haben die Niederlande ein gewaltiges System zum Schutz vor dem Wasser gebaut. Die Sorge vor dem steigenden Meeresspiegel spielt bei vielen Entscheidungen mit: Ungarn liegt mitten auf dem Kontinent und über dem Meeresspiegel.',
        ],
      },
      {
        type: 'cta',
        title: 'Ungarn erkunden',
        body: 'Sehen Sie sich unser Angebot an oder lassen Sie uns nach dem suchen, was Ihnen vorschwebt.',
        primary: { label: 'Unsere Immobilien', to: 'properties' },
        secondary: { label: 'Kaufen in Ungarn', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Foto-Ratgeber für Inserenten',
    metaDescription:
      'Gute Fotos sind das wichtigste Mittel für einen schnellen Verkauf. Der FINDDOME-Foto-Ratgeber: Licht, Ausrichtung, Auflösung und die häufigsten Fehler.',
    eyebrow: 'Für Verkäufer',
    title: 'Ratgeber für',
    titleEm: 'gute Fotos',
    intro:
      'Interessenten aus dem Ausland sehen zuerst die Fotos, oft nur die Fotos. Diese Regeln bewirken mehr als jeder Inseratstext.',
    sections: photoGuideSections(L, {
      topTitle: 'Die sechs wichtigsten Regeln',
      calloutTitle: 'Lieber auslagern',
      calloutBody: (lines) =>
        `Holen Sie einen Profi dazu. Sie wählen das mit einem Klick, wenn Sie Ihr Inserat aufgeben: ${lines.join('; ')}. Beides ist optional; ein Mitarbeiter meldet sich bei Ihnen, um einen Termin zu vereinbaren.`,
      ctaTitle: 'Bereit zum Inserieren',
      primary: 'Inserat aufgeben',
      secondary: 'Preise',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
