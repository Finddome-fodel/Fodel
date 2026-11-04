-- 0052 — Translation status: see every listing x language at a glance, fix a text by hand (FINDDOME, November 2026).
--
-- Run by hand in the Supabase SQL editor, after 0050 (or after 0045 if 0046-0050 have not
-- been run yet: nothing here needs them). Safe to run twice; one transaction; it changes no
-- existing listing text and no existing translation.
--
-- What it adds:
--   property_translations   needs_review      published, but a person should have a look (a title that
--                                              had to be shortened by the machine, say)
--                           manual_override   a person edited the text: a machine re-translation must
--                                              not replace it unless an admin confirms
--                           validated_at      when the text last passed the checks (or a person saved it)
--                           check_warnings    what the checks noticed, in words
--   translation_jobs        fail_code         why the last attempt failed (too-long, numbers, ...)
--                           partial_output    the last attempt's text, so an admin can fix just the title
--                           feedback          what a retry was told
--                           origin may now also be 'package' (translation packages, a later release)
--   properties              excluded_locales  languages an owner or admin switched off for this listing
--                                              (the column is used from here on; 0053 relies on it)
--   a trigger               a person's edit of a machine text marks it manual_override and keeps the
--                           fingerprint of the source it was made from, so "the Hungarian text changed
--                           since" still works after a hand edit
--   save_machine_translation   restated: also stores needs_review / warnings and clears manual_override
--   save_translation_override  admin only: save a hand-made text (the side-by-side editor)
--   translation_matrix      a view: for every listing and every language, the facts the admin overview
--                           needs (text, flags, latest job). Row-level security of the base tables
--                           applies (security_invoker).
--
-- Nothing here is public: no anon grant. After running: select count(*) from translation_matrix;
-- should return (number of listings) x (number of languages).
begin;

/* ── Flags on the translations ─────────────────────────────────────────── */

alter table property_translations add column if not exists needs_review boolean not null default false;
alter table property_translations add column if not exists manual_override boolean not null default false;
alter table property_translations add column if not exists validated_at timestamptz;
alter table property_translations add column if not exists check_warnings text[] not null default '{}';

/* ── Facts on the jobs ─────────────────────────────────────────────────── */

alter table translation_jobs add column if not exists fail_code text;
alter table translation_jobs add column if not exists partial_output jsonb;
alter table translation_jobs add column if not exists feedback text;

alter table translation_jobs drop constraint if exists translation_jobs_origin_check;
alter table translation_jobs add constraint translation_jobs_origin_check
  check (origin in ('upload_paid', 'after_publish_paid', 'admin', 'free', 'package'));

/* ── Languages switched off for one listing ────────────────────────────── */

alter table properties add column if not exists excluded_locales locale_code[] not null default '{}';

/* ── A hand edit of a machine text ─────────────────────────────────────── */
-- save_listing_editor (0043) clears `machine` and the fingerprint when the text really changed.
-- This trigger notes that a person took the text over and gives the fingerprint back, so the
-- overview can still tell that the source has changed since.

create or replace function property_translations_track_edit() returns trigger
language plpgsql as $$
begin
  if old.machine and not new.machine then
    new.manual_override := true;
    new.needs_review := false;
    new.check_warnings := '{}';
    new.validated_at := now();
    new.translated_from := coalesce(new.translated_from, old.translated_from);
    new.translated_at := coalesce(new.translated_at, old.translated_at);
    new.source_hash := coalesce(new.source_hash, old.source_hash);
  end if;
  return new;
end;
$$;

drop trigger if exists property_translations_track_edit on property_translations;
create trigger property_translations_track_edit before update on property_translations
  for each row execute function property_translations_track_edit();

/* ── Writing a machine translation (restated) ──────────────────────────── */
-- Same rule as 0043: a person's text is replaced only when the admin chose to overwrite.
-- New: the checks' verdict is stored, and a replaced hand edit stops being a manual override.

drop function if exists save_machine_translation(uuid, locale_code, locale_code, text, text, text, text, boolean);

