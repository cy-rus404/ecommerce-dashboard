-- Demo User System Setup
-- Run this in your Supabase SQL editor

-- Create demo_users table
CREATE TABLE IF NOT EXISTS demo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for demo users
ALTER TABLE demo_users DISABLE ROW LEVEL SECURITY;

-- Insert demo user
INSERT INTO demo_users (email, name) 
VALUES ('demo@example.com', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Create demo user in auth.users (you'll need to do this via Supabase dashboard)
-- Email: demo@example.com
-- Password: demo123456

-- Function to reset demo data daily
CREATE OR REPLACE FUNCTION reset_demo_data()
RETURNS void AS $$
BEGIN
  -- Reset demo user's cart
  DELETE FROM cart WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'demo@example.com'
  );
  
  -- Reset demo user's wishlist
  DELETE FROM wishlist WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'demo@example.com'
  );
  
  -- Reset demo user's orders (keep for demo purposes but mark as demo)
  UPDATE orders SET status = 'demo_reset' WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'demo@example.com'
  );
  
  RAISE NOTICE 'Demo data reset completed';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily reset (optional - can be called manually)
-- SELECT cron.schedule('reset-demo-data', '0 0 * * *', 'SELECT reset_demo_data();');