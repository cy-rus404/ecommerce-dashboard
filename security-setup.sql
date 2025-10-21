-- Security Setup for E-commerce Dashboard
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;
DROP POLICY IF EXISTS "Users can view their own cart" ON cart;
DROP POLICY IF EXISTS "Users can insert to their own cart" ON cart;
DROP POLICY IF EXISTS "Users can update their own cart" ON cart;
DROP POLICY IF EXISTS "Users can delete from their own cart" ON cart;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
DROP POLICY IF EXISTS "System can insert order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can view delivery zones" ON delivery_zones;
DROP POLICY IF EXISTS "Admin can manage delivery zones" ON delivery_zones;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert products" ON products
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'email' = 'admin@ecommerce.com'
    );

CREATE POLICY "Admin can update products" ON products
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'admin@ecommerce.com'
    );

CREATE POLICY "Admin can delete products" ON products
    FOR DELETE USING (
        auth.jwt() ->> 'email' = 'admin@ecommerce.com'
    );

-- Cart policies (users can only access their own cart)
CREATE POLICY "Users can view their own cart" ON cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own cart" ON cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" ON cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart" ON cart
    FOR DELETE USING (auth.uid() = user_id);

-- Orders policies (users see own orders, admin sees all)
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'email' = 'admin@ecommerce.com'
    );

CREATE POLICY "Authenticated users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update orders" ON orders
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'admin@ecommerce.com'
    );

-- Order items policies (linked to orders access)
CREATE POLICY "Users can view their order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@ecommerce.com')
        )
    );

CREATE POLICY "System can insert order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Delivery zones policies (public read, admin write)
CREATE POLICY "Anyone can view delivery zones" ON delivery_zones
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage delivery zones" ON delivery_zones
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@ecommerce.com'
    );

-- Create function to reduce product stock safely
CREATE OR REPLACE FUNCTION reduce_product_stock(product_id INTEGER, quantity_to_reduce INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET stock = stock - quantity_to_reduce 
    WHERE id = product_id AND stock >= quantity_to_reduce;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %', product_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION reduce_product_stock TO authenticated;