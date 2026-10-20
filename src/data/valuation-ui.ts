/**
 * Every string of the valuation request page, in all five languages: the form
 * the visitor fills in and the messages its script shows. The script gets the
 * page's own language as one JSON attribute (see ValuationPage.astro), so no
 * language ships the others' text.
 *
 * Values the form posts (slugs like `nem-tudom`) are language-neutral and live
 * in valuation-questions.ts. French spacing:   before ":" and ";" and in
 * « »,   before "?" and "!".
 */
import type { L10n } from '~/i18n/ui';

export interface ValuationUi {
  metaTitle: string;
  metaDescription: string;
  serviceName: string;
  eyebrow: string;
  title: string;
  titleEm: string;
  body: string;
  notice: string;
  steps: [string, string, string, string, string];
  progress: string;
  next: string;
  back: string;
  submit: string;
  successTitle: string;
  successBody: string;
  unknown: string;

  step1Intro: string;
  typeLegend: string;
  settlement: string;
  settlementHint: string;
  addressPrivate: string;
  floorArea: string;
  plotArea: string;
  bedrooms: string;
  bathrooms: string;
  parcels: string;

  step2Intro: string;
  yearBuilt: string;
  renovatedYear: string;
  renovationExtent: string;
  extentFull: string;
  extentPartial: string;
  extentNone: string;
  condition: string;
  heating: string;
  epc: string;

  step3Intro: string;

  step4Intro: string;
  features: string;
  legalHint: string;
  restrictionsNote: string;
  factorsLegend: string;
  factorsHint: string;
  addFactor: string;

  photos: string;
  photosHint: string;
  docs: string;
  docsHint: string;
  requestLegend: string;
  hintVisit: string;
  hintCard: string;
  hintOfficial: string;

  /* messages the script shows */
  factor: string;
  direction: string;
  removeRow: string;
  dirUnsure: string;
  dirPlus: string;
  dirMinus: string;
  docMax: string;
  docTooBig: string;
  docFailed: string;
  docPending: string;
  docUploaded: string;
  retry: string;
  paid: string;
  resultHeading: string;
  mid: string;
  basisCounty: string;
  basisTown: string;
  basisListings: string;
  source: string;
  rateDate: string;
  noRate: string;
  factorsHeading: string;
  postAd: string;
  visit: string;
  judicial: string;
  received: string;
}

