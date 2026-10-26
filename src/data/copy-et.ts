/**
 * Page copy, Estonian (formal "teie").
 *
 * Written for buyers and sellers in the UK, Ireland and the rest of the
 * English-speaking market, from the same facts as the Hungarian and Dutch
 * copy: the figures come from src/config/company.ts, never from this file.
 * Type-checked against the Hungarian copy, so a missing key fails the build.
 */

import { COMPANY, COMMISSION, formatHours, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'et' as const;

export const ET = {
  home: {
    meta: {
      title: 'FODEL Real Estates | Ostke kinnisvara Ungaris otse omanikult',
      description:
        'Majad, talud ja maavaldused Ungaris, sageli otse omanikult. Nõustamine teie emakeeles ja kakskeelsed ostu-müügilepingud.',
    },
    hero: {
      eyebrow: `Alates 2013 · ${foundedInLabel(L)}`,
      title: ['Kinnisvara', 'Ungaris', 'otse omanikult'],
      emphasis: 1,
      body: 'Paljudes meie kuulutustes on märgitud omanik. Võite pidada läbirääkimisi otse temaga või jätta kogu protsessi meie hooleks.',
      primary: 'Sirvi kinnisvara',
      secondary: 'Tasuta kinnisvaraotsing',
      featuredLabel: 'Esiletõstetud',
    },
    audiences: [
      {
        eyebrow: 'Ostjatele',
        title: 'Kinnisvara otse\nomanikult',
        body: 'Ehtsad Ungari majad, talud, maavaldused ja viinamäed. Võtke omanikuga otse ühendust või laske FODELil kogu protsess korraldada.',
        cta: 'Sirvi kinnisvara',
        to: 'properties',
      },
      {
        eyebrow: 'Müüjatele',
        title: 'Teie Ungari kinnisvara\nLääne-Euroopas',
        body: `Kuulutage ${REACH_LANGUAGES} keeles ${REACH_COUNTRIES} riigis ilma ainuõiguslepinguta. Vahendustasu ainult siis, kui ostja leiame meie.`,
        cta: 'Loe lähemalt',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Valik', title: 'Esiletõstetud kinnisvara' },
    quote: '„Hollandlased ei usu sageli oma silmi, kui näevad, mida Ungaris osta saab ja mis hinnaga.“',
    quoteSource: `${BRAND.et.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Kuidas see käib', title: 'Kuidas FODEL töötab' },
    cta: {
      eyebrow: 'Võtke ühendust',
      title: 'Helistame teile',
      titleEm: 'meelsasti tagasi',
      body: `${formatHours(L)} · Tagasihelistamine ei maksa teile midagi.`,
    },
    referral: {
      eyebrow: 'Soovitusprogramm',
      title: 'Soovitage kuulutajat,',
      titleEm: 'saage 10%',
      body: 'Kui keegi teie soovitusel FODELis kuulutuse avaldab, saab ta oma paketilt 10% allahindlust ja meie arvestame teile 10% teie järgmise kuulutuse eest. Kuulutate juba meie juures? Oma soovituskoodi leiate portaalis jaotisest Seaded.',
      steps: [
        'Soovitage tuttavat allpool oleva vormiga või jagage portaalist oma linki',
        'Meie meeskonnaliige võtab temaga ühendust',
        'Kui ta kuulutuse avaldab, säästab ta 10% ja meie arvestame teile 10%',
      ],
      formTitle: 'Soovitage tuttavat',
      fields: {
        referrerName: 'Teie nimi',
        referrerEmail: 'Teie e-posti aadress',
        referredName: 'Soovitatava isiku nimi',
        referredEmail: 'Soovitatava isiku e-posti aadress',
      },
      submit: 'Saada soovitus',
    },
  },

  steps: [
    {
      num: '01',
      title: `Kuulutus ${REACH_COUNTRIES} riigis`,
      body: `Kuulutame ${REACH_LANGUAGES} keeles Hollandis, Belgias, Saksamaal, Inglismaal ja teistes ELi riikides ilma müüjaga sõlmitud ainuõiguslepinguta.`,
    },
    {
      num: '02',
      title: 'Otsekontakt',
      body: 'Paljudes kuulutustes on meie andmete kõrval ka omaniku nimi ja number. Kui lepite omavahel kokku, ei maksa keegi vahendustasu.',
    },
    {
      num: '03',
      title: 'Kogu protsess korraldatud',
      body: 'Kakskeelne ostu-müügileping, esindamine volikirja alusel, kinnistusraamatusse kandmine ja kommunaalteenuste üleandmine.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Asutatud' },
    { value: String(REACH_COUNTRIES), label: 'Riigid' },
    { value: String(REACH_LANGUAGES), label: 'Keeled' },
    { value: `${COMMISSION.percent}%`, label: 'Vahendustasu' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Müüjatele | Teie Ungari kinnisvara Lääne-Euroopas',
      description: `Kuulutage oma Ungari kinnisvara ${REACH_LANGUAGES} keeles ${REACH_COUNTRIES} riigis alates ${eur(69, L)} ja ilma ainuõiguseta. Vahendustasu ainult siis, kui ostja leiab FODEL: ${COMMISSION.percent}% + ${COMMISSION.vatPercent}% käibemaksu.`,
    },
    hero: {
      eyebrow: 'Müüjatele',
      title: 'Teie kinnisvara',
      titleEm: 'Lääne-Euroopas',
      body: `FODELi mudeli puhul ilmub teie kinnisvara ${REACH_LANGUAGES} keeles ${REACH_COUNTRIES} riigis ilma ainuõiguslepinguta. Teeme koostööd ainult tõsiste ostjatega.`,
      cta: 'Lisa kuulutus',
      secondary: 'Vaata hindu',
    },
    benefits: {
      eyebrow: 'Eelised',
      title: 'Mida välismaine ostja kaasa toob',
      points: [
        'Omavahenditega ostjad: ei mingit ootamist laenu või toetuse järele.',
        'Makse korraga pangaülekandega, kiiresti ja turvaliselt.',
        'Tõsine kavatsus: üksainus vaatamine maksab neile kaks päeva ja 200–300\u00a0€.',
        'Realistlik hinnakujundus: ei mingit põhjendamatut tingimist.',
        'FODEL hindab iga ostjat isiklikult enne, kui mõni kohtumine kokku lepitakse.',
      ],
    },
    personas: {
      eyebrow: 'Ostjad',
      title: 'Kes on meie ostjad',
      items: [
        {
          title: 'Pensionärid',
          body: 'Otsivad Ungarist madalamaid elamiskulusid, maksusoodustusi ja taskukohast tervishoidu.',
        },
        {
          title: 'Pered',
          body: 'Otsivad ruumi, loodust ja maaelu. Sageli talu, taluhoonet või puhkemaja.',
        },
        {
          title: 'Investorid',
          body: 'Otsivad ärikinnisvara, viinamarjaistandusi ja põllumajandusmaad.',
        },
        {
          title: 'Elustiilist lähtuvad väljarändajad',
          body: 'Jätavad selja taha kõrged elamiskulud ja rahvamassid ning otsivad ehedat Euroopa eluviisi.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Samm-sammult', title: 'FODELi mudel' },
    commission: {
      eyebrow: 'Hinnad',
      title: 'Vahendustasu ainult\nedukalt müügilt',
      body: `Kui ostja võtab teiega otse ühendust ja te ei vaja meie abi, ei maksa te peale kuulutuse tasu midagi. Kui müüki vahendab FODEL: ${COMMISSION.percent}% neto (min ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}% Hollandi käibemaks.`,
      cta: 'Vaata hindu',
    },
  },

  buyers: {
    meta: {
      title: 'Ostjatele | Kinnisvara ostmine Ungaris',
      description:
        'Kuidas osta Ungaris kinnisvara turvaliselt: kakskeelne leping, esindamine volikirja alusel ja kinnistusraamatusse kandmine. Lisaks tasuta otsinguteenus.',
    },
    hero: {
      eyebrow: 'Ostjatele',
      title: 'Ostke Ungaris,',
      titleEm: 'ilma üllatusteta',
      body: 'Paljudes meie kuulutustes on märgitud omanik. Võite pidada läbirääkimisi otse või jätta kogu protsessi meie hooleks.',
      cta: 'Sirvi kinnisvara',
      secondary: 'Tasuta kinnisvaraotsing',
    },
    services: {
      eyebrow: 'Mida korraldame',
      title: 'Täielik tugi',
      points: [
        'Suhtlus teie ja müüja vahel, vajaduse korral tõlgi abil.',
        'Vaatamised koos kolleegiga, kes räägib teie keelt.',
        'Tugi hinnaläbirääkimistel ja kakskeelse lepingu koostamisel.',
        'Esindamine volikirja alusel: allkirjastamiseks ei pea te Ungarisse sõitma.',
        'Kinnistusraamatusse kandmine ja kommunaalteenuste üleandmine.',
      ],
    },
    reasons: {
      eyebrow: 'Miks Ungari',
      title: 'Mida otsivad Lääne-Euroopa ostjad',
    },
  },

  about: {
    meta: {
      title: 'Meist | Sild kahe maailma vahel',
      description:
        'Alates 2013. aastast viime kokku Ungari müüjaid ja Lääne-Euroopa ostjaid. Diskreetselt, läbipaistvalt ja ilma ainuõiguslepinguta.',
    },
    hero: {
      eyebrow: 'Meist',
      title: 'Sild kahe',
      titleEm: 'maailma vahel',
      body: 'Alates 2013. aastast aitame Ungari müüjatel leida õige välismaise ostja: diskreetselt, tõhusalt ja ilma ainuõiguslepinguta.',
    },
    origin: {
      eyebrow: 'Algus · Almere-Buiten, 2013',
      quote:
        '„Almere-Buitenis elades nägime, kui väga hollandlased igatsevad ehedat Euroopa eluviisi, samal ajal kui Ungaris ootavad kauneimad kinnistud märkamatult omanikku.“',
    },
    values: {
      eyebrow: 'Mille seisame',
      title: 'Millele toetume',
      items: [
        {
          num: '01',
          title: 'Diskreetsus',
          body: 'Käsitleme müüjate ja ostjate andmeid suurima hoolega. Isikuandmed kuvatakse ainult nõusolekul.',
        },
        {
          num: '02',
          title: 'Läbipaistvus',
          body: 'Varjatud kulusid ei ole. Meie hinnad ja vahendustasu on avaldatud sellel saidil ning hoiame teid igas etapis kursis.',
        },
        {
          num: '03',
          title: 'Kakskeelne asjatundlikkus',
          body: 'Tunneme mõlemat turgu seestpoolt. Meie meeskond räägib hollandi, saksa, inglise, prantsuse ja ungari keelt.',
        },
      ],
    },
    approach: {
      eyebrow: 'Meie lähenemine',
      title: 'Me ei ole suur büroo.',
      titleEm: 'See on meie tugevus.',
      points: [
        'Iga klient saab isikliku kontakti: ei kõnekeskust ega anonüümset lauda.',
        'Tunneme mõlemat kultuuri seestpoolt ning hindame kinnisvara nii Hollandi kui ka Ungari pilguga.',
        'Kinnisvara ja ostja kokkuviimine on meie vastutus, mitte juhuse asi.',
        'Töötame ilma ainuõiguseta, sest eelistame veenda tulemustega.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Sild, mille',
      titleEm: 'oleme ehitanud',
      paragraphs: [
        'FODELi asutasid Hollandis elavad ungarlased. Alustasime 2013. aastal Almere-Buitenis, kus märkasime, kui paljud hollandlased ja belglased tahtsid osta ehedat Ungari kodu, kuid ei teadnud, kust alustada.',
        `Täna kuulutame ${REACH_COUNTRIES} riigis ja ${REACH_LANGUAGES} keeles ning juhendame iga tehingut algusest lõpuni: kakskeelne müügileping, esindamine volikirja alusel ja kinnistusraamatusse kandmine. Meie kontor asub Haagis.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Helistame teile meelsasti tagasi',
      description: `Helistage meile tööpäeviti kell ${COMPANY.hours.weekdays.from}–${COMPANY.hours.weekdays.to} või paluge tagasihelistamist. Kõne ei maksa teile midagi.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Helistame teile', titleEm: 'meelsasti tagasi' },
    formTitle: 'Palu tagasihelistamist',
    subjects: [
      'Küsimus objekti kohta',
      'Kinnisvara kuulutamine',
      'Küsi hindu',
      'Tagasihelistamise taotlus',
      'Muu',
    ],
    note: `Tagasihelistamine ei maksa teile midagi: kõne eest maksame meie. Helistame tagasi kuni kella ${COMPANY.hours.callback.to}, ka nädalavahetustel.`,
  },
} satisfies CopyShape;
