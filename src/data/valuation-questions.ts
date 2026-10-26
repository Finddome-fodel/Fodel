/**
 * The optional questions on the valuation form (brief §8).
 *
 * Extensible on purpose: add, reword or retire a question here and the public
 * form, the stored answers (`valuations.answers`, keyed by `id`) and the admin
 * detail page all follow. The list is a starting point drawn from the
 * 2026-09 meeting — Gábor still has to confirm the final wording and set.
 *
 * Rules that must hold for every question:
 * - Optional. Leaving it empty is fine; "Nem tudom" is always offered and is
 *   stored as its own answer, never read as a negative one.
 * - Objective property and surroundings facts only — never anything about
 *   the neighbours as people or any protected characteristic.
 * - No scoring. The answers inform the human reviewer; nothing here turns an
 *   answer into a price multiplier (there is no validated model for that).
 *
 * Stored values are stable Hungarian slugs, so changing a label never
 * changes what an old answer means. Retiring a question keeps its old
 * answers readable: the admin page falls back to the raw id and value.
 */

import type { Locale, L10n } from '~/i18n/ui';

/** The page language. English, German and French sit beside Hungarian and Dutch. */
export type ValuationLocale = Locale;

export interface ValuationOption {
  value: string;
  label: L10n;
  /** Plain-language explanation (legal chips). Never legal advice. */
  hint?: L10n;
}

export interface ValuationQuestion {
  id: string;
  step?: 2 | 3 | 4;
  multiple?: boolean;
  label: L10n;
  options: ValuationOption[];
}

export const DONT_KNOW = 'nem-tudom';

/** One text in all 21 languages, in the order hu, nl, en, de, fr, es, pl, ro, sk, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt. */
const t5 = (
  hu: string,
  nl: string,
  en: string,
  de: string,
  fr: string,
  es: string,
  pl: string,
  ro: string,
  sk: string,
  it: string,
  pt: string,
  el: string,
  cs: string,
  sl: string,
  sv: string,
  da: string,
  no: string,
  fi: string,
  et: string,
  lv: string,
  lt: string,
): L10n => ({ hu, nl, en, de, fr, es, pl, ro, sk, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt });

const dontKnow: ValuationOption = { value: DONT_KNOW, label: t5('Nem tudom', 'Weet ik niet', 'I don’t know', 'Weiß ich nicht', 'Je ne sais pas', 'No lo sé', 'Nie wiem', 'Nu știu', 'Neviem', 'Non lo so', 'Não sei', 'Δεν ξέρω', 'Nevím', 'Ne vem', 'Vet inte', 'Ved ikke', 'Vet ikke', 'En tiedä', 'Ei tea', 'Nezinu', 'Nežinau') };
const yes: ValuationOption = { value: 'igen', label: t5('Igen', 'Ja', 'Yes', 'Ja', 'Oui', 'Sí', 'Tak', 'Da', 'Áno', 'Sì', 'Sim', 'Ναι', 'Ano', 'Da', 'Ja', 'Ja', 'Ja', 'Kyllä', 'Jah', 'Jā', 'Taip') };
const no: ValuationOption = { value: 'nem', label: t5('Nem', 'Nee', 'No', 'Nein', 'Non', 'No', 'Nie', 'Nu', 'Nie', 'No', 'Não', 'Όχι', 'Ne', 'Ne', 'Nej', 'Nej', 'Nei', 'Ei', 'Ei', 'Nē', 'Ne') };

const near = (value: string, label: L10n): ValuationOption => ({ value, label });
const borders = near('telekkel-hataros', t5('A telekkel határos', 'Grenst aan het perceel', 'Borders the plot', 'Grenzt an das Grundstück', 'Jouxte le terrain', 'Linda con la parcela', 'Graniczy z działką', 'Se învecinează cu terenul', 'Hraničí s pozemkom', 'Confina con il lotto', 'Confina com o terreno', 'Συνορεύει με το οικόπεδο', 'Sousedí s pozemkem', 'Meji na parcelo', 'Gränsar till tomten', 'Grænser op til grunden', 'Grenser til tomten', 'Rajautuu tonttiin', 'Piirneb krundiga', 'Robežojas ar zemesgabalu', 'Ribojasi su sklypu'));
const walking = near('setatavolsagra', t5('Sétatávolságra', 'Op loopafstand', 'Within walking distance', 'In Gehweite', 'À distance de marche', 'A poca distancia a pie', 'W odległości spaceru', 'La distanță de mers pe jos', 'V pešej vzdialenosti', 'Raggiungibile a piedi', 'A uma distância a pé', 'Σε απόσταση με τα πόδια', 'V docházkové vzdálenosti', 'Dosegljivo peš', 'På gångavstånd', 'Inden for gåafstand', 'I gangavstand', 'Kävelymatkan päässä', 'Jalutuskäigu kaugusel', 'Ejama attāluma robežās', 'Pėsčiomis pasiekiamas'));
const notNearby = near('nincs', t5('Nincs a közelben', 'Niet in de buurt', 'Not nearby', 'Nicht in der Nähe', 'Pas à proximité', 'No hay cerca', 'Brak w pobliżu', 'Nu este în apropiere', 'Nie je v blízkosti', 'Non nelle vicinanze', 'Não fica perto', 'Όχι κοντά', 'Není v blízkosti', 'Ni v bližini', 'Inte i närheten', 'Ikke i nærheden', 'Ikke i nærheten', 'Ei lähellä', 'Ei ole lähedal', 'Nav tuvumā', 'Nėra netoliese'));

