import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@/App.css';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProducts from '@/pages/admin/Products';
import ERPDashboard from '@/pages/erp/Dashboard';
import ERPSales from '@/pages/erp/Sales';
import ERPPurchases from '@/pages/erp/Purchases';
import ERPReports from '@/pages/erp/Reports';
import MarketingDesigner from '@/pages/marketing/Designer';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/erp" element={<ERPDashboard />} />
              <Route path="/erp/sales" element={<ERPDashboard />} />
              <Route path="/erp/purchases" element={<ERPDashboard />} />
              <Route path="/erp/reports" element={<ERPDashboard />} />
              <Route path="/marketing/designer" element={<MarketingDesigner />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
