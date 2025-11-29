const { createClient } = require('@libsql/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Configuration
const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://pos-denis0vich.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjM5MTcxNjAsImlkIjoiYjk1Y2MxMzQtODY5Yy00ZmIzLTk0ZjctNTYzYzFmMDE3NjJkIiwicmlkIjoiNWU5YTk1YWItMmJhNC00NDQ4LTllNTYtYjE0NGUwZjlmYTdhIn0.63ZD-8hlImspBBF3IqgrHaJ1XpflyyTSWOTd3khVsLW5XeOp1KxstuYbR4Sjp37IcZTjLixPKNYJ2r0CPxg1AQ';

// Table order for migration (respecting foreign key constraints)
const TABLE_ORDER = [
    'users',        // No dependencies
    'settings',     // No dependencies
    'products',     // No dependencies
    'sales',        // Depends on users
    'sale_items'    // Depends on sales and products
];

/**
 * Promisify SQLite database operations
 */
function promisify(db, method, ...args) {
    return new Promise((resolve, reject) => {
        db[method](...args, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

/**
 * Get all table names from SQLite database
 */
async function getTables(db) {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.name));
        });
    });
}

/**
 * Get table schema from SQLite database
 */
async function getTableSchema(db, tableName) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

/**
 * Get CREATE TABLE statement from SQLite database
 */
async function getCreateTableStatement(db, tableName) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.sql : null);
        });
    });
}

/**
 * Get all data from a table
 */
async function getTableData(db, tableName) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

/**
 * Get column names from table schema
 */
function getColumnNames(schema) {
    return schema.map(col => col.name);
}

/**
 * Build INSERT statement for a table
 */
