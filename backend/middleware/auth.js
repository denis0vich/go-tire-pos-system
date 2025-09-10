const jwt = require('jsonwebtoken');
const Database = require('../database/db');

const JWT_SECRET = 'pos_system_secret_key_2024'; // In production, use environment variable

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user details from database
        const db = new Database();
        const user = await db.get('SELECT id, username, role, full_name FROM users WHERE id = ?', [decoded.userId]);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Middleware to check if user is admin or cashier
const requireCashier = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'cashier') {
        return res.status(403).json({ error: 'Cashier or admin access required' });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireCashier,
    JWT_SECRET
};
