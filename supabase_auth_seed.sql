-- ============================================================
--  SwiftPOS — Supabase Auth Seed / Role Sync
--  Run this AFTER:
--  1. creating the 3 auth users in Supabase Authentication
--  2. running swiftpos_database.sql
-- ============================================================

begin;

create or replace function public.sync_pos_user_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  requested_branch bigint;
  requested_status text;
  derived_username text;
  derived_fullname text;
begin
  requested_role := lower(
    coalesce(
      new.raw_app_meta_data ->> 'role',
      new.raw_user_meta_data ->> 'role',
      'cashier'
    )
  );

  requested_status := lower(
    coalesce(
      new.raw_app_meta_data ->> 'status',
      new.raw_user_meta_data ->> 'status',
      'active'
    )
  );

  begin
    requested_branch := nullif(
      coalesce(
        new.raw_app_meta_data ->> 'branch_id',
        new.raw_user_meta_data ->> 'branch_id',
        ''
      ),
      ''
    )::bigint;
  exception
    when others then requested_branch := null;
  end;

  derived_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    split_part(coalesce(new.email, 'user_' || replace(new.id::text, '-', '')), '@', 1)
  );

  derived_fullname := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'fullname', ''),
    split_part(coalesce(new.email, 'User'), '@', 1)
  );

  insert into public.pos_users (
    auth_user_id,
    username,
    fullname,
    email,
    role,
    status,
    branch_id
  )
  values (
    new.id,
    derived_username,
    derived_fullname,
    nullif(new.email, ''),
    case
      when requested_role in ('admin', 'staff', 'cashier') then requested_role::public.app_role
      else 'cashier'::public.app_role
    end,
    case
      when requested_status in ('active', 'inactive', 'terminated') then requested_status::public.user_status
      else 'active'::public.user_status
    end,
    requested_branch
  )
  on conflict (auth_user_id) do update
    set username = excluded.username,
        fullname = excluded.fullname,
        email = excluded.email,
        role = excluded.role,
        status = excluded.status,
        branch_id = excluded.branch_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_swiftpos on auth.users;
create trigger on_auth_user_created_swiftpos
after insert on auth.users
for each row
execute function public.sync_pos_user_from_auth();

drop trigger if exists on_auth_user_updated_swiftpos on auth.users;
create trigger on_auth_user_updated_swiftpos
after update on auth.users
for each row
execute function public.sync_pos_user_from_auth();

create or replace function public.sync_all_pos_users_from_auth()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_row auth.users%rowtype;
begin
  for auth_row in select * from auth.users loop
    insert into public.pos_users (
      auth_user_id,
      username,
      fullname,
      email,
      role,
      status,
      branch_id
    )
    values (
      auth_row.id,
      coalesce(
        nullif(auth_row.raw_user_meta_data ->> 'username', ''),
        split_part(coalesce(auth_row.email, 'user_' || replace(auth_row.id::text, '-', '')), '@', 1)
      ),
      coalesce(
        nullif(auth_row.raw_user_meta_data ->> 'full_name', ''),
        nullif(auth_row.raw_user_meta_data ->> 'fullname', ''),
        split_part(coalesce(auth_row.email, 'User'), '@', 1)
      ),
      nullif(auth_row.email, ''),
      case
        when lower(coalesce(auth_row.raw_app_meta_data ->> 'role', auth_row.raw_user_meta_data ->> 'role', 'cashier')) in ('admin', 'staff', 'cashier')
          then lower(coalesce(auth_row.raw_app_meta_data ->> 'role', auth_row.raw_user_meta_data ->> 'role', 'cashier'))::public.app_role
        else 'cashier'::public.app_role
      end,
      case
        when lower(coalesce(auth_row.raw_app_meta_data ->> 'status', auth_row.raw_user_meta_data ->> 'status', 'active')) in ('active', 'inactive', 'terminated')
          then lower(coalesce(auth_row.raw_app_meta_data ->> 'status', auth_row.raw_user_meta_data ->> 'status', 'active'))::public.user_status
        else 'active'::public.user_status
      end,
      nullif(coalesce(auth_row.raw_app_meta_data ->> 'branch_id', auth_row.raw_user_meta_data ->> 'branch_id', ''), '')::bigint
    )
    on conflict (auth_user_id) do update
      set username = excluded.username,
          fullname = excluded.fullname,
          email = excluded.email,
          role = excluded.role,
          status = excluded.status,
          branch_id = excluded.branch_id;
  end loop;
end;
$$;

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin', 'status', 'active'),
    raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('username', 'admin', 'full_name', 'Administrator')
where email = 'admin@swiftpos.local';

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'staff', 'status', 'active', 'branch_id', 1),
    raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('username', 'staff1', 'full_name', 'Staff One')
where email = 'staff1@swiftpos.local';

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'cashier', 'status', 'active', 'branch_id', 1),
    raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('username', 'cashier1', 'full_name', 'Cashier One')
where email = 'cashier1@swiftpos.local';

select public.sync_all_pos_users_from_auth();

commit;
