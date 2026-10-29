/**
 * The catalogue of system emails — what /portal/email/system lists and edits.
 *
 * Each entry says, in the admin's words, when the email goes out and to whom,
 * which built-in copy it reads, and which sample renders its preview. The
 * wording itself stays in copy/<locale>.ts and lifecycle.ts; an admin's edit is
 * an overlay on it (system-texts.ts).
 */
import { LOCALES, type Locale } from '~/i18n/ui';
import { builtInCopy } from './templates';
import { LIFECYCLE_COPY } from './lifecycle';
import { CASES } from './samples';
import { FIXED_FUNCTIONS, PARAMS, fillTokens, toLines, tokensIn, withDraft, type TextOverlay } from './system-texts';
import type { BuiltEmail } from './templates';

export type Audience = 'owner' | 'visitor' | 'office';

export const AUDIENCE_LABEL: Record<Audience, string> = {
  owner: 'Hirdetőnek',
  visitor: 'Érdeklődőnek',
  office: 'Az irodának',
};

export type SystemMessage = {
  key: string;
  label: string;
  /** One sentence: the moment it goes out. */
  when: string;
  to: Audience;
  /** The key in samples.ts CASES that renders its preview. */
  sample: string;
  source: 'copy' | 'lifecycle';
  /** Office notices are written in Hungarian only. */
  locales?: readonly Locale[];
  /** Has its own editor with an approval step (the invite). */
  href?: string;
};

export type SystemGroup = { id: string; label: string; blurb: string; messages: SystemMessage[] };

const msg = (
  key: string, label: string, to: Audience, when: string, sample: string,
  extra: Partial<SystemMessage> = {}
): SystemMessage => ({ key, label, to, when, sample, source: key in LIFECYCLE_COPY ? 'lifecycle' : 'copy', ...extra });

