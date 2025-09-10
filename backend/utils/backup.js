const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const Database = require('../database/db');

class BackupManager {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/pos.db');
        this.backupDir = path.join(__dirname, '../../backups');
        this.ensureBackupDir();
        this.startScheduledBackups();
    }

    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `pos_backup_${timestamp}.db`;
            const backupPath = path.join(this.backupDir, backupFileName);

            // Copy database file
            await fs.copy(this.dbPath, backupPath);

            console.log(`Backup created: ${backupFileName}`);
            
            // Clean old backups
            await this.cleanOldBackups();

            return {
                success: true,
                filename: backupFileName,
                path: backupPath,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Backup creation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async cleanOldBackups() {
        try {
            const db = new Database();
            const retentionSetting = await db.get('SELECT value FROM settings WHERE key = ?', ['backup_retention']);
            const retentionDays = parseInt(retentionSetting?.value || 30);

            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(file => file.startsWith('pos_backup_') && file.endsWith('.db'));

            // Sort by creation time (newest first)
            const fileStats = await Promise.all(
                backupFiles.map(async file => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = await fs.stat(filePath);
                    return { file, path: filePath, mtime: stats.mtime };
                })
            );

            fileStats.sort((a, b) => b.mtime - a.mtime);

            // Keep only the specified number of backups
            const filesToDelete = fileStats.slice(retentionDays);

            for (const fileInfo of filesToDelete) {
                await fs.remove(fileInfo.path);
                console.log(`Deleted old backup: ${fileInfo.file}`);
            }
        } catch (error) {
            console.error('Error cleaning old backups:', error);
        }
    }

    async getBackupList() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(file => file.startsWith('pos_backup_') && file.endsWith('.db'));

            const backups = await Promise.all(
                backupFiles.map(async file => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = await fs.stat(filePath);
                    return {
                        filename: file,
                        size: stats.size,
                        created_at: stats.birthtime,
                        modified_at: stats.mtime
                    };
                })
            );

            // Sort by creation time (newest first)
            backups.sort((a, b) => b.created_at - a.created_at);

            return backups;
        } catch (error) {
            console.error('Error getting backup list:', error);
            return [];
        }
    }

    async restoreBackup(filename) {
        try {
            const backupPath = path.join(this.backupDir, filename);
            
            if (!await fs.pathExists(backupPath)) {
                throw new Error('Backup file not found');
            }

            // Create a backup of current database before restore
            await this.createBackup();

            // Restore the backup
            await fs.copy(backupPath, this.dbPath);

            console.log(`Database restored from: ${filename}`);
            return { success: true, message: 'Database restored successfully' };
        } catch (error) {
            console.error('Restore failed:', error);
            return { success: false, error: error.message };
        }
    }

    startScheduledBackups() {
        // Get backup interval from settings and schedule backups
        this.scheduleBackups();
    }

    async scheduleBackups() {
        try {
            const db = new Database();
            const intervalSetting = await db.get('SELECT value FROM settings WHERE key = ?', ['backup_interval']);
            const intervalMinutes = parseInt(intervalSetting?.value || 60);

            // Create cron expression for the interval
            const cronExpression = `*/${intervalMinutes} * * * *`; // Every X minutes

            // Stop existing scheduled task if any
            if (this.scheduledTask) {
                this.scheduledTask.stop();
            }

            // Start new scheduled task
            this.scheduledTask = cron.schedule(cronExpression, () => {
                console.log('Running scheduled backup...');
                this.createBackup();
            }, {
                scheduled: true,
                timezone: "America/New_York" // Adjust timezone as needed
            });

            console.log(`Scheduled backups every ${intervalMinutes} minutes`);
        } catch (error) {
            console.error('Error scheduling backups:', error);
        }
    }

    stop() {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
        }
    }
}

module.exports = BackupManager;
