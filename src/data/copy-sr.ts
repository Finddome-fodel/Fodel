/**
 * Page copy, Serbian (Latin script).
 *
 * Formal "Vi" register, ekavian standard, plain professional real-estate
 * Serbian. The figures come from src/config/company.ts, never from this
 * file. Type-checked against the Hungarian copy, so a missing key fails the
 * build.
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'sr' as const;
const pct = (n: number) => `${n}%`;

export const SR = {
  home: {
    meta: {
      title: 'FINDDOME Nekretnine | Oglasite svoju nekretninu u Evropi',
      description:
        'Postavite oglas u nekoliko koraka. Posle onlajn plaćanja pojavljuje se na našem sajtu na 28 jezika, bez ugovora o ekskluzivnosti.',
    },
    hero: {
      eyebrow: `Od 2013. · ${foundedInLabel(L)}`,
      title: ['Oglasite', 'svoju nekretninu', 'u Evropi'],
      emphasis: 1,
      body: 'Postavite oglas u nekoliko koraka. Pregledamo ga, a posle onlajn plaćanja pojavljuje se na našem sajtu na 28 jezika, bez ugovora o ekskluzivnosti. Zainteresovani se obraćaju direktno Vama ili nama.',
      primary: 'Pogledajte nekretnine',
      secondary: 'Besplatna pretraga nekretnina',
      featuredLabel: 'Izdvojeno',
    },
    audiences: [
      {
        eyebrow: 'Za kupce',
        title: 'Nekretnine\ndirektno od vlasnika',
        body: 'Autentične mađarske kuće, salaši, seoska imanja i vinogradi. Kontaktirajte vlasnika direktno ili prepustite FINDDOME-u ceo postupak.',
        cta: 'Pogledajte nekretnine',
        to: 'properties',
      },
      {
        eyebrow: 'Za prodavce',
        title: 'Vaša nekretnina u Mađarskoj\nu Zapadnoj Evropi',
        body: `Oglašavanje na ${REACH_LANGUAGES} jezika u ${REACH_COUNTRIES} zemalja, bez ugovora o ekskluzivnosti. Provizija samo ako mi dovedemo kupca.`,
        cta: 'Saznajte više',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Izbor', title: 'Izdvojene nekretnine' },
    quote: '„Holanđani često ne mogu da veruju svojim očima kada vide šta se u Mađarskoj može kupiti i po kojoj ceni.”',
    quoteSource: `${BRAND.sr.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Kako funkcioniše', title: 'Kako radi FINDDOME' },
    cta: {
      eyebrow: 'Kontaktirajte nas',
      title: 'Rado ćemo',
      titleEm: 'Vas pozvati',
      body: `{hoursShort} · Povratni poziv Vas ništa ne košta.`,
    },
    referral: {
      eyebrow: 'Program preporuka',
      title: 'Preporučite oglašivača,',
      titleEm: 'dobijte 10%',
      body: 'Ako neko na Vašu preporuku postavi oglas kod FINDDOME-a, dobija 10% popusta na paket, a Vama odobravamo 10% na sledeći oglas. Već se oglašavate kod nas? Svoj kod za preporuke naći ćete na portalu, u odeljku Podešavanja.',
      steps: [
        'Preporučite poznanika putem obrasca ispod ili podelite svoj link sa portala',
        'Neko iz našeg tima stupa u kontakt s njim',
        'Ako postavi oglas, štedi 10%, a Vama odobravamo 10%',
      ],
      formTitle: 'Preporučite poznanika',
      fields: {
        referrerName: 'Vaše ime',
        referrerEmail: 'Vaša imejl adresa',
        referredName: 'Ime osobe koju preporučujete',
        referredEmail: 'Imejl adresa osobe koju preporučujete',
      },
      submit: 'Pošaljite preporuku',
      successTitle: 'Hvala na preporuci!',
      successBody:
        'Primili smo je. Naš saradnik će stupiti u kontakt sa osobom koju ste preporučili, a Vas ćemo obaveštavati imejlom.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Oglašeno u ${REACH_COUNTRIES} zemalja`,
      body: `Oglašavamo na ${REACH_LANGUAGES} jezika u Holandiji, Belgiji, Nemačkoj, Engleskoj i drugim zemljama EU, bez ugovora o ekskluzivnosti sa prodavcem.`,
    },
    {
      num: '02',
      title: 'Direktan kontakt',
      body: 'Mnogi oglasi pored naših podataka prikazuju ime i broj vlasnika. Ako se dogovorite međusobno, niko ne plaća proviziju.',
    },
    {
      num: '03',
      title: 'Ceo postupak na jednom mestu',
      body: 'Dvojezični kupoprodajni ugovor, zastupanje po punomoćju, upis u katastar i prenos komunalnih usluga.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Osnovano' },
    { value: String(REACH_COUNTRIES), label: 'Zemalja' },
    { value: String(REACH_LANGUAGES), label: 'Jezika' },
    { value: pct(COMMISSION.percent), label: 'Provizija' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Za prodavce | Vaša nekretnina u Mađarskoj u Zapadnoj Evropi',
      description: `Oglasite svoju nekretninu u Mađarskoj na ${REACH_LANGUAGES} jezika u ${REACH_COUNTRIES} zemalja, od ${eur(69, L)} i bez ekskluzivnosti. Provizija samo ako FINDDOME dovede kupca: ${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} PDV.`,
    },
    hero: {
      eyebrow: 'Za prodavce',
      title: 'Vaša nekretnina',
      titleEm: 'u Zapadnoj Evropi',
      body: `Po FINDDOME modelu Vaša nekretnina se pojavljuje na ${REACH_LANGUAGES} jezika u ${REACH_COUNTRIES} zemalja, bez ugovora o ekskluzivnosti. Radimo isključivo sa ozbiljnim kupcima.`,
      cta: 'Postavite oglas',
      secondary: 'Pogledajte cene',
    },
    benefits: {
      eyebrow: 'Prednosti',
      title: 'Šta donosi kupac iz inostranstva',
      points: [
        'Kupci sa sopstvenim sredstvima: nema čekanja na kredit ili subvenciju.',
        'Plaćanje odjednom bankovnim prenosom, brzo i bezbedno.',
        'Ozbiljna namera: jedan obilazak ih košta dva dana i 200–300 €.',
        'Realne cene: bez nerazumnog cenkanja.',
        'FINDDOME lično procenjuje svakog kupca pre zakazivanja termina.',
      ],
    },
    personas: {
      eyebrow: 'Kupci',
      title: 'Ko su naši kupci',
      items: [
        {
          title: 'Penzioneri',
          body: 'Traže u Mađarskoj niže troškove života, poreske pogodnosti i pristupačnu zdravstvenu zaštitu.',
        },
        {
          title: 'Porodice',
          body: 'Traže prostor, prirodu i život na selu. Često salaš, seosko imanje ili kuću za odmor.',
        },
        {
          title: 'Investitori',
          body: 'Traže poslovne nekretnine, vinograde i poljoprivredno zemljište.',
        },
        {
          title: 'Oni koji se sele zbog načina života',
          body: 'Ostavljaju za sobom visoke troškove života i gužvu, u potrazi za autentičnim evropskim načinom života.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Korak po korak', title: 'FINDDOME model' },
    commission: {
      eyebrow: 'Cene',
      title: 'Provizija samo\nuz uspešnu prodaju',
      body: `Ako Vas kupac kontaktira direktno i ne treba Vam naša pomoć, ne plaćate ništa osim cene oglasa. Ako FINDDOME posreduje u prodaji: ${pct(COMMISSION.percent)} neto (min. ${eur(COMMISSION.minimumEur, L)}) + ${pct(COMMISSION.vatPercent)} holandski PDV.`,
      cta: 'Pogledajte cene',
    },
  },

  buyers: {
    meta: {
      title: 'Za kupce | Kupovina nekretnine u Mađarskoj',
      description:
        'Kako bezbedno kupiti nekretninu u Mađarskoj: dvojezični ugovor, zastupanje po punomoćju i upis u katastar. Uz to i besplatna pretraga nekretnina.',
    },
    hero: {
      eyebrow: 'Za kupce',
      title: 'Kupovina u Mađarskoj,',
      titleEm: 'bez iznenađenja',
      body: 'Mnogi naši oglasi navode vlasnika. Možete pregovarati direktno ili nama prepustiti ceo postupak.',
      cta: 'Pogledajte nekretnine',
      secondary: 'Besplatna pretraga nekretnina',
    },
    services: {
      eyebrow: 'Šta preuzimamo',
      title: 'Potpuna podrška',
      points: [
        'Komunikacija između Vas i prodavca, uključujući prevodioce.',
        'Obilasci uz saradnika koji govori Vaš jezik.',
        'Pomoć u pregovorima o ceni i pri sastavljanju dvojezičnog ugovora.',
        'Zastupanje po punomoćju: ne morate da putujete u Mađarsku radi potpisivanja.',
        'Upis u katastar i prenos komunalnih usluga.',
      ],
    },
    reasons: {
      eyebrow: 'Zašto Mađarska',
      title: 'Šta traže kupci iz Zapadne Evrope',
    },
  },

  about: {
    meta: {
      title: 'O nama | Most između dva sveta',
      description:
        'Od 2013. povezujemo prodavce iz Mađarske i kupce iz Zapadne Evrope. Diskretno, transparentno i bez ugovora o ekskluzivnosti.',
    },
    hero: {
      eyebrow: 'O nama',
      title: 'Most između',
      titleEm: 'dva sveta',
      body: 'Od 2013. pomažemo prodavcima iz Mađarske da pronađu pravog kupca iz inostranstva: diskretno, efikasno i bez ugovora o ekskluzivnosti.',
    },
    origin: {
      eyebrow: 'Početak · Almere-Bojten, 2013.',
      quote:
        '„Živeći u Almere-Bojtenu, videli smo koliko Holanđani čeznu za autentičnim evropskim načinom života, dok u Mađarskoj najlepše nekretnine neprimećeno čekaju vlasnika.”',
    },
    values: {
      eyebrow: 'Za šta se zalažemo',
      title: 'Na čemu gradimo',
      items: [
        {
          num: '01',
          title: 'Diskrecija',
          body: 'Sa podacima prodavaca i kupaca postupamo sa najvećom mogućom pažnjom. Lični podaci se objavljuju samo uz saglasnost.',
        },
        {
          num: '02',
          title: 'Transparentnost',
          body: 'Bez skrivenih troškova. Naše cene i provizija objavljeni su na ovom sajtu, a o svakom koraku Vas obaveštavamo.',
        },
        {
          num: '03',
          title: 'Poznavanje dve kulture',
          body: 'Oba tržišta poznajemo iznutra. Naš tim govori holandski, nemački, engleski, francuski i mađarski.',
        },
      ],
    },
    approach: {
      eyebrow: 'Naš pristup',
      title: 'Nismo velika agencija.',
      titleEm: 'To je naša snaga.',
      points: [
        'Svaki klijent ima lični kontakt: bez kol-centra, bez anonimnog šaltera.',
        'Obe kulture poznajemo iznutra i nekretnine procenjujemo i holandskim i mađarskim očima.',
        'Spajanje nekretnine i kupca je naša odgovornost, a ne stvar slučaja.',
        'Radimo bez ekskluzivnosti jer više volimo da ubedimo rezultatima.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Most koji smo',
      titleEm: 'izgradili',
      paragraphs: [
        'FINDDOME su osnovali Mađari koji žive u Holandiji. Počeli smo 2013. u Almere-Bojtenu, gde smo primetili koliko Holanđana i Belgijanaca želi da kupi autentičan mađarski dom, a ne zna odakle da počne.',
        `Danas se oglašavamo u ${REACH_COUNTRIES} zemalja na ${REACH_LANGUAGES} jezika i vodimo svaku transakciju od početka do kraja: dvojezični kupoprodajni ugovor, zastupanje po punomoćju i upis u katastar. Naša kancelarija je u Hagu.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Rado ćemo Vas pozvati',
      description: `Pozovite nas radnim danima od ${COMPANY.hours.weekdays.from} do ${COMPANY.hours.weekdays.to} ili zatražite povratni poziv. Razgovor Vas ništa ne košta.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Rado ćemo', titleEm: 'Vas pozvati' },
    formTitle: 'Zatražite povratni poziv',
    submit: 'Zatražite poziv',
    subjects: [
      'Pitanje o nekretnini',
      'Oglašavanje nekretnine',
      'Upit o cenama',
      'Zahtev za povratni poziv',
      'Ostalo',
    ],
    note: `Povratni poziv Vas ništa ne košta: mi plaćamo razgovor. Uzvraćamo pozive do ${COMPANY.hours.callback.to}, i vikendom.`,
  },
} satisfies CopyShape;
