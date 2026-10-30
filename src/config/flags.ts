/** Policy switch for restoring the pre-1.3 pay-before-publish workflow.
 * Like STRIPE_ENABLED this is read at build time and needs a redeploy. */
export function paymentGatesPublishing(): boolean {
  return String(import.meta.env.PAYMENT_GATES_PUBLISHING) === 'true';
}

/**
 * Whether a listing page says that its text was translated automatically.
 * The AI-written rows are always marked in the database (property_translations.machine);
 * this is the one switch for showing it. Off by default. Read at build time like the flag above.
 */
export function showMachineTranslationNote(): boolean {
  return String(import.meta.env.SHOW_MACHINE_TRANSLATION_NOTE) === 'true';
}
