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
import AdminSettings from '@/pages/admin/Settings';
import ERPDashboardNew from '@/pages/erp/ERPDashboardNew';
import ItemsManagement from '@/pages/erp/ItemsManagement';
import PartiesManagement from '@/pages/erp/PartiesManagement';
import SalesVouchers from '@/pages/erp/SalesVouchers';
import PurchaseVouchers from '@/pages/erp/PurchaseVouchers';
import ExpenseVouchers from '@/pages/erp/ExpenseVouchers';
import ReportsHub from '@/pages/erp/ReportsHub';
import MarketingDesigner from '@/pages/marketing/Designer';
import MarketingDesignerPro from '@/pages/marketing/DesignerPro';
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
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/erp" element={<ERPDashboardNew />} />
              <Route path="/erp/items" element={<ItemsManagement />} />
              <Route path="/erp/parties" element={<PartiesManagement />} />
              <Route path="/erp/sales-vouchers" element={<SalesVouchers />} />
              <Route path="/erp/purchase-vouchers" element={<PurchaseVouchers />} />
              <Route path="/erp/expense-vouchers" element={<ExpenseVouchers />} />
              <Route path="/erp/reports-hub" element={<ReportsHub />} />
              <Route path="/marketing/designer" element={<MarketingDesigner />} />
              <Route path="/marketing/designer-pro" element={<MarketingDesignerPro />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
