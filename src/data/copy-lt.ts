/**
 * Page copy, Lithuanian (formal "jūs").
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
const L = 'lt' as const;

export const LT = {
  home: {
    meta: {
      title: 'FODEL Real Estates | Įsigykite nekilnojamąjį turtą Vengrijoje tiesiai iš savininko',
      description:
        'Namai, ūkiai ir kaimo valdos Vengrijoje, dažnai tiesiai iš savininko. Konsultacijos jūsų kalba ir dvikalbės pirkimo–pardavimo sutartys.',
    },
    hero: {
      eyebrow: `Nuo 2013 m. · ${foundedInLabel(L)}`,
      title: ['Nekilnojamasis turtas', 'Vengrijoje', 'tiesiai iš savininko'],
      emphasis: 1,
      body: 'Daugelyje mūsų skelbimų nurodytas savininkas. Galite derėtis tiesiogiai su juo arba visą procesą patikėti mums.',
      primary: 'Peržiūrėti objektus',
      secondary: 'Nemokama objekto paieška',
      featuredLabel: 'Rekomenduojami',
    },
    audiences: [
      {
        eyebrow: 'Pirkėjams',
        title: 'Turtas tiesiai\niš savininko',
        body: 'Autentiški vengriški namai, ūkiai, kaimo valdos ir vynuogynai. Susisiekite tiesiogiai su savininku arba leiskite FODEL pasirūpinti visu procesu.',
        cta: 'Peržiūrėti objektus',
        to: 'properties',
      },
      {
        eyebrow: 'Pardavėjams',
        title: 'Jūsų turtas Vengrijoje –\nVakarų Europoje',
        body: `Skelbkite ${REACH_LANGUAGES} kalbomis ${REACH_COUNTRIES} šalyse be išimtinės sutarties. Komisinis tik tada, jei pirkėją surandame mes.`,
        cta: 'Sužinoti daugiau',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Pasirinkimas', title: 'Rekomenduojami objektai' },
    quote: '„Olandai dažnai netiki savo akimis, kai pamato, ką galima nusipirkti Vengrijoje ir už kiek.“',
    quoteSource: `${BRAND.lt.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Kaip tai veikia', title: 'Kaip veikia FODEL' },
    cta: {
      eyebrow: 'Susisiekite su mumis',
      title: 'Mielai',
      titleEm: 'jums perskambinsime',
      body: `{hoursShort} · Perskambinimas jums nieko nekainuoja.`,
    },
    referral: {
      eyebrow: 'Rekomendacijų programa',
      title: 'Rekomenduokite skelbėją,',
      titleEm: 'gaukite 10\u00a0%',
      body: 'Jei kas nors jūsų rekomendacija pateikia skelbimą FODEL, gauna 10\u00a0% nuolaidą savo paketui, o mes jums įskaitome 10\u00a0% kitam jūsų skelbimui. Jau skelbiatės pas mus? Savo rekomendacijos kodą rasite portalo skiltyje „Nustatymai“.',
      steps: [
        'Rekomenduokite pažįstamą per toliau pateiktą formą arba pasidalykite savo nuoroda iš portalo',
        'Mūsų komandos narys su juo susisiekia',
        'Jei jis pateikia skelbimą, sutaupo 10\u00a0%, o mes jums įskaitome 10\u00a0%',
      ],
      formTitle: 'Rekomenduokite pažįstamą',
      fields: {
        referrerName: 'Jūsų vardas',
        referrerEmail: 'Jūsų el. pašto adresas',
        referredName: 'Rekomenduojamo asmens vardas',
        referredEmail: 'Rekomenduojamo asmens el. pašto adresas',
      },
      submit: 'Siųsti rekomendaciją',
      successTitle: 'Dėkojame už rekomendaciją!',
      successBody:
        'Ją gavome. Kolega susisieks su rekomenduotu asmeniu, o jus informuosime el. paštu.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Skelbiama ${REACH_COUNTRIES} šalyse`,
      body: `Skelbiame ${REACH_LANGUAGES} kalbomis Nyderlanduose, Belgijoje, Vokietijoje, Anglijoje ir kitose ES šalyse, be išimtinės sutarties su pardavėju.`,
    },
    {
      num: '02',
      title: 'Tiesioginis kontaktas',
      body: 'Daugelyje skelbimų greta mūsų kontaktų nurodytas savininko vardas ir numeris. Jei susitariate tarpusavyje, niekas nemoka komisinio.',
    },
    {
      num: '03',
      title: 'Visas procesas sutvarkytas už jus',
      body: 'Dvikalbė pirkimo–pardavimo sutartis, atstovavimas pagal įgaliojimą, įregistravimas registre ir komunalinių paslaugų perėmimas.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Įkurta' },
    { value: String(REACH_COUNTRIES), label: 'Šalys' },
    { value: String(REACH_LANGUAGES), label: 'Kalbos' },
    { value: `${COMMISSION.percent}%`, label: 'Komisinis' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Pardavėjams | Jūsų turtas Vengrijoje – Vakarų Europoje',
      description: `Skelbkite savo turtą Vengrijoje ${REACH_LANGUAGES} kalbomis ${REACH_COUNTRIES} šalyse nuo ${eur(69, L)} ir be išimtinės sutarties. Komisinis tik tada, jei pirkėją suranda FODEL: ${COMMISSION.percent}\u00a0% + ${COMMISSION.vatPercent}\u00a0% PVM.`,
    },
    hero: {
      eyebrow: 'Pardavėjams',
      title: 'Jūsų turtas',
      titleEm: 'Vakarų Europoje',
      body: `Pagal FODEL modelį jūsų turtas rodomas ${REACH_LANGUAGES} kalbomis ${REACH_COUNTRIES} šalyse be išimtinės sutarties. Dirbame tik su rimtais pirkėjais.`,
      cta: 'Pateikti skelbimą',
      secondary: 'Peržiūrėti kainas',
    },
    benefits: {
      eyebrow: 'Privalumai',
      title: 'Ką suteikia užsienio pirkėjas',
      points: [
        'Pirkėjai su nuosavomis lėšomis: nereikia laukti paskolos ar subsidijos.',
        'Mokėjimas vienu kartu banko pavedimu, greitai ir saugiai.',
        'Rimti ketinimai: viena apžiūra jiems kainuoja dvi dienas ir 200–300\u00a0€.',
        'Realios kainos: jokio nepagrįsto derėjimosi.',
        'FODEL asmeniškai įvertina kiekvieną pirkėją prieš sutardama bet kokį susitikimą.',
      ],
    },
    personas: {
      eyebrow: 'Pirkėjai',
      title: 'Kas yra mūsų pirkėjai',
      items: [
        {
          title: 'Pensininkai',
          body: 'Vengrijoje ieško mažesnių pragyvenimo išlaidų, mokesčių lengvatų ir prieinamos sveikatos priežiūros.',
        },
        {
          title: 'Šeimos',
          body: 'Ieško erdvės, gamtos ir gyvenimo kaime. Dažnai ūkio, sodybos ar poilsio namo.',
        },
        {
          title: 'Investuotojai',
          body: 'Ieško komercinio turto, vynuogynų ir žemės ūkio paskirties žemės.',
        },
        {
          title: 'Gyvenimo būdo emigrantai',
          body: 'Palieka aukštas pragyvenimo išlaidas ir spūstis, ieškodami autentiško europietiško gyvenimo būdo.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Žingsnis po žingsnio', title: 'FODEL modelis' },
    commission: {
      eyebrow: 'Kainos',
      title: 'Komisinis tik\nsėkmingai pardavus',
      body: `Jei pirkėjas susisiekia su jumis tiesiogiai ir jums nereikia mūsų pagalbos, be skelbimo mokesčio nieko nemokate. Jei pardavimą tarpininkauja FODEL: ${COMMISSION.percent}\u00a0% be mokesčių (min. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}\u00a0% Nyderlandų PVM.`,
      cta: 'Peržiūrėti kainas',
    },
  },

  buyers: {
    meta: {
      title: 'Pirkėjams | Turto pirkimas Vengrijoje',
      description:
        'Kaip saugiai įsigyti turtą Vengrijoje: dvikalbė sutartis, atstovavimas pagal įgaliojimą ir įregistravimas registre. Be to, nemokama paieškos paslauga.',
    },
    hero: {
      eyebrow: 'Pirkėjams',
      title: 'Pirkimas Vengrijoje,',
      titleEm: 'be staigmenų',
      body: 'Daugelyje mūsų skelbimų nurodytas savininkas. Galite derėtis tiesiogiai arba visą procesą patikėti mums.',
      cta: 'Peržiūrėti objektus',
      secondary: 'Nemokama objekto paieška',
    },
    services: {
      eyebrow: 'Kuo pasirūpiname',
      title: 'Visapusiška pagalba',
      points: [
        'Bendravimas tarp jūsų ir pardavėjo, prireikus per vertėjus.',
        'Apžiūros su kolega, kalbančiu jūsų kalba.',
        'Pagalba derantis dėl kainos ir rengiant dvikalbę sutartį.',
        'Atstovavimas pagal įgaliojimą: pasirašyti nereikia vykti į Vengriją.',
        'Įregistravimas registre ir komunalinių paslaugų perėmimas.',
      ],
    },
    reasons: {
      eyebrow: 'Kodėl Vengrija',
      title: 'Ko ieško Vakarų Europos pirkėjai',
    },
  },

  about: {
    meta: {
      title: 'Apie mus | Tiltas tarp dviejų pasaulių',
      description:
        'Nuo 2013 m. suvedame Vengrijos pardavėjus ir Vakarų Europos pirkėjus. Diskretiškai, skaidriai ir be išimtinės sutarties.',
    },
    hero: {
      eyebrow: 'Apie mus',
      title: 'Tiltas tarp',
      titleEm: 'dviejų pasaulių',
      body: 'Nuo 2013 m. padedame Vengrijos pardavėjams rasti tinkamą užsienio pirkėją: diskretiškai, veiksmingai ir be išimtinės sutarties.',
    },
    origin: {
      eyebrow: 'Pradžia · Almere-Buiten, 2013',
      quote:
        '„Gyvendami Almere-Buitene matėme, kaip labai nyderlandai trokšta autentiško europietiško gyvenimo būdo, o Vengrijoje gražiausi objektai nepastebėti laukia savo savininko.“',
    },
    values: {
      eyebrow: 'Kam atstovaujame',
      title: 'Kuo remiamės',
      items: [
        {
          num: '01',
          title: 'Diskretiškumas',
          body: 'Su pardavėjų ir pirkėjų duomenimis elgiamės itin atsargiai. Asmens duomenys rodomi tik gavus sutikimą.',
        },
        {
          num: '02',
          title: 'Skaidrumas',
          body: 'Jokių paslėptų išlaidų. Mūsų kainos ir komisinis skelbiami šioje svetainėje, o apie kiekvieną žingsnį jus informuojame.',
        },
        {
          num: '03',
          title: 'Dvikalbė kompetencija',
          body: 'Abi rinkas pažįstame iš vidaus. Mūsų komanda kalba nyderlandų, vokiečių, anglų, prancūzų ir vengrų kalbomis.',
        },
      ],
    },
    approach: {
      eyebrow: 'Mūsų požiūris',
      title: 'Nesame didelis biuras.',
      titleEm: 'Tai mūsų stiprybė.',
      points: [
        'Kiekvienas klientas turi asmeninį kontaktą: jokio skambučių centro, jokio anoniminio langelio.',
        'Abi kultūras pažįstame iš vidaus ir turtą vertiname tiek nyderlandų, tiek vengrų akimis.',
        'Suvesti turtą ir pirkėją – mūsų atsakomybė, o ne atsitiktinumas.',
        'Dirbame be išimtinių teisių, nes mieliau įtikiname rezultatais.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Tiltas, kurį',
      titleEm: 'pastatėme',
      paragraphs: [
        'FODEL įkūrė Nyderlanduose gyvenantys vengrai. Pradėjome 2013 m. Almere-Buitene, kur pastebėjome, kiek daug nyderlandų ir belgų norėjo įsigyti autentišką vengrišką namą, bet nežinojo, nuo ko pradėti.',
        `Šiandien skelbiamės ${REACH_COUNTRIES} šalyse ${REACH_LANGUAGES} kalbomis ir lydime kiekvieną sandorį nuo pradžios iki pabaigos: dvikalbė pirkimo–pardavimo sutartis, atstovavimas pagal įgaliojimą ir įregistravimas registre. Mūsų biuras yra Hagoje.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontaktai | Mielai jums paskambinsime',
      description: `Skambinkite mums darbo dienomis nuo ${COMPANY.hours.weekdays.from} iki ${COMPANY.hours.weekdays.to} arba užsisakykite perskambinimą. Skambutis jums nieko nekainuoja.`,
    },
    hero: { eyebrow: 'Kontaktas', title: 'Mielai', titleEm: 'jums perskambinsime' },
    formTitle: 'Užsakyti perskambinimą',
    submit: 'Užsakyti skambutį',
    subjects: [
      'Klausimas apie objektą',
      'Turto skelbimas',
      'Gauti kainas',
      'Perskambinimo užklausa',
      'Kita',
    ],
    note: `Perskambinimas jums nieko nekainuoja: už skambutį mokame mes. Perskambiname iki ${COMPANY.hours.callback.to}, taip pat savaitgaliais.`,
  },
} satisfies CopyShape;
