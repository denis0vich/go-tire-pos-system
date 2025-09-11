-- Clear existing generic products
DELETE FROM products;

-- Insert tire-specific products
INSERT INTO products (name, barcode, price, cost, stock, category, brand, tire_size, description, min_stock) VALUES
('Michelin Defender T+H', 'MIC0012256517', 189.99, 120.00, 15, 'Passenger Tires', 'Michelin', '225/65R17', 'All-season tire with excellent traction and long tread life', 3),
('Bridgestone Ecopia EP422 Plus', 'BRI0022055516', 165.99, 105.00, 12, 'Passenger Tires', 'Bridgestone', '205/55R16', 'Fuel-efficient tire with low rolling resistance', 3),
('Goodyear Assurance WeatherReady', 'GOO0032356518', 199.99, 130.00, 8, 'All-Season Tires', 'Goodyear', '235/65R18', 'All-weather tire with 3D TredLock technology', 2),
('Continental CrossContact LX25', 'CON0042457019', 219.99, 145.00, 6, 'SUV Tires', 'Continental', '245/70R19', 'Premium SUV tire with excellent wet traction', 2),
('Pirelli P Zero', 'PIR0052753519', 299.99, 200.00, 4, 'Performance Tires', 'Pirelli', '275/35R19', 'High-performance summer tire for sports cars', 1),
('Dunlop Winter Maxx WM02', 'DUN0062055516', 179.99, 115.00, 10, 'Winter Tires', 'Dunlop', '205/55R16', 'Studless winter tire with excellent ice traction', 3),
('Yokohama Geolandar A/T G015', 'YOK0072657017', 189.99, 125.00, 7, 'Truck Tires', 'Yokohama', '265/70R17', 'All-terrain tire for trucks and SUVs', 2),
('Hankook Ventus V12 evo2', 'HAN0082254517', 149.99, 95.00, 9, 'Performance Tires', 'Hankook', '225/45R17', 'Ultra-high performance summer tire', 2),
('Kumho Ecsta PA31', 'KUM0092156016', 129.99, 85.00, 11, 'Passenger Tires', 'Kumho', '215/60R16', 'All-season touring tire with comfort focus', 3),
('Toyo Proxes Sport A/S', 'TOY0102454518', 169.99, 110.00, 5, 'Performance Tires', 'Toyo', '245/45R18', 'All-season performance tire', 2),
('Falken Azenis FK510', 'FAL0112254018', 139.99, 90.00, 8, 'Performance Tires', 'Falken', '225/40R18', 'Ultra-high performance all-season tire', 2),
('Nitto NT555 G2', 'NIT0122754019', 199.99, 130.00, 3, 'Performance Tires', 'Nitto', '275/40R19', 'High-performance summer tire', 1),
('General AltiMAX RT43', 'GEN0132156016', 119.99, 75.00, 13, 'Passenger Tires', 'General', '215/60R16', 'All-season touring tire with long tread life', 4),
('Cooper Discoverer AT3 4S', 'COO0142657017', 179.99, 120.00, 6, 'Truck Tires', 'Cooper', '265/70R17', 'All-terrain tire with excellent off-road capability', 2),
('BFGoodrich All-Terrain T/A KO2', 'BFG0152857017', 199.99, 135.00, 4, 'Truck Tires', 'BFGoodrich', '285/70R17', 'Rugged all-terrain tire for off-road adventures', 1),
('Firestone Destination LE3', 'FIR0162256517', 149.99, 100.00, 9, 'SUV Tires', 'Firestone', '225/65R17', 'All-season SUV tire with comfort and durability', 3),
('Michelin Pilot Sport 4S', 'MIC0172753519', 349.99, 230.00, 2, 'Performance Tires', 'Michelin', '275/35R19', 'Ultra-high performance summer tire', 1),
('Bridgestone Blizzak WS90', 'BRI0182055516', 189.99, 125.00, 7, 'Winter Tires', 'Bridgestone', '205/55R16', 'Premium winter tire with advanced ice technology', 2),
('Goodyear Wrangler All-Terrain Adventure', 'GOO0192657017', 179.99, 120.00, 5, 'Truck Tires', 'Goodyear', '265/70R17', 'All-terrain tire with Kevlar construction', 2),
('Continental PureContact LS', 'CON0202256017', 159.99, 105.00, 8, 'Passenger Tires', 'Continental', '225/60R17', 'Eco-friendly all-season tire', 3);

-- Update settings for tire store
UPDATE settings SET value = 'Premium Tire Center' WHERE key = 'company_name';
UPDATE settings SET value = '123 Auto Way, Tire City, TC 12345' WHERE key = 'company_address';
UPDATE settings SET value = 'Thank you for choosing Premium Tire Center! Drive safely! 🚗' WHERE key = 'receipt_footer';
