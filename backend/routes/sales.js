const express = require('express');
const Database = require('../database/db');
const { authenticateToken, requireCashier, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create new sale
router.post('/', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { items, payment_method, payment_received, discount_amount = 0 } = req.body;
        const cashier_id = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        if (!payment_method) {
            return res.status(400).json({ error: 'Payment method is required' });
        }

        const db = new Database();

        // Start transaction
        await db.run('BEGIN TRANSACTION');

        try {
            // Get tax rate from settings
            const taxSetting = await db.get('SELECT value FROM settings WHERE key = ?', ['tax_rate']);
            const taxRate = parseFloat(taxSetting?.value || 0) / 100;

            let subtotal = 0;
            const saleItems = [];

            // Validate items and calculate totals
            for (const item of items) {
                const { product_id, quantity } = item;

                if (!product_id || !quantity || quantity <= 0) {
                    throw new Error('Invalid item data');
                }

                // Get product details
                const product = await db.get('SELECT * FROM products WHERE id = ?', [product_id]);
                if (!product) {
                    throw new Error(`Product with ID ${product_id} not found`);
                }

                // Check stock availability
                if (product.stock < quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
                }

                const itemTotal = product.price * quantity;
                subtotal += itemTotal;

                saleItems.push({
                    product_id,
                    quantity,
                    unit_price: product.price,
                    total_price: itemTotal
                });
            }

            // Calculate tax and total
            const tax_amount = (subtotal - discount_amount) * taxRate;
            const total_amount = subtotal - discount_amount + tax_amount;

            // Calculate change
            const change_given = payment_received ? Math.max(0, payment_received - total_amount) : 0;

            // Insert sale record
            const saleResult = await db.run(
                `INSERT INTO sales (cashier_id, total_amount, tax_amount, discount_amount, 
                 payment_method, payment_received, change_given) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [cashier_id, total_amount, tax_amount, discount_amount, 
                 payment_method, payment_received, change_given]
            );

            const sale_id = saleResult.id;

            // Insert sale items and update stock
            for (const item of saleItems) {
                // Insert sale item
                await db.run(
                    'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                    [sale_id, item.product_id, item.quantity, item.unit_price, item.total_price]
                );

                // Update product stock
                await db.run(
                    'UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // Commit transaction
            await db.run('COMMIT');

            // Get complete sale data for response
            const sale = await db.get(`
                SELECT s.*, u.full_name as cashier_name 
                FROM sales s 
                JOIN users u ON s.cashier_id = u.id 
                WHERE s.id = ?
            `, [sale_id]);

            const saleItemsWithProducts = await db.query(`
                SELECT si.*, p.name as product_name, p.barcode 
                FROM sale_items si 
                JOIN products p ON si.product_id = p.id 
                WHERE si.sale_id = ?
            `, [sale_id]);

            res.status(201).json({
                sale,
                items: saleItemsWithProducts,
                receipt_data: {
                    subtotal,
                    discount_amount,
                    tax_amount,
                    total_amount,
                    payment_received,
                    change_given
                }
            });

        } catch (error) {
            // Rollback transaction on error
            await db.run('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Create sale error:', error);
        res.status(400).json({ error: error.message || 'Internal server error' });
    }
});

// Get sales history
router.get('/', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { page = 1, limit = 20, start_date, end_date, cashier_id } = req.query;
        const offset = (page - 1) * limit;
        const user = req.user;

        const db = new Database();
        let sql = `
            SELECT s.*, u.full_name as cashier_name 
            FROM sales s 
            JOIN users u ON s.cashier_id = u.id 
            WHERE 1=1
        `;
        let params = [];

        // Non-admin users can only see their own sales
        if (user.role !== 'admin') {
            sql += ' AND s.cashier_id = ?';
            params.push(user.id);
        } else if (cashier_id) {
            sql += ' AND s.cashier_id = ?';
            params.push(cashier_id);
        }

        if (start_date) {
            sql += ' AND DATE(s.created_at) >= ?';
            params.push(start_date);
        }

        if (end_date) {
            sql += ' AND DATE(s.created_at) <= ?';
            params.push(end_date);
        }

        sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const sales = await db.query(sql, params);

        // Get total count for pagination
        let countSql = 'SELECT COUNT(*) as total FROM sales s WHERE 1=1';
        let countParams = [];

        if (user.role !== 'admin') {
            countSql += ' AND s.cashier_id = ?';
            countParams.push(user.id);
        } else if (cashier_id) {
            countSql += ' AND s.cashier_id = ?';
            countParams.push(cashier_id);
        }

        if (start_date) {
            countSql += ' AND DATE(s.created_at) >= ?';
            countParams.push(start_date);
        }

        if (end_date) {
            countSql += ' AND DATE(s.created_at) <= ?';
            countParams.push(end_date);
        }

        const countResult = await db.get(countSql, countParams);
        const total = countResult.total;

        res.json({
            sales,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get sale details by ID
router.get('/:id', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const db = new Database();

        // Get sale with cashier info
        let sql = `
            SELECT s.*, u.full_name as cashier_name 
            FROM sales s 
            JOIN users u ON s.cashier_id = u.id 
            WHERE s.id = ?
        `;
        let params = [id];

        // Non-admin users can only see their own sales
        if (user.role !== 'admin') {
            sql += ' AND s.cashier_id = ?';
            params.push(user.id);
        }

        const sale = await db.get(sql, params);

        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        // Get sale items with product details
        const items = await db.query(`
            SELECT si.*, p.name as product_name, p.barcode 
            FROM sale_items si 
            JOIN products p ON si.product_id = p.id 
            WHERE si.sale_id = ?
        `, [id]);

        res.json({ sale, items });
    } catch (error) {
        console.error('Get sale details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get sales summary/statistics (admin only)
router.get('/reports/summary', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { start_date, end_date, cashier_id } = req.query;
        const db = new Database();

        let whereClause = 'WHERE 1=1';
        let params = [];

        if (start_date) {
            whereClause += ' AND DATE(created_at) >= ?';
            params.push(start_date);
        }

        if (end_date) {
            whereClause += ' AND DATE(created_at) <= ?';
            params.push(end_date);
        }

        if (cashier_id) {
            whereClause += ' AND cashier_id = ?';
            params.push(cashier_id);
        }

        // Get summary statistics
        const summary = await db.get(`
            SELECT 
                COUNT(*) as total_sales,
                SUM(total_amount) as total_revenue,
                SUM(tax_amount) as total_tax,
                SUM(discount_amount) as total_discounts,
                AVG(total_amount) as average_sale
            FROM sales ${whereClause}
        `, params);

        // Get sales by payment method
        const paymentMethods = await db.query(`
            SELECT 
                payment_method,
                COUNT(*) as count,
                SUM(total_amount) as total
            FROM sales ${whereClause}
            GROUP BY payment_method
        `, params);

        // Get top selling products
        const topProducts = await db.query(`
            SELECT 
                p.name,
                p.barcode,
                SUM(si.quantity) as total_sold,
                SUM(si.total_price) as total_revenue
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            JOIN sales s ON si.sale_id = s.id
            ${whereClause.replace('WHERE 1=1', 'WHERE 1=1')}
            GROUP BY p.id, p.name, p.barcode
            ORDER BY total_sold DESC
            LIMIT 10
        `, params);

        // Get daily sales (last 30 days or date range)
        const dailySales = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as sales_count,
                SUM(total_amount) as daily_revenue
            FROM sales ${whereClause}
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        `, params);

        res.json({
            summary,
            payment_methods: paymentMethods,
            top_products: topProducts,
            daily_sales: dailySales
        });
    } catch (error) {
        console.error('Get sales summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