create or replace function save_machine_translation(
  p_property uuid, p_locale locale_code, p_from locale_code,
  p_title text, p_description text, p_body text, p_hash text, p_overwrite boolean default false,
  p_needs_review boolean default false, p_warnings text[] default '{}'
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare written integer;
begin
  insert into property_translations (property_id, locale, title, description, body, machine, translated_from, translated_at, source_hash,
                                     needs_review, manual_override, validated_at, check_warnings)
  values (p_property, p_locale, p_title, p_description, coalesce(p_body, ''), true, p_from, now(), p_hash,
          coalesce(p_needs_review, false), false, now(), coalesce(p_warnings, '{}'))
  on conflict (property_id, locale) do update
    set title = excluded.title, description = excluded.description, body = excluded.body,
        machine = true, translated_from = excluded.translated_from, translated_at = excluded.translated_at, source_hash = excluded.source_hash,
        needs_review = excluded.needs_review, manual_override = false, validated_at = excluded.validated_at, check_warnings = excluded.check_warnings
    where property_translations.machine or p_overwrite;
  get diagnostics written = row_count;
  return written > 0;
end;
$$;
revoke all on function save_machine_translation(uuid, locale_code, locale_code, text, text, text, text, boolean, boolean, text[]) from public, anon, authenticated;
grant execute on function save_machine_translation(uuid, locale_code, locale_code, text, text, text, text, boolean, boolean, text[]) to service_role;

/* ── Saving a hand-made text (the side-by-side editor) ─────────────────── */
-- Admin only. The text becomes a person's: machine = false, manual_override = true, no review flag.
-- p_hash is the fingerprint of the source the text was written against (the server computes it);
-- without it an earlier fingerprint is kept.

create or replace function save_translation_override(
  p_property uuid, p_locale locale_code, p_title text, p_description text, p_body text,
  p_hash text default null, p_from locale_code default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then raise exception 'not-admin'; end if;
  if coalesce(btrim(p_title), '') = '' then raise exception 'title-required'; end if;
  insert into property_translations (property_id, locale, title, description, body, machine, manual_override, needs_review,
                                     validated_at, check_warnings, translated_from, source_hash)
  values (p_property, p_locale, btrim(p_title), coalesce(p_description, ''), coalesce(p_body, ''), false, true, false,
          now(), '{}', p_from, p_hash)
  on conflict (property_id, locale) do update
    set title = excluded.title, description = excluded.description, body = excluded.body,
        machine = false, manual_override = true, needs_review = false, validated_at = now(), check_warnings = '{}',
        translated_from = coalesce(excluded.translated_from, property_translations.translated_from),
        source_hash = coalesce(excluded.source_hash, property_translations.source_hash);
end;
$$;
revoke all on function save_translation_override(uuid, locale_code, text, text, text, text, locale_code) from public, anon;
grant execute on function save_translation_override(uuid, locale_code, text, text, text, text, locale_code) to authenticated;

/* ── The overview ──────────────────────────────────────────────────────── */
-- One row per listing and language: the facts. The status itself (ok, stale, ...) is decided in
-- the app (src/lib/ai/translation-status.ts) because "stale" compares fingerprints made in JS.

drop view if exists translation_matrix;
create view translation_matrix with (security_invoker = true) as
select
  p.id as property_id,
  l.locale,
  (l.locale = any (p.excluded_locales)) as excluded,
  (t.property_id is not null and (btrim(coalesce(t.title, '')) <> '' or btrim(coalesce(t.description, '')) <> '')) as has_text,
  t.machine, t.manual_override, t.needs_review, t.translated_from, t.source_hash, t.validated_at, t.check_warnings,
  j.id as job_id, j.status as job_status, j.origin as job_origin, j.fail_code, j.last_error, j.attempts, j.finished_at as job_finished_at
from properties p
cross join (select unnest(enum_range(null::locale_code)) as locale) l
left join property_translations t on t.property_id = p.id and t.locale = l.locale
left join lateral (
  select tj.id, tj.status, tj.origin, tj.fail_code, tj.last_error, tj.attempts, tj.finished_at
  from translation_jobs tj
  where tj.property_id = p.id and tj.locale = l.locale
  order by tj.created_at desc
  limit 1
) j on true;

grant select on public.translation_matrix to authenticated;
grant select on public.translation_matrix to service_role;

notify pgrst, 'reload schema';

commit;
