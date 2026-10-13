-- FODEL 4.0 — invoicing v2: drafts, proformas (díjbekérő), buyer data, VAT
-- treatment, HUF equivalent, delivery tracking, and the bookkeeper copy.
-- Builds on 0008 (the counter table, immutability and RLS stay). Not run by
-- Claude: the invoice screens say so plainly until it has been run.
--
-- How to run this: Supabase → SQL Editor → New query → paste this whole file → Run.

/* ── invoices: what a manual / bilingual / B2B invoice needs ────────────── */
alter table invoices alter column payment_id drop not null;
alter table invoices alter column number drop not null;
alter table invoices alter column finalised_at drop not null;
alter table invoices alter column finalised_at drop default;
alter table invoices alter column billing_name drop not null;
alter table invoices alter column billing_address drop not null;

-- 'proforma' is the díjbekérő (payment request): a numbered document, but not a
-- tax invoice, with its own series.
alter table invoices drop constraint if exists invoices_kind_check;
alter table invoices add constraint invoices_kind_check check (kind in ('invoice', 'credit_note', 'proforma'));

alter table invoices add column if not exists status text not null default 'issued';
alter table invoices drop constraint if exists invoices_status_check;
alter table invoices add constraint invoices_status_check check (status in ('draft', 'issued', 'sent', 'paid', 'void'));

-- Snapshots. An invoice must still read correctly years later, after the
-- company's address or the customer's details have changed.
alter table invoices add column if not exists issuer jsonb;
alter table invoices add column if not exists buyer jsonb;

-- 'nl_standard' (Dutch VAT), 'reverse_charge' (EU business with a VAT id, 0%),
-- 'outside_scope' (customer outside the EU, 0%), 'custom' (any other rate, e.g. OSS).
alter table invoices add column if not exists vat_treatment text not null default 'nl_standard';
-- 'gross': the line prices already contain the VAT (the public price list, card payments).
-- 'net': the lines are ex-VAT and the VAT is added on top (business invoices).
alter table invoices add column if not exists price_mode text not null default 'gross';

alter table invoices add column if not exists payment_method text not null default 'transfer';
alter table invoices add column if not exists due_date date;
-- HUF per 1 EUR, when the invoice also states a forint amount (Hungarian customers).
alter table invoices add column if not exists fx_rate numeric;
alter table invoices add column if not exists fx_date date;
-- Free text under "Hivatkozás", and the proforma this invoice settles.
alter table invoices add column if not exists reference text;
alter table invoices add column if not exists reference_id uuid references invoices (id);
alter table invoices add column if not exists notes text;
alter table invoices add column if not exists locale text not null default 'hu';

-- Delivery and settlement tracking. These are the only columns that may change
-- after an invoice is finalised.
alter table invoices add column if not exists sent_at timestamptz;
alter table invoices add column if not exists sent_to text;
alter table invoices add column if not exists bookkeeper_sent_at timestamptz;
alter table invoices add column if not exists paid_at timestamptz;
alter table invoices add column if not exists paid_note text;
alter table invoices add column if not exists created_by uuid references profiles (id) on delete set null;

create index if not exists invoices_status_idx on invoices (status);
create index if not exists invoices_issued_idx on invoices (issued_at desc);

/* ── The immutability trigger, now with room for tracking ───────────────── */
create or replace function reject_finalised_invoice_update() returns trigger as $$
declare
  tracking text[] := array['status', 'sent_at', 'sent_to', 'bookkeeper_sent_at', 'paid_at', 'paid_note', 'updated_at'];
begin
  if old.finalised_at is not null then
    if (to_jsonb(new) - tracking) is distinct from (to_jsonb(old) - tracking) then
      raise exception 'invoice % is finalised and cannot be modified — issue a credit_note instead', old.number;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function reject_finalised_invoice_delete() returns trigger as $$
begin
  if old.finalised_at is not null then
    raise exception 'invoice % is finalised and cannot be deleted', old.number;
  end if;
  return old;
end;
$$ language plpgsql;

drop trigger if exists invoices_reject_delete on invoices;
create trigger invoices_reject_delete
  before delete on invoices
  for each row execute function reject_finalised_invoice_delete();

/* ── Numbering: finalise a draft ────────────────────────────────────────── */
-- Series (gap-free, one counter each), shown as <series>/<nnn>:
--   invoice, Hungarian customer → FO-HU-2026/031
--   invoice, anyone else        → FO-NL-2026/001
--   proforma (díjbekérő)        → FO-2026/032
--   credit note                 → FO-CN-2026/001
-- The number is allocated and the row finalised in one function call, so one
-- transaction: a crash can never leave a gap. Drafts have no number at all,
-- which is why deleting a draft is always safe.
create or replace function finalise_invoice(p_id uuid) returns invoices as $$
declare
  r invoices;
  v_year text;
  v_series text;
  v_n integer;
begin
  select * into r from invoices where id = p_id for update;
  if not found then
    raise exception 'invoice % not found', p_id;
  end if;
  if r.finalised_at is not null then
    return r; -- idempotent: a double click must not burn a number
  end if;

  v_year := to_char(coalesce(r.issued_at, now()), 'YYYY');
  v_series := case r.kind
    when 'proforma' then 'FO-' || v_year
    when 'credit_note' then 'FO-CN-' || v_year
    else 'FO-' || case when upper(coalesce(r.buyer ->> 'countryCode', '')) = 'HU' then 'HU' else 'NL' end || '-' || v_year
  end;

  insert into invoice_counters (series, n) values (v_series, 1)
  on conflict (series) do update set n = invoice_counters.n + 1
  returning n into v_n;

  update invoices
     set number = v_series || '/' || lpad(v_n::text, 3, '0'),
         finalised_at = now(),
         status = case when r.status = 'draft' then (case when r.paid_at is not null then 'paid' else 'issued' end) else r.status end
   where id = p_id
  returning * into r;
  return r;
end;
$$ language plpgsql security definer;

/* ── RLS: an owner sees their own finalised documents, never drafts ─────── */
drop policy if exists invoices_owner_read on invoices;
create policy invoices_owner_read on invoices for select
  using (owner_id = auth.uid() and finalised_at is not null);

/* ── Invoice settings: admin-only (site_settings is publicly readable) ───── */
-- bookkeeper address, payment terms, default notes, bank wording.
create table if not exists invoice_settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into invoice_settings (id) values (1) on conflict (id) do nothing;
alter table invoice_settings enable row level security;
drop policy if exists invoice_settings_admin_all on invoice_settings;
create policy invoice_settings_admin_all on invoice_settings for all using (is_admin());

/* ── The buyer's own billing details, kept once and reused ──────────────── */
-- { type: 'person' | 'company', name, company, country, countryCode, postalCode,
--   city, street, taxNumber, phone } — filled by the owner in Settings or on
-- the "awaiting payment" step, copied onto every order and invoice.
alter table profiles add column if not exists billing jsonb;
alter table payments add column if not exists billing jsonb;
