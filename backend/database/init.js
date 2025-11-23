const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'pos.db');

// Initialize database with tables and default data
function initializeDatabase() {
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
            full_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            barcode TEXT UNIQUE,
            price DECIMAL(10,2) NOT NULL,
            stock INTEGER DEFAULT 0,
            category TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Sales table
        db.run(`CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cashier_id INTEGER NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            tax_amount DECIMAL(10,2) DEFAULT 0,
            discount_amount DECIMAL(10,2) DEFAULT 0,
            payment_method TEXT NOT NULL,
            payment_received DECIMAL(10,2),
            change_given DECIMAL(10,2),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cashier_id) REFERENCES users (id)
        )`);

        // Sale items table
        db.run(`CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (sale_id) REFERENCES sales (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )`);

        // Settings table
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert default admin user
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT OR IGNORE INTO users (username, password, role, full_name) 
                VALUES ('admin', ?, 'admin', 'System Administrator')`, [adminPassword]);

        // Insert default cashier user
        const cashierPassword = bcrypt.hashSync('cashier123', 10);
        db.run(`INSERT OR IGNORE INTO users (username, password, role, full_name) 
                VALUES ('cashier', ?, 'cashier', 'Default Cashier')`, [cashierPassword]);

        // Insert default settings
        const defaultSettings = [
            ['tax_rate', '10.0', 'Default tax rate percentage'],
            ['currency', 'PHP', 'Currency symbol'],
            ['company_name', 'Your Store Name', 'Company name for receipts'],
            ['company_address', '123 Main St, City, State 12345', 'Company address'],
            ['receipt_footer', 'Thank you for your business!', 'Receipt footer message'],
            ['backup_interval', '60', 'Backup interval in minutes'],
            ['backup_retention', '30', 'Number of backups to retain']
        ];

        defaultSettings.forEach(([key, value, description]) => {
            db.run(`INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)`, 
                   [key, value, description]);
        });

        // Insert sample products
        const sampleProducts = [
            ['Coca Cola 330ml', '1234567890123', 1.50, 100, 'Beverages'],
            ['Pepsi 330ml', '1234567890124', 1.45, 80, 'Beverages'],
            ['Bread Loaf', '1234567890125', 2.99, 50, 'Bakery'],
            ['Milk 1L', '1234567890126', 3.49, 30, 'Dairy'],
            ['Bananas 1kg', '1234567890127', 2.99, 25, 'Fruits']
        ];

        sampleProducts.forEach(([name, barcode, price, stock, category]) => {
            db.run(`INSERT OR IGNORE INTO products (name, barcode, price, stock, category) 
                    VALUES (?, ?, ?, ?, ?)`, [name, barcode, price, stock, category]);
        });

        console.log('Database initialized successfully!');
        console.log('Default login credentials:');
        console.log('Admin: admin / admin123');
        console.log('Cashier: cashier / cashier123');
    });

    db.close();
}

// Run initialization if called directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
