-- Add a few sample sales for testing
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES 
(2, 189.99, 15.20, 0.00, 'cash', 200.00, 10.01, datetime('now', '-1 day')),
(2, 45.98, 3.68, 5.00, 'card', 45.98, 0.00, datetime('now', '-2 days')),
(2, 98.97, 7.92, 0.00, 'cash', 100.00, 1.03, datetime('now', '-3 days')),
(2, 219.99, 17.60, 0.00, 'card', 219.99, 0.00, datetime('now', '-4 days')),
(2, 67.96, 5.44, 0.00, 'cash', 70.00, 2.04, datetime('now', '-5 days'));

-- Add corresponding sale items
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 189.99, 189.99),
(2, 7, 1, 34.99, 34.99),
(2, 11, 1, 8.99, 8.99),
(3, 15, 1, 45.99, 45.99),
(3, 20, 1, 12.99, 12.99),
(3, 19, 1, 49.99, 49.99),
(4, 4, 1, 219.99, 219.99),
(5, 29, 1, 14.99, 14.99),
(5, 30, 1, 24.99, 24.99),
(5, 31, 1, 8.99, 8.99),
(5, 32, 1, 7.99, 7.99),
(5, 26, 2, 4.99, 9.98);

-- Update product stock
UPDATE products SET stock = stock - 1 WHERE id = 1;
UPDATE products SET stock = stock - 1 WHERE id = 7;
UPDATE products SET stock = stock - 1 WHERE id = 11;
UPDATE products SET stock = stock - 1 WHERE id = 15;
UPDATE products SET stock = stock - 1 WHERE id = 20;
UPDATE products SET stock = stock - 1 WHERE id = 19;
UPDATE products SET stock = stock - 1 WHERE id = 4;
UPDATE products SET stock = stock - 1 WHERE id = 29;
UPDATE products SET stock = stock - 1 WHERE id = 30;
UPDATE products SET stock = stock - 1 WHERE id = 31;
UPDATE products SET stock = stock - 1 WHERE id = 32;
UPDATE products SET stock = stock - 2 WHERE id = 26;
