/**
 * How much room a listing's title takes in the photograph. A seller may write a whole sentence as the title; the
 * photograph then sets it smaller and shows at most three lines (the whole title is the heading under the picture).
 * Ideographs are as wide as two letters. Pure: the page and scripts/test-title-fit.mjs both use it.
 */
export type TitleFit = 's' | 'm' | 'l' | 'xl';

export const titleWeight = (title: string): number =>
  [...title].reduce((sum, ch) => sum + (/[⺀-鿿가-힯＀-￯]/.test(ch) ? 2 : 1), 0);

export function titleFit(title: string): TitleFit {
  const weight = titleWeight(title.trim());
  return weight <= 32 ? 's' : weight <= 64 ? 'm' : weight <= 110 ? 'l' : 'xl';
}
