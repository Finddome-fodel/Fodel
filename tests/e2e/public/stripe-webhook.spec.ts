/**
 * The Stripe webhook is the only thing that publishes a paid listing, so it
 * is checked at the door: unsigned or wrongly signed requests are refused,
 * and every genuine event, including ones it does not act on, is answered
 * with 200 so Stripe never retries in a loop. Signatures are made offline
 * with the dummy secret from tests/e2e/support/env.ts; nothing reaches Stripe.
 */
import Stripe from 'stripe';
import { test, expect } from '@playwright/test';

const SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_e2e_dummy';
const stripe = new Stripe('sk_test_e2e_dummy');

const event = (type: string, object: Record<string, unknown>) =>
  JSON.stringify({ id: `evt_e2e_${type}`, object: 'event', api_version: '2024-06-20', created: Math.floor(Date.now() / 1000), type, data: { object } });
const sign = (payload: string, secret = SECRET) => stripe.webhooks.generateTestHeaderString({ payload, secret });

test.describe('stripe webhook', () => {
  test('no signature is refused', async ({ request }) => {
    const response = await request.post('/api/stripe/webhook', { data: event('checkout.session.completed', {}), headers: { 'content-type': 'application/json' } });
    expect(response.status()).toBe(400);
  });

  test('a wrong signature is refused', async ({ request }) => {
    const payload = event('checkout.session.completed', { id: 'cs_test_1', payment_status: 'paid' });
    const response = await request.post('/api/stripe/webhook', {
      data: payload,
      headers: { 'content-type': 'application/json', 'stripe-signature': sign(payload, 'whsec_someone_else') },
    });
    expect(response.status()).toBe(400);
  });

  test('a body changed after signing is refused', async ({ request }) => {
    const payload = event('checkout.session.completed', { id: 'cs_test_1', payment_status: 'paid' });
    const response = await request.post('/api/stripe/webhook', {
      data: payload.replace('cs_test_1', 'cs_test_2'),
      headers: { 'content-type': 'application/json', 'stripe-signature': sign(payload) },
    });
    expect(response.status()).toBe(400);
  });

  const signed: [string, Record<string, unknown>][] = [
    ['checkout.session.completed', { id: 'cs_test_unknown', payment_status: 'paid', metadata: {} }],
    ['checkout.session.completed', { id: 'cs_test_unknown', payment_status: 'unpaid', metadata: {} }],
    ['checkout.session.async_payment_succeeded', { id: 'cs_test_unknown', payment_status: 'paid', metadata: {} }],
    ['checkout.session.async_payment_failed', { id: 'cs_test_unknown' }],
    ['checkout.session.expired', { id: 'cs_test_unknown' }],
    ['customer.created', { id: 'cus_test' }],
  ];
  for (const [type, object] of signed) {
    test(`a signed ${type} (${object.payment_status ?? 'no status'}) is answered 200`, async ({ request }) => {
      const payload = event(type, object);
      const response = await request.post('/api/stripe/webhook', {
        data: payload,
        headers: { 'content-type': 'application/json', 'stripe-signature': sign(payload) },
      });
      expect(response.status()).toBe(200);
    });
  }
});
