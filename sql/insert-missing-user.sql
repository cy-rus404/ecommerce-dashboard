-- Insert missing user into users table
-- Replace the UUID with the actual user ID from the error message
INSERT INTO users (id, email, name, phone) 
VALUES ('684b193c-1151-4401-a8b8-fd8b039ec546', 'user@example.com', 'User Name', '+233000000000')
ON CONFLICT (id) DO NOTHING;