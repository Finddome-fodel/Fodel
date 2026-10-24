/**
 * Photo tips — ONE source for the three moments an owner needs them
 * (brief 3 §E): the full guide page (/hu/fotozasi-utmutato, /nl/fotografiegids),
 * the listing editor at the moment of upload, and the public submit page.
 *
 * The six top tips merge Éva and Gábor's list (2026-09-29: daylight and sun,
 * tidying, curtains open, whole rooms from the right angle, wipe the lens,
 * phone horizontal, no people) with the guide FODEL already published on
 * fodel.hu. Written for a layperson with a phone: one action per tip.
 */
import { ONSITE_SERVICES } from '~/config/company';
import { eur } from '~/lib/format';
import type { Locale } from '~/i18n/ui';
import type { Section } from '~/lib/content-sections';

/** Kept as an alias for components that still import the old name. */
export type TipLocale = Locale;

export type PhotoTip = {
  id: string;
  /** Key of the small line icon drawn by PhotoTips.astro. */
  icon: 'sun' | 'tidy' | 'curtain' | 'corner' | 'phone' | 'nobody';
  title: Record<Locale, string>;
  body: Record<Locale, string>;
};

export const TOP_TIPS: PhotoTip[] = [
  {
    id: 'daylight',
    icon: 'sun',
    title: { hu: 'Nappal, napsütésben', nl: 'Overdag, bij zon', en: 'In daylight, in the sun', de: 'Bei Tageslicht und Sonne', fr: 'De jour, au soleil' },
    body: {
      hu: 'Világos, lehetőleg napsütéses időben fotózzon, és kapcsoljon fel minden lámpát.',
      nl: 'Fotografeer bij daglicht, liefst bij zonnig weer, en doe overal het licht aan.',
      en: 'Take photos in good daylight, ideally in sunny weather, and switch on every light.',
      de: 'Fotografieren Sie bei Tageslicht, am besten bei sonnigem Wetter, und schalten Sie überall das Licht ein.',
      fr: 'Photographiez en pleine lumière du jour, de préférence par temps ensoleillé, et allumez toutes les lampes.',
    },
  },
  {
    id: 'tidy',
    icon: 'tidy',
    title: { hu: 'Előbb rendrakás', nl: 'Eerst opruimen', en: 'Tidy up first', de: 'Erst aufräumen', fr: 'Rangez d’abord' },
    body: {
      hu: 'Rakjon rendet, és pakolja el a személyes tárgyakat. A vevő a házat nézze, ne a holmit.',
      nl: 'Ruim op en haal persoonlijke spullen weg. De koper moet het huis zien, niet de spullen.',
      en: 'Tidy up and put personal belongings away. Buyers should see the house, not your things.',
      de: 'Räumen Sie auf und stellen Sie persönliche Gegenstände weg. Der Käufer soll das Haus sehen, nicht Ihre Sachen.',
      fr: 'Rangez et mettez les objets personnels de côté. L’acheteur doit voir la maison, pas vos affaires.',
    },
  },
  {
    id: 'curtains',
    icon: 'curtain',
    title: { hu: 'Függönyök elhúzva', nl: 'Gordijnen open', en: 'Curtains open', de: 'Vorhänge auf', fr: 'Rideaux ouverts' },
    body: {
      hu: 'Húzza el a függönyöket, és húzza fel a redőnyöket. Minden fény számít.',
      nl: 'Trek gordijnen open en rolluiken omhoog. Elk beetje licht telt.',
      en: 'Draw the curtains back and raise the shutters. Every bit of light counts.',
      de: 'Ziehen Sie die Vorhänge auf und die Rollläden hoch. Jedes bisschen Licht zählt.',
      fr: 'Ouvrez les rideaux et relevez les volets. Chaque rayon de lumière compte.',
    },
  },
  {
    id: 'whole-room',
    icon: 'corner',
    title: { hu: 'Az egész helyiség', nl: 'De hele ruimte', en: 'The whole room', de: 'Der ganze Raum', fr: 'La pièce entière' },
    body: {
      hu: 'Álljon a szoba sarkába, és mellmagasságból fotózzon, hogy az egész helyiség látszódjon.',
      nl: 'Ga in een hoek van de kamer staan en fotografeer op borsthoogte, zodat de hele ruimte in beeld is.',
      en: 'Stand in a corner of the room and shoot at chest height, so the whole room is in the frame.',
      de: 'Stellen Sie sich in eine Zimmerecke und fotografieren Sie auf Brusthöhe, damit der ganze Raum im Bild ist.',
      fr: 'Placez-vous dans un angle de la pièce et photographiez à hauteur de poitrine, pour que toute la pièce soit dans le cadre.',
    },
  },
  {
    id: 'horizontal',
    icon: 'phone',
    title: { hu: 'Fekvő telefon, tiszta lencse', nl: 'Liggende telefoon, schone lens', en: 'Phone on its side, clean lens', de: 'Handy quer, Linse sauber', fr: 'Téléphone à l’horizontale, objectif propre' },
    body: {
      hu: 'Tartsa a telefont vízszintesen (fekvő helyzetben), és előtte törölje meg a lencsét.',
      nl: 'Houd de telefoon horizontaal (liggend) en veeg eerst de lens schoon.',
      en: 'Hold the phone horizontally (landscape) and wipe the lens first.',
      de: 'Halten Sie das Handy quer (im Querformat) und wischen Sie zuerst die Linse sauber.',
      fr: 'Tenez le téléphone à l’horizontale (en mode paysage) et essuyez d’abord l’objectif.',
    },
  },
  {
    id: 'no-people',
    icon: 'nobody',
    title: { hu: 'Ember nélkül', nl: 'Zonder mensen', en: 'No people', de: 'Ohne Personen', fr: 'Sans personne' },
    body: {
      hu: 'A képeken ne szerepeljen ember: Ön se, a tükörben sem.',
      nl: 'Zorg dat er niemand op de foto staat: ook u niet, ook niet in de spiegel.',
      en: 'Make sure nobody is in the photo: not you either, not even in a mirror.',
      de: 'Achten Sie darauf, dass niemand auf dem Foto zu sehen ist: auch Sie nicht, auch nicht im Spiegel.',
      fr: 'Veillez à ce que personne n’apparaisse sur la photo, vous non plus, même dans un miroir.',
    },
  },
];

