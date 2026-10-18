-- After-donation messages also go to SDP and WBC donors, so they say "donated"
-- rather than "gave blood". Otherwise copied from 20261018000200.

create or replace function private.notify_donation_follow_up(p_request uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
  v_body constant text := 'A donor donated for this request. Check on them and thank them, then mark it done.';
  v_count integer;
begin
  select left('Follow up after donation: ' || reference_code, 140) into v_title from public.blood_requests where id = p_request;
  insert into public.notifications (user_id, kind, title, body, link)
  select distinct va.volunteer_id, 'follow_up', v_title, v_body, '/volunteer/coordination'
  from public.volunteer_assignments va
  join public.staff_roles sr on sr.user_id = va.volunteer_id and sr.is_active
  where va.request_id = p_request and va.status = 'active';
  get diagnostics v_count = row_count;
  if v_count = 0 then
    insert into public.notifications (user_id, kind, title, body, link)
    select sr.user_id, 'follow_up', v_title, v_body, '/volunteer/coordination'
    from public.staff_roles sr
    where sr.is_active and (sr.role = 'admin' or sr.can_verify_requests)
    limit 50;
  end if;
end;
$$;

create or replace function private.notify_donation_outcome()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  if new.outcome = 'donated' and (tg_op = 'INSERT' or old.outcome is distinct from 'donated') then
    select reference_code into v_code from public.blood_requests where id = new.request_id;
    perform private.notify_donation_follow_up(new.request_id);
    insert into public.notifications (user_id, kind, title, body, link)
    values (new.donor_id, 'follow_up', 'Thank you for donating',
      case when new.donation_record_id is null
        then 'Thank you for donating for ' || v_code || '. Add it to your donation record so we know when you can give again.'
        else 'Thank you for donating for ' || v_code || '. It is in your donation record. A Rakt Mitra may check in with you.'
      end,
      case when new.response = 'interested' then '/requests/' || new.request_id::text else '/donations/new' end);
  end if;
  return null;
end;
$$;
