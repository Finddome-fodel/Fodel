/**
 * <ShareButtons> in the browser (master §10b). The links already work without this file; it adds the two things a link
 * cannot do: copy the address, and open the phone's own share sheet. No network calls, nothing is tracked.
 */
const READY = 'shareReady';

/** How long "Link copied" stays on screen. */
const TOAST_MS = 2000;

function announce(root: HTMLElement, message: string): void {
  const toast = root.querySelector<HTMLElement>('[data-share-toast]');
  if (!toast) return;
  toast.textContent = message;
  window.setTimeout(() => {
    if (toast.textContent === message) toast.textContent = '';
  }, TOAST_MS);
}

/** Clipboard API where the browser has it (secure pages); an off-screen field and the old command elsewhere. */
async function copy(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Refused (no permission, or not a secure page): try the old way.
  }
  const field = document.createElement('input');
  field.value = text;
  field.setAttribute('readonly', '');
  field.setAttribute('aria-hidden', 'true');
  field.style.cssText = 'position:fixed;inset-block-start:0;inset-inline-start:0;opacity:0;pointer-events:none';
  document.body.appendChild(field);
  const active = document.activeElement as HTMLElement | null;
  field.select();
  field.setSelectionRange(0, text.length);
  let done = false;
  try {
    done = document.execCommand('copy');
  } catch {
    done = false;
  }
  field.remove();
  active?.focus({ preventScroll: true });
  return done;
}

function setup(root: HTMLElement): void {
  if (root.dataset[READY]) return;
  root.dataset[READY] = '1';
  root.setAttribute('data-share-ready', '');

  const { shareTitle = '', shareText = '', shareNative = '', shareCopy = '', shareCopied = '' } = root.dataset;

  const copyButton = root.querySelector<HTMLButtonElement>('[data-share-copy-button]');
  copyButton?.addEventListener('click', async () => {
    if (await copy(shareCopy)) announce(root, shareCopied);
  });

  // The share sheet is called straight from the click: iOS only opens it for a real tap.
  const nativeButton = root.querySelector<HTMLButtonElement>('[data-share-native-button]');
  if (nativeButton && typeof navigator.share === 'function') {
    root.setAttribute('data-share-has-native', '');
    nativeButton.addEventListener('click', () => {
      navigator.share({ title: shareTitle, text: shareText, url: shareNative }).catch((error: unknown) => {
        // Closing the sheet is an answer. Anything else: the buttons are the way.
        if ((error as { name?: string })?.name !== 'AbortError') root.setAttribute('data-share-failed', '');
      });
    });
  }
}

document.querySelectorAll<HTMLElement>('[data-share]').forEach(setup);
