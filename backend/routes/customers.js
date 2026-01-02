const express = require('express');
const Database = require('../database/db');
const { authenticateToken, requireAdmin, requireCashier } = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { search } = req.query;
        const db = new Database();
        let sql = 'SELECT * FROM customers WHERE 1=1';
        let params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ' ORDER BY name';
        const customers = await db.query(sql, params);
        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get customer by ID
router.get('/:id', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();
        const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new customer
router.post('/', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Customer name is required' });
        }

        const db = new Database();
        const result = await db.run(
            'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
            [name, phone, email, address]
        );

        const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.id]);
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update customer
router.put('/:id', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address } = req.body;

        const db = new Database();
        const existingCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);

        if (!existingCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            params.push(email);
        }
        if (address !== undefined) {
            updates.push('address = ?');
            params.push(address);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await db.run(
            `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
        res.json(updatedCustomer);
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete customer (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();

        // Check if customer has sales records
        const salesCount = await db.get('SELECT COUNT(*) as count FROM sales WHERE customer_id = ?', [id]);
        if (salesCount.count > 0) {
            return res.status(400).json({
                error: 'Cannot delete customer with transaction history.'
            });
        }

        await db.run('DELETE FROM customers WHERE id = ?', [id]);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
