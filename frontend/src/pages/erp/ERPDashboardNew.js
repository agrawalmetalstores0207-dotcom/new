import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Package, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ERPDashboardNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    receivables: 0,
    payables: 0,
    itemsCount: 0,
    customersCount: 0,
    suppliersCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [salesRes, purchasesRes, expensesRes, itemsRes, partiesRes, receivablesRes, payablesRes] = await Promise.all([
        axios.get(`${API}/erp/vouchers/sales`),
        axios.get(`${API}/erp/vouchers/purchase`),
        axios.get(`${API}/erp/vouchers/expense`),
        axios.get(`${API}/erp/items`),
        axios.get(`${API}/erp/parties`),
        axios.get(`${API}/erp/reports/outstanding/receivables`),
        axios.get(`${API}/erp/reports/outstanding/payables`)
      ]);

      const totalSales = salesRes.data.reduce((sum, v) => sum + v.total_amount, 0);
      const totalPurchases = purchasesRes.data.reduce((sum, v) => sum + v.total_amount, 0);
      const totalExpenses = expensesRes.data.reduce((sum, v) => sum + v.amount, 0);
      const receivables = receivablesRes.data.reduce((sum, r) => sum + r.outstanding, 0);
      const payables = payablesRes.data.reduce((sum, p) => sum + p.outstanding, 0);

      setStats({
        totalSales,
        totalPurchases,
        totalExpenses,
        receivables,
        payables,
        itemsCount: itemsRes.data.length,
        customersCount: partiesRes.data.filter(p => p.party_type === 'customer').length,
        suppliersCount: partiesRes.data.filter(p => p.party_type === 'supplier').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { title: 'Items & Inventory', path: '/erp/items', icon: Package, color: 'bg-blue-500' },
    { title: 'Parties', path: '/erp/parties', icon: Users, color: 'bg-green-500' },
    { title: 'Sales Invoice', path: '/erp/sales-vouchers', icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Purchase Bill', path: '/erp/purchase-vouchers', icon: TrendingDown, color: 'bg-orange-500' },
    { title: 'Expenses', path: '/erp/expense-vouchers', icon: DollarSign, color: 'bg-red-500' },
    { title: 'Reports', path: '/erp/reports-hub', icon: TrendingUp, color: 'bg-indigo-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">ERP Dashboard</h1>
            <p className="text-gray-600 mt-2">Complete accounting & inventory management</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-green-600">₹{stats.totalSales.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
                    <p className="text-2xl font-bold text-orange-600">₹{stats.totalPurchases.toFixed(2)}</p>
                  </div>
                  <TrendingDown className="w-10 h-10 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Receivables</p>
                    <p className="text-2xl font-bold text-blue-600">₹{stats.receivables.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payables</p>
                    <p className="text-2xl font-bold text-red-600">₹{stats.payables.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickLinks.map((link, index) => (
                <Link key={index} to={link.path}>
                  <Card className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full ${link.color} flex items-center justify-center mb-3`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold">{link.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Summary Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Inventory Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold">{stats.itemsCount}</span>
                  </div>
                  <Link to="/erp/items" className="text-sm text-[#8b4513] hover:underline">Manage Items →</Link>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Customers</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Customers:</span>
                    <span className="font-semibold">{stats.customersCount}</span>
                  </div>
                  <Link to="/erp/parties" className="text-sm text-[#8b4513] hover:underline">Manage Customers →</Link>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Suppliers</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Suppliers:</span>
                    <span className="font-semibold">{stats.suppliersCount}</span>
                  </div>
                  <Link to="/erp/parties" className="text-sm text-[#8b4513] hover:underline">Manage Suppliers →</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ERPDashboardNew;