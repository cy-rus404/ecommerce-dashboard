-- Add available_sizes and available_colors columns to products table
ALTER TABLE products 
ADD COLUMN available_sizes TEXT[],
ADD COLUMN available_colors TEXT[];