export const VALUATION_UI: L10n<ValuationUi> = {
  hu: {
    metaTitle: 'Értékmeghatározás | FODEL',
    metaDescription: 'Részletes, tájékoztató piaci értékmeghatározás.',
    serviceName: 'Értékmeghatározás',
    eyebrow: 'Értékmeghatározás',
    title: 'Mennyit ér',
    titleEm: 'az ingatlana?',
    body: 'Adja meg az ismert adatokat. Munkatársunk ellenőrzi az eredményt, és e-mailben küldi.',
    notice: 'Tájékoztató, piaci alapú értékmeghatározás. Az eredmény nem hivatalos szakvélemény.',
    steps: ['Ingatlan', 'Épület és műszaki állapot', 'Környezet', 'Extrák és korlátok', 'Fotók és elérhetőség'],
    progress: 'Űrlap lépései',
    next: 'Tovább',
    back: 'Vissza',
    submit: 'Kérelem elküldése',
    successTitle: 'Köszönjük!',
    successBody: 'Munkatársunk ellenőrzi az adatokat, és e-mailben küldi a tájékoztató eredményt.',
    unknown: 'Nem tudom',
    step1Intro: 'Csak az ingatlan típusa, települése és alapterülete kötelező.',
    typeLegend: 'Ingatlan típusa',
    settlement: 'Település',
    settlementHint: 'Kezdjen gépelni. Ha nincs a listában, szabadon megadhatja.',
    addressPrivate: 'Pontos cím (csak munkatársunknak)',
    floorArea: 'Hasznos alapterület',
    plotArea: 'Telekterület',
    bedrooms: 'Szobák',
    bathrooms: 'Fürdőszobák',
    parcels: 'Helyrajzi számok',
    step2Intro: 'Minden kérdés kihagyható. A „Nem tudom” külön válasz.',
    yearBuilt: 'Építés éve',
    renovatedYear: 'Felújítás éve',
    renovationExtent: 'Felújítás mértéke',
    extentFull: 'Teljes',
    extentPartial: 'Részleges',
    extentNone: 'Nem volt',
    condition: 'Állapot',
    heating: 'Fűtés',
    epc: 'Energetikai osztály',
    step3Intro: 'A környezet területhasználatát és épületeit kérdezzük.',
    step4Intro: 'Az extrák és korlátozások tájékoztató adatok; ezekből nem számítunk automatikus értékmódosítást.',
    features: 'Melléképületek és extrák',
    legalHint: 'Csak az Ön által ismert körülményeket jelölje. Ez nem jogi tanács.',
    restrictionsNote: 'Egyéb korlátozás vagy megjegyzés',
    factorsLegend: 'Egyéb értéket befolyásoló szempontok',
    factorsHint: 'Adjon hozzá külön sorokat. A besorolás tájékoztató, nem számítás.',
    addFactor: '+ Szempont hozzáadása',
    photos: 'Fényképek (legfeljebb 6)',
    photosHint: 'JPG, PNG vagy WebP. A képeket küldés előtt kicsinyítjük; csak munkatársunk látja.',
    docs: 'Dokumentumok (alaprajz, építési engedély, tulajdoni lap, energetikai tanúsítvány…)',
    docsHint: 'Legfeljebb 15 fájl, egyenként 50 MB-ig. Közvetlenül, tömörítés nélkül töltődnek fel; csak munkatársunk látja őket.',
    requestLegend: 'Milyen értékmeghatározást kér?',
    hintVisit: 'Helyszíni kérésnél munkatársunk felveszi Önnel a kapcsolatot az időpont egyeztetéséhez.',
    hintCard: ' Fix árú csomagnál a kérés elküldése után azonnal bankkártyával is fizethet.',
    hintOfficial: ' Hivatalos kérésnél árat és határidőt csak árajánlat után vállalunk.',
    factor: 'Szempont',
    direction: 'Irány',
    removeRow: 'Sor törlése',
    dirUnsure: 'Nem tudom',
    dirPlus: 'Értéknövelő',
    dirMinus: 'Értékcsökkentő',
    docMax: 'Legfeljebb 15 fájl tölthető fel.',
    docTooBig: 'Túl nagy (legfeljebb 50 MB).',
    docFailed: 'Nem sikerült. Ellenőrizze a fájltípust, vagy próbálja újra.',
    docPending: 'A dokumentumok még töltődnek fel. Kérjük, várjon.',
    docUploaded: 'Feltöltve',
    retry: 'Nem sikerült, próbálja újra',
    paid: 'Köszönjük, a fizetés megérkezett. Visszaigazolást e-mailben küldünk.',
    resultHeading: 'Tájékoztató értékmeghatározás',
    mid: 'Középérték',
    basisCounty: 'vármegyei adat',
    basisTown: 'települési adat',
    basisListings: 'hasonló FODEL-hirdetés',
    source: 'Forrás',
    rateDate: 'Árfolyam dátuma',
    noRate: '',
    factorsHeading: 'Értéket befolyásoló szempontok',
    postAd: 'Hirdetés feladása',
    visit: 'Gábor helyszíni látogatása',
    judicial: 'Igazságügyi értékbecslés kérése',
    received: 'Igényét rögzítettük',
  },

  nl: {
    metaTitle: 'Waardebepaling | FODEL',
    metaDescription: 'Uitgebreide, indicatieve marktwaardebepaling.',
    serviceName: 'Waardebepaling',
    eyebrow: 'Waardebepaling',
    title: 'Wat is uw woning',
    titleEm: 'waard?',
    body: 'Vul in wat u weet. Onze medewerker controleert het resultaat en stuurt het per e-mail.',
    notice: 'Indicatieve, marktgebaseerde waardebepaling. Het resultaat is geen officieel taxatierapport.',
    steps: ['Woning', 'Gebouw en technische staat', 'Omgeving', 'Extra’s en beperkingen', 'Foto’s en contact'],
    progress: 'Formulierstappen',
    next: 'Verder',
    back: 'Terug',
    submit: 'Aanvraag versturen',
    successTitle: 'Dank u wel!',
    successBody: 'Onze medewerker controleert de gegevens en stuurt de indicatieve uitkomst per e-mail.',
    unknown: 'Weet ik niet',
    step1Intro: 'Alleen woningtype, plaats en woonoppervlak zijn verplicht.',
    typeLegend: 'Type woning',
    settlement: 'Plaats',
    settlementHint: 'Begin te typen. Staat de plaats niet in de lijst, vul hem zelf in.',
    addressPrivate: 'Exact adres (alleen voor onze medewerker)',
    floorArea: 'Woonoppervlak',
    plotArea: 'Perceeloppervlak',
    bedrooms: 'Kamers',
    bathrooms: 'Badkamers',
    parcels: 'Kadastrale percelen',
    step2Intro: 'Alle vragen zijn optioneel. “Weet ik niet” wordt apart opgeslagen.',
    yearBuilt: 'Bouwjaar',
    renovatedYear: 'Renovatiejaar',
    renovationExtent: 'Omvang renovatie',
    extentFull: 'Volledig',
    extentPartial: 'Gedeeltelijk',
    extentNone: 'Geen',
    condition: 'Staat',
    heating: 'Verwarming',
    epc: 'Energielabel',
    step3Intro: 'Deze vragen gaan over grondgebruik en gebouwen in de omgeving.',
    step4Intro: 'Extra’s en beperkingen zijn ter informatie; ze leiden niet automatisch tot een prijsaanpassing.',
    features: 'Bijgebouwen en extra’s',
    legalHint: 'Vink alleen aan wat u weet. Dit is geen juridisch advies.',
    restrictionsNote: 'Andere beperking of opmerking',
    factorsLegend: 'Andere factoren die de waarde beïnvloeden',
    factorsHint: 'Voeg aparte regels toe. De richting is informatief, geen berekening.',
    addFactor: '+ Factor toevoegen',
    photos: 'Foto’s (maximaal 6)',
    photosHint: 'JPG, PNG of WebP. Foto’s worden vóór verzending verkleind en zijn alleen zichtbaar voor ons team.',
    docs: 'Documenten (plattegrond, bouwvergunning, eigendomsbewijs, energielabel…)',
    docsHint: 'Maximaal 15 bestanden van elk 50 MB. Ze worden rechtstreeks en ongecomprimeerd geüpload en zijn alleen zichtbaar voor ons team.',
    requestLegend: 'Welke waardebepaling wenst u?',
    hintVisit: 'Bij een bezoek nemen wij contact op om een afspraak te maken.',
    hintCard: ' Bij een pakket met vaste prijs kunt u na het versturen meteen met kaart betalen.',
    hintOfficial: ' Voor een officiële taxatie geven wij vooraf geen prijs of termijn.',
    factor: 'Factor',
    direction: 'Richting',
    removeRow: 'Rij verwijderen',
    dirUnsure: 'Onzeker',
    dirPlus: 'Verhogend',
    dirMinus: 'Verlagend',
    docMax: 'Maximaal 15 bestanden.',
    docTooBig: 'Te groot (maximaal 50 MB).',
    docFailed: 'Mislukt. Controleer het bestandstype of probeer opnieuw.',
    docPending: 'De documenten worden nog geüpload. Even geduld.',
    docUploaded: 'Geüpload',
    retry: 'Mislukt, probeer opnieuw',
    paid: 'Dank u, uw betaling is ontvangen. U ontvangt een bevestiging per e-mail.',
    resultHeading: 'Indicatieve waardebepaling',
    mid: 'Middenwaarde',
    basisCounty: 'provinciegegevens',
    basisTown: 'plaatsgegevens',
    basisListings: 'vergelijkbare FODEL-advertenties',
    source: 'Bron',
    rateDate: 'Wisselkoersdatum',
    noRate: 'Geen actuele EUR/HUF koers ingesteld; bedragen worden in HUF getoond.',
    factorsHeading: 'Factoren',
    postAd: 'Advertentie plaatsen',
    visit: 'Bezoek van Gábor',
    judicial: 'Officiële taxatie aanvragen',
    received: 'Aanvraag ontvangen',
  },

  en: {
    metaTitle: 'Valuation | FODEL',
    metaDescription: 'A detailed, indicative market valuation.',
    serviceName: 'Valuation',
    eyebrow: 'Valuation',
    title: 'What is your',
    titleEm: 'property worth?',
    body: 'Tell us what you know. One of our team checks the result and sends it by email.',
    notice: 'An indicative, market-based valuation. The result is not an official valuation report.',
    steps: ['Property', 'Building and technical condition', 'Surroundings', 'Extras and restrictions', 'Photos and contact'],
    progress: 'Form steps',
    next: 'Next',
    back: 'Back',
    submit: 'Send request',
    successTitle: 'Thank you',
    successBody: 'One of our team will check the details and email you the indicative result.',
    unknown: 'I don’t know',
    step1Intro: 'Only the type of property, the town and the floor area are required.',
    typeLegend: 'Type of property',
    settlement: 'Town or village',
    settlementHint: 'Start typing. If it is not in the list, enter it yourself.',
    addressPrivate: 'Exact address (for our team only)',
    floorArea: 'Floor area',
    plotArea: 'Plot area',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    parcels: 'Land registry parcels',
    step2Intro: 'Every question is optional. “I don’t know” is stored as its own answer.',
    yearBuilt: 'Year built',
    renovatedYear: 'Year of renovation',
    renovationExtent: 'Extent of renovation',
    extentFull: 'Full',
    extentPartial: 'Partial',
    extentNone: 'None',
    condition: 'Condition',
    heating: 'Heating',
    epc: 'Energy rating',
    step3Intro: 'These questions are about the land use and buildings around the property.',
    step4Intro: 'Extras and restrictions are for information; they do not automatically change the price.',
    features: 'Outbuildings and extras',
    legalHint: 'Tick only what you know. This is not legal advice.',
    restrictionsNote: 'Other restriction or comment',
    factorsLegend: 'Other factors that affect the value',
    factorsHint: 'Add separate lines. The direction is informative, not a calculation.',
    addFactor: '+ Add a factor',
    photos: 'Photos (up to 6)',
    photosHint: 'JPG, PNG or WebP. Photos are reduced in size before sending and are visible only to our team.',
    docs: 'Documents (floor plan, building permit, title deed, energy certificate…)',
    docsHint: 'Up to 15 files of 50 MB each. They are uploaded directly and uncompressed, and are visible only to our team.',
    requestLegend: 'Which valuation would you like',
    hintVisit: 'For a visit, we will contact you to arrange a date.',
    hintCard: ' For a fixed-price package you can also pay by card straight after sending.',
    hintOfficial: ' For an official valuation we give no price or deadline until we have made a quote.',
    factor: 'Factor',
    direction: 'Direction',
    removeRow: 'Remove row',
    dirUnsure: 'Unsure',
    dirPlus: 'Raises the value',
    dirMinus: 'Lowers the value',
    docMax: 'No more than 15 files.',
    docTooBig: 'Too large (50 MB at most).',
    docFailed: 'That did not work. Check the file type or try again.',
    docPending: 'The documents are still uploading. Please wait.',
    docUploaded: 'Uploaded',
    retry: 'That did not work, try again',
    paid: 'Thank you, your payment has arrived. You will receive a confirmation by email.',
    resultHeading: 'Indicative valuation',
    mid: 'Midpoint',
    basisCounty: 'county data',
    basisTown: 'town data',
    basisListings: 'comparable FODEL listings',
    source: 'Source',
    rateDate: 'Exchange rate date',
    noRate: 'No current EUR/HUF rate is set; amounts are shown in HUF.',
    factorsHeading: 'Factors',
    postAd: 'Place a listing',
    visit: 'A visit from Gábor',
    judicial: 'Request an official valuation',
    received: 'Request received',
  },

  de: {
    metaTitle: 'Bewertung | FODEL',
    metaDescription: 'Eine ausführliche, unverbindliche Marktwertbestimmung.',
    serviceName: 'Bewertung',
    eyebrow: 'Bewertung',
    title: 'Was ist Ihre',
    titleEm: 'Immobilie wert?',
    body: 'Geben Sie an, was Sie wissen. Ein Mitarbeiter prüft das Ergebnis und schickt es per E-Mail.',
    notice: 'Unverbindliche, marktbasierte Wertbestimmung. Das Ergebnis ist kein amtliches Gutachten.',
    steps: ['Immobilie', 'Gebäude und technischer Zustand', 'Umgebung', 'Ausstattung und Beschränkungen', 'Fotos und Kontakt'],
    progress: 'Formularschritte',
    next: 'Weiter',
    back: 'Zurück',
    submit: 'Anfrage senden',
    successTitle: 'Vielen Dank',
    successBody: 'Ein Mitarbeiter prüft die Angaben und schickt Ihnen das unverbindliche Ergebnis per E-Mail.',
    unknown: 'Weiß ich nicht',
    step1Intro: 'Pflicht sind nur Immobilienart, Ort und Wohnfläche.',
    typeLegend: 'Immobilienart',
    settlement: 'Ort',
    settlementHint: 'Beginnen Sie zu tippen. Steht der Ort nicht in der Liste, geben Sie ihn selbst ein.',
    addressPrivate: 'Genaue Adresse (nur für unser Team)',
    floorArea: 'Wohnfläche',
    plotArea: 'Grundstücksfläche',
    bedrooms: 'Schlafzimmer',
    bathrooms: 'Badezimmer',
    parcels: 'Flurstücke',
    step2Intro: 'Alle Fragen sind freiwillig. „Weiß ich nicht“ wird als eigene Antwort gespeichert.',
    yearBuilt: 'Baujahr',
    renovatedYear: 'Jahr der Renovierung',
    renovationExtent: 'Umfang der Renovierung',
    extentFull: 'Vollständig',
    extentPartial: 'Teilweise',
    extentNone: 'Keine',
    condition: 'Zustand',
    heating: 'Heizung',
    epc: 'Energieklasse',
    step3Intro: 'Diese Fragen betreffen die Flächennutzung und die Gebäude in der Umgebung.',
    step4Intro: 'Ausstattung und Beschränkungen dienen der Information; sie führen nicht automatisch zu einer Preisanpassung.',
    features: 'Nebengebäude und Extras',
    legalHint: 'Kreuzen Sie nur an, was Sie wissen. Dies ist keine Rechtsberatung.',
    restrictionsNote: 'Weitere Beschränkung oder Anmerkung',
    factorsLegend: 'Weitere Faktoren, die den Wert beeinflussen',
    factorsHint: 'Fügen Sie einzelne Zeilen hinzu. Die Richtung ist eine Information, keine Berechnung.',
    addFactor: '+ Faktor hinzufügen',
    photos: 'Fotos (höchstens 6)',
    photosHint: 'JPG, PNG oder WebP. Die Fotos werden vor dem Senden verkleinert und sind nur für unser Team sichtbar.',
    docs: 'Unterlagen (Grundriss, Baugenehmigung, Grundbuchauszug, Energieausweis…)',
    docsHint: 'Höchstens 15 Dateien von je 50 MB. Sie werden direkt und unkomprimiert hochgeladen und sind nur für unser Team sichtbar.',
    requestLegend: 'Welche Bewertung wünschen Sie',
    hintVisit: 'Bei einem Besuch melden wir uns, um einen Termin zu vereinbaren.',
    hintCard: ' Bei einem Paket mit Festpreis können Sie nach dem Absenden sofort per Karte zahlen.',
    hintOfficial: ' Bei einem amtlichen Gutachten nennen wir Preis und Frist erst nach einem Angebot.',
    factor: 'Faktor',
    direction: 'Richtung',
    removeRow: 'Zeile entfernen',
    dirUnsure: 'Unsicher',
    dirPlus: 'Wertsteigernd',
    dirMinus: 'Wertmindernd',
    docMax: 'Höchstens 15 Dateien.',
    docTooBig: 'Zu groß (höchstens 50 MB).',
    docFailed: 'Das hat nicht geklappt. Prüfen Sie den Dateityp oder versuchen Sie es erneut.',
    docPending: 'Die Unterlagen werden noch hochgeladen. Bitte warten Sie einen Moment.',
    docUploaded: 'Hochgeladen',
    retry: 'Das hat nicht geklappt, bitte erneut versuchen',
    paid: 'Vielen Dank, Ihre Zahlung ist eingegangen. Sie erhalten eine Bestätigung per E-Mail.',
    resultHeading: 'Unverbindliche Wertbestimmung',
    mid: 'Mittelwert',
    basisCounty: 'Komitatsdaten',
    basisTown: 'Ortsdaten',
    basisListings: 'vergleichbare FODEL-Inserate',
    source: 'Quelle',
    rateDate: 'Datum des Wechselkurses',
    noRate: 'Es ist kein aktueller EUR/HUF-Kurs hinterlegt; Beträge werden in HUF angezeigt.',
    factorsHeading: 'Faktoren',
    postAd: 'Inserat aufgeben',
    visit: 'Besuch von Gábor',
    judicial: 'Amtliches Gutachten anfordern',
    received: 'Anfrage erhalten',
  },

  fr: {
    metaTitle: 'Estimation | FODEL',
    metaDescription: 'Une estimation détaillée et indicative de la valeur de marché.',
    serviceName: 'Estimation',
    eyebrow: 'Estimation',
    title: 'Que vaut',
    titleEm: 'votre bien ?',
    body: 'Indiquez ce que vous savez. Un collaborateur vérifie le résultat et vous l’envoie par e-mail.',
    notice: 'Estimation indicative, fondée sur le marché. Le résultat n’est pas une expertise officielle.',
    steps: ['Le bien', 'Bâtiment et état technique', 'Environnement', 'Équipements et restrictions', 'Photos et coordonnées'],
    progress: 'Étapes du formulaire',
    next: 'Suivant',
    back: 'Retour',
    submit: 'Envoyer la demande',
    successTitle: 'Merci',
    successBody: 'Un collaborateur vérifie les informations et vous envoie le résultat indicatif par e-mail.',
    unknown: 'Je ne sais pas',
    step1Intro: 'Seuls le type de bien, la localité et la surface habitable sont obligatoires.',
    typeLegend: 'Type de bien',
    settlement: 'Localité',
    settlementHint: 'Commencez à saisir. Si la localité n’est pas dans la liste, indiquez-la vous-même.',
    addressPrivate: 'Adresse exacte (réservée à notre équipe)',
    floorArea: 'Surface habitable',
    plotArea: 'Surface du terrain',
    bedrooms: 'Chambres',
    bathrooms: 'Salles de bains',
    parcels: 'Parcelles cadastrales',
    step2Intro: 'Toutes les questions sont facultatives. « Je ne sais pas » est enregistré comme une réponse à part.',
    yearBuilt: 'Année de construction',
    renovatedYear: 'Année de rénovation',
    renovationExtent: 'Ampleur de la rénovation',
    extentFull: 'Complète',
    extentPartial: 'Partielle',
    extentNone: 'Aucune',
    condition: 'État',
    heating: 'Chauffage',
    epc: 'Classe énergétique',
    step3Intro: 'Ces questions portent sur l’occupation des sols et les bâtiments alentour.',
    step4Intro: 'Les équipements et restrictions sont donnés à titre d’information ; ils ne modifient pas automatiquement le prix.',
    features: 'Dépendances et équipements',
    legalHint: 'Ne cochez que ce que vous savez. Ceci n’est pas un conseil juridique.',
    restrictionsNote: 'Autre restriction ou remarque',
    factorsLegend: 'Autres facteurs qui influencent la valeur',
    factorsHint: 'Ajoutez des lignes séparées. L’orientation est indicative, ce n’est pas un calcul.',
    addFactor: '+ Ajouter un facteur',
    photos: 'Photos (6 au maximum)',
    photosHint: 'JPG, PNG ou WebP. Les photos sont réduites avant l’envoi et visibles uniquement par notre équipe.',
    docs: 'Documents (plan, permis de construire, titre de propriété, certificat énergétique…)',
    docsHint: 'Jusqu’à 15 fichiers de 50 Mo chacun. Ils sont téléversés directement et sans compression, et visibles uniquement par notre équipe.',
    requestLegend: 'Quelle estimation souhaitez-vous',
    hintVisit: 'Pour une visite, nous vous contactons afin de fixer un rendez-vous.',
    hintCard: ' Pour un forfait à prix fixe, vous pouvez aussi payer par carte juste après l’envoi.',
    hintOfficial: ' Pour une expertise officielle, nous n’indiquons ni prix ni délai avant d’avoir établi un devis.',
    factor: 'Facteur',
    direction: 'Sens',
    removeRow: 'Supprimer la ligne',
    dirUnsure: 'Incertain',
    dirPlus: 'Augmente la valeur',
    dirMinus: 'Diminue la valeur',
    docMax: '15 fichiers au maximum.',
    docTooBig: 'Trop volumineux (50 Mo au maximum).',
    docFailed: 'Échec. Vérifiez le type de fichier ou réessayez.',
    docPending: 'Les documents sont encore en cours de téléversement. Veuillez patienter.',
    docUploaded: 'Téléversé',
    retry: 'Échec, veuillez réessayer',
    paid: 'Merci, votre paiement est bien arrivé. Vous recevrez une confirmation par e-mail.',
    resultHeading: 'Estimation indicative',
    mid: 'Valeur médiane',
    basisCounty: 'données du comitat',
    basisTown: 'données de la localité',
    basisListings: 'annonces FODEL comparables',
    source: 'Source',
    rateDate: 'Date du taux de change',
    noRate: 'Aucun taux EUR/HUF actuel n’est défini ; les montants sont affichés en HUF.',
    factorsHeading: 'Facteurs',
    postAd: 'Déposer une annonce',
    visit: 'Visite de Gábor',
    judicial: 'Demander une expertise officielle',
    received: 'Demande reçue',
  },
};
