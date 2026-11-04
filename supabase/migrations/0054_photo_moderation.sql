-- 0054_photo_moderation.sql — free later photo upload with moderation
-- (FINDDOME November 2026, spec §4c part 2).
--
-- Until now an owner could change photos only while the listing was a draft
-- or sent back for changes. Adding photos to a live listing was the paid
-- „Utólagos képfeltöltés” extra (retired in #30). From now on it is free:
--
--   * an owner may add, reorder and remove photos on a *published* listing;
--   * a photo added to a published listing is `pending`: the owner sees it,
--     the public site does not, until an admin approves it;
--   * a rejected photo is deleted (row and file), and the reason is kept in
--     property_media_rejections so the owner sees it in the portal and the
--     e-mail can quote it.
--
-- The database enforces this on its own, whatever the API does:
--   1. property_media_read: anon and other users never see a pending photo;
--   2. a non-admin insert on a live listing is always pending and never the
--      cover (trigger property_media_moderation);
--   3. only an admin (or the service role) can approve, i.e. clear `pending`;
--   4. on a live listing the owner cannot swap the file or rewrite the
--      caption of an approved photo (that would bypass review), only of a
--      pending one;
--   5. the owner cannot delete the last approved photo of a live listing;
--   6. the package photo limit trigger (0022/0030) counts pending photos too.
--
-- Idempotent; one transaction. Run BEFORE deploying the code (the public
-- queries ask for property_media.pending).

begin;

/* ── 1. Columns ─────────────────────────────────────────────────────────── */

alter table property_media add column if not exists pending boolean not null default false;
alter table property_media add column if not exists submitted_at timestamptz;
alter table property_media add column if not exists reviewed_at timestamptz;
alter table property_media add column if not exists reviewed_by uuid references profiles (id) on delete set null;

-- The admin queue reads "every pending photo, oldest first".
create index if not exists property_media_pending_idx on property_media (submitted_at) where pending;

/* ── 2. Who may see a photo ─────────────────────────────────────────────── */

drop policy if exists property_media_read on property_media;
create policy property_media_read on property_media
  for select using (
    exists (
      select 1 from properties p
      where p.id = property_media.property_id
        and (
          (p.status in ('published', 'sold') and not property_media.pending)
          or p.owner_id = auth.uid()
          or is_admin()
        )
    )
  );

/* ── 3. Who may add, change or remove one ───────────────────────────────── */
-- Owners: draft / changes_requested as before, and now published too.

drop policy if exists property_media_write on property_media;
create policy property_media_write on property_media
  for insert with check (
    is_admin() or exists (
      select 1 from properties p
      where p.id = property_media.property_id
        and p.owner_id = auth.uid() and p.status in ('draft', 'changes_requested', 'published')
    )
  );

drop policy if exists property_media_update on property_media;
create policy property_media_update on property_media
  for update using (
    is_admin() or exists (
      select 1 from properties p
      where p.id = property_media.property_id
        and p.owner_id = auth.uid() and p.status in ('draft', 'changes_requested', 'published')
    )
  );

drop policy if exists property_media_delete on property_media;
create policy property_media_delete on property_media
  for delete using (
    is_admin() or exists (
      select 1 from properties p
      where p.id = property_media.property_id
        and p.owner_id = auth.uid() and p.status in ('draft', 'changes_requested', 'published')
    )
  );

/* ── 4. The moderation rule itself ──────────────────────────────────────── */
-- SECURITY INVOKER on purpose: current_user is the caller. The website's
-- signed-in users are `authenticated` (and `anon`); the service role and the
-- SQL editor are trusted and pass through, as do admins.

create or replace function property_media_moderation() returns trigger
language plpgsql set search_path = public as $$
declare
  listing_status text;
begin
  if is_admin() or current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    select status::text into listing_status from properties where id = new.property_id;
    if listing_status in ('draft', 'changes_requested') then
      -- Reviewed together with the whole listing when it is submitted.
      new.pending := false;
      new.submitted_at := null;
    else
      new.pending := true;
      new.is_hero := false;
      new.submitted_at := now();
    end if;
    new.reviewed_at := null;
    new.reviewed_by := null;
    return new;
  end if;

  -- UPDATE by an owner.
  if new.property_id is distinct from old.property_id then
    raise exception 'media-move-forbidden';
  end if;
  if new.pending is distinct from old.pending
     or new.reviewed_at is distinct from old.reviewed_at
     or new.reviewed_by is distinct from old.reviewed_by
     or new.submitted_at is distinct from old.submitted_at then
    raise exception 'moderation-admin-only';
  end if;
  if new.pending and new.is_hero then
    raise exception 'pending-cover';
  end if;
  select status::text into listing_status from properties where id = new.property_id;
  if listing_status not in ('draft', 'changes_requested') and not old.pending
     and (new.storage_path is distinct from old.storage_path or new.alt is distinct from old.alt) then
    raise exception 'approved-photo-locked';
  end if;
  return new;
end;
$$;

drop trigger if exists property_media_moderation on property_media;
create trigger property_media_moderation before insert or update on property_media
  for each row execute function property_media_moderation();

-- A live listing keeps at least one approved photo: the owner cannot remove
-- the last one (pending photos do not count, they are not on the site yet).
create or replace function property_media_keep_one() returns trigger
language plpgsql set search_path = public as $$
begin
  if is_admin() or current_user not in ('authenticated', 'anon') or old.pending then return old; end if;
  if exists (select 1 from properties where id = old.property_id and status = 'published')
     and not exists (select 1 from property_media where property_id = old.property_id and id <> old.id and not pending) then
    raise exception 'last-photo';
  end if;
  return old;
end;
$$;

drop trigger if exists property_media_keep_one on property_media;
create trigger property_media_keep_one before delete on property_media
  for each row execute function property_media_keep_one();

/* ── 5. Reorder and cover on a live listing ─────────────────────────────── */
-- Same as 0022 (whole gallery, one transaction), plus: the owner may also
-- reorder a published listing, and a pending photo cannot become the cover.

create or replace function reorder_property_media(p_id uuid, p_ids uuid[], p_cover uuid default null)
returns void language plpgsql security invoker set search_path = public as $$
declare p properties;
begin
 select * into p from properties where id = p_id for update;
 if not found or not (is_admin() or (p.owner_id = auth.uid() and p.status in ('draft', 'changes_requested', 'published'))) then
   raise exception 'not-editable';
 end if;
 if cardinality(p_ids) <> (select count(*) from property_media where property_id = p_id)
 or cardinality(p_ids) <> (select count(distinct x) from unnest(p_ids) x)
 or exists (select 1 from unnest(p_ids) x where not exists (select 1 from property_media where property_id = p_id and id = x)) then
   raise exception 'invalid-gallery';
 end if;
 if p_cover is not null and not (p_cover = any (p_ids)) then raise exception 'invalid-cover'; end if;
 if p_cover is not null and exists (select 1 from property_media where id = p_cover and pending) then
   raise exception 'pending-cover';
 end if;
 update property_media m
    set sort_order = t.ord - 1,
        is_hero = case when p_cover is null then m.is_hero else m.id = p_cover end
   from unnest(p_ids) with ordinality as t(id, ord)
  where m.id = t.id and m.property_id = p_id;
end;
$$;
revoke all on function reorder_property_media(uuid, uuid[], uuid) from public, anon;
grant execute on function reorder_property_media(uuid, uuid[], uuid) to authenticated;

/* ── 6. Rejections the owner is told about ──────────────────────────────── */

create table if not exists property_media_rejections (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  photo_count integer not null default 1 check (photo_count > 0),
  -- The admin's choice (quality, unrelated, personal, branding, duplicate,
  -- inappropriate, other), its Hungarian wording, and the free-text note.
  reason_code text,
  reason text not null check (char_length(reason) between 1 and 1000),
  note text check (note is null or char_length(note) <= 500),
  decided_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  dismissed_at timestamptz
);
alter table property_media_rejections add column if not exists reason_code text;
alter table property_media_rejections add column if not exists note text;
create index if not exists property_media_rejections_property_idx on property_media_rejections (property_id, created_at desc);

