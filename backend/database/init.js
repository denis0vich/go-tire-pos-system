const Database = require('./db');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists (for local SQLite only)
if (!process.env.TURSO_DATABASE_URL) {
    const dbDir = path.join(__dirname);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
}

// Initialize database with tables and default data
async function initializeDatabase() {
    const db = new Database();

    try {
        await db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
            full_name TEXT,
            theme_color TEXT DEFAULT '#ef4444',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Products table
        await db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            sku TEXT,
            barcode TEXT UNIQUE,
            price DECIMAL(10,2) NOT NULL,
            cost DECIMAL(10,2),
            stock INTEGER DEFAULT 0,
            category TEXT,
            description TEXT,
            brand TEXT,
            tire_size TEXT,
            min_stock INTEGER DEFAULT 5,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Sales table
        await db.run(`CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cashier_id INTEGER NOT NULL,
            customer_id INTEGER,
            total_amount DECIMAL(10,2) NOT NULL,
            vat_amount DECIMAL(10,2) DEFAULT 0,
            discount_amount DECIMAL(10,2) DEFAULT 0,
            payment_method TEXT NOT NULL,
            payment_received DECIMAL(10,2),
            change_given DECIMAL(10,2),
            amount_paid DECIMAL(10,2) DEFAULT 0,
            status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cashier_id) REFERENCES users (id),
            FOREIGN KEY (customer_id) REFERENCES customers (id)
        )`);

        // Sale items table
        await db.run(`CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )`);

        // Customers table
        await db.run(`CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Payments table (for down payments/partial payments)
        await db.run(`CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            payment_method TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE
        )`);

        // Settings table
        await db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert default admin user
        const adminPassword = bcrypt.hashSync('admin123', 10);
        await db.run(`INSERT OR IGNORE INTO users (username, password, role, full_name) 
                VALUES ('admin', ?, 'admin', 'System Administrator')`, [adminPassword]);

        // Insert default cashier user
        const cashierPassword = bcrypt.hashSync('cashier123', 10);
        await db.run(`INSERT OR IGNORE INTO users (username, password, role, full_name) 
                VALUES ('cashier', ?, 'cashier', 'Default Cashier')`, [cashierPassword]);

        // Insert default settings
        const defaultSettings = [
            ['vat_rate', '12.0', 'Default VAT rate percentage'],
            ['currency', 'PHP', 'Currency symbol'],
            ['company_name', 'Go Tire Car Care Center', 'Company name for receipts'],
            ['company_address', 'B2 L18-B Camarin Road, Camarin Rd, Caloocan, 1400 Metro Manila', 'Company address'],
            ['receipt_footer', 'Thank you for your business!', 'Receipt footer message'],
            ['backup_interval', '60', 'Backup interval in minutes'],
            ['backup_retention', '30', 'Number of backups to retain']
        ];

        for (const [key, value, description] of defaultSettings) {
            await db.run(`INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)`, 
                   [key, value, description]);
        }

        // Insert sample products
        const sampleProducts = [
            ['Coca Cola 330ml', '1234567890123', 1.50, 100, 'Beverages'],
            ['Pepsi 330ml', '1234567890124', 1.45, 80, 'Beverages'],
            ['Bread Loaf', '1234567890125', 2.99, 50, 'Bakery'],
            ['Milk 1L', '1234567890126', 3.49, 30, 'Dairy'],
            ['Bananas 1kg', '1234567890127', 2.99, 25, 'Fruits']
        ];

        for (const [name, barcode, price, stock, category] of sampleProducts) {
            await db.run(`INSERT OR IGNORE INTO products (name, barcode, price, stock, category) 
                    VALUES (?, ?, ?, ?, ?)`, [name, barcode, price, stock, category]);
        }

        await db.close();

        console.log('Database initialized successfully!');
        console.log('Default login credentials:');
        console.log('Admin: admin / admin123');
        console.log('Cashier: cashier / cashier123');
    } catch (error) {
        console.error('Database initialization error:', error);
        await db.close();
        throw error;
    }
}

// Run initialization if called directly
if (require.main === module) {
    initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };
