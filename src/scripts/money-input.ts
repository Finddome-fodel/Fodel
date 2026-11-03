/**
 * <MoneyInput> in the browser (spec §7): the visible field shows „1.500.000”
 * while you type, and a hidden field next to it posts the raw integer (or
 * cents), so the server never has to guess what „1.500” meant.
 *
 * Without JavaScript nothing here runs: the visible field keeps its `name`
 * and the server reads the text with readMoney() (src/lib/portal/num.ts).
 */
import { formatMoneyText, moneyDigits, rawMoney, MONEY_MESSAGES } from '~/lib/portal/num';

const READY = 'moneyReady';

const cents = (input: HTMLInputElement) => input.closest<HTMLElement>('[data-money]')?.dataset.cents === '1';
/** `data-signed`: a leading minus is kept (invoice discount lines); every other MoneyInput is non-negative. */
const signed = (input: HTMLInputElement) => input.closest<HTMLElement>('[data-money]')?.dataset.signed === '1';
const minus = (input: HTMLInputElement, text: string) => signed(input) && /^\s*[-−–]/.test(text);

/** The field's value as a number: whole units, or cents with allowCents. Empty → null. */
export function moneyOf(input: HTMLInputElement | null | undefined): number | null {
  if (!input) return null;
  const raw = rawMoney(moneyDigits(input.value, cents(input)), cents(input));
  if (raw === '') return null;
  return minus(input, input.value) ? -Number(raw) : Number(raw);
}

/** Puts a value (whole units, or cents with allowCents) into the field and its hidden twin. */
export function setMoney(input: HTMLInputElement, value: number | null): void {
  const sign = value !== null && value < 0 && signed(input) ? '-' : '';
  const abs = value === null ? null : Math.abs(value);
  if (abs === null || !Number.isFinite(abs)) input.value = '';
  else if (cents(input)) {
    const whole = Math.floor(abs / 100);
    const rest = Math.round(abs % 100);
    input.value = sign + formatMoneyText(rest ? `${whole},${String(rest).padStart(2, '0')}` : String(whole), true);
  } else input.value = sign + formatMoneyText(String(Math.round(abs)));
  sync(input);
}

/** Digits (and the decimal comma) left of the caret. */
function significantBefore(text: string, caret: number, withSign = false): number {
  return text.slice(0, caret).replace(withSign ? /[^\d,\-−–]/g : /[^\d,]/g, '').length;
}

function caretAfter(text: string, count: number, withSign = false): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if ((withSign ? /[\d,-]/ : /[\d,]/).test(text[i])) seen++;
    if (seen === count) return i + 1;
  }
  return text.length;
}

function hiddenOf(input: HTMLInputElement): HTMLInputElement | null {
  return input.parentElement?.querySelector<HTMLInputElement>('input[type="hidden"][data-money-raw]') ?? null;
}

/** Copies the raw value into the hidden field and reports bounds through the browser's own validation. */
function sync(input: HTMLInputElement): void {
  const box = input.closest<HTMLElement>('[data-money]');
  const allowCents = cents(input);
  const raw = rawMoney(moneyDigits(input.value, allowCents), allowCents);
  const negative = raw !== '' && minus(input, input.value);
  const hidden = hiddenOf(input);
  if (hidden) hidden.value = negative ? `-${raw}` : raw;
  let message = '';
  if (raw !== '') {
    const n = negative ? -Number(raw) : Number(raw);
    const min = box?.dataset.min ? Number(box.dataset.min) : null;
    const max = box?.dataset.max ? Number(box.dataset.max) : null;
    if (min !== null && n < min) message = MONEY_MESSAGES.min;
    else if (max !== null && n > max) message = MONEY_MESSAGES.max;
  }
  input.setCustomValidity(message);
}

function reformat(input: HTMLInputElement): void {
  const allowCents = cents(input);
  const before = input.value;
  const caret = input.selectionStart ?? before.length;
  const keep = significantBefore(before, caret, signed(input));
  const sign = minus(input, before) ? '-' : '';
  const next = sign + formatMoneyText(moneyDigits(before, allowCents), allowCents);
  if (next !== before) {
    input.value = next;
    if (document.activeElement === input) {
      const at = caretAfter(next, keep, signed(input));
      input.setSelectionRange(at, at);
    }
  }
  sync(input);
}

/** Wires every MoneyInput under `root` once (safe to call again after adding rows). */
export function initMoneyInputs(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-money]').forEach((box) => {
    if (box.dataset[READY]) return;
    const input = box.querySelector<HTMLInputElement>('input[data-money-text]');
    if (!input) return;
    box.dataset[READY] = '1';
    const name = input.name;
    if (name) {
      // The hidden twin takes over the name; the marker tells readMoney() the value is already raw.
      const hidden = Object.assign(document.createElement('input'), { type: 'hidden', name });
      hidden.dataset.moneyRaw = '';
      const marker = Object.assign(document.createElement('input'), { type: 'hidden', name: `${name}__raw`, value: '1' });
      input.removeAttribute('name');
      input.dataset.name = name;
      box.append(hidden, marker);
    }
    input.addEventListener('input', () => reformat(input));
    input.addEventListener('blur', () => reformat(input));
    // Typing a letter or a second comma does nothing instead of flashing in and out.
    input.addEventListener('beforeinput', (event) => {
      const data = (event as InputEvent).data;
      if (!data || (event as InputEvent).inputType.startsWith('insertFromPaste')) return;
      const allowed = cents(input) ? /^[\d\s.,]+$/ : /^[\d\s.]+$/;
      // A minus only where it means something: first, in a signed field.
      if (signed(input) && /^[-−–]$/.test(data) && (input.selectionStart ?? 0) === 0) return;
      if (!allowed.test(data)) event.preventDefault();
    });
    reformat(input);
  });
}
