# Supabase Integration & Role-Based Access Guide

## Overview
This document describes how Supabase is integrated into the Parlay Golf Ventures platform, with a focus on user roles, admin access, RLS policies, and best practices for schema management and migrations.

---

## 1. User Roles & Admin Access

- The `profiles` table now includes a `role` column (`TEXT`, default `'user'`).
- To grant admin privileges, set `role = 'admin'` for a user in the `profiles` table.
- All admin RLS policies now check `profiles.role` for `'admin'` status.
- There is **no longer** an `admin_users` or `academy_users` table; all role-based access is managed via the `profiles` table.

### Example: Assigning Roles
```sql
-- Make a user an admin
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- Revoke admin access
UPDATE profiles SET role = 'user' WHERE email = 'admin@example.com';
```

### Example: RLS Policy for Admin Access
```sql
CREATE POLICY "Admins can view all profiles."
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## 2. RLS Policy Patterns
- All admin policies should use the `profiles.role` column for access checks.
- Remove any policies referencing `admin_users` or `academy_users`.
- Example for other tables:
```sql
CREATE POLICY "Admins can update courses."
  ON courses FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## 3. Schema Maintenance & Migrations
- All user role logic is now in the `profiles` table.
- Remove or archive any migration or schema files that reference `admin_users`, `academy_users`, or similar legacy tables.
- When adding new RLS policies, always use the `profiles.role` pattern.
- Test migrations in a dev environment before applying to production.

---

## 4. Updating Frontend & API Code
- Update any queries/components that reference `academy_users` or `admin_users` to use `profiles`.
- For admin checks in code, use:
  - `user.role === 'admin'` (where `user` is the current profile)
- Example:
```typescript
if (profile.role === 'admin') {
  // Show admin dashboard
}
```

---

## 5. Auditing Supabase Schema
- Use the master schema file (`src/db/supabase_all_tables.sql`) to audit your Supabase instance.
- Regularly review RLS policies and indexes for security and performance.
- Document any schema changes in this file and in migration files.

---

## 6. Best Practices
- Always backup your database before major schema changes.
- Test RLS policies with both admin and non-admin users.
- Keep this documentation up to date as your schema evolves.
- Remove unused tables, policies, and migrations to keep your repo clean.

---

## 7. Related Processes
- **Role assignment**: Use SQL updates as shown above.
- **Policy updates**: Always use the `profiles.role` pattern.
- **Schema changes**: Document and test before production.
- **Frontend integration**: Use the `role` field from the `profiles` API response for admin checks.

---

For questions or updates, contact the development team or check the latest migration files for reference. 