export const WHY_IT_MATTERS: Record<Locale, string> = {
  hu: 'A vevők többsége külföldről, a képek alapján dönt arról, hogy felveszi-e a kapcsolatot és vállalja-e az utat a megtekintésre. A jó fénykép közvetlenül több érdeklődést jelent.',
  nl: 'De meeste kopers zitten in het buitenland en besluiten op basis van de foto’s of ze contact opnemen en de reis voor een bezichtiging maken. Goede foto’s leveren direct meer interesse op.',
  en: 'Most buyers live abroad and decide from the photos whether to get in touch and whether to make the trip for a viewing. Good photos bring more interest straight away.',
  de: 'Die meisten Käufer leben im Ausland und entscheiden anhand der Fotos, ob sie sich melden und die Reise zur Besichtigung antreten. Gute Fotos wecken sofort mehr Interesse.',
  fr: 'La plupart des acheteurs vivent à l’étranger et décident d’après les photos de vous contacter ou non, et de faire le déplacement pour une visite. De bonnes photos suscitent tout de suite plus d’intérêt.',
};

/** The detailed guide, grouped as on the guide page. */
export const GUIDE_SECTIONS: { title: Record<Locale, string>; items: Record<Locale, string[]> }[] = [
  {
    title: { hu: 'Előkészület', nl: 'Voorbereiding', en: 'Preparation', de: 'Vorbereitung', fr: 'Préparation' },
    items: {
      hu: [
        'Fényképezés előtt mindig rakjon rendet, és teljesen világosítsa ki a lakást.',
        'Pakolja el a személyes holmikat minden helyiségből.',
        'A kertben nyírja le a füvet a fotózás előtt.',
        'Kapcsolja ki a készüléken a dátumbélyegzőt.',
        'Törölje meg a telefon lencséjét. A zsíros, homályos lencse a leggyakoribb oka a fátyolos képnek.',
      ],
      nl: [
        'Ruim op en doe overal het licht aan voordat u fotografeert.',
        'Haal persoonlijke spullen uit beeld.',
        'Maai het gras voordat u de tuin fotografeert.',
        'Zet de datumstempel op uw toestel uit.',
        'Veeg de lens van uw telefoon schoon. Een vettige lens is de meest voorkomende oorzaak van wazige foto’s.',
      ],
      en: [
        'Tidy up and switch on every light before you start.',
        'Remove personal belongings from view.',
        'Mow the lawn before photographing the garden.',
        'Turn off the date stamp on your camera.',
        'Wipe your phone’s lens. A greasy lens is the most common cause of hazy photos.',
      ],
      de: [
        'Räumen Sie auf und schalten Sie überall das Licht ein, bevor Sie fotografieren.',
        'Entfernen Sie persönliche Gegenstände aus dem Bild.',
        'Mähen Sie den Rasen, bevor Sie den Garten fotografieren.',
        'Schalten Sie den Datumsstempel Ihrer Kamera aus.',
        'Wischen Sie die Linse Ihres Handys sauber. Eine fettige Linse ist die häufigste Ursache für verschleierte Fotos.',
      ],
      fr: [
        'Rangez et allumez toutes les lumières avant de photographier.',
        'Retirez les objets personnels du champ.',
        'Tondez la pelouse avant de photographier le jardin.',
        'Désactivez l’horodatage de votre appareil.',
        'Essuyez l’objectif de votre téléphone. Un objectif gras est la cause la plus fréquente des photos voilées.',
      ],
    },
  },
  {
    title: { hu: 'Megvilágítás', nl: 'Licht', en: 'Light', de: 'Licht', fr: 'Lumière' },
    items: {
      hu: [
        'Napsütéses időben fényképezzen, kívül és belül egyaránt.',
        'Borult, alkonyati vagy sötétedés utáni fotózást kerülje.',
        'Kapcsolja fel a belső világítást minden helyiségben.',
        'Húzza el a függönyöket, húzza fel a sötétítőket és a redőnyöket.',
        'A vaku használatát mindenképpen kerülje el.',
      ],
      nl: [
        'Fotografeer bij zonnig weer, binnen én buiten.',
        'Vermijd bewolking, schemer en avond.',
        'Doe in elke ruimte het licht aan.',
        'Trek gordijnen open en rolluiken omhoog.',
        'Gebruik in geen geval de flitser.',
      ],
      en: [
        'Shoot in sunny weather, inside and out.',
        'Avoid overcast skies, dusk and evening.',
        'Switch on the lights in every room.',
        'Draw the curtains back and raise the blinds and shutters.',
        'Never use the flash.',
      ],
      de: [
        'Fotografieren Sie bei sonnigem Wetter, drinnen wie draußen.',
        'Meiden Sie bewölkten Himmel, Dämmerung und Abend.',
        'Schalten Sie in jedem Raum das Licht ein.',
        'Ziehen Sie die Vorhänge auf und die Jalousien und Rollläden hoch.',
        'Verwenden Sie auf keinen Fall den Blitz.',
      ],
      fr: [
        'Photographiez par temps ensoleillé, à l’intérieur comme à l’extérieur.',
        'Évitez le ciel couvert, le crépuscule et la soirée.',
        'Allumez la lumière dans chaque pièce.',
        'Ouvrez les rideaux et relevez les stores et les volets.',
        'N’utilisez jamais le flash.',
      ],
    },
  },
  {
    title: { hu: 'Géptartás és kompozíció', nl: 'Compositie', en: 'Framing and composition', de: 'Bildaufbau', fr: 'Cadrage et composition' },
    items: {
      hu: [
        'Mindig vízszintesen (fekvő helyzetben) tartsa a telefont. Függőleges tájolású képet ne készítsen.',
        'Álljon a helyiség sarkába, és mellmagasságból fotózzon: így az egész szoba látszik.',
        'A vízszintes síkokat igazítsa párhuzamosan a kijelző felső szélével.',
        'Ha szűk a látószög, lépjen hátrébb.',
        'Kertes ház esetén készítsen felülnézeti, madártávlati képet is.',
        'Homlokzatnál mutassa be a teljes épületet.',
        'Kerülje, hogy nagy felületet foglaljon el az aszfalt, a mennyezet vagy a kerítés.',
        'A képeken ne szerepeljen ember: tükörben, ablaküvegben sem.',
      ],
      nl: [
        'Houd het toestel altijd horizontaal (liggend). Maak geen staande foto’s.',
        'Ga in een hoek van de ruimte staan en fotografeer op borsthoogte: zo is de hele kamer in beeld.',
        'Lijn horizontale vlakken uit met de bovenrand van het scherm.',
        'Doe een stap achteruit als de ruimte niet in beeld past.',
        'Maak bij een vrijstaand huis ook een opname van bovenaf.',
        'Breng bij de gevel het hele gebouw in beeld.',
        'Vermijd dat asfalt, plafond of schutting het beeld domineert.',
        'Zorg dat er niemand op de foto staat: ook niet in een spiegel of ruit.',
      ],
      en: [
        'Always hold the phone horizontally (landscape). Do not take portrait photos.',
        'Stand in a corner of the room and shoot at chest height, so the whole room is in the frame.',
        'Line up horizontal surfaces with the top edge of the screen.',
        'If the room will not fit, take a step back.',
        'For a detached house, also take a photo from above.',
        'For the facade, show the whole building.',
        'Avoid shots dominated by asphalt, ceiling or fence.',
        'Make sure nobody is in the photos, not even in a mirror or a window.',
      ],
      de: [
        'Halten Sie das Handy immer quer (im Querformat). Machen Sie keine Hochformat-Aufnahmen.',
        'Stellen Sie sich in eine Ecke des Raums und fotografieren Sie auf Brusthöhe, so ist das ganze Zimmer im Bild.',
        'Richten Sie waagerechte Flächen an der Oberkante des Displays aus.',
        'Passt der Raum nicht ins Bild, gehen Sie einen Schritt zurück.',
        'Machen Sie bei einem frei stehenden Haus auch eine Aufnahme von oben.',
        'Zeigen Sie bei der Fassade das ganze Gebäude.',
        'Vermeiden Sie Bilder, die von Asphalt, Decke oder Zaun beherrscht werden.',
        'Achten Sie darauf, dass niemand im Bild ist, auch nicht in einem Spiegel oder Fenster.',
      ],
      fr: [
        'Tenez toujours le téléphone à l’horizontale (en mode paysage). Ne prenez pas de photos en mode portrait.',
        'Placez-vous dans un angle de la pièce et photographiez à hauteur de poitrine : toute la pièce est alors dans le cadre.',
        'Alignez les surfaces horizontales sur le bord supérieur de l’écran.',
        'Si la pièce ne tient pas dans le cadre, reculez d’un pas.',
        'Pour une maison individuelle, prenez aussi une photo en vue plongeante.',
        'Pour la façade, montrez le bâtiment en entier.',
        'Évitez les cadrages dominés par l’asphalte, le plafond ou la clôture.',
        'Veillez à ce que personne n’apparaisse sur les photos, pas même dans un miroir ou une vitre.',
      ],
    },
  },
  {
    title: { hu: 'Képminőség', nl: 'Beeldkwaliteit', en: 'Image quality', de: 'Bildqualität', fr: 'Qualité des images' },
    items: {
      hu: [
        'Mindig aktuális képeket töltsön fel, ne elavultakat.',
        'Használjon eredeti, nagyfelbontású fájlokat: legalább 3 megapixel, legalább 1500 pixel szélesség.',
        'Ne e-mailben továbbküldött, tömörített változatot töltsön fel.',
        'Exponálás előtt vegyen mély levegőt, és tartsa vissza egy másodpercig, így nem mozdul be a kép.',
        'A feldolgozás után egyesével ellenőrizze a képek élességét.',
      ],
      nl: [
        'Gebruik actuele foto’s, geen oude.',
        'Upload de originele bestanden: minimaal 3 megapixel en 1500 pixels breed.',
        'Stuur geen via e-mail gecomprimeerde versies door.',
        'Adem in en houd één seconde uw adem in voordat u afdrukt; dat scheelt bewegingsonscherpte.',
        'Controleer achteraf elke foto op scherpte.',
      ],
      en: [
        'Use current photos, not old ones.',
        'Upload the original files: at least 3 megapixels and 1,500 pixels wide.',
        'Do not upload versions compressed by email.',
        'Breathe in and hold your breath for a second as you press the button; it prevents motion blur.',
        'Check every photo for sharpness afterwards.',
      ],
      de: [
        'Verwenden Sie aktuelle Fotos, keine alten.',
        'Laden Sie die Originaldateien hoch: mindestens 3 Megapixel und 1.500 Pixel Breite.',
        'Laden Sie keine per E-Mail komprimierten Versionen hoch.',
        'Atmen Sie ein und halten Sie beim Auslösen eine Sekunde den Atem an; das verhindert Verwackeln.',
        'Prüfen Sie anschließend jedes Foto auf Schärfe.',
      ],
      fr: [
        'Utilisez des photos récentes, pas des anciennes.',
        'Téléversez les fichiers d’origine : au moins 3 mégapixels et 1 500 pixels de large.',
        'Ne téléversez pas de versions compressées par e-mail.',
        'Inspirez et retenez votre souffle une seconde au moment de déclencher ; cela évite le flou de bougé.',
        'Vérifiez ensuite la netteté de chaque photo.',
      ],
    },
  },
  {
    title: { hu: 'A leggyakoribb hibák', nl: 'De meestgemaakte fouten', en: 'The most common mistakes', de: 'Die häufigsten Fehler', fr: 'Les erreurs les plus fréquentes' },
    items: {
      hu: [
        'Borús időben készült, lehangoló hatású képek',
        'Túl sötét beltéri felvételek',
        'Ferde, csálé kompozíció',
        'Életlen, bemozdult vagy homályos fotók',
        'Alacsony felbontású vagy függőleges tájolású képek',
        'Emberek a képen',
        'Ismétlődő, felesleges felvételek',
      ],
      nl: [
        'Sombere foto’s bij bewolkt weer',
        'Te donkere binnenopnamen',
        'Scheve compositie',
        'Onscherpe, bewogen of wazige foto’s',
        'Foto’s met een lage resolutie of staand formaat',
        'Mensen in beeld',
        'Herhalende, overbodige opnamen',
      ],
      en: [
        'Gloomy photos taken in overcast weather',
        'Interior shots that are too dark',
        'Crooked framing',
        'Blurred, shaky or hazy photos',
        'Low-resolution or portrait-format photos',
        'People in the picture',
        'Repetitive, unnecessary shots',
      ],
      de: [
        'Trübe Fotos bei bewölktem Wetter',
        'Zu dunkle Innenaufnahmen',
        'Schiefer Bildaufbau',
        'Unscharfe, verwackelte oder verschleierte Fotos',
        'Fotos mit niedriger Auflösung oder im Hochformat',
        'Personen im Bild',
        'Wiederholte, überflüssige Aufnahmen',
      ],
      fr: [
        'Photos ternes prises par temps couvert',
        'Prises de vue intérieures trop sombres',
        'Cadrages de travers',
        'Photos floues, bougées ou voilées',
        'Photos de faible résolution ou en format portrait',
        'Personnes sur les photos',
        'Prises de vue répétitives ou inutiles',
      ],
    },
  },
];

