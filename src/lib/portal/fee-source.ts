/**
 * Why a listing costs its owner nothing — one answer for every admin screen.
 *
 * Three ways a listing ends up free, and an admin should always be able to
 * tell them apart at a glance:
 *   free-link     the owner came through the free upload link or a free invite
 *                 (`free_listing`, decided before upload, covers the listing for good);
 *   free-approval an admin pressed "Jóváhagyás ingyen" at review (migration 0045):
 *                 this publication only, renewals are charged as usual;
 *   admin-own     an admin's own listing: nobody bills themselves.
 *
 * Pure: no database, no Astro, so lists, the editor and tests can all use it.
 */
export type FeeSource = 'free-link' | 'free-approval' | 'admin-own';

export type FreeFacts = {
  free_listing?: boolean | null;
  free_approved_at?: string | null;
};

const DATE = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Budapest' });

/** The free reason, or null for a listing that pays as usual. */
export function feeSource(property: FreeFacts, opts: { adminOwned?: boolean } = {}): FeeSource | null {
  if (opts.adminOwned) return 'admin-own';
  if (property.free_listing) return 'free-link';
  if (property.free_approved_at) return 'free-approval';
  return null;
}

/** The badge's tooltip and the longer line under it: what kind of free, in the admin's words. */
export function feeSourceTitle(source: FeeSource, property: FreeFacts, approverName?: string | null): string {
  if (source === 'admin-own') return 'Saját hirdetés: díjbekérő nem készül.';
  if (source === 'free-link') return 'Ingyenes feltöltés (ingyenes feltöltő link vagy meghívó).';
  const when = property.free_approved_at ? DATE.format(new Date(property.free_approved_at)) : '';
  return `Ingyenesen jóváhagyva${approverName ? `: ${approverName}` : ''}${when ? `, ${when}` : ''}.`;
}
