import type { APIRoute } from 'astro';
export const prerender=false;
export const POST:APIRoute=()=>Response.json({error:'gone'},{status:410});
