-- Add banned_until column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE;