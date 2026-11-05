/**
 * The browser side of autosave: wires a listing form to the rules in autosave.ts, shows the state in the
 * <AutosaveStatus> line, keeps the backup in localStorage, saves when the tab is hidden or closed, and tries
 * again when the connection comes back. Used by the full editor and by the guided setup.
 */
import { backupVerdict, createAutosave, parseBackup, type Autosave, type AutosaveState, type SendResult } from './autosave';

export type AutosaveLang = 'hu' | 'nl' | 'en';

export type AutosaveCopy = {
  dirty: string;
  saving: string;
  saved: string;
  savedAt: string;
  offline: string;
  rejected: string;
  retry: string;
  restored: string;
  askText: string;
  askRestore: string;
  askDiscard: string;
  signedOut: string;
};

/** Words that never change with the page, in the three languages of the seller portal. */
export const AUTOSAVE_COPY: Record<AutosaveLang, AutosaveCopy> = {
  hu: {
    dirty: 'Módosítások rögzítése…',
    saving: 'Mentés…',
    saved: 'Minden módosítás mentve',
    savedAt: 'Utoljára mentve: {time}',
    offline: 'Nincs kapcsolat. A módosításai ebben a böngészőben biztonságban vannak; amint a kapcsolat visszatér, magunktól mentjük őket.',
    rejected: 'Ezt a módosítást még nem sikerült menteni.',
    retry: 'Újra',
    restored: 'Visszaállítottuk az utolsó, még el nem mentett módosításait.',
    askText: 'Ezen az eszközön van egy mentetlen változat, amely eltér a mentettől. Mit szeretne tenni?',
    askRestore: 'Visszaállítás',
    askDiscard: 'Elvetés',
    signedOut: 'A munkamenet lejárt. Jelentkezzen be újra; a módosításait ebben a böngészőben megőriztük.',
  },
  nl: {
    dirty: 'Wijzigingen worden vastgelegd…',
    saving: 'Opslaan…',
    saved: 'Alle wijzigingen zijn opgeslagen',
    savedAt: 'Laatst opgeslagen: {time}',
    offline: 'Geen verbinding. Uw wijzigingen staan veilig in deze browser; zodra de verbinding terug is, slaan we ze vanzelf op.',
    rejected: 'Deze wijziging kon nog niet worden opgeslagen.',
    retry: 'Opnieuw',
    restored: 'We hebben uw laatste, nog niet opgeslagen wijzigingen teruggezet.',
    askText: 'Op dit apparaat staat een niet-opgeslagen versie die afwijkt van de opgeslagen. Wat wilt u doen?',
    askRestore: 'Terugzetten',
    askDiscard: 'Weggooien',
    signedOut: 'Uw sessie is verlopen. Log opnieuw in; uw wijzigingen zijn in deze browser bewaard.',
  },
  en: {
    dirty: 'Recording changes…',
    saving: 'Saving…',
    saved: 'All changes saved',
    savedAt: 'Last saved: {time}',
    offline: 'No connection. Your changes are safe in this browser; as soon as the connection returns we save them ourselves.',
    rejected: 'This change could not be saved yet.',
    retry: 'Retry',
    restored: 'We restored your last changes that had not been saved yet.',
    askText: 'This device holds an unsaved version that differs from the saved one. What would you like to do?',
    askRestore: 'Restore it',
    askDiscard: 'Discard it',
    signedOut: 'Your session has ended. Sign in again; your changes are kept in this browser.',
  },
};

/** The names a form sends that are not the person's content: left out of the snapshot, so they never count as a change. */
const NOT_CONTENT = new Set(['step', 'partial', 'next', 'autosave']);

/** The form's values as one stable string (a query string, in form order). Files and passwords never go in. */
export function snapshotOf(form: HTMLFormElement): string {
  const out = new URLSearchParams();
  for (const [name, value] of new FormData(form)) {
    if (typeof value !== 'string' || NOT_CONTENT.has(name)) continue;
    const control = form.elements.namedItem(name);
    if (control instanceof HTMLInputElement && (control.type === 'password' || control.hasAttribute('data-autosave-skip'))) continue;
    out.append(name, value);
  }
  return out.toString();
}

