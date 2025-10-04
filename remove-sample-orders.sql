-- Remove sample orders and order items
DELETE FROM order_items;
DELETE FROM orders;

-- Reset the auto-increment sequences
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;