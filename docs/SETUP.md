# POS System Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git (optional)

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Initialize Database

```bash
# From the backend directory
cd backend
npm run init-db
```

This will create the SQLite database with sample data and default users.

### 3. Start the Application

#### Development Mode (Recommended)
```bash
# From the root directory
npm run dev
```

This starts both backend and frontend servers concurrently.

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend server
cd ../backend
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Default Login Credentials

### Admin Account
- **Username**: admin
- **Password**: admin123
- **Permissions**: Full system access

### Cashier Account
- **Username**: cashier
- **Password**: cashier123
- **Permissions**: Sales operations only

## Hardware Setup

### Barcode Scanner
1. Connect USB barcode scanner to your computer
2. Most scanners work as keyboard emulation (no drivers needed)
3. Test by scanning into any text field - it should type the barcode + Enter

### Receipt Printer (Optional)
1. Connect thermal printer via USB or network
2. Install printer drivers if required
3. Configure printer in system settings
4. Test printing from the POS interface

### Cash Drawer (Optional)
1. Connect cash drawer to receipt printer (RJ11/RJ12 cable)
2. Drawer will open automatically after successful sales
3. Manual open option available in POS interface

## Configuration

### Store Settings
Access admin panel → Settings to configure:
- Store name and address
- Tax rates
- Currency
- Receipt templates
- Backup intervals

### User Management
Admins can:
- Create new cashier accounts
- Reset passwords
- Manage user permissions
- View user activity

## Backup System

### Automatic Backups
- Runs every hour by default
- Keeps 30 days of backups
- Stored in `/backups` folder

### Manual Backups
- Access admin panel → Backup
- Click "Create Backup"
- Download or restore as needed

## Troubleshooting

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
cd backend
rm database/pos.db
npm run init-db
```

### Port Conflicts
Edit `package.json` scripts to change ports:
- Frontend: PORT=3001 react-scripts start
- Backend: PORT=5001 node server.js

### Permission Errors
Ensure the application has write permissions to:
- `/backend/database/` folder
- `/backups/` folder

## Security Notes

### Production Deployment
1. Change default passwords immediately
2. Use environment variables for sensitive data
3. Enable HTTPS
4. Regular database backups
5. Update dependencies regularly

### Network Security
- Run on isolated network if possible
- Use firewall rules to restrict access
- Monitor for unusual activity

## Support

### Common Issues
1. **Barcode scanner not working**: Check USB connection and test in text editor
2. **Receipt printer not printing**: Verify driver installation and printer status
3. **Database locked**: Restart the application
4. **Login fails**: Check username/password and database connection

### Log Files
- Backend logs: Console output
- Database: SQLite error messages
- Frontend: Browser developer console

For additional support, check the README.md file or contact your system administrator.
