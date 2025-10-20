import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ERPDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salesSummary, setSalesSummary] = useState(null);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [stockSummary, setStockSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchSummaries();
  }, [user]);

  const fetchSummaries = async () => {
    try {
      const [sales, purchase, stock] = await Promise.all([
        axios.get(`${API}/erp/reports/sales-summary`),
        axios.get(`${API}/erp/reports/purchase-summary`),
        axios.get(`${API}/erp/reports/stock-summary`)
      ]);
      setSalesSummary(sales.data);
      setPurchaseSummary(purchase.data);
      setStockSummary(stock.data);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="erp-dashboard">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 gradient-text">ERP Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Sales</h3>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#8b4513] mb-2">
                  ₹{salesSummary?.total_sales?.toFixed(2) || 0}
                </p>
                <p className="text-sm text-gray-600">{salesSummary?.number_of_invoices || 0} invoices</p>
                <p className="text-sm text-orange-600 mt-2">Pending: ₹{salesSummary?.pending_amount?.toFixed(2) || 0}</p>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Purchases</h3>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#8b4513] mb-2">
                  ₹{purchaseSummary?.total_purchases?.toFixed(2) || 0}
                </p>
                <p className="text-sm text-gray-600">{purchaseSummary?.number_of_bills || 0} bills</p>
                <p className="text-sm text-orange-600 mt-2">Pending: ₹{purchaseSummary?.pending_amount?.toFixed(2) || 0}</p>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Inventory</h3>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#8b4513] mb-2">
                  ₹{stockSummary?.total_stock_value?.toFixed(2) || 0}
                </p>
                <p className="text-sm text-gray-600">{stockSummary?.total_items || 0} items</p>
                <p className="text-sm text-red-600 mt-2">{stockSummary?.low_stock_items || 0} low stock items</p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {stockSummary?.low_stock_products?.length > 0 && (
            <Card className="card mb-8 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-lg text-orange-800">Low Stock Alert</h3>
                </div>
                <div className="space-y-2">
                  {stockSummary.low_stock_products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="text-sm">{product.name}</span>
                      <span className="text-sm font-semibold text-orange-600">Stock: {product.stock}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/erp/sales">
              <Card className="card cursor-pointer hover:shadow-xl transition-all" data-testid="sales-link">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Sales Management</h3>
                  <p className="text-sm text-gray-600">Create invoices, track payments</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/erp/purchases">
              <Card className="card cursor-pointer hover:shadow-xl transition-all" data-testid="purchase-link">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingDown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Purchase Management</h3>
                  <p className="text-sm text-gray-600">Record purchases, manage suppliers</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/erp/reports">
              <Card className="card cursor-pointer hover:shadow-xl transition-all" data-testid="reports-link">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Reports & Analytics</h3>
                  <p className="text-sm text-gray-600">View detailed business reports</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ERPDashboard;
