import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  ShoppingCart, 
  Scan, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign,
  Receipt,
  LogOut,
  History,
  Search,
} from 'lucide-react';

const CashierDashboard = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReceived, setPaymentReceived] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [adminOverride, setAdminOverride] = useState(false);
  const [overrideDiscount, setOverrideDiscount] = useState(0);
  const [manualPrice, setManualPrice] = useState('');
  const barcodeInputRef = useRef(null);

  // Admin override barcode (secret)
  const ADMIN_OVERRIDE_BARCODE = 'ADMIN_OVERRIDE_2024';

  useEffect(() => {
    fetchProducts();
    // Focus barcode input on component mount
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const response = await axios.get('/api/sales');
      setSalesHistory(response.data.sales || []);
    } catch (error) {
      toast.error('Failed to load sales history');
    }
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    // Check for admin override barcode
    if (barcode === ADMIN_OVERRIDE_BARCODE) {
      if (user.role === 'admin') {
        setAdminOverride(true);
        toast.success('Admin override activated');
      } else {
        toast.error('Access denied');
      }
      setBarcode('');
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
      return;
    }

    try {
      const response = await axios.get(`/api/products/barcode/${barcode}`);
      const product = response.data;
      
      if (product.stock <= 0) {
        toast.error('Product is out of stock');
        return;
      }

      addToCart(product);
      setBarcode('');
      
      // Refocus barcode input
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Product not found - Use search to find manually');
        setShowProductSearch(true);
      } else {
        toast.error('Error scanning barcode');
      }
    }
  };

  const addToCart = (product, customPrice = null) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    // Apply custom price if admin override is active
    const finalPrice = customPrice || (adminOverride && manualPrice ? parseFloat(manualPrice) : product.price);
    const productWithPrice = { ...product, price: finalPrice };
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Cannot add more items than available in stock');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, price: finalPrice }
          : item
      ));
    } else {
      setCart([...cart, { ...productWithPrice, quantity: 1 }]);
    }
    
    if (adminOverride && (customPrice || manualPrice)) {
      toast.success(`Added ${product.name} with override price $${finalPrice}`);
    } else {
      toast.success(`Added ${product.name} to cart`);
    }
    
    // Reset manual price after adding
    setManualPrice('');
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      toast.error('Cannot add more items than available in stock');
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = adminOverride ? (subtotal * (overrideDiscount / 100)) : 0;
    const afterDiscount = subtotal - discountAmount;
    const taxRate = 0.1; // 10% tax - should come from settings
    const tax = afterDiscount * taxRate;
    return {
      subtotal: subtotal.toFixed(2),
      discount: discountAmount.toFixed(2),
      tax: tax.toFixed(2),
      total: (afterDiscount + tax).toFixed(2)
    };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const totals = calculateTotal();
    const paymentAmount = parseFloat(paymentReceived) || 0;

    if (paymentMethod === 'cash' && paymentAmount < parseFloat(totals.total)) {
      toast.error('Insufficient payment amount');
      return;
    }

    setLoading(true);

    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        payment_received: paymentAmount,
        discount_amount: 0
      };

      const response = await axios.post('/api/sales', saleData);
      
      setLastSale(response.data);
      setShowReceipt(true);
      setShowCheckout(false);
      clearCart();
      setPaymentReceived('');
      
      toast.success('Sale completed successfully!');
      
      // Refresh products to update stock
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.error || 'Checkout failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.tire_size?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotal();

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏁 Auto Parts Store POS</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={logout} className="btn btn-secondary">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pos-layout">
        {/* Main Scanning Section */}
        <div className="pos-main-section">
          {/* Primary Barcode Scanner */}
          <div className="pos-scanner-card">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">🔍 Product Scanner</h2>
              <p className="text-lg opacity-90">Scan product barcode or search manually</p>
            </div>
            
            <form onSubmit={handleBarcodeSubmit} className="space-y-6">
              <div className="barcode-input">
                <Scan className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white opacity-80 w-5 h-5" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan product barcode or enter manually..."
                  className="pos-scanner-input"
                />
              </div>
              
              <button type="submit" className="pos-action-btn w-full bg-white text-purple-700 font-semibold text-lg min-h-16">
                <Plus className="w-6 h-6" />
                Add to Cart
              </button>
            </form>
            
            {adminOverride && (
              <div className="pos-override-panel">
                <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                  🔓 Admin Override Active
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Custom Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="Enter price"
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Discount %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={overrideDiscount}
                      onChange={(e) => setOverrideDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAdminOverride(false);
                    setOverrideDiscount(0);
                    setManualPrice('');
                  }}
                  className="mt-3 px-4 py-2 bg-white border border-orange-300 rounded-lg text-orange-800 font-medium hover:bg-orange-50 transition-colors"
                >
                  Disable Override
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="pos-action-grid">
            <button
              onClick={() => setShowProductSearch(true)}
              className="pos-action-btn"
            >
              <Search className="w-8 h-8 text-blue-500" />
              <span className="font-semibold text-gray-700">Search Products</span>
            </button>
            
            <button
              onClick={() => {
                setShowHistory(true);
                fetchSalesHistory();
              }}
              className="pos-action-btn"
            >
              <History className="w-8 h-8 text-green-500" />
              <span className="font-semibold text-gray-700">Sales History</span>
            </button>
            
            <button
              onClick={clearCart}
              className="pos-action-btn"
              disabled={cart.length === 0}
            >
              <Trash2 className="w-8 h-8 text-red-500" />
              <span className="font-semibold text-gray-700">Clear Cart</span>
            </button>
            
            <button
              onClick={() => {
                if (barcodeInputRef.current) {
                  barcodeInputRef.current.focus();
                }
              }}
              className="pos-action-btn"
            >
              <Scan className="w-8 h-8 text-purple-500" />
              <span className="font-semibold text-gray-700">Focus Scanner</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="pos-instructions">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              💡 Quick Guide
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium mb-1">🔍 Product Scanning:</p>
                <p>Use barcode scanner or type manually</p>
              </div>
              <div>
                <p className="font-medium mb-1">🔍 Product Search:</p>
                <p>Find products when barcode fails</p>
              </div>
              <div>
                <p className="font-medium mb-1">🔓 Admin Override:</p>
                <p>Admin barcode: ADMIN_OVERRIDE_2024</p>
              </div>
              <div>
                <p className="font-medium mb-1">⚡ Quick Entry:</p>
                <p>Scanner stays focused for rapid entry</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Panel */}
        <div className="cart-panel">
          <div className="cart-header">
            <h3 className="cart-title">
              <ShoppingCart className="w-6 h-6" />
              Shopping Cart ({cart.length})
            </h3>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Shopping cart is empty</p>
                <p className="text-gray-400 text-sm">Scan products to get started</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">${item.price} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="cart-btn"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="cart-btn"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="cart-btn danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="cart-summary">
                <div className="flex justify-between mb-3 text-lg">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">${totals.subtotal}</span>
                </div>
                {adminOverride && parseFloat(totals.discount) > 0 && (
                  <div className="flex justify-between mb-3 text-lg text-orange-600">
                    <span className="font-medium">Discount ({overrideDiscount}%):</span>
                    <span className="font-semibold">-${totals.discount}</span>
                  </div>
                )}
                <div className="flex justify-between mb-3 text-lg">
                  <span className="font-medium">Tax (10%):</span>
                  <span className="font-semibold">${totals.tax}</span>
                </div>
                <div className="flex justify-between cart-total">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold">${totals.total}</span>
                </div>
                {adminOverride && (
                  <div className="text-center mt-3 px-3 py-2 bg-yellow-100 rounded-lg">
                    <span className="text-sm font-medium text-yellow-800">🔓 Admin Override Active</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="checkout-btn"
              >
                <CreditCard className="w-5 h-5" />
                Checkout Now
              </button>
            </>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Checkout</h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="bg-gray-50 p-3 rounded">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-medium">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>${totals.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="digital">Digital Payment</option>
                </select>
              </div>

              {paymentMethod === 'cash' && (
                <div className="form-group">
                  <label className="form-label">Amount Received</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentReceived}
                    onChange={(e) => setPaymentReceived(e.target.value)}
                    placeholder="Enter amount received"
                    className="form-input"
                  />
                  {paymentReceived && (
                    <p className="text-sm text-gray-600 mt-1">
                      Change: ${Math.max(0, parseFloat(paymentReceived) - parseFloat(totals.total)).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn btn-success flex-1"
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Complete Sale
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Receipt</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="receipt">
              <div className="receipt-header">
                <h3>🏁 Premium Auto Parts Center</h3>
                <p>123 Auto Way, Auto City, AC 12345</p>
                <p>Tel: (555) AUTO-123</p>
                <hr />
                <p>Sale ID: {lastSale.sale.id}</p>
                <p>Date: {new Date(lastSale.sale.created_at).toLocaleString()}</p>
                <p>Cashier: {lastSale.sale.cashier_name}</p>
              </div>

              <div className="receipt-items">
                {lastSale.items.map(item => (
                  <div key={item.id} className="receipt-item">
                    <div>
                      <div>{item.product_name}</div>
                      <div>{item.quantity} x ${parseFloat(item.unit_price).toFixed(2)}</div>
                    </div>
                    <div>${parseFloat(item.total_price).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="receipt-total">
                <div className="receipt-item">
                  <span>Subtotal:</span>
                  <span>${parseFloat(lastSale.receipt_data.subtotal).toFixed(2)}</span>
                </div>
                <div className="receipt-item">
                  <span>Tax:</span>
                  <span>${parseFloat(lastSale.receipt_data.tax_amount).toFixed(2)}</span>
                </div>
                <div className="receipt-item">
                  <span><strong>Total:</strong></span>
                  <span><strong>${parseFloat(lastSale.receipt_data.total_amount).toFixed(2)}</strong></span>
                </div>
                <div className="receipt-item">
                  <span>Payment ({lastSale.sale.payment_method}):</span>
                  <span>${parseFloat(lastSale.receipt_data.payment_received || lastSale.receipt_data.total_amount).toFixed(2)}</span>
                </div>
                <div className="receipt-item">
                  <span>Change:</span>
                  <span>${parseFloat(lastSale.receipt_data.change_given || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-4">
                <p>Thank you for choosing Premium Auto Parts Center!</p>
                <p>Drive safely! 🚗</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="btn btn-primary flex-1"
              >
                <Receipt className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="btn btn-outline flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Search Products</h3>
              <button
                onClick={() => setShowProductSearch(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product name, brand, or barcode..."
                  className="form-input pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No products found</p>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                        product.stock <= 0 ? 'opacity-50' : ''
                      }`}
                      onClick={() => {
                        if (product.stock > 0) {
                          addToCart(product);
                          setShowProductSearch(false);
                          setSearchTerm('');
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">
                            {product.brand} • {product.sku || product.tire_size} • {product.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${product.price}</p>
                          <p className="text-xs text-gray-500">
                            Stock: {product.stock}
                            {product.stock <= 0 && <span className="text-red-500 ml-1">(Out)</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sales History Modal */}
      {showHistory && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Sales History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.map(sale => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>
                      <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                      <td>${sale.total_amount}</td>
                      <td className="capitalize">{sale.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default CashierDashboard;
