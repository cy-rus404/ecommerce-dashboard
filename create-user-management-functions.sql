-- Create user management functions for ban/delete functionality
-- Run this in Supabase SQL Editor

-- Function to check user status (banned, deleted, or active)
CREATE OR REPLACE FUNCTION check_user_status(user_email TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN banned_until IS NOT NULL AND banned_until > NOW() THEN 'banned'
      WHEN id IS NULL THEN 'deleted'
      ELSE 'active'
    END
  FROM auth.users 
  WHERE email = user_email;
$$;

-- Function to toggle user ban status
CREATE OR REPLACE FUNCTION toggle_user_ban(user_id UUID, ban_user BOOLEAN)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE auth.users 
  SET banned_until = CASE 
    WHEN ban_user THEN NOW() + INTERVAL '100 years'
    ELSE NULL 
  END
  WHERE id = user_id;
$$;

-- Function to completely delete a user
CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Delete from identities first
  DELETE FROM auth.identities WHERE user_id = delete_user_completely.user_id;
  
  -- Delete from users
  DELETE FROM auth.users WHERE id = delete_user_completely.user_id;
$$;

-- Update the get_all_users function to show ban status
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    name TEXT,
    phone TEXT,
    banned_until TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    email,
    created_at,
    COALESCE(raw_user_meta_data->>'name', '') as name,
    COALESCE(raw_user_meta_data->>'phone', '') as phone,
    banned_until
  FROM auth.users
  ORDER BY created_at DESC;
$$;