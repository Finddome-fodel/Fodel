/**
 * The latest videos of FINDDOME's YouTube channel, for the landing page.
 *
 * Read from the channel's public RSS feed on the server: no API key, no script
 * from YouTube on the page (the player loads only on a click, from the
 * privacy-enhanced domain). Cached in memory for 20 minutes per server
 * instance; if YouTube is slow or down the last good list is kept, and with
 * nothing to show the landing page simply leaves the strip out.
 */
export const YOUTUBE = {
  channelId: 'UCDzQUK-WPU7PwIxe6Dlb4rQ',
  handle: '@FODEL.REAL.ESTATE',
  url: 'https://www.youtube.com/@FODEL.REAL.ESTATE/videos',
} as const;

export type ChannelVideo = {
  id: string;
  title: string;
  /** ISO timestamp. */
  published: string;
};

const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE.channelId}`;
const TTL_MS = 20 * 60 * 1000;
const TIMEOUT_MS = 3500;

let cache: { at: number; videos: ChannelVideo[] } | null = null;

const entities: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };
const decode = (value: string) => value.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (m) => entities[m] ?? m);

/**
 * Upload titles on this channel carry the office phone number, the e-mail address and the
 * old domain after the description ("House for SALE 110.000 € 00316-4400-5550 FODEL@ELADOD.COM
 * FODEL.NL"). On the website that is noise: keep what comes before it.
 */
export function cleanTitle(raw: string): string {
  let title = decode(raw)
    .replace(/\S+@\S+/g, ' ')
    .replace(/\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:nl|hu|com|eu|de|uk|at|ch|us)\b\S*/gi, ' ')
    .replace(/(?:\+|00)?\d[\d\s\-–()]{7,}\d/g, (m) => (/€|ft|eur/i.test(m) || /^\d{1,3}([.,]\d{3})+$/.test(m.trim()) ? m : ' '));
  title = title.replace(/\s+/g, ' ').replace(/[\s|\-–—,:;]+$/g, '').trim();
  return title || decode(raw).trim();
}

export function parseFeed(xml: string): ChannelVideo[] {
  const videos: ChannelVideo[] = [];
  for (const entry of xml.split('<entry>').slice(1)) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title || !published || !/^[\w-]{11}$/.test(id)) continue;
    videos.push({ id, title: cleanTitle(title), published });
  }
  return videos.sort((a, b) => b.published.localeCompare(a.published));
}

export async function latestVideos(limit = 8): Promise<ChannelVideo[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.videos.slice(0, limit);
  try {
    const response = await fetch(FEED, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`youtube feed ${response.status}`);
    const videos = parseFeed(await response.text());
    if (videos.length) cache = { at: Date.now(), videos };
    else if (cache) cache.at = Date.now() - TTL_MS + 60_000; // retry in a minute
  } catch {
    if (cache) cache.at = Date.now() - TTL_MS + 60_000;
  }
  return (cache?.videos ?? []).slice(0, limit);
}
