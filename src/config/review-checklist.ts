/**
 * The listing review checklist (brief 3 §G.1) — ONE config for the criteria,
 * the minimum photo count and the owner-facing phrases a failed criterion
 * adds to the change request.
 *
 * Ticking a failed criterion on /portal/review/[id] writes its phrase, in the
 * owner's own language, into the change-request note; the admin can still
 * edit the text before sending. The note lands in the changes-requested
 * email after "munkatársunk az alábbi megjegyzést fűzte:", so each phrase is
 * a complete, polite request on its own line.
 *
 * MIN_PHOTOS is a proposal (5) for Gábor and Éva to confirm — it is a
 * checklist hint for the reviewer, never an automatic block.
 */
import { LOW_RESOLUTION_EDGE } from '~/lib/media';

export const MIN_PHOTOS = 5;

export type ChecklistLocale = 'hu' | 'nl' | 'en';

export type ChecklistItem = {
  id: string;
  group: 'photos' | 'data';
  /** What the reviewer checks, in Hungarian (admin UI). */
  label: string;
  /** The request sent to the owner when this criterion fails. */
  ask: Record<ChecklistLocale, string>;
};

export const CHECKLIST_GROUP_LABEL: Record<ChecklistItem['group'], string> = {
  photos: 'Fotók',
  data: 'Adatok',
};

export const CHECKLIST: ChecklistItem[] = [
  {
    id: 'photos-count',
    group: 'photos',
    label: `Legalább ${MIN_PHOTOS} kép`,
    ask: {
      hu: `Kérjük, töltsön fel legalább ${MIN_PHOTOS} fényképet az ingatlanról.`,
      nl: `Upload alstublieft minimaal ${MIN_PHOTOS} foto’s van de woning.`,
      en: `Please upload at least ${MIN_PHOTOS} photos of the property.`,
    },
  },
  {
    id: 'photos-daylight',
    group: 'photos',
    label: 'Nappali fényben, világos képek',
    ask: {
      hu: 'Kérjük, a sötét képeket cserélje nappali fényben, lehetőleg napsütésben készült fotókra, felkapcsolt lámpákkal.',
      nl: 'Vervang de donkere foto’s alstublieft door foto’s bij daglicht, liefst bij zon, met het licht aan.',
      en: 'Please replace the dark photos with photos taken in daylight, ideally in sunshine, with the lights on.',
    },
  },
  {
    id: 'photos-horizontal',
    group: 'photos',
    label: 'Vízszintes (fekvő) képek',
    ask: {
      hu: 'Kérjük, a függőleges (álló) képeket cserélje fekvő helyzetben, vízszintesen tartott telefonnal készült fotókra.',
      nl: 'Vervang de staande foto’s alstublieft door foto’s die met een horizontaal (liggend) gehouden telefoon zijn gemaakt.',
      en: 'Please replace the portrait photos with photos taken with the phone held horizontally (landscape).',
    },
  },
  {
    id: 'photos-sharp',
    group: 'photos',
    label: 'Éles, nem bemozdult képek',
    ask: {
      hu: 'Néhány kép életlen vagy homályos. Kérjük, törölje meg a lencsét, tartsa stabilan a telefont, és készítse el újra.',
      nl: 'Enkele foto’s zijn onscherp of wazig. Veeg de lens schoon, houd de telefoon stil en maak ze opnieuw.',
      en: 'Some photos are out of focus or blurred. Please wipe the lens, hold the phone steady and take them again.',
    },
  },
  {
    id: 'photos-no-people',
    group: 'photos',
    label: 'Nincs ember a képen',
    ask: {
      hu: 'Kérjük, cserélje azokat a képeket, amelyeken ember látható (tükörben is).',
      nl: 'Vervang alstublieft de foto’s waarop mensen te zien zijn (ook in een spiegel).',
      en: 'Please replace the photos in which people can be seen (including in a mirror).',
    },
  },
  {
    id: 'photos-rooms',
    group: 'photos',
    label: 'Minden fontos helyiség és a homlokzat szerepel',
    ask: {
      hu: 'Kérjük, mutassa be az összes fontos helyiséget és a homlokzatot is — a szoba sarkából, mellmagasságból fotózva.',
      nl: 'Laat alstublieft alle belangrijke ruimtes en de gevel zien — gefotografeerd vanuit een hoek, op borsthoogte.',
      en: 'Please show all the important rooms and the façade, photographed from a corner of the room at chest height.',
    },
  },
  {
    id: 'data-price',
    group: 'data',
    label: 'Ár megadva, reális',
    ask: {
      hu: 'Kérjük, ellenőrizze és adja meg az irányárat forintban és euróban.',
      nl: 'Controleer alstublieft de vraagprijs en vul deze in forint en euro in.',
      en: 'Please check the asking price and enter it in forints and euros.',
    },
  },
  {
    id: 'data-area',
    group: 'data',
    label: 'Alapterület és telekméret',
    ask: {
      hu: 'Kérjük, adja meg a lakóterületet és a telek méretét négyzetméterben.',
      nl: 'Vul alstublieft het woonoppervlak en de perceelgrootte in vierkante meters in.',
      en: 'Please enter the living area and the plot size in square metres.',
    },
  },
  {
    id: 'data-settlement',
    group: 'data',
    label: 'Település, megye helyes',
    ask: {
      hu: 'Kérjük, ellenőrizze a település és a megye nevét.',
      nl: 'Controleer alstublieft de plaats en het comitaat.',
      en: 'Please check the name of the town or village and the county.',
    },
  },
  {
    id: 'data-description',
    group: 'data',
    label: 'Leírás teljes',
    ask: {
      hu: 'Kérjük, egészítse ki a leírást: az épület állapota, a helyiségek, a telek, a környék és a megközelítés.',
      nl: 'Vul de omschrijving alstublieft aan: staat van het gebouw, de ruimtes, het perceel, de omgeving en de bereikbaarheid.',
      en: 'Please complete the description: the condition of the building, the rooms, the plot, the surroundings and how to get there.',
    },
  },
  {
    id: 'data-category',
    group: 'data',
    label: 'Kategória helyes',
    ask: {
      hu: 'Kérjük, ellenőrizze az ingatlan típusát (kategóriáját).',
      nl: 'Controleer alstublieft het type (de categorie) van de woning.',
      en: 'Please check the type (category) of the property.',
    },
  },
];

export const CHECKLIST_WRAP: Record<ChecklistLocale, { lead: string }> = {
  hu: { lead: 'Mielőtt közzétesszük, kérjük, javítsa az alábbiakat:' },
  nl: { lead: 'Voordat wij de advertentie publiceren, vragen wij u het volgende aan te passen:' },
  en: { lead: 'Before we publish the listing, please change the following:' },
};

/* ── Automatic photo hints (brief 3 §G.2) ─────────────────────────────── */
// From property_media.width/height. Hints, never blockers: a portrait shot of
// a tower or a staircase can be exactly right. People in photos need a human.

type Sized = { width: number | null; height: number | null };

/** Clearly taller than wide (5% tolerance for a slightly cropped landscape). */
export function isPortrait(photo: Sized): boolean {
  return Boolean(photo.width && photo.height && photo.height > photo.width * 1.05);
}

export function isLowResolution(photo: Sized): boolean {
  return Boolean(photo.width && photo.height && Math.max(photo.width, photo.height) < LOW_RESOLUTION_EDGE);
}

export function photoHints(photos: Sized[]) {
  return {
    portrait: photos.filter(isPortrait).length,
    lowResolution: photos.filter(isLowResolution).length,
    tooFew: photos.length < MIN_PHOTOS,
  };
}