/** "Helyszíni profi fotózás…: € 150" lines for the guide page callout. */
export function onsiteServiceLines(locale: Locale): string[] {
  return ONSITE_SERVICES.map((service) => `${service.names[locale]}: ${eur(service.priceEur, locale)}`);
}

/** The photo guide page is built from the tips above: the one source the
 *  listing editor and the submit page read too (brief 3 §E). */
export function photoGuideSections(
  locale: Locale,
  t: { topTitle: string; calloutTitle: string; calloutBody: (lines: string[]) => string; ctaTitle: string; primary: string; secondary: string }
): Section[] {
  return [
    { type: 'list', title: t.topTitle, intro: WHY_IT_MATTERS[locale], items: TOP_TIPS.map((tip) => `${tip.title[locale]}${locale === 'fr' ? '\u00a0' : ''}: ${tip.body[locale]}`), ordered: true },
    ...GUIDE_SECTIONS.map((section): Section => ({ type: 'list', title: section.title[locale], items: section.items[locale] })),
    { type: 'callout', title: t.calloutTitle, body: t.calloutBody(onsiteServiceLines(locale)) },
    { type: 'cta', title: t.ctaTitle, primary: { label: t.primary, to: 'submitAd' }, secondary: { label: t.secondary, to: 'priceList' } },
  ];
}

