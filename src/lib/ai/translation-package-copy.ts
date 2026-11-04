/**
 * Words for the translation package picker (Basic / Európa / World, single languages, switching languages off), in
 * the three languages of the portal. Prices and counts are filled in by the picker from the configuration, so the
 * copy never states a number that an admin can change.
 */
import type { PortalCopyLang } from './translation-copy';

export type PackageCopy = {
  legend: string;
  intro: string;
  introFree: string;
  included: string;
  current: string;
  upgrade: string;
  /** "23 nyelv" (the original included). */
  languages: (n: number) => string;
  customTitle: string;
  customLead: string;
  european: string;
  worldOnly: string;
  perLanguage: (price: string) => string;
  fineTitle: string;
  fineLead: string;
  original: string;
  excludedBadge: string;
  lockedTip: string;
  priceUnchanged: string;
  nothing: string;
  /** "Fordítás: Európa csomag (22 nyelv, 1 kizárva)" */
  summary: (name: string, count: number, excluded: number) => string;
  summarySingles: (count: number) => string;
  plusSingles: (count: number) => string;
  summaryFree: string;
  requestNote: string;
  switchLabel: string;
  hintEurope: (price: string, more: number) => string;
  hintWorld: (price: string, all: number) => string;
  have: string;
};

export const PACKAGE_COPY: Record<PortalCopyLang, PackageCopy> = {
  hu: {
    legend: 'Fordítás más nyelvekre',
    intro: 'Hirdetése az eredeti nyelven, angolul és németül mindig megjelenik. Ennél több nyelvet csomagban vagy egyenként választhat. A fordítást a rendszer automatikusan, mesterséges intelligenciával készíti el, közvetlenül a fizetés után.',
    introFree: 'Hirdetése az eredeti nyelven, angolul és németül mindig megjelenik, ez Önnek nem jár költséggel. További nyelveket kérhet: a kérését munkatársunk jóváhagyja, a fordítás utána automatikusan elkészül.',
    included: 'Benne van',
    current: 'Jelenlegi csomag',
    upgrade: 'bővítés',
    languages: (n) => `${n} nyelv`,
    customTitle: '+ Egyedi nyelvek',
    customLead: 'Csak néhány további nyelvre van szüksége? Válasszon egyenként.',
    european: 'Európai nyelvek',
    worldOnly: 'Európán kívüli nyelvek',
    perLanguage: (price) => `${price} / nyelv`,
    fineTitle: 'Nyelvek finomhangolása',
    fineLead: 'Kapcsolja ki azokat a nyelveket, amelyeken nem szeretné megjeleníteni a hirdetését.',
    original: 'Eredeti nyelv',
    excludedBadge: 'Kizárva',
    lockedTip: 'Az angol kötelező – ez a tartalék nyelv.',
    priceUnchanged: 'A csomag ára nem változik, ha egyes nyelveket kizár.',
    nothing: 'Csak az eredeti nyelv, az angol és a német.',
    summary: (name, count, excluded) => `Fordítás: ${name} csomag (${count} nyelv${excluded ? `, ${excluded} kizárva` : ''})`,
    summarySingles: (count) => `Fordítás: Basic + ${count} egyedi nyelv`,
    plusSingles: (count) => `+ ${count} egyedi nyelv`,
    summaryFree: 'Fordítás: a kért nyelveket munkatársunk hagyja jóvá',
    requestNote: 'A Basic nyelvei automatikusak. Minden további nyelv kérés, amelyet munkatársunk hagy jóvá.',
    switchLabel: 'Váltás',
    hintEurope: (price, more) => `Az Európa csomag ${price} €-ért ${more} további nyelvet ad.`,
    hintWorld: (price, all) => `A World csomag ${price} €-ért mind a ${all} nyelvet tartalmazza, és olcsóbb, mint az egyenként választott nyelvek.`,
    have: 'Megvan',
  },
  nl: {
    legend: 'Vertaling naar andere talen',
    intro: 'Uw advertentie staat altijd in de oorspronkelijke taal, in het Engels en in het Duits. Meer talen kiest u in een pakket of per taal. De vertaling wordt automatisch met AI gemaakt, direct na betaling.',
    introFree: 'Uw advertentie staat altijd in de oorspronkelijke taal, in het Engels en in het Duits, zonder kosten. Voor extra talen doet u een verzoek; een medewerker keurt het goed en de vertaling volgt automatisch.',
    included: 'Inbegrepen',
    current: 'Huidig pakket',
    upgrade: 'uitbreiding',
    languages: (n) => `${n} talen`,
    customTitle: '+ Losse talen',
    customLead: 'Hebt u maar enkele extra talen nodig? Kies ze per stuk.',
    european: 'Europese talen',
    worldOnly: 'Talen buiten Europa',
    perLanguage: (price) => `${price} per taal`,
    fineTitle: 'Talen fijn afstellen',
    fineLead: 'Zet de talen uit waarin u uw advertentie niet wilt tonen.',
    original: 'Oorspronkelijke taal',
    excludedBadge: 'Uitgesloten',
    lockedTip: 'Engels is verplicht – het is de terugvaltaal.',
    priceUnchanged: 'De prijs van het pakket blijft gelijk als u talen uitsluit.',
    nothing: 'Alleen de oorspronkelijke taal, Engels en Duits.',
    summary: (name, count, excluded) => `Vertaling: pakket ${name} (${count} talen${excluded ? `, ${excluded} uitgesloten` : ''})`,
    summarySingles: (count) => `Vertaling: Basic + ${count} losse ${count === 1 ? 'taal' : 'talen'}`,
    plusSingles: (count) => `+ ${count} losse ${count === 1 ? 'taal' : 'talen'}`,
    summaryFree: 'Vertaling: een medewerker keurt de gevraagde talen goed',
    requestNote: 'De talen van Basic zijn automatisch. Elke andere taal is een verzoek dat een medewerker goedkeurt.',
    switchLabel: 'Overstappen',
    hintEurope: (price, more) => `Het pakket Europa geeft u voor € ${price} nog ${more} talen erbij.`,
    hintWorld: (price, all) => `Het pakket World bevat voor € ${price} alle ${all} talen en is goedkoper dan de talen apart.`,
    have: 'Aanwezig',
  },
  en: {
    legend: 'Translation into other languages',
    intro: 'Your listing always appears in its original language, in English and in German. For more languages, choose a package or single languages. The translation is made automatically by AI, right after payment.',
    introFree: 'Your listing always appears in its original language, in English and in German, at no cost. You can ask for more languages: our team approves the request and the translation follows automatically.',
    included: 'Included',
    current: 'Current package',
    upgrade: 'upgrade',
    languages: (n) => `${n} ${n === 1 ? 'language' : 'languages'}`,
    customTitle: '+ Single languages',
    customLead: 'Only need a few more languages? Choose them one by one.',
    european: 'European languages',
    worldOnly: 'Languages beyond Europe',
    perLanguage: (price) => `${price} per language`,
    fineTitle: 'Fine-tune languages',
    fineLead: 'Switch off any language you do not want your listing to appear in.',
    original: 'Original language',
    excludedBadge: 'Excluded',
    lockedTip: 'English is required – it is the fallback language.',
    priceUnchanged: 'The package price stays the same if you exclude some languages.',
    nothing: 'Only the original language, English and German.',
    summary: (name, count, excluded) => `Translation: ${name} package (${count} languages${excluded ? `, ${excluded} excluded` : ''})`,
    summarySingles: (count) => `Translation: Basic + ${count} single ${count === 1 ? 'language' : 'languages'}`,
    plusSingles: (count) => `+ ${count} single ${count === 1 ? 'language' : 'languages'}`,
    summaryFree: 'Translation: our team approves the languages you ask for',
    requestNote: 'The Basic languages are automatic. Every other language is a request that our team approves.',
    switchLabel: 'Switch',
    hintEurope: (price, more) => `The Europe package gives you ${more} more languages for €${price}.`,
    hintWorld: (price, all) => `The World package includes all ${all} languages for €${price}, which is cheaper than the languages one by one.`,
    have: 'Already there',
  },
};
