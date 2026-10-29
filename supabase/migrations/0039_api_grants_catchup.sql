-- 0039: Data API grants catch-up (Fodel ingatlan)
--
-- Run by hand in the Supabase SQL editor AFTER every other migration (0001–0038).
-- Safe to run twice.
--
-- From 2026-10-30 Supabase no longer auto-grants Data API access to new
-- tables in "public". Tables created by earlier migrations would therefore be
-- unreachable from supabase-js on a fresh replay (new project, preview branch,
-- `supabase db reset`). This restores the previous default for exactly those
-- tables: select/insert/update/delete for anon, authenticated, service_role.
--
-- Safe on the live database: a role that already has any privilege on a
-- table is left untouched, so existing grants are never widened.
-- Never re-granted: (table, role) pairs this project's migrations REVOKEd.
-- RLS-disabled tables only get service_role (a NOTICE lists them).
-- Every table created after this migration needs its own GRANT statements.

do $grants$
declare
  -- REVOKEd on purpose by earlier migrations (0021, 0022, 0028), plus the
  -- admin-only mail_* tables of 0038, which must never be granted to anon.
  excluded text[] := array[
    'invoice_counters:anon', 'invoice_counters:authenticated',
    'property_private:anon', 'property_price_history:anon', 'property_promotion_requests:anon',
    'mail_signatures:anon', 'mail_templates:anon', 'mail_send_jobs:anon', 'mail_send_recipients:anon',
    'mail_messages:anon', 'mail_events:anon', 'mail_suppressions:anon', 'mail_webhook_events:anon'
  ]::text[];
  api_role text;
  obj record;
begin
  for obj in
    select c.oid, c.relname, c.relkind, c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'v', 'm', 'f', 'S')
      and not exists (
        select 1 from pg_depend dep where dep.objid = c.oid and dep.deptype = 'e'
      )
  loop
    foreach api_role in array array['anon', 'authenticated', 'service_role'] loop
      continue when (obj.relname || ':' || api_role) = any (excluded);

      if obj.relkind = 'S' then
        if not has_sequence_privilege(api_role, obj.oid, 'USAGE, SELECT, UPDATE') then
          execute format('grant usage, select on sequence public.%I to %I', obj.relname, api_role);
        end if;
        continue;
      end if;

      continue when has_table_privilege(api_role, obj.oid, 'SELECT, INSERT, UPDATE, DELETE');

      if obj.relkind in ('r', 'p') and not obj.relrowsecurity and api_role <> 'service_role' then
        raise notice 'RLS disabled on public.%, not granting % (enable RLS, then grant)', obj.relname, api_role;
        continue;
      end if;

      if obj.relkind = 'm' then
        execute format('grant select on public.%I to %I', obj.relname, api_role);
      else
        execute format('grant select, insert, update, delete on public.%I to %I', obj.relname, api_role);
      end if;
    end loop;
  end loop;
end
$grants$;
