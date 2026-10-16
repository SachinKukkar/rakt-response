-- =============================================================================
-- Rakt Response - 1100 editing and removing records
--
-- * Donation records
--   - Donors can edit and remove their own records, whatever their status.
--     Editing a record that was already checked (verified or not verified)
--     sends it back to "self-reported, pending", so a verified figure never
--     describes details nobody has checked.
--   - Volunteers allowed to verify donations can correct the details of any
--     record they can see; the record keeps its verification status.
--   - Administrators can edit and remove any record.
--   - Every edit and removal is written to the audit log (column names only).
-- * Administrators can permanently delete a blood request or a story
--   (admin_delete_blood_request, admin_delete_story). Both are audit-logged.
--   The audit log itself stays append-only for everyone.
-- =============================================================================

-- --- Donation records: who may change what ----------------------------------
drop policy if exists donation_records_update on public.donation_records;
create policy donation_records_update on public.donation_records for update to authenticated
  using (donor_id = (select auth.uid()) or (select public.staff_can('verify_donations')))
  with check (donor_id = (select auth.uid()) or (select public.staff_can('verify_donations')));

drop policy if exists donation_records_delete on public.donation_records;
create policy donation_records_delete on public.donation_records for delete to authenticated
  using (donor_id = (select auth.uid()) or (select public.is_admin()));

create or replace function private.guard_donation_record()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.donation_date > current_date then
    raise exception 'Donation date cannot be in the future' using errcode = '22023';
  end if;
  if new.donation_date < date '1950-01-01' then
    raise exception 'Donation date is not plausible' using errcode = '22023';
  end if;

  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if public.is_admin() then
      return new;
    end if;
    -- Donors may only add self-reported, unverified records for themselves.
    new.record_source := 'self_reported';
    new.verification_status := 'pending';
    new.verified_by := null;
    new.verified_at := null;
    new.review_reason := null;
    new.provenance := null;
    new.created_by := auth.uid();
    return new;
  end if;

  -- UPDATE by an end user: verification fields are only changed through
  -- verify_donation_record(), never directly.
  if new.donor_id is distinct from old.donor_id
     or new.record_source is distinct from old.record_source
     or new.verification_status is distinct from old.verification_status
     or new.verified_by is distinct from old.verified_by
     or new.verified_at is distinct from old.verified_at
     or new.review_reason is distinct from old.review_reason
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception 'Verification and provenance fields can only be changed by an authorised reviewer'
      using errcode = '42501';
  end if;

  -- A donor correcting their own checked record sends it back for checking.
  -- (Staff correcting someone else's record keep its status; that is audited.)
  if old.verification_status <> 'pending'
     and old.donor_id = auth.uid()
     and not public.is_admin()
     and (new.donation_type, new.donation_date, new.centre_name, new.city, new.district, new.event_name)
         is distinct from (old.donation_type, old.donation_date, old.centre_name, old.city, old.district, old.event_name) then
    new.verification_status := 'pending';
    new.record_source := 'self_reported';
    new.verified_by := null;
    new.verified_at := null;
    new.review_reason := null;
    new.provenance := null;
  end if;
  return new;
end;
$$;

-- One audit entry per edit (any column) and per removal, instead of only
-- verification changes.
drop trigger if exists donation_records_audit on public.donation_records;
create trigger donation_records_audit after update or delete on public.donation_records
  for each row execute function private.audit_row_change();

-- --- Administrators: permanent deletion of a request or a story --------------
-- Related history (events, responses, contact requests, assignments; story
-- consents and moderation events) is removed with it by the existing foreign
-- keys. The audit log keeps a record that the deletion happened.
create or replace function public.admin_delete_blood_request(p_request uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can delete requests' using errcode = '42501';
  end if;
  select reference_code into v_code from public.blood_requests where id = p_request;
  if not found then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;
  perform private.write_audit('blood_requests.deleted', 'blood_requests', p_request::text,
    jsonb_build_object('reference_code', v_code));
  delete from public.blood_requests where id = p_request;
end;
$$;

-- Returns the story's photo paths so the server can remove the files too.
create or replace function public.admin_delete_story(p_story uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_story public.impact_stories;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can delete stories' using errcode = '42501';
  end if;
  select * into v_story from public.impact_stories where id = p_story;
  if not found then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
  perform private.write_audit('impact_stories.deleted', 'impact_stories', p_story::text,
    jsonb_build_object('status', v_story.status));
  delete from public.impact_stories where id = p_story;
  return jsonb_build_object('photo_path', v_story.photo_path, 'public_photo_path', v_story.public_photo_path);
end;
$$;

revoke execute on all functions in schema private from public;
revoke execute on function public.admin_delete_blood_request(uuid) from public, anon;
revoke execute on function public.admin_delete_story(uuid) from public, anon;
grant execute on function public.admin_delete_blood_request(uuid) to authenticated;
grant execute on function public.admin_delete_story(uuid) to authenticated;
