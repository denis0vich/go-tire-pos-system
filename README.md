# POS System - Point of Sale Application

A comprehensive Point of Sale system built with React frontend, Node.js backend, and SQLite database. Features barcode scanning, user management, inventory control, and automated backups.

## Features

### Admin Features
- ✅ Product management (add/edit/delete with barcode support)
- ✅ User management (create cashier accounts, reset passwords)
- ✅ Sales reports (daily, weekly, monthly)
- ✅ Settings configuration (tax rates, discounts, company info)
- ✅ Data export (CSV/PDF)
- ✅ Database backup management

### Cashier Features
- ✅ Secure login system
- ✅ Barcode scanning for quick product lookup
- ✅ Shopping cart management
- ✅ Multiple payment methods (cash, card)
- ✅ Receipt printing
- ✅ Transaction history (own transactions only)

### System Features
- ✅ SQLite database with automatic backups
- ✅ Role-based access control
- ✅ Real-time inventory updates
- ✅ Barcode scanner integration (keyboard emulation)
- ✅ Receipt printer support (ESC/POS)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Login Credentials

- **Admin**: admin / admin123
- **Cashier**: cashier / cashier123

## Project Structure

```
pos-site/
├── frontend/          # React application
├── backend/           # Node.js API server
├── database/          # SQLite database and migrations
├── backups/           # Automatic database backups
├── docs/              # Documentation
└── package.json       # Root package configuration
```

## Hardware Requirements

### Barcode Scanner
- USB barcode scanner with keyboard emulation
- Scanner should output barcode + Enter key
- Tested with standard Code 128/EAN scanners

### Receipt Printer (Optional)
- Thermal printer with ESC/POS support
- USB or network connection
- 58mm or 80mm paper width

### Cash Drawer (Optional)
- Connects via receipt printer
- Opens automatically after sale completion

## Database Schema

- **Users**: Authentication and role management
- **Products**: Inventory with barcode support
- **Sales**: Transaction records
- **SaleItems**: Individual items in each sale
- **Settings**: System configuration

## Backup System

- Automatic hourly backups to `/backups` folder
- Timestamped backup files
- Retention policy: 30 days
- Manual backup option in admin panel

## Development

### Backend API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/barcode/:code` - Find by barcode
- `POST /api/sales` - Create sale
- `GET /api/reports` - Sales reports

### Frontend Components
- Login page with role-based routing
- Admin dashboard with full management
- Cashier interface with barcode scanning
- Receipt printing and transaction history

## License

MIT License - see LICENSE file for details
