-- 0030 — the per-package photo cap is enforced by the application (from the
-- package settings: a number, or unlimited); the database only keeps a hard
-- ceiling underneath so concurrent uploads cannot run away.
--
-- 0022 hard-coded 20 in the trigger, which made the package's own "maxImages"
-- setting impossible to honour. `create or replace`: safe to run twice. Run it by
-- hand in the Supabase SQL editor — deploys do not run migrations.

begin;

create or replace function enforce_property_photo_limit() returns trigger language plpgsql as $$
begin
 perform 1 from properties where id=new.property_id for update;
 if (select count(*) from property_media where property_id=new.property_id)>=200 then raise exception 'photo-limit'; end if;
 return new;
end;
$$;

commit;
