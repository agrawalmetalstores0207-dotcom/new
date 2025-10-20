import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { FileText, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ReportsHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('outstanding');
  const [receivables, setReceivables] = useState([]);
  const [payables, setPayables] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [stockReport, setStockReport] = useState([]);
  const [dateRange, setDateRange] = useState({
    from_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchOutstandingReports();
  }, [user]);

  const fetchOutstandingReports = async () => {
    setLoading(true);
    try {
      const [receivablesRes, payablesRes] = await Promise.all([
        axios.get(`${API}/erp/reports/outstanding/receivables`),
        axios.get(`${API}/erp/reports/outstanding/payables`)
      ]);
      setReceivables(receivablesRes.data);
      setPayables(payablesRes.data);
    } catch (error) {
      console.error('Error fetching outstanding reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitLoss = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/erp/reports/profit-loss?from_date=${dateRange.from_date}&to_date=${dateRange.to_date}`);
      setProfitLoss(response.data);
    } catch (error) {
      console.error('Error fetching P&L:', error);
      toast.error('Failed to load P&L statement');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/erp/reports/stock`);
      setStockReport(response.data);
    } catch (error) {
      console.error('Error fetching stock report:', error);
      toast.error('Failed to load stock report');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'profitloss' && !profitLoss) {
      fetchProfitLoss();
    } else if (value === 'stock' && stockReport.length === 0) {
      fetchStockReport();
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Reports Center</h1>
            <p className="text-gray-600 mt-2">Business intelligence and analytics</p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
              <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
              <TabsTrigger value="profitloss">Profit & Loss</TabsTrigger>
              <TabsTrigger value="stock">Stock Report</TabsTrigger>
            </TabsList>

            {/* Outstanding Reports */}
            <TabsContent value="outstanding">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Receivables */}
                <Card className="card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl">Receivables (To Receive)</h3>
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    {receivables.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No outstanding receivables</p>
                    ) : (
                      <div className="space-y-3">
                        {receivables.map((r) => (
                          <div key={r.party_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold">{r.party_name}</p>
                              <p className="text-sm text-gray-600">Total: ₹{r.total_amount.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">₹{r.outstanding.toFixed(2)}</p>
                              <p className="text-xs text-gray-600">Outstanding</p>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Total Receivables:</span>
                            <span className="font-bold text-xl text-green-600">
                              ₹{receivables.reduce((sum, r) => sum + r.outstanding, 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payables */}
                <Card className="card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl">Payables (To Pay)</h3>
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    {payables.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No outstanding payables</p>
                    ) : (
                      <div className="space-y-3">
                        {payables.map((p) => (
                          <div key={p.party_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold">{p.party_name}</p>
                              <p className="text-sm text-gray-600">Total: ₹{p.total_amount.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600">₹{p.outstanding.toFixed(2)}</p>
                              <p className="text-xs text-gray-600">Outstanding</p>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Total Payables:</span>
                            <span className="font-bold text-xl text-red-600">
                              ₹{payables.reduce((sum, p) => sum + p.outstanding, 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profit & Loss */}
            <TabsContent value="profitloss">
              <Card className="card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Profit & Loss Statement</h3>
                    <div className="flex gap-2 items-center">
                      <Input type="date" value={dateRange.from_date} onChange={(e) => setDateRange({ ...dateRange, from_date: e.target.value })} className="w-40" />
                      <span>to</span>
                      <Input type="date" value={dateRange.to_date} onChange={(e) => setDateRange({ ...dateRange, to_date: e.target.value })} className="w-40" />
                      <Button onClick={fetchProfitLoss} className="btn-primary">Load</Button>
                    </div>
                  </div>

                  {loading ? (
                    <p className="text-center py-8">Loading...</p>
                  ) : profitLoss ? (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Income */}
                        <div>
                          <h4 className="font-bold text-lg mb-3 text-green-600">Income</h4>
                          <div className="space-y-2">
                            {profitLoss.income_accounts.map((acc, idx) => (
                              <div key={idx} className="flex justify-between p-2 bg-green-50 rounded">
                                <span>{acc.account_name}</span>
                                <span className="font-semibold">₹{acc.amount.toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between p-3 bg-green-100 rounded font-bold">
                              <span>Total Income</span>
                              <span>₹{profitLoss.total_income.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expenses */}
                        <div>
                          <h4 className="font-bold text-lg mb-3 text-red-600">Expenses</h4>
                          <div className="space-y-2">
                            {profitLoss.expense_accounts.map((acc, idx) => (
                              <div key={idx} className="flex justify-between p-2 bg-red-50 rounded">
                                <span>{acc.account_name}</span>
                                <span className="font-semibold">₹{acc.amount.toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between p-3 bg-red-100 rounded font-bold">
                              <span>Total Expenses</span>
                              <span>₹{profitLoss.total_expenses.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="border-t-4 pt-4 space-y-2">
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">Gross Profit:</span>
                          <span className="font-bold">₹{profitLoss.gross_profit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl">
                          <span className="font-bold">Net Profit:</span>
                          <span className={`font-bold ${profitLoss.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{profitLoss.net_profit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">Select date range and click Load to view P&L statement</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stock Report */}
            <TabsContent value="stock">
              <Card className="card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Current Stock Report</h3>
                    <Button onClick={fetchStockReport} className="btn-primary">Refresh</Button>
                  </div>

                  {loading ? (
                    <p className="text-center py-8">Loading...</p>
                  ) : stockReport.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No items in stock</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-3 text-left">Item</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-right">Stock</th>
                            <th className="p-3 text-right">Value</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockReport.map((item, idx) => (
                            <tr key={idx} className={`border-b ${item.alert ? 'bg-red-50' : ''}`}>
                              <td className="p-3">
                                <p className="font-semibold">{item.item_name}</p>
                                <p className="text-xs text-gray-600">Code: {item.item_code}</p>
                              </td>
                              <td className="p-3">{item.category}</td>
                              <td className="p-3 text-right">{item.current_stock} {item.unit}</td>
                              <td className="p-3 text-right font-semibold">₹{item.stock_value.toFixed(2)}</td>
                              <td className="p-3 text-center">
                                {item.alert ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-semibold">Low Stock</span>
                                ) : (
                                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-semibold">OK</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReportsHub;