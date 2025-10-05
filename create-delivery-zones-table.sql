-- Create delivery zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id BIGSERIAL PRIMARY KEY,
  zone_name TEXT NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE delivery_zones DISABLE ROW LEVEL SECURITY;

-- Insert default delivery zones
INSERT INTO delivery_zones (zone_name, delivery_fee) VALUES
('Accra Central', 10.00),
('East Legon', 15.00),
('Tema', 20.00),
('Kumasi', 25.00),
('Cape Coast', 30.00);