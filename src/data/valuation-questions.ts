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

/** One text in all five languages, in the order hu, nl, en, de, fr. */
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
): L10n => ({ hu, nl, en, de, fr, es, pl, ro, sk });

const dontKnow: ValuationOption = { value: DONT_KNOW, label: t5('Nem tudom', 'Weet ik niet', 'I don’t know', 'Weiß ich nicht', 'Je ne sais pas', 'No lo sé', 'Nie wiem', 'Nu știu', 'Neviem') };
const yes: ValuationOption = { value: 'igen', label: t5('Igen', 'Ja', 'Yes', 'Ja', 'Oui', 'Sí', 'Tak', 'Da', 'Áno') };
const no: ValuationOption = { value: 'nem', label: t5('Nem', 'Nee', 'No', 'Nein', 'Non', 'No', 'Nie', 'Nu', 'Nie') };

const near = (value: string, label: L10n): ValuationOption => ({ value, label });
const borders = near('telekkel-hataros', t5('A telekkel határos', 'Grenst aan het perceel', 'Borders the plot', 'Grenzt an das Grundstück', 'Jouxte le terrain', 'Linda con la parcela', 'Graniczy z działką', 'Se învecinează cu terenul', 'Hraničí s pozemkom'));
const walking = near('setatavolsagra', t5('Sétatávolságra', 'Op loopafstand', 'Within walking distance', 'In Gehweite', 'À distance de marche', 'A poca distancia a pie', 'W odległości spaceru', 'La distanță de mers pe jos', 'V pešej vzdialenosti'));
const notNearby = near('nincs', t5('Nincs a közelben', 'Niet in de buurt', 'Not nearby', 'Nicht in der Nähe', 'Pas à proximité', 'No hay cerca', 'Brak w pobliżu', 'Nu este în apropiere', 'Nie je v blízkosti'));

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
      'Po akej ceste sa dá k nehnuteľnosti dostať?'
    ),
    options: [
      near('aszfaltozott-ut', t5('Aszfaltozott út', 'Geasfalteerde weg', 'Asphalt road', 'Asphaltierte Straße', 'Route goudronnée', 'Carretera asfaltada', 'Droga asfaltowa', 'Drum asfaltat', 'Asfaltová cesta')),
      near('murvas-ut', t5('Murvás / zúzottköves út', 'Grind- of steenslagweg', 'Gravel or crushed-stone road', 'Schotterstraße', 'Route en gravier', 'Camino de grava', 'Droga żwirowa lub szutrowa', 'Drum pietruit', 'Štrková cesta')),
      near('foldut', t5('Földút', 'Onverharde weg', 'Dirt track', 'Unbefestigter Weg', 'Chemin de terre', 'Camino de tierra', 'Droga gruntowa', 'Drum de pământ', 'Poľná cesta')),
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
      'Je v blízkosti výrazný zdroj hluku (frekventovaná cesta, železnica, podnik)?'
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
      'Aké internetové pripojenie je k dispozícii?'
    ),
    options: [
      near('vezetekes', t5('Vezetékes vagy optikai', 'Vast of glasvezel', 'Fixed line or fibre', 'Festnetz oder Glasfaser', 'Ligne fixe ou fibre', 'Línea fija o fibra', 'Łącze stacjonarne lub światłowód', 'Linie fixă sau fibră optică', 'Pevná linka alebo optika')),
      near('mobil', t5('Csak mobilinternet', 'Alleen mobiel internet', 'Mobile internet only', 'Nur mobiles Internet', 'Internet mobile uniquement', 'Solo internet móvil', 'Tylko internet mobilny', 'Doar internet mobil', 'Iba mobilný internet')),
      near('nincs', t5('Nincs', 'Geen', 'None', 'Keine', 'Aucune', 'Ninguna', 'Brak', 'Niciuna', 'Žiadne')),
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
      'Má nehnuteľnosť výhľad / panorámu?'
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
      'Je v blízkosti jazero, potok alebo breh?'
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
      'Je v blízkosti les?'
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
      'Je v blízkosti poľnohospodársky podnik alebo chov zvierat?'
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
      'Vedie nad nehnuteľnosťou alebo v jej blízkosti vedenie vysokého napätia?'
    ),
    options: [
      near('telek-felett', t5('Igen, a telek felett', 'Ja, over het perceel', 'Yes, over the plot', 'Ja, über dem Grundstück', 'Oui, au-dessus du terrain', 'Sí, por encima de la parcela', 'Tak, nad działką', 'Da, deasupra terenului', 'Áno, nad pozemkom')),
      near('kozelben', t5('Igen, a közelben', 'Ja, in de buurt', 'Yes, nearby', 'Ja, in der Nähe', 'Oui, à proximité', 'Sí, cerca', 'Tak, w pobliżu', 'Da, în apropiere', 'Áno, v blízkosti')),
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
): ValuationOption => ({ value, label: t5(hu, nl, en, de, fr, es, pl, ro, sk) });
const legal = (value: string, label: L10n, hint: L10n): ValuationOption => ({ value, label, hint });
const question = (id: string, step: 2 | 3 | 4, label: L10n, choices: ValuationOption[], multiple = false): ValuationQuestion =>
  ({ id, step, label, options: [...choices, dontKnow], multiple });