export const SYSTEM_GROUPS: SystemGroup[] = [
  {
    id: 'account',
    label: 'Regisztráció és belépés',
    blurb: 'Amit a hirdető a fiókja létrehozásakor és belépéskor kap.',
    messages: [
      msg('registrationConfirm', 'Regisztráció: jelszó beállítása', 'owner', 'Amikor valaki regisztrál a honlapon. A gombbal állítja be a jelszavát.', 'registrationConfirm'),
      msg('accountExists', 'Regisztráció: ehhez a címhez már van fiók', 'owner', 'Amikor valaki olyan címmel regisztrál, amelyhez már tartozik fiók.', 'accountExists'),
      msg('welcome', 'Üdvözlő levél', 'owner', 'Amikor a hirdető először beállítja a jelszavát, és aktiválódik a fiókja.', 'welcome'),
      msg('passwordReset', 'Elfelejtett jelszó', 'owner', 'Amikor valaki új jelszót kér a belépő oldalon.', 'passwordReset'),
      msg('invite', 'Meghívó a portálra', 'owner', 'Amikor egy admin meghív valakit. A szöveget jóvá kell hagyni, ezért külön szerkesztője van.', 'invite', { href: '/portal/settings/templates', source: 'copy' }),
    ],
  },
  {
    id: 'listing',
    label: 'A hirdetés útja',
    blurb: 'A beküldéstől az élesítésig: minden lépésnél egy levél a hirdetőnek.',
    messages: [
      msg('submissionReceived', 'Hirdetés beküldve', 'owner', 'Amikor a hirdető beküldi a hirdetését elbírálásra.', 'submissionReceived'),
      msg('changesRequested', 'Javítást kérünk', 'owner', 'Amikor az elbíráló javítást kér, és a hirdetés újra szerkeszthető.', 'changesRequested'),
      msg('approvedAwaitingPayment', 'Jóváhagyva, fizetésre vár', 'owner', 'Amikor a hirdetést jóváhagyták, és a hirdetési díjra vár. Benne a fizetés gombja.', 'approvedAwaitingPayment'),
      msg('approvedPublished', 'Jóváhagyva és azonnal élesítve', 'owner', 'Amikor a hirdetés a fizetés előtt élesedik (fizetés nélküli menet).', 'approvedPublished'),
      msg('paymentReceipt', 'Fizetési visszaigazolás', 'owner', 'Amikor a bankkártyás vagy átutalásos fizetés megérkezett.', 'paymentReceipt'),
      msg('published', 'A hirdetés élesedett', 'owner', 'Amikor a hirdetés megjelenik az oldalon.', 'published'),
      msg('rejected', 'A hirdetést nem tudjuk közzétenni', 'owner', 'Amikor az elbíráló elutasítja a hirdetést, indoklással.', 'rejected'),
      msg('newEnquiry', 'Új érdeklődő a hirdetésre', 'owner', 'Amikor valaki az ingatlan oldalán üzenetet küld. Az érdeklődő adataival megy a hirdetőnek.', 'newEnquiry'),
    ],
  },
  {
    id: 'invoices',
    label: 'Számlák',
    blurb: 'A számla kiállításakor megy ki; maga a számla PDF-ben csatolva.',
    messages: [
      msg('invoiceIssued', 'Számla elkészült', 'owner', 'Amikor az admin kiállít és elküld egy számlát.', 'invoiceIssued'),
      msg('creditNoteIssued', 'Jóváíró számla', 'owner', 'Amikor egy számlához jóváíró számla készül.', 'creditNoteIssued'),
    ],
  },
  {
    id: 'lifecycle',
    label: 'Az élő hirdetés élete',
    blurb: 'Lejárat, hosszabbítás és a havi „még eladó?” kérdés. A rendszer ezeket naponta egyszer ellenőrzi.',
    messages: [
      msg('expiry', 'Lejárat előtti emlékeztető', 'owner', 'Lejárat előtt 14 és 3 nappal, hosszabbítási gombbal.', 'expiryReminder'),
      msg('expired', 'A hirdetés lejárt', 'owner', 'Amikor a hirdetés lejárt és lekerült az oldalról.', 'listingExpired'),
      msg('renewed', 'Hosszabbítás megtörtént', 'owner', 'Amikor a hosszabbítás díja megérkezett, az új lejárati dátummal.', 'listingRenewed'),
      msg('transfer', 'Hosszabbítás átutalással', 'owner', 'Amikor a hirdető átutalást választ: az átutalás adataival.', 'renewalTransfer'),
      msg('refresh', 'Havi „még eladó?” kérdés', 'owner', 'Havonta egyszer, egy héttel később emlékeztetővel. Három gomb: még eladó, változott az ár, eladtam.', 'ownerRefresh'),
    ],
  },
  {
    id: 'visitors',
    label: 'Értékbecslés és szolgáltatások',
    blurb: 'Amit az oldalon értékbecslést vagy szolgáltatást kérő látogató kap.',
    messages: [
      msg('valuationReceived', 'Értékbecslési kérés megérkezett', 'visitor', 'Amikor valaki értékbecslést kér, és a becslés még készül.', 'valuationReceived'),
      msg('valuationReady', 'Elkészült az értékbecslés', 'visitor', 'Amikor a becslés kész: az értéksávval és az adatalappal.', 'valuationReady'),
      msg('valuationDeclined', 'Értékbecslés: nem tudunk becslést adni', 'visitor', 'Amikor nincs elég összehasonlító adat, és munkatárs keresi fel személyesen.', 'valuationDeclined'),
      msg('valuationNeedsInfo', 'Értékbecslés: még adatok kellenek', 'visitor', 'Amikor az admin további adatokat kér a becsléshez.', 'valuationNeedsInfo'),
      msg('serviceRequested', 'Szolgáltatásigény megérkezett', 'visitor', 'Amikor valaki helyszíni szolgáltatást (pl. látogatást) kér.', 'serviceRequested'),
      msg('valuationPaid', 'Fizetés az értékbecslésért', 'visitor', 'Amikor az értékbecslés vagy szolgáltatás díja bankkártyával megérkezett.', 'valuationPaid'),
      msg('judicialRequested', 'Hivatalos értékbecslési igény', 'visitor', 'Amikor valaki igazságügyi szakértői becslést kér.', 'judicialRequested'),
    ],
  },
  {
    id: 'other',
    label: 'Ajánlás és hírlevél',
    blurb: 'Az ajánlói program és a hírlevél-feliratkozás megerősítése.',
    messages: [
      msg('referralRegistered', 'Köszönjük az ajánlást', 'owner', 'Amikor egy hirdető ajánlást küld valakiről.', 'referralRegistered'),
      msg('newsletter', 'Hírlevél: feliratkozás megerősítése', 'visitor', 'Amikor valaki feliratkozik a hírlevélre. A leiratkozás-sor a hírlevelek alján is ez.', 'newsletterConfirm'),
    ],
  },
  {
    id: 'office',
    label: 'Belső értesítők',
    blurb: 'Az irodának szólnak, mindig magyarul.',
    messages: [
      msg('adminNewSubmission', 'Új hirdetés vár elbírálásra', 'office', 'Amikor egy hirdető beküld egy hirdetést.', 'adminNewSubmission', { locales: ['hu'] }),
      msg('adminServiceRequested', 'Új szolgáltatásigény', 'office', 'Amikor valaki szolgáltatást vagy fizetett értékbecslést kér.', 'adminServiceRequested', { locales: ['hu'] }),
      msg('referralAdminNotice', 'Új ajánlás érkezett', 'office', 'Amikor valaki ajánlást küld a honlapon.', 'referralAdminNotice', { locales: ['hu'] }),
    ],
  },
];

