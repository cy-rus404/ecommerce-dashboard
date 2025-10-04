-- Update products table to support multiple images
ALTER TABLE products 
DROP COLUMN IF EXISTS image_url;

ALTER TABLE products 
ADD COLUMN image_urls TEXT[] DEFAULT '{}';

-- Update existing products to have empty array for images
UPDATE products SET image_urls = '{}' WHERE image_urls IS NULL;