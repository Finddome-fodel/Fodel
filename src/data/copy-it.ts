/**
 * Page copy, Italian (formal "Lei").
 *
 * Written for buyers and sellers in the UK, Ireland and the rest of the
 * English-speaking market, from the same facts as the Hungarian and Dutch
 * copy: the figures come from src/config/company.ts, never from this file.
 * Type-checked against the Hungarian copy, so a missing key fails the build.
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'it' as const;

export const IT = {
  home: {
    meta: {
      title: 'FINDDOME Real Estates | Acquisti un immobile in Ungheria direttamente dal proprietario',
      description:
        'Case, aziende agricole e tenute in Ungheria, spesso direttamente dal proprietario. Assistenza nella Sua lingua e contratti di compravendita bilingui.',
    },
    hero: {
      eyebrow: `Dal 2013 · ${foundedInLabel(L)}`,
      title: ['Pubblichi', 'il suo immobile', 'in Europa'],
      emphasis: 1,
      body: 'Carichi il suo annuncio in pochi passaggi. Lo verifichiamo e, dopo il pagamento online, viene pubblicato sul nostro sito in 21 lingue, senza contratto di esclusiva. Gli interessati la contattano direttamente o tramite noi.',
      primary: 'Sfoglia gli immobili',
      secondary: 'Ricerca immobile gratuita',
      featuredLabel: 'In evidenza',
    },
    audiences: [
      {
        eyebrow: 'Per gli acquirenti',
        title: 'Immobili direttamente\ndal proprietario',
        body: 'Autentiche case ungheresi, aziende agricole, tenute e vigneti. Contatti direttamente il proprietario o lasci che FINDDOME gestisca l’intero processo.',
        cta: 'Sfoglia gli immobili',
        to: 'properties',
      },
      {
        eyebrow: 'Per i venditori',
        title: 'Il Suo immobile ungherese\nin Europa occidentale',
        body: `Pubblichi annunci in ${REACH_LANGUAGES} lingue in ${REACH_COUNTRIES} Paesi, senza contratto di esclusiva. Provvigione solo se troviamo noi l’acquirente.`,
        cta: 'Scopra di più',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Scelta', title: 'Immobili in evidenza' },
    quote: '“Gli olandesi spesso non credono ai propri occhi quando vedono cosa si può comprare in Ungheria, e a quale prezzo.”',
    quoteSource: `${BRAND.it.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Come funziona', title: 'Come funziona FINDDOME' },
    cta: {
      eyebrow: 'Contattateci',
      title: 'Saremo lieti',
      titleEm: 'di richiamarLa',
      body: `{hoursShort} · La richiamata non Le costa nulla.`,
    },
    referral: {
      eyebrow: 'Programma di segnalazione',
      title: 'Segnali un inserzionista,',
      titleEm: 'riceva il 10%',
      body: 'Se qualcuno pubblica un annuncio su FINDDOME su Sua segnalazione, ottiene il 10% di sconto sul pacchetto e noi Le accreditiamo il 10% sul prossimo annuncio. Pubblica già da noi? Trova il Suo codice di segnalazione personale nel portale, alla voce Impostazioni.',
      steps: [
        'Segnali un conoscente con il modulo qui sotto o condivida il Suo link personale dal portale',
        'Un membro del nostro team lo contatta',
        'Se pubblica un annuncio, risparmia il 10% e noi Le accreditiamo il 10%',
      ],
      formTitle: 'Segnali un conoscente',
      fields: {
        referrerName: 'Il Suo nome',
        referrerEmail: 'Il Suo indirizzo e-mail',
        referredName: 'Nome della persona segnalata',
        referredEmail: 'Indirizzo e-mail della persona segnalata',
      },
      submit: 'Invia la segnalazione',
      successTitle: 'Grazie per la segnalazione!',
      successBody:
        'L’abbiamo ricevuta. Un collega contatterà la persona segnalata e la terremo aggiornata via e-mail.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Pubblicato in ${REACH_COUNTRIES} Paesi`,
      body: `Pubblichiamo annunci in ${REACH_LANGUAGES} lingue nei Paesi Bassi, in Belgio, Germania, Inghilterra e altri Paesi UE, senza contratto di esclusiva con il venditore.`,
    },
    {
      num: '02',
      title: 'Contatto diretto',
      body: 'Molti annunci riportano il nome e il numero del proprietario accanto ai nostri recapiti. Se vi accordate tra voi, nessuno paga provvigioni.',
    },
    {
      num: '03',
      title: 'L’intero processo gestito per Lei',
      body: 'Contratto di compravendita bilingue, rappresentanza tramite procura, iscrizione al catasto e trasferimento delle utenze.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Fondata' },
    { value: String(REACH_COUNTRIES), label: 'Paesi' },
    { value: String(REACH_LANGUAGES), label: 'Lingue' },
    { value: `${COMMISSION.percent}%`, label: 'Provvigione' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Per i venditori | Il Suo immobile ungherese in Europa occidentale',
      description: `Pubblichi il Suo immobile ungherese in ${REACH_LANGUAGES} lingue in ${REACH_COUNTRIES} Paesi, da ${eur(69, L)} e senza esclusiva. Provvigione solo se FINDDOME trova l’acquirente: ${COMMISSION.percent}% + ${COMMISSION.vatPercent}% di IVA.`,
    },
    hero: {
      eyebrow: 'Per i venditori',
      title: 'Il Suo immobile',
      titleEm: 'in Europa occidentale',
      body: `Con il modello FINDDOME il Suo immobile compare in ${REACH_LANGUAGES} lingue in ${REACH_COUNTRIES} Paesi, senza contratto di esclusiva. Lavoriamo solo con acquirenti seri.`,
      cta: 'Pubblica un annuncio',
      secondary: 'Vedi i prezzi',
    },
    benefits: {
      eyebrow: 'I vantaggi',
      title: 'Cosa porta un acquirente straniero',
      points: [
        'Acquirenti con fondi propri: nessuna attesa per un mutuo o un contributo.',
        'Pagamento in un’unica soluzione tramite bonifico, rapido e sicuro.',
        'Intenzione seria: una sola visita costa loro due giorni e 200–300\u00a0€.',
        'Prezzi realistici: nessuna trattativa irragionevole.',
        'FINDDOME valuta personalmente ogni acquirente prima di fissare un appuntamento.',
      ],
    },
    personas: {
      eyebrow: 'Gli acquirenti',
      title: 'Chi sono i nostri acquirenti',
      items: [
        {
          title: 'Pensionati',
          body: 'Cercano in Ungheria un costo della vita più basso, vantaggi fiscali e un’assistenza sanitaria accessibile.',
        },
        {
          title: 'Famiglie',
          body: 'Cercano spazio, natura e vita in campagna. Spesso una fattoria, una cascina o una casa vacanze.',
        },
        {
          title: 'Investitori',
          body: 'Cercano immobili commerciali, vigneti e terreni agricoli.',
        },
        {
          title: 'Chi cambia vita',
          body: 'Si lasciano alle spalle costi elevati e affollamento, alla ricerca di un autentico stile di vita europeo.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Passo dopo passo', title: 'Il modello FINDDOME' },
    commission: {
      eyebrow: 'Prezzi',
      title: 'Provvigione solo\na vendita conclusa',
      body: `Se l’acquirente vi contatta direttamente e non avete bisogno del nostro aiuto, non pagate nulla oltre al costo dell’annuncio. Se invece è FINDDOME a mediare la vendita: ${COMMISSION.percent}% netto (min. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}% di IVA olandese.`,
      cta: 'Vedi i prezzi',
    },
  },

  buyers: {
    meta: {
      title: 'Per chi acquista | Acquistare un immobile in Ungheria',
      description:
        'Come acquistare in sicurezza un immobile in Ungheria: contratto bilingue, rappresentanza tramite procura e iscrizione al catasto. In più, un servizio di ricerca gratuito.',
    },
    hero: {
      eyebrow: 'Per gli acquirenti',
      title: 'Acquistare in Ungheria,',
      titleEm: 'senza sorprese',
      body: 'Molti dei nostri annunci indicano il proprietario. Potete trattare direttamente o affidare a noi l’intero processo.',
      cta: 'Sfoglia gli immobili',
      secondary: 'Ricerca immobile gratuita',
    },
    services: {
      eyebrow: 'Di cosa ci occupiamo',
      title: 'Assistenza completa',
      points: [
        'Comunicazione tra voi e il venditore, anche tramite interpreti.',
        'Visite, con un collega che parla la vostra lingua.',
        'Supporto nella trattativa sul prezzo e nella redazione del contratto bilingue.',
        'Rappresentanza tramite procura: non è necessario recarsi in Ungheria per firmare.',
        'Iscrizione al catasto e passaggio delle utenze.',
      ],
    },
    reasons: {
      eyebrow: 'Perché l’Ungheria',
      title: 'Cosa cercano gli acquirenti dell’Europa occidentale',
    },
  },

  about: {
    meta: {
      title: 'Chi siamo | Un ponte tra due mondi',
      description:
        'Dal 2013 mettiamo in contatto venditori ungheresi e acquirenti dell’Europa occidentale. Con discrezione, trasparenza e senza contratto di esclusiva.',
    },
    hero: {
      eyebrow: 'Chi siamo',
      title: 'Un ponte tra',
      titleEm: 'due mondi',
      body: 'Dal 2013 aiutiamo i venditori ungheresi a trovare l’acquirente straniero giusto: con discrezione, efficacia e senza contratto di esclusiva.',
    },
    origin: {
      eyebrow: 'Gli inizi · Almere-Buiten, 2013',
      quote:
        '“Vivendo ad Almere-Buiten, abbiamo visto quanto gli olandesi desiderino un autentico stile di vita europeo, mentre in Ungheria gli immobili più belli aspettano inosservati un proprietario.”',
    },
    values: {
      eyebrow: 'I nostri valori',
      title: 'Su cosa costruiamo',
      items: [
        {
          num: '01',
          title: 'Discrezione',
          body: 'Trattiamo i dati di venditori e acquirenti con la massima cura. I dati personali compaiono solo con il consenso.',
        },
        {
          num: '02',
          title: 'Trasparenza',
          body: 'Nessun costo nascosto. I nostri prezzi e la provvigione sono pubblicati su questo sito e vi teniamo informati a ogni passo.',
        },
        {
          num: '03',
          title: 'Competenza bilingue',
          body: 'Conosciamo entrambi i mercati dall’interno. Il nostro team parla olandese, tedesco, inglese, francese e ungherese.',
        },
      ],
    },
    approach: {
      eyebrow: 'Il nostro approccio',
      title: 'Non siamo una grande agenzia.',
      titleEm: 'È questa la nostra forza.',
      points: [
        'Ogni cliente ha un contatto personale: nessun call center, nessuno sportello anonimo.',
        'Conosciamo entrambe le culture dall’interno e valutiamo gli immobili con occhi olandesi e ungheresi allo stesso modo.',
        'Far incontrare immobile e acquirente è una nostra responsabilità, non una questione di fortuna.',
        'Lavoriamo senza esclusiva perché preferiamo convincere con i risultati.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Il ponte che',
      titleEm: 'abbiamo costruito',
      paragraphs: [
        'FINDDOME è stata fondata da ungheresi che vivono nei Paesi Bassi. Abbiamo iniziato ad Almere-Buiten nel 2013, dove abbiamo notato quanti olandesi e belgi volessero acquistare un’autentica casa ungherese senza sapere da dove cominciare.',
        `Oggi pubblicizziamo in ${REACH_COUNTRIES} Paesi e ${REACH_LANGUAGES} lingue e seguiamo ogni transazione dall’inizio alla fine: contratto di compravendita bilingue, rappresentanza tramite procura e iscrizione al catasto. La nostra sede è all’Aia.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Contatti | Vi richiamiamo volentieri',
      description: `Chiamateci nei giorni feriali tra le ${COMPANY.hours.weekdays.from} e le ${COMPANY.hours.weekdays.to} o richiedete una richiamata. La chiamata non vi costa nulla.`,
    },
    hero: { eyebrow: 'Contatto', title: 'Saremo lieti', titleEm: 'di richiamarLa' },
    formTitle: 'Richiedi una richiamata',
    submit: 'Richiedi una chiamata',
    subjects: [
      'Domanda su un immobile',
      'Pubblicizzare un immobile',
      'Richiedi i prezzi',
      'Richiesta di richiamata',
      'Altro',
    ],
    note: `La richiamata non vi costa nulla: la chiamata è a nostro carico. Richiamiamo fino alle ${COMPANY.hours.callback.to}, anche nel fine settimana.`,
  },
} satisfies CopyShape;
