-- ============================================================
--  Villaluna General Merchandise POS
--  Full App Data Reset for Supabase
--
--  What this resets:
--  - branches
--  - synced pos_users
--  - items/products
--  - sales
--  - stock requests
--  - cashier daily summaries
--  - audit logs
--  - settings
--
--  What this does NOT delete:
--  - Supabase Authentication users in auth.users
--
--  After reset:
--  - default branches are re-seeded
--  - default stock threshold is re-seeded
--  - pos_users is re-synced from auth.users
--  - products remain empty so users can add them manually
-- ============================================================

begin;

-- Remove app data in dependency-safe order
truncate table public.pos_cashier_daily_summary restart identity cascade;
truncate table public.pos_sales restart identity cascade;
truncate table public.pos_requests restart identity cascade;
truncate table public.pos_audit_log restart identity cascade;
truncate table public.pos_items restart identity cascade;
truncate table public.pos_users restart identity cascade;
truncate table public.pos_branches restart identity cascade;
truncate table public.pos_settings restart identity cascade;

-- Re-seed default branches
insert into public.pos_branches (id, name, branch_number, address, contact_number, status)
values
  (1, 'Main Branch', '001', 'Main Street', '09170000001', 'active'),
  (2, 'Branch 2', '002', 'Second Avenue', '09170000002', 'active');

-- Keep branch identity consistent for future inserts
select setval(
  pg_get_serial_sequence('public.pos_branches', 'id'),
  coalesce((select max(id) from public.pos_branches), 1),
  true
);

-- Re-seed default system settings
insert into public.pos_settings (key, value)
values
  ('stock_threshold', '5');

-- Re-sync app users from Supabase Auth
select public.sync_all_pos_users_from_auth();

commit;

-- ============================================================
--  OPTIONAL: If you also want to remove Supabase Auth users,
--  do that manually in Authentication > Users.
-- ============================================================