function buildInsertStatement(tableName, columns, useReplace = true) {
    const columnNames = columns.join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const insertType = useReplace ? 'INSERT OR REPLACE' : 'INSERT';
    return `${insertType} INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
}

/**
 * Migrate data from SQLite to Turso
 */
async function migrateToTurso(backupFilePath) {
    console.log('🚀 Starting migration from SQLite to Turso...\n');

    // Validate backup file exists
    if (!fs.existsSync(backupFilePath)) {
        throw new Error(`Backup file not found: ${backupFilePath}`);
    }

    console.log(`📂 Source: ${backupFilePath}`);
    console.log(`☁️  Destination: ${TURSO_URL}\n`);

    // Connect to SQLite backup
    const sqliteDb = new sqlite3.Database(backupFilePath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            throw new Error(`Failed to open SQLite backup: ${err.message}`);
        }
    });

    // Connect to Turso
    const tursoClient = createClient({
        url: TURSO_URL,
        authToken: TURSO_TOKEN
    });

    try {
        console.log('✅ Connected to both databases\n');

        // Get all tables from SQLite
        const tables = await getTables(sqliteDb);
        console.log(`📊 Found ${tables.length} tables: ${tables.join(', ')}\n`);

        // Sort tables according to dependency order
        const orderedTables = TABLE_ORDER.filter(table => tables.includes(table));
        const remainingTables = tables.filter(table => !TABLE_ORDER.includes(table));
        const finalTableOrder = [...orderedTables, ...remainingTables];

        // Clear all tables first in reverse dependency order to avoid foreign key issues
        console.log('🧹 Clearing existing data in Turso (reverse dependency order)...\n');
        const reverseOrder = [...finalTableOrder].reverse(); // Reverse for deletion
        for (const tableName of reverseOrder) {
            try {
                const tableCheck = await tursoClient.execute(
                    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
                    [tableName]
                );
                
                if (tableCheck.rows.length > 0) {
                    try {
                        await tursoClient.execute(`DELETE FROM ${tableName}`);
                        console.log(`   ✅ Cleared ${tableName}`);
                    } catch (error) {
                        if (error.message.includes('FOREIGN KEY')) {
                            console.log(`   ⚠️  ${tableName}: Cannot clear (foreign key constraints) - will use REPLACE`);
                        } else {
                            console.log(`   ⚠️  ${tableName}: ${error.message}`);
                        }
                    }
                }
            } catch (error) {
                // Table might not exist, that's okay
            }
        }
        console.log('');

        let totalRowsMigrated = 0;
        const skippedRecords = {
            foreignKey: 0,
            unique: 0,
            other: 0
        };

        // Migrate each table
        for (const tableName of finalTableOrder) {
            console.log(`📦 Migrating table: ${tableName}`);

            // Check if table exists in Turso, create if it doesn't
            try {
                const tableCheck = await tursoClient.execute(
                    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
                    [tableName]
                );
                
                if (tableCheck.rows.length === 0) {
                    // Table doesn't exist, create it from SQLite schema
                    console.log(`   🔨 Creating table structure...`);
                    const createStatement = await getCreateTableStatement(sqliteDb, tableName);
                    if (createStatement) {
                        // Clean up the CREATE TABLE statement (remove SQLite-specific syntax if needed)
                        let cleanedStatement = createStatement;
                        // Replace IF NOT EXISTS to ensure it works
                        cleanedStatement = cleanedStatement.replace(/CREATE TABLE\s+/i, 'CREATE TABLE IF NOT EXISTS ');
                        await tursoClient.execute(cleanedStatement);
                        console.log(`   ✅ Table created`);
                    } else {
                        console.log(`   ⚠️  Could not get CREATE TABLE statement, skipping...`);
                        continue;
                    }
                }
            } catch (error) {
                console.log(`   ⚠️  Error checking/creating table: ${error.message}`);
                // Try to continue anyway
            }

            // Get table schema
            const schema = await getTableSchema(sqliteDb, tableName);
            const columns = getColumnNames(schema);

            // Get all data from table
            const rows = await getTableData(sqliteDb, tableName);
            console.log(`   Found ${rows.length} rows`);

            if (rows.length === 0) {
                console.log(`   ⏭️  Skipping (empty table)\n`);
                continue;
            }

            // Insert data in batches for better performance
            const batchSize = 100;
            let inserted = 0;

            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = rows.slice(i, i + batchSize);
                const statements = batch.map(row => {
                    const values = columns.map(col => row[col] !== null ? row[col] : null);
                    // Use INSERT OR REPLACE to handle existing records (works for primary key)
                    // For unique constraints like barcode, we'll handle separately
                    return {
                        sql: buildInsertStatement(tableName, columns, true),
                        args: values
                    };
                });

                try {
                    // Use batch API for better performance
                    await tursoClient.batch(statements, 'write');
                    inserted += batch.length;
                    process.stdout.write(`   Progress: ${inserted}/${rows.length} rows\r`);
                } catch (error) {
                    console.error(`\n   ❌ Error inserting batch: ${error.message}`);
                    // Try inserting one by one to identify and handle problematic rows
                    for (const stmt of statements) {
                        try {
                            await tursoClient.execute(stmt.sql, stmt.args);
                            inserted++;
                        } catch (singleError) {
                            // Handle different types of errors
                            if (singleError.message.includes('FOREIGN KEY')) {
                                // Foreign key constraint - referenced record doesn't exist
                                if (tableName === 'sale_items') {
                                    // Find which foreign key is failing
                                    const saleIdIndex = columns.indexOf('sale_id');
                                    const productIdIndex = columns.indexOf('product_id');
                                    const saleId = saleIdIndex >= 0 ? stmt.args[saleIdIndex] : null;
                                    const productId = productIdIndex >= 0 ? stmt.args[productIdIndex] : null;
                                    
                                    // Check if referenced records exist
                                    let saleExists = false;
                                    let productExists = false;
                                    
                                    if (saleId !== null) {
                                        try {
                                            const saleCheck = await tursoClient.execute(`SELECT id FROM sales WHERE id = ?`, [saleId]);
                                            saleExists = saleCheck.rows.length > 0;
                                        } catch (e) {}
                                    }
                                    
                                    if (productId !== null) {
                                        try {
                                            const productCheck = await tursoClient.execute(`SELECT id FROM products WHERE id = ?`, [productId]);
                                            productExists = productCheck.rows.length > 0;
                                        } catch (e) {}
                                    }
                                    
                                    if (!saleExists || !productExists) {
                                        skippedRecords.foreignKey++;
                                        console.error(`   ⚠️  Skipping sale_item: sale_id=${saleId} (exists: ${saleExists}), product_id=${productId} (exists: ${productExists})`);
                                    } else {
                                        // Both exist, but still failed - might be a different issue
                                        skippedRecords.other++;
                                        console.error(`   ⚠️  Foreign key error despite records existing: ${singleError.message}`);
                                    }
                                } else {
                                    skippedRecords.foreignKey++;
                                    console.error(`   ⚠️  Foreign key constraint failed: ${singleError.message}`);
                                }
                            } else if (singleError.message.includes('UNIQUE constraint failed')) {
                                // Unique constraint on non-primary key (e.g., barcode, username)
                                // Try INSERT OR IGNORE to skip duplicates
                                try {
                                    const ignoreSql = stmt.sql.replace('INSERT OR REPLACE', 'INSERT OR IGNORE');
                                    await tursoClient.execute(ignoreSql, stmt.args);
                                    inserted++;
                                    skippedRecords.unique++;
                                    // Silently skip - it's a duplicate
                                } catch (ignoreError) {
                                    // If IGNORE also fails, try to update existing record
                                    if (tableName === 'products' && columns.includes('barcode')) {
                                        const barcodeIndex = columns.indexOf('barcode');
                                        const barcode = stmt.args[barcodeIndex];
                                        // Try to update existing product with same barcode
                                        try {
                                            const updateCols = columns.filter(c => c !== 'id' && c !== 'barcode');
                                            const updateValues = updateCols.map(col => {
                                                const idx = columns.indexOf(col);
                                                return stmt.args[idx];
                                            });
                                            const updateSet = updateCols.map(col => `${col} = ?`).join(', ');
                                            const updateSql = `UPDATE ${tableName} SET ${updateSet} WHERE barcode = ?`;
                                            await tursoClient.execute(updateSql, [...updateValues, barcode]);
                                            inserted++;
                                        } catch (updateError) {
                                            skippedRecords.unique++;
                                            console.error(`   ❌ Could not update duplicate barcode=${barcode}: ${updateError.message}`);
                                        }
                                    } else {
                                        skippedRecords.unique++;
                                        console.error(`   ⚠️  UNIQUE constraint: ${singleError.message}`);
                                    }
                                }
                            } else {
                                skippedRecords.other++;
                                console.error(`   ❌ Failed to insert row: ${singleError.message}`);
                                console.error(`   SQL: ${stmt.sql}`);
                            }
                        }
                    }
                }
            }

            console.log(`   ✅ Migrated ${inserted}/${rows.length} rows\n`);
            totalRowsMigrated += inserted;
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✨ Migration completed!`);
        console.log(`📊 Total rows migrated: ${totalRowsMigrated}`);
        const totalSkipped = skippedRecords.foreignKey + skippedRecords.unique + skippedRecords.other;
        if (totalSkipped > 0) {
            console.log(`⚠️  Skipped records:`);
            if (skippedRecords.foreignKey > 0) console.log(`   - Foreign key conflicts: ${skippedRecords.foreignKey}`);
            if (skippedRecords.unique > 0) console.log(`   - Unique constraint conflicts: ${skippedRecords.unique}`);
            if (skippedRecords.other > 0) console.log(`   - Other errors: ${skippedRecords.other}`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Verify migration
        console.log('🔍 Verifying migration...\n');
        for (const tableName of finalTableOrder) {
            try {
                const sqliteCount = await promisify(sqliteDb, 'get', `SELECT COUNT(*) as count FROM ${tableName}`);
                const tursoResult = await tursoClient.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
                const tursoCount = tursoResult.rows[0][0];

                const match = sqliteCount.count === tursoCount;
                const status = match ? '✅' : '❌';
                console.log(`   ${status} ${tableName}: SQLite=${sqliteCount.count}, Turso=${tursoCount}`);
            } catch (error) {
                console.log(`   ⚠️  ${tableName}: Could not verify (${error.message})`);
            }
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    } finally {
        // Close connections
        sqliteDb.close((err) => {
            if (err) console.error('Error closing SQLite:', err);
        });
        tursoClient.close();
    }
}

// Main execution
if (require.main === module) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Get backup file path from command line or prompt
    const backupFile = process.argv[2];

    if (backupFile) {
        // Use provided file path
        const backupPath = path.isAbsolute(backupFile) 
            ? backupFile 
            : path.join(__dirname, '../../backups', backupFile);
        
        migrateToTurso(backupPath)
            .then(() => {
                console.log('\n✅ Migration script completed');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n❌ Migration script failed:', error);
                process.exit(1);
            });
    } else {
        // List available backups and let user choose
        const backupsDir = path.join(__dirname, '../../backups');
        const backupFiles = fs.readdirSync(backupsDir)
            .filter(file => file.endsWith('.db'))
            .sort()
            .reverse(); // Most recent first

        if (backupFiles.length === 0) {
            console.error('❌ No backup files found in backups directory');
            process.exit(1);
        }

        console.log('📋 Available backup files:\n');
        backupFiles.forEach((file, index) => {
            const filePath = path.join(backupsDir, file);
            const stats = fs.statSync(filePath);
            console.log(`   ${index + 1}. ${file}`);
            console.log(`      Size: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`      Modified: ${stats.mtime.toISOString()}\n`);
        });

        rl.question('Enter the number of the backup file to migrate (or path to backup file): ', (answer) => {
            rl.close();
            
            let backupPath;
            const num = parseInt(answer);
            if (!isNaN(num) && num > 0 && num <= backupFiles.length) {
                backupPath = path.join(backupsDir, backupFiles[num - 1]);
            } else if (fs.existsSync(answer)) {
                backupPath = answer;
            } else {
                console.error('❌ Invalid selection');
                process.exit(1);
            }

            migrateToTurso(backupPath)
                .then(() => {
                    console.log('\n✅ Migration script completed');
                    process.exit(0);
                })
                .catch((error) => {
                    console.error('\n❌ Migration script failed:', error);
                    process.exit(1);
                });
        });
    }
}

module.exports = { migrateToTurso };

