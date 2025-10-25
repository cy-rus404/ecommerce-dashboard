-- Create RPC function to get all users
-- Run this in Supabase SQL Editor

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
    NULL::TIMESTAMPTZ as banned_until
  FROM auth.users
  ORDER BY created_at DESC;
$$;