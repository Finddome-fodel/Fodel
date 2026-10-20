/**
 * Blog and case studies — public reads, Supabase-backed since FODEL 1.2.
 * RLS is what actually stops an unpublished or future-dated post being read
 * with the anon key (migration 0014); this file only shapes it, and applies
 * the same "published and already due" rule again so the query is honest
 * even on a database where 0014 has not run yet.
 *
 * 2.1 (brief §5): four languages, each version its own row, linked through
 * `group_id` but written and published separately — a missing translation is
 * simply a missing row, never a fallback to another language. Case studies
 * are the same rows with `kind = 'case_study'`, so they share the language
 * and publishing rules, and never mix into the article lists by accident.
 *
 * PostgREST returns every timestamp as an ISO string, but articleSchema() /
 * formatDate() take a real `Date` — coerced once here, at the query boundary.
 */
import { getSupabase } from '~/lib/supabase';
import { LOCALES, isLocale, path, type Locale } from '~/i18n/ui';

/** Every site language can hold posts (the `locale_code` enum has had all five from the start). */
export const BLOG_LOCALES = LOCALES;
export type BlogLocale = Locale;
export type BlogKind = 'article' | 'case_study';

/** Title of a language version that exists only as a slot, waiting for its own text. Never publishable. */
export const PLACEHOLDER_PREFIX = '[Fordításra vár]';

export function isBlogLocale(value: unknown): value is BlogLocale {
  return typeof value === 'string' && isLocale(value);
}

/** Public index per language, from the route table: /hu/blog/, /nl/nieuws/, /en/blog/ … */
export const BLOG_PATH: Record<BlogLocale, string> = Object.fromEntries(
  LOCALES.map((locale) => [locale, path(locale, 'blog')])
) as Record<BlogLocale, string>;

export function postPath(post: { locale: BlogLocale; slug: string }): string {
  return `${BLOG_PATH[post.locale]}${post.slug}/`;
}

/** Where a post is read in `locale`: its own page, or the language's stand-in for it. */
export function postPathIn(locale: BlogLocale, slug: string): string {
  return `${BLOG_PATH[locale]}${slug}/`;
}

export type BlogPost = {
  id: string;
  group_id: string | null;
  locale: BlogLocale;
  kind: BlogKind;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  category: string;
  cover_url: string | null;
  cover_alt: string | null;
  og_image_url: string | null;
  author: string;
  reading_minutes: number;
  seo_title: string | null;
  seo_description: string | null;
  featured: boolean;
  published: boolean;
  published_at: Date | null;
  updated_at: Date;
  case_sources: string | null;
  case_method: string | null;
  case_results: string | null;
};

function coerce(row: any): BlogPost {
  return {
    ...row,
    kind: row.kind === 'case_study' ? 'case_study' : 'article',
    case_sources: row.case_sources ?? null,
    case_method: row.case_method ?? null,
    case_results: row.case_results ?? null,
    published_at: row.published_at ? new Date(row.published_at) : null,
    updated_at: new Date(row.updated_at),
  };
}

/** Published, and its publication time has arrived. */
function live(query: any) {
  return query.eq('published', true).not('published_at', 'is', null).lte('published_at', new Date().toISOString());
}

/**
 * Every live post in one language, newest publication first. The order is the
 * publication date, never the last edit — fixing a typo must not lift an old
 * piece to the top.
 */
export async function publishedPosts(locale: BlogLocale, opts: { kind?: BlogKind } = {}): Promise<BlogPost[]> {
  // A failed read yields an empty list, never an error page: every caller
  // (homepage band, bridge pages, index) already renders "no posts" correctly.
  try {
    const { data, error } = await live(getSupabase().from('blog_posts').select('*').eq('locale', locale)).order(
      'published_at',
      { ascending: false }
    );
    if (error) throw new Error(error.message);
    const posts = (data ?? []).map(coerce);
    return opts.kind ? posts.filter((post: BlogPost) => post.kind === opts.kind) : posts;
  } catch (error) {
    console.error('[blog] could not read posts', error);
    return [];
  }
}

