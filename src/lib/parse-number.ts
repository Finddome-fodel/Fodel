/**
 * Number parsing shared by the server and the browser (no dependencies, so a
 * client script can import it without pulling in the phone metadata that
 * src/lib/validation.ts needs). validation.ts re-exports it.
 */

/**
 * Parses a number the way people write it in Hungary and the Netherlands (and
 * in German and French, which group the same way): spaces, dots or narrow
 * spaces group thousands ("1 200 000", "1.200.000"), a comma or dot followed
 * by one or two digits at the end is a decimal. English "1,200,000" reads the
 * same way: the commas are dropped.
 */
export function parseLocaleNumber(value: string): number | null {
  const raw = value.trim();
  if (!raw) return null;
  if (!/^[\d\s.,]+$/.test(raw)) return null;
  const decimal = raw.match(/[.,](\d{1,2})$/);
  const whole = (decimal ? raw.slice(0, decimal.index) : raw).replace(/[\s.,]/g, '');
  if (!/^\d+$/.test(whole)) return null;
  const n = Number(decimal ? `${whole}.${decimal[1]}` : whole);
  return Number.isFinite(n) ? n : null;
}
