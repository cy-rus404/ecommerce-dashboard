-- Add discount columns to products table
ALTER TABLE products 
ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN discount_start_date DATE DEFAULT NULL,
ADD COLUMN discount_end_date DATE DEFAULT NULL;