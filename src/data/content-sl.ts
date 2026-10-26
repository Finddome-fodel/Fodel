/**
 * Long-form pages, Slovenian (formal "vikanje"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'sl' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `od ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_SL = {
  services: {
    metaTitle: 'Storitve: izvedba prodaje, pogodbe, fotografiranje',
    metaDescription: `Dvojezična prodajna pogodba ${from('hu')}, zastopanje s pooblastilom, vpis v zemljiško knjigo, energetska izkaznica, fotografiranje nepremičnine in posnetki z dronom.`,
    eyebrow: 'Storitve',
    title: 'Kaj naredimo poleg',
    titleEm: 'oglasa',
    intro:
      'Oglas je le prvi korak. S spodnjimi storitvami za vas izpeljemo celoten nakupni postopek v skladu s pravili obeh držav.',
    sections: [
      {
        type: 'steps',
        title: 'Kako poteka prodaja',
        items: [
          { n: '01', t: 'Stik', b: 'Svetovanje po telefonu in e-pošti, komunikacija z obema stranema, vključno s tolmači.' },
          { n: '02', t: 'Preverjanje kupcev', b: 'Preverimo ozadje, nakupni namen in finančno stanje.' },
          { n: '03', t: 'Ogled', b: 'Dogovorimo termine in vas pospremimo, s sodelavcem, ki govori vaš jezik.' },
          { n: '04', t: 'Pogajanja', b: 'Podpora v obeh jezikih, v realističnem cenovnem razponu.' },
          { n: '05', t: 'Pogodba', b: 'Dvojezična prodajna pogodba, pripravljena z odvetnikom.' },
          { n: '06', t: 'Zaključek', b: 'Zemljiška knjiga, komunalni priključki in po potrebi zastopanje s pooblastilom.' },
        ],
      },
      {
        type: 'table',
        title: 'Dvojezična prodajna pogodba',
        intro: 'Okvirne cene glede na jezikovno kombinacijo. Končna cena je odvisna od dolžine pogodbe.',
        rows: [
          ['Madžarščina', from('hu')],
          ['Nemščina–madžarščina', from('de-hu')],
          ['Angleščina–madžarščina', from('en-hu')],
          ['Nizozemščina–madžarščina', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Dodatne storitve',
        intro: 'Zanje pripravimo prilagojeno ponudbo:',
        items: [
          'Pridobitev energetske izkaznice: po pravilih EU obvezna v oglasu',
          'Profesionalno fotografiranje nepremičnine',
          'Posnetki z dronom: posebej učinkoviti pri velikih zemljiščih in razgledih',
          `Video z oglasom (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Zastopanje s pooblastilom',
        body: 'Za podpis vam ni treba potovati na Madžarsko: s pooblastilom vas zastopamo pri podpisu, v zemljiški knjigi in pri prenosu komunalnih priključkov.',
      },
      {
        type: 'prose',
        title: 'Kdaj je treba plačati provizijo',
        paragraphs: [
          `Provizijo zaračunamo le, če je kupca pripeljal FODEL, obstaja pisna prodajna pogodba in je bila plačana ara. Stopnja znaša ${COMMISSION.percent}\u00a0% neto, najmanj ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nizozemskega DDV. Plača prodajalec, ne kupec.`,
        ],
      },
      {
        type: 'cta',
        title: 'Vprašanja o postopku',
        body: '{hours} Prosite za brezplačen povratni klic ali nam pišite.',
        primary: { label: 'Pišite nam', to: 'contact' },
        secondary: { label: 'Pogosta vprašanja', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Kmetijske nepremičnine: do ${AGRI_HECTARE_LIMIT} hektarjev na Madžarskem`,
    metaDescription: `Državljan EU s kmetijsko izobrazbo lahko na Madžarskem pridobi do ${AGRI_HECTARE_LIMIT} hektarjev zemljišč. FODEL izpelje celoten postopek.`,
    eyebrow: 'Kmetijske nepremičnine',
    title: 'Kmetijska zemljišča in',
    titleEm: 'podeželska posestva',
    intro:
      'Madžarski trg z zemljišči ima svoja pravila. Kdor pozna pogoje, pride do vinogradov, njiv, kmetij in gozdov.',
    sections: [
      {
        type: 'prose',
        title: `Omejitev ${AGRI_HECTARE_LIMIT} hektarjev`,
        paragraphs: [
          `Državljan EU z kmetijsko izobrazbo lahko na Madžarskem pridobi skupaj do ${AGRI_HECTARE_LIMIT} hektarjev zemljišč. Celoten postopek uredimo namesto vas.`,
          'Postopek pri organih ima več korakov in se začne s priznanjem vaše izobrazbe. Naša ekipa vas vodi skozi celoten postopek in pripravi dokumente v obeh jezikih.',
        ],
      },
      {
        type: 'list',
        title: 'Kaj kupujejo naše stranke',
        items: [
          'Vinogradi z delujočo kletjo ali brez nje',
          'Njive, upravičene do podpore EU',
          'Kmetije z gospodarskimi poslopji, primerne za živinorejo',
          'Gozdovi in posestva z mešano rabo',
          'Večja strnjena zemljišča kot naložba',
        ],
      },
      {
        type: 'steps',
        title: 'Postopek',
        items: [
          { n: '01', t: 'Posvet', b: 'Pogovorimo se o vaših načrtih in razpoložljivem proračunu.' },
          { n: '02', t: 'Priznanje izobrazbe', b: 'Uredimo priznanje vaše kmetijske izobrazbe na Madžarskem.' },
          { n: '03', t: 'Iskanje', b: 'S partnerji iščemo zemljišča, ki izpolnjujejo pogoje.' },
          { n: '04', t: 'Dovoljenja', b: 'Vložitev zahtevkov za dovoljenja, potrebna za pridobitev zemljišča.' },
          { n: '05', t: 'Nakup', b: 'Dvojezična pogodba, vpis v zemljiško knjigo, prenos pravic do subvencij.' },
        ],
      },
      {
        type: 'callout',
        title: 'Pomembno',
        body: 'Pravila za pridobivanje kmetijskih zemljišč se občasno spreminjajo in so odvisna od vaših okoliščin. Tukaj zapisano je zgolj informativno. Za konkreten načrt se vedno posvetujte z nami in s specializiranim odvetnikom.',
      },
      {
        type: 'cta',
        title: 'Iščete kmetijsko nepremičnino?',
        body: 'Povejte nam, kaj želite – iščemo tudi zunaj nepremičnin, ki jih oglašujemo.',
        primary: { label: 'Brezplačno iskanje nepremičnine', to: 'searchRequest' },
        secondary: { label: 'Naše nepremičnine', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Nakup na Madžarskem: postopek korak za korakom',
    metaDescription:
      'Kako poteka nakup na Madžarskem za tujega kupca: pogodba, ara, zemljiška knjiga, komunalni priključki in stroški, ki jih je treba predvideti.',
    eyebrow: 'Za kupce',
    title: 'Nakup na',
    titleEm: 'Madžarskem',
    intro:
      'Madžarski postopek nakupa je precej predvidljiv, ko poznate korake. Ta vodnik vas popelje skozi njih.',
    sections: [
      {
        type: 'steps',
        title: 'Postopek',
        items: [
          { n: '01', t: 'Izbira', b: 'Izberete med našimi nepremičninami ali oddate brezplačno iskalno zahtevo.' },
          { n: '02', t: 'Ogled', b: 'Organiziramo pot in ogled s tolmačem.' },
          { n: '03', t: 'Ponudba', b: 'Pomagamo vam oddati realno ponudbo in se pogajati.' },
          { n: '04', t: 'Pogodba in ara', b: 'Dvojezična prodajna pogodba, običajno z 10-odstotno aro.' },
          { n: '05', t: 'Kupnina', b: 'Preostanek kupnine z bančnim nakazilom, kot določa pogodba.' },
          { n: '06', t: 'Predaja', b: 'Vpis v zemljiško knjigo, komunalni priključki, predaja ključev.' },
        ],
      },
      {
        type: 'list',
        title: 'Stroški poleg kupnine',
        items: [
          'Davek na promet: stopnja je odvisna od vrste nepremičnine in vaših okoliščin',
          'Odvetniški stroški za sestavo in sopodpis pogodbe',
          `Prevod dvojezične pogodbe: ${from('hu')}, odvisno od jezikovne kombinacije`,
          'Takse zemljiške knjige',
          'Morebitno provizijo družbi FODEL plača prodajalec, ne vi',
        ],
      },
      {
        type: 'prose',
        title: 'Ni vam treba biti prisotni',
        paragraphs: [
          'S pooblastilom vas zastopamo pri podpisu, v zemljiški knjigi in pri prenosu komunalnih priključkov. Nakup lahko tako poteka, tudi če ne morete ali ne želite potovati.',
        ],
      },
      {
        type: 'callout',
        title: 'Energetska izkaznica',
        body: 'Na Madžarskem je obvezna energetska izkaznica, ki mora biti po pravilih EU navedena tudi v oglasu. V naših oglasih najdete razred med lastnostmi; »v pripravi« pomeni, da izkaznica še nastaja.',
      },
      {
        type: 'cta',
        title: 'Začnemo?',
        body: 'Prebrskajte nepremičnine ali nam povejte, kaj iščete. Nič vas ne stane.',
        primary: { label: 'Naše nepremičnine', to: 'properties' },
        secondary: { label: 'Brezplačno iskanje nepremičnine', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Selitev na Madžarsko: zakaj se Nizozemci odločijo',
    metaDescription:
      'Štirje razlogi, zakaj se nizozemski in belgijski kupci selijo na Madžarsko: razmerje med ceno in kakovostjo, prostor, nižji življenjski stroški in lega.',
    eyebrow: 'Ozadje',
    title: 'Selitev na',
    titleEm: 'Madžarsko',
    intro:
      'Veliko Nizozemcev in Belgijcev izbere Madžarsko. V stotinah pogovorov z našimi strankami se vedno znova pojavljajo isti štirje razlogi.',
    sections: [
      {
        type: 'prose',
        title: 'Razmerje med ceno in kakovostjo',
        paragraphs: [
          'Podeželske nepremičnine na Madžarskem so med cenovno najugodnejšimi v Evropi. Na Nizozemskem stane gradbena parcela s 125 m² hitro 88.000\u00a0€, garaža pa okoli 100.000\u00a0€. Za isti denar na madžarskem podeželju kupite prostorno družinsko hišo, pogosto z veliko zemlje.',
        ],
      },
      {
        type: 'prose',
        title: 'Prostor',
        paragraphs: [
          'Nizozemska ima gostoto prebivalstva 482 prebivalcev na km² ob približno 17 milijonih prebivalcev, precejšen del države pa je voda. Pomanjkanje prostora ni abstrakten problem, temveč vsakdanja izkušnja in najpogosteje omenjeni razlog.',
        ],
      },
      {
        type: 'prose',
        title: 'Življenjski stroški',
        paragraphs: [
          'Velik del naših kupcev je upokojenih ali tik pred upokojitvijo. Zanje nižji življenjski stroški, odsotnost davka na nepremičnine in dostopno zdravstvo skupaj pomenijo življenjski standard, ki ga ista pokojnina na Nizozemskem ne bi omogočila.',
        ],
      },
      {
        type: 'prose',
        title: 'Lega',
        paragraphs: [
          'Po poplavni katastrofi leta 1953 je Nizozemska zgradila ogromen sistem protipoplavne zaščite. Skrb zaradi naraščanja morske gladine vpliva na številne odločitve: Madžarska leži sredi celine, nad morsko gladino.',
        ],
      },
      {
        type: 'cta',
        title: 'Čas za raziskovanje',
        body: 'Prebrskajte naše nepremičnine ali pa prepustite nam, da poiščemo, kar imate v mislih.',
        primary: { label: 'Naše nepremičnine', to: 'properties' },
        secondary: { label: 'Nakup na Madžarskem', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Fotografski vodnik za oglaševalce',
    metaDescription:
      'Dobre fotografije so najpomembnejše orodje za hitro prodajo. Fotografski vodnik FODEL: svetloba, usmerjenost, ločljivost in najpogostejše napake.',
    eyebrow: 'Za prodajalce',
    title: 'Fotografski',
    titleEm: 'za fotografiranje',
    intro:
      'Tuji interesenti najprej vidijo fotografije, pogosto samo fotografije. Ta pravila naredijo več kot katero koli besedilo oglasa.',
    sections: photoGuideSections(L, {
      topTitle: 'Šest najpomembnejših pravil',
      calloutTitle: 'Bi raje to prepustili drugim?',
      calloutBody: (lines) =>
        `Pokličite strokovnjaka. To lahko izberete z enim klikom ob oddaji oglasa: ${lines.join('; ')}. Oboje je neobvezno; nekdo iz naše ekipe vas bo kontaktiral in se dogovoril za termin.`,
      ctaTitle: 'Ste pripravljeni oglaševati svojo nepremičnino?',
      primary: 'Oddaj oglas',
      secondary: 'Cenik',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
