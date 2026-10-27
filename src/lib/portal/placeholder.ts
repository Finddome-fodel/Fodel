/**
 * A draft is created with €1 and no real figures so the editor has something to
 * show; if one of those placeholders reaches the public site the listing reads
 * "€1, 1 m²". Returns what is wrong in the admin's language, or null.
 */
export function placeholderProblem(p: { price_eur?: number | null; floor_m2?: number | null; building_m2?: number | null; plot_m2?: number | null }): string | null {
  if (p.price_eur == null || Number(p.price_eur) <= 1) return 'Az ár még a kezdőérték (€1) — kérje meg a hirdetőt, hogy adja meg a valódi árat.';
  for (const [value, name] of [[p.floor_m2, 'lakóterület'], [p.building_m2, 'épületterület'], [p.plot_m2, 'telekterület']] as const) {
    if (value != null && Number(value) <= 1) return `A(z) ${name} 1 m² vagy kisebb — ez nem valódi érték, javítani kell a jóváhagyás előtt.`;
  }
  return null;
}
