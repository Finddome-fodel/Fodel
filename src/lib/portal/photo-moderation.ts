/**
 * Free later photo upload with moderation (spec §4c part 2, migration 0053).
 *
 * The pure rules shared by the upload API, the admin queue and the editor:
 * who may change the photos of a listing in which status, the review limits,
 * the rejection reasons and how a batch of decisions is checked and grouped.
 * The database enforces the same rules on its own (0053); these exist so the
 * screens say the right thing before a request ever reaches it.
 */

/** Statuses whose photos the owner edits freely (reviewed with the listing). Mirrors OWNER_EDITABLE. */
const OWNER_FULL = ['draft', 'changes_requested'];

/** A live listing: the owner may add, reorder and remove photos, new ones wait for approval. */
export const PHOTO_LIVE_STATUSES = ['published'];

/**
 * - `full`: every photo action, nothing waits (admin; owner of a draft).
 * - `live`: the owner of a live listing; new photos wait for approval,
 *   approved ones can be reordered, made the cover or removed, not replaced or recaptioned.
 * - `none`: read only.
 */
export type PhotoAccess = 'full' | 'live' | 'none';

export function photoAccess(status: string, who: { isAdmin: boolean; isOwner: boolean }): PhotoAccess {
  if (who.isAdmin) return 'full';
  if (!who.isOwner) return 'none';
  if (OWNER_FULL.includes(status)) return 'full';
  if (PHOTO_LIVE_STATUSES.includes(status)) return 'live';
  return 'none';
}

/** At most this many photos of one listing wait for review at a time, so the queue stays reviewable. */
export const PENDING_PHOTOS_MAX = 30;

export type RejectionReason = { code: string; label: string };

/** The admin's choices. Labels are Hungarian (the portal); the owner's e-mail translates the codes. */
export const REJECTION_REASONS: RejectionReason[] = [
  { code: 'quality', label: 'Elmosódott, sötét vagy rossz minőségű' },
  { code: 'unrelated', label: 'Nem ezt az ingatlant mutatja' },
  { code: 'personal', label: 'Személyes adat látható (arc, rendszám, irat)' },
  { code: 'branding', label: 'Felirat, logó, vízjel vagy elérhetőség' },
  { code: 'duplicate', label: 'Már szerepel a galériában' },
  { code: 'inappropriate', label: 'Nem hirdetésbe illő tartalom' },
  { code: 'other', label: 'Egyéb ok (írja le)' },
];
export const REASON_CODES = REJECTION_REASONS.map((r) => r.code);
export const NOTE_MAX = 500;

export type PhotoDecision =
  | { id: string; action: 'approve' }
  | { id: string; action: 'reject'; reason: string; note?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Checks a batch from the admin queue. Errors are codes the page explains in Hungarian. */
export function parseDecisions(input: unknown): { ok: true; decisions: PhotoDecision[] } | { ok: false; error: string } {
  if (!Array.isArray(input) || input.length === 0) return { ok: false, error: 'no-decisions' };
  if (input.length > 200) return { ok: false, error: 'too-many' };
  const seen = new Set<string>();
  const decisions: PhotoDecision[] = [];
  for (const raw of input) {
    const d = (raw ?? {}) as Record<string, unknown>;
    const id = typeof d.id === 'string' ? d.id : '';
    if (!UUID.test(id) || seen.has(id)) return { ok: false, error: 'invalid-photo' };
    seen.add(id);
    if (d.action === 'approve') {
      decisions.push({ id, action: 'approve' });
      continue;
    }
    if (d.action !== 'reject') return { ok: false, error: 'invalid-action' };
    const reason = typeof d.reason === 'string' ? d.reason : '';
    if (!REASON_CODES.includes(reason)) return { ok: false, error: 'reason-required' };
    const note = typeof d.note === 'string' ? d.note.replace(/\s+/g, ' ').trim() : '';
    if (note.length > NOTE_MAX) return { ok: false, error: 'note-too-long' };
    if (reason === 'other' && !note) return { ok: false, error: 'note-required' };
    decisions.push(note ? { id, action: 'reject', reason, note } : { id, action: 'reject', reason });
  }
  return { ok: true, decisions };
}

export type GroupedRejection = { code: string; count: number; note?: string };

/** Same reason and note → one line ("Elmosódott (2)"), in the order the admin decided. */
export function groupRejections(decisions: PhotoDecision[]): GroupedRejection[] {
  const out: GroupedRejection[] = [];
  for (const d of decisions) {
    if (d.action !== 'reject') continue;
    const found = out.find((g) => g.code === d.reason && (g.note ?? '') === (d.note ?? ''));
    if (found) found.count += 1;
    else out.push(d.note ? { code: d.reason, count: 1, note: d.note } : { code: d.reason, count: 1 });
  }
  return out;
}

/** The Hungarian sentence kept in property_media_rejections.reason (what the portal shows). */
export function reasonText(code: string, note?: string): string {
  const label = REJECTION_REASONS.find((r) => r.code === code)?.label ?? '';
  if (code === 'other') return note || label;
  return note ? `${label}: ${note}` : label;
}

/** After removing or rejecting photos: the cover the gallery should have (first approved by order), if it has none. */
export function nextCover<T extends { id: string; pending?: boolean | null; is_hero?: boolean | null; sort_order: number }>(
  photos: T[]
): string | null {
  if (photos.some((p) => p.is_hero && !p.pending)) return null;
  const first = [...photos].filter((p) => !p.pending).sort((a, b) => a.sort_order - b.sort_order)[0];
  return first?.id ?? null;
}
