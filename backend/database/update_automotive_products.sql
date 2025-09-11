-- Clear existing products
DELETE FROM products;

-- Insert diverse automotive products (tires, oil, filters, brake pads, accessories, etc.)
INSERT INTO products (name, sku, barcode, price, cost, stock, category, brand, tire_size, description, min_stock) VALUES

-- TIRES
('Michelin Defender T+H', 'MIC-DEF-225-65-17', '1234567890001', 189.99, 120.00, 15, 'Passenger Tires', 'Michelin', '225/65R17', 'All-season tire with excellent traction and long tread life', 3),
('Bridgestone Ecopia EP422 Plus', 'BRI-ECO-205-55-16', '1234567890002', 165.99, 105.00, 12, 'Passenger Tires', 'Bridgestone', '205/55R16', 'Fuel-efficient tire with low rolling resistance', 3),
('Goodyear Wrangler All-Terrain', 'GOO-WRA-265-70-17', '1234567890003', 199.99, 130.00, 8, 'Truck Tires', 'Goodyear', '265/70R17', 'All-terrain tire for trucks and SUVs', 2),
('Continental CrossContact LX25', 'CON-CLX-245-70-19', '1234567890004', 219.99, 145.00, 6, 'SUV Tires', 'Continental', '245/70R19', 'Premium SUV tire with excellent wet traction', 2),
('Pirelli P Zero', 'PIR-PZ0-275-35-19', '1234567890005', 299.99, 200.00, 4, 'Performance Tires', 'Pirelli', '275/35R19', 'High-performance summer tire for sports cars', 1),
('Dunlop Winter Maxx WM02', 'DUN-WMX-205-55-16', '1234567890006', 179.99, 115.00, 10, 'Winter Tires', 'Dunlop', '205/55R16', 'Studless winter tire with excellent ice traction', 3),

-- MOTOR OIL
('Mobil 1 5W-30 Synthetic', 'MOB-1-5W30-5QT', '1234567890007', 34.99, 22.00, 25, 'Oil & Fluids', 'Mobil 1', NULL, 'Full synthetic motor oil 5W-30, 5 quart bottle', 5),
('Castrol GTX 10W-30 Conventional', 'CAS-GTX-10W30-5QT', '1234567890008', 18.99, 12.00, 30, 'Oil & Fluids', 'Castrol', NULL, 'Conventional motor oil 10W-30, 5 quart bottle', 8),
('Pennzoil Platinum 0W-20', 'PEN-PLT-0W20-5QT', '1234567890009', 28.99, 18.00, 20, 'Oil & Fluids', 'Pennzoil', NULL, 'Full synthetic motor oil 0W-20, 5 quart bottle', 5),
('Valvoline High Mileage 5W-30', 'VAL-HM-5W30-5QT', '1234567890010', 24.99, 16.00, 18, 'Oil & Fluids', 'Valvoline', NULL, 'High mileage synthetic blend 5W-30, 5 quart bottle', 4),

-- OIL FILTERS
('Fram Extra Guard PH6607', 'FRA-EG-PH6607', '1234567890011', 8.99, 4.50, 50, 'Auto Parts', 'Fram', NULL, 'Oil filter for most Honda and Acura vehicles', 10),
('Bosch Premium 3300', 'BOS-PR-3300', '1234567890012', 12.99, 7.00, 35, 'Auto Parts', 'Bosch', NULL, 'Premium oil filter for GM vehicles', 8),
('WIX 51348', 'WIX-51348', '1234567890013', 9.99, 5.50, 40, 'Auto Parts', 'WIX', NULL, 'High quality oil filter for Ford vehicles', 8),
('K&N HP-1003', 'KN-HP-1003', '1234567890014', 15.99, 9.00, 25, 'Auto Parts', 'K&N', NULL, 'High performance oil filter with nut for easy removal', 5),

-- BRAKE PADS
('Raybestos Professional Grade', 'RAY-PG-FD1234', '1234567890015', 45.99, 28.00, 20, 'Brake Pads', 'Raybestos', NULL, 'Professional grade ceramic brake pads, front', 4),
('Wagner ThermoQuiet QC1234', 'WAG-TQ-QC1234', '1234567890016', 52.99, 32.00, 15, 'Brake Pads', 'Wagner', NULL, 'ThermoQuiet ceramic brake pads with shims', 3),
('Akebono ProACT Ultra-Premium', 'AKE-PA-ACT1234', '1234567890017', 68.99, 42.00, 12, 'Brake Pads', 'Akebono', NULL, 'Ultra-premium ceramic brake pads, low dust', 3),
('Power Stop Z23 Evolution', 'POW-Z23-EVO1234', '1234567890018', 39.99, 24.00, 18, 'Brake Pads', 'Power Stop', NULL, 'Evolution ceramic brake pads with hardware', 4),

