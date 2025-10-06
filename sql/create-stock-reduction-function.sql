-- Create function to safely reduce product stock
CREATE OR REPLACE FUNCTION reduce_product_stock(product_id INTEGER, quantity_to_reduce INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock = GREATEST(0, stock - quantity_to_reduce)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;