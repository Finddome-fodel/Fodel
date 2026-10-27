import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, redirect }) => {
  await locals.supabase.auth.signOut();
  return redirect('/portal/login');
};

// A bare link or a typed address must not look like a dead page: send the
// visitor to the sign-in page. Signing out stays POST-only so that a prefetch
// or a cross-site image can never end someone's session.
export const GET: APIRoute = ({ redirect }) => redirect('/portal/login');