/** Brief-specific upload advice; the established public guide is retained. */
export const UPLOAD_TIPS:PhotoTip[]=[
 TOP_TIPS[0],TOP_TIPS[1],TOP_TIPS[3],
 {...TOP_TIPS[4],body:{hu:'Törölje meg a lencsét, tartsa stabilan a telefont, és ellenőrizze, hogy a kép éles-e.',nl:'Veeg de lens schoon, houd de telefoon stil en controleer of de foto scherp is.',en:'Wipe the lens, hold the phone steady, and check that the photo is sharp.',de:'Reinigen Sie die Linse, halten Sie das Handy ruhig und prüfen Sie die Bildschärfe.',fr:'Nettoyez l’objectif, stabilisez le téléphone et vérifiez la netteté de la photo.'}},
 {id:'exterior',icon:'corner',title:{hu:'Kert és melléképületek',nl:'Tuin en bijgebouwen',en:'Garden and outbuildings',de:'Garten und Nebengebäude',fr:'Jardin et dépendances'},body:{hu:'Mutassa meg az ingatlan fontos részeit, a kertet és a melléképületeket is.',nl:'Laat de belangrijkste delen zien, ook de tuin en de bijgebouwen.',en:'Show the important parts of the property, including the garden and outbuildings.',de:'Zeigen Sie die wichtigen Bereiche, auch den Garten und die Nebengebäude.',fr:'Montrez les parties importantes du bien, y compris le jardin et les dépendances.'}},
 TOP_TIPS[5],
];
