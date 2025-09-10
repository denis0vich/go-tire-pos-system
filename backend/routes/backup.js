const express = require('express');
const BackupManager = require('../utils/backup');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const backupManager = new BackupManager();

// Create manual backup (admin only)
router.post('/create', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await backupManager.createBackup();
        
        if (result.success) {
            res.json({
                message: 'Backup created successfully',
                filename: result.filename,
                timestamp: result.timestamp
            });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Manual backup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get backup list (admin only)
router.get('/list', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const backups = await backupManager.getBackupList();
        res.json(backups);
    } catch (error) {
        console.error('Get backup list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Restore backup (admin only)
router.post('/restore/:filename', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const result = await backupManager.restoreBackup(filename);
        
        if (result.success) {
            res.json({ message: result.message });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Restore backup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
