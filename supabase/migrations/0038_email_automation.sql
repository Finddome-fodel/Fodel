-- 0038: E-mail automatizáció — templates, bulk and scheduled sends, signature,
-- suppression list, open/click tracking, and the two automatic replies.
--
-- Run by hand in the Supabase SQL editor, any time after 0037. Safe to run twice.
-- Run it BEFORE the deploy that ships /portal/email: the pages read these tables.
--
-- How it fits together (src/lib/mail/):
--   mail_templates        an admin-designed HTML email, written in one language,
--                         with {{merge_fields}} and "simple editor" markers
--   mail_signatures       the sender block appended under every template email
--   mail_send_jobs        one bulk or scheduled send; its recipients are frozen
--   mail_send_recipients  into this table when the job is created, so a run that
--                         dies half-way resumes without sending anyone twice
--   mail_messages         every email that actually left (manual, bulk, automatic)
--   mail_events           what Resend reported back: delivered, opened, clicked, bounced
--   mail_suppressions     addresses no bulk or automatic email may go to again
--   mail_webhook_events   Resend webhook deliveries, for idempotency
--
-- The lifecycle emails (registration, invoices, listing status) are NOT stored
-- here and never consult the suppression list: they are transactional.
--
-- Named mail_* because email_templates already exists (the invite wording, 0014).
-- All of it is admin-only: RLS through is_admin(), no anon grants.

/* ── Signatures ─────────────────────────────────────────────────────────── */

create table if not exists mail_signatures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  phone text,
  email text,
  website_url text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists mail_signatures_one_default on mail_signatures ((true)) where is_default;

drop trigger if exists mail_signatures_updated_at on mail_signatures;
create trigger mail_signatures_updated_at before update on mail_signatures
  for each row execute function set_updated_at();

/* ── Templates ──────────────────────────────────────────────────────────── */
-- `locale` is the language the template is written in: one template, one
-- language. A bulk send can filter its recipients to that language.
-- `automation` marks the template the site sends by itself, one per kind and
-- language: 'enquiry' (someone asked about a listing) and 'search_request'
-- (the free search service form). Without a matching active template the
-- built-in acknowledgement goes out as before.

create table if not exists mail_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body_html text not null,
  locale text not null default 'hu',
  signature_id uuid references mail_signatures (id) on delete set null,
  linked_property_id uuid references properties (id) on delete set null,
  active boolean not null default false,
  automation text check (automation in ('enquiry', 'search_request')),
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists mail_templates_one_automation_per_locale
  on mail_templates (automation, locale) where automation is not null;

drop trigger if exists mail_templates_updated_at on mail_templates;
create trigger mail_templates_updated_at before update on mail_templates
  for each row execute function set_updated_at();

/* ── Send jobs ──────────────────────────────────────────────────────────── */
-- `status` is system state, not a setting: DRAFT → SCHEDULED → RUNNING →
-- COMPLETED | PARTIAL | FAILED, or CANCELLED before it starts.

create table if not exists mail_send_jobs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references profiles (id) on delete set null,
  template_id uuid not null references mail_templates (id) on delete restrict,
  name text,
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED')),
  scheduled_at timestamptz,
  filter_snapshot jsonb not null default '{}'::jsonb,
  total_recipients integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  skipped_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists mail_send_jobs_due_idx on mail_send_jobs (status, scheduled_at)
  where status in ('SCHEDULED', 'RUNNING');

drop trigger if exists mail_send_jobs_updated_at on mail_send_jobs;
create trigger mail_send_jobs_updated_at before update on mail_send_jobs
  for each row execute function set_updated_at();

-- One row per recipient per job, frozen at creation. A recipient is an address
-- plus where it came from (`audience` + `audience_id`: an owner's profile, an
-- enquiry, a newsletter subscriber, a search request) — FINDDOME has no single
-- contacts table, so the email itself is the identity and is unique per job.
create table if not exists mail_send_recipients (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references mail_send_jobs (id) on delete cascade,
  email text not null,
  name text,
  locale text not null default 'hu',
  audience text not null check (audience in ('owner', 'enquiry', 'newsletter', 'search_request')),
  audience_id uuid,
  property_id uuid references properties (id) on delete set null,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'SKIPPED_SUPPRESSED')),
  claimed_at timestamptz,
  message_id uuid,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, email)
);
create index if not exists mail_send_recipients_pending_idx on mail_send_recipients (job_id, status)
  where status in ('PENDING', 'PROCESSING');