const good = option('jo', 'Jó', 'Goed', 'Good', 'Gut', 'Bon', 'Bueno', 'Dobry', 'Bună', 'Dobrý');
const mixed = option('vegyes', 'Vegyes', 'Gemengd', 'Mixed', 'Gemischt', 'Mixte', 'Mixto', 'Mieszany', 'Mixt', 'Zmiešaný');
const other = option('egyeb', 'Egyéb', 'Anders', 'Other', 'Sonstiges', 'Autre', 'Otro', 'Inne', 'Altele', 'Iné');
const none = option('nincs', 'Nincs', 'Geen', 'None', 'Keine', 'Aucune', 'No hay', 'Brak', 'Nu există', 'Žiadne');

VALUATION_QUESTIONS.push(
  question('falazat', 2, t5('Falazat', 'Muurmateriaal', 'Wall material', 'Wandmaterial', 'Matériau des murs', 'Material de los muros', 'Materiał ścian', 'Materialul pereților', 'Materiál múrov'), [option('tegla', 'Tégla', 'Baksteen', 'Brick', 'Ziegel', 'Brique', 'Ladrillo', 'Cegła', 'Cărămidă', 'Tehla'), option('valyog', 'Vályog', 'Leem', 'Adobe', 'Lehm', 'Adobe', 'Adobe', 'Glina (adobe)', 'Chirpici', 'Nepálená tehla'), option('panel', 'Panel', 'Paneel', 'Panel', 'Platte', 'Panneaux', 'Paneles prefabricados', 'Wielka płyta', 'Panouri prefabricate', 'Panel'), option('fa', 'Fa / könnyűszerkezet', 'Hout / lichte bouw', 'Timber / light frame', 'Holz / Leichtbau', 'Bois / construction légère', 'Madera / construcción ligera', 'Drewno / konstrukcja szkieletowa', 'Lemn / structură ușoară', 'Drevo / ľahká konštrukcia'), option('ko', 'Kő', 'Steen', 'Stone', 'Stein', 'Pierre', 'Piedra', 'Kamień', 'Piatră', 'Kameň'), mixed]),
  question('fodem', 2, t5('Födém', 'Vloerconstructie', 'Floor construction', 'Deckenkonstruktion', 'Structure du plancher', 'Estructura del forjado', 'Konstrukcja stropu', 'Structura planșeului', 'Konštrukcia stropu'), [option('beton', 'Beton', 'Beton', 'Concrete', 'Beton', 'Béton', 'Hormigón', 'Beton', 'Beton', 'Betón'), option('fa', 'Fa', 'Hout', 'Timber', 'Holz', 'Bois', 'Madera', 'Drewno', 'Lemn', 'Drevo'), mixed]),
  question('tetoszerkezet', 2, t5('Tetőszerkezet', 'Dakconstructie', 'Roof structure', 'Dachkonstruktion', 'Charpente', 'Estructura de la cubierta', 'Więźba dachowa', 'Structura acoperișului', 'Krov'), [option('fa', 'Fa', 'Hout', 'Timber', 'Holz', 'Bois', 'Madera', 'Drewno', 'Lemn', 'Drevo'), option('beton', 'Beton', 'Beton', 'Concrete', 'Beton', 'Béton', 'Hormigón', 'Beton', 'Beton', 'Betón'), other]),
  question('tetofedes', 2, t5('Tetőfedés', 'Dakbedekking', 'Roof covering', 'Dacheindeckung', 'Couverture du toit', 'Material de la cubierta', 'Pokrycie dachu', 'Învelitoarea acoperișului', 'Krytina strechy'), [option('cserép', 'Cserép', 'Dakpan', 'Tiles', 'Dachziegel', 'Tuiles', 'Tejas', 'Dachówka', 'Țiglă', 'Škridla'), option('lemez', 'Lemez', 'Metaal', 'Metal sheet', 'Blech', 'Tôle', 'Chapa metálica', 'Blacha', 'Tablă', 'Plech'), option('pala', 'Pala', 'Leien', 'Slate', 'Schiefer', 'Ardoise', 'Pizarra', 'Łupek', 'Ardezie', 'Bridlica'), other]),
  question('tetofedes-allapot', 2, t5('Tető állapota', 'Staat van het dak', 'Condition of the roof', 'Zustand des Dachs', 'État du toit', 'Estado del tejado', 'Stan dachu', 'Starea acoperișului', 'Stav strechy'), [good, option('felujitando', 'Felújítandó', 'Renovatie nodig', 'Needs renovation', 'Renovierungsbedürftig', 'À rénover', 'Necesita reforma', 'Do remontu', 'Necesită renovare', 'Potrebuje rekonštrukciu')]),
  question('nyilaszarok', 2, t5('Nyílászárók kora', 'Ouderdom van ramen en deuren', 'Age of windows and doors', 'Alter der Fenster und Türen', 'Âge des fenêtres et des portes', 'Antigüedad de ventanas y puertas', 'Wiek okien i drzwi', 'Vechimea ferestrelor și ușilor', 'Vek okien a dverí'), [option('uj', 'Újak / korszerűek', 'Nieuw / modern', 'New / modern', 'Neu / modern', 'Neuves / modernes', 'Nuevas / modernas', 'Nowe / nowoczesne', 'Noi / moderne', 'Nové / moderné'), option('regi', 'Régiek', 'Oud', 'Old', 'Alt', 'Anciennes', 'Antiguas', 'Stare', 'Vechi', 'Staré'), mixed]),
  question('nyilaszarok-anyag', 2, t5('Nyílászárók anyaga', 'Materiaal van ramen en deuren', 'Material of windows and doors', 'Material der Fenster und Türen', 'Matériau des fenêtres et des portes', 'Material de ventanas y puertas', 'Materiał okien i drzwi', 'Materialul ferestrelor și ușilor', 'Materiál okien a dverí'), [option('muanyag', 'Műanyag', 'Kunststof', 'Plastic', 'Kunststoff', 'PVC', 'PVC', 'PVC', 'PVC', 'Plast'), option('fa', 'Fa', 'Hout', 'Wood', 'Holz', 'Bois', 'Madera', 'Drewno', 'Lemn', 'Drevo'), option('aluminium', 'Alumínium', 'Aluminium', 'Aluminium', 'Aluminium', 'Aluminium', 'Aluminio', 'Aluminium', 'Aluminiu', 'Hliník'), mixed]),
  question('szigeteles', 2, t5('Szigetelés', 'Isolatie', 'Insulation', 'Dämmung', 'Isolation', 'Aislamiento', 'Izolacja', 'Izolație', 'Zateplenie'), [option('van', 'Van', 'Aanwezig', 'Present', 'Vorhanden', 'Présente', 'Sí', 'Jest', 'Există', 'Áno'), none, option('reszleges', 'Részleges', 'Gedeeltelijk', 'Partial', 'Teilweise', 'Partielle', 'Parcial', 'Częściowa', 'Parțială', 'Čiastočné')]),
  question('hutes', 2, t5('Hűtés', 'Koeling', 'Cooling', 'Kühlung', 'Climatisation', 'Climatización', 'Klimatyzacja', 'Climatizare', 'Chladenie'), [option('klima', 'Klíma', 'Airconditioning', 'Air conditioning', 'Klimaanlage', 'Climatiseur', 'Aire acondicionado', 'Klimatyzator', 'Aer condiționat', 'Klimatizácia'), other, none]),
  question('kozmuvek', 2, t5('Közművek', 'Nutsvoorzieningen', 'Utilities', 'Versorgungsanschlüsse', 'Raccordements', 'Suministros', 'Media', 'Utilități', 'Inžinierske siete'), [option('villany', 'Villany', 'Elektriciteit', 'Electricity', 'Strom', 'Électricité', 'Electricidad', 'Prąd', 'Electricitate', 'Elektrina'), option('viz', 'Víz', 'Water', 'Water', 'Wasser', 'Eau', 'Agua', 'Woda', 'Apă', 'Voda'), option('csatorna', 'Csatorna', 'Riolering', 'Sewerage', 'Kanalisation', 'Tout-à-l’égout', 'Alcantarillado', 'Kanalizacja', 'Canalizare', 'Kanalizácia'), option('gaz', 'Gáz', 'Gas', 'Gas', 'Gas', 'Gaz', 'Gas', 'Gaz', 'Gaz', 'Plyn'), option('emeszto', 'Emésztő', 'Septische tank', 'Septic tank', 'Klärgrube', 'Fosse septique', 'Fosa séptica', 'Szambo', 'Fosă septică', 'Žumpa'), option('kut', 'Kút', 'Put', 'Well', 'Brunnen', 'Puits', 'Pozo', 'Studnia', 'Fântână', 'Studňa')], true),
  question('napelem', 2, t5('Napelem', 'Zonnepanelen', 'Solar panels', 'Solaranlage', 'Panneaux solaires', 'Placas solares', 'Panele słoneczne', 'Panouri solare', 'Solárne panely'), [yes, no]),
  question('tajolas', 3, t5('Tájolás, benapozottság', 'Oriëntatie en zonlicht', 'Orientation and sunlight', 'Ausrichtung und Besonnung', 'Orientation et ensoleillement', 'Orientación y luz solar', 'Ekspozycja i nasłonecznienie', 'Orientare și însorire', 'Orientácia a oslnenie'), [option('napos', 'Napos', 'Zonnig', 'Sunny', 'Sonnig', 'Ensoleillé', 'Soleado', 'Nasłonecznione', 'Însorit', 'Slnečné'), option('arnyekos', 'Árnyékos', 'Schaduwrijk', 'Shady', 'Schattig', 'Ombragé', 'Sombreado', 'Zacienione', 'Umbrit', 'Tienisté'), mixed]),
  question('szolgaltatasok', 3, t5('Központ és szolgáltatások', 'Centrum en voorzieningen', 'Centre and amenities', 'Ortszentrum und Einrichtungen', 'Centre et commodités', 'Centro y servicios', 'Centrum i udogodnienia', 'Centru și facilități', 'Centrum a občianska vybavenosť'), [option('seta', 'Sétatávolságra', 'Loopafstand', 'Within walking distance', 'In Gehweite', 'À distance de marche', 'A poca distancia a pie', 'W odległości spaceru', 'La distanță de mers pe jos', 'V pešej vzdialenosti'), option('auto', 'Autóval elérhető', 'Met de auto', 'By car', 'Mit dem Auto erreichbar', 'En voiture', 'En coche', 'Samochodem', 'Cu mașina', 'Autom'), option('tavol', 'Távol', 'Ver weg', 'Far away', 'Weit entfernt', 'Loin', 'Lejos', 'Daleko', 'Departe', 'Ďaleko')]),
  question('kornyezet-jellege', 3, t5('Környező területhasználat', 'Grondgebruik in de omgeving', 'Surrounding land use', 'Umgebende Flächennutzung', 'Occupation des sols alentour', 'Uso del suelo en los alrededores', 'Zagospodarowanie terenu w okolicy', 'Utilizarea terenurilor din jur', 'Využitie okolitých pozemkov'), [option('lako', 'Lakóövezet', 'Woongebied', 'Residential area', 'Wohngebiet', 'Zone résidentielle', 'Zona residencial', 'Teren mieszkaniowy', 'Zonă rezidențială', 'Obytná zóna'), option('udulo', 'Üdülőövezet', 'Recreatiegebied', 'Recreational area', 'Erholungsgebiet', 'Zone de loisirs', 'Zona de ocio y vacaciones', 'Teren rekreacyjny', 'Zonă de agrement', 'Rekreačná zóna'), option('kulterulet', 'Külterület / tanyás', 'Buitengebied', 'Outlying area / farmsteads', 'Außenbereich / Gehöfte', 'Zone rurale / fermes isolées', 'Zona rural / granjas aisladas', 'Tereny poza zabudową / zagrody', 'Zonă extravilană / ferme izolate', 'Extravilán / samoty'), option('mezogazdasagi', 'Mezőgazdasági', 'Agrarisch', 'Agricultural', 'Landwirtschaftlich', 'Agricole', 'Agrícola', 'Rolnicze', 'Agricolă', 'Poľnohospodárske'), option('ipari-vegyes', 'Ipari / vegyes', 'Industrieel / gemengd', 'Industrial / mixed', 'Industriell / gemischt', 'Industrielle / mixte', 'Industrial / mixto', 'Przemysłowe / mieszane', 'Industrială / mixtă', 'Priemyselné / zmiešané')]),
  question('szomszedos-epuletek', 3, t5('Szomszédos épületek állapota', 'Staat van aangrenzende gebouwen', 'Condition of neighbouring buildings', 'Zustand der Nachbargebäude', 'État des bâtiments voisins', 'Estado de los edificios vecinos', 'Stan sąsiednich budynków', 'Starea clădirilor învecinate', 'Stav susedných budov'), [good, mixed, option('romos', 'Leromlott', 'Slecht', 'Poor', 'Schlecht', 'Mauvais', 'Malo', 'Zły', 'Proastă', 'Zlý')]),
  question('zavaro-letesitmeny', 3, t5('Zavaró létesítmény a közelben', 'Storende faciliteit in de buurt', 'Disturbing facility nearby', 'Störende Einrichtung in der Nähe', 'Installation gênante à proximité', 'Instalación molesta cerca', 'Uciążliwy obiekt w pobliżu', 'Obiectiv deranjant în apropiere', 'Rušivé zariadenie v blízkosti'), [yes, no]),
  question('kert-kerites', 4, t5('Kert és kerítés állapota', 'Staat van tuin en hek', 'Condition of garden and fence', 'Zustand von Garten und Zaun', 'État du jardin et de la clôture', 'Estado del jardín y de la valla', 'Stan ogrodu i ogrodzenia', 'Starea grădinii și a gardului', 'Stav záhrady a plotu'), [good, option('felujitando', 'Rendezést igényel', 'Onderhoud nodig', 'Needs tidying', 'Pflege nötig', 'À remettre en ordre', 'Necesita arreglos', 'Wymaga uporządkowania', 'Necesită amenajare', 'Potrebuje úpravu'), none]),
  question('bovites', 4, t5('Bővítési lehetőség', 'Uitbreidingsmogelijkheid', 'Room for extension', 'Erweiterungsmöglichkeit', 'Possibilité d’agrandissement', 'Posibilidad de ampliación', 'Możliwość rozbudowy', 'Posibilitate de extindere', 'Možnosť prístavby'), [yes, no]),
  question('korlatozasok', 4, t5('Ismert jogi korlátozások', 'Bekende juridische beperkingen', 'Known legal restrictions', 'Bekannte rechtliche Beschränkungen', 'Restrictions juridiques connues', 'Restricciones jurídicas conocidas', 'Znane ograniczenia prawne', 'Restricții juridice cunoscute', 'Známe právne obmedzenia'), [
    legal('haszonelvezet', t5('Haszonélvezeti jog', 'Vruchtgebruik', 'Usufruct', 'Nießbrauch', 'Usufruit', 'Usufructo', 'Użytkowanie', 'Uzufruct', 'Užívacie právo'), t5('Valaki másnak joga van használni és hasznosítani az ingatlant.', 'Iemand anders mag de woning gebruiken en de vruchten ervan genieten.', 'Someone else has the right to use the property and enjoy its fruits.', 'Eine andere Person darf die Immobilie nutzen und deren Erträge ziehen.', 'Une autre personne a le droit d’utiliser le bien et d’en percevoir les fruits.', 'Otra persona tiene derecho a usar el inmueble y a disfrutar de sus frutos.', 'Inna osoba ma prawo korzystać z nieruchomości i pobierać z niej pożytki.', 'O altă persoană are dreptul de a folosi proprietatea și de a culege fructele acesteia.', 'Iná osoba má právo nehnuteľnosť užívať a poberať z nej úžitky.')),
    legal('jelzalog', t5('Jelzálog / teher', 'Hypotheek / last', 'Mortgage / charge', 'Hypothek / Belastung', 'Hypothèque / charge', 'Hipoteca / carga', 'Hipoteka / obciążenie', 'Ipotecă / sarcină', 'Hypotéka / ťarcha'), t5('Az ingatlan hitel vagy más követelés fedezete.', 'De woning dient als onderpand voor een lening of andere vordering.', 'The property secures a loan or other claim.', 'Die Immobilie dient als Sicherheit für ein Darlehen oder eine andere Forderung.', 'Le bien garantit un prêt ou une autre créance.', 'El inmueble garantiza un préstamo u otro crédito.', 'Nieruchomość stanowi zabezpieczenie kredytu lub innej wierzytelności.', 'Proprietatea garantează un împrumut sau o altă creanță.', 'Nehnuteľnosť zabezpečuje úver alebo inú pohľadávku.')),
    legal('elovasarlas', t5('Elővásárlási jog', 'Voorkeursrecht', 'Right of pre-emption', 'Vorkaufsrecht', 'Droit de préemption', 'Derecho de tanteo', 'Prawo pierwokupu', 'Drept de preempțiune', 'Predkupné právo'), t5('Meghatározott személy a vevőt megelőzve vásárolhat.', 'Een bepaalde persoon mag vóór andere kopers kopen.', 'A specific person may buy before other buyers.', 'Eine bestimmte Person darf vor anderen Käufern kaufen.', 'Une personne déterminée peut acheter avant les autres acquéreurs.', 'Una persona concreta puede comprar antes que otros compradores.', 'Określona osoba może kupić nieruchomość przed innymi kupującymi.', 'O anumită persoană poate cumpăra înaintea altor cumpărători.', 'Určitá osoba môže kúpiť skôr ako ostatní kupujúci.')),
    legal('szolgalom', t5('Szolgalom', 'Erfdienstbaarheid', 'Easement', 'Dienstbarkeit', 'Servitude', 'Servidumbre', 'Służebność', 'Servitute', 'Vecné bremeno'), t5('Másnak joga van áthaladni vagy másként használni a telket.', 'Iemand anders mag over of anderszins gebruikmaken van het perceel.', 'Someone else may cross or otherwise use the plot.', 'Eine andere Person darf das Grundstück überqueren oder anderweitig nutzen.', 'Une autre personne peut traverser le terrain ou l’utiliser d’une autre manière.', 'Otra persona puede atravesar la parcela o usarla de otra manera.', 'Inna osoba może przechodzić przez działkę lub korzystać z niej w inny sposób.', 'O altă persoană poate traversa terenul sau îl poate folosi în alt mod.', 'Iná osoba môže cez pozemok prechádzať alebo ho inak využívať.')),
    legal('osztatlan', t5('Osztatlan közös tulajdon', 'Ongedeeld eigendom', 'Undivided co-ownership', 'Ungeteiltes Miteigentum', 'Indivision', 'Proindiviso', 'Współwłasność w częściach ułamkowych', 'Coproprietate în indiviziune', 'Podielové spoluvlastníctvo'), t5('Több tulajdonos osztozik, a részek nincsenek külön helyrajzi számon.', 'Meerdere eigenaren delen het object zonder aparte kadastrale nummers.', 'Several owners share the property, without separate land registry numbers.', 'Mehrere Eigentümer teilen sich das Objekt, ohne eigene Flurstücksnummern.', 'Plusieurs propriétaires se partagent le bien, sans numéros cadastraux distincts.', 'Varios propietarios comparten el inmueble, sin números catastrales independientes.', 'Kilku właścicieli dzieli nieruchomość bez odrębnych numerów ewidencyjnych.', 'Mai mulți proprietari dețin împreună proprietatea, fără numere cadastrale separate.', 'Nehnuteľnosť má viacero spoluvlastníkov bez samostatných parcelných čísel.')),
    legal('vedettseg', t5('Műemléki / természetvédelmi védettség', 'Beschermde status', 'Heritage / nature protection', 'Denkmal- oder Naturschutz', 'Protection patrimoniale ou naturelle', 'Protección patrimonial o natural', 'Ochrona zabytków lub przyrody', 'Protecție a patrimoniului sau a naturii', 'Pamiatková ochrana alebo ochrana prírody'), t5('Az épület vagy a terület védett, a változtatás engedélyhez kötött.', 'Gebouw of gebied is beschermd; wijzigingen vragen om toestemming.', 'The building or area is protected; changes need permission.', 'Gebäude oder Gebiet stehen unter Schutz; Änderungen brauchen eine Genehmigung.', 'Le bâtiment ou la zone est protégé ; toute modification requiert une autorisation.', 'El edificio o la zona están protegidos; cualquier modificación requiere autorización.', 'Budynek lub obszar jest chroniony; wszelkie zmiany wymagają zezwolenia.', 'Clădirea sau zona este protejată; orice modificare necesită autorizație.', 'Budova alebo oblasť je chránená; každá zmena si vyžaduje povolenie.')),
    legal('termofold', t5('Termőföld-forgalmi korlátozás', 'Landbouwgrondbeperking', 'Restriction on trading agricultural land', 'Beschränkung des Agrarlandverkehrs', 'Restriction sur la vente de terres agricoles', 'Restricción a la venta de tierras agrícolas', 'Ograniczenia w obrocie gruntami rolnymi', 'Restricții privind vânzarea terenurilor agricole', 'Obmedzenie predaja poľnohospodárskej pôdy'), t5('A földforgalmi szabályok korlátozhatják, ki veheti meg.', 'De landbouwwet kan beperken wie mag kopen.', 'Agricultural land rules may limit who can buy.', 'Die Vorschriften zum Agrarlandverkehr können einschränken, wer kaufen darf.', 'La réglementation sur les terres agricoles peut limiter qui peut acheter.', 'La normativa sobre tierras agrícolas puede limitar quién puede comprar.', 'Przepisy o gruntach rolnych mogą ograniczać krąg kupujących.', 'Reglementările privind terenurile agricole pot limita cine poate cumpăra.', 'Predpisy o poľnohospodárskej pôde môžu obmedziť, kto môže kúpiť.')),
    option('nincs', 'Nincs ismert', 'Geen bekend', 'None known', 'Keine bekannt', 'Aucune connue', 'Ninguna conocida', 'Brak znanych', 'Niciuna cunoscută', 'Žiadne známe'),
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
