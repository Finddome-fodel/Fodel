/**
 * Long-form pages, Italian (formal "Lei"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'it' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `da ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_IT = {
  services: {
    metaTitle: 'Servizi: gestione della vendita, contratti, fotografia',
    metaDescription: `Contratto di compravendita bilingue ${from('hu')}, rappresentanza tramite procura, iscrizione al catasto, attestato di prestazione energetica, fotografie dell’immobile e riprese con drone.`,
    eyebrow: 'Servizi',
    title: 'Cosa facciamo oltre',
    titleEm: 'l’annuncio',
    intro:
      'L’annuncio è solo il primo passo. Con i servizi qui sotto ci occupiamo noi dell’intero processo di acquisto, nel rispetto delle norme di entrambi i Paesi.',
    sections: [
      {
        type: 'steps',
        title: 'Come si svolge la vendita',
        items: [
          { n: '01', t: 'Contatto', b: 'Consulenza telefonica e via e-mail, comunicazione con entrambe le parti, anche tramite interpreti.' },
          { n: '02', t: 'Verifica degli acquirenti', b: 'Verifichiamo il profilo, l’intenzione di acquisto e la solidità finanziaria.' },
          { n: '03', t: 'Visita', b: 'Fissiamo gli appuntamenti e vi accompagniamo, con un collega che parla la vostra lingua.' },
          { n: '04', t: 'Trattativa', b: 'Assistenza in entrambe le lingue, entro una forbice di prezzo realistica.' },
          { n: '05', t: 'Contratto', b: 'Un contratto di compravendita bilingue, redatto con un avvocato.' },
          { n: '06', t: 'Rogito', b: 'Catasto, utenze e, se necessario, rappresentanza tramite procura.' },
        ],
      },
      {
        type: 'table',
        title: 'Contratto di compravendita bilingue',
        intro: 'Prezzi indicativi per combinazione linguistica. Il prezzo finale dipende dalla lunghezza del contratto.',
        rows: [
          ['Ungherese', from('hu')],
          ['Tedesco–ungherese', from('de-hu')],
          ['Inglese–ungherese', from('en-hu')],
          ['Olandese–ungherese', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Servizi aggiuntivi',
        intro: 'Per questi prepariamo un preventivo su misura:',
        items: [
          'Richiesta dell’attestato di prestazione energetica: obbligatorio nell’annuncio secondo le norme UE',
          'Fotografia immobiliare professionale',
          'Riprese con drone: particolarmente efficaci per grandi terreni e panorami',
          `Video con l’annuncio (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Rappresentanza tramite procura',
        body: 'Non è necessario recarsi in Ungheria per firmare: con una procura vi rappresentiamo alla firma, al catasto e nel passaggio delle utenze.',
      },
      {
        type: 'prose',
        title: 'Quando è dovuta la provvigione',
        paragraphs: [
          `Applichiamo la provvigione solo se FINDDOME ha presentato l’acquirente, esiste un contratto di compravendita scritto e la caparra è stata versata. L’aliquota è del ${COMMISSION.percent}% netto, con un minimo di ${eur(COMMISSION.minimumEur, L)}, più il ${COMMISSION.vatPercent}% di IVA olandese. La paga il venditore, non l’acquirente.`,
        ],
      },
      {
        type: 'cta',
        title: 'Domande sul processo',
        body: '{hours} Richiedete una richiamata gratuita o scriveteci.',
        primary: { label: 'Contattateci', to: 'contact' },
        secondary: { label: 'Domande frequenti', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Immobili agricoli: fino a ${AGRI_HECTARE_LIMIT} ettari in Ungheria`,
    metaDescription: `Un cittadino UE con qualifica agricola può acquistare fino a ${AGRI_HECTARE_LIMIT} ettari di terreno in Ungheria. FINDDOME gestisce l’intera procedura.`,
    eyebrow: 'Immobili agricoli',
    title: 'Terreni agricoli e',
    titleEm: 'tenute agricole',
    intro:
      'Il mercato fondiario ungherese ha regole proprie. Chi conosce le condizioni accede a vigneti, terreni agricoli, aziende agricole e boschi.',
    sections: [
      {
        type: 'prose',
        title: `Il limite di ${AGRI_HECTARE_LIMIT} ettari`,
        paragraphs: [
          `Un cittadino UE con una qualifica agricola può acquistare in Ungheria fino a ${AGRI_HECTARE_LIMIT} ettari di terreno in totale. Seguiamo per intero questa procedura.`,
          'La procedura prevede più passaggi presso le autorità e inizia con il riconoscimento della qualifica. Il nostro team La accompagna in tutto il percorso e prepara i documenti in entrambe le lingue.',
        ],
      },
      {
        type: 'list',
        title: 'Cosa acquistano i nostri clienti',
        items: [
          'Vigneti, con o senza cantina in funzione',
          'Terreni agricoli, ammissibili ai sostegni UE',
          'Aziende agricole con annessi, adatte all’allevamento',
          'Boschi e tenute a uso misto',
          'Appezzamenti contigui più grandi come investimento',
        ],
      },
      {
        type: 'steps',
        title: 'La procedura',
        items: [
          { n: '01', t: 'Consulenza', b: 'Discutiamo i Suoi progetti e il budget disponibile.' },
          { n: '02', t: 'Riconoscimento della qualifica', b: 'Ci occupiamo del riconoscimento della Sua qualifica agricola in Ungheria.' },
          { n: '03', t: 'Ricerca', b: 'Con i nostri partner cerchiamo terreni che soddisfano le condizioni.' },
          { n: '04', t: 'Autorizzazioni', b: 'Richiesta delle autorizzazioni necessarie per l’acquisto del terreno.' },
          { n: '05', t: 'Acquisto', b: 'Contratto bilingue, iscrizione al catasto, trasferimento dei diritti ai contributi.' },
        ],
      },
      {
        type: 'callout',
        title: 'Importante',
        body: 'Le regole sull’acquisto di terreni agricoli cambiano periodicamente e dipendono dalla Sua situazione specifica. Quanto riportato qui ha valore puramente informativo. Per un progetto concreto si rivolga sempre a noi e a un avvocato specializzato.',
      },
      {
        type: 'cta',
        title: 'Cerca un immobile agricolo?',
        body: 'Ci dica cosa desidera: cerchiamo anche oltre gli immobili che pubblichiamo.',
        primary: { label: 'Ricerca immobile gratuita', to: 'searchRequest' },
        secondary: { label: 'I nostri immobili', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Acquistare in Ungheria: la procedura passo dopo passo',
    metaDescription:
      'Come si svolge un acquisto in Ungheria per un acquirente straniero: contratto, caparra, catasto, utenze e i costi da prevedere.',
    eyebrow: 'Per gli acquirenti',
    title: 'Acquistare in',
    titleEm: 'Ungheria',
    intro:
      'La procedura di acquisto ungherese è piuttosto prevedibile, una volta noti i passaggi. Questa guida La accompagna attraverso ciascuno di essi.',
    sections: [
      {
        type: 'steps',
        title: 'La procedura',
        items: [
          { n: '01', t: 'Scelta', b: 'Sceglie tra i nostri immobili oppure invia una richiesta di ricerca gratuita.' },
          { n: '02', t: 'Visita', b: 'Organizziamo il viaggio e la visita, con un interprete.' },
          { n: '03', t: 'Offerta', b: 'La aiutiamo a formulare un’offerta realistica e a negoziare.' },
          { n: '04', t: 'Contratto e caparra', b: 'Un contratto di compravendita bilingue, di solito con una caparra del 10%.' },
          { n: '05', t: 'Prezzo di acquisto', b: 'Il saldo del prezzo tramite bonifico bancario, come stabilito nel contratto.' },
          { n: '06', t: 'Consegna', b: 'Iscrizione al catasto, utenze, consegna delle chiavi.' },
        ],
      },
      {
        type: 'list',
        title: 'Costi oltre al prezzo di acquisto',
        items: [
          'Imposta sul trasferimento: l’aliquota dipende dal tipo di immobile e dalla Sua situazione',
          'Onorario dell’avvocato per la redazione e la controfirma dell’atto',
          `Traduzione del contratto bilingue: ${from('hu')}, a seconda della combinazione linguistica`,
          'Diritti catastali',
          'Eventuale provvigione a FINDDOME: la paga il venditore, non Lei',
        ],
      },
      {
        type: 'prose',
        title: 'Non è necessario essere presenti',
        paragraphs: [
          'Con una procura La rappresentiamo alla firma, al catasto e nel trasferimento delle utenze. L’acquisto può quindi procedere anche se non può o non desidera viaggiare.',
        ],
      },
      {
        type: 'callout',
        title: 'Attestato di prestazione energetica',
        body: 'In Ungheria è obbligatorio l’attestato di prestazione energetica (APE), che secondo le norme UE deve comparire anche nell’annuncio. Nei nostri annunci trova la classe tra le caratteristiche; “in corso” significa che l’attestato è ancora in preparazione.',
      },
      {
        type: 'cta',
        title: 'Cominciamo?',
        body: 'Sfogli gli immobili o ci dica cosa sta cercando. Non Le costa nulla.',
        primary: { label: 'I nostri immobili', to: 'properties' },
        secondary: { label: 'Ricerca immobile gratuita', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Trasferirsi in Ungheria: perché gli olandesi fanno il passo',
    metaDescription:
      'I quattro motivi per cui acquirenti olandesi e belgi si trasferiscono in Ungheria: rapporto qualità-prezzo, spazio, costo della vita più basso e posizione.',
    eyebrow: 'Contesto',
    title: 'Trasferirsi in',
    titleEm: 'Ungheria',
    intro:
      'Molti olandesi e belgi scelgono l’Ungheria. In centinaia di colloqui con i nostri clienti emergono sempre gli stessi quattro motivi.',
    sections: [
      {
        type: 'prose',
        title: 'Rapporto qualità-prezzo',
        paragraphs: [
          'Gli immobili rurali ungheresi sono tra i più convenienti d’Europa. Nei Paesi Bassi un lotto edificabile di 125 m² costa facilmente 88.000\u00a0€ e un garage circa 100.000\u00a0€. Con la stessa cifra, nella campagna ungherese si acquista un’ampia casa familiare, spesso con molto terreno.',
        ],
      },
      {
        type: 'prose',
        title: 'Spazio',
        paragraphs: [
          'I Paesi Bassi hanno una densità di 482 abitanti per km² con circa 17 milioni di abitanti, e una parte considerevole del Paese è acqua. La mancanza di spazio non è un problema astratto ma un’esperienza quotidiana, ed è il motivo citato più spesso.',
        ],
      },
      {
        type: 'prose',
        title: 'Costo della vita',
        paragraphs: [
          'Gran parte dei nostri acquirenti è in pensione o vicina alla pensione. Per loro, il costo della vita più basso, l’assenza di un’imposta sugli immobili e un’assistenza sanitaria accessibile si traducono in un tenore di vita che la stessa pensione non garantirebbe nei Paesi Bassi.',
        ],
      },
      {
        type: 'prose',
        title: 'Posizione',
        paragraphs: [
          'Dopo l’alluvione del 1953 i Paesi Bassi hanno costruito un enorme sistema di difese contro le inondazioni. La preoccupazione per l’innalzamento del livello del mare pesa su molte decisioni: l’Ungheria si trova al centro del continente, sopra il livello del mare.',
        ],
      },
      {
        type: 'cta',
        title: 'È il momento di scoprire',
        body: 'Sfogli i nostri immobili o lasci che cerchiamo noi ciò che ha in mente.',
        primary: { label: 'I nostri immobili', to: 'properties' },
        secondary: { label: 'Acquistare in Ungheria', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Guida fotografica per gli inserzionisti',
    metaDescription:
      'Le buone foto sono lo strumento più importante per vendere in fretta. La guida fotografica FINDDOME: luce, orientamento, risoluzione e gli errori più comuni.',
    eyebrow: 'Per i venditori',
    title: 'Guida',
    titleEm: 'fotografica',
    intro:
      'I potenziali acquirenti stranieri vedono prima le foto, spesso solo le foto. Queste regole contano più di qualsiasi testo dell’annuncio.',
    sections: photoGuideSections(L, {
      topTitle: 'Le sei regole più importanti',
      calloutTitle: 'Preferisce affidarlo a noi?',
      calloutBody: (lines) =>
        `Si affidi a un professionista. Può sceglierlo con un clic quando pubblica l’annuncio: ${lines.join('; ')}. Entrambi sono facoltativi; un membro del nostro team La contatterà per fissare una data.`,
      ctaTitle: 'Pronto a pubblicare il Suo immobile?',
      primary: 'Pubblica un annuncio',
      secondary: 'Prezzi',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