export const VALUATION_QUESTIONS: ValuationQuestion[] = [
  {
    id: 'megkozelites',
    label: t5(
      'Milyen úton közelíthető meg az ingatlan?',
      'Via wat voor weg is de woning bereikbaar?',
      'What kind of road leads to the property?',
      'Über was für eine Straße ist die Immobilie erreichbar?',
      'Par quel type de route accède-t-on au bien ?',
      '¿Por qué tipo de camino se accede al inmueble?',
      'Jakim rodzajem drogi można dojechać do nieruchomości?',
      'Pe ce tip de drum se ajunge la proprietate?',
      'Po akej ceste sa dá k nehnuteľnosti dostať?',
      'Che tipo di strada porta all’immobile?',
      'Que tipo de estrada dá acesso ao imóvel?',
      'Τι είδους δρόμος οδηγεί στο ακίνητο;',
      'Jaká cesta vede k nemovitosti?',
      'Kakšna cesta vodi do nepremičnine?',
      'Vilken typ av väg leder till fastigheten?',
      'Hvilken slags vej fører til ejendommen?',
      'Hva slags vei fører til eiendommen?',
      'Millainen tie kiinteistölle johtaa?',
      'Milline tee viib kinnistuni?',
      'Kāds ceļš ved uz īpašumu?',
      'Koks kelias veda į turtą?'
    ),
    options: [
      near('aszfaltozott-ut', t5('Aszfaltozott út', 'Geasfalteerde weg', 'Asphalt road', 'Asphaltierte Straße', 'Route goudronnée', 'Carretera asfaltada', 'Droga asfaltowa', 'Drum asfaltat', 'Asfaltová cesta', 'Strada asfaltata', 'Estrada asfaltada', 'Ασφαλτοστρωμένος δρόμος', 'Asfaltová silnice', 'Asfaltirana cesta', 'Asfaltväg', 'Asfaltvej', 'Asfaltvei', 'Asfalttitie', 'Asfalttee', 'Asfaltēts ceļš', 'Asfaltuotas kelias')),
      near('murvas-ut', t5('Murvás / zúzottköves út', 'Grind- of steenslagweg', 'Gravel or crushed-stone road', 'Schotterstraße', 'Route en gravier', 'Camino de grava', 'Droga żwirowa lub szutrowa', 'Drum pietruit', 'Štrková cesta', 'Strada sterrata in ghiaia o pietrisco', 'Estrada de gravilha ou brita', 'Χαλικόδρομος ή δρόμος με θραυστό λίθο', 'Štěrková nebo šotolinová cesta', 'Gramozna ali makadamska cesta', 'Grus- eller makadamväg', 'Grus- eller skærvevej', 'Grus- eller pukkvei', 'Sora- tai sepelitie', 'Kruusa- või killustikutee', 'Grants vai šķembu ceļš', 'Žvyrkelis arba skaldos kelias')),
      near('foldut', t5('Földút', 'Onverharde weg', 'Dirt track', 'Unbefestigter Weg', 'Chemin de terre', 'Camino de tierra', 'Droga gruntowa', 'Drum de pământ', 'Poľná cesta', 'Strada di terra battuta', 'Caminho de terra', 'Χωματόδρομος', 'Polní cesta', 'Kolovoz', 'Jordväg', 'Jordvej', 'Jordvei', 'Hiekkapolku', 'Pinnasetee', 'Grunts ceļš', 'Gruntkelis')),
      dontKnow,
    ],
  },
  {
    id: 'zaj',
    label: t5(
      'Van jelentős zajforrás a közelben (forgalmas út, vasút, üzem)?',
      'Is er een duidelijke geluidsbron in de buurt (drukke weg, spoorlijn, bedrijf)?',
      'Is there a noticeable source of noise nearby (busy road, railway, factory)?',
      'Gibt es in der Nähe eine deutliche Lärmquelle (stark befahrene Straße, Bahnlinie, Betrieb)?',
      'Y a-t-il une source de bruit notable à proximité (route fréquentée, voie ferrée, entreprise) ?',
      '¿Hay alguna fuente de ruido notable cerca (carretera transitada, vía férrea, empresa)?',
      'Czy w pobliżu jest wyraźne źródło hałasu (ruchliwa droga, linia kolejowa, zakład)?',
      'Există în apropiere o sursă de zgomot notabilă (drum aglomerat, cale ferată, fabrică)?',
      'Je v blízkosti výrazný zdroj hluku (frekventovaná cesta, železnica, podnik)?',
      'C’è una fonte di rumore evidente nelle vicinanze (strada trafficata, ferrovia, fabbrica)?',
      'Existe alguma fonte de ruído notória nas proximidades (estrada movimentada, linha férrea, fábrica)?',
      'Υπάρχει αισθητή πηγή θορύβου κοντά (πολυσύχναστος δρόμος, σιδηρόδρομος, εργοστάσιο);',
      'Je v okolí výrazný zdroj hluku (frekventovaná silnice, železnice, továrna)?',
      'Ali je v bližini opazen vir hrupa (prometna cesta, železnica, tovarna)?',
      'Finns det en märkbar bullerkälla i närheten (trafikerad väg, järnväg, fabrik)?',
      'Er der en mærkbar støjkilde i nærheden (trafikeret vej, jernbane, fabrik)?',
      'Finnes det en merkbar støykilde i nærheten (trafikkert vei, jernbane, fabrikk)?',
      'Onko lähellä huomattava melunlähde (vilkas tie, rautatie, tehdas)?',
      'Kas läheduses on märgatav müraallikas (tihe liiklus, raudtee, tehas)?',
      'Vai tuvumā ir jūtams trokšņa avots (noslogots ceļš, dzelzceļš, rūpnīca)?',
      'Ar netoliese yra juntamas triukšmo šaltinis (judrus kelias, geležinkelis, gamykla)?'
    ),
    options: [yes, no, dontKnow],
  },
  {
    id: 'internet',
    label: t5(
      'Milyen internetelérés van?',
      'Welke internetverbinding is er?',
      'What internet connection is there?',
      'Welche Internetverbindung gibt es?',
      'De quelle connexion internet dispose-t-on ?',
      '¿Qué conexión a internet hay?',
      'Jakie jest dostępne łącze internetowe?',
      'Ce conexiune la internet există?',
      'Aké internetové pripojenie je k dispozícii?',
      'Che tipo di connessione internet c’è?',
      'Que ligação à internet existe?',
      'Τι σύνδεση στο διαδίκτυο υπάρχει;',
      'Jaké je zde připojení k internetu?',
      'Kakšna internetna povezava je na voljo?',
      'Vilken internetanslutning finns det?',
      'Hvilken internetforbindelse er der?',
      'Hvilken internettforbindelse finnes det?',
      'Millainen internetyhteys on käytettävissä?',
      'Milline internetiühendus on olemas?',
      'Kāds interneta pieslēgums ir pieejams?',
      'Koks yra interneto ryšys?'
    ),
    options: [
      near('vezetekes', t5('Vezetékes vagy optikai', 'Vast of glasvezel', 'Fixed line or fibre', 'Festnetz oder Glasfaser', 'Ligne fixe ou fibre', 'Línea fija o fibra', 'Łącze stacjonarne lub światłowód', 'Linie fixă sau fibră optică', 'Pevná linka alebo optika', 'Linea fissa o fibra', 'Linha fixa ou fibra', 'Σταθερή γραμμή ή οπτική ίνα', 'Pevná linka nebo optika', 'Fiksna linija ali optika', 'Fast linje eller fiber', 'Fastnet eller fiber', 'Fastlinje eller fiber', 'Kiinteä yhteys tai valokuitu', 'Püsiühendus või valguskaabel', 'Fiksētais pieslēgums vai optiskā šķiedra', 'Laidinis ryšys arba šviesolaidis')),
      near('mobil', t5('Csak mobilinternet', 'Alleen mobiel internet', 'Mobile internet only', 'Nur mobiles Internet', 'Internet mobile uniquement', 'Solo internet móvil', 'Tylko internet mobilny', 'Doar internet mobil', 'Iba mobilný internet', 'Solo internet mobile', 'Só internet móvel', 'Μόνο κινητό ίντερνετ', 'Pouze mobilní internet', 'Samo mobilni internet', 'Endast mobilt internet', 'Kun mobilt internet', 'Kun mobilt internett', 'Vain mobiili-internet', 'Ainult mobiilne internet', 'Tikai mobilais internets', 'Tik mobilusis internetas')),
      near('nincs', t5('Nincs', 'Geen', 'None', 'Keine', 'Aucune', 'Ninguna', 'Brak', 'Niciuna', 'Žiadne', 'Nessuna', 'Nenhuma', 'Καμία', 'Žádné', 'Brez', 'Ingen', 'Ingen', 'Ingen', 'Ei mitään', 'Puudub', 'Nav', 'Nėra')),
      dontKnow,
    ],
  },
  {
    id: 'panorama',
    label: t5(
      'Van kilátás / panoráma az ingatlanból?',
      'Heeft de woning uitzicht / panorama?',
      'Does the property have a view / panorama?',
      'Hat die Immobilie eine Aussicht / ein Panorama?',
      'Le bien offre-t-il une vue / un panorama ?',
      '¿Tiene el inmueble vistas o panorámica?',
      'Czy z nieruchomości roztacza się widok / panorama?',
      'Proprietatea are priveliște / panoramă?',
      'Má nehnuteľnosť výhľad / panorámu?',
      'L’immobile ha una vista / un panorama?',
      'O imóvel tem vista / panorama?',
      'Έχει το ακίνητο θέα / πανόραμα;',
      'Má nemovitost výhled / panorama?',
      'Ali ima nepremičnina razgled / panoramo?',
      'Har fastigheten utsikt / panorama?',
      'Har ejendommen udsigt / panorama?',
      'Har eiendommen utsikt / panorama?',
      'Onko kiinteistöstä näköala / panoraama?',
      'Kas kinnistult avaneb vaade / panoraam?',
      'Vai no īpašuma paveras skats / panorāma?',
      'Ar iš turto atsiveria vaizdas / panorama?'
    ),
    options: [yes, no, dontKnow],
  },
  {
    id: 'viz',
    label: t5(
      'Van tó, patak vagy vízpart a közelben?',
      'Is er een meer, beek of oever in de buurt?',
      'Is there a lake, stream or waterside nearby?',
      'Gibt es in der Nähe einen See, einen Bach oder ein Ufer?',
      'Y a-t-il un lac, un ruisseau ou une berge à proximité ?',
      '¿Hay un lago, un arroyo o una orilla cerca?',
      'Czy w pobliżu jest jezioro, strumień lub brzeg wody?',
      'Există în apropiere un lac, un pârâu sau un mal?',
      'Je v blízkosti jazero, potok alebo breh?',
      'C’è un lago, un ruscello o una riva nelle vicinanze?',
      'Existe um lago, ribeiro ou margem de água nas proximidades?',
      'Υπάρχει λίμνη, ρυάκι ή όχθη κοντά;',
      'Je v blízkosti jezero, potok nebo jiná vodní plocha?',
      'Ali je v bližini jezero, potok ali obrežje?',
      'Finns det en sjö, bäck eller strand i närheten?',
      'Er der en sø, et vandløb eller en bred i nærheden?',
      'Er det en innsjø, bekk eller strandkant i nærheten?',
      'Onko lähellä järvi, puro tai ranta?',
      'Kas läheduses on järv, oja või kallas?',
      'Vai tuvumā ir ezers, strauts vai krasts?',
      'Ar netoliese yra ežeras, upelis ar pakrantė?'
    ),
    options: [borders, walking, notNearby, dontKnow],
  },
  {
    id: 'erdo',
    label: t5(
      'Van erdő a közelben?',
      'Is er bos in de buurt?',
      'Is there woodland nearby?',
      'Gibt es in der Nähe Wald?',
      'Y a-t-il une forêt à proximité ?',
      '¿Hay un bosque cerca?',
      'Czy w pobliżu jest las?',
      'Există o pădure în apropiere?',
      'Je v blízkosti les?',
      'Ci sono boschi nelle vicinanze?',
      'Existe floresta nas proximidades?',
      'Υπάρχει δάσος κοντά;',
      'Je v blízkosti les?',
      'Ali je v bližini gozd?',
      'Finns det skog i närheten?',
      'Er der skov i nærheden?',
      'Er det skog i nærheten?',
      'Onko lähellä metsää?',
      'Kas läheduses on metsa?',
      'Vai tuvumā ir mežs?',
      'Ar netoliese yra miškas?'
    ),
    options: [borders, walking, notNearby, dontKnow],
  },
  {
    id: 'mezogazdasagi-telep',
    label: t5(
      'Van mezőgazdasági üzem vagy állattartó telep a közelben?',
      'Is er een landbouwbedrijf of veehouderij in de buurt?',
      'Is there a farm or livestock operation nearby?',
      'Gibt es in der Nähe einen landwirtschaftlichen Betrieb oder eine Tierhaltung?',
      'Y a-t-il une exploitation agricole ou un élevage à proximité ?',
      '¿Hay una explotación agrícola o ganadera cerca?',
      'Czy w pobliżu jest gospodarstwo rolne lub hodowla zwierząt?',
      'Există în apropiere o exploatație agricolă sau o fermă de animale?',
      'Je v blízkosti poľnohospodársky podnik alebo chov zvierat?',
      'C’è un’azienda agricola o un allevamento nelle vicinanze?',
      'Existe uma exploração agrícola ou pecuária nas proximidades?',
      'Υπάρχει αγρόκτημα ή κτηνοτροφική μονάδα κοντά;',
      'Je v blízkosti farma nebo chov hospodářských zvířat?',
      'Ali je v bližini kmetija ali živinorejski obrat?',
      'Finns det en gård eller djurhållning i närheten?',
      'Er der et landbrug eller husdyrbrug i nærheden?',
      'Er det et gårdsbruk eller husdyrhold i nærheten?',
      'Onko lähellä maatila tai kotieläintila?',
      'Kas läheduses on talu või loomakasvatusettevõte?',
      'Vai tuvumā ir saimniecība vai lopkopības ferma?',
      'Ar netoliese yra ūkis ar gyvulininkystės ferma?'
    ),
    options: [yes, no, dontKnow],
  },
  {
    id: 'magasfeszultseg',
    label: t5(
      'Halad magasfeszültségű vezeték az ingatlan felett vagy közelében?',
      'Loopt er een hoogspanningslijn over of vlak bij de woning?',
      'Do high-voltage power lines run over or close to the property?',
      'Verläuft eine Hochspannungsleitung über oder nahe der Immobilie?',
      'Une ligne à haute tension passe-t-elle au-dessus du bien ou à proximité ?',
      '¿Pasa una línea de alta tensión por encima del inmueble o cerca?',
      'Czy nad nieruchomością lub w jej pobliżu przebiega linia wysokiego napięcia?',
      'Trece o linie de înaltă tensiune peste proprietate sau în apropiere?',
      'Vedie nad nehnuteľnosťou alebo v jej blízkosti vedenie vysokého napätia?',
      'Linee elettriche ad alta tensione passano sopra o vicino all’immobile?',
      'Há linhas de alta tensão a passar por cima ou perto do imóvel?',
      'Περνούν γραμμές υψηλής τάσης πάνω ή κοντά από το ακίνητο;',
      'Vede nad nemovitostí nebo v její blízkosti vedení vysokého napětí?',
      'Ali nad nepremičnino ali v njeni bližini poteka daljnovod?',
      'Går det högspänningsledningar över eller nära fastigheten?',
      'Går der højspændingsledninger hen over eller tæt på ejendommen?',
      'Går det høyspentledninger over eller nær eiendommen?',
      'Kulkeeko suurjännitelinjoja kiinteistön yli tai sen lähellä?',
      'Kas kõrgepingeliinid kulgevad üle kinnistu või selle lähedal?',
      'Vai pāri īpašumam vai tā tuvumā iet augstsprieguma līnijas?',
      'Ar virš turto arba netoli jo eina aukštosios įtampos linijos?'
    ),
    options: [
      near('telek-felett', t5('Igen, a telek felett', 'Ja, over het perceel', 'Yes, over the plot', 'Ja, über dem Grundstück', 'Oui, au-dessus du terrain', 'Sí, por encima de la parcela', 'Tak, nad działką', 'Da, deasupra terenului', 'Áno, nad pozemkom', 'Sì, sopra il lotto', 'Sim, sobre o terreno', 'Ναι, πάνω από το οικόπεδο', 'Ano, nad pozemkem', 'Da, nad parcelo', 'Ja, över tomten', 'Ja, hen over grunden', 'Ja, over tomten', 'Kyllä, tontin yli', 'Jah, üle krundi', 'Jā, pāri zemesgabalam', 'Taip, virš sklypo')),
      near('kozelben', t5('Igen, a közelben', 'Ja, in de buurt', 'Yes, nearby', 'Ja, in der Nähe', 'Oui, à proximité', 'Sí, cerca', 'Tak, w pobliżu', 'Da, în apropiere', 'Áno, v blízkosti', 'Sì, nelle vicinanze', 'Sim, nas proximidades', 'Ναι, κοντά', 'Ano, v blízkosti', 'Da, v bližini', 'Ja, i närheten', 'Ja, i nærheden', 'Ja, i nærheten', 'Kyllä, lähellä', 'Jah, läheduses', 'Jā, tuvumā', 'Taip, netoliese')),
      no,
      dontKnow,
    ],
  },
];

