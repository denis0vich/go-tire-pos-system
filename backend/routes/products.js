const express = require('express');
const Database = require('../database/db');
const { authenticateToken, requireAdmin, requireCashier } = require('../middleware/auth');

const router = express.Router();

// Get all products (with optional search and pagination)
router.get('/', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const db = new Database();
        let sql = 'SELECT * FROM products WHERE 1=1';
        let params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR barcode LIKE ? OR category LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ' ORDER BY name LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const products = await db.query(sql, params);

        // Get total count for pagination
        let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
        let countParams = [];
        if (search) {
            countSql += ' AND (name LIKE ? OR barcode LIKE ? OR category LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }

        const countResult = await db.get(countSql, countParams);
        const total = countResult.total;

        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get product by barcode
router.get('/barcode/:barcode', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { barcode } = req.params;
        const db = new Database();
        
        const product = await db.get('SELECT * FROM products WHERE barcode = ?', [barcode]);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product by barcode error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get product by ID
router.get('/:id', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();
        
        const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new product (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, barcode, price, stock = 0, category, description } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        if (price < 0) {
            return res.status(400).json({ error: 'Price cannot be negative' });
        }

        if (stock < 0) {
            return res.status(400).json({ error: 'Stock cannot be negative' });
        }

        const db = new Database();

        // Check if barcode already exists
        if (barcode) {
            const existingProduct = await db.get('SELECT id FROM products WHERE barcode = ?', [barcode]);
            if (existingProduct) {
                return res.status(400).json({ error: 'Barcode already exists' });
            }
        }

        const result = await db.run(
            'INSERT INTO products (name, barcode, price, stock, category, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, barcode, parseFloat(price), parseInt(stock), category, description]
        );

        const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [result.id]);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, barcode, price, stock, category, description } = req.body;

        const db = new Database();

        // Check if product exists
        const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if barcode already exists (excluding current product)
        if (barcode && barcode !== existingProduct.barcode) {
            const barcodeExists = await db.get('SELECT id FROM products WHERE barcode = ? AND id != ?', [barcode, id]);
            if (barcodeExists) {
                return res.status(400).json({ error: 'Barcode already exists' });
            }
        }

        // Validate inputs
        if (price !== undefined && price < 0) {
            return res.status(400).json({ error: 'Price cannot be negative' });
        }

        if (stock !== undefined && stock < 0) {
            return res.status(400).json({ error: 'Stock cannot be negative' });
        }

        // Update product
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (barcode !== undefined) {
            updates.push('barcode = ?');
            params.push(barcode);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            params.push(parseFloat(price));
        }
        if (stock !== undefined) {
            updates.push('stock = ?');
            params.push(parseInt(stock));
        }
        if (category !== undefined) {
            updates.push('category = ?');
            params.push(category);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await db.run(
            `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();

        // Check if product exists
        const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if product is used in any sales
        const salesCount = await db.get('SELECT COUNT(*) as count FROM sale_items WHERE product_id = ?', [id]);
        if (salesCount.count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete product that has been sold. Consider setting stock to 0 instead.' 
            });
        }

        await db.run('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update stock (for internal use during sales)
router.patch('/:id/stock', authenticateToken, requireCashier, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined) {
            return res.status(400).json({ error: 'Quantity is required' });
        }

        const db = new Database();
        const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const newStock = product.stock + parseInt(quantity);
        if (newStock < 0) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        await db.run('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
                     [newStock, id]);

        const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
