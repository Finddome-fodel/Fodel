/**
 * Obsah stránok, slovenčina (vykanie).
 *
 * Pre slovensky hovoriacich kupujúcich a predávajúcich, napísané na základe
 * tých istých faktov ako maďarské a holandské texty: čísla pochádzajú zo
 * src/config/company.ts, nikdy nie z tohto súboru. Kompilátor ho porovnáva
 * s maďarským textom: chýbajúci kľúč zastaví build.
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'sk' as const;
const pct = (n: number) => `${n}\u00a0%`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
};

export const SK = {
  home: {
    meta: {
      title: 'FODEL Nehnuteľnosti | Kúpte si nehnuteľnosť v Maďarsku priamo od majiteľa',
      description:
        'Domy, farmy a kaštiele v Maďarsku, často priamo od majiteľa. Osobný prístup a dvojjazyčné kúpne zmluvy.',
    },
    hero: {
      eyebrow: `Od roku 2013 · ${foundedInLabel(L)}`,
      title: ['Nehnuteľnosti', 'v Maďarsku', 'priamo od majiteľa'],
      emphasis: 1,
      body: 'Pri veľkej časti našich nehnuteľností uvádzame majiteľa. Môžete sa s ním dohodnúť priamo, alebo celý proces zveriť nám.',
      primary: 'Pozrieť nehnuteľnosti',
      secondary: 'Bezplatné vyhľadávanie',
      featuredLabel: 'Odporúčame',
    },
    audiences: [
      {
        eyebrow: 'Pre kupujúcich',
        title: 'Nehnuteľnosti priamo\nod majiteľa',
        body: 'Autentické maďarské domy, farmy, kaštiele a vinice. Kontaktujte majiteľa priamo, alebo nechajte celý proces na FODEL.',
        cta: 'Pozrieť nehnuteľnosti',
        to: 'properties',
      },
      {
        eyebrow: 'Pre predávajúcich',
        title: 'Vaša maďarská nehnuteľnosť\nv západnej Európe',
        body: `Inzerujte v ${REACH_LANGUAGES} jazykoch a ${REACH_COUNTRIES} krajinách, bez zmluvy o výhradnom zastúpení. Províziu platíte len vtedy, ak kupujúceho privedieme my.`,
        cta: 'Zistiť viac',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Výber', title: 'Odporúčané nehnuteľnosti' },
    quote:
      '„Holanďania často neveria vlastným očiam, keď vidia, čo sa dá v Maďarsku kúpiť a za akú cenu.“',
    quoteSource: `${BRAND.sk.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Ako to funguje', title: 'Ako funguje FODEL' },
    cta: {
      eyebrow: 'Kontakt',
      title: 'Radi vám',
      titleEm: 'zavoláme späť',
      body: `{hoursShort} · Spätné zavolanie je bezplatné.`,
    },
    referral: {
      eyebrow: 'Odporúčací program',
      title: 'Odporučte inzerenta',
      titleEm: `a získajte ${pct(10)}`,
      body: `Ak niekto na vaše odporúčanie podá inzerát cez FODEL, získa zľavu ${pct(10)} na svoj balík a vám pripíšeme ${pct(10)} na váš ďalší inzerát. Už u nás inzerujete? Svoj odporúčací kód nájdete v portáli v časti „Instellingen“ (Nastavenia).`,
      steps: [
        'Odporučte známeho pomocou formulára nižšie alebo zdieľajte svoj osobný odkaz z portálu',
        'Náš kolega ho kontaktuje',
        `Ak podá inzerát, ušetrí ${pct(10)} a vám pripíšeme ${pct(10)}`,
      ],
      formTitle: 'Odporučiť známeho',
      fields: {
        referrerName: 'Vaše meno',
        referrerEmail: 'Váš e-mail',
        referredName: 'Meno odporúčanej osoby',
        referredEmail: 'E-mail odporúčanej osoby',
      },
      submit: 'Odoslať odporúčanie',
      successTitle: 'Ďakujeme za odporúčanie!',
      successBody:
        'Dostali sme ho. Kolega kontaktuje odporúčanú osobu a vás budeme informovať e-mailom.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Inzeráty v ${REACH_COUNTRIES} krajinách`,
      body: `Inzeráty zverejňujeme v ${REACH_LANGUAGES} jazykoch v Holandsku, Belgicku, Nemecku, Anglicku a ďalších krajinách EÚ, bez zmluvy o výhradnom zastúpení s predávajúcim.`,
    },
    {
      num: '02',
      title: 'Priamy kontakt',
      body: 'Mnohé inzeráty uvádzajú popri našich kontaktných údajoch aj meno a telefónne číslo majiteľa. Ak sa dohodnete medzi sebou, nikto neplatí províziu.',
    },
    {
      num: '03',
      title: 'Kompletné vybavenie',
      body: 'Dvojjazyčná kúpna zmluva, zastúpenie na základe plnej moci, zápis do katastra nehnuteľností a prepis zmlúv na vodu, plyn a elektrinu.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Založenie' },
    { value: String(REACH_COUNTRIES), label: 'Krajiny' },
    { value: String(REACH_LANGUAGES), label: 'Jazyky' },
    { value: pct(COMMISSION.percent), label: 'Provízia' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Predávajúci | Vaša maďarská nehnuteľnosť v západnej Európe',
      description: `Inzerujte svoju maďarskú nehnuteľnosť v ${REACH_LANGUAGES} jazykoch a ${REACH_COUNTRIES} krajinách, od ${eur(69, L)} a bez výhradného zastúpenia. Provízia len vtedy, ak kupujúceho privedie FODEL: ${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} holandskej DPH.`,
    },
    hero: {
      eyebrow: 'Pre predávajúcich',
      title: 'Vaša nehnuteľnosť',
      titleEm: 'v západnej Európe',
      body: `V modeli FODEL sa vaša nehnuteľnosť zobrazí v ${REACH_LANGUAGES} jazykoch a ${REACH_COUNTRIES} krajinách, bez zmluvy o výhradnom zastúpení. Spolupracujeme len s vážnymi kupujúcimi.`,
      cta: 'Podať inzerát',
      secondary: 'Pozrieť cenník',
    },
    benefits: {
      eyebrow: 'Výhody',
      title: 'Čo prináša zahraničný kupujúci',
      points: [
        'Kupujúci, ktorí platia z vlastných zdrojov: bez čakania na úver či štátnu podporu.',
        'Jednorazová platba bankovým prevodom, rýchlo a bezpečne.',
        `Skutočný záujem o kúpu: obhliadka ich stojí dva dni a ${eur(200, L)} až ${eur(300, L)}.`,
        'Realistické ceny: bez prehnaného zjednávania.',
        'FODEL osobne preverí každého kupujúceho ešte pred dohodnutím stretnutia.',
      ],
    },
    personas: {
      eyebrow: 'Kupujúci',
      title: 'Kto kupuje cez FODEL',
      items: [
        {
          title: 'Dôchodcovia',
          body: 'Hľadajú nižšie životné náklady, daňové výhody a dostupnú zdravotnú starostlivosť v Maďarsku.',
        },
        {
          title: 'Rodiny',
          body: 'Hľadajú priestor, prírodu a život na vidieku. Často farmu, gazdovský dvor alebo rekreačný dom.',
        },
        {
          title: 'Investori',
          body: 'Hľadajú obchodné priestory, vinice a poľnohospodársku pôdu.',
        },
        {
          title: 'Expati hľadajúci iný životný štýl',
          body: 'Odchádzajú od vysokých nákladov na bývanie a zhonu a hľadajú autentický európsky životný štýl.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Krok za krokom', title: 'Model FODEL' },
    commission: {
      eyebrow: 'Cenník',
      title: 'Provízia len\npri uzavretom predaji',
      body: `Ak vás kupujúci kontaktuje priamo a našu pomoc nepotrebujete, okrem poplatku za inzerát neplatíte nič. Ak sa FODEL na predaji podieľa: ${pct(COMMISSION.percent)} bez DPH (min. ${eur(COMMISSION.minimumEur, L)}) + ${pct(COMMISSION.vatPercent)} holandskej DPH.`,
      cta: 'Pozrieť cenník',
    },
  },

  buyers: {
    meta: {
      title: 'Kupujúci | Kúpa nehnuteľnosti v Maďarsku',
      description:
        'Bezpečná kúpa nehnuteľnosti v Maďarsku: dvojjazyčná zmluva, zastúpenie na základe plnej moci, zápis do katastra. A k tomu bezplatná vyhľadávacia služba.',
    },
    hero: {
      eyebrow: 'Pre kupujúcich',
      title: 'Kúpa v Maďarsku',
      titleEm: 'bez nepríjemných prekvapení',
      body: 'Pri mnohých našich nehnuteľnostiach uvádzame majiteľa. Môžete sa dohodnúť priamo, alebo celý proces zveriť nám.',
      cta: 'Pozrieť nehnuteľnosti',
      secondary: 'Bezplatné vyhľadávanie',
    },
    services: {
      eyebrow: 'O čo sa postaráme',
      title: 'Kompletný servis',
      points: [
        'Komunikácia medzi vami a predávajúcim vrátane tlmočníkov.',
        'Obhliadky v sprievode nášho kolegu.',
        'Pomoc pri vyjednávaní o cene a pri vyhotovení dvojjazyčnej zmluvy.',
        'Zastúpenie na základe plnej moci: na podpis nemusíte cestovať do Maďarska.',
        'Zápis do katastra nehnuteľností a prepis zmlúv na vodu, plyn a elektrinu.',
      ],
    },
    reasons: {
      eyebrow: 'Prečo Maďarsko',
      title: 'Čo hľadajú kupujúci zo západnej Európy',
    },
  },

  about: {
    meta: {
      title: 'O nás | Most medzi dvoma svetmi',
      description:
        'Od roku 2013 spájame maďarských predávajúcich s kupujúcimi zo západnej Európy. Diskrétne, transparentne a bez zmluvy o výhradnom zastúpení.',
    },
    hero: {
      eyebrow: 'O nás',
      title: 'Most medzi',
      titleEm: 'dvoma svetmi',
      body: 'Od roku 2013 pomáhame maďarským predávajúcim nájsť toho správneho zahraničného kupujúceho: diskrétne, efektívne a bez zmluvy o výhradnom zastúpení.',
    },
    origin: {
      eyebrow: 'Začiatky · Almere-Buiten, 2013',
      quote:
        '„Keď sme žili v Almere-Buiten, videli sme, ako veľmi Holanďania túžia po autentickom európskom životnom štýle, zatiaľ čo v Maďarsku tie najkrajšie nehnuteľnosti čakajú na majiteľa a nikto si ich nevšíma.“',
    },
    values: {
      eyebrow: 'Naše zásady',
      title: 'Na čom staviame',
      items: [
        {
          num: '01',
          title: 'Diskrétnosť',
          body: 'S údajmi predávajúcich a kupujúcich zaobchádzame s najväčšou starostlivosťou. Osobné údaje zverejňujeme len s ich súhlasom.',
        },
        {
          num: '02',
          title: 'Transparentnosť',
          body: 'Žiadne skryté poplatky. Náš cenník aj provízia sú zverejnené na tomto webe a o každom kroku vás priebežne informujeme.',
        },
        {
          num: '03',
          title: 'Dvojjazyčnosť',
          body: 'Oba trhy poznáme zvnútra. Náš tím hovorí po holandsky, nemecky, anglicky, francúzsky a maďarsky.',
        },
      ],
    },
    approach: {
      eyebrow: 'Náš prístup',
      title: 'Nie sme veľká kancelária.',
      titleEm: 'A práve v tom je naša sila.',
      points: [
        'Každý klient má svojho osobného kontaktného pracovníka: žiadne call centrum, žiadna anonymná prepážka.',
        'Obe kultúry poznáme zvnútra a nehnuteľnosť posudzujeme holandským aj maďarským pohľadom.',
        'Spojiť nehnuteľnosť s kupujúcim je naša zodpovednosť, nie vec náhody.',
        'Pracujeme bez výhradného zastúpenia, pretože radšej presviedčame výsledkami.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Most, ktorý',
      titleEm: 'sme postavili',
      paragraphs: [
        'FODEL založili Maďari žijúci v Holandsku. Začínali sme v roku 2013 v Almere-Buiten, kde sme videli, že mnohí Holanďania a Belgičania chcú kúpiť autentický maďarský dom, no nevedia, kde začať.',
        `Dnes inzerujeme v ${REACH_COUNTRIES} krajinách a ${REACH_LANGUAGES} jazykoch a každú transakciu sprevádzame od začiatku do konca: dvojjazyčná kúpna zmluva, zastúpenie na základe plnej moci a zápis do katastra nehnuteľností. Naša kancelária sídli v Haagu.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Radi vám zavoláme späť',
      description: `Zavolajte nám v pracovné dni od ${hour(COMPANY.hours.weekdays.from)} do ${hour(COMPANY.hours.weekdays.to)} alebo požiadajte o spätné zavolanie. Hovor vás nič nestojí.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Radi vám', titleEm: 'zavoláme späť' },
    formTitle: 'Požiadať o spätné zavolanie',
    submit: 'Požiadať o spätné zavolanie',
    subjects: [
      'Otázka k nehnuteľnosti',
      'Podanie inzerátu',
      'Otázka k cenníku',
      'Žiadosť o spätné zavolanie',
      'Iné',
    ],
    note: `Spätné zavolanie vás nič nestojí: hovor platíme my. Voláme späť do ${hour(COMPANY.hours.callback.to)}, aj cez víkend.`,
  },
} satisfies CopyShape;
