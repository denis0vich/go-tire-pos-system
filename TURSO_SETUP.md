# Turso Migration Guide

Your database has been migrated to support Turso (serverless SQLite). Here's how to set it up:

## What Changed

✅ **Database connection** now supports both:
- **Turso** (remote SQLite) - when environment variables are set
- **Local SQLite** - fallback for development

✅ **All SQL queries** remain the same (100% compatible)
✅ **No code changes needed** in routes or business logic

## Setup Steps

### 1. Get Your Turso Auth Token

You have the database URL: `libsql://pos-denis0vich.aws-ap-northeast-1.turso.io`

Now you need the auth token:

1. Go to [Turso Dashboard](https://turso.tech)
2. Navigate to your database
3. Click on "Tokens" or "Auth"
4. Create a new token (or use existing one)
5. Copy the token

### 2. Set Environment Variables in Render

In your Render dashboard, add these environment variables:

```
TURSO_DATABASE_URL=libsql://pos-denis0vich.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 3. Install Dependencies

The code will automatically use Turso when these environment variables are set.

Make sure `@libsql/client` is installed (already added to package.json).

### 4. Deploy

After setting the environment variables, redeploy your service. The database will automatically connect to Turso!

## How It Works

- **With Turso env vars set**: Connects to Turso (remote SQLite)
- **Without Turso env vars**: Falls back to local SQLite (for development)

## Testing Locally

To test with Turso locally:

1. Create a `.env` file in the `backend` directory:
```
TURSO_DATABASE_URL=libsql://pos-denis0vich.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

2. Install dotenv: `npm install dotenv`
3. Load it in server.js (or use a package that auto-loads .env)

Or just set the environment variables in your terminal before running.

## Benefits

✅ **Data persists** across redeploys on Render free plan
✅ **SQLite compatible** - all your queries work the same
✅ **Fast** - Turso is optimized for serverless
✅ **Free tier** available
✅ **Automatic backups** included

## Migrating SQLite Backup to Turso

If you have existing SQLite backup files and want to migrate the data to Turso, use the migration script:

### Prerequisites

1. Make sure you have `sqlite3` installed:
   ```bash
   npm install
   ```

2. Ensure your Turso credentials are set (either in environment variables or hardcoded in the script)

### Running the Migration

**Option 1: Interactive Mode (Recommended)**

Run the script without arguments to see a list of available backups and choose one:

```bash
cd backend
npm run migrate-to-turso
```

The script will:
- List all available backup files in the `backups/` directory
- Show file sizes and modification dates
- Let you select which backup to migrate

**Option 2: Direct File Path**

Provide the backup file path directly:

```bash
npm run migrate-to-turso pos_backup_2025-11-24T07-00-00-168Z.db
```

Or with a full path:

```bash
npm run migrate-to-turso "C:\path\to\backup.db"
```

### What the Migration Script Does

1. ✅ **Connects** to both SQLite backup and Turso database
2. ✅ **Reads** all tables and data from the SQLite backup
3. ✅ **Migrates** data in the correct order (respecting foreign key constraints)
4. ✅ **Verifies** the migration by comparing row counts
5. ✅ **Handles** errors gracefully and provides detailed progress

### Migration Process

The script migrates tables in this order:
1. `users` - No dependencies
2. `settings` - No dependencies  
3. `products` - No dependencies
4. `sales` - Depends on users
5. `sale_items` - Depends on sales and products

### Important Notes

⚠️ **Data Replacement**: The script will **DELETE existing data** in Turso tables before inserting. This ensures a clean migration.

⚠️ **Backup First**: Make sure you have a backup of your Turso database if it contains important data.

⚠️ **Table Structure**: The script assumes tables already exist in Turso. Run `npm run init-db` first if needed, or the migration will create tables automatically if they don't exist.

### Example Output

```
🚀 Starting migration from SQLite to Turso...

📂 Source: backups/pos_backup_2025-11-24T07-00-00-168Z.db
☁️  Destination: libsql://pos-denis0vich.aws-ap-northeast-1.turso.io

✅ Connected to both databases

📊 Found 5 tables: users, products, sales, sale_items, settings

📦 Migrating table: users
   Found 2 rows
   🗑️  Cleared existing data in Turso
   Progress: 2/2 rows
   ✅ Migrated 2/2 rows

📦 Migrating table: products
   Found 150 rows
   🗑️  Cleared existing data in Turso
   Progress: 150/150 rows
   ✅ Migrated 150/150 rows

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Migration completed successfully!
📊 Total rows migrated: 1250
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Verifying migration...

   ✅ users: SQLite=2, Turso=2
   ✅ products: SQLite=150, Turso=150
   ✅ sales: SQLite=500, Turso=500
   ...
```

### Troubleshooting Migration

**"Cannot open SQLite backup"**
- Check the file path is correct
- Ensure the backup file exists and is readable
- Verify the file is a valid SQLite database

**"Failed to connect to Turso"**
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
- Check your internet connection
- Ensure the Turso database exists

**"Table doesn't exist in Turso"**
- Run `npm run init-db` first to create tables
- Or ensure the table structure matches between SQLite and Turso

**"Foreign key constraint failed"**
- The script migrates in dependency order, but if you see this error:
  - Check that parent records exist (e.g., users exist before sales)
  - Verify foreign key relationships are correct

## Troubleshooting

### "Cannot connect to database"
- Check your `TURSO_DATABASE_URL` is correct
- Verify `TURSO_AUTH_TOKEN` is valid
- Make sure the database exists in Turso dashboard

### "Table doesn't exist"
- The initialization will create tables automatically
- Check server logs for initialization errors

### Still using local SQLite?
- Make sure environment variables are set in Render
- Restart the service after adding env vars

