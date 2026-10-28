/**
 * Page copy, Czech (formal "vykání").
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
const L = 'cs' as const;

export const CS = {
  home: {
    meta: {
      title: 'FINDDOME Real Estates | Kupte nemovitost v Maďarsku přímo od majitele',
      description:
        'Domy, statky a venkovská sídla v Maďarsku, často přímo od majitele. Poradenství ve vašem jazyce a dvojjazyčné kupní smlouvy.',
    },
    hero: {
      eyebrow: `Od roku 2013 · ${foundedInLabel(L)}`,
      title: ['Nemovitosti', 'v Maďarsku', 'přímo od majitele'],
      emphasis: 1,
      body: 'Mnoho našich inzerátů uvádí majitele. Můžete s ním jednat přímo, nebo celý proces přenechat nám.',
      primary: 'Prohlédnout nemovitosti',
      secondary: 'Bezplatné vyhledání nemovitosti',
      featuredLabel: 'Doporučujeme',
    },
    audiences: [
      {
        eyebrow: 'Pro kupující',
        title: 'Nemovitosti přímo\nod majitele',
        body: 'Autentické maďarské domy, statky, venkovská sídla a vinice. Kontaktujte přímo majitele, nebo nechte celý proces na FINDDOME.',
        cta: 'Prohlédnout nemovitosti',
        to: 'properties',
      },
      {
        eyebrow: 'Pro prodávající',
        title: 'Vaše maďarská nemovitost\nv západní Evropě',
        body: `Inzerujte v ${REACH_LANGUAGES} jazycích v ${REACH_COUNTRIES} zemích bez smlouvy o exkluzivitě. Provize jen tehdy, když kupce přivedeme my.`,
        cta: 'Více informací',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Výběr', title: 'Doporučené nemovitosti' },
    quote: '„Nizozemci často nevěří vlastním očím, když vidí, co se dá v Maďarsku koupit a za kolik.“',
    quoteSource: `${BRAND.cs.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Jak to funguje', title: 'Jak FINDDOME funguje' },
    cta: {
      eyebrow: 'Kontaktujte nás',
      title: 'Rádi vám',
      titleEm: 'zavoláme zpět',
      body: `{hoursShort} · Zpětné zavolání vás nic nestojí.`,
    },
    referral: {
      eyebrow: 'Doporučující program',
      title: 'Doporučte inzerenta,',
      titleEm: 'získejte 10\u00a0%',
      body: 'Pokud někdo na vaše doporučení zadá inzerát u FINDDOME, získá slevu 10\u00a0% na svůj balíček a vám připíšeme 10\u00a0% na váš příští inzerát. Už u nás inzerujete? Svůj doporučující kód najdete v portálu v Nastavení.',
      steps: [
        'Doporučte známého pomocí formuláře níže, nebo sdílejte svůj odkaz z portálu',
        'Někdo z našeho týmu ho kontaktuje',
        'Pokud zadá inzerát, ušetří 10\u00a0% a vám připíšeme 10\u00a0%',
      ],
      formTitle: 'Doporučte známého',
      fields: {
        referrerName: 'Vaše jméno',
        referrerEmail: 'Váš e-mail',
        referredName: 'Jméno doporučené osoby',
        referredEmail: 'E-mail doporučené osoby',
      },
      submit: 'Odeslat doporučení',
      successTitle: 'Děkujeme za doporučení!',
      successBody:
        'Obdrželi jsme ho. Kolega kontaktuje doporučenou osobu a vás budeme informovat e-mailem.',
    },
  },

  steps: [
    {
      num: '01',
      title: `Inzerce v ${REACH_COUNTRIES} zemích`,
      body: `Inzerujeme v ${REACH_LANGUAGES} jazycích v Nizozemsku, Belgii, Německu, Anglii a dalších zemích EU, bez smlouvy o exkluzivitě s prodávajícím.`,
    },
    {
      num: '02',
      title: 'Přímý kontakt',
      body: 'Mnoho inzerátů uvádí vedle našich údajů i jméno a číslo majitele. Pokud se domluvíte mezi sebou, nikdo neplatí provizi.',
    },
    {
      num: '03',
      title: 'Celý proces vyřídíme za vás',
      body: 'Dvojjazyčná kupní smlouva, zastoupení na základě plné moci, zápis do katastru nemovitostí a převod energií.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Založeno' },
    { value: String(REACH_COUNTRIES), label: 'Země' },
    { value: String(REACH_LANGUAGES), label: 'Jazyky' },
    { value: `${COMMISSION.percent}%`, label: 'Provize' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Pro prodávající | Vaše maďarská nemovitost v západní Evropě',
      description: `Inzerujte svou maďarskou nemovitost v ${REACH_LANGUAGES} jazycích v ${REACH_COUNTRIES} zemích, od ${eur(69, L)} a bez exkluzivity. Provize jen tehdy, když kupce přivede FINDDOME: ${COMMISSION.percent}\u00a0% + ${COMMISSION.vatPercent}\u00a0% DPH.`,
    },
    hero: {
      eyebrow: 'Pro prodávající',
      title: 'Vaše nemovitost',
      titleEm: 'v západní Evropě',
      body: `S modelem FINDDOME se vaše nemovitost objeví v ${REACH_LANGUAGES} jazycích v ${REACH_COUNTRIES} zemích, bez smlouvy o exkluzivitě. Spolupracujeme jen s vážnými kupci.`,
      cta: 'Zadat inzerát',
      secondary: 'Zobrazit ceny',
    },
    benefits: {
      eyebrow: 'Výhody',
      title: 'Co přináší zahraniční kupující',
      points: [
        'Kupující s vlastními prostředky: žádné čekání na hypotéku nebo dotaci.',
        'Jednorázová platba bankovním převodem, rychle a bezpečně.',
        'Vážný zájem: jediná prohlídka je stojí dva dny a 200–300\u00a0€.',
        'Realistické ceny: žádné nepřiměřené smlouvání.',
        'FINDDOME osobně posoudí každého kupujícího, než se domluví jakákoli schůzka.',
      ],
    },
    personas: {
      eyebrow: 'Kupující',
      title: 'Kdo jsou naši kupující',
      items: [
        {
          title: 'Důchodci',
          body: 'Hledají v Maďarsku nižší životní náklady, daňové výhody a dostupnou zdravotní péči.',
        },
        {
          title: 'Rodiny',
          body: 'Hledají prostor, přírodu a život na venkově. Často statek, usedlost nebo rekreační dům.',
        },
        {
          title: 'Investoři',
          body: 'Hledají komerční nemovitosti, vinice a zemědělskou půdu.',
        },
        {
          title: 'Ti, kdo hledají nový životní styl',
          body: 'Opouštějí vysoké životní náklady a přelidnění a hledají autentický evropský způsob života.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Krok za krokem', title: 'Model FINDDOME' },
    commission: {
      eyebrow: 'Ceník',
      title: 'Provize jen\npři úspěšném prodeji',
      body: `Pokud vás kupující kontaktuje přímo a naši pomoc nepotřebujete, nad rámec poplatku za inzerát nic neplatíte. Pokud prodej zprostředkuje FINDDOME: ${COMMISSION.percent}\u00a0% netto (min. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}\u00a0% nizozemské DPH.`,
      cta: 'Zobrazit ceny',
    },
  },

  buyers: {
    meta: {
      title: 'Pro kupující | Koupě nemovitosti v Maďarsku',
      description:
        'Jak bezpečně koupit nemovitost v Maďarsku: dvojjazyčná smlouva, zastoupení na základě plné moci a zápis do katastru. A k tomu bezplatná vyhledávací služba.',
    },
    hero: {
      eyebrow: 'Pro kupující',
      title: 'Koupě v Maďarsku,',
      titleEm: 'bez překvapení',
      body: 'Řada našich inzerátů uvádí majitele. Můžete jednat přímo, nebo celý proces přenechat nám.',
      cta: 'Prohlédnout nemovitosti',
      secondary: 'Bezplatné vyhledání nemovitosti',
    },
    services: {
      eyebrow: 'Co zajistíme',
      title: 'Kompletní podpora',
      points: [
        'Komunikace mezi vámi a prodávajícím včetně tlumočníků.',
        'Prohlídky s kolegou, který mluví vaším jazykem.',
        'Podpora při vyjednávání o ceně a při sepisování dvojjazyčné smlouvy.',
        'Zastoupení na základě plné moci: kvůli podpisu nemusíte cestovat do Maďarska.',
        'Zápis do katastru a převod energií.',
      ],
    },
    reasons: {
      eyebrow: 'Proč Maďarsko',
      title: 'Co hledají kupující ze západní Evropy',
    },
  },

  about: {
    meta: {
      title: 'O nás | Most mezi dvěma světy',
      description:
        'Od roku 2013 propojujeme maďarské prodávající s kupujícími ze západní Evropy. Diskrétně, transparentně a bez exkluzivní smlouvy.',
    },
    hero: {
      eyebrow: 'O nás',
      title: 'Most mezi',
      titleEm: 'dvěma světy',
      body: 'Od roku 2013 pomáháme maďarským prodávajícím najít toho správného zahraničního kupce: diskrétně, efektivně a bez exkluzivní smlouvy.',
    },
    origin: {
      eyebrow: 'Začátky · Almere-Buiten, 2013',
      quote:
        '„Když jsme žili v Almere-Buiten, viděli jsme, jak moc Nizozemci touží po autentickém evropském způsobu života, zatímco v Maďarsku čekají ty nejkrásnější nemovitosti nepovšimnuty na svého majitele.“',
    },
    values: {
      eyebrow: 'Za čím stojíme',
      title: 'Na čem stavíme',
      items: [
        {
          num: '01',
          title: 'Diskrétnost',
          body: 'S údaji prodávajících i kupujících zacházíme s maximální péčí. Osobní údaje se zobrazují jen se souhlasem.',
        },
        {
          num: '02',
          title: 'Transparentnost',
          body: 'Žádné skryté náklady. Naše ceny i provize jsou zveřejněny na tomto webu a o každém kroku vás informujeme.',
        },
        {
          num: '03',
          title: 'Dvojjazyčná odbornost',
          body: 'Oba trhy známe zevnitř. Náš tým mluví nizozemsky, německy, anglicky, francouzsky a maďarsky.',
        },
      ],
    },
    approach: {
      eyebrow: 'Náš přístup',
      title: 'Nejsme velká kancelář.',
      titleEm: 'V tom je naše síla.',
      points: [
        'Každý klient má osobní kontakt: žádné call centrum, žádná anonymní přepážka.',
        'Obě kultury známe zevnitř a nemovitosti posuzujeme nizozemskýma i maďarskýma očima.',
        'Propojit nemovitost a kupujícího je naše odpovědnost, ne věc náhody.',
        'Pracujeme bez exkluzivity, protože raději přesvědčujeme výsledky.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Most, který',
      titleEm: 'jsme postavili',
      paragraphs: [
        'FINDDOME založili Maďaři žijící v Nizozemsku. Začínali jsme v roce 2013 v Almere-Buiten, kde jsme si všimli, kolik Nizozemců a Belgičanů chce koupit autentický maďarský dům, ale neví, kde začít.',
        `Dnes inzerujeme v ${REACH_COUNTRIES} zemích a ${REACH_LANGUAGES} jazycích a provázíme každou transakci od začátku do konce: dvojjazyčná kupní smlouva, zastoupení na základě plné moci a zápis do katastru. Naše kancelář sídlí v Haagu.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Kontakt | Rádi vám zavoláme zpět',
      description: `Volejte nám v pracovní dny mezi ${COMPANY.hours.weekdays.from} a ${COMPANY.hours.weekdays.to}, nebo požádejte o zavolání zpět. Hovor vás nic nestojí.`,
    },
    hero: { eyebrow: 'Kontakt', title: 'Rádi vám', titleEm: 'zavoláme zpět' },
    formTitle: 'Požádat o zavolání',
    submit: 'Požádat o zpětné zavolání',
    subjects: [
      'Dotaz k nemovitosti',
      'Inzerce nemovitosti',
      'Vyžádat ceny',
      'Žádost o zavolání',
      'Jiné',
    ],
    note: `Zavolání zpět vás nic nestojí: hovor platíme my. Voláme zpět do ${COMPANY.hours.callback.to}, i o víkendech.`,
  },
} satisfies CopyShape;
