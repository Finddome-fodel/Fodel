/**
 * Autosave for the listing forms: the rules, with no DOM in them so scripts/test-autosave.mjs can run them.
 *
 * What a person types is never allowed to exist only in one place for long:
 *   - every change is copied to the browser's own storage at once (the backup);
 *   - a save goes to the server shortly after typing stops, at once when a field is left, and when the tab is
 *     hidden or closed;
 *   - one save runs at a time; a change made while it runs is saved right after, with the newest values;
 *   - a save that fails because of the connection is tried again by itself, with growing pauses, and at once when
 *     the connection comes back; a save the server refuses on purpose (a rule the text breaks) is not repeated;
 *   - the backup is removed only when the server has confirmed exactly the values it holds.
 */

export type AutosaveState =
  | { kind: 'saved'; at: number }
  | { kind: 'dirty' }
  | { kind: 'saving' }
  /** The connection (or the server) failed; the controller tries again. */
  | { kind: 'retrying'; attempt: number; inMs: number }
  /** The server refused these values; nothing is repeated until the person changes something. */
  | { kind: 'rejected'; message: string };

export type SendResult = { ok: true } | { ok: false; retry: boolean; message?: string };

export type Backup = { at: number; snapshot: string; base: string | null };

export type Timers = { set: (fn: () => void, ms: number) => unknown; clear: (handle: unknown) => void; now: () => number };

export type AutosaveOptions = {
  /** The values as they are right now, as one stable string. */
  read: () => string;
  /** Sends the snapshot to the server. Never throws: a failure is a result. */
  send: (snapshot: string) => Promise<SendResult>;
  onState: (state: AutosaveState) => void;
  /** Where the backup lives (localStorage in the browser). Every call may throw; the controller copes. */
  store?: { get: () => string | null; set: (value: string) => void; remove: () => void };
  /** What the server had when the page was opened (the listing's last change). */
  base?: string | null;
  /** The pause after the last keystroke, after a field is left, and between failed attempts. */
  typingMs?: number;
  changeMs?: number;
  retryMs?: readonly number[];
  timers?: Timers;
};

export const DEFAULT_TYPING_MS = 1500;
export const DEFAULT_CHANGE_MS = 400;
export const DEFAULT_RETRY_MS: readonly number[] = [2000, 5000, 15000, 30000];

export type Autosave = {
  /** A field changed: `input` is typing, `change` is a field left or a choice made. */
  touch: (kind: 'input' | 'change') => void;
  /** Saves now and resolves true once the server holds everything (or there was nothing to save). */
  flush: () => Promise<boolean>;
  /**
   * The page changed fields itself with values the server already holds (an AI translation arriving): they are
   * not the person's edits and must not count as unsaved. `change` maps the last confirmed snapshot.
   */
  adopt: (change: (confirmed: string) => string) => void;
  /** True while a request is on its way. */
  busy: () => boolean;
  /** Resolves when no save is in flight (at once if none is). Does not start one. */
  settled: () => Promise<void>;
  /** The connection is back, or the person pressed „Újra”: try at once. */
  retryNow: () => void;
  /** True while the server does not yet hold what the person sees. */
  unsaved: () => boolean;
  /** The listing's last change as the server reported it after a save (the base of the next backup). */
  setBase: (base: string | null) => void;
  dispose: () => void;
};

const realTimers: Timers = { set: (fn, ms) => setTimeout(fn, ms), clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>), now: () => Date.now() };

export function parseBackup(raw: string | null | undefined): Backup | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value && typeof value.snapshot === 'string' && typeof value.at === 'number') return { at: value.at, snapshot: value.snapshot, base: typeof value.base === 'string' ? value.base : null };
  } catch { /* a damaged backup is as good as none */ }
  return null;
}

/**
 * What to do with a backup found when the page opens. `same`: it equals what the page shows (nothing to do, drop it).
 * `restore`: the server still has what the backup started from, so the typed values are simply the newer ones.
 * `ask`: the listing changed elsewhere since; nothing is overwritten without the person deciding.
 */
