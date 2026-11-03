/**
 * Long-form pages, Serbian (Latin script): services, agricultural property,
 * buying guide, moving to Hungary, photo guide. Figures come from
 * src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'sr' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `od ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_SR = {
  services: {
    metaTitle: 'Usluge: vođenje prodaje, ugovori, fotografisanje',
    metaDescription: `Dvojezični kupoprodajni ugovor ${from('hu')}, zastupanje po punomoćju, upis u katastar, energetski sertifikat, fotografisanje nekretnina i snimanje dronom.`,
    eyebrow: 'Usluge',
    title: 'Šta radimo',
    titleEm: 'pored oglasa',
    intro:
      'Oglas je tek prvi korak. Uslugama navedenim u nastavku preuzimamo ceo postupak kupovine, u skladu sa pravilima obe zemlje.',
    sections: [
      {
        type: 'steps',
        title: 'Kako se vodi prodaja',
        items: [
          { n: '01', t: 'Kontakt', b: 'Savetovanje telefonom i imejlom, komunikacija sa obe strane, uključujući prevodioce.' },
          { n: '02', t: 'Provera kupca', b: 'Proveravamo pozadinu, nameru kupovine i finansijsko stanje.' },
          { n: '03', t: 'Obilazak', b: 'Zakazujemo termine i idemo sa Vama, uz saradnika koji govori Vaš jezik.' },
          { n: '04', t: 'Pregovori', b: 'Podrška na oba jezika, u realnom cenovnom okviru.' },
          { n: '05', t: 'Ugovor', b: 'Dvojezični kupoprodajni ugovor, sastavljen sa advokatom.' },
          { n: '06', t: 'Završetak', b: 'Katastar, komunalne usluge i, po potrebi, zastupanje po punomoćju.' },
        ],
      },
      {
        type: 'table',
        title: 'Dvojezični kupoprodajni ugovor',
        intro: 'Okvirne cene po jezičkoj kombinaciji. Konačna cena zavisi od obima ugovora.',
        rows: [
          ['Mađarski', from('hu')],
          ['Nemačko-mađarski', from('de-hu')],
          ['Englesko-mađarski', from('en-hu')],
          ['Holandsko-mađarski', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Dodatne usluge',
        intro: 'Za ove usluge pripremamo ponudu po meri:',
        items: [
          'Pribavljanje energetskog sertifikata: po pravilima EU obavezan je u oglasu',
          'Profesionalno fotografisanje nekretnine',
          'Snimanje dronom: posebno efektno za velike placeve i poglede',
          `Video uz oglas (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Zastupanje po punomoćju',
        body: 'Ne morate da putujete u Mađarsku radi potpisivanja: na osnovu punomoćja zastupamo Vas pri potpisivanju, u katastru i pri prenosu komunalnih usluga.',
      },
      {
        type: 'prose',
        title: 'Kada se plaća provizija',
        paragraphs: [
          `Proviziju naplaćujemo samo ako je FINDDOME doveo kupca, ako postoji pisani kupoprodajni ugovor i ako je kapara uplaćena. Stopa je ${COMMISSION.percent}% neto, najmanje ${eur(COMMISSION.minimumEur, L)}, uz ${COMMISSION.vatPercent}% holandskog PDV-a. Plaća prodavac, a ne kupac.`,
        ],
      },
      {
        type: 'cta',
        title: 'Pitanja o postupku',
        body: '{hours} Zatražite besplatan povratni poziv ili nam pišite.',
        primary: { label: 'Kontaktirajte nas', to: 'contact' },
        secondary: { label: 'Česta pitanja', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Poljoprivredne nekretnine: do ${AGRI_HECTARE_LIMIT} hektara u Mađarskoj`,
    metaDescription: `Državljanin EU sa poljoprivrednom kvalifikacijom može u Mađarskoj steći do ${AGRI_HECTARE_LIMIT} hektara zemljišta. FINDDOME vodi ceo postupak.`,
    eyebrow: 'Poljoprivredne nekretnine',
    title: 'Poljoprivredno zemljište i',
    titleEm: 'seoska imanja',
    intro:
      'Mađarsko tržište zemljišta ima sopstvena pravila. Ko poznaje uslove, dobija pristup vinogradima, oranicama, salašima i šumama.',
    sections: [
      {
        type: 'prose',
        title: `Ograničenje od ${AGRI_HECTARE_LIMIT} hektara`,
        paragraphs: [
          `Državljanin EU sa poljoprivrednom kvalifikacijom može u Mađarskoj steći ukupno ${AGRI_HECTARE_LIMIT} hektara zemljišta. Taj postupak vodimo u celosti.`,
          'Postupak ima nekoliko koraka pred nadležnim organima i počinje priznavanjem Vaše kvalifikacije. Naš tim Vas vodi kroz ceo postupak i priprema dokumente na oba jezika.',
        ],
      },
      {
        type: 'list',
        title: 'Šta naši klijenti kupuju',
        items: [
          'Vinograde, sa vinskim podrumom u funkciji ili bez njega',
          'Oranice, na koje se mogu ostvariti subvencije EU',
          'Salaše sa pomoćnim objektima, pogodne za stočarstvo',
          'Šume i imanja mešovite namene',
          'Veće povezane parcele kao investiciju',
        ],
      },
      {
        type: 'steps',
        title: 'Postupak',
        items: [
          { n: '01', t: 'Savetovanje', b: 'Razgovaramo o Vašim planovima i raspoloživom budžetu.' },
          { n: '02', t: 'Priznavanje kvalifikacije', b: 'Organizujemo priznavanje Vaše poljoprivredne kvalifikacije u Mađarskoj.' },
          { n: '03', t: 'Pretraga', b: 'Sa partnerima tražimo zemljište koje ispunjava uslove.' },
          { n: '04', t: 'Dozvole', b: 'Pribavljanje dozvola potrebnih za sticanje zemljišta.' },
          { n: '05', t: 'Kupovina', b: 'Dvojezični ugovor, upis u katastar, prenos prava na subvencije.' },
        ],
      },
      {
        type: 'callout',
        title: 'Važno',
        body: 'Pravila za sticanje poljoprivrednog zemljišta s vremena na vreme se menjaju i zavise od Vaših konkretnih okolnosti. Ovde navedeno služi samo kao informacija. Za konkretan plan uvek se posavetujte sa nama i sa specijalizovanim advokatom.',
      },
      {
        type: 'cta',
        title: 'Tražite poljoprivrednu nekretninu',
        body: 'Recite nam šta želite; tražimo i van nekretnina koje oglašavamo.',
        primary: { label: 'Besplatna pretraga nekretnina', to: 'searchRequest' },
        secondary: { label: 'Naše nekretnine', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Kupovina u Mađarskoj: postupak korak po korak',
    metaDescription:
      'Kako izgleda kupovina u Mađarskoj za kupca iz inostranstva: ugovor, kapara, katastar, komunalne usluge i troškovi koje treba očekivati.',
    eyebrow: 'Za kupce',
    title: 'Kupovina u',
    titleEm: 'Mađarskoj',
    intro:
      'Postupak kupovine u Mađarskoj prilično je predvidiv kada poznajete korake. Ovaj vodič Vas vodi kroz njih.',
    sections: [
      {
        type: 'steps',
        title: 'Postupak',
        items: [
          { n: '01', t: 'Izbor', b: 'Birate među našim nekretninama ili šaljete besplatan zahtev za pretragu.' },
          { n: '02', t: 'Obilazak', b: 'Organizujemo put i obilazak, uz prevodioca.' },
          { n: '03', t: 'Ponuda', b: 'Pomažemo Vam da date realnu ponudu i da pregovarate.' },
          { n: '04', t: 'Ugovor i kapara', b: 'Dvojezični kupoprodajni ugovor, obično uz kaparu od 10%.' },
          { n: '05', t: 'Kupoprodajna cena', b: 'Ostatak kupoprodajne cene bankovnim prenosom, kako je predviđeno ugovorom.' },
          { n: '06', t: 'Primopredaja', b: 'Upis u katastar, komunalne usluge, predaja ključeva.' },
        ],
      },
      {
        type: 'list',
        title: 'Troškovi pored kupoprodajne cene',
        items: [
          'Porez na prenos apsolutnih prava: stopa zavisi od vrste nekretnine i Vaše situacije',
          'Advokatski honorar za sastavljanje i overu ugovora',
          `Prevod dvojezičnog ugovora: ${from('hu')}, u zavisnosti od jezičke kombinacije`,
          'Katastarske takse',
          'Eventualna provizija FINDDOME-u: nju plaća prodavac, a ne Vi',
        ],
      },
      {
        type: 'prose',
        title: 'Ne morate biti prisutni',
        paragraphs: [
          'Na osnovu punomoćja zastupamo Vas pri potpisivanju, u katastru i pri prenosu komunalnih usluga. Kupovina se zato može obaviti i ako ne možete ili ne želite da putujete.',
        ],
      },
      {
        type: 'callout',
        title: 'Energetski sertifikat',
        body: 'Mađarska zahteva energetski sertifikat, koji po pravilima EU mora biti naveden i u oglasu. U našim oglasima energetski razred nalazi se među karakteristikama; „u izradi” znači da se sertifikat još priprema.',
      },
      {
        type: 'cta',
        title: 'Da počnemo',
        body: 'Pogledajte nekretnine ili nam recite šta tražite. Ništa Vas ne košta.',
        primary: { label: 'Naše nekretnine', to: 'properties' },
        secondary: { label: 'Besplatna pretraga nekretnina', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Preseljenje u Mađarsku: zašto se Holanđani odlučuju na taj korak',
    metaDescription:
      'Četiri razloga zbog kojih se kupci iz Holandije i Belgije sele u Mađarsku: odnos cene i vrednosti, prostor, niži troškovi života i položaj.',
    eyebrow: 'Pozadina',
    title: 'Preseljenje u',
    titleEm: 'Mađarsku',
    intro:
      'Mnogi Holanđani i Belgijanci biraju Mađarsku. U stotinama razgovora sa našim klijentima iznova se pojavljuju ista četiri razloga.',
    sections: [
      {
        type: 'prose',
        title: 'Odnos cene i vrednosti',
        paragraphs: [
          'Seoske nekretnine u Mađarskoj spadaju među najpovoljnije u Evropi. Građevinski plac od 125 m² u Holandiji lako košta 88.000 €, a garaža oko 100.000 €. Za isti novac na mađarskom selu možete kupiti prostranu porodičnu kuću, često sa dosta zemlje.',
        ],
      },
      {
        type: 'prose',
        title: 'Prostor',
        paragraphs: [
          'Holandija ima gustinu naseljenosti od 482 stanovnika po km² uz oko 17 miliona stanovnika, a znatan deo zemlje čini voda. Nedostatak prostora nije apstraktan problem nego svakodnevno iskustvo, i razlog koji se najčešće pominje.',
        ],
      },
      {
        type: 'prose',
        title: 'Troškovi života',
        paragraphs: [
          'Velik deo naših kupaca su penzioneri ili su pred penzijom. Za njih niži troškovi života, odsustvo poreza na imovinu i pristupačna zdravstvena zaštita zajedno daju životni standard koji im ista penzija u Holandiji ne bi obezbedila.',
        ],
      },
      {
        type: 'prose',
        title: 'Položaj',
        paragraphs: [
          'Posle katastrofalne poplave 1953. Holandija je izgradila ogroman sistem odbrane od poplava. Zabrinutost zbog porasta nivoa mora igra ulogu u mnogim odlukama: Mađarska leži u srcu kontinenta, iznad nivoa mora.',
        ],
      },
      {
        type: 'cta',
        title: 'Vreme je za istraživanje',
        body: 'Pogledajte naše nekretnine ili nam prepustite da potražimo ono što imate na umu.',
        primary: { label: 'Naše nekretnine', to: 'properties' },
        secondary: { label: 'Kupovina u Mađarskoj', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Vodič za fotografisanje za oglašivače',
    metaDescription:
      'Dobre fotografije su najvažnije sredstvo za brzu prodaju. FINDDOME vodič za fotografisanje: svetlo, orijentacija, rezolucija i najčešće greške.',
    eyebrow: 'Za prodavce',
    title: 'Vodič za',
    titleEm: 'fotografisanje',
    intro:
      'Zainteresovani iz inostranstva najpre vide fotografije, a često samo njih. Ova pravila čine više od bilo kog teksta oglasa.',
    sections: photoGuideSections(L, {
      topTitle: 'Šest najvažnijih pravila',
      calloutTitle: 'Radije biste to prepustili drugima',
      calloutBody: (lines) =>
        `Angažujte profesionalca. To možete izabrati jednim klikom pri postavljanju oglasa: ${lines.join('; ')}. Obe usluge su opcione; neko iz našeg tima će Vas kontaktirati radi dogovora o terminu.`,
      ctaTitle: 'Spremni da oglasite nekretninu',
      primary: 'Postavite oglas',
      secondary: 'Cene',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
