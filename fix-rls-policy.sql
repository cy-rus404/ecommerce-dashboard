-- Drop existing policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;

-- Create new policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL USING (true);

-- Or alternatively, disable RLS temporarily for testing
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;