-- AIR FILTERS
('K&N 33-2304 Air Filter', 'KN-AF-33-2304', '1234567890019', 49.99, 30.00, 15, 'Auto Parts', 'K&N', NULL, 'High flow air filter, washable and reusable', 3),
('Fram CA10134 Air Filter', 'FRA-AF-CA10134', '1234567890020', 12.99, 7.50, 30, 'Auto Parts', 'Fram', NULL, 'Standard air filter for most vehicles', 8),
('Bosch 6071C Air Filter', 'BOS-AF-6071C', '1234567890021', 18.99, 11.00, 25, 'Auto Parts', 'Bosch', NULL, 'Premium air filter with activated charcoal', 6),

-- WHEELS & RIMS
('American Racing AR172 Baja', 'AMR-AR172-BAJA', '1234567890022', 189.99, 120.00, 8, 'Wheels', 'American Racing', '17x8', 'Black Baja wheel, 17x8, 5x114.3 bolt pattern', 2),
('Fuel D531 Vapor', 'FUE-D531-VAPOR', '1234567890023', 249.99, 160.00, 6, 'Wheels', 'Fuel', '18x9', 'Matte black Vapor wheel, 18x9, 6x139.7 bolt pattern', 2),
('Method MR305 NV', 'MET-MR305-NV', '1234567890024', 199.99, 130.00, 5, 'Wheels', 'Method', '17x8.5', 'Nevada wheel in matte black, 17x8.5', 1),

-- TIRE ACCESSORIES
('Tire Pressure Monitoring Sensor', 'TPM-SEN-315MHZ', '1234567890025', 29.99, 18.00, 20, 'Tire Accessories', 'Generic', NULL, '315MHz TPMS sensor for most vehicles', 5),
('Tire Valve Stem Caps (Set of 4)', 'VAL-CAP-SET4', '1234567890026', 4.99, 2.00, 100, 'Tire Accessories', 'Generic', NULL, 'Chrome valve stem caps, set of 4', 20),
('Tire Repair Kit', 'TIR-REP-KIT', '1234567890027', 19.99, 12.00, 15, 'Tire Accessories', 'Generic', NULL, 'Complete tire repair kit with plugs and tools', 3),
('Wheel Balancing Weights (Box)', 'WHE-BAL-BOX', '1234567890028', 24.99, 15.00, 12, 'Tire Accessories', 'Generic', NULL, 'Stick-on wheel balancing weights, 1/4 oz', 3),

-- CAR CARE PRODUCTS
('Meguiars Ultimate Wash & Wax', 'MEG-UWW-64OZ', '1234567890029', 14.99, 9.00, 20, 'Car Care', 'Meguiars', NULL, '64oz car wash and wax in one', 5),
('Chemical Guys Butter Wet Wax', 'CHE-BWW-16OZ', '1234567890030', 24.99, 16.00, 15, 'Car Care', 'Chemical Guys', NULL, '16oz premium carnauba wax', 3),
('Armor All Original Protectant', 'ARM-ORI-16OZ', '1234567890031', 8.99, 5.50, 25, 'Car Care', 'Armor All', NULL, '16oz interior and exterior protectant', 6),
('Rain-X Original Glass Treatment', 'RAI-ORI-6OZ', '1234567890032', 7.99, 4.50, 30, 'Car Care', 'Rain-X', NULL, '6oz windshield water repellent', 8),

-- COOLANT & ANTIFREEZE
('Prestone Antifreeze/Coolant', 'PRE-AFC-1GAL', '1234567890033', 12.99, 8.00, 20, 'Oil & Fluids', 'Prestone', NULL, '1 gallon 50/50 pre-mixed antifreeze/coolant', 5),
('Zerex G-05 Antifreeze', 'ZER-G05-1GAL', '1234567890034', 15.99, 10.00, 15, 'Oil & Fluids', 'Zerex', NULL, '1 gallon concentrated antifreeze for Asian vehicles', 4),
('Peak Global Lifetime', 'PEA-GLT-1GAL', '1234567890035', 11.99, 7.50, 18, 'Oil & Fluids', 'Peak', NULL, '1 gallon universal antifreeze/coolant', 4),

-- TRANSMISSION FLUID
('Valvoline MaxLife ATF', 'VAL-ML-ATF-1QT', '1234567890036', 8.99, 5.50, 25, 'Oil & Fluids', 'Valvoline', NULL, '1 quart automatic transmission fluid', 6),
('Mobil 1 Synthetic ATF', 'MOB-1-ATF-1QT', '1234567890037', 12.99, 8.00, 20, 'Oil & Fluids', 'Mobil 1', NULL, '1 quart full synthetic ATF', 5),
('Castrol Transmax Import', 'CAS-TMI-1QT', '1234567890038', 9.99, 6.00, 22, 'Oil & Fluids', 'Castrol', NULL, '1 quart transmission fluid for imports', 5);

-- Update settings for automotive store
UPDATE settings SET value = 'Premium Tire & Auto Center' WHERE key = 'company_name';
UPDATE settings SET value = '123 Auto Way, Tire City, TC 12345' WHERE key = 'company_address';
UPDATE settings SET value = 'Thank you for choosing Premium Tire & Auto Center! Drive safely! 🚗' WHERE key = 'receipt_footer';
