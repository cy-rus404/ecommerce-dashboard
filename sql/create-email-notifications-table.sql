-- Create email notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id SERIAL PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT,
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  order_id INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Disable RLS for admin access
ALTER TABLE email_notifications DISABLE ROW LEVEL SECURITY;