const option = (
  value: string,
  hu: string,
  nl: string,
  en: string,
  de: string,
  fr: string,
  es: string,
  pl: string,
  ro: string,
  sk: string,
  it: string,
  pt: string,
  el: string,
  cs: string,
  sl: string,
  sv: string,
  da: string,
  no: string,
  fi: string,
  et: string,
  lv: string,
  lt: string,
): ValuationOption => ({ value, label: t5(hu, nl, en, de, fr, es, pl, ro, sk, it, pt, el, cs, sl, sv, da, no, fi, et, lv, lt) });
const legal = (value: string, label: L10n, hint: L10n): ValuationOption => ({ value, label, hint });
const question = (id: string, step: 2 | 3 | 4, label: L10n, choices: ValuationOption[], multiple = false): ValuationQuestion =>
  ({ id, step, label, options: [...choices, dontKnow], multiple });

const good = option('jo', 'Jó', 'Goed', 'Good', 'Gut', 'Bon', 'Bueno', 'Dobry', 'Bună', 'Dobrý', 'Buono', 'Bom', 'Καλή', 'Dobrý', 'Dober', 'Bra', 'God', 'God', 'Hyvä', 'Hea', 'Labs', 'Geras');
const mixed = option('vegyes', 'Vegyes', 'Gemengd', 'Mixed', 'Gemischt', 'Mixte', 'Mixto', 'Mieszany', 'Mixt', 'Zmiešaný', 'Misto', 'Misto', 'Μικτή', 'Smíšený', 'Mešan', 'Blandad', 'Blandet', 'Blandet', 'Sekalainen', 'Segatüüpi', 'Jaukts', 'Mišrus');
const other = option('egyeb', 'Egyéb', 'Anders', 'Other', 'Sonstiges', 'Autre', 'Otro', 'Inne', 'Altele', 'Iné', 'Altro', 'Outro', 'Άλλο', 'Jiné', 'Drugo', 'Annat', 'Andet', 'Annet', 'Muu', 'Muu', 'Cits', 'Kita');
const none = option('nincs', 'Nincs', 'Geen', 'None', 'Keine', 'Aucune', 'No hay', 'Brak', 'Nu există', 'Žiadne', 'Nessuno', 'Nenhum', 'Κανένα', 'Žádné', 'Brez', 'Ingen', 'Ingen', 'Ingen', 'Ei mitään', 'Puudub', 'Nav', 'Nėra');