export const ALL_MESSAGES: SystemMessage[] = SYSTEM_GROUPS.flatMap((group) => group.messages);

export function findMessage(key: string): SystemMessage | undefined {
  return ALL_MESSAGES.find((message) => message.key === key);
}

export function localesOf(message: SystemMessage): readonly Locale[] {
  return message.locales ?? LOCALES;
}

/* ── Fields ──────────────────────────────────────────────────────────────── */

type FieldInfo = { label: string; hint?: string };

/** What each field is called in the editor. Unlisted fields show their code name, which is a prompt to add one. */
const FIELDS: Record<string, FieldInfo> = {
  subject: { label: 'Tárgy', hint: 'A levelezőben ez áll a feladó neve mellett.' },
  preheader: { label: 'Előnézeti sor', hint: 'A tárgy mellett szürkén látszik a levelek listájában.' },
  heading: { label: 'Főcím' },
  intro: { label: 'Bevezető szöveg' },
  body: { label: 'Fő szöveg' },
  cta: { label: 'Gomb felirata' },
  ctaCard: { label: 'Bankkártyás gomb felirata' },
  viewCta: { label: 'Megtekintés gomb felirata' },
  view: { label: 'Megtekintés link felirata' },
  next: { label: 'Mi következik' },
  expiry: { label: 'Érvényesség' },
  ignore: { label: 'Ha nem Ön kérte' },
  reset: { label: 'Új jelszó kérése link' },
  note: { label: 'Megjegyzés' },
  after: { label: 'Zárósor' },
  timing: { label: 'Határidő' },
  advice: { label: 'Tanács' },
  refund: { label: 'Visszatérítés' },
  payment: { label: 'Fizetés' },
  cancel: { label: 'Ha meggondolta magát' },
  invoice: { label: 'Számla' },
  sold: { label: 'Ha időközben eladta' },
  reminder: { label: 'Emlékeztető-sor' },
  how: { label: 'Hogyan működik' },
  valid: { label: 'Linkek érvényessége' },
  still: { label: 'Gomb: még eladó' },
  price: { label: 'Gomb: változott az ár' },
  unsubscribe: { label: 'Leiratkozás link felirata' },
  why: { label: 'Miért kapja ezt a levelet', hint: 'A hírlevelek és a megerősítő levél alján áll.' },
  orderTitle: { label: 'Tételek címe' },
  discountLabel: { label: 'Kedvezmény sora' },
  totalLabel: { label: 'Végösszeg sora' },
  dueLabel: { label: 'Fizetési határidő sora' },
  paidAtLabel: { label: 'Fizetés dátuma sora' },
  cardNote: { label: 'Bankkártyás fizetés megjegyzése' },
  bankTitle: { label: 'Banki átutalás címe' },
  bankNote: { label: 'Banki átutalás megjegyzése' },
  vatNote: { label: 'Áfa megjegyzése' },
  messageTitle: { label: 'Az üzenet címe' },
  stepsTitle: { label: 'Lépések címe' },
  steps: { label: 'Lépések', hint: 'Soronként egy lépés.' },
  disclaimer: { label: 'Figyelmeztetés (kézi becslésnél)' },
  disclaimerWithCount: { label: 'Figyelmeztetés (számított becslésnél)' },
  introWithBasis: { label: 'Bevezető az adatalappal' },
  mid: { label: 'Középérték felirata' },
  basis: { label: 'Adatalap felirata' },
  rateDate: { label: 'Árfolyam dátuma felirat' },
  source: { label: 'Forrás felirat' },
  factorsHeading: { label: 'Befolyásoló szempontok címe' },
  dirPlus: { label: 'Értéknövelő' },
  dirMinus: { label: 'Értékcsökkentő' },
  dirUnsure: { label: 'Bizonytalan' },
  visit: { label: 'Helyszíni látogatás link' },
  judicial: { label: 'Igazságügyi becslés link' },
};

