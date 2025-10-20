import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, TrendingUp, Package } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ERPReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salesReport, setSalesReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const [sales, purchase, stock] = await Promise.all([
        axios.get(`${API}/erp/reports/sales-summary`),
        axios.get(`${API}/erp/reports/purchase-summary`),
        axios.get(`${API}/erp/reports/stock-summary`)
      ]);
      setSalesReport(sales.data);
      setPurchaseReport(purchase.data);
      setStockReport(stock.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
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
    <div className="min-h-screen" data-testid="erp-reports-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 gradient-text">Reports & Analytics</h1>
          <p className="text-gray-600 text-lg mb-8">Business insights and performance metrics</p>

          {/* Reports Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Sales Report</h3>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-bold">₹{salesReport?.total_sales || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Collected:</span>
                    <span className="font-bold">₹{salesReport?.total_tax || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-bold text-orange-600">₹{salesReport?.pending_amount || 0}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Invoices:</span>
                    <span className="font-bold">{salesReport?.number_of_invoices || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Purchase Report</h3>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Purchases:</span>
                    <span className="font-bold">₹{purchaseReport?.total_purchases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Paid:</span>
                    <span className="font-bold">₹{purchaseReport?.total_tax || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-bold text-orange-600">₹{purchaseReport?.pending_amount || 0}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Bills:</span>
                    <span className="font-bold">{purchaseReport?.number_of_bills || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Stock Report</h3>
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-bold">{stockReport?.total_items || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock Value:</span>
                    <span className="font-bold">₹{stockReport?.total_stock_value?.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low Stock:</span>
                    <span className="font-bold text-red-600">{stockReport?.low_stock_items || 0}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Out of Stock:</span>
                    <span className="font-bold text-red-600">{stockReport?.out_of_stock || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {stockReport?.low_stock_products?.length > 0 && (
            <Card className="card border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 text-orange-800">⚠️ Low Stock Alert</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stockReport.low_stock_products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-lg">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-orange-600">Stock: {product.stock} units</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ERPReports;