export const prerender = false;

import type { APIContext } from 'astro';
import { blogFeed } from '~/lib/blog-feed';

export const GET = (context: APIContext) => blogFeed('de', context);
