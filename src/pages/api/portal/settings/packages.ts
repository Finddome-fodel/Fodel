/**
 * Moved: packages are saved from the Csomagok menu (/api/portal/packages/*).
 * Kept so a form opened before the move still saves; see packages/legacy.ts.
 */
export const prerender = false;
export { POST } from '../packages/legacy';
