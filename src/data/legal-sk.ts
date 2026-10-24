/**
 * Právne stránky, slovenčina (vykanie). Verný preklad holandských stránok
 * (src/data/pages-legal.ts): rovnaké časti, rovnaké čísla, rovnaký zmysel.
 *
 * ⚠️ Zdvorilostný preklad. Pred spustením ho musí schváliť klient spolu
 * s právnikom, rovnako ako maďarské a holandské originály. Vety, ktoré sa
 * opierajú o holandské alebo maďarské právo (úlohy podľa GDPR, holandská DPH,
 * holandský dozorný orgán, právo na odstúpenie, platforma RSO), sú uvedené
 * vo Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';
import type { LegalKey } from '~/data/pages-legal';

const L = 'sk' as const;
const pct = (n: number) => `${n}\u00a0%`;
const months = (n: number) => nOf(L, n, 'mesiac', 'mesiace', 'mesiacov');
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. júla 2026';
const notice =
  'Táto verzia je preklad poskytnutý pre pohodlie. V prípade rozporu má prednosť holandský originál (v otázkach, ktoré sa riadia holandským právom) alebo maďarský originál.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_SK = {
  imprint: {
    metaTitle: 'Právne informácie: údaje o spoločnosti',
    metaDescription: `Údaje o spoločnosti ${COMPANY.names.legal}: sídlo, IČ DPH, číslo KvK a kontaktné údaje.`,
    eyebrow: 'Právne informácie',
    title: 'Údaje o',
    titleEm: 'spoločnosti',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Informácie o poskytovateľovi služby',
        rows: [
          ['Obchodné meno', COMPANY.names.legal],
          ['Sídlo', addressLine(COMPANY.address, L)],
          ['IČ DPH', COMPANY.registration.vat],
          ['Číslo KvK (holandský obchodný register)', kvk],
          ['Zástupca', COMPANY.principal],
          ['E-mail', COMPANY.email.primary],
          ['Telefón', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Rok založenia', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Bankové účty',
        rows: [
          ['Holandsko', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Maďarsko', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Spory',
        body: 'V prípade spotrebiteľského sporu môžete využiť aj európsku platformu na riešenie sporov online: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Zásady ochrany osobných údajov',
    metaDescription:
      'Ako FODEL spracúva vaše osobné údaje: aké údaje spracúvame, ako dlho ich uchovávame a aké práva máte podľa GDPR.',
    eyebrow: 'Ochrana súkromia',
    title: 'Zásady ochrany',
    titleEm: 'osobných údajov',
    intro:
      'Tieto zásady opisujú, ako v súlade s GDPR spracúvame osobné údaje, ktoré nám poskytnete prostredníctvom tohto webu.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Prevádzkovateľ',
        rows: [
          ['Prevádzkovateľ', COMPANY.names.legal],
          ['Adresa', addressLine(COMPANY.address, L)],
          ['E-mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Aké údaje spracúvame',
        intro: 'Iba údaje, ktoré sami zadáte do našich formulárov:',
        items: [
          'Meno, e-mailová adresa a telefónne číslo: aby sme mohli odpovedať na vašu požiadavku',
          'Predmet a obsah vašej správy',
          'Pri inzeráte: údaje o nehnuteľnosti a vaše fakturačné údaje',
          'Pri žiadosti o vyhľadanie: vaše kritériá vyhľadávania',
          'Na internú správu: kedy a aký formulár ste vyplnili a kedy ste sa prihlásili do portálu, bez ukladania IP adresy',
        ],
      },
      {
        type: 'table',
        title: 'Právny základ a doba uchovávania',
        rows: [
          ['Kontakt a žiadosť o spätné zavolanie', 'Súhlas (čl. 6 ods. 1 písm. a) GDPR): 12 mesiacov'],
          ['Objednávka inzerátu', 'Plnenie zmluvy (čl. 6 ods. 1 písm. b)): 7 rokov, zákonná lehota uchovávania daňových dokladov'],
          ['Žiadosť o vyhľadanie', 'Súhlas: do ukončenia, najviac 24 mesiacov'],
          ['Interný záznam aktivít', 'Oprávnený záujem (čl. 6 ods. 1 písm. f)): riadna správa a odhaľovanie zneužitia: najviac 24 mesiacov'],
        ],
      },
      {
        type: 'list',
        title: 'S kým údaje zdieľame',
        intro: 'Vaše údaje nepredávame ani ich nezdieľame na marketingové účely. Našimi sprostredkovateľmi sú:',
        items: [
          'Náš poskytovateľ e-mailových služieb so spracúvaním v rámci EÚ',
          'Poskytovateľ hostingu tohto webu',
          'Pri kúpe a výlučne na vašu žiadosť: druhá strana a príslušný advokát',
        ],
      },
      {
        type: 'callout',
        title: 'K inzerátom',
        body: 'Ako inzerent nám môžete povoliť, aby sme pri inzeráte zobrazili vaše meno a telefónne číslo, aby vás záujemcovia mohli kontaktovať priamo. Toto povolenie môžete kedykoľvek odvolať; vtedy tieto údaje z inzerátu odstránime.',
      },
      // NÁVRH: čaká na právne posúdenie (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Newsletter',
        body: 'Ak sa prihlásite na odber nášho newslettera, spracúvame vašu e-mailovú adresu, zvolený jazyk a čas prihlásenia a potvrdenia, a to výlučne na zasielanie newslettera na základe vášho súhlasu. Prihlásenie prebieha v dvoch krokoch: nič neposielame, kým nekliknete na tlačidlo v potvrdzovacom e-maile. V každom e-maile sa môžete jedným kliknutím odhlásiť a my zasielanie okamžite ukončíme. Na zasielanie používame službu Resend.',
      },
      {
        type: 'list',
        title: 'Vaše práva',
        items: [
          'Prístup k údajom, ktoré o vás spracúvame',
          'Oprava a vymazanie',
          'Obmedzenie spracúvania alebo námietka proti nemu',
          'Prenosnosť údajov',
          'Kedykoľvek odvolať svoj súhlas',
          'Podať sťažnosť holandskému úradu na ochranu osobných údajov (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontakt vo veciach ochrany súkromia',
        paragraphs: [`Otázky alebo žiadosti môžete posielať na ${COMPANY.email.primary}. Odpovieme najneskôr do 30 dní.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Zásady používania súborov cookie',
    metaDescription: `Súbory cookie, ktoré používa ${SITE_HOST}, a ako zmeniť svoju voľbu.`,
    eyebrow: 'Cookies',
    title: 'Zásady používania',
    titleEm: 'súborov cookie',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Tento web zatiaľ používa iba technicky nevyhnutné ukladanie údajov. Nespúšťame žiadne reklamné ani sledovacie skripty a nič nezdieľame so sociálnymi sieťami.',
        ],
      },
      {
        type: 'table',
        title: 'Čo ukladáme',
        rows: [
          [
            'fodel:consent',
            'Vaša voľba týkajúca sa súborov cookie (prijaté alebo odmietnuté). Uchováva sa vo vašom prehliadači a k nám sa nedostane. Doba uchovávania: 12 mesiacov.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Štatistiky',
        paragraphs: [
          'Ak by sme niekedy začali merať návštevnosť, zapneme to len s vaším predchádzajúcim výslovným súhlasom. Odmietnutie nijako neobmedzuje používanie webu.',
        ],
      },
      {
        type: 'prose',
        title: 'Zmena voľby',
        paragraphs: [
          'Svoju voľbu môžete kedykoľvek zmeniť vymazaním údajov, ktoré prehliadač pre tento web uložil; lišta so súbormi cookie sa potom zobrazí znova.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Všeobecné obchodné podmienky',
    metaDescription:
      'Podmienky inzertnej a sprostredkovateľskej služby FODEL: cenník, provízia, odstúpenie a zodpovednosť.',
    eyebrow: 'Podmienky',
    title: 'Všeobecné obchodné',
    titleEm: 'podmienky',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Upozornenie',
        body: 'Táto stránka je zhrnutie. Úplné a záväzné podmienky sú k dispozícii vo formáte PDF; v prípade rozporu má prednosť PDF.',
      },
      {
        type: 'prose',
        title: '1. Služba',
        paragraphs: [
          'FODEL zverejňuje inzeráty maďarských nehnuteľností na vlastných viacjazyčných webových stránkach a na základe samostatnej dohody sa podieľa na priebehu predaja.',
          'Inzertná služba nie je výhradná: predávajúci môže nehnuteľnosť ponúkať a predávať aj inými kanálmi.',
        ],
      },
      {
        type: 'list',
        title: '2. Podanie inzerátu',
        ordered: true,
        items: [
          'Predávajúci vyplní registračný formulár.',
          'FODEL pošle výzvu na úhradu za zvolený balík.',
          'Predávajúci zaplatí bankovým prevodom.',
          'Po prijatí platby môže predávajúci nahrať fotografie.',
          'FODEL zabezpečí preklad a zverejní inzerát.',
        ],
      },
      {
        type: 'table',
        title: '3. Cenník',
        intro: `Všetky ceny zahŕňajú ${pct(LISTING_VAT_PERCENT)} holandskej DPH. Úplný prehľad nájdete na stránke Cenník.`,
        rows: [
          [`Úsporný inzerát (${months(cheap.months)})`, eur(cheap.priceEur, L)],
          [`Štandardný inzerát (${months(normal.months)})`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Preklad', `${eur(extra('translation').priceEur, L)} za jazyk`],
          [
            'Zvýraznenie',
            `${extra('category-highlight').priceEur} – ${eur(extra('homepage-highlight').priceEur, L)} mesačne (min. ${months(minMonths)})`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Provízia',
        paragraphs: [
          'Provízia vzniká len vtedy, ak sú splnené všetky tieto podmienky: písomná kúpna zmluva, kupujúci privedený spoločnosťou FODEL a zaplatená záloha.',
          `Provízia je ${pct(COMMISSION.percent)} bez DPH, najmenej ${eur(COMMISSION.minimumEur, L)}, plus ${pct(COMMISSION.vatPercent)} holandskej DPH.`,
          'Ak sa záujemca obráti priamo na predávajúceho a naša pomoc pri priebehu nie je potrebná, okrem poplatku za inzerát sa nič neplatí.',
        ],
      },
      {
        type: 'prose',
        title: '5. Stiahnutie inzerátu',
        paragraphs: [
          'Predávajúci môže inzerát stiahnuť pred uplynutím jeho platnosti. Už zaplatený poplatok za inzerát sa v takom prípade nevracia.',
        ],
      },
      {
        type: 'prose',
        title: '6. Zodpovednosť',
        paragraphs: [
          'Za správnosť informácií o nehnuteľnosti zodpovedá predávajúci. FODEL uvádza poskytnuté informácie a za ich správnosť nezodpovedá.',
          'Preklady na tomto webe majú informatívny charakter; v prípade sporu má prednosť maďarská verzia.',
        ],
      },
      {
        type: 'prose',
        title: '7. Právo na odstúpenie od zmluvy',
        paragraphs: [
          'Predávajúci, ktorý je spotrebiteľom, má pri zmluvách uzavretých na diaľku zákonné právo na odstúpenie od zmluvy. Ak výslovne požiada o okamžité plnenie, právo na odstúpenie sa zníži úmerne k už poskytnutej službe.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Vyhlásenie o prístupnosti',
    metaDescription: `Úroveň prístupnosti webu ${SITE_HOST}, uplatňovaný štandard a ako nám poslať pripomienky.`,
    eyebrow: 'Prístupnosť',
    title: 'Vyhlásenie o',
    titleEm: 'prístupnosti',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Chceme, aby tento web mohol používať každý, aj návštevníci, ktorí používajú čítačku obrazovky, klávesnicu alebo zväčšenie.',
          'Web vyvíjame podľa štandardu WCAG 2.2 na úrovni AA. Významnú časť našich návštevníkov tvoria dôchodcovia, preto má prednosť veľkosť textu, kontrast a ovládanie klávesnicou.',
        ],
      },
      {
        type: 'list',
        title: 'Čo je zavedené',
        items: [
          'Všetok text má kontrastný pomer aspoň 4,5:1',
          'Úplné ovládanie klávesnicou s viditeľným indikátorom zamerania',
          'Odkaz „Prejsť na obsah“ v hornej časti každej stránky',
          'Výstižné alternatívne texty pri všetkých obrázkoch',
          'Polia formulárov s priradenými popismi a textovými chybovými hláseniami',
          'Rešpektovanie systémového nastavenia „Obmedziť pohyb“',
          'Web je čitateľný a použiteľný aj bez JavaScriptu',
        ],
      },
      {
        type: 'prose',
        title: 'Známe obmedzenia',
        paragraphs: ['Na prístupnosť obsahu tretích strán, napríklad mapovej služby, nemáme vplyv.'],
      },
      {
        type: 'prose',
        title: 'Vaše pripomienky',
        paragraphs: [
          `Narazili ste na prekážku? Dajte nám vedieť na ${COMPANY.email.primary} alebo telefonicky. Hlásenia riešime čo najrýchlejšie.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
