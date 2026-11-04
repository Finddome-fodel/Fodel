/**
 * Sharing a listing: the links behind the Facebook, WhatsApp and e-mail buttons, and the text they carry. Pure (no
 * browser, no network), so the tests can check the exact strings. Nothing here loads a third-party script: a share
 * is a plain link to the network's own share page, plus the browser's own share sheet where there is one.
 *
 * The shared address is the canonical listing URL in the visitor's language, never one that redirects. An optional
 * UTM tail (`utm_source=<channel>&utm_medium=share&utm_campaign=listing`) lets the office see where visitors came from; it
 * is only ever added to the address that is shared, never to the canonical or og:url.
 */
export type ShareChannel = 'facebook' | 'whatsapp' | 'email' | 'copy' | 'native';

/** Unicode isolates: a left-to-right address inside right-to-left text stays in one piece. */
const LRI = '⁦';
const PDI = '⁩';
export const isolate = (url: string): string => `${LRI}${url}${PDI}`;

/** The address that is shared: the canonical one, with the UTM tail when on. */
export function shareUrl(url: string, channel: ShareChannel, utm = true): string {
  if (!utm) return url;
  const next = new URL(url);
  next.searchParams.set('utm_source', channel);
  next.searchParams.set('utm_medium', 'share');
  next.searchParams.set('utm_campaign', 'listing');
  return next.toString();
}

const encode = encodeURIComponent;

/** Cuts at a word boundary, never inside a word and never an address (the address is appended after this). */
export function truncate(text: string, max = 200): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s–,;:.-]+$/, '') + '…';
}

/** "Birtok a Balaton-felvidéken – 225 000 € – FINDDOME": the title, the price when the listing has one, the brand. */
export function shareText(input: { title: string; price?: string | null; brand?: string }): string {
  const brand = input.brand ?? 'FINDDOME';
  const tail = ` – ${brand}`;
  const price = input.price ? ` – ${input.price}` : '';
  return truncate(input.title.trim(), 200 - price.length - tail.length) + price + tail;
}

export const facebookUrl = (url: string, utm = true): string => `https://www.facebook.com/sharer/sharer.php?u=${encode(shareUrl(url, 'facebook', utm))}`;

/** No phone number: that is what makes it a share and not a contact. */
export function whatsappUrl(text: string, url: string, opts: { utm?: boolean; rtl?: boolean } = {}): string {
  const address = shareUrl(url, 'whatsapp', opts.utm ?? true);
  return `https://wa.me/?text=${encode(`${text} ${opts.rtl ? isolate(address) : address}`)}`;
}

/** Line breaks are CRLF (%0D%0A), spaces are %20, never "+": `mailto:` is not a form. */
export function mailtoUrl(input: { subject: string; intro: string; text: string; url: string; utm?: boolean; rtl?: boolean }): string {
  const address = shareUrl(input.url, 'email', input.utm ?? true);
  const body = [input.intro, input.text, input.rtl ? isolate(address) : address].join('\r\n');
  return `mailto:?subject=${encode(input.subject)}&body=${encode(body)}`;
}
