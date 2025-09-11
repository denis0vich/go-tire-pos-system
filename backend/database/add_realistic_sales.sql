-- Add some realistic sales data for better testing
-- First, let's clear the existing small sales and add better ones

DELETE FROM sale_items;
DELETE FROM sales;

-- Reset product stock to original values
UPDATE products SET stock = 15 WHERE id = 1;
UPDATE products SET stock = 12 WHERE id = 2;
UPDATE products SET stock = 8 WHERE id = 3;
UPDATE products SET stock = 6 WHERE id = 4;
UPDATE products SET stock = 4 WHERE id = 5;
UPDATE products SET stock = 10 WHERE id = 6;
UPDATE products SET stock = 25 WHERE id = 7;
UPDATE products SET stock = 30 WHERE id = 8;
UPDATE products SET stock = 20 WHERE id = 9;
UPDATE products SET stock = 18 WHERE id = 10;
UPDATE products SET stock = 50 WHERE id = 11;
UPDATE products SET stock = 35 WHERE id = 12;
UPDATE products SET stock = 40 WHERE id = 13;
UPDATE products SET stock = 25 WHERE id = 14;
UPDATE products SET stock = 20 WHERE id = 15;
UPDATE products SET stock = 15 WHERE id = 16;
UPDATE products SET stock = 12 WHERE id = 17;
UPDATE products SET stock = 18 WHERE id = 18;
UPDATE products SET stock = 15 WHERE id = 19;
UPDATE products SET stock = 30 WHERE id = 20;
UPDATE products SET stock = 25 WHERE id = 21;
UPDATE products SET stock = 8 WHERE id = 22;
UPDATE products SET stock = 6 WHERE id = 23;
UPDATE products SET stock = 5 WHERE id = 24;
UPDATE products SET stock = 20 WHERE id = 25;
UPDATE products SET stock = 100 WHERE id = 26;
UPDATE products SET stock = 15 WHERE id = 27;
UPDATE products SET stock = 12 WHERE id = 28;
UPDATE products SET stock = 20 WHERE id = 29;
UPDATE products SET stock = 15 WHERE id = 30;
UPDATE products SET stock = 25 WHERE id = 31;
UPDATE products SET stock = 30 WHERE id = 32;
UPDATE products SET stock = 20 WHERE id = 33;
UPDATE products SET stock = 15 WHERE id = 34;
UPDATE products SET stock = 18 WHERE id = 35;
UPDATE products SET stock = 25 WHERE id = 36;
UPDATE products SET stock = 20 WHERE id = 37;
UPDATE products SET stock = 22 WHERE id = 38;