/** The homepage band: the newest `limit` articles in this language — case studies excluded. */
export async function latestArticles(locale: BlogLocale, limit = 3): Promise<BlogPost[]> {
  return (await publishedPosts(locale, { kind: 'article' })).slice(0, limit);
}

export async function postBySlug(locale: BlogLocale, slug: string): Promise<BlogPost | null> {
  const { data } = await live(getSupabase().from('blog_posts').select('*').eq('locale', locale).eq('slug', slug)).maybeSingle();
  return data ? coerce(data) : null;
}

/**
 * The live sibling of a post in another language — the basis for real
 * hreflang. Null for an unlinked post or an unpublished sibling, which is the
 * normal case, not an error: most posts have no translation at all.
 */
export async function siblingPost(post: BlogPost, siblingLocale: BlogLocale): Promise<BlogPost | null> {
  if (!post.group_id) return null;
  const { data } = await live(
    getSupabase().from('blog_posts').select('*').eq('group_id', post.group_id).eq('locale', siblingLocale)
  ).maybeSingle();
  return data ? coerce(data) : null;
}

/* ── Showing a post in a language it was not written in ───────────────────
   Posts are written, linked (group_id) and published per language. English,
   German and French have few of their own, so rather than hiding the Dutch
   (or Hungarian) articles from those readers, the page lists them in the
   reader's language with a note saying which language the text is in. Hungarian
   and Dutch never borrow: a missing translation there is simply a missing row.
   ----------------------------------------------------------------------- */

/** A post as one language's reader sees it. `from` is the language of the text. */
export type LocalizedPost = { post: BlogPost; from: BlogLocale };

const groupOf = (post: BlogPost) => post.group_id ?? post.id;

/** Every live post a `locale` reader can open: its own, then Dutch, then Hungarian ones with no better version. */
export async function localizedPosts(locale: BlogLocale, opts: { kind?: BlogKind } = {}): Promise<LocalizedPost[]> {
  const own = await publishedPosts(locale, opts);
  const result: LocalizedPost[] = own.map((post) => ({ post, from: locale }));
  if (locale === 'hu' || locale === 'nl') return result;

  const covered = new Set(own.map(groupOf));
  for (const source of ['nl', 'hu'] as const) {
    for (const post of await publishedPosts(source, opts)) {
      if (covered.has(groupOf(post))) continue;
      covered.add(groupOf(post));
      result.push({ post, from: source });
    }
  }
  const time = (entry: LocalizedPost) => (entry.post.published_at ?? entry.post.updated_at).getTime();
  return result.sort((a, b) => time(b) - time(a));
}

export async function latestLocalizedArticles(locale: BlogLocale, limit = 3): Promise<LocalizedPost[]> {
  return (await localizedPosts(locale, { kind: 'article' })).slice(0, limit);
}

/** The post at `slug` as a `locale` reader sees it: own language first, then Dutch, then Hungarian. */
export async function localizedPostBySlug(locale: BlogLocale, slug: string): Promise<LocalizedPost | null> {
  const own = await postBySlug(locale, slug);
  if (own) return { post: own, from: locale };
  if (locale === 'hu' || locale === 'nl') return null;
  for (const source of ['nl', 'hu'] as const) {
    const post = await postBySlug(source, slug);
    if (!post) continue;
    // A version in the reader's own language wins: the stand-in is only for
    // posts that have none.
    if (post.group_id && (await siblingPost(post, locale))) return null;
    return { post, from: source };
  }
  return null;
}

/** Every live language version of a post, for hreflang: one query, keyed by language. */
export async function siblingPosts(post: BlogPost): Promise<Partial<Record<BlogLocale, BlogPost>>> {
  if (!post.group_id) return { [post.locale]: post };
  const { data } = await live(getSupabase().from('blog_posts').select('*').eq('group_id', post.group_id));
  const found: Partial<Record<BlogLocale, BlogPost>> = {};
  for (const row of data ?? []) {
    const version = coerce(row);
    if (isBlogLocale(version.locale)) found[version.locale] = version;
  }
  found[post.locale] = post;
  return found;
}
