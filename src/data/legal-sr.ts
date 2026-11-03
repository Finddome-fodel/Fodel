/**
 * Legal pages, Serbian, Latin script (formal Vi). A faithful translation of the English
 * legal pages (src/data/legal-en.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. The notice on every page states that the Hungarian
 * or English version prevails (the Dutch original on matters of Dutch law).
 * It needs the client's and a lawyer's sign-off before launch, like the other
 * translations; see Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { legacyTiers } from '~/lib/price-tiers';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'sr' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. jul 2026.';
const notice =
  'Ovo je prevod radi lakšeg snalaženja. U slučaju razlika, merodavna je mađarska ili engleska verzija (u pitanjima holandskog prava – holandski original).';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
/** Every tier price of a package, e.g. "€ 129 / € 179" (the tier is set by the listing's forint price). */
const tierPrices = (pkg: typeof normal) =>
  legacyTiers(pkg.priceEur, pkg.priceEurAbove, pkg.thresholdHuf).map((tier) => eur(tier.priceEur, L)).join(' / ');
// Only the category highlight is sold since November 2026; the homepage is an editorial choice.
const minMonths = (extra('category-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_SR = {
  imprint: {
    metaTitle: 'Impresum: podaci o kompaniji',
    metaDescription: `Podaci o kompaniji ${COMPANY.names.legal}: adresa sedišta, PDV broj, KvK broj i kontakt podaci.`,
    eyebrow: 'Impresum',
    title: 'Podaci o',
    titleEm: 'kompaniji',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Podaci o pružaocu usluga',
        rows: [
          ['Naziv kompanije', COMPANY.names.legal],
          ['Adresa sedišta', addressLine(COMPANY.address, L)],
          ['PDV broj', COMPANY.registration.vat],
          ['KvK broj (Privredna komora Holandije)', kvk],
          ['Zastupnik', COMPANY.principal],
          ['E-pošta', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Godina osnivanja', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bankovni računi',
        rows: [
          ['Holandija', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Mađarska', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Sporovi',
        body: 'U potrošačkom sporu možete se obratiti i evropskoj ODR platformi: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Obaveštenje o privatnosti',
    metaDescription:
      'Kako FODEL postupa sa Vašim podacima o ličnosti: koje podatke obrađujemo, koliko ih dugo čuvamo i koja prava imate prema GDPR-u.',
    eyebrow: 'Privatnost',
    title: 'Obaveštenje o',
    titleEm: 'privatnosti',
    intro:
      'Ovo obaveštenje opisuje kako, u skladu sa GDPR-om, postupamo sa podacima o ličnosti koje nam dostavljate putem ovog sajta.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Rukovalac podacima',
        rows: [
          ['Rukovalac', COMPANY.names.legal],
          ['Adresa', addressLine(COMPANY.address, L)],
          ['E-pošta', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Koje podatke obrađujemo',
        intro: 'Samo podatke koje sami unesete u naše obrasce:',
        items: [
          'Ime, adresu e-pošte i broj telefona: da bismo mogli da odgovorimo na Vaš upit',
          'Predmet i sadržaj Vaše poruke',
          'Za oglas: podatke o nekretnini i Vaše podatke za fakturisanje',
          'Za zahtev za pretragu: Vaše kriterijume pretrage',
          'Za internu evidenciju: kada ste i koji obrazac popunili i kada ste se prijavili na portal, bez čuvanja IP adrese',
        ],
      },
      {
        type: 'table',
        title: 'Pravni osnov i rok čuvanja',
        rows: [
          ['Kontakt i zahtev za povratni poziv', 'Pristanak (čl. 6(1)(a) GDPR): 12 meseci'],
          ['Narudžbina oglasa', 'Izvršenje ugovora (čl. 6(1)(b)): 7 godina, zakonski rok čuvanja poreske dokumentacije'],
          ['Zahtev za pretragu', 'Pristanak: do realizacije, najduže 24 meseca'],
          ['Interni dnevnik aktivnosti', 'Legitimni interes (čl. 6(1)(f)): uredno vođenje evidencije i otkrivanje zloupotreba: najduže 24 meseca'],
        ],
      },
      {
        type: 'list',
        title: 'Sa kim delimo podatke',
        intro: 'Vaše podatke ne prodajemo i ne delimo ih u marketinške svrhe. Naši obrađivači su:',
        items: [
          'Naš dobavljač usluge e-pošte, sa obradom unutar EU',
          'Hosting provajder ovog sajta',
          'Pri kupovini, i samo na Vaš zahtev: druga ugovorna strana i advokat koji učestvuje u poslu',
        ],
      },
      {
        type: 'callout',
        title: 'O oglasima',
        body: 'Kao oglašivač možete nam dozvoliti da uz oglas prikažemo Vaše ime i broj telefona, kako bi Vas zainteresovani mogli direktno kontaktirati. Tu dozvolu možete povući u bilo kom trenutku; tada uklanjamo te podatke iz oglasa.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Bilten',
        body: 'Ako se prijavite na naš bilten, na osnovu Vašeg pristanka obrađujemo Vašu adresu e-pošte, izabrani jezik i vreme prijave i potvrde, isključivo radi slanja biltena. Prijava ima dva koraka: ništa ne šaljemo dok ne kliknete na dugme u imejlu za potvrdu. U svakom imejlu možete se odjaviti jednim klikom i odmah prestajemo sa slanjem. Za slanje koristimo uslugu Resend.',
      },
      {
        type: 'list',
        title: 'Vaša prava',
        items: [
          'Pristup podacima koje o Vama obrađujemo',
          'Ispravka i brisanje',
          'Ograničenje obrade ili prigovor na obradu',
          'Prenosivost podataka',
          'Povlačenje pristanka u bilo kom trenutku',
          'Podnošenje pritužbe holandskom organu za zaštitu podataka (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt u vezi sa privatnošću',
        paragraphs: [`Pitanja i zahteve možete poslati na ${COMPANY.email.primary}. Odgovaramo najkasnije u roku od 30 dana.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Obaveštenje o kolačićima',
    metaDescription: `Koje kolačiće koristi ${SITE_HOST} i kako da promenite svoj izbor.`,
    eyebrow: 'Kolačići',
    title: 'Obaveštenje o',
    titleEm: 'kolačićima',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Ovaj sajt trenutno koristi samo tehnički neophodno skladištenje. Ne pokrećemo reklamne skripte ni skripte za praćenje i ništa ne delimo sa društvenim mrežama.',
        ],
      },
      {
        type: 'table',
        title: 'Šta čuvamo',
        rows: [
          [
            'fodel:consent',
            'Vaš izbor u vezi sa kolačićima (prihvaćeno ili odbijeno). Čuva se u Vašem pregledaču i ne stiže do nas. Rok čuvanja: 12 meseci.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistika',
        paragraphs: [
          'Ako ikada budemo vodili statistiku poseta, uključićemo je samo uz Vaš prethodni, izričiti pristanak. Odbijanje ni na koji način ne ograničava korišćenje sajta.',
        ],
      },
      {
        type: 'prose',
        title: 'Promena izbora',
        paragraphs: [
          'Svoj izbor možete promeniti u bilo kom trenutku brisanjem sačuvanih podataka pregledača za ovaj sajt; obaveštenje o kolačićima tada se ponovo pojavljuje.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Opšti uslovi poslovanja',
    metaDescription:
      'Uslovi FODEL-ove usluge oglašavanja i posredovanja: cene, provizija, povlačenje i odgovornost.',
    eyebrow: 'Uslovi',
    title: 'Opšti uslovi',
    titleEm: 'poslovanja',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Napomena',
        body: 'Ova stranica je sažetak. Potpuni, obavezujući uslovi dostupni su u PDF formatu; u slučaju razlika, merodavan je PDF.',
      },
      {
        type: 'prose',
        title: '1. Usluga',
        paragraphs: [
          'FODEL oglašava nekretnine u Mađarskoj na sopstvenim višejezičnim sajtovima i, na osnovu posebnog ugovora, pomaže u realizaciji prodaje.',
          'Usluga oglašavanja nije ekskluzivna: prodavac nekretninu može nuditi i prodati i preko drugih kanala.',
        ],
      },
      {
        type: 'list',
        title: '2. Postavljanje oglasa',
        ordered: true,
        items: [
          'Prodavac popunjava obrazac za registraciju.',
          'FODEL šalje zahtev za plaćanje izabranog paketa.',
          'Prodavac plaća bankovnim transferom.',
          'Po prijemu uplate prodavac dobija pravo da otpremi fotografije.',
          'FODEL obavlja prevod i objavljuje oglas.',
        ],
      },
      {
        type: 'table',
        title: '3. Cene',
        intro: `Sve cene uključuju holandski PDV od ${LISTING_VAT_PERCENT}%. Potpun pregled nalazi se na stranici Cene.`,
        rows: [
          [`Ekonomični oglas (${cheap.months} meseca)`, eur(cheap.priceEur, L)],
          [`Standardni oglas (${normal.months} meseci)`, `${tierPrices(normal)}`],
          ['Prevod', `${eur(extra('translation').priceEur, L)} po jeziku`],
          [
            'Isticanje',
            `${eur(extra('category-highlight').priceEur, L)} mesečno (najmanje ${minMonths} meseca)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Provizija',
        paragraphs: [
          'Provizija se plaća samo kada su ispunjeni svi sledeći uslovi: pisani kupoprodajni ugovor, kupac kojeg je doveo FODEL i uplaćen kapar.',
          `Provizija iznosi ${COMMISSION.percent}% neto, najmanje ${eur(COMMISSION.minimumEur, L)}, uz holandski PDV od ${COMMISSION.vatPercent}%.`,
          'Ako zainteresovano lice direktno kontaktira prodavca i naša pomoć pri realizaciji nije potrebna, ne duguje se ništa osim naknade za oglas.',
        ],
      },
      {
        type: 'prose',
        title: '5. Povlačenje oglasa',
        paragraphs: [
          'Prodavac može povući oglas pre isteka roka. Već plaćene naknade za oglas u tom slučaju se ne vraćaju.',
        ],
      },
      {
        type: 'prose',
        title: '6. Odgovornost',
        paragraphs: [
          'Prodavac je odgovoran za tačnost podataka o nekretnini. FODEL prenosi dostavljene podatke i ne odgovara za njihovu tačnost.',
          'Prevodi na ovom sajtu služe za informisanje; u slučaju spora merodavna je mađarska verzija.',
        ],
      },
      {
        type: 'prose',
        title: '7. Pravo na odustanak',
        paragraphs: [
          'Prodavac koji je potrošač ima zakonsko pravo na odustanak od ugovora zaključenog na daljinu. Ako prodavac izričito zatraži trenutno izvršenje, pravo na odustanak se srazmerno umanjuje za već pruženu uslugu.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Izjava o pristupačnosti',
    metaDescription: `Nivo pristupačnosti sajta ${SITE_HOST}, standard koji pratimo i kako nam možete poslati povratne informacije.`,
    eyebrow: 'Pristupačnost',
    title: 'Izjava o',
    titleEm: 'pristupačnosti',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Želimo da ovaj sajt mogu da koriste svi, uključujući posetioce koji koriste čitač ekrana, tastaturu ili uvećanje.',
          'Sajt gradimo prema standardu WCAG 2.2, nivo AA. Značajan deo naših posetilaca su penzioneri, pa su veličina teksta, kontrast i upravljanje tastaturom prioritet.',
        ],
      },
      {
        type: 'list',
        title: 'Šta je obezbeđeno',
        items: [
          'Sav tekst ima odnos kontrasta od najmanje 4,5:1',
          'Potpuno upravljanje tastaturom uz vidljiv indikator fokusa',
          'Link „Pređi na sadržaj” na vrhu svake stranice',
          'Smisleni alternativni tekstovi za sve slike',
          'Polja obrazaca sa povezanim oznakama i tekstualnim porukama o greškama',
          'Poštovanje sistemskog podešavanja „smanji pokrete”',
          'Sajt je čitljiv i upotrebljiv bez JavaScript-a',
        ],
      },
      {
        type: 'prose',
        title: 'Poznata ograničenja',
        paragraphs: ['Nemamo uticaj na pristupačnost sadržaja trećih strana, kao što je servis mapa.'],
      },
      {
        type: 'prose',
        title: 'Povratne informacije',
        paragraphs: [
          `Ako naiđete na prepreku, javite nam na ${COMPANY.email.primary} ili telefonom. Prijave rešavamo što je brže moguće.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
