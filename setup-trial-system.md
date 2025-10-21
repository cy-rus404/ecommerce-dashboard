# Trial System Setup

## 1. Database Setup
Run this SQL in your Supabase SQL editor:

```sql
-- Create trial_users table for unique trial logins
CREATE TABLE IF NOT EXISTS trial_users (
  id BIGSERIAL PRIMARY KEY,
  trial_token TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trial_sessions table
CREATE TABLE IF NOT EXISTS trial_sessions (
  id BIGSERIAL PRIMARY KEY,
  trial_token TEXT NOT NULL REFERENCES trial_users(trial_token) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE trial_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE trial_sessions DISABLE ROW LEVEL SECURITY;

-- Function to generate trial token
CREATE OR REPLACE FUNCTION generate_trial_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'trial_' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired trials
CREATE OR REPLACE FUNCTION cleanup_expired_trials()
RETURNS void AS $$
BEGIN
  DELETE FROM trial_sessions WHERE expires_at < NOW();
  UPDATE trial_users SET is_active = false WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

## 2. Create Trial Users
After setting up the database, create trial users:

```bash
npm run create-trial-user "Demo User" "demo@example.com" 365
```

## 3. Usage
- Main site: `http://localhost:3000/login`
- Trial access: `http://localhost:3000/trial`
- Users enter their unique trial token to access the demo dashboard

## 4. Features
- ✅ Separate trial login system
- ✅ Unique tokens for each trial user
- ✅ Isolated trial dashboard
- ✅ No impact on main site data
- ✅ Automatic session management
- ✅ Token expiration handling