/**
 * Listing videos are YouTube links (the owner uploads to YouTube, "unlisted" works too). Shared by
 * VideoEmbed.astro (rendering), PropertyDetailPage.astro (VideoObject JSON-LD) and the listing form's
 * server check, so what the form accepts is exactly what the page can play.
 */
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const VIDEO_ID = /^[\w-]{11}$/;

export function extractYouTubeId(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const host = u.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be' || host === 'www.youtu.be') id = u.pathname.split('/')[1] ?? null;
    else if (YOUTUBE_HOSTS.has(host)) {
      id = u.pathname === '/watch' ? u.searchParams.get('v') : (u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)?.[1] ?? null);
    }
    return id && VIDEO_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}