-- Sample Sale 1: Large tire purchase (4 Michelin Defender T+H)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 759.96, 60.80, 0.00, 'cash', 800.00, 40.04, datetime('now', '-1 day', '+8 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 4, 189.99, 759.96);

UPDATE products SET stock = stock - 4 WHERE id = 1;

-- Sample Sale 2: Oil change service
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 45.98, 3.68, 5.00, 'card', 45.98, 0.00, datetime('now', '-1 day', '+10 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(2, 7, 1, 34.99, 34.99),
(2, 11, 1, 8.99, 8.99);

UPDATE products SET stock = stock - 1 WHERE id = 7;
UPDATE products SET stock = stock - 1 WHERE id = 11;

-- Sample Sale 3: Brake service
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 98.97, 7.92, 0.00, 'cash', 100.00, 1.03, datetime('now', '-1 day', '+14 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(3, 15, 1, 45.99, 45.99),
(3, 20, 1, 12.99, 12.99),
(3, 19, 1, 49.99, 49.99);

UPDATE products SET stock = stock - 1 WHERE id = 15;
UPDATE products SET stock = stock - 1 WHERE id = 20;
UPDATE products SET stock = stock - 1 WHERE id = 19;

-- Sample Sale 4: Performance tire upgrade (4 Pirelli P Zero)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 1199.96, 96.00, 50.00, 'card', 1199.96, 0.00, datetime('now', '-2 days', '+16 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(4, 5, 4, 299.99, 1199.96);

UPDATE products SET stock = stock - 4 WHERE id = 5;

-- Sample Sale 5: Car care products
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 67.96, 5.44, 0.00, 'cash', 70.00, 2.04, datetime('now', '-2 days', '+12 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(5, 29, 1, 14.99, 14.99),
(5, 30, 1, 24.99, 24.99),
(5, 31, 1, 8.99, 8.99),
(5, 32, 1, 7.99, 7.99),
(5, 26, 2, 4.99, 9.98);

UPDATE products SET stock = stock - 1 WHERE id = 29;
UPDATE products SET stock = stock - 1 WHERE id = 30;
UPDATE products SET stock = stock - 1 WHERE id = 31;
UPDATE products SET stock = stock - 1 WHERE id = 32;
UPDATE products SET stock = stock - 2 WHERE id = 26;

-- Sample Sale 6: Truck tire replacement (4 Goodyear Wrangler)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 799.96, 64.00, 0.00, 'card', 799.96, 0.00, datetime('now', '-3 days', '+9 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(6, 3, 4, 199.99, 799.96);

UPDATE products SET stock = stock - 4 WHERE id = 3;

-- Sample Sale 7: Winter tire preparation (4 Dunlop Winter)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 719.96, 57.60, 20.00, 'cash', 750.00, 30.04, datetime('now', '-3 days', '+15 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(7, 6, 4, 179.99, 719.96);

UPDATE products SET stock = stock - 4 WHERE id = 6;

-- Sample Sale 8: Fluids and filters
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 89.95, 7.20, 0.00, 'card', 89.95, 0.00, datetime('now', '-4 days', '+11 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(8, 8, 1, 18.99, 18.99),
(8, 9, 1, 28.99, 28.99),
(8, 12, 1, 12.99, 12.99),
(8, 13, 1, 9.99, 9.99),
(8, 33, 1, 12.99, 12.99),
(8, 36, 1, 8.99, 8.99);

UPDATE products SET stock = stock - 1 WHERE id = 8;
UPDATE products SET stock = stock - 1 WHERE id = 9;
UPDATE products SET stock = stock - 1 WHERE id = 12;
UPDATE products SET stock = stock - 1 WHERE id = 13;
UPDATE products SET stock = stock - 1 WHERE id = 33;
UPDATE products SET stock = stock - 1 WHERE id = 36;

-- Sample Sale 9: Wheel upgrade (4 American Racing wheels)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 759.96, 60.80, 100.00, 'card', 759.96, 0.00, datetime('now', '-5 days', '+13 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(9, 22, 4, 189.99, 759.96);

UPDATE products SET stock = stock - 4 WHERE id = 22;

-- Sample Sale 10: Mixed accessories
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 89.96, 7.20, 0.00, 'cash', 90.00, 0.04, datetime('now', '-5 days', '+17 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(10, 25, 1, 29.99, 29.99),
(10, 27, 1, 19.99, 19.99),
(10, 28, 1, 24.99, 24.99),
(10, 26, 3, 4.99, 14.97);

UPDATE products SET stock = stock - 1 WHERE id = 25;
UPDATE products SET stock = stock - 1 WHERE id = 27;
UPDATE products SET stock = stock - 1 WHERE id = 28;
UPDATE products SET stock = stock - 3 WHERE id = 26;

-- Sample Sale 11: Today's sale (Bridgestone tire)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 165.99, 13.28, 0.00, 'card', 165.99, 0.00, datetime('now', '+2 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(11, 2, 1, 165.99, 165.99);

UPDATE products SET stock = stock - 1 WHERE id = 2;

-- Sample Sale 12: Yesterday's sale (Continental tire)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 219.99, 17.60, 0.00, 'cash', 220.00, 0.01, datetime('now', '-1 day', '+18 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(12, 4, 1, 219.99, 219.99);

UPDATE products SET stock = stock - 1 WHERE id = 4;

-- Sample Sale 13: High-value sale (4 Fuel wheels)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 999.96, 80.00, 200.00, 'card', 999.96, 0.00, datetime('now', '-6 days', '+14 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(13, 23, 4, 249.99, 999.96);

UPDATE products SET stock = stock - 4 WHERE id = 23;

-- Sample Sale 14: Small sale (Chemical Guys wax)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 24.99, 2.00, 0.00, 'cash', 25.00, 0.01, datetime('now', '-7 days', '+16 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(14, 30, 1, 24.99, 24.99);

UPDATE products SET stock = stock - 1 WHERE id = 30;

-- Sample Sale 15: Multiple items sale (Brake pads)
INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, payment_method, payment_received, change_given, created_at) VALUES
(2, 156.97, 12.56, 10.00, 'card', 156.97, 0.00, datetime('now', '-8 days', '+10 hours'));

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(15, 16, 1, 52.99, 52.99),
(15, 17, 1, 68.99, 68.99),
(15, 18, 1, 39.99, 39.99);

UPDATE products SET stock = stock - 1 WHERE id = 16;
UPDATE products SET stock = stock - 1 WHERE id = 17;
UPDATE products SET stock = stock - 1 WHERE id = 18;