/** Puts a snapshot's values back into the form, firing the events the page's own widgets listen to. */
export function applySnapshot(form: HTMLFormElement, snapshot: string): void {
  const values = new Map<string, string[]>();
  for (const [name, value] of new URLSearchParams(snapshot)) values.set(name, [...(values.get(name) ?? []), value]);
  for (const [name, list] of values) {
    const controls = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${CSS.escape(name)}"]`)];
    for (const control of controls) {
      if (control instanceof HTMLInputElement && (control.type === 'checkbox' || control.type === 'radio')) {
        const on = list.includes(control.value);
        if (control.checked !== on) { control.checked = on; control.dispatchEvent(new Event('change', { bubbles: true })); }
      } else if (control instanceof HTMLSelectElement && control.multiple) {
        for (const option of control.options) option.selected = list.includes(option.value);
        control.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (control.value !== list[0]) {
        control.value = list[0] ?? '';
        control.dispatchEvent(new Event('input', { bubbles: true }));
        control.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }
}

/* ── The status line ──────────────────────────────────────────────────── */

const RANK: Record<AutosaveState['kind'], number> = { saved: 0, dirty: 1, saving: 2, retrying: 3, rejected: 4 };

/**
 * Drives one <AutosaveStatus> element. Several forms (the setup's steps) may report to it; it shows the most
 * worrying state among them, so one failed step is never hidden by another that saved.
 */
export function statusLine(root: HTMLElement, copy: AutosaveCopy, lang: AutosaveLang, onRetry: () => void) {
  const main = root.querySelector<HTMLElement>('[data-as-main]')!;
  const detail = root.querySelector<HTMLElement>('[data-as-detail]')!;
  const live = root.querySelector<HTMLElement>('[data-as-live]')!;
  const retry = root.querySelector<HTMLButtonElement>('[data-as-retry]')!;
  const states = new Map<string, AutosaveState>();
  let lastSaved: number | null = null;
  const clock = new Intl.DateTimeFormat({ hu: 'hu-HU', nl: 'nl-NL', en: 'en-GB' }[lang], { hour: '2-digit', minute: '2-digit' });
  retry.addEventListener('click', onRetry);

  const render = () => {
    let worst: AutosaveState = { kind: 'saved', at: lastSaved ?? Date.now() };
    for (const state of states.values()) if (RANK[state.kind] > RANK[worst.kind]) worst = state;
    if (worst.kind === 'saved') lastSaved = Math.max(lastSaved ?? 0, ...[...states.values()].map((s) => (s.kind === 'saved' ? s.at : 0)));
    root.dataset.state = worst.kind;
    const hasSaved = worst.kind === 'saved' && lastSaved !== null && root.dataset.touched === 'yes';
    main.textContent = { saved: copy.saved, dirty: copy.dirty, saving: copy.saving, retrying: copy.offline, rejected: worst.kind === 'rejected' && worst.message ? worst.message : copy.rejected }[worst.kind];
    detail.textContent = worst.kind === 'saved' && hasSaved ? copy.savedAt.replace('{time}', clock.format(lastSaved!)) : worst.kind === 'rejected' ? copy.rejected : '';
    detail.hidden = !detail.textContent;
    if (worst.kind === 'rejected' && !worst.message) detail.hidden = true;
    retry.hidden = worst.kind !== 'retrying';
    // Only the settled states are read aloud; typing must not chatter.
    if (worst.kind === 'saved' && hasSaved) live.textContent = copy.saved;
    else if (worst.kind === 'retrying') live.textContent = copy.offline;
    else if (worst.kind === 'rejected') live.textContent = main.textContent;
  };
  return {
    report(key: string, state: AutosaveState) {
      states.set(key, state);
      if (state.kind !== 'saved') root.dataset.touched = 'yes';
      render();
    },
  };
}

/* ── Binding a form ───────────────────────────────────────────────────── */

export type BindOptions = {
  form: HTMLFormElement;
  /** Where the values go. The server answers `{ ok: true, updatedAt? }` or `{ ok: false, message? }`. */
  send: (snapshot: string, keepalive: boolean) => Promise<SendResult & { updatedAt?: string | null }>;
  storageKey: string;
  base: string | null;
  /** The form writes only its own fields (a setup step): another save never makes its backup stale. */
  disjoint?: boolean;
  report: (state: AutosaveState) => void;
  copy: AutosaveCopy;
  /** Puts the restore notice above the form. */
  notice: (element: HTMLElement) => void;
};

/**
 * Starts autosave on one form. Returns the controller (for „Continue”: flush) and a function that tells
 * whether a submit must wait for a save still in flight.
 */
export function bindForm(options: BindOptions): { autosave: Autosave; flush: () => Promise<boolean> } {
  const { form, copy } = options;
  const store = {
    get: () => { try { return localStorage.getItem(options.storageKey); } catch { return null; } },
    set: (value: string) => localStorage.setItem(options.storageKey, value),
    remove: () => { try { localStorage.removeItem(options.storageKey); } catch { /* blocked storage */ } },
  };
  const shown = snapshotOf(form);
  let keepalive = false;
  const autosave = createAutosave({
    read: () => snapshotOf(form),
    send: async (snapshot) => {
      // A request may outlive the page only when it is small enough for the browser to allow it (64 KB in all).
      const result = await options.send(snapshot, keepalive && new Blob([snapshot]).size < 60_000);
      if (result.ok && result.updatedAt) autosave.setBase(result.updatedAt);
      return result;
    },
    onState: options.report,
    store,
    base: options.base,
  });

  // A backup left by an earlier visit: the server never got what it holds.
  const backup = parseBackup(store.get());
  let verdict = backupVerdict(backup, shown, options.base);
  if (options.disjoint && verdict === 'ask') verdict = 'restore';
  if (verdict === 'same') store.remove();
  else if (backup && verdict === 'restore') {
    applySnapshot(form, backup.snapshot);
    const note = document.createElement('p');
    note.className = 'notice ok';
    note.setAttribute('role', 'status');
    note.textContent = copy.restored;
    options.notice(note);
    autosave.touch('change');
  } else if (backup && verdict === 'ask') {
    const box = document.createElement('div');
    box.className = 'notice warn';
    box.setAttribute('role', 'group');
    const text = document.createElement('p');
    text.textContent = copy.askText;
    const restore = document.createElement('button');
    restore.type = 'button';
    restore.className = 'btn small';
    restore.textContent = copy.askRestore;
    const discard = document.createElement('button');
    discard.type = 'button';
    discard.className = 'btn ghost small';
    discard.textContent = copy.askDiscard;
    restore.addEventListener('click', () => { applySnapshot(form, backup.snapshot); box.remove(); autosave.touch('change'); });
    discard.addEventListener('click', () => { store.remove(); box.remove(); });
    box.append(text, restore, ' ', discard);
    options.notice(box);
  }

  // Values the page filled in from what the server already holds (not the person's edits): see Autosave.adopt.
  form.addEventListener('autosave:adopt', (event) => {
    const names: string[] = (event as CustomEvent).detail?.names ?? [];
    autosave.adopt((confirmed) => {
      const params = new URLSearchParams(confirmed);
      for (const name of names) {
        const control = form.elements.namedItem(name);
        if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) params.set(name, control.value);
      }
      return params.toString();
    });
  });
  form.addEventListener('input', () => autosave.touch('input'));
  form.addEventListener('change', () => autosave.touch('change'));
  window.addEventListener('online', () => autosave.retryNow());
  // Hidden tab (switching apps on a phone) or leaving the page: save now; a short body may travel after the page is gone.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && autosave.unsaved()) void autosave.flush(); });
  window.addEventListener('pagehide', () => {
    if (!autosave.unsaved()) return;
    keepalive = true;
    void autosave.flush();
  });
  return { autosave, flush: () => autosave.flush() };
}

/** POSTs a snapshot as a form and reads the answer into a SendResult; the connection failing or the server erroring is worth retrying. */
export async function postSnapshot(
  url: string,
  snapshot: string,
  extra: Record<string, string>,
  keepalive: boolean,
  signedOut: string,
): Promise<SendResult & { updatedAt?: string | null }> {
  const body = new FormData();
  for (const [name, value] of new URLSearchParams(snapshot)) body.append(name, value);
  for (const [name, value] of Object.entries(extra)) body.set(name, value);
  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', headers: { Accept: 'application/json' }, body, keepalive, credentials: 'same-origin' });
  } catch {
    return { ok: false, retry: true };
  }
  // A lapsed sign-in is answered with the login page (a redirect) or a 401/403: say so, do not retry for ever.
  if (res.redirected || res.status === 401 || res.status === 403) return { ok: false, retry: false, message: signedOut };
  const json = await res.json().catch(() => null) as { ok?: boolean; message?: string; updatedAt?: string | null; error?: string } | null;
  if (res.ok && json?.ok) return { ok: true, updatedAt: json.updatedAt ?? null };
  // The sign-in lapsed, the listing changed hands or status: nothing a retry fixes. Server errors and gateway timeouts are worth another try.
  if (res.status >= 500 || res.status === 408 || res.status === 429 || !json) return { ok: false, retry: true };
  return { ok: false, retry: false, message: json.message };
}