-- The atomic claim: `for update skip locked` means two runs working the same
-- job (the minute cron and an admin's "send now") never get the same row.
-- A row stuck in PROCESSING for 5 minutes belonged to a run that was killed
-- mid-batch (function time limit) and is handed out again.
create or replace function claim_mail_send_recipients(p_job_id uuid, p_batch_size integer)
returns setof mail_send_recipients
language sql
as $$
  update mail_send_recipients
  set status = 'PROCESSING', claimed_at = now()
  where id in (
    select id from mail_send_recipients
    where job_id = p_job_id
      and (status = 'PENDING' or (status = 'PROCESSING' and claimed_at < now() - interval '5 minutes'))
    order by created_at
    limit p_batch_size
    for update skip locked
  )
  returning *;
$$;
revoke all on function claim_mail_send_recipients(uuid, integer) from public, anon;
grant execute on function claim_mail_send_recipients(uuid, integer) to authenticated, service_role;

/* ── Sent messages and what happened to them ────────────────────────────── */

create table if not exists mail_messages (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references mail_templates (id) on delete set null,
  job_id uuid references mail_send_jobs (id) on delete set null,
  source text not null check (source in ('MANUAL', 'AUTOMATION', 'BULK_JOB')),
  to_email text not null,
  to_name text,
  audience text,
  audience_id uuid,
  property_id uuid references properties (id) on delete set null,
  locale text,
  subject text not null,
  body_html text not null,
  resend_id text,
  status text not null default 'SENT' check (status in ('SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED')),
  sent_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists mail_messages_created_idx on mail_messages (created_at desc);
create unique index if not exists mail_messages_resend_idx on mail_messages (resend_id) where resend_id is not null;
create index if not exists mail_messages_job_idx on mail_messages (job_id) where job_id is not null;

alter table mail_send_recipients drop constraint if exists mail_send_recipients_message_fk;
alter table mail_send_recipients add constraint mail_send_recipients_message_fk
  foreign key (message_id) references mail_messages (id) on delete set null;

create table if not exists mail_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references mail_messages (id) on delete cascade,
  type text not null check (type in ('DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED')),
  url text,
  link_type text,
  occurred_at timestamptz not null default now()
);
create index if not exists mail_events_message_idx on mail_events (message_id, type);

create table if not exists mail_suppressions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  reason text not null check (reason in ('BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED', 'MANUAL')),
  note text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists mail_suppressions_email_idx on mail_suppressions (lower(email));

create table if not exists mail_webhook_events (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  type text,
  payload jsonb not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'PROCESSED', 'FAILED')),
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

/* ── Access: admins only ────────────────────────────────────────────────── */

do $$
declare t text;
begin
  foreach t in array array[
    'mail_signatures', 'mail_templates', 'mail_send_jobs', 'mail_send_recipients',
    'mail_messages', 'mail_events', 'mail_suppressions', 'mail_webhook_events'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists %I on %I', t || '_admin', t);
    execute format('create policy %I on %I for all to authenticated using (is_admin()) with check (is_admin())', t || '_admin', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to service_role', t);
  end loop;
end $$;

/* ── Images uploaded in the template editor ─────────────────────────────── */
-- Public: an email can only show an image anyone can fetch. Admin-only writes.

insert into storage.buckets (id, name, public)
values ('mail-media', 'mail-media', true)
on conflict (id) do nothing;

drop policy if exists "mail_media_objects_read" on storage.objects;
create policy "mail_media_objects_read" on storage.objects
  for select using (bucket_id = 'mail-media');
drop policy if exists "mail_media_objects_insert" on storage.objects;
create policy "mail_media_objects_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'mail-media' and is_admin());
drop policy if exists "mail_media_objects_delete" on storage.objects;
create policy "mail_media_objects_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'mail-media' and is_admin());

/* ── The minute dispatcher (optional, recommended) ──────────────────────── */
-- Vercel's own cron runs /api/cron/mail once a day as a safety net. For a send
-- scheduled at 14:30 to go at 14:30, Supabase calls the same endpoint every
-- minute (pg_cron + pg_net). The address and the secret live in Supabase Vault,
-- never in git; until both are set the job does nothing. Set them once:
--
--   select vault.create_secret('https://finddome.com/api/cron/mail', 'mail_cron_url');
--   select vault.create_secret('<the CRON_SECRET value from Vercel>', 'cron_secret');
--
-- If pg_cron / pg_net cannot be enabled on the project, skip this block: the
-- daily cron and the "Folytatás most" button on a job still send everything.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create or replace function dispatch_mail_jobs() returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  target text;
  secret text;
begin
  -- Nothing due, nothing to call: most minutes end here.
  if not exists (
    select 1 from mail_send_jobs where status in ('SCHEDULED', 'RUNNING') and scheduled_at <= now()
  ) then
    return;
  end if;
  select decrypted_secret into target from vault.decrypted_secrets where name = 'mail_cron_url' limit 1;
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'cron_secret' limit 1;
  if target is null or secret is null then
    return;
  end if;
  perform net.http_post(
    url := target,
    headers := jsonb_build_object('Authorization', 'Bearer ' || secret, 'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 25000
  );
end;
$$;
revoke all on function dispatch_mail_jobs() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'dispatch-mail-jobs';
select cron.schedule('dispatch-mail-jobs', '* * * * *', 'select public.dispatch_mail_jobs()');
