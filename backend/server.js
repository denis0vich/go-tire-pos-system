const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database/init');
const BackupManager = require('./utils/backup');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const backupRoutes = require('./routes/backup');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize backup manager
const backupManager = new BackupManager();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Get system info (authenticated)
app.get('/api/system/info', authenticateToken, async (req, res) => {
    try {
        const Database = require('./database/db');
        const db = new Database();
        
        // Get database statistics
        const productCount = await db.get('SELECT COUNT(*) as count FROM products');
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        const salesCount = await db.get('SELECT COUNT(*) as count FROM sales');
        const todaySales = await db.get(`
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue 
            FROM sales 
            WHERE DATE(created_at) = DATE('now')
        `);

        res.json({
            database: {
                products: productCount.count,
                users: userCount.count,
                total_sales: salesCount.count,
                today_sales: todaySales.count,
                today_revenue: todaySales.revenue
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: '1.0.0'
            }
        });
    } catch (error) {
        console.error('System info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Only serve static files and catch-all in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from frontend build (for production)
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    
    // Catch all handler for React app (for production)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('Initializing database...');
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 POS Server running on port ${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`🔄 Automatic backups enabled`);
            console.log('');
            console.log('Default login credentials:');
            console.log('👤 Admin: admin / admin123');
            console.log('💼 Cashier: cashier / cashier123');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    backupManager.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    backupManager.stop();
    process.exit(0);
});

startServer();
