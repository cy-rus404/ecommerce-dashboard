-- Create demo_products table for demo functionality
CREATE TABLE IF NOT EXISTS demo_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on demo_products table
ALTER TABLE demo_products ENABLE ROW LEVEL SECURITY;

-- Policy: Demo users can only see their own products
CREATE POLICY "Demo users can view their own products" ON demo_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM demo_users 
            WHERE demo_users.email = auth.jwt() ->> 'email' 
            AND demo_users.is_demo = true
        )
    );

-- Policy: Demo users can insert their own products
CREATE POLICY "Demo users can insert products" ON demo_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM demo_users 
            WHERE demo_users.email = auth.jwt() ->> 'email' 
            AND demo_users.is_demo = true
        )
        AND created_by = auth.uid()
    );

-- Policy: Demo users can update their own products
CREATE POLICY "Demo users can update their own products" ON demo_products
    FOR UPDATE USING (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM demo_users 
            WHERE demo_users.email = auth.jwt() ->> 'email' 
            AND demo_users.is_demo = true
        )
    );

-- Policy: Demo users can delete their own products
CREATE POLICY "Demo users can delete their own products" ON demo_products
    FOR DELETE USING (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM demo_users 
            WHERE demo_users.email = auth.jwt() ->> 'email' 
            AND demo_users.is_demo = true
        )
    );

-- Insert some sample demo products
INSERT INTO demo_products (name, description, price, stock, category, created_by) 
SELECT 
    'Sample Demo Product',
    'This is a sample product for demo purposes',
    29.99,
    100,
    'Demo Category',
    (SELECT id FROM auth.users WHERE email = 'demo@example.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@example.com');