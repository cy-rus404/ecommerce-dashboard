-- Fix admin table and add admin user
-- Run this in Supabase SQL editor

-- Drop all policies and disable RLS
DROP POLICY IF EXISTS "Only super admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Only super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage own sessions" ON admin_sessions;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;

-- Insert admin user
INSERT INTO admin_users (email, name, role, is_active, created_by) 
VALUES ('admin@ecommerce.com', 'Super Admin', 'super_admin', true, 'system')
ON CONFLICT (email) DO UPDATE SET 
  name = 'Super Admin',
  role = 'super_admin',
  is_active = true;

-- Verify admin user exists
SELECT * FROM admin_users WHERE email = 'admin@ecommerce.com';