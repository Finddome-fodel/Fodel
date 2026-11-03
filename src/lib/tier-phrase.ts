/**
 * The words for a price tier — "legfeljebb 150 000 000 Ft értékű ingatlan",
 * "150 000 000 Ft feletti ingatlan" — in every site language. Used on order
 * lines (src/lib/orders.ts), invoices and the package cards, so a seller reads
 * the same range everywhere.
 */
import type { Locale } from '~/i18n/ui';
import { huf } from '~/lib/format';
import { tierRange, type PriceTier } from '~/lib/price-tiers';

type TierPhrase = { above: (x: string) => string; upTo: (x: string) => string; between: (a: string, b: string) => string };
const TIER_PHRASE: Record<Locale, TierPhrase> = {
  hu: { above: (x) => `${x} feletti ingatlan`, upTo: (x) => `legfeljebb ${x} értékű ingatlan`, between: (a, b) => `${a}–${b} értékű ingatlan` },
  nl: { above: (x) => `woning boven ${x}`, upTo: (x) => `woning tot en met ${x}`, between: (a, b) => `woning van ${a} tot ${b}` },
  en: { above: (x) => `property priced above ${x}`, upTo: (x) => `property priced up to ${x}`, between: (a, b) => `property priced ${a}–${b}` },
  de: { above: (x) => `Immobilie über ${x}`, upTo: (x) => `Immobilie bis ${x}`, between: (a, b) => `Immobilie von ${a} bis ${b}` },
  fr: { above: (x) => `bien de plus de ${x}`, upTo: (x) => `bien jusqu’à ${x}`, between: (a, b) => `bien de ${a} à ${b}` },
  es: { above: (x) => `inmueble de más de ${x}`, upTo: (x) => `inmueble de hasta ${x}`, between: (a, b) => `inmueble de ${a} a ${b}` },
  pl: { above: (x) => `nieruchomość powyżej ${x}`, upTo: (x) => `nieruchomość do ${x}`, between: (a, b) => `nieruchomość od ${a} do ${b}` },
  ro: { above: (x) => `proprietate de peste ${x}`, upTo: (x) => `proprietate de până la ${x}`, between: (a, b) => `proprietate între ${a} și ${b}` },
  sk: { above: (x) => `nehnuteľnosť nad ${x}`, upTo: (x) => `nehnuteľnosť do ${x}`, between: (a, b) => `nehnuteľnosť od ${a} do ${b}` },
  it: { above: (x) => `immobile oltre ${x}`, upTo: (x) => `immobile fino a ${x}`, between: (a, b) => `immobile da ${a} a ${b}` },
  pt: { above: (x) => `imóvel acima de ${x}`, upTo: (x) => `imóvel até ${x}`, between: (a, b) => `imóvel de ${a} a ${b}` },
  el: { above: (x) => `ακίνητο άνω των ${x}`, upTo: (x) => `ακίνητο έως ${x}`, between: (a, b) => `ακίνητο από ${a} έως ${b}` },
  cs: { above: (x) => `nemovitost nad ${x}`, upTo: (x) => `nemovitost do ${x}`, between: (a, b) => `nemovitost od ${a} do ${b}` },
  sl: { above: (x) => `nepremičnina nad ${x}`, upTo: (x) => `nepremičnina do ${x}`, between: (a, b) => `nepremičnina od ${a} do ${b}` },
  sv: { above: (x) => `fastighet över ${x}`, upTo: (x) => `fastighet upp till ${x}`, between: (a, b) => `fastighet ${a}–${b}` },
  da: { above: (x) => `ejendom over ${x}`, upTo: (x) => `ejendom op til ${x}`, between: (a, b) => `ejendom ${a}–${b}` },
  no: { above: (x) => `eiendom over ${x}`, upTo: (x) => `eiendom opptil ${x}`, between: (a, b) => `eiendom ${a}–${b}` },
  fi: { above: (x) => `kiinteistö, hinta yli ${x}`, upTo: (x) => `kiinteistö, hinta enintään ${x}`, between: (a, b) => `kiinteistö, hinta ${a}–${b}` },
  et: { above: (x) => `kinnisvara hinnaga üle ${x}`, upTo: (x) => `kinnisvara hinnaga kuni ${x}`, between: (a, b) => `kinnisvara hinnaga ${a}–${b}` },
  lv: { above: (x) => `īpašums virs ${x}`, upTo: (x) => `īpašums līdz ${x}`, between: (a, b) => `īpašums no ${a} līdz ${b}` },
  lt: { above: (x) => `turtas virš ${x}`, upTo: (x) => `turtas iki ${x}`, between: (a, b) => `turtas nuo ${a} iki ${b}` },
  sr: { above: (x) => `nekretnina sa cenom iznad ${x}`, upTo: (x) => `nekretnina sa cenom do ${x}`, between: (a, b) => `nekretnina sa cenom ${a}–${b}` },
  uk: { above: (x) => `нерухомість вартістю понад ${x}`, upTo: (x) => `нерухомість вартістю до ${x}`, between: (a, b) => `нерухомість вартістю ${a}–${b}` },
  tr: { above: (x) => `fiyatı ${x} üzerinde olan mülk`, upTo: (x) => `fiyatı en fazla ${x} olan mülk`, between: (a, b) => `fiyatı ${a}–${b} arasında olan mülk` },
  he: { above: (x) => `property priced above ${x}`, upTo: (x) => `property priced up to ${x}`, between: (a, b) => `property priced ${a}–${b}` },
  ar: { above: (x) => `property priced above ${x}`, upTo: (x) => `property priced up to ${x}`, between: (a, b) => `property priced ${a}–${b}` },
  ru: { above: (x) => `недвижимость стоимостью свыше ${x}`, upTo: (x) => `недвижимость стоимостью до ${x}`, between: (a, b) => `недвижимость стоимостью ${a}–${b}` },
  zh: { above: (x) => `property priced above ${x}`, upTo: (x) => `property priced up to ${x}`, between: (a, b) => `property priced ${a}–${b}` },
};

/**
 * "(150 000 000 Ft feletti ingatlan)" — the range a tiered price applies to,
 * in the order's language. The first tier reads "up to", the last "above"
 * (its own bound is the previous tier's, so "above 150 000 000 Ft" rather
 * than "from 150 000 001 Ft"), the middle ones a range.
 */
export function tierPhrase(tiers: readonly PriceTier[], index: number, locale: Locale): string {
  const { fromHuf, toHuf } = tierRange(tiers, index);
  const phrase = TIER_PHRASE[locale] ?? TIER_PHRASE.en;
  if (toHuf === null) return phrase.above(huf(Math.max(0, fromHuf - 1), locale));
  if (index === 0) return phrase.upTo(huf(toHuf, locale));
  return phrase.between(huf(fromHuf, locale), huf(toHuf, locale));
}
