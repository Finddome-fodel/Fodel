import { world } from './world.ts';
export async function createDraftFromPayment(_admin: unknown, paymentId: string) {
  world.drafts.push(paymentId);
  return { id: `draft-${paymentId}` };
}
