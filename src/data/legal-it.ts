/**
 * Legal pages, Italian (formal "Lei"). A faithful translation of the Dutch pages
 * (src/data/pages-legal.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. It needs the client's and a lawyer's sign-off before
 * launch, like the Hungarian and Dutch originals. Every sentence that leans on
 * Dutch or Hungarian law (GDPR roles, Dutch VAT, the Dutch regulator, the
 * right of withdrawal, the ODR platform) is listed in Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'it' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 luglio 2026';
const notice =
  'Questa è una traduzione di cortesia. In caso di divergenze prevale l’originale olandese (per le questioni di diritto olandese) o ungherese.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_IT = {
  imprint: {
    metaTitle: 'Note legali: dati aziendali',
    metaDescription: `Dati aziendali di ${COMPANY.names.legal}: sede legale, partita IVA, numero KvK e recapiti.`,
    eyebrow: 'Note legali',
    title: 'Dati',
    titleEm: 'aziendali',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Dati del fornitore del servizio',
        rows: [
          ['Ragione sociale', COMPANY.names.legal],
          ['Sede legale', addressLine(COMPANY.address, L)],
          ['Partita IVA', COMPANY.registration.vat],
          ['Numero KvK (Camera di commercio olandese)', kvk],
          ['Rappresentante', COMPANY.principal],
          ['E-mail', COMPANY.email.primary],
          ['Telefono', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Fondata', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Conti bancari',
        rows: [
          ['Paesi Bassi', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Ungheria', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Controversie',
        body: 'In caso di controversia con un consumatore potete rivolgervi anche alla piattaforma europea ODR: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Informativa sulla privacy',
    metaDescription:
      'Come FODEL tratta i vostri dati personali: quali dati trattiamo, per quanto tempo li conserviamo e quali diritti avete ai sensi del GDPR.',
    eyebrow: 'Privacy',
    title: 'Informativa',
    titleEm: 'sulla privacy',
    intro:
      'La presente informativa descrive come trattiamo i dati personali che ci fornite tramite questo sito, in conformità al GDPR.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Titolare del trattamento',
        rows: [
          ['Titolare', COMPANY.names.legal],
          ['Indirizzo', addressLine(COMPANY.address, L)],
          ['E-mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Quali dati trattiamo',
        intro: 'Solo i dati che inserite voi stessi nei nostri moduli:',
        items: [
          'Nome, indirizzo e-mail e numero di telefono: per poter rispondere alla vostra richiesta',
          'L’oggetto e il contenuto del vostro messaggio',
          'Per un annuncio: i dati dell’immobile e i vostri dati di fatturazione',
          'Per una richiesta di ricerca: i vostri criteri di ricerca',
          'Per l’amministrazione interna: quando e quale modulo avete compilato e quando avete effettuato l’accesso al portale, senza memorizzare l’indirizzo IP',
        ],
      },
      {
        type: 'table',
        title: 'Base giuridica e periodo di conservazione',
        rows: [
          ['Contatto e richiesta di richiamata', 'Consenso (art. 6, par. 1, lett. a) GDPR): 12 mesi'],
          ['Ordine di annuncio', 'Esecuzione di un contratto (art. 6, par. 1, lett. b)): 7 anni, obbligo fiscale di conservazione'],
          ['Richiesta di ricerca', 'Consenso: fino al completamento, al massimo 24 mesi'],
          ['Registro interno delle attività', 'Legittimo interesse (art. 6, par. 1, lett. f)): corretta amministrazione e individuazione degli abusi: al massimo 24 mesi'],
        ],
      },
      {
        type: 'list',
        title: 'Con chi condividiamo i dati',
        intro: 'Non vendiamo i vostri dati e non li condividiamo a fini di marketing. I nostri responsabili del trattamento sono:',
        items: [
          'Il nostro fornitore di posta elettronica, con trattamento all’interno dell’UE',
          'Il fornitore di hosting di questo sito',
          'In caso di acquisto, e solo su vostra richiesta: l’altra parte e l’avvocato coinvolto',
        ],
      },
      {
        type: 'callout',
        title: 'Sugli annunci',
        body: 'Come inserzionisti potete autorizzarci a mostrare il vostro nome e numero di telefono nell’annuncio, così che gli interessati possano contattarvi direttamente. Potete revocare l’autorizzazione in qualsiasi momento; in tal caso rimuoviamo i dati dall’annuncio.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Newsletter',
        body: 'Se vi iscrivete alla nostra newsletter, trattiamo il vostro indirizzo e-mail, la lingua scelta e la data di iscrizione e di conferma, esclusivamente per inviarvi la newsletter, sulla base del vostro consenso. L’iscrizione avviene in due passaggi: non inviamo nulla finché non avete cliccato il pulsante nell’e-mail di conferma. In ogni e-mail potete disiscrivervi con un clic e smettiamo immediatamente. Per l’invio utilizziamo il servizio Resend.',
      },
      {
        type: 'list',
        title: 'I vostri diritti',
        items: [
          'Accesso ai dati che trattiamo su di voi',
          'Rettifica e cancellazione',
          'Limitazione del trattamento od opposizione allo stesso',
          'Portabilità dei dati',
          'Revoca del consenso in qualsiasi momento',
          'Proporre reclamo all’Autorità olandese per la protezione dei dati (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Contatti per la privacy',
        paragraphs: [`Potete inviare domande o richieste a ${COMPANY.email.primary}. Rispondiamo entro 30 giorni al più tardi.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Informativa sui cookie',
    metaDescription: `Quali cookie utilizza ${SITE_HOST} e come modificare la vostra scelta.`,
    eyebrow: 'Cookie',
    title: 'Informativa',
    titleEm: 'sui cookie',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Al momento questo sito utilizza solo memorizzazioni tecnicamente necessarie. Non usiamo script pubblicitari o di tracciamento e non condividiamo nulla con i social network.',
        ],
      },
      {
        type: 'table',
        title: 'Cosa memorizziamo',
        rows: [
          [
            'fodel:consent',
            'La vostra scelta sui cookie (accettati o rifiutati). Viene conservata nel vostro browser e non ci viene trasmessa. Conservazione: 12 mesi.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistiche',
        paragraphs: [
          'Se un giorno raccoglieremo statistiche sui visitatori, le attiveremo solo con il vostro consenso preventivo ed esplicito. Il rifiuto non limita in alcun modo l’uso del sito.',
        ],
      },
      {
        type: 'prose',
        title: 'Modificare la scelta',
        paragraphs: [
          'Potete modificare la scelta in qualsiasi momento cancellando i dati del browser memorizzati per questo sito; l’avviso sui cookie comparirà di nuovo.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Termini e condizioni',
    metaDescription:
      'Le condizioni del servizio pubblicitario e di intermediazione di FODEL: prezzi, provvigione, ritiro e responsabilità.',
    eyebrow: 'Condizioni',
    title: 'Termini e',
    titleEm: 'condizioni',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Attenzione',
        body: 'Questa pagina è un riepilogo. Le condizioni complete e vincolanti sono disponibili in PDF; in caso di divergenza prevale il PDF.',
      },
      {
        type: 'prose',
        title: '1. Il servizio',
        paragraphs: [
          'FODEL pubblicizza immobili ungheresi sui propri siti multilingue e, sulla base di un accordo separato, assiste nella conclusione della vendita.',
          'Il servizio pubblicitario non comporta esclusiva: il venditore può offrire e vendere l’immobile anche attraverso altri canali.',
        ],
      },
      {
        type: 'list',
        title: '2. Pubblicare un annuncio',
        ordered: true,
        items: [
          'Il venditore compila il modulo di registrazione.',
          'FODEL invia una richiesta di pagamento per il pacchetto scelto.',
          'Il venditore paga tramite bonifico bancario.',
          'Al ricevimento del pagamento, il venditore ottiene il diritto di caricare le foto.',
          'FODEL si occupa della traduzione e pubblica l’annuncio.',
        ],
      },
      {
        type: 'table',
        title: '3. Prezzi',
        intro: `Tutti i prezzi includono l’IVA olandese del ${LISTING_VAT_PERCENT}%. Il quadro completo è alla pagina Prezzi.`,
        rows: [
          [`Annuncio economico (${cheap.months} mesi)`, eur(cheap.priceEur, L)],
          [`Annuncio standard (${normal.months} mesi)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Traduzione', `${eur(extra('translation').priceEur, L)} per lingua`],
          [
            'Messa in evidenza',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} al mese (min. ${minMonths} mesi)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Provvigione',
        paragraphs: [
          'La provvigione è dovuta solo se ricorrono tutte le seguenti condizioni: un contratto di compravendita scritto, un acquirente presentato da FODEL e una caparra versata.',
          `La provvigione è del ${COMMISSION.percent}% netto con un minimo di ${eur(COMMISSION.minimumEur, L)}, più il ${COMMISSION.vatPercent}% di IVA olandese.`,
          'Se l’interessato contatta direttamente il venditore e il nostro aiuto per la conclusione non è necessario, non è dovuto nulla oltre al costo dell’annuncio.',
        ],
      },
      {
        type: 'prose',
        title: '5. Ritiro dell’annuncio',
        paragraphs: [
          'Il venditore può ritirare l’annuncio prima della scadenza. In tal caso i costi dell’annuncio già pagati non vengono rimborsati.',
        ],
      },
      {
        type: 'prose',
        title: '6. Responsabilità',
        paragraphs: [
          'Il venditore è responsabile dell’esattezza dei dati sull’immobile. FODEL riproduce i dati forniti e non risponde della loro esattezza.',
          'Le traduzioni presenti su questo sito sono a scopo informativo; in caso di controversia prevale la versione ungherese.',
        ],
      },
      {
        type: 'prose',
        title: '7. Diritto di recesso',
        paragraphs: [
          'Il venditore che è un consumatore gode del diritto di recesso previsto dalla legge per i contratti a distanza. Se il venditore chiede espressamente l’esecuzione immediata, il diritto di recesso si riduce in proporzione al servizio già prestato.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Dichiarazione di accessibilità',
    metaDescription: `Il livello di accessibilità di ${SITE_HOST}, lo standard che seguiamo e come inviarci un riscontro.`,
    eyebrow: 'Accessibilità',
    title: 'Dichiarazione di',
    titleEm: 'accessibilità',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Vogliamo che questo sito sia utilizzabile da tutti, compresi i visitatori che usano uno screen reader, la tastiera o l’ingrandimento.',
          'Realizziamo il sito secondo le WCAG 2.2 livello AA. Una parte considerevole dei nostri visitatori è in pensione, quindi dimensione del testo, contrasto e uso da tastiera hanno la priorità.',
        ],
      },
      {
        type: 'list',
        title: 'Cosa è già disponibile',
        items: [
          'Tutti i testi hanno un rapporto di contrasto di almeno 4,5:1',
          'Uso completo da tastiera con indicazione visibile del focus',
          'Un link “salta al contenuto” in cima a ogni pagina',
          'Testi alternativi significativi per tutte le immagini',
          'Campi del modulo con etichette collegate e messaggi di errore testuali',
          'Rispetto dell’impostazione di sistema “riduci movimento”',
          'Il sito è leggibile e utilizzabile senza JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Limitazioni note',
        paragraphs: ['Non abbiamo alcuna influenza sull’accessibilità di contenuti di terzi, come un servizio di mappe.'],
      },
      {
        type: 'prose',
        title: 'Riscontri',
        paragraphs: [
          `Se incontrate un ostacolo, segnalatecelo a ${COMPANY.email.primary} o per telefono. Risolviamo le segnalazioni il prima possibile.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
