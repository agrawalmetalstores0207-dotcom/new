import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Package, Users, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/dashboard`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
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
    <div className="min-h-screen" data-testid="admin-dashboard">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Admin Dashboard</h1>
            <Link to="/admin/products">
              <button className="btn-primary" data-testid="manage-products-button">
                Manage Products
              </button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card" data-testid="stat-orders">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold">{analytics?.total_orders || 0}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card" data-testid="stat-products">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Products</p>
                    <p className="text-3xl font-bold">{analytics?.total_products || 0}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card" data-testid="stat-customers">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                    <p className="text-3xl font-bold">{analytics?.total_customers || 0}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card" data-testid="stat-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{analytics?.total_revenue?.toFixed(2) || 0}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#8b4513] to-[#d4a574] rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-[#8b4513]" />
                <h2 className="text-2xl font-bold">AI Insights (Mocked)</h2>
              </div>
              <p className="text-gray-700 text-lg">{analytics?.ai_insights}</p>
              <div className="mt-4 p-4 bg-[#8b4513]/10 rounded-xl">
                <p className="font-semibold mb-2">Top Selling Category:</p>
                <p className="text-lg">{analytics?.top_selling_category?.toUpperCase()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/admin/products">
              <Card className="card cursor-pointer group" data-testid="quick-action-products">
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-[#8b4513] group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg">Manage Products</h3>
                  <p className="text-sm text-gray-600 mt-2">Add, edit, or remove products from catalog</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/erp">
              <Card className="card cursor-pointer group" data-testid="quick-action-erp">
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-[#8b4513] group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg">ERP & Accounting</h3>
                  <p className="text-sm text-gray-600 mt-2">Sales, Purchase, Inventory & Reports</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/marketing/designer">
              <Card className="card cursor-pointer group" data-testid="quick-action-marketing">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-[#8b4513] group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg">Marketing Designer</h3>
                  <p className="text-sm text-gray-600 mt-2">Create posters, banners and flyers</p>
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

export default AdminDashboard;
