# 🏁 Auto Parts Store POS System

A modern, professional Point of Sale system specifically designed for auto parts stores and tire shops. Built with React frontend, Node.js backend, and SQLite database. Features comprehensive inventory management, sales tracking, user management, and automated reporting.

## 🛠️ Languages & Technology Stack

### Frontend Technologies
- **JavaScript (ES6+)** - Modern JavaScript with latest features
- **React 18** - Component-based UI framework with hooks
- **HTML5** - Semantic markup and modern web standards
- **CSS3** - Advanced styling with custom properties
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

### Backend Technologies
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast, unopinionated web framework
- **JavaScript (ES6+)** - Server-side JavaScript with async/await
- **SQLite3** - Lightweight, serverless database engine
- **JWT** - JSON Web Tokens for secure authentication

### Development Tools & Libraries
- **npm** - Package manager and build tools
- **Axios** - Promise-based HTTP client
- **Lucide React** - Beautiful, customizable SVG icons
- **Recharts** - Composable charting library for React
- **React Hot Toast** - Elegant notification system
- **Node-cron** - Task scheduler for automated backups
- **FS-extra** - Enhanced file system utilities

### Database & Storage
- **SQLite** - Embedded SQL database engine
- **JSON** - Data interchange format for API responses
- **File System** - Local file storage for backups and assets

### Development Environment
- **VS Code** - Recommended code editor
- **Git** - Version control system
- **Chrome DevTools** - Browser debugging tools
- **Postman** - API testing and development

## ✨ Features

### 🎯 **Modern User Interface**
- **Professional Design**: Modern gradient-based UI with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Theme Sidebar**: Sleek navigation with gradient accents
- **Real-time Updates**: Live data synchronization across all components

### 👨‍💼 **Admin Dashboard**
- **📊 Analytics Dashboard**: Real-time sales metrics and performance charts
- **📦 Product Management**: Complete inventory control with SKU, brand, and size tracking
- **👥 User Management**: Create and manage cashier accounts with role-based permissions
- **📈 Sales Reports**: Comprehensive reporting with daily, weekly, monthly, and yearly views
- **⚙️ System Settings**: Configure tax rates, discounts, and company information
- **💾 Backup Management**: Automated and manual database backup system
- **📤 Data Export**: Export reports and data in multiple formats

### 🛒 **Cashier Interface**
- **🔍 Product Scanner**: Barcode scanning with keyboard emulation support
- **🛍️ Shopping Cart**: Intuitive cart management with quantity controls
- **💳 Payment Processing**: Support for cash, card, and mixed payments
- **🧾 Receipt Printing**: Professional receipt generation with company branding
- **📋 Transaction History**: View and manage sales transactions
- **🔐 Secure Authentication**: Role-based access control

### 🏪 **Auto Parts Specific Features**
- **🚗 Product Categories**: Tires, oil & fluids, auto parts, brake pads, car care
- **🏷️ SKU Management**: Unique product identification with barcode support
- **📏 Size Tracking**: Tire sizes, fluid types, and part specifications
- **🏭 Brand Management**: Support for major automotive brands (Michelin, Mobil 1, Castrol, etc.)
- **📊 Stock Alerts**: Low inventory notifications and reorder management
- **💰 Cost Tracking**: Product cost and margin analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser
- USB barcode scanner (optional)

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd go-tire-pos-system
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run install-all
   
   # Or install separately
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000

## 🔑 Default Login Credentials

- **Admin**: `admin` / `admin123`
- **Cashier**: `cashier` / `cashier123`

> ⚠️ **Important**: Change these credentials in production!

## 📁 Project Structure

```
go-tire-pos-system/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AdminDashboard.js
│   │   │   ├── CashierDashboard.js
│   │   │   └── Login.js
│   │   ├── contexts/        # React contexts
│   │   └── App.js
│   ├── public/              # Static assets
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── package.json
├── backend/                 # Node.js API server
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── sales.js
│   │   └── users.js
│   ├── database/            # Database files
│   │   ├── pos.db          # SQLite database
│   │   └── db.js           # Database connection
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── backups/                # Automatic database backups
└── package.json            # Root package configuration
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization and charts
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database
- **JWT** - Authentication tokens
- **Node-cron** - Scheduled tasks
- **FS-extra** - File system utilities

## 🗄️ Database Schema

### Core Tables
- **`users`** - User authentication and roles
- **`products`** - Inventory with SKU, brand, size tracking
- **`sales`** - Transaction records
- **`sale_items`** - Individual items in each sale
- **`settings`** - System configuration

### Product Fields
- `name` - Product name
- `sku` - Unique stock keeping unit
- `barcode` - Barcode for scanning
- `price` - Selling price
- `cost` - Product cost
- `stock` - Current inventory
- `min_stock` - Minimum stock level
- `category` - Product category
- `brand` - Product brand
- `tire_size` - Size/type specification
- `description` - Product description

## 🔧 Hardware Integration

### Barcode Scanner
- **Type**: USB barcode scanner with keyboard emulation
- **Output**: Barcode + Enter key
- **Supported**: Code 128, EAN-13, UPC-A
- **Setup**: Plug and play - no drivers required

### Receipt Printer (Optional)
- **Type**: Thermal printer with ESC/POS support
- **Connection**: USB or network
- **Paper**: 58mm or 80mm width
- **Features**: Automatic receipt generation

### Cash Drawer (Optional)
- **Connection**: Via receipt printer
- **Trigger**: Opens automatically after sale completion
- **Security**: Key-locked drawer

## 📊 Reporting & Analytics

### Sales Reports
- **Daily Reports**: Sales by day with trends
- **Weekly Reports**: Weekly performance analysis
- **Monthly Reports**: Monthly revenue and growth
- **Yearly Reports**: Annual performance overview

### Analytics Dashboard
- **Revenue Trends**: Visual sales performance
- **Top Products**: Best-selling items
- **Stock Alerts**: Low inventory notifications
- **Payment Methods**: Cash vs card analysis

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin and cashier permissions
- **Password Hashing**: Secure password storage
- **Session Management**: Automatic session timeout
- **Input Validation**: Server-side data validation

## 💾 Backup & Recovery

### Automatic Backups
- **Frequency**: Every 60 minutes
- **Location**: `/backups` folder
- **Retention**: 30 days
- **Format**: Timestamped SQLite files

### Manual Backups
- **Admin Panel**: One-click backup creation
- **Download**: Direct backup file download
- **Restore**: Backup restoration functionality

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && npm start
```

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API endpoints in the backend routes

## 🎯 Roadmap

- [ ] Multi-location support
- [ ] Advanced inventory forecasting
- [ ] Customer management system
- [ ] Mobile app for inventory management
- [ ] Integration with accounting software
- [ ] Advanced reporting with PDF export
- [ ] Barcode label printing
- [ ] Supplier management

---

**Built with ❤️ for auto parts stores and tire shops**