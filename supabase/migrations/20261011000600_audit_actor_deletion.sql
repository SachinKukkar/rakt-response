-- =============================================================================
-- Rakt Response — 0600 allow account deletion with audit history
--
-- audit_logs.actor_id references auth.users ON DELETE SET NULL. The append-only
-- trigger blocked that automatic update, so deleting any user who had audit
-- entries failed. Permit exactly one kind of change: clearing actor_id while
-- every other column stays identical. Everything else remains immutable.
-- =============================================================================
create or replace function private.block_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(current_setting('rr.audit_purge', true), '') = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  if tg_op = 'UPDATE'
     and old.actor_id is not null
     and new.actor_id is null
     and (to_jsonb(new) - 'actor_id') = (to_jsonb(old) - 'actor_id') then
    return new; -- the referenced account was deleted
  end if;
  raise exception 'Audit logs are append-only' using errcode = '42501';
end;
$$;

revoke execute on all functions in schema private from public;
