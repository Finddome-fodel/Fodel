/**
 * Stripe without the network: signature checking is the real library's (offline),
 * Checkout sessions are a map in memory that the test can expire or pay.
 */
import Stripe from 'stripe';
import { world } from './world.ts';

const real = new Stripe('sk_test_offline');
let n = 0;

export const isStripeEnabled = () => String((globalThis as any).__ENV.STRIPE_ENABLED) === 'true';

export function getStripe(): any {
  return {
    webhooks: real.webhooks,
    coupons: { create: async (params: any) => { world.stripeCalls.push({ coupon: params }); return { id: `coupon_${++n}` }; } },
    checkout: {
      sessions: {
        create: async (params: any, options: any) => {
          // Same idempotency behaviour as Stripe: the same key returns the same session.
          const key = options?.idempotencyKey;
          const cached = key && world.sessions[`key:${key}`];
          if (cached) return cached;
          const session = { id: `cs_test_${++n}`, url: `https://checkout.stripe.test/${n}`, status: 'open', payment_status: 'unpaid', params };
          world.sessions[session.id] = session;
          if (key) world.sessions[`key:${key}`] = session;
          world.stripeCalls.push({ create: params, key });
          return session;
        },
        expire: async (id: string) => {
          const session = world.sessions[id];
          if (!session) throw new Error('No such checkout.session');
          session.status = 'expired';
          world.stripeCalls.push({ expire: id });
          return session;
        },
        retrieve: async (id: string) => {
          const session = world.sessions[id];
          if (!session) throw new Error('No such checkout.session');
          return session;
        },
      },
    },
  };
}
