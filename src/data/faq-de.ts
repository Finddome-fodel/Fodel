/**
 * FAQ, Deutsch (Sie-Form). Für Käufer, nach dem Muster der niederländischen
 * Fassung: Alle Zahlen kommen aus src/config/company.ts, nichts hier ist neu.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'de' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);
const pct = (n: number) => `${n} %`;

export const FAQ_DE = [
  {
    id: 'direkt-vom-eigentuemer',
    question: 'Was bedeutet „direkt vom Eigentümer“?',
    answer: [
      'Bei einem großen Teil unseres Angebots veröffentlichen wir neben unseren eigenen Daten auch Namen und Telefonnummer des Eigentümers. Sie können den Verkäufer also direkt kontaktieren.',
      'Nehmen Sie direkt Kontakt auf und regeln den Kauf selbst, fällt für niemanden Provision an: weder für Sie noch für den Verkäufer. Wir werden dann nur für das Inserat bezahlt.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'provision',
    question: 'Was kostet Ihre Vermittlung?',
    answer: [
      `Unsere Provision beträgt ${pct(COMMISSION.percent)} netto, mindestens ${eur(COMMISSION.minimumEur, L)}, zuzüglich ${pct(COMMISSION.vatPercent)} niederländische USt. Sie wird vom ungarischen Verkäufer gezahlt, nicht von Ihnen.`,
      'Berechnet wird sie nur, wenn alle drei Bedingungen erfüllt sind: Es gibt einen schriftlichen Kaufvertrag, der Käufer wurde von FINDDOME vermittelt, und die Anzahlung ist geleistet.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'kaufen-als-eu-buerger',
    question: 'Kann ich als EU-Bürger eine Immobilie in Ungarn kaufen?',
    answer: [
      'Ja. Als EU-Bürger kaufen Sie Häuser und Grundstücke in Ungarn zu nahezu denselben Bedingungen wie ein Ungar. Fast 100 % der ungarischen Immobilien stehen auf Eigenland. Erbbaurecht oder Erbpacht, wie es sie in den Niederlanden gibt, kommt kaum vor.',
      `Für landwirtschaftliche Flächen gelten eigene Regeln. Ein EU-Bürger mit landwirtschaftlicher Qualifikation darf in Ungarn bis zu ${AGRI_HECTARE_LIMIT} Hektar erwerben; dieses Verfahren übernehmen wir vollständig.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'anreise-zur-unterschrift',
    question: 'Muss ich zum Unterschreiben nach Ungarn reisen?',
    answer: [
      'Nein. Wir können Sie in Ungarn per Vollmacht vertreten, sodass Sie für die Unterzeichnung nicht anreisen müssen.',
      'Auch die Eintragung im ungarischen Grundbuch und die Ummeldung der Versorgungsverträge übernehmen wir.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'zweisprachiger-vertrag',
    question: 'In welcher Sprache wird der Kaufvertrag verfasst?',
    answer: [
      'Wir lassen zweisprachige Kaufverträge erstellen, damit Sie lesen können, was Sie unterschreiben.',
      `Preisrahmen: Ungarisch ab ${price('hu')}, Deutsch–Ungarisch und Englisch–Ungarisch ab ${price('de-hu')}, Niederländisch–Ungarisch ab ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'was-fodel-uebernimmt',
    question: 'Was genau übernimmt FINDDOME bei einem Kauf?',
    answer: [
      '- Beratung per Telefon und E-Mail sowie die Kommunikation zwischen beiden Parteien',
      '- Persönliche Termine und Besichtigungen vor Ort',
      '- Ein Kollege, der Ihre Sprache spricht und mit Ihnen reist',
      '- Unterstützung bei der Preisverhandlung',
      '- Vorbereitung des mehrsprachigen Vertrags',
      '- Die vollständige Abwicklung des Kaufs',
      '- Eintragung des neuen Eigentümers und Ummeldung der Versorgungsverträge',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'warum-ungarn',
    question: 'Warum entscheiden sich Käufer aus Westeuropa für Ungarn?',
    answer: [
      '- Immobilien und Lebenshaltungskosten liegen deutlich niedriger',
      '- In Ungarn wird in der Regel keine Grundsteuer erhoben',
      '- Mehr Sonne und ein angenehmeres Klima',
      '- Das Land liegt über dem Meeresspiegel, mitten auf dem Kontinent',
      '- Ungarn ist EU-Mitgliedstaat',
      '- Fast alle Immobilien stehen auf Eigenland',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energieausweis',
    question: 'Hat eine ungarische Immobilie einen Energieausweis?',
    answer: [
      'Ja. Ungarn schreibt einen Energieausweis (energiatanúsítvány) vor, und er muss im Inserat angegeben werden. Bei unseren Angeboten steht die Energieklasse unter den Merkmalen; „In Bearbeitung“ bedeutet, dass der Ausweis noch erstellt wird.',
      'Auf Wunsch lassen wir den Ausweis für den Verkäufer erstellen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'suchauftrag',
    question: 'Was ist der Suchauftrag und was kostet er?',
    answer: [
      'Der Suchauftrag ist kostenlos. Sie teilen uns mit, was Sie suchen (Typ, Region, Budget und Wünsche), und wir suchen für Sie, auch außerhalb des Angebots auf dieser Website.',
      'Unsere ungarischsprachigen Kollegen unterstützen bei der Verhandlung und sorgen dafür, dass der Vertrag rechtlich korrekt aufgesetzt wird. Sie erhalten eine E-Mail, sobald etwas Passendes auftaucht.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'welche-regionen',
    question: 'In welchen Regionen haben Sie Angebote?',
    answer: [
      'Der Schwerpunkt liegt in Transdanubien, mit den Komitaten Baranya, Tolna, Zala, Somogy und Veszprém sowie dem Balaton (Plattensee) und dem Balaton-Hochland.',
      'Außerdem haben wir Angebote in der Tiefebene und in Gebieten mit guter Anbindung an den Flughafen Budapest.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'sprachbarriere',
    question: 'Ich spreche kein Ungarisch. Ist das ein Problem?',
    answer: [
      'Nein. Bei jedem Inserat steht, welche Sprachen der Eigentümer spricht, sodass Sie das vorab wissen.',
      'Unser Team spricht Niederländisch, Deutsch, Englisch, Französisch und Ungarisch und kommt zur Besichtigung mit.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'erreichbarkeit',
    question: 'Wann kann ich Sie erreichen?',
    answer: [
      `Werktags zwischen ${COMPANY.hours.weekdays.from} und ${COMPANY.hours.weekdays.to} Uhr. Bitten Sie um einen Rückruf, rufen wir bis ${COMPANY.hours.callback.to} Uhr zurück, auch am Wochenende.`,
      'Der Rückruf kostet Sie nichts. Wir übernehmen die Gesprächskosten.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