export const PARAM_HELP: Record<string, string> = {
  ref: 'a hirdetés azonosítója',
  title: 'a hirdetés címe',
  name: 'a címzett neve',
  referredName: 'az ajánlott személy neve',
  referrerName: 'az ajánló neve',
  number: 'a számla száma',
  correctsNumber: 'a javított számla száma',
  service: 'a szolgáltatás neve',
  price: 'az ár',
  range: 'az értéksáv',
  days: 'a hátralévő napok száma',
  date: 'a dátum',
  count: 'a hasonló ingatlanok száma',
};

/** Placeholders that stand for a count: a language may inflect the sentence around them (Romanian "14 zile" / "20 de zile"). */
const NUMERIC_PARAMS = new Set(['days', 'count']);
const COUNTS = [2, 3, 5, 14]; // the day counts the reminders go out at, and a few more

/**
 * Can this built-in sentence be edited as plain text with placeholders? Only if
 * filling the written-out placeholders reproduces what the built-in function
 * says, for whatever values arrive; a sentence whose wording depends on the
 * number in it (plural forms) stays as built.
 */
function isPlainSentence(fn: (...args: unknown[]) => unknown, names: string[], written: string): boolean {
  const numeric = names.filter((name) => NUMERIC_PARAMS.has(name));
  for (const count of numeric.length ? COUNTS : [0]) {
    const values = names.map((name) => (NUMERIC_PARAMS.has(name) ? count : `«${name}»`));
    if (String(fn(...values)) !== fillTokens(written, names, values)) return false;
  }
  return true;
}

/** Fields the layout needs untouched: a code, not words. */
const NOT_WORDS = new Set(['ctaUrl']);

export type EditableField = {
  field: string;
  label: string;
  hint?: string;
  kind: 'line' | 'text' | 'list';
  /** Placeholders this field may carry, with what each stands for. */
  params: { name: string; help: string }[];
  /** The built-in wording, with the placeholders written out as {{name}}. */
  builtIn: string;
};

/** The built-in copy for (key, locale), before any edit. */
function builtInFor(message: SystemMessage, locale: Locale): Record<string, unknown> | undefined {
  if (message.source === 'lifecycle') {
    return (LIFECYCLE_COPY as Record<string, Record<string, Record<string, unknown>>>)[message.key]?.[locale];
  }
  return (builtInCopy(locale) as unknown as Record<string, Record<string, unknown>>)[message.key];
}

