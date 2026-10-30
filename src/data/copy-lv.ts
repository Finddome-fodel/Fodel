/**
 * Page copy, Latvian (formal "jūs").
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
const L = 'lv' as const;

export const LV = {
  home: {
    meta: {
      title: 'FINDDOME Real Estates | Iegādājieties īpašumu Ungārijā tieši no īpašnieka',
      description:
        'Mājas, saimniecības un lauku īpašumi Ungārijā, bieži tieši no īpašnieka. Konsultācijas jūsu valodā un divvalodu pirkuma līgumi.',
    },
    hero: {
      eyebrow: `Kopš 2013. gada · ${foundedInLabel(L)}`,
      title: ['Sludiniet', 'savu īpašumu', 'Eiropā'],
      emphasis: 1,
      body: 'Augšupielādējiet sludinājumu dažos soļos. Mēs to pārbaudām, un pēc maksājuma tiešsaistē tas tiek publicēts mūsu vietnē 21 valodā, bez ekskluzivitātes līguma. Interesenti sazinās ar jums tieši vai caur mums.',
      primary: 'Skatīt īpašumus',
      secondary: 'Bezmaksas īpašuma meklēšana',
      featuredLabel: 'Izceltie',
    },
    audiences: [
      {
        eyebrow: 'Pircējiem',
        title: 'Īpašumi tieši\nno īpašnieka',
        body: 'Autentiskas Ungārijas mājas, saimniecības, lauku īpašumi un vīnogulāji. Sazinieties tieši ar īpašnieku vai uzticiet visu procesu FINDDOME.',
        cta: 'Skatīt īpašumus',
        to: 'properties',
      },
      {
        eyebrow: 'Pārdevējiem',
        title: 'Jūsu Ungārijas īpašums\nRietumeiropā',
        body: `Publicējiet sludinājumu ${REACH_LANGUAGES} valodās ${REACH_COUNTRIES} valstīs bez ekskluzivitātes līguma. Komisijas maksa tikai tad, ja pircēju atrodam mēs.`,
        cta: 'Uzzināt vairāk',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Izvēle', title: 'Izceltie īpašumi' },
    quote: '“Nīderlandieši bieži netic savām acīm, kad redz, ko Ungārijā var nopirkt un par kādu cenu.”',
    quoteSource: `${BRAND.lv.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Kā tas notiek', title: 'Kā darbojas FINDDOME' },
    cta: {
      eyebrow: 'Sazinieties ar mums',
      title: 'Mēs labprāt',
      titleEm: 'jums atzvanīsim',
      body: `{hoursShort} · Atzvanīšana jums neko nemaksā.`,
    },
    referral: {
      eyebrow: 'Ieteikumu programma',
      title: 'Iesakiet sludinātāju,',
      titleEm: 'saņemiet 10%',
      body: 'Ja kāds pēc jūsu ieteikuma publicē sludinājumu FINDDOME, viņš saņem 10% atlaidi savai paketei, bet mēs jums ieskaitām 10% nākamajam sludinājumam. Jau publicējat pie mums? Savu ieteikuma kodu atradīsiet portālā sadaļā Iestatījumi.',
      steps: [
        'Iesakiet paziņu, izmantojot tālāk esošo veidlapu, vai kopīgojiet savu saiti no portāla',
        'Kāds no mūsu komandas ar viņu sazinās',
        'Ja viņš publicē sludinājumu, viņš ietaupa 10%, bet mēs jums ieskaitām 10%',
      ],
      formTitle: 'Iesakiet paziņu',
      fields: {
        referrerName: 'Jūsu vārds',
        referrerEmail: 'Jūsu e-pasta adrese',
        referredName: 'Ieteiktās personas vārds',
        referredEmail: 'Ieteiktās personas e-pasta adrese',
      },
      submit: 'Nosūtīt ieteikumu',
      successTitle: 'Paldies par ieteikumu!',
      successBody:
        'Esam to saņēmuši. Kolēģis sazināsies ar ieteikto personu, un mēs jūs informēsim pa e-pastu.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Publicēts ${REACH_COUNTRIES} valstīs`,
      body: `Publicējam sludinājumus ${REACH_LANGUAGES} valodās Nīderlandē, Beļģijā, Vācijā, Anglijā un citās ES valstīs bez ekskluzivitātes līguma ar pārdevēju.`,
    },
    {
      num: '02',
      title: 'Tiešs kontakts',
      body: 'Daudzos sludinājumos līdzās mūsu kontaktinformācijai ir norādīts īpašnieka vārds un numurs. Ja vienojaties savā starpā, neviens nemaksā komisijas maksu.',
    },
    {
      num: '03',
      title: 'Viss process nokārtots jūsu vietā',
      body: 'Divvalodu pirkuma līgums, pārstāvība ar pilnvaru, ierakstīšana zemesgrāmatā un komunālo pakalpojumu pārņemšana.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Dibināts' },
    { value: String(REACH_COUNTRIES), label: 'Valstis' },
    { value: String(REACH_LANGUAGES), label: 'Valodas' },
    { value: `${COMMISSION.percent}%`, label: 'Komisijas maksa' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Pārdevējiem | Jūsu Ungārijas īpašums Rietumeiropā',
      description: `Publicējiet savu Ungārijas īpašumu ${REACH_LANGUAGES} valodās ${REACH_COUNTRIES} valstīs no ${eur(69, L)} un bez ekskluzivitātes. Komisijas maksa tikai tad, ja pircēju atrod FINDDOME: ${COMMISSION.percent}% + ${COMMISSION.vatPercent}% PVN.`,
    },
    hero: {
      eyebrow: 'Pārdevējiem',
      title: 'Jūsu īpašums',
      titleEm: 'Rietumeiropā',
      body: `Ar FINDDOME modeli jūsu īpašums tiek rādīts ${REACH_LANGUAGES} valodās ${REACH_COUNTRIES} valstīs bez ekskluzivitātes līguma. Mēs strādājam tikai ar nopietniem pircējiem.`,
      cta: 'Iesniegt sludinājumu',
      secondary: 'Skatīt cenas',
    },
    benefits: {
      eyebrow: 'Priekšrocības',
      title: 'Ko sniedz ārvalstu pircējs',
      points: [
        'Pircēji ar saviem līdzekļiem: nav jāgaida hipotekārais kredīts vai subsīdija.',
        'Samaksa vienā reizē ar bankas pārskaitījumu, ātri un droši.',
        'Nopietns nodoms: viena apskate viņiem izmaksā divas dienas un 200–300\u00a0€.',
        'Reālistiskas cenas: nekādas nesaprātīgas kaulēšanās.',
        'FINDDOME personīgi izvērtē katru pircēju, pirms tiek norunāta tikšanās.',
      ],
    },
    personas: {
      eyebrow: 'Pircēji',
      title: 'Kas ir mūsu pircēji',
      items: [
        {
          title: 'Pensionāri',
          body: 'Ungārijā meklē zemākas dzīves izmaksas, nodokļu priekšrocības un pieejamu veselības aprūpi.',
        },
        {
          title: 'Ģimenes',
          body: 'Meklē plašumu, dabu un lauku dzīvi. Bieži lauku saimniecību, viensētu vai brīvdienu māju.',
        },
        {
          title: 'Investori',
          body: 'Meklē komercīpašumus, vīna dārzus un lauksaimniecības zemi.',
        },
        {
          title: 'Dzīvesveida emigranti',
          body: 'Atstāj aiz muguras augstās dzīves izmaksas un drūzmu, meklējot autentisku Eiropas dzīvesveidu.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Soli pa solim', title: 'FINDDOME modelis' },
    commission: {
      eyebrow: 'Cenas',
      title: 'Komisija tikai\npar veiksmīgu pārdošanu',
      body: `Ja pircējs sazinās ar jums tieši un jums nav vajadzīga mūsu palīdzība, jūs nemaksājat neko papildus sludinājuma maksai. Ja pārdošanā starpnieks ir FINDDOME: ${COMMISSION.percent}% neto (min. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}% Nīderlandes PVN.`,
      cta: 'Skatīt cenas',
    },
  },

  buyers: {
    meta: {
      title: 'Pircējiem | Īpašuma iegāde Ungārijā',
      description:
        'Kā droši iegādāties īpašumu Ungārijā: divvalodu līgums, pārstāvība ar pilnvaru un reģistrācija zemesgrāmatā. Turklāt bezmaksas meklēšanas pakalpojums.',
    },
    hero: {
      eyebrow: 'Pircējiem',
      title: 'Pirkums Ungārijā,',
      titleEm: 'bez pārsteigumiem',
      body: 'Daudzos mūsu sludinājumos norādīts īpašnieks. Varat vienoties tieši vai uzticēt visu procesu mums.',
      cta: 'Skatīt īpašumus',
      secondary: 'Bezmaksas īpašuma meklēšana',
    },
    services: {
      eyebrow: 'Par ko parūpējamies',
      title: 'Pilns atbalsts',
      points: [
        'Saziņa starp jums un pārdevēju, arī ar tulku palīdzību.',
        'Apskates kopā ar kolēģi, kurš runā jūsu valodā.',
        'Atbalsts cenu sarunās un divvalodu līguma sagatavošanā.',
        'Pārstāvība ar pilnvaru: lai parakstītu, jums nav jābrauc uz Ungāriju.',
        'Reģistrācija zemesgrāmatā un komunālo pakalpojumu pārņemšana.',
      ],
    },
    reasons: {
      eyebrow: 'Kāpēc Ungārija',
      title: 'Ko meklē Rietumeiropas pircēji',
    },
  },

  about: {
    meta: {
      title: 'Par mums | Tilts starp divām pasaulēm',
      description:
        'Kopš 2013. gada savedam kopā Ungārijas pārdevējus un Rietumeiropas pircējus. Diskrēti, pārredzami un bez ekskluzivitātes līguma.',
    },
    hero: {
      eyebrow: 'Par mums',
      title: 'Tilts starp',
      titleEm: 'divām pasaulēm',
      body: 'Kopš 2013. gada palīdzam Ungārijas pārdevējiem atrast īsto ārvalstu pircēju: diskrēti, efektīvi un bez ekskluzivitātes līguma.',
    },
    origin: {
      eyebrow: 'Sākums · Almere-Buiten, 2013',
      quote:
        '„Dzīvojot Almere-Buitenā, redzējām, cik ļoti nīderlandieši ilgojas pēc autentiska Eiropas dzīvesveida, kamēr Ungārijā skaistākie īpašumi nepamanīti gaida savu saimnieku.“',
    },
    values: {
      eyebrow: 'Mūsu vērtības',
      title: 'Uz ko balstāmies',
      items: [
        {
          num: '01',
          title: 'Diskrētums',
          body: 'Ar pārdevēju un pircēju datiem apejamies ar vislielāko rūpību. Personas dati tiek rādīti tikai ar piekrišanu.',
        },
        {
          num: '02',
          title: 'Pārredzamība',
          body: 'Nekādu slēptu izmaksu. Mūsu cenas un komisija ir publicētas šajā vietnē, un mēs jūs informējam par katru soli.',
        },
        {
          num: '03',
          title: 'Divvalodu kompetence',
          body: 'Mēs pazīstam abus tirgus no iekšpuses. Mūsu komanda runā nīderlandiešu, vācu, angļu, franču un ungāru valodā.',
        },
      ],
    },
    approach: {
      eyebrow: 'Mūsu pieeja',
      title: 'Mēs neesam liels birojs.',
      titleEm: 'Tā ir mūsu stiprā puse.',
      points: [
        'Katram klientam ir personīgs kontakts: nekāda zvanu centra, nekāda anonīma lodziņa.',
        'Mēs pazīstam abas kultūras no iekšpuses un vērtējam īpašumus gan ar nīderlandiešu, gan ungāru acīm.',
        'Savest kopā īpašumu un pircēju ir mūsu atbildība, nevis nejaušība.',
        'Strādājam bez ekskluzivitātes, jo labāk pārliecinām ar rezultātiem.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Tilts, ko',
      titleEm: 'esam uzbūvējuši',
      paragraphs: [
        'FINDDOME dibināja Nīderlandē dzīvojoši ungāri. Sākām 2013. gadā Almere-Buitenā, kur pamanījām, cik daudz nīderlandiešu un beļģu vēlas iegādāties autentisku ungāru māju, bet nezina, ar ko sākt.',
        `Šodien sludinām ${REACH_COUNTRIES} valstīs un ${REACH_LANGUAGES} valodās un pavadām katru darījumu no sākuma līdz beigām: divvalodu pirkuma līgums, pārstāvība ar pilnvaru un reģistrācija zemesgrāmatā. Mūsu birojs atrodas Hāgā.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakti | Ar prieku jums atzvanīsim',
      description: `Zvaniet mums darba dienās no ${COMPANY.hours.weekdays.from} līdz ${COMPANY.hours.weekdays.to} vai piesakiet atzvanu. Zvans jums neko nemaksā.`,
    },
    hero: { eyebrow: 'Saziņa', title: 'Mēs labprāt', titleEm: 'jums atzvanīsim' },
    formTitle: 'Pieteikt atzvanu',
    submit: 'Pieprasīt atzvanu',
    subjects: [
      'Jautājums par īpašumu',
      'Īpašuma sludināšana',
      'Pieprasīt cenas',
      'Atzvana pieprasījums',
      'Cits',
    ],
    note: `Atzvans jums neko nemaksā: par zvanu maksājam mēs. Atzvanām līdz ${COMPANY.hours.callback.to}, arī brīvdienās.`,
  },
} satisfies CopyShape;
