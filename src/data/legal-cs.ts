/**
 * Legal pages, Czech (formal "vykání"). A faithful translation of the Dutch pages
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

const L = 'cs' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. července 2026';
const notice =
  'Jde o překlad pro vaše pohodlí. V případě rozporu má přednost nizozemský (ve věcech nizozemského práva) nebo maďarský originál.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_CS = {
  imprint: {
    metaTitle: 'Tiráž: údaje o společnosti',
    metaDescription: `Údaje o společnosti ${COMPANY.names.legal}: sídlo, DIČ, číslo KvK a kontaktní údaje.`,
    eyebrow: 'Tiráž',
    title: 'Údaje o',
    titleEm: 'společnosti',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Údaje o poskytovateli služby',
        rows: [
          ['Název společnosti', COMPANY.names.legal],
          ['Sídlo', addressLine(COMPANY.address, L)],
          ['DIČ', COMPANY.registration.vat],
          ['Číslo KvK (nizozemská obchodní komora)', kvk],
          ['Zástupce', COMPANY.principal],
          ['E-mail', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Založeno', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bankovní účty',
        rows: [
          ['Nizozemsko', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Maďarsku', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Spory',
        body: 'Při spotřebitelském sporu můžete využít také evropskou platformu ODR: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Zásady ochrany osobních údajů',
    metaDescription:
      'Jak FODEL nakládá s vašimi osobními údaji: které údaje zpracováváme, jak dlouho je uchováváme a jaká práva máte podle GDPR.',
    eyebrow: 'Soukromí',
    title: 'Zásady ochrany',
    titleEm: 'osobních údajů',
    intro:
      'Tyto zásady popisují, jak nakládáme s osobními údaji, které nám poskytnete prostřednictvím tohoto webu, v souladu s GDPR.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Správce údajů',
        rows: [
          ['Správce', COMPANY.names.legal],
          ['Adresa', addressLine(COMPANY.address, L)],
          ['E-mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Jaké údaje zpracováváme',
        intro: 'Pouze údaje, které sami vyplníte v našich formulářích:',
        items: [
          'Jméno, e-mailová adresa a telefonní číslo: abychom mohli odpovědět na váš dotaz',
          'Předmět a obsah vaší zprávy',
          'U inzerátu: údaje o nemovitosti a vaše fakturační údaje',
          'U požadavku na vyhledání: vaše kritéria hledání',
          'Pro interní správu: kdy a jaký formulář jste vyplnili a kdy jste se přihlásili do portálu, bez ukládání IP adresy',
        ],
      },
      {
        type: 'table',
        title: 'Právní základ a doba uchování',
        rows: [
          ['Kontakt a žádost o zavolání', 'Souhlas (čl. 6 odst. 1 písm. a) GDPR): 12 měsíců'],
          ['Objednávka inzerátu', 'Plnění smlouvy (čl. 6 odst. 1 písm. b)): 7 let, zákonná daňová archivace'],
          ['Požadavek na vyhledání', 'Souhlas: do vyřízení, nejvýše 24 měsíců'],
          ['Interní záznam činností', 'Oprávněný zájem (čl. 6 odst. 1 písm. f)): řádná správa a odhalování zneužití: nejvýše 24 měsíců'],
        ],
      },
      {
        type: 'list',
        title: 'S kým údaje sdílíme',
        intro: 'Vaše údaje neprodáváme a nesdílíme je pro marketingové účely. Našimi zpracovateli jsou:',
        items: [
          'Náš poskytovatel e-mailu, se zpracováním v rámci EU',
          'Poskytovatel hostingu tohoto webu',
          'Při koupi, a pouze na vaši žádost: druhá strana a zúčastněný advokát',
        ],
      },
      {
        type: 'callout',
        title: 'K inzerátům',
        body: 'Jako inzerent nám můžete udělit souhlas se zobrazením vašeho jména a telefonního čísla u inzerátu, aby vás zájemci mohli kontaktovat přímo. Souhlas můžete kdykoli odvolat; údaje pak z inzerátu odstraníme.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Newsletter',
        body: 'Pokud se přihlásíte k odběru našeho newsletteru, zpracováváme vaši e-mailovou adresu, zvolený jazyk a čas přihlášení a potvrzení, výhradně za účelem zasílání newsletteru, na základě vašeho souhlasu. Přihlášení má dva kroky: nic nepošleme, dokud neklepnete na tlačítko v potvrzovacím e-mailu. V každém e-mailu se můžete jedním kliknutím odhlásit a my okamžitě přestaneme. K rozesílání používáme službu Resend.',
      },
      {
        type: 'list',
        title: 'Vaše práva',
        items: [
          'Přístup k údajům, které o vás zpracováváme',
          'Oprava a výmaz',
          'Omezení zpracování nebo námitka proti němu',
          'Přenositelnost údajů',
          'Kdykoli odvolat svůj souhlas',
          'Podání stížnosti u nizozemského úřadu pro ochranu osobních údajů (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt ve věcech ochrany údajů',
        paragraphs: [`Dotazy nebo žádosti můžete posílat na ${COMPANY.email.primary}. Odpovíme nejpozději do 30 dnů.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Zásady používání cookies',
    metaDescription: `Jaké soubory cookie ${SITE_HOST} používá a jak změnit svou volbu.`,
    eyebrow: 'Cookies',
    title: 'Zásady používání',
    titleEm: 'cookies',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Tento web v současnosti používá pouze technicky nezbytné ukládání. Nespouštíme žádné reklamní ani sledovací skripty a nic nesdílíme se sociálními sítěmi.',
        ],
      },
      {
        type: 'table',
        title: 'Co ukládáme',
        rows: [
          [
            'fodel:consent',
            'Vaše volba ohledně cookies (přijato nebo odmítnuto). Uchovává se ve vašem prohlížeči a k nám se nedostane. Doba uchování: 12 měsíců.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistiky',
        paragraphs: [
          'Pokud bychom někdy vedli statistiky návštěvnosti, zapneme je jen s vaším předchozím výslovným souhlasem. Odmítnutí nijak neomezuje používání webu.',
        ],
      },
      {
        type: 'prose',
        title: 'Změna volby',
        paragraphs: [
          'Svou volbu můžete kdykoli změnit vymazáním uložených dat prohlížeče pro tento web; oznámení o cookies se pak znovu zobrazí.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Obchodní podmínky',
    metaDescription:
      'Podmínky inzertní a zprostředkovatelské služby FODEL: ceny, provize, stažení a odpovědnost.',
    eyebrow: 'Podmínky',
    title: 'Obchodní',
    titleEm: 'podmínky',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Upozornění',
        body: 'Tato stránka je shrnutím. Úplné a závazné podmínky jsou k dispozici v PDF; v případě rozporu má přednost PDF.',
      },
      {
        type: 'prose',
        title: '1. Služba',
        paragraphs: [
          'FODEL inzeruje maďarské nemovitosti na vlastních vícejazyčných webech a na základě samostatné smlouvy pomáhá s dokončením prodeje.',
          'Inzertní služba není exkluzivní: prodávající může nemovitost nabízet a prodat i jinými cestami.',
        ],
      },
      {
        type: 'list',
        title: '2. Zadání inzerátu',
        ordered: true,
        items: [
          'Prodávající vyplní registrační formulář.',
          'FODEL zašle výzvu k platbě za zvolený balíček.',
          'Prodávající zaplatí bankovním převodem.',
          'Po přijetí platby získá prodávající právo nahrát fotografie.',
          'FODEL zajistí překlad a inzerát zveřejní.',
        ],
      },
      {
        type: 'table',
        title: '3. Ceny',
        intro: `Všechny ceny zahrnují ${LISTING_VAT_PERCENT}\u00a0% nizozemské DPH. Úplný přehled najdete na stránce Ceny.`,
        rows: [
          [`Úsporný inzerát (${cheap.months} měsíců)`, eur(cheap.priceEur, L)],
          [`Standardní inzerát (${normal.months} měsíců)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Překlad', `${eur(extra('translation').priceEur, L)} za jazyk`],
          [
            'Zvýraznění',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} měsíčně (min. ${minMonths} měsíce)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Provize',
        paragraphs: [
          'Provize je splatná pouze při splnění všech těchto podmínek: písemná kupní smlouva, kupující přivedený FODEL a zaplacená záloha.',
          `Provize činí ${COMMISSION.percent}\u00a0% netto, nejméně ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nizozemské DPH.`,
          'Pokud zájemce kontaktuje prodávajícího přímo a naše pomoc s dokončením není potřeba, nic dalšího kromě poplatku za inzerát se neplatí.',
        ],
      },
      {
        type: 'prose',
        title: '5. Stažení inzerátu',
        paragraphs: [
          'Prodávající může inzerát stáhnout před datem uplynutí. Již zaplacené poplatky za inzerát se v takovém případě nevracejí.',
        ],
      },
      {
        type: 'prose',
        title: '6. Odpovědnost',
        paragraphs: [
          'Za správnost údajů o nemovitosti odpovídá prodávající. FODEL přebírá dodané údaje a za jejich správnost neručí.',
          'Překlady na tomto webu mají informativní charakter; ve sporu má přednost maďarská verze.',
        ],
      },
      {
        type: 'prose',
        title: '7. Právo na odstoupení od smlouvy',
        paragraphs: [
          'Prodávající, který je spotřebitelem, má zákonné právo odstoupit od smlouvy uzavřené na dálku. Pokud prodávající výslovně požádá o okamžité plnění, právo na odstoupení se úměrně sníží podle již poskytnuté služby.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Prohlášení o přístupnosti',
    metaDescription: `Úroveň přístupnosti ${SITE_HOST}, standard, který dodržujeme, a jak nám poslat zpětnou vazbu.`,
    eyebrow: 'Přístupnost',
    title: 'Prohlášení o',
    titleEm: 'přístupnosti',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Chceme, aby tento web mohl používat každý, včetně návštěvníků, kteří používají čtečku obrazovky, klávesnici nebo zvětšení.',
          'Web vytváříme podle WCAG 2.2 na úrovni AA. Značná část našich návštěvníků je v důchodu, proto mají přednost velikost písma, kontrast a ovládání klávesnicí.',
        ],
      },
      {
        type: 'list',
        title: 'Co je již zavedeno',
        items: [
          'Veškerý text má kontrastní poměr alespoň 4,5 : 1',
          'Úplné ovládání klávesnicí s viditelným zvýrazněním fokusu',
          'Odkaz „přeskočit na obsah“ v horní části každé stránky',
          'Smysluplné alternativní texty u všech obrázků',
          'Formulářová pole s propojenými popisky a textovými chybovými hlášeními',
          'Respektování systémového nastavení „omezit pohyb“',
          'Web je čitelný a použitelný i bez JavaScriptu',
        ],
      },
      {
        type: 'prose',
        title: 'Známá omezení',
        paragraphs: ['Na přístupnost obsahu třetích stran, například mapové služby, nemáme vliv.'],
      },
      {
        type: 'prose',
        title: 'Zpětná vazba',
        paragraphs: [
          `Pokud narazíte na překážku, dejte nám vědět na ${COMPANY.email.primary} nebo telefonicky. Hlášení řešíme co nejrychleji.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