/** The fields of one email in one language that an admin can edit, in the order they read. */
export function editableFields(message: SystemMessage, locale: Locale): EditableField[] {
  const base = builtInFor(message, locale);
  if (!base) return [];
  const out: EditableField[] = [];
  for (const [field, value] of Object.entries(base)) {
    if (NOT_WORDS.has(field)) continue;
    const id = `${message.key}.${field}`;
    const names = PARAMS[id] ?? [];
    let builtIn: string;
    let kind: EditableField['kind'];
    if (typeof value === 'string') {
      builtIn = value;
      kind = 'line';
    } else if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      builtIn = (value as string[]).join('\n');
      kind = 'list';
    } else if (typeof value === 'function' && !FIXED_FUNCTIONS.has(id) && PARAMS[id]) {
      const fn = value as (...args: unknown[]) => unknown;
      builtIn = String(fn(...names.map((name) => `{{${name}}}`)));
      if (!isPlainSentence(fn, names, builtIn)) continue;
      kind = 'line';
    } else {
      continue;
    }
    if (kind === 'line' && (builtIn.length > 90 || builtIn.includes('\n'))) kind = 'text';
    const info = FIELDS[field] ?? { label: field };
    out.push({
      field,
      label: info.label,
      hint: info.hint,
      kind,
      params: names.map((name) => ({ name, help: PARAM_HELP[name] ?? name })),
      builtIn,
    });
  }
  return out;
}

/* ── Saving ──────────────────────────────────────────────────────────────── */

const LIMIT = { line: 400, text: 3000, list: 3000 } as const;

const normal = (kind: EditableField['kind'], text: string) =>
  kind === 'list' ? toLines(text).join('\n') : kind === 'line' ? text.replace(/\s*\n\s*/g, ' ').trim() : text.replace(/\r\n/g, '\n').trim();

export type OverlayResult = { ok: true; overlay: TextOverlay } | { ok: false; error: string; field?: string };

/**
 * What to store for the fields the editor sent: only those that differ from the
 * built-in wording. An empty field or an unknown placeholder is refused with a
 * message naming the field — an email must never go out with a hole in it.
 */
export function overlayFrom(message: SystemMessage, locale: Locale, sent: Record<string, unknown>): OverlayResult {
  const fields = editableFields(message, locale);
  const overlay: TextOverlay = {};
  for (const item of fields) {
    const raw = sent[item.field];
    if (typeof raw !== 'string') continue;
    const text = normal(item.kind, raw);
    if (!text) return { ok: false, field: item.field, error: `„${item.label}”: a mező nem maradhat üresen. A „Visszaállítás” az eredeti szöveget hozza vissza.` };
    if (text.length > LIMIT[item.kind]) return { ok: false, field: item.field, error: `„${item.label}”: túl hosszú (legfeljebb ${LIMIT[item.kind]} karakter).` };
    const allowed = new Set(item.params.map((param) => param.name));
    const stray = tokensIn(text).find((name) => !allowed.has(name));
    if (stray) {
      return {
        ok: false,
        field: item.field,
        error: allowed.size
          ? `„${item.label}”: ismeretlen beszúrható rész: {{${stray}}}. Ebben a mezőben ezek használhatók: ${[...allowed].map((name) => `{{${name}}}`).join(', ')}.`
          : `„${item.label}”: ebben a mezőben nem használható beszúrható rész ({{${stray}}}).`,
      };
    }
    if (text !== normal(item.kind, item.builtIn)) overlay[item.field] = text;
  }
  return { ok: true, overlay };
}

/* ── Preview ─────────────────────────────────────────────────────────────── */

/** The email as it would be sent with `fields` applied (saved or still being typed), on sample data. */
export async function previewMessage(message: SystemMessage, locale: Locale, fields: TextOverlay | null): Promise<BuiltEmail | null> {
  const build = CASES[message.sample];
  if (!build) return null;
  const email = fields ? withDraft(message.key, locale, fields, () => build(locale)) : build(locale);
  return await email;
}
