-- Create SMS notifications table
CREATE TABLE IF NOT EXISTS sms_notifications (
  id SERIAL PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  message_content TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('order_confirmation', 'low_stock_alert', 'order_status_update')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add phone column to admin_users table if not exists
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS phone TEXT;