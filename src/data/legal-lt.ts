/**
 * Legal pages, Lithuanian (formal "jūs"). A faithful translation of the Dutch pages
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

const L = 'lt' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '2026 m. liepos 27 d.';
const notice =
  'Tai vertimas jūsų patogumui. Esant neatitikimų, viršenybę turi originalas nyderlandų (Nyderlandų teisės klausimais) arba vengrų kalba.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_LT = {
  imprint: {
    metaTitle: 'Rekvizitai: įmonės duomenys',
    metaDescription: `${COMPANY.names.legal} rekvizitai: registruotas adresas, PVM mokėtojo kodas, KvK numeris ir kontaktai.`,
    eyebrow: 'Rekvizitai',
    title: 'Įmonės',
    titleEm: 'duomenys',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Paslaugos teikėjo duomenys',
        rows: [
          ['Įmonės pavadinimas', COMPANY.names.legal],
          ['Registruotas adresas', addressLine(COMPANY.address, L)],
          ['PVM mokėtojo kodas', COMPANY.registration.vat],
          ['KvK numeris (Nyderlandų prekybos rūmai)', kvk],
          ['Atstovas', COMPANY.principal],
          ['El. paštas', COMPANY.email.primary],
          ['Telefonas', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Įkurta', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Banko sąskaitos',
        rows: [
          ['Nyderlandai', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Vengrijoje', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Ginčai',
        body: 'Kilus vartotojų ginčui, taip pat galite naudotis Europos elektroninio ginčų sprendimo platforma: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Privatumo politika',
    metaDescription:
      'Kaip FODEL tvarko jūsų asmens duomenis: kokius duomenis tvarkome, kiek laiko juos saugome ir kokias teises turite pagal BDAR.',
    eyebrow: 'Privatumas',
    title: 'Privatumo',
    titleEm: 'politika',
    intro:
      'Šiame pranešime aprašoma, kaip pagal BDAR tvarkome asmens duomenis, kuriuos mums pateikiate per šią svetainę.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Duomenų valdytojas',
        rows: [
          ['Valdytojas', COMPANY.names.legal],
          ['Adresas', addressLine(COMPANY.address, L)],
          ['El. paštas', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Kokius duomenis tvarkome',
        intro: 'Tik duomenis, kuriuos patys įvedate mūsų formose:',
        items: [
          'Vardas, el. pašto adresas ir telefono numeris: kad galėtume atsakyti į jūsų užklausą',
          'Jūsų žinutės tema ir turinys',
          'Skelbimui: turto duomenys ir jūsų sąskaitų duomenys',
          'Paieškos užklausai: jūsų paieškos kriterijai',
          'Vidiniam administravimui: kada ir kokią formą užpildėte bei kada prisijungėte prie portalo, nesaugant IP adreso',
        ],
      },
      {
        type: 'table',
        title: 'Teisinis pagrindas ir saugojimo laikotarpis',
        rows: [
          ['Kontaktas ir perskambinimo užklausa', 'Sutikimas (BDAR 6 straipsnio 1 dalies a punktas): 12 mėnesių'],
          ['Skelbimo užsakymas', 'Sutarties vykdymas (6 straipsnio 1 dalies b punktas): 7 metai, privalomas saugojimas mokesčių tikslais'],
          ['Paieškos užklausa', 'Sutikimas: iki įvykdymo, ne ilgiau kaip 24 mėnesius'],
          ['Vidinis veiklos žurnalas', 'Teisėtas interesas (6 straipsnio 1 dalies f punktas): tinkamas administravimas ir piktnaudžiavimo nustatymas: ne ilgiau kaip 24 mėnesius'],
        ],
      },
      {
        type: 'list',
        title: 'Su kuo dalijamės duomenimis',
        intro: 'Jūsų duomenų neparduodame ir nesidaliname jais rinkodaros tikslais. Mūsų duomenų tvarkytojai yra:',
        items: [
          'Mūsų el. pašto paslaugų teikėjas, duomenis tvarkantis ES viduje',
          'Šios svetainės prieglobos paslaugų teikėjas',
          'Perkant ir tik jūsų prašymu: kita šalis ir dalyvaujantis advokatas',
        ],
      },
      {
        type: 'callout',
        title: 'Apie skelbimus',
        body: 'Kaip skelbėjas galite leisti mums prie skelbimo rodyti jūsų vardą ir telefono numerį, kad suinteresuoti asmenys galėtų su jumis susisiekti tiesiogiai. Leidimą galite bet kada atšaukti; tada duomenis iš skelbimo pašaliname.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Naujienlaiškis',
        body: 'Užsiprenumeravę mūsų naujienlaiškį, mes tvarkome jūsų el. pašto adresą, pasirinktą kalbą ir užsiprenumeravimo bei patvirtinimo laiką tik tam, kad siųstume naujienlaiškį, remdamiesi jūsų sutikimu. Prenumerata vyksta dviem etapais: nieko nesiunčiame, kol nepaspaudžiate mygtuko patvirtinimo laiške. Kiekviename laiške galite atsisakyti prenumeratos vienu paspaudimu, ir mes iškart sustojame. Siuntimui naudojame paslaugą Resend.',
      },
      {
        type: 'list',
        title: 'Jūsų teisės',
        items: [
          'Susipažinimas su duomenimis, kuriuos apie jus tvarkome',
          'Ištaisymas ir ištrynimas',
          'Tvarkymo apribojimas arba nesutikimas su juo',
          'Duomenų perkeliamumas',
          'Sutikimo atšaukimas bet kuriuo metu',
          'Skundo pateikimas Nyderlandų duomenų apsaugos institucijai (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Kontaktai privatumo klausimais',
        paragraphs: [`Klausimus ar prašymus galite siųsti adresu ${COMPANY.email.primary}. Atsakome ne vėliau kaip per 30 dienų.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Slapukų politika',
    metaDescription: `Kokius slapukus naudoja ${SITE_HOST} ir kaip pakeisti savo pasirinkimą.`,
    eyebrow: 'Slapukai',
    title: 'Slapukų',
    titleEm: 'politika',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Šiuo metu ši svetainė naudoja tik techniškai būtiną saugyklą. Nenaudojame reklamos ar sekimo scenarijų ir nieko nesidaliname su socialiniais tinklais.',
        ],
      },
      {
        type: 'table',
        title: 'Ką saugome',
        rows: [
          [
            'fodel:consent',
            'Jūsų pasirinkimas dėl slapukų (priimta ar atmesta). Saugomas jūsų naršyklėje ir mūsų nepasiekia. Saugojimo laikas: 12 mėnesių.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Statistika',
        paragraphs: [
          'Jei kada nors rinksime lankytojų statistiką, ją įjungsime tik gavę jūsų išankstinį aiškų sutikimą. Atsisakymas jokiu būdu neriboja naudojimosi svetaine.',
        ],
      },
      {
        type: 'prose',
        title: 'Pasirinkimo keitimas',
        paragraphs: [
          'Pasirinkimą galite bet kada pakeisti ištrynę šiai svetainei išsaugotus naršyklės duomenis; tada slapukų pranešimas vėl pasirodys.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Naudojimosi sąlygos',
    metaDescription:
      'FODEL skelbimų ir tarpininkavimo paslaugos sąlygos: kainos, komisinis, atšaukimas ir atsakomybė.',
    eyebrow: 'Sąlygos',
    title: 'Naudojimosi',
    titleEm: 'sąlygos',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Atkreipkite dėmesį',
        body: 'Šis puslapis yra santrauka. Visos privalomos sąlygos pateikiamos PDF formatu; esant neatitikimų, viršenybę turi PDF.',
      },
      {
        type: 'prose',
        title: '1. Paslauga',
        paragraphs: [
          'FODEL reklamuoja Vengrijos nekilnojamąjį turtą savo daugiakalbėse svetainėse ir pagal atskirą susitarimą padeda užbaigti pardavimą.',
          'Skelbimų paslauga nėra išimtinė: pardavėjas gali siūlyti ir parduoti turtą ir kitais kanalais.',
        ],
      },
      {
        type: 'list',
        title: '2. Skelbimo pateikimas',
        ordered: true,
        items: [
          'Pardavėjas užpildo registracijos formą.',
          'FODEL atsiunčia mokėjimo prašymą už pasirinktą paketą.',
          'Pardavėjas sumoka banko pavedimu.',
          'Gavus mokėjimą, pardavėjui suteikiama teisė įkelti nuotraukas.',
          'FODEL pasirūpina vertimu ir paskelbia skelbimą.',
        ],
      },
      {
        type: 'table',
        title: '3. Kainos',
        intro: `Visos kainos nurodytos su ${LISTING_VAT_PERCENT}\u00a0% Nyderlandų PVM. Visą apžvalgą rasite puslapyje „Kainos“.`,
        rows: [
          [`Ekonominis skelbimas (${cheap.months} mėn.)`, eur(cheap.priceEur, L)],
          [`Standartinis skelbimas (${normal.months} mėn.)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Vertimas', `${eur(extra('translation').priceEur, L)} už kalbą`],
          [
            'Išskyrimas',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} per mėnesį (min. ${minMonths} mėn.)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Komisinis',
        paragraphs: [
          'Komisinis mokamas tik tada, kai įvykdomos visos šios sąlygos: rašytinė pirkimo–pardavimo sutartis, FODEL surastas pirkėjas ir sumokėtas avansas.',
          `Komisinis yra ${COMMISSION.percent}\u00a0% be mokesčių, ne mažiau kaip ${eur(COMMISSION.minimumEur, L)}, plius ${COMMISSION.vatPercent}\u00a0% Nyderlandų PVM.`,
          'Jei susidomėjęs asmuo susisiekia su pardavėju tiesiogiai ir mūsų pagalbos užbaigiant sandorį nereikia, be skelbimo mokesčio nieko daugiau mokėti nereikia.',
        ],
      },
      {
        type: 'prose',
        title: '5. Skelbimo atšaukimas',
        paragraphs: [
          'Pardavėjas gali atšaukti skelbimą nepasibaigus jo galiojimui. Tokiu atveju jau sumokėti skelbimo mokesčiai negrąžinami.',
        ],
      },
      {
        type: 'prose',
        title: '6. Atsakomybė',
        paragraphs: [
          'Už duomenų apie turtą tikslumą atsako pardavėjas. FODEL skelbia pateiktus duomenis ir už jų tikslumą neatsako.',
          'Šios svetainės vertimai yra informacinio pobūdžio; kilus ginčui, viršenybę turi vengriška versija.',
        ],
      },
      {
        type: 'prose',
        title: '7. Teisė atsisakyti sutarties',
        paragraphs: [
          'Pardavėjas, kuris yra vartotojas, turi įstatymu nustatytą teisę atsisakyti nuotolinės sutarties. Jei pardavėjas aiškiai paprašo nedelsiant pradėti teikti paslaugą, teisė atsisakyti sutarties sumažėja proporcingai jau suteiktai paslaugai.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Prieinamumo pareiškimas',
    metaDescription: `${SITE_HOST} prieinamumo lygis, standartas, kurio laikomės, ir kaip pateikti mums atsiliepimą.`,
    eyebrow: 'Prieinamumas',
    title: 'Prieinamumo',
    titleEm: 'pareiškimas',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Norime, kad šia svetaine galėtų naudotis visi, įskaitant lankytojus, kurie naudoja ekrano skaitytuvą, klaviatūrą ar didinimą.',
          'Svetainę kuriame pagal WCAG 2.2 AA lygį. Nemaža dalis mūsų lankytojų yra pensininkai, todėl pirmenybė teikiama teksto dydžiui, kontrastui ir valdymui klaviatūra.',
        ],
      },
      {
        type: 'list',
        title: 'Kas jau įgyvendinta',
        items: [
          'Viso teksto kontrasto santykis yra ne mažesnis kaip 4,5:1',
          'Visiškas valdymas klaviatūra su matomu fokuso žymėjimu',
          'Nuoroda „pereiti prie turinio“ kiekvieno puslapio viršuje',
          'Prasmingi alternatyvieji tekstai visiems paveikslėliams',
          'Formos laukai su susietomis etiketėmis ir tekstiniais klaidų pranešimais',
          'Atsižvelgiama į sistemos nustatymą „mažinti judesį“',
          'Svetainę galima skaityti ir naudoti be JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Žinomi apribojimai',
        paragraphs: ['Negalime daryti įtakos trečiųjų šalių turinio, pavyzdžiui, žemėlapių paslaugos, prieinamumui.'],
      },
      {
        type: 'prose',
        title: 'Atsiliepimai',
        paragraphs: [
          `Jei susiduriate su kliūtimi, praneškite mums adresu ${COMPANY.email.primary} arba telefonu. Pranešimus sprendžiame kuo greičiau.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
