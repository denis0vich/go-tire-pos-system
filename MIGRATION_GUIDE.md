# Production Database Migration Guide

## Problem
Your Render production server still has the old database schema. The migration needs to run on production.

## Option 1: Add Migration to Package.json (Recommended)

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "migrate": "node backend/database/migrate.js",
    "start": "node backend/database/migrate.js && node backend/server.js"
  }
}
```

This will run the migration automatically when your app starts on Render.

## Option 2: Run via Render Shell

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your service
3. Click "Shell" tab
4. Run: `node backend/database/migrate.js`

## Option 3: Push and Redeploy

1. Commit the migration script:
   ```bash
   git add backend/database/migrate.js
   git commit -m "Add database migration"
   git push
   ```

2. Modify `backend/server.js` to run migration on startup (add at the top):
   ```javascript
   // Run migrations
   const { exec } = require('child_process');
   exec('node backend/database/migrate.js', (error, stdout, stderr) => {
     if (error) {
       console.error('Migration error:', error);
       return;
     }
     console.log('Migration output:', stdout);
   });
   ```

3. Render will auto-deploy and run the migration

## Verification

After migration, check your logs for:
```
✅ Migration completed successfully!
```

Then test these features:
- Theme color selection
- Sales reports
- Customer creation
- Down payments
