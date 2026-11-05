/** The hero title tiers: short stays large, sentences get smaller, ideographs count double. */
import assert from 'node:assert/strict';
import { titleFit, titleWeight } from '../src/lib/title-fit.ts';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };

test('short titles keep the large editorial size', () => {
  assert.equal(titleFit('Birtok'), 's');
  assert.equal(titleFit('Kőfalú tanya Kékkúton'), 's');
  assert.equal(titleFit(''), 's');
});
test('the tier steps up with the length, at the edges', () => {
  assert.equal(titleFit('x'.repeat(32)), 's');
  assert.equal(titleFit('x'.repeat(33)), 'm');
  assert.equal(titleFit('x'.repeat(64)), 'm');
  assert.equal(titleFit('x'.repeat(65)), 'l');
  assert.equal(titleFit('x'.repeat(110)), 'l');
  assert.equal(titleFit('x'.repeat(111)), 'xl');
  assert.equal(titleFit('x'.repeat(160)), 'xl');
});
test('the title that broke the page (a sentence of 121 characters) is the second-largest tier down', () => {
  const real = 'Többszáz hektáros erdőben, szomszédmentes, 2024-ben teljeskörűen felújított, 2 lakóházas lovasfarm sok melléképülettel eladó';
  assert.equal(titleFit(real), 'xl');
});
test('ideographs are as wide as two letters; surrounding spaces do not count', () => {
  assert.equal(titleWeight('山间农场'), 8);
  assert.equal(titleFit('山'.repeat(17)), 'm');
  assert.equal(titleFit('  Birtok  '), 's');
});
console.log(`All ${passed} title-fit checks passed.`);