alter table property_media_rejections enable row level security;

drop policy if exists property_media_rejections_read on property_media_rejections;
create policy property_media_rejections_read on property_media_rejections
  for select using (
    is_admin() or exists (select 1 from properties p where p.id = property_media_rejections.property_id and p.owner_id = auth.uid())
  );
drop policy if exists property_media_rejections_insert on property_media_rejections;
create policy property_media_rejections_insert on property_media_rejections
  for insert with check (is_admin());
-- The owner may only dismiss (set dismissed_at); the column guard is below.
drop policy if exists property_media_rejections_update on property_media_rejections;
create policy property_media_rejections_update on property_media_rejections
  for update using (
    is_admin() or exists (select 1 from properties p where p.id = property_media_rejections.property_id and p.owner_id = auth.uid())
  );
drop policy if exists property_media_rejections_delete on property_media_rejections;
create policy property_media_rejections_delete on property_media_rejections
  for delete using (is_admin());

create or replace function property_media_rejection_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if is_admin() or current_user not in ('authenticated', 'anon') then return new; end if;
  if new.property_id is distinct from old.property_id or new.reason is distinct from old.reason
     or new.reason_code is distinct from old.reason_code or new.note is distinct from old.note
     or new.photo_count is distinct from old.photo_count or new.decided_by is distinct from old.decided_by
     or new.created_at is distinct from old.created_at then
    raise exception 'rejection-read-only';
  end if;
  return new;
end;
$$;
drop trigger if exists property_media_rejection_guard on property_media_rejections;
create trigger property_media_rejection_guard before update on property_media_rejections
  for each row execute function property_media_rejection_guard();

grant select, insert, update, delete on property_media_rejections to authenticated;
grant select, insert, update, delete on property_media_rejections to service_role;

/* ── 7. Storage: the owner may add and remove files on a live listing ──── */

drop policy if exists "property_media_objects_insert" on storage.objects;
create policy "property_media_objects_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'property-media'
    and (is_admin() or exists (
      select 1 from properties p
      where p.id::text = (storage.foldername(name))[1]
        and p.owner_id = auth.uid() and p.status in ('draft', 'changes_requested', 'published')
    ))
  );
drop policy if exists "property_media_objects_delete" on storage.objects;
create policy "property_media_objects_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'property-media'
    and (is_admin() or exists (
      select 1 from properties p
      where p.id::text = (storage.foldername(name))[1]
        and p.owner_id = auth.uid() and p.status in ('draft', 'changes_requested', 'published')
    ))
  );

commit;

-- Check after running (expect: true, 0, a row for the table):
--   select exists(select 1 from information_schema.columns where table_name='property_media' and column_name='pending');
--   select count(*) from property_media where pending;
--   select to_regclass('public.property_media_rejections');
