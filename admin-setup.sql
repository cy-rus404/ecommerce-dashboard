-- Admin and Demo User Setup for E-commerce Dashboard
-- IMPORTANT: Create users through Supabase Dashboard instead of SQL

-- Step 1: Go to Supabase Dashboard > Authentication > Users
-- Step 2: Click "Add User" and create:
--   Email: admin@ecommerce.com
--   Password: admin123456
--   Auto Confirm User: YES

-- Step 3: Click "Add User" again and create:
--   Email: demo@example.com  
--   Password: demo123456
--   Auto Confirm User: YES

-- Step 4: Run this SQL to set up demo user in demo_users table:

-- Add name column to existing demo_users table if it doesn't exist
ALTER TABLE demo_users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add demo user to demo_users table (with name)
INSERT INTO demo_users (email, name, is_demo, created_at)
VALUES ('demo@example.com', 'Demo User', true, NOW())
ON CONFLICT (email) DO UPDATE SET name = 'Demo User';

-- Verify setup
SELECT 'Setup complete! Now create users manually in Supabase Dashboard.' as status;