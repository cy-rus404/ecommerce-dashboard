-- Fix infinite recursion in RLS policies
-- This removes problematic RLS policies and creates simple ones

-- Fix admin_users table
DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON admin_users;

CREATE POLICY "admin_users_select_policy" ON admin_users FOR SELECT USING (true);
CREATE POLICY "admin_users_insert_policy" ON admin_users FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_users_update_policy" ON admin_users FOR UPDATE USING (true);
CREATE POLICY "admin_users_delete_policy" ON admin_users FOR DELETE USING (true);

-- Fix orders table policies
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON orders;

CREATE POLICY "orders_select_policy" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_policy" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_policy" ON orders FOR UPDATE USING (true);
CREATE POLICY "orders_delete_policy" ON orders FOR DELETE USING (true);

-- Fix order_items table policies
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON order_items;

CREATE POLICY "order_items_select_policy" ON order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert_policy" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_update_policy" ON order_items FOR UPDATE USING (true);
CREATE POLICY "order_items_delete_policy" ON order_items FOR DELETE USING (true);

-- Fix products table policies
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;

CREATE POLICY "products_select_policy" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert_policy" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update_policy" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete_policy" ON products FOR DELETE USING (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;