# SwiftPOS Supabase Setup

Use [`swiftpos_database.sql`](c:\xampp\htdocs\drive-download-20260325T103121Z-3-001\swiftpos_database.sql) in the Supabase SQL Editor. That file is now PostgreSQL/Supabase-ready and includes:

- Supabase Auth integration
- `admin`, `staff`, `cashier` roles
- RLS policies for database security
- product categories for farm/agri supply inventory
- seed branches, items, and settings

## What changed

- Removed the old XAMPP/MySQL database bootstrap assumptions.
- Replaced plain-text password storage with Supabase Auth.
- Added missing fields the app already uses:
  - `branch_number`
  - `contact_number`
  - `email`
  - `product_number`
- Reworked categories to:
  - `Fertilizers`
  - `Lubricants`
  - `Hardware`
  - `Feeds`
  - `Seeds`
  - `Chemicals`
  - `Others`

## Recommended setup order

1. Create a Supabase project.
2. Open the SQL Editor.
3. Paste and run [`swiftpos_database.sql`](c:\xampp\htdocs\drive-download-20260325T103121Z-3-001\swiftpos_database.sql).
4. Go to Authentication and create your users there.
5. Run [`supabase_auth_seed.sql`](c:\xampp\htdocs\drive-download-20260325T103121Z-3-001\supabase_auth_seed.sql).

## Reset all app data

If you want a clean restart of the POS data while keeping your Supabase Auth accounts, run:

- [supabase_reset_all_data.sql](c:\xampp\htdocs\drive-download-20260325T103121Z-3-001\supabase_reset_all_data.sql)

This will clear:

- branches
- synced app users in `public.pos_users`
- products/items
- sales
- requests
- cashier summaries
- audit logs
- settings

Then it will:

- re-create the default branches
- re-create the default stock threshold
- re-sync `public.pos_users` from `auth.users`

Products will stay empty after reset so you can add them manually from the system.

## 3 user access levels in Supabase Auth

The project now supports these three access levels directly from Supabase-backed user data:

- `admin`
- `staff`
- `cashier`

Recommended setup:

1. Create the user in `Authentication > Users`
2. Use emails like:
   - `admin@swiftpos.local`
   - `staff1@swiftpos.local`
   - `cashier1@swiftpos.local`
3. In SQL Editor, run [`supabase_auth_seed.sql`](c:\xampp\htdocs\drive-download-20260325T103121Z-3-001\supabase_auth_seed.sql)
4. That script will:

- create/update the auth sync trigger functions
- assign the 3 roles
- set branch access
- sync `auth.users` into `public.pos_users`

5. If you want to resync later, run:

```sql
select public.sync_all_pos_users_from_auth();
```

This keeps `public.pos_users` aligned with Supabase Auth metadata.

## Where to put the Supabase keys

Put them in [js/supabase.js](c:\xampp\htdocs\drive-download-20260325T103121Z-3-001\js\supabase.js):

```js
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

Use only the `anon` key in browser code.
Never put the `service_role` key in any `js/` file or page script.

## Login format

The app now signs in through Supabase Auth and expects usernames to map to auth emails like:

- `admin` -> `admin@swiftpos.local`
- `staff1` -> `staff1@swiftpos.local`
- `cashier1` -> `cashier1@swiftpos.local`

If you create users manually in Supabase Auth, use the same pattern so the username login screen works correctly.

## Render deployment

This project now includes:

- [Dockerfile](c:\xampp\htdocs\drive-download-20260325T103121Z-3-001\Dockerfile)
- [.dockerignore](c:\xampp\htdocs\drive-download-20260325T103121Z-3-001\.dockerignore)

Use a Render `Web Service` with `Docker`.

Set these environment variables in Render:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Example:

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-publishable-key
```

You do not need to set a Build Command or Start Command when using the Dockerfile.
