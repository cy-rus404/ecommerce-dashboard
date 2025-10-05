-- Add delivery_fee column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;