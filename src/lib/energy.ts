/* No imports: format.ts and the plain-Node rule tests use this too. */
/**
 * Energy certificates, per country. `properties.epc_class` holds one of:
 *   'unknown'   – not stated (the default),
 *   'none'      – the owner says there is no certificate,
 *   'certified' – there is a certificate, the class was not given,
 *   anything else – the class printed on the certificate (implies one exists).
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