VALUATION_QUESTIONS.push(
  question('falazat', 2, t5('Falazat', 'Muurmateriaal', 'Wall material', 'Wandmaterial', 'Matériau des murs', 'Material de los muros', 'Materiał ścian', 'Materialul pereților', 'Materiál múrov', 'Materiale delle pareti', 'Material das paredes', 'Υλικό τοιχοποιίας', 'Materiál zdí', 'Material sten', 'Väggmaterial', 'Vægmateriale', 'Veggmateriale', 'Seinämateriaali', 'Seinamaterjal', 'Sienu materiāls', 'Sienų medžiaga'), [option('tegla', 'Tégla', 'Baksteen', 'Brick', 'Ziegel', 'Brique', 'Ladrillo', 'Cegła', 'Cărămidă', 'Tehla', 'Mattoni', 'Tijolo', 'Τούβλο', 'Cihla', 'Opeka', 'Tegel', 'Mursten', 'Murstein', 'Tiili', 'Tellis', 'Ķieģeļi', 'Plyta'), option('valyog', 'Vályog', 'Leem', 'Adobe', 'Lehm', 'Adobe', 'Adobe', 'Glina (adobe)', 'Chirpici', 'Nepálená tehla', 'Adobe (mattoni crudi)', 'Adobe (tijolo de barro)', 'Πλίνθοι (ωμόπλινθοι)', 'Nepálená cihla (vepřovice)', 'Nepaljena opeka (ilovica)', 'Adobe (lertegel)', 'Adobe (lerklinet)', 'Adobe (leirstein)', 'Savitiili (adobe)', 'Savitellis (adoobe)', 'Mālu ķieģeļi (adobe)', 'Neišdegta plyta (adobe)'), option('panel', 'Panel', 'Paneel', 'Panel', 'Platte', 'Panneaux', 'Paneles prefabricados', 'Wielka płyta', 'Panouri prefabricate', 'Panel', 'Pannelli prefabbricati', 'Painéis', 'Προκατασκευασμένα πάνελ', 'Panel', 'Panel (montažni)', 'Prefabricerade element', 'Betonelementer', 'Betongelementer', 'Elementti', 'Paneel', 'Paneļi', 'Skydai'), option('fa', 'Fa / könnyűszerkezet', 'Hout / lichte bouw', 'Timber / light frame', 'Holz / Leichtbau', 'Bois / construction légère', 'Madera / construcción ligera', 'Drewno / konstrukcja szkieletowa', 'Lemn / structură ușoară', 'Drevo / ľahká konštrukcia', 'Legno / struttura leggera', 'Madeira / estrutura ligeira', 'Ξύλο / ελαφριά κατασκευή', 'Dřevo / lehká konstrukce', 'Les / lahka konstrukcija', 'Trä / lättbyggnad', 'Træ / let konstruktion', 'Tre / lett konstruksjon', 'Puu / kevytrakenne', 'Puit / kergkonstruktsioon', 'Koks / viegla konstrukcija', 'Mediena / lengva konstrukcija'), option('ko', 'Kő', 'Steen', 'Stone', 'Stein', 'Pierre', 'Piedra', 'Kamień', 'Piatră', 'Kameň', 'Pietra', 'Pedra', 'Πέτρα', 'Kámen', 'Kamen', 'Sten', 'Sten', 'Stein', 'Kivi', 'Kivi', 'Akmens', 'Akmuo'), mixed]),
  question('fodem', 2, t5('Födém', 'Vloerconstructie', 'Floor construction', 'Deckenkonstruktion', 'Structure du plancher', 'Estructura del forjado', 'Konstrukcja stropu', 'Structura planșeului', 'Konštrukcia stropu', 'Struttura dei solai', 'Estrutura dos pavimentos', 'Κατασκευή δαπέδων', 'Konstrukce stropů', 'Konstrukcija stropov', 'Bjälklagskonstruktion', 'Etageadskillelse', 'Etasjeskiller', 'Välipohjarakenne', 'Vahelagede konstruktsioon', 'Pārsegumu konstrukcija', 'Perdangų konstrukcija'), [option('beton', 'Beton', 'Beton', 'Concrete', 'Beton', 'Béton', 'Hormigón', 'Beton', 'Beton', 'Betón', 'Calcestruzzo', 'Betão', 'Μπετόν', 'Beton', 'Beton', 'Betong', 'Beton', 'Betong', 'Betoni', 'Betoon', 'Betons', 'Betonas'), option('fa', 'Fa', 'Hout', 'Timber', 'Holz', 'Bois', 'Madera', 'Drewno', 'Lemn', 'Drevo', 'Legno', 'Madeira', 'Ξύλο', 'Dřevo', 'Les', 'Trä', 'Træ', 'Tre', 'Puu', 'Puit', 'Koks', 'Mediena'), mixed]),
  question('tetoszerkezet', 2, t5('Tetőszerkezet', 'Dakconstructie', 'Roof structure', 'Dachkonstruktion', 'Charpente', 'Estructura de la cubierta', 'Więźba dachowa', 'Structura acoperișului', 'Krov', 'Struttura del tetto', 'Estrutura do telhado', 'Δομή στέγης', 'Konstrukce střechy', 'Strešna konstrukcija', 'Takkonstruktion', 'Tagkonstruktion', 'Takkonstruksjon', 'Kattorakenne', 'Katusekonstruktsioon', 'Jumta konstrukcija', 'Stogo konstrukcija'), [option('fa', 'Fa', 'Hout', 'Timber', 'Holz', 'Bois', 'Madera', 'Drewno', 'Lemn', 'Drevo', 'Legno', 'Madeira', 'Ξύλο', 'Dřevo', 'Les', 'Trä', 'Træ', 'Tre', 'Puu', 'Puit', 'Koks', 'Mediena'), option('beton', 'Beton', 'Beton', 'Concrete', 'Beton', 'Béton', 'Hormigón', 'Beton', 'Beton', 'Betón', 'Calcestruzzo', 'Betão', 'Μπετόν', 'Beton', 'Beton', 'Betong', 'Beton', 'Betong', 'Betoni', 'Betoon', 'Betons', 'Betonas'), other]),
  question('tetofedes', 2, t5('Tetőfedés', 'Dakbedekking', 'Roof covering', 'Dacheindeckung', 'Couverture du toit', 'Material de la cubierta', 'Pokrycie dachu', 'Învelitoarea acoperișului', 'Krytina strechy', 'Copertura del tetto', 'Revestimento do telhado', 'Επικάλυψη στέγης', 'Střešní krytina', 'Strešna kritina', 'Taktäckning', 'Tagbeklædning', 'Taktekking', 'Katemateriaali', 'Katusekate', 'Jumta segums', 'Stogo danga'), [option('cserép', 'Cserép', 'Dakpan', 'Tiles', 'Dachziegel', 'Tuiles', 'Tejas', 'Dachówka', 'Țiglă', 'Škridla', 'Tegole', 'Telhas', 'Κεραμίδια', 'Tašky', 'Strešniki', 'Tegel', 'Tegl', 'Takstein', 'Tiili', 'Plaatkatus', 'Dakstiņi', 'Čerpės'), option('lemez', 'Lemez', 'Metaal', 'Metal sheet', 'Blech', 'Tôle', 'Chapa metálica', 'Blacha', 'Tablă', 'Plech', 'Lamiera', 'Chapa metálica', 'Λαμαρίνα', 'Plech', 'Pločevina', 'Plåt', 'Metalplader', 'Metallplater', 'Peltikatto', 'Plekk', 'Skārds', 'Skardinė danga'), option('pala', 'Pala', 'Leien', 'Slate', 'Schiefer', 'Ardoise', 'Pizarra', 'Łupek', 'Ardezie', 'Bridlica', 'Ardesia', 'Ardósia', 'Σχιστόλιθος', 'Břidlice', 'Skrilavec', 'Skiffer', 'Skifer', 'Skifer', 'Liuskekivi', 'Kiltkivi', 'Šīferis', 'Skalūnas'), other]),
  question('tetofedes-allapot', 2, t5('Tető állapota', 'Staat van het dak', 'Condition of the roof', 'Zustand des Dachs', 'État du toit', 'Estado del tejado', 'Stan dachu', 'Starea acoperișului', 'Stav strechy', 'Stato del tetto', 'Estado do telhado', 'Κατάσταση στέγης', 'Stav střechy', 'Stanje strehe', 'Takets skick', 'Tagets stand', 'Takets tilstand', 'Katon kunto', 'Katuse seisukord', 'Jumta stāvoklis', 'Stogo būklė'), [good, option('felujitando', 'Felújítandó', 'Renovatie nodig', 'Needs renovation', 'Renovierungsbedürftig', 'À rénover', 'Necesita reforma', 'Do remontu', 'Necesită renovare', 'Potrebuje rekonštrukciu', 'Da ristrutturare', 'Precisa de renovação', 'Χρειάζεται ανακαίνιση', 'Vyžaduje rekonstrukci', 'Potrebna prenove', 'Behöver renoveras', 'Trænger til renovering', 'Trenger renovering', 'Vaatii remontin', 'Vajab renoveerimist', 'Nepieciešams remonts', 'Reikia remonto')]),
  question('nyilaszarok', 2, t5('Nyílászárók kora', 'Ouderdom van ramen en deuren', 'Age of windows and doors', 'Alter der Fenster und Türen', 'Âge des fenêtres et des portes', 'Antigüedad de ventanas y puertas', 'Wiek okien i drzwi', 'Vechimea ferestrelor și ușilor', 'Vek okien a dverí', 'Età di finestre e porte', 'Idade das janelas e portas', 'Παλαιότητα παραθύρων και θυρών', 'Stáří oken a dveří', 'Starost oken in vrat', 'Fönstrens och dörrarnas ålder', 'Vinduers og døres alder', 'Alder på vinduer og dører', 'Ikkunoiden ja ovien ikä', 'Akende ja uste vanus', 'Logu un durvju vecums', 'Langų ir durų amžius'), [option('uj', 'Újak / korszerűek', 'Nieuw / modern', 'New / modern', 'Neu / modern', 'Neuves / modernes', 'Nuevas / modernas', 'Nowe / nowoczesne', 'Noi / moderne', 'Nové / moderné', 'Nuovi / moderni', 'Novas / modernas', 'Νέα / σύγχρονα', 'Nová / moderní', 'Nova / sodobna', 'Nya / moderna', 'Nye / moderne', 'Nye / moderne', 'Uudet / nykyaikaiset', 'Uued / kaasaegsed', 'Jauni / mūsdienīgi', 'Nauji / šiuolaikiški'), option('regi', 'Régiek', 'Oud', 'Old', 'Alt', 'Anciennes', 'Antiguas', 'Stare', 'Vechi', 'Staré', 'Vecchi', 'Antigas', 'Παλιά', 'Stará', 'Stara', 'Gamla', 'Gamle', 'Gamle', 'Vanhat', 'Vanad', 'Veci', 'Seni'), mixed]),
  question('nyilaszarok-anyag', 2, t5('Nyílászárók anyaga', 'Materiaal van ramen en deuren', 'Material of windows and doors', 'Material der Fenster und Türen', 'Matériau des fenêtres et des portes', 'Material de ventanas y puertas', 'Materiał okien i drzwi', 'Materialul ferestrelor și ușilor', 'Materiál okien a dverí', 'Materiale di finestre e porte', 'Material das janelas e portas', 'Υλικό παραθύρων και θυρών', 'Materiál oken a dveří', 'Material oken in vrat', 'Material i fönster och dörrar', 'Vinduers og døres materiale', 'Materiale i vinduer og dører', 'Ikkunoiden ja ovien materiaali', 'Akende ja uste materjal', 'Logu un durvju materiāls', 'Langų ir durų medžiaga'), [option('muanyag', 'Műanyag', 'Kunststof', 'Plastic', 'Kunststoff', 'PVC', 'PVC', 'PVC', 'PVC', 'Plast', 'PVC', 'PVC', 'PVC', 'Plast', 'PVC', 'Plast', 'Plast', 'Plast', 'Muovi', 'Plast', 'Plastmasa', 'Plastikas'), option('fa', 'Fa', 'Hout', 'Wood', 'Holz', 'Bois', 'Madera', 'Drewno', 'Lemn', 'Drevo', 'Legno', 'Madeira', 'Ξύλο', 'Dřevo', 'Les', 'Trä', 'Træ', 'Tre', 'Puu', 'Puit', 'Koks', 'Mediena'), option('aluminium', 'Alumínium', 'Aluminium', 'Aluminium', 'Aluminium', 'Aluminium', 'Aluminio', 'Aluminium', 'Aluminiu', 'Hliník', 'Alluminio', 'Alumínio', 'Αλουμίνιο', 'Hliník', 'Aluminij', 'Aluminium', 'Aluminium', 'Aluminium', 'Alumiini', 'Alumiinium', 'Alumīnijs', 'Aliuminis'), mixed]),
  question('szigeteles', 2, t5('Szigetelés', 'Isolatie', 'Insulation', 'Dämmung', 'Isolation', 'Aislamiento', 'Izolacja', 'Izolație', 'Zateplenie', 'Isolamento', 'Isolamento', 'Μόνωση', 'Zateplení', 'Izolacija', 'Isolering', 'Isolering', 'Isolasjon', 'Eristys', 'Soojustus', 'Siltināšana', 'Šiltinimas'), [option('van', 'Van', 'Aanwezig', 'Present', 'Vorhanden', 'Présente', 'Sí', 'Jest', 'Există', 'Áno', 'Presente', 'Presente', 'Υπάρχει', 'Ano', 'Da', 'Finns', 'Findes', 'Finnes', 'On', 'Olemas', 'Ir', 'Yra'), none, option('reszleges', 'Részleges', 'Gedeeltelijk', 'Partial', 'Teilweise', 'Partielle', 'Parcial', 'Częściowa', 'Parțială', 'Čiastočné', 'Parziale', 'Parcial', 'Μερικό', 'Částečné', 'Delno', 'Delvis', 'Delvis', 'Delvis', 'Osittainen', 'Osaline', 'Daļējs', 'Dalinis')]),
  question('hutes', 2, t5('Hűtés', 'Koeling', 'Cooling', 'Kühlung', 'Climatisation', 'Climatización', 'Klimatyzacja', 'Climatizare', 'Chladenie', 'Raffrescamento', 'Climatização', 'Ψύξη', 'Chlazení', 'Hlajenje', 'Kyla', 'Køling', 'Kjøling', 'Jäähdytys', 'Jahutus', 'Dzesēšana', 'Vėsinimas'), [option('klima', 'Klíma', 'Airconditioning', 'Air conditioning', 'Klimaanlage', 'Climatiseur', 'Aire acondicionado', 'Klimatyzator', 'Aer condiționat', 'Klimatizácia', 'Aria condizionata', 'Ar condicionado', 'Κλιματισμός', 'Klimatizace', 'Klimatska naprava', 'Luftkonditionering', 'Aircondition', 'Klimaanlegg', 'Ilmastointi', 'Kliimaseade', 'Gaisa kondicionētājs', 'Oro kondicionierius'), other, none]),
  question('kozmuvek', 2, t5('Közművek', 'Nutsvoorzieningen', 'Utilities', 'Versorgungsanschlüsse', 'Raccordements', 'Suministros', 'Media', 'Utilități', 'Inžinierske siete', 'Utenze', 'Ligações às redes', 'Παροχές δικτύων', 'Inženýrské sítě', 'Komunalni priključki', 'Anslutningar', 'Forsyning', 'Tilknytninger', 'Liittymät', 'Kommunikatsioonid', 'Komunikācijas', 'Komunikacijos'), [option('villany', 'Villany', 'Elektriciteit', 'Electricity', 'Strom', 'Électricité', 'Electricidad', 'Prąd', 'Electricitate', 'Elektrina', 'Elettricità', 'Eletricidade', 'Ηλεκτρικό ρεύμα', 'Elektřina', 'Elektrika', 'El', 'El', 'Strøm', 'Sähkö', 'Elekter', 'Elektrība', 'Elektra'), option('viz', 'Víz', 'Water', 'Water', 'Wasser', 'Eau', 'Agua', 'Woda', 'Apă', 'Voda', 'Acqua', 'Água', 'Νερό', 'Voda', 'Voda', 'Vatten', 'Vand', 'Vann', 'Vesi', 'Vesi', 'Ūdens', 'Vanduo'), option('csatorna', 'Csatorna', 'Riolering', 'Sewerage', 'Kanalisation', 'Tout-à-l’égout', 'Alcantarillado', 'Kanalizacja', 'Canalizare', 'Kanalizácia', 'Fognatura', 'Esgotos', 'Αποχέτευση', 'Kanalizace', 'Kanalizacija', 'Avlopp', 'Kloak', 'Avløp', 'Viemäri', 'Kanalisatsioon', 'Kanalizācija', 'Kanalizacija'), option('gaz', 'Gáz', 'Gas', 'Gas', 'Gas', 'Gaz', 'Gas', 'Gaz', 'Gaz', 'Plyn', 'Gas', 'Gás', 'Φυσικό αέριο', 'Plyn', 'Plin', 'Gas', 'Gas', 'Gass', 'Kaasu', 'Gaas', 'Gāze', 'Dujos'), option('emeszto', 'Emésztő', 'Septische tank', 'Septic tank', 'Klärgrube', 'Fosse septique', 'Fosa séptica', 'Szambo', 'Fosă septică', 'Žumpa', 'Fossa settica', 'Fossa séptica', 'Σηπτική δεξαμενή', 'Žumpa', 'Greznica', 'Septiktank', 'Septiktank', 'Septiktank', 'Saostuskaivo', 'Septik', 'Septiķis', 'Septikas'), option('kut', 'Kút', 'Put', 'Well', 'Brunnen', 'Puits', 'Pozo', 'Studnia', 'Fântână', 'Studňa', 'Pozzo', 'Poço', 'Πηγάδι', 'Studna', 'Vodnjak', 'Brunn', 'Brønd', 'Brønn', 'Kaivo', 'Kaev', 'Aka', 'Šulinys')], true),
  question('napelem', 2, t5('Napelem', 'Zonnepanelen', 'Solar panels', 'Solaranlage', 'Panneaux solaires', 'Placas solares', 'Panele słoneczne', 'Panouri solare', 'Solárne panely', 'Pannelli solari', 'Painéis solares', 'Ηλιακά πάνελ', 'Solární panely', 'Sončni paneli', 'Solpaneler', 'Solceller', 'Solcellepaneler', 'Aurinkopaneelit', 'Päikesepaneelid', 'Saules paneļi', 'Saulės baterijos'), [yes, no]),
  question('tajolas', 3, t5('Tájolás, benapozottság', 'Oriëntatie en zonlicht', 'Orientation and sunlight', 'Ausrichtung und Besonnung', 'Orientation et ensoleillement', 'Orientación y luz solar', 'Ekspozycja i nasłonecznienie', 'Orientare și însorire', 'Orientácia a oslnenie', 'Esposizione e soleggiamento', 'Orientação e exposição solar', 'Προσανατολισμός και ηλιοφάνεια', 'Orientace a oslunění', 'Orientacija in osončenost', 'Väderstreck och solljus', 'Orientering og sollys', 'Orientering og sollys', 'Ilmansuunta ja auringonvalo', 'Ilmakaar ja päikesevalgus', 'Orientācija un saulainums', 'Orientacija ir saulės šviesa'), [option('napos', 'Napos', 'Zonnig', 'Sunny', 'Sonnig', 'Ensoleillé', 'Soleado', 'Nasłonecznione', 'Însorit', 'Slnečné', 'Soleggiato', 'Soalheiro', 'Ηλιόλουστο', 'Slunečné', 'Sončno', 'Soligt', 'Solrigt', 'Solrikt', 'Aurinkoinen', 'Päikesepaisteline', 'Saulains', 'Saulėta'), option('arnyekos', 'Árnyékos', 'Schaduwrijk', 'Shady', 'Schattig', 'Ombragé', 'Sombreado', 'Zacienione', 'Umbrit', 'Tienisté', 'Ombreggiato', 'Sombreado', 'Σκιερό', 'Stinné', 'Senčno', 'Skuggigt', 'Skyggefuldt', 'Skyggefullt', 'Varjoisa', 'Varjuline', 'Ēnains', 'Pavėsinga'), mixed]),
  question('szolgaltatasok', 3, t5('Központ és szolgáltatások', 'Centrum en voorzieningen', 'Centre and amenities', 'Ortszentrum und Einrichtungen', 'Centre et commodités', 'Centro y servicios', 'Centrum i udogodnienia', 'Centru și facilități', 'Centrum a občianska vybavenosť', 'Centro e servizi', 'Centro e serviços', 'Κέντρο και παροχές', 'Centrum a občanská vybavenost', 'Središče in storitve', 'Centrum och service', 'Centrum og faciliteter', 'Sentrum og fasiliteter', 'Keskusta ja palvelut', 'Keskus ja teenused', 'Centrs un pakalpojumi', 'Centras ir paslaugos'), [option('seta', 'Sétatávolságra', 'Loopafstand', 'Within walking distance', 'In Gehweite', 'À distance de marche', 'A poca distancia a pie', 'W odległości spaceru', 'La distanță de mers pe jos', 'V pešej vzdialenosti', 'A piedi', 'A pé', 'Σε απόσταση που φτάνει κανείς με τα πόδια', 'V docházkové vzdálenosti', 'V peš dosegu', 'Inom gångavstånd', 'Inden for gåafstand', 'Innen gangavstand', 'Kävelymatkan päässä', 'Jalutuskäigu kaugusel', 'Ejamā attālumā', 'Pėsčiomis pasiekiama'), option('auto', 'Autóval elérhető', 'Met de auto', 'By car', 'Mit dem Auto erreichbar', 'En voiture', 'En coche', 'Samochodem', 'Cu mașina', 'Autom', 'In auto', 'De carro', 'Με αυτοκίνητο', 'Autem', 'Z avtom', 'Med bil', 'Med bil', 'Med bil', 'Autolla', 'Autoga', 'Ar auto', 'Automobiliu'), option('tavol', 'Távol', 'Ver weg', 'Far away', 'Weit entfernt', 'Loin', 'Lejos', 'Daleko', 'Departe', 'Ďaleko', 'Lontano', 'Longe', 'Μακριά', 'Daleko', 'Daleč', 'Långt bort', 'Langt væk', 'Langt unna', 'Kaukana', 'Kaugel', 'Tālu', 'Toli')]),
  question('kornyezet-jellege', 3, t5('Környező területhasználat', 'Grondgebruik in de omgeving', 'Surrounding land use', 'Umgebende Flächennutzung', 'Occupation des sols alentour', 'Uso del suelo en los alrededores', 'Zagospodarowanie terenu w okolicy', 'Utilizarea terenurilor din jur', 'Využitie okolitých pozemkov', 'Uso del territorio circostante', 'Uso dos terrenos envolventes', 'Χρήσεις γης στην περιοχή', 'Využití okolních pozemků', 'Raba okoliških zemljišč', 'Omgivande markanvändning', 'Omgivende arealanvendelse', 'Omkringliggende arealbruk', 'Ympäröivä maankäyttö', 'Ümbritsev maakasutus', 'Apkārtējās zemes izmantojums', 'Aplinkinės žemės naudojimas'), [option('lako', 'Lakóövezet', 'Woongebied', 'Residential area', 'Wohngebiet', 'Zone résidentielle', 'Zona residencial', 'Teren mieszkaniowy', 'Zonă rezidențială', 'Obytná zóna', 'Zona residenziale', 'Zona residencial', 'Οικιστική περιοχή', 'Obytná zóna', 'Stanovanjsko območje', 'Bostadsområde', 'Boligområde', 'Boligområde', 'Asuinalue', 'Elamupiirkond', 'Dzīvojamais rajons', 'Gyvenamasis rajonas'), option('udulo', 'Üdülőövezet', 'Recreatiegebied', 'Recreational area', 'Erholungsgebiet', 'Zone de loisirs', 'Zona de ocio y vacaciones', 'Teren rekreacyjny', 'Zonă de agrement', 'Rekreačná zóna', 'Zona di villeggiatura', 'Zona de lazer', 'Περιοχή αναψυχής', 'Rekreační oblast', 'Počitniško območje', 'Fritidsområde', 'Ferieområde', 'Fritidsområde', 'Lomakeskus', 'Puhkepiirkond', 'Atpūtas zona', 'Poilsio zona'), option('kulterulet', 'Külterület / tanyás', 'Buitengebied', 'Outlying area / farmsteads', 'Außenbereich / Gehöfte', 'Zone rurale / fermes isolées', 'Zona rural / granjas aisladas', 'Tereny poza zabudową / zagrody', 'Zonă extravilană / ferme izolate', 'Extravilán / samoty', 'Zona rurale / fattorie isolate', 'Zona rural / quintas isoladas', 'Εξοχή / απομονωμένες αγροικίες', 'Samoty / extravilán', 'Podeželje / samotne kmetije', 'Glesbygd / ensamgårdar', 'Landområde / enkeltliggende gårde', 'Landlig område / enkeltgårder', 'Haja-asutusalue / tilat', 'Maapiirkond / üksikud talud', 'Lauku apvidus / viensētas', 'Kaimiška vietovė / viensėdžiai'), option('mezogazdasagi', 'Mezőgazdasági', 'Agrarisch', 'Agricultural', 'Landwirtschaftlich', 'Agricole', 'Agrícola', 'Rolnicze', 'Agricolă', 'Poľnohospodárske', 'Agricola', 'Agrícola', 'Αγροτική', 'Zemědělská', 'Kmetijsko', 'Jordbruk', 'Landbrug', 'Landbruk', 'Maatalous', 'Põllumajanduslik', 'Lauksaimniecības', 'Žemės ūkio'), option('ipari-vegyes', 'Ipari / vegyes', 'Industrieel / gemengd', 'Industrial / mixed', 'Industriell / gemischt', 'Industrielle / mixte', 'Industrial / mixto', 'Przemysłowe / mieszane', 'Industrială / mixtă', 'Priemyselné / zmiešané', 'Industriale / mista', 'Industrial / mista', 'Βιομηχανική / μικτή', 'Průmyslová / smíšená', 'Industrijsko / mešano', 'Industri / blandat', 'Industri / blandet', 'Industri / blandet', 'Teollisuus / sekakäyttö', 'Tööstus- / segapiirkond', 'Rūpnieciskā / jaukta', 'Pramoninė / mišri')]),
  question('szomszedos-epuletek', 3, t5('Szomszédos épületek állapota', 'Staat van aangrenzende gebouwen', 'Condition of neighbouring buildings', 'Zustand der Nachbargebäude', 'État des bâtiments voisins', 'Estado de los edificios vecinos', 'Stan sąsiednich budynków', 'Starea clădirilor învecinate', 'Stav susedných budov', 'Stato degli edifici vicini', 'Estado dos edifícios vizinhos', 'Κατάσταση γειτονικών κτιρίων', 'Stav sousedních budov', 'Stanje sosednjih stavb', 'Grannbyggnadernas skick', 'Nabobygningernes stand', 'Nabobygningenes tilstand', 'Naapurirakennusten kunto', 'Naaberhoonete seisukord', 'Kaimiņu ēku stāvoklis', 'Kaimyninių pastatų būklė'), [good, mixed, option('romos', 'Leromlott', 'Slecht', 'Poor', 'Schlecht', 'Mauvais', 'Malo', 'Zły', 'Proastă', 'Zlý', 'Scadente', 'Mau', 'Κακή', 'Špatný', 'Slab', 'Dåligt', 'Dårligt', 'Dårlig', 'Huono', 'Halb', 'Slikts', 'Prastas')]),
  question('zavaro-letesitmeny', 3, t5('Zavaró létesítmény a közelben', 'Storende faciliteit in de buurt', 'Disturbing facility nearby', 'Störende Einrichtung in der Nähe', 'Installation gênante à proximité', 'Instalación molesta cerca', 'Uciążliwy obiekt w pobliżu', 'Obiectiv deranjant în apropiere', 'Rušivé zariadenie v blízkosti', 'Impianto molesto nelle vicinanze', 'Instalação incómoda nas proximidades', 'Ενοχλητική εγκατάσταση κοντά', 'Rušivé zařízení v okolí', 'Moteč objekt v bližini', 'Störande anläggning i närheten', 'Generende anlæg i nærheden', 'Sjenerende anlegg i nærheten', 'Häiritsevä laitos lähellä', 'Häiriv rajatis läheduses', 'Traucējošs objekts tuvumā', 'Trikdantis objektas netoliese'), [yes, no]),
  question('kert-kerites', 4, t5('Kert és kerítés állapota', 'Staat van tuin en hek', 'Condition of garden and fence', 'Zustand von Garten und Zaun', 'État du jardin et de la clôture', 'Estado del jardín y de la valla', 'Stan ogrodu i ogrodzenia', 'Starea grădinii și a gardului', 'Stav záhrady a plotu', 'Stato di giardino e recinzione', 'Estado do jardim e da vedação', 'Κατάσταση κήπου και περίφραξης', 'Stav zahrady a oplocení', 'Stanje vrta in ograje', 'Trädgårdens och staketets skick', 'Have og hegns stand', 'Hage og gjerdes tilstand', 'Puutarhan ja aidan kunto', 'Aia ja piirdeaia seisukord', 'Dārza un žoga stāvoklis', 'Sodo ir tvoros būklė'), [good, option('felujitando', 'Rendezést igényel', 'Onderhoud nodig', 'Needs tidying', 'Pflege nötig', 'À remettre en ordre', 'Necesita arreglos', 'Wymaga uporządkowania', 'Necesită amenajare', 'Potrebuje úpravu', 'Da riordinare', 'Precisa de arrumação', 'Χρειάζεται τακτοποίηση', 'Vyžaduje úpravu', 'Potrebna ureditve', 'Behöver ses över', 'Trænger til oprydning', 'Trenger opprydding', 'Vaatii siistimistä', 'Vajab korrastamist', 'Nepieciešama sakopšana', 'Reikia sutvarkyti'), none]),
  question('bovites', 4, t5('Bővítési lehetőség', 'Uitbreidingsmogelijkheid', 'Room for extension', 'Erweiterungsmöglichkeit', 'Possibilité d’agrandissement', 'Posibilidad de ampliación', 'Możliwość rozbudowy', 'Posibilitate de extindere', 'Možnosť prístavby', 'Possibilità di ampliamento', 'Possibilidade de ampliação', 'Δυνατότητα επέκτασης', 'Možnost rozšíření', 'Možnost razširitve', 'Utrymme för tillbyggnad', 'Mulighed for udvidelse', 'Mulighet for utvidelse', 'Laajennusmahdollisuus', 'Laiendamise võimalus', 'Paplašināšanas iespējas', 'Plėtros galimybės'), [yes, no]),
  question('korlatozasok', 4, t5('Ismert jogi korlátozások', 'Bekende juridische beperkingen', 'Known legal restrictions', 'Bekannte rechtliche Beschränkungen', 'Restrictions juridiques connues', 'Restricciones jurídicas conocidas', 'Znane ograniczenia prawne', 'Restricții juridice cunoscute', 'Známe právne obmedzenia', 'Vincoli giuridici noti', 'Restrições legais conhecidas', 'Γνωστοί νομικοί περιορισμοί', 'Známá právní omezení', 'Znane pravne omejitve', 'Kända rättsliga begränsningar', 'Kendte retlige begrænsninger', 'Kjente rettslige begrensninger', 'Tunnetut oikeudelliset rajoitukset', 'Teadaolevad õiguslikud piirangud', 'Zināmie juridiskie ierobežojumi', 'Žinomi teisiniai apribojimai'), [
    legal('haszonelvezet', t5('Haszonélvezeti jog', 'Vruchtgebruik', 'Usufruct', 'Nießbrauch', 'Usufruit', 'Usufructo', 'Użytkowanie', 'Uzufruct', 'Užívacie právo', 'Usufrutto', 'Usufruto', 'Επικαρπία', 'Požívací právo', 'Užitek', 'Nyttjanderätt', 'Brugsret', 'Bruksrett', 'Käyttöoikeus', 'Kasutusvaldus', 'Lietojuma tiesības', 'Uzufruktas'), t5('Valaki másnak joga van használni és hasznosítani az ingatlant.', 'Iemand anders mag de woning gebruiken en de vruchten ervan genieten.', 'Someone else has the right to use the property and enjoy its fruits.', 'Eine andere Person darf die Immobilie nutzen und deren Erträge ziehen.', 'Une autre personne a le droit d’utiliser le bien et d’en percevoir les fruits.', 'Otra persona tiene derecho a usar el inmueble y a disfrutar de sus frutos.', 'Inna osoba ma prawo korzystać z nieruchomości i pobierać z niej pożytki.', 'O altă persoană are dreptul de a folosi proprietatea și de a culege fructele acesteia.', 'Iná osoba má právo nehnuteľnosť užívať a poberať z nej úžitky.', 'Un’altra persona ha il diritto di usare l’immobile e di goderne i frutti.', 'Outra pessoa tem o direito de usar o imóvel e de usufruir dos seus frutos.', 'Κάποιος άλλος έχει δικαίωμα να χρησιμοποιεί το ακίνητο και να καρπώνεται τα οφέλη του.', 'Jiná osoba má právo nemovitost užívat a brát z ní užitky.', 'Nekdo drug ima pravico nepremičnino uporabljati in uživati njene plodove.', 'Någon annan har rätt att använda fastigheten och tillgodogöra sig avkastningen.', 'En anden har ret til at bruge ejendommen og nyde dens udbytte.', 'En annen har rett til å bruke eiendommen og nyte avkastningen av den.', 'Jollakulla muulla on oikeus käyttää kiinteistöä ja nauttia sen tuotosta.', 'Kellelgi teisel on õigus kinnisvara kasutada ja selle vilju saada.', 'Kādai citai personai ir tiesības izmantot īpašumu un gūt no tā augļus.', 'Kitas asmuo turi teisę naudotis turtu ir gauti iš jo vaisius.')),
    legal('jelzalog', t5('Jelzálog / teher', 'Hypotheek / last', 'Mortgage / charge', 'Hypothek / Belastung', 'Hypothèque / charge', 'Hipoteca / carga', 'Hipoteka / obciążenie', 'Ipotecă / sarcină', 'Hypotéka / ťarcha', 'Ipoteca / gravame', 'Hipoteca / ónus', 'Υποθήκη / βάρος', 'Zástavní právo / břemeno', 'Hipoteka / breme', 'Pantbrev / inteckning', 'Pant / hæftelse', 'Pant / heftelse', 'Kiinnitys / panttioikeus', 'Hüpoteek / koormatis', 'Hipotēka / apgrūtinājums', 'Hipoteka / suvaržymas'), t5('Az ingatlan hitel vagy más követelés fedezete.', 'De woning dient als onderpand voor een lening of andere vordering.', 'The property secures a loan or other claim.', 'Die Immobilie dient als Sicherheit für ein Darlehen oder eine andere Forderung.', 'Le bien garantit un prêt ou une autre créance.', 'El inmueble garantiza un préstamo u otro crédito.', 'Nieruchomość stanowi zabezpieczenie kredytu lub innej wierzytelności.', 'Proprietatea garantează un împrumut sau o altă creanță.', 'Nehnuteľnosť zabezpečuje úver alebo inú pohľadávku.', 'L’immobile garantisce un prestito o un altro credito.', 'O imóvel garante um empréstimo ou outro crédito.', 'Το ακίνητο εξασφαλίζει δάνειο ή άλλη απαίτηση.', 'Nemovitost zajišťuje úvěr nebo jinou pohledávku.', 'Nepremičnina zavaruje posojilo ali drugo terjatev.', 'Fastigheten utgör säkerhet för ett lån eller annan fordran.', 'Ejendommen er sikkerhed for et lån eller et andet krav.', 'Eiendommen er sikkerhet for et lån eller et annet krav.', 'Kiinteistö on vakuutena lainalle tai muulle saatavalle.', 'Kinnisvara tagab laenu või muu nõude.', 'Īpašums nodrošina aizdevumu vai citu prasījumu.', 'Turtas užtikrina paskolą ar kitą reikalavimą.')),
    legal('elovasarlas', t5('Elővásárlási jog', 'Voorkeursrecht', 'Right of pre-emption', 'Vorkaufsrecht', 'Droit de préemption', 'Derecho de tanteo', 'Prawo pierwokupu', 'Drept de preempțiune', 'Predkupné právo', 'Diritto di prelazione', 'Direito de preferência', 'Δικαίωμα προτίμησης', 'Předkupní právo', 'Predkupna pravica', 'Förköpsrätt', 'Forkøbsret', 'Forkjøpsrett', 'Etuosto-oikeus', 'Ostueesõigus', 'Pirmpirkuma tiesības', 'Pirmumo teisė'), t5('Meghatározott személy a vevőt megelőzve vásárolhat.', 'Een bepaalde persoon mag vóór andere kopers kopen.', 'A specific person may buy before other buyers.', 'Eine bestimmte Person darf vor anderen Käufern kaufen.', 'Une personne déterminée peut acheter avant les autres acquéreurs.', 'Una persona concreta puede comprar antes que otros compradores.', 'Określona osoba może kupić nieruchomość przed innymi kupującymi.', 'O anumită persoană poate cumpăra înaintea altor cumpărători.', 'Určitá osoba môže kúpiť skôr ako ostatní kupujúci.', 'Una determinata persona può acquistare prima degli altri acquirenti.', 'Uma determinada pessoa pode comprar antes dos outros compradores.', 'Ένα συγκεκριμένο πρόσωπο μπορεί να αγοράσει πριν από τους άλλους αγοραστές.', 'Určitá osoba může koupit přednostně před ostatními kupujícími.', 'Določena oseba lahko kupi pred drugimi kupci.', 'En viss person får köpa före andra köpare.', 'En bestemt person må købe før andre købere.', 'En bestemt person kan kjøpe før andre kjøpere.', 'Tietyllä henkilöllä on oikeus ostaa ennen muita ostajia.', 'Kindel isik võib osta enne teisi ostjaid.', 'Konkrēta persona var pirkt pirms citiem pircējiem.', 'Tam tikras asmuo gali pirkti anksčiau už kitus pirkėjus.')),
    legal('szolgalom', t5('Szolgalom', 'Erfdienstbaarheid', 'Easement', 'Dienstbarkeit', 'Servitude', 'Servidumbre', 'Służebność', 'Servitute', 'Vecné bremeno', 'Servitù', 'Servidão', 'Δουλεία', 'Věcné břemeno', 'Služnost', 'Servitut', 'Servitut', 'Servitutt', 'Rasite', 'Servituut', 'Servitūts', 'Servitutas'), t5('Másnak joga van áthaladni vagy másként használni a telket.', 'Iemand anders mag over of anderszins gebruikmaken van het perceel.', 'Someone else may cross or otherwise use the plot.', 'Eine andere Person darf das Grundstück überqueren oder anderweitig nutzen.', 'Une autre personne peut traverser le terrain ou l’utiliser d’une autre manière.', 'Otra persona puede atravesar la parcela o usarla de otra manera.', 'Inna osoba może przechodzić przez działkę lub korzystać z niej w inny sposób.', 'O altă persoană poate traversa terenul sau îl poate folosi în alt mod.', 'Iná osoba môže cez pozemok prechádzať alebo ho inak využívať.', 'Un’altra persona può attraversare il lotto o utilizzarlo in altro modo.', 'Outra pessoa pode atravessar ou utilizar de outra forma o terreno.', 'Κάποιος άλλος μπορεί να διέρχεται από το οικόπεδο ή να το χρησιμοποιεί με άλλο τρόπο.', 'Jiná osoba smí přes pozemek přecházet nebo ho jinak užívat.', 'Nekdo drug lahko prečka parcelo ali jo kako drugače uporablja.', 'Någon annan får passera eller på annat sätt använda tomten.', 'En anden må krydse eller på anden måde bruge grunden.', 'En annen kan krysse eller på annen måte bruke tomten.', 'Joku muu saa kulkea tontin kautta tai käyttää sitä muuten.', 'Keegi teine võib krunti läbida või seda muul viisil kasutada.', 'Kāda cita persona drīkst šķērsot zemesgabalu vai citādi to izmantot.', 'Kitas asmuo gali pereiti per sklypą ar kitaip juo naudotis.')),
    legal('osztatlan', t5('Osztatlan közös tulajdon', 'Ongedeeld eigendom', 'Undivided co-ownership', 'Ungeteiltes Miteigentum', 'Indivision', 'Proindiviso', 'Współwłasność w częściach ułamkowych', 'Coproprietate în indiviziune', 'Podielové spoluvlastníctvo', 'Comproprietà indivisa', 'Compropriedade indivisa', 'Αδιαίρετη συνιδιοκτησία', 'Nerozdělené spoluvlastnictví', 'Nerazdeljeno solastništvo', 'Samägande utan avstyckning', 'Udelt sameje', 'Udelt sameie', 'Jakamaton yhteisomistus', 'Jagamata kaasomand', 'Nesadalīts kopīpašums', 'Nepadalyta bendroji nuosavybė'), t5('Több tulajdonos osztozik, a részek nincsenek külön helyrajzi számon.', 'Meerdere eigenaren delen het object zonder aparte kadastrale nummers.', 'Several owners share the property, without separate land registry numbers.', 'Mehrere Eigentümer teilen sich das Objekt, ohne eigene Flurstücksnummern.', 'Plusieurs propriétaires se partagent le bien, sans numéros cadastraux distincts.', 'Varios propietarios comparten el inmueble, sin números catastrales independientes.', 'Kilku właścicieli dzieli nieruchomość bez odrębnych numerów ewidencyjnych.', 'Mai mulți proprietari dețin împreună proprietatea, fără numere cadastrale separate.', 'Nehnuteľnosť má viacero spoluvlastníkov bez samostatných parcelných čísel.', 'Più proprietari condividono l’immobile, senza numeri catastali separati.', 'Vários proprietários partilham o imóvel, sem números de registo predial separados.', 'Περισσότεροι ιδιοκτήτες μοιράζονται το ακίνητο, χωρίς χωριστούς αριθμούς κτηματολογίου.', 'Nemovitost sdílí více vlastníků bez samostatných katastrálních čísel.', 'Nepremičnino si deli več lastnikov, brez ločenih zemljiškoknjižnih številk.', 'Flera ägare delar på fastigheten, utan separata fastighetsbeteckningar.', 'Flere ejere deler ejendommen uden separate matrikelnumre.', 'Flere eiere deler eiendommen, uten egne matrikkelnumre.', 'Useat omistajat omistavat kiinteistön yhdessä ilman erillisiä kiinteistötunnuksia.', 'Mitu omanikku jagavad kinnisvara ilma eraldi katastritunnusteta.', 'Vairāki īpašnieki dala īpašumu bez atsevišķiem kadastra numuriem.', 'Keli savininkai dalijasi turtu be atskirų kadastro numerių.')),
    legal('vedettseg', t5('Műemléki / természetvédelmi védettség', 'Beschermde status', 'Heritage / nature protection', 'Denkmal- oder Naturschutz', 'Protection patrimoniale ou naturelle', 'Protección patrimonial o natural', 'Ochrona zabytków lub przyrody', 'Protecție a patrimoniului sau a naturii', 'Pamiatková ochrana alebo ochrana prírody', 'Tutela dei beni culturali / naturalistica', 'Proteção patrimonial / natural', 'Προστασία πολιτιστικής κληρονομιάς / φύσης', 'Památková / přírodní ochrana', 'Varstvo kulturne dediščine / narave', 'Kulturminnes- / naturskydd', 'Bevarings- / naturbeskyttelse', 'Kulturminne- / naturvern', 'Rakennussuojelu / luonnonsuojelu', 'Muinsus- / looduskaitse', 'Kultūras pieminekļu / dabas aizsardzība', 'Paveldo / gamtos apsauga'), t5('Az épület vagy a terület védett, a változtatás engedélyhez kötött.', 'Gebouw of gebied is beschermd; wijzigingen vragen om toestemming.', 'The building or area is protected; changes need permission.', 'Gebäude oder Gebiet stehen unter Schutz; Änderungen brauchen eine Genehmigung.', 'Le bâtiment ou la zone est protégé ; toute modification requiert une autorisation.', 'El edificio o la zona están protegidos; cualquier modificación requiere autorización.', 'Budynek lub obszar jest chroniony; wszelkie zmiany wymagają zezwolenia.', 'Clădirea sau zona este protejată; orice modificare necesită autorizație.', 'Budova alebo oblasť je chránená; každá zmena si vyžaduje povolenie.', 'L’edificio o l’area è tutelato; le modifiche richiedono un’autorizzazione.', 'O edifício ou a zona está protegido; as alterações precisam de autorização.', 'Το κτίριο ή η περιοχή προστατεύεται· οι αλλαγές χρειάζονται άδεια.', 'Budova nebo oblast je chráněná; změny vyžadují povolení.', 'Stavba ali območje je zavarovano; za spremembe je potrebno dovoljenje.', 'Byggnaden eller området är skyddat; ändringar kräver tillstånd.', 'Bygningen eller området er beskyttet; ændringer kræver tilladelse.', 'Bygningen eller området er vernet; endringer krever tillatelse.', 'Rakennus tai alue on suojeltu; muutokset vaativat luvan.', 'Hoone või ala on kaitse all; muudatused vajavad luba.', 'Ēka vai teritorija ir aizsargāta; izmaiņām nepieciešama atļauja.', 'Pastatas ar teritorija saugomi; pakeitimams reikia leidimo.')),
    legal('termofold', t5('Termőföld-forgalmi korlátozás', 'Landbouwgrondbeperking', 'Restriction on trading agricultural land', 'Beschränkung des Agrarlandverkehrs', 'Restriction sur la vente de terres agricoles', 'Restricción a la venta de tierras agrícolas', 'Ograniczenia w obrocie gruntami rolnymi', 'Restricții privind vânzarea terenurilor agricole', 'Obmedzenie predaja poľnohospodárskej pôdy', 'Limitazioni alla compravendita di terreni agricoli', 'Restrição à transação de terrenos agrícolas', 'Περιορισμός στη μεταβίβαση γεωργικής γης', 'Omezení převodu zemědělské půdy', 'Omejitev prometa s kmetijskimi zemljišči', 'Begränsning av handel med jordbruksmark', 'Begrænsning i handel med landbrugsjord', 'Begrensning på omsetning av landbruksjord', 'Maatalousmaan kaupan rajoitus', 'Põllumajandusmaa tehingute piirang', 'Lauksaimniecības zemes darījumu ierobežojums', 'Žemės ūkio paskirties žemės sandorių apribojimas'), t5('A földforgalmi szabályok korlátozhatják, ki veheti meg.', 'De landbouwwet kan beperken wie mag kopen.', 'Agricultural land rules may limit who can buy.', 'Die Vorschriften zum Agrarlandverkehr können einschränken, wer kaufen darf.', 'La réglementation sur les terres agricoles peut limiter qui peut acheter.', 'La normativa sobre tierras agrícolas puede limitar quién puede comprar.', 'Przepisy o gruntach rolnych mogą ograniczać krąg kupujących.', 'Reglementările privind terenurile agricole pot limita cine poate cumpăra.', 'Predpisy o poľnohospodárskej pôde môžu obmedziť, kto môže kúpiť.', 'Le norme sui terreni agricoli possono limitare chi può acquistare.', 'As regras sobre terrenos agrícolas podem limitar quem pode comprar.', 'Οι κανόνες για τη γεωργική γη μπορεί να περιορίζουν ποιος μπορεί να αγοράσει.', 'Pravidla pro zemědělskou půdu mohou omezit, kdo smí kupovat.', 'Pravila za kmetijska zemljišča lahko omejijo, kdo sme kupiti.', 'Regler för jordbruksmark kan begränsa vem som får köpa.', 'Regler for landbrugsjord kan begrænse, hvem der må købe.', 'Regler for landbruksjord kan begrense hvem som kan kjøpe.', 'Maatalousmaata koskevat säännöt voivat rajoittaa, kuka saa ostaa.', 'Põllumajandusmaa reeglid võivad piirata, kes tohib osta.', 'Lauksaimniecības zemes noteikumi var ierobežot, kas drīkst pirkt.', 'Žemės ūkio paskirties žemės taisyklės gali riboti, kas gali pirkti.')),
    option('nincs', 'Nincs ismert', 'Geen bekend', 'None known', 'Keine bekannt', 'Aucune connue', 'Ninguna conocida', 'Brak znanych', 'Niciuna cunoscută', 'Žiadne známe', 'Nessuna nota', 'Nenhuma conhecida', 'Καμία γνωστή', 'Žádné známé', 'Nobene znane', 'Inga kända', 'Ingen kendte', 'Ingen kjente', 'Ei tiedossa', 'Teadaolevalt puuduvad', 'Nav zināmu', 'Nėra žinomų'),
  ], true),
);

