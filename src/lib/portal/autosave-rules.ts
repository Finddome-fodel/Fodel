/**
 * Which listings the editor may save by itself. A listing is changed in the background only while it is still the
 * owner's work in progress: a draft, or one an admin sent back for corrections. Anything live, waiting for a
 * decision or waiting for payment changes only when a person presses save, so a half-typed sentence can never
 * reach a public page or a review. Pure: the editor page and the endpoint both ask here.
 */
export const AUTOSAVE_STATUSES: readonly string[] = ['draft', 'changes_requested'];

export const canAutosave = (status: string | null | undefined): boolean => AUTOSAVE_STATUSES.includes(String(status));
