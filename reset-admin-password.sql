-- Reset admin user password and confirm email
-- Run this in Supabase SQL Editor

-- Update the admin user password and confirm email
UPDATE auth.users 
SET 
    encrypted_password = crypt('admin123456', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'admin@ecommerce.com';

-- Ensure the admin_users record exists
INSERT INTO admin_users (email, name, role, is_active, created_by)
VALUES ('admin@ecommerce.com', 'Main Admin', 'super_admin', true, 'system')
ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    updated_at = NOW();