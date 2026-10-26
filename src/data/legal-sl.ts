/**
 * Legal pages, Slovenian (formal "vikanje"). A faithful translation of the Dutch pages
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

const L = 'sl' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. julij 2026';
const notice =
  'To je prevod za lažje razumevanje. V primeru razhajanj velja nizozemski (pri zadevah nizozemskega prava) ali madžarski izvirnik.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_SL = {
  imprint: {
    metaTitle: 'Impresum: podatki o podjetju',
    metaDescription: `Podatki o podjetju ${COMPANY.names.legal}: sedež, ID za DDV, številka KvK in kontaktni podatki.`,
    eyebrow: 'Impresum',
    title: 'Podatki o',
    titleEm: 'podjetju',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Podatki o ponudniku storitve',
        rows: [
          ['Ime podjetja', COMPANY.names.legal],
          ['Sedež', addressLine(COMPANY.address, L)],
          ['ID za DDV', COMPANY.registration.vat],
          ['Številka KvK (nizozemska gospodarska zbornica)', kvk],
          ['Zastopnik', COMPANY.principal],
          ['E-pošta', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Ustanovljeno', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bančni računi',
        rows: [
          ['Nizozemska', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Madžarskem', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Spori',
        body: 'Pri potrošniškem sporu lahko uporabite tudi evropsko platformo za spletno reševanje sporov: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Obvestilo o zasebnosti',
    metaDescription:
      'Kako FODEL ravna z vašimi osebnimi podatki: katere podatke obdelujemo, kako dolgo jih hranimo in katere pravice imate po GDPR.',
    eyebrow: 'Zasebnost',
    title: 'Obvestilo o',
    titleEm: 'zasebnosti',
    intro:
      'To obvestilo opisuje, kako v skladu z GDPR ravnamo z osebnimi podatki, ki nam jih posredujete prek te spletne strani.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Upravljavec podatkov',
        rows: [
          ['Upravljavec', COMPANY.names.legal],
          ['Naslov', addressLine(COMPANY.address, L)],
          ['E-pošta', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Katere podatke obdelujemo',
        intro: 'Samo podatke, ki jih sami vnesete v naše obrazce:',
        items: [
          'Ime, e-poštni naslov in telefonska številka: da lahko odgovorimo na vaše povpraševanje',
          'Zadeva in vsebina vašega sporočila',
          'Pri oglasu: podatki o nepremičnini in vaši podatki za račun',
          'Pri iskalni zahtevi: vaša merila iskanja',
          'Za notranjo administracijo: kdaj in kateri obrazec ste izpolnili ter kdaj ste se prijavili v portal, brez shranjevanja naslova IP',
        ],
      },
      {
        type: 'table',
        title: 'Pravna podlaga in obdobje hrambe',
        rows: [
          ['Stik in prošnja za povratni klic', 'Privolitev (točka (a) člena 6(1) GDPR): 12 mesecev'],
          ['Naročilo oglasa', 'Izvajanje pogodbe (točka (b) člena 6(1)): 7 let, zakonska davčna hramba'],
          ['Iskalna zahteva', 'Privolitev: do zaključka, največ 24 mesecev'],
          ['Notranji dnevnik dejavnosti', 'Zakoniti interes (točka (f) člena 6(1)): urejena administracija in odkrivanje zlorab: največ 24 mesecev'],
        ],
      },
      {
        type: 'list',
        title: 'S kom delimo podatke',
        intro: 'Vaših podatkov ne prodajamo in jih ne delimo za namene trženja. Naši obdelovalci so:',
        items: [
          'Naš ponudnik e-pošte, z obdelavo znotraj EU',
          'Ponudnik gostovanja te spletne strani',
          'Pri nakupu, in le na vašo zahtevo: druga stranka in vključeni odvetnik',
        ],
      },
      {
        type: 'callout',
        title: 'O oglasih',
        body: 'Kot oglaševalec nam lahko dovolite, da ob oglasu prikažemo vaše ime in telefonsko številko, da vas lahko zainteresirani kontaktirajo neposredno. Dovoljenje lahko kadar koli prekličete; podatke nato odstranimo iz oglasa.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'E-novice',
        body: 'Če se naročite na naše e-novice, obdelujemo vaš e-poštni naslov, izbrani jezik ter čas prijave in potrditve, izključno za pošiljanje e-novic, na podlagi vaše privolitve. Prijava poteka v dveh korakih: ničesar ne pošljemo, dokler ne kliknete gumba v potrditvenem sporočilu. V vsakem sporočilu se lahko odjavite z enim klikom in takoj prenehamo. Za pošiljanje uporabljamo storitev Resend.',
      },
      {
        type: 'list',
        title: 'Vaše pravice',
        items: [
          'Dostop do podatkov, ki jih obdelujemo o vas',
          'Popravek in izbris',
          'Omejitev obdelave ali ugovor zoper njo',
          'Prenosljivost podatkov',
          'Kadar koli preklicati privolitev',
          'Vložitev pritožbe pri nizozemskem organu za varstvo podatkov (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Stik glede zasebnosti',
        paragraphs: [`Vprašanja ali zahteve lahko pošljete na ${COMPANY.email.primary}. Odgovorimo najpozneje v 30 dneh.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Obvestilo o piškotkih',
    metaDescription: `Katere piškotke uporablja ${SITE_HOST} in kako spremenite svojo izbiro.`,
    eyebrow: 'Piškotki',
    title: 'Obvestilo o',
    titleEm: 'piškotkih',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Ta spletna stran trenutno uporablja le tehnično nujno shranjevanje. Ne uporabljamo oglaševalskih ali sledilnih skript in ničesar ne delimo z družbenimi omrežji.',
        ],
      },
      {
        type: 'table',
        title: 'Kaj shranjujemo',
        rows: [
          [
            'fodel:consent',
            'Vaša izbira glede piškotkov (sprejeto ali zavrnjeno). Shrani se v vašem brskalniku in ne pride do nas. Hramba: 12 mesecev.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistika',
        paragraphs: [
          'Če bomo kdaj vodili statistiko obiskov, jo bomo vklopili le z vašo predhodno izrecno privolitvijo. Zavrnitev nikakor ne omejuje uporabe strani.',
        ],
      },
      {
        type: 'prose',
        title: 'Sprememba izbire',
        paragraphs: [
          'Izbiro lahko kadar koli spremenite tako, da izbrišete shranjene podatke brskalnika za to stran; obvestilo o piškotkih se nato znova prikaže.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Splošni pogoji',
    metaDescription:
      'Pogoji oglaševalske in posredniške storitve FODEL: cene, provizija, umik in odgovornost.',
    eyebrow: 'Pogoji',
    title: 'Splošni',
    titleEm: 'pogoji',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Opomba',
        body: 'Ta stran je povzetek. Celotni zavezujoči pogoji so na voljo v PDF; v primeru razhajanj velja PDF.',
      },
      {
        type: 'prose',
        title: '1. Storitev',
        paragraphs: [
          'FODEL oglašuje madžarske nepremičnine na lastnih večjezičnih spletnih straneh in na podlagi ločene pogodbe pomaga pri izvedbi prodaje.',
          'Oglaševalska storitev ni izključna: prodajalec lahko nepremičnino ponuja in proda tudi po drugih poteh.',
        ],
      },
      {
        type: 'list',
        title: '2. Objava oglasa',
        ordered: true,
        items: [
          'Prodajalec izpolni prijavni obrazec.',
          'FODEL pošlje zahtevek za plačilo izbranega paketa.',
          'Prodajalec plača z bančnim nakazilom.',
          'Po prejemu plačila prodajalec dobi pravico do nalaganja fotografij.',
          'FODEL poskrbi za prevod in objavi oglas.',
        ],
      },
      {
        type: 'table',
        title: '3. Cene',
        intro: `Vse cene vključujejo ${LISTING_VAT_PERCENT}\u00a0% nizozemskega DDV. Celoten pregled je na strani Cene.`,
        rows: [
          [`Varčni oglas (${cheap.months} mesecev)`, eur(cheap.priceEur, L)],
          [`Standardni oglas (${normal.months} mesecev)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Prevod', `${eur(extra('translation').priceEur, L)} na jezik`],
          [
            'Izpostavitev',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} na mesec (najmanj ${minMonths} mesece)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Provizija',
        paragraphs: [
          'Provizija zapade v plačilo le, če so izpolnjeni vsi naslednji pogoji: pisna prodajna pogodba, kupec, ki ga je pripeljal FODEL, in plačana ara.',
          `Provizija znaša ${COMMISSION.percent}\u00a0% neto, najmanj ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nizozemskega DDV.`,
          'Če zainteresirani neposredno kontaktira prodajalca in naša pomoč pri izvedbi ni potrebna, se poleg cene oglasa ne plača nič.',
        ],
      },
      {
        type: 'prose',
        title: '5. Umik oglasa',
        paragraphs: [
          'Prodajalec lahko oglas umakne pred iztekom. Že plačani stroški oglasa se v tem primeru ne vrnejo.',
        ],
      },
      {
        type: 'prose',
        title: '6. Odgovornost',
        paragraphs: [
          'Za točnost podatkov o nepremičnini odgovarja prodajalec. FODEL objavi posredovane podatke in ne odgovarja za njihovo točnost.',
          'Prevodi na tej spletni strani so informativni; v primeru spora velja madžarska različica.',
        ],
      },
      {
        type: 'prose',
        title: '7. Pravica do odstopa',
        paragraphs: [
          'Prodajalec, ki je potrošnik, ima zakonsko pravico do odstopa od pogodbe, sklenjene na daljavo. Če prodajalec izrecno zahteva takojšnjo izvedbo, se pravica do odstopa zmanjša sorazmerno z že opravljeno storitvijo.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Izjava o dostopnosti',
    metaDescription: `Raven dostopnosti ${SITE_HOST}, standard, ki ga upoštevamo, in kako nam sporočite povratne informacije.`,
    eyebrow: 'Dostopnost',
    title: 'Izjava o',
    titleEm: 'dostopnosti',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Želimo, da je ta spletna stran uporabna za vse, tudi za obiskovalce, ki uporabljajo bralnik zaslona, tipkovnico ali povečavo.',
          'Stran gradimo po smernicah WCAG 2.2, raven AA. Precejšen del naših obiskovalcev je upokojenih, zato imajo prednost velikost besedila, kontrast in upravljanje s tipkovnico.',
        ],
      },
      {
        type: 'list',
        title: 'Kaj je že urejeno',
        items: [
          'Vse besedilo ima kontrastno razmerje najmanj 4,5 : 1',
          'Popolno upravljanje s tipkovnico z vidnim označevanjem fokusa',
          'Povezava „preskoči na vsebino“ na vrhu vsake strani',
          'Smiselna nadomestna besedila za vse slike',
          'Polja obrazcev s povezanimi oznakami in besedilnimi sporočili o napakah',
          'Upoštevanje sistemske nastavitve „zmanjšaj gibanje“',
          'Stran je berljiva in uporabna tudi brez JavaScripta',
        ],
      },
      {
        type: 'prose',
        title: 'Znane omejitve',
        paragraphs: ['Na dostopnost vsebin tretjih oseb, kot je storitev zemljevidov, nimamo vpliva.'],
      },
      {
        type: 'prose',
        title: 'Povratne informacije',
        paragraphs: [
          `Če naletite na oviro, nam to sporočite na ${COMPANY.email.primary} ali po telefonu. Prijave rešujemo čim hitreje.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
