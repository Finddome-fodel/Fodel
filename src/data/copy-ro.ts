/**
 * Conținutul paginilor, română (adresare cu „dumneavoastră”).
 *
 * Pentru cumpărători și vânzători vorbitori de română, scris pe baza acelorași
 * fapte ca textele maghiare și neerlandeze: cifrele provin din
 * src/config/company.ts, niciodată din acest fișier. Compilatorul îl compară
 * cu textul maghiar: o cheie lipsă oprește build-ul.
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'ro' as const;
const pct = (n: number) => `${n}%`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
};

export const RO = {
  home: {
    meta: {
      title: 'FINDDOME Imobiliare | Promovați-vă proprietatea în Europa',
      description:
        'Încărcați anunțul în câțiva pași. După plata online apare în 21 de limbi, fără contract de exclusivitate.',
    },
    hero: {
      eyebrow: `Din 2013 · ${foundedInLabel(L)}`,
      title: ['Promovați', 'proprietatea dvs.', 'în Europa'],
      emphasis: 1,
      body: 'Încărcați anunțul în câțiva pași. Îl verificăm, iar după plata online apare pe site-ul nostru în 21 de limbi, fără contract de exclusivitate. Interesații vă contactează direct sau prin noi.',
      primary: 'Vedeți proprietățile',
      secondary: 'Căutare gratuită',
      featuredLabel: 'Recomandat',
    },
    audiences: [
      {
        eyebrow: 'Pentru cumpărători',
        title: 'Proprietăți direct\nde la proprietar',
        body: 'Case, ferme, conace și podgorii autentic maghiare. Contactați direct proprietarul sau lăsați FINDDOME să se ocupe de întregul proces.',
        cta: 'Vedeți proprietățile',
        to: 'properties',
      },
      {
        eyebrow: 'Pentru vânzători',
        title: 'Proprietatea dumneavoastră din Ungaria\nîn Europa de Vest',
        body: `Publicați anunțul în ${REACH_LANGUAGES} limbi și ${REACH_COUNTRIES} țări, fără contract de exclusivitate. Comisionul se datorează doar dacă noi aducem cumpărătorul.`,
        cta: 'Aflați mai multe',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Selecție', title: 'Proprietăți recomandate' },
    quote:
      '„Neerlandezilor adesea nu le vine să creadă ce se poate cumpăra în Ungaria și la ce preț.”',
    quoteSource: `${BRAND.ro.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Cum funcționează', title: 'Cum funcționează FINDDOME' },
    cta: {
      eyebrow: 'Contact',
      title: 'Vă sunăm',
      titleEm: 'cu plăcere',
      body: `{hoursShort} · Apelul înapoi este gratuit.`,
    },
    referral: {
      eyebrow: 'Program de recomandare',
      title: 'Recomandați un nou client',
      titleEm: `și primiți ${pct(10)}`,
      body: `Dacă cineva publică un anunț la FINDDOME la recomandarea dumneavoastră, primește o reducere de ${pct(10)} la pachetul său, iar noi vă credităm ${pct(10)} pentru următorul anunț. Publicați deja la noi? Codul de recomandare îl găsiți în portal, la „Instellingen” (Setări).`,
      steps: [
        'Recomandați o cunoștință prin formularul de mai jos sau distribuiți linkul personal din portal',
        'Un membru al echipei noastre o contactează',
        `Dacă publică un anunț, economisește ${pct(10)}, iar noi vă credităm ${pct(10)}`,
      ],
      formTitle: 'Recomandați o cunoștință',
      fields: {
        referrerName: 'Numele dumneavoastră',
        referrerEmail: 'Adresa dumneavoastră de e-mail',
        referredName: 'Numele persoanei recomandate',
        referredEmail: 'Adresa de e-mail a persoanei recomandate',
      },
      submit: 'Trimiteți recomandarea',
      successTitle: 'Vă mulțumim pentru recomandare!',
      successBody:
        'Am primit-o. Un coleg va contacta persoana recomandată, iar dvs. veți fi informat prin e-mail.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Anunțuri în ${REACH_COUNTRIES} țări`,
      body: `Publicăm anunțurile în ${REACH_LANGUAGES} limbi în Țările de Jos, Belgia, Germania, Anglia și alte țări din UE, fără contract de exclusivitate cu vânzătorul.`,
    },
    {
      num: '02',
      title: 'Contact direct',
      body: 'Multe anunțuri indică, alături de datele noastre de contact, numele și numărul de telefon ale proprietarului. Dacă vă înțelegeți între dumneavoastră, nimeni nu plătește comision.',
    },
    {
      num: '03',
      title: 'Toate formalitățile',
      body: 'Contract de vânzare-cumpărare bilingv, reprezentare prin procură, înscriere în cartea funciară și transferul contractelor de apă, gaz și electricitate.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Înființare' },
    { value: String(REACH_COUNTRIES), label: 'Țări' },
    { value: String(REACH_LANGUAGES), label: 'Limbi' },
    { value: pct(COMMISSION.percent), label: 'Comision' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Vânzători | Proprietatea dumneavoastră din Ungaria în Europa de Vest',
      description: `Publicați proprietatea din Ungaria în ${REACH_LANGUAGES} limbi și ${REACH_COUNTRIES} țări, de la ${eur(69, L)} și fără exclusivitate. Comision doar dacă FINDDOME aduce cumpărătorul: ${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} TVA neerlandez.`,
    },
    hero: {
      eyebrow: 'Pentru vânzători',
      title: 'Proprietatea dumneavoastră',
      titleEm: 'în Europa de Vest',
      body: `Prin modelul FINDDOME, proprietatea dumneavoastră este publicată în ${REACH_LANGUAGES} limbi și ${REACH_COUNTRIES} țări, fără contract de exclusivitate. Lucrăm numai cu cumpărători serioși.`,
      cta: 'Publicați un anunț',
      secondary: 'Vedeți tarifele',
    },
    benefits: {
      eyebrow: 'Avantajele',
      title: 'Ce aduce un cumpărător străin',
      points: [
        'Cumpărători care plătesc din fonduri proprii: fără așteptarea unui credit sau a unui ajutor de stat.',
        'Plată integrală prin transfer bancar, rapid și sigur.',
        `O intenție reală de cumpărare: o vizionare îi costă două zile și între ${eur(200, L)} și ${eur(300, L)}.`,
        'Prețuri realiste: fără negocieri excesive.',
        'FINDDOME evaluează personal fiecare cumpărător înainte de orice întâlnire.',
      ],
    },
    personas: {
      eyebrow: 'Cumpărătorii',
      title: 'Cine cumpără prin FINDDOME',
      items: [
        {
          title: 'Pensionari',
          body: 'Caută cheltuieli mai mici, avantaje fiscale și îngrijire medicală accesibilă în Ungaria.',
        },
        {
          title: 'Familii',
          body: 'Caută spațiu, natură și viața la țară. Adesea o fermă, o gospodărie sau o casă de vacanță.',
        },
        {
          title: 'Investitori',
          body: 'Caută spații comerciale, podgorii și terenuri agricole.',
        },
        {
          title: 'Expați în căutarea unui alt stil de viață',
          body: 'Lasă în urmă costurile mari ale locuinței și agitația și caută un stil de viață european autentic.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Pas cu pas', title: 'Modelul FINDDOME' },
    commission: {
      eyebrow: 'Tarife',
      title: 'Comision doar\nla vânzarea încheiată',
      body: `Dacă cumpărătorul vă contactează direct și nu aveți nevoie de ajutorul nostru, nu plătiți nimic în afară de taxa pentru anunț. Dacă FINDDOME intermediază vânzarea: ${pct(COMMISSION.percent)} net (min. ${eur(COMMISSION.minimumEur, L)}) + ${pct(COMMISSION.vatPercent)} TVA neerlandez.`,
      cta: 'Vedeți tarifele',
    },
  },

  buyers: {
    meta: {
      title: 'Cumpărători | Cumpărați o proprietate în Ungaria',
      description:
        'Cumpărați în siguranță o proprietate în Ungaria: contract bilingv, reprezentare prin procură, înscriere în cartea funciară. Plus un serviciu de căutare gratuit.',
    },
    hero: {
      eyebrow: 'Pentru cumpărători',
      title: 'Cumpărați în Ungaria',
      titleEm: 'fără surprize neplăcute',
      body: 'La multe dintre proprietățile noastre, proprietarul este indicat. Puteți negocia direct sau ne puteți încredința întregul proces.',
      cta: 'Vedeți proprietățile',
      secondary: 'Căutare gratuită',
    },
    services: {
      eyebrow: 'De ce ne ocupăm',
      title: 'Asistență completă',
      points: [
        'Comunicarea dintre dumneavoastră și vânzător, inclusiv interpreți.',
        'Vizionările, însoțite de un membru al echipei noastre.',
        'Ajutor la negocierea prețului și la redactarea contractului bilingv.',
        'Reprezentare prin procură: nu trebuie să veniți în Ungaria pentru semnare.',
        'Înscrierea în cartea funciară și transferul contractelor de apă, gaz și electricitate.',
      ],
    },
    reasons: {
      eyebrow: 'De ce Ungaria',
      title: 'Ce caută cumpărătorii din Europa de Vest',
    },
  },

  about: {
    meta: {
      title: 'Despre noi | O punte între două lumi',
      description:
        'Din 2013 punem în legătură vânzători maghiari cu cumpărători din Europa de Vest. Cu discreție, transparență și fără contract de exclusivitate.',
    },
    hero: {
      eyebrow: 'Despre noi',
      title: 'O punte între',
      titleEm: 'două lumi',
      body: 'Din 2013 îi ajutăm pe vânzătorii maghiari să găsească cumpărătorul străin potrivit: cu discreție, eficiență și fără contract de exclusivitate.',
    },
    origin: {
      eyebrow: 'Începuturile · Almere-Buiten, 2013',
      quote:
        '„Locuind în Almere-Buiten, am văzut cât de mult își doresc neerlandezii un stil de viață european autentic, în timp ce în Ungaria cele mai frumoase proprietăți își așteaptă proprietarul fără ca cineva să le observe.”',
    },
    values: {
      eyebrow: 'Principiile noastre',
      title: 'Pe ce ne bazăm',
      items: [
        {
          num: '01',
          title: 'Discreție',
          body: 'Tratăm datele vânzătorilor și ale cumpărătorilor cu cea mai mare grijă. Datele personale sunt publicate doar cu acordul lor.',
        },
        {
          num: '02',
          title: 'Transparență',
          body: 'Fără costuri ascunse. Tarifele și comisionul nostru sunt publicate pe acest site și vă ținem la curent la fiecare pas.',
        },
        {
          num: '03',
          title: 'Bilingvism',
          body: 'Cunoaștem ambele piețe din interior. Echipa noastră vorbește neerlandeză, germană, engleză, franceză și maghiară.',
        },
      ],
    },
    approach: {
      eyebrow: 'Abordarea noastră',
      title: 'Nu suntem o agenție mare.',
      titleEm: 'Aceasta este forța noastră.',
      points: [
        'Fiecare client are un interlocutor personal: fără call center, fără ghișeu anonim.',
        'Cunoaștem ambele culturi din interior și evaluăm o proprietate atât cu ochi neerlandez, cât și maghiar.',
        'Potrivirea dintre o proprietate și un cumpărător este responsabilitatea noastră, nu o chestiune de noroc.',
        'Lucrăm fără exclusivitate, pentru că preferăm să convingem prin rezultate.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Puntea pe care',
      titleEm: 'am construit-o',
      paragraphs: [
        'FINDDOME a fost fondată de maghiari stabiliți în Țările de Jos. Am început în 2013 la Almere-Buiten, unde am observat că mulți neerlandezi și belgieni voiau să cumpere o casă maghiară autentică, dar nu știau de unde să înceapă.',
        `Astăzi publicăm anunțuri în ${REACH_COUNTRIES} țări și ${REACH_LANGUAGES} limbi și însoțim fiecare tranzacție de la început până la sfârșit: contract de vânzare-cumpărare bilingv, reprezentare prin procură și înscriere în cartea funciară. Biroul nostru se află la Haga.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Contact | Vă sunăm cu plăcere',
      description: `Sunați-ne în zilele lucrătoare între ${hour(COMPANY.hours.weekdays.from)} și ${hour(COMPANY.hours.weekdays.to)} sau cereți să vă sunăm noi. Apelul nu vă costă nimic.`,
    },
    hero: { eyebrow: 'Contact', title: 'Vă sunăm', titleEm: 'cu plăcere' },
    formTitle: 'Solicitați un apel',
    submit: 'Solicită un apel',
    subjects: [
      'Întrebare despre o proprietate',
      'Publicarea unui anunț',
      'Solicitare de tarife',
      'Solicitare de apel',
      'Altceva',
    ],
    note: `Apelul nu vă costă nimic: costul convorbirii îl suportăm noi. Revenim cu apeluri până la ${hour(COMPANY.hours.callback.to)}, inclusiv în weekend.`,
  },
} satisfies CopyShape;
