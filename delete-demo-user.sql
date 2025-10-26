-- Delete demo@example.com user completely
-- Run this in Supabase SQL Editor

-- First delete all demo products that reference this user
DELETE FROM demo_products 
WHERE created_by = (SELECT id FROM auth.users WHERE email = 'demo@example.com');

-- Delete from demo_users table
DELETE FROM demo_users 
WHERE email = 'demo@example.com';

-- Delete from admin_users if exists
DELETE FROM admin_users 
WHERE email = 'demo@example.com';

-- Delete from auth.identities
DELETE FROM auth.identities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@example.com');

-- Finally delete from auth.users
DELETE FROM auth.users 
WHERE email = 'demo@example.com';