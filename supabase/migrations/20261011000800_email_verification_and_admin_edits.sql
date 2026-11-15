-- =============================================================================
-- Rakt Response - 0800 email-verified donors, donor bio, admin data edits
--
-- * A donor's profile becomes "verified" as soon as they confirm their email
--   address (organisation policy). Administrators can still mark a profile as
--   pending/rejected, and the separate `blood_group_verified` flag remains an
--   administrator-only check.
-- * Optional short "Why I donate" line (owner-editable, shown to staff).
-- * Administrators may correct a donor's area (donor_locations).
-- =============================================================================

alter table public.profiles
  add column if not exists bio text check (bio is null or char_length(bio) <= 280);

-- Mark the profile verified when the email address is confirmed.
create or replace function private.mark_email_verified(p_user uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set verification_status = 'verified', verified_at = coalesce(verified_at, now())
  where id = p_user and verification_status in ('unverified', 'pending');
$$;

create or replace function private.handle_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    perform private.mark_email_verified(new.id);
    perform private.notify(new.id, 'profile_verification', 'Your email is verified',
      'Welcome to Rakt Response! Your donor profile is now marked as verified. Review your privacy choices any time in Settings.',
      '/profile');
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function private.handle_email_confirmed();

-- Accounts created already confirmed (admin-created, local seed, auto-confirm).
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.create_member_from_metadata(
    new.id,
    new.email,
    coalesce(
      nullif(current_setting('rr.signup_' || replace(new.id::text, '-', ''), true), '')::jsonb,
      new.raw_user_meta_data,
      '{}'::jsonb
    )
  );
  if new.email_confirmed_at is not null then
    perform private.mark_email_verified(new.id);
  end if;
  return new;
end;
$$;

-- Backfill: confirmed accounts that are still unverified.
update public.profiles p
set verification_status = 'verified', verified_at = coalesce(p.verified_at, now())
from auth.users u
where u.id = p.id and u.email_confirmed_at is not null and p.verification_status = 'unverified';

-- Administrators can correct a donor's area.
drop policy if exists donor_locations_admin_insert on public.donor_locations;
create policy donor_locations_admin_insert on public.donor_locations for insert to authenticated
  with check ((select public.is_admin()));
drop policy if exists donor_locations_admin_update on public.donor_locations;
create policy donor_locations_admin_update on public.donor_locations for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

revoke execute on all functions in schema private from public;