// Keep the original IDs stable; these groups only affect presentation.
for (const item of VALUATION_QUESTIONS) {
  if (!item.step) item.step = ['megkozelites','zaj','panorama','viz','erdo','mezogazdasagi-telep','magasfeszultseg'].includes(item.id) ? 3 : 2;
}

/** The form field name a question posts under. */
export const questionField = (id: string) => `q_${id}`;

/** Keeps only known questions with a known answer — whatever else was posted is dropped. */
export function pickAnswers(values: Record<string, string>): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const question of VALUATION_QUESTIONS) {
    const value = values[questionField(question.id)];
    if (value) {
      const selected = value.split(',').filter((part) => question.options.some((option) => option.value === part));
      if (selected.length) answers[question.id] = selected.join(',');
    }
  }
  return answers;
}

/** Wizard-step extras stored in `answers` (not in VALUATION_QUESTIONS). */
export const EXTRA_ANSWER_LABELS: Record<string, { question: string; step: 1 | 2 | 3 | 4 }> = {
  bedrooms: { question: 'Szobák', step: 1 },
  bathrooms: { question: 'Fürdőszobák', step: 1 },
  parcelCount: { question: 'Helyrajzi számok', step: 1 },
  features: { question: 'Melléképületek és extrák', step: 4 },
  restrictionsNote: { question: 'Egyéb korlátozás vagy megjegyzés', step: 4 },
};

/** Hungarian question and answer text for the admin; unknown ids/values fall back to the raw key. */
export function describeAnswer(id: string, value: string): { question: string; answer: string; step: 1 | 2 | 3 | 4 } {
  const question = VALUATION_QUESTIONS.find((q) => q.id === id);
  const extra = EXTRA_ANSWER_LABELS[id];
  const answer = value.split(',').map((part) => {
    if (part === DONT_KNOW) return dontKnow.label.hu;
    return question?.options.find((o) => o.value === part)?.label.hu ?? part;
  }).join(', ');
  return {
    question: question?.label.hu ?? extra?.question ?? id,
    answer,
    step: question?.step ?? extra?.step ?? 4,
  };
}
