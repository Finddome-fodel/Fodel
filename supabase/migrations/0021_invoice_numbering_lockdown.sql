-- 0021_invoice_numbering_lockdown.sql
--
-- invoice_counters (0008) is the gap-free invoice numbering state, but it was
-- created without row level security. Supabase grants anon/authenticated full
-- table access by default, so the public anon key (which ships in every
-- visitor's browser) could read and rewrite the counters through PostgREST —
-- skipped or duplicated invoice numbers, which is a bookkeeping and legal problem.
--
-- The app only ever touches this table from the server with the service-role
-- client (src/pages/api/portal/settings/invoicing.ts and its .astro page read/seed it) or
-- through the security-definer numbering functions, so no policy is needed:
-- RLS on with no policy denies anon/authenticated outright, while service_role
-- and the function owner bypass RLS.
--
-- Run order: after 0020. Touches only invoice_counters and the two numbering
-- functions — no other table.

/* ── The counter table: no access for the public API roles ─────────────── */
alter table public.invoice_counters enable row level security;
revoke all on public.invoice_counters from anon, authenticated;
-- Stated explicitly so service_role never depends on the default privileges.
grant select, insert, update on public.invoice_counters to service_role;

/* ── The numbering functions: server-side callers only ─────────────────── */
-- Both are security definer and burn a number, but Postgres grants EXECUTE to
-- PUBLIC by default, and Supabase additionally grants it to anon and
-- authenticated — so anyone could call them via /rest/v1/rpc/…
--   finalise_invoice(uuid)  — live path (0018), called from src/lib/invoicing/store.ts
--   issue_invoice(...)      — 0008 legacy; its only wrapper (src/lib/invoice.ts)
--                             has no callers, but the function is still deployed
revoke execute on function public.finalise_invoice(uuid) from public, anon, authenticated;
grant execute on function public.finalise_invoice(uuid) to service_role;

revoke execute on function public.issue_invoice(
  uuid, text, uuid, uuid, text, text, jsonb, integer, integer, numeric, uuid
) from public, anon, authenticated;
grant execute on function public.issue_invoice(
  uuid, text, uuid, uuid, text, text, jsonb, integer, integer, numeric, uuid
) to service_role;
