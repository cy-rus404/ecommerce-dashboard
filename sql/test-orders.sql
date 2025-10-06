-- Test if orders table exists and add a sample order
INSERT INTO orders (user_id, customer_email, total_amount, status, shipping_address, phone) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com', 100.00, 'pending', 'Test Address', '1234567890');