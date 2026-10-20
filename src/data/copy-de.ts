/**
 * Seiteninhalte, Deutsch (Sie-Form).
 *
 * Für Käufer und Verkäufer in Deutschland, Österreich und der Schweiz,
 * geschrieben aus denselben Fakten wie die ungarischen und niederländischen
 * Texte: Zahlen kommen aus src/config/company.ts, nie aus dieser Datei.
 * Gegen den ungarischen Text typgeprüft; ein fehlender Schlüssel bricht den Build.
 *
 * Geschütztes Leerzeichen ( ) vor "%" und "€", wie im Deutschen üblich.
 */

import { COMPANY, COMMISSION, formatHours, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'de' as const;
const pct = (n: number) => `${n} %`;

export const DE = {
  home: {
    meta: {
      title: 'FODEL Immobilien | Immobilien in Ungarn direkt vom Eigentümer kaufen',
      description:
        'Häuser, Höfe und Landgüter in Ungarn, oft direkt vom Eigentümer. Betreuung in Ihrer Sprache und zweisprachige Kaufverträge.',
    },
    hero: {
      eyebrow: `Seit 2013 · ${foundedInLabel(L)}`,
      title: ['Immobilien', 'in Ungarn', 'direkt vom Eigentümer'],
      emphasis: 1,
      body: 'Bei einem großen Teil unseres Angebots ist der Eigentümer selbst genannt. Sie verhandeln direkt oder überlassen uns die gesamte Abwicklung.',
      primary: 'Immobilien ansehen',
      secondary: 'Kostenloser Suchauftrag',
      featuredLabel: 'Empfohlen',
    },
    audiences: [
      {
        eyebrow: 'Für Käufer',
        title: 'Immobilien direkt\nvom Eigentümer',
        body: 'Authentische ungarische Häuser, Höfe, Landgüter und Weingüter. Nehmen Sie direkt Kontakt mit dem Eigentümer auf oder lassen Sie FODEL den gesamten Ablauf übernehmen.',
        cta: 'Immobilien ansehen',
        to: 'properties',
      },
      {
        eyebrow: 'Für Verkäufer',
        title: 'Ihre ungarische Immobilie\nin Westeuropa',
        body: `Inserieren Sie in ${REACH_LANGUAGES} Sprachen in ${REACH_COUNTRIES} Ländern, ohne Alleinvermittlungsvertrag. Provision fällt nur an, wenn wir den Käufer vermitteln.`,
        cta: 'Mehr erfahren',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Auswahl', title: 'Empfohlene Immobilien' },
    quote: '„Niederländer glauben oft ihren Augen nicht, wenn sie sehen, was man in Ungarn für welchen Preis kaufen kann.“',
    quoteSource: `${BRAND.de.name} · ${SITE_HOST}`,
    how: { eyebrow: 'So funktioniert es', title: 'So arbeitet FODEL' },
    cta: {
      eyebrow: 'Kontakt aufnehmen',
      title: 'Wir rufen Sie',
      titleEm: 'gerne zurück',
      body: `${formatHours(L)} · Der Rückruf kostet Sie nichts.`,
    },
    referral: {
      eyebrow: 'Empfehlungsprogramm',
      title: 'Empfehlen Sie einen Inserenten,',
      titleEm: `erhalten Sie ${pct(10)}`,
      body: `Gibt jemand auf Ihre Empfehlung ein Inserat bei FODEL auf, erhält er ${pct(10)} Rabatt auf sein Paket, und wir schreiben Ihnen ${pct(10)} auf Ihr nächstes Inserat gut. Inserieren Sie bereits bei uns? Ihren persönlichen Empfehlungscode finden Sie im Portal unter „Instellingen“ (Einstellungen).`,
      steps: [
        'Empfehlen Sie einen Bekannten mit dem Formular unten oder teilen Sie Ihren persönlichen Link aus dem Portal',
        'Ein Mitarbeiter nimmt Kontakt mit ihm auf',
        `Gibt er ein Inserat auf, spart er ${pct(10)}, und wir schreiben Ihnen ${pct(10)} gut`,
      ],
      formTitle: 'Empfehlen Sie einen Bekannten',
      fields: {
        referrerName: 'Ihr Name',
        referrerEmail: 'Ihre E-Mail-Adresse',
        referredName: 'Name der empfohlenen Person',
        referredEmail: 'E-Mail-Adresse der empfohlenen Person',
      },
      submit: 'Empfehlung senden',
    },
  },

  steps: [
    {
      num: '01',
      title: `Angebot in ${REACH_COUNTRIES} Ländern`,
      body: `Wir inserieren in ${REACH_LANGUAGES} Sprachen in den Niederlanden, Belgien, Deutschland, England und weiteren EU-Ländern, ohne Alleinvermittlungsvertrag mit dem Verkäufer.`,
    },
    {
      num: '02',
      title: 'Direkter Kontakt',
      body: 'Bei vielen Inseraten stehen neben unseren Daten auch Name und Nummer des Eigentümers. Regeln Sie es untereinander, fällt für niemanden Provision an.',
    },
    {
      num: '03',
      title: 'Vollständige Abwicklung',
      body: 'Zweisprachiger Kaufvertrag, Vertretung per Vollmacht, Eintragung im Grundbuch und Ummeldung der Versorgungsverträge.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Gegründet' },
    { value: String(REACH_COUNTRIES), label: 'Länder' },
    { value: String(REACH_LANGUAGES), label: 'Sprachen' },
    { value: pct(COMMISSION.percent), label: 'Provision' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Für Verkäufer | Ihre ungarische Immobilie in Westeuropa',
      description: `Inserieren Sie Ihre ungarische Immobilie in ${REACH_LANGUAGES} Sprachen in ${REACH_COUNTRIES} Ländern, ab ${eur(69, L)} und ohne Exklusivität. Provision nur, wenn FODEL den Käufer vermittelt: ${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} niederländische USt.`,
    },
    hero: {
      eyebrow: 'Für Verkäufer',
      title: 'Ihre Immobilie',
      titleEm: 'in Westeuropa',
      body: `Mit dem Modell von FODEL erscheint Ihre Immobilie in ${REACH_LANGUAGES} Sprachen in ${REACH_COUNTRIES} Ländern, ohne Alleinvermittlungsvertrag. Wir arbeiten ausschließlich mit seriösen Käufern.`,
      cta: 'Inserat aufgeben',
      secondary: 'Preise ansehen',
    },
    benefits: {
      eyebrow: 'Ihre Vorteile',
      title: 'Was ein ausländischer Käufer mitbringt',
      points: [
        'Käufer mit Eigenkapital: kein Warten auf eine Hypothek oder Förderung.',
        'Zahlung in einer Summe per Banküberweisung, schnell und sicher.',
        `Ernsthafte Absicht: Eine Besichtigung kostet sie zwei Tage und ${eur(200, L)} bis ${eur(300, L)}.`,
        'Realistische Preisfindung: Es wird nicht unvernünftig gefeilscht.',
        'FODEL prüft den Käufer persönlich, bevor ein Termin zustande kommt.',
      ],
    },
    personas: {
      eyebrow: 'Die Käufer',
      title: 'Wer über FODEL kauft',
      items: [
        {
          title: 'Ruheständler',
          body: 'Suchen niedrigere Lebenshaltungskosten, steuerliche Vorteile und bezahlbare medizinische Versorgung in Ungarn.',
        },
        {
          title: 'Familien',
          body: 'Suchen Platz, Natur und ein Leben auf dem Land. Oft einen Bauernhof, ein Gehöft oder ein Ferienhaus.',
        },
        {
          title: 'Investoren',
          body: 'Suchen Gewerbeimmobilien, Weinberge und landwirtschaftliche Flächen.',
        },
        {
          title: 'Lifestyle-Auswanderer',
          body: 'Lassen hohe Wohnkosten und Trubel hinter sich und suchen einen authentischen europäischen Lebensstil.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Schritt für Schritt', title: 'Das FODEL-Modell' },
    commission: {
      eyebrow: 'Preise',
      title: 'Provision nur bei\nerfolgreichem Verkauf',
      body: `Nimmt der Käufer direkt Kontakt mit Ihnen auf und benötigen Sie unsere Hilfe nicht, zahlen Sie nichts über die Inseratskosten hinaus. Vermittelt FODEL den Verkauf, gilt: ${pct(COMMISSION.percent)} netto (mind. ${eur(COMMISSION.minimumEur, L)}) + ${pct(COMMISSION.vatPercent)} niederländische USt.`,
      cta: 'Preise ansehen',
    },
  },

  buyers: {
    meta: {
      title: 'Für Käufer | Eine Immobilie in Ungarn kaufen',
      description:
        'So kaufen Sie sicher eine Immobilie in Ungarn: zweisprachiger Vertrag, Vertretung per Vollmacht, Eintragung im Grundbuch. Dazu ein kostenloser Suchservice.',
    },
    hero: {
      eyebrow: 'Für Käufer',
      title: 'Kaufen in Ungarn,',
      titleEm: 'ohne Überraschungen',
      body: 'Bei vielen unserer Angebote ist der Eigentümer selbst genannt. Sie verhandeln direkt oder überlassen uns die gesamte Abwicklung.',
      cta: 'Immobilien ansehen',
      secondary: 'Kostenloser Suchauftrag',
    },
    services: {
      eyebrow: 'Was wir übernehmen',
      title: 'Umfassende Begleitung',
      points: [
        'Die Kommunikation zwischen Ihnen und dem Verkäufer, einschließlich Dolmetschern.',
        'Besichtigungen, begleitet von einem Kollegen, der Ihre Sprache spricht.',
        'Unterstützung bei der Preisverhandlung und bei der Erstellung des zweisprachigen Vertrags.',
        'Vertretung per Vollmacht: Für die Unterzeichnung müssen Sie nicht nach Ungarn reisen.',
        'Eintragung im Grundbuch und Ummeldung der Versorgungsverträge.',
      ],
    },
    reasons: {
      eyebrow: 'Warum Ungarn',
      title: 'Wonach Käufer aus Westeuropa suchen',
    },
  },

  about: {
    meta: {
      title: 'Über uns | Eine Brücke zwischen zwei Welten',
      description:
        'Seit 2013 bringen wir ungarische Verkäufer und westeuropäische Käufer zusammen. Diskret, transparent und ohne Alleinvermittlungsvertrag.',
    },
    hero: {
      eyebrow: 'Über uns',
      title: 'Eine Brücke zwischen',
      titleEm: 'zwei Welten',
      body: 'Seit 2013 helfen wir ungarischen Verkäufern, den richtigen ausländischen Käufer zu finden: diskret, wirksam und ohne Alleinvermittlungsvertrag.',
    },
    origin: {
      eyebrow: 'Der Anfang · Almere-Buiten, 2013',
      quote:
        '„In Almere-Buiten lebend, sahen wir, wie sehr sich die Niederländer nach einem authentischen europäischen Lebensstil sehnen, während in Ungarn die schönsten Immobilien unbemerkt auf einen Eigentümer warten.“',
    },
    values: {
      eyebrow: 'Unsere Grundsätze',
      title: 'Worauf wir bauen',
      items: [
        {
          num: '01',
          title: 'Diskretion',
          body: 'Daten von Verkäufern und Käufern behandeln wir mit größtmöglicher Sorgfalt. Persönliche Angaben erscheinen nur mit Einwilligung.',
        },
        {
          num: '02',
          title: 'Transparenz',
          body: 'Keine versteckten Kosten. Unsere Preise und Provisionen stehen öffentlich auf dieser Website, und wir informieren Sie bei jedem Schritt.',
        },
        {
          num: '03',
          title: 'Zweisprachigkeit',
          body: 'Wir kennen beide Märkte von innen. Unser Team spricht Niederländisch, Deutsch, Englisch, Französisch und Ungarisch.',
        },
      ],
    },
    approach: {
      eyebrow: 'Unser Ansatz',
      title: 'Wir sind keine große Agentur.',
      titleEm: 'Das ist unsere Stärke.',
      points: [
        'Jeder Kunde hat einen persönlichen Ansprechpartner: kein Callcenter, kein anonymer Schalter.',
        'Wir kennen beide Kulturen von innen und beurteilen Immobilien mit niederländischem wie mit ungarischem Blick.',
        'Immobilie und Käufer zusammenzubringen ist unsere Aufgabe und keine Frage des Zufalls.',
        'Wir arbeiten ohne Exklusivität, weil wir lieber mit Ergebnissen überzeugen.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Die Brücke, die wir',
      titleEm: 'gebaut haben',
      paragraphs: [
        'FODEL wurde von in den Niederlanden lebenden Ungarn gegründet. Wir haben 2013 in Almere-Buiten angefangen und dort gemerkt, wie viele Niederländer und Belgier ein authentisches ungarisches Haus kaufen wollten, aber nicht wussten, wie sie anfangen sollten.',
        `Heute inserieren wir in ${REACH_COUNTRIES} Ländern und ${REACH_LANGUAGES} Sprachen und begleiten jede Transaktion von Anfang bis Ende: zweisprachiger Kaufvertrag, Vertretung per Vollmacht und Eintragung im Grundbuch. Unser Büro befindet sich in Den Haag.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Wir rufen Sie gerne zurück',
      description: `Rufen Sie uns werktags zwischen ${COMPANY.hours.weekdays.from} und ${COMPANY.hours.weekdays.to} Uhr an oder bitten Sie um einen Rückruf. Das Gespräch kostet Sie nichts.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Wir rufen Sie', titleEm: 'gerne zurück' },
    formTitle: 'Rückruf anfordern',
    subjects: [
      'Frage zu einer Immobilie',
      'Inserieren',
      'Preise anfragen',
      'Rückrufwunsch',
      'Sonstiges',
    ],
    note: `Der Rückruf kostet Sie nichts, wir übernehmen die Gesprächskosten. Wir rufen bis ${COMPANY.hours.callback.to} Uhr zurück, auch am Wochenende.`,
  },
} satisfies CopyShape;
