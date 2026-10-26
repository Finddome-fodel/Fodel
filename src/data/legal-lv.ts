/**
 * Legal pages, Latvian (formal "jūs"). A faithful translation of the Dutch pages
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

const L = 'lv' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '2026. gada 27. jūlijs';
const notice =
  'Šis ir tulkojums jūsu ērtībai. Atšķirību gadījumā noteicošais ir oriģināls nīderlandiešu valodā (Nīderlandes tiesību jautājumos) vai ungāru valodā.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_LV = {
  imprint: {
    metaTitle: 'Rekvizīti: uzņēmuma dati',
    metaDescription: `${COMPANY.names.legal} rekvizīti: juridiskā adrese, PVN numurs, KvK numurs un kontaktinformācija.`,
    eyebrow: 'Rekvizīti',
    title: 'Uzņēmuma',
    titleEm: 'dati',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Pakalpojuma sniedzēja dati',
        rows: [
          ['Uzņēmuma nosaukums', COMPANY.names.legal],
          ['Juridiskā adrese', addressLine(COMPANY.address, L)],
          ['PVN numurs', COMPANY.registration.vat],
          ['KvK numurs (Nīderlandes Tirdzniecības kamera)', kvk],
          ['Pārstāvis', COMPANY.principal],
          ['E-pasts', COMPANY.email.primary],
          ['Tālrunis', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Dibināts', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bankas konti',
        rows: [
          ['Nīderlande', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Ungārijā', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Strīdi',
        body: 'Patērētāju strīda gadījumā varat izmantot arī Eiropas strīdu izšķiršanas tiešsaistē platformu: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Privātuma politika',
    metaDescription:
      'Kā FODEL apstrādā jūsu personas datus: kādus datus apstrādājam, cik ilgi tos glabājam un kādas tiesības jums ir saskaņā ar VDAR.',
    eyebrow: 'Privātums',
    title: 'Privātuma',
    titleEm: 'politika',
    intro:
      'Šajā paziņojumā aprakstīts, kā mēs saskaņā ar VDAR apstrādājam personas datus, ko jūs mums sniedzat šajā vietnē.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Pārzinis',
        rows: [
          ['Pārzinis', COMPANY.names.legal],
          ['Adrese', addressLine(COMPANY.address, L)],
          ['E-pasts', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Kādus datus mēs apstrādājam',
        intro: 'Tikai datus, ko paši ievadāt mūsu veidlapās:',
        items: [
          'Vārds, e-pasta adrese un tālruņa numurs: lai varētu atbildēt uz jūsu pieprasījumu',
          'Jūsu ziņojuma temats un saturs',
          'Sludinājumam: īpašuma dati un jūsu norēķinu dati',
          'Meklēšanas pieprasījumam: jūsu meklēšanas kritēriji',
          'Iekšējai administrēšanai: kad un kuru veidlapu aizpildījāt un kad pieteicāties portālā, nesaglabājot IP adresi',
        ],
      },
      {
        type: 'table',
        title: 'Juridiskais pamats un glabāšanas laiks',
        rows: [
          ['Saziņa un atzvana pieprasījums', 'Piekrišana (VDAR 6. panta 1. punkta a) apakšpunkts): 12 mēneši'],
          ['Sludinājuma pasūtījums', 'Līguma izpilde (6. panta 1. punkta b) apakšpunkts): 7 gadi, likumā noteiktā nodokļu dokumentu glabāšana'],
          ['Meklēšanas pieprasījums', 'Piekrišana: līdz izpildei, ne ilgāk kā 24 mēnešus'],
          ['Iekšējais darbību žurnāls', 'Leģitīmās intereses (6. panta 1. punkta f) apakšpunkts): kārtīga administrēšana un ļaunprātīgas izmantošanas atklāšana: ne ilgāk kā 24 mēnešus'],
        ],
      },
      {
        type: 'list',
        title: 'Ar ko mēs kopīgojam datus',
        intro: 'Mēs nepārdodam jūsu datus un nekopīgojam tos mārketinga nolūkos. Mūsu apstrādātāji ir:',
        items: [
          'Mūsu e-pasta pakalpojuma sniedzējs, kas datus apstrādā ES',
          'Šīs vietnes mitināšanas pakalpojuma sniedzējs',
          'Pirkuma gadījumā un tikai pēc jūsu lūguma: otra puse un iesaistītais advokāts',
        ],
      },
      {
        type: 'callout',
        title: 'Par sludinājumiem',
        body: 'Kā sludinātājs jūs varat atļaut mums sludinājumā rādīt jūsu vārdu un tālruņa numuru, lai interesenti varētu ar jums sazināties tieši. Atļauju varat jebkurā laikā atsaukt; tad mēs dzēšam datus no sludinājuma.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Jaunumu vēstule',
        body: 'Ja abonējat mūsu jaunumu vēstuli, mēs apstrādājam jūsu e-pasta adresi, izvēlēto valodu un pieteikšanās un apstiprināšanas laiku tikai tam, lai sūtītu jums jaunumu vēstuli, pamatojoties uz jūsu piekrišanu. Pieteikšanās notiek divos soļos: mēs neko nesūtām, kamēr neesat noklikšķinājis uz pogas apstiprinājuma e-pastā. Katrā e-pastā varat atteikties ar vienu klikšķi, un mēs uzreiz pārtraucam. Sūtīšanai izmantojam pakalpojumu Resend.',
      },
      {
        type: 'list',
        title: 'Jūsu tiesības',
        items: [
          'Piekļuve datiem, ko par jums apstrādājam',
          'Labošana un dzēšana',
          'Apstrādes ierobežošana vai iebildumi pret to',
          'Datu pārnesamība',
          'Piekrišanas atsaukšana jebkurā laikā',
          'Sūdzības iesniegšana Nīderlandes datu aizsardzības iestādē (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Saziņa par privātumu',
        paragraphs: [`Jautājumus vai pieprasījumus varat sūtīt uz ${COMPANY.email.primary}. Mēs atbildam ne vēlāk kā 30 dienu laikā.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Sīkdatņu politika',
    metaDescription: `Kādas sīkdatnes izmanto ${SITE_HOST} un kā mainīt savu izvēli.`,
    eyebrow: 'Sīkdatnes',
    title: 'Sīkdatņu',
    titleEm: 'politika',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Pašlaik šī vietne izmanto tikai tehniski nepieciešamu datu glabāšanu. Mēs neizmantojam reklāmas vai izsekošanas skriptus un neko nekopīgojam ar sociālajiem tīkliem.',
        ],
      },
      {
        type: 'table',
        title: 'Ko mēs saglabājam',
        rows: [
          [
            'fodel:consent',
            'Jūsu izvēle par sīkdatnēm (pieņemtas vai noraidītas). Tiek glabāta jūsu pārlūkā un nenonāk pie mums. Glabāšanas laiks: 12 mēneši.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistika',
        paragraphs: [
          'Ja kādreiz vāksim apmeklētāju statistiku, to ieslēgsim tikai ar jūsu iepriekšēju, skaidri izteiktu piekrišanu. Atteikums nekādi neierobežo vietnes lietošanu.',
        ],
      },
      {
        type: 'prose',
        title: 'Izvēles maiņa',
        paragraphs: [
          'Izvēli varat jebkurā laikā mainīt, izdzēšot šai vietnei saglabātos pārlūka datus; tad sīkdatņu paziņojums parādās atkal.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Lietošanas noteikumi',
    metaDescription:
      'FODEL sludinājumu un starpniecības pakalpojuma noteikumi: cenas, komisija, atsaukšana un atbildība.',
    eyebrow: 'Noteikumi',
    title: 'Lietošanas',
    titleEm: 'noteikumi',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Ievērībai',
        body: 'Šī lapa ir kopsavilkums. Pilnie, saistošie noteikumi pieejami PDF formātā; atšķirību gadījumā noteicošais ir PDF.',
      },
      {
        type: 'prose',
        title: '1. Pakalpojums',
        paragraphs: [
          'FODEL reklamē Ungārijas īpašumus savās daudzvalodu vietnēs un, pamatojoties uz atsevišķu līgumu, palīdz noslēgt darījumu.',
          'Sludinājumu pakalpojums nav ekskluzīvs: pārdevējs īpašumu var piedāvāt un pārdot arī citos kanālos.',
        ],
      },
      {
        type: 'list',
        title: '2. Sludinājuma ievietošana',
        ordered: true,
        items: [
          'Pārdevējs aizpilda reģistrācijas veidlapu.',
          'FODEL nosūta maksājuma pieprasījumu par izvēlēto paketi.',
          'Pārdevējs maksā ar bankas pārskaitījumu.',
          'Pēc maksājuma saņemšanas pārdevējs iegūst tiesības augšupielādēt fotoattēlus.',
          'FODEL nodrošina tulkojumu un publicē sludinājumu.',
        ],
      },
      {
        type: 'table',
        title: '3. Cenas',
        intro: `Visās cenās iekļauts ${LISTING_VAT_PERCENT}% Nīderlandes PVN. Pilns pārskats ir lapā „Cenas“.`,
        rows: [
          [`Ekonomiskais sludinājums (${cheap.months} mēneši)`, eur(cheap.priceEur, L)],
          [`Standarta sludinājums (${normal.months} mēneši)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Tulkojums', `${eur(extra('translation').priceEur, L)} par valodu`],
          [
            'Izcelšana',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} mēnesī (vismaz ${minMonths} mēneši)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Komisija',
        paragraphs: [
          'Komisija jāmaksā tikai tad, ja izpildās visi šie nosacījumi: rakstisks pirkuma līgums, FODEL atrasts pircējs un samaksāta rokasnauda.',
          `Komisija ir ${COMMISSION.percent}% neto, vismaz ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}% Nīderlandes PVN.`,
          'Ja interesents sazinās tieši ar pārdevēju un mūsu palīdzība darījuma noslēgšanā nav vajadzīga, papildus sludinājuma maksai nekas nav jāmaksā.',
        ],
      },
      {
        type: 'prose',
        title: '5. Sludinājuma atsaukšana',
        paragraphs: [
          'Pārdevējs var atsaukt sludinājumu pirms termiņa beigām. Šādā gadījumā jau samaksātā sludinājuma maksa netiek atmaksāta.',
        ],
      },
      {
        type: 'prose',
        title: '6. Atbildība',
        paragraphs: [
          'Pārdevējs atbild par datu par īpašumu precizitāti. FODEL atspoguļo sniegtos datus un neuzņemas atbildību par to precizitāti.',
          'Tulkojumi šajā vietnē ir informatīvi; strīda gadījumā noteicošā ir ungāru valodas versija.',
        ],
      },
      {
        type: 'prose',
        title: '7. Atteikuma tiesības',
        paragraphs: [
          'Pārdevējam, kas ir patērētājs, ir likumā noteiktās atteikuma tiesības distances līgumiem. Ja pārdevējs skaidri lūdz tūlītēju izpildi, atteikuma tiesības samazinās proporcionāli jau sniegtajam pakalpojumam.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Piekļūstamības paziņojums',
    metaDescription: `${SITE_HOST} piekļūstamības līmenis, standarts, ko ievērojam, un kā sniegt mums atsauksmes.`,
    eyebrow: 'Piekļūstamība',
    title: 'Piekļūstamības',
    titleEm: 'paziņojums',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Mēs vēlamies, lai šo vietni varētu lietot ikviens, arī apmeklētāji, kas izmanto ekrāna lasītāju, tastatūru vai palielinājumu.',
          'Mēs veidojam vietni atbilstoši WCAG 2.2 AA līmenim. Ievērojama daļa mūsu apmeklētāju ir pensionāri, tāpēc prioritāte ir teksta lielums, kontrasts un vadība ar tastatūru.',
        ],
      },
      {
        type: 'list',
        title: 'Kas jau ir ieviests',
        items: [
          'Visam tekstam kontrasta attiecība ir vismaz 4,5:1',
          'Pilnīga vadība ar tastatūru un redzamu fokusa norādi',
          'Saite „pāriet uz saturu“ katras lapas augšā',
          'Jēgpilni alternatīvie teksti visiem attēliem',
          'Veidlapu lauki ar saistītām etiķetēm un teksta kļūdu ziņojumiem',
          'Sistēmas iestatījuma „samazināt kustību“ ievērošana',
          'Vietne ir lasāma un lietojama bez JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Zināmie ierobežojumi',
        paragraphs: ['Mēs nevaram ietekmēt trešo pušu satura, piemēram, karšu pakalpojuma, piekļūstamību.'],
      },
      {
        type: 'prose',
        title: 'Atsauksmes',
        paragraphs: [
          `Ja saskaraties ar šķērsli, paziņojiet mums uz ${COMPANY.email.primary} vai pa tālruni. Ziņojumus risinām pēc iespējas ātrāk.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