export function backupVerdict(backup: Backup | null, shown: string, serverBase: string | null): 'none' | 'same' | 'restore' | 'ask' {
  if (!backup) return 'none';
  if (backup.snapshot === shown) return 'same';
  if (backup.base !== null && serverBase !== null && backup.base === serverBase) return 'restore';
  return 'ask';
}

export function createAutosave(options: AutosaveOptions): Autosave {
  const typingMs = options.typingMs ?? DEFAULT_TYPING_MS;
  const changeMs = options.changeMs ?? DEFAULT_CHANGE_MS;
  const retryMs = options.retryMs ?? DEFAULT_RETRY_MS;
  const timers = options.timers ?? realTimers;
  let base = options.base ?? null;
  /** The last snapshot the server confirmed (or, at first, what the page opened with). */
  let confirmed = options.read();
  let timer: unknown = null;
  let running: Promise<boolean> | null = null;
  let attempts = 0;
  let failed = false;
  let disposed = false;

  const clearTimer = () => {
    if (timer !== null) timers.clear(timer);
    timer = null;
  };
  const writeBackup = (snapshot: string) => {
    try { options.store?.set(JSON.stringify({ at: timers.now(), snapshot, base } satisfies Backup)); } catch { /* storage full or blocked: the server save still runs */ }
  };
  const dropBackup = () => {
    try { options.store?.remove(); } catch { /* ignore */ }
  };
  const schedule = (ms: number) => {
    clearTimer();
    timer = timers.set(() => { timer = null; void run(); }, ms);
  };

  /** One round: save the newest values, then look again, until the server holds what is on screen. */
  async function round(): Promise<boolean> {
    for (;;) {
      const snapshot = options.read();
      if (snapshot === confirmed) {
        attempts = 0;
        failed = false;
        dropBackup();
        options.onState({ kind: 'saved', at: timers.now() });
        return true;
      }
      writeBackup(snapshot);
      options.onState({ kind: 'saving' });
      let result: SendResult;
      try { result = await options.send(snapshot); } catch { result = { ok: false, retry: true }; }
      if (disposed) return false;
      if (result.ok) {
        confirmed = snapshot;
        attempts = 0;
        failed = false;
        continue; // the loop's first check settles it, or saves what changed meanwhile
      }
      failed = true;
      if (!result.retry) {
        options.onState({ kind: 'rejected', message: result.message ?? '' });
        return false;
      }
      attempts += 1;
      const inMs = retryMs[Math.min(attempts - 1, retryMs.length - 1)];
      options.onState({ kind: 'retrying', attempt: attempts, inMs });
      schedule(inMs);
      return false;
    }
  }

  function run(): Promise<boolean> {
    if (disposed) return Promise.resolve(false);
    if (running) return running;
    clearTimer();
    running = round().finally(() => { running = null; });
    return running;
  }

  return {
    touch(kind) {
      if (disposed) return;
      const snapshot = options.read();
      if (snapshot === confirmed) {
        // Back to what the server has (a change undone): nothing to save, nothing to keep.
        if (!running && !failed) { clearTimer(); dropBackup(); options.onState({ kind: 'saved', at: timers.now() }); }
        return;
      }
      writeBackup(snapshot);
      attempts = 0;
      failed = false;
      options.onState({ kind: 'dirty' });
      // A save in flight picks the newest values up by itself when it ends; only a quiet controller needs a timer.
      if (!running) schedule(kind === 'input' ? typingMs : changeMs);
    },
    async flush() {
      clearTimer();
      // A round already running ends by looking again, so waiting for it, then running once more, covers everything.
      if (running) await running;
      return run();
    },
    busy: () => running !== null,
    adopt(change) {
      confirmed = change(confirmed);
      if (!running && options.read() === confirmed) { clearTimer(); dropBackup(); options.onState({ kind: 'saved', at: timers.now() }); }
    },
    async settled() {
      if (running) await running;
    },
    retryNow() {
      if (disposed) return;
      attempts = 0;
      void run();
    },
    unsaved: () => options.read() !== confirmed,
    setBase(next) { base = next; },
    dispose() {
      disposed = true;
      clearTimer();
    },
  };
}
