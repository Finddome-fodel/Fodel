/* No imports: format.ts and the plain-Node rule tests use this too. */
/**
 * Energy certificates. Since November 2026 the class is free text, written the way the
 * advertiser's own country prints it ("A+", "BB", "125 kWh/m²/év"…), up to 40 characters. `properties.epc_class` holds one of:
 *   'unknown'   – not stated (the default),
 *   'none'      – the owner says there is no certificate,
 *   'certified' – there is a certificate, the class was not given,
 *   anything else – the class printed on the certificate (implies one exists). Older rows
 *                   chosen from a per-country list ("B", "A++") read the same way.
 * Older rows may still say 'pending' (= unknown) or 'not-applicable' / 'exempt' (= none).
 */
export type EnergyAnswer = { has: 'unknown' | 'yes' | 'no'; rating: string };
export function readEnergy(stored: string | null | undefined): EnergyAnswer {
  const v = (stored ?? '').trim();
  if (!v || v === 'unknown' || v === 'pending') return { has: 'unknown', rating: '' };
  if (v === 'none' || v === 'not-applicable' || v === 'exempt') return { has: 'no', rating: '' };
  if (v === 'certified') return { has: 'yes', rating: '' };
  return { has: 'yes', rating: v };
}

/** Words the column uses for its own answers; typed as a class they would be misread. */
const RESERVED = ['unknown', 'pending', 'none', 'not-applicable', 'exempt', 'certified'];
/** A typed class, tidied (spaces collapsed, at most 40 characters); null when it cannot be stored as a class. */
export function energyRating(typed: string): string | null {
  const v = typed.replace(/\s+/g, ' ').trim().slice(0, 40).trim();
  return v && !RESERVED.includes(v.toLowerCase()) ? v : null;
}
