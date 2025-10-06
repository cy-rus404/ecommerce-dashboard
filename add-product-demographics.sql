-- Add gender, age group, and brand columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS age_group TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;