/**
 * The "simple editor": a template's HTML carries marked spots —
 *   <span data-editable="key" data-editable-label="...">text</span>
 *   <img data-editable-image="key" data-editable-label="..." src="...">
 * — and the editor reads and writes exactly those, leaving every other byte of
 * the layout alone. The markers have no styling of their own; to a mail client
 * they are an ordinary span and image.
 *
 * Pure string functions, imported by the editor in the browser and by the
 * save endpoint on the server.
 */

export type EditableField = { key: string; label: string; value: string };
export type EditableImage = { key: string; label: string; src: string };

/**
 * Marks a spot the admin still has to fill in. Always Hungarian, whatever the
 * template's language: it is an instruction to the admin, never meant to reach
 * a recipient (a send is refused while one is left — see send.ts).
 */
export const TEMPLATE_PLACEHOLDER_PREFIX = '[Írja át:';

const FIELD_RE = /<span data-editable="([a-zA-Z0-9_]+)" data-editable-label="([^"]*)">([\s\S]*?)<\/span>/g;
const IMG_TAG_RE = /<img\b[^>]*>/g;
const PLACEHOLDER_IMAGE_RE = /\/email\/placeholder-[a-z]+\.jpg/;

export function parseEditableFields(html: string): EditableField[] {
  return [...html.matchAll(FIELD_RE)].map((m) => ({ key: m[1], label: m[2], value: m[3] }));
}

export function parseEditableImages(html: string): EditableImage[] {
  const images: EditableImage[] = [];
  for (const tag of html.match(IMG_TAG_RE) ?? []) {
    const keyMatch = tag.match(/data-editable-image="([a-zA-Z0-9_]+)"/);
    if (!keyMatch) continue;
    const labelMatch = tag.match(/data-editable-label="([^"]*)"/);
    const srcMatch = tag.match(/src="([^"]*)"/);
    images.push({ key: keyMatch[1], label: labelMatch?.[1] ?? keyMatch[1], src: srcMatch?.[1] ?? '' });
  }
  return images;
}

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/** The span content is HTML-escaped; the editor shows (and edits) the plain text. */
export function unescapeHtml(text: string): string {
  return text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&');
}

/** No effect when the key is gone (someone deleted the marker in the HTML source). */
export function applyEditableFieldUpdate(html: string, key: string, newText: string): string {
  const re = new RegExp(`(<span data-editable="${key}" data-editable-label="[^"]*">)([\\s\\S]*?)(</span>)`);
  if (!re.test(html)) return html;
  return html.replace(re, (_match, open: string, _old: string, close: string) => `${open}${escapeHtml(newText)}${close}`);
}

export function applyEditableImageUpdate(html: string, key: string, newSrc: string): string {
  return html.replace(IMG_TAG_RE, (tag) => {
    if (!tag.includes(`data-editable-image="${key}"`)) return tag;
    return tag.replace(/src="[^"]*"/, `src="${newSrc.replace(/"/g, '&quot;')}"`);
  });
}

/**
 * A button's address: `<a data-editable-link="key" data-editable-label="..." href="...">`.
 * Only the property template's own link is a merge field ({{property_url}});
 * a general letter's button points wherever the admin says.
 */
export type EditableLink = { key: string; label: string; href: string };
const LINK_TAG_RE = /<a\b[^>]*data-editable-link="[^"]*"[^>]*>/g;

export function parseEditableLinks(html: string): EditableLink[] {
  return (html.match(LINK_TAG_RE) ?? []).map((tag) => ({
    key: tag.match(/data-editable-link="([a-zA-Z0-9_]+)"/)?.[1] ?? '',
    label: tag.match(/data-editable-label="([^"]*)"/)?.[1] ?? '',
    href: unescapeHtml(tag.match(/href="([^"]*)"/)?.[1] ?? ''),
  })).filter((link) => link.key);
}

export function applyEditableLinkUpdate(html: string, key: string, newHref: string): string {
  return html.replace(LINK_TAG_RE, (tag) => {
    if (!tag.includes(`data-editable-link="${key}"`)) return tag;
    return tag.replace(/href="[^"]*"/, `href="${newHref.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`);
  });
}

export function isPlaceholderText(value: string): boolean {
  return value.includes(TEMPLATE_PLACEHOLDER_PREFIX);
}

export function isPlaceholderImage(src: string): boolean {
  return PLACEHOLDER_IMAGE_RE.test(src);
}

/** Everything still to fill in, by label — the editor's to-do list and the send guard. */
export function unfinishedParts(html: string): string[] {
  return [
    ...parseEditableImages(html).filter((image) => isPlaceholderImage(image.src)).map((image) => image.label),
    ...parseEditableFields(html).filter((field) => isPlaceholderText(field.value)).map((field) => field.label),
  ];
}

/**
 * The parts of a property template that describe one particular listing. A
 * template started from another one gets these marked "to fill in" (with the
 * old text kept as a hint), so a second listing's email cannot go out quietly
 * carrying the first one's description. Merge fields ({{property_title}} …)
 * are filled at send time and need no marking.
 */
export const PROPERTY_SPECIFIC_FIELD_KEYS = ['location_eyebrow', 'hero_title', 'description', 'stat1_value', 'stat2_value'] as const;
const PROPERTY_SPECIFIC_IMAGE_KEYS = ['main_photo'] as const;

export const PLACEHOLDER_PHOTO_PATH = '/email/placeholder-photo.jpg';

export function markPropertySpecificParts(html: string, siteUrl: string): string {
  let result = html;
  const keys = new Set<string>(PROPERTY_SPECIFIC_FIELD_KEYS);
  for (const field of parseEditableFields(html)) {
    if (!keys.has(field.key)) continue;
    const text = unescapeHtml(field.value).trim();
    if (!text || text.includes('{{') || isPlaceholderText(text)) continue;
    result = applyEditableFieldUpdate(result, field.key, `${TEMPLATE_PLACEHOLDER_PREFIX} ${text}]`);
  }
  for (const image of parseEditableImages(result)) {
    if ((PROPERTY_SPECIFIC_IMAGE_KEYS as readonly string[]).includes(image.key) && !isPlaceholderImage(image.src)) {
      result = applyEditableImageUpdate(result, image.key, `${siteUrl}${PLACEHOLDER_PHOTO_PATH}`);
    }
  }
  return result;
}

/**
 * Preview only: unfinished text gets a yellow highlight, placeholder images an
 * orange frame. Never part of the saved or sent HTML.
 */
export function highlightPlaceholdersForPreview(html: string): string {
  const style = "<style>img[src*='/email/placeholder-']{outline:4px solid #f79009!important;outline-offset:-4px}</style>";
  const marked = html.replace(
    /\[Írja át:[^\]]*\]/g,
    (m) => `<mark style="background:#fedf89;color:#7a2e0e;padding:0 2px;border-radius:2px">${m}</mark>`
  );
  return marked.includes('</head>') ? marked.replace('</head>', `${style}</head>`) : style + marked;
}
