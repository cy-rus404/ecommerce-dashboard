-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the main admin user if not exists
INSERT INTO admin_users (email, name, role, is_active, created_by)
VALUES ('admin@ecommerce.com', 'Main Admin', 'super_admin', true, 'system')
ON CONFLICT (email) DO NOTHING;

-- Disable RLS on admin_users table
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;