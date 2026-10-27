/**
 * False for addresses that can never receive mail — empty, or on a reserved
 * test domain (RFC 2606: .local, .test, .example, .invalid, example.*). A
 * scripted test account that ends up in the admin roster would otherwise bounce
 * on every alert and count against the sending domain.
 */
export function isDeliverableAddress(email: string | null | undefined): email is string {
  const domain = String(email ?? '').trim().toLowerCase().split('@')[1];
  if (!domain) return false;
  return !/(^|\.)(local|test|example|invalid|localhost)$/.test(domain) && !/^example\.(com|net|org)$/.test(domain);
}
