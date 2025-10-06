-- Add missing columns to existing orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update order_items table to add size and color columns
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS selected_size TEXT,
ADD COLUMN IF NOT EXISTS selected_color TEXT;