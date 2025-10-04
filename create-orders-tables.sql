-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_email TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for both tables
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Insert sample orders for testing
INSERT INTO orders (customer_email, total_amount, status, shipping_address) VALUES
('testuser@example.com', 150.00, 'pending', '123 Main St, Accra, Ghana'),
('testuser@example.com', 75.50, 'processing', '123 Main St, Accra, Ghana'),
('testuser@example.com', 200.00, 'shipped', '123 Main St, Accra, Ghana');

-- Insert sample order items (assuming you have products with IDs 1, 2, 3)
-- You may need to adjust product_id values based on your actual product IDs
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 75.00),
(2, 1, 1, 75.50),
(3, 1, 1, 100.00),
(3, 1, 2, 50.00);